import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LabelList,
} from 'recharts';
import { ArrowLeft, ArrowRight, Timer, Target, TrendingUp } from 'lucide-react';

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
  teal:     '#00B4C6',
  tealDim:  'rgba(0,180,198,0.08)',
};

const DISPLAY = "'Playfair Display', Georgia, serif";
const UI      = "'Inter', system-ui, sans-serif";
const MONO    = "'JetBrains Mono', 'Courier New', monospace";

/* ─── Chart data
   Four investors each receive $2,000/yr for 20 years ($40,000 total).
   Classic Schwab study scenario:
   1. Perfect Timer      — invests at market low each year         → ~$87,004
   2. Immediate Investor — invests on Jan 1 each year             → ~$81,650
   3. Monthly DCA        — invests $167/mo via dollar-cost avg    → ~$79,510
   4. Bad Timer          — invests at market peak each year       → ~$72,488
   5. Cash Hoarder       — never invests, keeps in money market   → ~$51,291
──────────────────────────────────────────────────────────────────── */
const INVESTOR_DATA = [
  { name: 'Perfect Timer',      value: 87004, type: 'best',    label: '$87,004' },
  { name: 'Immediate Investor', value: 81650, type: 'good',    label: '$81,650' },
  { name: 'Monthly DCA',        value: 79510, type: 'good2',   label: '$79,510' },
  { name: 'Bad Timer',          value: 72488, type: 'okay',    label: '$72,488' },
  { name: 'Cash Hoarder',       value: 51291, type: 'worst',   label: '$51,291' },
];

const TYPE_COLOR = {
  best:  C.gold,
  good:  C.green,
  good2: '#5a9a6a',
  okay:  '#8b6340',
  worst: C.red,
};

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

/* ─── Custom tooltip ─────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background: C.raise, border: `1px solid ${C.b2}`,
      borderRadius: 10, padding: '12px 16px', minWidth: 200 }}>
      <div style={{ fontFamily: UI, fontSize: 11, color: C.t3,
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 800, color: d.fill }}>
        ${d.value.toLocaleString()}
      </div>
      <div style={{ fontFamily: UI, fontSize: 11, color: C.t2, marginTop: 4 }}>
        Final portfolio value after 20 years
      </div>
      <div style={{ fontFamily: UI, fontSize: 11, color: C.t3, marginTop: 2 }}>
        $2,000/year invested · $40,000 total contributed
      </div>
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

/* ─── The "waiting moments" timeline ────────────────────────────── */
const WAIT_MOMENTS = [
  { year: '2001', event: 'Dot-Com crash', action: 'Waited for market to stabilize', cost: 'Missed 2003–2007 bull run (+89%)' },
  { year: '2009', event: 'Financial Crisis', action: 'Waited for "all clear" signal', cost: 'Missed 2009–2020 bull run (+400%)' },
  { year: '2020', event: 'COVID-19 crash', action: 'Waited for pandemic to end', cost: 'Missed 2020 recovery (+68% in 12 months)' },
  { year: '2022', event: 'Rate hike cycle', action: 'Waited for rate cuts to start', cost: 'Missed 2023 rally (+26%)' },
];

