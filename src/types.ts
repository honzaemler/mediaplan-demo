export interface ChannelData {
  sessions: number;
  rev: number;
  orders: number;
  cvr: number;
  aov: number;
  spend: number;
  label: string;
  color: string;
}

export interface A25Data {
  revenue: number;
  vatRate: number;
  sessions: number;
  orders: number;
  cvr: number;
  aov: number;
  monthlyRev: number[];
  channels: Record<string, ChannelData>;
  gROAS: number[];
  mROAS: number[];
  management: number;
  organic: number;
  email: number;
  pr: number;
  other: number;
  decathlonRev: number;
  decathlonFee: number;
  reality2026: number[];
}

export interface Params {
  label: string;
  totalRevGoal: number;
  decathlonRev: number;
  cvr: number;
  aov: number;
  decathlonAov: number;
  googleROAS: number;
  metaROAS: number;
  googleBudget: number;
  metaBudget: number;
  marginRate: number;
  shareOrganic: number;
  shareDirect: number;
  shareUnassign: number;
  shareReferral: number;
  shareEmail: number;
  shareOrgsoc: number;
  management: number;
  organic: number;
  email: number;
  pr: number;
  decathlonFee: number;
  other: number;
  [key: string]: any;
}

export interface MonthData {
  tot: number;
  google: number;
  meta: number;
  cost: number;
  pno: number;
  vis: number;
  orders: number;
  gROAS: number;
  mROAS: number;
}

export interface ComputeResult {
  ownRev: number;
  totalRev: number;
  chRev: Record<string, number>;
  chVis: Record<string, number>;
  chOrders: Record<string, number>;
  totalVis: number;
  totalOrders: number;
  googleRevYear: number;
  metaRevYear: number;
  googleSpend: number;
  metaSpend: number;
  paidSpend: number;
  fixedCosts: number;
  totalCost: number;
  grossMargin: number;
  netProfit: number;
  pno: number;
  vsActual: number;
  months: MonthData[];
}

export interface SliderDef {
  key: string;
  min: number;
  max: number;
  step: number;
  fmt: (v: any) => string;
  tKey?: string;
  grp?: string;
  nKey?: string;
  note?: string;
  show?: boolean;
}

export interface CFGType {
  channels: Record<string, boolean>;
  costs: Record<string, boolean>;
  currency: string;
  lang: string;
}
