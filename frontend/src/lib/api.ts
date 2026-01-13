import { Product, CartItem, Order, UserProfile, OrderStatus } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 获取认证 token
const getAuthToken = (): string | null => {
  // 从 localStorage 获取存储的 token
  const token = localStorage.getItem('auth_token');
  if (token) {
    return token;
  }
  return null;
};

// 保存认证 token
export const saveAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

// 清除认证 token
export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// 通用 API 请求函数
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// 认证 API
export const authApi = {
  register: async (data: {
    phone: string;
    password: string;
    nickname: string;
    email?: string;
    address?: string;
    gender?: 'male' | 'female' | 'other';
  }) => {
    return apiRequest<{ message: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (phone: string, password: string) => {
    const result = await apiRequest<{
      message: string;
      session: { access_token: string; refresh_token: string; expires_at: number };
      user: UserProfile & { id: string; is_admin: boolean };
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
    // 保存 token
    if (result.session?.access_token) {
      saveAuthToken(result.session.access_token);
    }
    return result;
  },

  getMe: async () => {
    return apiRequest<UserProfile & { id: string; is_admin: boolean }>('/api/auth/me');
  },
};

// 商品 API
export const productsApi = {
  getAll: async (category?: string, featured?: boolean, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (category && category !== 'All') params.append('category', category);
    if (featured) params.append('featured', 'true');
    
    return apiRequest<{ products: Product[]; pagination: any }>(`/api/products?${params}`);
  },

  getById: async (id: string) => {
    return apiRequest<Product>(`/api/products/${id}`);
  },

  create: async (product: Partial<Product> & { image_url: string; images?: string[] }) => {
    return apiRequest<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  update: async (id: string, product: Partial<Product>) => {
    return apiRequest<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// 购物车 API
export const cartApi = {
  get: async () => {
    return apiRequest<CartItem[]>('/api/cart');
  },

  add: async (productId: string, quantity = 1) => {
    return apiRequest<CartItem>('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  update: async (productId: string, quantity: number) => {
    return apiRequest<CartItem>(`/api/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  remove: async (productId: string) => {
    return apiRequest<{ message: string }>(`/api/cart/${productId}`, {
      method: 'DELETE',
    });
  },
};

// 订单 API
export const ordersApi = {
  getAll: async () => {
    return apiRequest<Order[]>('/api/orders');
  },

  getById: async (id: string) => {
    return apiRequest<Order>(`/api/orders/${id}`);
  },

  create: async (data: {
    customerName: string;
    shippingPhone: string;
    shippingAddress: string;
  }) => {
    return apiRequest<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: string, status: OrderStatus) => {
    return apiRequest<Order>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// 文件上传 API
export const uploadApi = {
  uploadSingle: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/upload/single`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json() as Promise<{ url: string; path: string }>;
  },

  uploadMultiple: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/upload/multiple`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json() as Promise<{ urls: string[]; count: number }>;
  },
};

