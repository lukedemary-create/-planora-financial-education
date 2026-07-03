import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MapPin, Star, ChevronDown, ChevronUp, X, Check,
  FileText, FolderOpen, User, Briefcase, Shield, Home,
  DollarSign, Heart, BookOpen, ChevronRight, Phone, Mail,
  Globe, Award, Users, Clock, CheckCircle, Circle, AlertCircle,
  BookUser, BadgeCheck, Sliders,
} from "lucide-react";

/* ── Design tokens ───────────────────────────────────────────────── */
const GOLD   = "#c9a84c";
const GREEN  = "#22c55e";
const RED    = "#ef4444";
const BLUE   = "#3b82f6";
const card   = { background:"var(--surface)", border:"1px solid var(--border-c)", borderRadius:10 };

/* ── Demo advisor data ────────────────────────────────────────────── */
const ADVISORS = [
  {
    id:1, name:"Sarah Chen, CFP® CPA", photo:"https://i.pravatar.cc/200?img=47",
    title:"Senior Wealth Advisor", firm:"Horizon Wealth Partners", firmType:"RIA – Fee-Only",
    location:"San Francisco, CA", state:"CA",
    phone:"(415) 555-0182", email:"s.chen@horizonwp.com", website:"horizonwealthpartners.com",
    credentials:["CFP®","CPA"], specialties:["Tech Executive Wealth","Equity Compensation","Tax Planning","Retirement"],
    aumMin:500000, aumDisplay:"$500K minimum", yearsExp:18,
    bio:"Sarah specializes in comprehensive financial planning for technology executives navigating complex equity compensation structures — RSUs, ISOs, and NQSOs. With 18 years in financial services and a background in tax advisory, she brings a holistic approach that integrates tax efficiency, investment strategy, and long-term planning.",
    approach:"Tax-first, fee-only planning with no product sales. Every recommendation is made solely in the client's best interest.",
    education:"BS Finance, UC Berkeley · MBA, Stanford GSB",
    clientFocus:"Tech executives, startup founders, dual-income professionals",
    rating:4.9, reviews:47, languages:["English","Mandarin"],
    awards:["Forbes Best-In-State 2024","Five Star Professional 2022–2024"],
    fee:"1% AUM / Flat fee available",
  },
  {
    id:2, name:"Michael Torres, CFP® CFA", photo:"https://i.pravatar.cc/200?img=52",
    title:"Managing Director, Wealth Management", firm:"Atlas Capital Advisors", firmType:"RIA – Fee-Only",
    location:"New York, NY", state:"NY",
    phone:"(212) 555-0374", email:"m.torres@atlascapital.com", website:"atlascapitaladvisors.com",
    credentials:["CFP®","CFA"], specialties:["Portfolio Management","Retirement Planning","Institutional","Alternative Investments"],
    aumMin:1000000, aumDisplay:"$1M minimum", yearsExp:24,
    bio:"Michael brings institutional investment discipline to individual and family wealth. Before founding Atlas Capital, he spent 12 years managing a $2B endowment portfolio at a major university. He applies the same evidence-based, low-cost investment philosophy to his private clients.",
    approach:"Evidence-based, factor-driven investing. No proprietary products. Full fiduciary standard.",
    education:"BS Economics, Columbia University · CFA Charterholder",
    clientFocus:"High-net-worth individuals, family offices, executives in transition",
    rating:4.8, reviews:62, languages:["English","Spanish"],
    awards:["Barron's Top 1,200 Advisors 2023","NAPFA Member of the Year 2021"],
    fee:"0.75–1% AUM tiered",
  },
  {
    id:3, name:"Jennifer Walsh, JD CFP®", photo:"https://i.pravatar.cc/200?img=49",
    title:"Estate & Trust Specialist", firm:"Covenant Estate Planning Group", firmType:"Fee-Only RIA + Legal",
    location:"Chicago, IL", state:"IL",
    phone:"(312) 555-0219", email:"j.walsh@covenantestate.com", website:"covenantestateplanning.com",
    credentials:["JD","CFP®","CTFA"], specialties:["Estate Planning","Trusts & Wills","Tax-Efficient Transfers","Business Succession"],
    aumMin:250000, aumDisplay:"$250K minimum", yearsExp:21,
    bio:"Jennifer is one of the few advisors who holds both a law degree and a CFP® designation, allowing her to provide truly integrated estate and financial planning under one roof. She focuses on multi-generational wealth transfer, business succession, and complex trust structures.",
    approach:"Legal precision meets financial planning. Every estate plan is built to survive tax law changes and family transitions.",
    education:"BA Political Science, Northwestern · JD, University of Chicago Law",
    clientFocus:"Business owners, multi-generational families, retirees with complex estates",
    rating:5.0, reviews:38, languages:["English"],
    awards:["Illinois Super Lawyers 2019–2024","CFP Board Distinguished Advisor 2022"],
    fee:"Flat fee / Hourly available",
  },
  {
    id:4, name:"Robert Kim, CFP® CPWA®", photo:"https://i.pravatar.cc/200?img=53",
    title:"Ultra-High-Net-Worth Advisor", firm:"Pacific Crest Family Office", firmType:"Multi-Family Office",
    location:"Los Angeles, CA", state:"CA",
    phone:"(310) 555-0447", email:"r.kim@pacificcrestfo.com", website:"pacificcrestfamilyoffice.com",
    credentials:["CFP®","CPWA®","CFA"], specialties:["Ultra-HNW Planning","Private Equity","Real Assets","Family Governance"],
    aumMin:5000000, aumDisplay:"$5M minimum", yearsExp:27,
    bio:"Robert leads the wealth advisory practice at Pacific Crest, serving families with $10M–$200M+ in assets. His team provides full family office services including investment management, tax coordination, estate planning, philanthropy, and family governance frameworks.",
    approach:"Institutional-grade strategy tailored to each family's values, legacy goals, and generational objectives.",
    education:"BA Economics, UCLA · MBA Finance, Wharton",
    clientFocus:"Ultra-high-net-worth families, entertainment/media executives, real estate dynasties",
    rating:4.9, reviews:22, languages:["English","Korean"],
    awards:["Worth Magazine Top Advisors 2022–2024","CPWA Designation Holder"],
    fee:"Custom family office retainer",
  },
  {
    id:5, name:"Amanda Foster, CFP®", photo:"https://i.pravatar.cc/200?img=44",
    title:"Business Owner & Retirement Specialist", firm:"Frontier Financial Planning", firmType:"RIA – Fee-Only",
    location:"Dallas, TX", state:"TX",
    phone:"(214) 555-0293", email:"a.foster@frontierfinancial.com", website:"frontierfinancialplanning.com",
    credentials:["CFP®","ChFC®"], specialties:["Business Owner Planning","Exit Strategies","Solo 401k","Retirement Income"],
    aumMin:300000, aumDisplay:"$300K minimum", yearsExp:15,
    bio:"Amanda built her practice serving the unique needs of small and mid-size business owners — from setting up tax-efficient retirement plans to structuring profitable exits. She understands that for most business owners, the business IS the retirement plan, and she helps bridge that gap.",
    approach:"Practical, owner-first planning. No jargon, no product pushing — just clear strategies that protect what you've built.",
    education:"BBA Finance, University of Texas at Austin · CFP® Designation 2009",
    clientFocus:"Small business owners, medical practices, entrepreneurs, franchise operators",
    rating:4.9, reviews:56, languages:["English"],
    awards:["DFW Best Financial Advisors 2023","NAPFA Member"],
    fee:"Flat annual fee",
  },
  {
    id:6, name:"David Patel, CFA CFP®", photo:"https://i.pravatar.cc/200?img=57",
    title:"Director of Investments", firm:"Beacon Institutional Advisors", firmType:"RIA – Institutional",
    location:"Boston, MA", state:"MA",
    phone:"(617) 555-0511", email:"d.patel@beaconadvisors.com", website:"beaconinstitutional.com",
    credentials:["CFA","CFP®","CAIA"], specialties:["Endowment Strategy","ESG Investing","Factor Investing","Alternatives"],
    aumMin:750000, aumDisplay:"$750K minimum", yearsExp:20,
    bio:"David applies endowment-style investment principles to private client portfolios. Before Beacon, he was the Chief Investment Officer for a $1.4B foundation, where he pioneered their sustainable investment policy. He now brings that institutional rigor to families who want their wealth aligned with their values.",
    approach:"Evidence-based, factor-tilted investing with a strong emphasis on ESG integration and alternative assets.",
    education:"BS Mathematics, MIT · MS Finance, Boston College",
    clientFocus:"Values-aligned investors, foundations, physicians, academics",
    rating:4.8, reviews:31, languages:["English","Hindi","Gujarati"],
    awards:["CFA Institute Excellence Award 2021","Morningstar ESG Leader"],
    fee:"0.85% AUM",
  },
  {
    id:7, name:"Lisa Montgomery, CFP® ChFC®", photo:"https://i.pravatar.cc/200?img=48",
    title:"Retirement Income Specialist", firm:"Suncoast Wealth Advisors", firmType:"RIA – Fee-Only",
    location:"Miami, FL", state:"FL",
    phone:"(305) 555-0126", email:"l.montgomery@suncoastwealthadv.com", website:"suncoastwealthadvisors.com",
    credentials:["CFP®","ChFC®","RICP®"], specialties:["Retirement Income","Social Security Optimization","Long-Term Care","Medicare Planning"],
    aumMin:200000, aumDisplay:"$200K minimum", yearsExp:19,
    bio:"Lisa specializes exclusively in the transition into and through retirement. From the complex decision of when to claim Social Security to building a tax-efficient income plan that lasts 30+ years, she helps retirees navigate the financial and emotional shift from accumulation to distribution.",
    approach:"Retirement is about income, not just assets. Every plan is built around sustainable cash flow that covers the life you want.",
    education:"BA Economics, University of Florida · RICP® from The American College",
    clientFocus:"Pre-retirees 55–65, recent retirees, snowbirds, widows/widowers in transition",
    rating:4.9, reviews:74, languages:["English","Spanish"],
    awards:["Forbes Best-In-State Advisors 2023","Five Star Professional 2020–2024"],
    fee:"Flat annual fee / Hourly",
  },
  {
    id:8, name:"James Okafor, CFP®", photo:"https://i.pravatar.cc/200?img=55",
    title:"Wealth Advisor & Financial Educator", firm:"Meridian Wealth Strategies", firmType:"RIA – Fee-Only",
    location:"Atlanta, GA", state:"GA",
    phone:"(404) 555-0388", email:"j.okafor@meridianwealthstrat.com", website:"meridianwealthstrategies.com",
    credentials:["CFP®","AFC®"], specialties:["First-Generation Wealth","Student Debt Strategy","Wealth Building","Insurance Planning"],
    aumMin:100000, aumDisplay:"$100K minimum", yearsExp:12,
    bio:"James is passionate about making comprehensive financial planning accessible to first-generation wealth builders. He works with professionals who are building wealth for the first time in their families, helping them navigate everything from student debt to investment accounts to protecting their growing net worth.",
    approach:"Education-first planning. Every client understands exactly why they're doing what they're doing — no black boxes.",
    education:"BS Finance, Morehouse College · AFC® Designation",
    clientFocus:"First-gen professionals, physicians in training, young families, minority business owners",
    rating:5.0, reviews:83, languages:["English"],
    awards:["Financial Planning Association Next Gen Award 2022","Atlanta Business Chronicle 40 Under 40"],
    fee:"Flat monthly retainer",
  },
  {
    id:9, name:"Rachel Greene, CFP® JD", photo:"https://i.pravatar.cc/200?img=45",
    title:"Tech Equity & Concentrated Position Advisor", firm:"Cascade Wealth Management", firmType:"RIA – Fee-Only",
    location:"Seattle, WA", state:"WA",
    phone:"(206) 555-0264", email:"r.greene@cascadewm.com", website:"cascadewealthmanagement.com",
    credentials:["CFP®","JD"], specialties:["Concentrated Stock","Options Strategy","IPO Planning","Charitable Giving"],
    aumMin:500000, aumDisplay:"$500K minimum", yearsExp:16,
    bio:"Rachel's practice is built around one of the most complex problems in wealth management: what to do with a highly concentrated stock position. Working primarily with Amazon, Microsoft, and Boeing employees, she designs tax-smart diversification strategies that protect wealth without triggering unnecessary tax events.",
    approach:"Concentrated risk is the enemy of long-term wealth. My job is to help you diversify intelligently, not all at once.",
    education:"BA Economics, University of Washington · JD, Seattle University School of Law",
    clientFocus:"Big tech employees, pre-IPO employees, executives with large RSU grants",
    rating:4.8, reviews:41, languages:["English"],
    awards:["Seattle Business Magazine Top Advisors 2023"],
    fee:"1% AUM / Flat project fees",
  },
  {
    id:10, name:"Thomas Nguyen, CFP® CPA", photo:"https://i.pravatar.cc/200?img=56",
    title:"Tax-Efficient Wealth Strategist", firm:"Summit Tax & Wealth", firmType:"Hybrid RIA + CPA Firm",
    location:"Denver, CO", state:"CO",
    phone:"(720) 555-0437", email:"t.nguyen@summitwealthco.com", website:"summittaxandwealth.com",
    credentials:["CFP®","CPA","PFS"], specialties:["Tax Planning","Roth Conversion Strategy","Real Estate Investors","Crypto Taxation"],
    aumMin:350000, aumDisplay:"$350K minimum", yearsExp:14,
    bio:"Thomas integrates tax strategy directly into the investment management process — something most financial advisors lack the credentials to do. By holding both a CPA and CFP®, he offers true one-stop financial and tax planning, eliminating the coordination gap between your accountant and your financial advisor.",
    approach:"Every investment decision is a tax decision. Most people leave thousands on the table every year through poor coordination.",
    education:"BS Accounting, University of Denver · MS Taxation, University of Colorado",
    clientFocus:"Real estate investors, cryptocurrency holders, S-Corp owners, high-income W-2 earners",
    rating:4.9, reviews:58, languages:["English","Vietnamese"],
    awards:["Colorado Society of CPAs Outstanding Member 2022","Five Star Professional 2021–2024"],
    fee:"Flat fee (planning + tax prep bundled)",
  },
  {
    id:11, name:"Maria Santos, CFP®", photo:"https://i.pravatar.cc/200?img=46",
    title:"Family Wealth Advisor", firm:"Vía Financial Planning", firmType:"RIA – Fee-Only",
    location:"Phoenix, AZ", state:"AZ",
    phone:"(602) 555-0319", email:"m.santos@viafinancial.com", website:"viafinancialplanning.com",
    credentials:["CFP®","AFC®"], specialties:["Bilingual Planning","Immigration & Finance","Multi-Cultural Families","Remittances & Cross-Border"],
    aumMin:150000, aumDisplay:"$150K minimum", yearsExp:11,
    bio:"Maria serves Latino and immigrant families who often face unique financial challenges — navigating the US financial system for the first time, managing cross-border financial ties, and building wealth across two countries. She conducts planning sessions in both English and Spanish, ensuring nothing is lost in translation.",
    approach:"Financial planning should reflect your whole life — including family abroad, cultural values, and the journey that brought you here.",
    education:"BS Finance, Arizona State University · CFP® Designation 2013",
    clientFocus:"Latino families, first-generation immigrants, cross-border professionals, DACA recipients",
    rating:5.0, reviews:91, languages:["English","Spanish"],
    awards:["CFP Board Diversity Scholarship Alumni","Phoenix Business Journal Rising Star 2021"],
    fee:"Flat monthly retainer",
  },
  {
    id:12, name:"William Brooks, CFP® CFA CIMA®", photo:"https://i.pravatar.cc/200?img=54",
    title:"Executive Compensation Advisor", firm:"Brooks & Whitmore Wealth", firmType:"Independent RIA",
    location:"Charlotte, NC", state:"NC",
    phone:"(704) 555-0552", email:"w.brooks@bwwealth.com", website:"brookswhitmorewealth.com",
    credentials:["CFP®","CFA","CIMA®"], specialties:["Deferred Compensation","Executive Benefits","NQDCs","Bank Executive Wealth"],
    aumMin:500000, aumDisplay:"$500K minimum", yearsExp:22,
    bio:"William focuses on the unique financial planning needs of banking and financial services executives — professionals who often have significant wealth tied up in employer stock, deferred compensation plans, and complex benefits packages. His deep understanding of regulatory environments for financial professionals sets him apart.",
    approach:"Banking executives face unique conflicts others don't. From FINRA compliance to deferred comp timing, the details matter enormously.",
    education:"BA Finance, Duke University · MBA, UNC Kenan-Flagler",
    clientFocus:"Bank executives, C-suite leaders in financial services, Fortune 500 senior management",
    rating:4.8, reviews:33, languages:["English"],
    awards:["Charlotte Business Journal Top Advisor 2022–2023","IMCA Member of Distinction"],
    fee:"1% AUM / Retainer hybrid",
  },
];

