import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  BookOpen, Wallet, CreditCard, TrendingUp, Shield, FileText,
  Clock, Home, Calendar, ArrowUpRight, ChevronRight, BarChart2,
  Lightbulb, Target, Users, CheckCircle2, XCircle, GraduationCap, Scale, PieChart,
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
  teal:    '#00B4C6',
  tealDim: 'rgba(0,180,198,0.08)',
  tealBdr: 'rgba(0,180,198,0.22)',
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
  { value: '66%',   label: 'Of Americans are considered financially illiterate by standard assessment', source: 'TIAA Institute' },
  { value: '+25%',  label: 'More savings by individuals who completed financial education programs',     source: 'CFPB' },
  { value: '$50k',  label: 'Additional wealth at retirement for those with high financial literacy',    source: 'Lusardi & Mitchell' },
  { value: '44%',   label: 'Of Americans cannot cover a $400 emergency without borrowing',            source: 'Federal Reserve' },
]

const PILLARS = [
  {
    icon: Lightbulb,
    title: 'Knowledge Compounds Like Capital',
    body: 'Financial literacy is not a one-time event — it is a compounding asset. Understanding how compound interest works changes how you save. Understanding tax-advantaged accounts changes where you invest. Understanding insurance changes how you protect what you build. Each concept learned unlocks the next level of financial decision-making.',
    stat: 'Financial literacy increases retirement wealth by avg. $50,000',
  },
  {
    icon: Target,
    title: 'The Cost of Ignorance Is Measurable',
    body: 'People without financial literacy pay an average of 1.8% more in loan interest rates (they do not compare effectively), lose 2.5% annually to avoidable investment taxes (they do not know about asset location), and retire with 40% less wealth. These are not abstract statistics — they are the quantified cost of not learning.',
    stat: '$82,000 lost over 30 years from avoidable 1.8% interest premium',
  },
  {
    icon: Users,
    title: 'Education Changes Behavior, Not Just Understanding',
    body: 'Most financial education fails because it delivers information without context. Understanding what a Roth IRA is does not matter unless you understand why it is powerful for your specific situation. The FUN platform is built around application — every concept comes with a calculator, a comparison, and a concrete action step.',
    stat: 'Applied education 4× more effective than conceptual-only',
  },
]

const COMPARE = {
  with: [
    'Understands the difference between good debt and bad debt',
    'Knows which retirement accounts to fund first and why',
    'Can read a loan offer and identify the true cost',
    'Uses insurance as a precise risk tool, not a checkbox',
    'Credit score managed strategically, not reactively',
    'Every major financial decision made with a framework',
  ],
  without: [
    'Carries high-interest debt while investing in a taxable account',
    'Misses employer match — leaves guaranteed 100% returns on the table',
    'Accepts the first loan offer without understanding APR impact',
    'Over-insured on some risks, completely exposed on others',
    'Credit managed by hope — damaged by avoidable mistakes',
    'Major decisions made by copying peers or following ads',
  ],
}

