import React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Calculator,
  Compass,
  DollarSign,
  ExternalLink,
  Layers,
  PlusCircle,
  Share2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { StockDepthData, StockSummary } from "../types";
import { formatCompactNumber, formatLots, formatPercentage, formatPrice } from "../utils/formatters";

interface StockHeaderCardProps {
  stock: StockSummary | null;
  depth: StockDepthData | null;
  onOpenOrderSimulator: () => void;
  onOpenCalculator: () => void;
  onOpenAlert: () => void;
}

export const StockHeaderCard: React.FC<StockHeaderCardProps> = ({
  stock,
  depth,
  onOpenOrderSimulator,
  onOpenCalculator,
  onOpenAlert,
}) => {
  const sym = (stock?.kod || stock?.sembol || depth?.symbol || "THYAO").toUpperCase();
  const name = stock?.ad || `${sym} Pay Senedi`;
  const lastPrice = depth?.lastPrice || parseFloat(String(stock?.kapanis || stock?.alis || 0)) || 0;
  const change = typeof stock?.yuzdedegisim === "number" ? stock.yuzdedegisim : parseFloat(String(stock?.yuzdedegisim || 0));
  const isUp = change >= 0;

  const prevClose = parseFloat(String(stock?.dunkukapanis || (lastPrice * 0.98))) || (lastPrice * 0.98);
  const diffPrice = lastPrice - prevClose;
  const highPrice = parseFloat(String(stock?.yuksek || (lastPrice * 1.02))) || (lastPrice * 1.02);
  const lowPrice = parseFloat(String(stock?.dusuk || (lastPrice * 0.97))) || (lastPrice * 0.97);
  const openPrice = parseFloat(String(stock?.acilis || prevClose)) || prevClose;
  const volumeLot = stock?.hacim || "12.4 Mn";
  const volumeTL = stock?.hacimtl || "3.6 Mrd TL";

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 shadow-xs select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Symbol & Big Price Display */}
        <div className="flex flex-wrap items-end justify-between md:justify-start gap-4 sm:gap-6 flex-1">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight">
                {sym}
              </h3>
              <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                BIST YILDIZ
              </span>
              <a
                href={`https://bigpara.hurriyet.com.tr/borsa/hisse-fiyatlari/${sym.toLowerCase()}-detay/`}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                title="Bigpara'da Görüntüle"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
              {name}
            </p>
          </div>

          <div className="h-10 w-px bg-gray-200 dark:border-zinc-800 hidden sm:block self-center" />

          {/* Big Live Price & Delta */}
          <div className="flex flex-col items-start md:items-end">
            <div className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">
              {formatPrice(lastPrice)}
              <span className="text-sm font-normal text-gray-400 ml-1">TL</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`text-base sm:text-lg font-bold font-mono flex items-center ${
                  isUp
                    ? "text-green-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-rose-400"
                }`}
              >
                {isUp ? "▲" : "▼"} {diffPrice > 0 ? "+" : ""}{formatPrice(diffPrice)} ({formatPercentage(change)})
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Tools */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-zinc-800">
          <button
            id="order-sim-btn"
            onClick={onOpenOrderSimulator}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Kademeye Emir Gir</span>
          </button>

          <button
            id="calc-open-btn"
            onClick={onOpenCalculator}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-medium border border-gray-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-gray-500" />
            <span>Hesaplayıcı</span>
          </button>

          <button
            id="alert-open-btn"
            onClick={onOpenAlert}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-medium border border-gray-200 dark:border-zinc-700 transition-colors cursor-pointer"
            title="Alarm Kur"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Alarm</span>
          </button>
        </div>
      </div>

      {/* Intraday Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4 pt-3.5 border-t border-gray-100 dark:border-zinc-800 text-xs font-mono">
        <div>
          <div className="text-[10px] text-gray-400 font-sans font-medium uppercase">En Düşük</div>
          <div className="font-bold text-red-500 dark:text-rose-400">{formatPrice(lowPrice)} TL</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 font-sans font-medium uppercase">En Yüksek</div>
          <div className="font-bold text-green-600 dark:text-emerald-400">{formatPrice(highPrice)} TL</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 font-sans font-medium uppercase">Açılış</div>
          <div className="font-bold text-gray-800 dark:text-zinc-200">{formatPrice(openPrice)} TL</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 font-sans font-medium uppercase">Önceki Kapanış</div>
          <div className="font-bold text-gray-800 dark:text-zinc-200">{formatPrice(prevClose)} TL</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 font-sans font-medium uppercase">İşlem Hacmi (Lot)</div>
          <div className="font-bold text-gray-900 dark:text-zinc-100">{volumeLot}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 font-sans font-medium uppercase">İşlem Hacmi (TL)</div>
          <div className="font-bold text-blue-600 dark:text-blue-400">{volumeTL}</div>
        </div>
      </div>
    </div>
  );
};
