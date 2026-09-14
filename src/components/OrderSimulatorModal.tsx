import React, { useState } from "react";
import { Check, Info, PlusCircle, ShieldCheck, X } from "lucide-react";
import { StockDepthData } from "../types";
import { formatLots, formatPrice } from "../utils/formatters";
import { soundFx } from "../utils/audio";

interface OrderSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  depth: StockDepthData | null;
  onOrderPlaced?: (order: any) => void;
}

export const OrderSimulatorModal: React.FC<OrderSimulatorModalProps> = ({
  isOpen,
  onClose,
  depth,
  onOrderPlaced,
}) => {
  if (!isOpen || !depth) return null;

  const [side, setSide] = useState<"ALIS" | "SATIS">("ALIS");
  const [price, setPrice] = useState<number>(side === "ALIS" ? depth.bestBid : depth.bestAsk);
  const [lots, setLots] = useState<number>(1000);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const totalAmount = price * lots;
  const commission = totalAmount * 0.0002; // BIST on binde 2 standard brokerage

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playOrderExecuted();
    setSubmitted(true);
    if (onOrderPlaced) {
      onOrderPlaced({
        symbol: depth.symbol,
        side,
        price,
        lots,
        totalAmount,
        time: new Date().toLocaleTimeString(),
      });
    }
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in select-none">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-5 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-50">
                Sanal Kademe Emir Simülatörü
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-mono">
                {depth.symbol} • Son Fiyat: {formatPrice(depth.lastPrice)} TL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-gray-900 dark:text-zinc-100">
              Emir Kademeye İletildi!
            </h4>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              {lots} Lot @ {formatPrice(price)} TL ({side})
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Side toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-zinc-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setSide("ALIS");
                  setPrice(depth.bestBid);
                }}
                className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  side === "ALIS"
                    ? "bg-green-600 text-white shadow-xs"
                    : "text-gray-600 dark:text-zinc-400 hover:text-gray-900"
                }`}
              >
                ALIŞ EMRİ
              </button>
              <button
                type="button"
                onClick={() => {
                  setSide("SATIS");
                  setPrice(depth.bestAsk);
                }}
                className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  side === "SATIS"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-gray-600 dark:text-zinc-400 hover:text-gray-900"
                }`}
              >
                SATIŞ EMRİ
              </button>
            </div>

            {/* Price Selection & Quick Level Buttons */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Limit Fiyat (TL)
              </label>
              <div className="flex gap-1.5 items-center">
                <input
                  type="number"
                  step={depth.tick}
                  min={depth.taban}
                  max={depth.tavan}
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || depth.lastPrice)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Quick Level Presets */}
              <div className="flex gap-1 mt-1.5 overflow-x-auto no-scrollbar">
                {(side === "ALIS" ? depth.bids : depth.asks).map((lvl) => (
                  <button
                    key={lvl.level}
                    type="button"
                    onClick={() => setPrice(lvl.price)}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-medium border cursor-pointer ${
                      price === lvl.price
                        ? "bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                        : "bg-gray-50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-100"
                    }`}
                  >
                    K{lvl.level}: {formatPrice(lvl.price)}
                  </button>
                ))}
              </div>
            </div>

            {/* Lot quantity */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Emir Miktarı (Lot)
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={lots}
                onChange={(e) => setLots(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />

              {/* Quick lot increments */}
              <div className="flex gap-1.5 mt-1.5">
                {[100, 500, 1000, 5000, 10000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setLots(val)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    {formatLots(val)}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Summary breakdown */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                <span>İşlem Tutarı:</span>
                <span className="font-bold text-gray-900 dark:text-zinc-100">
                  {formatPrice(totalAmount)} TL
                </span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                <span>Tahmini Komisyon (On binde 2):</span>
                <span>{formatPrice(commission)} TL</span>
              </div>
              <div className="flex justify-between text-gray-800 dark:text-zinc-200 font-bold pt-1 border-t border-gray-200 dark:border-zinc-800">
                <span>Toplam Maliyet:</span>
                <span className={side === "ALIS" ? "text-green-600 dark:text-emerald-400" : "text-red-500 dark:text-rose-400"}>
                  {formatPrice(side === "ALIS" ? totalAmount + commission : totalAmount - commission)} TL
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className={`flex-2 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer ${
                  side === "ALIS" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {side === "ALIS" ? "Sanal Alış Emrini İlet" : "Sanal Satış Emrini İlet"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
