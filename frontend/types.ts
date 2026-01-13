
export type Category = 'Necklaces' | 'Bracelets' | 'Earrings' | 'Rings';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  image: string; // Primary image
  images?: string[]; // All images including primary
  stock: number;
  featured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Return Requested' | 'Exchange Requested';

export interface Order {
  id: string;
  customerName: string;
  shippingPhone: string;
  shippingAddress: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
}

export interface UserProfile {
  phone: string;
  nickname: string;
  email: string;
  address: string;
  gender: 'male' | 'female' | 'other';
}

export type Page = 'home' | 'shop' | 'cart' | 'detail' | 'admin-products' | 'admin-orders' | 'my-orders' | 'login' | 'register';
