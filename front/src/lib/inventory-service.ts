import { authService } from './auth-service';
import { GATEWAY_URL } from './config';

const API_BASE_URL = `${GATEWAY_URL}/api/inventory/Inventory`;

export interface InventoryItem {
  id: number;
  productId: string;
  quantity: string;
  last_updated: string;
}

class InventoryService {
  async getAll(): Promise<InventoryItem[]> {
    const response = await authService.authenticatedFetch(API_BASE_URL);
    if (!response.ok) throw new Error('Impossible de charger l’inventaire');
    return response.json();
  }

  async upsert(productId: number, quantity: number): Promise<InventoryItem> {
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/product/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) throw new Error('Impossible de mettre à jour le stock');
    return response.json();
  }

  async remove(productId: number): Promise<void> {
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/product/${productId}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 404) throw new Error('Impossible de supprimer le stock');
  }
}

export const inventoryService = new InventoryService();
