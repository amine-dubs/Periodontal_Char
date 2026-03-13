'use client';

// ============================================================
// Tooth.tsx — Individual Tooth SVG Component
// P2 Frontend — Week 2
//
// Uses odonto.ts (cargarBuccal / cargarLingual) to draw:
//   - Tooth crown + root anatomy
//   - Red line = gingival margin (GM)
//   - Blue area = periodontal pocket (GM → Attachment Level)
//   - Blue line = attachment level
//   - BOP dots (red) and Plaque dots (blue) per site
// ============================================================

import { type Tooth, FURCATION_TEETH } from '@/types/periodontal';
import { type SiteValues, cargarBuccal, cargarLingual, drawImplant } from '@/lib/odonto';

interface ToothProps {
  tooth: Tooth;
  isUpper: boolean;
  isBuccal: boolean;      // true = buccal view (sites 1-2-3), false = lingual (sites 4-5-6)
  width?: number;
  height?: number;
  onClick?: () => void;   // click on tooth = toggle missing
  onShiftClick?: () => void; // SHIFT+click = reset all values
}

const TOOTH_W = 54;
const TOOTH_H = 90;

export default function Tooth({
  tooth,
  isUpper,
  isBuccal,
  width = TOOTH_W,
  height = TOOTH_H,
  onClick,
  onShiftClick,
}: ToothProps) {
  const { sites, toothNumber, isMissing, isImplant, furcation } = tooth;

  // Select the 3 relevant sites for this view
  const viewSites = isBuccal
    ? [sites[0], sites[1], sites[2]]   // positions 1, 2, 3 — vestibular
    : [sites[3], sites[4], sites[5]];  // positions 4, 5, 6 — lingual/palatal

  const siteValues = viewSites.map(s => ({
    probingDepth: s.probingDepth,
    gingivalMargin: s.gingivalMargin,
  })) as [SiteValues, SiteValues, SiteValues];

  // Generate drawing data via odonto.ts
  const drawData = isBuccal
    ? cargarBuccal(toothNumber, siteValues, { width, height, isUpper, isMissing, isImplant })
    : cargarLingual(toothNumber, siteValues, { width, height, isUpper, isMissing, isImplant });

  const { toothShape, gmPoints, alPoints, pocketPolygon, siteXs } = drawData;

  // BOP and Plaque dot radius
  const DOT_R = 3;
  const cx = width / 2;
  const CROWN_H = 28;
  const dotY = isUpper ? CROWN_H - 8 : height - CROWN_H + 8;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`block cursor-pointer select-none ${isMissing ? 'opacity-30' : ''}`}
      onClick={(e) => {
        if (e.shiftKey) onShiftClick?.();
        else onClick?.();
      }}
      aria-label={`Tooth ${toothNumber} ${isBuccal ? 'buccal' : 'lingual'} view`}
    >
      {/* ---- Root ---- */}
      {!isImplant ? (
        <path d={toothShape.rootD} fill="#f5e6d3" stroke="#bfa080" strokeWidth="1" />
      ) : (
        <path d={drawImplant(isUpper, width, height)} fill="#c8d8e8" stroke="#6090b0" strokeWidth="1.5" />
      )}

      {/* ---- Crown ---- */}
      {!isImplant && (
        <path d={toothShape.crownD} fill="#fffdf5" stroke="#bfa080" strokeWidth="1" />
      )}

      {/* ---- Pocket fill (blue area between GM and AL) ---- */}
      {!isMissing && (
        <polygon
          points={pocketPolygon}
          fill="rgba(100, 149, 237, 0.35)"
          stroke="none"
        />
      )}

      {/* ---- Attachment Level line (blue) ---- */}
      {!isMissing && (
        <polyline
          points={alPoints}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}

      {/* ---- Gingival Margin line (red) ---- */}
      {!isMissing && (
        <polyline
          points={gmPoints}
          fill="none"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}

      {/* ---- BOP dots (red circles) ---- */}
      {viewSites.map((site, i) =>
        site.bleedingOnProbing ? (
          <circle
            key={`bop-${i}`}
            cx={siteXs[i]}
            cy={dotY}
            r={DOT_R}
            fill="#ef4444"
            stroke="none"
          />
        ) : null
      )}

      {/* ---- Plaque dots (light blue squares) ---- */}
      {viewSites.map((site, i) =>
        site.plaqueIndex ? (
          <rect
            key={`pi-${i}`}
            x={siteXs[i] - DOT_R}
            y={dotY + DOT_R * 2 + 1}
            width={DOT_R * 2}
            height={DOT_R * 2}
            fill="#60a5fa"
          />
        ) : null
      )}

      {/* ---- Missing: diagonal cross ---- */}
      {isMissing && (
        <>
          <line x1="0" y1="0" x2={width} y2={height} stroke="#d1d5db" strokeWidth="1.5" />
          <line x1={width} y1="0" x2="0" y2={height} stroke="#d1d5db" strokeWidth="1.5" />
        </>
      )}

      {/* ---- Furcation indicator (bottom of crown for molars) ---- */}
      {FURCATION_TEETH.includes(toothNumber) && furcation > 0 && (
        <g transform={`translate(${cx}, ${isUpper ? CROWN_H - 2 : height - CROWN_H + 2})`}>
          {furcation === 1 && (
            <circle r={4} fill="none" stroke="#78350f" strokeWidth="1.5" />
          )}
          {furcation === 2 && (
            <path d={`M-4,0 A4,4 0 0,1 4,0`} fill="none" stroke="#78350f" strokeWidth="1.5" />
          )}
          {furcation === 3 && (
            <circle r={4} fill="#78350f" />
          )}
        </g>
      )}
    </svg>
  );
}
