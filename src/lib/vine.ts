// Vine + flower-bloom geometry for the Seads nav, ported from the Claude Design prototype.
// petal geometry: angle measured in degrees from straight-down (0), negative = left, positive = right.
// petals are drawn as a pointed leaf/petal path (narrow at the anchor, widest at the middle,
// tapering back to a point at the tip) so adjacent petals stay visually separate even when
// their rotation angles are close together.

export type Vine = { width: number; height: number; path: string; sprigs: Sprig[] };
export type Sprig = { path: string; fill: string };

// A calm decorative vine with gentle, non-repeating organic variation (smooth low-frequency
// modulation of amplitude/period, not randomness) plus a soft overall sag like a real draped
// vine, and a taper from a thicker base near the logo to a finer tip near the far end.
// Sprigs are computed separately (see computeSprigs) so they sit exactly on this curve,
// aligned to each nav button rather than at arbitrary wave crests.
export function buildVine(width: number): { path: string } {
  if (!width) return { path: "" };
  const baseAmp = 8;
  const basePeriod = 190;
  const periods = Math.max(2, Math.round(width / basePeriod));
  const step = width / periods;
  const sagAmp = 5; // gentle overall droop, like a vine draped between two points
  const baseYAt = (x: number) => 22 + sagAmp * Math.sin((Math.PI * x) / width);

  let d = `M0,${baseYAt(0).toFixed(1)}`;

  for (let i = 0; i < periods; i++) {
    const x0 = i * step;
    // smooth, non-random envelope so neighboring humps vary gently instead of repeating exactly
    const envelope = 1 + 0.22 * Math.sin(i * 0.85 + 0.4);
    const amp = baseAmp * envelope;
    const upFirst = i % 2 === 0;
    const midX = x0 + step / 2;
    const endX = x0 + step;
    const midBaseY = baseYAt(midX);
    const endBaseY = baseYAt(endX);
    const crestY = upFirst ? midBaseY - amp : midBaseY + amp;
    const troughY = upFirst ? endBaseY + amp * 0.55 : endBaseY - amp * 0.55;
    const qX = x0 + step * (0.24 + 0.05 * Math.sin(i * 1.3));
    const q2X = x0 + step * (0.76 - 0.05 * Math.sin(i * 1.7));

    d += ` C${qX.toFixed(1)},${crestY.toFixed(1)} ${qX.toFixed(1)},${crestY.toFixed(1)} ${midX.toFixed(1)},${midBaseY.toFixed(1)}`;
    d += ` C${q2X.toFixed(1)},${troughY.toFixed(1)} ${q2X.toFixed(1)},${troughY.toFixed(1)} ${endX.toFixed(1)},${endBaseY.toFixed(1)}`;
  }

  return { path: d };
}

export function buildSprigFromPoint(px: number, py: number, dir: number, scale: number): string {
  const o = (dx: number, dy: number) => `${(px + dir * dx * scale).toFixed(1)},${(py + dy * scale).toFixed(1)}`;
  return `M${px.toFixed(1)},${py.toFixed(1)} C${o(3, -9)} ${o(11, -16)} ${o(21, -17)} C${o(27, -11)} ${o(23, -3)} ${o(15, 0)} C${o(9, 2)} ${o(4, 1)} ${px.toFixed(1)},${py.toFixed(1)} Z`;
}

function petalPath(anchorX: number, anchorY: number, len: number, halfWidth: number): string {
  const tipY = anchorY + len;
  const midY1 = anchorY + len * 0.32;
  const midY2 = anchorY + len * 0.68;
  return `M${anchorX},${anchorY} C${anchorX + halfWidth},${midY1} ${anchorX + halfWidth},${midY2} ${anchorX},${tipY} C${anchorX - halfWidth},${midY2} ${anchorX - halfWidth},${midY1} ${anchorX},${anchorY} Z`;
}

