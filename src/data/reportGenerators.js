import { TAX_2026 } from '../config/taxConstants2026';

// ─── Formatting Helpers ───────────────────────────────────────────────────────

const fc = (n) => {
  if (n == null || isNaN(n)) return 'N/A';
  const a = Math.abs(Math.round(n));
  const sign = n < 0 ? '-' : '';
  if (a >= 1e9) return sign + '$' + (a / 1e9).toFixed(1) + 'B';
  if (a >= 1e6) return sign + '$' + (a / 1e6).toFixed(1) + 'M';
  return sign + '$' + new Intl.NumberFormat('en-US').format(a);
};
const fn = (n, d = 0) => n == null || isNaN(n) ? 'N/A' : new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const fp = (n, d = 1) => n == null || isNaN(n) ? 'N/A' : n.toFixed(d) + '%';
const fvL = (pv, r, n) => pv * Math.pow(1 + r, n);
const fvP = (pmt, r, n) => r === 0 ? pmt * n : pmt * (Math.pow(1 + r, n) - 1) / r;
const letterGrade = (s) => s >= 92 ? 'A+' : s >= 88 ? 'A' : s >= 84 ? 'A-' : s >= 80 ? 'B+' : s >= 76 ? 'B' : s >= 72 ? 'B-' : s >= 68 ? 'C+' : s >= 64 ? 'C' : s >= 58 ? 'C-' : s >= 52 ? 'D' : 'F';

const GOLD = '#c9a84c';
const BLUE = '#3b82f6';
const GREEN = '#10b981';
const RED = '#ef4444';
const TEAL = '#14b8a6';
const PURPLE = '#8b5cf6';
const ORANGE = '#f97316';

// ─── Advanced Allocation & Ticker Library ─────────────────────────────────────

const ALLOCATIONS = {
  Conservative: {
    label: 'Conservative (30/60/10)',
    summary: 'Capital preservation with inflation protection. Tilted toward high-quality bonds, short duration, dividend equity, and real assets.',
    core: [
      { asset: 'US Dividend Quality (Core Equity)', alloc: '12%', tickers: 'SCHD, VIG, DGRO', er: '0.06% / 0.06% / 0.08%', notes: 'Quality screen — dividend growth stocks outperform on a risk-adjusted basis vs. pure cap-weight in drawdowns' },
      { asset: 'US Large Cap Value', alloc: '8%', tickers: 'VTV, AVLV, RPV', er: '0.04% / 0.15% / 0.35%', notes: 'Fama-French value premium. VTV = cheap core; AVLV = profitability-screened value (Avantis)' },
      { asset: 'US Low Volatility Factor', alloc: '5%', tickers: 'USMV, SPLV', er: '0.15% / 0.25%', notes: 'Low-vol anomaly: lower-beta stocks historically produce near-market returns with 30–40% less drawdown' },
      { asset: 'Intl Developed (Value Tilt)', alloc: '5%', tickers: 'AVDV, IDVO, EFV', er: '0.36% / 0.55% / 0.37%', notes: 'AVDV = Avantis Intl Small Cap Value — captures value + size + profitability factor in developed ex-US' },
      { asset: 'Core US Aggregate Bond', alloc: '20%', tickers: 'BND, AGG, SCHZ', er: '0.03% / 0.03% / 0.03%', notes: 'Full investment-grade universe. Duration ~6yr. Deflation hedge and flight-to-quality anchor' },
      { asset: 'TIPS (Inflation-Linked)', alloc: '15%', tickers: 'SCHP, VTIP, TIP', er: '0.03% / 0.04% / 0.19%', notes: 'Principal adjusts with CPI. SCHP = intermediate TIPS; VTIP = short-term TIPS (lower duration risk)' },
      { asset: 'Short-Term Treasuries', alloc: '10%', tickers: 'VGSH, SHY, SCHO', er: '0.04% / 0.15% / 0.03%', notes: '1–3yr duration. Near money-market yield with minimal interest rate risk in rising rate environment' },
      { asset: 'Muni Bonds (taxable accts)', alloc: '10%', tickers: 'VTEB, MUB, VWIUX', er: '0.05% / 0.05% / 0.09%', notes: 'Tax-equivalent yield superior to corp bonds at 24%+ marginal rate. VWIUX = intermediate muni (mutual fund)' },
      { asset: 'T-Bills / Money Market', alloc: '5%', tickers: 'SGOV, BIL, SPAXX', er: '0.09% / 0.14% / 0%', notes: 'SGOV = 0–3mo T-bills ETF ~5.1% yield. SPAXX = Fidelity money market. Liquidity reserve' },
      { asset: 'REITs (Real Estate)', alloc: '5%', tickers: 'VNQ, SCHH, O, AMT', er: '0.12% / 0.07% / stock / stock', notes: 'Inflation passthrough via rents. VNQ = diversified; O = Realty Income (monthly div); AMT = cell towers' },
      { asset: 'Gold / Inflation Hedge', alloc: '5%', tickers: 'GLDM, IAU, SGOL', er: '0.10% / 0.25% / 0.17%', notes: 'Non-correlated asset. GLDM = lowest-cost gold ETF. Allocation 5–10% reduces portfolio vol 10–15%' },
    ],
  },
  Moderate: {
    label: 'Moderate (60/30/10)',
    summary: 'Balanced growth and stability. Factor tilts toward value, size, and quality premiums. Diversified across geographies and asset classes with managed alternatives exposure.',
    core: [
      { asset: 'US Total Market (Core)', alloc: '20%', tickers: 'VTI, SCHB, FZROX', er: '0.03% / 0.03% / 0%', notes: 'Cap-weighted US market core. FZROX = Fidelity zero-cost option (no ER). The anchor of any equity portfolio' },
      { asset: 'US Small Cap Value (Factor)', alloc: '12%', tickers: 'AVUV, VBR, IJS, DFSVX', er: '0.25% / 0.07% / 0.18% / 0.22%', notes: 'AVUV = Avantis US Small Cap Value — screens for profitability in addition to value. Captures size + value + quality premiums simultaneously. Highest expected return factor combo historically' },
      { asset: 'US Quality / Momentum Blend', alloc: '8%', tickers: 'QMOM, MTUM, QUAL, DGRW', er: '0.49% / 0.15% / 0.15% / 0.28%', notes: 'QMOM = Alpha Architect quantitative momentum (top 10% winners). QUAL = iShares Quality. Momentum + quality is one of the most robust multi-factor combinations' },
      { asset: 'Intl Developed (Factor)', alloc: '10%', tickers: 'AVDV, DFIV, EFV, VEA', er: '0.36% / 0.18% / 0.37% / 0.06%', notes: 'Split: 60% AVDV (factor-tilted small/value) + 40% VEA (core). Captures international value premium at modest cost' },
      { asset: 'Emerging Markets', alloc: '7%', tickers: 'IEMG, AVEM, VWO, DEM', er: '0.09% / 0.33% / 0.08% / 0.56%', notes: 'AVEM = Avantis EM with factor screen. DEM = WisdomTree EM Dividend (quality filter). EM allocation adds long-run growth premium with higher vol' },
      { asset: 'Intl Small Cap Value', alloc: '3%', tickers: 'AVDV, VSS, DLS', er: '0.36% / 0.07% / 0.58%', notes: 'Highest expected return international bucket — combines size and value premiums across developed ex-US small cap' },
      { asset: 'Core Aggregate Bond', alloc: '12%', tickers: 'BND, AGG, BNDX', er: '0.03% / 0.03% / 0.07%', notes: 'Blend domestic (BND) and international (BNDX) for currency diversification. Core fixed income anchor' },
      { asset: 'TIPS / Inflation Protection', alloc: '8%', tickers: 'SCHP, TIP, FIPDX', er: '0.03% / 0.19% / 0.05%', notes: 'Hedge stagflation risk. SCHP = intermediate TIPS (Schwab, lowest ER in category). 5–15yr TIPS duration is optimal for most investors' },
      { asset: 'Short Duration Bond', alloc: '5%', tickers: 'VGSH, SCHO, JPST', er: '0.04% / 0.03% / 0.18%', notes: 'JPST = JPMorgan Ultra-Short Income (active, ~5.2% yield). Reduces overall portfolio duration and interest rate sensitivity' },
      { asset: 'REITs', alloc: '5%', tickers: 'VNQ, VNQI, XLRE', er: '0.12% / 0.12% / 0.10%', notes: 'VNQ = domestic; VNQI = international REITs (adds global property exposure). REITs have historically beaten core equity on a real return basis in inflationary decades' },
      { asset: 'Managed Futures (Trend-Following)', alloc: '3%', tickers: 'DBMF, CTA, KMLM', er: '0.85% / 0.76% / 0.92%', notes: 'DBMF = iMGP DBi Managed Futures. Near-zero equity correlation. Historically positive in equity bear markets (2000, 2008, 2022). True diversifier' },
      { asset: 'Gold & Commodities', alloc: '7%', tickers: 'GLDM, PDBC, COMT, DJP', er: '0.10% / 0.59% / 0.48% / 0.85%', notes: 'Split: 4% GLDM (pure gold) + 3% PDBC/COMT (broad commodities — energy, metals, agri). Commodity exposure is inflation beta you cannot get elsewhere' },
    ],
  },
  Aggressive: {
    label: 'Aggressive (90/5/5)',
    summary: 'Maximum long-run compounding. Heavy factor tilts toward value, size, profitability, and momentum. Minimal fixed income. Significant alternatives and private market proxies.',
    core: [
      { asset: 'US Total Market (Satellite Core)', alloc: '20%', tickers: 'VTI, FZROX, SCHB', er: '0.03% / 0% / 0.03%', notes: 'Cheap beta base. Keep this large to anchor the factor tilts without excess tracking error vs. benchmarks' },
      { asset: 'US Small Cap Value (Primary Factor)', alloc: '18%', tickers: 'AVUV, DFSV, VBR', er: '0.25% / 0.22% / 0.07%', notes: 'The highest expected-return US equity slice. AVUV screens for profitability — avoids value traps. Dimensional (DFSV) is the institutional-grade alternative. 18% is a meaningful factor tilt without concentration risk' },
      { asset: 'US Momentum', alloc: '10%', tickers: 'QMOM, MTUM, SPMO', er: '0.49% / 0.15% / 0.13%', notes: 'QMOM = Alpha Architect 12-1 momentum (pure factor, no dilution). MTUM = iShares institutional momentum. Momentum + value is historically the best two-factor combination — they are negatively correlated, smoothing each other' },
      { asset: 'US Quality / Profitability', alloc: '7%', tickers: 'QUAL, DGRW, CEFS', er: '0.15% / 0.28% / varies', notes: 'RMW (profitability) factor from Fama-French 5-factor model. QUAL = iShares; DGRW = WisdomTree dividend growth quality screen' },
      { asset: 'Intl Developed Small Cap Value', alloc: '15%', tickers: 'AVDV, DFIV, DLS', er: '0.36% / 0.18% / 0.58%', notes: 'AVDV is the benchmark here — Avantis factor-tilted international small/value. The size and value premium is actually larger outside the US historically. This is where most US investors are underweight' },
      { asset: 'Emerging Markets (Value Tilt)', alloc: '10%', tickers: 'AVEM, DEM, DFEM', er: '0.33% / 0.56% / 0.35%', notes: 'AVEM = Avantis EM — applies value + profitability screen to emerging markets. DEM = WisdomTree EM dividend quality. Long-term EM expected return premium is 2–4% above developed markets' },
      { asset: 'EM Small Cap', alloc: '5%', tickers: 'EEMS, DFES, DGS', er: '0.70% / 0.42% / 0.63%', notes: 'Highest expected return international slice. Combines EM premium + size premium. Illiquidity premium embedded. Appropriate for long time horizons only' },
      { asset: 'Thematic / Sector Concentration', alloc: '5%', tickers: 'QQQM, XLK, IGM, SOXX', er: '0.15% / 0.10% / 0.42% / 0.35%', notes: 'QQQM = Nasdaq-100 (low cost). SOXX = semiconductors (highest revenue/profit growth sector). IGM = tech sector broad. Use for satellite conviction — not core' },
      { asset: 'Minimal Fixed Income (Ballast)', alloc: '5%', tickers: 'SGOV, VGSH, BIL', er: '0.09% / 0.04% / 0.14%', notes: 'Pure T-bills for liquidity and rebalancing dry powder. At aggressive risk tolerance, long-duration bonds are a drag. Keep it short and functional' },
      { asset: 'Managed Futures / Trend', alloc: '3%', tickers: 'DBMF, CTA, KMLM', er: '0.85% / 0.76% / 0.92%', notes: 'Crisis alpha in equity bear markets. Adds genuine diversification — not just low-correlation, but historically positive when equities collapse. 3–5% is the academic sweet spot for Sharpe ratio improvement' },
      { asset: 'Commodities & Real Assets', alloc: '2%', tickers: 'PDBC, COMT, FTGC', er: '0.59% / 0.48% / 0.65%', notes: 'PDBC = PowerShares commodity strategy (highest diversification). Inflation beta unachievable through equity. Use as insurance against commodity supercycles' },
    ],
  },
};

// Individual high-conviction tickers by category
const INCOME_TICKERS = [
  { ticker: 'SCHD', name: 'Schwab US Dividend Equity ETF', er: '0.06%', yield: '~3.5%', notes: 'Best dividend ETF for quality screen — ROE, cash flow, 5yr div growth filters. Outperformed S&P 500 on risk-adjusted basis since inception' },
  { ticker: 'JEPI', name: 'JPMorgan Equity Premium Income', er: '0.35%', yield: '~7–9%', notes: 'Covered call overlay on S&P 500 — generates monthly income. Reduced upside capture (~70%) but significantly lower volatility. Best for income-focused retirees' },
  { ticker: 'DIVO', name: 'Amplify CWP Enhanced Dividend Income', er: '0.55%', yield: '~4.5%', notes: 'Active covered call on 20–25 high-quality dividend stocks. More selective than JEPI — captures more upside while still generating premium income' },
  { ticker: 'O', name: 'Realty Income Corp', er: 'N/A (stock)', yield: '~5.5%', notes: 'The REIT benchmark — monthly dividend, 30yr+ of consecutive increases. Net-lease model (triple-net) means tenants pay taxes, insurance, maintenance. Fortress balance sheet' },
  { ticker: 'PFFD', name: 'Global X US Preferred ETF', er: '0.23%', yield: '~6.5%', notes: 'Preferred stock — senior to common equity, fixed dividend, qualifies for 15/20% tax rate. Ballast between bonds and equities in the capital structure' },
  { ticker: 'XYLD', name: 'Global X S&P 500 Covered Call ETF', er: '0.60%', yield: '~10–12%', notes: 'At-the-money covered calls on SPX monthly. Max income extraction, minimal capital appreciation. Use only if your only goal is cash flow generation' },
];

const LIQUID_YIELD_TICKERS = [
  { ticker: 'SGOV', name: 'iShares 0-3 Month Treasury Bond', er: '0.09%', yield: '~5.1%', notes: 'Most efficient way to hold T-bills. FDIC-level safety (US Gov backed). State tax exempt. Best emergency fund vehicle above HYSA' },
  { ticker: 'USFR', name: 'WisdomTree Floating Rate Treasury', er: '0.15%', yield: '~5.2%', notes: 'Floating rate — adjusts weekly. No duration risk whatsoever. Yield tracks Fed Funds Rate directly. Best for rate-uncertainty environments' },
  { ticker: 'BIL', name: 'SPDR 1-3 Month T-Bill ETF', er: '0.14%', yield: '~5.1%', notes: 'State-tax-exempt, liquid, near-zero duration. Slightly higher ER than SGOV but more established/liquid' },
  { ticker: 'SPAXX', name: 'Fidelity Government Money Market', er: '0%', yield: '~4.96%', notes: 'Fidelity core position default — sweeps idle cash. Government-only (ultra safe). Use as the default parking spot for emergency fund at Fidelity' },
  { ticker: 'VMFXX', name: 'Vanguard Federal Money Market', er: '0.11%', yield: '~5.28%', notes: 'Vanguard equivalent — highest yield in category. Federal portfolio (treasuries + repos). Partial state tax exemption' },
  { ticker: 'JPST', name: 'JPMorgan Ultra-Short Income ETF', er: '0.18%', yield: '~5.3%', notes: 'Active ultra-short duration (0.25yr). Slightly more yield than pure T-bills via corporate paper. Not fully government-backed — appropriate for Tier 2 of emergency fund' },
];

const RETIREMENT_TICKERS = [
  { ticker: 'VTTSX', name: 'Vanguard Target Retirement 2060', er: '0.08%', type: 'Target Date', notes: 'Auto-glide path — starts ~90% equity, shifts to ~30% equity at target date. Set-and-forget. Vanguard\'s target dates use total market + intl + TIPS + bonds' },
  { ticker: 'FXIFX', name: 'Fidelity Freedom Index 2055', er: '0.12%', type: 'Target Date', notes: 'Fidelity index-based target date (not active). Lower cost than active Freedom funds. Uses institutional share classes internally' },
  { ticker: 'SWTSX', name: 'Schwab Target Date 2050', er: '0.08%', type: 'Target Date', notes: 'Schwab index target date — comparable to Vanguard at same cost. Uses Schwab ETFs internally (SCHB, SCHF, SCHZ)' },
  { ticker: 'SCHD', name: 'Schwab US Dividend Equity', er: '0.06%', type: 'Income/Accumulation', notes: 'Ideal for accumulation phase — quality + dividend growth compounds effectively. Dividend reinvestment accelerates position building' },
  { ticker: 'AVUV', name: 'Avantis US Small Cap Value', er: '0.25%', type: 'Factor / Growth', notes: 'Highest expected return equity factor for long time horizons. Adds small cap value premium to 401k if available. Check if offered in plan — sometimes as DFSVX (Dimensional equivalent)' },
  { ticker: 'VBTLX', name: 'Vanguard Total Bond Market Index', er: '0.05%', type: 'Fixed Income', notes: 'Institutional share class bond index for 401k accounts. Full investment-grade universe. The default bond holding in most employer plans' },
  { ticker: 'VTWAX', name: 'Vanguard Total World Stock', er: '0.10%', type: 'Global Core', notes: 'One-fund solution — entire global equity market in one ticker. US (~60%) + international (~40%) at market weight. Simplicity premium for investors who prefer one equity holding' },
];


// ─── College Savings — Target Date Fund Recommendation ───────────────────────
// Recommends the right 529 target date fund based on years to college.

function buildCollegeAllocation(yearsToCollege, childAge) {
  // Determine appropriate allocation level
  let aggressiveness, equityPct, fundFamily, rationale, riskNote;

  if (yearsToCollege >= 14) {
    aggressiveness = 'Aggressive Growth';
    equityPct = '95–100%';
    fundFamily = [
      { name: 'Vanguard 529 Aggressive Growth Portfolio', ticker: 'Equity index blend', er: '~0.08%', note: 'Vanguard total stock + intl stock. Near-100% equity. Maximum compounding with 14+ years to recover any downturn.' },
      { name: 'Fidelity 529 Stock Portfolio', ticker: 'FXAIX blend', er: '~0.12%', note: 'Fidelity 100% equity option. Use when your child is newborn to age 4 — highest growth window.' },
      { name: 'Schwab 529 Aggressive Growth', ticker: 'SCHB + SCHF blend', er: '~0.08%', note: 'Schwab index-based. Low cost, broad equity exposure. Auto-adjusts toward conservative as college approaches if you choose age-based track.' },
    ];
    rationale = `With ${yearsToCollege} years until college, an aggressive all-equity allocation is optimal. A market crash today would fully recover before tuition bills arrive, and the long runway means equities provide the highest expected balance at enrollment.`;
    riskNote = null;
  } else if (yearsToCollege >= 10) {
    aggressiveness = 'Moderately Aggressive';
    equityPct = '75–85%';
    fundFamily = [
      { name: 'Vanguard 529 Moderate Growth Portfolio', ticker: 'VTI/VXUS/BND blend', er: '~0.08%', note: '75% global equity / 25% bond. Begin introducing bonds to reduce timing risk while keeping growth dominant.' },
      { name: 'Fidelity 529 Age-Based Track (Equity-Weighted)', ticker: 'FXIFX / FXAIX mix', er: '~0.12%', note: 'Fidelity\'s equity-weighted age-based path. Starts aggressive and automatically glides toward conservative at enrollment.' },
      { name: 'Utah My529 Aggressive Age-Based', ticker: 'Vanguard funds', er: '~0.10%', note: 'Utah My529 is among the top-rated 529 plans nationally — available to all states. Aggressive age-based track.' },
    ];
    rationale = `At ${yearsToCollege} years out, you can still hold predominantly equities but should begin introducing bonds to soften the impact of a market downturn in years 8–10. An age-based fund that auto-adjusts each year handles this automatically.`;
    riskNote = null;
  } else if (yearsToCollege >= 6) {
    aggressiveness = 'Moderate';
    equityPct = '50–65%';
    fundFamily = [
      { name: 'Vanguard 529 Conservative Growth Portfolio', ticker: 'VTI/VXUS/BND blend', er: '~0.08%', note: '60% equity / 40% bond. Balanced approach — still enough equity for growth but bonds reduce risk of a bad market year at enrollment.' },
      { name: 'Schwab 529 Moderate Age-Based', ticker: 'SCHB + BND mix', er: '~0.09%', note: 'Schwab\'s moderate path. Automatically de-risks as college approaches. Good middle-ground for 6–9 year horizons.' },
      { name: 'Fidelity 529 Balanced Portfolio', ticker: 'FBALX equivalent', er: '~0.13%', note: 'Actively managed balanced fund inside 529. Slightly higher cost but managed drawdown risk.' },
    ];
    rationale = `With ${yearsToCollege} years until enrollment, a balanced allocation protects against a major market decline while still capturing equity growth. A 2-standard-deviation downturn year right before college could permanently impair a 100% equity portfolio at this horizon.`;
    riskNote = null;
  } else if (yearsToCollege >= 3) {
    aggressiveness = 'Conservative';
    equityPct = '25–40%';
    fundFamily = [
      { name: 'Vanguard 529 Income Portfolio', ticker: 'BND/TIPS dominant', er: '~0.07%', note: 'Primarily bonds and stable value. Protects accumulated balance from market swings when tuition bills are imminent.' },
      { name: 'FDIC-Insured 529 Option (Bank-Held)', ticker: 'Savings / CD equivalent', er: '0%', note: 'Many 529 plans offer FDIC-insured bank option — appropriate for 3 year final runway. Sacrifice growth for guaranteed principal.' },
      { name: 'Schwab 529 Conservative Age-Based', ticker: 'BSV + SCHZ dominant', er: '~0.07%', note: 'Schwab\'s conservative track. Minimal equity, high bond allocation. Right choice when you need the money in 3–5 years.' },
    ];
    rationale = `Only ${yearsToCollege} years until college — capital preservation is the priority now. A market crash in the next 2–3 years with no time to recover would be financially devastating. Shift aggressively toward bonds and stable value.`;
    riskNote = { type: 'warning', title: 'Urgency: De-Risk Now', text: `With only ${yearsToCollege} years remaining, you should be moving most of the 529 balance into conservative options immediately. Many families make the mistake of staying aggressive too long and getting caught by a down market at enrollment.` };
  } else {
    aggressiveness = 'Capital Preservation';
    equityPct = '0–15%';
    fundFamily = [
      { name: 'Stable Value / Money Market 529 Option', ticker: 'VMFXX / plan stable value', er: '~0.10%', note: 'Maximum safety. Target this for money needed within 24 months — no equity risk whatsoever.' },
      { name: 'Short-Term Treasury 529 Option', ticker: 'SHY/SGOV equivalent', er: '~0.09%', note: 'If available in your plan, 1–3yr T-bills or ultra-short bond fund. Slight yield improvement over stable value with minimal rate risk.' },
      { name: 'FDIC-Insured Bank 529 CD', ticker: 'Bank savings / CD', er: '0%', note: 'Final-year option — lock in a CD maturing before first tuition payment. Guaranteed principal, modest yield.' },
    ];
    rationale = `College is less than 3 years away — this money should already be in capital preservation mode. Every dollar needs to be there when tuition is due. Do not take equity risk with tuition money you need this soon.`;
    riskNote = { type: 'critical', title: 'Shift to Preservation Immediately', text: `With college ${yearsToCollege < 1 ? 'starting this year' : `in ${yearsToCollege} years`}, the priority is making sure every dollar is safe. Move to stable value or short-duration bonds now. Missing a tuition payment because of a market downturn is a serious risk.` };
  }

  const callouts = [
    {
      type: 'info',
      title: `Recommended 529 Allocation — ${aggressiveness} (${equityPct} equity)`,
      text: rationale,
    },
    {
      type: 'good',
      title: 'Age-Based Tracks Do This Automatically',
      text: 'Most top-rated 529 plans (Vanguard, Fidelity, Schwab, Utah My529, Nevada Vanguard) offer age-based investment tracks that automatically glide from aggressive to conservative as your child approaches 18. If you choose an age-based track, the rebalancing happens without any action on your part — it is the recommended approach for most families.',
    },
  ];
  if (riskNote) callouts.push(riskNote);

  return {
    title: '529 Investment Allocation — Target Date Fund Recommendation',
    content: `At age ${childAge}, your child is ${yearsToCollege} years from college enrollment. The appropriate allocation level is **${aggressiveness} (${equityPct} equity)**.\n\nThe funds below are the top-rated, lowest-cost options in this category. All are available in most states' 529 plans — you are not limited to your home state's plan (though check if your state offers a tax deduction for in-state contributions first).`,
    table: {
      headers: ['Fund / Option', 'Holdings', 'Expense Ratio', 'Why Recommended'],
      rows: fundFamily.map(f => [f.name, f.ticker, f.er, f.note]),
    },
    callouts,
  };
}

// ─── Personalized Portfolio Builder ───────────────────────────────────────────
// Builds a completely custom allocation from the client's actual data profile.
// Called instead of the generic buildTickerSection in all report generators.

