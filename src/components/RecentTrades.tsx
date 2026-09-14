import React, { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Clock, Filter, ListFilter } from "lucide-react";
import { TradeItem } from "../types";
import { formatLots, formatPrice } from "../utils/formatters";

interface RecentTradesProps {
  trades: TradeItem[];
}

export const RecentTrades: React.FC<RecentTradesProps> = ({ trades }) => {
  const [filterType, setFilterType] = useState<"ALL" | "BUY" | "SELL" | "BIG">("ALL");

  const filteredTrades = trades.filter((t) => {
    if (filterType === "BUY") return t.type === "ALIS";
    if (filterType === "SELL") return t.type === "SATIS";
    if (filterType === "BIG") return t.lot >= 1000;
    return true;
  });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col overflow-hidden select-none">
      {/* Header & Filter options */}
      <div className="px-3.5 py-2.5 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-zinc-50">
          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="uppercase tracking-wider">Son İşlemler (Time & Sales)</span>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1">
          {[
            { id: "ALL", label: "Tümü" },
            { id: "BUY", label: "Alış" },
            { id: "SELL", label: "Satış" },
            { id: "BIG", label: ">1K Lot" },
          ].map((f) => (
            <button
              key={f.id}
              id={`trades-filter-${f.id}`}
              onClick={() => setFilterType(f.id as any)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                filterType === f.id
                  ? "bg-blue-600 text-white font-semibold shadow-xs"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trades Table */}
      <div className="overflow-y-auto max-h-56 divide-y divide-gray-100 dark:divide-zinc-800/80">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-gray-50/80 dark:bg-zinc-800/80 text-[10px] font-semibold text-gray-400 dark:text-zinc-400 uppercase tracking-wider sticky top-0">
            <tr>
              <th className="py-2 px-3">Saat</th>
              <th className="py-2 px-2 text-right">Fiyat</th>
              <th className="py-2 px-2 text-right">Lot</th>
              <th className="py-2 px-2 text-right hidden sm:table-cell">Tutar</th>
              <th className="py-2 px-3 text-center">Yön</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 font-mono">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400 text-xs">
                  Filtreye uygun işlem bulunamadı.
                </td>
              </tr>
            ) : (
              filteredTrades.map((trade) => {
                const isBuy = trade.type === "ALIS";
                return (
                  <tr
                    key={trade.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-1.5 px-3 text-[11px] text-gray-500 dark:text-zinc-400">
                      {trade.time}
                    </td>
                    <td
                      className={`py-1.5 px-2 text-right font-bold text-xs ${
                        isBuy ? "text-green-600 dark:text-emerald-400" : "text-red-500 dark:text-rose-400"
                      }`}
                    >
                      {formatPrice(trade.price)}
                    </td>
                    <td className="py-1.5 px-2 text-right font-bold text-gray-900 dark:text-zinc-100 text-xs">
                      {formatLots(trade.lot)}
                    </td>
                    <td className="py-1.5 px-2 text-right text-[11px] text-gray-400 hidden sm:table-cell">
                      {formatPrice(trade.amount)} TL
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isBuy
                            ? "bg-green-50 text-green-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-green-200 dark:border-emerald-800/60"
                            : "bg-red-50 text-red-700 dark:bg-rose-950/50 dark:text-rose-400 border border-red-200 dark:border-rose-800/60"
                        }`}
                      >
                        {isBuy ? (
                          <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />
                        )}
                        {trade.type}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
