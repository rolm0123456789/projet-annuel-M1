import { Link } from '@tanstack/react-router';
import { Star, ShoppingCart, Heart, Minus, Plus } from 'lucide-react';
import type { Product } from '@/types/product';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity, updateQuantity } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche la navigation vers la page produit
    addToCart(product);
  };

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche la navigation vers la page produit
    updateQuantity(product.id, getItemQuantity(product.id) - 1);
  };

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

  return (
    <Card onClick={() => navigate({ to: `/products/${product.id}` })} className="group cursor-pointer relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.isNew && (
          <Badge variant="default" className="bg-secondary">
            Nouveau
          </Badge>
        )}
        {product.isOnSale && product.discount && (
          <Badge variant="destructive">
            -{product.discount}%
          </Badge>
        )}
        {!product.inStock && (
          <Badge variant="secondary" className="bg-destructive">
            Rupture
          </Badge>
        )}
      </div>

      {/* Bouton favori */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/80 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Heart className="h-4 w-4" />
      </Button>

      <CardContent className="p-0">
        {/* Image */}
        <Link to={`/products/${product.id}`} className="block">
          <div className="aspect-square overflow-hidden rounded-lg">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>

        {/* Contenu */}
        <div className="p-4">
          {/* Marque */}
          {product.brand && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {product.brand}
            </p>
          )}

          {/* Nom du produit */}
          <Link to={`/products/${product.id}`}>
            <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Catégorie */}
          <p className="text-xs text-muted-foreground mt-1">
            {product.category}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {renderStars(product.rating)}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Prix */}
          <div className="flex items-center gap-2 mt-3">
            <span className="font-bold text-lg">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {isInCart(product.id) ? (
          <div className="w-full flex items-center justify-between">
            <Button 
              size="sm"
              variant="outline"
              onClick={handleRemoveFromCart}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {getItemQuantity(product.id)}
            </span>
            <Button 
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full" 
            disabled={!product.inStock}
            variant={product.inStock ? "default" : "secondary"}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.inStock ? 'Ajouter au panier' : 'Indisponible'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 