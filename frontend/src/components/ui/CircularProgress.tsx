/**
 * WriteLens – CircularProgress
 *
 * A pure SVG circular progress ring.
 * Props:
 *   value     0–100
 *   size      px diameter (default 64)
 *   stroke    ring thickness (default 6)
 *   label     optional center text override (default shows value%)
 *   showValue show the % label inside (default true)
 *   colorAuto auto-pick green/yellow/red based on value (default true)
 *   color     explicit stroke color override (hex / tailwind arbitrary)
 */

import React from 'react';

interface CircularProgressProps {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  showValue?: boolean;
  colorAuto?: boolean;
  color?: string;
  className?: string;
}

function autoColor(value: number): string {
  if (value >= 80) return '#10b981'; // emerald-500
  if (value >= 60) return '#f59e0b'; // amber-400
  if (value >= 40) return '#f97316'; // orange-500
  return '#ef4444';                  // red-500
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 64,
  stroke = 6,
  label,
  showValue = true,
  colorAuto = true,
  color,
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const strokeColor = color ?? (colorAuto ? autoColor(clamped) : '#3b82f6');

  const cx = size / 2;
  const cy = size / 2;
  const fontSize = size < 48 ? size * 0.22 : size * 0.2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`shrink-0 ${className}`}
      role="img"
      aria-label={`${clamped}%`}
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={stroke}
      />
      {/* Progress arc */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      {/* Center label */}
      {showValue && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight="700"
          fill={strokeColor}
          fontFamily="Inter, system-ui, sans-serif"
        >
          {label ?? `${clamped}%`}
        </text>
      )}
    </svg>
  );
};