/* ─── Main component ─────────────────────────────────────────────── */
export default function PerfectTime() {
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
          The Illusion of the Perfect Time to Invest
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 10,
          color: C.t3, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          LESSON 4 OF 5
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
            The Illusion of the Perfect Time to Invest
          </h1>
          <p style={{ fontFamily: DISPLAY, fontSize: 18, fontStyle: 'italic',
            color: C.gold, margin: '0 0 20px', lineHeight: 1.5 }}>
            "The investor who waits for the perfect moment will wait forever — and pay for it."
          </p>
          <p style={{ fontSize: 15, color: C.t2, lineHeight: 1.7, maxWidth: 680 }}>
            Every investor has felt it. Markets are elevated. There is too much uncertainty.
            Something feels off. You will wait for the right moment — a pullback, a clearer
            signal, a calmer environment. That moment never comes. And while you wait, the market
            compounds without you.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: 14, marginBottom: 52 }}>
          <StatCard value="$87k" label="Perfect timing over 20 years"
            sub="Investing $2,000/yr at each year's market low" accent={C.gold} />
          <StatCard value="$82k" label="Invest immediately — Jan 1"
            sub="No timing. Just consistency." accent={C.green} />
          <StatCard value="$51k" label="Held in cash — never invested"
            sub="The cost of waiting for certainty" accent={C.red} />
          <StatCard value="$5k" label="Difference: perfect vs. immediate"
            sub="The 'reward' for perfect timing — barely matters" accent={C.teal} />
        </div>

        {/* ── Psychology block ── */}
        <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 16,
          padding: '32px 36px', marginBottom: 52 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.t3,
            letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
            The Psychology
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700,
            color: C.t1, margin: '0 0 16px' }}>
            Outcome Bias — Judging Decisions by How They Feel, Not What They Produce
          </h2>
          <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.75, margin: '0 0 14px' }}>
            <strong style={{ color: C.t1 }}>Outcome bias</strong> causes investors to evaluate
            the quality of a decision based on its short-term result rather than the process
            behind it. Combined with <strong style={{ color: C.t1 }}>status quo bias</strong>
            — the tendency to favor inaction — waiting becomes the default, rationalized by
            an endless search for certainty.
          </p>
          <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.75, margin: 0 }}>
            The uncomfortable truth revealed by decades of market data: even the
            <strong style={{ color: C.t1 }}> worst possible timer</strong> — someone who invested
            every year at the exact market peak — still dramatically outperformed the investor who
            sat in cash waiting for conditions to improve.
          </p>
        </div>

        {/* ── Chart ── */}
        <div ref={chartRef} style={{ marginBottom: 52 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: C.t3,
              letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
              Schwab Center for Financial Research · 20-Year Study · S&amp;P 500
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700,
              color: C.t1, margin: 0 }}>
              Five Investors. One Market. Twenty Years.
            </h2>
            <p style={{ fontFamily: UI, fontSize: 13, color: C.t3, margin: '6px 0 0' }}>
              $2,000 invested annually · $40,000 total contributed · Final portfolio value
            </p>
          </div>

          <div style={{ background: C.surf, border: `1px solid ${C.b1}`,
            borderRadius: 16, padding: '28px 20px 20px' }}>
            {showChart && (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={INVESTOR_DATA} margin={{ top: 28, right: 16, left: 8, bottom: 8 }}
                  barCategoryGap="28%">
                  <CartesianGrid vertical={false} stroke={C.b1} />
                  <XAxis dataKey="name"
                    tick={{ fill: C.t3, fontFamily: UI, fontSize: 10 }}
                    axisLine={false} tickLine={false} />
                  <YAxis
                    domain={[40000, 95000]}
                    tickFormatter={v => `$${(v/1000).toFixed(0)}k`}
                    tick={{ fill: C.t3, fontFamily: MONO, fontSize: 10 }}
                    axisLine={false} tickLine={false} width={48} />
                  <Tooltip content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <ReferenceLine y={40000} stroke={C.b2} strokeDasharray="4 3"
                    label={{ value: 'Amount invested ($40k)', fill: C.t3,
                      fontSize: 10, fontFamily: MONO, position: 'right' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}
                    isAnimationActive={true} animationDuration={900} animationBegin={0}>
                    {INVESTOR_DATA.map(entry => (
                      <Cell key={entry.name} fill={TYPE_COLOR[entry.type]} />
                    ))}
                    <LabelList
                      dataKey="label"
                      position="top"
                      style={{ fill: C.t2, fontFamily: MONO, fontSize: 10, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <p style={{ fontFamily: UI, fontSize: 11, color: C.t3, marginTop: 10,
            textAlign: 'center', letterSpacing: '0.04em' }}>
            Source: Schwab Center for Financial Research. Hypothetical illustration.
            Does not account for taxes or transaction costs.
          </p>
        </div>

        {/* ── Key insight cards ── */}
        <div style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 16,
          padding: '28px 32px', marginBottom: 52 }}>
          <h3 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700,
            color: C.t1, margin: '0 0 24px' }}>The Three Insights From This Study</h3>
          {[
            {
              num: '01',
              title: 'Perfect timing is almost impossible — and barely worth it',
              body: 'The perfect timer beat the immediate investor by just $5,354 over 20 years. Investing $2,000/year and never missing a contribution is worth far more than any timing advantage.',
              color: C.gold,
            },
            {
              num: '02',
              title: 'Even terrible timing beats holding cash',
              body: 'The investor who bought at the peak every single year for 20 years still ended with $72,488 — more than $21,000 ahead of the cash hoarder. Bad timing beats no timing.',
              color: C.green,
            },
            {
              num: '03',
              title: 'Consistency is the only reliable edge available to everyone',
              body: 'Immediate investment on Jan 1 each year — no analysis, no timing — produced $81,650. Within $5k of perfect. The simplest strategy came within 6% of the theoretical ideal.',
              color: C.teal,
            },
          ].map(item => (
            <div key={item.num} style={{ display: 'flex', gap: 20, marginBottom: 24,
              paddingBottom: 24, borderBottom: `1px solid ${C.b1}` }}
            >
              <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 900,
                color: item.color, opacity: 0.4, lineHeight: 1, minWidth: 32 }}>
                {item.num}
              </div>
              <div>
                <div style={{ fontFamily: UI, fontSize: 14, fontWeight: 700,
                  color: C.t1, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.7 }}>
                  {item.body}
                </div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 900,
              color: C.red, opacity: 0.4, lineHeight: 1, minWidth: 32 }}>04</div>
            <div>
              <div style={{ fontFamily: UI, fontSize: 14, fontWeight: 700,
                color: C.t1, marginBottom: 6 }}>
                The cost of waiting is measured in real dollars
              </div>
              <div style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.7 }}>
                The cash hoarder contributed the same $40,000 and held it for 20 years — yet
                ended with $51,291. The immediate investor ended with $81,650. The gap is not
                timing skill. It is the compounding loss of simply not being invested.
              </div>
            </div>
          </div>
        </div>

        {/* ── Historical "wait" moments ── */}
        <div style={{ marginBottom: 52 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.t3,
            letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
            The Pattern Repeats
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700,
            color: C.t1, margin: '0 0 20px' }}>
            Every Decade Had a "Good Reason to Wait"
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {WAIT_MOMENTS.map((m, i) => (
              <div key={m.year} style={{
                display: 'grid', gridTemplateColumns: '64px 1fr 1fr',
                gap: 16, alignItems: 'center',
                padding: '18px 20px',
                background: i % 2 === 0 ? C.surf : '#1f1812',
                border: `1px solid ${C.b1}`,
                borderRadius: i === 0 ? '12px 12px 0 0' : i === WAIT_MOMENTS.length - 1 ? '0 0 12px 12px' : 0,
                borderTop: i > 0 ? 'none' : `1px solid ${C.b1}`,
              }}>
                <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 800, color: C.gold }}>
                  {m.year}
                </div>
                <div>
                  <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: C.t1, marginBottom: 2 }}>
                    {m.event}
                  </div>
                  <div style={{ fontFamily: UI, fontSize: 11, color: C.t3 }}>{m.action}</div>
                </div>
                <div style={{ fontFamily: UI, fontSize: 11, color: C.red, lineHeight: 1.5 }}>
                  {m.cost}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Three action cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16, marginBottom: 52 }}>
          {[
            {
              icon: <Timer size={18} color={C.gold} />,
              title: 'Start now — not at the bottom',
              body: 'The bottom is only visible in hindsight. Starting today costs nothing in terms of missed opportunity. Waiting costs compounding time.',
            },
            {
              icon: <Target size={18} color={C.gold} />,
              title: 'Use automation to remove the decision',
              body: 'Automatic monthly or annual contributions eliminate the timing decision entirely. Consistency beats timing in virtually every historical scenario.',
            },
            {
              icon: <TrendingUp size={18} color={C.gold} />,
              title: 'The process is the edge',
              body: 'Discipline and consistency — not insight or prediction — are the variables that separate long-term wealth builders from those who perpetually wait.',
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
            "Our favorite holding period is forever. The best time to plant a tree was twenty years
            ago. The second best time is now."
          </p>
          <span style={{ fontFamily: UI, fontSize: 12, color: C.t3 }}>
            — Warren Buffett, Berkshire Hathaway (paraphrased)
          </span>
        </div>

        {/* ── Navigation CTA ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/horizon-flip')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: `1px solid ${C.b2}`,
              borderRadius: 10, padding: '12px 20px', cursor: 'pointer',
              fontFamily: UI, fontSize: 13, color: C.t2,
            }}
          >
            <ArrowLeft size={14} /> Lesson 3: The Horizon Flip
          </button>

          <button
            onClick={() => navigate('/doom-loop')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: C.gold, border: 'none', borderRadius: 10,
              padding: '13px 24px', cursor: 'pointer',
              fontFamily: UI, fontSize: 13, fontWeight: 700, color: '#1a1410',
            }}
          >
            Next: The Doom-Loop <ArrowRight size={14} />
          </button>
        </div>

        {/* ── Disclaimer ── */}
        <div style={{ marginTop: 48, padding: '16px 20px',
          background: C.raise, borderRadius: 10, border: `1px solid ${C.b1}` }}>
          <p style={{ fontFamily: UI, fontSize: 11, color: C.t3, lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: C.t3 }}>Educational Disclaimer:</strong> This content is
            provided for educational purposes only and does not constitute investment advice.
            The five-investor scenario is adapted from Schwab Center for Financial Research
            hypothetical analysis. Past performance is not indicative of future results.
            Individual outcomes will vary. Consult a qualified financial advisor before making
            investment decisions.
          </p>
        </div>

      </div>
    </div>
  );
}
