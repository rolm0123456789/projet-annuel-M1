import { ShoppingCart, Minus, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/types/product';

interface ProductAddProps {
  product: Product;
}

export function ProductAdd({ product }: ProductAddProps) {
  const { addToCart, isInCart, getItemQuantity, updateQuantity } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, getItemQuantity(product.id) - 1);
  };

  return (
    <div className="transition-all duration-300 ease-in-out">
      {isInCart(product.id) ? (
        <div className="w-full flex items-center justify-center gap-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <Button 
            size="sm"
            variant={getItemQuantity(product.id) == 1 ? "destructive" : "outline"}
            onClick={handleRemoveFromCart}
            className="transition-all duration-200 hover:scale-105"
          >
            {getItemQuantity(product.id) == 1 ? <Trash className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          </Button>
          <span className="text-sm font-medium transition-all duration-200 animate-in zoom-in-50">
            {getItemQuantity(product.id)}
          </span>
          <Button 
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button 
          className="w-full transition-all duration-300 hover:scale-105 animate-in fade-in-0 slide-in-from-bottom-2" 
          disabled={!product.inStock}
          variant={product.inStock ? "default" : "secondary"}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4 transition-transform duration-200" />
          {product.inStock ? 'Ajouter au panier' : 'Indisponible'}
        </Button>
      )}
    </div>
  );
}
