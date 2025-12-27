// Stock symbols to track - Top 60 most important stocks (optimized for Finnhub free tier)

export interface SymbolInfo {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  region: 'US' | 'EU';
}

// Top 50 US stocks by market cap/importance
export const US_SYMBOLS: SymbolInfo[] = [
  // Mega-cap Tech
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'ORCL', name: 'Oracle Corporation', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  
  // Financial Services
  { symbol: 'BRK.B', name: 'Berkshire Hathaway B', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'MA', name: 'Mastercard Inc.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'BAC', name: 'Bank of America', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'GS', name: 'Goldman Sachs Group', exchange: 'NYSE', currency: 'USD', region: 'US' },
  
  // Healthcare
  { symbol: 'UNH', name: 'UnitedHealth Group', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'MRK', name: 'Merck & Co.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'PFE', name: 'Pfizer Inc.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  
  // Consumer
  { symbol: 'HD', name: 'Home Depot Inc.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'MCD', name: "McDonald's Corp.", exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'NKE', name: 'Nike Inc.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'PG', name: 'Procter & Gamble', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'KO', name: 'Coca-Cola Company', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'COST', name: 'Costco Wholesale', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  
  // Industrials
  { symbol: 'CAT', name: 'Caterpillar Inc.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'GE', name: 'GE Aerospace', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'BA', name: 'Boeing Company', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'UPS', name: 'United Parcel Service', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'HON', name: 'Honeywell International', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  
  // Communication & Entertainment
  { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'DIS', name: 'Walt Disney Co.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  
  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corp.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'CVX', name: 'Chevron Corporation', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'COP', name: 'ConocoPhillips', exchange: 'NYSE', currency: 'USD', region: 'US' },
  
  // Real Estate & Utilities
  { symbol: 'NEE', name: 'NextEra Energy', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'AMT', name: 'American Tower', exchange: 'NYSE', currency: 'USD', region: 'US' },
  
  // Materials
  { symbol: 'LIN', name: 'Linde plc', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'APD', name: 'Air Products', exchange: 'NYSE', currency: 'USD', region: 'US' },
];

// Top 10 European stocks (ADRs on US exchanges)
export const EU_SYMBOLS: SymbolInfo[] = [
  { symbol: 'ASML', name: 'ASML Holding', exchange: 'NASDAQ', currency: 'USD', region: 'EU' },
  { symbol: 'NVO', name: 'Novo Nordisk', exchange: 'NYSE', currency: 'USD', region: 'EU' },
  { symbol: 'SAP', name: 'SAP SE', exchange: 'NYSE', currency: 'USD', region: 'EU' },
  { symbol: 'TM', name: 'Toyota Motor Corp.', exchange: 'NYSE', currency: 'USD', region: 'EU' },
  { symbol: 'SHEL', name: 'Shell plc', exchange: 'NYSE', currency: 'USD', region: 'EU' },
  { symbol: 'AZN', name: 'AstraZeneca plc', exchange: 'NASDAQ', currency: 'USD', region: 'EU' },
  { symbol: 'NVS', name: 'Novartis AG', exchange: 'NYSE', currency: 'USD', region: 'EU' },
  { symbol: 'SNY', name: 'Sanofi', exchange: 'NASDAQ', currency: 'USD', region: 'EU' },
  { symbol: 'GSK', name: 'GSK plc', exchange: 'NYSE', currency: 'USD', region: 'EU' },
  { symbol: 'DEO', name: 'Diageo plc', exchange: 'NYSE', currency: 'USD', region: 'EU' },
];

// Combined list - ~60 stocks total (within Finnhub free tier limits)
export const ALL_SYMBOLS = [...US_SYMBOLS, ...EU_SYMBOLS];

export function getSymbolInfo(symbol: string): SymbolInfo | undefined {
  return ALL_SYMBOLS.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
}

export function getSymbolsByRegion(region: 'US' | 'EU'): SymbolInfo[] {
  return region === 'US' ? US_SYMBOLS : EU_SYMBOLS;
}
