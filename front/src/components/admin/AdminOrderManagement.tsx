import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  User,
  Search,
  Trash2,
  Loader2,
  Euro,
  TrendingUp,
  BarChart3,
  Eye,
} from 'lucide-react';
import { type OrderModel, orderService } from '@/lib/order-service';
import { useAuth } from '@/contexts/AuthContext';
import { OrderItemDisplay } from '@/components/order/OrderItemDisplay';
import {
  formatDate,
  formatPrice,
  computeAverageOrderValue,
  computeCompletionRate,
} from '@/lib/admin-utils';

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

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Detail dialog
  const [detailOrder, setDetailOrder] = useState<OrderModel | null>(null);

  // Delete dialog
  const [deletingOrder, setDeletingOrder] = useState<OrderModel | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Accès refusé</h3>
              <p className="text-muted-foreground">Cette section est réservée aux administrateurs.</p>
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
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(allOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await orderService.updateOrder(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingOrder) return;
    setDeleteSubmitting(true);
    try {
      await orderService.deleteOrder(deletingOrder.id);
      setOrders(prev => prev.filter(o => o.id !== deletingOrder.id));
      setDeletingOrder(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        String(o.id).includes(q) || String(o.userId).includes(q)
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter(o => new Date(o.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setDate(to.getDate() + 1);
      result = result.filter(o => new Date(o.createdAt) < to);
    }

    return result;
  }, [orders, searchQuery, dateFrom, dateTo]);

  const pendingOrders = filteredOrders.filter(o => o.status === 'En attente');
  const activeOrders = filteredOrders.filter(o => ['Confirmée', 'Expédiée'].includes(o.status));
  const completedOrders = filteredOrders.filter(o => ['Livrée', 'Annulée'].includes(o.status));

  // Stats
  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgValue = computeAverageOrderValue(orders);
  const completionRate = computeCompletionRate(orders);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          <span>Chargement des commandes...</span>
        </CardContent>
      </Card>
    );
  }

  if (error && orders.length === 0) {
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
              <RefreshCw className="h-4 w-4 mr-2" />Réessayer
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
              <Badge className={orderService.getStatusColor(order.status)} variant="secondary">
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
            <div>{totalItems} article{totalItems > 1 ? 's' : ''}</div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {order.items.map(item => (
            <OrderItemDisplay key={item.id} item={item} />
          ))}

          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">
              Total: {formatPrice(order.totalAmount)}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setDetailOrder(order)}>
                <Eye className="h-4 w-4 mr-1" />Détails
              </Button>
              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setDeletingOrder(order)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Select
                value={order.status}
                onValueChange={newStatus => handleStatusChange(order.id, newStatus)}
                disabled={updatingOrderId === order.id}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map(status => {
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

              {updatingOrderId === order.id && <RefreshCw className="h-4 w-4 animate-spin" />}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Gestion des Commandes</h1>
          <Badge variant="outline">Admin</Badge>
        </div>
        <Button onClick={loadOrders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />Actualiser
        </Button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-800 rounded-md border border-red-200">
          <AlertCircle className="h-4 w-4" /><span>{error}</span>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Total commandes</p>
                <p className="text-xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Euro className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Montant total</p>
                <p className="text-xl font-bold">{formatPrice(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-muted-foreground">Panier moyen</p>
                <p className="text-xl font-bold">{formatPrice(avgValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">Taux complétion</p>
                <p className="text-xl font-bold">{completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par ID ou utilisateur..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="Du" />
        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="Au" />
      </div>

      {/* Order tabs */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Aucune commande</h3>
                <p className="text-muted-foreground">Aucune commande trouvée avec ces filtres.</p>
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
              {pendingOrders.length > 0 && <Badge variant="destructive" className="ml-1">{pendingOrders.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span>En cours</span>
              {activeOrders.length > 0 && <Badge variant="default" className="ml-1">{activeOrders.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Terminées</span>
              <Badge variant="secondary" className="ml-1">{completedOrders.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingOrders.length === 0 ? (
              <Card><CardContent className="py-8 text-center"><Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground">Aucune commande en attente</p></CardContent></Card>
            ) : pendingOrders.map(order => <OrderCard key={order.id} order={order} />)}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <Card><CardContent className="py-8 text-center"><Truck className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground">Aucune commande en cours</p></CardContent></Card>
            ) : activeOrders.map(order => <OrderCard key={order.id} order={order} />)}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <Card><CardContent className="py-8 text-center"><CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground">Aucune commande terminée</p></CardContent></Card>
            ) : completedOrders.map(order => <OrderCard key={order.id} order={order} />)}
          </TabsContent>
        </Tabs>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailOrder} onOpenChange={open => { if (!open) setDetailOrder(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Commande #{detailOrder?.id}</DialogTitle>
            <DialogDescription>
              {detailOrder && (
                <span className="flex items-center gap-3 mt-1">
                  <Badge className={orderService.getStatusColor(detailOrder.status)} variant="secondary">
                    {orderService.getStatusIcon(detailOrder.status)} {detailOrder.status}
                  </Badge>
                  <span>Utilisateur #{detailOrder.userId}</span>
                  <span>{formatDate(detailOrder.createdAt)}</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4">
              <h4 className="font-semibold">Articles</h4>
              {detailOrder.items.map(item => (
                <OrderItemDisplay key={item.id} item={item} />
              ))}
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-lg font-bold">Total: {formatPrice(detailOrder.totalAmount)}</span>
                <Select
                  value={detailOrder.status}
                  onValueChange={newStatus => {
                    handleStatusChange(detailOrder.id, newStatus);
                    setDetailOrder(prev => prev ? { ...prev, status: newStatus } : null);
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map(status => {
                      const IconComponent = status.icon;
                      return (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-4 w-4" /><span>{status.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingOrder} onOpenChange={open => { if (!open) setDeletingOrder(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la commande</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la commande #{deletingOrder?.id} ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletingOrder(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteSubmitting}>
              {deleteSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
