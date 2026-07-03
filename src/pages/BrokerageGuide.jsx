import React, { useState, useMemo } from "react";
import logoFidelity      from "../assets/brokerages/fidelity.png";
import logoSchwab        from "../assets/brokerages/schwab.jpg";
import logoMerrill       from "../assets/brokerages/merrill.png";
import logoEdwardJones   from "../assets/brokerages/edwardjones.webp";
import logoVanguard      from "../assets/brokerages/vanguard.jpeg";
import logoJPMorgan      from "../assets/brokerages/jpmorgan.png";
import logoRaymondJames  from "../assets/brokerages/raymondjames.jpeg";
import logoAmeriprise    from "../assets/brokerages/ameriprise.jpeg";
import logoWellsFargo    from "../assets/brokerages/wellsfargo.png";
import logoIBKR          from "../assets/brokerages/ibkr.png";
import logoETrade        from "../assets/brokerages/etrade.png";
import logoWebull        from "../assets/brokerages/webull.png";
import logoRobinhood     from "../assets/brokerages/robinhood.png";
import logoSofi          from "../assets/brokerages/sofi.png";
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  BookOpen, Star, DollarSign, Shield, Zap, Users, TrendingUp,
  ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle,
  Search, ArrowRight, BarChart2, PieChart, Target, Award,
  Filter, Sliders, ChevronRight, Info, ExternalLink,
  Monitor, Cpu, Briefcase, Landmark, Umbrella, Wallet, Home,
  Smile, Layers, FileText,
} from "lucide-react";

/* ── Design tokens ─────────────────────────────────────── */
const G = "var(--gold)";
const T = "var(--teal)";
const S = "var(--surface)";
const B = "var(--border-c)";
const TX1 = "var(--text-1)";
const TX2 = "var(--text-2)";
const TX3 = "var(--text-3)";
const BG  = "var(--bg)";

