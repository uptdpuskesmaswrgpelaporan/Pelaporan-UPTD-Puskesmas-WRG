import React, { useState } from 'react';

interface PuskesmasLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PuskesmasLogo: React.FC<PuskesmasLogoProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  if (!imageError) {
    return (
      <img
        src="/logo_wairiang.jpg"
        alt="Logo Puskesmas Wairiang"
        onError={() => setImageError(true)}
        className={`${currentSizeClass} object-contain rounded-full shadow-xs border border-emerald-700/20 shrink-0 ${className}`}
      />
    );
  }

  // Fallback SVG identical to the official circular badge in the user photo
  return (
    <div className={`${currentSizeClass} relative rounded-full overflow-hidden shrink-0 shadow-sm border border-emerald-800 ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Outer Dark Green Ring */}
        <circle cx="100" cy="100" r="98" fill="#0b4d26" stroke="#ffffff" strokeWidth="3" />
        
        {/* Curved Text Paths */}
        <defs>
          <path id="textArcTop" d="M 30,100 A 70,70 0 0,1 170,100" fill="none" />
          <path id="textArcBottom" d="M 170,100 A 70,70 0 0,1 30,100" fill="none" />
          <linearGradient id="centerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d6e838" />
            <stop offset="100%" stopColor="#228b22" />
          </linearGradient>
        </defs>

        {/* Text Top: PUSKESMAS */}
        <text fill="#ffffff" fontSize="16" fontWeight="900" letterSpacing="3">
          <textPath href="#textArcTop" startOffset="50%" textAnchor="middle">
            PUSKESMAS
          </textPath>
        </text>

        {/* Text Bottom: WAIRIANG */}
        <text fill="#ffffff" fontSize="17" fontWeight="900" letterSpacing="4">
          <textPath href="#textArcBottom" startOffset="50%" textAnchor="middle">
            WAIRIANG
          </textPath>
        </text>

        {/* Inner Circle Border */}
        <circle cx="100" cy="100" r="64" fill="url(#centerGradient)" stroke="#ffffff" strokeWidth="2.5" />

        {/* White Hexagon */}
        <polygon 
          points="100,46 138,68 138,112 100,134 62,112 62,68" 
          fill="#ffffff" 
          stroke="#0b4d26" 
          strokeWidth="1.5" 
        />

        {/* Green Puskesmas Medical Cross */}
        <path
          d="M 90,62 L 110,62 L 110,80 L 128,80 L 128,100 L 110,100 L 110,118 L 90,118 L 90,100 L 72,100 L 72,80 L 90,80 Z"
          fill="#0e7a3a"
        />

        {/* House pitched roof silhouette & Interlocking rings */}
        <polygon points="100,74 116,92 84,92" fill="#0b4d26" />
        <circle cx="97" cy="85" r="4" fill="none" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="103" cy="85" r="4" fill="none" stroke="#ffffff" strokeWidth="1.5" />
      </svg>
    </div>
  );
};
