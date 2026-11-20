// Golden Hour Vice — the cover engine.
// Draws the multi-panel editorial cover on a 2D canvas: a masthead strip, a
// hero panel with a sun disc and palm silhouettes, two supporting panels, and
// a title block in gold condensed caps over cream. Three layouts, three
// warm golden-hour grades, three post sizes. Everything is drawn here — no
// images, no fonts, no network.
import { sampleCanvas } from './samples.js';

export const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

export const LAYOUTS = {
  editorial: 'Editorial — hero on top, two below',
  grid: 'Golden Grid — hero left, two stacked right',
  bleed: 'Full Bleed — one photo, title over it',
};

// A grade is a warm colour story: the tint washed over every panel, the
// colour of the masthead and title block, and the title's gold gradient.
export const GRADES = {
  golden: {
    label: 'Golden Hour',
    tint: 'rgba(255,166,66,0.20)', shade: 'rgba(14,58,58,0.16)',
    masthead: '#0e3a3a', mastheadText: '#f2c14e',
    band: '#f7ead0', bandText: '#123f3f', accent: '#e8a020',
    titleTop: '#ffe9a8', titleBottom: '#e8a020', titleStroke: '#0e3a3a',
    sub: '#8a5a1d', gutter: '#f7ead0',
  },
  blaze: {
    label: 'Sunset Blaze',
    tint: 'rgba(255,92,60,0.20)', shade: 'rgba(74,20,60,0.18)',
    masthead: '#4a143c', mastheadText: '#ffb37a',
    band: '#fdeeda', bandText: '#4a143c', accent: '#d95f4b',
    titleTop: '#ffe1b0', titleBottom: '#e07856', titleStroke: '#4a143c',
    sub: '#8a3a2d', gutter: '#fdeeda',
  },
  dusk: {
    label: 'Teal Dusk',
    tint: 'rgba(64,190,170,0.16)', shade: 'rgba(10,40,52,0.22)',
    masthead: '#0a2834', mastheadText: '#ffd98a',
    band: '#eef3e6', bandText: '#0a2834', accent: '#2f8f7a',
    titleTop: '#fff3c4', titleBottom: '#d9a441', titleStroke: '#0a2834',
    sub: '#2f5a52', gutter: '#eef3e6',
  },
};

export function freshState() {
  return {
    layout: 'editorial',
    grade: 'golden',
    size: '1080x1350',
    title: 'GOLDEN HOUR VICE',
    subtitle: 'Sunset in Leonida',
    dateLine: 'NOV 19 2026  •  VICE CITY',
    grain: true,
    sun: true,
    panels: [
      { photo: null, sample: 'boulevard', zoom: 1, ox: 0, oy: 0 },
      { photo: null, sample: 'rooftop', zoom: 1, ox: 0, oy: 0 },
      { photo: null, sample: 'pier', zoom: 1, ox: 0, oy: 0 },
    ],
  };
}

// Panel rectangles for a layout, in cover coordinates.
export function panelRects(layout, W, H, mastH, bandH) {
  const m = Math.round(W * 0.022); // outer margin
  const g = Math.round(W * 0.014); // gutter
  const top = mastH + m;
  const bottom = H - bandH - m;
  const areaW = W - m * 2, areaH = bottom - top;
  if (layout === 'bleed') return [{ x: m, y: top, w: areaW, h: areaH }];
  if (layout === 'grid') {
    const heroW = Math.round(areaW * 0.64);
    const sideX = m + heroW + g, sideW = areaW - heroW - g;
    const halfH = Math.round((areaH - g) / 2);
    return [
      { x: m, y: top, w: heroW, h: areaH },
      { x: sideX, y: top, w: sideW, h: halfH },
      { x: sideX, y: top + halfH + g, w: sideW, h: areaH - halfH - g },
    ];
  }
  // editorial
  const heroH = Math.round(areaH * 0.60);
  const rowY = top + heroH + g, rowH = areaH - heroH - g;
  const halfW = Math.round((areaW - g) / 2);
  return [
    { x: m, y: top, w: areaW, h: heroH },
    { x: m, y: rowY, w: halfW, h: rowH },
    { x: m + halfW + g, y: rowY, w: areaW - halfW - g, h: rowH },
  ];
}

