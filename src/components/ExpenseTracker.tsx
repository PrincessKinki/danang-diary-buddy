import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowRightLeft, DollarSign, Edit2, Check, GripVertical, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Expense, ExpenseCategory } from '@/types/travel';
import { getCurrencySettings, getTripInfo, type CurrencySettings } from '@/lib/storage';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  { code: 'THB', name: '泰銖', symbol: '฿' },
];

// Destination to currency mapping
const destinationCurrencyMap: Record<string, string> = {
  'vietnam': 'VND',
  'da nang': 'VND',
  'hanoi': 'VND',
  'ho chi minh': 'VND',
  'japan': 'JPY',
  'tokyo': 'JPY',
  'korea': 'KRW',
  'seoul': 'KRW',
  'thailand': 'THB',
  'bangkok': 'THB',
  'taiwan': 'TWD',
  'taipei': 'TWD',
  'hong kong': 'HKD',
  'china': 'CNY',
  'singapore': 'USD',
  'malaysia': 'USD',
};

const getCurrencyForDestination = (destination: string): string => {
  const lowerDest = destination.toLowerCase();
  for (const [key, currency] of Object.entries(destinationCurrencyMap)) {
    if (lowerDest.includes(key)) {
      return currency;
    }
  }
  return 'USD';
};

// Approximate exchange rates (base: HKD)
const exchangeRates: Record<string, Record<string, number>> = {
  HKD: { VND: 3050, USD: 0.128, CNY: 0.92, TWD: 4.1, JPY: 19.2, KRW: 170, HKD: 1, THB: 4.6 },
  VND: { HKD: 0.00033, USD: 0.000042, CNY: 0.0003, TWD: 0.0013, JPY: 0.0063, KRW: 0.056, VND: 1, THB: 0.0015 },
  USD: { HKD: 7.82, VND: 24000, CNY: 7.2, TWD: 32, JPY: 150, KRW: 1330, USD: 1, THB: 36 },
  JPY: { HKD: 0.052, VND: 160, CNY: 0.048, TWD: 0.21, JPY: 1, KRW: 8.8, USD: 0.0067, THB: 0.24 },
  THB: { HKD: 0.22, VND: 670, CNY: 0.2, TWD: 0.89, JPY: 4.2, KRW: 37, USD: 0.028, THB: 1 },
  KRW: { HKD: 0.0059, VND: 18, CNY: 0.0054, TWD: 0.024, JPY: 0.113, KRW: 1, USD: 0.00075, THB: 0.027 },
  TWD: { HKD: 0.24, VND: 750, CNY: 0.22, TWD: 1, JPY: 4.7, KRW: 42, USD: 0.031, THB: 1.13 },
  CNY: { HKD: 1.09, VND: 3320, CNY: 1, TWD: 4.5, JPY: 21, KRW: 185, USD: 0.14, THB: 5 },
};

// Balloon colors for celebration
const balloonColors = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

