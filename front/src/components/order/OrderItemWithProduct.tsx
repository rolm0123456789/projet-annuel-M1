import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Package } from 'lucide-react';
import { productService } from '@/lib/product-service';
import { Product } from '@/lib/product-service';

interface OrderItem {
  id: number;
  productId: number; // Revenir à number
  quantity: number;
  unitPrice: number;
}

interface OrderItemWithProductProps {
  item: OrderItem;
}

export function OrderItemWithProduct({ item }: OrderItemWithProductProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(false);
        // Utiliser productId directement (maintenant c'est un number)
        const productData = await productService.getProductById(item.productId);
        setProduct(productData);
      } catch (err) {
        console.error(`Erreur lors du chargement du produit ${item.productId}:`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [item.productId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price / 100); // Conversion centimes vers euros
  };

  const totalPrice = item.unitPrice * item.quantity;

  if (loading) {
    return (
      <div className="flex items-center space-x-3 p-3 border rounded-lg">
        <Skeleton className="h-12 w-12 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center space-x-3 p-3 border rounded-lg bg-red-50">
        <div className="h-12 w-12 rounded bg-red-100 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium text-red-700">
            Produit #{item.productId} non trouvé
          </span>
          <div className="text-xs text-red-600">
            Quantité: {item.quantity} × {formatPrice(item.unitPrice)}
          </div>
        </div>
        <span className="font-medium text-red-700">
          {formatPrice(totalPrice)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      {/* Image du produit */}
      <div className="h-12 w-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yNCAyOEMyNi4yMDkxIDI4IDI4IDI2LjIwOTEgMjggMjRDMjggMjEuNzkwOSAyNi4yMDkxIDIwIDI0IDIwQzIxLjc5MDkgMjAgMjAgMjEuNzkwOSAyMCAyNEMyMCAyNi4yMDkxIDIxLjc5MDkgMjggMjQgMjhaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
            }}
          />
        ) : (
          <Package className="h-6 w-6 text-gray-400 m-auto" />
        )}
      </div>

      {/* Détails du produit */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-sm truncate">{product.name}</h4>
          {product.isOnSale && (
            <Badge variant="destructive" className="text-xs">
              -{product.discount}%
            </Badge>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div>{product.brand} • {product.category}</div>
          <div className="flex items-center space-x-2">
            <span>Quantité: {item.quantity}</span>
            <span>×</span>
            <span>{formatPrice(item.unitPrice)}</span>
          </div>
        </div>
      </div>

      {/* Prix total */}
      <div className="text-right">
        <div className="font-medium">
          {formatPrice(totalPrice)}
        </div>
        {product.isOnSale && (
          <div className="text-xs text-muted-foreground line-through">
            {formatPrice(Math.round(totalPrice / (1 - product.discount / 100)))}
          </div>
        )}
      </div>
    </div>
  );
} 