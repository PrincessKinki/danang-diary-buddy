import { useState, useEffect } from 'react';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { getExpenses, addExpense, deleteExpense } from '@/lib/storage';
import type { Expense } from '@/types/travel';
import { QubyMascot } from '@/components/QubyMascot';

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    setExpenses(getExpenses());
  }, []);

  const handleAdd = (expense: Omit<Expense, 'id'>) => {
    const newExpense = addExpense(expense);
    setExpenses([...expenses, newExpense]);
  };

  const handleDelete = (id: string) => {
    const updatedExpenses = deleteExpense(id);
    setExpenses(updatedExpenses);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-sunset p-4 pt-safe">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-secondary-foreground">記帳本</h1>
            <p className="text-secondary-foreground/80 text-sm">
              {expenses.length} 筆支出記錄
            </p>
          </div>
          <QubyMascot size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <ExpenseTracker
          expenses={expenses}
          onAdd={handleAdd}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default Expenses;
