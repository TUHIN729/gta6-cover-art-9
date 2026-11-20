// Golden Hour Vice — the editor.
// Wires the controls to the cover engine: photo uploads per panel (or one
// photo for all panels), drag to reframe, wheel to zoom, caption editing,
// layout / grade / size pickers, and one-click PNG export. Photos are read
// with FileReader on this machine and never uploaded.
import { SIZES, LAYOUTS, GRADES, freshState, drawCover, panelRects, renderCover } from './cover.js';
import { SAMPLE_NAMES } from './samples.js';

const state = freshState();
let selectedPanel = 0;

const $ = (id) => document.getElementById(id);
const preview = $('preview');
const pctx = preview.getContext('2d');

function status(msg) { $('status').textContent = msg; }

function redraw() {
  const [W, H] = SIZES[state.size];
  if (preview.width !== W || preview.height !== H) { preview.width = W; preview.height = H; }
  drawCover(pctx, state, W, H);
  document.querySelectorAll('#layouts button').forEach((b) => b.classList.toggle('on', b.dataset.layout === state.layout));
  document.querySelectorAll('#grades button').forEach((b) => b.classList.toggle('on', b.dataset.grade === state.grade));
  document.querySelectorAll('#sizes button').forEach((b) => b.classList.toggle('on', b.dataset.size === state.size));
  $('zoom').value = String(state.panels[selectedPanel].zoom);
  $('zoomVal').textContent = `${Math.round(state.panels[selectedPanel].zoom * 100)}%`;
  document.querySelectorAll('.panel-card').forEach((card, i) => card.classList.toggle('on', i === selectedPanel));
}

// Build one control card per panel: upload, sample picker, zoom slider.
function buildPanelCards() {
  const host = $('panels');
  host.innerHTML = '';
  const names = ['Hero panel', 'Panel two', 'Panel three'];
  state.panels.forEach((panel, i) => {
    const card = document.createElement('div');
    card.className = 'panel-card';
    card.innerHTML = `
      <strong>${names[i]}</strong>
      <label>Photo <input type="file" accept="image/*" data-panel="${i}"></label>
      <label>Scene
        <select data-sample="${i}">
          ${SAMPLE_NAMES.map((n) => `<option value="${n}"${panel.sample === n ? ' selected' : ''}>${n[0].toUpperCase() + n.slice(1)}</option>`).join('')}
        </select>
      </label>
      <button type="button" data-fill="${i}">Fill all panels with this photo</button>`;
    card.addEventListener('click', (e) => {
      if (e.target.closest('input,select,button')) { /* still select the panel */ }
      selectedPanel = i; redraw();
    });
    host.appendChild(card);
  });
  host.querySelectorAll('input[type=file]').forEach((input) => {
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const i = Number(input.dataset.panel);
          state.panels[i].photo = img;
          state.panels[i].zoom = 1; state.panels[i].ox = 0; state.panels[i].oy = 0;
          selectedPanel = i;
          redraw();
          status(`Loaded ${file.name} into panel ${i + 1}. Drag it on the cover to reframe.`);
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  });
  host.querySelectorAll('select[data-sample]').forEach((sel) => {
    sel.addEventListener('change', () => {
      const i = Number(sel.dataset.sample);
      state.panels[i].sample = sel.value;
      state.panels[i].photo = null;
      selectedPanel = i;
      redraw();
    });
  });
  host.querySelectorAll('button[data-fill]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.fill);
      const src = state.panels[i];
      state.panels.forEach((p, j) => {
        if (j === i) return;
        p.photo = src.photo; p.sample = src.sample;
        p.zoom = src.zoom; p.ox = src.ox; p.oy = src.oy;
      });
      redraw();
      status('One photo now fills all three panels — drag each to frame it differently.');
    });
  });
}

