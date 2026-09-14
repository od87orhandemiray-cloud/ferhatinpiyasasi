export type FundCategory =
  | 'Tümü'
  | 'Hisse Senedi'
  | 'Para Piyasası'
  | 'Kıymetli Madenler'
  | 'Yabancı & Teknoloji'
  | 'Değişken'
  | 'Katılım'
  | 'Borçlanma Araçları'
  | 'Fon Sepeti';

export interface AssetAllocation {
  asset: string;
  percentage: number;
  color: string;
}

export interface FundHistoryPoint {
  date: string;
  price: number;
  bistReturn?: number;
  goldReturn?: number;
}

export interface TefasFund {
  code: string;
  title: string;
  category: FundCategory;
  managementCompany: string;
  price: number;
  change1D: number;
  change1W: number;
  change1M: number;
  change3M: number;
  change6M: number;
  changeYTD: number;
  change1Y: number;
  change3Y: number;
  change5Y: number;
  totalSize: number;
  sharesCount: number;
  investorsCount: number;
  investorChange1M: number;
  riskLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  managementFee: number;
  buyValour: string;
  sellValour: string;
  minTradeAmount: number;
  taxExempt: boolean;
  tefasTraded: boolean;
  sharpeRatio: number;
  volatility: number;
  positiveDaysRatio: number;
  allocation: AssetAllocation[];
  history: FundHistoryPoint[];
  description: string;
  strategyHighlights: string[];
  lastUpdated?: string;
  isLive?: boolean;
  intradayPrice?: number;
  intradayChange?: number;
}

export interface MarketMacroData {
  bist100: { value: number; change: number };
  goldGram: { value: number; change: number };
  usdTry: { value: number; change: number };
  eurTry?: { value: number; change: number };
  policyRate: number;
  overnightRepo: number;
  tefasTotalVolume: string;
  tefasTotalInvestors: string;
  lastUpdated?: string;
  isLive?: boolean;
}

export interface LiveSyncStatus {
  isLive: boolean;
  fundCount: number;
  lastSyncDate: string;
  lastSyncTime: string;
  isUpdating: boolean;
  error?: string | null;
}
