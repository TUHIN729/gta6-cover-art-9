// Golden Hour Vice — procedural sample scenes.
// Every scene is drawn on canvas at runtime, so the app ships no photos and
// works offline. No real person, no Rockstar artwork: invented Vice City
// moments at golden hour — a boulevard, a rooftop, a pier, a palm street.
export const SAMPLE_NAMES = ['boulevard', 'rooftop', 'pier', 'street'];

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function skyGradient(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function sunDisc(ctx, x, y, r, core, halo) {
  const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * 2.6);
  g.addColorStop(0, halo);
  g.addColorStop(1, 'rgba(255,190,90,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

// A palm silhouette: curved trunk + drooping fronds, drawn with strokes.
function palm(ctx, x, y, s, color) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round';
  ctx.lineWidth = s * 0.09;
  ctx.beginPath(); ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.12, y - s * 0.55, x + s * 0.28, y - s * 0.95);
  ctx.stroke();
  const tx = x + s * 0.28, ty = y - s * 0.95;
  for (let i = 0; i < 7; i++) {
    const a = (-0.15 - i * 0.22) * Math.PI;
    const len = s * (0.42 - Math.abs(i - 3) * 0.03);
    ctx.lineWidth = s * 0.045;
    ctx.beginPath(); ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(
      tx + Math.cos(a) * len * 0.6, ty + Math.sin(a) * len * 0.45 - s * 0.08,
      tx + Math.cos(a) * len, ty + Math.sin(a) * len * 0.9 + s * 0.1,
    );
    ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(tx, ty, s * 0.06, 0, Math.PI * 2); ctx.fill();
}

function buildingRow(ctx, w, h, baseY, color, lit) {
  let x = 0;
  while (x < w) {
    const bw = w * (0.09 + Math.random() * 0.1);
    const bh = h * (0.12 + Math.random() * 0.22);
    ctx.fillStyle = color;
    ctx.fillRect(x, baseY - bh, bw, bh);
    // Lit windows, warm gold against the dusk facade.
    ctx.fillStyle = lit;
    const cols = Math.max(2, Math.floor(bw / (w * 0.03)));
    const rows = Math.max(3, Math.floor(bh / (h * 0.05)));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (Math.random() < 0.45) {
          ctx.fillRect(x + w * 0.012 + c * (bw / cols), baseY - bh + h * 0.02 + r * (bh / rows), w * 0.012, h * 0.018);
        }
      }
    }
    x += bw + w * 0.012;
  }
}

function drawBoulevard(ctx, w, h) {
  skyGradient(ctx, w, h, [[0, '#2b4a6b'], [0.45, '#e08a3c'], [0.75, '#f7b733'], [1, '#ffd98a']]);
  sunDisc(ctx, w * 0.5, h * 0.52, h * 0.11, '#fff3c4', 'rgba(255,196,96,0.55)');
  // Distant skyline.
  buildingRow(ctx, w, h, h * 0.66, '#3a2c4a', '#ffd27a');
  // Road: warm asphalt with a centre line, narrowing to the sun.
  ctx.fillStyle = '#4a3348';
  ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w * 0.42, h * 0.66); ctx.lineTo(w * 0.58, h * 0.66); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#f7c65c'; ctx.lineWidth = h * 0.008; ctx.setLineDash([h * 0.05, h * 0.04]);
  ctx.beginPath(); ctx.moveTo(w * 0.5, h); ctx.lineTo(w * 0.5, h * 0.66); ctx.stroke(); ctx.setLineDash([]);
  // Convertible silhouette cruising toward the sunset.
  ctx.fillStyle = '#1d1420';
  const cy = h * 0.78, cw = w * 0.34, ch = h * 0.075;
  ctx.beginPath();
  ctx.moveTo(w * 0.33, cy); ctx.lineTo(w * 0.36, cy - ch * 0.9); ctx.lineTo(w * 0.44, cy - ch * 1.25);
  ctx.lineTo(w * 0.58, cy - ch * 1.25); ctx.lineTo(w * 0.64, cy - ch * 0.7); ctx.lineTo(w * 0.67, cy); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(w * 0.4, cy + ch * 0.12, ch * 0.42, 0, Math.PI * 2); ctx.arc(w * 0.6, cy + ch * 0.12, ch * 0.42, 0, Math.PI * 2); ctx.fill();
  palm(ctx, w * 0.08, h * 0.98, h * 0.42, '#241527');
  palm(ctx, w * 0.92, h * 0.98, h * 0.36, '#241527');
}

