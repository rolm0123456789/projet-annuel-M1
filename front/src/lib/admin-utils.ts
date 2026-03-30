import type { OrderModel } from './order-service';
import type { Product } from './product-service';

export function computeRevenue(orders: OrderModel[]): number {
  return orders
    .filter(o => o.status.toLowerCase() === 'livrée')
    .reduce((sum, o) => sum + o.totalAmount, 0);
}

export function computeOrdersByStatus(orders: OrderModel[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const order of orders) {
    result[order.status] = (result[order.status] || 0) + 1;
  }
  return result;
}

export function computeRevenueByDay(orders: OrderModel[], days: number = 7): Array<{ date: string; revenue: number }> {
  const now = new Date();
  const result: Array<{ date: string; revenue: number }> = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayRevenue = orders
      .filter(o => {
        const orderDate = new Date(o.createdAt);
        const status = o.status.toLowerCase();
        return orderDate >= dayStart && orderDate < dayEnd && (status === 'livrée' || status === 'confirmée' || status === 'expédiée');
      })
      .reduce((sum, o) => sum + o.totalAmount, 0);

    result.push({ date: dateStr, revenue: dayRevenue / 100 });
  }

  return result;
}

export function computeAverageOrderValue(orders: OrderModel[]): number {
  if (orders.length === 0) return 0;
  const total = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  return total / orders.length;
}

export function computeCompletionRate(orders: OrderModel[]): number {
  if (orders.length === 0) return 0;
  const delivered = orders.filter(o => o.status.toLowerCase() === 'livrée').length;
  return Math.round((delivered / orders.length) * 100);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

export function getStockBadgeVariant(product: Product): { label: string; className: string } {
  if (product.stockQuantity === 0) return { label: 'Rupture', className: 'bg-red-100 text-red-800' };
  if (product.stockQuantity <= 10) return { label: 'Stock limité', className: 'bg-orange-100 text-orange-800' };
  return { label: 'En stock', className: 'bg-green-100 text-green-800' };
}

// Couleurs pour le graphique des statuts
export const STATUS_COLORS: Record<string, string> = {
  'En attente': '#eab308',
  'Confirmée': '#3b82f6',
  'Expédiée': '#a855f7',
  'Livrée': '#22c55e',
  'Annulée': '#ef4444',
};
