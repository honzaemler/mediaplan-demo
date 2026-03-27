import { CFG } from '../state';
import { A25 } from '../data/defaults';
import { scenLabel } from '../data/params';
import { t, mName } from '../i18n';
import { f, fK, fKd, p, p2, dp, pc, cx, cxK, cxKd, cxR } from '../core/format';
import type { Params, ComputeResult } from '../types';

// NOTE: innerHTML usage below is safe - all content is generated from trusted application state.

export function renderCompare(pA: Params, pB: Params, mA: ComputeResult, mB: ComputeResult) {
  const ef  = (v: number) => Math.round(v).toLocaleString('cs-CZ');
  const epct= (v: number) => (v*100).toFixed(1) + ' %';
  const gOn=CFG.channels.crossnet||CFG.channels.paidsrch, mOn=CFG.channels.paidsoc, dOn=CFG.channels.decathlon;
  const rows: any[]=[
    {l:t('totalRev'),     a:mA.totalRev,b:mB.totalRev,fmt:(v: number)=>cx(v),diff:true,bold:true,aC:'#16A34A',bC:'#EA580C'},
    {l:t('eshopRev'),     a:pA.totalRevGoal,b:pB.totalRevGoal,fmt:(v: number)=>cx(v)},
    {l:t('decathlonRev'), a:pA.decathlonRev,b:pB.decathlonRev,fmt:(v: number)=>cx(v),show:dOn},
    {l:t('vs2025'),       a:mA.vsActual,    b:mB.vsActual,    fmt:(v: number)=>dp(v)},
    {l:t('visitorsYear'), a:mA.totalVis,    b:mB.totalVis,    fmt:(v: number)=>fK(v),diff:true},
    {l:t('cvr'),          a:pA.cvr,         b:pB.cvr,         fmt:(v: number)=>p2(v)},
    {l:t('orders'),       a:mA.totalOrders, b:mB.totalOrders, fmt:(v: number)=>f(Math.round(v)),diff:true},
    {l:t('aov'),          a:pA.aov,         b:pB.aov,         fmt:(v: number)=>cxR(v)},
    {sep:true},
    {l:t('googleSpend'),  a:mA.googleSpend, b:mB.googleSpend, fmt:(v: number)=>cx(v),diff:true,show:gOn},
    {l:t('googleROAS'),   a:pA.googleROAS,  b:pB.googleROAS,  fmt:(v: number)=>v.toFixed(1)+'×',show:gOn},
    {l:t('metaSpend'),    a:mA.metaSpend,   b:mB.metaSpend,   fmt:(v: number)=>cx(v),diff:true,show:mOn},
    {l:t('metaROAS'),     a:pA.metaROAS,    b:pB.metaROAS,    fmt:(v: number)=>v.toFixed(1)+'×',show:mOn},
    {l:t('paidSpend'),    a:mA.paidSpend,   b:mB.paidSpend,   fmt:(v: number)=>cx(v),diff:true,show:gOn||mOn},
    {l:t('fixedCosts'),   a:mA.fixedCosts,  b:mB.fixedCosts,  fmt:(v: number)=>cx(v)},
    {l:t('costTotal'),    a:mA.totalCost,   b:mB.totalCost,   fmt:(v: number)=>cx(v),bold:true},
    {sep:true},
    {l:t('grossMargin'),  a:mA.grossMargin, b:mB.grossMargin, fmt:(v: number)=>cx(v)},
    {l:t('netProfit'),    a:mA.netProfit,   b:mB.netProfit,   fmt:(v: number)=>cx(v),bold:true,
      aC:mA.netProfit>=0?'#16A34A':'#DC2626',bC:mB.netProfit>=0?'#16A34A':'#DC2626'},
    {l:t('pno'),          a:mA.pno,         b:mB.pno,         fmt:p,aC:pc(mA.pno),bC:pc(mB.pno)},
  ];
  let tRows='';
  for(const r of rows){
    if(r.show===false) continue;
    if(r.sep){tRows+=`<tr><td colspan="4" style="color:var(--border-strong);font-size:7px;padding:1px 8px">──────────────────────────</td></tr>`;continue;}
    const delta=r.diff?`<span style="color:${(r.b-r.a)>=0?'#16A34A':'#DC2626'}">${dp((r.b-r.a)/Math.abs(r.a||1))}</span>`:'—';
    tRows+=`<tr><td style="color:var(--text-muted);font-weight:${r.bold?600:400}">${r.l}</td><td style="color:${r.aC||'var(--text)'};font-weight:${r.bold?600:400}">${r.fmt(r.a)}</td><td style="color:${r.bC||'var(--text)'};font-weight:${r.bold?600:400}">${r.fmt(r.b)}</td><td>${delta}</td></tr>`;
  }
  const minis=[
    {l:t('netProfit'),   a:mA.netProfit,   b:mB.netProfit,   fmt:(v: number)=>cxKd(v),max:Math.max(Math.abs(mA.netProfit),Math.abs(mB.netProfit))*1.2||1,aC:'#16A34A',bC:'#EA580C'},
    {l:t('pno'),         a:mA.pno,         b:mB.pno,         fmt:p,max:.35,aC:'#16A34A',bC:'#EA580C'},
    {l:t('googleSpend'), a:mA.googleSpend, b:mB.googleSpend, fmt:(v: number)=>cxKd(v),max:Math.max(mA.googleSpend,mB.googleSpend)*1.2,aC:'#4285F4',bC:'#EA580C'},
    {l:'Visitors',       a:mA.totalVis,    b:mB.totalVis,    fmt:(v: number)=>fK(v),max:Math.max(mA.totalVis,mB.totalVis)*1.2,aC:'#4285F4',bC:'#EA580C'},
  ];
  let miniHtml='';
  for(const mc of minis){
    const hA=Math.abs(mc.a)/mc.max*38,hB=Math.abs(mc.b)/mc.max*38;
    miniHtml+=`<div class="mc"><div class="ctitle">${mc.l}</div><div class="mbars">
      <div class="mbw"><div class="mbt"><div class="mbf" style="height:${hA}px;background:${mc.aC}33;border:1px solid ${mc.aC}"></div></div><div class="mbv" style="color:${mc.aC}">${mc.fmt(mc.a)}</div><div class="mbl">${CFG.lang==='en'?'Sc.':'Scén.'} A</div></div>
      <div class="mbw"><div class="mbt"><div class="mbf" style="height:${hB}px;background:${mc.bC}33;border:1px solid ${mc.bC}"></div></div><div class="mbv" style="color:${mc.bC}">${mc.fmt(mc.b)}</div><div class="mbl">${CFG.lang==='en'?'Sc.':'Scén.'} B</div></div>
    </div></div>`;
  }
  document.getElementById('compare-c')!.innerHTML=`
<div class="cmp-grid">
  <div>
    <div class="sec">${t('compareTitle')}</div>
    <div class="card"><table><thead><tr><th>${t('metric')}</th><th style="color:#16A34A">A · ${scenLabel(pA)}</th><th style="color:#EA580C">B · ${scenLabel(pB)}</th><th>Δ B vs A</th></tr></thead><tbody>${tRows}</tbody></table></div>
    <div class="mg4">${miniHtml}</div>
  </div>
  <div>
    <div class="sec">${t('ref2025')}</div>
    <div class="card">
      <div class="rr"><span class="rl">Revenue (GA4)</span><span class="rv">${cx(A25.revenue)}</span></div>
      <div class="rr"><span class="rl">Sessions</span><span class="rv">${ef(A25.sessions)}</span></div>
      <div class="rr"><span class="rl">CVR (GA4)</span><span class="rv">${epct(A25.cvr)}</span></div>
      <div class="rr"><span class="rl">Orders (GA4)</span><span class="rv">${ef(A25.orders)}</span></div>
      <div class="rr"><span class="rl">AOV (GA4)</span><span class="rv">${cxR(A25.aov)}</span></div>
      <div class="rr"><span class="rl">Organic Search sessions</span><span class="rv">${ef(A25.channels.organic.sessions)} (${epct(A25.channels.organic.sessions/A25.sessions)})</span></div>
      <div class="rr"><span class="rl">Organic Search revenue</span><span class="rv">${cx(A25.channels.organic.rev)} (${epct(A25.channels.organic.rev/A25.revenue)})</span></div>
      <div class="rr"><span class="rl">Direct revenue</span><span class="rv">${cx(A25.channels.direct.rev)} (${epct(A25.channels.direct.rev/A25.revenue)})</span></div>
      <div class="rr"><span class="rl">CrossNet (Google Ads)</span><span class="rv">${cx(A25.channels.crossnet.rev)} (${epct(A25.channels.crossnet.rev/A25.revenue)})</span></div>
      <div class="rr"><span class="rl">Paid Search (Brand)</span><span class="rv">${cx(A25.channels.paidsrch.rev)} (${epct(A25.channels.paidsrch.rev/A25.revenue)})</span></div>
      <div class="rr"><span class="rl">Meta (GA4 Paid Social)</span><span class="rv">${cx(A25.channels.paidsoc.rev)} (${epct(A25.channels.paidsoc.rev/A25.revenue)})*</span></div>
      <div class="rr"><span class="rl">${t('googleSpend')}</span><span class="rv">${cx(A25.channels.crossnet.spend)}</span></div>
      <div class="rr"><span class="rl">${t('metaSpend')}</span><span class="rv">${cx(A25.channels.paidsoc.spend)}</span></div>
      <div class="rr"><span class="rl">Google ROAS (ads dashboard)</span><span class="rv">${(A25.channels.crossnet.rev/A25.channels.crossnet.spend).toFixed(2)}×</span></div>
      <div class="rr"><span class="rl">Meta ROAS (Meta dashboard)</span><span class="rv">${(A25.channels.paidsoc.rev/A25.channels.paidsoc.spend).toFixed(2)}×</span></div>
      <div class="rnote">* Meta GA4 vs Meta dashboard: ${CFG.lang==='en'?'GA4 shows last-click, Meta dashboard post-view+click (7d). Reality is in between.':'GA4 ukazuje last-click, Meta dashboard post-view+click (7d). Skutečnost leží mezi.'}
        <br>📅 Reality 2026: ${mName(0)} ${cx(A25.reality2026[0])} · ${mName(1)} ${cx(A25.reality2026[1])}</div>
    </div>
  </div>
</div>`;
}
