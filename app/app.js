// Leonida Legend — GTA VI trophy guide & tracker.
// Plain ES module, no build step, no network calls beyond its own data file.
// Progress lives in localStorage; the guide data lives in data/trophies.json.

const STORAGE_KEY = 'leonida-legend.progress.v1';
const KINDS = [
  ['all', 'All types'],
  ['story', 'Story'],
  ['missable', 'Missable & one-off'],
  ['collectibles', 'Collectibles'],
  ['activities', 'Activities'],
  ['online', 'Online'],
];
const GRADES = ['all', 'platinum', 'gold', 'silver', 'bronze'];

const params = new URLSearchParams(location.search);
const $ = (sel) => document.querySelector(sel);

let DATA = null;
let earned = new Set();
let spoilerShield = false;
let view = 'list';
let kindFilter = 'all';
let gradeFilter = 'all';
let query = '';
let openId = null;

/* ---------- persistence ---------- */
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ earned: [...earned], spoilerShield }));
  } catch { /* private mode: progress simply will not persist */ }
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.earned)) earned = new Set(parsed.earned.filter((n) => Number.isInteger(n)));
    spoilerShield = parsed.spoilerShield === true;
  } catch { /* corrupted storage: start clean */ }
}

/* ---------- screenshot / deep-link parameters ----------
   ?view=roadmap  ?kind=missable  ?grade=silver  ?q=bank
   ?detail=17     ?spoiler=1      ?seed=2,3,4 (pre-mark earned, for photos) */
function applyParams() {
  if (params.get('view') === 'roadmap') view = 'roadmap';
  const k = params.get('kind');
  if (KINDS.some(([key]) => key === k)) kindFilter = k;
  const g = params.get('grade');
  if (GRADES.includes(g)) gradeFilter = g;
  if (params.has('q')) { query = params.get('q'); $('#search').value = query; }
  if (params.get('spoiler') === '1') spoilerShield = true;
  const seed = params.get('seed');
  if (seed) {
    for (const part of seed.split(',')) {
      const id = Number(part.trim());
      if (Number.isInteger(id)) earned.add(id);
    }
    save();
  }
  const d = Number(params.get('detail'));
  if (Number.isInteger(d) && d >= 1) openId = d;
}

/* ---------- helpers ---------- */
const trophies = () => DATA.trophies;
const byId = (id) => trophies().find((t) => t.id === id);
const isShielded = (t) => spoilerShield && t.hidden && !earned.has(t.id);
const fmt = (n) => n.toLocaleString('en-US');

function visibleTrophies() {
  const q = query.trim().toLowerCase();
  return trophies().filter((t) => {
    if (kindFilter !== 'all' && t.kind !== kindFilter) return false;
    if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
    if (!q) return true;
    if (isShielded(t)) return 'hidden trophy'.includes(q);
    return `${t.name} ${t.description} ${t.guide}`.toLowerCase().includes(q);
  });
}

/* ---------- header progress ---------- */
function renderProgress() {
  const total = trophies().length;
  const done = earned.size;
  $('#progress-count').textContent = `${done} / ${total} trophies`;
  const pct = total ? Math.round((done / total) * 100) : 0;
  $('#progress-pct').textContent = `${pct}%`;
  $('#progress-fill').style.width = `${pct}%`;
  $('#grade-bars').innerHTML = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = trophies().filter((t) => t.grade === g);
    const got = all.filter((t) => earned.has(t.id)).length;
    const p = all.length ? (got / all.length) * 100 : 0;
    return `<div class="grade-bar">${g}<br><b>${got}/${all.length}</b><div class="bar"><div class="fill ${g}" style="width:${p}%"></div></div></div>`;
  }).join('');
}

/* ---------- filter chips ---------- */
function renderChips() {
  $('#kind-chips').innerHTML =
    '<span class="group-label">Type</span>' +
    KINDS.map(([key, label]) => {
      const n = key === 'all' ? trophies().length : trophies().filter((t) => t.kind === key).length;
      return `<button type="button" class="chip${kindFilter === key ? ' active' : ''}" data-kind="${key}">${label} <span class="n">${n}</span></button>`;
    }).join('');
  $('#grade-chips').innerHTML =
    '<span class="group-label">Grade</span>' +
    GRADES.map((g) => {
      const n = g === 'all' ? trophies().length : trophies().filter((t) => t.grade === g).length;
      const label = g === 'all' ? 'All grades' : g[0].toUpperCase() + g.slice(1);
      return `<button type="button" class="chip${gradeFilter === g ? ' active' : ''}" data-grade="${g}">${label} <span class="n">${n}</span></button>`;
    }).join('');
}