function buildPersonalizedPortfolio(data) {
  const age        = parseFloat(data.age) || 40;
  const risk       = data.risk_tolerance || 'Moderate';
  const goal       = (data.primary_goal || data.financial_goal || 'Retirement').toLowerCase();
  const income     = parseFloat(data.annual_income) || 0;
  const retireAge  = parseFloat(data.retirement_age) || 65;
  const horizon    = parseFloat(data.investment_horizon) || Math.max(1, retireAge - age);
  const liquid     = parseFloat(data.liquid_assets) || 0;
  const realEstate = parseFloat(data.real_estate_value) > 0;
  const hasPension = data.pension_type && data.pension_type !== 'None' && data.pension_type !== '';
  const efMonths   = income > 0 ? liquid / (income / 12) : 0;

  const marginalRate = income > 400000 ? 37 : income > 215000 ? 35 : income > 170000 ? 32
    : income > 100000 ? 24 : income > 44000 ? 22 : 12;
  const highTax    = marginalRate >= 32;
  const isIncome   = goal.includes('income') || goal.includes('dividend');
  const isGrowth   = goal.includes('growth') || goal.includes('wealth');
  const isRetired  = age >= 65 || (isIncome && age >= 60);
  const isPreRetire = age >= 55 && !isRetired;
  const isAggressive = risk === 'Aggressive' || risk === 'Very Aggressive';
  const isConservative = risk === 'Conservative' || risk === 'Moderately Conservative';

  // ── Determine which of 4 distinct portfolio shapes fits this person ──────────
  // Each shape has different funds, different roles, different narrative.
  // Kept to 4–5 holdings so the allocation is actionable, not overwhelming.

  let holdings = [];
  let profileType = '';
  let allocationSummary = '';

  if (isRetired) {
    // ── RETIREMENT INCOME ──────────────────────────────────────────────────────
    // Priority: reliable income + inflation protection + capital preservation.
    // Equity exists only to prevent the portfolio from being depleted by inflation.
    profileType = 'Retirement Income';
    const bondFund  = highTax ? { t: 'VTEB', n: 'Vanguard Tax-Exempt Bond ETF', er: '0.05%' }
                              : { t: 'BND',  n: 'Vanguard Total Bond Market ETF', er: '0.03%' };
    const reitNote  = realEstate
      ? `You own real estate directly — VNQ adds commercial REIT exposure (data centers, cell towers, healthcare) you cannot access through residential property, without double-counting your home equity.`
      : `REITs provide rental income passthrough. ~4% yield, inflation-linked via rents. VNQ holds 160+ properties across every commercial category.`;
    holdings = [
      { fund: 'SCHD',         name: 'Schwab US Dividend Equity ETF',   alloc: 30, why: `Core income engine. SCHD screens for 10-year consecutive dividend growth + free cash flow quality — eliminates dividend traps automatically. Yield ~3.5%, growing 8–10%/yr. This is the foundation of a sustainable withdrawal strategy.` },
      { fund: bondFund.t,     name: bondFund.n,                         alloc: 30, why: highTax ? `At your ${marginalRate}% bracket, VTEB's muni bonds yield ~${(3.4/(1-marginalRate/100)).toFixed(1)}% tax-equivalent — materially better than taxable BND after taxes. Munis selected specifically because of your income level.` : `Investment-grade bond anchor. Reduces portfolio volatility and provides reliable income when equities are down. The counterweight that lets you stay invested through corrections.` },
      { fund: 'SCHP',         name: 'Schwab US TIPS ETF',               alloc: 20, why: `Inflation protection — TIPS principal adjusts with CPI every six months. Critical in a 20–30 year retirement: a 3% inflation rate cuts purchasing power in half over 23 years. SCHP at 0.03% is the cheapest way to own this protection.` },
      { fund: 'VNQ',          name: 'Vanguard Real Estate ETF',         alloc: hasPension ? 10 : 12, why: reitNote },
      { fund: 'VTI',          name: 'Vanguard Total Stock Market ETF',  alloc: hasPension ? 10 : 8,  why: `Growth anchor — even in retirement, a small equity sleeve prevents the portfolio from being outpaced by inflation over decades. ${hasPension ? 'Your pension covers baseline income needs, so this equity sleeve can skew slightly higher for long-run compounding.' : 'Set this aside mentally and do not sell it during market corrections.'}` },
    ];
    allocationSummary = `Retirement income portfolio: ~38% equities / 30% bonds / 20% inflation protection / ${hasPension ? '10' : '12'}% real estate. Built to generate consistent income now while preserving purchasing power for a 20–30 year retirement.`;

  } else if (isPreRetire || isConservative) {
    // ── PRE-RETIREMENT / CONSERVATIVE ─────────────────────────────────────────
    // Priority: preserve what's been built, continue growing above inflation,
    // protect against sequence-of-returns risk as retirement approaches.
    profileType = isPreRetire ? 'Pre-Retirement Transition' : 'Conservative Growth';
    const eqPct   = hasPension ? 52 : isConservative ? 38 : 48;
    const bondPct = highTax ? 28 : 32;
    const tipsPct = 15;
    const remPct  = 100 - eqPct - bondPct - tipsPct;
    const bondFund = highTax ? { t: 'VTEB', n: 'Vanguard Tax-Exempt Bond ETF', er: '0.05%' }
                             : { t: 'BND',  n: 'Vanguard Total Bond Market ETF', er: '0.03%' };
    holdings = [
      { fund: 'VTI',       name: 'Vanguard Total Stock Market ETF',   alloc: Math.round(eqPct * 0.56), why: `US equity core — the highest-returning asset class over every 20+ year period in history. At ${eqPct}% total equity, you maintain enough growth to outpace inflation without taking on the full volatility of an all-equity portfolio.` },
      { fund: bondFund.t,  name: bondFund.n,                           alloc: bondPct, why: highTax ? `At your ${marginalRate}% bracket, VTEB muni bonds yield ~${(3.4/(1-marginalRate/100)).toFixed(1)}% tax-equivalent — better than taxable BND on an after-tax basis. Munis are selected specifically because your income level makes them superior.` : `Bond ballast. ${isPreRetire ? `Within ${Math.max(1, retireAge - age)} years of retirement, bonds cushion the sequence-of-returns risk that is most damaging in the final years before you stop receiving a paycheck.` : 'Provides stability during equity drawdowns. Lets you rebalance — buying stocks cheap — without selling them out of fear.'}` },
      { fund: 'VXUS',      name: 'Vanguard Total International Stock', alloc: Math.round(eqPct * 0.28), why: `International diversification. The US is ~60% of global equity — the other 40% trades at a significant valuation discount right now. VXUS adds Europe, Japan, Canada, and emerging markets in one fund. Geographic diversification without any extra complexity.` },
      { fund: 'SCHP',      name: 'Schwab US TIPS ETF',                 alloc: tipsPct, why: `Inflation hedge. ${isPreRetire ? `As you approach retirement, maintaining purchasing power matters more — you cannot make up for a decade of inflation eroding a fixed income. SCHP at 0.03% is the cheapest inflation insurance available.` : 'TIPS principal adjusts with CPI. Low cost and low correlation to both stocks and conventional bonds.'}` },
      { fund: 'SCHD',      name: 'Schwab US Dividend Equity ETF',      alloc: remPct, why: `Quality equity tilt. SCHD's quality screen — dividend growth track record + free cash flow — has historically outperformed the S&P 500 in down markets while matching it in bull markets. Adds a yield component (3.5%) to the equity sleeve.` },
    ];
    allocationSummary = `${profileType} portfolio: ${eqPct}% equity / ${bondPct}% bonds / ${tipsPct}% TIPS. Calibrated for stability without sacrificing inflation-beating growth. ${hasPension ? 'Pension income lets the equity sleeve run slightly higher than a pension-free investor of the same age.' : ''}`;

  } else if (isAggressive) {
    // ── AGGRESSIVE GROWTH ─────────────────────────────────────────────────────
    // Priority: maximum long-run compounding via factor tilts.
    // No bonds beyond a minimal ballast — time is the risk manager.
    // The factor tilt distinguishes this from just "buy VTI."
    profileType = 'Aggressive Factor Growth';
    const factorFund = age < 45
      ? { t: 'AVUV', n: 'Avantis US Small Cap Value ETF', er: '0.25%', why: `The highest expected-return US equity fund available to retail investors. AVUV screen for value AND profitability simultaneously — it avoids value traps (cheap but losing money). At age ${age} with ${horizon}+ years, you have the runway to capture the full small-cap value premium, which has historically added 2–3%/yr over the S&P 500 across every 20-year period on record.` }
      : { t: 'AVLV', n: 'Avantis US Large Cap Value ETF', er: '0.15%', why: `At ${age}, large-cap value reduces volatility vs. small-cap while keeping the value + profitability factor premium. AVLV screens for quality within value — avoiding value traps that look cheap but are fundamentally broken businesses.` };
    holdings = [
      { fund: 'VTI',         name: 'Vanguard Total Stock Market ETF',         alloc: 40, why: `Broad US equity core at 0.03% — the single most important fund in any long-term portfolio. This is your market-weight anchor that makes the factor tilts below work without taking on excessive tracking error.` },
      { fund: factorFund.t,  name: factorFund.n,                               alloc: 20, why: factorFund.why },
      { fund: 'VXUS',        name: 'Vanguard Total International Stock ETF',  alloc: 18, why: `40% of global equity is outside the US, currently at the widest valuation discount in two decades. VXUS captures all of it — Europe, Japan, Canada, EM — in one fund at 0.07%. International diversification has zero cost when you already need the exposure.` },
      { fund: 'AVDV',        name: 'Avantis Intl Small Cap Value ETF',        alloc: 12, why: `International factor premium. The value + size premium has historically been larger outside the US than inside it — most US investors are significantly underweight here. AVDV applies the same quality screen as AVUV to developed-market small caps in Europe, Japan, and Australia.` },
      { fund: 'BND',         name: 'Vanguard Total Bond Market ETF',           alloc: 10, why: `5–10% bonds is not about income — it is rebalancing fuel. When equities drop 30%, you sell BND to buy VTI and AVUV at a discount. This small allocation materially improves long-run compounding by forcing disciplined buying at market lows. Do not eliminate it.` },
    ];
    allocationSummary = `Aggressive factor-tilted portfolio: 90% equity / 10% bonds. US broad market + small cap value factor + international exposure. Built for maximum long-run compounding — accept volatility, do not sell in downturns.`;

  } else {
    // ── BALANCED MODERATE (default — most common profile) ─────────────────────
    // Priority: steady compounding above inflation with managed downside.
    // The goal is a portfolio someone will actually hold through a bear market.
    profileType = 'Balanced Growth';
    const usEq    = hasPension ? 38 : 34;
    const intlEq  = 15;
    const bondPct = hasPension ? 24 : 28;
    const tipsPct = 12;
    const divPct  = 100 - usEq - intlEq - bondPct - tipsPct;
    const bondFund = highTax ? { t: 'VTEB', n: 'Vanguard Tax-Exempt Bond ETF', er: '0.05%' }
                             : { t: 'BND',  n: 'Vanguard Total Bond Market ETF', er: '0.03%' };
    holdings = [
      { fund: 'VTI',      name: 'Vanguard Total Stock Market ETF',   alloc: usEq,    why: `US equity core — ${usEq}% captures every publicly traded US company at 0.03%. This one fund does more long-run work than anything else in the portfolio.` },
      { fund: bondFund.t, name: bondFund.n,                           alloc: bondPct, why: highTax ? `At your ${marginalRate}% bracket, VTEB's muni bonds yield ~${(3.4/(1-marginalRate/100)).toFixed(1)}% tax-equivalent — materially better than BND after taxes. Selected specifically because your income level makes tax-exempt bonds the better choice.` : `Bond ballast — reduces portfolio volatility by ~35% vs. all-equity and provides rebalancing capital during equity sell-offs. ${hasPension ? 'Kept lean because your pension already functions as a bond-like income stream.' : 'The counterweight that lets you stay invested through downturns.'}` },
      { fund: 'VXUS',    name: 'Vanguard Total International Stock', alloc: intlEq,  why: `Geographic diversification. International stocks are the same companies — Apple sells iPhones in Japan, McDonald's in Europe — but priced at a significant discount to US equivalents right now. VXUS covers every developed and emerging market in one low-cost fund.` },
      { fund: 'SCHD',    name: 'Schwab US Dividend Equity ETF',      alloc: divPct,  why: `Quality equity tilt. SCHD's quality screen (10-year dividend growth + free cash flow) has historically outperformed the S&P 500 in drawdowns while keeping up in bull markets. Adds income and quality to the equity sleeve without adding complexity.` },
      { fund: 'SCHP',    name: 'Schwab US TIPS ETF',                  alloc: tipsPct, why: `Inflation hedge — TIPS principal adjusts with CPI. At a ${usEq + intlEq + divPct}% equity allocation, you already have strong real return potential. SCHP at 0.03% is the cheapest way to add a dedicated inflation floor without changing the risk profile materially.` },
    ];
    allocationSummary = `Balanced growth portfolio: ${usEq + intlEq + divPct}% equity / ${bondPct}% bonds / ${tipsPct}% inflation protection. Designed for consistent compounding with enough stability to stay invested through a bear market.`;
  }

  // Normalize allocations to exactly 100
  const allocTotal = holdings.reduce((s, h) => s + h.alloc, 0);
  if (allocTotal !== 100) holdings[0].alloc += (100 - allocTotal);

  // Emergency fund note — added as a callout if underfunded
  const efCallout = efMonths > 0 && efMonths < 4 ? {
    type: 'warning',
    title: 'Fund Your Emergency Reserve First',
    text: `Your liquid assets cover approximately ${efMonths.toFixed(1)} months of expenses. Before deploying this allocation, build a 4–6 month emergency reserve in a high-yield savings account or SGOV (T-bill ETF, ~5% yield). The worst time to sell investments is when you are forced to — a proper emergency fund prevents that.`,
  } : null;

  return {
    title: `Recommended Portfolio — ${profileType}`,
    content: `${allocationSummary}\n\n**These are the only funds you need.** Every holding has a specific, non-overlapping purpose. You do not need to own all five at once — start with the first two, which do the bulk of the work, and add the others as your portfolio grows.`,
    table: {
      headers: ['Fund', 'Name', 'Allocation', 'Why This Fund For Your Situation'],
      rows: holdings.map(h => [h.fund, h.name, `${h.alloc}%`, h.why]),
    },
    callouts: [
      {
        type: 'info',
        title: 'Why This Portfolio — Not a Generic Template',
        text: `This allocation was built from your specific inputs: age ${age}, ${risk} risk tolerance, ${Math.round(horizon)}-year horizon${hasPension ? ', pension income (which functions as a bond — freeing the portfolio to hold more equity)' : ''}${highTax ? `, and a ${marginalRate}% marginal tax rate (which makes munis more efficient than taxable bonds)` : ''}${realEstate ? ', and existing real estate (reducing REIT concentration need)' : ''}. Different inputs produce a different portfolio.`,
      },
      {
        type: 'good',
        title: 'Rebalancing — Once a Year Is Enough',
        text: `Check allocations annually. If any fund has drifted more than 5% from its target, rebalance by directing new contributions toward the underweight fund first — this avoids triggering capital gains in taxable accounts. Only sell and buy inside 401k / IRA where there is no tax consequence. You do not need to rebalance more often than once a year.`,
      },
      ...(efCallout ? [efCallout] : []),
    ],
  };
}

function buildTickerSection(riskTol, context = 'general') {
  const alloc = ALLOCATIONS[riskTol] || ALLOCATIONS['Moderate'];

  const section = {
    title: `Institutional Asset Allocation — ${alloc.label}`,
    content: alloc.summary + ` The portfolio below reflects factor-based construction principles from the Fama-French 5-Factor Model, with tilts toward the documented premia: Value (HML), Size (SMB), Profitability (RMW), and Momentum (UMD). All expense ratios are verified 2024 data. Rebalance annually or when any sleeve drifts >5% from target.`,
    table: {
      headers: ['Asset Class', 'Target', 'Primary Ticker', 'ER', 'Alternatives', 'Thesis'],
      rows: alloc.core.map(r => [r.asset, r.alloc, r.tickers.split(',')[0].trim(), r.er.split('/')[0].trim(), r.tickers.split(',').slice(1).join(',').trim() || '—', r.notes]),
    },
    callouts: [
      { type: 'info', title: 'Factor Premium Rationale', text: `This allocation tilts toward the four most robust documented equity premiums: (1) Value — cheap stocks outperform over full cycles; (2) Size — small cap has historically outperformed large by ~2%/yr; (3) Profitability — high-profit firms outperform low-profit; (4) Momentum — recent winners continue winning 12–18mo. AVUV and AVDV (Avantis) are the most accessible fund implementations of all four simultaneously.` },
      { type: 'good', title: 'Fee Minimization Is Alpha', text: `At ${riskTol === 'Aggressive' ? '90%' : riskTol === 'Moderate' ? '60%' : '30%'} equity, a 1% reduction in expense ratio compounds to massive wealth over decades. The cheapest funds in each category: US equity (FZROX — 0%), bonds (SCHZ — 0.03%), TIPS (SCHP — 0.03%), gold (GLDM — 0.10%). Every basis point saved is a guaranteed, risk-free return equal to your marginal tax rate.` },
    ],
  };

  // Add context-specific callout
  if (context === 'retirement') {
    section.callouts.push({
      type: 'info',
      title: 'Asset Location Strategy — Where to Hold What',
      text: `Tax-inefficient assets belong in tax-advantaged accounts: REITs (high dividends), bonds (interest income), and high-turnover factor ETFs in 401k/IRA. Tax-efficient assets (VTI, VXUS, AVUV with low turnover) belong in taxable accounts. Managed futures (DBMF) should always be in IRA — 60/40 blended capital gains treatment is inefficient in taxable accounts.`,
    });
  }

  if (context === 'tax') {
    section.callouts.push({
      type: 'warning',
      title: 'Municipal Bonds vs. Taxable Bonds — Break-Even Analysis',
      text: `At your marginal rate, the tax-equivalent yield of munis exceeds taxable bonds above the break-even: TEY = Muni Yield ÷ (1 - Tax Rate). At 24% bracket: VTEB yielding 3.4% TEY = 4.47%. At 32%: TEY = 5.0%. At 37%: TEY = 5.4%. This beats BND (3.3%) and most investment-grade corporate bonds net of taxes. VTEB (ER: 0.05%) is the most cost-efficient national muni ETF.`,
    });
  }

  return section;
}

function buildIncomeTickerSection() {
  return {
    title: 'Income Generation — Advanced Instruments',
    content: `For income-focused objectives, the universe extends far beyond traditional dividend stocks and bond funds. The table below covers the full spectrum of income instruments from senior-secured T-bills through synthetic income generation via options overlays. Yields shown are trailing 12-month as of 2024.`,
    table: {
      headers: ['Ticker', 'Name', 'ER', 'TTM Yield', 'Key Feature'],
      rows: INCOME_TICKERS.map(t => [t.ticker, t.name, t.er, t.yield, t.notes]),
    },
    callouts: [
      { type: 'warning', title: 'Covered Call ETFs — Understand the Trade-Off', text: 'JEPI, DIVO, QYLD generate high income by selling call options — they cap upside in bull markets. In 2023, JEPI returned ~20% vs SPY at ~26%. In 2022, JEPI fell ~14% vs SPY at ~18%. They work best for retirees who need income now and can sacrifice long-run growth. For accumulation phase, VTI beats JEPI over any 10+ year period.' },
      { type: 'info', title: 'Preferred Stock — The Forgotten Asset Class', text: 'Preferred shares sit between bonds and common equity in the capital structure — safer than common, but more income than bonds. PFFD (Global X US Preferred) offers ~6.5% yield with 15/20% qualified dividend tax treatment. Useful in taxable accounts for investors in the 22–35% bracket who need income without the tax inefficiency of regular bonds.' },
    ],
  };
}

function buildLiquidYieldSection(amount) {
  return {
    title: 'High-Yield Liquid Instruments — Emergency & Short-Term Cash',
    content: `The difference between traditional savings accounts (0.01–0.50% APY) and optimal short-duration instruments (4.9–5.3% APY) on ${fc(amount)} is approximately ${fc(amount * 0.048)}/year in foregone income — guaranteed and risk-free. The table below covers the full spectrum from FDIC-insured bank accounts through government-backed money market funds and T-bill ETFs.`,
    table: {
      headers: ['Ticker / Account', 'Name', 'ER', '~Yield', 'Notes'],
      rows: [
        ...LIQUID_YIELD_TICKERS.map(t => [t.ticker, t.name, t.er, t.yield, t.notes]),
        ['SoFi / Marcus / Ally', 'High-Yield Savings Account', '0%', '4.5–5.0%', 'FDIC insured up to $250k. Best for Tier 1 emergency fund — immediate ACH transfer. No investment risk whatsoever'],
        ['Series I Bonds', 'Treasury I-Bonds (TreasuryDirect.gov)', '0%', '~4.3% (CPI-linked)', 'Inflation-adjusted principal. $10k/yr per SSN limit. 1yr lockup, 3mo penalty if redeemed < 5yr. Best for Tier 3 (excess above 6mo target)'],
      ],
      highlight: 2,
    },
    callouts: [
      { type: 'good', title: 'T-Bill ETFs vs. HYSA — The Optimal Split', text: `Recommended structure: Tier 1 — 1 month expenses in HYSA (instant transfer). Tier 2 — 2–4 months in SGOV or USFR T-bill ETFs (T+1 settlement, ~5.1% yield, state-tax exempt). Tier 3 — any excess above 6 months in I-Bonds or 3-month T-bill ladder. This maximizes yield while keeping liquidity where you need it.` },
    ],
  };
}

// ─── 1. Wealth Diagnostic ─────────────────────────────────────────────────────

