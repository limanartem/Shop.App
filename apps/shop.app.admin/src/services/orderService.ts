const API_URL = process.env.REACT_APP_ORDERS_API_URL;

export const orderService = {
  async getAllOrders() {
    const response = await fetch(`${API_URL}/api/orders`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  },

  async updateOrderStatus(orderId: string, status: string) {
    const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }
    return response.json();
  },
};