/* ── Brokerage Data ────────────────────────────────────── */
const BROKERAGES = [
  /* ── Full-Service ── */
  {
    id: "fidelity",
    name: "Fidelity Investments",
    category: "full-service",
    logo: "FD",
    logoImg: logoFidelity,
    logoColor: "#00713e",
    tagline: "Best Overall Brokerage",
    rating: 4.9,
    stockTrades: "$0",
    optionTrades: "$0.65/contract",
    minDeposit: "$0",
    accountTypes: ["Individual", "Joint", "IRA", "Roth IRA", "401k", "529", "HSA"],
    platforms: ["Web", "Mobile", "Active Trader Pro"],
    research: 5,
    tools: 5,
    mobile: 5,
    education: 5,
    customerService: 5,
    ease: 4,
    description:
      "Fidelity is the gold standard for retail investors — zero-commission trades, fractional shares, excellent research, and one of the best mobile apps. No account minimums, no payment for order flow on equities.",
    pros: [
      "Zero commissions on stocks/ETFs",
      "No payment for order flow",
      "Fractional shares from $1",
      "Excellent research & tools",
      "Top-tier customer service 24/7",
      "Wide fund selection including zero-fee index funds",
    ],
    cons: [
      "Active Trader Pro can feel dated",
      "Futures trading not available",
      "Crypto limited (only Bitcoin/ETH via spot ETF)",
    ],
    bestFor: ["Long-term investors", "Retirement planning", "Beginners", "Fund investors"],
    highlights: { aum: "$12.5T", accounts: "43M+", founded: "1946" },
    verdict: "Best all-around brokerage. If you can only use one, make it Fidelity.",
  },
  {
    id: "schwab",
    name: "Charles Schwab",
    category: "full-service",
    logo: "CS",
    logoImg: logoSchwab,
    logoColor: "#00a0dc",
    tagline: "Best for Active Traders & Beginners",
    rating: 4.8,
    stockTrades: "$0",
    optionTrades: "$0.65/contract",
    minDeposit: "$0",
    accountTypes: ["Individual", "Joint", "IRA", "Roth IRA", "SEP IRA", "Trust", "529"],
    platforms: ["Web", "Mobile", "thinkorswim", "StreetSmart Edge"],
    research: 5,
    tools: 5,
    mobile: 4,
    education: 5,
    customerService: 5,
    ease: 4,
    description:
      "After acquiring TD Ameritrade, Schwab now offers thinkorswim — arguably the most powerful retail trading platform ever built. Full-service wealth management meets elite active trading tools.",
    pros: [
      "thinkorswim platform (industry best)",
      "Zero commissions",
      "Excellent bond & fixed income desk",
      "24/7 customer support",
      "Over 500 branch locations",
      "Fractional shares (Schwab Stock Slices)",
    ],
    cons: [
      "thinkorswim can overwhelm beginners",
      "Robo-advisor has cash drag",
      "App not as polished as Fidelity",
    ],
    bestFor: ["Active traders", "Options traders", "Fixed income investors", "Schwab Intelligent Portfolios users"],
    highlights: { aum: "$9.7T", accounts: "35M+", founded: "1971" },
    verdict: "Schwab + thinkorswim = unmatched power for serious traders at zero commission.",
  },
  {
    id: "merrill",
    name: "Merrill Lynch",
    category: "full-service",
    logo: "ML",
    logoImg: logoMerrill,
    logoColor: "#e31837",
    tagline: "Best for Bank of America Customers",
    rating: 4.4,
    stockTrades: "$0",
    optionTrades: "$0.65/contract",
    minDeposit: "$0 (self-directed)",
    accountTypes: ["Individual", "Joint", "IRA", "Roth IRA", "529", "Managed"],
    platforms: ["Merrill Edge Web", "Mobile", "Merrill Lynch Advisor"],
    research: 5,
    tools: 4,
    mobile: 4,
    education: 4,
    customerService: 4,
    ease: 4,
    description:
      "Merrill Edge offers zero-commission trades and is deeply integrated with Bank of America's Preferred Rewards program. Merrill Lynch wealth management provides full advisor access for higher-net-worth clients.",
    pros: [
      "BofA Preferred Rewards perks",
      "Award-winning research",
      "In-branch advisor access",
      "Seamless BofA banking integration",
      "Guided Investing robo service",
    ],
    cons: [
      "Average trading platform",
      "Preferred Rewards requires BofA relationship",
      "No futures or crypto trading",
    ],
    bestFor: ["Bank of America customers", "Research-driven investors", "High-net-worth clients"],
    highlights: { aum: "$3.4T", accounts: "3.5M+", founded: "1914" },
    verdict: "Excellent if you already bank with BofA. The Preferred Rewards integration is genuinely valuable.",
  },
  {
    id: "edwardjones",
    name: "Edward Jones",
    category: "full-service",
    logo: "EJ",
    logoImg: logoEdwardJones,
    logoColor: "#006db7",
    tagline: "Best for Personal Advisor Relationship",
    rating: 4.1,
    stockTrades: "Varies (advisor)",
    optionTrades: "Limited",
    minDeposit: "$0",
    accountTypes: ["Individual", "Joint", "IRA", "Roth IRA", "529", "Annuities"],
    platforms: ["Web", "Mobile", "Advisor meetings"],
    research: 4,
    tools: 3,
    mobile: 3,
    education: 3,
    customerService: 5,
    ease: 5,
    description:
      "Edward Jones operates on a personal advisor model — every client gets a dedicated financial advisor. Ideal for investors who want hand-holding and relationship-driven planning, not self-directed trading.",
    pros: [
      "Dedicated personal financial advisor",
      "14,000+ branch locations",
      "Excellent for long-term planning",
      "Great for retirees and conservative investors",
      "Community-based advisor relationships",
    ],
    cons: [
      "Higher fees than discount brokers",
      "No self-directed trading platform",
      "Limited investment options",
      "Not suitable for active traders",
    ],
    bestFor: ["Retirees", "Conservative investors", "People who want advisor guidance"],
    highlights: { aum: "$1.9T", accounts: "8M+", founded: "1922" },
    verdict: "Best if you want a trusted advisor relationship. Expect higher fees for that personalization.",
  },

  {
    id: "vanguard",
    name: "Vanguard",
    category: "full-service",
    logo: "VG",
    logoImg: logoVanguard,
    logoColor: "#922610",
    tagline: "Best for Long-Term Buy-and-Hold Investors",
    rating: 4.5,
    stockTrades: "$0",
    optionTrades: "$1/contract",
    minDeposit: "$0",
    accountTypes: ["Individual", "Joint", "IRA", "Roth IRA", "SEP IRA", "SIMPLE IRA", "Solo 401k", "529", "Trust"],
    platforms: ["Web", "Mobile", "Vanguard Personal Advisor"],
    research: 3,
    tools: 3,
    mobile: 3,
    education: 5,
    customerService: 3,
    ease: 3,
    description:
      "Vanguard invented index investing and remains the gold standard for long-term, low-cost buy-and-hold investors. Their lineup of index funds and ETFs — with expense ratios as low as 0.03% — has saved investors trillions in fees. Not a trader's platform, but the best steward of long-term wealth in the industry.",
    pros: [
      "Industry-lowest expense ratios",
      "Created the index fund revolution",
      "No-frills, investor-owned structure",
      "Outstanding fund selection",
      "Personal Advisor Services (0.3% fee with CFP access)",
      "529 college savings plans",
    ],
    cons: [
      "Platform is dated and slow",
      "Mobile app lags competitors",
      "Customer service wait times can be long",
      "Not suitable for active traders",
      "$1/contract options fee",
    ],
    bestFor: ["Buy-and-hold investors", "Retirement savers", "Index fund investors", "Fee-minimizers"],
    highlights: { aum: "$8.7T", accounts: "50M+", founded: "1975" },
    verdict: "The spiritual home of index investing. If you believe in low-cost passive investing, Vanguard is your brokerage.",
  },
  {
    id: "jpmorgan",
    name: "J.P. Morgan Self-Directed",
    category: "full-service",
    logo: "JP",
    logoImg: logoJPMorgan,
    logoColor: "#003087",
    tagline: "Best for Chase Banking Customers",
    rating: 4.2,
    stockTrades: "$0",
    optionTrades: "$0.65/contract",
    minDeposit: "$0",
    accountTypes: ["Individual", "Joint", "IRA", "Roth IRA", "SEP IRA", "Custodial"],
    platforms: ["Chase Mobile", "Web", "J.P. Morgan Wealth Management App"],
    research: 4,
    tools: 3,
    mobile: 5,
    education: 3,
    customerService: 4,
    ease: 5,
    description:
      "J.P. Morgan Self-Directed Investing is seamlessly embedded in the Chase banking ecosystem, making it the most convenient option for Chase customers. Commission-free trades, solid J.P. Morgan research, and a clean interface — though it lacks the advanced tools of dedicated brokers.",
    pros: [
      "Seamless Chase bank integration",
      "Zero commissions",
      "J.P. Morgan research access",
      "Great mobile experience",
      "Chase Sapphire/Preferred bonuses sometimes apply",
      "Automated investing option available",
    ],
    cons: [
      "Limited trading tools vs. dedicated brokers",
      "No futures or advanced options strategies",
      "Fractional shares limited",
      "Not suited for active traders",
    ],
    bestFor: ["Chase banking customers", "Beginner investors", "People who want banking + investing in one app"],
    highlights: { aum: "$3.9T", accounts: "80M+ (Chase)", founded: "1799" },
    verdict: "Unbeatable convenience if you already bank with Chase. One login for everything — but advanced traders will outgrow it.",
  },
  {
    id: "raymondjames",
    name: "Raymond James",
    category: "full-service",
    logo: "RJ",
    logoImg: logoRaymondJames,
    logoColor: "#003087",
    tagline: "Best Independent Full-Service Advisor Network",
    rating: 4.3,
    stockTrades: "Varies (advisor-set)",
    optionTrades: "Varies",
    minDeposit: "Varies by advisor",
    accountTypes: ["Individual", "Joint", "IRA", "Roth IRA", "SEP IRA", "Annuities", "Trust", "Managed"],
    platforms: ["Web", "Mobile", "Advisor workstation"],
    research: 5,
    tools: 4,
    mobile: 3,
    education: 3,
    customerService: 5,
    ease: 4,
    description:
      "Raymond James is one of the largest independent broker-dealers in the US, known for a strong advisor network and top-rated research. Unlike wirehouse firms (Merrill, Morgan Stanley), Raymond James advisors have more independence to act in clients' true best interests.",
    pros: [
      "Award-winning equity research",
      "Advisor independence (less corporate pressure)",
      "Strong wealth planning capabilities",
      "Conservative, client-first culture",
      "Diverse account and product offerings",
      "Financial planning for high-net-worth clients",
    ],
    cons: [
      "Not self-directed — requires advisor relationship",
      "Higher fee structure",
      "Technology lags pure digital brokers",
      "Not for self-directed traders",
    ],
    bestFor: ["High-net-worth individuals", "Clients wanting an independent advisor", "Wealth planning focus"],
    highlights: { aum: "$1.35T", accounts: "3.5M+", founded: "1962" },
    verdict: "Raymond James advisors have genuine independence. Best full-service option outside the big wirehouse firms.",
  },
  {
    id: "ameriprise",
    name: "Ameriprise Financial",
    category: "full-service",
    logo: "AM",
    logoImg: logoAmeriprise,
    logoColor: "#c8102e",
    tagline: "Best for Comprehensive Financial Planning",
    rating: 4.1,
    stockTrades: "Varies (advisor-set)",
    optionTrades: "Varies",
    minDeposit: "Varies by advisor",
    accountTypes: ["Individual", "Joint", "IRA", "Roth IRA", "401k Rollover", "Annuities", "Trust", "Managed"],
    platforms: ["Web", "Mobile", "Advisor portal"],
    research: 4,
    tools: 3,
    mobile: 3,
    education: 4,
    customerService: 4,
    ease: 4,
    description:
      "Ameriprise Financial is one of the largest full-service wealth management firms in America, with over 10,000 financial advisors. Known for its holistic financial planning approach — integrating investments, insurance, taxes, and estate planning into a single coordinated strategy.",
    pros: [
      "Holistic financial planning approach",
      "Insurance + investments under one roof",
      "10,000+ financial advisors nationwide",
      "Confident Retirement® planning program",
      "Strong estate and tax planning resources",
    ],
    cons: [
      "Higher advisory fees",
      "Advisor quality varies by location",
      "No self-directed trading platform",
      "Some proprietary product pressure",
    ],
    bestFor: ["Comprehensive financial planning", "Pre-retirees", "Clients wanting insurance + investing bundled"],
    highlights: { aum: "$1.4T", accounts: "2M+", founded: "1894" },
    verdict: "Strong choice if you want a single advisor coordinating your full financial picture — investments, insurance, and estate planning.",
  },

  /* ── Online Discount Brokers ── */
  {
    id: "wellsfargo",
    name: "Wells Fargo Advisors",
    category: "online",
    logo: "WF",
    logoImg: logoWellsFargo,
    logoColor: "#d71e28",
    tagline: "Best Bank-Integrated Brokerage",
    rating: 4.0,
    stockTrades: "Varies",
    optionTrades: "Varies",
    minDeposit: "Varies",
    accountTypes: ["Individual", "Joint", "IRA", "Roth IRA", "Trust", "Managed"],
    platforms: ["Web", "Mobile", "WellsTrade"],
    research: 4,
    tools: 3,
    mobile: 4,
    education: 3,
    customerService: 4,
    ease: 4,
    description:
      "Wells Fargo Advisors offers full-service wealth management backed by one of America's largest banks. Seamless banking integration with lending, cash management, and investment accounts under one roof.",
    pros: [
      "Seamless bank-brokerage integration",
      "Access to Wells Fargo banking products",
      "Nationwide advisor network",
      "WellsTrade for self-directed trading",
    ],
    cons: [
      "Higher advisory fees",
      "Mixed customer service reputation",
      "Cross-selling pressure",
    ],
    bestFor: ["Wells Fargo banking customers", "Those wanting banking + investing integration"],
    highlights: { aum: "$1.9T", accounts: "3M+", founded: "1852" },
    verdict: "Strong for Wells Fargo banking customers who want integrated wealth management.",
  },
  {
    id: "ibkr",
    name: "Interactive Brokers",
    category: "online",
    logo: "IB",
    logoImg: logoIBKR,
    logoColor: "#d40000",
    tagline: "Best for Active & Professional Traders",
    rating: 4.7,
    stockTrades: "$0 (Lite) / $0.005/share (Pro)",
    optionTrades: "$0.65/contract",
    minDeposit: "$0",
    accountTypes: ["Individual", "Joint", "IRA", "Roth IRA", "Trust", "Corporate"],
    platforms: ["Desktop (TWS)", "Web", "Mobile", "API"],
    research: 5,
    tools: 5,
    mobile: 4,
    education: 5,
    customerService: 3,
    ease: 2,
    description:
      "Interactive Brokers is the professional's choice — lowest margin rates, broadest global market access, and the most powerful trading platform (TWS). Institutional-grade tools for serious traders.",
    pros: [
      "Lowest margin rates in the industry",
      "Access to 150 global markets",
      "Institutional-grade TWS platform",
      "Fractional shares",
      "Comprehensive research tools",
      "Best for international investing",
    ],
    cons: [
      "Steep learning curve",
      "TWS interface can be overwhelming",
      "Customer service is limited",
      "Not beginner-friendly",
    ],
    bestFor: ["Active traders", "Options traders", "International investors", "Professionals"],
    highlights: { aum: "$500B+", accounts: "2.5M+", founded: "1977" },
    verdict: "The professional's broker. Unmatched for active traders, global markets, and lowest margin rates.",
  },
  {
    id: "etrade",
    name: "E*TRADE",
    category: "online",
    logo: "ET",
    logoImg: logoETrade,
    logoColor: "#6632a8",
    tagline: "Best Platform Experience",
    rating: 4.5,
    stockTrades: "$0",
    optionTrades: "$0.65/contract",
    minDeposit: "$0",
    accountTypes: ["Individual", "Joint", "IRA", "Roth IRA", "SEP IRA", "Trust", "Custodial"],
    platforms: ["Web", "Mobile", "Power E*TRADE Desktop"],
    research: 4,
    tools: 5,
    mobile: 5,
    education: 4,
    customerService: 4,
    ease: 4,
    description:
      "E*TRADE (now part of Morgan Stanley) offers the best hybrid experience — beginner-friendly for new investors while Power E*TRADE satisfies active traders with advanced charting, options analytics, and paper trading.",
    pros: [
      "Power E*TRADE desktop for active traders",
      "Best mobile app in the industry",
      "Paper trading for practice",
      "Strong options analytics",
      "Morgan Stanley research access",
      "Extensive education center",
    ],
    cons: [
      "No fractional shares for stocks",
      "Not cheapest for options-heavy traders",
      "Website can feel cluttered",
    ],
    bestFor: ["Mobile-first investors", "Active traders wanting a polished platform", "Options traders"],
    highlights: { aum: "$360B+", accounts: "5.2M+", founded: "1982" },
    verdict: "Best overall platform experience. Power E*TRADE rivals desktop platforms while the mobile app leads the industry.",
  },
  {
    id: "webull",
    name: "Webull",
    category: "online",
    logo: "WB",
    logoImg: logoWebull,
    logoColor: "#00c2ff",
    tagline: "Best Free Advanced Charting",
    rating: 4.3,
    stockTrades: "$0",
    optionTrades: "$0",
    minDeposit: "$0",
    accountTypes: ["Individual", "IRA", "Roth IRA", "SEP IRA"],
    platforms: ["Desktop", "Web", "Mobile"],
    research: 4,
    tools: 5,
    mobile: 5,
    education: 4,
    customerService: 3,
    ease: 3,
    description:
      "Webull offers institutional-grade charting and analytics completely free. Advanced technical indicators, paper trading, extended hours, and options trading — all with zero commissions.",
    pros: [
      "Advanced free charting (50+ indicators)",
      "Paper trading simulator",
      "Extended hours trading (4am–8pm)",
      "Zero commissions including options",
      "Crypto trading",
      "Level 2 quotes included",
    ],
    cons: [
      "No mutual funds",
      "Customer service is limited",
      "Not beginner-friendly",
    ],
    bestFor: ["Technical analysts", "Active self-directed investors", "Chart-focused traders"],
    highlights: { aum: "$20B+", accounts: "20M+", founded: "2017" },
    verdict: "Best free charting platform. If technical analysis drives your decisions, Webull is essential.",
  },
  {
    id: "robinhood",
    name: "Robinhood",
    category: "online",
    logo: "RH",
    logoImg: logoRobinhood,
    logoColor: "#00c805",
    tagline: "Best for Beginner Investors",
    rating: 4.0,
    stockTrades: "$0",
    optionTrades: "$0",
    minDeposit: "$0",
    accountTypes: ["Individual", "IRA", "Roth IRA"],
    platforms: ["Mobile", "Web"],
    research: 2,
    tools: 3,
    mobile: 5,
    education: 3,
    customerService: 2,
    ease: 5,
    description:
      "Robinhood pioneered commission-free trading and remains the most user-friendly platform for new investors. Simple, clean interface with instant account funding, fractional shares, and crypto — all in one app.",
    pros: [
      "Cleanest, most intuitive interface",
      "Instant deposit up to $1,000",
      "Fractional shares from $1",
      "Crypto trading",
      "Cash Card with stock rewards",
      "Robinhood Gold: 5% APY + margin",
    ],
    cons: [
      "Limited investment options",
      "No retirement accounts without Gold",
      "Gamification concerns",
      "Poor customer service history",
    ],
    bestFor: ["Complete beginners", "Mobile-first investors", "Small accounts"],
    highlights: { aum: "$150B+", accounts: "23M+", founded: "2013" },
    verdict: "Best onboarding in the industry. Limited for serious traders but perfect as a first brokerage.",
  },

  /* ── Robo-Advisors ── */
  {
    id: "sofi-auto",
    name: "SoFi Automated Investing",
    category: "robo",
    logo: "SF",
    logoImg: logoSofi,
    logoColor: "#6366f1",
    tagline: "Best Free Robo-Advisor",
    rating: 4.2,
    stockTrades: "N/A (managed)",
    optionTrades: "N/A",
    minDeposit: "$1",
    accountTypes: ["Individual", "Joint", "IRA", "Roth IRA", "SEP IRA"],
    platforms: ["Web", "Mobile"],
    research: 3,
    tools: 3,
    mobile: 5,
    education: 4,
    customerService: 4,
    ease: 5,
    description:
      "SoFi Automated Investing charges 0% management fee and includes complimentary access to certified financial planners. It's part of the broader SoFi ecosystem with banking, loans, and credit products.",
    pros: [
      "Zero management fee",
      "Free CFP access",
      "$1 minimum investment",
      "SoFi ecosystem integration",
      "Great mobile experience",
    ],
    cons: [
      "No tax-loss harvesting",
      "Limited portfolio options",
      "Fund expense ratios are slightly higher",
      "Less sophisticated tools",
    ],
    bestFor: ["Cost-conscious beginners", "SoFi customers", "Young investors"],
    highlights: { aum: "$1B+", accounts: "7M+", founded: "2011" },
    verdict: "Best free robo-advisor. Zero fee + CFP access is hard to beat for small accounts.",
  },

  /* ── Specialty ── */
  {
    id: "acorns",
    name: "Acorns",
    category: "specialty",
    logo: "AC",
    logoColor: "#7ab648",
    tagline: "Best Micro-Investing App",
    rating: 4.1,
    stockTrades: "N/A (managed)",
    optionTrades: "N/A",
    minDeposit: "$0",
    accountTypes: ["Individual", "IRA", "Roth IRA", "Custodial"],
    platforms: ["Mobile"],
    research: 2,
    tools: 2,
    mobile: 5,
    education: 4,
    customerService: 3,
    ease: 5,
    description:
      "Acorns rounds up your everyday purchases to the nearest dollar and invests the spare change. The simplest way to start investing with literally nothing — great for people who struggle to save.",
    pros: [
      "Round-up investing from debit/credit",
      "Automatic recurring investments",
      "Found Money: brand partner bonuses",
      "Kid custodial accounts",
      "Family plan available",
    ],
    cons: [
      "$3-$5/month fee (high for small balances)",
      "Very limited portfolio options",
      "Only 5 ETF-based portfolios",
      "Not suitable for active investors",
    ],
    bestFor: ["Non-savers who need automation", "Young adults", "Small account starters"],
    highlights: { aum: "$3B+", accounts: "10M+", founded: "2012" },
    verdict: "The easiest way to start. Just link a card and forget — spare change becomes wealth.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Brokerages", count: BROKERAGES.length },
  { id: "full-service", label: "Full-Service", count: BROKERAGES.filter(b => b.category === "full-service").length },
  { id: "online", label: "Online Discount", count: BROKERAGES.filter(b => b.category === "online").length },
  { id: "robo", label: "Robo-Advisors", count: BROKERAGES.filter(b => b.category === "robo").length },
  { id: "specialty", label: "Specialty", count: BROKERAGES.filter(b => b.category === "specialty").length },
];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "compare", label: "Compare" },
  { id: "find", label: "Find My Brokerage" },
  { id: "fees", label: "Fee Calculator" },
  { id: "education", label: "Education" },
];

