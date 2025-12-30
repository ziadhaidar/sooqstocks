import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingDown, 
  AlertTriangle, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Star,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useWatchlistStocks } from '@/hooks/useWatchlistStocks';
import { getWatchlists, saveWatchlists, removeFromWatchlist } from '@/lib/storage';
import { Watchlist, Stock } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

const DipFinder = () => {
  const { data: watchlistStocks, isLoading, error, refetch, isFetching } = useWatchlistStocks();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setWatchlists(getWatchlists());
  }, []);

  const currentWatchlist = watchlists[0]; // Use first watchlist
  
  // Get stock data from live fetched data
  const getStockData = (symbol: string): Stock | undefined => {
    return watchlistStocks?.find(s => s.symbol === symbol);
  };

  const handleAddStock = () => {
    if (!newSymbol.trim()) {
      toast({
        title: 'Symbol required',
        description: 'Please enter a stock symbol.',
        variant: 'destructive',
      });
      return;
    }

    if (currentWatchlist?.items.find(item => item.symbol.toUpperCase() === newSymbol.toUpperCase())) {
      toast({
        title: 'Already in watchlist',
        description: `${newSymbol.toUpperCase()} is already in your watchlist.`,
        variant: 'destructive',
      });
      return;
    }

    const updatedWatchlists = watchlists.map(w => {
      if (w.id === currentWatchlist?.id) {
        return {
          ...w,
          items: [
            ...w.items,
            {
              symbol: newSymbol.toUpperCase(),
              name: newName || newSymbol.toUpperCase(),
              addedAt: new Date().toISOString(),
            },
          ],
        };
      }
      return w;
    });

    setWatchlists(updatedWatchlists);
    saveWatchlists(updatedWatchlists);
    setNewSymbol('');
    setNewName('');
    setIsAddDialogOpen(false);
    
    // Refetch stock data
    queryClient.invalidateQueries({ queryKey: ['watchlistStocks'] });
    
    toast({
      title: 'Stock added',
      description: `${newSymbol.toUpperCase()} has been added to your watchlist.`,
    });
  };

  const handleRemoveStock = (symbol: string) => {
    if (!currentWatchlist) return;
    
    removeFromWatchlist(currentWatchlist.id, symbol);
    setWatchlists(getWatchlists());
    queryClient.invalidateQueries({ queryKey: ['watchlistStocks'] });
    
    toast({
      title: 'Stock removed',
      description: `${symbol} has been removed from your watchlist.`,
    });
  };

  const dips = useMemo(() => {
    if (!watchlistStocks || watchlistStocks.length === 0) return [];
    
    const validStocks = watchlistStocks.filter(s => s.price > 0);
    
    return validStocks
      .map(stock => {
        const reasons: string[] = [];
        
        if (stock.movingAverage200 > 0 && stock.price < stock.movingAverage200) {
          const percentBelow = ((stock.movingAverage200 - stock.price) / stock.movingAverage200) * 100;
          reasons.push(`${percentBelow.toFixed(1)}% below 200-day MA`);
        }
        
        if (stock.fiftyTwoWeekHigh > 0) {
          const dropFrom52WH = ((stock.fiftyTwoWeekHigh - stock.price) / stock.fiftyTwoWeekHigh) * 100;
          if (dropFrom52WH > 10) {
            reasons.push(`${dropFrom52WH.toFixed(1)}% below 52W high`);
          }
        }
        
        if (stock.changePercent < -3) {
          reasons.push(`Down ${Math.abs(stock.changePercent).toFixed(1)}% today`);
        }
        
        const dropFrom52WH = stock.fiftyTwoWeekHigh > 0 
          ? ((stock.fiftyTwoWeekHigh - stock.price) / stock.fiftyTwoWeekHigh) * 100 
          : 0;
        
        return {
          stock,
          reasons,
          severity: reasons.length >= 2 ? 'high' : reasons.length === 1 ? 'medium' : 'low',
          score: dropFrom52WH + (stock.movingAverage200 > 0 && stock.price < stock.movingAverage200 ? 20 : 0),
        };
      })
      .filter(d => d.reasons.length > 0)
      .sort((a, b) => b.score - a.score);
  }, [watchlistStocks]);

  const checkDip = (stock: Stock | undefined) => {
    if (!stock) return { isDip: false, reason: '' };
    
    if (stock.movingAverage200 > 0 && stock.price < stock.movingAverage200) {
      return { isDip: true, reason: 'Below 200-day MA' };
    }
    
    if (stock.fiftyTwoWeekHigh > 0 && stock.price < stock.fiftyTwoWeekHigh * 0.9) {
      const dropPercent = ((stock.fiftyTwoWeekHigh - stock.price) / stock.fiftyTwoWeekHigh) * 100;
      return { isDip: true, reason: `${dropPercent.toFixed(1)}% below 52W high` };
    }
    
    return { isDip: false, reason: '' };
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading watchlist data...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <AlertCircle className="h-8 w-8 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Failed to load stock data</h2>
          <p className="text-muted-foreground mt-2">Please try again later</p>
          <Button className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-warning" />
              Dip Finder
            </h1>
            <p className="mt-1 text-muted-foreground">
              Track your watchlist and find buying opportunities (live data)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
              Refresh
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Stock to Watchlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Symbol</label>
                    <Input
                      placeholder="e.g., AAPL, MSFT, NVDA"
                      value={newSymbol}
                      onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name (optional)</label>
                    <Input
                      placeholder="e.g., Apple Inc."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddStock()}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddStock}>Add</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="watchlist" className="space-y-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="watchlist" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Star className="h-4 w-4 mr-2" />
              Watchlist ({currentWatchlist?.items.length || 0})
            </TabsTrigger>
            <TabsTrigger value="dips" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingDown className="h-4 w-4 mr-2" />
              Dips ({dips.length})
            </TabsTrigger>
          </TabsList>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist" className="space-y-4">
            {currentWatchlist && currentWatchlist.items.length > 0 ? (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="text-left p-4 font-medium text-muted-foreground">Symbol</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Company</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Price</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Change</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">52W High</th>
                        <th className="text-center p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {currentWatchlist.items.map((item) => {
                        const stock = getStockData(item.symbol);
                        const dip = checkDip(stock);
                        
                        return (
                          <tr key={item.symbol} className="hover:bg-secondary/30 transition-colors">
                            <td className="p-4">
                              <Link to={`/stock/${item.symbol}`}>
                                <span className="ticker-badge hover:bg-primary/20 transition-colors">
                                  {item.symbol}
                                </span>
                              </Link>
                            </td>
                            <td className="p-4">
                              <Link to={`/stock/${item.symbol}`} className="hover:text-primary transition-colors">
                                {stock?.name || item.name}
                              </Link>
                            </td>
                            <td className="p-4 text-right font-mono">
                              {stock ? `$${stock.price.toFixed(2)}` : 'Loading...'}
                            </td>
                            <td className="p-4 text-right">
                              {stock && (
                                <span
                                  className={cn(
                                    'font-mono font-medium',
                                    stock.change >= 0 ? 'text-success' : 'text-destructive'
                                  )}
                                >
                                  {stock.change >= 0 ? '+' : ''}
                                  {stock.changePercent.toFixed(2)}%
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right font-mono">
                              {stock && stock.fiftyTwoWeekHigh > 0 ? `$${stock.fiftyTwoWeekHigh.toFixed(2)}` : 'N/A'}
                            </td>
                            <td className="p-4 text-center">
                              {dip.isDip ? (
                                <Badge className="bg-warning/10 text-warning border-warning">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {dip.reason}
                                </Badge>
                              ) : stock ? (
                                <Badge variant="outline" className="text-success border-success">
                                  OK
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveStock(item.symbol)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Your watchlist is empty</h3>
                <p className="text-muted-foreground mt-2">
                  Add stocks to track their performance and find dips
                </p>
                <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Stock
                </Button>
              </Card>
            )}

            {/* Quick Stats */}
            {currentWatchlist && currentWatchlist.items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tracked Stocks</p>
                      <p className="text-2xl font-bold">{currentWatchlist.items.length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-warning/10 p-2">
                      <TrendingDown className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Potential Dips</p>
                      <p className="text-2xl font-bold">{dips.length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-destructive/10 p-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">High Severity</p>
                      <p className="text-2xl font-bold text-destructive">
                        {dips.filter(d => d.severity === 'high').length}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Dips Tab */}
          <TabsContent value="dips" className="space-y-4">
            {/* Legend */}
            <Card className="p-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-sm text-muted-foreground">High severity (2+ signals)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-sm text-muted-foreground">Medium severity (1 signal)</span>
                </div>
              </div>
            </Card>

            {/* Dips Grid */}
            {dips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dips.map(({ stock, reasons, severity }) => (
                  <Link key={stock.symbol} to={`/stock/${stock.symbol}`}>
                    <Card
                      className={cn(
                        'p-5 transition-all duration-200 hover:glow-primary cursor-pointer',
                        severity === 'high' 
                          ? 'border-destructive/30 bg-destructive/5' 
                          : 'border-warning/30 bg-warning/5'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="ticker-badge">{stock.symbol}</span>
                            <Badge variant="outline" className="text-xs">{stock.exchange}</Badge>
                          </div>
                          <h3 className="mt-2 font-medium text-foreground">{stock.name}</h3>
                        </div>
                        <div
                          className={cn(
                            'rounded-full p-1.5',
                            severity === 'high' ? 'bg-destructive/10' : 'bg-warning/10'
                          )}
                        >
                          <AlertTriangle
                            className={cn(
                              'h-4 w-4',
                              severity === 'high' ? 'text-destructive' : 'text-warning'
                            )}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold font-mono">
                            ${stock.price.toFixed(2)}
                          </p>
                          <p className={cn(
                            'text-sm font-medium',
                            stock.change >= 0 ? 'text-success' : 'text-destructive'
                          )}>
                            {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex flex-wrap gap-2">
                          {reasons.map((reason, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={cn(
                                'text-xs',
                                severity === 'high' 
                                  ? 'border-destructive/50 text-destructive' 
                                  : 'border-warning/50 text-warning'
                              )}
                            >
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">200-day MA</p>
                          <p className="font-mono font-medium">
                            {stock.movingAverage200 > 0 ? `$${stock.movingAverage200.toFixed(2)}` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">52W High</p>
                          <p className="font-mono font-medium">
                            {stock.fiftyTwoWeekHigh > 0 ? `$${stock.fiftyTwoWeekHigh.toFixed(2)}` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No dips detected</h3>
                <p className="text-muted-foreground mt-2">
                  {currentWatchlist?.items.length === 0 
                    ? 'Add stocks to your watchlist to find dips'
                    : 'All watched stocks are trading above key technical levels'
                  }
                </p>
              </Card>
            )}

            {/* Dip Summary */}
            {dips.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Dip Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Dips Found</p>
                    <p className="text-2xl font-bold text-foreground">{dips.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">High Severity</p>
                    <p className="text-2xl font-bold text-destructive">
                      {dips.filter(d => d.severity === 'high').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Below 200-day MA</p>
                    <p className="text-2xl font-bold text-warning">
                      {dips.filter(d => d.reasons.some(r => r.includes('200-day'))).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Below 52W High 10%+</p>
                    <p className="text-2xl font-bold text-primary">
                      {dips.filter(d => d.reasons.some(r => r.includes('52W high'))).length}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DipFinder;
