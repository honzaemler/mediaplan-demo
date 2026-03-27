import { CFG } from '../state';
import { A25, gAvg, mAvg } from '../data/defaults';
import { t } from '../i18n';
import { cx, cxR, cxK, p, p2 } from './format';
import type { SliderDef, Params } from '../types';

export function getCEOSliders(): SliderDef[] { return [
  {key:'totalRevGoal',min:300000,max:700000,step:5000,  fmt:(v: any)=>cxK(v)},
  {key:'cvr',         min:0.0008,max:0.004, step:0.00005,fmt:(v: any)=>p2(v)},
  {key:'aov',         min:200,   max:600,   step:5,     fmt:(v: any)=>cxR(v)},
  {key:'googleBudget',min:5000,  max:60000, step:500,   fmt:(v: any)=>cxK(v)},
  {key:'metaBudget',  min:1000,  max:20000, step:250,   fmt:(v: any)=>cxK(v)},
  {key:'googleROAS',  min:2,     max:12,    step:0.1,   fmt:(v: any)=>parseFloat(v).toFixed(1)+'\u00d7'},
  {key:'metaROAS',    min:1.5,   max:9,     step:0.1,   fmt:(v: any)=>parseFloat(v).toFixed(1)+'\u00d7'},
]; }

export function getSliders(): SliderDef[] {
  const gOn=CFG.channels.crossnet||CFG.channels.paidsrch, mOn=CFG.channels.paidsoc, dOn=CFG.channels.decathlon;
  return [
  {key:'totalRevGoal', tKey:'revGoal',    min:300000,max:700000,step:5000,  fmt:(v: any)=>cx(v),    grp:'rev', nKey:'withoutDec'},
  {key:'decathlonRev', tKey:'decRev',     min:0,     max:250000,step:5000,  fmt:(v: any)=>cx(v),    grp:'rev', nKey:'addToRev',    show:dOn},
  {key:'marginRate',   tKey:'marginPct',  min:0.14,  max:0.28,  step:0.005, fmt:(v: any)=>p(v),     grp:'rev', note:'2025: '+p(A25.revenue?0.205:0.195)},
  {key:'cvr',          tKey:'cvrLabel',   min:0.0008,max:0.004, step:0.00005,fmt:(v: any)=>p2(v),   grp:'rev', note:'GA4 2025: '+p2(A25.cvr)},
  {key:'aov',          tKey:'aovLabel',   min:200,   max:600,   step:5,     fmt:(v: any)=>cxR(v),   grp:'rev', note:'GA4 2025: '+cxR(A25.aov)},
  {key:'decathlonAov', tKey:'decAov',     min:100,   max:500,   step:5,     fmt:(v: any)=>cxR(v),   grp:'rev', nKey:'diffAovNote', show:dOn},
  {key:'googleBudget', tKey:'googleBudget',min:5000,  max:60000, step:500,  fmt:(v: any)=>cx(v),    grp:'ch',  nKey:'spendToRev',  show:gOn},
  {key:'metaBudget',   tKey:'metaBudget', min:1000,  max:20000, step:250,   fmt:(v: any)=>cx(v),    grp:'ch',  nKey:'spendToRev',  show:mOn},
  {key:'googleROAS',   tKey:'googleROAS', min:2,     max:12,    step:0.1,   fmt:(v: any)=>v.toFixed(1)+'\u00d7', grp:'ch', note:'2025: '+(gAvg).toFixed(1)+'\u00d7', show:gOn},
  {key:'metaROAS',     tKey:'metaROAS',   min:1.5,   max:9,     step:0.1,   fmt:(v: any)=>v.toFixed(1)+'\u00d7', grp:'ch', note:'2025: '+(mAvg).toFixed(1)+'\u00d7', show:mOn},
  {key:'shareOrganic', tKey:'organicShare',min:0.20,  max:0.55,  step:0.01, fmt:(v: any)=>p(v),     grp:'ch',  note:'GA4 2025: '+p(A25.channels.organic.rev/A25.revenue), show:CFG.channels.organic},
  {key:'management',   tKey:'management', min:5000,  max:35000, step:500,   fmt:(v: any)=>cx(v),    grp:'fix', note:'2025: '+cx(A25.management),    show:CFG.costs.management},
  {key:'organic',      tKey:'organicSeo', min:0,     max:18000, step:500,   fmt:(v: any)=>cx(v),    grp:'fix', note:'2025: '+cx(A25.organic),       show:CFG.costs.organic},
  {key:'email',        tKey:'emailNewsl', min:0,     max:6000,  step:100,   fmt:(v: any)=>cx(v),    grp:'fix', note:'2025: '+cx(A25.email),         show:CFG.costs.email},
  {key:'pr',           tKey:'prInflu',    min:0,     max:25000, step:500,   fmt:(v: any)=>cx(v),    grp:'fix', note:'2025: '+cx(A25.pr),            show:CFG.costs.pr},
  {key:'decathlonFee', tKey:'mktpFee',    min:0,     max:10000, step:250,   fmt:(v: any)=>cx(v),    grp:'fix', note:'2025: '+cx(A25.decathlonFee),  show:dOn&&CFG.costs.decathlonFee},
  {key:'other',        tKey:'otherCosts', min:0,     max:5000,  step:100,   fmt:(v: any)=>cx(v),    grp:'fix', note:'2025: '+cx(A25.other),         show:CFG.costs.other},
]; }

