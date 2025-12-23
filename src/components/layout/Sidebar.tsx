import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Star,
  Briefcase,
  Calculator,
  Calendar,
  Newspaper,
  Settings,
  TrendingDown,
  LineChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Stock Search', href: '/search', icon: Search },
  { name: 'Watchlist', href: '/watchlist', icon: Star },
  { name: 'Dip Finder', href: '/dips', icon: TrendingDown },
  { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { name: 'DCF Calculator', href: '/dcf', icon: Calculator },
  { name: 'Earnings', href: '/earnings', icon: Calendar },
  { name: 'News', href: '/news', icon: Newspaper },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <LineChart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">StockPulse</h1>
            <p className="text-xs text-muted-foreground">Market Analysis</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary glow-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">
              Data refreshes automatically
            </p>
            <p className="mt-1 text-xs font-medium text-primary">
              Last updated: Just now
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