const SECTIONS = [
  {
    icon: Wallet,
    label: 'Budgeting & Foundations',
    desc: '50/30/20 rule, cash flow management, expense tracking, and the savings systems that everything else is built on.',
    href: '/fun/budgeting',
    concept: '50/30/20 Rule',
    accent: C.teal, accentDim: C.tealDim, accentBdr: C.tealBdr,
  },
  {
    icon: CreditCard,
    label: 'Debt & Credit',
    desc: 'Credit scores, debt payoff strategies (avalanche vs. snowball), and how to use credit as a tool instead of a trap.',
    href: '/fun/debt-credit',
    concept: 'Debt Avalanche',
    accent: C.teal, accentDim: C.tealDim, accentBdr: C.tealBdr,
  },
  {
    icon: TrendingUp,
    label: 'Investing & Accounts',
    desc: 'Index funds, ETFs, diversification, dollar-cost averaging — the investing principles that actually build long-term wealth.',
    href: '/fun/investing',
    concept: 'Dollar-Cost Averaging',
    accent: C.teal, accentDim: C.tealDim, accentBdr: C.tealBdr,
  },
  {
    icon: PieChart,
    label: 'Portfolio Structure',
    desc: 'Asset allocation, rebalancing, diversification across asset classes — how to build and maintain a resilient portfolio.',
    href: '/fun/portfolio',
    concept: 'Asset Allocation',
    accent: C.teal, accentDim: C.tealDim, accentBdr: C.tealBdr,
  },
  {
    icon: Calendar,
    label: 'Life Events',
    desc: 'Marriage, children, divorce, job loss, inheritance — how major life changes affect your financial plan and what to do.',
    href: '/fun/life-events',
    concept: 'Financial Trigger Event',
    accent: C.teal, accentDim: C.tealDim, accentBdr: C.tealBdr,
  },
  {
    icon: BookOpen,
    label: 'Resource Directory',
    desc: 'Curated books, tools, calculators, and institutions — the trusted resources for every stage of the financial journey.',
    href: '/fun/resources',
    concept: 'Financial Literacy',
    accent: C.teal, accentDim: C.tealDim, accentBdr: C.tealBdr,
  },
  {
    icon: GraduationCap,
    label: "Learner's Library",
    desc: 'Structured chapters, readings, and quizzes across every financial topic — track your progress and build lasting knowledge.',
    href: '/fun/learners-library',
    concept: 'Financial Literacy',
    accent: C.teal, accentDim: C.tealDim, accentBdr: C.tealBdr,
  },
]

function PillarCard({ pillar }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const Icon = pillar.icon
  return (
    <motion.div ref={ref} variants={FADE} initial="hidden" animate={inView ? 'show' : 'hidden'}
      style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 16, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.teal} 0%, transparent 60%)` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.tealDim, border: `1px solid ${C.tealBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={C.teal} />
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: '1rem', fontWeight: 700, color: C.t1 }}>{pillar.title}</div>
      </div>
      <p style={{ fontFamily: UI, fontSize: '0.875rem', color: C.t2, lineHeight: 1.75, margin: 0 }}>{pillar.body}</p>
      <div style={{ background: C.raise, border: `1px solid ${C.b2}`, borderRadius: 8, padding: '0.5rem 0.875rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <BarChart2 size={11} color={C.teal} />
        <span style={{ fontFamily: MONO, fontSize: '0.6875rem', color: C.teal, fontWeight: 600 }}>{pillar.stat}</span>
      </div>
    </motion.div>
  )
}

function SectionCard({ section }) {
  const navigate = useNavigate()
  const Icon = section.icon
  const acc = section.accent
  const accDim = section.accentDim
  const accBdr = section.accentBdr
  return (
    <button onClick={() => navigate(section.href)}
      style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '1.375rem', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', transition: 'all 0.18s ease' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accBdr; e.currentTarget.style.background = '#1e2318'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.b1; e.currentTarget.style.background = C.surf; e.currentTarget.style.transform = 'none' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: accDim, border: `1px solid ${accBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={14} color={acc} />
        </div>
        <ArrowUpRight size={13} color={C.t3} />
      </div>
      <div>
        <div style={{ fontFamily: UI, fontSize: '0.9375rem', fontWeight: 600, color: C.t1, marginBottom: 4 }}>{section.label}</div>
        <div style={{ fontFamily: UI, fontSize: '0.8125rem', color: C.t2, lineHeight: 1.6 }}>{section.desc}</div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.t3 }}>Core Concept</div>
        <div style={{ fontFamily: MONO, fontSize: '0.625rem', color: acc, background: accDim, border: `1px solid ${accBdr}`, borderRadius: 4, padding: '1px 6px' }}>{section.concept}</div>
      </div>
    </button>
  )
}

