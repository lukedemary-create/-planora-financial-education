import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot,
} from 'recharts';
import { Zap, ChevronRight, ArrowRight } from 'lucide-react';

/* ── Design tokens ────────────────────────────────────────────────── */
const BG    = '#1a1410';
const SURF  = '#231c16';
const RAISE = '#2d2419';
const B1    = '#2a2018';
const B2    = '#3d3028';
const GOLD  = '#c9a96e';
const BROWN = '#8b6340';
const BLUE  = '#2d6a9f';
const GREEN = '#4a7c59';
const RED   = '#8b3a3a';
const T1    = '#f0e8d8';
const T2    = '#a89070';
const T3    = '#6b5540';

const DISPLAY = "'Playfair Display', Georgia, serif";
const UI      = "'Inter', system-ui, sans-serif";
const MONO    = "'JetBrains Mono', 'Courier New', monospace";

const EASE = [0.32, 0.72, 0, 1];
const FADE = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } };

/* ── Chart data ───────────────────────────────────────────────────── */
// Crash phase: peak (100) → trough (63) over 12 months (avg bear)
// Recovery: trough → +230% over 66 months (avg bull)
const CHART_DATA = [
  { mo: 0,  label: 'Peak',          crash: 100, recovery: null  },
  { mo: 2,  label: '',              crash: 91,  recovery: null  },
  { mo: 4,  label: '',              crash: 82,  recovery: null  },
  { mo: 6,  label: '',              crash: 74,  recovery: null  },
  { mo: 8,  label: '',              crash: 68,  recovery: null  },
  { mo: 10, label: '',              crash: 65,  recovery: null  },
  { mo: 12, label: 'Trough \u221234%', crash: 63,  recovery: 63  },
  { mo: 15, label: '',              crash: null, recovery: 72  },
  { mo: 18, label: '',              crash: null, recovery: 83  },
  { mo: 21, label: '',              crash: null, recovery: 95  },
  { mo: 24, label: 'Break-even',   crash: null, recovery: 102 },
  { mo: 30, label: '',              crash: null, recovery: 122 },
  { mo: 42, label: '',              crash: null, recovery: 158 },
  { mo: 54, label: '',              crash: null, recovery: 188 },
  { mo: 66, label: '',              crash: null, recovery: 213 },
  { mo: 78, label: '+230%',        crash: null, recovery: 238 },
];

