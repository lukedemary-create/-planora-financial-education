// ─────────────────────────────────────────────────────────────────────────────
// src/pages/BusinessPlanning.jsx
// Business Owner Planning — Planora Terminal
// Arche warm-dark design language | Playfair Display / Inter / JetBrains Mono
// Tax figures: src/config/taxConstants2026.js
// Architecture: state-based navigation (no sub-routes), useLS persistence
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TAX_2026 } from '../config/taxConstants2026'
import {
  Building2, Scale, Target, Heart, Shield, Lock,
  Users, FileText, Briefcase, ChevronRight, ChevronLeft,
  Check, AlertTriangle, TrendingUp, DollarSign,
  BookOpen, ClipboardList, Award, Zap, Bot,
  ArrowRight, Download, RefreshCw, Star, Info,
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Cell,
} from 'recharts'

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const C = {
  bg:       '#1a1410',
  surf:     '#231c16',
  raise:    '#2d2419',
  b1:       '#2a2018',
  b2:       '#3d3028',
  t1:       '#f0e8d8',
  t2:       '#a89070',
  t3:       '#6b5540',
  gold:     '#c9a96e',
  goldDim:  'rgba(201,169,110,0.10)',
  goldBdr:  'rgba(201,169,110,0.22)',
  brown:    '#8b6340',
  brownDim: 'rgba(139,99,64,0.12)',
  brownBdr: 'rgba(139,99,64,0.28)',
  teal:     '#00B4C6',
  tealDim:  'rgba(0,180,198,0.10)',
  success:  '#4a7c59',
  danger:   '#8b3a3a',
}
const DISPLAY = "'Playfair Display', Georgia, serif"
const UI      = "'Inter', system-ui, sans-serif"
const MONO    = "'JetBrains Mono', 'Courier New', monospace"

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function useLS(key, def) {
  const [v, set] = useState(() => {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : def } catch { return def }
  })
  const update = useCallback((val) => {
    const next = typeof val === 'function' ? val(v) : val
    set(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
  }, [v])
  return [v, update]
}

const fmt = (n) => {
  const v = Math.abs(n || 0)
  if (v >= 1e6) return (n < 0 ? '-$' : '$') + (v / 1e6).toFixed(2) + 'M'
  if (v >= 1e3) return (n < 0 ? '-$' : '$') + (v / 1e3).toFixed(0) + 'K'
  return (n < 0 ? '-$' : '$') + Math.round(v).toLocaleString()
}

function calcOrdinaryTax(taxable, fs = 'single') {
  const brackets = TAX_2026.ordinaryBrackets[fs] || TAX_2026.ordinaryBrackets.single
  let tax = 0, prev = 0
  for (const b of brackets) {
    if (taxable <= prev) break
    tax += (Math.min(taxable, b.upTo) - prev) * b.rate
    prev = b.upTo
  }
  return tax
}

function calcSETax(netProfit) {
  const { ssWageBase, ssRate, medicareRate, seIncomeMultiplier } = TAX_2026.se
  const netSE = netProfit * seIncomeMultiplier
  return Math.min(netSE, ssWageBase) * ssRate + netSE * medicareRate
}

function calcQBI(netProfit, fs = 'single') {
  const { rate, thresholds, phaseoutRange } = TAX_2026.qbi
  const threshold = thresholds[fs] || thresholds.single
  const phaseout  = phaseoutRange[fs]  || phaseoutRange.single
  const base = netProfit * rate
  if (netProfit <= threshold) return base
  return Math.max(0, base - ((netProfit - threshold) / phaseout) * base)
}

/* ─── Shared UI primitives ───────────────────────────────────────────────── */
const card = { background: C.surf, border: `1px solid ${C.b2}`, borderRadius: 16, padding: '24px' }
const cardSm = { background: C.surf, border: `1px solid ${C.b2}`, borderRadius: 12, padding: '16px 20px' }

function SLabel({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.t3, marginBottom: 10, fontFamily: UI }}>{children}</div>
}

function Tag({ color = C.brown, bg, children }) {
  return (
    <span style={{
      fontSize: 10, fontFamily: UI, fontWeight: 600, color,
      background: bg || (color + '18'), border: `1px solid ${color}30`,
      borderRadius: 5, padding: '3px 8px',
    }}>{children}</span>
  )
}

function BackBtn({ onClick, label = 'Back' }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'none', border: 'none', cursor: 'pointer',
      color: C.t2, fontSize: 13, fontFamily: UI, fontWeight: 500,
      padding: '6px 0', marginBottom: 24,
    }}>
      <ChevronLeft size={15} color={C.t2} />{label}
    </button>
  )
}

function StepBar({ current, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
      <div style={{ flex: 1, height: 3, background: C.b2, borderRadius: 99 }}>
        <div style={{ height: '100%', borderRadius: 99, width: `${(current / total) * 100}%`, background: `linear-gradient(90deg, ${C.brown}, ${C.gold})`, transition: 'width 0.35s ease' }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: MONO, color: C.t3, whiteSpace: 'nowrap' }}>Step {current} of {total}</span>
    </div>
  )
}

function PrimaryBtn({ onClick, children, fullWidth }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      background: C.gold, border: 'none', borderRadius: 10, cursor: 'pointer',
      padding: '12px 24px', fontFamily: UI, fontSize: 14, fontWeight: 700, color: C.bg,
      width: fullWidth ? '100%' : undefined,
    }}>{children}</button>
  )
}

function GhostBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'none', border: `1px solid ${C.b2}`, borderRadius: 10, cursor: 'pointer',
      padding: '10px 20px', fontFamily: UI, fontSize: 13, fontWeight: 600, color: C.t2,
    }}>{children}</button>
  )
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map(opt => {
        const active = value === opt
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{
            textAlign: 'left', padding: '11px 16px', borderRadius: 10, cursor: 'pointer',
            border: `1px solid ${active ? C.gold : C.b2}`,
            background: active ? C.goldDim : C.raise,
            color: active ? C.gold : C.t2, fontSize: 13, fontFamily: UI, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 10, transition: 'border-color 0.15s, background 0.15s',
          }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${active ? C.gold : C.b2}`, background: active ? C.gold : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.bg }} />}
            </div>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function YesNo({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {['Yes', 'No'].map(opt => {
        const active = value === opt.toLowerCase()
        return (
          <button key={opt} onClick={() => onChange(opt.toLowerCase())} style={{
            flex: 1, padding: '11px', borderRadius: 10, cursor: 'pointer',
            border: `1px solid ${active ? C.gold : C.b2}`,
            background: active ? C.goldDim : C.raise,
            color: active ? C.gold : C.t2, fontSize: 14, fontFamily: UI, fontWeight: 600,
            transition: 'border-color 0.15s, background 0.15s',
          }}>{opt}</button>
        )
      })}
    </div>
  )
}

function NumInput({ value, onChange, prefix = '$', placeholder }) {
  return (
    <div style={{ position: 'relative' }}>
      {prefix && <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.t3, fontFamily: MONO, fontSize: 14 }}>{prefix}</span>}
      <input
        type="number"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: `12px 14px 12px ${prefix ? '28px' : '14px'}`,
          background: C.raise, border: `1px solid ${C.b2}`, borderRadius: 10,
          color: C.t1, fontFamily: MONO, fontSize: 15, outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

/* ─── Module data ────────────────────────────────────────────────────────── */
const MODULES = [
  {
    id: 'entities',
    title: 'Business Entity Structures',
    icon: Building2,
    accent: C.gold,
    tagline: 'The structure you operate under quietly determines your tax bill, your liability, and your options.',
    overview: [
      'Most business owners choose their entity structure once, early on, without fully understanding what they are choosing. That initial decision — or non-decision, since many sole proprietors never made one at all — silently shapes everything that comes after: how income is taxed, whether personal assets are at risk, how you pay yourself, and what planning strategies remain available.',
      'There is no universally right answer. Each structure involves genuine trade-offs between tax efficiency, liability protection, administrative burden, and flexibility. What matters is understanding what you are currently operating under and whether it still fits where you are today.',
    ],
    entities: [
      { name: 'Sole Proprietorship', tax: 'All net profit taxed as ordinary income plus full self-employment tax (15.3% on first $184,500 of net SE income, 2.9% above)', liability: 'None — personal assets fully exposed to business debts and lawsuits', complexity: 'Minimal — Schedule C on personal return', qbi: 'Yes — 20% QBI deduction on qualified income', bestFor: 'Testing an idea; very low or part-time income; minimal legal risk' },
      { name: 'Single-Member LLC', tax: 'Identical to sole prop by default — "disregarded entity" means all income flows to Schedule C', liability: 'Strong — personal assets protected from business claims when properly maintained', complexity: 'Low — one-time state formation, same Schedule C filing', qbi: 'Yes', bestFor: 'Any solo business that wants liability protection without tax complexity' },
      { name: 'Multi-Member LLC', tax: 'Partnership taxation by default — each member receives a K-1 and pays SE tax on their allocable share', liability: 'Strong — personal assets protected; operating agreement governs relationships', complexity: 'Moderate — Form 1065 partnership return plus K-1s annually', qbi: 'Yes', bestFor: 'Multiple founders wanting flexible profit allocation and liability protection' },
      { name: 'S-Corporation', tax: 'Pass-through — but only the W-2 salary is subject to SE/payroll tax. Distributions are not. This split is the tax strategy.', liability: 'Strong — separate legal entity; payroll and formalities required', complexity: 'Moderate-High — separate corporate return (Form 1120-S), payroll required, reasonable compensation rules apply', qbi: 'Yes — on distribution portion, subject to W-2 wage limitations at higher income', bestFor: 'Profitable businesses earning $50K+ in net income where payroll tax savings justify the administrative cost' },
      { name: 'C-Corporation', tax: 'Corporate profits taxed at flat 21%. Dividends paid to owners taxed again at individual rates — the "double tax." Retained earnings inside the corp are only taxed once until distributed.', liability: 'Strongest — fully separate legal entity; most creditor protection', complexity: 'High — Form 1120, corporate formalities, potential double taxation on profits', qbi: 'No — C-corps do not qualify for the QBI deduction', bestFor: 'Venture-backed startups seeking investors; owners pursuing Qualified Small Business Stock (QSBS) exclusion; high earners strategically retaining earnings inside the company' },
    ],
    keyTakeaways: [
      'An LLC is a legal structure. It does not change your taxes by default — you must elect S-corp status separately to get the payroll tax benefit.',
      'The S-corp election makes sense when the annual payroll tax savings exceed the cost of running payroll and filing a separate corporate return — typically at $50K+ in net profit.',
      'The QBI deduction (Section 199A) allows most pass-through business owners to deduct 20% of qualified business income, but it phases out at higher incomes and excludes certain professional service businesses.',
      'Entity structure is not permanent. An LLC can elect S-corp taxation. An S-corp can be converted. Review this with a CPA whenever your income or situation changes materially.',
    ],
  },
  {
    id: 'taxation',
    title: 'Business Taxation Deep Dive',
    icon: Scale,
    accent: C.gold,
    tagline: 'Understanding how a dollar of business revenue moves through to your pocket — and where it stops along the way.',
    overview: [
      'Business taxation is widely misunderstood, even by people who have been running profitable companies for years. The most persistent myth is that earning more can leave you worse off by "bumping into a higher bracket." This is not how marginal taxation works. The highest bracket rate applies only to income above the threshold — never to everything you earned.',
      'What actually determines your total tax burden as a business owner is the interaction of three separate layers: ordinary income tax on the profit itself, self-employment tax on the earnings subject to it, and the qualified business income deduction that partially offsets both.',
    ],
    concepts: [
      { term: 'Marginal vs. Effective Rate', def: 'Your marginal rate is the rate on your last dollar of income. Your effective rate is your total tax divided by total income. The marginal rate is always higher than the effective rate. Earning more never leaves you with less after tax.' },
      { term: 'Self-Employment Tax (SE Tax)', def: `SE tax is the combined Social Security (${(TAX_2026.se.ssRate * 100).toFixed(1)}%) and Medicare (${(TAX_2026.se.medicareRate * 100).toFixed(1)}%) tax that sole proprietors, partners, and LLC members pay. It is calculated on ${(TAX_2026.se.seIncomeMultiplier * 100).toFixed(2)}% of net earnings (the multiplier accounts for the deductibility of the employer half). The Social Security portion applies only up to the wage base of $${TAX_2026.se.ssWageBase.toLocaleString()} in 2026. Medicare applies to all SE income, with an additional 0.9% above $${TAX_2026.se.addlMedicareThreshold.single.toLocaleString()} (single) or $${TAX_2026.se.addlMedicareThreshold.mfj.toLocaleString()} (MFJ).` },
      { term: 'The S-Corp Salary Split', def: 'An S-corporation owner must pay themselves a "reasonable compensation" salary — a W-2 wage — for services rendered. Profits above that salary can be taken as distributions, which are not subject to payroll taxes. This split is the central mechanism of the S-corp tax strategy. The IRS scrutinizes unreasonably low salaries; the goal is an arm\'s-length wage for the services provided, with excess profit as distribution.' },
      { term: 'Qualified Business Income (QBI) Deduction — §199A', def: `Pass-through business owners — sole proprietors, LLCs, S-corps, partnerships — can generally deduct 20% of qualified business income before calculating income tax. This deduction begins to phase out at $${TAX_2026.qbi.thresholds.single.toLocaleString()} of taxable income (single) and $${TAX_2026.qbi.thresholds.mfj.toLocaleString()} (MFJ). Above those thresholds, the calculation becomes more complex and is limited by wages paid and the business's capital base. Certain service businesses (law, consulting, health, financial services) face stricter limitations. The deduction does not reduce SE tax — only income tax.` },
      { term: 'Estimated Quarterly Taxes', def: 'Business owners do not have an employer withholding taxes from a paycheck. Instead, the IRS requires estimated tax payments four times per year — typically due in April, June, September, and January. Missing these creates an underpayment penalty. The safe harbor rule lets you avoid penalties by paying either 100% of last year\'s tax (110% if prior-year AGI exceeded $150K) or 90% of the current year\'s liability. This is one of the most commonly missed and costly errors for new and growing business owners.' },
      { term: 'Deductions That Reduce Taxable Business Income', def: 'Ordinary and necessary business expenses reduce net profit before it is taxed. Beyond standard operating costs, owners frequently miss: Section 179 and bonus depreciation for equipment and certain property (immediate full deduction rather than multi-year depreciation); the home office deduction for dedicated business use space; vehicle expenses (actual cost or standard mileage); health insurance premiums for self-employed owners; and retirement plan contributions — the most powerful tax shelter most owners have access to.' },
    ],
    keyTakeaways: [
      'Every dollar you earn above your current bracket threshold is taxed at the higher rate — not every dollar you earned. Never turn down profitable work to stay in a lower bracket.',
      'Self-employment tax is the most overlooked cost for sole proprietors and LLC members. At $100K net profit, SE tax alone is roughly $14,000 before income tax.',
      'An S-corp does not eliminate SE tax — it limits it to the salary portion. The strategy requires a reasonable salary and disciplined separation of compensation from distributions.',
      'The QBI deduction is one of the most significant planning tools available to pass-through owners. It is worth ensuring you are capturing it fully, and worth modeling whether an entity structure change affects it.',
    ],
  },
  {
    id: 'retirement',
    title: 'Retirement Plans for Business Owners',
    icon: Target,
    accent: C.gold,
    tagline: 'A retirement plan is simultaneously the best tax shelter most owners have and the foundation of their personal financial independence.',
    overview: [
      'Most business owners dramatically under-save for retirement because they assume the business itself will fund their exit — either through a sale or through ongoing distributions. Some businesses do make that possible. Many do not, and the owner reaches their late 50s with very little outside the company. The smart move is to treat retirement savings as a strategic priority, not a someday consideration, and to use the plans designed for business owners to shelter large amounts of income while it is most valuable.',
      'The menu of available retirement plans is genuinely confusing. The right choice depends on whether you have employees, how much you want to contribute, how much administrative overhead you can absorb, and whether you want to use the plan as a recruiting tool.',
    ],
    plans: [
      { name: 'SEP IRA', limit: `Up to 25% of W-2 compensation, or 20% of net self-employment income, max $${TAX_2026.retirement.sepLimit.toLocaleString()} in 2026`, employees: 'Employer must contribute same percentage for all eligible employees — a significant cost if you have staff', setup: 'Simple — can be opened at any brokerage, no annual Form 5500 filing below $250K', bestFor: 'Solo operators or businesses with very few, low-paid employees who want simplicity and large contribution potential', note: 'No catch-up contributions. Simple to administer but inflexible if you add employees.' },
      { name: 'SIMPLE IRA', limit: `Employee elective deferrals up to $${TAX_2026.retirement.simpleLimit.toLocaleString()} in 2026 (plus $${TAX_2026.retirement.simpleCatchup.toLocaleString()} catch-up if 50+), plus required employer match`, employees: 'Employer must match either 100% of first 3% of compensation or 2% non-elective for all eligible employees', setup: 'Simple — available to businesses with 100 or fewer employees; no IRS approval required', bestFor: 'Small employers who want a plan with employee contributions and are ready to offer a match; good stepping stone before a 401(k)', note: 'Mandatory employer contribution is a real cost. Cannot be combined with another qualified plan. Contribution limits are lower than a 401(k).' },
      { name: 'Solo 401(k)', limit: `Employee contribution up to $${TAX_2026.retirement.e401kElective.toLocaleString()} (plus $${TAX_2026.retirement.e401kCatchup.toLocaleString()} catch-up ages 50-59 and 64+, or $${TAX_2026.retirement.e401kCatchup6063.toLocaleString()} ages 60-63 under SECURE 2.0), plus employer contribution up to 25% of W-2/net SE income, total cap $${TAX_2026.retirement.dcTotalLimit.toLocaleString()}`, employees: 'Available only when the owner has no full-time employees other than a spouse', setup: 'Moderate — requires an EIN, plan document, and brokerage custodian; Form 5500-EZ required above $250K in plan assets', bestFor: 'The solo business owner with high income who wants to maximize contributions. Highest contribution limits of any plan for a solo operator.', note: 'The Roth Solo 401(k) option allows after-tax contributions to grow tax-free. The plan must be established by December 31 of the tax year.' },
      { name: 'Traditional 401(k) with Safe Harbor', limit: `Employee deferrals up to $${TAX_2026.retirement.e401kElective.toLocaleString()} plus employer match, total up to $${TAX_2026.retirement.dcTotalLimit.toLocaleString()}`, employees: 'Covers all eligible employees; safe harbor design automatically satisfies non-discrimination testing', setup: 'Higher — requires a third-party administrator (TPA), annual Form 5500, non-discrimination testing', bestFor: 'Businesses with employees who want a robust benefit to attract and retain talent; owners who also want high personal contribution limits', note: 'The mandatory safe harbor match (typically 3-4% of compensation) is a real cost but unlocks flexibility for owner contributions. SECURE 2.0 provides meaningful startup tax credits.' },
      { name: 'Defined Benefit Plan', limit: 'Annual benefit up to the lesser of 100% of final average compensation or $280,000 — contribution amounts are actuarially determined and can exceed $100,000 for high earners in their 50s or 60s', employees: 'Can be set up for owner-only or with employees, but employee benefits significantly increase cost', setup: 'High — requires an enrolled actuary annually, Form 5500, and rigid funding requirements', bestFor: 'High-earning owners in their late 40s or older with relatively short runway to retirement who want to shelter very large income amounts. Often combined with a 401(k) in a paired plan structure.', note: 'A cash balance plan is a hybrid that looks like a defined benefit but behaves more like a defined contribution plan — simpler to understand and increasingly popular for owner-only situations.' },
    ],
    keyTakeaways: [
      `SECURE 2.0 provides a startup credit of $${TAX_2026.retirement.secure2StartupCredit.max.toLocaleString()} over three years plus a $${TAX_2026.retirement.secure2StartupCredit.autoEnrollCredit.toLocaleString()} auto-enrollment credit — meaningfully reducing the cost of starting a new plan.`,
      'Retirement plan contributions reduce your taxable income dollar-for-dollar in the year they are made. For an owner in a combined federal/state marginal rate of 35-40%, a $50,000 contribution is effectively $17,500-$20,000 cheaper than it appears.',
      'The Solo 401(k) offers the highest contribution ceiling for a solo operator, but it disappears the moment you hire a full-time non-spouse employee. Plan ahead.',
      'Do not assume the business sale will be your retirement. Model both scenarios — what the plan looks like if the sale happens as expected, and what it looks like if it does not.',
    ],
  },
  {
    id: 'benefits',
    title: 'Health Insurance and Employee Benefits',
    icon: Heart,
    accent: C.teal,
    tagline: 'Benefits are not simply an expense — they are a tax-advantaged tool for attracting people, retaining them, and improving the owner\'s own tax position.',
    overview: [
      'The framing of benefits as a cost category is incomplete. Every dollar of wages you pay an employee is taxed twice — once to the employee as income, once to both of you in payroll taxes. Every dollar of qualifying benefits you provide is deducted by the company, received by the employee free of income and payroll tax, and produces recruiting and retention value that compensation alone often cannot. The economic case for benefits is strong wherever margins allow it.',
      'For the self-employed owner, the most immediately impactful benefit is health insurance — because the IRS allows you to deduct 100% of your own and your family\'s health insurance premiums above the line, reducing adjusted gross income before the standard deduction. That alone is often worth thousands of dollars annually.',
    ],
    concepts: [
      { term: 'Self-Employed Health Insurance Deduction', def: 'If you are self-employed and not eligible to participate in a subsidized employer plan through a spouse, you can deduct 100% of health insurance premiums paid for yourself, your spouse, and your dependents as an above-the-line deduction on your personal return. For an S-corp owner, premiums must be included in Box 1 of your W-2 and then deducted on your personal return. This deduction does not reduce SE tax, only income tax.' },
      { term: 'Health Savings Account (HSA)', def: `An HSA paired with a High Deductible Health Plan (HDHP) is the only triple-tax-advantaged savings vehicle available. Contributions go in pre-tax ($${TAX_2026.hsa.selfOnly.toLocaleString()} individual / $${TAX_2026.hsa.family.toLocaleString()} family in 2026, plus $${TAX_2026.hsa.catchup.toLocaleString()} catch-up at 55+), grow tax-free, and are withdrawn tax-free for qualifying medical expenses. Unused balances roll over indefinitely and after 65 can be withdrawn for any purpose, making an HSA function like a second IRA with healthcare optionality.` },
      { term: 'QSEHRA and ICHRA', def: 'Traditional group health plans require minimum participation and carry fixed administrative overhead. Qualified Small Employer Health Reimbursement Arrangements (QSEHRA, for businesses with fewer than 50 employees) and Individual Coverage HRAs (ICHRA, available to any size employer) allow a business to reimburse employees tax-free for individual market health insurance premiums and medical expenses — without offering a group plan. This gives small employers meaningful health coverage flexibility at lower administrative burden.' },
      { term: 'Section 125 Cafeteria Plans', def: 'A cafeteria plan (also called a "Section 125 plan") allows employees to choose between taxable compensation and qualified pre-tax benefits. It is the legal structure that makes HSAs, FSAs, and dependent care accounts available on a pre-tax basis through an employer. Even small businesses can set up a simple cafeteria plan to let employees elect pre-tax payroll deductions for health, dental, vision premiums, and flexible spending accounts.' },
      { term: 'Dependent Care FSA', def: `Employees can contribute up to $5,000 per household per year to a Dependent Care FSA on a pre-tax basis, reducing income and payroll taxes on that amount. For a family with childcare expenses, this is an immediate, guaranteed tax savings. As the employer, you save the employer's share of FICA taxes on those amounts as well.` },
      { term: 'Group Life and Disability Insurance', def: 'The company can pay premiums on up to $50,000 of group-term life insurance per employee free of income tax to the employee. Business-paid disability insurance premiums are deductible to the company, though benefits received are taxable to the employee. Structuring disability policies personally (owner pays premiums after-tax) makes the benefit tax-free when received — an important consideration for the business owner\'s own coverage.' },
    ],
    keyTakeaways: [
      'The self-employed health insurance deduction can reduce your tax bill by thousands annually without requiring itemized deductions. If you are paying health premiums personally and not deducting them, this is a material error worth correcting immediately with your CPA.',
      'An HSA is the most tax-efficient savings vehicle that exists. Every dollar contributed is worth more than a dollar to a taxable account because it enters pre-tax, grows tax-free, and exits tax-free for medical expenses.',
      'Benefits help recruit and retain people in ways that additional wages do not — both because of the tax efficiency for the employee and because they signal that the employer treats people well.',
      'For S-corp owners, the interaction between health insurance, payroll, and the self-employed deduction is genuinely complex. The mechanics must be set up correctly or the deduction can be lost.',
    ],
  },
  {
    id: 'insurance',
    title: 'Life and Disability Insurance for Business Owners',
    icon: Shield,
    accent: C.gold,
    tagline: 'Key-person insurance and buy-sell agreements are not estate planning luxuries — they are the infrastructure that keeps the business and its relationships alive through the worst possible events.',
    overview: [
      'Most business owners think about life insurance as a personal matter — something to provide for their family. They rarely think about what the business itself would face if they died or became disabled. In many small businesses, the owner is the business: the key relationship holder, the technical expert, the person whose reputation brings in clients. The loss of that person is not only a personal tragedy; it is a business crisis that unfolds in real time while people are still grieving.',
      'There are three distinct insurance needs for the business owner that go beyond personal coverage: key-person insurance to protect the company itself, buy-sell funding insurance to handle the transition of ownership, and disability coverage that addresses the statistically most likely scenario — not death, but an inability to work.',
    ],
    concepts: [
      { term: 'Key-Person Life Insurance', def: 'The company purchases and owns a life insurance policy on a key owner, executive, or employee. The company pays the premiums (not deductible) and is the beneficiary of the death benefit. The purpose is to give the surviving business the capital to: replace the key person, service debt that depended on that person\'s income or guarantee, stabilize cash flow during a difficult transition period, and fund the cost of recruiting. The death benefit amount is typically calculated as a multiple of the key person\'s contribution to revenue or earnings, often 5-10 times annual revenue attributable to them.' },
      { term: 'Buy-Sell Agreements', def: 'A buy-sell agreement is the legal arrangement between co-owners that controls what happens to an owner\'s interest in the business if they die, become permanently disabled, divorce, go bankrupt, or simply want to leave. Without one, a deceased owner\'s heirs may become your new business partners — regardless of whether they have any interest in or capability to participate in the business. A properly funded buy-sell creates a clear exit at a predetermined or formula-determined price, funded by insurance so that the payment mechanism exists when needed.' },
      { term: 'Cross-Purchase vs. Entity Redemption', def: 'In a cross-purchase structure, each co-owner holds a policy on each other owner. At death, the surviving owners use the proceeds to purchase the deceased owner\'s interest from the estate. In an entity redemption structure, the company holds policies on each owner and uses the proceeds to redeem the deceased owner\'s interest. Each structure has different tax, basis, and administrative implications. A business attorney should design the structure appropriate to your ownership count, entity type, and estate planning goals.' },
      { term: 'Disability Buy-Sell Insurance', def: 'Disability is statistically more likely than death during working years, yet fewer business owners have disability-triggered buy-sell provisions. If an owner becomes permanently disabled, a disability buy-out policy provides the funding to trigger the same ownership transition that a death would — at a predetermined price, without forcing a fire sale or partnership deadlock.' },
      { term: 'Business Overhead Expense Insurance', def: 'If the owner is disabled and cannot work, who pays the lease, the salaries, and the utility bills? Business Overhead Expense (BOE) insurance covers the fixed operating expenses of the business during the owner\'s disability — typically for 12-24 months — giving the business time to adapt without defaulting on obligations or losing key staff.' },
      { term: 'Personal Disability Income Insurance', def: 'For an owner who draws income from the business, personal disability income coverage replaces a portion of their compensation if they cannot work. Disability policies owned personally (paid with after-tax dollars) produce tax-free benefits. Policies paid by the business are deductible but benefits become taxable. The personal ownership structure almost always produces better economics at claim time.' },
    ],
    keyTakeaways: [
      'If you have a business partner and no buy-sell agreement, you may be one unexpected event away from becoming co-owners with someone\'s spouse — someone who did not choose to be your partner and may not want the role.',
      'Key-person insurance is a business asset. The premiums are not deductible, but the death benefit comes in free of income tax (though potentially subject to corporate AMT in a C-corp). The net economic value is still substantially positive.',
      'Disability is the underinsured risk. You are more likely to be disabled for 90+ days before age 65 than to die before that age. Both risks need coverage — at the personal level and at the business level.',
      'The buy-sell agreement and the insurance policy funding it must be coordinated and updated as the business value changes. A policy sized to a 2015 business value protecting a 2026 business is dangerously underinsured.',
    ],
  },
  {
    id: 'trusts',
    title: 'Trusts and Asset Protection',
    icon: Lock,
    accent: C.brown,
    tagline: 'Trusts are not estate planning luxuries for the ultra-wealthy. They are the mechanism that keeps a business running smoothly through incapacity, death, or litigation.',
    overview: [
      'Most business owners hear "trust" and picture something their lawyer charges a lot of money to create for someone with a much larger estate than theirs. This is inaccurate. Trusts are legal structures that exist on a spectrum of complexity, and the simplest ones — the revocable living trust — are straightforwardly useful for almost any business owner with meaningful assets.',
      'The more important and overlooked question is not "do I need a trust?" but "what happens to my business interest if I am in a coma for six months?" The answer, without proper planning, is usually "very bad things." Trusts, combined with proper business succession documents, are the answer to that question.',
    ],
    concepts: [
      { term: 'Revocable Living Trust', def: 'You create the trust, transfer assets (including your business interest) into it, and serve as your own trustee during your lifetime. You retain full control and can revoke or amend the trust at any time. At death or incapacity, a successor trustee you named takes over seamlessly — without probate, without court supervision, without delay. For a business owner, this means the company keeps operating through the transition while the estate is sorted out.' },
      { term: 'Avoiding Probate', def: 'Assets that pass through your will must go through probate — a court-supervised process that is public, slow (often 12-24 months), and sometimes contentious. A business interest stuck in probate may lose customers, key employees, and value before control is transferred. A properly funded trust avoids probate entirely for the assets it holds, allowing immediate succession and continuity.' },
      { term: 'Irrevocable Trust for Asset Protection', def: 'An irrevocable trust, once created, cannot generally be changed by the grantor. In exchange for that loss of control, assets placed in the trust are no longer in the grantor\'s estate for tax purposes and may be protected from future creditors. Business owners in high-liability industries use these structures to remove valuable assets — real estate, investments, a holding company — from personal exposure. The rules vary significantly by state and structure, and the planning must precede the claim.' },
      { term: 'Holding Company Structure', def: 'A common protection strategy separates the operating business (which carries the liability of operations) from the valuable assets it uses — real estate, equipment, intellectual property, cash reserves — held in a separate LLC or holding company. The operating company leases these assets from the holding company. A lawsuit against the operating company cannot reach the assets held in the holding company. This structural separation is one of the most effective and underused liability management techniques for small businesses.' },
      { term: 'Irrevocable Life Insurance Trust (ILIT)', def: 'If a large life insurance death benefit would push your estate over the exemption threshold ($15,000,000 in 2026), an ILIT removes the policy from your taxable estate. The trust owns the policy, pays the premiums (funded by you through annual gifts), and receives the tax-free death benefit — which can then be used to fund estate taxes on other illiquid assets like a business without requiring a forced sale.' },
    ],
    keyTakeaways: [
      'A revocable living trust is not a complicated or exotic structure. For any business owner with more than modest assets, it is the baseline continuity document — more important than a will for business purposes.',
      'Holding company structures are one of the most effective asset protection strategies available to small businesses. They are also regularly foregone because owners find the idea of multiple entities confusing. The confusion is worth working through.',
      'Irrevocable structures are powerful but they require giving up control. They should be created deliberately, with clear goals, before you face a crisis — they are not effective when set up after a problem arises.',
      'The 2026 estate tax exemption of $15,000,000 per person (double for married couples with proper planning) means most business owners are not facing immediate estate tax exposure. This could change — the current elevated exemption is set to revert after 2025 without legislation.',
    ],
  },
  {
    id: 'estate',
    title: 'Estate and Succession Planning for Companies',
    icon: FileText,
    accent: C.brown,
    tagline: 'Succession is not a single event at the end. It is a plan that should exist long before it is needed — because crisis-driven succession rarely produces good outcomes.',
    overview: [
      'A business without a succession plan is a liability, not just an asset. When an owner becomes incapacitated or dies without clear succession structure in place, the business faces simultaneous leadership vacuum, ownership confusion, potential lender acceleration, employee departures, and customer defections — all at once, while the people in charge of sorting it out are grieving.',
      'Estate planning for a business owner is fundamentally different from individual estate planning because the business itself is usually the largest and least liquid asset in the estate. That illiquidity creates a specific problem: estate taxes (if applicable) and estate administration costs must be paid in cash, but the cash may be locked inside a company that cannot be sold quickly without destroying its value.',
    ],
    concepts: [
      { term: 'The Four Succession Paths', def: '(1) Sale to a third party: the most common exit; maximizes price but requires finding a buyer, surviving due diligence, and a transition period. (2) Transfer to family: keeps the business in the family but requires planning for estate taxes, non-participating heirs, and usually the hardest professional conversations about whether family members are actually capable of running it. (3) Employee or management buyout (MBO): employees who know the business well buy it, often financed over time; preserves culture and employment. (4) Wind down: sometimes the right answer when the business depends entirely on the owner and has no transferable value without them.' },
      { term: 'Business Valuation', def: 'You cannot plan an estate around a number you are guessing at. A formal business valuation by a qualified business appraiser (CVA, ABV, or CBA credential) produces a defensible number for estate tax purposes, buy-sell agreement pricing, family transfer planning, and sale negotiations. Valuations typically use income, market, and asset approaches depending on the business type. For most small businesses, the income approach — a multiple of earnings — is primary.' },
      { term: 'Valuation Discounts for Gifting', def: 'When transferring minority interests in a business to family members or into trusts, legitimate valuation discounts for lack of control (minority discount) and lack of marketability may reduce the gift tax value of those interests by 20-40%. This means you can transfer more business value using your annual gift exclusion ($19,000 per recipient in 2026) and lifetime exemption ($15,000,000 in 2026) than the face value suggests.' },
      { term: 'Grantor Retained Annuity Trust (GRAT)', def: 'A GRAT is a trust to which you contribute business interests and receive an annuity back for a term of years. If the business appreciates faster than the IRS discount rate (the "hurdle rate"), that excess appreciation passes to heirs gift-tax free. GRATs are most effective for assets with high appreciation potential and are frequently used to transfer interests in growing businesses while the estate exemption remains elevated.' },
      { term: 'Buy-Sell Agreement as Estate Planning', def: 'A properly structured buy-sell agreement does triple duty: it protects co-owners during life, it funds the buyout of a deceased owner\'s estate so heirs get cash rather than an illiquid business interest, and it sets the estate tax value of the business interest — preventing the IRS from using a higher independent valuation. The agreement\'s pricing formula must be arm\'s-length and followed consistently to obtain the estate tax valuation benefit.' },
      { term: 'Creating Liquidity for Estate Taxes', def: `The federal estate tax exemption is $${(TAX_2026.estate.lifetimeExemption / 1e6).toFixed(0)}M per person in 2026, but it may drop significantly if current law expires. A business owner whose estate is primarily the business faces a forced sale scenario if they die without liquidity to pay estate taxes due within nine months. Life insurance owned through an ILIT, installment payments under IRC §6166 (available for qualified closely-held business interests), and the ESOP structure are the primary liquidity tools for this problem.` },
    ],
    keyTakeaways: [
      'The document most business owners are missing is not a will — it is a business continuity plan that tells the people left behind what decisions to make, who has authority to make them, and what the owner would have wanted.',
      'A buy-sell agreement is not just legal protection; it is a kindness to your co-owners, your employees, and your family. It removes the impossible conversation about price and control during the worst moment of everyone\'s lives.',
      'Family transfer planning works best when started early and executed gradually — not as a deathbed transaction. Early transfers capture lower valuations, lower gift tax values, and more time for appreciation to accumulate outside the estate.',
      'Every business owner should have a formal valuation done, even if just for personal knowledge. The owner\'s intuitive sense of what the business is worth is almost always either significantly optimistic or significantly pessimistic relative to what a buyer would actually pay.',
    ],
  },
  {
    id: 'team',
    title: 'Your Professional Team',
    icon: Users,
    accent: C.gold,
    tagline: 'The CPA, the CFP, and the attorney are not interchangeable. Each does something the others are not trained or licensed to do — and the gap between having one and having all three is often the gap between good planning and comprehensive planning.',
    overview: [
      'Most small business owners have at most one professional advisor. Usually a tax preparer, sometimes a CPA, rarely a financial planner, almost never a coordinated team. They get good advice in the lane that advisor occupies, and they get none in the lanes that advisor does not cover — often without knowing what they are missing.',
      'The advice most owners have never received is how these three roles relate to each other and when each one actually earns their cost. The answer is: consistently, if you are in the right stage of business and the right professional is doing the right job.',
    ],
    roles: [
      { title: 'CPA (Certified Public Accountant)', color: C.gold, responsibilities: ['Prepares business and personal tax returns', 'Identifies and claims all available deductions', 'Designs tax strategy aligned with business structure', 'Recommends entity structure changes based on income levels', 'Coordinates quarterly estimated payments and year-end tax planning', 'Represents you in an IRS audit', 'Advises on retirement plan contribution timing and types'], whenYouNeedOne: 'As soon as your business generates meaningful income. A $2,000/year CPA who finds $8,000 in missed deductions is not costing you money.', whatToLookFor: 'Experience with your entity type and industry. Active practice, not just tax season. Proactive outreach, not just annual tax prep.' },
      { title: 'CFP (Certified Financial Planner)', color: C.teal, responsibilities: ['Integrates the business into your full personal financial plan', 'Models whether the business sale or ongoing distributions can fund retirement', 'Coordinates investment strategy across personal and business accounts', 'Designs and monitors retirement plan selection and funding', 'Models insurance needs — personal and business', 'Connects estate planning goals to the financial plan', 'Tracks progress toward financial independence separate from business value'], whenYouNeedOne: 'When the business is generating real profit and you need to think about what to do with it — beyond just reinvesting. When you are starting to model exit scenarios.', whatToLookFor: 'Fee-only fiduciary. Experience with business owners specifically. Understanding of the interaction between business income and personal wealth planning.' },
      { title: 'Business Attorney', color: C.brown, responsibilities: ['Drafts and reviews formation documents, operating agreements, and bylaws', 'Designs and executes the buy-sell agreement', 'Structures equity arrangements for partners and key employees', 'Drafts and reviews major contracts', 'Manages employment law compliance and documentation', 'Guides entity restructuring when the CPA recommends it', 'Designs and executes estate documents — will, trust, powers of attorney, healthcare directive'], whenYouNeedOne: 'At formation, when entering a partnership, when creating a buy-sell agreement, when you have employees, before any major transaction. Not after the problem.', whatToLookFor: 'Business law focus, not a general practice attorney. Experience with your entity type and industry. Someone who will give you the hard answer, not just the easy one.' },
    ],
    keyTakeaways: [
      'The cost of not having the right advisor is almost always higher than the cost of having them. The missed deductions, the unnecessary tax exposure, the legal agreement that was never drafted — these have real dollar consequences that dwarf advisory fees.',
      'These three professionals need to talk to each other about your situation. If they never have, you likely have gaps between the advice you are getting. A coordinated team is more than the sum of its parts.',
      'When in doubt about whether you need a professional for something specific, the answer is almost certainly yes. The complexity of business taxation, business law, and financial planning is genuinely high. This section exists to orient you, not to replace the professional.',
      'The right advisors grow with you. An advisor who was right for your business at $200K in revenue may not be right at $2M. Review relationships when the business changes materially.',
    ],
  },
]

