const API_BASE = '/api';

interface QueryResult<T> {
  data: T | null;
  error: string | null;
}

class DatabaseClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<QueryResult<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      return await response.json();
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Products
  async getProducts(isActive?: boolean) {
    const query = isActive !== undefined ? `?is_active=${isActive}` : '';
    return this.request(`/products${query}`);
  }

  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async createProductsBulk(products: any[]) {
    return this.request('/products/bulk', {
      method: 'POST',
      body: JSON.stringify({ products }),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders(userId?: string) {
    const query = userId ? `?user_id=${userId}` : '';
    return this.request(`/orders${query}`);
  }

  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id: string, orderData: any) {
    return this.request(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(orderData),
    });
  }

  // Notification Recipients
  async getNotificationRecipients() {
    return this.request('/notification_recipients');
  }

  async createNotificationRecipient(data: any) {
    return this.request('/notification_recipients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNotificationRecipient(id: string, data: any) {
    return this.request(`/notification_recipients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteNotificationRecipient(id: string) {
    return this.request(`/notification_recipients/${id}`, {
      method: 'DELETE',
    });
  }
}

export const db = new DatabaseClient();
