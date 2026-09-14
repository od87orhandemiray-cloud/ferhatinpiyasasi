import React from "react";
import { ArrowDown, ArrowUp, Briefcase, DollarSign, PieChart } from "lucide-react";
import { BrokerItem } from "../types";
import { formatLots } from "../utils/formatters";

interface BrokerDistributionProps {
  brokers: BrokerItem[];
}

export const BrokerDistribution: React.FC<BrokerDistributionProps> = ({ brokers }) => {
  const buyers = brokers.filter((b) => b.type === "buyer");
  const sellers = brokers.filter((b) => b.type === "seller");

  const totalBuyLot = buyers.reduce((sum, b) => sum + b.netLot, 0);
  const totalSellLot = sellers.reduce((sum, b) => sum + Math.abs(b.netLot), 0);
  const netDifference = totalBuyLot - totalSellLot;
  const isNetInflow = netDifference >= 0;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-zinc-50">
          <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="uppercase tracking-wider">Aracı Kurum Dağılımı (AKD - İlk 5)</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <span className="text-gray-400">Net Akış:</span>
          <span
            className={`font-bold ${
              isNetInflow
                ? "text-green-600 dark:text-emerald-400"
                : "text-red-500 dark:text-rose-400"
            }`}
          >
            {isNetInflow ? "+" : ""}{formatLots(netDifference)} Lot
          </span>
        </div>
      </div>

      {/* Two columns: Buyers vs Sellers */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-zinc-800 text-xs">
        {/* Buyers Table */}
        <div className="p-3">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-zinc-800 text-[11px] font-bold text-green-700 dark:text-emerald-400">
            <span className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3" /> En Çok Alanlar
            </span>
            <span className="font-mono text-gray-400 font-normal">Toplam: {formatLots(totalBuyLot)}</span>
          </div>

          <div className="space-y-2">
            {buyers.map((b, i) => (
              <div key={b.name} className="flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5 font-sans font-medium text-gray-800 dark:text-zinc-200 w-32 truncate">
                  <span className="text-gray-400 text-[10px]">{i + 1}.</span>
                  <span>{b.name}</span>
                </div>
                <div className="flex-1 mx-2">
                  <div className="h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${b.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600 dark:text-emerald-400">
                    +{formatLots(b.netLot)}
                  </span>
                  <span className="text-gray-400 text-[10px] ml-1">%{b.percentage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sellers Table */}
        <div className="p-3">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-zinc-800 text-[11px] font-bold text-red-700 dark:text-rose-400">
            <span className="flex items-center gap-1">
              <ArrowDown className="w-3 h-3" /> En Çok Satanlar
            </span>
            <span className="font-mono text-gray-400 font-normal">Toplam: {formatLots(totalSellLot)}</span>
          </div>

          <div className="space-y-2">
            {sellers.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5 font-sans font-medium text-gray-800 dark:text-zinc-200 w-32 truncate">
                  <span className="text-gray-400 text-[10px]">{i + 1}.</span>
                  <span>{s.name}</span>
                </div>
                <div className="flex-1 mx-2">
                  <div className="h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-red-500 dark:text-rose-400">
                    {formatLots(s.netLot)}
                  </span>
                  <span className="text-gray-400 text-[10px] ml-1">%{s.percentage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