function generateWealthDiagnostic(data) {
  const income = parseFloat(data.annual_income) || 0;
  const liquid = parseFloat(data.liquid_assets) || 0;
  const investments = parseFloat(data.investment_total) || 0;
  const realEstate = parseFloat(data.real_estate_value) || 0;
  const mortgage = parseFloat(data.mortgage_balance) || 0;
  const cc = parseFloat(data.credit_card_debt) || 0;
  const student = parseFloat(data.student_loans) || 0;
  const other = parseFloat(data.other_debt) || 0;
  const monthlyDebt = parseFloat(data.monthly_debt_payments) || 0;
  const age = parseFloat(data.age) || 35;
  const retAge = parseFloat(data.retirement_age) || 65;
  const monthlySavings = parseFloat(data.monthly_savings) || 0;
  const risk = data.risk_tolerance || 'Moderate';

  const totalAssets = liquid + investments + realEstate;
  const totalDebt = mortgage + cc + student + other;
  const netWorth = totalAssets - totalDebt;
  const annualSavings = monthlySavings * 12;
  const savingsRate = income > 0 ? annualSavings / income * 100 : 0;
  const dti = income > 0 ? monthlyDebt * 12 / income * 100 : 0;
  const monthlyIncome = income / 12;
  const efMonths = monthlyIncome > 0 ? liquid / monthlyIncome : 0;
  const debtToAsset = totalAssets > 0 ? totalDebt / totalAssets * 100 : 0;
  const yearsToRetire = Math.max(0, retAge - age);

  const ageBenchmark = age <= 30 ? income : age <= 35 ? income * 2 : age <= 40 ? income * 3 : age <= 45 ? income * 4.5 : age <= 50 ? income * 6 : income * 8;
  const nwVsBench = ageBenchmark > 0 ? netWorth / ageBenchmark * 100 : 100;

  let score = 50;
  if (savingsRate >= 20) score += 15; else if (savingsRate >= 15) score += 10; else if (savingsRate >= 10) score += 5;
  if (dti <= 28) score += 15; else if (dti <= 36) score += 8; else if (dti > 43) score -= 10;
  if (efMonths >= 6) score += 10; else if (efMonths >= 3) score += 4; else score -= 5;
  if (nwVsBench >= 100) score += 10; else if (nwVsBench >= 75) score += 5; else if (nwVsBench < 40) score -= 5;
  if (cc === 0) score += 5; else if (cc > 10000) score -= 8;
  score = Math.max(10, Math.min(99, score));
  const grade = letterGrade(score);

  const returnRate = risk === 'Conservative' ? 0.055 : risk === 'Aggressive' ? 0.09 : 0.07;
  const projRetirement = fvL(investments, returnRate, yearsToRetire) + fvP(annualSavings, returnRate, yearsToRetire);
  const neededNestEgg = income * 0.8 / 0.04;
  const retGap = neededNestEgg - projRetirement;
  const addlMonthly = retGap > 0 && yearsToRetire > 0 ? retGap / fvP(1, returnRate, yearsToRetire) / 12 : 0;

  return {
    score,
    grade,
    headline: score >= 80 ? `Strong financial foundation — grade ${grade}` : score >= 65 ? `Solid progress with key gaps to close — grade ${grade}` : score >= 50 ? `Moderate health — important areas need attention — grade ${grade}` : `Critical gaps require immediate action — grade ${grade}`,
    summary: `Net worth of ${fc(netWorth)} at age ${age} vs. age benchmark of ${fc(ageBenchmark)} (${fn(nwVsBench, 0)}% of target). Savings rate is ${fp(savingsRate)} against the recommended 15–20%, with a DTI of ${fp(dti)}. ${retGap > 0 ? `Retirement projection shows a ${fc(retGap)} gap requiring ${fc(addlMonthly)}/month in additional contributions.` : `Retirement trajectory is on track with a ${fc(Math.abs(retGap))} projected surplus.`}`,
    scorecard: [
      { label: 'Savings Rate', value: fp(savingsRate), sub: 'Target: 15–20%', status: savingsRate >= 15 ? 'good' : savingsRate >= 10 ? 'warning' : 'critical' },
      { label: 'Debt-to-Income', value: fp(dti), sub: 'Target: under 36%', status: dti <= 28 ? 'good' : dti <= 36 ? 'warning' : 'critical' },
      { label: 'Emergency Fund', value: `${fn(efMonths, 1)} mo`, sub: 'Target: 6 months', status: efMonths >= 6 ? 'good' : efMonths >= 3 ? 'warning' : 'critical' },
      { label: 'Net Worth vs Benchmark', value: `${fn(nwVsBench, 0)}%`, sub: `Benchmark: ${fc(ageBenchmark)}`, status: nwVsBench >= 100 ? 'good' : nwVsBench >= 75 ? 'warning' : 'critical' },
      { label: 'Credit Card Debt', value: fc(cc), sub: cc === 0 ? 'Debt-free' : 'High-interest', status: cc === 0 ? 'good' : cc < 5000 ? 'warning' : 'critical' },
      { label: 'Retirement Gap', value: retGap > 0 ? fc(retGap) : 'On Track', sub: `Need: ${fc(neededNestEgg)}`, status: retGap <= 0 ? 'good' : retGap < neededNestEgg * 0.25 ? 'warning' : 'critical' },
    ],
    charts: [
      {
        type: 'donut',
        title: 'Asset Allocation',
        data: [
          { name: 'Investments', value: Math.max(0, investments) },
          { name: 'Real Estate', value: Math.max(0, realEstate) },
          { name: 'Liquid/Cash', value: Math.max(0, liquid) },
        ].filter(d => d.value > 0),
      },
      {
        type: 'bar',
        title: 'Debt Composition',
        data: [
          { name: 'Mortgage', value: mortgage },
          { name: 'Credit Cards', value: cc },
          { name: 'Student Loans', value: student },
          { name: 'Other', value: other },
        ].filter(d => d.value > 0),
        xKey: 'name',
        bars: [{ key: 'value', label: 'Balance', color: RED }],
      },
      {
        type: 'area',
        title: `Retirement Projection (${yearsToRetire} Years)`,
        data: (() => {
          const pts = [];
          for (let y = 0; y <= Math.min(yearsToRetire, 30); y += 5) {
            pts.push({
              name: `Year ${y}`,
              Base: Math.round(fvL(investments, returnRate, y) + fvP(annualSavings, returnRate, y)),
              Conservative: Math.round(fvL(investments, 0.05, y) + fvP(annualSavings, 0.05, y)),
              Target: Math.round(neededNestEgg * (y / Math.max(yearsToRetire, 1))),
            });
          }
          return pts;
        })(),
        xKey: 'name',
        lines: [
          { key: 'Base', label: 'Base Case', color: GOLD },
          { key: 'Conservative', label: 'Conservative', color: BLUE },
          { key: 'Target', label: 'Target Needed', color: RED },
        ],
      },
    ],
    sections: [
      {
        title: 'Net Worth Analysis',
        content: `Your total assets of ${fc(totalAssets)} against liabilities of ${fc(totalDebt)} produce a net worth of **${fc(netWorth)}**. The debt-to-asset ratio of ${fp(debtToAsset)} is ${debtToAsset <= 30 ? 'excellent — well within healthy parameters' : debtToAsset <= 50 ? 'acceptable but has room to improve' : 'elevated and should be addressed'}. At age ${age}, the Fidelity benchmark suggests a net worth of ${fc(ageBenchmark)} (${fn(ageBenchmark / Math.max(income, 1), 1)}× income) — you are currently at ${fn(nwVsBench, 0)}% of that target.`,
        bigNumbers: [
          { value: fc(netWorth), label: 'Net Worth', sub: `${fn(nwVsBench, 0)}% of age benchmark`, color: netWorth > 0 ? GOLD : RED },
          { value: fc(totalAssets), label: 'Total Assets', sub: 'Gross asset base', color: GREEN },
          { value: fc(totalDebt), label: 'Total Liabilities', sub: `${fp(debtToAsset)} debt-to-asset ratio`, color: totalDebt > 0 ? RED : GREEN },
        ],
        bars: [
          { label: 'Investments', value: investments, max: totalAssets, pct: totalAssets > 0 ? investments / totalAssets * 100 : 0, color: GOLD },
          { label: 'Real Estate', value: realEstate, max: totalAssets, pct: totalAssets > 0 ? realEstate / totalAssets * 100 : 0, color: BLUE },
          { label: 'Liquid / Cash', value: liquid, max: totalAssets, pct: totalAssets > 0 ? liquid / totalAssets * 100 : 0, color: TEAL },
        ],
        table: {
          headers: ['Category', 'Balance', '% of Assets'],
          rows: [
            ['Liquid Assets', fc(liquid), fp(totalAssets > 0 ? liquid / totalAssets * 100 : 0)],
            ['Investment Accounts', fc(investments), fp(totalAssets > 0 ? investments / totalAssets * 100 : 0)],
            ['Real Estate', fc(realEstate), fp(totalAssets > 0 ? realEstate / totalAssets * 100 : 0)],
            ['Total Assets', fc(totalAssets), '100%'],
            ['Total Debt', '-' + fc(totalDebt), '—'],
            ['Net Worth', fc(netWorth), '—'],
          ],
          highlight: 5,
        },
        callouts: [
          debtToAsset > 50 ? { type: 'critical', title: 'High Debt-to-Asset Ratio', text: `At ${fp(debtToAsset)}, your debt load is significant. Every dollar of assets is offset by ${fp(debtToAsset)} cents in liabilities. Aggressive debt reduction should be a priority.` } : null,
          cc > 0 ? { type: 'warning', title: 'Credit Card Debt Costing You', text: `${fc(cc)} in credit card debt at ~22% APR is costing approximately ${fc(cc * 0.22 / 12)}/month in pure interest. This is the highest-return "investment" you can make — pay it off first.` } : null,
        ].filter(Boolean),
      },
      {
        title: 'Cash Flow & Savings Rate',
        content: `Your annual savings of ${fc(annualSavings)} represents ${fp(savingsRate)} of gross income. The recommended savings rate is 15–20% — ${savingsRate >= 20 ? 'you are exceeding this benchmark, which is excellent' : savingsRate >= 15 ? 'you are meeting this benchmark' : `you are below target by ${fp(15 - savingsRate)}`}. Monthly debt payments of ${fc(monthlyDebt)} result in a DTI of ${fp(dti)}, which lenders classify as ${dti <= 28 ? 'excellent (under 28%)' : dti <= 36 ? 'acceptable (28–36%)' : dti <= 43 ? 'elevated (36–43%) — refinancing opportunities may exist' : 'high-risk (over 43%) — prioritize debt reduction immediately'}.`,
        bigNumbers: [
          { value: fp(savingsRate), label: 'Savings Rate', sub: 'Target: 15–20%', color: savingsRate >= 15 ? GREEN : savingsRate >= 10 ? GOLD : RED },
          { value: fp(dti), label: 'Debt-to-Income Ratio', sub: 'Target: under 36%', color: dti <= 36 ? GREEN : dti <= 43 ? GOLD : RED },
          { value: fc(income - annualSavings - monthlyDebt * 12), label: 'Annual Free Cash Flow', sub: 'After savings & debt payments', color: BLUE },
        ],
        callouts: [
          savingsRate < 10 ? { type: 'critical', title: 'Savings Rate Below Minimum', text: `A ${fp(savingsRate)} savings rate is below the 10% minimum. To reach 15%, you need to save an additional ${fc((income * 0.15 - annualSavings) / 12)}/month. Consider automating savings before discretionary spending.` } : null,
          { type: 'info', title: 'Savings Rate Benchmarks', text: '10%: Minimum viable · 15%: On track · 20%: Accelerated wealth build · 25%+: Early retirement territory. Every 1% increase in savings rate can shave years off your working life.' },
        ].filter(Boolean),
      },
      {
        title: 'Emergency Fund Status',
        content: `Your liquid assets of ${fc(liquid)} provide ${fn(efMonths, 1)} months of income coverage. The standard recommendation is 6 months for most households, with 3–4 months as an absolute minimum. ${efMonths >= 6 ? 'Your emergency fund is fully funded — consider deploying excess above 6 months into higher-yield investments.' : efMonths >= 3 ? `You are partially funded. The gap to 6 months is ${fc(monthlyIncome * 6 - liquid)} — prioritize building this before aggressive investing.` : `Your emergency fund is critically low. Building to 3 months (${fc(monthlyIncome * 3)}) should be your top immediate priority before any other financial goals.`}`,
        bigNumbers: [
          { value: `${fn(efMonths, 1)} months`, label: 'Current Coverage', sub: `${fc(liquid)} in liquid assets`, color: efMonths >= 6 ? GREEN : efMonths >= 3 ? GOLD : RED },
          { value: fc(monthlyIncome * 6), label: '6-Month Target', sub: 'Recommended minimum', color: BLUE },
          { value: efMonths >= 6 ? 'Fully Funded' : fc(monthlyIncome * 6 - liquid), label: efMonths >= 6 ? 'Status' : 'Funding Gap', sub: efMonths >= 6 ? 'No action needed' : 'Amount to build', color: efMonths >= 6 ? GREEN : RED },
        ],
        callouts: [
          efMonths < 3 ? { type: 'critical', title: 'Emergency Fund Critically Underfunded', text: `With only ${fn(efMonths, 1)} months of coverage, a single job loss or medical event could force high-interest borrowing or asset liquidation. Open a high-yield savings account (SoFi, Marcus, Ally — currently 4.5–5.1% APY) and deposit ${fc(monthlyIncome * 3)} as the first milestone.` } : null,
          efMonths >= 6 ? { type: 'good', title: 'Emergency Fund Fully Funded', text: `Excellent — your ${fn(efMonths, 1)}-month emergency fund exceeds the 6-month standard. Any liquid savings above 6 months can potentially be deployed into a taxable brokerage account or I-Bonds for better returns.` } : null,
        ].filter(Boolean),
      },
      {
        title: 'Retirement Readiness',
        content: `With ${yearsToRetire} years until your target retirement age of ${retAge}, your current investments of ${fc(investments)} plus ongoing savings of ${fc(annualSavings)}/year are projected to grow to **${fc(projRetirement)}** at a ${fp(returnRate * 100)} average annual return (${risk} allocation). Your required nest egg — based on the 4% safe withdrawal rate at 80% income replacement — is **${fc(neededNestEgg)}**. ${retGap > 0 ? `This creates a ${fc(retGap)} shortfall. To close this gap, you need to increase contributions by ${fc(addlMonthly)}/month.` : `You are on track with a projected surplus of ${fc(Math.abs(retGap))}.`}`,
        table: {
          headers: ['Scenario', 'Return Rate', 'Projected Value', 'vs. Target', 'Status'],
          rows: [
            ['Conservative', '5.0%', fc(fvL(investments, 0.05, yearsToRetire) + fvP(annualSavings, 0.05, yearsToRetire)), fc(neededNestEgg - (fvL(investments, 0.05, yearsToRetire) + fvP(annualSavings, 0.05, yearsToRetire))), fvL(investments, 0.05, yearsToRetire) + fvP(annualSavings, 0.05, yearsToRetire) >= neededNestEgg ? '✓ On Track' : '✗ Gap'],
            ['Base Case', fp(returnRate * 100), fc(projRetirement), fc(neededNestEgg - projRetirement), projRetirement >= neededNestEgg ? '✓ On Track' : '✗ Gap'],
            ['Optimistic', '9.0%', fc(fvL(investments, 0.09, yearsToRetire) + fvP(annualSavings, 0.09, yearsToRetire)), fc(neededNestEgg - (fvL(investments, 0.09, yearsToRetire) + fvP(annualSavings, 0.09, yearsToRetire))), fvL(investments, 0.09, yearsToRetire) + fvP(annualSavings, 0.09, yearsToRetire) >= neededNestEgg ? '✓ On Track' : '✗ Gap'],
          ],
          highlight: 1,
        },
        callouts: [
          { type: 'info', title: '4% Safe Withdrawal Rate (Bengen Rule)', text: 'The 4% rule, based on the Trinity Study, states that a diversified portfolio withdrawing 4% annually has historically survived 30+ year retirements in virtually all market conditions. Your target nest egg is calculated as: Annual Income × 0.8 ÷ 0.04.' },
        ],
      },
      buildPersonalizedPortfolio(data),
    ],
    scenarios: [
      {
        outcome: `Conservative: ${fc(fvL(investments, 0.05, yearsToRetire) + fvP(annualSavings * 0.8, 0.05, yearsToRetire))}`,
        description: `5% average return, savings rate drops 20%. Net worth grows to ${fc(netWorth + fvP(annualSavings * 0.8, 0.05, 10))} in 10 years. Retirement may require additional income sources.`,
      },
      {
        outcome: `Base Case: ${fc(projRetirement)}`,
        description: `${fp(returnRate * 100)} average return, consistent savings. Net worth reaches ${fc(netWorth + fvP(annualSavings, returnRate, 10))} in 10 years. ${retGap <= 0 ? 'Retirement target is achievable.' : `Gap of ${fc(retGap)} remains — increases required.`}`,
      },
      {
        outcome: `Optimistic: ${fc(fvL(investments, 0.09, yearsToRetire) + fvP(annualSavings * 1.2, 0.09, yearsToRetire))}`,
        description: `9% average return, savings rate increases 20%. Net worth could reach ${fc(netWorth + fvP(annualSavings * 1.2, 0.09, 10))} in 10 years. Retirement target likely achieved ahead of schedule.`,
      },
    ],
    actions: [
      cc > 0 ? { priority: 'CRITICAL', timeline: 'This Month', action: `Eliminate ${fc(cc)} in credit card debt`, impact: `Saves ${fc(cc * 0.22 / 12)}/month in interest (22% APR)`, amount: fc(cc) } : null,
      efMonths < 3 ? { priority: 'CRITICAL', timeline: 'This Month', action: 'Fund emergency account to 3-month minimum', impact: 'Prevents forced high-interest borrowing in emergencies', amount: fc(monthlyIncome * 3 - liquid) } : null,
      { priority: 'HIGH', timeline: 'Within 30 Days', action: 'Maximize 401(k) employer match', impact: 'Instant 50–100% return on matched contributions', amount: 'Up to match limit' },
      investments < income ? { priority: 'HIGH', timeline: 'Within 60 Days', action: 'Open/max IRA contribution for current year', impact: `${fc(7000)} in tax-advantaged growth annually`, amount: fc(7000) } : null,
      savingsRate < 15 ? { priority: 'HIGH', timeline: 'This Month', action: `Increase automated savings by ${fc((income * 0.15 - annualSavings) / 12)}/month`, impact: `Reaches 15% savings rate benchmark`, amount: fc((income * 0.15 - annualSavings) / 12) + '/mo' } : null,
      { priority: 'MEDIUM', timeline: 'Within 90 Days', action: `Rebalance portfolio to ${risk.toLowerCase()} target allocation`, impact: 'Aligns risk exposure with stated tolerance and time horizon', amount: 'No cost' },
      { priority: 'MEDIUM', timeline: 'Within 6 Months', action: 'Update estate documents: will, beneficiaries, power of attorney', impact: 'Protects assets and ensures wishes are carried out', amount: '$300–$1,200 attorney fee' },
      { priority: 'MEDIUM', timeline: 'Within 1 Year', action: 'Shop insurance coverage across 3+ carriers', impact: 'Comparable coverage typically 15–25% cheaper through comparison', amount: `Est. ${fc(income * 0.01)}/yr savings` },
    ].filter(Boolean),
  };
}

// ─── 2. Tax Efficiency ────────────────────────────────────────────────────────

function generateTaxEfficiency(data) {
  const w2 = parseFloat(data.w2_income) || 0;
  const selfEmp = parseFloat(data.self_employment) || 0;
  const investInc = parseFloat(data.investment_income) || 0;
  const rental = parseFloat(data.rental_income) || 0;
  const filing = data.filing_status || 'Single';
  const k401 = parseFloat(data['401k_contribution']) || 0;
  const ira = parseFloat(data.ira_contribution) || 0;
  const hsa = parseFloat(data.hsa_contribution) || 0;
  const itemized = parseFloat(data.itemized_deductions) || 0;
  const capGains = parseFloat(data.capital_gains) || 0;

  const isMFJ = filing === 'Married Filing Jointly';
  const isHOH = filing === 'Head of Household';
  const standardDed = isMFJ ? TAX_2026.standardDeduction.mfj : isHOH ? TAX_2026.standardDeduction.hoh : TAX_2026.standardDeduction.single;
  const totalIncome = w2 + selfEmp + investInc + rental;
  const selfEmpTax = selfEmp > 0 ? selfEmp * 0.9235 * 0.153 * 0.5 : 0;
  const deduction = Math.max(standardDed, itemized);
  const useItemized = itemized > standardDed;
  const taxableIncome = Math.max(0, totalIncome - k401 - ira - hsa - selfEmpTax - deduction);

  const bracketKey = isMFJ ? 'mfj' : isHOH ? 'hoh' : 'single';
  const brackets = TAX_2026.ordinaryBrackets[bracketKey].map(b => [b.upTo, b.rate]);

  let federalTax = 0;
  let prev = 0;
  let marginalRate = 0.10;
  for (const [top, rate] of brackets) {
    if (taxableIncome <= prev) break;
    federalTax += (Math.min(taxableIncome, top) - prev) * rate;
    marginalRate = rate;
    prev = top;
  }

  const effectiveRate = totalIncome > 0 ? federalTax / totalIncome * 100 : 0;
  const selfEmpTaxFull = selfEmp > 0 ? selfEmp * 0.9235 * 0.153 : 0;
  const max401k = TAX_2026.retirement.e401kElective;
  const maxIra = TAX_2026.ira.limit;
  const maxHsa = TAX_2026.hsa.selfOnly;
  const add401k = Math.max(0, max401k - k401);
  const addIra = Math.max(0, maxIra - ira);
  const addHsa = Math.max(0, maxHsa - hsa);
  const additionalTaxSavings = (add401k + addIra + addHsa) * marginalRate;

  const ltcg = TAX_2026.ltcgBreakpoints[bracketKey];
  const cgRate = totalIncome < ltcg[0].upTo ? 0 : totalIncome < ltcg[1].upTo ? 0.15 : 0.20;

  let score = 60;
  if (k401 >= max401k) score += 15; else if (k401 >= max401k * 0.5) score += 8;
  if (ira >= maxIra) score += 8; else if (ira > 0) score += 4;
  if (hsa >= maxHsa) score += 7; else if (hsa > 0) score += 3;
  if (useItemized) score += 5;
  if (effectiveRate > 25) score -= 10; else if (effectiveRate > 20) score -= 5;
  score = Math.max(10, Math.min(99, score));

  return {
    score,
    grade: letterGrade(score),
    headline: `${fp(marginalRate * 100, 0)} marginal bracket — ${fc(additionalTaxSavings)} in available tax savings`,
    summary: `Total gross income of ${fc(totalIncome)} with an estimated federal tax of ${fc(federalTax)} at ${fp(effectiveRate)} effective rate (${fp(marginalRate * 100, 0)} marginal). By fully funding available tax-advantaged accounts, you could shelter an additional ${fc(add401k + addIra + addHsa)} in income, saving approximately ${fc(additionalTaxSavings)} in federal taxes this year alone.`,
    scorecard: [
      { label: 'Effective Tax Rate', value: fp(effectiveRate), sub: `Marginal: ${fp(marginalRate * 100, 0)}`, status: effectiveRate < 15 ? 'good' : effectiveRate < 22 ? 'warning' : 'critical' },
      { label: '401(k) Utilized', value: `${fn(k401 / max401k * 100, 0)}%`, sub: `${fc(k401)} of ${fc(max401k)} max`, status: k401 >= max401k ? 'good' : k401 >= max401k * 0.5 ? 'warning' : 'critical' },
      { label: 'IRA Utilized', value: `${fn(ira / maxIra * 100, 0)}%`, sub: `${fc(ira)} of ${fc(maxIra)} max`, status: ira >= maxIra ? 'good' : ira > 0 ? 'warning' : 'critical' },
      { label: 'HSA Utilized', value: `${fn(hsa / maxHsa * 100, 0)}%`, sub: `${fc(hsa)} of ${fc(maxHsa)} max`, status: hsa >= maxHsa ? 'good' : hsa > 0 ? 'warning' : 'critical' },
      { label: 'Deduction Type', value: useItemized ? 'Itemized' : 'Standard', sub: `${fc(deduction)} total`, status: 'neutral' },
      { label: 'Tax Savings Available', value: fc(additionalTaxSavings), sub: 'By maxing accounts', status: additionalTaxSavings > 5000 ? 'critical' : additionalTaxSavings > 2000 ? 'warning' : 'good' },
    ],
    charts: [
      {
        type: 'donut',
        title: 'Income Sources',
        data: [
          { name: 'W-2 Income', value: w2 },
          { name: 'Self-Employment', value: selfEmp },
          { name: 'Investment Income', value: investInc },
          { name: 'Rental Income', value: rental },
        ].filter(d => d.value > 0),
      },
      {
        type: 'bar',
        title: 'Tax-Advantaged Account Usage',
        data: [
          { name: '401(k)', Current: k401, Remaining: add401k, Maximum: max401k },
          { name: 'IRA', Current: ira, Remaining: addIra, Maximum: maxIra },
          { name: 'HSA', Current: hsa, Remaining: addHsa, Maximum: maxHsa },
        ],
        xKey: 'name',
        bars: [
          { key: 'Current', label: 'Current Contribution', color: GREEN },
          { key: 'Remaining', label: 'Remaining Room', color: GOLD },
        ],
      },
      {
        type: 'bar',
        title: 'Federal Tax Bracket Analysis',
        data: [
          { bracket: '10%', amount: Math.min(taxableIncome, isMFJ ? 23200 : 11600) * 0.10 },
          { bracket: '12%', amount: taxableIncome > (isMFJ ? 23200 : 11600) ? Math.min(taxableIncome - (isMFJ ? 23200 : 11600), isMFJ ? 71100 : 35550) * 0.12 : 0 },
          { bracket: '22%', amount: taxableIncome > (isMFJ ? 94300 : 47150) ? Math.min(taxableIncome - (isMFJ ? 94300 : 47150), isMFJ ? 106750 : 53375) * 0.22 : 0 },
          { bracket: '24%+', amount: taxableIncome > (isMFJ ? 201050 : 100525) ? (taxableIncome - (isMFJ ? 201050 : 100525)) * 0.24 : 0 },
        ].filter(d => d.amount > 0),
        xKey: 'bracket',
        bars: [{ key: 'amount', label: 'Tax Owed', color: RED }],
      },
    ],
    sections: [
      {
        title: 'Tax Calculation Breakdown',
        content: `Gross income of ${fc(totalIncome)} less ${useItemized ? 'itemized' : 'standard'} deduction of ${fc(deduction)} and pre-tax contributions of ${fc(k401 + ira + hsa)} produces taxable income of **${fc(taxableIncome)}**. Federal tax estimated at **${fc(federalTax)}** — effective rate ${fp(effectiveRate)}, marginal rate ${fp(marginalRate * 100, 0)}. ${capGains > 0 ? `Capital gains of ${fc(capGains)} taxed at the preferential ${fp(cgRate * 100, 0)} long-term rate, saving you ${fp((marginalRate - cgRate) * 100, 0)} vs. ordinary income treatment.` : ''}`,
        table: {
          headers: ['Item', 'Amount', 'Tax Impact'],
          rows: [
            ['Gross Income', fc(totalIncome), '—'],
            ['401(k) Contribution', `-${fc(k401)}`, `-${fc(k401 * marginalRate)}`],
            ['IRA Contribution', `-${fc(ira)}`, `-${fc(ira * marginalRate)}`],
            ['HSA Contribution', `-${fc(hsa)}`, `-${fc(hsa * marginalRate)}`],
            [useItemized ? 'Itemized Deduction' : 'Standard Deduction', `-${fc(deduction)}`, `-${fc(deduction * marginalRate)}`],
            ['Taxable Income', fc(taxableIncome), '—'],
            ['Estimated Federal Tax', fc(federalTax), `${fp(effectiveRate)} effective rate`],
          ],
          highlight: 6,
        },
      },
      {
        title: 'Tax Optimization Opportunities',
        content: `You have ${fc(add401k + addIra + addHsa)} in remaining tax-advantaged contribution room this year. Fully funding these accounts would reduce your taxable income by that amount, saving ${fc(additionalTaxSavings)} in federal taxes at your ${fp(marginalRate * 100, 0)} marginal rate. This is a guaranteed, risk-free return equal to your marginal rate.`,
        bars: [
          { label: `401(k) — ${fc(add401k)} remaining`, value: k401, max: max401k, pct: k401 / max401k * 100, color: GREEN, showValue: true },
          { label: `IRA — ${fc(addIra)} remaining`, value: ira, max: maxIra, pct: ira / maxIra * 100, color: BLUE, showValue: true },
          { label: `HSA — ${fc(addHsa)} remaining`, value: hsa, max: maxHsa, pct: hsa / maxHsa * 100, color: TEAL, showValue: true },
        ],
        callouts: [
          { type: 'good', title: 'HSA: Triple Tax Advantage', text: 'The HSA is the only account with three tax benefits: contributions are pre-tax, growth is tax-free, and qualified medical withdrawals are tax-free. After age 65, it functions like a traditional IRA with no penalty. Max it every year you have an HDHP.' },
          selfEmp > 0 ? { type: 'info', title: 'Self-Employment: Solo 401(k) Opportunity', text: `With ${fc(selfEmp)} in self-employment income, you can open a Solo 401(k) and contribute up to ${fc(Math.min(selfEmp * 0.25, 66000))} — far beyond the standard employee limit. This can eliminate a significant portion of self-employment and income taxes.` } : null,
        ].filter(Boolean),
      },
      buildPersonalizedPortfolio(data),
    ],
    scenarios: [
      {
        outcome: `Tax Bill: ${fc(federalTax)} (Current)`,
        description: `Maintaining current contribution levels. Effective rate: ${fp(effectiveRate)}. Leaving ${fc(additionalTaxSavings)} in available savings on the table annually.`,
      },
      {
        outcome: `Tax Bill: ${fc(Math.max(0, federalTax - additionalTaxSavings))} (Optimized)`,
        description: `Maximize all tax-advantaged accounts — 401(k), IRA, and HSA. Saves ${fc(additionalTaxSavings)} vs. current approach. Effective rate drops to approximately ${fp(Math.max(0, federalTax - additionalTaxSavings) / Math.max(totalIncome, 1) * 100)}.`,
      },
      {
        outcome: `Tax Bill: ${fc(Math.max(0, federalTax - additionalTaxSavings * 1.5))} (Advanced)`,
        description: `Plus tax-loss harvesting, charitable bunching, QOZ investments if applicable. Sophisticated strategies for high-income earners. Recommend CPA consultation for strategies above ${fc(200000)} income.`,
      },
    ],
    actions: [
      add401k > 0 ? { priority: 'CRITICAL', timeline: 'ASAP (year-end deadline)', action: `Increase 401(k) contribution by ${fc(add401k / 12)}/month`, impact: `Save ${fc(add401k * marginalRate)} in federal taxes this year`, amount: fc(add401k) + '/yr' } : null,
      addHsa > 0 ? { priority: 'HIGH', timeline: 'Current plan year', action: 'Max HSA contributions if on high-deductible health plan', impact: `Triple tax advantage — ${fc(addHsa * marginalRate)} in immediate tax savings`, amount: fc(addHsa) + '/yr' } : null,
      addIra > 0 ? { priority: 'HIGH', timeline: 'By April tax deadline', action: `Fund ${isMFJ ? 'both' : 'your'} IRA for current tax year`, impact: `${fc(addIra * marginalRate)} in tax savings, ${fc(addIra)} in tax-sheltered growth`, amount: fc(addIra) } : null,
      { priority: 'MEDIUM', timeline: 'Q4 each year', action: 'Review tax-loss harvesting opportunities in taxable accounts', impact: 'Offset capital gains with losses at no change in portfolio risk', amount: 'Varies' },
      { priority: 'MEDIUM', timeline: 'Annually', action: 'Compare standard vs. itemized deductions — consider bunching charitable donations', impact: `Standard deduction is ${fc(standardDed)} — bunching 2 years of charity into 1 may allow itemizing`, amount: `Est. ${fc(Math.max(0, itemized - standardDed) * marginalRate)} savings` },
    ].filter(Boolean),
  };
}

