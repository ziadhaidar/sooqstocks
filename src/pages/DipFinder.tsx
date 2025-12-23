import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, AlertTriangle, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { popularStocks, europeanStocks } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const DipFinder = () => {
  const allStocks = useMemo(() => [...popularStocks, ...europeanStocks], []);

  const dips = useMemo(() => {
    return allStocks
      .map(stock => {
        const reasons: string[] = [];
        
        if (stock.price < stock.movingAverage200) {
          const percentBelow = ((stock.movingAverage200 - stock.price) / stock.movingAverage200) * 100;
          reasons.push(`${percentBelow.toFixed(1)}% below 200-day MA`);
        }
        
        const dropFrom52WH = ((stock.fiftyTwoWeekHigh - stock.price) / stock.fiftyTwoWeekHigh) * 100;
        if (dropFrom52WH > 10) {
          reasons.push(`${dropFrom52WH.toFixed(1)}% below 52W high`);
        }
        
        if (stock.changePercent < -3) {
          reasons.push(`Down ${Math.abs(stock.changePercent).toFixed(1)}% today`);
        }
        
        return {
          stock,
          reasons,
          severity: reasons.length >= 2 ? 'high' : reasons.length === 1 ? 'medium' : 'low',
          score: dropFrom52WH + (stock.price < stock.movingAverage200 ? 20 : 0),
        };
      })
      .filter(d => d.reasons.length > 0)
      .sort((a, b) => b.score - a.score);
  }, [allStocks]);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <TrendingDown className="h-8 w-8 text-warning" />
            Dip Finder
          </h1>
          <p className="mt-1 text-muted-foreground">
            Discover stocks trading below key technical levels
          </p>
        </div>

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
                      <p className="font-mono font-medium">${stock.movingAverage200.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">52W High</p>
                      <p className="font-mono font-medium">${stock.fiftyTwoWeekHigh.toFixed(2)}</p>
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
              All tracked stocks are trading above key technical levels
            </p>
          </Card>
        )}

        {/* Summary Stats */}
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
      </div>
    </MainLayout>
  );
};

export default DipFinder;
