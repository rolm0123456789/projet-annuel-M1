import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Cart, CartItem, Product } from '@/types/product';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const initialCart: Cart = {
  items: [],
  total: 0,
  totalItems: 0,
};

function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);

      if (existingItem) {
        // Mettre à jour la quantité si l'article existe déjà
        const updatedItems = state.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        
        return calculateCartTotals({
          ...state,
          items: updatedItems,
        });
      } else {
        // Ajouter un nouvel article
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        };

        return calculateCartTotals({
          ...state,
          items: [...state.items, newItem],
        });
      }
    }

    case 'REMOVE_FROM_CART': {
      const { itemId } = action.payload;
      const updatedItems = state.items.filter(item => item.id !== itemId);
      
      return calculateCartTotals({
        ...state,
        items: updatedItems,
      });
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Si la quantité est 0 ou négative, supprimer l'article
        const updatedItems = state.items.filter(item => item.id !== itemId);
        return calculateCartTotals({
          ...state,
          items: updatedItems,
        });
      }

      const updatedItems = state.items.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      );

      return calculateCartTotals({
        ...state,
        items: updatedItems,
      });
    }

    case 'CLEAR_CART': {
      return initialCart;
    }

    default:
      return state;
  }
}

function calculateCartTotals(cart: Cart): Cart {
  const total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const totalItems = cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return {
    ...cart,
    total,
    totalItems,
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  const addToCart = (product: Product, quantity: number = 1) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { product, quantity },
    });
  };

  const removeFromCart = (itemId: string) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { itemId },
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { itemId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (productId: string): boolean => {
    return cart.items.some(item => item.id === productId);
  };

  const getItemQuantity = (productId: string): number => {
    const item = cart.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 