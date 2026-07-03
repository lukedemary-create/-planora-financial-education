// ============================================================
// BudgetPlannerHub.jsx — Expanded Budget Planner with Hub
// ============================================================
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  Wallet, TrendingUp, Target, ArrowLeft, Plus, Trash2, Edit3,
  Check, X, ChevronDown, ChevronUp, Info, AlertTriangle,
  CheckCircle, DollarSign, Calendar, Flag, Home, Car,
  GraduationCap, Heart, Shield, Anchor, RefreshCw,
  BarChart2, Activity, Star, Clock, Link2, ArrowRight,
} from 'lucide-react';
import BudgetPlannerOriginal from './BudgetPlanner';

// ─── Design Tokens ──────────────────────────────────────────
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
  goldDim:  'rgba(201,169,110,0.09)',
  goldBdr:  'rgba(201,169,110,0.22)',
  brown:    '#8b6340',
  blue:     '#2d6a9f',
  blueDim:  'rgba(45,106,159,0.10)',
  blueBdr:  'rgba(45,106,159,0.25)',
  up:       '#4a7c59',
  upDim:    'rgba(74,124,89,0.12)',
  warn:     '#c9a96e',
  warnDim:  'rgba(201,169,110,0.12)',
  danger:   '#8b3a3a',
  dangerDim:'rgba(139,58,58,0.12)',
  dangerBdr:'rgba(139,58,58,0.28)',
};
const UI      = "'Inter', system-ui, sans-serif";
const DISPLAY = "'Playfair Display', Georgia, serif";
const MONO    = "'JetBrains Mono', 'Courier New', monospace";

// ─── Utilities ──────────────────────────────────────────────
const fmt = n => {
  const v = Math.abs(n || 0);
  if (v >= 1e6) return (n < 0 ? '-$' : '$') + (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e3) return (n < 0 ? '-$' : '$') + (v / 1e3).toFixed(1) + 'K';
  return (n < 0 ? '-$' : '$') + Math.round(v).toLocaleString();
};
const fmtPct = n => (n || 0).toFixed(1) + '%';
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function useLS(key, def) {
  const [v, setV] = useState(() => {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : def; } catch { return def; }
  });
  const set = useCallback(val => {
    const next = typeof val === 'function' ? val(v) : val;
    setV(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  }, [v]);
  return [v, set];
}

// ─── Cross-section data loader ──────────────────────────────
function loadCrossData() {
  const get = (k, d) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : d; } catch { return d; } };
  const bpIncome    = get('bp_income', 0);
  const bpCats      = get('bp_categories', []);
  const bpRet       = get('bp_retirement', {});
  const nwtAssets   = get('nwt_assets', {});
  const nwtLiab     = get('nwt_liabilities', {});

  const inv   = nwtAssets.investments  || {};
  const cash  = nwtAssets.cashSavings  || {};
  const re    = nwtAssets.realEstate   || {};
  const pp    = nwtAssets.personalProperty || {};
  const biz   = nwtAssets.businessOther || {};

  const totalAssets =
    (re.primaryHome || 0) + (re.rentalProperties || 0) + (re.otherRealEstate || 0) +
    (inv.k401 || 0) + (inv.ira || 0) + (inv.taxableBrokerage || 0) + (inv.otherInvestments || 0) +
    (cash.checking || 0) + (cash.savings || 0) + (cash.moneyMarket || 0) + (cash.cds || 0) +
    ((pp.vehicles || []).reduce((s, v) => s + (v.value || 0), 0)) +
    (pp.jewelry || 0) + (pp.otherValuables || 0) +
    (biz.businessEquity || 0) + (biz.stockOptions || 0) + (biz.otherAssets || 0);

  const mort  = nwtLiab.mortgage || {};
  const ccArr = nwtLiab.creditCards || [];
  const totalLiabilities =
    (mort.primaryMortgage || 0) + (mort.heloc || 0) + (mort.rentalMortgages || 0) +
    (nwtLiab.autoLoans || 0) + (nwtLiab.studentLoans || 0) +
    ccArr.reduce((s, c) => s + (c.value || 0), 0) +
    (nwtLiab.medicalDebt || 0) + (nwtLiab.personalLoans || 0);

  const rpPlan = get('rp_plan', {});

  const nwtRetirement = (inv.k401 || 0) + (inv.ira || 0);
  const rpRetirement  = (rpPlan.k401Balance || 0) + (rpPlan.iraBalance || 0);
  const retirementSavings = nwtRetirement || rpRetirement;

  const monthlyIncome     = bpIncome || 0;
  const annualIncome      = monthlyIncome * 12;

  const debtCats     = bpCats.filter(c => /debt|loan|credit|payment|mortgage/i.test(c.name));
  const savingsCats  = bpCats.filter(c => /saving|invest|401|ira|retire|emergency/i.test(c.name));
  const monthlyDebt  = debtCats.reduce((s, c) => s + (c.budget || 0), 0);
  const monthlySavings = savingsCats.reduce((s, c) => s + (c.budget || 0), 0);
  const monthlyExpenses = bpCats.reduce((s, c) => s + (c.budget || 0), 0);

  return {
    monthlyIncome, annualIncome, monthlyDebt, monthlySavings, monthlyExpenses,
    totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities,
    retirementSavings,
    age:       bpRet.currentAge || rpPlan.currentAge || 40,
    retireAge: bpRet.retireAge  || rpPlan.retireAge  || 65,
    hasNWT:    totalAssets > 0 || totalLiabilities > 0,
    hasBP:     bpIncome > 0,
    hasRP:     Object.keys(rpPlan).length > 2,
  };
}

// ─── Shared UI atoms ────────────────────────────────────────
const HUB_CSS = `
  .bph-input {
    background:#1a1410; border:1px solid #3d3028; border-radius:7px;
    padding:8px 11px; font-size:13px; color:#f0e8d8;
    font-family:'Inter',system-ui,sans-serif; outline:none; width:100%;
    box-sizing:border-box; transition:border-color 0.15s;
  }
  .bph-input:focus { border-color:#c9a96e; }
  .bph-select {
    background:#1a1410; border:1px solid #3d3028; border-radius:7px;
    padding:8px 11px; font-size:13px; color:#f0e8d8;
    font-family:'Inter',system-ui,sans-serif; outline:none; width:100%;
    box-sizing:border-box; appearance:none;
  }
`;

function BackBtn({ onBack, label = 'Back to Hub' }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onBack} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'inline-flex', alignItems:'center', gap:7,
        background: hov ? C.raise : 'transparent', border:`1px solid ${hov ? C.b2 : C.b1}`,
        borderRadius:8, padding:'8px 14px', cursor:'pointer', transition:'all 0.15s', marginBottom:24 }}>
      <ArrowLeft size={14} color={C.t2} />
      <span style={{ fontFamily:UI, fontSize:13, color:C.t2 }}>{label}</span>
    </button>
  );
}

function SectionLabel({ children, color }) {
  return (
    <div style={{ fontFamily:UI, fontSize:10, fontWeight:700, letterSpacing:'0.14em',
      textTransform:'uppercase', color: color || C.gold, marginBottom:8 }}>
      {children}
    </div>
  );
}

function ImportedBadge() {
  return (
    <span style={{ fontSize:9, fontFamily:UI, fontWeight:700, letterSpacing:'0.08em',
      textTransform:'uppercase', color: C.blue, background: C.blueDim,
      border:`1px solid ${C.blueBdr}`, borderRadius:4, padding:'1px 5px', marginLeft:6 }}>
      Imported
    </span>
  );
}

