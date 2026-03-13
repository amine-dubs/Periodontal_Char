'use client';

// ============================================================
// usePerioChart — React State Management Hook
// P2 Frontend — Week 2
//
// Manages the full periodontal chart state:
// - All teeth and their 6 sites
// - Real-time CAL calculation
// - 2-second debounce auto-save to batch endpoint
// - Statistics computation
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type Tooth,
  type ToothNumber,
  type SitePosition,
  type FurcationGrade,
  type MobilityGrade,
  type PerioStats,
  UPPER_TEETH,
  LOWER_TEETH,
  createDefaultTooth,
  calcCAL,
} from '@/types/periodontal';

const ALL_TEETH = [...UPPER_TEETH, ...LOWER_TEETH] as ToothNumber[];
const DEBOUNCE_MS = 2000; // 2s debounce for auto-save (per planning)

function initTeeth(): Map<ToothNumber, Tooth> {
  const map = new Map<ToothNumber, Tooth>();
  ALL_TEETH.forEach(tn => map.set(tn, createDefaultTooth(tn)));
  return map;
}

export function usePerioChart(chartId?: string) {
  const [teeth, setTeeth] = useState<Map<ToothNumber, Tooth>>(initTeeth);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Immutable update helpers ----

  const updateTooth = useCallback(
    (toothNumber: ToothNumber, updater: (t: Tooth) => Tooth) => {
      setTeeth(prev => {
        const next = new Map(prev);
        const tooth = next.get(toothNumber)!;
        next.set(toothNumber, updater(tooth));
        return next;
      });
    },
    []
  );

  // ---- Auto-save with 2s debounce (P2 Week 2 requirement) ----

  const scheduleSave = useCallback(
    (currentTeeth: Map<ToothNumber, Tooth>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (!chartId) return; // no chart yet — skip until backend exists
        setIsSaving(true);
        try {
          const payload = Array.from(currentTeeth.values()).flatMap(tooth =>
            tooth.sites.map(site => ({
              toothNumber: tooth.toothNumber,
              sitePosition: site.position,
              probingDepth: site.probingDepth,
              gingivalMargin: site.gingivalMargin,
              bleedingOnProbing: site.bleedingOnProbing,
              plaqueIndex: site.plaqueIndex,
              furcation: tooth.furcation,
              mobility: tooth.mobility,
            }))
          );
          await fetch(`/api/tooth-sites/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chartId, sites: payload }),
          });
          setLastSaved(new Date());
        } catch (err) {
          console.error('[periodontal] auto-save failed:', err);
        } finally {
          setIsSaving(false);
        }
      }, DEBOUNCE_MS);
    },
    [chartId]
  );

  // Trigger save whenever teeth state changes
  useEffect(() => {
    scheduleSave(teeth);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [teeth, scheduleSave]);

  // ---- Mutations ----

  /** Update PD or GM for a specific site → recalculates CAL automatically */
  const updateSiteValue = useCallback(
    (
      toothNumber: ToothNumber,
      position: SitePosition,
      field: 'probingDepth' | 'gingivalMargin',
      value: number
    ) => {
      updateTooth(toothNumber, tooth => ({
        ...tooth,
        sites: tooth.sites.map(s =>
          s.position === position ? { ...s, [field]: value } : s
        ),
      }));
    },
    [updateTooth]
  );

  /** Toggle BOP or Plaque at a specific site */
  const toggleSiteBool = useCallback(
    (
      toothNumber: ToothNumber,
      position: SitePosition,
      field: 'bleedingOnProbing' | 'plaqueIndex'
    ) => {
      updateTooth(toothNumber, tooth => ({
        ...tooth,
        sites: tooth.sites.map(s =>
          s.position === position ? { ...s, [field]: !s[field] } : s
        ),
      }));
    },
    [updateTooth]
  );

  /** Set furcation grade */
  const setFurcation = useCallback(
    (toothNumber: ToothNumber, grade: FurcationGrade) => {
      updateTooth(toothNumber, t => ({ ...t, furcation: grade }));
    },
    [updateTooth]
  );

  /** Cycle furcation grade on click (0→1→2→3→0) */
  const cycleFurcation = useCallback(
    (toothNumber: ToothNumber) => {
      updateTooth(toothNumber, t => ({
        ...t,
        furcation: ((t.furcation + 1) % 4) as FurcationGrade,
      }));
    },
    [updateTooth]
  );

  /** Set mobility grade */
  const setMobility = useCallback(
    (toothNumber: ToothNumber, grade: MobilityGrade) => {
      updateTooth(toothNumber, t => ({ ...t, mobility: grade }));
    },
    [updateTooth]
  );

  /** Toggle implant flag */
  const toggleImplant = useCallback(
    (toothNumber: ToothNumber) => {
      updateTooth(toothNumber, t => ({ ...t, isImplant: !t.isImplant }));
    },
    [updateTooth]
  );

  /** Toggle missing — clicking tooth number marks/unmarks it */
  const toggleMissing = useCallback(
    (toothNumber: ToothNumber) => {
      updateTooth(toothNumber, t => ({ ...t, isMissing: !t.isMissing }));
    },
    [updateTooth]
  );

  /** Mark all BOP sites in a jaw (SHIFT+click on BOP label) */
  const setAllBOP = useCallback(
    (jawTeeth: ToothNumber[], value: boolean) => {
      setTeeth(prev => {
        const next = new Map(prev);
        jawTeeth.forEach(tn => {
          const t = next.get(tn)!;
          next.set(tn, { ...t, sites: t.sites.map(s => ({ ...s, bleedingOnProbing: value })) });
        });
        return next;
      });
    },
    []
  );

  /** Mark all Plaque sites in a jaw */
  const setAllPlaque = useCallback(
    (jawTeeth: ToothNumber[], value: boolean) => {
      setTeeth(prev => {
        const next = new Map(prev);
        jawTeeth.forEach(tn => {
          const t = next.get(tn)!;
          next.set(tn, { ...t, sites: t.sites.map(s => ({ ...s, plaqueIndex: value })) });
        });
        return next;
      });
    },
    []
  );

  /** SHIFT+click on tooth number: reset all its values */
  const resetTooth = useCallback(
    (toothNumber: ToothNumber) => {
      updateTooth(toothNumber, () => createDefaultTooth(toothNumber));
    },
    [updateTooth]
  );

  // ---- Computed statistics ----

  const stats = useMemo<PerioStats>(() => {
    let totalPD = 0, totalCAL = 0, bopCount = 0, plaqueCount = 0, totalSites = 0;
    teeth.forEach(tooth => {
      if (tooth.isMissing) return;
      tooth.sites.forEach(s => {
        totalPD += s.probingDepth;
        totalCAL += calcCAL(s.probingDepth, s.gingivalMargin);
        if (s.bleedingOnProbing) bopCount++;
        if (s.plaqueIndex) plaqueCount++;
        totalSites++;
      });
    });
    if (totalSites === 0) return { meanPD: 0, meanCAL: 0, bopPercent: 0, plaquePercent: 0, bopCount: 0, plaqueCount: 0, totalSites: 0 };
    return {
      meanPD: +(totalPD / totalSites).toFixed(1),
      meanCAL: +(totalCAL / totalSites).toFixed(1),
      bopPercent: +((bopCount / totalSites) * 100).toFixed(1),
      plaquePercent: +((plaqueCount / totalSites) * 100).toFixed(1),
      bopCount,
      plaqueCount,
      totalSites,
    };
  }, [teeth]);

  return {
    teeth,
    stats,
    isSaving,
    lastSaved,
    // Setters
    updateSiteValue,
    toggleSiteBool,
    setFurcation,
    cycleFurcation,
    setMobility,
    toggleImplant,
    toggleMissing,
    setAllBOP,
    setAllPlaque,
    resetTooth,
  };
}