// Legacy compat — used by onSl live updates
export function getSl(key: string): SliderDef | undefined { return getSliders().find(s=>s.key===key); }
export function getGroups(): Record<string, {label: string, color: string}> { return {
  rev:{label:t('revenueGroup'),  color:'#f59e0b'},
  ch: {label:t('channelsGroup'), color:'#60a5fa'},
  fix:{label:t('fixedGroup'),    color:'#7C3AED'},
}; }

export function mkSliderHTML(key: string, pr: Params, label: string, minLbl: string, maxLbl: string, color: string, fmt: (v: any) => string): string {
  const sl = getCEOSliders().find(s=>s.key===key);
  if(!sl) return '';
  return `<div class="ctrl-row">
    <div class="ctrl-lbl"><span>${label}</span><span class="ctrl-v" id="csl-${key}" style="color:${color}" title="Klikni pro ru\u010dn\u00ed zad\u00e1n\u00ed">${fmt(pr[key])}</span></div>
    <input type="range" min="${sl.min}" max="${sl.max}" step="${sl.step}" value="${pr[key]}"
      style="accent-color:${color}" id="csr-${key}" oninput="onCEOSl('${key}',this.value)" data-ceokey="${key}">
    <div class="ctrl-ends"><span>${minLbl}</span><span>${maxLbl}</span></div>
  </div>`;
}

export function _rawDisplay(v: number, sl: SliderDef): string {
  // show raw number for editing (strip €, ×, % signs)
  if(sl.step < 0.001) return (v*100).toFixed(2); // percentage like CVR
  if(sl.step < 0.1 && sl.step >= 0.001) return (v*100).toFixed(1); // percentage like shares
  if(sl.fmt(1).includes('\u00d7')) return v.toFixed(1);
  return Math.round(v).toString();
}

export function _parseInput(str: string, sl: SliderDef): number {
  let s = str.trim().replace(/[\u20ac\u00d7%]/g,'');
  // handle k/m/mil suffixes (e.g. "18k", "1.6m", "1,6mil")
  let mult = 1;
  if(/[kK]\s*$/.test(s)) { mult=1000; s=s.replace(/[kK]\s*$/,''); }
  if(/[mM](il)?\s*$/i.test(s)) { mult=1000000; s=s.replace(/[mM](il)?\s*$/i,''); }
  // strip spaces (Czech thousand separator), then normalize comma → dot
  s = s.replace(/\s/g,'').replace(',','.');
  let v = parseFloat(s);
  if(isNaN(v)) return NaN;
  v *= mult;
  // if user entered percentage, convert back
  if(sl.step < 0.001) v = v / 100; // CVR-like
  if(sl.step >= 0.001 && sl.step < 0.1 && sl.fmt(0.5).includes('%')) v = v / 100; // share %
  return v;
}
