import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell,
} from 'recharts';
import { ArrowLeft, CheckCircle, Newspaper, TrendingUp, AlertTriangle, Brain } from 'lucide-react';

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
};

const DISPLAY = "'Playfair Display', Georgia, serif";
const UI      = "'Inter', system-ui, sans-serif";
const MONO    = "'JetBrains Mono', 'Courier New', monospace";

/* ─── Chart data: S&P 500 vs fear narrative headlines 2008–2023 ─── */
// Market index (indexed to 100 at 2009 trough) paired with fear narrative intensity
const FEAR_VS_MARKET = [
  { year: '2009', spx: 100,  fearIdx: 95  },
  { year: '2010', spx: 121,  fearIdx: 72  },
  { year: '2011', spx: 118,  fearIdx: 81  },
  { year: '2012', spx: 139,  fearIdx: 60  },
  { year: '2013', spx: 182,  fearIdx: 38  },
  { year: '2014', spx: 199,  fearIdx: 52  },
  { year: '2015', spx: 195,  fearIdx: 63  },
  { year: '2016', spx: 214,  fearIdx: 71  },
  { year: '2017', spx: 258,  fearIdx: 44  },
  { year: '2018', spx: 235,  fearIdx: 78  },
  { year: '2019', spx: 295,  fearIdx: 55  },
  { year: '2020', spx: 292,  fearIdx: 100 },
  { year: '2021', spx: 389,  fearIdx: 42  },
  { year: '2022', spx: 298,  fearIdx: 90  },
  { year: '2023', spx: 383,  fearIdx: 58  },
];

/* ─── Hindsight bias examples ─────────────────────────────────────── */
const HINDSIGHT_DATA = [
  { label: '"Everyone saw 2008 coming"', reality: 'S&P 500 hit an all-time high in Oct 2007. Wall St consensus was "soft landing." The crash was not predicted.', type: 'myth' },
  { label: '"COVID crash was obvious"', reality: 'Markets hit ATHs on Feb 19, 2020 — two weeks before the fastest bear market in history began. Zero consensus predicted a pandemic crash.', type: 'myth' },
  { label: '"The 2022 bear was inevitable"', reality: 'Every major investment bank predicted positive returns for 2022. The year delivered the worst bond market in 100 years simultaneously.', type: 'myth' },
];

/* ─── Doom-loop media narratives by year ─────────────────────────── */
const DOOM_HEADLINES = [
  { year: '2010', headline: '"Double-dip recession imminent"',       outcome: 'S&P 500 +15%' },
  { year: '2011', headline: '"Euro collapse will crash global mkts"', outcome: 'S&P 500 +2% (flat, not crisis)' },
  { year: '2013', headline: '"Taper tantrum will end the rally"',     outcome: 'S&P 500 +32%' },
  { year: '2016', headline: '"Brexit will trigger financial crisis"',  outcome: 'S&P 500 +12%' },
  { year: '2018', headline: '"Trade war will destroy markets"',        outcome: 'S&P 500 −4% then +31% in 2019' },
  { year: '2020', headline: '"Pandemic will end markets as we know it"', outcome: 'S&P 500 +18%' },
  { year: '2022', headline: '"Rate hikes guarantee recession/crash"',  outcome: 'S&P 500 +26% in 2023' },
  { year: '2023', headline: '"AI bubble will collapse tech and drag mkts"', outcome: 'S&P 500 +24%' },
];

/* ─── Stat card ──────────────────────────────────────────────────── */
function StatCard({ value, label, sub, accent = C.gold }) {
  return (
    <div style={{
      background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14,
      padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4,
      borderTop: `2px solid ${accent}`,
    }}>
      <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 800, color: accent, lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: C.t1, marginTop: 4 }}>{label}</span>
      {sub && <span style={{ fontFamily: UI, fontSize: 11, color: C.t3, lineHeight: 1.5 }}>{sub}</span>}
    </div>
  );
}

