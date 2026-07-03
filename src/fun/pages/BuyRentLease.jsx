// ============================================================
// BuyRentLease.jsx — FUN Platform Decision Tool
// ============================================================
import { useState, useMemo } from 'react';
import {
  Home, Car, Wrench, Package, Settings, Monitor, MapPin, RefreshCw,
  ArrowLeft, Check, XCircle, Scale,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';

// ─── Design Tokens ─────────────────────────────────────────
const C = {
  bg:       '#1a1410',
  surf:     '#231c16',
  raise:    '#2d2419',
  b1:       '#2a2018',
  b2:       '#3d3028',
  t1:       '#f0e8d8',
  t2:       '#a89070',
  t3:       '#6b5540',
  teal:     '#00B4C6',
  tealDim:  'rgba(0,180,198,0.09)',
  tealBdr:  'rgba(0,180,198,0.22)',
  gold:     '#c9a96e',
  goldDim:  'rgba(201,169,110,0.08)',
  goldBdr:  'rgba(201,169,110,0.20)',
  up:       '#4a7c59',
  upDim:    'rgba(74,124,89,0.12)',
  down:     '#c0392b',
  downDim:  'rgba(192,57,43,0.10)',
};
const UI      = "'Inter', system-ui, sans-serif";
const DISPLAY = "'Playfair Display', Georgia, serif";
const MONO    = "'JetBrains Mono', 'Courier New', monospace";

// ─── Utilities ──────────────────────────────────────────────
function fmt(n) {
  if (typeof n !== 'number' || isNaN(n)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n);
}
function pct(n) { return `${n.toFixed(1)}%`; }
function calcPMT(principal, annualRate, months) {
  if (!principal || months <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

// ─── Slider CSS ─────────────────────────────────────────────
const SLIDER_CSS = `
  .brl-slider { -webkit-appearance:none; appearance:none; width:100%; height:4px;
    background:#2a2018; border-radius:2px; outline:none; cursor:pointer; }
  .brl-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none;
    width:16px; height:16px; border-radius:50%; background:#00B4C6;
    cursor:pointer; border:2px solid #1a1410; box-shadow:0 0 0 2px rgba(0,180,198,0.2); }
  .brl-slider::-moz-range-thumb { width:16px; height:16px; border-radius:50%;
    background:#00B4C6; cursor:pointer; border:2px solid #1a1410; }
`;

// ─── Shared Components ──────────────────────────────────────
function SliderRow({ label, value, min, max, step = 1, format, onChange, unit }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{ fontFamily: UI, fontSize: 12, color: C.t2, letterSpacing: '0.03em' }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.t1 }}>
          {format ? format(value) : `${value}${unit || ''}`}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)} className="brl-slider" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.t3 }}>{format ? format(min) : `${min}${unit || ''}`}</span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.t3 }}>{format ? format(max) : `${max}${unit || ''}`}</span>
      </div>
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.b1}`, marginBottom: 32, overflowX: 'auto' }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          padding: '10px 20px', background: 'transparent', border: 'none',
          borderBottom: `2px solid ${active === t.key ? C.teal : 'transparent'}`,
          color: active === t.key ? C.t1 : C.t2,
          fontFamily: UI, fontSize: 13, fontWeight: active === t.key ? 600 : 400,
          cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.14s ease', letterSpacing: '0.02em',
        }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function SectionLabel({ children, color }) {
  return (
    <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: color || C.teal, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function ProItem({ children }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 11 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.upDim,
        border: `1px solid rgba(74,124,89,0.3)`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <Check size={9} color={C.up} />
      </div>
      <span style={{ fontFamily: UI, fontSize: 13, lineHeight: 1.6, color: C.t2 }}>{children}</span>
    </div>
  );
}

function ConItem({ children }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 11 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.downDim,
        border: `1px solid rgba(192,57,43,0.25)`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <XCircle size={9} color={C.down} />
      </div>
      <span style={{ fontFamily: UI, fontSize: 13, lineHeight: 1.6, color: C.t2 }}>{children}</span>
    </div>
  );
}

function StatBadge({ label, value, accent }) {
  return (
    <div style={{ background: C.raise, border: `1px solid ${C.b2}`, borderRadius: 10,
      padding: '14px 18px', textAlign: 'center' }}>
      <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 900, color: accent || C.teal, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontFamily: UI, fontSize: 11, color: C.t3, marginTop: 5, letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
}

function BackButton({ onBack }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onBack} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
        background: hov ? C.raise : 'transparent', border: `1px solid ${hov ? C.b2 : C.b1}`,
        borderRadius: 8, padding: '8px 14px', cursor: 'pointer', transition: 'all 0.15s ease',
        marginBottom: 24 }}>
      <ArrowLeft size={14} color={C.t2} />
      <span style={{ fontFamily: UI, fontSize: 13, color: C.t2 }}>All Categories</span>
    </button>
  );
}

function WhenCard({ title, items, accent }) {
  return (
    <div style={{ background: C.raise, border: `1px solid ${C.b2}`, borderRadius: 12,
      padding: '20px 22px', flex: 1 }}>
      <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: accent, marginBottom: 14 }}>{title}</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: accent, flexShrink: 0, marginTop: 7 }} />
          <span style={{ fontFamily: UI, fontSize: 13, lineHeight: 1.55, color: C.t2 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.raise, border: `1px solid ${C.b2}`, borderRadius: 8,
      padding: '10px 14px' }}>
      <div style={{ fontFamily: UI, fontSize: 11, color: C.t3, marginBottom: 6 }}>Year {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontFamily: MONO, fontSize: 13, color: p.color, fontWeight: 600 }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.raise, border: `1px solid ${C.b2}`, borderRadius: 8,
      padding: '10px 14px' }}>
      <div style={{ fontFamily: UI, fontSize: 11, color: C.t3, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontFamily: MONO, fontSize: 13, color: p.fill, fontWeight: 600 }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}

function LearnSection({ title, intro, points }) {
  return (
    <div>
      <h3 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, color: C.t1, margin: '0 0 12px' }}>{title}</h3>
      <p style={{ fontFamily: UI, fontSize: 14, lineHeight: 1.7, color: C.t2, margin: '0 0 28px', maxWidth: 680 }}>{intro}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {points.map((pt, i) => (
          <div key={i} style={{ background: C.raise, border: `1px solid ${C.b2}`, borderRadius: 12,
            padding: '18px 20px' }}>
            <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: C.teal, marginBottom: 8 }}>{pt.label}</div>
            <div style={{ fontFamily: UI, fontSize: 13, lineHeight: 1.6, color: C.t2 }}>{pt.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TOOL_TABS = [
  { key: 'learn',   label: 'A. Learn'         },
  { key: 'calc',    label: 'B. Calculator'     },
  { key: 'pros',    label: 'C. Pros & Cons'    },
  { key: 'when',    label: 'D. When to Choose' },
  { key: 'verdict', label: 'E. Verdict'        },
];

// House tool gets extra tabs (affordability, true cost, loan types)
const HOUSE_TABS = [
  { key: 'learn',    label: 'A. Learn'              },
  { key: 'calc',     label: 'B. Rent vs Buy'         },
  { key: 'afford',   label: 'C. Affordability'       },
  { key: 'truecost', label: 'D. True Cost'           },
  { key: 'loans',    label: 'E. Loan Types'          },
  { key: 'pros',     label: 'F. Pros & Cons'         },
  { key: 'when',     label: 'G. When to Choose'      },
  { key: 'verdict',  label: 'H. Verdict'             },
];

// ─── Hub Categories ─────────────────────────────────────────
const CATEGORIES = [
  { id: 'house',        icon: Home,      title: 'Buy or Rent a House',       subtitle: 'Primary residence decision',    description: 'Break-even analysis, equity modeling, opportunity cost of down payment.', featured: true  },
  { id: 'car',          icon: Car,       title: 'Buy or Lease a Car',         subtitle: 'Vehicle acquisition strategy',  description: 'Total cost of ownership: depreciation, loan interest, and lease cost comparison.', featured: true  },
  { id: 'equipment',    icon: Wrench,    title: 'Buy or Rent Equipment',      subtitle: 'Professional & business tools', description: 'Determine when purchasing equipment beats rental based on usage frequency.', featured: false },
  { id: 'furniture',    icon: Package,   title: 'Buy or Rent Furniture',      subtitle: 'Home & office furnishings',     description: 'For renters and frequent movers — when buying beats rental costs.', featured: false },
  { id: 'tools',        icon: Settings,  title: 'Tools & Heavy Equipment',    subtitle: 'Buy, lease, or rent',           description: 'Three-way comparison for contractors evaluating ownership vs lease programs.', featured: false },
  { id: 'tech',         icon: Monitor,   title: 'Buy or Subscribe to Tech',   subtitle: 'Hardware & software decisions', description: 'Lifetime cost of owned technology versus subscription models and upgrade cycles.', featured: false },
  { id: 'vacation',     icon: MapPin,    title: 'Vacation Property',          subtitle: 'Buy or rent a vacation home',   description: 'True cost of vacation home ownership versus booking, with rental income modeling.', featured: false },
  { id: 'subscription', icon: RefreshCw, title: 'Buy Once vs Subscribe',      subtitle: 'Ownership vs subscription',     description: 'Universal calculator — find the exact break-even month for any product.', featured: false },
];

// ─── Hub View ───────────────────────────────────────────────
function HubView({ onSelect }) {
  const featured = CATEGORIES.filter(c => c.featured);
  const regular  = CATEGORIES.filter(c => !c.featured);

  return (
    <div style={{ padding: '40px 40px 60px', maxWidth: 1140, margin: '0 auto' }}>
      <style>{SLIDER_CSS}</style>

      <div style={{ marginBottom: 44 }}>
        <SectionLabel>Financial Decision Tools</SectionLabel>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(26px,3.2vw,40px)', fontWeight: 700, color: C.t1, margin: '0 0 12px', lineHeight: 1.12 }}>
          Buy, Rent, or Lease
        </h1>
        <p style={{ fontFamily: UI, fontSize: 14, color: C.t2, maxWidth: 520, lineHeight: 1.65, margin: 0 }}>
          Interactive calculators built on real financial formulas. Make the right decision for every major acquisition in your life.
        </p>
      </div>

      {/* Featured */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20 }}>
        {featured.map(cat => {
          const Icon = cat.icon;
          const [hov, setHov] = useState(false);
          return (
            <div key={cat.id} onClick={() => onSelect(cat.id)}
              onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
              style={{ background: C.surf, border: `1px solid ${hov ? C.tealBdr : C.b1}`,
                borderRadius: 16, padding: '28px 30px', cursor: 'pointer',
                transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
                boxShadow: hov ? '0 8px 32px rgba(0,0,0,0.35)' : '0 2px 12px rgba(0,0,0,0.2)',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: C.tealDim,
                  border: `1px solid ${C.tealBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={C.teal} />
                </div>
                <div>
                  <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: C.teal, marginBottom: 3 }}>Featured Tool</div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 700, color: C.t1, lineHeight: 1.15 }}>{cat.title}</div>
                </div>
              </div>
              <p style={{ fontFamily: UI, fontSize: 13, lineHeight: 1.65, color: C.t2, margin: '0 0 20px' }}>{cat.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: UI, fontSize: 11, color: C.t3 }}>{cat.subtitle}</span>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: hov ? C.teal : C.tealDim,
                  border: `1px solid ${C.tealBdr}`, borderRadius: 8,
                  padding: '7px 14px', transition: 'background 0.18s ease' }}>
                  <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600,
                    color: hov ? C.bg : C.teal, transition: 'color 0.18s ease' }}>Open Calculator</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Regular grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {regular.map(cat => {
          const Icon = cat.icon;
          const [hov, setHov] = useState(false);
          return (
            <div key={cat.id} onClick={() => onSelect(cat.id)}
              onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
              style={{ background: C.surf, border: `1px solid ${hov ? C.tealBdr : C.b1}`,
                borderRadius: 14, padding: '20px 22px', cursor: 'pointer',
                transition: 'border-color 0.18s ease', }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.tealDim,
                border: `1px solid ${C.tealBdr}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={17} color={C.teal} />
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: C.t1, marginBottom: 6, lineHeight: 1.2 }}>{cat.title}</div>
              <p style={{ fontFamily: UI, fontSize: 12, lineHeight: 1.6, color: C.t3, margin: '0 0 14px' }}>{cat.description}</p>
              <span style={{ fontFamily: UI, fontSize: 11, color: C.teal, fontWeight: 600 }}>Open Tool →</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOUSE TOOL
// ═══════════════════════════════════════════════════════════════
function buildHouseData(price, dpPct, rate, termYrs, rent0, appPct, rentIncPct, investRetPct) {
  const dp = price * dpPct / 100;
  const principal = price - dp;
  const monthly = calcPMT(principal, rate, termYrs * 12);
  const propTaxMo = price * 0.012 / 12;
  const maintMo   = price * 0.010 / 12;

  let balance   = principal;
  let homeValue = price;
  let cumBuy    = dp;
  let cumRent   = 0;
  let rentNow   = rent0;
  const data    = [];

  for (let yr = 1; yr <= 30; yr++) {
    for (let mo = 0; mo < 12; mo++) {
      const interest  = balance * (rate / 100 / 12);
      const prinPaid  = Math.min(monthly - interest, balance);
      balance         = Math.max(0, balance - prinPaid);
      cumBuy         += monthly + propTaxMo + maintMo;
    }
    homeValue *= (1 + appPct / 100);
    cumRent   += rentNow * 12;
    rentNow   *= (1 + rentIncPct / 100);

    const oppCost = dp * (Math.pow(1 + investRetPct / 100, yr) - 1);
    const equity  = homeValue - Math.max(0, balance);
    const netBuy  = cumBuy - equity + oppCost;

    data.push({ year: yr, Buy: Math.round(netBuy), Rent: Math.round(cumRent), equity: Math.round(equity) });
  }

  const crossover = data.find(d => d.Buy <= d.Rent);
  return { data, breakEven: crossover?.year ?? null, finalEquity: data[29]?.equity ?? 0 };
}

function HouseTool({ onBack }) {
  const [tab, setTab] = useState('learn');
  const [price,      setPrice]      = useState(400000);
  const [dpPct,      setDpPct]      = useState(10);
  const [rate,       setRate]       = useState(6.8);
  const [termYrs,    setTermYrs]    = useState(30);
  const [rent0,      setRent0]      = useState(2200);
  const [appPct,     setAppPct]     = useState(3);
  const [rentIncPct, setRentIncPct] = useState(3);
  const [investRet,  setInvestRet]  = useState(7);

  // ── Affordability tab state ──────────────────────────────
  const [affIncome,  setAffIncome]  = useState(90000);
  const [affDebt,    setAffDebt]    = useState(500);
  const [affRate,    setAffRate]    = useState(7.0);
  const [affDown,    setAffDown]    = useState(60000);
  const [affTaxes,   setAffTaxes]   = useState(400);
  const [affIns,     setAffIns]     = useState(150);

  // ── True Cost tab state ──────────────────────────────────
  const [tcPrice,    setTcPrice]    = useState(400000);
  const [tcRate,     setTcRate]     = useState(7.0);
  const [tcDown,     setTcDown]     = useState(20);
  const [tcYears,    setTcYears]    = useState(10);

  // ── Affordability computed ────────────────────────────────
  const affMo       = affIncome / 12;
  const affMoRate   = affRate / 100 / 12;
  const affMaxPITI  = Math.min(affMo * 0.28, Math.max(0, affMo * 0.36 - affDebt - affTaxes - affIns));
  const affMaxLoan  = affMaxPITI > 0
    ? affMaxPITI * ((Math.pow(1 + affMoRate, 360) - 1) / (affMoRate * Math.pow(1 + affMoRate, 360)))
    : 0;
  const affMaxPrice = affMaxLoan + affDown;

  // ── True Cost computed ────────────────────────────────────
  const tcLoan      = tcPrice * (1 - tcDown / 100);
  const tcMoRate    = tcRate / 100 / 12;
  const tcMortgage  = tcLoan > 0
    ? tcLoan * (tcMoRate * Math.pow(1 + tcMoRate, 360)) / (Math.pow(1 + tcMoRate, 360) - 1)
    : 0;
  const tcPropTax   = tcPrice * 0.012 / 12;
  const tcInsM      = tcPrice * 0.005 / 12;
  const tcMaint     = tcPrice * 0.01  / 12;
  const tcPMI       = tcDown < 20 ? (tcLoan * 0.008 / 12) : 0;
  const tcHOA       = 200;
  const tcTotalMo   = tcMortgage + tcPropTax + tcInsM + tcMaint + tcPMI + tcHOA;
  const tcClosing   = tcPrice * 0.03;
  const tcTotalPaid = tcClosing + tcPrice * (tcDown / 100) + tcTotalMo * 12 * tcYears;
  const tcAppVal    = tcPrice * Math.pow(1.04, tcYears);
  const tcBal       = (() => {
    let b = tcLoan;
    for (let i = 0; i < tcYears * 12; i++) {
      const int = b * tcMoRate;
      b = Math.max(0, b - (tcMortgage - int));
    }
    return b;
  })();
  const tcEquity    = tcAppVal - tcBal;

  const { data, breakEven, finalEquity } = useMemo(
    () => buildHouseData(price, dpPct, rate, termYrs, rent0, appPct, rentIncPct, investRet),
    [price, dpPct, rate, termYrs, rent0, appPct, rentIncPct, investRet]
  );

  const monthlyPayment = calcPMT(price * (1 - dpPct / 100), rate, termYrs * 12);
  const dp = price * dpPct / 100;
  const yr30buy  = data[29]?.Buy  ?? 0;
  const yr30rent = data[29]?.Rent ?? 0;

  const verdictBuy = yr30buy < yr30rent;
  const diff30 = Math.abs(yr30buy - yr30rent);

  return (
    <div style={{ padding: '36px 40px 60px', maxWidth: 1140, margin: '0 auto' }}>
      <style>{SLIDER_CSS}</style>
      <BackButton onBack={onBack} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: C.tealDim,
          border: `1px solid ${C.tealBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Home size={19} color={C.teal} />
        </div>
        <div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, color: C.t1, margin: 0, lineHeight: 1.15 }}>Buy or Rent a House</h2>
          <p style={{ fontFamily: UI, fontSize: 13, color: C.t3, margin: '4px 0 0' }}>Primary residence financial analysis</p>
        </div>
      </div>

      <TabBar tabs={HOUSE_TABS} active={tab} onChange={setTab} />

      {tab === 'learn' && (
        <LearnSection
          title="How the Math Really Works"
          intro="Buying a home is the largest financial decision most people ever make — yet most compare only rent vs. mortgage payment. The real analysis includes equity growth, appreciation, property taxes, maintenance, and the opportunity cost of your down payment sitting in the home rather than invested in the market."
          points={[
            { label: 'Monthly Mortgage (PMT)', body: 'Your payment is calculated as P × r(1+r)ⁿ / ((1+r)ⁿ−1), where P is loan principal, r is the monthly rate, and n is total months. Early payments are mostly interest; equity builds faster later.' },
            { label: 'Equity Accumulation', body: 'Equity = current home value minus remaining loan balance. As you pay down principal and the home appreciates, equity compounds. After 30 years you own the asset outright.' },
            { label: 'Opportunity Cost', body: 'Your down payment could instead be invested in the market. This calculator subtracts the foregone investment growth to give you a true net cost of buying versus renting.' },
            { label: 'Break-Even Year', body: 'The year when cumulative net cost of buying (money paid minus equity built plus opportunity cost) drops below cumulative rent payments. Before that year, renting has been cheaper in total dollars spent.' },
            { label: 'Property Tax & Maintenance', body: 'This calculator assumes 1.2% annual property tax and 1% maintenance cost, both based on home value. Actual figures vary by location. These are real costs renters do not pay.' },
            { label: 'Rent Increases', body: 'Rent rarely stays flat. A 3% annual increase is historically typical. Over 10 years, a $2,000 rent becomes $2,688/month — which strengthens the financial case for buying over time.' },
          ]}
        />
      )}

      {tab === 'calc' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 28, alignItems: 'start' }}>
          <div>
            <SectionLabel>Home Purchase Inputs</SectionLabel>
            <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '24px 22px', marginBottom: 16 }}>
              <SliderRow label="Home Price" value={price} min={100000} max={1500000} step={10000} format={fmt} onChange={setPrice} />
              <SliderRow label="Down Payment" value={dpPct} min={3} max={30} step={0.5} unit="%" onChange={setDpPct} />
              <SliderRow label="Interest Rate" value={rate} min={2} max={12} step={0.1} unit="%" onChange={setRate} />
              <SliderRow label="Loan Term" value={termYrs} min={10} max={30} step={5} unit=" yrs" onChange={setTermYrs} />
            </div>
            <SectionLabel>Market & Comparison Inputs</SectionLabel>
            <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '24px 22px' }}>
              <SliderRow label="Monthly Rent (equivalent home)" value={rent0} min={500} max={8000} step={50} format={fmt} onChange={setRent0} />
              <SliderRow label="Annual Home Appreciation" value={appPct} min={0} max={8} step={0.5} unit="%" onChange={setAppPct} />
              <SliderRow label="Annual Rent Increase" value={rentIncPct} min={0} max={8} step={0.5} unit="%" onChange={setRentIncPct} />
              <SliderRow label="Investment Return (opportunity cost)" value={investRet} min={2} max={12} step={0.5} unit="%" onChange={setInvestRet} />
            </div>
          </div>

          <div>
            <SectionLabel>Results</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              <StatBadge label="Monthly Payment" value={fmt(monthlyPayment)} accent={C.gold} />
              <StatBadge label="Break-Even Year" value={breakEven ? `Yr ${breakEven}` : '30+'} accent={breakEven && breakEven <= 10 ? C.up : C.teal} />
              <StatBadge label="30-yr Equity" value={`${fmt(finalEquity)}`} accent={C.teal} />
            </div>
            <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '20px 16px' }}>
              <div style={{ fontFamily: UI, fontSize: 11, color: C.t3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                Net Cost: Buying vs. Renting Over 30 Years
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.b1} />
                  <XAxis dataKey="year" tick={{ fill: C.t3, fontFamily: MONO, fontSize: 10 }} tickLine={false} label={{ value: 'Year', position: 'insideBottom', offset: -2, fill: C.t3, fontFamily: UI, fontSize: 10 }} />
                  <YAxis tickFormatter={n => `$${Math.round(n/1000)}k`} tick={{ fill: C.t3, fontFamily: MONO, fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ fontFamily: UI, fontSize: 12, color: C.t2 }} />
                  {breakEven && <ReferenceLine x={breakEven} stroke={C.up} strokeDasharray="4 3" label={{ value: 'Break-even', fill: C.up, fontFamily: UI, fontSize: 10, position: 'top' }} />}
                  <Line type="monotone" dataKey="Buy" stroke={C.gold} strokeWidth={2} dot={false} name="Buy (net cost)" />
                  <Line type="monotone" dataKey="Rent" stroke={C.teal} strokeWidth={2} dot={false} name="Rent (cumulative)" />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12, padding: '10px 14px', background: C.raise, borderRadius: 8,
                borderLeft: `3px solid ${C.teal}` }}>
                <span style={{ fontFamily: UI, fontSize: 12, color: C.t2 }}>
                  <b style={{ color: C.t1 }}>Down payment:</b> {fmt(dp)} &nbsp;·&nbsp;
                  <b style={{ color: C.t1 }}>Total 30-yr rent:</b> {fmt(yr30rent)} &nbsp;·&nbsp;
                  <b style={{ color: C.t1 }}>30-yr net buy cost:</b> {fmt(yr30buy)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'pros' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '24px 24px' }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, marginBottom: 18 }}>Pros of Buying</div>
            <ProItem>Build equity with every mortgage payment — money renting never returns</ProItem>
            <ProItem>Benefit from home appreciation over time</ProItem>
            <ProItem>Mortgage interest and property taxes may be tax-deductible</ProItem>
            <ProItem>Fixed-rate mortgage payment never increases</ProItem>
            <ProItem>Freedom to renovate, decorate, and modify</ProItem>
            <ProItem>Forced savings mechanism — equity acts like a long-term asset</ProItem>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.down, marginBottom: 14, marginTop: 22 }}>Cons of Buying</div>
            <ConItem>Large upfront capital required (down payment + closing costs 2–5%)</ConItem>
            <ConItem>Responsible for all maintenance and repairs</ConItem>
            <ConItem>Less flexibility to move quickly for jobs or life changes</ConItem>
            <ConItem>Illiquid asset — value is tied up and slow to access</ConItem>
            <ConItem>Property taxes, HOA, and insurance add significant monthly cost</ConItem>
          </div>
          <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '24px 24px' }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.teal, marginBottom: 18 }}>Pros of Renting</div>
            <ProItem>No down payment frees up capital for investment</ProItem>
            <ProItem>Maximum geographic flexibility — move within 30–60 days</ProItem>
            <ProItem>Landlord covers maintenance, repairs, and major appliances</ProItem>
            <ProItem>No exposure to home value declines</ProItem>
            <ProItem>Lower upfront costs — typically first + last month + security deposit</ProItem>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.down, marginBottom: 14, marginTop: 22 }}>Cons of Renting</div>
            <ConItem>No equity built — 100% of rent is a sunk cost</ConItem>
            <ConItem>Rent can increase annually — often beyond your control</ConItem>
            <ConItem>Landlord can sell the property or not renew your lease</ConItem>
            <ConItem>Limited ability to customize or renovate your space</ConItem>
            <ConItem>No participation in local real estate appreciation</ConItem>
          </div>
        </div>
      )}

      {tab === 'when' && (
        <div style={{ display: 'flex', gap: 20 }}>
          <WhenCard title="When Buying Makes Sense" accent={C.gold} items={[
            'You plan to stay in the same location for 7+ years',
            'You have 10–20% saved for a down payment without depleting savings',
            'Local home prices are at or below the rent-to-price ratio of 20:1',
            'Your income is stable and you qualify for a competitive rate',
            'You want long-term stability, community roots, and full control of your home',
            'Local rent increases consistently exceed 3% per year',
          ]} />
          <WhenCard title="When Renting Makes Sense" accent={C.teal} items={[
            'You expect to relocate within the next 1–5 years',
            'Home prices in your market are significantly above historical rent ratios',
            'You want to invest your would-be down payment in the stock market',
            'Your income or career situation is in transition',
            'You live in a high-cost city where rent-to-own ratio strongly favors renting',
            'You value flexibility over financial optimization',
          ]} />
        </div>
      )}

      {tab === 'verdict' && (
        <div>
          <div style={{ background: C.surf, border: `1px solid ${verdictBuy ? C.goldBdr : C.tealBdr}`,
            borderRadius: 16, padding: '32px 36px', marginBottom: 24 }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: verdictBuy ? C.gold : C.teal, marginBottom: 10 }}>
              Personalized Verdict
            </div>
            <h3 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, color: C.t1, margin: '0 0 12px' }}>
              {verdictBuy ? 'Buying comes out ahead over 30 years' : 'Renting has the financial edge with your inputs'}
            </h3>
            <p style={{ fontFamily: UI, fontSize: 14, lineHeight: 1.7, color: C.t2, margin: '0 0 24px', maxWidth: 660 }}>
              {verdictBuy
                ? `Over 30 years, buying saves you ${fmt(diff30)} compared to renting when accounting for equity built and home appreciation at ${pct(appPct)}/year. Your break-even point is Year ${breakEven ?? 'unknown'} — before that year, renting would have been cheaper in total dollars out.`
                : `With a ${pct(appPct)} appreciation rate and ${pct(investRet)} investment return assumption, the opportunity cost of your down payment keeps renting ahead over 30 years by ${fmt(diff30)}. Lowering the investment return assumption or increasing appreciation could tip this in favor of buying.`
              }
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <StatBadge label="Monthly Mortgage" value={fmt(monthlyPayment)} accent={C.gold} />
              <StatBadge label="Down Payment Required" value={fmt(dp)} accent={C.t2} />
              <StatBadge label="Break-Even" value={breakEven ? `Year ${breakEven}` : 'After Yr 30'} accent={breakEven && breakEven <= 10 ? C.up : C.teal} />
              <StatBadge label="Equity at 30 yrs" value={fmt(finalEquity)} accent={C.teal} />
            </div>
          </div>
          <div style={{ background: C.raise, border: `1px solid ${C.b2}`, borderRadius: 12, padding: '18px 22px' }}>
            <span style={{ fontFamily: UI, fontSize: 12, color: C.t3, lineHeight: 1.65 }}>
              This analysis assumes 1.2% property tax + 1% annual maintenance based on home value. Closing costs are not included. Actual results will vary based on local market conditions, loan terms, and individual tax situation. Consult a licensed financial advisor for personalized guidance.
            </span>
          </div>
        </div>
      )}

      {/* ── C. AFFORDABILITY ─────────────────────────────────── */}
      {tab === 'afford' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24 }}>
          {/* Inputs */}
          <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '24px 22px' }}>
            <SectionLabel color={C.teal}>Your Financial Profile</SectionLabel>
            <SliderRow label="Annual Gross Income" value={affIncome} min={30000} max={500000} step={5000} format={fmt} onChange={setAffIncome} />
            <SliderRow label="Monthly Debt Payments (car, student, cards)" value={affDebt} min={0} max={3000} step={50} format={v => fmt(v)+'/mo'} onChange={setAffDebt} />
            <SliderRow label="Mortgage Interest Rate" value={affRate} min={3.0} max={12.0} step={0.1} format={v => v.toFixed(1)+'%'} onChange={setAffRate} />
            <SliderRow label="Down Payment Available" value={affDown} min={5000} max={500000} step={5000} format={fmt} onChange={setAffDown} />
            <SliderRow label="Est. Monthly Property Tax" value={affTaxes} min={0} max={3000} step={25} format={v => fmt(v)+'/mo'} onChange={setAffTaxes} />
            <SliderRow label="Est. Monthly Insurance" value={affIns} min={50} max={500} step={10} format={v => fmt(v)+'/mo'} onChange={setAffIns} />
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '24px 22px' }}>
              <div style={{ fontFamily: UI, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.t3, marginBottom: 10 }}>Maximum Affordable Home Price</div>
              <div style={{ fontFamily: DISPLAY, fontSize: '2.25rem', fontWeight: 700, color: C.gold, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{fmt(affMaxPrice)}</div>
              <div style={{ fontFamily: UI, fontSize: 12, color: C.t2, marginTop: 6 }}>Based on 28% front-end rule · {fmt(affDown)} down payment included</div>

              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { rule: '28% Front-End Rule',  limit: affMo * 0.28,          desc: 'Max PITI (mortgage + taxes + insurance) as % of gross monthly income' },
                  { rule: '36% Back-End Rule',   limit: affMo * 0.36 - affDebt, desc: 'Max total debt payments including all monthly obligations' },
                  { rule: 'Conservative (25%)', limit: affMo * 0.25,           desc: 'Dave Ramsey / conservative guideline — more financial breathing room' },
                ].map(r => {
                  const ratio = Math.min(1, Math.max(0, affMaxPITI / Math.max(1, r.limit)));
                  const ok = affMaxPITI <= r.limit;
                  return (
                    <div key={r.rule} style={{ background: C.raise, borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: C.t1 }}>{r.rule}</span>
                        <span style={{ fontFamily: MONO, fontSize: 12, color: ok ? C.up : C.down, fontWeight: 700 }}>{fmt(r.limit)}/mo max</span>
                      </div>
                      <div style={{ height: 5, background: C.b2, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${ratio * 100}%`, background: ok ? C.up : C.down, borderRadius: 3, transition: 'width 0.4s' }} />
                      </div>
                      <div style={{ fontFamily: UI, fontSize: 11, color: C.t3, marginTop: 5 }}>{r.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.down, marginBottom: 14 }}>What Kills Affordability</div>
              {[
                { label: 'Rate +1%', impact: 'Cuts buying power by ~10%' },
                { label: 'Existing debt $500/mo', impact: 'Reduces max loan by ~$75K' },
                { label: 'Skipping 20% down', impact: 'Adds PMI + higher rate risk' },
                { label: 'Buying at the top of budget', impact: 'No buffer for job loss or rate reset' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                  <XCircle size={14} color={C.down} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontFamily: UI, fontSize: 13, color: C.t1, fontWeight: 600 }}>{r.label}: </span>
                    <span style={{ fontFamily: UI, fontSize: 13, color: C.t2 }}>{r.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── D. TRUE COST OF OWNERSHIP ────────────────────────── */}
      {tab === 'truecost' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24 }}>
          {/* Inputs */}
          <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '24px 22px' }}>
            <SectionLabel color={C.teal}>Home Details</SectionLabel>
            <SliderRow label="Home Purchase Price" value={tcPrice} min={100000} max={2000000} step={10000} format={fmt} onChange={setTcPrice} />
            <SliderRow label="Mortgage Rate" value={tcRate} min={3.0} max={12.0} step={0.1} format={v => v.toFixed(1)+'%'} onChange={setTcRate} />
            <SliderRow label="Down Payment" value={tcDown} min={3} max={40} format={v => v+'%'} onChange={setTcDown} />
            <SliderRow label="Holding Period" value={tcYears} min={1} max={30} format={v => v+' years'} onChange={setTcYears} />

            <div style={{ marginTop: 24, padding: '1rem', background: C.raise, borderRadius: 10 }}>
              <div style={{ fontFamily: UI, fontSize: 11, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>One-Time Buying Costs</div>
              {[
                { label: 'Down Payment',       value: tcPrice * (tcDown / 100) },
                { label: 'Closing Costs (~3%)', value: tcClosing                },
                { label: 'Moving + Setup',      value: 5000                     },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: UI, fontSize: 12, color: C.t2 }}>{r.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: C.t1 }}>{fmt(r.value)}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${C.b2}`, marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: C.t1 }}>Total to Close</span>
                <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.gold }}>{fmt(tcPrice * (tcDown / 100) + tcClosing + 5000)}</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatBadge label="True Monthly Cost" value={fmt(tcTotalMo)+'/mo'} accent={C.gold} />
              <StatBadge label={`Projected Equity (${tcYears} yr)`} value={fmt(tcEquity)} accent={C.up} />
            </div>

            <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.teal, marginBottom: 16 }}>Monthly Cost Breakdown</div>
              {[
                { label: 'Mortgage (P+I)',              mo: tcMortgage, icon: '🏠' },
                { label: 'Property Tax',                mo: tcPropTax,  icon: '🏛' },
                { label: 'Homeowners Insurance',        mo: tcInsM,     icon: '🛡' },
                { label: 'Maintenance & Repairs (1%)',  mo: tcMaint,    icon: '🔧' },
                { label: 'HOA (est.)',                  mo: tcHOA,      icon: '🏘' },
                ...(tcPMI > 0 ? [{ label: 'PMI (< 20% down)', mo: tcPMI, icon: '⚠️' }] : []),
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.b1}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{c.icon}</span>
                    <span style={{ fontFamily: UI, fontSize: 12.5, color: C.t2 }}>{c.label}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: C.t1 }}>{fmt(c.mo)}/mo</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: C.t3 }}>{fmt(c.mo * 12)}/yr</div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}>
                <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: C.t1 }}>Total Monthly</span>
                <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.gold }}>{fmt(tcTotalMo)}/mo</span>
              </div>
            </div>

            <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.teal, marginBottom: 14 }}>Over {tcYears} Years</div>
              {[
                { label: 'Total Cash Out-of-Pocket',                        value: fmt(tcTotalPaid), color: C.down },
                { label: `Home Value at ${tcYears} yrs (4% appreciation)`, value: fmt(tcAppVal),    color: C.up   },
                { label: 'Projected Equity (value − remaining loan)',       value: fmt(tcEquity),    color: C.up   },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.b1}` }}>
                  <span style={{ fontFamily: UI, fontSize: 12.5, color: C.t2 }}>{r.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── E. LOAN TYPES & CONCEPTS ─────────────────────────── */}
      {tab === 'loans' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              {
                title: 'Conventional Loan', badge: 'Most Common', badgeColor: C.up,
                points: [
                  'Requires 620+ credit score (740+ for best rates)',
                  '20% down avoids PMI; 3–5% programs available',
                  'Conforming limit: $766,550 (2024) — jumbo above this',
                  'Fixed or adjustable rate options',
                  'Best for: buyers with strong credit and stable income',
                ],
              },
              {
                title: 'FHA Loan', badge: 'Low Down Payment', badgeColor: C.gold,
                points: [
                  '3.5% down with 580+ credit score',
                  'MIP (mortgage insurance) required for life of loan if < 10% down',
                  'Loan limits vary by county (~$498K–$1.15M in 2024)',
                  'More flexible debt-to-income ratios allowed',
                  'Best for: first-time buyers with limited savings or lower credit',
                ],
              },
              {
                title: 'VA Loan', badge: 'Veterans Only', badgeColor: '#818cf8',
                points: [
                  '0% down payment required — no PMI ever',
                  'Competitive rates, flexible credit requirements',
                  'One-time funding fee (1.25–3.3%) rolled into loan',
                  'Must be primary residence; service requirement applies',
                  'Best for: eligible veterans and active service members',
                ],
              },
              {
                title: 'Key Ratios to Know', badge: 'Core Concepts', badgeColor: C.t3,
                points: [
                  'DTI (Debt-to-Income): total monthly debt ÷ gross income',
                  'LTV (Loan-to-Value): loan amount ÷ home value',
                  'Front-end ratio: housing costs only ≤ 28%',
                  'Back-end ratio: all debt ≤ 36–43%',
                  'DSCR: investment properties — NOI ÷ debt service ≥ 1.25',
                ],
              },
            ].map(c => (
              <div key={c.title} style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '22px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
                  <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 700, color: C.t1, lineHeight: 1.15 }}>{c.title}</div>
                  <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.badgeColor, background: `${c.badgeColor}18`, border: `1px solid ${c.badgeColor}33`, borderRadius: 5, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>{c.badge}</span>
                </div>
                {c.points.map(p => (
                  <div key={p} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.gold, marginTop: 7, flexShrink: 0 }} />
                    <span style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.6 }}>{p}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Fixed vs ARM explainer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              {
                title: 'Fixed-Rate Mortgage', accent: C.teal,
                desc: 'Your interest rate and monthly payment are locked for the life of the loan — typically 15 or 30 years. Provides certainty and protection against rising rates.',
                pros: ['Payment never changes regardless of market rates', 'Easy to budget long-term', 'Best when rates are historically low'],
                cons: ['Higher starting rate than ARM', 'Less beneficial if you plan to sell in < 7 years'],
              },
              {
                title: 'Adjustable-Rate Mortgage (ARM)', accent: C.gold,
                desc: 'Rate is fixed for an initial period (3, 5, 7, or 10 years), then adjusts annually based on a benchmark index plus a margin.',
                pros: ['Lower initial rate than fixed', 'Beneficial if you sell before adjustment period', 'Rate caps limit maximum exposure'],
                cons: ['Payment can increase significantly after initial period', 'Harder to budget long-term', 'Risk in rising rate environments'],
              },
            ].map(c => (
              <div key={c.title} style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '22px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 4, height: 20, borderRadius: 2, background: c.accent, flexShrink: 0 }} />
                  <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: C.t1 }}>{c.title}</div>
                </div>
                <p style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.65, margin: '0 0 14px' }}>{c.desc}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, color: C.up, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>When it works</div>
                    {c.pros.map(p => <div key={p} style={{ display: 'flex', gap: 6, marginBottom: 5 }}><Check size={12} color={C.up} style={{ flexShrink: 0, marginTop: 2 }}/><span style={{ fontFamily: UI, fontSize: 12, color: C.t2, lineHeight: 1.5 }}>{p}</span></div>)}
                  </div>
                  <div>
                    <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, color: C.down, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Watch out for</div>
                    {c.cons.map(p => <div key={p} style={{ display: 'flex', gap: 6, marginBottom: 5 }}><XCircle size={12} color={C.down} style={{ flexShrink: 0, marginTop: 2 }}/><span style={{ fontFamily: UI, fontSize: 12, color: C.t2, lineHeight: 1.5 }}>{p}</span></div>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CAR TOOL
// ═══════════════════════════════════════════════════════════════
function buildCarData(buyPrice, buyDown, buyRate, buyTermMos, annIns, annMaint, leaseMo, leaseTerm, leaseCapRed, leaseFees) {
  const loanPrin = buyPrice - buyDown;
  const monthly  = calcPMT(loanPrin, buyRate, buyTermMos);

  function carValue(yrs) {
    let v = buyPrice;
    for (let y = 0; y < yrs; y++) {
      v *= y === 0 ? 0.85 : y === 1 ? 0.88 : y <= 4 ? 0.90 : 0.92;
    }
    return Math.max(v, buyPrice * 0.05);
  }

  function buyTCO(yrs) {
    const months = yrs * 12;
    let balance = loanPrin;
    let paid    = buyDown;
    for (let m = 0; m < Math.min(months, buyTermMos); m++) {
      const interest = balance * (buyRate / 100 / 12);
      const prin     = Math.min(monthly - interest, balance);
      balance = Math.max(0, balance - prin);
      paid   += monthly;
    }
    paid += annIns * yrs + annMaint * yrs;
    return Math.round(paid - carValue(yrs));
  }

  function leaseTCO(yrs) {
    const months = yrs * 12;
    const completedLeases = Math.floor(months / leaseTerm);
    const rem = months % leaseTerm;
    let total = 0;
    for (let i = 0; i < completedLeases; i++) {
      total += leaseCapRed + leaseMo * leaseTerm + leaseFees;
    }
    if (rem > 0) total += leaseCapRed + leaseMo * rem;
    total += annIns * yrs;
    return Math.round(total);
  }

  const barData = [
    { period: '3 Years', Buy: buyTCO(3), Lease: leaseTCO(3) },
    { period: '5 Years', Buy: buyTCO(5), Lease: leaseTCO(5) },
    { period: '7 Years', Buy: buyTCO(7), Lease: leaseTCO(7) },
    { period: '10 Years', Buy: buyTCO(10), Lease: leaseTCO(10) },
  ];

  return { barData, tco3buy: buyTCO(3), tco3lease: leaseTCO(3), tco5buy: buyTCO(5), tco5lease: leaseTCO(5) };
}

function CarTool({ onBack }) {
  const [tab, setTab] = useState('learn');
  const [buyPrice,   setBuyPrice]   = useState(35000);
  const [buyDown,    setBuyDown]    = useState(5000);
  const [buyRate,    setBuyRate]    = useState(6.5);
  const [buyTermMos, setBuyTermMos] = useState(60);
  const [annIns,     setAnnIns]     = useState(1800);
  const [annMaint,   setAnnMaint]   = useState(800);
  const [leaseMo,    setLeaseMo]    = useState(450);
  const [leaseTerm,  setLeaseTerm]  = useState(36);
  const [leaseCapRed,setLeaseCapRed]= useState(3000);
  const [leaseFees,  setLeaseFees]  = useState(800);

  const { barData, tco3buy, tco3lease, tco5buy, tco5lease } = useMemo(
    () => buildCarData(buyPrice, buyDown, buyRate, buyTermMos, annIns, annMaint, leaseMo, leaseTerm, leaseCapRed, leaseFees),
    [buyPrice, buyDown, buyRate, buyTermMos, annIns, annMaint, leaseMo, leaseTerm, leaseCapRed, leaseFees]
  );

  const monthlyBuy = calcPMT(buyPrice - buyDown, buyRate, buyTermMos);
  const buyWins3 = tco3buy < tco3lease;
  const buyWins5 = tco5buy < tco5lease;

  return (
    <div style={{ padding: '36px 40px 60px', maxWidth: 1140, margin: '0 auto' }}>
      <style>{SLIDER_CSS}</style>
      <BackButton onBack={onBack} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: C.tealDim,
          border: `1px solid ${C.tealBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Car size={19} color={C.teal} />
        </div>
        <div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, color: C.t1, margin: 0, lineHeight: 1.15 }}>Buy or Lease a Car</h2>
          <p style={{ fontFamily: UI, fontSize: 13, color: C.t3, margin: '4px 0 0' }}>Total cost of ownership analysis</p>
        </div>
      </div>

      <TabBar tabs={TOOL_TABS} active={tab} onChange={setTab} />

      {tab === 'learn' && (
        <LearnSection
          title="The Math Behind Buying vs. Leasing"
          intro="Most car shoppers compare monthly payments — but that comparison is misleading. Leases have lower payments because you are only paying for the depreciation during the lease period, not the full car. The real question is total cost of ownership: every dollar you spend minus any value you retain at the end."
          points={[
            { label: 'Depreciation Curve', body: 'New vehicles lose roughly 15% in year one, 12% in year two, and 8–10% per year after. A $40,000 car is worth ~$21,000 after 5 years. When you buy, you absorb this loss. When you lease, the dealer prices it in through residual value.' },
            { label: 'Money Factor vs. APR', body: 'Leases use a "money factor" instead of an interest rate. Convert it by multiplying by 2,400 to get the equivalent APR. A money factor of 0.00250 = 6.0% APR. Always compare apples to apples.' },
            { label: 'Total Cost of Ownership', body: 'TCO = all payments + down payment + fees + insurance + maintenance − final vehicle value. Buying wins long-term because once the loan ends, you stop making payments but still own an asset.' },
            { label: 'Lease Penalty Costs', body: 'Leases charge per-mile overages (typically $0.15–$0.25/mile), wear-and-tear fees, and a disposition fee at turn-in ($300–$500). These can add thousands to your actual lease cost.' },
            { label: 'Break-Even Horizon', body: 'Buying typically becomes cheaper than leasing around year 4–6 — when loan payments end but ownership continues. If you always drive new cars every 3 years, leasing may be more economical for your lifestyle.' },
            { label: 'Insurance Difference', body: 'Leased vehicles require full comprehensive and collision coverage at higher limits. This typically adds $200–$400/year versus a purchased vehicle. Factor this into your comparison.' },
          ]}
        />
      )}

      {tab === 'calc' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 28, alignItems: 'start' }}>
          <div>
            <SectionLabel color={C.gold}>Buy Inputs</SectionLabel>
            <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '22px 20px', marginBottom: 16 }}>
              <SliderRow label="Vehicle Price" value={buyPrice} min={10000} max={120000} step={500} format={fmt} onChange={setBuyPrice} />
              <SliderRow label="Down Payment" value={buyDown} min={0} max={20000} step={500} format={fmt} onChange={setBuyDown} />
              <SliderRow label="Loan Interest Rate" value={buyRate} min={1} max={15} step={0.1} unit="%" onChange={setBuyRate} />
              <SliderRow label="Loan Term" value={buyTermMos} min={24} max={84} step={12} unit=" mos" onChange={setBuyTermMos} />
            </div>
            <SectionLabel color={C.teal}>Lease Inputs</SectionLabel>
            <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '22px 20px', marginBottom: 16 }}>
              <SliderRow label="Monthly Lease Payment" value={leaseMo} min={150} max={1500} step={10} format={fmt} onChange={setLeaseMo} />
              <SliderRow label="Lease Term" value={leaseTerm} min={24} max={60} step={12} unit=" mos" onChange={setLeaseTerm} />
              <SliderRow label="Cap Cost Reduction (down)" value={leaseCapRed} min={0} max={10000} step={250} format={fmt} onChange={setLeaseCapRed} />
              <SliderRow label="Acquisition + Disposition Fees" value={leaseFees} min={0} max={2000} step={50} format={fmt} onChange={setLeaseFees} />
            </div>
            <SectionLabel>Shared Costs</SectionLabel>
            <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '22px 20px' }}>
              <SliderRow label="Annual Insurance" value={annIns} min={600} max={4000} step={100} format={fmt} onChange={setAnnIns} />
              <SliderRow label="Annual Maintenance (buy only)" value={annMaint} min={200} max={3000} step={100} format={fmt} onChange={setAnnMaint} />
            </div>
          </div>

          <div>
            <SectionLabel>TCO Comparison</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
              <StatBadge label="Buy Monthly Payment" value={fmt(monthlyBuy)} accent={C.gold} />
              <StatBadge label="Lease Monthly Payment" value={fmt(leaseMo)} accent={C.teal} />
              <StatBadge label="3-Year TCO: Buy" value={fmt(tco3buy)} accent={buyWins3 ? C.up : C.t2} />
              <StatBadge label="3-Year TCO: Lease" value={fmt(tco3lease)} accent={!buyWins3 ? C.up : C.t2} />
            </div>
            <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '20px 16px' }}>
              <div style={{ fontFamily: UI, fontSize: 11, color: C.t3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                Total Cost of Ownership Over Time
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.b1} vertical={false} />
                  <XAxis dataKey="period" tick={{ fill: C.t3, fontFamily: UI, fontSize: 11 }} tickLine={false} />
                  <YAxis tickFormatter={n => `$${Math.round(n/1000)}k`} tick={{ fill: C.t3, fontFamily: MONO, fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<BarTooltip />} />
                  <Legend wrapperStyle={{ fontFamily: UI, fontSize: 12, color: C.t2 }} />
                  <Bar dataKey="Buy" name="Buy TCO" fill={C.gold} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Lease" name="Lease TCO" fill={C.teal} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12, padding: '10px 14px', background: C.raise, borderRadius: 8, borderLeft: `3px solid ${C.teal}` }}>
                <span style={{ fontFamily: UI, fontSize: 12, color: C.t2 }}>
                  TCO = total money spent minus vehicle resale value at end of period.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'pros' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '24px 24px' }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, marginBottom: 18 }}>Pros of Buying</div>
            <ProItem>You own an asset with residual resale value</ProItem>
            <ProItem>No mileage restrictions — drive as many miles as you need</ProItem>
            <ProItem>Once paid off, zero monthly payments for years</ProItem>
            <ProItem>Freedom to modify, customize, or sell at any time</ProItem>
            <ProItem>Typically cheaper over 7–10 years versus always leasing</ProItem>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.down, marginBottom: 14, marginTop: 22 }}>Cons of Buying</div>
            <ConItem>Higher monthly payments during the loan period</ConItem>
            <ConItem>You absorb full depreciation loss on the vehicle</ConItem>
            <ConItem>Maintenance costs increase as the vehicle ages</ConItem>
            <ConItem>Tied to an aging asset if you want the latest safety tech</ConItem>
          </div>
          <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '24px 24px' }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.teal, marginBottom: 18 }}>Pros of Leasing</div>
            <ProItem>Lower monthly payments — you pay only for depreciation</ProItem>
            <ProItem>New car every 2–3 years with the latest features and warranty</ProItem>
            <ProItem>Maintenance often covered under manufacturer warranty</ProItem>
            <ProItem>Lower down payment required upfront</ProItem>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.down, marginBottom: 14, marginTop: 22 }}>Cons of Leasing</div>
            <ConItem>You never own the vehicle — perpetual monthly payments</ConItem>
            <ConItem>Mileage limits (typically 10,000–15,000/year) with costly overages</ConItem>
            <ConItem>Wear-and-tear fees at turn-in can add hundreds to thousands</ConItem>
            <ConItem>Locked in — early termination fees are often severe</ConItem>
            <ConItem>Higher required insurance coverage adds cost</ConItem>
          </div>
        </div>
      )}

      {tab === 'when' && (
        <div style={{ display: 'flex', gap: 20 }}>
          <WhenCard title="When Buying Makes Sense" accent={C.gold} items={[
            'You drive 15,000+ miles per year and would exceed lease limits',
            'You plan to keep the vehicle for 6+ years',
            'You want to modify or customize your vehicle',
            'You are self-employed and can deduct depreciation for business use',
            'Long-term total cost of ownership is your primary decision factor',
            'You prefer the freedom of no ongoing obligations once paid off',
          ]} />
          <WhenCard title="When Leasing Makes Sense" accent={C.teal} items={[
            'You prefer driving a new vehicle every 2–3 years',
            'You drive fewer than 12,000 miles per year',
            'You want predictable, lower monthly payments',
            'You drive a vehicle primarily for business and can deduct lease payments',
            'You live in an area where newer safety tech provides real-world value',
            'You dislike dealing with selling or trading in an aging vehicle',
          ]} />
        </div>
      )}

      {tab === 'verdict' && (
        <div>
          <div style={{ background: C.surf, border: `1px solid ${buyWins5 ? C.goldBdr : C.tealBdr}`,
            borderRadius: 16, padding: '32px 36px', marginBottom: 24 }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: buyWins5 ? C.gold : C.teal, marginBottom: 10 }}>
              Personalized Verdict
            </div>
            <h3 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, color: C.t1, margin: '0 0 12px' }}>
              {buyWins5 ? 'Buying wins over 5 years with your numbers' : 'Leasing is cheaper over 5 years with your inputs'}
            </h3>
            <p style={{ fontFamily: UI, fontSize: 14, lineHeight: 1.7, color: C.t2, margin: '0 0 24px', maxWidth: 660 }}>
              {buyWins5
                ? `Over 5 years, buying saves you ${fmt(Math.abs(tco5buy - tco5lease))} in total cost of ownership compared to leasing. After your ${buyTermMos}-month loan ends, your payments stop but you still own a vehicle worth ${fmt(35000 * 0.9 * 0.88 * 0.90 * 0.90 * 0.90)} or more.`
                : `With your lease payment of ${fmt(leaseMo)}/month and vehicle price of ${fmt(buyPrice)}, leasing saves ${fmt(Math.abs(tco5buy - tco5lease))} over 5 years. This advantage narrows significantly after year 6 when a purchased vehicle would be paid off.`
              }
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              <StatBadge label="3-Year Buy TCO" value={fmt(tco3buy)} accent={buyWins3 ? C.up : C.t2} />
              <StatBadge label="3-Year Lease TCO" value={fmt(tco3lease)} accent={!buyWins3 ? C.up : C.t2} />
              <StatBadge label="5-Year Buy TCO" value={fmt(tco5buy)} accent={buyWins5 ? C.up : C.t2} />
              <StatBadge label="5-Year Lease TCO" value={fmt(tco5lease)} accent={!buyWins5 ? C.up : C.t2} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GENERIC TOOL — used for Equipment, Furniture, Tools, Tech, Vacation, Subscription
