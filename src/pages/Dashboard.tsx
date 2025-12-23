import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  BarChart3,
  Clock,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StockCard } from '@/components/stocks/StockCard';
import { StatCard } from '@/components/ui/stat-card';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { popularStocks, europeanStocks, upcomingEarnings, sampleNews } from '@/lib/mockData';

const Dashboard = () => {
  // Calculate market summary
  const allStocks = [...popularStocks, ...europeanStocks];
  const gainers = allStocks.filter(s => s.change > 0).sort((a, b) => b.changePercent - a.changePercent);
  const losers = allStocks.filter(s => s.change < 0).sort((a, b) => a.changePercent - b.changePercent);
  
  const totalMarketCap = allStocks.reduce((sum, s) => sum + s.marketCap, 0);
  const avgChange = allStocks.reduce((sum, s) => sum + s.changePercent, 0) / allStocks.length;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Market Overview</h1>
          <p className="mt-1 text-muted-foreground">
            Track market trends and discover investment opportunities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Market Cap"
            value={(totalMarketCap / 1e12).toFixed(2)}
            prefix="$"
            suffix="T"
            change={avgChange}
            changeLabel="today"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatCard
            title="Active Stocks"
            value={allStocks.length}
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <StatCard
            title="Gainers"
            value={gainers.length}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="Losers"
            value={losers.length}
            icon={<TrendingDown className="h-5 w-5" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Gainers */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Top Gainers
              </h2>
              <Link to="/search" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {gainers.slice(0, 5).map((stock) => (
                <Link
                  key={stock.symbol}
                  to={`/stock/${stock.symbol}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="ticker-badge">{stock.symbol}</span>
                    <span className="text-sm text-foreground truncate max-w-[120px]">
                      {stock.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-medium">
                      ${stock.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-success font-medium">
                      +{stock.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Top Losers */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                Top Losers
              </h2>
              <Link to="/search" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {losers.slice(0, 5).map((stock) => (
                <Link
                  key={stock.symbol}
                  to={`/stock/${stock.symbol}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="ticker-badge">{stock.symbol}</span>
                    <span className="text-sm text-foreground truncate max-w-[120px]">
                      {stock.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-medium">
                      ${stock.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-destructive font-medium">
                      {stock.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Upcoming Earnings */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Upcoming Earnings
              </h2>
              <Link to="/earnings" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingEarnings.slice(0, 5).map((event) => (
                <div
                  key={event.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="ticker-badge">{event.symbol}</span>
                    <div>
                      <p className="text-sm text-foreground">{event.companyName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {event.time}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Featured Stocks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Featured Stocks</h2>
            <Link to="/search" className="text-sm text-primary hover:underline">
              Browse all stocks
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularStocks.slice(0, 4).map((stock) => (
              <StockCard key={stock.symbol} stock={stock} showDetails />
            ))}
          </div>
        </div>

        {/* Latest News */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Market News
            </h2>
            <Link to="/news" className="text-sm text-primary hover:underline">
              View all news
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleNews.slice(0, 4).map((news) => (
              <div
                key={news.id}
                className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  {news.symbols.map((symbol) => (
                    <span key={symbol} className="ticker-badge text-xs">
                      {symbol}
                    </span>
                  ))}
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
                </div>
                <h3 className="font-medium text-foreground line-clamp-2">
                  {news.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {news.summary}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{news.source}</span>
                  <span>
                    {new Date(news.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
