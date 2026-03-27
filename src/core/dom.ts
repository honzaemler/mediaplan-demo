import { compute } from '../compute';
import { CFG, openGrp } from '../state';
import { A25, REV25_EX } from '../data/defaults';
import { f, p2, cx, cxR } from './format';
import { renderCEO } from '../views/ceo';
import { renderPanel } from '../views/models';
import { renderMonthly } from '../views/monthly';
import { renderCompare } from '../views/compare';
import { renderSettings } from '../views/settings';
import type { Params } from '../types';

// These will be set by main.ts to avoid circular imports
let _paramsA: Params;
let _paramsB: Params;
let _ceoSide: { value: string };

export function domInit(paramsA: Params, paramsB: Params, ceoSide: { value: string }) {
  _paramsA = paramsA;
  _paramsB = paramsB;
  _ceoSide = ceoSide;
}

export function sv(id: string, btn: HTMLElement) {
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('on'));
  document.getElementById('view-'+id)!.classList.add('on');
  btn.classList.add('on');
  rerender(id);
}

export function setCEO(side: string) { _ceoSide.value = side; renderCEO(_paramsA, _paramsB, _ceoSide); }

export function tGrp(side: string, grp: string) {
  openGrp[side] = openGrp[side]===grp ? null : grp;
  const pr = side==='a' ? _paramsA : _paramsB;
  renderPanel(side, pr, compute(pr), side==='a'?'#16A34A':'#EA580C', side==='a'?'35% GROWTH':'70% GROWTH');
}

export function rerender(id: string) {
  const mA = compute(_paramsA), mB = compute(_paramsB);
  if(id==='ceo')      renderCEO(_paramsA, _paramsB, _ceoSide);
  if(id==='models')   {renderPanel('a',_paramsA,mA,'#16A34A','35% GROWTH');renderPanel('b',_paramsB,mB,'#EA580C','70% GROWTH');}
  if(id==='monthly')  renderMonthly(mA,mB,_paramsA,_paramsB);
  if(id==='compare')  renderCompare(_paramsA,_paramsB,mA,mB);
  if(id==='settings') renderSettings();
  // Always refresh header with current currency/lang
  document.getElementById('hdr-rev25')!.textContent = cx(A25.revenue);
  document.getElementById('hdr-sub25')!.textContent =
    (CFG.lang==='en'?'excl. VAT ':'bez DPH ') + cx(REV25_EX) + ' \u00b7 ' + f(A25.sessions) + ' sessions \u00b7 CVR ' + p2(A25.cvr) + ' \u00b7 AOV ' + cxR(A25.aov);
  // Nav buttons
  const isEn = CFG.lang==='en';
  document.getElementById('nav-ceo')!.textContent     = '\ud83d\udc64 CEO Funnel';
  document.getElementById('nav-models')!.textContent   = isEn ? '\u26a1 Models'   : '\u26a1 Modely';
  document.getElementById('nav-monthly')!.textContent  = isEn ? '\ud83d\udcc5 Monthly'  : '\ud83d\udcc5 M\u011bs\u00edce';
  document.getElementById('nav-compare')!.textContent  = isEn ? '\u2696\ufe0f Compare'  : '\u2696\ufe0f Srovn\u00e1n\u00ed';
  document.getElementById('nav-settings')!.textContent = isEn ? '\u2699\ufe0f Settings' : '\u2699\ufe0f Nastaven\u00ed';
  document.getElementById('hdr-desc')!.textContent     = isEn
    ? 'Demo data \u00b7 Channel funnel \u00b7 Seasonal ROAS \u00b7 Scenarios A/B'
    : 'Demo data \u00b7 Funnel po kan\u00e1lech \u00b7 Sez\u00f3nn\u00ed ROAS \u00b7 Sc\u00e9n\u00e1\u0159e A/B';
  // Action buttons - these contain only trusted static text, not user input
  const btnUndo = document.getElementById('btn-undo')!;
  btnUndo.textContent = isEn ? '\u21a9 Undo' : '\u21a9 Zp\u011bt';
  const btnRedo = document.getElementById('btn-redo')!;
  btnRedo.textContent = isEn ? '\u21aa Redo' : '\u21aa Vp\u0159ed';
  document.getElementById('hdr-lbl25')!.textContent = isEn ? '2025 ACTUAL (GA4, incl. VAT)' : '2025 SKUTE\u010cNOST (GA4, s DPH)';
}