// Sortable Expense Card
const SortableExpenseCard = ({
  expense,
  onEdit,
  onDelete,
  onComplete,
  formatCurrency,
  categoryLabels
}: {
  expense: Expense & { completed?: boolean };
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
  formatCurrency: (amount: number, currency: string) => string;
  categoryLabels: Record<ExpenseCategory, string>;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: expense.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card rounded-xl p-4 shadow-card ${expense.completed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Complete Button */}
        <button
          onClick={onComplete}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            expense.completed
              ? 'bg-success border-success'
              : 'border-muted-foreground hover:border-primary'
          }`}
        >
          {expense.completed && <Check className="w-4 h-4 text-success-foreground" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm">{categoryLabels[expense.category].split(' ')[0]}</span>
            <span className={`font-medium text-foreground ${expense.completed ? 'line-through' : ''}`}>
              {expense.description}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(expense.date).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="font-semibold text-foreground mr-2">
            {formatCurrency(expense.amount, expense.currency)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
          >
            <Edit2 className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ExpenseTrackerProps {
  expenses: Expense[];
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Expense>) => void;
  onReorder?: (expenses: Expense[]) => void;
}

export const ExpenseTracker = ({ expenses, onAdd, onDelete, onUpdate, onReorder }: ExpenseTrackerProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(getCurrencySettings());
  const [destinationCurrency, setDestinationCurrency] = useState('VND');
  const [showBubble, setShowBubble] = useState(false);
  const [showBalloons, setShowBalloons] = useState(false);
  const [completedExpenses, setCompletedExpenses] = useState<Set<string>>(new Set());
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    currency: 'VND',
    category: 'food' as ExpenseCategory
  });
  const [converterAmount, setConverterAmount] = useState('');
  const [converterFrom, setConverterFrom] = useState('HKD');
  const [converterTo, setConverterTo] = useState('VND');

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const tripInfo = getTripInfo();
    const detectedCurrency = getCurrencyForDestination(tripInfo.destination);
    setDestinationCurrency(detectedCurrency);
    setNewExpense(prev => ({ ...prev, currency: detectedCurrency }));
    setConverterTo(detectedCurrency);
  }, []);

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
    const formatted = currency === 'VND' || currency === 'KRW' || currency === 'JPY'
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
      currency: destinationCurrency,
      category: 'food'
    });
    setIsAddOpen(false);
    
    // Show bubble animation
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 1500);
  };

  const handleEditSave = () => {
    if (!editingExpense || !onUpdate) return;
    onUpdate(editingExpense.id, {
      description: editingExpense.description,
      amount: editingExpense.amount,
      currency: editingExpense.currency,
      category: editingExpense.category
    });
    setEditingExpense(null);
  };

  const handleComplete = (expenseId: string) => {
    const newCompleted = new Set(completedExpenses);
    if (newCompleted.has(expenseId)) {
      newCompleted.delete(expenseId);
    } else {
      newCompleted.add(expenseId);
      // Show balloon celebration
      setShowBalloons(true);
      setTimeout(() => setShowBalloons(false), 3000);
    }
    setCompletedExpenses(newCompleted);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id && onReorder) {
      const oldIndex = expenses.findIndex(e => e.id === active.id);
      const newIndex = expenses.findIndex(e => e.id === over.id);
      
      const newOrder = arrayMove(expenses, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  const totalInBase = expenses.reduce((sum, exp) => {
    return sum + convert(exp.amount, exp.currency, currencySettings.baseCurrency);
  }, 0);

  const swapCurrencies = () => {
    setConverterFrom(converterTo);
    setConverterTo(converterFrom);
  };

  // Group expenses by date
  const expensesByDate = expenses.reduce((groups, expense) => {
    const date = new Date(expense.date).toLocaleDateString('zh-TW');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  // Calculate daily totals
  const getDailyTotal = (dayExpenses: Expense[]) => {
    return dayExpenses.reduce((sum, exp) => {
      return sum + convert(exp.amount, exp.currency, currencySettings.baseCurrency);
    }, 0);
  };

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(expensesByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-4 relative">
      {/* Success Bubble Animation */}
      {showBubble && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-bounce bg-success text-success-foreground rounded-full p-6 shadow-lg">
            <DollarSign className="w-12 h-12" />
          </div>
        </div>
      )}

      {/* Balloon Celebration Animation */}
      {showBalloons && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-up"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '-50px',
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-8 h-10 rounded-full shadow-lg"
                style={{
                  backgroundColor: balloonColors[Math.floor(Math.random() * balloonColors.length)],
                }}
              />
              <div
                className="w-0.5 h-8 mx-auto"
                style={{ backgroundColor: 'hsl(var(--muted-foreground))' }}
              />
            </div>
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-card/90 px-6 py-4 rounded-2xl shadow-lg">
            <PartyPopper className="w-8 h-8 text-secondary" />
            <span className="text-xl font-bold text-foreground">完成！</span>
          </div>
        </div>
      )}

      {/* Currency Converter */}
      <div className="bg-gradient-tropical rounded-2xl p-5 shadow-glow">
        <h3 className="text-primary-foreground font-semibold mb-3">💱 匯率轉換</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              type="number"
              inputMode="decimal"
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

      {/* Expense List - Grouped by Date with DnD */}
      <div className="space-y-4">
        {sortedDates.map((date) => (
          <div key={date} className="space-y-2">
            {/* Date Header with Daily Total */}
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-muted-foreground">{date}</span>
              <span className="text-sm font-semibold text-primary">
                小計: {formatCurrency(getDailyTotal(expensesByDate[date]), currencySettings.baseCurrency)}
              </span>
            </div>
            
            {/* Day's Expenses with DnD */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={expensesByDate[date].map(e => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {expensesByDate[date].map((expense) => (
                    <SortableExpenseCard
                      key={expense.id}
                      expense={{ ...expense, completed: completedExpenses.has(expense.id) }}
                      onEdit={() => setEditingExpense(expense)}
                      onDelete={() => onDelete(expense.id)}
                      onComplete={() => handleComplete(expense.id)}
                      formatCurrency={formatCurrency}
                      categoryLabels={categoryLabels}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        ))}
        
        {expenses.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <span className="text-4xl">💰</span>
            <p className="mt-2">還沒有記錄支出</p>
          </div>
        )}
      </div>

      {/* Edit Expense Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯支出</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">描述</label>
                <Input
                  value={editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">貨幣</label>
                  <Select 
                    value={editingExpense.currency} 
                    onValueChange={(v) => setEditingExpense({ ...editingExpense, currency: v })}
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
                <div>
                  <label className="text-sm font-medium mb-1.5 block">金額</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">分類</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setEditingExpense({ ...editingExpense, category: key as ExpenseCategory })}
                      className={`p-3 rounded-xl text-center transition-all ${
                        editingExpense.category === key 
                          ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <span className="text-xl block">{label.split(' ')[0]}</span>
                      <span className="text-xs">{label.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <Button onClick={handleEditSave} className="w-full">
                儲存變更
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            
            {/* Currency and Amount - Swapped positions */}
            <div className="grid grid-cols-2 gap-3">
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
              <div>
                <label className="text-sm font-medium mb-1.5 block">金額</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
              </div>
            </div>
            
            {/* Category as tap buttons instead of dropdown */}
            <div>
              <label className="text-sm font-medium mb-2 block">分類</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setNewExpense({ ...newExpense, category: key as ExpenseCategory })}
                    className={`p-3 rounded-xl text-center transition-all ${
                      newExpense.category === key 
                        ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <span className="text-xl block">{label.split(' ')[0]}</span>
                    <span className="text-xs">{label.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <Button onClick={handleAdd} className="w-full" disabled={!newExpense.description || !newExpense.amount}>
              新增支出
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add CSS for balloon animation */}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up linear forwards;
        }
      `}</style>
    </div>
  );
};
