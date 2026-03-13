'use client';

// ============================================================
// PerioInputGrid.tsx — Data Entry Grid Component
// P2 Frontend — Week 2
//
// Rows per view (buccal or lingual):
//   [Implant] [Mobility] [Furcation] ← per tooth
//   [PD row]  — 3 inputs per tooth
//   [GM row]  — 3 inputs per tooth
//   [CAL row] — computed, read-only
//   [BOP row] — 3 toggles per tooth (click = label marks all)
//   [PI row]  — 3 toggles per tooth
//
// TAB key advances to next input (native HTML)
// ============================================================

import { type KeyboardEvent } from 'react';
import {
  type Tooth,
  type ToothNumber,
  type SitePosition,
  type FurcationGrade,
  type MobilityGrade,
  FURCATION_TEETH,
  calcCAL,
} from '@/types/periodontal';

const CELL_W = 54; // px per tooth — must match Tooth SVG width

export interface PerioInputGridProps {
  teeth: ToothNumber[];
  teethData: Map<ToothNumber, Tooth>;
  isUpper: boolean;
  isBuccal: boolean;       // which half of the 6 sites (1-3 or 4-6)
  onUpdateSiteValue: (tn: ToothNumber, pos: SitePosition, field: 'probingDepth' | 'gingivalMargin', val: number) => void;
  onToggleSiteBool: (tn: ToothNumber, pos: SitePosition, field: 'bleedingOnProbing' | 'plaqueIndex') => void;
  onCycleFurcation: (tn: ToothNumber) => void;
  onSetMobility: (tn: ToothNumber, grade: MobilityGrade) => void;
  onToggleMissing: (tn: ToothNumber) => void;
  onToggleImplant: (tn: ToothNumber) => void;
  onSetAllBOP: (value: boolean) => void;
  onSetAllPlaque: (value: boolean) => void;
}

// Site positions for each view
const BUCCAL_POSITIONS: SitePosition[] = [1, 2, 3];
const LINGUAL_POSITIONS: SitePosition[] = [4, 5, 6];

function furcationSymbol(grade: FurcationGrade) {
  if (grade === 0) return null;
  if (grade === 1) return '○';
  if (grade === 2) return '◑';
  return '●';
}

