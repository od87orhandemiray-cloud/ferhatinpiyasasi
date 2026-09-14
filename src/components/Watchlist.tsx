import React, { useState, useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bookmark,
  Building2,
  Cpu,
  Layers,
  Plane,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { StockSummary } from "../types";
import { formatPercentage, formatPrice } from "../utils/formatters";

interface WatchlistProps {
  stocks: StockSummary[];
  selectedSymbol: string;
  onSelectStock: (symbol: string) => void;
  favorites: string[];
  onToggleFavorite: (symbol: string) => void;
}

const CATEGORIES = [
  { id: "BIST30", label: "BIST 30", icon: Layers },
  { id: "FAV", label: "Favoriler", icon: Star },
  { id: "ALL", label: "Tüm BIST", icon: Layers },
  { id: "BANKA", label: "Banka", icon: Building2 },
  { id: "SANAYI", label: "Sanayi", icon: Layers },
  { id: "HAVACILIK", label: "Havacılık", icon: Plane },
  { id: "TEKNO", label: "Teknoloji", icon: Cpu },
];

const BIST30_SYMBOLS = new Set([
  "AKBNK", "ALARK", "ASELS", "ASTOR", "BIMAS", "BRSAN", "DOAS", "EKGYO", "ENKAI", "EREGL",
  "FROTO", "GARAN", "GUBRF", "HEKTS", "ISCTR", "KCHOL", "KONTR", "KOZAL", "KRDMD", "OYAKC",
  "PGSUS", "SAHOL", "SASA", "SISE", "TCELL", "THYAO", "TOASO", "TUPRS", "VAKBN", "YKBNK"
]);

const BANK_SYMBOLS = new Set(["AKBNK", "GARAN", "ISCTR", "YKBNK", "VAKBN", "HALKB", "ALBRK", "SKBNK", "KLNMA"]);
const SANAYI_SYMBOLS = new Set(["EREGL", "TUPRS", "KCHOL", "SISE", "SASA", "HEKTS", "FROTO", "TOASO", "PETKM", "ARCLK", "VESBE", "KRDMD"]);
const HAVACILIK_SYMBOLS = new Set(["THYAO", "PGSUS", "TAVHL", "CLEBI"]);
const TEKNO_SYMBOLS = new Set(["ASELS", "KFEIN", "LOGO", "VBTYZ", "MIATK", "SDTTR", "REEDR", "KONTUR", "NETAS"]);

export const Watchlist: React.FC<WatchlistProps> = ({
  stocks,
  selectedSymbol,
  onSelectStock,
  favorites,
  onToggleFavorite,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("BIST30");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"symbol" | "price" | "change" | "volume">("change");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const sym = (stock.kod || stock.sembol || "").toUpperCase();
      const name = (stock.ad || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      // Search match
      const matchesSearch = !q || sym.toLowerCase().includes(q) || name.includes(q);
      if (!matchesSearch) return false;

      // Category match
      if (activeCategory === "FAV") {
        return favorites.includes(sym);
      }
      if (activeCategory === "BIST30") {
        return BIST30_SYMBOLS.has(sym);
      }
      if (activeCategory === "BANKA") {
        return BANK_SYMBOLS.has(sym);
      }
      if (activeCategory === "SANAYI") {
        return SANAYI_SYMBOLS.has(sym);
      }
      if (activeCategory === "HAVACILIK") {
        return HAVACILIK_SYMBOLS.has(sym);
      }
      if (activeCategory === "TEKNO") {
        return TEKNO_SYMBOLS.has(sym);
      }
      return true;
    }).sort((a, b) => {
      const symA = (a.kod || a.sembol || "").toUpperCase();
      const symB = (b.kod || b.sembol || "").toUpperCase();
      const priceA = parseFloat(String(a.kapanis || a.alis || 0));
      const priceB = parseFloat(String(b.kapanis || b.alis || 0));
      const changeA = typeof a.yuzdedegisim === "number" ? a.yuzdedegisim : parseFloat(String(a.yuzdedegisim || 0));
      const changeB = typeof b.yuzdedegisim === "number" ? b.yuzdedegisim : parseFloat(String(b.yuzdedegisim || 0));

      let comp = 0;
      if (sortBy === "symbol") comp = symA.localeCompare(symB);
      else if (sortBy === "price") comp = priceA - priceB;
      else if (sortBy === "change") comp = changeA - changeB;
      else if (sortBy === "volume") comp = (parseFloat(String(a.hacim || 0)) - parseFloat(String(b.hacim || 0)));

      return sortOrder === "desc" ? -comp : comp;
    });
  }, [stocks, searchQuery, activeCategory, favorites, sortBy, sortOrder]);

  const toggleSort = (field: "symbol" | "price" | "change" | "volume") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <aside className="w-full lg:w-80 flex flex-col border-r border-gray-200 dark:border-zinc-800 bg-[#F9FAFB] dark:bg-zinc-900/60 select-none p-3 lg:p-4 gap-3">
      {/* Search Bar & Category Chips Box */}
      <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl shadow-xs border border-gray-200 dark:border-zinc-800 flex flex-col gap-2.5">
        <h2 className="text-xs font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-wider">
          Hisse Arama
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="stock-search-input"
            type="text"
            placeholder="Hisse ara... (örn: THYAO)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-7 py-2 text-xs font-medium rounded-lg bg-gray-100 dark:bg-zinc-800 border-none text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories Chips */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar pt-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`watchlist-cat-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
                }`}
              >
                <Icon className={`w-3 h-3 ${cat.id === "FAV" && isActive ? "text-white" : cat.id === "FAV" ? "text-amber-400 fill-amber-400" : ""}`} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Watchlist Card */}
      <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl shadow-xs border border-gray-200 dark:border-zinc-800 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-xs font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-wider">
            İzleme Listesi
          </h2>
          <span className="text-[11px] text-gray-400 font-mono">
            {filteredStocks.length} Hisse
          </span>
        </div>

        {/* Sort header */}
        <div className="grid grid-cols-12 px-2 py-1 bg-gray-50 dark:bg-zinc-800/50 rounded-md text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-400 mb-1.5">
          <div
            className="col-span-5 flex items-center gap-1 cursor-pointer hover:text-gray-900 dark:hover:text-zinc-200"
            onClick={() => toggleSort("symbol")}
          >
            <span>Hisse</span>
            {sortBy === "symbol" && (sortOrder === "asc" ? "↑" : "↓")}
          </div>
          <div
            className="col-span-4 text-right cursor-pointer hover:text-gray-900 dark:hover:text-zinc-200"
            onClick={() => toggleSort("price")}
          >
            <span>Son</span>
            {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
          </div>
          <div
            className="col-span-3 text-right cursor-pointer hover:text-gray-900 dark:hover:text-zinc-200"
            onClick={() => toggleSort("change")}
          >
            <span>% Fark</span>
            {sortBy === "change" && (sortOrder === "asc" ? "↑" : "↓")}
          </div>
        </div>

        {/* Stock list container */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
          {filteredStocks.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-xs">
              {activeCategory === "FAV"
                ? "Favori hisseniz bulunmuyor."
                : "Hisse bulunamadı."}
            </div>
          ) : (
            filteredStocks.map((st) => {
              const sym = (st.kod || st.sembol || "").toUpperCase();
              const isSelected = selectedSymbol.toUpperCase() === sym;
              const isFav = favorites.includes(sym);
              const price = parseFloat(String(st.kapanis || st.alis || 0));
              const change = typeof st.yuzdedegisim === "number" ? st.yuzdedegisim : parseFloat(String(st.yuzdedegisim || 0));
              const isUp = change >= 0;

              return (
                <div
                  key={sym}
                  id={`stock-item-${sym}`}
                  onClick={() => onSelectStock(sym)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 shadow-2xs"
                      : "hover:bg-gray-50 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  {/* Symbol & Name */}
                  <div className="flex items-center gap-1.5 overflow-hidden pr-1">
                    <button
                      id={`fav-toggle-${sym}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(sym);
                      }}
                      className="p-0.5 text-gray-300 hover:text-amber-400 dark:text-zinc-600 transition-colors"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isFav ? "fill-amber-400 text-amber-400" : ""
                        }`}
                      />
                    </button>
                    <div>
                      <span className={`font-bold text-sm tracking-tight ${isSelected ? "text-blue-700 dark:text-blue-400" : "text-gray-800 dark:text-zinc-100"}`}>
                        {sym}
                      </span>
                    </div>
                  </div>

                  {/* Price & Change */}
                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                      {formatPrice(price)}
                    </div>
                    <div
                      className={`text-[10px] font-semibold flex items-center justify-end ${
                        isUp ? "text-green-600 dark:text-emerald-400" : "text-red-500 dark:text-rose-400"
                      }`}
                    >
                      {isUp ? "+" : ""}{formatPercentage(change)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};
