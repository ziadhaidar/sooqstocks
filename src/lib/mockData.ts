import {
  Stock,
  FinancialStatement,
  KeyRatios,
  EarningsEvent,
  NewsItem,
  DividendEvent,
} from './types';

export const popularStocks: Stock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 178.72,
    change: 2.34,
    changePercent: 1.33,
    volume: 52847000,
    marketCap: 2780000000000,
    peRatio: 28.4,
    dividendYield: 0.52,
    fiftyTwoWeekHigh: 199.62,
    fiftyTwoWeekLow: 164.08,
    movingAverage200: 175.50,
    sector: 'Technology',
    industry: 'Consumer Electronics',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.91,
    change: 4.56,
    changePercent: 1.22,
    volume: 21456000,
    marketCap: 2810000000000,
    peRatio: 35.2,
    dividendYield: 0.79,
    fiftyTwoWeekHigh: 430.82,
    fiftyTwoWeekLow: 309.45,
    movingAverage200: 365.20,
    sector: 'Technology',
    industry: 'Software',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 141.80,
    change: -1.23,
    changePercent: -0.86,
    volume: 18923000,
    marketCap: 1780000000000,
    peRatio: 24.1,
    dividendYield: 0,
    fiftyTwoWeekHigh: 153.78,
    fiftyTwoWeekLow: 115.83,
    movingAverage200: 138.45,
    sector: 'Technology',
    industry: 'Internet Services',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 178.25,
    change: 3.12,
    changePercent: 1.78,
    volume: 34521000,
    marketCap: 1850000000000,
    peRatio: 62.8,
    dividendYield: 0,
    fiftyTwoWeekHigh: 191.70,
    fiftyTwoWeekLow: 118.35,
    movingAverage200: 165.30,
    sector: 'Consumer Cyclical',
    industry: 'Internet Retail',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.35,
    change: 15.67,
    changePercent: 1.82,
    volume: 42156000,
    marketCap: 2150000000000,
    peRatio: 65.4,
    dividendYield: 0.03,
    fiftyTwoWeekHigh: 974.00,
    fiftyTwoWeekLow: 222.97,
    movingAverage200: 620.50,
    sector: 'Technology',
    industry: 'Semiconductors',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.50,
    change: -5.34,
    changePercent: -2.10,
    volume: 98234000,
    marketCap: 790000000000,
    peRatio: 72.1,
    dividendYield: 0,
    fiftyTwoWeekHigh: 299.29,
    fiftyTwoWeekLow: 138.80,
    movingAverage200: 235.80,
    sector: 'Consumer Cyclical',
    industry: 'Auto Manufacturers',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    price: 195.42,
    change: 1.89,
    changePercent: 0.98,
    volume: 8934000,
    marketCap: 564000000000,
    peRatio: 11.2,
    dividendYield: 2.35,
    fiftyTwoWeekHigh: 205.88,
    fiftyTwoWeekLow: 135.19,
    movingAverage200: 180.60,
    sector: 'Financial Services',
    industry: 'Banks',
    exchange: 'NYSE',
    currency: 'USD',
  },
  {
    symbol: 'V',
    name: 'Visa Inc.',
    price: 279.45,
    change: 2.11,
    changePercent: 0.76,
    volume: 5623000,
    marketCap: 573000000000,
    peRatio: 30.5,
    dividendYield: 0.75,
    fiftyTwoWeekHigh: 290.96,
    fiftyTwoWeekLow: 227.68,
    movingAverage200: 265.40,
    sector: 'Financial Services',
    industry: 'Credit Services',
    exchange: 'NYSE',
    currency: 'USD',
  },
];

