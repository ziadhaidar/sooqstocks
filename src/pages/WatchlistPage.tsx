import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Plus,
  Trash2,
  Bell,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { popularStocks, europeanStocks } from '@/lib/mockData';
import { getWatchlists, saveWatchlists, removeFromWatchlist } from '@/lib/storage';
import { Watchlist, WatchlistItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const WatchlistPage = () => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const { toast } = useToast();

  const allStocks = useMemo(() => [...popularStocks, ...europeanStocks], []);

  useEffect(() => {
    const lists = getWatchlists();
    setWatchlists(lists);
    if (lists.length > 0 && !selectedWatchlist) {
      setSelectedWatchlist(lists[0].id);
    }
  }, []);

  const currentWatchlist = watchlists.find(w => w.id === selectedWatchlist);

  const getStockData = (symbol: string) => {
    return allStocks.find(s => s.symbol === symbol);
  };

  const handleAddStock = () => {
    const stock = allStocks.find(
      s => s.symbol.toLowerCase() === newSymbol.toLowerCase()
    );
    
    if (!stock) {
      toast({
        title: 'Stock not found',
        description: 'Please enter a valid stock symbol.',
        variant: 'destructive',
      });
      return;
    }

    if (currentWatchlist?.items.find(item => item.symbol === stock.symbol)) {
      toast({
        title: 'Already in watchlist',
        description: `${stock.symbol} is already in your watchlist.`,
        variant: 'destructive',
      });
      return;
    }

    const updatedWatchlists = watchlists.map(w => {
      if (w.id === selectedWatchlist) {
        return {
          ...w,
          items: [
            ...w.items,
            {
              symbol: stock.symbol,
              name: stock.name,
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
    setIsAddDialogOpen(false);
    
    toast({
      title: 'Stock added',
      description: `${stock.symbol} has been added to your watchlist.`,
    });
  };

  const handleRemoveStock = (symbol: string) => {
    if (!selectedWatchlist) return;
    
    removeFromWatchlist(selectedWatchlist, symbol);
    const updatedLists = getWatchlists();
    setWatchlists(updatedLists);
    
    toast({
      title: 'Stock removed',
      description: `${symbol} has been removed from your watchlist.`,
    });
  };

  const checkDip = (stock: ReturnType<typeof getStockData>) => {
    if (!stock) return { isDip: false, reason: '' };
    
    if (stock.price < stock.movingAverage200) {
      return { isDip: true, reason: 'Below 200-day MA' };
    }
    
    if (stock.price < stock.fiftyTwoWeekHigh * 0.9) {
      const dropPercent = ((stock.fiftyTwoWeekHigh - stock.price) / stock.fiftyTwoWeekHigh) * 100;
      return { isDip: true, reason: `${dropPercent.toFixed(1)}% below 52W high` };
    }
    
    return { isDip: false, reason: '' };
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Star className="h-8 w-8 text-warning" />
              Watchlist
            </h1>
            <p className="mt-1 text-muted-foreground">
              Track your favorite stocks and get alerts
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedWatchlist} onValueChange={setSelectedWatchlist}>
              <SelectTrigger className="w-[200px] bg-secondary border-0">
                <SelectValue placeholder="Select watchlist" />
              </SelectTrigger>
              <SelectContent>
                {watchlists.map(w => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name} ({w.items.length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                  <Input
                    placeholder="Enter stock symbol (e.g., AAPL)"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStock()}
                  />
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

        {/* Watchlist Table */}
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
                    <th className="text-center p-4 font-medium text-muted-foreground">Alerts</th>
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
                            {item.name}
                          </Link>
                        </td>
                        <td className="p-4 text-right font-mono">
                          ${stock?.price.toFixed(2) || 'N/A'}
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
                          ${stock?.fiftyTwoWeekHigh.toFixed(2) || 'N/A'}
                        </td>
                        <td className="p-4 text-center">
                          {dip.isDip ? (
                            <Badge className="bg-warning/10 text-warning border-warning">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {dip.reason}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Bell className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveStock(item.symbol)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
              Add stocks to track their performance and get alerts
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
                <div className="rounded-lg bg-success/10 p-2">
                  <TrendingDown className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Potential Dips</p>
                  <p className="text-2xl font-bold">
                    {currentWatchlist.items.filter(item => checkDip(getStockData(item.symbol)).isDip).length}
                  </p>
                </div>
              </div>
            </Card>
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
                  <Bell className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default WatchlistPage;
