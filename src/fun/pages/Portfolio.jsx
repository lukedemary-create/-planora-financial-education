import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import {
  BookOpen, Calculator, ChevronRight, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Target, Zap, Layers, MapPin,
  Calendar, Clock, Umbrella, BarChart2, Shield, Activity,
  CheckCircle2, AlertCircle, ExternalLink,
} from 'lucide-react';

/* ── Design tokens ─────────────────────────────────────────────── */
const INDIGO  = '#818cf8';
const TEAL    = '#00B4C6';
const GOLD    = '#c9a96e';
const GREEN   = '#22c55e';
const RED     = '#ef4444';
const ORANGE  = '#f97316';
const BLUE    = '#3b82f6';
const PURPLE  = '#a855f7';
const YELLOW  = '#eab308';

const BG    = '#1a1410';
const SURF  = '#231c16';
const RAISE = '#2d2419';
const B1    = '#2a2018';
const B2    = '#3d3028';
const NAVY  = '#f0e8d8';
const T2    = '#a89070';
const T3    = '#6b5540';

const UI   = "'Inter', system-ui, sans-serif";
const DISP = "'Playfair Display', Georgia, serif";
const MONO = "'JetBrains Mono', 'Courier New', monospace";

/* ── Shared helpers ────────────────────────────────────────────── */
const fmt  = n => '$' + Math.round(Math.abs(n)).toLocaleString();
const fmtK = n => n >= 1000000 ? `$${(n/1000000).toFixed(2)}M` : `$${(n/1000).toFixed(0)}K`;