/* ── Star Rating ───────────────────────────────────────── */
// Stars component removed — ratings removed from UI

/* ── Score Bar ─────────────────────────────────────────── */
function ScoreBar({ label, value, max = 5 }) {
  const pct = (value / max) * 100;
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: TX3 }}>{label}</span>
        <span style={{ fontSize: 11, color: TX2, fontWeight: 600 }}>{value}/{max}</span>
      </div>
      <div style={{ height: 4, background: "var(--border-c)", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: G, borderRadius: 2 }} />
      </div>
    </div>
  );
}

/* ── Brokerage Card ────────────────────────────────────── */
function BrokerageCard({ b, expanded, onToggle, comparing, onToggleCompare }) {
  return (
    <div style={{
      background: S,
      border: `1px solid ${comparing ? G : B}`,
      borderRadius: 12,
      overflow: "hidden",
      transition: "border-color 0.2s",
      boxShadow: comparing ? `0 0 20px rgba(201,169,110,0.12)` : "none",
    }}>
      {/* Card Header */}
      <div
        onClick={onToggle}
        style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
      >
        {/* Logo */}
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: b.logoImg ? "#fff" : b.logoColor + "22",
          border: `1px solid ${b.logoImg ? "#ddd" : b.logoColor + "44"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {b.logoImg
            ? <img src={b.logoImg} alt={b.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 5 }} />
            : <span style={{ fontSize: 13, fontWeight: 800, color: b.logoColor }}>{b.logo}</span>
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: TX1 }}>{b.name}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
              background: "rgba(201,169,110,0.1)", color: G, letterSpacing: "0.06em",
            }}>{b.tagline}</span>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: TX3, marginBottom: 2 }}>Stocks</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: b.stockTrades === "$0" ? "var(--up)" : TX1 }}>{b.stockTrades === "$0" ? "Free" : b.stockTrades}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: TX3, marginBottom: 2 }}>Min</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TX1 }}>{b.minDeposit}</div>
          </div>
        </div>

        {/* Compare toggle */}
        <button
          onClick={e => { e.stopPropagation(); onToggleCompare(); }}
          style={{
            padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
            border: `1px solid ${comparing ? G : B}`,
            background: comparing ? "rgba(201,169,110,0.1)" : "transparent",
            color: comparing ? G : TX3, cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
          }}
        >
          {comparing ? "✓ Added" : "+ Compare"}
        </button>

        <div style={{ color: TX3, flexShrink: 0 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${B}`, padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Left col */}
            <div>
              <p style={{ fontSize: 13, color: TX2, lineHeight: 1.7, marginBottom: 16 }}>{b.description}</p>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: TX3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Scores</div>
                <ScoreBar label="Research & Data" value={b.research} />
                <ScoreBar label="Tools & Platform" value={b.tools} />
                <ScoreBar label="Mobile App" value={b.mobile} />
                <ScoreBar label="Education" value={b.education} />
                <ScoreBar label="Customer Service" value={b.customerService} />
                <ScoreBar label="Ease of Use" value={b.ease} />
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 12 }}>
                {Object.entries(b.highlights).map(([k, v]) => (
                  <div key={k} style={{
                    flex: 1, padding: "10px 12px", background: BG, borderRadius: 8,
                    border: `1px solid ${B}`, textAlign: "center",
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: G }}>{v}</div>
                    <div style={{ fontSize: 10, color: TX3, textTransform: "capitalize", marginTop: 2 }}>{k}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right col */}
            <div>
              {/* Fees */}
              <div style={{ background: BG, border: `1px solid ${B}`, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: TX3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Fee Schedule</div>
                {[
                  ["Stock Trades", b.stockTrades],
                  ["Options", b.optionTrades],
                  ["Min Deposit", b.minDeposit],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid var(--border-c)` }}>
                    <span style={{ fontSize: 12, color: TX3 }}>{l}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: v === "$0" ? "var(--up)" : TX1 }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Account types */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: TX3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Account Types</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {b.accountTypes.map(a => (
                    <span key={a} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: "var(--border-c)", border: `1px solid ${B}`, color: TX2 }}>{a}</span>
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--up)", marginBottom: 6 }}>Pros</div>
                  {b.pros.map(p => (
                    <div key={p} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                      <CheckCircle size={11} color="var(--up)" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 11, color: TX2, lineHeight: 1.5 }}>{p}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--down)", marginBottom: 6 }}>Cons</div>
                  {b.cons.map(c => (
                    <div key={c} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                      <XCircle size={11} color="var(--down)" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 11, color: TX2, lineHeight: 1.5 }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best For */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: TX3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Best For</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {b.bestFor.map(f => (
                    <span key={f} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: "rgba(201,169,110,0.08)", border: `1px solid rgba(201,169,110,0.2)`, color: G }}>{f}</span>
                  ))}
                </div>
              </div>

              {/* Verdict */}
              <div style={{ background: "rgba(201,169,110,0.06)", border: `1px solid rgba(201,169,110,0.15)`, borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: G, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Planora Verdict</div>
                <p style={{ fontSize: 12, color: TX1, lineHeight: 1.6, margin: 0 }}>{b.verdict}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Overview Tab ──────────────────────────────────────── */
function OverviewTab() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [expanded, setExpanded] = useState(null);
  const [comparing, setComparing] = useState([]);

  const filtered = useMemo(() => {
    let list = BROKERAGES;
    if (category !== "all") list = list.filter(b => b.category === category);
    if (search.trim()) list = list.filter(b =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.tagline.toLowerCase().includes(search.toLowerCase())
    );
    return [...list].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "min") {
        const aMin = parseFloat(a.minDeposit.replace(/[^0-9.]/g, "")) || 0;
        const bMin = parseFloat(b.minDeposit.replace(/[^0-9.]/g, "")) || 0;
        return aMin - bMin;
      }
      return 0;
    });
  }, [category, search, sortBy]);

  const toggleCompare = (id) => {
    setComparing(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {/* Category pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: `1px solid ${category === cat.id ? G : B}`,
                background: category === cat.id ? "rgba(201,169,110,0.12)" : "transparent",
                color: category === cat.id ? G : TX3, cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {cat.label} <span style={{ opacity: 0.6 }}>({cat.count})</span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 160, position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: TX3 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search brokerages…"
            style={{
              width: "100%", background: S, border: `1px solid ${B}`, borderRadius: 8,
              padding: "7px 10px 7px 30px", fontSize: 12, color: TX1, outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            background: S, border: `1px solid ${B}`, borderRadius: 8,
            padding: "7px 12px", fontSize: 12, color: TX2, cursor: "pointer",
          }}
        >
          <option value="name">Sort: A–Z</option>
          <option value="min">Sort: Min Deposit</option>
        </select>
      </div>

      {/* Compare notice */}
      {comparing.length > 0 && (
        <div style={{
          background: "rgba(201,169,110,0.08)", border: `1px solid rgba(201,169,110,0.2)`,
          borderRadius: 8, padding: "10px 14px", marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 12, color: G, fontWeight: 600 }}>
            Comparing: {comparing.map(id => BROKERAGES.find(b => b.id === id)?.name).join(" vs ")}
          </span>
          <span style={{ fontSize: 11, color: TX3 }}>Select up to 3 · Switch to Compare tab to see full comparison</span>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(b => (
          <BrokerageCard
            key={b.id}
            b={b}
            expanded={expanded === b.id}
            onToggle={() => setExpanded(expanded === b.id ? null : b.id)}
            comparing={comparing.includes(b.id)}
            onToggleCompare={() => toggleCompare(b.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: TX3, fontSize: 13 }}>
            No brokerages match your search.
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Compare Tab ───────────────────────────────────────── */
function CompareTab() {
  const [selected, setSelected] = useState(["fidelity", "schwab", "ibkr"]);

  const brokers = selected.map(id => BROKERAGES.find(b => b.id === id)).filter(Boolean);

  const METRICS = [
    { key: "stockTrades", label: "Stock Trades" },
    { key: "optionTrades", label: "Options" },
    { key: "minDeposit", label: "Min Deposit" },
    { key: "research", label: "Research", score: true },
    { key: "tools", label: "Platform Tools", score: true },
    { key: "mobile", label: "Mobile", score: true },
    { key: "education", label: "Education", score: true },
    { key: "customerService", label: "Customer Service", score: true },
    { key: "ease", label: "Ease of Use", score: true },
  ];

  const radarData = brokers.length > 0 ? [
    { metric: "Research", ...Object.fromEntries(brokers.map(b => [b.name.split(" ")[0], b.research])) },
    { metric: "Tools", ...Object.fromEntries(brokers.map(b => [b.name.split(" ")[0], b.tools])) },
    { metric: "Mobile", ...Object.fromEntries(brokers.map(b => [b.name.split(" ")[0], b.mobile])) },
    { metric: "Education", ...Object.fromEntries(brokers.map(b => [b.name.split(" ")[0], b.education])) },
    { metric: "Service", ...Object.fromEntries(brokers.map(b => [b.name.split(" ")[0], b.customerService])) },
    { metric: "Ease", ...Object.fromEntries(brokers.map(b => [b.name.split(" ")[0], b.ease])) },
  ] : [];

  const COLORS = [G, T, "#818cf8"];

  return (
    <div>
      {/* Selector */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 11, color: TX3, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Brokerage {i + 1}</div>
            <select
              value={selected[i] || ""}
              onChange={e => {
                const next = [...selected];
                next[i] = e.target.value;
                setSelected(next);
              }}
              style={{
                width: "100%", background: S, border: `1px solid ${B}`, borderRadius: 8,
                padding: "9px 12px", fontSize: 12, color: TX1, cursor: "pointer",
              }}
            >
              <option value="">— Select —</option>
              {BROKERAGES.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {brokers.length > 0 && (
        <>
          {/* Radar chart */}
          <div className="t-card" style={{ marginBottom: 20, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TX1, marginBottom: 16 }}>Platform Comparison Radar</div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-c)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: TX2 }} />
                {brokers.map((b, i) => (
                  <Radar
                    key={b.id}
                    name={b.name.split(" ")[0]}
                    dataKey={b.name.split(" ")[0]}
                    stroke={COLORS[i]}
                    fill={COLORS[i]}
                    fillOpacity={0.12}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: S, border: `1px solid ${B}`, borderRadius: 8, fontSize: 11, color: "var(--text-1)" }} itemStyle={{ color: "var(--text-1)" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison table */}
          <div className="t-card" style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, color: TX3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${B}` }}>
                    Category
                  </th>
                  {brokers.map(b => (
                    <th key={b.id} style={{ textAlign: "center", padding: "10px 16px", borderBottom: `1px solid ${B}` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: TX1 }}>{b.name}</div>
                        </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map(m => (
                  <tr key={m.key} style={{ borderBottom: `1px solid var(--elevated)` }}>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: TX2 }}>{m.label}</td>
                    {brokers.map(b => (
                      <td key={b.id} style={{ padding: "10px 16px", textAlign: "center" }}>
                        {m.score ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                            <div style={{
                              width: `${(b[m.key] / 5) * 60}px`, height: 5, borderRadius: 3,
                              background: b[m.key] >= 4.5 ? "var(--up)" : b[m.key] >= 3 ? G : "var(--down)",
                            }} />
                            <span style={{ fontSize: 11, color: TX2, fontWeight: 600 }}>{b[m.key]}/5</span>
                          </div>
                        ) : (
                          <span style={{
                            fontSize: 12, fontWeight: 600,
                            color: b[m.key] === "$0" || b[m.key] === "N/A (managed)" ? "var(--up)" : TX1,
                          }}>{b[m.key]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Account types */}
                <tr style={{ borderBottom: `1px solid var(--elevated)` }}>
                  <td style={{ padding: "10px 16px", fontSize: 12, color: TX2 }}>Account Types</td>
                  {brokers.map(b => (
                    <td key={b.id} style={{ padding: "10px 16px", textAlign: "center" }}>
                      <span style={{ fontSize: 11, color: TX3 }}>{b.accountTypes.length} types</span>
                    </td>
                  ))}
                </tr>
                {/* Verdict */}
                <tr>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: TX2, fontWeight: 700 }}>Verdict</td>
                  {brokers.map(b => (
                    <td key={b.id} style={{ padding: "12px 16px", textAlign: "center" }}>
                      <p style={{ fontSize: 11, color: TX2, lineHeight: 1.5, margin: 0 }}>{b.verdict}</p>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Find My Brokerage (Questionnaire) ─────────────────── */
const QUESTIONS = [
  {
    id: "advisor",
    q: "How do you want to manage your investments?",
    sub: "This is the most important question — it shapes everything else.",
    options: [
      { label: "100% Self-Directed — I make all my own decisions", value: "diy", icon: Monitor },
      { label: "Robo-Advisor — Automate it, I don't want to think about it", value: "robo", icon: Cpu },
      { label: "Hybrid — Mostly self-directed but want advisor access occasionally", value: "hybrid", icon: Users },
      { label: "Dedicated 1-on-1 Human Financial Advisor — I want a real person managing my plan", value: "full_service", icon: Briefcase },
    ],
  },
  {
    id: "needs",
    q: "What best describes your financial needs?",
    sub: "Be honest — the more complex your situation, the more guidance you may need.",
    options: [
      { label: "Simple — I just want to buy stocks/ETFs/funds", value: "simple", icon: BarChart2 },
      { label: "Retirement focused — 401k rollovers, IRAs, long-term growth", value: "retirement", icon: Umbrella },
      { label: "Active trading — options, margin, frequent buying & selling", value: "trading", icon: Zap },
      { label: "Comprehensive — investments + insurance + taxes + estate planning all in one", value: "comprehensive", icon: Landmark },
    ],
  },
  {
    id: "experience",
    q: "What's your investing experience level?",
    options: [
      { label: "Complete Beginner — I'm just getting started", value: "beginner", icon: TrendingUp },
      { label: "Some Experience — 1 to 3 years of investing", value: "intermediate", icon: BarChart2 },
      { label: "Experienced — 3 to 10 years, comfortable with markets", value: "experienced", icon: Briefcase },
      { label: "Professional / Expert — I know what I'm doing", value: "expert", icon: Target },
    ],
  },
  {
    id: "amount",
    q: "How much are you starting with or currently have invested?",
    options: [
      { label: "Under $5,000 — Just getting started", value: "small", icon: DollarSign },
      { label: "$5,000 – $50,000 — Building my portfolio", value: "medium", icon: Wallet },
      { label: "$50,000 – $250,000 — Established investor", value: "large", icon: Star },
      { label: "Over $250,000 — Significant wealth to manage", value: "xlarge", icon: Award },
    ],
  },
  {
    id: "priority",
    q: "What matters most to you in a brokerage?",
    options: [
      { label: "Lowest fees — I want to keep every dollar I earn", value: "fees", icon: DollarSign },
      { label: "Best research & tools — I want professional-grade data", value: "research", icon: Search },
      { label: "Simplicity — Easy to use, no complexity", value: "simplicity", icon: Star },
      { label: "A long-term relationship with a trusted advisor I can call", value: "relationship", icon: Users },
    ],
  },
  {
    id: "complexity",
    q: "How complex is your overall financial picture?",
    sub: "Think beyond just investing — consider your full financial life.",
    options: [
      { label: "Simple — Single income, no major assets beyond basic savings", value: "simple", icon: Smile },
      { label: "Moderate — Some retirement accounts, maybe a home or small business", value: "moderate", icon: Home },
      { label: "Complex — Multiple accounts, business income, estate concerns, insurance needs", value: "complex", icon: Layers },
      { label: "Very complex — Multi-generational wealth, trusts, significant assets, tax strategy critical", value: "very_complex", icon: Landmark },
    ],
  },
];

function scoreMatch(broker, answers) {
  let score = 0;
  const { advisor, needs, experience, amount, priority, complexity } = answers;

  // ── Advisor preference (most heavily weighted) ──────────────────
  if (advisor === "diy") {
    if (["fidelity","schwab","etrade","ibkr","webull","merrill"].includes(broker.id)) score += 4;
    if (["ameriprise","raymondjames","wellsfargo","jpmorgan"].includes(broker.id)) score -= 3;
    if (broker.category === "robo") score -= 1;
  } else if (advisor === "robo") {
    if (broker.category === "robo") score += 5;
    if (["sofi-auto"].includes(broker.id)) score += 3;
    if (["ameriprise","raymondjames","wellsfargo","jpmorgan","ibkr"].includes(broker.id)) score -= 3;
  } else if (advisor === "hybrid") {
    if (["fidelity","schwab","merrill","etrade","jpmorgan"].includes(broker.id)) score += 4;
    if ([].includes(broker.id)) score += 2;
    if (["robinhood"].includes(broker.id)) score -= 1;
  } else if (advisor === "full_service") {
    if (["ameriprise","raymondjames","wellsfargo","merrill","jpmorgan"].includes(broker.id)) score += 6;
    if (broker.category === "robo") score -= 4;
    if (["robinhood","webull"].includes(broker.id)) score -= 4;
  }

  // ── Financial needs ─────────────────────────────────────────────
  if (needs === "simple") {
    if (["fidelity","robinhood","schwab","webull","sofi-auto"].includes(broker.id)) score += 3;
  } else if (needs === "retirement") {
    if (["fidelity","schwab","merrill","ameriprise","raymondjames"].includes(broker.id)) score += 3;
  } else if (needs === "trading") {
    if (["ibkr","webull","etrade","schwab"].includes(broker.id)) score += 4;
    if (["ameriprise","raymondjames","wellsfargo"].includes(broker.id)) score -= 2;
  } else if (needs === "comprehensive") {
    if (["ameriprise","raymondjames","wellsfargo","merrill","jpmorgan"].includes(broker.id)) score += 5;
    if (["fidelity","schwab"].includes(broker.id)) score += 1;
    if (["robinhood","webull"].includes(broker.id)) score -= 3;
  }

  // ── Experience ──────────────────────────────────────────────────
  if (experience === "beginner") {
    if (["fidelity","robinhood","sofi-auto","ameriprise","raymondjames","wellsfargo"].includes(broker.id)) score += 2;
    if (["ibkr"].includes(broker.id)) score -= 2;
  } else if (experience === "intermediate") {
    if (["fidelity","schwab","etrade","merrill"].includes(broker.id)) score += 2;
  } else if (experience === "expert") {
    if (["ibkr","schwab"].includes(broker.id)) score += 3;
    if (["robinhood"].includes(broker.id)) score -= 1;
  }

  // ── Investment amount ───────────────────────────────────────────
  if (amount === "small") {
    if (["fidelity","robinhood","webull","sofi-auto"].includes(broker.id)) score += 2;
    if (["ameriprise","raymondjames","wellsfargo"].includes(broker.id)) score -= 2;
  } else if (amount === "medium") {
    if (["fidelity","schwab","etrade"].includes(broker.id)) score += 2;
  } else if (amount === "large") {
    if (["fidelity","schwab","ibkr","merrill","jpmorgan"].includes(broker.id)) score += 3;
    if (["ameriprise","raymondjames","wellsfargo"].includes(broker.id)) score += 2;
  } else if (amount === "xlarge") {
    if (["ameriprise","raymondjames","wellsfargo","merrill","jpmorgan","ibkr","fidelity","schwab"].includes(broker.id)) score += 4;
    if (["robinhood","sofi-auto"].includes(broker.id)) score -= 2;
  }

  // ── Priority ────────────────────────────────────────────────────
  if (priority === "fees") {
    if (["fidelity","webull","robinhood","sofi-auto","schwab"].includes(broker.id)) score += 3;
    if (["ameriprise","raymondjames","wellsfargo"].includes(broker.id)) score -= 2;
  } else if (priority === "research") {
    if (["fidelity","schwab","ibkr","merrill","etrade","raymondjames"].includes(broker.id)) score += 3;
  } else if (priority === "simplicity") {
    if (["robinhood","sofi-auto"].includes(broker.id)) score += 3;
  } else if (priority === "relationship") {
    if (["ameriprise","raymondjames","wellsfargo","merrill","jpmorgan"].includes(broker.id)) score += 5;
    if (broker.category === "robo") score -= 3;
    if (["robinhood","webull"].includes(broker.id)) score -= 3;
  }

  // ── Financial complexity ─────────────────────────────────────────
  if (complexity === "simple") {
    if (["robinhood","fidelity","schwab","webull","sofi-auto"].includes(broker.id)) score += 2;
    if (["ameriprise","raymondjames","wellsfargo"].includes(broker.id)) score -= 1;
  } else if (complexity === "moderate") {
    if (["fidelity","schwab","merrill","etrade"].includes(broker.id)) score += 2;
  } else if (complexity === "complex") {
    if (["ameriprise","raymondjames","merrill","jpmorgan","fidelity","schwab","ibkr"].includes(broker.id)) score += 3;
    if (["robinhood"].includes(broker.id)) score -= 2;
  } else if (complexity === "very_complex") {
    if (["ameriprise","raymondjames","wellsfargo","merrill","jpmorgan"].includes(broker.id)) score += 5;
    if (["ibkr","fidelity","schwab"].includes(broker.id)) score += 1;
    if (broker.category === "robo") score -= 3;
    if (["robinhood","webull"].includes(broker.id)) score -= 4;
  }

  return score;
}

function FindTab() {
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [results, setResults] = useState(null);

  const currentQ = QUESTIONS[step];

  const handleAnswer = (qid, val) => {
    const newAnswers = { ...answers, [qid]: val };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 200);
    } else {
      // Score all brokers
      const scored = BROKERAGES.map(b => ({ ...b, match: scoreMatch(b, newAnswers) }));
      scored.sort((a, b) => b.match - a.match);
      setResults(scored.slice(0, 4));
    }
  };

  const reset = () => { setAnswers({}); setStep(0); setResults(null); };

  if (results) {
    return (
      <div>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}><Target size={28} color={G} /></div>
          <div style={{ fontSize: 20, fontWeight: 700, color: TX1, marginBottom: 6 }}>Your Top 4 Brokerages</div>
          <div style={{ fontSize: 13, color: TX3 }}>Based on your answers — listed in no particular order</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 24 }}>
          {results.map((b, i) => (
            <div key={b.id} style={{
              background: S, border: `1px solid ${B}`, borderRadius: 12, padding: 18,
              position: "relative",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 9,
                  background: b.logoImg ? "#fff" : b.logoColor + "22",
                  border: `1px solid ${b.logoImg ? "#ddd" : b.logoColor + "44"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                }}>
                  {b.logoImg
                    ? <img src={b.logoImg} alt={b.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
                    : <span style={{ fontSize: 12, fontWeight: 800, color: b.logoColor }}>{b.logo}</span>
                  }
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TX1 }}>{b.name}</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: TX2, lineHeight: 1.6, marginBottom: 10 }}>{b.verdict}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {b.bestFor.slice(0, 3).map(f => (
                  <span key={f} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: "rgba(201,169,110,0.08)", border: `1px solid rgba(201,169,110,0.15)`, color: G }}>{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "10px 24px", borderRadius: 8, background: "transparent",
              border: `1px solid ${B}`, color: TX2, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const progress = (step / QUESTIONS.length) * 100;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Progress */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: TX3 }}>Question {step + 1} of {QUESTIONS.length}</span>
          <span style={{ fontSize: 11, color: G, fontWeight: 600 }}>{Math.round(progress)}% Complete</span>
        </div>
        <div style={{ height: 4, background: "var(--border-c)", borderRadius: 2 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: G, borderRadius: 2, transition: "width 0.3s" }} />
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: TX1, lineHeight: 1.4, marginBottom: currentQ.sub ? 8 : 0 }}>{currentQ.q}</div>
        {currentQ.sub && (
          <div style={{ fontSize: 13, color: TX3, lineHeight: 1.5 }}>{currentQ.sub}</div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {currentQ.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(currentQ.id, opt.value)}
            style={{
              padding: "18px 16px", borderRadius: 10, textAlign: "left",
              background: answers[currentQ.id] === opt.value ? "rgba(201,169,110,0.1)" : S,
              border: `1px solid ${answers[currentQ.id] === opt.value ? G : B}`,
              cursor: "pointer", transition: "all 0.15s",
              display: "flex", flexDirection: "column", gap: 6,
            }}
          >
            {(() => { const OIcon = opt.icon; return <OIcon size={22} color={answers[currentQ.id] === opt.value ? G : TX2} />; })()}
            <span style={{ fontSize: 13, fontWeight: 600, color: TX1 }}>{opt.label}</span>
          </button>
        ))}
      </div>

      {step > 0 && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={() => setStep(s => s - 1)} style={{ background: "none", border: "none", color: TX3, fontSize: 12, cursor: "pointer" }}>
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Fee Calculator Tab ────────────────────────────────── */
function FeesTab() {
  const [tradesPerMonth, setTradesPerMonth] = useState(10);
  const [avgTradeSize, setAvgTradeSize] = useState(5000);
  const [optionContracts, setOptionContracts] = useState(5);
  const [investmentAmount, setInvestmentAmount] = useState(25000);
  const [years, setYears] = useState(10);

  const CALC_BROKERS = [
    { id: "fidelity", name: "Fidelity", stockFee: 0, optionFee: 0.65, managementFee: 0 },
    { id: "schwab", name: "Schwab", stockFee: 0, optionFee: 0.65, managementFee: 0 },
    { id: "ibkr", name: "IBKR Pro", stockFee: 0.005, optionFee: 0.65, managementFee: 0 },
    { id: "robinhood", name: "Robinhood", stockFee: 0, optionFee: 0, managementFee: 0 },
    { id: "sofi", name: "SoFi Auto", stockFee: 0, optionFee: 0, managementFee: 0 },
  ];

  const calcAnnual = (b) => {
    let cost = 0;
    const shareQuantity = avgTradeSize * 0.01;
    if (b.stockFee > 0) cost += tradesPerMonth * 12 * b.stockFee * shareQuantity;
    cost += optionContracts * 12 * b.optionFee;
    cost += investmentAmount * b.managementFee;
    return cost;
  };

  const calcTenYear = (b) => {
    const annual = calcAnnual(b);
    return annual * years;
  };

  const data = CALC_BROKERS.map(b => ({
    name: b.name,
    annual: Math.round(calcAnnual(b)),
    tenYear: Math.round(calcTenYear(b)),
  })).sort((a, b) => a.annual - b.annual);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Inputs */}
        <div className="t-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TX1, marginBottom: 16 }}>Your Trading Profile</div>
          {[
            { label: "Stock Trades / Month", val: tradesPerMonth, set: setTradesPerMonth, min: 0, max: 200, step: 1, format: v => `${v} trades` },
            { label: "Avg Trade Size ($)", val: avgTradeSize, set: setAvgTradeSize, min: 100, max: 100000, step: 500, format: v => `$${v.toLocaleString()}` },
            { label: "Option Contracts / Month", val: optionContracts, set: setOptionContracts, min: 0, max: 200, step: 1, format: v => `${v} contracts` },
            { label: "Portfolio / Investment ($)", val: investmentAmount, set: setInvestmentAmount, min: 1000, max: 1000000, step: 1000, format: v => `$${v.toLocaleString()}` },
            { label: "Time Horizon (Years)", val: years, set: setYears, min: 1, max: 30, step: 1, format: v => `${v} years` },
          ].map(({ label, val, set, min, max, step, format }) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: TX3 }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: G }}>{format(val)}</span>
              </div>
              <input
                type="range" min={min} max={max} step={step} value={val}
                onChange={e => set(Number(e.target.value))}
                style={{ width: "100%", accentColor: G }}
              />
            </div>
          ))}
        </div>

        {/* Results */}
        <div className="t-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TX1, marginBottom: 4 }}>Estimated Annual Cost</div>
          <div style={{ fontSize: 11, color: TX3, marginBottom: 16 }}>Based on your trading profile</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: TX3 }} tickFormatter={v => `$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: TX2 }} width={80} />
              <Tooltip
                contentStyle={{ background: S, border: `1px solid ${B}`, borderRadius: 8, fontSize: 11, color: "var(--text-1)" }}
                itemStyle={{ color: "var(--text-1)" }}
                formatter={v => [`$${v.toLocaleString()}`, "Annual Cost"]}
              />
              <Bar dataKey="annual" fill={G} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full table */}
      <div className="t-card" style={{ overflow: "auto" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${B}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TX1 }}>Fee Breakdown by Brokerage</div>
          <div style={{ fontSize: 11, color: TX3, marginTop: 2 }}>All costs estimated based on your inputs above</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Brokerage", "Annual Cost", `${years}-Year Total`, "Savings vs Most Expensive"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: h === "Brokerage" ? "left" : "center", fontSize: 11, color: TX3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${B}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const maxAnnual = Math.max(...data.map(d => d.annual));
              const savings = maxAnnual - row.annual;
              return (
                <tr key={row.name} style={{ borderBottom: `1px solid var(--elevated)`, background: i === 0 ? "rgba(45,212,164,0.03)" : "transparent" }}>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {i === 0 && <span style={{ fontSize: 9, background: "var(--up)", color: "#000", padding: "2px 6px", borderRadius: 10, fontWeight: 800 }}>CHEAPEST</span>}
                      <span style={{ fontSize: 13, fontWeight: 600, color: TX1 }}>{row.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "center", fontSize: 13, fontWeight: 700, color: row.annual === 0 ? "var(--up)" : TX1 }}>
                    {row.annual === 0 ? "Free" : `$${row.annual.toLocaleString()}`}
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "center", fontSize: 13, color: TX2 }}>
                    {row.tenYear === 0 ? "Free" : `$${row.tenYear.toLocaleString()}`}
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: savings > 0 ? "var(--up)" : TX3 }}>
                      {savings > 0 ? `+$${savings.toLocaleString()} saved` : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Education Tab ─────────────────────────────────────── */
const EDU_TOPICS = [
  {
    category: "Getting Started",
    icon: TrendingUp,
    articles: [
      { title: "What is a Brokerage Account?", time: "4 min", difficulty: "Beginner", summary: "A brokerage account is a taxable investment account where you can buy and sell securities like stocks, ETFs, and bonds. Unlike retirement accounts, you can withdraw money anytime — but you'll owe taxes on gains." },
      { title: "Taxable vs. Tax-Advantaged Accounts", time: "6 min", difficulty: "Beginner", summary: "IRAs and 401(k)s grow tax-deferred or tax-free. Taxable brokerage accounts have no tax advantages but have no contribution limits. Understanding when to use each is one of the most powerful wealth-building decisions you can make." },
      { title: "How to Open a Brokerage Account", time: "5 min", difficulty: "Beginner", summary: "Opening a brokerage account takes 5-10 minutes online. You'll need your Social Security number, bank account info, and basic personal details. Most major brokers have no minimum deposit." },
      { title: "Understanding Order Types: Market, Limit, Stop", time: "8 min", difficulty: "Beginner", summary: "Market orders execute immediately at current price. Limit orders only execute at your price or better. Stop orders become market orders when a price threshold is reached. Choosing the right order type can save you significant money." },
    ],
  },
  {
    category: "Account Types",
    icon: FileText,
    articles: [
      { title: "Traditional IRA vs. Roth IRA", time: "7 min", difficulty: "Beginner", summary: "Traditional IRA: tax deduction now, pay taxes in retirement. Roth IRA: no deduction now, tax-free in retirement. Generally, if you're young or in a lower tax bracket, the Roth wins. The 2024 contribution limit is $7,000 ($8,000 if 50+)." },
      { title: "SEP IRA for Self-Employed", time: "5 min", difficulty: "Intermediate", summary: "A SEP IRA lets self-employed individuals contribute up to 25% of compensation or $69,000 (2024) — whichever is less. It's the simplest high-limit retirement account for freelancers and business owners." },
      { title: "Custodial Accounts for Kids (UGMA/UTMA)", time: "6 min", difficulty: "Intermediate", summary: "Open a custodial account and start your child's wealth journey early. Money grows at a preferential tax rate ('kiddie tax') until 18-21. Investing $100/month from birth at 7% produces $96,000 by age 18." },
      { title: "Solo 401(k): The Self-Employed Superpower", time: "8 min", difficulty: "Advanced", summary: "A Solo 401(k) allows both employee ($23,000) and employer contributions (25% of compensation), up to $69,000 total in 2024. It's the most powerful retirement vehicle for self-employed individuals." },
    ],
  },
  {
    category: "Understanding Fees",
    icon: DollarSign,
    articles: [
      { title: "The True Cost of Commissions", time: "5 min", difficulty: "Beginner", summary: "Before 2019, commissions of $4.95-$9.99 per trade were standard. On 10 trades/month, that's $1,200/year — before any gains. The zero-commission revolution changed everything. But other fees still exist." },
      { title: "Expense Ratios: The Silent Fee That Matters Most", time: "6 min", difficulty: "Beginner", summary: "Expense ratios compound silently. A 1% fee vs a 0.03% fee on $100K over 30 years = $600,000 difference. Vanguard's Total Market ETF (VTI) charges 0.03%. Many actively managed funds charge 0.5-1.5%." },
      { title: "Payment for Order Flow (PFOF) Explained", time: "7 min", difficulty: "Intermediate", summary: "PFOF is how 'free' brokers make money. They route your orders to market makers who pay them — and may execute your trade at a slightly worse price. Fidelity and Public.com avoid PFOF. The difference is typically small but real." },
      { title: "Margin Interest: The True Cost of Leverage", time: "8 min", difficulty: "Advanced", summary: "Borrowing to invest (margin) costs 4-13% APR at most brokers. Interactive Brokers charges as low as 5.33%. On $50K margin for 1 year: Robinhood charges ~$3,750 vs IBKR's ~$2,665. Always know your true borrowing cost." },
    ],
  },
  {
    category: "Investment Vehicles",
    icon: BarChart2,
    articles: [
      { title: "ETFs vs. Mutual Funds vs. Individual Stocks", time: "9 min", difficulty: "Beginner", summary: "ETFs trade like stocks, have low fees, and provide instant diversification. Mutual funds are priced once daily and may have minimums. Individual stocks offer upside and risk concentration. Most investors should hold mostly ETFs." },
      { title: "REITs: Real Estate in Your Brokerage Account", time: "7 min", difficulty: "Intermediate", summary: "Real Estate Investment Trusts trade on exchanges and must distribute 90% of income as dividends. They provide real estate exposure without owning property. Note: REIT dividends are typically taxed as ordinary income." },
      { title: "Options 101: Calls, Puts, and Spreads", time: "12 min", difficulty: "Advanced", summary: "A call option gives you the right to buy 100 shares at a strike price by expiration. A put gives the right to sell. Covered calls and cash-secured puts are relatively conservative. Never buy naked options without understanding theta decay." },
      { title: "Bonds and Fixed Income in Your Portfolio", time: "8 min", difficulty: "Intermediate", summary: "Bonds provide income and stability. Short-term Treasuries (T-bills) are yielding 4-5% with zero credit risk. Corporate bonds pay more with credit risk. A classic 60/40 portfolio smooths returns by mixing equities with bonds." },
    ],
  },
  {
    category: "Tax Strategy",
    icon: Shield,
    articles: [
      { title: "Tax-Loss Harvesting: Turn Losses Into Wins", time: "8 min", difficulty: "Intermediate", summary: "Selling positions at a loss to offset capital gains can save you thousands per year. Betterment and Wealthfront do this automatically. The wash-sale rule prevents buying the same security within 30 days." },
      { title: "Long-Term vs Short-Term Capital Gains", time: "6 min", difficulty: "Beginner", summary: "Holding a position for 12+ months qualifies you for long-term capital gains rates (0%, 15%, or 20% depending on income) vs. short-term rates (ordinary income, up to 37%). Holding one more day can save thousands." },
      { title: "Backdoor Roth IRA Strategy", time: "10 min", difficulty: "Advanced", summary: "High earners can't contribute directly to a Roth IRA. The backdoor Roth involves contributing to a Traditional IRA (no deduction) and immediately converting to Roth. Beware the pro-rata rule if you have other IRA balances." },
    ],
  },
];

function EducationTab() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [expandedArticle, setExpandedArticle] = useState(null);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>
        {/* Category sidebar */}
        <div>
          {EDU_TOPICS.map((topic, i) => (
            <button
              key={i}
              onClick={() => { setActiveCategory(i); setExpandedArticle(null); }}
              style={{
                width: "100%", textAlign: "left", padding: "10px 14px",
                borderRadius: 8, marginBottom: 4, cursor: "pointer",
                background: activeCategory === i ? "rgba(201,169,110,0.1)" : "transparent",
                border: `1px solid ${activeCategory === i ? G : "transparent"}`,
                color: activeCategory === i ? G : TX2, fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
              }}
            >
              {(() => { const TIcon = topic.icon; return <TIcon size={13} />; })()}
              {topic.category}
            </button>
          ))}
        </div>

        {/* Articles */}
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: TX1, marginBottom: 4 }}>
            {(() => { const AIcon = EDU_TOPICS[activeCategory].icon; return <><AIcon size={15} style={{ marginRight: 6, verticalAlign: "middle" }} /> {EDU_TOPICS[activeCategory].category}</>; })()}
          </div>
          <div style={{ fontSize: 12, color: TX3, marginBottom: 16 }}>
            {EDU_TOPICS[activeCategory].articles.length} articles
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {EDU_TOPICS[activeCategory].articles.map((article, i) => (
              <div
                key={i}
                style={{
                  background: S, border: `1px solid ${expandedArticle === i ? G : B}`,
                  borderRadius: 10, overflow: "hidden",
                }}
              >
                <div
                  onClick={() => setExpandedArticle(expandedArticle === i ? null : i)}
                  style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TX1, marginBottom: 4 }}>{article.title}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 10, color: TX3 }}>⏱ {article.time} read</span>
                      <span style={{
                        fontSize: 10, padding: "1px 7px", borderRadius: 10,
                        background: article.difficulty === "Beginner" ? "rgba(45,212,164,0.1)" : article.difficulty === "Advanced" ? "rgba(239,68,68,0.1)" : "rgba(201,169,110,0.1)",
                        color: article.difficulty === "Beginner" ? "var(--up)" : article.difficulty === "Advanced" ? "var(--down)" : G,
                        fontWeight: 600,
                      }}>
                        {article.difficulty}
                      </span>
                    </div>
                  </div>
                  {expandedArticle === i ? <ChevronUp size={14} color={TX3} /> : <ChevronRight size={14} color={TX3} />}
                </div>
                {expandedArticle === i && (
                  <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${B}` }}>
                    <p style={{ fontSize: 13, color: TX2, lineHeight: 1.75, margin: "14px 0 0" }}>{article.summary}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────── */
export default function BrokerageGuide() {
  const [tab, setTab] = useState("overview");

  const stats = [
    { label: "Brokerages Reviewed", value: "27" },
    { label: "Categories", value: "4" },
    { label: "Data Points", value: "200+" },
    { label: "Updated", value: "2025" },
  ];

  return (
    <div>
      {/* ── Hero Banner ── */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        borderRadius: 20, padding: "2rem 2.25rem",
        marginBottom: 24, position: "relative", overflow: "hidden",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 var(--border-c)",
      }}>
        <div style={{ position: "absolute", top: -60, right: -40, width: 320, height: 320, background: "radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 0.625rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ display: "inline-block", width: 18, height: 1, background: "var(--gold)", opacity: 0.6 }} />
            Wealth · Research Platform
          </p>
          <h1 style={{ margin: "0 0 0.75rem", fontSize: "1.35rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em", fontFamily: "'Inter', system-ui, sans-serif" }}>
            Brokerage{" "}
            <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: "var(--gold)", fontWeight: 400, fontSize: "1.5rem" }}>Guide</em>
          </h1>
          <p style={{ fontSize: 13, color: TX2, lineHeight: 1.7, maxWidth: 600, margin: "0 0 1.25rem" }}>
            The most comprehensive brokerage research platform available to retail investors. Compare 27 brokerages across fees, tools, account types, and suitability. Find the right brokerage for your exact situation — or compare multiple side-by-side with our interactive tools.
          </p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {stats.map(({ label, value }) => (
              <div key={label} style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 8, padding: "0.5rem 0.875rem" }}>
                <div className="t-mono" style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--gold)", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 10, color: TX3, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: "0.25rem", background: "var(--surface)", padding: "0.3rem", borderRadius: 10, border: "1px solid var(--border-c)", overflowX: "auto", backdropFilter: "blur(12px)", marginBottom: 20 }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "0.45rem 0.85rem", borderRadius: 7, border: active ? "1px solid rgba(201,169,110,0.3)" : "1px solid transparent", cursor: "pointer", background: active ? "rgba(201,169,110,0.18)" : "transparent", color: active ? "var(--gold)" : "var(--text-3)", fontWeight: active ? 700 : 500, fontSize: "0.75rem", whiteSpace: "nowrap", flexShrink: 0 }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      {tab === "overview" && <OverviewTab />}
      {tab === "compare"  && <CompareTab />}
      {tab === "find"     && <FindTab />}
      {tab === "fees"     && <FeesTab />}
      {tab === "education" && <EducationTab />}
    </div>
  );
}
