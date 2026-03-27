import { compute } from '../compute';
import { A25, MONTHS_F } from '../data/defaults';
import { scenLabel, scenFullLabel } from '../data/params';
import { CFG } from '../state';
import { f, p, p2, cx, cxK, cxR, pc } from './format';
import { mName } from '../i18n';
import type { Params, ComputeResult } from '../types';

declare const html2pdf: any;

export function csvRow(...cells: any[]): string {
  return cells.map(c => {
    const s = String(c === null || c === undefined ? '' : c);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g,'""')}"` : s;
  }).join(',');
}

export function exportCSV(paramsA: Params, paramsB: Params) {
  const mA = compute(paramsA);
  const mB = compute(paramsB);
  const rows: string[] = [];
  const d = new Date().toLocaleDateString('cs-CZ');

  rows.push(csvRow('DEMO CLIENT \u00b7 MARKETING PLAN 2026 \u00b7 Export ' + d));
  rows.push('');

  // ── SOUHRN ──
  rows.push(csvRow('SOUHRN SC\u00c9N\u00c1\u0158\u016e'));
  rows.push(csvRow('Metrika', 'Skute\u010dnost 2025', scenFullLabel(paramsA,'A'), scenFullLabel(paramsB,'B'), 'Jednotka'));
  rows.push(csvRow('Revenue celkem', A25.revenue, Math.round(mA.totalRev), Math.round(mB.totalRev), 'EUR'));
  rows.push(csvRow('z toho e-shop', A25.revenue - (A25.decathlonRev||0), paramsA.totalRevGoal, paramsB.totalRevGoal, 'EUR'));
  rows.push(csvRow('z toho Decathlon (extra)', A25.decathlonRev||'\u2014', paramsA.decathlonRev, paramsB.decathlonRev, 'EUR'));
  rows.push(csvRow('Visitors / sessions', A25.sessions, Math.round(mA.totalVis), Math.round(mB.totalVis), 'po\u010det'));
  rows.push(csvRow('Objedn\u00e1vky', A25.orders, Math.round(mA.totalOrders), Math.round(mB.totalOrders), 'po\u010det'));
  rows.push(csvRow('CVR konverzn\u00ed pom\u011br', (A25.cvr*100).toFixed(3)+'%', (paramsA.cvr*100).toFixed(3)+'%', (paramsB.cvr*100).toFixed(3)+'%', '%'));
  rows.push(csvRow('AOV pr\u016fm\u011brn\u00e1 objedn\u00e1vka', A25.aov, paramsA.aov, paramsB.aov, 'EUR'));
  rows.push(csvRow('Hrub\u00e1 mar\u017ee', '', Math.round(mA.grossMargin), Math.round(mB.grossMargin), 'EUR'));
  rows.push(csvRow('Mar\u017ee %', '', (paramsA.marginRate*100).toFixed(1)+'%', (paramsB.marginRate*100).toFixed(1)+'%', '%'));
  rows.push('');

  // ── NÁKLADY ──
  rows.push(csvRow('N\u00c1KLADY'));
  rows.push(csvRow('Polo\u017eka', 'Skute\u010dnost 2025', scenFullLabel(paramsA,'A'), scenFullLabel(paramsB,'B'), 'Jednotka'));
  rows.push(csvRow('Google Ads spend', A25.channels.crossnet.spend, Math.round(mA.googleSpend), Math.round(mB.googleSpend), 'EUR'));
  rows.push(csvRow('Google ROAS', (A25.channels.crossnet.rev/A25.channels.crossnet.spend).toFixed(1)+'\u00d7', paramsA.googleROAS.toFixed(1)+'\u00d7', paramsB.googleROAS.toFixed(1)+'\u00d7', ''));
  rows.push(csvRow('Meta Ads spend', A25.channels.paidsoc.spend, Math.round(mA.metaSpend), Math.round(mB.metaSpend), 'EUR'));
  rows.push(csvRow('Meta ROAS', (A25.channels.paidsoc.rev/A25.channels.paidsoc.spend).toFixed(1)+'\u00d7', paramsA.metaROAS.toFixed(1)+'\u00d7', paramsB.metaROAS.toFixed(1)+'\u00d7', ''));
  rows.push(csvRow('Management / Agentura', A25.management, paramsA.management, paramsB.management, 'EUR'));
  rows.push(csvRow('Organic / SEO / Blog', A25.organic, paramsA.organic, paramsB.organic, 'EUR'));
  rows.push(csvRow('Email / Newsletter', A25.email, paramsA.email, paramsB.email, 'EUR'));
  rows.push(csvRow('PR / Influence\u0159i', A25.pr, paramsA.pr, paramsB.pr, 'EUR'));
  rows.push(csvRow('Decathlon poplatek', A25.decathlonFee, paramsA.decathlonFee, paramsB.decathlonFee, 'EUR'));
  rows.push(csvRow('Ostatn\u00ed', A25.other, paramsA.other, paramsB.other, 'EUR'));
  rows.push(csvRow('CELKOV\u00c9 N\u00c1KLADY', '', Math.round(mA.totalCost), Math.round(mB.totalCost), 'EUR'));
  rows.push(csvRow('PNO (n\u00e1klady / revenue)', '', (mA.pno*100).toFixed(1)+'%', (mB.pno*100).toFixed(1)+'%', '%'));
  rows.push(csvRow('\u010cIST\u00dd ZISK', '', Math.round(mA.netProfit), Math.round(mB.netProfit), 'EUR'));
  rows.push('');

  // ── MĚSÍČNÍ ROZPIS ──
  rows.push(csvRow('M\u011aS\u00cd\u010cN\u00cd ROZPIS \u00b7 ' + scenFullLabel(paramsA,'A').toUpperCase()));
  rows.push(csvRow('M\u011bs\u00edc', 'Revenue', 'Google spend', 'Meta spend', 'Celk. n\u00e1klady', 'PNO', 'Google ROAS', 'Meta ROAS', 'Sessions (est.)'));
  for(let i=0;i<12;i++){
    const m = mA.months[i];
    rows.push(csvRow(MONTHS_F[i], Math.round(m.tot), Math.round(m.google), Math.round(m.meta),
      Math.round(m.cost), (m.pno*100).toFixed(1)+'%', m.gROAS.toFixed(1)+'\u00d7', m.mROAS.toFixed(1)+'\u00d7',
      Math.round(m.vis)));
  }
  rows.push(csvRow('CELKEM',
    Math.round(mA.months.reduce((s,m)=>s+m.tot,0)),
    Math.round(mA.months.reduce((s,m)=>s+m.google,0)),
    Math.round(mA.months.reduce((s,m)=>s+m.meta,0)),
    Math.round(mA.months.reduce((s,m)=>s+m.cost,0)),
    (mA.pno*100).toFixed(1)+'%','','',
    Math.round(mA.months.reduce((s,m)=>s+m.vis,0))));
  rows.push('');

  rows.push(csvRow('M\u011aS\u00cd\u010cN\u00cd ROZPIS \u00b7 ' + scenFullLabel(paramsB,'B').toUpperCase()));
  rows.push(csvRow('M\u011bs\u00edc', 'Revenue', 'Google spend', 'Meta spend', 'Celk. n\u00e1klady', 'PNO', 'Google ROAS', 'Meta ROAS', 'Sessions (est.)'));
  for(let i=0;i<12;i++){
    const m = mB.months[i];
    rows.push(csvRow(MONTHS_F[i], Math.round(m.tot), Math.round(m.google), Math.round(m.meta),
      Math.round(m.cost), (m.pno*100).toFixed(1)+'%', m.gROAS.toFixed(1)+'\u00d7', m.mROAS.toFixed(1)+'\u00d7',
      Math.round(m.vis)));
  }
  rows.push(csvRow('CELKEM',
    Math.round(mB.months.reduce((s,m)=>s+m.tot,0)),
    Math.round(mB.months.reduce((s,m)=>s+m.google,0)),
    Math.round(mB.months.reduce((s,m)=>s+m.meta,0)),
    Math.round(mB.months.reduce((s,m)=>s+m.cost,0)),
    (mB.pno*100).toFixed(1)+'%','','',
    Math.round(mB.months.reduce((s,m)=>s+m.vis,0))));
  rows.push('');

  // ── KANÁLY ──
  rows.push(csvRow('REVENUE PO KAN\u00c1LECH \u00b7 ' + scenFullLabel(paramsA,'A').toUpperCase()));
  rows.push(csvRow('Kan\u00e1l', 'Revenue A', '% celku', 'Spend A', 'PNO'));
  const chMeta2 = [
    {k:'organic',  label:'Organic Search',       spend:paramsA.organic},
    {k:'crossnet', label:'Google Ads',            spend:null as number|null},
    {k:'paidsrch', label:'Google Search Brand',   spend:null as number|null},
    {k:'direct',   label:'Direct / Brand',        spend:0},
    {k:'paidsoc',  label:'Meta Ads',              spend:null as number|null},
    {k:'referral', label:'Referral / PR',         spend:paramsA.pr},
    {k:'email',    label:'Email',                 spend:paramsA.email},
    {k:'orgsoc',   label:'Organic Social',        spend:0},
    {k:'decathlon',label:'Decathlon Marketplace', spend:paramsA.decathlonFee},
  ];
  const totalRevA = Object.values(mA.chRev).reduce((a,b)=>a+b,0);
  const gSplitA = mA.chRev['crossnet'] / (mA.chRev['crossnet'] + mA.chRev['paidsrch'] || 1);
  for(const ch of chMeta2){
    const rev = mA.chRev[ch.k] || 0;
    const sp  = ch.k==='crossnet'? Math.round(mA.googleSpend*gSplitA)
              : ch.k==='paidsrch'? Math.round(mA.googleSpend*(1-gSplitA))
              : ch.k==='paidsoc' ? Math.round(mA.metaSpend)
              : (ch.spend||0);
    const pno2 = sp&&rev ? (sp/rev*100).toFixed(1)+'%' : '\u2014';
    rows.push(csvRow(ch.label, Math.round(rev), (rev/totalRevA*100).toFixed(1)+'%', sp||'\u2014', pno2));
  }
  rows.push('');
  rows.push(csvRow('Pozn\u00e1mka: Meta GA4 vs Meta dashboard \u2014 GA4 ukazuje last-click, Meta dashboard post-view+click (7d). Skute\u010dnost le\u017e\u00ed mezi.'));

  // Stáhni jako BOM UTF-8 (Excel to pozná)
  const bom = '\uFEFF';
  const blob = new Blob([bom + rows.join('\n')], {type:'text/csv;charset=utf-8'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'demo_client_plan_2026.csv';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportPDF(paramsA: Params, paramsB: Params) {
  const mA = compute(paramsA);
  const mB = compute(paramsB);
  const d  = new Date().toLocaleDateString('cs-CZ');

  // Helpers (lokální kopie, nezávisí na closure)
  const ef  = (v: number) => Math.round(v).toLocaleString('cs-CZ');
  const epct= (v: number) => (v*100).toFixed(1) + ' %';
  const epc = (v: number) => v>0.28?'#DC2626':v>0.20?'#D97706':'#16A34A';

  // Sémantické řádky pro souhrn
  const sumRows = [
    ['Revenue celkem',           ef(A25.revenue),    ef(mA.totalRev),             ef(mB.totalRev),             'EUR'],
    ['z toho e-shop',            ef(A25.revenue-(A25.decathlonRev||0)), ef(paramsA.totalRevGoal), ef(paramsB.totalRevGoal), 'EUR'],
    ['z toho Decathlon (extra)', ef(A25.decathlonRev||0), ef(paramsA.decathlonRev), ef(paramsB.decathlonRev), 'EUR'],
    ['Visitors / sessions',      ef(A25.sessions),   ef(mA.totalVis),             ef(mB.totalVis),             'po\u010det'],
    ['Objedn\u00e1vky',               ef(A25.orders),     ef(mA.totalOrders),          ef(mB.totalOrders),          'po\u010det'],
    ['CVR',                      epct(A25.cvr),      epct(paramsA.cvr),           epct(paramsB.cvr),           '%'],
    ['AOV pr\u016fm. objedn\u00e1vka',     '\u20ac '+A25.aov,       '\u20ac '+paramsA.aov,            '\u20ac '+paramsB.aov,            'EUR'],
    ['Hrub\u00e1 mar\u017ee',              '\u2014',                ef(mA.grossMargin),          ef(mB.grossMargin),          'EUR'],
    ['Mar\u017ee %',                  epct(0.195),        epct(paramsA.marginRate),    epct(paramsB.marginRate),    '%'],
  ];
  const costRows2 = [
    ['Google Ads spend',         ef(A25.channels.crossnet.spend), ef(mA.googleSpend),  ef(mB.googleSpend),  'EUR'],
    ['Google ROAS',              (A25.channels.crossnet.rev/A25.channels.crossnet.spend).toFixed(1)+'\u00d7', paramsA.googleROAS.toFixed(1)+'\u00d7', paramsB.googleROAS.toFixed(1)+'\u00d7',''],
    ['Meta Ads spend',           ef(A25.channels.paidsoc.spend),  ef(mA.metaSpend),    ef(mB.metaSpend),    'EUR'],
    ['Meta ROAS',                (A25.channels.paidsoc.rev/A25.channels.paidsoc.spend).toFixed(1)+'\u00d7', paramsA.metaROAS.toFixed(1)+'\u00d7',  paramsB.metaROAS.toFixed(1)+'\u00d7', ''],
    ['Management / Agentura',    ef(A25.management),  ef(paramsA.management),  ef(paramsB.management),  'EUR'],
    ['Organic / SEO / Blog',     ef(A25.organic),     ef(paramsA.organic),     ef(paramsB.organic),     'EUR'],
    ['Email / Newsletter',       ef(A25.email),       ef(paramsA.email),       ef(paramsB.email),       'EUR'],
    ['PR / Influence\u0159i',         ef(A25.pr),          ef(paramsA.pr),          ef(paramsB.pr),          'EUR'],
    ['Decathlon poplatek',       ef(A25.decathlonFee),ef(paramsA.decathlonFee),ef(paramsB.decathlonFee),'EUR'],
  ];

  const tblHead = (cols: string[]) => `<tr>${cols.map((c,i)=>`<th style="text-align:${i>0?'right':'left'};padding:7px 10px;background:#F3F4F6;border-bottom:2px solid #D1D5DB;font-size:12px">${c}</th>`).join('')}</tr>`;
  const tblRow  = (cells: string[], bold=false, colorsAt: string[]=[]) => `<tr>${cells.map((c,i)=>{
    const col = colorsAt[i] || (bold?'#111827':'#374151');
    return `<td style="text-align:${i>0?'right':'left'};padding:6px 10px;border-bottom:1px solid #E5E7EB;font-size:12px;font-weight:${bold?600:400};color:${col}">${c}</td>`;
  }).join('')}</tr>`;

  // Měsíční tabulka
  const monthRowsA = MONTHS_F.map((mn,i)=>{
    const m=mA.months[i];
    return [mn, ef(m.tot), ef(m.google), ef(m.meta), ef(m.cost),
      `<span style="color:${epc(m.pno)}">${epct(m.pno)}</span>`,
      m.gROAS.toFixed(1)+'\u00d7', m.mROAS.toFixed(1)+'\u00d7'];
  });
  const monthRowsB = MONTHS_F.map((mn,i)=>{
    const m=mB.months[i];
    return [mn, ef(m.tot), ef(m.google), ef(m.meta), ef(m.cost),
      `<span style="color:${epc(m.pno)}">${epct(m.pno)}</span>`,
      m.gROAS.toFixed(1)+'\u00d7', m.mROAS.toFixed(1)+'\u00d7'];
  });

  const section = (title: string, color='#16A34A') =>
    `<h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${color};margin:28px 0 10px;padding-bottom:6px;border-bottom:2px solid ${color}22">${title}</h2>`;

  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<title>Demo Client \u00b7 Marketing Report 2026</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Inter,-apple-system,sans-serif;color:#111827;background:#fff;padding:32px 40px;max-width:960px;margin:0 auto}
  @media print{
    body{padding:16px 20px}
    .no-print{display:none}
    table{page-break-inside:avoid}
    h2{page-break-before:auto}
  }
</style>
</head>
<body>

<div class="no-print" style="background:#DCFCE7;border:1px solid #16A34A;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:13px;color:#15803D">
  \ud83d\udca1 <strong>Pro ulo\u017een\u00ed jako PDF:</strong> stiskni <strong>Ctrl+P</strong> (nebo Cmd+P na Mac) \u2192 zvol <strong>\u201eUlo\u017eit jako PDF\u201c</strong> \u2192 Ulo\u017eit.
</div>

<!-- HLAVIČKA -->
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:16px;border-bottom:2px solid #111827">
  <div>
    <div style="font-size:22px;font-weight:700;letter-spacing:-.5px">\ud83d\udcca Demo Client \u00b7 Marketing Plan 2026</div>
    <div style="font-size:13px;color:#6B7280;margin-top:4px">Demo data \u00b7 Du\u00e1ln\u00ed sc\u00e9n\u00e1\u0159 A/B \u00b7 Export ${d}</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:.5px">Skute\u010dnost 2025 (GA4)</div>
    <div style="font-size:20px;font-weight:700">\u20ac ${ef(A25.revenue)}</div>
    <div style="font-size:11px;color:#6B7280">${ef(A25.sessions)} sessions \u00b7 CVR ${epct(A25.cvr)} \u00b7 AOV \u20ac${A25.aov}</div>
  </div>
</div>

<!-- KLÍČOVÉ KPI -->
${section('Kl\u00ed\u010dov\u00e9 v\u00fdsledky')}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
  ${[
    ['Revenue celkem', '\u20ac '+ef(mA.totalRev), '\u20ac '+ef(mB.totalRev)],
    ['\u010cist\u00fd zisk',     '\u20ac '+ef(mA.netProfit),         '\u20ac '+ef(mB.netProfit)],
    ['PNO',            epct(mA.pno),                  epct(mB.pno)],
    ['Google spend',   '\u20ac '+ef(mA.googleSpend),       '\u20ac '+ef(mB.googleSpend)],
    ['Meta spend',     '\u20ac '+ef(mA.metaSpend),         '\u20ac '+ef(mB.metaSpend)],
    ['Visitors/rok',   ef(mA.totalVis),               ef(mB.totalVis)],
  ].map(([l,a,b])=>`<div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:12px 14px">
    <div style="font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px">${l}</div>
    <div style="font-size:14px;font-weight:700">
      <span style="color:#16A34A">A: ${a}</span>
      <span style="color:#D1D5DB;margin:0 6px">|</span>
      <span style="color:#EA580C">B: ${b}</span>
    </div>
  </div>`).join('')}
</div>

<!-- SOUHRN SCÉNÁŘŮ -->
${section('Souhrn sc\u00e9n\u00e1\u0159\u016f vs. 2025')}
<table style="width:100%;border-collapse:collapse;margin-bottom:20px">
  ${tblHead(['Metrika','Skute\u010dnost 2025','Sc\u00e9n\u00e1\u0159 A \u00b7 '+scenLabel(paramsA),'Sc\u00e9n\u00e1\u0159 B \u00b7 '+scenLabel(paramsB),'Jednotka'])}
  ${sumRows.map(r=>tblRow(r)).join('')}
</table>

<!-- NÁKLADY -->
${section('N\u00e1klady')}
<table style="width:100%;border-collapse:collapse;margin-bottom:20px">
  ${tblHead(['Polo\u017eka','Skute\u010dnost 2025','Sc\u00e9n\u00e1\u0159 A \u00b7 '+scenLabel(paramsA),'Sc\u00e9n\u00e1\u0159 B \u00b7 '+scenLabel(paramsB),'Jednotka'])}
  ${costRows2.map(r=>tblRow(r)).join('')}
  ${tblRow(['CELKOV\u00c9 N\u00c1KLADY', '\u2014', ef(mA.totalCost), ef(mB.totalCost), 'EUR'], true)}
  ${tblRow(['\u010cIST\u00dd ZISK', '\u2014', ef(mA.netProfit), ef(mB.netProfit), 'EUR'], true,
    ['','','#16A34A', mB.netProfit>=0?'#16A34A':'#DC2626',''])}
  ${tblRow(['PNO', '\u2014', epct(mA.pno), epct(mB.pno), '%'], true,
    ['','',epc(mA.pno),epc(mB.pno),''])}
</table>

<!-- MĚSÍCE A -->
${section('M\u011bs\u00ed\u010dn\u00ed rozpis \u00b7 ' + scenFullLabel(paramsA,'A'))}
<table style="width:100%;border-collapse:collapse;margin-bottom:20px">
  ${tblHead(['M\u011bs\u00edc','Revenue','Google spend','Meta spend','Celk. n\u00e1klady','PNO','G ROAS','M ROAS'])}
  ${monthRowsA.map(r=>tblRow(r)).join('')}
  ${tblRow(['CELKEM',
    ef(mA.months.reduce((s,m)=>s+m.tot,0)),
    ef(mA.months.reduce((s,m)=>s+m.google,0)),
    ef(mA.months.reduce((s,m)=>s+m.meta,0)),
    ef(mA.months.reduce((s,m)=>s+m.cost,0)),
    epct(mA.pno),'',''], true)}
</table>

<!-- MĚSÍCE B -->
${section('M\u011bs\u00ed\u010dn\u00ed rozpis \u00b7 ' + scenFullLabel(paramsB,'B'), '#EA580C')}
<table style="width:100%;border-collapse:collapse;margin-bottom:20px">
  ${tblHead(['M\u011bs\u00edc','Revenue','Google spend','Meta spend','Celk. n\u00e1klady','PNO','G ROAS','M ROAS'])}
  ${monthRowsB.map(r=>tblRow(r)).join('')}
  ${tblRow(['CELKEM',
    ef(mB.months.reduce((s,m)=>s+m.tot,0)),
    ef(mB.months.reduce((s,m)=>s+m.google,0)),
    ef(mB.months.reduce((s,m)=>s+m.meta,0)),
    ef(mB.months.reduce((s,m)=>s+m.cost,0)),
    epct(mB.pno),'',''], true)}
</table>

<!-- POZNÁMKY -->
<div style="margin-top:24px;padding:12px 16px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;font-size:11px;color:#6B7280;line-height:1.7">
  <strong style="color:#374151">Pozn\u00e1mky k dat\u016fm:</strong><br>
  \u2022 Z\u00e1kladem jsou re\u00e1ln\u00e1 data GA4 2025 (${ef(A25.sessions)} sessions, ${ef(A25.orders)} objedn\u00e1vek, CVR ${epct(A25.cvr)}).<br>
  \u2022 Meta Ads: GA4 ukazuje last-click atribuci (\u20ac${ef(A25.channels.paidsoc.rev)}), Meta dashboard post-view+click 7d. Skute\u010dnost le\u017e\u00ed mezi ob\u011bma \u010d\u00edsly.<br>
  \u2022 M\u011bs\u00ed\u010dn\u00ed distribuce vych\u00e1z\u00ed ze sez\u00f3nn\u00edho profilu 2025. Dv\u011b sez\u00f3ny: \u00fanor\u2013kv\u011bten (jaro) a \u010dervenec\u2013\u0159\u00edjen (l\u00e9to/podzim).<br>
  \u2022 PNO = celkov\u00e9 marketingov\u00e9 n\u00e1klady / revenue. C\u00edl: pod 20 %.
</div>

</body>
</html>`;

  // Generuj PDF přes iframe (html2canvas potřebuje viditelný renderovaný DOM)
  let frame = document.getElementById('pdf-frame');
  if (frame) frame.remove();
  frame = document.createElement('iframe');
  frame.id = 'pdf-frame';
  frame.style.cssText = 'position:fixed;left:0;top:0;width:960px;height:100vh;opacity:0;pointer-events:none;z-index:-1;';
  document.body.appendChild(frame);
  const fd = (frame as HTMLIFrameElement).contentDocument || (frame as HTMLIFrameElement).contentWindow!.document;
  fd.open(); fd.write(html); fd.close();

  // Počkej na renderování, pak generuj PDF
  setTimeout(() => {
    html2pdf().set({
      margin:       [8, 8, 8, 8],
      filename:     'demo_client_report_2026.pdf',
      image:        { type: 'jpeg', quality: 0.95 },
      html2canvas:  { scale: 2, useCORS: true, width: 920, scrollY: 0 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    }).from(fd.body).save().then(() => {
      frame!.remove();
    });
  }, 600);
}

export function showExportMenu() {
  const m = document.getElementById('export-menu')!;
  m.style.display = m.style.display === 'none' ? 'block' : 'none';
}
export function closeExportMenu() {
  document.getElementById('export-menu')!.style.display = 'none';
}
