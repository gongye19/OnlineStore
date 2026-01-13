
import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Leaf, Truck } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
  onAddToCart: (p: Product) => void;
  onViewProduct: (id: string) => void;
  onNavigateToCart: () => void;
  onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, allProducts, onAddToCart, onViewProduct, onNavigateToCart, onBack }) => {
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [showToast, setShowToast] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const categoryMap: any = {
    'Necklaces': '项项链',
    'Bracelets': '手镯',
    'Earrings': '耳环',
    'Rings': '戒指'
  };

  const displayImages = useMemo(() => {
    if (product.images && product.images.length > 0) return product.images;
    return [
        product.image,
        "https://images.unsplash.com/photo-1543290954-9642f323df0e?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1531995811006-35cb42e1a022?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1573408302185-91ff6f9c98b7?auto=format&fit=crop&q=80&w=400"
    ];
  }, [product.image, product.images]);

  useEffect(() => {
    setSelectedImage(product.image);
    setIsExiting(false);
  }, [product]);

  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(product);
    setShowToast(true);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 1500);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleBuyNow = () => {
    setIsBuying(true);
    // Simulate process and then start page exit animation for a smooth transition
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onAddToCart(product);
        onNavigateToCart();
      }, 500);
    }, 600);
  };

  const recommendations = useMemo(() => {
    const others = allProducts.filter(p => p.id !== product.id);
    const shuffled = [...others].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [allProducts, product.id]);

  return (
    <div className={`max-w-[1000px] mx-auto px-6 py-8 md:py-16 transition-all duration-700 ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-fade-in'}`}>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-slide-down">
          <div className="glass-morphism text-white px-8 py-4 rounded-sm flex items-center gap-3 shadow-2xl border border-white/10">
            <span className="material-symbols-outlined text-art-gold !text-lg font-bold">check_circle</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">作品已成功加入收藏清单</span>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 group mb-8 opacity-40 hover:opacity-100 transition-opacity"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-[9px] uppercase tracking-[0.3em] font-bold">返回作品廊</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        {/* Left Column: Images */}
        <div className="md:col-span-7 space-y-4">
          <div className="aspect-[4/5] bg-white overflow-hidden shadow-sm border border-art-charcoal/5">
            <img 
              src={selectedImage} 
              alt={product.name} 
              className="w-full h-full object-cover transition-all duration-[1s]"
            />
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {displayImages.map((img, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`aspect-square bg-white overflow-hidden border cursor-pointer transition-all duration-300 ${
                  selectedImage === img ? 'border-art-gold ring-1 ring-art-gold opacity-100' : 'border-art-charcoal/5 opacity-40 hover:opacity-80'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Information */}
        <div className="md:col-span-5 space-y-8 md:pl-4">
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-[0.5em] text-art-gold font-bold">
              {categoryMap[product.category] || product.category}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-art-charcoal leading-tight">
              {product.name}
            </h1>
            <p className="font-serif text-xl text-art-charcoal/60 italic mt-2">
              ¥ {product.price.toLocaleString()}
            </p>
          </div>

          <div className="h-[1px] w-8 bg-art-gold/30"></div>

          <div className="space-y-6">
            <p className="text-sm font-light leading-relaxed text-art-charcoal/70">
              {product.description}
            </p>
            
            <div className="pt-4 border-t border-art-charcoal/5 space-y-3">
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-art-charcoal/50 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>伦理手工打造</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-art-charcoal/50 font-medium">
                <Leaf className="w-4 h-4" />
                <span>回收天然材料</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-art-charcoal/50 font-medium">
                <Truck className="w-4 h-4" />
                <span>全国顺丰包邮</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || isAdding}
                className={`w-full py-4 text-[10px] uppercase tracking-[0.4em] font-bold transition-all relative overflow-hidden ${
                  product.stock > 0 
                  ? (isAdding ? 'bg-art-teal text-white' : 'bg-art-charcoal text-white hover:bg-art-teal')
                  : 'bg-art-charcoal/10 text-art-charcoal/30 cursor-not-allowed'
                }`}
              >
                <div className={`flex items-center justify-center gap-2 transition-transform duration-300 ${isAdding ? 'scale-110' : 'scale-100'}`}>
                  {isAdding && <CheckCircle2 className="w-4 h-4" />}
                  <span>{isAdding ? '已加入收藏' : '加入收藏列表'}</span>
                </div>
              </button>
              
              <button 
                onClick={handleBuyNow}
                disabled={isBuying}
                className={`w-full py-4 border border-art-charcoal/10 text-art-charcoal text-[10px] uppercase tracking-[0.4em] font-bold transition-all relative overflow-hidden ${
                  isBuying ? 'bg-art-sand opacity-70' : 'hover:bg-art-sand'
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  {isBuying && (
                    <svg className="animate-spin h-3 w-3 text-art-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{isBuying ? '正在准备结算...' : '立即购买'}</span>
                </div>
              </button>
            </div>
            <p className="text-[8px] text-center uppercase tracking-[0.2em] text-art-charcoal/40">
              剩余库存：{product.stock} 件手工孤品
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      {recommendations.length > 0 && (
        <section className="mt-24 pt-16 border-t border-art-charcoal/5">
          <h3 className="font-serif text-2xl font-light text-center mb-12">您可能也喜欢</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {recommendations.map((item) => (
              <div 
                key={item.id} 
                className="group space-y-3 cursor-pointer"
                onClick={() => onViewProduct(item.id)}
              >
                <div className="aspect-square bg-art-sand overflow-hidden border border-art-charcoal/5 shadow-sm">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-serif group-hover:text-art-gold transition-colors">{item.name}</p>
                  <p className="text-[9px] opacity-40 font-serif">¥ {item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
