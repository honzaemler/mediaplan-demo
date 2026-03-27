import './style.css';

import { cfgLoad, CFG } from './state';
import { A25, REV25_EX, MONTHS_F } from './data/defaults';
import { mkParams, PARAM_KEYS, scenLabel, scenFullLabel } from './data/params';
import { compute } from './compute';
import { f, fK, fKd, p, p2, dp, pc, cx, cxK, cxKd, cxR, cur, curSym } from './core/format';
import { t, mName, mNameF, L } from './i18n';
import { getCEOSliders, getSl, getSliders, getGroups, mkSliderHTML, _rawDisplay, _parseInput } from './core/slider';
import { histInit, histSave, histUndo, histRedo, histUpdateBtns } from './core/history';
import { exportCSV, exportPDF, showExportMenu, closeExportMenu } from './core/export';
import { domInit, sv, setCEO, tGrp, rerender } from './core/dom';
import { renderCEO, onCEOSl, onCEOSlDone } from './views/ceo';
import { renderPanel } from './views/models';
import { renderMonthly, onRealityChange } from './views/monthly';
import { renderCompare } from './views/compare';
import { renderSettings, settingsInit, toggleChannel, toggleCost, setCurrency, setLang, _rerenderAll } from './views/settings';

import type { Params } from './types';

// ── Load settings from localStorage ──
cfgLoad();

// ── Create params ──
const paramsA: Params = mkParams(1.35, '');
const paramsB: Params = mkParams(1.70, '');
const ceoSide = { value: 'a' };

// ── Initialize modules that need refs ──
domInit(paramsA, paramsB, ceoSide);
settingsInit(paramsA, paramsB, ceoSide);

// ── localStorage persistence ──
const LS_KEY_A = 'demoPlanA', LS_KEY_B = 'demoPlanB', LS_KEY_REAL = 'demoReality';

function lsSave() {
  const pick = (p: Params) => { const o: any={}; for(const k of PARAM_KEYS) o[k]=p[k]; return o; };
  try {
    localStorage.setItem(LS_KEY_A, JSON.stringify(pick(paramsA)));
    localStorage.setItem(LS_KEY_B, JSON.stringify(pick(paramsB)));
  } catch(e) {}
}

function _migrate(d: any) {
  if(d.shareCrossnet !== undefined && d.googleBudget === undefined) {
    const rev = d.totalRevGoal || 500000;
    const gROAS = d.googleROAS || 6.1;
    const mROAS = d.metaROAS || 4.3;
    d.googleBudget = Math.round(rev * (d.shareCrossnet + (d.sharePaidsrch||0.11)) / gROAS / 500) * 500;
    d.metaBudget   = Math.round(rev * d.sharePaidsoc / mROAS / 250) * 250;
    delete d.shareCrossnet; delete d.sharePaidsoc; delete d.sharePaidsrch;
  }
}

function lsLoad() {
  try {
    const a = localStorage.getItem(LS_KEY_A), b = localStorage.getItem(LS_KEY_B);
    if(a) { const d=JSON.parse(a); _migrate(d); Object.assign(paramsA, d); }
    if(b) { const d=JSON.parse(b); _migrate(d); Object.assign(paramsB, d); }
  } catch(e) {}
}

function lsSaveReality() {
  try { localStorage.setItem(LS_KEY_REAL, JSON.stringify(A25.reality2026)); } catch(e) {}
}

function lsLoadReality() {
  try {
    const r = localStorage.getItem(LS_KEY_REAL);
    if(r) { const arr = JSON.parse(r); if(Array.isArray(arr) && arr.length===12) A25.reality2026 = arr; }
  } catch(e) {}
}

function resetParams() {
  if(!confirm(t('resetConfirm'))) return;
  Object.assign(paramsA, mkParams(1.35, ''));
  Object.assign(paramsB, mkParams(1.70, ''));
  lsSave(); histSave();
  const av = [...document.querySelectorAll('.view.on')].map(v=>v.id.replace('view-',''))[0] || 'ceo';
  rerender(av);
}

