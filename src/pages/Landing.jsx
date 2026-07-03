import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import wallstreetImg      from '../assets/wallstreet.jpg'
import globeChartImg      from '../assets/globe-chart.jpeg'
import financialPlanImg   from '../assets/financial-planning.jpeg'
import advisorImg         from '../assets/advisor-working.jpeg'
import { ArrowRight, ArrowUpRight, Search, X, TrendingUp, Clock, Shield, Home, Users, FileText, Wallet, Baby, BarChart2, Globe, LogOut, UserCircle, BookOpen, Briefcase } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { useAuth } from '@/lib/AuthContext'

// ── Typography tokens — matching Arche exactly
const DISPLAY = "'Playfair Display', Georgia, serif"
const UI      = "'Inter', system-ui, sans-serif"
const MONO    = "'JetBrains Mono', 'Courier New', monospace"
const EASE    = [0.32, 0.72, 0, 1]

// ── Portfolio preview sparkline
const PORTFOLIO_SPARK = [
  { v: 221 }, { v: 228 }, { v: 224 }, { v: 237 }, { v: 243 },
  { v: 239 }, { v: 252 }, { v: 259 }, { v: 256 }, { v: 268 },
  { v: 272 }, { v: 266 }, { v: 280 }, { v: 284 }, { v: 279 }, { v: 284 },
]
const PORTFOLIO_METRICS = [
  { label: 'S&P Beta',   value: '1.04'   },
  { label: 'Sharpe',     value: '1.87'   },
  { label: 'YTD Return', value: '+28.4%' },
]

// ── S&P 500 sparkline for section preview card
const SP500_SPARK = [
  { v: 4880 }, { v: 4920 }, { v: 4895 }, { v: 4980 }, { v: 5040 },
  { v: 5010 }, { v: 5110 }, { v: 5090 }, { v: 5180 }, { v: 5210 },
  { v: 5280 }, { v: 5248 }, { v: 5340 }, { v: 5402 }, { v: 5388 },
  { v: 5471 }, { v: 5520 }, { v: 5498 }, { v: 5612 }, { v: 5847 },
]

