import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CartItem as CartItemType } from '@/types/product';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemoveItem }: CartItemProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(0, item.quantity + change);
    if (newQuantity === 0) {
      onRemoveItem(item.id);
    } else {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg">
      <div className="relative h-16 w-16 flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover rounded-md"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
        <p className="text-sm text-muted-foreground">
          {formatPrice(item.price)}
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(-1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <span className="min-w-[2rem] text-center text-sm font-medium">
          {item.quantity}
        </span>
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={() => onRemoveItem(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
