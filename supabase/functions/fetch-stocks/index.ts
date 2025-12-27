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

// In-memory cache with 5-minute TTL
const cache: Map<string, CacheEntry> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
// With 60 stocks, 1 call each = 60 calls, just within limit
const BATCH_SIZE = 5; // Process 5 symbols at a time
const BATCH_DELAY = 1500; // 1.5 seconds between batches

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        console.log('Rate limited, waiting 3s...');
        await sleep(3000);
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

async function fetchSymbolQuote(
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
    // Only fetch quote data (1 API call per stock)
    const quoteRes = await fetchWithRetry(
      `https://finnhub.io/api/v1/quote?symbol=${symbolInfo.symbol}&token=${apiKey}`
    );
    const quote: FinnhubQuote = await quoteRes.json();

    // Basic stock data from quote only
    const stockData = {
      symbol: symbolInfo.symbol,
      name: symbolInfo.name,
      price: quote.c || 0,
      change: quote.d || 0,
      changePercent: quote.dp || 0,
      volume: 0,
      marketCap: 0,
      peRatio: 0,
      dividendYield: 0,
      fiftyTwoWeekHigh: quote.h || 0,
      fiftyTwoWeekLow: quote.l || 0,
      movingAverage200: quote.pc || quote.c || 0, // Use prev close as proxy
      sector: 'Technology', // Default sector
      industry: 'Unknown',
      exchange: symbolInfo.exchange,
      currency: symbolInfo.currency,
    };

    if (quote.c && quote.c > 0) {
      setCache(cacheKey, stockData);
    }
    
    return stockData;
  } catch (error) {
    console.error(`Error fetching ${symbolInfo.symbol}:`, error);
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
  const totalBatches = Math.ceil(symbols.length / BATCH_SIZE);
  
  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const batch = symbols.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.map(s => s.symbol).join(', ')})`);
    
    const batchResults = await Promise.all(
      batch.map(symbol => fetchSymbolQuote(symbol, apiKey))
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
      
      const results = (searchData.result || [])
        .filter((r: { type: string; displaySymbol: string }) => 
          r.type === 'Common Stock' && 
          !r.displaySymbol.includes('.')
        )
        .slice(0, 10)
        .map((r: { symbol: string; description: string }) => ({
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
    const startTime = Date.now();

    const stockData = await fetchStocksBatched(symbols, apiKey);

    const successCount = stockData.filter((s) => !(s as { error?: boolean }).error).length;
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Completed: ${successCount}/${symbols.length} stocks in ${duration}s`);

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
