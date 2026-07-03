import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, RotateCcw, CheckCircle2,
  Clock, TrendingUp, Shield, ScrollText, Wallet, CreditCard,
  ArrowRight, Target, BookOpen, PiggyBank, Zap, BarChart2,
  Home, Scale,
} from 'lucide-react';

/* ── Design tokens ──────────────────────────────────────────────────── */
const C = {
  bg:      '#1a1410',
  surface: '#231c16',
  raised:  '#2d2419',
  b1:      '#2a2018',
  b2:      '#3d3028',
  teal:    '#00B4C6',
  tealDim: 'rgba(0,180,198,0.08)',
  tealBdr: 'rgba(0,180,198,0.22)',
  gold:    '#c9a96e',
  goldDim: 'rgba(201,169,110,0.08)',
  t1:      '#f0e8d8',
  t2:      '#a89070',
  t3:      '#6b5540',
};

const UI      = "'Inter', system-ui, sans-serif";
const DISPLAY = "'Playfair Display', Georgia, serif";
const MONO    = "'JetBrains Mono', monospace";
const STORAGE_KEY = 'fun-onboarding-v1';

/* ── Label maps ─────────────────────────────────────────────────────── */
const GOAL_LABELS = {
  'emergency-fund': 'Build an Emergency Fund',
  'pay-debt':       'Pay Off Debt',
  'save-home':      'Save for a Home',
  'invest':         'Invest & Grow Wealth',
  'retirement':     'Retire Comfortably',
  'protect':        'Protect What I Have',
};

const CONFIDENCE_LABELS = {
  'very-confident':     'High Confidence',
  'somewhat-confident': 'Growing Confidence',
  'neutral':            'Neutral',
  'not-confident':      'Needs Guidance',
  'overwhelmed':        'Starting Fresh',
};

const CONFIDENCE_INTRO = {
  'very-confident':     "You're ahead of the curve. Let's optimize and protect your lead.",
  'somewhat-confident': "You have a strong base to build on. Let's close the gaps strategically.",
  'neutral':            "Now is a great time to get intentional. Small, consistent changes add up fast.",
  'not-confident':      "Starting is the hardest part — and you've already done it. We'll build from here.",
  'overwhelmed':        "You're not alone. We'll take this one step at a time. No jargon. No pressure.",
};

/* ── Score utilities ────────────────────────────────────────────────── */
function scoreColor(s) {
  if (s < 40) return '#c0392b';
  if (s < 62) return '#d4a017';
  if (s < 80) return C.teal;
  return '#4a7c59';
}

function scoreLabel(s) {
  if (s < 40) return 'Needs Attention';
  if (s < 62) return 'Building Momentum';
  if (s < 80) return 'On Track';
  return 'Financially Strong';
}

/* ── Scoring engine (6 categories, 100 pts total) ───────────────────── */
function calculateHealthScore(a) {
  const accts = a.accounts || [];
  const ins   = a.insurance || [];

  // Emergency Fund — 15 pts
  const emergencyMap = { '6plus': 15, '3-6': 12, '1-3': 7, '1month': 3, 'none': 0 };
  const emergencyScore = emergencyMap[a.emergency] ?? 0;

  // Retirement — 25 pts
  const hasRet  = accts.includes('401k') || accts.includes('ira');
  const ageMult = { 'under-25': 1.0, '25-34': 0.92, '35-44': 0.82, '45-54': 0.75, '55-64': 0.68, '65+': 0.6 };
  const retScore = Math.round((hasRet ? 25 : 5) * (ageMult[a.age] ?? 0.8));

  // Debt — 18 pts
  const debtMap  = { none: 18, 'mortgage-only': 16, 'some-cc': 9, 'significant-cc': 2, 'student-loans': 10, multiple: 4 };
  const debtScore = debtMap[a.debt] ?? 8;

  // Insurance — 17 pts
  let insScore  = ins.includes('health') ? 8 : 0;
  insScore += ['auto', 'home', 'life'].filter(i => ins.includes(i)).length * 2;
  insScore += ['disability', 'ltc'].filter(i => ins.includes(i)).length * 1.5;
  insScore = Math.min(17, Math.round(insScore));

  // Estate — 12 pts
  const estMap   = { complete: 12, basic: 8, planning: 3, none: 0 };
  const estScore = estMap[a.estate] ?? 0;

  // Accounts — 13 pts
  let acctScore  = accts.includes('checking') ? 4 : 0;
  acctScore += accts.includes('brokerage') ? 5 : 0;
  acctScore += accts.includes('hsa') ? 2 : 0;
  acctScore += accts.includes('529') ? 2 : 0;
  acctScore = Math.min(13, acctScore);

  const score = Math.min(100, emergencyScore + retScore + debtScore + insScore + estScore + acctScore);

  return {
    score,
    cats: {
      emergency:  { score: emergencyScore, max: 15, label: 'Emergency Fund', icon: PiggyBank,  path: 'budgeting'   },
      retirement: { score: retScore,       max: 25, label: 'Retirement',     icon: Clock,       path: 'investing'   },
      debt:       { score: debtScore,      max: 18, label: 'Debt & Credit',  icon: CreditCard,  path: 'debt-credit' },
      insurance:  { score: insScore,       max: 17, label: 'Insurance',      icon: Shield,      path: 'insurance'   },
      estate:     { score: estScore,       max: 12, label: 'Estate',         icon: ScrollText,  path: 'estate'      },
      accounts:   { score: acctScore,      max: 13, label: 'Accounts',       icon: TrendingUp,  path: 'investing'   },
    },
  };
}