/* ---------- checklist cards ---------- */
function flagsHtml(t) {
  const bits = [`<span class="pill grade-${t.grade}">${t.grade}</span>`];
  bits.push(`<span class="pill">${KINDS.find(([k]) => k === t.kind)?.[1] ?? t.kind}</span>`);
  if (t.count) bits.push(`<span class="pill">goal ${fmt(t.count)}</span>`);
  if (t.hidden) bits.push('<span class="flag flag-hidden">HIDDEN</span>');
  if (t.missable) bits.push('<span class="flag flag-missable">CAN BE MISSED</span>');
  else if (t['missable-note']) bits.push('<span class="flag flag-oneoff">ONE-OFF</span>');
  return bits.join('');
}

function cardHtml(t) {
  const got = earned.has(t.id);
  const shielded = isShielded(t);
  const name = shielded ? 'Hidden Trophy' : t.name;
  const desc = shielded ? 'Earn it to reveal what it asks for — or turn the spoiler shield off.' : t.description;
  return `<div class="card${got ? ' earned' : ''}${shielded ? ' spoilered' : ''}" data-open="${t.id}" tabindex="0" role="button" aria-label="${name}">
    <div class="card-top">
      <span class="check" data-toggle="${t.id}" title="Mark earned">✓</span>
      <h3>${name}</h3>
    </div>
    <p class="desc">${desc}</p>
    <div class="meta">${flagsHtml(t)}</div>
  </div>`;
}

function renderList() {
  const list = visibleTrophies();
  $('#trophy-list').innerHTML = list.map(cardHtml).join('');
  const empty = $('#empty-state');
  if (list.length === 0) {
    empty.hidden = false;
    empty.textContent = kindFilter === 'online'
      ? 'GTA VI has no online trophies — all 55 on the list are offline and single-player, so there is nothing to track under this filter.'
      : 'No trophies match the current filters. Loosen the search or pick a different type or grade.';
  } else {
    empty.hidden = true;
  }
  $('#result-count').textContent = `Showing ${list.length} of ${trophies().length}`;
}

/* ---------- detail panel ---------- */
function openDetail(id) {
  const t = byId(id);
  if (!t) return;
  openId = id;
  const got = earned.has(t.id);
  const shielded = isShielded(t);
  const note = t['missable-note'];
  $('#detail-body').innerHTML = `
    <div class="d-grade" style="color:var(--${t.grade === 'platinum' ? 'platinum' : t.grade})">${t.grade} · Trophy #${t.id} of 55 · Stage ${t.stage}</div>
    <h2>${shielded ? 'Hidden Trophy' : t.name}</h2>
    <p class="d-desc">${shielded ? 'Hidden until earned.' : t.description}</p>
    <div class="d-flags">${flagsHtml(t)}</div>
    ${t.missable ? '<p class="d-note"><strong>Missable warning:</strong> guide sites flag this one as missable — the guide below says why, and what to do about it.</p>' : ''}
    ${note ? `<p class="d-note"><strong>One-off moment:</strong> ${note}.</p>` : ''}
    <p class="d-guide">${shielded ? 'The spoiler shield is on, so the guide for this hidden trophy stays covered until you earn it. Turn the shield off in the toolbar if you would rather read ahead.' : t.guide}</p>
    <div class="d-source"><b>Source</b>${t.source}</div>
    <button type="button" class="d-earn${got ? ' undo' : ''}" data-toggle="${t.id}">${got ? 'Earned ✓ — tap to undo' : 'Mark as earned'}</button>`;
  $('#detail-panel').hidden = false;
}
function closeDetail() {
  openId = null;
  $('#detail-panel').hidden = true;
}