// ═══════════════════════════════════════════════════════════════
function GenericTool({ onBack, icon: Icon, title, subtitle, learn, defaultVals, sliders, calcFn, pros, cons, whenBuy, whenRent, buyLabel, rentLabel }) {
  const [tab, setTab]   = useState('learn');
  const [vals, setVals] = useState(defaultVals);

  const set = (key) => (v) => setVals(prev => ({ ...prev, [key]: v }));
  const { barData, stats, buyWins, verdictText, disclaimer } = useMemo(() => calcFn(vals), [vals]);

  return (
    <div style={{ padding: '36px 40px 60px', maxWidth: 1140, margin: '0 auto' }}>
      <style>{SLIDER_CSS}</style>
      <BackButton onBack={onBack} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: C.tealDim,
          border: `1px solid ${C.tealBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={19} color={C.teal} />
        </div>
        <div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, color: C.t1, margin: 0, lineHeight: 1.15 }}>{title}</h2>
          <p style={{ fontFamily: UI, fontSize: 13, color: C.t3, margin: '4px 0 0' }}>{subtitle}</p>
        </div>
      </div>

      <TabBar tabs={TOOL_TABS} active={tab} onChange={setTab} />

      {tab === 'learn' && (
        <LearnSection title={learn.title} intro={learn.intro} points={learn.points} />
      )}

      {tab === 'calc' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 28, alignItems: 'start' }}>
          <div>
            {sliders.map(group => (
              <div key={group.label}>
                <SectionLabel color={group.color || C.teal}>{group.label}</SectionLabel>
                <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '22px 20px', marginBottom: 16 }}>
                  {group.rows.map(row => (
                    <SliderRow key={row.key} label={row.label} value={vals[row.key]}
                      min={row.min} max={row.max} step={row.step} format={row.format}
                      unit={row.unit} onChange={set(row.key)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div>
            <SectionLabel>Cost Comparison</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 10, marginBottom: 20 }}>
              {stats.map((s, i) => <StatBadge key={i} label={s.label} value={s.value} accent={s.accent} />)}
            </div>
            <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '20px 16px' }}>
              <div style={{ fontFamily: UI, fontSize: 11, color: C.t3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                Total Cost Over Time
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.b1} vertical={false} />
                  <XAxis dataKey="period" tick={{ fill: C.t3, fontFamily: UI, fontSize: 11 }} tickLine={false} />
                  <YAxis tickFormatter={n => `$${Math.round(n/1000)}k`} tick={{ fill: C.t3, fontFamily: MONO, fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<BarTooltip />} />
                  <Legend wrapperStyle={{ fontFamily: UI, fontSize: 12, color: C.t2 }} />
                  <Bar dataKey="Buy" name={buyLabel || 'Buy'} fill={C.gold} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Rent" name={rentLabel || 'Rent/Lease'} fill={C.teal} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === 'pros' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '24px 24px' }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, marginBottom: 18 }}>Pros of {buyLabel || 'Buying'}</div>
            {pros.buy.map((p, i) => <ProItem key={i}>{p}</ProItem>)}
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.down, marginBottom: 14, marginTop: 22 }}>Cons</div>
            {cons.buy.map((c, i) => <ConItem key={i}>{c}</ConItem>)}
          </div>
          <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '24px 24px' }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.teal, marginBottom: 18 }}>Pros of {rentLabel || 'Renting'}</div>
            {pros.rent.map((p, i) => <ProItem key={i}>{p}</ProItem>)}
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.down, marginBottom: 14, marginTop: 22 }}>Cons</div>
            {cons.rent.map((c, i) => <ConItem key={i}>{c}</ConItem>)}
          </div>
        </div>
      )}

      {tab === 'when' && (
        <div style={{ display: 'flex', gap: 20 }}>
          <WhenCard title={`When ${buyLabel || 'Buying'} Makes Sense`} accent={C.gold} items={whenBuy} />
          <WhenCard title={`When ${rentLabel || 'Renting'} Makes Sense`} accent={C.teal} items={whenRent} />
        </div>
      )}

      {tab === 'verdict' && (
        <div>
          <div style={{ background: C.surf, border: `1px solid ${buyWins ? C.goldBdr : C.tealBdr}`,
            borderRadius: 16, padding: '32px 36px', marginBottom: 24 }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: buyWins ? C.gold : C.teal, marginBottom: 10 }}>
              Personalized Verdict
            </div>
            <h3 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, color: C.t1, margin: '0 0 12px' }}>
              {buyWins ? `${buyLabel || 'Buying'} is the stronger financial choice` : `${rentLabel || 'Renting'} wins with your current inputs`}
            </h3>
            <p style={{ fontFamily: UI, fontSize: 14, lineHeight: 1.7, color: C.t2, margin: '0 0 24px', maxWidth: 660 }}>{verdictText}</p>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 12 }}>
              {stats.map((s, i) => <StatBadge key={i} label={s.label} value={s.value} accent={s.accent} />)}
            </div>
          </div>
          {disclaimer && (
            <div style={{ background: C.raise, border: `1px solid ${C.b2}`, borderRadius: 12, padding: '18px 22px' }}>
              <span style={{ fontFamily: UI, fontSize: 12, color: C.t3, lineHeight: 1.65 }}>{disclaimer}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Equipment Tool ──────────────────────────────────────────
function EquipmentTool({ onBack }) {
  const defaults = { purchasePrice: 8000, annualMaintenance: 400, residualPct: 20, dailyRentalRate: 120, daysPerYear: 30, rentalDelivery: 80 };

  function calcEquip(v) {
    const resid   = v.purchasePrice * v.residualPct / 100;
    const periods = [{ period: '1 Year', yrs: 1 }, { period: '3 Years', yrs: 3 }, { period: '5 Years', yrs: 5 }, { period: '10 Years', yrs: 10 }];
    const barData = periods.map(p => ({
      period: p.period,
      Buy:  Math.round(v.purchasePrice + v.annualMaintenance * p.yrs - resid),
      Rent: Math.round((v.dailyRentalRate * v.daysPerYear + v.rentalDelivery * 12) * p.yrs),
    }));
    const buy3  = barData[1].Buy;
    const rent3 = barData[1].Rent;
    const buy5  = barData[2].Buy;
    const rent5 = barData[2].Rent;
    const buyWins = buy5 < rent5;
    const breakEvenYrs = v.purchasePrice / (v.dailyRentalRate * v.daysPerYear + v.rentalDelivery * 12 - v.annualMaintenance);
    return {
      barData,
      buyWins,
      stats: [
        { label: '3-Year Buy Cost', value: fmt(buy3), accent: buy3 < rent3 ? C.up : C.t2 },
        { label: '3-Year Rent Cost', value: fmt(rent3), accent: rent3 < buy3 ? C.up : C.t2 },
        { label: 'Break-Even', value: breakEvenYrs > 0 ? `Yr ${breakEvenYrs.toFixed(1)}` : 'Never', accent: C.teal },
      ],
      verdictText: buyWins
        ? `Purchasing the equipment costs ${fmt(buy5)} over 5 years versus ${fmt(rent5)} in rental fees. You save ${fmt(rent5 - buy5)} by owning. You break even in approximately ${breakEvenYrs.toFixed(1)} years.`
        : `Renting saves you ${fmt(buy5 - rent5)} over 5 years at your usage rate of ${v.daysPerYear} days/year. Increase usage or reduce rental frequency to shift this calculation.`,
      disclaimer: 'Does not include financing costs if equipment is purchased on credit. Add loan interest to buy cost if applicable.',
    };
  }

  return (
    <GenericTool onBack={onBack} icon={Wrench} title="Buy or Rent Equipment"
      subtitle="Professional & business equipment decision"
      buyLabel="Buy" rentLabel="Rent"
      defaultVals={defaults}
      learn={{
        title: 'When to Buy vs. Rent Equipment',
        intro: 'For business owners, contractors, and professionals — the break-even analysis for equipment is straightforward: divide purchase price by annual rental cost. If you will use the equipment enough to rent it for more than its purchase price over its useful life, buying wins.',
        points: [
          { label: 'Usage-Based Decision', body: 'If you use a piece of equipment more than the break-even frequency, buying is almost always cheaper. Calculate: Purchase Price ÷ (Daily Rental × Days/Year).' },
          { label: 'Residual Value', body: 'Well-maintained equipment often retains 20–40% of its value. Account for resale when calculating total ownership cost.' },
          { label: 'Storage & Insurance', body: 'Owned equipment requires storage space and insurance. Rentals include these costs in the rate.' },
          { label: 'Technology Obsolescence', body: 'For fast-evolving tech equipment, renting provides access to current models. For hand tools and machinery, obsolescence is rarely a concern.' },
        ],
      }}
      sliders={[
        { label: 'Purchase Inputs', color: C.gold, rows: [
          { key: 'purchasePrice', label: 'Purchase Price', min: 500, max: 100000, step: 500, format: fmt },
          { key: 'annualMaintenance', label: 'Annual Maintenance', min: 0, max: 5000, step: 100, format: fmt },
          { key: 'residualPct', label: 'Residual Value at End', min: 0, max: 60, step: 5, unit: '%' },
        ]},
        { label: 'Rental Inputs', color: C.teal, rows: [
          { key: 'dailyRentalRate', label: 'Daily Rental Rate', min: 20, max: 1500, step: 10, format: fmt },
          { key: 'daysPerYear', label: 'Days Used Per Year', min: 1, max: 365, step: 1, unit: ' days' },
          { key: 'rentalDelivery', label: 'Monthly Delivery/Pickup Fee', min: 0, max: 500, step: 10, format: fmt },
        ]},
      ]}
      calcFn={calcEquip}
      pros={{ buy: ['Own the asset — resale value recovers capital', 'Available immediately without scheduling', 'Customize and modify for your specific needs', 'Tax deduction via Section 179 expensing or depreciation'], rent: ['No capital tied up in idle equipment', 'Always get current models with modern features', 'No storage or insurance overhead', 'Flexibility to scale up or down with project demand'] }}
      cons={{ buy: ['High upfront capital commitment', 'Responsible for all maintenance and repairs', 'Obsolete equipment can be hard to sell'], rent: ['Ongoing cost that never stops', 'Scheduling conflicts during peak seasons', 'Delivery fees and fuel surcharges add up'] }}
      whenBuy={['You use the equipment more than 30 days per year', 'The rental market in your area is constrained or unreliable', 'You need immediate availability without scheduling', 'Section 179 deduction makes the first-year cost tax-efficient']}
      whenRent={['Usage is seasonal or infrequent (fewer than 20 days/year)', 'You need specialized equipment for a one-time project', 'Capital preservation is critical for business cash flow', 'Equipment evolves rapidly and current models matter']}
    />
  );
}

// ─── Furniture Tool ──────────────────────────────────────────
function FurnitureTool({ onBack }) {
  const defaults = { purchasePrice: 3500, qualityRetentionPct: 60, monthlyRental: 180, rentalTermMonths: 24, deliverySetup: 150 };

  function calcFurniture(v) {
    const periods = [{ period: '1 Year', mos: 12 }, { period: '2 Years', mos: 24 }, { period: '3 Years', mos: 36 }, { period: '5 Years', mos: 60 }];
    const barData = periods.map(p => ({
      period: p.period,
      Buy:  Math.round(v.purchasePrice - v.purchasePrice * v.qualityRetentionPct / 100 * (p.mos / 60)),
      Rent: Math.round(v.monthlyRental * p.mos + v.deliverySetup),
    }));
    const buy3  = barData[2].Buy;
    const rent3 = barData[2].Rent;
    const buy5  = barData[3].Buy;
    const rent5 = barData[3].Rent;
    const buyWins = buy5 < rent5;
    const breakEvenMos = Math.ceil(v.purchasePrice / v.monthlyRental);
    return {
      barData,
      buyWins,
      stats: [
        { label: '3-Year Buy Cost', value: fmt(buy3), accent: buy3 < rent3 ? C.up : C.t2 },
        { label: '3-Year Rent Cost', value: fmt(rent3), accent: rent3 < buy3 ? C.up : C.t2 },
        { label: 'Break-Even Month', value: `Mo ${breakEvenMos}`, accent: C.teal },
      ],
      verdictText: buyWins
        ? `Buying furniture saves ${fmt(rent5 - buy5)} over 5 years. Quality furniture that retains ${v.qualityRetentionPct}% of its value is a better long-term investment than perpetual rental payments. Break-even is month ${breakEvenMos}.`
        : `At ${fmt(v.monthlyRental)}/month in rental fees, renting saves ${fmt(buy5 - rent5)} over 5 years — likely because you are renting for a short period where purchase price hasn't been recovered.`,
      disclaimer: 'Resale value assumes quality, well-maintained furniture sold via marketplace at the percentage specified.',
    };
  }

  return (
    <GenericTool onBack={onBack} icon={Package} title="Buy or Rent Furniture"
      subtitle="Home & office furnishings decision"
      buyLabel="Buy" rentLabel="Rent"
      defaultVals={defaults}
      learn={{
        title: 'Furniture: Own It or Rent It?',
        intro: 'Furniture rental is most popular with people in transition — new graduates, corporate relocations, staged homes, or short-term assignments. The math almost always favors buying for stays longer than 18 months, but for truly short-term situations, rental can be the smarter financial move.',
        points: [
          { label: 'Quality Retention', body: 'Well-made furniture (solid wood, quality upholstery) retains 40–70% of purchase price when resold. Flat-pack or mass-market furniture depreciates much more rapidly.' },
          { label: 'Break-Even Month', body: 'Simply divide purchase price by monthly rental rate. If your tenancy ends before that month, renting may have been cheaper in pure dollar terms.' },
          { label: 'Corporate Relocation', body: 'Many companies reimburse furniture rental for relocations. Check your package before committing to purchase.' },
          { label: 'Flexibility Premium', body: 'Rental includes delivery, setup, and pickup. If you move frequently, this convenience has real value beyond just the dollar comparison.' },
        ],
      }}
      sliders={[
        { label: 'Purchase Inputs', color: C.gold, rows: [
          { key: 'purchasePrice', label: 'Total Purchase Price', min: 500, max: 25000, step: 250, format: fmt },
          { key: 'qualityRetentionPct', label: 'Resale Value Retention', min: 10, max: 80, step: 5, unit: '%' },
        ]},
        { label: 'Rental Inputs', color: C.teal, rows: [
          { key: 'monthlyRental', label: 'Monthly Rental Cost', min: 50, max: 1500, step: 25, format: fmt },
          { key: 'rentalTermMonths', label: 'Expected Stay (months)', min: 1, max: 60, step: 1, unit: ' mos' },
          { key: 'deliverySetup', label: 'Delivery & Setup Fee', min: 0, max: 500, step: 25, format: fmt },
        ]},
      ]}
      calcFn={calcFurniture}
      pros={{ buy: ['Own an asset you can resell or move with you', 'One-time cost — no ongoing payments', 'Choose exactly what you want without rental catalog limits', 'Can be a source of pride and personal expression in your space'], rent: ['No upfront capital required', 'Move out with zero effort — rental company handles everything', 'Ideal for short stays under 18 months', 'No concern about damage beyond normal wear'] }}
      cons={{ buy: ['Moving costs money and effort when you relocate', 'Storage costs if between homes', 'Risk of buying the wrong item for a space you haven\'t settled into'], rent: ['More expensive per month than equivalent purchase payment', 'Limited selection compared to retail', 'No ownership or residual value for money spent'] }}
      whenBuy={['You are staying in one place for 18+ months', 'You have storage or are moving to a permanent home', 'You want to invest in quality pieces that last 10+ years', 'Resale value of quality furniture is important to you']}
      whenRent={['Corporate relocation or short assignment (under 12 months)', 'Staging a home for sale and need furnished appearance', 'Just moved to a new city and haven\'t decided where to settle', 'Company is paying for it through relocation package']}
    />
  );
}

