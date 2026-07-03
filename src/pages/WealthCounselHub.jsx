import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  ChevronRight, ArrowUpRight, CheckCircle2, XCircle,
  Shield, Users, Search,
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
  teal:    '#00B4C6',
  tealDim: 'rgba(0,180,198,0.08)',
  tealBdr: 'rgba(0,180,198,0.20)',
  t1:      '#f0e8d8',
  t2:      '#a89070',
  t3:      '#6b5540',
  up:      '#4a7c59',
  upDim:   'rgba(74,124,89,0.15)',
}

const FADE    = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }
const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

const STATS = [
  { value: '$350K',  label: 'average wealth gap between those with a fiduciary advisor and those without', source: 'Vanguard' },
  { value: '3%',     label: 'annual return added by a good advisor through behavioral coaching alone', source: 'Vanguard Advisor\'s Alpha' },
  { value: '74%',    label: 'of Americans lack access to a fee-only fiduciary — Wealth Counsel closes that gap', source: 'NAPFA' },
  { value: '$0',     label: 'to browse and compare verified CFP professionals on Wealth Counsel', source: 'Planora' },
]

const PILLARS = [
  {
    icon: Shield,
    title: 'Verified Credentials, Not Sales Pitches',
    body: 'Anyone can call themselves a financial advisor. A CFP, CFA, or JD with fiduciary duty is something different — a professional legally required to act in your interest, not their commission structure. Every advisor on Wealth Counsel carries verified credentials, disclosed compensation models, and a clear specialization so you know exactly who you are talking to before the first conversation.',
    stat: 'Fiduciary advisors produce 3% more annual return on average vs. commission-based brokers',
  },
  {
    icon: Search,
    title: 'Matched to Your Goals, Not a Zip Code',
    body: 'Most people find a financial advisor the same way they find a dentist — whoever is nearby. Wealth Counsel matches you by what actually matters: your financial stage, specific goals, risk profile, and the life events driving your decisions. Whether you are planning a business exit, navigating a divorce, or building a retirement strategy at 35, the right advisor specialization changes everything.',
    stat: '67% of clients who leave advisors cite misaligned expectations as the reason',
  },
  {
    icon: Users,
    title: 'Fee Transparency Before You Commit',
    body: 'Hidden fees are the silent tax on wealth. The difference between a 1% AUM fee and a flat annual retainer can cost hundreds of thousands of dollars compounded over a career. Every Wealth Counsel profile shows compensation structure upfront — fee-only, AUM-based, or hourly — so you understand the incentive structure before you ever schedule a call. No surprises.',
    stat: '1% AUM fee on a $500K portfolio costs $147K over 10 years in lost compounding',
  },
]

const COMPARE = {
  with: [
    'Verified CFP, CFA, or JD credentials confirmed before you browse',
    'Advisor specialization matched to your specific financial goals',
    'Full fee structure disclosed: flat, AUM, or hourly — no hidden costs',
    'Behavioral coaching that prevents costly emotional decisions',
    'Fiduciary duty: advisor legally required to act in your interest',
    'Access to strategies previously reserved for ultra-high-net-worth clients',
  ],
  without: [
    'Credential claims taken at face value — no verification process',
    'Generalist advisor assigned based on geography, not fit',
    'Commission structure buried in disclosures most clients never read',
    'No accountability when recommendations follow the advisor\'s incentives',
    'Suitability standard: advice only needs to be "suitable," not optimal',
    'Institutional strategies remain inaccessible to most households',
  ],
}

