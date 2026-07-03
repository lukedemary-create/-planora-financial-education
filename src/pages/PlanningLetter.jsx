import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const UI   = "'Inter', system-ui, sans-serif"
const MONO = "'JetBrains Mono', 'Courier New', monospace"
const DISPLAY = "'Playfair Display', Georgia, serif"
const CHROME = "'Monaco', 'Lucida Console', 'Courier New', monospace"

// ── Paper palette — warm Mac window floating on dark desk
const P = {
  page:    '#1a1410',
  win:     '#F2E9D8',
  surf:    '#EDE3CF',
  bar:     '#CDBFA0',
  barLine: 'rgba(0,0,0,0.06)',
  grid:    '#C4B094',
  ink:     '#1C1712',
  inkSoft: '#4A3828',
  inkMuted:'#8A7060',
  border:  '#A8906C',
  today:   '#2A5F7A',
  todayBg: 'rgba(42,95,122,0.10)',
  pub:     '#2A6048',
  pubBg:   'rgba(42,96,72,0.10)',
}

// ── Month themes
const THEMES = {
  '2026-06': { name: 'The Financial Foundation',              accent: '#B6841F', aLight: 'rgba(182,132,31,0.10)',  desc: 'The base every plan stands on. Mid-year checkpoint.' },
  '2026-07': { name: 'Debt & Credit',                        accent: '#8B5A30', aLight: 'rgba(139,90,48,0.10)',   desc: 'Address the liability side of the ledger.' },
  '2026-08': { name: 'Education Funding & Family',           accent: '#2D6B4F', aLight: 'rgba(45,107,79,0.10)',   desc: 'Seasonally timed to the school year.' },
  '2026-09': { name: 'Investing & Asset Allocation',         accent: '#2A5F7A', aLight: 'rgba(42,95,122,0.10)',   desc: 'The growth engine — how money compounds.' },
  '2026-10': { name: 'Estate Planning',                      accent: '#8B6914', aLight: 'rgba(139,105,20,0.10)',  desc: 'National Estate Planning Awareness Month.' },
  '2026-11': { name: 'Insurance & Benefits',                 accent: '#6A5040', aLight: 'rgba(106,80,64,0.10)',   desc: 'Open enrollment season.' },
  '2026-12': { name: 'Year-End Tax Moves',                   accent: '#3A6B50', aLight: 'rgba(58,107,80,0.10)',   desc: 'Deadline-driven moves before December 31.' },
  '2027-01': { name: 'Goals & The Annual Money Plan',        accent: '#5A4A7A', aLight: 'rgba(90,74,122,0.10)',   desc: 'Reset and architect the year ahead.' },
  '2027-02': { name: 'Couples & Behavioral Money',           accent: '#8B4848', aLight: 'rgba(139,72,72,0.10)',   desc: 'The human side of money.' },
  '2027-03': { name: 'Tax Planning & Prep',                  accent: '#2A507A', aLight: 'rgba(42,80,122,0.10)',   desc: 'Ahead of the filing deadline.' },
  '2027-04': { name: 'Retirement Planning',                  accent: '#8B7A4A', aLight: 'rgba(139,122,74,0.10)',  desc: 'Anchored to the April contribution deadline.' },
  '2027-05': { name: 'Financial Independence',               accent: '#5A7A3A', aLight: 'rgba(90,122,58,0.10)',   desc: 'Tie the year together.' },
}

