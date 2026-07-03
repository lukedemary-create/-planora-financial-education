// ─────────────────────────────────────────────────────────────────────────────
// Hub.jsx — Planora Terminal · Command Center
// Arche warm-dark design · Playfair Display · Inter · #c9a96e warm gold
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  TrendingUp, CalendarDays, BarChart2, Sparkles, Brain,
  LayoutDashboard, MonitorDot, History, PieChart,
  Newspaper, Zap, Users, ShoppingCart, Home, ShieldAlert, Star,
  Eye, Landmark, Wallet, LineChart, Calculator, GraduationCap,
  HeartPulse, BookUser, BookOpen, Target, Receipt, ShieldCheck,
  ArrowRight, ChevronDown, Activity, Shield, Clock, ScrollText, Scale, Baby,
} from 'lucide-react';

const DISPLAY = "'Playfair Display', Georgia, serif";
const UI      = "'Inter', system-ui, sans-serif";
const MONO    = "'JetBrains Mono', 'Courier New', monospace";
const EASE    = [0.32, 0.72, 0, 1];

const C = {
  bg:      "#1a1410",
  surface: "#231c16",
  raised:  "#2d2419",
  b1:      "#2a2018",
  b2:      "#3d3028",
  gold:    "#c9a96e",
  goldDim: "rgba(201,169,110,0.08)",
  goldBdr: "rgba(201,169,110,0.20)",
  t1:      "#f0e8d8",
  t2:      "#a89070",
  t3:      "#6b5540",
  success: "#4a7c59",
};