export default function PerioInputGrid({
  teeth,
  teethData,
  isUpper,
  isBuccal,
  onUpdateSiteValue,
  onToggleSiteBool,
  onCycleFurcation,
  onSetMobility,
  onToggleMissing,
  onToggleImplant,
  onSetAllBOP,
  onSetAllPlaque,
}: PerioInputGridProps) {
  const positions = isBuccal ? BUCCAL_POSITIONS : LINGUAL_POSITIONS;

  // Enter key moves to next input
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const inputs = document.querySelectorAll<HTMLInputElement>('input[data-grid]');
      const arr = Array.from(inputs);
      const idx = arr.indexOf(e.currentTarget);
      if (idx >= 0 && idx < arr.length - 1) arr[idx + 1].focus();
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs" style={{ tableLayout: 'fixed' }}>
        <tbody>

          {/* ---- Tooth number + Mobility + Furcation + Implant row ---- */}
          <tr>
            {/* Row label */}
            <td className="w-16 text-right pr-1 font-semibold text-gray-500">
              {isBuccal ? 'Mob.' : ''}
            </td>
            {teeth.map(tn => {
              const tooth = teethData.get(tn)!;
              const hasFurcation = FURCATION_TEETH.includes(tn);
              return (
                <td
                  key={tn}
                  className="text-center border border-gray-200 bg-gray-50"
                  style={{ width: CELL_W, padding: '1px 2px' }}
                >
                  {isBuccal && (
                    <div className="flex flex-col items-center gap-0.5">
                      {/* Tooth number — click = missing, shift+click = reset */}
                      <button
                        className={`w-8 text-[10px] font-bold rounded ${tooth.isMissing ? 'line-through text-gray-300' : 'text-[#0B3E62] hover:bg-blue-50'}`}
                        onClick={(e) => onToggleMissing(tn)}
                        title={`Tooth ${tn} — click to mark missing`}
                      >
                        {tn}
                      </button>

                      {/* Mobility selector (0-3) */}
                      <select
                        className="w-10 text-[10px] border border-gray-300 rounded text-center bg-white"
                        value={tooth.mobility}
                        onChange={e => onSetMobility(tn, Number(e.target.value) as MobilityGrade)}
                        disabled={tooth.isMissing}
                      >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                      </select>

                      {/* Implant toggle */}
                      <button
                        className={`text-[9px] px-1 rounded border ${tooth.isImplant ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-400 hover:bg-gray-100'}`}
                        onClick={() => onToggleImplant(tn)}
                        title="Toggle implant"
                      >
                        IMP
                      </button>

                      {/* Furcation (only for molars) */}
                      {hasFurcation && (
                        <button
                          className="text-[11px] w-6 h-6 rounded border border-amber-400 text-amber-700 hover:bg-amber-50"
                          onClick={() => onCycleFurcation(tn)}
                          title={`Furcation grade ${tooth.furcation}`}
                        >
                          {furcationSymbol(tooth.furcation) ?? '○'}
                        </button>
                      )}
                    </div>
                  )}
                </td>
              );
            })}
          </tr>

          {/* ---- PD Row (3 inputs per tooth for this view) ---- */}
          <Row
            label="PD"
            labelTitle="Probing Depth (mm)"
            teeth={teeth}
            teethData={teethData}
            positions={positions}
            valueKey="probingDepth"
            onUpdateSiteValue={onUpdateSiteValue}
            onKeyDown={handleKeyDown}
            inputClass="border-blue-300 focus:border-blue-500"
            pathological={(v) => v >= 4}
          />

          {/* ---- GM Row ---- */}
          <Row
            label="GM"
            labelTitle="Gingival Margin (mm)"
            teeth={teeth}
            teethData={teethData}
            positions={positions}
            valueKey="gingivalMargin"
            onUpdateSiteValue={onUpdateSiteValue}
            onKeyDown={handleKeyDown}
            inputClass="border-gray-300 focus:border-gray-500"
            allowNegative
          />

          {/* ---- CAL Row (computed) ---- */}
          <CALRow
            label="CAL"
            teeth={teeth}
            teethData={teethData}
            positions={positions}
          />

          {/* ---- BOP Row ---- */}
          <BoolRow
            label="BOP"
            labelTitle="Bleeding on Probing — click label to mark all, SHIFT+click to reset"
            field="bleedingOnProbing"
            teeth={teeth}
            teethData={teethData}
            positions={positions}
            onToggle={onToggleSiteBool}
            onSetAll={onSetAllBOP}
            activeColor="bg-red-500"
          />

          {/* ---- PI Row ---- */}
          <BoolRow
            label="PI"
            labelTitle="Plaque Index — click label to mark all, SHIFT+click to reset"
            field="plaqueIndex"
            teeth={teeth}
            teethData={teethData}
            positions={positions}
            onToggle={onToggleSiteBool}
            onSetAll={onSetAllPlaque}
            activeColor="bg-blue-400"
          />

        </tbody>
      </table>
    </div>
  );
}

// ---- Numeric input row (PD or GM) ----

interface RowProps {
  label: string;
  labelTitle?: string;
  teeth: ToothNumber[];
  teethData: Map<ToothNumber, Tooth>;
  positions: SitePosition[];
  valueKey: 'probingDepth' | 'gingivalMargin';
  onUpdateSiteValue: PerioInputGridProps['onUpdateSiteValue'];
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  inputClass?: string;
  allowNegative?: boolean;
  pathological?: (v: number) => boolean;
}

