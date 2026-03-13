// ============================================================
// TypeScript Interfaces — Periodontal Chart Module
// P2 Frontend — Week 1
// Based on FDI notation (ISO 3950): 11-18, 21-28, 31-38, 41-48
// ============================================================

/** Tooth numbers in FDI notation */
export type ToothNumber =
  | 18 | 17 | 16 | 15 | 14 | 13 | 12 | 11
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28
  | 48 | 47 | 46 | 45 | 44 | 43 | 42 | 41
  | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38;

/** Site positions: 1-3 vestibular (mesial, central, distal), 4-6 lingual */
export type SitePosition = 1 | 2 | 3 | 4 | 5 | 6;

/** Furcation involvement per Hamp et al. (1975) */
export type FurcationGrade = 0 | 1 | 2 | 3;

/** Tooth mobility per Miller (1950) */
export type MobilityGrade = 0 | 1 | 2 | 3;

/** Chart status: draft = editable, finalized = read-only */
export type ChartStatus = 'draft' | 'finalized';

/**
 * One probing site — 6 per tooth (3 vestibular + 3 lingual/palatal)
 * CAL = PD - GM (calculated dynamically, not stored)
 */
export interface Site {
  position: SitePosition;
  probingDepth: number;     // PD: integer ≥ 0, ≤ 12 mm
  gingivalMargin: number;   // GM: integer, can be negative (-10 to +10 mm)
  bleedingOnProbing: boolean; // BOP: boolean toggle
  plaqueIndex: boolean;       // PI: boolean toggle
}

/**
 * One tooth with its 6 sites and per-tooth clinical data
 */
export interface Tooth {
  toothNumber: ToothNumber;
  sites: Site[];              // always exactly 6 sites
  furcation: FurcationGrade;
  mobility: MobilityGrade;
  isImplant: boolean;
  isMissing: boolean;
  note: string;
}

/**
 * A full periodontal exam chart linked to a patient
 * Maps to the periodontal_charts table
 */
export interface PerioChart {
  id: string;
  patientId: string;
  doctorId: string;
  status: ChartStatus;
  teeth: Tooth[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Computed statistics (not stored — derived from sites) */
export interface PerioStats {
  meanPD: number;
  meanCAL: number;
  bopPercent: number;
  plaquePercent: number;
  bopCount: number;
  plaqueCount: number;
  totalSites: number;
}

// ---- Display order (right to left from patient's view) ----

/** Upper jaw: quadrants 1 then 2 */
export const UPPER_TEETH: ToothNumber[] = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
];

/** Lower jaw: quadrants 4 then 3 */
export const LOWER_TEETH: ToothNumber[] = [
  48, 47, 46, 45, 44, 43, 42, 41,
  31, 32, 33, 34, 35, 36, 37, 38,
];

/** Molars & premolars that can have furcation involvement */
export const FURCATION_TEETH: ToothNumber[] = [
  18, 17, 16, 28, 27, 26,
  48, 47, 46, 38, 37, 36,
];

// ---- Factory helpers ----

export function createDefaultSite(position: SitePosition): Site {
  return { position, probingDepth: 0, gingivalMargin: 0, bleedingOnProbing: false, plaqueIndex: false };
}

export function createDefaultTooth(toothNumber: ToothNumber): Tooth {
  return {
    toothNumber,
    sites: ([1, 2, 3, 4, 5, 6] as SitePosition[]).map(createDefaultSite),
    furcation: 0,
    mobility: 0,
    isImplant: false,
    isMissing: false,
    note: '',
  };
}

/** CAL = PD - GM  (positive = attachment loss, negative = pseudo-pocket) */
export function calcCAL(pd: number, gm: number): number {
  return pd - gm;
}
