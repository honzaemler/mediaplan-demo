import { CFG } from './state';
import { A25, CH_KEYS, SEAS, COST_SEAS, ADSPEND_SEAS, REV25_EX, gAvg, mAvg, MONTHS } from './data/defaults';
import type { Params, ComputeResult } from './types';

export function compute(p: Params): ComputeResult {
  const ownRev = p.totalRevGoal;
  const decRev = CFG.channels.decathlon ? p.decathlonRev : 0;
  const totalRev = p.totalRevGoal + decRev;

  // Paid channels: budget → revenue (budget × ROAS)
  const gOn = CFG.channels.crossnet || CFG.channels.paidsrch;
  const mOn = CFG.channels.paidsoc;
  const googleSpend   = gOn ? p.googleBudget : 0;
  const metaSpend     = mOn ? p.metaBudget : 0;
  const paidSpend     = googleSpend + metaSpend;
  const googleRevYear = googleSpend * p.googleROAS;
  const metaRevYear   = metaSpend   * p.metaROAS;

  // Split Google rev between crossnet / paidsrch (2025 ratio: 54.5% / 45.5%)
  const gSplitCross = 0.545;
  const chRev: Record<string, number> = {}, chVis: Record<string, number> = {}, chOrders: Record<string, number> = {};
  chRev['crossnet'] = googleRevYear * gSplitCross;
  chRev['paidsrch'] = googleRevYear * (1 - gSplitCross);
  chRev['paidsoc']  = metaRevYear;

  // Organic (non-paid) revenue = e-shop goal minus paid revenue (min 0)
  const paidRev    = googleRevYear + metaRevYear;
  const organicRev = Math.max(0, ownRev - paidRev);

  // Distribute organic revenue among organic channels by normalized shares
  const orgKeys = ['organic','direct','unassign','referral','email','orgsoc'];
  const shareKeys: Record<string, string> = {organic:'shareOrganic',direct:'shareDirect',
    unassign:'shareUnassign',referral:'shareReferral',email:'shareEmail',orgsoc:'shareOrgsoc'};
  let orgShareSum = 0;
  for(const k of orgKeys) orgShareSum += p[shareKeys[k]];
  for(const k of orgKeys) {
    chRev[k] = organicRev * (p[shareKeys[k]] / (orgShareSum || 1));
  }

  // Sessions & orders for all e-shop channels
  for(const k of CH_KEYS) {
    chVis[k]    = chRev[k] / (p.cvr * p.aov);
    chOrders[k] = chVis[k] * p.cvr;
  }

  // Decathlon — marketplace, no web sessions
  chRev['decathlon']    = decRev;
  chVis['decathlon']    = 0;
  chOrders['decathlon'] = decRev ? decRev / p.decathlonAov : 0;

  const totalVis    = Object.values(chVis).reduce((a,b)=>a+b,0);
  const totalOrders = Object.values(chOrders).reduce((a,b)=>a+b,0);

  const fixedCosts = (CFG.costs.management ? p.management : 0)
    + (CFG.costs.organic ? p.organic : 0)
    + (CFG.costs.email ? p.email : 0)
    + (CFG.costs.pr ? p.pr : 0)
    + (CFG.costs.decathlonFee && CFG.channels.decathlon ? p.decathlonFee : 0)
    + (CFG.costs.other ? p.other : 0);
  const totalCost  = paidSpend + fixedCosts;
  const grossMargin= totalRev * p.marginRate;
  const netProfit  = grossMargin - totalCost;
  const pno        = totalCost / totalRev;
  const vsActual   = (totalRev - REV25_EX) / REV25_EX;

  // Monthly breakdown
  const seasSum = SEAS.reduce((a,b)=>a+b,0);
  const gFloor = 5.0, mFloor = 4.0;
  const gROASm  = A25.gROAS.map(r => Math.max(gFloor, r * (p.googleROAS / gAvg)));
  const mROASm  = A25.mROAS.map(r => Math.max(mFloor, r * (p.metaROAS   / mAvg)));

  // Monthly cost distribution from real budget plan
  // Ad spend uses ADSPEND_SEAS profile, fixed costs use COST_SEAS profile
  const adNorm = ADSPEND_SEAS.reduce((a,b)=>a+b,0) / 12;  // should be ~1.0
  const costNorm = COST_SEAS.reduce((a,b)=>a+b,0) / 12;

  const months = MONTHS.map((_,i) => {
    const sf   = SEAS[i] / (seasSum/12);
    const mOwnRev = (ownRev/12) * sf;
    const mDecRev = p.decathlonRev / 12;
    const mTot = mOwnRev + mDecRev;
    const mGSpend = (googleSpend/12) * (ADSPEND_SEAS[i] / adNorm);
    const mMSpend = (metaSpend/12)   * (ADSPEND_SEAS[i] / adNorm);
    const mG   = mGSpend;
    const mM   = mMSpend;
    const mFix = (fixedCosts/12) * (COST_SEAS[i] / costNorm);
    const mC   = mG + mM + mFix;
    return {tot:mTot, google:mG, meta:mM, cost:mC, pno:mC/mTot,
            vis:mTot/(p.cvr*p.aov), orders:(mTot/(p.cvr*p.aov))*p.cvr,
            gROAS:gROASm[i], mROAS:mROASm[i]};
  });

  return {ownRev,totalRev,chRev,chVis,chOrders,totalVis,totalOrders,
          googleRevYear,metaRevYear,googleSpend,metaSpend,
          paidSpend,fixedCosts,totalCost,grossMargin,netProfit,pno,vsActual,months};
}
