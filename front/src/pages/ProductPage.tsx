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
  Share2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductGrid } from '@/components/product';
import { useProduct, useProductsByCategory } from '@/lib/hooks/useProducts';
// import { getCategoryIcon } from '@/data/mockCategories';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/types/product';

export default function ProductPage() {
    const params = useParams({ strict: false });
    const productId = (params as Record<string, string>).id;
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);

    // Charger le produit depuis le backend
    const { product, loading, error, refetch } = useProduct(productId);
    
    // Charger les produits similaires si on a un produit
    const { products: similarProducts } = useProductsByCategory(
        product?.categoryId ?? ''
    );

    const { addToCart } = useCart();

    const handleAddToCart = (product: Product, quantity: number) => {
        addToCart(product, quantity);
    };

    // État de chargement
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex items-center space-x-2 text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Chargement du produit...</span>
                </div>
            </div>
        );
    }

    // État d'erreur
    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                        {error ? 'Erreur de chargement' : 'Produit non trouvé'}
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        {error || 'Le produit que vous recherchez n\'existe pas.'}
                    </p>
                    <div className="space-x-4">
                        <Button variant="outline" onClick={refetch}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Réessayer
                        </Button>
                        <Button asChild>
                            <Link to="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour à l'accueil
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Images du produit
    const productImages = product.images?.length ? product.images : [product.image];

    // Produits similaires (excluant le produit actuel)
    const filteredSimilarProducts = similarProducts
        .filter(p => p.id !== product.id)
        .slice(0, 4);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price / 100); // Conversion centimes vers euros
    };

    const handleQuantityChange = (delta: number) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
            setQuantity(newQuantity);
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < Math.floor(rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                }`}
            />
        ));
    };

    const getStockStatus = () => {
        if (product.stockQuantity === 0) return { text: 'Rupture de stock', color: 'text-red-600' };
        if (product.stockQuantity <= 10) return { text: 'Stock limité', color: 'text-orange-600' };
        return { text: 'En stock', color: 'text-green-600' };
    };

    const stockStatus = getStockStatus();

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
                    <Link to={`/categories/${product.categoryId}`} className="hover:text-foreground">
                        {product.category}
                    </Link>
                    <span>/</span>
                    <span className="font-medium text-foreground">{product.name}</span>
                </nav>

                {/* Contenu principal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Images du produit */}
                    <div className="space-y-4">
                        {/* Image principale */}
                        <div className="aspect-square rounded-lg border bg-muted overflow-hidden">
                            <img
                                src={productImages[selectedImageIndex]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        {/* Miniatures */}
                        {productImages.length > 1 && (
                            <div className="flex space-x-2 overflow-x-auto">
                                {productImages.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-md border-2 overflow-hidden ${
                                            selectedImageIndex === index
                                                ? 'border-primary'
                                                : 'border-muted hover:border-primary/50'
                                        }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Informations du produit */}
                    <div className="space-y-6">
                        {/* En-tête */}
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="secondary">{product.category}</Badge>
                                {product.isNew && <Badge variant="outline">Nouveau</Badge>}
                                {product.isOnSale && <Badge className="bg-red-500">-{product.discount}%</Badge>}
                            </div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                {product.name}
                            </h1>
                            <div className="flex items-center space-x-4">
                                {product.rating && (
                                    <div className="flex items-center space-x-1">
                                        <div className="flex">
                                            {renderStars(product.rating)}
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            ({product.reviewCount} avis)
                                        </span>
                                    </div>
                                )}
                                <span className={`text-sm font-medium ${stockStatus.color}`}>
                                    {stockStatus.text}
                                </span>
                            </div>
                        </div>

                        {/* Prix */}
                        <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                                <span className="text-3xl font-bold text-foreground">
                                    {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && (
                                    <span className="text-xl text-muted-foreground line-through">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                            </div>
                            {product.isOnSale && (
                                <p className="text-sm text-green-600 font-medium">
                                    Économisez {formatPrice((product.originalPrice || product.price) - product.price)}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-2">Description</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Tags */}
                        {product.tags?.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.map((tag) => (
                                        <Badge key={tag} variant="outline">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sélection quantité et ajout au panier */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <span className="font-medium">Quantité:</span>
                                <div className="flex items-center border rounded-lg">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="px-4 py-2 min-w-[3rem] text-center">
                                        {quantity}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= product.stockQuantity}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    Stock disponible: {product.stockQuantity}
                                </span>
                            </div>

                            <div className="flex space-x-3">
                                <Button 
                                    className="flex-1" 
                                    size="lg"
                                    onClick={() => handleAddToCart(product, quantity)}
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
                                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                                </Button>
                                <Button variant="outline" size="lg">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Informations de livraison */}
                        <Card>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Truck className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-medium">Livraison gratuite</p>
                                        <p className="text-sm text-muted-foreground">
                                            Commandez avant 14h pour une livraison demain
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center space-x-3">
                                    <RotateCcw className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium">Retours gratuits</p>
                                        <p className="text-sm text-muted-foreground">
                                            30 jours pour changer d'avis
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center space-x-3">
                                    <Shield className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="font-medium">Garantie constructeur</p>
                                        <p className="text-sm text-muted-foreground">
                                            2 ans de garantie incluse
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Onglets informations détaillées */}
                <Tabs defaultValue="details" className="mb-16">
                    <TabsList>
                        <TabsTrigger value="details">Détails</TabsTrigger>
                        <TabsTrigger value="specs">Spécifications</TabsTrigger>
                        <TabsTrigger value="reviews">Avis</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Détails du produit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium mb-2">Informations générales</h4>
                                        <dl className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Marque:</dt>
                                                <dd className="font-medium">{product.brand}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Catégorie:</dt>
                                                <dd className="font-medium">{product.category}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Stock:</dt>
                                                <dd className="font-medium">{product.stockQuantity} unités</dd>
                                            </div>
                                        </dl>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Description complète</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {product.description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="specs" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Spécifications techniques</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Les spécifications détaillées seront bientôt disponibles.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="reviews" className="mt-6">
                        <Card className="p-6">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <span>Avis clients</span>
                                    {product.rating && (
                                        <div className="flex items-center space-x-1">
                                            <div className="flex">
                                                {renderStars(product.rating)}
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                ({product.reviewCount} avis)
                                            </span>
                                        </div>
                                    )}
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
                {filteredSimilarProducts.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                            Produits similaires
                        </h2>
                        <ProductGrid products={filteredSimilarProducts} />
                    </div>
                )}
            </div>
        </div>
    );
}
