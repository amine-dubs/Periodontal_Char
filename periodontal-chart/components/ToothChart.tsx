'use client';

// ============================================================
// ToothChart.tsx — Complete Jaw Chart Component
// P2 Frontend — Week 2
//
// Combines:
//   1. PerioInputGrid — data entry rows (PD, GM, BOP, PI, Mob, Furc)
//   2. Tooth SVG row    — anatomical drawings via odonto.ts
//   3. Google Charts AreaChart — probing depth profile overlay
//
// Layout (upper jaw example):
//   ┌─────────────────────────────────────────┐
//   │  BUCCAL input grid (PD/GM/BOP/PI rows)  │
//   ├─────────────────────────────────────────┤
//   │  Google Charts AreaChart (PD profile)   │
//   ├─────────────────────────────────────────┤
//   │  SVG Teeth row (crown + root drawings)  │
//   ├─────────────────────────────────────────┤
//   │  LINGUAL input grid                     │
//   └─────────────────────────────────────────┘
// ============================================================

import dynamic from 'next/dynamic';
import type { Tooth, ToothNumber, SitePosition, FurcationGrade, MobilityGrade } from '@/types/periodontal';
import type { PerioInputGridProps } from './PerioInputGrid';
import PerioInputGrid from './PerioInputGrid';
import ToothSvgRow from './ToothSvgRow';

// Google Charts must be loaded client-side only (no SSR)
const Chart = dynamic(() => import('react-google-charts').then(m => m.Chart), { ssr: false });

interface ToothChartProps {
  teeth: ToothNumber[];
  teethData: Map<ToothNumber, Tooth>;
  isUpper: boolean;
  // mutations from usePerioChart
  onUpdateSiteValue: (tn: ToothNumber, pos: SitePosition, field: 'probingDepth' | 'gingivalMargin', val: number) => void;
  onToggleSiteBool: (tn: ToothNumber, pos: SitePosition, field: 'bleedingOnProbing' | 'plaqueIndex') => void;
  onCycleFurcation: (tn: ToothNumber) => void;
  onSetMobility: (tn: ToothNumber, grade: MobilityGrade) => void;
  onToggleMissing: (tn: ToothNumber) => void;
  onToggleImplant: (tn: ToothNumber) => void;
  onSetAllBOP: (v: boolean) => void;
  onSetAllPlaque: (v: boolean) => void;
}

/** Build Google Charts data table from PD values across all teeth */
function buildChartData(teeth: ToothNumber[], teethData: Map<ToothNumber, Tooth>, isUpper: boolean) {
  // Header row
  const header = ['Site', 'PD', { role: 'tooltip', p: { html: true } }, 'GM', 'CAL'];
  const rows: (string | number | object)[][] = [header];

  teeth.forEach(tn => {
    const tooth = teethData.get(tn)!;
    if (tooth.isMissing) return;

    // Buccal sites 1,2,3 then lingual 4,5,6
    const allSites = isUpper
      ? tooth.sites
      : tooth.sites;

    allSites.forEach(site => {
      const cal = site.probingDepth - site.gingivalMargin;
      const tooltip = `<div style="padding:4px 8px;font-size:12px">
        <b>Tooth ${tn} — Site ${site.position}</b><br/>
        PD: ${site.probingDepth} mm<br/>
        GM: ${site.gingivalMargin} mm<br/>
        CAL: ${cal} mm
      </div>`;
      rows.push([
        `${tn}-S${site.position}`,
        site.probingDepth,
        tooltip,
        Math.abs(site.gingivalMargin),
        Math.max(0, cal),
      ]);
    });
  });

  return rows;
}

const CHART_OPTIONS = {
  title: '',
  legend: { position: 'bottom', textStyle: { fontSize: 10 } },
  hAxis: { textStyle: { fontSize: 9 }, slantedText: true, slantedTextAngle: 45 },
  vAxis: {
    title: 'mm',
    titleTextStyle: { fontSize: 10 },
    direction: -1,           // invert Y so 0 at top, deeper values grow downward
    minValue: 0,
    maxValue: 12,
    gridlines: { count: 7 },
    textStyle: { fontSize: 9 },
  },
  colors: ['#3b82f6', '#ef4444', '#16a34a'],
  areaOpacity: 0.15,
  backgroundColor: 'transparent',
  chartArea: { left: 36, right: 8, top: 8, bottom: 40, width: '100%', height: '80%' },
  tooltip: { isHtml: true },
  lineWidth: 2,
};

// Shared grid props type extracted for reuse
type GridProps = Omit<PerioInputGridProps, 'isBuccal'>;

export default function ToothChart({
  teeth, teethData, isUpper,
  onUpdateSiteValue, onToggleSiteBool, onCycleFurcation,
  onSetMobility, onToggleMissing, onToggleImplant,
  onSetAllBOP, onSetAllPlaque,
}: ToothChartProps) {
  const chartData = buildChartData(teeth, teethData, isUpper);

  const gridProps: GridProps = {
    teeth, teethData, isUpper,
    onUpdateSiteValue, onToggleSiteBool, onCycleFurcation,
    onSetMobility, onToggleMissing, onToggleImplant,
    onSetAllBOP, onSetAllPlaque,
  };

  return (
    <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
      {/* Jaw label */}
      <div className="bg-[#0B3E62] text-white text-center text-xs font-bold py-1 tracking-wider uppercase">
        {isUpper ? 'Maxillary — Upper Jaw' : 'Mandibular — Lower Jaw'}
      </div>

      <div className="px-2 pt-1">
        {/* ---- Buccal / Vestibular input grid ---- */}
        <div className="text-[9px] text-center text-gray-400 mb-0.5">
          {isUpper ? 'BUCCAL / VESTIBULAR' : 'LINGUAL'}
        </div>
        <PerioInputGrid {...gridProps} isBuccal={isUpper} />

        {/* ---- Google Charts AreaChart — Probing Depth Profile ---- */}
        <div className="relative" style={{ height: 140 }}>
          {chartData.length > 1 ? (
            <Chart
              chartType="AreaChart"
              data={chartData}
              options={CHART_OPTIONS}
              width="100%"
              height="140px"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 text-xs">
              Enter PD values to see the probing depth chart
            </div>
          )}
        </div>

        {/* ---- SVG teeth row (odonto.js drawings) ---- */}
        <ToothSvgRow
          teeth={teeth}
          teethData={teethData}
          isUpper={isUpper}
          onToggleMissing={onToggleMissing}
        />

        {/* ---- Lingual / Palatal input grid ---- */}
        <div className="text-[9px] text-center text-gray-400 mt-0.5 mb-0.5">
          {isUpper ? 'PALATAL / LINGUAL' : 'BUCCAL / VESTIBULAR'}
        </div>
        <PerioInputGrid {...gridProps} isBuccal={!isUpper} />
      </div>
    </div>
  );
}
