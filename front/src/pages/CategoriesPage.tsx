import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockCategories, getCategoryIcon } from '@/data/mockCategories';
import { mockProducts } from '@/data/mockProducts';

export default function CategoriesPage() {
    // Compter les produits par catégorie
    const getProductCount = (categoryId: string) => {
        return mockProducts.filter(product => product.categoryId === categoryId).length;
    };

    return (
        <div className="min-h-screen py-8 bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* En-tête */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
                        Toutes les catégories
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Explorez notre large gamme de produits organisés par catégories. 
                        Trouvez exactement ce que vous cherchez en quelques clics.
                    </p>
                </div>

                {/* Grille des catégories */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {mockCategories.map((category) => {
                        const productCount = getProductCount(category.id);
                        const IconComponent = getCategoryIcon(category.id);
                        
                        return (
                            <Link
                                key={category.id}
                                to={`/categories/${category.slug}`}
                                className="group"
                            >
                                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg group-hover:scale-[1.02] bg-card border">
                                    {/* Image de la catégorie */}
                                    <div className="aspect-video overflow-hidden relative rounded-lg">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {/* Icône superposée */}
                                        <div className="absolute top-4 left-4">
                                            <div className="rounded-full bg-background/90 backdrop-blur-sm p-3 shadow-lg">
                                                <IconComponent className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">
                                                {category.name}
                                            </h3>
                                            <Badge variant="secondary" className="text-xs">
                                                {productCount} produit{productCount > 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                        
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {category.description}
                                        </p>
                                        
                                        <div className="mt-4 flex items-center text-primary text-sm font-medium group-hover:text-primary/80 transition-colors">
                                            Voir les produits
                                            <svg
                                                className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Section statistiques */}
                <div className="mt-16 bg-muted/30 rounded-lg p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            Notre catalogue en chiffres
                        </h2>
                        <p className="text-muted-foreground">
                            Découvrez l'étendue de notre sélection
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {mockCategories.map((category) => {
                            const productCount = getProductCount(category.id);
                            const IconComponent = getCategoryIcon(category.id);
                            
                            return (
                                <div key={category.id} className="text-center">
                                    <div className="mb-2 flex justify-center">
                                        <div className="rounded-full bg-primary/10 p-2">
                                            <IconComponent className="h-4 w-4 text-primary" />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-primary mb-1">
                                        {productCount}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {category.name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
