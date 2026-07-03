import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Globe, Zap, Users, ShoppingCart, BarChart2, Activity,
  ArrowUpRight, ChevronRight, TrendingUp, Target, Shield,
  CheckCircle2, XCircle,
} from 'lucide-react'

const DISPLAY = "'Playfair Display', Georgia, serif"
const UI      = "'Inter', system-ui, sans-serif"
const MONO    = "'JetBrains Mono', monospace"
const EASE    = [0.32, 0.72, 0, 1]

const C = {
  bg:      '#1a1410',
  surf:    '#231c16',
  raise:   '#2d2419',
  b1:      '#2a2018',
  b2:      '#3d3028',
  gold:    '#c9a96e',
  goldDim: 'rgba(201,169,110,0.08)',
  goldBdr: 'rgba(201,169,110,0.20)',
  t1:      '#f0e8d8',
  t2:      '#a89070',
  t3:      '#6b5540',
  up:      '#4a7c59',
  down:    '#c0392b',
}

const FADE    = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }
const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

const STATS = [
  { value: '70%',   label: 'Of US GDP is driven by consumer spending — the single most watched data point', source: 'BEA' },
  { value: '48h',   label: 'Average time for equity markets to price in a major Fed rate decision',          source: 'Fed Reserve' },
  { value: '0.74',  label: 'Correlation between oil prices and CPI inflation over rolling 5-year periods',  source: 'EIA' },
  { value: '6–12mo',label: 'Labor market deterioration typically leads recession by this window',           source: 'NBER' },
]

const PILLARS = [
  {
    icon: Globe,
    title: 'Macro Is the Market\'s Weather System',
    body: 'Individual stocks are ships. Macro is the ocean. In a broad bull market, even mediocre companies rise. In a macro downturn, even excellent businesses fall. Understanding the macro environment does not tell you which stock to buy — it tells you the conditions in which your investments must survive. That context is worth more than most analysis.',
    stat: '72% of portfolio returns explained by asset class, not stock selection',
  },
  {
    icon: Target,
    title: 'Policy Is Portfolio Risk',
    body: 'The Federal Reserve\'s interest rate decisions affect every asset class simultaneously — bond prices, equity valuations, real estate cap rates, and the dollar. A single FOMC statement can shift $2 trillion in market cap within hours. Understanding policy mechanics is not optional for any investor with more than a 12-month horizon.',
    stat: 'Fed rate hike of 100bps lowers equity P/E by ~15% on average',
  },
  {
    icon: Activity,
    title: 'Leading Indicators Reward the Early',
    body: 'Lagging indicators (GDP, unemployment rates) confirm what already happened. Leading indicators (yield curve, PMI, credit spreads, building permits) signal what is coming. Investors who understand the difference position months before consensus catches up — the edge is not intelligence, it is reading the right signals first.',
    stat: 'Yield curve inverted 12–18 months before every recession since 1955',
  },
]

const COMPARE = {
  with: [
    'Tracks Fed policy and anticipates market repricing before it happens',
    'Reads labor data to understand the real health of the economy',
    'Uses energy prices as an inflation indicator, not just a gas price',
    'Understands the consumer cycle and its lead on GDP',
    'Sees political events as risk factors, not background noise',
    'Positions by economic cycle phase, not calendar year',
  ],
  without: [
    'Surprised by rate hike impacts on portfolio valuation',
    'Ignores labor reports — reacts to market moves instead',
    'Sees energy as irrelevant to a diversified equity portfolio',
    'Consumer confidence data never enters investment decisions',
    'Political risk is ignored until it becomes a market crisis',
    'Holds the same allocation regardless of the economic cycle',
  ],
}

const SECTIONS = [
  {
    icon: Activity,
    label: 'Economic Calendar',
    desc: 'CPI, FOMC, GDP, NFP — every scheduled data release that moves markets. Never be caught off guard by a major print.',
    href: '/economic-calendar',
    concept: 'Market-Moving Events',
  },
  {
    icon: Users,
    label: 'Labor Markets',
    desc: 'NFP, unemployment rate, jobless claims, wage growth — the labor market metrics the Fed watches most closely.',
    href: '/labor',
    concept: 'Non-Farm Payrolls',
  },
  {
    icon: ShoppingCart,
    label: 'The Consumer',
    desc: 'Retail sales, consumer confidence, credit card data, and spending patterns that predict the economic direction.',
    href: '/consumer',
    concept: 'Consumer Sentiment Index',
  },
  {
    icon: TrendingUp,
    label: 'Real Estate',
    desc: 'Housing prices, mortgage rates, inventory levels, and real estate market data — the macro lens on property markets.',
    href: '/real-estate',
    concept: 'Cap Rate',
  },
]

