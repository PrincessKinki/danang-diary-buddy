import { useState, useEffect } from 'react';
import { ShoppingList } from '@/components/ShoppingList';
import { getShoppingItems, addShoppingItem, updateShoppingItem, deleteShoppingItem } from '@/lib/storage';
import type { ShoppingItem } from '@/types/travel';
import { QubyMascot } from '@/components/QubyMascot';

const Shopping = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    setItems(getShoppingItems());
  }, []);

  const handleAdd = (item: Omit<ShoppingItem, 'id'>) => {
    const newItem = addShoppingItem(item);
    setItems([...items, newItem]);
  };

  const handleUpdate = (id: string, updates: Partial<ShoppingItem>) => {
    const updatedItems = updateShoppingItem(id, updates);
    setItems(updatedItems);
  };

  const handleDelete = (id: string) => {
    const updatedItems = deleteShoppingItem(id);
    setItems(updatedItems);
  };

  const purchasedCount = items.filter(i => i.purchased).length;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent to-chart-4 p-4 pt-safe">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-accent-foreground">購物清單</h1>
            <p className="text-accent-foreground/80 text-sm">
              {purchasedCount}/{items.length} 已購買
            </p>
          </div>
          <QubyMascot size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <ShoppingList
          items={items}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default Shopping;