/* ── Top bar ──────────────────────────────────────────────────────── */
function TopBar() {
  const navigate = useNavigate()
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(26,20,16,0.94)', backdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${C.b1}`,
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '0 2.5rem', height: 52,
    }}>
      <button
        onClick={() => navigate('/')}
        style={{
          width: 30, height: 30, borderRadius: 8,
          background: C.teal, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
          boxShadow: '0 0 12px rgba(0,180,198,0.25)',
        }}
        title="Hub"
      >
        <span style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 900, color: C.bg, lineHeight: 1 }}>P</span>
      </button>

      <ChevronRight size={13} color={C.t3} style={{ flexShrink: 0 }} />
      <span style={{ fontFamily: UI, fontSize: 13, color: C.t2 }}>Wealth Counsel</span>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', gap: 8 }}>
        {['Terminal', 'Markets', 'Planning'].map(s => (
          <button
            key={s}
            onClick={() => navigate(s === 'Terminal' ? '/terminal-hub' : `/${s.toLowerCase()}`)}
            style={{
              background: 'none', border: `1px solid ${C.b2}`, borderRadius: 7,
              padding: '4px 12px', fontFamily: UI, fontSize: '0.6875rem', color: C.t3, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.t1; e.currentTarget.style.borderColor = C.tealBdr }}
            onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.borderColor = C.b2 }}
          >{s}</button>
        ))}
      </div>

      <button
        onClick={() => navigate('/wealth-counsel')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: C.teal, border: 'none',
          borderRadius: 8, padding: '7px 16px',
          cursor: 'pointer', color: C.bg,
          fontFamily: UI, fontSize: 12, fontWeight: 700,
        }}
      >
        Browse Advisors <ArrowUpRight size={12} />
      </button>
    </div>
  )
}

