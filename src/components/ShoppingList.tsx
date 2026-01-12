import { useState, useRef } from 'react';
import { Plus, Trash2, Check, Camera, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { ShoppingItem } from '@/types/travel';

interface ShoppingListProps {
  items: ShoppingItem[];
  onAdd: (item: Omit<ShoppingItem, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<ShoppingItem>) => void;
  onDelete: (id: string) => void;
}

export const ShoppingList = ({ items, onAdd, onUpdate, onDelete }: ShoppingListProps) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!newItemName.trim()) return;
    onAdd({
      name: newItemName,
      quantity: newItemQuantity,
      purchased: false,
      imageUrl: selectedImage || undefined
    });
    setNewItemName('');
    setNewItemQuantity(1);
    setSelectedImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const purchasedItems = items.filter(i => i.purchased);
  const unpurchasedItems = items.filter(i => !i.purchased);

  return (
    <div className="space-y-4">
      {/* Add Item Form */}
      <div className="bg-card rounded-2xl p-4 shadow-card space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="新增購物項目..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1"
          />
          <Input
            type="number"
            min={1}
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
            className="w-20"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="w-4 h-4 mr-1" />
            相片
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="w-4 h-4 mr-1" />
            拍攝
          </Button>
          
          {selectedImage && (
            <div className="relative">
              <img 
                src={selectedImage} 
                alt="Preview" 
                className="w-10 h-10 rounded-lg object-cover"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3 text-destructive-foreground" />
              </button>
            </div>
          )}
          
          <Button 
            onClick={handleAdd}
            disabled={!newItemName.trim()}
            className="ml-auto"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Unpurchased Items */}
      <div className="space-y-2">
        {unpurchasedItems.map((item) => (
          <div
            key={item.id}
            className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3"
          >
            <Checkbox
              checked={item.purchased}
              onCheckedChange={(checked) => onUpdate(item.id, { purchased: !!checked })}
            />
            
            {item.imageUrl && (
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-sm text-muted-foreground">數量: {item.quantity}</p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(item.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Purchased Items */}
      {purchasedItems.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">已購買</h3>
          {purchasedItems.map((item) => (
            <div
              key={item.id}
              className="bg-muted/50 rounded-xl p-4 flex items-center gap-3 opacity-60"
            >
              <Checkbox
                checked={item.purchased}
                onCheckedChange={(checked) => onUpdate(item.id, { purchased: !!checked })}
              />
              
              {item.imageUrl && (
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground line-through">{item.name}</p>
                <p className="text-sm text-muted-foreground">數量: {item.quantity}</p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <span className="text-4xl">🛒</span>
          <p className="mt-2">購物清單是空的</p>
        </div>
      )}
    </div>
  );
};