// ── Section definitions ───────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'planning',
    label: 'Financial Planning',
    icon: Wallet,
    description: 'Your complete personal finance toolkit — budgeting, net worth, retirement projections, tax strategy, and life-stage planning.',
    concept: 'Financial Planning',
    definition: 'A structured process for aligning your current financial resources with long-term goals. True planning accounts for taxes, inflation, risk tolerance, and time horizon simultaneously.',
    insight: 'The difference between a $1M and $2M retirement isn\'t income — it\'s the compounded effect of consistent contributions, tax efficiency, and avoiding behavioral mistakes.',
    href: '/planning',
    items: [
      { label: 'Financial Calculators',  path: '/Calculators',        icon: Calculator,  desc: 'TVM, compound growth, and financial calculators' },
      { label: 'Insurance Planning',     path: '/fun/insurance',       icon: Shield,      desc: 'Life, health, disability coverage analysis' },
      { label: 'Retirement Planning',    path: '/fun/retirement',      icon: Clock,       desc: '401(k), IRA, Roth, pension strategy' },
      { label: 'Tax Planning',           path: '/fun/tax-planning',    icon: Receipt,     desc: 'Tax brackets, Roth vs. traditional, capital gains' },
      { label: 'Estate & Wills',         path: '/fun/estate',          icon: ScrollText,  desc: 'Wills, trusts, beneficiary designations' },
      { label: 'Major Purchases',        path: '/fun/major-purchases', icon: Home,        desc: 'Home buying, car, mortgage affordability' },
      { label: 'Buy, Rent, or Lease',    path: '/fun/buy-rent-lease',  icon: Scale,       desc: 'Full financial comparison for housing decisions' },
      { label: 'Family Planning',        path: '/fun/family-planning', icon: Baby,        desc: 'Children, education savings, life insurance needs' },
    ],
  },
  {
    id: 'markets',
    label: 'Markets & Intelligence',
    icon: TrendingUp,
    description: 'Live indices, sector heat maps, top movers, market news, and terminal-grade data — Bloomberg quality.',
    concept: 'Market Index',
    definition: 'A statistical measure tracking the performance of a selected group of securities. Major indices like the S&P 500 serve as benchmarks against which all portfolios are compared.',
    insight: 'Understanding what drives index moves — earnings, Fed policy, sentiment — is the foundation of intelligent investing.',
    href: '/markets',
    items: [
      { label: 'Market Overview',       path: '/dashboard',       icon: BarChart2,       desc: 'Live indices, major benchmarks, daily market pulse' },
      { label: 'Market History',        path: '/MarketHistory',   icon: History,         desc: 'Long-term historical performance and cyclical patterns' },
      { label: 'Terminal',              path: '/terminal',        icon: MonitorDot,      desc: 'Bloomberg-style institutional data terminal' },
      { label: 'Political Intelligence',path: '/PoliticsEconomy', icon: Landmark,        desc: 'Policy analysis, geopolitical risk, and market nexus' },
    ],
  },
  {
    id: 'wealth',
    label: 'Wealth & Investing',
    icon: BarChart2,
    description: 'Risk analysis, portfolio research, market breadth, insider flows, and investment tools — all connected.',
    concept: 'Risk-Adjusted Return',
    definition: 'The process of quantifying the probability and magnitude of potential losses. Institutions use tools like Monte Carlo simulation and Value at Risk to stress-test portfolios before markets move.',
    insight: 'Most retail investors manage return but not risk. Understanding beta, drawdown, and correlation is what separates disciplined investors from speculators.',
    href: '/wealth',
    items: [
      { label: 'Risk Analysis',        path: '/RiskAnalysis',   icon: ShieldAlert, desc: 'Portfolio stress-testing, risk profiling, drawdown scenarios' },
      { label: 'Brokerage Guide',      path: '/brokerage-guide',icon: BookOpen,    desc: 'Side-by-side brokerage comparison and fee structures' },
      { label: 'Market Breadth',       path: '/market-breadth', icon: BarChart2,   desc: 'Advance/decline ratios and market internals' },
      { label: 'Financial Reports',     path: '/financial-reports', icon: Sparkles, desc: 'Personalized financial planning reports' },
    ],
  },
  {
    id: 'macro',
    label: 'Macro & Economics',
    icon: CalendarDays,
    description: 'Economic calendar, energy, labor, consumer trends, real estate data — the macro context behind every market move.',
    concept: 'Macroeconomics',
    definition: 'The study of economy-wide forces: GDP growth, inflation, unemployment, and monetary policy. Macro shifts often lead equity markets by 6–12 months.',
    insight: 'A rate hike by the Fed doesn\'t just affect bonds — it ripples through mortgages, corporate earnings, and consumer spending.',
    href: '/macro',
    items: [
      { label: 'Economic Calendar', path: '/economic-calendar', icon: CalendarDays, desc: 'Fed meetings, CPI, jobs reports' },
      { label: 'Labor Markets',     path: '/labor',             icon: Users,        desc: 'Employment and wage data' },
      { label: 'The Consumer',      path: '/consumer',          icon: ShoppingCart, desc: 'Spending, sentiment, retail' },
      { label: 'Real Estate',       path: '/real-estate',       icon: Home,         desc: 'Housing market and mortgage data' },
    ],
  },
  {
    id: 'calculators',
    label: 'Planning Calculators',
    icon: Calculator,
    description: 'Compound growth, retirement projections, tax drag, insurance needs, mortgage analysis — every planning calculation in one place.',
    concept: 'Time Value of Money',
    definition: 'The principle that a dollar today is worth more than a dollar tomorrow. Every planning decision — mortgages, retirement, insurance — is rooted in this concept.',
    insight: 'Running the numbers before you decide transforms financial planning from guesswork into strategy. The best decisions are always made with a model in hand.',
    href: '/Calculators',
    items: [
      { label: 'Calculators', path: '/Calculators', icon: Calculator, desc: 'All planning calculators in one place' },
    ],
  },
  {
    id: 'history',
    label: 'History & Psychology',
    icon: BookOpen,
    description: 'Five behavioral finance lessons built from decades of market data — the patterns, biases, and psychological traps that separate disciplined investors from the crowd.',
    concept: 'Behavioral Finance',
    definition: 'The study of how cognitive biases and emotional responses distort financial decision-making. Kahneman, Tversky, and Thaler demonstrated that investors systematically act against their own long-term interest — and that awareness of these biases is the first line of defense.',
    insight: 'Every market cycle produces the same behaviors — panic selling at bottoms, euphoric buying at tops. Understanding the history of these patterns is the highest-leverage education an investor can get.',
    href: '/MarketHistory',
    items: [
      { label: 'Market History',        path: '/MarketHistory',  icon: History,   desc: 'Long-term cycles, recession overlays, and historical patterns' },
      { label: 'The Elastic Band',      path: '/elastic-band',   icon: Zap,       desc: 'Why markets snap back faster than they fall' },
      { label: 'The Best Days',         path: '/best-days',      icon: Star,      desc: 'The cost of missing the market\'s single best days' },
      { label: 'The Horizon Flip',      path: '/horizon-flip',   icon: LineChart, desc: 'How time transforms risk into near-certainty' },
      { label: 'Perfect Time Illusion', path: '/perfect-time',   icon: Target,    desc: 'Why waiting for the right moment destroys wealth' },
      { label: 'The Doom-Loop',         path: '/doom-loop',      icon: Newspaper, desc: 'Hindsight bias and media-driven panic cycles' },
    ],
  },
];

// ── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ section, index }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const Icon = section.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: EASE, delay: index * 0.06 }}
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{
          background: C.surface,
          border: `1px solid ${C.b1}`,
          borderRadius: 18,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: 'inset 0 1px 0 var(--elevated)',
          transition: 'border-color 0.25s ease',
          cursor: 'default',
        }}
        onHoverStart={e => {
          if (e.target && e.target.style) e.target.style.borderColor = 'rgba(201,169,110,0.35)';
        }}
      >
        {/* Gold accent stripe */}
        <div style={{
          height: 1,
          background: `linear-gradient(90deg, ${C.gold} 0%, rgba(201,169,110,0.15) 55%, transparent 100%)`,
        }} />

        {/* Card body */}
        <div style={{ padding: '24px 24px 20px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: C.goldDim,
              border: `1px solid ${C.goldBdr}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={18} color={C.gold} />
            </div>
            <div style={{
              fontSize: 9, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: C.t3, fontFamily: UI,
              padding: '4px 8px',
              background: 'rgba(240,232,216,0.04)',
              border: `1px solid ${C.b2}`,
              borderRadius: 6,
            }}>
              {section.items.length} tools
            </div>
          </div>

          {/* Title */}
          {section.id !== 'ai' && (
            <h2 style={{
              fontFamily: DISPLAY,
              fontSize: 22, fontWeight: 700,
              color: C.t1, letterSpacing: '-0.02em',
              margin: '0 0 10px', lineHeight: 1.2,
            }}>
              {section.label}
            </h2>
          )}

          {/* Description */}
          {section.id !== 'ai' && (
            <p style={{
              fontFamily: UI, fontSize: 13,
              color: C.t2, lineHeight: 1.75,
              margin: '0 0 20px',
            }}>
              {section.description}
            </p>
          )}

          {/* Concept definition card */}
          <div style={{
            background: C.raised,
            border: `1px solid ${C.b2}`,
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 20,
          }}>
            <div style={{
              fontSize: 9, textTransform: 'uppercase',
              letterSpacing: '0.16em', color: C.t3,
              fontFamily: UI, fontWeight: 700,
              marginBottom: 6,
            }}>
              Core Concept
            </div>
            <div style={{
              fontFamily: DISPLAY,
              fontSize: 15, fontWeight: 700,
              color: C.gold, marginBottom: 8,
            }}>
              {section.concept}
            </div>
            <p style={{
              fontFamily: UI, fontSize: 12,
              color: C.t2, lineHeight: 1.7, margin: '0 0 10px',
            }}>
              {section.definition}
            </p>
            {/* Insight quote */}
            <div style={{ borderLeft: `2px solid rgba(201,169,110,0.3)`, paddingLeft: 12 }}>
              <p style={{
                fontFamily: DISPLAY, fontStyle: 'italic',
                fontSize: 12, color: C.t3,
                lineHeight: 1.6, margin: 0,
              }}>
                "{section.insight}"
              </p>
            </div>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(x => !x)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent',
              border: `1px solid ${C.b2}`,
              borderRadius: 8, padding: '7px 12px',
              cursor: 'pointer',
              fontFamily: UI, fontSize: 11.5, fontWeight: 600,
              color: C.t3,
              letterSpacing: '0.01em',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.goldBdr; e.currentTarget.style.color = C.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.b2; e.currentTarget.style.color = C.t3; }}
          >
            {expanded ? 'Hide tools' : 'View all tools'}
            <ChevronDown
              size={11}
              style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
            />
          </button>
        </div>

        {/* Expandable items list */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="items"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ borderTop: `1px solid ${C.b1}`, paddingBottom: 8 }}>
                {section.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <motion.button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '9px 24px',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{
                        width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                        background: C.goldDim,
                        border: `1px solid ${C.b2}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <ItemIcon size={12} color={C.gold} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: UI, fontSize: 12.5, fontWeight: 600,
                          color: C.t2, letterSpacing: '0.01em',
                        }}>
                          {item.label}
                        </div>
                        {item.desc && (
                          <div style={{ fontSize: 10.5, color: C.t3, fontFamily: UI, marginTop: 1 }}>
                            {item.desc}
                          </div>
                        )}
                      </div>
                      <ArrowRight size={11} color={C.t3} />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card footer — primary enter button */}
        <div style={{ padding: '0 24px 20px' }}>
          <motion.button
            onClick={() => navigate(section.items[0].path)}
            whileHover={{ filter: 'brightness(1.08)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '11px',
              background: C.goldDim,
              border: `1px solid ${C.goldBdr}`,
              borderRadius: 10, cursor: 'pointer',
              fontFamily: UI, fontSize: 13, fontWeight: 700,
              color: C.gold, letterSpacing: '0.02em',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.14)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.goldDim; e.currentTarget.style.borderColor = C.goldBdr; }}
          >
            Enter {section.label} <ArrowRight size={13} />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Hub Page ──────────────────────────────────────────────────────────────────