// ── Featured insights moved to TheFeed.jsx (/the-feed route)
// eslint-disable-next-line no-unused-vars
const ALL_INSIGHTS = [
  {
    category:  'Market Intelligence',
    headline:  "Understanding Risk-Adjusted Returns: What Your Portfolio's Sharpe Ratio Reveals",
    excerpt:   "Most investors track returns. Sophisticated investors track risk-adjusted returns. The Sharpe ratio measures how much return a portfolio generates for every unit of risk taken. A portfolio returning 15% with a Sharpe of 0.8 is actually worse than one returning 12% with a Sharpe of 1.6. The math tells a different story than the headline number.",
    concept:   'Sharpe Ratio',
    definition:"The return earned per unit of risk, calculated as (portfolio return − risk-free rate) ÷ standard deviation. A Sharpe above 1.0 is considered good. Above 2.0 is exceptional.",
    quote:     "The stock market is a device for transferring money from the impatient to the patient.",
    quoteAttr: 'Warren Buffett',
    href:      '/risk-analysis',
    readTime:  '8 min read',
    books:     ['A Random Walk Down Wall Street', 'The Intelligent Investor', 'Common Stocks and Uncommon Profits'],
    body: [
      { type: 'p', text: "Every year, millions of investors compare their portfolio performance by a single number: the annual return. Portfolio A returned 18%. Portfolio B returned 12%. Portfolio A wins, right? Not necessarily. What this comparison omits is the risk required to generate those returns. Risk-adjusted performance is the foundation of institutional investment analysis, and the Sharpe ratio is its primary tool." },
      { type: 'h2', text: 'How the Sharpe Ratio Works' },
      { type: 'p', text: "The Sharpe ratio was developed by Nobel laureate William Sharpe in 1966. The formula is straightforward: subtract the risk-free rate (typically the 3-month Treasury yield) from the portfolio's return, then divide by the portfolio's standard deviation of returns. The result tells you how much excess return you're earning per unit of volatility. A higher number is always better." },
      { type: 'p', text: "Consider two portfolios. Portfolio A returns 18% annually with a standard deviation of 22% — common for a concentrated equity portfolio. With a risk-free rate of 4%, that's a Sharpe of (18-4)/22 = 0.64. Portfolio B returns 12% with a standard deviation of 8% — typical of a diversified multi-asset portfolio. Its Sharpe is (12-4)/8 = 1.0. Portfolio B is the superior risk-adjusted performer by a wide margin, despite the lower headline return." },
      { type: 'chart_bar', title: 'Portfolio Comparison: Return vs. Risk-Adjusted Performance', data: [
        { name: 'Aggressive\nConcentrated', return: 18, sharpe: 0.64 },
        { name: 'Balanced\nDiversified', return: 12, sharpe: 1.00 },
        { name: 'Optimized\nMulti-Asset', return: 14, sharpe: 1.55 },
        { name: 'Institutional\nGrade', return: 11, sharpe: 1.92 },
      ], barKey: 'sharpe', nameKey: 'name', color: '#c9a96e', yLabel: 'Sharpe Ratio' },
      { type: 'stats', items: [
        { value: '< 1.0', label: 'Below Average', sub: 'Not earning enough for the risk' },
        { value: '1.0–1.5', label: 'Good', sub: 'Solid risk-adjusted returns' },
        { value: '1.5–2.0', label: 'Very Good', sub: 'Institutional quality' },
        { value: '> 2.0', label: 'Exceptional', sub: 'Rare — hedge funds target this' },
      ]},
      { type: 'h2', text: 'Why Volatility Is the Right Measure of Risk' },
      { type: 'p', text: "The denominator in the Sharpe formula — standard deviation — captures how wildly a portfolio's returns swing from year to year. A portfolio that returns exactly 10% every year has a standard deviation near zero. A portfolio that returns 40%, then -20%, then 25%, then -5% also averages roughly 10% — but the ride is brutal. The Sharpe ratio penalizes that volatility, because volatility creates real-world problems: it forces investors to sell at lows, disrupts retirement income planning, and generates psychological stress that leads to poor decisions." },
      { type: 'p', text: "This is why the world's most sophisticated investors — endowments, pension funds, sovereign wealth funds — manage to Sharpe ratios rather than raw returns. The Yale Endowment under David Swensen famously maintained Sharpe ratios above 1.5 for decades, not by chasing the highest returns, but by combining uncorrelated asset classes to reduce portfolio volatility while maintaining strong returns." },
      { type: 'h2', text: 'The Limitations You Should Know' },
      { type: 'p', text: "The Sharpe ratio has real limitations. It treats upside and downside volatility identically — but most investors care far more about downside. A portfolio that frequently makes large gains but occasionally loses 5% gets penalized equally to one that makes modest gains but occasionally loses 30%. The Sortino ratio solves this by using downside deviation only, and is generally preferred for retirement income portfolios." },
      { type: 'p', text: "The Sharpe ratio also assumes returns are normally distributed, which they aren't. Equity returns have 'fat tails' — extreme events happen more often than a normal distribution predicts. Strategies that sell options or use leverage can appear to have very high Sharpe ratios right up until a catastrophic drawdown. This was a key structural failure in many hedge fund strategies leading into 2008." },
      { type: 'callout', text: "A Sharpe ratio above 1.0 means you're earning more than 1% of excess return for every 1% of annual volatility. Most retail investors, without realizing it, accept Sharpe ratios below 0.5 by holding undiversified portfolios in single accounts." },
      { type: 'h2', text: 'How to Apply This to Your Portfolio' },
      { type: 'p', text: "Most brokerage platforms do not calculate or display the Sharpe ratio. You'll need to calculate it yourself or use a portfolio analysis tool. To do so, download your monthly returns for the past 3 years, calculate the average annual return and the standard deviation of monthly returns (annualized by multiplying by √12), and apply the formula. The calculation takes 10 minutes in a spreadsheet and gives you a fundamentally different view of your portfolio's efficiency." },
      { type: 'p', text: "The goal isn't to maximize Sharpe in isolation. It's to make informed trade-offs. A higher-Sharpe portfolio may mean accepting a lower headline return. Whether that trade-off makes sense depends on your time horizon, income needs, and psychological tolerance for volatility. But you cannot make that trade-off consciously if you're only looking at returns." },
    ],
  },
  {
    category:  'Tax Strategy',
    headline:  "Tax Alpha: The Return Most Investors Leave on the Table Every Year",
    excerpt:   "Tax drag is one of the largest — and most preventable — sources of investment underperformance. The average investor loses 1.0 to 2.5% annually to avoidable taxes through poor asset location and failure to harvest losses. Tax alpha is the additional return generated by managing investments tax-efficiently. Over 30 years, this compounding difference is substantial.",
    concept:   'Tax Alpha',
    definition:"The additional investment return generated through tax-efficient portfolio management — including tax-loss harvesting, asset location optimization, and strategic gain realization timing.",
    quote:     "An investment in knowledge pays the best interest.",
    quoteAttr: 'Benjamin Franklin',
    href:      '/tax-planning',
    readTime:  '9 min read',
    books:     ['The Bogleheads Guide to Investing', 'Tax-Free Wealth', 'The Little Book of Common Sense Investing'],
    body: [
      { type: 'p', text: "If someone quietly removed 1.5% from your investment return every single year, you'd demand they stop. Yet most investors voluntarily hand that money to the IRS through avoidable taxes — on dividends, short-term gains, and bond interest held in the wrong accounts. Tax drag is invisible on your statement. It doesn't show up as a line item. It simply compounds against you for decades." },
      { type: 'h2', text: 'What Tax Drag Actually Costs Over Time' },
      { type: 'p', text: "A $500,000 portfolio earning 8% annually before taxes, held entirely in a taxable brokerage account, generates roughly $40,000 in gains each year. If the investor is in the 22% federal bracket and 5% state bracket, and holds typical mutual funds with 1.2% annual turnover distributions plus bond interest, tax drag can easily consume 1.8% of the total portfolio value per year — not of the gain, of the entire portfolio. Over 30 years, the compounding effect is staggering." },
      { type: 'chart_line', title: 'Portfolio Growth: Tax-Efficient vs. Tax-Unoptimized ($500K Starting)', data: [
        { year: 'Year 0',  optimized: 500,  unoptimized: 500  },
        { year: 'Year 5',  optimized: 720,  unoptimized: 665  },
        { year: 'Year 10', optimized: 1040, unoptimized: 885  },
        { year: 'Year 15', optimized: 1500, unoptimized: 1175 },
        { year: 'Year 20', optimized: 2160, unoptimized: 1560 },
        { year: 'Year 25', optimized: 3110, unoptimized: 2075 },
        { year: 'Year 30', optimized: 4480, unoptimized: 2760 },
      ], lines: [{ key: 'optimized', color: '#c9a96e', label: 'Tax-Optimized' }, { key: 'unoptimized', color: '#6b5540', label: 'Unoptimized' }], xKey: 'year', yLabel: '$000s' },
      { type: 'stats', items: [
        { value: '1.0–2.5%', label: 'Annual Tax Drag', sub: 'Average for unoptimized taxable accounts' },
        { value: '$1.72M', label: '30-Year Difference', sub: 'On a $500K portfolio at 8% gross return' },
        { value: '0.5–1.0%', label: 'Tax-Loss Harvesting Benefit', sub: 'Annual return boost from systematic TLH' },
        { value: '0.2–0.8%', label: 'Asset Location Benefit', sub: 'Morningstar research on proper placement' },
      ]},
      { type: 'h2', text: 'Tax-Loss Harvesting: Manufacturing Losses Into Returns' },
      { type: 'p', text: "Tax-loss harvesting is the practice of selling securities at a loss to offset capital gains elsewhere in your portfolio. The key rule: you cannot buy back the same security within 30 days before or after the sale (the wash-sale rule), but you can immediately purchase a highly correlated security that maintains your market exposure. You've locked in a tax benefit without meaningfully changing your investment position." },
      { type: 'p', text: "The math is powerful. If you sell a position at a $20,000 loss and you're in the 32% federal bracket plus 5% state, that harvested loss offsets $20,000 of capital gains — saving you $7,400 in taxes. That $7,400 stays invested and compounds. Wealthfront's research showed systematic tax-loss harvesting added between 0.77% and 1.55% in annual after-tax return for investors who deployed the strategy across every taxable account." },
      { type: 'h2', text: 'Asset Location: Where You Hold Matters as Much as What You Hold' },
      { type: 'p', text: "Not all investments generate the same type of income, and not all account types are taxed the same way. Bonds generate ordinary income taxed at your highest marginal rate. REITs generate non-qualified dividends also taxed as ordinary income. Growth stocks that don't pay dividends generate no current taxable income. Index funds with low turnover generate minimal capital gains distributions. Understanding these differences tells you where each investment belongs." },
      { type: 'list', items: [
        'Tax-deferred accounts (Traditional IRA, 401k): Hold bonds, REITs, high-dividend stocks, and actively managed funds with high turnover',
        'Tax-free accounts (Roth IRA, Roth 401k): Hold your highest-growth assets — small-cap equity, emerging markets, high-conviction individual stocks',
        'Taxable brokerage: Hold broad index funds with minimal distributions, individual growth stocks you plan to hold long-term, and municipal bonds',
        'HSA (if available): The triple-tax-advantaged account. Hold your most aggressive investments here for maximum tax-free compounding',
      ]},
      { type: 'h2', text: 'Strategic Gain Realization: Controlling When You Pay' },
      { type: 'p', text: "You don't owe taxes on unrealized gains — only when you sell. This gives long-term investors a powerful tool: the ability to control the timing of taxable events. In low-income years (career transition, early retirement before Social Security, sabbatical), you may be in the 0% long-term capital gains bracket, meaning you can realize significant gains completely tax-free. This is one of the most underutilized strategies in financial planning." },
      { type: 'callout', text: "In 2024, married couples filing jointly with taxable income below $94,050 pay 0% federal tax on long-term capital gains. For a retiree with $60,000 in income from other sources, this creates up to $34,050 in gains that can be realized tax-free every year." },
      { type: 'p', text: "The synthesis of all these strategies — tax-loss harvesting, asset location, gain timing, and account type optimization — is what advisors call a comprehensive tax overlay. Sophisticated wealth managers implement this continuously across an entire household's balance sheet. The result isn't just tax savings; it's a fundamental improvement in after-tax return that compounds into the millions over a lifetime of investing." },
    ],
  },
  {
    category:  'Retirement Planning',
    headline:  "The 4% Rule: What Bengen's Research Actually Says About Retirement Income",
    excerpt:   "In 1994, financial planner William Bengen published research showing that a retiree who withdrew 4% of their portfolio in year one — adjusted for inflation each year after — would not run out of money over any 30-year historical period. What the headlines miss: the rule assumes a specific equity allocation and exact 30-year horizon. Your circumstances change the math.",
    concept:   'Safe Withdrawal Rate',
    definition:"The percentage of a retirement portfolio that can be withdrawn annually — adjusted for inflation — without depleting the portfolio over a defined horizon. Bengen's research established 4% as the historical floor for 30-year retirements.",
    quote:     "Someone is sitting in the shade today because someone planted a tree a long time ago.",
    quoteAttr: 'Warren Buffett',
    href:      '/retirement-planning',
    readTime:  '9 min read',
    books:     ['Die With Zero', 'The Psychology of Money', 'Your Money or Your Life'],
    body: [
      { type: 'p', text: "William Bengen was a financial planner, not an academic, when he sat down in 1994 to answer a question his clients kept asking: 'How much can I spend each year in retirement without running out of money?' He analyzed historical market data going back to 1926, tested every possible 30-year retirement period, and found the worst-case starting point. The answer — 4% of the initial portfolio, adjusted upward for inflation each year — has since become the most cited number in personal finance." },
      { type: 'h2', text: "What Bengen's Research Actually Showed" },
      { type: 'p', text: "Bengen's finding was precise: a retiree with a portfolio of 50% large-cap U.S. equities and 50% intermediate-term U.S. government bonds could withdraw 4% in year one, increase that dollar amount by inflation each subsequent year, and never run out of money over any 30-year historical period from 1926 through 1992. The worst starting years were 1966 and 1969, when a retiree faced the brutal combination of high inflation and poor early-sequence equity returns. Even those retirees survived on 4%." },
      { type: 'chart_bar', title: 'Historical Safe Withdrawal Rate Success by 30-Year Period', data: [
        { name: '3.0%', success: 100 },
        { name: '3.5%', success: 100 },
        { name: '4.0%', success: 100 },
        { name: '4.5%', success: 95 },
        { name: '5.0%', success: 82 },
        { name: '5.5%', success: 68 },
        { name: '6.0%', success: 51 },
      ], barKey: 'success', nameKey: 'name', color: '#c9a96e', yLabel: '% of Periods Survived' },
      { type: 'h2', text: 'The Critical Assumptions Everyone Misses' },
      { type: 'p', text: "The 4% rule contains several embedded assumptions that fundamentally change its applicability to your situation. First: a 30-year retirement horizon. If you retire at 55, you may need your portfolio to last 40 years. Research by Pfau and others shows that a 40-year horizon requires dropping to approximately 3.3% to maintain the same historical certainty. Second: a specific asset allocation — roughly 50-60% equities. A retiree with 30% equities sees their safe withdrawal rate drop to around 2.8%. Third: U.S.-only equity exposure. International diversification historically changes the outcomes in complex ways." },
      { type: 'stats', items: [
        { value: '4.0%', label: '30-Year Horizon', sub: '100% historical success, 50/50 portfolio' },
        { value: '3.3%', label: '40-Year Horizon', sub: 'For age 55 early retirees' },
        { value: '3.8%', label: 'Modern Estimate', sub: 'Morningstar 2024 update, current valuations' },
        { value: '2.8%', label: 'Conservative', sub: '40+ years, bond-heavy, high certainty' },
      ]},
      { type: 'h2', text: 'How Current Market Conditions Change the Math' },
      { type: 'p', text: "Bengen's original research used historical data when stock valuations were significantly lower than today. Research by Wade Pfau at the American College of Financial Services, and annual updates from Morningstar's Christine Benz, incorporate current valuation metrics — specifically the Shiller CAPE ratio — to adjust forward-looking safe withdrawal rates. As of 2024, with the S&P 500 CAPE above 30, Morningstar's updated research suggests a forward-looking safe withdrawal rate closer to 3.8% for 30-year retirements, not 4.0%." },
      { type: 'p', text: "This doesn't mean you should panic or retire with a miserly budget. It means the 4% rule is a starting point, not a law. Most financial planners now recommend dynamic withdrawal strategies that increase spending in good market years and decrease it in bad ones. The 'guardrails' approach, pioneered by Jonathan Guyton and William Klinger, allows higher initial withdrawal rates (4.5-5.5%) by incorporating flexibility rules that reduce withdrawals when the portfolio falls below certain thresholds." },
      { type: 'h2', text: 'Building Your Personal Withdrawal Plan' },
      { type: 'p', text: "The most important insight from three decades of subsequent research is this: rigid rules are less important than having a plan you can actually follow. A retiree who withdraws 4.5% with a dynamic guardrails system — reducing spending 10% when their portfolio falls below a threshold — will almost certainly outperform a retiree who withdraws 3.5% rigidly but abandons the plan at the first major market correction and moves to cash." },
      { type: 'callout', text: "The 4% rule was never meant to be a spending plan. It was a floor — the worst historical outcome. Most retirees, in most historical periods, could have spent significantly more. The tragedy of the rule is that it's caused many retirees to dramatically under-spend in their most active years." },
      { type: 'p', text: "True retirement income planning integrates your Social Security claiming strategy, required minimum distributions from tax-deferred accounts, spending patterns that typically decline in real terms after age 75, and healthcare cost escalation that often increases faster than CPI. The 4% rule is one input in a comprehensive model — not the model itself." },
    ],
  },
  {
    category:  'Behavioral Finance',
    headline:  "Why Smart Investors Make Dumb Decisions: The Psychology of Loss Aversion",
    excerpt:   "Kahneman and Tversky's Prospect Theory proved that losses feel roughly twice as painful as equivalent gains feel good. This asymmetry drives investors to hold losers too long, sell winners too early, and avoid necessary risk entirely. Understanding this bias doesn't eliminate it — but it creates the distance to override it.",
    concept:   'Loss Aversion',
    definition:"A cognitive bias where the pain of losing is psychologically about twice as powerful as the pleasure of gaining. It causes investors to make suboptimal decisions to avoid realized losses.",
    quote:     "The investor's chief problem — and even his worst enemy — is likely to be himself.",
    quoteAttr: 'Benjamin Graham',
    href:      '/risk-analysis',
    readTime:  '8 min read',
    books:     ['Thinking, Fast and Slow', 'The Psychology of Money', 'Misbehaving'],
    body: [
      { type: 'p', text: "In 1979, Daniel Kahneman and Amos Tversky published Prospect Theory — research that would eventually earn Kahneman the Nobel Prize in Economics. Their central finding was deceptively simple: losses and gains are not felt equally. Losing $1,000 causes roughly twice the psychological pain as gaining $1,000 causes pleasure. This asymmetry — loss aversion — is hardwired into human cognition and is the root cause of the most common and costly investor mistakes." },
      { type: 'h2', text: 'The DALBAR Problem: How Much Loss Aversion Actually Costs' },
      { type: 'p', text: "DALBAR Inc. has measured the gap between investment returns and investor returns annually since 1994. Their 2024 Quantitative Analysis of Investor Behavior found that over the prior 30 years, the S&P 500 returned an average of 10.35% annually. The average equity fund investor earned 6.81%. That 3.54% gap — representing hundreds of thousands of dollars over a lifetime — is almost entirely explained by behavioral mistakes driven by loss aversion: selling during downturns, staying in cash too long after, and rotating into yesterday's winners." },
      { type: 'chart_bar', title: 'Annual Return Gap: Market vs. Average Investor (30-Year Average)', data: [
        { name: 'S&P 500 Index', return: 10.35 },
        { name: 'Average Equity\nFund Investor', return: 6.81 },
        { name: 'Average Fixed\nIncome Investor', return: 1.23 },
        { name: 'Average Asset\nAllocation Investor', return: 3.52 },
      ], barKey: 'return', nameKey: 'name', color: '#c9a96e', yLabel: 'Annualized Return %' },
      { type: 'h2', text: 'The Four Ways Loss Aversion Destroys Returns' },
      { type: 'list', items: [
        'Holding losers too long (disposition effect): Investors hold losing positions waiting to "break even" rather than harvesting the loss and redeploying capital. The loss feels permanent when realized but theoretical while on paper — even though the math is identical.',
        'Selling winners too early: Investors lock in gains prematurely, fearing a reversal. This cuts off compounding at its most powerful stage and creates unnecessary taxable events in non-retirement accounts.',
        'Avoiding necessary risk: Investors with long time horizons hold excessive cash or bonds because the possibility of loss feels more real than the certainty of inflation eroding purchasing power. A 30-year-old keeping 40% in cash has guaranteed inflation losses to avoid market volatility.',
        'Panic selling at market bottoms: The most destructive behavior. Investors who sold in March 2020 and waited for "clarity" before reinvesting missed a 100%+ recovery. The same pattern repeated in 2008-2009, 2001-2002, and every prior correction.',
      ]},
      { type: 'h2', text: 'The Mental Accounting Trap' },
      { type: 'p', text: "Kahneman also identified mental accounting as a close cousin of loss aversion: the tendency to treat money differently based on its origin or designated purpose, even when money is mathematically fungible. An investor might hold a losing stock in a 'fun money' account far longer than rational analysis would support, while simultaneously keeping a 'serious' retirement account in ultra-conservative bonds. The money is the same. The behavior is inconsistent because the psychological accounts are separate." },
      { type: 'callout', text: "Research by Brad Barber and Terrance Odean found that individual investors who traded most actively underperformed the market by 6.5% annually after costs. The least active investors nearly matched market returns. More decisions did not produce better outcomes — loss aversion amplified each decision's cost." },
      { type: 'h2', text: 'Structural Defenses Against Your Own Psychology' },
      { type: 'p', text: "Knowing about loss aversion doesn't eliminate it — Kahneman himself admitted he remained susceptible to his own identified biases. What works is building structural defenses that remove the opportunity for biased decisions. Automatic rebalancing removes the emotional sell/buy decision. Systematic investment plans (dollar-cost averaging) remove timing decisions. A written Investment Policy Statement — specifying your allocation and rules for changing it before a crisis — creates a rational anchor for irrational moments." },
      { type: 'p', text: "The most powerful defense is pre-commitment: deciding in advance, while calm, what you will do when the market drops 30%, 40%, or 50%. Writing down 'If the market falls 30%, I will rebalance into equities, not out of them' is dramatically more effective than trying to make that decision at 3am watching a market crash in real time. The research on pre-commitment is robust: the plan made in advance consistently outperforms the decision made in the moment." },
    ],
  },
  {
    category:  'Wealth Building',
    headline:  "Net Worth vs. Income: Why Your Balance Sheet Matters More Than Your Paycheck",
    excerpt:   "High income without net worth accumulation is financial running in place. The wealthy build balance sheets, not just income statements. Net worth — assets minus liabilities — is the only number that captures your true financial position. Two people earning $200,000 can have net worths of $50,000 and $1.5 million. The difference is entirely structural.",
    concept:   'Net Worth',
    definition:"Total assets minus total liabilities. The only financial metric that captures your actual wealth position. Income determines cash flow; net worth determines financial freedom.",
    quote:     "Do not save what is left after spending, but spend what is left after saving.",
    quoteAttr: 'Warren Buffett',
    href:      '/net-worth',
    readTime:  '7 min read',
    books:     ['The Millionaire Next Door', 'I Will Teach You to Be Rich', 'The Simple Path to Wealth'],
    body: [
      { type: 'p', text: "Income is a flow. Net worth is a stock. The distinction sounds academic until you meet the attorney earning $450,000 a year who would be financially ruined by three months without a paycheck, and the teacher earning $68,000 a year who retired at 58 with a paid-off house, $1.2M in retirement accounts, and no debt. The second person understood something the first one didn't: income is the raw material for building wealth, not wealth itself." },
      { type: 'h2', text: 'The Thomas Stanley Discovery' },
      { type: 'p', text: "Thomas Stanley and William Danko spent years studying American millionaires for their book The Millionaire Next Door. Their most counterintuitive finding: the majority of millionaires in America don't look like millionaires. They live in modest homes in ordinary neighborhoods, drive used cars, and clip coupons. Meanwhile, the people driving luxury cars and living in expensive zip codes are often deeply over-leveraged — high income, minimal net worth, and financial fragility dressed up in expensive signals." },
      { type: 'p', text: "Stanley coined the term 'prodigious accumulator of wealth' (PAW) for individuals whose net worth significantly exceeds what their income would predict, and 'under-accumulator of wealth' (UAW) for those whose net worth significantly lags. The predictors of PAW status had almost nothing to do with income and everything to do with behavior: savings rate, investment discipline, and avoiding lifestyle inflation." },
      { type: 'chart_bar', title: 'Same $200K Income: Two Different Financial Outcomes at Age 45', data: [
        { name: 'Household A\n(UAW)', assets: 380, liabilities: 310, netWorth: 70 },
        { name: 'Household B\n(PAW)', assets: 1820, liabilities: 180, netWorth: 1640 },
      ], barKey: 'netWorth', nameKey: 'name', color: '#c9a96e', yLabel: '$000s Net Worth' },
      { type: 'h2', text: 'The Components of a Wealth-Building Balance Sheet' },
      { type: 'p', text: "Assets on a personal balance sheet fall into two categories: productive assets that generate returns (investment accounts, rental property, business equity, retirement accounts) and consumption assets that depreciate (cars, boats, furniture, electronics). A high net worth built primarily on consumption assets is not durable wealth — it's stored spending. True wealth is almost entirely comprised of productive assets." },
      { type: 'list', items: [
        'Retirement accounts (401k, IRA, Roth): Tax-advantaged and protected from creditors in most states. The core of most households\' net worth.',
        'Taxable investment accounts: Flexible, no contribution limits, but subject to capital gains taxes. Essential above retirement account limits.',
        'Home equity: Valuable but illiquid. Should not be counted as investable net worth — you cannot spend it without selling or borrowing against the home.',
        'Business equity: For business owners, often the largest single asset. Highly illiquid and concentrated — diversification planning is critical.',
        'Emergency fund (liquid cash): Not a wealth-building asset — a financial shock absorber. Target 3-6 months of expenses, no more.',
      ]},
      { type: 'stats', items: [
        { value: '20–25%', label: 'Target Savings Rate', sub: 'Of gross income to build wealth meaningfully' },
        { value: '10x', label: 'Net Worth at 60', sub: 'Fidelity benchmark: 10x your annual salary' },
        { value: '3x', label: 'Net Worth at 40', sub: 'Fidelity benchmark for age 40' },
        { value: '1%', label: 'Net Worth Difference', sub: '1% more savings rate = 3% more net worth at 65' },
      ]},
      { type: 'h2', text: 'Lifestyle Inflation: The Silent Wealth Killer' },
      { type: 'p', text: "Every income raise carries a choice: expand your lifestyle or expand your balance sheet. Most people, automatically and without conscious decision, expand their lifestyle. The $20,000 raise becomes a nicer car payment, a larger apartment, more restaurants. The savings rate stays constant as a percentage, but the absolute number only grows as fast as income. This is the treadmill: higher income, same savings rate, permanently deferred wealth." },
      { type: 'callout', text: "A household that earns $100K and saves 20% will have a higher net worth at 50 than a household that earns $200K and saves 8% — despite the income gap. The savings rate matters more than the income level once basic needs are met." },
      { type: 'p', text: "The antidote is a conscious savings-first structure: automate transfers to investment accounts the same day your paycheck arrives, before you have the opportunity to spend it. Pay yourself first is not a platitude — it's the single most reliably effective wealth-building behavior documented in behavioral finance research. What doesn't flow through your checking account doesn't get spent." },
    ],
  },
  {
    category:  'Insurance Planning',
    headline:  "The Insurance Gap: Why Most Americans Are Catastrophically Underinsured",
    excerpt:   "Insurance is the only financial product where the goal is to never use it — which is precisely why most people buy too little. A healthy 35-year-old with two children, a mortgage, and $80,000 in income needs approximately $1.2M in life insurance to replace lost income. Most have a $50,000 employer policy. The gap is a family financial crisis waiting to happen.",
    concept:   'Human Life Value',
    definition:"An actuarial approach to calculating life insurance needs: the present value of all future income a person would have earned, minus personal consumption — representing the financial loss their dependents would sustain.",
    quote:     "Risk comes from not knowing what you're doing.",
    quoteAttr: 'Warren Buffett',
    href:      '/life-insurance',
    readTime:  '9 min read',
    books:     ['The New Rules of Money', 'Against the Gods', 'The Richest Man in Babylon'],
    body: [
      { type: 'p', text: "Insurance occupies a unique psychological space in financial planning: it's the only product purchased with the explicit hope of never needing it. This creates a systematic undervaluation that leaves most American families financially catastrophic one accident, diagnosis, or death away from devastation. The life insurance gap alone — the difference between coverage held and coverage needed — represents $12 trillion in the United States according to LIMRA research. That gap is not distributed across households equally. It falls hardest on families in their prime earning years." },
      { type: 'h2', text: 'How to Calculate How Much Life Insurance You Actually Need' },
      { type: 'p', text: "The most common method — employer-offered coverage of 1-2x annual salary — is dangerously inadequate. The calculation that actually protects families is based on income replacement over the years your dependents need support. A practical formula: multiply annual income by 10-12, add all outstanding debts (mortgage, car loans, student loans), add estimated college costs for each child, then subtract existing liquid assets. For a 35-year-old earning $120,000 with a $400,000 mortgage, two children, and $80,000 in savings, the calculation yields approximately $1.8-2.0M in total coverage needed." },
      { type: 'chart_bar', title: 'Life Insurance: Coverage Needed vs. Average Coverage Held by Age Group', data: [
        { name: 'Ages 25-34', needed: 980, held: 210 },
        { name: 'Ages 35-44', needed: 1650, held: 380 },
        { name: 'Ages 45-54', needed: 1420, held: 490 },
        { name: 'Ages 55-64', needed: 820, held: 440 },
      ], barKey: 'needed', nameKey: 'name', color: '#c9a96e', yLabel: '$000s Coverage' },
      { type: 'stats', items: [
        { value: '$12T', label: 'U.S. Life Insurance Gap', sub: 'Coverage needed minus coverage held (LIMRA)' },
        { value: '54%', label: 'Households Underinsured', sub: 'More than half of American households' },
        { value: '10-12x', label: 'Income Multiplier', sub: 'Rule of thumb for term life coverage needed' },
        { value: '$30/mo', label: 'Avg. 20-Year Term Cost', sub: '$500K policy, healthy 30-year-old non-smoker' },
      ]},
      { type: 'h2', text: 'Term Life vs. Permanent Life: The Critical Distinction' },
      { type: 'p', text: "Term life insurance provides a death benefit for a specific period — 10, 20, or 30 years — at a fixed premium. It is pure insurance with no investment component, and for most families, it is the correct product. A 30-year-old can purchase a 30-year, $1M term policy for approximately $50-70/month. Permanent life insurance (whole life, universal life, variable life) combines a death benefit with a cash value accumulation component. It costs 8-15x more for the same death benefit." },
      { type: 'p', text: "The financial planning community is largely consensus: buy term and invest the difference. The cash value accumulation inside permanent life policies grows at 2-4% on a tax-deferred basis — returns that are structurally inferior to a simple index fund in a tax-advantaged account. The exceptions where permanent insurance makes sense are narrow: ultra-high-net-worth estate planning (to provide liquidity for estate taxes), business owners with buy-sell agreement funding needs, and certain irrevocable trust structures. For the vast majority of families, term is the answer." },
      { type: 'h2', text: 'Disability Insurance: The Coverage Almost Nobody Has' },
      { type: 'p', text: "Life insurance gets the attention, but disability insurance protects an asset that is statistically more likely to be needed: your income. A 35-year-old worker is three times more likely to experience a disability lasting more than 90 days than to die before age 65. Social Security disability is difficult to qualify for and averages $1,537/month — well below most professional incomes. Yet only 35% of private-sector workers have employer-sponsored long-term disability coverage, and most plans cap benefits at 60% of pre-disability income." },
      { type: 'callout', text: "The most valuable financial asset most people have before age 50 is not their investment portfolio — it's their future earnings. A 40-year-old earning $120,000 has 25 working years remaining, representing $3 million in future income. An 'own-occupation' disability policy that protects that income stream costs $150-300/month and is one of the highest-return insurance purchases available." },
      { type: 'list', items: [
        'Own-occupation definition: The gold standard. Pays if you cannot perform the specific duties of your occupation — critical for physicians, attorneys, and specialized professionals.',
        'Any-occupation definition: Pays only if you cannot perform any work for which you are reasonably suited. Often what employer group plans provide, and far less protective.',
        'Benefit period: Choose to age 65 or 67, not a 2 or 5 year period. Disabilities often last much longer than short benefit periods cover.',
        'Elimination period: The "deductible" — how long you must be disabled before benefits begin. 90 days is standard; match this to your emergency fund duration.',
      ]},
    ],
  },
  {
    category:  'Real Estate',
    headline:  "Rent vs. Own: The Calculation Most People Get Wrong",
    excerpt:   "The rent vs. buy decision is rarely as simple as 'buying builds equity.' The true cost of ownership includes mortgage interest, property taxes, insurance, maintenance, and opportunity cost on the down payment. In high-cost markets, renting and investing the difference often outperforms buying. The answer depends on your time horizon, market, and opportunity cost of capital.",
    concept:   'Price-to-Rent Ratio',
    definition:"A market valuation metric calculated as median home price divided by annual median rent. Ratios above 20 generally favor renting; below 15 favor buying. It measures the relative cost of owning versus renting in a given market.",
    quote:     "Buy land, they're not making it anymore.",
    quoteAttr: 'Mark Twain',
    href:      '/real-estate',
    readTime:  '9 min read',
    books:     ['Rich Dad Poor Dad', 'The Millionaire Real Estate Investor', 'Set for Life'],
    body: [
      { type: 'p', text: "Few financial decisions carry more emotional weight — or more commonly flawed analysis — than the choice between renting and buying a home. The 'buying builds equity, renting is throwing money away' argument is so deeply embedded in American culture that it has become a near-religious conviction. The math tells a more complicated story. In high-cost markets, a disciplined renter who invests the difference will often outperform a buyer over a 10-year horizon. In moderate-cost markets with strong appreciation and long time horizons, buying nearly always wins. The key word is 'always' — it isn't always either." },
      { type: 'h2', text: 'The True Cost of Homeownership' },
      { type: 'p', text: "The most common error in rent vs. buy analysis is counting only the mortgage payment against rent. Homeownership carries five major cost categories that renters don't pay: mortgage interest (in year one of a $600,000 mortgage at 7%, roughly $41,000 of the first year's payments are pure interest), property taxes (averaging 1.1% of home value nationally, or $6,600/year on a $600K home), homeowner's insurance ($1,200-2,400/year), maintenance (a standard rule of thumb is 1-1.5% of home value per year, or $6,000-9,000), and HOA fees where applicable. The mortgage payment is only part of the picture." },
      { type: 'chart_bar', title: 'Annual True Cost of a $600,000 Home (Year 3, 20% Down, 7% Rate)', data: [
        { name: 'Mortgage\nInterest', cost: 39800 },
        { name: 'Property\nTax', cost: 6600 },
        { name: 'Maintenance', cost: 7500 },
        { name: 'Insurance', cost: 1800 },
        { name: 'Opportunity\nCost (Down)', cost: 9600 },
        { name: 'Principal\n(Equity)', cost: 8200 },
      ], barKey: 'cost', nameKey: 'name', color: '#c9a96e', yLabel: 'Annual Cost ($)' },
      { type: 'h2', text: 'The Price-to-Rent Ratio: Your Market-Level Signal' },
      { type: 'p', text: "The price-to-rent ratio is calculated by dividing the median home price in a market by the annual median rent for a comparable property. It gives you a simple signal about the relative cost of owning versus renting in that market. Historically, ratios below 15 favor buying — you're building equity faster than renting would cost. Ratios between 15 and 20 are neutral. Ratios above 20 begin to favor renting and investing the difference. As of 2024, San Francisco's ratio exceeds 40, Manhattan exceeds 35, and Los Angeles exceeds 32. The national average is approximately 19." },
      { type: 'stats', items: [
        { value: '< 15', label: 'Buy Signal', sub: 'Ownership clearly outperforms renting' },
        { value: '15–20', label: 'Neutral Zone', sub: 'Decision depends on personal factors' },
        { value: '20–30', label: 'Rent Favorable', sub: 'Renting + investing often wins' },
        { value: '> 30', label: 'Renting Wins', sub: 'Math heavily favors renting and investing' },
      ]},
      { type: 'h2', text: 'The Opportunity Cost Nobody Counts' },
      { type: 'p', text: "The most overlooked cost in the rent vs. buy calculation is the opportunity cost of the down payment. A 20% down payment on a $600,000 home is $120,000 in capital that could otherwise be invested. At the historical S&P 500 return of approximately 10% annually, $120,000 becomes $310,000 in 10 years. If the home appreciates at 4% annually over that same period, the $600,000 home is worth $888,000 — but the equity grew from $120,000 to roughly $380,000 after 10 years of payments. The comparison is closer than most homebuyers expect." },
      { type: 'callout', text: "Time horizon is the single most important variable. The New York Times Rent vs. Buy calculator (the most comprehensive publicly available) shows that most purchases become financially advantageous between 4-8 years depending on market conditions. Below that threshold, renting typically wins. Above it, buying typically wins." },
      { type: 'p', text: "The conclusion is not 'renting is always better' — it clearly isn't in most markets over long periods. The conclusion is that buying should be evaluated as a financial decision using real numbers, not cultural assumptions. If the math favors buying and your life circumstances support a 7+ year commitment to a location, buy. If the math is marginal and your professional life requires mobility, rent without apology — and invest the difference with discipline." },
    ],
  },
  {
    category:  'Macro Economics',
    headline:  "The Yield Curve: The Single Best Predictor of Recessions the Market Has",
    excerpt:   "The yield curve — specifically the spread between 10-year and 2-year Treasury yields — has inverted before every U.S. recession since 1955, with only one false positive. When short-term rates exceed long-term rates, it signals that investors expect future economic weakness. Understanding this indicator doesn't give you market timing, but it does give you context.",
    concept:   'Yield Curve Inversion',
    definition:"When short-term Treasury yields exceed long-term yields. Historically the most reliable leading indicator of recession, typically preceding economic contraction by 12–18 months. Reflects bond market expectations of future rate cuts.",
    quote:     "The economy is a very complex machine.",
    quoteAttr: 'Janet Yellen',
    href:      '/economic-calendar',
    readTime:  '8 min read',
    books:     ['The Big Short', 'When Money Dies', 'This Time Is Different'],
    body: [
      { type: 'p', text: "In the entire toolkit of economic forecasting — leading indicators, sentiment surveys, purchasing manager indexes, unemployment claims — no single instrument has a better recession-predicting track record than the yield curve. Specifically, the spread between 10-year and 2-year U.S. Treasury yields has inverted before every U.S. recession since 1955. It has generated exactly one false positive (1966). No economist, no model, and no central bank committee has matched that record consistently." },
      { type: 'h2', text: 'Understanding the Yield Curve' },
      { type: 'p', text: "A yield curve plots interest rates on U.S. Treasury bonds across different maturities — from 1-month bills to 30-year bonds. In a healthy economy, the curve slopes upward: short-term rates are lower than long-term rates. This makes intuitive sense — lending money for 10 years should command more interest than lending for 3 months, because longer time horizons carry more uncertainty and opportunity cost. When the curve is steep (long rates much higher than short rates), it typically reflects strong economic growth expectations. When the curve is flat or inverted, it signals trouble." },
      { type: 'chart_line', title: '10Y-2Y Treasury Spread: Inversion Periods vs. Recessions (Simplified)', data: [
        { year: '2018 Q1', spread: 0.51 },
        { year: '2018 Q3', spread: 0.24 },
        { year: '2019 Q1', spread: 0.13 },
        { year: '2019 Q3', spread: -0.04 },
        { year: '2020 Q1', spread: -0.21 },
        { year: '2020 Q3', spread: 0.56 },
        { year: '2021 Q2', spread: 1.35 },
        { year: '2022 Q1', spread: 0.18 },
        { year: '2022 Q3', spread: -0.52 },
        { year: '2023 Q1', spread: -1.08 },
        { year: '2023 Q3', spread: -0.73 },
        { year: '2024 Q1', spread: -0.38 },
        { year: '2024 Q3', spread: 0.12 },
      ], lines: [{ key: 'spread', color: '#c9a96e', label: '10Y-2Y Spread (%)' }], xKey: 'year', yLabel: 'Spread (%)' },
      { type: 'h2', text: 'Why Inversion Predicts Recessions' },
      { type: 'p', text: "The mechanism is well-understood. When the Fed raises short-term rates to fight inflation, short-term Treasury yields rise sharply. If bond market participants believe the rate hikes will slow the economy — eventually forcing rate cuts — long-term yields don't rise as much, because they're priced on expected future short rates. The curve flattens. If the market believes the rate hikes will cause a recession severe enough to require significant future cuts, the curve inverts: long-term yields actually fall below short-term yields." },
      { type: 'p', text: "There's also a direct economic transmission mechanism. Banks borrow at short-term rates and lend at long-term rates — their profit margin is the spread between the two. When the curve inverts, bank lending becomes unprofitable. Banks tighten credit standards, reduce lending, and businesses and consumers find credit harder to obtain. This credit tightening directly slows economic activity. The yield curve doesn't just predict recessions — in part, it causes them." },
      { type: 'stats', items: [
        { value: '100%', label: 'Recession Prediction Rate', sub: 'Every recession since 1955 preceded by inversion' },
        { value: '12–18mo', label: 'Average Lead Time', sub: 'Inversion to recession start' },
        { value: '1', label: 'False Positive', sub: '1966 inversion that did not result in recession' },
        { value: '-1.08%', label: '2023 Peak Inversion', sub: 'Deepest inversion since early 1980s' },
      ]},
      { type: 'callout', text: "The yield curve is a leading indicator, not a market timing tool. The average time from inversion to peak market is 11 months, and stocks often continue rising for months after inversion. Selling because the yield curve inverted has historically been a costly mistake — but ignoring it entirely is equally unwise." },
      { type: 'h2', text: 'What to Do With This Information' },
      { type: 'p', text: "The yield curve is a risk management tool, not a trading signal. When the curve inverts, the appropriate response is not to liquidate equities. It's to review your portfolio's defensive positioning: ensure adequate diversification, review your fixed income duration, confirm your emergency fund is adequate, and stress-test your retirement income plan against a scenario where equities fall 30-40% over the following 24 months. The curve tells you to be thoughtful. It doesn't tell you to panic." },
    ],
  },
  {
    category:  'Business Planning',
    headline:  "The S-Corp Election: How Business Owners Legally Cut Their Tax Bill in Half",
    excerpt:   "A sole proprietor or default LLC earning $200,000 in business profit pays self-employment tax on the full amount — roughly $28,000. An S-Corp election with a reasonable salary of $80,000 limits SE tax to that salary, saving approximately $17,000 annually. The election is irrevocable for five years and requires payroll setup, but for most businesses earning over $50,000 in profit, the math is decisive.",
    concept:   'S-Corp Tax Election',
    definition:"A tax classification that allows a business to pay payroll taxes only on the owner-employee's reasonable salary, rather than total business profit — reducing self-employment tax liability substantially for profitable businesses.",
    quote:     "The avoidance of taxes is the only intellectual pursuit that carries any reward.",
    quoteAttr: 'John Maynard Keynes',
    href:      '/business-planning',
    readTime:  '10 min read',
    books:     ['Tax-Free Wealth', 'Profit First', 'The E-Myth Revisited'],
    body: [
      { type: 'p', text: "Self-employment tax is one of the most expensive and least discussed tax burdens in the U.S. tax code. When you work as an employee, your employer pays half of your FICA taxes (Social Security and Medicare) — 7.65% of your wages. As a sole proprietor or single-member LLC, you pay both halves: 15.3% on all net earnings up to the Social Security wage base ($168,600 in 2024), plus 2.9% on everything above. On $200,000 in business profit, that's approximately $27,800 in self-employment tax before you've paid a dollar of income tax. The S-Corp election is the most reliable and IRS-recognized strategy to reduce this burden." },
      { type: 'h2', text: 'How the S-Corp Election Works' },
      { type: 'p', text: "An S-Corporation is not a business entity — it's a tax election. An LLC or C-Corp files IRS Form 2553 to be taxed as an S-Corp. Once elected, the business must pay the owner-employee a 'reasonable salary' for their work. Payroll taxes are paid only on that salary — not on total business profits. The remaining profit is distributed to the owner as a dividend, which is not subject to self-employment or payroll taxes. This split between salary (taxed) and distribution (not taxed for SE purposes) is the source of the savings." },
      { type: 'chart_bar', title: 'Annual Tax Comparison by Business Structure at $200,000 Net Profit', data: [
        { name: 'Sole Prop /\nDefault LLC', seTax: 27800, incomeTax: 34200, total: 62000 },
        { name: 'S-Corp\n($80K Salary)', seTax: 12240, incomeTax: 34200, total: 46440 },
        { name: 'S-Corp\n($60K Salary)', seTax: 9180, incomeTax: 34200, total: 43380 },
      ], barKey: 'total', nameKey: 'name', color: '#c9a96e', yLabel: 'Total Tax Burden ($)' },
      { type: 'stats', items: [
        { value: '$17,360', label: 'Annual SE Tax Savings', sub: 'S-Corp vs. sole prop at $200K profit, $80K salary' },
        { value: '$50K+', label: 'Minimum Profit Threshold', sub: 'Below this, S-Corp admin costs outweigh savings' },
        { value: '5 Years', label: 'Election Lock-In Period', sub: 'Cannot easily reverse the S-Corp election' },
        { value: '$2,500', label: 'Annual Admin Cost', sub: 'Payroll setup, extra tax filing, bookkeeping' },
      ]},
      { type: 'h2', text: 'The Reasonable Salary Requirement' },
      { type: 'p', text: "The IRS requires that an S-Corp owner-employee be paid a 'reasonable compensation' for their services. This is the most scrutinized aspect of S-Corp planning and the source of most IRS audits in this area. Reasonable compensation is what the market would pay someone to perform the same services. For a software consultant generating $300,000 in revenue, a salary of $40,000 while taking $260,000 as distributions would be unreasonable and an audit flag. A salary of $120,000-140,000 would likely be defensible." },
      { type: 'p', text: "The IRS has several published factors it uses to determine reasonable compensation: the employee's qualifications and training, the nature and extent of the services rendered, the time and effort devoted to the business, the dividend history of the corporation, and the compensation paid by comparable businesses. Courts have consistently found that owner-employees in service businesses should receive salaries that represent the majority of business profits — often 60-70% for high-skill service providers." },
      { type: 'h2', text: 'The Additional Benefits: Retirement Plans and Health Insurance' },
      { type: 'p', text: "The S-Corp election opens access to significantly enhanced retirement plan contributions. As an S-Corp employee, you can establish a SEP-IRA, Solo 401(k), or defined benefit pension plan. A Solo 401(k) with an S-Corp allows contributions of up to $69,000 in 2024 ($76,500 with catch-up for those 50+). This compares to the $7,000 IRA limit available to sole proprietors without earned income above limits. The tax deferral on those additional contributions can exceed $20,000 annually for high earners." },
      { type: 'callout', text: "An S-Corp owner earning $200,000 in profits who takes a $100,000 salary can contribute $23,000 employee deferral plus $25,000 employer match (25% of W-2 wages) to a Solo 401(k) — a total of $48,000 in pre-tax retirement contributions. A sole proprietor with the same income is limited to 20% of self-employment net earnings — approximately $35,500. The S-Corp structure adds $12,500 more in annual tax-deferred retirement savings." },
      { type: 'h2', text: 'When to Make the Election — and When Not To' },
      { type: 'p', text: "The S-Corp election makes mathematical sense when net business profit exceeds approximately $50,000-60,000 annually, the annual administrative costs (payroll service, extra tax preparation, state filings) are below the SE tax savings, and the business owner plans to maintain the structure for at least 5 years. Below $50,000 in profit, the administrative overhead typically exceeds the tax savings. Above $168,600 (the Social Security wage base), the savings calculation changes — only Medicare taxes (2.9%) apply above the base, reducing the marginal SE tax savings on distributions above that threshold." },
    ],
  },
  {
    category:  'Social Security',
    headline:  "Claiming Social Security at 62 vs. 70: The $250,000 Decision Most Get Wrong",
    excerpt:   "Claiming Social Security at 62 gives you benefits immediately — but permanently reduced by up to 30%. Waiting until 70 increases your benefit by 8% per year above full retirement age. For a couple where one spouse has a high earning record, the lifetime difference in total benefits can exceed $250,000. The break-even age is typically 82. If you expect to live past it, waiting almost always wins.",
    concept:   'Delayed Retirement Credits',
    definition:"The 8% annual increase in Social Security benefits for each year of delay between full retirement age (67 for those born after 1960) and age 70. This enhancement is permanent and inflation-adjusted for life.",
    quote:     "Compound interest is the eighth wonder of the world.",
    quoteAttr: 'Albert Einstein (attributed)',
    href:      '/social-security',
    readTime:  '9 min read',
    books:     ['Get What\'s Yours', 'Social Security Made Simple', 'The New Retirement Savings Time Bomb'],
    body: [
      { type: 'p', text: "The Social Security claiming decision is the single largest financial decision most Americans will make in retirement planning — larger than any investment choice, larger than most home purchases — yet it receives a fraction of the attention those decisions get. For a married couple where one spouse had a career earning the median U.S. wage, the difference between the worst and best claiming strategy can exceed $200,000 in lifetime benefits. For a couple with one high earner, it can exceed $400,000. The decision is permanent, irreversible after age 60 (with limited exceptions), and most people make it with less than an hour of analysis." },
      { type: 'h2', text: 'The Mechanics of How Benefits Are Calculated' },
      { type: 'p', text: "Social Security benefits are calculated based on your Average Indexed Monthly Earnings (AIME) — the average of your 35 highest earning years, indexed for wage inflation. The benefit formula applies three percentage brackets (the 'bend points') to this average, resulting in your Primary Insurance Amount (PIA) — the monthly benefit you receive at your Full Retirement Age (FRA). For those born in 1960 or later, FRA is age 67. Claiming before FRA permanently reduces your benefit; claiming after FRA permanently increases it via delayed retirement credits." },
      { type: 'chart_line', title: 'Monthly Benefit by Claiming Age ($2,000/mo at FRA 67)', data: [
        { age: 'Age 62', benefit: 1400 },
        { age: 'Age 63', benefit: 1467 },
        { age: 'Age 64', benefit: 1533 },
        { age: 'Age 65', benefit: 1667 },
        { age: 'Age 66', benefit: 1833 },
        { age: 'Age 67', benefit: 2000 },
        { age: 'Age 68', benefit: 2160 },
        { age: 'Age 69', benefit: 2320 },
        { age: 'Age 70', benefit: 2480 },
      ], lines: [{ key: 'benefit', color: '#c9a96e', label: 'Monthly Benefit ($)' }], xKey: 'age', yLabel: 'Monthly Benefit ($)' },
      { type: 'stats', items: [
        { value: '-30%', label: 'Claiming at 62', sub: 'Permanent reduction from FRA benefit' },
        { value: '+24%', label: 'Claiming at 70', sub: 'Permanent increase from FRA (8%/year × 3 years)' },
        { value: 'Age 82', label: 'Break-Even Age', sub: 'When delayed claiming total exceeds early claiming total' },
        { value: '50%', label: 'Survivor Benefit', sub: 'Spouse receives higher earner\'s benefit at death' },
      ]},
      { type: 'h2', text: 'Why the Claiming Decision Is Especially Critical for Couples' },
      { type: 'p', text: "For married couples, the claiming analysis becomes dramatically more complex because of survivor benefits. When one spouse dies, the surviving spouse receives the higher of their own benefit or their deceased spouse's benefit — not both. This means the higher earner's benefit level will be received by someone for the rest of their life: the higher earner, then the survivor. Maximizing the higher earner's benefit by delaying to 70 is therefore a form of longevity insurance for the surviving spouse, who statistically has a significant probability of living into their 90s." },
      { type: 'p', text: "A common and often optimal strategy for couples: the lower earner claims at 62 or 63, generating income during the gap years while the higher earner continues working or drawing from retirement savings. The higher earner delays to 70, maximizing the benefit that will ultimately determine both spouses' income if one lives to 85, 90, or beyond. This split strategy often produces the best lifetime outcome while minimizing the period both spouses must live without Social Security income." },
      { type: 'h2', text: 'The Bridge Strategy: Using Portfolio Withdrawals to Delay' },
      { type: 'p', text: "The most powerful implementation of delayed claiming is the bridge strategy: drawing down your retirement portfolio from age 62-70 to replace the Social Security income you're forgoing, while your benefit grows at 8% per year. The 8% delayed retirement credit is a guaranteed, inflation-adjusted, longevity-insured return — better than any annuity on the market and better than most bonds. For retirees in good health with adequate assets, spending down their portfolio from 62-70 to maximize Social Security is mathematically compelling." },
      { type: 'callout', text: "Delaying from 62 to 70 increases the monthly benefit by 77% — from 70% of PIA to 124% of PIA. For every $1,000/month PIA, this represents $54,000 in additional annual benefit if you live to 90. The break-even calculation changes significantly with COLA adjustments, which compound the higher benefit over time." },
    ],
  },
  {
    category:  'Estate Planning',
    headline:  "A Will Is Not an Estate Plan: What Actually Happens to Your Assets When You Die",
    excerpt:   "Most people with a will believe their estate is 'handled.' It isn't. Beneficiary designations on retirement accounts and life insurance override your will entirely — meaning an ex-spouse named on a 401(k) from 2005 receives those assets regardless of what your current will says. A complete estate plan includes a will, trust, powers of attorney, healthcare directives, and updated beneficiary designations on every account.",
    concept:   'Beneficiary Designation',
    definition:"A legal mechanism that directs asset transfer at death outside of probate. Beneficiary designations on retirement accounts, life insurance, and POD accounts supersede instructions in a will — making them the most commonly overlooked estate planning element.",
    quote:     "The only certainties in life are death and taxes.",
    quoteAttr: 'Benjamin Franklin',
    href:      '/FuturePlanning',
    readTime:  '9 min read',
    books:     ['Beating the Death Tax', 'Beyond the Grave', 'The Wall Street Journal Guide to Estate Planning'],
    body: [
      { type: 'p', text: "Every year, American families experience a financial tragedy that a simple conversation and $500 in legal fees would have prevented: assets going to the wrong person. A retirement account worth $800,000 passes to an ex-spouse because a beneficiary form was never updated after a divorce. A life insurance policy pays out to a deceased parent because the primary beneficiary was never changed after the parent's death. A real estate holding gets stuck in probate for 18 months because the owner died intestate. These aren't rare edge cases — they are the predictable outcomes of incomplete estate planning." },
      { type: 'h2', text: 'How Assets Actually Transfer at Death' },
      { type: 'p', text: "Understanding estate planning requires understanding that different assets transfer through different legal mechanisms, and a will only controls one of them. Assets transfer through three channels: by operation of law (joint tenancy with right of survivorship, tenancy by the entirety), by contract (beneficiary designations on retirement accounts, life insurance, annuities, and POD/TOD bank and brokerage accounts), and through the probate process (assets solely owned without a beneficiary designation — governed by your will or state intestacy law). The majority of most families' wealth — retirement accounts and life insurance — transfers by contract, completely bypassing the will." },
      { type: 'list', items: [
        'Your Will controls: assets in your name alone without beneficiary designations. Goes through probate (public, time-consuming, expensive in some states).',
        'Beneficiary Designations control: 401(k), IRA, Roth IRA, 403(b), life insurance, annuities, and any account with a POD/TOD designation. Completely bypasses your will.',
        'Joint Ownership controls: jointly held property (home with spouse, joint bank accounts). Passes automatically to survivor.',
        'Trusts control: any asset transferred into the trust. Bypasses probate, provides more control, protects privacy.',
      ]},
      { type: 'h2', text: 'The Five Documents Every Adult Needs' },
      { type: 'p', text: "A complete estate plan is not complex for most people. It requires five documents and a beneficiary designation audit. The first is a Last Will and Testament, which names guardians for minor children (critically important for parents) and governs the distribution of any assets that pass through probate. The second is a Revocable Living Trust, which holds your assets and transfers them to beneficiaries without probate — essential in high-probate states like California and Florida, optional but beneficial in others." },
      { type: 'p', text: "The third document is a Durable Power of Attorney, which names someone to manage your financial affairs if you are incapacitated. Without it, your family may need court-supervised guardianship to manage your finances during a serious illness — a process that can cost tens of thousands of dollars and months of time. The fourth is a Healthcare Power of Attorney (or Healthcare Proxy), naming someone to make medical decisions for you. The fifth is an Advance Healthcare Directive (Living Will), which specifies your wishes for end-of-life care." },
      { type: 'stats', items: [
        { value: '60%', label: 'Americans Without a Will', sub: 'Most families have no estate plan at all' },
        { value: '$3,000–7,000', label: 'Average Probate Cost', sub: 'Plus 9–24 months before assets transfer' },
        { value: '$500–2,000', label: 'Complete Estate Plan Cost', sub: 'Will, trust, POA, and healthcare directives' },
        { value: '$12.9M', label: '2024 Federal Estate Exemption', sub: 'Estates below this face no federal estate tax' },
      ]},
      { type: 'callout', text: "The most common and easily preventable estate planning disaster: a retirement account naming a parent as beneficiary, the parent dying before the account owner, no contingent beneficiary named. Result: the account goes through probate, is distributed under a court timeline, and loses all stretch IRA tax deferral benefits. Review all beneficiary designations annually." },
      { type: 'h2', text: 'The Beneficiary Designation Audit' },
      { type: 'p', text: "Gather every account statement you have — every 401(k), IRA, Roth IRA, life insurance policy, annuity, and bank account — and review the beneficiary designations on file. Verify: primary beneficiaries are current (post-divorce, post-death of a named beneficiary), contingent beneficiaries are named on every account, minor children are not named directly (assets in trust or under UTMA/UGMA are preferable), and all accounts that can accept a TOD/POD designation have one. Do this review every three years or after every major life event: marriage, divorce, death of a family member, birth of a child." },
    ],
  },
  {
    category:  'Market Intelligence',
    headline:  "Dollar-Cost Averaging vs. Lump Sum: What 50 Years of Market Data Shows",
    excerpt:   "Vanguard research analyzing 68 years of market data found that investing a lump sum immediately outperforms dollar-cost averaging approximately two-thirds of the time. This is counterintuitive — but mathematically expected in markets that trend upward over time. DCA wins the one-third of the time markets fall after your investment date. The psychological value of DCA, however, is real and measurable.",
    concept:   'Dollar-Cost Averaging',
    definition:"An investment strategy of dividing a total investment into equal periodic purchases to reduce exposure to timing risk. Reduces average cost per share in declining markets; underperforms lump-sum investing in rising markets.",
    quote:     "Time in the market beats timing the market.",
    quoteAttr: 'Ken Fisher',
    href:      '/dashboard',
    readTime:  '7 min read',
    books:     ['The Little Book of Common Sense Investing', 'A Random Walk Down Wall Street', 'The Four Pillars of Investing'],
    body: [
      { type: 'p', text: "The question comes up every time someone inherits money, receives a large bonus, or sells a business: invest it all at once, or spread it out over time? Conventional wisdom says to spread it out — dollar-cost averaging feels safer, more prudent, less likely to result in regret if markets fall right after you invest. Vanguard's research says conventional wisdom is wrong two-thirds of the time. Understanding why — and when each strategy makes sense — is foundational investment literacy." },
      { type: 'h2', text: "Vanguard's 68-Year Study: The Definitive Data" },
      { type: 'p', text: "In 2012, Vanguard published 'Dollar-Cost Averaging Just Means Taking Risk Later,' analyzing U.S., U.K., and Australian market data from 1926 through 2011. The methodology: compare investing a lump sum immediately versus deploying it in equal monthly installments over 12 months, across every possible 12-month starting window in the dataset. Lump sum outperformed dollar-cost averaging 68% of the time in U.S. markets, 71% in the U.K., and 70% in Australia — with an average outperformance margin of approximately 2.3%." },
      { type: 'chart_bar', title: 'Lump Sum vs. DCA Performance Outcomes (Vanguard Analysis)', data: [
        { name: 'LSI Outperforms\n(All Markets)', value: 69, fill: '#c9a96e' },
        { name: 'DCA Outperforms\n(All Markets)', value: 31, fill: '#6b5540' },
        { name: 'LSI Avg Margin\nWhen It Wins', value: 2.3, fill: '#c9a96e' },
        { name: 'DCA Avg Margin\nWhen It Wins', value: 1.1, fill: '#6b5540' },
      ], barKey: 'value', nameKey: 'name', color: '#c9a96e', yLabel: '% of Time / Avg Margin %' },
      { type: 'h2', text: "Why Lump Sum Wins More Often" },
      { type: 'p', text: "The mathematics are simple. Markets trend upward over time — that's the foundational premise of long-term equity investing. If markets go up, money invested today will be worth more than money invested in 6 months. DCA, by definition, keeps some of your capital in cash (or lower-returning safe assets) while waiting to deploy. In rising markets, that cash drag costs you. DCA only wins when markets fall significantly after your investment date — which historically happens about one-third of the time over 12-month windows." },
      { type: 'p', text: "This doesn't mean DCA is irrational. Its value is psychological and behavioral. Research by Shlomo Benartzi and Richard Thaler shows that investors who use DCA experience less regret and are less likely to abandon their investment plan after market declines. A 2.3% return disadvantage is worth accepting if the alternative is panic-selling after investing a lump sum at a market peak. For investors who know they would react emotionally to a sharp decline right after a large investment, DCA is the better strategy — not because of math, but because of behavior." },
      { type: 'h2', text: "The Practical Framework: When to Use Each" },
      { type: 'list', items: [
        'Lump sum is mathematically optimal when: you have a long time horizon (10+ years), you have high risk tolerance, you understand that short-term declines after investment are likely and acceptable, and the capital is truly investable money you won\'t need for years.',
        'DCA is practically superior when: the lump sum represents a life-changing amount whose loss would devastate you financially or psychologically, you have evidence from past behavior that you panic-sell after downturns, or you\'re investing during a period of extreme market overvaluation (elevated CAPE ratios).',
        'For ongoing income (paychecks), DCA is automatic and the right framework — you invest each pay period because that\'s when the money arrives, not as a strategic timing choice.',
      ]},
      { type: 'callout', text: "The worst outcome isn't lump sum or DCA — it's value averaging delayed to infinity. Investors who say 'I'll wait for a pullback before investing' and never invest are the group that most reliably underperforms. Both lump sum and DCA beat not investing by a wide margin. The decision between them is secondary to the decision to invest at all." },
    ],
  },
  {
    category:  'Family Planning',
    headline:  "The Real Cost of a Child: What Financial Plans Miss About Starting a Family",
    excerpt:   "The USDA estimates $310,605 to raise a child to 18. Add four years of private college at $60,000/year, and the total exceeds $550,000 per child. What this figure misses: the opportunity cost of reduced work hours, career interruptions, and assets not invested during the most powerful compounding years. Financial planning for a family requires modeling income changes, not just expenses.",
    concept:   'Human Capital',
    definition:"The present value of an individual's future earning power. Financial planning must account for changes to human capital — career interruptions, skill depreciation, and income trajectory changes — not just balance sheet assets.",
    quote:     "Children are not a distraction from more important work. They are the most important work.",
    quoteAttr: 'C.S. Lewis',
    href:      '/family-planning',
    readTime:  '8 min read',
    books:     ['The Two-Income Trap', 'Financially Fearless', 'On My Own Two Feet'],
    body: [
      { type: 'p', text: "No financial decision carries more emotional weight — or more commonly incomplete financial modeling — than the choice to start a family. The USDA's annual cost-of-raising-a-child report gets widely cited. The number varies by income level and geography, but for a middle-income family in 2024, the direct cost from birth through age 17 is approximately $310,000. Add four years of college, and you're at $450,000-$550,000 per child in direct costs. These are significant, but they're only part of the financial picture. The costs that don't show up in any government study are often larger." },
      { type: 'h2', text: 'The USDA Number: What It Includes and What It Misses' },
      { type: 'p', text: "The USDA's calculation covers housing (the largest component at roughly 29%), food, transportation, healthcare, clothing, childcare and education, and miscellaneous expenses. What it does not include: the cost of college beyond basic estimates, the opportunity cost of career interruptions, the lost investment compounding from years of reduced savings, and the geographic variance that makes these numbers nearly meaningless for families in New York, San Francisco, or Boston where childcare alone can cost $30,000-50,000 per year per child." },
      { type: 'chart_bar', title: 'USDA Cost of Raising One Child to Age 18 — Component Breakdown', data: [
        { name: 'Housing', cost: 88500 },
        { name: 'Food', cost: 41200 },
        { name: 'Childcare /\nEducation', cost: 37100 },
        { name: 'Transportation', cost: 34800 },
        { name: 'Healthcare', cost: 14600 },
        { name: 'Clothing', cost: 16100 },
        { name: 'Other', cost: 18300 },
      ], barKey: 'cost', nameKey: 'name', color: '#c9a96e', yLabel: 'Cost ($)' },
      { type: 'h2', text: 'The Hidden Cost: Human Capital Interruption' },
      { type: 'p', text: "The most significant and least discussed financial impact of having children is the effect on human capital — the present value of future earnings. Research by economists Claudia Goldin and Lawrence Katz shows that the earnings gap between men and women without children is nearly zero in most professional fields. The gap between mothers and equivalent women without children — the 'child penalty' — is substantial and persistent: approximately 15-30% in earnings over a career for the primary caregiving parent." },
      { type: 'p', text: "The mechanism is straightforward: the first few years of a child's life often require one parent to take leave, reduce hours, turn down travel or promotion opportunities, or leave the workforce temporarily. During these same years — the early to mid-career phase — professional salaries grow most rapidly. Skills and networks atrophy during gaps. The compounding effect of a 2-3 year reduced earnings period in your early 30s extends across the entire remaining career." },
      { type: 'stats', items: [
        { value: '$310K', label: 'Direct Costs to Age 18', sub: 'USDA estimate, middle-income family' },
        { value: '$240K+', label: 'College 4 Years (Private)', sub: '$60,000/year, not inflation-adjusted' },
        { value: '15–30%', label: 'Maternal Earnings Penalty', sub: 'Career earnings gap for primary caregiving parent' },
        { value: '$50K/yr', label: 'Urban Infant Childcare', sub: 'NYC, SF, Boston — per child, per year' },
      ]},
      { type: 'h2', text: 'Planning Tools That Actually Help' },
      { type: 'p', text: "The financial planning that most meaningfully prepares families for children involves four parallel tracks. First, the emergency fund must be extended: families with children need 6 months of expenses minimum, as medical emergencies, job loss, and unexpected childcare disruptions happen more frequently. Second, a 529 plan should be opened at birth or even before — 18 years of compounding on early contributions is dramatic." },
      { type: 'p', text: "Third, life and disability insurance coverage must be reviewed before pregnancy, not after. A family with a new dependent and no life insurance is taking on existential financial risk. Fourth — and most neglected — model the income impact explicitly. A couple where one partner earns $120,000 and plans to take 6 months leave, then work part-time for 2 years, should model the $60,000-80,000 reduction in household income against their mortgage payment, savings rate, and retirement projections before the decision, not after." },
      { type: 'callout', text: "The 529 plan is one of the most tax-advantaged accounts in the U.S. tax code: contributions grow tax-free, withdrawals for qualified education expenses are tax-free, and many states offer a state income tax deduction on contributions. Contributing $500/month from birth to age 18 at a 7% return yields approximately $195,000 — enough to substantially fund a four-year degree at today's costs." },
    ],
  },
  {
    category:  'Retirement Planning',
    headline:  "The Roth Conversion Ladder: Engineering Tax-Free Retirement Income",
    excerpt:   "Traditional IRA and 401(k) withdrawals are taxed as ordinary income. A Roth conversion moves money from tax-deferred to tax-free — you pay taxes now, at today's rates, to eliminate taxes on all future growth. The optimal strategy converts just enough each year to fill up your current tax bracket without crossing into the next. Done over 10+ years before retirement, this can dramatically reduce lifetime tax liability.",
    concept:   'Roth Conversion',
    definition:"The process of moving funds from a traditional IRA or 401(k) to a Roth account. The converted amount is taxed as ordinary income in the year of conversion. Future growth and qualified withdrawals are permanently tax-free.",
    quote:     "The best time to plant a tree was twenty years ago. The second best time is now.",
    quoteAttr: 'Chinese Proverb',
    href:      '/retirement-planning',
    readTime:  '9 min read',
    books:     ['The New Retirement Savings Time Bomb', 'Tax-Free Wealth', 'Retire Secure'],
    body: [
      { type: 'p', text: "The U.S. tax code offers three types of retirement accounts: taxable (you pay tax before investing, the account grows tax-free — Roth), tax-deferred (you defer taxes until withdrawal — traditional IRA and 401k), and fully taxable (no special treatment). For most Americans, the bulk of their retirement savings is in tax-deferred accounts. When withdrawals begin — whether voluntary or forced through Required Minimum Distributions starting at age 73 — every dollar comes out taxed at ordinary income rates. For high-balance retirees, this creates a looming tax problem that grows larger every year the account compounds. The Roth conversion ladder is the proactive solution." },
      { type: 'h2', text: 'The RMD Time Bomb' },
      { type: 'p', text: "A 55-year-old with $1.2M in a traditional IRA who continues contributing $23,000/year until 65 will have approximately $2.5-3M in that account at retirement. Starting at age 73, the IRS requires a minimum distribution based on the account balance divided by a life expectancy factor. At age 73 with $3M, the RMD is approximately $115,000. Added to Social Security income of $40,000, total taxable income exceeds $155,000 — pushing the retiree well into the 22% bracket, possibly 24% or higher. Every year of inaction makes the tax bill larger." },
      { type: 'chart_line', title: 'Projected IRA Balance Growth Without Conversion vs. With Conversion Strategy', data: [
        { age: 'Age 55', noConvert: 1200, withConvert: 1200 },
        { age: 'Age 58', noConvert: 1580, withConvert: 1320 },
        { age: 'Age 61', noConvert: 2080, withConvert: 1480 },
        { age: 'Age 64', noConvert: 2740, withConvert: 1680 },
        { age: 'Age 67', noConvert: 3210, withConvert: 1820 },
        { age: 'Age 70', noConvert: 3760, withConvert: 1940 },
        { age: 'Age 73', noConvert: 4410, withConvert: 2050 },
      ], lines: [{ key: 'noConvert', color: '#6b5540', label: 'No Conversion' }, { key: 'withConvert', color: '#c9a96e', label: 'With Conversions' }], xKey: 'age', yLabel: 'Balance ($000s)' },
      { type: 'h2', text: 'The Conversion Window: The Most Valuable Years in Tax Planning' },
      { type: 'p', text: "The ideal window for Roth conversions is the period between retirement and the start of Social Security and Medicare, typically ages 60-70. During this window, income often drops sharply from career earnings — creating lower marginal tax brackets. Social Security hasn't started yet (so it's not adding to taxable income). Medicare premium surcharges (IRMAA) haven't fully kicked in (though two-year lookback means planning is needed). And RMDs haven't started. This window is finite, and most retirees leave it unused." },
      { type: 'stats', items: [
        { value: '$47,150', label: '22% Bracket Floor (Single)', sub: 'Income above this enters the 22% federal bracket (2024)' },
        { value: '$94,300', label: '22% Bracket Floor (MFJ)', sub: 'Married filing jointly 22% bracket starts here' },
        { value: '10 Years', label: 'Optimal Conversion Window', sub: 'Ages 60-70 for most retirement savers' },
        { value: '$0', label: 'Tax on Growth After Conversion', sub: 'All Roth growth and qualified withdrawals tax-free' },
      ]},
      { type: 'h2', text: 'Bracket-Filling: The Core Strategy' },
      { type: 'p', text: "The most common Roth conversion strategy is 'bracket filling': each year during the conversion window, convert enough traditional IRA assets to bring your total taxable income to the top of your target bracket without crossing into the next. For a retired couple with $40,000 in pension and Social Security income, the 22% bracket extends to $201,050. That means they can convert up to $161,050 of traditional IRA assets per year while staying in the 22% bracket — paying 22 cents of federal tax for every dollar converted, permanently removing it from future tax at potentially higher rates." },
      { type: 'callout', text: "The SECURE Act 2.0 (2022) raised the RMD age to 73 (73 as of 2023, moving to 75 in 2033). This extended the Roth conversion window by several years for many retirees — a significant planning opportunity that many haven't incorporated into their strategy." },
      { type: 'p', text: "The conversion decision requires modeling multiple variables simultaneously: current tax rates vs. projected future rates, estate planning goals (Roth accounts have no RMDs and pass tax-free to heirs), Medicare IRMAA thresholds, state income taxes, and the opportunity cost of paying taxes today versus deferring them. This complexity is precisely why Roth conversion analysis is one of the highest-value services a financial planner can provide — and why generic advice rarely captures the full picture." },
    ],
  },
  {
    category:  'Wealth Building',
    headline:  "Asset Location: The Silent Strategy That Adds 0.8% Without Any Additional Risk",
    excerpt:   "Asset location is the practice of holding each investment in the account type that minimizes its tax burden. Bonds and REITs, which generate ordinary income, belong in tax-deferred accounts. Growth stocks, which generate long-term capital gains, belong in taxable accounts. Index funds belong in taxable; active funds in tax-deferred. Morningstar research shows this strategy adds 0.2–0.8% in annual after-tax returns with zero change to the investment itself.",
    concept:   'Asset Location',
    definition:"A tax minimization strategy that places different asset classes in account types that minimize their tax treatment — holding tax-inefficient assets in tax-deferred accounts and tax-efficient assets in taxable accounts.",
    quote:     "It's not what you earn, it's what you keep.",
    quoteAttr: 'Unknown',
    href:      '/tax-planning',
    readTime:  '7 min read',
    books:     ['The Bogleheads Guide to Retirement Planning', 'Tax-Free Wealth', 'The White Coat Investor'],
    body: [
      { type: 'p', text: "Asset allocation — how you divide your portfolio between stocks, bonds, real estate, and other asset classes — gets most of the attention in investment planning. Asset location — which accounts you hold those assets in — gets almost none. This is a significant oversight. Morningstar's research by Christine Benz and Russ Kinnel found that optimal asset location adds between 0.20% and 0.80% in after-tax annual returns, depending on the investor's tax bracket and the composition of their portfolio. Over a 30-year career, that compounding difference represents a meaningful addition to total wealth, with zero change to the underlying investments or risk exposure." },
      { type: 'h2', text: 'The Tax Profile of Different Asset Classes' },
      { type: 'p', text: "Different investments generate different types of income, and the U.S. tax code taxes those types at dramatically different rates. Understanding each asset class's 'tax efficiency' is the foundation of asset location strategy. Bonds generate ordinary interest income taxed at your highest marginal rate — potentially 37% for high earners. REITs are required to distribute 90% of taxable income as dividends, most of which are non-qualified dividends taxed as ordinary income. High-dividend stocks generate qualified dividends taxed at 0%, 15%, or 20% based on income level. Index funds with minimal portfolio turnover generate almost no annual taxable distributions." },
      { type: 'chart_bar', title: 'Tax Efficiency by Asset Class (Higher = More Tax Efficient)', data: [
        { name: 'Total Market\nIndex Fund', efficiency: 95 },
        { name: 'Growth\nStocks', efficiency: 88 },
        { name: 'Muni Bonds\n(Taxable Acct)', efficiency: 85 },
        { name: 'Dividend\nStocks', efficiency: 65 },
        { name: 'Active\nEquity Fund', efficiency: 55 },
        { name: 'REITs', efficiency: 30 },
        { name: 'Corporate\nBonds', efficiency: 15 },
        { name: 'Treasury\nBonds', efficiency: 10 },
      ], barKey: 'efficiency', nameKey: 'name', color: '#c9a96e', yLabel: 'Tax Efficiency Score' },
      { type: 'h2', text: 'The Location Hierarchy: Where Each Asset Belongs' },
      { type: 'list', items: [
        'Roth IRA (tax-free): Your best long-term growth assets — small-cap equities, emerging markets, high-conviction individual growth stocks. Assets that will compound the most over decades belong where all that future growth is permanently tax-free.',
        'Traditional IRA / 401(k) (tax-deferred): Tax-inefficient assets — bonds, REITs, high-dividend stocks, actively managed equity funds with high turnover. The tax drag on these is highest, so sheltering them in deferred accounts saves the most.',
        'Taxable brokerage (taxable): Tax-efficient assets — broad market index funds, individual growth stocks you plan to hold long-term, municipal bonds. These generate minimal taxable distributions and benefit from long-term capital gains rates when sold.',
        'HSA (triple tax-advantaged): If available, invest aggressively. Contributions are pre-tax, growth is tax-free, withdrawals for medical expenses are tax-free. After age 65, withdrawals for any purpose are taxed like a traditional IRA — making it effectively a superior version of a traditional IRA.',
      ]},
      { type: 'h2', text: 'The Implementation Complexity' },
      { type: 'p', text: "Asset location is most impactful when you have assets spread across multiple account types — retirement accounts and taxable accounts simultaneously. The strategy requires viewing your entire household balance sheet as a single portfolio, with different accounts holding different pieces of that portfolio based on tax efficiency rather than each account holding a complete mini-portfolio. This is a non-trivial mental shift: it means your brokerage account might hold only index funds while your IRA holds all your bonds, even though at a portfolio level you maintain the same overall allocation." },
      { type: 'callout', text: "A common mistake: holding the same target-date fund in every account (Roth, traditional, taxable). This is convenient but ignores asset location entirely. The bonds inside that target-date fund in your Roth IRA are taking up space where your highest-growth assets should be. Customizing each account's holdings based on its tax treatment is worth the additional complexity." },
    ],
  },
  {
    category:  'Market Intelligence',
    headline:  "Understanding the Fed: Why Interest Rate Decisions Move Every Asset Class",
    excerpt:   "The Federal Reserve sets the federal funds rate — the interest rate at which banks lend to each other overnight. This single number ripples through every asset class: rising rates make bonds less valuable, increase mortgage costs, reduce the present value of future earnings, and strengthen the dollar. Understanding the transmission mechanism between Fed policy and your portfolio is foundational market literacy.",
    concept:   'Federal Funds Rate',
    definition:"The target interest rate set by the Federal Open Market Committee at which commercial banks borrow and lend reserves to each other overnight. The primary tool of U.S. monetary policy, influencing borrowing costs, inflation, and economic activity throughout the economy.",
    quote:     "Inflation is taxation without legislation.",
    quoteAttr: 'Milton Friedman',
    href:      '/economic-calendar',
    readTime:  '8 min read',
    books:     ['The Creature from Jekyll Island', 'When the Money Runs Out', 'Lords of Finance'],
    body: [
      { type: 'p', text: "Eight times per year, a committee of twelve economists convenes in Washington D.C. and makes a decision that moves global asset markets more than almost any other single event. The Federal Open Market Committee (FOMC) sets the federal funds rate — the overnight rate at which banks lend reserves to each other. This number, which banks rarely interact with directly, propagates through the financial system via a chain of mechanisms that ultimately affects every mortgage, every corporate loan, every bond, every equity valuation, and every dollar held in savings. Understanding the transmission mechanism is essential for any investor." },
      { type: 'h2', text: 'The Transmission Mechanism: How One Rate Moves Everything' },
      { type: 'p', text: "The federal funds rate creates a floor below which banks won't lend — if they can earn the fed funds rate risk-free, why lend at less? This floor propagates upward: overnight rates influence short-term Treasury yields, which influence money market rates, which influence bank savings rates and short-term CD rates, which influence corporate short-term borrowing costs, which influence consumer credit card rates. Simultaneously, the Fed's rate decisions signal future inflation and growth expectations, which influence the long end of the yield curve through investor behavior. The entire interest rate complex — from overnight to 30-year — is anchored to the FOMC's decisions." },
      { type: 'chart_line', title: 'Federal Funds Rate vs. 10-Year Treasury Yield (Recent Cycle)', data: [
        { date: 'Jan 2022', fedRate: 0.08, t10: 1.76 },
        { date: 'Jun 2022', fedRate: 1.58, t10: 3.13 },
        { date: 'Dec 2022', fedRate: 4.33, t10: 3.88 },
        { date: 'Jun 2023', fedRate: 5.08, t10: 3.84 },
        { date: 'Dec 2023', fedRate: 5.33, t10: 3.97 },
        { date: 'Jun 2024', fedRate: 5.33, t10: 4.36 },
        { date: 'Dec 2024', fedRate: 4.33, t10: 4.58 },
      ], lines: [{ key: 'fedRate', color: '#c9a96e', label: 'Fed Funds Rate' }, { key: 't10', color: '#6b5540', label: '10-Year Treasury' }], xKey: 'date', yLabel: 'Rate (%)' },
      { type: 'h2', text: 'How Rising Rates Affect Each Asset Class' },
      { type: 'list', items: [
        'Bonds: Rising rates reduce the present value of fixed coupon payments — bond prices fall inversely to rate increases. A 10-year bond with a 1% yield loses approximately 9% of its price for every 1% rise in rates (its "duration" risk). 2022 was the worst bond market year since the 1970s precisely because of rapid rate increases.',
        'Stocks: Rising rates increase the discount rate used to value future earnings — reducing the theoretical value of all equities. Growth stocks (high future earnings, minimal current cash flow) are most sensitive. Value stocks and financials are more resilient.',
        'Real Estate: Higher mortgage rates directly reduce purchasing power. A 1% increase in mortgage rates reduces borrowing capacity by approximately 10%. Rising rates also increase cap rate requirements for commercial real estate, compressing valuations.',
        'Cash and Short-Term Bonds: The rare beneficiary of rising rates. Money market funds, CDs, and short-term Treasuries saw yields above 5% in 2023-2024 for the first time since 2007.',
        'The U.S. Dollar: Higher U.S. rates attract foreign capital seeking returns — increasing demand for dollars and strengthening the currency. A stronger dollar pressures earnings of multinational U.S. companies with significant overseas revenue.',
      ]},
      { type: 'stats', items: [
        { value: '8×/Year', label: 'FOMC Meetings', sub: 'Eight scheduled meetings plus emergency sessions' },
        { value: '0.25%', label: 'Standard Rate Move', sub: 'Fed typically moves in 25bps increments' },
        { value: '5.25–5.50%', label: '2023 Peak Rate', sub: 'Highest federal funds rate since 2001' },
        { value: '18–24mo', label: 'Policy Lag', sub: 'Time for rate changes to fully flow through economy' },
      ]},
      { type: 'callout', text: "The Fed does not control the 10-year Treasury yield — that's set by the bond market. The Fed controls only the overnight rate. When these two diverge significantly (as in 2023-2024, when the 10-year remained elevated despite expectations of cuts), it reveals a bond market that has a different view of inflation and growth than the Fed's forward guidance implies." },
    ],
  },
  {
    category:  'Tax Strategy',
    headline:  "The Backdoor Roth: How High Earners Access Tax-Free Retirement Accounts",
    excerpt:   "Roth IRA contributions phase out at $161,000 for single filers and $240,000 for married filers in 2024. But the backdoor Roth — contributing to a non-deductible traditional IRA and immediately converting — is legal for any income level. The strategy requires clean execution and awareness of the pro-rata rule, which can create unexpected taxes if you have other traditional IRA balances.",
    concept:   'Backdoor Roth IRA',
    definition:"A legal strategy for high-income earners to fund a Roth IRA by making a non-deductible contribution to a traditional IRA and then converting it to Roth. Requires careful management of the pro-rata rule to avoid unintended tax consequences.",
    quote:     "The hardest thing in the world to understand is the income tax.",
    quoteAttr: 'Albert Einstein (attributed)',
    href:      '/tax-planning',
    readTime:  '8 min read',
    books:     ['The White Coat Investor', 'Tax-Free Wealth', 'Retire Secure'],
    body: [
      { type: 'p', text: "The Roth IRA is one of the most valuable accounts in the U.S. tax code: contributions grow tax-free, qualified withdrawals are tax-free, and unlike traditional IRAs, there are no Required Minimum Distributions during the account owner's lifetime. The problem: Congress capped who can contribute. In 2024, Roth IRA contributions phase out for single filers earning $146,000-$161,000 and married filing jointly earning $230,000-$240,000. Above these thresholds, direct contributions are prohibited. The backdoor Roth is the IRS-recognized workaround that high earners have used since 2010 to access this account type regardless of income." },
      { type: 'h2', text: 'The Step-by-Step Process' },
      { type: 'list', items: [
        'Step 1 — Make a non-deductible traditional IRA contribution: Any individual with earned income can contribute to a traditional IRA regardless of income. If you earn above the deductibility threshold, your contribution is "non-deductible" — you get no tax deduction now, but your basis (the after-tax amount) is tracked on IRS Form 8606.',
        'Step 2 — Convert to Roth IRA immediately: As soon as the funds are in the traditional IRA, convert the account to a Roth IRA. Because you already paid tax on this money (non-deductible contribution = after-tax dollars), the conversion is tax-free. You report it on Form 8606 to document the basis.',
        'Step 3 — File Form 8606: This IRS form tracks your non-deductible IRA contributions and conversions. It must be filed in the year of contribution and the year of conversion. Missing this filing is the most common administrative error in backdoor Roth execution.',
        'Step 4 — Invest the Roth account: Once converted, invest normally. All future growth and qualified withdrawals are permanently tax-free, regardless of how high your income grows.',
      ]},
      { type: 'h2', text: 'The Pro-Rata Rule: The Critical Trap' },
      { type: 'p', text: "The most dangerous aspect of the backdoor Roth is the pro-rata rule. If you have any pre-tax (deductible) traditional IRA money — from a rollover IRA, SEP-IRA, or prior deductible contributions — the IRS treats ALL your traditional IRA money as a single pool when calculating the taxable portion of any conversion. You cannot convert just your non-deductible contributions; you must convert a proportional slice of all your IRA balances." },
      { type: 'p', text: "Example: You have $95,000 in a rollover IRA (pre-tax) and you contribute $7,000 as a non-deductible contribution, bringing your total traditional IRA balance to $102,000. Your basis is $7,000 out of $102,000 — approximately 6.9% of the total. When you convert the $7,000 to Roth, the IRS treats only 6.9% ($483) as tax-free. The remaining $6,517 is taxable. The backdoor Roth creates a tax bill rather than avoiding one. The solution: roll your pre-tax IRA assets into your employer's 401(k) first, eliminating the IRA balance before executing the strategy." },
      { type: 'stats', items: [
        { value: '$7,000', label: '2024 IRA Contribution Limit', sub: '$8,000 if age 50+ with catch-up contribution' },
        { value: '$240K+', label: 'When Backdoor Is Needed', sub: 'MAGI above Roth IRA income phase-out (MFJ)' },
        { value: '$0', label: 'Tax Due (Executed Correctly)', sub: 'Immediately converting non-deductible contribution' },
        { value: 'Form 8606', label: 'Required IRS Filing', sub: 'Must file each year contributions and conversions occur' },
      ]},
      { type: 'h2', text: 'The Mega Backdoor Roth: A Different Strategy' },
      { type: 'p', text: "The Mega Backdoor Roth is a distinct strategy available through certain 401(k) plans that allow after-tax contributions above the employee deferral limit. In 2024, the total 401(k) contribution limit (employee + employer) is $69,000. If your employer's plan allows after-tax contributions AND in-service conversions or distributions, you can contribute up to approximately $46,000 in after-tax money, immediately convert it to your Roth 401(k) or roll it to a Roth IRA. Not all plans allow this — you'll need to review your plan documents or ask your plan administrator." },
      { type: 'callout', text: "Congress has periodically discussed eliminating the backdoor Roth via legislation (it was included in Build Back Better Act proposals in 2021 but not passed). As of 2024, it remains legal and explicitly recognized by the IRS. If you have been eligible and haven't executed this strategy, you can make contributions for the prior tax year up to the April 15 filing deadline — meaning you can make 2024 contributions through April 2025." },
    ],
  },
  {
    category:  'Macro Economics',
    headline:  "Inflation: What CPI Measures, What It Misses, and How to Protect Your Wealth",
    excerpt:   "The Consumer Price Index measures a fixed basket of goods and services — but it systematically undercounts housing costs, excludes asset price inflation, and uses substitution effects that reduce the measured rate. More importantly, personal inflation rates vary dramatically by lifestyle. The investor who owns a home experiences inflation differently than the renter. Understanding what CPI measures — and doesn't — is foundational to macro literacy.",
    concept:   'Consumer Price Index',
    definition:"A measure of the average change over time in the prices paid by urban consumers for a market basket of goods and services. The primary benchmark for inflation in the U.S., though critics note it systematically understates housing and healthcare costs.",
    quote:     "By a continuing process of inflation, government can confiscate the wealth of its citizens.",
    quoteAttr: 'John Maynard Keynes',
    href:      '/economic-calendar',
    readTime:  '8 min read',
    books:     ['When Money Dies', 'The Price of Tomorrow', 'Principles for Navigating Big Debt Crises'],
    body: [
      { type: 'p', text: "Inflation is arguably the most consequential force in personal finance, yet most people engage with it primarily through the monthly CPI release — a number that is both imprecise as a measure of actual consumer experience and widely misunderstood in its construction. The CPI is not the price level. It is the rate of change of a specific basket of goods and services consumed by a hypothetical average urban household. For most individuals, their personal inflation rate diverges significantly from CPI — sometimes higher, sometimes lower — depending on how they spend, where they live, and whether they own or rent." },
      { type: 'h2', text: 'How CPI Is Constructed' },
      { type: 'p', text: "The Bureau of Labor Statistics calculates CPI by tracking prices on approximately 80,000 items across 75 urban areas monthly. Items are weighted by their share of average consumer spending. Housing ('shelter') is the largest single component at approximately 34% of CPI. Food is roughly 14%. Transportation 15%. Medical care 7%. The weights are updated periodically to reflect changing consumption patterns. Critically, the basket represents the average — a retiree spending heavily on healthcare and a young professional spending heavily on rent have meaningfully different personal inflation experiences." },
      { type: 'chart_bar', title: 'CPI Component Weights (2024 Urban Consumer)', data: [
        { name: 'Shelter\n(Housing)', weight: 34.4 },
        { name: 'Food at\nHome', weight: 8.5 },
        { name: 'Transportation', weight: 15.2 },
        { name: 'Medical\nCare', weight: 6.8 },
        { name: 'Food Away\nfrom Home', weight: 5.5 },
        { name: 'Energy', weight: 7.1 },
        { name: 'Other', weight: 22.5 },
      ], barKey: 'weight', nameKey: 'name', color: '#c9a96e', yLabel: '% of CPI Basket' },
      { type: 'h2', text: 'The Known Limitations of CPI' },
      { type: 'p', text: "CPI has several structural features that critics argue cause it to understate real-world inflation. The substitution effect: when beef prices rise, the BLS assumes consumers substitute to chicken, partially offsetting the price increase in the basket calculation. This is technically accurate but removes the 'you now have to eat chicken because you can't afford beef' cost from the measurement. Hedonic quality adjustment: when a new laptop costs the same as last year's but is faster and has more storage, BLS records a price decrease because you're getting more value per dollar. Again, technically logical, but if you just wanted the same laptop as before, you paid the same price — not less." },
      { type: 'p', text: "The shelter component calculation is particularly complex. CPI uses 'owners' equivalent rent' — what homeowners estimate they would pay to rent their home — rather than actual home prices or mortgage costs. This caused CPI to significantly understate housing cost inflation in 2020-2022, when actual home prices rose 30-40% but CPI shelter rose much more slowly. The lag in shelter CPI is a well-documented statistical artifact that creates a systematic delay in capturing real housing inflation." },
      { type: 'stats', items: [
        { value: '34.4%', label: 'Shelter in CPI', sub: 'Largest single component; uses OER, not market rents' },
        { value: '3–5%', label: 'Healthcare Inflation', sub: 'Consistently runs above overall CPI for retirees' },
        { value: '6–8%', label: 'College Tuition Inflation', sub: 'Historical long-term average, well above CPI' },
        { value: '2.0%', label: 'Fed Inflation Target', sub: 'Based on PCE index, not CPI' },
      ]},
      { type: 'h2', text: 'Protecting Wealth Against Inflation' },
      { type: 'p', text: "The primary long-term inflation hedge is equities. Over any 30-year historical period, equities have outpaced inflation substantially. The S&P 500's real (after-inflation) return has averaged approximately 7% annually since 1928. This is why holding excessive cash or long-term bonds in a retirement portfolio is so dangerous: you are guaranteed to lose purchasing power in real terms. The second major inflation hedge is real estate — both because property values generally track inflation and because fixed-rate mortgage debt becomes less burdensome in real terms as inflation rises." },
      { type: 'callout', text: "TIPS (Treasury Inflation-Protected Securities) are the purest inflation hedge in the bond market. The principal adjusts with CPI, so both the principal and the interest payments grow with inflation. For retirees with significant bond allocations, a TIPS ladder covering early-retirement fixed expenses is a highly reliable way to protect purchasing power without equity risk." },
    ],
  },
  {
    category:  'Wealth Counsel',
    headline:  "Fee-Only vs. Commission-Based Advisors: The Difference That Costs You Thousands",
    excerpt:   "A commission-based financial advisor earns money when you buy financial products. A fee-only advisor earns money only from you — and is legally obligated to act in your interest under the fiduciary standard. The difference matters most when complex products are involved: annuities, whole life insurance, and proprietary funds often carry commissions of 3–8%. Knowing how your advisor is compensated is the first question of financial planning.",
    concept:   'Fiduciary Standard',
    definition:"A legal obligation to act in a client's best interest. Registered Investment Advisors (RIAs) are held to the fiduciary standard. Broker-dealers operate under the lower suitability standard, which only requires recommendations be 'suitable' — not necessarily best for the client.",
    quote:     "The most important quality for an investor is temperament, not intellect.",
    quoteAttr: 'Warren Buffett',
    href:      '/wealth-counsel',
    readTime:  '8 min read',
    books:     ['The Index Card', 'Pound Foolish', 'Enough: True Measures of Money, Business, and Life'],
    body: [
      { type: 'p', text: "The financial services industry has an unusual characteristic: many of its participants are legally permitted to recommend products that are not in the client's best interest, as long as the products are 'suitable' for the client's general financial situation. This isn't a critique — it's a description of the regulatory framework governing broker-dealers, which are regulated under FINRA's suitability standard rather than the fiduciary standard. Understanding this distinction, and knowing which standard your advisor operates under, is the most important question you can ask before taking any financial advice." },
      { type: 'h2', text: 'The Two Legal Standards' },
      { type: 'p', text: "The fiduciary standard, enforced by the SEC and applicable to Registered Investment Advisors (RIAs), requires that advisors always act in the best interest of the client, disclose all conflicts of interest, and place the client's interests above their own. The suitability standard, applicable to broker-dealers registered with FINRA, requires only that a recommended product be suitable for the client given their financial situation, risk tolerance, and investment objectives. A product can be 'suitable' — meaning not inappropriate — while also being significantly more expensive or lower quality than alternatives that an advisor chose not to recommend because of a conflict of interest." },
      { type: 'chart_bar', title: 'How Financial Advisors Are Compensated: Key Models', data: [
        { name: 'Fee-Only\nRIA (% of AUM)', transparency: 95, conflict: 15 },
        { name: 'Fee-Only\n(Flat / Hourly)', transparency: 100, conflict: 5 },
        { name: 'Fee-Based\n(Hybrid)', transparency: 65, conflict: 55 },
        { name: 'Commission\nOnly', transparency: 35, conflict: 90 },
      ], barKey: 'transparency', nameKey: 'name', color: '#c9a96e', yLabel: 'Transparency Score' },
      { type: 'h2', text: 'The Hidden Costs of Commission Compensation' },
      { type: 'p', text: "Commission-based compensation creates conflicts that are difficult for clients to detect. Variable annuities commonly pay commissions of 5-7% of the invested amount. Indexed universal life insurance policies pay commissions of 80-100% of the first year's premium, with ongoing trail commissions. Proprietary mutual funds at wirehouses often pay higher commissions to advisors who recommend them over lower-cost alternatives. Front-load mutual funds (Class A shares) charge 3-5.75% at purchase. None of these charges appear as explicit fees on a statement — they're embedded in the product structure." },
      { type: 'p', text: "The aggregate impact of commission-based product selection is substantial. A 2021 study in the Journal of Financial Economics found that commission-based advisors recommended mutual funds with significantly higher expense ratios than fee-only advisors. The average additional annual cost to clients of commission-based advisors was estimated at 0.5-1.5% of assets per year — on top of any advisory fees paid. Over a 30-year period, this compound cost represents a significant reduction in final wealth." },
      { type: 'stats', items: [
        { value: '1.0%', label: 'Typical AUM Fee', sub: 'Fee-only RIA annual fee on assets under management' },
        { value: '5–7%', label: 'Variable Annuity Commission', sub: 'Upfront commission paid to selling advisor' },
        { value: '0.5–1.5%', label: 'Annual Cost from Conflicts', sub: 'Estimated drag from commission-product selection' },
        { value: 'NAPFA.org', label: 'Find Fee-Only Advisors', sub: 'National Association of Personal Financial Advisors' },
      ]},
      { type: 'h2', text: 'The Questions to Ask Before Hiring an Advisor' },
      { type: 'list', items: [
        'Are you a fiduciary 100% of the time? (Some advisors switch hats between fiduciary RIA and non-fiduciary broker-dealer roles)',
        'How are you compensated? Do you receive any commissions, 12b-1 fees, or revenue sharing from product providers?',
        'What is your total annual fee as a percentage of my assets, including the underlying fund expense ratios?',
        'Do you have any conflicts of interest I should know about?',
        'Are you registered as an Investment Advisor Representative (IAR) with an RIA, a registered representative with a broker-dealer, or both?',
      ]},
      { type: 'callout', text: "The CFP (Certified Financial Planner) designation requires its holders to act as a fiduciary when providing financial planning services — but not necessarily when making product recommendations in a broker-dealer capacity. The CFA (Chartered Financial Analyst) designation involves no regulatory fiduciary requirement at all. The most protective combination: a fee-only advisor who is a CFP, registered as an IAR with an independent RIA, and has no broker-dealer affiliation." },
    ],
  },
  {
    category:  'Business Planning',
    headline:  "Buy-Sell Agreements: The Document Every Business Partner Needs Before They Need It",
    excerpt:   "A buy-sell agreement is a legally binding contract that determines what happens to a business owner's interest if they die, become disabled, retire, or want to exit. Without one, a deceased partner's heirs can become co-owners with no operational role. With one, ownership transfers cleanly at a pre-agreed valuation, funded by life or disability insurance. It is the single most overlooked document in small business planning.",
    concept:   'Buy-Sell Agreement',
    definition:"A legally binding contract between business partners that governs the transfer of ownership interest upon specific trigger events — death, disability, retirement, or voluntary exit. Typically funded by life insurance to ensure liquidity at the triggering event.",
    quote:     "Prepare for the worst, hope for the best, and expect something in between.",
    quoteAttr: 'Unknown',
    href:      '/business-planning',
    readTime:  '9 min read',
    books:     ['Built to Sell', 'The Exit Planning Institute Guide', 'Profit First'],
    body: [
      { type: 'p', text: "Two partners build a business worth $3 million over fifteen years. One dies unexpectedly. Without a buy-sell agreement, the deceased partner's 50% ownership passes to their spouse — who has no operational knowledge, no desire to run the business, and every legal right to involvement in business decisions, access to financial records, and a share of all distributions. The surviving business partner now has a co-owner they didn't choose, can't remove, and may not agree with on anything. This scenario is not hypothetical. It ends businesses and destroys families' financial security regularly." },
      { type: 'h2', text: 'What a Buy-Sell Agreement Covers' },
      { type: 'p', text: "A buy-sell agreement is a contract — sometimes called a 'business prenup' — that pre-determines what happens to ownership interests when specific trigger events occur. The agreement specifies: which events trigger a buyout (death, disability, divorce, retirement, voluntary exit, bankruptcy, loss of professional license), the valuation method that will determine the price, the timeline for completing the transaction, the funding mechanism (insurance, installment payments, or a combination), and any right of first refusal provisions." },
      { type: 'h2', text: 'The Three Types of Buy-Sell Structures' },
      { type: 'list', items: [
        'Cross-Purchase Agreement: Each partner buys life insurance on each other partner. At a triggering event, the surviving partners use the insurance proceeds to buy the departing partner\'s shares. Simple for two-partner businesses; administratively complex for four or more partners (requiring N×(N-1) policies).',
        'Entity Purchase (Redemption) Agreement: The business entity itself buys life insurance on each owner and is the beneficiary. At a triggering event, the company buys the departing owner\'s shares. Simpler administratively, but can create tax complications — the surviving owners don\'t get a step-up in basis for the purchased shares.',
        'Wait-and-See Agreement: The most flexible structure. At the triggering event, the company has the first right to purchase the shares. If the company declines or can\'t afford to, the surviving owners have the right to purchase. Flexibility is valuable but requires disciplined funding and clear decision timelines.',
      ]},
      { type: 'h2', text: 'The Valuation Problem: The Most Contested Element' },
      { type: 'p', text: "How do you set the price for a private business interest in a buy-sell agreement? This is the document's most critical and most frequently contested element. Common valuation approaches include: a fixed price set annually by the partners (simple but often goes years without being updated), a formula (e.g., 3× EBITDA, or book value plus a goodwill multiple), or a determination by independent appraisers at the triggering event. Each has trade-offs between predictability, fairness, and administrative simplicity." },
      { type: 'p', text: "The most dangerous valuation approach is the fixed price that never gets updated. Two partners agree their 50/50 business is worth $1M total in 2018 and set a $500,000 buyout price. By 2024, the business is worth $5M. The fixed price agreement has one partner catastrophically underpaying for a business worth 10× the agreed value. Courts have upheld these agreements even when dramatically out of market. Annual reviews and updates are essential for fixed-price agreements." },
      { type: 'stats', items: [
        { value: '98%', label: 'Businesses Without Agreements', sub: 'Estimated share of small businesses with no funded buy-sell' },
        { value: '3–5× EBITDA', label: 'Common Valuation Multiple', sub: 'Service businesses; varies significantly by industry' },
        { value: '18–24mo', label: 'Disability Trigger Delay', sub: 'Typical definition: unable to perform duties for this period' },
        { value: '$5K–15K', label: 'Agreement Drafting Cost', sub: 'Attorney fees for a properly structured agreement' },
      ]},
      { type: 'h2', text: 'The Funding Question: How the Money Gets There' },
      { type: 'p', text: "The most common funding mechanism for death is life insurance. Each owner's buyout obligation is funded by a policy on that owner's life, with the proceeds available immediately at death to execute the purchase. For disability, disability buyout insurance is available but less commonly purchased — creating a dangerous gap, since disability is more likely than premature death for most business owners. For retirement or voluntary exit, the agreement typically provides for installment payments over 5-10 years, often structured as a note secured by the business's assets." },
      { type: 'callout', text: "The buy-sell agreement and the funding mechanism must be designed together. An agreement requiring a $2M buyout within 90 days of death, with no life insurance and no business cash reserves, is worse than useless — it creates a contractual obligation the business cannot meet and the surviving partners may not be able to personally fund." },
    ],
  },
  {
    category:  'Retirement Planning',
    headline:  "Sequence of Returns Risk: The Retirement Danger Nobody Talks About Enough",
    excerpt:   "Two investors can achieve identical average returns over 30 years and have dramatically different retirement outcomes — depending entirely on when the bad years fall. A severe market decline in the first five years of retirement, combined with ongoing withdrawals, can permanently impair a portfolio. This 'sequence of returns risk' is why the years immediately before and after retirement require fundamentally different investment thinking than the accumulation phase.",
    concept:   'Sequence of Returns Risk',
    definition:"The risk that the timing of investment losses — particularly early in retirement when withdrawals begin — permanently impairs a portfolio's longevity, even when long-term average returns are identical to a safer scenario.",
    quote:     "The first rule of an investment is don't lose money.",
    quoteAttr: 'Warren Buffett',
    href:      '/retirement-planning',
    readTime:  '9 min read',
    books:     ['Retirement Income for Life', 'The Retirement Savings Time Bomb', 'Spend \'Til the End'],
    body: [
      { type: 'p', text: "One of the most important — and least understood — concepts in retirement income planning has nothing to do with the average return your portfolio earns. Imagine two retirees. Both start with $1M and withdraw $50,000 per year (5%). Both earn an average of 7% per year over 30 years. But the order of their returns is different. Retiree A earns strong returns early and poor returns later. Retiree B earns poor returns early and strong returns later. After 30 years, Retiree A has over $2M. Retiree B ran out of money at year 21. The math is the same. The outcome is catastrophically different." },
      { type: 'h2', text: 'Why Sequence Matters During Withdrawals (But Not Accumulation)' },
      { type: 'p', text: "During accumulation — the working years when you're contributing rather than withdrawing — sequence of returns doesn't matter. If you contribute $500/month and markets crash in year 5, you're buying more shares at lower prices. By the time the market recovers, your dollar-cost-averaged purchases during the downturn have amplified your gains. Poor early returns are actually beneficial during accumulation because they create buying opportunities. This is the opposite of retirement, where you're selling shares to fund living expenses." },
      { type: 'p', text: "During decumulation — withdrawals — a severe early market decline forces you to sell a larger number of shares to generate the same dollar amount of income. Those shares are gone permanently. When the market recovers, you're compounding a smaller asset base. The recovery helps you, but it can't fully compensate for the shares sold at depressed prices. This is the mathematical core of sequence of returns risk." },
      { type: 'chart_line', title: 'Portfolio Longevity: Identical Average Returns, Different Sequence ($1M, $50K/yr withdrawal)', data: [
        { year: 'Year 0',  goodSeq: 1000, badSeq: 1000 },
        { year: 'Year 3',  goodSeq: 1180, badSeq: 680  },
        { year: 'Year 6',  goodSeq: 1310, badSeq: 510  },
        { year: 'Year 9',  goodSeq: 1420, badSeq: 380  },
        { year: 'Year 12', goodSeq: 1480, badSeq: 290  },
        { year: 'Year 15', goodSeq: 1510, badSeq: 160  },
        { year: 'Year 18', goodSeq: 1490, badSeq: 70   },
        { year: 'Year 21', goodSeq: 1440, badSeq: 0    },
        { year: 'Year 25', goodSeq: 1380, badSeq: 0    },
        { year: 'Year 30', goodSeq: 2100, badSeq: 0    },
      ], lines: [{ key: 'goodSeq', color: '#c9a96e', label: 'Good Sequence (Good Returns Early)' }, { key: 'badSeq', color: '#c0392b', label: 'Bad Sequence (Losses Early)' }], xKey: 'year', yLabel: 'Portfolio Value ($000s)' },
      { type: 'h2', text: 'The Critical Danger Zone: 5 Years Before and After Retirement' },
      { type: 'p', text: "The five years immediately before retirement and the five years immediately after — what financial planners call 'the retirement red zone' — are when sequence of returns risk is highest. Before retirement, a severe market decline reduces the total assets you start with, permanently lowering your income capacity. After retirement, a severe decline in the first 5 years, combined with ongoing withdrawals, creates the compounding impairment described above. The statistical research confirms: if a retiree survives the first 10 years of retirement without a catastrophic portfolio draw-down, they will almost certainly have sufficient assets for a full 30-year retirement." },
      { type: 'stats', items: [
        { value: '±50%', label: 'Outcome Variance', sub: 'Same average return; different sequences, wildly different final values' },
        { value: '5 Years', label: 'Critical Post-Retirement Window', sub: 'Portfolio survival depends most heavily on this period' },
        { value: '2008–09', label: 'Worst Sequence Scenario', sub: '-55% portfolio loss in years 1-2 of retirement' },
        { value: '1–2%', label: 'Floor Portfolio Allocation', sub: 'Cash/short bonds cushion covering 1-2 years of expenses' },
      ]},
      { type: 'h2', text: 'Mitigation Strategies That Actually Work' },
      { type: 'list', items: [
        'Cash buffer / bucket strategy: Maintain 1-2 years of living expenses in cash or short-term bonds. In a down market, withdraw from the cash bucket rather than selling equities at depressed prices. Replenish the cash bucket in up years. This eliminates the forced sale of equities during downturns.',
        'Dynamic withdrawal rate: Reduce withdrawals by 10-15% in years when the portfolio falls below a guardrails threshold. A 4.5% initial withdrawal rate with dynamic reductions outperforms a rigid 4.0% rate historically.',
        'Delay Social Security: The 8% annual delayed retirement credit is a sequence-of-returns hedge — it increases guaranteed income independent of portfolio performance. Higher guaranteed income means fewer portfolio withdrawals needed.',
        'Rising equity glidepath: Counter-intuitively, research by Pfau and Kitces shows that starting with a relatively lower equity allocation at retirement (40-50%) and increasing equity exposure gradually in early retirement actually reduces sequence risk better than a static or declining equity allocation.',
      ]},
      { type: 'callout', text: "Sequence of returns risk is why the years immediately before and after retirement deserve more conservative positioning than either the accumulation phase or the deep retirement phase. The 'transition zone' from 5 years before retirement to 5 years after is a distinct planning phase requiring distinct investment management — not a continuation of the strategies that worked during your 30s and 40s." },
    ],
  },
]

