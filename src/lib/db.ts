const isNativeApp = typeof (window as any)?.Capacitor !== 'undefined' && (window as any)?.Capacitor?.isNativePlatform?.();

const PRODUCTION_URL = ((window as any).__LASSA_API_URL__ || '').replace(/\/+$/, '');

if (isNativeApp && !PRODUCTION_URL) {
  console.error(
    'Lassa Tyres: Server URL is not configured. ' +
    'Please rebuild the app using the prepare-mobile.sh script with your published server URL.'
  );
}

const API_BASE = isNativeApp && PRODUCTION_URL ? `${PRODUCTION_URL}/api` : '/api';

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
  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
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
