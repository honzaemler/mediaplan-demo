import { CFG, CZK_RATE } from '../state';

export const f  = (v: number) => Math.round(v).toLocaleString('cs-CZ');
export const fK = (v: number) => v>=1000?(v/1000).toFixed(0)+'k':Math.round(v)+'';
export const fKd= (v: number) => (v/1000).toFixed(1)+'k';
export const p  = (v: number) => (v*100).toFixed(1)+'%';
export const p2 = (v: number) => (v*100).toFixed(2)+'%';
export const dp = (v: number) => (v>=0?'+':'')+p(v);
export const pc = (v: number) => v>0.28?'#DC2626':v>0.20?'#D97706':'#16A34A';
export const rc = (v: number) => v>=7?'#16A34A':v>=4?'#D97706':'#DC2626';

// ── Currency-aware formatters ──
export function cur(val: number): string {
  if(CFG.currency === 'CZK') return Math.round(val * CZK_RATE).toLocaleString('cs-CZ') + ' K\u010d';
  return '\u20ac' + Math.round(val).toLocaleString('cs-CZ');
}
export function curSym(): string { return CFG.currency === 'CZK' ? 'K\u010d' : '\u20ac'; }

export function cx(v: number): string { // currency + full number: €123 456 / 3 111 264 Kč
  const val = CFG.currency==='CZK' ? v*CZK_RATE : v;
  return CFG.currency==='CZK' ? f(val)+' K\u010d' : '\u20ac'+f(val);
}
export function cxK(v: number): string { // currency + k-suffix: €450k / 11 340k Kč
  const val = CFG.currency==='CZK' ? v*CZK_RATE : v;
  return CFG.currency==='CZK' ? fK(val)+' K\u010d' : '\u20ac'+fK(val);
}
export function cxKd(v: number): string { // currency + k-decimal: €51.7k / 1 302.8k Kč
  const val = CFG.currency==='CZK' ? v*CZK_RATE : v;
  return CFG.currency==='CZK' ? fKd(val)+' K\u010d' : '\u20ac'+fKd(val);
}
export function cxR(v: number): string { // currency + round: €385 / 9 702 Kč
  const val = CFG.currency==='CZK' ? Math.round(v*CZK_RATE) : Math.round(v);
  return CFG.currency==='CZK' ? f(val)+' K\u010d' : '\u20ac'+val;
}