// ─── Tools / Heavy Equipment ────────────────────────────────
function ToolsTool({ onBack }) {
  const defaults = { purchasePrice: 25000, annualMaintenance: 1200, storageCost: 150, residualPct: 35, monthlyLease: 600, leaseTerm: 48, leaseIncludesMaint: 1, dailyRent: 250, daysPerYear: 40 };

  function calcTools(v) {
    function buyCost(yrs) {
      return Math.round(v.purchasePrice + (v.annualMaintenance + v.storageCost * 12) * yrs - v.purchasePrice * v.residualPct / 100);
    }
    function leaseCost(yrs) {
      const maintSavings = v.leaseIncludesMaint ? v.annualMaintenance * yrs : 0;
      return Math.round(v.monthlyLease * 12 * yrs - maintSavings);
    }
    function rentCost(yrs) {
      return Math.round(v.dailyRent * v.daysPerYear * yrs);
    }
    const periods = [{ period: '1 Year', yrs: 1 }, { period: '3 Years', yrs: 3 }, { period: '5 Years', yrs: 5 }];
    const barData = periods.map(p => ({
      period: p.period,
      Buy:   buyCost(p.yrs),
      Lease: leaseCost(p.yrs),
      Rent:  rentCost(p.yrs),
    }));
    const buy5   = buyCost(5);
    const lease5 = leaseCost(5);
    const rent5  = rentCost(5);
    const winner = Math.min(buy5, lease5, rent5);
    const buyWins = winner === buy5;
    const leaseWins = winner === lease5;
    return {
      barData: barData.map(d => ({ period: d.period, Buy: d.Buy, Rent: d.Lease + d.Rent > d.Lease ? d.Lease : d.Rent })),
      buyWins,
      stats: [
        { label: '5-Year Buy Cost', value: fmt(buy5), accent: buyWins ? C.up : C.t2 },
        { label: '5-Year Lease Cost', value: fmt(lease5), accent: leaseWins ? C.up : C.t2 },
        { label: '5-Year Rent Cost', value: fmt(rent5), accent: (!buyWins && !leaseWins) ? C.up : C.t2 },
      ],
      verdictText: buyWins
        ? `Purchasing the equipment is cheapest over 5 years at ${fmt(buy5)}, saving ${fmt(Math.min(lease5, rent5) - buy5)} versus your next best option.`
        : leaseWins
        ? `Leasing at ${fmt(v.monthlyLease)}/month is cheapest over 5 years at ${fmt(lease5)}, especially if maintenance is included. This saves ${fmt(Math.min(buy5, rent5) - lease5)} versus the next option.`
        : `Renting at ${v.daysPerYear} days/year costs ${fmt(rent5)} over 5 years — the most economical choice at your usage level. Increase usage and buying becomes more attractive.`,
      disclaimer: null,
    };
  }

  return (
    <GenericTool onBack={onBack} icon={Settings} title="Tools & Heavy Equipment"
      subtitle="Buy, lease, or rent — three-way comparison"
      buyLabel="Buy" rentLabel="Lease/Rent"
      defaultVals={defaults}
      learn={{
        title: 'Three Ways to Acquire Heavy Equipment',
        intro: 'For contractors, farmers, and businesses managing capital equipment — the choice between buying, leasing, and renting is a core financial decision. Each option suits different usage patterns, cash flow needs, and balance sheet strategies.',
        points: [
          { label: 'Buying', body: 'Best for high-utilization, long-life equipment. Section 179 allows full expensing in year one. Ownership means full flexibility, but you absorb depreciation and must manage maintenance.' },
          { label: 'Leasing', body: 'Keeps equipment off your balance sheet, preserves credit lines, and often includes maintenance. Best for equipment that needs regular upgrading or where cash flow predictability matters.' },
          { label: 'Renting', body: 'Lowest commitment — ideal for project-based or seasonal use. No capital required, no maintenance overhead. Most expensive per day, but cheapest total if use is infrequent.' },
          { label: 'Break-Even Usage', body: 'Calculate the annual usage days where rental cost equals purchase price divided by useful life in years. Below that threshold, renting is cheaper. Above it, buying wins.' },
        ],
      }}
      sliders={[
        { label: 'Buy Inputs', color: C.gold, rows: [
          { key: 'purchasePrice', label: 'Purchase Price', min: 5000, max: 500000, step: 2500, format: fmt },
          { key: 'annualMaintenance', label: 'Annual Maintenance', min: 0, max: 20000, step: 250, format: fmt },
          { key: 'storageCost', label: 'Monthly Storage/Insurance', min: 0, max: 1000, step: 25, format: fmt },
          { key: 'residualPct', label: 'Residual Value (% of purchase)', min: 0, max: 70, step: 5, unit: '%' },
        ]},
        { label: 'Lease Inputs', color: C.teal, rows: [
          { key: 'monthlyLease', label: 'Monthly Lease Payment', min: 100, max: 10000, step: 50, format: fmt },
          { key: 'leaseIncludesMaint', label: 'Maintenance Included (1=Yes)', min: 0, max: 1, step: 1, unit: '' },
        ]},
        { label: 'Rent Inputs', color: C.t2, rows: [
          { key: 'dailyRent', label: 'Daily Rental Rate', min: 50, max: 3000, step: 25, format: fmt },
          { key: 'daysPerYear', label: 'Days Used Per Year', min: 1, max: 365, step: 5, unit: ' days' },
        ]},
      ]}
      calcFn={calcTools}
      pros={{ buy: ['Full ownership — modify, customize, or sell at will', 'Section 179 and bonus depreciation tax advantages', 'Available 24/7 without scheduling', 'Long-term cheapest option for high-utilization equipment'], rent: ['No capital tied up — preserve liquidity', 'Always access current, maintained equipment', 'No storage, insurance, or residual value risk', 'Scale fleet up or down instantly by project demand'] }}
      cons={{ buy: ['Large upfront capital requirement', 'Responsible for all maintenance, repairs, and storage', 'Obsolete or underused equipment ties up capital'], rent: ['Most expensive per-day option', 'Scheduling conflicts during peak construction season', 'Lease: locked into payments whether you use it or not'] }}
      whenBuy={['You use the equipment 150+ days per year', 'Long useful life (10+ years) with manageable maintenance', 'You need 24/7 availability and custom configuration', 'Tax benefits of Section 179 expensing are significant for your business']}
      whenRent={['Usage is under 60 days per year (rent daily)', 'Project-based work with no need for ongoing equipment', 'Capital preservation and cash flow are top priority (lease)', 'Equipment needs to be current model — lease for regular upgrades']}
    />
  );
}

