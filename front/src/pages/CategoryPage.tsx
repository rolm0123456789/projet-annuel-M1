import { useState, useMemo } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Filter, SortAsc, RefreshCw, AlertCircle } from 'lucide-react';
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
import { useProductsByCategory } from '@/lib/hooks/useProducts';
import { mockCategories } from '@/data/mockCategories';

export default function CategoryPage() {
    const params = useParams({ strict: false });  
    const categorySlug = (params as Record<string, string>).name || (params as Record<string, string>).slug;
    const [sortBy, setSortBy] = useState<string>('name');
    const [filterBy, setFilterBy] = useState<string>('all');

    // Trouver la catégorie actuelle
    const currentCategory = mockCategories.find(cat => cat.slug === categorySlug);
    
    // Charger les produits de la catégorie depuis le backend
    const { products: categoryProducts, loading, error, refetch } = useProductsByCategory(
        currentCategory?.id
    );
    
    // Filtrer et trier les produits
    const filteredAndSortedProducts = useMemo(() => {
        if (!categoryProducts.length) return [];
        
        let filtered = [...categoryProducts];
        
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
                return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'name':
            default:
                return filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
    }, [categoryProducts, sortBy, filterBy]);

    // Si la catégorie n'existe pas
    if (!currentCategory) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                        Catégorie non trouvée
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        La catégorie que vous recherchez n'existe pas.
                    </p>
                    <Button asChild>
                        <Link to="/categories">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voir toutes les catégories
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
                    <Link to="/" className="hover:text-foreground">
                        Accueil
                    </Link>
                    <span>/</span>
                    <Link to="/categories" className="hover:text-foreground">
                        Catégories
                    </Link>
                    <span>/</span>
                    <span className="font-medium text-foreground">{currentCategory.name}</span>
                </nav>

                {/* En-tête de la catégorie */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                {currentCategory.name}
                            </h1>
                            {currentCategory.description && (
                                <p className="text-muted-foreground mt-2">
                                    {currentCategory.description}
                                </p>
                            )}
                        </div>
                        
                        {!loading && !error && (
                            <Badge variant="secondary" className="text-sm">
                                {filteredAndSortedProducts.length} produit{filteredAndSortedProducts.length > 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>

                    {/* Filtres et tri */}
                    {!loading && !error && categoryProducts.length > 0 && (
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-muted/50 p-4 rounded-lg">
                            <div className="flex flex-wrap gap-4">
                                {/* Filtre */}
                                <div className="flex items-center space-x-2">
                                    <Filter className="h-4 w-4" />
                                    <Select value={filterBy} onValueChange={setFilterBy}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous les produits</SelectItem>
                                            <SelectItem value="inStock">En stock</SelectItem>
                                            <SelectItem value="onSale">En promotion</SelectItem>
                                            <SelectItem value="new">Nouveautés</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Tri */}
                                <div className="flex items-center space-x-2">
                                    <SortAsc className="h-4 w-4" />
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
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

                            {/* Reset filtres */}
                            {(filterBy !== 'all' || sortBy !== 'name') && (
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                        setFilterBy('all');
                                        setSortBy('name');
                                    }}
                                >
                                    Réinitialiser
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Contenu principal */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            <span>Chargement des produits...</span>
                        </div>
                    </div>
                )}

                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
                        <p className="text-muted-foreground mb-4 text-center max-w-md">
                            {error}
                        </p>
                        <Button variant="outline" onClick={refetch}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Réessayer
                        </Button>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {filteredAndSortedProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-muted-foreground">
                                <span className="flex items-center justify-center">
                                  <img className="size-16" src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Crying%20Face.png" alt="Crying Face" />
                                </span>
                                    <h3 className="text-lg font-semibold mb-2">
                                        {categoryProducts.length === 0 
                                            ? 'Aucun produit dans cette catégorie'
                                            : 'Aucun produit ne correspond aux filtres'
                                        }
                                    </h3>
                                    <p className="text-sm">
                                        {categoryProducts.length === 0 
                                            ? 'Cette catégorie sera bientôt remplie avec de nouveaux produits.'
                                            : 'Essayez de modifier vos critères de filtrage.'
                                        }
                                    </p>
                                    
                                    {categoryProducts.length > 0 && (
                                        <Button 
                                            variant="outline" 
                                            className="mt-4"
                                            onClick={() => {
                                                setFilterBy('all');
                                                setSortBy('name');
                                            }}
                                        >
                                            Voir tous les produits de la catégorie
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <ProductGrid products={filteredAndSortedProducts} />
                        )}
                    </>
                )}

                {/* Bouton retour en bas */}
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
