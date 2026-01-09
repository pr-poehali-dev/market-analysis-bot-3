import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CurrencyPair {
  id: string;
  name: string;
  price: number;
  change: number;
  volatility: number;
  signalType: 'BUY' | 'SELL' | 'HOLD';
  probability: number;
  expiration: string;
}

interface Trade {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  openPrice: number;
  closePrice: number;
  profit: number;
  timestamp: string;
  expiration: string;
}

const Index = () => {
  const [botActive, setBotActive] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [pocketOptionId, setPocketOptionId] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const [currencyPairs, setCurrencyPairs] = useState<CurrencyPair[]>([
    { id: '1', name: 'EUR/USD', price: 1.0875, change: 0.34, volatility: 72, signalType: 'BUY', probability: 87, expiration: '2m' },
    { id: '2', name: 'GBP/USD', price: 1.2634, change: -0.21, volatility: 65, signalType: 'SELL', probability: 82, expiration: '1m' },
    { id: '3', name: 'USD/JPY', price: 149.32, change: 0.18, volatility: 58, signalType: 'BUY', probability: 76, expiration: '2m' },
    { id: '4', name: 'AUD/USD', price: 0.6521, change: 0.45, volatility: 81, signalType: 'BUY', probability: 91, expiration: '1m' },
    { id: '5', name: 'USD/CHF', price: 0.8834, change: -0.12, volatility: 48, signalType: 'HOLD', probability: 62, expiration: '2m' },
    { id: '6', name: 'EUR/GBP', price: 0.8605, change: 0.28, volatility: 69, signalType: 'BUY', probability: 79, expiration: '1m' },
  ]);

  const [trades, setTrades] = useState<Trade[]>([
    { id: '1', pair: 'EUR/USD', type: 'BUY', openPrice: 1.0850, closePrice: 1.0875, profit: 25, timestamp: '14:32:15', expiration: '2m' },
    { id: '2', pair: 'GBP/USD', type: 'SELL', openPrice: 1.2650, closePrice: 1.2634, profit: 16, timestamp: '14:30:42', expiration: '1m' },
    { id: '3', pair: 'USD/JPY', type: 'BUY', openPrice: 149.40, closePrice: 149.32, profit: -8, timestamp: '14:28:10', expiration: '2m' },
  ]);

  const [activePosition, setActivePosition] = useState<CurrencyPair | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrencyPairs(prev => prev.map(pair => ({
        ...pair,
        price: pair.price + (Math.random() - 0.5) * 0.01,
        change: parseFloat((pair.change + (Math.random() - 0.5) * 0.1).toFixed(2)),
        volatility: Math.min(100, Math.max(30, pair.volatility + (Math.random() - 0.5) * 5)),
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0);
  const winRate = ((trades.filter(t => t.profit > 0).length / trades.length) * 100).toFixed(1);

  const topSignal = [...currencyPairs].sort((a, b) => b.probability - a.probability)[0];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Icon name="TrendingUp" className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Trading Terminal</h1>
              <p className="text-sm text-muted-foreground">Pocket Option Auto Trading Bot</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Icon name="Settings" size={18} />
                  Настройки
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Настройки подключения</DialogTitle>
                  <DialogDescription>
                    Настройте параметры подключения к Pocket Option
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="pocket-id">Pocket Option ID</Label>
                    <Input
                      id="pocket-id"
                      placeholder="Введите ваш ID"
                      value={pocketOptionId}
                      onChange={(e) => setPocketOptionId(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="connect-toggle">Подключение активно</Label>
                    <Switch
                      id="connect-toggle"
                      checked={isConnected}
                      onCheckedChange={setIsConnected}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Лимит убытка</Label>
                    <Input type="number" defaultValue="5" />
                    <p className="text-xs text-muted-foreground">Бот остановится при убытке $5</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Интервал открытия сделки</Label>
                    <Input type="number" defaultValue="1" />
                    <p className="text-xs text-muted-foreground">Минуты между сделками</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-lg border">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${botActive ? 'bg-success animate-pulse' : 'bg-muted'}`}></div>
                <span className="text-sm font-medium">{botActive ? 'Активен' : 'Остановлен'}</span>
              </div>
              <Switch checked={botActive} onCheckedChange={setBotActive} />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Баланс</span>
              <Icon name="DollarSign" size={18} className="text-primary" />
            </div>
            <div className="font-mono text-3xl font-bold">${balance.toFixed(2)}</div>
            <div className={`text-sm mt-1 ${totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} сегодня
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Win Rate</span>
              <Icon name="Target" size={18} className="text-success" />
            </div>
            <div className="font-mono text-3xl font-bold">{winRate}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              {trades.filter(t => t.profit > 0).length}/{trades.length} сделок
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Активная позиция</span>
              <Icon name="Activity" size={18} className="text-primary" />
            </div>
            <div className="font-mono text-3xl font-bold">{activePosition ? '1' : '0'}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {activePosition ? activePosition.name : 'Нет позиций'}
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Топ сигнал</span>
              <Icon name="Zap" size={18} className="text-yellow-500" />
            </div>
            <div className="font-mono text-xl font-bold">{topSignal?.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={topSignal?.signalType === 'BUY' ? 'default' : 'destructive'} className="text-xs">
                {topSignal?.signalType}
              </Badge>
              <span className="text-sm text-muted-foreground">{topSignal?.probability}%</span>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="signals" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="signals">Сигналы</TabsTrigger>
            <TabsTrigger value="pairs">Валютные пары</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
          </TabsList>

          <TabsContent value="signals" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="TrendingUp" size={20} />
                Лучшие торговые сигналы
              </h3>
              <div className="space-y-3">
                {[...currencyPairs]
                  .sort((a, b) => b.probability - a.probability)
                  .slice(0, 4)
                  .map((pair) => (
                    <div
                      key={pair.id}
                      className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-semibold font-mono text-lg">{pair.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Волатильность: {pair.volatility}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-mono text-xl font-bold">{pair.price.toFixed(4)}</div>
                          <div className={`text-sm ${pair.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {pair.change >= 0 ? '+' : ''}{pair.change}%
                          </div>
                        </div>

                        <div className="text-center">
                          <Badge
                            variant={pair.signalType === 'BUY' ? 'default' : pair.signalType === 'SELL' ? 'destructive' : 'secondary'}
                            className="mb-1"
                          >
                            {pair.signalType}
                          </Badge>
                          <div className="text-xs text-muted-foreground">{pair.expiration}</div>
                        </div>

                        <div className="w-24">
                          <div className="text-center mb-1">
                            <span className="text-2xl font-bold font-mono">{pair.probability}%</span>
                          </div>
                          <Progress value={pair.probability} className="h-2" />
                        </div>

                        <Button
                          size="sm"
                          variant={pair.signalType === 'BUY' ? 'default' : 'destructive'}
                          disabled={!botActive || pair.signalType === 'HOLD'}
                          onClick={() => setActivePosition(pair)}
                        >
                          <Icon name="Play" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pairs" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="BarChart3" size={20} />
                Мониторинг валютных пар
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {currencyPairs.map((pair) => (
                  <div
                    key={pair.id}
                    className="p-4 bg-accent/30 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold font-mono text-lg">{pair.name}</div>
                      <Badge
                        variant={pair.signalType === 'BUY' ? 'default' : pair.signalType === 'SELL' ? 'destructive' : 'secondary'}
                      >
                        {pair.signalType}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Цена</div>
                        <div className="font-mono text-xl font-bold">{pair.price.toFixed(4)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Изменение</div>
                        <div className={`font-mono text-xl font-bold ${pair.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {pair.change >= 0 ? '+' : ''}{pair.change}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Волатильность</div>
                        <Progress value={pair.volatility} className="h-2 mt-2" />
                        <div className="text-xs text-muted-foreground mt-1">{pair.volatility}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Вероятность</div>
                        <Progress value={pair.probability} className="h-2 mt-2" />
                        <div className="text-xs text-muted-foreground mt-1">{pair.probability}%</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">
                      Экспирация: {pair.expiration}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="Clock" size={20} />
                История сделок
              </h3>
              <div className="space-y-2">
                {trades.map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'}>
                        {trade.type}
                      </Badge>
                      <div>
                        <div className="font-semibold font-mono">{trade.pair}</div>
                        <div className="text-xs text-muted-foreground">Экспирация: {trade.expiration}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Открытие</div>
                        <div className="font-mono text-sm">{trade.openPrice.toFixed(4)}</div>
                      </div>
                      <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Закрытие</div>
                        <div className="font-mono text-sm">{trade.closePrice.toFixed(4)}</div>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <div className={`font-mono text-lg font-bold ${trade.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}$
                        </div>
                        <div className="text-xs text-muted-foreground">{trade.timestamp}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