function petalGeom(angleDeg: number, anchorX: number, anchorY: number, len: number, halfWidth: number, labelDist: number) {
  const rad = (angleDeg * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  return {
    transform: `rotate(${angleDeg} ${anchorX} ${anchorY})`,
    path: petalPath(anchorX, anchorY, len, halfWidth),
    labelX: Math.round(anchorX + labelDist * sin),
    labelY: Math.round(anchorY + labelDist * cos),
  };
}

export type BloomChildInput = { key: string; label: string; href: string };
export type BloomChild = BloomChildInput & {
  petalTransform: string;
  petalPath: string;
  veinY: number;
  labelX: number;
  labelY: number;
  petalFill: string;
  delay: number;
};
export type FillerPetal = { transform: string; path: string; delay: number };

export function buildBloom(children: BloomChildInput[], colorScale: string[]): { kids: BloomChild[]; fillerPetals: FillerPetal[] } {
  const n = children.length;
  const anchorX = 115;
  const anchorY = 10;
  const spread = n === 2 ? 46 : 64;
  const mainAngles = n === 1 ? [0] : Array.from({ length: n }, (_, i) => -spread + (i * (2 * spread)) / (n - 1));
  const fillerAngles: number[] = [];
  for (let i = 0; i < mainAngles.length - 1; i++) fillerAngles.push((mainAngles[i] + mainAngles[i + 1]) / 2);
  fillerAngles.push(mainAngles[0] - spread * 0.75);
  fillerAngles.push(mainAngles[mainAngles.length - 1] + spread * 0.75);

  const kids: BloomChild[] = children.map((c, i) => {
    const g = petalGeom(mainAngles[i], anchorX, anchorY, 58, 12, 80);
    return {
      ...c,
      petalTransform: g.transform,
      petalPath: g.path,
      veinY: anchorY + 52,
      labelX: g.labelX,
      labelY: g.labelY,
      petalFill: colorScale[i % colorScale.length],
      delay: Math.round((0.05 + i * 0.06) * 1000) / 1000,
    };
  });
  const fillerPetals: FillerPetal[] = fillerAngles.map((a, i) => {
    const g = petalGeom(a, anchorX, anchorY, 30, 7, 0);
    return { transform: g.transform, path: g.path, delay: Math.round(i * 0.04 * 1000) / 1000 };
  });

  return { kids, fillerPetals };
}

// Small filler buds walked along the vine's own curve in the otherwise-empty stretches
// between/around the nav buttons, plus one larger sprig aligned to each button's x-position.
export function computeSprigs(pathEl: SVGPathElement, buttonCenters: number[]): Sprig[] {
  let total: number;
  try {
    total = pathEl.getTotalLength();
  } catch {
    return [];
  }
  if (!total || !buttonCenters.length) return [];

  const pointAtX = (x: number) => {
    // binary search along the vine's own path length for the point closest to this x,
    // so the sprig starts exactly on the curve rather than a guessed coordinate
    let lo = 0;
    let hi = total;
    let best = pathEl.getPointAtLength(0);
    for (let iter = 0; iter < 22; iter++) {
      const mid = (lo + hi) / 2;
      const p = pathEl.getPointAtLength(mid);
      if (p.x < x) lo = mid;
      else hi = mid;
      best = p;
    }
    return best;
  };

  const sizes = [1.15, 0.85, 1.35, 0.95];
  const colors = ["#8fb89c", "#7ba58c", "#4f8a68", "#a3c7ae"];
  const sprigs: Sprig[] = buttonCenters.map((x, i) => {
    const best = pointAtX(x);
    const dir0 = i % 2 === 0 ? -1 : 1;
    return { path: buildSprigFromPoint(x, best.y, dir0, sizes[i % sizes.length]), fill: colors[i % colors.length] };
  });

  const fillerFracs = [0.05, 0.13, 0.2, 0.36, 0.58, 0.72, 0.88, 0.97];
  const fillerSizes = [0.7, 0.75, 0.85, 0.6, 0.8, 0.65, 0.88, 0.62];
  const fillerColors = ["#a3c7ae", "#7ba58c", "#7ba58c", "#8fb89c", "#a3c7ae", "#7ba58c", "#8fb89c", "#a3c7ae"];
  const fillers = fillerFracs
    .map((frac, i) => {
      const p = pathEl.getPointAtLength(total * frac);
      // skip if too close to a button-aligned sprig to avoid crowding
      const tooClose = buttonCenters.some((cx) => Math.abs(cx - p.x) < 24);
      if (tooClose) return null;
      const dir = i % 2 === 0 ? 1 : -1;
      return { path: buildSprigFromPoint(p.x, p.y, dir, fillerSizes[i % fillerSizes.length]), fill: fillerColors[i % fillerColors.length] };
    })
    .filter((s): s is Sprig => s !== null);

  return sprigs.concat(fillers);
}
