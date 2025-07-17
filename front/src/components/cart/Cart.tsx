import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CartItem } from './CartItem';
import { useCart } from '@/contexts/CartContext';

export function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };



  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {cart.totalItems > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {cart.totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Mon Panier
            {cart.totalItems > 0 && (
              <Badge variant="secondary">{cart.totalItems} article{cart.totalItems > 1 ? 's' : ''}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {cart.items.length === 0 
              ? 'Votre panier est vide' 
              : 'Gérez les articles de votre panier'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cart.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Votre panier est vide</h3>
              <p className="text-muted-foreground mb-4">
                Ajoutez des articles à votre panier pour commencer vos achats
              </p>
              <Button onClick={() => setIsOpen(false)}>
                Continuer mes achats
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto py-4">
                <div className="px-4 space-y-4">
                                      {cart.items.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={removeFromCart}
                      />
                    ))}
                </div>
              </div>

            <SheetFooter>
              <div className="border-t pt-4 mt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Button className="w-full" size="lg">
                      Procéder au paiement
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setIsOpen(false)}
                      >
                        Continuer mes achats
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={clearCart}
                      >
                        Vider le panier
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              </SheetFooter>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}