function copyParams(fromSide: string) {
  const src = fromSide==='a' ? paramsA : paramsB;
  const dst = fromSide==='a' ? paramsB : paramsA;
  const target = fromSide==='a' ? 'B' : 'A';
  if(!confirm(t('copyConfirmPre')+fromSide.toUpperCase()+t('copyConfirmMid')+target+'?')) return;
  for(const k of PARAM_KEYS) dst[k] = src[k];
  lsSave(); histSave();
  const av = [...document.querySelectorAll('.view.on')].map(v=>v.id.replace('view-',''))[0] || 'models';
  rerender(av);
}

// ── Initialize history ──
histInit(paramsA, paramsB, lsSave, rerender);

// ── Slider interaction handlers ──
function onSl(side: string, key: string, val: any) {
  const pr = side==='a' ? paramsA : paramsB;
  const sl = getSl(key);
  pr[key] = parseFloat(val);
  const el = document.getElementById('sv-'+side+'-'+key);
  if(el && sl) el.textContent = sl.fmt(pr[key]);
  const m = compute(pr);
  const liveIds: Record<string, string> = {
    [`kv-${side}-googleSpend`]:  cxKd(m.googleSpend),
    [`ks-${side}-googleROAS`]:   'rev '+cxK(m.googleRevYear)+' · ROAS '+pr.googleROAS.toFixed(1)+'×',
    [`kv-${side}-metaSpend`]:    cxKd(m.metaSpend),
    [`ks-${side}-metaROAS`]:     'rev '+cxK(m.metaRevYear)+' · ROAS '+pr.metaROAS.toFixed(1)+'×',
    [`kv-${side}-vis`]:          fK(m.totalVis),
    [`ks-${side}-cvr`]:          'CVR '+p2(pr.cvr),
    [`kv-${side}-orders`]:       f(Math.round(m.totalOrders)),
    [`ks-${side}-aov`]:          'AOV '+cxR(pr.aov),
    [`kv-${side}-pno`]:          p(m.pno),
    [`kv-${side}-profit`]:       cxKd(m.netProfit),
  };
  for(const[id,v] of Object.entries(liveIds)){
    const e=document.getElementById(id); if(e) e.textContent=v;
  }
}

function onSlDone(side: string, key: string, val: any) {
  onSl(side, key, val);
  const pr = side==='a' ? paramsA : paramsB;
  const m = compute(pr);
  renderPanel(side, pr, m, side==='a'?'#16A34A':'#EA580C', side==='a'?'35% GROWTH':'70% GROWTH');
  const av = [...document.querySelectorAll('.view.on')].map(v=>v.id.replace('view-',''))[0];
  const mA = compute(paramsA), mB = compute(paramsB);
  if(av==='monthly') renderMonthly(mA, mB, paramsA, paramsB);
  if(av==='compare') renderCompare(paramsA, paramsB, mA, mB);
  histSave();
  lsSave();
}

function onCEOSlDoneWrapped(key: string, val: any) {
  onCEOSlDone(key, val, paramsA, paramsB, ceoSide);
  histSave();
  lsSave();
}

function onCEOSlWrapped(key: string, val: any) {
  onCEOSl(key, val, paramsA, paramsB, ceoSide);
}

// ── Slider done delegation ──
function _sliderDone(e: Event) {
  const tgt = e.target as HTMLElement;
  if(tgt.classList.contains('slrange')) {
    const side = (tgt as any).dataset.side, key = (tgt as any).dataset.key;
    if(side && key) onSlDone(side, key, (tgt as HTMLInputElement).value);
  }
  if((tgt as any).dataset && (tgt as any).dataset.ceokey) {
    onCEOSlDoneWrapped((tgt as any).dataset.ceokey, (tgt as HTMLInputElement).value);
  }
}
document.addEventListener('pointerup', _sliderDone);
document.addEventListener('touchend', _sliderDone);

