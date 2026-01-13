
import React, { useState, useMemo } from 'react';
import { Page, UserProfile } from '../types';
import { authApi } from '../src/lib/api';

interface LoginProps {
  onLogin: (success: boolean, asAdmin: boolean, profile?: UserProfile) => void;
  onNavigateToRegister: () => void;
  currentPage: Page;
}

// 中国所有省份和主要城市数据
const CHINA_REGIONS: Record<string, string[]> = {
  '北京市': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区'],
  '天津市': ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区', '津南区', '北辰区', '武清区', '宝坻区', '滨海新区', '宁河区', '静海区', '蓟州区'],
  '河北省': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'],
  '山西省': ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'],
  '内蒙古自治区': ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '兴安盟', '锡林郭勒盟', '阿拉善盟'],
  '辽宁省': ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市'],
  '吉林省': ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '延边朝鲜族自治州'],
  '黑龙江省': ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市', '大兴安岭地区'],
  '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '浦东新区', '闵行区', '宝山区', '嘉定区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区'],
  '江苏省': ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市'],
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'],
  '安徽省': ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市'],
  '福建省': ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'],
  '江西省': ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市'],
  '山东省': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市'],
  '河南省': ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市', '济源市'],
  '湖北省': ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市', '恩施土家族苗族自治州', '仙桃市', '潜江市', '天门市', '神农架林区'],
  '湖南省': ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市', '湘西土家族苗族自治州'],
  '广东省': ['广州市', '韶关市', '深圳市', '珠海市', '汕头市', '佛山市', '江门市', '湛江市', '茂名市', '肇庆市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市'],
  '广西壮族自治区': ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市'],
  '海南省': ['海口市', '三亚市', '三沙市', '儋州市', '五指山市', '琼海市', '文昌市', '万宁市', '东方市', '定安县', '屯昌县', '澄迈县', '临高县', '白沙黎族自治县', '昌江黎族自治县', '乐东黎族自治县', '陵水黎族自治县', '保亭黎族苗族自治县', '琼中黎族苗族自治县'],
  '重庆市': ['万州区', '涪陵区', '渝中区', '大渡口区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区', '綦江区', '大足区', '渝北区', '巴南区', '黔江区', '长寿区', '江津区', '合川区', '永川区', '南川区', '璧山区', '铜梁区', '潼南区', '荣昌区', '开州区', '梁平区', '武隆区', '城口县', '丰都县', '垫江县', '忠县', '云阳县', '奉节县', '巫山县', '巫溪县', '石柱土家族自治县', '秀山土家族苗族自治县', '酉阳土家族苗族自治县', '彭水苗族土家族自治县'],
  '四川省': ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市', '阿坝藏族羌族自治州', '甘孜藏族自治州', '凉山彝族自治州'],
  '贵州省': ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '黔西南布依族苗族自治州', '黔东南苗族侗族自治州', '黔南布依族苗族自治州'],
  '云南省': ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市', '楚雄彝族自治州', '红河哈尼族彝族自治州', '文山壮族苗族自治州', '西双版纳傣族自治州', '大理白族自治州', '德宏傣族景颇族自治州', '怒江傈僳族自治州', '迪庆藏族自治州'],
  '西藏自治区': ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市', '阿里地区'],
  '陕西省': ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'],
  '甘肃省': ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市', '临夏回族自治州', '甘南藏族自治州'],
  '青海省': ['西宁市', '海东市', '海北藏族自治州', '黄南藏族自治州', '海南藏族自治州', '果洛藏族自治州', '玉树藏族自治州', '海西蒙古族藏族自治州'],
  '宁夏回族自治区': ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
  '新疆维吾尔自治区': ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉回族自治州', '博尔塔拉蒙古自治州', '巴音郭楞蒙古自治州', '阿克苏地区', '克孜勒苏柯尔克孜自治州', '喀什地区', '和田地区', '伊犁哈萨克自治州', '塔城地区', '阿勒泰地区', '石河子市', '阿拉尔市', '图木舒克市', '五家渠市', '北屯市', '铁门关市', '双河市', '可克达拉市', '昆玉市', '胡杨河市', '新星市', '白杨市'],
  '香港特别行政区': ['中西区', '湾仔区', '东区', '南区', '深水埗区', '油尖旺区', '九龙城区', '黄大仙区', '观塘区', '荃湾区', '屯门区', '元朗区', '北区', '大埔区', '沙田区', '西贡区', '葵青区', '离岛区'],
  '澳门特别行政区': ['花地玛堂区', '花王堂区', '望德堂区', '大堂区', '风顺堂区', '嘉模堂区', '路凼填海区', '圣方济各堂区'],
  '台湾省': ['台北市', '新北市', '桃园市', '台中市', '台南市', '高雄市', '基隆市', '新竹市', '嘉义市', '新竹县', '苗栗县', '彰化县', '南投县', '云林县', '嘉义县', '屏东县', '宜兰县', '花莲县', '台东县', '澎湖县', '金门县', '连江县']
};

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRegister, currentPage }) => {
  const isRegisterMode = currentPage === 'register';
  
  // Toast 通知状态
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone || !loginPassword) {
      setToast({ message: '请输入注册时填写的手机号与密码。', type: 'warning' });
      return;
    }
    
    try {
      const response = await authApi.login(loginPhone, loginPassword);
      const user = response.user;
      const profile: UserProfile = {
        phone: user.phone,
        nickname: user.nickname,
        email: user.email || '',
        address: user.address || '',
        gender: user.gender as 'male' | 'female' | 'other'
      };
      
      onLogin(true, user.is_admin || false, profile);
      if (user.is_admin) {
        setToast({ message: '管理员身份认证成功，欢迎进入管理后台。', type: 'success' });
      } else {
        setToast({ message: '登录成功，欢迎回到 Artisan 工作室。', type: 'success' });
      }
    } catch (error: any) {
      setToast({ message: error.message || '登录失败，请检查手机号和密码。', type: 'error' });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      setToast({ message: '两次输入的密码不一致，请核对。', type: 'error' });
      return;
    }
    if (!regData.phone || !regData.nickname || !regData.email || !regData.province || !regData.city || !regData.detailAddress) {
      setToast({ message: '请完善所有必要的会员信息，包括邮箱和详细地址。', type: 'warning' });
      return;
    }

    try {
      await authApi.register({
        phone: regData.phone,
        password: regData.password,
        nickname: regData.nickname,
        email: regData.email,
        address: `${regData.province}${regData.city}${regData.detailAddress}`,
        gender: regData.gender
      });

      // 注册成功后自动登录
      const response = await authApi.login(regData.phone, regData.password);
      const user = response.user;
      const profile: UserProfile = {
        phone: user.phone,
        nickname: user.nickname,
        email: user.email || '',
        address: user.address || '',
        gender: user.gender as 'male' | 'female' | 'other'
      };

      setToast({ message: '注册成功！正在为您自动进入 Artisan 工作室...', type: 'success' });
      // 延迟一下再跳转，让用户看到成功提示
      setTimeout(() => {
        onLogin(true, false, profile);
      }, 1500);
    } catch (error: any) {
      setToast({ message: error.message || '注册失败，请检查输入信息。', type: 'error' });
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.type === 'success' ? 2000 : 4000}
          onClose={() => setToast(null)}
        />
      )}
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
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-art-charcoal/40">登录密码 / PASSWORD</label>
            <input 
              type="password" required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full border-x-0 border-t-0 border-b border-art-charcoal/20 focus:ring-0 focus:border-art-gold bg-transparent py-3 text-sm font-light"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-art-charcoal text-white text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-art-gold transition-all shadow-xl active:scale-[0.98]"
          >
            登录账户 | SIGN IN
          </button>

          <div className="text-center space-y-4 pt-4">
            <div className="h-[1px] bg-art-charcoal/5 w-12 mx-auto"></div>
            <div className="flex flex-col gap-2">
              <button 
                type="button" 
                onClick={onNavigateToRegister}
                className="text-[10px] uppercase tracking-widest text-art-gold font-bold hover:opacity-70 transition-opacity"
              >
                创建新账户 | CREATE NEW ACCOUNT
              </button>
              <button 
                type="button" 
                onClick={() => window.location.hash = '#change-password'}
                className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
              >
                忘记密码？修改密码
              </button>
            </div>
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
    </>
  );
};

export default Login;
