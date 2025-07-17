export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // Prix barré pour les promotions
  image: string;
  images?: string[]; // Images supplémentaires
  category: string;
  categoryId: string;
  brand?: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  tags?: string[];
  isNew?: boolean;
  isOnSale?: boolean;
  discount?: number; // Pourcentage de réduction
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}