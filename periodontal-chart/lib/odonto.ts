// ============================================================
// odonto.ts — Tooth SVG Drawing Library
// P2 Frontend — Week 2
//
// Implements the cargarXXa() / cargarXXb() pattern from the planning.
// Each function returns SVG JSX data to render a tooth with its
// gingival margin (red line) and probing depth (blue area) overlays.
//
// cargarXXa = buccal/vestibular view of tooth XX
// cargarXXb = lingual/palatal view of tooth XX
// ============================================================

export interface SiteValues {
  probingDepth: number;   // PD in mm
  gingivalMargin: number; // GM in mm (can be negative for recession)
}

export interface ToothDrawingOptions {
  width?: number;          // SVG width (default: 54)
  height?: number;         // SVG height (default: 90)
  isUpper?: boolean;       // true = roots go up, false = roots go down
  isMissing?: boolean;
  isImplant?: boolean;
}

/** Mapping from mm to SVG pixels for depths (1mm = 5px) */
const MM_TO_PX = 5;

/** Crown height in px */
const CROWN_H = 28;

/** Total root height in px */
const ROOT_H = 50;

/** Y position of CEJ (cement-enamel junction) line — baseline */
const CEJ_Y = CROWN_H;

// ---- Tooth shape profiles (simplified anatomical shapes) ----
// Each profile defines [crownWidth, rootWidth, rootCount]
const TOOTH_PROFILE: Record<number, { cw: number; rw: number; roots: number }> = {
  // Incisors
  11: { cw: 36, rw: 10, roots: 1 }, 21: { cw: 36, rw: 10, roots: 1 },
  12: { cw: 30, rw: 9,  roots: 1 }, 22: { cw: 30, rw: 9,  roots: 1 },
  41: { cw: 24, rw: 8,  roots: 1 }, 31: { cw: 24, rw: 8,  roots: 1 },
  42: { cw: 26, rw: 8,  roots: 1 }, 32: { cw: 26, rw: 8,  roots: 1 },
  // Canines
  13: { cw: 32, rw: 11, roots: 1 }, 23: { cw: 32, rw: 11, roots: 1 },
  43: { cw: 28, rw: 9,  roots: 1 }, 33: { cw: 28, rw: 9,  roots: 1 },
  // Premolars
  14: { cw: 34, rw: 10, roots: 1 }, 24: { cw: 34, rw: 10, roots: 1 },
  15: { cw: 34, rw: 10, roots: 1 }, 25: { cw: 34, rw: 10, roots: 1 },
  44: { cw: 32, rw: 9,  roots: 1 }, 34: { cw: 32, rw: 9,  roots: 1 },
  45: { cw: 32, rw: 9,  roots: 1 }, 35: { cw: 32, rw: 9,  roots: 1 },
  // Molars (wider)
  16: { cw: 44, rw: 14, roots: 3 }, 26: { cw: 44, rw: 14, roots: 3 },
  17: { cw: 44, rw: 14, roots: 3 }, 27: { cw: 44, rw: 14, roots: 3 },
  18: { cw: 40, rw: 12, roots: 3 }, 28: { cw: 40, rw: 12, roots: 3 },
  46: { cw: 46, rw: 14, roots: 2 }, 36: { cw: 46, rw: 14, roots: 2 },
  47: { cw: 44, rw: 13, roots: 2 }, 37: { cw: 44, rw: 13, roots: 2 },
  48: { cw: 40, rw: 12, roots: 2 }, 38: { cw: 40, rw: 12, roots: 2 },
};

function getProfile(toothNumber: number) {
  return TOOTH_PROFILE[toothNumber] ?? { cw: 34, rw: 10, roots: 1 };
}

/**
 * Generates SVG path for the tooth crown shape (simplified trapezoidal)
 */
function crownPath(cx: number, cw: number, isUpper: boolean): string {
  const half = cw / 2;
  const narrowTop = cw * 0.7 / 2;
  if (isUpper) {
    // Crown: wider at bottom (gingival), narrows at top (incisal)
    return `M${cx - narrowTop},0 L${cx + narrowTop},0 L${cx + half},${CROWN_H} L${cx - half},${CROWN_H} Z`;
  } else {
    // Inverted for lower jaw
    return `M${cx - half},0 L${cx + half},0 L${cx + narrowTop},${CROWN_H} L${cx - narrowTop},${CROWN_H} Z`;
  }
}

