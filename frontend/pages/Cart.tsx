
import React, { useState, useEffect } from 'react';
import { CartItem, UserProfile } from '../types';

interface CartProps {
  cart: CartItem[];
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: (data: { customerName: string; shippingPhone: string; shippingAddress: string }) => void;
  onNavigateToLogin: () => void;
  onNavigateToShop: () => void;
}

const Cart: React.FC<CartProps> = ({ cart, isLoggedIn, userProfile, onUpdateQuantity, onRemove, onCheckout, onNavigateToLogin, onNavigateToShop }) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    if (isLoggedIn && userProfile) {
      setCustomerName(userProfile.nickname || '');
      setPhone(userProfile.phone || '');
      setAddress(userProfile.address || '');
    }
  }, [isLoggedIn, userProfile]);

  const categoryMap: any = {
    'Necklaces': '项链',
    'Bracelets': '手镯',
    'Earrings': '耳环',
    'Rings': '戒指'
  };

  const handleCheckoutClick = () => {
    if (!isLoggedIn) {
      onNavigateToLogin();
      return;
    }
    if (!customerName || !phone || !address) {
      alert('请完善收货人信息。');
      return;
    }
    
    // User confirmation check with full details
    if (confirm(`请最后确认您的配送信息：\n\n收货人：${customerName}\n联系电话：${phone}\n收货地址：${address}\n\n确认无误后点击确定完成下单。`)) {
      onCheckout({ 
        customerName, 
        shippingPhone: phone, 
        shippingAddress: address 
      });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-40 text-center animate-fade-in">
        <h2 className="font-serif text-4xl font-light mb-6 opacity-40 italic">您的收藏夹目前空空如也。</h2>
        <button 
          onClick={onNavigateToShop} 
          className="text-[10px] uppercase tracking-widest border border-art-charcoal px-8 py-3 hover:bg-art-charcoal hover:text-white transition-all"
        >
          开始探索作品廊
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 animate-fade-in">
      <h1 className="font-serif text-5xl font-light mb-16 text-center">您的选择</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        <div className="lg:col-span-8 space-y-12">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-8 border-b border-art-charcoal/5 pb-12">
              <div className="w-32 aspect-square bg-white flex-shrink-0 border border-art-charcoal/5">
                <img src={item.image} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-2xl font-light">{item.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest opacity-40 mt-1">{categoryMap[item.category] || item.category}</p>
                  </div>
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="p-1 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="flex items-center border border-art-charcoal/10 rounded">
                    <button onClick={() => onUpdateQuantity(item.id, -1)} className="px-3 py-1 hover:bg-art-charcoal/5">-</button>
                    <span className="px-4 py-1 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, 1)} className="px-3 py-1 hover:bg-art-charcoal/5">+</button>
                  </div>
                  <p className="font-serif text-xl italic">¥ {item.price * item.quantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 bg-white p-10 shadow-sm space-y-10 h-fit sticky top-32 border border-art-charcoal/5">
          <h2 className="font-serif text-3xl font-light border-b border-art-charcoal/5 pb-6">结算摘要</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between text-xs uppercase tracking-widest opacity-60">
              <span>小计</span>
              <span>¥ {total}</span>
            </div>
            <div className="flex justify-between text-xs uppercase tracking-widest opacity-60">
              <span>运费</span>
              <span>免运费</span>
            </div>
            <div className="h-[1px] bg-art-charcoal/10 my-4"></div>
            <div className="flex justify-between font-serif text-2xl">
              <span>总计</span>
              <span>¥ {total}</span>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <div className="border border-art-gold/20 bg-art-sand p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest font-bold text-art-gold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined !text-sm">verified_user</span>
                    确认配送信息 (可修改)
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-art-charcoal/40">收货人姓名</label>
                    <input 
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="收货人..."
                      className="w-full border-x-0 border-t-0 border-b border-art-charcoal/10 focus:ring-0 focus:border-art-gold bg-transparent py-1 px-0 text-sm font-light"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-art-charcoal/40">联系电话</label>
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="联系电话..."
                      className="w-full border-x-0 border-t-0 border-b border-art-charcoal/10 focus:ring-0 focus:border-art-gold bg-transparent py-1 px-0 text-sm font-light"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-art-charcoal/40">配送地址</label>
                    <textarea 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="详细地址..."
                      rows={2}
                      className="w-full border-x-0 border-t-0 border-b border-art-charcoal/10 focus:ring-0 focus:border-art-gold bg-transparent py-1 px-0 text-sm font-light resize-none"
                    />
                  </div>
                </div>
            </div>

            <button 
              onClick={handleCheckoutClick}
              className="w-full py-5 bg-art-charcoal text-white text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-art-gold transition-all shadow-lg active:scale-[0.98]"
            >
              {isLoggedIn ? '确认并下单支付' : '请先登录以结算'}
            </button>
            <p className="text-[8px] text-center uppercase tracking-widest opacity-30">
                支持 7 天无理由退换货（定制件除外）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
