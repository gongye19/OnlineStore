
import React, { useState, useMemo } from 'react';
import { Page, UserProfile } from '../types';

interface LoginProps {
  onLogin: (success: boolean, asAdmin: boolean, profile?: UserProfile) => void;
  onNavigateToRegister: () => void;
  currentPage: Page;
}

// 模拟中国主要行政区划数据，支持覆盖全国
const CHINA_REGIONS: Record<string, string[]> = {
  '北京市': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '通州区', '顺义区', '昌平区'],
  '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '浦东新区', '松江区'],
  '广东省': ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '江门市', '湛江市', '茂名市', '肇庆市', '东莞市', '中山市'],
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市'],
  '江苏省': ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港', '扬州市', '镇江市'],
  '四川省': ['成都市', '自贡市', '攀枝花', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市'],
  '福建省': ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'],
  '湖北省': ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市'],
  '湖南省': ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '益阳市', '郴州市'],
  '山东省': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市'],
  '河南省': ['郑州市', '开封市', '洛阳市', '平顶山', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市']
};

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRegister, currentPage }) => {
  const isRegisterMode = currentPage === 'register';
  
  // 登录状态
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 注册状态
  const [regData, setRegData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    email: '',
    province: '',
    city: '',
    detailAddress: '',
    gender: 'other' as 'male' | 'female' | 'other'
  });

  const availableCities = useMemo(() => {
    return CHINA_REGIONS[regData.province] || [];
  }, [regData.province]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone || !loginPassword) {
      alert('请输入注册时填写的手机号与密码。');
      return;
    }
    // 管理员验证逻辑 (演示用)
    const isAdmin = loginPhone === '13800138000' && loginPassword === 'admin123';
    
    onLogin(true, isAdmin);
    if (isAdmin) {
      alert('管理员身份认证成功，欢迎进入管理后台。');
    } else {
      alert('登录成功，欢迎回到 Artisan 工作室。');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      alert('两次输入的密码不一致，请核对。');
      return;
    }
    if (!regData.phone || !regData.nickname || !regData.province || !regData.city || !regData.detailAddress) {
      alert('请完善所有必要的会员信息，包括详细地址。');
      return;
    }

    const profile: UserProfile = {
      phone: regData.phone,
      nickname: regData.nickname,
      email: regData.email,
      address: `${regData.province}${regData.city}${regData.detailAddress}`,
      gender: regData.gender
    };

    alert('注册成功！正在为您自动进入 Artisan 工作室...');
    onLogin(true, false, profile);
  };

  return (
    <div className="max-w-[520px] mx-auto px-6 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl font-light mb-4 tracking-tight">
          {isRegisterMode ? '创建会员账户' : '会员登录'}
        </h1>
        <p className="text-[9px] uppercase tracking-[0.4em] opacity-40">
          {isRegisterMode ? 'Become a Studio Member' : 'Artisan Member Access'}
        </p>
      </div>

      {!isRegisterMode ? (
        <form onSubmit={handleLoginSubmit} className="space-y-8">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-art-charcoal/40">手机号码 / PHONE NUMBER</label>
            <input 
              type="tel" required
              value={loginPhone}
              onChange={(e) => setLoginPhone(e.target.value)}
              className="w-full border-x-0 border-t-0 border-b border-art-charcoal/20 focus:ring-0 focus:border-art-gold bg-transparent py-3 text-sm font-light"
              placeholder="138 **** ****"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-art-charcoal/40">登录密码 / PASSWORD</label>
            <input 
              type="password" required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full border-x-0 border-t-0 border-b border-art-charcoal/20 focus:ring-0 focus:border-art-gold bg-transparent py-3 text-sm font-light"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-art-charcoal text-white text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-art-gold transition-all shadow-xl active:scale-[0.98]"
          >
            登录账户 | SIGN IN
          </button>

          <div className="text-center space-y-4 pt-4">
            <p className="text-[8px] opacity-30 italic">提示：管理员账户 13800138000 / admin123</p>
            <div className="h-[1px] bg-art-charcoal/5 w-12 mx-auto"></div>
            <button 
              type="button" 
              onClick={onNavigateToRegister}
              className="text-[10px] uppercase tracking-widest text-art-gold font-bold hover:opacity-70 transition-opacity"
            >
              创建新账户 | CREATE NEW ACCOUNT
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-bold text-art-charcoal/40">用户昵称 / NICKNAME</label>
              <input type="text" required value={regData.nickname} onChange={e => setRegData({...regData, nickname: e.target.value})} className="w-full border-x-0 border-t-0 border-b border-art-charcoal/20 focus:ring-0 focus:border-art-gold py-2 text-sm font-light" placeholder="如何称呼您" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-bold text-art-charcoal/40">手机号码 / PHONE</label>
              <input type="tel" required value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} className="w-full border-x-0 border-t-0 border-b border-art-charcoal/20 focus:ring-0 focus:border-art-gold py-2 text-sm font-light" placeholder="11位手机号" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest font-bold text-art-charcoal/40">电子邮箱 / EMAIL</label>
            <input type="email" required value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} className="w-full border-x-0 border-t-0 border-b border-art-charcoal/20 focus:ring-0 focus:border-art-gold py-2 text-sm font-light" placeholder="用于接收订单讯息" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-bold text-art-charcoal/40">设置密码</label>
              <input type="password" required value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full border-x-0 border-t-0 border-b border-art-charcoal/20 focus:ring-0 focus:border-art-gold py-2 text-sm font-light" placeholder="最少6位" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest font-bold text-art-charcoal/40">确认密码</label>
              <input type="password" required value={regData.confirmPassword} onChange={e => setRegData({...regData, confirmPassword: e.target.value})} className={`w-full border-x-0 border-t-0 border-b py-2 text-sm font-light focus:ring-0 ${regData.confirmPassword && regData.password !== regData.confirmPassword ? 'border-red-400' : 'border-art-charcoal/20 focus:border-art-gold'}`} placeholder="再次输入确认" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-widest font-bold text-art-charcoal/40">配送地址 / SHIPPING ADDRESS</label>
            <div className="grid grid-cols-2 gap-4">
              <select 
                required 
                value={regData.province} 
                onChange={e => setRegData({...regData, province: e.target.value, city: ''})}
                className="border-x-0 border-t-0 border-b border-art-charcoal/20 focus:ring-0 focus:border-art-gold text-sm font-light py-2 bg-transparent appearance-none"
              >
                <option value="">选择省份</option>
                {Object.keys(CHINA_REGIONS).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select 
                required 
                disabled={!regData.province}
                value={regData.city}
                onChange={e => setRegData({...regData, city: e.target.value})}
                className="border-x-0 border-t-0 border-b border-art-charcoal/20 focus:ring-0 focus:border-art-gold text-sm font-light py-2 bg-transparent appearance-none disabled:opacity-20"
              >
                <option value="">选择城市</option>
                {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="pt-2">
              <label className="text-[8px] uppercase tracking-widest font-bold text-art-charcoal/30 mb-1 block">详细街道地址 / STREET ADDRESS</label>
              <input 
                type="text" 
                required 
                value={regData.detailAddress} 
                onChange={e => setRegData({...regData, detailAddress: e.target.value})} 
                className="w-full border-x-0 border-t-0 border-b border-art-charcoal/20 focus:ring-0 focus:border-art-gold py-2 text-sm font-light" 
                placeholder="例如：XX街道XX小区XX号楼XX室" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-widest font-bold text-art-charcoal/40">性别 / GENDER</label>
            <div className="flex gap-8">
              {(['male', 'female', 'other'] as const).map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="gender" 
                    value={g} 
                    checked={regData.gender === g}
                    onChange={() => setRegData({...regData, gender: g})}
                    className="text-art-gold focus:ring-art-gold border-art-charcoal/20 w-3 h-3" 
                  />
                  <span className="text-[10px] uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                    {g === 'male' ? '男' : g === 'female' ? '女' : '保密'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-art-charcoal text-white text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-art-gold transition-all shadow-xl active:scale-[0.98]"
          >
            创建会员账户 | JOIN NOW
          </button>

          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={() => window.location.hash = '#login'}
              className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
            >
              已有账户？返回登录
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;
