import { HeroSection } from '@/components/home/HeroSection';
import { ProductGrid } from '@/components/product';
import { mockProducts } from '@/data/mockProducts';
import { mockCategories, getCategoryIcon } from '@/data/mockCategories';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

export default function Home() {
    // Afficher seulement les 8 premiers produits sur la page d'accueil
    const featuredProducts = mockProducts.slice(0, 8);
    // Afficher les 6 premières catégories
    const featuredCategories = mockCategories.slice(0, 6);

    return (
        <div className="min-h-screen bg-background">
            {/* Section Hero */}
            <HeroSection />

            {/* Section Produits Populaires */}
            <section className="py-16 bg-background">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* En-tête de section */}
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">
                                Produits populaires
                            </h2>
                            <p className="mt-2 text-lg text-muted-foreground">
                                Découvrez nos meilleures ventes et nouveautés
                            </p>
                        </div>
                        <Button variant="outline" asChild className="hidden sm:flex">
                            <Link to="/categories">
                                Voir tout
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    {/* Grille de produits */}
                    <ProductGrid products={featuredProducts} />

                    {/* Bouton mobile */}
                    <div className="mt-12 text-center sm:hidden">
                        <Button asChild>
                            <Link to="/categories">
                                Voir tous les produits
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Section Catégories */}
            <section className="py-16 bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Explorez par catégorie
                        </h2>
                        <p className="mt-2 text-lg text-muted-foreground">
                            Trouvez exactement ce que vous cherchez
                        </p>
                    </div>

                    {/* Grille des catégories */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {featuredCategories.map((category) => {
                            const IconComponent = getCategoryIcon(category.id);
                            return (
                                <Link
                                    key={category.id}
                                    to={`/categories/${category.slug}`}
                                    className="group"
                                >
                                    <Card className="transition-all duration-300 hover:shadow-lg group-hover:scale-[1.02] bg-card border">
                                        <CardContent className="p-6 text-center">
                                            <div className="mb-4 flex justify-center">
                                                <div className="rounded-full bg-primary/10 p-3">
                                                    <IconComponent className="h-6 w-6 text-primary" />
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                                                {category.name}
                                            </h3>
                                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                                {category.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Bouton voir toutes les catégories */}
                    <div className="mt-12 text-center">
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
    )
}
