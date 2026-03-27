import { compute } from '../compute';
import { CFG } from '../state';
import { A25 } from '../data/defaults';
import { scenLabel, scenFullLabel } from '../data/params';
import { t } from '../i18n';
import { f, fK, fKd, p, p2, dp, pc, cx, cxK, cxKd, cxR } from '../core/format';
import { mkSliderHTML, getCEOSliders } from '../core/slider';
import type { Params } from '../types';

// NOTE: innerHTML usage below is safe - all content is generated from trusted application
// state (numbers, labels, computed values). No user-supplied HTML is injected.

export function renderCEO(paramsA: Params, paramsB: Params, ceoSide: { value: string }) {
  const pr = ceoSide.value==='a' ? paramsA : paramsB;
  const m  = compute(pr);
  const ac = ceoSide.value==='a' ? '#16A34A' : '#EA580C';

  // Funnel steps
  const steps = [
    {icon:'\ud83d\udc65', lbl:t('sessions'), val:fK(m.totalVis),
     sub:t('visPerYear'), vs:dp((m.totalVis-A25.sessions)/A25.sessions)+' vs 2025', c:'#60a5fa'},
    {icon:'\ud83d\udd04', lbl:t('convRatio'), val:p2(pr.cvr),
     sub:'CVR (2025: '+p2(A25.cvr)+')', vs:'', c:'#7C3AED'},
    {icon:'\ud83d\udce6', lbl:t('orders'), val:f(Math.round(m.totalOrders)),
     sub:t('ordersPerYear'), vs:dp((m.totalOrders-A25.orders)/A25.orders)+' vs 2025', c:'#D97706'},
    {icon:'\ud83c\udff7\ufe0f', lbl:t('avgOrderLbl'), val:cxR(pr.aov),
     sub:'AOV (2025: '+cxR(A25.aov)+')', vs:'', c:'#16A34A'},
    {icon:'\ud83d\udcb0', lbl:t('totalRevenue'), val:cxK(m.totalRev),
     sub:'e-shop '+cxK(pr.totalRevGoal)+' + Dec '+cxK(pr.decathlonRev), vs:dp(m.vsActual)+' vs 2025', c:ac},
    {icon:'\ud83d\udcca', lbl:t('profitLbl'), val:cxKd(m.netProfit),
     sub:t('marginMinusCosts'), vs:t('pno')+' '+p(m.pno), c:m.netProfit>=0?'#16A34A':'#DC2626'},
  ];

  let fHtml = '';
  for(let i=0;i<steps.length;i++){
    const s=steps[i];
    fHtml += `<div class="f-step">
      <div class="f-box" style="border-color:${s.c}22">
        <div class="f-icon">${s.icon}</div>
        <div class="f-lbl">${s.lbl}</div>
        <div class="f-val" style="color:${s.c}">${s.val}</div>
        <div class="f-sub">${s.sub}</div>
        <div class="f-vs" style="color:${s.vs?(s.vs.startsWith('+')||s.vs.startsWith('PNO')?s.vs.startsWith('PNO')?pc(m.pno):'#16A34A':'#DC2626'):'transparent'}">${s.vs||'\u00b7'}</div>
      </div>
    </div>`;
    if(i<steps.length-1) fHtml+=`<div class="f-arr">\u2192</div>`;
  }

  // Channel table
  const totalChRev = Object.values(m.chRev).reduce((a,b)=>a+b,0);
  const maxRev = Math.max(...Object.values(m.chRev));

  const chMeta = [
    {k:'organic',  color:'#34A853', label:'Organic Search', spend:pr.organic},
    {k:'crossnet', color:'#4285F4', label:'Google Ads (Cross-network)', spend:m.googleSpend*(m.chRev['crossnet']/(m.chRev['crossnet']+m.chRev['paidsrch']||1))},
    {k:'paidsrch', color:'#34D399', label:'Google Search (Brand kw)', spend:m.googleSpend*(m.chRev['paidsrch']/(m.chRev['crossnet']+m.chRev['paidsrch']||1))},
    {k:'direct',   color:'#78909C', label:'Direct / Brand', spend:0},
    {k:'paidsoc',  color:'#0668E1', label:'Meta Ads', spend:m.metaSpend},
    {k:'unassign', color:'#4B5563', label:'Unassigned', spend:0},
    {k:'referral', color:'#AB47BC', label:'Referral / PR', spend:pr.pr},
    {k:'email',    color:'#FF9800', label:'Email', spend:pr.email},
    {k:'orgsoc',   color:'#F59E0B', label:'Organic Social / SoMe', spend:0},
    {k:'decathlon',color:'#0082C3', label:'Decathlon Marketplace', spend:pr.decathlonFee},
  ];

  let tRows = '';
  for(const ch of chMeta){
    if(!CFG.channels[ch.k]) continue;
    const rev   = m.chRev[ch.k] || (ch.k==='decathlon'?pr.decathlonRev:0);
    const isDec  = ch.k==='decathlon';
    const vis   = isDec ? 0 : (m.chVis[ch.k] || rev/(pr.cvr*pr.aov));
    const pct   = rev/totalChRev;
    const barW  = Math.round(rev/maxRev*100);
    const pno2  = ch.spend&&rev ? ch.spend/rev : null;
    const a25ch = A25.channels[ch.k];
    const a25Rev= isDec ? A25.decathlonRev : (a25ch?a25ch.rev:0);
    const a25Pct= a25Rev/A25.revenue;
    tRows += `<tr>
      <td><span class="dot" style="background:${ch.color}"></span>${ch.label}</td>
      <td style="font-weight:600">${cx(rev)}</td>
      <td class="bar-cell"><div class="bar-w"><div class="bar-f" style="width:${barW}%;background:${ch.color}99"></div></div></td>
      <td>${p(pct)}</td>
      <td style="color:#6B7280">${p(a25Pct)}</td>
      <td>${isDec ? '\u2014' : fK(vis)}</td>
      <td>${isDec ? '\u2014' : p2(pr.cvr)}</td>
      <td style="color:${pno2?pc(pno2):'#6B7280'}">${pno2?p(pno2):'\u2014'}</td>
      <td>${ch.spend?cx(ch.spend):'\u2014'}</td>
    </tr>`;
  }

  const el = document.getElementById('ceo-c')!;
  el.innerHTML = `
<div class="ceo-wrap">
  <div>
    <div class="ctrl-box">
      <div class="ctrl-head">${t('scenario')}</div>
      <div class="sc-btns">
        <button class="sc-btn${ceoSide.value==='a'?' on':''}" style="${ceoSide.value==='a'?'color:#16A34A;border-color:#16A34A;background:#DCFCE7':''}" onclick="setCEO('a')">A \u00b7 ${scenLabel(paramsA)}</button>
        <button class="sc-btn${ceoSide.value==='b'?' on':''}" style="${ceoSide.value==='b'?'color:#EA580C;border-color:#EA580C;background:#FFF7ED':''}" onclick="setCEO('b')">B \u00b7 ${scenLabel(paramsB)}</button>
      </div>
      <div class="ctrl-head">${t('keyParams')}</div>
      ${mkSliderHTML('totalRevGoal',pr,t('revGoal'),cxK(300000),cxK(700000),ac,v=>cxK(v))}
      ${mkSliderHTML('cvr',pr,t('convRate'),'0.08 %','0.40 %','#a78bfa',v=>p2(v))}
      ${mkSliderHTML('aov',pr,t('avgOrder'),cxR(200),cxR(600),'#fbbf24',v=>cxR(v))}
      ${mkSliderHTML('googleBudget',pr,t('googleBudget'),cxK(5000),cxK(60000),'#4285F4',v=>cxK(v))}
      ${mkSliderHTML('metaBudget',pr,t('metaBudget'),cxK(1000),cxK(20000),'#0668E1',v=>cxK(v))}
      ${mkSliderHTML('googleROAS',pr,t('googleROAS'),'2\u00d7','12\u00d7','#4285F4',v=>parseFloat(v).toFixed(1)+'\u00d7')}
      ${mkSliderHTML('metaROAS',pr,t('metaROAS'),'1.5\u00d7','9\u00d7','#0668E1',v=>parseFloat(v).toFixed(1)+'\u00d7')}
    </div>
    <div class="sum-strip">
      <div class="sk" id="ceo-gspend"><div class="sk-l">${t('googleSpend')}</div><div class="sk-v" style="color:#4285F4">${cxK(m.googleSpend)}</div><div class="sk-s">rev ${cxK(m.googleRevYear)} \u00b7 ROAS ${pr.googleROAS.toFixed(1)}\u00d7</div></div>
      <div class="sk" id="ceo-mspend"><div class="sk-l">${t('metaSpend')}</div><div class="sk-v" style="color:#0668E1">${cxK(m.metaSpend)}</div><div class="sk-s">rev ${cxK(m.metaRevYear)} \u00b7 ROAS ${pr.metaROAS.toFixed(1)}\u00d7</div></div>
      <div class="sk" id="ceo-cost"><div class="sk-l">${t('totalCost')}</div><div class="sk-v">${cxK(m.totalCost)}</div><div class="sk-s">${p(m.pno)} ${t('ofRev')}</div></div>
      <div class="sk" id="ceo-pno"><div class="sk-l">${t('pno')}</div><div class="sk-v" style="color:${pc(m.pno)}">${p(m.pno)}</div><div class="sk-s">${t('target')} &lt;20 %</div></div>
      <div class="sk" id="ceo-profit"><div class="sk-l">${t('netProfit')}</div><div class="sk-v" style="color:${m.netProfit>=0?'#16A34A':'#DC2626'}">${cxKd(m.netProfit)}</div><div class="sk-s">${t('marginMinusCosts')}</div></div>
      <div class="sk" id="ceo-vis"><div class="sk-l">${t('visitorsYear')}</div><div class="sk-v" style="color:#60a5fa">${fK(m.totalVis)}</div><div class="sk-s">${f(Math.round(m.totalOrders))} ${t('orders').toLowerCase()}</div></div>
    </div>
  </div>
  <div>
    <div class="funnel-box">
      <div class="f-title">${t('fullFunnel')} \u00b7 ${scenFullLabel(pr, ceoSide.value==='a'?'A':'B')}</div>
      <div class="funnel">${fHtml}</div>
    </div>
    <div class="ch-box">
      <div class="sec">${t('channelTable')}</div>
      <div style="overflow-x:auto">
        <table>
          <thead><tr>
            <th>${t('channel')}</th>
            <th>${t('revenue')} ${scenLabel(pr)}</th>
            <th style="min-width:80px"></th>
            <th>${t('pctTotal')}</th>
            <th style="color:#6b7280">2025 %</th>
            <th>Sessions</th>
            <th>CVR</th>
            <th>${t('pno')}</th>
            <th>${t('spend')}</th>
          </tr></thead>
          <tbody>${tRows}</tbody>
        </table>
      </div>
      <div class="note-box">
        <strong>${t('source')}</strong> \u00b7 Organic Search ${fK(A25.channels.organic.sessions)} sessions / ${cxK(A25.channels.organic.rev)} rev \u00b7
        Google Ads ${fK(A25.channels.paidsrch.sessions)} PaidSearch + ${fK(A25.channels.crossnet.sessions)} CrossNet \u00b7 Meta ${fK(A25.channels.paidsoc.sessions)} sessions GA4 \u00b7
        Direct ${fK(A25.channels.direct.sessions)} sessions / ${cxK(A25.channels.direct.rev)} \u00b7 Email CVR ${p2(A25.channels.email.cvr)} = ${t('bestConvChannel')}
      </div>
    </div>
  </div>
</div>`;

  attachCEOSliders(pr);
}