function SectionCard({ title, subtitle, icon: Icon, accent = INDIGO, children }) {
  return (
    <div style={{ background: SURF, border: `1px solid ${B1}`, borderRadius: 16, overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ padding: '1.125rem 1.5rem', borderBottom: `1px solid ${B1}`, display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {Icon && <div style={{ width: 36, height: 36, borderRadius: 9, background: `${accent}14`, border: `1px solid ${accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={17} color={accent}/></div>}
        <div>
          <div style={{ fontFamily: DISP, fontSize: '1rem', fontWeight: 700, color: NAVY, letterSpacing: '-0.01em' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.75rem', color: T3, fontFamily: UI, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ padding: '1.25rem 1.5rem' }}>{children}</div>
    </div>
  );
}

function Accordion({ title, subtitle, icon: Icon, accent = INDIGO, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: `1px solid ${open ? accent+'40' : B1}`, borderRadius: 10, overflow: 'hidden', marginBottom: '0.625rem', transition: 'border-color 0.15s' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', textAlign: 'left', padding: '0.875rem 1rem',
        background: open ? `${accent}08` : SURF, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'background 0.15s',
      }}>
        {Icon && <Icon size={16} color={open ? accent : T3} style={{ flexShrink: 0, transition: 'color 0.15s' }}/>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: open ? NAVY : T2, fontFamily: UI }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.6875rem', color: T3, fontFamily: UI, marginTop: 1 }}>{subtitle}</div>}
        </div>
        {open ? <ChevronUp size={14} color={accent}/> : <ChevronDown size={14} color={T3}/>}
      </button>
      {open && (
        <div style={{ borderTop: `1px solid ${accent}20`, padding: '1rem 1.25rem', background: '#1e1912' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function InfoTile({ label, value, color = INDIGO }) {
  return (
    <div style={{ padding: '0.5rem 0.75rem', background: RAISE, borderRadius: 8, border: `1px solid ${B1}` }}>
      <div style={{ fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color, marginBottom: 3, fontFamily: UI }}>{label}</div>
      <div style={{ fontSize: '0.6875rem', color: T2, lineHeight: 1.55, fontFamily: UI }}>{value}</div>
    </div>
  );
}

function KeyPoint({ color = INDIGO, children }) {
  return (
    <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 5 }}>
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 7 }}/>
      <div style={{ fontSize: '0.6875rem', color: T2, lineHeight: 1.55, fontFamily: UI }}>{children}</div>
    </div>
  );
}

function Formula({ children }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: '0.75rem', background: RAISE, border: `1px solid ${INDIGO}28`, borderRadius: 7, padding: '8px 14px', color: INDIGO, margin: '0.625rem 0', letterSpacing: '0.02em' }}>
      {children}
    </div>
  );
}

/* ── Charts ────────────────────────────────────────────────────── */
function VolChart() {
  const data = [];
  for (let i = 0; i < 60; i++) {
    const noise = (Math.sin(i * 0.4) + Math.cos(i * 0.7) + Math.sin(i * 1.1)) * 4;
    data.push({ month: i + 1, highVol: Math.round(100000 * (1 + noise / 100)), lowVol: Math.round(100000 * (1 + noise * 0.3 / 100)) });
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={B1}/>
        <XAxis dataKey="month" tick={{ fill: T3, fontSize: 9, fontFamily: MONO }}/>
        <YAxis tickFormatter={v => fmtK(v)} tick={{ fill: T3, fontSize: 9, fontFamily: MONO }} width={60}/>
        <RechartsTip formatter={v => fmt(v)} contentStyle={{ background: RAISE, border: `1px solid ${B1}`, borderRadius: 6, fontSize: '0.6875rem', color: NAVY }} itemStyle={{ color: NAVY }}/>
        <Line type="monotone" dataKey="highVol" name="High Volatility (20% vol)" stroke={RED} strokeWidth={1.5} dot={false}/>
        <Line type="monotone" dataKey="lowVol"  name="Low Volatility (6% vol)"  stroke={GREEN} strokeWidth={1.5} dot={false}/>
      </LineChart>
    </ResponsiveContainer>
  );
}

function DCAChart() {
  const data = [];
  let lump = 100000, dca = 0;
  for (let yr = 0; yr <= 20; yr++) {
    data.push({ year: yr, lump: Math.round(lump), dca: Math.round(dca) });
    lump *= 1.08;
    dca = dca * 1.08 + 5000;
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={B1}/>
        <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: T3, fontSize: 9, fontFamily: MONO }}/>
        <YAxis tickFormatter={v => fmtK(v)} tick={{ fill: T3, fontSize: 9, fontFamily: MONO }} width={60}/>
        <RechartsTip formatter={v => fmt(v)} contentStyle={{ background: RAISE, border: `1px solid ${B1}`, borderRadius: 6, fontSize: '0.6875rem', color: NAVY }} itemStyle={{ color: NAVY }}/>
        <Line type="monotone" dataKey="lump" name="Lump Sum $100K at start" stroke={GOLD} strokeWidth={2} dot={false}/>
        <Line type="monotone" dataKey="dca"  name="DCA $5K/yr over 20 years" stroke={BLUE} strokeWidth={2} dot={false}/>
      </LineChart>
    </ResponsiveContainer>
  );
}

function TimeInMarketChart() {
  const data = [
    { scenario: 'Fully invested',   final: Math.round(100000 * Math.pow(1.095, 20)) },
    { scenario: 'Miss 10 best days', final: Math.round(100000 * Math.pow(1.062, 20)) },
    { scenario: 'Miss 20 best days', final: Math.round(100000 * Math.pow(1.038, 20)) },
    { scenario: 'Miss 30 best days', final: Math.round(100000 * Math.pow(1.016, 20)) },
    { scenario: 'Miss 40 best days', final: Math.round(100000 * Math.pow(0.996, 20)) },
  ];
  const colors = [GREEN, GOLD, ORANGE, RED, '#7f1d1d'];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke={B1} vertical={false}/>
        <XAxis type="number" tickFormatter={v => fmtK(v)} tick={{ fill: T3, fontSize: 9, fontFamily: MONO }}/>
        <YAxis type="category" dataKey="scenario" width={140} tick={{ fill: T2, fontSize: 9, fontFamily: UI }}/>
        <RechartsTip formatter={v => fmt(v)} contentStyle={{ background: RAISE, border: `1px solid ${B1}`, borderRadius: 6, fontSize: '0.6875rem', color: NAVY }} itemStyle={{ color: NAVY }}/>
        <Bar dataKey="final" name="Portfolio Value" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => <Cell key={i} fill={colors[i]}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function FourPctChart() {
  const data = [];
  let bal = 1000000;
  for (let yr = 0; yr <= 30; yr++) {
    data.push({ year: yr, balance: Math.max(0, Math.round(bal)) });
    bal = bal * 1.07 - 40000;
  }
  const data2 = [];
  let bal2 = 1000000;
  for (let yr = 0; yr <= 30; yr++) {
    data2.push({ year: yr, balance: Math.max(0, Math.round(bal2)) });
    bal2 = bal2 * 1.07 - 50000;
  }
  const merged = data.map((d, i) => ({ year: d.year, fourPct: d.balance, fivePct: data2[i].balance }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={merged}>
        <CartesianGrid strokeDasharray="3 3" stroke={B1}/>
        <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} tick={{ fill: T3, fontSize: 9, fontFamily: MONO }}/>
        <YAxis tickFormatter={v => fmtK(v)} tick={{ fill: T3, fontSize: 9, fontFamily: MONO }} width={65}/>
        <RechartsTip formatter={v => fmt(v)} contentStyle={{ background: RAISE, border: `1px solid ${B1}`, borderRadius: 6, fontSize: '0.6875rem', color: NAVY }} itemStyle={{ color: NAVY }}/>
        <ReferenceLine y={0} stroke={RED} strokeDasharray="4 2" strokeWidth={1}/>
        <Line type="monotone" dataKey="fourPct" name="4% Rule ($40K/yr)" stroke={GREEN} strokeWidth={2} dot={false}/>
        <Line type="monotone" dataKey="fivePct" name="5% Rule ($50K/yr)" stroke={ORANGE} strokeWidth={2} dot={false}/>
      </LineChart>
    </ResponsiveContainer>
  );
}

function DiversificationChart() {
  const data = Array.from({ length: 20 }, (_, i) => ({
    assets: i + 1,
    risk: Math.round(22 / Math.sqrt(i + 1) + (i === 0 ? 0 : 4)),
  }));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={B1}/>
        <XAxis dataKey="assets" label={{ value: 'Number of Assets', position: 'insideBottom', offset: -2, fill: T3, fontSize: 9 }} tick={{ fill: T3, fontSize: 9, fontFamily: MONO }}/>
        <YAxis tickFormatter={v => `${v}%`} tick={{ fill: T3, fontSize: 9, fontFamily: MONO }} width={38}/>
        <RechartsTip formatter={v => `${v}%`} contentStyle={{ background: RAISE, border: `1px solid ${B1}`, borderRadius: 6, fontSize: '0.6875rem', color: NAVY }}/>
        <defs>
          <linearGradient id="divGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={INDIGO} stopOpacity={0.35}/>
            <stop offset="100%" stopColor={INDIGO} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="risk" name="Portfolio Volatility (%)" stroke={INDIGO} strokeWidth={2} fill="url(#divGrad)" dot={false}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

function FactorChart() {
  const data = [
    { factor: 'Market', premium: 6.5, color: BLUE },
    { factor: 'Value',  premium: 4.8, color: GOLD },
    { factor: 'Size',   premium: 3.2, color: INDIGO },
    { factor: 'Momentum', premium: 7.3, color: PURPLE },
    { factor: 'Profitability', premium: 3.9, color: GREEN },
    { factor: 'Low Vol', premium: 2.1, color: TEAL },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={B1} vertical={false}/>
        <XAxis dataKey="factor" tick={{ fill: T2, fontSize: 9, fontFamily: UI }}/>
        <YAxis tickFormatter={v => `${v}%`} tick={{ fill: T3, fontSize: 9, fontFamily: MONO }} width={38}/>
        <RechartsTip formatter={v => `${v}% avg annual premium`} contentStyle={{ background: RAISE, border: `1px solid ${B1}`, borderRadius: 6, fontSize: '0.6875rem', color: NAVY }}/>
        <Bar dataKey="premium" name="Historical Annual Premium" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.color}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Asset Classes data ────────────────────────────────────────── */
const ASSET_CLASSES = [
  { name: 'Cash & CDs',          risk: 1, riskLabel: 'Near Zero',  color: '#64748b', return: '4–5%',            volatility: '~0%',      taxNote: 'Interest taxed as ordinary income',                                           bestFor: 'Emergency fund, short-term goals (<2 yrs)',                              watchOut: 'Inflation erosion — 3% inflation destroys purchasing power',            examples: 'HYSA, Treasury bills, money market funds' },
  { name: 'Government Bonds',    risk: 2, riskLabel: 'Very Low',   color: TEAL,      return: '4–5%',            volatility: '2–5%',     taxNote: 'Federal taxable, state tax-exempt (Treasuries)',                             bestFor: 'Capital preservation, income, portfolio ballast',                        watchOut: 'Interest rate risk — bond prices fall when rates rise',                 examples: 'TLT, BND, I-Bonds, TIPS, 2/10/30-yr Treasuries' },
  { name: 'Corporate & Muni Bonds', risk: 3, riskLabel: 'Low',    color: '#06b6d4', return: '4–7%',            volatility: '3–8%',     taxNote: 'Corp: ordinary income. Muni: federal tax-exempt (often state too)',        bestFor: 'Income generation, tax-advantaged accounts or high brackets',           watchOut: 'Credit risk (default), call risk on munis',                            examples: 'AGG, LQD, MUB, HYG (high yield = higher risk)' },
  { name: 'Structured Notes',    risk: 3, riskLabel: 'Low–Med',   color: INDIGO,    return: '5–15% (capped)', volatility: 'Buffered', taxNote: 'Gains taxed as ordinary income at maturity unless structured differently',  bestFor: 'Investors wanting market upside with downside protection',               watchOut: 'Issuer credit risk, illiquid, complex tax treatment, early exit penalties', examples: 'Buffer ETFs (BJUL, PJUL), bank-issued structured notes' },
  { name: 'REITs',               risk: 4, riskLabel: 'Medium',    color: ORANGE,    return: '7–12%',           volatility: '12–20%',   taxNote: 'Dividends mostly ordinary income (not qualified) — hold in IRA/401k',     bestFor: 'Real estate exposure without buying property; high income',              watchOut: 'Rate sensitive, high tax drag in taxable accounts',                     examples: 'VNQ, O (Realty Income), SPG, VICI, AMT' },
  { name: 'Mutual Funds',        risk: 4, riskLabel: 'Varies',    color: '#a78bfa', return: '6–12%',           volatility: '10–20%',   taxNote: 'Capital gains distributions taxable even if you didn\'t sell — tax-inefficient', bestFor: 'Retirement accounts (401k, IRA) where distributions don\'t trigger tax', watchOut: 'Higher expense ratios than ETFs; tax drag in brokerage',               examples: 'VTSAX, FXAIX, PRWCX, PIMCO Total Return' },
  { name: 'Index Funds / ETFs',  risk: 4, riskLabel: 'Medium',    color: BLUE,      return: '8–11% (S&P hist)', volatility: '15–18%', taxNote: 'Low turnover = minimal capital gains distributions. Very tax-efficient.',  bestFor: 'Core of any portfolio — all account types. Best cost/return ratio.',    watchOut: 'No downside protection — you ride the market all the way down',        examples: 'SPY, VOO, VTI, SCHB, QQQ, VXF, VXUS' },
  { name: 'Dividend Stocks',     risk: 4, riskLabel: 'Medium',    color: GREEN,     return: '6–10%',           volatility: '12–18%',   taxNote: 'Qualified dividends: 0%/15%/20%. Non-qualified: ordinary income. Hold in IRA to defer.', bestFor: 'Income generation; Roth IRA for tax-free dividend compounding',     watchOut: 'Dividend cuts hurt price; concentrated sector exposure',               examples: 'SCHD, VYM, JEPI, JNJ, KO, Realty Income' },
  { name: 'Growth Stocks',       risk: 5, riskLabel: 'High',      color: GOLD,      return: '0–40%+ (high var)', volatility: '25–60%', taxNote: 'Hold >1yr for long-term cap gains (0%/15%/20%). Short-term = ordinary income.', bestFor: 'Long-term growth; Roth IRA is ideal — gains never taxed',          watchOut: 'Extreme volatility; many companies fail; emotional discipline required', examples: 'AAPL, NVDA, MSFT, TSLA, AMZN — individual selection risk' },
  { name: 'Sector ETFs',         risk: 5, riskLabel: 'High',      color: '#f43f5e', return: 'Varies by cycle', volatility: '20–35%',   taxNote: 'Same as ETFs — generally tax-efficient; dividends may be ordinary income',  bestFor: 'Tactical overweights when you have conviction on a sector cycle',       watchOut: 'Concentration risk; timing sectors is difficult even for professionals', examples: 'XLK (tech), XLE (energy), XLF (financials), ARKK (speculative)' },
  { name: 'Precious Metals',     risk: 5, riskLabel: 'High',      color: '#fbbf24', return: '2–8% long term',  volatility: '15–25%',   taxNote: 'Physical gold/silver taxed as collectibles — 28% max rate. ETFs vary.',    bestFor: 'Inflation hedge, crisis insurance, portfolio diversifier (5–10% max)', watchOut: 'No cash flow or dividends; storage costs; underperforms stocks long-term', examples: 'GLD, SLV, IAU, physical gold coins, mining stocks (GDX)' },
  { name: 'Cryptocurrency',      risk: 7, riskLabel: 'Extreme',   color: ORANGE,    return: '-80% to +1000%',  volatility: '60–150%+', taxNote: 'Every sale/trade/swap is a taxable event. Short-term = ordinary income. Long-term = capital gains.', bestFor: 'Pure speculation with money you can afford to lose entirely; 1–5% max', watchOut: 'Regulatory risk, hack risk, exchange collapse, 80%+ drawdowns common', examples: 'BTC, ETH — everything else is speculative. Use cold storage.' },
];

function RiskBar({ level }) {
  const max = 7;
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {Array.from({ length: max }, (_, i) => (
        <div key={i} style={{ width: 12, height: 5, borderRadius: 2, background: i < level ? (level <= 2 ? TEAL : level <= 3 ? BLUE : level <= 5 ? GOLD : level === 6 ? ORANGE : RED) : B2 }}/>
      ))}
    </div>
  );
}

function AssetClassSection() {
  const [selected, setSelected] = useState(null);
  const ac = selected !== null ? ASSET_CLASSES[selected] : null;

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 1rem', fontFamily: UI }}>
        Every investment sits on a risk-return spectrum. Understanding where each asset class falls — and why — is the foundation of smart portfolio construction. Click any card to see the full breakdown.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 8, marginBottom: '1rem' }}>
        {ASSET_CLASSES.map((a, i) => (
          <button key={i} onClick={() => setSelected(selected === i ? null : i)} style={{
            textAlign: 'left', padding: '0.625rem 0.75rem', borderRadius: 9, cursor: 'pointer',
            border: `1px solid ${selected === i ? a.color : B1}`,
            background: selected === i ? `${a.color}12` : RAISE,
            transition: 'all 0.15s',
          }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: a.color, marginBottom: 5, fontFamily: UI }}>{a.name}</div>
            <RiskBar level={a.risk}/>
            <div style={{ fontSize: '0.5rem', color: T3, marginTop: 4, letterSpacing: '0.05em', fontFamily: UI }}>
              RISK: {a.riskLabel} · RETURN: {a.return}
            </div>
          </button>
        ))}
      </div>

      {ac && (
        <div style={{ background: RAISE, borderRadius: 10, border: `1px solid ${ac.color}40`, padding: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
            <div style={{ width: 4, height: 36, background: ac.color, borderRadius: 2, flexShrink: 0 }}/>
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: ac.color, fontFamily: UI }}>{ac.name}</div>
              <RiskBar level={ac.risk}/>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '0.5rem', color: T3, letterSpacing: '0.08em', fontFamily: UI }}>TYPICAL ANNUAL RETURN</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: MONO, color: ac.color }}>{ac.return}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <InfoTile label="Examples"        value={ac.examples}   color={ac.color}/>
            <InfoTile label="Volatility"      value={ac.volatility} color={ac.color}/>
            <InfoTile label="Tax Treatment"   value={ac.taxNote}    color={ORANGE}/>
            <InfoTile label="Best For"        value={ac.bestFor}    color={GREEN}/>
            <div style={{ gridColumn: '1/-1' }}>
              <InfoTile label="Watch Out For" value={ac.watchOut}   color={RED}/>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.5rem', color: T3, letterSpacing: '0.08em', fontFamily: UI }}>RISK SCALE →</span>
        {[[1, TEAL, 'Near Zero'], [2, TEAL, 'Very Low'], [3, BLUE, 'Low'], [4, GOLD, 'Medium'], [5, ORANGE, 'High'], [7, RED, 'Extreme']].map(([l, c, lbl]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: c, opacity: l / 7 + 0.3 }}/>
            <span style={{ fontSize: '0.5rem', color: T3, fontFamily: UI }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Asset Location data ───────────────────────────────────────── */
const LOCATION_ROWS = [
  { asset: 'Bonds / Bond Funds (AGG, BND, TLT)',     taxDrag: 'High — interest = ordinary income annually',      best: 'Traditional 401k or Traditional IRA',               ok: 'Roth IRA (if no other option)',                              avoid: 'Taxable brokerage — annual tax drag destroys returns',          reason: 'Defer ordinary income tax. Bonds are least tax-efficient.' },
  { asset: 'REITs (VNQ, O, VICI)',                    taxDrag: 'High — dividends mostly non-qualified ordinary income', best: 'Roth IRA or Traditional IRA/401k',              ok: 'Any tax-advantaged account',                                  avoid: 'Taxable brokerage — REIT dividends taxed at up to 37%',         reason: 'REIT dividends are taxed as ordinary income — shelter them.' },
  { asset: 'Active Mutual Funds',                     taxDrag: 'High — capital gain distributions each year even if you didn\'t sell', best: 'Traditional IRA or 401k', ok: 'Roth IRA',                                                 avoid: 'Taxable brokerage — uncontrollable tax distributions',          reason: 'You get taxed on the fund\'s internal trades. Defer this.' },
  { asset: 'Index ETFs / Index Funds (SPY, VTI)',     taxDrag: 'Low — minimal distributions, very tax-efficient', best: 'Taxable brokerage (most flexible) or any account', ok: 'Any account works well',                                     avoid: 'Nothing — ETFs are tax-efficient everywhere',                   reason: 'Low turnover = few capital gains events. Fine in taxable.' },
  { asset: 'Growth Stocks (held long-term)',          taxDrag: 'Low if held >1 year — long-term capital gains rates', best: 'Roth IRA (gains never taxed) or brokerage',   ok: 'Any account',                                                 avoid: 'Traditional IRA/401k — converts favorable cap gains to ordinary income at withdrawal', reason: 'Long-term cap gains rates (0–20%) beat ordinary income (up to 37%). Keep in Roth or brokerage.' },
  { asset: 'High-Dividend Stocks (SCHD, JEPI)',       taxDrag: 'Medium — qualified dividends at 0/15/20%',         best: 'Roth IRA (never taxed) or Traditional IRA (defer)', ok: 'Taxable if low income (0% rate on qualified divs)',          avoid: 'None specifically, but Roth maximizes long-term compounding',   reason: 'Shelter dividend income in tax-advantaged accounts for compounding.' },
  { asset: 'Municipal Bonds (MUB)',                   taxDrag: 'None federally — interest is tax-exempt',           best: 'Taxable brokerage — already getting tax-free income', ok: 'Low income investors (may not need the tax exemption)',    avoid: 'IRA/401k — wastes the tax exemption inside a tax-sheltered account', reason: 'Munis are self-sheltering. Putting them in an IRA wastes the benefit.' },
  { asset: 'Precious Metals / Commodity ETFs (GLD)',  taxDrag: 'High — taxed as collectibles at 28% max rate',     best: 'Traditional IRA or Roth IRA',                        ok: '401k (if available)',                                        avoid: 'Taxable brokerage — collectible tax rate is punishing',         reason: 'Defer or eliminate collectible tax treatment inside retirement accounts.' },
  { asset: 'Cryptocurrency',                         taxDrag: 'Extreme — every transaction is a taxable event',   best: 'Roth IRA (via crypto-capable custodian)',            ok: 'Traditional IRA',                                            avoid: 'Taxable brokerage unless disciplined buy-and-hold investor',    reason: 'Every crypto trade is a taxable event in a brokerage. Roth eliminates this.' },
];

function AssetLocationRow({ asset, taxDrag, best, ok, avoid, reason }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${open ? INDIGO + '40' : B1}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.15s' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', background: open ? `${INDIGO}08` : RAISE, border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0.625rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.625rem', transition: 'background 0.15s' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: NAVY, fontFamily: UI }}>{asset}</div>
          <div style={{ fontSize: '0.5625rem', color: T3, marginTop: 2, fontFamily: UI }}>Tax drag: {taxDrag}</div>
        </div>
        {open ? <ChevronUp size={13} color={INDIGO}/> : <ChevronDown size={13} color={T3}/>}
      </button>
      {open && (
        <div style={{ borderTop: `1px solid ${INDIGO}20`, padding: '0.625rem 0.875rem', background: '#1e1912', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <InfoTile label="Best Account" value={best} color={GREEN}/>
          <InfoTile label="Also OK"      value={ok}   color={GOLD}/>
          <InfoTile label="Avoid"        value={avoid} color={RED}/>
          <InfoTile label="Why"          value={reason} color={INDIGO}/>
        </div>
      )}
    </div>
  );
}

function AssetLocationSection() {
  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 0.75rem', fontFamily: UI }}>
        Asset location is the strategy of placing each investment in the account where it generates the least tax drag. The same investment can have dramatically different after-tax returns depending on where you hold it.
      </p>
      <div style={{ background: `${INDIGO}09`, borderRadius: 8, padding: '0.625rem 0.875rem', border: `1px solid ${INDIGO}22`, marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: INDIGO, marginBottom: 2, fontFamily: UI }}>The Core Rule</div>
        <div style={{ fontSize: '0.6875rem', color: T2, lineHeight: 1.6, fontFamily: UI }}>
          Tax-inefficient assets (bonds, REITs, active funds) → Tax-advantaged accounts (IRA, 401k, Roth). Tax-efficient assets (index ETFs, buy-and-hold stocks) → Taxable brokerage. Your highest-growth assets → Roth (gains are never taxed).
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {LOCATION_ROWS.map((r, i) => <AssetLocationRow key={i} {...r}/>)}
      </div>
    </div>
  );
}

/* ── Priority Ladder ───────────────────────────────────────────── */
const LADDER_STEPS = [
  { step: 1, title: '401k — Up to Employer Match', color: GOLD,    icon: Target,
    why:     'Free money. If your employer matches 50¢ per dollar up to 6% of salary, that\'s an instant 50% return on your contribution before any market growth.',
    how:     'Contribute exactly enough to capture 100% of the employer match. Not a dollar less.',
    numbers: 'Example: $80K salary with 4% match = contribute $3,200 minimum to get $3,200 free from employer.',
    skip:    'If you skip the match, you\'re leaving guaranteed money on the table. This is the only investment with a 100% guaranteed first-year return.' },
  { step: 2, title: 'HSA — Health Savings Account (if eligible)', color: TEAL, icon: Shield,
    why:     'The only triple-tax-advantaged account: deductible contributions, tax-free growth, tax-free withdrawals for medical. After 65, use for anything (like a Traditional IRA).',
    how:     'Must have a High-Deductible Health Plan (HDHP). 2026 limits: $4,400 individual / $8,750 family (+$1,000 catch-up age 55+).',
    numbers: 'A 30-year-old who maxes HSA annually and invests the balance could accumulate $500K+ tax-free by retirement.',
    skip:    'If you don\'t have an HDHP, skip to step 3.' },
  { step: 3, title: 'Roth IRA — Max It Out', color: GREEN, icon: TrendingUp,
    why:     'Tax-free growth forever, no RMDs, most flexible retirement account. Your most valuable long-term account.',
    how:     '$7,500/yr ($8,600 if 50+) — 2026 CFP limits. Income limits: $153K–$168K single / $242K–$252K MFJ. Use Backdoor Roth if over the limit.',
    numbers: '$7,500/yr for 30 years at 8% return = $916K — all completely tax-free.',
    skip:    'If income exceeds limits and Backdoor Roth feels complex, skip to step 4 and revisit.' },
  { step: 4, title: '401k / Roth 401k — Max the Rest', color: BLUE, icon: BarChart2,
    why:     '$24,500/yr of tax-advantaged space is massive. After getting the match and funding Roth IRA, fill the remaining 401k space.',
    how:     '$24,500 total (Traditional + Roth 401k combined). $32,500 if 50+; $35,750 if ages 60–63 (SECURE 2.0). Choose Traditional vs Roth based on marginal tax rate.',
    numbers: 'Maxing 401k at $24,500/yr for 30 years at 8% = $3.0M before taxes.',
    skip:    'If cash flow is tight after steps 1–3, contribute what you can. Even $100/mo extra matters.' },
  { step: 5, title: 'Taxable Brokerage — No Limit', color: ORANGE, icon: Activity,
    why:     'After maxing tax-advantaged accounts, a taxable brokerage provides unlimited capacity, full liquidity, and long-term capital gains treatment.',
    how:     'Invest in tax-efficient vehicles: index ETFs, buy-and-hold individual stocks, municipal bonds. Avoid frequent trading.',
    numbers: 'No contribution limits. $10K/yr at 8% for 30 years = $1.2M, taxed at capital gains rates (not ordinary income).',
    skip:    'Also the vehicle for early retirement — no age restrictions on access.' },
  { step: 6, title: '529 / Education Accounts (if applicable)', color: PURPLE, icon: BookOpen,
    why:     '529 plans grow tax-free when used for qualified education expenses. SECURE 2.0: unused 529 funds can roll to Roth IRA (lifetime $35K limit, 15-year rule).',
    how:     'No federal limit. State deduction limits vary. Invest in age-based portfolios. Annual gift tax exclusion: $19,000/yr per beneficiary (2026).',
    numbers: '$500/mo for 18 years at 7% = $197K for education — all withdrawals tax-free if used for education.',
    skip:    'Optional if no education funding goals. Can be funded after steps 1–5.' },
];

function PriorityLadderSection() {
  const [openStep, setOpenStep] = useState(null);
  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 1rem', fontFamily: UI }}>
        The order in which you fund investment accounts dramatically affects your lifetime wealth. This ladder maximizes tax advantages, captures free money, and ensures you don't miss critical opportunities at each stage.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {LADDER_STEPS.map((s, i) => {
          const Icon  = s.icon;
          const isLast = i === LADDER_STEPS.length - 1;
          const open  = openStep === s.step;
          return (
            <div key={s.step} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              {/* Connector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${s.color}20`, border: `2px solid ${s.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 800, color: s.color, fontFamily: UI }}>{s.step}</div>
                {!isLast && <div style={{ width: 2, flex: 1, minHeight: 14, background: `${s.color}30`, marginTop: 4 }}/>}
              </div>
              {/* Card */}
              <div style={{ flex: 1, background: RAISE, borderRadius: 9, overflow: 'hidden', border: `1px solid ${open ? s.color + '45' : B1}`, marginBottom: isLast ? 0 : '0.25rem', transition: 'border-color 0.15s' }}>
                <button onClick={() => setOpenStep(open ? null : s.step)} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 0.875rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon size={16} color={s.color}/>
                  <div style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 700, color: s.color, fontFamily: UI }}>{s.title}</div>
                  {open ? <ChevronUp size={13} color={T3}/> : <ChevronDown size={13} color={T3}/>}
                </button>
                {open && (
                  <div style={{ padding: '0 0.875rem 0.875rem', borderTop: `1px solid ${s.color}20` }}>
                    <div style={{ paddingTop: '0.625rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <InfoTile label="Why This Step"         value={s.why}     color={s.color}/>
                      <InfoTile label="How to Execute"        value={s.how}     color={BLUE}/>
                      <InfoTile label="The Numbers"           value={s.numbers} color={GREEN}/>
                      <InfoTile label="When to Skip / Modify" value={s.skip}    color={ORANGE}/>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '1rem', padding: '0.75rem 0.875rem', background: `${GREEN}08`, borderRadius: 8, border: `1px solid ${GREEN}22` }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: GREEN, marginBottom: 4, fontFamily: UI }}>The Bottom Line</div>
        <div style={{ fontSize: '0.6875rem', color: T2, lineHeight: 1.6, fontFamily: UI }}>
          A 30-year-old who follows this ladder from day one — capturing employer match, maxing HSA + Roth IRA + 401k — and invests in low-cost index funds at historical returns could accumulate $3–5M+ by retirement. The most important variable is starting. Not the market. Not the fund selection. Starting early.
        </div>
      </div>
    </div>
  );
}

/* ── Drawdown Recovery Calculator ─────────────────────────────── */
function DrawdownCalc() {
  const [loss, setLoss] = useState(30);
  const needed = ((1 / (1 - loss / 100)) - 1) * 100;
  const historicalData = [
    { label: '2022 Bear',       drawdown: -27, recovery: 14 },
    { label: '2020 COVID',      drawdown: -34, recovery: 5  },
    { label: '2018 Q4',         drawdown: -20, recovery: 6  },
    { label: '2008–09 GFC',     drawdown: -57, recovery: 48 },
    { label: '2000–02 Dot-com', drawdown: -49, recovery: 84 },
    { label: '1929 Depression', drawdown: -89, recovery: 300},
  ];
  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 1rem', fontFamily: UI }}>
        A 50% loss requires a 100% gain to recover. The math of losses is asymmetric — which is why avoiding catastrophic drawdowns matters as much as generating returns.
      </p>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: NAVY, marginBottom: '0.5rem', fontFamily: UI }}>Drawdown: <span style={{ color: RED, fontFamily: MONO }}>{loss}%</span></div>
        <input type="range" min={5} max={89} value={loss} onChange={e => setLoss(Number(e.target.value))} style={{ width: '100%', accentColor: RED }}/>
        <div style={{ marginTop: '0.75rem', padding: '0.875rem', background: `${RED}09`, border: `1px solid ${RED}25`, borderRadius: 9, textAlign: 'center' }}>
          <div style={{ fontSize: '0.625rem', color: T3, fontFamily: UI, marginBottom: 4 }}>GAIN REQUIRED TO RECOVER</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: RED, fontFamily: MONO }}>+{needed.toFixed(1)}%</div>
        </div>
      </div>
      <div style={{ fontSize: '0.5625rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: T3, marginBottom: '0.5rem', fontFamily: UI }}>Historical Drawdowns & Recovery Times</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 6 }}>
        {historicalData.map((d, i) => (
          <div key={i} style={{ padding: '0.625rem 0.75rem', background: RAISE, borderRadius: 8, border: `1px solid ${B1}` }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: NAVY, marginBottom: 4, fontFamily: UI }}>{d.label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.5rem', color: T3, fontFamily: UI }}>DRAWDOWN</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: RED, fontFamily: MONO }}>{d.drawdown}%</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.5rem', color: T3, fontFamily: UI }}>RECOVERY</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: GOLD, fontFamily: MONO }}>{d.recovery}mo</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── DCA vs Lump Sum Calculator ────────────────────────────────── */
function DCAToolCalc() {
  const [amount, setAmount]   = useState(120000);
  const [months, setMonths]   = useState(12);
  const [rate, setRate]       = useState(8);
  const [horizon, setHorizon] = useState(20);

  const result = useMemo(() => {
    const r = rate / 100;
    // Lump sum: invest all now
    const lumpFV = amount * Math.pow(1 + r, horizon);
    // DCA: invest amount/months each month for `months` months, then hold rest
    const monthly = amount / months;
    const monthlyRate = r / 12;
    let dcaFV = 0;
    for (let m = 0; m < months; m++) {
      const yearsRemaining = horizon - m / 12;
      dcaFV += monthly * Math.pow(1 + r, yearsRemaining);
    }
    return { lumpFV: Math.round(lumpFV), dcaFV: Math.round(dcaFV), diff: Math.round(lumpFV - dcaFV) };
  }, [amount, months, rate, horizon]);

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 1rem', fontFamily: UI }}>
        Research shows lump sum investing outperforms DCA approximately 2/3 of the time. But DCA reduces emotional risk for volatile markets. Compare both strategies with your numbers.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
        {[
          { label: 'Total Amount to Invest ($)', value: amount, set: setAmount, min: 10000, max: 1000000, step: 5000 },
          { label: 'DCA Period (months)', value: months, set: setMonths, min: 1, max: 36, step: 1 },
          { label: 'Annual Return (%)', value: rate, set: setRate, min: 1, max: 15, step: 0.5 },
          { label: 'Time Horizon (years)', value: horizon, set: setHorizon, min: 5, max: 40, step: 1 },
        ].map(({ label, value, set, min, max, step }) => (
          <div key={label}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: NAVY, marginBottom: '0.375rem', display: 'block', fontFamily: UI }}>{label}</label>
            <input type="number" value={value} min={min} max={max} step={step} onChange={e => set(Number(e.target.value))}
              style={{ width: '100%', padding: '8px 12px', border: `1.5px solid ${B2}`, borderRadius: 8, fontSize: '0.9375rem', fontFamily: MONO, color: NAVY, fontWeight: 600, background: RAISE, boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = INDIGO} onBlur={e => e.target.style.borderColor = B2}/>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: '1rem' }}>
        <div style={{ padding: '0.875rem', background: `${GOLD}09`, border: `1px solid ${GOLD}25`, borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontSize: '0.5625rem', color: T3, fontFamily: UI, marginBottom: 3 }}>LUMP SUM FINAL VALUE</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: GOLD, fontFamily: MONO }}>{fmtK(result.lumpFV)}</div>
        </div>
        <div style={{ padding: '0.875rem', background: `${BLUE}09`, border: `1px solid ${BLUE}25`, borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontSize: '0.5625rem', color: T3, fontFamily: UI, marginBottom: 3 }}>DCA FINAL VALUE</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: BLUE, fontFamily: MONO }}>{fmtK(result.dcaFV)}</div>
        </div>
        <div style={{ padding: '0.875rem', background: result.diff > 0 ? `${GOLD}09` : `${BLUE}09`, border: `1px solid ${result.diff > 0 ? GOLD : BLUE}25`, borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontSize: '0.5625rem', color: T3, fontFamily: UI, marginBottom: 3 }}>LUMP SUM ADVANTAGE</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: result.diff > 0 ? GOLD : BLUE, fontFamily: MONO }}>{result.diff > 0 ? '+' : ''}{fmtK(result.diff)}</div>
        </div>
      </div>
      <DCAChart/>
    </div>
  );
}

/* ── 4% Rule Calculator ────────────────────────────────────────── */
function WithdrawalCalc() {
  const [portfolio, setPortfolio] = useState(1000000);
  const [rate, setRate]           = useState(4);
  const [returnRate, setReturnRate] = useState(7);
  const [years, setYears]         = useState(30);

  const annual   = portfolio * (rate / 100);
  const monthly  = annual / 12;
  const projData = useMemo(() => {
    const data = [];
    let bal = portfolio;
    for (let yr = 0; yr <= years; yr++) {
      data.push({ year: yr, balance: Math.max(0, Math.round(bal)) });
      bal = bal * (1 + returnRate / 100) - annual;
    }
    return data;
  }, [portfolio, rate, returnRate, years]);
  const survives = projData[projData.length - 1].balance > 0;

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 1rem', fontFamily: UI }}>
        The 4% Rule (Bengen 1994 / Trinity Study 1998): withdraw 4% of your starting portfolio annually — inflation-adjusted — with ~90% historical probability of lasting 30 years. Model your own scenario.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
        {[
          { label: 'Starting Portfolio ($)', value: portfolio, set: setPortfolio, min: 100000, max: 10000000, step: 50000 },
          { label: 'Withdrawal Rate (%)',    value: rate,      set: setRate,      min: 1,      max: 10,       step: 0.1   },
          { label: 'Expected Annual Return (%)', value: returnRate, set: setReturnRate, min: 1, max: 12,     step: 0.5   },
          { label: 'Retirement Length (years)', value: years,   set: setYears,     min: 10,     max: 50,      step: 1     },
        ].map(({ label, value, set, min, max, step }) => (
          <div key={label}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: NAVY, marginBottom: '0.375rem', display: 'block', fontFamily: UI }}>{label}</label>
            <input type="number" value={value} min={min} max={max} step={step} onChange={e => set(Number(e.target.value))}
              style={{ width: '100%', padding: '8px 12px', border: `1.5px solid ${B2}`, borderRadius: 8, fontSize: '0.9375rem', fontFamily: MONO, color: NAVY, fontWeight: 600, background: RAISE, boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = INDIGO} onBlur={e => e.target.style.borderColor = B2}/>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1rem' }}>
        <div style={{ padding: '0.875rem', background: `${INDIGO}09`, border: `1px solid ${INDIGO}25`, borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontSize: '0.5625rem', color: T3, fontFamily: UI, marginBottom: 3 }}>ANNUAL WITHDRAWAL</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: INDIGO, fontFamily: MONO }}>{fmtK(annual)}</div>
        </div>
        <div style={{ padding: '0.875rem', background: `${TEAL}09`, border: `1px solid ${TEAL}25`, borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontSize: '0.5625rem', color: T3, fontFamily: UI, marginBottom: 3 }}>MONTHLY INCOME</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: TEAL, fontFamily: MONO }}>{fmtK(monthly)}</div>
        </div>
        <div style={{ padding: '0.875rem', background: `${survives ? GREEN : RED}09`, border: `1px solid ${survives ? GREEN : RED}25`, borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontSize: '0.5625rem', color: T3, fontFamily: UI, marginBottom: 3 }}>PORTFOLIO SURVIVES?</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: survives ? GREEN : RED, fontFamily: UI }}>{survives ? 'Yes' : 'Depleted'}</div>
        </div>
      </div>
      <FourPctChart/>
    </div>
  );
}

/* ── Tabs ──────────────────────────────────────────────────────── */
const TABS = [
  { id: 'learn',   label: 'Learn',   icon: BookOpen   },
  { id: 'tools',   label: 'Tools',   icon: Calculator },
];

/* ── Main Page ─────────────────────────────────────────────────── */
export default function Portfolio() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('learn');

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: UI }}>

      {/* Header */}
      <div style={{ background: SURF, borderBottom: `1px solid ${B1}`, padding: '2rem 2.5rem 0' }}>
        <div style={{ fontSize: '0.75rem', color: T3, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => navigate('/fun')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: INDIGO, fontSize: '0.75rem', fontFamily: UI, padding: 0 }}>Dashboard</button>
          <ChevronRight size={12} color={T3}/>
          <span style={{ fontFamily: UI }}>Portfolio & Investing</span>
        </div>
        <h1 style={{ fontFamily: DISP, fontSize: '2rem', fontWeight: 700, color: NAVY, margin: '0 0 0.5rem', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
          Portfolio & Investing
        </h1>
        <p style={{ margin: '0 0 1.75rem', fontSize: '1rem', color: T2, lineHeight: 1.65, maxWidth: 600, fontFamily: UI }}>
          Master risk metrics, asset classes, portfolio theory, withdrawal strategies, and the science of building a tax-efficient long-term portfolio.
        </p>
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          {TABS.map(t => {
            const Icon   = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '0.75rem 1.25rem',
                background: 'none', border: 'none', borderBottom: `2px solid ${active ? INDIGO : 'transparent'}`,
                cursor: 'pointer', fontFamily: UI, fontSize: '0.875rem',
                fontWeight: active ? 700 : 500, color: active ? INDIGO : T2,
                marginBottom: -1, transition: 'color 0.15s', whiteSpace: 'nowrap',
              }}><Icon size={14}/>{t.label}</button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '2rem 2.5rem', maxWidth: 900, margin: '0 auto' }}>

        {/* ── LEARN TAB ── */}
        {tab === 'learn' && (
          <>
            {/* ── Asset Classes ── */}
            <SectionCard title="Asset Classes & Risk Spectrum" subtitle="Stocks, ETFs, bonds, REITs, crypto, metals — risk rated and explained" icon={Layers}>
              <AssetClassSection/>
            </SectionCard>

            {/* ── Risk Metrics ── */}
            <SectionCard title="Portfolio Risk Metrics" subtitle="Volatility, Sharpe ratio, beta, alpha — how institutions measure and manage risk" icon={Activity} accent={RED}>
              <Accordion title="Standard Deviation & Volatility" subtitle="Why volatility is the price of returns — and how to measure it" icon={BarChart2} accent={RED} defaultOpen>
                <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 0.75rem', fontFamily: UI }}>Standard deviation measures how much an investment's returns vary around its average. A portfolio with 10% annual volatility can swing ±10% from its expected return in a typical year.</p>
                <Formula>Volatility = √( Σ(return − avg)² / n )</Formula>
                <VolChart/>
                <div style={{ marginTop: '0.75rem' }}>
                  <KeyPoint color={RED}>High volatility = wider range of outcomes = more emotional challenge</KeyPoint>
                  <KeyPoint color={GREEN}>Low volatility = smoother ride, but typically lower long-run returns</KeyPoint>
                  <KeyPoint>A 60/40 portfolio averages ~10% annual vol. A 100% equity portfolio ~17–22% vol.</KeyPoint>
                  <KeyPoint>Institutional investors like pension funds target maximum return at a specified volatility budget.</KeyPoint>
                </div>
              </Accordion>

              <Accordion title="Sharpe Ratio" subtitle="The gold standard of risk-adjusted return measurement" icon={Zap} accent={GOLD}>
                <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 0.75rem', fontFamily: UI }}>The Sharpe Ratio measures return earned <em>per unit of risk taken</em>. A higher Sharpe means you earned more return for each percent of volatility you accepted.</p>
                <Formula>Sharpe Ratio = (Portfolio Return − Risk-Free Rate) / Portfolio Volatility</Formula>
                <p style={{ fontSize: '0.8125rem', color: T2, lineHeight: 1.6, margin: '0 0 0.75rem', fontFamily: UI }}>Example: A portfolio returning 10% with 12% volatility, versus a 5% risk-free rate: Sharpe = (10−5)/12 = <strong style={{ color: GOLD, fontFamily: MONO }}>0.42</strong></p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, margin: '0.75rem 0' }}>
                  {[['< 0', 'Negative', RED], ['0–0.5', 'Poor', ORANGE], ['0.5–1.0', 'Acceptable', YELLOW], ['1.0–2.0', 'Good', GREEN], ['2.0+', 'Excellent', TEAL]].map(([r, q, c]) => (
                    <div key={r} style={{ textAlign: 'center', padding: '0.5rem', background: RAISE, borderRadius: 7 }}>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: c, fontFamily: MONO }}>{r}</div>
                      <div style={{ fontSize: '0.5rem', color: T3, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2, fontFamily: UI }}>{q}</div>
                    </div>
                  ))}
                </div>
                <KeyPoint color={GREEN}>Most diversified equity portfolios target 0.7–1.0 Sharpe over full market cycles.</KeyPoint>
                <KeyPoint>The Sortino Ratio only penalizes downside volatility — often preferred for income portfolios.</KeyPoint>
              </Accordion>

              <Accordion title="Beta & Alpha" subtitle="Measuring market sensitivity and manager skill" icon={TrendingUp} accent={BLUE}>
                <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 0.75rem', fontFamily: UI }}><strong style={{ color: GOLD }}>Beta</strong> measures how much a portfolio moves relative to the market. Beta of 1.0 = moves exactly with the S&P 500. Beta of 1.5 = moves 50% more. Beta of 0.5 = moves half as much.</p>
                <Formula>Beta = Covariance(portfolio, market) / Variance(market)</Formula>
                <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 0.75rem', fontFamily: UI }}><strong style={{ color: GOLD }}>Alpha</strong> measures excess return above what Beta alone predicts. Positive alpha = manager added value beyond market exposure. Most passive funds have alpha near zero.</p>
                <Formula>Alpha = Portfolio Return − (Risk-Free Rate + Beta × (Market Return − Risk-Free Rate))</Formula>
                <div style={{ marginTop: '0.5rem' }}>
                  <KeyPoint color={RED}>High beta (&gt;1.2) = amplified market swings in both directions</KeyPoint>
                  <KeyPoint color={GREEN}>Low beta (0.3–0.6) = defensive portfolios (bonds, utilities, gold)</KeyPoint>
                  <KeyPoint>Most retail investors should focus on beta management, not chasing alpha.</KeyPoint>
                  <KeyPoint>R-Squared (0–100) measures how much of portfolio movement is explained by the market benchmark.</KeyPoint>
                </div>
              </Accordion>
            </SectionCard>

            {/* ── Portfolio Theory ── */}
            <SectionCard title="Portfolio Theory & Strategy" subtitle="MPT, factor investing, diversification — the science behind portfolio construction" icon={Target} accent={INDIGO}>
              <Accordion title="Modern Portfolio Theory (MPT)" subtitle="Markowitz 1952 — the math behind diversification" icon={Target} accent={INDIGO} defaultOpen>
                <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 0.75rem', fontFamily: UI }}>Harry Markowitz proved in 1952 that by combining assets with low correlations, investors can reduce portfolio risk without sacrificing return. This is the mathematical proof of "don't put all your eggs in one basket."</p>
                <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 0.75rem', fontFamily: UI }}>The <strong style={{ color: INDIGO }}>Efficient Frontier</strong> is the set of portfolios that maximize return for each level of risk. No rational investor should hold a portfolio below the frontier.</p>
                <DiversificationChart/>
                <div style={{ marginTop: '0.75rem' }}>
                  <KeyPoint color={GREEN}>Adding uncorrelated assets reduces total portfolio volatility</KeyPoint>
                  <KeyPoint>Two assets with −1.0 correlation can theoretically eliminate all risk</KeyPoint>
                  <KeyPoint>Real diversification requires assets that behave differently in crisis periods</KeyPoint>
                  <KeyPoint color={RED}>The 2022 bear market showed stocks AND bonds both fell — MPT assumptions were tested</KeyPoint>
                </div>
              </Accordion>

              <Accordion title="Factor Investing (Smart Beta)" subtitle="Fama-French, momentum, quality — the science of excess returns" icon={Zap} accent={PURPLE}>
                <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 0.75rem', fontFamily: UI }}>Academic research identified specific characteristics (factors) that have historically delivered excess returns over the market. Factor investing tilts portfolios toward these characteristics systematically.</p>
                <FactorChart/>
                <div style={{ marginTop: '0.75rem' }}>
                  <KeyPoint color={GOLD}>Value: Companies trading below intrinsic value outperform growth over long periods</KeyPoint>
                  <KeyPoint color={BLUE}>Size: Small-cap stocks outperform large caps with higher volatility</KeyPoint>
                  <KeyPoint color={PURPLE}>Momentum: Recent winners tend to keep winning (6–12 month effect)</KeyPoint>
                  <KeyPoint color={GREEN}>Profitability: High-profit firms outperform low-profit firms</KeyPoint>
                  <KeyPoint>Factor premiums are real but disappear for years — requires discipline and long horizon</KeyPoint>
                </div>
              </Accordion>
            </SectionCard>

            {/* ── Investing Behavior ── */}
            <SectionCard title="Investing Behavior & Strategy" subtitle="DCA, time in market, drawdowns, and the 4% Rule — what the data actually shows" icon={Calendar} accent={TEAL}>
              <Accordion title="Dollar Cost Averaging vs Lump Sum" subtitle="When to invest all at once vs spreading it out" icon={Calendar} accent={TEAL} defaultOpen>
                <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 0.75rem', fontFamily: UI }}>Research shows lump sum investing outperforms dollar cost averaging (DCA) approximately two-thirds of the time, because markets trend upward over time. However, DCA reduces regret and sequence-of-returns risk for risk-averse investors.</p>
                <DCAChart/>
                <div style={{ marginTop: '0.75rem' }}>
                  <KeyPoint color={GREEN}>Lump sum wins ~67% of the time over 12-month DCA windows (Vanguard, 2012)</KeyPoint>
                  <KeyPoint>DCA wins when markets decline after investment — reduces regret and emotional damage</KeyPoint>
                  <KeyPoint color={GOLD}>For regular wage earners, DCA is automatic via paycheck contributions — this is optimal</KeyPoint>
                  <KeyPoint>For windfalls (inheritance, bonus, stock options): lump sum if you can handle volatility</KeyPoint>
                </div>
              </Accordion>

              <Accordion title="Time in Market vs Market Timing" subtitle="Why missing the best days is catastrophic" icon={Clock} accent={RED}>
                <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 0.75rem', fontFamily: UI }}>Missing just the 10 best trading days over 20 years can cut your final portfolio value by nearly half. The best days often occur during extreme volatility — when panic sellers are out of the market.</p>
                <TimeInMarketChart/>
                <div style={{ marginTop: '0.75rem' }}>
                  <KeyPoint color={RED}>Timing requires being right twice — when to exit AND when to re-enter</KeyPoint>
                  <KeyPoint color={GREEN}>Staying fully invested through all market conditions is the most reliable strategy for most investors</KeyPoint>
                  <KeyPoint>The best 10 days over 20 years often cluster around the worst periods (COVID 2020, GFC 2008–09)</KeyPoint>
                  <KeyPoint>Professional traders who attempt market timing underperform passive indices ~85% of the time over 10 years</KeyPoint>
                </div>
              </Accordion>

              <Accordion title="Maximum Drawdown & Recovery" subtitle="Understanding the true cost of portfolio losses" icon={TrendingDown} accent={ORANGE}>
                <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 0.75rem', fontFamily: UI }}>Maximum drawdown is the largest peak-to-trough decline in portfolio history. Understanding recovery math is critical: a 50% loss requires a 100% gain to recover.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 6, margin: '0.75rem 0' }}>
                  {[[-10, 11.1], [-20, 25], [-30, 42.9], [-40, 66.7], [-50, 100], [-60, 150], [-80, 400], [-89, 809]].map(([l, r]) => (
                    <div key={l} style={{ textAlign: 'center', padding: '0.5rem', background: RAISE, borderRadius: 7 }}>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 900, color: RED, fontFamily: MONO }}>{l}%</div>
                      <div style={{ fontSize: '0.5rem', color: T3, margin: '2px 0', fontFamily: UI }}>loss</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: GREEN, fontFamily: MONO }}>+{r}%</div>
                      <div style={{ fontSize: '0.5rem', color: T3, fontFamily: UI }}>to recover</div>
                    </div>
                  ))}
                </div>
                <KeyPoint color={GREEN}>A diversified 60/40 portfolio's worst drawdown was −22% in 2022 vs S&P 500 −57% in GFC</KeyPoint>
                <KeyPoint color={RED}>The S&P 500 fell −89% in the Great Depression and took 25 years to recover in real terms</KeyPoint>
                <KeyPoint>Volatility harvesting (rebalancing during drawdowns) can reduce recovery time significantly</KeyPoint>
              </Accordion>

              <Accordion title="The 4% Withdrawal Rule" subtitle="How much can you safely withdraw in retirement — the Trinity Study" icon={Umbrella} accent={GREEN}>
                <p style={{ fontSize: '0.875rem', color: T2, lineHeight: 1.7, margin: '0 0 0.75rem', fontFamily: UI }}>The 4% Rule (Bengen 1994, Trinity Study 1998): A retiree can withdraw 4% of their starting portfolio annually (inflation-adjusted) with high probability of the portfolio lasting 30 years, based on historical US market returns.</p>
                <FourPctChart/>
                <p style={{ fontSize: '0.8125rem', color: T2, lineHeight: 1.6, margin: '0.75rem 0 0.5rem', fontFamily: UI }}>Starting with $1,000,000 → $40,000/year withdrawal. Sequence-of-returns risk is the key threat.</p>
                <div>
                  <KeyPoint color={GREEN}>3% withdrawal rate: ~99% historical success rate over 30 years</KeyPoint>
                  <KeyPoint color={GOLD}>4% withdrawal rate: ~90% historical success rate over 30 years</KeyPoint>
                  <KeyPoint color={YELLOW}>5% withdrawal rate: ~74% historical success rate — elevated risk</KeyPoint>
                  <KeyPoint color={RED}>The 4% rule may be too high for 40–50 year retirements or low-return environments</KeyPoint>
                  <KeyPoint>Dynamic withdrawal (reduce in down years) significantly improves success rates</KeyPoint>
                </div>
              </Accordion>
            </SectionCard>

            {/* ── Asset Location ── */}
            <SectionCard title="Asset Location Strategy" subtitle="What goes where — maximize after-tax returns by placing each investment in the right account" icon={MapPin} accent={ORANGE}>
              <AssetLocationSection/>
            </SectionCard>

          </>
        )}

        {/* ── TOOLS TAB ── */}
        {tab === 'tools' && (
          <>
            <SectionCard title="DCA vs Lump Sum Calculator" subtitle="Compare both strategies side-by-side with your numbers" icon={Calendar} accent={BLUE}>
              <DCAToolCalc/>
            </SectionCard>
            <SectionCard title="Safe Withdrawal Rate Calculator" subtitle="Model your retirement income based on the 4% Rule" icon={Umbrella} accent={GREEN}>
              <WithdrawalCalc/>
            </SectionCard>
            <SectionCard title="Drawdown & Recovery Calculator" subtitle="See how much gain you need after any loss" icon={TrendingDown} accent={RED}>
              <DrawdownCalc/>
            </SectionCard>
          </>
        )}
      </div>
    </div>
  );
}