/* ── Match Me Quiz data ───────────────────────────────────────────── */
const MATCH_QUIZ = [
  {
    id: "challenge",
    question: "What's your primary financial challenge right now?",
    subtitle: "Select the situation that best describes where you need the most guidance.",
    options: [
      { value:"equity",           label:"Equity Compensation & RSUs/ISOs",         sub:"Managing vesting, taxes, and diversification from employer stock" },
      { value:"exit",             label:"Business Exit / Succession Planning",      sub:"Preparing to sell a business or transition ownership" },
      { value:"concentrated",     label:"Concentrated Stock Position",              sub:"Large single-stock position creating risk and tax complexity" },
      { value:"retirement_income",label:"Retirement Income Planning",               sub:"Sequencing withdrawals, Social Security timing, and RMDs" },
      { value:"estate",           label:"Estate Planning & Wealth Transfer",        sub:"Trusts, gifting strategies, reducing estate taxes, legacy goals" },
      { value:"tax",              label:"Tax Reduction & Optimization",             sub:"Minimizing taxes across all income sources and account types" },
      { value:"transition",       label:"Major Life Transition",                    sub:"Divorce, inheritance, death of spouse, or career change" },
      { value:"wealth_building",  label:"Building Wealth from Scratch",             sub:"First-generation wealth, debt management, investment foundation" },
    ],
  },
  {
    id: "tax_complexity",
    question: "What best describes your tax situation?",
    subtitle: "Your tax profile determines which advisor's expertise matters most.",
    options: [
      { value:"w2",          label:"Standard W-2 Income",                      sub:"Salary and bonus — relatively straightforward filing" },
      { value:"equity_amt",  label:"Equity Comp with AMT Exposure",            sub:"ISOs, RSUs, NQSOs — complex equity taxation" },
      { value:"selfemployed",label:"Self-Employed / S-Corp Owner",             sub:"Business income, pass-through entity, estimated taxes" },
      { value:"complex",     label:"Complex: K-1s, Crypto, or Real Estate",   sub:"Passive income, digital assets, depreciation strategies" },
      { value:"rmds",        label:"Managing RMDs & Retirement Distributions", sub:"Age 73+, required minimum distributions, IRMAA planning" },
    ],
  },
  {
    id: "philosophy",
    question: "What investment approach resonates most with you?",
    subtitle: "Matching your philosophy to your advisor's avoids constant friction over strategy.",
    options: [
      { value:"passive",       label:"Evidence-Based / Passive Investing",  sub:"Low-cost index funds, factor tilts, tax-efficient, minimal trading" },
      { value:"active",        label:"Active / Fundamental Research",        sub:"Individual security selection, manager-driven alpha" },
      { value:"alternatives",  label:"Alternatives & Private Markets",       sub:"Private equity, real assets, hedge funds, direct investments" },
      { value:"esg",           label:"ESG / Values-Aligned Investing",       sub:"Environmental, social, and governance criteria matter to me" },
      { value:"no_preference", label:"No Strong Preference",                 sub:"Open to my advisor's evidence-based recommendation" },
    ],
  },
  {
    id: "non_invest_concern",
    question: "Beyond investments, which planning area is most urgent?",
    subtitle: "Great advisors plan far beyond portfolio management.",
    options: [
      { value:"estate_trust",       label:"Estate & Trust Structure",         sub:"Wills, trusts, beneficiary designations, transfer planning" },
      { value:"business_succession",label:"Business Succession",              sub:"Buy-sell agreements, exit planning, key-person risk" },
      { value:"insurance",          label:"Insurance & Risk Management",      sub:"Life, disability, long-term care, umbrella coverage gaps" },
      { value:"ss_medicare",        label:"Social Security & Medicare Timing",sub:"Optimizing benefits and avoiding IRMAA surcharges" },
      { value:"charitable",         label:"Charitable Giving & Legacy",       sub:"Donor-advised funds, CRTs, foundation, and impact planning" },
      { value:"education",          label:"Education Funding",                sub:"529 plans, UGMA/UTMA, financial aid optimization" },
    ],
  },
  {
    id: "asset_level",
    question: "What is your approximate investable asset level?",
    subtitle: "This helps match you to advisors whose minimums and expertise fit your stage.",
    options: [
      { value:250000,   label:"Under $250K",      sub:"Building wealth — early accumulation phase" },
      { value:750000,   label:"$250K – $750K",    sub:"Mid-accumulation, growing complexity" },
      { value:2000000,  label:"$750K – $2M",      sub:"Significant wealth, tax planning becomes critical" },
      { value:5000000,  label:"$2M – $5M",        sub:"High net worth, multi-faceted planning required" },
      { value:10000000, label:"$5M+",             sub:"Ultra-high net worth — family office territory" },
    ],
  },
  {
    id: "credential",
    question: "Which professional credential matters most to you?",
    subtitle: "Each designation signals a distinct depth of expertise.",
    options: [
      { value:"CFP®", label:"CFP® — Certified Financial Planner", sub:"Comprehensive financial planning across all disciplines" },
      { value:"CFA",  label:"CFA — Chartered Financial Analyst",  sub:"Investment management and portfolio theory depth" },
      { value:"CPA",  label:"CPA / PFS — Tax Planning Focus",     sub:"Integrated tax strategy and financial planning" },
      { value:"JD",   label:"JD — Legal / Estate Planning Focus", sub:"Attorney credentials for estate or business law" },
      { value:"none", label:"No Strong Preference",               sub:"Trust the match algorithm to find the right fit" },
    ],
  },
];

/* ── Advisor specialty tags for quiz scoring ─────────────────────── */
const ADVISOR_TAGS = {
  1:  { challenges:["equity","tax"],              taxProfiles:["equity_amt","w2"],            philosophy:["passive","no_preference"],        concerns:["estate_trust","business_succession"] },
  2:  { challenges:["retirement_income","concentrated"], taxProfiles:["w2","equity_amt"],     philosophy:["passive","alternatives"],          concerns:["estate_trust","ss_medicare"] },
  3:  { challenges:["estate","transition"],       taxProfiles:["complex","w2"],               philosophy:["no_preference","passive"],         concerns:["estate_trust","business_succession","charitable"] },
  4:  { challenges:["estate","tax","concentrated"],taxProfiles:["complex","w2"],             philosophy:["alternatives","passive"],           concerns:["estate_trust","charitable","business_succession"] },
  5:  { challenges:["exit","tax"],                taxProfiles:["selfemployed","complex"],     philosophy:["passive","no_preference"],         concerns:["business_succession","insurance","estate_trust"] },
  6:  { challenges:["wealth_building","concentrated"],taxProfiles:["w2","complex"],          philosophy:["esg","passive","alternatives"],     concerns:["charitable","estate_trust"] },
  7:  { challenges:["retirement_income","transition"],taxProfiles:["rmds","w2"],             philosophy:["passive","no_preference"],         concerns:["ss_medicare","insurance","estate_trust"] },
  8:  { challenges:["wealth_building","transition"],taxProfiles:["w2","selfemployed"],       philosophy:["passive","no_preference"],         concerns:["insurance","education","estate_trust"] },
  9:  { challenges:["concentrated","equity"],     taxProfiles:["equity_amt","complex"],       philosophy:["passive","no_preference"],         concerns:["charitable","estate_trust"] },
  10: { challenges:["tax","wealth_building"],     taxProfiles:["complex","selfemployed","rmds"],philosophy:["passive","no_preference"],      concerns:["estate_trust","charitable"] },
  11: { challenges:["transition","wealth_building"],taxProfiles:["w2","complex"],            philosophy:["passive","no_preference"],         concerns:["insurance","education","estate_trust"] },
  12: { challenges:["equity","tax"],              taxProfiles:["equity_amt","w2"],            philosophy:["passive","no_preference"],         concerns:["estate_trust","business_succession"] },
};

