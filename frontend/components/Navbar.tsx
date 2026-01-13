
import React, { useState, useEffect } from 'react';
import { Page } from '../types';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  cartCount: number;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, cartCount, isLoggedIn, isAdmin, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shouldAnimateCart, setShouldAnimateCart] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setShouldAnimateCart(true);
      const timer = setTimeout(() => setShouldAnimateCart(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const navItems = [
    { label: '主页', id: 'home' as Page },
    { label: '商品页', id: 'shop' as Page },
    { label: '购物车', id: 'cart' as Page },
  ];

  if (isLoggedIn) {
    navItems.push({ label: '我的订单', id: 'my-orders' as Page });
  }

  if (isLoggedIn && isAdmin) {
    navItems.push({ label: '管理系统', id: 'admin-products' as Page });
  }

  const isAdminView = currentPage.startsWith('admin-');

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isAdminView ? 'bg-art-charcoal text-white' : 'bg-art-sand/90 backdrop-blur-md border-b border-art-charcoal/5'}`}>
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <button 
            onClick={() => setCurrentPage('home')} 
            className="flex items-center gap-2 group"
          >
            <span className={`text-xl font-light tracking-[0.3em] uppercase ${isAdminView ? 'text-white' : 'text-art-charcoal'}`}>Artisan</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsMenuOpen(false);
                }}
                className={`text-[11px] uppercase tracking-[0.2em] transition-all hover:opacity-50 ${
                  currentPage === item.id || (item.id === 'admin-products' && isAdminView) ? 'font-bold border-b border-current pb-1' : 'opacity-70'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {!isAdminView && (
              <button 
                onClick={() => setCurrentPage('cart')}
                className={`relative p-2 hover:opacity-50 transition-all ${shouldAnimateCart ? 'animate-pulse-soft text-art-gold scale-110' : ''}`}
                aria-label="购物车"
              >
                <span className="material-symbols-outlined !text-2xl" aria-hidden="true">shopping_bag</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-art-gold text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {isAdminView && (
               <div className="hidden md:flex items-center gap-4 mr-4 border-r border-white/10 pr-4">
                  <button 
                    onClick={() => setCurrentPage('admin-products')}
                    className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded transition-colors ${currentPage === 'admin-products' ? 'bg-white/10 text-art-gold font-bold' : 'opacity-60 hover:opacity-100'}`}
                  >
                    商品管理
                  </button>
                  <button 
                    onClick={() => setCurrentPage('admin-orders')}
                    className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded transition-colors ${currentPage === 'admin-orders' ? 'bg-white/10 text-art-gold font-bold' : 'opacity-60 hover:opacity-100'}`}
                  >
                    订单管理
                  </button>
               </div>
            )}

            <button 
              onClick={isLoggedIn ? onLogout : () => setCurrentPage('login')}
              className={`flex items-center gap-2 text-[10px] uppercase tracking-widest px-4 py-2 rounded-sm transition-colors ${isAdminView ? 'bg-white text-art-charcoal hover:bg-art-gold hover:text-white' : 'bg-art-charcoal text-white hover:bg-art-gold'}`}
              aria-label={isLoggedIn ? '退出登录' : '登录'}
            >
              <span className="material-symbols-outlined !text-lg" aria-hidden="true">
                {isLoggedIn ? 'logout' : 'person'}
              </span>
              <span className="hidden sm:inline">{isLoggedIn ? '退出' : '登录'}</span>
            </button>
          </div>

          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="菜单"
          >
            <span className="material-symbols-outlined" aria-hidden="true">{isMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`md:hidden absolute top-20 left-0 w-full p-6 flex flex-col gap-6 animate-fade-in ${isAdminView ? 'bg-art-charcoal text-white border-b border-white/10' : 'bg-art-sand border-b border-art-charcoal/10'}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setIsMenuOpen(false);
              }}
              className="text-left text-sm uppercase tracking-widest"
            >
              {item.label}
            </button>
          ))}
          {isAdminView && (
            <div className="pt-4 mt-4 border-t border-white/10 flex flex-col gap-4">
               <button onClick={() => { setCurrentPage('admin-products'); setIsMenuOpen(false); }} className="text-left text-[10px] uppercase tracking-widest text-art-gold">商品管理模块</button>
               <button onClick={() => { setCurrentPage('admin-orders'); setIsMenuOpen(false); }} className="text-left text-[10px] uppercase tracking-widest text-art-gold">订单管理模块</button>
            </div>
          )}
          {!isLoggedIn ? (
            <button 
              onClick={() => { setCurrentPage('login'); setIsMenuOpen(false); }}
              className="text-left text-sm uppercase tracking-widest text-art-gold"
            >
              登录账户
            </button>
          ) : (
             <button 
              onClick={() => { onLogout(); setIsMenuOpen(false); }}
              className="text-left text-sm uppercase tracking-widest text-red-500"
            >
              退出登录
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
