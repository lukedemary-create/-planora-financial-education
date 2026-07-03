import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import {
  Info, CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  TrendingUp, DollarSign, Shield, Clock, Layers, BookOpen,
  ArrowRight, BarChart2, Zap, Scale, RefreshCw, Gift,
} from 'lucide-react';

/* ── Design tokens ─────────────────────────────────────────────── */
const TEAL  = '#00B4C6';
const LIGHT = '#5BC8E2';
const GOLD  = '#c9a96e';
const BG    = '#1a1410';
const SURF  = '#231c16';
const RAISE = '#2d2419';
const B1    = '#2a2018';
const B2    = '#3d3028';
const T1    = '#f0e8d8';
const T2    = '#a89070';
const T3    = '#6b5540';
const GREEN = '#4ade80';
const RED   = '#f87171';
const AMBER = '#fbbf24';
const UI    = "'Inter', system-ui, sans-serif";
const DISP  = "'Playfair Display', Georgia, serif";

/* ── 2026 CFP Tax Data ─────────────────────────────────────────── */
// Source: CFP Board 2026 Exam Tax Tables
const BRACKETS = {
  single: [
    { rate: 0.10, min: 0,       max: 12400   },
    { rate: 0.12, min: 12400,   max: 50400   },
    { rate: 0.22, min: 50400,   max: 105700  },
    { rate: 0.24, min: 105700,  max: 201775  },
    { rate: 0.32, min: 201775,  max: 256225  },
    { rate: 0.35, min: 256225,  max: 640600  },
    { rate: 0.37, min: 640600,  max: Infinity },
  ],
  mfj: [
    { rate: 0.10, min: 0,       max: 24800   },
    { rate: 0.12, min: 24800,   max: 100800  },
    { rate: 0.22, min: 100800,  max: 211400  },
    { rate: 0.24, min: 211400,  max: 403550  },
    { rate: 0.32, min: 403550,  max: 512450  },
    { rate: 0.35, min: 512450,  max: 768700  },
    { rate: 0.37, min: 768700,  max: Infinity },
  ],
  hoh: [
    { rate: 0.10, min: 0,       max: 17700   },
    { rate: 0.12, min: 17700,   max: 67450   },
    { rate: 0.22, min: 67450,   max: 105700  },
    { rate: 0.24, min: 105700,  max: 201750  },
    { rate: 0.32, min: 201750,  max: 256200  },
    { rate: 0.35, min: 256200,  max: 640600  },
    { rate: 0.37, min: 640600,  max: Infinity },
  ],
  mfs: [
    { rate: 0.10, min: 0,       max: 12400   },
    { rate: 0.12, min: 12400,   max: 50400   },
    { rate: 0.22, min: 50400,   max: 105700  },
    { rate: 0.24, min: 105700,  max: 201775  },
    { rate: 0.32, min: 201775,  max: 256225  },
    { rate: 0.35, min: 256225,  max: 384350  },
    { rate: 0.37, min: 384350,  max: Infinity },
  ],
};

const STD_DED = { single: 16100, mfj: 32200, hoh: 24150, mfs: 16100 };

const LTCG = {
  single: [
    { rate: 0.00, max: 49450  },
    { rate: 0.15, max: 545500 },
    { rate: 0.20, max: Infinity },
  ],
  mfj: [
    { rate: 0.00, max: 98900  },
    { rate: 0.15, max: 613700 },
    { rate: 0.20, max: Infinity },
  ],
};

function calcTax(taxableIncome, filingStatus) {
  const brackets = BRACKETS[filingStatus];
  let tax = 0;
  for (const b of brackets) {
    if (taxableIncome <= b.min) break;
    const taxable = Math.min(taxableIncome, b.max) - b.min;
    tax += taxable * b.rate;
  }
  return tax;
}

function marginalRate(taxableIncome, filingStatus) {
  const brackets = BRACKETS[filingStatus];
  for (const b of [...brackets].reverse()) {
    if (taxableIncome > b.min) return b.rate;
  }
  return 0.10;
}

/* ── Shared components ─────────────────────────────────────────── */
function SCard({ title, subtitle, children, accent = TEAL }) {
  return (
    <div style={{ background: SURF, border: `1px solid ${B1}`, borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: '1.25rem' }}>
          {title && (
            <h3 style={{ fontFamily: DISP, fontSize: '1.2rem', fontWeight: 700, color: T1, margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>
              {title}
            </h3>
          )}
          {subtitle && <p style={{ margin: 0, fontSize: '0.875rem', color: T3, lineHeight: 1.65, fontFamily: UI }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function InfoBox({ children, color = TEAL, icon: Icon = Info }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '0.75rem 0.875rem', background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 10, marginTop: '0.875rem' }}>
      <Icon size={14} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{ margin: 0, fontSize: '0.8125rem', color: T2, lineHeight: 1.7, fontFamily: UI }}>{children}</p>
    </div>
  );
}

function Pill({ label, color = TEAL }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 9px', background: `${color}18`, border: `1px solid ${color}35`, borderRadius: 20, fontSize: '0.6875rem', fontWeight: 700, color, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: UI }}>
      {label}
    </span>
  );
}

function StatCard({ label, value, sub, color = TEAL }) {
  return (
    <div style={{ background: RAISE, border: `1px solid ${B2}`, borderRadius: 12, padding: '1rem 1.125rem' }}>
      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: T3, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: UI, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: '1.375rem', fontWeight: 800, color, fontFamily: UI, lineHeight: 1.1, marginBottom: sub ? 4 : 0 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: T3, fontFamily: UI }}>{sub}</div>}
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: `1px solid ${B2}`, borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: open ? `${TEAL}08` : RAISE, border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontFamily: UI, fontSize: '0.875rem', fontWeight: 600, color: open ? T1 : T2 }}>{title}</span>
        {open ? <ChevronUp size={14} color={TEAL} /> : <ChevronDown size={14} color={T3} />}
      </button>
      {open && <div style={{ padding: '1rem', background: `${TEAL}05`, borderTop: `1px solid ${B2}` }}>{children}</div>}
    </div>
  );
}

function fmt(n)  { return '$' + Math.round(n).toLocaleString(); }
function fmtPct(n) { return (n * 100).toFixed(1) + '%'; }

