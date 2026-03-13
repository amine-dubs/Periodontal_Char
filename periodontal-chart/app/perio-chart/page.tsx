'use client';

// ============================================================
// app/perio-chart/page.tsx — Main Periodontal Chart Page
// P2 Frontend — Week 2
//
// Assembles: ToothChart (upper + lower) + StatsBar
// State managed by usePerioChart hook
// ============================================================

import { usePerioChart } from '@/hooks/usePerioChart';
import { UPPER_TEETH, LOWER_TEETH } from '@/types/periodontal';
import ToothChart from '@/components/ToothChart';
import StatsBar from '@/components/StatsBar';

export default function PerioChartPage() {
  const {
    teeth,
    stats,
    isSaving,
    lastSaved,
    updateSiteValue,
    toggleSiteBool,
    cycleFurcation,
    setMobility,
    toggleMissing,
    toggleImplant,
    setAllBOP,
    setAllPlaque,
  } = usePerioChart();

  // Shared base props (without jaw-specific callbacks)
  const baseProps = {
    teethData: teeth,
    onUpdateSiteValue: updateSiteValue,
    onToggleSiteBool: toggleSiteBool,
    onCycleFurcation: cycleFurcation,
    onSetMobility: setMobility,
    onToggleMissing: toggleMissing,
    onToggleImplant: toggleImplant,
  };

  // Jaw-specific BOP/Plaque bound to the correct teeth list
  const upperProps = {
    ...baseProps,
    teeth: UPPER_TEETH,
    isUpper: true as const,
    onSetAllBOP: (v: boolean) => setAllBOP(UPPER_TEETH, v),
    onSetAllPlaque: (v: boolean) => setAllPlaque(UPPER_TEETH, v),
  };

  const lowerProps = {
    ...baseProps,
    teeth: LOWER_TEETH,
    isUpper: false as const,
    onSetAllBOP: (v: boolean) => setAllBOP(LOWER_TEETH, v),
    onSetAllPlaque: (v: boolean) => setAllPlaque(LOWER_TEETH, v),
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ---- Header ---- */}
      <header className="bg-[#0B3E62] text-white py-3 px-6 shadow-md print:hidden">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-wide">Periodontal Chart</h1>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-sm transition-colors"
          >
            Print / PDF
          </button>
        </div>
      </header>

      {/* ---- Patient Info ---- */}
      <div className="bg-white border-b border-gray-300 py-2 px-6 print:py-1">
        <div className="max-w-[1200px] mx-auto flex flex-wrap gap-4 items-center text-sm">
          <Field label="Patient" placeholder="Last name, First name" width="w-52" />
          <Field label="Date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          <Field label="Practitioner" placeholder="Dr." width="w-40" />
          <div className="flex items-center gap-1.5">
            <label className="font-semibold text-gray-600">Exam type</label>
            <select className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#0B3E62]">
              <option>Initial</option>
              <option>Re-evaluation</option>
              <option>Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* ---- Chart area ---- */}
      <main className="max-w-[1200px] mx-auto py-4 px-2 space-y-4">
        {/* Upper jaw */}
        <ToothChart {...upperProps} />

        {/* Lower jaw */}
        <ToothChart {...lowerProps} />

        {/* Statistics bar */}
        <StatsBar stats={stats} isSaving={isSaving} lastSaved={lastSaved} />

        {/* Legend */}
        <div className="p-3 bg-white rounded border border-gray-200 text-[11px] text-gray-600">
          <span className="font-semibold text-gray-700 mr-3">Legend:</span>
          <span className="mr-4"><span className="inline-block w-4 border-t-2 border-red-500 mr-1 align-middle" /> Gingival Margin (GM)</span>
          <span className="mr-4"><span className="inline-block w-4 border-t-2 border-blue-500 mr-1 align-middle" /> Attachment Level</span>
          <span className="mr-4"><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1 align-middle" /> BOP</span>
          <span className="mr-4"><span className="inline-block w-3 h-3 bg-blue-400 mr-1 align-middle" /> Plaque</span>
          <span className="mr-4">○ = Furc.I &nbsp; ◑ = Furc.II &nbsp; ● = Furc.III</span>
          <span className="text-blue-600 font-semibold">CAL = PD − GM</span>
        </div>
      </main>
    </div>
  );
}

function Field({ label, placeholder, width, type, defaultValue }: {
  label: string; placeholder?: string; width?: string;
  type?: string; defaultValue?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <label className="font-semibold text-gray-600">{label}</label>
      <input
        type={type ?? 'text'}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={`border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#0B3E62] ${width ?? 'w-36'}`}
      />
    </div>
  );
}
