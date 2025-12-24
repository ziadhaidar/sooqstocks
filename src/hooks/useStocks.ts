import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ALL_SYMBOLS, US_SYMBOLS, EU_SYMBOLS } from '@/lib/symbols';
import { Stock } from '@/lib/types';

async function fetchStocks(): Promise<Stock[]> {
  const { data, error } = await supabase.functions.invoke('fetch-stocks', {
    body: { symbols: ALL_SYMBOLS },
  });

  if (error) {
    console.error('Error fetching stocks:', error);
    throw error;
  }

  return data.stocks as Stock[];
}

export function useStocks() {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: fetchStocks,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 2,
  });
}

export function useUSStocks() {
  const { data: stocks, ...rest } = useStocks();
  
  const usStocks = stocks?.filter(stock => 
    US_SYMBOLS.some(s => s.symbol === stock.symbol)
  );

  return { data: usStocks, ...rest };
}

export function useEUStocks() {
  const { data: stocks, ...rest } = useStocks();
  
  const euStocks = stocks?.filter(stock => 
    EU_SYMBOLS.some(s => s.symbol === stock.symbol)
  );

  return { data: euStocks, ...rest };
}

export function useStock(symbol: string) {
  const { data: stocks, ...rest } = useStocks();
  
  const stock = stocks?.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());

  return { data: stock, ...rest };
}
