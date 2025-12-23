import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Calculator, DollarSign, TrendingUp, Info } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { popularStocks, europeanStocks, generateFinancialStatements } from '@/lib/mockData';
import { DCFInputs, DCFResult } from '@/lib/types';
import { cn } from '@/lib/utils';

const DCFCalculator = () => {
  const [searchParams] = useSearchParams();
  const symbolParam = searchParams.get('symbol');

  const allStocks = useMemo(() => [...popularStocks, ...europeanStocks], []);

  const [selectedSymbol, setSelectedSymbol] = useState(symbolParam || 'AAPL');

  const stock = allStocks.find(s => s.symbol === selectedSymbol);
  const financials = useMemo(() => 
    stock ? generateFinancialStatements(stock.symbol) : [],
    [stock?.symbol]
  );

  const latestFCF = financials.length > 0 ? financials[0].freeCashFlow : 10000;
  const sharesOutstanding = stock ? stock.marketCap / stock.price : 1000;

  const [inputs, setInputs] = useState<DCFInputs>({
    freeCashFlow: latestFCF,
    growthRateYear1to5: 15,
    growthRateYear6to10: 8,
    terminalGrowthRate: 2.5,
    discountRate: 10,
    sharesOutstanding: sharesOutstanding / 1000000, // millions
    cashAndEquivalents: latestFCF * 2,
    totalDebt: latestFCF * 0.5,
  });

  const dcfResult = useMemo<DCFResult | null>(() => {
    if (!stock) return null;

    const projectedCashFlows: { year: number; cashFlow: number; discountedCashFlow: number }[] = [];
    let sumDiscountedCF = 0;

    // Project years 1-5
    let fcf = inputs.freeCashFlow;
    for (let year = 1; year <= 5; year++) {
      fcf = fcf * (1 + inputs.growthRateYear1to5 / 100);
      const discountFactor = Math.pow(1 + inputs.discountRate / 100, year);
      const dcf = fcf / discountFactor;
      projectedCashFlows.push({
        year,
        cashFlow: fcf,
        discountedCashFlow: dcf,
      });
      sumDiscountedCF += dcf;
    }

    // Project years 6-10
    for (let year = 6; year <= 10; year++) {
      fcf = fcf * (1 + inputs.growthRateYear6to10 / 100);
      const discountFactor = Math.pow(1 + inputs.discountRate / 100, year);
      const dcf = fcf / discountFactor;
      projectedCashFlows.push({
        year,
        cashFlow: fcf,
        discountedCashFlow: dcf,
      });
      sumDiscountedCF += dcf;
    }

    // Terminal value
    const terminalFCF = fcf * (1 + inputs.terminalGrowthRate / 100);
    const terminalValue = terminalFCF / ((inputs.discountRate - inputs.terminalGrowthRate) / 100);
    const discountedTerminalValue = terminalValue / Math.pow(1 + inputs.discountRate / 100, 10);

    // Enterprise value
    const enterpriseValue = sumDiscountedCF + discountedTerminalValue;

    // Equity value
    const equityValue = enterpriseValue + inputs.cashAndEquivalents - inputs.totalDebt;

    // Intrinsic value per share
    const intrinsicValue = equityValue / inputs.sharesOutstanding;

    // Upside
    const upside = ((intrinsicValue - stock.price) / stock.price) * 100;

    return {
      intrinsicValue,
      currentPrice: stock.price,
      upside,
      projectedCashFlows,
      terminalValue: discountedTerminalValue,
    };
  }, [inputs, stock]);

  const handleInputChange = (field: keyof DCFInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Calculator className="h-8 w-8 text-primary" />
              DCF Calculator
            </h1>
            <p className="mt-1 text-muted-foreground">
              Discounted Cash Flow valuation model
            </p>
          </div>

          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-[250px] bg-secondary border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allStocks.map(s => (
                <SelectItem key={s.symbol} value={s.symbol}>
                  {s.symbol} - {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {stock && dcfResult && (
          <>
            {/* Result Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Intrinsic Value</p>
                <p className="text-3xl font-bold font-mono text-primary mt-2">
                  ${dcfResult.intrinsicValue.toFixed(2)}
                </p>
              </Card>
              <Card className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-3xl font-bold font-mono mt-2">
                  ${dcfResult.currentPrice.toFixed(2)}
                </p>
              </Card>
              <Card
                className={cn(
                  'p-6 text-center',
                  dcfResult.upside >= 0
                    ? 'border-success/30 bg-success/5'
                    : 'border-destructive/30 bg-destructive/5'
                )}
              >
                <p className="text-sm text-muted-foreground">Upside/Downside</p>
                <p
                  className={cn(
                    'text-3xl font-bold font-mono mt-2',
                    dcfResult.upside >= 0 ? 'text-success' : 'text-destructive'
                  )}
                >
                  {dcfResult.upside >= 0 ? '+' : ''}
                  {dcfResult.upside.toFixed(1)}%
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    'mt-2',
                    dcfResult.upside > 20
                      ? 'border-success text-success'
                      : dcfResult.upside < -10
                      ? 'border-destructive text-destructive'
                      : ''
                  )}
                >
                  {dcfResult.upside > 20
                    ? 'Undervalued'
                    : dcfResult.upside < -10
                    ? 'Overvalued'
                    : 'Fair Value'}
                </Badge>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inputs */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Model Inputs
                </h3>

                <div className="space-y-6">
                  <div>
                    <Label className="flex items-center gap-2">
                      Base Free Cash Flow ($M)
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Latest annual free cash flow
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      value={inputs.freeCashFlow}
                      onChange={(e) => handleInputChange('freeCashFlow', parseFloat(e.target.value) || 0)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center justify-between">
                      <span>Growth Rate (Years 1-5)</span>
                      <span className="text-primary font-mono">{inputs.growthRateYear1to5}%</span>
                    </Label>
                    <Slider
                      value={[inputs.growthRateYear1to5]}
                      onValueChange={([v]) => handleInputChange('growthRateYear1to5', v)}
                      min={0}
                      max={40}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center justify-between">
                      <span>Growth Rate (Years 6-10)</span>
                      <span className="text-primary font-mono">{inputs.growthRateYear6to10}%</span>
                    </Label>
                    <Slider
                      value={[inputs.growthRateYear6to10]}
                      onValueChange={([v]) => handleInputChange('growthRateYear6to10', v)}
                      min={0}
                      max={25}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center justify-between">
                      <span>Terminal Growth Rate</span>
                      <span className="text-primary font-mono">{inputs.terminalGrowthRate}%</span>
                    </Label>
                    <Slider
                      value={[inputs.terminalGrowthRate]}
                      onValueChange={([v]) => handleInputChange('terminalGrowthRate', v)}
                      min={0}
                      max={5}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center justify-between">
                      <span>Discount Rate (WACC)</span>
                      <span className="text-primary font-mono">{inputs.discountRate}%</span>
                    </Label>
                    <Slider
                      value={[inputs.discountRate]}
                      onValueChange={([v]) => handleInputChange('discountRate', v)}
                      min={5}
                      max={20}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Cash ($M)</Label>
                      <Input
                        type="number"
                        value={inputs.cashAndEquivalents}
                        onChange={(e) => handleInputChange('cashAndEquivalents', parseFloat(e.target.value) || 0)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Debt ($M)</Label>
                      <Input
                        type="number"
                        value={inputs.totalDebt}
                        onChange={(e) => handleInputChange('totalDebt', parseFloat(e.target.value) || 0)}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Shares Outstanding (M)</Label>
                    <Input
                      type="number"
                      value={inputs.sharesOutstanding}
                      onChange={(e) => handleInputChange('sharesOutstanding', parseFloat(e.target.value) || 0)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>

              {/* Cash Flow Projection Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Projected Cash Flows
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={dcfResult.projectedCashFlows}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                    <XAxis
                      dataKey="year"
                      stroke="hsl(215, 20%, 55%)"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(215, 20%, 55%)"
                      fontSize={12}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}B`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222, 47%, 10%)',
                        border: '1px solid hsl(222, 30%, 16%)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${(value / 1000).toFixed(2)}B`, '']}
                    />
                    <Line
                      type="monotone"
                      dataKey="cashFlow"
                      name="Projected FCF"
                      stroke="hsl(174, 72%, 46%)"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(174, 72%, 46%)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="discountedCashFlow"
                      name="Discounted FCF"
                      stroke="hsl(38, 92%, 50%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: 'hsl(38, 92%, 50%)' }}
                    />
                    <ReferenceLine y={0} stroke="hsl(215, 20%, 55%)" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* View Stock Profile Link */}
            <div className="flex justify-center">
              <Link to={`/stock/${stock.symbol}`}>
                <Button variant="outline" size="lg">
                  View {stock.symbol} Profile
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default DCFCalculator;
