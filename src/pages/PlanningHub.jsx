import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  TrendingUp, Clock, Shield, Home, Users, FileText,
  Wallet, Baby, ChevronRight, ArrowUpRight, BarChart2,
  CheckCircle2, XCircle, Target, Scale, Receipt, ScrollText,
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
  upDim:   'rgba(74,124,89,0.15)',
}

const FADE = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}
const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

/* ── Statistics ────────────────────────────────────────────────────── */
const STATS = [
  { value: '2.5×', label: 'More likely to save adequately', source: 'CFP Board' },
  { value: '+250%', label: 'Greater wealth accumulation over 35 years', source: 'McKinsey' },
  { value: '65%', label: 'Of planners maintain lifestyle in retirement', source: 'EBRI' },
  { value: '78%', label: 'Of non-planners worry about money vs. 44% of planners', source: 'Schwab' },
]

/* ── Planning vs No Planning comparison ────────────────────────────── */
const COMPARE = {
  with: [
    'Clear roadmap for every major financial decision',
    'Tax-optimized wealth accumulation strategy',
    'Risk properly sized to your timeline and goals',
    'Retirement funded with confidence',
    'Estate transferred efficiently with minimal friction',
    'Insurance coverage matched to actual exposure',
  ],
  without: [
    'Reactive decisions driven by market noise',
    'Unnecessary tax drag costing 1–2.5% per year',
    'Portfolio risk misaligned with real needs',
    'Retirement underfunded with no clear bridge',
    'Estate transfer delays, probate costs, family conflict',
    'Over- or under-insured — both are expensive',
  ],
}

/* ── Educational pillars ────────────────────────────────────────────── */
const PILLARS = [
  {
    icon: TrendingUp,
    title: 'Compounding Demands Time',
    body: 'A dollar invested at 25 is worth roughly 21× more at 65 than a dollar invested at 45. Planning is not about predicting the future — it is about giving your money as much time as possible to work. Every year without a plan is a year of compounding sacrificed.',
    stat: '$1 at 25 → $21.72 at 65 (7% avg)',
  },
  {
    icon: Shield,
    title: 'Risk Is Managed, Not Avoided',
    body: 'Every financial decision carries risk — including inaction. A financial plan does not eliminate risk; it quantifies, allocates, and insures it properly. The unplanned investor typically holds too much equity when young and too little when old — both are expensive mistakes.',
    stat: '40% of unplanned investors hold wrong allocation',
  },
  {
    icon: Target,
    title: 'Tax Drag Is Permanent',
    body: 'The average investor loses 1.0–2.5% annually to avoidable taxes through poor asset location and missed harvesting opportunities. Over 30 years at 2% drag, a $500,000 portfolio loses over $440,000 in potential wealth. Tax strategy is not optional for serious wealth builders.',
    stat: '$440k lost over 30 years at 2% tax drag',
  },
]

/* ── Sub-sections ───────────────────────────────────────────────────── */
const SECTIONS = [
  {
    icon: Target,
    label: 'Financial Calculators',
    desc: 'Time value of money, compound growth, loan amortization, and more quantitative planning tools.',
    href: '/Calculators',
    concept: 'Time Value of Money',
    available: true,
  },
  {
    icon: Shield,
    label: 'Insurance Planning',
    desc: 'Life, health, disability, and auto insurance — calculate the right coverage and stop paying for the wrong kind.',
    href: '/fun/insurance',
    concept: 'Human Life Value',
    available: true,
  },
  {
    icon: Clock,
    label: 'Retirement Planning',
    desc: '401(k), IRA, Roth, pension — understand the accounts, the rules, and the strategy before you need them.',
    href: '/fun/retirement',
    concept: 'Safe Withdrawal Rate',
    available: true,
  },
  {
    icon: Receipt,
    label: 'Tax Planning',
    desc: 'Tax brackets, deductions, Roth vs. traditional accounts, capital gains, and strategies every investor should know.',
    href: '/fun/tax-planning',
    concept: 'Tax Alpha',
    available: true,
  },
  {
    icon: ScrollText,
    label: 'Estate & Wills Planning',
    desc: 'Wills, trusts, beneficiary designations, power of attorney — the documents everyone needs but few people have.',
    href: '/fun/estate',
    concept: 'Probate',
    available: true,
  },
  {
    icon: Home,
    label: 'Major Purchases',
    desc: 'Buying a home, a car, or any major asset — how to evaluate the true cost and make the decision strategically.',
    href: '/fun/major-purchases',
    concept: 'Opportunity Cost',
    available: true,
  },
  {
    icon: Scale,
    label: 'Buy, Rent, or Lease',
    desc: 'The full financial comparison — when buying beats renting, when leasing makes sense, and how to model the decision.',
    href: '/fun/buy-rent-lease',
    concept: 'Total Cost of Ownership',
    available: true,
  },
  {
    icon: Baby,
    label: 'Family Planning',
    desc: 'The financial impact of having children, education savings, life insurance needs, and planning for a growing family.',
    href: '/fun/family-planning',
    concept: 'Human Capital',
    available: true,
  },
]

