import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { sectorColors } from '@/lib/mockData';

interface SectorAllocationProps {
  data: { sector: string; value: number; percentage: number }[];
  height?: number;
}

export function SectorAllocation({ data, height = 300 }: SectorAllocationProps) {
  return (
    <Card className="chart-container">
      <h3 className="mb-4 text-lg font-semibold">Sector Allocation</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="sector"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={sectorColors[entry.sector] || 'hsl(222, 30%, 30%)'}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222, 47%, 10%)',
              border: '1px solid hsl(222, 30%, 16%)',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string, props: any) => [
              `$${value.toLocaleString()} (${props.payload.percentage.toFixed(1)}%)`,
              name,
            ]}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
