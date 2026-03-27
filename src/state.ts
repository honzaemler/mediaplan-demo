import type { CFGType } from './types';

export const SETTINGS_LS = 'demoSettings';
export const CZK_RATE = 25.2;

export const CFG: CFGType = {
  channels: {organic:true,crossnet:true,direct:true,paidsoc:true,paidsrch:true,unassign:true,referral:true,email:true,orgsoc:true,decathlon:true},
  costs: {management:true,organic:true,email:true,pr:true,decathlonFee:true,other:true},
  currency: 'EUR', // EUR or CZK
  lang: 'cs',      // cs or en
};

export const LABELS: Record<string, any> = {
  cs: {
    settingsTitle: 'Nastaven\u00ed',
    channelsTitle: 'Kan\u00e1ly',
    channelsDesc: 'Zap\u00edn\u00e1/vyp\u00edn\u00e1 zobrazen\u00ed kan\u00e1l\u016f ve v\u0161ech pohledech.',
    costsTitle: 'Fixn\u00ed n\u00e1klady',
    costsDesc: 'Zap\u00edn\u00e1/vyp\u00edn\u00e1 jednotliv\u00e9 polo\u017eky fixn\u00edch n\u00e1klad\u016f.',
    currencyTitle: 'M\u011bna',
    currencyDesc: 'P\u0159ep\u00edn\u00e1 zobrazen\u00ed \u010d\u00e1stek mezi EUR a CZK.',
    langTitle: 'Jazyk',
    langDesc: 'P\u0159ep\u00edn\u00e1 jazyk rozhran\u00ed.',
    on: 'Zap', off: 'Vyp',
    chLabels: {organic:'Organic Search',crossnet:'Google Ads (Cross-network)',direct:'Direct / Brand',paidsoc:'Meta Ads',paidsrch:'Google Search (Brand kw)',unassign:'Unassigned',referral:'Referral / PR',email:'Email',orgsoc:'Organic Social / SoMe',decathlon:'Decathlon Marketplace'},
    costLabels: {management:'Management / Agentura',organic:'Organic / SEO / Blog',email:'Email / Newsletter',pr:'PR / Influence\u0159i',decathlonFee:'Marketplace poplatek',other:'Ostatn\u00ed n\u00e1klady'},
  },
  en: {
    settingsTitle: 'Settings',
    channelsTitle: 'Channels',
    channelsDesc: 'Toggle channel visibility across all views.',
    costsTitle: 'Fixed Costs',
    costsDesc: 'Toggle individual fixed cost items.',
    currencyTitle: 'Currency',
    currencyDesc: 'Switch displayed amounts between EUR and CZK.',
    langTitle: 'Language',
    langDesc: 'Switch interface language.',
    on: 'On', off: 'Off',
    chLabels: {organic:'Organic Search',crossnet:'Google Ads (Cross-network)',direct:'Direct / Brand',paidsoc:'Meta Ads',paidsrch:'Google Search (Brand kw)',unassign:'Unassigned',referral:'Referral / PR',email:'Email',orgsoc:'Organic Social / SoMe',decathlon:'Decathlon Marketplace'},
    costLabels: {management:'Management / Agency',organic:'Organic / SEO / Blog',email:'Email / Newsletter',pr:'PR / Influencers',decathlonFee:'Marketplace fee',other:'Other costs'},
  },
};

export const openGrp: Record<string, string | null> = {a:'rev', b:'rev'};

export function cfgSave() {
  try { localStorage.setItem(SETTINGS_LS, JSON.stringify(CFG)); } catch(e) {}
}
export function cfgLoad() {
  try {
    const s = localStorage.getItem(SETTINGS_LS);
    if(s) {
      const d = JSON.parse(s);
      if(d.channels) Object.assign(CFG.channels, d.channels);
      if(d.costs) Object.assign(CFG.costs, d.costs);
      if(d.currency) CFG.currency = d.currency;
      if(d.lang) CFG.lang = d.lang;
    }
  } catch(e) {}
}
