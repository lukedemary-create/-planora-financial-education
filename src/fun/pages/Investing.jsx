import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  BookOpen, Calculator, ExternalLink, ChevronRight, ArrowRight,
  Info, CheckCircle2, AlertCircle, TrendingUp, ChevronDown, ChevronUp,
  Shield, Building, User, Landmark, Users, Layers,
  Building2, Heart, BarChart2,
} from 'lucide-react';

const TEAL  = '#00B4C6';
const NAVY  = '#f0e8d8';
const BG    = '#1a1410';
const SURF  = '#231c16';
const RAISE = '#2d2419';
const B1    = '#2a2018';
const B2    = '#3d3028';
const T2    = '#a89070';
const T3    = '#6b5540';
const UI    = "'Inter', system-ui, sans-serif";
const DISP  = "'Playfair Display', Georgia, serif";
const LIGHT = '#5BC8E2';

/* ── Shared ───────────────────────────────────────────────────────── */
function fmt(n)  { return '$' + Math.round(Math.abs(n)).toLocaleString(); }
function fmtK(n) { return n >= 1000000 ? `$${(n/1000000).toFixed(2)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${Math.round(n)}`; }

function SectionCard({ title, subtitle, children }) {
  return (
    <div style={{ background:SURF, border:`1px solid ${B1}`, borderRadius:16, padding:'1.5rem', boxShadow:'0 1px 6px rgba(0,0,0,0.05)', marginBottom:'1.25rem' }}>
      {(title||subtitle) && (
        <div style={{ marginBottom:'1.25rem' }}>
          {title && <h3 style={{ fontFamily:DISP, fontSize:'1.25rem', fontWeight:700, color:NAVY, margin:'0 0 0.25rem', letterSpacing:'-0.02em' }}>{title}</h3>}
          {subtitle && <p style={{ margin:0, fontSize:'0.875rem', color:T3, lineHeight:1.65, fontFamily:UI }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function InfoBox({ children, color = TEAL }) {
  return (
    <div style={{ display:'flex', gap:10, padding:'0.75rem 0.875rem', background:`${color}0d`, border:`1px solid ${color}25`, borderRadius:10, marginTop:'0.875rem' }}>
      <Info size={14} color={color} style={{ flexShrink:0, marginTop:2 }}/>
      <p style={{ margin:0, fontSize:'0.8125rem', color:T2, lineHeight:1.7, fontFamily:UI }}>{children}</p>
    </div>
  );
}

function NumInput({ label, value, onChange, prefix='$', suffix, min=0, step=1, hint }) {
  return (
    <div style={{ marginBottom:'1rem' }}>
      {label && <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>{label}</label>}
      <div style={{ position:'relative' }}>
        {prefix && <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:T3, fontSize:'0.875rem', pointerEvents:'none' }}>{prefix}</span>}
        <input type="number" value={value} min={min} step={step} onChange={e => onChange(Number(e.target.value))}
          style={{ width:'100%', padding:`9px ${suffix?'2.25rem':'0.75rem'} 9px ${prefix?'1.5rem':'0.75rem'}`, border:`1.5px solid ${B2}`, borderRadius:9, fontSize:'1rem', fontFamily:UI, color:NAVY, fontWeight:600, background:RAISE, boxSizing:'border-box' }}
          onFocus={e => e.target.style.borderColor=TEAL} onBlur={e => e.target.style.borderColor=B2}/>
        {suffix && <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:T3, fontSize:'0.875rem', pointerEvents:'none' }}>{suffix}</span>}
      </div>
      {hint && <p style={{ margin:'0.25rem 0 0', fontSize:'0.75rem', color:T3, fontFamily:UI }}>{hint}</p>}
    </div>
  );
}

const CustomTip = ({ active, payload, label, valueFormatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:SURF, border:`1px solid ${B1}`, borderRadius:10, padding:'0.625rem 0.875rem', boxShadow:'0 4px 16px rgba(0,0,0,0.1)', fontFamily:UI }}>
      <div style={{ fontWeight:700, color:NAVY, marginBottom:4, fontSize:'0.8125rem' }}>Year {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize:'0.8125rem', color:p.color || NAVY, display:'flex', gap:8, marginBottom:2 }}>
          <span>{p.name}:</span>
          <span style={{ fontWeight:700 }}>{valueFormatter ? valueFormatter(p.value) : fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   MASTER ACCOUNT DATA — 2026 CFP TAX TABLES
   SOURCE: CFP Board 2026 Exam Tax Reference Tables
══════════════════════════════════════════════════════════════════ */
// 2026 LTCG thresholds (single): 0% ≤$49,450 | 15% ≤$545,500 | 20% above
// 2026 LTCG thresholds (MFJ):    0% ≤$98,900  | 15% ≤$613,700 | 20% above
const ACCT_GOLD   = '#c9a96e';
const ACCT_GREEN  = '#22c55e';
const ACCT_BLUE   = '#3b82f6';
const ACCT_ORANGE = '#f97316';
const ACCT_RED    = '#ef4444';
const ACCT_PURPLE = '#a855f7';
const ACCT_AMBER  = '#f59e0b';
const ACCT_SLATE  = '#94a3b8';

const MASTER_ACCOUNTS = [
  /* ── 401(k) Traditional ─────────────────────────────────── */
  {
    key:'trad_401k', name:'401(k) — Traditional', group:'employer',
    color:ACCT_GOLD, icon:Building2,
    taxType:'Pre-Tax', taxColor:'#22c55e',
    limit:'$24,500/yr employee | $32,500 if 50–59 or 64+ | $35,750 if 60–63 (SECURE 2.0) | $70,000 total with employer',
    incomeLimit:'No income limits — available to all employees of participating employers',
    contribution:'Pre-tax dollars. Reduces your W-2 taxable income in the year contributed. Employer match may also apply (always contribute enough to capture the full match first).',
    growth:'Tax-deferred — no annual tax on dividends, interest, or capital gains. Compounds without drag.',
    withdrawal:'All withdrawals taxed as ordinary income at your rate in retirement. Treated like a paycheck from the IRS.',
    rmd:'RMDs begin at age 73 (SECURE 2.0). If still employed at plan sponsor, may delay RMDs past 73. Amount based on IRS Uniform Lifetime Table.',
    earlyPenalty:'10% penalty + ordinary income tax on withdrawals before age 59½. Exception: Rule of 55 — if you leave your employer in the year you turn 55 (50 for public safety employees), no penalty.',
    bestAssets:['Bond funds (AGG, BND, TLT)','REITs (VNQ, O, VICI)','Active mutual funds','High-dividend stocks','TIPS (inflation-protected bonds)'],
    rationale:'Tax-inefficient assets that generate ordinary income annually (bonds, REITs, active funds) benefit most from deferral. Keep them here so they compound without annual tax drag.',
    highlight:'Employer match is free money — always contribute at least enough to capture the full match before funding any other account.',
    bestFor:'Employees at companies offering a retirement plan — especially with employer matching contributions.',
    proTips:[
      'Mega Backdoor Roth: some plans allow after-tax contributions up to the $70,000 total limit — then convert to Roth (check if your plan allows in-plan Roth conversions)',
      '401k loan: can borrow up to 50% of balance or $50,000 — but if you leave your job, the loan becomes due immediately or is treated as a taxable distribution',
      'In-service distribution: some plans allow rolling to an IRA while still employed after 59½',
      'Check your plan\'s investment options and fees — if expense ratios exceed 0.5%, consider whether an IRA after the match makes more sense',
      'Roth 401k option: if your plan offers it, you can split contributions between Traditional and Roth (combined limit still $24,500)',
    ],
  },
  /* ── Roth 401(k) ─────────────────────────────────────────── */
  {
    key:'roth_401k', name:'Roth 401(k)', group:'employer',
    color:ACCT_PURPLE, icon:Heart,
    taxType:'Post-Tax', taxColor:TEAL,
    limit:'$24,500/yr — COMBINED limit with Traditional 401(k) | $32,500 if 50–59 or 64+ | $35,750 if 60–63',
    incomeLimit:'No income limits — anyone can contribute regardless of income (unlike Roth IRA)',
    contribution:'After-tax dollars. No deduction now. Taxed upfront, never again on contributions or earnings.',
    growth:'100% tax-free growth — identical tax treatment to Roth IRA.',
    withdrawal:'Contributions + earnings: tax-free after age 59½ (and 5-year rule met). Employer match portion goes to Traditional side — taxed at withdrawal.',
    rmd:'SECURE 2.0 (2024): Roth 401k RMDs eliminated — now matches Roth IRA treatment. Roll to Roth IRA upon leaving employer to eliminate RMDs entirely.',
    earlyPenalty:'10% penalty + income tax on earnings withdrawn before 59½. Contributions can be withdrawn penalty-free (like Roth IRA). Early = before 59½ and 5-year rule.',
    bestAssets:['Highest-growth assets you own — individual growth stocks, small-cap ETFs','Aggressive sector funds','Any asset you expect to grow most (gains are never taxed)'],
    rationale:'No income limit makes this the only way for high earners (above $168K single) to access new Roth contributions without the Backdoor strategy. Put your best-performing assets here.',
    highlight:'High earners above the Roth IRA income limit ($168K single / $252K MFJ) — Roth 401k is the ONLY direct path to new Roth contributions without the backdoor strategy.',
    bestFor:'High earners who exceed Roth IRA income limits, young investors expecting higher future tax brackets, anyone wanting Roth treatment with higher contribution room.',
    proTips:[
      'You can split contributions between Traditional and Roth 401k in the same year — total cannot exceed $24,500',
      'Upon leaving employer, roll Roth 401k → Roth IRA to gain more investment flexibility and eliminate RMDs',
      'Employer match always goes to the Traditional (pre-tax) side, even if your contributions are 100% Roth',
      'The 5-year clock for Roth 401k starts independently from your Roth IRA 5-year clock',
      'If you\'re in a low tax bracket now and expect to be higher in retirement, Roth 401k wins clearly',
    ],
  },
  /* ── Roth IRA ─────────────────────────────────────────────── */
  {
    key:'roth_ira', name:'Roth IRA', group:'individual',
    color:ACCT_GREEN, icon:TrendingUp,
    taxType:'Post-Tax', taxColor:TEAL,
    limit:'$7,500/yr | $8,600 if 50+ (2026 CFP) — income limits apply',
    incomeLimit:'Phase-out: $153,000–$168,000 single | $242,000–$252,000 MFJ (2026). Above limit: use Backdoor Roth strategy.',
    contribution:'After-tax dollars. No deduction today. The tax cost is paid now — never again.',
    growth:'100% tax-free. No annual tax on dividends, interest, or capital gains. Compounds entirely untouched.',
    withdrawal:'Contributions: withdraw anytime, any age — no tax, no penalty. Earnings: tax-free after 59½ AND 5-year rule met.',
    rmd:'No RMDs during the owner\'s lifetime. Money can compound indefinitely — ideal for wealth transfer and estate planning.',
    earlyPenalty:'Contributions withdrawn early: no penalty ever. Earnings withdrawn before 59½ or 5-yr rule: 10% penalty + income tax. Exceptions: disability, first home ($10K lifetime), substantially equal payments.',
    bestAssets:['Individual growth stocks (highest upside — gains never taxed)','Small-cap and emerging market ETFs','Aggressive REITs','High-growth sector funds','Any investment with the greatest expected long-term gain'],
    rationale:"Put your highest-growth assets here. A stock that 10x's inside a Roth IRA = zero tax ever on those gains. The tax-free compounding is most powerful on assets with the greatest upside.",
    highlight:'The most flexible account in personal finance — contributions can be withdrawn anytime penalty-free, no RMDs, no age restrictions on contributions, and no taxes on earnings in retirement.',
    bestFor:'Young investors, those expecting higher future tax rates, high earners using Backdoor Roth, anyone who values flexibility and tax-free wealth transfer.',
    proTips:[
      'Backdoor Roth: contribute to a non-deductible Traditional IRA then convert. No income limit on conversions. Watch for the pro-rata rule if you have existing pre-tax IRA balances.',
      '5-year rule: the Roth IRA must have been open at least 5 years for earnings to be tax-free at withdrawal — open one as early as possible even if funding is minimal',
      'Roth conversion ladder: convert Traditional IRA/401k to Roth in low-income years (career break, early retirement) — each conversion is penalty-free after 5 years',
      'Fund your Roth IRA before January 1st to maximize years of tax-free compounding — you have until tax filing deadline (April 15) to contribute for the prior year',
      'Inherited Roth IRAs (non-spouse): must empty within 10 years, but all distributions remain tax-free',
    ],
  },
  /* ── Traditional IRA ─────────────────────────────────────── */
  {
    key:'trad_ira', name:'Traditional IRA', group:'individual',
    color:ACCT_BLUE, icon:BookOpen,
    taxType:'Pre-Tax*', taxColor:'#22c55e',
    limit:'$7,500/yr | $8,600 if 50+ (2026 CFP) — no income limit to contribute',
    incomeLimit:'Deductibility phases out if covered by a workplace plan: $81,000–$87,000 single | $129,000–$143,000 MFJ (2026 est.). Anyone can contribute — income limits only affect deductibility.',
    contribution:'Pre-tax if deductible (reduces taxable income now). After-tax (non-deductible) if above deductibility threshold — still grows tax-deferred.',
    growth:'Tax-deferred — no annual tax on dividends, interest, or capital gains inside the account.',
    withdrawal:'All withdrawals taxed as ordinary income at your rate in retirement (for deductible contributions). Non-deductible contributions: basis is tax-free, earnings taxed.',
    rmd:'RMDs begin at age 73 (SECURE 2.0). Amount calculated annually from IRS Uniform Lifetime Table based on account balance and life expectancy.',
    earlyPenalty:'10% penalty + ordinary income tax on withdrawals before 59½. Exceptions: first home purchase ($10K lifetime), disability, death, substantially equal payments (72t), unreimbursed medical expenses >7.5% AGI.',
    bestAssets:['Bond funds (defer ordinary income tax)','REITs (defer ordinary income from REIT dividends)','High-dividend funds','Active mutual funds (prevent annual capital gain distributions from hitting your return)'],
    rationale:'Bond interest and REIT dividends are taxed as ordinary income each year in a taxable account. Holding them in a Traditional IRA defers that tax entirely until retirement when you may be in a lower bracket.',
    highlight:'Deductibility phases out at $81K–$87K (single) if you have a workplace plan — but anyone can contribute regardless of income. Non-deductible contributions still grow tax-deferred.',
    bestFor:'People without a 401(k) or earning below the deductibility threshold, those doing Roth conversions, high earners doing Backdoor Roth.',
    proTips:[
      "Non-deductible contributions create 'basis' — track it on IRS Form 8606 every year or you'll pay taxes twice on the same money",
      '401k rollover to IRA: penalty-free. Strategy when changing jobs to consolidate accounts and gain better investment options',
      'Roth conversion: convert Traditional IRA balances to Roth in low-income years — pay income tax now at a lower rate, then never again',
      'Pro-rata rule: if you have both deductible and non-deductible IRA balances, each conversion is partially taxable proportionally — can complicate Backdoor Roth',
      'Unlike Roth, heirs pay ordinary income tax on inherited Traditional IRA distributions (10-year rule for non-spouse beneficiaries)',
    ],
  },
  /* ── HSA ─────────────────────────────────────────────────── */
  {
    key:'hsa', name:'HSA', group:'individual',
    color:ACCT_PURPLE, icon:Shield,
    taxType:'Triple Tax Advantage', taxColor:'#8b5cf6',
    limit:'$4,400 self-only | $8,750 family (2026 CFP) | +$1,000 catch-up if 55+',
    incomeLimit:'Must be enrolled in a High-Deductible Health Plan (HDHP). 2026 HDHP minimums: $1,650 deductible (self) / $3,300 (family). Cannot contribute if enrolled in Medicare.',
    contribution:'Pre-tax via payroll OR tax-deductible if contributed directly. No FICA tax on payroll contributions (unique among retirement accounts).',
    growth:'100% tax-free growth on all invested assets — dividends, interest, and capital gains never taxed.',
    withdrawal:'Tax-free for qualified medical expenses at any age. After age 65: withdraw for any purpose — taxed as ordinary income (functions like a Traditional IRA). Before 65 for non-medical: 20% penalty + income tax.',
    rmd:'No RMDs ever. Funds roll over year to year — no "use it or lose it." Balance can compound indefinitely if you pay medical costs out-of-pocket.',
    earlyPenalty:'Non-medical withdrawal before 65: 20% penalty + ordinary income tax. After 65: no penalty, just income tax (like a Traditional IRA). No penalty for withdrawals for qualified medical expenses at any age.',
    bestAssets:['Growth ETFs and stocks (gains never taxed if used for medical)','Broad market index funds','Any high-growth investment — triple tax advantage maximizes benefit of appreciation'],
    rationale:'The HSA is the only account with a triple tax advantage: pre-tax in, tax-free growth, tax-free out for medical. Invest the balance rather than spending it — pay medical costs out-of-pocket to preserve the tax-free compounding.',
    highlight:"The only account with a triple tax advantage. Invest the balance — don't let it sit in cash. Pay medical expenses out-of-pocket now and preserve the tax-free compounding for retirement.",
    bestFor:'Anyone with an HDHP who can afford to pay current medical costs out-of-pocket and invest the HSA balance. Particularly powerful as a stealth retirement account for high earners.',
    proTips:[
      'Invest the full HSA balance — most providers offer investment options once balance exceeds $1,000–$2,000. Cash earns almost nothing.',
      'Save all medical receipts permanently — there is no time limit to reimburse yourself. You can contribute now and reimburse yourself from the HSA for old expenses years later.',
      'After 65, HSA functions like a Traditional IRA for non-medical withdrawals — no penalty, just income tax. It becomes a second retirement account.',
      'FICA tax savings: payroll HSA contributions avoid Social Security and Medicare taxes (2.9–7.65% savings) — direct contributions do not get this benefit.',
      'Spousal HSA strategy: contribute to both spouses\' HSAs to maximize limits. Surviving spouse inherits HSA tax-free.',
    ],
  },
  /* ── 529 Plan ────────────────────────────────────────────── */
  {
    key:'plan529', name:'529 Education Plan', group:'individual',
    color:ACCT_AMBER, icon:Users,
    taxType:'Post-Tax (state deduction)', taxColor:'#f59e0b',
    limit:'No annual limit. Gift tax annual exclusion: $19,000/yr per beneficiary (2026). Superfunding: 5-year front-loading = $95,000 lump sum per beneficiary without gift tax.',
    incomeLimit:'No income limits — anyone can open and contribute regardless of income.',
    contribution:'After-tax federal dollars. No federal deduction. Most states offer a state income tax deduction for contributions (varies by state).',
    growth:'Tax-free — all dividends, interest, and capital gains inside the account grow untaxed.',
    withdrawal:'Tax-free for qualified education expenses: tuition (K-12 up to $10K/yr; college unlimited), room & board, books, supplies, fees. Non-qualified: 10% penalty + income tax on earnings only.',
    rmd:'No RMDs. Funds can be kept indefinitely. Beneficiary can be changed to another family member at any time with no tax consequence.',
    earlyPenalty:'Non-qualified withdrawals: 10% penalty + ordinary income tax on the earnings portion only (contributions are never penalized — you already paid tax on them).',
    bestAssets:['Age-based index fund portfolios (many plans offer automatic glide paths)','Broad market index funds when beneficiary is young','Conservative/bond funds as college approaches'],
    rationale:'Tax-free growth on education savings. The earlier you open and fund it, the more years of tax-free compounding you get. State deductions make contributions often immediately tax-beneficial.',
    highlight:"SECURE 2.0: unused 529 funds can now be rolled to a Roth IRA for the beneficiary — lifetime max $35,000, 15-year rule, Roth IRA annual limits apply. This eliminates the 'overfunding' risk.",
    bestFor:"Parents saving for children's education — open one when the child is born to maximize growth years. Also useful for graduate school or adult education.",
    proTips:[
      'Superfunding: contribute 5 years of annual exclusion gifts at once ($95,000 per beneficiary in 2026) — removes the lump sum from your estate immediately with no gift tax',
      'SECURE 2.0 Roth rollover: after 15 years, unused 529 funds → Roth IRA for beneficiary (lifetime max $35K, subject to Roth IRA annual limits)',
      'Change beneficiary to any family member (siblings, cousins, even yourself) if original beneficiary doesn\'t need it — no taxes or penalties',
      'Many states give deductions for any state\'s 529 plan; some require contributions to their own state\'s plan — check your state\'s rules before choosing',
      'Room and board is qualified only if the student is enrolled at least half-time. Keep receipts.',
    ],
  },
  /* ── Taxable Brokerage ───────────────────────────────────── */
  {
    key:'brokerage', name:'Taxable Brokerage', group:'individual',
    color:ACCT_ORANGE, icon:BarChart2,
    taxType:'Taxable', taxColor:'#6b7280',
    limit:'Unlimited — no contribution caps, no income limits, no restrictions.',
    incomeLimit:'None. Available to anyone at any age with no restrictions.',
    contribution:'After-tax dollars. No deduction, no tax benefit at contribution.',
    growth:'Partially taxable each year: dividends and interest taxed in the year earned. Capital gains taxed only when you sell. Index ETFs minimize annual distributions.',
    withdrawal:'Withdraw anytime — no age restrictions, no penalties, no RMDs. Complete flexibility.',
    rmd:'No RMDs ever. Withdraw on your schedule. Assets can be held indefinitely.',
    earlyPenalty:'No penalties of any kind at any age. Sell whenever you want. Capital gains tax applies but no penalty surcharge.',
    bestAssets:['Tax-efficient index ETFs (SPY, VTI, QQQ, SCHB) — minimal capital gain distributions','Growth stocks held long-term (LTCG rates: 0% ≤$49,450, 15% ≤$545,500, 20% above — 2026 single filer)','Municipal bonds (federally tax-exempt interest)','Buy-and-hold individual stocks — defer gains indefinitely'],
    rationale:'Tax efficiency is everything here. Index ETFs rarely distribute capital gains (unlike active funds). Growth stocks held over 1 year qualify for long-term capital gains rates (0–20%) vs ordinary income (up to 37%). The less you sell, the less you pay.',
    highlight:'Essential after you\'ve maxed all tax-advantaged accounts. Step-up in basis at death eliminates all embedded capital gains for heirs — the most powerful estate planning feature of any taxable account.',
    bestFor:'Anyone who has maxed tax-advantaged accounts, needs flexibility before retirement age, or is saving toward goals with no timeline restrictions.',
    proTips:[
      'Tax-loss harvesting: sell a losing position to realize a deductible loss, immediately buy a similar (not substantially identical) ETF — wash-sale rule is 30 days',
      "Step-up in basis at death: heirs receive cost basis = fair market value on date of death. Pre-death capital gains are permanently eliminated — don't sell appreciated assets you plan to leave to heirs",
      '2026 LTCG rates (single): 0% on gains if income ≤$49,450 | 15% up to $545,500 | 20% above. Married filing jointly: 0% ≤$98,900 | 15% ≤$613,700 | 20% above',
      'Qualified dividends (held 60+ days) are taxed at LTCG rates, not ordinary income — most major U.S. stock dividends qualify',
      'NIIT (Net Investment Income Tax): 3.8% additional tax on investment income if modified AGI exceeds $200K single / $250K MFJ',
    ],
  },
  /* ── SEP IRA ─────────────────────────────────────────────── */
  {
    key:'sep_ira', name:'SEP IRA', group:'self-employed',
    color:ACCT_GOLD, icon:Landmark,
    taxType:'Pre-Tax', taxColor:'#22c55e',
    limit:'25% of compensation OR $70,000 (2026 est.) — whichever is less. Employer (self) contributions only.',
    incomeLimit:'No income limits. Available to self-employed individuals, freelancers, sole proprietors, and small business owners.',
    contribution:'Employer contributions only — you are both the employer and employee as a self-employed person. Contributions are made from business income and are tax-deductible.',
    growth:'Tax-deferred — identical to Traditional IRA. No annual tax on gains inside the account.',
    withdrawal:'All withdrawals taxed as ordinary income. No special treatment for any asset class.',
    rmd:'RMDs begin at age 73 — same rules as Traditional IRA. Amount based on IRS Uniform Lifetime Table.',
    earlyPenalty:'10% penalty + ordinary income tax on withdrawals before 59½. Same exceptions as Traditional IRA.',
    bestAssets:['Bond funds and REITs (defer ordinary income)','Active funds (avoid annual distributions)','High-dividend funds — assets that would otherwise generate taxable income each year'],
    rationale:'Same asset location logic as a Traditional IRA. Hold tax-inefficient assets here to defer ordinary income. The large contribution limit makes this a powerful wealth-building tool for high-earning self-employed individuals.',
    highlight:'The simplest high-contribution retirement account for self-employed. Contribution deadline is your tax filing deadline including extensions — giving you until October 15 to decide.',
    bestFor:'Freelancers and self-employed with high income who want maximum contribution room with minimal administrative complexity.',
    proTips:[
      'Contribution is discretionary each year — you can contribute $0 in a bad year without penalty. Ideal for variable income businesses.',
      'If you have employees, you must contribute the same percentage of compensation to their SEP IRAs as you contribute for yourself',
      'Solo 401k advantage: for most self-employed, a Solo 401k allows higher contributions at lower income levels than a SEP IRA — compare before choosing',
      'Contribution deadline flexibility: if you extend your tax return, you have until October 15 to fund the SEP IRA for the prior year',
      'No catch-up contributions for age 50+ (unlike IRA and 401k) — a key limitation compared to other accounts',
    ],
  },
  /* ── SIMPLE IRA ──────────────────────────────────────────── */
  {
    key:'simple_ira', name:'SIMPLE IRA', group:'self-employed',
    color:ACCT_SLATE, icon:Layers,
    taxType:'Pre-Tax', taxColor:'#22c55e',
    limit:'$17,000/yr employee deferrals | $21,000 if 50–59 or 64+ | $22,250 if 60–63 (SECURE 2.0). Employer: 2–3% match OR 2% non-elective.',
    incomeLimit:'Available to businesses with 100 or fewer employees who earned at least $5,000 in the previous year.',
    contribution:'Employee elective deferrals (pre-tax) + mandatory employer contributions. Employer must choose: dollar-for-dollar match up to 3% of compensation, or 2% non-elective for all eligible employees.',
    growth:'Tax-deferred — same as Traditional IRA and 401k.',
    withdrawal:'Withdrawals taxed as ordinary income. No special treatment.',
    rmd:'RMDs begin at age 73 — same as Traditional IRA/401k.',
    earlyPenalty:'Before 59½: 10% penalty + income tax. Critical exception: within the first 2 years of participation, early withdrawal penalty is 25% (not 10%). After 2 years, reverts to standard 10%.',
    bestAssets:['Bond funds','REITs','Active mutual funds — same tax-inefficient assets as Traditional IRA/401k'],
    rationale:'Same logic as Traditional IRA — hold tax-inefficient assets to defer ordinary income. Primary advantage is mandatory employer contributions, which add to your balance beyond your own deferrals.',
    highlight:'25% early withdrawal penalty in the first 2 years of participation — much steeper than other accounts. Do not contribute funds you may need before the 2-year mark.',
    bestFor:'Small business owners (≤100 employees) who want a simple retirement plan structure with required employer contributions.',
    proTips:[
      'Cannot have other qualified retirement plans simultaneously in most cases — the SIMPLE must be the only plan',
      'The mandatory employer match/contribution is a significant benefit — employees receive free money on top of their own deferrals',
      'Transfer rules: after 2 years, can roll to Traditional IRA or another employer plan penalty-free',
      'Lower contribution limits than Solo 401k or SEP IRA — if income is high, other self-employed options typically win',
      'Salary reduction agreement must be in place before the plan year begins — cannot start mid-year for an existing business',
    ],
  },
];

const GROUP_LABELS = { employer:'Employer-Sponsored', individual:'Individual', 'self-employed':'Self-Employed' };

/* ── AccInfoBox helper ───────────────────────────────────────────── */
function AccInfoBox({ label, value, color }) {
  return (
    <div style={{ padding:'0.5rem 0.75rem', background:RAISE, borderRadius:8, border:`1px solid ${B1}` }}>
      <div style={{ fontSize:'0.5rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color, marginBottom:4, fontFamily:UI }}>{label}</div>
      <div style={{ fontSize:'0.6875rem', color:T2, lineHeight:1.55, fontFamily:UI }}>{value}</div>
    </div>
  );
}

/* ── Unified account master section ─────────────────────────────── */
function AccountMasterSection() {
  const [filter, setFilter] = useState('all');
  const [open, setOpen]     = useState(null);
  const groups = ['employer', 'individual', 'self-employed'];
  const shown  = filter === 'all' ? MASTER_ACCOUNTS : MASTER_ACCOUNTS.filter(a => a.group === filter);

  return (
    <div>
      {/* ── Filter pills ── */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {['all', ...groups].map(g => (
          <button key={g} onClick={() => { setFilter(g); setOpen(null); }} style={{
            padding:'5px 14px', borderRadius:100,
            border:`1.5px solid ${filter===g ? TEAL : B1}`,
            background: filter===g ? 'rgba(0,180,198,0.1)' : RAISE,
            color: filter===g ? TEAL : T2, fontSize:'0.8125rem',
            fontWeight: filter===g ? 700 : 500, cursor:'pointer', fontFamily:UI, transition:'all 0.13s',
          }}>
            {g === 'all' ? 'All Accounts' : GROUP_LABELS[g]}
          </button>
        ))}
      </div>

      {/* ── Accordion list ── */}
      <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
        {shown.map(a => {
          const Icon   = a.icon;
          const isOpen = open === a.key;
          return (
            <div key={a.key} style={{
              border:`1.5px solid ${isOpen ? a.color+'55' : B1}`,
              borderRadius:12, overflow:'hidden', transition:'border-color 0.15s',
            }}>
              {/* ── Row header ── */}
              <button
                onClick={() => setOpen(isOpen ? null : a.key)}
                style={{
                  width:'100%', background: isOpen ? `${a.color}08` : SURF,
                  border:'none', cursor:'pointer', textAlign:'left',
                  padding:'0.875rem 1rem', display:'flex', alignItems:'center', gap:'0.875rem',
                  transition:'background 0.15s',
                }}
              >
                <Icon size={18} color={isOpen ? a.color : T3} style={{ flexShrink:0, transition:'color 0.15s' }}/>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap', marginBottom:3 }}>
                    <span style={{ fontFamily:DISP, fontSize:'0.9375rem', fontWeight:700, color:NAVY }}>{a.name}</span>
                    <span style={{ padding:'2px 9px', background:`${a.taxColor}15`, border:`1px solid ${a.taxColor}35`, borderRadius:100, fontSize:'0.625rem', fontWeight:700, color:a.taxColor, fontFamily:UI }}>{a.taxType}</span>
                    <span style={{ padding:'2px 8px', background:'rgba(255,255,255,0.04)', border:`1px solid ${B1}`, borderRadius:100, fontSize:'0.5625rem', fontWeight:600, color:T3, fontFamily:UI, textTransform:'uppercase', letterSpacing:'0.06em' }}>{GROUP_LABELS[a.group]}</span>
                  </div>
                  <div style={{ fontSize:'0.8125rem', color:T3, fontFamily:UI }}>
                    <span style={{ fontWeight:600, color:T2 }}>{a.limit}</span>
                  </div>
                </div>
                {isOpen
                  ? <ChevronUp size={16} color={a.color}/>
                  : <ChevronDown size={16} color="#9ca3af"/>}
              </button>

              {/* ── Expanded detail ── */}
              {isOpen && (
                <div style={{ borderTop:`1px solid ${a.color}20`, padding:'1rem 1.25rem', background:'#1e1912' }}>

                  {/* Key Insight */}
                  <div style={{ display:'flex', gap:8, marginBottom:'1rem', padding:'0.625rem 0.875rem', background:`${a.color}09`, border:`1px solid ${a.color}22`, borderRadius:9 }}>
                    <TrendingUp size={13} color={a.color} style={{ flexShrink:0, marginTop:2 }}/>
                    <p style={{ margin:0, fontSize:'0.8125rem', fontWeight:600, color:NAVY, lineHeight:1.6, fontFamily:UI }}>{a.highlight}</p>
                  </div>

                  {/* Tax Timeline */}
                  <div style={{ marginBottom:'1rem' }}>
                    <div style={{ fontSize:'0.5625rem', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:T3, marginBottom:'0.5rem', fontFamily:UI }}>Tax Timeline</div>
                    <div style={{ display:'flex', alignItems:'stretch' }}>
                      {[
                        { label:'CONTRIBUTION', detail:a.contribution, step:1 },
                        { label:'GROWTH PHASE', detail:a.growth, step:2 },
                        { label:'WITHDRAWAL',   detail:a.withdrawal,   step:3 },
                      ].map((s, i) => {
                        const free  = s.detail.toLowerCase().includes('tax-free') || s.detail.toLowerCase().includes('never taxed');
                        const pre   = s.detail.toLowerCase().includes('pre-tax');
                        const after = s.detail.toLowerCase().includes('after-tax') && i === 0;
                        const taxed = s.detail.toLowerCase().includes('taxed') && !free;
                        const c = free ? ACCT_GREEN : after ? ACCT_ORANGE : pre ? ACCT_GOLD : taxed ? ACCT_ORANGE : ACCT_BLUE;
                        return (
                          <div key={i} style={{
                            flex:1, padding:'0.625rem 0.75rem',
                            background:`${c}07`, border:`1px solid ${c}28`,
                            borderRadius: i===0 ? '7px 0 0 7px' : i===2 ? '0 7px 7px 0' : '0',
                            borderLeft: i > 0 ? 'none' : undefined,
                          }}>
                            <div style={{ fontSize:'0.45rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:c, marginBottom:4, fontFamily:UI }}>
                              Step {s.step}: {s.label}
                            </div>
                            <div style={{ fontSize:'0.5625rem', color:T2, lineHeight:1.55, fontFamily:UI }}>{s.detail}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rules Grid */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:'1rem' }}>
                    <AccInfoBox label="Income / Eligibility" value={a.incomeLimit} color={a.color}/>
                    <AccInfoBox label="RMD Rules" value={a.rmd} color={ACCT_ORANGE}/>
                    <AccInfoBox label="Early Withdrawal (before 59½)" value={a.earlyPenalty} color={ACCT_RED}/>
                    <AccInfoBox label="Best Assets To Hold Here" value={a.bestAssets.join(' · ')} color={ACCT_GREEN}/>
                  </div>

                  {/* Rationale */}
                  <div style={{ padding:'0.75rem 0.875rem', background:`${a.color}07`, border:`1px solid ${a.color}1e`, borderRadius:8, marginBottom:'0.875rem' }}>
                    <div style={{ fontSize:'0.5rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:a.color, marginBottom:4, fontFamily:UI }}>Why Hold These Assets Here?</div>
                    <div style={{ fontSize:'0.6875rem', color:T2, lineHeight:1.65, fontFamily:UI }}>{a.rationale}</div>
                  </div>

                  {/* Best For */}
                  <div style={{ padding:'0.5rem 0.875rem', background:'rgba(0,180,198,0.07)', border:'1px solid rgba(0,180,198,0.18)', borderRadius:8, marginBottom:'0.875rem', display:'flex', gap:8, alignItems:'flex-start' }}>
                    <CheckCircle2 size={13} color={TEAL} style={{ flexShrink:0, marginTop:2 }}/>
                    <div style={{ fontSize:'0.6875rem', fontFamily:UI }}>
                      <span style={{ fontWeight:700, color:NAVY }}>Best for: </span>
                      <span style={{ color:T2 }}>{a.bestFor}</span>
                    </div>
                  </div>

                  {/* Pro Tips */}
                  <div style={{ fontSize:'0.5rem', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:T3, marginBottom:'0.5rem', fontFamily:UI }}>Pro Tips</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {a.proTips.map((t, i) => (
                      <div key={i} style={{ display:'flex', gap:7, alignItems:'flex-start' }}>
                        <div style={{ width:4, height:4, borderRadius:'50%', background:a.color, flexShrink:0, marginTop:6 }}/>
                        <div style={{ fontSize:'0.6875rem', color:T2, lineHeight:1.55, fontFamily:UI }}>{t}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════
   LEARN — Funding Waterfall
══════════════════════════════════════════════════════════════════ */
const WATERFALL_STEPS = [
  { n:1, title:'Capture the full employer 401(k) match', color:'#22c55e', badge:'Always first', desc:'A 50–100% instant return on your contribution. No investment beats free money. If your employer matches 4%, contribute at least 4%.' },
  { n:2, title:'Max your HSA (if you have an HDHP)', color:'#8b5cf6', badge:'Triple tax win', desc:'Triple tax advantage: pre-tax in, tax-free growth, tax-free out for medical. After 65 it works like a Traditional IRA. Invest the balance — don\'t let it sit in cash.' },
  { n:3, title:'Max your Roth IRA', color:TEAL, badge:'$7,500/yr', desc:'Tax-free growth forever, no RMDs, and you can withdraw contributions anytime. Backdoor Roth available if you earn too much. The most flexible retirement account there is.' },
  { n:4, title:'Maximize your 401(k)', color:'#3b82f6', badge:'$24,500/yr', desc:'After maxing the Roth IRA, go back and max the 401(k). Whether Traditional or Roth depends on your current vs future tax situation.' },
  { n:5, title:'Taxable brokerage account', color:T3, badge:'No limit', desc:'No tax advantages, but no restrictions either. Use tax-efficient funds (index ETFs), harvest losses strategically, and hold for long-term capital gains rates.' },
];

function FundingWaterfall() {
  return (
    <div>
      <p style={{ fontSize:'0.875rem', color:T3, marginBottom:'1.5rem', lineHeight:1.7, fontFamily:UI }}>
        When you have money to invest, <em>where</em> you put it matters as much as <em>how much</em>. Follow this priority order to maximize every tax advantage before moving to the next step.
      </p>
      <div style={{ position:'relative' }}>
        {WATERFALL_STEPS.map((s, i) => (
          <div key={i} style={{ display:'flex', gap:'1rem', marginBottom: i < WATERFALL_STEPS.length-1 ? 0 : 0, position:'relative' }}>
            {/* Left: number + connector */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:40, flexShrink:0 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:s.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1rem', fontFamily:UI, zIndex:1, boxShadow:`0 2px 8px ${s.color}50` }}>
                {s.n}
              </div>
              {i < WATERFALL_STEPS.length - 1 && (
                <div style={{ width:2, flex:1, background:`linear-gradient(${s.color}, ${WATERFALL_STEPS[i+1].color})`, minHeight:32, margin:'4px 0' }}/>
              )}
            </div>
            {/* Right: content */}
            <div style={{ flex:1, paddingBottom: i < WATERFALL_STEPS.length-1 ? '1rem' : 0, paddingTop:4 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.375rem', flexWrap:'wrap' }}>
                <span style={{ fontFamily:DISP, fontSize:'0.9375rem', fontWeight:700, color:NAVY }}>{s.title}</span>
                <span style={{ padding:'2px 9px', background:`${s.color}18`, border:`1px solid ${s.color}35`, borderRadius:100, fontSize:'0.6875rem', fontWeight:700, color:s.color, fontFamily:UI }}>{s.badge}</span>
              </div>
              <p style={{ margin:0, fontSize:'0.8125rem', color:T3, lineHeight:1.7, fontFamily:UI }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEARN — Asset Classes
══════════════════════════════════════════════════════════════════ */
const ASSETS = [
  { name:'Stocks (Equities)', icon: TrendingUp, risk:'High', return:'High (7–10% historical avg)', color:TEAL, desc:'Ownership shares in a company. Highest long-term return potential but most volatile. Best held in diversified funds, not individual picks.', examples:'S&P 500 index funds, growth ETFs, dividend stocks', tip:'Over any 20-year period in history, the S&P 500 has never lost money.' },
  { name:'Bonds (Fixed Income)', icon: Landmark, risk:'Low–Medium', return:'Low–Medium (2–5%)', color:'#3b82f6', desc:'Loans to governments or corporations that pay regular interest. Lower returns than stocks but provide stability and income. Critical for retirees and conservative investors.', examples:'US Treasury bonds, municipal bonds, corporate bond ETFs', tip:'When interest rates rise, bond prices fall — and vice versa. Duration risk matters.' },
  { name:'ETFs (Exchange-Traded Funds)', icon: Layers, risk:'Varies', return:'Mirrors underlying index', color:'#8b5cf6', desc:'Baskets of securities that trade like stocks on an exchange. Usually track an index (S&P 500, total market, bonds). Low costs, instant diversification, tax-efficient.', examples:'VTI, VOO, BND, QQQ, SPY', tip:'A single total market ETF (like VTI) gives you 3,700+ stocks in one trade for 0.03% per year.' },
  { name:'Mutual Funds', icon: Users, risk:'Varies', return:'Varies by type', color:'#f59e0b', desc:'Pooled investment vehicles that are priced once per day at close. Most are actively managed — attempting to beat the market. Evidence shows most underperform index funds over time.', examples:'Fidelity 500 Index Fund (FXAIX), American Funds Growth Fund', tip:'Check the expense ratio. A 1% fund costs 10x more than a 0.1% index fund over 30 years.' },
  { name:'REITs (Real Estate Investment Trusts)', icon: Building, risk:'Medium–High', return:'Medium–High (5–8%)', color:'#ef4444', desc:'Companies that own income-producing real estate. Must distribute 90%+ of taxable income as dividends. Provides real estate exposure without buying property. Highly liquid.', examples:'VNQ (Vanguard REIT ETF), O (Realty Income), Simon Property Group', tip:'REITs often generate ordinary income dividends (taxed as income) — best held in tax-advantaged accounts.' },
];

function AssetClasses() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
      {ASSETS.map((a, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{ border:`1.5px solid ${isOpen ? a.color+'50' : '#2a2018'}`, borderRadius:12, overflow:'hidden', transition:'border-color 0.15s' }}>
            <button onClick={() => setOpen(isOpen ? null : i)} style={{ width:'100%', background:isOpen?`${a.color}10`:'#231c16', border:'none', cursor:'pointer', textAlign:'left', padding:'0.875rem 1rem', display:'flex', alignItems:'center', gap:'0.875rem' }}>
              {(() => { const AI = a.icon; return <AI size={22} color={a.color} />; })()}
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap', marginBottom:3 }}>
                  <span style={{ fontFamily:DISP, fontSize:'0.9375rem', fontWeight:700, color:NAVY }}>{a.name}</span>
                </div>
                <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'0.75rem', fontFamily:UI, color:T3 }}>Risk: <strong style={{ color: a.risk==='Low–Medium'?'#22c55e':a.risk==='Medium–High'?'#f59e0b':a.risk==='High'?'#ef4444':a.color }}>{a.risk}</strong></span>
                  <span style={{ fontSize:'0.75rem', color:T3 }}>·</span>
                  <span style={{ fontSize:'0.75rem', fontFamily:UI, color:T3 }}>Return: <strong style={{ color:NAVY }}>{a.return}</strong></span>
                </div>
              </div>
              {isOpen ? <ChevronUp size={15} color={TEAL}/> : <ChevronDown size={15} color="#9ca3af"/>}
            </button>
            {isOpen && (
              <div style={{ borderTop:'1px solid #2a2018', padding:'0.875rem 1rem', background:'#1e1912' }}>
                <p style={{ margin:'0 0 0.625rem', fontSize:'0.875rem', color:T2, lineHeight:1.7, fontFamily:UI }}>{a.desc}</p>
                <div style={{ fontSize:'0.8125rem', color:T3, fontFamily:UI, marginBottom:'0.625rem' }}>
                  <strong style={{ color:NAVY }}>Examples:</strong> {a.examples}
                </div>
                <div style={{ display:'flex', gap:7, padding:'0.5rem 0.75rem', background:`${a.color}0d`, borderRadius:8 }}>
                  <Info size={12} color={a.color} style={{ flexShrink:0, marginTop:2 }}/>
                  <p style={{ margin:0, fontSize:'0.8rem', color:T2, lineHeight:1.6, fontFamily:UI }}><strong>Key insight:</strong> {a.tip}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEARN — Risk Tolerance Quiz
══════════════════════════════════════════════════════════════════ */
const QUIZ = [
  {
    q: 'When do you expect to need this money?',
    opts: [
      { label:'Within 5 years', pts:0 },
      { label:'5–10 years',     pts:2 },
      { label:'10–20 years',    pts:4 },
      { label:'20+ years',      pts:6 },
    ],
  },
  {
    q: 'If your portfolio dropped 30% in a market crash, you would:',
    opts: [
      { label:'Sell — I can\'t handle that loss', pts:0 },
      { label:'Worry a lot, but hold',            pts:2 },
      { label:'Stay the course calmly',           pts:4 },
      { label:'Buy more — great opportunity',     pts:6 },
    ],
  },
  {
    q: 'Your primary investment goal is:',
    opts: [
      { label:'Preserve my capital — safety first',      pts:0 },
      { label:'Modest growth with limited downside',     pts:2 },
      { label:'Strong growth — I can handle volatility', pts:4 },
    ],
  },
  {
    q: 'Your investment experience level:',
    opts: [
      { label:'None — just starting out', pts:0 },
      { label:'Some — I understand basics', pts:1 },
      { label:'Experienced — comfortable with markets', pts:2 },
    ],
  },
];

const ALLOCATIONS = [
  {
    label:'Conservative',   range:[0,5],  color:'#3b82f6',
    stocks:25, bonds:55, cash:20,
    desc:'Prioritizes stability over growth. Suitable for short time horizons or very low risk tolerance.',
  },
  {
    label:'Moderately Conservative', range:[6,8], color:'#8b5cf6',
    stocks:45, bonds:45, cash:10,
    desc:'Some growth with significant downside protection. Good for 5–10 year horizons.',
  },
  {
    label:'Moderate',       range:[9,12], color:TEAL,
    stocks:60, bonds:35, cash:5,
    desc:'Balanced between growth and stability. The classic 60/40 portfolio. Suitable for most investors.',
  },
  {
    label:'Moderately Aggressive', range:[13,15], color:'#f59e0b',
    stocks:75, bonds:20, cash:5,
    desc:'Growth-oriented with some ballast. Good for 10–20 year horizons with above-average risk tolerance.',
  },
  {
    label:'Aggressive',     range:[16,20], color:'#22c55e',
    stocks:90, bonds:7, cash:3,
    desc:'Maximum growth focus. Suitable for 20+ year horizons and investors who won\'t panic during market crashes.',
  },
];

function RiskQuiz() {
  const [answers, setAnswers] = useState({});
  const [done,    setDone]    = useState(false);

  const total = Object.values(answers).reduce((s, v) => s + v, 0);
  const alloc = done ? ALLOCATIONS.find(a => total >= a.range[0] && total <= a.range[1]) || ALLOCATIONS[2] : null;

  const pieData = alloc ? [
    { name:'Stocks', value:alloc.stocks, color:alloc.color },
    { name:'Bonds',  value:alloc.bonds,  color:'#3b82f6'   },
    { name:'Cash',   value:alloc.cash,   color:'#94a3b8'   },
  ] : [];

  function pick(qi, pts) {
    const updated = { ...answers, [qi]: pts };
    setAnswers(updated);
    if (Object.keys(updated).length === QUIZ.length) setDone(true);
  }

  function reset() { setAnswers({}); setDone(false); }

  return (
    <div>
      {!done ? (
        <>
          <p style={{ fontSize:'0.875rem', color:T3, marginBottom:'1.25rem', lineHeight:1.65, fontFamily:UI }}>
            Answer 4 questions to get a personalized asset allocation suggestion.
          </p>
          {QUIZ.map((q, qi) => (
            <div key={qi} style={{ marginBottom:'1.25rem' }}>
              <div style={{ fontSize:'0.875rem', fontWeight:700, color:NAVY, marginBottom:'0.625rem', fontFamily:UI }}>
                {qi + 1}. {q.q}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
                {q.opts.map((o, oi) => {
                  const sel = answers[qi] === o.pts;
                  return (
                    <button key={oi} onClick={() => pick(qi, o.pts)} style={{
                      padding:'0.625rem 0.875rem', background: sel ? 'rgba(0,180,198,0.1)' : '#231c16',
                      border:`1.5px solid ${sel ? TEAL : '#2a2018'}`, borderRadius:9,
                      cursor:'pointer', textAlign:'left', fontSize:'0.875rem', fontWeight: sel ? 600 : 400,
                      color: sel ? TEAL : NAVY, fontFamily:UI, transition:'all 0.13s',
                      display:'flex', alignItems:'center', gap:8,
                    }}>
                      {sel && <CheckCircle2 size={14} color={TEAL}/>}
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      ) : (
        <div>
          <div style={{ textAlign:'center', marginBottom:'1.25rem' }}>
            <div style={{ fontSize:'0.75rem', fontWeight:700, color:T3, letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:UI, marginBottom:4 }}>Suggested allocation</div>
            <div style={{ fontFamily:DISP, fontSize:'1.625rem', fontWeight:700, color:alloc.color }}>{alloc.label}</div>
            <p style={{ fontSize:'0.875rem', color:T3, lineHeight:1.65, margin:'0.5rem 0 0', fontFamily:UI }}>{alloc.desc}</p>
          </div>

          <div style={{ height:220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={3} dataKey="value" animationBegin={0} animationDuration={800}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} stroke="none"/>)}
                </Pie>
                <Legend formatter={(v) => <span style={{ fontFamily:UI, fontSize:'0.8125rem', color:NAVY }}>{v}</span>}/>
                <RechartsTip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ fontFamily:UI, fontSize:12, borderRadius:8 }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.625rem', marginBottom:'1rem' }}>
            {pieData.map((d, i) => (
              <div key={i} style={{ textAlign:'center', padding:'0.75rem', background:`${d.color}10`, border:`1px solid ${d.color}25`, borderRadius:10 }}>
                <div style={{ fontFamily:DISP, fontSize:'1.375rem', fontWeight:700, color:d.color }}>{d.value}%</div>
                <div style={{ fontSize:'0.75rem', color:T3, fontFamily:UI }}>{d.name}</div>
              </div>
            ))}
          </div>

          <InfoBox>This is a starting point, not a prescription. Revisit your allocation annually and as your life changes. Gradually shift to more bonds as you approach retirement.</InfoBox>
          <button onClick={reset} style={{ marginTop:'0.875rem', display:'block', width:'100%', padding:'0.625rem', background:'none', border:`1px solid ${B1}`, borderRadius:9, cursor:'pointer', fontSize:'0.8125rem', color:T3, fontFamily:UI }}>
            Retake quiz
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CALCULATE — Compound Interest Calculator
══════════════════════════════════════════════════════════════════ */
function buildGrowthData(initial, monthly, annualRate, years) {
  const r = annualRate / 100 / 12;
  const data = [{ year:0, balance:Math.round(initial), contributed:Math.round(initial), growth:0 }];
  let bal = initial, contributed = initial;
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      bal = bal * (1 + r) + monthly;
      contributed += monthly;
    }
    data.push({ year:y, balance:Math.round(bal), contributed:Math.round(contributed), growth:Math.round(bal - contributed) });
  }
  return data;
}

function CompoundCalc() {
  const [initial,  setInitial]  = useState(10000);
  const [monthly,  setMonthly]  = useState(500);
  const [rate,     setRate]     = useState(7);
  const [years,    setYears]    = useState(30);

  const data      = useMemo(() => buildGrowthData(initial, monthly, rate, years), [initial, monthly, rate, years]);
  const final     = data[data.length - 1];
  const totalContr = final.contributed;
  const totalGrowth = final.growth;

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}>
        <NumInput label="Initial Investment" value={initial} onChange={setInitial} min={0} step={1000}/>
        <NumInput label="Monthly Contribution" value={monthly} onChange={setMonthly} min={0} step={50}/>
      </div>

      <div style={{ marginBottom:'1rem' }}>
        <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>
          Annual Return — <span style={{ color:TEAL }}>{rate}%</span>
          <span style={{ fontWeight:400, color:T3, fontSize:'0.75rem', marginLeft:8 }}>S&P 500 historical avg ~10% (7% inflation-adjusted)</span>
        </label>
        <input type="range" min={1} max={15} step={0.5} value={rate} onChange={e => setRate(Number(e.target.value))} style={{ width:'100%', accentColor:TEAL, cursor:'pointer' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.6875rem', color:T3, fontFamily:UI, marginTop:3 }}>
          <span>1%</span><span>5%</span><span>7% (real)</span><span>10% (nominal)</span><span>15%</span>
        </div>
      </div>

      <div style={{ marginBottom:'1.25rem' }}>
        <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>
          Time Horizon — <span style={{ color:TEAL }}>{years} years</span>
        </label>
        <input type="range" min={1} max={50} step={1} value={years} onChange={e => setYears(Number(e.target.value))} style={{ width:'100%', accentColor:TEAL, cursor:'pointer' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.6875rem', color:T3, fontFamily:UI, marginTop:3 }}>
          <span>1</span><span>10</span><span>20</span><span>30</span><span>40</span><span>50</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.625rem', marginBottom:'1.25rem' }}>
        {[
          { label:'Final Balance', value:fmtK(final.balance), color:TEAL },
          { label:'Total Contributed', value:fmtK(totalContr), color:NAVY },
          { label:'Investment Growth', value:fmtK(totalGrowth), color:'#22c55e' },
        ].map(s => (
          <div key={s.label} style={{ textAlign:'center', padding:'0.875rem 0.5rem', background:`${s.color}09`, border:`1px solid ${s.color}25`, borderRadius:11 }}>
            <div style={{ fontFamily:DISP, fontSize:'1.25rem', fontWeight:700, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'0.75rem', color:T3, fontFamily:UI }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ height:220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top:4, right:4, left:0, bottom:0 }}>
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={TEAL} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={TEAL} stopOpacity={0.02}/>
              </linearGradient>
              <linearGradient id="contrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={NAVY} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={NAVY} stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="year" tick={{ fontFamily:UI, fontSize:11, fill:'#6b5540' }} axisLine={false} tickLine={false} tickFormatter={v => `Yr ${v}`} interval={Math.floor(years/5)}/>
            <YAxis tick={{ fontFamily:UI, fontSize:11, fill:'#6b5540' }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} width={52}/>
            <RechartsTip content={<CustomTip valueFormatter={fmt}/>}/>
            <Area type="monotone" dataKey="contributed" name="Contributed" stroke={NAVY} strokeWidth={1.5} fill="url(#contrGrad)" strokeDasharray="4 2"/>
            <Area type="monotone" dataKey="balance"     name="Balance"     stroke={TEAL} strokeWidth={2}   fill="url(#growthGrad)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <InfoBox>The gap between the blue line (what you put in) and the teal area (your balance) is the power of compounding. The longer you wait to start, the harder it is to catch up.</InfoBox>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CALCULATE — Fee Impact Calculator
══════════════════════════════════════════════════════════════════ */
const FEE_LEVELS = [
  { fee:0.03,  label:'0.03% — Index ETF (Vanguard)',    color:'#22c55e' },
  { fee:0.5,   label:'0.50% — Low-cost mutual fund',    color:TEAL      },
  { fee:1.0,   label:'1.00% — Typical active fund',     color:'#f59e0b' },
  { fee:2.0,   label:'2.00% — High-fee advisor + fund', color:'#ef4444' },
];

function FeeImpactCalc() {
  const [initial, setInitial] = useState(50000);
  const [monthly, setMonthly] = useState(500);
  const [gross,   setGross]   = useState(8);
  const [years,   setYears]   = useState(30);

  const data = useMemo(() => {
    return Array.from({ length: years + 1 }, (_, y) => {
      const point = { year:y };
      FEE_LEVELS.forEach(fl => {
        const r = (gross - fl.fee) / 100 / 12;
        let bal = initial;
        for (let m = 0; m < y * 12; m++) bal = bal * (1 + r) + monthly;
        point[`f${fl.fee}`] = Math.round(bal);
      });
      return point;
    });
  }, [initial, monthly, gross, years]);

  const final = data[data.length - 1];
  const best  = final[`f${FEE_LEVELS[0].fee}`];
  const worst = final[`f${FEE_LEVELS[FEE_LEVELS.length-1].fee}`];
  const drag  = best - worst;

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}>
        <NumInput label="Starting Balance" value={initial} onChange={setInitial} min={0} step={5000}/>
        <NumInput label="Monthly Contribution" value={monthly} onChange={setMonthly} min={0} step={50}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}>
        <div style={{ marginBottom:'1rem' }}>
          <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>Gross Annual Return — {gross}%</label>
          <input type="range" min={4} max={12} step={0.5} value={gross} onChange={e=>setGross(Number(e.target.value))} style={{ width:'100%', accentColor:TEAL, cursor:'pointer' }}/>
        </div>
        <div style={{ marginBottom:'1rem' }}>
          <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>Time Horizon — {years} years</label>
          <input type="range" min={5} max={40} step={1} value={years} onChange={e=>setYears(Number(e.target.value))} style={{ width:'100%', accentColor:TEAL, cursor:'pointer' }}/>
        </div>
      </div>

      <div style={{ height:220, marginBottom:'1rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top:4, right:4, left:0, bottom:0 }}>
            <XAxis dataKey="year" tick={{ fontFamily:UI, fontSize:11, fill:'#6b5540' }} axisLine={false} tickLine={false} tickFormatter={v=>`Yr ${v}`} interval={Math.floor(years/5)}/>
            <YAxis tick={{ fontFamily:UI, fontSize:11, fill:'#6b5540' }} axisLine={false} tickLine={false} tickFormatter={v=>fmtK(v)} width={52}/>
            <RechartsTip content={<CustomTip valueFormatter={fmt}/>}/>
            {FEE_LEVELS.map(fl => (
              <Line key={fl.fee} type="monotone" dataKey={`f${fl.fee}`} name={fl.label} stroke={fl.color} strokeWidth={fl.fee===0.03?2.5:1.5} dot={false}/>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'0.5rem', marginBottom:'0.875rem' }}>
        {FEE_LEVELS.map(fl => (
          <div key={fl.fee} style={{ padding:'0.625rem 0.875rem', background:`${fl.color}0d`, border:`1px solid ${fl.color}25`, borderRadius:9 }}>
            <div style={{ fontSize:'0.6875rem', color:T3, fontFamily:UI, marginBottom:2 }}>{fl.label}</div>
            <div style={{ fontFamily:DISP, fontSize:'1.125rem', fontWeight:700, color:fl.color }}>{fmtK(final[`f${fl.fee}`])}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:'0.875rem 1rem', background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10 }}>
        <p style={{ margin:0, fontSize:'0.875rem', color:T2, lineHeight:1.7, fontFamily:UI }}>
          Over {years} years, paying <strong>2% in fees vs 0.03%</strong> costs you <strong style={{ color:'#ef4444' }}>{fmtK(drag)}</strong> in lost returns. Fees are the only investment variable you control completely — minimize them relentlessly.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CALCULATE — Roth vs Traditional
══════════════════════════════════════════════════════════════════ */
const BRACKETS = [
  { label:'10%', rate:10 }, { label:'12%', rate:12 },
  { label:'22%', rate:22 }, { label:'24%', rate:24 },
  { label:'32%', rate:32 }, { label:'35%', rate:35 },
  { label:'37%', rate:37 },
];

function RothVsTraditional() {
  const [invest,   setInvest]   = useState(7000);
  const [years,    setYears]    = useState(25);
  const [nowBracket, setNow]    = useState(22);
  const [retBracket, setRet]    = useState(22);
  const [returnPct, setReturn]  = useState(7);

  const growth  = Math.pow(1 + returnPct/100, years);
  const traditional = invest * growth * (1 - retBracket/100); // pay tax at withdrawal
  const roth        = invest * (1 - nowBracket/100) * growth; // pay tax now, withdraw free

  const rothBetter = traditional > roth;
  const diff       = Math.abs(traditional - roth);

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}>
        <NumInput label="Annual Contribution" value={invest} onChange={setInvest} min={0} step={500}/>
        <div style={{ marginBottom:'1rem' }}>
          <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>Investment Return — {returnPct}%</label>
          <input type="range" min={3} max={12} step={0.5} value={returnPct} onChange={e=>setReturn(Number(e.target.value))} style={{ width:'100%', accentColor:TEAL }}/>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem', marginBottom:'0.5rem' }}>
        <div>
          <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>Your Current Tax Bracket</label>
          <select value={nowBracket} onChange={e=>setNow(Number(e.target.value))} style={{ width:'100%', padding:'8px 10px', border:`1.5px solid ${B2}`, borderRadius:9, fontSize:'0.9375rem', color:NAVY, fontFamily:UI, background:RAISE, fontWeight:600 }}
            onFocus={e=>e.target.style.borderColor=TEAL} onBlur={e=>e.target.style.borderColor=B2}>
            {BRACKETS.map(b => <option key={b.rate} value={b.rate}>{b.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>Expected Retirement Tax Bracket</label>
          <select value={retBracket} onChange={e=>setRet(Number(e.target.value))} style={{ width:'100%', padding:'8px 10px', border:`1.5px solid ${B2}`, borderRadius:9, fontSize:'0.9375rem', color:NAVY, fontFamily:UI, background:RAISE, fontWeight:600 }}
            onFocus={e=>e.target.style.borderColor=TEAL} onBlur={e=>e.target.style.borderColor=B2}>
            {BRACKETS.map(b => <option key={b.rate} value={b.rate}>{b.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom:'1.25rem' }}>
        <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>Years Until Retirement — {years}</label>
        <input type="range" min={5} max={40} step={1} value={years} onChange={e=>setYears(Number(e.target.value))} style={{ width:'100%', accentColor:TEAL }}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
        {[
          { label:'Traditional IRA', sub:'Pre-tax now, taxed at withdrawal', value:traditional, color:'#22c55e', better:rothBetter===false },
          { label:'Roth IRA',        sub:'Taxed now, tax-free at withdrawal', value:roth,        color:TEAL,      better:rothBetter===true  },
        ].map(s => (
          <div key={s.label} style={{ padding:'1rem', background: s.better?`${s.color}0d`:'#231c16', border:`1.5px solid ${s.better?s.color+'40':'#2a2018'}`, borderRadius:12 }}>
            <div style={{ fontSize:'0.75rem', fontWeight:700, color:s.better?s.color:T3, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:UI, marginBottom:4 }}>
              {s.label} {s.better && '✓ Better'}
            </div>
            <div style={{ fontSize:'0.75rem', color:T3, fontFamily:UI, marginBottom:8 }}>{s.sub}</div>
            <div style={{ fontFamily:DISP, fontSize:'1.5rem', fontWeight:700, color:s.better?s.color:NAVY }}>{fmtK(s.value)}</div>
            <div style={{ fontSize:'0.75rem', color:T3, fontFamily:UI }}>after-tax value at retirement</div>
          </div>
        ))}
      </div>

      <div style={{ padding:'0.875rem 1rem', background: rothBetter?'rgba(0,180,198,0.07)':'rgba(34,197,94,0.07)', border:`1px solid ${rothBetter?TEAL+'30':'#22c55e30'}`, borderRadius:10 }}>
        <p style={{ margin:0, fontSize:'0.875rem', color:T2, lineHeight:1.7, fontFamily:UI }}>
          With your current ({nowBracket}%) vs retirement ({retBracket}%) brackets, the <strong style={{ color: rothBetter?TEAL:'#22c55e' }}>{rothBetter?'Roth':'Traditional'} IRA</strong> gives you <strong>{fmtK(diff)} more</strong> after tax over {years} years.
          {nowBracket === retBracket && ' When brackets are equal, Roth is generally preferred for its flexibility and no RMD requirement.'}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   RESOURCES
══════════════════════════════════════════════════════════════════ */
const RESOURCES = [
  { name:'Vanguard',    badge:'Best for index funds',      badgeColor:'#22c55e', desc:'The original low-cost index fund company. Invented by Jack Bogle. Customer-owned structure means no profit motive — costs stay razor thin. The gold standard for long-term investors.', cost:'No minimums for most ETFs; mutual funds from $1,000', best:'Long-term, buy-and-hold index investors' },
  { name:'Fidelity',    badge:'Best overall broker',       badgeColor:TEAL,      desc:'Zero-fee index funds (FZROX, FZILX), $0 commissions, fractional shares, and excellent research tools. No account minimums. Best all-around brokerage for most people.', cost:'$0 commissions, zero-fee index funds available', best:'Most investors — especially beginners' },
  { name:'Charles Schwab', badge:'Best for full service', badgeColor:'#3b82f6', desc:'$0 commissions, fractional shares, excellent customer service, and a full banking suite. Schwab Index Funds rival Vanguard on cost. Also owns TD Ameritrade\'s thinkorswim platform.', cost:'$0 commissions; ETFs from $1', best:'Investors who also want banking services' },
  { name:'Betterment',  badge:'Best robo-advisor',         badgeColor:'#8b5cf6', desc:'Automated investing using low-cost ETFs. Handles asset allocation, rebalancing, and tax-loss harvesting automatically. Perfect for hands-off investors who don\'t want to pick funds.', cost:'0.25%/yr (0.40% for premium with advisor access)', best:'Hands-off investors who want automation' },
  { name:'Wealthfront', badge:'Best for tax optimization', badgeColor:'#f59e0b', desc:'Robo-advisor with sophisticated tax-loss harvesting, direct indexing for larger accounts, and a 5% APY cash account. More tech-focused than Betterment with similar core offering.', cost:'0.25%/yr management fee', best:'Tech-savvy investors wanting automated tax optimization' },
  { name:'M1 Finance',  badge:'Best for custom portfolios',badgeColor:'#ef4444', desc:'Hybrid between robo-advisor and DIY broker. Build a custom "pie" portfolio of stocks and ETFs, then automate contributions into it. No management fee. Fractional shares.', cost:'Free ($3/mo for M1 Plus with cash account)', best:'DIY investors who want automation without surrendering control' },
];

function ResourcesTab() {
  return (
    <div>
      <div style={{ padding:'0.875rem 1rem', background:'rgba(0,180,198,0.06)', border:'1px solid rgba(0,180,198,0.2)', borderRadius:12, marginBottom:'1.25rem', display:'flex', gap:10, alignItems:'flex-start' }}>
        <Info size={15} color={TEAL} style={{ flexShrink:0, marginTop:1 }}/>
        <p style={{ margin:0, fontSize:'0.875rem', color:T2, lineHeight:1.7, fontFamily:UI }}>
          <strong>How to choose:</strong> For most investors, a simple 3-fund portfolio (US stocks, international stocks, bonds) at Fidelity or Vanguard beats 90% of actively managed strategies. Complexity is not sophistication.
        </p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {RESOURCES.map((r, i) => (
          <div key={i} style={{ background:SURF, border:`1px solid ${B1}`, borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding:'0.875rem 1.125rem', borderBottom:'1px solid #f0f0f0', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontFamily:DISP, fontSize:'1rem', fontWeight:700, color:NAVY }}>{r.name}</span>
                <span style={{ padding:'2px 10px', background:`${r.badgeColor}15`, border:`1px solid ${r.badgeColor}35`, borderRadius:100, fontSize:'0.6875rem', fontWeight:700, color:r.badgeColor, fontFamily:UI, letterSpacing:'0.03em' }}>{r.badge}</span>
              </div>
            </div>
            <div style={{ padding:'0.875rem 1.125rem' }}>
              <p style={{ margin:'0 0 0.75rem', fontSize:'0.875rem', color:T2, lineHeight:1.7, fontFamily:UI }}>{r.desc}</p>
              <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'0.25rem 0.75rem', fontSize:'0.8125rem', fontFamily:UI }}>
                <span style={{ color:T3, fontWeight:600 }}>Cost</span><span style={{ color:T2 }}>{r.cost}</span>
                <span style={{ color:T3, fontWeight:600 }}>Best for</span><span style={{ color:T2 }}>{r.best}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
const TABS = [
  { id:'learn',     label:'Learn',     icon: BookOpen     },
  { id:'calc',      label:'Calculate', icon: Calculator   },
  { id:'resources', label:'Resources', icon: ExternalLink },
];

export default function Investing() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('learn');

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:UI }}>

      <div style={{ background:SURF, borderBottom:`1px solid `, padding:'2rem 2.5rem 0' }}>
        <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', marginBottom:'1rem', display:'flex', alignItems:'center', gap:6 }}>
          <button onClick={() => navigate('/fun')} style={{ background:'none', border:'none', cursor:'pointer', color:TEAL, fontSize:'0.75rem', fontFamily:UI, padding:0 }}>Dashboard</button>
          <ChevronRight size={12} color="rgba(255,255,255,0.25)"/>
          <span style={{ fontFamily:UI }}>Investing & Accounts</span>
        </div>
        <h1 style={{ fontFamily:DISP, fontSize:'2rem', fontWeight:700, color:'#fff', margin:'0 0 0.5rem', letterSpacing:'-0.025em', lineHeight:1.2 }}>
          Investing & Accounts
        </h1>
        <p style={{ margin:'0 0 1.75rem', fontSize:'1rem', color:'rgba(255,255,255,0.55)', lineHeight:1.65, maxWidth:580, fontFamily:UI }}>
          Master every account type, learn what to invest in, discover the right order to fund your accounts, and see how compounding and fees shape your future.
        </p>
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display:'flex', alignItems:'center', gap:7, padding:'0.75rem 1.25rem',
                background:'none', border:'none', borderBottom:`2px solid ${active?TEAL:'transparent'}`,
                cursor:'pointer', fontFamily:UI, fontSize:'0.875rem',
                fontWeight:active?700:500, color:active?TEAL:'rgba(255,255,255,0.45)',
                marginBottom:-1, transition:'color 0.15s', whiteSpace:'nowrap',
              }}><Icon size={14}/>{t.label}</button>
            );
          })}
        </div>
      </div>

      <div style={{ padding:'2rem 2.5rem', maxWidth:860, margin:'0 auto' }}>

        {tab === 'learn' && (
          <>
            <SectionCard title="Investment Account Types — Complete Breakdown" subtitle="Roth IRA, Traditional IRA, 401k, Roth 401k, HSA, 529, Brokerage, SEP IRA, SIMPLE IRA — 2026 CFP limits, tax rules, asset location & pro tips">
              <AccountMasterSection/>
            </SectionCard>
            <SectionCard title="Which Account Should I Fund First?" subtitle="Follow this waterfall to maximize every tax advantage before moving to the next step.">
              <FundingWaterfall/>
            </SectionCard>
            <SectionCard title="Asset Classes Explained" subtitle="What are you actually buying when you invest? Click each asset class to learn what it is, its risk/return profile, and key insights.">
              <AssetClasses/>
            </SectionCard>
            <SectionCard title="Risk Tolerance Quiz" subtitle="Answer 4 questions to get a suggested asset allocation tailored to your time horizon and comfort with volatility.">
              <RiskQuiz/>
            </SectionCard>
          </>
        )}

        {tab === 'calc' && (
          <>
            <SectionCard title="Compound Interest Calculator" subtitle="See how your money grows over time with initial investment, monthly contributions, and a given annual return.">
              <CompoundCalc/>
            </SectionCard>
            <SectionCard title="Investment Fee Impact Calculator" subtitle="Fees are silent killers of long-term wealth. See how 0.03% vs 2% expense ratios compound against you over decades.">
              <FeeImpactCalc/>
            </SectionCard>
            <SectionCard title="Roth vs Traditional IRA Comparison" subtitle="Which gives you more money after tax? It depends on your current vs expected future tax bracket.">
              <RothVsTraditional/>
            </SectionCard>
          </>
        )}

        {tab === 'resources' && <ResourcesTab/>}

        <div onClick={() => navigate('/fun/insurance')} style={{ marginTop:'2rem', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', background:RAISE, borderRadius:12, cursor:'pointer', transition:'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity='0.88'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
          <div>
            <div style={{ fontSize:'0.6875rem', color:'rgba(255,255,255,0.4)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:3, fontFamily:UI }}>Next section</div>
            <div style={{ fontFamily:DISP, fontSize:'1rem', fontWeight:600, color:'#fff' }}>Insurance Planning</div>
          </div>
          <ArrowRight size={18} color={TEAL}/>
        </div>

        <p style={{ marginTop:'2rem', fontSize:'0.6875rem', color:T3, textAlign:'center', lineHeight:1.6, fontFamily:UI }}>
          For educational purposes only — not financial, investment, tax, or legal advice.
        </p>
      </div>
    </div>
  );
}