function drawRooftop(ctx, w, h) {
  skyGradient(ctx, w, h, [[0, '#17323f'], [0.5, '#c96a3f'], [0.8, '#f2a54a'], [1, '#ffd98a']]);
  sunDisc(ctx, w * 0.72, h * 0.42, h * 0.09, '#ffe9a8', 'rgba(255,180,80,0.5)');
  buildingRow(ctx, w, h, h * 0.62, '#2c2138', '#ffcf7d');
  // Rooftop floor + railing in the foreground.
  ctx.fillStyle = '#1c1420'; ctx.fillRect(0, h * 0.62, w, h * 0.38);
  ctx.fillStyle = '#f7ead0';
  for (let i = 0; i < 9; i++) ctx.fillRect(w * (0.03 + i * 0.115), h * 0.64, w * 0.012, h * 0.1);
  ctx.fillRect(0, h * 0.64, w, h * 0.012);
  // String lights sagging between two poles.
  ctx.strokeStyle = '#3a2c4a'; ctx.lineWidth = h * 0.006;
  ctx.beginPath(); ctx.moveTo(w * 0.1, h * 0.66); ctx.quadraticCurveTo(w * 0.5, h * 0.86, w * 0.9, h * 0.66); ctx.stroke();
  for (let i = 1; i < 9; i++) {
    const t = i / 9, x = w * (0.1 + 0.8 * t);
    const y = h * (0.66 + 0.2 * 4 * t * (1 - t) * 0.5 + 0.66 * 0 - 0) + h * 0.02;
    const yy = h * 0.66 + (h * 0.86 - h * 0.66) * 2 * t * (1 - t) * 2 + h * 0.01;
    ctx.fillStyle = ['#ffd27a', '#ff9d5c', '#7fd4c1'][i % 3];
    ctx.beginPath(); ctx.arc(x, yy, h * 0.012, 0, Math.PI * 2); ctx.fill();
  }
  // A figure leaning on the rail, back to the sunset.
  ctx.fillStyle = '#120d16';
  ctx.beginPath(); ctx.arc(w * 0.5, h * 0.56, h * 0.035, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(w * 0.485, h * 0.585, w * 0.03, h * 0.09);
  palm(ctx, w * 0.06, h * 0.66, h * 0.3, '#1d1420');
}

function drawPier(ctx, w, h) {
  skyGradient(ctx, w, h, [[0, '#2f6f7a'], [0.45, '#f2a54a'], [0.7, '#ffd98a'], [1, '#ffe9b0']]);
  // No sun disc here: the cover engine adds one low sun over the hero panel,
  // and two suns would read as a mistake.
  // Turquoise water with a sun glitter path.
  const wg = ctx.createLinearGradient(0, h * 0.55, 0, h);
  wg.addColorStop(0, '#3f9a8f'); wg.addColorStop(1, '#14505c');
  ctx.fillStyle = wg; ctx.fillRect(0, h * 0.55, w, h * 0.45);
  ctx.fillStyle = 'rgba(255,220,140,0.5)';
  for (let i = 0; i < 26; i++) {
    const y = h * (0.58 + Math.random() * 0.38);
    const ww = w * (0.02 + Math.random() * 0.1) * (1 - (y - h * 0.58) / (h * 0.4) * 0.4);
    ctx.fillRect(w * 0.5 - ww / 2 + (Math.random() - 0.5) * w * 0.06, y, ww, h * 0.006);
  }
  // Wooden pier planks running into the water.
  ctx.fillStyle = '#6b4a2f';
  ctx.beginPath(); ctx.moveTo(w * 0.36, h); ctx.lineTo(w * 0.47, h * 0.55); ctx.lineTo(w * 0.53, h * 0.55); ctx.lineTo(w * 0.64, h); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#3f2a18'; ctx.lineWidth = h * 0.005;
  for (let i = 0; i < 10; i++) {
    const t = i / 10, y = h * (0.55 + 0.45 * t * t);
    const x1 = w * (0.47 - 0.11 * t), x2 = w * (0.53 + 0.11 * t);
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
  }
  // Fisherman with a rod at the pier's end.
  ctx.strokeStyle = '#1d1420'; ctx.fillStyle = '#1d1420'; ctx.lineWidth = h * 0.008; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(w * 0.5, h * 0.5, h * 0.022, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.52); ctx.lineTo(w * 0.5, h * 0.585); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.545); ctx.quadraticCurveTo(w * 0.62, h * 0.5, w * 0.72, h * 0.56); ctx.stroke();
  palm(ctx, w * 0.9, h * 0.62, h * 0.34, '#1d1420');
}

