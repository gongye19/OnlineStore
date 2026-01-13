
import React, { useState } from 'react';
import { homeImages } from '../config/homeImages';

interface HomeProps {
  onShopNow: () => void;
}

const Home: React.FC<HomeProps> = ({ onShopNow }) => {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [philosophyLoaded, setPhilosophyLoaded] = useState(false);
  const [founderLoaded, setFounderLoaded] = useState(false);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={homeImages.hero} 
            alt="Artisan Jewelry Background" 
            className={`w-full h-full object-cover scale-105 brightness-[0.65] transition-all duration-[2000ms] ease-out ${
              heroLoaded ? 'grayscale-0' : 'grayscale'
            }`}
            onLoad={() => setHeroLoaded(true)}
            onError={(e) => {
              // 如果图片加载失败，尝试其他格式
              const img = e.target as HTMLImageElement;
              const src = img.src;
              if (src.endsWith('.jpg')) {
                img.src = src.replace('.jpg', '.png');
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center px-6">
          <span className="text-[10px] uppercase tracking-[0.5em] text-white/80 mb-6 block">海岸工作室手工打造</span>
          <h1 className="font-serif text-6xl md:text-8xl text-white font-light tracking-tight mb-8">Artisan</h1>
          <p className="font-serif text-lg md:text-xl italic text-white/90 font-light max-w-xl mx-auto leading-relaxed mb-10">
            “原质之灵与指尖精准的对话。”
          </p>
          <button 
            onClick={onShopNow}
            className="px-10 py-4 border border-white/30 text-white text-[10px] uppercase tracking-[0.4em] hover:bg-white hover:text-art-charcoal transition-all duration-500"
          >
            探索系列作品
          </button>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-white py-24 px-6 border-b border-art-charcoal/5">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
            <div className="md:col-span-7 space-y-8">
              <div className="space-y-3">
                <span className="text-[9px] uppercase tracking-[0.5em] text-art-gold font-bold">核心精髓</span>
                <h2 className="font-serif text-3xl md:text-5xl font-light text-art-charcoal leading-tight">工艺哲学</h2>
              </div>
              
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-light text-art-charcoal/80 italic">大地的馈赠</h3>
                <p className="text-base text-art-charcoal/60 leading-relaxed font-light max-w-lg">
                  我们相信首饰不仅是被佩戴的，更应是被感知的。我们的作品采用可持续采伐的木材、回收金属和天然宝石打造。每一件作品都是人与自然共生关系的见证。
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-8 text-[9px] uppercase tracking-[0.15em] font-bold text-art-charcoal/30">
                <div className="border-l border-art-gold/30 pl-6">
                  <p className="text-art-charcoal/60">可持续</p>
                  <p className="font-normal normal-case italic text-sm tracking-normal mt-2">伦理采购。</p>
                </div>
                <div className="border-l border-art-gold/30 pl-6">
                  <p className="text-art-charcoal/60">永恒</p>
                  <p className="font-normal normal-case italic text-sm tracking-normal mt-2">现代仪式感。</p>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-2xl border border-art-charcoal/5 bg-art-sand">
                <img 
                  src={homeImages.philosophy} 
                  alt="Jeweler at work" 
                  className={`w-full h-full object-cover transition-all duration-[2000ms] ease-out ${
                    philosophyLoaded ? 'grayscale-0 opacity-100' : 'grayscale opacity-0'
                  }`}
                  loading="lazy"
                  onLoad={() => setPhilosophyLoaded(true)}
                  onError={(e) => {
                    // 如果图片加载失败，尝试其他格式
                    const img = e.target as HTMLImageElement;
                    const src = img.src;
                    // 尝试 .png 格式
                    if (src.endsWith('.jpg')) {
                      img.src = src.replace('.jpg', '.png');
                    } else if (src.endsWith('.png')) {
                      // 如果 .png 也失败，显示占位
                      img.style.display = 'none';
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'w-full h-full flex items-center justify-center text-art-charcoal/40 text-sm bg-art-sand';
                      errorDiv.textContent = '请添加图片：public/images/home/philosophy.jpg';
                      img.parentElement?.appendChild(errorDiv);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder's Introduction */}
      <section className="bg-art-sand py-20 px-6 border-b border-art-charcoal/5">
        <div className="max-w-[850px] mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-14">
            <div className="w-40 md:w-56 flex-shrink-0">
              <div className="aspect-[3/4] overflow-hidden border border-art-charcoal/10 rounded-sm shadow-lg">
                <img 
                  src={homeImages.founder} 
                  alt="Founder Ms. Yao" 
                  className={`w-full h-full object-cover transition-all duration-[2000ms] ease-out ${
                    founderLoaded ? 'grayscale-0 opacity-100' : 'grayscale opacity-0'
                  }`}
                  onLoad={() => setFounderLoaded(true)}
                  onError={(e) => {
                    // 如果图片加载失败，尝试其他格式
                    const img = e.target as HTMLImageElement;
                    const src = img.src;
                    if (src.endsWith('.jpg')) {
                      img.src = src.replace('.jpg', '.png');
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-6 text-center md:text-left flex-grow">
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-[0.4em] text-art-gold font-bold">主理人</span>
                <h2 className="font-serif text-3xl md:text-4xl font-light text-art-charcoal">姚女士 · Artisan</h2>
              </div>
              
              <div className="text-sm md:text-base text-art-charcoal/50 font-light leading-relaxed space-y-4">
                <p>
                  姚女士在大兴安岭的密林中感悟四季。她将传统的十五年金工技艺，化作记录自然脉动的载体。
                </p>
                <div className="h-[1px] w-12 bg-art-gold/20 mx-auto md:mx-0"></div>
                <p className="italic font-serif text-xl text-art-charcoal/70">
                  “我不仅仅在制作首饰，我是在记录风的声音。”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
