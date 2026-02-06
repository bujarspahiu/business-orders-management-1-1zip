// User types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  business_name?: string;
  business_number?: string;
  phone?: string;
  whatsapp?: string;
  viber?: string;
  contact_person?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Product types
export interface Product {
  id: string;
  product_code: string;
  brand: string;
  name: string;
  width?: number;
  aspect_ratio?: number;
  rim_diameter?: number;
  dimensions: string;
  tire_type: 'car' | 'truck' | 'suv' | 'van';
  season: 'summer' | 'winter' | 'all-season';
  stock_quantity: number;
  price: number;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Order types
export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  user?: User;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

// Notification recipient types
export interface NotificationRecipient {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'warehouse' | 'finance' | 'manager';
  is_active: boolean;
  created_at: string;
}

// Activity log types
export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
  user?: User;
}

// Form types
export interface LoginForm {
  username: string;
  password: string;
}

export interface ProductForm {
  product_code: string;
  brand: string;
  name: string;
  width?: number;
  aspect_ratio?: number;
  rim_diameter?: number;
  dimensions: string;
  tire_type: 'car' | 'truck' | 'suv' | 'van';
  season: 'summer' | 'winter' | 'all-season';
  stock_quantity: number;
  price: number;
  description?: string;
  image_url?: string;
  is_active: boolean;
}

export interface UserForm {
  username: string;
  password?: string;
  role: 'admin' | 'user';
  business_name?: string;
  business_number?: string;
  phone?: string;
  whatsapp?: string;
  viber?: string;
  contact_person?: string;
  is_active: boolean;
}
