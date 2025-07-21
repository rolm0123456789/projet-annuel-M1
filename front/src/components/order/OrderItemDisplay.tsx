import { useState, useEffect } from 'react';
import { productService, type Product } from '@/lib/product-service';
import { type OrderItemModel } from '@/lib/order-service';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

export interface OrderItemDisplayProps {
  item: OrderItemModel;
  variant?: 'compact' | 'detailed' | 'admin';
  showImage?: boolean;
  showBrand?: boolean;
  showStock?: boolean;
  showDiscount?: boolean;
  showProductId?: boolean;
  className?: string;
}

export function OrderItemDisplay({ 
  item, 
  variant = 'detailed',
  showImage = true,
  showBrand = true,
  showStock = false,
  showDiscount = true,
  showProductId = false,
  className = ""
}: OrderItemDisplayProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const productData = await productService.getProductById(item.productId);
        setProduct(productData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [item.productId]);

  const formatPrice = (price: number) => {
    return productService.formatPrice(price);
  };

  const totalPrice = item.unitPrice * item.quantity;

  // Configuration des variantes
  const variantConfig = {
    compact: {
      imageSize: 'h-8 w-8',
      textSize: 'text-xs',
      spacing: 'space-x-2',
      showDetails: false
    },
    detailed: {
      imageSize: 'h-12 w-12',
      textSize: 'text-sm',
      spacing: 'space-x-3',
      showDetails: true
    },
    admin: {
      imageSize: 'h-12 w-12',
      textSize: 'text-sm',
      spacing: 'space-x-3',
      showDetails: true
    }
  };

  const config = variantConfig[variant];

  if (loading) {
    return (
      <div className={`flex items-center ${config.spacing} ${className}`}>
        {showImage && <Skeleton className={`${config.imageSize} rounded`} />}
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          {config.showDetails && <Skeleton className="h-3 w-1/2" />}
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`flex items-center justify-between ${config.textSize} ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-muted-foreground">
            Produit #{item.productId} (introuvable)
          </span>
          <span className="text-xs text-muted-foreground">
            x{item.quantity}
          </span>
        </div>
        <span className="font-medium">
          {formatPrice(totalPrice)}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between ${config.textSize} ${className}`}>
      <div className={`flex items-center ${config.spacing} flex-1`}>
        {showImage && (
          <div className="flex-shrink-0">
            <img 
              src={product.image} 
              alt={product.name}
              className={`${config.imageSize} object-cover rounded border`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yNCAyOEMyNi4yMDkxIDI4IDI4IDI2LjIwOTEgMjggMjRDMjggMjEuNzkwOSAyNi4yMDkxIDIwIDI0IDIwQzIxLjc5MDkgMjAgMjAgMjEuNzkwOSAyMCAyNEMyMCAyNi4yMDkxIDIxLjc5MDkgMjggMjQgMjhaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
              }}
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium truncate">
              {product.name}
            </span>
            {showBrand && product.brand && (
              <Badge variant="outline" className="text-xs">
                {product.brand}
              </Badge>
            )}
          </div>
          
          {config.showDetails && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {showProductId && (
                <>
                  <span>#{product.id}</span>
                  <span>•</span>
                </>
              )}
              <span>x{item.quantity}</span>
              <span>•</span>
              <span>{formatPrice(item.unitPrice)} l'unité</span>
              {showStock && product.stockQuantity <= 10 && (
                <>
                  <span>•</span>
                  <span className={product.stockQuantity === 0 ? 'text-red-600' : 'text-orange-600'}>
                    {product.stockQuantity === 0 ? 'Rupture' : `Stock: ${product.stockQuantity}`}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-end space-y-1">
        <span className="font-medium">
          {formatPrice(totalPrice)}
        </span>
        {showDiscount && product.isOnSale && product.discount > 0 && (
          <Badge variant="secondary" className="text-xs">
            -{product.discount}%
          </Badge>
        )}
      </div>
    </div>
  );
}

// Composants pré-configurés pour différents usages
export function OrderItemCompact(props: Omit<OrderItemDisplayProps, 'variant'>) {
  return <OrderItemDisplay {...props} variant="compact" showImage={false} showStock={false} />;
}

export function OrderItemDetailed(props: Omit<OrderItemDisplayProps, 'variant'>) {
  return <OrderItemDisplay {...props} variant="detailed" showImage={true} showStock={false} />;
}