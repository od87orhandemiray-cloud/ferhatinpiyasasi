import React, { useState } from "react";
import { Bell, BellOff, Plus, Trash2, X } from "lucide-react";
import { PriceAlert, StockDepthData } from "../types";
import { formatLots, formatPrice } from "../utils/formatters";

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  depth: StockDepthData | null;
  alerts: PriceAlert[];
  onAddAlert: (alert: Omit<PriceAlert, "id" | "createdAt">) => void;
  onRemoveAlert: (id: string) => void;
  onToggleAlert: (id: string) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  depth,
  alerts,
  onAddAlert,
  onRemoveAlert,
  onToggleAlert,
}) => {
  if (!isOpen) return null;

  const currentPrice = depth?.lastPrice || 100;
  const currentSymbol = depth?.symbol || "THYAO";

  const [targetPrice, setTargetPrice] = useState<number>(currentPrice);
  const [condition, setCondition] = useState<"ABOVE" | "BELOW" | "LOT_ABOVE">("ABOVE");
  const [lotThreshold, setLotThreshold] = useState<number>(50000);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAlert({
      symbol: currentSymbol,
      targetPrice,
      condition,
      lotThreshold: condition === "LOT_ABOVE" ? lotThreshold : undefined,
      active: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in select-none">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-50">
                Kademe ve Fiyat Alarmları
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Anlık Bigpara fiyat ve kademe hacmi bildirimleri
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

        {/* Add Alert Form */}
        <form onSubmit={handleAdd} className="mt-4 p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 space-y-3">
          <div className="text-xs font-bold text-gray-800 dark:text-zinc-200">
            Yeni Alarm Ekle ({currentSymbol})
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Condition selector */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-gray-500 dark:text-zinc-400 mb-1">
                Kural Tipi
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ABOVE">Fiyat Üzerine (≥)</option>
                <option value="BELOW">Fiyat Altına (≤)</option>
                <option value="LOT_ABOVE">Kademe Lotu (≥)</option>
              </select>
            </div>

            {/* Target Price */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-gray-500 dark:text-zinc-400 mb-1">
                Hedef Fiyat (TL)
              </label>
              <input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(parseFloat(e.target.value) || currentPrice)}
                className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Lot Threshold (if LOT_ABOVE) */}
            {condition === "LOT_ABOVE" ? (
              <div>
                <label className="block text-[10px] uppercase font-semibold text-gray-500 dark:text-zinc-400 mb-1">
                  Min. Lot
                </label>
                <input
                  type="number"
                  step="1000"
                  value={lotThreshold}
                  onChange={(e) => setLotThreshold(parseInt(e.target.value, 10) || 10000)}
                  className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ) : (
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Alarm Kur</span>
                </button>
              </div>
            )}
          </div>

          {condition === "LOT_ABOVE" && (
            <button
              type="submit"
              className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Kademe Lot Alarmını Kaydet</span>
            </button>
          )}
        </form>

        {/* Existing Alerts List */}
        <div className="mt-4">
          <div className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2 flex items-center justify-between">
            <span>Aktif Alarmlar ({alerts.length})</span>
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-800">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs">
                Kayıtlı alarmınız bulunmuyor.
              </div>
            ) : (
              alerts.map((al) => (
                <div
                  key={al.id}
                  className="p-2.5 flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-zinc-950 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleAlert(al.id)}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        al.active ? "text-amber-500 bg-amber-50 dark:bg-amber-950/50" : "text-gray-400 bg-gray-100 dark:bg-zinc-800"
                      }`}
                    >
                      {al.active ? <Bell className="w-3.5 h-3.5 fill-amber-400" /> : <BellOff className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <div className="font-bold text-xs text-gray-900 dark:text-zinc-100 font-mono">
                        {al.symbol} • {formatPrice(al.targetPrice)} TL
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-zinc-400">
                        {al.condition === "ABOVE"
                          ? "Fiyat ≥ " + formatPrice(al.targetPrice)
                          : al.condition === "BELOW"
                          ? "Fiyat ≤ " + formatPrice(al.targetPrice)
                          : `Kademe Lotu ≥ ${formatLots(al.lotThreshold)}`}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveAlert(al.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
