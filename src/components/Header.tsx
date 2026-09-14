import React from "react";
import {
  Activity,
  Bell,
  CheckCircle2,
  Clock,
  Maximize2,
  Minimize2,
  Moon,
  RefreshCw,
  Sun,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  refreshInterval: number;
  setRefreshInterval: (ms: number) => void;
  lastUpdated: Date | null;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  ping: number;
  isLiveSimulation: boolean;
  setIsLiveSimulation: (val: boolean) => void;
  onOpenAlerts: () => void;
  alertCount: number;
  compactMode: boolean;
  setCompactMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  soundEnabled,
  setSoundEnabled,
  refreshInterval,
  setRefreshInterval,
  lastUpdated,
  onManualRefresh,
  isRefreshing,
  ping,
  isLiveSimulation,
  setIsLiveSimulation,
  onOpenAlerts,
  alertCount,
  compactMode,
  setCompactMode,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <header className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 sm:px-6 py-3 text-gray-900 dark:text-zinc-100 transition-colors select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: App Logo & BIST Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-xs">
              <span>B</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-zinc-50">
                  BIST Depth Monitor
                </h1>
                <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Canlı Borsa İstanbul
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 hidden sm:block">
                Borsa İstanbul 5-Kademe Alıcı-Satıcı Derinlik Terminali
              </p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-zinc-800 text-xs">
            <span className="text-gray-500 dark:text-zinc-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              10:00 - 18:00 (Sürekli İşlem)
            </span>
          </div>
        </div>

        {/* Center: Live Connection Badge & Speed Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Connection Pill */}
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-emerald-950/40 text-green-700 dark:text-emerald-400 rounded-full border border-green-200 dark:border-emerald-800/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold tracking-wide">CANLI BAĞLANTI</span>
            <span className="text-[10px] font-mono text-green-600/80 dark:text-emerald-400/80 hidden md:inline">
              ({ping > 0 ? `${ping}ms` : "0ms"})
            </span>
          </div>

          {/* Refresh interval selector */}
          <div className="flex items-center rounded-lg bg-gray-100 dark:bg-zinc-800 p-0.5 border border-gray-200 dark:border-zinc-700/60 text-xs">
            {[
              { label: "1s", val: 1000 },
              { label: "2s", val: 2000 },
              { label: "5s", val: 5000 },
              { label: "Durdur", val: 0 },
            ].map((item) => (
              <button
                key={item.val}
                id={`refresh-btn-${item.label}`}
                onClick={() => setRefreshInterval(item.val)}
                className={`px-2 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  refreshInterval === item.val
                    ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                    : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Live tick simulation switch */}
          <button
            id="live-tick-sim-toggle"
            onClick={() => setIsLiveSimulation(!isLiveSimulation)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isLiveSimulation
                ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                : "bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200"
            }`}
            title="Anlık simülasyon akış modu"
          >
            <Zap className={`w-3 h-3 ${isLiveSimulation ? "fill-blue-600 text-blue-600 dark:text-blue-400" : ""}`} />
            <span className="hidden sm:inline">Akış {isLiveSimulation ? "Açık" : "Kapalı"}</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            id="manual-refresh-btn"
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 transition-all active:scale-95 cursor-pointer"
            title="Verileri Şimdi Güncelle"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>

        {/* Right: Quick actions (Alerts, Compact, Sound, Theme, Fullscreen) */}
        <div className="flex items-center gap-1.5">
          {/* Alerts button */}
          <button
            id="alerts-modal-btn"
            onClick={onOpenAlerts}
            className="relative p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 transition-colors cursor-pointer"
            title="Kademe & Fiyat Alarmları"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {alertCount}
              </span>
            )}
          </button>

          {/* Compact / Full View */}
          <button
            id="compact-mode-btn"
            onClick={() => setCompactMode(!compactMode)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              compactMode
                ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-semibold"
                : "bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400"
            }`}
            title="Görünüm Modu Değiştir"
          >
            {compactMode ? "Kompakt" : "Geniş"}
          </button>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 transition-colors cursor-pointer"
            title={soundEnabled ? "İşlem Sesleri Açık" : "İşlem Sesleri Kapalı"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
          </button>

          {/* Dark / Light Mode */}
          <button
            id="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 transition-colors cursor-pointer"
            title="Tema Değiştir (Aydınlık / Karanlık)"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
          </button>

          {/* Fullscreen */}
          <button
            id="fullscreen-toggle-btn"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 transition-colors cursor-pointer"
            title="Tam Ekran"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