function attachCEOSliders(_pr: Params) {
  // handled via oninput already
}

export function onCEOSl(key: string, val: any, paramsA: Params, paramsB: Params, ceoSide: { value: string }) {
  const pr = ceoSide.value==='a' ? paramsA : paramsB;
  pr[key] = parseFloat(val);
  const sl = getCEOSliders().find(s=>s.key===key);
  const el = document.getElementById('csl-'+key);
  if(el && sl) el.textContent = sl.fmt(pr[key]);
  const m = compute(pr);
  const upd: Record<string, [string, string]> = {
    'ceo-gspend': [cxK(m.googleSpend), 'rev '+cxK(m.googleRevYear)+' \u00b7 ROAS '+pr.googleROAS.toFixed(1)+'\u00d7'],
    'ceo-mspend': [cxK(m.metaSpend),   'rev '+cxK(m.metaRevYear)+' \u00b7 ROAS '+pr.metaROAS.toFixed(1)+'\u00d7'],
    'ceo-cost':   [cxK(m.totalCost),   p(m.pno)+' '+t('ofRev')],
    'ceo-pno':    [p(m.pno),           t('target')+' <20 %'],
    'ceo-profit': [cxKd(m.netProfit),  t('marginMinusCosts')],
    'ceo-vis':    [fK(m.totalVis),     f(Math.round(m.totalOrders))+' '+t('orders').toLowerCase()],
  };
  for(const [id,[v,s]] of Object.entries(upd)){
    const el2=document.getElementById(id); if(!el2) continue;
    el2.querySelector('.sk-v')!.textContent=v;
    el2.querySelector('.sk-s')!.textContent=s;
  }
}

export function onCEOSlDone(key: string, val: any, paramsA: Params, paramsB: Params, ceoSide: { value: string }) {
  onCEOSl(key, val, paramsA, paramsB, ceoSide);
  renderCEO(paramsA, paramsB, ceoSide);
}
