import { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Expense, ExpenseCategory } from '@/types/travel';
import { getCurrencySettings, saveCurrencySettings, type CurrencySettings } from '@/lib/storage';

const categoryLabels: Record<ExpenseCategory, string> = {
  food: '🍜 美食',
  transport: '🚗 交通',
  accommodation: '🏨 住宿',
  shopping: '🛍️ 購物',
  entertainment: '🎭 娛樂',
  other: '📦 其他'
};

const currencies = [
  { code: 'HKD', name: '港幣', symbol: 'HK$' },
  { code: 'VND', name: '越南盾', symbol: '₫' },
  { code: 'USD', name: '美元', symbol: '$' },
  { code: 'CNY', name: '人民幣', symbol: '¥' },
  { code: 'TWD', name: '新台幣', symbol: 'NT$' },
  { code: 'JPY', name: '日元', symbol: '¥' },
  { code: 'KRW', name: '韓元', symbol: '₩' },
];

// Approximate exchange rates (base: HKD)
const exchangeRates: Record<string, Record<string, number>> = {
  HKD: { VND: 3050, USD: 0.128, CNY: 0.92, TWD: 4.1, JPY: 19.2, KRW: 170, HKD: 1 },
  VND: { HKD: 0.00033, USD: 0.000042, CNY: 0.0003, TWD: 0.0013, JPY: 0.0063, KRW: 0.056, VND: 1 },
  USD: { HKD: 7.82, VND: 24000, CNY: 7.2, TWD: 32, JPY: 150, KRW: 1330, USD: 1 },
};

interface ExpenseTrackerProps {
  expenses: Expense[];
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onDelete: (id: string) => void;
}

export const ExpenseTracker = ({ expenses, onAdd, onDelete }: ExpenseTrackerProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(getCurrencySettings());
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    currency: currencySettings.baseCurrency,
    category: 'food' as ExpenseCategory
  });
  const [converterAmount, setConverterAmount] = useState('');
  const [converterFrom, setConverterFrom] = useState('HKD');
  const [converterTo, setConverterTo] = useState('VND');

  const convert = (amount: number, from: string, to: string) => {
    if (from === to) return amount;
    const rates = exchangeRates[from];
    if (rates && rates[to]) {
      return amount * rates[to];
    }
    // Fallback through HKD
    const toHKD = exchangeRates[from]?.HKD || 1;
    const fromHKD = exchangeRates.HKD?.[to] || 1;
    return amount * toHKD * fromHKD;
  };

  const convertedAmount = converterAmount 
    ? convert(parseFloat(converterAmount), converterFrom, converterTo)
    : 0;

  const formatCurrency = (amount: number, currency: string) => {
    const curr = currencies.find(c => c.code === currency);
    const formatted = currency === 'VND' 
      ? Math.round(amount).toLocaleString()
      : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${curr?.symbol || ''}${formatted}`;
  };

  const handleAdd = () => {
    if (!newExpense.description || !newExpense.amount) return;
    onAdd({
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      currency: newExpense.currency,
      category: newExpense.category,
      date: new Date().toISOString(),
      convertedAmount: convert(parseFloat(newExpense.amount), newExpense.currency, currencySettings.baseCurrency)
    });
    setNewExpense({
      description: '',
      amount: '',
      currency: currencySettings.baseCurrency,
      category: 'food'
    });
    setIsAddOpen(false);
  };

  const totalInBase = expenses.reduce((sum, exp) => {
    return sum + convert(exp.amount, exp.currency, currencySettings.baseCurrency);
  }, 0);

  const swapCurrencies = () => {
    setConverterFrom(converterTo);
    setConverterTo(converterFrom);
  };

  return (
    <div className="space-y-4">
      {/* Currency Converter */}
      <div className="bg-gradient-tropical rounded-2xl p-5 shadow-glow">
        <h3 className="text-primary-foreground font-semibold mb-3">💱 匯率轉換</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="金額"
              value={converterAmount}
              onChange={(e) => setConverterAmount(e.target.value)}
              className="bg-card/90 border-0"
            />
          </div>
          <Select value={converterFrom} onValueChange={setConverterFrom}>
            <SelectTrigger className="w-24 bg-card/90 border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(c => (
                <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-center my-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={swapCurrencies}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-card/90 rounded-lg px-3 py-2">
            <span className="text-lg font-semibold text-foreground">
              {converterAmount ? formatCurrency(convertedAmount, converterTo) : '0'}
            </span>
          </div>
          <Select value={converterTo} onValueChange={setConverterTo}>
            <SelectTrigger className="w-24 bg-card/90 border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(c => (
                <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Total */}
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">總支出</span>
          <span className="text-2xl font-bold text-foreground">
            {formatCurrency(totalInBase, currencySettings.baseCurrency)}
          </span>
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-2">
        {expenses.map((expense) => (
          <div key={expense.id} className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{categoryLabels[expense.category].split(' ')[0]}</span>
                  <span className="font-medium text-foreground">{expense.description}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(expense.date).toLocaleDateString('zh-TW')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {formatCurrency(expense.amount, expense.currency)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(expense.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {expenses.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <span className="text-4xl">💰</span>
            <p className="mt-2">還沒有記錄支出</p>
          </div>
        )}
      </div>

      {/* Add Button */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-sunset hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            新增支出
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增支出</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">描述</label>
              <Input
                placeholder="輸入描述..."
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">金額</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">貨幣</label>
                <Select 
                  value={newExpense.currency} 
                  onValueChange={(v) => setNewExpense({ ...newExpense, currency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">分類</label>
              <Select 
                value={newExpense.category} 
                onValueChange={(v) => setNewExpense({ ...newExpense, category: v as ExpenseCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleAdd} className="w-full" disabled={!newExpense.description || !newExpense.amount}>
              新增支出
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
