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
  LogOut,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, adminOnly: false },
    { name: 'Stock Search', href: '/search', icon: Search, adminOnly: false },
    { name: 'Watchlist', href: '/watchlist', icon: Star, adminOnly: true },
    { name: 'Dip Finder', href: '/dips', icon: TrendingDown, adminOnly: false },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase, adminOnly: true },
    { name: 'DCF Calculator', href: '/dcf', icon: Calculator, adminOnly: false },
    { name: 'Earnings', href: '/earnings', icon: Calendar, adminOnly: false },
    { name: 'News', href: '/news', icon: Newspaper, adminOnly: false },
    { name: 'Settings', href: '/settings', icon: Settings, adminOnly: true },
  ];

  const visibleNavigation = navigation.filter(item => !item.adminOnly || isAdmin);

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

        {/* User Info */}
        <div className="px-3 py-3 border-b border-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
            {isAdmin && <Shield className="h-4 w-4 text-primary" />}
            <span className="text-sm font-medium text-foreground">{user?.username}</span>
            {isAdmin && (
              <span className="text-xs text-primary ml-auto">Admin</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleNavigation.map((item) => {
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
        <div className="border-t border-border p-4 space-y-3">
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">
              Live data from Finnhub
            </p>
            <p className="mt-1 text-xs font-medium text-primary">
              Refreshes every 5 min
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
