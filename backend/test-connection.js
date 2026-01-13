// 快速测试 Supabase 连接
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔍 测试 Supabase 连接...');
console.log('URL:', supabaseUrl);
console.log('Service Key 长度:', supabaseServiceKey?.length || 0);
console.log('Service Key 前缀:', supabaseServiceKey?.substring(0, 20) || 'N/A');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少环境变量！');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 测试查询商品表
async function test() {
  try {
    console.log('\n📦 测试查询商品表...');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ 查询失败:', error.message);
      console.error('错误详情:', error);
      return;
    }

    console.log('✅ 连接成功！');
    console.log('商品数量:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('示例商品:', data[0].name);
    }
  } catch (err) {
    console.error('❌ 测试失败:', err.message);
  }
}

test();

