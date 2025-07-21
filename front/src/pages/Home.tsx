import { HeroSection } from '@/components/home/HeroSection';
import { ProductGrid } from '@/components/product';
import { useProducts, useFeaturedProducts } from '@/lib/hooks/useProducts';
import { mockCategories, getCategoryIcon } from '@/data/mockCategories';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import { ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function Home() {
    const { products: allProducts, loading: allLoading, error: allError } = useProducts();
    const { products: featuredProducts, loading: featuredLoading, error: featuredError } = useFeaturedProducts();
    
    // Afficher les 8 premiers produits si les featured ne sont pas disponibles
    const displayProducts = featuredProducts.length > 0 
        ? featuredProducts.slice(0, 8)
        : allProducts.slice(0, 8);
    
    const isLoading = featuredLoading || allLoading;
    const hasError = featuredError || allError;
    
    // Afficher les 6 premières catégories
    const featuredCategories = mockCategories.slice(0, 6);

    return (
        <div className="min-h-screen bg-background">
            {/* Section Hero */}
            <HeroSection />

            {/* Section Produits Populaires */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">
                            {featuredProducts.length > 0 ? 'Produits en promotion' : 'Produits populaires'}
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            {featuredProducts.length > 0 
                                ? 'Découvrez nos meilleures offres avec des réductions exceptionnelles'
                                : 'Découvrez notre sélection de produits les plus appréciés par nos clients'
                            }
                        </p>
                    </div>

                    {/* Gestion des états de chargement et d'erreur */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center space-x-2 text-muted-foreground">
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                <span>Chargement des produits...</span>
                            </div>
                        </div>
                    )}

                    {hasError && !isLoading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
                            <p className="text-muted-foreground mb-4 text-center max-w-md">
                                {hasError}
                            </p>
                            <Button 
                                variant="outline" 
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Réessayer
                            </Button>
                        </div>
                    )}

                    {!isLoading && !hasError && (
                        <>
                            <ProductGrid products={displayProducts} />
                            
                            <div className="text-center mt-12">
                                <Button asChild size="lg">
                                    <Link to="/categories">
                                        Voir tous les produits
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Section Catégories */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">
                            Explorez nos catégories
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Trouvez exactement ce que vous cherchez dans nos différentes catégories
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredCategories.map((category) => {
                            const CategoryIcon = getCategoryIcon(category.id);
                            return (
                                <Card 
                                    key={category.id} 
                                    className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                                >
                                    <Link to={`/categories/${category.slug}`}>
                                        <CardContent className="p-6 text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                <CategoryIcon className="h-8 w-8 text-primary" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                                {category.name}
                                            </h3>
                                            <p className="text-muted-foreground text-sm">
                                                {category.description}
                                            </p>
                                        </CardContent>
                                    </Link>
                                </Card>
                            );
                        })}
                    </div>
                    
                    <div className="text-center mt-8">
                        <Button variant="outline" asChild>
                            <Link to="/categories">
                                Voir toutes les catégories
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Section Newsletter/CTA */}
            <section className="py-16 bg-background">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
                        <CardContent className="p-8 text-center">
                            <h2 className="text-2xl font-bold text-foreground mb-4">
                                Restez informé de nos nouveautés
                            </h2>
                            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                Inscrivez-vous à notre newsletter pour recevoir en avant-première 
                                nos offres exclusives et découvrir nos derniers produits.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Votre adresse email"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <Button className="w-full sm:w-auto">
                                    S'inscrire
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
