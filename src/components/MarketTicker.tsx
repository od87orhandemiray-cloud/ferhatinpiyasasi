import React from "react";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { formatPercentage, formatPrice } from "../utils/formatters";

interface IndexData {
  code: string;
  name: string;
  last: number;
  change: number;
  high?: number;
  low?: number;
}

interface MarketTickerProps {
  indices: IndexData[];
  onSelectIndex?: (code: string) => void;
}

export const MarketTicker: React.FC<MarketTickerProps> = ({ indices }) => {
  const defaultIndices: IndexData[] = [
    { code: "XU100", name: "BIST 100", last: 9854.20, change: 1.15 },
    { code: "XU030", name: "BIST 30", last: 10720.80, change: 1.32 },
    { code: "XBANK", name: "BIST BANKA", last: 13420.50, change: 2.05 },
    { code: "XUSIN", name: "BIST SINAİ", last: 14120.30, change: 0.74 },
    { code: "USDTRY", name: "USD/TRY", last: 36.42, change: 0.08 },
    { code: "EURTRY", name: "EUR/TRY", last: 38.15, change: 0.12 },
    { code: "GAU", name: "GRAM ALTIN", last: 2940.50, change: 0.45 },
    { code: "BRENT", name: "BRENT PETROL", last: 74.80, change: -0.65 },
  ];

  const displayList = indices && indices.length > 0 ? indices : defaultIndices;

  return (
    <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto no-scrollbar py-1.5 px-4 text-xs select-none shadow-2xs">
      <div className="flex items-center gap-3 min-w-max">
        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>PİYASA:</span>
        </div>

        {displayList.map((idx) => {
          const isUp = idx.change >= 0;
          return (
            <div
              key={idx.code}
              id={`ticker-item-${idx.code}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/60 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="font-bold text-gray-800 dark:text-zinc-200 text-[11px]">
                {idx.code}
              </span>
              <span className="font-mono text-gray-900 dark:text-zinc-100 font-semibold text-[11px]">
                {formatPrice(idx.last)}
              </span>
              <span
                className={`flex items-center text-[11px] font-bold font-mono ${
                  isUp
                    ? "text-green-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-rose-400"
                }`}
              >
                {isUp ? (
                  <ArrowUpRight className="w-3 h-3 inline mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 inline mr-0.5" />
                )}
                {formatPercentage(idx.change)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