/* ─── Custom chart tooltip ───────────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const spx  = payload.find(p => p.dataKey === 'spx');
  const fear = payload.find(p => p.dataKey === 'fearIdx');
  return (
    <div style={{ background: C.raise, border: `1px solid ${C.b2}`,
      borderRadius: 10, padding: '12px 16px', minWidth: 200 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.t3,
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</div>
      {spx && (
        <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700,
          color: C.green, marginBottom: 4 }}>
          Market: {spx.value}x (indexed to 2009 low)
        </div>
      )}
      {fear && (
        <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.red }}>
          Fear Index: {fear.value}/100
        </div>
      )}
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
export default function DoomLoop() {
  const navigate  = useNavigate();
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
          Hindsight Bias and the Media Doom-Loop
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 10,
          color: C.t3, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          LESSON 5 OF 5
        </span>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.gold,
            letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14 }}>
            Behavioral Finance · Media Psychology
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 700, color: C.t1, lineHeight: 1.15, margin: '0 0 16px' }}>
            Hindsight Bias and the Media Doom-Loop
          </h1>
          <p style={{ fontFamily: DISPLAY, fontSize: 18, fontStyle: 'italic',
            color: C.gold, margin: '0 0 20px', lineHeight: 1.5 }}>
            "In hindsight, the crash was obvious. In foresight, the only thing that was obvious was uncertainty."
          </p>
          <p style={{ fontSize: 15, color: C.t2, lineHeight: 1.7, maxWidth: 680 }}>
            Financial media has a structural incentive that is misaligned with your wealth.
            Fear drives clicks. Doom drives subscriptions. Every crisis that unfolds is
            retroactively described as "predictable." Every recovery is quietly forgotten.
            Understanding this machine — and the cognitive bias that makes you susceptible to
            it — is one of the highest-value skills an investor can develop.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: 14, marginBottom: 52 }}>
          <StatCard value="0/8" label="Media doom predictions proved right"
            sub="2010–2023: Every headline crash that didn't happen" accent={C.green} />
          <StatCard value="~70%" label="Financial news is negative in tone"
            sub="Regardless of underlying market conditions" accent={C.red} />
          <StatCard value="3.84x" label="S&P 500 return since 2009 fear peak"
            sub="Market compounded while fear narratives dominated" accent={C.gold} />
          <StatCard value="2x" label="Losses feel vs. equivalent gains"
            sub="Loss aversion amplifies media fear signals" accent={C.teal} />
        </div>

        {/* ── Psychology block ── */}
        <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 16,
          padding: '32px 36px', marginBottom: 52 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.t3,
            letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
            The Two Biases
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700,
            color: C.t1, margin: '0 0 20px' }}>
            Hindsight Bias + Availability Heuristic — The Perfect Manipulation
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700,
                color: C.gold, marginBottom: 8 }}>Hindsight Bias</div>
              <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.75, margin: 0 }}>
                After an event occurs, our brain retroactively assigns it a high probability.
                "It was obvious the market would crash." This rewrites memory — making investors
                believe they can predict the next crisis, and causing them to act on that
                manufactured certainty.
              </p>
            </div>
            <div>
              <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700,
                color: C.gold, marginBottom: 8 }}>Availability Heuristic</div>
              <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.75, margin: 0 }}>
                We assess probability based on how easily examples come to mind.
                When financial media runs the same bear-market headline every day, that
                scenario feels inevitable — regardless of actual statistical probability.
                Volume of coverage is mistaken for probability of occurrence.
              </p>
            </div>
          </div>
        </div>

        {/* ── Fear vs Market chart ── */}
        <div ref={chartRef} style={{ marginBottom: 52 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: C.t3,
              letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
              2009–2023 · S&amp;P 500 vs. Composite Fear Narrative Index
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700,
              color: C.t1, margin: 0 }}>
              Fear Was Highest When the Market Was Lowest — and Vice Versa
            </h2>
            <p style={{ fontFamily: UI, fontSize: 13, color: C.t3, margin: '6px 0 0' }}>
              Media fear index (0–100) is a composite of negative financial news volume and CNN Fear &amp; Greed extremes
            </p>
          </div>

          <div style={{ background: C.surf, border: `1px solid ${C.b1}`,
            borderRadius: 16, padding: '28px 20px 20px' }}>
            {showChart && (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={FEAR_VS_MARKET} margin={{ top: 16, right: 40, left: 8, bottom: 8 }}>
                  <CartesianGrid stroke={C.b1} />
                  <XAxis dataKey="year"
                    tick={{ fill: C.t3, fontFamily: MONO, fontSize: 10 }}
                    axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" orientation="left"
                    tick={{ fill: C.t3, fontFamily: MONO, fontSize: 10 }}
                    axisLine={false} tickLine={false} width={40}
                    label={{ value: 'Market (indexed)', angle: -90, position: 'insideLeft',
                      fill: C.t3, fontSize: 9, fontFamily: MONO }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 120]}
                    tick={{ fill: C.t3, fontFamily: MONO, fontSize: 10 }}
                    axisLine={false} tickLine={false} width={36}
                    label={{ value: 'Fear (0–100)', angle: 90, position: 'insideRight',
                      fill: C.t3, fontSize: 9, fontFamily: MONO }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: C.b2 }} />
                  <Area yAxisId="left" dataKey="spx" name="S&P 500 (indexed)"
                    type="monotone" stroke={C.green} strokeWidth={2.5}
                    fill={C.greenDim}
                    isAnimationActive={true} animationDuration={1000} />
                  <Line yAxisId="right" dataKey="fearIdx" name="Fear Index"
                    type="monotone" stroke={C.red} strokeWidth={1.5}
                    dot={false} strokeDasharray="5 3"
                    isAnimationActive={true} animationDuration={1000} animationBegin={300} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 12 }}>
              {[
                { color: C.green, label: 'S&P 500 (left axis, indexed to 2009 low)' },
                { color: C.red,   label: 'Media fear intensity (right axis, 0–100)', dash: true },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 18, height: 2, background: l.color,
                    borderTop: l.dash ? `2px dashed ${l.color}` : `2px solid ${l.color}`,
                    background: 'none' }} />
                  <span style={{ fontFamily: UI, fontSize: 10, color: C.t3 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Doom headlines table ── */}
        <div style={{ marginBottom: 52 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.t3,
            letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
            The Record
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700,
            color: C.t1, margin: '0 0 20px' }}>
            Fourteen Years of Predicted Crashes — and What Actually Happened
          </h2>
          <div style={{ background: C.surf, border: `1px solid ${C.b1}`,
            borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.raise }}>
                  {['Year', 'Dominant Fear Narrative', 'Actual Outcome'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left',
                      fontFamily: UI, fontSize: 10, fontWeight: 700, color: C.t3,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      borderBottom: `1px solid ${C.b1}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DOOM_HEADLINES.map((row, i) => (
                  <tr key={row.year} style={{
                    background: i % 2 === 0 ? C.surf : '#1f1812',
                    borderBottom: `1px solid ${C.b1}`,
                  }}>
                    <td style={{ padding: '12px 16px', fontFamily: MONO, fontSize: 13,
                      fontWeight: 700, color: C.gold, whiteSpace: 'nowrap' }}>{row.year}</td>
                    <td style={{ padding: '12px 16px', fontFamily: UI, fontSize: 12,
                      color: C.red, fontStyle: 'italic' }}>{row.headline}</td>
                    <td style={{ padding: '12px 16px', fontFamily: MONO, fontSize: 12,
                      fontWeight: 700, color: C.green }}>{row.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Hindsight myth-busters ── */}
        <div style={{ marginBottom: 52 }}>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700,
            color: C.t1, margin: '0 0 20px' }}>
            Exploding the Hindsight Myths
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {HINDSIGHT_DATA.map(m => (
              <div key={m.label} style={{
                background: C.surf, border: `1px solid ${C.b1}`,
                borderLeft: `3px solid ${C.red}`, borderRadius: '0 12px 12px 0',
                padding: '18px 22px',
              }}>
                <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700,
                  color: C.red, marginBottom: 8 }}>{m.label}</div>
                <div style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.7 }}>
                  <strong style={{ color: C.t1 }}>Reality:</strong> {m.reality}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── The antidote section ── */}
        <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 16,
          padding: '32px 36px', marginBottom: 52 }}>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700,
            color: C.t1, margin: '0 0 24px' }}>
            The Antidote to the Doom-Loop
          </h2>
          {[
            {
              icon: <Brain size={16} color={C.gold} />,
              title: 'Name the bias — neutralize it',
              body: 'When you catch yourself thinking "everyone knew this crash was coming," recall that consensus forecasts almost never predicted any major market move. The clarity is retrospective.',
            },
            {
              icon: <Newspaper size={16} color={C.gold} />,
              title: 'Separate signal from noise',
              body: 'Financial media is optimized for engagement, not accuracy. A useful heuristic: the louder and more urgent the warning, the less likely it reflects genuine systemic risk rather than editorial incentive.',
            },
            {
              icon: <TrendingUp size={16} color={C.gold} />,
              title: 'Let the long-term chart answer',
              body: 'Pull up a 30-year S&P 500 chart during any correction. Every previous catastrophe is barely visible. The question to ask is not "will this crash?" but "where will this market be in 20 years?"',
            },
            {
              icon: <CheckCircle size={16} color={C.gold} />,
              title: 'Systematize, then ignore the noise',
              body: 'Automatic rebalancing, scheduled contributions, and a written investment policy statement remove the need to respond to daily narrative. If the process is sound, the noise becomes irrelevant.',
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

        {/* ── Pullquote ── */}
        <div style={{ borderLeft: `3px solid ${C.gold}`, paddingLeft: 24, marginBottom: 52 }}>
          <p style={{ fontFamily: DISPLAY, fontSize: 18, fontStyle: 'italic',
            color: C.t1, lineHeight: 1.6, margin: '0 0 8px' }}>
            "The four most dangerous words in investing are 'this time it's different.'"
          </p>
          <span style={{ fontFamily: UI, fontSize: 12, color: C.t3 }}>
            — Sir John Templeton, Templeton Growth Fund
          </span>
        </div>

        {/* ── Series complete banner ── */}
        <div style={{
          background: `linear-gradient(135deg, ${C.goldDim} 0%, rgba(201,169,110,0.04) 100%)`,
          border: `1px solid ${C.goldBdr}`, borderRadius: 16,
          padding: '28px 32px', marginBottom: 52, textAlign: 'center',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.gold,
            letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
            Series Complete
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700,
            color: C.t1, margin: '0 0 12px' }}>
            You have completed History &amp; Psychology
          </h2>
          <p style={{ fontFamily: UI, fontSize: 14, color: C.t2,
            lineHeight: 1.7, margin: '0 0 24px', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            The Elastic Band, The Best Days, The Horizon Flip, The Perfect Time Illusion, and
            the Doom-Loop — five frameworks that, once internalized, make you a fundamentally
            more rational and resilient investor.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/MarketHistory')}
              style={{
                background: C.gold, border: 'none', borderRadius: 10,
                padding: '12px 24px', cursor: 'pointer',
                fontFamily: UI, fontSize: 13, fontWeight: 700, color: '#1a1410',
              }}
            >
              Back to Market History
            </button>
            <button
              onClick={() => navigate('/elastic-band')}
              style={{
                background: 'none', border: `1px solid ${C.goldBdr}`, borderRadius: 10,
                padding: '12px 24px', cursor: 'pointer',
                fontFamily: UI, fontSize: 13, color: C.gold,
              }}
            >
              Restart from Lesson 1
            </button>
          </div>
        </div>

        {/* ── Navigation ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={() => navigate('/perfect-time')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: `1px solid ${C.b2}`,
              borderRadius: 10, padding: '12px 20px', cursor: 'pointer',
              fontFamily: UI, fontSize: 13, color: C.t2,
            }}
          >
            <ArrowLeft size={14} /> Lesson 4: Perfect Time Illusion
          </button>
        </div>

        {/* ── Disclaimer ── */}
        <div style={{ marginTop: 48, padding: '16px 20px',
          background: C.raise, borderRadius: 10, border: `1px solid ${C.b1}` }}>
          <p style={{ fontFamily: UI, fontSize: 11, color: C.t3, lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: C.t3 }}>Educational Disclaimer:</strong> This content is
            provided for educational purposes only and does not constitute investment advice.
            The Fear Index chart is a composite illustrative model for educational purposes.
            Outcome data for market performance is based on S&amp;P 500 total return index.
            Past performance is not indicative of future results. Consult a qualified financial
            advisor before making investment decisions.
          </p>
        </div>

      </div>
    </div>
  );
}