function PillarCard({ pillar }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const Icon = pillar.icon
  return (
    <motion.div ref={ref} variants={FADE} initial="hidden" animate={inView ? 'show' : 'hidden'}
      style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 16, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.gold} 0%, transparent 60%)` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.goldDim, border: `1px solid ${C.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={C.gold} />
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: '1rem', fontWeight: 700, color: C.t1 }}>{pillar.title}</div>
      </div>
      <p style={{ fontFamily: UI, fontSize: '0.875rem', color: C.t2, lineHeight: 1.75, margin: 0 }}>{pillar.body}</p>
      <div style={{ background: C.raise, border: `1px solid ${C.b2}`, borderRadius: 8, padding: '0.5rem 0.875rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <BarChart2 size={11} color={C.gold} />
        <span style={{ fontFamily: MONO, fontSize: '0.6875rem', color: C.gold, fontWeight: 600 }}>{pillar.stat}</span>
      </div>
    </motion.div>
  )
}

function SectionCard({ section }) {
  const navigate = useNavigate()
  const Icon = section.icon
  return (
    <button onClick={() => navigate(section.href)}
      style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '1.375rem', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', transition: 'all 0.18s ease', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.goldBdr; e.currentTarget.style.background = '#271f18'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.b1; e.currentTarget.style.background = C.surf; e.currentTarget.style.transform = 'none' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: C.goldDim, border: `1px solid ${C.goldBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={14} color={C.gold} />
        </div>
        <ArrowUpRight size={13} color={C.t3} />
      </div>
      <div>
        <div style={{ fontFamily: UI, fontSize: '0.9375rem', fontWeight: 600, color: C.t1, marginBottom: 4 }}>{section.label}</div>
        <div style={{ fontFamily: UI, fontSize: '0.8125rem', color: C.t2, lineHeight: 1.6 }}>{section.desc}</div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.t3 }}>Core Concept</div>
        <div style={{ fontFamily: MONO, fontSize: '0.625rem', color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBdr}`, borderRadius: 4, padding: '1px 6px' }}>{section.concept}</div>
      </div>
    </button>
  )
}

export default function MacroHub() {
  const navigate = useNavigate()
  const statsRef    = useRef(null)
  const compareRef  = useRef(null)
  const sectionsRef = useRef(null)
  const statsInView    = useInView(statsRef,    { once: true, margin: '-80px' })
  const compareInView  = useInView(compareRef,  { once: true, margin: '-80px' })
  const sectionsInView = useInView(sectionsRef, { once: true, margin: '-80px' })

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: UI }}>
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.b1}`, padding: '0 2.5rem', height: 52, display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate('/hub')} style={{ width: 28, height: 28, background: C.gold, borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: DISPLAY, fontSize: '0.875rem', fontWeight: 900, color: C.bg, lineHeight: 1 }}>P</span>
        </button>
        <div style={{ width: 1, height: 18, background: C.b2 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: UI, fontSize: '0.75rem', color: C.t3, padding: 0 }}>Home</button>
          <ChevronRight size={12} color={C.t3} />
          <span style={{ fontFamily: UI, fontSize: '0.75rem', color: C.t2, fontWeight: 500 }}>Macro & Economics</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {['Markets', 'Wealth', 'Planning'].map(s => (
            <button key={s} onClick={() => navigate(`/${s.toLowerCase()}`)} style={{ background: 'none', border: `1px solid ${C.b2}`, borderRadius: 7, padding: '4px 12px', fontFamily: UI, fontSize: '0.6875rem', color: C.t3, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.t1; e.currentTarget.style.borderColor = C.goldBdr }}
              onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.borderColor = C.b2 }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '4rem 2.5rem 3rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
            <div style={{ width: 24, height: 1, background: C.gold, opacity: 0.7 }} />
            <span style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold }}>Macro & Economics</span>
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)', fontWeight: 700, color: C.t1, lineHeight: 1.08, margin: '0 0 1.5rem', letterSpacing: '-0.02em' }}>
            Markets are not numbers.<br />They are the sum of human<em style={{ fontStyle: 'italic', color: C.gold }}> decisions</em><br />made in an economic context.
          </h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: 860 }}>
            <p style={{ fontFamily: UI, fontSize: '0.9375rem', color: C.t2, lineHeight: 1.8, margin: 0 }}>
              Every market move has a cause. Interest rates, inflation, labor data, political decisions, energy prices, and consumer behavior are not background noise — they are the forces that drive returns. Understanding macroeconomics is not academic. It is applied investment risk management.
            </p>
            <p style={{ fontFamily: UI, fontSize: '0.9375rem', color: C.t2, lineHeight: 1.8, margin: 0 }}>
              The investor who can read an NFP report, interpret a Fed statement, and understand why energy prices matter to equities has a structural edge over the one who only watches stock prices. This section is built to develop that edge systematically — from first principles to live data.
            </p>
          </div>
        </motion.div>
      </div>

      <div ref={statsRef} style={{ borderTop: `1px solid ${C.b1}`, borderBottom: `1px solid ${C.b1}`, background: C.surf }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {STATS.map((s, i) => (
            <motion.div key={i} variants={FADE} initial="hidden" animate={statsInView ? 'show' : 'hidden'} transition={{ delay: i * 0.08 }}
              style={{ padding: '1.875rem 1.5rem', borderRight: i < 3 ? `1px solid ${C.b1}` : 'none' }}>
              <div style={{ fontFamily: MONO, fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)', fontWeight: 700, color: C.gold, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontFamily: UI, fontSize: '0.8125rem', color: C.t2, lineHeight: 1.55, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: UI, fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.t3 }}>Source: {s.source}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3.5rem 2.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.t3, marginBottom: 8 }}>Why it matters</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: C.t1, margin: 0, letterSpacing: '-0.02em' }}>
            Three macro forces<em style={{ fontStyle: 'italic', color: C.gold }}> every investor must understand</em>
          </h2>
        </div>
        <motion.div variants={STAGGER} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {PILLARS.map(p => <PillarCard key={p.title} pillar={p} />)}
        </motion.div>
      </div>

      <div ref={compareRef} style={{ borderTop: `1px solid ${C.b1}`, background: C.surf }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3.5rem 2.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.t3, marginBottom: 8 }}>The difference</div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: C.t1, margin: 0, letterSpacing: '-0.02em' }}>Macro-aware vs. macro-blind investor</h2>
          </div>
          <motion.div variants={STAGGER} initial="hidden" animate={compareInView ? 'show' : 'hidden'} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <motion.div variants={FADE} style={{ background: C.raise, border: `1px solid ${C.b1}`, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.375rem', borderBottom: `1px solid ${C.b1}`, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(74,124,89,0.06)' }}>
                <CheckCircle2 size={14} color={C.up} />
                <span style={{ fontFamily: UI, fontSize: '0.8125rem', fontWeight: 700, color: C.t1 }}>Macro-aware investor</span>
              </div>
              <div style={{ padding: '0.75rem 0' }}>
                {COMPARE.with.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '0.625rem 1.375rem', borderBottom: i < COMPARE.with.length - 1 ? `1px solid ${C.b1}` : 'none' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.up, marginTop: 6, flexShrink: 0 }} />
                    <span style={{ fontFamily: UI, fontSize: '0.8125rem', color: C.t2, lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div variants={FADE} style={{ background: C.raise, border: `1px solid ${C.b1}`, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.375rem', borderBottom: `1px solid ${C.b1}`, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(192,57,43,0.06)' }}>
                <XCircle size={14} color={C.down} />
                <span style={{ fontFamily: UI, fontSize: '0.8125rem', fontWeight: 700, color: C.t1 }}>Macro-blind investor</span>
              </div>
              <div style={{ padding: '0.75rem 0' }}>
                {COMPARE.without.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '0.625rem 1.375rem', borderBottom: i < COMPARE.without.length - 1 ? `1px solid ${C.b1}` : 'none' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.down, marginTop: 6, flexShrink: 0 }} />
                    <span style={{ fontFamily: UI, fontSize: '0.8125rem', color: C.t2, lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
          <div style={{ marginTop: '2rem', padding: '1.5rem 2rem', background: C.bg, border: `1px solid ${C.b1}`, borderLeft: `3px solid ${C.gold}`, borderRadius: '0 12px 12px 0' }}>
            <p style={{ fontFamily: DISPLAY, fontSize: '1.0625rem', fontStyle: 'italic', color: C.t1, margin: '0 0 0.5rem', lineHeight: 1.6 }}>"It is not the strongest of the species that survives, but the most adaptable to change."</p>
            <span style={{ fontFamily: UI, fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.t3 }}>Charles Darwin — equally true of portfolios</span>
          </div>
        </div>
      </div>

      <div ref={sectionsRef} style={{ maxWidth: 1100, margin: '0 auto', padding: '3.5rem 2.5rem 5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.t3, marginBottom: 8 }}>Explore macro</div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: C.t1, margin: 0, letterSpacing: '-0.02em' }}>
              Six streams of<em style={{ fontStyle: 'italic', color: C.gold }}> economic intelligence</em>
            </h2>
          </div>
          <p style={{ fontFamily: UI, fontSize: '0.8125rem', color: C.t3, maxWidth: 340, lineHeight: 1.65, margin: 0 }}>Every macro data point has a portfolio implication. These sections help you find it.</p>
        </div>
        <motion.div variants={STAGGER} initial="hidden" animate={sectionsInView ? 'show' : 'hidden'} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }} className="hub-sections-grid">
          {SECTIONS.map(s => (
            <motion.div key={s.label} variants={FADE}><SectionCard section={s} /></motion.div>
          ))}
        </motion.div>
        <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: C.gold, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: DISPLAY, fontSize: '0.875rem', fontWeight: 900, color: C.bg, lineHeight: 1 }}>P</span>
          </div>
          <span style={{ fontFamily: UI, fontSize: '0.8125rem', color: C.t3 }}>Press <strong style={{ color: C.t2 }}>P</strong> at any time to navigate to all platform sections.</span>
        </div>
      </div>
      <style>{`@media(max-width:900px){.hub-sections-grid{grid-template-columns:repeat(2,1fr)!important;}}@media(max-width:540px){.hub-sections-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  )
}