// ─── Technology Tool ─────────────────────────────────────────
function TechTool({ onBack }) {
  const defaults = { upfrontCost: 2500, annualUpgrade: 600, usefulLifeYears: 4, residualPct: 15, monthlySubscription: 85, annualPriceIncrease: 5 };

  function calcTech(v) {
    function buyCost(yrs) {
      const replacements = Math.floor(yrs / v.usefulLifeYears);
      const remYrs = yrs % v.usefulLifeYears;
      let total = v.upfrontCost + v.annualUpgrade * yrs;
      total += replacements * v.upfrontCost;
      const finalResid = v.upfrontCost * v.residualPct / 100;
      if (remYrs < v.usefulLifeYears) total -= finalResid;
      return Math.round(total);
    }
    function subCost(yrs) {
      let total = 0;
      let monthly = v.monthlySubscription;
      for (let y = 0; y < yrs; y++) {
        total += monthly * 12;
        monthly *= (1 + v.annualPriceIncrease / 100);
      }
      return Math.round(total);
    }
    const periods = [{ period: '1 Year', yrs: 1 }, { period: '3 Years', yrs: 3 }, { period: '5 Years', yrs: 5 }, { period: '10 Years', yrs: 10 }];
    const barData = periods.map(p => ({ period: p.period, Buy: buyCost(p.yrs), Rent: subCost(p.yrs) }));
    const buy5 = buyCost(5); const sub5 = subCost(5);
    const buy10 = buyCost(10); const sub10 = subCost(10);
    const buyWins = buy5 < sub5;
    const breakEvenMos = Math.ceil(v.upfrontCost / v.monthlySubscription);
    return {
      barData,
      buyWins,
      stats: [
        { label: '5-Year Buy Cost', value: fmt(buy5), accent: buy5 < sub5 ? C.up : C.t2 },
        { label: '5-Year Sub Cost', value: fmt(sub5), accent: sub5 < buy5 ? C.up : C.t2 },
        { label: 'Break-Even Month', value: `Mo ${breakEvenMos}`, accent: C.teal },
      ],
      verdictText: buyWins
        ? `Buying costs ${fmt(buy5)} over 5 years versus ${fmt(sub5)} subscribing — a savings of ${fmt(sub5 - buy5)}. The initial purchase pays for itself by month ${breakEvenMos}.`
        : `Subscribing at ${fmt(v.monthlySubscription)}/month saves ${fmt(buy5 - sub5)} over 5 years versus purchasing outright. However, if subscription prices increase by ${v.annualPriceIncrease}%/year, the 10-year cost reaches ${fmt(sub10)}.`,
      disclaimer: 'Subscription analysis includes compounding annual price increases. Buy analysis includes periodic upgrades at the specified annual budget.',
    };
  }

  return (
    <GenericTool onBack={onBack} icon={Monitor} title="Buy or Subscribe to Tech"
      subtitle="Hardware & software acquisition analysis"
      buyLabel="Buy" rentLabel="Subscribe"
      defaultVals={defaults}
      learn={{
        title: 'Ownership vs. Subscription in the Digital Age',
        intro: 'The shift to subscription software (SaaS) and hardware-as-a-service has made this one of the most relevant financial decisions of the decade. Subscriptions offer lower upfront cost, automatic updates, and flexibility — but they never end. Ownership has a defined payoff point after which you owe nothing.',
        points: [
          { label: 'Break-Even Calculation', body: 'Divide upfront purchase price by monthly subscription cost. That is your break-even month. Before that month, subscribing has cost less in cumulative total dollars.' },
          { label: 'Upgrade Cycle Reality', body: 'Technology is not truly "owned forever." Laptops realistically need replacement every 3–5 years. Software purchased outright often lacks updates after a few years. Factor in upgrade costs honestly.' },
          { label: 'Subscription Price Creep', body: 'Subscription prices rarely stay flat. A 5% annual increase on a $100/month subscription turns into $162/month in 10 years. Model this realistically.' },
          { label: 'Bundle Value', body: 'Many subscriptions bundle multiple services (storage, support, collaboration tools). Compare the full bundle to equivalent purchased software — not just the headline app.' },
        ],
      }}
      sliders={[
        { label: 'Buy Inputs', color: C.gold, rows: [
          { key: 'upfrontCost', label: 'Upfront Purchase Cost', min: 100, max: 10000, step: 100, format: fmt },
          { key: 'annualUpgrade', label: 'Annual Upgrade Budget', min: 0, max: 2000, step: 50, format: fmt },
          { key: 'usefulLifeYears', label: 'Useful Life Before Replacement', min: 1, max: 10, step: 1, unit: ' yrs' },
          { key: 'residualPct', label: 'Resale Value at End of Life', min: 0, max: 50, step: 5, unit: '%' },
        ]},
        { label: 'Subscribe Inputs', color: C.teal, rows: [
          { key: 'monthlySubscription', label: 'Monthly Subscription Cost', min: 5, max: 500, step: 5, format: fmt },
          { key: 'annualPriceIncrease', label: 'Annual Price Increase', min: 0, max: 15, step: 0.5, unit: '%' },
        ]},
      ]}
      calcFn={calcTech}
      pros={{ buy: ['Fixed cost — no ongoing payments after purchase', 'Works offline without internet dependency', 'Data privacy — no vendor lock-in', 'One-time expensing or depreciation for business'], rent: ['Always on the latest version with updates included', 'Lower upfront cost — accessible immediately', 'Cancel anytime without a stranded asset', 'Support and cloud backup often included'] }}
      cons={{ buy: ['Higher upfront cost', 'You manage your own updates and security patches', 'Technology becomes outdated — forced upgrade cycle', 'Harder to share access across teams'], rent: ['Perpetual payments — you never own anything', 'Price increases over time beyond your control', 'Cancel and lose access to all data and functionality', 'Dependent on vendor staying in business'] }}
      whenBuy={['You use the software or hardware for 5+ years', 'Offline access and data privacy are important', 'You are price-sensitive to subscription increases', 'Business expensing or depreciation provides significant tax benefit']}
      whenRent={['You need the latest features and automatic updates', 'Upfront cost is a barrier to accessing the tool', 'You collaborate in a team where subscription licenses simplify access', 'You are uncertain about long-term need — try before committing']}
    />
  );
}

