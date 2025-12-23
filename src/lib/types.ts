// Stock and Financial Types

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  movingAverage200: number;
  sector: string;
  industry: string;
  exchange: string;
  currency: string;
}

export interface FinancialStatement {
  year: number;
  revenue: number;
  netIncome: number;
  operatingCashFlow: number;
  freeCashFlow: number;
  totalAssets: number;
  totalLiabilities: number;
  shareholderEquity: number;
  eps: number;
  bookValue: number;
}

export interface KeyRatios {
  peRatio: number;
  pbRatio: number;
  psRatio: number;
  evToEbitda: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  roe: number;
  roa: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
}

export interface EarningsEvent {
  symbol: string;
  companyName: string;
  date: string;
  time: 'BMO' | 'AMC' | 'TBD'; // Before Market Open, After Market Close
  epsEstimate: number;
  epsActual?: number;
  revenueEstimate: number;
  revenueActual?: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  addedAt: string;
  priceAlert?: number;
  rsiAlert?: number;
  notes?: string;
}

export interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
  createdAt: string;
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  dividendYield: number;
  sector: string;
  purchaseDate: string;
}

export interface Portfolio {
  id: string;
  name: string;
  holdings: PortfolioHolding[];
  createdAt: string;
}

export interface DividendEvent {
  symbol: string;
  companyName: string;
  exDate: string;
  paymentDate: string;
  amount: number;
  yield: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  symbols: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface DCFInputs {
  freeCashFlow: number;
  growthRateYear1to5: number;
  growthRateYear6to10: number;
  terminalGrowthRate: number;
  discountRate: number;
  sharesOutstanding: number;
  cashAndEquivalents: number;
  totalDebt: number;
}

export interface DCFResult {
  intrinsicValue: number;
  currentPrice: number;
  upside: number;
  projectedCashFlows: { year: number; cashFlow: number; discountedCashFlow: number }[];
  terminalValue: number;
}

export interface CustomKPI {
  id: string;
  name: string;
  formula: string;
  description: string;
}
