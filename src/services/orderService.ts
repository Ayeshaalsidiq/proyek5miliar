import { Order } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function submitOrderToBackend(order: Order): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to submit order:', error);
    return false;
  }
}

export async function submitScanTracking(tableNumber: string): Promise<boolean> {
  try {
    await fetch(`${API_BASE_URL}/api/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        tableNumber,
        timestamp: new Date().toLocaleString('id-ID')
      }),
    });
    return true;
  } catch (error) {
    console.error('Failed to submit scan tracking:', error);
    return false;
  }
}
