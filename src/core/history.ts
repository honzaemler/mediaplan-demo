import { PARAM_KEYS } from '../data/params';
import type { Params } from '../types';

export const HIST_MAX = 50;
export let histStack: Array<{pA: Record<string, any>, pB: Record<string, any>}> = [];
export let histIdx = -1;
export let _histPaused = false;

// These will be set by main.ts to avoid circular imports
let _paramsA: Params;
let _paramsB: Params;
let _lsSave: () => void;
let _rerender: (id: string) => void;

export function histInit(paramsA: Params, paramsB: Params, lsSave: () => void, rerender: (id: string) => void) {
  _paramsA = paramsA;
  _paramsB = paramsB;
  _lsSave = lsSave;
  _rerender = rerender;
}

export function snapParams(p: Params): Record<string, any> {
  // hluboká kopie jen skalárních klíčů (žádné vnořené objekty)
  const o: Record<string, any> = {};
  for(const k of PARAM_KEYS) o[k] = p[k];
  return o;
}

export function histSave() {
  if(_histPaused) return;
  const snap = {pA: snapParams(_paramsA), pB: snapParams(_paramsB)};
  // zahoď redo větev
  histStack = histStack.slice(0, histIdx + 1);
  histStack.push(snap);
  if(histStack.length > HIST_MAX) histStack.shift();
  histIdx = histStack.length - 1;
  histUpdateBtns();
}

export function histApply(snap: {pA: Record<string, any>, pB: Record<string, any>}) {
  _histPaused = true;
  Object.assign(_paramsA, snap.pA);
  Object.assign(_paramsB, snap.pB);
  _histPaused = false;
  _lsSave();
  const av = [...document.querySelectorAll('.view.on')].map(v=>v.id.replace('view-',''))[0] || 'ceo';
  _rerender(av);
  histUpdateBtns();
}

export function histUndo() {
  if(histIdx <= 0) return;
  histIdx--;
  histApply(histStack[histIdx]);
}

export function histRedo() {
  if(histIdx >= histStack.length - 1) return;
  histIdx++;
  histApply(histStack[histIdx]);
}

export function histUpdateBtns() {
  const u = document.getElementById('btn-undo');
  const r = document.getElementById('btn-redo');
  if(u) (u as HTMLButtonElement).disabled = histIdx <= 0;
  if(r) (r as HTMLButtonElement).disabled = histIdx >= histStack.length - 1;
}