/**
 * Generates SVG path for the tooth root(s)
 */
function rootPath(cx: number, rw: number, roots: number, isUpper: boolean, totalH: number): string {
  const rootTop = CROWN_H;
  const rootBottom = totalH;
  const rootH = rootBottom - rootTop;

  if (roots === 1) {
    const hw = rw / 2;
    if (isUpper) {
      return `M${cx - hw},${rootTop} C${cx - hw},${rootTop + rootH * 0.3} ${cx - hw * 0.3},${rootBottom} ${cx},${rootBottom} C${cx + hw * 0.3},${rootBottom} ${cx + hw},${rootTop + rootH * 0.3} ${cx + hw},${rootTop} Z`;
    } else {
      return `M${cx - hw},${rootTop} C${cx - hw},${rootTop + rootH * 0.7} ${cx - hw * 0.3},${rootBottom} ${cx},${rootBottom} C${cx + hw * 0.3},${rootBottom} ${cx + hw},${rootTop + rootH * 0.7} ${cx + hw},${rootTop} Z`;
    }
  }

  // Multi-root: spread roots
  const spread = rw * 0.6;
  let d = '';
  const centers = roots === 2
    ? [cx - spread, cx + spread]
    : [cx - spread * 1.3, cx, cx + spread * 1.3];

  centers.forEach(rc => {
    const hw = rw / 2 * 0.7;
    if (isUpper) {
      d += `M${rc - hw},${rootTop} C${rc - hw},${rootTop + rootH * 0.3} ${rc - hw * 0.3},${rootBottom} ${rc},${rootBottom} ` +
           `C${rc + hw * 0.3},${rootBottom} ${rc + hw},${rootTop + rootH * 0.3} ${rc + hw},${rootTop} Z `;
    } else {
      d += `M${rc - hw},${rootTop} C${rc - hw},${rootTop + rootH * 0.7} ${rc - hw * 0.3},${rootBottom} ${rc},${rootBottom} ` +
           `C${rc + hw * 0.3},${rootBottom} ${rc + hw},${rootTop + rootH * 0.7} ${rc + hw},${rootTop} Z `;
    }
  });
  return d;
}

/**
 * Compute the 3 X positions for the sites (mesial, central, distal)
 * within the tooth's crown width
 */
function siteXPositions(cx: number, cw: number): [number, number, number] {
  const half = cw / 2;
  return [cx - half * 0.75, cx, cx + half * 0.75];
}

/**
 * Convert a PD+GM value to a Y position in the SVG
 * GM = 0 → CEJ line (y = CROWN_H)
 * Positive PD values go away from crown into root
 */
function siteToY(pd: number, gm: number, isUpper: boolean, totalH: number): { gmY: number; alY: number } {
  const cal = pd - gm; // Clinical Attachment Level

  if (isUpper) {
    // Upper: crown at top, root goes DOWN → deeper = higher Y value
    const gmY = CEJ_Y - gm * MM_TO_PX;          // GM above CEJ if positive
    const alY = CEJ_Y + cal * MM_TO_PX;          // AL below CEJ
    return {
      gmY: Math.max(0, Math.min(totalH, gmY)),
      alY: Math.max(0, Math.min(totalH, alY)),
    };
  } else {
    // Lower: crown at bottom (SVG flips) → deeper = lower Y value
    const refY = totalH - CROWN_H;               // CEJ for lower jaw
    const gmY = refY + gm * MM_TO_PX;
    const alY = refY - cal * MM_TO_PX;
    return {
      gmY: Math.max(0, Math.min(totalH, gmY)),
      alY: Math.max(0, Math.min(totalH, alY)),
    };
  }
}

// ============================================================
// Core drawing function used by cargarXXa / cargarXXb
// ============================================================

export interface OdontoDrawData {
  /** SVG elements as strings for the tooth shape */
  toothShape: {
    crownD: string;
    rootD: string;
  };
  /** Points for the gingival margin (red) polyline across the 3 sites */
  gmPoints: string;
  /** Points for the attachment level (blue) polyline across the 3 sites */
  alPoints: string;
  /** Polygon path for the pocket fill area */
  pocketPolygon: string;
  /** Site X positions */
  siteXs: [number, number, number];
  /** SVG viewBox */
  viewBox: string;
}

