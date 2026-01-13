
import React from 'react';
import { Order, OrderStatus } from '../types';

interface AdminOrdersProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onUpdateStatus }) => {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Return Requested': return 'bg-red-100 text-red-800';
      case 'Exchange Requested': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusMap: any = {
    'Pending': '待处理',
    'Processing': '处理中',
    'Shipped': '已发货',
    'Delivered': '已送达',
    'Cancelled': '已取消',
    'Return Requested': '退货申请',
    'Exchange Requested': '换货申请'
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 text-art-charcoal">
      <div className="max-w-[1200px] mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight">订单管理系统</h1>
          <p className="text-gray-500 text-sm mt-1">监控实时订单流、处理退换货并追踪物流状态</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-sm shadow-sm overflow-hidden p-8 border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-gray-50 pb-8">
                <div>
                  <h3 className="text-xl font-bold font-serif">{order.id}</h3>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">下单日期：{order.date}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                    {statusMap[order.status] || order.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">状态流转：</label>
                    <select 
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                      className="border-gray-200 rounded-sm text-xs focus:ring-art-teal py-1 px-3 bg-gray-50"
                    >
                      <option value="Pending">待处理</option>
                      <option value="Processing">处理中</option>
                      <option value="Shipped">已发货</option>
                      <option value="Delivered">已送达</option>
                      <option value="Cancelled">已取消</option>
                      <option value="Return Requested">退货申请</option>
                      <option value="Exchange Requested">换货申请</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-1 space-y-6">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 border-l-2 border-art-gold pl-3">作品清单</h4>
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm group">
                        <div className="flex items-center gap-4">
                          <img src={item.image} className="w-10 h-10 rounded-sm object-cover border border-gray-100 grayscale group-hover:grayscale-0 transition-all" />
                          <span className="text-gray-700 font-medium">{item.name}</span>
                        </div>
                        <span className="text-gray-400">x{item.quantity}</span>
                      </div>
                    ))}
                    <div className="pt-4 mt-4 border-t border-gray-50 flex justify-between items-center">
                       <span className="text-xs font-bold uppercase tracking-widest opacity-40">总营收</span>
                       <span className="text-2xl font-serif text-art-gold italic">¥ {order.total}</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-8 rounded-sm">
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">客户资料</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="opacity-40">主理昵称：</span> {order.customerName}</p>
                      <p><span className="opacity-40">联系电话：</span> {order.shippingPhone}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">物流配送指向</h4>
                    <p className="text-sm leading-relaxed text-gray-600 italic">
                      {order.shippingAddress}
                    </p>
                    <div className="pt-4">
                        <button className="text-[9px] uppercase tracking-widest text-art-teal font-bold border border-art-teal/20 px-3 py-1 hover:bg-art-teal hover:text-white transition-all">
                            打印面单
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="py-32 text-center bg-white rounded-sm border border-dashed border-gray-200">
               <span className="material-symbols-outlined text-4xl text-gray-200 mb-4 block">assignment_late</span>
               <p className="text-gray-400 font-serif italic">暂无活跃订单。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