// ─── Vacation Property Tool ──────────────────────────────────
function VacationTool({ onBack }) {
  const defaults = { propPrice: 350000, dpPct: 20, mortgageRate: 7, mortgageTerm: 30, propTaxPct: 1, hoaMonthly: 300, maintenancePct: 1.5, nightsUsed: 30, rentalNightlyIncome: 200, rentalNightsPerYear: 90, vacNightlyRate: 180, vacNightsPerYear: 30 };

  function calcVacation(v) {
    const dp = v.propPrice * v.dpPct / 100;
    const principal = v.propPrice - dp;
    const monthlyMortgage = calcPMT(principal, v.mortgageRate, v.mortgageTerm * 12);
    const annualMortgage = monthlyMortgage * 12;
    const annualTax = v.propPrice * v.propTaxPct / 100;
    const annualHOA = v.hoaMonthly * 12;
    const annualMaint = v.propPrice * v.maintenancePct / 100;
    const annualRentalIncome = v.rentalNightlyIncome * v.rentalNightsPerYear;
    const netAnnualOwn = annualMortgage + annualTax + annualHOA + annualMaint - annualRentalIncome;
    const annualVacRent = v.vacNightlyRate * v.vacNightsPerYear;

    const barData = [1, 3, 5, 10].map(yrs => ({
      period: `${yrs} Year${yrs > 1 ? 's' : ''}`,
      Buy:  Math.round(netAnnualOwn * yrs + dp),
      Rent: Math.round(annualVacRent * yrs),
    }));

    const buy5  = barData[2].Buy;
    const rent5 = barData[2].Rent;
    const buyWins = buy5 < rent5;

    return {
      barData,
      buyWins,
      stats: [
        { label: 'Monthly Net Cost of Owning', value: fmt(netAnnualOwn / 12), accent: C.gold },
        { label: 'Annual Vacation Rent Cost', value: fmt(annualVacRent), accent: C.teal },
        { label: 'Annual Rental Income', value: fmt(annualRentalIncome), accent: C.up },
      ],
      verdictText: buyWins
        ? `After rental income of ${fmt(annualRentalIncome)}/year, your net annual cost of owning is ${fmt(netAnnualOwn)}. Over 5 years this is ${fmt(buy5)} versus ${fmt(rent5)} just booking vacation rentals — owning wins financially, and you build equity.`
        : `Your net annual cost of ownership is ${fmt(netAnnualOwn)} — more than simply booking ${v.vacNightsPerYear} vacation nights at ${fmt(v.vacNightlyRate)}/night. Consider increasing rental nights or raising the nightly rate to improve the math.`,
      disclaimer: 'Does not include federal and state income tax on rental income. Rental income may be tax-free up to 14 days/year under the Augusta Rule. Consult a tax advisor.',
    };
  }

  return (
    <GenericTool onBack={onBack} icon={MapPin} title="Vacation Property"
      subtitle="Buy vs. rent a vacation home"
      buyLabel="Buy" rentLabel="Rent Vacations"
      defaultVals={defaults}
      learn={{
        title: 'Vacation Home Ownership: The Full Picture',
        intro: 'A vacation home is different from a primary residence — it can generate rental income when you are not using it, which dramatically changes the financial analysis. The key metrics are net cost (after rental income), personal use nights, and whether the property appreciates in a sought-after market.',
        points: [
          { label: 'Net Cost After Rental Income', body: 'If you rent the property when not using it, rental income offsets ownership costs. In popular markets, a well-priced vacation rental can generate $20,000–$60,000/year.' },
          { label: 'The Augusta Rule', body: 'The IRS allows rental income to be tax-free if you rent the property for 14 days or fewer per year. Many vacation homeowners use exactly this strategy.' },
          { label: 'Personal Use Limit', body: 'To qualify for rental deductions, your personal use cannot exceed 14 days or 10% of the days the property is rented — whichever is greater. Exceeding this converts it to a personal residence for tax purposes.' },
          { label: 'Market Selection', body: 'Location drives appreciation and rental demand. A beachfront property in a constrained coastal market has very different economics from a mountain cabin 3 hours from a city.' },
        ],
      }}
      sliders={[
        { label: 'Property Inputs', color: C.gold, rows: [
          { key: 'propPrice', label: 'Property Price', min: 100000, max: 2000000, step: 10000, format: fmt },
          { key: 'dpPct', label: 'Down Payment', min: 10, max: 40, step: 5, unit: '%' },
          { key: 'mortgageRate', label: 'Mortgage Rate', min: 3, max: 12, step: 0.1, unit: '%' },
          { key: 'hoaMonthly', label: 'HOA Monthly', min: 0, max: 2000, step: 25, format: fmt },
          { key: 'maintenancePct', label: 'Annual Maintenance %', min: 0.5, max: 4, step: 0.25, unit: '%' },
        ]},
        { label: 'Rental Income', color: C.up, rows: [
          { key: 'rentalNightlyIncome', label: 'Nightly Rental Rate', min: 50, max: 2000, step: 25, format: fmt },
          { key: 'rentalNightsPerYear', label: 'Rental Nights Per Year', min: 0, max: 300, step: 5, unit: ' nights' },
        ]},
        { label: 'Vacation Rental Comparison', color: C.teal, rows: [
          { key: 'vacNightlyRate', label: 'Vacation Rental Rate (booking)', min: 50, max: 2000, step: 25, format: fmt },
          { key: 'vacNightsPerYear', label: 'Nights Vacationed Per Year', min: 5, max: 120, step: 5, unit: ' nights' },
        ]},
      ]}
      calcFn={calcVacation}
      pros={{ buy: ['Build equity in a desirable real estate market', 'Rental income offsets ownership costs significantly', 'Your vacation is always available — no booking uncertainty', 'Appreciation potential in sought-after markets'], rent: ['No down payment or mortgage commitment', 'Vacation anywhere — total flexibility each year', 'No maintenance headaches, HOA drama, or property management', 'No exposure to local market downturns'] }}
      cons={{ buy: ['Large down payment (typically 20–25% for vacation property)', 'Property management is time-consuming if self-managed', 'Seasonal markets mean rental income is lumpy', 'Illiquid — hard to exit quickly if circumstances change'], rent: ['No equity built from vacation spending', 'Prime properties sell out — availability decreases at peak times', 'Prices increase during school breaks and holidays', 'You never have the "your place" feeling year over year'] }}
      whenBuy={['Your vacation destination is consistent and you go 30+ nights/year', 'Strong short-term rental market can offset a majority of ownership costs', 'You want a legacy property to pass to family', 'Market fundamentals (limited supply, strong demand) favor appreciation']}
      whenRent={['You vacation in different places each year', 'Capital would work harder in other investments', 'You want zero property management responsibility', 'Vacation frequency is low or unpredictable (fewer than 15 nights/year)']}
    />
  );
}

