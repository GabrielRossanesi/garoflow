'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LogoIcon({ className = '', size = 'md' }: { className?: string; size?: LogoProps['size'] }) {
  const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeMap[size]} ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Glow for the hub node */}
        <filter id="hub-glow-new" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* The Monogram: Shared Diagonal N and V */}
      {/* N shape: Left leg, diagonal to bottom-center, and right leg going straight up */}
      <path
        d="M26 70 V30 L52 70 V30"
        stroke="var(--primary)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />

      {/* V right leg: Diagonal going up-right from the bottom-center intersection */}
      <path
        d="M52 70 L74 30"
        stroke="var(--primary)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />

      {/* Core Hub Node: A glowing circle at the intersection (52, 70) */}
      <circle
        cx="52"
        cy="70"
        r="6.5"
        fill="#ffffff"
        className="animate-pulse"
        filter="url(#hub-glow-new)"
      />
      <circle
        cx="52"
        cy="70"
        r="2.5"
        fill="var(--primary)"
      />
    </svg>
  );
}

export function LogoHorizontal({ className = '', iconClassName = '', textClassName = '', size = 'md' }: LogoProps) {
  const textSizeMap = {
    sm: 'text-sm gap-2',
    md: 'text-lg gap-2.5',
    lg: 'text-2xl gap-3.5',
    xl: 'text-3xl gap-4',
  };

  return (
    <div className={`flex items-center ${textSizeMap[size]} ${className}`}>
      <LogoIcon size={size} className={iconClassName} />
      <div className={`flex flex-col select-none ${textClassName}`}>
        <div className="flex items-baseline font-bold tracking-tight text-foreground leading-none">
          <span>NV</span>
          <span className="text-primary ml-1 font-semibold tracking-wide">Hub</span>
        </div>
      </div>
    </div>
  );
}

export function LogoSidebar({ className = '', isCollapsed = false }: { className?: string; isCollapsed?: boolean }) {
  if (isCollapsed) {
    return (
      <div className={`flex items-center justify-center relative group w-full ${className}`}>
        <LogoIcon size="md" className="hover:scale-105 transition-transform duration-200" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <LogoIcon size="md" className="shrink-0 hover:rotate-[3deg] transition-transform duration-200" />
      <div className="flex flex-col animate-in fade-in duration-200">
        <div className="flex items-baseline font-bold text-sm tracking-tight text-foreground leading-none">
          <span>NV</span>
          <span className="text-primary ml-0.5 font-semibold tracking-wide">Hub</span>
        </div>
        <span className="text-[9px] text-muted-foreground font-mono font-bold uppercase tracking-[0.12em] mt-1">
          Revenue &amp; Operations
        </span>
      </div>
    </div>
  );
}

export default LogoHorizontal;