/* ── Personalized roadmap ───────────────────────────────────────────── */
function generateRoadmap(a, cats) {
  const items = [];
  const goal  = a.goal;

  // Emergency fund — always first if missing
  if (cats.emergency.score < 7)
    items.push({ priority: 'high', title: 'Build your emergency fund first', desc: 'Before investing or paying extra on debt, establish 3–6 months of expenses in a high-yield savings account. This is your financial safety net.', path: 'budgeting', section: 'Budgeting & Foundations' });

  if (cats.estate.score < 6)
    items.push({ priority: 'high', title: 'Create an estate plan', desc: "A basic will takes 1–2 hours and costs $100–400. Few actions deliver higher protection for this little effort.", path: 'estate', section: 'Estate & Wills' });

  if (cats.insurance.score < 9)
    items.push({ priority: 'high', title: 'Review your insurance gaps', desc: 'Missing health, life, or disability coverage can unravel your entire financial plan in a single event.', path: 'insurance', section: 'Insurance Planning' });

  if (cats.retirement.score < 16)
    items.push({ priority: 'medium', title: 'Boost retirement savings', desc: 'Open or increase contributions to a 401(k) or IRA to capture tax advantages and decades of compound growth.', path: 'investing', section: 'Investing & Accounts' });

  if (cats.debt.score < 10)
    items.push({ priority: 'medium', title: 'Build a debt payoff plan', desc: 'Use the debt avalanche method to eliminate high-interest debt first — saving thousands in interest over time.', path: 'debt-credit', section: 'Debt & Credit' });

  if (goal === 'save-home' && !items.find(i => i.path === 'major-purchases'))
    items.splice(Math.min(1, items.length), 0, { priority: 'medium', title: 'Plan your home purchase', desc: 'Calculate your true buying budget, compare mortgage types, and model your break-even vs. renting.', path: 'major-purchases', section: 'Major Purchases' });

  if (cats.accounts.score < 7)
    items.push({ priority: 'low', title: 'Diversify your account types', desc: 'A taxable brokerage or HSA can grow wealth outside the annual contribution limits of retirement accounts.', path: 'investing', section: 'Investing & Accounts' });

  items.push({ priority: 'low', title: 'Optimize your budget foundation', desc: 'Review the 50/30/20 framework, calculate your savings rate, and automate every account contribution.', path: 'budgeting', section: 'Budgeting & Foundations' });

  return items.slice(0, 4);
}

/* ── Goal-based learning path ───────────────────────────────────────── */
function generateLearningPath(a) {
  const paths = {
    'emergency-fund': [
      { label: 'Budgeting & Foundations', path: 'budgeting',   desc: 'Build a spending plan and fund your safety net' },
      { label: 'Debt & Credit',           path: 'debt-credit', desc: 'Free up cash flow by tackling high-interest debt' },
      { label: 'Investing & Accounts',    path: 'investing',   desc: 'Put savings to work once your fund is established' },
    ],
    'pay-debt': [
      { label: 'Debt & Credit',           path: 'debt-credit', desc: 'Avalanche vs. snowball — master your payoff strategy' },
      { label: 'Budgeting & Foundations', path: 'budgeting',   desc: 'Free up more cash every month to accelerate payoff' },
      { label: 'Investing & Accounts',    path: 'investing',   desc: 'Learn to invest while paying off debt in parallel' },
    ],
    'save-home': [
      { label: 'Major Purchases',         path: 'major-purchases', desc: 'Budget and plan every aspect of your home purchase' },
      { label: 'Buy, Rent, or Lease',     path: 'buy-rent-lease',  desc: 'Run a true cost comparison before you decide' },
      { label: 'Budgeting & Foundations', path: 'budgeting',        desc: 'Maximize your down payment savings rate' },
    ],
    'invest': [
      { label: 'Investing & Accounts',    path: 'investing',    desc: 'Account types, allocation basics, and strategies' },
      { label: 'Tax Planning',            path: 'tax-planning', desc: 'Keep more of your returns with tax efficiency' },
      { label: 'Retirement Planning',     path: 'retirement',   desc: 'Maximize 401(k), IRA, and Roth contributions' },
    ],
    'retirement': [
      { label: 'Retirement Planning',     path: 'retirement',   desc: 'Build your retirement timeline and savings targets' },
      { label: 'Investing & Accounts',    path: 'investing',    desc: 'Maximize tax-advantaged account strategies' },
      { label: 'Tax Planning',            path: 'tax-planning', desc: 'Plan a tax-efficient withdrawal sequence' },
    ],
    'protect': [
      { label: 'Insurance Planning',      path: 'insurance',    desc: 'Close every coverage gap in your financial plan' },
      { label: 'Estate & Wills',          path: 'estate',       desc: 'Protect your assets and family with a proper plan' },
      { label: 'Investing & Accounts',    path: 'investing',    desc: 'Diversify to reduce concentration risk' },
    ],
  };

  return paths[a.goal] || [
    { label: 'Budgeting & Foundations', path: 'budgeting',  desc: 'Start with the fundamentals' },
    { label: 'Investing & Accounts',    path: 'investing',  desc: 'Grow your wealth long-term' },
    { label: 'Insurance Planning',      path: 'insurance',  desc: "Protect everything you've built" },
  ];
}

