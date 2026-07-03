import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LabelList,
} from 'recharts';
import { ArrowLeft, ArrowRight, TrendingDown, AlertTriangle, Clock } from 'lucide-react';

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
  orange:   '#b06a28',
  orangeDim:'rgba(176,106,40,0.12)',
};

const DISPLAY = "'Playfair Display', Georgia, serif";
const UI      = "'Inter', system-ui, sans-serif";
const MONO    = "'JetBrains Mono', 'Courier New', monospace";

/* ─── Chart data ─────────────────────────────────────────────────── */
// $10,000 invested Jan 2003, held through Dec 2023 (approx 20 years)
const BAR_DATA = [
  { label: 'Fully Invested',     value: 64844,  scenario: 'full'    },
  { label: 'Miss 10 Best Days',  value: 29708,  scenario: 'miss10'  },
  { label: 'Miss 20 Best Days',  value: 16093,  scenario: 'miss20'  },
  { label: 'Miss 30 Best Days',  value:  9320,  scenario: 'miss30'  },
  { label: 'Miss 40 Best Days',  value:  5725,  scenario: 'miss40'  },
];

const BAR_COLORS = {
  full:   C.green,
  miss10: '#8b6340',
  miss20: '#8b5030',
  miss30: C.red,
  miss40: '#6b2828',
};

const RETURN_DATA = [
  { label: 'Fully Invested',    annReturn: 9.8  },
  { label: 'Miss 10 Best Days', annReturn: 5.4  },
  { label: 'Miss 20 Best Days', annReturn: 2.7  },
  { label: 'Miss 30 Best Days', annReturn: 0.4  },
  { label: 'Miss 40 Best Days', annReturn: -2.0 },
];

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

