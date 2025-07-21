import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Package, 
  RefreshCw, 
  AlertCircle, 
  ShoppingBag, 
  CheckCircle, 
  XCircle,
  Clock,
  Truck,
  Calendar,
  User
} from 'lucide-react';
import { type OrderModel, orderService } from '@/lib/order-service';
import { useAuth } from '@/contexts/AuthContext';
import { OrderItemDisplay } from '@/components/order/OrderItemDisplay';

const ORDER_STATUSES = [
  { value: 'En attente', label: 'En attente', icon: Clock },
  { value: 'Confirmée', label: 'Confirmée', icon: CheckCircle },
  { value: 'Expédiée', label: 'Expédiée', icon: Truck },
  { value: 'Livrée', label: 'Livrée', icon: Package },
  { value: 'Annulée', label: 'Annulée', icon: XCircle },
];

export function AdminOrderManagement() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Redirection si pas admin
  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Accès refusé</h3>
              <p className="text-muted-foreground">
                Cette section est réservée aux administrateurs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allOrders = await orderService.getAllOrders();
      // Trier par date de création (plus récentes en premier)
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(allOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    
    try {
      await orderService.updateOrder(orderId, { status: newStatus });
      
      // Mettre à jour localement
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price / 100); // Les prix backend sont en centimes
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrer les commandes par statut
  const pendingOrders = orders.filter(order => order.status === 'En attente');
  const activeOrders = orders.filter(order => 
    ['Confirmée', 'Expédiée'].includes(order.status)
  );
  const completedOrders = orders.filter(order => 
    ['Livrée', 'Annulée'].includes(order.status)
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Chargement des commandes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Erreur de chargement</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button onClick={loadOrders} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const OrderCard = ({ order }: { order: OrderModel }) => {
    const totalItems = order.items.reduce((total, item) => total + item.quantity, 0);
    
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Commande #{order.id}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge 
                className={orderService.getStatusColor(order.status)}
                variant="secondary"
              >
                {orderService.getStatusIcon(order.status)} {order.status}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Utilisateur #{order.userId}</span>
            </div>
            <div>
              {totalItems} article{totalItems > 1 ? 's' : ''}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Articles de la commande */}
              {order.items.map((item) => (
                <OrderItemDisplay
                  key={item.id} 
                  item={item}
                />
              ))}

          {/* Actions et total */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">
              Total: {formatPrice(order.totalAmount)}
            </div>
            
            <div className="flex items-center space-x-2">
              <Select
                value={order.status}
                onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                disabled={updatingOrderId === order.id}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => {
                    const IconComponent = status.icon;
                    return (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{status.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {updatingOrderId === order.id && (
                <RefreshCw className="h-4 w-4 animate-spin" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
          <Badge variant="outline">Admin</Badge>
        </div>
        
        <Button onClick={loadOrders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Aucune commande</h3>
                <p className="text-muted-foreground">
                  Aucune commande n'a été passée pour le moment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>En attente</span>
              {pendingOrders.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span>En cours</span>
              {activeOrders.length > 0 && (
                <Badge variant="default" className="ml-1">
                  {activeOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Terminées</span>
              <Badge variant="secondary" className="ml-1">
                {completedOrders.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Aucune commande en attente</p>
                </CardContent>
              </Card>
            ) : (
              pendingOrders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Truck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Aucune commande en cours</p>
                </CardContent>
              </Card>
            ) : (
              activeOrders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Aucune commande terminée</p>
                </CardContent>
              </Card>
            ) : (
              completedOrders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 