/* ── Tab: Key Numbers ─────────────────────────────────────────── */
function TabKeyNumbers() {
  return (
    <div>
      <SCard title="2026 Federal Income Tax Brackets" subtitle="Taxable income thresholds after standard or itemized deductions. These are marginal rates — only the income in each bracket is taxed at that rate.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {[
            { label: 'Single', key: 'single' },
            { label: 'Married Filing Jointly', key: 'mfj' },
            { label: 'Head of Household', key: 'hoh' },
          ].map(({ label, key }) => (
            <div key={key}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: TEAL, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: UI, marginBottom: 8 }}>{label}</div>
              {BRACKETS[key].filter(b => b.max !== Infinity).concat(BRACKETS[key].slice(-1)).map((b, i, arr) => {
                const isTop = b.max === Infinity;
                const colors = ['#94a3b8', '#60a5fa', '#34d399', AMBER, '#f97316', '#f87171', '#e879f9'];
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < arr.length - 1 ? `1px solid ${B1}` : 'none' }}>
                    <span style={{ fontFamily: UI, fontSize: '0.8125rem', fontWeight: 700, color: colors[i] }}>{(b.rate * 100).toFixed(0)}%</span>
                    <span style={{ fontFamily: UI, fontSize: '0.75rem', color: T2 }}>
                      {isTop ? `Over ${fmt(b.min)}` : `${fmt(b.min)} – ${fmt(b.max)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <InfoBox>The U.S. uses a <strong style={{ color: T1 }}>progressive marginal</strong> system. A 24% bracket does not mean you owe 24% of all income — only the dollars within that bracket are taxed at 24%.</InfoBox>
      </SCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: '1.25rem' }}>
        <StatCard label="Standard Deduction — Single" value="$16,100" sub="+$2,050 if age 65+ or blind" />
        <StatCard label="Standard Deduction — MFJ" value="$32,200" sub="+$1,650 per spouse age 65+ or blind" />
        <StatCard label="Standard Deduction — HoH" value="$24,150" sub="2026 CFP Board figure" />
        <StatCard label="401(k) / 403(b) / 457 Limit" value="$24,500" sub="+$8,000 catch-up age 50–59, 64+" color={GOLD} />
        <StatCard label="Super Catch-Up (Age 60–63)" value="$11,250" sub="SECURE 2.0 — total $35,750" color={GOLD} />
        <StatCard label="IRA / Roth IRA Limit" value="$7,500" sub="+$1,100 catch-up age 50+" color={GOLD} />
        <StatCard label="HSA — Self-Only" value="$4,400" sub="+$1,000 catch-up age 55+" color={GREEN} />
        <StatCard label="HSA — Family" value="$8,750" sub="+$1,000 catch-up age 55+" color={GREEN} />
        <StatCard label="SS Wage Base" value="$184,500" sub="6.2% SS tax on wages up to this" color={LIGHT} />
        <StatCard label="Annual Gift Exclusion" value="$19,000" sub="Per recipient, per year" color={AMBER} />
        <StatCard label="Lifetime Estate Exemption" value="$15,000,000" sub="Applicable exclusion amount 2026" color={AMBER} />
        <StatCard label="NIIT Threshold — Single/HoH" value="$200,000" sub="3.8% on net investment income" color={RED} />
      </div>

      <SCard title="Long-Term Capital Gains Rates 2026" subtitle="Applies to assets held more than 12 months. Far more favorable than ordinary income rates.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {[
            { label: 'Single', data: [{ rate: '0%', range: 'Up to $49,450' }, { rate: '15%', range: '$49,451 – $545,500' }, { rate: '20%', range: 'Over $545,500' }] },
            { label: 'Married Filing Jointly', data: [{ rate: '0%', range: 'Up to $98,900' }, { rate: '15%', range: '$98,901 – $613,700' }, { rate: '20%', range: 'Over $613,700' }] },
            { label: 'Head of Household', data: [{ rate: '0%', range: 'Up to $66,200' }, { rate: '15%', range: '$66,201 – $579,600' }, { rate: '20%', range: 'Over $579,600' }] },
            { label: 'Married Filing Separately', data: [{ rate: '0%', range: 'Up to $49,450' }, { rate: '15%', range: '$49,451 – $306,850' }, { rate: '20%', range: 'Over $306,850' }] },
          ].map(({ label, data }) => (
            <div key={label}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: TEAL, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: UI, marginBottom: 10 }}>{label}</div>
              {data.map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', background: i % 2 === 0 ? RAISE : 'transparent', borderRadius: 7, marginBottom: 3 }}>
                  <span style={{ fontFamily: UI, fontSize: '0.875rem', fontWeight: 800, color: i === 0 ? GREEN : i === 1 ? AMBER : RED }}>{row.rate}</span>
                  <span style={{ fontFamily: UI, fontSize: '0.8125rem', color: T2 }}>{row.range}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <InfoBox color={GREEN} icon={CheckCircle2}>
          If your taxable income is below $49,450 (single) or $98,900 (MFJ), you pay <strong style={{ color: GREEN }}>0% federal tax</strong> on long-term capital gains. Strategic realizations in low-income years can be completely tax-free. Note: 25% rate applies to Section 1250 depreciation recapture; 28% applies to collectibles.
        </InfoBox>
      </SCard>

      <SCard title="Roth IRA Income Phase-Out 2026" subtitle="Above these MAGI ranges you cannot contribute directly to a Roth IRA. Backdoor Roth is an alternative for high earners.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { label: 'Single', range: '$153,000 – $168,000' },
            { label: 'Married Filing Jointly', range: '$242,000 – $252,000' },
            { label: 'Married Filing Separately', range: '$0 – $10,000' },
          ].map((row, i) => (
            <div key={i} style={{ background: RAISE, border: `1px solid ${B2}`, borderRadius: 10, padding: '0.875rem 1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: T3, fontFamily: UI, marginBottom: 5 }}>{row.label}</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: TEAL, fontFamily: UI }}>{row.range}</div>
            </div>
          ))}
        </div>
      </SCard>

      <SCard title="FICA Taxes 2026" subtitle="Payroll taxes fund Social Security and Medicare. Self-employed individuals pay both employee and employer portions (15.3% total on first $176,100).">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: UI, fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: RAISE }}>
                {['Tax', 'Rate (Employee)', 'Wage Base', 'Notes'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: T3, fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Social Security', '6.2%', '$184,500 wage base', 'Employer also pays 6.2%'],
                ['Medicare', '1.45%', 'No limit', 'Employer also pays 1.45%'],
                ['Additional Medicare', '0.9%', 'Over $200K (S/HoH) / $250K (MFJ) / $125K (MFS)', 'Employee only; no employer match'],
                ['Net Investment Income (NIIT)', '3.8%', 'Investment income over $200K (S) / $250K (MFJ) / $125K (MFS)', 'Does not apply to wages or retirement distributions'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${B1}` }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '8px 12px', color: j === 0 ? T1 : T2, fontWeight: j === 0 ? 600 : 400 }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SCard>

      <SCard title="Estates, Trusts & Corporate Tax Rates 2026">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: TEAL, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: UI, marginBottom: 8 }}>Estates & Non-Grantor Trusts</div>
            {[['$0 – $3,300','10%'],['$3,301 – $11,700','24%'],['$11,701 – $16,000','35%'],['Over $16,000','37%']].map(([r,t],i)=>(
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom: i<3?`1px solid ${B1}`:'none' }}>
                <span style={{ fontFamily:UI, fontSize:'0.8125rem', color:T2 }}>{r}</span>
                <span style={{ fontFamily:UI, fontSize:'0.8125rem', fontWeight:700, color:T1 }}>{t}</span>
              </div>
            ))}
            <div style={{ marginTop:10, fontSize:'0.75rem', color:T3, fontFamily:UI }}>Note: Trust brackets compress quickly — trusts hit 37% at just $16,000 of income.</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: GOLD, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: UI, marginBottom: 8 }}>Corporate Income Tax</div>
            <div style={{ background: RAISE, border: `1px solid ${B2}`, borderRadius: 8, padding: '0.875rem 1rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: GOLD, fontFamily: UI }}>21%</div>
              <div style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI }}>Flat rate on all corporate taxable income (no graduated brackets for C-corps)</div>
            </div>
            <div style={{ marginTop: 10, fontSize: '0.75rem', color: T3, fontFamily: UI }}>Pass-through entities (S-corps, LLCs, partnerships) are taxed at owner's individual rates, not the corporate rate.</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: AMBER, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: UI, marginBottom: 8 }}>2026 AMT — Exemptions & Phase-Outs</div>
            {[
              ['Single & HoH', '$90,100', '$500,000'],
              ['Married Filing Jointly', '$140,200', '$1,000,000'],
              ['Married Filing Separately', '$70,100', '$500,000'],
              ['Trusts & Estates', '$31,400', '$104,800'],
            ].map(([status, ex, po], i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom: i<3?`1px solid ${B1}`:'none', gap:8 }}>
                <span style={{ fontFamily:UI, fontSize:'0.75rem', color:T2 }}>{status}</span>
                <span style={{ fontFamily:UI, fontSize:'0.75rem', color:AMBER, fontWeight:600 }}>{ex} exemption</span>
              </div>
            ))}
            <div style={{ marginTop: 8, fontSize:'0.75rem', color:T3, fontFamily:UI }}>AMT rates: 26% on AMTI up to $244,500; 28% above. Phase-out reduces exemption $0.25 for each $1 over threshold.</div>
          </div>
        </div>
      </SCard>

      <SCard title="2026 Retirement Plan Limits (CFP Board)" subtitle="All contribution limits from the official 2026 CFP exam tax tables.">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: UI, fontSize: '0.8125rem' }}>
            <tbody>
              {[
                ['401(k) / 403(b) / 457 elective deferrals', '$24,500', TEAL],
                ['Catch-up contribution (age 50–59, 64+)', '$8,000', TEAL],
                ['Catch-up contribution (ages 60–63)', '$11,250', TEAL],
                ['Defined contribution plan limit', '$72,000', GOLD],
                ['Defined benefit plan limit', '$290,000', GOLD],
                ['SIMPLE plan elective deferral', '$17,000', LIGHT],
                ['SIMPLE catch-up (age 50+)', '$4,000', LIGHT],
                ['SIMPLE catch-up (ages 60–63)', '$5,250', LIGHT],
                ['SEP contribution limit', '$72,000', GOLD],
                ['Maximum includible compensation', '$360,000', T2],
                ['Highly compensated employee threshold', '$160,000', AMBER],
                ['Key employee (top-heavy plan)', '>$235,000', AMBER],
                ['IRA / Roth IRA contribution limit', '$7,500', GREEN],
                ['IRA / Roth IRA catch-up (age 50+)', '$1,100', GREEN],
                ['IRA deduction phase-out — Single/HoH', '$81,000 – $91,000', T2],
                ['IRA deduction phase-out — MFJ', '$129,000 – $149,000', T2],
                ['IRA deduction phase-out — Spousal IRA', '$242,000 – $252,000', T2],
                ['Roth IRA phase-out — Single', '$153,000 – $168,000', GREEN],
                ['Roth IRA phase-out — MFJ', '$242,000 – $252,000', GREEN],
                ['Roth IRA phase-out — MFS', '$0 – $10,000', GREEN],
              ].map(([label, value, color], i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${B1}`, background: i%2===0?'transparent':`${RAISE}88` }}>
                  <td style={{ padding:'7px 10px', color:T2 }}>{label}</td>
                  <td style={{ padding:'7px 10px', color, fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SCard>

      <SCard title="Education & Other Phase-Outs 2026">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: UI, fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: RAISE }}>
                {['Benefit','Single / HoH','Married Filing Jointly'].map(h=>(
                  <th key={h} style={{ padding:'7px 10px', textAlign:'left', color:T3, fontWeight:600, fontSize:'0.75rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['EE Bonds — Education Exclusion','$101,800 – $116,800','$152,650 – $182,650'],
                ['Coverdell ESA Contribution','$95,000 – $110,000','$190,000 – $220,000'],
                ['Lifetime Learning Credit','$80,000 – $90,000','$160,000 – $180,000'],
                ['American Opportunity Tax Credit','$80,000 – $90,000','$160,000 – $180,000'],
                ['Student Loan Interest Deduction','$85,000 – $100,000','$175,000 – $205,000'],
                ['Child Tax Credit Phase-Out Begins','$200,000','$400,000'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${B1}`, background: i%2===0?'transparent':`${RAISE}88` }}>
                  {row.map((cell,j)=>(
                    <td key={j} style={{ padding:'7px 10px', color: j===0?T2:TEAL, fontWeight: j===0?400:600 }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <InfoBox color={TEAL}>
          Child Tax Credit phases out at $55 per $1,000 of MAGI over the threshold ($44,000 per child before full phase-out). Social Security full retirement age is 67 for anyone born in 1960 or later. SS wage base in 2026: $184,500; earnings limit below FRA: $24,480/year.
        </InfoBox>
      </SCard>
    </div>
  );
}

/* ── Tab: Bracket Calculator ──────────────────────────────────── */
function TabCalculator() {
  const [gross, setGross] = useState(120000);
  const [filing, setFiling] = useState('single');
  const [itemized, setItemized] = useState(0);

  const stdDed = STD_DED[filing];
  const deduction = Math.max(stdDed, itemized);
  const taxable = Math.max(0, gross - deduction);
  const tax = calcTax(taxable, filing);
  const marginal = marginalRate(taxable, filing);
  const effective = gross > 0 ? tax / gross : 0;

  const bracketBreakdown = useMemo(() => {
    const brackets = BRACKETS[filing];
    return brackets.map(b => {
      const inBracket = Math.max(0, Math.min(taxable, b.max) - b.min);
      return { rate: b.rate, income: inBracket, tax: inBracket * b.rate };
    }).filter(b => b.income > 0);
  }, [taxable, filing]);

  const chartColors = ['#94a3b8', '#60a5fa', '#34d399', AMBER, '#f97316', RED, '#e879f9'];

  return (
    <div>
      <SCard title="2026 Federal Tax Calculator" subtitle="Enter your gross income to see your tax obligation broken down by bracket. This is a simplified federal-only estimate.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: T1, marginBottom: 6, fontFamily: UI }}>Gross Income</label>
            <input
              type="number" value={gross} min={0} step={1000}
              onChange={e => setGross(Number(e.target.value))}
              style={{ width: '100%', padding: '9px 12px', background: RAISE, border: `1.5px solid ${B2}`, borderRadius: 9, color: T1, fontSize: '1rem', fontFamily: UI, boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = TEAL}
              onBlur={e => e.target.style.borderColor = B2}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: T1, marginBottom: 6, fontFamily: UI }}>Filing Status</label>
            <select
              value={filing} onChange={e => setFiling(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: RAISE, border: `1.5px solid ${B2}`, borderRadius: 9, color: T1, fontSize: '0.875rem', fontFamily: UI, boxSizing: 'border-box' }}
            >
              <option value="single">Single</option>
              <option value="mfj">Married Filing Jointly</option>
              <option value="hoh">Head of Household</option>
              <option value="mfs">Married Filing Separately</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: T1, marginBottom: 6, fontFamily: UI }}>Itemized Deductions (if any)</label>
            <input
              type="number" value={itemized} min={0} step={500}
              onChange={e => setItemized(Number(e.target.value))}
              style={{ width: '100%', padding: '9px 12px', background: RAISE, border: `1.5px solid ${B2}`, borderRadius: 9, color: T1, fontSize: '1rem', fontFamily: UI, boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = TEAL}
              onBlur={e => e.target.style.borderColor = B2}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: '1.25rem' }}>
          <StatCard label="Deduction Used" value={fmt(deduction)} sub={itemized > stdDed ? 'Itemized' : 'Standard'} color={TEAL} />
          <StatCard label="Taxable Income" value={fmt(taxable)} sub="After deduction" color={TEAL} />
          <StatCard label="Federal Tax" value={fmt(tax)} sub="Estimated" color={RED} />
          <StatCard label="Marginal Rate" value={fmtPct(marginal)} sub="Your top bracket" color={AMBER} />
          <StatCard label="Effective Rate" value={fmtPct(effective)} sub="Average on all income" color={GREEN} />
          <StatCard label="After-Tax Income" value={fmt(gross - tax)} sub="Before FICA & state" color={GREEN} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: T2, fontFamily: UI, marginBottom: 10 }}>Tax by Bracket</div>
          {bracketBreakdown.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ minWidth: 36, fontSize: '0.8125rem', fontWeight: 700, color: chartColors[i], fontFamily: UI }}>{(b.rate * 100).toFixed(0)}%</span>
              <div style={{ flex: 1, background: B2, borderRadius: 4, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (b.income / taxable) * 100)}%`, height: '100%', background: chartColors[i], borderRadius: 4, transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ minWidth: 80, fontSize: '0.8125rem', color: T2, fontFamily: UI, textAlign: 'right' }}>{fmt(b.income)}</span>
              <span style={{ minWidth: 70, fontSize: '0.8125rem', fontWeight: 600, color: T1, fontFamily: UI, textAlign: 'right' }}>{fmt(b.tax)} tax</span>
            </div>
          ))}
        </div>

        <InfoBox color={AMBER} icon={AlertCircle}>
          This calculator covers <strong style={{ color: T1 }}>federal income tax only</strong>. Add state income tax (0%–13.3% depending on state), FICA (7.65%), and NIIT if applicable for a complete picture.
        </InfoBox>
      </SCard>

      <SCard title="Marginal vs. Effective Rate — Why It Matters" subtitle="The single most misunderstood concept in U.S. tax law.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ background: `${RED}10`, border: `1px solid ${RED}25`, borderRadius: 10, padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: RED, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: UI, marginBottom: 8 }}>Common Misconception</div>
            <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, margin: 0 }}>
              "I'm in the 24% bracket so I owe 24% of my income." This is wrong and causes people to fear raises or freelance income.
            </p>
          </div>
          <div style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}25`, borderRadius: 10, padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: GREEN, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: UI, marginBottom: 8 }}>The Reality</div>
            <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, margin: 0 }}>
              You pay 10% on the first $11,925, 12% on the next slice, 22% on the next, and so on. Your <em>effective</em> rate is almost always well below your marginal bracket.
            </p>
          </div>
        </div>
        <InfoBox icon={CheckCircle2} color={GREEN}>
          A raise will never reduce your take-home pay. Only the <strong style={{ color: T1 }}>additional dollars</strong> in a higher bracket get taxed at the higher rate.
        </InfoBox>
      </SCard>
    </div>
  );
}