/* ── Hero ─────────────────────────────────────────────────────────── */
function Hero() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true })
  const navigate = useNavigate()

  const advisor = {
    name: 'Sarah Chen, CFP CFA',
    title: 'Wealth Strategist',
    firm: 'Meridian Private Wealth',
    fee: 'Fee-only · $5,000/yr flat',
    specialties: ['Retirement Income', 'Tax Planning', 'Estate Strategy'],
    rating: '4.9',
    clients: '34 clients',
    years: '12 yrs exp.',
  }

  return (
    <section ref={ref} style={{ background: C.bg, padding: '80px 2.5rem 64px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '55%', height: '70%', background: 'radial-gradient(ellipse at top left, rgba(0,180,198,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40%', height: '60%', background: 'radial-gradient(ellipse at bottom right, rgba(0,180,198,0.03) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <motion.div variants={STAGGER} initial="hidden" animate={inView ? 'show' : 'hidden'}>

          <motion.div variants={FADE} style={{ marginBottom: 24 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: C.tealDim, border: `1px solid ${C.tealBdr}`,
              borderRadius: 100, padding: '4px 14px',
              fontFamily: UI, fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.18em', color: C.teal,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.teal, display: 'inline-block' }} />
              Wealth Counsel — Advisor Marketplace
            </span>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }} className="wc-hero-grid">
            <div>
              <motion.h1 variants={FADE} style={{
                fontFamily: DISPLAY, fontSize: 'clamp(36px,4vw,58px)',
                fontWeight: 700, color: C.t1, lineHeight: 1.08,
                letterSpacing: '-0.02em', margin: '0 0 20px',
              }}>
                The right advisor,
                <em style={{ display: 'block', color: C.teal, fontStyle: 'italic' }}>verified and matched.</em>
              </motion.h1>

              <motion.p variants={FADE} style={{ fontFamily: UI, fontSize: 15, color: C.t2, lineHeight: 1.75, maxWidth: 460, margin: '0 0 32px' }}>
                Browse verified CFP professionals matched to your goals — transparent fees, confirmed fiduciary status, and specializations aligned to where you actually are in life. No cold calls. No hidden commissions.
              </motion.p>

              <motion.div variants={FADE} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/wealth-counsel')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: C.teal, border: 'none', borderRadius: 10,
                    padding: '13px 24px', cursor: 'pointer',
                    fontFamily: UI, fontSize: 13, fontWeight: 700, color: C.bg,
                    boxShadow: '0 4px 20px rgba(0,180,198,0.25)',
                  }}
                >
                  Browse Advisors <ArrowUpRight size={14} />
                </button>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'transparent', border: `1px solid ${C.b2}`,
                    borderRadius: 10, padding: '12px 22px', cursor: 'pointer',
                    fontFamily: UI, fontSize: 13, fontWeight: 600, color: C.t2,
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.tealBdr; e.currentTarget.style.color = C.t1 }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.b2; e.currentTarget.style.color = C.t2 }}
                >
                  Back to Planora
                </button>
              </motion.div>
            </div>

            {/* Right — sample advisor profile card */}
            <motion.div variants={FADE} style={{
              background: C.surf, border: `1px solid ${C.b2}`,
              borderRadius: 18, overflow: 'hidden',
              boxShadow: '0 24px 56px rgba(0,0,0,0.4)',
            }}>
              {/* Card header */}
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.b1}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: UI, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: C.t3 }}>Advisor Profile</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.tealDim, border: `1px solid ${C.tealBdr}`, borderRadius: 100, padding: '3px 10px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.teal, display: 'inline-block' }} />
                  <span style={{ fontFamily: UI, fontSize: 10, color: C.teal, fontWeight: 600 }}>VERIFIED CFP</span>
                </div>
              </div>

              {/* Advisor info */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'rgba(0,180,198,0.12)', border: `1px solid ${C.tealBdr}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: C.teal,
                  }}>SC</div>
                  <div>
                    <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: C.t1, marginBottom: 3 }}>{advisor.name}</div>
                    <div style={{ fontFamily: UI, fontSize: 12, color: C.t2 }}>{advisor.title} · {advisor.firm}</div>
                  </div>
                </div>

                {/* Fee badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(74,124,89,0.1)', border: '1px solid rgba(74,124,89,0.22)', borderRadius: 6, padding: '4px 10px', marginBottom: 14 }}>
                  <span style={{ fontFamily: UI, fontSize: 11, color: '#4a7c59', fontWeight: 600 }}>{advisor.fee}</span>
                </div>

                {/* Specialties */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {advisor.specialties.map(s => (
                    <span key={s} style={{
                      fontFamily: UI, fontSize: 10, color: C.teal, fontWeight: 600,
                      background: C.tealDim, border: `1px solid ${C.tealBdr}`,
                      borderRadius: 5, padding: '3px 8px',
                    }}>{s}</span>
                  ))}
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 0, borderTop: `1px solid ${C.b1}`, paddingTop: 14 }}>
                  {[
                    { label: 'Rating', value: advisor.rating },
                    { label: 'Clients', value: advisor.clients },
                    { label: 'Experience', value: advisor.years },
                  ].map((s, i) => (
                    <div key={s.label} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? `1px solid ${C.b1}` : 'none', padding: '0 8px' }}>
                      <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.t1, marginBottom: 2 }}>{s.value}</div>
                      <div style={{ fontFamily: UI, fontSize: 10, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.b1}`, background: C.raise, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: UI, fontSize: 11, color: C.t3, fontStyle: 'italic' }}>1 of 40+ verified advisors</span>
                <button onClick={() => navigate('/WealthCounsel')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: UI, fontSize: 11, color: C.teal, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                  Browse all <ArrowUpRight size={11} />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style>{`@media(max-width:768px){.wc-hero-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  )
}

/* ── Stats strip ──────────────────────────────────────────────────── */
function StatsStrip() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <section ref={ref} style={{ background: C.surf, borderTop: `1px solid ${C.b1}`, borderBottom: `1px solid ${C.b1}` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2.5rem', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }} className="wc-stats-grid">
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, ease: EASE, delay: i * 0.08 }}
            style={{
              padding: '32px 24px',
              borderRight: i < 3 ? `1px solid ${C.b1}` : 'none',
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 'clamp(22px,2.5vw,30px)', fontWeight: 700, color: C.teal, marginBottom: 8, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontFamily: UI, fontSize: 12.5, color: C.t2, lineHeight: 1.55, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: UI, fontSize: 10, color: C.t3, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{s.source}</div>
          </motion.div>
        ))}
      </div>
      <style>{`@media(max-width:700px){.wc-stats-grid{grid-template-columns:1fr 1fr!important}}`}</style>
    </section>
  )
}

/* ── Pillars ──────────────────────────────────────────────────────── */
function Pillars() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} style={{ background: C.bg, padding: '80px 2.5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ marginBottom: 56 }}
        >
          <div style={{ fontFamily: UI, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: C.t3, fontWeight: 600, marginBottom: 12 }}>Why it matters</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(26px,3vw,40px)', fontWeight: 700, color: C.t1, margin: 0, letterSpacing: '-0.02em', maxWidth: 520, lineHeight: 1.15 }}>
            What a fiduciary advisor actually changes.
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }} className="wc-pillars-grid">
          {PILLARS.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
                style={{ background: C.surf, border: `1px solid ${C.b1}`, borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 11, background: C.tealDim, border: `1px solid ${C.tealBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={C.teal} />
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 700, color: C.t1, margin: 0, lineHeight: 1.25 }}>{p.title}</h3>
                <p style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.75, margin: 0 }}>{p.body}</p>
                <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${C.b1}` }}>
                  <span style={{ fontFamily: UI, fontSize: 11.5, color: C.teal, fontStyle: 'italic', lineHeight: 1.5 }}>{p.stat}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
      <style>{`@media(max-width:800px){.wc-pillars-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  )
}

