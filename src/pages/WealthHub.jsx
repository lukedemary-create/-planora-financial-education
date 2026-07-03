import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  TrendingUp, BarChart2, Wallet, Search, BookOpen, Eye,
  Calculator, PieChart, ArrowUpRight, ChevronRight, Target, Shield, Clock,
  CheckCircle2, XCircle, Sparkles,
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
  { value: '7%',    label: 'Real annual return of the S&P 500 after inflation since 1928',  source: 'NYU Stern' },
  { value: '33%',   label: 'Of households track their net worth even annually',              source: 'FINRA' },
  { value: '$1.4M', label: 'Median wealth gap between those who invest and those who don\'t at age 65', source: 'Fed Reserve' },
  { value: '3%',    label: 'Average annual alpha from written investment strategy vs. none', source: 'Vanguard' },
]

const PILLARS = [
  {
    icon: TrendingUp,
    title: 'Wealth Is Built, Not Earned',
    body: 'Income pays the bills. Investment builds wealth. The median American earning $75,000 for 35 years makes $2.6 million in lifetime income — yet the median retirement savings at age 65 is just $87,000. The math shows the problem is not earning, it is building: most income is consumed, not invested and compounded.',
    stat: '$2.6M earned. $87k saved. The gap is the lesson.',
  },
  {
    icon: Shield,
    title: 'Risk Tolerance Is Not Risk Capacity',
    body: 'Risk tolerance is how much volatility you can stomach emotionally. Risk capacity is how much you can afford to lose given your timeline and obligations. Most investors confuse the two — either taking more risk than they can financially afford, or less risk than their timeline could handle. Calibrating this correctly is worth more than any stock pick.',
    stat: 'Wrong risk sizing costs avg. 1.8% annually',
  },
  {
    icon: Target,
    title: 'Net Worth Is the Only Scoreboard',
    body: 'Income, salary, and portfolio returns are inputs. Net worth — assets minus liabilities — is the output that actually measures financial progress. A household earning $200,000 but spending $210,000 has negative net worth velocity. A household earning $60,000 and investing $15,000 is building real wealth. Track the scoreboard, not just the game.',
    stat: 'Only 33% of Americans track net worth annually',
  },
]

const COMPARE = {
  with: [
    'Portfolio risk aligned to actual timeline and obligations',
    'Net worth tracked quarterly — trends visible before problems compound',
    'Asset allocation reviewed and rebalanced systematically',
    'Investment decisions driven by written strategy, not emotion',
    'Brokerage accounts, IRAs, and 401(k)s working together tax-efficiently',
    'Clear view of total financial picture across all accounts',
  ],
  without: [
    'Risk level set once and never revisited as life circumstances change',
    'Net worth unknown — no visibility into whether wealth is growing',
    'Portfolio drifts from target allocation, silently increasing risk',
    'Decisions made in reaction to market headlines and social media',
    'Accounts managed in isolation, creating redundancy and tax drag',
    'No consolidated view — impossible to make coordinated decisions',
  ],
}

