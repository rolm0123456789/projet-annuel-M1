import { useState, useMemo } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Filter, SortAsc } from 'lucide-react';
import { ProductGrid } from '@/components/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockProducts } from '@/data/mockProducts';
import { mockCategories } from '@/data/mockCategories';

export default function CategoryPage() {
    const params = useParams({ strict: false });  const categorySlug = (params as Record<string, string>).name || (params as Record<string, string>).slug;
  const [sortBy, setSortBy] = useState<string>('name');
  const [filterBy, setFilterBy] = useState<string>('all');

  // Trouver la catégorie actuelle
  const currentCategory = mockCategories.find(cat => cat.slug === categorySlug);
  
  // Filtrer les produits par catégorie
  const categoryProducts = useMemo(() => {
    if (!currentCategory) return [];
    
    let filtered = mockProducts.filter(product => product.categoryId === currentCategory.id);
    
    // Appliquer les filtres
    if (filterBy === 'inStock') {
      filtered = filtered.filter(product => product.inStock);
    } else if (filterBy === 'onSale') {
      filtered = filtered.filter(product => product.isOnSale);
    } else if (filterBy === 'new') {
      filtered = filtered.filter(product => product.isNew);
    }
    
    // Appliquer le tri
    switch (sortBy) {
      case 'price-asc':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return filtered.sort((a, b) => b.price - a.price);
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'name':
      default:
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [currentCategory, sortBy, filterBy]);

  if (!currentCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Catégorie non trouvée
          </h1>
          <p className="text-gray-600 mb-6">
            La catégorie que vous recherchez n'existe pas.
          </p>
          <Button asChild>
            <Link to="/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux catégories
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-gray-900">Accueil</Link>
          <span>/</span>
          <Link to="/categories" className="hover:text-gray-900">Catégories</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{currentCategory.name}</span>
        </nav>

        {/* En-tête de la catégorie */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/50 px-6 py-12 text-primary-foreground">
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-4">{currentCategory.name}</h1>
              <p className="text-lg opacity-90 max-w-2xl">
                {currentCategory.description}
              </p>
              <div className="mt-4">
                <Badge variant="secondary" className="text-white">
                  {categoryProducts.length} produit{categoryProducts.length > 1 ? 's' : ''} disponible{categoryProducts.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
            <div className="absolute inset-0"></div>
          </div>
        </div>

        {/* Filtres et tri */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  <SelectItem value="inStock">En stock</SelectItem>
                  <SelectItem value="onSale">En promotion</SelectItem>
                  <SelectItem value="new">Nouveautés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <SortAsc className="h-4 w-4 text-gray-500" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom (A-Z)</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="rating">Mieux notés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grille de produits */}
        {categoryProducts.length > 0 ? (
          <ProductGrid products={categoryProducts} />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H6a1 1 0 00-1 1v1m16 0V4a1 1 0 00-1-1H6a1 1 0 00-1 1v1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Aucun produit ne correspond aux critères sélectionnés.
            </p>
            <Button variant="outline" onClick={() => setFilterBy('all')}>
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        {/* Bouton retour */}
        <div className="mt-12 text-center">
          <Button variant="outline" asChild>
            <Link to="/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voir toutes les catégories
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
