// Fixed scenes for screenshots: ?shot=editor shows the editor with sample
// scenes loaded; ?shot=cover shows the cover the app exported, drawn by the
// app's own cover engine at the export size. `size`, `grade`, `layout`,
// `title`, `subtitle` and `date` come from the query. window.__shotReady is
// set once painted, so a headless screenshot can wait for it.
import { SIZES, GRADES, LAYOUTS } from './cover.js';
import { SAMPLE_NAMES } from './samples.js';

export async function runShot(shot, query, api) {
  const { state, redraw } = api;
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (query.get('size') && SIZES[query.get('size')]) state.size = query.get('size');
  if (query.get('grade') && GRADES[query.get('grade')]) state.grade = query.get('grade');
  if (query.get('layout') && LAYOUTS[query.get('layout')]) state.layout = query.get('layout');
  if (query.get('title')) state.title = query.get('title');
  if (query.get('subtitle')) state.subtitle = query.get('subtitle');
  if (query.get('date')) state.dateLine = query.get('date');
  const photos = (query.get('photos') ?? 'boulevard,rooftop,pier').split(',');
  for (let i = 0; i < 3; i++) {
    const name = SAMPLE_NAMES.includes(photos[i]) ? photos[i] : 'boulevard';
    state.panels[i].sample = name;
    state.panels[i].photo = null;
  }
  // Per-panel framing for the shot, so each panel shows a different crop.
  state.panels[0].zoom = 1.12; state.panels[0].ox = 0.04; state.panels[0].oy = -0.04;
  state.panels[1].zoom = 1.3; state.panels[1].ox = -0.12; state.panels[1].oy = 0.08;
  state.panels[2].zoom = 1.25; state.panels[2].ox = 0.1; state.panels[2].oy = -0.06;
  const titleInput = document.getElementById('title');
  const subtitleInput = document.getElementById('subtitle');
  const dateInput = document.getElementById('dateLine');
  if (titleInput) titleInput.value = state.title;
  if (subtitleInput) subtitleInput.value = state.subtitle;
  if (dateInput) dateInput.value = state.dateLine;
  try { await document.fonts.ready; } catch { /* system fallbacks still draw */ }
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