function drawPhotoInto(ctx, panel, rect, grade) {
  const img = panel.photo ?? sampleCanvas(panel.sample, 1200, 900);
  const iw = img.width, ih = img.height;
  const scale = Math.max(rect.w / iw, rect.h / ih) * panel.zoom;
  const dw = iw * scale, dh = ih * scale;
  const dx = rect.x + (rect.w - dw) / 2 + panel.ox * rect.w;
  const dy = rect.y + (rect.h - dh) / 2 + panel.oy * rect.h;
  ctx.save();
  ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  // Golden-hour wash: a warm tint over the top, a teal shade from below.
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = grade.tint; ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const shade = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  shade.addColorStop(0, 'rgba(0,0,0,0)');
  shade.addColorStop(1, grade.shade);
  ctx.fillStyle = shade; ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

function sunDisc(ctx, x, y, r) {
  const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * 2.4);
  g.addColorStop(0, 'rgba(255,205,110,0.75)');
  g.addColorStop(1, 'rgba(255,190,90,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

function palmSilhouette(ctx, x, y, s, color) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round';
  ctx.lineWidth = s * 0.08;
  ctx.beginPath(); ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.1, y - s * 0.5, x + s * 0.26, y - s * 0.9);
  ctx.stroke();
  const tx = x + s * 0.26, ty = y - s * 0.9;
  for (let i = 0; i < 7; i++) {
    const a = (-0.12 - i * 0.22) * Math.PI;
    const len = s * (0.4 - Math.abs(i - 3) * 0.03);
    ctx.lineWidth = s * 0.04;
    ctx.beginPath(); ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(a) * len * 0.6, ty + Math.sin(a) * len * 0.4 - s * 0.07,
      tx + Math.cos(a) * len, ty + Math.sin(a) * len * 0.85 + s * 0.09);
    ctx.stroke();
  }
}

function heroDressing(ctx, rect, grade) {
  // Sun low over the horizon line, palms framing the hero panel.
  sunDisc(ctx, rect.x + rect.w * 0.68, rect.y + rect.h * 0.42, Math.min(rect.w, rect.h) * 0.085);
  palmSilhouette(ctx, rect.x + rect.w * 0.06, rect.y + rect.h, Math.min(rect.w, rect.h) * 0.5, 'rgba(20,12,18,0.85)');
  palmSilhouette(ctx, rect.x + rect.w * 0.94, rect.y + rect.h, Math.min(rect.w, rect.h) * 0.42, 'rgba(20,12,18,0.85)');
}

function fitFont(ctx, text, maxW, startPx, family, weight = 900) {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${family}`;
  while (px > 24 && ctx.measureText(text).width > maxW) {
    px -= 4;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  return px;
}

const TITLE_FAMILY = '"Noto Sans Condensed Black", "Arial Narrow", "Helvetica Neue Condensed", sans-serif';
const SCRIPT_FAMILY = 'Georgia, "Times New Roman", serif';

function drawTitleBlock(ctx, state, W, H, grade, bandY, bandH) {
  const cx = W / 2;
  ctx.fillStyle = grade.band;
  ctx.fillRect(0, bandY, W, bandH);
  ctx.fillStyle = grade.accent;
  ctx.fillRect(0, bandY, W, Math.max(3, H * 0.004));
  // Issue line above the title.
  const issuePx = Math.round(H * 0.016);
  ctx.font = `700 ${issuePx}px ${SCRIPT_FAMILY}`;
  ctx.fillStyle = grade.sub;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const issue = '★  LEONIDA  •  EST. 2026  •  A GOLDEN HOUR STORY  ★';
  ctx.fillText(issue, cx, bandY + bandH * 0.22);
  // The big condensed title, gold gradient, teal outline, slight tilt.
  // Centred high in the band so the subtitle below it never touches it.
  const titlePx = fitFont(ctx, state.title, W * 0.92, Math.round(H * 0.08), TITLE_FAMILY);
  ctx.save();
  ctx.translate(cx, bandY + bandH * 0.55);
  ctx.rotate(-0.018);
  const grad = ctx.createLinearGradient(0, -titlePx * 0.6, 0, titlePx * 0.55);
  grad.addColorStop(0, grade.titleTop);
  grad.addColorStop(1, grade.titleBottom);
  ctx.font = `900 ${titlePx}px ${TITLE_FAMILY}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = grade.titleStroke;
  ctx.lineWidth = Math.max(3, titlePx * 0.07);
  ctx.strokeText(state.title, 0, 0);
  ctx.fillStyle = grad;
  ctx.fillText(state.title, 0, 0);
  ctx.restore();
  // Script subtitle + date line.
  const subPx = Math.round(H * 0.024);
  ctx.font = `italic 700 ${subPx}px ${SCRIPT_FAMILY}`;
  ctx.fillStyle = grade.sub;
  ctx.fillText(state.subtitle, cx, bandY + bandH * 0.87);
  const datePx = Math.round(H * 0.015);
  ctx.font = `700 ${datePx}px ${SCRIPT_FAMILY}`;
  ctx.fillStyle = grade.bandText;
  ctx.fillText(state.dateLine, cx, bandY + bandH * 0.97);
}

