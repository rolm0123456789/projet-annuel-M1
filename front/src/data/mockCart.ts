import { Cart, CartItem } from '@/types/product';

export const mockCartItems: CartItem[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    price: 1229.99,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop&crop=center'
  },
  {
    id: '2',
    name: 'AirPods Pro (2ème génération)',
    price: 279.99,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=400&fit=crop&crop=center'
  }
];

export const createMockCart = (items: CartItem[] = mockCartItems): Cart => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return {
    items,
    total,
    totalItems,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const mockCart = createMockCart(); 