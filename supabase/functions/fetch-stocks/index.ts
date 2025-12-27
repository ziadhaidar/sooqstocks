import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FinnhubQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

interface FinnhubProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

interface FinnhubMetric {
  metric: {
    '52WeekHigh': number;
    '52WeekLow': number;
    peNormalizedAnnual: number;
    dividendYieldIndicatedAnnual: number;
    '200DayMovingAverage': number;
  };
}

interface SymbolInfo {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

// In-memory cache with 45-second TTL
const cache: Map<string, CacheEntry> = new Map();
const CACHE_TTL = 45 * 1000; // 45 seconds

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Rate limiting: Finnhub free tier = 60 calls/minute
// We'll batch requests and add delays to stay within limits
const BATCH_SIZE = 10; // Process 10 symbols at a time
const BATCH_DELAY = 1000; // 1 second between batches

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        // Rate limited, wait and retry
        await sleep(2000);
        continue;
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(1000);
    }
  }
  throw new Error('Max retries exceeded');
}

async function fetchSymbolData(
  symbolInfo: SymbolInfo,
  apiKey: string
): Promise<unknown> {
  const cacheKey = `stock:${symbolInfo.symbol}`;
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`Cache hit for ${symbolInfo.symbol}`);
    return cached;
  }

  try {
    // Fetch only quote data for speed (metrics and profile are slower)
    const quoteRes = await fetchWithRetry(
      `https://finnhub.io/api/v1/quote?symbol=${symbolInfo.symbol}&token=${apiKey}`
    );
    const quote: FinnhubQuote = await quoteRes.json();

    // Only fetch additional data if we got a valid quote
    let metrics: FinnhubMetric = { metric: {} as FinnhubMetric['metric'] };
    let profile: FinnhubProfile = {} as FinnhubProfile;

    if (quote.c && quote.c > 0) {
      // Fetch basic metrics in parallel
      const [metricRes, profileRes] = await Promise.all([
        fetchWithRetry(
          `https://finnhub.io/api/v1/stock/metric?symbol=${symbolInfo.symbol}&metric=all&token=${apiKey}`
        ),
        fetchWithRetry(
          `https://finnhub.io/api/v1/stock/profile2?symbol=${symbolInfo.symbol}&token=${apiKey}`
        ),
      ]);

      metrics = await metricRes.json();
      profile = await profileRes.json();
    }

    // Map sector from Finnhub industry
    const sectorMap: Record<string, string> = {
      'Technology': 'Technology',
      'Financial Services': 'Financial Services',
      'Healthcare': 'Healthcare',
      'Consumer Cyclical': 'Consumer Cyclical',
      'Consumer Defensive': 'Consumer Defensive',
      'Industrials': 'Industrials',
      'Energy': 'Energy',
      'Basic Materials': 'Materials',
      'Communication Services': 'Communication Services',
      'Utilities': 'Utilities',
      'Real Estate': 'Real Estate',
    };

    const sector = sectorMap[profile.finnhubIndustry] || profile.finnhubIndustry || 'Technology';

    const stockData = {
      symbol: symbolInfo.symbol,
      name: profile.name || symbolInfo.name,
      price: quote.c || 0,
      change: quote.d || 0,
      changePercent: quote.dp || 0,
      volume: 0,
      marketCap: (profile.marketCapitalization || 0) * 1000000,
      peRatio: metrics.metric?.peNormalizedAnnual || 0,
      dividendYield: metrics.metric?.dividendYieldIndicatedAnnual || 0,
      fiftyTwoWeekHigh: metrics.metric?.['52WeekHigh'] || quote.h,
      fiftyTwoWeekLow: metrics.metric?.['52WeekLow'] || quote.l,
      movingAverage200: metrics.metric?.['200DayMovingAverage'] || quote.c,
      sector,
      industry: profile.finnhubIndustry || 'Unknown',
      exchange: profile.exchange || symbolInfo.exchange,
      currency: profile.currency || symbolInfo.currency,
    };

    setCache(cacheKey, stockData);
    return stockData;
  } catch (error) {
    console.error(`Error fetching ${symbolInfo.symbol}:`, error);
    // Return placeholder with available info
    return {
      symbol: symbolInfo.symbol,
      name: symbolInfo.name,
      price: 0,
      change: 0,
      changePercent: 0,
      volume: 0,
      marketCap: 0,
      peRatio: 0,
      dividendYield: 0,
      fiftyTwoWeekHigh: 0,
      fiftyTwoWeekLow: 0,
      movingAverage200: 0,
      sector: 'Technology',
      industry: 'Unknown',
      exchange: symbolInfo.exchange,
      currency: symbolInfo.currency,
      error: true,
    };
  }
}

async function fetchStocksBatched(
  symbols: SymbolInfo[],
  apiKey: string
): Promise<unknown[]> {
  const results: unknown[] = [];
  
  // Process in batches to respect rate limits
  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const batch = symbols.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(symbols.length / BATCH_SIZE)}`);
    
    const batchResults = await Promise.all(
      batch.map(symbol => fetchSymbolData(symbol, apiKey))
    );
    
    results.push(...batchResults);
    
    // Add delay between batches (except for last batch)
    if (i + BATCH_SIZE < symbols.length) {
      await sleep(BATCH_DELAY);
    }
  }
  
  return results;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!apiKey) {
      console.error('FINNHUB_API_KEY not configured');
      throw new Error('API key not configured');
    }

    const { symbols, search } = await req.json();
    
    // Handle symbol search
    if (search) {
      console.log(`Searching for symbol: ${search}`);
      const searchRes = await fetchWithRetry(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(search)}&token=${apiKey}`
      );
      const searchData = await searchRes.json();
      
      // Filter to only stock types and US exchanges
      const results = (searchData.result || [])
        .filter((r: { type: string; displaySymbol: string }) => 
          r.type === 'Common Stock' && 
          !r.displaySymbol.includes('.')
        )
        .slice(0, 10)
        .map((r: { symbol: string; description: string; displaySymbol: string }) => ({
          symbol: r.symbol,
          name: r.description,
          exchange: 'NYSE',
          currency: 'USD',
        }));
      
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!symbols || !Array.isArray(symbols)) {
      throw new Error('Invalid symbols array');
    }

    console.log(`Fetching data for ${symbols.length} symbols`);

    const stockData = await fetchStocksBatched(symbols, apiKey);

    const successCount = stockData.filter((s) => !(s as { error?: boolean }).error).length;
    console.log(`Successfully fetched ${successCount} stocks`);

    return new Response(JSON.stringify({ stocks: stockData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-stocks function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
