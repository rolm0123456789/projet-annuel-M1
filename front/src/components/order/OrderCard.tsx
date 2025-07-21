import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, Package, Eye, Trash2 } from 'lucide-react';
import { OrderModel } from '@/lib/order-service';
import { orderService } from '@/lib/order-service';
import { OrderItemWithProduct } from './OrderItemWithProduct';

interface OrderCardProps {
  order: OrderModel;
  onOrderDeleted?: (orderId: number) => void;
  onViewDetails?: (orderId: number) => void;
}

export function OrderCard({ order, onOrderDeleted, onViewDetails }: OrderCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price / 100); // Conversion centimes vers euros
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteOrder = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }

    try {
      await orderService.deleteOrder(order.id);
      onOrderDeleted?.(order.id);
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    }
  };

  // Calculer le nombre total d'articles
  const totalItems = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Commande #{order.id}</span>
          </CardTitle>
          <Badge 
            className={orderService.getStatusColor(order.status)}
            variant="secondary"
          >
            {orderService.getStatusIcon(order.status)} {order.status}
          </Badge>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div>
            {totalItems} article{totalItems > 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Articles de la commande avec détails produits */}
        <div className="space-y-3">
          {order.items.map((item) => (
            <OrderItemWithProduct key={item.id} item={item} />
          ))}
        </div>

        <Separator />

        {/* Total et actions */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">
            Total: {formatPrice(order.totalAmount)}
          </div>
          
          <div className="flex space-x-2">
            {onViewDetails && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails(order.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Détails
              </Button>
            )}
            
            {/* Permettre la suppression seulement pour certains statuts */}
            {['En attente', 'Annulée'].includes(order.status) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDeleteOrder}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 