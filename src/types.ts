export interface DepthLevel {
  level: number;
  orders: number;
  lot: number;
  price: number;
  totalLot: number;
  amount: number;
}

export interface TradeItem {
  id: string;
  time: string;
  price: number;
  lot: number;
  type: "ALIS" | "SATIS";
  amount: number;
}

export interface BrokerItem {
  name: string;
  netLot: number;
  percentage: number;
  type: "buyer" | "seller";
}

export interface StockDepthData {
  symbol: string;
  lastPrice: number;
  bestBid: number;
  bestAsk: number;
  spread: number;
  spreadPercent: number;
  tavan: number;
  taban: number;
  tick: number;
  bids: DepthLevel[];
  asks: DepthLevel[];
  totalBidLots: number;
  totalAskLots: number;
  totalBidAmount: number;
  totalAskAmount: number;
  bidRatio: number;
  askRatio: number;
  recentTrades: TradeItem[];
  brokers: BrokerItem[];
  aof: number;
}

export interface StockSummary {
  kod: string;
  sembol?: string;
  ad?: string;
  kapanis?: string | number;
  alis?: string | number;
  satis?: string | number;
  yuzdedegisim?: number;
  hacim?: string | number;
  hacimtl?: string | number;
  dunkukapanis?: string | number;
  yuksek?: string | number;
  dusuk?: string | number;
  acilis?: string | number;
  fiyat?: string | number;
  zaman?: string;
  sector?: string;
}

export interface MarketIndex {
  code: string;
  name: string;
  last: number;
  change: number;
  volume?: string;
  high?: number;
  low?: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: "ABOVE" | "BELOW" | "LOT_ABOVE";
  lotThreshold?: number;
  active: boolean;
  createdAt: number;
}
