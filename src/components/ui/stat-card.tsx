import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  prefix = '',
  suffix = '',
  icon,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNeutral = change === 0;

  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <p className="mt-2 text-2xl font-bold font-mono tabular-nums">
        {prefix}
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix}
      </p>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1.5">
          <div
            className={cn(
              'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium',
              isNeutral
                ? 'bg-muted text-muted-foreground'
                : isPositive
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            {isNeutral ? (
              <Minus className="h-3 w-3" />
            ) : isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {isPositive ? '+' : ''}
            {change.toFixed(2)}%
          </div>
          {changeLabel && (
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