// ─── 3. Retirement Readiness ──────────────────────────────────────────────────

function generateRetirementReadiness(data) {
  const age = parseFloat(data.age) || 40;
  const retAge = parseFloat(data.retirement_age) || 65;
  const income = parseFloat(data.current_income) || 100000;
  // retirement_savings is the combined total entered in the form
  const totalSavedInput = parseFloat(data.retirement_savings) || 0;
  const k401 = totalSavedInput; // single combined field from form
  const ira = 0;
  const pension = parseFloat(data.pension) || 0;
  const annualContrib = (parseFloat(data.annual_401k) || 0) + (parseFloat(data.employer_match) || 0);
  const expectedSS = parseFloat(data.social_security_estimate) || 0;
  const riskTol = data.risk_tolerance || 'Moderate';
  const retIncome = parseFloat(data.desired_retirement_income) || income * 0.75;

  const yearsToRet = Math.max(0, retAge - age);
  const retYears = 90 - retAge;
  const returnRate = riskTol === 'Conservative' ? 0.055 : riskTol === 'Aggressive' ? 0.09 : 0.07;
  const retReturnRate = 0.05;
  const totalSaved = k401 + ira + pension;
  const projBalance = fvL(totalSaved, returnRate, yearsToRet) + fvP(annualContrib, returnRate, yearsToRet);
  const annualSSIncome = expectedSS; // already annual from form input
  const neededFromPortfolio = Math.max(0, retIncome - annualSSIncome);
  const neededNestEgg = neededFromPortfolio / 0.04;
  const gap = neededNestEgg - projBalance;
  const addlNeeded = gap > 0 && yearsToRet > 0 ? gap / fvP(1, returnRate, yearsToRet) : 0;

  let score = 50;
  const replaceRatio = income > 0 ? projBalance * 0.04 / income * 100 : 0;
  if (replaceRatio >= 80) score += 25; else if (replaceRatio >= 60) score += 15; else if (replaceRatio >= 40) score += 8;
  if (annualContrib / Math.max(income, 1) >= 0.15) score += 10; else if (annualContrib / Math.max(income, 1) >= 0.10) score += 5;
  if (totalSaved >= age * income / 10) score += 10; else if (totalSaved >= age * income / 20) score += 5;
  score = Math.max(10, Math.min(99, score));

  const savingsRate = income > 0 ? annualContrib / income * 100 : 0;
  const fidelityBenchmark = age <= 30 ? income : age <= 35 ? income * 2 : age <= 40 ? income * 3 : age <= 45 ? income * 4 : age <= 50 ? income * 6 : age <= 55 ? income * 7 : income * 8;

  return {
    score,
    grade: letterGrade(score),
    headline: gap > 0 ? `${fc(gap)} retirement gap — ${fc(addlNeeded / 12)}/month needed to close it` : `On track — ${fc(Math.abs(gap))} projected surplus at retirement`,
    summary: `At age ${age} with ${yearsToRet} years to retirement, your combined retirement assets of ${fc(totalSaved)} are projected to grow to **${fc(projBalance)}** at ${fp(returnRate * 100)} average return. Your target nest egg — to replace ${fp(retIncome / income * 100, 0)} of income beyond Social Security — is **${fc(neededNestEgg)}**. ${gap > 0 ? `Current trajectory leaves a ${fc(gap)} shortfall. Contributing an additional ${fc(addlNeeded / 12)}/month closes the gap.` : `You are projected to exceed your retirement target.`}`,
    scorecard: [
      { label: 'Retirement Savings', value: fc(totalSaved), sub: `Fidelity benchmark: ${fc(fidelityBenchmark)}`, status: totalSaved >= fidelityBenchmark ? 'good' : totalSaved >= fidelityBenchmark * 0.7 ? 'warning' : 'critical' },
      { label: 'Projected at Retirement', value: fc(projBalance), sub: `Target: ${fc(neededNestEgg)}`, status: projBalance >= neededNestEgg ? 'good' : projBalance >= neededNestEgg * 0.75 ? 'warning' : 'critical' },
      { label: 'Savings Rate', value: fp(savingsRate), sub: 'Target: 15%+ of income', status: savingsRate >= 15 ? 'good' : savingsRate >= 10 ? 'warning' : 'critical' },
      { label: 'Income Replacement', value: fp(replaceRatio, 0), sub: 'Target: 80% of income', status: replaceRatio >= 80 ? 'good' : replaceRatio >= 60 ? 'warning' : 'critical' },
      { label: 'Years to Retirement', value: `${yearsToRet} years`, sub: `Target age: ${retAge}`, status: yearsToRet >= 25 ? 'good' : yearsToRet >= 15 ? 'warning' : 'critical' },
      { label: 'Funding Gap', value: gap > 0 ? fc(gap) : 'Surplus', sub: gap > 0 ? `Add ${fc(addlNeeded / 12)}/mo` : fc(Math.abs(gap)) + ' surplus', status: gap <= 0 ? 'good' : gap < neededNestEgg * 0.3 ? 'warning' : 'critical' },
    ],
    charts: [
      {
        type: 'area',
        title: 'Retirement Portfolio Growth Projection',
        data: (() => {
          const pts = [];
          for (let y = 0; y <= yearsToRet; y += Math.max(1, Math.floor(yearsToRet / 8))) {
            pts.push({
              name: `Age ${age + y}`,
              Base: Math.round(fvL(totalSaved, returnRate, y) + fvP(annualContrib, returnRate, y)),
              Conservative: Math.round(fvL(totalSaved, 0.05, y) + fvP(annualContrib, 0.05, y)),
              Target: Math.round(neededNestEgg * (y / Math.max(yearsToRet, 1))),
            });
          }
          return pts;
        })(),
        xKey: 'name',
        lines: [
          { key: 'Base', label: 'Base Case', color: GOLD },
          { key: 'Conservative', label: 'Conservative', color: BLUE },
          { key: 'Target', label: 'Target', color: RED },
        ],
      },
      {
        type: 'donut',
        title: 'Retirement Income Sources at Retirement',
        data: [
          { name: 'Portfolio (4% Rule)', value: Math.round(projBalance * 0.04) },
          { name: 'Social Security', value: Math.round(annualSSIncome) },
          { name: 'Pension', value: Math.round(pension * 0.04) },
        ].filter(d => d.value > 0),
      },
      {
        type: 'bar',
        title: 'Fidelity Age Savings Benchmarks',
        data: [
          { name: `Age ${age} (You)`, Current: totalSaved, Benchmark: fidelityBenchmark },
          { name: `Age ${Math.min(retAge, age + 10)}`, Current: fvL(totalSaved, returnRate, Math.min(10, yearsToRet)) + fvP(annualContrib, returnRate, Math.min(10, yearsToRet)), Benchmark: fidelityBenchmark * (age <= 40 ? 1.5 : 1.25) },
        ],
        xKey: 'name',
        bars: [
          { key: 'Current', label: 'Projected Balance', color: GOLD },
          { key: 'Benchmark', label: 'Fidelity Benchmark', color: BLUE },
        ],
      },
    ],
    sections: [
      {
        title: 'Current Retirement Position',
        content: `Total retirement assets of ${fc(totalSaved)} span ${k401 > 0 ? `401(k)/403(b): ${fc(k401)}` : ''}${ira > 0 ? `, IRA: ${fc(ira)}` : ''}${pension > 0 ? `, Pension/Other: ${fc(pension)}` : ''}. The Fidelity benchmark for age ${age} suggests ${fc(fidelityBenchmark)} — you are at ${fn(totalSaved / Math.max(fidelityBenchmark, 1) * 100, 0)}% of this milestone. Annual contributions of ${fc(annualContrib)} represent ${fp(savingsRate)} of income.`,
        bigNumbers: [
          { value: fc(totalSaved), label: 'Total Saved Today', sub: `${fn(totalSaved / Math.max(fidelityBenchmark, 1) * 100, 0)}% of age benchmark`, color: totalSaved >= fidelityBenchmark ? GREEN : GOLD },
          { value: fc(projBalance), label: 'Projected at Retirement', sub: `At ${fp(returnRate * 100)} avg return`, color: projBalance >= neededNestEgg ? GREEN : RED },
          { value: fc(neededNestEgg), label: 'Target Nest Egg', sub: '4% safe withdrawal rule', color: BLUE },
        ],
        callouts: [
          gap > 0 ? { type: 'critical', title: `${fc(gap)} Funding Gap`, text: `At current trajectory, you will retire with ${fc(projBalance)} vs. a needed ${fc(neededNestEgg)}. To close this gap, contribute an additional ${fc(addlNeeded / 12)}/month starting today. Waiting 5 years would require ${fc(addlNeeded * 1.4 / 12)}/month — time is your most valuable asset.` } : { type: 'good', title: 'On Track for Retirement', text: `Your projected ${fc(projBalance)} exceeds the ${fc(neededNestEgg)} target by ${fc(Math.abs(gap))}. Continue current contributions and consider whether early retirement is possible.` },
        ],
      },
      {
        title: 'Contribution Scenario Analysis',
        content: `Different contribution levels produce dramatically different outcomes over ${yearsToRet} years of compounding. The table below shows projected portfolio value at retirement based on annual contribution amount, illustrating the power of incremental increases.`,
        table: {
          headers: ['Annual Contribution', 'Monthly', 'Projected Balance', 'vs. Target', 'Coverage'],
          rows: [
            [fc(annualContrib * 0.5), fc(annualContrib * 0.5 / 12), fc(fvL(totalSaved, returnRate, yearsToRet) + fvP(annualContrib * 0.5, returnRate, yearsToRet)), fc(neededNestEgg - (fvL(totalSaved, returnRate, yearsToRet) + fvP(annualContrib * 0.5, returnRate, yearsToRet))), fp((fvL(totalSaved, returnRate, yearsToRet) + fvP(annualContrib * 0.5, returnRate, yearsToRet)) / neededNestEgg * 100, 0)],
            [fc(annualContrib), fc(annualContrib / 12), fc(projBalance), gap > 0 ? `-${fc(gap)}` : `+${fc(Math.abs(gap))}`, fp(projBalance / neededNestEgg * 100, 0)],
            [fc(annualContrib * 1.5), fc(annualContrib * 1.5 / 12), fc(fvL(totalSaved, returnRate, yearsToRet) + fvP(annualContrib * 1.5, returnRate, yearsToRet)), fc(neededNestEgg - (fvL(totalSaved, returnRate, yearsToRet) + fvP(annualContrib * 1.5, returnRate, yearsToRet))), fp((fvL(totalSaved, returnRate, yearsToRet) + fvP(annualContrib * 1.5, returnRate, yearsToRet)) / neededNestEgg * 100, 0)],
            [fc(23000 + 7000), fc((23000 + 7000) / 12), fc(fvL(totalSaved, returnRate, yearsToRet) + fvP(30000, returnRate, yearsToRet)), fc(neededNestEgg - (fvL(totalSaved, returnRate, yearsToRet) + fvP(30000, returnRate, yearsToRet))), fp((fvL(totalSaved, returnRate, yearsToRet) + fvP(30000, returnRate, yearsToRet)) / neededNestEgg * 100, 0)],
          ],
          highlight: 1,
        },
      },
      buildPersonalizedPortfolio(data),
      {
        title: 'Retirement-Specific Fund Recommendations',
        content: `The instruments below are selected specifically for the retirement accumulation and decumulation phases. 401(k) plan menus often limit choices — where restricted, prioritize the lowest-cost index funds available. For IRAs and taxable accounts, the full universe below applies.`,
        table: {
          headers: ['Ticker', 'Name', 'ER', 'Type', 'Best For'],
          rows: RETIREMENT_TICKERS.map(t => [t.ticker, t.name, t.er, t.type, t.notes]),
        },
        callouts: [
          { type: 'info', title: 'The Accumulation → Decumulation Transition', text: 'During accumulation (working years): maximize growth via total market equity + factor tilts. In the 5 years before retirement (glide path): shift 5% from equities to short-duration bonds annually. In decumulation: bucket strategy — Bucket 1: 2 years expenses in SGOV/SPAXX; Bucket 2: 5 years in SCHD + BND; Bucket 3: remainder in VTI/AVUV for long-run growth. Refill buckets from Bucket 3 in up markets, hold in down markets.' },
          { type: 'good', title: 'Target Date Funds — When They Work', text: 'Target date funds (VTTSX, FXIFX) are excellent for 401(k)s where they are the only low-cost option. They auto-rebalance and de-risk. Weakness: they contain bonds too early for aggressive investors, and they cannot be tax-location optimized. If you have both 401k and IRA, prefer individual index funds across accounts for optimal asset location.' },
        ],
      },
    ],
    scenarios: [
      {
        outcome: `Conservative: ${fc(fvL(totalSaved, 0.05, yearsToRet) + fvP(annualContrib, 0.05, yearsToRet))}`,
        description: `5% average return (bond-heavy portfolio). Income replacement: ${fp((fvL(totalSaved, 0.05, yearsToRet) + fvP(annualContrib, 0.05, yearsToRet)) * 0.04 / income * 100, 0)}. May require Social Security optimization and part-time income.`,
      },
      {
        outcome: `Base Case: ${fc(projBalance)}`,
        description: `${fp(returnRate * 100)} average return. Income replacement: ${fp(replaceRatio, 0)}. ${gap <= 0 ? 'Target achieved.' : `Gap of ${fc(gap)} — increase contributions by ${fc(addlNeeded / 12)}/mo.`}`,
      },
      {
        outcome: `Optimistic: ${fc(fvL(totalSaved, 0.09, yearsToRet) + fvP(annualContrib * 1.25, 0.09, yearsToRet))}`,
        description: `9% return + 25% contribution increase. Income replacement: ${fp((fvL(totalSaved, 0.09, yearsToRet) + fvP(annualContrib * 1.25, 0.09, yearsToRet)) * 0.04 / income * 100, 0)}. Early retirement or significant legacy possible.`,
      },
    ],
    actions: [
      { priority: 'CRITICAL', timeline: 'Immediately', action: 'Capture full employer 401(k) match', impact: 'Instant 50–100% return — no investment can match this', amount: 'Up to full match' },
      gap > 0 ? { priority: 'HIGH', timeline: 'This Pay Period', action: `Increase retirement contributions by ${fc(addlNeeded / 12)}/month`, impact: `Closes the ${fc(gap)} retirement funding gap by age ${retAge}`, amount: fc(addlNeeded / 12) + '/mo' } : null,
      { priority: 'HIGH', timeline: 'By April 15', action: 'Max IRA contribution for current tax year', impact: `${fc(7000)} more in tax-sheltered compounding annually`, amount: fc(7000) },
      age >= 50 ? { priority: 'HIGH', timeline: 'Now (age 50+ benefit)', action: 'Utilize catch-up contributions — 401(k) +$7,500, IRA +$1,000', impact: `$8,500/year in extra tax-advantaged contributions`, amount: '$8,500/yr extra' } : null,
      { priority: 'MEDIUM', timeline: 'Annually', action: 'Review and rebalance portfolio allocation', impact: `Maintains ${riskTol.toLowerCase()} risk profile as retirement approaches`, amount: 'No cost' },
      { priority: 'MEDIUM', timeline: 'Within 1 Year', action: 'Get a Social Security benefits estimate at ssa.gov', impact: 'Optimizing SS claiming strategy can add $50,000–$150,000 in lifetime benefits', amount: 'Free' },
    ].filter(Boolean),
  };
}

// ─── 4. Portfolio Review ──────────────────────────────────────────────────────

function generatePortfolioReview(data) {
  const total = parseFloat(data.total_portfolio) || 0;
  // form uses us_stocks_pct; international_pct and alternatives_pct fill out the rest
  const usStocks = parseFloat(data.us_stocks_pct) || 0;
  const intl = parseFloat(data.international_pct) || 0;
  const stocks = usStocks + intl;
  const bonds = parseFloat(data.bonds_pct) || 0;
  const alternatives = parseFloat(data.alternatives_pct) || 0;
  const realEstate = 0;
  const cash = Math.max(0, 100 - stocks - bonds - alternatives);
  const other = alternatives;
  const age = parseFloat(data.age) || 40;
  const riskTol = data.risk_tolerance || 'Moderate';
  // form uses investment_horizon
  const timeHorizon = parseFloat(data.investment_horizon) || 20;
  const annualReturn = parseFloat(data.annual_contribution) || 0; // annual_contribution used as proxy
  const ytdReturn = 0;
  const fees = 0.5; // no expense_ratio field in form, use sensible default

  const targetStocks = riskTol === 'Conservative' ? 40 : riskTol === 'Aggressive' ? 90 : 60;
  const targetBonds = riskTol === 'Conservative' ? 50 : riskTol === 'Aggressive' ? 10 : 30;
  const targetCash = 5;
  const targetREIT = riskTol === 'Aggressive' ? 5 : riskTol === 'Conservative' ? 3 : 5;

  const stockDrift = stocks - targetStocks;
  const bondDrift = bonds - targetBonds;
  const needsRebalance = Math.abs(stockDrift) > 5 || Math.abs(bondDrift) > 5;
  const feeImpact10yr = total * (fees / 100) * 10;
  const feeImpact30yr = fvL(total, 0.07, 30) - fvL(total, 0.07 - fees / 100, 30);

  let score = 60;
  if (fees < 0.1) score += 15; else if (fees < 0.3) score += 10; else if (fees < 0.5) score += 5; else if (fees > 1.0) score -= 10;
  if (!needsRebalance) score += 10; else score -= 5;
  if (stocks > 0 && bonds > 0) score += 5;
  if (cash > 15) score -= 8;
  if (annualReturn > 7) score += 10; else if (annualReturn > 5) score += 5;
  score = Math.max(10, Math.min(99, score));

  return {
    score,
    grade: letterGrade(score),
    headline: `${needsRebalance ? `Portfolio drift of ${fn(Math.abs(stockDrift), 0)}% from target — rebalancing needed` : 'Portfolio allocation near target'} · ${fees > 0.5 ? `High fees costing ${fc(feeImpact10yr)} over 10 years` : 'Competitive expense ratios'}`,
    summary: `${fc(total)} portfolio with ${fn(stocks, 0)}% equities / ${fn(bonds, 0)}% fixed income / ${fn(cash, 0)}% cash. Target allocation for ${riskTol.toLowerCase()} risk tolerance is ${fn(targetStocks, 0)}%/${fn(targetBonds, 0)}%/${fn(targetCash, 0)}%. ${needsRebalance ? `Current drift of ${fn(Math.abs(stockDrift), 0)}% in equities requires rebalancing.` : 'Allocation is within acceptable drift bands.'} Expense ratio of ${fp(fees)} will cost ${fc(feeImpact30yr)} in foregone returns over 30 years.`,
    scorecard: [
      { label: 'Equity Allocation', value: fp(stocks), sub: `Target: ${fp(targetStocks)}`, status: Math.abs(stockDrift) <= 5 ? 'good' : Math.abs(stockDrift) <= 10 ? 'warning' : 'critical' },
      { label: 'Bond Allocation', value: fp(bonds), sub: `Target: ${fp(targetBonds)}`, status: Math.abs(bondDrift) <= 5 ? 'good' : Math.abs(bondDrift) <= 10 ? 'warning' : 'critical' },
      { label: 'Cash Allocation', value: fp(cash), sub: 'Target: under 5%', status: cash <= 5 ? 'good' : cash <= 15 ? 'warning' : 'critical' },
      { label: 'Expense Ratio', value: fp(fees), sub: 'Target: under 0.20%', status: fees < 0.2 ? 'good' : fees < 0.5 ? 'warning' : 'critical' },
      { label: 'Rebalancing Needed', value: needsRebalance ? 'YES' : 'No', sub: needsRebalance ? `${fn(Math.abs(stockDrift), 0)}% stock drift` : 'Within 5% bands', status: needsRebalance ? 'warning' : 'good' },
      { label: '30-Year Fee Cost', value: fc(feeImpact30yr), sub: 'Cumulative drag on returns', status: feeImpact30yr < total * 0.5 ? 'warning' : 'critical' },
    ],
    charts: [
      {
        type: 'donut',
        title: 'Current Asset Allocation',
        data: [
          { name: 'Stocks/Equities', value: stocks },
          { name: 'Bonds/Fixed Income', value: bonds },
          { name: 'Real Estate/REITs', value: realEstate },
          { name: 'Cash', value: cash },
          { name: 'Other', value: other },
        ].filter(d => d.value > 0),
      },
      {
        type: 'bar',
        title: 'Current vs. Target Allocation',
        data: [
          { name: 'Stocks', Current: stocks, Target: targetStocks },
          { name: 'Bonds', Current: bonds, Target: targetBonds },
          { name: 'REITs', Current: realEstate, Target: targetREIT },
          { name: 'Cash', Current: cash, Target: targetCash },
        ],
        xKey: 'name',
        bars: [
          { key: 'Current', label: 'Current %', color: GOLD },
          { key: 'Target', label: 'Target %', color: BLUE },
        ],
      },
      {
        type: 'area',
        title: `Portfolio Growth — Low vs. High Fee Impact (${fc(total)} invested)`,
        data: (() => {
          const pts = [];
          for (let y = 0; y <= 30; y += 5) {
            pts.push({
              name: `Year ${y}`,
              'Low Fee (0.05%)': Math.round(fvL(total, 0.07 - 0.0005, y)),
              'Current Fee': Math.round(fvL(total, 0.07 - fees / 100, y)),
              'High Fee (1.5%)': Math.round(fvL(total, 0.07 - 0.015, y)),
            });
          }
          return pts;
        })(),
        xKey: 'name',
        lines: [
          { key: 'Low Fee (0.05%)', label: 'Low Fee (0.05%)', color: GREEN },
          { key: 'Current Fee', label: `Current (${fp(fees)})`, color: GOLD },
          { key: 'High Fee (1.5%)', label: 'High Fee (1.5%)', color: RED },
        ],
      },
    ],
    sections: [
      {
        title: 'Allocation Analysis & Rebalancing',
        content: `Your ${riskTol.toLowerCase()} risk tolerance with a ${timeHorizon}-year horizon suggests a target of ${fn(targetStocks, 0)}% stocks / ${fn(targetBonds, 0)}% bonds / ${fn(targetCash, 0)}% cash. Current allocation shows stocks at ${fn(stocks, 0)}% (${stockDrift > 0 ? `+${fn(stockDrift, 0)}% overweight` : `${fn(stockDrift, 0)}% underweight`}) and bonds at ${fn(bonds, 0)}% (${bondDrift > 0 ? `+${fn(bondDrift, 0)}% overweight` : `${fn(bondDrift, 0)}% underweight`}).`,
        bars: [
          { label: `Stocks — ${fn(stocks, 0)}% actual vs ${fn(targetStocks, 0)}% target`, value: stocks, max: 100, pct: stocks, color: Math.abs(stockDrift) <= 5 ? GREEN : RED, showValue: true },
          { label: `Bonds — ${fn(bonds, 0)}% actual vs ${fn(targetBonds, 0)}% target`, value: bonds, max: 100, pct: bonds, color: Math.abs(bondDrift) <= 5 ? GREEN : GOLD, showValue: true },
          { label: `Cash — ${fn(cash, 0)}% actual vs ${fn(targetCash, 0)}% target`, value: cash, max: 100, pct: cash, color: cash <= 5 ? GREEN : RED, showValue: true },
        ],
        callouts: [
          needsRebalance ? { type: 'warning', title: 'Rebalancing Required', text: `Your portfolio has drifted ${fn(Math.abs(stockDrift), 0)}% from target equity allocation. Rebalancing to target requires ${stockDrift > 0 ? 'selling' : 'buying'} approximately ${fc(total * Math.abs(stockDrift) / 100)} in equities. Consider rebalancing through new contributions first to minimize tax impact.` } : null,
          { type: 'info', title: 'Rebalancing Best Practices', text: 'Rebalance when any asset class drifts more than 5% from target — typically 1–2 times per year. In taxable accounts, use new contributions to buy underweight assets rather than selling to minimize capital gains taxes.' },
        ].filter(Boolean),
      },
      {
        title: 'Fee Analysis — The Silent Wealth Killer',
        content: `At ${fp(fees)} average expense ratio on ${fc(total)}, fees are consuming ${fc(total * fees / 100)}/year in returns. Over 30 years at 7% gross return, this difference in fees compounds to ${fc(feeImpact30yr)} in foregone wealth. Index funds from Vanguard (VTI at 0.03%), Fidelity (FZROX at 0%), and Schwab (SCHB at 0.03%) provide equivalent market exposure at 95%+ lower cost.`,
        table: {
          headers: ['Expense Ratio', 'Annual Cost', '10-Year Cost', '30-Year Foregone Value', 'Rating'],
          rows: [
            ['0.03% (Index)', fc(total * 0.0003), fc(total * 0.0003 * 10), '$0 (benchmark)', 'Excellent'],
            ['0.10%', fc(total * 0.001), fc(total * 0.001 * 10), fc(fvL(total, 0.07, 30) - fvL(total, 0.069, 30)), 'Good'],
            ['0.50%', fc(total * 0.005), fc(total * 0.005 * 10), fc(fvL(total, 0.07, 30) - fvL(total, 0.065, 30)), 'Acceptable'],
            [fp(fees) + ' (Current)', fc(total * fees / 100), fc(total * fees / 100 * 10), fc(feeImpact30yr), fees > 0.5 ? 'High — Reduce' : 'Review'],
            ['1.50% (Active)', fc(total * 0.015), fc(total * 0.015 * 10), fc(fvL(total, 0.07, 30) - fvL(total, 0.055, 30)), 'Avoid'],
          ],
          highlight: 3,
        },
      },
      buildPersonalizedPortfolio(data),
    ],
    scenarios: [
      {
        outcome: `Conservative: ${fc(fvL(total, 0.05, timeHorizon))}`,
        description: `5% return, current allocation. Lower equity exposure reduces volatility but caps growth. Suitable only if timeline shortens or income needs increase.`,
      },
      {
        outcome: `Base Case: ${fc(fvL(total, 0.07 - fees / 100, timeHorizon))}`,
        description: `7% gross return minus current fees. Rebalancing to ${fn(targetStocks, 0)}/${fn(targetBonds, 0)} target. Standard long-term equity market expectation.`,
      },
      {
        outcome: `Optimized: ${fc(fvL(total, 0.07 - 0.0005, timeHorizon))}`,
        description: `7% return, switch to 0.05% index funds. ${fc(fvL(total, 0.07 - 0.0005, timeHorizon) - fvL(total, 0.07 - fees / 100, timeHorizon))} more than current fee structure over ${timeHorizon} years — purely from cost reduction.`,
      },
    ],
    actions: [
      needsRebalance ? { priority: 'HIGH', timeline: 'Within 30 Days', action: `Rebalance to ${fn(targetStocks, 0)}% stocks / ${fn(targetBonds, 0)}% bonds target`, impact: 'Aligns portfolio with stated risk tolerance and time horizon', amount: fc(total * Math.abs(stockDrift) / 100) + ' to rebalance' } : null,
      fees > 0.5 ? { priority: 'HIGH', timeline: 'Within 60 Days', action: 'Audit and reduce expense ratios — switch high-fee funds to index equivalents', impact: `Saves ${fc(feeImpact30yr)} over 30 years through fee reduction alone`, amount: `${fp(fees - 0.05)} potential fee reduction` } : null,
      cash > 10 ? { priority: 'HIGH', timeline: 'This Month', action: `Invest excess cash — ${fn(cash - 5, 0)}% above target cash allocation`, impact: `${fc(total * (cash - 5) / 100)} earning near-zero returns instead of market returns`, amount: fc(total * (cash - 5) / 100) } : null,
      { priority: 'MEDIUM', timeline: 'Annually', action: 'Set calendar reminder for annual portfolio review and rebalancing', impact: 'Prevents drift from target and maintains risk profile', amount: 'No cost' },
      { priority: 'MEDIUM', timeline: 'Next Tax Season', action: 'Review holdings for tax-loss harvesting opportunities', impact: 'Offset capital gains with losses — no change in market exposure', amount: 'Varies by portfolio' },
    ].filter(Boolean),
  };
}