/* ── Tab: Account Types ───────────────────────────────────────── */
function TabAccounts() {
  const [income, setIncome]   = useState(100000);
  const [years, setYears]     = useState(30);
  const [growth, setGrowth]   = useState(7);
  const [contrib, setContrib] = useState(10000);
  const [nowRate, setNowRate] = useState(22);
  const [futRate, setFutRate] = useState(24);

  const fv = (pv, r, n) => pv * Math.pow(1 + r / 100, n);

  // Traditional: get tax break now, pay tax in retirement
  const tradFV    = fv(contrib, growth, years);
  const tradAfter = tradFV * (1 - futRate / 100);
  const tradDeferred = contrib * (nowRate / 100); // tax saved now

  // Roth: pay tax now, everything grows tax-free
  const rothAfterTax = contrib * (1 - nowRate / 100);
  const rothFV       = fv(rothAfterTax, growth, years); // all of this is tax-free

  const roths_better = rothFV > tradAfter;

  return (
    <div>
      <SCard title="Roth 401(k) vs. Traditional 401(k)" subtitle="The decision comes down to one question: will your tax rate be higher now or in retirement?">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: '1.25rem' }}>
          <div style={{ background: `${TEAL}10`, border: `1px solid ${TEAL}30`, borderRadius: 12, padding: '1.125rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: TEAL, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: UI, marginBottom: 10 }}>Roth 401(k)</div>
            {[
              ['Contributions', 'After-tax (no deduction now)'],
              ['Growth', 'Tax-free'],
              ['Withdrawals in retirement', 'Completely tax-free'],
              ['RMDs', 'None (unlike traditional)'],
              ['Best for', 'Expect higher tax rate in retirement'],
              ['Income limits', 'None (unlike Roth IRA)'],
            ].map(([k, v], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 5 ? `1px solid ${B1}` : 'none', gap: 8 }}>
                <span style={{ fontSize: '0.8125rem', color: T3, fontFamily: UI }}>{k}</span>
                <span style={{ fontSize: '0.8125rem', color: T1, fontFamily: UI, fontWeight: 500, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}30`, borderRadius: 12, padding: '1.125rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: GOLD, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: UI, marginBottom: 10 }}>Traditional 401(k)</div>
            {[
              ['Contributions', 'Pre-tax (reduces taxable income now)'],
              ['Growth', 'Tax-deferred'],
              ['Withdrawals in retirement', 'Taxed as ordinary income'],
              ['RMDs', 'Required starting at age 73'],
              ['Best for', 'Expect lower tax rate in retirement'],
              ['Income limits', 'None for contributions'],
            ].map(([k, v], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 5 ? `1px solid ${B1}` : 'none', gap: 8 }}>
                <span style={{ fontSize: '0.8125rem', color: T3, fontFamily: UI }}>{k}</span>
                <span style={{ fontSize: '0.8125rem', color: T1, fontFamily: UI, fontWeight: 500, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: RAISE, border: `1px solid ${B2}`, borderRadius: 12, padding: '1.125rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: T1, fontFamily: UI, marginBottom: 12 }}>Interactive Comparison</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Annual Contribution', val: contrib, set: setContrib, step: 500, prefix: '$' },
              { label: 'Years Until Retirement', val: years, set: setYears, step: 1, suffix: 'yrs' },
              { label: 'Annual Growth Rate', val: growth, set: setGrowth, step: 0.5, suffix: '%' },
              { label: 'Current Tax Rate', val: nowRate, set: setNowRate, step: 1, suffix: '%' },
              { label: 'Retirement Tax Rate', val: futRate, set: setFutRate, step: 1, suffix: '%' },
            ].map(({ label, val, set, step, prefix, suffix }) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: T3, marginBottom: 4, fontFamily: UI }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  {prefix && <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: T3, fontSize: '0.875rem' }}>{prefix}</span>}
                  <input type="number" value={val} step={step} onChange={e => set(Number(e.target.value))}
                    style={{ width: '100%', padding: `7px ${suffix ? '1.75rem' : '8px'} 7px ${prefix ? '1.5rem' : '8px'}`, background: BG, border: `1px solid ${B2}`, borderRadius: 7, color: T1, fontSize: '0.875rem', fontFamily: UI, boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = TEAL} onBlur={e => e.target.style.borderColor = B2}
                  />
                  {suffix && <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: T3, fontSize: '0.8125rem' }}>{suffix}</span>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
            <div style={{ background: `${TEAL}12`, border: `1px solid ${TEAL}30`, borderRadius: 10, padding: '0.875rem' }}>
              <div style={{ fontSize: '0.6875rem', color: TEAL, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: UI }}>Roth After-Tax Value</div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: TEAL, fontFamily: UI, marginTop: 4 }}>{fmt(rothFV)}</div>
              <div style={{ fontSize: '0.75rem', color: T3, fontFamily: UI }}>All tax-free in retirement</div>
            </div>
            <div style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}30`, borderRadius: 10, padding: '0.875rem' }}>
              <div style={{ fontSize: '0.6875rem', color: GOLD, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: UI }}>Traditional After-Tax Value</div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: GOLD, fontFamily: UI, marginTop: 4 }}>{fmt(tradAfter)}</div>
              <div style={{ fontSize: '0.75rem', color: T3, fontFamily: UI }}>After {futRate}% retirement tax</div>
            </div>
            <div style={{ background: roths_better ? `${GREEN}12` : `${AMBER}12`, border: `1px solid ${roths_better ? GREEN : AMBER}30`, borderRadius: 10, padding: '0.875rem' }}>
              <div style={{ fontSize: '0.6875rem', color: roths_better ? GREEN : AMBER, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: UI }}>Verdict</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: roths_better ? GREEN : AMBER, fontFamily: UI, marginTop: 4 }}>{roths_better ? 'Roth Wins' : 'Traditional Wins'}</div>
              <div style={{ fontSize: '0.75rem', color: T3, fontFamily: UI }}>By {fmt(Math.abs(rothFV - tradAfter))}</div>
            </div>
          </div>
        </div>

        <InfoBox icon={AlertCircle} color={AMBER}>
          <strong style={{ color: T1 }}>The great uncertainty:</strong> Nobody knows their retirement tax rate. Consider splitting contributions between both account types for tax diversification — the CFP designation calls this "tax bracket management."
        </InfoBox>

        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: T1, fontFamily: UI, marginBottom: 10 }}>When to Prefer Each</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: TEAL, fontFamily: UI, marginBottom: 6 }}>Choose Roth When...</div>
              {['You are early in your career (low income now)', 'You expect to be in a higher bracket in retirement', 'You have 20+ years of tax-free compounding', 'You want no RMDs in retirement', 'You\'re doing a Roth conversion in a low-income year', 'Your employer match goes to traditional (automatic balance)'].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                  <CheckCircle2 size={13} color={TEAL} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI }}>{item}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: GOLD, fontFamily: UI, marginBottom: 6 }}>Choose Traditional When...</div>
              {['You are in a high bracket now (32%+)', 'You expect significantly less income in retirement', 'You need the deduction to qualify for tax credits', 'You want to reduce MAGI (affects Roth IRA eligibility)', 'You are within 10 years of retirement', 'State taxes are high now and you plan to move'].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                  <CheckCircle2 size={13} color={GOLD} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SCard>

      <SCard title="Asset Location Strategy" subtitle="Not all accounts are equal. Place the right investments in the right account type to minimize your lifetime tax burden. This is one of the highest-value CFP planning strategies.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: '1rem' }}>
          {[
            {
              label: 'Taxable Brokerage',
              color: AMBER,
              icon: TrendingUp,
              best: ['Index funds (low turnover)', 'ETFs (tax-efficient structure)', 'Municipal bonds', 'Growth stocks held long-term', 'Tax-managed funds'],
              avoid: ['High-yield bonds', 'REITs', 'Active funds with high turnover', 'Short-term trading'],
              why: 'Subject to capital gains tax on sales and dividends. Use tax-efficient vehicles here to minimize annual tax drag.',
            },
            {
              label: 'Traditional IRA / 401(k)',
              color: GOLD,
              icon: Shield,
              best: ['High-yield bonds', 'REITs (ordinary income)', 'Active funds (shielded from turnover tax)', 'Commodities funds', 'Inflation-protected bonds (TIPS)'],
              avoid: ['Municipal bonds (tax-exempt income wasted here)', 'Growth stocks (convert LTCG to ordinary income)'],
              why: 'Withdrawals taxed as ordinary income. Best for high-income-generating assets that would otherwise be heavily taxed each year.',
            },
            {
              label: 'Roth IRA / Roth 401(k)',
              color: TEAL,
              icon: Zap,
              best: ['Highest-growth potential assets', 'Small-cap / emerging market stocks', 'Alternative investments', 'Speculative growth plays', 'QSBS (Qualified Small Business Stock)'],
              avoid: ['Bonds / stable value (waste of tax-free growth)', 'Cash or money markets'],
              why: 'Every dollar of growth is permanently tax-free. Reserve this account for assets with the greatest upside — they benefit most from tax-free compounding.',
            },
          ].map(({ label, color, icon: Icon, best, avoid, why }) => (
            <div key={label} style={{ background: RAISE, border: `1px solid ${B2}`, borderRadius: 12, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Icon size={14} color={color} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color, fontFamily: UI }}>{label}</span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: GREEN, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: UI, marginBottom: 5 }}>Place Here</div>
              {best.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                  <span style={{ color: GREEN, fontSize: '0.75rem', flexShrink: 0 }}>+</span>
                  <span style={{ fontSize: '0.75rem', color: T2, fontFamily: UI }}>{item}</span>
                </div>
              ))}
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: RED, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: UI, margin: '8px 0 5px' }}>Avoid Here</div>
              {avoid.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                  <span style={{ color: RED, fontSize: '0.75rem', flexShrink: 0 }}>–</span>
                  <span style={{ fontSize: '0.75rem', color: T2, fontFamily: UI }}>{item}</span>
                </div>
              ))}
              <p style={{ fontSize: '0.75rem', color: T3, fontFamily: UI, marginTop: 8, marginBottom: 0, lineHeight: 1.6, borderTop: `1px solid ${B1}`, paddingTop: 8 }}>{why}</p>
            </div>
          ))}
        </div>
        <InfoBox color={GREEN} icon={CheckCircle2}>
          Research by Vanguard and Morningstar estimates strategic asset location adds <strong style={{ color: T1 }}>0.10%–0.45% per year</strong> in after-tax alpha — equivalent to reducing your expense ratio significantly, with no investment risk.
        </InfoBox>
      </SCard>

      <SCard title="HSA — The Triple Tax-Advantage Account" subtitle="The only account in the tax code that is tax-deductible going in, grows tax-free, and is tax-free on qualified withdrawals.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: '1rem' }}>
          <StatCard label="Self-Only Contribution 2026" value="$4,400" sub="HDHP min deductible: $1,700" color={GREEN} />
          <StatCard label="Family Contribution 2026" value="$8,750" sub="HDHP min deductible: $3,400" color={GREEN} />
          <StatCard label="Catch-Up (Age 55+)" value="+$1,000" sub="Max OOP: $8,500 (S) / $17,000 (F)" color={GREEN} />
          <StatCard label="Effective Tax Savings" value="~30%+" sub="Federal + FICA combined" color={GREEN} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: GREEN, fontFamily: UI, marginBottom: 6 }}>The Triple Advantage</div>
            {['Contributions are tax-deductible (or pre-tax via payroll)', 'Invested funds grow completely tax-free', 'Withdrawals for qualified medical expenses are tax-free', 'At age 65, functions like a Traditional IRA for any use', 'No "use it or lose it" — balances roll over indefinitely'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                <CheckCircle2 size={13} color={GREEN} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI }}>{item}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: AMBER, fontFamily: UI, marginBottom: 6 }}>HSA Power Strategy</div>
            <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, marginBottom: 8 }}>
              CFPs call this "supercharging the HSA." Pay all medical expenses out-of-pocket now. Keep every receipt. Invest the HSA in low-cost index funds. Decades later, reimburse yourself for all accumulated medical expenses — tax-free — while the growth compounds untouched.
            </p>
            <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, margin: 0 }}>
              This converts the HSA into a tax-free supplement to retirement income. There is no time limit on reimbursements for qualified expenses.
            </p>
          </div>
        </div>
      </SCard>
    </div>
  );
}

