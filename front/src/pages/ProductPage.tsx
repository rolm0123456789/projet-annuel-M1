import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  ShoppingCart, 
  Truck, 
  Shield, 
  RotateCcw,
  Plus,
  Minus,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductGrid } from '@/components/product';
import { mockProducts } from '@/data/mockProducts';
import { getCategoryIcon } from '@/data/mockCategories';

export default function ProductPage() {
    const params = useParams({ strict: false });
    const productId = (params as Record<string, string>).id;
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);

    // Trouver le produit
    const product = mockProducts.find(p => p.id === productId);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                        Produit non trouvé
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        Le produit que vous recherchez n'existe pas.
                    </p>
                    <Button asChild>
                        <Link to="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour à l'accueil
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Images du produit (utiliser l'array images s'il existe, sinon l'image principale)
    const productImages = product.images || [product.image];

    // Produits similaires (même catégorie, excluant le produit actuel)
    const similarProducts = mockProducts
        .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
        .slice(0, 4);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                }`}
            />
        ));
    };

    const IconComponent = getCategoryIcon(product.categoryId);

    return (
        <div className="min-h-screen bg-background">
            {/* Breadcrumb */}
            <div className="border-b bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Link to="/" className="hover:text-foreground">Accueil</Link>
                        <span>/</span>
                        <Link to="/categories" className="hover:text-foreground">Catégories</Link>
                        <span>/</span>
                        <Link to={`/categories/${product.categoryId}`} className="hover:text-foreground">
                            {product.category}
                        </Link>
                        <span>/</span>
                        <span className="text-foreground font-medium">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Galerie d'images */}
                    <div className="space-y-4">
                        {/* Image principale */}
                        <div className="aspect-square overflow-hidden rounded-lg border bg-card">
                            <img
                                src={productImages[selectedImageIndex]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Miniatures */}
                        {productImages.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {productImages.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                                            selectedImageIndex === index
                                                ? 'border-primary'
                                                : 'border-border hover:border-primary/50'
                                        }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Détails du produit */}
                    <div className="space-y-6">
                        {/* En-tête */}
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <div className="rounded-md bg-primary/10 p-1.5">
                                    <IconComponent className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm text-muted-foreground">{product.category}</span>
                                {product.brand && (
                                    <>
                                        <span className="text-muted-foreground">•</span>
                                        <span className="text-sm font-medium text-foreground">{product.brand}</span>
                                    </>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>
                            
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {product.isNew && (
                                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                        Nouveau
                                    </Badge>
                                )}
                                {product.isOnSale && product.discount && (
                                    <Badge variant="destructive">
                                        -{product.discount}% de réduction
                                    </Badge>
                                )}
                                {!product.inStock && (
                                    <Badge variant="secondary" className="bg-gray-500">
                                        Rupture de stock
                                    </Badge>
                                )}
                            </div>

                            {/* Rating */}
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="flex">
                                    {renderStars(product.rating)}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {product.rating}/5 ({product.reviewCount} avis)
                                </span>
                            </div>
                        </div>

                        {/* Prix */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                                <span className="text-3xl font-bold text-foreground">
                                    {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-lg text-muted-foreground line-through">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                            </div>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <p className="text-sm text-green-600">
                                    Vous économisez {formatPrice(product.originalPrice - product.price)}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <p className="text-muted-foreground leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Stock */}
                        {product.inStock && (
                            <div className="flex items-center space-x-2 text-sm">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <span className="text-green-600">
                                    En stock ({product.stockQuantity} disponibles)
                                </span>
                            </div>
                        )}

                        {/* Quantité et actions */}
                        <div className="space-y-4">
                            {product.inStock && (
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium">Quantité :</span>
                                    <div className="flex items-center border rounded-md">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="px-4 py-2 text-sm font-medium">{quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setQuantity(Math.min(product.stockQuantity || 1, quantity + 1))}
                                            disabled={quantity >= (product.stockQuantity || 1)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Boutons d'action */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button 
                                    size="lg" 
                                    className="flex-1"
                                    disabled={!product.inStock}
                                >
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    {product.inStock ? 'Ajouter au panier' : 'Indisponible'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setIsFavorite(!isFavorite)}
                                >
                                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                                </Button>
                                <Button variant="outline" size="lg">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Services */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
                            <div className="flex items-center space-x-2 text-sm">
                                <Truck className="h-4 w-4 text-primary" />
                                <span>Livraison 24h</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Shield className="h-4 w-4 text-primary" />
                                <span>Garantie 2 ans</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <RotateCcw className="h-4 w-4 text-primary" />
                                <span>Retour 30 jours</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Onglets d'informations */}
                <Tabs defaultValue="description" className="mb-12">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="description">Description</TabsTrigger>
                        <TabsTrigger value="specifications">Caractéristiques</TabsTrigger>
                        <TabsTrigger value="reviews">Avis ({product.reviewCount})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="description" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-muted-foreground leading-relaxed">
                                    {product.description}
                                </p>
                                <Separator className="my-4" />
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Points clés :</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                        <li>Produit de qualité premium</li>
                                        <li>Garantie constructeur incluse</li>
                                        <li>Livraison rapide et sécurisée</li>
                                        <li>Support technique disponible</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="specifications" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Informations générales</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Marque :</span>
                                                <span>{product.brand || 'Non spécifié'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Catégorie :</span>
                                                <span>{product.category}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Référence :</span>
                                                <span>{product.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Disponibilité</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Stock :</span>
                                                <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                                                    {product.inStock ? `${product.stockQuantity} disponibles` : 'Rupture'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Livraison :</span>
                                                <span>24-48h</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="reviews" className="mt-6">
                        <Card className="p-6">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <span>Avis clients</span>
                                    <div className="flex items-center space-x-1">
                                        <div className="flex">
                                            {renderStars(product.rating)}
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            ({product.reviewCount} avis)
                                        </span>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Les avis clients seront bientôt disponibles.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Produits similaires */}
                {similarProducts.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                            Produits similaires
                        </h2>
                        <ProductGrid products={similarProducts} />
                    </div>
                )}
            </div>
        </div>
    );
}