const SECTIONS = [
  {
    icon: BarChart2,
    label: 'Risk Analysis',
    desc: 'Portfolio stress-testing, risk profiling, drawdown scenarios, and asset correlation analysis.',
    href: '/RiskAnalysis',
    concept: 'Sharpe Ratio',
  },
  {
    icon: Wallet,
    label: 'Net Worth Tracker',
    desc: 'Consolidated view of all assets and liabilities — track your real financial scoreboard over time.',
    href: '/net-worth',
    concept: 'Net Worth Velocity',
  },
  {
    icon: BookOpen,
    label: 'Brokerage Guide',
    desc: 'Side-by-side comparison of brokerages, account types, fee structures, and platform capabilities.',
    href: '/brokerage-guide',
    concept: 'Expense Ratio',
  },
  {
    icon: BarChart2,
    label: 'Market Breadth',
    desc: 'Advance/decline ratios, new highs/lows, and market internals that reveal the true health beneath the surface.',
    href: '/market-breadth',
    concept: 'Breadth Divergence',
  },
  {
    icon: Sparkles,
    label: 'Financial Reports',
    desc: 'Personalized financial planning reports — wealth diagnostics, tax efficiency, retirement readiness, and more.',
    href: '/financial-reports',
    concept: 'Financial Health Score',
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

export default function WealthHub() {
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
        <button onClick={() => navigate('/hub')} style={{ width: 28, height: 28, background: C.gold, borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title="All sections">
          <span style={{ fontFamily: DISPLAY, fontSize: '0.875rem', fontWeight: 900, color: C.bg, lineHeight: 1 }}>P</span>
        </button>
        <div style={{ width: 1, height: 18, background: C.b2 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: UI, fontSize: '0.75rem', color: C.t3, padding: 0 }}>Home</button>
          <ChevronRight size={12} color={C.t3} />
          <span style={{ fontFamily: UI, fontSize: '0.75rem', color: C.t2, fontWeight: 500 }}>Wealth & Investing</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {['Planning', 'Markets', 'Macro'].map(s => (
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
            <span style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold }}>Wealth & Investing</span>
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)', fontWeight: 700, color: C.t1, lineHeight: 1.08, margin: '0 0 1.5rem', letterSpacing: '-0.02em' }}>
            Most people earn millions.<br />Few of them<em style={{ fontStyle: 'italic', color: C.gold }}> keep</em> it.
          </h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: 860 }}>
            <p style={{ fontFamily: UI, fontSize: '0.9375rem', color: C.t2, lineHeight: 1.8, margin: 0 }}>
              The average American earns over $2 million in a lifetime. The average retirement savings at age 65 is $87,000. The gap is not income — it is the absence of a system for building and protecting wealth rather than simply passing it through. Investing is that system.
            </p>
            <p style={{ fontFamily: UI, fontSize: '0.9375rem', color: C.t2, lineHeight: 1.8, margin: 0 }}>
              Building wealth requires three things working together: a portfolio allocated to your actual risk capacity, a net worth framework to track real progress, and the discipline to let compounding work. This section gives you the tools to do all three with institutional-grade precision.
            </p>
          </div>
        </motion.div>
      </div>

      <div ref={statsRef} style={{ borderTop: `1px solid ${C.b1}`, borderBottom: `1px solid ${C.b1}`, background: C.surf }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {STATS.map((s, i) => (
            <motion.div key={s.value} variants={FADE} initial="hidden" animate={statsInView ? 'show' : 'hidden'} transition={{ delay: i * 0.08 }}
              style={{ padding: '1.875rem 1.5rem', borderRight: i < 3 ? `1px solid ${C.b1}` : 'none' }}>
              <div style={{ fontFamily: MONO, fontSize: 'clamp(1.75rem, 2.5vw, 2.5rem)', fontWeight: 700, color: C.gold, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
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
            Three principles<em style={{ fontStyle: 'italic', color: C.gold }}> serious wealth builders</em> never ignore
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
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: C.t1, margin: 0, letterSpacing: '-0.02em' }}>Wealth builder vs. income consumer</h2>
          </div>
          <motion.div variants={STAGGER} initial="hidden" animate={compareInView ? 'show' : 'hidden'} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <motion.div variants={FADE} style={{ background: C.raise, border: `1px solid ${C.b1}`, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.375rem', borderBottom: `1px solid ${C.b1}`, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(74,124,89,0.06)' }}>
                <CheckCircle2 size={14} color={C.up} />
                <span style={{ fontFamily: UI, fontSize: '0.8125rem', fontWeight: 700, color: C.t1 }}>Wealth builder</span>
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
                <span style={{ fontFamily: UI, fontSize: '0.8125rem', fontWeight: 700, color: C.t1 }}>Income consumer</span>
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
            <p style={{ fontFamily: DISPLAY, fontSize: '1.0625rem', fontStyle: 'italic', color: C.t1, margin: '0 0 0.5rem', lineHeight: 1.6 }}>"Do not save what is left after spending; instead spend what is left after saving."</p>
            <span style={{ fontFamily: UI, fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.t3 }}>Warren Buffett</span>
          </div>
        </div>
      </div>

      <div ref={sectionsRef} style={{ maxWidth: 1100, margin: '0 auto', padding: '3.5rem 2.5rem 5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.t3, marginBottom: 8 }}>Explore wealth</div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: C.t1, margin: 0, letterSpacing: '-0.02em' }}>
              Five tools for<em style={{ fontStyle: 'italic', color: C.gold }}> building and protecting</em>
            </h2>
          </div>
          <p style={{ fontFamily: UI, fontSize: '0.8125rem', color: C.t3, maxWidth: 340, lineHeight: 1.65, margin: 0 }}>From projection to analysis to lookup — everything needed to manage wealth like an institution.</p>
        </div>
        <motion.div variants={STAGGER} initial="hidden" animate={sectionsInView ? 'show' : 'hidden'} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }} className="hub-sections-grid">
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