/* ── Health gauge ───────────────────────────────────────────────────── */
function HealthGauge({ score }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start    = performance.now();
    const duration = 1200;
    const animate  = (now) => {
      const t     = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * score));
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [score]);

  const cx = 150, cy = 150, r = 110;
  const arcLen = Math.PI * r;
  const fill   = (display / 100) * arcLen;
  const ang    = Math.PI * (1 - display / 100);
  const nx     = cx + r * Math.cos(ang);
  const ny     = cy - r * Math.sin(ang);
  const col    = scoreColor(display);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 32 300 128" style={{ width: '100%', maxWidth: 280 }}>
        <path d="M 40 150 A 110 110 0 0 0 94 56"   fill="none" stroke="rgba(192,57,43,0.18)"  strokeWidth={14} strokeLinecap="round"/>
        <path d="M 94 56 A 110 110 0 0 0 206 55"   fill="none" stroke="rgba(212,160,23,0.18)" strokeWidth={14} strokeLinecap="round"/>
        <path d="M 206 55 A 110 110 0 0 0 260 150" fill="none" stroke="rgba(74,124,89,0.18)"  strokeWidth={14} strokeLinecap="round"/>
        <path d="M 40 150 A 110 110 0 0 0 260 150" fill="none" stroke={C.b2}   strokeWidth={14} strokeLinecap="round"/>
        <path
          d="M 40 150 A 110 110 0 0 0 260 150"
          fill="none" stroke={col} strokeWidth={14} strokeLinecap="round"
          strokeDasharray={`${fill} ${arcLen}`} strokeDashoffset={0}
        />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={C.t2} strokeWidth={2.5} strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r={8}   fill={C.raised} stroke={C.b2} strokeWidth={2}/>
        <circle cx={cx} cy={cy} r={3.5} fill={col}/>
        <text x="36"  y="148" textAnchor="middle" style={{ font: `600 9px ${UI}`, fill: C.t3 }}>0</text>
        <text x="264" y="148" textAnchor="middle" style={{ font: `600 9px ${UI}`, fill: C.t3 }}>100</text>
      </svg>

      <div style={{ marginTop: '-10px' }}>
        <div style={{ fontFamily: MONO, fontSize: '3rem', fontWeight: 800, color: col, lineHeight: 1, letterSpacing: '-0.04em' }}>
          {display}
        </div>
        <div style={{ fontSize: '0.75rem', color: C.t3, fontFamily: UI, marginTop: 2 }}>out of 100</div>
        <div style={{ fontFamily: DISPLAY, fontSize: '1rem', fontWeight: 600, color: col, marginTop: 6, letterSpacing: '-0.01em' }}>
          {scoreLabel(display)}
        </div>
      </div>
    </div>
  );
}

/* ── Category bar ───────────────────────────────────────────────────── */
function CatBar({ label, score, max, icon: Icon, path, navigate }) {
  const pct = Math.round((score / max) * 100);
  const col  = scoreColor(pct);
  return (
    <div
      onClick={() => navigate(`/fun/${path}`)}
      style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.625rem 0.75rem', borderRadius: 9, cursor: 'pointer', transition: 'background 0.13s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,232,216,0.04)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ width: 32, height: 32, background: `${col}18`, border: `1px solid ${col}30`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={14} color={col}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.t1, fontFamily: UI }}>{label}</span>
          <span style={{ fontSize: '0.75rem', color: col, fontWeight: 700, fontFamily: MONO }}>{pct}%</span>
        </div>
        <div style={{ height: 4, background: C.b2, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 99, transition: 'width 0.8s ease' }}/>
        </div>
      </div>
      <ChevronRight size={12} color={C.t3}/>
    </div>
  );
}