/* ── Pillar card ────────────────────────────────────────────────────── */
function PillarCard({ pillar, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const Icon = pillar.icon

  return (
    <motion.div
      ref={ref}
      variants={FADE}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      style={{
        background: C.surf,
        border: `1px solid ${C.b1}`,
        borderRadius: 16,
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
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

/* ── Section card ───────────────────────────────────────────────────── */
function SectionCard({ section }) {
  const navigate = useNavigate()
  const Icon = section.icon

  return (
    <button
      onClick={() => navigate(section.href)}
      style={{
        background: C.surf,
        border: `1px solid ${C.b1}`,
        borderRadius: 14,
        padding: '1.375rem',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%',
        transition: 'border-color 0.18s ease, background 0.18s ease, transform 0.18s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = C.goldBdr
        e.currentTarget.style.background = '#271f18'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = C.b1
        e.currentTarget.style.background = C.surf
        e.currentTarget.style.transform = 'none'
      }}
    >
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

/* ── Page ───────────────────────────────────────────────────────────── */
export default function PlanningHub() {
  const navigate = useNavigate()
  const statsRef = useRef(null)
  const compareRef = useRef(null)
  const sectionsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' })
  const compareInView = useInView(compareRef, { once: true, margin: '-80px' })
  const sectionsInView = useInView(sectionsRef, { once: true, margin: '-80px' })

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: UI }}>

      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.b1}`, padding: '0 2.5rem', height: 52, display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 20 }}>
        {/* P hub button */}
        <button
          onClick={() => navigate('/hub')}
          style={{ width: 28, height: 28, background: C.gold, borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          title="All sections"
        >
          <span style={{ fontFamily: DISPLAY, fontSize: '0.875rem', fontWeight: 900, color: C.bg, lineHeight: 1 }}>P</span>
        </button>

        <div style={{ width: 1, height: 18, background: C.b2 }} />

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: UI, fontSize: '0.75rem', color: C.t3, padding: 0 }}>Home</button>
          <ChevronRight size={12} color={C.t3} />
          <span style={{ fontFamily: UI, fontSize: '0.75rem', color: C.t2, fontWeight: 500 }}>Financial Planning</span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {['Markets', 'Wealth', 'Education'].map(s => (
            <button key={s} style={{ background: 'none', border: `1px solid ${C.b2}`, borderRadius: 7, padding: '4px 12px', fontFamily: UI, fontSize: '0.6875rem', color: C.t3, cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.t1; e.currentTarget.style.borderColor = C.goldBdr }}
              onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.borderColor = C.b2 }}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div style={{ padding: '4rem 2.5rem 3rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
            <div style={{ width: 24, height: 1, background: C.gold, opacity: 0.7 }} />
            <span style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold }}>Financial Planning</span>
          </div>

          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)', fontWeight: 700, color: C.t1, lineHeight: 1.08, margin: '0 0 1.5rem', letterSpacing: '-0.02em' }}>
            The discipline that separates<br />those who{' '}
            <em style={{ fontStyle: 'italic', color: C.gold }}>build wealth</em>
            <br />from those who only earn it.
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: 860 }}>
            <p style={{ fontFamily: UI, fontSize: '0.9375rem', color: C.t2, lineHeight: 1.8, margin: 0 }}>
              Financial planning is not about predicting markets or picking winning stocks. It is the disciplined process of aligning your resources — money, time, and risk tolerance — with your actual goals. Without a plan, most people optimize for the short term and sacrifice the long term by default.
            </p>
            <p style={{ fontFamily: UI, fontSize: '0.9375rem', color: C.t2, lineHeight: 1.8, margin: 0 }}>
              Research consistently shows that individuals with a written financial plan accumulate significantly more wealth, carry less financial stress, and retire with greater security than those who rely on intuition and reaction. Planning is not a luxury for the wealthy — it is how wealth is created.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Statistics strip ──────────────────────────────────────────── */}
      <div ref={statsRef} style={{ borderTop: `1px solid ${C.b1}`, borderBottom: `1px solid ${C.b1}`, background: C.surf }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {STATS.map((s, i) => (
            <motion.div
              key={s.value}
              variants={FADE}
              initial="hidden"
              animate={statsInView ? 'show' : 'hidden'}
              transition={{ delay: i * 0.08 }}
              style={{
                padding: '1.875rem 1.5rem',
                borderRight: i < 3 ? `1px solid ${C.b1}` : 'none',
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 'clamp(1.75rem, 2.5vw, 2.5rem)', fontWeight: 700, color: C.gold, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontFamily: UI, fontSize: '0.8125rem', color: C.t2, lineHeight: 1.55, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: UI, fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.t3 }}>Source: {s.source}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Why planning matters — 3 pillars ─────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3.5rem 2.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.t3, marginBottom: 8 }}>Why it matters</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: C.t1, margin: 0, letterSpacing: '-0.02em' }}>
            Three forces that reward<em style={{ fontStyle: 'italic', color: C.gold }}> every </em>planner
          </h2>
        </div>

        <motion.div
          variants={STAGGER}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}
        >
          {PILLARS.map((p, i) => <PillarCard key={p.title} pillar={p} index={i} />)}
        </motion.div>
      </div>

      {/* ── Planning vs. No Planning ──────────────────────────────────── */}
      <div ref={compareRef} style={{ borderTop: `1px solid ${C.b1}`, background: C.surf }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3.5rem 2.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.t3, marginBottom: 8 }}>The difference</div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: C.t1, margin: 0, letterSpacing: '-0.02em' }}>
              With a plan vs. without one
            </h2>
          </div>

          <motion.div
            variants={STAGGER}
            initial="hidden"
            animate={compareInView ? 'show' : 'hidden'}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}
          >
            {/* With plan */}
            <motion.div variants={FADE} style={{ background: C.raise, border: `1px solid ${C.b1}`, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.375rem', borderBottom: `1px solid ${C.b1}`, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(74,124,89,0.06)' }}>
                <CheckCircle2 size={14} color={C.up} />
                <span style={{ fontFamily: UI, fontSize: '0.8125rem', fontWeight: 700, color: C.t1 }}>With a financial plan</span>
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

            {/* Without plan */}
            <motion.div variants={FADE} style={{ background: C.raise, border: `1px solid ${C.b1}`, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.375rem', borderBottom: `1px solid ${C.b1}`, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(192,57,43,0.06)' }}>
                <XCircle size={14} color='#c0392b' />
                <span style={{ fontFamily: UI, fontSize: '0.8125rem', fontWeight: 700, color: C.t1 }}>Without a financial plan</span>
              </div>
              <div style={{ padding: '0.75rem 0' }}>
                {COMPARE.without.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '0.625rem 1.375rem', borderBottom: i < COMPARE.without.length - 1 ? `1px solid ${C.b1}` : 'none' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#c0392b', marginTop: 6, flexShrink: 0 }} />
                    <span style={{ fontFamily: UI, fontSize: '0.8125rem', color: C.t2, lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Pull quote */}
          <div style={{ marginTop: '2rem', padding: '1.5rem 2rem', background: C.bg, border: `1px solid ${C.b1}`, borderLeft: `3px solid ${C.gold}`, borderRadius: '0 12px 12px 0' }}>
            <p style={{ fontFamily: DISPLAY, fontSize: '1.0625rem', fontStyle: 'italic', color: C.t1, margin: '0 0 0.5rem', lineHeight: 1.6 }}>
              "Someone is sitting in the shade today because someone planted a tree a long time ago."
            </p>
            <span style={{ fontFamily: UI, fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.t3 }}>Warren Buffett</span>
          </div>
        </div>
      </div>

      {/* ── Section grid ─────────────────────────────────────────────── */}
      <div ref={sectionsRef} style={{ maxWidth: 1100, margin: '0 auto', padding: '3.5rem 2.5rem 5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.t3, marginBottom: 8 }}>Explore planning</div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: C.t1, margin: 0, letterSpacing: '-0.02em' }}>
              Eight planning disciplines,<em style={{ fontStyle: 'italic', color: C.gold }}> one ecosystem</em>
            </h2>
          </div>
          <p style={{ fontFamily: UI, fontSize: '0.8125rem', color: C.t3, maxWidth: 340, lineHeight: 1.65, margin: 0 }}>
            Each section combines education, tools, and calculators. Start anywhere — every discipline connects to the others.
          </p>
        </div>

        <motion.div
          variants={STAGGER}
          initial="hidden"
          animate={sectionsInView ? 'show' : 'hidden'}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}
        >
          {SECTIONS.map(s => (
            <motion.div key={s.label} variants={FADE}>
              <SectionCard section={s} />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom nav hint */}
        <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: C.gold, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: DISPLAY, fontSize: '0.875rem', fontWeight: 900, color: C.bg, lineHeight: 1 }}>P</span>
          </div>
          <span style={{ fontFamily: UI, fontSize: '0.8125rem', color: C.t3 }}>
            Press the <strong style={{ color: C.t2 }}>P</strong> in the corner at any time to return to all sections.
          </span>
        </div>
      </div>

    </div>
  )
}