function drawGrain(ctx, W, H, amount = 900) {
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#2a1a10';
  for (let i = 0; i < amount; i++) {
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  ctx.restore();
}

function drawVignette(ctx, W, H) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(20,10,5,0.28)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Draw the whole cover for `state` onto ctx at W x H.
export function drawCover(ctx, state, W, H) {
  const grade = GRADES[state.grade] ?? GRADES.golden;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = grade.gutter;
  ctx.fillRect(0, 0, W, H);
  const mastH = Math.round(H * 0.048);
  const bandH = state.layout === 'bleed' ? 0 : Math.round(H * 0.185);
  const rects = panelRects(state.layout, W, H, mastH, bandH);
  // Masthead strip.
  ctx.fillStyle = grade.masthead;
  ctx.fillRect(0, 0, W, mastH);
  const mastPx = Math.round(mastH * 0.44);
  ctx.font = `900 ${mastPx}px ${TITLE_FAMILY}`;
  ctx.fillStyle = grade.mastheadText;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('VICE CITY  •  LEONIDA', W * 0.022, mastH / 2 + 1);
  ctx.textAlign = 'right';
  ctx.fillText('GOLDEN HOUR', W * 0.978, mastH / 2 + 1);
  // Panels.
  const count = state.layout === 'bleed' ? 1 : 3;
  for (let i = 0; i < count; i++) {
    const rect = rects[i];
    drawPhotoInto(ctx, state.panels[i], rect, grade);
    if (state.sun && i === 0) {
      ctx.save();
      ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
      heroDressing(ctx, rect, grade);
      ctx.restore();
    }
    // Cream frame around each panel.
    ctx.strokeStyle = grade.gutter;
    ctx.lineWidth = Math.max(3, W * 0.006);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  }
  if (state.layout === 'bleed') {
    // Title over the photo: a dusk scrim rising from the bottom.
    const scrim = ctx.createLinearGradient(0, H * 0.55, 0, H);
    scrim.addColorStop(0, 'rgba(10,30,34,0)');
    scrim.addColorStop(1, 'rgba(10,30,34,0.82)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    const bandY = H * 0.74, bH = H * 0.24;
    ctx.save();
    ctx.fillStyle = 'rgba(247,234,208,0.92)';
    ctx.fillRect(0, bandY, W, 2);
    ctx.restore();
    // Title in cream/gold over the scrim.
    const cx = W / 2;
    const titlePx = fitFont(ctx, state.title, W * 0.92, Math.round(H * 0.08), TITLE_FAMILY);
    ctx.save();
    ctx.translate(cx, bandY + bH * 0.42);
    ctx.rotate(-0.018);
    const grad = ctx.createLinearGradient(0, -titlePx * 0.6, 0, titlePx * 0.55);
    grad.addColorStop(0, grade.titleTop); grad.addColorStop(1, grade.titleBottom);
    ctx.font = `900 ${titlePx}px ${TITLE_FAMILY}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.strokeStyle = grade.titleStroke; ctx.lineWidth = Math.max(3, titlePx * 0.07);
    ctx.strokeText(state.title, 0, 0);
    ctx.fillStyle = grad; ctx.fillText(state.title, 0, 0);
    ctx.restore();
    ctx.font = `italic 700 ${Math.round(H * 0.024)}px ${SCRIPT_FAMILY}`;
    ctx.fillStyle = '#ffe9a8'; ctx.textAlign = 'center';
    ctx.fillText(state.subtitle, cx, bandY + bH * 0.78);
    ctx.font = `700 ${Math.round(H * 0.015)}px ${SCRIPT_FAMILY}`;
    ctx.fillStyle = '#f7ead0';
    ctx.fillText(state.dateLine, cx, bandY + bH * 0.95);
  } else {
    drawTitleBlock(ctx, state, W, H, grade, H - bandH, bandH);
  }
  drawVignette(ctx, W, H);
  if (state.grain) drawGrain(ctx, W, H, Math.round(W * H / 1400));
}

// Render the cover at its export size into a fresh canvas.
export function renderCover(state) {
  const [W, H] = SIZES[state.size] ?? SIZES['1080x1350'];
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  drawCover(c.getContext('2d'), state, W, H);
  return c;
}
