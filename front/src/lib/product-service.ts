const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api/products/Product`
  : 'https://localhost:7299/api/products/Product';

export interface Product {
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

export interface CreateProductRequest {
  // id est maintenant généré par la base de données
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
}

export interface UpdateProductRequest {
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
}

class ProductService {
  // Récupérer tous les produits
  async getAllProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits');
    }
    
    return response.json();
  }

  // Récupérer un produit par ID
  async getProductById(id: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Produit non trouvé');
      }
      throw new Error('Erreur lors de la récupération du produit');
    }
    
    return response.json();
  }

  // Créer un nouveau produit
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API:', errorText);
      throw new Error(`Erreur lors de la création du produit: ${response.status}`);
    }
    
    return response.json();
  }

  // Mettre à jour un produit
  async updateProduct(id: number, productData: UpdateProductRequest): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Produit non trouvé');
      }
      throw new Error('Erreur lors de la mise à jour du produit');
    }
    
    return response.json();
  }

  // Supprimer un produit
  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Produit non trouvé');
      }
      throw new Error('Erreur lors de la suppression du produit');
    }
  }

  // Rechercher des produits
  async searchProducts(searchTerm: string): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/search/${encodeURIComponent(searchTerm)}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la recherche de produits');
    }
    
    return response.json();
  }

  // Récupérer les produits par catégorie
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/category/${encodeURIComponent(categoryId)}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits par catégorie');
    }
    
    return response.json();
  }

  // Récupérer les produits en promotion
  async getFeaturedProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/featured`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits en promotion');
    }
    
    return response.json();
  }

  // Récupérer les produits en rupture de stock
  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/low-stock?threshold=${threshold}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits en rupture de stock');
    }
    
    return response.json();
  }

  // Utilitaires de formatage
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price / 100); // Les prix backend sont en centimes
  }

  calculateDiscountedPrice(price: number, discount: number): number {
    return price - (price * discount / 100);
  }

  isInStock(product: Product): boolean {
    return product.stockQuantity > 0;
  }

  getStockStatus(product: Product): string {
    if (product.stockQuantity === 0) return 'Rupture de stock';
    if (product.stockQuantity <= 10) return 'Stock limité';
    return 'En stock';
  }

  getStockStatusColor(product: Product): string {
    if (product.stockQuantity === 0) return 'text-red-600';
    if (product.stockQuantity <= 10) return 'text-orange-600';
    return 'text-green-600';
  }
}

export const productService = new ProductService(); 