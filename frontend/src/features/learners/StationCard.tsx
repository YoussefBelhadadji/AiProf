/**
 * WriteLens – StationCard
 *
 * One card in the 3×3 station grid on the Student Profile.
 * Shows: colored icon, station title, score ring, one-line insight.
 * Clicking it calls onSelect(stationId) to open the detail panel.
 */

import React from 'react';
import {
  Database,
  ShieldCheck,
  Users,
  TrendingUp,
  Brain,
  AlertTriangle,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CircularProgress } from '../../components/ui/CircularProgress';
import type { EnrichedStationCard } from './types';

// Map icon name string → lucide component
const ICON_MAP: Record<string, LucideIcon> = {
  Database,
  ShieldCheck,
  Users,
  TrendingUp,
  Brain,
  AlertTriangle,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  Activity,
};

interface StationCardProps {
  card: EnrichedStationCard;
  isSelected: boolean;
  onSelect: (stationId: string) => void;
}

export const StationCard: React.FC<StationCardProps> = ({ card, isSelected, onSelect }) => {
  const Icon = ICON_MAP[card.icon] ?? Activity;

  return (
    <button
      type="button"
      onClick={() => onSelect(card.station_id)}
      className={`group relative flex w-full flex-col gap-3 rounded-2xl border p-4 text-left transition-all duration-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        isSelected
          ? 'border-blue-300 bg-blue-50 shadow-md shadow-blue-100/60 ring-2 ring-blue-300/50'
          : 'border-slate-200/80 bg-white hover:border-blue-200'
      }`}
    >
      {/* Order badge */}
      <span className="absolute right-3 top-3 text-[10px] font-semibold text-slate-300">
        S{String(card.order).padStart(2, '0')}
      </span>

      {/* Icon + score row */}
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bgClass} ${card.colorClass} transition-transform group-hover:scale-110`}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <CircularProgress value={card.score} size={44} stroke={4} />
      </div>

      {/* Title */}
      <div>
        <p className="text-sm font-semibold leading-snug text-slate-900">{card.title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{card.insight}</p>
      </div>

      {/* Status dot */}
      <div className="flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            card.status === 'ready' ? 'bg-emerald-400' : 'bg-slate-300'
          }`}
        />
        <span className="text-[10px] uppercase tracking-wide text-slate-400">
          {card.status === 'ready' ? 'Ready' : 'Pending'}
        </span>
      </div>
    </button>
  );
};
