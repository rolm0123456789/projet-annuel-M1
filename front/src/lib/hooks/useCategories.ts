import { useState, useEffect, useCallback } from 'react';
import { productService, type Category } from '@/lib/product-service';

// Charge les catégories réelles depuis le ProductService via la Gateway
// (GET /api/products/Category).
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setCategories(await productService.getCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories');
      console.error('Erreur chargement catégories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    refetch: loadCategories,
  };
}
