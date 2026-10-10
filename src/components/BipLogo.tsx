import React from 'react';

interface BipLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BipLogo: React.FC<BipLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: { width: 36, height: 36 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 96, height: 96 },
  }[size];

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Precision Vector Emblem matching BIP 27 Logo */}
      <svg
        width={iconDimensions.width}
        height={iconDimensions.height}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-[0_8px_16px_rgba(6,182,212,0.25)]"
      >
        <defs>
          {/* Cyan to Deep Blue Gradient */}
          <linearGradient id="bipCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Green to Lime Gradient */}
          <linearGradient id="bipGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a3e635" />
            <stop offset="60%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>

          {/* Golden Yellow Accent */}
          <linearGradient id="bipGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          {/* Background Badge Glow */}
          <radialGradient id="bipDarkBase" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
        </defs>

        {/* Circular Dark Base with subtle border */}
        <circle cx="100" cy="100" r="96" fill="url(#bipDarkBase)" />
        <circle cx="100" cy="100" r="95" stroke="#1e293b" strokeWidth="2" />

        {/* STYLIZED "B" MONOGRAM */}
        {/* Upper Left Spine & Loop (Cyan) */}
        <path
          d="M 60 40 L 100 40 C 122 40 135 52 135 68 C 135 82 124 92 108 95 L 100 95 L 100 40 Z"
          fill="none"
          stroke="url(#bipCyanGrad)"
          strokeWidth="11"
          strokeLinejoin="round"
        />

        {/* Upper Right & Lower Right Loop (Green) */}
        <path
          d="M 100 95 L 115 95 C 135 95 148 108 148 126 C 148 144 133 158 108 158 L 60 158"
          fill="none"
          stroke="url(#bipGreenGrad)"
          strokeWidth="11"
          strokeLinejoin="round"
        />

        {/* Left vertical backbone */}
        <path
          d="M 60 40 L 60 158"
          stroke="url(#bipCyanGrad)"
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* CENTRAL CITY SKYLINE SILHOUETTE */}
        <path
          d="M 88 116 L 88 104 L 92 104 L 92 98 L 96 98 L 96 90 L 100 84 L 104 90 L 104 98 L 108 98 L 108 106 L 112 106 L 112 116 Z"
          fill="#1e293b"
          opacity="0.9"
        />

        {/* SPLIT HIGHWAY / PATH PERSPECTIVE */}
        {/* Left Highway (Cyan) */}
        <path
          d="M 62 156 C 75 140 86 122 96 116 C 94 124 88 142 82 156 Z"
          fill="url(#bipCyanGrad)"
          opacity="0.95"
        />
        <path
          d="M 80 156 C 86 142 91 128 97 120"
          stroke="#e0f2fe"
          strokeWidth="1.8"
          strokeDasharray="3 3"
        />

        {/* Right Highway (Green) */}
        <path
          d="M 138 156 C 125 140 114 122 104 116 C 106 124 112 142 118 156 Z"
          fill="url(#bipGreenGrad)"
          opacity="0.95"
        />
        <path
          d="M 120 156 C 114 142 109 128 103 120"
          stroke="#dcfce7"
          strokeWidth="1.8"
          strokeDasharray="3 3"
        />

        {/* UPWARD-SURGING TRAJECTORY LINE & NODES */}
        <path
          d="M 64 126 L 86 110 L 100 100 L 126 104 L 146 64"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 100 100 L 126 104 L 146 64"
          fill="none"
          stroke="url(#bipGreenGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Arrowhead */}
        <polygon points="144,56 154,64 144,72 148,64" fill="url(#bipGoldGrad)" />

        {/* Trajectory Nodes */}
        <circle cx="64" cy="126" r="3.5" fill="#38bdf8" />
        <circle cx="86" cy="110" r="4" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
        {/* Central Golden Glowing Node */}
        <circle cx="100" cy="100" r="6" fill="url(#bipGoldGrad)" />
        <circle cx="100" cy="100" r="9" stroke="#facc15" strokeWidth="1.5" opacity="0.6" />
        <circle cx="126" cy="104" r="4" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5" />
      </svg>

      {/* Typography: BIP 27 & Brand Name */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black tracking-tight text-white flex items-center">
              <span>B</span>
              <span className="text-cyan-400">I</span>
              <span>P</span>
              <span className="ml-1.5 bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent font-extrabold">
                27
              </span>
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Budget 2027
            </span>
          </div>

          <span className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
            Budget Impact Predictor 2027
          </span>

          <div className="flex items-center space-x-1.5 text-[10px] tracking-wide text-slate-400 font-medium">
            <span className="text-sky-400">Predict.</span>
            <span>•</span>
            <span className="text-emerald-400">Simulate.</span>
            <span>•</span>
            <span className="text-amber-400">Decide.</span>
          </div>
        </div>
      )}
    </div>
  );
};
