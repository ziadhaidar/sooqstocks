import { useState } from 'react';
import { Search, Filter, Globe } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StockCard } from '@/components/stocks/StockCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { popularStocks, europeanStocks } from '@/lib/mockData';

const StockSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [sortBy, setSortBy] = useState('marketCap');

  const allStocks = [...popularStocks, ...europeanStocks];
  
  const sectors = [...new Set(allStocks.map(s => s.sector))];

  const filterAndSort = (stocks: typeof allStocks) => {
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
            return a.peRatio - b.peRatio;
          default:
            return 0;
        }
      });
  };

  const usStocks = filterAndSort(popularStocks);
  const euStocks = filterAndSort(europeanStocks);
  const allFiltered = filterAndSort(allStocks);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Search</h1>
          <p className="mt-1 text-muted-foreground">
            Browse and analyze U.S. and European stocks
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
              All Markets ({allFiltered.length})
            </TabsTrigger>
            <TabsTrigger value="us">
              🇺🇸 U.S. ({usStocks.length})
            </TabsTrigger>
            <TabsTrigger value="eu">
              🇪🇺 Europe ({euStocks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allFiltered.map(stock => (
                <StockCard key={stock.symbol} stock={stock} showDetails />
              ))}
            </div>
            {allFiltered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No stocks found matching your criteria
              </div>
            )}
          </TabsContent>

          <TabsContent value="us" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {usStocks.map(stock => (
                <StockCard key={stock.symbol} stock={stock} showDetails />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="eu" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {euStocks.map(stock => (
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