// ── Daily rotation: pick 3 articles based on calendar date (same 3 for everyone same day)
function getDailyInsights() {
  const now = new Date()
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
  const total = ALL_INSIGHTS.length
  const i0 = (dayOfYear * 3) % total
  const i1 = (i0 + 1) % total
  const i2 = (i0 + 2) % total
  return [ALL_INSIGHTS[i0], ALL_INSIGHTS[i1], ALL_INSIGHTS[i2]]
}

// ── Library: articles featured on days before today only (no today's, no future)
function getPastInsights() {
  const now = new Date()
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
  const total = ALL_INSIGHTS.length
  const i0 = (dayOfYear * 3) % total
  const todaySet = new Set([i0, (i0 + 1) % total, (i0 + 2) % total])
  const seen = new Set()
  for (let d = 0; d < dayOfYear; d++) {
    const t0 = (d * 3) % total
    const t1 = (t0 + 1) % total
    const t2 = (t0 + 2) % total
    if (!todaySet.has(t0)) seen.add(t0)
    if (!todaySet.has(t1)) seen.add(t1)
    if (!todaySet.has(t2)) seen.add(t2)
  }
  return [...seen].map(i => ALL_INSIGHTS[i])
}

// ── Nav links
const NAV_LINKS = [
  { label: 'Terminal',          href: '/terminal-hub'    },
  { label: 'Wealth Counsel',    href: '/wealth-counsel-hub'  },
  { label: 'FUN',               href: '/education-hub'   },
  { label: 'Markets',           href: '/markets'         },
  { label: 'The Planning Letter', href: '/planning-letter' },
]

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING PORTFOLIO PREVIEW CARD — hero right side
// ─────────────────────────────────────────────────────────────────────────────
// DAILY FINANCIAL FACTS — one per day, rotates by day-of-year
// ─────────────────────────────────────────────────────────────────────────────
const DAILY_FACTS = [
  {
    fact: "A $10,000 investment in the S&P 500 in 1994 would be worth over $220,000 today — without adding a single dollar.",
    concept: 'Compound Growth', stat: '22×', statLabel: '30-year S&P return', source: 'Bloomberg',
    category: 'Investing',
  },
  {
    fact: "The average American spends $18,000 per year on non-essential purchases. Invested at 7% over 30 years, that's $1.8 million in foregone wealth.",
    concept: 'Opportunity Cost', stat: '$1.8M', statLabel: 'cost of lifestyle inflation', source: 'Bureau of Labor Statistics',
    category: 'Budgeting',
  },
  {
    fact: "Missing just the 10 best trading days in any 20-year period cuts your return roughly in half. Staying invested beats timing the market.",
    concept: 'Market Timing Risk', stat: '~50%', statLabel: 'return lost by missing 10 best days', source: 'JPMorgan Asset Management',
    category: 'Investing',
  },
  {
    fact: "A 1% higher annual fee on a $500,000 portfolio costs $147,000 over 10 years — money that goes to the fund manager, not your retirement.",
    concept: 'Expense Ratio', stat: '$147K', statLabel: 'cost of 1% fee on $500K over 10 yrs', source: 'Vanguard',
    category: 'Investing',
  },
  {
    fact: "66% of Americans couldn't pass a basic financial literacy test. The countries with the highest financial literacy have the highest median net worth.",
    concept: 'Financial Literacy', stat: '66%', statLabel: 'of Americans fail basic financial quiz', source: 'FINRA',
    category: 'Education',
  },
  {
    fact: "The Rule of 72: divide 72 by your annual return to find how many years it takes to double your money. At 7%, money doubles every 10.3 years.",
    concept: 'Rule of 72', stat: '10.3 yrs', statLabel: 'to double money at 7% return', source: 'Financial Math',
    category: 'Investing',
  },
  {
    fact: "A household that contributes the max to a 401(k) for 30 years ($23,000/yr at 7%) accumulates $2.3 million — mostly from compounding, not contributions.",
    concept: '401(k) Power', stat: '$2.3M', statLabel: '30-year max 401(k) at 7% return', source: 'IRS / Planora',
    category: 'Retirement',
  },
  {
    fact: "The average retiree needs 70–90% of pre-retirement income to maintain their lifestyle. Most Americans retire with less than $200,000 saved.",
    concept: 'Retirement Gap', stat: '$200K', statLabel: 'median retirement savings in the US', source: 'Federal Reserve',
    category: 'Retirement',
  },
  {
    fact: "Paying an extra $200/month on a $400,000 mortgage at 7% eliminates 7 years of payments and saves over $118,000 in interest.",
    concept: 'Early Mortgage Payoff', stat: '$118K', statLabel: 'saved with $200/mo extra payment', source: 'Mortgage calculation',
    category: 'Real Estate',
  },
  {
    fact: "Tax-loss harvesting — selling losing positions to offset gains — can add 0.5–1.5% in after-tax returns annually. Most investors never use it.",
    concept: 'Tax-Loss Harvesting', stat: '+1.5%', statLabel: 'avg annual after-tax return boost', source: 'Vanguard',
    category: 'Tax Strategy',
  },
  {
    fact: "The average American pays $524,000 in interest over a lifetime — on mortgages, car loans, student debt, and credit cards. Debt is wealth in reverse.",
    concept: 'Lifetime Interest Cost', stat: '$524K', statLabel: 'avg lifetime interest paid per American', source: 'LendingTree',
    category: 'Debt',
  },
  {
    fact: "Roth IRA contributions grow tax-free forever. $6,000 contributed at age 22, never touched, becomes $91,000 by retirement at a 7% return.",
    concept: 'Roth IRA Compounding', stat: '15×', statLabel: 'growth on a single year\'s Roth contribution', source: 'IRS / Planora',
    category: 'Retirement',
  },
  {
    fact: "The 4% rule: a retiree can withdraw 4% of their portfolio in year one, adjust for inflation annually, and historically not run out of money over 30 years.",
    concept: '4% Withdrawal Rule', stat: '4%', statLabel: 'safe withdrawal rate over 30-year retirement', source: 'William Bengen, 1994',
    category: 'Retirement',
  },
  {
    fact: "Investors who trade frequently underperform buy-and-hold investors by 1.5–6.5% annually. Emotion is the most expensive investment strategy.",
    concept: 'Behavioral Finance', stat: '-6.5%', statLabel: 'annual underperformance from frequent trading', source: 'Dalbar QAIB',
    category: 'Investing',
  },
  {
    fact: "The USDA estimates the cost of raising a child to age 18 at $310,605 — before college. A 4-year private university averages $240,000 all-in.",
    concept: 'Cost of a Child', stat: '$310K', statLabel: 'average cost to raise a child to 18', source: 'USDA 2023',
    category: 'Family Planning',
  },
  {
    fact: "Asset location — placing bonds in tax-deferred accounts and stocks in taxable accounts — can add 0.2–0.8% annually with zero additional risk.",
    concept: 'Asset Location', stat: '+0.8%', statLabel: 'annual return from optimal asset location', source: 'Morningstar',
    category: 'Tax Strategy',
  },
  {
    fact: "Social Security delayed from 62 to 70 increases your monthly benefit by 76%. For a couple, the lifetime difference can exceed $250,000.",
    concept: 'Social Security Timing', stat: '+76%', statLabel: 'benefit increase from claiming at 70 vs 62', source: 'SSA',
    category: 'Retirement',
  },
  {
    fact: "The average car costs $12,182/year to own and operate. Over 40 years, investing that instead at 7% compounds to over $2.5 million.",
    concept: 'True Cost of a Car', stat: '$12K/yr', statLabel: 'average annual total cost of car ownership', source: 'AAA 2023',
    category: 'Budgeting',
  },
  {
    fact: "Inflation at 3% cuts the purchasing power of $100,000 in half in 24 years. Cash under the mattress is a guaranteed loss of wealth.",
    concept: 'Inflation Risk', stat: '24 yrs', statLabel: 'for 3% inflation to halve purchasing power', source: 'BLS',
    category: 'Macro',
  },
  {
    fact: "A Vanguard study found that a good financial advisor adds about 3% in net returns annually — mostly through behavioral coaching, not security selection.",
    concept: 'Advisor Alpha', stat: '+3%', statLabel: 'annual net return added by a good advisor', source: 'Vanguard Advisor\'s Alpha',
    category: 'Wealth Counsel',
  },
  {
    fact: "Index funds now hold over 50% of all US equity fund assets. The average actively managed fund underperforms its index benchmark over 15 years.",
    concept: 'Index vs. Active', stat: '92%', statLabel: 'of active large-cap funds underperform over 15 yrs', source: 'S&P SPIVA 2023',
    category: 'Investing',
  },
  {
    fact: "The break-even age for delaying Social Security from 62 to 70 is roughly 82. If you live past 82, waiting always wins financially.",
    concept: 'Break-Even Age', stat: '82', statLabel: 'break-even age for Social Security delay strategy', source: 'SSA',
    category: 'Retirement',
  },
  {
    fact: "Homeownership builds 40× more wealth than renting over a lifetime — largely through forced savings via equity and leverage on an appreciating asset.",
    concept: 'Homeownership Wealth', stat: '40×', statLabel: 'homeowner net worth vs. renter net worth', source: 'Federal Reserve',
    category: 'Real Estate',
  },
  {
    fact: "An emergency fund of 6 months of expenses prevents the need to liquidate investments during a crisis — protecting the compounding timeline that builds wealth.",
    concept: 'Emergency Fund', stat: '6 mos', statLabel: 'expenses recommended in liquid emergency fund', source: 'CFP Board',
    category: 'Budgeting',
  },
  {
    fact: "The top 10% of earners save 38% of their income. The bottom 20% save less than 1%. The gap in wealth comes from savings rate, not income alone.",
    concept: 'Savings Rate', stat: '38%', statLabel: 'savings rate of top 10% earners', source: 'Federal Reserve SCF',
    category: 'Budgeting',
  },
  {
    fact: "Term life insurance costs $30–$50/month for a healthy 30-year-old with a $1 million policy. Most people are underinsured relative to what their family actually needs.",
    concept: 'Life Insurance', stat: '$35/mo', statLabel: 'avg cost of $1M 20-yr term policy at age 30', source: 'Policygenius 2023',
    category: 'Insurance',
  },
  {
    fact: "Capital gains held longer than one year are taxed at 0–20%. Short-term gains are taxed as ordinary income — potentially at 37%. Patience is literally a tax strategy.",
    concept: 'Long-Term Capital Gains', stat: '0–20%', statLabel: 'long-term capital gains tax rate vs 37% short-term', source: 'IRS',
    category: 'Tax Strategy',
  },
  {
    fact: "Dollar-cost averaging — investing a fixed amount on a schedule — removes emotion from market timing and results in a lower average cost per share over time.",
    concept: 'Dollar-Cost Averaging', stat: 'DCA', statLabel: 'removes emotion from market entry timing', source: 'Financial Research',
    category: 'Investing',
  },
  {
    fact: "The median net worth of Americans aged 55–64 is $212,000. Most financial planners recommend having 10–12× your salary saved by retirement age.",
    concept: 'Retirement Readiness', stat: '$212K', statLabel: 'median net worth of Americans ages 55-64', source: 'Federal Reserve 2022',
    category: 'Retirement',
  },
  {
    fact: "529 plans grow tax-free and withdrawals for education are never taxed. Starting at birth vs. age 10 doubles the projected balance by college enrollment.",
    concept: '529 College Savings', stat: '2×', statLabel: 'more saved starting at birth vs. age 10', source: 'Vanguard / Planora',
    category: 'Education',
  },
  {
    fact: "Warren Buffett made 99% of his wealth after age 52. The most powerful variable in investing is not return — it is time in the market.",
    concept: 'Time in Market', stat: '99%', statLabel: 'of Buffett\'s wealth built after age 52', source: 'Morgan Housel',
    category: 'Investing',
  },
]