function drawToothView(
  toothNumber: number,
  sites: [SiteValues, SiteValues, SiteValues], // 3 sites for this view
  isUpper: boolean,
  options: ToothDrawingOptions = {}
): OdontoDrawData {
  const W = options.width ?? 54;
  const H = options.height ?? 90;
  const cx = W / 2;
  const profile = getProfile(toothNumber);

  // Scale crown width to fit within W
  const maxCW = W - 4;
  const scaledCW = Math.min(profile.cw, maxCW);
  const scaledRW = (profile.rw / profile.cw) * scaledCW;

  const crownD = crownPath(cx, scaledCW, isUpper);
  const rootD = rootPath(cx, scaledRW, profile.roots, isUpper, H);

  const siteXs = siteXPositions(cx, scaledCW);

  // Compute Y for each of the 3 sites
  const gmYs = sites.map(s => siteToY(s.probingDepth, s.gingivalMargin, isUpper, H).gmY);
  const alYs = sites.map(s => siteToY(s.probingDepth, s.gingivalMargin, isUpper, H).alY);

  const gmPoints = siteXs.map((x, i) => `${x},${gmYs[i]}`).join(' ');
  const alPoints = siteXs.map((x, i) => `${x},${alYs[i]}`).join(' ');

  // Pocket polygon: GM line + AL line reversed
  const pocketPolygon = [
    ...siteXs.map((x, i) => `${x},${gmYs[i]}`),
    ...[...siteXs].reverse().map((x, i) => `${x},${alYs[2 - i]}`),
  ].join(' ');

  return {
    toothShape: { crownD, rootD },
    gmPoints,
    alPoints,
    pocketPolygon,
    siteXs,
    viewBox: `0 0 ${W} ${H}`,
  };
}

// ============================================================
// Public API: cargarXXa / cargarXXb (from the planning)
// ============================================================

/**
 * cargarXXa — Load buccal/vestibular view of tooth XX
 * Sites 1 (mesial), 2 (central), 3 (distal)
 */
export function cargarBuccal(
  toothNumber: number,
  sites: [SiteValues, SiteValues, SiteValues],
  options?: ToothDrawingOptions
): OdontoDrawData {
  return drawToothView(toothNumber, sites, options?.isUpper ?? true, options);
}

/**
 * cargarXXb — Load lingual/palatal view of tooth XX
 * Sites 4 (mesial), 5 (central), 6 (distal)
 */
export function cargarLingual(
  toothNumber: number,
  sites: [SiteValues, SiteValues, SiteValues],
  options?: ToothDrawingOptions
): OdontoDrawData {
  return drawToothView(toothNumber, sites, options?.isUpper ?? true, options);
}

/**
 * Generate dynamic function names following cargarXXa / cargarXXb convention.
 * Usage: getCargarFunc(16, 'a')(sitesData) or getCargarFunc(16, 'b')(sitesData)
 */
export function getCargarFunc(
  toothNumber: number,
  view: 'a' | 'b'
): (sites: [SiteValues, SiteValues, SiteValues], isUpper: boolean) => OdontoDrawData {
  return (sites, isUpper) =>
    drawToothView(toothNumber, sites, isUpper, {});
}

// ============================================================
// Implant symbol drawing (replaces natural tooth when isImplant=true)
// ============================================================
export function drawImplant(isUpper: boolean, width = 54, height = 90): string {
  const cx = width / 2;
  if (isUpper) {
    return `M${cx},${height} L${cx - 6},${CROWN_H} L${cx - 4},${CROWN_H} L${cx - 4},4 L${cx + 4},4 L${cx + 4},${CROWN_H} L${cx + 6},${CROWN_H} Z`;
  }
  return `M${cx},0 L${cx - 6},${height - CROWN_H} L${cx - 4},${height - CROWN_H} L${cx - 4},${height - 4} L${cx + 4},${height - 4} L${cx + 4},${height - CROWN_H} L${cx + 6},${height - CROWN_H} Z`;
}