export const europeanStocks: Stock[] = [
  {
    symbol: 'ASML.AS',
    name: 'ASML Holding N.V.',
    price: 892.50,
    change: 12.40,
    changePercent: 1.41,
    volume: 1234000,
    marketCap: 352000000000,
    peRatio: 42.3,
    dividendYield: 0.68,
    fiftyTwoWeekHigh: 912.00,
    fiftyTwoWeekLow: 556.00,
    movingAverage200: 780.30,
    sector: 'Technology',
    industry: 'Semiconductors',
    exchange: 'Euronext',
    currency: 'EUR',
  },
  {
    symbol: 'SAP.DE',
    name: 'SAP SE',
    price: 178.24,
    change: 2.15,
    changePercent: 1.22,
    volume: 1856000,
    marketCap: 207000000000,
    peRatio: 48.6,
    dividendYield: 1.21,
    fiftyTwoWeekHigh: 184.50,
    fiftyTwoWeekLow: 118.52,
    movingAverage200: 155.60,
    sector: 'Technology',
    industry: 'Software',
    exchange: 'XETRA',
    currency: 'EUR',
  },
  {
    symbol: 'NESN.SW',
    name: 'Nestlé S.A.',
    price: 98.72,
    change: -0.86,
    changePercent: -0.86,
    volume: 3245000,
    marketCap: 265000000000,
    peRatio: 22.8,
    dividendYield: 3.12,
    fiftyTwoWeekHigh: 112.18,
    fiftyTwoWeekLow: 91.52,
    movingAverage200: 102.40,
    sector: 'Consumer Defensive',
    industry: 'Food Products',
    exchange: 'SIX',
    currency: 'CHF',
  },
];

export function generateFinancialStatements(symbol: string): FinancialStatement[] {
  const baseRevenue = Math.random() * 300000 + 50000;
  const statements: FinancialStatement[] = [];
  
  for (let i = 0; i < 20; i++) {
    const year = 2024 - i;
    const growthFactor = Math.pow(0.92 + Math.random() * 0.16, i);
    const revenue = baseRevenue * growthFactor * (1 + (Math.random() - 0.5) * 0.1);
    const netMargin = 0.08 + Math.random() * 0.15;
    
    statements.push({
      year,
      revenue: Math.round(revenue),
      netIncome: Math.round(revenue * netMargin),
      operatingCashFlow: Math.round(revenue * netMargin * 1.2),
      freeCashFlow: Math.round(revenue * netMargin * 0.9),
      totalAssets: Math.round(revenue * 2.5),
      totalLiabilities: Math.round(revenue * 1.2),
      shareholderEquity: Math.round(revenue * 1.3),
      eps: Math.round((revenue * netMargin / 1000) * 100) / 100,
      bookValue: Math.round((revenue * 1.3 / 1000) * 100) / 100,
    });
  }
  
  return statements;
}

export function generateKeyRatios(stock: Stock): KeyRatios {
  return {
    peRatio: stock.peRatio,
    pbRatio: 5.2 + Math.random() * 10,
    psRatio: 4.8 + Math.random() * 8,
    evToEbitda: 15 + Math.random() * 20,
    debtToEquity: 0.3 + Math.random() * 1.5,
    currentRatio: 1.2 + Math.random() * 2,
    quickRatio: 0.8 + Math.random() * 1.5,
    roe: 0.12 + Math.random() * 0.25,
    roa: 0.05 + Math.random() * 0.15,
    grossMargin: 0.30 + Math.random() * 0.40,
    operatingMargin: 0.15 + Math.random() * 0.25,
    netMargin: 0.08 + Math.random() * 0.20,
  };
}

export function generatePriceHistory(days: number = 365): { date: string; price: number; volume: number }[] {
  const history: { date: string; price: number; volume: number }[] = [];
  let price = 100 + Math.random() * 100;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    price = price * (1 + (Math.random() - 0.48) * 0.04);
    price = Math.max(price, 10);
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
      volume: Math.round(1000000 + Math.random() * 10000000),
    });
  }
  
  return history;
}

export const upcomingEarnings: EarningsEvent[] = [
  {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    date: '2024-01-25',
    time: 'AMC',
    epsEstimate: 2.10,
    revenueEstimate: 117500000000,
  },
  {
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    date: '2024-01-30',
    time: 'AMC',
    epsEstimate: 2.78,
    revenueEstimate: 61100000000,
  },
  {
    symbol: 'GOOGL',
    companyName: 'Alphabet Inc.',
    date: '2024-01-30',
    time: 'AMC',
    epsEstimate: 1.59,
    revenueEstimate: 85300000000,
  },
  {
    symbol: 'AMZN',
    companyName: 'Amazon.com Inc.',
    date: '2024-02-01',
    time: 'AMC',
    epsEstimate: 0.80,
    revenueEstimate: 166200000000,
  },
  {
    symbol: 'META',
    companyName: 'Meta Platforms Inc.',
    date: '2024-02-01',
    time: 'AMC',
    epsEstimate: 4.96,
    revenueEstimate: 39100000000,
  },
];

