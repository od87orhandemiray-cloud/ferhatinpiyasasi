import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "./components/Header";
import { MarketTicker } from "./components/MarketTicker";
import { Watchlist } from "./components/Watchlist";
import { StockHeaderCard } from "./components/StockHeaderCard";
import { FiveLevelDepthTable } from "./components/FiveLevelDepthTable";
import { DepthChart } from "./components/DepthChart";
import { RecentTrades } from "./components/RecentTrades";
import { BrokerDistribution } from "./components/BrokerDistribution";
import { OrderSimulatorModal } from "./components/OrderSimulatorModal";
import { AlertsModal } from "./components/AlertsModal";
import { QuickCalculator } from "./components/QuickCalculator";
import { PriceAlert, StockDepthData, StockSummary, MarketIndex } from "./types";
import { soundFx } from "./utils/audio";

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(2000);
  const [isLiveSimulation, setIsLiveSimulation] = useState<boolean>(true);
  const [compactMode, setCompactMode] = useState<boolean>(false);

  const [selectedSymbol, setSelectedSymbol] = useState<string>("THYAO");
  const [stocks, setStocks] = useState<StockSummary[]>([]);
  const [depthData, setDepthData] = useState<StockDepthData | null>(null);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [ping, setPing] = useState<number>(38);

  // Modals
  const [isOrderSimOpen, setIsOrderSimOpen] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isCalcOpen, setIsCalcOpen] = useState<boolean>(false);

  // Favorites & Alarms with local storage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("bist_favorites");
      return saved ? JSON.parse(saved) : ["THYAO", "ASELS", "GARAN", "EREGL", "TUPRS"];
    } catch {
      return ["THYAO", "ASELS", "GARAN", "EREGL", "TUPRS"];
    }
  });

  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem("bist_alerts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const lastPriceRef = useRef<number>(0);

  // Toggle favorite
  const handleToggleFavorite = (sym: string) => {
    const next = favorites.includes(sym)
      ? favorites.filter((f) => f !== sym)
      : [...favorites, sym];
    setFavorites(next);
    localStorage.setItem("bist_favorites", JSON.stringify(next));
  };

  // Sound sync
  useEffect(() => {
    soundFx.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Dark mode sync with HTML class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Fetch stocks list
  const fetchStocksList = useCallback(async () => {
    try {
      const res = await fetch("/api/stocks");
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setStocks(json.data);
      }
    } catch (e) {
      console.error("Failed to load stocks:", e);
    }
  }, []);

  // Fetch indices
  const fetchIndices = useCallback(async () => {
    try {
      const res = await fetch("/api/indices");
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setIndices(json.data);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Fetch depth for selected stock
  const fetchStockDepth = useCallback(async (symbol: string) => {
    const startTime = performance.now();
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/stock/${encodeURIComponent(symbol)}`);
      const elapsed = Math.round(performance.now() - startTime);
      setPing(elapsed);

      const json = await res.json();
      if (json.success && json.depth) {
        setDepthData(json.depth);
        setLastUpdated(new Date());

        // Check if price ticked
        const newPrice = json.depth.lastPrice;
        if (lastPriceRef.current && lastPriceRef.current !== newPrice) {
          soundFx.playTick(newPrice > lastPriceRef.current);
        }
        lastPriceRef.current = newPrice;

        // Check alerts
        checkAlerts(symbol, json.depth);
      }
    } catch (err) {
      console.error(`Error loading depth for ${symbol}:`, err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Check alerts against current depth
  const checkAlerts = (symbol: string, depth: StockDepthData) => {
    alerts.forEach((alert) => {
      if (!alert.active || alert.symbol !== symbol) return;

      let triggered = false;
      if (alert.condition === "ABOVE" && depth.lastPrice >= alert.targetPrice) {
        triggered = true;
      } else if (alert.condition === "BELOW" && depth.lastPrice <= alert.targetPrice) {
        triggered = true;
      } else if (
        alert.condition === "LOT_ABOVE" &&
        alert.lotThreshold &&
        (depth.bids[0]?.lot >= alert.lotThreshold || depth.asks[0]?.lot >= alert.lotThreshold)
      ) {
        triggered = true;
      }

      if (triggered) {
        soundFx.playAlarm();
      }
    });
  };

  // Initial load & periodic background stock list / indices update
  useEffect(() => {
    fetchStocksList();
    fetchIndices();

    const bgInterval = setInterval(() => {
      fetchStocksList();
      fetchIndices();
    }, 10000);

    return () => clearInterval(bgInterval);
  }, [fetchStocksList, fetchIndices]);

  // Load depth when selected symbol changes
  useEffect(() => {
    fetchStockDepth(selectedSymbol);
  }, [selectedSymbol, fetchStockDepth]);

  // Periodic refresh loop for selected stock depth
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchStockDepth(selectedSymbol);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, selectedSymbol, fetchStockDepth]);

  // Live order book dynamic micro-movement
  useEffect(() => {
    if (!isLiveSimulation) return;

    const simInterval = setInterval(() => {
      setDepthData((prev) => {
        if (!prev) return prev;
        // Keep the exact actual price, slightly animate the order queue lots for real-time order matching visual feel
        const newBids = prev.bids.map((b) => ({
          ...b,
          lot: Math.max(100, b.lot + Math.floor((Math.random() - 0.49) * (b.lot * 0.04))),
        }));

        const newAsks = prev.asks.map((a) => ({
          ...a,
          lot: Math.max(100, a.lot + Math.floor((Math.random() - 0.49) * (a.lot * 0.04))),
        }));

        return {
          ...prev,
          bids: newBids,
          asks: newAsks,
        };
      });
    }, 1500);

    return () => clearInterval(simInterval);
  }, [isLiveSimulation]);

  // Manual refresh all
  const handleManualRefreshAll = useCallback(async () => {
    await Promise.all([
      fetchStockDepth(selectedSymbol),
      fetchStocksList(),
      fetchIndices(),
    ]);
  }, [fetchStockDepth, selectedSymbol, fetchStocksList, fetchIndices]);

  // Add alert handler
  const handleAddAlert = (newAlertData: Omit<PriceAlert, "id" | "createdAt">) => {
    const alert: PriceAlert = {
      ...newAlertData,
      id: `alert-${Date.now()}`,
      createdAt: Date.now(),
    };
    const next = [...alerts, alert];
    setAlerts(next);
    localStorage.setItem("bist_alerts", JSON.stringify(next));
  };

  const handleRemoveAlert = (id: string) => {
    const next = alerts.filter((a) => a.id !== id);
    setAlerts(next);
    localStorage.setItem("bist_alerts", JSON.stringify(next));
  };

  const handleToggleAlert = (id: string) => {
    const next = alerts.map((a) => (a.id === id ? { ...a, active: !a.active } : a));
    setAlerts(next);
    localStorage.setItem("bist_alerts", JSON.stringify(next));
  };

  // Find selected stock summary
  const selectedStockSummary = stocks.find(
    (s) => (s.kod || s.sembol || "").toUpperCase() === selectedSymbol.toUpperCase()
  ) || null;

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Desktop Bar */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        lastUpdated={lastUpdated}
        onManualRefresh={handleManualRefreshAll}
        isRefreshing={isRefreshing}
        ping={ping}
        isLiveSimulation={isLiveSimulation}
        setIsLiveSimulation={setIsLiveSimulation}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        alertCount={alerts.filter((a) => a.active).length}
        compactMode={compactMode}
        setCompactMode={setCompactMode}
      />

      {/* Indices Bar */}
      <MarketTicker indices={indices} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Stock Watchlist & Search */}
        <Watchlist
          stocks={stocks}
          selectedSymbol={selectedSymbol}
          onSelectStock={(sym) => setSelectedSymbol(sym)}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Right / Center Main Trading Terminal Area */}
        <main className="flex-1 p-3 lg:p-4 overflow-y-auto space-y-3 lg:space-y-4">
          {/* Active Stock Summary Card */}
          <StockHeaderCard
            stock={selectedStockSummary}
            depth={depthData}
            onOpenOrderSimulator={() => setIsOrderSimOpen(true)}
            onOpenCalculator={() => setIsCalcOpen(true)}
            onOpenAlert={() => setIsAlertsOpen(true)}
          />

          {/* Dual Panel Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 lg:gap-4">
            {/* Core 5-Kademe Derinlik Tablosu (Centerpiece) */}
            <div className={compactMode ? "xl:col-span-12" : "xl:col-span-7"}>
              <FiveLevelDepthTable
                depth={depthData}
                onSetAlarmForPrice={(p) => {
                  handleAddAlert({
                    symbol: selectedSymbol,
                    targetPrice: p,
                    condition: "ABOVE",
                    active: true,
                  });
                  setIsAlertsOpen(true);
                }}
              />
            </div>

            {/* Right Supporting Panels (Depth Curve, Time & Sales, AKD) */}
            {!compactMode && (
              <div className="xl:col-span-5 space-y-3 lg:space-y-4 flex flex-col">
                {/* Visual Depth Step Chart */}
                <DepthChart depth={depthData} />

                {/* Recent Trades (Time & Sales) */}
                <RecentTrades trades={depthData?.recentTrades || []} />

                {/* Broker Distribution (AKD) */}
                <BrokerDistribution brokers={depthData?.brokers || []} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <OrderSimulatorModal
        isOpen={isOrderSimOpen}
        onClose={() => setIsOrderSimOpen(false)}
        depth={depthData}
      />

      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        depth={depthData}
        alerts={alerts}
        onAddAlert={handleAddAlert}
        onRemoveAlert={handleRemoveAlert}
        onToggleAlert={handleToggleAlert}
      />

      <QuickCalculator
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        depth={depthData}
      />
    </div>
  );
}
