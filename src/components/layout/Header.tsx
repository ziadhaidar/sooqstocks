import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { popularStocks, europeanStocks } from '@/lib/mockData';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof popularStocks>([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const allStocks = [...popularStocks, ...europeanStocks];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const results = allStocks.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results.slice(0, 5));
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSelectStock = (symbol: string) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(`/stock/${symbol}`);
  };

  return (
    <header className="fixed right-0 top-0 z-30 h-16 w-[calc(100%-16rem)] border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search stocks by symbol or name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="pl-10 bg-secondary border-0 focus-visible:ring-primary"
          />
          
          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-border bg-popover shadow-xl animate-fade-in">
              {searchResults.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleSelectStock(stock.symbol)}
                  className="flex w-full items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="ticker-badge">{stock.symbol}</span>
                    <span className="text-sm text-foreground">{stock.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-medium">
                      ${stock.price.toFixed(2)}
                    </span>
                    <span
                      className={`ml-2 text-xs ${
                        stock.change >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {stock.change >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Market Status */}
          <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-success">Market Open</span>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2">
                <h4 className="font-semibold mb-2">Notifications</h4>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                  <span className="font-medium">AAPL hit price alert</span>
                  <span className="text-xs text-muted-foreground">Price reached $180.00</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                  <span className="font-medium">TSLA below 200-day MA</span>
                  <span className="text-xs text-muted-foreground">Potential dip detected</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                  <span className="font-medium">MSFT earnings tomorrow</span>
                  <span className="text-xs text-muted-foreground">After market close</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