function Row({
  label, labelTitle, teeth, teethData, positions, valueKey,
  onUpdateSiteValue, onKeyDown, inputClass = '', allowNegative, pathological,
}: RowProps) {
  return (
    <tr>
      <td className="w-16 text-right pr-1 font-semibold text-gray-500" title={labelTitle}>
        {label}
      </td>
      {teeth.map(tn => {
        const tooth = teethData.get(tn)!;
        return (
          <td
            key={tn}
            className="border border-gray-200 p-0 text-center"
            style={{ width: CELL_W }}
          >
            {tooth.isMissing ? (
              <div className="flex justify-center gap-0.5 py-0.5">
                {positions.map(pos => (
                  <span key={pos} className="w-[14px] text-center text-gray-200">—</span>
                ))}
              </div>
            ) : (
              <div className="flex justify-center gap-0.5 py-0.5">
                {positions.map(pos => {
                  const siteIdx = pos - 1;
                  const val = tooth.sites[siteIdx][valueKey];
                  const isPathological = pathological?.(val) ?? false;
                  return (
                    <input
                      key={pos}
                      data-grid
                      type="number"
                      value={val === 0 ? '' : val}
                      min={allowNegative ? -10 : 0}
                      max={valueKey === 'probingDepth' ? 12 : 10}
                      step={1}
                      placeholder="0"
                      onChange={e => {
                        const raw = e.target.value;
                        const num = raw === '' ? 0 : parseInt(raw, 10);
                        if (!isNaN(num)) onUpdateSiteValue(tn, pos, valueKey, num);
                      }}
                      onKeyDown={onKeyDown}
                      className={`w-[14px] text-center text-[11px] border rounded-sm outline-none p-0
                        ${inputClass}
                        ${isPathological ? 'text-red-600 font-bold' : 'text-gray-800'}
                        [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
                      style={{ fontFamily: 'monospace' }}
                    />
                  );
                })}
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );
}

// ---- CAL computed row ----

interface CALRowProps {
  label: string;
  teeth: ToothNumber[];
  teethData: Map<ToothNumber, Tooth>;
  positions: SitePosition[];
}

function CALRow({ label, teeth, teethData, positions }: CALRowProps) {
  return (
    <tr className="bg-blue-50/40">
      <td className="w-16 text-right pr-1 font-semibold text-blue-600" title="Clinical Attachment Level = PD - GM">
        {label}
      </td>
      {teeth.map(tn => {
        const tooth = teethData.get(tn)!;
        return (
          <td
            key={tn}
            className="border border-gray-200 p-0 text-center"
            style={{ width: CELL_W }}
          >
            <div className="flex justify-center gap-0.5 py-0.5">
              {tooth.isMissing
                ? positions.map(pos => <span key={pos} className="w-[14px] text-gray-200 text-[11px]">—</span>)
                : positions.map(pos => {
                    const siteIdx = pos - 1;
                    const cal = calcCAL(tooth.sites[siteIdx].probingDepth, tooth.sites[siteIdx].gingivalMargin);
                    return (
                      <span
                        key={pos}
                        className={`w-[14px] text-center text-[11px] font-mono ${cal >= 4 ? 'text-red-600 font-bold' : 'text-blue-700'}`}
                      >
                        {cal}
                      </span>
                    );
                  })}
            </div>
          </td>
        );
      })}
    </tr>
  );
}

// ---- Boolean toggle row (BOP / PI) ----

interface BoolRowProps {
  label: string;
  labelTitle?: string;
  field: 'bleedingOnProbing' | 'plaqueIndex';
  teeth: ToothNumber[];
  teethData: Map<ToothNumber, Tooth>;
  positions: SitePosition[];
  onToggle: PerioInputGridProps['onToggleSiteBool'];
  onSetAll: (value: boolean) => void;
  activeColor: string;
}

function BoolRow({
  label, labelTitle, field, teeth, teethData, positions, onToggle, onSetAll, activeColor,
}: BoolRowProps) {
  // Count active sites for feedback
  let activeCount = 0;
  teeth.forEach(tn => {
    const tooth = teethData.get(tn)!;
    if (tooth.isMissing) return;
    positions.forEach(pos => { if (tooth.sites[pos - 1][field]) activeCount++; });
  });

  return (
    <tr>
      <td className="w-16 text-right pr-1" title={labelTitle}>
        {/* Click = mark all, SHIFT+click = reset all */}
        <button
          className={`text-[10px] font-bold px-1 rounded ${activeCount > 0 ? 'text-red-600' : 'text-gray-500'} hover:bg-gray-100`}
          onClick={(e) => onSetAll(!e.shiftKey)}
          title={labelTitle}
        >
          {label}
          {activeCount > 0 && <span className="ml-0.5 text-[9px]">({activeCount})</span>}
        </button>
      </td>
      {teeth.map(tn => {
        const tooth = teethData.get(tn)!;
        return (
          <td
            key={tn}
            className="border border-gray-200 p-0 text-center"
            style={{ width: CELL_W }}
          >
            <div className="flex justify-center gap-0.5 py-0.5">
              {tooth.isMissing
                ? positions.map(pos => <span key={pos} className="w-4 h-4" />)
                : positions.map(pos => {
                    const siteIdx = pos - 1;
                    const active = tooth.sites[siteIdx][field];
                    return (
                      <button
                        key={pos}
                        onClick={() => onToggle(tn, pos, field)}
                        className={`w-4 h-4 rounded-full border transition-colors
                          ${active ? `${activeColor} border-transparent` : 'border-gray-300 hover:bg-gray-100'}`}
                        title={`${label} site ${pos}`}
                      />
                    );
                  })}
            </div>
          </td>
        );
      })}
    </tr>
  );
}
