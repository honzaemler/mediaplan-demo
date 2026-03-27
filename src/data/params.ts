import { REV25_EX } from './defaults';
import { CFG } from '../state';
import { t } from '../i18n';
import type { Params } from '../types';

export const PARAM_KEYS = ['label','totalRevGoal','decathlonRev','cvr','aov','decathlonAov','googleROAS','metaROAS',
  'googleBudget','metaBudget',
  'marginRate','shareOrganic','shareDirect',
  'shareUnassign','shareReferral','shareEmail','shareOrgsoc',
  'management','organic','email','pr','decathlonFee','other'];

export function mkParams(growthF: number, label: string): Params {
  const base = REV25_EX;
  const decRev = growthF > 1.5 ? 192000 : 150000;
  return {
    label,
    totalRevGoal: Math.round((base * growthF - decRev) / 5000) * 5000,
    decathlonRev: decRev,
    cvr:  0.00145,
    aov:  385,
    decathlonAov: 285,
    googleROAS: 5.8,
    metaROAS:   4.1,
    googleBudget: growthF > 1.5 ? 27500 : 22000,
    metaBudget:   growthF > 1.5 ? 5000  : 3800,
    marginRate: 0.205,
    // % share of organic (non-paid) revenue per channel (excl marketplace)
    shareOrganic:  0.42,
    shareDirect:   0.21,
    shareUnassign: 0.03,
    shareReferral: 0.02,
    shareEmail:    0.02,
    shareOrgsoc:   0.02,
    // costs
    management: growthF > 1.5 ? 24500 : 20800,
    organic:    8000,
    email:      4100,
    pr:         growthF > 1.5 ? 12200 : 7300,
    decathlonFee: growthF > 1.5 ? 4900 : 4300,
    other:      980,
  };
}

// Dynamický label — vždy aktuální % vs 2025
export function scenLabel(p: Params): string {
  const total = p.totalRevGoal + (CFG.channels.decathlon ? p.decathlonRev : 0);
  const pct = Math.round((total - REV25_EX) / REV25_EX * 100);
  return (pct >= 0 ? '+' : '') + pct + ' %';
}

export function scenFullLabel(p: Params, letter: string): string {
  return t('scenario') + ' ' + letter + ' · ' + scenLabel(p);
}
