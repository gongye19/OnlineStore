
import React, { useState, useMemo, useEffect } from 'react';
import { Page, Product, CartItem, Order, Category, OrderStatus, UserProfile } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import { productsApi, cartApi, ordersApi, authApi, clearAuthToken } from './src/lib/api';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 初始化：检查登录状态并加载数据
  useEffect(() => {
    const init = async () => {
      try {
        // 检查是否有保存的 token
        const token = localStorage.getItem('auth_token');
        if (token) {
          // 验证 token 并获取用户信息
          try {
            const user = await authApi.getMe();
            setIsLoggedIn(true);
            setIsAdmin(user.is_admin || false);
            setUserProfile({
              phone: user.phone,
              nickname: user.nickname,
              email: user.email || '',
              address: user.address || '',
              gender: user.gender as 'male' | 'female' | 'other'
            });
            // 加载购物车和订单
            await loadCart();
            await loadOrders();
          } catch (error) {
            // Token 无效，清除
            clearAuthToken();
          }
        }
        
        // 加载商品列表
        await loadProducts();
      } catch (error) {
        console.error('初始化失败:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 加载商品列表
  const loadProducts = async () => {
    try {
      const response = await productsApi.getAll();
      // 转换数据格式（API 返回的格式）
      const formattedProducts = response.products.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: parseFloat(p.price),
        category: p.category,
        description: p.description,
        image: p.image_url,
        images: p.images || [p.image_url],
        stock: p.stock,
        featured: p.featured
      }));
      setProducts(formattedProducts);
    } catch (error) {
      console.error('加载商品失败:', error);
    }
  };

  // 加载购物车
  const loadCart = async () => {
    try {
      const cartItems = await cartApi.get();
      setCart(cartItems);
    } catch (error) {
      console.error('加载购物车失败:', error);
    }
  };

  // 加载订单
  const loadOrders = async () => {
    try {
      const orderList = await ordersApi.getAll();
      setOrders(orderList);
    } catch (error) {
      console.error('加载订单失败:', error);
    }
  };

  const addToCart = async (product: Product) => {
    if (!isLoggedIn) {
      setCurrentPage('login');
      return;
    }
    try {
      await cartApi.add(product.id, 1);
      await loadCart();
    } catch (error: any) {
      alert(error.message || '添加到购物车失败');
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await cartApi.remove(productId);
      await loadCart();
    } catch (error: any) {
      alert(error.message || '删除失败');
    }
  };

  const updateQuantity = async (productId: string, delta: number) => {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    const newQty = Math.max(1, item.quantity + delta);
    try {
      await cartApi.update(productId, newQty);
      await loadCart();
    } catch (error: any) {
      alert(error.message || '更新数量失败');
    }
  };

  const navigateToDetail = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('detail');
    window.scrollTo(0, 0);
  };

  const handleCheckout = async (orderData: { customerName: string; shippingPhone: string; shippingAddress: string }) => {
    try {
      const newOrder = await ordersApi.create(orderData);
      setOrders(prev => [newOrder, ...prev]);
      await loadCart(); // 购物车会被后端清空
      setCurrentPage('my-orders');
      alert('订单已成功提交！');
    } catch (error: any) {
      alert(error.message || '提交订单失败');
    }
  };

  const handleLogin = async (success: boolean, asAdmin: boolean, profile?: UserProfile) => {
    if (success && profile) {
      setIsLoggedIn(true);
      setIsAdmin(asAdmin);
      setUserProfile(profile);
      // 登录后加载购物车和订单
      await loadCart();
      await loadOrders();
      setCurrentPage('home');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserProfile(null);
    clearAuthToken();
    setCart([]);
    setOrders([]);
    setCurrentPage('home');
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const updatedOrder = await ordersApi.updateStatus(id, status);
      setOrders(orders.map(o => o.id === id ? updatedOrder : o));
    } catch (error: any) {
      alert(error.message || '更新订单状态失败');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onShopNow={() => setCurrentPage('shop')} />;
      case 'shop':
        return <Shop products={products} onViewProduct={navigateToDetail} />;
      case 'detail':
        const product = products.find(p => p.id === selectedProductId);
        return product ? (
          <ProductDetail 
            product={product} 
            allProducts={products}
            onAddToCart={addToCart} 
            onViewProduct={navigateToDetail}
            onNavigateToCart={() => setCurrentPage('cart')}
            onBack={() => setCurrentPage('shop')}
          />
        ) : <Home onShopNow={() => {}} />;
      case 'cart':
        return <Cart 
          cart={cart} 
          isLoggedIn={isLoggedIn}
          userProfile={userProfile}
          onUpdateQuantity={updateQuantity} 
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
          onNavigateToLogin={() => setCurrentPage('login')}
          onNavigateToShop={() => setCurrentPage('shop')}
        />;
      case 'my-orders':
        return <MyOrders orders={orders} onUpdateStatus={updateOrderStatus} />;
      case 'login':
      case 'register':
        return <Login 
          onLogin={handleLogin} 
          onNavigateToRegister={() => setCurrentPage('register')}
          currentPage={currentPage}
        />;
      case 'change-password':
        return <ChangePassword />;
      case 'admin-products':
        return <AdminProducts 
          products={products} 
          onAddProduct={async (p) => {
            await loadProducts();
          }}
          onDeleteProduct={async (id) => {
            await loadProducts();
          }}
        />;
      case 'admin-orders':
        return <AdminOrders orders={orders} onUpdateStatus={updateOrderStatus} />;
      default:
        return <Home onShopNow={() => {}} />;
    }
  };

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-art-gold mx-auto mb-4"></div>
          <p className="text-art-charcoal/60">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        cartCount={cartCount} 
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
      <main className="flex-grow pt-24">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
