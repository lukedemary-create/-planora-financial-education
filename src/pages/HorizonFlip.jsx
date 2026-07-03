import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell,
} from 'recharts';
import { ArrowLeft, ArrowRight, Compass, ShieldCheck, Clock } from 'lucide-react';

/* ─── Design tokens ──────────────────────────────────────────────── */
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
  green:    '#4a7c59',
  greenDim: 'rgba(74,124,89,0.12)',
  red:      '#8b3a3a',
  redDim:   'rgba(139,58,58,0.12)',
  teal:     '#00B4C6',
  tealDim:  'rgba(0,180,198,0.08)',
};

const DISPLAY = "'Playfair Display', Georgia, serif";
const UI      = "'Inter', system-ui, sans-serif";
const MONO    = "'JetBrains Mono', 'Courier New', monospace";

/* ─── Chart data — rolling 1yr vs 10yr negative return probability ── */
// S&P 500 historical: ~30% chance of negative 1-year return, ~6% for 5yr, ~0% for 20yr
const HORIZON_DATA = [
  { horizon: '1 Year',  negProb: 28, posProb: 72, color: C.red },
  { horizon: '3 Years', negProb: 14, posProb: 86, color: '#8b5030' },
  { horizon: '5 Years', negProb:  6, posProb: 94, color: '#8b6340' },
  { horizon: '10 Years',negProb:  3, posProb: 97, color: '#6b7840' },
  { horizon: '20 Years',negProb:  0, posProb: 100, color: C.green },
];

// Simulated S&P 500 growth over 30 years with volatility bands
function buildGrowthData() {
  const pts = [];
  let base = 100;
  for (let yr = 0; yr <= 30; yr++) {
    // Approximate S&P 500 long-run 10% CAGR with volatility envelope
    const mid   = 100 * Math.pow(1.10, yr);
    const upper = 100 * Math.pow(1.16, yr);
    const lower = Math.max(10, 100 * Math.pow(1.04, yr) * (yr < 5 ? 0.6 : 0.75));
    pts.push({ year: `Yr ${yr}`, mid: +mid.toFixed(0), upper: +upper.toFixed(0), lower: +lower.toFixed(0) });
  }
  return pts;
}
const GROWTH_DATA = buildGrowthData();

/* ─── Stat card ──────────────────────────────────────────────────── */
function StatCard({ value, label, sub, accent = C.gold }) {
  return (
    <div style={{
      background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14,
      padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4,
      borderTop: `2px solid ${accent}`,
    }}>
      <span style={{ fontFamily: MONO, fontSize: 28, fontWeight: 800, color: accent, lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: C.t1, marginTop: 4 }}>{label}</span>
      {sub && <span style={{ fontFamily: UI, fontSize: 11, color: C.t3, lineHeight: 1.5 }}>{sub}</span>}
    </div>
  );
}

/* ─── Custom tooltip — probability chart ─────────────────────────── */
function ProbTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const neg = payload.find(p => p.dataKey === 'negProb');
  const pos = payload.find(p => p.dataKey === 'posProb');
  return (
    <div style={{ background: C.raise, border: `1px solid ${C.b2}`,
      borderRadius: 10, padding: '12px 16px', minWidth: 180 }}>
      <div style={{ fontFamily: UI, fontSize: 11, color: C.t3,
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.green }}>
          {pos?.value}% chance of positive return
        </div>
        <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.red }}>
          {neg?.value}% risk of loss
        </div>
      </div>
    </div>
  );
}

/* ─── Custom tooltip — growth bands ─────────────────────────────── */
function GrowthTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.raise, border: `1px solid ${C.b2}`,
      borderRadius: 10, padding: '12px 16px', minWidth: 180 }}>
      <div style={{ fontFamily: UI, fontSize: 11, color: C.t3,
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ fontFamily: MONO, fontSize: 13,
          fontWeight: 700, color: p.stroke || C.gold, marginBottom: 4 }}>
          {p.name}: {p.value >= 1000 ? (p.value/100).toFixed(0) + 'x' : p.value}
        </div>
      ))}
    </div>
  );
}

/* ─── useInView hook ─────────────────────────────────────────────── */
function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