// ─── 5. Debt Elimination ──────────────────────────────────────────────────────

function generateDebtElimination(data) {
  // form provides a single credit card balance + rate field
  const cc1 = parseFloat(data.credit_card_balance) || 0;
  const cc1r = parseFloat(data.credit_card_rate) || 22;
  const cc2 = 0; // form doesn't have a second CC field
  const cc2r = 19;
  // form uses student_loan_balance
  const student = parseFloat(data.student_loan_balance) || 0;
  const studentR = parseFloat(data.student_loan_rate) || 6;
  const auto = parseFloat(data.auto_loan) || 0;
  const autoR = 7; // no auto rate field in form
  const personal = parseFloat(data.personal_loan) || 0;
  const personalR = parseFloat(data.personal_loan_rate) || 14;
  const income = parseFloat(data.monthly_income) || 0;
  // form uses monthly_expenses instead of total_min_payments
  const minPayments = parseFloat(data.monthly_expenses) || 0;
  const extraPayment = parseFloat(data.extra_monthly) || 0;
  // form uses preferred_method
  const strategy = data.preferred_method || 'Avalanche';

  const debts = [
    { name: 'Credit Card 1', balance: cc1, rate: cc1r },
    { name: 'Credit Card 2', balance: cc2, rate: cc2r },
    { name: 'Student Loans', balance: student, rate: studentR },
    { name: 'Auto Loan', balance: auto, rate: autoR },
    { name: 'Personal Loan', balance: personal, rate: personalR },
  ].filter(d => d.balance > 0);

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalAnnualInterest = debts.reduce((s, d) => s + d.balance * d.rate / 100, 0);
  const dti = income > 0 ? minPayments / income * 100 : 0;

  // Simple payoff estimate (divide total debt by monthly extra + min payments)
  const monthlyPayment = minPayments + extraPayment;
  const avgRate = totalDebt > 0 ? totalAnnualInterest / totalDebt : 0;
  const monthsToPayoff = avgRate > 0 && monthlyPayment > 0 ? Math.log(monthlyPayment / (monthlyPayment - totalDebt * avgRate / 12)) / Math.log(1 + avgRate / 12) : totalDebt / Math.max(monthlyPayment, 1);
  const yearsToPayoff = monthsToPayoff / 12;
  const totalInterestPaid = monthlyPayment * monthsToPayoff - totalDebt;

  let score = 70;
  if (dti > 43) score -= 20; else if (dti > 36) score -= 10; else if (dti > 28) score -= 5;
  if ((cc1 + cc2) > 10000) score -= 15; else if ((cc1 + cc2) > 5000) score -= 8;
  if (totalDebt < income * 12) score += 10; else if (totalDebt > income * 24) score -= 10;
  score = Math.max(10, Math.min(99, score));

  const sortedAvalanche = [...debts].sort((a, b) => b.rate - a.rate);
  const sortedSnowball = [...debts].sort((a, b) => a.balance - b.balance);

  return {
    score,
    grade: letterGrade(score),
    headline: `${fc(totalDebt)} total debt · ${fc(totalAnnualInterest)}/year in interest · payoff in ~${fn(yearsToPayoff, 1)} years`,
    summary: `You carry ${fc(totalDebt)} across ${debts.length} debt obligation${debts.length !== 1 ? 's' : ''}, costing ${fc(totalAnnualInterest)} in annual interest charges. At ${fc(monthlyPayment)}/month total payments, you'll be debt-free in approximately ${fn(yearsToPayoff, 1)} years paying ${fc(totalInterestPaid)} in total interest. ${strategy === 'Avalanche' ? 'The Avalanche method (highest rate first) minimizes total interest paid.' : 'The Snowball method (lowest balance first) builds momentum through quick wins.'}`,
    scorecard: [
      { label: 'Total Debt', value: fc(totalDebt), sub: `${debts.length} obligations`, status: totalDebt < income * 6 ? 'good' : totalDebt < income * 12 ? 'warning' : 'critical' },
      { label: 'Annual Interest Cost', value: fc(totalAnnualInterest), sub: `${fp(avgRate * 100)} avg rate`, status: avgRate < 0.05 ? 'good' : avgRate < 0.10 ? 'warning' : 'critical' },
      { label: 'Debt-to-Income', value: fp(dti), sub: 'Monthly payments vs income', status: dti <= 28 ? 'good' : dti <= 36 ? 'warning' : 'critical' },
      { label: 'Payoff Timeline', value: `${fn(yearsToPayoff, 1)} years`, sub: `At ${fc(monthlyPayment)}/month`, status: yearsToPayoff <= 3 ? 'good' : yearsToPayoff <= 7 ? 'warning' : 'critical' },
      { label: 'High-Interest Debt', value: fc(cc1 + cc2), sub: 'Credit cards (15–29% APR)', status: (cc1 + cc2) === 0 ? 'good' : (cc1 + cc2) < 5000 ? 'warning' : 'critical' },
      { label: 'Total Interest to Pay', value: fc(totalInterestPaid), sub: 'At current payment rate', status: totalInterestPaid < totalDebt * 0.1 ? 'good' : totalInterestPaid < totalDebt * 0.3 ? 'warning' : 'critical' },
    ],
    charts: [
      {
        type: 'donut',
        title: 'Debt Composition',
        data: debts.map(d => ({ name: d.name, value: d.balance })),
      },
      {
        type: 'bar',
        title: 'Debt Balances vs. Interest Rates',
        data: debts.map(d => ({ name: d.name, Balance: d.balance, 'Annual Interest': Math.round(d.balance * d.rate / 100) })),
        xKey: 'name',
        bars: [
          { key: 'Balance', label: 'Balance', color: BLUE },
          { key: 'Annual Interest', label: 'Annual Interest Cost', color: RED },
        ],
      },
      {
        type: 'bar',
        title: 'Payoff Priority — Avalanche Method (Highest Rate First)',
        data: sortedAvalanche.map((d, i) => ({ name: d.name, rate: d.rate, balance: d.balance, priority: i + 1 })),
        xKey: 'name',
        bars: [{ key: 'rate', label: 'Interest Rate %', color: GOLD }],
      },
    ],
    sections: [
      {
        title: 'Debt Priority Analysis',
        content: `**Avalanche Method** (mathematically optimal — minimum total interest): Attack ${sortedAvalanche[0]?.name} first at ${sortedAvalanche[0]?.rate}% APR, then cascade minimum + freed payment to next debt. Saves the most money but requires the most patience.\n\n**Snowball Method** (psychologically powerful — builds momentum): Pay off ${sortedSnowball[0]?.name} (${fc(sortedSnowball[0]?.balance)}) first for a quick win, then roll that payment into the next balance. Builds behavioral momentum that keeps people on track.`,
        table: {
          headers: ['Debt', 'Balance', 'Rate', 'Annual Interest', 'Avalanche Priority', 'Snowball Priority'],
          rows: debts.map(d => [
            d.name,
            fc(d.balance),
            fp(d.rate),
            fc(d.balance * d.rate / 100),
            String(sortedAvalanche.findIndex(a => a.name === d.name) + 1),
            String(sortedSnowball.findIndex(a => a.name === d.name) + 1),
          ]),
        },
        callouts: [
          (cc1 > 0 || cc2 > 0) ? { type: 'critical', title: 'Credit Card Debt: Highest Priority', text: `Credit card debt at 15–29% APR is the most destructive financial burden. Every ${fc(1000)} in credit card debt costs ${fc(220)}/year in interest. This should be the first target regardless of strategy — no investment reliably beats eliminating 22% guaranteed cost.` } : null,
          extraPayment > 0 ? { type: 'good', title: `Extra ${fc(extraPayment)}/Month Saves ${fc(totalInterestPaid * 0.3)}`, text: `Your extra ${fc(extraPayment)}/month contribution could save approximately ${fc(totalInterestPaid * 0.3)} in interest and cut your payoff timeline by ${fn(yearsToPayoff * 0.25, 1)} years. Even small extra payments have dramatic compounding effects.` } : { type: 'info', title: 'The Power of Extra Payments', text: `Adding just ${fc(100)}/month extra to your highest-rate debt can save thousands in interest and years off your payoff timeline. Every dollar above the minimum goes directly to principal.` },
        ].filter(Boolean),
      },
      {
        title: 'Debt Payoff Acceleration Strategies',
        content: `Beyond extra monthly payments, consider these acceleration tactics: **Balance transfer** — move high-rate credit card debt to a 0% intro APR card (typically 15–21 months, 3% transfer fee). **Debt consolidation loan** — consolidate multiple debts into one fixed-rate personal loan at 8–14% vs. 20%+ on credit cards. **Biweekly payments** — paying half your monthly amount every two weeks results in one extra full payment per year, reducing interest significantly.`,
        bigNumbers: [
          { value: fc(totalAnnualInterest), label: 'Annual Interest Drain', sub: 'Money not building wealth', color: RED },
          { value: fc(totalInterestPaid), label: 'Total Interest to Pay', sub: 'At current trajectory', color: RED },
          { value: `${fn(yearsToPayoff, 1)} yrs`, label: 'Debt-Free Timeline', sub: 'At current payment pace', color: GOLD },
        ],
      },
    ],
    scenarios: [
      {
        outcome: `Slow Payoff: ${fn(yearsToPayoff * 1.3, 1)} years — ${fc(totalInterestPaid * 1.3)} interest`,
        description: `Minimum payments only, no extra. Longest timeline, maximum interest paid. Credit card balances could take 15+ years on minimums alone.`,
      },
      {
        outcome: `Current Rate: ${fn(yearsToPayoff, 1)} years — ${fc(totalInterestPaid)} interest`,
        description: `${fc(monthlyPayment)}/month total. ${strategy} method applied. Interest cost decreases as balances fall.`,
      },
      {
        outcome: `Aggressive: ${fn(yearsToPayoff * 0.6, 1)} years — ${fc(totalInterestPaid * 0.5)} interest`,
        description: `Add ${fc(extraPayment * 2 || income * 0.1)}/month extra from budget cuts or side income. Could cut timeline by 40% and save ${fc(totalInterestPaid * 0.5)} in interest charges.`,
      },
    ],
    actions: [
      (cc1 > 0 || cc2 > 0) ? { priority: 'CRITICAL', timeline: 'This Month', action: `Apply ${strategy === 'Avalanche' ? 'every extra dollar' : 'focused payment'} to ${sortedAvalanche[0]?.name} at ${fp(sortedAvalanche[0]?.rate)} APR`, impact: `Eliminates ${fc(sortedAvalanche[0]?.balance * sortedAvalanche[0]?.rate / 100)}/year in interest on highest-rate debt`, amount: `Target: ${fc(sortedAvalanche[0]?.balance)}` } : null,
      { priority: 'HIGH', timeline: 'Within 30 Days', action: 'Call each lender and request interest rate reduction', impact: '25–40% of callers receive rate reductions — costs nothing to ask', amount: 'Potentially hundreds/year' },
      { priority: 'HIGH', timeline: 'Within 60 Days', action: 'Check balance transfer offers — move high-rate CC to 0% intro APR card', impact: `18 months at 0% on ${fc(cc1 + cc2)} saves ~${fc((cc1 + cc2) * 0.22 * 1.5)} in interest`, amount: `${fc((cc1 + cc2) * 0.03)} transfer fee` },
      { priority: 'MEDIUM', timeline: 'Monthly', action: 'Automate extra debt payment on paydays before discretionary spending', impact: 'Removes willpower from the equation — consistency beats intensity', amount: fc(extraPayment || 200) + '/mo' },
      { priority: 'MEDIUM', timeline: 'Within 1 Year', action: 'Explore debt consolidation loan at lower fixed rate', impact: `Consolidate multiple debts into single payment at 8–12% vs ${fp(avgRate * 100)} average`, amount: fc(totalDebt) },
    ].filter(Boolean),
  };
}

// ─── 6. Insurance Audit ───────────────────────────────────────────────────────

function generateInsuranceAudit(data) {
  const income = parseFloat(data.annual_income) || 0;
  const netWorth = parseFloat(data.net_worth) || 0;
  const dependents = parseFloat(data.dependents) || 0;
  // form uses life_coverage_amount
  const lifeInsurance = parseFloat(data.life_coverage_amount) || 0;
  // form uses disability_insurance as a yes/no select — treat "Yes" as 60% coverage
  const hasDisability = data.disability_insurance === 'Yes, employer-provided' || data.disability_insurance === 'Yes, private policy';
  const disabilityPct = hasDisability ? 60 : 0;
  // form uses umbrella_policy
  const hasUmbrella = data.umbrella_policy === 'Yes';
  // form uses long_term_care
  const hasLTC = data.long_term_care === 'Yes';
  // form uses annual_health_premium as proxy; estimate OOP from premium
  const annualHealthPremium = parseFloat(data.annual_health_premium) || 0;
  const healthOOP = annualHealthPremium > 0 ? annualHealthPremium * 2 : 5000;
  const age = parseFloat(data.age) || 40;
  // no mortgage field in insurance form — default to 0
  const mortgageBalance = 0;

  // DIME formula: Debt + Income replacement + Mortgage + Education
  const dimeLife = (income * 10) + mortgageBalance + (dependents * 50000);
  const lifeGap = Math.max(0, dimeLife - lifeInsurance);
  const recommendedDisability = income * 0.65;
  const currentDisability = income * disabilityPct / 100;
  const disabilityGap = Math.max(0, recommendedDisability - currentDisability);
  const umbrellaThreshold = 300000;
  const needsUmbrella = netWorth > umbrellaThreshold;

  const lifeTermCost = dependents > 0 ? lifeGap / 1000 * (age < 35 ? 0.55 : age < 45 ? 0.85 : age < 55 ? 1.95 : 3.50) : 0;
  const disabilityCost = disabilityGap > 0 ? disabilityGap / 100 * 2.5 : 0;
  const umbrellaAnnual = 200;

  let score = 70;
  if (lifeGap === 0) score += 10; else if (lifeGap < dimeLife * 0.3) score += 5; else if (lifeGap > dimeLife * 0.5) score -= 15;
  if (disabilityPct >= 60) score += 10; else if (disabilityPct >= 40) score += 5; else score -= 10;
  if (hasUmbrella || !needsUmbrella) score += 5;
  if (healthOOP < 7500) score += 5;
  score = Math.max(10, Math.min(99, score));

  return {
    score,
    grade: letterGrade(score),
    headline: `${lifeGap > 0 ? `${fc(lifeGap)} life insurance gap` : 'Life insurance adequate'} · ${disabilityGap > 0 ? `${fp(65 - disabilityPct)}% disability coverage gap` : 'Disability covered'} · ${!hasUmbrella && needsUmbrella ? 'No umbrella policy' : 'Umbrella status reviewed'}`,
    summary: `Insurance audit reveals ${lifeGap > 0 ? `a ${fc(lifeGap)} life insurance gap vs. the DIME formula target of ${fc(dimeLife)}` : 'adequate life insurance coverage'}. ${disabilityGap > 0 ? `Disability coverage at ${fn(disabilityPct, 0)}% of income leaves a ${fc(disabilityGap)} annual income gap if you cannot work.` : `Disability coverage at ${fn(disabilityPct, 0)}% meets the 60–65% benchmark.`} ${needsUmbrella && !hasUmbrella ? `With net worth of ${fc(netWorth)}, an umbrella liability policy is strongly recommended at ~${fc(umbrellaAnnual)}/year.` : ''}`,
    scorecard: [
      { label: 'Life Insurance Coverage', value: fc(lifeInsurance), sub: `DIME target: ${fc(dimeLife)}`, status: lifeGap === 0 ? 'good' : lifeGap < dimeLife * 0.3 ? 'warning' : 'critical' },
      { label: 'Life Insurance Gap', value: lifeGap > 0 ? fc(lifeGap) : 'Fully Covered', sub: dependents > 0 ? `${dependents} dependents` : 'No dependents', status: lifeGap === 0 ? 'good' : lifeGap < 200000 ? 'warning' : 'critical' },
      { label: 'Disability Coverage', value: `${fn(disabilityPct, 0)}% of income`, sub: 'Target: 60–65%', status: disabilityPct >= 60 ? 'good' : disabilityPct >= 40 ? 'warning' : 'critical' },
      { label: 'Umbrella Policy', value: hasUmbrella ? 'Yes' : 'No', sub: needsUmbrella ? 'Recommended' : 'Optional', status: hasUmbrella ? 'good' : needsUmbrella ? 'critical' : 'neutral' },
      { label: 'Long-Term Care', value: hasLTC ? 'Covered' : 'No Coverage', sub: age >= 55 ? 'Consider now' : 'Plan for 55+', status: hasLTC ? 'good' : age >= 60 ? 'warning' : 'neutral' },
      { label: 'Health OOP Max', value: fc(healthOOP), sub: 'Annual exposure', status: healthOOP < 5000 ? 'good' : healthOOP < 8000 ? 'warning' : 'critical' },
    ],
    charts: [
      {
        type: 'bar',
        title: 'Life Insurance: Current vs. DIME Formula Target',
        data: [
          { name: 'Income Replacement (10×)', value: income * 10 },
          { name: 'Mortgage Balance', value: mortgageBalance },
          { name: 'Education (per dependent)', value: dependents * 50000 },
          { name: 'Current Coverage', value: lifeInsurance },
        ],
        xKey: 'name',
        bars: [{ key: 'value', label: 'Amount', color: BLUE }],
      },
      {
        type: 'donut',
        title: 'Disability Coverage Gap',
        data: [
          { name: 'Current Coverage', value: Math.min(disabilityPct, 65) },
          { name: 'Gap to 65% Target', value: Math.max(0, 65 - disabilityPct) },
          { name: 'Not Covered (above 65%)', value: 35 },
        ].filter(d => d.value > 0),
      },
      {
        type: 'bar',
        title: 'Insurance Coverage Gaps & Estimated Fix Costs',
        data: [
          lifeGap > 0 ? { name: 'Life Insurance Gap', gap: lifeGap, 'Fix Cost/Yr': Math.round(lifeTermCost * 12) } : null,
          disabilityGap > 0 ? { name: 'Disability Gap', gap: disabilityGap, 'Fix Cost/Yr': Math.round(disabilityCost) } : null,
          (!hasUmbrella && needsUmbrella) ? { name: 'Umbrella Liability', gap: 1000000, 'Fix Cost/Yr': umbrellaAnnual } : null,
        ].filter(Boolean),
        xKey: 'name',
        bars: [{ key: 'Fix Cost/Yr', label: 'Annual Premium to Close Gap', color: GOLD }],
      },
    ],
    sections: [
      {
        title: 'Life Insurance Analysis — DIME Formula',
        content: `The DIME formula (Debt + Income replacement + Mortgage + Education) calculates the minimum life insurance needed to protect your family. Based on your profile: **Income replacement** (10× income): ${fc(income * 10)} + **Mortgage payoff**: ${fc(mortgageBalance)} + **Education per dependent** (${dependents} × ${fc(50000)}): ${fc(dependents * 50000)} = **${fc(dimeLife)} total needed**. You currently have ${fc(lifeInsurance)} — a ${lifeGap > 0 ? `**gap of ${fc(lifeGap)}**` : '**surplus**'}. ${lifeGap > 0 ? `A ${fc(lifeGap)} 20-year term policy costs approximately ${fc(lifeTermCost * 12)}/year for your age group.` : 'No immediate action needed for life insurance.'}`,
        bigNumbers: [
          { value: fc(dimeLife), label: 'DIME Formula Target', sub: 'Recommended coverage', color: BLUE },
          { value: fc(lifeInsurance), label: 'Current Coverage', sub: 'Active life insurance', color: lifeGap === 0 ? GREEN : GOLD },
          { value: lifeGap > 0 ? fc(lifeGap) : 'Covered', label: lifeGap > 0 ? 'Coverage Gap' : 'Status', sub: lifeGap > 0 ? `~${fc(lifeTermCost * 12)}/yr to close` : 'No gap detected', color: lifeGap > 0 ? RED : GREEN },
        ],
        callouts: [
          dependents > 0 && lifeGap > 0 ? { type: 'critical', title: 'Life Insurance Gap with Dependents', text: `With ${dependents} dependent${dependents !== 1 ? 's' : ''}, the ${fc(lifeGap)} gap in life insurance is critical. If you died today, your family would face a ${fc(lifeGap)} shortfall. Term life insurance for the gap amount costs approximately ${fc(lifeTermCost * 12)}/year — one of the most affordable protections available.` } : null,
          { type: 'info', title: 'Term vs. Whole Life', text: 'For most working-age adults with dependents, term life (20–30 year term) is the most cost-effective choice — 5–15× cheaper than whole life for equivalent coverage. Buy term and invest the difference. Whole life makes sense only in specific estate planning scenarios.' },
        ].filter(Boolean),
      },
      {
        title: 'Disability Insurance — Your Most Important Asset',
        content: `Your greatest financial asset is your ability to earn income. A 40-year-old has a 29% chance of experiencing a 90-day+ disability before retirement. Short-term disability (STD) typically covers 60–70% of income for 3–6 months. Long-term disability (LTD) should provide 60–65% of income until age 65. ${disabilityGap > 0 ? `Your current ${fn(disabilityPct, 0)}% coverage leaves a ${fc(disabilityGap)} annual income gap. A supplemental individual disability policy would cost approximately ${fc(disabilityCost)}/year to close this gap.` : `Your ${fn(disabilityPct, 0)}% coverage meets the standard benchmark.`}`,
        callouts: [
          !hasUmbrella && needsUmbrella ? { type: 'warning', title: `Umbrella Policy Needed — Net Worth ${fc(netWorth)}`, text: `With net worth exceeding ${fc(umbrellaThreshold)}, a personal umbrella policy provides an extra ${fc(1000000)}–${fc(5000000)} in liability coverage above your auto/home limits. At ~${fc(umbrellaAnnual)}/year for ${fc(1000000)} in coverage, it's the best protection value in insurance.` } : null,
          age >= 55 && !hasLTC ? { type: 'warning', title: 'Long-Term Care Planning Window', text: `Average LTC costs exceed ${fc(100000)}/year in 2024 ($. The ideal time to purchase LTC insurance is ages 55–65 — affordable enough, but after health screenings. Hybrid life/LTC policies can provide coverage while preserving cash value.` } : null,
        ].filter(Boolean),
      },
    ],
    scenarios: [
      {
        outcome: 'Unprotected: Potential Loss = ' + fc(income * 10),
        description: `Current gaps leave ${fc(lifeGap > 0 ? lifeGap : 0)} in life insurance exposure and ${fc(disabilityGap * 10)} in potential disability income loss. One event could eliminate decades of wealth building.`,
      },
      {
        outcome: `Partially Protected: ~${fc((lifeTermCost + disabilityCost / 12) * 12)}/year in premiums`,
        description: `Close life insurance gap with term policy + supplemental disability. Addresses the two highest-probability risks at reasonable cost.`,
      },
      {
        outcome: `Fully Protected: ~${fc((lifeTermCost + disabilityCost / 12 + umbrellaAnnual / 12) * 12)}/year`,
        description: `Add umbrella policy and LTC planning. Comprehensive protection of income, life, assets, and future care needs. Peace of mind is the ultimate risk-adjusted return.`,
      },
    ],
    actions: [
      dependents > 0 && lifeGap > 0 ? { priority: 'CRITICAL', timeline: 'This Month', action: `Get quotes for ${fc(lifeGap)} in 20-year term life insurance`, impact: `Closes ${fc(lifeGap)} coverage gap protecting your ${dependents} dependent${dependents !== 1 ? 's' : ''}`, amount: `~${fc(lifeTermCost * 12)}/year est.` } : null,
      disabilityGap > 0 ? { priority: 'CRITICAL', timeline: 'Within 30 Days', action: 'Obtain individual disability insurance quotes to supplement group coverage', impact: `Closes ${fc(disabilityGap)}/year income gap if you cannot work`, amount: `~${fc(disabilityCost)}/year est.` } : null,
      needsUmbrella && !hasUmbrella ? { priority: 'HIGH', timeline: 'Within 60 Days', action: `Add $1M personal umbrella liability policy`, impact: `Protects ${fc(netWorth)} in net worth from lawsuits above auto/home limits`, amount: `~${fc(umbrellaAnnual)}/year` } : null,
      { priority: 'MEDIUM', timeline: 'Annually', action: 'Shop all insurance coverage across 3+ carriers at renewal', impact: 'Comparable coverage 15–25% cheaper through competitive shopping', amount: 'Est. $500–$2,000/yr savings' },
      age >= 55 ? { priority: 'MEDIUM', timeline: 'Within 6 Months', action: 'Get long-term care insurance quotes (hybrid life/LTC policies)', impact: 'Lock in coverage before health changes. Average LTC cost: $100k+/year', amount: '$2,000–$5,000/year est.' } : null,
    ].filter(Boolean),
  };
}

