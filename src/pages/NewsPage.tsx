import { useState } from 'react';
import { Newspaper, ExternalLink, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sampleNews } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const NewsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');

  const filteredNews = sampleNews.filter(news => {
    const matchesSearch =
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.symbols.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSentiment =
      sentimentFilter === 'all' || news.sentiment === sentimentFilter;

    return matchesSearch && matchesSentiment;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Newspaper className="h-8 w-8 text-primary" />
            Market News
          </h1>
          <p className="mt-1 text-muted-foreground">
            Stay updated with the latest market news and analysis
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Input
              type="text"
              placeholder="Search news by keyword or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-secondary border-0"
            />
          </div>
          
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-[180px] bg-secondary border-0">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiment</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* News Feed */}
        <div className="space-y-4">
          {filteredNews.map((news) => (
            <Card
              key={news.id}
              className="p-6 hover:bg-secondary/30 transition-colors cursor-pointer"
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {news.symbols.map((symbol) => (
                      <span key={symbol} className="ticker-badge text-xs">
                        {symbol}
                      </span>
                    ))}
                    <Badge
                      variant="outline"
                      className={cn(
                        news.sentiment === 'positive'
                          ? 'border-success text-success'
                          : news.sentiment === 'negative'
                          ? 'border-destructive text-destructive'
                          : 'border-muted-foreground text-muted-foreground'
                      )}
                    >
                      {news.sentiment}
                    </Badge>
                  </div>

                  <h2 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                    {news.title}
                  </h2>
                  
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {news.summary}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium">{news.source}</span>
                      <span>•</span>
                      <span>
                        {new Date(news.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Read more
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredNews.length === 0 && (
            <Card className="p-12 text-center">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No news found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search or filter criteria
              </p>
            </Card>
          )}
        </div>

        {/* RSS Info */}
        <Card className="p-4 bg-secondary/30">
          <p className="text-sm text-muted-foreground text-center">
            💡 Tip: News data is refreshed automatically. For real-time updates, consider connecting to a live news API like Finnhub or NewsAPI.
          </p>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NewsPage;