/* ---------- roadmap ---------- */
function renderRoadmap() {
  $('#roadmap-stages').innerHTML = DATA.stages.map((s) => {
    const items = trophies().filter((t) => t.stage === s.n);
    const done = items.filter((t) => earned.has(t.id)).length;
    const rows = items.map((t) => {
      const got = earned.has(t.id);
      const shielded = isShielded(t);
      return `<li><button type="button" class="stage-item${got ? ' done' : ''}" data-open="${t.id}">
        <span class="tick">${got ? '✓' : '·'}</span>
        <span class="nm">${shielded ? 'Hidden Trophy' : t.name}</span>
        ${t.missable ? '<span class="flag flag-missable">CAN BE MISSED</span>' : (t['missable-note'] ? '<span class="flag flag-oneoff">ONE-OFF</span>' : '')}
        <span class="gr pill grade-${t.grade}">${t.grade}</span>
      </button></li>`;
    }).join('');
    return `<div class="stage">
      <div class="stage-head"><span class="stage-num">STAGE ${s.n}</span><h3>${s.name}</h3><span class="stage-progress">${done}/${items.length} earned</span></div>
      <p class="stage-tip">${s.tip}</p>
      <ul class="stage-items">${rows}</ul>
    </div>`;
  }).join('');
}

/* ---------- render orchestration ---------- */
function render() {
  renderProgress();
  renderChips();
  $('#spoiler-toggle').checked = spoilerShield;
  $('#tab-list').classList.toggle('active', view === 'list');
  $('#tab-roadmap').classList.toggle('active', view === 'roadmap');
  $('#list-view').hidden = view !== 'list';
  $('#roadmap-view').hidden = view !== 'roadmap';
  if (view === 'list') renderList(); else renderRoadmap();
  if (openId !== null) openDetail(openId);
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id); else earned.add(id);
  save();
  render();
}

/* ---------- export / import / reset ---------- */
function exportProgress() {
  const payload = {
    game: DATA.game,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    earnedNames: [...earned].map((id) => byId(id)?.name).filter(Boolean),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-legend-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
function importProgress(file) {
  file.text().then((text) => {
    const parsed = JSON.parse(text);
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    earned = new Set(ids.filter((n) => Number.isInteger(n) && byId(n)));
    save();
    render();
  }).catch(() => alert('That file does not look like an exported progress file.'));
}

/* ---------- events & boot ---------- */
document.addEventListener('click', (ev) => {
  const toggle = ev.target.closest('[data-toggle]');
  if (toggle) { ev.stopPropagation(); toggleEarned(Number(toggle.dataset.toggle)); return; }
  const kindChip = ev.target.closest('[data-kind]');
  if (kindChip) { kindFilter = kindChip.dataset.kind; render(); return; }
  const gradeChip = ev.target.closest('[data-grade]');
  if (gradeChip) { gradeFilter = gradeChip.dataset.grade; render(); return; }
  const opener = ev.target.closest('[data-open]');
  if (opener) openDetail(Number(opener.dataset.open));
});
$('#search').addEventListener('input', (ev) => { query = ev.target.value; if (view === 'list') renderList(); renderChips(); });
$('#spoiler-toggle').addEventListener('change', (ev) => { spoilerShield = ev.target.checked; save(); render(); });
$('#tab-list').addEventListener('click', () => { view = 'list'; render(); });
$('#tab-roadmap').addEventListener('click', () => { view = 'roadmap'; render(); });
$('#detail-close').addEventListener('click', closeDetail);
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeDetail(); });
$('#export-btn').addEventListener('click', exportProgress);
$('#import-file').addEventListener('change', (ev) => { if (ev.target.files[0]) importProgress(ev.target.files[0]); ev.target.value = ''; });
$('#reset-btn').addEventListener('click', () => { earned.clear(); save(); render(); });

load();
fetch('data/trophies.json')
  .then((r) => r.json())
  .then((data) => {
    DATA = data;
    $('#sources-line').textContent = 'Sources: ' + data.sources.join(' · ');
    applyParams();
    render();
    if (openId !== null) openDetail(openId);
  })
  .catch(() => {
    $('#trophy-list').innerHTML = '<p class="empty-state">Could not load data/trophies.json — serve the app with node serve.ts and reload.</p>';
  });
