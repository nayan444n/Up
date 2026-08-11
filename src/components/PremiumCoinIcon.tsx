import React from 'react';

type PremiumCoinIconProps = {
  className?: string;
  size?: number;
};

export default function PremiumCoinIcon({ className = '', size = 18 }: PremiumCoinIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Premium coin"
      role="img"
    >
      <defs>
        <linearGradient id="pc-gold" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF7A8" />
          <stop offset="0.28" stopColor="#FFD84A" />
          <stop offset="0.62" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#8A4B08" />
        </linearGradient>
        <linearGradient id="pc-blue" x1="23" y1="16" x2="42" y2="49" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CFFAFE" />
          <stop offset="0.42" stopColor="#38BDF8" />
          <stop offset="1" stopColor="#075985" />
        </linearGradient>
        <filter id="pc-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <circle cx="32" cy="32" r="29" fill="#071A2D" opacity="0.9" />
      <circle cx="32" cy="32" r="27" fill="url(#pc-gold)" stroke="#FFF3A3" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="21" fill="#D8890B" opacity="0.72" stroke="#7C4307" strokeWidth="1.5" />

      <g filter="url(#pc-glow)">
        <path d="M32 12L36.8 23.2L48 28L36.8 32.8L32 44L27.2 32.8L16 28L27.2 23.2L32 12Z" fill="url(#pc-blue)" stroke="#E0F2FE" strokeWidth="1.4" />
        <path d="M32 18L35 27.2L42 30L35 32.8L32 39L29 32.8L22 30L29 27.2L32 18Z" fill="#0EA5E9" opacity="0.9" />
        <path d="M32 20L34.5 28L40 30L34.5 31.8L32 37L29.5 31.8L24 30L29.5 28L32 20Z" fill="#E0F2FE" opacity="0.9" />
      </g>

      <path d="M13 22C16 16 21 12 27 10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
      <circle cx="10" cy="32" r="2.2" fill="#38BDF8" />
      <circle cx="54" cy="32" r="2.2" fill="#38BDF8" />
      <circle cx="32" cy="54" r="2.2" fill="#38BDF8" />
    </svg>
  );
}
