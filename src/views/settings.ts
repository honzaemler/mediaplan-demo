import { CFG, LABELS, cfgSave } from '../state';
import { CH_KEYS } from '../data/defaults';
import { compute } from '../compute';
import { renderCEO } from './ceo';
import { renderPanel } from './models';
import { renderMonthly } from './monthly';
import { renderCompare } from './compare';
import { f, p2, cx, cxR } from '../core/format';
import { A25, REV25_EX } from '../data/defaults';
import type { Params } from '../types';

// These will be set by main.ts
let _paramsA: Params;
let _paramsB: Params;
let _ceoSide: { value: string };

export function settingsInit(paramsA: Params, paramsB: Params, ceoSide: { value: string }) {
  _paramsA = paramsA;
  _paramsB = paramsB;
  _ceoSide = ceoSide;
}

// NOTE: innerHTML usage below is safe - all content is generated from trusted application state.

export function renderSettings() {
  const ll = LABELS[CFG.lang];
  function mkToggle(checked: boolean, onclk: string) {
    return '<label class="set-toggle"><input type="checkbox" '+(checked?'checked':'')+' onchange="'+onclk+'"><span class="slider"></span></label>';
  }
  function mkRadio(opts: Array<{val:string,label:string}>, current: string, fn: string) {
    return '<div class="set-radio-group">' + opts.map(function(o){
      return '<button class="set-radio '+(o.val===current?'active':'')+'" onclick="'+fn+"('"+o.val+"')"+'">' + o.label + '</button>';
    }).join('') + '</div>';
  }

  var chRows = '';
  var chKeys = (CH_KEYS as string[]).concat(['decathlon']);
  for(var i=0;i<chKeys.length;i++) {
    var k = chKeys[i];
    chRows += '<div class="set-row"><span class="set-label">'+ll.chLabels[k]+'</span>'+mkToggle(CFG.channels[k], "toggleChannel('"+k+"')")+'</div>';
  }

  var costRows = '';
  var costKeys = Object.keys(CFG.costs);
  for(var j=0;j<costKeys.length;j++) {
    var ck = costKeys[j];
    costRows += '<div class="set-row"><span class="set-label">'+ll.costLabels[ck]+'</span>'+mkToggle(CFG.costs[ck], "toggleCost('"+ck+"')")+'</div>';
  }

  var el = document.getElementById('settings-c')!;
  el.innerHTML = [
    '<div class="sec">'+ll.settingsTitle+'</div>',
    '<div class="set-grid">',
    '<div class="set-section"><h3>📡 '+ll.channelsTitle+'</h3><div class="set-desc">'+ll.channelsDesc+'</div>'+chRows+'</div>',
    '<div class="set-section"><h3>💰 '+ll.costsTitle+'</h3><div class="set-desc">'+ll.costsDesc+'</div>'+costRows+'</div>',
    '<div class="set-section"><h3>💱 '+ll.currencyTitle+'</h3><div class="set-desc">'+ll.currencyDesc+'</div><div class="set-row">',
    mkRadio([{val:'EUR',label:'EUR (€)'},{val:'CZK',label:'CZK (Kč)'}], CFG.currency, 'setCurrency'),
    '</div></div>',
    '<div class="set-section"><h3>🌐 '+ll.langTitle+'</h3><div class="set-desc">'+ll.langDesc+'</div><div class="set-row">',
    mkRadio([{val:'cs',label:'Čeština'},{val:'en',label:'English'}], CFG.lang, 'setLang'),
    '</div></div>',
    '</div>'
  ].join('');
}

export function _rerenderAll() {
  renderSettings();
  const mA=compute(_paramsA),mB=compute(_paramsB);
  renderCEO(_paramsA, _paramsB, _ceoSide);
  renderPanel('a',_paramsA,mA,'#16A34A','35% GROWTH');
  renderPanel('b',_paramsB,mB,'#EA580C','70% GROWTH');
  renderMonthly(mA,mB,_paramsA,_paramsB);
  renderCompare(_paramsA,_paramsB,mA,mB);
  document.getElementById('hdr-rev25')!.textContent = cx(A25.revenue);
  document.getElementById('hdr-sub25')!.textContent =
    (CFG.lang==='en'?'excl. VAT ':'bez DPH ') + cx(REV25_EX) + ' · ' + f(A25.sessions) + ' sessions · CVR ' + p2(A25.cvr) + ' · AOV ' + cxR(A25.aov);
  const isEn = CFG.lang==='en';
  document.getElementById('nav-ceo')!.textContent     = '👤 CEO Funnel';
  document.getElementById('nav-models')!.textContent   = isEn ? '⚡ Models'   : '⚡ Modely';
  document.getElementById('nav-monthly')!.textContent  = isEn ? '📅 Monthly'  : '📅 Měsíce';
  document.getElementById('nav-compare')!.textContent  = isEn ? '⚖️ Compare'  : '⚖️ Srovnání';
  document.getElementById('nav-settings')!.textContent = isEn ? '⚙️ Settings' : '⚙️ Nastavení';
  document.getElementById('hdr-desc')!.textContent     = isEn
    ? 'Demo data · Channel funnel · Seasonal ROAS · Scenarios A/B'
    : 'Demo data · Funnel po kanálech · Sezónní ROAS · Scénáře A/B';
  document.getElementById('btn-undo')!.textContent = isEn ? '↩ Undo' : '↩ Zpět';
  document.getElementById('btn-redo')!.textContent = isEn ? '↪ Redo' : '↪ Vpřed';
  document.getElementById('hdr-lbl25')!.textContent = isEn ? '2025 ACTUAL (GA4, incl. VAT)' : '2025 SKUTEČNOST (GA4, s DPH)';
}

export function toggleChannel(k: string) { CFG.channels[k] = !CFG.channels[k]; cfgSave(); _rerenderAll(); }
export function toggleCost(k: string) { CFG.costs[k] = !CFG.costs[k]; cfgSave(); _rerenderAll(); }
export function setCurrency(v: string) { CFG.currency = v; cfgSave(); _rerenderAll(); }
export function setLang(v: string) { CFG.lang = v; cfgSave(); _rerenderAll(); }
