import React from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart2,
  BellPlus,
  Compass,
  Layers,
  Scale,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { StockDepthData } from "../types";
import { formatLots, formatPercentage, formatPrice } from "../utils/formatters";

interface FiveLevelDepthTableProps {
  depth: StockDepthData | null;
  onSetAlarmForPrice?: (price: number) => void;
  onTestOrderAtLevel?: (side: "ALIS" | "SATIS", price: number, level: number) => void;
}

export const FiveLevelDepthTable: React.FC<FiveLevelDepthTableProps> = ({
  depth,
  onSetAlarmForPrice,
  onTestOrderAtLevel,
}) => {
  if (!depth) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400">
        <Layers className="w-8 h-8 mb-2 animate-pulse text-emerald-500" />
        <span className="text-sm font-medium">5 Kademe Derinlik Verisi Yükleniyor...</span>
      </div>
    );
  }

  // Find max lot across all 10 levels for proportional bar width calculation
  const maxBidLot = Math.max(...depth.bids.map((b) => b.lot), 1);
  const maxAskLot = Math.max(...depth.asks.map((a) => a.lot), 1);
  const maxLot = Math.max(maxBidLot, maxAskLot);

  const netLotDiff = depth.totalBidLots - depth.totalAskLots;
  const isBuyerDominant = depth.bidRatio >= 50;

  // Price position in Tavan/Taban range
  const priceRange = depth.tavan - depth.taban;
  const pricePositionPercent = priceRange > 0
    ? Math.min(100, Math.max(0, ((depth.lastPrice - depth.taban) / priceRange) * 100))
    : 50;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col overflow-hidden select-none">
      {/* Table Header / Title & Imbalance */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-zinc-50 flex items-center gap-1.5">
              5 KADEME DERİNLİK TABLOSU
              <span className="text-[10px] font-mono font-normal text-gray-400">
                (Kademe Adımı: {depth.tick} TL)
              </span>
            </h2>
          </div>
        </div>

        {/* Imbalance Tag */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-gray-400 text-[11px]">Denge Oranı:</span>
            <span
              className={`font-semibold font-mono px-2 py-0.5 rounded text-[11px] ${
                isBuyerDominant
                  ? "bg-green-50 text-green-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-green-200 dark:border-emerald-800/60"
                  : "bg-red-50 text-red-700 dark:bg-rose-950/50 dark:text-rose-400 border border-red-200 dark:border-rose-800/60"
              }`}
            >
              {isBuyerDominant ? "Alıcı %" + depth.bidRatio : "Satıcı %" + depth.askRatio}
            </span>
          </div>
        </div>
      </div>

      {/* Dual Bids vs Asks Header Strip */}
      <div className="grid grid-cols-2 bg-gray-50 dark:bg-zinc-800/70 border-b border-gray-200 dark:border-zinc-800">
        <div className="p-2.5 text-center border-r border-gray-200 dark:border-zinc-800 font-bold text-xs text-green-700 dark:text-emerald-400 tracking-wide">
          ALIŞ (BIDS)
        </div>
        <div className="p-2.5 text-center font-bold text-xs text-red-700 dark:text-rose-400 tracking-wide">
          SATIŞ (ASKS)
        </div>
      </div>

      {/* Main 5-Level Dual Order Book Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 text-gray-400 uppercase tracking-wider text-[10px] font-semibold">
              {/* Alış (Bids) Header */}
              <th className="py-2 px-2 text-center w-8 text-gray-400 border-r border-gray-200 dark:border-zinc-800">
                Kad.
              </th>
              <th className="py-2 px-2 text-left w-14 text-green-700 dark:text-emerald-400">
                Emir
              </th>
              <th className="py-2 px-3 text-right text-green-700 dark:text-emerald-400">
                Alış Lot
              </th>
              <th className="py-2 px-3 text-right text-green-800 dark:text-emerald-300 font-bold border-r-2 border-gray-300 dark:border-zinc-700 bg-green-50/40 dark:bg-emerald-950/20">
                Alış (TL)
              </th>

              {/* Satış (Asks) Header */}
              <th className="py-2 px-3 text-left text-red-800 dark:text-rose-300 font-bold bg-red-50/40 dark:bg-rose-950/20">
                Satış (TL)
              </th>
              <th className="py-2 px-3 text-left text-red-700 dark:text-rose-400">
                Satış Lot
              </th>
              <th className="py-2 px-2 text-right w-14 text-red-700 dark:text-rose-400 border-r border-gray-200 dark:border-zinc-800">
                Emir
              </th>
              <th className="py-2 px-2 text-center w-8 text-gray-400">
                Kad.
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/70 font-mono">
            {[0, 1, 2, 3, 4].map((idx) => {
              const bid = depth.bids[idx];
              const ask = depth.asks[idx];

              const bidBarWidth = bid ? (bid.lot / maxLot) * 100 : 0;
              const askBarWidth = ask ? (ask.lot / maxLot) * 100 : 0;

              return (
                <tr
                  key={`depth-row-${idx + 1}`}
                  id={`depth-row-${idx + 1}`}
                  className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/50 transition-colors group"
                >
                  {/* Bid Level */}
                  <td className="py-2.5 px-2 text-center text-gray-400 text-[11px] font-sans font-medium border-r border-gray-200 dark:border-zinc-800">
                    {idx + 1}
                  </td>

                  {/* Bid Orders */}
                  <td className="py-2.5 px-2 text-left text-gray-500 dark:text-zinc-400 text-[11px]">
                    {bid?.orders || 0}
                  </td>

                  {/* Bid Lot + Depth Bar Fill */}
                  <td className="py-2.5 px-3 text-right relative overflow-hidden">
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-green-500/15 dark:bg-emerald-500/20 transition-all duration-300 pointer-events-none"
                      style={{ width: `${bidBarWidth}%` }}
                    />
                    <span className="relative z-10 font-bold text-gray-900 dark:text-zinc-100 text-xs">
                      {formatLots(bid?.lot)}
                    </span>
                  </td>

                  {/* Bid Price */}
                  <td
                    className="py-2.5 px-3 text-right font-bold text-green-700 dark:text-emerald-400 border-r-2 border-gray-300 dark:border-zinc-700 bg-green-50/30 dark:bg-emerald-950/20 cursor-pointer hover:bg-green-100/50 transition-colors"
                    onClick={() => onSetAlarmForPrice && bid && onSetAlarmForPrice(bid.price)}
                    title="Alış Fiyatına Alarm Kur / Detay Gör"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{formatPrice(bid?.price)}</span>
                      <BellPlus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-green-600 transition-opacity" />
                    </div>
                  </td>

                  {/* Ask Price */}
                  <td
                    className="py-2.5 px-3 text-left font-bold text-red-600 dark:text-rose-400 bg-red-50/30 dark:bg-rose-950/20 cursor-pointer hover:bg-red-100/50 transition-colors"
                    onClick={() => onSetAlarmForPrice && ask && onSetAlarmForPrice(ask.price)}
                    title="Satış Fiyatına Alarm Kur / Detay Gör"
                  >
                    <div className="flex items-center justify-start gap-1">
                      <span>{formatPrice(ask?.price)}</span>
                      <BellPlus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-red-600 transition-opacity" />
                    </div>
                  </td>

                  {/* Ask Lot + Depth Bar Fill */}
                  <td className="py-2.5 px-3 text-left relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-red-500/15 dark:bg-rose-500/20 transition-all duration-300 pointer-events-none"
                      style={{ width: `${askBarWidth}%` }}
                    />
                    <span className="relative z-10 font-bold text-gray-900 dark:text-zinc-100 text-xs">
                      {formatLots(ask?.lot)}
                    </span>
                  </td>

                  {/* Ask Orders */}
                  <td className="py-2.5 px-2 text-right text-gray-500 dark:text-zinc-400 text-[11px] border-r border-gray-200 dark:border-zinc-800">
                    {ask?.orders || 0}
                  </td>

                  {/* Ask Level */}
                  <td className="py-2.5 px-2 text-center text-gray-400 text-[11px] font-sans font-medium">
                    {idx + 1}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Clean Minimalism 3-Part Totals Bar */}
      <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/50 flex flex-wrap justify-around items-center text-xs font-semibold border-t border-gray-200 dark:border-zinc-800 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 uppercase text-[10px] tracking-wider">TOPLAM ALIŞ:</span>
          <span className="text-green-600 dark:text-emerald-400 font-bold font-mono text-sm">
            {formatLots(depth.totalBidLots)}
          </span>
          <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
            ({formatPrice(depth.totalBidAmount)} TL)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 uppercase text-[10px] tracking-wider">TOPLAM SATIŞ:</span>
          <span className="text-red-600 dark:text-rose-400 font-bold font-mono text-sm">
            {formatLots(depth.totalAskLots)}
          </span>
          <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
            ({formatPrice(depth.totalAskAmount)} TL)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 uppercase text-[10px] tracking-wider">DENGE:</span>
          <span className={`font-bold font-mono text-sm ${netLotDiff >= 0 ? "text-blue-700 dark:text-blue-400" : "text-red-600 dark:text-rose-400"}`}>
            {netLotDiff > 0 ? "+" : ""}{formatLots(netLotDiff)}
          </span>
        </div>
      </div>

      {/* Visual Imbalance Bar Meter */}
      <div className="px-4 py-2.5 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
        <div className="flex justify-between items-center text-[11px] font-mono mb-1">
          <div className="flex items-center gap-1 text-green-600 dark:text-emerald-400 font-bold">
            <span>Alıcılar: %{depth.bidRatio}</span>
          </div>
          <div className="flex items-center gap-1 text-red-600 dark:text-rose-400 font-bold">
            <span>Satıcılar: %{depth.askRatio}</span>
          </div>
        </div>

        {/* The Duel Bar */}
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden flex">
          <div
            className="bg-green-500 h-full transition-all duration-500 rounded-l-full"
            style={{ width: `${depth.bidRatio}%` }}
          />
          <div
            className="bg-red-500 h-full transition-all duration-500 rounded-r-full"
            style={{ width: `${depth.askRatio}%` }}
          />
        </div>
      </div>

      {/* Key Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-gray-50/70 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 text-xs">
        {/* Spread */}
        <div className="p-2 rounded-lg bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80">
          <div className="text-[10px] text-gray-400 uppercase font-medium">Spread (Makas)</div>
          <div className="font-mono font-bold text-gray-900 dark:text-zinc-100 flex items-center justify-between mt-0.5">
            <span>{formatPrice(depth.spread)} TL</span>
            <span className="text-[10px] text-gray-400 font-normal">%{depth.spreadPercent}</span>
          </div>
        </div>

        {/* AOF */}
        <div className="p-2 rounded-lg bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80">
          <div className="text-[10px] text-gray-400 uppercase font-medium">Ağ. Ort. Fiyat (AOF)</div>
          <div className="font-mono font-bold text-gray-900 dark:text-zinc-100 mt-0.5">
            {formatPrice(depth.aof)} TL
          </div>
        </div>

        {/* Tavan (Ceiling) */}
        <div className="p-2 rounded-lg bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80">
          <div className="text-[10px] text-green-600 dark:text-emerald-400 uppercase font-medium flex items-center gap-1">
            <ArrowUp className="w-3 h-3" /> Tavan (+%10)
          </div>
          <div className="font-mono font-bold text-green-600 dark:text-emerald-400 mt-0.5">
            {formatPrice(depth.tavan)} TL
          </div>
        </div>

        {/* Taban (Floor) */}
        <div className="p-2 rounded-lg bg-white dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80">
          <div className="text-[10px] text-red-600 dark:text-rose-400 uppercase font-medium flex items-center gap-1">
            <ArrowDown className="w-3 h-3" /> Taban (-%10)
          </div>
          <div className="font-mono font-bold text-red-600 dark:text-rose-400 mt-0.5">
            {formatPrice(depth.taban)} TL
          </div>
        </div>
      </div>
    </div>
  );
};
