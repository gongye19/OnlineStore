
import React, { useState, useMemo, useEffect } from 'react';
import { Page, Product, CartItem, Order, Category, OrderStatus, UserProfile } from './types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './constants';
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

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('artisan_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    
    const savedLogin = localStorage.getItem('artisan_login');
    const savedAdmin = localStorage.getItem('artisan_admin');
    const savedProfile = localStorage.getItem('artisan_profile');

    if (savedLogin === 'true') {
      setIsLoggedIn(true);
      if (savedAdmin === 'true') setIsAdmin(true);
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    }

    const savedOrders = localStorage.getItem('artisan_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      // Use initial orders if none saved (now updated to match Order type in constants.ts)
      setOrders(INITIAL_ORDERS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('artisan_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('artisan_orders', JSON.stringify(orders));
  }, [orders]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const navigateToDetail = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('detail');
    window.scrollTo(0, 0);
  };

  const handleCheckout = (orderData: { customerName: string; shippingPhone: string; shippingAddress: string }) => {
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      customerName: orderData.customerName,
      shippingPhone: orderData.shippingPhone,
      shippingAddress: orderData.shippingAddress,
      items: [...cart],
      total,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setCurrentPage('my-orders');
    alert('订单已成功提交！');
  };

  const handleLogin = (success: boolean, asAdmin: boolean, profile?: UserProfile) => {
    if (success) {
      setIsLoggedIn(true);
      setIsAdmin(asAdmin);
      if (profile) {
        setUserProfile(profile);
        localStorage.setItem('artisan_profile', JSON.stringify(profile));
      } else {
        const mockProfile: UserProfile = {
          nickname: asAdmin ? '管理员' : '尊贵会员',
          phone: '13800138000',
          email: 'member@artisan.com',
          address: '广东省深圳市南山区艺术工作室',
          gender: 'other'
        };
        setUserProfile(mockProfile);
        localStorage.setItem('artisan_profile', JSON.stringify(mockProfile));
      }
      localStorage.setItem('artisan_login', 'true');
      if (asAdmin) localStorage.setItem('artisan_admin', 'true');
      setCurrentPage('home');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserProfile(null);
    localStorage.removeItem('artisan_login');
    localStorage.removeItem('artisan_admin');
    localStorage.removeItem('artisan_profile');
    setCurrentPage('home');
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
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
      case 'admin-products':
        return <AdminProducts 
          products={products} 
          onAddProduct={(p) => setProducts([p, ...products])}
          onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))}
        />;
      case 'admin-orders':
        return <AdminOrders orders={orders} onUpdateStatus={updateOrderStatus} />;
      default:
        return <Home onShopNow={() => {}} />;
    }
  };

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

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
