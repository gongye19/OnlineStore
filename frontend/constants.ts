
import { Product, Order } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: '深海珍珠耳环',
    price: 1280,
    category: 'Earrings',
    description: '大海与天空的对话。采用珍贵的南洋珍珠和回收18K金纯手工打造而成。',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
    stock: 12,
    featured: true
  },
  {
    id: '2',
    name: '漂流木皮革手镯',
    price: 850,
    category: 'Bracelets',
    description: '粗犷而精致。采用符合伦理来源的做旧皮革和回收的海岸漂流木点缀。',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
    stock: 8,
    featured: true
  },
  {
    id: '3',
    name: '蔚蓝海玻璃吊坠',
    price: 1450,
    category: 'Necklaces',
    description: '采集自太平洋海岸，稀有的钴蓝色海玻璃悬挂在精致的纯银链条上。',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
    stock: 5,
    featured: false
  },
  {
    id: '4',
    name: '森林树皮银戒',
    price: 620,
    category: 'Rings',
    description: '取样自真实的雪松树皮，通过失蜡法将古老森林的原始肌理带到您的指尖。',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
    stock: 20,
    featured: false
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-8821',
    customerName: '张伟',
    // Fix: Add missing shippingPhone and shippingAddress
    shippingPhone: '13812345678',
    shippingAddress: '广东省深圳市南山区艺术街区8号',
    items: [{ ...INITIAL_PRODUCTS[0], quantity: 1 }],
    total: 1280,
    status: 'Shipped',
    date: '2023-11-20'
  },
  {
    id: 'ORD-8822',
    customerName: '李娜',
    // Fix: Add missing shippingPhone and shippingAddress
    shippingPhone: '13987654321',
    shippingAddress: '上海市黄浦区南京东路100号',
    items: [{ ...INITIAL_PRODUCTS[1], quantity: 2 }],
    total: 1700,
    status: 'Pending',
    date: '2023-11-24'
  }
];
