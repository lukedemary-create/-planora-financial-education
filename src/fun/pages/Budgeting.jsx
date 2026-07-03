import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  BookOpen, Calculator, ExternalLink, ChevronRight,
  DollarSign, AlertCircle, CheckCircle2, Info, ArrowRight,
  Home, Utensils, Car, Zap, Heart, Coffee, Tv, ShoppingBag,
  PiggyBank, TrendingUp, Shield,
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

/* ── Shared helpers ───────────────────────────────────────────────── */
function fmt(n) {
  return '$' + Math.round(n).toLocaleString();
}

function pct(v, total) {
  if (!total) return 0;
  return Math.round((v / total) * 100);
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div style={{
      background: SURF,
      border: `1px solid ${B1}`,
      borderRadius: 16,
      padding: '1.5rem',
      boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
      marginBottom: '1.25rem',
    }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: '1.25rem' }}>
          {title && (
            <h3 style={{
              fontFamily: DISP,
              fontSize: '1.25rem',
              fontWeight: 700,
              color: NAVY,
              margin: '0 0 0.25rem',
              letterSpacing: '-0.02em',
            }}>{title}</h3>
          )}
          {subtitle && (
            <p style={{ margin: 0, fontSize: '0.875rem', color: T3, lineHeight: 1.65 }}>{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function CalcInput({ label, value, onChange, prefix = '$', min = 0, max, step = 1, hint }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{
        display: 'block',
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: NAVY,
        marginBottom: '0.375rem',
        fontFamily: UI,
      }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: '0.9375rem', color: T3, fontWeight: 500,
            fontFamily: UI,
          }}>{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            width: '100%',
            padding: prefix ? '0.625rem 0.75rem 0.625rem 1.625rem' : '0.625rem 0.75rem',
            border: `1.5px solid ${B2}`,
            borderRadius: 9,
            fontSize: '1rem',
            fontFamily: UI,
            color: NAVY,
            fontWeight: 600,
            outline: 'none',
            background: RAISE,
            boxSizing: 'border-box',
            transition: 'border-color 0.13s',
          }}
          onFocus={e => e.target.style.borderColor = TEAL}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>
      {hint && <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: T3, fontFamily: UI }}>{hint}</p>}
    </div>
  );
}

