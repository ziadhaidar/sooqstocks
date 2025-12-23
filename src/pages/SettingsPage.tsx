import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Save, Code } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getCustomKPIs, saveCustomKPIs, addCustomKPI, removeCustomKPI } from '@/lib/storage';
import { CustomKPI } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const [customKPIs, setCustomKPIs] = useState<CustomKPI[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newKPI, setNewKPI] = useState({
    name: '',
    formula: '',
    description: '',
  });

  const [settings, setSettings] = useState({
    autoRefresh: true,
    refreshInterval: 60,
    darkMode: true,
    notifications: true,
    alertsEnabled: true,
  });

  const { toast } = useToast();

  useEffect(() => {
    setCustomKPIs(getCustomKPIs());
  }, []);

  const handleAddKPI = () => {
    if (!newKPI.name || !newKPI.formula) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in the name and formula.',
        variant: 'destructive',
      });
      return;
    }

    const kpi: CustomKPI = {
      id: `custom_${Date.now()}`,
      name: newKPI.name,
      formula: newKPI.formula,
      description: newKPI.description,
    };

    addCustomKPI(kpi);
    setCustomKPIs(getCustomKPIs());
    setNewKPI({ name: '', formula: '', description: '' });
    setIsAddDialogOpen(false);

    toast({
      title: 'KPI added',
      description: `${kpi.name} has been added to your custom KPIs.`,
    });
  };

  const handleRemoveKPI = (id: string) => {
    removeCustomKPI(id);
    setCustomKPIs(getCustomKPIs());
    
    toast({
      title: 'KPI removed',
      description: 'The custom KPI has been removed.',
    });
  };

  const availableVariables = [
    'REVENUE',
    'NET_INCOME',
    'FREE_CASH_FLOW',
    'OPERATING_CASH_FLOW',
    'TOTAL_ASSETS',
    'TOTAL_LIABILITIES',
    'SHAREHOLDER_EQUITY',
    'EPS',
    'EPS_GROWTH',
    'MARKET_CAP',
    'PE_RATIO',
    'PRICE',
    'BOOK_VALUE',
    'DIVIDEND_YIELD',
  ];

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Settings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Customize your stock analysis experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Custom KPIs */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Custom KPIs
              </h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gradient-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Add KPI
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Custom KPI</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>KPI Name</Label>
                      <Input
                        placeholder="e.g., PEG Ratio"
                        value={newKPI.name}
                        onChange={(e) => setNewKPI(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Formula</Label>
                      <Input
                        placeholder="e.g., PE_RATIO / EPS_GROWTH"
                        value={newKPI.formula}
                        onChange={(e) => setNewKPI(prev => ({ ...prev, formula: e.target.value }))}
                        className="mt-2 font-mono"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Brief description of this KPI..."
                        value={newKPI.description}
                        onChange={(e) => setNewKPI(prev => ({ ...prev, description: e.target.value }))}
                        className="mt-2"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Available Variables</Label>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {availableVariables.map(v => (
                          <Badge key={v} variant="outline" className="text-xs font-mono">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddKPI}>
                        <Save className="h-4 w-4 mr-2" />
                        Save KPI
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {customKPIs.map((kpi) => (
                <div
                  key={kpi.id}
                  className="flex items-start justify-between p-4 rounded-lg bg-secondary/30"
                >
                  <div>
                    <p className="font-medium text-foreground">{kpi.name}</p>
                    <p className="text-sm text-muted-foreground font-mono mt-1">
                      {kpi.formula}
                    </p>
                    {kpi.description && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {kpi.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveKPI(kpi.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {customKPIs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No custom KPIs defined yet
                </p>
              )}
            </div>
          </Card>

          {/* General Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6">General Settings</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Refresh Data</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically refresh stock prices
                  </p>
                </div>
                <Switch
                  checked={settings.autoRefresh}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, autoRefresh: checked }))
                  }
                />
              </div>

              {settings.autoRefresh && (
                <div>
                  <Label>Refresh Interval (seconds)</Label>
                  <Input
                    type="number"
                    value={settings.refreshInterval}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        refreshInterval: parseInt(e.target.value) || 60,
                      }))
                    }
                    className="mt-2 w-32"
                    min={10}
                    max={300}
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="font-medium">Enable Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive browser notifications
                  </p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, notifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Price Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when prices hit your targets
                  </p>
                </div>
                <Switch
                  checked={settings.alertsEnabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, alertsEnabled: checked }))
                  }
                />
              </div>
            </div>
          </Card>

          {/* Data Sources Info */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Data Sources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-secondary/30">
                <p className="font-medium text-primary">Stock Prices</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Real-time quotes from Yahoo Finance / IEX Cloud
                </p>
                <Badge variant="outline" className="mt-2 text-xs">Free Tier</Badge>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30">
                <p className="font-medium text-primary">Financial Statements</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Quarterly & annual data from SEC filings
                </p>
                <Badge variant="outline" className="mt-2 text-xs">20+ Years History</Badge>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30">
                <p className="font-medium text-primary">Earnings Data</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Estimates & actuals from Finnhub API
                </p>
                <Badge variant="outline" className="mt-2 text-xs">Real-time</Badge>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              💡 Connect to Supabase to enable backend features like real API integrations, alerts persistence, and user accounts.
            </p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