/* ── Compare ──────────────────────────────────────────────────────── */
function Compare() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} style={{ background: C.surf, borderTop: `1px solid ${C.b1}`, borderBottom: `1px solid ${C.b1}`, padding: '80px 2.5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ marginBottom: 48, textAlign: 'center' }}
        >
          <div style={{ fontFamily: UI, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: C.t3, fontWeight: 600, marginBottom: 12 }}>The difference</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(26px,3vw,38px)', fontWeight: 700, color: C.t1, margin: 0, letterSpacing: '-0.02em' }}>
            With Wealth Counsel vs. without.
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="wc-compare-grid">
          {/* With */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
            style={{ background: 'rgba(0,180,198,0.04)', border: `1px solid ${C.tealBdr}`, borderRadius: 16, padding: '28px 24px' }}
          >
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: C.teal, marginBottom: 20 }}>With Wealth Counsel</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {COMPARE.with.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <CheckCircle2 size={15} color={C.teal} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontFamily: UI, fontSize: 13, color: C.t2, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Without */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, ease: EASE, delay: 0.15 }}
            style={{ background: C.raise, border: `1px solid ${C.b2}`, borderRadius: 16, padding: '28px 24px' }}
          >
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: C.t3, marginBottom: 20 }}>Without</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {COMPARE.without.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <XCircle size={15} color={C.t3} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontFamily: UI, fontSize: 13, color: C.t3, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`@media(max-width:700px){.wc-compare-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  )
}

/* ── Pull quote ───────────────────────────────────────────────────── */
function Quote() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <section ref={ref} style={{ background: C.bg, padding: '72px 2.5rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div style={{ fontFamily: UI, fontSize: 13, color: C.t3, marginBottom: 24, letterSpacing: '0.08em' }}>— John Bogle, Founder of Vanguard</div>
          <blockquote style={{
            fontFamily: DISPLAY, fontSize: 'clamp(20px,2.5vw,30px)',
            fontWeight: 700, color: C.t1, lineHeight: 1.4,
            margin: 0, letterSpacing: '-0.01em',
          }}>
            "If you have trouble imagining a 20% loss in the stock market, you shouldn't be in the stock market. A good advisor helps you find exactly where you belong."
          </blockquote>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Browse CTA ───────────────────────────────────────────────────── */
function BrowseCTA() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const navigate = useNavigate()

  return (
    <section ref={ref} style={{ background: C.surf, borderTop: `1px solid ${C.b1}`, padding: '80px 2.5rem' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <div style={{ fontFamily: UI, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: C.t3, fontWeight: 600, marginBottom: 16 }}>Ready to find your advisor?</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(26px,3vw,38px)', fontWeight: 700, color: C.t1, margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Browse the Wealth Counsel marketplace.
          </h2>
          <p style={{ fontFamily: UI, fontSize: 14, color: C.t2, lineHeight: 1.7, margin: '0 0 36px' }}>
            Filter by specialization, fee structure, and credentials. Every advisor is verified before they appear on the platform.
          </p>
          <button
            onClick={() => navigate('/wealth-counsel')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: C.teal, border: 'none', borderRadius: 12,
              padding: '16px 32px', cursor: 'pointer',
              fontFamily: UI, fontSize: 15, fontWeight: 700, color: C.bg,
              boxShadow: '0 6px 28px rgba(0,180,198,0.28)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,180,198,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,180,198,0.28)'; e.currentTarget.style.transform = 'none' }}
          >
            Browse Advisors <ArrowUpRight size={16} />
          </button>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default function WealthCounselHub() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <TopBar />
      <Hero />
      <StatsStrip />
      <Pillars />
      <Compare />
      <Quote />
      <BrowseCTA />
    </div>
  )
}
