import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Play, Clock, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'

const DISPLAY = "'Playfair Display', Georgia, serif"
const UI      = "'Inter', system-ui, sans-serif"
const MONO    = "'JetBrains Mono', 'Courier New', monospace"

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Server uses slightly different topic names for 2 topics — normalize them
const SERVER_TO_FEED_TOPIC = {
  'Wealth Building and Financial Planning': 'Wealth Building',
  'Behavioral Finance and Money Psychology': 'Behavioral Finance',
}
function normalizeServerTopic(t) { return SERVER_TO_FEED_TOPIC[t] || t }

function getVideosForTopic(ytData, topicName) {
  if (!ytData?.creators) return []
  const videos = []
  for (const { videos: cv } of Object.values(ytData.creators)) {
    for (const v of (cv || [])) {
      if (normalizeServerTopic(v.topic) === topicName) videos.push(v)
    }
  }
  return videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
}

function getVideosForCreator(ytData, creatorId) {
  if (!ytData?.creators || creatorId === 'all') return null
  return (ytData.creators[creatorId]?.videos || [])
}

function videoAgo(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (days < 1)  return 'Today'
  if (days < 7)  return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

// ── Category → Topic mapping
const CATEGORY_TOPIC = {
  'Market Intelligence': 'Investing and Market Education',
  'Tax Strategy':        'Tax Planning and Strategy',
  'Retirement Planning': 'Retirement Planning',
  'Behavioral Finance':  'Behavioral Finance',
  'Wealth Building':     'Wealth Building',
  'Insurance Planning':  'Insurance Planning',
  'Real Estate':         'Real Estate Investing',
  'Macro Economics':     'Investing and Market Education',
  'Business Planning':   'Wealth Building',
  'Social Security':     'Retirement Planning',
  'Estate Planning':     'Estate Planning and Trusts',
  'Family Planning':     'Budgeting and Cash Flow',
}

const TOPIC_GRADIENTS = {
  'Wealth Building':                    'linear-gradient(135deg, #2a1a06 0%, #1e1710 55%, #231c0d 100%)',
  'Investing and Market Education':     'linear-gradient(135deg, #061a0a 0%, #1a1410 55%, #0d1a12 100%)',
  'Tax Planning and Strategy':          'linear-gradient(135deg, #0d0a1a 0%, #1a1410 55%, #10101e 100%)',
  'Retirement Planning':                'linear-gradient(135deg, #1a0e06 0%, #1e1610 55%, #2a1c0e 100%)',
  'Behavioral Finance':                 'linear-gradient(135deg, #160808 0%, #1a1410 55%, #1e1210 100%)',
  'Estate Planning and Trusts':         'linear-gradient(135deg, #080e12 0%, #1a1410 55%, #0c1416 100%)',
  'Real Estate Investing':              'linear-gradient(135deg, #0e0d08 0%, #1a1410 55%, #14120a 100%)',
  'Insurance Planning':                 'linear-gradient(135deg, #080e1a 0%, #1a1410 55%, #0c1018 100%)',
  'Budgeting and Cash Flow':            'linear-gradient(135deg, #100814 0%, #1a1410 55%, #140e16 100%)',
  'Debt Elimination and Behavioral Change': 'linear-gradient(135deg, #180606 0%, #1a1410 55%, #1c1010 100%)',
  'Military and Government Benefits':   'linear-gradient(135deg, #060e06 0%, #1a1410 55%, #0a0e0a 100%)',
}

function getArticleTopic(article) {
  return CATEGORY_TOPIC[article.category] || article.category
}

function getArticlesForTopic(topicName) {
  return ALL_INSIGHTS.filter(a => getArticleTopic(a) === topicName)
}

function getThumbnail(article) {
  return TOPIC_GRADIENTS[getArticleTopic(article)] || 'linear-gradient(135deg, #2a1a06 0%, #1a1410 100%)'
}

// ── Topic sections
const TOPIC_SECTIONS = [
  { id: 'wealth-building',  name: 'Wealth Building and Financial Planning',  topic: 'Wealth Building',                     sub: 'Strategies and systems to build lasting wealth and financial security.' },
  { id: 'investing',        name: 'Investing and Market Education',           topic: 'Investing and Market Education',      sub: 'Market mechanics, portfolio theory, and institutional-grade analytics.' },
  { id: 'tax-planning',     name: 'Tax Planning and Strategy',                topic: 'Tax Planning and Strategy',           sub: 'Smart tax strategies to keep more of what you earn.' },
  { id: 'retirement',       name: 'Retirement Planning',                      topic: 'Retirement Planning',                 sub: 'Income planning, withdrawal strategies, and Social Security optimization.' },
  { id: 'behavioral',       name: 'Behavioral Finance and Psychology',        topic: 'Behavioral Finance',                  sub: 'Understanding the cognitive biases that drive financial decisions.' },
  { id: 'estate',           name: 'Estate Planning and Trusts',               topic: 'Estate Planning and Trusts',          sub: 'Asset transfer, beneficiary planning, and wealth legacy structures.' },
  { id: 'real-estate',      name: 'Real Estate Investing',                    topic: 'Real Estate Investing',               sub: 'The economics of property ownership, from rent vs. buy to investment.' },
  { id: 'insurance',        name: 'Insurance Planning',                       topic: 'Insurance Planning',                  sub: 'Income protection and risk transfer strategies for every stage of life.' },
  { id: 'budgeting',        name: 'Budgeting and Cash Flow',                  topic: 'Budgeting and Cash Flow',             sub: 'Foundational cash flow systems that make saving automatic.' },
  { id: 'debt',             name: 'Debt Elimination',                         topic: 'Debt Elimination and Behavioral Change', sub: 'The structured path from financial pressure to wealth accumulation.' },
  { id: 'military',         name: 'Military and Government Benefits',         topic: 'Military and Government Benefits',    sub: 'TSP, VA loans, BRS, and the full landscape of service member benefits.' },
]

// ── Creators for filter bar
const CREATORS_FILTER = [
  { id: 'all',                   name: 'All Creators' },
  { id: 'money-guy',             name: 'The Money Guy' },
  { id: 'diamond-nestegg',       name: 'Diamond NestEgg' },
  { id: 'rob-berger',            name: 'Rob Berger' },
  { id: 'ramsey-show',           name: 'Ramsey Solutions' },
  { id: 'plain-bagel',           name: 'The Plain Bagel' },
  { id: 'clearvalue-tax',        name: 'ClearValue Tax' },
  { id: 'military-money-manual', name: 'Military Money Manual' },
  { id: 'military-to-millionaire','name': 'Mil. to Millionaire' },
  { id: 'caleb-hammer',          name: 'Caleb Hammer' },
  { id: 'ramit-sethi',           name: 'Ramit Sethi' },
  { id: 'whiteboard-finance',    name: 'WhiteBoard Finance' },
  { id: 'humphrey-yang',         name: 'Humphrey Yang' },
  { id: 'financial-diet',        name: 'The Financial Diet' },
  { id: 'budgetnista',           name: 'The Budgetnista' },
  { id: 'graham-stephan',        name: 'Graham Stephan' },
]

// ── Full creator profiles data
const CREATORS_DATA = [
  {
    id: 'money-guy',
    name: 'The Money Guy Show',
    handle: '@MoneyGuyShow',
    initials: 'MG',
    color: '#c9a96e',
    subscribers: '1.4M',
    avatar: 'https://yt3.ggpht.com/lBMDs2uWynRVfdkPeGU4RrZMBpMPiZYvfc3YPt4u5e12BKauK8_2Zu3dncl6ou5KNagDBVjb-w=s240-c-k-c0x00ffffff-no-rj',
    bio: 'Brian Preston (CFP®, CPA) and Bo Hanson (CFP®) host one of the most rigorous financial education shows in the industry. Their Financial Order of Operations gives listeners a sequenced playbook for building wealth at every income level — from first paycheck to seven-figure portfolio.',
    philosophy: '"Follow the Financial Order of Operations — maximize every dollar in the right sequence before moving to the next step."',
    focus: ['Wealth Building', 'Investing and Market Education', 'Retirement Planning'],
    knownFor: [
      'Financial Order of Operations (FOO) framework',
      'Wealth Multiplier by Age charts',
      'Mutant Index Fund strategy',
      'Long-form deep dives on portfolio construction',
    ],
    topics: ['Wealth Building', 'Investing and Market Education'],
  },
  {
    id: 'diamond-nestegg',
    name: 'Diamond NestEgg',
    handle: '@DiamondNestEgg',
    initials: 'DN',
    color: '#00B4C6',
    subscribers: '800K',
    avatar: 'https://yt3.ggpht.com/EfjtIA_266BxRzn3PWv8ptk50X1pa_X6hli-rkpZpoP3jksQCOgpjhIqma4SgoXbz6ruwsuyPw=s240-c-k-c0x00ffffff-no-rj',
    bio: 'Jennifer is a CFP® specializing in retirement income planning. She cuts through the complexity of Social Security optimization, Medicare decision trees, and sequence-of-returns risk — helping pre-retirees build income plans that actually last.',
    philosophy: '"Retirement is not a finish line — it\'s a 30-year income planning problem that requires as much precision as any investment decision."',
    focus: ['Retirement Planning', 'Budgeting and Cash Flow'],
    knownFor: [
      'Social Security filing strategies',
      'Medicare decision guides',
      'Retirement income sequencing',
      'Portfolio withdrawal order optimization',
    ],
    topics: ['Retirement Planning', 'Budgeting and Cash Flow'],
  },
  {
    id: 'rob-berger',
    name: 'Rob Berger',
    handle: '@robberger',
    initials: 'RB',
    color: '#818cf8',
    subscribers: '600K',
    avatar: 'https://yt3.ggpht.com/ytc/AIdro_lHTXd8-BvmgqlSbcIPche2Y4TA6BSZg3JGJrX0-KwZIww=s240-c-k-c0x00ffffff-no-rj',
    bio: 'Rob Berger is a former federal appellate attorney turned personal finance educator. He advocates for simple, low-cost index fund investing and systematically debunks complex financial products that consistently underperform basic market exposure.',
    philosophy: '"Complexity in investing is not a feature — it\'s almost always a cost. The simplest portfolio that lets you stay invested wins."',
    focus: ['Investing and Market Education', 'Retirement Planning'],
    knownFor: [
      'Three-fund portfolio framework',
      'Fee and expense analysis',
      'Retirement account strategy comparisons',
      'Calm, evidence-based long-form education',
    ],
    topics: ['Investing and Market Education', 'Retirement Planning'],
  },
  {
    id: 'ramsey-show',
    name: 'Ramsey Solutions',
    handle: '@DaveRamsey',
    initials: 'RS',
    color: '#f59e0b',
    subscribers: '6.1M',
    avatar: 'https://yt3.ggpht.com/kem-4taTSvkxVfkijZy3vaOSFHi75TkRefec2EWi_F--K_wHfpOHZzS_RfyGTOgAzk7B0fzM=s240-c-k-c0x00ffffff-no-rj',
    bio: 'Dave Ramsey built a financial media empire around the psychology of debt payoff. His Baby Steps system is the most widely followed debt elimination framework in America — prioritizing behavioral momentum and emotional wins over pure mathematical optimization.',
    philosophy: '"Personal finance is 80% behavior and 20% head knowledge. You know what to do — the question is whether you\'ll do it."',
    focus: ['Debt Elimination and Behavioral Change', 'Budgeting and Cash Flow'],
    knownFor: [
      'Baby Steps debt elimination system',
      'Debt snowball vs. avalanche debate',
      'Emergency fund discipline',
      'Zero-based budgeting methodology',
    ],
    topics: ['Debt Elimination and Behavioral Change', 'Budgeting and Cash Flow'],
  },
  {
    id: 'plain-bagel',
    name: 'The Plain Bagel',
    handle: '@ThePlainBagel',
    initials: 'PB',
    color: '#4a8c6a',
    subscribers: '1.1M',
    avatar: 'https://yt3.ggpht.com/ytc/AIdro_lP44aDeBvzShX0gPVRsL9UYY7_VlGf0CG0I9PDaHib0Vw=s240-c-k-c0x00ffffff-no-rj',
    bio: 'Richard Coffin, CFA, brings institutional-grade investment analysis to retail investors. His content examines market mechanics, valuation methods, and common investing myths with the kind of rigorous, balanced thinking you expect from a CFA charterholder.',
    philosophy: '"Good investment decisions come from understanding the evidence — not from following the loudest voice in the room."',
    focus: ['Investing and Market Education', 'Behavioral Finance'],
    knownFor: [
      'CFA-level market mechanics explainers',
      'Debunking financial media myths',
      'Valuation and stock analysis frameworks',
      'Calm, balanced perspective on market news',
    ],
    topics: ['Investing and Market Education', 'Behavioral Finance'],
  },
  {
    id: 'clearvalue-tax',
    name: 'ClearValue Tax',
    handle: '@ClearValueTax',
    initials: 'CV',
    color: '#a78bfa',
    subscribers: '900K',
    avatar: 'https://yt3.ggpht.com/jNXmuVXGvh23GkOvT0NM9BbsnIhclGkfUwalkOjSb9K4pzmgEWpHERG8DxBWVMyok632vxhr=s240-c-k-c0x00ffffff-no-rj',
    bio: 'Brian Kim, CPA, translates dense IRS code into actionable tax strategies. He covers Roth conversions, tax-loss harvesting, self-employment taxes, and legislative changes in real time — with the accuracy you expect from a licensed accountant.',
    philosophy: '"The best tax strategy is the one executed consistently across decades — not the clever one you do once and forget."',
    focus: ['Tax Planning and Strategy', 'Investing and Market Education'],
    knownFor: [
      'Roth conversion and backdoor Roth walkthroughs',
      'Real-time IRS and tax law updates',
      'Self-employment tax optimization',
      'Tax-loss harvesting step-by-step',
    ],
    topics: ['Tax Planning and Strategy'],
  },
  {
    id: 'military-money-manual',
    name: 'Military Money Manual',
    handle: '@MilMoneyManual',
    initials: 'MM',
    color: '#5ba05a',
    subscribers: '200K',
    avatar: 'https://yt3.ggpht.com/ytc/AIdro_m3rbl40fRLPrD03uOR4Zj4-MPppqyX9uTpTshpQKISWA=s240-c-k-c0x00ffffff-no-rj',
    bio: 'Spencer Reese is a military officer who built the definitive resource for service member financial planning. He covers the Blended Retirement System, TSP optimization, VA loan strategy, and military-specific investment opportunities unavailable to civilians.',
    philosophy: '"Military compensation is far more valuable than your LES shows — if you know how to capture every benefit available to you."',
    focus: ['Military and Government Benefits', 'Investing and Market Education'],
    knownFor: [
      'Blended Retirement System (BRS) deep dives',
      'TSP fund selection and lifecycle strategy',
      'VA loan maximization',
      'SDP, Series I bonds for service members',
    ],
    topics: ['Military and Government Benefits', 'Investing and Market Education'],
  },
  {
    id: 'military-to-millionaire',
    name: 'Military to Millionaire',
    handle: '@Mil2Millionaire',
    initials: 'M2',
    color: '#8aab3f',
    subscribers: '150K',
    avatar: 'https://yt3.ggpht.com/SS0NoOZEXEd10sXx6ifMcVGO9-G_dlGDgAiDwPDeql111K2P_e2bEYNN2vm3_RDbrh25ye0tH5o=s240-c-k-c0x00ffffff-no-rj',
    bio: 'David Pere is a Marine veteran who used house hacking and VA loans to build a multimillion-dollar real estate portfolio on a military salary. He teaches service members how to invest in real estate aggressively during their active-duty years.',
    philosophy: '"Your VA loan entitlement is one of the most powerful wealth-building tools in existence. Use it — then use it again."',
    focus: ['Real Estate Investing', 'Military and Government Benefits'],
    knownFor: [
      'VA loan house hacking strategy',
      'Building rental portfolios on military pay',
      'Short-term rental (STR) with military relocation',
      'Financial independence during active duty',
    ],
    topics: ['Real Estate Investing', 'Military and Government Benefits'],
  },
  {
    id: 'caleb-hammer',
    name: 'Caleb Hammer',
    handle: '@CalebHammer',
    initials: 'CH',
    color: '#e05252',
    subscribers: '1.1M',
    avatar: 'https://yt3.ggpht.com/gW5N5sL574VGFhCfRXh5Hkmr2B3f6iQZPiIDue7xMZLtBbyCv4oGZzhO6TUeof_V2lssYT06=s240-c-k-c0x00ffffff-no-rj',
    bio: 'Caleb Hammer is known for his "Financial Audit" series — dissecting real people\'s financial situations with surgical honesty. No sugarcoating, no comfortable advice. His approach is clinical, direct, and focused on behavioral root causes rather than surface symptoms.',
    philosophy: '"You don\'t have a math problem — you have a behavior problem. Fix the behavior and the math fixes itself."',
    focus: ['Debt Elimination and Behavioral Change', 'Budgeting and Cash Flow'],
    knownFor: [
      'Financial Audit series (real people, real numbers)',
      'Unfiltered income and expense analysis',
      'Behavioral debt elimination coaching',
      'Confronting lifestyle inflation directly',
    ],
    topics: ['Debt Elimination and Behavioral Change', 'Budgeting and Cash Flow'],
  },
  {
    id: 'ramit-sethi',
    name: 'Ramit Sethi',
    handle: '@ramit',
    initials: 'RS',
    color: '#5b8dd9',
    subscribers: '1.0M',
    avatar: 'https://yt3.ggpht.com/TNDXw7bE4ca7aZCW6O3JyD1cUNdMAZrXbX8AxP8ukSvAld2-a3R-tRKFgDCkx31djchMRffj=s240-c-k-c0x00ffffff-no-rj',
    bio: 'Ramit Sethi, NYT bestselling author of "I Will Teach You to Be Rich," focuses on automating wealth systems and spending guilt-free on what you love while cutting ruthlessly on what you don\'t. He reframes money as a tool for designing your Rich Life.',
    philosophy: '"Spend extravagantly on the things you love and cut mercilessly on the things you don\'t. Money is a tool for living a Rich Life — not a scorecard."',
    focus: ['Wealth Building', 'Behavioral Finance'],
    knownFor: [
      'Conscious spending plan (CSP) framework',
      'Automating savings and investments',
      'Rich Life philosophy — guilt-free spending',
      '"I Will Teach You to Be Rich" bestseller',
    ],
    topics: ['Wealth Building', 'Behavioral Finance'],
  },
  {
    id: 'whiteboard-finance',
    name: 'WhiteBoard Finance',
    handle: '@WhiteBoardFinance',
    initials: 'WF',
    color: '#22a7d4',
    subscribers: '1.5M',
    avatar: 'https://yt3.ggpht.com/h2F7mSJ7h7OyuL0ptZncQmEOwkNfFHAuVbhA7XhyTf7sukW7e_M9uZTGPlSMR6vNfYrvrF7H6g=s240-c-k-c0x00ffffff-no-rj',
    bio: 'Marko uses whiteboard-style visual breakdowns to demystify complex financial concepts. He covers dividend investing, real estate analysis, and building multiple income streams — with a practical, numbers-first approach to reaching financial independence.',
    philosophy: '"Financial independence is not a dream — it\'s a math problem. Build enough passive income to cover your expenses and you\'re free."',
    focus: ['Investing and Market Education', 'Real Estate Investing'],
    knownFor: [
      'Visual whiteboard explainers for investing concepts',
      'Dividend portfolio construction',
      'Real estate ROI analysis',
      'FIRE and financial independence case studies',
    ],
    topics: ['Investing and Market Education', 'Real Estate Investing'],
  },
  {
    id: 'humphrey-yang',
    name: 'Humphrey Yang',
    handle: '@HumphreyTalks',
    initials: 'HY',
    color: '#f97316',
    subscribers: '1.8M',
    avatar: 'https://yt3.ggpht.com/IbdZPiJ_gHLt6441V-RoqvzREItCeGTEqHk56laln-ZuvsDeBYaJHbGz79MDOvJtdaQihVcaNw=s240-c-k-c0x00ffffff-no-rj',
    bio: 'Humphrey Yang makes personal finance accessible through short, data-driven videos. He focuses on making the complex simple — explaining compound interest, credit scores, and index funds to millions of younger investors starting their financial journey.',
    philosophy: '"The most powerful thing in investing is time. Start simple, start now, stay consistent — let compound interest do the heavy lifting."',
    focus: ['Investing and Market Education', 'Budgeting and Cash Flow'],
    knownFor: [
      'Short-form financial education for beginners',
      'Data visualization of compound interest',
      'Credit score and credit card explainers',
      'Beginner brokerage and index fund walkthroughs',
    ],
    topics: ['Investing and Market Education', 'Budgeting and Cash Flow'],
  },
  {
    id: 'financial-diet',
    name: 'The Financial Diet',
    handle: '@TheFinancialDiet',
    initials: 'FD',
    color: '#d4619a',
    subscribers: '1.3M',
    avatar: 'https://yt3.ggpht.com/L06r2jBxDBRSQM7fXM534vS_zfIotz1dH4ILN7ol0d4qR_9AQ-G3axDoAP0z2VIVPCxiZ3K4oQ=s240-c-k-c0x00ffffff-no-rj',
    bio: 'Chelsea Fagan co-founded The Financial Diet to address the intersection of money, lifestyle, and psychology — particularly for women. TFD covers budgeting systems, career negotiation, housing decisions, and the emotional relationship most people have with spending.',
    philosophy: '"Financial health is not about deprivation — it\'s about aligning your money with your actual values, not the values you\'re supposed to have."',
    focus: ['Budgeting and Cash Flow', 'Behavioral Finance'],
    knownFor: [
      'Lifestyle finance and money psychology',
      'Career and salary negotiation content',
      'Women and money editorial series',
      '"The Financial Diet" bestselling book',
    ],
    topics: ['Budgeting and Cash Flow', 'Behavioral Finance'],
  },
  {
    id: 'budgetnista',
    name: 'The Budgetnista',
    handle: '@TheBudgetnista',
    initials: 'TB',
    color: '#e8724a',
    subscribers: '500K',
    avatar: 'https://yt3.ggpht.com/ytc/AIdro_kokxLyohqfbNFDwaU5Kg5nIXyFF1ZFqpSibFMuo7_AaeU=s240-c-k-c0x00ffffff-no-rj',
    bio: 'Tiffany Aliche — "The Budgetnista" — is a financial educator and bestselling author specializing in financial recovery and wealth-building for underserved communities. Her LIVE RICHER Challenge has helped over 1 million women collectively save more than $200M.',
    philosophy: '"Financial wholeness is not about perfection — it\'s about progress. Every step forward, no matter how small, compounds into transformation."',
    focus: ['Budgeting and Cash Flow', 'Wealth Building'],
    knownFor: [
      'LIVE RICHER Challenge framework',
      'Financial recovery and credit rebuilding',
      '"Get Good with Money" bestseller',
      'Community-driven financial empowerment',
    ],
    topics: ['Budgeting and Cash Flow', 'Wealth Building'],
  },
  {
    id: 'graham-stephan',
    name: 'Graham Stephan',
    handle: '@GrahamStephan',
    initials: 'GS',
    color: '#d4a847',
    subscribers: '4.6M',
    avatar: 'https://yt3.ggpht.com/ytc/AIdro_m4km0pJvdvRxT_gFN6WS16Ggl9D_eX_K8uxCdgTA_hFBo=s240-c-k-c0x00ffffff-no-rj',
    bio: 'Graham Stephan built a $40M+ real estate portfolio starting at age 18. He documents his own financial decisions in real time — from brokerage accounts and credit card optimization to real estate deal analysis — with full transparency on actual numbers.',
    philosophy: '"Every dollar I don\'t spend is a dollar that can compound for decades. The most powerful habit is saving aggressively and investing the difference."',
    focus: ['Real Estate Investing', 'Investing and Market Education', 'Wealth Building'],
    knownFor: [
      'Real estate portfolio built on a $40K/year salary',
      'Credit card optimization and rewards maximization',
      'Live money reactions to financial news',
      'Full financial transparency — actual net worth updates',
    ],
    topics: ['Real Estate Investing', 'Investing and Market Education', 'Wealth Building'],
  },
]

// ── All topics for filter pills
const TOPIC_PILLS = [
  'All Topics', 'Wealth Building', 'Estate Planning and Trusts', 'Tax Planning and Strategy',
  'Retirement Planning', 'Investing and Market Education', 'Military and Government Benefits',
  'Real Estate Investing', 'Debt Elimination and Behavioral Change', 'Insurance Planning',
  'Budgeting and Cash Flow', 'Behavioral Finance',
]

// ── The Planning Letter — article library
// Each entry renders as a fullscreen iframe using the hosted HTML file.
const ALL_INSIGHTS = [
  {
    issue:      'No. 01',
    series:     'Accumulation Series',
    category:   'The Planning Letter',
    headline:   'The Money Illusion',
    deck:       'Why a 7% return can still leave you poorer — and how to find the one number that tells you the truth.',
    excerpt:    'The number printed on a statement is the nominal return — measured in dollars, a ruler that shrinks every year. The only figure that describes whether your wealth actually grew is the real return: what\'s left after inflation has taken its cut.',
    readTime:   '8 min read',
    cardDesign: 'wealth-gap',
    htmlSrc:    '/letters/01-the-money-illusion.html',
  },
  {
    issue:      'No. 02',
    series:     'Accumulation Series',
    category:   'The Planning Letter',
    headline:   'The Waterfall',
    deck:       'You\'ve decided to save another dollar. Where it lands first can be worth tens of thousands by the time you retire.',
    excerpt:    'Think of your savings as water and your accounts as basins on a hillside. Water should fill the highest, most valuable basin completely before it spills into the next. Skip a basin out of habit and you\'ve poured a guaranteed return down the drain.',
    readTime:   '8 min read',
    cardDesign: 'tax-waterfall',
    htmlSrc:    '/letters/02-the-waterfall.html',
  },
  {
    issue:      'No. 03',
    series:     'Accumulation Series',
    category:   'The Planning Letter',
    headline:   'The 44 vs 64 Problem',
    deck:       'A target-date fund treats your risk as a function of one number — your birth year. Your real risk depends on at least three.',
    excerpt:    'A target-date fund decides how much stock you should own based entirely on the year you intend to retire. Two people retiring in 2045 receive identical allocations even when their realities couldn\'t be more different.',
    readTime:   '9 min read',
    cardDesign: 'lifecycle-risk',
    htmlSrc:    '/letters/03-the-44-vs-64-problem.html',
  },
]
function getDailyInsights() {
  const now = new Date()
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
  const total = ALL_INSIGHTS.length
  const i0 = (dayOfYear * 3) % total
  return [ALL_INSIGHTS[i0], ALL_INSIGHTS[(i0 + 1) % total], ALL_INSIGHTS[(i0 + 2) % total]]
}

// ── Article body renderer
function renderBodySection(section, idx) {
  if (section.type === 'p') return (
    <p key={idx} style={{ fontSize: 16, color: '#a89070', lineHeight: 1.85, margin: '0 0 24px', fontFamily: UI }}>{section.text}</p>
  )
  if (section.type === 'h2') return (
    <h3 key={idx} style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, color: '#f0e8d8', margin: '40px 0 16px', letterSpacing: '-0.01em' }}>{section.text}</h3>
  )
  if (section.type === 'callout') return (
    <div key={idx} style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 10, padding: '18px 22px', margin: '28px 0' }}>
      <p style={{ fontSize: 14, color: '#c9a96e', lineHeight: 1.75, margin: 0, fontFamily: UI }}>{section.text}</p>
    </div>
  )
  if (section.type === 'list') return (
    <ul key={idx} style={{ margin: '0 0 28px', paddingLeft: 0, listStyle: 'none' }}>
      {section.items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#c9a96e', flexShrink: 0, marginTop: 8 }} />
          <span style={{ fontSize: 14, color: '#a89070', lineHeight: 1.75, fontFamily: UI }}>{item}</span>
        </li>
      ))}
    </ul>
  )
  if (section.type === 'stats') return (
    <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 12, margin: '28px 0' }}>
      {section.items.map((s, i) => (
        <div key={i} style={{ background: '#2d2419', border: '1px solid #3d3028', borderRadius: 10, padding: '16px 18px' }}>
          <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: '#c9a96e', marginBottom: 4 }}>{s.value}</div>
          <div style={{ fontSize: 11, color: '#f0e8d8', fontFamily: UI, fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
          <div style={{ fontSize: 11, color: '#6b5540', fontFamily: UI, lineHeight: 1.4 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  )
  if (section.type === 'chart_bar') return (
    <div key={idx} style={{ margin: '32px 0' }}>
      <div style={{ fontSize: 11, color: '#6b5540', fontFamily: UI, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{section.title}</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={section.data} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2018" vertical={false} />
          <XAxis dataKey={section.nameKey} tick={{ fill: '#6b5540', fontSize: 10, fontFamily: UI }} tickLine={false} axisLine={false} interval={0} />
          <YAxis tick={{ fill: '#6b5540', fontSize: 10, fontFamily: UI }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: '#2d2419', border: '1px solid #3d3028', borderRadius: 8, fontFamily: UI, fontSize: 12, color: '#f0e8d8' }} cursor={{ fill: 'rgba(201,169,110,0.06)' }} />
          <Bar dataKey={section.barKey} fill={section.color} radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
  if (section.type === 'chart_line') return (
    <div key={idx} style={{ margin: '32px 0' }}>
      <div style={{ fontSize: 11, color: '#6b5540', fontFamily: UI, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{section.title}</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={section.data} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2018" />
          <XAxis dataKey={section.xKey} tick={{ fill: '#6b5540', fontSize: 10, fontFamily: UI }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#6b5540', fontSize: 10, fontFamily: UI }} tickLine={false} axisLine={false} />
          <ReferenceLine y={0} stroke="#3d3028" strokeDasharray="4 2" />
          <Tooltip contentStyle={{ background: '#2d2419', border: '1px solid #3d3028', borderRadius: 8, fontFamily: UI, fontSize: 12, color: '#f0e8d8' }} />
          {section.lines.map(l => (
            <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2} dot={false} name={l.label} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
        {section.lines.map(l => (
          <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 2, background: l.color }} />
            <span style={{ fontSize: 10, color: '#6b5540', fontFamily: UI }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function ArticleModal({ insight, onClose }) {
  if (!insight) return null

  // ── Planning Letter: render the full HTML as a fullscreen iframe ──
  if (insight.htmlSrc) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#f7f2e9', display: 'flex', flexDirection: 'column' }}>
        {/* Thin chrome bar */}
        <div style={{
          flexShrink: 0, height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          background: 'rgba(247,242,233,0.96)', backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #d8cab0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#a8854a' }}>
              The Planning Letter
            </span>
            <span style={{ color: '#d8cab0' }}>·</span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: '#6b5440', letterSpacing: '0.06em' }}>
              {insight.issue} — {insight.headline}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#1a1410', color: '#f0e8d8', border: 'none',
              borderRadius: 6, padding: '6px 16px',
              fontFamily: UI, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.04em',
            }}
          >
            ← Back to Library
          </button>
        </div>
        {/* Article iframe fills remaining height */}
        <iframe
          src={insight.htmlSrc}
          title={insight.headline}
          style={{ flex: 1, width: '100%', border: 'none' }}
        />
      </div>
    )
  }

  // ── Legacy modal (for any future non-HTML articles) ──
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(26,20,16,0.94)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '40px 24px', overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a1410', border: '1px solid #3d3028',
          borderRadius: 20, width: '100%', maxWidth: 760,
          padding: '52px 56px',
        }}
        className="feed-modal-pad"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 6, padding: '4px 12px' }}>
            <span style={{ fontSize: 10, color: '#c9a96e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: UI }}>{insight.category}</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #3d3028', borderRadius: 8, padding: '6px 14px', color: '#6b5540', fontSize: 12, fontFamily: UI, fontWeight: 600, cursor: 'pointer' }}>
            Close
          </button>
        </div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(22px,3vw,34px)', fontWeight: 700, color: '#f0e8d8', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {insight.headline}
        </h2>
        <div style={{ fontSize: 11, color: '#6b5540', fontFamily: UI, marginBottom: 36 }}>{insight.readTime}</div>
        <div style={{ height: 1, background: '#2a2018', marginBottom: 36 }} />
        {insight.body ? insight.body.map((s, i) => renderBodySection(s, i)) : (
          <p style={{ fontSize: 16, color: '#a89070', lineHeight: 1.85, margin: '0 0 24px', fontFamily: UI }}>{insight.excerpt}</p>
        )}
        {insight.quote && (
          <div style={{ borderLeft: '2px solid rgba(201,169,110,0.4)', paddingLeft: 24, margin: '36px 0' }}>
            <p style={{ fontFamily: DISPLAY, fontSize: 18, fontStyle: 'italic', color: '#c9a96e', margin: '0 0 8px', lineHeight: 1.5 }}>&ldquo;{insight.quote}&rdquo;</p>
            <span style={{ fontSize: 11, color: '#6b5540', fontFamily: UI }}>— {insight.quoteAttr}</span>
          </div>
        )}
        {insight.concept && (
          <>
            <div style={{ height: 1, background: '#2a2018', marginBottom: 36 }} />
            <div style={{ background: '#231c16', border: '1px solid #3d3028', borderRadius: 12, padding: '24px 28px', marginBottom: 36 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#6b5540', fontFamily: UI, marginBottom: 10 }}>Core Concept</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: '#c9a96e', marginBottom: 10 }}>{insight.concept}</div>
              <p style={{ fontSize: 14, color: '#a89070', lineHeight: 1.7, margin: 0, fontFamily: UI }}>{insight.definition}</p>
            </div>
          </>
        )}
        {insight.books && (
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#6b5540', fontFamily: UI, marginBottom: 14 }}>Further Reading</div>
            {insight.books.map(book => (
              <div key={book} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(201,169,110,0.4)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#a89070', fontFamily: UI, fontStyle: 'italic' }}>{book}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Unique card art per article ───────────────────────────────────────────
const CARD_VISUALS = {
  'wealth-gap': (
    <svg viewBox="0 0 260 140" fill="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      <rect x="55" y="22" width="48" height="88" rx="4" fill="rgba(201,169,110,0.18)" stroke="rgba(201,169,110,0.45)" strokeWidth="1"/>
      <rect x="55" y="64" width="48" height="46" rx="2" fill="rgba(192,57,43,0.28)" stroke="rgba(192,57,43,0.45)" strokeWidth="1"/>
      <rect x="155" y="48" width="48" height="62" rx="4" fill="rgba(0,180,198,0.18)" stroke="rgba(0,180,198,0.45)" strokeWidth="1"/>
      <text x="79" y="17" textAnchor="middle" fontSize="9" fill="rgba(201,169,110,0.95)" fontWeight="700">7.0%</text>
      <text x="179" y="43" textAnchor="middle" fontSize="9" fill="rgba(0,180,198,0.95)" fontWeight="700">3.88%</text>
      <text x="79" y="73" textAnchor="middle" fontSize="7" fill="rgba(192,57,43,0.9)" fontWeight="700">−3% CPI</text>
      <text x="79" y="125" textAnchor="middle" fontSize="7" fill="rgba(240,232,216,0.4)">Nominal</text>
      <text x="179" y="125" textAnchor="middle" fontSize="7" fill="rgba(240,232,216,0.4)">Real</text>
      <line x1="105" y1="80" x2="153" y2="80" stroke="rgba(240,232,216,0.15)" strokeWidth="1" strokeDasharray="3 2"/>
      <text x="130" y="76" textAnchor="middle" fontSize="6" fill="rgba(240,232,216,0.3)">Fisher Effect</text>
      <text x="20" y="20" fontSize="7" fill="rgba(201,169,110,0.4)" fontWeight="700" letterSpacing="0.08em">RETURN</text>
    </svg>
  ),
  'tax-waterfall': (
    <svg viewBox="0 0 260 140" fill="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      <rect x="14" y="16" width="58" height="22" rx="5" fill="rgba(201,169,110,0.22)" stroke="rgba(201,169,110,0.5)" strokeWidth="1"/>
      <text x="43" y="31" textAnchor="middle" fontSize="8" fill="rgba(201,169,110,0.95)" fontWeight="700">401(k) Match</text>
      <path d="M43 38 L43 50" stroke="rgba(240,232,216,0.18)" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="54" y="50" width="58" height="22" rx="5" fill="rgba(139,92,246,0.22)" stroke="rgba(139,92,246,0.5)" strokeWidth="1"/>
      <text x="83" y="65" textAnchor="middle" fontSize="8" fill="rgba(139,92,246,0.95)" fontWeight="700">HSA Triple Tax</text>
      <path d="M83 72 L83 84" stroke="rgba(240,232,216,0.18)" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="94" y="84" width="58" height="22" rx="5" fill="rgba(0,180,198,0.22)" stroke="rgba(0,180,198,0.5)" strokeWidth="1"/>
      <text x="123" y="99" textAnchor="middle" fontSize="8" fill="rgba(0,180,198,0.95)" fontWeight="700">Roth IRA</text>
      <path d="M123 106 L123 118" stroke="rgba(240,232,216,0.18)" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="134" y="118" width="58" height="16" rx="5" fill="rgba(107,85,64,0.22)" stroke="rgba(107,85,64,0.45)" strokeWidth="1"/>
      <text x="163" y="130" textAnchor="middle" fontSize="7" fill="rgba(168,144,112,0.85)" fontWeight="600">Taxable Brokerage</text>
      <text x="235" y="25" textAnchor="middle" fontSize="7" fill="rgba(201,169,110,0.4)" fontWeight="700">STEP 1</text>
      <text x="235" y="62" textAnchor="middle" fontSize="7" fill="rgba(139,92,246,0.4)" fontWeight="700">STEP 2</text>
      <text x="235" y="96" textAnchor="middle" fontSize="7" fill="rgba(0,180,198,0.4)" fontWeight="700">STEP 3</text>
      <text x="235" y="129" textAnchor="middle" fontSize="7" fill="rgba(107,85,64,0.5)" fontWeight="700">STEP 4</text>
    </svg>
  ),
  'lifecycle-risk': (
    <svg viewBox="0 0 260 140" fill="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      <path d="M20 18 C55 18,80 32,115 55 C150 78,195 105,242 115" stroke="rgba(201,169,110,0.75)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M20 18 C55 18,80 32,115 55 C150 78,195 105,242 115 L242 128 L20 128 Z" fill="rgba(201,169,110,0.07)"/>
      <line x1="20" y1="128" x2="242" y2="128" stroke="rgba(240,232,216,0.06)" strokeWidth="1"/>
      <circle cx="20" cy="18" r="4" fill="rgba(192,57,43,0.8)"/>
      <text x="20" y="12" textAnchor="middle" fontSize="7" fill="rgba(192,57,43,0.8)" fontWeight="700">25</text>
      <circle cx="115" cy="55" r="4" fill="rgba(201,169,110,0.8)"/>
      <text x="115" y="49" textAnchor="middle" fontSize="7" fill="rgba(201,169,110,0.8)" fontWeight="700">45</text>
      <circle cx="242" cy="115" r="4" fill="rgba(74,124,89,0.8)"/>
      <text x="242" y="109" textAnchor="middle" fontSize="7" fill="rgba(74,124,89,0.8)" fontWeight="700">65</text>
      <text x="42" y="38" fontSize="7" fill="rgba(192,57,43,0.65)" fontWeight="700">Aggressive</text>
      <text x="162" y="125" fontSize="7" fill="rgba(74,124,89,0.65)" fontWeight="700">Preservation</text>
      <text x="10" y="8" fontSize="7" fill="rgba(240,232,216,0.25)" fontWeight="700" letterSpacing="0.08em">EQUITY %</text>
    </svg>
  ),
  'seq-returns': (
    <svg viewBox="0 0 260 140" fill="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      <line x1="50" y1="16" x2="50" y2="126" stroke="rgba(240,232,216,0.1)" strokeWidth="1" strokeDasharray="3 3"/>
      <text x="50" y="12" textAnchor="middle" fontSize="7" fill="rgba(240,232,216,0.35)">RETIRE</text>
      <path d="M20 75 C35 72,42 68,50 66 C68 60,95 50,125 40 C160 28,200 20,242 14" stroke="rgba(74,124,89,0.9)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 75 C32 80,42 90,50 100 C65 118,90 128,120 126 C150 124,185 116,242 106" stroke="rgba(192,57,43,0.9)" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 2"/>
      <path d="M50 66 L50 100 L120 126 L120 40 Z" fill="rgba(192,57,43,0.05)"/>
      <text x="248" y="18" fontSize="8" fill="rgba(74,124,89,0.9)" fontWeight="700">A</text>
      <text x="248" y="110" fontSize="8" fill="rgba(192,57,43,0.9)" fontWeight="700">B</text>
      <circle cx="120" cy="126" r="5" fill="rgba(192,57,43,0.4)" stroke="rgba(192,57,43,0.7)" strokeWidth="1.5"/>
      <text x="120" y="140" textAnchor="middle" fontSize="7" fill="rgba(192,57,43,0.7)">Depleted</text>
    </svg>
  ),
  'four-pct-rule': (
    <svg viewBox="0 0 260 140" fill="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      <circle cx="130" cy="72" r="54" stroke="rgba(201,169,110,0.1)" strokeWidth="14" fill="none"/>
      <circle cx="130" cy="72" r="54" stroke="rgba(201,169,110,0.6)" strokeWidth="3" strokeDasharray="220 120" strokeLinecap="round" fill="none" transform="rotate(-90 130 72)"/>
      <circle cx="130" cy="72" r="38" stroke="rgba(201,169,110,0.08)" strokeWidth="1" fill="none"/>
      <text x="130" y="65" textAnchor="middle" fontSize="34" fill="rgba(201,169,110,0.95)" fontWeight="900" fontFamily="JetBrains Mono,monospace">4%</text>
      <text x="130" y="82" textAnchor="middle" fontSize="7" fill="rgba(240,232,216,0.45)" letterSpacing="0.12em">SAFE WITHDRAWAL</text>
      <text x="130" y="94" textAnchor="middle" fontSize="7" fill="rgba(107,85,64,0.8)">30-Year Historical Floor</text>
      <text x="130" y="18" textAnchor="middle" fontSize="7" fill="rgba(74,124,89,0.7)" fontWeight="700">100% Historical Success</text>
    </svg>
  ),
  'annuity-exclusion': (
    <svg viewBox="0 0 260 140" fill="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      <path d="M130 70 L130 16 A54 54 0 1 1 84 101 Z" fill="rgba(201,169,110,0.22)" stroke="rgba(201,169,110,0.55)" strokeWidth="1.5"/>
      <path d="M130 70 L84 101 A54 54 0 0 1 130 16 Z" fill="rgba(192,57,43,0.22)" stroke="rgba(192,57,43,0.55)" strokeWidth="1.5"/>
      <circle cx="130" cy="70" r="24" fill="#1e1812" stroke="rgba(240,232,216,0.07)" strokeWidth="1"/>
      <text x="130" y="67" textAnchor="middle" fontSize="7" fill="rgba(240,232,216,0.6)" fontWeight="700">EXCL.</text>
      <text x="130" y="77" textAnchor="middle" fontSize="7" fill="rgba(240,232,216,0.6)" fontWeight="700">RATIO</text>
      <text x="88" y="46" textAnchor="middle" fontSize="8" fill="rgba(201,169,110,0.9)" fontWeight="700">Tax-Free</text>
      <text x="88" y="56" textAnchor="middle" fontSize="7" fill="rgba(201,169,110,0.6)">Principal</text>
      <text x="178" y="108" textAnchor="middle" fontSize="8" fill="rgba(192,57,43,0.9)" fontWeight="700">Taxable</text>
      <text x="178" y="118" textAnchor="middle" fontSize="7" fill="rgba(192,57,43,0.6)">Earnings</text>
    </svg>
  ),
  'tax-harvest': (
    <svg viewBox="0 0 260 140" fill="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      <path d="M18 28 L55 34 L88 52 L110 78 L132 106" stroke="rgba(192,57,43,0.7)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="132" cy="106" r="12" fill="rgba(201,169,110,0.12)" stroke="rgba(201,169,110,0.4)" strokeWidth="1.5"/>
      <text x="132" y="111" textAnchor="middle" fontSize="12" fill="rgba(201,169,110,0.9)">✂</text>
      <path d="M132 106 L165 98 L200 88 L240 78" stroke="rgba(74,124,89,0.75)" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 2" fill="none"/>
      <rect x="152" y="60" width="90" height="20" rx="4" fill="rgba(74,124,89,0.1)" stroke="rgba(74,124,89,0.3)" strokeWidth="1"/>
      <text x="197" y="74" textAnchor="middle" fontSize="7" fill="rgba(74,124,89,0.9)" fontWeight="700">SWAP → REINVEST</text>
      <rect x="14" y="116" width="90" height="17" rx="4" fill="rgba(201,169,110,0.1)" stroke="rgba(201,169,110,0.3)" strokeWidth="1"/>
      <text x="59" y="128" textAnchor="middle" fontSize="7" fill="rgba(201,169,110,0.9)" fontWeight="700">Lock Tax Deduction</text>
      <text x="14" y="22" fontSize="7" fill="rgba(192,57,43,0.6)" fontWeight="700">SELL AT LOSS</text>
    </svg>
  ),
  'roth-window': (
    <svg viewBox="0 0 260 140" fill="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      <rect x="16" y="56" width="228" height="12" rx="6" fill="rgba(240,232,216,0.05)"/>
      <rect x="78" y="50" width="104" height="24" rx="6" fill="rgba(201,169,110,0.2)" stroke="rgba(201,169,110,0.5)" strokeWidth="1.5"/>
      <rect x="78" y="50" width="104" height="24" rx="6" fill="rgba(201,169,110,0.04)"/>
      <line x1="78" y1="42" x2="78" y2="84" stroke="rgba(240,232,216,0.12)" strokeWidth="1"/>
      <line x1="182" y1="42" x2="182" y2="84" stroke="rgba(240,232,216,0.12)" strokeWidth="1"/>
      <text x="40" y="44" textAnchor="middle" fontSize="7" fill="rgba(240,232,216,0.35)">Working</text>
      <text x="40" y="88" textAnchor="middle" fontSize="7" fill="rgba(240,232,216,0.25)">High Income</text>
      <text x="130" y="44" textAnchor="middle" fontSize="8" fill="rgba(201,169,110,0.95)" fontWeight="700">CONVERSION WINDOW</text>
      <text x="130" y="88" textAnchor="middle" fontSize="7" fill="rgba(201,169,110,0.6)">Low-Income Gap Years</text>
      <text x="218" y="44" textAnchor="middle" fontSize="7" fill="rgba(240,232,216,0.35)">RMDs</text>
      <text x="218" y="88" textAnchor="middle" fontSize="7" fill="rgba(240,232,216,0.25)">Age 73+</text>
      <text x="130" y="116" textAnchor="middle" fontSize="8" fill="rgba(240,232,216,0.45)">Pay taxes now → Never again</text>
      <text x="130" y="130" textAnchor="middle" fontSize="7" fill="rgba(107,85,64,0.7)">Fill lower brackets every year</text>
    </svg>
  ),
  'wrr': (
    <svg viewBox="0 0 260 140" fill="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      <path d="M36 115 A90 90 0 0 1 224 115" stroke="rgba(240,232,216,0.07)" strokeWidth="18" strokeLinecap="round" fill="none"/>
      <path d="M36 115 A90 90 0 0 1 95 36" stroke="rgba(192,57,43,0.35)" strokeWidth="18" strokeLinecap="round" fill="none"/>
      <path d="M95 36 A90 90 0 0 1 165 36" stroke="rgba(74,124,89,0.65)" strokeWidth="18" strokeLinecap="round" fill="none"/>
      <path d="M165 36 A90 90 0 0 1 224 115" stroke="rgba(201,169,110,0.35)" strokeWidth="18" strokeLinecap="round" fill="none"/>
      <line x1="130" y1="115" x2="107" y2="38" stroke="rgba(240,232,216,0.75)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="130" cy="115" r="6" fill="rgba(240,232,216,0.4)" stroke="rgba(240,232,216,0.2)" strokeWidth="1"/>
      <text x="130" y="96" textAnchor="middle" fontSize="18" fill="rgba(74,124,89,0.95)" fontWeight="900">75%</text>
      <text x="130" y="110" textAnchor="middle" fontSize="6" fill="rgba(240,232,216,0.35)" letterSpacing="0.1em">WRR</text>
      <text x="26" y="132" fontSize="7" fill="rgba(192,57,43,0.6)">Too Low</text>
      <text x="98" y="20" textAnchor="middle" fontSize="7" fill="rgba(74,124,89,0.75)" fontWeight="700">70-80% Sweet Spot</text>
      <text x="208" y="132" fontSize="7" fill="rgba(201,169,110,0.6)">Over-save</text>
    </svg>
  ),
  'decumulation': (
    <svg viewBox="0 0 260 140" fill="none" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      <rect x="12" y="62" width="52" height="58" rx="5" fill="rgba(0,180,198,0.12)" stroke="rgba(0,180,198,0.38)" strokeWidth="1.5"/>
      <rect x="12" y="90" width="52" height="30" rx="3" fill="rgba(0,180,198,0.18)"/>
      <text x="38" y="54" textAnchor="middle" fontSize="7" fill="rgba(0,180,198,0.8)" fontWeight="700">CASH</text>
      <text x="38" y="78" textAnchor="middle" fontSize="6" fill="rgba(0,180,198,0.6)">Spend Now</text>
      <rect x="104" y="48" width="52" height="72" rx="5" fill="rgba(201,169,110,0.12)" stroke="rgba(201,169,110,0.38)" strokeWidth="1.5"/>
      <rect x="104" y="90" width="52" height="30" rx="3" fill="rgba(201,169,110,0.18)"/>
      <text x="130" y="40" textAnchor="middle" fontSize="7" fill="rgba(201,169,110,0.8)" fontWeight="700">INCOME</text>
      <text x="130" y="63" textAnchor="middle" fontSize="6" fill="rgba(201,169,110,0.6)">3-10 Yrs</text>
      <rect x="196" y="28" width="52" height="92" rx="5" fill="rgba(74,124,89,0.12)" stroke="rgba(74,124,89,0.38)" strokeWidth="1.5"/>
      <rect x="196" y="90" width="52" height="30" rx="3" fill="rgba(74,124,89,0.18)"/>
      <text x="222" y="20" textAnchor="middle" fontSize="7" fill="rgba(74,124,89,0.8)" fontWeight="700">GROWTH</text>
      <text x="222" y="43" textAnchor="middle" fontSize="6" fill="rgba(74,124,89,0.6)">10+ Yrs</text>
      <path d="M196 72 L158 72" stroke="rgba(240,232,216,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
      <polygon points="158,68 153,72 158,76" fill="rgba(240,232,216,0.2)"/>
      <path d="M104 78 L66 78" stroke="rgba(240,232,216,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
      <polygon points="66,74 61,78 66,82" fill="rgba(240,232,216,0.2)"/>
      <text x="177" y="68" textAnchor="middle" fontSize="6" fill="rgba(240,232,216,0.25)">refills</text>
      <text x="85" y="74" textAnchor="middle" fontSize="6" fill="rgba(240,232,216,0.25)">refills</text>
    </svg>
  ),
}

// ── Content card (for topic carousels)
function ContentCard({ article, onRead }) {
  const [hov, setHov] = useState(false)
  const thumbnail = getThumbnail(article)
  const topic = getArticleTopic(article)
  return (
    <div
      onClick={() => onRead(article)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        minWidth: 240, maxWidth: 260, flexShrink: 0,
        background: '#231c16',
        border: `1px solid ${hov ? 'rgba(201,169,110,0.3)' : '#2a2018'}`,
        borderRadius: 12, overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.18s ease',
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', height: 140, background: thumbnail, overflow: 'hidden' }}>
        {article.cardDesign && CARD_VISUALS[article.cardDesign]}
        {/* Warm overlay vignette */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,20,16,0.7) 0%, transparent 60%)' }} />
        {/* Duration badge */}
        <div style={{
          position: 'absolute', bottom: 8, right: 8,
          background: 'rgba(26,20,16,0.85)', borderRadius: 4, padding: '2px 7px',
        }}>
          <span style={{ fontSize: 10, color: '#f0e8d8', fontFamily: MONO, fontWeight: 600 }}>{article.readTime.replace(' read', '')}</span>
        </div>
        {/* Type badge */}
        <div style={{
          position: 'absolute', bottom: 8, left: 8,
          background: 'rgba(26,20,16,0.85)', borderRadius: 4, padding: '2px 7px',
        }}>
          <span style={{ fontSize: 9, color: '#c9a96e', fontFamily: UI, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Article</span>
        </div>
      </div>
      {/* Card body */}
      <div style={{ padding: '14px 16px 18px' }}>
        <h4 style={{
          fontFamily: DISPLAY, fontSize: 14, fontWeight: 700,
          color: hov ? '#f0e8d8' : '#d4c4a8',
          lineHeight: 1.35, margin: '0 0 10px',
          transition: 'color 0.15s ease',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.headline}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 8, color: '#c9a96e', fontWeight: 700, fontFamily: UI }}>P</span>
          </div>
          <span style={{ fontSize: 11, color: '#6b5540', fontFamily: UI }}>Planora Insights</span>
        </div>
      </div>
    </div>
  )
}

// ── Daily insight row (sidebar)
function DailyInsightRow({ article, onRead, isLast }) {
  const [hov, setHov] = useState(false)
  const topic = getArticleTopic(article)
  const thumbnail = getThumbnail(article)
  return (
    <div
      onClick={() => onRead(article)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        padding: '14px 0',
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer',
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: 60, height: 44, borderRadius: 6, flexShrink: 0,
        background: thumbnail, overflow: 'hidden',
      }} />
      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h5 style={{
          fontFamily: DISPLAY, fontSize: 13, fontWeight: 700,
          color: hov ? '#f0e8d8' : '#c8b898',
          margin: '0 0 5px', lineHeight: 1.3,
          transition: 'color 0.15s ease',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.headline}
        </h5>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, color: '#6b5540', fontFamily: UI }}>{article.readTime}</span>
          <span style={{ fontSize: 9, color: '#6b5540' }}>·</span>
          <span style={{ fontSize: 9, color: '#c9a96e', fontFamily: UI, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{article.category}</span>
        </div>
      </div>
    </div>
  )
}

// ── Featured hero card
function FeaturedHero({ featured, daily, onRead }) {
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      background: 'linear-gradient(120deg, #2e1d0c 0%, #1e1610 30%, #231c14 55%, #1a1410 100%)',
      border: '1px solid #3d3028',
      display: 'grid', gridTemplateColumns: '1fr 340px',
      minHeight: 320,
    }} className="feed-hero-grid">
      {/* Left: featured article */}
      <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 9, color: '#c9a96e', fontFamily: UI, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Featured Insight
          </span>
        </div>

        <h2 style={{
          fontFamily: DISPLAY,
          fontSize: 'clamp(24px,2.8vw,38px)',
          fontWeight: 700, color: '#f0e8d8',
          lineHeight: 1.15, margin: '0 0 14px',
          letterSpacing: '-0.025em',
        }}>
          {featured.headline}
        </h2>

        <p style={{
          fontSize: 13, color: 'rgba(168,144,112,0.85)',
          lineHeight: 1.65, margin: '0 0 24px',
          fontFamily: UI, maxWidth: 480,
        }}>
          {featured.excerpt.slice(0, 180)}{featured.excerpt.length > 180 ? '…' : ''}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
          <span style={{ fontSize: 10, color: '#6b5540', fontFamily: UI, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {featured.readTime}
          </span>
          <span style={{ fontSize: 10, color: '#6b5540' }}>·</span>
          <span style={{ fontSize: 10, color: '#c9a96e', fontFamily: UI, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {featured.category}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => onRead(featured)}
            style={{
              background: 'rgba(201,169,110,0.12)',
              border: '1px solid rgba(201,169,110,0.45)',
              borderRadius: 8, padding: '9px 20px',
              color: '#c9a96e', fontSize: 12, fontWeight: 700, fontFamily: UI,
              cursor: 'pointer', transition: 'all 0.18s ease',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.12)' }}
          >
            Read Insight
          </button>
        </div>
      </div>

      {/* Right: daily insights panel */}
      <div style={{
        background: 'rgba(26,20,16,0.6)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 24px',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: '#f0e8d8', fontFamily: UI, fontWeight: 700 }}>Daily Insights</span>
          <button
            onClick={() => onRead(null)}
            style={{ background: 'transparent', border: 'none', fontSize: 11, color: '#c9a96e', fontFamily: UI, cursor: 'pointer', padding: 0 }}
          >
            View all
          </button>
        </div>
        <div style={{ flex: 1 }}>
          {daily.map((ins, i) => (
            <DailyInsightRow key={i} article={ins} onRead={onRead} isLast={i === daily.length - 1} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Filter bar
function FilterBar({ activeTopic, setActiveTopic, activeCreator, setActiveCreator, contentType, setContentType }) {
  const [showMoreTopics, setShowMoreTopics] = useState(false)
  const [showMoreCreators, setShowMoreCreators] = useState(false)
  const visibleTopics   = showMoreTopics   ? TOPIC_PILLS   : TOPIC_PILLS.slice(0, 8)
  const visibleCreators = showMoreCreators ? CREATORS_FILTER : CREATORS_FILTER.slice(0, 7)

  const pill = (label, active, onClick) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        background: active ? '#c9a96e' : 'transparent',
        border: `1px solid ${active ? '#c9a96e' : '#3d3028'}`,
        borderRadius: 6, padding: '5px 13px',
        fontSize: 11, fontFamily: UI, fontWeight: 600,
        color: active ? '#1a1410' : '#6b5540',
        cursor: 'pointer', transition: 'all 0.18s ease',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.4)'; e.currentTarget.style.color = '#a89070' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#3d3028'; e.currentTarget.style.color = '#6b5540' } }}
    >
      {label}
    </button>
  )

  return (
    <div style={{
      background: '#1e1710',
      border: '1px solid #2a2018',
      borderRadius: 12,
      padding: '16px 20px',
      marginBottom: 36,
    }}>
      {/* Topics row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: '#6b5540', fontFamily: UI, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', flexShrink: 0 }}>Topics</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {visibleTopics.map(t => pill(t === 'All Topics' ? t : t.replace(' and ', ' & ').replace('Investing and Market Education', 'Investing').replace('Tax Planning and Strategy', 'Tax Planning').replace('Behavioral Finance', 'Behavioral').replace('Estate Planning and Trusts', 'Estate Planning').replace('Real Estate Investing', 'Real Estate').replace('Debt Elimination and Behavioral Change', 'Debt').replace('Insurance Planning', 'Insurance').replace('Budgeting and Cash Flow', 'Budgeting').replace('Military and Government Benefits', 'Military'), activeTopic === t, () => setActiveTopic(t)))}
          {!showMoreTopics && TOPIC_PILLS.length > 8 && (
            <button
              onClick={() => setShowMoreTopics(true)}
              style={{ background: 'transparent', border: '1px solid #3d3028', borderRadius: 6, padding: '5px 11px', fontSize: 11, fontFamily: UI, color: '#6b5540', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              More <ChevronDown size={11} />
            </button>
          )}
        </div>
      </div>
      {/* Divider */}
      <div style={{ height: 1, background: '#2a2018', margin: '10px 0' }} />
      {/* Creators + Content Type row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: '#6b5540', fontFamily: UI, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', flexShrink: 0 }}>Creators</span>
        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          {visibleCreators.map(c => pill(c.name, activeCreator === c.id, () => setActiveCreator(c.id)))}
          {!showMoreCreators && CREATORS_FILTER.length > 7 && (
            <button
              onClick={() => setShowMoreCreators(true)}
              style={{ background: 'transparent', border: '1px solid #3d3028', borderRadius: 6, padding: '5px 11px', fontSize: 11, fontFamily: UI, color: '#6b5540', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              More <ChevronDown size={11} />
            </button>
          )}
        </div>
        {/* Content Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 'auto' }}>
          <span style={{ fontSize: 10, color: '#6b5540', fontFamily: UI, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Content Type</span>
          {['All', 'Articles', 'Videos'].map(t => (
            <button
              key={t}
              onClick={() => setContentType(t.toLowerCase())}
              style={{
                background: contentType === t.toLowerCase() ? '#c9a96e' : 'transparent',
                border: `1px solid ${contentType === t.toLowerCase() ? '#c9a96e' : '#3d3028'}`,
                borderRadius: 6, padding: '5px 12px',
                fontSize: 11, fontFamily: UI, fontWeight: 600,
                color: contentType === t.toLowerCase() ? '#1a1410' : '#6b5540',
                cursor: 'pointer', transition: 'all 0.18s ease',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Video card
function VideoCard({ video }) {
  const [hov, setHov] = useState(false)
  const ytUrl = `https://www.youtube.com/watch?v=${video.videoId}`
  const ago = videoAgo(video.publishedAt)
  return (
    <a
      href={ytUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        minWidth: 240, maxWidth: 260, flexShrink: 0,
        background: '#231c16',
        border: `1px solid ${hov ? 'rgba(201,169,110,0.28)' : '#2a2018'}`,
        borderRadius: 12, overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.18s ease',
        textDecoration: 'none',
        display: 'block',
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', height: 140, overflow: 'hidden', background: '#1a1410', flexShrink: 0 }}>
        {video.thumbnail
          ? <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2a1a06, #1a1410)' }} />
        }
        {/* Overlay on hover */}
        <div style={{ position: 'absolute', inset: 0, background: hov ? 'rgba(26,20,16,0.35)' : 'transparent', transition: 'background 0.18s' }} />
        {/* Play button (appears on hover) */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hov ? 1 : 0, transition: 'opacity 0.18s' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(201,169,110,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={16} color="#1a1410" style={{ marginLeft: 2 }} />
          </div>
        </div>
        {/* Video badge */}
        <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(26,20,16,0.88)', borderRadius: 4, padding: '2px 7px' }}>
          <span style={{ fontSize: 9, color: '#ff5555', fontFamily: UI, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>YouTube</span>
        </div>
        {/* Age badge */}
        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(26,20,16,0.88)', borderRadius: 4, padding: '2px 7px' }}>
          <span style={{ fontSize: 10, color: '#f0e8d8', fontFamily: MONO, fontWeight: 600 }}>{ago}</span>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '14px 16px 18px' }}>
        <h4 style={{
          fontFamily: DISPLAY, fontSize: 14, fontWeight: 700,
          color: hov ? '#f0e8d8' : '#d4c4a8',
          lineHeight: 1.35, margin: '0 0 10px',
          transition: 'color 0.15s ease',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {video.title}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,85,85,0.12)', border: '1px solid rgba(255,85,85,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Play size={8} color="#ff5555" style={{ marginLeft: 1 }} />
          </div>
          <span style={{ fontSize: 11, color: '#6b5540', fontFamily: UI }}>{video.creatorName}</span>
        </div>
      </div>
    </a>
  )
}

// ── Topic carousel section
function TopicCarouselSection({ section, onRead, contentType, ytData, activeCreator }) {
  const articles = getArticlesForTopic(section.topic)

  // Get all videos for this topic, filtered by active creator
  let allTopicVideos = getVideosForTopic(ytData, section.topic)
  if (activeCreator !== 'all') {
    allTopicVideos = allTopicVideos.filter(v => v.creatorId === activeCreator)
  }

  const showArticles = contentType !== 'videos'
  const showVideos   = contentType !== 'articles'

  const hasArticles = showArticles && articles.length > 0
  const hasVideos   = showVideos && allTopicVideos.length > 0
  const hasContent  = hasArticles || hasVideos

  if (!hasContent && ytData && !ytData.notYetPulled) {
    // Nothing to show for this topic under current filters — skip
    if (activeCreator !== 'all') return null
  }

  return (
    <div style={{ marginBottom: 52 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h3 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: '#f0e8d8', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {section.name}
          </h3>
          <p style={{ fontSize: 12, color: '#6b5540', fontFamily: UI, margin: 0 }}>{section.sub}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {hasVideos && (
            <span style={{ fontFamily: MONO, fontSize: 11, color: '#3d3028' }}>
              {allTopicVideos.length} videos
            </span>
          )}
        </div>
      </div>

      {/* Articles row */}
      {hasArticles && (
        <>
          {hasVideos && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 9, color: '#6b5540', fontFamily: UI, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em' }}>Planora Insights</span>
              <div style={{ flex: 1, height: 1, background: '#2a2018' }} />
            </div>
          )}
          <div
            style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="feed-carousel"
          >
            {articles.map((a, i) => (
              <ContentCard key={i} article={a} onRead={onRead} />
            ))}
          </div>
        </>
      )}

      {/* Videos row */}
      {hasVideos && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: `${hasArticles ? '20px' : '0'} 0 10px` }}>
            <span style={{ fontSize: 9, color: '#ff5555', fontFamily: UI, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em' }}>YouTube</span>
            <div style={{ flex: 1, height: 1, background: '#2a2018' }} />
          </div>
          <div
            style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="feed-carousel"
          >
            {allTopicVideos.map(v => (
              <VideoCard key={v.videoId} video={v} />
            ))}
          </div>
        </>
      )}

      {/* Empty state — no videos yet pulled */}
      {!hasArticles && !hasVideos && (
        <div style={{ border: '1px dashed #2a2018', borderRadius: 12, padding: '36px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#6b5540', fontFamily: UI, lineHeight: 1.7 }}>
            {contentType === 'videos' && ytData?.notYetPulled
              ? 'Videos not yet loaded — click Refresh Videos above to pull from YouTube.'
              : 'Content for this topic is being curated.'}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATOR COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function CreatorProfileModal({ creator, onClose, avatar }) {
  const [imgOk, setImgOk] = useState(true)
  if (!creator) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10001,
        background: 'rgba(26,20,16,0.96)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1f1810',
          border: `1px solid ${creator.color}33`,
          borderRadius: 20, width: '100%', maxWidth: 600,
          position: 'relative',
          boxShadow: `0 0 80px ${creator.color}14, 0 24px 64px rgba(0,0,0,0.6)`,
        }}
        className="feed-modal-pad"
      >
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 28px', borderBottom: `1px solid ${creator.color}18`,
        }}>
          <div style={{
            background: `${creator.color}12`,
            border: `1px solid ${creator.color}28`,
            borderRadius: 5, padding: '3px 11px',
          }}>
            <span style={{ fontSize: 9, color: creator.color, fontFamily: UI, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              Creator Profile
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid #3d3028',
              borderRadius: 8, padding: '5px 14px',
              color: '#6b5540', fontSize: 11, fontFamily: UI, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '32px 36px 40px' }} className="creator-modal-body">
          {/* Header: avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{
              width: 68, height: 68, borderRadius: 16, flexShrink: 0,
              background: `${creator.color}14`,
              border: `2px solid ${creator.color}40`,
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {avatar && imgOk
                ? <img src={avatar} alt={creator.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setImgOk(false)} />
                : <span style={{ fontFamily: UI, fontSize: 22, fontWeight: 800, color: creator.color }}>{creator.initials}</span>
              }
            </div>
            <div>
              <h2 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, color: '#f0e8d8', margin: '0 0 5px', letterSpacing: '-0.02em' }}>
                {creator.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#6b5540', fontFamily: UI }}>{creator.handle}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#3d3028', display: 'inline-block' }} />
                <span style={{ fontFamily: MONO, fontSize: 12, color: creator.color, fontWeight: 600 }}>
                  {creator.subscribers} subscribers
                </span>
              </div>
            </div>
          </div>

          {/* Focus tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            {creator.focus.map(f => (
              <span key={f} style={{
                background: `${creator.color}10`,
                border: `1px solid ${creator.color}28`,
                borderRadius: 5, padding: '3px 10px',
                fontSize: 10, color: creator.color, fontFamily: UI, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {f.replace('Investing and Market Education','Investing').replace('Debt Elimination and Behavioral Change','Debt Elim.').replace('Military and Government Benefits','Military').replace('Budgeting and Cash Flow','Budgeting').replace('Tax Planning and Strategy','Tax Planning').replace('Real Estate Investing','Real Estate').replace('Estate Planning and Trusts','Estate Planning')}
              </span>
            ))}
          </div>

          <div style={{ height: 1, background: '#2a2018', marginBottom: 24 }} />

          {/* Bio */}
          <p style={{ fontSize: 14, color: '#a89070', lineHeight: 1.85, margin: '0 0 28px', fontFamily: UI }}>
            {creator.bio}
          </p>

          {/* Philosophy quote */}
          <div style={{
            borderLeft: `3px solid ${creator.color}55`,
            background: `${creator.color}07`,
            borderRadius: '0 10px 10px 0',
            padding: '16px 20px', marginBottom: 28,
          }}>
            <p style={{ fontFamily: DISPLAY, fontSize: 15, fontStyle: 'italic', color: creator.color, margin: 0, lineHeight: 1.65 }}>
              {creator.philosophy}
            </p>
          </div>

          {/* Known For */}
          <div>
            <div style={{ fontSize: 10, color: '#6b5540', fontFamily: UI, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 14 }}>
              Known For
            </div>
            {creator.knownFor.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 11 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: creator.color, flexShrink: 0, marginTop: 7 }} />
                <span style={{ fontSize: 13, color: '#a89070', fontFamily: UI, lineHeight: 1.65 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CreatorCard({ creator, onSelect, avatar }) {
  const [hov, setHov] = useState(false)
  const [imgOk, setImgOk] = useState(true)
  const shortFocus = f => f
    .replace('Investing and Market Education','Investing')
    .replace('Debt Elimination and Behavioral Change','Debt')
    .replace('Military and Government Benefits','Military')
    .replace('Budgeting and Cash Flow','Budgeting')
    .replace('Tax Planning and Strategy','Tax Planning')
    .replace('Real Estate Investing','Real Estate')
    .replace('Estate Planning and Trusts','Estate')
  return (
    <div
      onClick={() => onSelect(creator)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        minWidth: 204, maxWidth: 220, flexShrink: 0,
        background: '#231c16',
        border: `1px solid ${hov ? creator.color + '44' : '#2a2018'}`,
        borderRadius: 14, padding: '20px 18px',
        cursor: 'pointer',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
        boxShadow: hov ? `0 0 28px ${creator.color}14` : 'none',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
        background: `${creator.color}13`,
        border: `1.5px solid ${creator.color}30`,
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>
        {avatar && imgOk
          ? <img src={avatar} alt={creator.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setImgOk(false)} />
          : <span style={{ fontFamily: UI, fontSize: 15, fontWeight: 800, color: creator.color }}>{creator.initials}</span>
        }
      </div>

      {/* Name */}
      <div style={{
        fontFamily: UI, fontSize: 13, fontWeight: 700,
        color: hov ? '#f0e8d8' : '#d4c4a8',
        marginBottom: 4, lineHeight: 1.3,
        transition: 'color 0.15s ease',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {creator.name}
      </div>

      {/* Handle */}
      <div style={{ fontSize: 11, color: '#4a3828', fontFamily: UI, marginBottom: 12 }}>
        {creator.handle}
      </div>

      {/* Subscriber count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: creator.color, flexShrink: 0 }} />
        <span style={{ fontFamily: MONO, fontSize: 11, color: creator.color, fontWeight: 700 }}>
          {creator.subscribers}
        </span>
        <span style={{ fontSize: 10, color: '#6b5540', fontFamily: UI }}>subs</span>
      </div>

      {/* Focus pills */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {creator.focus.slice(0, 2).map(f => (
          <span key={f} style={{
            background: `${creator.color}0e`,
            border: `1px solid ${creator.color}22`,
            borderRadius: 4, padding: '2px 7px',
            fontSize: 9, color: creator.color, fontFamily: UI, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap',
          }}>
            {shortFocus(f)}
          </span>
        ))}
      </div>
    </div>
  )
}

function CreatorRosterSection({ onSelect, ytData }) {
  return (
    <div style={{ marginBottom: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: '#f0e8d8', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Meet the Creators
          </h2>
          <p style={{ fontSize: 12, color: '#6b5540', fontFamily: UI, margin: 0 }}>
            {CREATORS_DATA.length} financial educators — CFP® advisors, CPAs, behavioral finance experts, and more
          </p>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 11, color: '#3d3028' }}>
          {CREATORS_DATA.length} profiles
        </span>
      </div>

      {/* Carousel */}
      <div
        style={{
          display: 'flex', gap: 14, overflowX: 'auto',
          paddingBottom: 8, scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}
        className="feed-carousel"
      >
        {CREATORS_DATA.map(creator => (
          <CreatorCard key={creator.id} creator={creator} onSelect={onSelect} avatar={creator.avatar} />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// THE LIBRARY
// ─────────────────────────────────────────────────────────────────────────────

const LIBRARY_CATEGORIES = ['All', ...Array.from(new Set(ALL_INSIGHTS.map(a => a.category))).sort()]

function LibraryCard({ article, onRead }) {
  const [hov, setHov] = useState(false)
  const thumbnail = getThumbnail(article)
  return (
    <div
      onClick={() => onRead(article)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#231c16',
        border: `1px solid ${hov ? 'rgba(201,169,110,0.32)' : '#2a2018'}`,
        borderRadius: 14, overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
        boxShadow: hov ? '0 6px 28px rgba(0,0,0,0.35)' : 'none',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', height: 130, background: thumbnail, overflow: 'hidden', flexShrink: 0 }}>
        {article.cardDesign && CARD_VISUALS[article.cardDesign]}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,20,16,0.72) 0%, transparent 55%)' }} />
        {/* Category badge */}
        <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(26,20,16,0.88)', borderRadius: 4, padding: '3px 8px', backdropFilter: 'blur(4px)' }}>
          <span style={{ fontSize: 9, color: '#c9a96e', fontFamily: UI, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {article.category}
          </span>
        </div>
        {/* Read time */}
        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(26,20,16,0.85)', borderRadius: 4, padding: '2px 7px' }}>
          <span style={{ fontSize: 10, color: '#f0e8d8', fontFamily: MONO, fontWeight: 600 }}>{article.readTime.replace(' read','')}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h4 style={{
          fontFamily: DISPLAY, fontSize: 14, fontWeight: 700,
          color: hov ? '#f0e8d8' : '#d4c4a8',
          lineHeight: 1.35, margin: '0 0 8px',
          transition: 'color 0.15s ease',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.headline}
        </h4>
        <p style={{
          fontSize: 12, color: '#6b5540', fontFamily: UI, lineHeight: 1.55, margin: '0 0 12px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          flex: 1,
        }}>
          {article.excerpt}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 7, color: '#c9a96e', fontWeight: 700, fontFamily: UI }}>P</span>
            </div>
            <span style={{ fontSize: 10, color: '#6b5540', fontFamily: UI }}>Planora Insights</span>
          </div>
          {article.concept && (
            <span style={{ fontSize: 9, color: '#3d3028', fontFamily: UI, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {article.concept.length > 20 ? article.concept.slice(0, 18) + '…' : article.concept}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function LibrarySection({ onRead }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = ALL_INSIGHTS.filter(a => {
    const matchCat  = activeCategory === 'All' || a.category === activeCategory
    const matchSrch = !searchQuery || a.headline.toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSrch
  })

  return (
    <div style={{ marginTop: 24, marginBottom: 52 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 700, color: '#f0e8d8', margin: '0 0 4px', letterSpacing: '-0.025em' }}>
            The{' '}
            <em style={{ fontStyle: 'italic', color: '#c9a96e' }}>Library</em>
          </h2>
          <p style={{ fontSize: 12, color: '#6b5540', fontFamily: UI, margin: 0 }}>
            A weekly letter on money &amp; time — written for people who take their financial life seriously.
          </p>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 11, color: '#3d3028' }}>
          {filtered.length} article{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search + category filters */}
      <div style={{ background: '#1e1710', border: '1px solid #2a2018', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b5540" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search articles…"
            style={{
              background: '#1a1410', border: '1px solid #2a2018', borderRadius: 8,
              padding: '6px 12px 6px 30px', fontSize: 11, color: '#a89070',
              fontFamily: UI, outline: 'none', width: 180,
            }}
          />
        </div>
        {/* Divider */}
        <div style={{ width: 1, height: 22, background: '#2a2018', flexShrink: 0 }} />
        {/* Category pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {LIBRARY_CATEGORIES.map(cat => {
            const active = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: active ? '#c9a96e' : 'transparent',
                  border: `1px solid ${active ? '#c9a96e' : '#3d3028'}`,
                  borderRadius: 6, padding: '5px 12px',
                  fontSize: 11, fontFamily: UI, fontWeight: 600,
                  color: active ? '#1a1410' : '#6b5540',
                  cursor: 'pointer', transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Article grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b5540', fontFamily: UI, fontSize: 13 }}>
          No articles match your search.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {filtered.map((a, i) => (
            <LibraryCard key={i} article={a} onRead={onRead} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// THE FEED
// ─────────────────────────────────────────────────────────────────────────────
export default function TheFeed() {
  const navigate = useNavigate()
  const [reading, setReading] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: '#1a1410' }}>
      <ArticleModal insight={reading} onClose={() => setReading(null)} />
      <CreatorProfileModal
        creator={selectedCreator}
        onClose={() => setSelectedCreator(null)}
        avatar={selectedCreator?.avatar || null}
      />

      {/* ── Top nav bar */}
      <div style={{ borderBottom: '1px solid #2a2018', padding: '0 40px' }} className="feed-nav-pad">
        <div style={{ maxWidth: 1360, margin: '0 auto', height: 52, display: 'flex', alignItems: 'center', gap: 32 }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
          >
            <div style={{ width: 26, height: 26, background: '#c9a96e', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 900, color: '#1a1410', lineHeight: 1 }}>P</span>
            </div>
            <span style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 700, color: '#c9a96e', letterSpacing: '-0.01em' }}>Planora</span>
          </button>

          <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, fontStyle: 'italic', color: '#c9a96e', letterSpacing: '-0.01em' }}>The Library</span>
        </div>
      </div>

      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '36px 40px 80px' }} className="feed-main-pad">
        <LibrarySection onRead={setReading} />
      </div>

      <style>{`
        .feed-carousel::-webkit-scrollbar { display: none; }
        @keyframes feedSpin { to { transform: rotate(360deg); } }
        @media (max-width: 1000px) {
          .feed-hero-grid { grid-template-columns: 1fr !important; }
          .feed-hero-grid > :last-child { border-left: none !important; border-top: 1px solid rgba(255,255,255,0.06); }
        }
        @media (max-width: 680px) {
          .feed-nav-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .feed-main-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .feed-modal-pad { padding: 32px 24px !important; }
          .creator-modal-body { padding: 24px 20px 32px !important; }
        }
      `}</style>
    </div>
  )
}