// ─── 7. Emergency Fund Analysis ───────────────────────────────────────────────

function generateEmergencyFund(data) {
  const housing = parseFloat(data.monthly_housing) || 0;
  const food = parseFloat(data.monthly_food) || 0;
  const utilities = parseFloat(data.monthly_utilities) || 0;
  const transport = parseFloat(data.monthly_transport) || 0;
  const insurance = parseFloat(data.monthly_insurance) || 0;
  const other = parseFloat(data.other_monthly_expenses) || 0;
  const currentEF = parseFloat(data.current_emergency_fund) || 0;
  const otherLiquid = parseFloat(data.other_liquid_savings) || 0;
  const monthlyIncome = parseFloat(data.monthly_income) || 0;
  const savingsCapacity = parseFloat(data.monthly_savings_capacity) || 0;
  const employment = data.employment_stability || 'Stable (large established company)';
  const dependents = parseFloat(data.dependents) || 0;
  const goal = data.ef_goal || 'Build from scratch';

  const monthlyEssential = housing + food + utilities + transport + insurance + other;
  const totalLiquid = currentEF + otherLiquid;

  const targetMonths = employment.includes('government') || employment.includes('tenured') ? 3
    : employment.includes('large') ? 4
    : employment.includes('medium') ? 5
    : employment.includes('commission') || employment.includes('freelance') ? 8
    : employment.includes('Self-employed') ? 9
    : 6;

  const adjustedTarget = targetMonths + (dependents > 2 ? 2 : dependents > 0 ? 1 : 0);
  const targetAmount = monthlyEssential * adjustedTarget;
  const currentMonths = monthlyEssential > 0 ? totalLiquid / monthlyEssential : 0;
  const gap = Math.max(0, targetAmount - totalLiquid);
  const monthsToTarget = savingsCapacity > 0 ? gap / savingsCapacity : Infinity;

  const hysSavings = totalLiquid * 0.048; // 4.8% HYSA
  const currentRate = 0.005; // typical checking
  const opportunityCost = (hysSavings - totalLiquid * currentRate);

  let score = 40;
  const coverageRatio = currentMonths / adjustedTarget * 100;
  if (coverageRatio >= 100) score += 40; else if (coverageRatio >= 75) score += 25; else if (coverageRatio >= 50) score += 15; else if (coverageRatio >= 25) score += 8;
  if (savingsCapacity >= 500) score += 10; else if (savingsCapacity >= 200) score += 5;
  score = Math.max(10, Math.min(99, score));

  return {
    score,
    grade: letterGrade(score),
    headline: `${fn(currentMonths, 1)}-month coverage vs. ${adjustedTarget}-month target · ${gap > 0 ? fc(gap) + ' gap remaining' : 'Fully funded'}`,
    summary: `Monthly essential expenses total ${fc(monthlyEssential)}, requiring a ${fc(targetAmount)} emergency fund (${adjustedTarget} months) for your employment and family situation. Current liquid reserves of ${fc(totalLiquid)} cover ${fn(currentMonths, 1)} months. ${gap > 0 ? `The ${fc(gap)} gap can be closed in approximately ${fn(monthsToTarget, 0)} months at ${fc(savingsCapacity)}/month savings rate.` : `Your emergency fund is fully funded — consider optimizing where it's held for maximum yield.`}`,
    scorecard: [
      { label: 'Monthly Essential Expenses', value: fc(monthlyEssential), sub: 'Fixed baseline needs', status: 'neutral' },
      { label: 'Current Coverage', value: `${fn(currentMonths, 1)} months`, sub: `Target: ${adjustedTarget} months`, status: currentMonths >= adjustedTarget ? 'good' : currentMonths >= adjustedTarget * 0.5 ? 'warning' : 'critical' },
      { label: 'Funding Target', value: fc(targetAmount), sub: `${adjustedTarget}-month reserve`, status: 'neutral' },
      { label: 'Funding Gap', value: gap > 0 ? fc(gap) : 'None', sub: gap > 0 ? `${fn(monthsToTarget, 0)} months to close` : 'Fully funded', status: gap === 0 ? 'good' : gap < targetAmount * 0.5 ? 'warning' : 'critical' },
      { label: 'Savings Capacity', value: fc(savingsCapacity) + '/mo', sub: 'Available to save', status: savingsCapacity >= 500 ? 'good' : savingsCapacity >= 200 ? 'warning' : 'critical' },
      { label: 'HYSA Interest Opportunity', value: fc(opportunityCost) + '/yr', sub: 'Extra yield vs. checking', status: opportunityCost > 500 ? 'warning' : 'good' },
    ],
    charts: [
      {
        type: 'donut',
        title: 'Monthly Essential Expense Breakdown',
        data: [
          { name: 'Housing', value: housing },
          { name: 'Food', value: food },
          { name: 'Transport', value: transport },
          { name: 'Insurance', value: insurance },
          { name: 'Utilities', value: utilities },
          { name: 'Other', value: other },
        ].filter(d => d.value > 0),
      },
      {
        type: 'bar',
        title: 'Emergency Fund Build-Up Timeline',
        data: (() => {
          const pts = [];
          const months = Math.min(Math.ceil(monthsToTarget) + 2, 36);
          for (let m = 0; m <= months; m += Math.max(1, Math.floor(months / 8))) {
            pts.push({
              name: `Month ${m}`,
              'Fund Balance': Math.min(Math.round(totalLiquid + savingsCapacity * m), targetAmount),
              Target: Math.round(targetAmount),
            });
          }
          return pts;
        })(),
        xKey: 'name',
        bars: [
          { key: 'Fund Balance', label: 'Projected Balance', color: GOLD },
          { key: 'Target', label: 'Target Amount', color: BLUE },
        ],
      },
      {
        type: 'bar',
        title: 'Emergency Fund Storage Options — Annual Yield Comparison',
        data: [
          { name: 'Checking Account', yield: 0.05, 'Annual Interest': Math.round(totalLiquid * 0.0005) },
          { name: 'Savings Account', yield: 0.5, 'Annual Interest': Math.round(totalLiquid * 0.005) },
          { name: 'HYSA (SoFi/Marcus)', yield: 4.8, 'Annual Interest': Math.round(totalLiquid * 0.048) },
          { name: 'Money Market', yield: 5.0, 'Annual Interest': Math.round(totalLiquid * 0.05) },
          { name: '3-Month T-Bill', yield: 5.2, 'Annual Interest': Math.round(totalLiquid * 0.052) },
        ],
        xKey: 'name',
        bars: [{ key: 'Annual Interest', label: 'Annual Interest Earned', color: GREEN }],
      },
    ],
    sections: [
      {
        title: 'Expense Baseline & Coverage Analysis',
        content: `Essential monthly expenses of ${fc(monthlyEssential)} represent your true financial floor — the minimum needed regardless of income source. This excludes discretionary spending, entertainment, and non-essential items. Your ${adjustedTarget}-month target accounts for ${employment.includes('Self-employed') ? 'self-employment income volatility' : employment.includes('commission') ? 'commission-based income variability' : 'employment stability level'} and ${dependents > 0 ? `${dependents} dependent${dependents !== 1 ? 's' : ''} increasing recovery time if unemployed` : 'no dependent obligations'}.`,
        table: {
          headers: ['Expense Category', 'Monthly', 'Annual', '% of Total'],
          rows: [
            ['Housing', fc(housing), fc(housing * 12), `${fn(monthlyEssential > 0 ? housing / monthlyEssential * 100 : 0, 1)}%`],
            ['Food & Groceries', fc(food), fc(food * 12), `${fn(monthlyEssential > 0 ? food / monthlyEssential * 100 : 0, 1)}%`],
            ['Transportation', fc(transport), fc(transport * 12), `${fn(monthlyEssential > 0 ? transport / monthlyEssential * 100 : 0, 1)}%`],
            ['Insurance', fc(insurance), fc(insurance * 12), `${fn(monthlyEssential > 0 ? insurance / monthlyEssential * 100 : 0, 1)}%`],
            ['Utilities & Bills', fc(utilities), fc(utilities * 12), `${fn(monthlyEssential > 0 ? utilities / monthlyEssential * 100 : 0, 1)}%`],
            ['Other Essential', fc(other), fc(other * 12), `${fn(monthlyEssential > 0 ? other / monthlyEssential * 100 : 0, 1)}%`],
            ['TOTAL', fc(monthlyEssential), fc(monthlyEssential * 12), '100%'],
          ],
          highlight: 6,
        },
      },
      {
        title: 'Where to Keep Your Emergency Fund',
        content: `Emergency funds must balance three requirements: **safety** (FDIC-insured), **liquidity** (accessible within 1–3 days), and **yield** (earn something while waiting). Traditional checking accounts pay virtually nothing (0.01–0.05%). High-yield savings accounts at online banks (SoFi, Marcus by Goldman Sachs, Ally, Discover) currently pay 4.5–5.0% APY with the same FDIC protection and 1-2 business day transfers. On ${fc(targetAmount)}, the difference is ${fc(targetAmount * 0.048)} vs ${fc(targetAmount * 0.001)} per year — a ${fc(targetAmount * 0.047)} opportunity cost for keeping money in checking.`,
        callouts: [
          { type: 'info', title: 'Tiered Emergency Fund Strategy', text: `Tier 1: Keep 1 month (${fc(monthlyEssential)}) in checking for immediate access. Tier 2: Keep 2–3 months in HYSA earning 4.8%+ APY. Tier 3: If fund exceeds 6 months, consider 3-month T-Bills or I-Bonds for excess — slightly less liquid but higher yield.` },
          gap > 0 ? { type: 'warning', title: `Build to ${fn(adjustedTarget, 0)} Months Before Investing`, text: `An underfunded emergency reserve is the #1 reason people derail investment plans — a car repair or medical bill forces credit card debt at 22%+. Prioritize building to ${fc(targetAmount)} before increasing investment contributions.` } : { type: 'good', title: 'Emergency Fund Fully Funded — Optimize the Yield', text: `Your emergency fund is at target. Move it to a HYSA immediately to earn ${fc(hysSavings)}/year instead of near-zero in a traditional account. Consider I-Bonds for amounts above 6 months.` },
        ],
      },
      buildLiquidYieldSection(targetAmount),
    ],
    scenarios: [
      {
        outcome: `At ${fc(savingsCapacity)}/month: Funded in ${fn(monthsToTarget, 0)} months`,
        description: `Current savings pace. Consistent monthly deposits of ${fc(savingsCapacity)} reach the ${fc(targetAmount)} target by ${new Date(Date.now() + monthsToTarget * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`,
      },
      {
        outcome: `At ${fc(savingsCapacity * 2)}/month: Funded in ${fn(monthsToTarget / 2, 0)} months`,
        description: `Doubling monthly savings through expense reduction or side income cuts timeline in half. Consider a 30-day spending audit to find additional capacity.`,
      },
      {
        outcome: `Lump sum boost: Immediate ${fn(Math.min(currentMonths + 2, adjustedTarget), 1)} months covered`,
        description: `Applying a tax refund, bonus, or selling unused items to deposit ${fc(monthlyEssential * 2)} immediately adds 2 months of coverage and accelerates the timeline significantly.`,
      },
    ],
    actions: [
      gap > 0 ? { priority: 'CRITICAL', timeline: 'This Week', action: `Open a HYSA (SoFi, Marcus, Ally) and set up auto-deposit of ${fc(savingsCapacity)}/month`, impact: 'Earns 4.8%+ APY while building the fund — better than any checking account', amount: 'Free to open' } : { priority: 'HIGH', timeline: 'This Week', action: 'Move emergency fund from checking to HYSA earning 4.8%+', impact: fc(opportunityCost) + '/year in additional interest income', amount: fc(totalLiquid) + ' to move' },
      gap > 0 ? { priority: 'HIGH', timeline: 'Within 30 Days', action: 'Identify one expense to cut and redirect to emergency fund', impact: `Even ${fc(100)}/month more reaches target ${fn(gap / (savingsCapacity + 100), 0)} months sooner`, amount: fc(100) + '/mo minimum' } : null,
      { priority: 'MEDIUM', timeline: 'Next tax refund', action: 'Direct 50%+ of any windfall (refund, bonus) to emergency fund', impact: 'One-time boosts dramatically accelerate timeline without lifestyle changes', amount: 'Varies' },
    ].filter(Boolean),
  };
}

// ─── 8. Estate Planning ───────────────────────────────────────────────────────

function generateEstatePlanning(data) {
  const totalAssets = parseFloat(data.total_assets) || 0;
  const realEstate = parseFloat(data.real_estate) || 0;
  const retirement = parseFloat(data.retirement_accounts) || 0;
  const lifeIns = parseFloat(data.life_insurance_face) || 0;
  const business = parseFloat(data.business_interests) || 0;
  const hasWill = data.has_will || 'No will';
  const hasTrust = data.has_trust || 'No trust';
  const hasPOA = data.has_poa || 'None';
  const benefUpdated = data.beneficiaries_updated || 'Not sure';
  const hasDirective = data.has_advance_directive || 'No';
  const age = parseFloat(data.age) || 50;
  const marital = data.marital_status || 'Married';
  const children = parseFloat(data.children) || 0;
  const minorChildren = data.minor_children === 'Yes';
  const goal = data.estate_goal || 'Avoid probate';

  const federalExemption = TAX_2026.estate.lifetimeExemption;
  const grossEstate = totalAssets + lifeIns;
  const overExemption = Math.max(0, grossEstate - federalExemption);
  const estimatedEstateTax = overExemption * 0.40;
  const probateAssets = realEstate + (totalAssets - retirement - lifeIns) * 0.6;
  const estimatedProbateCost = probateAssets * 0.04;
  const estimatedProbateTime = 12;

  let willGap = hasWill.includes('No will') ? 3 : hasWill.includes('5 years') ? 1 : 0;
  let trustGap = hasTrust.includes('No trust') && totalAssets > 100000 ? 2 : 0;
  let poaGap = hasPOA === 'None' ? 3 : poaGap = hasPOA.includes('only') ? 1 : 0;
  let benefGap = benefUpdated.includes('5+') || benefUpdated.includes('Not sure') ? 2 : benefUpdated.includes('Partial') ? 1 : 0;
  let directiveGap = hasDirective === 'No' ? 2 : 0;
  const totalGaps = willGap + trustGap + poaGap + benefGap + directiveGap;

  let score = 90 - totalGaps * 8;
  score = Math.max(10, Math.min(99, score));

  const docStatus = (s, good, warning) => s.includes(good) ? 'good' : s.includes(warning) ? 'warning' : 'critical';

  return {
    score,
    grade: letterGrade(score),
    headline: `Estate readiness grade ${letterGrade(score)} — ${totalGaps} critical gaps identified · ${fc(estimatedProbateCost)} estimated probate exposure`,
    summary: `Your estate of approximately ${fc(grossEstate)} (including ${fc(lifeIns)} in life insurance) is ${overExemption > 0 ? `above the federal ${fc(federalExemption)} exemption, potentially triggering ${fc(estimatedEstateTax)} in estate taxes` : `below the federal ${fc(federalExemption)} exemption — no federal estate tax exposure`}. Document audit reveals ${totalGaps} gaps across will, trust, POA, beneficiaries, and healthcare directives. ${probateAssets > 0 ? `An estimated ${fc(probateAssets)} in assets may pass through probate, costing ${fc(estimatedProbateCost)} and taking ${estimatedProbateTime}+ months.` : ''}`,
    scorecard: [
      { label: 'Will Status', value: hasWill.includes('No will') ? 'None' : hasWill.includes('5 years') ? 'Outdated' : 'Current', sub: hasWill, status: hasWill.includes('recently') ? 'good' : hasWill.includes('No will') ? 'critical' : 'warning' },
      { label: 'Trust Status', value: hasTrust.includes('No trust') ? 'None' : 'Active', sub: hasTrust, status: hasTrust.includes('revocable') || hasTrust.includes('irrevocable') ? 'good' : totalAssets > 300000 ? 'warning' : 'neutral' },
      { label: 'Power of Attorney', value: hasPOA === 'None' ? 'Missing' : hasPOA.includes('healthcare') && hasPOA.includes('financial') ? 'Complete' : 'Partial', sub: hasPOA, status: hasPOA.includes('financial + healthcare') ? 'good' : hasPOA === 'None' ? 'critical' : 'warning' },
      { label: 'Beneficiaries', value: benefUpdated.includes('within 2') ? 'Current' : benefUpdated.includes('Not sure') ? 'Unknown' : 'Review Needed', sub: benefUpdated, status: benefUpdated.includes('within 2') ? 'good' : benefUpdated.includes('Not sure') ? 'critical' : 'warning' },
      { label: 'Healthcare Directive', value: hasDirective, sub: 'Living will / POLST', status: hasDirective === 'Yes' ? 'good' : 'critical' },
      { label: 'Estate Tax Exposure', value: overExemption > 0 ? fc(estimatedEstateTax) : 'None', sub: `Gross estate: ${fc(grossEstate)}`, status: overExemption === 0 ? 'good' : overExemption < 1000000 ? 'warning' : 'critical' },
    ],
    charts: [
      {
        type: 'donut',
        title: 'Estate Composition',
        data: [
          { name: 'Investments & Cash', value: totalAssets - realEstate - retirement },
          { name: 'Real Estate', value: realEstate },
          { name: 'Retirement Accounts', value: retirement },
          { name: 'Life Insurance (Face)', value: lifeIns },
          { name: 'Business Interests', value: business },
        ].filter(d => d.value > 0),
      },
      {
        type: 'bar',
        title: 'Document Readiness Score',
        data: [
          { name: 'Will', score: hasWill.includes('recently') ? 100 : hasWill.includes('No will') ? 0 : 40 },
          { name: 'Trust', score: hasTrust.includes('revocable') ? 100 : hasTrust.includes('No trust') ? 0 : 50 },
          { name: 'POA', score: hasPOA.includes('financial + healthcare') ? 100 : hasPOA === 'None' ? 0 : 50 },
          { name: 'Beneficiaries', score: benefUpdated.includes('within 2') ? 100 : benefUpdated.includes('Not sure') ? 0 : 50 },
          { name: 'Healthcare Directive', score: hasDirective === 'Yes' ? 100 : 0 },
        ],
        xKey: 'name',
        bars: [{ key: 'score', label: 'Readiness %', color: GOLD }],
      },
      {
        type: 'bar',
        title: 'Assets: Probate vs. Non-Probate',
        data: [
          { name: 'Probate Assets', value: probateAssets, cost: estimatedProbateCost },
          { name: 'Non-Probate', value: grossEstate - probateAssets, cost: 0 },
        ],
        xKey: 'name',
        bars: [{ key: 'value', label: 'Asset Value', color: BLUE }],
      },
    ],
    sections: [
      {
        title: 'Document Audit — Critical Gaps',
        content: `Estate planning is built on four foundational documents: **Will** (directs asset distribution), **Revocable Living Trust** (avoids probate for assets over ~${fc(100000)}), **Durable Power of Attorney** (manages finances if incapacitated), and **Healthcare Directive / Living Will** (guides medical decisions). Missing or outdated documents create predictable legal and financial crises at the worst possible times.`,
        table: {
          headers: ['Document', 'Current Status', 'Gap/Risk', 'Priority', 'Est. Cost'],
          rows: [
            ['Will', hasWill, hasWill.includes('No will') ? 'Intestate laws decide — not you' : hasWill.includes('5 years') ? 'May not reflect current wishes' : 'None', hasWill.includes('No will') ? 'CRITICAL' : 'LOW', '$300–$1,500'],
            ['Revocable Living Trust', hasTrust, hasTrust.includes('No trust') && totalAssets > 150000 ? 'Probate exposure — ' + fc(estimatedProbateCost) : 'N/A', hasTrust.includes('No trust') && totalAssets > 150000 ? 'HIGH' : 'LOW', '$1,500–$4,000'],
            ['Power of Attorney', hasPOA, hasPOA === 'None' ? 'Court must appoint guardian if incapacitated' : 'Partial', hasPOA === 'None' ? 'CRITICAL' : 'MEDIUM', '$300–$800'],
            ['Healthcare Directive', hasDirective, hasDirective === 'No' ? 'Family must make life-or-death decisions without guidance' : 'None', hasDirective === 'No' ? 'CRITICAL' : 'LOW', '$0–$400'],
            ['Beneficiary Designations', benefUpdated, benefUpdated.includes('Not sure') ? 'Wrong beneficiaries possible' : 'Periodic review needed', 'MEDIUM', 'Free'],
          ],
        },
        callouts: [
          minorChildren ? { type: 'critical', title: 'Minor Children — Guardian Must Be Named', text: `With minor children, a will naming a guardian is legally essential. Without one, a court decides who raises your children. This is the single most important estate document for parents of minors. Complete this within 30 days.` } : null,
          { type: 'warning', title: 'Beneficiary Designations Override Your Will', text: 'Retirement accounts (401k, IRA) and life insurance pay directly to named beneficiaries — regardless of what your will says. An outdated beneficiary (ex-spouse, deceased parent) can direct assets completely contrary to your wishes. Review all designations immediately.' },
        ].filter(Boolean),
      },
      {
        title: 'Probate Analysis & Avoidance',
        content: `Probate is the court-supervised process of distributing assets after death. Estimated cost for your estate: **${fc(estimatedProbateCost)}** (typically 3–5% of probate assets) taking **${estimatedProbateTime}+ months** during which assets are frozen. Assets that bypass probate: retirement accounts (with beneficiaries), life insurance, joint tenancy property, assets in a trust. Assets subject to probate: solely-owned real estate, bank accounts without TOD designations, personal property per your will.`,
        bigNumbers: [
          { value: fc(probateAssets), label: 'Est. Probate-Exposed Assets', sub: 'Subject to court process', color: RED },
          { value: fc(estimatedProbateCost), label: 'Estimated Probate Cost', sub: '3–5% of probate estate', color: RED },
          { value: `${estimatedProbateTime}+ months`, label: 'Estimated Probate Time', sub: 'Assets frozen during this period', color: GOLD },
        ],
      },
    ],
    scenarios: [
      {
        outcome: `No Action: Intestate + ${fc(estimatedProbateCost)} probate cost`,
        description: `Without documents, state intestacy laws decide asset distribution. ${minorChildren ? 'Courts appoint a guardian for minor children.' : ''} Probate costs ${fc(estimatedProbateCost)} and delays distribution ${estimatedProbateTime}+ months.`,
      },
      {
        outcome: `Basic Plan: ~$2,000 in attorney fees`,
        description: `Will + POA + Healthcare Directive drafted by estate attorney. Eliminates most critical gaps. Probate exposure remains for non-trust assets.`,
      },
      {
        outcome: `Comprehensive Plan: ~$4,000–$6,000 total`,
        description: `Living trust + pour-over will + updated beneficiaries + all directives. Eliminates probate for most assets, saves ${fc(estimatedProbateCost)} in court costs, and ensures wishes are carried out completely.`,
      },
    ],
    actions: [
      hasWill.includes('No will') ? { priority: 'CRITICAL', timeline: 'Within 30 Days', action: 'Hire an estate planning attorney to draft a will', impact: minorChildren ? 'Names guardian for minor children — most important document for parents' : 'Ensures your wishes control asset distribution, not state law', amount: '$300–$1,500' } : null,
      hasPOA === 'None' ? { priority: 'CRITICAL', timeline: 'Within 30 Days', action: 'Execute durable financial + healthcare power of attorney', impact: 'Prevents court-ordered guardianship if incapacitated — can happen at any age', amount: '$300–$800' } : null,
      hasDirective === 'No' ? { priority: 'CRITICAL', timeline: 'Within 30 Days', action: 'Complete healthcare directive / living will', impact: 'Guides family in life-or-death medical decisions without court intervention', amount: 'Often free online, $0–$400 with attorney' } : null,
      { priority: 'HIGH', timeline: 'Within 60 Days', action: 'Review and update all beneficiary designations on retirement accounts and life insurance', impact: 'Beneficiaries override your will — outdated ones redirect assets to wrong people', amount: 'Free — done online with each institution' },
      totalAssets > 150000 && hasTrust.includes('No trust') ? { priority: 'HIGH', timeline: 'Within 6 Months', action: 'Discuss revocable living trust with estate attorney', impact: `Avoids ${fc(estimatedProbateCost)} in probate costs and ${estimatedProbateTime}+ month delays for your ${fc(totalAssets)} estate`, amount: '$1,500–$4,000' } : null,
    ].filter(Boolean),
  };
}

// ─── 9. Budget Optimization ───────────────────────────────────────────────────

