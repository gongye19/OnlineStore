
import React from 'react';
import { Order, OrderStatus } from '../types';

interface MyOrdersProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}

const MyOrders: React.FC<MyOrdersProps> = ({ orders, onUpdateStatus }) => {
  const handleRequest = (orderId: string, type: 'Return' | 'Exchange') => {
    const status: OrderStatus = type === 'Return' ? 'Return Requested' : 'Exchange Requested';
    if (window.confirm(`确认要申请${type === 'Return' ? '退货' : '换货'}吗？`)) {
      onUpdateStatus(orderId, status);
      alert(`已提交${type === 'Return' ? '退货' : '换货'}申请，请等待审核。`);
    }
  };

  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case 'Return Requested': return <span className="text-red-500">退货处理中</span>;
      case 'Exchange Requested': return <span className="text-art-gold">换货处理中</span>;
      default: return <span>{status}</span>;
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
    <div className="max-w-[1000px] mx-auto px-6 py-12 animate-fade-in">
      <header className="mb-12 text-center">
        <h1 className="font-serif text-4xl font-light mb-2">我的订单</h1>
        <p className="text-[10px] uppercase tracking-widest opacity-40">Purchase History & Support</p>
      </header>

      <div className="space-y-12">
        {orders.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-art-charcoal/10">
            <p className="font-serif text-xl italic opacity-40">您还没有任何订单记录</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white border border-art-charcoal/5 p-8 shadow-sm group hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-art-charcoal/5 pb-4">
                <div>
                  <p className="text-[11px] uppercase tracking-widest font-bold text-art-gold">{order.id}</p>
                  <p className="text-xs text-art-charcoal/60 mt-1">{order.date}</p>
                </div>
                <div className="text-[11px] uppercase tracking-widest font-bold bg-art-sand px-3 py-1 rounded">
                  状态: <span className="text-art-charcoal ml-2">{statusMap[order.status] || order.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                <div className="space-y-4">
                  <h4 className="text-[9px] uppercase tracking-widest font-bold text-art-charcoal/30">商品明细</h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 overflow-hidden bg-art-sand border border-art-charcoal/5">
                          <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-[10px] opacity-40">¥{item.price} x {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-serif text-base">¥ {item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 bg-art-sand/50 p-6 rounded border border-art-gold/5">
                  <h4 className="text-[9px] uppercase tracking-widest font-bold text-art-charcoal/30">配送信息</h4>
                  <div className="space-y-2 text-xs">
                    <p className="flex justify-between"><span className="opacity-50">收货人：</span><span className="font-medium">{order.customerName}</span></p>
                    <p className="flex justify-between"><span className="opacity-50">联系电话：</span><span className="font-medium">{order.shippingPhone}</span></p>
                    <div className="pt-1">
                      <p className="opacity-50 mb-1">收货地址：</p>
                      <p className="font-medium leading-relaxed">{order.shippingAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-t border-art-charcoal/5 pt-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest opacity-40 mb-1">实付金额</p>
                  <p className="font-serif text-3xl text-art-charcoal">¥ {order.total}</p>
                </div>
                
                <div className="flex gap-4">
                  {order.status !== 'Return Requested' && order.status !== 'Exchange Requested' && order.status !== 'Cancelled' && (
                    <>
                      <button 
                        onClick={() => handleRequest(order.id, 'Exchange')}
                        className="text-[10px] uppercase tracking-widest px-6 py-2.5 border border-art-charcoal/10 hover:bg-art-sand transition-all"
                      >
                        申请换货
                      </button>
                      <button 
                        onClick={() => handleRequest(order.id, 'Return')}
                        className="text-[10px] uppercase tracking-widest px-6 py-2.5 bg-art-charcoal text-white hover:bg-art-gold transition-all"
                      >
                        申请退货
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