/* ── Tab: Equity Compensation ─────────────────────────────────── */
function TabEquity() {
  const [tab, setTab] = useState('rsu');

  const tabs = [
    { key: 'rsu',  label: 'RSUs' },
    { key: 'espp', label: 'ESPP' },
    { key: 'iso',  label: 'Stock Options (ISO/NSO)' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${tab === t.key ? TEAL : B2}`, background: tab === t.key ? `${TEAL}15` : RAISE, color: tab === t.key ? TEAL : T2, fontFamily: UI, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'rsu' && (
        <div>
          <SCard title="Restricted Stock Units (RSUs)" subtitle="The most common form of equity compensation at public tech and finance companies. Understanding the tax mechanics prevents costly surprises.">
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: T1, fontFamily: UI, marginBottom: 12 }}>How RSUs Work — Timeline</div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 20, top: 24, bottom: 24, width: 2, background: B2 }} />
                {[
                  { label: 'Grant Date', desc: 'Company awards you X shares. No tax event. No value yet — just a promise.', color: T3, dot: T3 },
                  { label: 'Vesting Date', desc: 'Shares vest (become yours). The FMV per share on this day is ordinary income. Your employer withholds taxes — often at the 22% supplemental rate, which may be UNDER your actual bracket.', color: RED, dot: RED, highlight: true },
                  { label: 'Holding Period Begins', desc: 'Your cost basis is the FMV at vesting. The clock starts for long-term vs. short-term capital gains.', color: AMBER, dot: AMBER },
                  { label: 'Sale — Short-Term (<12 months)', desc: 'Gain above FMV at vesting is taxed as ordinary income (up to 37%). Often a poor time to sell.', color: RED, dot: RED },
                  { label: 'Sale — Long-Term (>12 months)', desc: 'Gain above FMV at vesting taxed at preferential LTCG rates (0%, 15%, or 20%). Much better outcome.', color: GREEN, dot: GREEN },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, position: 'relative' }}>
                    <div style={{ width: 40, display: 'flex', justifyContent: 'center', flexShrink: 0, paddingTop: 2 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: step.dot, border: `2px solid ${BG}`, zIndex: 1 }} />
                    </div>
                    <div style={{ background: step.highlight ? `${RED}10` : RAISE, border: `1px solid ${step.highlight ? RED + '30' : B2}`, borderRadius: 10, padding: '0.75rem 1rem', flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: step.color, fontFamily: UI, marginBottom: 4 }}>{step.label}</div>
                      <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, margin: 0, lineHeight: 1.65 }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: `${RED}10`, border: `1px solid ${RED}25`, borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: RED, fontFamily: UI, marginBottom: 8 }}>The Withholding Gap — A Common Tax Trap</div>
              <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, margin: 0 }}>
                Most employers withhold at the <strong style={{ color: T1 }}>22% supplemental rate</strong> on RSU income. If you are in the 32%, 35%, or 37% bracket, you will owe a large balance at tax time. High earners often owe $20,000–$100,000+ in additional tax from RSU income. Increase estimated quarterly payments or request additional withholding.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: TEAL, fontFamily: UI, marginBottom: 8 }}>RSU Planning Strategies</div>
                {[
                  'Track your basis carefully — it is FMV at each vest date, not grant date',
                  'Hold qualifying shares 12+ months for LTCG treatment on appreciation',
                  'Sell shares in a tax-loss-harvesting year to offset gains',
                  'Donate appreciated shares to charity — avoid capital gains entirely',
                  'Consider a 10b5-1 plan to systematically sell on a schedule (avoids timing concerns)',
                  'Request sell-to-cover withholding method vs. cash settlement to avoid surprise bills',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <CheckCircle2 size={13} color={TEAL} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI }}>{item}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: AMBER, fontFamily: UI, marginBottom: 8 }}>Common RSU Mistakes</div>
                {[
                  'Forgetting that vesting income is reported on W-2 (already in Box 1)',
                  'Double-paying tax by reporting FMV again as a capital gain',
                  'Selling immediately and missing LTCG treatment by days',
                  'Holding concentrated single-stock position too long (company-specific risk)',
                  'Ignoring state tax — many states tax RSU income on grant, not vesting',
                  'Missing estimated tax payments, leading to underpayment penalties',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <AlertCircle size={13} color={AMBER} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </SCard>

          <SCard title="Worked Example" subtitle="Understanding RSU tax math with real numbers.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {[
                {
                  title: 'At Vesting',
                  color: RED,
                  items: [
                    ['Shares vested', '500'],
                    ['FMV at vesting', '$80/share'],
                    ['Ordinary income recognized', '$40,000'],
                    ['Employer withholds (22%)', '$8,800'],
                    ['If you are in 35% bracket', 'You owe $14,000 – $8,800 = $5,200 more'],
                    ['Your cost basis', '$80/share'],
                  ],
                },
                {
                  title: 'Sale After 13 Months (Long-Term)',
                  color: GREEN,
                  items: [
                    ['Sale price', '$110/share'],
                    ['Capital gain per share', '$30 ($110 – $80 basis)'],
                    ['Total LTCG', '$15,000'],
                    ['Tax (at 15% LTCG rate)', '$2,250'],
                    ['vs. ordinary income tax (35%)', '$5,250 — you saved $3,000'],
                    ['Total tax on RSU', '$14,000 + $2,250 = $16,250'],
                  ],
                },
              ].map(({ title, color, items }) => (
                <div key={title} style={{ background: RAISE, border: `1px solid ${B2}`, borderRadius: 10, padding: '1rem' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color, fontFamily: UI, marginBottom: 10 }}>{title}</div>
                  {items.map(([k, v], i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < items.length - 1 ? `1px solid ${B1}` : 'none', gap: 8 }}>
                      <span style={{ fontSize: '0.8125rem', color: T3, fontFamily: UI }}>{k}</span>
                      <span style={{ fontSize: '0.8125rem', color: T1, fontWeight: 600, fontFamily: UI }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </SCard>
        </div>
      )}

      {tab === 'espp' && (
        <div>
          <SCard title="Employee Stock Purchase Plans (ESPP)" subtitle="One of the best risk-adjusted benefits in compensation — typically a 15% guaranteed discount with potential LTCG treatment if held correctly.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: '1.25rem' }}>
              <div style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}25`, borderRadius: 12, padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: GREEN, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: UI, marginBottom: 8 }}>How an ESPP Works</div>
                {[
                  'Offering period: 6–24 months (typically 6 or 12)',
                  'You contribute up to 15% of salary via payroll deductions',
                  'At purchase date, company buys shares at a 5%–15% discount',
                  'Many plans use "lookback" — you get the lower of start or end price, then apply discount',
                  'Annual cap: $25,000 of stock value per year (IRS rule)',
                  'Qualified plans (Section 423) get preferential tax treatment if holding period met',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                    <CheckCircle2 size={12} color={GREEN} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: RAISE, border: `1px solid ${B2}`, borderRadius: 12, padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: TEAL, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: UI, marginBottom: 8 }}>Qualifying vs. Disqualifying Disposition</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', fontFamily: UI }}>
                  <thead>
                    <tr>
                      {['', 'Qualifying', 'Disqualifying'].map(h => (
                        <th key={h} style={{ padding: '4px 6px', textAlign: 'left', color: T3, fontWeight: 600, fontSize: '0.75rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Hold period', '2 yrs from grant + 1 yr from purchase', 'Shorter than above'],
                      ['Discount taxation', 'Ordinary income (on lesser of actual gain or max discount)', 'Ordinary income at purchase'],
                      ['Gain above FMV', 'LTCG', 'Capital gain (STCG or LTCG)'],
                      ['Best outcome', 'Lower ordinary income + LTCG on appreciation', 'More ordinary income'],
                    ].map(([k, q, d], i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${B1}` }}>
                        <td style={{ padding: '5px 6px', color: T3 }}>{k}</td>
                        <td style={{ padding: '5px 6px', color: GREEN }}>{q}</td>
                        <td style={{ padding: '5px 6px', color: AMBER }}>{d}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: RAISE, border: `1px solid ${B2}`, borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: T1, fontFamily: UI, marginBottom: 10 }}>Worked Example with 15% Discount + Lookback</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                {[
                  { label: 'Grant date price', value: '$100', note: '' },
                  { label: 'Purchase date price', value: '$130', note: '' },
                  { label: 'Lookback price used', value: '$100', note: 'Lower of the two' },
                  { label: 'Your purchase price (–15%)', value: '$85', note: 'Immediate 35% ROI vs market' },
                  { label: 'FMV at purchase', value: '$130', note: 'Market price that day' },
                  { label: 'Bargain element (ordinary income)', value: '$45/share', note: 'On disqualifying; capped on qualifying' },
                ].map(({ label, value, note }, i) => (
                  <div key={i} style={{ background: BG, borderRadius: 8, padding: '0.625rem 0.875rem' }}>
                    <div style={{ fontSize: '0.75rem', color: T3, fontFamily: UI }}>{label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: TEAL, fontFamily: UI }}>{value}</div>
                    {note && <div style={{ fontSize: '0.6875rem', color: T3, fontFamily: UI }}>{note}</div>}
                  </div>
                ))}
              </div>
            </div>

            <InfoBox color={GREEN} icon={CheckCircle2}>
              <strong style={{ color: T1 }}>The ESPP default strategy:</strong> Maximize contributions, then immediately sell at purchase. Even without holding, you lock in the guaranteed discount (often 15–35% effective return in days). For qualifying disposition treatment, hold 2 years from grant date and 1 year from purchase date.
            </InfoBox>
          </SCard>
        </div>
      )}

      {tab === 'iso' && (
        <div>
          <SCard title="Stock Options: ISO vs. NSO" subtitle="Two types of options, dramatically different tax treatment. ISOs are the better vehicle if structured and exercised correctly.">
            <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: UI, fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: RAISE }}>
                    {['Feature', 'ISO (Incentive Stock Option)', 'NSO (Non-Qualified Stock Option)'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: T3, fontWeight: 600, fontSize: '0.75rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Who can receive', 'Employees only', 'Anyone (employees, contractors, board)'],
                    ['Tax at exercise', 'No regular tax (AMT preference item)', 'Ordinary income on spread'],
                    ['Tax at sale (qualified)', 'LTCG on all gain above exercise price', 'LTCG on gain above FMV at exercise'],
                    ['Qualifying hold', '2 yrs from grant + 1 yr from exercise', 'Just 1 yr for LTCG on post-exercise gain'],
                    ['AMT risk', 'Yes — spread at exercise is AMT preference', 'No AMT issue (already taxed as ordinary)'],
                    ['$100K annual limit', 'Yes — only $100K can vest per year', 'No limit'],
                    ['W-2 reporting at exercise', 'No (unless disqualifying disposition)', 'Yes — employer reports spread as wages'],
                    ['Employer deduction', 'No (if qualifying)', 'Yes — deducts the ordinary income element'],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${B1}`, background: i % 2 === 0 ? 'transparent' : `${RAISE}88` }}>
                      <td style={{ padding: '8px 12px', color: T2, fontWeight: 600 }}>{row[0]}</td>
                      <td style={{ padding: '8px 12px', color: T1 }}>{row[1]}</td>
                      <td style={{ padding: '8px 12px', color: T2 }}>{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: `${AMBER}10`, border: `1px solid ${AMBER}30`, borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: AMBER, fontFamily: UI, marginBottom: 8 }}>The ISO / AMT Problem</div>
              <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, margin: '0 0 8px' }}>
                When you exercise an ISO, the spread (FMV – exercise price) is a <strong style={{ color: T1 }}>tax preference item</strong> for AMT purposes. If you exercise a large block of ISOs in one year, you may owe AMT even though you received no cash and haven't sold any shares.
              </p>
              <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, margin: 0 }}>
                The AMT exemption for 2026 is $88,100 (single) / $137,000 (MFJ), phasing out above $626,350 / $1,252,700. Spreads above the exemption are taxed at 26%–28%. Work with a CPA before exercising large ISO grants.
              </p>
            </div>

            <Accordion title="Section 83(b) Election — The Early Exercise Strategy" defaultOpen>
              <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, marginBottom: 8 }}>
                If your company allows early exercise of unvested options, you can file a <strong style={{ color: T1 }}>Section 83(b) election</strong> within 30 days of exercise. This pays ordinary income tax on the spread at exercise (often $0 if exercised at grant), starts your LTCG holding period immediately, and converts all future appreciation to LTCG.
              </p>
              <InfoBox color={RED} icon={AlertCircle}>
                The 30-day window is absolute. Missing it means ordinary income tax on the full spread at each vesting date — potentially millions in a startup that grows. This election is most powerful at early-stage companies when the FMV is near zero.
              </InfoBox>
            </Accordion>

            <Accordion title="Phantom Stock & SARs (Stock Appreciation Rights)">
              <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, marginBottom: 8 }}>
                Phantom stock and SARs are used by private or S-corp companies that can't issue equity directly. The employee receives a cash payment equal to the appreciation in stock value — no actual shares change hands.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: TEAL, fontFamily: UI, marginBottom: 6 }}>Tax Treatment</div>
                  <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, margin: 0 }}>All payments are ordinary income when received. No capital gains treatment possible. Subject to FICA taxes. Often simpler to administer than equity but less tax-efficient for the employee.</p>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: AMBER, fontFamily: UI, marginBottom: 6 }}>Planning Considerations</div>
                  <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, margin: 0 }}>Watch for 409A deferred compensation rules — phantom stock must be carefully structured to avoid triggering immediate taxation plus 20% penalty on all deferred amounts.</p>
                </div>
              </div>
            </Accordion>

            <Accordion title="QSBS — Qualified Small Business Stock (Section 1202)">
              <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, marginBottom: 8 }}>
                Section 1202 allows up to <strong style={{ color: T1 }}>$10 million (or 10x basis) in capital gains to be excluded from federal tax</strong> on qualifying small business stock held for more than 5 years. This is one of the most powerful tax benefits in the code for startup founders and early employees.
              </p>
              {['Company must be a C-corp at time of issuance', 'Gross assets cannot exceed $50M at time of issuance', 'Must be an active trade or business (not services, finance, or hospitality)', 'Shares must be acquired at original issue (not secondary market)', 'Hold for more than 5 years', 'Federal exclusion is 100% if acquired after 9/27/2010'].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                  <CheckCircle2 size={12} color={GREEN} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI }}>{item}</span>
                </div>
              ))}
            </Accordion>
          </SCard>
        </div>
      )}
    </div>
  );
}

