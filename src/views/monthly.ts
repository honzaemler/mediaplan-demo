import { CFG } from '../state';
import { A25, NOW_MONTH } from '../data/defaults';
import { scenLabel } from '../data/params';
import { t, mName, mNameF } from '../i18n';
import { f, p, p2, dp, pc, rc, cx, cxK } from '../core/format';
import type { Params, ComputeResult } from '../types';

// NOTE: innerHTML usage below is safe - all content is generated from trusted application state.

function renderBarLineOverlay(mA: ComputeResult, mB: ComputeResult): string {
  const SVG_W=1200, SVG_H=120, COL_W=SVG_W/12, BAR_H_MAX=86, BASE_Y=SVG_H-2;
  const maxR=Math.max(...mA.months.map(m=>m.tot),...mB.months.map(m=>m.tot),...A25.monthlyRev,...A25.reality2026);
  const yOf=(val: number)=>BASE_Y-(val/maxR*BAR_H_MAX);
  const xOf=(i: number)=>(i+0.5)*COL_W;
  function smooth(pts: Array<{x:number,y:number}>){
    if(pts.length<2) return '';
    let d=`M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for(let i=1;i<pts.length;i++){
      const pp=pts[i-1],c=pts[i],cx2=(pp.x+c.x)/2;
      d+=` C ${cx2.toFixed(1)},${pp.y.toFixed(1)} ${cx2.toFixed(1)},${c.y.toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`;
    }
    return d;
  }
  const ptsA=mA.months.map((m,i)=>({x:xOf(i),y:yOf(m.tot)}));
  const ptsR=A25.reality2026.map((v,i)=>v>0?{x:xOf(i),y:yOf(v)}:null).filter(Boolean) as Array<{x:number,y:number}>;
  const dots=(pts: Array<{x:number,y:number}>,col: string,r=5)=>pts.map(pt=>`<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${r}" fill="${col}" stroke="white" stroke-width="2.5"/>`).join('');
  const dA=smooth(ptsA), dR=smooth(ptsR);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_W} ${SVG_H}" preserveAspectRatio="none"
    style="position:absolute;top:0;left:0;width:100%;height:${SVG_H}px;pointer-events:none;overflow:visible">
    ${dA?`<path d="${dA}" fill="none" stroke="#16A34A" stroke-width="3" stroke-linejoin="round"/>`:''}
    ${dots(ptsA,'#16A34A')}
    ${dR?`<path d="${dR}" fill="none" stroke="#7C3AED" stroke-width="3" stroke-dasharray="8,5" stroke-linejoin="round"/>`:''}
    ${ptsR.length?dots(ptsR,'#7C3AED'):''}
  </svg>`;
}

function renderRealityPanel(mA: ComputeResult): string {
  const ytdReal=A25.reality2026.reduce((s,v)=>s+v,0);
  const monthsWithData=A25.reality2026.filter(v=>v>0).length;
  const ytdPlanA=mA.months.reduce((s,m,i)=>A25.reality2026[i]>0?s+m.tot:s,0);
  const ytdDiff=monthsWithData>0?(ytdReal-ytdPlanA)/(ytdPlanA||1):null;
  let cells='';
  for(let i=0;i<12;i++){
    const val=A25.reality2026[i],isFuture=i>NOW_MONTH,hasVal=val>0;
    cells+=`<div class="rt-cell"><div class="rt-lbl">${mName(i)}</div>
      <input type="number" class="rt-inp${isFuture?' future':''}${hasVal?' has-val':''}"
        value="${hasVal?val:''}" placeholder="${isFuture?'—':'0'}" min="0" step="100"
        data-rtidx="${i}" onchange="onRealityChange(${i},this.value)"
        title="${mNameF(i)} · Reality 2026"></div>`;
  }
  const ytdHtml=monthsWithData>0
    ?`YTD: <strong>${cx(ytdReal)}</strong> &nbsp;|&nbsp; vs ${t('scenarioA')}: <strong style="color:${ytdDiff!==null&&ytdDiff>=0?'#16A34A':'#DC2626'}">${ytdDiff!==null?dp(ytdDiff):''}</strong>`
    :t('noData');
  return `<div class="rtpanel"><div class="rtpanel-head">
    <div class="rtpanel-title">📊 ${t('realityTracker')}</div>
    <div class="rtpanel-kpis">${ytdHtml}</div></div>
    <div class="rt-grid">${cells}</div></div>`;
}

export function onRealityChange(idx: number, rawVal: string, lsSaveReality: () => void, computeFn: (p: Params) => ComputeResult, paramsA: Params, paramsB: Params) {
  A25.reality2026[idx]=rawVal===''?0:Math.max(0,parseInt(rawVal,10)||0);
  lsSaveReality();
  renderMonthly(computeFn(paramsA),computeFn(paramsB),paramsA,paramsB);
}

export function renderMonthly(mA: ComputeResult, mB: ComputeResult, paramsA: Params, paramsB: Params) {
  const maxR=Math.max(...mA.months.map(m=>m.tot),...mB.months.map(m=>m.tot),...A25.monthlyRev,...A25.reality2026);
  let cols='';
  for(let i=0;i<12;i++){
    const hAct=A25.monthlyRev[i]/maxR*86,hA=mA.months[i].tot/maxR*86,hB=mB.months[i].tot/maxR*86;
    const real=A25.reality2026[i];
    cols+=`<div class="cc"><div class="cbs">
      <div class="cb" style="width:22%;height:${hAct}px;background:#D1D5DB" title="2025: ${cx(A25.monthlyRev[i])}"></div>
      <div class="cb" style="width:22%;height:${hA}px;background:#DCFCE7;border:1px solid #16A34A" title="A: ${cx(mA.months[i].tot)}"></div>
      <div class="cb" style="width:22%;height:${hB}px;background:#FED7AA;border:1px solid #EA580C" title="B: ${cx(mB.months[i].tot)}"></div>
      ${real?`<div class="cb" style="width:22%;height:${real/maxR*86}px;background:#EDE9FE;border:1px solid #7C3AED" title="Reality: ${cx(real)}"></div>`:'<div style="width:22%"></div>'}
    </div><div class="cl">${mName(i)}</div></div>`;
  }

  const _gOn=CFG.channels.crossnet||CFG.channels.paidsrch, _mOn=CFG.channels.paidsoc;
  let tRows='';
  for(let i=0;i<12;i++){
    const a=mA.months[i],b=mB.months[i];
    const real=A25.reality2026[i];
    const planA=mA.months[i].tot;
    const diff=real?(real-planA)/planA:null;
    tRows+=`<tr>
      <td style="font-weight:600">${mNameF(i)}</td>
      <td style="color:#6B7280">${cx(A25.monthlyRev[i])}</td>
      ${real?`<td style="color:#7C3AED;font-weight:600">${cx(real)}</td><td style="color:${diff!==null&&diff>=0?'#16A34A':'#DC2626'}">${diff!==null?dp(diff):''}</td>`:`<td style="color:#D1D5DB">—</td><td></td>`}
      <td style="color:#16A34A;font-weight:600">${cx(a.tot)}</td>
      ${_gOn?`<td>${cx(a.google)}</td>`:''}${_mOn?`<td>${cx(a.meta)}</td>`:''}
      ${_gOn?`<td style="color:${rc(a.gROAS)}">${a.gROAS.toFixed(1)}×</td>`:''}${_mOn?`<td style="color:${rc(a.mROAS)}">${a.mROAS.toFixed(1)}×</td>`:''}
      <td style="color:${pc(a.pno)}">${p(a.pno)}</td>
      <td style="color:#EA580C;font-weight:600">${cx(b.tot)}</td>
      ${_gOn?`<td>${cx(b.google)}</td>`:''}${_mOn?`<td>${cx(b.meta)}</td>`:''}
      <td style="color:${pc(b.pno)}">${p(b.pno)}</td>
    </tr>`;
  }
  const sA=mA.months.reduce((s,m)=>({t:s.t+m.tot,g:s.g+m.google,m:s.m+m.meta}),{t:0,g:0,m:0});
  const sB=mB.months.reduce((s,m)=>({t:s.t+m.tot,g:s.g+m.google,m:s.m+m.meta}),{t:0,g:0,m:0});

  document.getElementById('monthly-c')!.innerHTML=`
<div class="sec">${t('monthlyBreakdown')}</div>
${renderRealityPanel(mA)}
<div class="card">
  <div class="ctitle">${t('revByMonths')}</div>
  <div class="chw">${cols}${renderBarLineOverlay(mA,mB)}</div>
  <div class="wf-leg" style="margin-top:8px">
    <div class="ld"><div class="ldsq" style="background:#D1D5DB"></div>${t('actual2025')}</div>
    <div class="ld"><div class="ldsq" style="background:#16A34A"></div>${t('scenarioA')} (${scenLabel(paramsA)})</div>
    <div class="ld"><div class="ldsq" style="background:#EA580C"></div>${t('scenarioB')} (${scenLabel(paramsB)})</div>
    <div class="ld"><div class="ldsq" style="background:#7C3AED"></div>${t('reality2026')}</div>
  </div>
</div>
<div style="overflow-x:auto"><table>
<thead>
  <tr>
    <th>${t('month')}</th><th style="color:#6b7280">2025</th>
    <th colspan="2" style="color:#7C3AED">${t('reality2026')}</th>
    <th colspan="${2+(_gOn?2:0)+(_mOn?2:0)}" style="color:#16A34A;text-align:center">${t('scenarioA')} · ${scenLabel(paramsA)}</th>
    <th colspan="${2+(_gOn?1:0)+(_mOn?1:0)}" style="color:#EA580C;text-align:center">${t('scenarioB')} · ${scenLabel(paramsB)}</th>
  </tr>
  <tr style="font-size:8px;color:#4b5563">
    <th></th><th>${t('rev')}</th><th>${t('rev')}</th><th>${t('vsPlanA')}</th>
    <th>${t('revenue')}</th>${_gOn?'<th>G spend</th>':''}${_mOn?'<th>M spend</th>':''}${_gOn?'<th>G ROAS</th>':''}${_mOn?'<th>M ROAS</th>':''}<th>${t('pno')}</th>
    <th>${t('revenue')}</th>${_gOn?'<th>G spend</th>':''}${_mOn?'<th>M spend</th>':''}<th>${t('pno')}</th>
  </tr>
</thead>
<tbody>${tRows}
<tr style="border-top:2px solid var(--border-strong);font-weight:700">
  <td>${t('total')}</td><td style="color:#6B7280">${cx(A25.revenue)}</td><td colspan="2"></td>
  <td style="color:#16A34A">${cx(sA.t)}</td>${_gOn?`<td>${cx(sA.g)}</td>`:''}${_mOn?`<td>${cx(sA.m)}</td>`:''}${_gOn?'<td></td>':''}${_mOn?'<td></td>':''}
  <td style="color:${pc(mA.pno)}">${p(mA.pno)}</td>
  <td style="color:#EA580C">${cx(sB.t)}</td>${_gOn?`<td>${cx(sB.g)}</td>`:''}${_mOn?`<td>${cx(sB.m)}</td>`:''}
  <td style="color:${pc(mB.pno)}">${p(mB.pno)}</td>
</tr>
</tbody></table></div>`;
}
