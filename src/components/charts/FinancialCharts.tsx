import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';

interface PriceChartProps {
  data: { date: string; price: number; volume: number }[];
  height?: number;
}

export function PriceChart({ data, height = 300 }: PriceChartProps) {
  const formatPrice = (value: number) => `$${value.toFixed(2)}`;
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="chart-container">
      <h3 className="mb-4 text-lg font-semibold">Price History</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="hsl(215, 20%, 55%)"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatPrice}
            stroke="hsl(215, 20%, 55%)"
            fontSize={12}
            tickLine={false}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222, 47%, 10%)',
              border: '1px solid hsl(222, 30%, 16%)',
              borderRadius: '8px',
            }}
            labelFormatter={formatDate}
            formatter={(value: number) => [formatPrice(value), 'Price']}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="hsl(174, 72%, 46%)"
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

interface RevenueChartProps {
  data: { year: number; revenue: number; netIncome: number }[];
  height?: number;
}

export function RevenueChart({ data, height = 300 }: RevenueChartProps) {
  const formatValue = (value: number) => `$${(value / 1000).toFixed(0)}B`;

  return (
    <Card className="chart-container">
      <h3 className="mb-4 text-lg font-semibold">Revenue & Net Income</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data.slice(0, 10).reverse()}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
          <XAxis
            dataKey="year"
            stroke="hsl(215, 20%, 55%)"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatValue}
            stroke="hsl(215, 20%, 55%)"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222, 47%, 10%)',
              border: '1px solid hsl(222, 30%, 16%)',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${(value / 1000).toFixed(1)}B`, '']}
          />
          <Legend />
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill="hsl(174, 72%, 46%)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="netIncome"
            name="Net Income"
            fill="hsl(142, 76%, 36%)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

interface CashFlowChartProps {
  data: { year: number; operatingCashFlow: number; freeCashFlow: number }[];
  height?: number;
}

export function CashFlowChart({ data, height = 300 }: CashFlowChartProps) {
  const formatValue = (value: number) => `$${(value / 1000).toFixed(0)}B`;

  return (
    <Card className="chart-container">
      <h3 className="mb-4 text-lg font-semibold">Cash Flow</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data.slice(0, 10).reverse()}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
          <XAxis
            dataKey="year"
            stroke="hsl(215, 20%, 55%)"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatValue}
            stroke="hsl(215, 20%, 55%)"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222, 47%, 10%)',
              border: '1px solid hsl(222, 30%, 16%)',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${(value / 1000).toFixed(1)}B`, '']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="operatingCashFlow"
            name="Operating CF"
            stroke="hsl(174, 72%, 46%)"
            strokeWidth={2}
            dot={{ fill: 'hsl(174, 72%, 46%)' }}
          />
          <Line
            type="monotone"
            dataKey="freeCashFlow"
            name="Free CF"
            stroke="hsl(38, 92%, 50%)"
            strokeWidth={2}
            dot={{ fill: 'hsl(38, 92%, 50%)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

interface RatiosChartProps {
  data: { name: string; value: number; benchmark: number }[];
  height?: number;
}

export function RatiosChart({ data, height = 300 }: RatiosChartProps) {
  return (
    <Card className="chart-container">
      <h3 className="mb-4 text-lg font-semibold">Key Ratios vs Industry</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
          <XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={12} />
          <YAxis
            dataKey="name"
            type="category"
            stroke="hsl(215, 20%, 55%)"
            fontSize={12}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222, 47%, 10%)',
              border: '1px solid hsl(222, 30%, 16%)',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="value" name="Company" fill="hsl(174, 72%, 46%)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="benchmark" name="Industry" fill="hsl(222, 30%, 30%)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
