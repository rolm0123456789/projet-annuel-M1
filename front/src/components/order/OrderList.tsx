import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, RefreshCw, AlertCircle, ShoppingBag } from 'lucide-react';
import { OrderCard } from './OrderCard';
import { OrderModel, orderService } from '@/lib/order-service';
import { useAuth } from '@/contexts/AuthContext';

export function OrderList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      const userOrders = await orderService.getUserOrders(user.id);
      setOrders(userOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const handleOrderDeleted = (orderId: number) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
  };

  const handleViewDetails = (orderId: number) => {
    // TODO: Implémenter la vue détaillée d'une commande
    console.log('Voir détails de la commande:', orderId);
  };

  // Filtrer les commandes par statut
  const activeOrders = orders.filter(order => 
    !['Livrée', 'Annulée'].includes(order.status)
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
            <span>Chargement de vos commandes...</span>
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

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Aucune commande</h3>
              <p className="text-muted-foreground">
                Vous n'avez pas encore passé de commande.
              </p>
            </div>
            <Button onClick={() => window.location.href = '/'}>
              Commencer mes achats
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Mes Commandes</h2>
          <span className="text-muted-foreground">({orders.length})</span>
        </div>
        
        <Button onClick={loadOrders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <span>En cours</span>
            {activeOrders.length > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {activeOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center space-x-2">
            <span>Terminées</span>
            {completedOrders.length > 0 && (
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                {completedOrders.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Aucune commande en cours</p>
              </CardContent>
            </Card>
          ) : (
            activeOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onOrderDeleted={handleOrderDeleted}
                onViewDetails={handleViewDetails}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Aucune commande terminée</p>
              </CardContent>
            </Card>
          ) : (
            completedOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onOrderDeleted={handleOrderDeleted}
                onViewDetails={handleViewDetails}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 