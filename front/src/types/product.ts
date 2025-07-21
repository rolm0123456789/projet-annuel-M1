export interface Product {
  id: number; // Changé de string vers number
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // Prix barré pour les promotions (calculé frontend)
  image: string;
  images: string[]; // Backend: array obligatoire, frontend: optionnel compatible
  category: string;
  categoryId: string;
  brand: string; // Backend: obligatoire
  rating?: number; // Frontend uniquement (pas dans le backend)
  reviewCount?: number; // Frontend uniquement (pas dans le backend)
  inStock?: boolean; // Calculé à partir de stockQuantity
  stockQuantity: number; // Backend: obligatoire
  tags: string[]; // Backend: array obligatoire
  isNew?: boolean; // Frontend uniquement (calculé à partir de createdAt)
  isOnSale: boolean; // Backend: obligatoire
  discount: number; // Backend: obligatoire
  createdAt: string | Date; // Backend: string ISO, Frontend: Date
  updatedAt: string | Date; // Backend: string ISO, Frontend: Date
}

// Type spécifique pour les données venant du backend
export interface BackendProduct {
  id: number; // Changé de string vers number
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  categoryId: string;
  brand: string;
  stockQuantity: number;
  tags: string[];
  isOnSale: boolean;
  discount: number;
  createdAt: string;
  updatedAt: string;
}

// Fonction utilitaire pour convertir BackendProduct vers Product
export function adaptBackendProduct(backendProduct: BackendProduct): Product {
  const now = new Date();
  const createdAt = new Date(backendProduct.createdAt);
  const isNew = (now.getTime() - createdAt.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 jours

  return {
    ...backendProduct,
    originalPrice: backendProduct.isOnSale 
      ? Math.round(backendProduct.price / (1 - backendProduct.discount / 100))
      : undefined,
    rating: 4.5, // Valeur par défaut en attendant un service de reviews
    reviewCount: Math.floor(Math.random() * 2000) + 100, // Valeur simulée
    inStock: backendProduct.stockQuantity > 0,
    isNew,
    createdAt: createdAt,
    updatedAt: new Date(backendProduct.updatedAt),
  };
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