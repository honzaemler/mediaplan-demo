import { CFG, openGrp } from '../state';
import { scenFullLabel, scenLabel } from '../data/params';
import { t } from '../i18n';
import { f, fK, p, p2, dp, pc, cx, cxK, cxKd, cxR } from '../core/format';
import { getSliders, getGroups } from '../core/slider';
import type { Params, ComputeResult } from '../types';

// NOTE: innerHTML usage below is safe - all content is generated from trusted application state.

export function renderPanel(side: string, pr: Params, m: ComputeResult, ac: string, tag: string) {
  const vsColor = m.vsActual>=0?'#16A34A':'#DC2626';
  const costP=m.totalCost/m.totalRev, profP=Math.max(0,m.netProfit/m.totalRev);

  const SLIDERS = getSliders();
  const GROUPS = getGroups();
  let slidersHtml='';
  for(const[grp,g] of Object.entries(GROUPS)){
    const gS=SLIDERS.filter(s=>s.grp===grp);
    const isOpen=openGrp[side]===grp;
    let rows='';
    for(const sl of gS){
      if(sl.show===false) continue;
      const val=pr[sl.key];
      const slLabel = sl.tKey ? t(sl.tKey) : sl.key;
      const slNote = sl.nKey ? t(sl.nKey) : (sl.note||'');
      const editTitle = CFG.lang==='en' ? 'Click to edit' : 'Klikni pro ruční zadání';
      rows+=`<div class="slr">
        <div class="slt">
          <div><span class="sll">${slLabel}</span>${slNote?`<span class="sln"> · ${slNote}</span>`:''}</div>
          <span class="slv" id="sv-${side}-${sl.key}" style="color:${g.color}" title="${editTitle}">${sl.fmt(val)}</span>
        </div>
        <input type="range" class="slrange" min="${sl.min}" max="${sl.max}" step="${sl.step}" value="${val}"
          style="accent-color:${g.color}" oninput="onSl('${side}','${sl.key}',this.value)" data-side="${side}" data-key="${sl.key}">
        <div class="sle"><span>${sl.fmt(sl.min)}</span><span>${sl.fmt(sl.max)}</span></div>
      </div>`;
    }
    slidersHtml+=`<div class="grpb">
      <button class="gh" style="color:${g.color}" onclick="tGrp('${side}','${grp}')">
        <span class="gdot" style="background:${g.color}"></span>${g.label}
        <span class="garr" id="arr-${side}-${grp}">${isOpen?'▲':'▼'}</span>
      </button>
      <div class="gsl${isOpen?' open':''}" id="grp-${side}-${grp}">${rows}</div>
    </div>`;
  }

  const cItemsAll=[
    {l:'Google Ads',  v:m.googleSpend,      c:'#4285F4', chk:CFG.channels.crossnet||CFG.channels.paidsrch},
    {l:'Meta Ads',    v:m.metaSpend,        c:'#0668E1', chk:CFG.channels.paidsoc},
    {l:'Decathlon fee',v:pr.decathlonFee,   c:'#0082C3', chk:CFG.costs.decathlonFee},
    {l:'Organic/SEO', v:pr.organic,         c:'#34A853', chk:CFG.costs.organic},
    {l:'Email',       v:pr.email,           c:'#FF9800', chk:CFG.costs.email},
    {l:'PR/Influ',    v:pr.pr,              c:'#AB47BC', chk:CFG.costs.pr},
    {l:'Management',  v:pr.management,      c:'#78909C', chk:CFG.costs.management},
  ];
  const cItems = cItemsAll.filter(ci=>ci.chk);
  let costHtml='';
  for(const ci of cItems){
    const w=Math.min(100,ci.v/m.totalRev*100);
    costHtml+=`<div class="crow"><div class="clbl">${ci.l}</div><div class="ctrk"><div class="cfil" style="width:${w}%;background:${ci.c}"></div></div><div class="cval">${cx(ci.v)}</div><div class="cpct">${p(ci.v/m.totalRev)}</div></div>`;
  }

  const panelEl = document.getElementById('panel-'+side)!;
  panelEl.className='panel';
  panelEl.style.borderTop=`3px solid ${ac}`;
  panelEl.innerHTML=`
<div class="p-head">
  <div>
    <div class="p-title" style="color:${ac}">${scenFullLabel(pr, side==='a'?'A':'B')}</div>
    <button class="copy-btn" onclick="copyParams('${side}')" title="${t('copyTo')} ${side==='a'?'B':'A'}">📋 ${t('copyTo')} ${side==='a'?'B':'A'}</button>
  </div>
  <div>
    <div class="p-rev">${cx(m.totalRev)}</div>
    <div class="p-vs" style="color:${vsColor}">${dp(m.vsActual)} vs 2025</div>
  </div>
</div>
<div class="kstrip">
  <div class="kb"><div class="kl">${t('googleSpend')}</div><div class="kv" id="kv-${side}-googleSpend">${cxKd(m.googleSpend)}</div><div class="ks" id="ks-${side}-googleROAS">rev ${cxK(m.googleRevYear)} · ROAS ${pr.googleROAS.toFixed(1)}×</div></div>
  <div class="kb"><div class="kl">${t('metaSpend')}</div><div class="kv" id="kv-${side}-metaSpend">${cxKd(m.metaSpend)}</div><div class="ks" id="ks-${side}-metaROAS">rev ${cxK(m.metaRevYear)} · ROAS ${pr.metaROAS.toFixed(1)}×</div></div>
  <div class="kb"><div class="kl">${t('visitorsYear')}</div><div class="kv" id="kv-${side}-vis">${fK(m.totalVis)}</div><div class="ks" id="ks-${side}-cvr">CVR ${p2(pr.cvr)}</div></div>
  <div class="kb"><div class="kl">${t('orders')}</div><div class="kv" id="kv-${side}-orders">${f(Math.round(m.totalOrders))}</div><div class="ks" id="ks-${side}-aov">AOV ${cxR(pr.aov)}</div></div>
  <div class="kb"><div class="kl">${t('pno')}</div><div class="kv" id="kv-${side}-pno" style="color:${pc(m.pno)}">${p(m.pno)}</div><div class="ks">${t('costs')}/${t('revenue').toLowerCase()}</div></div>
  <div class="kb"><div class="kl">${t('netProfit')}</div><div class="kv" id="kv-${side}-profit" style="color:${m.netProfit>=0?'#16A34A':'#DC2626'}">${cxKd(m.netProfit)}</div><div class="ks">${t('marginMinusCosts')}</div></div>
</div>
<div class="wf">
  <div class="wf-t">
    <div class="wf-s" style="width:${p(costP)};background:#EF444499"></div>
    <div class="wf-s" style="width:${p(profP)};background:#16A34A99"></div>
    <div class="wf-s" style="flex:1;background:#374151"></div>
  </div>
  <div class="wf-leg">
    <div class="ld"><div class="ldsq" style="background:#EF4444"></div>${t('costsLabel')} ${p(costP)}</div>
    <div class="ld"><div class="ldsq" style="background:#16A34A"></div>${t('profitLabel')} ${p(Math.max(0,m.netProfit/m.totalRev))}</div>
  </div>
</div>
<div style="margin-top:9px">${slidersHtml}</div>
<div style="margin-top:10px"><div class="sec">${t('costStructure')}</div><div class="cbars">${costHtml}</div></div>`;
}
