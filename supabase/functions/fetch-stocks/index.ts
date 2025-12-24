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

    const { symbols } = await req.json();
    
    if (!symbols || !Array.isArray(symbols)) {
      throw new Error('Invalid symbols array');
    }

    console.log(`Fetching data for ${symbols.length} symbols`);

    const stockData = await Promise.all(
      symbols.map(async (symbolInfo: { symbol: string; name: string; exchange: string; currency: string }) => {
        try {
          // Fetch quote data
          const quoteRes = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbolInfo.symbol}&token=${apiKey}`
          );
          const quote: FinnhubQuote = await quoteRes.json();

          // Fetch basic metrics (for PE, 52W range, dividend yield, 200 MA)
          const metricRes = await fetch(
            `https://finnhub.io/api/v1/stock/metric?symbol=${symbolInfo.symbol}&metric=all&token=${apiKey}`
          );
          const metrics: FinnhubMetric = await metricRes.json();

          // Fetch company profile for market cap and sector
          const profileRes = await fetch(
            `https://finnhub.io/api/v1/stock/profile2?symbol=${symbolInfo.symbol}&token=${apiKey}`
          );
          const profile: FinnhubProfile = await profileRes.json();

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

          return {
            symbol: symbolInfo.symbol,
            name: profile.name || symbolInfo.name,
            price: quote.c || 0,
            change: quote.d || 0,
            changePercent: quote.dp || 0,
            volume: 0, // Finnhub quote doesn't include volume
            marketCap: (profile.marketCapitalization || 0) * 1000000, // Convert from millions
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
        } catch (error) {
          console.error(`Error fetching ${symbolInfo.symbol}:`, error);
          // Return a placeholder with available info
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
      })
    );

    console.log(`Successfully fetched ${stockData.filter(s => !s.error).length} stocks`);

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
