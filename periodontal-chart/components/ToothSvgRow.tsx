'use client';

// ============================================================
// ToothSvgRow.tsx — Horizontal row of SVG tooth drawings
// Uses Tooth.tsx (odonto.ts) for each tooth
// ============================================================

import type { Tooth, ToothNumber } from '@/types/periodontal';
import ToothComponent from './Tooth';

interface ToothSvgRowProps {
  teeth: ToothNumber[];
  teethData: Map<ToothNumber, Tooth>;
  isUpper: boolean;
  onToggleMissing: (tn: ToothNumber) => void;
}

export default function ToothSvgRow({ teeth, teethData, isUpper, onToggleMissing }: ToothSvgRowProps) {
  return (
    <div className="flex border-y border-gray-200 bg-gray-50 my-1">
      {/* label spacer */}
      <div className="w-16 flex items-center justify-end pr-1 text-[9px] text-gray-400 font-semibold shrink-0">
        {isUpper ? '↓' : '↑'}
      </div>
      {/* Buccal view */}
      <div className="flex">
        {teeth.map(tn => (
          <ToothComponent
            key={tn}
            tooth={teethData.get(tn)!}
            isUpper={isUpper}
            isBuccal={true}
            width={54}
            height={90}
            onClick={() => onToggleMissing(tn)}
          />
        ))}
      </div>
    </div>
  );
}