/* ── Custom tooltip ───────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const val = item?.value;
  const isCrash = item?.dataKey === 'crash';
  return (
    <div style={{
      background: RAISE, border: `1px solid ${B2}`, borderRadius: 10,
      padding: '10px 14px', fontFamily: UI, fontSize: 12,
    }}>
      <div style={{ color: T3, marginBottom: 4 }}>Month {label}</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: isCrash ? RED : GREEN }}>
        {val != null ? `${val.toFixed(0)} (indexed)` : '—'}
      </div>
      <div style={{ color: T3, fontSize: 11, marginTop: 2 }}>
        {isCrash ? 'Bear market decline' : 'Bull market recovery'}
      </div>
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────────────────── */
function StatCard({ value, label, sub, color }) {
  return (
    <div style={{
      background: SURF, border: `1px solid ${B2}`, borderRadius: 14,
      padding: '1.25rem 1.5rem', flex: 1,
    }}>
      <div style={{ fontFamily: MONO, fontSize: '1.75rem', fontWeight: 900, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: UI, fontSize: '0.8125rem', fontWeight: 600, color: T1, marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontFamily: UI, fontSize: '0.75rem', color: T3, marginTop: 3, lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────── */
export default function ElasticBand() {
  const navigate = useNavigate();
  const chartRef   = useRef(null);
  const inView     = useInView(chartRef, { once: true, margin: '-80px' });
  const [showChart, setShowChart] = useState(false);

  useEffect(() => { if (inView) setShowChart(true); }, [inView]);

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: UI, paddingBottom: '5rem' }}>

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <div style={{ padding: '1.25rem 2.5rem', borderBottom: `1px solid ${B1}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate('/MarketHistory')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: UI, fontSize: '0.75rem', color: T3, padding: 0 }}>
          History &amp; Psychology
        </button>
        <ChevronRight size={12} color={T3} />
        <span style={{ fontFamily: UI, fontSize: '0.75rem', color: T2 }}>The Elastic Band Effect</span>
        <div style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: '0.6875rem', color: T3, letterSpacing: '0.08em' }}>LESSON 1 OF 5</div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 2.5rem' }}>

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <motion.div initial="hidden" animate="show" variants={FADE} style={{ padding: '3.5rem 0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${GOLD}15`, border: `1px solid ${GOLD}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} color={GOLD} />
            </div>
            <span style={{ fontFamily: UI, fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD }}>Behavioral Finance</span>
          </div>

          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: T1, margin: '0 0 1.25rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            The Elastic Band Effect
          </h1>
          <p style={{ fontFamily: DISPLAY, fontSize: '1.25rem', fontStyle: 'italic', color: GOLD, margin: '0 0 1.75rem', lineHeight: 1.5 }}>
            Markets recover faster than they fall. Every time.
          </p>
          <p style={{ fontFamily: UI, fontSize: '1rem', color: T2, lineHeight: 1.8, maxWidth: 680, margin: 0 }}>
            The most expensive mistake in investing is not holding a bad stock — it is selling a good one at the exact moment the market is about to snap back. History shows that bear markets are brief, violent, and temporary. The recoveries that follow are long, powerful, and permanent.
          </p>
        </motion.div>

        {/* ── Divider ─────────────────────────────────────────────── */}
        <div style={{ height: 1, background: B2, margin: '0 0 2.5rem' }} />

        {/* ── Psychology section ──────────────────────────────────── */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={FADE}>
          <div style={{ marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 1, background: BROWN }} />
            <span style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: BROWN }}>The Psychology</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: '1.5rem', fontWeight: 700, color: T1, margin: '0 0 1.25rem' }}>Loss Aversion: Why the Fear Outlasts the Fall</h2>

          <div style={{ background: SURF, border: `1px solid ${B2}`, borderRadius: 16, padding: '1.75rem', marginBottom: '1.25rem' }}>
            <p style={{ fontFamily: UI, fontSize: '0.9375rem', color: T2, lineHeight: 1.85, margin: '0 0 1.25rem' }}>
              In the 1970s, behavioral economists Daniel Kahneman and Amos Tversky identified a cognitive bias they called <strong style={{ color: T1 }}>loss aversion</strong> — the psychological phenomenon where the pain of losing money is felt approximately twice as intensely as the pleasure of gaining the same amount. Losing $1,000 feels worse than gaining $1,000 feels good.
            </p>
            <p style={{ fontFamily: UI, fontSize: '0.9375rem', color: T2, lineHeight: 1.85, margin: '0 0 1.25rem' }}>
              This is why bear markets feel endless. When a portfolio drops 30%, the emotional experience is not proportional to the financial reality — it feels catastrophic. The brain's threat-detection systems activate, anxiety escalates, and the rational mind gets overridden by a very primal instinct: <em style={{ color: T1 }}>get out before it gets worse.</em>
            </p>
            <p style={{ fontFamily: UI, fontSize: '0.9375rem', color: T2, lineHeight: 1.85, margin: 0 }}>
              The problem is that the investor who acts on this instinct steps off the ride at the exact moment the elastic band is stretched to its maximum tension — right before it snaps back. Markets do not drift slowly upward after a crash. They surge. And the investors in cash miss almost all of it.
            </p>
          </div>
        </motion.div>

        {/* ── Historical proof ────────────────────────────────────── */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={FADE} style={{ margin: '2.5rem 0' }}>
          <div style={{ marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 1, background: BROWN }} />
            <span style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: BROWN }}>Historical Record</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: '1.5rem', fontWeight: 700, color: T1, margin: '0 0 1.5rem' }}>What the Data Actually Shows</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem', marginBottom: '1.75rem' }}>
            <StatCard value="11–14 mo" label="Average bear market duration" sub="Peak to trough, S&P 500 since 1928" color={RED} />
            <StatCard value="5.5 yr"   label="Average bull market duration" sub="Trough to next peak, S&P 500 since 1928" color={GREEN} />
            <StatCard value="5 mo"     label="COVID recovery time" sub="Fastest 30% crash in history — then snapped back" color={GOLD} />
          </div>

          <div style={{ background: SURF, border: `1px solid ${B2}`, borderRadius: 14, padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {[
                { event: '2020 COVID Crash', crash: '-34% in 33 days', recovery: 'Full recovery in 5 months', note: 'Then rose +100% to new ATH' },
                { event: '2008 Financial Crisis', crash: '-57% over 17 months', recovery: 'Full recovery in 49 months', note: 'Bull market lasted until 2020' },
                { event: '2000 Dot-Com Crash', crash: '-49% over 30 months', recovery: 'Full recovery in 55 months', note: 'S&P 500 (not Nasdaq)' },
                { event: '1987 Black Monday', crash: '-34% in one day', recovery: 'Full recovery in 15 months', note: 'Then rose 580% by 2000' },
              ].map(r => (
                <div key={r.event} style={{ borderBottom: `1px solid ${B1}`, paddingBottom: '1rem' }}>
                  <div style={{ fontFamily: UI, fontSize: '0.8125rem', fontWeight: 700, color: T1, marginBottom: 5 }}>{r.event}</div>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: '0.8125rem', fontWeight: 700, color: RED }}>{r.crash}</div>
                      <div style={{ fontFamily: UI, fontSize: '0.6875rem', color: T3 }}>crash</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: '0.8125rem', fontWeight: 700, color: GREEN }}>{r.recovery}</div>
                      <div style={{ fontFamily: UI, fontSize: '0.6875rem', color: T3 }}>recovery</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: UI, fontSize: '0.75rem', color: T3, marginTop: 4 }}>{r.note}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: UI, fontSize: '0.6875rem', color: T3, marginTop: '1rem' }}>
              Source: S&P 500 historical data, Yardeni Research, Ned Davis Research. Data covers S&P 500 bear and bull market cycles 1928–2024.
            </div>
          </div>
        </motion.div>

        {/* ── Chart ───────────────────────────────────────────────── */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={FADE} style={{ margin: '2.5rem 0' }}>
          <div style={{ marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 1, background: BROWN }} />
            <span style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: BROWN }}>Visualization</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: '1.5rem', fontWeight: 700, color: T1, margin: '0 0 0.375rem' }}>Peak-to-Recovery Timeline</h2>
          <p style={{ fontFamily: UI, fontSize: '0.875rem', color: T3, margin: '0 0 1.5rem', lineHeight: 1.6 }}>
            Indexed to 100 at peak. Crash phase (red) averages 11–14 months. Recovery phase (green) averages 5+ years. The asymmetry is the lesson.
          </p>

          <div ref={chartRef} style={{ background: SURF, border: `1px solid ${B2}`, borderRadius: 16, padding: '1.5rem 1rem 1rem' }}>
            {showChart ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={CHART_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="crashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={RED} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={RED} stopOpacity={0.04} />
                    </linearGradient>
                    <linearGradient id="recoveryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={GREEN} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={GREEN} stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={B2} vertical={false} />
                  <XAxis
                    dataKey="mo"
                    tick={{ fontFamily: MONO, fontSize: 10, fill: T3 }}
                    tickLine={false}
                    axisLine={{ stroke: B2 }}
                    label={{ value: 'Months from Peak', position: 'insideBottom', offset: -4, fontFamily: UI, fontSize: 11, fill: T3 }}
                  />
                  <YAxis
                    tick={{ fontFamily: MONO, fontSize: 10, fill: T3 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[50, 260]}
                    tickFormatter={v => v}
                    label={{ value: 'Indexed (Peak = 100)', angle: -90, position: 'insideLeft', offset: 10, fontFamily: UI, fontSize: 11, fill: T3 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={100} stroke={GOLD} strokeDasharray="4 4" strokeOpacity={0.5} />
                  <Area
                    type="monotone"
                    dataKey="crash"
                    stroke={RED}
                    strokeWidth={2.5}
                    fill="url(#crashGrad)"
                    dot={false}
                    connectNulls={false}
                    isAnimationActive
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="recovery"
                    stroke={GREEN}
                    strokeWidth={2.5}
                    fill="url(#recoveryGrad)"
                    dot={false}
                    connectNulls={false}
                    isAnimationActive
                    animationBegin={800}
                    animationDuration={1600}
                    animationEasing="ease-out"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: UI, fontSize: '0.875rem', color: T3 }}>Scroll to reveal chart</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem' }}>
              {[{ color: RED, label: 'Bear market (avg 11–14 months)' }, { color: GREEN, label: 'Bull market recovery (avg 5+ years)' }, { color: GOLD, label: 'Break-even line (100)' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 18, height: 2.5, background: l.color, borderRadius: 2 }} />
                  <span style={{ fontFamily: UI, fontSize: '0.6875rem', color: T3 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Pullquote ───────────────────────────────────────────── */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={FADE} style={{ margin: '2.5rem 0' }}>
          <div style={{
            borderLeft: `3px solid ${GOLD}`,
            paddingLeft: '1.75rem',
            background: `${GOLD}07`,
            borderRadius: '0 14px 14px 0',
            padding: '1.75rem 1.75rem 1.75rem 2rem',
          }}>
            <p style={{ fontFamily: DISPLAY, fontSize: '1.25rem', fontStyle: 'italic', color: T1, margin: '0 0 0.875rem', lineHeight: 1.65 }}>
              "The investor who panics and sells in a bear market does not avoid the loss — they lock it in permanently. The elastic band snaps back without them."
            </p>
            <div style={{ fontFamily: UI, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: GOLD }}>
              The Core Lesson
            </div>
            <p style={{ fontFamily: UI, fontSize: '0.9rem', color: T2, lineHeight: 1.75, margin: '0.75rem 0 0' }}>
              Bear markets are not a signal to exit. They are a feature of the system — a temporary repricing that historically precedes aggressive recoveries. The data is unambiguous: the investors who stayed fully invested through every crash in history dramatically outperformed those who tried to avoid it.
            </p>
          </div>
        </motion.div>

        {/* ── Next lesson CTA ─────────────────────────────────────── */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={FADE}>
          <button
            onClick={() => navigate('/best-days')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: SURF, border: `1px solid ${B2}`, borderRadius: 14, padding: '1.25rem 1.5rem',
              cursor: 'pointer', transition: 'border-color 0.18s, background 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD + '50'; e.currentTarget.style.background = RAISE; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = B2; e.currentTarget.style.background = SURF; }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: MONO, fontSize: '0.6875rem', color: T3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Next — Lesson 2 of 5</div>
              <div style={{ fontFamily: DISPLAY, fontSize: '1.0625rem', fontWeight: 700, color: T1 }}>The Best Days Missing Link</div>
              <div style={{ fontFamily: UI, fontSize: '0.8125rem', color: T2, marginTop: 3 }}>Discover why missing just 10 days can cut your returns in half</div>
            </div>
            <ArrowRight size={18} color={GOLD} />
          </button>
        </motion.div>

        {/* ── Disclaimer ──────────────────────────────────────────── */}
        <div style={{ marginTop: '3rem', padding: '1rem 0', borderTop: `1px solid ${B1}` }}>
          <p style={{ fontFamily: UI, fontSize: '0.6875rem', color: T3, lineHeight: 1.7, margin: 0 }}>
            Historical data is for educational purposes only. Past performance does not guarantee future results. Bear and bull market durations are historical averages and individual cycles vary significantly. S&P 500 data sourced from Yardeni Research, Ned Davis Research, and Ibbotson Associates (1928–2024).
          </p>
        </div>

      </div>
    </div>
  );
}
