// Stock symbols to track - US and European markets

export interface SymbolInfo {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  region: 'US' | 'EU';
}

export const US_SYMBOLS: SymbolInfo[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'MA', name: 'Mastercard Inc.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'HD', name: 'Home Depot Inc.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'DIS', name: 'Walt Disney Co.', exchange: 'NYSE', currency: 'USD', region: 'US' },
  { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', currency: 'USD', region: 'US' },
  { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE', currency: 'USD', region: 'US' },
];

export const EU_SYMBOLS: SymbolInfo[] = [
  { symbol: 'ASML', name: 'ASML Holding N.V.', exchange: 'NASDAQ', currency: 'USD', region: 'EU' },
  { symbol: 'SAP', name: 'SAP SE', exchange: 'NYSE', currency: 'USD', region: 'EU' },
  { symbol: 'NVS', name: 'Novartis AG', exchange: 'NYSE', currency: 'USD', region: 'EU' },
  { symbol: 'TM', name: 'Toyota Motor Corp.', exchange: 'NYSE', currency: 'USD', region: 'EU' },
  { symbol: 'SHEL', name: 'Shell PLC', exchange: 'NYSE', currency: 'USD', region: 'EU' },
  { symbol: 'AZN', name: 'AstraZeneca PLC', exchange: 'NASDAQ', currency: 'USD', region: 'EU' },
  { symbol: 'UL', name: 'Unilever PLC', exchange: 'NYSE', currency: 'USD', region: 'EU' },
  { symbol: 'NVO', name: 'Novo Nordisk A/S', exchange: 'NYSE', currency: 'USD', region: 'EU' },
];

export const ALL_SYMBOLS = [...US_SYMBOLS, ...EU_SYMBOLS];

export function getSymbolInfo(symbol: string): SymbolInfo | undefined {
  return ALL_SYMBOLS.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
}