function generateBudgetOptimization(data) {
  const takeHome = parseFloat(data.monthly_take_home) || 0;
  const secondary = parseFloat(data.secondary_income) || 0;
  const irregular = parseFloat(data.irregular_income) || 0;
  const housing = parseFloat(data.housing) || 0;
  const carPayment = parseFloat(data.car_payment) || 0;
  const insurancePremiums = parseFloat(data.insurance_premiums) || 0;
  const subscriptions = parseFloat(data.subscriptions) || 0;
  const minDebt = parseFloat(data.minimum_debt_payments) || 0;
  const foodDining = parseFloat(data.food_dining) || 0;
  const utilities = parseFloat(data.utilities) || 0;
  const entertainment = parseFloat(data.entertainment) || 0;
  const shopping = parseFloat(data.shopping) || 0;
  const currentSavings = parseFloat(data.current_savings) || 0;

  const totalIncome = takeHome + secondary + irregular;
  const needs = housing + carPayment + insurancePremiums + minDebt + utilities;
  const wants = foodDining + entertainment + shopping + subscriptions;
  const savingsDebt = currentSavings;
  const totalExpenses = needs + wants + savingsDebt;
  const surplus = totalIncome - totalExpenses;

  const targetNeeds = totalIncome * 0.50;
  const targetWants = totalIncome * 0.30;
  const targetSavings = totalIncome * 0.20;

  const needsPct = totalIncome > 0 ? needs / totalIncome * 100 : 0;
  const wantsPct = totalIncome > 0 ? wants / totalIncome * 100 : 0;
  const savingsPct = totalIncome > 0 ? savingsDebt / totalIncome * 100 : 0;
  const housingRatio = totalIncome > 0 ? housing / totalIncome * 100 : 0;

  let score = 60;
  if (savingsPct >= 20) score += 20; else if (savingsPct >= 15) score += 12; else if (savingsPct >= 10) score += 6;
  if (needsPct <= 50) score += 10; else if (needsPct > 70) score -= 15;
  if (housingRatio <= 30) score += 5; else if (housingRatio > 40) score -= 10;
  if (surplus > 0) score += 5; else if (surplus < 0) score -= 15;
  score = Math.max(10, Math.min(99, score));

  return {
    score,
    grade: letterGrade(score),
    headline: `${surplus >= 0 ? fc(surplus) + '/month surplus' : fc(Math.abs(surplus)) + '/month deficit'} · ${fp(savingsPct)} savings rate · ${fp(needsPct)} on needs`,
    summary: `Monthly income of ${fc(totalIncome)} with total expenses of ${fc(totalExpenses)} leaves ${surplus >= 0 ? 'a surplus of ' + fc(surplus) : 'a deficit of ' + fc(Math.abs(surplus))}. The 50/30/20 framework targets 50% needs, 30% wants, 20% savings. Currently: needs at ${fp(needsPct)} (${needsPct > 50 ? 'over' : 'under'} target), wants at ${fp(wantsPct)} (${wantsPct > 30 ? 'over' : 'under'} target), savings at ${fp(savingsPct)} (${savingsPct < 20 ? 'below' : 'meets'} target). ${surplus < 0 ? `Immediate action required — spending exceeds income by ${fc(Math.abs(surplus))}/month.` : ''}`,
    scorecard: [
      { label: 'Monthly Surplus/Deficit', value: `${surplus >= 0 ? '+' : ''}${fc(surplus)}`, sub: surplus >= 0 ? 'Positive cash flow' : 'OVERSPENDING', status: surplus > 500 ? 'good' : surplus >= 0 ? 'warning' : 'critical' },
      { label: 'Savings Rate', value: fp(savingsPct), sub: 'Target: 20%', status: savingsPct >= 20 ? 'good' : savingsPct >= 10 ? 'warning' : 'critical' },
      { label: 'Needs (50% target)', value: fp(needsPct), sub: `${fc(needs)} actual, ${fc(targetNeeds)} target`, status: needsPct <= 50 ? 'good' : needsPct <= 60 ? 'warning' : 'critical' },
      { label: 'Wants (30% target)', value: fp(wantsPct), sub: `${fc(wants)} actual, ${fc(targetWants)} target`, status: wantsPct <= 30 ? 'good' : wantsPct <= 40 ? 'warning' : 'critical' },
      { label: 'Housing Cost Ratio', value: fp(housingRatio), sub: 'Target: under 30%', status: housingRatio <= 30 ? 'good' : housingRatio <= 40 ? 'warning' : 'critical' },
      { label: 'Subscription Waste', value: fc(subscriptions), sub: 'Monthly recurring', status: subscriptions < 50 ? 'good' : subscriptions < 150 ? 'warning' : 'critical' },
    ],
    charts: [
      {
        type: 'donut',
        title: 'Current Budget Breakdown',
        data: [
          { name: 'Housing', value: housing },
          { name: 'Car & Transport', value: carPayment },
          { name: 'Insurance', value: insurancePremiums },
          { name: 'Food & Dining', value: foodDining },
          { name: 'Utilities', value: utilities },
          { name: 'Entertainment', value: entertainment },
          { name: 'Shopping', value: shopping },
          { name: 'Subscriptions', value: subscriptions },
          { name: 'Debt Payments', value: minDebt },
          { name: 'Savings', value: currentSavings },
        ].filter(d => d.value > 0),
      },
      {
        type: 'bar',
        title: 'Actual vs. 50/30/20 Target Allocation',
        data: [
          { name: 'Needs', Actual: Math.round(needsPct), Target: 50 },
          { name: 'Wants', Actual: Math.round(wantsPct), Target: 30 },
          { name: 'Savings', Actual: Math.round(savingsPct), Target: 20 },
        ],
        xKey: 'name',
        bars: [
          { key: 'Actual', label: 'Current %', color: GOLD },
          { key: 'Target', label: 'Target %', color: BLUE },
        ],
      },
      {
        type: 'area',
        title: 'Savings Growth at Different Rates (Monthly Savings)',
        data: (() => {
          const pts = [];
          for (let y = 0; y <= 10; y++) {
            pts.push({
              name: `Year ${y}`,
              [`${fp(savingsPct)} (Current)`]: Math.round(fvP(savingsDebt, 0.07 / 12, y * 12)),
              ['15% Rate']: Math.round(fvP(totalIncome * 0.15, 0.07 / 12, y * 12)),
              ['20% Rate']: Math.round(fvP(totalIncome * 0.20, 0.07 / 12, y * 12)),
            });
          }
          return pts;
        })(),
        xKey: 'name',
        lines: [
          { key: `${fp(savingsPct)} (Current)`, label: 'Current Rate', color: GOLD },
          { key: '15% Rate', label: '15% Rate', color: BLUE },
          { key: '20% Rate', label: '20% Rate', color: GREEN },
        ],
      },
    ],
    sections: [
      {
        title: '50/30/20 Framework Applied to Your Budget',
        content: `The 50/30/20 rule allocates after-tax income to: **50% Needs** — fixed essential expenses (housing, minimum debt, insurance, utilities). **30% Wants** — lifestyle discretionary (dining, entertainment, shopping). **20% Savings/Extra Debt** — future wealth building. On your ${fc(totalIncome)} income: Needs target ${fc(targetNeeds)} (actual: ${fc(needs)}), Wants target ${fc(targetWants)} (actual: ${fc(wants)}), Savings target ${fc(targetSavings)} (actual: ${fc(savingsDebt)}).`,
        bars: [
          { label: `Needs — ${fp(needsPct)} actual vs 50% target`, value: needsPct, max: 100, pct: needsPct, color: needsPct <= 50 ? GREEN : RED, showValue: true },
          { label: `Wants — ${fp(wantsPct)} actual vs 30% target`, value: wantsPct, max: 100, pct: wantsPct, color: wantsPct <= 30 ? GREEN : GOLD, showValue: true },
          { label: `Savings — ${fp(savingsPct)} actual vs 20% target`, value: savingsPct, max: 100, pct: savingsPct, color: savingsPct >= 20 ? GREEN : RED, showValue: true },
        ],
        callouts: [
          housingRatio > 35 ? { type: 'critical', title: 'Housing Cost Over 35% of Income', text: `Housing at ${fp(housingRatio)} of take-home income is consuming your budget flexibility. The 30% rule (gross income) suggests ${fc(totalIncome * 0.30)} maximum. Consider: getting a roommate, refinancing, or longer-term relocation to reduce this burden.` } : null,
          subscriptions > 100 ? { type: 'warning', title: `Subscription Audit — ${fc(subscriptions)}/Month`, text: `${fc(subscriptions)}/month in subscriptions totals ${fc(subscriptions * 12)}/year. Audit every subscription: Does it spark joy? Do you use it weekly? Cancel and restart services seasonally. Average household can cut 30–40% of subscription costs with a 1-hour audit.` } : null,
        ].filter(Boolean),
      },
      {
        title: 'Optimized Budget Proposal',
        content: `Based on your income of ${fc(totalIncome)}, here is a proposed zero-based budget reallocating to the 50/30/20 framework:`,
        table: {
          headers: ['Category', 'Current', 'Proposed', 'Change', 'Annual Impact'],
          rows: [
            ['Housing', fc(housing), fc(Math.min(housing, totalIncome * 0.28)), housing > totalIncome * 0.28 ? `-${fc(housing - totalIncome * 0.28)}` : '—', housing > totalIncome * 0.28 ? `-${fc((housing - totalIncome * 0.28) * 12)}` : '—'],
            ['Food & Dining', fc(foodDining), fc(Math.min(foodDining, totalIncome * 0.12)), foodDining > totalIncome * 0.12 ? `-${fc(foodDining - totalIncome * 0.12)}` : '—', foodDining > totalIncome * 0.12 ? `-${fc((foodDining - totalIncome * 0.12) * 12)}` : '—'],
            ['Entertainment', fc(entertainment), fc(Math.min(entertainment, totalIncome * 0.08)), '—', '—'],
            ['Shopping', fc(shopping), fc(Math.min(shopping, totalIncome * 0.07)), '—', '—'],
            ['Subscriptions', fc(subscriptions), fc(subscriptions * 0.65), `-${fc(subscriptions * 0.35)}`, `-${fc(subscriptions * 0.35 * 12)}`],
            ['Savings', fc(savingsDebt), fc(targetSavings), `+${fc(Math.max(0, targetSavings - savingsDebt))}`, `+${fc(Math.max(0, targetSavings - savingsDebt) * 12)}`],
          ],
          highlight: 5,
        },
      },
    ],
    scenarios: [
      {
        outcome: `Status Quo: ${fc(surplus)}/month surplus`,
        description: `Current spending patterns. ${surplus < 0 ? 'Monthly deficit accumulating debt.' : `${fc(surplus * 12)}/year to savings/investments.`} 10-year wealth trajectory: ${fc(fvP(Math.max(0, surplus + savingsDebt), 0.07 / 12, 120))}.`,
      },
      {
        outcome: `Optimized: ${fc(totalIncome * 0.20)}/month to savings`,
        description: `Implement 50/30/20 framework. Savings rate reaches 20% — ${fc(totalIncome * 0.20)}/month. 10-year wealth: ${fc(fvP(totalIncome * 0.20, 0.07 / 12, 120))} — ${fc(fvP(totalIncome * 0.20, 0.07 / 12, 120) - fvP(Math.max(0, savingsDebt), 0.07 / 12, 120))} more than current.`,
      },
      {
        outcome: `Aggressive: ${fc(totalIncome * 0.30)}/month to savings`,
        description: `Live on 70%, save 30%. Extreme lifestyle cuts — cook at home, cancel half subscriptions, pause shopping. 10-year wealth: ${fc(fvP(totalIncome * 0.30, 0.07 / 12, 120))}. Potential for early retirement or financial independence.`,
      },
    ],
    actions: [
      surplus < 0 ? { priority: 'CRITICAL', timeline: 'This Week', action: 'Create zero-based budget — assign every dollar a job', impact: `Eliminate ${fc(Math.abs(surplus))}/month deficit before it compounds into debt`, amount: fc(Math.abs(surplus)) + '/mo overspend' } : null,
      { priority: 'HIGH', timeline: 'Within 7 Days', action: `Audit subscriptions — cancel any unused (target: cut ${fc(subscriptions * 0.35)}/month)`, impact: fc(subscriptions * 0.35 * 12) + ' back in your pocket annually', amount: fc(subscriptions * 0.35) + '/mo' },
      savingsPct < 20 ? { priority: 'HIGH', timeline: 'Next Payday', action: `Set automatic transfer of ${fc(targetSavings - savingsDebt)}/month more to savings`, impact: 'Reaches 20% savings rate benchmark — pay yourself first before spending', amount: fc(targetSavings - savingsDebt) + '/mo' } : null,
      { priority: 'MEDIUM', timeline: 'Monthly', action: 'Track all spending in app (Mint, YNAB, or spreadsheet) for 90 days', impact: 'People who track spending save 15% more on average — awareness drives change', amount: 'Free–$14/month' },
      { priority: 'MEDIUM', timeline: 'Within 90 Days', action: 'Renegotiate or shop 3 bills: insurance, phone, internet', impact: 'Average savings of $150–$400/month from competitive re-shopping', amount: 'Est. $2,400/yr' },
    ].filter(Boolean),
  };
}

// ─── 10. Net Worth Projection ─────────────────────────────────────────────────

function generateNetWorthProjection(data) {
  const age = parseFloat(data.age) || 35;
  const currentNW = parseFloat(data.current_net_worth) || 0;
  const income = parseFloat(data.annual_income) || 0;
  const annualSavings = parseFloat(data.annual_savings) || 0;
  const totalDebt = parseFloat(data.total_debt) || 0;
  const incomeGrowth = (parseFloat(data.income_growth) || 3) / 100;
  const investReturn = (parseFloat(data.investment_return) || 7) / 100;
  const homeValue = parseFloat(data.home_value) || 0;
  const homeAppreciation = (parseFloat(data.home_appreciation) || 3) / 100;
  const debtPaydown = parseFloat(data.debt_paydown_annual) || 0;
  const goalNW = parseFloat(data.goal_net_worth) || 1000000;
  const goalAge = parseFloat(data.goal_year) || 55;

  const yearsToGoal = Math.max(0, goalAge - age);

  // Project year-by-year
  const projections = [];
  let nw = currentNW;
  let savings = annualSavings;
  let home = homeValue;
  let debt = totalDebt;

  for (let y = 0; y <= Math.max(yearsToGoal, 10); y++) {
    projections.push({
      name: `Age ${age + y}`,
      'Net Worth': Math.round(nw),
      'Conservative': Math.round(currentNW + (annualSavings * 0.8) * y + homeValue * Math.pow(1 + homeAppreciation * 0.5, y) - homeValue),
      'Optimistic': Math.round(currentNW + (annualSavings * 1.3) * y + fvP(annualSavings * 1.3, investReturn * 1.2, y) - fvP(annualSavings * 1.3, 0, y) + homeValue * Math.pow(1 + homeAppreciation * 1.5, y) - homeValue),
      Target: goalNW,
    });
    nw = nw * (1 + investReturn) + savings + home * homeAppreciation - debt * 0.05;
    savings *= (1 + incomeGrowth);
    home *= (1 + homeAppreciation);
    debt = Math.max(0, debt - debtPaydown);
  }

  const projNWAtGoal = projections[projections.length - 1]?.['Net Worth'] || 0;
  const onTrack = projNWAtGoal >= goalNW;
  const savingsRate = income > 0 ? annualSavings / income * 100 : 0;

  // Milestone ages
  const milestones = [100000, 250000, 500000, 1000000, 2000000];
  const milestoneDates = milestones.map(m => {
    if (currentNW >= m) return { amount: m, status: 'Achieved' };
    const diff = m - currentNW;
    const yearsNeeded = income > 0 ? Math.log(m / Math.max(currentNW, 1)) / Math.log(1 + investReturn) : diff / annualSavings;
    return { amount: m, age: Math.round(age + yearsNeeded), status: 'Projected' };
  });

  let score = 50;
  if (onTrack) score += 20;
  if (savingsRate >= 20) score += 15; else if (savingsRate >= 15) score += 8;
  if (currentNW > income) score += 10; else if (currentNW < 0) score -= 10;
  score = Math.max(10, Math.min(99, score));

  return {
    score,
    grade: letterGrade(score),
    headline: `${onTrack ? 'On track' : 'Off track'} for ${fc(goalNW)} by age ${goalAge} · Projected ${fc(projNWAtGoal)} · ${onTrack ? '+' : ''}${fc(projNWAtGoal - goalNW)} vs. goal`,
    summary: `Starting from ${fc(currentNW)} at age ${age}, your projected net worth reaches ${fc(projNWAtGoal)} by age ${goalAge} — ${onTrack ? `${fc(projNWAtGoal - goalNW)} above` : `${fc(goalNW - projNWAtGoal)} below`} the ${fc(goalNW)} target. At ${fc(annualSavings)}/year savings and ${fp(investReturn * 100)} projected return, your wealth trajectory ${onTrack ? 'meets' : 'misses'} the goal. ${!onTrack ? `To reach ${fc(goalNW)} by age ${goalAge}, increase annual savings by ${fc(Math.max(0, (goalNW - projNWAtGoal) / yearsToGoal * 0.5))}.` : 'Consider whether you can reach the goal ahead of schedule.'}`,
    scorecard: [
      { label: 'Current Net Worth', value: fc(currentNW), sub: `${fn(currentNW / Math.max(income, 1), 1)}× annual income`, status: currentNW > income ? 'good' : currentNW > 0 ? 'warning' : 'critical' },
      { label: 'Projected at Goal Age', value: fc(projNWAtGoal), sub: `Age ${goalAge} target: ${fc(goalNW)}`, status: onTrack ? 'good' : projNWAtGoal > goalNW * 0.75 ? 'warning' : 'critical' },
      { label: 'Annual Savings', value: fc(annualSavings), sub: `${fp(savingsRate)} of income`, status: savingsRate >= 20 ? 'good' : savingsRate >= 10 ? 'warning' : 'critical' },
      { label: 'Goal Achievement', value: onTrack ? 'On Track' : 'Gap', sub: onTrack ? `+${fc(projNWAtGoal - goalNW)} surplus` : `-${fc(goalNW - projNWAtGoal)} shortfall`, status: onTrack ? 'good' : 'critical' },
      { label: 'Years to Goal', value: `${yearsToGoal} years`, sub: `Target age: ${goalAge}`, status: yearsToGoal >= 20 ? 'good' : yearsToGoal >= 10 ? 'warning' : 'critical' },
      { label: 'Investment Return Assumed', value: fp(investReturn * 100), sub: 'Annual avg (pre-inflation)', status: investReturn <= 0.07 ? 'good' : 'warning' },
    ],
    charts: [
      {
        type: 'area',
        title: `Net Worth Projection — Age ${age} to ${Math.max(goalAge, age + 10)}`,
        data: projections,
        xKey: 'name',
        lines: [
          { key: 'Net Worth', label: 'Base Case', color: GOLD },
          { key: 'Conservative', label: 'Conservative', color: BLUE },
          { key: 'Optimistic', label: 'Optimistic', color: GREEN },
          { key: 'Target', label: `Goal: ${fc(goalNW)}`, color: RED },
        ],
      },
      {
        type: 'bar',
        title: 'Wealth Milestones — Projected Age to Reach Each',
        data: milestoneDates.filter(m => m.age).map(m => ({ name: fc(m.amount), 'Projected Age': m.age || age })),
        xKey: 'name',
        bars: [{ key: 'Projected Age', label: 'Age at Milestone', color: GOLD }],
      },
      {
        type: 'bar',
        title: 'Impact of Incremental Changes on Net Worth (10 Years)',
        data: [
          { name: 'Current Path', value: Math.round(currentNW + fvP(annualSavings, investReturn, 10)) },
          { name: '+$500/month', value: Math.round(currentNW + fvP(annualSavings + 6000, investReturn, 10)) },
          { name: '+$1,000/month', value: Math.round(currentNW + fvP(annualSavings + 12000, investReturn, 10)) },
          { name: '+1% Return', value: Math.round(currentNW + fvP(annualSavings, investReturn + 0.01, 10)) },
          { name: 'Debt-Free Faster', value: Math.round(currentNW + fvP(annualSavings + debtPaydown, investReturn, 10)) },
        ],
        xKey: 'name',
        bars: [{ key: 'value', label: 'Net Worth in 10 Years', color: TEAL }],
      },
    ],
    sections: [
      {
        title: '10-Year Net Worth Projection Table',
        content: `Year-by-year trajectory based on ${fc(annualSavings)}/year savings, ${fp(investReturn * 100)} investment return, and ${fp(homeAppreciation * 100)} home appreciation on ${fc(homeValue)} property.`,
        table: {
          headers: ['Age', 'Projected NW', 'Conservative', 'Optimistic', 'vs. Goal'],
          rows: projections.filter((_, i) => i % Math.max(1, Math.floor(projections.length / 8)) === 0).map(p => [
            p.name,
            fc(p['Net Worth']),
            fc(p['Conservative']),
            fc(p['Optimistic']),
            p['Net Worth'] >= goalNW ? `+${fc(p['Net Worth'] - goalNW)}` : `-${fc(goalNW - p['Net Worth'])}`,
          ]),
          highlight: projections.length > 0 ? Math.min(5, projections.filter((_, i) => i % Math.max(1, Math.floor(projections.length / 8)) === 0).length - 1) : 0,
        },
      },
      {
        title: 'Wealth Acceleration Strategies',
        content: `The three levers of net worth growth are: **savings rate** (most controllable), **investment return** (moderately controllable through asset allocation and fees), and **time** (fixed — act now). Increasing your savings by ${fc(500)}/month adds ${fc(fvP(6000, investReturn, 10))} over 10 years. Reducing fees by 0.5% adds ${fc(fvL(currentNW, 0.005, 10))} through compounding alone.`,
        bigNumbers: [
          { value: fc(fvP(6000, investReturn, 10)), label: '+$500/Month Impact', sub: 'Additional wealth in 10 years', color: GREEN },
          { value: fc(fvL(currentNW, 0.005, 10)), label: '0.5% Lower Fee Impact', sub: 'Extra compounding over 10 years', color: BLUE },
          { value: fc(fvP(annualSavings, investReturn, yearsToGoal)), label: 'Savings Compounding to Goal', sub: `From annual contributions alone`, color: GOLD },
        ],
        callouts: [
          { type: 'info', title: 'The Net Worth Tipping Point', text: 'Once net worth reaches 25× annual expenses, your portfolio generates as much wealth as your labor. This is financial independence. Every dollar saved accelerates this tipping point through compounding — the effect becomes exponential in the later years.' },
        ],
      },
      buildPersonalizedPortfolio(data),
    ],
    scenarios: [
      {
        outcome: `Conservative: ${fc(projections[projections.length - 1]?.['Conservative'] || 0)} by age ${goalAge}`,
        description: `80% of planned savings, 50% of expected home appreciation, no income growth. Goal ${(projections[projections.length - 1]?.['Conservative'] || 0) >= goalNW ? 'achieved' : 'not reached'} under conservative assumptions.`,
      },
      {
        outcome: `Base Case: ${fc(projNWAtGoal)} by age ${goalAge}`,
        description: `${fp(investReturn * 100)} return, ${fp(incomeGrowth * 100)} income growth, current savings. ${onTrack ? 'Goal achieved.' : `${fc(goalNW - projNWAtGoal)} short of ${fc(goalNW)} target.`}`,
      },
      {
        outcome: `Optimistic: ${fc(projections[projections.length - 1]?.['Optimistic'] || 0)} by age ${goalAge}`,
        description: `130% of planned savings, ${fp(investReturn * 120)} investment return, strong home appreciation. Goal achieved with significant surplus — potential for earlier target or larger goal.`,
      },
    ],
    actions: [
      !onTrack ? { priority: 'CRITICAL', timeline: 'This Month', action: `Increase annual savings by ${fc(Math.max(0, (goalNW - projNWAtGoal) / yearsToGoal * 0.3))} to close projection gap`, impact: `Brings net worth trajectory within range of ${fc(goalNW)} goal by age ${goalAge}`, amount: fc(Math.max(0, (goalNW - projNWAtGoal) / yearsToGoal * 0.3)) + '/yr' } : null,
      { priority: 'HIGH', timeline: 'Within 30 Days', action: 'Audit investment fees — switch to index funds under 0.10% expense ratio', impact: `Fee reduction compounds to ${fc(fvL(currentNW, 0.005, yearsToGoal))} in additional net worth by goal age`, amount: 'No direct cost' },
      totalDebt > 0 ? { priority: 'HIGH', timeline: 'Ongoing', action: `Increase annual debt paydown to ${fc(debtPaydown * 1.5)}`, impact: `Eliminating debt faster frees ${fc(debtPaydown * 0.5)}/year for wealth-building investments`, amount: fc(debtPaydown * 0.5) + '/yr extra' } : null,
      { priority: 'MEDIUM', timeline: 'Annually', action: 'Review net worth projection vs. actual — adjust inputs and strategy', impact: 'Annual recalibration keeps strategy aligned with life changes', amount: 'Free' },
    ].filter(Boolean),
  };
}

// ─── 11. College Savings ──────────────────────────────────────────────────────