// ── Editable slider values: click on value → inline input ──
document.addEventListener('click', function(e) {
  const slv = (e.target as HTMLElement).closest('.slv') as HTMLElement;
  if(slv && slv.id && slv.id.startsWith('sv-')) {
    const parts = slv.id.replace('sv-','').split('-');
    const side = parts[0], key = parts.slice(1).join('-');
    const sl = getSl(key);
    if(!sl) return;
    _makeEditable(slv, sl, side, key, 'models');
    return;
  }
  const cv = (e.target as HTMLElement).closest('.ctrl-v') as HTMLElement;
  if(cv && cv.id && cv.id.startsWith('csl-')) {
    const key = cv.id.replace('csl-','');
    const sl = getCEOSliders().find(s=>s.key===key);
    if(!sl) return;
    _makeEditable(cv, sl, ceoSide.value, key, 'ceo');
    return;
  }
});

function _makeEditable(el: HTMLElement, sl: any, side: string, key: string, mode: string) {
  if(el.querySelector('input')) return;
  const pr = side==='a' ? paramsA : paramsB;
  const rawVal = pr[key];
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.value = _rawDisplay(rawVal, sl);
  inp.style.cssText = 'width:110px;text-align:right;font-size:inherit;font-weight:inherit;color:inherit;background:#1e293b;border:1px solid #60a5fa;border-radius:4px;padding:2px 6px;outline:none;box-shadow:0 0 0 2px rgba(96,165,250,.25);';
  el.textContent = '';
  el.appendChild(inp);
  inp.focus();
  inp.select();
  function apply() {
    let v = _parseInput(inp.value, sl);
    if(isNaN(v)) v = rawVal;
    v = Math.round(v / sl.step) * sl.step;
    pr[key] = v;
    el.textContent = sl.fmt(v);
    if(mode==='models') {
      const range = document.querySelector(`input.slrange[data-side="${side}"][data-key="${key}"]`) as HTMLInputElement;
      if(range) range.value = String(v);
      onSlDone(side, key, v);
    } else {
      const range = document.getElementById('csr-'+key) as HTMLInputElement;
      if(range) range.value = String(v);
      onCEOSlDoneWrapped(key, v);
    }
  }
  let applied = false;
  inp.addEventListener('keydown', function(ev) {
    if(ev.key==='Enter') { applied=true; apply(); }
    if(ev.key==='Escape') { applied=true; el.textContent=sl.fmt(rawVal); }
  });
  inp.addEventListener('blur', function() {
    if(!applied) apply();
  });
}

// ── Export menu close on outside click ──
document.addEventListener('click', e => {
  if(!(e.target as HTMLElement).closest('.hactions')) closeExportMenu();
});

// ── Keyboard shortcuts ──
document.addEventListener('keydown', e => {
  if((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); histUndo(); }
  if((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); histRedo(); }
});

// ── Reality change handler ──
function onRealityChangeWrapped(idx: number, rawVal: string) {
  A25.reality2026[idx] = rawVal==='' ? 0 : Math.max(0, parseInt(rawVal, 10) || 0);
  lsSaveReality();
  renderMonthly(compute(paramsA), compute(paramsB), paramsA, paramsB);
}

// ── Expose functions to window for onclick handlers ──
const w = window as any;
w.sv = sv;
w.setCEO = setCEO;
w.tGrp = tGrp;
w.onSl = onSl;
w.onSlDone = onSlDone;
w.onCEOSl = onCEOSlWrapped;
w.onCEOSlDone = onCEOSlDoneWrapped;
w.showExportMenu = showExportMenu;
w.closeExportMenu = closeExportMenu;
w.exportCSV = () => exportCSV(paramsA, paramsB);
w.exportPDF = () => exportPDF(paramsA, paramsB);
w.histUndo = histUndo;
w.histRedo = histRedo;
w.resetParams = resetParams;
w.copyParams = copyParams;
w.toggleChannel = toggleChannel;
w.toggleCost = toggleCost;
w.setCurrency = setCurrency;
w.setLang = setLang;
w.onRealityChange = onRealityChangeWrapped;

// ── Boot ──
lsLoad();
lsLoadReality();
document.getElementById('hdr-rev25')!.textContent = cx(A25.revenue);
document.getElementById('hdr-sub25')!.textContent = (CFG.lang==='en'?'excl. VAT ':'bez DPH ') + cx(REV25_EX) + ' · ' + f(A25.sessions) + ' sessions · CVR ' + p2(A25.cvr) + ' · AOV ' + cxR(A25.aov);
rerender('ceo');

// Save initial state
histSave();