/* ── Tab: Advanced Strategies ─────────────────────────────────── */
function TabAdvanced() {
  return (
    <div>
      <SCard title="Tax-Loss Harvesting" subtitle="Deliberately realizing investment losses to offset capital gains — one of the few legal ways to time the tax code in your favor.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: TEAL, fontFamily: UI, marginBottom: 8 }}>How It Works</div>
            {[
              'Sell a position that is down from your purchase price',
              'Realized loss offsets capital gains dollar-for-dollar',
              'Up to $3,000 of net losses can offset ordinary income per year',
              'Unused losses carry forward indefinitely',
              'Immediately reinvest in a similar (not identical) asset to maintain market exposure',
              'Net effect: you defer or eliminate taxes without leaving the market',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                <ArrowRight size={12} color={TEAL} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ background: `${RED}10`, border: `1px solid ${RED}25`, borderRadius: 10, padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: RED, fontFamily: UI, marginBottom: 8 }}>The Wash Sale Rule</div>
            <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, margin: '0 0 8px' }}>
              You cannot claim a loss if you buy a <strong style={{ color: T1 }}>substantially identical</strong> security within <strong style={{ color: T1 }}>30 days before or after</strong> the sale (61-day window total). The disallowed loss is added to the basis of the new shares.
            </p>
            <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, margin: 0 }}>
              Workaround: sell VTSAX and immediately buy VTI (or vice versa) — different funds tracking the same index are generally not "substantially identical." ETFs in the same asset class (e.g., SCHB, IVV) work similarly.
            </p>
          </div>
        </div>
        <InfoBox color={AMBER} icon={AlertCircle}>
          The wash sale rule applies across all accounts you or your spouse controls — including IRAs. Selling a stock at a loss in a taxable account and repurchasing it in an IRA within the window disallows the loss permanently.
        </InfoBox>
      </SCard>

      <SCard title="Backdoor Roth IRA" subtitle="For high earners who exceed the Roth IRA income limits. A fully legal two-step conversion strategy.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: '1rem' }}>
          {[
            { step: '1', label: 'Contribute to Traditional IRA', desc: 'Make a non-deductible contribution (up to $7,000). File Form 8606 to document the basis.', color: TEAL },
            { step: '2', label: 'Do Not Invest Yet', desc: 'Leave as cash to avoid gains before conversion, which could complicate the math.', color: TEAL },
            { step: '3', label: 'Convert to Roth IRA', desc: 'Convert the Traditional IRA to Roth. Since no deduction was taken, only the growth (if any) is taxable.', color: GREEN },
            { step: '4', label: 'Pay Tax on Gains Only', desc: 'If done quickly, almost no tax is owed. All future growth is permanently tax-free.', color: GREEN },
          ].map(({ step, label, desc, color }) => (
            <div key={step} style={{ background: RAISE, border: `1px solid ${B2}`, borderRadius: 10, padding: '0.875rem 1rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${color}20`, border: `1px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color, fontFamily: UI }}>{step}</span>
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: T1, fontFamily: UI, marginBottom: 5 }}>{label}</div>
              <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
        <InfoBox color={RED} icon={AlertCircle}>
          <strong style={{ color: T1 }}>The Pro-Rata Rule:</strong> If you have other Traditional IRA balances (pre-tax), the IRS treats ALL your IRAs as one pool. The non-deductible portion becomes a small fraction, making most of the conversion taxable. Solution: roll existing pre-tax IRAs into your employer 401(k) before doing the backdoor Roth.
        </InfoBox>
      </SCard>

      <SCard title="Net Investment Income Tax (NIIT)" subtitle="A 3.8% surcharge on investment income for higher earners — effectively raising your capital gains rate above the stated bracket.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: RED, fontFamily: UI, marginBottom: 8 }}>What Triggers NIIT</div>
            {['Interest income', 'Dividends (qualified and non-qualified)', 'Capital gains (short and long-term)', 'Rental income (net)', 'Royalties', 'Passive activity income', 'Net gain from disposition of property'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                <span style={{ color: RED, fontSize: '0.875rem', flexShrink: 0 }}>•</span>
                <span style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI }}>{item}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: GREEN, fontFamily: UI, marginBottom: 8 }}>Excluded from NIIT</div>
            {['Wages and self-employment income', 'Social Security benefits', 'Tax-exempt interest (municipal bonds)', 'Retirement plan distributions (IRA, 401k, pension)', 'Distributions from Roth IRAs', 'Active trade or business income', 'Gain on sale of active business interest'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                <CheckCircle2 size={12} color={GREEN} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: RAISE, border: `1px solid ${B2}`, borderRadius: 10, padding: '1rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: T1, fontFamily: UI, marginBottom: 4 }}>Effective LTCG Rate at the Top</div>
          <div style={{ fontSize: '0.75rem', color: T3, fontFamily: UI, marginBottom: 10 }}>NIIT thresholds: $250,000 MFJ / $200,000 Single/HoH / $125,000 MFS. Estates & Trusts: AGI over $16,000.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'LTCG Rate', value: '20.0%', color: AMBER },
              { label: 'NIIT', value: '+ 3.8%', color: RED },
              { label: 'State (CA example)', value: '+ 13.3%', color: RED },
              { label: 'Total (top CA earner)', value: '= 37.1%', color: RED },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: BG, border: `1px solid ${B1}`, borderRadius: 8, padding: '0.625rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: T3, fontFamily: UI }}>{label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color, fontFamily: UI }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </SCard>

      <SCard title="Roth Conversion Ladder" subtitle="A systematic strategy to move pre-tax retirement money into Roth over multiple years — optimizing lifetime tax payments.">
        <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, marginBottom: '1rem' }}>
          The idea is to convert just enough Traditional IRA/401(k) money to Roth each year to "fill up" lower tax brackets — without pushing into a higher one. This is most powerful in low-income years: early retirement before Social Security, years with large deductions, or years between jobs.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: '1rem' }}>
          {[
            { label: 'Best window', value: 'Age 59½–72 (before RMDs force income)', color: TEAL },
            { label: 'Target', value: 'Fill up 12% or 22% bracket each year', color: TEAL },
            { label: 'Benefit', value: 'Reduce future RMDs and their tax drag', color: GREEN },
            { label: 'Roth 5-year rule', value: 'Each conversion has its own 5-year clock for penalty-free withdrawal of converted amounts', color: AMBER },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: RAISE, border: `1px solid ${B2}`, borderRadius: 10, padding: '0.875rem 1rem' }}>
              <div style={{ fontSize: '0.75rem', color: T3, fontFamily: UI, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color, fontFamily: UI }}>{value}</div>
            </div>
          ))}
        </div>
        <InfoBox icon={BookOpen} color={TEAL}>
          The Roth conversion ladder is central to FIRE (Financial Independence, Retire Early) tax planning. By converting during low-income years pre-59½ and waiting 5 years per conversion, some retirees access retirement funds years before traditional retirement age with minimal tax liability.
        </InfoBox>
      </SCard>

      <SCard title="Qualified Opportunity Zones (QOZ)" subtitle="A tax incentive created by the Tax Cuts and Jobs Act to attract investment into economically distressed communities.">
        <p style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI, lineHeight: 1.65, marginBottom: '1rem' }}>
          Invest capital gains into a Qualified Opportunity Fund within 180 days of the gain event. Benefits are time-sensitive and tiered:
        </p>
        {[
          { hold: '< 5 years', benefit: 'Defer original gain until 2026 (now expired for most new investments)', color: T3 },
          { hold: '5–9 years', benefit: 'Defer gain until sale; no step-up for most new investments', color: AMBER },
          { hold: '10+ years', benefit: 'Eliminate all capital gains on the QOZ investment itself (gains above original deferred amount are tax-free)', color: GREEN },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < 2 ? `1px solid ${B1}` : 'none' }}>
            <span style={{ minWidth: 80, fontSize: '0.8125rem', fontWeight: 700, color: row.color, fontFamily: UI }}>{row.hold}</span>
            <span style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI }}>{row.benefit}</span>
          </div>
        ))}
      </SCard>

      <SCard title="Charitable Giving Strategies" subtitle="Giving smart is as important as giving generously — the right vehicle can double your impact.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            {
              label: 'Donate Appreciated Stock',
              color: TEAL,
              points: ['Deduct full FMV (not your basis)', 'Zero capital gains tax on the appreciation', 'Best for highly appreciated, concentrated positions', 'Must hold stock 12+ months for LTCG treatment'],
            },
            {
              label: 'Donor-Advised Fund (DAF)',
              color: GREEN,
              points: ['Contribute assets now, grant to charity later', 'Immediate full deduction in year of contribution', 'Invest assets inside the DAF tax-free', 'Great for "bunching" — multiple years of giving in one'],
            },
            {
              label: 'Qualified Charitable Distribution (QCD)',
              color: GOLD,
              points: ['Age 70½+ can direct up to $105,000/year from IRA directly to charity', 'Counts toward RMD but not included in income', 'Reduces MAGI — can lower Medicare premiums (IRMAA)', 'Cannot also claim deduction — the exclusion IS the tax benefit'],
            },
            {
              label: 'Charitable Remainder Trust (CRT)',
              color: AMBER,
              points: ['Donate appreciated asset to trust', 'Trust sells without capital gains tax', 'Receive income stream for life or term', 'Remainder passes to charity at end'],
            },
          ].map(({ label, color, points }) => (
            <div key={label} style={{ background: RAISE, border: `1px solid ${B2}`, borderRadius: 10, padding: '1rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color, fontFamily: UI, marginBottom: 8 }}>{label}</div>
              {points.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 5 }}>
                  <CheckCircle2 size={12} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI }}>{p}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </SCard>

      <SCard title="Key Tax Deadlines & Planning Calendar" subtitle="Tax optimization is a year-round activity. These are the critical dates a CFP tracks.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
          {[
            { month: 'Jan 15', event: 'Q4 estimated tax payment due' },
            { month: 'Jan 31', event: 'W-2s and 1099s issued by employers / brokerages' },
            { month: 'Apr 15', event: 'Tax filing deadline + Q1 estimated tax payment' },
            { month: 'Apr 15', event: 'IRA / HSA contribution deadline for prior year' },
            { month: 'Jun 15', event: 'Q2 estimated tax payment due' },
            { month: 'Sep 15', event: 'Q3 estimated tax payment due' },
            { month: 'Oct 15', event: 'Extended return deadline' },
            { month: 'Oct 31', event: 'SECURE 2.0 super catch-up election considerations' },
            { month: 'Nov–Dec', event: 'Tax-loss harvesting window (before year end)' },
            { month: 'Dec 31', event: 'RMD deadline; Roth conversion deadline; gifting deadline' },
            { month: 'Dec 31', event: '401(k) / 403(b) employee contribution deadline' },
            { month: 'Dec 31', event: 'QCD must be completed; FSA use-it-or-lose-it deadline' },
          ].map(({ month, event }, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 10px', background: RAISE, borderRadius: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: TEAL, fontFamily: UI, minWidth: 48, flexShrink: 0 }}>{month}</span>
              <span style={{ fontSize: '0.8125rem', color: T2, fontFamily: UI }}>{event}</span>
            </div>
          ))}
        </div>
      </SCard>

      <InfoBox color={AMBER} icon={AlertCircle}>
        <strong style={{ color: T1 }}>For educational purposes only.</strong> Tax laws change frequently and individual situations vary significantly. Always consult a CPA, CFP, or tax attorney for personalized advice before making tax-related financial decisions.
      </InfoBox>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ROTH CONVERSION ANALYZER
══════════════════════════════════════════════════════════════════ */
const MONO = "'JetBrains Mono','Courier New',monospace";

function RothConversionTab() {
  const [balance,       setBalance]       = useState(250000);
  const [currentAge,    setCurrentAge]    = useState(45);
  const [retireAge,     setRetireAge]     = useState(65);
  const [currentIncome, setCurrentIncome] = useState(95000);
  const [convertAmount, setConvertAmount] = useState(20000);
  const [retireIncome,  setRetireIncome]  = useState(60000);
  const [filing,        setFiling]        = useState('single');

  const stdDed = STD_DED[filing];
  const conversionTaxCost =
    calcTax(Math.max(0, currentIncome + convertAmount - stdDed), filing) -
    calcTax(Math.max(0, currentIncome - stdDed), filing);
  const yearsToRetire = Math.max(1, retireAge - currentAge);
  const growthRate    = 0.07;
  const rothGrowth    = convertAmount * Math.pow(1 + growthRate, yearsToRetire);
  const retireTaxOnTrad =
    calcTax(Math.max(0, retireIncome + convertAmount - stdDed), filing) -
    calcTax(Math.max(0, retireIncome - stdDed), filing);
  const netBenefit    = retireTaxOnTrad - conversionTaxCost;

  const projData = Array.from({ length: Math.min(yearsToRetire + 1, 31) }, (_, i) => ({
    year: currentAge + i,
    trad: Math.round(convertAmount * Math.pow(1 + growthRate, i)),
    roth: Math.round((convertAmount - conversionTaxCost) * Math.pow(1 + growthRate, i)),
  }));

  const fmtV = n => '$' + Math.round(n).toLocaleString();

  const FilingBtn = ({ v, l }) => (
    <button onClick={() => setFiling(v)} style={{
      padding: '4px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: UI,
      border: `1px solid ${filing === v ? TEAL : B2}`,
      background: filing === v ? `${TEAL}18` : RAISE,
      color: filing === v ? TEAL : T3,
    }}>{l}</button>
  );

  const FSlider = ({ label, val, set, min = 0, max, step = 1000, fmtFn = fmtV }) => (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.8125rem', color: T3, fontFamily: UI }}>{label}</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: GOLD, fontFamily: MONO }}>{fmtFn(val)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => set(Number(e.target.value))}
        style={{ width: '100%', accentColor: TEAL, cursor: 'pointer' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <p style={{ fontFamily: UI, fontSize: '0.875rem', color: T3, margin: 0, lineHeight: 1.65 }}>
        Should you convert traditional IRA/401(k) funds to Roth now? This tool calculates whether paying taxes today saves more than deferring to retirement — based on your actual 2026 tax brackets.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Controls */}
        <SCard title="">
          <div style={{ fontFamily: UI, fontSize: '0.75rem', fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>Inputs</div>
          <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[['single','Single'],['mfj','MFJ'],['hoh','HOH'],['mfs','MFS']].map(([v,l]) => <FilingBtn key={v} v={v} l={l} />)}
          </div>
          <FSlider label="Traditional IRA / 401(k) Balance" val={balance} set={setBalance} max={2000000} step={5000} />
          <FSlider label="Conversion Amount This Year" val={convertAmount} set={setConvertAmount} max={200000} />
          <FSlider label="Current Annual Income" val={currentIncome} set={setCurrentIncome} max={400000} step={2000} />
          <FSlider label="Expected Retirement Income" val={retireIncome} set={setRetireIncome} max={300000} step={2000} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FSlider label={`Current Age: ${currentAge}`} val={currentAge} set={setCurrentAge} min={22} max={72} step={1} fmtFn={v => v+' yrs'} />
            <FSlider label={`Retire Age: ${retireAge}`} val={retireAge} set={setRetireAge} min={50} max={80} step={1} fmtFn={v => v+' yrs'} />
          </div>
        </SCard>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ padding: '1rem 1.125rem', background: `${RED}0c`, border: `1px solid ${RED}28`, borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, fontSize: '1.375rem', fontWeight: 800, color: RED, lineHeight: 1 }}>{fmtV(conversionTaxCost)}</div>
              <div style={{ fontFamily: UI, fontSize: '0.75rem', color: T3, marginTop: 5 }}>Tax Cost Now</div>
            </div>
            <div style={{ padding: '1rem 1.125rem', background: `${GREEN}0c`, border: `1px solid ${GREEN}28`, borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, fontSize: '1.375rem', fontWeight: 800, color: GREEN, lineHeight: 1 }}>{fmtV(retireTaxOnTrad)}</div>
              <div style={{ fontFamily: UI, fontSize: '0.75rem', color: T3, marginTop: 5 }}>Tax Saved in Retirement</div>
            </div>
          </div>

          {/* Verdict */}
          <div style={{
            padding: '1rem 1.125rem',
            background: netBenefit > 0 ? `${GREEN}0c` : `${RED}0c`,
            border: `1px solid ${netBenefit > 0 ? GREEN : RED}28`,
            borderRadius: 12,
          }}>
            <div style={{ fontFamily: UI, fontSize: '0.875rem', fontWeight: 700, color: netBenefit > 0 ? GREEN : RED, marginBottom: 6 }}>
              {netBenefit > 0 ? '✓ Conversion Recommended' : '✗ Conversion May Not Be Optimal'}
            </div>
            <div style={{ fontFamily: UI, fontSize: '0.8125rem', color: T2, lineHeight: 1.6 }}>
              {netBenefit > 0
                ? `Converting saves ${fmtV(netBenefit)} in lifetime taxes. Your current tax rate is lower than it will be in retirement.`
                : `You're in a higher bracket now than in retirement. Delaying conversion keeps more money working tax-deferred.`}
            </div>
          </div>

          {/* Growth projection chart */}
          <SCard title="Converted Amount — Growth Projection" subtitle="After-Tax Roth vs. paying taxes later in retirement">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={projData}>
                <CartesianGrid strokeDasharray="3 3" stroke={B2} />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: T3, fontFamily: MONO }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: T3 }} axisLine={false} tickLine={false} tickFormatter={v => '$'+(v/1000).toFixed(0)+'k'} />
                <RechartsTip
                  contentStyle={{ background: RAISE, border: `1px solid ${B2}`, borderRadius: 8, fontSize: 11, fontFamily: UI }}
                  formatter={v => [fmtV(v)]}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', fontFamily: UI }} />
                <Line type="monotone" dataKey="trad" name="If Taxed Later" stroke={RED} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="roth" name="After-Tax Roth Growth" stroke={GREEN} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </SCard>

          <InfoBox color={TEAL}>
            <strong style={{ color: T1 }}>Rule of thumb:</strong> Convert when your current marginal rate is lower than your expected retirement rate. Common candidates: low-income years, early retirement before RMDs, years with large deductions. Never convert into a higher bracket than you expect in retirement.
          </InfoBox>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   RMD CALCULATOR
