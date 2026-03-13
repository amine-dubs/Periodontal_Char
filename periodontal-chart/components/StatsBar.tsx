'use client';

// ============================================================
// StatsBar.tsx — Computed Statistics Footer
// P2 Frontend — Week 2
// Displays: Mean PD, Mean CAL, % BOP, % PI
// ============================================================

import type { PerioStats } from '@/types/periodontal';

interface StatsBarProps {
  stats: PerioStats;
  isSaving: boolean;
  lastSaved: Date | null;
}

export default function StatsBar({ stats, isSaving, lastSaved }: StatsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-6 bg-[#0B3E62] text-white rounded-md">
      <div className="flex flex-wrap gap-6">
        <Stat
          label="Mean PD"
          value={`${stats.meanPD} mm`}
          warn={stats.meanPD >= 3}
        />
        <Stat
          label="Mean CAL"
          value={`${stats.meanCAL} mm`}
          warn={stats.meanCAL >= 2}
        />
        <Stat
          label="BOP"
          value={`${stats.bopPercent}%`}
          sub={`${stats.bopCount}/${stats.totalSites}`}
          warn={stats.bopPercent > 10}
        />
        <Stat
          label="Plaque"
          value={`${stats.plaquePercent}%`}
          sub={`${stats.plaqueCount}/${stats.totalSites}`}
          warn={stats.plaquePercent > 20}
        />
        <Stat
          label="Sites recorded"
          value={String(stats.totalSites)}
        />
      </div>

      {/* Auto-save status */}
      <div className="text-[10px] text-white/60 text-right min-w-[100px]">
        {isSaving ? (
          <span className="animate-pulse">Saving…</span>
        ) : lastSaved ? (
          <span>Saved {lastSaved.toLocaleTimeString()}</span>
        ) : (
          <span>Not saved yet</span>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div className="text-center min-w-[70px]">
      <div className="text-[10px] uppercase tracking-wide opacity-60">{label}</div>
      <div className={`text-lg font-bold font-mono ${warn ? 'text-red-300' : 'text-white'}`}>
        {value}
      </div>
      {sub && <div className="text-[9px] opacity-50">{sub} sites</div>}
    </div>
  );
}
