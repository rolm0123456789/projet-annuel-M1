import { authService } from './auth-service';

import { GATEWAY_URL } from './config';

const API_BASE_URL = `${GATEWAY_URL}/api/orders/Order`;

export interface OrderModel {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItemModel[];
}

export interface OrderItemModel {
  id: number;
  orderId: number;
  productId: number; // Revenir à number
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderRequest {
  userId: number;
  status: string;
  totalAmount: number;
  items: Omit<OrderItemModel, 'id' | 'orderId'>[];
}

export interface UpdateOrderRequest {
  totalAmount?: number;
  status?: string;
}

class OrderService {
  async getAllOrders(): Promise<OrderModel[]> {
    const response = await authService.authenticatedFetch(API_BASE_URL);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des commandes: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getOrderById(id: number): Promise<OrderModel> {
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Commande non trouvée');
      }
      throw new Error(`Erreur lors de la récupération de la commande: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getUserOrders(userId: number): Promise<OrderModel[]> {
    // Pour l'instant, on récupère toutes les commandes et on filtre côté client
    // TODO: Améliorer l'API backend pour ajouter un endpoint /orders/user/{userId}
    const allOrders = await this.getAllOrders();
    return allOrders.filter(order => order.userId === userId);
  }

  async createOrder(orderData: CreateOrderRequest): Promise<OrderModel> {
    const response = await authService.authenticatedFetch(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de la création de la commande: ${errorText}`);
    }

    return response.json();
  }

  async updateOrder(id: number, orderData: UpdateOrderRequest): Promise<void> {
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de la mise à jour de la commande: ${errorText}`);
    }
  }

  async deleteOrder(id: number): Promise<void> {
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de la suppression de la commande: ${errorText}`);
    }
  }

  // Méthode utilitaire pour créer une commande depuis le panier
  async createOrderFromCart(cartItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>): Promise<OrderModel> {
    const user = authService.getUser();
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    const totalAmount = cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );

    const orderItems = cartItems.map(item => ({
      productId: parseInt(item.id), // Convertir string vers number
      quantity: item.quantity,
      unitPrice: item.price,
    }));

    const orderData: CreateOrderRequest = {
      userId: user.id,
      status: 'En attente',
      totalAmount,
      items: orderItems,
    };

    return this.createOrder(orderData);
  }

  // Méthodes utilitaires pour les statuts de commande
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'en attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmée':
        return 'bg-blue-100 text-blue-800';
      case 'expédiée':
        return 'bg-purple-100 text-purple-800';
      case 'livrée':
        return 'bg-green-100 text-green-800';
      case 'annulée':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'en attente':
        return '⏳';
      case 'confirmée':
        return '✅';
      case 'expédiée':
        return '🚚';
      case 'livrée':
        return '📦';
      case 'annulée':
        return '❌';
      default:
        return '📋';
    }
  }
}

export const orderService = new OrderService(); 