/* ── Per-advisor deep questions ──────────────────────────────────── */
const ADVISOR_QUESTIONS = {
  1: [
    "Given my ISO grants, how do you model the AMT crossover point to determine the optimal exercise quantity in a given tax year?",
    "What is the difference between a sell-to-cover RSU strategy versus a 10b5-1 plan for systematic diversification — and which applies to my situation?",
    "How do you structure a tax-efficient glide path from a heavily concentrated employer stock position into a diversified portfolio over 3–5 years?",
    "My company offers a Mega Backdoor Roth. How does that interact with my equity compensation and overall tax plan?",
    "If I leave my employer pre-IPO with vested ISOs, what is the 90-day exercise deadline risk and how do we quantify the after-tax cost of early exercise?",
  ],
  2: [
    "How do you construct a factor-tilted portfolio to capture the size and value premiums without introducing unnecessary tax drag for a taxable account?",
    "What is the sequence-of-returns risk specific to our asset level and time horizon — and how do you model it across Monte Carlo simulations?",
    "At what point do alternatives (private equity, infrastructure, real assets) justify the illiquidity premium for a private client versus an endowment?",
    "How does direct indexing compare to traditional index investing for tax-loss harvesting efficiency at our asset level?",
    "How do you stress-test a retirement portfolio against the worst historical drawdown sequences — for example, a 2000–2010 lost-decade scenario?",
  ],
  3: [
    "With the estate tax exemption scheduled to sunset to approximately $7M per person in 2026, what specific steps should we take before year-end to lock in the current exclusion?",
    "How does an intentionally defective grantor trust (IDGT) allow me to transfer appreciating assets to my heirs while removing them from my taxable estate?",
    "What is a Grantor Retained Annuity Trust (GRAT) and under what interest rate environment does it most effectively transfer appreciation to the next generation?",
    "In a business succession where some children are active in the business and others are not, how do you structure a transfer that is both equitable and tax-efficient?",
    "What is the qualified small business stock (QSBS) exclusion under Section 1202, and how does it affect my exit strategy if I hold C-Corp shares?",
  ],
  4: [
    "For a portfolio above $10M, how do you structure the family governance framework and investment policy statement to survive a generational transfer intact?",
    "How do you access institutional co-investment opportunities in private equity, and what due diligence process do you apply to direct deal flow?",
    "What dynasty trust structure works best for removing assets from the estate tax system across multiple generations without triggering generation-skipping transfer tax?",
    "How do you coordinate a multi-entity tax return — trust, LLC, holding company, and personal return — to optimize the consolidated picture?",
    "If we receive a $20M+ liquidity event from a business sale, what is the week-by-week playbook from closing day through the first 12 months of portfolio construction?",
  ],
  5: [
    "What is the after-tax difference between an asset sale and a stock sale in my business exit — and which structure does my buyer prefer and why?",
    "At my current EBITDA, would a Cash Balance Plan allow me to shelter significantly more income than a Solo 401(k) alone, and how do you model the break-even?",
    "How do I structure an installment sale to spread capital gains recognition from the business exit across multiple tax years without triggering OID issues?",
    "What role does a Qualified Opportunity Zone fund play as a capital gains deferral vehicle when reinvesting proceeds from my business sale?",
    "How should a buy-sell agreement be funded — life insurance, cross-purchase, or entity-redemption — given my partner structure, estate size, and age difference?",
  ],
  6: [
    "How do you integrate ESG screens into a factor-based portfolio without significantly degrading value or profitability factor exposure?",
    "What peer-reviewed evidence supports your specific factor tilts, and how do you distinguish genuine risk factors from data-mined anomalies that don't hold out-of-sample?",
    "At what asset level do the fees, complexity, and manager-selection risk of alternatives begin to be justified by improved risk-adjusted returns for a private client?",
    "How do you measure impact in an ESG portfolio, and what reporting standards do you use — SASB, GRI, or proprietary metrics?",
    "How does your approach compare to the Yale Endowment model, and which elements of an endowment allocation are transferable to a private client portfolio?",
  ],
  7: [
    "What is the break-even age for delaying Social Security to 70 versus claiming at 62, adjusted for my health history, existing assets, and survivor benefit picture?",
    "How do you build a 'retirement income floor' using Social Security, a possible annuity, and fixed income to cover essential expenses without stock market dependency?",
    "What is the optimal Roth conversion ladder in the window between my retirement date and age 73 to reduce the lifetime tax burden of my RMDs?",
    "How does Medicare IRMAA work, and how do we manage income in the 2-year look-back window to avoid the surcharges throughout retirement?",
    "If I am widowed, how does my Social Security benefit change — and what survivor benefit elections should my spouse and I make now to maximize our combined lifetime benefit?",
  ],
  8: [
    "What is the optimal student loan repayment strategy for my loan type and income level — income-driven repayment, PSLF, refinancing, or aggressive payoff?",
    "At what monthly savings rate and investment allocation does a 20-year wealth-building plan realistically reach $1M+, net of inflation?",
    "How do I execute a Backdoor Roth IRA contribution correctly and avoid the pro-rata rule given my existing traditional IRA balance?",
    "At what income level does investing in a taxable brokerage account make more sense than making additional after-tax 401(k) contributions?",
    "How do I structure my insurance coverage — term life, own-occupation disability, and umbrella liability — to protect my earning power as my net worth grows?",
  ],
  9: [
    "What is the actual after-tax cost of liquidating my entire concentrated position all at once versus a systematic 5-year diversification plan — including state taxes?",
    "How does a 10b5-1 trading plan work for a corporate insider, and what are the new SEC Rule 10b5-1 plan requirements after the 2023 amendments?",
    "If I have pre-IPO ISOs with a $0.001 strike and a $50 409A valuation, when is the right time to exercise — and what is the precise AMT cost calculation?",
    "How do exchange funds work as a tax-deferred alternative to an outright sale for diversifying a concentrated single-stock position?",
    "What is the most tax-efficient structure for donating highly appreciated shares — direct charitable gift, donor-advised fund, or charitable remainder trust — given my income and giving goals?",
  ],
  10: [
    "What is the precise Roth conversion amount that minimizes my lifetime tax burden, given my current bracket, projected RMDs at 73, and state tax situation?",
    "How do I structure real estate holdings across an LLC, a self-directed Solo 401(k), and my personal return to maximize depreciation while maintaining liability protection?",
    "What specific crypto tax optimization strategies — HIFO lot identification, tax-loss harvesting, wash sale avoidance — apply to my portfolio size?",
    "How do I qualify as a Real Estate Professional under IRC Section 469, and what level of documentation and time-tracking is required to withstand an audit?",
    "What are the mechanics of a cost segregation study, and at what property value does the cost of the study justify the accelerated depreciation benefit?",
  ],
  11: [
    "How do I correctly report foreign bank accounts under FBAR and FATCA, and what are the penalty structures for prior-year non-compliance?",
    "As a Green Card holder, what happens to my US assets if I die before becoming a citizen — does the estate tax unlimited marital deduction apply?",
    "How do I structure international wire transfers and remittances to family abroad in a way that is both tax-compliant and cost-efficient?",
    "If I hold investment accounts in my home country in addition to the US, how does the foreign tax credit prevent double taxation — and are there treaty provisions that help?",
    "If I eventually split residency between countries or return home, what are the US expatriation tax implications and how do we plan for that scenario now?",
  ],
  12: [
    "How do I optimize my NQDC plan elections — deferral percentage, contribution timing, investment options, and distribution schedule — given my projected retirement income and tax bracket?",
    "What is the counterparty risk of my non-qualified deferred compensation plan and how do I protect my deferred balance from the risk of employer insolvency?",
    "How do the IRC Section 409A regulations govern my distribution election timing, and what happens to my deferrals in a change-of-control or merger event?",
    "As a regulated financial professional, how do FINRA holding period requirements and pre-clearance rules affect my ability to actively manage my personal brokerage account?",
    "How do I manage total employer concentration risk across my 401(k), NQDC plan, RSU grants, and deferred bonus — and at what threshold does the concentration become dangerous?",
  ],
};

/* ── Quiz scoring function ───────────────────────────────────────── */
function scoreAdvisors(answers) {
  return ADVISORS.map(a => {
    const tags = ADVISOR_TAGS[a.id] || {};
    let score = 0;
    const reasons = [];

    // Q1: Primary challenge (3 pts)
    if (answers.challenge && tags.challenges?.includes(answers.challenge)) {
      score += 3;
      reasons.push("Strong specialty alignment with your primary financial challenge");
    }

    // Q2: Tax complexity (2 pts)
    if (answers.tax_complexity && tags.taxProfiles?.includes(answers.tax_complexity)) {
      score += 2;
      reasons.push("Experienced with your specific tax complexity");
    }

    // Q3: Investment philosophy (1 pt)
    if (answers.philosophy && tags.philosophy?.includes(answers.philosophy)) {
      score += 1;
      reasons.push("Investment philosophy closely aligns with your preferences");
    }

    // Q4: Non-investment planning concern (2 pts)
    if (answers.non_invest_concern && tags.concerns?.includes(answers.non_invest_concern)) {
      score += 2;
      reasons.push("Specializes in your most urgent non-investment planning area");
    }

    // Q5: Asset level — advisor minimum must be at or under selected threshold (2 pts)
    if (answers.asset_level != null && a.aumMin <= answers.asset_level) {
      score += 2;
      reasons.push("Works with clients at your asset level");
    }

    // Q6: Credential preference (2 pts)
    if (answers.credential) {
      if (answers.credential === "none") {
        score += 1;
        reasons.push("Holds recognized professional designations");
      } else if (answers.credential === "CPA" && a.credentials.some(c => c === "CPA" || c.includes("PFS"))) {
        score += 2;
        reasons.push("Holds the CPA/PFS designation you prioritized");
      } else if (a.credentials.some(c => c.startsWith(answers.credential.replace("®","")))) {
        score += 2;
        reasons.push(`Holds the ${answers.credential} designation you prioritized`);
      }
    }

    const maxScore = 12;
    const pct = Math.round((score / maxScore) * 100);
    return { ...a, matchScore: score, matchPct: pct, matchReasons: reasons };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

/* ── Preparation checklist ────────────────────────────────────────── */
const PREP_SECTIONS = [
  {
    id:"docs", label:"Documents to Gather", icon:FileText, color:GOLD,
    items:[
      "Last 2 years of federal & state tax returns",
      "Most recent pay stubs (both spouses if applicable)",
      "Social Security statements (ssa.gov)",
      "All investment account statements (401k, IRA, brokerage)",
      "Bank account statements (last 3 months)",
      "Life insurance policy documents (coverage & beneficiaries)",
      "Most recent mortgage statement",
      "Any pension or defined benefit plan documents",
      "Estate documents: will, trust, POA (if you have them)",
      "Business financials if self-employed (P&L, balance sheet)",
    ],
  },
  {
    id:"goals", label:"Know Your Goals", icon:Star, color:BLUE,
    items:[
      "Write down your top 3 financial goals in plain language",
      "Know your target retirement age (or range)",
      "Estimate the monthly income you'll need in retirement",
      "Think about major expenses in the next 5 years (college, home, travel)",
      "Consider your legacy goals — what do you want to leave behind?",
    ],
  },
  {
    id:"numbers", label:"Know Your Numbers", icon:DollarSign, color:GREEN,
    items:[
      "Total annual household income (gross)",
      "Monthly take-home pay (net)",
      "Monthly total expenses (rough estimate is fine)",
      "Total debt (mortgage + car + student loans + credit cards)",
      "Total investable assets (rough total)",
      "Monthly savings amount",
    ],
  },
  {
    id:"questions", label:"Professional Questions to Ask", icon:BookOpen, color:"#a855f7",
    items:[
      "Are you a fiduciary 100% of the time — not just sometimes?",
      "Exactly how are you compensated — fee-only, fee-based, or commission?",
      "What is your specific investment philosophy and how has it performed in bear markets?",
      "How do you handle equity compensation (RSUs, ISOs, NQSOs) from a tax and planning perspective?",
      "What is your experience with business exit planning and post-liquidity wealth strategies?",
      "How do you coordinate with my CPA and estate attorney — and do you have preferred partners?",
      "What would you do differently for my specific tax situation compared to a standard client?",
      "What's your approach to Roth conversions given my projected retirement income and RMDs?",
      "How do you stress-test a retirement plan against sequence-of-returns risk?",
      "Do you have experience with concentrated stock positions and tax-efficient diversification?",
      "With the estate tax exemption potentially sunsetting in 2026, what planning steps should I take now?",
      "How do you model Social Security optimization — specifically the break-even between claiming early vs. delaying to 70?",
      "How often will you proactively contact me when markets shift or tax law changes — not just when I call you?",
      "Can you show me a sample financial plan for a client whose situation is similar to mine?",
    ],
  },
  {
    id:"mindset", label:"Mental Preparation", icon:Heart, color:RED,
    items:[
      "Be honest about your spending habits — advisors have seen everything",
      "Bring any financial stress or concerns to the surface",
      "Discuss your relationship with money (risk tolerance, past mistakes)",
      "Come with an open mind about changes that may be recommended",
      "Understand that good planning is a process, not a one-time event",
    ],
  },
];

/* ── Intake form sections ─────────────────────────────────────────── */
const FILING_STATUSES = ["Single","Married Filing Jointly","Married Filing Separately","Head of Household","Qualifying Widow(er)"];
const EMPLOYMENT_TYPES = ["W-2 Employee","Self-Employed / 1099","Business Owner","Retired","Not Currently Working","Other"];
const INSURANCE_TYPES = ["None","Term Life","Whole Life","Universal Life","Variable Life","Multiple Policies"];
const TRUST_TYPES = ["Revocable Living Trust","Irrevocable Trust","Special Needs Trust","Charitable Remainder Trust","Other"];
const PRIMARY_GOALS = ["Retire comfortably","College funding for children","Buy a home","Start or grow a business","Reduce taxes","Build generational wealth","Protect against the unexpected","Pay off debt","Charitable giving / legacy","Other"];

const blankIntake = () => ({
  // Personal
  firstName:"", lastName:"", dob:"", address:"", city:"", stateRes:"", zip:"",
  phone:"", email:"", maritalStatus:"Single", citizenStatus:"US Citizen",
  spouseName:"", spouseDob:"",
  children:[],
  // Employment
  employer:"", jobTitle:"", employmentType:"W-2 Employee", annualIncome:"",
  bonusPct:"", spouseIncome:"", businessOwner:"No", businessRevenue:"",
  retirementAge:"", hasPension:"No", pensionEstimate:"", ssEstimate:"", spouseSsEstimate:"",
  // Assets
  primaryHomeValue:"", otherRealEstate:"", k401Balance:"", iraBalance:"",
  rothBalance:"", brokerageBalance:"", stockOptions:"", bankSavings:"",
  businessValue:"", otherAssets:"",
  // Liabilities
  mortgageBalance:"", mortgagePayment:"", homeEquityLoan:"", carLoans:"",
  studentLoans:"", creditCardDebt:"", otherDebt:"",
  // Insurance
  lifeInsType:"None", lifeCoverage:"", lifePremium:"", hasDisability:"No",
  disabilityCoverage:"", hasLtc:"No", healthInsurance:"", hasUmbrella:"No",
  umbrellaCoverage:"",
  // Estate
  hasWill:"No", willUpdated:"", hasTrust:"No", trustType:"", trustee:"",
  hasPoa:"No", hasHealthDirective:"No", estateAttorney:"", beneficiariesReviewed:"No",
  // Goals
  primaryGoal:"Retire comfortably", targetRetireAge:"", retireIncomeGoal:"",
  collegeFunding:"No", numChildren:"", yearsUntilCollege:"", majorPurchases:"",
  charitableGoals:"", riskToleranceSelf:5,
  // Tax
  filingStatus:"Married Filing Jointly", estimatedBracket:"22%", taxState:"",
  cpaTaxAdvisor:"", recentTaxIssue:"No", amtConcern:"No", taxLossHarvest:"No",
  additionalNotes:"",
});

const TAX_BRACKETS = ["10%","12%","22%","24%","32%","35%","37%"];

/* ── Helper components ────────────────────────────────────────────── */
const fmt = (n) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:0,maximumFractionDigits:0}).format(n||0);

function SectionHeader({ children }) {
  return (
    <div style={{ fontSize:"0.5625rem",color:"var(--text-3)",letterSpacing:"0.12em",
      textTransform:"uppercase",fontWeight:700,marginBottom:6,marginTop:2 }}>
      {children}
    </div>
  );
}

function FormField({ label, value, onChange, type="text", placeholder="", options=null, half=false }) {
  const style = {
    display:"flex", flexDirection:"column", gap:3,
    gridColumn: half ? "span 1" : "span 2",
  };
  return (
    <div style={style}>
      <label style={{ fontSize:"0.5rem",color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.08em" }}>{label}</label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{ background:"var(--elevated)",border:"1px solid var(--border-c)",borderRadius:5,
            padding:"6px 9px",color:"var(--text-1)",fontSize:"0.75rem",outline:"none",cursor:"pointer" }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ background:"var(--elevated)",border:"1px solid var(--border-c)",borderRadius:5,
            padding:"6px 9px",color:"var(--text-1)",fontSize:"0.75rem",outline:"none" }} />
      )}
    </div>
  );
}