// ── All 47 issues  [year, month0, day]
const ISSUES = [
  // JUNE 2026 — Financial Foundation
  { num:'001', d:[2026,5,16], mk:'2026-06', title:'The Mid-Year Money Audit',        focus:'Building a net worth statement, reading where you actually stand, the savings-rate metric that matters more than income.',      pts:['Build your net worth statement from scratch or update it','Calculate your real savings rate — gross income vs. gross savings','Identify the one metric that predicts wealth accumulation better than any other'] },
  { num:'002', d:[2026,5,23], mk:'2026-06', title:'Cash Flow That Actually Works',   focus:'Fixed vs. variable spending, why the 50/30/20 rule breaks down for most earners, building a system you will keep, automating the flow.', pts:['Map fixed vs. variable expenses — the first honest look','Why 50/30/20 fails above $100K income','An automated flow structure that runs without willpower'] },
  { num:'003', d:[2026,5,30], mk:'2026-06', title:'The Emergency Reserve',           focus:'How much is right for your situation, where to hold it — high-yield savings vs. T-bills vs. money market — and three tiers of liquidity.', pts:['Your personal reserve target calculation','HYSA vs. T-bills vs. money market: the yield and access tradeoffs','Three-tier liquidity framework for households with variable income'] },
  // JULY 2026 — Debt & Credit
  { num:'004', d:[2026,6,7],  mk:'2026-07', title:'Good Debt vs. Bad Debt',          focus:'Debt as a cost of capital, when borrowing is a tool vs. a trap, and the interest rate threshold that changes the calculus.',             pts:['Understanding debt as a cost of capital','The rate threshold: when carrying debt is rational','Mapping your own debt profile by interest rate'] },
  { num:'005', d:[2026,6,14], mk:'2026-07', title:'Payoff Strategies Decoded',        focus:'Avalanche vs. snowball, the math behind each, when refinancing makes sense, and the one metric to calculate before you start.',         pts:['Avalanche vs. snowball: the real mathematical difference','When refinancing actually saves money (and when it doesn\'t)','Calculate your debt-free date'] },
  { num:'006', d:[2026,6,21], mk:'2026-07', title:'Credit Scores Decoded',            focus:'The five FICO scoring factors, utilization mechanics, how to build or repair a credit score systematically over 12 months.',            pts:['The five scoring factors and their precise weights','Utilization: the fastest lever you can pull','A 12-month score improvement plan'] },
  { num:'007', d:[2026,6,28], mk:'2026-07', title:'Student Loans & Mortgages',        focus:'Repayment plan selection, refinance decisions, how amortization really works — and what your first mortgage payment actually pays.',    pts:['Income-driven repayment vs. standard: the break-even math','The amortization truth most borrowers never see','When to refinance each type of long-term debt'] },
  // AUGUST 2026 — Education & Family
  { num:'008', d:[2026,7,4],  mk:'2026-08', title:'The True Cost of College',         focus:'Education inflation, sticker vs. net price, and the planning math that determines if a school is actually affordable for your family.', pts:['Sticker price vs. net price: always get the real number','Education inflation rate vs. CPI — the long-run gap','The Expected Family Contribution calculation'] },
  { num:'009', d:[2026,7,11], mk:'2026-08', title:'529 Plans, Deep Dive',             focus:'Tax benefits, state deductions, superfunding, and the new SECURE 2.0 529-to-Roth rollover rule that changes the calculus on over-saving.', pts:['State income tax deductions: the overlooked benefit','Superfunding: the 5-year gift tax election','The 529-to-Roth rollover (SECURE 2.0) explained'] },
  { num:'010', d:[2026,7,18], mk:'2026-08', title:'Beyond the 529',                   focus:'Coverdell ESAs, UTMA/UGMA custodial accounts, and how each account type affects the FAFSA financial aid calculation.',                pts:['Coverdell ESA: what it does that a 529 cannot','UTMA/UGMA accounts and the kiddie tax rules','How account ownership affects your financial aid award'] },
  { num:'011', d:[2026,7,25], mk:'2026-08', title:'Teaching Kids Money',              focus:'Custodial Roth IRAs for working teens, allowances with intent, building financial literacy in the years it actually sticks.',           pts:['Custodial Roth IRA: the most powerful account a teenager can have','Allowance structures that build skills, not just spending habits','Age-appropriate financial conversations'] },
  // SEPTEMBER 2026 — Investing
  { num:'012', d:[2026,8,1],  mk:'2026-09', title:'Accounts Before Assets',           focus:'Taxable vs. tax-advantaged accounts, and the contribution order of operations that maximizes lifetime after-tax return.',              pts:['The account funding hierarchy — where every dollar should go first','The 401k employer match: the guaranteed 50–100% return','When to prioritize Roth vs. Traditional'] },
  { num:'013', d:[2026,8,8],  mk:'2026-09', title:'Risk Tolerance vs. Risk Capacity', focus:'Time horizon, the difference between tolerance (psychology) and capacity (math), and building an allocation that survives a bad year.', pts:['Tolerance vs. capacity: understanding the difference','How time horizon changes your real risk number','The allocation you can actually hold through a 40% drawdown'] },
  { num:'014', d:[2026,8,15], mk:'2026-09', title:'Diversification & Index Investing', focus:'Why low cost wins over time, the evidence for index funds, and the core-and-satellite approach for those who want more nuance.',     pts:['The fee math: why 1% matters enormously over 30 years','The case for total market indexing','Core-and-satellite: one framework for adding precision'] },
  { num:'015', d:[2026,8,22], mk:'2026-09', title:'Rebalancing & Behavior',            focus:'Staying disciplined, tax-aware rebalancing, and the behavioral mistakes that quietly cost most investors the most money.',            pts:['When and how to rebalance efficiently','Tax-aware rebalancing in taxable accounts','The DALBAR data: what behavior costs in real dollars'] },
  // OCTOBER 2026 — Estate Planning
  { num:'016', d:[2026,9,6],  mk:'2026-10', title:'The Documents Everyone Needs',     focus:'Will, power of attorney, healthcare directive, guardianship designations — the five documents every adult needs and most do not have.', pts:['The five essential estate planning documents','What happens without a will (state intestacy laws)','Guardianship: the decision most parents avoid until it\'s too late'] },
  { num:'017', d:[2026,9,13], mk:'2026-10', title:'Beneficiaries & Titling',          focus:'The silent will that overrides everything — beneficiary designations and account titling control more assets than most wills do.',      pts:['Why beneficiary designations supersede your will','The ex-spouse 401k problem (a real and common case)','The annual beneficiary audit: a 20-minute review that matters'] },
  { num:'018', d:[2026,9,20], mk:'2026-10', title:'Trusts 101',                       focus:'Revocable vs. irrevocable, when a trust earns its cost, and what probate avoidance is actually worth in your state.',                pts:['Revocable living trust: what it does and doesn\'t do','When a trust is worth the complexity and the cost','Probate: how bad is it, state by state?'] },
  { num:'019', d:[2026,9,27], mk:'2026-10', title:'Legacy & Taxes',                   focus:'Estate and gift tax basics, step-up in basis at death, and how to think about digital assets in the modern estate plan.',             pts:['Federal estate tax threshold and what it means for you','Step-up in basis: the silent tax gift at death','Digital assets: the most commonly overlooked estate issue'] },
  // NOVEMBER 2026 — Insurance & Benefits
  { num:'020', d:[2026,10,3], mk:'2026-11', title:'Open Enrollment Decoded',          focus:'HMO vs. PPO vs. HDHP, the HSA vs. FSA decision, and why the HDHP + HSA combination is systematically underused by most employees.',   pts:['HMO vs. PPO vs. HDHP: running the real math','HSA vs. FSA: why the HSA usually wins on every dimension','The break-even calculation for choosing your plan'] },
  { num:'021', d:[2026,10,10],mk:'2026-11', title:'Life Insurance, Properly',         focus:'Term vs. permanent, how to run an actual needs analysis, and why buy-term-and-invest-the-difference is the right math for most families.', pts:['Human Life Value: the calculation that sets the right number','Term vs. whole life: the real cost comparison','How much coverage your family actually needs'] },
  { num:'022', d:[2026,10,17],mk:'2026-11', title:'Disability & Income Protection',   focus:'The most overlooked coverage in planning — own-occupation vs. any-occupation, benefit periods, elimination periods, and how to shop it.', pts:['Why disability risk exceeds mortality risk before age 65','Own-occupation: the definition that actually protects you','Building the right policy: benefit amount, period, and definition'] },
  { num:'023', d:[2026,10,24],mk:'2026-11', title:'Property & Liability',             focus:'Homeowners/renters, auto, umbrella policies, coinsurance traps, and the $1M+ liability exposure most families are completely unaware of.', pts:['Umbrella policy: $1M of coverage for roughly $200/year','The coinsurance clause that can destroy a legitimate claim','The personal liability exposure nobody talks about'] },
  // DECEMBER 2026 — Year-End Tax
  { num:'024', d:[2026,11,1], mk:'2026-12', title:'Tax-Loss Harvesting',              focus:'Offsetting gains, the wash-sale rule, carrying losses forward, and the portfolio size at which systematic TLH becomes materially valuable.', pts:['How TLH turns paper losses into real after-tax returns','Wash-sale rule: the 30-day trap to avoid','Calculating the actual dollar value of your harvested losses'] },
  { num:'025', d:[2026,11,8], mk:'2026-12', title:'Charitable Giving Strategies',    focus:'Donor-advised funds, qualified charitable distributions, bunching deductions, and why gifting appreciated stock beats giving cash.',     pts:['Donor-advised fund: give now, direct later','QCD: the best charitable move for IRA holders over 70½','Gifting appreciated stock: why cash is the wrong asset to donate'] },
  { num:'026', d:[2026,11,15],mk:'2026-12', title:'Retirement Accounts at Year-End', focus:'Required minimum distributions, the last-chance Roth conversion window, and the year-end moves that close permanently on December 31.',  pts:['RMD: the rules, the penalties, and how to calculate yours','Year-end Roth conversion: filling the bracket before December 31','What you absolutely cannot undo after the year closes'] },
  { num:'027', d:[2026,11,22],mk:'2026-12', title:'The Year-End Checklist',           focus:'FSA spend-down, annual gifting, maxing contributions, and updating documents — a complete framework for closing the financial year clean.', pts:['The hard December 31 deadlines (a complete list)','Annual gift tax exclusion: $18,000 per recipient in 2024','The 15-minute financial close ritual'] },
  // JANUARY 2027 — Goals & Planning
  { num:'028', d:[2027,0,5],  mk:'2027-01', title:'Net Worth Baseline',               focus:'Setting the scoreboard you will measure the whole year against — the one financial document worth building and updating every January.',   pts:['Building your annual net worth snapshot','Productive vs. consumption assets: the distinction that matters','Setting your benchmark number for the year ahead'] },
  { num:'029', d:[2027,0,12], mk:'2027-01', title:'Goal Architecture',                focus:'Turning vague wishes into funded short-, mid-, and long-term goals with real dollar amounts, real timelines, and real accounts.',        pts:['The goal-to-funded-account mapping framework','Short / mid / long: building three distinct planning timelines','From "save more" to a specific monthly transfer amount'] },
  { num:'030', d:[2027,0,19], mk:'2027-01', title:'Automate Everything',              focus:'Paying yourself first, scheduling annual contribution increases, and building a financial system that runs without daily decisions.',       pts:['The pay-yourself-first structure that actually works','Auto-escalation: the 1% annual increase that changes retirement outcomes','What to set, forget, and review once a year'] },
  { num:'031', d:[2027,0,26], mk:'2027-01', title:'The Annual Financial Calendar',    focus:'What to review and when — taxes, rebalancing, insurance, beneficiaries — so nothing falls through the cracks across a full twelve months.', pts:['The twelve-month financial review schedule','Quarterly vs. annual review items: the complete list','Building the calendar into systems you already use'] },
  // FEBRUARY 2027 — Couples & Behavior
  { num:'032', d:[2027,1,2],  mk:'2027-02', title:'Money & Relationships',            focus:'Combining finances, the recurring money date, the yours/mine/ours framework, and how couples navigate financial disagreement productively.', pts:['Joint vs. separate vs. hybrid account structures','The monthly money date: agenda and structure','Navigating financial disagreement without it becoming conflict'] },
  { num:'033', d:[2027,1,9],  mk:'2027-02', title:'Behavioral Finance',               focus:'The biases that wreck good plans — loss aversion, recency bias, anchoring — and the structural defenses that reliably outperform willpower.', pts:['Loss aversion: the 2:1 asymmetry in every financial decision','Recency bias: why last year always feels permanent','Pre-commitment: the only defense that works when markets fall'] },
  { num:'034', d:[2027,1,16], mk:'2027-02', title:'Protecting the Household',         focus:'Coordinated beneficiaries, couples life insurance math, and the two-page "what if" plan every household should have on paper.',         pts:['Coordinating beneficiaries across both spouses\' accounts','The survivor income calculation','The two-page "what if" financial plan — what it covers'] },
  { num:'035', d:[2027,1,23], mk:'2027-02', title:'Planning Across Generations',      focus:'Supporting aging parents while building your own wealth — the sandwich generation squeeze and how to plan through it without sacrificing either.', pts:['The aging parent financial conversation (how to start it)','Medicare, long-term care, and the costs families don\'t model','Protecting your own retirement while supporting parents'] },
  // MARCH 2027 — Tax Prep
  { num:'036', d:[2027,2,2],  mk:'2027-03', title:'How Tax Brackets Actually Work',   focus:'Marginal vs. effective rates, the myths people repeat every filing season, and the number that actually determines your tax burden.',    pts:['Marginal vs. effective rate: the confusion that costs people money','What "moving into a higher bracket" actually means','Calculating your real effective tax rate'] },
  { num:'037', d:[2027,2,9],  mk:'2027-03', title:'Deductions vs. Credits',           focus:'Standard vs. itemized, above-the-line deductions available to everyone, and the credits that are worth far more than most people realize.', pts:['Standard vs. itemized: the break-even calculation','Above-the-line deductions you can take without itemizing','The credits that directly reduce tax owed — not just income'] },
  { num:'038', d:[2027,2,16], mk:'2027-03', title:'Last-Chance Contributions',        focus:'IRA and HSA prior-year contributions before April 15 — the one financial window that permanently closes at midnight on tax day.',        pts:['Prior-year IRA contribution: the April 15 deadline is hard','HSA prior-year contribution: often missed by even sophisticated savers','The compounded dollar impact of missing this window over a career'] },
  { num:'039', d:[2027,2,23], mk:'2027-03', title:'Tax-Smart Investing',              focus:'Asset location, qualified dividends, long- vs. short-term capital gains — the investment tax review that adds real after-tax return.',    pts:['Asset location: the return booster hiding in plain sight','Qualified vs. non-qualified dividends: why the distinction matters','Long-term vs. short-term: the rate difference that changes decisions'] },
  // APRIL 2027 — Retirement
  { num:'040', d:[2027,3,6],  mk:'2027-04', title:'How Much You Actually Need',       focus:'The replacement-ratio approach, the 4% rule and its modern critics, and how to calculate your real retirement number from the ground up.', pts:['The replacement ratio: 70–80% of income, or something else entirely','The 4% rule in 2024: what the research actually says now','Running the reverse calculation to find your specific number'] },
  { num:'041', d:[2027,3,13], mk:'2027-04', title:'The Account Lineup',               focus:'401(k), IRA, Roth — the contribution order of operations that maximizes lifetime after-tax retirement income for most households.',      pts:['The funding order: where every dollar goes first','The employer match as guaranteed return — always capture it','When to choose HSA over IRA contributions'] },
  { num:'042', d:[2027,3,20], mk:'2027-04', title:'Roth vs. Traditional',             focus:'The tax-diversification decision, the conversion window, and when paying taxes today beats deferring them for decades.',                pts:['The fundamental tax-rate bet in every Roth decision','The conversion window: ages 60–70, the most important tax planning years','Tax diversification: why having both is often the right answer'] },
  { num:'043', d:[2027,3,27], mk:'2027-04', title:'Social Security & Withdrawals',    focus:'Claiming strategy, the break-even calculation, sequence-of-returns risk — the decisions that determine whether your portfolio lasts.',   pts:['The 62 vs. 70 claiming decision — and the math for couples','The break-even age calculation (it\'s not 80)','Sequence of returns: the retirement risk most plans underestimate'] },
  // MAY 2027 — Financial Independence
  { num:'044', d:[2027,4,4],  mk:'2027-05', title:'Defining Your Number',             focus:'The FI math — lean vs. fat FIRE, Coast FIRE, and the framework for calculating your personal financial independence target.',           pts:['The 25x rule: total assets needed to be financially independent','Lean vs. fat FIRE: what floor does your spending require?','Coast FIRE: the calculation that changes how you think about work now'] },
  { num:'045', d:[2027,4,11], mk:'2027-05', title:'Building Income Streams',          focus:'Durable, diversified income beyond a paycheck — dividends, rental income, business cash flow, and the portfolio income framework.',      pts:['The four types of financial independence income','Dividend investing vs. total return: the ongoing debate settled','Sizing each income stream for reliability, not just return'] },
  { num:'046', d:[2027,4,18], mk:'2027-05', title:'The Withdrawal Engine',            focus:'Turning a portfolio into a paycheck, tax-efficiently — the bucket strategy, dynamic withdrawal rules, and the sequence-risk hedge.',     pts:['The bucket strategy in practice — not just in theory','Dynamic withdrawal guardrails: the Guyton-Klinger framework','Building a tax-efficient withdrawal sequence'] },
  { num:'047', d:[2027,4,25], mk:'2027-05', title:'The Mid-Year Reset Preview',       focus:'The annual review ritual — looping back into June and the full curriculum. A look at what to carry forward and what to change.',        pts:['The annual financial review checklist','What you have built across twelve months of the curriculum','Preparing to re-enter June with clarity and a better baseline'] },
]

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_HDRS    = ['SUN','MON','TUE','WED','THU','FRI','SAT']

