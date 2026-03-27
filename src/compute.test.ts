import { describe, it, expect, beforeEach } from 'vitest';
import { compute } from './compute';
import { mkParams } from './data/params';
import { CFG } from './state';

// Reset CFG before each test so tests are independent
function resetCFG() {
  CFG.channels = {organic:true,crossnet:true,direct:true,paidsoc:true,paidsrch:true,unassign:true,referral:true,email:true,orgsoc:true,decathlon:true};
  CFG.costs = {management:true,organic:true,email:true,pr:true,decathlonFee:true,other:true};
  CFG.currency = 'EUR';
  CFG.lang = 'cs';
}

describe('compute()', () => {
  beforeEach(resetCFG);

  it('vrátí kladný revenue pro 35% růst', () => {
    const p = mkParams(1.35, 'A');
    const m = compute(p);
    expect(m.totalRev).toBeGreaterThan(0);
    expect(m.ownRev).toBe(p.totalRevGoal);
  });

  it('revenue roste s vyšším growthF', () => {
    const pLow = mkParams(1.20, 'Low');
    const pHigh = mkParams(1.70, 'High');
    const mLow = compute(pLow);
    const mHigh = compute(pHigh);
    expect(mHigh.totalRev).toBeGreaterThan(mLow.totalRev);
  });

  it('Google revenue = budget × ROAS', () => {
    const p = mkParams(1.35, 'A');
    const m = compute(p);
    expect(m.googleRevYear).toBeCloseTo(p.googleBudget * p.googleROAS, 0);
  });

  it('Meta revenue = budget × ROAS', () => {
    const p = mkParams(1.35, 'A');
    const m = compute(p);
    expect(m.metaRevYear).toBeCloseTo(p.metaBudget * p.metaROAS, 0);
  });

  it('měsíční breakdown má 12 záznamů', () => {
    const p = mkParams(1.35, 'A');
    const m = compute(p);
    expect(m.months).toHaveLength(12);
  });

  it('součet měsíčních revenue odpovídá totalRev (±tolerance)', () => {
    const p = mkParams(1.35, 'A');
    const m = compute(p);
    const monthlySum = m.months.reduce((s, mo) => s + mo.tot, 0);
    // tolerance: ~1% kvůli zaokrouhlování sezónních koeficientů
    expect(monthlySum).toBeCloseTo(m.totalRev, -2);
  });

  it('PNO = totalCost / totalRev', () => {
    const p = mkParams(1.35, 'A');
    const m = compute(p);
    expect(m.pno).toBeCloseTo(m.totalCost / m.totalRev, 5);
  });

  it('netProfit = grossMargin - totalCost', () => {
    const p = mkParams(1.35, 'A');
    const m = compute(p);
    expect(m.netProfit).toBeCloseTo(m.grossMargin - m.totalCost, 5);
  });

  it('grossMargin = totalRev × marginRate', () => {
    const p = mkParams(1.35, 'A');
    const m = compute(p);
    expect(m.grossMargin).toBeCloseTo(m.totalRev * p.marginRate, 0);
  });

  it('disabled Google kanál → googleSpend = 0', () => {
    CFG.channels.crossnet = false;
    CFG.channels.paidsrch = false;
    const p = mkParams(1.35, 'A');
    const m = compute(p);
    expect(m.googleSpend).toBe(0);
    expect(m.googleRevYear).toBe(0);
  });

  it('disabled Meta kanál → metaSpend = 0', () => {
    CFG.channels.paidsoc = false;
    const p = mkParams(1.35, 'A');
    const m = compute(p);
    expect(m.metaSpend).toBe(0);
    expect(m.metaRevYear).toBe(0);
  });

  it('disabled Decathlon → decathlon revenue = 0', () => {
    CFG.channels.decathlon = false;
    const p = mkParams(1.35, 'A');
    const m = compute(p);
    expect(m.chRev['decathlon']).toBe(0);
    expect(m.totalRev).toBe(p.totalRevGoal); // jen e-shop
  });

  it('zvýšení Google budgetu zvýší Google revenue', () => {
    const p1 = mkParams(1.35, 'A');
    const m1 = compute(p1);
    const p2 = { ...mkParams(1.35, 'A'), googleBudget: p1.googleBudget * 2 };
    const m2 = compute(p2);
    expect(m2.googleRevYear).toBeGreaterThan(m1.googleRevYear);
  });

  it('nulový budget → nulový paid revenue', () => {
    const p = mkParams(1.35, 'A');
    p.googleBudget = 0;
    p.metaBudget = 0;
    const m = compute(p);
    expect(m.googleSpend).toBe(0);
    expect(m.metaSpend).toBe(0);
    expect(m.paidSpend).toBe(0);
    expect(m.googleRevYear).toBe(0);
    expect(m.metaRevYear).toBe(0);
  });

  it('disabled fixní náklady snižují totalCost', () => {
    const p = mkParams(1.35, 'A');
    const mAll = compute(p);
    CFG.costs.management = false;
    CFG.costs.pr = false;
    const mLess = compute(p);
    expect(mLess.totalCost).toBeLessThan(mAll.totalCost);
    expect(mLess.fixedCosts).toBeLessThan(mAll.fixedCosts);
  });
});
