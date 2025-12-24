import { useState } from 'react';
import { Search, Filter, Globe, Loader2, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StockCard } from '@/components/stocks/StockCard';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStocks, useUSStocks, useEUStocks } from '@/hooks/useStocks';
import { Stock } from '@/lib/types';

const StockSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [sortBy, setSortBy] = useState('marketCap');

  const { data: allStocks, isLoading, error } = useStocks();
  const { data: usStocksRaw } = useUSStocks();
  const { data: euStocksRaw } = useEUStocks();

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

  if (error || !allStocks) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <AlertCircle className="h-8 w-8 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Failed to load stocks</h2>
          <p className="text-muted-foreground mt-2">Please try again later</p>
        </div>
      </MainLayout>
    );
  }

  // Filter valid stocks (with price > 0)
  const validStocks = allStocks.filter(s => s.price > 0);
  const usStocks = usStocksRaw?.filter(s => s.price > 0) || [];
  const euStocks = euStocksRaw?.filter(s => s.price > 0) || [];

  const sectors = [...new Set(validStocks.map(s => s.sector).filter(Boolean))];

  const filterAndSort = (stocks: Stock[]) => {
    return stocks
      .filter(stock => {
        const matchesSearch =
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSector = sectorFilter === 'all' || stock.sector === sectorFilter;
        return matchesSearch && matchesSector;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'marketCap':
            return b.marketCap - a.marketCap;
          case 'change':
            return b.changePercent - a.changePercent;
          case 'price':
            return b.price - a.price;
          case 'pe':
            return (a.peRatio || 999) - (b.peRatio || 999);
          default:
            return 0;
        }
      });
  };

  const filteredUs = filterAndSort(usStocks);
  const filteredEu = filterAndSort(euStocks);
  const filteredAll = filterAndSort(validStocks);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Search</h1>
          <p className="mt-1 text-muted-foreground">
            Browse and analyze U.S. and European stocks with live data
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by symbol or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-0"
            />
          </div>
          
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-[180px] bg-secondary border-0">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {sectors.map(sector => (
                <SelectItem key={sector} value={sector}>{sector}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-secondary border-0">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="marketCap">Market Cap</SelectItem>
              <SelectItem value="change">% Change</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="pe">P/E Ratio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-secondary">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              All Markets ({filteredAll.length})
            </TabsTrigger>
            <TabsTrigger value="us">
              🇺🇸 U.S. ({filteredUs.length})
            </TabsTrigger>
            <TabsTrigger value="eu">
              🇪🇺 Europe ({filteredEu.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAll.map(stock => (
                <StockCard key={stock.symbol} stock={stock} showDetails />
              ))}
            </div>
            {filteredAll.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No stocks found matching your criteria
              </div>
            )}
          </TabsContent>

          <TabsContent value="us" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUs.map(stock => (
                <StockCard key={stock.symbol} stock={stock} showDetails />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="eu" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEu.map(stock => (
                <StockCard key={stock.symbol} stock={stock} showDetails />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default StockSearch;