export default function EducationHub() {
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
          <span style={{ fontFamily: UI, fontSize: '0.75rem', color: C.teal, fontWeight: 500 }}>Financial Education</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {['Planning', 'Markets', 'Wealth'].map(s => (
            <button key={s} onClick={() => navigate(`/${s.toLowerCase()}`)} style={{ background: 'none', border: `1px solid ${C.b2}`, borderRadius: 7, padding: '4px 12px', fontFamily: UI, fontSize: '0.6875rem', color: C.t3, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.t1; e.currentTarget.style.borderColor = C.tealBdr }}
              onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.borderColor = C.b2 }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '4rem 2.5rem 3rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
            <div style={{ width: 24, height: 1, background: C.teal, opacity: 0.7 }} />
            <span style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.teal }}>Financial Understanding Network</span>
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)', fontWeight: 700, color: C.t1, lineHeight: 1.08, margin: '0 0 1.5rem', letterSpacing: '-0.02em' }}>
            The most expensive education<br />is the one you<em style={{ fontStyle: 'italic', color: C.teal }}> skip.</em>
          </h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: 860 }}>
            <p style={{ fontFamily: UI, fontSize: '0.9375rem', color: C.t2, lineHeight: 1.8, margin: 0 }}>
              Financial illiteracy is not a moral failure — it is a gap in a system that never prioritized teaching people how money actually works. Two-thirds of Americans cannot pass a basic financial literacy test. The cost of that gap is measured in higher interest rates, missed tax advantages, and undersized retirement accounts.
            </p>
            <p style={{ fontFamily: UI, fontSize: '0.9375rem', color: C.t2, lineHeight: 1.8, margin: 0 }}>
              FUN is built on the belief that financial education works best when it is practical, specific, and directly connected to action. Every module combines the concept you need to understand with the calculator to apply it and the framework to make better decisions starting today.
            </p>
          </div>
        </motion.div>
      </div>

      <div ref={statsRef} style={{ borderTop: `1px solid ${C.b1}`, borderBottom: `1px solid ${C.b1}`, background: C.surf }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {STATS.map((s, i) => (
            <motion.div key={i} variants={FADE} initial="hidden" animate={statsInView ? 'show' : 'hidden'} transition={{ delay: i * 0.08 }}
              style={{ padding: '1.875rem 1.5rem', borderRight: i < 3 ? `1px solid ${C.b1}` : 'none' }}>
              <div style={{ fontFamily: MONO, fontSize: 'clamp(1.75rem, 2.5vw, 2.5rem)', fontWeight: 700, color: C.teal, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
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
            Three reasons<em style={{ fontStyle: 'italic', color: C.teal }}> financial education pays</em> more than any stock
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
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: C.t1, margin: 0, letterSpacing: '-0.02em' }}>Financially literate vs. financially guessing</h2>
          </div>
          <motion.div variants={STAGGER} initial="hidden" animate={compareInView ? 'show' : 'hidden'} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <motion.div variants={FADE} style={{ background: C.raise, border: `1px solid ${C.b1}`, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.375rem', borderBottom: `1px solid ${C.b1}`, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(74,124,89,0.06)' }}>
                <CheckCircle2 size={14} color={C.up} />
                <span style={{ fontFamily: UI, fontSize: '0.8125rem', fontWeight: 700, color: C.t1 }}>Financially literate</span>
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
                <span style={{ fontFamily: UI, fontSize: '0.8125rem', fontWeight: 700, color: C.t1 }}>Financially guessing</span>
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
          <div style={{ marginTop: '2rem', padding: '1.5rem 2rem', background: C.bg, border: `1px solid ${C.b1}`, borderLeft: `3px solid ${C.teal}`, borderRadius: '0 12px 12px 0' }}>
            <p style={{ fontFamily: DISPLAY, fontSize: '1.0625rem', fontStyle: 'italic', color: C.t1, margin: '0 0 0.5rem', lineHeight: 1.6 }}>"An investment in knowledge pays the best interest."</p>
            <span style={{ fontFamily: UI, fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.t3 }}>Benjamin Franklin</span>
          </div>
        </div>
      </div>

      <div ref={sectionsRef} style={{ maxWidth: 1100, margin: '0 auto', padding: '3.5rem 2.5rem 5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: UI, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.t3, marginBottom: 8 }}>Explore FUN</div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700, color: C.t1, margin: 0, letterSpacing: '-0.02em' }}>
              Seven modules.<em style={{ fontStyle: 'italic', color: C.teal }}> Every concept you need.</em>
            </h2>
          </div>
          <p style={{ fontFamily: UI, fontSize: '0.8125rem', color: C.t3, maxWidth: 340, lineHeight: 1.65, margin: 0 }}>Each module combines education, interactive calculators, and practical frameworks. Start anywhere.</p>
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
