import { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { SectorAllocation } from '@/components/charts/SectorAllocation';
import { StatCard } from '@/components/ui/stat-card';
import { popularStocks, europeanStocks, upcomingDividends, sectorColors } from '@/lib/mockData';
import { getPortfolios, savePortfolios, addHolding } from '@/lib/storage';
import { Portfolio, PortfolioHolding } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const PortfolioPage = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newHolding, setNewHolding] = useState({
    symbol: '',
    shares: '',
    avgCost: '',
  });
  const { toast } = useToast();

  const allStocks = useMemo(() => [...popularStocks, ...europeanStocks], []);

  useEffect(() => {
    const list = getPortfolios();
    setPortfolios(list);
    if (list.length > 0 && !selectedPortfolio) {
      setSelectedPortfolio(list[0].id);
    }
  }, []);

  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio);

  const portfolioStats = useMemo(() => {
    if (!currentPortfolio) return null;

    let totalValue = 0;
    let totalCost = 0;
    let totalDailyChange = 0;
    let totalDividends = 0;

    const holdingsWithData = currentPortfolio.holdings.map(holding => {
      const stockData = allStocks.find(s => s.symbol === holding.symbol);
      const currentPrice = stockData?.price || holding.currentPrice;
      const value = holding.shares * currentPrice;
      const cost = holding.shares * holding.avgCost;
      const gain = value - cost;
      const gainPercent = (gain / cost) * 100;
      const dailyChange = stockData ? holding.shares * stockData.change : 0;
      const annualDividend = value * (holding.dividendYield / 100);

      totalValue += value;
      totalCost += cost;
      totalDailyChange += dailyChange;
      totalDividends += annualDividend;

      return {
        ...holding,
        currentPrice,
        value,
        cost,
        gain,
        gainPercent,
        dailyChange,
        annualDividend,
      };
    });

    const totalGain = totalValue - totalCost;
    const totalGainPercent = (totalGain / totalCost) * 100;
    const dailyChangePercent = (totalDailyChange / totalValue) * 100;
    const portfolioYield = (totalDividends / totalValue) * 100;

    // Sector breakdown
    const sectorData: Record<string, number> = {};
    holdingsWithData.forEach(h => {
      sectorData[h.sector] = (sectorData[h.sector] || 0) + h.value;
    });
    
    const sectorBreakdown = Object.entries(sectorData)
      .map(([sector, value]) => ({
        sector,
        value,
        percentage: (value / totalValue) * 100,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      holdings: holdingsWithData,
      totalValue,
      totalCost,
      totalGain,
      totalGainPercent,
      totalDailyChange,
      dailyChangePercent,
      totalDividends,
      portfolioYield,
      sectorBreakdown,
    };
  }, [currentPortfolio, allStocks]);

  const handleAddHolding = () => {
    const stock = allStocks.find(
      s => s.symbol.toLowerCase() === newHolding.symbol.toLowerCase()
    );

    if (!stock) {
      toast({
        title: 'Stock not found',
        description: 'Please enter a valid stock symbol.',
        variant: 'destructive',
      });
      return;
    }

    const shares = parseFloat(newHolding.shares);
    const avgCost = parseFloat(newHolding.avgCost);

    if (isNaN(shares) || shares <= 0 || isNaN(avgCost) || avgCost <= 0) {
      toast({
        title: 'Invalid input',
        description: 'Please enter valid shares and cost.',
        variant: 'destructive',
      });
      return;
    }

    const holding: PortfolioHolding = {
      symbol: stock.symbol,
      name: stock.name,
      shares,
      avgCost,
      currentPrice: stock.price,
      dividendYield: stock.dividendYield,
      sector: stock.sector,
      purchaseDate: new Date().toISOString().split('T')[0],
    };

    addHolding(selectedPortfolio, holding);
    setPortfolios(getPortfolios());
    setNewHolding({ symbol: '', shares: '', avgCost: '' });
    setIsAddDialogOpen(false);

    toast({
      title: 'Holding added',
      description: `${stock.symbol} has been added to your portfolio.`,
    });
  };

  // Filter dividends for portfolio holdings
  const portfolioDividends = useMemo(() => {
    if (!currentPortfolio) return [];
    const symbols = currentPortfolio.holdings.map(h => h.symbol);
    return upcomingDividends.filter(d => symbols.includes(d.symbol));
  }, [currentPortfolio]);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-primary" />
              Portfolio Tracker
            </h1>
            <p className="mt-1 text-muted-foreground">
              Track your investments and dividends
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
              <SelectTrigger className="w-[200px] bg-secondary border-0">
                <SelectValue placeholder="Select portfolio" />
              </SelectTrigger>
              <SelectContent>
                {portfolios.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Holding
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Holding</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Stock Symbol</label>
                    <Input
                      placeholder="e.g., AAPL"
                      value={newHolding.symbol}
                      onChange={(e) => setNewHolding(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Number of Shares</label>
                    <Input
                      type="number"
                      placeholder="e.g., 100"
                      value={newHolding.shares}
                      onChange={(e) => setNewHolding(prev => ({ ...prev, shares: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Average Cost per Share</label>
                    <Input
                      type="number"
                      placeholder="e.g., 150.00"
                      value={newHolding.avgCost}
                      onChange={(e) => setNewHolding(prev => ({ ...prev, avgCost: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddHolding}>Add Holding</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {portfolioStats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Value"
                value={(portfolioStats.totalValue).toFixed(2)}
                prefix="$"
                change={portfolioStats.dailyChangePercent}
                changeLabel="today"
                icon={<DollarSign className="h-5 w-5" />}
              />
              <StatCard
                title="Total Gain/Loss"
                value={Math.abs(portfolioStats.totalGain).toFixed(2)}
                prefix={portfolioStats.totalGain >= 0 ? '+$' : '-$'}
                change={portfolioStats.totalGainPercent}
                changeLabel="all time"
                icon={portfolioStats.totalGain >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              />
              <StatCard
                title="Annual Dividends"
                value={portfolioStats.totalDividends.toFixed(2)}
                prefix="$"
                icon={<Calendar className="h-5 w-5" />}
              />
              <StatCard
                title="Portfolio Yield"
                value={portfolioStats.portfolioYield.toFixed(2)}
                suffix="%"
                icon={<PieChart className="h-5 w-5" />}
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="holdings" className="w-full">
              <TabsList className="bg-secondary">
                <TabsTrigger value="holdings">Holdings</TabsTrigger>
                <TabsTrigger value="allocation">Sector Allocation</TabsTrigger>
                <TabsTrigger value="dividends">Dividend Calendar</TabsTrigger>
              </TabsList>

              <TabsContent value="holdings" className="mt-6">
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="text-left p-4 font-medium text-muted-foreground">Symbol</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Company</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Shares</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Avg Cost</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Price</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Value</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Gain/Loss</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">Today</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {portfolioStats.holdings.map((holding) => (
                          <tr key={holding.symbol} className="hover:bg-secondary/30 transition-colors">
                            <td className="p-4">
                              <span className="ticker-badge">{holding.symbol}</span>
                            </td>
                            <td className="p-4 text-foreground">{holding.name}</td>
                            <td className="p-4 text-right font-mono">{holding.shares}</td>
                            <td className="p-4 text-right font-mono">${holding.avgCost.toFixed(2)}</td>
                            <td className="p-4 text-right font-mono">${holding.currentPrice.toFixed(2)}</td>
                            <td className="p-4 text-right font-mono font-medium">${holding.value.toFixed(2)}</td>
                            <td className="p-4 text-right">
                              <div className={cn(
                                'font-mono font-medium',
                                holding.gain >= 0 ? 'text-success' : 'text-destructive'
                              )}>
                                {holding.gain >= 0 ? '+' : ''}${holding.gain.toFixed(2)}
                                <span className="block text-xs">
                                  ({holding.gainPercent.toFixed(2)}%)
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <span className={cn(
                                'font-mono',
                                holding.dailyChange >= 0 ? 'text-success' : 'text-destructive'
                              )}>
                                {holding.dailyChange >= 0 ? '+' : ''}${holding.dailyChange.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-secondary/30 font-medium">
                        <tr>
                          <td colSpan={5} className="p-4 text-right">Total</td>
                          <td className="p-4 text-right font-mono">${portfolioStats.totalValue.toFixed(2)}</td>
                          <td className="p-4 text-right">
                            <span className={cn(
                              'font-mono',
                              portfolioStats.totalGain >= 0 ? 'text-success' : 'text-destructive'
                            )}>
                              {portfolioStats.totalGain >= 0 ? '+' : ''}${portfolioStats.totalGain.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className={cn(
                              'font-mono',
                              portfolioStats.totalDailyChange >= 0 ? 'text-success' : 'text-destructive'
                            )}>
                              {portfolioStats.totalDailyChange >= 0 ? '+' : ''}${portfolioStats.totalDailyChange.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="allocation" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SectorAllocation data={portfolioStats.sectorBreakdown} height={350} />
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Sector Breakdown</h3>
                    <div className="space-y-3">
                      {portfolioStats.sectorBreakdown.map((sector) => (
                        <div key={sector.sector} className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: sectorColors[sector.sector] || 'gray' }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{sector.sector}</span>
                              <span className="text-sm font-mono">{sector.percentage.toFixed(1)}%</span>
                            </div>
                            <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${sector.percentage}%`,
                                  backgroundColor: sectorColors[sector.sector] || 'gray',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="dividends" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Dividends
                  </h3>
                  {portfolioDividends.length > 0 ? (
                    <div className="space-y-4">
                      {portfolioDividends.map((div) => {
                        const holding = currentPortfolio?.holdings.find(h => h.symbol === div.symbol);
                        const expectedPayment = holding ? holding.shares * div.amount : 0;
                        
                        return (
                          <div
                            key={`${div.symbol}-${div.exDate}`}
                            className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                          >
                            <div className="flex items-center gap-4">
                              <span className="ticker-badge">{div.symbol}</span>
                              <div>
                                <p className="font-medium">{div.companyName}</p>
                                <p className="text-sm text-muted-foreground">
                                  Ex-Date: {new Date(div.exDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-medium text-success">
                                +${expectedPayment.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ${div.amount}/share
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No upcoming dividends for your holdings
                    </p>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {(!currentPortfolio || currentPortfolio.holdings.length === 0) && (
          <Card className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No holdings yet</h3>
            <p className="text-muted-foreground mt-2">
              Add your first holding to start tracking your portfolio
            </p>
            <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Holding
            </Button>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default PortfolioPage;
