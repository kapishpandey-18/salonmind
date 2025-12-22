interface SalonMindLogoProps {
  className?: string;
  size?: number;
}

export default function SalonMindLogo({ className = '', size = 40 }: SalonMindLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle gradient */}
      <defs>
        <linearGradient id="roseGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f4c2c2" />
          <stop offset="50%" stopColor="#d4a5a5" />
          <stop offset="100%" stopColor="#c9a0dc" />
        </linearGradient>
        <linearGradient id="softGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fdf8f9" />
          <stop offset="100%" stopColor="#f9e5e8" />
        </linearGradient>
        <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d4a5a5" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#c9a0dc" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Glow effect */}
      <circle cx="50" cy="50" r="45" fill="url(#glowGradient)" />

      {/* Main circle background */}
      <circle cx="50" cy="50" r="40" fill="url(#softGradient)" />
      
      {/* Brain/AI neural network pattern (left side) */}
      <g opacity="0.8">
        {/* Neural nodes */}
        <circle cx="30" cy="35" r="2.5" fill="url(#roseGoldGradient)" />
        <circle cx="25" cy="45" r="2" fill="url(#roseGoldGradient)" />
        <circle cx="32" cy="50" r="2.5" fill="url(#roseGoldGradient)" />
        <circle cx="28" cy="60" r="2" fill="url(#roseGoldGradient)" />
        <circle cx="35" cy="65" r="2.5" fill="url(#roseGoldGradient)" />
        
        {/* Neural connections */}
        <path
          d="M 30 35 L 25 45 L 32 50 M 25 45 L 28 60 M 32 50 L 35 65 M 32 50 L 28 60"
          stroke="url(#roseGoldGradient)"
          strokeWidth="1"
          opacity="0.4"
        />
      </g>

      {/* Scissors (right side) - stylized and elegant */}
      <g transform="translate(55, 40)">
        {/* Upper blade */}
        <path
          d="M 0 0 Q 8 -2 12 -8 L 18 -14 Q 20 -16 18 -18 Q 16 -16 14 -14 L 8 -8 Q 4 -4 0 0 Z"
          fill="url(#roseGoldGradient)"
        />
        {/* Lower blade */}
        <path
          d="M 0 0 Q 8 2 12 8 L 18 14 Q 20 16 18 18 Q 16 16 14 14 L 8 8 Q 4 4 0 0 Z"
          fill="url(#roseGoldGradient)"
        />
        {/* Upper handle ring */}
        <circle cx="-3" cy="-8" r="4" fill="none" stroke="url(#roseGoldGradient)" strokeWidth="1.5" />
        {/* Lower handle ring */}
        <circle cx="-3" cy="8" r="4" fill="none" stroke="url(#roseGoldGradient)" strokeWidth="1.5" />
        {/* Center pivot */}
        <circle cx="0" cy="0" r="2" fill="url(#roseGoldGradient)" />
      </g>

      {/* Connecting arc between brain and scissors */}
      <path
        d="M 38 50 Q 50 48 55 50"
        stroke="url(#roseGoldGradient)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
        strokeDasharray="2,2"
      />

      {/* Outer circle border */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="url(#roseGoldGradient)"
        strokeWidth="2"
        opacity="0.6"
      />
      
      {/* Inner accent circle */}
      <circle
        cx="50"
        cy="50"
        r="36"
        fill="none"
        stroke="url(#roseGoldGradient)"
        strokeWidth="0.5"
        opacity="0.3"
      />
    </svg>
  );
}
