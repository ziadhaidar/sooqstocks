import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ALL_SYMBOLS, US_SYMBOLS, EU_SYMBOLS, SymbolInfo } from '@/lib/symbols';
import { Stock } from '@/lib/types';
import { useState, useCallback } from 'react';

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
    staleTime: 30 * 1000, // 30 seconds - data considered fresh
    gcTime: 60 * 60 * 1000, // 1 hour cache
    refetchInterval: 45 * 1000, // Refetch every 45 seconds
    retry: 2,
    refetchOnWindowFocus: false, // Prevent excessive refetches
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

// On-demand symbol search for stocks not in predefined list
interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
}

async function searchSymbols(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 1) return [];
  
  const { data, error } = await supabase.functions.invoke('fetch-stocks', {
    body: { search: query },
  });

  if (error) {
    console.error('Error searching symbols:', error);
    throw error;
  }

  return data.results as SearchResult[];
}

export function useSymbolSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const query = useQuery({
    queryKey: ['symbolSearch', searchQuery],
    queryFn: () => searchSymbols(searchQuery),
    enabled: searchQuery.length >= 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    ...query,
    search,
    searchQuery,
  };
}

// Fetch a single stock on-demand (for stocks not in predefined list)
async function fetchSingleStock(symbolInfo: SymbolInfo): Promise<Stock> {
  const { data, error } = await supabase.functions.invoke('fetch-stocks', {
    body: { symbols: [symbolInfo] },
  });

  if (error) {
    console.error('Error fetching single stock:', error);
    throw error;
  }

  return data.stocks[0] as Stock;
}

export function useFetchStock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fetchSingleStock,
    onSuccess: (stock) => {
      // Add to the stocks cache
      queryClient.setQueryData<Stock[]>(['stocks'], (oldData) => {
        if (!oldData) return [stock];
        const exists = oldData.some(s => s.symbol === stock.symbol);
        if (exists) {
          return oldData.map(s => s.symbol === stock.symbol ? stock : s);
        }
        return [...oldData, stock];
      });
    },
  });
}
