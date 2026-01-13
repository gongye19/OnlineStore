
import React, { useState, useMemo } from 'react';
import { Product, Category } from '../types';

interface ShopProps {
  products: Product[];
  onViewProduct: (id: string) => void;
}

const ITEMS_PER_PAGE = 3;

const Shop: React.FC<ShopProps> = ({ products, onViewProduct }) => {
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const categories: {label: string, value: Category | 'All'}[] = [
    { label: '全部', value: 'All' },
    { label: '项链', value: 'Necklaces' },
    { label: '手镯', value: 'Bracelets' },
    { label: '耳环', value: 'Earrings' },
    { label: '戒指', value: 'Rings' }
  ];

  // 统一的过渡处理：先淡出，修改数据，再淡入
  const triggerTransition = (action: () => void) => {
    setIsTransitioning(true);
    // 渐变淡出阶段 (300ms)
    setTimeout(() => {
      action();
      // 数据更新后稍微延迟淡入，确保 DOM 已经更新
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  const handleFilterChange = (newFilter: Category | 'All') => {
    if (newFilter === filter || isTransitioning) return;
    triggerTransition(() => {
      setFilter(newFilter);
      setCurrentPage(1);
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage || isTransitioning) return;
    triggerTransition(() => {
      setCurrentPage(newPage);
      // 根据用户要求，不进行 scroll 到顶部的操作
    });
  };

  const filteredProducts = useMemo(() => {
    return filter === 'All' ? products : products.filter(p => p.category === filter);
  }, [products, filter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      <header className="text-center mb-16 space-y-4">
        <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tight">作品廊</h1>
        <p className="text-[9px] uppercase tracking-[0.5em] opacity-40">具象的意图 · Artifacts of Intention</p>
        
        <nav className="flex flex-wrap justify-center items-center gap-6 md:gap-10 pt-8">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleFilterChange(cat.value)}
              className={`text-[11px] uppercase tracking-[0.2em] transition-all duration-500 border-b pb-1 relative ${
                filter === cat.value ? 'border-art-gold text-art-gold opacity-100 font-bold' : 'border-transparent opacity-40 hover:opacity-100'
              }`}
            >
              {cat.label}
              {filter === cat.value && (
                <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-art-gold animate-fade-in"></span>
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* 商品列表容器 - 采用平滑透明度和轻微位移的“渐变”感 */}
      <div 
        className={`transition-all duration-500 ease-in-out ${
          isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-16">
          {paginatedProducts.map((product) => (
            <div 
              key={product.id} 
              className="group cursor-pointer flex flex-col"
              onClick={() => onViewProduct(product.id)}
            >
              <div className="relative aspect-[1/1] bg-white overflow-hidden mb-5 shadow-sm border border-art-charcoal/5">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-serif text-xl font-light text-art-charcoal group-hover:text-art-gold transition-colors">{product.name}</h3>
                <p className="font-serif text-sm opacity-50 italic">¥ {product.price}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && !isTransitioning && (
          <div className="py-32 text-center animate-fade-in">
            <p className="font-serif text-2xl italic opacity-40">该分类下目前没有可选商品。</p>
          </div>
        )}
      </div>

      {/* Pagination - 同样享受渐变动画 */}
      {totalPages > 1 && (
        <div className={`mt-24 flex justify-center items-center gap-4 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <button 
            disabled={currentPage === 1 || isTransitioning}
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            className="p-2 disabled:opacity-10 hover:text-art-gold transition-colors"
          >
            <span className="material-symbols-outlined !text-xl">chevron_left</span>
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                disabled={isTransitioning}
                onClick={() => handlePageChange(pageNum)}
                className={`w-8 h-8 text-[10px] font-bold transition-all rounded-full flex items-center justify-center ${
                  currentPage === pageNum 
                  ? 'bg-art-charcoal text-white' 
                  : 'text-art-charcoal/40 hover:text-art-charcoal hover:bg-art-charcoal/5'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages || isTransitioning}
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            className="p-2 disabled:opacity-10 hover:text-art-gold transition-colors"
          >
            <span className="material-symbols-outlined !text-xl">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Shop;