function ResultBadge({ label, value, color = TEAL, size = 'md' }) {
  return (
    <div style={{
      background: `${color}10`,
      border: `1px solid ${color}30`,
      borderRadius: 12,
      padding: size === 'lg' ? '1.25rem' : '0.875rem 1rem',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: size === 'lg' ? '2.25rem' : '1.5rem',
        fontWeight: 700,
        color,
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
      }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: T3, marginTop: 4, fontFamily: UI, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEARN TAB COMPONENTS
══════════════════════════════════════════════════════════════════ */

/* ── Paycheck anatomy ─────────────────────────────────────────────── */
const PAYCHECK_SEGMENTS = [
  { label: 'Net Pay (Take-Home)',   pct: 70.7,  color: TEAL,      desc: 'What lands in your bank account after all deductions',          ex: '$3,535' },
  { label: 'Federal Income Tax',   pct: 12,    color: '#3b82f6', desc: 'Withheld based on your W-4 and marginal tax bracket',           ex: '$600' },
  { label: 'FICA (SS + Medicare)', pct: 7.65,  color: '#8b5cf6', desc: 'Social Security 6.2% + Medicare 1.45% — always fixed',          ex: '$383' },
  { label: 'State Income Tax',     pct: 5,     color: '#f59e0b', desc: 'Varies by state — ranges from 0% (TX, FL) to 13%+ (CA)',        ex: '$250' },
  { label: 'Benefits & 401(k)',    pct: 4.65,  color: T3, desc: 'Health insurance premiums + voluntary retirement contributions', ex: '$232' },
];

function PaycheckDiagram() {
  const [hovered, setHovered] = useState(null);
  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: T3, marginBottom: '1.125rem', lineHeight: 1.7, fontFamily: UI }}>
        Your <strong style={{ color: NAVY }}>gross pay</strong> is what you earn before deductions.
        Your <strong style={{ color: TEAL }}>net pay</strong> (take-home) is what you actually spend and save.
        The gap between the two can be surprisingly large — understanding it is step one of any budget.
        <br/><em style={{ fontSize: '0.8125rem', color: T3 }}>Example based on $5,000/month gross income in a mid-tax state.</em>
      </p>

      {/* Stacked bar */}
      <div style={{
        display: 'flex',
        height: 52,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        {PAYCHECK_SEGMENTS.map((s, i) => (
          <div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              width: `${s.pct}%`,
              background: s.color,
              cursor: 'default',
              filter: hovered === i ? 'brightness(1.12)' : 'brightness(1)',
              transition: 'filter 0.15s',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`${s.label}: ${s.pct}%`}
          >
            {s.pct > 10 && (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', fontFamily: UI, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                {Math.round(s.pct)}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {PAYCHECK_SEGMENTS.map((s, i) => (
          <div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              background: hovered === i ? `${s.color}0d` : 'transparent',
              transition: 'background 0.13s',
              cursor: 'default',
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0, marginTop: 3 }}/>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: NAVY, fontFamily: UI }}>{s.label}</span>
              <span style={{ fontSize: '0.8125rem', color: T3, marginLeft: 6, fontFamily: UI }}>— {s.desc}</span>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: s.color, fontFamily: UI }}>{s.pct}%</div>
              <div style={{ fontSize: '0.75rem', color: T3, fontFamily: UI }}>{s.ex}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Income types ─────────────────────────────────────────────────── */
const INCOME_TYPES = [
  {
    type: 'W-2 (Employee)',
    color: TEAL,
    tags: ['Most common', 'Taxes withheld automatically'],
    desc: 'Your employer withholds taxes before paying you. You receive a W-2 at year end. Benefits like health insurance and 401(k) matching are often included.',
    tip: 'Max out your 401(k) match first — it\'s an instant 50–100% return on that money.',
  },
  {
    type: '1099 (Self-Employed)',
    color: '#8b5cf6',
    tags: ['Freelance / contractor', 'Taxes NOT withheld'],
    desc: 'You receive gross pay with no withholding. You owe self-employment tax (15.3% on top of income tax) and must make quarterly estimated payments to avoid penalties.',
    tip: 'Set aside 25–30% of every 1099 payment immediately. Open a SEP-IRA for significant tax deductions.',
  },
  {
    type: 'Passive Income',
    color: '#f59e0b',
    tags: ['Rental, dividends, interest'],
    desc: 'Income earned with minimal ongoing effort. Rental income, dividends, capital gains, and interest. Tax treatment varies — qualified dividends are taxed at lower rates.',
    tip: 'Passive income doesn\'t count toward Social Security earnings, but qualified dividends are taxed at preferential rates.',
  },
];

function IncomeTypes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {INCOME_TYPES.map((t, i) => (
        <div key={i} style={{
          border: `1.5px solid ${t.color}30`,
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '0.875rem 1rem',
            background: `${t.color}08`,
            borderBottom: `1px solid ${t.color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <span style={{ fontFamily: DISP, fontSize: '1rem', fontWeight: 700, color: NAVY }}>{t.type}</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {t.tags.map(tag => (
                <span key={tag} style={{
                  padding: '2px 10px',
                  background: `${t.color}18`,
                  border: `1px solid ${t.color}35`,
                  borderRadius: 100,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: t.color,
                  fontFamily: UI,
                  letterSpacing: '0.03em',
                }}>{tag}</span>
              ))}
            </div>
          </div>
          <div style={{ padding: '0.875rem 1rem' }}>
            <p style={{ margin: '0 0 0.625rem', fontSize: '0.875rem', color: T2, lineHeight: 1.7, fontFamily: UI }}>{t.desc}</p>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              padding: '0.5rem 0.75rem',
              background: `${t.color}0d`,
              borderRadius: 8,
            }}>
              <Info size={13} color={t.color} style={{ flexShrink: 0, marginTop: 2 }}/>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#4b5563', lineHeight: 1.6, fontFamily: UI }}>
                <strong>Pro tip:</strong> {t.tip}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── 50/30/20 Pie Chart ───────────────────────────────────────────── */
const PIE_DATA = [
  {
    name: 'Needs — 50%',
    value: 50,
    color: TEAL,
    desc: 'Rent/mortgage, groceries, utilities, transportation, minimum debt payments, insurance premiums',
  },
  {
    name: 'Wants — 30%',
    value: 30,
    color: LIGHT,
    desc: 'Dining out, streaming, hobbies, travel, shopping, gym memberships, entertainment',
  },
  {
    name: 'Savings & Debt — 20%',
    value: 20,
    color: NAVY,
    desc: 'Emergency fund, retirement contributions, investments, extra debt payments, future goals',
  },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: SURF,
      border: `1px solid ${B1}`,
      borderRadius: 10,
      padding: '0.75rem 1rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      maxWidth: 220,
      fontFamily: UI,
    }}>
      <div style={{ fontWeight: 700, color: NAVY, marginBottom: 4, fontSize: '0.875rem' }}>{d.name}</div>
      <div style={{ fontSize: '0.8125rem', color: T3, lineHeight: 1.6 }}>{d.desc}</div>
    </div>
  );
};

function SpendingPie() {
  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: T3, marginBottom: '1.25rem', lineHeight: 1.7, fontFamily: UI }}>
        The <strong style={{ color: NAVY }}>50/30/20 rule</strong> is a simple framework popularized by Senator Elizabeth Warren.
        Allocate 50% of take-home pay to needs, 30% to wants, and 20% to savings and debt reduction.
        It's a starting point — not a straitjacket.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 340, height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={PIE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                animationBegin={0}
                animationDuration={900}
              >
                {PIE_DATA.map((d, i) => (
                  <Cell key={i} fill={d.color} stroke="none"/>
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          {PIE_DATA.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
              <div style={{
                width: 14, height: 14,
                borderRadius: 4,
                background: d.color,
                flexShrink: 0,
                marginTop: 3,
              }}/>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: NAVY, fontFamily: UI, marginBottom: 2 }}>{d.name}</div>
                <div style={{ fontSize: '0.8125rem', color: T3, lineHeight: 1.6, fontFamily: UI }}>{d.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CALCULATE TAB COMPONENTS
══════════════════════════════════════════════════════════════════ */

/* ── Budget Builder ───────────────────────────────────────────────── */
const DEFAULT_CATS = [
  { id: 'rent',    label: 'Rent / Mortgage',     group: 'needs',   icon: Home,       default: 1500 },
  { id: 'food',    label: 'Groceries',            group: 'needs',   icon: Utensils,   default: 400  },
  { id: 'trans',   label: 'Transportation',       group: 'needs',   icon: Car,        default: 350  },
  { id: 'util',    label: 'Utilities',            group: 'needs',   icon: Zap,        default: 150  },
  { id: 'health',  label: 'Healthcare',           group: 'needs',   icon: Heart,      default: 200  },
  { id: 'dining',  label: 'Dining Out',           group: 'wants',   icon: Coffee,     default: 200  },
  { id: 'ent',     label: 'Entertainment',        group: 'wants',   icon: Tv,         default: 100  },
  { id: 'shop',    label: 'Shopping',             group: 'wants',   icon: ShoppingBag,default: 150  },
  { id: 'subs',    label: 'Subscriptions',        group: 'wants',   icon: Tv,         default: 50   },
  { id: 'efund',   label: 'Emergency Fund',       group: 'savings', icon: Shield,     default: 200  },
  { id: 'invest',  label: 'Retirement / Invest.',  group: 'savings', icon: TrendingUp, default: 300  },
  { id: 'goals',   label: 'Other Goals',           group: 'savings', icon: PiggyBank,  default: 100  },
];

const GROUP_META = {
  needs:   { label: 'Needs',             target: 0.50, color: TEAL,      icon: Home      },
  wants:   { label: 'Wants',             target: 0.30, color: LIGHT,     icon: Coffee    },
  savings: { label: 'Savings & Debt',    target: 0.20, color: NAVY,      icon: PiggyBank },
};

function BarVsTarget({ actual, target, color }) {
  const over = actual > target;
  const pctUsed = target > 0 ? Math.min((actual / target) * 100, 130) : 0;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: T3, fontFamily: UI, marginBottom: 3 }}>
        <span>Actual: {fmt(actual)}</span>
        <span style={{ color: over ? '#ef4444' : '#9ca3af' }}>Target: {fmt(target)}</span>
      </div>
      <div style={{ height: 5, background: '#f0f0f0', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pctUsed}%`,
          background: over ? '#ef4444' : color,
          borderRadius: 99,
          transition: 'width 0.4s ease',
        }}/>
      </div>
    </div>
  );
}

function BudgetBuilder() {
  const [income, setIncome] = useState(4000);
  const [cats, setCats]     = useState(() => Object.fromEntries(DEFAULT_CATS.map(c => [c.id, c.default])));

  const update = useCallback((id, val) => {
    setCats(prev => ({ ...prev, [id]: Math.max(0, val) }));
  }, []);

  const groups = ['needs', 'wants', 'savings'];
  const groupTotals = Object.fromEntries(
    groups.map(g => [g, DEFAULT_CATS.filter(c => c.group === g).reduce((s, c) => s + (cats[c.id] || 0), 0)])
  );
  const totalExp   = Object.values(groupTotals).reduce((a, b) => a + b, 0);
  const surplus    = income - totalExp;
  const surplusPos = surplus >= 0;

  return (
    <div>
      <CalcInput label="Monthly Take-Home Income" value={income} onChange={setIncome} min={0} step={100} hint="Use your net (after-tax) income"/>

      {/* Group panels */}
      {groups.map(g => {
        const meta      = GROUP_META[g];
        const target    = income * meta.target;
        const groupCats = DEFAULT_CATS.filter(c => c.group === g);
        const actual    = groupTotals[g];

        return (
          <div key={g} style={{
            border: `1.5px solid ${meta.color}25`,
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: '1rem',
          }}>
            {/* Group header */}
            <div style={{
              padding: '0.75rem 1rem',
              background: `${meta.color}0c`,
              borderBottom: `1px solid ${meta.color}20`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <span style={{ fontFamily: UI, fontWeight: 700, color: NAVY, fontSize: '0.9375rem' }}>
                  {meta.label}
                </span>
                <span style={{ marginLeft: 8, fontSize: '0.75rem', color: T3, fontFamily: UI }}>
                  ({Math.round(meta.target * 100)}% target)
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '0.9375rem', fontWeight: 800,
                  color: actual > target ? '#ef4444' : meta.color,
                  fontFamily: UI,
                }}>{fmt(actual)}</span>
                <span style={{ fontSize: '0.75rem', color: T3, fontFamily: UI, marginLeft: 4 }}>/ {fmt(target)}</span>
              </div>
            </div>

            {/* Bar */}
            <div style={{ padding: '0 1rem 0' }}>
              <BarVsTarget actual={actual} target={target} color={meta.color}/>
            </div>

            {/* Category rows */}
            <div style={{ padding: '0.625rem 0' }}>
              {groupCats.map(cat => {
                const Icon = cat.icon;
                return (
                  <div key={cat.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.375rem 1rem',
                  }}>
                    <Icon size={13} color={meta.color} style={{ flexShrink: 0 }}/>
                    <span style={{ flex: 1, fontSize: '0.8125rem', color: T2, fontFamily: UI }}>{cat.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => update(cat.id, (cats[cat.id] || 0) - 25)}
                        style={{ width:24, height:24, border:`1px solid #e5e7eb`, borderRadius:6, background:RAISE, cursor:'pointer', fontSize:'1rem', lineHeight:1, color:T3, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit' }}>
                        −
                      </button>
                      <input
                        type="number"
                        value={cats[cat.id] || 0}
                        onChange={e => update(cat.id, Number(e.target.value))}
                        style={{
                          width: 72, textAlign: 'center',
                          border: `1.5px solid ${B2}`, borderRadius: 6,
                          padding: '3px 6px',
                          fontSize: '0.8125rem', fontWeight: 600,
                          color: NAVY, fontFamily: UI,
                          background: RAISE,
                        }}
                        onFocus={e => e.target.style.borderColor = TEAL}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                      <button onClick={() => update(cat.id, (cats[cat.id] || 0) + 25)}
                        style={{ width:24, height:24, border:`1px solid #e5e7eb`, borderRadius:6, background:RAISE, cursor:'pointer', fontSize:'1rem', lineHeight:1, color:TEAL, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit' }}>
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Summary */}
      <div style={{
        padding: '1.125rem 1.25rem',
        background: surplusPos ? 'rgba(0,180,198,0.06)' : 'rgba(239,68,68,0.06)',
        border: `1.5px solid ${surplusPos ? TEAL : '#ef4444'}30`,
        borderRadius: 12,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: UI, marginBottom: 3 }}>
            Monthly {surplusPos ? 'Surplus' : 'Deficit'}
          </div>
          <div style={{
            fontFamily: DISP,
            fontSize: '2rem',
            fontWeight: 700,
            color: surplusPos ? TEAL : '#ef4444',
            letterSpacing: '-0.025em',
          }}>{surplusPos ? '+' : ''}{fmt(surplus)}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', padding: '0.5rem 0.875rem', background: SURF, borderRadius: 9, border: `1px solid ` }}>
            <div style={{ fontSize: '0.75rem', color: T3, fontFamily: UI }}>Total Expenses</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: NAVY, fontFamily: UI }}>{fmt(totalExp)}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.5rem 0.875rem', background: SURF, borderRadius: 9, border: `1px solid ` }}>
            <div style={{ fontSize: '0.75rem', color: T3, fontFamily: UI }}>Savings Rate</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: TEAL, fontFamily: UI }}>{pct(groupTotals.savings, income)}%</div>
          </div>
        </div>
      </div>

      {!surplusPos && (
        <div style={{ marginTop: '0.875rem', display: 'flex', gap: 8, padding: '0.75rem 0.875rem', background: '#fef2f2', borderRadius: 10, border: '1px solid #fee2e2' }}>
          <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }}/>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#991b1b', lineHeight: 1.6, fontFamily: UI }}>
            You're spending more than you earn. Identify which categories to reduce — start with Wants, then revisit fixed costs.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Emergency Fund Calculator ────────────────────────────────────── */
function EmergencyFundCalc() {
  const [monthly, setMonthly]   = useState(3000);
  const [months, setMonths]     = useState(3);
  const [savePer, setSavePer]   = useState(300);

  const target    = monthly * months;
  const toReach   = Math.ceil(target / savePer);
  const recMonths = months < 3 ? 'too low' : months <= 6 ? 'recommended' : 'very safe';
  const recColor  = months < 3 ? '#ef4444' : months <= 6 ? TEAL : '#22c55e';

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
        <CalcInput label="Monthly Expenses" value={monthly} onChange={setMonthly} min={0} step={100}/>
        <CalcInput label="Monthly Contribution" value={savePer} onChange={setSavePer} min={0} step={50} hint="How much you can save each month"/>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: NAVY, marginBottom: '0.5rem', fontFamily: UI }}>
          Months of expenses to cover: <span style={{ color: recColor, fontWeight: 700 }}>{months} months ({recMonths})</span>
        </label>
        <input
          type="range" min={1} max={12} step={1} value={months}
          onChange={e => setMonths(Number(e.target.value))}
          style={{ width: '100%', accentColor: TEAL, cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: T3, fontFamily: UI, marginTop: 3 }}>
          <span>1 mo</span><span>3 mo (min)</span><span>6 mo (ideal)</span><span>12 mo</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <ResultBadge label="Target Fund Size" value={fmt(target)} color={TEAL} size="lg"/>
        <ResultBadge label={`Months to Goal (${fmt(savePer)}/mo)`} value={savePer > 0 ? `${toReach} mo` : '—'} color={NAVY}/>
      </div>

      <div style={{ padding: '0.875rem', background: '#f0fdff', border: '1px solid rgba(0,180,198,0.2)', borderRadius: 10 }}>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: T2, lineHeight: 1.7, fontFamily: UI }}>
          <strong>Where to keep it:</strong> A high-yield savings account (HYSA) — currently 4.5–5% APY at online banks like Marcus, Ally, or SoFi.
          Keep it separate from your checking so you're not tempted to spend it.
        </p>
      </div>
    </div>
  );
}

/* ── Savings Rate Calculator ──────────────────────────────────────── */
function SavingsRateCalc() {
  const [income,  setIncome]  = useState(4000);
  const [savings, setSavings] = useState(600);

  const rate = income > 0 ? Math.round((savings / income) * 100) : 0;
  const rateColor = rate < 10 ? '#ef4444' : rate < 15 ? '#f59e0b' : rate < 20 ? TEAL : '#22c55e';
  const rateLabel = rate < 10 ? 'Below minimum recommended' : rate < 15 ? 'Good start — push to 15%' : rate < 20 ? 'On track' : 'Excellent';

  const BENCHMARKS = [
    { label: '10%', desc: 'Bare minimum for long-term security', pct: 10, color: '#f59e0b' },
    { label: '15%', desc: 'Standard recommendation for retirement', pct: 15, color: TEAL },
    { label: '20%', desc: '50/30/20 savings target', pct: 20, color: '#22c55e' },
    { label: '25%+', desc: 'Financial independence accelerator', pct: 25, color: NAVY },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
        <CalcInput label="Monthly Take-Home Income" value={income} onChange={setIncome} min={0} step={100}/>
        <CalcInput label="Monthly Savings" value={savings} onChange={setSavings} min={0} step={25} hint="Retirement + emergency fund + investments"/>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <ResultBadge label={rateLabel} value={`${rate}%`} color={rateColor} size="lg"/>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {BENCHMARKS.map(b => {
          const isYou = rate >= b.pct && (b.pct === 25 || rate < BENCHMARKS[BENCHMARKS.indexOf(b) + 1]?.pct);
          return (
            <div key={b.label} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              background: rate >= b.pct ? `${b.color}0d` : '#f9fafb',
              borderRadius: 9,
              border: `1px solid ${rate >= b.pct ? b.color + '30' : '#f0f0f0'}`,
            }}>
              {rate >= b.pct
                ? <CheckCircle2 size={15} color={b.color}/>
                : <div style={{ width:15, height:15, borderRadius:'50%', border:'1.5px solid #d1d5db', flexShrink:0 }}/>
              }
              <span style={{ fontWeight: 700, color: b.color, fontSize: '0.875rem', fontFamily: UI, width: 36, flexShrink:0 }}>{b.label}</span>
              <span style={{ fontSize: '0.8125rem', color: '#4b5563', fontFamily: UI }}>{b.desc}</span>
              {isYou && <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', fontWeight: 700, color: b.color, fontFamily: UI, background: `${b.color}18`, padding:'2px 8px', borderRadius:100 }}>You are here</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Debt-to-Income Ratio Calculator ─────────────────────────────── */
const DTI_CATS = [
  { id: 'housing',  label: 'Rent / Mortgage Payment' },
  { id: 'car',      label: 'Car Loan / Lease'         },
  { id: 'student',  label: 'Student Loans'            },
  { id: 'cc',       label: 'Credit Card Min. Payments'},
  { id: 'other',    label: 'Other Debt Payments'       },
];

function DTICalc() {
  const [grossIncome, setGross] = useState(5000);
  const [debts, setDebts]       = useState({ housing:1500, car:350, student:200, cc:50, other:0 });

  const totalDebt = Object.values(debts).reduce((a, b) => a + b, 0);
  const dti = grossIncome > 0 ? Math.round((totalDebt / grossIncome) * 100) : 0;
  const dtiColor = dti <= 28 ? '#22c55e' : dti <= 36 ? TEAL : dti <= 50 ? '#f59e0b' : '#ef4444';
  const dtiLabel = dti <= 28 ? 'Excellent — lenders love this' : dti <= 36 ? 'Good — qualifies for most loans' : dti <= 50 ? 'Caution — debt is stretched' : 'High — focus on debt reduction';

  return (
    <div>
      <CalcInput label="Monthly Gross Income (before taxes)" value={grossIncome} onChange={setGross} min={0} step={100}/>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: NAVY, marginBottom: '0.5rem', fontFamily: UI }}>Monthly Debt Payments</label>
        {DTI_CATS.map(c => (
          <div key={c.id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.375rem 0' }}>
            <span style={{ flex:1, fontSize:'0.8125rem', color:T2, fontFamily:UI }}>{c.label}</span>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ color:T3, fontSize:'0.9375rem' }}>$</span>
              <input
                type="number" min={0} value={debts[c.id] || 0}
                onChange={e => setDebts(prev => ({ ...prev, [c.id]: Math.max(0, Number(e.target.value)) }))}
                style={{ width:88, border:`1.5px solid ${B2}`, borderRadius:7, padding:'5px 8px', fontSize:'0.875rem', fontWeight:600, color:NAVY, fontFamily:UI, background:RAISE }}
                onFocus={e => e.target.style.borderColor = TEAL}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
        <ResultBadge label="Total Monthly Debt" value={fmt(totalDebt)} color="#6b7280"/>
        <ResultBadge label={dtiLabel} value={`${dti}%`} color={dtiColor} size="lg"/>
      </div>

      {/* DTI Scale */}
      <div style={{ background:RAISE, borderRadius:10, padding:'0.875rem' }}>
        <div style={{ display:'flex', height:8, borderRadius:99, overflow:'hidden', marginBottom:6 }}>
          <div style={{ flex:28, background:'#22c55e' }}/>
          <div style={{ flex:8,  background:TEAL }}/>
          <div style={{ flex:14, background:'#f59e0b' }}/>
          <div style={{ flex:50, background:'#ef4444' }}/>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.6875rem', color:T3, fontFamily:UI }}>
          <span>0%</span><span style={{color:'#22c55e'}}>≤28% ideal</span><span style={{color:TEAL}}>≤36% good</span><span style={{color:'#f59e0b'}}>≤50%</span><span style={{color:'#ef4444'}}>50%+</span>
        </div>
        <div style={{ marginTop:6, width:`${Math.min(dti,100)}%`, height:3, background:dtiColor, borderRadius:99, transition:'width 0.4s ease' }}/>
        <p style={{ margin:'0.625rem 0 0', fontSize:'0.8125rem', color:'#4b5563', lineHeight:1.65, fontFamily:UI }}>
          <strong>Why it matters:</strong> Lenders use DTI to decide whether to approve loans. Most mortgages require a DTI under 43%. Keeping it under 28% (housing only) puts you in the best possible position.
        </p>
      </div>
    </div>
  );
}

/* ── Financial Health Ratios ──────────────────────────────────────── */
const MONO = "'JetBrains Mono', 'Courier New', monospace";

function getStatus(value, thresholds, isLower = false) {
  for (const t of thresholds) {
    if (isLower) {
      if (t.max === undefined || value <= t.max) return t;
    } else {
      if (t.min === undefined || value >= t.min) return t;
    }
  }
  return thresholds[thresholds.length - 1];
}

function FinancialHealthRatios() {
  const [grossIncome,  setGrossIncome]  = useState(5000);
  const [netIncome,    setNetIncome]    = useState(3800);
  const [housing,      setHousing]      = useState(1200);
  const [totalDebt,    setTotalDebt]    = useState(1600);
  const [nonHouseDebt, setNonHouseDebt] = useState(400);
  const [savings,      setSavings]      = useState(760);
  const [efund,        setEfund]        = useState(9000);
  const [monthlyExp,   setMonthlyExp]   = useState(3200);
  const [liquidAssets, setLiquidAssets] = useState(15000);

  const sr  = netIncome   > 0 ? (savings      / netIncome)   * 100 : 0;
  const hr  = grossIncome > 0 ? (housing      / grossIncome) * 100 : 0;
  const dti = grossIncome > 0 ? (totalDebt    / grossIncome) * 100 : 0;
  const ef  = monthlyExp  > 0 ?  efund        / monthlyExp        : 0;
  const liq = monthlyExp  > 0 ?  liquidAssets / monthlyExp        : 0;
  const cdr = grossIncome > 0 ? (nonHouseDebt / grossIncome) * 100 : 0;
  const ir  = grossIncome > 0 ? (savings      / grossIncome) * 100 : 0;

  const RATIOS = [
    {
      label: 'Savings Rate', value: sr, display: `${sr.toFixed(1)}%`, target: '≥ 20% of net income',
      desc: 'Your take-home pay going toward savings & investments. The single most powerful lever in personal finance.',
      isLower: false,
      thresholds: [
        { min: 20,            color: '#22c55e', label: 'Excellent', score: 1.0 },
        { min: 15,            color: TEAL,      label: 'Good',      score: 0.7 },
        { min: 10,            color: '#f59e0b', label: 'Building',  score: 0.3 },
        {                     color: '#ef4444', label: 'Low',       score: 0.0 },
      ],
    },
    {
      label: 'Housing Cost Ratio', value: hr, display: `${hr.toFixed(1)}%`, target: '≤ 28% of gross income',
      desc: 'Housing as a share of gross income. Lenders require this below 28–31% for mortgage approval.',
      isLower: true,
      thresholds: [
        { max: 27.9,          color: '#22c55e', label: 'Excellent',  score: 1.0 },
        { max: 32.9,          color: '#f59e0b', label: 'Borderline', score: 0.3 },
        {                     color: '#ef4444', label: 'Over limit', score: 0.0 },
      ],
    },
    {
      label: 'Debt-to-Income (DTI)', value: dti, display: `${dti.toFixed(1)}%`, target: '≤ 36% of gross income',
      desc: 'All monthly debt payments ÷ gross income. The key ratio lenders use to assess your loan eligibility.',
      isLower: true,
      thresholds: [
        { max: 27.9,          color: '#22c55e', label: 'Excellent', score: 1.0 },
        { max: 35.9,          color: TEAL,      label: 'Good',      score: 0.7 },
        { max: 49.9,          color: '#f59e0b', label: 'High',      score: 0.3 },
        {                     color: '#ef4444', label: 'Critical',  score: 0.0 },
      ],
    },
    {
      label: 'Emergency Fund', value: ef, display: `${ef.toFixed(1)} mo`, target: '3–6 months of expenses',
      desc: "Months of essential expenses covered by liquid savings. Your buffer against life's curveballs.",
      isLower: false,
      thresholds: [
        { min: 6,             color: '#22c55e', label: 'Fully funded', score: 1.0 },
        { min: 3,             color: TEAL,      label: 'On track',     score: 0.7 },
        { min: 1,             color: '#f59e0b', label: 'Building',     score: 0.3 },
        {                     color: '#ef4444', label: 'At risk',      score: 0.0 },
      ],
    },
    {
      label: 'Liquidity Ratio', value: liq, display: `${liq.toFixed(1)}×`, target: '≥ 3× monthly expenses',
      desc: 'Total liquid assets relative to monthly spending. Measures how quickly you could survive an income loss.',
      isLower: false,
      thresholds: [
        { min: 6,             color: '#22c55e', label: 'Very liquid',   score: 1.0 },
        { min: 3,             color: TEAL,      label: 'Liquid',        score: 0.7 },
        { min: 1,             color: '#f59e0b', label: 'Low liquidity', score: 0.3 },
        {                     color: '#ef4444', label: 'At risk',       score: 0.0 },
      ],
    },
    {
      label: 'Consumer Debt Ratio', value: cdr, display: `${cdr.toFixed(1)}%`, target: '≤ 10–15% of gross income',
      desc: 'Non-housing debt payments as a share of gross income. High consumer debt squeezes savings and wealth building.',
      isLower: true,
      thresholds: [
        { max: 9.9,           color: '#22c55e', label: 'Excellent',   score: 1.0 },
        { max: 14.9,          color: TEAL,      label: 'Manageable',  score: 0.7 },
        { max: 19.9,          color: '#f59e0b', label: 'High',        score: 0.3 },
        {                     color: '#ef4444', label: 'Concerning',  score: 0.0 },
      ],
    },
    {
      label: 'Investment Rate', value: ir, display: `${ir.toFixed(1)}%`, target: '≥ 15% of gross income',
      desc: 'Percentage of gross income directed to retirement & long-term wealth building.',
      isLower: false,
      thresholds: [
        { min: 20,            color: '#22c55e', label: 'Excellent', score: 1.0 },
        { min: 15,            color: TEAL,      label: 'On track',  score: 0.7 },
        { min: 10,            color: '#f59e0b', label: 'Building',  score: 0.3 },
        {                     color: '#ef4444', label: 'Low',       score: 0.0 },
      ],
    },
  ];

  const scored = RATIOS.map(r => ({ ...r, status: getStatus(r.value, r.thresholds, r.isLower) }));
  const totalScore   = Math.round((scored.reduce((s, r) => s + r.status.score, 0) / RATIOS.length) * 100);
  const scoreColor   = totalScore >= 75 ? '#22c55e' : totalScore >= 50 ? TEAL : totalScore >= 30 ? '#f59e0b' : '#ef4444';
  const scoreLabel   = totalScore >= 75 ? 'Strong' : totalScore >= 50 ? 'Good' : totalScore >= 30 ? 'Fair' : 'Needs Work';
  const nGreen  = scored.filter(r => r.status.color === '#22c55e').length;
  const nTeal   = scored.filter(r => r.status.color === TEAL).length;
  const nYellow = scored.filter(r => r.status.color === '#f59e0b').length;
  const nRed    = scored.filter(r => r.status.color === '#ef4444').length;

  return (
    <div>
      {/* Inputs */}
      <SectionCard title="Your Financial Inputs" subtitle="Enter your monthly figures — all ratios update instantly.">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1.25rem' }}>
          <CalcInput label="Monthly Gross Income (pre-tax)"     value={grossIncome}  onChange={setGrossIncome}  step={100} hint="Your income before taxes"/>
          <CalcInput label="Monthly Net Income (take-home)"     value={netIncome}    onChange={setNetIncome}    step={100} hint="After taxes and deductions"/>
          <CalcInput label="Monthly Housing Cost"               value={housing}      onChange={setHousing}      step={50}  hint="Rent or mortgage payment"/>
          <CalcInput label="Total Monthly Debt Payments"        value={totalDebt}    onChange={setTotalDebt}    step={50}  hint="All loans + credit card minimums"/>
          <CalcInput label="Non-Housing Debt Payments"          value={nonHouseDebt} onChange={setNonHouseDebt} step={25}  hint="Car, student, credit cards only"/>
          <CalcInput label="Monthly Savings & Investments"      value={savings}      onChange={setSavings}      step={50}  hint="401(k), IRA, brokerage, e-fund contributions"/>
          <CalcInput label="Emergency Fund Balance"             value={efund}        onChange={setEfund}        step={500} hint="Total liquid emergency savings"/>
          <CalcInput label="Monthly Essential Expenses"         value={monthlyExp}   onChange={setMonthlyExp}   step={100} hint="What you must spend to survive monthly"/>
          <CalcInput label="Total Liquid Assets"                value={liquidAssets} onChange={setLiquidAssets} step={500} hint="Cash + savings + easily accessible funds"/>
        </div>
      </SectionCard>

      {/* Overall Score */}
      <div style={{ background:SURF, border:`1px solid ${B1}`, borderRadius:16, padding:'1.25rem 1.5rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
        <div style={{ textAlign:'center', minWidth:96, flexShrink:0 }}>
          <div style={{ fontSize:'3rem', fontWeight:800, color:scoreColor, lineHeight:1, letterSpacing:'-0.03em', fontFamily:MONO }}>{totalScore}</div>
          <div style={{ fontSize:'0.65rem', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:UI, marginTop:4 }}>out of 100</div>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:`'Playfair Display', serif`, fontSize:'1.25rem', fontWeight:700, color:NAVY, marginBottom:4 }}>
            Financial Health: <span style={{ color:scoreColor }}>{scoreLabel}</span>
          </div>
          <div style={{ fontSize:'0.8rem', color:T3, lineHeight:1.65, fontFamily:UI, marginBottom:'0.625rem' }}>
            {nGreen} excellent &middot; {nTeal} good &middot; {nYellow} fair &middot; {nRed} need{nRed !== 1 ? 's' : ''} work
          </div>
          <div style={{ height:7, background:RAISE, borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${totalScore}%`, background:scoreColor, borderRadius:99, transition:'width 0.45s ease' }}/>
          </div>
        </div>
      </div>

      {/* Ratio Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem', marginBottom:'1.25rem' }}>
        {scored.map(r => (
          <div key={r.label} style={{ background:SURF, border:`1.5px solid ${r.status.color}22`, borderRadius:14, padding:'1rem 1.125rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem' }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:UI, lineHeight:1.3 }}>{r.label}</div>
              <span style={{ fontSize:'0.6rem', fontWeight:700, color:r.status.color, background:`${r.status.color}15`, border:`1px solid ${r.status.color}30`, borderRadius:99, padding:'2px 8px', fontFamily:UI, whiteSpace:'nowrap', flexShrink:0, marginLeft:6 }}>{r.status.label}</span>
            </div>
            <div style={{ fontSize:'1.875rem', fontWeight:800, color:r.status.color, lineHeight:1, letterSpacing:'-0.02em', marginBottom:'0.25rem', fontFamily:MONO }}>{r.display}</div>
            <div style={{ fontSize:'0.695rem', color:T3, fontFamily:UI, marginBottom:'0.5rem' }}>Benchmark: <strong style={{ color:T2 }}>{r.target}</strong></div>
            <div style={{ fontSize:'0.75rem', color:T3, lineHeight:1.6, fontFamily:UI }}>{r.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:8, padding:'0.875rem 1rem', background:`${TEAL}0d`, border:`1px solid ${TEAL}25`, borderRadius:12 }}>
        <Info size={14} color={TEAL} style={{ flexShrink:0, marginTop:2 }}/>
        <p style={{ margin:0, fontSize:'0.8125rem', color:T2, lineHeight:1.65, fontFamily:UI }}>
          These ratios are educational benchmarks, not rigid rules. Use them as a diagnostic tool and work with a fee-only fiduciary advisor on personalized goals.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   RESOURCES TAB
══════════════════════════════════════════════════════════════════ */
const RESOURCES = [
  {
    name: 'YNAB (You Need A Budget)',
    badge: 'Best for deep budgeters',
    badgeColor: TEAL,
    desc: 'Zero-based budgeting system where every dollar gets a job. Steep learning curve but transformative for people serious about controlling spending. Desktop + mobile.',
    cost: '$14.99/month or $99/year (free 34-day trial)',
    best: 'People who want full awareness of every dollar',
  },
  {
    name: 'Monarch Money',
    badge: 'Best overall',
    badgeColor: '#22c55e',
    desc: 'Modern replacement for Mint. Connects accounts, tracks spending automatically, supports net worth tracking and long-term goals. Clean, elegant UI.',
    cost: '$14.99/month or $99.99/year',
    best: 'Most people — beautiful and comprehensive',
  },
  {
    name: 'EveryDollar',
    badge: 'Best for beginners',
    badgeColor: '#8b5cf6',
    desc: 'Dave Ramsey\'s budgeting app based on the zero-based method. Simple, intuitive, and great for first-time budgeters. Free version requires manual entry.',
    cost: 'Free (manual) or $17.99/month with bank sync',
    best: 'First-time budgeters and Dave Ramsey followers',
  },
  {
    name: 'Copilot',
    badge: 'Best design',
    badgeColor: '#f59e0b',
    desc: 'Apple-first budgeting app with AI-powered transaction categorization and a beautiful native experience. Automatically imports and organizes all your accounts.',
    cost: '$8.99/month or $95.99/year',
    best: 'iPhone users who value design and automation',
  },
];

function ResourcesTab() {
  return (
    <div>
      <div style={{
        padding:'0.875rem 1rem',
        background:'rgba(0,180,198,0.06)',
        border:'1px solid rgba(0,180,198,0.2)',
        borderRadius:12,
        marginBottom:'1.25rem',
        display:'flex',
        gap:10,
        alignItems:'flex-start',
      }}>
        <Info size={15} color={TEAL} style={{ flexShrink:0, marginTop:1 }}/>
        <p style={{ margin:0, fontSize:'0.875rem', color:T2, lineHeight:1.7, fontFamily:UI }}>
          <strong>How to choose:</strong> Start with a free or low-cost app. The best budgeting app is the one you'll actually use. Try one for 30 days before committing — most offer free trials.
        </p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {RESOURCES.map((r, i) => (
          <div key={i} style={{
            background:SURF,
            border:`1px solid ${B1}`,
            borderRadius:14,
            overflow:'hidden',
            boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{
              padding:'0.875rem 1.125rem',
              borderBottom:'1px solid #f0f0f0',
              display:'flex',
              alignItems:'center',
              justifyContent:'space-between',
              flexWrap:'wrap',
              gap:8,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{
                  fontFamily:DISP,
                  fontSize:'1rem',
                  fontWeight:700,
                  color:NAVY,
                }}>{r.name}</span>
                <span style={{
                  padding:'2px 10px',
                  background:`${r.badgeColor}15`,
                  border:`1px solid ${r.badgeColor}35`,
                  borderRadius:100,
                  fontSize:'0.6875rem',
                  fontWeight:700,
                  color:r.badgeColor,
                  fontFamily:UI,
                  letterSpacing:'0.03em',
                }}>{r.badge}</span>
              </div>
            </div>
            <div style={{ padding:'0.875rem 1.125rem' }}>
              <p style={{ margin:'0 0 0.75rem', fontSize:'0.875rem', color:T2, lineHeight:1.7, fontFamily:UI }}>{r.desc}</p>
              <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'0.25rem 0.75rem', fontSize:'0.8125rem', fontFamily:UI }}>
                <span style={{ color:T3, fontWeight:600 }}>Cost</span>
                <span style={{ color:T2 }}>{r.cost}</span>
                <span style={{ color:T3, fontWeight:600 }}>Best for</span>
                <span style={{ color:T2 }}>{r.best}</span>
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
  { id: 'learn',    label: 'Learn',     icon: BookOpen    },
  { id: 'calc',     label: 'Calculate', icon: Calculator  },
  { id: 'resources',label: 'Resources', icon: ExternalLink },
];

export default function Budgeting() {
  const navigate  = useNavigate();
  const [tab,     setTab]     = useState('learn');
  const [calcTab, setCalcTab] = useState('budget');

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:UI }}>

      {/* Page header */}
      <div style={{
        background: SURF,
        borderBottom: `1px solid ${B1}`,
        padding: '2rem 2.5rem 0',
        marginBottom: 0,
      }}>
        {/* Breadcrumb */}
        <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', marginBottom:'1rem', display:'flex', alignItems:'center', gap:6, fontFamily:UI }}>
          <button onClick={() => navigate('/fun')} style={{ background:'none', border:'none', cursor:'pointer', color:TEAL, fontSize:'0.75rem', fontFamily:UI, padding:0 }}>
            Dashboard
          </button>
          <ChevronRight size={12} color="rgba(255,255,255,0.25)"/>
          <span>Budgeting & Financial Foundations</span>
        </div>

        <h1 style={{
          fontFamily:"'Playfair Display', Georgia, serif",
          fontSize:'2rem',
          fontWeight:700,
          color:'#fff',
          margin:'0 0 0.5rem',
          letterSpacing:'-0.025em',
          lineHeight:1.2,
        }}>Budgeting & Financial Foundations</h1>
        <p style={{ margin:'0 0 1.75rem', fontSize:'1rem', color:'rgba(255,255,255,0.55)', lineHeight:1.65, maxWidth:580, fontFamily:UI }}>
          Master the fundamentals — understand your paycheck, build a budget that works, and create an emergency fund that actually gives you peace of mind.
        </p>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display:'flex', alignItems:'center', gap:7,
                  padding:'0.75rem 1.25rem',
                  background:'none',
                  border:'none',
                  borderBottom: active ? `2px solid ${TEAL}` : '2px solid transparent',
                  cursor:'pointer',
                  fontFamily:UI,
                  fontSize:'0.875rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? TEAL : 'rgba(255,255,255,0.45)',
                  marginBottom:-1,
                  transition:'color 0.15s',
                  whiteSpace:'nowrap',
                }}
              >
                <Icon size={14}/>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:'2rem 2.5rem', maxWidth:860, margin:'0 auto' }}>

        {/* ── LEARN TAB ── */}
        {tab === 'learn' && (
          <div>
            <SectionCard
              title="Gross vs. Net Pay — Know Your Actual Income"
              subtitle="Understanding the difference between what you earn and what you take home is the foundation of every budget."
            >
              <PaycheckDiagram/>
            </SectionCard>

            <SectionCard
              title="Types of Income"
              subtitle="Not all income is taxed the same way. Knowing your income type changes how you budget, save, and plan."
            >
              <IncomeTypes/>
            </SectionCard>

            <SectionCard
              title="The 50/30/20 Rule"
              subtitle="A proven, flexible framework for allocating your take-home pay. Simple enough to start today."
            >
              <SpendingPie/>
            </SectionCard>
          </div>
        )}

        {/* ── CALCULATE TAB ── */}
        {tab === 'calc' && (
          <div>
            {/* Sub-tab pills */}
            <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
              {[
                { id:'budget',  label:'Budget Builder'      },
                { id:'efund',   label:'Emergency Fund'      },
                { id:'savings', label:'Savings Rate'        },
                { id:'dti',     label:'Debt-to-Income'      },
                { id:'ratios',  label:'Financial Health Ratios' },
              ].map(t => {
                const active = calcTab === t.id;
                return (
                  <button key={t.id} onClick={() => setCalcTab(t.id)} style={{
                    padding:'7px 16px', borderRadius:99,
                    border:`1px solid ${active ? TEAL : B2}`,
                    background: active ? TEAL : RAISE, cursor:'pointer',
                    fontFamily:UI, fontSize:'0.8125rem',
                    fontWeight: active ? 700 : 500, color: active ? '#1a1410' : T3,
                    whiteSpace:'nowrap',
                  }}>{t.label}</button>
                );
              })}
            </div>

            {calcTab === 'budget' && (
              <SectionCard
                title="Monthly Budget Builder"
                subtitle="Enter your take-home income and adjust each category. Live surplus or deficit updates instantly as you type."
              >
                <BudgetBuilder/>
              </SectionCard>
            )}

            {calcTab === 'efund' && (
              <SectionCard
                title="Emergency Fund Calculator"
                subtitle="How large should your emergency fund be? Use this to find your target and how long it'll take to get there."
              >
                <EmergencyFundCalc/>
              </SectionCard>
            )}

            {calcTab === 'savings' && (
              <SectionCard
                title="Savings Rate Calculator"
                subtitle="Your savings rate is one of the most important numbers in personal finance. Where do you stand?"
              >
                <SavingsRateCalc/>
              </SectionCard>
            )}

            {calcTab === 'dti' && (
              <SectionCard
                title="Debt-to-Income Ratio (DTI)"
                subtitle="Lenders use DTI to evaluate your financial health. It's also a great personal benchmark."
              >
                <DTICalc/>
              </SectionCard>
            )}

            {calcTab === 'ratios' && (
              <SectionCard
                title="Financial Health Ratios"
                subtitle="Seven key ratios that diagnose your overall financial health — all in one place."
              >
                <FinancialHealthRatios/>
              </SectionCard>
            )}
          </div>
        )}

        {/* ── RESOURCES TAB ── */}
        {tab === 'resources' && (
          <ResourcesTab/>
        )}

        {/* Next section link */}
        <div
          onClick={() => navigate('/fun/debt-credit')}
          style={{
            marginTop:'2rem',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'1rem 1.25rem',
            background:RAISE,
            borderRadius:12,
            cursor:'pointer',
            transition:'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity='1'}
        >
          <div>
            <div style={{ fontSize:'0.6875rem', color:'rgba(255,255,255,0.4)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:3, fontFamily:UI }}>Next section</div>
            <div style={{ fontFamily:DISP, fontSize:'1rem', fontWeight:600, color:'#fff' }}>Debt & Credit</div>
          </div>
          <ArrowRight size={18} color={TEAL}/>
        </div>

        <p style={{ marginTop:'2rem', fontSize:'0.6875rem', color:T3, textAlign:'center', lineHeight:1.6, fontFamily:UI }}>
          For educational purposes only — not financial, tax, or legal advice.
        </p>
      </div>
    </div>
  );
}
