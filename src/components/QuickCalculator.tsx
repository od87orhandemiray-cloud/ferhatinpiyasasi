import React, { useState } from "react";
import { Calculator, Percent, TrendingUp, X } from "lucide-react";
import { StockDepthData } from "../types";
import { formatLots, formatPrice } from "../utils/formatters";

interface QuickCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  depth: StockDepthData | null;
}

export const QuickCalculator: React.FC<QuickCalculatorProps> = ({
  isOpen,
  onClose,
  depth,
}) => {
  if (!isOpen || !depth) return null;

  const currentPrice = depth.lastPrice;
  const [buyPrice, setBuyPrice] = useState<number>(currentPrice);
  const [targetSellPrice, setTargetSellPrice] = useState<number>(
    parseFloat((currentPrice * 1.03).toFixed(2))
  );
  const [lotCount, setLotCount] = useState<number>(1000);
  const [commissionRate, setCommissionRate] = useState<number>(0.0002); // On binde 2

  const totalBuyCost = buyPrice * lotCount;
  const totalSellRevenue = targetSellPrice * lotCount;
  const buyCommission = totalBuyCost * commissionRate;
  const sellCommission = totalSellRevenue * commissionRate;
  const totalCommission = buyCommission + sellCommission;

  const netProfit = totalSellRevenue - totalBuyCost - totalCommission;
  const netProfitPercent = totalBuyCost > 0 ? (netProfit / totalBuyCost) * 100 : 0;
  const breakevenPrice = parseFloat(
    ((totalBuyCost + buyCommission) / (lotCount * (1 - commissionRate))).toFixed(2)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in select-none">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-5 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-50">
                Kademe Kar/Zarar & Maliyet Hesaplayıcı
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-mono">
                {depth.symbol} • Anlık Fiyat: {formatPrice(currentPrice)} TL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-3 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Alış Fiyatı (TL)
              </label>
              <input
                type="number"
                step={depth.tick}
                value={buyPrice}
                onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Hedef Satış Fiyatı (TL)
              </label>
              <input
                type="number"
                step={depth.tick}
                value={targetSellPrice}
                onChange={(e) => setTargetSellPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Lot Adedi
            </label>
            <input
              type="number"
              min={1}
              step={100}
              value={lotCount}
              onChange={(e) => setLotCount(parseInt(e.target.value, 10) || 1)}
              className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Kademe Hedef Hızlı Butonları */}
          <div>
            <span className="block text-[10px] text-gray-500 dark:text-zinc-400 mb-1 font-medium">
              Hedef Kademe Hızlı Seçimi:
            </span>
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {depth.asks.map((a) => (
                <button
                  key={a.level}
                  type="button"
                  onClick={() => setTargetSellPrice(a.price)}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 dark:border-zinc-700 cursor-pointer"
                >
                  Satış K{a.level}: {formatPrice(a.price)}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-gray-500 dark:text-zinc-400">
              <span>Alış Yatırımı:</span>
              <span className="font-semibold text-gray-900 dark:text-zinc-100">
                {formatPrice(totalBuyCost)} TL
              </span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-zinc-400">
              <span>Satış Tutarı:</span>
              <span className="font-semibold text-gray-900 dark:text-zinc-100">
                {formatPrice(totalSellRevenue)} TL
              </span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-zinc-400 text-[11px]">
              <span>Toplam Komisyon (Alış+Satış):</span>
              <span>{formatPrice(totalCommission)} TL</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-zinc-400 text-[11px]">
              <span>Başabaş Fiyatı:</span>
              <span className="font-semibold text-gray-700 dark:text-zinc-300">
                {formatPrice(breakevenPrice)} TL
              </span>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 flex justify-between items-baseline font-bold text-sm">
              <span className="text-gray-900 dark:text-zinc-100">Net Kar / Zarar:</span>
              <div className="text-right">
                <span className={netProfit >= 0 ? "text-green-600 dark:text-emerald-400" : "text-red-500 dark:text-rose-400"}>
                  {netProfit >= 0 ? "+" : ""}{formatPrice(netProfit)} TL
                </span>
                <span
                  className={`text-xs ml-1.5 px-1.5 py-0.5 rounded font-normal ${
                    netProfit >= 0 ? "bg-green-50 text-green-700 border border-green-200 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-red-50 text-red-700 border border-red-200 dark:bg-rose-950/50 dark:text-rose-400"
                  }`}
                >
                  %{netProfitPercent.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