const CATEGORY_COLORS = {
  'Investing':       '#c9a96e',
  'Budgeting':       '#00B4C6',
  'Retirement':      '#818cf8',
  'Tax Strategy':    '#4a7c59',
  'Real Estate':     '#d4a017',
  'Debt':            '#c0392b',
  'Education':       '#818cf8',
  'Family Planning': '#00B4C6',
  'Macro':           '#a89070',
  'Wealth Counsel':  '#00B4C6',
  'Insurance':       '#4a7c59',
}

function DailyFactCard() {
  const today    = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000)
  const fact     = DAILY_FACTS[dayOfYear % DAILY_FACTS.length]
  const color    = CATEGORY_COLORS[fact.category] || '#c9a96e'
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const dateStr  = `${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`

  return (
    <div style={{ position: 'relative', width: 380 }}>
      {/* Stacked back cards */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: 'translate(14px, 14px) rotate(2.2deg)',
        background: '#1c1510', border: '1px solid #3d3028',
        borderRadius: 18, opacity: 0.55,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        transform: 'translate(7px, 7px) rotate(1.1deg)',
        background: '#1f1812', border: '1px solid #3d3028',
        borderRadius: 18, opacity: 0.7,
      }} />

      {/* Main card */}
      <div style={{
        position: 'relative',
        background: 'rgba(35,28,22,0.98)',
        border: '1px solid #3d3028',
        borderRadius: 18,
        boxShadow: '0 28px 56px rgba(0,0,0,0.55), inset 0 1px 0 var(--border-c)',
        overflow: 'hidden',
      }}>
        {/* Top accent line */}
        <div style={{ height: 2, background: `linear-gradient(90deg, ${color} 0%, transparent 60%)` }} />

        <div style={{ padding: '20px 22px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#6b5540', marginBottom: 4, fontFamily: UI }}>
                Daily Financial Fact
              </div>
              <div style={{ fontSize: 11, color: '#a89070', fontFamily: UI }}>
                {dateStr}
              </div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: `${color}14`, border: `1px solid ${color}30`,
              borderRadius: 6, padding: '4px 10px',
            }}>
              <span style={{ fontSize: 9, color, fontWeight: 700, fontFamily: UI, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{fact.category}</span>
            </div>
          </div>

          {/* Fact text */}
          <p style={{
            fontFamily: DISPLAY, fontSize: 15, fontWeight: 400,
            color: '#f0e8d8', lineHeight: 1.65,
            margin: '0 0 20px', fontStyle: 'italic',
          }}>
            "{fact.fact}"
          </p>

          {/* Stat highlight */}
          <div style={{
            background: '#2d2419', border: '1px solid #3d3028',
            borderRadius: 10, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color, lineHeight: 1, flexShrink: 0 }}>
              {fact.stat}
            </div>
            <div>
              <div style={{ fontFamily: UI, fontSize: 11.5, color: '#a89070', lineHeight: 1.45 }}>{fact.statLabel}</div>
              <div style={{ fontFamily: UI, fontSize: 10, color: '#6b5540', marginTop: 3 }}>Source: {fact.source}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 22px 16px',
          borderTop: '1px solid #2a2018',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: '#6b5540', fontFamily: UI }}>
              Concept: <span style={{ color: '#a89070', fontWeight: 600 }}>{fact.concept}</span>
            </span>
          </div>
          <span style={{ fontSize: 9, color: '#3d3028', fontFamily: UI, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Updates daily
          </span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [searchVal,   setSearchVal]   = useState('')
  const [showAccount, setShowAccount] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchVal.trim()) {
      navigate(`/ticker-lookup?q=${searchVal.trim().toUpperCase()}`)
      setSearchVal('')
      setSearchOpen(false)
    }
  }

  return (
    <>
      <motion.header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        transition: 'background 0.4s cubic-bezier(0.32,0.72,0,1), border-color 0.4s cubic-bezier(0.32,0.72,0,1)',
        background: scrolled ? 'rgba(26,20,16,0.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid #2a2018' : '1px solid transparent',
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto', padding: '0 40px',
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 2, padding: 0 }}
          >
            <span style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: '#c9a96e', letterSpacing: '-0.01em', lineHeight: 1 }}>
              Planora
            </span>
          </button>

          {/* Center nav — desktop */}
          <nav style={{ display: 'flex', gap: 36, alignItems: 'center' }} className="planora-nav-center">
            {NAV_LINKS.map(link => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 2px',
                  fontSize: 13, fontWeight: 500, color: '#a89070',
                  letterSpacing: '0.01em', fontFamily: UI,
                  transition: 'color 0.2s cubic-bezier(0.32,0.72,0,1)',
                  borderBottom: '1px solid transparent',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f0e8d8' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#a89070' }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(61,48,40,0.5)', border: '1px solid #3d3028',
                borderRadius: 8, padding: '6px 12px',
                color: '#a89070', fontSize: 12, fontFamily: UI, cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.32,0.72,0,1)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a96e50'; e.currentTarget.style.color = '#f0e8d8' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3028';   e.currentTarget.style.color = '#a89070'  }}
              className="planora-nav-search"
            >
              <Search size={13} />
              <span>Search ticker</span>
              <span style={{ fontSize: 10, color: '#6b5540', background: '#2d2419', borderRadius: 4, padding: '1px 5px', fontFamily: MONO }}>
                ⌘K
              </span>
            </button>

            {/* Auth CTA */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }} className="planora-nav-cta">
                <button
                  onClick={() => setShowAccount(v => !v)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    background: '#2d2419', border: '1px solid #3d3028',
                    borderRadius: 8, padding: '6px 12px',
                    color: '#f0e8d8', fontSize: 12, fontWeight: 600, fontFamily: UI,
                    cursor: 'pointer', transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#c9a96e50')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#3d3028')}
                >
                  <UserCircle size={14} color="#c9a96e" />
                  {user?.name?.split(' ')[0] || 'Account'}
                </button>
                <AnimatePresence>
                  {showAccount && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                        background: '#231c16', border: '1px solid #3d3028',
                        borderRadius: 10, padding: '8px 0', minWidth: 180,
                        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                        zIndex: 200,
                      }}
                    >
                      <div style={{ padding: '8px 16px 10px', borderBottom: '1px solid #2a2018' }}>
                        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: '#f0e8d8' }}>{user?.name}</div>
                        <div style={{ fontFamily: UI, fontSize: 11, color: '#6b5540', marginTop: 2 }}>{user?.email}</div>
                      </div>
                      <button
                        onClick={() => { navigate('/dashboard') }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: UI, fontSize: 13, color: '#a89070', textAlign: 'left' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#2d2419'; e.currentTarget.style.color = '#f0e8d8' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#a89070' }}
                      >
                        Enter Platform
                      </button>
                      <button
                        onClick={() => { logout(); setShowAccount(false) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: UI, fontSize: 13, color: '#a89070', textAlign: 'left' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#2d2419'; e.currentTarget.style.color = '#c0392b' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#a89070' }}
                      >
                        <LogOut size={13} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} className="planora-nav-cta">
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'transparent', border: '1px solid #3d3028',
                    borderRadius: 8, padding: '6px 14px',
                    color: '#a89070', fontSize: 12, fontWeight: 600, fontFamily: UI,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a96e50'; e.currentTarget.style.color = '#f0e8d8' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3028'; e.currentTarget.style.color = '#a89070' }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#c9a96e', borderRadius: 8, padding: '7px 14px',
                    color: '#1a1410', fontSize: 12, fontWeight: 700, fontFamily: UI,
                    border: 'none', cursor: 'pointer', transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Enter Platform
                </button>
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                background: 'none', border: 'none', color: '#a89070', cursor: 'pointer',
                padding: 4, display: 'flex', flexDirection: 'column', gap: 5,
              }}
              className="planora-nav-hamburger"
            >
              <span style={{ display: 'block', width: 20, height: 1.5, background: 'currentColor' }} />
              <span style={{ display: 'block', width: 14, height: 1.5, background: 'currentColor' }} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 600,
              background: 'rgba(10,8,5,0.92)', backdropFilter: 'blur(24px)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              paddingTop: 120,
            }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: -12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 560, padding: '0 24px' }}
            >
              <form onSubmit={handleSearch}>
                <div style={{
                  background: '#231c16', border: '1px solid #3d3028', borderRadius: 14,
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                  boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 var(--border-c)',
                }}>
                  <Search size={18} color="#6b5540" />
                  <input
                    autoFocus
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value.toUpperCase())}
                    placeholder="Search ticker — AAPL, MSFT, NVDA..."
                    style={{
                      flex: 1, background: 'none', border: 'none', outline: 'none',
                      fontSize: 16, color: '#f0e8d8', fontFamily: MONO, fontWeight: 500,
                    }}
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#6b5540', cursor: 'pointer', padding: 2 }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </form>
              <p style={{ fontSize: 11, color: '#6b5540', marginTop: 10, paddingLeft: 4, letterSpacing: '0.04em', fontFamily: UI }}>
                Enter any US stock ticker to research — press Return to search
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 600,
              background: 'rgba(15,12,9,0.97)', backdropFilter: 'blur(24px)',
              display: 'flex', flexDirection: 'column',
              padding: '24px 32px 48px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: '#c9a96e' }}>Planora</span>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#a89070', cursor: 'pointer', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...NAV_LINKS, { label: 'Enter Platform', href: '/dashboard' }].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, type: 'spring', stiffness: 300, damping: 28 }}
                >
                  <button
                    onClick={() => { setMenuOpen(false); navigate(link.href) }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '18px 0',
                      background: 'none', border: 'none', borderBottom: '1px solid #2a2018',
                      color: link.label === 'Enter Platform' ? '#c9a96e' : '#f0e8d8',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 600 }}>{link.label}</span>
                    <ArrowUpRight size={18} color={link.label === 'Enter Platform' ? '#c9a96e' : '#6b5540'} />
                  </button>
                </motion.div>
              ))}
            </nav>
            <p style={{ fontSize: 11, color: '#6b5540', letterSpacing: '0.08em', fontFamily: UI }}>
              Institutional Intelligence. Personal Impact.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .planora-nav-center { display: none !important; }
          .planora-nav-search { display: none !important; }
          .planora-nav-cta    { display: none !important; }
        }
        @media (min-width: 901px) {
          .planora-nav-hamburger { display: none !important; }
        }
      `}</style>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FRAMED PHOTO — reusable premium photo frame with corner brackets
// ─────────────────────────────────────────────────────────────────────────────
function CornerBrackets({ color = 'rgba(201,169,110,0.55)', size = 18, weight = 1.5, inset = 12 }) {
  const s = { position: 'absolute', width: size, height: size, zIndex: 10 }
  const line = { background: color, position: 'absolute' }
  const h = { ...line, height: weight, width: size }
  const v = { ...line, width: weight, height: size }
  return (
    <>
      {/* TL */}
      <div style={{ ...s, top: inset, left: inset }}>
        <div style={{ ...h, top: 0, left: 0 }} /><div style={{ ...v, top: 0, left: 0 }} />
      </div>
      {/* TR */}
      <div style={{ ...s, top: inset, right: inset }}>
        <div style={{ ...h, top: 0, right: 0 }} /><div style={{ ...v, top: 0, right: 0 }} />
      </div>
      {/* BL */}
      <div style={{ ...s, bottom: inset, left: inset }}>
        <div style={{ ...h, bottom: 0, left: 0 }} /><div style={{ ...v, bottom: 0, left: 0 }} />
      </div>
      {/* BR */}
      <div style={{ ...s, bottom: inset, right: inset }}>
        <div style={{ ...h, bottom: 0, right: 0 }} /><div style={{ ...v, bottom: 0, right: 0 }} />
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO BREAK — wallstreet.jpg cinematic section
// ─────────────────────────────────────────────────────────────────────────────
function PhotoBreak() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} style={{ background: '#1a1410', padding: '0 40px 80px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE }}
          style={{ position: 'relative' }}
        >
          {/* Outer frame */}
          <div style={{
            position: 'relative',
            borderRadius: 20,
            border: '1px solid rgba(201,169,110,0.28)',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(201,169,110,0.12)',
            aspectRatio: '16 / 6',
          }}>
            <CornerBrackets color="rgba(201,169,110,0.65)" size={22} inset={14} />

            {/* Photo */}
            <img
              src={wallstreetImg}
              alt="Wall Street financial district"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center 55%',
                display: 'block',
              }}
            />

            {/* Left-to-right dark vignette so text is readable */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(100deg, rgba(26,20,16,0.82) 0%, rgba(26,20,16,0.35) 55%, rgba(26,20,16,0.15) 100%)',
              pointerEvents: 'none',
            }} />
            {/* Bottom fade */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
              background: 'linear-gradient(to top, rgba(26,20,16,0.75) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />

            {/* Text overlay */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0,
              padding: '0 40px 32px',
              maxWidth: 640,
            }}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
              >
                <div style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: 'rgba(201,169,110,0.75)',
                  fontFamily: UI, marginBottom: 10,
                }}>
                  Institutional Intelligence · Personal Impact
                </div>
                <div style={{
                  fontFamily: DISPLAY,
                  fontSize: 'clamp(20px,2.6vw,32px)',
                  fontWeight: 700, fontStyle: 'italic',
                  color: '#f0e8d8', lineHeight: 1.35,
                  letterSpacing: '-0.015em',
                  textShadow: '0 2px 16px rgba(0,0,0,0.6)',
                }}>
                  The decisions that shape your financial life deserve the best tools available.
                </div>
              </motion.div>
            </div>

            {/* Top-right label */}
            <div style={{
              position: 'absolute', top: 20, right: 24,
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'rgba(26,20,16,0.65)',
              border: '1px solid rgba(201,169,110,0.2)',
              borderRadius: 8, padding: '5px 10px',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#c9a96e' }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#c9a96e', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: UI }}>
                Planora Terminal
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  const ref   = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section
      ref={ref}
      style={{
        minHeight: '100dvh',
        background: '#1a1410',
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center',
      }}
    >
      {/* Warm radial glow — left */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: '55%', height: '70%',
        background: 'radial-gradient(ellipse at top left, rgba(201,169,110,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      {/* Cool radial glow — right */}
      <div style={{
        position: 'absolute', bottom: '-10%', right: '5%',
        width: '40%', height: '60%',
        background: 'radial-gradient(ellipse at bottom right, rgba(0,180,198,0.04) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div
        style={{
          maxWidth: 1400, margin: '0 auto', padding: '80px 40px',
          width: '100%', display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80, alignItems: 'center',
        }}
        className="planora-hero-grid"
      >
        {/* Left content */}
        <div>
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(201,169,110,0.08)',
              border: '1px solid rgba(201,169,110,0.22)',
              borderRadius: 100, padding: '5px 12px', marginBottom: 28,
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              style={{ width: 5, height: 5, borderRadius: '50%', background: '#c9a96e' }}
            />
            <span style={{
              fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em',
              fontWeight: 600, color: '#c9a96e', fontFamily: UI,
            }}>
              Institutional Intelligence. Personal Impact.
            </span>
          </motion.div>

          {/* Headline — Playfair Display, staggered */}
          <h1 style={{
            fontFamily: DISPLAY, fontSize: 'clamp(40px,4.5vw,68px)',
            fontWeight: 700, color: '#f0e8d8',
            lineHeight: 1.06, letterSpacing: '-0.02em', margin: '0 0 24px',
          }}>
            {[
              { text: 'The foundation of',            delay: 0.10 },
              { text: 'every sound',                  delay: 0.18 },
              { text: <><span style={{ color: '#c9a96e', fontStyle: 'italic' }}>financial decision</span></>, delay: 0.26 },
              { text: 'starts here.',                 delay: 0.32 },
            ].map((line, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: line.delay, ease: EASE }}
                style={{ display: 'block' }}
              >
                {line.text}
              </motion.span>
            ))}
          </h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.38, ease: EASE }}
            style={{
              fontSize: 16, color: '#a89070', lineHeight: 1.75,
              maxWidth: 460, margin: '0 0 36px', fontFamily: UI,
            }}
          >
            Institutional-grade market intelligence, advisor collaboration, and financial
            education — unified for investors who want to understand before they act.
          </motion.p>


          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.58 }}
            style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
          >
            {['Real Data', 'Institutional Grade', 'Three Platforms'].map((t, i) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{
                  fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em',
                  color: '#6b5540', fontFamily: UI, fontWeight: 500,
                }}>
                  {t}
                </span>
                {i < 2 && <span style={{ color: '#3d3028', fontSize: 10 }}>—</span>}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — floating card */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 20 }}
          animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }}
          >
            <DailyFactCard />
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .planora-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
            padding: 100px 24px 60px !important;
          }
        }
      `}</style>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// QUOTE SECTION
