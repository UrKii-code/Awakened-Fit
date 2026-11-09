import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showSubtitle = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`relative ${iconSizes[size]} flex items-center justify-center`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-cyan-500/30 blur-md rounded-lg animate-pulse" />
        
        {/* Geometric Awakened Crest SVG */}
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]">
          <defs>
            <linearGradient id="crestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <linearGradient id="innerMetallic" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          
          {/* Hexagonal Outer Frame */}
          <polygon
            points="50,4 92,26 92,74 50,96 8,74 8,26"
            fill="url(#innerMetallic)"
            stroke="url(#crestGrad)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Central Stylized 'A' Apex */}
          <polygon
            points="50,16 75,76 61,76 50,46 39,76 25,76"
            fill="url(#crestGrad)"
          />
          
          {/* Floating Arcane Core Gem */}
          <polygon
            points="50,49 57,60 50,71 43,60"
            fill="#060913"
            stroke="#00e5ff"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span 
          className={`font-black tracking-wider uppercase bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent font-['Cinzel',serif] ${textSizes[size]}`}
        >
          Awakened Fit
        </span>
        {showSubtitle && (
          <span className="text-[10px] tracking-widest uppercase text-cyan-400/80 font-['Rajdhani',sans-serif] mt-0.5">
            Real-Life Fitness RPG
          </span>
        )}
      </div>
    </div>
  );
};