export default function Hub() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div style={{ maxWidth: 1400, paddingBottom: '3rem', fontFamily: UI }}>
      {/* Page header */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: EASE }}
        style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}
      >
        <div>
          <div style={{
            fontFamily: UI, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: C.t3, marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: '50%', background: C.success,
              animation: 'hubPip 2.4s ease infinite',
            }} />
            Planora Terminal
          </div>
          <h1 style={{
            fontFamily: DISPLAY,
            fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700,
            color: C.t1, letterSpacing: '-0.02em',
            margin: '0 0 8px', lineHeight: 1.2,
          }}>
            Command{' '}
            <em style={{ fontStyle: 'italic', color: C.gold }}>Center</em>
          </h1>
          <p style={{
            fontFamily: UI, fontSize: 14, color: C.t2,
            margin: 0, lineHeight: 1.6,
          }}>
            Institutional intelligence, organized. Select a section to begin.
          </p>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            onClick={() => navigate('/planora-ai')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 16px', borderRadius: 99,
              background: 'rgba(129,140,248,0.08)',
              border: '1px solid rgba(129,140,248,0.20)',
              fontFamily: UI, fontSize: 12, fontWeight: 600, color: '#818cf8',
              cursor: 'pointer',
            }}
          >
            <Brain size={13} /> Planora AI
          </motion.button>
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 16px', borderRadius: 99,
              background: C.gold,
              border: 'none',
              fontFamily: UI, fontSize: 12, fontWeight: 700, color: '#1a1410',
              cursor: 'pointer',
            }}
          >
            Dashboard <ArrowRight size={12} />
          </motion.button>
        </div>
      </motion.div>

      {/* Section cards bento grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
      }} className="hub-grid">
        {SECTIONS.map((section, i) => (
          <SectionCard key={section.id} section={section} index={i} />
        ))}
      </div>

      {/* Platform ecosystem banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
        style={{
          marginTop: '2rem',
          background: C.surface,
          border: `1px solid ${C.b1}`,
          borderRadius: 16,
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16,
        }}
      >
        <div>
          <div style={{
            fontFamily: DISPLAY, fontSize: 16, fontWeight: 700,
            color: C.t1, marginBottom: 4,
          }}>
            Three Platforms. One Ecosystem.
          </div>
          <p style={{ fontFamily: UI, fontSize: 12.5, color: C.t2, margin: 0, lineHeight: 1.6 }}>
            You're inside Planora Terminal. Also explore Wealth Counsel (advisor marketplace) and FUN (financial education).
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            onClick={() => navigate('/wealth-counsel')}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{
              padding: '8px 16px', borderRadius: 8,
              background: 'transparent', border: '1px solid rgba(0,180,198,0.25)',
              fontFamily: UI, fontSize: 12, fontWeight: 600, color: '#00B4C6',
              cursor: 'pointer',
            }}
          >
            Wealth Counsel
          </motion.button>
          <motion.button
            onClick={() => navigate('/fun')}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{
              padding: '8px 16px', borderRadius: 8,
              background: 'transparent', border: '1px solid rgba(129,140,248,0.25)',
              fontFamily: UI, fontSize: 12, fontWeight: 600, color: '#818cf8',
              cursor: 'pointer',
            }}
          >
            FUN
          </motion.button>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <p style={{
        marginTop: '2rem', fontFamily: UI, fontSize: 11,
        color: C.t3, textAlign: 'center',
        letterSpacing: '0.02em', lineHeight: 1.6,
      }}>
        For educational purposes only — not financial, investment, tax, or legal advice.
      </p>

      <style>{`
        @keyframes hubPip {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,124,89,0.6); }
          50% { box-shadow: 0 0 0 4px rgba(74,124,89,0); }
        }
        @media (max-width: 960px) { .hub-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 580px)  { .hub-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