/* ─── Custom tooltip ─────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  const ret = RETURN_DATA.find(r => r.label === label);
  return (
    <div style={{
      background: C.raise, border: `1px solid ${C.b2}`, borderRadius: 10,
      padding: '12px 16px', minWidth: 180,
    }}>
      <div style={{ fontFamily: UI, fontSize: 11, color: C.t3, textTransform: 'uppercase',
        letterSpacing: '0.1em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 800, color: d.fill }}>
        ${d.value.toLocaleString()}
      </div>
      <div style={{ fontFamily: UI, fontSize: 11, color: C.t2, marginTop: 4 }}>
        Ending value of $10,000 (2003–2023)
      </div>
      {ret && (
        <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700,
          color: ret.annReturn >= 0 ? C.green : C.red, marginTop: 6 }}>
          {ret.annReturn >= 0 ? '+' : ''}{ret.annReturn}% / yr
        </div>
      )}
    </div>
  );
}

/* ─── useInView hook ─────────────────────────────────────────────── */
function useInView(ref, options = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold: 0.25, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

/* ─── Main component ─────────────────────────────────────────────── */
export default function BestDays() {
  const navigate = useNavigate();
  const chartRef  = useRef(null);
  const showChart = useInView(chartRef);

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
          The Best Days Missing Link
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 10,
          color: C.t3, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          LESSON 2 OF 5
        </span>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.gold,
            letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14 }}>
            Behavioral Finance · Market Timing
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 700, color: C.t1, lineHeight: 1.15, margin: '0 0 16px' }}>
            The Best Days Missing Link
          </h1>
          <p style={{ fontFamily: DISPLAY, fontSize: 18, fontStyle: 'italic',
            color: C.gold, margin: '0 0 20px', lineHeight: 1.5 }}>
            "The worst days in the market almost always arrive in the same weeks as the best."
          </p>
          <p style={{ fontSize: 15, color: C.t2, lineHeight: 1.7, maxWidth: 680 }}>
            When markets plummet, the human instinct is to flee. Lock in losses. Wait for calm.
            Re-enter when it "feels safe." This instinct is expensive — because the market's best
            single days almost always cluster within days of its worst. Miss those days and decades
            of compounding vanish.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: 14, marginBottom: 52 }}>
          <StatCard value="$64,844" label="Fully invested (2003–2023)"
            sub="$10,000 held without interruption" accent={C.green} />
          <StatCard value="$29,708" label="Miss just 10 best days"
            sub="54% less wealth — half your money gone" accent={C.orange} />
          <StatCard value="$9,320" label="Miss 30 best days"
            sub="Barely beat starting capital after 20 years" accent={C.red} />
          <StatCard value="7 of 10" label="Best days near worst days"
            sub="Top 10 best days occur within 2 weeks of the 10 worst" accent={C.gold} />
        </div>

        {/* ── The psychology block ── */}
        <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 16,
          padding: '32px 36px', marginBottom: 52 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.t3,
            letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
            The Psychology
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700,
            color: C.t1, margin: '0 0 16px' }}>
            Regret Aversion — Why Selling Feels Like Safety
          </h2>
          <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.75, margin: '0 0 16px' }}>
            Kahneman and Tversky's research showed that losses feel roughly twice as painful as
            equivalent gains feel good. This asymmetry drives <strong style={{ color: C.t1 }}>regret aversion</strong>:
            the fear of regretting inaction during a crash is so powerful that investors sell —
            even when staying put is the rational choice.
          </p>
          <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.75, margin: 0 }}>
            The cruel irony: the volatility that triggers selling also creates the violent
            snap-back days that drive long-term returns. The investor who sold to "avoid more pain"
            almost always misses the recovery entirely.
          </p>
        </div>

        {/* ── Chart ── */}
        <div ref={chartRef} style={{ marginBottom: 52 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: C.t3,
              letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
              Historical Proof · 2003–2023 · S&amp;P 500
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700,
              color: C.t1, margin: 0 }}>
              The Cost of Missing the Best Days
            </h2>
            <p style={{ fontFamily: UI, fontSize: 13, color: C.t3, margin: '6px 0 0' }}>
              $10,000 initial investment · What remains after missing the market's single best days
            </p>
          </div>

          <div style={{ background: C.surf, border: `1px solid ${C.b1}`,
            borderRadius: 16, padding: '28px 20px 20px' }}>
            {showChart && (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={BAR_DATA} margin={{ top: 24, right: 16, left: 8, bottom: 8 }}
                  barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke={C.b1} />
                  <XAxis dataKey="label" tick={{ fill: C.t3, fontFamily: MONO, fontSize: 10 }}
                    axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={v => `$${(v/1000).toFixed(0)}k`}
                    tick={{ fill: C.t3, fontFamily: MONO, fontSize: 10 }}
                    axisLine={false} tickLine={false} width={48} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <ReferenceLine y={10000} stroke={C.b2} strokeDasharray="4 3"
                    label={{ value: 'Starting $10k', fill: C.t3, fontSize: 10, fontFamily: MONO, position: 'right' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}
                    isAnimationActive={true} animationDuration={900} animationBegin={0}>
                    {BAR_DATA.map((entry) => (
                      <Cell key={entry.scenario} fill={BAR_COLORS[entry.scenario]} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={v => `$${(v/1000).toFixed(1)}k`}
                      style={{ fill: C.t2, fontFamily: MONO, fontSize: 10, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <p style={{ fontFamily: UI, fontSize: 11, color: C.t3, marginTop: 10,
            textAlign: 'center', letterSpacing: '0.04em' }}>
            Source: Hartford Funds analysis of S&amp;P 500 returns, 2003–2023.
            Hypothetical illustration for educational purposes.
          </p>
        </div>

        {/* ── Annual return comparison table ── */}
        <div style={{ background: C.surf, border: `1px solid ${C.b1}`,
          borderRadius: 16, overflow: 'hidden', marginBottom: 52 }}>
          <div style={{ padding: '20px 24px 16px',
            borderBottom: `1px solid ${C.b1}` }}>
            <h3 style={{ fontFamily: UI, fontSize: 14, fontWeight: 700,
              color: C.t1, margin: 0 }}>Annual Return Comparison</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.raise }}>
                {['Scenario', 'Annualized Return', 'Ending Value of $10k', 'Impact'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left',
                    fontFamily: UI, fontSize: 10, fontWeight: 700, color: C.t3,
                    letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: `1px solid ${C.b1}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { scenario: 'Fully Invested',    ret: '+9.8%',  end: '$64,844', impact: 'Baseline',       retColor: C.green },
                { scenario: 'Miss 10 Best Days', ret: '+5.4%',  end: '$29,708', impact: '−54% less wealth', retColor: C.orange },
                { scenario: 'Miss 20 Best Days', ret: '+2.7%',  end: '$16,093', impact: '−75% less wealth', retColor: '#b05030' },
                { scenario: 'Miss 30 Best Days', ret: '+0.4%',  end: '$9,320',  impact: 'Barely broke even', retColor: C.red },
                { scenario: 'Miss 40 Best Days', ret: '−2.0%',  end: '$5,725',  impact: 'Lost money over 20 yrs', retColor: '#6b2828' },
              ].map((row, i) => (
                <tr key={row.scenario} style={{
                  background: i % 2 === 0 ? C.surf : '#1f1812',
                  borderBottom: `1px solid ${C.b1}`,
                }}>
                  <td style={{ padding: '12px 16px', fontFamily: UI, fontSize: 13, color: C.t1 }}>
                    {row.scenario}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: MONO, fontSize: 13,
                    fontWeight: 700, color: row.retColor }}>
                    {row.ret}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: MONO, fontSize: 13,
                    fontWeight: 700, color: C.t1 }}>
                    {row.end}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: UI, fontSize: 12, color: C.t2 }}>
                    {row.impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Warning callout ── */}
        <div style={{
          background: `linear-gradient(135deg, ${C.redDim} 0%, rgba(139,58,58,0.06) 100%)`,
          border: `1px solid rgba(139,58,58,0.30)`,
          borderRadius: 14, padding: '24px 28px', marginBottom: 52,
          display: 'flex', gap: 16, alignItems: 'flex-start',
        }}>
          <AlertTriangle size={22} color={C.red} style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: C.t1, marginBottom: 6 }}>
              The Timing Trap
            </div>
            <p style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.7, margin: 0 }}>
              To successfully time the market, you must be right <strong style={{ color: C.t1 }}>twice</strong>:
              when to sell AND when to buy back in. Studies consistently show that retail investors
              who exit during downturns re-enter late — after the largest recovery days have already
              passed. The cost of being out of the market for even a handful of sessions over a
              twenty-year period is not a rounding error. It is the difference between wealth
              creation and stagnation.
            </p>
          </div>
        </div>

        {/* ── Pullquote ── */}
        <div style={{
          borderLeft: `3px solid ${C.gold}`, paddingLeft: 24,
          marginBottom: 52,
        }}>
          <p style={{ fontFamily: DISPLAY, fontSize: 18, fontStyle: 'italic',
            color: C.t1, lineHeight: 1.6, margin: '0 0 8px' }}>
            "Far more money has been lost by investors preparing for corrections, or trying to
            anticipate corrections, than has been lost in corrections themselves."
          </p>
          <span style={{ fontFamily: UI, fontSize: 12, color: C.t3 }}>
            — Peter Lynch, Fidelity Magellan Fund
          </span>
        </div>

        {/* ── What to do instead ── */}
        <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 16,
          padding: '32px 36px', marginBottom: 52 }}>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700,
            color: C.t1, margin: '0 0 20px' }}>
            What to Do Instead
          </h2>
          {[
            {
              icon: <Clock size={16} color={C.gold} />,
              title: 'Time in market beats timing the market',
              body: 'Consistent, disciplined participation in markets has historically outperformed any systematic attempt to predict tops or bottoms.',
            },
            {
              icon: <TrendingDown size={16} color={C.gold} />,
              title: 'Reframe volatility as opportunity',
              body: 'Downturns lower entry prices. Investor who adds capital during corrections buy more shares at a discount — those shares participate fully in the recovery.',
            },
            {
              icon: <AlertTriangle size={16} color={C.gold} />,
              title: 'Automate to remove emotion',
              body: 'Dollar-cost averaging and automatic rebalancing remove the human decision point entirely. Removing the option to panic-sell is often the most valuable thing an investor can do.',
            },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: C.goldDim,
                border: `1px solid ${C.goldBdr}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700,
                  color: C.t1, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.65 }}>
                  {item.body}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Navigation CTA ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/elastic-band')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: `1px solid ${C.b2}`,
              borderRadius: 10, padding: '12px 20px', cursor: 'pointer',
              fontFamily: UI, fontSize: 13, color: C.t2,
            }}
          >
            <ArrowLeft size={14} /> Lesson 1: The Elastic Band Effect
          </button>

          <button
            onClick={() => navigate('/horizon-flip')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: C.gold, border: 'none', borderRadius: 10,
              padding: '13px 24px', cursor: 'pointer',
              fontFamily: UI, fontSize: 13, fontWeight: 700, color: '#1a1410',
            }}
          >
            Next: The Horizon Flip <ArrowRight size={14} />
          </button>
        </div>

        {/* ── Disclaimer ── */}
        <div style={{ marginTop: 48, padding: '16px 20px',
          background: C.raise, borderRadius: 10, border: `1px solid ${C.b1}` }}>
          <p style={{ fontFamily: UI, fontSize: 11, color: C.t3, lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: C.t3 }}>Educational Disclaimer:</strong> This content is provided
            for educational purposes only and does not constitute investment advice. Past performance
            of market indices is not indicative of future results. All figures are hypothetical
            illustrations based on historical S&amp;P 500 index data and do not account for taxes,
            fees, or transaction costs. Consult a qualified financial advisor before making investment decisions.
          </p>
        </div>

      </div>
    </div>
  );
}