function buildPickers() {
  const layouts = $('layouts');
  Object.entries(LAYOUTS).forEach(([key, label]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.layout = key; b.textContent = label.split(' — ')[0];
    b.title = label;
    b.addEventListener('click', () => { state.layout = key; redraw(); });
    layouts.appendChild(b);
  });
  const grades = $('grades');
  Object.entries(GRADES).forEach(([key, g]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.grade = key; b.textContent = g.label;
    b.addEventListener('click', () => { state.grade = key; redraw(); });
    grades.appendChild(b);
  });
  const sizes = $('sizes');
  Object.keys(SIZES).forEach((key) => {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.size = key; b.textContent = key.replace('x', ' × ');
    b.addEventListener('click', () => { state.size = key; redraw(); });
    sizes.appendChild(b);
  });
}

function bindText() {
  const title = $('title'), subtitle = $('subtitle'), dateLine = $('dateLine');
  title.value = state.title; subtitle.value = state.subtitle; dateLine.value = state.dateLine;
  title.addEventListener('input', () => { state.title = title.value.toUpperCase() || 'GOLDEN HOUR'; redraw(); });
  subtitle.addEventListener('input', () => { state.subtitle = subtitle.value; redraw(); });
  dateLine.addEventListener('input', () => { state.dateLine = dateLine.value.toUpperCase(); redraw(); });
  $('grain').addEventListener('change', (e) => { state.grain = e.target.checked; redraw(); });
  $('sun').addEventListener('change', (e) => { state.sun = e.target.checked; redraw(); });
  $('zoom').addEventListener('input', (e) => {
    state.panels[selectedPanel].zoom = Number(e.target.value);
    redraw();
  });
}

function bindCanvas() {
  let drag = null;
  const toCover = (e) => {
    const r = preview.getBoundingClientRect();
    return { x: (e.clientX - r.left) * preview.width / r.width, y: (e.clientY - r.top) * preview.height / r.height };
  };
  preview.addEventListener('pointerdown', (e) => {
    const p = toCover(e);
    const [W, H] = SIZES[state.size];
    const mastH = Math.round(H * 0.048);
    const bandH = state.layout === 'bleed' ? 0 : Math.round(H * 0.185);
    const rects = panelRects(state.layout, W, H, mastH, bandH);
    const i = rects.findIndex((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
    if (i < 0) return;
    selectedPanel = i;
    drag = { i, x: p.x, y: p.y, ox: state.panels[i].ox, oy: state.panels[i].oy, rect: rects[i] };
    preview.setPointerCapture(e.pointerId);
    redraw();
  });
  preview.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = toCover(e);
    const panel = state.panels[drag.i];
    panel.ox = drag.ox + (p.x - drag.x) / drag.rect.w;
    panel.oy = drag.oy + (p.y - drag.y) / drag.rect.h;
    panel.ox = Math.max(-0.6, Math.min(0.6, panel.ox));
    panel.oy = Math.max(-0.6, Math.min(0.6, panel.oy));
    redraw();
  });
  preview.addEventListener('pointerup', () => { drag = null; });
  preview.addEventListener('wheel', (e) => {
    e.preventDefault();
    const panel = state.panels[selectedPanel];
    panel.zoom = Math.max(1, Math.min(3, panel.zoom * (e.deltaY < 0 ? 1.08 : 0.92)));
    redraw();
  }, { passive: false });
}

function bindExport() {
  $('export').addEventListener('click', () => {
    const canvas = renderCover(state);
    canvas.toBlob((blob) => {
      if (!blob) { status('Export failed — try again.'); return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `golden-hour-vice-${state.size}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      status(`Exported ${state.size} PNG — share it anywhere.`);
    }, 'image/png');
  });
  $('shuffle').addEventListener('click', () => {
    const keys = Object.keys(LAYOUTS);
    state.layout = keys[(keys.indexOf(state.layout) + 1) % keys.length];
    redraw();
  });
}

buildPickers();
buildPanelCards();
bindText();
bindCanvas();
bindExport();
redraw();
status('Ready — pick a layout and a grade, load a photo, export the PNG.');

// Screenshot scenes, used by shots.js: the editor with a photo loaded, and
// the cover the app exported, drawn by this same engine.
export const shotApi = { state, redraw };