function mKey(y, m) { return `${y}-${String(m+1).padStart(2,'0')}` }

function issueStatus(d) {
  const now  = new Date()
  const t    = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const date = new Date(d[0], d[1], d[2])
  if (date.getTime() === t.getTime()) return 'today'
  return date < t ? 'published' : 'upcoming'
}

function buildCells(year, month) {
  const firstDow  = new Date(year, month, 1).getDay()
  const daysInMo  = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMo; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL PANEL
// ─────────────────────────────────────────────────────────────────────────────
function DetailPanel({ issue, onClose }) {
  const theme  = THEMES[issue.mk]
  const status = issueStatus(issue.d)
  const date   = new Date(issue.d[0], issue.d[1], issue.d[2])
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const statusLabel = status === 'today' ? 'Publishing Today' : status === 'published' ? 'Published' : `Arrives ${date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`
  const statusColor = status === 'upcoming' ? P.inkMuted : status === 'today' ? P.today : P.pub

  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(26,20,16,0.5)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position:'absolute', right:0, top:0, bottom:0, width:420,
          background: P.win,
          borderLeft: `1px solid ${P.border}`,
          boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
          display:'flex', flexDirection:'column',
          overflowY:'auto',
        }}
      >
        {/* Panel title bar */}
        <div style={{
          background: P.bar,
          backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 1px,${P.barLine} 1px,${P.barLine} 2px)`,
          height: 34, display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 12px', flexShrink:0,
          borderBottom: `1px solid ${P.border}`,
        }}>
          <span style={{ fontFamily: CHROME, fontSize: 11, color: P.inkSoft, fontWeight:700, letterSpacing:'0.04em' }}>Issue Detail</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color: P.inkMuted, display:'flex', alignItems:'center' }}>
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding:'28px 28px 40px' }}>
          {/* Month theme badge */}
          <div style={{
            display:'inline-flex', alignItems:'center',
            background: theme.aLight, border:`1px solid ${theme.accent}40`,
            borderRadius:3, padding:'3px 10px', marginBottom:20,
          }}>
            <div style={{ width:6, height:6, borderRadius:1, background:theme.accent, marginRight:7, flexShrink:0 }} />
            <span style={{ fontSize:10, fontFamily:UI, fontWeight:700, color:theme.accent, textTransform:'uppercase', letterSpacing:'0.14em' }}>
              {theme.name}
            </span>
          </div>

          {/* Issue number */}
          <div style={{ fontFamily:MONO, fontSize:11, color:P.inkMuted, marginBottom:8, letterSpacing:'0.1em' }}>
            No. {issue.num}
          </div>

          {/* Title */}
          <h2 style={{ fontFamily:DISPLAY, fontSize:24, fontWeight:700, color:P.ink, margin:'0 0 16px', lineHeight:1.2, letterSpacing:'-0.01em' }}>
            {issue.title}
          </h2>

          {/* Date + status */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
            <span style={{ fontFamily:MONO, fontSize:11, color:P.inkMuted }}>{dateStr}</span>
            <span style={{
              fontFamily:UI, fontSize:10, fontWeight:700, color:statusColor,
              textTransform:'uppercase', letterSpacing:'0.1em',
              background: status==='upcoming' ? 'rgba(138,112,96,0.10)' : status==='today' ? P.todayBg : P.pubBg,
              borderRadius:3, padding:'2px 8px',
            }}>{statusLabel}</span>
          </div>

          {/* Divider */}
          <div style={{ height:1, background:P.grid, marginBottom:24 }} />

          {/* Focus */}
          <div style={{ fontSize:10, fontFamily:UI, fontWeight:700, color:P.inkMuted, textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:10 }}>
            This Issue Covers
          </div>
          <p style={{ fontSize:14, fontFamily:UI, color:P.inkSoft, lineHeight:1.8, margin:'0 0 24px' }}>
            {issue.focus}
          </p>

          {/* Points */}
          <div style={{ fontSize:10, fontFamily:UI, fontWeight:700, color:P.inkMuted, textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:12 }}>
            Key Takeaways
          </div>
          <ul style={{ margin:0, padding:0, listStyle:'none' }}>
            {issue.pts.map((pt, i) => (
              <li key={i} style={{ display:'flex', gap:10, marginBottom:12, alignItems:'flex-start' }}>
                <div style={{ width:16, height:16, borderRadius:2, background:theme.aLight, border:`1px solid ${theme.accent}50`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                  <span style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color:theme.accent }}>0{i+1}</span>
                </div>
                <span style={{ fontSize:13, fontFamily:UI, color:P.inkSoft, lineHeight:1.65 }}>{pt}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div style={{ marginTop:32 }}>
            {status === 'upcoming' ? (
              <div style={{ background:P.surf, border:`1px solid ${P.grid}`, borderRadius:4, padding:'12px 16px', textAlign:'center' }}>
                <span style={{ fontFamily:MONO, fontSize:11, color:P.inkMuted }}>Arrives {date.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span>
              </div>
            ) : (
              <button style={{
                width:'100%', background:theme.accent, border:'none', borderRadius:4,
                padding:'12px 20px', cursor:'pointer',
                fontFamily:UI, fontSize:13, fontWeight:700, color:'#F0E8D8',
                letterSpacing:'0.04em',
              }}>
                {status === 'today' ? 'Read the Letter' : 'Read the Letter'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MONTH VIEW
// ─────────────────────────────────────────────────────────────────────────────
function MonthView({ year, month, onSelectIssue }) {
  const cells    = useMemo(() => buildCells(year, month), [year, month])
  const key      = mKey(year, month)
  const theme    = THEMES[key]
  const now      = new Date()
  const isNowMo  = year === now.getFullYear() && month === now.getMonth()
  const todayD   = now.getDate()

  // index issues by day
  const issueByDay = {}
  ISSUES.forEach(iss => {
    if (iss.d[0] === year && iss.d[1] === month) issueByDay[iss.d[2]] = iss
  })

  // chunk into weeks
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i+7))

  return (
    <div style={{ padding:'0 0 8px' }}>
      {/* Month theme banner */}
      {theme && (
        <div style={{
          background: theme.aLight,
          borderBottom: `1px solid ${theme.accent}30`,
          padding:'10px 20px',
          display:'flex', alignItems:'center', gap:12,
        }}>
          <div style={{ width:8, height:8, borderRadius:1, background:theme.accent, flexShrink:0 }} />
          <div>
            <span style={{ fontFamily:CHROME, fontSize:11, fontWeight:700, color:theme.accent, letterSpacing:'0.08em', textTransform:'uppercase' }}>
              {MONTH_NAMES[month].toUpperCase()} — {theme.name.toUpperCase()}
            </span>
            <span style={{ fontFamily:UI, fontSize:11, color:P.inkMuted, marginLeft:12 }}>{theme.desc}</span>
          </div>
        </div>
      )}

      {/* Day headers */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:`1px solid ${P.grid}` }}>
        {DAY_HDRS.map(h => (
          <div key={h} style={{
            padding:'8px 0', textAlign:'center',
            fontFamily:CHROME, fontSize:9, fontWeight:700, color:P.inkMuted,
            letterSpacing:'0.14em',
            borderRight:`1px solid ${P.grid}`,
          }}>{h}</div>
        ))}
      </div>

      {/* Calendar grid */}
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:`1px solid ${P.grid}` }}>
          {week.map((day, di) => {
            const issue    = day ? issueByDay[day] : null
            const isToday  = isNowMo && day === todayD
            const isPast   = day && (year < now.getFullYear() || (year === now.getFullYear() && (month < now.getMonth() || (month === now.getMonth() && day < todayD))))
            const status   = issue ? issueStatus(issue.d) : null

            return (
              <div key={di} style={{
                minHeight: 88,
                borderRight: `1px solid ${P.grid}`,
                padding:'6px 6px 8px',
                background: isToday ? P.todayBg : day ? 'transparent' : `${P.bar}30`,
                opacity: !day ? 0.4 : isPast && !isToday ? 0.75 : 1,
                position:'relative',
              }}>
                {/* Day number */}
                {day && (
                  <div style={{
                    fontFamily:MONO, fontSize:11, fontWeight:700,
                    color: isToday ? P.today : P.inkMuted,
                    display:'inline-flex', alignItems:'center', justifyContent:'center',
                    width:22, height:22, borderRadius:2,
                    background: isToday ? P.todayBg : 'transparent',
                    border: isToday ? `1.5px solid ${P.today}` : 'none',
                    marginBottom:4,
                  }}>{day}</div>
                )}

                {/* Issue chip */}
                {issue && (
                  <div
                    onClick={() => onSelectIssue(issue)}
                    style={{
                      background: theme ? theme.aLight : P.surf,
                      borderLeft: `3px solid ${theme ? theme.accent : P.inkMuted}`,
                      borderRadius:'0 3px 3px 0',
                      padding:'4px 6px',
                      cursor:'pointer',
                      opacity: status === 'upcoming' ? 0.75 : 1,
                    }}
                  >
                    <div style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color:theme ? theme.accent : P.inkMuted, letterSpacing:'0.08em', marginBottom:2 }}>
                      No. {issue.num} {status === 'today' ? '· TODAY' : status === 'published' ? '· PUB' : ''}
                    </div>
                    <div style={{ fontFamily:UI, fontSize:10, fontWeight:600, color:P.inkSoft, lineHeight:1.25 }}>
                      {issue.title}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENDA VIEW
// ─────────────────────────────────────────────────────────────────────────────
function AgendaView({ onSelectIssue }) {
  // group by month key
  const groups = useMemo(() => {
    const map = {}
    ISSUES.forEach(iss => {
      if (!map[iss.mk]) map[iss.mk] = []
      map[iss.mk].push(iss)
    })
    return Object.entries(map).sort(([a],[b]) => a < b ? -1 : 1)
  }, [])

  return (
    <div style={{ padding:'4px 0 24px' }}>
      {groups.map(([mk, issues]) => {
        const theme = THEMES[mk]
        return (
          <div key={mk}>
            {/* Month header */}
            <div style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'14px 20px 10px',
              background: theme.aLight,
              borderBottom:`1px solid ${theme.accent}25`,
              borderTop:`1px solid ${P.grid}`,
            }}>
              <div style={{ width:8, height:8, borderRadius:1, background:theme.accent, flexShrink:0 }} />
              <span style={{ fontFamily:CHROME, fontSize:10, fontWeight:700, color:theme.accent, textTransform:'uppercase', letterSpacing:'0.12em' }}>
                {mk.replace('-',' — ').replace(/(\d{4})-(\d{2})/, (_, y, m) => {
                  const mn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m)-1]
                  return `${mn} ${y}`
                })}
              </span>
              <span style={{ fontFamily:UI, fontSize:11, color:P.inkMuted, fontStyle:'italic' }}>— {theme.name}</span>
            </div>

            {/* Issue rows */}
            {issues.map((iss, i) => {
              const status = issueStatus(iss.d)
              const date   = new Date(iss.d[0], iss.d[1], iss.d[2])
              const dateStr = date.toLocaleDateString('en-US',{month:'short',day:'numeric'})
              const isLast  = i === issues.length - 1

              return (
                <div
                  key={iss.num}
                  onClick={() => onSelectIssue(iss)}
                  style={{
                    display:'grid', gridTemplateColumns:'56px 60px 1fr auto',
                    alignItems:'start', gap:'0 16px',
                    padding:'12px 20px',
                    borderBottom: isLast ? 'none' : `1px solid ${P.grid}40`,
                    cursor:'pointer',
                    background:'transparent',
                    transition:'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = P.surf}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Date */}
                  <span style={{ fontFamily:MONO, fontSize:10, color:P.inkMuted, paddingTop:2 }}>{dateStr}</span>
                  {/* Issue num */}
                  <span style={{ fontFamily:MONO, fontSize:10, fontWeight:700, color:theme.accent, paddingTop:2 }}>No. {iss.num}</span>
                  {/* Title + focus */}
                  <div>
                    <div style={{ fontFamily:UI, fontSize:13, fontWeight:700, color:P.ink, marginBottom:3 }}>{iss.title}</div>
                    <div style={{ fontFamily:UI, fontSize:11, color:P.inkMuted, lineHeight:1.5 }}>{iss.focus.slice(0,90)}{iss.focus.length > 90 ? '…' : ''}</div>
                  </div>
                  {/* Status */}
                  <span style={{
                    fontFamily:UI, fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em',
                    color: status==='upcoming' ? P.inkMuted : status==='today' ? P.today : P.pub,
                    whiteSpace:'nowrap', paddingTop:3,
                  }}>
                    {status === 'today' ? 'Today' : status === 'published' ? 'Published' : 'Upcoming'}
                  </span>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function PlanningLetter() {
  const navigate = useNavigate()
  const now      = new Date()
  const [view, setView]       = useState('month')
  const [navYear, setNavYear] = useState(now.getFullYear())
  const [navMonth, setNavMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState(null)

  const key   = mKey(navYear, navMonth)
  const theme = THEMES[key]

  function prev() {
    if (navMonth === 0) { setNavYear(y => y-1); setNavMonth(11) }
    else setNavMonth(m => m-1)
  }
  function next() {
    if (navMonth === 11) { setNavYear(y => y+1); setNavMonth(0) }
    else setNavMonth(m => m+1)
  }
  function goToday() { setNavYear(now.getFullYear()); setNavMonth(now.getMonth()) }

  const isNowMo = navYear === now.getFullYear() && navMonth === now.getMonth()

  // Clamp to issue range (Jun 2026 – May 2027)
  const canPrev = !(navYear === 2026 && navMonth === 5)
  const canNext = !(navYear === 2027 && navMonth === 4)

  return (
    <div style={{ background: P.page, minHeight:'100vh', fontFamily:UI }}>

      {/* Top breadcrumb */}
      <div style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'16px 28px', borderBottom:'1px solid #2a2018',
      }}>
        <button
          onClick={() => navigate('/hub')}
          style={{
            width:28, height:28, borderRadius:6,
            background:'#c9a96e', border:'none', cursor:'pointer',
            fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:900, color:'#1a1410',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}
        >P</button>
        <span style={{ fontSize:11, color:'#6b5540', fontFamily:UI }}>›</span>
        <span style={{ fontSize:12, color:'#a89070', fontFamily:UI, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>
          The Planning Letter
        </span>
        <span style={{ fontSize:11, color:'#3d3028', fontFamily:UI, marginLeft:'auto' }}>
          Weekly · June 2026 – May 2027 · 47 issues
        </span>
      </div>

      {/* Mac Window */}
      <div style={{ maxWidth:1160, margin:'0 auto', padding:'36px 24px 80px' }}>
        <div style={{
          background: P.win,
          border: `1px solid ${P.border}`,
          borderRadius: 5,
          boxShadow: '0 12px 60px rgba(0,0,0,0.55), 0 3px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
          overflow:'hidden',
        }}>

          {/* ── Title bar ── */}
          <div style={{
            background: P.bar,
            backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 1px,${P.barLine} 1px,${P.barLine} 2px)`,
            height:36, display:'flex', alignItems:'center',
            padding:'0 12px',
            borderBottom:`1px solid ${P.border}`,
            position:'relative', userSelect:'none',
          }}>
            {/* Traffic lights */}
            <div style={{ display:'flex', gap:6, zIndex:1 }}>
              <button
                onClick={() => navigate(-1)}
                title="Close"
                style={{
                  width:13, height:13, borderRadius:3, background:'#C0392B',
                  border:'1px solid rgba(0,0,0,0.18)', flexShrink:0,
                  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                  padding:0,
                }}
              >
                <X size={8} color="#7a1010" strokeWidth={3} />
              </button>
              {['#C9A96E','#4A7C59'].map((c,i) => (
                <div key={i} style={{ width:13, height:13, borderRadius:3, background:c, border:'1px solid rgba(0,0,0,0.18)', flexShrink:0 }} />
              ))}
            </div>

            {/* Centered window title */}
            <div style={{
              position:'absolute', left:'50%', transform:'translateX(-50%)',
              fontFamily:CHROME, fontSize:12, fontWeight:700, color:P.inkSoft,
              letterSpacing:'0.04em', whiteSpace:'nowrap',
            }}>
              The Planning Letter — 2026–2027
            </div>

            {/* View toggle */}
            <div style={{ marginLeft:'auto', display:'flex', gap:3, zIndex:1 }}>
              {[{v:'month',l:'Month'},{v:'agenda',l:'Agenda'}].map(({v,l}) => (
                <button key={v} onClick={() => setView(v)} style={{
                  background: view===v ? P.inkSoft : 'transparent',
                  border: `1px solid ${P.grid}`,
                  borderRadius:2, padding:'2px 10px',
                  fontSize:10, fontFamily:CHROME, fontWeight:700,
                  color: view===v ? P.win : P.inkMuted,
                  cursor:'pointer', letterSpacing:'0.08em',
                  textTransform:'uppercase',
                }}>{l}</button>
              ))}
            </div>
          </div>

          {/* ── Month nav (shown in month view) ── */}
          {view === 'month' && (
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'10px 16px', borderBottom:`1px solid ${P.grid}`,
              background: P.surf,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <button onClick={prev} disabled={!canPrev} style={{
                  background:'none', border:`1px solid ${P.grid}`, borderRadius:2,
                  width:26, height:26, cursor: canPrev ? 'pointer':'default',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color: canPrev ? P.inkSoft : P.grid, opacity: canPrev ? 1 : 0.4,
                }}><ChevronLeft size={14}/></button>

                <span style={{ fontFamily:CHROME, fontSize:13, fontWeight:700, color:P.ink, letterSpacing:'0.05em', minWidth:140, textAlign:'center' }}>
                  {MONTH_NAMES[navMonth].toUpperCase()} {navYear}
                </span>

                <button onClick={next} disabled={!canNext} style={{
                  background:'none', border:`1px solid ${P.grid}`, borderRadius:2,
                  width:26, height:26, cursor: canNext ? 'pointer':'default',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color: canNext ? P.inkSoft : P.grid, opacity: canNext ? 1 : 0.4,
                }}><ChevronRight size={14}/></button>
              </div>

              {/* Today button */}
              {!isNowMo && (
                <button onClick={goToday} style={{
                  background:'none', border:`1px solid ${P.grid}`, borderRadius:2,
                  padding:'3px 12px', cursor:'pointer',
                  fontFamily:CHROME, fontSize:10, fontWeight:700, color:P.today,
                  letterSpacing:'0.08em', textTransform:'uppercase',
                }}>Today</button>
              )}
            </div>
          )}

          {/* ── Content ── */}
          <div style={{ maxHeight:'calc(100vh - 260px)', overflowY:'auto' }}>
            {view === 'month'
              ? <MonthView year={navYear} month={navMonth} onSelectIssue={setSelected} />
              : <AgendaView onSelectIssue={setSelected} />
            }
          </div>

        </div>

        {/* Below-window note */}
        <div style={{ textAlign:'center', marginTop:20 }}>
          <span style={{ fontFamily:UI, fontSize:11, color:'#3d3028' }}>
            Cadence: Weekly on Tuesdays · {ISSUES.length} issues across 12 months · Click any issue to preview
          </span>
        </div>
      </div>

      {/* Detail panel */}
      {selected && <DetailPanel issue={selected} onClose={() => setSelected(null)} />}

      <style>{`
        @media (max-width: 700px) {
          .pl-win { padding: 12px 8px 40px !important; }
        }
      `}</style>
    </div>
  )
}
