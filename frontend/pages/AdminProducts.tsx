
import React, { useState, useRef } from 'react';
import { X, Plus, Upload, Trash2, Package } from 'lucide-react';
import { Product, Category } from '../types';
import { productsApi, uploadApi } from '../src/lib/api';

interface AdminProductsProps {
  products: Product[];
  onAddProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const AdminProducts: React.FC<AdminProductsProps> = ({ products, onAddProduct, onDeleteProduct }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'Necklaces',
    description: '',
    stock: 10
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    
    try {
      const fileArray = Array.from(files);
      const result = await uploadApi.uploadMultiple(fileArray);
      setUploadedImages(prev => [...prev, ...result.urls]);
    } catch (error: any) {
      alert(error.message || '图片上传失败');
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedImages.length === 0) {
      alert('请至少上传一张商品图片');
      return;
    }

    try {
      await productsApi.create({
      name: newProduct.name || '未命名作品',
      price: Number(newProduct.price) || 0,
      category: (newProduct.category as Category) || 'Necklaces',
      description: newProduct.description || '',
        image_url: uploadedImages[0],
        images: uploadedImages,
      stock: Number(newProduct.stock) || 0,
      featured: false
      });

      onAddProduct({} as Product); // 触发刷新
    setIsAdding(false);
    setUploadedImages([]);
    setNewProduct({
        name: '', price: 0, category: 'Necklaces', description: '',
        stock: 10
    });
      alert('商品创建成功！');
    } catch (error: any) {
      alert(error.message || '创建商品失败');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 text-art-charcoal font-sans">
      <div className="max-w-[1200px] mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">商品管理</h1>
            <p className="text-gray-500 text-sm mt-1">上传新系列作品或调整现有库存</p>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-art-charcoal text-white px-6 py-3 rounded-sm flex items-center gap-2 hover:bg-art-teal transition-all shadow-lg active:scale-95"
          >
            {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span className="text-xs uppercase tracking-widest font-bold">{isAdding ? '取消上传' : '上传新商品'}</span>
          </button>
        </header>

        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-sm shadow-sm mb-12 animate-fade-in border border-art-charcoal/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">商品名称</label>
                  <input 
                    type="text" required
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="例如：蔚蓝海玻璃吊坠"
                    className="w-full border-gray-200 rounded-sm focus:ring-art-gold focus:border-art-gold transition-all" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">定价 (¥)</label>
                    <input 
                      type="number" required
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                      className="w-full border-gray-200 rounded-sm focus:ring-art-gold" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">库存数量</label>
                    <input 
                      type="number" required
                      value={newProduct.stock}
                      onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                      className="w-full border-gray-200 rounded-sm focus:ring-art-gold" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">作品分类</label>
                  <select 
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value as Category})}
                    className="w-full border-gray-200 rounded-sm focus:ring-art-gold"
                  >
                    <option value="Necklaces">项链</option>
                    <option value="Bracelets">手镯</option>
                    <option value="Earrings">耳环</option>
                    <option value="Rings">戒指</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">创作灵感 / 描述</label>
                  <textarea 
                    required rows={5}
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="描述这件作品的设计初衷、所用材质..."
                    className="w-full border-gray-200 rounded-sm focus:ring-art-gold"
                  ></textarea>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">商品图片 (支持拖拽多张)</label>
                  <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-sm p-12 text-center transition-all cursor-pointer ${
                      isDragging ? 'border-art-gold bg-art-gold/5' : 'border-gray-200 hover:border-art-gold hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(e) => handleFiles(e.target.files)}
                      className="hidden"
                    />
                    <div className="space-y-4">
                      <Upload className="w-10 h-10 text-gray-300" />
                      <div className="text-xs text-gray-500 uppercase tracking-widest">
                        点击或拖拽图片至此 <br />
                        <span className="text-[10px] opacity-60">支持多张上传，第一张将作为封面</span>
                      </div>
                    </div>
                  </div>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">已选择 ({uploadedImages.length})</label>
                    <div className="grid grid-cols-3 gap-3">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square group rounded-sm overflow-hidden border border-gray-100">
                          <img src={img} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <div className="absolute top-0 left-0 bg-art-gold text-white text-[8px] px-2 py-0.5 font-bold uppercase">主图</div>
                          )}
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <Trash2 className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="w-full bg-art-charcoal text-white py-5 rounded-sm font-bold uppercase tracking-[0.4em] text-[10px] hover:bg-art-teal transition-all shadow-xl active:scale-[0.98]"
                >
                  确认发布作品
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="bg-white rounded-sm shadow-sm overflow-hidden border border-art-charcoal/5">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-400">商品信息</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-400">分类</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-400">价格</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-400">库存状态</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-400 text-right">管理操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-sm overflow-hidden border border-gray-100">
                        <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div>
                        <span className="font-serif text-lg font-medium block">{p.name}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">ID: {p.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs uppercase tracking-widest text-gray-500 bg-gray-100 px-2 py-1 rounded-sm">{p.category}</span>
                  </td>
                  <td className="px-6 py-4 font-serif text-lg text-art-charcoal">¥ {p.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${p.stock < 5 ? 'text-red-500' : 'text-green-600'}`}>
                        {p.stock <= 0 ? '已售罄' : `剩余 ${p.stock} 件`}
                      </span>
                      <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${p.stock < 5 ? 'bg-red-400' : 'bg-green-400'}`} 
                          style={{ width: `${Math.min(100, (p.stock / 20) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={async () => {
                        if (confirm('确定要删除这个商品吗？')) {
                          try {
                            await productsApi.delete(p.id);
                            onDeleteProduct(p.id);
                            alert('商品已删除');
                          } catch (error: any) {
                            alert(error.message || '删除失败');
                          }
                        }
                      }}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="py-24 text-center">
              <Package className="w-10 h-10 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-serif italic">暂无库存商品，请点击上方按钮添加。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
