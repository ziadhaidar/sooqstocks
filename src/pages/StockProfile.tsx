import { useParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  TrendingUp,
  TrendingDown,
  Building2,
  Globe,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PriceChart, RevenueChart, CashFlowChart, RatiosChart } from '@/components/charts/FinancialCharts';
import {
  popularStocks,
  europeanStocks,
  generateFinancialStatements,
  generateKeyRatios,
  generatePriceHistory,
  sampleNews,
} from '@/lib/mockData';
import { addToWatchlist, getWatchlists } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const StockProfile = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const { toast } = useToast();

  const allStocks = [...popularStocks, ...europeanStocks];
  const stock = allStocks.find(s => s.symbol === symbol);

  const financials = useMemo(() => 
    stock ? generateFinancialStatements(stock.symbol) : [], 
    [stock?.symbol]
  );
  
  const ratios = useMemo(() => 
    stock ? generateKeyRatios(stock) : null, 
    [stock]
  );
  
  const priceHistory = useMemo(() => generatePriceHistory(365), []);
  
  const stockNews = sampleNews.filter(n => n.symbols.includes(symbol || ''));

  const handleAddToWatchlist = () => {
    if (!stock) return;
    const watchlists = getWatchlists();
    if (watchlists.length > 0) {
      addToWatchlist(watchlists[0].id, stock.symbol, stock.name);
      toast({
        title: 'Added to Watchlist',
        description: `${stock.symbol} has been added to your watchlist.`,
      });
    }
  };

  // Generate AI Analysis
  const generateAnalysis = () => {
    if (!stock || !ratios) return '';
    
    const analyses = [];
    
    if (stock.peRatio < 20) {
      analyses.push(`${stock.name} appears undervalued with a P/E ratio of ${stock.peRatio.toFixed(1)}, below the market average.`);
    } else if (stock.peRatio > 30) {
      analyses.push(`${stock.name} trades at a premium with a P/E of ${stock.peRatio.toFixed(1)}, suggesting high growth expectations.`);
    }
    
    if (stock.price < stock.movingAverage200) {
      analyses.push(`The stock is currently trading below its 200-day moving average, indicating potential buying opportunity.`);
    }
    
    if (stock.dividendYield > 2) {
      analyses.push(`With a dividend yield of ${stock.dividendYield.toFixed(2)}%, this stock offers attractive income potential.`);
    }
    
    if (ratios.debtToEquity < 0.5) {
      analyses.push(`Strong balance sheet with debt-to-equity of ${ratios.debtToEquity.toFixed(2)} provides financial flexibility.`);
    }
    
    if (ratios.roe > 0.15) {
      analyses.push(`Return on equity of ${(ratios.roe * 100).toFixed(1)}% demonstrates efficient capital allocation.`);
    }
    
    return analyses.length > 0 
      ? analyses.join(' ') 
      : `${stock.name} shows stable performance with balanced valuation metrics.`;
  };

  if (!stock) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <h1 className="text-2xl font-bold text-foreground">Stock Not Found</h1>
          <p className="mt-2 text-muted-foreground">The symbol {symbol} was not found.</p>
          <Link to="/search">
            <Button className="mt-4">Browse Stocks</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const isPositive = stock.change >= 0;
  const isBelowMA = stock.price < stock.movingAverage200;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Back Link */}
        <Link
          to="/search"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Link>

        {/* Stock Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{stock.symbol}</h1>
              <Badge variant="outline">{stock.exchange}</Badge>
              {isBelowMA && (
                <Badge className="bg-warning/10 text-warning border-warning">
                  Below 200-day MA
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xl text-muted-foreground">{stock.name}</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {stock.sector}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {stock.industry}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleAddToWatchlist}>
              <Star className="h-4 w-4 mr-2" />
              Add to Watchlist
            </Button>
            <Link to={`/dcf?symbol=${stock.symbol}`}>
              <Button className="gradient-primary text-primary-foreground">
                <BarChart3 className="h-4 w-4 mr-2" />
                Run DCF Analysis
              </Button>
            </Link>
          </div>
        </div>

        {/* Price Card */}
        <Card className="p-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-4xl font-bold font-mono tabular-nums mt-1">
                {stock.currency === 'USD' ? '$' : stock.currency === 'EUR' ? '€' : stock.currency}
                {stock.price.toFixed(2)}
              </p>
              <div
                className={cn(
                  'mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-lg font-medium',
                  isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                )}
              >
                {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-lg font-semibold font-mono">${(stock.marketCap / 1e9).toFixed(1)}B</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">P/E Ratio</p>
                <p className="text-lg font-semibold font-mono">{stock.peRatio.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">52W Range</p>
                <p className="text-lg font-semibold font-mono">
                  ${stock.fiftyTwoWeekLow.toFixed(0)} - ${stock.fiftyTwoWeekHigh.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Div Yield</p>
                <p className="text-lg font-semibold font-mono">{stock.dividendYield.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Analysis */}
        <Card className="p-6 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                AI Analysis Summary
                <Badge variant="outline" className="text-xs">Beta</Badge>
              </h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                {generateAnalysis()}
              </p>
            </div>
          </div>
        </Card>

        {/* Charts Tabs */}
        <Tabs defaultValue="price" className="w-full">
          <TabsList className="bg-secondary">
            <TabsTrigger value="price">Price History</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="ratios">Ratios</TabsTrigger>
          </TabsList>

          <TabsContent value="price" className="mt-6">
            <PriceChart data={priceHistory} height={400} />
          </TabsContent>

          <TabsContent value="financials" className="mt-6">
            <RevenueChart 
              data={financials.map(f => ({
                year: f.year,
                revenue: f.revenue,
                netIncome: f.netIncome,
              }))} 
              height={400} 
            />
          </TabsContent>

          <TabsContent value="cashflow" className="mt-6">
            <CashFlowChart 
              data={financials.map(f => ({
                year: f.year,
                operatingCashFlow: f.operatingCashFlow,
                freeCashFlow: f.freeCashFlow,
              }))} 
              height={400} 
            />
          </TabsContent>

          <TabsContent value="ratios" className="mt-6">
            {ratios && (
              <RatiosChart
                data={[
                  { name: 'P/E Ratio', value: ratios.peRatio, benchmark: 22 },
                  { name: 'P/B Ratio', value: ratios.pbRatio, benchmark: 4 },
                  { name: 'ROE %', value: ratios.roe * 100, benchmark: 15 },
                  { name: 'Net Margin %', value: ratios.netMargin * 100, benchmark: 12 },
                  { name: 'Debt/Equity', value: ratios.debtToEquity, benchmark: 0.8 },
                ]}
                height={350}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Key Metrics Grid */}
        {ratios && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">P/E Ratio</p>
              <p className="text-xl font-bold font-mono mt-1">{ratios.peRatio.toFixed(1)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">P/B Ratio</p>
              <p className="text-xl font-bold font-mono mt-1">{ratios.pbRatio.toFixed(2)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">EV/EBITDA</p>
              <p className="text-xl font-bold font-mono mt-1">{ratios.evToEbitda.toFixed(1)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">ROE</p>
              <p className="text-xl font-bold font-mono mt-1">{(ratios.roe * 100).toFixed(1)}%</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Net Margin</p>
              <p className="text-xl font-bold font-mono mt-1">{(ratios.netMargin * 100).toFixed(1)}%</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">D/E Ratio</p>
              <p className="text-xl font-bold font-mono mt-1">{ratios.debtToEquity.toFixed(2)}</p>
            </Card>
          </div>
        )}

        {/* Related News */}
        {stockNews.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Related News</h3>
            <div className="space-y-4">
              {stockNews.map(news => (
                <div key={news.id} className="p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={
                        news.sentiment === 'positive'
                          ? 'border-success text-success'
                          : news.sentiment === 'negative'
                          ? 'border-destructive text-destructive'
                          : ''
                      }
                    >
                      {news.sentiment}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{news.source}</span>
                  </div>
                  <h4 className="font-medium">{news.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{news.summary}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default StockProfile;
