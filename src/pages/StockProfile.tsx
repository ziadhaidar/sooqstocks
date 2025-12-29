import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  TrendingUp,
  TrendingDown,
  Building2,
  Globe,
  BarChart3,
  Sparkles,
  Loader2,
  AlertCircle,
  ExternalLink,
  Calendar,
  Info,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sampleNews } from '@/lib/mockData';
import { useDetailedStock } from '@/hooks/useStocks';
import { addToWatchlist, getWatchlists } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const StockProfile = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const { data: stock, isLoading, error } = useDetailedStock(symbol || '');

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
    } else {
      toast({
        title: 'No Watchlist',
        description: 'Create a watchlist first to add stocks.',
        variant: 'destructive',
      });
    }
  };

  // Generate AI Analysis based on real data
  const generateAnalysis = () => {
    if (!stock) return '';
    
    const analyses = [];
    
    if (stock.peRatio > 0 && stock.peRatio < 20) {
      analyses.push(`${stock.name} appears undervalued with a P/E ratio of ${stock.peRatio.toFixed(1)}, below the market average.`);
    } else if (stock.peRatio > 30) {
      analyses.push(`${stock.name} trades at a premium with a P/E of ${stock.peRatio.toFixed(1)}, suggesting high growth expectations.`);
    }
    
    if (stock.fiftyTwoWeekHigh > 0 && stock.fiftyTwoWeekLow > 0) {
      const range = stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow;
      const position = ((stock.price - stock.fiftyTwoWeekLow) / range) * 100;
      if (position < 30) {
        analyses.push(`Trading near 52-week lows at ${position.toFixed(0)}% of the range could present a buying opportunity.`);
      } else if (position > 70) {
        analyses.push(`Trading near 52-week highs at ${position.toFixed(0)}% of the range.`);
      }
    }
    
    if (stock.dividendYield > 2) {
      analyses.push(`With a dividend yield of ${stock.dividendYield.toFixed(2)}%, this stock offers attractive income potential.`);
    }
    
    if (stock.roe && stock.roe > 15) {
      analyses.push(`Return on equity of ${stock.roe.toFixed(1)}% demonstrates efficient capital allocation.`);
    }
    
    if (stock.netMargin && stock.netMargin > 20) {
      analyses.push(`Strong net profit margin of ${stock.netMargin.toFixed(1)}% indicates pricing power and operational efficiency.`);
    }
    
    return analyses.length > 0 
      ? analyses.join(' ') 
      : `${stock.name} shows stable performance. Additional fundamental analysis is recommended.`;
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading stock data...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !stock) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <AlertCircle className="h-8 w-8 text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Stock Not Found</h1>
          <p className="mt-2 text-muted-foreground">The symbol {symbol} was not found or failed to load.</p>
          <Link to="/search">
            <Button className="mt-4">Browse Stocks</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const isPositive = stock.change >= 0;

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
            </div>
            <p className="mt-1 text-xl text-muted-foreground">{stock.name}</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {stock.sector}
              </span>
              {stock.weburl && (
                <a 
                  href={stock.weburl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {stock.ipo && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  IPO: {stock.ipo}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button variant="outline" onClick={handleAddToWatchlist}>
                <Star className="h-4 w-4 mr-2" />
                Add to Watchlist
              </Button>
            )}
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
                <p className="text-lg font-semibold font-mono">
                  {stock.marketCap > 0 ? formatMarketCap(stock.marketCap) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">P/E Ratio</p>
                <p className="text-lg font-semibold font-mono">
                  {stock.peRatio > 0 ? stock.peRatio.toFixed(1) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">52W Range</p>
                <p className="text-lg font-semibold font-mono">
                  {stock.fiftyTwoWeekLow > 0 && stock.fiftyTwoWeekHigh > 0 
                    ? `$${stock.fiftyTwoWeekLow.toFixed(2)} - $${stock.fiftyTwoWeekHigh.toFixed(2)}`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Div Yield</p>
                <p className="text-lg font-semibold font-mono">
                  {stock.dividendYield > 0 ? `${stock.dividendYield.toFixed(2)}%` : '0%'}
                </p>
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

        {/* Key Metrics Grid - Real Data Only */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Market Cap</p>
              <p className="text-xl font-bold font-mono mt-1">
                {stock.marketCap > 0 ? formatMarketCap(stock.marketCap) : 'N/A'}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">P/E Ratio</p>
              <p className="text-xl font-bold font-mono mt-1">
                {stock.peRatio > 0 ? stock.peRatio.toFixed(1) : 'N/A'}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Dividend Yield</p>
              <p className="text-xl font-bold font-mono mt-1">
                {stock.dividendYield > 0 ? `${stock.dividendYield.toFixed(2)}%` : '0%'}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">ROE</p>
              <p className="text-xl font-bold font-mono mt-1">
                {stock.roe && stock.roe > 0 ? `${stock.roe.toFixed(1)}%` : 'N/A'}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Net Margin</p>
              <p className="text-xl font-bold font-mono mt-1">
                {stock.netMargin && stock.netMargin > 0 ? `${stock.netMargin.toFixed(1)}%` : 'N/A'}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Volume (10D Avg)</p>
              <p className="text-xl font-bold font-mono mt-1">
                {stock.volume > 0 ? `${(stock.volume / 1e6).toFixed(1)}M` : 'N/A'}
              </p>
            </Card>
          </div>
        </div>

        {/* 52-Week Range Visual */}
        {stock.fiftyTwoWeekLow > 0 && stock.fiftyTwoWeekHigh > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">52-Week Price Range</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Low: ${stock.fiftyTwoWeekLow.toFixed(2)}</span>
                <span className="text-muted-foreground">High: ${stock.fiftyTwoWeekHigh.toFixed(2)}</span>
              </div>
              <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-primary/30 rounded-full"
                  style={{ width: '100%' }}
                />
                <div 
                  className="absolute top-0 h-full w-1 bg-primary rounded-full transform -translate-x-1/2"
                  style={{ 
                    left: `${Math.min(100, Math.max(0, ((stock.price - stock.fiftyTwoWeekLow) / (stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow)) * 100))}%` 
                  }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Current: ${stock.price.toFixed(2)} ({((stock.price - stock.fiftyTwoWeekLow) / (stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow) * 100).toFixed(0)}% of range)
              </p>
            </div>
          </Card>
        )}

        {/* Data Availability Notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Stock data is fetched in real-time from market data providers. Historical charts and detailed financial statements 
            require a premium data subscription and are not currently available.
          </AlertDescription>
        </Alert>

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