/* ─── Main component ─────────────────────────────────────────────── */
export default function HorizonFlip() {
  const navigate   = useNavigate();
  const probRef    = useRef(null);
  const growthRef  = useRef(null);
  const showProb   = useInView(probRef);
  const showGrowth = useInView(growthRef);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.t1, fontFamily: UI }}>

      {/* ── Breadcrumb ── */}
      <div style={{ padding: '20px 32px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => navigate('/MarketHistory')}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            color: C.t3, display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: UI, fontSize: 12, padding: 0 }}
        >
          <ArrowLeft size={13} /> History &amp; Psychology
        </button>
        <span style={{ color: C.b2 }}>›</span>
        <span style={{ fontFamily: UI, fontSize: 12, color: C.t3 }}>
          The Horizon Flip
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 10,
          color: C.t3, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          LESSON 3 OF 5
        </span>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.gold,
            letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14 }}>
            Behavioral Finance · Time Horizon
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 700, color: C.t1, lineHeight: 1.15, margin: '0 0 16px' }}>
            The Horizon Flip
          </h1>
          <p style={{ fontFamily: DISPLAY, fontSize: 18, fontStyle: 'italic',
            color: C.gold, margin: '0 0 20px', lineHeight: 1.5 }}>
            "Over a single day, the stock market is a casino. Over twenty years, it is a near-certainty."
          </p>
          <p style={{ fontSize: 15, color: C.t2, lineHeight: 1.7, maxWidth: 680 }}>
            The most powerful variable in investing is not which stock you pick, which fund you
            choose, or even how low a fee you pay. It is how long you stay invested.
            As your time horizon extends, risk does not just diminish — it flips entirely.
            Short time windows are dominated by volatility. Long time windows are dominated by compounding.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: 14, marginBottom: 52 }}>
          <StatCard value="28%" label="Chance of negative return"
            sub="Any given 1-year period in S&P 500 history" accent={C.red} />
          <StatCard value="6%" label="Chance of loss over 5 years"
            sub="Rolling 5-year S&P 500 periods, 1926–2023" accent={C.gold} />
          <StatCard value="~0%" label="Chance of loss over 20 years"
            sub="No rolling 20-year S&P 500 period has ended negative" accent={C.green} />
          <StatCard value="10.2%" label="Long-run S&P 500 CAGR"
            sub="Annualized total return, 1926–2023 (incl. dividends)" accent={C.teal} />
        </div>

        {/* ── Psychology section ── */}
        <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 16,
          padding: '32px 36px', marginBottom: 52 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.t3,
            letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
            The Psychology
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700,
            color: C.t1, margin: '0 0 16px' }}>
            Myopic Loss Aversion — The Tyranny of the Short View
          </h2>
          <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.75, margin: '0 0 14px' }}>
            Behavioral economists Richard Thaler and Shlomo Benartzi identified a specific cognitive
            trap: investors who check their portfolios frequently suffer from{' '}
            <strong style={{ color: C.t1 }}>myopic loss aversion</strong>. Frequent evaluation
            means frequent exposure to short-term losses — which feel painful regardless of how
            the long-term trajectory looks.
          </p>
          <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.75, margin: 0 }}>
            The investor who reviews their portfolio daily sees losses about 46% of the time.
            The investor who reviews annually sees losses about 25% of the time. The investor who
            zooms out to a decade sees loss rarely. Same portfolio — radically different emotional
            experience — radically different behavior.
          </p>
        </div>

        {/* ── Chart 1: Probability of loss by horizon ── */}
        <div ref={probRef} style={{ marginBottom: 52 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: C.t3,
              letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
              Historical Proof · S&amp;P 500 · 1926–2023
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700,
              color: C.t1, margin: 0 }}>
              Probability of Positive vs. Negative Returns by Holding Period
            </h2>
          </div>

          <div style={{ background: C.surf, border: `1px solid ${C.b1}`,
            borderRadius: 16, padding: '28px 20px 20px' }}>
            {showProb && (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={HORIZON_DATA} barCategoryGap="28%" layout="vertical"
                  margin={{ top: 8, right: 40, left: 12, bottom: 8 }}>
                  <CartesianGrid horizontal={false} stroke={C.b1} />
                  <XAxis type="number" domain={[0, 100]}
                    tickFormatter={v => `${v}%`}
                    tick={{ fill: C.t3, fontFamily: MONO, fontSize: 10 }}
                    axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="horizon"
                    tick={{ fill: C.t2, fontFamily: UI, fontSize: 12 }}
                    axisLine={false} tickLine={false} width={72} />
                  <Tooltip content={<ProbTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="posProb" name="Positive return" stackId="a"
                    fill={C.green} radius={0}
                    isAnimationActive={true} animationDuration={800} animationBegin={0} />
                  <Bar dataKey="negProb" name="Negative return" stackId="a"
                    fill={C.red} radius={[0, 6, 6, 0]}
                    isAnimationActive={true} animationDuration={800} animationBegin={0} />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12 }}>
              {[{ color: C.green, label: 'Positive return' }, { color: C.red, label: 'Negative return' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                  <span style={{ fontFamily: UI, fontSize: 11, color: C.t3 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontFamily: UI, fontSize: 11, color: C.t3, marginTop: 10,
            textAlign: 'center', letterSpacing: '0.04em' }}>
            Source: Dimensional Fund Advisors, Ibbotson SBBI, Morningstar Direct.
            Rolling period analysis of S&amp;P 500 total return index.
          </p>
        </div>

        {/* ── Chart 2: Growth envelope ── */}
        <div ref={growthRef} style={{ marginBottom: 52 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: C.t3,
              letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
              Compounding Projection
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700,
              color: C.t1, margin: 0 }}>
              The Range of Outcomes Narrows Over Time
            </h2>
            <p style={{ fontFamily: UI, fontSize: 13, color: C.t3, margin: '6px 0 0' }}>
              Indexed to 100 · Hypothetical range of S&amp;P 500-equivalent outcomes over 30 years
            </p>
          </div>

          <div style={{ background: C.surf, border: `1px solid ${C.b1}`,
            borderRadius: 16, padding: '28px 20px 20px' }}>
            {showGrowth && (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={GROWTH_DATA} margin={{ top: 16, right: 20, left: 8, bottom: 8 }}>
                  <CartesianGrid stroke={C.b1} />
                  <XAxis dataKey="year" interval={4}
                    tick={{ fill: C.t3, fontFamily: MONO, fontSize: 10 }}
                    axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={v => `${v}x`}
                    tick={{ fill: C.t3, fontFamily: MONO, fontSize: 10 }}
                    axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<GrowthTooltip />} cursor={{ stroke: C.b2 }} />
                  <ReferenceLine y={100} stroke={C.b2} strokeDasharray="4 3" />
                  {/* Upper band */}
                  <Area dataKey="upper" name="Optimistic path" type="monotone"
                    stroke="transparent" fill={C.greenDim}
                    isAnimationActive={true} animationDuration={1000} />
                  {/* Lower band */}
                  <Area dataKey="lower" name="Conservative path" type="monotone"
                    stroke="transparent" fill={C.bg}
                    isAnimationActive={true} animationDuration={1000} />
                  {/* Median */}
                  <Area dataKey="mid" name="Historical median" type="monotone"
                    stroke={C.green} strokeWidth={2.5} fill="none"
                    isAnimationActive={true} animationDuration={1000} animationBegin={200} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
          <p style={{ fontFamily: UI, fontSize: 11, color: C.t3, marginTop: 10,
            textAlign: 'center', letterSpacing: '0.04em' }}>
            Hypothetical illustration. Based on historical S&amp;P 500 return distributions.
            Not a guarantee of future results.
          </p>
        </div>

        {/* ── The Horizon Flip table ── */}
        <div style={{ background: C.surf, border: `1px solid ${C.b1}`,
          borderRadius: 16, overflow: 'hidden', marginBottom: 52 }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${C.b1}` }}>
            <h3 style={{ fontFamily: UI, fontSize: 14, fontWeight: 700,
              color: C.t1, margin: 0 }}>What Dominates Returns at Each Time Horizon</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.raise }}>
                {['Time Horizon', 'Dominant Force', 'Investor Experience', 'Recommended Posture'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left',
                    fontFamily: UI, fontSize: 10, fontWeight: 700, color: C.t3,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    borderBottom: `1px solid ${C.b1}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { horizon: '< 1 year',   force: 'Noise & Volatility',    exp: 'High anxiety, frequent loss signals', posture: 'Cash / short-duration bonds', color: C.red },
                { horizon: '1–3 years',  force: 'Economic cycle',        exp: 'Moderate swings, recoverable losses',  posture: 'Balanced, lower equity weight', color: C.gold },
                { horizon: '5–10 years', force: 'Business fundamentals', exp: 'Corrections feel manageable',          posture: 'Growth-oriented, stay invested', color: '#6b7840' },
                { horizon: '10–20 years',force: 'Compounding',           exp: 'Down years are barely visible',        posture: 'Equity-heavy, ignore noise', color: C.green },
                { horizon: '20+ years',  force: 'Compounding + time',    exp: 'Losses compress to near zero',         posture: 'Maximize growth assets', color: '#3a8a5a' },
              ].map((row, i) => (
                <tr key={row.horizon} style={{
                  background: i % 2 === 0 ? C.surf : '#1f1812',
                  borderBottom: `1px solid ${C.b1}`,
                }}>
                  <td style={{ padding: '12px 16px', fontFamily: MONO, fontSize: 12,
                    fontWeight: 700, color: row.color }}>{row.horizon}</td>
                  <td style={{ padding: '12px 16px', fontFamily: UI, fontSize: 13, color: C.t1 }}>{row.force}</td>
                  <td style={{ padding: '12px 16px', fontFamily: UI, fontSize: 13, color: C.t2 }}>{row.exp}</td>
                  <td style={{ padding: '12px 16px', fontFamily: UI, fontSize: 12, color: C.t3 }}>{row.posture}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Three action cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16, marginBottom: 52 }}>
          {[
            {
              icon: <Clock size={18} color={C.gold} />,
              title: 'Know your true horizon',
              body: 'Money you need in 2 years belongs in cash. Money you will not touch for 15 years belongs in equities. Match asset class to time horizon — not to comfort level.',
            },
            {
              icon: <ShieldCheck size={18} color={C.gold} />,
              title: 'Volatility is the price of admission',
              body: 'Every compounding outcome shown in this lesson required tolerating sharp short-term declines. The discomfort is not a bug — it is the mechanism.',
            },
            {
              icon: <Compass size={18} color={C.gold} />,
              title: 'Zoom out regularly',
              body: 'When a correction dominates headlines, pull up a 20-year chart. The panic usually disappears on that scale. Let the long view guide behavior, not the short view.',
            },
          ].map(c => (
            <div key={c.title} style={{
              background: C.surf, border: `1px solid ${C.b1}`,
              borderRadius: 14, padding: '22px 24px',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: C.goldDim,
                border: `1px solid ${C.goldBdr}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: 14 }}>
                {c.icon}
              </div>
              <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700,
                color: C.t1, marginBottom: 8 }}>{c.title}</div>
              <div style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>

        {/* ── Pullquote ── */}
        <div style={{ borderLeft: `3px solid ${C.gold}`, paddingLeft: 24, marginBottom: 52 }}>
          <p style={{ fontFamily: DISPLAY, fontSize: 18, fontStyle: 'italic',
            color: C.t1, lineHeight: 1.6, margin: '0 0 8px' }}>
            "The stock market is a device for transferring money from the impatient to the patient."
          </p>
          <span style={{ fontFamily: UI, fontSize: 12, color: C.t3 }}>
            — Warren Buffett, Berkshire Hathaway
          </span>
        </div>

        {/* ── Navigation CTA ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/best-days')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: `1px solid ${C.b2}`,
              borderRadius: 10, padding: '12px 20px', cursor: 'pointer',
              fontFamily: UI, fontSize: 13, color: C.t2,
            }}
          >
            <ArrowLeft size={14} /> Lesson 2: The Best Days Missing Link
          </button>

          <button
            onClick={() => navigate('/perfect-time')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: C.gold, border: 'none', borderRadius: 10,
              padding: '13px 24px', cursor: 'pointer',
              fontFamily: UI, fontSize: 13, fontWeight: 700, color: '#1a1410',
            }}
          >
            Next: Perfect Time Illusion <ArrowRight size={14} />
          </button>
        </div>

        {/* ── Disclaimer ── */}
        <div style={{ marginTop: 48, padding: '16px 20px',
          background: C.raise, borderRadius: 10, border: `1px solid ${C.b1}` }}>
          <p style={{ fontFamily: UI, fontSize: 11, color: C.t3, lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: C.t3 }}>Educational Disclaimer:</strong> This content is provided
            for educational purposes only and does not constitute investment advice. Historical return
            data and probability figures reference the S&amp;P 500 index and are not predictive of
            future results. Individual outcomes will vary. Consult a qualified financial advisor before
            making investment decisions.
          </p>
        </div>

      </div>
    </div>
  );
}