export const recentEarnings: EarningsEvent[] = [
  {
    symbol: 'JPM',
    companyName: 'JPMorgan Chase & Co.',
    date: '2024-01-12',
    time: 'BMO',
    epsEstimate: 3.32,
    epsActual: 3.97,
    revenueEstimate: 39800000000,
    revenueActual: 39940000000,
  },
  {
    symbol: 'UNH',
    companyName: 'UnitedHealth Group',
    date: '2024-01-16',
    time: 'BMO',
    epsEstimate: 5.98,
    epsActual: 6.16,
    revenueEstimate: 91200000000,
    revenueActual: 94430000000,
  },
];

export const sampleNews: NewsItem[] = [
  {
    id: '1',
    title: 'Apple Vision Pro Launch Generates Strong Consumer Interest',
    summary: 'Apple\'s new spatial computing device sees robust pre-order numbers, with analysts projecting strong Q1 sales.',
    source: 'Reuters',
    url: '#',
    publishedAt: '2024-01-22T14:30:00Z',
    symbols: ['AAPL'],
    sentiment: 'positive',
  },
  {
    id: '2',
    title: 'Microsoft and OpenAI Deepen AI Partnership',
    summary: 'The tech giants announce expanded collaboration on next-generation AI models and enterprise solutions.',
    source: 'Bloomberg',
    url: '#',
    publishedAt: '2024-01-22T12:15:00Z',
    symbols: ['MSFT'],
    sentiment: 'positive',
  },
  {
    id: '3',
    title: 'Tesla Faces Production Challenges at Berlin Factory',
    summary: 'Temporary production slowdown at Gigafactory Berlin due to supply chain disruptions affecting Q1 output.',
    source: 'Financial Times',
    url: '#',
    publishedAt: '2024-01-22T10:00:00Z',
    symbols: ['TSLA'],
    sentiment: 'negative',
  },
  {
    id: '4',
    title: 'NVIDIA Data Center Revenue Exceeds Expectations',
    summary: 'Continued AI infrastructure demand drives record data center segment performance in Q4.',
    source: 'CNBC',
    url: '#',
    publishedAt: '2024-01-21T16:45:00Z',
    symbols: ['NVDA'],
    sentiment: 'positive',
  },
  {
    id: '5',
    title: 'Fed Officials Signal Patience on Rate Cuts',
    summary: 'Multiple Federal Reserve governors indicate data-dependent approach to monetary policy easing in 2024.',
    source: 'Wall Street Journal',
    url: '#',
    publishedAt: '2024-01-21T14:20:00Z',
    symbols: [],
    sentiment: 'neutral',
  },
];

export const upcomingDividends: DividendEvent[] = [
  {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    exDate: '2024-02-09',
    paymentDate: '2024-02-15',
    amount: 0.24,
    yield: 0.54,
  },
  {
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    exDate: '2024-02-14',
    paymentDate: '2024-03-14',
    amount: 0.75,
    yield: 0.79,
  },
  {
    symbol: 'JPM',
    companyName: 'JPMorgan Chase & Co.',
    exDate: '2024-01-04',
    paymentDate: '2024-01-31',
    amount: 1.05,
    yield: 2.35,
  },
  {
    symbol: 'V',
    companyName: 'Visa Inc.',
    exDate: '2024-02-08',
    paymentDate: '2024-03-01',
    amount: 0.52,
    yield: 0.75,
  },
];

export const sectorColors: Record<string, string> = {
  'Technology': 'hsl(174, 72%, 46%)',
  'Financial Services': 'hsl(38, 92%, 50%)',
  'Consumer Cyclical': 'hsl(280, 65%, 60%)',
  'Healthcare': 'hsl(142, 76%, 36%)',
  'Consumer Defensive': 'hsl(200, 70%, 50%)',
  'Industrials': 'hsl(25, 80%, 55%)',
  'Energy': 'hsl(0, 72%, 51%)',
  'Communication Services': 'hsl(220, 70%, 55%)',
  'Utilities': 'hsl(160, 60%, 45%)',
  'Real Estate': 'hsl(320, 60%, 55%)',
  'Materials': 'hsl(45, 85%, 50%)',
};
