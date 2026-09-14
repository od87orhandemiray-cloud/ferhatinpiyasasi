import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { StockDepthData } from "../types";
import { formatLots, formatPrice } from "../utils/formatters";
import { Activity } from "lucide-react";

interface DepthChartProps {
  depth: StockDepthData | null;
}

export const DepthChart: React.FC<DepthChartProps> = ({ depth }) => {
  if (!depth || !depth.bids.length || !depth.asks.length) {
    return null;
  }

  // Construct cumulative depth series for buyers (descending price, cumulative lot) and sellers (ascending price, cumulative lot)
  // Bids: from lowest bid to best bid (accumulated from best bid down or lowest up)
  const bidsReversed = [...depth.bids].reverse();
  let cumBid = 0;
  const bidPoints = bidsReversed.map((b) => {
    cumBid += b.lot;
    return {
      price: b.price,
      bidLot: cumBid,
      askLot: null,
      type: "ALIS",
      lot: b.lot,
    };
  });

  let cumAsk = 0;
  const askPoints = depth.asks.map((a) => {
    cumAsk += a.lot;
    return {
      price: a.price,
      bidLot: null,
      askLot: cumAsk,
      type: "SATIS",
      lot: a.lot,
    };
  });

  const chartData = [...bidPoints, ...askPoints];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 shadow-xs flex flex-col select-none">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-zinc-50">
          <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="uppercase tracking-wider">Kümülatif Derinlik Eğrisi</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-green-600 dark:text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Alıcı Kademeleri
          </span>
          <span className="flex items-center gap-1.5 text-red-500 dark:text-rose-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Satıcı Kademeleri
          </span>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="bidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="askGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="price"
              tickFormatter={(p) => formatPrice(p)}
              stroke="#9ca3af"
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={10}
              tickFormatter={(v) => formatLots(v)}
              orientation="right"
              tickLine={false}
              width={45}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-gray-900 border border-gray-700 p-2.5 rounded-lg shadow-md text-xs font-mono text-white">
                      <div className="font-bold text-gray-300">
                        Fiyat: {formatPrice(data.price)} TL
                      </div>
                      <div className={data.type === "ALIS" ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                        {data.type === "ALIS" ? "Kümülatif Alış:" : "Kümülatif Satış:"}{" "}
                        {formatLots(data.bidLot || data.askLot)} Lot
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Kademe Lotu: {formatLots(data.lot)} Lot
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              x={depth.lastPrice}
              stroke="#3b82f6"
              strokeDasharray="3 3"
              label={{ value: `Son: ${depth.lastPrice}`, fill: "#3b82f6", fontSize: 10 }}
            />
            <Area
              type="stepAfter"
              dataKey="bidLot"
              stroke="#22c55e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#bidGrad)"
            />
            <Area
              type="stepBefore"
              dataKey="askLot"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#askGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