// ─── Circular Gauge ─────────────────────────────────────────
function CircleGauge({ pct, size = 100, stroke = 9, color, label, sublabel }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = clamp(pct, 0, 100);
  const dash = (clamped / 100) * circ;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.b2} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition:'stroke-dasharray 0.9s ease' }} />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:2 }}>
        {label && <div style={{ fontFamily:MONO, fontSize: size > 100 ? 22 : size > 70 ? 14 : 11,
          fontWeight:900, color, lineHeight:1.05, textAlign:'center' }}>{label}</div>}
        {sublabel && <div style={{ fontFamily:UI, fontSize: size > 100 ? 11 : 9,
          color:C.t3, textAlign:'center', lineHeight:1.2, maxWidth:size * 0.6 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

// ─── Number count-up hook ────────────────────────────────────
function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const diff = target - from;
    const start = Date.now();
    const t = setInterval(() => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + diff * eased));
      if (p >= 1) { prev.current = target; clearInterval(t); }
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

// ─── Ratio color helper ─────────────────────────────────────
function ratioColor(status) {
  if (status === 'strong') return C.up;
  if (status === 'fair')   return C.warn;
  return C.danger;
}
function ratioLabel(status) {
  if (status === 'strong') return 'Strong';
  if (status === 'fair')   return 'On Track';
  return 'Needs Work';
}

// ── Data Sources Panel ──────────────────────────────────────
function DataSourcesPanel({ cross }) {
  const sources = [
    {
      key:   'bp',
      label: 'Budget Planner',
      desc:  'Income, spending categories, monthly savings',
      fields: cross.hasBP ? `${fmt(cross.monthlyIncome)}/mo income · ${fmt(cross.monthlyExpenses)}/mo expenses` : 'No budget data yet — open Build Your Budget',
      active: cross.hasBP,
      accent: C.gold,
      accentDim: C.goldDim,
      accentBdr: C.goldBdr,
    },
    {
      key:   'nwt',
      label: 'Net Worth Tracker',
      desc:  'Total assets, liabilities, investment balances',
      fields: cross.hasNWT ? `${fmt(cross.totalAssets)} assets · ${fmt(cross.totalLiabilities)} liabilities` : 'No data yet — open Net Worth Tracker',
      active: cross.hasNWT,
      accent: '#4c9fcf',
      accentDim: 'rgba(76,159,207,0.09)',
      accentBdr: 'rgba(76,159,207,0.22)',
    },
    {
      key:   'rp',
      label: 'Retirement Planning',
      desc:  'Age, retirement balances, contribution rates',
      fields: cross.hasRP ? `Age ${cross.age} · Retire at ${cross.retireAge} · ${fmt(cross.retirementSavings)} saved` : 'No data yet — open Retirement Planning',
      active: cross.hasRP,
      accent: '#818cf8',
      accentDim: 'rgba(129,140,248,0.08)',
      accentBdr: 'rgba(129,140,248,0.22)',
    },
  ];

  const activeCount = sources.filter(s => s.active).length;

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link2 size={13} color={C.t3} />
          <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.t3 }}>
            Data Connections
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: activeCount > 0 ? C.up : C.t3 }} />
          <span style={{ fontFamily: UI, fontSize: 10, color: activeCount > 0 ? C.up : C.t3, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {activeCount} of {sources.length} connected
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px,1fr))', gap: 10 }}>
        {sources.map(src => (
          <div key={src.key} style={{
            background: src.active ? src.accentDim : C.raise,
            border: `1px solid ${src.active ? src.accentBdr : C.b2}`,
            borderRadius: 11, padding: '12px 14px',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            {/* Status dot */}
            <div style={{
              width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
              background: src.active ? src.accent : C.t3,
              boxShadow: src.active ? `0 0 6px ${src.accent}60` : 'none',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: src.active ? C.t1 : C.t3 }}>{src.label}</span>
                <span style={{ fontFamily: UI, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: src.active ? src.accent : C.t3 }}>
                  {src.active ? 'Synced' : 'No data'}
                </span>
              </div>
              <div style={{ fontFamily: UI, fontSize: 11, color: src.active ? C.t2 : C.t3, lineHeight: 1.5 }}>{src.fields}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hub Card (extracted to avoid hook-in-loop violation) ─────
function HubCard({ card, onSelect, badge }) {
  const [hov, setHov] = useState(false);
  const Icon = card.icon;
  return (
    <div onClick={() => onSelect(card.id)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:C.surf, border:`1px solid ${hov ? card.accentBdr : C.b1}`,
        borderRadius:16, padding:'26px 28px', cursor:'pointer',
        transition:'border-color 0.18s, box-shadow 0.18s',
        boxShadow: hov ? '0 8px 30px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.18)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <div style={{ width:40, height:40, borderRadius:11,
          background:card.accentDim, border:`1px solid ${card.accentBdr}`,
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={18} color={card.accent} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:UI, fontSize:10, fontWeight:700, letterSpacing:'0.1em',
            textTransform:'uppercase', color:card.accent, marginBottom:3 }}>{card.tag}</div>
          <div style={{ fontFamily:DISPLAY, fontSize:17, fontWeight:700, color:C.t1, lineHeight:1.15 }}>
            {card.label}
          </div>
        </div>
        {badge && (
          <div style={{ flexShrink:0, textAlign:'right' }}>
            <div style={{ fontFamily:MONO, fontSize:18, fontWeight:900, color:badge.color, lineHeight:1 }}>{badge.value}</div>
            <div style={{ fontFamily:UI, fontSize:9, color:C.t3, letterSpacing:'0.06em', textTransform:'uppercase', marginTop:2 }}>{badge.label}</div>
          </div>
        )}
      </div>
      <p style={{ fontFamily:UI, fontSize:13, lineHeight:1.65, color:C.t2, margin:'0 0 18px' }}>{card.desc}</p>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontFamily:UI, fontSize:11, color:C.t3 }}>{card.meta}</span>
        <div style={{ display:'inline-flex', alignItems:'center', gap:5,
          background: hov ? card.accent : card.accentDim,
          border:`1px solid ${card.accentBdr}`, borderRadius:7, padding:'6px 13px',
          transition:'background 0.18s' }}>
          <span style={{ fontFamily:UI, fontSize:12, fontWeight:600,
            color: hov ? C.bg : card.accent, transition:'color 0.18s' }}>Open</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// HUB VIEW
// ══════════════════════════════════════════════════════════════
function HubView({ onSelect }) {
  const cross   = useMemo(() => loadCrossData(), []);
  const surplus = cross.monthlyIncome - cross.monthlyExpenses;

  // Preview health score from available data (no user overrides applied)
  const previewRatios = useMemo(() => calcRatios({
    monthlyIncome:    cross.monthlyIncome,
    monthlyDebt:      cross.monthlyDebt,
    monthlySavings:   cross.monthlySavings,
    totalAssets:      cross.totalAssets,
    totalLiabilities: cross.totalLiabilities,
    retirementSavings:cross.retirementSavings,
    netWorth:         cross.netWorth,
    age:              cross.age,
    annualIncome:     cross.annualIncome,
  }), [cross]);

  // Goals count from localStorage
  const goalsCount = useMemo(() => {
    try { const r = localStorage.getItem('bph_goals'); return r ? JSON.parse(r).length : 0; } catch { return 0; }
  }, []);

  const scoreColor = ratioColor(previewRatios.overallStatus);

  const cards = [
    {
      id: 'budget',
      icon: Wallet,
      label: 'Build Your Budget',
      tag: 'Budget Tool',
      desc: 'Track income, expenses, goals, bills, accounts, and cash flow with the full budget management suite.',
      meta: cross.hasBP ? `Income: ${fmt(cross.monthlyIncome)}/mo · Surplus: ${fmt(surplus)}/mo` : 'Set up your budget',
      accent: C.gold,
      accentDim: C.goldDim,
      accentBdr: C.goldBdr,
      badge: cross.hasBP ? { value: fmt(cross.monthlyIncome), label: 'Monthly', color: C.gold } : null,
    },
    {
      id: 'ratios',
      icon: Activity,
      label: 'Financial Health Ratios',
      tag: 'Analysis Engine',
      desc: 'Five key ratios scored and explained at CFA/CFP level — with specific guidance on how to improve each one.',
      meta: cross.hasNWT ? `Net Worth: ${fmt(cross.netWorth)}` : 'Enter your data to see your score',
      accent: C.blue,
      accentDim: C.blueDim,
      accentBdr: C.blueBdr,
      badge: (cross.hasBP || cross.hasNWT) ? { value: previewRatios.totalScore + '/100', label: 'Health Score', color: scoreColor } : null,
    },
    {
      id: 'goals',
      icon: Target,
      label: 'Goals: Needs, Wants & Wishes',
      tag: 'Goal Planner',
      desc: 'Plan every major future purchase across three life tiers with inflation adjustment and monthly savings guidance.',
      meta: goalsCount > 0 ? `${goalsCount} active goal${goalsCount !== 1 ? 's' : ''}` : 'Plan your future',
      accent: '#818cf8',
      accentDim: 'rgba(129,140,248,0.08)',
      accentBdr: 'rgba(129,140,248,0.22)',
      badge: goalsCount > 0 ? { value: goalsCount, label: 'Goals', color: '#818cf8' } : null,
    },
  ];

  return (
    <div style={{ padding:'40px 40px 60px', maxWidth:1100, margin:'0 auto' }}>
      <style>{HUB_CSS}</style>

      <div style={{ marginBottom:40 }}>
        <SectionLabel>Financial Planning</SectionLabel>
        <h1 style={{ fontFamily:DISPLAY, fontSize:'clamp(26px,3vw,38px)', fontWeight:700,
          color:C.t1, margin:'0 0 10px', lineHeight:1.12 }}>
          Budget Planner
        </h1>
        <p style={{ fontFamily:UI, fontSize:14, color:C.t2, maxWidth:500, lineHeight:1.65, margin:0 }}>
          Your complete financial management system — budgeting, health analysis, and goal planning in one integrated workspace.
        </p>
      </div>

      {/* Quick stats */}
      {(cross.hasBP || cross.hasNWT) && (
        <div style={{ display:'flex', gap:12, marginBottom:36, flexWrap:'wrap' }}>
          {[
            { label:'Monthly Income',   value: fmt(cross.monthlyIncome),   color: C.gold,   show: cross.hasBP  },
            { label:'Monthly Expenses', value: fmt(cross.monthlyExpenses),  color: C.t2,     show: cross.hasBP  },
            { label:'Monthly Surplus',  value: fmt(surplus),               color: surplus >= 0 ? C.up : C.danger, show: cross.hasBP },
            { label:'Net Worth',        value: fmt(cross.netWorth),        color: C.blue,   show: cross.hasNWT },
            { label:'Health Score',     value: `${previewRatios.totalScore}/100`, color: scoreColor, show: cross.hasBP || cross.hasNWT },
          ].filter(s => s.show).map(s => (
            <div key={s.label} style={{ background:C.raise, border:`1px solid ${C.b2}`,
              borderRadius:10, padding:'12px 18px' }}>
              <div style={{ fontFamily:UI, fontSize:10, color:C.t3, letterSpacing:'0.08em',
                textTransform:'uppercase', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontFamily:MONO, fontSize:17, fontWeight:800, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Data connection status */}
      <DataSourcesPanel cross={cross} />

      {/* Section cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(290px,1fr))', gap:18 }}>
        {cards.map(card => (
          <HubCard key={card.id} card={card} onSelect={onSelect} badge={card.badge} />
        ))}
      </div>

      <div style={{ marginTop:40, padding:'14px 18px', background:C.raise,
        border:`1px solid ${C.b2}`, borderRadius:10 }}>
        <span style={{ fontFamily:UI, fontSize:11, color:C.t3, lineHeight:1.6 }}>
          Estimates for educational purposes. Consult a financial professional for personalized advice.
        </span>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// FINANCIAL RATIOS ENGINE
// ══════════════════════════════════════════════════════════════
const RATIO_DEFS = [
  {
    id: 'dti',
    label: 'Debt-to-Income',
    unit: '%',
    benchmarkLabel: 'Target: under 36%',
    thresholds: { strong: 20, fair: 36 }, // lower is better
    lowerBetter: true,
    explain: `Your debt-to-income ratio measures the percentage of your gross monthly income consumed by debt payments. Lenders use it as a primary underwriting metric — it directly determines whether you qualify for mortgages, car loans, and major credit lines. The 28/36 rule is the industry standard: housing costs should stay below 28% of gross income, and total debt below 36%.`,
    guidance: [
      { title: 'Debt Avalanche Strategy', body: 'List debts by interest rate, highest first. Direct every extra dollar toward the highest-rate debt (usually credit cards at 18–29% APR) while making minimums elsewhere. The mathematical savings versus other methods are significant — often tens of thousands over a payoff period.' },
      { title: 'Refinancing Lever', body: 'If your mortgage rate is more than 0.75% above current market rates, a refinance analysis is warranted. Even a 1% rate reduction on a $400K mortgage saves $267/month — which drops your DTI meaningfully and frees cash for paydown.' },
      { title: 'Consolidation Strategy', body: 'Multiple high-rate credit card balances can often be consolidated into a single personal loan at 7–12% APR. This immediately reduces your minimum monthly payment (improving DTI), simplifies your payment structure, and lowers total interest paid.' },
      { title: 'Income Side of the Equation', body: 'A 10% income increase reduces DTI more powerfully than the equivalent debt paydown, because income applies across all ratios simultaneously. Side income streams, skills-based raises, or a role change often produce faster DTI improvement than aggressive debt paydown alone.' },
    ],
  },
  {
    id: 'savings',
    label: 'Savings Rate',
    unit: '%',
    benchmarkLabel: 'Target: 20%+',
    thresholds: { strong: 20, fair: 10 }, // higher is better
    lowerBetter: false,
    explain: `Your savings rate is the percentage of gross income you put to work for your future. It is arguably the single most powerful lever in personal finance — more impactful than investment returns in the early accumulation years. A 20% savings rate compounding at 7% builds generational wealth. A 5% rate at the same return barely outpaces inflation after taxes and fees.`,
    guidance: [
      { title: 'Automate Before You Spend', body: 'Set up automatic transfers to savings and investment accounts on the same day income arrives. Behavioral research consistently shows that money never seen is never spent. This single change eliminates the willpower requirement from saving entirely.' },
      { title: 'Tax-Advantaged Account Sequencing', body: 'Optimal order: (1) 401(k) to full employer match — this is a 50–100% instant return. (2) HSA to maximum — the only triple-tax-advantaged account in the US tax code. (3) Roth IRA if eligible. (4) 401(k) to maximum $23,500. (5) Taxable brokerage for anything beyond.' },
      { title: 'Lifestyle Creep Prevention', body: 'When income increases, allocate 60–70% of the net raise to savings before lifestyle adjusts upward. This is the mechanism by which high earners build wealth — not by earning more, but by saving the marginal income aggressively while the lifestyle baseline stays controlled.' },
      { title: 'The Pay Raise Rule', body: 'A single extra $400/month saved — not spent — invested at 7% for 25 years compounds to $324,000. Savings rate improvement has a multiplied effect: more saved today means more compounding, a shorter runway to financial independence, and a reduced number needed to retire.' },
    ],
  },
  {
    id: 'networth',
    label: 'Net Worth Ratio',
    unit: '×',
    benchmarkLabel: 'Target: 1.0× (PAW)',
    thresholds: { strong: 1.0, fair: 0.5 }, // higher is better
    lowerBetter: false,
    explain: `The Net Worth Ratio benchmarks your actual accumulated wealth against what you should have at your age and income level. The formula comes from "The Millionaire Next Door" research: expected net worth equals your age multiplied by your gross annual income, divided by 10. At 40 with $100K income, expected net worth is $400K. A ratio above 1.0 classifies you as a Prodigious Accumulator of Wealth (PAW). Below 0.5 is an Under-Accumulator (UAW).`,
    guidance: [
      { title: 'UAW Diagnosis (Below 0.5)', body: 'Under-accumulators are typically high-income individuals with high lifestyle spending — the profile of someone who earns well but has little to show for it. The fix is not earning more; it is reducing the lifestyle expense base dramatically. A $200K earner saving 5% accumulates less than an $80K earner saving 25%.' },
      { title: 'AAW Path to PAW (0.5–1.0)', body: 'You are building correctly but need to accelerate. Increase savings rate to 20%+, maximize tax-advantaged accounts, and avoid large lifestyle upgrades (home size, vehicle quality) that consume the capital needed to close the gap.' },
      { title: 'PAW Optimization (Above 1.0)', body: 'Focus shifts from accumulation rate to asset allocation quality and tax efficiency. At this stage, asset location (which accounts hold which assets), tax-loss harvesting, Roth conversion ladders, and estate planning produce more value than simply saving more.' },
      { title: 'The Spending Habit Insight', body: 'Stanley\'s research found net worth ratio correlates more strongly with spending habits than income level. The physician spending $400K/year with a $200K net worth is less wealthy than the teacher spending $40K/year with a $600K net worth. Wealth is what you keep, not what you earn.' },
    ],
  },
  {
    id: 'dta',
    label: 'Debt-to-Asset',
    unit: '%',
    benchmarkLabel: 'Target: under 30%',
    thresholds: { strong: 25, fair: 50 }, // lower is better
    lowerBetter: true,
    explain: `The debt-to-asset ratio measures what percentage of your total asset base is financed by debt. A ratio below 25% means you own most of what you have. Above 50% means creditors claim more of your assets than you do — you are deeply leveraged. This ratio is critical to understand because it reveals vulnerability: in a financial shock, highly leveraged households are forced to sell assets at the worst possible time.`,
    guidance: [
      { title: 'Separate Productive vs. Corrosive Debt', body: 'A primary home mortgage at 3–7% is generally productive leverage — the asset appreciates and provides shelter. Credit card debt at 24% APR on a smartphone is purely corrosive. Identify and aggressively eliminate consumer debt on depreciating assets first.' },
      { title: 'Debt Paydown Sequencing', body: 'Use Debt Avalanche (highest rate first) for mathematical optimality. Use Debt Snowball (smallest balance first) if behavioral wins matter to maintain motivation. Hybrid: Snowball for balances under $2K for quick wins, then Avalanche for remaining balances.' },
      { title: 'Pre-Retirement Target', body: 'Approaching retirement (10 years out), target a debt-to-asset ratio below 15%. Ideally, retire debt-free or with only a small, manageable mortgage. Debt in retirement is particularly dangerous because it creates mandatory cash outflows against a fixed income stream.' },
      { title: 'Asset Building Simultaneously', body: 'Paying down debt improves this ratio by reducing the numerator. Building assets (investing) improves it by increasing the denominator. At interest rates below 5%, investing often wins. Above 7%, paydown is usually better. Between 5–7%, a hybrid approach is optimal.' },
    ],
  },
  {
    id: 'retirement',
    label: 'Retirement Readiness',
    unit: '×',
    benchmarkLabel: 'Fidelity milestones by age',
    thresholds: { strong: 1.0, fair: 0.6 }, // higher is better — relative to age milestone
    lowerBetter: false,
    explain: `Retirement readiness compares your current savings against Fidelity's age-based milestones, which assume a 4% withdrawal rate funding 30+ years of retirement. The benchmarks: 1× salary by 30, 3× by 40, 6× by 50, 8× by 60, 10× by retirement. Falling behind here is the hardest gap to close because compounding time is finite and irreversible.`,
    guidance: [
      { title: 'The Compounding Clock', body: '$1,000 invested at age 30 compounds to $7,600 at 65 at 7%. The same $1,000 at age 50 becomes $1,970. Starting late does not eliminate the opportunity — it requires a proportionally higher savings rate to compensate. Calculate your required savings rate given current savings and time horizon.' },
      { title: '401(k) Optimization', body: 'Always capture the full employer match first — it is a 50–100% instant return on investment. Then maximize if possible: the 2025 limit is $23,500, with a $7,500 catch-up contribution if you are 50+. A Roth 401(k) option may be preferable if you expect higher income in retirement.' },
      { title: 'Social Security Optimization', body: 'Delaying Social Security from 62 to 70 increases your monthly benefit by approximately 77%. Each year of delay from full retirement age adds 8% to the annual benefit permanently. If you have other assets to draw from, delaying Social Security is one of the highest-return risk-free "investments" available.' },
      { title: 'The Rule of 25', body: 'To determine your retirement savings target: multiply your desired annual spending by 25. Spending $80K/year requires $2M saved. Spending $60K/year requires $1.5M. This is the inverse of the 4% safe withdrawal rate. Social Security and pension income reduce the portfolio target dollar-for-dollar.' },
    ],
  },
];

function getFidelityTarget(age, annualIncome) {
  const milestones = [
    { age: 30, mult: 1 }, { age: 35, mult: 2 }, { age: 40, mult: 3 },
    { age: 45, mult: 4 }, { age: 50, mult: 6 }, { age: 55, mult: 7 },
    { age: 60, mult: 8 }, { age: 65, mult: 10 },
  ];
  let lo = milestones[0], hi = milestones[milestones.length - 1];
  for (let i = 0; i < milestones.length - 1; i++) {
    if (age >= milestones[i].age && age <= milestones[i + 1].age) {
      lo = milestones[i]; hi = milestones[i + 1]; break;
    }
  }
  const t = lo.age === hi.age ? 1 : (age - lo.age) / (hi.age - lo.age);
  const mult = lo.mult + (hi.mult - lo.mult) * t;
  return annualIncome * mult;
}

function calcRatios(d) {
  const dtiVal = d.monthlyIncome > 0 ? (d.monthlyDebt / d.monthlyIncome) * 100 : 0;
  const savingsVal = d.monthlyIncome > 0 ? (d.monthlySavings / d.monthlyIncome) * 100 : 0;
  const nwExpected = d.annualIncome > 0 ? (d.age * d.annualIncome) / 10 : 1;
  const nwRatio = nwExpected > 0 ? d.netWorth / nwExpected : 0;
  const dtaVal = d.totalAssets > 0 ? (d.totalLiabilities / d.totalAssets) * 100 : 0;
  const retTarget = getFidelityTarget(d.age, d.annualIncome);
  const retRatio = retTarget > 0 ? d.retirementSavings / retTarget : 0;

  const dtiStatus     = dtiVal < 20 ? 'strong' : dtiVal < 36 ? 'fair' : 'weak';
  const savingsStatus = savingsVal > 20 ? 'strong' : savingsVal > 10 ? 'fair' : 'weak';
  const nwStatus      = nwRatio > 1 ? 'strong' : nwRatio > 0.5 ? 'fair' : 'weak';
  const dtaStatus     = dtaVal < 25 ? 'strong' : dtaVal < 50 ? 'fair' : 'weak';
  const retStatus     = retRatio > 1 ? 'strong' : retRatio > 0.6 ? 'fair' : 'weak';

  const scores = {
    dti:        dtiStatus === 'strong' ? 25 : dtiStatus === 'fair' ? 15 : 5,
    savings:    savingsStatus === 'strong' ? 25 : savingsStatus === 'fair' ? 15 : 5,
    networth:   nwStatus === 'strong' ? 25 : nwStatus === 'fair' ? 15 : 5,
    dta:        dtaStatus === 'strong' ? 15 : dtaStatus === 'fair' ? 9 : 3,
    retirement: retStatus === 'strong' ? 10 : retStatus === 'fair' ? 6 : 2,
  };
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const overallStatus = totalScore >= 80 ? 'strong' : totalScore >= 55 ? 'fair' : 'weak';

  return {
    dti:        { value: dtiVal,    status: dtiStatus,     gaugePct: clamp(100 - dtiVal * 2, 0, 100),    display: fmtPct(dtiVal)   },
    savings:    { value: savingsVal, status: savingsStatus, gaugePct: clamp(savingsVal * 4, 0, 100),       display: fmtPct(savingsVal) },
    networth:   { value: nwRatio,   status: nwStatus,      gaugePct: clamp(nwRatio * 70, 0, 100),         display: nwRatio.toFixed(2) + '×' },
    dta:        { value: dtaVal,    status: dtaStatus,     gaugePct: clamp(100 - dtaVal, 0, 100),         display: fmtPct(dtaVal)   },
    retirement: { value: retRatio,  status: retStatus,     gaugePct: clamp(retRatio * 70, 0, 100),        display: retRatio.toFixed(2) + '×' },
    totalScore, overallStatus, retTarget,
  };
}

function RatioCard({ def, data }) {
  const [open, setOpen] = useState(false);
  const [guideIdx, setGuideIdx] = useState(0);
  const color = ratioColor(data.status);
  const statusText = ratioLabel(data.status);

  return (
    <div style={{ background:C.surf, border:`1px solid ${C.b1}`, borderRadius:14,
      overflow:'hidden', marginBottom:14 }}>
      <div style={{ padding:'20px 22px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <CircleGauge pct={data.gaugePct} size={72} stroke={7} color={color}
            label={data.display} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <span style={{ fontFamily:DISPLAY, fontSize:16, fontWeight:700, color:C.t1 }}>{def.label}</span>
              <span style={{ fontFamily:UI, fontSize:10, fontWeight:700, letterSpacing:'0.08em',
                textTransform:'uppercase', color, background: color + '1a', borderRadius:4, padding:'2px 7px' }}>
                {statusText}
              </span>
            </div>
            <div style={{ fontFamily:UI, fontSize:12, color:C.t3, marginBottom:8 }}>{def.benchmarkLabel}</div>
            <div style={{ fontFamily:UI, fontSize:13, lineHeight:1.6, color:C.t2 }}>{def.explain.slice(0, 160)}…</div>
          </div>
          <button onClick={() => setOpen(o => !o)}
            style={{ background:'none', border:`1px solid ${C.b2}`, borderRadius:7, padding:'6px 8px',
              cursor:'pointer', color:C.t3, display:'flex', alignItems:'center', flexShrink:0 }}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ borderTop:`1px solid ${C.b1}`, padding:'22px 22px' }}>
          <div style={{ marginBottom:18 }}>
            <SectionLabel color={C.t3}>What It Means</SectionLabel>
            <p style={{ fontFamily:UI, fontSize:13, lineHeight:1.7, color:C.t2, margin:0 }}>{def.explain}</p>
          </div>
          <SectionLabel color={C.gold}>CFP-Level Improvement Guidance</SectionLabel>
          <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
            {def.guidance.map((g, i) => (
              <button key={i} onClick={() => setGuideIdx(i)}
                style={{ padding:'5px 12px', borderRadius:6, border:`1px solid ${i === guideIdx ? C.goldBdr : C.b2}`,
                  background: i === guideIdx ? C.goldDim : 'transparent',
                  color: i === guideIdx ? C.gold : C.t3,
                  fontFamily:UI, fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.13s' }}>
                {g.title}
              </button>
            ))}
          </div>
          <div style={{ background:C.raise, border:`1px solid ${C.b2}`, borderRadius:10, padding:'16px 18px' }}>
            <div style={{ fontFamily:UI, fontSize:12, fontWeight:700, color:C.gold, marginBottom:8 }}>
              {def.guidance[guideIdx].title}
            </div>
            <p style={{ fontFamily:UI, fontSize:13, lineHeight:1.7, color:C.t2, margin:0 }}>
              {def.guidance[guideIdx].body}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function FinancialRatiosView({ onBack }) {
  const cross = useMemo(() => loadCrossData(), []);

  const [d, setD] = useLS('bph_ratio_data', {
    monthlyIncome:    cross.monthlyIncome    || 6000,
    monthlyDebt:      cross.monthlyDebt      || 800,
    monthlySavings:   cross.monthlySavings   || 600,
    totalAssets:      cross.totalAssets      || 250000,
    totalLiabilities: cross.totalLiabilities || 120000,
    retirementSavings:cross.retirementSavings|| 85000,
    age:              cross.age              || 40,
    annualIncome:     cross.annualIncome     || 72000,
  });

  const set = key => val => setD(prev => ({ ...prev, [key]: +val }));

  const syncFromData = () => {
    const fresh = loadCrossData();
    setD(prev => ({
      ...prev,
      ...(fresh.monthlyIncome    > 0 && { monthlyIncome:    fresh.monthlyIncome    }),
      ...(fresh.monthlyDebt      > 0 && { monthlyDebt:      fresh.monthlyDebt      }),
      ...(fresh.monthlySavings   > 0 && { monthlySavings:   fresh.monthlySavings   }),
      ...(fresh.totalAssets      > 0 && { totalAssets:      fresh.totalAssets      }),
      ...(fresh.totalLiabilities > 0 && { totalLiabilities: fresh.totalLiabilities }),
      ...(fresh.retirementSavings> 0 && { retirementSavings:fresh.retirementSavings }),
      ...(fresh.age              > 0 && { age:              fresh.age              }),
      ...(fresh.annualIncome     > 0 && { annualIncome:     fresh.annualIncome     }),
    }));
  };

  const ratios = useMemo(() => calcRatios({
    ...d,
    netWorth: d.totalAssets - d.totalLiabilities,
  }), [d]);

  const scoreAnim = useCountUp(ratios.totalScore);
  const overallColor = ratioColor(ratios.overallStatus);
  const overallLbl = ratios.overallStatus === 'strong' ? 'Strong' : ratios.overallStatus === 'fair' ? 'On Track' : 'Action Required';

  const numInput = (key, label, isImported) => (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', marginBottom:5 }}>
        <span style={{ fontFamily:UI, fontSize:12, color:C.t2 }}>{label}</span>
        {isImported && <ImportedBadge />}
      </div>
      <div style={{ position:'relative' }}>
        <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
          color:C.t3, fontSize:13, pointerEvents:'none' }}>$</span>
        <input type="number" className="bph-input" style={{ paddingLeft:22 }}
          value={d[key] || ''} onChange={e => set(key)(e.target.value)} />
      </div>
    </div>
  );

  return (
    <div style={{ padding:'36px 40px 60px', maxWidth:1100, margin:'0 auto' }}>
      <style>{HUB_CSS}</style>
      <BackBtn onBack={onBack} />

      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:32 }}>
        <div style={{ width:42, height:42, borderRadius:11, background:C.blueDim,
          border:`1px solid ${C.blueBdr}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Activity size={19} color={C.blue} />
        </div>
        <div>
          <h2 style={{ fontFamily:DISPLAY, fontSize:26, fontWeight:700, color:C.t1, margin:0, lineHeight:1.15 }}>
            Financial Health Ratios
          </h2>
          <p style={{ fontFamily:UI, fontSize:13, color:C.t3, margin:'4px 0 0' }}>
            CFA/CFP-level analysis of your five core financial metrics
          </p>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:24, alignItems:'start' }}>

        {/* Data Input Panel */}
        <div>
          {/* Connection status strip */}
          <div style={{ background: C.raise, border: `1px solid ${C.b2}`, borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Link2 size={11} color={C.t3} />
              <span style={{ fontFamily: UI, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.t3 }}>Live Data Sources</span>
            </div>
            {[
              { label: 'Budget Planner',     active: cross.hasBP,  detail: cross.hasBP  ? `${fmt(cross.monthlyIncome)}/mo` : 'Missing' },
              { label: 'Net Worth Tracker',  active: cross.hasNWT, detail: cross.hasNWT ? `${fmt(cross.totalAssets)}` : 'Missing' },
              { label: 'Retirement Planning',active: cross.hasRP,  detail: cross.hasRP  ? `Age ${cross.age}` : 'Missing' },
            ].map(src => (
              <div key={src.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: src.active ? C.up : C.t3, flexShrink: 0 }} />
                  <span style={{ fontFamily: UI, fontSize: 11, color: src.active ? C.t2 : C.t3 }}>{src.label}</span>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 10, color: src.active ? C.up : C.t3 }}>{src.detail}</span>
              </div>
            ))}
            <button onClick={syncFromData}
              style={{ display:'flex', alignItems:'center', gap:5, width:'100%', marginTop:8,
                padding:'6px 10px', background:C.blueDim, border:`1px solid ${C.blueBdr}`, borderRadius:7,
                color:C.blue, fontFamily:UI, fontSize:11, fontWeight:600, cursor:'pointer', justifyContent:'center' }}>
              <RefreshCw size={11} /> Sync All Sources
            </button>
          </div>

          <SectionLabel>Your Financial Data</SectionLabel>
          <div style={{ background:C.surf, border:`1px solid ${C.b1}`, borderRadius:14, padding:'22px 20px', marginBottom:16 }}>
            <div style={{ fontFamily:UI, fontSize:11, fontWeight:700, color:C.gold, letterSpacing:'0.08em',
              textTransform:'uppercase', marginBottom:14 }}>Income & Debt</div>
            {numInput('monthlyIncome',    'Gross Monthly Income',   cross.hasBP)}
            {numInput('monthlyDebt',      'Monthly Debt Payments',  cross.monthlyDebt > 0)}
            {numInput('monthlySavings',   'Monthly Savings Amount', cross.monthlySavings > 0)}
          </div>
          <div style={{ background:C.surf, border:`1px solid ${C.b1}`, borderRadius:14, padding:'22px 20px', marginBottom:16 }}>
            <div style={{ fontFamily:UI, fontSize:11, fontWeight:700, color:C.gold, letterSpacing:'0.08em',
              textTransform:'uppercase', marginBottom:14 }}>Assets & Liabilities</div>
            {numInput('totalAssets',       'Total Assets',           cross.hasNWT)}
            {numInput('totalLiabilities',  'Total Liabilities',      cross.hasNWT)}
            {numInput('retirementSavings', 'Retirement Savings',     cross.retirementSavings > 0)}
          </div>
          <div style={{ background:C.surf, border:`1px solid ${C.b1}`, borderRadius:14, padding:'22px 20px' }}>
            <div style={{ fontFamily:UI, fontSize:11, fontWeight:700, color:C.gold, letterSpacing:'0.08em',
              textTransform:'uppercase', marginBottom:14 }}>Profile</div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontFamily:UI, fontSize:12, color:C.t2, marginBottom:5 }}>Current Age</div>
              <input type="number" className="bph-input"
                value={d.age || ''} onChange={e => set('age')(e.target.value)} />
            </div>
            <div>
              <div style={{ fontFamily:UI, fontSize:12, color:C.t2, marginBottom:5 }}>Gross Annual Income</div>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
                  color:C.t3, fontSize:13, pointerEvents:'none' }}>$</span>
                <input type="number" className="bph-input" style={{ paddingLeft:22 }}
                  value={d.annualIncome || ''} onChange={e => set('annualIncome')(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Ratios Panel */}
        <div>
          {/* Overall Health Score Hero */}
          <div style={{ background:C.surf, border:`1px solid ${C.b1}`, borderRadius:16,
            padding:'28px 32px', marginBottom:20, display:'flex', alignItems:'center', gap:28 }}>
            <CircleGauge pct={ratios.totalScore} size={140} stroke={11} color={overallColor}
              label={scoreAnim} sublabel="/ 100" />
            <div>
              <SectionLabel color={C.t3}>Overall Financial Health</SectionLabel>
              <div style={{ fontFamily:DISPLAY, fontSize:28, fontWeight:700, color:overallColor, lineHeight:1.1, marginBottom:8 }}>
                {overallLbl}
              </div>
              <p style={{ fontFamily:UI, fontSize:13, lineHeight:1.65, color:C.t2, margin:'0 0 14px', maxWidth:360 }}>
                {ratios.overallStatus === 'strong'
                  ? 'Your financial fundamentals are solid across all five metrics. Focus shifts to optimization — asset allocation, tax efficiency, and accelerating toward financial independence.'
                  : ratios.overallStatus === 'fair'
                  ? 'You are on a reasonable trajectory with room for meaningful improvement. Expand the ratio cards below to see specific, actionable guidance for each area.'
                  : 'Several core ratios need attention. The guidance below provides a prioritized path forward. Focus on the highest-impact change first rather than all at once.'}
              </p>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {[
                  { label:'DTI',        val: ratios.dti.display,        color: ratioColor(ratios.dti.status)        },
                  { label:'Savings',    val: ratios.savings.display,    color: ratioColor(ratios.savings.status)    },
                  { label:'Net Worth',  val: ratios.networth.display,   color: ratioColor(ratios.networth.status)   },
                  { label:'Debt/Asset', val: ratios.dta.display,        color: ratioColor(ratios.dta.status)        },
                  { label:'Retirement', val: ratios.retirement.display, color: ratioColor(ratios.retirement.status) },
                ].map(r => (
                  <div key={r.label} style={{ background:C.raise, border:`1px solid ${C.b2}`,
                    borderRadius:8, padding:'8px 12px', textAlign:'center' }}>
                    <div style={{ fontFamily:MONO, fontSize:13, fontWeight:800, color:r.color }}>{r.val}</div>
                    <div style={{ fontFamily:UI, fontSize:9, color:C.t3, marginTop:2, letterSpacing:'0.06em',
                      textTransform:'uppercase' }}>{r.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Five Ratio Cards */}
          {RATIO_DEFS.map(def => (
            <RatioCard key={def.id} def={def} data={ratios[def.id]} />
          ))}

          <div style={{ padding:'14px 18px', background:C.raise, border:`1px solid ${C.b2}`, borderRadius:10, marginTop:8 }}>
            <span style={{ fontFamily:UI, fontSize:11, color:C.t3, lineHeight:1.6 }}>
              Retirement target based on Fidelity age-based milestones. Net worth benchmark from Stanley & Danko research. Estimates for educational purposes only.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// GOALS: NEEDS, WANTS & WISHES
// ══════════════════════════════════════════════════════════════
const TIER_CONFIG = {
  need: {
    label: 'Needs',
    sublabel: 'Essential & security',
    color: C.gold,
    dim: C.goldDim,
    bdr: C.goldBdr,
    icon: Shield,
    examples: 'Emergency fund, insurance, home repairs, health care, debt payoff',
  },
  want: {
    label: 'Wants',
    sublabel: 'Major life goals',
    color: C.blue,
    dim: C.blueDim,
    bdr: C.blueBdr,
    icon: Star,
    examples: 'New car, home purchase, college fund, wedding, vacation',
  },
  wish: {
    label: 'Wishes',
    sublabel: 'Aspirational',
    color: '#818cf8',
    dim: 'rgba(129,140,248,0.08)',
    bdr: 'rgba(129,140,248,0.22)',
    icon: Anchor,
    examples: 'Dream home, early retirement, luxury purchase, boat, sabbatical',
  },
};

const GOAL_ICONS = { home: Home, car: Car, grad: GraduationCap, heart: Heart, anchor: Anchor, target: Target, calendar: Calendar, flag: Flag };
const PRIORITIES = ['high', 'medium', 'low'];
const PRIORITY_COLOR = { high: C.danger, medium: C.warn, low: C.t3 };

function monthsUntil(dateStr) {
  if (!dateStr) return 12;
  const target = new Date(dateStr + '-01');
  const now = new Date();
  return Math.max(1, Math.round((target - now) / (1000 * 60 * 60 * 24 * 30.44)));
}

function calcGoal(goal) {
  const months = monthsUntil(goal.targetDate);
  const years = months / 12;
  const inflation = goal.inflationAdjust ? Math.pow(1 + (goal.inflationRate || 3) / 100, years) : 1;
  const inflatedTarget = (goal.targetAmount || 0) * inflation;
  const remaining = Math.max(0, inflatedTarget - (goal.currentSaved || 0));
  const monthlyNeeded = remaining / months;
  return { months, years, inflatedTarget, remaining, monthlyNeeded };
}

function getGoalGuidance(goal, calc) {
  const name = (goal.name || '').toLowerCase();
  const monthly = fmt(calc.monthlyNeeded) + '/mo';
  const target = fmt(calc.inflatedTarget);

  if (/emergency|fund/i.test(name))
    return `Save ${monthly} over ${calc.months} months to reach your ${target} emergency fund. Prioritize a HYSA earning 4–5% APY for this goal — it should be liquid, not invested.`;
  if (/home|house|down/i.test(name))
    return `At ${monthly}, you reach your ${target} goal in ${calc.months} months. Keep this in a high-yield savings account or short-term treasuries, not the stock market, to avoid sequence risk near your purchase date.`;
  if (/car|vehicle/i.test(name))
    return `You need ${monthly} for ${calc.months} months to reach ${target}. Consider whether financing at a low rate (under 5%) and keeping savings invested may outperform paying cash, depending on your rate environment.`;
  if (/college|tuition|education/i.test(name))
    return `At ${monthly}, you reach ${target} for education costs. A 529 plan offers state tax deductions and tax-free growth for qualified education expenses — this should be the account of choice for this goal.`;
  if (/wedding/i.test(name))
    return `Save ${monthly} monthly to reach your ${target} wedding budget. The average US wedding runs $30K–$35K. Set this money in a dedicated account to prevent lifestyle spending erosion.`;
  if (/retire/i.test(name))
    return `This goal requires ${monthly} monthly over ${calc.months} months. Maximize 401(k) and IRA contributions first — tax-advantaged compounding materially accelerates retirement accumulation.`;
  return `To reach ${target} by your target date, save ${monthly} monthly over the next ${calc.months} months. Automate this transfer on payday to ensure consistent progress.`;
}

const EMPTY_GOAL = {
  name: '', tier: 'want', targetAmount: 10000, currentSaved: 0,
  targetDate: '', inflationAdjust: false, inflationRate: 3,
  isRecurring: false, frequency: 'one-time', priority: 'medium', notes: '',
};

function GoalCard({ goal, onEdit, onDelete }) {
  const calc = useMemo(() => calcGoal(goal), [goal]);
  const tc = TIER_CONFIG[goal.tier] || TIER_CONFIG.want;
  const progress = goal.targetAmount > 0 ? Math.min(100, (goal.currentSaved || 0) / goal.targetAmount * 100) : 0;
  const [open, setOpen] = useState(false);

  return (
    <div style={{ background:C.raise, border:`1px solid ${C.b2}`, borderRadius:12, marginBottom:10, overflow:'hidden' }}>
      <div style={{ padding:'16px 18px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:10 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
              <span style={{ fontFamily:DISPLAY, fontSize:14, fontWeight:700, color:C.t1 }}>{goal.name || 'Unnamed Goal'}</span>
              <span style={{ fontFamily:UI, fontSize:9, fontWeight:700, textTransform:'uppercase',
                letterSpacing:'0.08em', color:PRIORITY_COLOR[goal.priority],
                background: PRIORITY_COLOR[goal.priority] + '18', padding:'1px 5px', borderRadius:3 }}>
                {goal.priority}
              </span>
            </div>
            <div style={{ fontFamily:MONO, fontSize:16, fontWeight:800, color:tc.color }}>
              {fmt(calc.inflatedTarget)}
              {goal.inflationAdjust && calc.inflatedTarget !== goal.targetAmount && (
                <span style={{ fontFamily:UI, fontSize:10, color:C.t3, fontWeight:400, marginLeft:6 }}>
                  inflation-adj.
                </span>
              )}
            </div>
          </div>
          <div style={{ display:'flex', gap:5, flexShrink:0 }}>
            <button onClick={() => setOpen(o => !o)}
              style={{ background:'none', border:`1px solid ${C.b2}`, borderRadius:6, padding:'4px 6px', cursor:'pointer', color:C.t3 }}>
              <Info size={12} />
            </button>
            <button onClick={onEdit}
              style={{ background:'none', border:`1px solid ${C.b2}`, borderRadius:6, padding:'4px 6px', cursor:'pointer', color:C.t3 }}>
              <Edit3 size={12} />
            </button>
            <button onClick={onDelete}
              style={{ background:'none', border:`1px solid rgba(139,58,58,0.3)`, borderRadius:6, padding:'4px 6px', cursor:'pointer', color:C.danger }}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom:8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
            <span style={{ fontFamily:UI, fontSize:11, color:C.t3 }}>
              {fmt(goal.currentSaved || 0)} saved
            </span>
            <span style={{ fontFamily:MONO, fontSize:11, color:tc.color, fontWeight:700 }}>
              {progress.toFixed(0)}%
            </span>
          </div>
          <div style={{ height:5, background:C.b2, borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${progress}%`, background:tc.color,
              borderRadius:99, transition:'width 0.6s ease' }} />
          </div>
        </div>

        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <div style={{ fontFamily:UI, fontSize:11, color:C.t3 }}>
            <span style={{ color:C.t2 }}>{fmt(calc.monthlyNeeded)}/mo</span> needed
          </div>
          {goal.targetDate && (
            <div style={{ fontFamily:UI, fontSize:11, color:C.t3 }}>
              <span style={{ color:C.t2 }}>{calc.months} months</span> to go
            </div>
          )}
        </div>
      </div>

      {open && (
        <div style={{ borderTop:`1px solid ${C.b1}`, padding:'14px 18px',
          background:'rgba(0,0,0,0.1)' }}>
          <div style={{ fontFamily:UI, fontSize:12, lineHeight:1.65, color:C.t2 }}>
            {getGoalGuidance(goal, calc)}
          </div>
        </div>
      )}
    </div>
  );
}

function GoalModal({ goal, onSave, onClose }) {
  const [form, setForm] = useState(goal || EMPTY_GOAL);
  const set = k => v => setForm(p => ({ ...p, [k]: v }));

  const labelStyle = { fontFamily:UI, fontSize:11, color:C.t2, marginBottom:5, display:'block' };
  const rowStyle = { marginBottom:14 };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:C.surf, border:`1px solid ${C.b2}`, borderRadius:16,
        padding:'28px 30px', width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <h3 style={{ fontFamily:DISPLAY, fontSize:20, fontWeight:700, color:C.t1, margin:0 }}>
            {goal?.id ? 'Edit Goal' : 'Add Goal'}
          </h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.t3 }}>
            <X size={18} />
          </button>
        </div>

        <div style={rowStyle}>
          <label style={labelStyle}>Goal Name</label>
          <input className="bph-input" value={form.name}
            onChange={e => set('name')(e.target.value)} placeholder="e.g. Emergency Fund" />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
          <div>
            <label style={labelStyle}>Tier</label>
            <select className="bph-select" value={form.tier} onChange={e => set('tier')(e.target.value)}>
              <option value="need">Need</option>
              <option value="want">Want</option>
              <option value="wish">Wish</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Priority</label>
            <select className="bph-select" value={form.priority} onChange={e => set('priority')(e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
          <div>
            <label style={labelStyle}>Target Amount ($)</label>
            <input type="number" className="bph-input" value={form.targetAmount || ''}
              onChange={e => set('targetAmount')(+e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Already Saved ($)</label>
            <input type="number" className="bph-input" value={form.currentSaved || ''}
              onChange={e => set('currentSaved')(+e.target.value)} />
          </div>
        </div>
        <div style={rowStyle}>
          <label style={labelStyle}>Target Date (Month/Year)</label>
          <input type="month" className="bph-input" value={form.targetDate}
            onChange={e => set('targetDate')(e.target.value)} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, padding:'10px 14px',
          background:C.raise, borderRadius:8 }}>
          <input type="checkbox" id="inflAdj" checked={form.inflationAdjust}
            onChange={e => set('inflationAdjust')(e.target.checked)}
            style={{ accentColor:C.gold, width:15, height:15 }} />
          <label htmlFor="inflAdj" style={{ fontFamily:UI, fontSize:13, color:C.t2, cursor:'pointer' }}>
            Adjust for inflation
          </label>
          {form.inflationAdjust && (
            <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:'auto' }}>
              <input type="number" className="bph-input" style={{ width:70 }}
                value={form.inflationRate} onChange={e => set('inflationRate')(+e.target.value)} />
              <span style={{ fontFamily:UI, fontSize:12, color:C.t3 }}>%/yr</span>
            </div>
          )}
        </div>
        <div style={rowStyle}>
          <label style={labelStyle}>Notes (optional)</label>
          <input className="bph-input" value={form.notes}
            onChange={e => set('notes')(e.target.value)} placeholder="Any additional context..." />
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:24 }}>
          <button onClick={onClose} style={{ padding:'9px 18px', borderRadius:8, border:`1px solid ${C.b2}`,
            background:'transparent', color:C.t2, fontFamily:UI, fontSize:13, cursor:'pointer' }}>
            Cancel
          </button>
          <button onClick={() => onSave({ ...form, id: form.id || `g${Date.now()}` })}
            style={{ padding:'9px 18px', borderRadius:8, border:'none',
              background:C.gold, color:C.bg, fontFamily:UI, fontSize:13, fontWeight:700, cursor:'pointer' }}>
            Save Goal
          </button>
        </div>
      </div>
    </div>
  );
}

function TierColumn({ tier, goals, onAdd, onEdit, onDelete }) {
  const tc = TIER_CONFIG[tier];
  const Icon = tc.icon;
  const tierGoals = goals.filter(g => g.tier === tier);
  const totalMonthly = tierGoals.reduce((s, g) => s + calcGoal(g).monthlyNeeded, 0);

  return (
    <div style={{ flex:1, minWidth:240 }}>
      <div style={{ background:C.surf, border:`1px solid ${tc.bdr}`, borderRadius:14,
        padding:'18px 18px 14px', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:tc.dim,
            border:`1px solid ${tc.bdr}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={15} color={tc.color} />
          </div>
          <div>
            <div style={{ fontFamily:DISPLAY, fontSize:16, fontWeight:700, color:C.t1 }}>{tc.label}</div>
            <div style={{ fontFamily:UI, fontSize:10, color:C.t3 }}>{tc.sublabel}</div>
          </div>
        </div>
        <div style={{ fontFamily:UI, fontSize:11, color:C.t3, marginBottom:10, lineHeight:1.5 }}>
          e.g. {tc.examples}
        </div>
        {tierGoals.length > 0 && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'8px 10px', background:C.raise, borderRadius:8 }}>
            <span style={{ fontFamily:UI, fontSize:11, color:C.t3 }}>{tierGoals.length} goal{tierGoals.length !== 1 ? 's' : ''}</span>
            <span style={{ fontFamily:MONO, fontSize:12, fontWeight:700, color:tc.color }}>
              {fmt(totalMonthly)}/mo needed
            </span>
          </div>
        )}
      </div>

      {tierGoals.map(g => (
        <GoalCard key={g.id} goal={g} onEdit={() => onEdit(g)} onDelete={() => onDelete(g.id)} />
      ))}

      <button onClick={() => onAdd(tier)}
        style={{ width:'100%', padding:'10px', borderRadius:10,
          border:`1px dashed ${tc.bdr}`, background:tc.dim,
          color:tc.color, fontFamily:UI, fontSize:12, fontWeight:600,
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          transition:'all 0.15s' }}>
        <Plus size={13} /> Add {tc.label.slice(0,-1)}
      </button>
    </div>
  );
}

function GoalsView({ onBack }) {
  const [goals, setGoals] = useLS('bph_goals', []);
  const [modal, setModal] = useState(null); // null | { goal } | { tier }
  const cross = useMemo(() => loadCrossData(), []);
  const surplus = cross.monthlyIncome - cross.monthlyExpenses;

  const totalMonthlyNeeded = goals.reduce((s, g) => s + calcGoal(g).monthlyNeeded, 0);
  const remaining = surplus - totalMonthlyNeeded;

  const openAdd = tier => setModal({ mode: 'add', initialTier: tier });
  const openEdit = goal => setModal({ mode: 'edit', goal });
  const deleteGoal = id => setGoals(prev => prev.filter(g => g.id !== id));

  const saveGoal = g => {
    setGoals(prev => {
      const exists = prev.find(x => x.id === g.id);
      return exists ? prev.map(x => x.id === g.id ? g : x) : [...prev, g];
    });
    setModal(null);
  };

  const modalGoal = modal?.mode === 'edit' ? modal.goal
    : modal ? { ...EMPTY_GOAL, tier: modal.initialTier || 'want' } : null;

  return (
    <div style={{ padding:'36px 40px 60px', maxWidth:1200, margin:'0 auto' }}>
      <style>{HUB_CSS}</style>
      <BackBtn onBack={onBack} />

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:42, height:42, borderRadius:11, background:C.goldDim,
            border:`1px solid ${C.goldBdr}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Target size={19} color={C.gold} />
          </div>
          <div>
            <h2 style={{ fontFamily:DISPLAY, fontSize:26, fontWeight:700, color:C.t1, margin:0, lineHeight:1.15 }}>
              Goals: Needs, Wants & Wishes
            </h2>
            <p style={{ fontFamily:UI, fontSize:13, color:C.t3, margin:'4px 0 0' }}>
              Plan future purchases with inflation adjustment and monthly savings guidance
            </p>
          </div>
        </div>
        <button onClick={() => setModal({ mode:'add', initialTier:'want' })}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px',
            background:C.gold, border:'none', borderRadius:9, color:C.bg,
            fontFamily:UI, fontSize:13, fontWeight:700, cursor:'pointer' }}>
          <Plus size={14} /> Add Goal
        </button>
      </div>

      {/* Summary bar */}
      <div style={{ background:C.surf, border:`1px solid ${C.b1}`, borderRadius:14,
        padding:'18px 22px', marginBottom:24, display:'flex', gap:20, flexWrap:'wrap', alignItems:'center' }}>
        <div>
          <div style={{ fontFamily:UI, fontSize:10, color:C.t3, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Total Goals</div>
          <div style={{ fontFamily:MONO, fontSize:20, fontWeight:800, color:C.t1 }}>{goals.length}</div>
        </div>
        <div style={{ width:1, height:36, background:C.b2 }} />
        <div>
          <div style={{ fontFamily:UI, fontSize:10, color:C.t3, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Monthly Savings Needed</div>
          <div style={{ fontFamily:MONO, fontSize:20, fontWeight:800, color:C.gold }}>{fmt(totalMonthlyNeeded)}</div>
        </div>
        {cross.hasBP && (
          <>
            <div style={{ width:1, height:36, background:C.b2 }} />
            <div>
              <div style={{ fontFamily:UI, fontSize:10, color:C.t3, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Budget Surplus</div>
              <div style={{ fontFamily:MONO, fontSize:20, fontWeight:800, color: surplus >= 0 ? C.up : C.danger }}>{fmt(surplus)}</div>
            </div>
            <div style={{ width:1, height:36, background:C.b2 }} />
            <div>
              <div style={{ fontFamily:UI, fontSize:10, color:C.t3, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>After Goals</div>
              <div style={{ fontFamily:MONO, fontSize:20, fontWeight:800, color: remaining >= 0 ? C.up : C.danger }}>{fmt(remaining)}</div>
            </div>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontFamily:UI, fontSize:11, color:C.t3, marginBottom:6 }}>Goals vs. Surplus</div>
              <div style={{ height:6, background:C.b2, borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:99,
                  width: `${clamp(surplus > 0 ? (totalMonthlyNeeded / surplus) * 100 : 100, 0, 100)}%`,
                  background: remaining >= 0 ? C.up : C.danger, transition:'width 0.5s' }} />
              </div>
            </div>
          </>
        )}
      </div>

      {goals.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:C.t3 }}>
          <Target size={40} style={{ opacity:0.3, marginBottom:16 }} />
          <div style={{ fontFamily:DISPLAY, fontSize:20, color:C.t2, marginBottom:8 }}>No goals yet</div>
          <div style={{ fontFamily:UI, fontSize:13, color:C.t3, marginBottom:20 }}>
            Add your first goal across Needs, Wants, or Wishes to start planning.
          </div>
          <button onClick={() => setModal({ mode:'add', initialTier:'need' })}
            style={{ padding:'10px 20px', background:C.gold, border:'none', borderRadius:9,
              color:C.bg, fontFamily:UI, fontSize:13, fontWeight:700, cursor:'pointer' }}>
            Add Your First Goal
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', gap:18, alignItems:'flex-start', flexWrap:'wrap' }}>
          {['need','want','wish'].map(tier => (
            <TierColumn key={tier} tier={tier} goals={goals}
              onAdd={openAdd} onEdit={openEdit} onDelete={deleteGoal} />
          ))}
        </div>
      )}

      {/* Goals Timeline Chart */}
      {goals.length > 0 && (() => {
        const now = new Date();
        const timelineData = goals
          .filter(g => g.targetDate)
          .map(g => {
            const calc = calcGoal(g);
            const tc = TIER_CONFIG[g.tier] || TIER_CONFIG.want;
            return {
              name: g.name || 'Goal',
              amount: Math.round(calc.inflatedTarget),
              monthly: Math.round(calc.monthlyNeeded),
              months: calc.months,
              fill: tc.color,
            };
          })
          .sort((a, b) => a.months - b.months)
          .slice(0, 8);

        if (timelineData.length === 0) return null;
        return (
          <div style={{ background:C.surf, border:`1px solid ${C.b1}`, borderRadius:14,
            padding:'22px 22px', marginTop:24 }}>
            <SectionLabel color={C.t3}>Goals Timeline — Monthly Savings Required</SectionLabel>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timelineData} layout="vertical" margin={{ top:0, right:60, bottom:0, left:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.b1} horizontal={false} />
                <XAxis type="number" tickFormatter={v => `$${Math.round(v/1000)}k`}
                  tick={{ fill:C.t3, fontFamily:MONO, fontSize:10 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={110}
                  tick={{ fill:C.t2, fontFamily:UI, fontSize:11 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v, n) => [fmt(v), n === 'monthly' ? 'Monthly needed' : 'Target amount']}
                  contentStyle={{ background:C.raise, border:`1px solid ${C.b2}`, borderRadius:8,
                    fontFamily:UI, fontSize:12, color:C.t1 }} />
                <Bar dataKey="monthly" name="monthly" radius={[0,4,4,0]}>
                  {timelineData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })()}

      {modal && (
        <GoalModal goal={modalGoal} onSave={saveGoal} onClose={() => setModal(null)} />
      )}

      <div style={{ marginTop:32, padding:'14px 18px', background:C.raise,
        border:`1px solid ${C.b2}`, borderRadius:10 }}>
        <span style={{ fontFamily:UI, fontSize:11, color:C.t3, lineHeight:1.6 }}>
          Monthly savings estimates assume linear savings with no investment return. Inflation adjustments use compound annual growth. Estimates for educational purposes.
        </span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════
export default function BudgetPlannerHub() {
  const [view, setView] = useState('hub');

  if (view === 'budget') {
    return (
      <div>
        <div style={{ padding:'16px 24px 0', maxWidth:1200, margin:'0 auto' }}>
          <BackBtn onBack={() => setView('hub')} label="Back to Budget Hub" />
        </div>
        <BudgetPlannerOriginal />
      </div>
    );
  }
  if (view === 'ratios') return <FinancialRatiosView onBack={() => setView('hub')} />;
  if (view === 'goals')  return <GoalsView  onBack={() => setView('hub')} />;
  return <HubView onSelect={setView} />;
}