/* ── Roadmap card ───────────────────────────────────────────────────── */
function RoadmapCard({ item, navigate }) {
  const priorityCol = item.priority === 'high' ? '#c0392b' : item.priority === 'medium' ? '#d4a017' : C.t3;
  const priorityDim = item.priority === 'high' ? 'rgba(192,57,43,0.1)' : item.priority === 'medium' ? 'rgba(212,160,23,0.1)' : 'rgba(107,85,64,0.1)';

  return (
    <div
      onClick={() => navigate(`/fun/${item.path}`)}
      style={{ background: C.raised, border: `1px solid ${C.b2}`, borderRadius: 12, padding: '1rem 1.125rem', cursor: 'pointer', transition: 'border-color 0.15s', display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.tealBdr}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.b2}
    >
      <div style={{ padding: '3px 8px', background: priorityDim, border: `1px solid ${priorityCol}30`, borderRadius: 6, fontSize: '0.5625rem', fontWeight: 700, color: priorityCol, letterSpacing: '0.07em', textTransform: 'uppercase', flexShrink: 0, marginTop: 2, fontFamily: UI, whiteSpace: 'nowrap' }}>
        {item.priority === 'high' ? 'High' : item.priority === 'medium' ? 'Medium' : 'Low'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: UI, fontSize: '0.875rem', fontWeight: 700, color: C.t1, marginBottom: 4 }}>{item.title}</div>
        <div style={{ fontSize: '0.8rem', color: C.t2, lineHeight: 1.65, fontFamily: UI }}>{item.desc}</div>
        <div style={{ marginTop: 8, fontSize: '0.75rem', color: C.teal, fontWeight: 600, fontFamily: UI, display: 'flex', alignItems: 'center', gap: 4 }}>
          Go to {item.section} <ArrowRight size={11}/>
        </div>
      </div>
    </div>
  );
}

/* ── Learning path step ─────────────────────────────────────────────── */
function LearningStep({ step, index, navigate }) {
  return (
    <div
      onClick={() => navigate(`/fun/${step.path}`)}
      style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', background: C.raised, border: `1px solid ${C.b2}`, borderRadius: 12, cursor: 'pointer', transition: 'border-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.tealBdr}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.b2}
    >
      <div style={{ width: 28, height: 28, background: C.tealDim, border: `1px solid ${C.tealBdr}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: MONO, fontSize: '0.6875rem', fontWeight: 800, color: C.teal }}>{index + 1}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.t1, fontFamily: UI }}>{step.label}</div>
        <div style={{ fontSize: '0.75rem', color: C.t2, marginTop: 2, fontFamily: UI }}>{step.desc}</div>
      </div>
      <ArrowRight size={13} color={C.teal}/>
    </div>
  );
}

/* ── Welcome Screen ─────────────────────────────────────────────────── */
function WelcomeScreen({ onStart }) {
  const [hovered, setHovered] = useState(false);

  const features = [
    { icon: BarChart2,  label: 'Financial Health Score', desc: '100-point score across 6 pillars of personal finance'      },
    { icon: Target,     label: 'Priority Roadmap',        desc: 'Your top actions ranked by real financial impact'          },
    { icon: BookOpen,   label: 'Curated Learning Path',   desc: 'A 3-module sequence tailored to your #1 goal'             },
    { icon: Zap,        label: 'Instant Breakdown',       desc: 'See exactly where you stand — and precisely where to act' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', fontFamily: UI, background: C.bg }}>

      {/* FUN Branding */}
      <div style={{ marginBottom: '2.75rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
          <div style={{ width: 44, height: 44, background: 'rgba(0,180,198,0.1)', border: '1px solid rgba(0,180,198,0.28)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="17" stroke="#00B4C6" strokeWidth="1.5" fill="none" opacity="0.5"/>
              <circle cx="18" cy="6"  r="4" fill="#00B4C6"/>
              <circle cx="6"  cy="27" r="4" fill="#00B4C6" opacity="0.8"/>
              <circle cx="30" cy="27" r="4" fill="#00B4C6" opacity="0.8"/>
              <line x1="18" y1="10" x2="6"  y2="23" stroke="#00B4C6" strokeWidth="1.5" opacity="0.65"/>
              <line x1="18" y1="10" x2="30" y2="23" stroke="#00B4C6" strokeWidth="1.5" opacity="0.65"/>
              <line x1="6"  y1="27" x2="30" y2="27" stroke="#00B4C6" strokeWidth="1.5" opacity="0.65"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: DISPLAY, fontSize: '1.375rem', fontWeight: 700, color: C.t1, letterSpacing: '-0.015em', lineHeight: 1 }}>FUN</div>
            <div style={{ fontSize: 9, color: C.teal, fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', marginTop: 4 }}>Financial Understanding Network</div>
          </div>
        </div>
      </div>

      {/* Hero copy */}
      <div style={{ maxWidth: 540, textAlign: 'center', marginBottom: '2.75rem' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.t3, marginBottom: 14, fontFamily: UI }}>
          Start Here
        </div>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.75rem, 4vw, 2.625rem)', fontWeight: 700, color: C.t1, margin: '0 0 1.125rem', lineHeight: 1.2, letterSpacing: '-0.025em' }}>
          Your Financial Health{' '}
          <em style={{ fontStyle: 'italic', color: C.teal }}>Assessment</em>
        </h1>
        <p style={{ fontSize: '1rem', color: C.t2, lineHeight: 1.75, margin: 0, fontFamily: UI }}>
          Nine focused questions. A personalized health score, prioritized action plan,
          and curated learning path — ready in under five minutes.
        </p>
      </div>

      {/* Feature grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', width: '100%', maxWidth: 520, marginBottom: '2.25rem' }}>
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.b1}`, borderRadius: 14, padding: '1.125rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ width: 32, height: 32, background: C.tealDim, border: `1px solid ${C.tealBdr}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color={C.teal}/>
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.t1, fontFamily: UI }}>{f.label}</div>
              <div style={{ fontSize: '0.75rem', color: C.t3, lineHeight: 1.6, fontFamily: UI }}>{f.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Meta badges */}
      <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '2.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['9 questions', '~5 minutes', 'Stays on your device', 'No sign-up required'].map(b => (
          <div key={b} style={{ padding: '4px 12px', background: C.surface, border: `1px solid ${C.b2}`, borderRadius: 100, fontSize: '0.75rem', color: C.t3, fontFamily: UI, fontWeight: 500 }}>
            {b}
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '1rem 2.5rem',
          background: hovered ? '#00cfe3' : C.teal,
          color: '#1a1410', border: 'none', borderRadius: 12,
          cursor: 'pointer', fontSize: '1rem', fontWeight: 700, fontFamily: UI,
          boxShadow: hovered ? '0 10px 36px rgba(0,180,198,0.4)' : '0 4px 20px rgba(0,180,198,0.22)',
          transition: 'all 0.18s ease', letterSpacing: '-0.01em',
        }}
      >
        Begin Assessment
        <ChevronRight size={18}/>
      </button>

      <p style={{ marginTop: '2rem', fontSize: '0.6875rem', color: C.t3, textAlign: 'center', lineHeight: 1.65, fontFamily: UI, maxWidth: 400 }}>
        For educational purposes only. This assessment does not constitute financial, investment, tax, or legal advice.
        All responses are stored locally on your device.
      </p>
    </div>
  );
}

