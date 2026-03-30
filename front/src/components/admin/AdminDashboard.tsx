import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Euro,
  ShoppingCart,
  Package,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { productService, type Product, type Category } from '@/lib/product-service';
import { orderService, type OrderModel } from '@/lib/order-service';
import {
  computeRevenue,
  computeOrdersByStatus,
  computeRevenueByDay,
  formatPrice,
  formatDate,
  STATUS_COLORS,
} from '@/lib/admin-utils';

// Chart configs pour shadcn
const revenueChartConfig = {
  revenue: {
    label: 'Revenus',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, o, ls, c] = await Promise.all([
        productService.getAllProducts(),
        orderService.getAllOrders(),
        productService.getLowStockProducts(10),
        productService.getCategories(),
      ]);
      setProducts(p);
      setOrders(o.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLowStock(ls);
      setCategories(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Chargement du tableau de bord...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // KPI calculations
  const revenue = computeRevenue(orders);
  const activeOrders = orders.filter(o =>
    ['en attente', 'confirmée', 'expédiée'].includes(o.status.toLowerCase())
  );
  const pendingCount = orders.filter(o => o.status.toLowerCase() === 'en attente').length;
  const outOfStock = lowStock.filter(p => p.stockQuantity === 0).length;

  // Chart data
  const statusData = Object.entries(computeOrdersByStatus(orders)).map(([name, value]) => ({
    name,
    value,
    fill: STATUS_COLORS[name] || '#94a3b8',
  }));
  const revenueByDay = computeRevenueByDay(orders, 7);

  // Build dynamic chart config for pie chart based on actual statuses
  const pieChartConfig = statusData.reduce<ChartConfig>((acc, item) => {
    acc[item.name] = {
      label: item.name,
      color: item.fill,
    };
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Euro className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">{formatPrice(revenue)}</p>
                <p className="text-xs text-muted-foreground">
                  {orders.filter(o => o.status.toLowerCase() === 'livrée').length} commandes livrées
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commandes en cours</p>
                <p className="text-2xl font-bold">{activeOrders.length}</p>
                <p className="text-xs text-muted-foreground">
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="text-xs">{pendingCount} en attente</Badge>
                  )}
                  {pendingCount === 0 && 'Aucune en attente'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produits</p>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-xs text-muted-foreground">{categories.length} catégories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertes stock</p>
                <p className="text-2xl font-bold">
                  {lowStock.length > 0 ? (
                    <Badge variant="destructive">{lowStock.length}</Badge>
                  ) : (
                    <span className="text-green-600">0</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {outOfStock > 0 ? `${outOfStock} en rupture totale` : 'Tous en stock'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart - Commandes par statut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Commandes par statut</CardTitle>
            <CardDescription>Répartition de toutes les commandes</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[280px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">Aucune commande</p>
            )}
          </CardContent>
        </Card>

        {/* Area Chart - Revenus 7 jours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenus (7 derniers jours)</CardTitle>
            <CardDescription>Évolution du chiffre d'affaires</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="max-h-[280px]">
              <AreaChart data={revenueByDay} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${v}€`} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${Number(value).toFixed(2)}€`, 'Revenus']}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  fillOpacity={0.3}
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dernières commandes</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Aucune commande</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-sm">#{order.id}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className={orderService.getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <span className="font-semibold text-sm">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>Alertes de stock</span>
              {lowStock.length > 0 && <Badge variant="destructive">{lowStock.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Aucune alerte</p>
            ) : (
              <div className="space-y-3">
                {lowStock.slice(0, 5).map(product => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center space-x-3">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium">{product.name}</span>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${product.stockQuantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {product.stockQuantity === 0 ? 'Rupture' : `${product.stockQuantity} restants`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
