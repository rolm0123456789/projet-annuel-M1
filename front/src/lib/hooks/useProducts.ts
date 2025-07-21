import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/lib/product-service';
import { adaptBackendProduct, type Product, type BackendProduct } from '@/types/product';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const backendProducts = await productService.getAllProducts();
      const adaptedProducts = backendProducts.map(adaptBackendProduct);
      setProducts(adaptedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
      // En cas d'erreur, garder les produits existants ou un array vide
      console.error('Erreur chargement produits:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    refetch: loadProducts
  };
}

export function useProduct(productId: number | string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      // Convertir en number si nécessaire
      const id = typeof productId === 'string' ? parseInt(productId) : productId;
      const backendProduct = await productService.getProductById(id);
      const adaptedProduct = adaptBackendProduct(backendProduct);
      setProduct(adaptedProduct);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du produit');
      setProduct(null);
      console.error('Erreur chargement produit:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  return {
    product,
    loading,
    error,
    refetch: loadProduct
  };
}

export function useProductsByCategory(categoryId: string | undefined) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    if (!categoryId) return;
    
    try {
      setLoading(true);
      setError(null);
      const backendProducts = await productService.getProductsByCategory(categoryId);
      const adaptedProducts = backendProducts.map(adaptBackendProduct);
      setProducts(adaptedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
      setProducts([]);
      console.error('Erreur chargement produits par catégorie:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    refetch: loadProducts
  };
}

export function useProductSearch(searchTerm: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = useCallback(async () => {
    if (!searchTerm.trim()) {
      setProducts([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const backendProducts = await productService.searchProducts(searchTerm);
      const adaptedProducts = backendProducts.map(adaptBackendProduct);
      setProducts(adaptedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      setProducts([]);
      console.error('Erreur recherche produits:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    searchProducts();
  }, [searchProducts]);

  return {
    products,
    loading,
    error,
    refetch: searchProducts
  };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const backendProducts = await productService.getFeaturedProducts();
      const adaptedProducts = backendProducts.map(adaptBackendProduct);
      setProducts(adaptedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits en promotion');
      setProducts([]);
      console.error('Erreur chargement produits featured:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    refetch: loadProducts
  };
} 