══════════════════════════════════════════════════════════════════ */
const RMD_TABLE = {72:27.4,73:26.5,74:25.5,75:24.6,76:23.7,77:22.9,78:22.0,79:21.1,80:20.2,81:19.4,82:18.5,83:17.7,84:16.8,85:16.0,86:15.2,87:14.4,88:13.7,89:12.9,90:12.2,91:11.5,92:10.8,93:10.1,94:9.5,95:8.9,96:8.4,97:7.8,98:7.3,99:6.8,100:6.4};

function RMDCalculatorTab() {
  const [balance,     setBalance]     = useState(850000);
  const [age,         setAge]         = useState(74);
  const [otherIncome, setOtherIncome] = useState(45000);
  const [filing,      setFiling]      = useState('single');

  const divisor   = RMD_TABLE[Math.min(Math.max(age, 72), 100)] || 6.4;
  const rmdAmount = balance / divisor;
  const taxOnRMD  =
    calcTax(Math.max(0, otherIncome + rmdAmount - STD_DED[filing]), filing) -
    calcTax(Math.max(0, otherIncome - STD_DED[filing]), filing);
  const penalty = rmdAmount * 0.25;

  const futureRMDs = Array.from({ length: 10 }, (_, i) => {
    const a       = age + i;
    const div     = RMD_TABLE[Math.min(a, 100)] || 6.4;
    const projBal = Math.max(0, balance * Math.pow(1.05, i) - (balance / divisor) * i);
    const rmd     = projBal / div;
    return { age: a, balance: Math.round(projBal), rmd: Math.round(rmd), divisor: div };
  });

  const fmtV = n => '$' + Math.round(n).toLocaleString();

  const RSlider = ({ label, val, set, min = 0, max, step = 10000 }) => (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.8125rem', color: T3, fontFamily: UI }}>{label}</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: GOLD, fontFamily: MONO }}>{fmtV(val)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => set(Number(e.target.value))}
        style={{ width: '100%', accentColor: TEAL, cursor: 'pointer' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <p style={{ fontFamily: UI, fontSize: '0.875rem', color: T3, margin: 0, lineHeight: 1.65 }}>
        Required Minimum Distributions begin at age 73 under the SECURE 2.0 Act. Missing your RMD triggers a <strong style={{ color: RED }}>25% penalty</strong> on the amount not withdrawn. Use this calculator to plan your distributions and minimize tax impact.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Controls */}
        <SCard title="">
          <div style={{ fontFamily: UI, fontSize: '0.75rem', fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>Inputs</div>

          <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[['single','Single'],['mfj','MFJ'],['hoh','HOH'],['mfs','MFS']].map(([v,l]) => (
              <button key={v} onClick={() => setFiling(v)} style={{
                padding: '4px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: UI,
                border: `1px solid ${filing === v ? TEAL : B2}`,
                background: filing === v ? `${TEAL}18` : RAISE,
                color: filing === v ? TEAL : T3,
              }}>{l}</button>
            ))}
          </div>

          <RSlider label="IRA / 401(k) Balance (Dec 31 prior year)" val={balance} set={setBalance} max={5000000} step={10000} />
          <RSlider label="Other Annual Income (SS, pension, etc.)" val={otherIncome} set={setOtherIncome} max={200000} step={1000} />

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.8125rem', color: T3, fontFamily: UI }}>Your Age</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: GOLD, fontFamily: MONO }}>{age}</span>
            </div>
            <input type="range" min={72} max={100} step={1} value={age}
              onChange={e => setAge(Number(e.target.value))}
              style={{ width: '100%', accentColor: TEAL, cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: T3, fontFamily: MONO, marginTop: 2 }}>
              <span>72</span><span>80</span><span>90</span><span>100</span>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {[
              { label: 'RMD This Year',     value: fmtV(rmdAmount), color: GOLD  },
              { label: 'IRS Life Divisor',  value: divisor,          color: TEAL  },
              { label: 'Est. Tax on RMD',   value: fmtV(taxOnRMD),  color: RED   },
              { label: 'Miss RMD Penalty',  value: fmtV(penalty),   color: RED   },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.875rem', background: RAISE, border: `1px solid ${B2}`, borderRadius: 9 }}>
                <span style={{ fontFamily: UI, fontSize: '0.8125rem', color: T3 }}>{label}</span>
                <span style={{ fontFamily: MONO, fontSize: '0.9375rem', fontWeight: 800, color }}>{value}</span>
              </div>
            ))}
          </div>
        </SCard>

        {/* 10-Year Projection Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <SCard title="10-Year RMD Projection" subtitle="Estimated required distributions assuming 5% annual account growth.">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 380, borderCollapse: 'collapse', fontFamily: UI }}>
                <thead>
                  <tr style={{ background: RAISE, borderBottom: `2px solid ${B2}` }}>
                    {['Age', 'Account Balance', 'RMD Required', 'IRS Divisor'].map((h, i) => (
                      <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: i === 0 ? 'left' : 'right', fontSize: '0.6875rem', fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {futureRMDs.map((row, i) => (
                    <tr key={row.age} style={{ background: i % 2 === 0 ? RAISE : SURF, borderBottom: `1px solid ${B1}` }}>
                      <td style={{ padding: '0.625rem 0.75rem', fontWeight: i === 0 ? 700 : 400, color: i === 0 ? GOLD : T2, fontSize: '0.875rem' }}>{row.age}{i === 0 ? ' ← now' : ''}</td>
                      <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', fontFamily: MONO, fontSize: '0.875rem', color: T2 }}>{fmtV(row.balance)}</td>
                      <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', fontFamily: MONO, fontSize: '0.875rem', fontWeight: 700, color: i === 0 ? RED : T2 }}>{fmtV(row.rmd)}</td>
                      <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right', fontSize: '0.8125rem', color: T3 }}>{row.divisor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SCard>

          <SCard title="RMD Reduction Strategies">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { strategy: 'Roth Conversions Before 73', desc: 'Converting traditional IRA funds to Roth before RMDs begin reduces your future taxable RMD balance permanently.', color: GREEN },
                { strategy: 'Qualified Charitable Distribution (QCD)', desc: 'If 70½ or older, donate up to $105,000/yr directly from your IRA to charity. Counts toward RMD but excluded from taxable income.', color: TEAL },
                { strategy: 'Still Working Exception', desc: "If you're still employed at 73+, your current employer's 401(k) may be exempt from RMDs (not IRAs — those still require distributions).", color: GOLD },
                { strategy: 'Aggregate Multiple IRAs', desc: 'If you have multiple IRAs, you can take the total RMD from any one or combination of IRAs — you don\'t need to pull separately from each.', color: AMBER },
              ].map(({ strategy, desc, color }) => (
                <div key={strategy} style={{ display: 'flex', gap: '0.875rem', padding: '0.75rem 0.875rem', background: `${color}0a`, border: `1px solid ${color}28`, borderRadius: 10 }}>
                  <div style={{ width: 4, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: UI, fontSize: '0.875rem', fontWeight: 700, color: T1, marginBottom: 3 }}>{strategy}</div>
                    <div style={{ fontFamily: UI, fontSize: '0.8125rem', color: T3, lineHeight: 1.55 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </SCard>

          <InfoBox color={GOLD}>
            <strong style={{ color: T1 }}>Pro tip:</strong> Converting IRA funds to Roth before age 73 is one of the most powerful RMD reduction strategies available. Use the Roth Conversion tab to model the tax cost vs. lifetime RMD reduction.
          </InfoBox>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
const TABS = [
  { key: 'numbers',   label: 'Key Numbers',          icon: BarChart2   },
  { key: 'calc',      label: 'Bracket Calculator',   icon: Calculator  },
  { key: 'roth',      label: 'Roth Conversion',      icon: RefreshCw   },
  { key: 'rmd',       label: 'RMD Calculator',       icon: Clock       },
  { key: 'accounts',  label: 'Accounts & Location',  icon: Layers      },
  { key: 'equity',    label: 'Equity Compensation',  icon: TrendingUp  },
  { key: 'advanced',  label: 'Advanced Strategies',  icon: Zap         },
];

function Calculator({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="14" y1="18" x2="16" y2="18"/>
    </svg>
  );
}

export default function TaxPlanning() {
  const [activeTab, setActiveTab] = useState('numbers');

  return (
    <div style={{ minHeight: '100vh', background: BG, padding: '0 0 60px', fontFamily: UI }}>
      {/* Header */}
      <div style={{ background: SURF, borderBottom: `1px solid ${B1}`, padding: '1.75rem 2rem 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${TEAL}18`, border: `1px solid ${TEAL}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={15} color={TEAL} />
            </div>
            <Pill label="2026 CFP Tax Data" color={TEAL} />
            <Pill label="Interactive" color={GOLD} />
          </div>
          <h1 style={{ fontFamily: DISP, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: T1, margin: '0 0 0.375rem', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Tax Planning & Strategy
          </h1>
          <p style={{ fontSize: '0.9375rem', color: T3, fontFamily: UI, margin: '0 0 1.5rem', lineHeight: 1.6, maxWidth: 640 }}>
            2026 tax brackets, Roth vs. Traditional decision frameworks, equity compensation mechanics, and advanced strategies used by CFPs and CFAs.
          </p>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', borderBottom: `1px solid ${B1}`, marginBottom: '-1px' }}>
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '0.75rem 1.125rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === key ? TEAL : 'transparent'}`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  color: activeTab === key ? TEAL : T3,
                  fontFamily: UI,
                  fontSize: '0.8125rem',
                  fontWeight: activeTab === key ? 700 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 2rem 0' }}>
        {activeTab === 'numbers'  && <TabKeyNumbers />}
        {activeTab === 'calc'     && <TabCalculator />}
        {activeTab === 'roth'     && <RothConversionTab />}
        {activeTab === 'rmd'      && <RMDCalculatorTab />}
        {activeTab === 'accounts' && <TabAccounts />}
        {activeTab === 'equity'   && <TabEquity />}
        {activeTab === 'advanced' && <TabAdvanced />}
      </div>
    </div>
  );
}