// ─── Subscription Tool ───────────────────────────────────────
function SubscriptionTool({ onBack }) {
  const defaults = { purchasePrice: 500, depreciationPct: 20, yearsToReplace: 5, monthlyFee: 30, annualIncrease: 4 };

  function calcSub(v) {
    const annualSub0 = v.monthlyFee * 12;
    function subCost(yrs) {
      let total = 0, mo = v.monthlyFee;
      for (let y = 0; y < yrs; y++) { total += mo * 12; mo *= (1 + v.annualIncrease / 100); }
      return Math.round(total);
    }
    function buyCost(yrs) {
      const replacements = Math.floor(yrs / v.yearsToReplace);
      const totalPurchases = (replacements + 1) * v.purchasePrice;
      const finalDepreciated = v.purchasePrice * Math.pow(1 - v.depreciationPct / 100, yrs % v.yearsToReplace || v.yearsToReplace);
      return Math.round(totalPurchases - finalDepreciated);
    }
    const breakEvenMos = Math.ceil(v.purchasePrice / v.monthlyFee);
    const barData = [1, 2, 3, 5, 10].map(yrs => ({
      period: `${yrs}yr`, Buy: buyCost(yrs), Rent: subCost(yrs),
    }));
    const buy5 = buyCost(5), sub5 = subCost(5);
    const buyWins = buy5 < sub5;
    return {
      barData,
      buyWins,
      stats: [
        { label: 'Break-Even Month', value: `Month ${breakEvenMos}`, accent: C.teal },
        { label: '5-Year Buy Cost', value: fmt(buy5), accent: buy5 < sub5 ? C.up : C.t2 },
        { label: '5-Year Sub Cost', value: fmt(sub5), accent: sub5 < buy5 ? C.up : C.t2 },
      ],
      verdictText: buyWins
        ? `Buying outright costs ${fmt(buy5)} over 5 years vs. ${fmt(sub5)} subscribing — saving you ${fmt(sub5 - buy5)}. Your break-even is month ${breakEvenMos}: before that, the subscription has spent less in total dollars.`
        : `Subscribing at ${fmt(v.monthlyFee)}/month costs ${fmt(sub5)} over 5 years vs ${fmt(buy5)} buying — saving ${fmt(buy5 - sub5)}. This advantage shrinks over time as subscription prices increase at ${v.annualIncrease}%/year.`,
      disclaimer: null,
    };
  }

  return (
    <GenericTool onBack={onBack} icon={RefreshCw} title="Buy Once vs. Subscribe"
      subtitle="Universal ownership vs. subscription calculator"
      buyLabel="Buy" rentLabel="Subscribe"
      defaultVals={defaults}
      learn={{
        title: 'The Subscription Economy: Do the Math',
        intro: 'The subscription model is powerful for companies because it converts large one-time purchases into perpetual monthly revenue. For consumers, subscriptions offer low-friction access — but over time they often cost far more than ownership. This universal calculator works for any product: a book app, a gym, a streaming service, a piece of software, or a household appliance.',
        points: [
          { label: 'The Break-Even Formula', body: 'Break-even month = Purchase Price ÷ Monthly Fee. Before that month, the subscription has cost less in cumulative total. After it, buying becomes the better financial choice.' },
          { label: 'Price Creep', body: 'Subscription prices rarely stay flat. Netflix, Spotify, and most SaaS products have increased prices 40–80% over the past 5 years. Model realistic annual increases.' },
          { label: 'Depreciation Reality', body: 'Owned products depreciate, but many retain meaningful value for years. A $500 product that retains 50% value after 5 years effectively costs you only $250.' },
          { label: 'Accumulation Effect', body: 'The average American subscribes to 12+ services. Even modest subscriptions ($10–$30/month each) accumulate to $1,500–$4,000/year. Audit your subscriptions annually.' },
        ],
      }}
      sliders={[
        { label: 'Buy Inputs', color: C.gold, rows: [
          { key: 'purchasePrice', label: 'Purchase Price', min: 10, max: 5000, step: 10, format: fmt },
          { key: 'depreciationPct', label: 'Annual Depreciation Rate', min: 0, max: 60, step: 5, unit: '%' },
          { key: 'yearsToReplace', label: 'Years Until Replacement', min: 1, max: 15, step: 1, unit: ' yrs' },
        ]},
        { label: 'Subscribe Inputs', color: C.teal, rows: [
          { key: 'monthlyFee', label: 'Monthly Fee', min: 1, max: 500, step: 1, format: fmt },
          { key: 'annualIncrease', label: 'Annual Price Increase', min: 0, max: 20, step: 0.5, unit: '%' },
        ]},
      ]}
      calcFn={calcSub}
      pros={{ buy: ['Defined cost — no ongoing payments', 'Works without internet, account, or vendor', 'Resale value recovers a portion of purchase price', 'No forced upgrades or feature deprecation'], rent: ['Low barrier — start immediately for a few dollars', 'Automatic updates, support, and new features included', 'Cancel anytime — no stranded asset', 'Try before you commit to a large purchase'] }}
      cons={{ buy: ['Higher upfront cost', 'Stuck with the same version until you pay to upgrade', 'No cloud sync or cross-device access in some products'], rent: ['Perpetual cost that never ends', 'Price increases compound over time beyond your control', 'Cancel and lose all access immediately', 'Vendor lock-in can be hard to escape'] }}
      whenBuy={['You use the product consistently for 2+ years', 'The break-even month is within 18 months', 'Offline access or data ownership matters to you', 'You are consolidating and cutting recurring monthly expenses']}
      whenRent={['You only need the product temporarily', 'Upfront cost is a real barrier right now', 'Access to the latest version and features is critical', 'You are unsure how much you will use it — test before committing']}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — Router
// ═══════════════════════════════════════════════════════════════
export default function BuyRentLease() {
  const [view, setView] = useState('hub');

  if (view === 'house')        return <HouseTool        onBack={() => setView('hub')} />;
  if (view === 'car')          return <CarTool          onBack={() => setView('hub')} />;
  if (view === 'equipment')    return <EquipmentTool    onBack={() => setView('hub')} />;
  if (view === 'furniture')    return <FurnitureTool    onBack={() => setView('hub')} />;
  if (view === 'tools')        return <ToolsTool        onBack={() => setView('hub')} />;
  if (view === 'tech')         return <TechTool         onBack={() => setView('hub')} />;
  if (view === 'vacation')     return <VacationTool     onBack={() => setView('hub')} />;
  if (view === 'subscription') return <SubscriptionTool onBack={() => setView('hub')} />;

  return <HubView onSelect={setView} />;
}
