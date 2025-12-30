import { useState } from 'react';
import { Search, Plus, Loader2, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSymbolSearch, useFetchStock } from '@/hooks/useStocks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { addToWatchlist, getWatchlists } from '@/lib/storage';

export function SymbolSearch() {
  const [inputValue, setInputValue] = useState('');
  const { data: results, isLoading, search } = useSymbolSearch();
  const fetchStock = useFetchStock();
  const navigate = useNavigate();

  const handleSearch = (value: string) => {
    setInputValue(value);
    if (value.length >= 1) {
      search(value);
    }
  };

  const handleAddStock = async (result: { symbol: string; name: string; exchange: string; currency: string }) => {
    try {
      await fetchStock.mutateAsync({
        symbol: result.symbol,
        name: result.name,
        exchange: result.exchange,
        currency: result.currency,
        region: 'US',
      });
      toast.success(`${result.symbol} added to your stock list`);
      navigate(`/stock/${result.symbol}`);
    } catch (error) {
      toast.error(`Failed to fetch ${result.symbol}`);
    }
  };

  const handleAddToWatchlist = (result: { symbol: string; name: string }) => {
    const watchlists = getWatchlists();
    const defaultWatchlist = watchlists[0];
    if (defaultWatchlist) {
      const exists = defaultWatchlist.items.some(item => item.symbol === result.symbol);
      if (exists) {
        toast.info(`${result.symbol} is already in your watchlist`);
      } else {
        addToWatchlist(defaultWatchlist.id, result.symbol, result.name);
        toast.success(`${result.symbol} added to watchlist`);
      }
    }
  };

  return (
    <Card className="bg-secondary/50 border-0">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Find Any Stock</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Search for stocks not in our predefined list
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by symbol (e.g., NFLX, UBER)..."
                value={inputValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-background border-border/50"
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {results && results.length > 0 && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {results.slice(0, 8).map((result) => (
                <div
                  key={`${result.symbol}-${result.exchange}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{result.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {result.exchange}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{result.name}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddToWatchlist(result)}
                      title="Add to Watchlist"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddStock(result)}
                      disabled={fetchStock.isPending}
                      title="Run DCF Analysis"
                    >
                      {fetchStock.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          DCF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {inputValue.length >= 1 && !isLoading && results?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No results found for "{inputValue}"
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