function generateCollegeSavings(data) {
  const childAge = parseFloat(data.child_age) || 5;
  const numChildren = parseFloat(data.num_children) || 1;
  const schoolType = data.target_school_type || 'Public in-state university';
  const yearsCollege = parseFloat(data.years_of_college) || 4;
  const parentPct = parseFloat(data.parent_contribution) || 50;
  const current529 = parseFloat(data.current_529_balance) || 0;
  const monthly529 = parseFloat(data.monthly_529_contribution) || 0;
  const otherSavings = parseFloat(data.other_education_savings) || 0;
  const parentIncome = parseFloat(data.parent_income) || 0;
  const has529 = data.has_529 || 'No — want to open one';
  const state = data.state || 'your state';

  const yearsToCollege = Math.max(0, 18 - childAge);
  const annualCosts = {
    'Public in-state university': 28000,
    'Public out-of-state university': 45000,
    'Private university': 60000,
    'Ivy League / elite private': 85000,
    'Community college first': 12000,
    'Not sure yet': 35000,
  };
  const currentAnnualCost = annualCosts[schoolType] || 35000;
  const collegeInflation = 0.055;
  const futureCostPerYear = currentAnnualCost * Math.pow(1 + collegeInflation, yearsToCollege);
  const totalCost = futureCostPerYear * yearsCollege * numChildren;
  const parentShare = totalCost * parentPct / 100;

  const returnRate = 0.065;
  const projected529 = fvL(current529 + otherSavings, returnRate, yearsToCollege) + fvP(monthly529 * 12, returnRate, yearsToCollege);
  const gap = Math.max(0, parentShare - projected529);
  const neededMonthly = gap > 0 && yearsToCollege > 0 ? gap / fvP(1, returnRate / 12, yearsToCollege * 12) : 0;

  const scenarios = [100, 200, 300, 500, 750].map(m => ({
    monthly: m,
    projected: Math.round(fvL(current529, returnRate, yearsToCollege) + fvP((monthly529 + m) * 12, returnRate, yearsToCollege)),
  }));

  let score = 50;
  const coveragePct = parentShare > 0 ? projected529 / parentShare * 100 : 100;
  if (coveragePct >= 100) score += 30; else if (coveragePct >= 75) score += 20; else if (coveragePct >= 50) score += 10;
  if (has529.includes('actively')) score += 15; else if (has529.includes('rarely')) score += 5;
  if (yearsToCollege >= 10) score += 5;
  score = Math.max(10, Math.min(99, score));

  return {
    score,
    grade: letterGrade(score),
    headline: `${fc(totalCost)} total cost (inflation-adjusted) · ${fp(coveragePct, 0)} funded · ${gap > 0 ? fc(neededMonthly) + '/month needed' : 'On track'}`,
    summary: `${yearsCollege} years at ${schoolType} starting in ${yearsToCollege} years will cost approximately ${fc(futureCostPerYear)}/year in future dollars (inflation-adjusted at ${fp(collegeInflation * 100)}). Your ${fn(numChildren, 0)} child${numChildren > 1 ? 'ren' : ''}'s total cost: ${fc(totalCost)}. Your planned share (${fn(parentPct, 0)}%): ${fc(parentShare)}. Current trajectory projects ${fc(projected529)} — ${gap > 0 ? `leaving a ${fc(gap)} gap. Need to save ${fc(neededMonthly)}/month to close it.` : `fully covering your share with ${fc(projected529 - parentShare)} surplus.`}`,
    scorecard: [
      { label: 'Current 529 Balance', value: fc(current529), sub: `+${fc(otherSavings)} other savings`, status: current529 > 10000 ? 'good' : current529 > 0 ? 'warning' : 'critical' },
      { label: 'Projected Balance at 18', value: fc(projected529), sub: `At ${fp(returnRate * 100)} avg return`, status: projected529 >= parentShare ? 'good' : projected529 >= parentShare * 0.75 ? 'warning' : 'critical' },
      { label: 'Total College Cost', value: fc(totalCost), sub: `Inflation-adjusted to start date`, status: 'neutral' },
      { label: 'Parent Funding Goal', value: fc(parentShare), sub: `Your ${fn(parentPct, 0)}% share`, status: projected529 >= parentShare ? 'good' : 'warning' },
      { label: 'Funding Gap', value: gap > 0 ? fc(gap) : 'None', sub: gap > 0 ? `${fc(neededMonthly)}/mo to close` : 'Fully funded', status: gap === 0 ? 'good' : gap < parentShare * 0.3 ? 'warning' : 'critical' },
      { label: 'Years Until College', value: `${yearsToCollege} years`, sub: `Child currently age ${childAge}`, status: yearsToCollege >= 12 ? 'good' : yearsToCollege >= 6 ? 'warning' : 'critical' },
    ],
    charts: [
      {
        type: 'area',
        title: `529 Balance Projection — ${yearsToCollege} Years to College`,
        data: (() => {
          const pts = [];
          for (let y = 0; y <= yearsToCollege; y += Math.max(1, Math.floor(yearsToCollege / 8))) {
            pts.push({
              name: `Age ${childAge + y}`,
              'Current Rate': Math.round(fvL(current529 + otherSavings, returnRate, y) + fvP(monthly529 * 12, returnRate, y)),
              'Recommended': Math.round(fvL(current529 + otherSavings, returnRate, y) + fvP((monthly529 + neededMonthly) * 12, returnRate, y)),
              Target: Math.round(parentShare),
            });
          }
          return pts;
        })(),
        xKey: 'name',
        lines: [
          { key: 'Current Rate', label: 'Current Savings Rate', color: GOLD },
          { key: 'Recommended', label: 'Recommended Rate', color: GREEN },
          { key: 'Target', label: 'Funding Target', color: RED },
        ],
      },
      {
        type: 'bar',
        title: 'Contribution Scenarios — Projected Balance at College',
        data: scenarios.map(s => ({ name: `+${fc(s.monthly)}/mo`, projected: s.projected, target: Math.round(parentShare) })),
        xKey: 'name',
        bars: [
          { key: 'projected', label: 'Projected Balance', color: GOLD },
          { key: 'target', label: 'Funding Target', color: BLUE },
        ],
      },
      {
        type: 'donut',
        title: 'Expected College Funding Sources',
        data: [
          { name: '529 Plan (Projected)', value: Math.round(projected529) },
          { name: 'Loans / Work-Study', value: Math.round(gap * 0.5) },
          { name: 'Scholarships / Aid', value: Math.round(totalCost - parentShare) },
          { name: 'Remaining Gap', value: Math.max(0, Math.round(gap * 0.5)) },
        ].filter(d => d.value > 0),
      },
    ],
    sections: [
      {
        title: 'College Cost Projection',
        content: `${schoolType} currently costs approximately ${fc(currentAnnualCost)}/year. At ${fp(collegeInflation * 100)} annual college inflation (historically 5–7%), the cost when your child${numChildren > 1 ? 'ren reach' : ' reaches'} age 18 will be approximately ${fc(futureCostPerYear)}/year — ${fc(futureCostPerYear * yearsCollege)} for ${yearsCollege} years per child. For ${fn(numChildren, 0)} child${numChildren > 1 ? 'ren' : ''}, your total obligation at the ${fn(parentPct, 0)}% share is **${fc(parentShare)}**.`,
        table: {
          headers: ['Contribution Level', 'Monthly', 'Balance at 18', '% of Goal Funded', 'Gap Remaining'],
          rows: [
            ['Current Only', fc(monthly529), fc(projected529 - fvP(neededMonthly * 12, returnRate, yearsToCollege)), fp((projected529 - fvP(neededMonthly * 12, returnRate, yearsToCollege)) / parentShare * 100, 0), fc(Math.max(0, parentShare - (projected529 - fvP(neededMonthly * 12, returnRate, yearsToCollege))))],
            ...scenarios.slice(0, 4).map(s => [
              `+${fc(s.monthly)}/month`,
              fc(monthly529 + s.monthly),
              fc(s.projected),
              fp(s.projected / parentShare * 100, 0),
              fc(Math.max(0, parentShare - s.projected)),
            ]),
          ],
          highlight: gap > 0 ? scenarios.findIndex(s => s.projected >= parentShare) + 1 : 0,
        },
      },
      buildCollegeAllocation(yearsToCollege, childAge),
      {
        title: '529 Plan Strategy & Tax Benefits',
        content: `529 plans offer federal tax-free growth and withdrawals for qualified education expenses (tuition, room, board, books, technology). Many states offer a state income tax deduction for contributions. Superfunding: You can contribute up to 5 years of gift tax exclusion ($18,000 × 5 = $90,000) in a single year without gift tax implications. Unused funds: can now be rolled to Roth IRA (up to $35,000 lifetime, after 15 years) — eliminating the "overfunding" risk.`,
        callouts: [
          { type: 'info', title: 'FAFSA & 529 Asset Impact', text: '529 plans owned by parents count as parental assets on FAFSA, reducing aid by a maximum of 5.64% of the asset value annually. This is much more favorable than student assets (counted at 20%). Grandparent-owned 529s no longer count against aid under the 2024 FAFSA simplification.' },
        ],
      },
    ],
    scenarios: [
      {
        outcome: `Conservative: ${fc(fvL(current529, 0.05, yearsToCollege) + fvP(monthly529 * 12, 0.05, yearsToCollege))} funded`,
        description: `5% return, current contribution rate. Covers ${fp((fvL(current529, 0.05, yearsToCollege) + fvP(monthly529 * 12, 0.05, yearsToCollege)) / parentShare * 100, 0)} of goal. Remaining ${fc(Math.max(0, parentShare - fvL(current529, 0.05, yearsToCollege) - fvP(monthly529 * 12, 0.05, yearsToCollege)))} from loans, scholarships, or other sources.`,
      },
      {
        outcome: `Base Case: ${fc(projected529)} funded`,
        description: `${fp(returnRate * 100)} return, current contributions. ${gap > 0 ? `${fp(coveragePct, 0)} of goal — ${fc(gap)} gap. Adding ${fc(neededMonthly)}/month closes it.` : 'Goal fully funded.'}`,
      },
      {
        outcome: `Aggressive: ${fc(fvL(current529, 0.08, yearsToCollege) + fvP((monthly529 + neededMonthly) * 12, 0.08, yearsToCollege))} funded`,
        description: `8% return + increased contributions. Likely overfunds goal — excess can fund graduate school or roll to Roth IRA under SECURE 2.0 rules.`,
      },
    ],
    actions: [
      !has529.includes('actively') ? { priority: 'CRITICAL', timeline: 'This Week', action: `Open a 529 plan — consider your state's plan or Utah's My529 / Nevada's Vanguard 529`, impact: 'Tax-free compounding starts immediately — every month of delay costs compounding growth', amount: 'Free to open, $25 min contribution' } : null,
      gap > 0 ? { priority: 'HIGH', timeline: 'Next Payday', action: `Increase monthly 529 contribution to ${fc(monthly529 + neededMonthly)}/month`, impact: `Closes ${fc(gap)} funding gap — ${yearsToCollege} years of compounding magnifies every dollar`, amount: fc(neededMonthly) + '/mo more' } : null,
      { priority: 'HIGH', timeline: 'Before Year End', action: `Redirect birthday/holiday gifts to child's 529 plan`, impact: 'Grandparents and relatives can contribute — amplifies fund without changing your budget', amount: 'Varies' },
      { priority: 'MEDIUM', timeline: 'This Month', action: `Set your 529 to an age-based target date track — see the Investment Allocation section above for the right fund based on ${yearsToCollege} years to college`, impact: 'Age-based target date funds automatically glide from aggressive to conservative as enrollment approaches — no manual rebalancing needed', amount: 'Free to change' },
      { priority: 'MEDIUM', timeline: 'Within 60 Days', action: `Check if ${state} offers a state income tax deduction for 529 contributions`, impact: `State tax deduction on contributions can provide additional 3–7% effective yield`, amount: 'Depends on state' },
    ].filter(Boolean),
  };
}

// ─── 12. Buy vs. Rent ─────────────────────────────────────────────────────────

function generateBuyVsRent(data) {
  const homePrice = parseFloat(data.home_price) || 400000;
  const downPayment = parseFloat(data.down_payment) || 80000;
  const rent = parseFloat(data.current_rent) || 2000;
  const mortgage = parseFloat(data.estimated_mortgage) || 2800;
  const income = parseFloat(data.annual_income) || 120000;
  const rate = (parseFloat(data.interest_rate) || 7) / 100;
  const propTaxRate = (parseFloat(data.property_tax_rate) || 1.2) / 100;
  const creditRange = data.credit_score_range || '720-759 (Very Good)';
  const plannedStay = data.planned_stay || '5-10 years';
  const homeAppreciation = (parseFloat(data.home_appreciation) || 3) / 100;
  const rentIncrease = (parseFloat(data.rent_increase) || 4) / 100;
  const investDiff = data.investment_alternative || 'Maybe — somewhat';
  const motivation = data.primary_motivation || 'Build equity / wealth';

  const loanAmount = homePrice - downPayment;
  const dpPct = homePrice > 0 ? downPayment / homePrice * 100 : 0;
  const monthlyRate = rate / 12;
  const nPayments = 360;
  const mortgagePI = loanAmount > 0 ? loanAmount * monthlyRate * Math.pow(1 + monthlyRate, nPayments) / (Math.pow(1 + monthlyRate, nPayments) - 1) : 0;
  const propTax = homePrice * propTaxRate / 12;
  const maintenance = homePrice * 0.015 / 12;
  const homeInsurance = homePrice * 0.005 / 12;
  const pmi = dpPct < 20 ? loanAmount * 0.008 / 12 : 0;
  const totalOwningCost = mortgage || (mortgagePI + propTax + maintenance + homeInsurance + pmi);
  const rentPlusInsurance = rent + 20; // renter's insurance

  const monthlyCostDiff = totalOwningCost - rentPlusInsurance;
  const priceToRent = homePrice / (rent * 12);

  // Equity build-up over time
  const equityData = [];
  for (let y = 1; y <= 10; y++) {
    const remainingBalance = loanAmount * Math.pow(1 + monthlyRate, y * 12) - mortgagePI * (Math.pow(1 + monthlyRate, y * 12) - 1) / monthlyRate;
    const homeVal = homePrice * Math.pow(1 + homeAppreciation, y);
    const equity = homeVal - Math.max(0, remainingBalance);
    equityData.push({
      name: `Year ${y}`,
      'Home Value': Math.round(homeVal),
      'Equity': Math.round(equity),
      'Loan Balance': Math.round(Math.max(0, remainingBalance)),
    });
  }

  // Investment alternative: if renting, invest the difference
  const investmentData = equityData.map((e, i) => {
    const y = i + 1;
    const rentCumulative = rent * Math.pow(1 + rentIncrease / 12, y * 12 - 1) * 12 / rentIncrease * (1 - Math.pow(1 - rentIncrease / 12, y * 12));
    const investPortfolio = fvP(monthlyCostDiff, 0.07 / 12, y * 12);
    return {
      ...e,
      'Investment Portfolio': Math.round(investPortfolio),
    };
  });

  // Break-even: when home equity + appreciation exceeds renter's investment portfolio
  let breakEvenYear = 0;
  for (let i = 0; i < investmentData.length; i++) {
    if (investmentData[i]['Equity'] >= investmentData[i]['Investment Portfolio'] - downPayment) {
      breakEvenYear = i + 1;
      break;
    }
  }

  const stayYears = plannedStay.includes('1-2') ? 1.5 : plannedStay.includes('3-5') ? 4 : plannedStay.includes('5-10') ? 7 : plannedStay.includes('10+') ? 15 : 5;
  const buyRecommended = stayYears >= (breakEvenYear || 7) && dpPct >= 10 && income > 0 && mortgage / (income / 12) < 0.43;

  const dti = income > 0 ? totalOwningCost / (income / 12) * 100 : 0;
  const frontEnd = income > 0 ? totalOwningCost / (income / 12) * 100 : 0;

  let score = 60;
  if (dpPct >= 20) score += 15; else if (dpPct >= 10) score += 8; else score -= 5;
  if (dti <= 28) score += 10; else if (dti <= 36) score += 5; else if (dti > 43) score -= 15;
  if (priceToRent < 15) score += 10; else if (priceToRent > 25) score -= 10;
  if (stayYears >= 7) score += 10; else if (stayYears < 3) score -= 10;
  score = Math.max(10, Math.min(99, score));

  return {
    score,
    grade: letterGrade(score),
    headline: `${buyRecommended ? 'BUY' : 'RENT'} recommended for your situation · Break-even at year ${breakEvenYear || '7+'} · Price-to-rent ratio: ${fn(priceToRent, 1)}`,
    summary: `Total cost of ownership is ${fc(totalOwningCost)}/month vs. ${fc(rentPlusInsurance)}/month renting — a ${fc(Math.abs(monthlyCostDiff))} ${monthlyCostDiff > 0 ? 'premium to own' : 'saving from owning'}. At ${fp(homeAppreciation * 100)} annual appreciation, the break-even point (when buying wins financially) is approximately year ${breakEvenYear || 7}. With a planned stay of ${plannedStay}, buying ${stayYears >= (breakEvenYear || 7) ? 'makes financial sense' : 'may not reach break-even — renting could be better'}. Down payment of ${fp(dpPct)} ${dpPct >= 20 ? 'avoids PMI' : `triggers PMI of ${fc(pmi)}/month`}.`,
    scorecard: [
      { label: 'Monthly Cost — Buy', value: fc(totalOwningCost), sub: 'PITI + maintenance', status: totalOwningCost < rent * 1.3 ? 'good' : 'warning' },
      { label: 'Monthly Cost — Rent', value: fc(rentPlusInsurance), sub: 'Rent + renters insurance', status: 'neutral' },
      { label: 'Down Payment', value: fp(dpPct), sub: `${fc(downPayment)} of ${fc(homePrice)}`, status: dpPct >= 20 ? 'good' : dpPct >= 10 ? 'warning' : 'critical' },
      { label: 'Front-End DTI', value: fp(frontEnd), sub: 'Target: under 28%', status: frontEnd <= 28 ? 'good' : frontEnd <= 36 ? 'warning' : 'critical' },
      { label: 'Price-to-Rent Ratio', value: fn(priceToRent, 1), sub: `<15 = Buy, >25 = Rent`, status: priceToRent < 15 ? 'good' : priceToRent < 25 ? 'warning' : 'critical' },
      { label: 'Break-Even Timeline', value: breakEvenYear ? `Year ${breakEvenYear}` : '7+ years', sub: `You plan: ${plannedStay}`, status: stayYears >= (breakEvenYear || 7) ? 'good' : 'critical' },
    ],
    charts: [
      {
        type: 'area',
        title: '10-Year Equity Build-Up vs. Investment Portfolio Alternative',
        data: investmentData,
        xKey: 'name',
        lines: [
          { key: 'Equity', label: 'Home Equity (Buying)', color: GOLD },
          { key: 'Investment Portfolio', label: 'Investment Portfolio (Renting)', color: BLUE },
        ],
      },
      {
        type: 'bar',
        title: 'True Monthly Cost Comparison',
        data: [
          { name: 'Mortgage (P&I)', cost: Math.round(mortgagePI) },
          { name: 'Property Tax', cost: Math.round(propTax) },
          { name: 'Maintenance', cost: Math.round(maintenance) },
          { name: 'Insurance', cost: Math.round(homeInsurance) },
          { name: 'PMI', cost: Math.round(pmi) },
          { name: 'Rent (Comparison)', cost: -Math.round(rent) },
        ].filter(d => d.cost !== 0),
        xKey: 'name',
        bars: [{ key: 'cost', label: 'Monthly Cost', color: GOLD }],
      },
      {
        type: 'bar',
        title: 'Home Equity Accumulation — 10 Year Timeline',
        data: equityData.filter((_, i) => i % 2 === 0 || i === equityData.length - 1),
        xKey: 'name',
        bars: [
          { key: 'Home Value', label: 'Home Value', color: BLUE },
          { key: 'Equity', label: 'Your Equity', color: GREEN },
          { key: 'Loan Balance', label: 'Remaining Loan', color: RED },
        ],
      },
    ],
    sections: [
      {
        title: 'True Cost of Buying vs. Renting',
        content: `The mortgage payment is only part of the cost of ownership. True monthly cost of buying includes: Mortgage P&I (${fc(mortgagePI)}), Property tax (${fc(propTax)}/month = ${fp(propTaxRate * 100)}/year), Maintenance (${fc(maintenance)} = 1.5% of value annually), Insurance (${fc(homeInsurance)}), ${pmi > 0 ? `PMI (${fc(pmi)}) until 20% equity, ` : ''}totaling ${fc(totalOwningCost)}/month vs. renting at ${fc(rentPlusInsurance)}/month. The ${fc(Math.abs(monthlyCostDiff))} ${monthlyCostDiff > 0 ? 'premium' : 'saving'} to own must be weighed against equity building, appreciation, and tax benefits.`,
        table: {
          headers: ['Cost Component', 'Buying', 'Renting', 'Notes'],
          rows: [
            ['Base Payment', fc(mortgagePI), fc(rent), 'Mortgage P&I vs. rent'],
            ['Property Tax', fc(propTax), '$0', `${fp(propTaxRate * 100)}/year on ${fc(homePrice)}`],
            ['Maintenance Reserve', fc(maintenance), '$0', '1.5% of home value/year'],
            ['Insurance', fc(homeInsurance), '$20', 'Home vs. renters insurance'],
            ['PMI', fc(pmi), '$0', dpPct >= 20 ? 'N/A — 20%+ down' : 'Until 20% equity'],
            ['Total Monthly', fc(totalOwningCost), fc(rentPlusInsurance), `${monthlyCostDiff > 0 ? '+' : ''}${fc(monthlyCostDiff)} to own`],
          ],
          highlight: 5,
        },
        callouts: [
          priceToRent > 25 ? { type: 'warning', title: 'High Price-to-Rent Ratio — Renting May Be Better', text: `A P/R ratio of ${fn(priceToRent, 1)} (above 25) suggests this market is expensive relative to rents. Historically, ratios above 25 favor renting and investing the difference. The investment alternative may outperform home equity over your planned stay.` } : null,
          dpPct < 20 ? { type: 'warning', title: 'PMI Cost — Path to Elimination', text: `With ${fp(dpPct)} down, you'll pay ${fc(pmi)}/month in PMI until you reach 20% equity (${fc(homePrice * 0.20)} in home value). At current appreciation, this takes approximately ${fn((homePrice * 0.20 - downPayment) / (homePrice * homeAppreciation), 1)} years. PMI can typically be removed by requesting cancellation once you reach 20% equity via appraisal.` } : null,
        ].filter(Boolean),
      },
      {
        title: 'Break-Even Analysis & DTI Qualification',
        content: `The break-even year (${breakEvenYear || '7+'}) represents when cumulative home equity + appreciation exceeds what you would have built by renting and investing the monthly difference. With your planned stay of ${plannedStay}, you ${stayYears >= (breakEvenYear || 7) ? 'will exceed' : 'will not reach'} the break-even point.\n\nLender qualification analysis: Front-end DTI ${fp(frontEnd)} (housing costs / gross income) — lenders prefer under 28%. Most conventional lenders require: 620+ credit score, 3–20% down, back-end DTI under 43%. Your credit range (${creditRange}) ${creditRange.includes('760') || creditRange.includes('720') ? 'qualifies for best available rates' : 'may impact available rates'}.`,
        bigNumbers: [
          { value: `Year ${breakEvenYear || '7+'}`, label: 'Buy vs Rent Break-Even', sub: 'When buying wins financially', color: buyRecommended ? GREEN : GOLD },
          { value: fc(equityData[4]?.Equity || 0), label: 'Projected Equity in 5 Years', sub: `${fc(homePrice * Math.pow(1 + homeAppreciation, 5))} estimated home value`, color: GREEN },
          { value: fp(frontEnd), label: 'Front-End DTI', sub: 'Target: under 28%', color: frontEnd <= 28 ? GREEN : frontEnd <= 36 ? GOLD : RED },
        ],
      },
    ],
    scenarios: [
      {
        outcome: `Rent & Invest: ${fc(investmentData[6]?.['Investment Portfolio'] || 0)} in 7 years`,
        description: `Rent at ${fc(rent)}/month + invest ${fc(Math.abs(monthlyCostDiff))}/month difference at 7% return. Portfolio grows to ${fc(investmentData[6]?.['Investment Portfolio'] || 0)} by year 7. Works best if staying < ${breakEvenYear || 5} years.`,
      },
      {
        outcome: `Buy Now: ${fc(equityData[6]?.Equity || 0)} equity in 7 years`,
        description: `Purchase at ${fc(homePrice)} with ${fc(downPayment)} down. Equity at year 7: ${fc(equityData[6]?.Equity || 0)} (appreciation + principal paydown). ${dpPct < 20 ? `PMI eliminated around year ${fn((homePrice * 0.20 - downPayment) / (homePrice * homeAppreciation), 0)}.` : 'No PMI required.'}`,
      },
      {
        outcome: `Buy Later (Save More Down): Break-even at year ${Math.max(1, (breakEvenYear || 7) - 1)}`,
        description: `Wait 18 months to save ${fc(homePrice * 0.20 - downPayment)} more for 20% down. Eliminates PMI (saves ${fc(pmi * 12)}/year), lowers monthly by ${fc(pmi)}, and improves break-even timeline.`,
      },
    ],
    actions: [
      dpPct < 20 ? { priority: 'HIGH', timeline: 'Before Purchase', action: `Save ${fc(homePrice * 0.20 - downPayment)} more to reach 20% down and eliminate PMI`, impact: `Saves ${fc(pmi * 12)}/year in PMI premiums and improves loan terms`, amount: fc(homePrice * 0.20 - downPayment) + ' needed' } : null,
      buyRecommended ? { priority: 'HIGH', timeline: 'Within 60 Days', action: 'Get pre-approved with 3+ lenders — compare rates and loan estimates', impact: `0.5% rate difference on ${fc(loanAmount)} loan = ${fc(loanAmount * 0.005)} in additional interest over 30 years`, amount: 'Free to get quotes' } : null,
      { priority: 'HIGH', timeline: 'Before Deciding', action: 'Calculate your true total cost of ownership vs. renting using this analysis', impact: 'Most people underestimate ownership costs by 30–40% — full picture prevents surprises', amount: 'This report' },
      { priority: 'MEDIUM', timeline: 'Ongoing', action: `If renting, invest ${fc(Math.max(0, monthlyCostDiff))}/month difference in index funds`, impact: `Builds investment portfolio to ${fc(fvP(Math.max(0, monthlyCostDiff), 0.07 / 12, 60))} in 5 years — builds wealth while waiting for right time to buy`, amount: fc(Math.max(0, monthlyCostDiff)) + '/mo' },
      { priority: 'MEDIUM', timeline: 'Annually', action: 'Monitor price-to-rent ratio in your market — market conditions change', impact: `Current P/R of ${fn(priceToRent, 1)} may shift — reassess buy vs. rent annually`, amount: 'Free' },
    ].filter(Boolean),
  };
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function generateReport(reportId, data) {
  switch (reportId) {
    case 'wealth_diagnostic':     return generateWealthDiagnostic(data);
    case 'tax_efficiency':        return generateTaxEfficiency(data);
    case 'retirement_readiness':  return generateRetirementReadiness(data);
    case 'portfolio_review':      return generatePortfolioReview(data);
    case 'debt_elimination':      return generateDebtElimination(data);
    case 'insurance_audit':       return generateInsuranceAudit(data);
    case 'emergency_fund':        return generateEmergencyFund(data);
    case 'estate_planning':       return generateEstatePlanning(data);
    case 'budget_optimization':   return generateBudgetOptimization(data);
    case 'net_worth_projection':  return generateNetWorthProjection(data);
    case 'college_savings':       return generateCollegeSavings(data);
    case 'buy_vs_rent':           return generateBuyVsRent(data);
    default:                      return generateWealthDiagnostic(data);
  }
}
