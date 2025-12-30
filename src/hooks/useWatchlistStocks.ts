import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getWatchlists } from '@/lib/storage';
import { Stock } from '@/lib/types';

async function fetchWatchlistStocks(): Promise<Stock[]> {
  const watchlists = getWatchlists();
  const allSymbols = watchlists.flatMap(w => w.items.map(item => ({
    symbol: item.symbol,
    name: item.name,
    exchange: 'US' // Default to US, can be enhanced
  })));

  // Remove duplicates
  const uniqueSymbols = Array.from(
    new Map(allSymbols.map(s => [s.symbol, s])).values()
  );

  if (uniqueSymbols.length === 0) {
    return [];
  }

  const { data, error } = await supabase.functions.invoke('fetch-stocks', {
    body: { symbols: uniqueSymbols },
  });

  if (error) {
    console.error('Error fetching watchlist stocks:', error);
    throw error;
  }

  return data || [];
}

export function useWatchlistStocks() {
  return useQuery({
    queryKey: ['watchlistStocks'],
    queryFn: fetchWatchlistStocks,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