/* ── Assessment wizard ──────────────────────────────────────────────── */
const STEPS = [
  {
    id: 'age', q: 'How old are you?',
    sub: "We'll tailor your financial roadmap to your life stage.",
    type: 'single',
    options: [
      { v: 'under-25', l: 'Under 25',    d: 'Early career — building your foundation' },
      { v: '25-34',    l: '25 – 34',     d: 'Growth phase — major milestones ahead' },
      { v: '35-44',    l: '35 – 44',     d: 'Peak earning & family planning years' },
      { v: '45-54',    l: '45 – 54',     d: 'Wealth accumulation & protection phase' },
      { v: '55-64',    l: '55 – 64',     d: 'Pre-retirement transition' },
      { v: '65+',      l: '65 or older', d: 'Retirement & legacy planning' },
    ],
  },
  {
    id: 'income', q: 'Annual household income?',
    sub: 'Helps us calibrate savings targets and tax strategies.',
    type: 'single',
    options: [
      { v: 'under-30k', l: 'Under $30,000'         },
      { v: '30-60k',    l: '$30,000 – $60,000'      },
      { v: '60-100k',   l: '$60,000 – $100,000'     },
      { v: '100-150k',  l: '$100,000 – $150,000'    },
      { v: '150-300k',  l: '$150,000 – $300,000'    },
      { v: '300k+',     l: '$300,000+'              },
    ],
  },
  {
    id: 'emergency', q: 'Do you have an emergency fund?',
    sub: 'A 3–6 month safety net is the cornerstone of every financial plan.',
    type: 'single',
    options: [
      { v: '6plus',   l: '6+ months of expenses',    d: 'Fully funded and stable' },
      { v: '3-6',     l: '3–6 months of expenses',   d: 'Solid foundation in place' },
      { v: '1-3',     l: '1–3 months of expenses',   d: "Building — not quite there yet" },
      { v: '1month',  l: 'Less than 1 month',         d: 'Just getting started' },
      { v: 'none',    l: 'No emergency fund',         d: "Haven't started one yet" },
    ],
  },
  {
    id: 'accounts', q: 'Which accounts do you currently have?',
    sub: "Check all that apply. Don't worry if you're just starting out.",
    type: 'multi',
    options: [
      { v: 'checking',  l: 'Checking & Savings Account'      },
      { v: '401k',      l: '401(k) or employer plan'         },
      { v: 'ira',       l: 'IRA (Traditional or Roth)'       },
      { v: 'brokerage', l: 'Taxable Brokerage Account'       },
      { v: 'hsa',       l: 'Health Savings Account (HSA)'    },
      { v: '529',       l: '529 College Savings Plan'         },
    ],
  },
  {
    id: 'debt', q: 'Your current debt situation?',
    sub: "Be honest — this stays private and shapes your action plan.",
    type: 'single',
    options: [
      { v: 'none',           l: 'Debt-free',                    d: 'No significant outstanding debt' },
      { v: 'mortgage-only',  l: 'Mortgage only',                d: 'No consumer debt beyond a home loan' },
      { v: 'some-cc',        l: 'Some credit card debt',        d: "Manageable balances I'm working on" },
      { v: 'significant-cc', l: 'Significant credit card debt', d: 'High balances at high interest rates' },
      { v: 'student-loans',  l: 'Student loan debt',            d: 'Federal or private student loans' },
      { v: 'multiple',       l: 'Multiple types of debt',       d: 'Credit cards, loans, and more' },
    ],
  },
  {
    id: 'goal', q: "What's your #1 financial priority right now?",
    sub: "This shapes your personalized roadmap and curated learning path.",
    type: 'single',
    options: [
      { v: 'emergency-fund', l: 'Build an emergency fund', d: 'Establish a 3–6 month safety net first' },
      { v: 'pay-debt',       l: 'Pay off debt',            d: 'Eliminate high-interest debt fast' },
      { v: 'save-home',      l: 'Save for a home',         d: 'Building a down payment' },
      { v: 'invest',         l: 'Invest & grow wealth',    d: 'Maximize long-term returns' },
      { v: 'retirement',     l: 'Retire comfortably',      d: 'Build a secure retirement nest egg' },
      { v: 'protect',        l: 'Protect what I have',     d: 'Insurance, estate, and risk management' },
    ],
  },
  {
    id: 'insurance', q: 'Which insurance policies do you have?',
    sub: 'Check all that apply.',
    type: 'multi',
    options: [
      { v: 'health',     l: 'Health Insurance'                  },
      { v: 'life',       l: 'Life Insurance'                    },
      { v: 'auto',       l: 'Auto Insurance'                    },
      { v: 'home',       l: 'Homeowners or Renters Insurance'   },
      { v: 'disability', l: 'Disability Insurance'              },
      { v: 'ltc',        l: 'Long-Term Care Insurance'          },
    ],
  },
  {
    id: 'estate', q: 'Do you have a will or estate plan?',
    sub: 'Estate planning matters at every life stage — even in your 20s.',
    type: 'single',
    options: [
      { v: 'complete', l: 'Yes — complete estate plan', d: 'Will, trust, POA, healthcare directives' },
      { v: 'basic',    l: 'Yes — basic will',           d: 'At least a simple will in place' },
      { v: 'planning', l: 'Not yet, but I plan to',     d: "It's on my radar" },
      { v: 'none',     l: 'No',                         d: "Haven't gotten to it yet" },
    ],
  },
  {
    id: 'confidence', q: 'How confident do you feel managing your finances?',
    sub: "Honest self-assessment helps us calibrate where you're starting from.",
    type: 'single',
    options: [
      { v: 'very-confident',     l: 'Very confident',     d: 'I have a plan and follow it consistently' },
      { v: 'somewhat-confident', l: 'Somewhat confident', d: "I have the basics down but want to improve" },
      { v: 'neutral',            l: 'Neutral',            d: "I get by but don't really think about it" },
      { v: 'not-confident',      l: 'Not very confident', d: "I know I should do more but don't know where to start" },
      { v: 'overwhelmed',        l: 'Overwhelmed',        d: 'Finance feels stressful and confusing' },
    ],
  },
];