function IntakeSection({ title, icon: Icon, color, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ ...card, overflow:"hidden", marginBottom:"0.75rem" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width:"100%",background:"none",border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.875rem 1rem",textAlign:"left" }}>
        <div style={{ width:30,height:30,borderRadius:7,background:`${color}18`,
          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <Icon size={15} style={{ color }} />
        </div>
        <span style={{ fontSize:"0.75rem",fontWeight:700,color:"var(--text-1)",flex:1 }}>{title}</span>
        {open ? <ChevronUp size={14} color="var(--text-3)" /> : <ChevronDown size={14} color="var(--text-3)" />}
      </button>
      {open && (
        <div style={{ padding:"0 1rem 1rem",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.625rem" }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Advisor Card ─────────────────────────────────────────────────── */
function AdvisorCard({ advisor, onSelect }) {
  return (
    <div style={{ ...card, padding:"1.25rem", cursor:"pointer", transition:"border-color 0.15s" }}
      onClick={() => onSelect(advisor)}
      onMouseEnter={e => e.currentTarget.style.borderColor = GOLD}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-c)"}>
      {/* Header */}
      <div style={{ display:"flex",gap:"0.875rem",alignItems:"flex-start",marginBottom:"0.75rem" }}>
        <img src={advisor.photo} alt={advisor.name}
          style={{ width:56,height:56,borderRadius:"50%",objectFit:"cover",
            border:"2px solid var(--border-c)",flexShrink:0 }}
          onError={e => { e.target.style.display="none"; }} />
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:"0.8125rem",fontWeight:800,color:"var(--text-1)",lineHeight:1.2 }}>{advisor.name}</div>
          <div style={{ fontSize:"0.625rem",color:GOLD,marginTop:2 }}>{advisor.title}</div>
          <div style={{ fontSize:"0.625rem",color:"var(--text-3)",marginTop:1 }}>{advisor.firm}</div>
          <div style={{ display:"flex",alignItems:"center",gap:3,marginTop:3 }}>
            <MapPin size={9} color="var(--text-3)" />
            <span style={{ fontSize:"0.5625rem",color:"var(--text-3)" }}>{advisor.location}</span>
          </div>
        </div>
      </div>

      {/* Credentials */}
      <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:"0.625rem" }}>
        {advisor.credentials.map(c => (
          <span key={c} style={{ fontSize:"0.5rem",fontWeight:700,color:GOLD,
            background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.2)",
            borderRadius:4,padding:"2px 6px" }}>{c}</span>
        ))}
        <span style={{ fontSize:"0.5rem",color:"var(--text-3)",background:"var(--elevated)",
          border:"1px solid var(--border-c)",borderRadius:4,padding:"2px 6px" }}>{advisor.firmType}</span>
      </div>

      {/* Specialties */}
      <div style={{ display:"flex",flexWrap:"wrap",gap:3,marginBottom:"0.75rem" }}>
        {advisor.specialties.slice(0,3).map(s => (
          <span key={s} style={{ fontSize:"0.5rem",color:"var(--text-2)",background:"rgba(59,130,246,0.08)",
            border:"1px solid rgba(59,130,246,0.15)",borderRadius:3,padding:"2px 5px" }}>{s}</span>
        ))}
        {advisor.specialties.length > 3 && (
          <span style={{ fontSize:"0.5rem",color:"var(--text-3)" }}>+{advisor.specialties.length - 3} more</span>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
        paddingTop:"0.625rem",borderTop:"1px solid var(--border-c)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:3 }}>
          <Star size={10} color={GOLD} fill={GOLD} />
          <span style={{ fontSize:"0.625rem",fontWeight:700,color:GOLD }}>{advisor.rating}</span>
          <span style={{ fontSize:"0.5625rem",color:"var(--text-3)" }}>({advisor.reviews})</span>
        </div>
        <div style={{ fontSize:"0.5625rem",color:"var(--text-3)" }}>{advisor.aumDisplay}</div>
        <div style={{ fontSize:"0.5625rem",color:"var(--text-3)" }}>{advisor.yearsExp} yrs exp</div>
        <button style={{ fontSize:"0.5625rem",background:GOLD,color:"#07080a",border:"none",
          borderRadius:4,padding:"4px 10px",fontWeight:700,cursor:"pointer" }}>
          View Profile
        </button>
      </div>
    </div>
  );
}

/* ── Advisor Profile Panel ────────────────────────────────────────── */
function AdvisorProfile({ advisor, onClose }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"1rem" }}>
      {/* Back button */}
      <button onClick={onClose}
        style={{ display:"flex",alignItems:"center",gap:4,background:"none",border:"none",
          cursor:"pointer",color:"var(--text-3)",fontSize:"0.6875rem",padding:0,width:"fit-content" }}>
        <ChevronRight size={13} style={{ transform:"rotate(180deg)" }} />
        Back to Directory
      </button>

      {/* Hero card */}
      <div style={{ ...card, padding:"1.5rem" }}>
        <div style={{ display:"flex",gap:"1.25rem",alignItems:"flex-start",flexWrap:"wrap" }}>
          <img src={advisor.photo} alt={advisor.name}
            style={{ width:90,height:90,borderRadius:"50%",objectFit:"cover",
              border:`3px solid ${GOLD}`,flexShrink:0 }}
            onError={e => { e.target.style.display="none"; }} />
          <div style={{ flex:1,minWidth:200 }}>
            <div style={{ fontSize:"1.125rem",fontWeight:800,color:"var(--text-1)",marginBottom:2 }}>{advisor.name}</div>
            <div style={{ fontSize:"0.75rem",color:GOLD,marginBottom:2 }}>{advisor.title}</div>
            <div style={{ fontSize:"0.6875rem",color:"var(--text-2)",marginBottom:6 }}>{advisor.firm} · {advisor.firmType}</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:"0.75rem" }}>
              {advisor.credentials.map(c => (
                <span key={c} style={{ fontSize:"0.5625rem",fontWeight:700,color:GOLD,
                  background:"rgba(201,169,110,0.12)",border:"1px solid rgba(201,169,110,0.25)",
                  borderRadius:4,padding:"3px 8px" }}>{c}</span>
              ))}
            </div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:"0.875rem" }}>
              <div style={{ display:"flex",alignItems:"center",gap:4,fontSize:"0.625rem",color:"var(--text-3)" }}>
                <MapPin size={10} color="var(--text-3)" />{advisor.location}
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:4,fontSize:"0.625rem",color:"var(--text-3)" }}>
                <Clock size={10} color="var(--text-3)" />{advisor.yearsExp} years experience
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:4,fontSize:"0.625rem",color:GOLD }}>
                <Star size={10} color={GOLD} fill={GOLD} />{advisor.rating} ({advisor.reviews} reviews)
              </div>
            </div>
          </div>
          {/* Contact block */}
          <div style={{ display:"flex",flexDirection:"column",gap:"0.5rem",minWidth:180 }}>
            <div style={{ fontSize:"0.5rem",color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:2 }}>Contact</div>
            {[
              [Phone, advisor.phone],
              [Mail, advisor.email],
              [Globe, advisor.website],
            ].map(([Icon, val]) => (
              <div key={val} style={{ display:"flex",alignItems:"center",gap:6,fontSize:"0.625rem",color:"var(--text-2)" }}>
                <Icon size={10} color="var(--text-3)" />{val}
              </div>
            ))}
            <button style={{ marginTop:8,background:GOLD,color:"#07080a",border:"none",
              borderRadius:6,padding:"8px 16px",fontWeight:800,cursor:"pointer",fontSize:"0.75rem" }}>
              Connect with {advisor.name.split(" ")[0]}
            </button>
          </div>
        </div>
      </div>

      {/* Two-col layout */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem" }}>
        {/* Bio */}
        <div style={{ ...card, padding:"1rem", gridColumn:"span 2" }}>
          <div style={{ fontSize:"0.5625rem",color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.5rem" }}>About</div>
          <p style={{ fontSize:"0.75rem",color:"var(--text-2)",lineHeight:1.7,margin:0 }}>{advisor.bio}</p>
        </div>

        {/* Approach */}
        <div style={{ ...card, padding:"1rem" }}>
          <div style={{ fontSize:"0.5625rem",color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.5rem" }}>Planning Approach</div>
          <p style={{ fontSize:"0.6875rem",color:"var(--text-2)",lineHeight:1.7,margin:0,
            padding:"0.5rem 0.75rem",borderRadius:6,
            background:`${GOLD}0c`,border:`1px solid ${GOLD}28` }}>{advisor.approach}</p>
        </div>

        {/* Specialties */}
        <div style={{ ...card, padding:"1rem" }}>
          <div style={{ fontSize:"0.5625rem",color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.5rem" }}>Specialties</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
            {advisor.specialties.map(s => (
              <span key={s} style={{ fontSize:"0.5625rem",color:"var(--text-2)",background:"rgba(59,130,246,0.08)",
                border:"1px solid rgba(59,130,246,0.18)",borderRadius:4,padding:"3px 8px" }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Details */}
        <div style={{ ...card, padding:"1rem" }}>
          <div style={{ fontSize:"0.5625rem",color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.625rem" }}>Details</div>
          {[
            ["Client Focus", advisor.clientFocus],
            ["Education", advisor.education],
            ["Languages", advisor.languages.join(", ")],
            ["Minimum", advisor.aumDisplay],
            ["Fee Structure", advisor.fee],
          ].map(([l,v]) => (
            <div key={l} style={{ display:"flex",gap:8,marginBottom:6,alignItems:"flex-start" }}>
              <span style={{ fontSize:"0.5625rem",color:"var(--text-3)",minWidth:80,flexShrink:0 }}>{l}</span>
              <span style={{ fontSize:"0.5625rem",color:"var(--text-1)",fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Awards */}
        <div style={{ ...card, padding:"1rem" }}>
          <div style={{ fontSize:"0.5625rem",color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.625rem" }}>
            <Award size={10} style={{ display:"inline",marginRight:4 }} />Recognition
          </div>
          {advisor.awards.map((a,i) => (
            <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:6,marginBottom:5 }}>
              <Star size={9} color={GOLD} fill={GOLD} style={{ marginTop:2,flexShrink:0 }} />
              <span style={{ fontSize:"0.5625rem",color:"var(--text-2)" }}>{a}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What to Ask This Advisor */}
      {ADVISOR_QUESTIONS[advisor.id] && (
        <div style={{ ...card, padding:"1.25rem" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1rem" }}>
            <div style={{ width:32,height:32,borderRadius:8,background:"rgba(201,169,110,0.12)",
              border:"1px solid rgba(201,169,110,0.22)",
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <BookOpen size={15} color={GOLD} />
            </div>
            <div>
              <div style={{ fontSize:"0.75rem",fontWeight:800,color:"var(--text-1)" }}>
                What to Ask {advisor.name.split(" ")[0]}
              </div>
              <div style={{ fontSize:"0.5625rem",color:"var(--text-3)",marginTop:2 }}>
                Specialty-mapped questions at CFP/CFA professional depth — for your first meeting
              </div>
            </div>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:"0.5rem" }}>
            {ADVISOR_QUESTIONS[advisor.id].map((q, i) => (
              <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:"0.75rem",
                padding:"0.75rem",borderRadius:8,background:"var(--elevated)",
                border:"1px solid var(--border-c)" }}>
                <div style={{ width:22,height:22,borderRadius:6,background:"rgba(201,169,110,0.12)",
                  border:"1px solid rgba(201,169,110,0.22)",
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1 }}>
                  <span style={{ fontSize:"0.5rem",fontWeight:900,color:GOLD,fontFamily:"'JetBrains Mono',monospace" }}>{i + 1}</span>
                </div>
                <span style={{ fontSize:"0.6875rem",color:"var(--text-2)",lineHeight:1.7 }}>{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prep reminder */}
      <div style={{ background:"rgba(201,169,110,0.06)",border:"1px solid rgba(201,169,110,0.2)",
        borderRadius:8,padding:"1rem",display:"flex",gap:"0.75rem",alignItems:"center" }}>
        <FileText size={18} color={GOLD} style={{ flexShrink:0 }} />
        <div>
          <div style={{ fontSize:"0.6875rem",fontWeight:700,color:GOLD,marginBottom:2 }}>Ready to meet {advisor.name.split(" ")[0]}?</div>
          <div style={{ fontSize:"0.625rem",color:"var(--text-2)",lineHeight:1.6 }}>
            Head to the <strong>Preparation Hub</strong> tab to check off your document list and prep your questions.
            Then open <strong>My Advisory Folder</strong> to complete the intake form — your advisor will thank you.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Tab: Directory ───────────────────────────────────────────────── */
function TabDirectory() {
  const [search, setSearch]         = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [specFilter, setSpecFilter]   = useState("All");
  const [feeFilter, setFeeFilter]     = useState("All");
  const [selected, setSelected]       = useState(null);

  const states = ["All",...[...new Set(ADVISORS.map(a => a.state))].sort()];
  const specs  = ["All","Retirement","Tax Planning","Estate Planning","Business Owner","Tech Executives","First-Gen Wealth","ESG Investing","Concentrated Stock"];
  const fees   = ["All","Fee-Only","Flat Fee","AUM-Based","Retainer"];

  const filtered = useMemo(() => ADVISORS.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) || a.firm.toLowerCase().includes(q) ||
      a.specialties.some(s => s.toLowerCase().includes(q));
    const matchState = stateFilter === "All" || a.state === stateFilter;
    const matchSpec  = specFilter === "All" || a.specialties.some(s => s.includes(specFilter));
    const matchFee   = feeFilter  === "All" ||
      (feeFilter === "Fee-Only"   && a.firmType.includes("Fee-Only")) ||
      (feeFilter === "Flat Fee"   && a.fee.toLowerCase().includes("flat")) ||
      (feeFilter === "AUM-Based"  && a.fee.includes("AUM")) ||
      (feeFilter === "Retainer"   && a.fee.toLowerCase().includes("retainer"));
    return matchSearch && matchState && matchSpec && matchFee;
  }), [search, stateFilter, specFilter, feeFilter]);

  if (selected) return <AdvisorProfile advisor={selected} onClose={() => setSelected(null)} />;

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"1rem" }}>
      {/* Search + filters */}
      <div style={{ ...card, padding:"1rem" }}>
        <div style={{ position:"relative",marginBottom:"0.75rem" }}>
          <Search size={13} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"var(--text-3)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, location, firm, or specialty..."
            style={{ width:"100%",background:"var(--elevated)",border:"1px solid var(--border-c)",
              borderRadius:6,padding:"8px 10px 8px 30px",color:"var(--text-1)",
              fontSize:"0.75rem",outline:"none",boxSizing:"border-box" }} />
        </div>
        <div style={{ display:"flex",flexWrap:"wrap",gap:"0.625rem",alignItems:"center" }}>
          <span style={{ fontSize:"0.5625rem",color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.08em" }}>Filter:</span>
          {[
            ["State", stateFilter, setStateFilter, states],
            ["Specialty", specFilter, setSpecFilter, specs],
            ["Fee Type", feeFilter, setFeeFilter, fees],
          ].map(([label, val, setter, opts]) => (
            <select key={label} value={val} onChange={e => setter(e.target.value)}
              style={{ background:"var(--elevated)",border:"1px solid var(--border-c)",
                borderRadius:5,padding:"4px 8px",color:"var(--text-2)",fontSize:"0.625rem",
                outline:"none",cursor:"pointer" }}>
              {opts.map(o => <option key={o} value={o}>{label === "State" && o !== "All" ? o : (label !== "State" ? o : "All States")}</option>)}
            </select>
          ))}
          <span style={{ fontSize:"0.5625rem",color:"var(--text-3)",marginLeft:"auto" }}>
            {filtered.length} advisor{filtered.length !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.15)",
        borderRadius:8,padding:"0.75rem 1rem",fontSize:"0.6875rem",color:"var(--text-2)",lineHeight:1.6 }}>
        <strong style={{ color:BLUE }}>Demo Directory</strong> — These are illustrative advisor profiles.
        In the future this will connect to a live verified advisor network.
        All advisors shown are fiduciaries or fee-only planners.
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:"center",padding:"3rem",color:"var(--text-3)",fontSize:"0.75rem" }}>
          No advisors match your filters. Try adjusting your search.
        </div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:"0.875rem" }}>
          {filtered.map(a => <AdvisorCard key={a.id} advisor={a} onSelect={setSelected} />)}
        </div>
      )}
    </div>
  );
}

/* ── Tab: Match Me Quiz ───────────────────────────────────────────── */
function TabMatchMe() {
  const [step, setStep]                   = useState(0);
  const [answers, setAnswers]             = useState({});
  const [results, setResults]             = useState(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);

  const totalSteps = MATCH_QUIZ.length;

  const handleAnswer = (qid, value) => {
    const next = { ...answers, [qid]: value };
    setAnswers(next);
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setResults(scoreAdvisors(next));
      setStep(totalSteps + 1);
    }
  };

  const reset = () => { setStep(0); setAnswers({}); setResults(null); setSelectedAdvisor(null); };

  if (selectedAdvisor) {
    return <AdvisorProfile advisor={selectedAdvisor} onClose={() => setSelectedAdvisor(null)} />;
  }

  /* ── Intro ── */
  if (step === 0) {
    return (
      <div style={{ display:"flex",flexDirection:"column",gap:"1.25rem" }}>
        <div style={{ ...card, padding:"2rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute",top:-80,right:-60,width:300,height:300,
            background:"radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)",
            pointerEvents:"none" }} />
          <div style={{ width:56,height:56,borderRadius:14,background:"rgba(201,169,110,0.12)",
            border:"1px solid rgba(201,169,110,0.25)",
            display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.25rem",position:"relative" }}>
            <Sliders size={24} color={GOLD} />
          </div>
          <div style={{ fontSize:"1.3125rem",fontWeight:800,color:"var(--text-1)",marginBottom:"0.5rem",
            fontFamily:"'Playfair Display', Georgia, serif" }}>
            Find Your Advisor Match
          </div>
          <p style={{ fontSize:"0.8125rem",color:"var(--text-2)",lineHeight:1.75,maxWidth:520,margin:"0 auto 1.25rem" }}>
            Answer 6 questions about your financial situation. We'll analyze your responses against each
            advisor's specialty profile and rank your top matches — with specific reasons why they fit your needs.
          </p>
          <div style={{ display:"flex",justifyContent:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1.5rem" }}>
            {["6 Questions","~3 Minutes","Ranked Results","Explained Matches"].map(b => (
              <span key={b} style={{ fontSize:"0.625rem",fontWeight:700,color:GOLD,
                background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.2)",
                borderRadius:99,padding:"3px 10px" }}>{b}</span>
            ))}
          </div>
          <button onClick={() => setStep(1)}
            style={{ background:GOLD,color:"#07080a",border:"none",borderRadius:8,
              padding:"12px 28px",fontWeight:800,fontSize:"0.875rem",cursor:"pointer" }}>
            Start the Match Quiz →
          </button>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"0.75rem" }}>
          {[
            { title:"CFP/CFA-Level Precision",
              body:"Questions built around real scenarios that distinguish great advisors — equity comp, business exits, concentrated stock, estate planning, and tax complexity." },
            { title:"Ranked & Explained",
              body:"Your top 3 matches are presented with specific reasons for each recommendation, not just a score. Understand why a match is right for you." },
            { title:"Specialty-Mapped Scoring",
              body:"Every advisor profile is tagged across specialty dimensions. Your answers score directly against each dimension for precise ranking." },
          ].map(({ title, body }) => (
            <div key={title} style={{ ...card, padding:"1rem" }}>
              <div style={{ width:"100%",height:2,background:GOLD,borderRadius:99,marginBottom:"0.75rem" }} />
              <div style={{ fontSize:"0.6875rem",fontWeight:700,color:"var(--text-1)",marginBottom:"0.375rem" }}>{title}</div>
              <p style={{ fontSize:"0.625rem",color:"var(--text-3)",lineHeight:1.7,margin:0 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Results ── */
  if (step === totalSteps + 1 && results) {
    const top3 = results.slice(0, 3);
    const rest = results.slice(3);
    return (
      <div style={{ display:"flex",flexDirection:"column",gap:"1.25rem" }}>
        <div style={{ ...card, padding:"1rem" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:"0.875rem",fontWeight:800,color:"var(--text-1)" }}>Your Advisor Matches</div>
              <div style={{ fontSize:"0.5625rem",color:"var(--text-3)",marginTop:2 }}>
                Ranked by specialty fit, credential match, and asset level alignment
              </div>
            </div>
            <button onClick={reset}
              style={{ background:"transparent",border:"1px solid var(--border-c)",borderRadius:6,
                padding:"6px 12px",color:"var(--text-3)",fontSize:"0.625rem",cursor:"pointer" }}>
              Retake Quiz
            </button>
          </div>
        </div>

        <div style={{ fontSize:"0.5rem",color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:700 }}>
          Top Matches
        </div>

        {top3.map((a, idx) => (
          <div key={a.id} style={{ ...card, padding:"1.25rem", position:"relative", overflow:"hidden",
            border: idx === 0 ? "1px solid rgba(201,169,110,0.42)" : "1px solid var(--border-c)" }}>
            {idx === 0 && (
              <div style={{ position:"absolute",top:12,right:12,fontSize:"0.4375rem",fontWeight:800,
                color:"#07080a",background:GOLD,borderRadius:4,padding:"3px 8px",letterSpacing:"0.1em" }}>
                BEST MATCH
              </div>
            )}
            <div style={{ display:"flex",gap:"0.875rem",alignItems:"flex-start",marginBottom:"0.875rem" }}>
              <img src={a.photo} alt={a.name}
                style={{ width:52,height:52,borderRadius:"50%",objectFit:"cover",flexShrink:0,
                  border:`2px solid ${idx === 0 ? GOLD : "var(--border-c)"}` }}
                onError={e => { e.target.style.display="none"; }} />
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:"0.8125rem",fontWeight:800,color:"var(--text-1)" }}>{a.name}</div>
                <div style={{ fontSize:"0.625rem",color:GOLD,marginTop:1 }}>{a.title}</div>
                <div style={{ fontSize:"0.5625rem",color:"var(--text-3)" }}>{a.firm}</div>
              </div>
              <div style={{ textAlign:"right",flexShrink:0 }}>
                <div style={{ fontSize:"1.625rem",fontWeight:900,lineHeight:1,
                  fontFamily:"'JetBrains Mono','Courier New',monospace",
                  color: idx === 0 ? GOLD : "var(--text-2)" }}>{a.matchPct}%</div>
                <div style={{ fontSize:"0.4375rem",color:"var(--text-3)",marginTop:2 }}>match score</div>
              </div>
            </div>

            {/* Score bar */}
            <div style={{ background:"var(--elevated)",borderRadius:99,height:4,overflow:"hidden",marginBottom:"0.75rem" }}>
              <div style={{ height:"100%",borderRadius:99,
                background: idx === 0 ? GOLD : "rgba(201,169,110,0.45)",
                width:`${a.matchPct}%` }} />
            </div>

            {/* Reasons */}
            {a.matchReasons.length > 0 && (
              <div style={{ display:"flex",flexDirection:"column",gap:5,marginBottom:"0.875rem" }}>
                {a.matchReasons.map((r, i) => (
                  <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:6 }}>
                    <CheckCircle size={11} color={idx === 0 ? GOLD : GREEN} style={{ marginTop:1,flexShrink:0 }} />
                    <span style={{ fontSize:"0.625rem",color:"var(--text-2)",lineHeight:1.55 }}>{r}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
              paddingTop:"0.75rem",borderTop:"1px solid var(--border-c)" }}>
              <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
                {a.credentials.map(c => (
                  <span key={c} style={{ fontSize:"0.5rem",fontWeight:700,color:GOLD,
                    background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.2)",
                    borderRadius:4,padding:"2px 6px" }}>{c}</span>
                ))}
                <span style={{ fontSize:"0.5rem",color:"var(--text-3)",background:"var(--elevated)",
                  border:"1px solid var(--border-c)",borderRadius:4,padding:"2px 6px" }}>{a.aumDisplay}</span>
              </div>
              <button onClick={() => setSelectedAdvisor(a)}
                style={{ background: idx === 0 ? GOLD : "transparent",
                  color: idx === 0 ? "#07080a" : GOLD,
                  border: idx === 0 ? "none" : `1px solid ${GOLD}`,
                  borderRadius:6,padding:"7px 14px",fontWeight:700,cursor:"pointer",fontSize:"0.625rem" }}>
                View Full Profile →
              </button>
            </div>
          </div>
        ))}

        {rest.length > 0 && (
          <>
            <div style={{ fontSize:"0.5rem",color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:700,marginTop:4 }}>
              All Other Advisors
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"0.625rem" }}>
              {rest.map(a => (
                <div key={a.id}
                  style={{ ...card, padding:"0.875rem",display:"flex",alignItems:"center",gap:"0.75rem",
                    cursor:"pointer",transition:"border-color 0.15s" }}
                  onClick={() => setSelectedAdvisor(a)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = GOLD}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-c)"}>
                  <img src={a.photo} alt={a.name}
                    style={{ width:36,height:36,borderRadius:"50%",objectFit:"cover",
                      border:"1px solid var(--border-c)",flexShrink:0 }}
                    onError={e => { e.target.style.display="none"; }} />
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:"0.6875rem",fontWeight:700,color:"var(--text-1)" }}>{a.name}</div>
                    <div style={{ fontSize:"0.5rem",color:"var(--text-3)" }}>{a.firm}</div>
                  </div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"0.875rem",
                    fontWeight:800,color:"var(--text-3)" }}>{a.matchPct}%</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  /* ── Question steps ── */
  const q = MATCH_QUIZ[step - 1];
  const progress = (step / totalSteps) * 100;

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"1rem" }}>
      {/* Progress bar */}
      <div style={{ ...card, padding:"1rem" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.5rem" }}>
          <div style={{ fontSize:"0.5rem",color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:600 }}>
            Question {step} of {totalSteps}
          </div>
          <button onClick={reset}
            style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-3)",fontSize:"0.5625rem" }}>
            Start Over
          </button>
        </div>
        <div style={{ background:"var(--elevated)",borderRadius:99,height:4,overflow:"hidden" }}>
          <div style={{ height:"100%",borderRadius:99,background:GOLD,width:`${progress}%`,transition:"width 0.3s" }} />
        </div>
      </div>

      {/* Question card */}
      <div style={{ ...card, padding:"1.5rem" }}>
        <div style={{ fontSize:"1rem",fontWeight:800,color:"var(--text-1)",marginBottom:"0.375rem",lineHeight:1.4 }}>
          {q.question}
        </div>
        <div style={{ fontSize:"0.6875rem",color:"var(--text-3)",marginBottom:"1.25rem",lineHeight:1.65 }}>
          {q.subtitle}
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:"0.5rem" }}>
          {q.options.map(opt => (
            <button key={opt.value} onClick={() => handleAnswer(q.id, opt.value)}
              style={{ display:"flex",alignItems:"center",gap:"0.875rem",
                background:"var(--elevated)",border:"1px solid var(--border-c)",borderRadius:8,
                padding:"0.875rem 1rem",cursor:"pointer",transition:"all 0.15s",
                textAlign:"left",width:"100%" }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = GOLD;
                e.currentTarget.style.background = "rgba(201,169,110,0.06)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border-c)";
                e.currentTarget.style.background = "var(--elevated)";
              }}>
              <div style={{ width:10,height:10,borderRadius:"50%",border:`2px solid ${GOLD}`,flexShrink:0 }} />
              <div>
                <div style={{ fontSize:"0.75rem",fontWeight:700,color:"var(--text-1)" }}>{opt.label}</div>
                {opt.sub && <div style={{ fontSize:"0.5625rem",color:"var(--text-3)",marginTop:2,lineHeight:1.5 }}>{opt.sub}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {step > 1 && (
        <button onClick={() => setStep(step - 1)}
          style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-3)",
            fontSize:"0.625rem",display:"flex",alignItems:"center",gap:4,padding:0,width:"fit-content" }}>
          <ChevronRight size={12} style={{ transform:"rotate(180deg)" }} />
          Back to previous question
        </button>
      )}
    </div>
  );
}

/* ── Tab: Preparation Hub ─────────────────────────────────────────── */
function TabPrepHub() {
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wc_prep_checked") || "{}"); }
    catch { return {}; }
  });

  const toggle = (sectionId, idx) => {
    const key = `${sectionId}_${idx}`;
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    localStorage.setItem("wc_prep_checked", JSON.stringify(next));
  };

  const totalItems = PREP_SECTIONS.reduce((s,p) => s + p.items.length, 0);
  const totalChecked = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((totalChecked / totalItems) * 100);

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"1.25rem" }}>

      {/* Progress header */}
      <div style={{ ...card, padding:"1.25rem" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.625rem" }}>
          <div>
            <div style={{ fontSize:"0.875rem",fontWeight:800,color:"var(--text-1)" }}>Advisor Meeting Prep</div>
            <div style={{ fontSize:"0.625rem",color:"var(--text-3)",marginTop:2 }}>
              Complete this checklist before your first advisor meeting
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:"1.5rem",fontWeight:900,color:pct === 100 ? GREEN : GOLD }}>{pct}%</div>
            <div style={{ fontSize:"0.5625rem",color:"var(--text-3)" }}>{totalChecked}/{totalItems} complete</div>
          </div>
        </div>
        <div style={{ background:"var(--elevated)",borderRadius:99,height:6,overflow:"hidden" }}>
          <div style={{ height:"100%",borderRadius:99,background: pct === 100 ? GREEN : GOLD,
            width:`${pct}%`,transition:"width 0.3s" }} />
        </div>
        {pct === 100 && (
          <div style={{ marginTop:"0.75rem",display:"flex",alignItems:"center",gap:6,
            color:GREEN,fontSize:"0.6875rem",fontWeight:700 }}>
            <CheckCircle size={14} />
            You're fully prepared. Time to meet your advisor!
          </div>
        )}
      </div>

      {/* Checklist sections */}
      {PREP_SECTIONS.map(section => {
        const SIcon = section.icon;
        const sectionChecked = section.items.filter((_,i) => checked[`${section.id}_${i}`]).length;
        return (
          <div key={section.id} style={{ ...card, overflow:"hidden" }}>
            <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",
              padding:"0.875rem 1rem",borderBottom:"1px solid var(--border-c)" }}>
              <div style={{ width:32,height:32,borderRadius:8,flexShrink:0,
                background:`${section.color}15`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <SIcon size={15} style={{ color:section.color }} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"0.75rem",fontWeight:700,color:"var(--text-1)" }}>{section.label}</div>
                <div style={{ fontSize:"0.5625rem",color:"var(--text-3)",marginTop:1 }}>
                  {sectionChecked}/{section.items.length} completed
                </div>
              </div>
              <div style={{ width:36,height:36,borderRadius:"50%",
                background: sectionChecked === section.items.length ? `${GREEN}20` : "var(--elevated)",
                border:`2px solid ${sectionChecked === section.items.length ? GREEN : "var(--border-c)"}`,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <span style={{ fontSize:"0.625rem",fontWeight:800,
                  color: sectionChecked === section.items.length ? GREEN : "var(--text-3)" }}>
                  {sectionChecked}/{section.items.length}
                </span>
              </div>
            </div>
            <div style={{ padding:"0.625rem 1rem 0.875rem" }}>
              {section.items.map((item, idx) => {
                const key = `${section.id}_${idx}`;
                const done = !!checked[key];
                return (
                  <div key={idx} onClick={() => toggle(section.id, idx)}
                    style={{ display:"flex",alignItems:"flex-start",gap:"0.625rem",
                      padding:"0.5rem 0.375rem",cursor:"pointer",borderRadius:5,
                      transition:"background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--elevated)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <div style={{ width:18,height:18,borderRadius:4,flexShrink:0,marginTop:1,
                      background: done ? GREEN : "transparent",
                      border: `2px solid ${done ? GREEN : "var(--border-c)"}`,
                      display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s" }}>
                      {done && <Check size={11} color="#fff" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize:"0.6875rem",color: done ? "var(--text-3)" : "var(--text-2)",
                      textDecoration: done ? "line-through" : "none",lineHeight:1.5,
                      transition:"color 0.15s" }}>{item}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Education cards */}
      <div style={{ fontSize:"0.6875rem",fontWeight:700,color:"var(--text-1)",
        textTransform:"uppercase",letterSpacing:"0.08em",marginTop:4 }}>
        Know Before You Go
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"0.875rem" }}>
        {[
          { title:"What is a Fiduciary?", color:GREEN,
            body:"A fiduciary is legally required to act in YOUR best interest at all times — not their firm's, not their broker dealer's. Always ask: 'Are you a fiduciary 100% of the time?' Some advisors are only fiduciaries sometimes." },
          { title:"Fee-Only vs Fee-Based vs Commission", color:BLUE,
            body:"Fee-only advisors charge you directly (flat, hourly, or % of assets). Fee-based earn both fees AND commissions — a potential conflict. Commission-only advisors earn money by selling products. Fee-only is the gold standard for objectivity." },
          { title:"What CFP® Actually Means", color:GOLD,
            body:"A Certified Financial Planner has completed 6,000+ hours of experience, passed a rigorous board exam, follows a code of ethics, and completes continuing education. Not every financial 'advisor' has any certification at all." },
          { title:"Red Flags to Watch For", color:RED,
            body:"Guaranteed returns promised · Pressure to act fast · They don't ask about your full financial picture · Vague answers about fees · They lead with product recommendations before asking about your goals. Trust your gut." },
        ].map(({ title, color, body }) => (
          <div key={title} style={{ ...card, padding:"1rem" }}>
            <div style={{ width:"100%",height:3,background:color,borderRadius:99,marginBottom:"0.75rem" }} />
            <div style={{ fontSize:"0.6875rem",fontWeight:700,color:"var(--text-1)",marginBottom:"0.5rem" }}>{title}</div>
            <p style={{ fontSize:"0.625rem",color:"var(--text-3)",lineHeight:1.7,margin:0 }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tab: My Advisory Folder ──────────────────────────────────────── */
function TabFolder() {
  const [intake, setIntake] = useState(() => {
    try { return { ...blankIntake(), ...JSON.parse(localStorage.getItem("wc_intake") || "{}") }; }
    catch { return blankIntake(); }
  });
  const [saved, setSaved] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);

  const set = (k, v) => setIntake(f => ({ ...f, [k]: v }));

  const save = () => {
    localStorage.setItem("wc_intake", JSON.stringify(intake));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const DOC_CATEGORIES = [
    { id:"tax",      label:"Tax Documents",         icon:FileText,  color:RED,    examples:["W-2s","1099s","Tax Returns","K-1s"] },
    { id:"invest",   label:"Investment Statements",  icon:Briefcase, color:BLUE,   examples:["401k","IRA","Brokerage","RSU Grants"] },
    { id:"estate",   label:"Estate & Trust",         icon:Shield,    color:GOLD,   examples:["Will","Trust Documents","POA","Healthcare Directive"] },
    { id:"real",     label:"Real Estate",            icon:Home,      color:GREEN,  examples:["Mortgage Statement","Deeds","Appraisals"] },
    { id:"insurance",label:"Insurance Policies",     icon:Heart,     color:"#a855f7", examples:["Life","Disability","LTC","Umbrella"] },
    { id:"other",    label:"Other Documents",        icon:FolderOpen,color:"var(--text-3)", examples:["Business Financials","Social Security","Pension","Other"] },
  ];

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"1.25rem" }}>

      {/* Document Vault */}
      <div style={{ ...card, padding:"1.25rem" }}>
        <div style={{ fontSize:"0.875rem",fontWeight:800,color:"var(--text-1)",marginBottom:6,
          textTransform:"uppercase",letterSpacing:"0.08em" }}>Document Vault</div>
        <div style={{ fontSize:"0.8125rem",color:"var(--text-3)",marginBottom:"1rem",lineHeight:1.6 }}>
          Organize your documents by category before meeting with your advisor.
          File upload coming soon — for now, use this as your preparation checklist.
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"0.875rem" }}>
          {DOC_CATEGORIES.map(cat => {
            const CIcon = cat.icon;
            return (
              <div key={cat.id}
                style={{ background:"var(--elevated)",border:`1px solid ${activeDoc===cat.id ? cat.color : "var(--border-c)"}`,
                  borderRadius:10,padding:"1.125rem",cursor:"pointer",transition:"border-color 0.15s" }}
                onClick={() => setActiveDoc(activeDoc === cat.id ? null : cat.id)}>
                <div style={{ display:"flex",alignItems:"center",gap:"0.625rem",marginBottom:"0.75rem" }}>
                  <div style={{ width:34,height:34,borderRadius:8,background:`${cat.color}18`,
                    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <CIcon size={16} style={{ color:cat.color }} />
                  </div>
                  <span style={{ fontSize:"0.875rem",fontWeight:700,color:"var(--text-1)" }}>{cat.label}</span>
                </div>
                {activeDoc === cat.id ? (
                  <div>
                    {cat.examples.map(ex => (
                      <div key={ex} style={{ fontSize:"0.8125rem",color:"var(--text-3)",
                        padding:"5px 0",borderBottom:"1px solid var(--border-c)" }}>
                        □ {ex}
                      </div>
                    ))}
                    <div style={{ marginTop:"0.625rem",fontSize:"0.75rem",color:cat.color,fontWeight:700 }}>
                      Upload available in future version
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize:"0.75rem",color:"var(--text-3)" }}>
                    {cat.examples.slice(0,2).join(" · ")} + more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Intake Form */}
      <div style={{ ...card, padding:"1.25rem" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem" }}>
          <div>
            <div style={{ fontSize:"0.75rem",fontWeight:800,color:"var(--text-1)",
              textTransform:"uppercase",letterSpacing:"0.08em" }}>Client Intake Form</div>
            <div style={{ fontSize:"0.625rem",color:"var(--text-3)",marginTop:2 }}>
              Complete and share with your advisor before your first meeting
            </div>
          </div>
          <button onClick={save}
            style={{ display:"flex",alignItems:"center",gap:5,background: saved ? GREEN : GOLD,
              color:"#07080a",border:"none",borderRadius:6,padding:"8px 16px",
              fontWeight:800,cursor:"pointer",fontSize:"0.6875rem",transition:"background 0.2s" }}>
            {saved ? <><CheckCircle size={13} /> Saved!</> : "Save Progress"}
          </button>
        </div>

        {/* Section 1: Personal */}
        <IntakeSection title="Personal & Family Information" icon={User} color={GOLD}>
          <FormField half label="First Name" value={intake.firstName} onChange={v => set("firstName",v)} placeholder="John" />
          <FormField half label="Last Name" value={intake.lastName} onChange={v => set("lastName",v)} placeholder="Smith" />
          <FormField half label="Date of Birth" value={intake.dob} onChange={v => set("dob",v)} type="date" />
          <FormField half label="Marital Status" value={intake.maritalStatus} onChange={v => set("maritalStatus",v)}
            options={["Single","Married","Domestic Partnership","Divorced","Widowed"]} />
          <FormField half label="Phone" value={intake.phone} onChange={v => set("phone",v)} placeholder="(555) 000-0000" />
          <FormField half label="Email" value={intake.email} onChange={v => set("email",v)} placeholder="you@email.com" type="email" />
          <FormField label="Street Address" value={intake.address} onChange={v => set("address",v)} placeholder="123 Main St" />
          <FormField half label="City" value={intake.city} onChange={v => set("city",v)} placeholder="Chicago" />
          <FormField half label="State" value={intake.stateRes} onChange={v => set("stateRes",v)} placeholder="IL" />
          {(intake.maritalStatus === "Married" || intake.maritalStatus === "Domestic Partnership") && <>
            <FormField half label="Spouse / Partner Name" value={intake.spouseName} onChange={v => set("spouseName",v)} placeholder="Jane Smith" />
            <FormField half label="Spouse Date of Birth" value={intake.spouseDob} onChange={v => set("spouseDob",v)} type="date" />
          </>}
          <FormField half label="US Citizenship Status" value={intake.citizenStatus} onChange={v => set("citizenStatus",v)}
            options={["US Citizen","Permanent Resident (Green Card)","Visa Holder","Non-Resident Alien","Other"]} />
          <FormField half label="Number of Dependents" value={intake.numChildren} onChange={v => set("numChildren",v)} type="number" placeholder="0" />
        </IntakeSection>

        {/* Section 2: Employment */}
        <IntakeSection title="Income & Employment" icon={Briefcase} color={BLUE}>
          <FormField half label="Current Employer" value={intake.employer} onChange={v => set("employer",v)} placeholder="Acme Corp" />
          <FormField half label="Job Title" value={intake.jobTitle} onChange={v => set("jobTitle",v)} placeholder="VP of Engineering" />
          <FormField half label="Employment Type" value={intake.employmentType} onChange={v => set("employmentType",v)} options={EMPLOYMENT_TYPES} />
          <FormField half label="Annual Gross Income ($)" value={intake.annualIncome} onChange={v => set("annualIncome",v)} type="number" placeholder="150000" />
          <FormField half label="Expected Annual Bonus (%)" value={intake.bonusPct} onChange={v => set("bonusPct",v)} type="number" placeholder="10" />
          <FormField half label="Spouse Annual Income ($)" value={intake.spouseIncome} onChange={v => set("spouseIncome",v)} type="number" placeholder="0" />
          <FormField half label="Business Owner?" value={intake.businessOwner} onChange={v => set("businessOwner",v)} options={["No","Yes"]} />
          {intake.businessOwner === "Yes" &&
            <FormField half label="Business Annual Revenue ($)" value={intake.businessRevenue} onChange={v => set("businessRevenue",v)} type="number" placeholder="500000" />
          }
          <FormField half label="Target Retirement Age" value={intake.retirementAge} onChange={v => set("retirementAge",v)} type="number" placeholder="65" />
          <FormField half label="Pension / Defined Benefit?" value={intake.hasPension} onChange={v => set("hasPension",v)} options={["No","Yes"]} />
          {intake.hasPension === "Yes" &&
            <FormField half label="Estimated Monthly Pension ($)" value={intake.pensionEstimate} onChange={v => set("pensionEstimate",v)} type="number" placeholder="2500" />
          }
          <FormField half label="Estimated Social Security Benefit ($/mo)" value={intake.ssEstimate} onChange={v => set("ssEstimate",v)} type="number" placeholder="2200" />
        </IntakeSection>

        {/* Section 3: Assets */}
        <IntakeSection title="Assets & Net Worth" icon={DollarSign} color={GREEN}>
          <FormField half label="Primary Residence Value ($)" value={intake.primaryHomeValue} onChange={v => set("primaryHomeValue",v)} type="number" placeholder="450000" />
          <FormField half label="Other Real Estate Value ($)" value={intake.otherRealEstate} onChange={v => set("otherRealEstate",v)} type="number" placeholder="0" />
          <FormField half label="401k / 403b Balance ($)" value={intake.k401Balance} onChange={v => set("k401Balance",v)} type="number" placeholder="250000" />
          <FormField half label="Traditional IRA Balance ($)" value={intake.iraBalance} onChange={v => set("iraBalance",v)} type="number" placeholder="0" />
          <FormField half label="Roth IRA Balance ($)" value={intake.rothBalance} onChange={v => set("rothBalance",v)} type="number" placeholder="0" />
          <FormField half label="Taxable Brokerage ($)" value={intake.brokerageBalance} onChange={v => set("brokerageBalance",v)} type="number" placeholder="0" />
          <FormField half label="Stock Options / RSU Value ($)" value={intake.stockOptions} onChange={v => set("stockOptions",v)} type="number" placeholder="0" />
          <FormField half label="Bank / Savings / Money Market ($)" value={intake.bankSavings} onChange={v => set("bankSavings",v)} type="number" placeholder="25000" />
          <FormField half label="Business Ownership Value ($)" value={intake.businessValue} onChange={v => set("businessValue",v)} type="number" placeholder="0" />
          <FormField half label="Other Assets ($)" value={intake.otherAssets} onChange={v => set("otherAssets",v)} type="number" placeholder="0" />
          {/* Net worth summary */}
          {[intake.primaryHomeValue,intake.otherRealEstate,intake.k401Balance,intake.iraBalance,intake.rothBalance,intake.brokerageBalance,intake.stockOptions,intake.bankSavings,intake.businessValue,intake.otherAssets].some(v => parseFloat(v) > 0) && (
            <div style={{ gridColumn:"span 2",background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.15)",
              borderRadius:6,padding:"0.75rem 1rem",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ fontSize:"0.625rem",color:"var(--text-3)" }}>Estimated Total Assets</span>
              <span style={{ fontSize:"1rem",fontWeight:800,color:GREEN }}>
                {fmt([intake.primaryHomeValue,intake.otherRealEstate,intake.k401Balance,intake.iraBalance,intake.rothBalance,intake.brokerageBalance,intake.stockOptions,intake.bankSavings,intake.businessValue,intake.otherAssets].reduce((s,v) => s+(parseFloat(v)||0),0))}
              </span>
            </div>
          )}
        </IntakeSection>

        {/* Section 4: Liabilities */}
        <IntakeSection title="Liabilities & Debt" icon={AlertCircle} color={RED}>
          <FormField half label="Mortgage Balance ($)" value={intake.mortgageBalance} onChange={v => set("mortgageBalance",v)} type="number" placeholder="320000" />
          <FormField half label="Monthly Mortgage Payment ($)" value={intake.mortgagePayment} onChange={v => set("mortgagePayment",v)} type="number" placeholder="2100" />
          <FormField half label="Home Equity Loan / HELOC ($)" value={intake.homeEquityLoan} onChange={v => set("homeEquityLoan",v)} type="number" placeholder="0" />
          <FormField half label="Auto Loans ($)" value={intake.carLoans} onChange={v => set("carLoans",v)} type="number" placeholder="0" />
          <FormField half label="Student Loans ($)" value={intake.studentLoans} onChange={v => set("studentLoans",v)} type="number" placeholder="0" />
          <FormField half label="Credit Card Debt ($)" value={intake.creditCardDebt} onChange={v => set("creditCardDebt",v)} type="number" placeholder="0" />
          <FormField half label="Business / Other Debt ($)" value={intake.otherDebt} onChange={v => set("otherDebt",v)} type="number" placeholder="0" />
          {[intake.mortgageBalance,intake.homeEquityLoan,intake.carLoans,intake.studentLoans,intake.creditCardDebt,intake.otherDebt].some(v => parseFloat(v) > 0) && (
            <div style={{ gridColumn:"span 2",background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",
              borderRadius:6,padding:"0.75rem 1rem",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ fontSize:"0.625rem",color:"var(--text-3)" }}>Estimated Total Liabilities</span>
              <span style={{ fontSize:"1rem",fontWeight:800,color:RED }}>
                {fmt([intake.mortgageBalance,intake.homeEquityLoan,intake.carLoans,intake.studentLoans,intake.creditCardDebt,intake.otherDebt].reduce((s,v) => s+(parseFloat(v)||0),0))}
              </span>
            </div>
          )}
        </IntakeSection>

        {/* Section 5: Insurance */}
        <IntakeSection title="Insurance Coverage" icon={Heart} color="#a855f7">
          <FormField half label="Life Insurance Type" value={intake.lifeInsType} onChange={v => set("lifeInsType",v)} options={INSURANCE_TYPES} />
          {intake.lifeInsType !== "None" && <>
            <FormField half label="Life Coverage Amount ($)" value={intake.lifeCoverage} onChange={v => set("lifeCoverage",v)} type="number" placeholder="500000" />
            <FormField half label="Annual Premium ($)" value={intake.lifePremium} onChange={v => set("lifePremium",v)} type="number" placeholder="1200" />
          </>}
          <FormField half label="Disability Insurance?" value={intake.hasDisability} onChange={v => set("hasDisability",v)} options={["No","Yes – Group (employer)","Yes – Individual Policy"]} />
          {intake.hasDisability !== "No" &&
            <FormField half label="Disability Monthly Benefit ($)" value={intake.disabilityCoverage} onChange={v => set("disabilityCoverage",v)} type="number" placeholder="5000" />
          }
          <FormField half label="Long-Term Care Insurance?" value={intake.hasLtc} onChange={v => set("hasLtc",v)} options={["No","Yes","Hybrid Policy"]} />
          <FormField half label="Health Insurance" value={intake.healthInsurance} onChange={v => set("healthInsurance",v)}
            options={["Employer-Sponsored","Marketplace / ACA","Medicare","Medicaid","COBRA","Private","Uninsured"]} />
          <FormField half label="Umbrella Policy?" value={intake.hasUmbrella} onChange={v => set("hasUmbrella",v)} options={["No","Yes"]} />
          {intake.hasUmbrella === "Yes" &&
            <FormField half label="Umbrella Coverage ($)" value={intake.umbrellaCoverage} onChange={v => set("umbrellaCoverage",v)} type="number" placeholder="1000000" />
          }
        </IntakeSection>

        {/* Section 6: Estate */}
        <IntakeSection title="Estate Planning" icon={Shield} color={GOLD}>
          <FormField half label="Do You Have a Will?" value={intake.hasWill} onChange={v => set("hasWill",v)} options={["No","Yes – Up to date","Yes – Needs updating"]} />
          {intake.hasWill !== "No" &&
            <FormField half label="Year Will Last Updated" value={intake.willUpdated} onChange={v => set("willUpdated",v)} placeholder="2021" />
          }
          <FormField half label="Do You Have a Trust?" value={intake.hasTrust} onChange={v => set("hasTrust",v)} options={["No","Yes"]} />
          {intake.hasTrust === "Yes" && <>
            <FormField half label="Trust Type" value={intake.trustType} onChange={v => set("trustType",v)} options={TRUST_TYPES} />
            <FormField half label="Trustee Name" value={intake.trustee} onChange={v => set("trustee",v)} placeholder="Jane Smith" />
          </>}
          <FormField half label="Financial Power of Attorney?" value={intake.hasPoa} onChange={v => set("hasPoa",v)} options={["No","Yes"]} />
          <FormField half label="Healthcare Directive / Living Will?" value={intake.hasHealthDirective} onChange={v => set("hasHealthDirective",v)} options={["No","Yes"]} />
          <FormField half label="Beneficiaries Reviewed Recently?" value={intake.beneficiariesReviewed} onChange={v => set("beneficiariesReviewed",v)} options={["No","Yes – Within 2 years","Yes – Within 5 years"]} />
          <FormField half label="Estate Attorney Name (if any)" value={intake.estateAttorney} onChange={v => set("estateAttorney",v)} placeholder="Attorney name or firm" />
        </IntakeSection>

        {/* Section 7: Goals */}
        <IntakeSection title="Financial Goals & Priorities" icon={Star} color={BLUE}>
          <FormField label="Primary Financial Goal" value={intake.primaryGoal} onChange={v => set("primaryGoal",v)} options={PRIMARY_GOALS} />
          <FormField half label="Target Retirement Age" value={intake.targetRetireAge} onChange={v => set("targetRetireAge",v)} type="number" placeholder="65" />
          <FormField half label="Monthly Retirement Income Goal ($)" value={intake.retireIncomeGoal} onChange={v => set("retireIncomeGoal",v)} type="number" placeholder="8000" />
          <FormField half label="Planning for College Funding?" value={intake.collegeFunding} onChange={v => set("collegeFunding",v)} options={["No","Yes"]} />
          {intake.collegeFunding === "Yes" && <>
            <FormField half label="Number of Children to Fund" value={intake.numChildren} onChange={v => set("numChildren",v)} type="number" placeholder="2" />
            <FormField half label="Years Until College Starts" value={intake.yearsUntilCollege} onChange={v => set("yearsUntilCollege",v)} type="number" placeholder="8" />
          </>}
          <FormField label="Major Planned Purchases (home, vacation, etc.)" value={intake.majorPurchases} onChange={v => set("majorPurchases",v)} placeholder="e.g. Buy a vacation home in 5 years" />
          <FormField label="Charitable / Legacy Goals" value={intake.charitableGoals} onChange={v => set("charitableGoals",v)} placeholder="e.g. Leave $200K to our church, fund a scholarship" />
          <div style={{ gridColumn:"span 2",display:"flex",flexDirection:"column",gap:6 }}>
            <label style={{ fontSize:"0.5rem",color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.08em" }}>
              Self-Assessed Risk Tolerance: <strong style={{ color:GOLD }}>{intake.riskToleranceSelf}/10</strong>
            </label>
            <input type="range" min={1} max={10} value={intake.riskToleranceSelf}
              onChange={e => set("riskToleranceSelf", parseInt(e.target.value))}
              style={{ width:"100%",accentColor:GOLD }} />
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.5rem",color:"var(--text-3)" }}>
              <span>1 – Very Conservative</span><span>5 – Moderate</span><span>10 – Aggressive</span>
            </div>
          </div>
        </IntakeSection>

        {/* Section 8: Tax */}
        <IntakeSection title="Tax Situation" icon={FileText} color={RED}>
          <FormField half label="Filing Status" value={intake.filingStatus} onChange={v => set("filingStatus",v)} options={FILING_STATUSES} />
          <FormField half label="Estimated Federal Tax Bracket" value={intake.estimatedBracket} onChange={v => set("estimatedBracket",v)} options={TAX_BRACKETS} />
          <FormField half label="State of Tax Residence" value={intake.taxState} onChange={v => set("taxState",v)} placeholder="IL" />
          <FormField half label="CPA / Tax Advisor Name" value={intake.cpaTaxAdvisor} onChange={v => set("cpaTaxAdvisor",v)} placeholder="Smith Tax Group" />
          <FormField half label="Recent Tax Issues or Audit?" value={intake.recentTaxIssue} onChange={v => set("recentTaxIssue",v)} options={["No","Yes (will explain)"]} />
          <FormField half label="Alternative Minimum Tax Concern?" value={intake.amtConcern} onChange={v => set("amtConcern",v)} options={["No","Yes","Not Sure"]} />
          <FormField half label="Using Tax-Loss Harvesting?" value={intake.taxLossHarvest} onChange={v => set("taxLossHarvest",v)} options={["No","Yes","Not Sure"]} />
          <FormField label="Additional Notes for Your Advisor" value={intake.additionalNotes}
            onChange={v => set("additionalNotes",v)} placeholder="Anything else your advisor should know about your situation..." />
        </IntakeSection>

        {/* Save footer */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
          paddingTop:"1rem",borderTop:"1px solid var(--border-c)" }}>
          <div style={{ fontSize:"0.625rem",color:"var(--text-3)" }}>
            Saves locally to your browser · Future version will send directly to your advisor
          </div>
          <button onClick={save}
            style={{ display:"flex",alignItems:"center",gap:5,background: saved ? GREEN : GOLD,
              color:"#07080a",border:"none",borderRadius:6,padding:"10px 20px",
              fontWeight:800,cursor:"pointer",fontSize:"0.75rem",transition:"background 0.2s" }}>
            {saved ? <><CheckCircle size={14} /> Saved!</> : "Save Intake Form"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────── */
const TABS = [
  { key:"directory", label:"Advisor Directory",   icon:Users },
  { key:"match",     label:"Match Me",            icon:Sliders },
  { key:"prep",      label:"Preparation Hub",     icon:BookOpen },
  { key:"folder",    label:"My Advisory Folder",  icon:FolderOpen },
];

export default function WealthCounsel() {
  const [activeTab, setActiveTab] = useState("directory");
  const navigate = useNavigate();

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"1.25rem" }}>

      {/* ── P button — fixed top-right, back to landing ── */}
      <button
        onClick={() => navigate('/')}
        title="Back to Planora"
        style={{
          position: 'fixed', top: 16, right: 20, zIndex: 100,
          width: 36, height: 36, borderRadius: 9,
          background: GOLD, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 0 14px rgba(201,168,76,0.3)',
        }}
      >
        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '0.9375rem', fontWeight: 900, color: '#1a1410', lineHeight: 1 }}>P</span>
      </button>

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        borderRadius: 20,
        padding: "2rem 2.25rem",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 var(--border-c)",
      }}>
        <div style={{
          position: "absolute", top: -60, right: -40,
          width: 320, height: 320,
          background: "radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem", position: "relative" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.625rem" }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <BookUser size={14} style={{ color: "var(--gold)" }} />
              </div>
              <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em", fontFamily: "'Inter', system-ui, sans-serif" }}>
                WEALTH{" "}
                <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: "var(--gold)", fontWeight: 400, fontSize: "1.5rem" }}>Counsel</em>
              </h1>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.65, maxWidth: 560, margin: "0 0 1rem" }}>
              Connect with the right financial advisor for your situation. Browse vetted CFP® professionals filtered by specialty, fee structure, and investment minimums.
            </p>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              {["CFP® Advisors", "Fee-Only Options", "Specialty Matching", "Free to Browse"].map((label) => (
                <span key={label} style={{
                  fontSize: "0.6875rem", fontWeight: 700, padding: "3px 10px",
                  borderRadius: 99, letterSpacing: "0.04em",
                  background: "rgba(201,169,110,0.10)",
                  border: "1px solid rgba(201,169,110,0.25)",
                  color: "var(--gold)",
                }}>{label}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", flexShrink: 0 }}>
            {[
              { icon: Shield, label: "Vetted Advisors", sub: "Background-checked pros", color: "#3b82f6" },
              { icon: BadgeCheck, label: "CFP® Certified", sub: "Certified Financial Planners", color: "var(--gold)" },
              { icon: DollarSign, label: "Fee-Only Options", sub: "No commission advisors", color: "var(--teal)" },
              { icon: Sliders, label: "Specialty Matching", sub: "Filter by your needs", color: "#f59e0b" },
            ].map(({ icon: Icon, label, sub, color }) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: "0.625rem",
                padding: "0.625rem 0.875rem",
                background: "var(--bg)", border: "1px solid var(--border-c)",
                borderRadius: 10, minWidth: 170,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: "rgba(201,169,110,0.1)",
                  border: "1px solid rgba(201,169,110,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-1)", lineHeight: 1 }}>{label}</div>
                  <div style={{ fontSize: "0.625rem", color: "var(--text-3)", marginTop: 2, lineHeight: 1.3 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.25rem", background: "var(--surface)", padding: "0.3rem", borderRadius: 10, border: "1px solid var(--border-c)", overflowX: "auto", backdropFilter: "blur(12px)" }}>
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "0.45rem 0.85rem", borderRadius: 7, cursor: "pointer", transition: "all 0.15s",
                border: active ? "1px solid rgba(201,169,110,0.3)" : "1px solid transparent",
                background: active ? "rgba(201,169,110,0.18)" : "transparent",
                color: active ? "var(--gold)" : "var(--text-3)",
                fontWeight: active ? 700 : 500, fontSize: "0.6875rem" }}>
              <Icon size={13} />
              <span style={{ display: "inline" }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "directory" && <TabDirectory />}
      {activeTab === "match"     && <TabMatchMe />}
      {activeTab === "prep"      && <TabPrepHub />}
      {activeTab === "folder"    && <TabFolder />}
    </div>
  );
}