function drawStreet(ctx, w, h) {
  skyGradient(ctx, w, h, [[0, '#3a5a7a'], [0.5, '#e8933f'], [0.8, '#ffc46b'], [1, '#ffe3a1']]);
  // No sun disc here: the cover engine adds one low sun over the hero panel.
  // Warm pastel facades on both sides of the street.
  const cols = ['#e07856', '#f2a54a', '#7fb5a3', '#d95f4b', '#e8b64c'];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = cols[i];
    ctx.fillRect(0, h * (0.3 + i * 0.12), w * (0.16 + i * 0.02), h * (0.7 - i * 0.12));
    ctx.fillStyle = cols[4 - i];
    ctx.fillRect(w * 0.84 - i * w * 0.02, h * (0.3 + i * 0.12), w * (0.16 + i * 0.02), h * (0.7 - i * 0.12));
  }
  // Street with long golden shadows, narrowing to the horizon.
  ctx.fillStyle = '#5a3a44';
  ctx.beginPath(); ctx.moveTo(w * 0.32, h); ctx.lineTo(w * 0.44, h * 0.62); ctx.lineTo(w * 0.56, h * 0.62); ctx.lineTo(w * 0.68, h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(20,10,16,0.35)';
  ctx.beginPath(); ctx.moveTo(w * 0.32, h); ctx.lineTo(w * 0.44, h * 0.62); ctx.lineTo(w * 0.5, h * 0.62); ctx.lineTo(w * 0.47, h); ctx.closePath(); ctx.fill();
  // A small convertible at the vanishing point, for scale.
  ctx.fillStyle = '#1d1420';
  const cx = w * 0.5, cy = h * 0.63, cw = w * 0.07, ch = h * 0.02;
  ctx.beginPath();
  ctx.moveTo(cx - cw / 2, cy); ctx.lineTo(cx - cw * 0.32, cy - ch);
  ctx.lineTo(cx + cw * 0.32, cy - ch); ctx.lineTo(cx + cw / 2, cy); ctx.closePath(); ctx.fill();
  palm(ctx, w * 0.18, h * 0.66, h * 0.4, '#241527');
  palm(ctx, w * 0.82, h * 0.66, h * 0.34, '#241527');
  palm(ctx, w * 0.05, h * 0.72, h * 0.3, '#241527');
  palm(ctx, w * 0.95, h * 0.72, h * 0.26, '#241527');
}

const DRAWERS = { boulevard: drawBoulevard, rooftop: drawRooftop, pier: drawPier, street: drawStreet };

// Draw a named scene into a fresh canvas and return it (usable as a photo).
export function sampleCanvas(name, w = 1200, h = 900) {
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d');
  (DRAWERS[name] ?? DRAWERS.boulevard)(ctx, w, h);
  return c;
}
