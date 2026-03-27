import type { A25Data } from '../types';

export const A25: A25Data = {
  // GA4 total — demo
  revenue: 538700,
  vatRate: 0.21,
  sessions: 1124500,
  orders: 1480,
  cvr: 0.00132,
  aov: 364,

  // Monthly revenue — demo sezónní profil
  monthlyRev: [28400,31200,48500,52800,58300,44100,50600,69200,62400,37800,26100,14200],

  // GA4 channels — demo
  channels: {
    organic:  {sessions:738400, rev:225600, orders:631, cvr:0.00082, aov:358, spend:7200,  label:'Organic Search',  color:'#34A853'},
    crossnet: {sessions:98900,  rev:71200,  orders:187, cvr:0.00182, aov:381, spend:30500, label:'Google Ads (PMax/Search)', color:'#4285F4'},
    direct:   {sessions:96500,  rev:114100, orders:297, cvr:0.00301, aov:384, spend:0,     label:'Direct / Brand',  color:'#78909C'},
    paidsoc:  {sessions:89000,  rev:12100,  orders:39,  cvr:0.00042, aov:310, spend:26400, label:'Meta Ads (Paid Social)', color:'#0668E1'},
    paidsrch: {sessions:42300,  rev:59300,  orders:182, cvr:0.00418, aov:326, spend:0,     label:'Paid Search (Brand kw)', color:'#34D399'},
    unassign: {sessions:39400,  rev:19100,  orders:58,  cvr:0.00141, aov:329, spend:0,     label:'Unassigned',      color:'#6B7280'},
    referral: {sessions:25100,  rev:12900,  orders:36,  cvr:0.00140, aov:358, spend:5500,  label:'Referral / PR',   color:'#AB47BC'},
    email:    {sessions:4970,   rev:10800,  orders:25,  cvr:0.00482, aov:432, spend:4100,  label:'Email',           color:'#FF9800'},
    orgsoc:   {sessions:12800,  rev:5400,   orders:14,  cvr:0.00105, aov:386, spend:3600,  label:'Organic Social',  color:'#F59E0B'},
  },

  // Monthly Google ROAS — demo
  gROAS: [8.7, 8.2, 8.8, 9.1, 4.8, 6.3, 5.9, 2.7, 4.5, 5.3, 3.1, 3.3],
  // Monthly Meta ROAS — demo
  mROAS: [3.9, 4.7, 8.5, 4.4, 3.7, 5.5, 3.6, 2.5, 3.6, 2.5, 3.8, 0.6],

  // Other costs 2025 — demo
  management: 19200, organic: 7200, email: 4100, pr: 5500, other: 720,
  decathlonRev: 280, decathlonFee: 3400,

  // Reality 2026 — demo
  reality2026: [36200, 28800, 0,0,0,0,0,0,0,0,0,0],
};

export const gAvg = A25.gROAS.reduce((a,b)=>a+b,0)/12;
export const mAvg = A25.mROAS.reduce((a,b)=>a+b,0)/12;
// 2025 revenue bez DPH — pro srovnání s 2026 cíli (které jsou bez DPH)
export const REV25_EX = Math.round(A25.revenue / (1 + A25.vatRate));

export const MONTHS   = ['Led','Úno','Bře','Dub','Kvě','Čvn','Čvc','Srp','Zář','Říj','Lis','Pro'];
export const MONTHS_F = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];
export const NOW_MONTH = new Date().getMonth(); // 0-based; Feb 2026 = 1
const avgRev25 = A25.monthlyRev.reduce((a,b)=>a+b,0)/12;
export const SEAS     = A25.monthlyRev.map(v=>v/avgRev25);

// Monthly cost distribution — demo
export const COST_MONTHLY = [3850, 5170, 6680, 7750, 8850, 8300, 9160, 10690, 10450, 8670, 3950, 2240];
const costAvg = COST_MONTHLY.reduce((a,b)=>a+b,0) / 12;
export const COST_SEAS = COST_MONTHLY.map(v => v / costAvg);  // normalized: avg = 1.0

// Ad spend weights — demo
export const ADSPEND_MONTHLY = [1530, 2510, 3460, 4530, 5630, 5390, 6240, 7470, 7220, 5940, 1960, 740];
const adspendAvg = ADSPEND_MONTHLY.reduce((a,b)=>a+b,0) / 12;
export const ADSPEND_SEAS = ADSPEND_MONTHLY.map(v => v / adspendAvg);  // normalized: avg = 1.0

// Channel keys in display order
export const CH_KEYS = ['organic','crossnet','direct','paidsoc','paidsrch','unassign','referral','email','orgsoc'];
