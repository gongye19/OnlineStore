
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-art-sand border-t border-art-charcoal/5 pt-16 pb-12 mt-auto text-art-charcoal">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="flex flex-col items-center space-y-12">
          {/* Brand Name */}
          <div className="text-center">
            <h2 className="text-2xl font-light tracking-[0.4em] uppercase">Artisan</h2>
            <div className="h-[1px] w-8 bg-art-gold mx-auto mt-2 opacity-40"></div>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 text-center text-[10px] uppercase tracking-[0.2em] font-medium opacity-60">
            <div className="space-y-2">
              <p className="text-art-gold font-bold">Email</p>
              <p className="lowercase tracking-normal font-light">contact@artisan-studio.com</p>
            </div>
            <div className="space-y-2">
              <p className="text-art-gold font-bold">小红书</p>
              <p className="font-light">Artisan_林晓</p>
            </div>
            <div className="space-y-2">
              <p className="text-art-gold font-bold">微信公众号</p>
              <p className="font-light">Artisan 手作工作室</p>
            </div>
          </div>

          <div className="opacity-20 text-[8px] uppercase tracking-[0.2em] pt-4">
            © 2024 Artisan Boutique. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
