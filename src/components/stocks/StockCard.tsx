import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Stock } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StockCardProps {
  stock: Stock;
  showDetails?: boolean;
}

export function StockCard({ stock, showDetails = false }: StockCardProps) {
  const isPositive = stock.change >= 0;

  return (
    <Link to={`/stock/${stock.symbol}`}>
      <Card className="stat-card group cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="ticker-badge">{stock.symbol}</span>
              <span className="text-xs text-muted-foreground">{stock.exchange}</span>
            </div>
            <h3 className="mt-2 font-medium text-foreground line-clamp-1">
              {stock.name}
            </h3>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold font-mono tabular-nums">
              {stock.currency === 'USD' ? '$' : stock.currency === 'EUR' ? '€' : stock.currency}
              {stock.price.toFixed(2)}
            </p>
            <div
              className={cn(
                'mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-medium',
                isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {isPositive ? '+' : ''}
              {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Market Cap</p>
              <p className="text-sm font-medium font-mono">
                ${(stock.marketCap / 1e9).toFixed(1)}B
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">P/E Ratio</p>
              <p className="text-sm font-medium font-mono">{stock.peRatio.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">52W High</p>
              <p className="text-sm font-medium font-mono">${stock.fiftyTwoWeekHigh.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Div Yield</p>
              <p className="text-sm font-medium font-mono">{stock.dividendYield.toFixed(2)}%</p>
            </div>
          </div>
        )}
      </Card>
    </Link>
  );
}