function Onboarding({ onComplete }) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [multiSel, setMulti]  = useState([]);
  const [exiting, setExiting] = useState(false);

  if (showWelcome) return <WelcomeScreen onStart={() => setShowWelcome(false)} />;

  const current = STEPS[step];
  const total   = STEPS.length;

  function advance(newAnswers) {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      if (step + 1 < total) { setStep(step + 1); setMulti([]); }
      else { onComplete(newAnswers); }
    }, 220);
  }

  function pickSingle(v) {
    const updated = { ...answers, [current.id]: v };
    setAnswers(updated);
    advance(updated);
  }

  function toggleMulti(v) {
    setMulti(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  }

  function submitMulti() {
    const updated = { ...answers, [current.id]: multiSel };
    setAnswers(updated);
    advance(updated);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', fontFamily: UI, background: C.bg }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontFamily: DISPLAY, fontSize: '1.125rem', fontWeight: 700, color: C.teal, letterSpacing: '-0.01em' }}>FUN</div>
        <div style={{ fontSize: 9, color: C.t3, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
          Financial Understanding Network
        </div>
      </div>

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 520, marginBottom: '2.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.75rem', color: C.t3, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Question {step + 1} of {total}
          </span>
          <span style={{ fontSize: '0.75rem', color: C.teal, fontWeight: 700, fontFamily: MONO }}>
            {Math.round(((step + 1) / total) * 100)}%
          </span>
        </div>
        <div style={{ height: 3, background: C.b2, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((step + 1) / total) * 100}%`, background: C.teal, borderRadius: 99, transition: 'width 0.35s ease' }}/>
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 520,
        background: C.surface, border: `1px solid ${C.b1}`, borderRadius: 20,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)', padding: '2.25rem',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateY(10px)' : 'translateY(0)',
        transition: 'opacity 0.18s ease, transform 0.18s ease',
      }}>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${C.teal} 0%, rgba(0,180,198,0.15) 55%, transparent 100%)`, marginBottom: '1.5rem', marginLeft: '-2.25rem', marginRight: '-2.25rem', marginTop: '-2.25rem', borderRadius: '20px 20px 0 0' }} />

        <h2 style={{ fontFamily: DISPLAY, fontSize: '1.5rem', fontWeight: 700, color: C.t1, margin: '0 0 0.5rem', lineHeight: 1.25, letterSpacing: '-0.02em' }}>{current.q}</h2>
        <p style={{ fontSize: '0.875rem', color: C.t2, margin: '0 0 1.75rem', lineHeight: 1.65, fontFamily: UI }}>{current.sub}</p>

        {current.type === 'single' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {current.options.map(opt => (
              <button
                key={opt.v}
                onClick={() => pickSingle(opt.v)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: C.raised, border: `1px solid ${C.b2}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.13s, background 0.13s', fontFamily: UI }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.tealBdr; e.currentTarget.style.background = 'rgba(0,180,198,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.b2; e.currentTarget.style.background = C.raised; }}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: C.t1 }}>{opt.l}</div>
                  {opt.d && <div style={{ fontSize: '0.75rem', color: C.t3, marginTop: 2 }}>{opt.d}</div>}
                </div>
                <ChevronRight size={14} color={C.t3}/>
              </button>
            ))}
          </div>
        )}

        {current.type === 'multi' && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {current.options.map(opt => {
                const sel = multiSel.includes(opt.v);
                return (
                  <button
                    key={opt.v}
                    onClick={() => toggleMulti(opt.v)}
                    style={{ padding: '0.5rem 0.875rem', background: sel ? C.tealDim : C.raised, border: `1px solid ${sel ? C.teal : C.b2}`, borderRadius: 100, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: sel ? 600 : 400, color: sel ? C.teal : C.t2, transition: 'all 0.13s', fontFamily: UI, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {sel && <CheckCircle2 size={12} color={C.teal}/>}
                    {opt.l}
                  </button>
                );
              })}
            </div>
            <button
              onClick={submitMulti}
              style={{ width: '100%', padding: '0.875rem', background: C.teal, color: '#1a1410', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: '0.9375rem', fontWeight: 700, fontFamily: UI, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.87'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {multiSel.length === 0 ? 'None of these — continue' : `Continue with ${multiSel.length} selected`}
              <ChevronRight size={16}/>
            </button>
          </>
        )}
      </div>

      {step > 0 && (
        <button
          onClick={() => { setStep(s => s - 1); setMulti([]); }}
          style={{ marginTop: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: C.t3, fontFamily: UI }}
        >
          Back
        </button>
      )}
    </div>
  );
}

/* ── Results dashboard ──────────────────────────────────────────────── */
function ResultsDashboard({ answers, onReset }) {
  const navigate = useNavigate();
  const { score, cats } = calculateHealthScore(answers);
  const roadmap      = generateRoadmap(answers, cats);
  const learningPath = generateLearningPath(answers);
  const col          = scoreColor(score);

  const ageLabels = { 'under-25': 'Under 25', '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55-64': '55–64', '65+': '65+' };

  const introMessage = CONFIDENCE_INTRO[answers.confidence]
    || `Based on your profile · Age ${ageLabels[answers.age] || '—'} · Click any category to explore`;

  const sections = [
    { path: 'budgeting',       label: 'Budgeting',      icon: Wallet     },
    { path: 'debt-credit',     label: 'Debt & Credit',  icon: CreditCard },
    { path: 'investing',       label: 'Investing',      icon: TrendingUp },
    { path: 'insurance',       label: 'Insurance',      icon: Shield     },
    { path: 'estate',          label: 'Estate & Wills', icon: ScrollText },
    { path: 'retirement',      label: 'Retirement',     icon: Clock      },
    { path: 'major-purchases', label: 'Major Purchases',icon: Home       },
    { path: 'buy-rent-lease',  label: 'Buy, Rent, Lease',icon: Scale     },
    { path: 'tax-planning',    label: 'Tax Planning',   icon: BookOpen   },
  ];

  return (
    <div style={{ padding: '2rem 2rem 3rem', fontFamily: UI, maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.t3, marginBottom: 8, fontFamily: UI }}>
            Financial Understanding Network
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: '1.875rem', fontWeight: 700, color: C.t1, margin: '0 0 0.25rem', letterSpacing: '-0.025em' }}>
            Your Financial Health{' '}
            <em style={{ fontStyle: 'italic', color: C.teal }}>Dashboard</em>
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: C.t2, fontFamily: UI, maxWidth: 520, lineHeight: 1.6 }}>
            {introMessage}
          </p>
        </div>
        <button
          onClick={onReset}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'none', border: `1px solid ${C.b2}`, borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', color: C.t3, fontFamily: UI, transition: 'border-color 0.15s, color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.b1; e.currentTarget.style.color = C.t2; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.b2; e.currentTarget.style.color = C.t3; }}
        >
          <RotateCcw size={12}/> Retake assessment
        </button>
      </div>

      {/* Goal + confidence banner */}
      {answers.goal && (
        <div style={{ background: C.surface, border: `1px solid ${C.b1}`, borderRadius: 13, padding: '0.875rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ width: 36, height: 36, background: C.tealDim, border: `1px solid ${C.tealBdr}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Target size={16} color={C.teal}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.625rem', color: C.t3, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: UI }}>Primary Goal</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.t1, fontFamily: UI, marginTop: 2 }}>
              {GOAL_LABELS[answers.goal]}
            </div>
          </div>
          {answers.confidence && (
            <div style={{ padding: '5px 12px', background: `${C.teal}14`, border: `1px solid ${C.tealBdr}`, borderRadius: 100, fontSize: '0.75rem', color: C.teal, fontWeight: 600, fontFamily: UI, whiteSpace: 'nowrap' }}>
              {CONFIDENCE_LABELS[answers.confidence]}
            </div>
          )}
        </div>
      )}

      {/* Main grid */}
      <div className="fun-main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,320px) 1fr', gap: '1.25rem', alignItems: 'start' }}>

        {/* Left — gauge */}
        <div style={{ background: C.surface, border: `1px solid ${C.b1}`, borderRadius: 18, padding: '1.75rem 1.5rem 1.5rem', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, color: C.t3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: UI }}>
            Financial Health Score
          </div>
          <HealthGauge score={score}/>

          <div style={{ marginTop: '1.5rem', padding: '0.875rem', background: `${col}0c`, border: `1px solid ${col}28`, borderRadius: 10, fontSize: '0.8rem', color: C.t2, lineHeight: 1.7, fontFamily: UI }}>
            {score < 40  && "Several high-priority gaps need attention. Start with your emergency fund and insurance coverage — both deliver outsized protection."}
            {score >= 40 && score < 62 && "You're building momentum. Focus on closing your emergency fund gap and accelerating retirement contributions."}
            {score >= 62 && score < 80 && "You're on a strong trajectory. Estate planning and account diversification will push you to the next level."}
            {score >= 80 && "Excellent financial health. Shift focus to optimization — tax efficiency, wealth transfer, and long-term care planning."}
          </div>
        </div>

        {/* Right — breakdown + roadmap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Category breakdown */}
          <div style={{ background: C.surface, border: `1px solid ${C.b1}`, borderRadius: 18, padding: '1.25rem 0.75rem', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, color: C.t3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.75rem', paddingLeft: '0.75rem', fontFamily: UI }}>
              Category Breakdown
            </div>
            {Object.values(cats).map(cat => (
              <CatBar key={cat.label} {...cat} navigate={navigate}/>
            ))}
          </div>

          {/* Priority roadmap */}
          <div style={{ background: C.surface, border: `1px solid ${C.b1}`, borderRadius: 18, padding: '1.25rem', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, color: C.t3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: UI }}>
              Your Priority Roadmap
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {roadmap.map((item, i) => (
                <RoadmapCard key={i} item={item} navigate={navigate}/>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Learning path */}
      <div style={{ marginTop: '1.75rem', background: C.surface, border: `1px solid ${C.b1}`, borderRadius: 18, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.125rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, color: C.t3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4, fontFamily: UI }}>
              Your Learning Path
            </div>
            <div style={{ fontSize: '0.8rem', color: C.t2, fontFamily: UI }}>
              Curated for your goal: <span style={{ color: C.teal, fontWeight: 600 }}>{GOAL_LABELS[answers.goal] || 'Building fundamentals'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: C.tealDim, border: `1px solid ${C.tealBdr}`, borderRadius: 8 }}>
            <BookOpen size={12} color={C.teal}/>
            <span style={{ fontSize: '0.75rem', color: C.teal, fontWeight: 600, fontFamily: UI }}>3 modules</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {learningPath.map((step, i) => (
            <LearningStep key={i} step={step} index={i} navigate={navigate}/>
          ))}
        </div>
      </div>

      {/* Section explorer */}
      <div style={{ marginTop: '1.75rem' }}>
        <div style={{ fontSize: '0.625rem', fontWeight: 700, color: C.t3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: UI }}>
          Explore All Sections
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: '0.75rem' }}>
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.path}
                onClick={() => navigate(`/fun/${s.path}`)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: '1rem', background: C.surface, border: `1px solid ${C.b1}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontFamily: UI, transition: 'border-color 0.15s, transform 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.tealBdr; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.b1; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ width: 32, height: 32, background: C.tealDim, border: `1px solid ${C.tealBdr}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} color={C.teal}/>
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.t1 }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p style={{ marginTop: '2.5rem', fontSize: '0.6875rem', color: C.t3, textAlign: 'center', lineHeight: 1.6, fontFamily: UI }}>
        For educational purposes only — not financial, investment, tax, or legal advice.
      </p>

      <style>{`
        @media (max-width: 700px) { .fun-main-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

/* ── Root export ────────────────────────────────────────────────────── */
export default function FunDashboard() {
  const [answers, setAnswers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; }
    catch { return null; }
  });

  function handleComplete(a) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
    setAnswers(a);
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers(null);
  }

  if (!answers) return <Onboarding onComplete={handleComplete}/>;
  return <ResultsDashboard answers={answers} onReset={handleReset}/>;
}