// ─────────────────────────────────────────────────────────────────────────────
function QuoteSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      style={{
        background: '#231c16',
        borderTop: '1px solid #2a2018',
        borderBottom: '1px solid #2a2018',
        padding: '80px 40px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(201,169,110,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          style={{
            height: 1,
            background: 'linear-gradient(to right, transparent, #c9a96e50, transparent)',
            marginBottom: 48, transformOrigin: 'center',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          style={{
            fontFamily: DISPLAY, fontSize: 80, lineHeight: 0.6,
            color: '#c9a96e', opacity: 0.25,
            marginBottom: 24, display: 'block', userSelect: 'none',
          }}
        >
          &ldquo;
        </motion.div>

        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.18, ease: EASE }}
          style={{
            fontFamily: DISPLAY, fontSize: 'clamp(22px,3vw,36px)',
            fontStyle: 'italic', fontWeight: 500,
            color: '#f0e8d8', lineHeight: 1.55,
            margin: '0 0 32px', letterSpacing: '-0.01em',
          }}
        >
          Institutional intelligence that every investor deserves — not just the privileged few.
        </motion.blockquote>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
          <div style={{ width: 24, height: 1, background: '#c9a96e50', marginBottom: 10 }} />
          <span style={{ fontSize: 12, color: '#a89070', fontWeight: 600, letterSpacing: '0.08em', fontFamily: UI }}>
            The Planora Philosophy
          </span>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          style={{
            height: 1,
            background: 'linear-gradient(to right, transparent, #c9a96e50, transparent)',
            marginTop: 48, transformOrigin: 'center',
          }}
        />
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION PREVIEW — asymmetric bento (Terminal big left, Wealth Counsel top right, FUN full width bottom)
// ─────────────────────────────────────────────────────────────────────────────
function TerminalCard({ inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
      style={{ height: '100%' }}
    >
      <div
        onClick={() => { window.location.href = '/terminal-hub' }}
        style={{
          background: '#231c16', border: '1px solid #3d3028', borderRadius: 20,
          overflow: 'hidden', cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.32,0.72,0,1)',
          boxShadow: 'inset 0 1px 0 var(--border-c)',
          height: '100%', display: 'flex', flexDirection: 'column',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(201,169,110,0.4)'
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 var(--border-c)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#3d3028'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'inset 0 1px 0 var(--border-c)'
        }}
      >
        <div style={{ padding: '28px 28px 0', display: 'grid', gridTemplateColumns: '1fr 148px', gap: 20, alignItems: 'start', flex: 1 }}>
          {/* Left: text content */}
          <div>
            {/* Tag */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)',
              borderRadius: 6, padding: '4px 10px', marginBottom: 20,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#c9a96e' }} />
              <span style={{ fontSize: 10, color: '#c9a96e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: UI }}>
                Planora Terminal
              </span>
            </div>

            <h3 style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, color: '#f0e8d8', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
              The Planora Terminal
            </h3>
            <p style={{ fontSize: 13, color: '#a89070', lineHeight: 1.65, margin: '0 0 20px', maxWidth: 360, fontFamily: UI }}>
              Institutional-grade market data, planning tools, risk analysis, and wealth intelligence — built for serious investors, not traders.
            </p>

            {/* Live market stats */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              {[
                { label: 'S&P 500', value: '5,847', chg: '+1.84%', up: true },
                { label: 'NDX',     value: '20,412', chg: '+2.31%', up: true },
                { label: 'VIX',     value: '13.4',  chg: '-0.8%',  up: false },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 10, color: '#6b5540', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3, fontFamily: UI }}>{s.label}</div>
                  <div className="font-mono" style={{ fontSize: 14, fontWeight: 700, color: '#f0e8d8' }}>{s.value}</div>
                  <div className="font-mono" style={{ fontSize: 11, color: s.up ? '#4a7c59' : '#8b3a3a' }}>{s.chg}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: framed globe photo */}
          <div style={{
            position: 'relative', width: 148, height: 148,
            borderRadius: 14,
            border: '1px solid rgba(201,169,110,0.28)',
            overflow: 'hidden',
            boxShadow: '0 8px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(201,169,110,0.1)',
            flexShrink: 0,
            marginTop: 4,
          }}>
            <CornerBrackets color="rgba(201,169,110,0.5)" size={12} inset={7} weight={1} />
            <img
              src={globeChartImg}
              alt="Global markets"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,20,16,0.42)' }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '18px 0 8px',
              background: 'linear-gradient(to top, rgba(26,20,16,0.85) 0%, transparent 100%)',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(201,169,110,0.8)', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: UI }}>
                Global Markets
              </span>
            </div>
          </div>
        </div>

        {/* Chart bleeds to edge */}
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={SP500_SPARK} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="terminalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#c9a96e" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#c9a96e" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="#c9a96e" strokeWidth={1.5} fill="url(#terminalGrad)" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>

        <div style={{ padding: '14px 28px', borderTop: '1px solid #2a2018', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#6b5540', fontFamily: UI }}>Risk analysis, sectors, portfolio, planning</span>
          <ArrowUpRight size={16} color="#c9a96e" />
        </div>
      </div>
    </motion.div>
  )
}

function WealthCounselCard({ inView }) {
  const features = ['Advisor Marketplace', 'Verified CFP Profiles', 'Specialization Matching', 'Fee Transparency']
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
    >
      <div
        onClick={() => { window.location.href = '/wealth-counsel-hub' }}
        style={{
          background: '#231c16', border: '1px solid #3d3028', borderRadius: 20,
          padding: 28, height: '100%', display: 'flex', flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.32,0.72,0,1)',
          boxShadow: 'inset 0 1px 0 var(--border-c)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(0,180,198,0.35)'
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 var(--border-c)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#3d3028'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'inset 0 1px 0 var(--border-c)'
        }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,180,198,0.08)', border: '1px solid rgba(0,180,198,0.2)',
          borderRadius: 6, padding: '4px 10px', marginBottom: 20, alignSelf: 'flex-start',
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00B4C6' }} />
          <span style={{ fontSize: 10, color: '#00B4C6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: UI }}>
            Wealth Counsel
          </span>
        </div>

        <h3 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, color: '#f0e8d8', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
          Find Your Advisor
        </h3>
        <p style={{ fontSize: 13, color: '#a89070', lineHeight: 1.65, margin: '0 0 24px', fontFamily: UI }}>
          Browse verified CFP professionals matched to your goals — transparent fees, real credentials, no cold calls.
        </p>

        {/* Framed advisor photo */}
        <div style={{
          position: 'relative', width: '100%', height: 148,
          borderRadius: 14, overflow: 'hidden', marginBottom: 24,
          border: '1px solid rgba(0,180,198,0.25)',
          boxShadow: '0 8px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(0,180,198,0.08)',
          flexShrink: 0,
        }}>
          <CornerBrackets color="rgba(0,180,198,0.5)" size={12} inset={7} weight={1} />
          <img
            src={advisorImg}
            alt="Advisor working with client"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,20,16,0.38)' }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '22px 12px 9px',
            background: 'linear-gradient(to top, rgba(26,20,16,0.82) 0%, transparent 100%)',
          }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(0,180,198,0.85)', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: UI }}>
              Verified CFP Professionals
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {features.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#00B4C6', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#a89070', fontFamily: UI }}>{f}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #2a2018', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#6b5540', fontFamily: UI }}>Advisor marketplace</span>
          <ArrowUpRight size={16} color="#00B4C6" />
        </div>
      </div>
    </motion.div>
  )
}

function FUNCard({ inView }) {
  const topics = [
    { label: 'Investing Basics',     color: '#c9a96e' },
    { label: 'Retirement Planning',  color: '#8b6340' },
    { label: 'Tax Strategy',         color: '#6b5540' },
    { label: 'Budgeting',            color: '#c9a96e' },
    { label: 'Estate Planning',      color: '#8b6340' },
    { label: 'Insurance',            color: '#6b5540' },
    { label: 'Debt & Credit',        color: '#c9a96e' },
    { label: 'Real Estate',          color: '#8b6340' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
    >
      <div
        onClick={() => { window.location.href = '/education-hub' }}
        style={{
          background: '#231c16', border: '1px solid #3d3028', borderRadius: 20,
          padding: '28px 32px', cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.32,0.72,0,1)',
          boxShadow: 'inset 0 1px 0 var(--border-c)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(129,140,248,0.35)'
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 var(--border-c)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#3d3028'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'inset 0 1px 0 var(--border-c)'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center' }} className="fun-card-inner">
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.22)',
              borderRadius: 6, padding: '4px 10px', marginBottom: 16,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#818cf8' }} />
              <span style={{ fontSize: 10, color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: UI }}>
                Financial Education
              </span>
            </div>
            <h3 style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, color: '#f0e8d8', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
              FUN — Financial Understanding Network
            </h3>
            <p style={{ fontSize: 13, color: '#a89070', lineHeight: 1.65, margin: 0, fontFamily: UI, maxWidth: 420 }}>
              Tax strategy, retirement planning, investing fundamentals, estate protection — every dimension of financial life, explained like a patient professor.
            </p>
          </div>
          {/* Right: framed photo + topic badges stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
            {/* Framed planning photo */}
            <div style={{
              position: 'relative', width: 160, height: 100,
              borderRadius: 12,
              border: '1px solid rgba(129,140,248,0.3)',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(129,140,248,0.12)',
              flexShrink: 0,
            }}>
              <CornerBrackets color="rgba(129,140,248,0.55)" size={10} inset={6} weight={1} />
              <img
                src={financialPlanImg}
                alt="Financial planning"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(26,20,16,0.48)',
              }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 200, justifyContent: 'flex-end' }}>
              {topics.slice(0, 6).map(t => (
                <span key={t.label} style={{
                  fontSize: 11, fontFamily: UI, color: t.color,
                  background: `${t.color}10`, border: `1px solid ${t.color}25`,
                  borderRadius: 6, padding: '4px 10px', fontWeight: 500,
                }}>
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function BusinessOwnerCard({ inView }) {
  const topics = [
    { label: 'Entity Strategy',    color: '#c9a96e' },
    { label: 'Tax Minimization',   color: '#8b6340' },
    { label: 'Retirement Plans',   color: '#6b5540' },
    { label: 'Buy-Sell Agreements', color: '#c9a96e' },
    { label: 'Succession Planning', color: '#8b6340' },
    { label: 'Benefits & Team',    color: '#6b5540' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
      style={{ height: '100%' }}
    >
      <div
        onClick={() => { window.location.href = '/business-planning' }}
        style={{
          background: '#231c16', border: '1px solid #3d3028', borderRadius: 20,
          padding: '28px 30px', cursor: 'pointer', height: '100%', boxSizing: 'border-box',
          transition: 'all 0.3s cubic-bezier(0.32,0.72,0,1)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(139,99,64,0.45)'
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#3d3028'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.03)'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 28, alignItems: 'center' }} className="biz-card-inner">
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(139,99,64,0.12)', border: '1px solid rgba(139,99,64,0.28)',
              borderRadius: 6, padding: '4px 10px', marginBottom: 16,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#8b6340' }} />
              <span style={{ fontSize: 10, color: '#8b6340', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: UI }}>
                Business Owner
              </span>
            </div>
            <h3 style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, color: '#f0e8d8', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
              Business Owner Planning
            </h3>
            <p style={{ fontSize: 13, color: '#a89070', lineHeight: 1.65, margin: 0, fontFamily: UI }}>
              Entity strategy, tax minimization, retirement plans, buy-sell agreements, and succession planning — the financial layer every business owner needs but rarely gets.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 240 }}>
            {topics.map(t => (
              <span key={t.label} style={{
                fontSize: 11, fontFamily: UI, color: t.color,
                background: `${t.color}10`, border: `1px solid ${t.color}25`,
                borderRadius: 6, padding: '4px 10px', fontWeight: 500,
              }}>
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function SectionPreview() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} style={{ background: '#1a1410', padding: '100px 40px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ marginBottom: 48 }}
        >
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b5540', fontFamily: UI, fontWeight: 600, marginBottom: 12 }}>
            Everything you need
          </div>
          <h2 style={{
            fontFamily: DISPLAY, fontSize: 'clamp(28px,3.5vw,44px)',
            fontWeight: 700, color: '#f0e8d8',
            margin: 0, letterSpacing: '-0.02em', maxWidth: 480,
          }}>
            One platform. Four disciplines.
          </h2>
        </motion.div>

        {/* Asymmetric bento — NOT equal columns */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gridTemplateRows: 'auto auto', gap: 16 }}
          className="planora-preview-grid"
        >
          <TerminalCard inView={inView} />
          <WealthCounselCard inView={inView} />
          <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="bottom-row-grid">
            <FUNCard inView={inView} />
            <BusinessOwnerCard inView={inView} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .bottom-row-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .planora-preview-grid { grid-template-columns: 1fr !important; }
          .fun-card-inner        { grid-template-columns: 1fr !important; }
          .biz-card-inner        { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          section { padding-left: 24px !important; padding-right: 24px !important; }
        }
      `}</style>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANNER SECTIONS — clickable section hub cards
// ─────────────────────────────────────────────────────────────────────────────
const PLANNER_SECTIONS = [
  {
    id: 'planning',
    icon: FileText,
    label: 'Financial Planning',
    tagline: 'The discipline that separates wealth builders from earners.',
    desc: 'Budget planning, retirement, tax strategy, life insurance, net worth tracking, real estate, family, and estate planning — every pillar of personal finance in one place.',
    href: '/planning',
    stat: '2.5× more wealth',
    statLabel: 'for people with a written plan',
    accent: '#c9a96e',
    accentDim: 'rgba(201,169,110,0.08)',
    accentBdr: 'rgba(201,169,110,0.18)',
    subsections: ['Budget Planner', 'Retirement Planning', 'Tax Planning', 'Life Insurance', 'Net Worth', 'Social Security', 'Real Estate Planning', 'Family Planning', 'Estate Planning'],
  },
  {
    id: 'markets',
    icon: BarChart2,
    label: 'Markets & Intelligence',
    tagline: 'Institutional-grade market data, live.',
    desc: 'Live indices, market breadth, economic calendar, labor data, consumer trends, and terminal-grade intelligence — Bloomberg quality without the Bloomberg price.',
    href: '/markets',
    stat: '60s refresh',
    statLabel: 'on all live market data',
    accent: '#c9a96e',
    accentDim: 'rgba(201,169,110,0.08)',
    accentBdr: 'rgba(201,169,110,0.18)',
    subsections: ['Dashboard', 'Terminal', 'Market Breadth', 'Economic Calendar', 'Labor Markets', 'The Consumer', 'Political Intelligence'],
  },
  {
    id: 'wealth',
    icon: TrendingUp,
    label: 'Wealth & Investing',
    tagline: 'Build and protect what you earn.',
    desc: 'Risk analysis, AI-generated reports, brokerage selection, net worth tracking, and real estate investment intelligence — all the tools serious wealth builders need.',
    href: '/wealth',
    stat: '7% avg',
    statLabel: 'annual S&P 500 real return',
    accent: '#c9a96e',
    accentDim: 'rgba(201,169,110,0.08)',
    accentBdr: 'rgba(201,169,110,0.18)',
    subsections: ['Risk Analysis', 'AI Reports', 'Brokerage Guide', 'Net Worth Tracker', 'Real Estate', 'Life Insurance'],
  },
  {
    id: 'macro',
    icon: Globe,
    label: 'Macro & Economics',
    tagline: 'Understand the forces moving the world.',
    desc: 'Economic calendar, labor markets, consumer trends, real estate data, and political intelligence — the macro context behind every market move.',
    href: '/macro',
    stat: '10+',
    statLabel: 'macro data streams tracked',
    accent: '#c9a96e',
    accentDim: 'rgba(201,169,110,0.08)',
    accentBdr: 'rgba(201,169,110,0.18)',
    subsections: ['Economic Calendar', 'Labor Markets', 'The Consumer', 'Real Estate', 'Political Intelligence'],
  },
  {
    id: 'calculators',
    icon: BarChart2,
    label: 'Planning Calculators',
    tagline: 'Run the numbers before you decide.',
    desc: 'Compound growth, retirement projections, tax drag, insurance needs, mortgage analysis — every planning calculation in one place.',
    href: '/Calculators',
    stat: '20+',
    statLabel: 'interactive financial calculators',
    accent: '#c9a96e',
    accentDim: 'rgba(201,169,110,0.08)',
    accentBdr: 'rgba(201,169,110,0.18)',
    subsections: ['Compound Growth', 'Retirement Savings', 'Tax Drag Cost', 'Insurance Needs', 'Mortgage Analysis', 'Net Worth'],
  },
  {
    id: 'history',
    icon: BookOpen,
    label: 'History & Psychology',
    tagline: 'Why markets move — and why investors get it wrong.',
    desc: 'Five behavioral finance lessons built from decades of market data. The Elastic Band, The Best Days, The Horizon Flip, The Perfect Time Illusion, and the Doom-Loop.',
    href: '/MarketHistory',
    stat: '5',
    statLabel: 'behavioral finance lessons',
    accent: '#c9a96e',
    accentDim: 'rgba(201,169,110,0.08)',
    accentBdr: 'rgba(201,169,110,0.18)',
    subsections: ['Market History', 'The Elastic Band', 'The Best Days', 'The Horizon Flip', 'Perfect Time Illusion', 'The Doom-Loop'],
  },
]

function PlannerSectionCard({ section, inView, delay }) {
  const navigate = useNavigate()
  const Icon = section.icon
  const [hovered, setHovered] = useState(false)

  const baseCard = {
    background: hovered ? '#271f18' : '#231c16',
    border: `1px solid ${hovered ? section.accentBdr : '#2a2018'}`,
    borderRadius: 16,
    padding: 0,
    textAlign: 'left',
    cursor: 'pointer',
    width: '100%',
    overflow: 'hidden',
    transform: hovered ? 'translateY(-3px)' : 'none',
    boxShadow: hovered ? `0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px ${section.accentBdr}` : '0 2px 12px rgba(0,0,0,0.2)',
    transition: 'all 0.22s cubic-bezier(0.32,0.72,0,1)',
  }

  if (section.wide) {
    return (
      <motion.button
        variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay } } }}
        onClick={() => navigate(section.href)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ ...baseCard, display: 'flex', flexDirection: 'column', gridColumn: section.span2 ? 'span 2' : '1 / -1' }}
      >
        <div style={{ height: 2, background: hovered ? `linear-gradient(90deg, ${section.accent}, transparent 50%)` : 'transparent', transition: 'background 0.22s ease' }} />
        <div style={{ padding: '1.75rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }} className="fun-wide-inner">
          {/* Left */}
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: section.accentDim, border: `1px solid ${section.accentBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={section.accent} />
                </div>
                <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: '#f0e8d8' }}>{section.label}</div>
              </div>
              <ArrowUpRight size={14} color={hovered ? section.accent : '#6b5540'} style={{ transition: 'color 0.2s', flexShrink: 0 }} />
            </div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '0.8125rem', fontStyle: 'italic', color: section.accent, marginBottom: 10, lineHeight: 1.4 }}>{section.tagline}</div>
            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.8125rem', color: '#a89070', lineHeight: 1.65, marginBottom: '1.25rem' }}>{section.desc}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, paddingTop: '1rem', borderTop: '1px solid #2a2018' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.0625rem', fontWeight: 700, color: section.accent }}>{section.stat}</span>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.6875rem', color: '#6b5540', lineHeight: 1.4 }}>{section.statLabel}</span>
            </div>
          </div>
          {/* Right — pills grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {section.subsections.map(s => (
              <span key={s} style={{
                fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.6875rem', fontWeight: 600,
                color: section.accent, background: section.accentDim,
                border: `1px solid ${section.accentBdr}`,
                borderRadius: 6, padding: '5px 10px', whiteSpace: 'nowrap',
              }}>{s}</span>
            ))}
          </div>
        </div>
      </motion.button>
    )
  }

  return (
    <motion.button
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay } } }}
      onClick={() => navigate(section.href)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...baseCard, display: 'flex', flexDirection: 'column' }}
    >
      {/* Top accent bar */}
      <div style={{ height: 2, background: hovered ? `linear-gradient(90deg, ${section.accent}, transparent)` : 'transparent', transition: 'background 0.22s ease' }} />

      <div style={{ padding: '1.5rem' }}>
        {/* Icon + arrow */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.125rem' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: section.accentDim, border: `1px solid ${section.accentBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={16} color={section.accent} />
          </div>
          <ArrowUpRight size={14} color={hovered ? section.accent : '#6b5540'} style={{ transition: 'color 0.2s' }} />
        </div>

        {/* Label + tagline */}
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: '#f0e8d8', marginBottom: 6 }}>{section.label}</div>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '0.8125rem', fontStyle: 'italic', color: section.accent, marginBottom: 10, lineHeight: 1.4 }}>{section.tagline}</div>
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.8125rem', color: '#a89070', lineHeight: 1.65, marginBottom: '1.25rem' }}>{section.desc}</div>

        {/* Sub-section pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.25rem' }}>
          {section.subsections.map(s => (
            <span key={s} style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.625rem', fontWeight: 600, color: '#6b5540', background: '#2d2419', border: '1px solid #2a2018', borderRadius: 5, padding: '2px 7px', whiteSpace: 'nowrap' }}>{s}</span>
          ))}
        </div>

        {/* Stat footer */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, paddingTop: '0.875rem', borderTop: '1px solid #2a2018' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.0625rem', fontWeight: 700, color: section.accent }}>{section.stat}</span>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.6875rem', color: '#6b5540', lineHeight: 1.4 }}>{section.statLabel}</span>
        </div>
      </div>
    </motion.button>
  )
}

function PlannerSections() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} style={{ background: '#1a1410', borderTop: '1px solid #2a2018', padding: '100px 40px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ marginBottom: 56 }}
        >
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b5540', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600, marginBottom: 12 }}>
            Explore the platform
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(26px,3.2vw,42px)', fontWeight: 700, color: '#f0e8d8', margin: 0, letterSpacing: '-0.02em' }}>
              Go deeper.<em style={{ fontStyle: 'italic', color: '#c9a96e' }}> Every section, built out.</em>
            </h2>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.875rem', color: '#6b5540', maxWidth: 380, lineHeight: 1.7, margin: 0 }}>
              Each section explains what it covers, why it matters, and gives you the tools to act on it. Click any card to go deeper.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.125rem' }}
          className="planner-sections-grid"
        >
          {PLANNER_SECTIONS.map((s, i) => (
            <PlannerSectionCard key={s.id} section={s} inView={inView} delay={i * 0.06} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}
        >
          <div style={{ width: 1, height: 20, background: '#2a2018' }} />
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '0.75rem', color: '#6b5540' }}>
            Press <strong style={{ color: '#a89070', fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}>P</strong> inside the platform to navigate between all sections
          </span>
          <div style={{ width: 1, height: 20, background: '#2a2018' }} />
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) { .planner-sections-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 580px) { .planner-sections-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) { .fun-wide-inner { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FeaturedInsight moved to /src/pages/TheFeed.jsx — accessible at /the-feed
// ─────────────────────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
function _FeaturedInsightMoved_UNUSED() {
  const [active, setActive]           = useState(0)
  const [showLibrary, setShowLibrary] = useState(false)
  const [readingInsight, setReading]  = useState(null)
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const INSIGHTS = getDailyInsights()
  const pastInsights = getPastInsights()
  const insight = INSIGHTS[active]

  return (
    <section ref={ref} style={{ background: '#231c16', borderTop: '1px solid #2a2018', padding: '100px 40px' }}>

      {/* Article reader modal */}
      {readingInsight && (
        <div
          onClick={() => setReading(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(26,20,16,0.92)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '40px 24px',
            overflowY: 'auto',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a1410', border: '1px solid #3d3028',
              borderRadius: 20, width: '100%', maxWidth: 760,
              padding: '48px 52px',
            }}
          >
            {/* Top bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)',
                borderRadius: 6, padding: '4px 12px',
              }}>
                <span style={{ fontSize: 10, color: '#c9a96e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: UI }}>
                  {readingInsight.category}
                </span>
              </div>
              <button
                onClick={() => setReading(null)}
                style={{
                  background: 'transparent', border: '1px solid #3d3028',
                  borderRadius: 8, padding: '6px 14px',
                  color: '#6b5540', fontSize: 12, fontFamily: UI, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>

            {/* Headline */}
            <h2 style={{
              fontFamily: DISPLAY, fontSize: 'clamp(22px,3vw,34px)', fontWeight: 700,
              color: '#f0e8d8', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>
              {readingInsight.headline}
            </h2>
            <div style={{ fontSize: 11, color: '#6b5540', fontFamily: UI, marginBottom: 32 }}>{readingInsight.readTime}</div>

            {/* Divider */}
            <div style={{ height: 1, background: '#2a2018', marginBottom: 32 }} />

            {/* Body sections */}
            {readingInsight.body ? readingInsight.body.map((section, idx) => {
              if (section.type === 'p') return (
                <p key={idx} style={{ fontSize: 16, color: '#a89070', lineHeight: 1.85, margin: '0 0 24px', fontFamily: UI }}>
                  {section.text}
                </p>
              )
              if (section.type === 'h2') return (
                <h3 key={idx} style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, color: '#f0e8d8', margin: '40px 0 16px', letterSpacing: '-0.01em' }}>
                  {section.text}
                </h3>
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
                      <YAxis tick={{ fill: '#6b5540', fontSize: 10, fontFamily: UI }} tickLine={false} axisLine={false} label={{ value: section.yLabel, angle: -90, position: 'insideLeft', fill: '#6b5540', fontSize: 10, fontFamily: UI }} />
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
                      <YAxis tick={{ fill: '#6b5540', fontSize: 10, fontFamily: UI }} tickLine={false} axisLine={false} label={{ value: section.yLabel, angle: -90, position: 'insideLeft', fill: '#6b5540', fontSize: 10, fontFamily: UI }} />
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
            }) : (
              <p style={{ fontSize: 16, color: '#a89070', lineHeight: 1.85, margin: '0 0 24px', fontFamily: UI }}>
                {readingInsight.excerpt}
              </p>
            )}

            {/* Pull quote */}
            <div style={{ borderLeft: '2px solid rgba(201,169,110,0.4)', paddingLeft: 24, margin: '36px 0' }}>
              <p style={{ fontFamily: DISPLAY, fontSize: 18, fontStyle: 'italic', color: '#c9a96e', margin: '0 0 8px', lineHeight: 1.5 }}>
                &ldquo;{readingInsight.quote}&rdquo;
              </p>
              <span style={{ fontSize: 11, color: '#6b5540', fontFamily: UI }}>— {readingInsight.quoteAttr}</span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#2a2018', marginBottom: 32 }} />

            {/* Concept box */}
            <div style={{
              background: '#231c16', border: '1px solid #3d3028',
              borderRadius: 12, padding: '24px 28px', marginBottom: 32,
            }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#6b5540', fontFamily: UI, marginBottom: 10 }}>
                Core Concept
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: '#c9a96e', marginBottom: 10 }}>
                {readingInsight.concept}
              </div>
              <p style={{ fontSize: 14, color: '#a89070', lineHeight: 1.7, margin: 0, fontFamily: UI }}>
                {readingInsight.definition}
              </p>
            </div>

            {/* Further reading */}
            <div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#6b5540', fontFamily: UI, marginBottom: 14 }}>
                Further Reading
              </div>
              {readingInsight.books.map(book => (
                <div key={book} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#c9a96e50', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#a89070', fontFamily: UI, fontStyle: 'italic' }}>{book}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Library modal */}
      {showLibrary && (
        <div
          onClick={() => setShowLibrary(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(26,20,16,0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#231c16', border: '1px solid #3d3028',
              borderRadius: 20, width: '100%', maxWidth: 920,
              maxHeight: '82vh', overflowY: 'auto',
              padding: '36px 40px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b5540', fontFamily: UI, fontWeight: 600, marginBottom: 8 }}>
                  All Insights
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, color: '#f0e8d8', margin: 0, letterSpacing: '-0.02em' }}>
                  Insight Library
                </h3>
              </div>
              <button
                onClick={() => setShowLibrary(false)}
                style={{
                  background: 'transparent', border: '1px solid #3d3028',
                  borderRadius: 8, padding: '6px 14px',
                  color: '#6b5540', fontSize: 12, fontFamily: UI, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
            {pastInsights.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: 13, color: '#6b5540', fontFamily: UI, lineHeight: 1.7 }}>
                  No past insights yet. Check back tomorrow<br />as the library builds day by day.
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {pastInsights.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => { setShowLibrary(false); setReading(item) }}
                    style={{
                      background: '#2d2419', border: '1px solid #3d3028',
                      borderRadius: 12, padding: '20px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.35)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#3d3028'}
                  >
                    <div style={{
                      display: 'inline-flex', alignItems: 'center',
                      background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.18)',
                      borderRadius: 5, padding: '3px 8px', marginBottom: 12,
                    }}>
                      <span style={{ fontSize: 9, color: '#c9a96e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: UI }}>
                        {item.category}
                      </span>
                    </div>
                    <div style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: '#f0e8d8', lineHeight: 1.35, marginBottom: 8 }}>
                      {item.headline}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b5540', fontFamily: UI }}>{item.readTime}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b5540', fontFamily: UI, fontWeight: 600 }}>
                Featured Insight
              </div>
              <button
                onClick={() => setShowLibrary(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'transparent', border: '1px solid #3d3028',
                  borderRadius: 6, padding: '3px 10px',
                  fontSize: 10, color: '#a89070', fontFamily: UI, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.4)'; e.currentTarget.style.color = '#c9a96e' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3028'; e.currentTarget.style.color = '#a89070' }}
              >
                Library{pastInsights.length > 0 ? ` (${pastInsights.length})` : ''}
              </button>
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(24px,3vw,38px)', fontWeight: 700, color: '#f0e8d8', margin: 0, letterSpacing: '-0.02em' }}>
              Learn from the principles,<br />not the headlines.
            </h2>
          </div>

          {/* Tab selectors */}
          <div style={{ display: 'flex', gap: 8 }}>
            {INSIGHTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  background: i === active ? '#c9a96e' : 'transparent',
                  border: `1px solid ${i === active ? '#c9a96e' : '#3d3028'}`,
                  borderRadius: 8, padding: '6px 14px',
                  fontSize: 11, fontFamily: UI, fontWeight: 600,
                  color: i === active ? '#1a1410' : '#6b5540',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.32,0.72,0,1)',
                }}
              >
                0{i + 1}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }}
            className="planora-insight-grid"
          >
            {/* Left */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)',
                borderRadius: 6, padding: '4px 10px', marginBottom: 20,
              }}>
                <span style={{ fontSize: 10, color: '#c9a96e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: UI }}>
                  {insight.category}
                </span>
              </div>

              <h3 style={{
                fontFamily: DISPLAY, fontSize: 'clamp(22px,2.5vw,32px)',
                fontWeight: 700, color: '#f0e8d8',
                lineHeight: 1.25, margin: '0 0 20px', letterSpacing: '-0.02em',
              }}>
                {insight.headline}
              </h3>

              <p style={{
                fontSize: 15, color: '#a89070', lineHeight: 1.8,
                margin: '0 0 28px', fontFamily: UI, maxWidth: 560,
              }}>
                {insight.excerpt}
              </p>

              {/* Quote */}
              <div style={{ borderLeft: '2px solid #c9a96e50', paddingLeft: 20, marginBottom: 32 }}>
                <p style={{ fontFamily: DISPLAY, fontSize: 16, fontStyle: 'italic', color: '#a89070', margin: '0 0 8px', lineHeight: 1.55 }}>
                  &ldquo;{insight.quote}&rdquo;
                </p>
                <span style={{ fontSize: 11, color: '#6b5540', fontFamily: UI }}>— {insight.quoteAttr}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  onClick={() => setReading(insight)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'transparent', border: '1px solid rgba(201,169,110,0.3)',
                    borderRadius: 9, padding: '10px 18px',
                    color: '#c9a96e', fontSize: 13, fontWeight: 600, fontFamily: UI,
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.32,0.72,0,1)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.08)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent';             e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)' }}
                >
                  Explore this topic <ArrowRight size={13} />
                </button>
                <span style={{ fontSize: 11, color: '#6b5540', fontFamily: UI }}>{insight.readTime}</span>
              </div>
            </div>

            {/* Right — concept card */}
            <div style={{
              background: '#2d2419', border: '1px solid #3d3028',
              borderRadius: 16, padding: 28,
              boxShadow: 'inset 0 1px 0 var(--elevated)',
            }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#6b5540', fontFamily: UI, marginBottom: 12 }}>
                Core Concept
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 700, color: '#c9a96e', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
                {insight.concept}
              </div>
              <p style={{ fontSize: 13, color: '#a89070', lineHeight: 1.7, margin: '0 0 24px', fontFamily: UI }}>
                {insight.definition}
              </p>

              <div style={{ height: 1, background: '#3d3028', marginBottom: 20 }} />

              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#6b5540', fontFamily: UI, marginBottom: 12 }}>
                Further Reading
              </div>
              {insight.books.map(book => (
                <div key={book} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#6b5540', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#6b5540', fontFamily: UI, fontStyle: 'italic' }}>{book}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .planora-insight-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          section { padding-left: 24px !important; padding-right: 24px !important; }
        }
      `}</style>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────
const FOOTER_COLS = [
  {
    heading: 'Terminal',
    links: [
      { label: 'Market Overview',   href: '/dashboard'        },
      { label: 'Risk Analysis',     href: '/risk-analysis'    },
      { label: 'Sector Analysis',   href: '/sectors'          },
      { label: 'Portfolio Tools',   href: '/dashboard'        },
    ],
  },
  {
    heading: 'Markets',
    links: [
      { label: 'Market History',    href: '/MarketHistory'    },
      { label: 'Market News',       href: '/market-news'      },
      { label: 'Economic Calendar', href: '/economic-calendar'},
      { label: 'Top Performers',    href: '/top-performers'   },
    ],
  },
  {
    heading: 'Macro',
    links: [
      { label: 'Energy Markets',    href: '/energy'           },
      { label: 'Labor Markets',     href: '/labor'            },
      { label: 'Consumer Market',   href: '/consumer'         },
      { label: 'Real Estate',       href: '/real-estate'      },
    ],
  },
  {
    heading: 'Plan',
    links: [
      { label: 'Tax Planning',      href: '/tax-planning'      },
      { label: 'Retirement',        href: '/retirement-planning'},
      { label: 'Wealth Counsel',    href: '/wealth-counsel'    },
      { label: 'Estate Planning',   href: '/FuturePlanning'    },
    ],
  },
  {
    heading: 'Education',
    links: [
      { label: 'FUN Platform',      href: '/fun'              },
      { label: 'Calculators',       href: '/calculators'      },
      { label: 'AI Advisor',        href: '/ai-advisor'       },
    ],
  },
]

function Footer() {
  const navigate = useNavigate()
  return (
    <footer style={{ background: '#0f0c09', borderTop: '1px solid #2a2018' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '64px 40px 48px' }}>
        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 80, marginBottom: 56 }} className="planora-footer-main">
          {/* Brand */}
          <div>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'block', marginBottom: 10 }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, color: '#c9a96e' }}>Planora</span>
            </button>
            <p style={{ fontSize: 13, color: '#6b5540', lineHeight: 1.7, maxWidth: 200, margin: '0 0 20px', fontFamily: UI }}>
              Institutional Intelligence. Personal Impact.
            </p>
            <p style={{ fontSize: 11, color: '#3d3028', lineHeight: 1.6, fontFamily: UI }}>
              For educational purposes only.<br />Not financial advice.
            </p>
          </div>

          {/* Nav columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24 }} className="planora-footer-nav">
            {FOOTER_COLS.map(col => (
              <div key={col.heading}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#6b5540', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16, fontFamily: UI }}>
                  {col.heading}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(l => (
                    <button
                      key={l.href}
                      onClick={() => navigate(l.href)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 12, color: '#6b5540', fontFamily: UI,
                        textAlign: 'left', padding: 0, lineHeight: 1.4,
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#a89070')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#6b5540')}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#2a2018', marginBottom: 28 }} />

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 11, color: '#3d3028', maxWidth: 600, lineHeight: 1.7, margin: 0, fontFamily: UI }}>
            Planora is an educational and research platform only. Nothing on this site constitutes
            financial, investment, tax, legal, or accounting advice. All data is provided for
            informational purposes. Consult a qualified professional for your specific situation.
            Past performance does not guarantee future results.
          </p>
          <p style={{ fontSize: 11, color: '#3d3028', whiteSpace: 'nowrap', margin: 0, fontFamily: UI }}>
            &copy; {new Date().getFullYear()} Planora
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .planora-footer-main { grid-template-columns: 1fr !important; gap: 40px !important; }
          .planora-footer-nav  { grid-template-columns: repeat(3,1fr) !important; }
        }
        @media (max-width: 640px) {
          .planora-footer-nav  { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </footer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LANDING PAGE — root export
// ─────────────────────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div style={{ background: '#1a1410', minHeight: '100dvh', fontFamily: UI }}>
      <Nav />
      <Hero />
      <QuoteSection />
      <PhotoBreak />
      <SectionPreview />
      <PlannerSections />
      <Footer />
    </div>
  )
}