/* ─── Assessment configuration ───────────────────────────────────────────── */
const ASSESS_STEPS = [
  {
    id: 'entity',
    title: 'Business Profile',
    subtitle: 'Your structure, industry, and stage',
    fields: [
      { key: 'entityType', label: 'What is your current business entity?', type: 'radio', options: ['Sole Proprietor', 'Single-Member LLC', 'Multi-Member LLC / Partnership', 'S-Corporation', 'C-Corporation', 'Not sure yet'] },
      { key: 'ownerCount', label: 'How many owners or partners?', type: 'radio', options: ['Just me', '2 owners', '3–4 owners', '5 or more'] },
      { key: 'industry', label: 'Industry', type: 'radio', options: ['Professional Services (law, consulting, finance)', 'Healthcare or Medical', 'Technology', 'Construction or Trades', 'Real Estate', 'Retail or Restaurant', 'Creative or Media', 'Manufacturing', 'Other'] },
      { key: 'yearsInBusiness', label: 'Years in business', type: 'radio', options: ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years'] },
    ],
  },
  {
    id: 'financials',
    title: 'Financials & Income',
    subtitle: 'Revenue, profit, and how you pay yourself',
    fields: [
      { key: 'annualRevenue', label: 'Annual business revenue', type: 'number', prefix: '$', placeholder: '350000' },
      { key: 'annualExpenses', label: 'Annual business expenses (all operating costs)', type: 'number', prefix: '$', placeholder: '200000' },
      { key: 'ownerSalary', label: 'Annual salary or draws you take from the business', type: 'number', prefix: '$', placeholder: '80000' },
      { key: 'paymentMethod', label: 'How do you pay yourself?', type: 'radio', options: ['W-2 salary (S-corp)', 'Owner draws', 'Distributions only', 'Combination', 'I have not set this up formally'] },
      { key: 'makesEstimated', label: 'Do you make quarterly estimated tax payments?', type: 'yesno' },
      { key: 'separateFinances', label: 'Are personal and business finances completely separate?', type: 'yesno' },
    ],
  },
  {
    id: 'team',
    title: 'Team and Benefits',
    subtitle: 'Employees, plans, and what you offer',
    fields: [
      { key: 'employeeCount', label: 'Full-time employees (not counting yourself)', type: 'radio', options: ['None — solo operator', '1–2 employees', '3–5 employees', '6–10 employees', '11–25 employees', '25+ employees'] },
      { key: 'offersRetirement', label: 'Do you currently offer a retirement plan?', type: 'yesno' },
      { key: 'retirementPlanType', label: 'Which type of retirement plan?', type: 'radio', options: ['SEP IRA', 'SIMPLE IRA', 'Solo 401(k)', 'Traditional or Safe Harbor 401(k)', 'Defined Benefit or Cash Balance Plan', 'Multiple plans'], condition: d => d.offersRetirement === 'yes' },
      { key: 'offersHealth', label: 'Do you offer health insurance to employees?', type: 'yesno' },
      { key: 'hasKeyPerson', label: 'Is there a key person (including yourself) whose departure would significantly hurt the business?', type: 'yesno' },
    ],
  },
  {
    id: 'personal',
    title: 'Personal Financial Picture',
    subtitle: 'Your age, savings, and what the business means to your future',
    fields: [
      { key: 'ownerAge', label: 'Your age', type: 'number', prefix: '', placeholder: '45' },
      { key: 'filingStatus', label: 'Tax filing status', type: 'radio', options: ['Single', 'Married filing jointly', 'Married filing separately', 'Head of household'] },
      { key: 'personalSavings', label: 'Total personal retirement savings (all accounts outside the business)', type: 'number', prefix: '$', placeholder: '150000' },
      { key: 'businessIsRetirement', label: 'Do you plan to use the business or its sale to fund your retirement?', type: 'yesno' },
      { key: 'exitTimeline', label: 'Target exit or retirement timeline', type: 'radio', options: ['Within 5 years', '5–10 years', '10–20 years', 'No specific timeline yet'] },
    ],
  },
  {
    id: 'protection',
    title: 'Protection, Planning, and Advisors',
    subtitle: 'Insurance, estate documents, and your professional team',
    fields: [
      { key: 'hasCPA', label: 'Do you work with a CPA (not just a tax preparer)?', type: 'yesno' },
      { key: 'hasCFP', label: 'Do you work with a CFP (Certified Financial Planner)?', type: 'yesno' },
      { key: 'hasAttorney', label: 'Do you work with a business attorney?', type: 'yesno' },
      { key: 'hasKeyPersonInsurance', label: 'Does the business carry key-person life insurance?', type: 'yesno' },
      { key: 'hasBuySell', label: 'Is there a funded buy-sell agreement in place?', type: 'yesno', condition: d => d.ownerCount !== 'Just me' },
      { key: 'hasEstatePlan', label: 'Do you have personal estate planning documents (will, trust, POA, healthcare directive)?', type: 'yesno' },
      { key: 'businessValued', label: 'Has the business been formally valued within the last 3 years?', type: 'yesno' },
      { key: 'usesAI', label: 'Are you currently using AI tools in your business operations?', type: 'yesno' },
      { key: 'biggestBottleneck', label: 'What is your biggest operational time drain?', type: 'radio', options: ['Administrative and paperwork', 'Bookkeeping and financial reporting', 'Marketing and lead generation', 'Customer service and communication', 'Scheduling and coordination', 'Hiring and managing people', 'Cash flow management'] },
    ],
  },
]

/* ─── Recommendation engine ──────────────────────────────────────────────── */
function evaluate(data) {
  const revenue  = parseFloat(data.annualRevenue)  || 0
  const expenses = parseFloat(data.annualExpenses) || 0
  const netProfit = Math.max(0, revenue - expenses)
  const salary   = parseFloat(data.ownerSalary) || 0
  const age      = parseInt(data.ownerAge) || 45
  const savings  = parseFloat(data.personalSavings) || 0
  const entity   = data.entityType || 'Sole Proprietor'
  const multiOwner = data.ownerCount && data.ownerCount !== 'Just me'
  const fsKey    = data.filingStatus === 'Married filing jointly' ? 'mfj' : 'single'
  const stdDed   = TAX_2026.standardDeduction[fsKey]

  const isPassThrough = !entity.includes('C-Corporation')
  const isSolePropOrLLC = entity.includes('Sole Proprietor') || entity.includes('LLC')
  const isSCorp  = entity.includes('S-Corporation')

  // ── Scores ──
  let taxScore = 40, retScore = 40, riskScore = 40, succScore = 40, opsScore = 40

  // Tax efficiency
  if (isSCorp) taxScore += 20
  if (data.offersRetirement === 'yes') taxScore += 15
  if (data.makesEstimated === 'yes') taxScore += 10
  if (data.hasCPA === 'yes') taxScore += 15
  if (data.separateFinances === 'yes') taxScore += 5
  if (isSolePropOrLLC && netProfit > 50000) taxScore -= 15  // missing S-corp opportunity
  if (!data.makesEstimated || data.makesEstimated === 'no') taxScore -= 5

  // Retirement readiness
  if (data.offersRetirement === 'yes') retScore += 25
  if (savings > 500000) retScore += 20
  else if (savings > 200000) retScore += 12
  else if (savings > 50000) retScore += 6
  if (age < 45) retScore += 10  // time is on their side
  if (data.businessIsRetirement === 'no' && savings > 0) retScore += 10  // diversified thinking
  if (data.businessIsRetirement === 'yes' && savings < 100000) retScore -= 10

  // Risk protection
  if (data.hasKeyPersonInsurance === 'yes') riskScore += 20
  if (data.hasBuySell === 'yes' || (!multiOwner && data.hasBuySell !== 'no')) riskScore += 20
  if (data.hasCPA === 'yes') riskScore += 10
  if (data.hasAttorney === 'yes') riskScore += 15
  if (data.offersHealth === 'yes') riskScore += 5

  // Succession readiness
  if (data.hasEstatePlan === 'yes') succScore += 20
  if (data.businessValued === 'yes') succScore += 20
  if (data.hasBuySell === 'yes') succScore += 20
  if (data.exitTimeline && !data.exitTimeline.includes('No specific')) succScore += 10
  if (data.hasAttorney === 'yes') succScore += 10
  if (data.businessIsRetirement === 'yes' && !data.businessValued) succScore -= 10

  // Operations and team
  if (data.hasCPA === 'yes') opsScore += 15
  if (data.hasCFP === 'yes') opsScore += 15
  if (data.usesAI === 'yes') opsScore += 15
  if (data.separateFinances === 'yes') opsScore += 5
  if (data.hasAttorney === 'yes') opsScore += 10

  const clamp = v => Math.min(100, Math.max(5, Math.round(v)))
  const scores = {
    taxEfficiency:     clamp(taxScore),
    retirementReady:   clamp(retScore),
    riskProtection:    clamp(riskScore),
    succession:        clamp(succScore),
    operationsTeam:    clamp(opsScore),
  }

  // ── Recommendations ──
  const recs = []

  // S-Corp election
  if (isSolePropOrLLC && netProfit > 45000) {
    const fullSE   = calcSETax(netProfit)
    const reasonSalary = Math.max(40000, Math.min(salary || netProfit * 0.5, 120000))
    const sCorpSE  = calcSETax(reasonSalary)
    const savings_ = Math.round(fullSE - sCorpSE)
    recs.push({
      category: 'tax', priority: 'high',
      title: 'Evaluate S-Corporation Tax Election',
      body: `As a ${entity} earning ${fmt(netProfit)} in annual net profit, you are paying self-employment tax on your full earnings. An S-corp election allows you to pay yourself a reasonable salary (let's say around ${fmt(reasonSalary)}) and take remaining profit as distributions — which are not subject to SE tax. Based on your numbers, this structural change could reduce your annual payroll tax burden by an estimated ${fmt(savings_)} or more. The S-corp election costs roughly $1,500–3,000 per year in additional administrative expenses (payroll processing and a separate corporate return). The net savings are typically significant well above $50K in net profit.`,
      impact: `~${fmt(savings_)} estimated annual payroll tax reduction`,
      professional: 'CPA + Business Attorney',
    })
  }

  // Retirement plan
  if (data.offersRetirement !== 'yes' && netProfit > 30000) {
    const employees = data.employeeCount || 'None'
    const isSolo = employees.includes('None') || employees.includes('solo')
    const planName = isSolo ? 'Solo 401(k)' : 'Safe Harbor 401(k) or SEP IRA'
    const maxContrib = isSolo ? TAX_2026.retirement.dcTotalLimit : TAX_2026.retirement.sepLimit
    const taxSaving = Math.round(Math.min(netProfit * 0.3, maxContrib) * 0.28)
    recs.push({
      category: 'retirement', priority: 'high',
      title: `Open a ${planName}`,
      body: `You currently have no retirement plan in place. For a business at your income level, a retirement plan is simultaneously your most powerful tax deduction and the foundation of your financial independence outside the business. A ${planName} would allow you to contribute up to ${fmt(maxContrib)} per year${age >= 50 ? ` (plus catch-up contributions available at age ${age})` : ''}, reducing your taxable income dollar-for-dollar. At your likely marginal rate, a ${fmt(Math.min(netProfit * 0.3, maxContrib))} annual contribution could reduce your federal and state tax bill by an estimated ${fmt(taxSaving)} or more.`,
      impact: `Up to ${fmt(maxContrib)}/yr in tax-deferred contributions`,
      professional: 'CPA + Financial Custodian',
    })
  }

  // Quarterly estimated payments
  if (data.makesEstimated !== 'yes') {
    recs.push({
      category: 'tax', priority: 'high',
      title: 'Set Up Quarterly Estimated Tax Payments',
      body: `The IRS requires business owners to pay estimated taxes four times per year (typically April 15, June 15, September 15, January 15). You have indicated you are not currently making these payments. Missing them results in underpayment penalties assessed on the amount owed, regardless of whether you pay in full at filing. If your net profit is ${fmt(netProfit)}, your estimated quarterly federal tax payment would be roughly ${fmt(Math.round(netProfit * 0.28 / 4))}. Your CPA can calculate precise amounts based on your prior-year safe harbor and current-year projections.`,
      impact: 'Eliminates underpayment penalties',
      professional: 'CPA',
    })
  }

  // Buy-sell agreement for multiple owners
  if (multiOwner && data.hasBuySell !== 'yes') {
    recs.push({
      category: 'protection', priority: 'high',
      title: 'Create a Funded Buy-Sell Agreement',
      body: `You have multiple owners and no buy-sell agreement in place. This is one of the most significant unaddressed risks in your business. A buy-sell agreement legally defines what happens to an owner's interest if they die, become permanently disabled, divorce, go bankrupt, or choose to exit. Without one, a deceased owner's heirs — who may have no interest in or capability to participate in the business — can become your new partners. A properly funded buy-sell (typically funded with life and disability insurance) ensures a clean transition: surviving owners buy out the departing owner's interest at a pre-agreed price, funded by insurance proceeds that arrive when needed.`,
      impact: 'Critical ownership continuity protection',
      professional: 'Business Attorney + Insurance Specialist',
    })
  }

  // Key-person insurance
  if (data.hasKeyPerson === 'yes' && data.hasKeyPersonInsurance !== 'yes') {
    recs.push({
      category: 'protection', priority: 'high',
      title: 'Obtain Key-Person Life Insurance',
      body: `You have identified that this business has a key person whose loss would significantly impact operations. Yet the business carries no key-person insurance. Key-person coverage is a life insurance policy owned by the company, on the key person, with the company as beneficiary. At death, the tax-free proceeds give the business capital to: replace the person, service any debt tied to their relationships or guarantees, stabilize cash flow through the transition, and fund emergency operations. Coverage is typically sized at 5–10 times the key person's annual contribution to revenue or earnings. For a ${entity} at your revenue level, a ${fmt(revenue * 0.5)}–${fmt(revenue)} policy would be a reasonable starting point.`,
      impact: 'Business continuity on death of a key person',
      professional: 'Insurance Specialist + Attorney',
    })
  }

  // CPA
  if (data.hasCPA !== 'yes') {
    recs.push({
      category: 'team', priority: 'high',
      title: 'Engage a CPA with Business Owner Experience',
      body: `You do not currently work with a CPA. At ${fmt(revenue)} in annual revenue, the complexity of your tax situation — entity structure, self-employment tax, retirement plan contributions, deductions, quarterly payments — almost certainly warrants professional tax guidance. A qualified CPA who works with business owners will typically save more in taxes than they cost in fees within the first year. Look for a CPA who is proactive (not just a once-a-year tax preparer), experienced in your entity type and industry, and willing to discuss strategy throughout the year — not just in April.`,
      impact: 'Likely positive ROI in year one through tax savings',
      professional: 'CPA',
    })
  }

  // CFP
  if (data.hasCFP !== 'yes' && (savings > 50000 || data.businessIsRetirement === 'yes')) {
    recs.push({
      category: 'team', priority: 'medium',
      title: 'Engage a Fee-Only CFP Who Works with Business Owners',
      body: `A Certified Financial Planner integrates your business finances into your overall personal financial plan — modeling whether the business can realistically fund your retirement, coordinating investment strategy across all accounts, designing the right retirement plan structure, and modeling exit scenarios. This is the planning that most business owners never get, because their CPA does not do it (taxes and financial planning are different disciplines) and they do not have a financial planner. Look for a fee-only, fiduciary CFP with specific experience advising business owners — the intersection of business income and personal wealth planning requires that specialization.`,
      impact: 'Comprehensive financial plan integrating business and personal wealth',
      professional: 'CFP (fee-only, fiduciary)',
    })
  }

  // Attorney
  if (data.hasAttorney !== 'yes') {
    recs.push({
      category: 'team', priority: 'medium',
      title: 'Retain a Business Attorney',
      body: `You do not have a business attorney. The legal risk surface of a running business — contracts, employment, intellectual property, entity documents, partnership agreements, buy-sell — is real and present regardless of how things are going today. Business attorneys are most valuable before problems arise: drafting the operating agreement that prevents a dispute, creating the buy-sell that prevents a crisis, reviewing the contract that protects your position. A reactive relationship with an attorney (calling one when something has already gone wrong) is significantly more expensive than a proactive one.`,
      impact: 'Legal protection across operations, contracts, and partnerships',
      professional: 'Business Attorney',
    })
  }

  // Estate planning
  if (data.hasEstatePlan !== 'yes') {
    recs.push({
      category: 'succession', priority: 'high',
      title: 'Create Personal Estate Planning Documents',
      body: `You do not have estate planning documents in place. As a business owner, the absence of a will, a trust, a durable power of attorney, and a healthcare directive is particularly high-risk — because the business does not stop when you cannot make decisions. A revocable living trust holding your business interest ensures that a named successor trustee can step in immediately if you die or become incapacitated, without waiting for probate (which can take 12–24 months). A durable power of attorney allows someone you trust to manage the business and sign documents on your behalf during incapacity. These are the continuity documents the business needs, not just the personal estate.`,
      impact: 'Business continuity through death or incapacity; avoids probate',
      professional: 'Business Attorney / Estate Attorney',
    })
  }

  // Valuation
  if (data.businessValued !== 'yes' && (data.exitTimeline || revenue > 200000)) {
    recs.push({
      category: 'succession', priority: 'medium',
      title: 'Commission a Formal Business Valuation',
      body: `Your business has not been formally valued. If ${data.businessIsRetirement === 'yes' ? 'you plan to use the business to fund your retirement' : 'you have an exit in mind'}, a formal valuation from a Certified Valuation Analyst (CVA) or Accredited Business Valuator (ABV) gives you a defensible, realistic number to plan around. Most business owners significantly over- or under-estimate their business value. A valuation also establishes the pricing basis for a buy-sell agreement, gift tax planning if you are transferring interests to family, and any estate planning around the business interest. Valuations are typically $2,000–8,000 depending on complexity — a small investment relative to the decisions it informs.`,
      impact: 'Accurate planning foundation for exit, estate, and buy-sell',
      professional: 'CVA or ABV Credential Holder',
    })
  }

  // AI operations
  if (data.usesAI !== 'yes') {
    const bottleneck = data.biggestBottleneck || 'administrative tasks'
    const aiRec = {
      'Administrative and paperwork': 'AI document drafting tools (Claude, ChatGPT) can generate first drafts of contracts, proposals, emails, and policies. A one-hour document drafting task can become a 10-minute review task.',
      'Bookkeeping and financial reporting': 'Modern bookkeeping tools with AI categorization (QuickBooks, Xero) automate transaction classification and reconciliation. AI-powered tools like Ramp or Brex can automate expense reporting entirely.',
      'Marketing and lead generation': 'AI content tools can generate social media, email campaigns, and ad copy at scale. CRM tools with AI scoring (HubSpot) prioritize your highest-probability leads so you spend time on the right conversations.',
      'Customer service and communication': 'AI chatbots and email responders handle initial customer inquiries 24/7, freeing your team for complex conversations. Tools like Intercom and Zendesk now have robust AI tiers.',
      'Scheduling and coordination': 'Calendly and similar AI scheduling tools eliminate the back-and-forth of meeting coordination. AI assistants can manage inbox triage and draft routine responses.',
      'Hiring and managing people': 'AI-powered ATS tools (Ashby, Greenhouse) screen applications at scale. AI performance review frameworks structure feedback conversations consistently.',
      'Cash flow management': 'Float, Dryrun, and similar tools use AI to project cash flow 30–90 days out based on your actual patterns — replacing the spreadsheet and the guesswork.',
    }
    const specificRec = aiRec[bottleneck] || 'AI process automation tools can reduce the manual overhead of most administrative tasks by 40–70%.'
    recs.push({
      category: 'operations', priority: 'medium',
      title: 'Implement AI Tools in Your Operations',
      body: `You have not yet incorporated AI tools into your business. Your biggest time drain is ${bottleneck.toLowerCase()}. ${specificRec} The highest-ROI AI implementations start narrow and specific: pick the single most time-consuming repetitive task, find the right tool for it, implement it with clear measurement of time saved, then move to the next. Businesses that have integrated AI deliberately into operations consistently report 10–25% of leadership time recovered for higher-value work.`,
      impact: 'Estimated 5–15 hrs/week recovered from operational overhead',
      professional: 'Independent — start with a free trial',
    })
  }

  // Separate finances
  if (data.separateFinances !== 'yes') {
    recs.push({
      category: 'operations', priority: 'medium',
      title: 'Completely Separate Business and Personal Finances',
      body: `Commingling personal and business finances is one of the most common and consequential administrative errors for small business owners. It undermines the liability protection of your LLC or corporation (courts can "pierce the corporate veil" when owners do not treat the entity as a genuinely separate entity), creates significant bookkeeping complexity and audit risk, and makes it almost impossible to understand what the business is actually earning and costing. Open a dedicated business checking account, obtain a business credit card, and run all business revenue and expenses exclusively through those accounts.`,
      impact: 'Preserves liability protection; dramatically simplifies bookkeeping',
      professional: 'CPA — can advise on account structure',
    })
  }

  // Executive summary
  const allScores = Object.values(scores)
  const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
  const highPri = recs.filter(r => r.priority === 'high').length
  const summary = avgScore >= 75
    ? `Your business is well-structured across most planning dimensions. The priority now is ${recs[0]?.title?.toLowerCase() || 'refining the areas shown below'}.`
    : avgScore >= 50
    ? `Your business has solid foundations in some areas but carries meaningful gaps — particularly ${recs.filter(r => r.priority === 'high').slice(0, 2).map(r => r.title.toLowerCase()).join(' and ')}. Addressing the ${highPri} high-priority recommendations below will have the largest impact on your tax efficiency, protection, and long-term financial security.`
    : `Your business has significant planning opportunities across multiple dimensions. The good news: most of the high-priority recommendations below are straightforward to act on with the right professional support. Focus on the top three, starting with ${recs[0]?.title || 'the items highlighted below'}.`

  return { scores, recs, summary, avgScore, netProfit }
}

/* ─── Hub view ───────────────────────────────────────────────────────────── */
function HubView({ setView, wizardDone, avgScore }) {
  const moduleGrid = [
    { icon: Building2, label: 'Entity Structures', accent: '#c9a96e' },
    { icon: Scale,     label: 'Taxation Deep Dive', accent: '#8b6340' },
    { icon: Target,    label: 'Retirement Plans',   accent: '#c9a96e' },
    { icon: Heart,     label: 'Benefits Strategy',  accent: '#8b6340' },
    { icon: Shield,    label: 'Business Insurance', accent: '#c9a96e' },
    { icon: Lock,      label: 'Trusts & Structure', accent: '#8b6340' },
    { icon: FileText,  label: 'Estate Planning',    accent: '#c9a96e' },
    { icon: Users,     label: 'Professional Team',  accent: '#8b6340' },
  ]

  const assessSteps = ['Entity & Ownership', 'Financials', 'Team', 'Personal Goals', 'Protection']

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.brownDim, border: `1px solid ${C.brownBdr}`, borderRadius: 6, padding: '4px 12px', marginBottom: 18 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.brown }} />
          <span style={{ fontSize: 10, fontFamily: UI, fontWeight: 700, color: C.brown, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Business Owner</span>
        </div>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 700, color: C.t1, margin: '0 0 14px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          The Financial Layer<br />Beneath Your Business
        </h1>
        <p style={{ fontFamily: UI, fontSize: 14, color: C.t2, lineHeight: 1.8, margin: '0 0 28px', maxWidth: 580 }}>
          The knowledge a great CPA, CFP, and business attorney carry in their heads — structured so you can learn it, apply it to your situation, and act on it. This is not a pile of articles. It ends in a personalized plan.
        </p>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { val: '8', label: 'Education Modules' },
            { val: '5', label: 'Assessment Sections' },
            { val: '10+', label: 'Personalized Recs' },
            { val: '2026', label: 'Tax Year Data' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
              <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 800, color: C.gold }}>{s.val}</span>
              <span style={{ fontFamily: UI, fontSize: 11, color: C.t3, fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bento grid */}
      <div className="bp-bento" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto', gap: 14, marginBottom: 20 }}>

        {/* Card 1 — Education Library (full width top) */}
        <div
          onClick={() => setView('learn')}
          style={{ gridColumn: '1 / -1', background: C.surf, border: `1px solid ${C.b2}`, borderRadius: 18, padding: '28px 30px', cursor: 'pointer', transition: 'border-color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold + '55' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.b2 }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: C.goldDim, border: `1px solid ${C.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={17} color={C.gold} />
                </div>
                <span style={{ fontSize: 10, fontFamily: UI, fontWeight: 700, color: C.gold, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Education Library</span>
                <span style={{ fontSize: 10, fontFamily: UI, fontWeight: 600, color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBdr}`, borderRadius: 4, padding: '2px 7px' }}>8 Modules</span>
              </div>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, color: C.t1, margin: '0 0 6px', letterSpacing: '-0.01em' }}>Eight Dimensions of Business Finance</h2>
              <p style={{ fontFamily: UI, fontSize: 12, color: C.t2, lineHeight: 1.65, margin: 0, maxWidth: 480 }}>
                Every critical area from entity structure to estate planning — explained with real numbers and clear mechanisms, not textbook definitions.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.goldDim, border: `1px solid ${C.goldBdr}`, borderRadius: 8, padding: '8px 14px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: C.gold }}>Enter Library</span>
              <ArrowRight size={13} color={C.gold} />
            </div>
          </div>
          {/* Module grid preview */}
          <div className="bp-module-preview" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {moduleGrid.map((m, i) => {
              const Icon = m.icon
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.raise, border: `1px solid ${C.b1}`, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: m.accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={12} color={m.accent} />
                  </div>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: C.t3, marginBottom: 2 }}>0{i + 1}</div>
                    <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 600, color: C.t2, lineHeight: 1.2 }}>{m.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Card 2 — Business Assessment */}
        <div
          onClick={() => setView('assess')}
          style={{ background: C.surf, border: `1px solid ${C.b2}`, borderRadius: 18, padding: '26px 28px', cursor: 'pointer', transition: 'border-color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.brown + '55' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.b2 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: C.brownDim, border: `1px solid ${C.brownBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={17} color={C.brown} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: UI, fontWeight: 700, color: C.brown, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>Business Assessment</div>
              <div style={{ fontFamily: UI, fontSize: 10, color: C.t3 }}>5 sections · 5–8 min</div>
            </div>
          </div>
          <h3 style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: C.t1, margin: '0 0 8px', letterSpacing: '-0.01em' }}>Diagnose Where You Stand</h3>
          <p style={{ fontFamily: UI, fontSize: 12, color: C.t2, lineHeight: 1.65, margin: '0 0 20px' }}>
            The questions a CPA, CFP, and business attorney ask in a first meeting — structured into a 5-section diagnostic that feeds your personalized recommendations.
          </p>
          {/* Step preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {assessSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.raise, border: `1px solid ${C.b2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: C.t3 }}>{i + 1}</span>
                </div>
                <span style={{ fontFamily: UI, fontSize: 11, color: C.t2 }}>{step}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: C.brown }}>Start Assessment</span>
            <ArrowRight size={13} color={C.brown} />
          </div>
        </div>

        {/* Card 3 — My Business Plan */}
        <div
          onClick={() => wizardDone && setView('results')}
          style={{ background: C.surf, border: `1px solid ${wizardDone ? C.success + '44' : C.b2}`, borderRadius: 18, padding: '26px 28px', cursor: wizardDone ? 'pointer' : 'default', transition: 'border-color 0.15s', position: 'relative', overflow: 'hidden' }}
          onMouseEnter={e => { if (wizardDone) e.currentTarget.style.borderColor = C.success + '88' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = wizardDone ? C.success + '44' : C.b2 }}
        >
          {!wizardDone && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,20,16,0.55)', backdropFilter: 'blur(2px)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
              <div style={{ textAlign: 'center' }}>
                <Lock size={22} color={C.t3} style={{ marginBottom: 10 }} />
                <div style={{ fontFamily: UI, fontSize: 12, color: C.t3, fontWeight: 600 }}>Complete the assessment</div>
                <div style={{ fontFamily: UI, fontSize: 11, color: C.t3, marginTop: 4 }}>to unlock your plan</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: wizardDone ? C.success + '18' : C.b1, border: `1px solid ${wizardDone ? C.success + '44' : C.b2}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={17} color={wizardDone ? C.success : C.t3} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: UI, fontWeight: 700, color: wizardDone ? C.success : C.t3, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>My Business Plan</div>
              {wizardDone && avgScore != null && (
                <div style={{ fontFamily: MONO, fontSize: 10, color: C.t2 }}>Score: {avgScore}/100</div>
              )}
            </div>
          </div>
          <h3 style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: C.t1, margin: '0 0 8px', letterSpacing: '-0.01em' }}>Your Personalized Recommendations</h3>
          <p style={{ fontFamily: UI, fontSize: 12, color: C.t2, lineHeight: 1.65, margin: '0 0 20px' }}>
            After the assessment, this section delivers a prioritized roadmap — tax moves, protection gaps, retirement strategy — with the professionals to involve for each item.
          </p>
          {/* Score preview bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Tax Efficiency', 'Retirement Readiness', 'Risk Protection', 'Succession', 'Operations'].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontFamily: UI, fontSize: 10, color: C.t3, width: 110, flexShrink: 0 }}>{label}</div>
                <div style={{ flex: 1, height: 4, background: C.raise, borderRadius: 99 }}>
                  <div style={{ height: '100%', borderRadius: 99, width: wizardDone ? '65%' : '0%', background: `linear-gradient(90deg, ${C.brown}, ${C.gold})`, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
          {wizardDone && (
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: C.success }}>View My Plan</span>
              <ArrowRight size={13} color={C.success} />
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ background: C.goldDim, border: `1px solid ${C.goldBdr}`, borderRadius: 10, padding: '13px 18px' }}>
        <p style={{ fontFamily: UI, fontSize: 11, color: C.t2, lineHeight: 1.6, margin: 0 }}>
          <span style={{ fontWeight: 700, color: C.gold }}>For educational purposes.</span>{' '}
          Explains financial concepts and generates illustrative estimates based on 2026 tax figures. Not tax, legal, or financial advice. Every recommendation flags the appropriate professional for execution.
        </p>
      </div>

    </div>
  )
}

/* ─── Why Planning Matters section ──────────────────────────────────────── */
function WhyPlanSection({ onEnter }) {
  const SURVIVAL = [
    { gen: 'Founder', pct: 100, label: 'Generation 1' },
    { gen: '2nd Gen', pct: 30,  label: 'Generation 2' },
    { gen: '3rd Gen', pct: 12,  label: 'Generation 3' },
    { gen: '4th Gen', pct: 3,   label: 'Generation 4+' },
  ]

  const FAILURE_MODES = [
    {
      icon: DollarSign,
      title: 'Tax Exposure at Transfer',
      body: 'Without a properly structured estate and business succession plan, the transfer of a business — whether by death, disability, or sale — can trigger federal estate taxes up to 40%, capital gains taxes on appreciated value, and state-level death taxes depending on domicile. For a business worth $2 million, that can mean $600,000 or more leaving the family before the transition even completes. The cruel irony: the tax liability is created by the owner\'s death, but must be paid in cash within nine months of it — often forcing a rushed or discounted sale of the very business it was created from.',
    },
    {
      icon: AlertTriangle,
      title: 'Forced Liquidation',
      body: 'When a business owner dies or becomes permanently disabled with no succession plan in place, the practical consequences compound quickly. Creditors may call loans. Banks may freeze lines of credit. Partners who never signed a buy-sell agreement can become co-owners with the deceased\'s heirs — people who may have no relationship with, no knowledge of, and no interest in the business. Courts and probate can freeze business assets for 12 to 24 months while disputes resolve. In many cases, businesses that were entirely viable and profitable are liquidated at cents on the dollar simply because no one had legal authority to run them.',
    },
    {
      icon: TrendingUp,
      title: 'Value Destruction from Unpreparedness',
      body: 'The third failure mode is slower and quieter: businesses that survive the transition but hemorrhage value in the years following. A 2023 study by the Exit Planning Institute found that 76% of business owners who planned to exit within ten years had no written transition plan. Of those businesses that did transfer, the owners left an average of 20-30% of enterprise value on the table compared to businesses with formal exit plans — a gap created by poor timing, wrong structure, untransferred customer relationships, key-person dependency, and missed tax optimization windows that close permanently once the transfer is complete.',
    },
  ]

  const COMPARISON = [
    { topic: 'Federal estate tax on $3M business', without: 'Up to $1.05M+ due within 9 months', with: 'Potentially $0 with proper trust and gifting structures' },
    { topic: 'Retirement income from the business', without: 'Uncertain — depends entirely on sale proceeds', with: 'Structured: defined retirement plan + sale timing optimization' },
    { topic: 'Business survival after owner exit', without: '70% fail within 5 years of transition', with: '4x more likely to succeed with documented succession plan' },
    { topic: 'Self-employment tax on $250K profit', without: 'Full $35,300+ annually as sole prop or default LLC', with: 'Potentially $15,000–18,000 with S-Corp election and proper salary' },
    { topic: 'Retirement contributions', without: 'IRA limit: $7,000/yr ($8,000 if 50+)', with: 'Solo 401(k) or SEP-IRA: up to $70,000/yr tax-deferred' },
    { topic: 'Outcome if owner becomes disabled', without: 'Business operations stall; personal finances collapse', with: 'Disability insurance + POA + operating agreement = continuity' },
    { topic: 'Value realized on exit', without: '20-30% below market from rushed/unplanned sale', with: 'Market rate or premium with advance positioning and structure' },
  ]

  const PILLARS = [
    { icon: Building2, color: C.gold, title: 'Entity & Tax Structure', stat: 'Up to 60% reduction in SE tax', body: 'The entity you operate under determines your entire tax profile. Most business owners never revisit the decision after formation. An S-Corp election alone can save $10,000–$30,000 per year in self-employment taxes at typical income levels.' },
    { icon: Target, color: C.brown, title: 'Retirement Architecture', stat: 'Up to $70,000/yr tax-deferred', body: 'Business owners have access to retirement plans that employees never see: Solo 401(k)s, SEP-IRAs, defined benefit plans. Used correctly, these simultaneously reduce current-year taxes and build wealth outside the business.' },
    { icon: Shield, color: C.gold, title: 'Protection Layer', stat: '65% of exits involve a crisis', body: 'Key-person insurance, buy-sell agreements, and disability coverage are not optional risk management — they are the mechanisms that determine whether a business survives the unexpected. Most businesses carry none of them.' },
    { icon: FileText, color: C.brown, title: 'Succession & Estate', stat: '70% fail at generation 2', body: 'A will is not a succession plan. Transferring a business requires a structured combination of legal documents, funding mechanisms, tax planning, and timeline — none of which happen automatically after death.' },
    { icon: Users, color: C.gold, title: 'Professional Advisory Team', stat: 'Most owners work with zero', body: 'The businesses that survive generational transitions and maximize owner wealth consistently share one thing: a coordinated team of a CPA, CFP, and business attorney working together — not in silos.' },
  ]

  return (
    <div style={{ marginTop: 64 }}>

      {/* Section divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
        <div style={{ flex: 1, height: 1, background: C.b2 }} />
        <span style={{ fontSize: 10, fontFamily: UI, fontWeight: 700, color: C.t3, letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Why This Matters</span>
        <div style={{ flex: 1, height: 1, background: C.b2 }} />
      </div>

      {/* Opening statement */}
      <div style={{ marginBottom: 52 }}>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 700, color: C.t1, margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.2, maxWidth: 680 }}>
          Most Business Owners Will Never Realize the Full Value of What They Built
        </h2>
        <p style={{ fontFamily: UI, fontSize: 14, color: C.t2, lineHeight: 1.85, margin: 0, maxWidth: 680 }}>
          Not because their business wasn't valuable. Not because the market wasn't there. But because the financial, legal, and structural decisions that determine how much of that value you actually keep — and what happens to it when you're gone — were never made deliberately. They were made by default. And defaults, in business finance, almost always favor someone other than you.
        </p>
      </div>

      {/* Big stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, marginBottom: 52, background: C.b1, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.b2}` }}>
        {[
          { val: '70%', label: 'of family businesses fail to survive the transition to the second generation', src: 'Family Business Alliance' },
          { val: '$10T', label: 'in business assets expected to transfer to the next generation over the next decade', src: 'Brookings Institution' },
          { val: '55%', label: 'of small business owners have no written succession or exit plan in place today', src: 'Exit Planning Institute' },
          { val: '23%', label: 'of business owners have a documented, formal exit strategy — despite 76% planning to exit within 10 years', src: 'SCORE, 2023' },
        ].map((s, i) => (
          <div key={i} style={{ background: C.surf, padding: '28px 24px', borderRight: i < 3 ? `1px solid ${C.b2}` : 'none' }}>
            <div style={{ fontFamily: MONO, fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, color: C.gold, marginBottom: 10, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontFamily: UI, fontSize: 12, color: C.t2, lineHeight: 1.6, marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontFamily: UI, fontSize: 10, color: C.t3 }}>Source: {s.src}</div>
          </div>
        ))}
      </div>

      {/* Business survival by generation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 52, alignItems: 'start' }} className="bp-bento">
        <div>
          <SLabel>Succession Reality</SLabel>
          <h3 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, color: C.t1, margin: '0 0 14px', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
            Business Survival Rates Across Generations
          </h3>
          <p style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.8, margin: '0 0 24px' }}>
            Of every 100 businesses that operate successfully under a founder, roughly 30 will still be operating as the same business entity under the second generation. Of those 30, fewer than 4 will reach the third. By the fourth generation, fewer than 1 in 100 of the original businesses remain.
          </p>
          <p style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.8, margin: 0 }}>
            This is not a talent problem. Research consistently shows the primary causes are: no formal succession plan, inadequate estate planning, family conflict over roles and ownership, failure to develop next-generation leadership, and tax inefficiencies that erode the capital base during transfer. Every one of these is a planning problem — not a business performance problem.
          </p>
        </div>
        <div style={{ background: C.surf, border: `1px solid ${C.b2}`, borderRadius: 16, padding: '28px 24px' }}>
          <div style={{ fontSize: 10, fontFamily: UI, fontWeight: 700, color: C.t3, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24 }}>Business survival rate per generation</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {SURVIVAL.map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: s.pct === 100 ? C.t1 : C.t2 }}>{s.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: s.pct > 50 ? C.gold : s.pct > 15 ? C.t2 : C.danger }}>{s.pct}%</span>
                </div>
                <div style={{ height: 8, background: C.raise, borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.pct}%`, background: s.pct > 50 ? `linear-gradient(90deg, ${C.gold}, ${C.brown})` : s.pct > 15 ? `linear-gradient(90deg, ${C.brown}, ${C.danger}88)` : C.danger, borderRadius: 99, transition: 'width 0.6s ease' }} />
                </div>
                {i > 0 && (
                  <div style={{ fontFamily: UI, fontSize: 10, color: C.t3, marginTop: 5 }}>
                    {i === 1 ? '70 of every 100 founder-led businesses are gone by this point' : i === 2 ? '88 of every 100 are gone — only 12 remain from the original 100' : 'Fewer than 3 of the original 100 businesses still operating'}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.b1}`, fontFamily: UI, fontSize: 10, color: C.t3, lineHeight: 1.6 }}>
            Source: Family Business Alliance, MIT Sloan Family Business Research
          </div>
        </div>
      </div>

      {/* Three failure modes */}
      <div style={{ marginBottom: 52 }}>
        <div style={{ marginBottom: 28 }}>
          <SLabel>The Three Failure Modes</SLabel>
          <h3 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, color: C.t1, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
            How Unplanned Businesses Lose Value
          </h3>
          <p style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.8, maxWidth: 620 }}>
            Business value doesn't disappear all at once. It erodes through three distinct and largely avoidable failure modes — each of which operates on a different timeline and is triggered by a different event.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FAILURE_MODES.map((m, i) => {
            const Icon = m.icon
            return (
              <div key={i} style={{ background: C.surf, border: `1px solid ${C.b2}`, borderRadius: i === 0 ? '14px 14px 2px 2px' : i === 2 ? '2px 2px 14px 14px' : '2px', padding: '28px 30px', display: 'flex', gap: 22 }}>
                <div style={{ flexShrink: 0, paddingTop: 2 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: C.goldDim, border: `1px solid ${C.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={17} color={C.gold} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: C.t3 }}>0{i + 1}</span>
                    <h4 style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: C.t1, margin: 0, letterSpacing: '-0.01em' }}>{m.title}</h4>
                  </div>
                  <p style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.85, margin: 0 }}>{m.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pull quote */}
      <div style={{ background: C.raise, border: `1px solid ${C.b2}`, borderLeft: `4px solid ${C.gold}`, borderRadius: '0 14px 14px 0', padding: '28px 32px', marginBottom: 52 }}>
        <p style={{ fontFamily: DISPLAY, fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: 700, color: C.t1, lineHeight: 1.5, margin: '0 0 14px', fontStyle: 'italic' }}>
          "The average business owner spends more time planning their annual vacation than they spend planning the transition of their life's work. The result is that $10 trillion in business value is expected to change hands over the next decade — and most of it will transfer at a significant discount to what it should have been worth."
        </p>
        <div style={{ fontFamily: UI, fontSize: 11, color: C.t3, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Exit Planning Institute · 2024 State of Owner Readiness Report</div>
      </div>

      {/* Without vs. With comparison */}
      <div style={{ marginBottom: 52 }}>
        <div style={{ marginBottom: 28 }}>
          <SLabel>Planning Impact</SLabel>
          <h3 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, color: C.t1, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
            The Same Business. Two Completely Different Outcomes.
          </h3>
          <p style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.8, maxWidth: 620 }}>
            Business planning is not about pessimism or complexity. It's about the difference between an outcome that happens to you and an outcome you designed.
          </p>
        </div>
        {/* Table */}
        <div style={{ border: `1px solid ${C.b2}`, borderRadius: 14, overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: C.raise }}>
            <div style={{ padding: '14px 20px', fontFamily: UI, fontSize: 11, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.1em', borderRight: `1px solid ${C.b2}` }}>Situation</div>
            <div style={{ padding: '14px 20px', fontFamily: UI, fontSize: 11, fontWeight: 700, color: C.danger, textTransform: 'uppercase', letterSpacing: '0.1em', borderRight: `1px solid ${C.b2}`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.danger, flexShrink: 0 }} />Without Planning
            </div>
            <div style={{ padding: '14px 20px', fontFamily: UI, fontSize: 11, fontWeight: 700, color: C.success, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.success, flexShrink: 0 }} />With Planning
            </div>
          </div>
          {COMPARISON.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: `1px solid ${C.b1}`, background: i % 2 === 0 ? C.surf : C.bg }}>
              <div style={{ padding: '16px 20px', fontFamily: UI, fontSize: 12, color: C.t2, fontWeight: 500, borderRight: `1px solid ${C.b1}`, lineHeight: 1.5 }}>{row.topic}</div>
              <div style={{ padding: '16px 20px', fontFamily: UI, fontSize: 12, color: '#c0392b', lineHeight: 1.5, borderRight: `1px solid ${C.b1}` }}>{row.without}</div>
              <div style={{ padding: '16px 20px', fontFamily: UI, fontSize: 12, color: C.success, lineHeight: 1.5 }}>{row.with}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Five pillars */}
      <div style={{ marginBottom: 52 }}>
        <div style={{ marginBottom: 28 }}>
          <SLabel>The Five Pillars</SLabel>
          <h3 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, color: C.t1, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
            What Comprehensive Business Planning Actually Covers
          </h3>
          <p style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.8, maxWidth: 620 }}>
            Real business planning is not a single document or a one-time conversation. It is a coordinated architecture of five interlocking disciplines — each one building on the last.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }} className="bp-pillar-grid">
          <style>{`.bp-pillar-grid { @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
          {PILLARS.map((p, i) => {
            const Icon = p.icon
            return (
              <div key={i} style={{ background: C.surf, border: `1px solid ${C.b2}`, borderRadius: 14, padding: '22px 20px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: p.color + '18', border: `1px solid ${p.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={16} color={p.color} />
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: p.color, fontWeight: 700, marginBottom: 6 }}>{p.stat}</div>
                <div style={{ fontFamily: DISPLAY, fontSize: 13, fontWeight: 700, color: C.t1, marginBottom: 8, lineHeight: 1.3 }}>{p.title}</div>
                <div style={{ fontFamily: UI, fontSize: 11, color: C.t2, lineHeight: 1.65 }}>{p.body}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Enter CTA */}
      <div style={{ background: C.surf, border: `1px solid ${C.b2}`, borderRadius: 16, padding: '48px 36px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: C.goldDim, border: `1px solid ${C.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={22} color={C.gold} />
          </div>
        </div>
        <h3 style={{ fontFamily: DISPLAY, fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 700, color: C.t1, margin: '0 0 12px', letterSpacing: '-0.01em' }}>
          The Best Time to Start Was the Day You Opened.
        </h3>
        <p style={{ fontFamily: UI, fontSize: 14, color: C.t2, lineHeight: 1.8, margin: '0 auto 32px', maxWidth: 560 }}>
          The Second Best Time Is Now. Build your plan — education, assessment, and personalized recommendations — all in one place.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          {['No financial background required', 'Real 2026 tax figures', 'Every rec flags the right professional', 'Saves automatically'].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Check size={12} color={C.gold} />
              <span style={{ fontFamily: UI, fontSize: 12, color: C.t3 }}>{s}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onEnter}
          style={{
            fontFamily: UI, fontSize: 14, fontWeight: 700, color: C.bg,
            background: C.gold, border: 'none', borderRadius: 10,
            padding: '13px 36px', cursor: 'pointer', display: 'inline-flex',
            alignItems: 'center', gap: 8,
            boxShadow: '0 4px 20px rgba(201,169,110,0.30)',
            transition: 'filter 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'none'}
        >
          Enter Business Planning <ArrowRight size={16} />
        </button>
      </div>

    </div>
  )
}

/* ─── Module list view ───────────────────────────────────────────────────── */
function LearnView({ setView, onSelectModule }) {
  return (
    <div style={{ maxWidth: 900 }}>
      <BackBtn onClick={() => setView('hub')} label="Back to Overview" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.goldDim, border: `1px solid ${C.goldBdr}`, borderRadius: 5, padding: '3px 10px', marginBottom: 12 }}>
            <BookOpen size={11} color={C.gold} />
            <span style={{ fontSize: 10, fontFamily: UI, fontWeight: 700, color: C.gold, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Education Library</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 700, color: C.t1, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Eight Modules. Every Dimension.
          </h2>
          <p style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.7, margin: 0, maxWidth: 480 }}>
            Each module explains the mechanism behind the concept — not just the definition. Real numbers, real decisions, connected directly to your assessment.
          </p>
        </div>
        <button
          onClick={() => setView('assess')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.brownDim, border: `1px solid ${C.brownBdr}`, borderRadius: 9, padding: '10px 18px', cursor: 'pointer', flexShrink: 0 }}
        >
          <ClipboardList size={14} color={C.brown} />
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: C.brown }}>Go to Assessment</span>
          <ArrowRight size={12} color={C.brown} />
        </button>
      </div>

      {/* 2-column module grid */}
      <div className="bp-module-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {MODULES.map((mod, i) => {
          const Icon = mod.icon
          return (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              style={{
                display: 'flex', flexDirection: 'column', gap: 0,
                background: C.surf, border: `1px solid ${C.b2}`, borderRadius: 16,
                textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
                overflow: 'hidden', padding: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = mod.accent + '55'; e.currentTarget.style.background = C.raise }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.b2; e.currentTarget.style.background = C.surf }}
            >
              {/* Card top accent bar */}
              <div style={{ height: 3, background: `linear-gradient(90deg, ${mod.accent}80, ${mod.accent}20)`, width: '100%' }} />
              <div style={{ padding: '20px 22px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Number + Icon row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: C.t3, letterSpacing: '0.06em' }}>0{i + 1}</span>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: mod.accent + '18', border: `1px solid ${mod.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={17} color={mod.accent} />
                  </div>
                </div>
                {/* Title */}
                <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: C.t1, marginBottom: 8, lineHeight: 1.25, letterSpacing: '-0.01em' }}>{mod.title}</div>
                {/* Tagline */}
                <div style={{ fontFamily: UI, fontSize: 11, color: C.t2, lineHeight: 1.6, flex: 1 }}>{mod.tagline}</div>
                {/* Read link */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 16 }}>
                  <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: mod.accent }}>Read module</span>
                  <ArrowRight size={11} color={mod.accent} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Single module view ─────────────────────────────────────────────────── */
function ModuleView({ moduleId, onBack }) {
  const mod = MODULES.find(m => m.id === moduleId)
  if (!mod) return null
  const Icon = mod.icon

  return (
    <div>
      <BackBtn onClick={onBack} label="Back to Library" />

      {/* Module header */}
      <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${C.b1}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: mod.accent + '18', border: `1px solid ${mod.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color={mod.accent} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontFamily: UI, fontWeight: 700, color: mod.accent, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 3 }}>Module</div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 700, color: C.t1, margin: 0, letterSpacing: '-0.02em' }}>{mod.title}</h2>
          </div>
        </div>
        <p style={{ fontFamily: UI, fontSize: 13, color: mod.accent, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>{mod.tagline}</p>
      </div>

      {/* Overview */}
      <div style={{ marginBottom: 28 }}>
        {(mod.overview || []).map((p, i) => (
          <p key={i} style={{ fontFamily: UI, fontSize: 14, color: C.t2, lineHeight: 1.8, margin: i < mod.overview.length - 1 ? '0 0 14px' : 0 }}>{p}</p>
        ))}
      </div>

      {/* Entity comparison table */}
      {mod.entities && (
        <div style={{ marginBottom: 28 }}>
          <SLabel>Entity Comparison</SLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mod.entities.map(e => (
              <div key={e.name} style={{ ...cardSm }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: C.t1 }}>{e.name}</span>
                  <Tag color={C.gold}>{e.complexity.split(' ')[0]} Setup</Tag>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                  {[
                    { l: 'Taxation', v: e.tax },
                    { l: 'Liability', v: e.liability },
                    { l: 'QBI Deduction', v: e.qbi },
                    { l: 'Best For', v: e.bestFor },
                  ].map(({ l, v }) => (
                    <div key={l}>
                      <div style={{ fontSize: 9, fontFamily: UI, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{l}</div>
                      <div style={{ fontSize: 11, fontFamily: UI, color: C.t2, lineHeight: 1.5 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Concepts (key term explainers) */}
      {mod.concepts && (
        <div style={{ marginBottom: 28 }}>
          <SLabel>Key Concepts</SLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mod.concepts.map(c => (
              <div key={c.term} style={{ ...cardSm, borderLeft: `3px solid ${mod.accent}30` }}>
                <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: C.t1, marginBottom: 6 }}>{c.term}</div>
                <div style={{ fontFamily: UI, fontSize: 12, color: C.t2, lineHeight: 1.7 }}>{c.def}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Retirement plans */}
      {mod.plans && (
        <div style={{ marginBottom: 28 }}>
          <SLabel>Plan Comparison</SLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mod.plans.map(p => (
              <div key={p.name} style={{ ...card, padding: '18px 20px' }}>
                <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: C.t1, marginBottom: 8 }}>{p.name}</div>
                {[
                  { l: 'Contribution Limit', v: p.limit },
                  { l: 'Employee Impact', v: p.employees },
                  { l: 'Best For', v: p.bestFor },
                  { l: 'Note', v: p.note },
                ].map(({ l, v }) => (
                  <div key={l} style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 9, fontFamily: UI, fontWeight: 700, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 8 }}>{l}</span>
                    <span style={{ fontSize: 11, fontFamily: UI, color: C.t2, lineHeight: 1.6 }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role descriptions for team module */}
      {mod.roles && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mod.roles.map(r => (
              <div key={r.title} style={{ ...card, borderLeft: `3px solid ${r.color}60` }}>
                <div style={{ fontFamily: UI, fontSize: 14, fontWeight: 700, color: r.color, marginBottom: 10 }}>{r.title}</div>
                <div style={{ marginBottom: 12 }}>
                  <SLabel>What They Do</SLabel>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {r.responsibilities.map((res, i) => (
                      <li key={i} style={{ fontFamily: UI, fontSize: 12, color: C.t2, lineHeight: 1.7, marginBottom: 2 }}>{res}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <SLabel>When You Need One</SLabel>
                    <p style={{ fontFamily: UI, fontSize: 11, color: C.t2, lineHeight: 1.65, margin: 0 }}>{r.whenYouNeedOne}</p>
                  </div>
                  <div>
                    <SLabel>What to Look For</SLabel>
                    <p style={{ fontFamily: UI, fontSize: 11, color: C.t2, lineHeight: 1.65, margin: 0 }}>{r.whatToLookFor}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key takeaways */}
      <div style={{ background: C.goldDim, border: `1px solid ${C.goldBdr}`, borderRadius: 12, padding: '18px 20px' }}>
        <SLabel>Key Takeaways</SLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(mod.keyTakeaways || []).map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.gold + '30', border: `1px solid ${C.gold}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontFamily: MONO, fontSize: 8, color: C.gold }}>{i + 1}</span>
              </div>
              <p style={{ fontFamily: UI, fontSize: 12, color: C.t1, lineHeight: 1.7, margin: 0 }}>{t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Assessment view ────────────────────────────────────────────────────── */
function AssessView({ data, setData, onComplete, onBack }) {
  const [step, setStep] = useState(0)

  const visibleSteps = ASSESS_STEPS
  const currentStep  = visibleSteps[step]
  const visibleFields = (currentStep?.fields || []).filter(f => !f.condition || f.condition(data))

  function updateField(key, val) {
    setData(prev => ({ ...prev, [key]: val }))
  }

  function advance() {
    if (step < visibleSteps.length - 1) {
      setStep(s => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      onComplete()
    }
  }

  return (
    <div>
      <BackBtn onClick={onBack} label="Back to Overview" />
      <StepBar current={step + 1} total={visibleSteps.length} />

      <div style={{ marginBottom: 24 }}>
        <SLabel>{currentStep.subtitle}</SLabel>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 700, color: C.t1, margin: 0, letterSpacing: '-0.02em' }}>{currentStep.title}</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>
        {visibleFields.map(field => (
          <div key={field.key} style={{ ...card }}>
            <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: C.t1, marginBottom: 12 }}>{field.label}</div>
            {field.type === 'radio' && (
              <RadioGroup
                options={field.options}
                value={data[field.key]}
                onChange={v => updateField(field.key, v)}
              />
            )}
            {field.type === 'yesno' && (
              <YesNo value={data[field.key]} onChange={v => updateField(field.key, v)} />
            )}
            {field.type === 'number' && (
              <NumInput
                value={data[field.key]}
                onChange={v => updateField(field.key, v)}
                prefix={field.prefix}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {step > 0
          ? <GhostBtn onClick={() => setStep(s => s - 1)}><ChevronLeft size={14} /> Previous</GhostBtn>
          : <div />
        }
        <PrimaryBtn onClick={advance}>
          {step < visibleSteps.length - 1 ? 'Continue' : 'Generate My Plan'}
          <ChevronRight size={15} />
        </PrimaryBtn>
      </div>
    </div>
  )
}

/* ─── Results view ───────────────────────────────────────────────────────── */
function ResultsView({ data, onBack, onReset }) {
  const [checkedRecs, setCheckedRecs] = useLS('bp_checked', {})
  const result = useMemo(() => evaluate(data), [data])
  const { scores, recs, summary, avgScore, netProfit } = result

  const radarData = [
    { axis: 'Tax Efficiency',     value: scores.taxEfficiency   },
    { axis: 'Retirement',         value: scores.retirementReady },
    { axis: 'Risk Protection',    value: scores.riskProtection  },
    { axis: 'Succession',         value: scores.succession      },
    { axis: 'Operations & Team',  value: scores.operationsTeam  },
  ]

  const categoryLabels = {
    tax:        { label: 'Tax Minimization',       color: C.gold  },
    retirement: { label: 'Retirement and Benefits', color: C.teal  },
    protection: { label: 'Protection and Risk',    color: C.brown },
    succession: { label: 'Estate and Succession',  color: C.t3    },
    team:       { label: 'Your Professional Team', color: C.gold  },
    operations: { label: 'AI and Operations',      color: C.success },
  }

  const recsByCategory = recs.reduce((acc, r) => {
    acc[r.category] = acc[r.category] || []
    acc[r.category].push(r)
    return acc
  }, {})

  const scoreColor = avgScore >= 75 ? C.success : avgScore >= 50 ? C.gold : C.danger

  const priorityColors = { high: C.danger, medium: C.gold, low: C.success }

  function downloadReport() {
    const lines = [
      'PLANORA BUSINESS PLANNING REPORT',
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      'BUSINESS HEALTH OVERVIEW',
      `Overall Score: ${avgScore}/100`,
      `Tax Efficiency: ${scores.taxEfficiency}/100`,
      `Retirement Readiness: ${scores.retirementReady}/100`,
      `Risk Protection: ${scores.riskProtection}/100`,
      `Succession Readiness: ${scores.succession}/100`,
      `Operations and Team: ${scores.operationsTeam}/100`,
      '',
      'EXECUTIVE SUMMARY',
      summary,
      '',
      'RECOMMENDATIONS',
      ...recs.map((r, i) => [
        `\n${i + 1}. [${r.priority.toUpperCase()}] ${r.title}`,
        `Category: ${categoryLabels[r.category]?.label || r.category}`,
        `Impact: ${r.impact}`,
        `Professional Required: ${r.professional}`,
        '',
        r.body,
      ].join('\n')),
      '',
      '---',
      'For educational purposes only. This is not tax, legal, or financial advice.',
      'Consult a CPA, CFP, and business attorney before taking action on these recommendations.',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'planora-business-plan.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <BackBtn onClick={onBack} label="Back to Overview" />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <SLabel>My Business Plan</SLabel>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: C.t1, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          Your Business Planning Snapshot
        </h2>
        <p style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.7, margin: 0, maxWidth: 600 }}>{summary}</p>
      </div>

      {/* Score overview + radar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Score ring */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px' }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <svg width={120} height={120} viewBox="0 0 120 120">
              <circle cx={60} cy={60} r={50} fill="none" stroke={C.b2} strokeWidth={10} />
              <circle
                cx={60} cy={60} r={50}
                fill="none" stroke={scoreColor} strokeWidth={10}
                strokeDasharray={`${2 * Math.PI * 50 * avgScore / 100} ${2 * Math.PI * 50 * (1 - avgScore / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dasharray 0.8s ease' }}
              />
              <text x={60} y={55} textAnchor="middle" fill={scoreColor} fontSize={22} fontWeight={900} fontFamily="JetBrains Mono, monospace">{avgScore}</text>
              <text x={60} y={72} textAnchor="middle" fill={C.t3} fontSize={9}>/100</text>
            </svg>
          </div>
          <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: C.t2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Business Health</div>
          <div style={{ marginTop: 16, width: '100%' }}>
            {Object.entries(scores).map(([k, v]) => {
              const labels = { taxEfficiency: 'Tax', retirementReady: 'Retirement', riskProtection: 'Risk', succession: 'Succession', operationsTeam: 'Operations' }
              return (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontFamily: UI, color: C.t3, width: 80, flexShrink: 0 }}>{labels[k]}</span>
                  <div style={{ flex: 1, height: 4, background: C.b2, borderRadius: 99 }}>
                    <div style={{ width: `${v}%`, height: '100%', background: v >= 70 ? C.success : v >= 45 ? C.gold : C.danger, borderRadius: 99, transition: 'width 0.8s ease' }} />
                  </div>
                  <span style={{ fontSize: 10, fontFamily: MONO, color: C.t3, width: 28, textAlign: 'right' }}>{v}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Radar chart */}
        <div style={{ ...card }}>
          <SLabel>Five Dimensions</SLabel>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke={C.b2} />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fill: C.t3, fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
              />
              <Radar
                name="score" dataKey="value" stroke={C.brown}
                fill={C.brown} fillOpacity={0.18} strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations by category */}
      <div style={{ marginBottom: 24 }}>
        <SLabel>Prioritized Recommendations</SLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(recsByCategory).map(([cat, catRecs]) => {
            const catMeta = categoryLabels[cat] || { label: cat, color: C.t2 }
            return (
              <div key={cat}>
                <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, color: catMeta.color, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, marginTop: 8 }}>{catMeta.label}</div>
                {catRecs.map((rec, i) => {
                  const done = checkedRecs[`${cat}-${i}`]
                  return (
                    <div key={i} style={{ ...card, marginBottom: 10, opacity: done ? 0.65 : 1, transition: 'opacity 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                        <button
                          onClick={() => setCheckedRecs(prev => ({ ...prev, [`${cat}-${i}`]: !prev[`${cat}-${i}`] }))}
                          style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${done ? C.success : C.b2}`, background: done ? C.success : 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {done && <Check size={11} color={C.bg} strokeWidth={3} />}
                        </button>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                            <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: done ? C.t3 : C.t1, textDecoration: done ? 'line-through' : 'none' }}>{rec.title}</span>
                            <Tag color={priorityColors[rec.priority] || C.t3}>{rec.priority}</Tag>
                          </div>
                          <p style={{ fontFamily: UI, fontSize: 12, color: C.t2, lineHeight: 1.72, margin: 0, marginBottom: 10 }}>{rec.body}</p>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {rec.impact && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <TrendingUp size={11} color={C.success} />
                                <span style={{ fontSize: 10, fontFamily: UI, color: C.success, fontWeight: 600 }}>{rec.impact}</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Users size={11} color={C.brown} />
                              <span style={{ fontSize: 10, fontFamily: UI, color: C.brown, fontWeight: 600 }}>{rec.professional}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <PrimaryBtn onClick={downloadReport}><Download size={14} /> Download Report</PrimaryBtn>
        <GhostBtn onClick={onReset}><RefreshCw size={13} /> Retake Assessment</GhostBtn>
      </div>

      <div style={{ marginTop: 20, background: C.brownDim, border: `1px solid ${C.brownBdr}`, borderRadius: 10, padding: '12px 16px' }}>
        <p style={{ fontFamily: UI, fontSize: 11, color: C.t2, lineHeight: 1.65, margin: 0 }}>
          <span style={{ fontWeight: 700, color: C.brown }}>Educational estimates only.</span>{' '}
          Dollar figures are illustrative based on 2026 tax tables. Actual results depend on your complete tax picture, state taxes, and professional analysis. Every recommendation above flags the appropriate professional for execution.
        </p>
      </div>
    </div>
  )
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export default function BusinessPlanning() {
  const navigate = useNavigate()
  const [view, setView]           = useState('landing')
  const [assessData, setAssessData] = useLS('bplan_assess', {})
  const [activeModule, setActiveModule] = useState(null)
  const [wizardDone, setWizardDone]   = useLS('bplan_done', false)

  function handleSelectModule(id) {
    setActiveModule(id)
    setView('module')
  }

  function handleModuleBack() {
    setActiveModule(null)
    setView('learn')
  }

  function handleAssessComplete() {
    setWizardDone(true)
    setView('results')
  }

  function handleReset() {
    setAssessData({})
    setWizardDone(false)
    setView('assess')
  }

  const avgScore = useMemo(() => {
    if (!wizardDone) return null
    const { scores } = evaluate(assessData)
    const vals = Object.values(scores)
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  }, [wizardDone, assessData])

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <style>{`
        @media (max-width: 700px) {
          .bp-bento { grid-template-columns: 1fr !important; }
          .bp-module-grid { grid-template-columns: 1fr !important; }
          .bp-module-preview { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* Top nav bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: C.bg, borderBottom: `1px solid ${C.b1}`, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* P logo */}
          <button onClick={() => navigate('/')} style={{ width: 30, height: 30, background: C.gold, borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 900, color: C.bg, lineHeight: 1, fontFamily: DISPLAY }}>P</span>
          </button>
          <div style={{ width: 1, height: 18, background: C.b2 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Briefcase size={13} color={C.brown} />
            <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: C.t2 }}>Business Planning</span>
          </div>
        </div>
        {view !== 'landing' && (
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { label: 'Overview', id: 'hub' },
              { label: 'Learn', id: 'learn' },
              { label: 'Assess', id: 'assess' },
              { label: 'My Plan', id: 'results', locked: !wizardDone },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => !tab.locked && setView(tab.id)}
                style={{
                  fontFamily: UI, fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 7, border: 'none', cursor: tab.locked ? 'not-allowed' : 'pointer',
                  background: view === tab.id ? C.brownDim : 'transparent',
                  color: tab.locked ? C.t3 : view === tab.id ? C.brown : C.t2,
                  opacity: tab.locked ? 0.5 : 1,
                }}
              >{tab.label}</button>
            ))}
          </div>
        )}
        {view === 'landing' && (
          <button
            onClick={() => setView('hub')}
            style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: C.t3, background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px 10px' }}
          >Skip intro →</button>
        )}
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 24px' }}>
        {view === 'landing' && (
          <WhyPlanSection onEnter={() => setView('hub')} />
        )}
        {view === 'hub' && (
          <HubView setView={setView} wizardDone={wizardDone} avgScore={avgScore} />
        )}
        {view === 'learn' && !activeModule && (
          <LearnView setView={setView} onSelectModule={handleSelectModule} />
        )}
        {view === 'module' && activeModule && (
          <ModuleView moduleId={activeModule} onBack={handleModuleBack} />
        )}
        {view === 'assess' && (
          <AssessView
            data={assessData}
            setData={setAssessData}
            onComplete={handleAssessComplete}
            onBack={() => setView('hub')}
          />
        )}
        {view === 'results' && wizardDone && (
          <ResultsView
            data={assessData}
            onBack={() => setView('hub')}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}
