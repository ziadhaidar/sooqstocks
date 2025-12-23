import { Watchlist, Portfolio, CustomKPI } from './types';

const WATCHLISTS_KEY = 'stockAnalysis_watchlists';
const PORTFOLIOS_KEY = 'stockAnalysis_portfolios';
const CUSTOM_KPIS_KEY = 'stockAnalysis_customKPIs';

// Watchlist functions
export function getWatchlists(): Watchlist[] {
  const data = localStorage.getItem(WATCHLISTS_KEY);
  if (!data) {
    // Return default watchlist
    const defaultWatchlist: Watchlist = {
      id: 'default',
      name: 'My Watchlist',
      items: [
        { symbol: 'AAPL', name: 'Apple Inc.', addedAt: new Date().toISOString() },
        { symbol: 'MSFT', name: 'Microsoft Corporation', addedAt: new Date().toISOString() },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', addedAt: new Date().toISOString() },
      ],
      createdAt: new Date().toISOString(),
    };
    saveWatchlists([defaultWatchlist]);
    return [defaultWatchlist];
  }
  return JSON.parse(data);
}

export function saveWatchlists(watchlists: Watchlist[]): void {
  localStorage.setItem(WATCHLISTS_KEY, JSON.stringify(watchlists));
}

export function addToWatchlist(watchlistId: string, symbol: string, name: string): void {
  const watchlists = getWatchlists();
  const watchlist = watchlists.find(w => w.id === watchlistId);
  if (watchlist) {
    if (!watchlist.items.find(item => item.symbol === symbol)) {
      watchlist.items.push({
        symbol,
        name,
        addedAt: new Date().toISOString(),
      });
      saveWatchlists(watchlists);
    }
  }
}

export function removeFromWatchlist(watchlistId: string, symbol: string): void {
  const watchlists = getWatchlists();
  const watchlist = watchlists.find(w => w.id === watchlistId);
  if (watchlist) {
    watchlist.items = watchlist.items.filter(item => item.symbol !== symbol);
    saveWatchlists(watchlists);
  }
}

// Portfolio functions
export function getPortfolios(): Portfolio[] {
  const data = localStorage.getItem(PORTFOLIOS_KEY);
  if (!data) {
    // Return default portfolio
    const defaultPortfolio: Portfolio = {
      id: 'default',
      name: 'Main Portfolio',
      holdings: [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          shares: 50,
          avgCost: 155.00,
          currentPrice: 178.72,
          dividendYield: 0.52,
          sector: 'Technology',
          purchaseDate: '2023-06-15',
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          shares: 25,
          avgCost: 320.00,
          currentPrice: 378.91,
          dividendYield: 0.79,
          sector: 'Technology',
          purchaseDate: '2023-04-20',
        },
        {
          symbol: 'JPM',
          name: 'JPMorgan Chase & Co.',
          shares: 30,
          avgCost: 145.00,
          currentPrice: 195.42,
          dividendYield: 2.35,
          sector: 'Financial Services',
          purchaseDate: '2023-01-10',
        },
      ],
      createdAt: new Date().toISOString(),
    };
    savePortfolios([defaultPortfolio]);
    return [defaultPortfolio];
  }
  return JSON.parse(data);
}

export function savePortfolios(portfolios: Portfolio[]): void {
  localStorage.setItem(PORTFOLIOS_KEY, JSON.stringify(portfolios));
}

export function addHolding(portfolioId: string, holding: Portfolio['holdings'][0]): void {
  const portfolios = getPortfolios();
  const portfolio = portfolios.find(p => p.id === portfolioId);
  if (portfolio) {
    const existingIndex = portfolio.holdings.findIndex(h => h.symbol === holding.symbol);
    if (existingIndex >= 0) {
      // Update existing holding
      portfolio.holdings[existingIndex] = holding;
    } else {
      portfolio.holdings.push(holding);
    }
    savePortfolios(portfolios);
  }
}

export function removeHolding(portfolioId: string, symbol: string): void {
  const portfolios = getPortfolios();
  const portfolio = portfolios.find(p => p.id === portfolioId);
  if (portfolio) {
    portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== symbol);
    savePortfolios(portfolios);
  }
}

// Custom KPI functions
export function getCustomKPIs(): CustomKPI[] {
  const data = localStorage.getItem(CUSTOM_KPIS_KEY);
  if (!data) {
    const defaultKPIs: CustomKPI[] = [
      {
        id: 'peg',
        name: 'PEG Ratio',
        formula: 'PE / EPS_GROWTH',
        description: 'Price/Earnings to Growth ratio',
      },
      {
        id: 'fcf_yield',
        name: 'FCF Yield',
        formula: 'FREE_CASH_FLOW / MARKET_CAP * 100',
        description: 'Free Cash Flow Yield percentage',
      },
    ];
    saveCustomKPIs(defaultKPIs);
    return defaultKPIs;
  }
  return JSON.parse(data);
}

export function saveCustomKPIs(kpis: CustomKPI[]): void {
  localStorage.setItem(CUSTOM_KPIS_KEY, JSON.stringify(kpis));
}

export function addCustomKPI(kpi: CustomKPI): void {
  const kpis = getCustomKPIs();
  kpis.push(kpi);
  saveCustomKPIs(kpis);
}

export function removeCustomKPI(id: string): void {
  const kpis = getCustomKPIs();
  saveCustomKPIs(kpis.filter(k => k.id !== id));
}
