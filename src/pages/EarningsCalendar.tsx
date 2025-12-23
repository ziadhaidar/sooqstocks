import { Calendar, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { upcomingEarnings, recentEarnings } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const EarningsCalendar = () => {
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Earnings Calendar
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track upcoming and recent earnings releases
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="bg-secondary">
            <TabsTrigger value="upcoming">
              <Clock className="h-4 w-4 mr-2" />
              Upcoming ({upcomingEarnings.length})
            </TabsTrigger>
            <TabsTrigger value="recent">
              <TrendingUp className="h-4 w-4 mr-2" />
              Recent Results ({recentEarnings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEarnings.map((event) => (
                <Card key={`${event.symbol}-${event.date}`} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="ticker-badge">{event.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {event.time}
                        </Badge>
                      </div>
                      <h3 className="mt-2 font-medium text-foreground">{event.companyName}</h3>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">EPS Est.</p>
                      <p className="text-lg font-bold font-mono">${event.epsEstimate.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rev Est.</p>
                      <p className="text-lg font-bold font-mono">{formatCurrency(event.revenueEstimate)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            <div className="space-y-4">
              {recentEarnings.map((event) => {
                const epsSurprise = event.epsActual && event.epsEstimate
                  ? ((event.epsActual - event.epsEstimate) / event.epsEstimate) * 100
                  : 0;
                const revSurprise = event.revenueActual && event.revenueEstimate
                  ? ((event.revenueActual - event.revenueEstimate) / event.revenueEstimate) * 100
                  : 0;
                const epsBeat = epsSurprise > 0;
                const revBeat = revSurprise > 0;

                return (
                  <Card key={`${event.symbol}-${event.date}`} className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="ticker-badge text-lg">{event.symbol}</span>
                        <div>
                          <h3 className="font-semibold text-foreground">{event.companyName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Reported: {new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Badge
                          className={cn(
                            epsBeat
                              ? 'bg-success/10 text-success border-success'
                              : 'bg-destructive/10 text-destructive border-destructive'
                          )}
                        >
                          {epsBeat ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          EPS {epsBeat ? 'Beat' : 'Miss'}
                        </Badge>
                        <Badge
                          className={cn(
                            revBeat
                              ? 'bg-success/10 text-success border-success'
                              : 'bg-destructive/10 text-destructive border-destructive'
                          )}
                        >
                          {revBeat ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          Revenue {revBeat ? 'Beat' : 'Miss'}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">EPS Estimate</p>
                        <p className="text-xl font-bold font-mono">${event.epsEstimate.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">EPS Actual</p>
                        <p className={cn(
                          'text-xl font-bold font-mono',
                          epsBeat ? 'text-success' : 'text-destructive'
                        )}>
                          ${event.epsActual?.toFixed(2)}
                          <span className="text-sm ml-2">
                            ({epsSurprise >= 0 ? '+' : ''}{epsSurprise.toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue Est.</p>
                        <p className="text-xl font-bold font-mono">{formatCurrency(event.revenueEstimate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue Actual</p>
                        <p className={cn(
                          'text-xl font-bold font-mono',
                          revBeat ? 'text-success' : 'text-destructive'
                        )}>
                          {event.revenueActual ? formatCurrency(event.revenueActual) : 'N/A'}
                          <span className="text-sm ml-2">
                            ({revSurprise >= 0 ? '+' : ''}{revSurprise.toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default EarningsCalendar;
