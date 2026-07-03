import React, { useState, useMemo, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell, ReferenceArea
} from "recharts";
import {
  TrendingUp, TrendingDown, BookOpen, DollarSign,
  Lightbulb, Search, ChevronRight, X, Clock, AlertTriangle, CheckCircle,
  History, BarChart2, TrendingDown as TrendingDownAlt, Landmark
} from "lucide-react";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const TT_STYLE = { background: "var(--surface)", border: "1px solid var(--border-c)", borderRadius: 4, fontSize: 11, color: "var(--text-1)" };
const GOLD = "#c9a96e";
const UP   = "#00b899";
const DOWN = "#ff3b5c";

/* ─── Long-term DOW data ─────────────────────────────────────────────────── */
const DOW_HISTORY = [
  {y:1900,v:66},{y:1901,v:70},{y:1902,v:75},{y:1903,v:68},{y:1904,v:82},
  {y:1905,v:96},{y:1906,v:100},{y:1907,v:58},{y:1908,v:86},{y:1909,v:100},
  {y:1910,v:98},{y:1911,v:87},{y:1912,v:94},{y:1913,v:78},{y:1914,v:54},
  {y:1915,v:70},{y:1916,v:95},{y:1917,v:74},{y:1918,v:83},{y:1919,v:108},
  {y:1920,v:71},{y:1921,v:81},{y:1922,v:103},{y:1923,v:97},{y:1924,v:122},
  {y:1925,v:157},{y:1926,v:166},{y:1927,v:202},{y:1928,v:300},{y:1929,v:381},
  {y:1930,v:165},{y:1931,v:77},{y:1932,v:41},{y:1933,v:99},{y:1934,v:93},
  {y:1935,v:150},{y:1936,v:184},{y:1937,v:120},{y:1938,v:154},{y:1939,v:131},
  {y:1940,v:131},{y:1941,v:112},{y:1942,v:120},{y:1943,v:136},{y:1944,v:152},
  {y:1945,v:192},{y:1946,v:177},{y:1947,v:181},{y:1948,v:177},{y:1949,v:200},
  {y:1950,v:235},{y:1952,v:292},{y:1955,v:488},{y:1957,v:436},{y:1960,v:616},
  {y:1962,v:535},{y:1965,v:969},{y:1966,v:786},{y:1968,v:943},{y:1970,v:753},
  {y:1972,v:1003},{y:1974,v:578},{y:1975,v:852},{y:1976,v:1005},{y:1978,v:805},
  {y:1980,v:964},{y:1982,v:1047},{y:1985,v:1547},{y:1986,v:1896},{y:1987,v:2722},
  {y:1988,v:2169},{y:1989,v:2753},{y:1990,v:2634},{y:1991,v:3169},{y:1993,v:3754},
  {y:1995,v:5117},{y:1996,v:6448},{y:1998,v:9181},{y:2000,v:10787},{y:2001,v:9900},
  {y:2002,v:8342},{y:2003,v:10454},{y:2004,v:10783},{y:2006,v:12463},{y:2007,v:14165},
  {y:2008,v:8776},{y:2009,v:6547},{y:2010,v:11578},{y:2011,v:12218},{y:2013,v:16577},
  {y:2015,v:17425},{y:2017,v:24719},{y:2019,v:28538},{y:2020,v:18592},{y:2021,v:36338},
  {y:2022,v:28726},{y:2023,v:37090},{y:2024,v:39807},{y:2025,v:44156},{y:2026,v:48200},
];

// type: "crash" = red, "milestone" = gold, "bull" = green
const DOW_EVENTS = [
  { year:1906, label:"DOW Hits 100",          type:"milestone", eventId:null, dow:100,   change:"+52% since 1900",
    brief:"The first major psychological milestone in market history. After 10 years of volatile growth the Dow crossed 100, reflecting a booming industrial America powered by railroads, steel, and manufacturing." },
  { year:1907, label:"Panic of 1907",          type:"crash",     eventId:null, dow:58,    change:"−42% from peak",
    brief:"A banking crisis triggered by failed copper speculation nearly collapsed the US financial system. J.P. Morgan personally organized a private bailout. This panic directly led to the creation of the Federal Reserve in 1913." },
  { year:1914, label:"WWI Begins",             type:"crash",     eventId:null, dow:54,    change:"−30% from 1909",
    brief:"The NYSE closed for 4 months — the longest closure in its history — as foreign investors liquidated US holdings to fund the war. When it reopened, European war production orders began flooding in, eventually driving a major bull run." },
  { year:1919, label:"Post-WWI Boom",          type:"bull",      eventId:null, dow:108,   change:"+100% from 1914",
    brief:"Returning soldiers and pent-up consumer demand ignited an economic boom. The war made the US the world's largest creditor nation. The 'Roaring Twenties' expansion that followed drove markets to historic — and ultimately catastrophic — peaks." },
  { year:1929, label:"Black Tuesday",          type:"crash",     eventId:"great_depression", dow:381, change:"Peak before −89% crash",
    brief:"The most infamous day in market history. After years of speculative mania fueled by 90% margin buying, the market imploded. October 29, 1929 saw 16.4 million shares traded in one session — triggering the Great Depression." },
  { year:1932, label:"Depression Bottom −89%", type:"crash",     eventId:"great_depression", dow:41,  change:"−89% from 1929 peak",
    brief:"The absolute bottom of the Great Depression — the worst financial collapse in modern history. Unemployment hit 25%, over 9,000 banks had failed, and global trade collapsed 66%. From this low it would take 25 years to fully recover." },
  { year:1937, label:"Roosevelt Recession",    type:"crash",     eventId:null, dow:120,   change:"−49% from 1936 peak",
    brief:"FDR cut New Deal spending too early, believing the economy had recovered. Markets fell nearly 50% in a secondary recession. This became a textbook lesson — removing fiscal stimulus prematurely can kill a recovery — studied by every policymaker since." },
  { year:1941, label:"Pearl Harbor",           type:"crash",     eventId:null, dow:112,   change:"−5% immediate drop",
    brief:"Japan's surprise attack brought the US into WWII. Markets dropped sharply at open but quickly stabilized as the massive wartime production mobilization — the largest in US history — created the most powerful economic expansion America had ever seen." },
  { year:1945, label:"WWII Victory / Bull",    type:"bull",      eventId:null, dow:192,   change:"+71% from 1941",
    brief:"Victory in Europe and the Pacific launched one of the great post-war bull markets. The GI Bill, baby boom, suburban expansion, and the consumer economy drove 15 years of prosperity. The Dow would multiply 5× over the next two decades." },
  { year:1962, label:"Kennedy Slide",          type:"crash",     eventId:null, dow:535,   change:"−27% in 6 months",
    brief:"A 27% decline triggered by JFK's steel price standoff and Cold War tensions (Bay of Pigs, Cuban Missile Crisis). It was the sharpest crash since 1929 — and the fastest recovery. Markets fully rebounded within a year, setting up the mid-'60s bull market." },
  { year:1966, label:"DOW Hits 1,000",         type:"milestone", eventId:null, dow:786,   change:"First crossed 1,000 Jan 1966",
    brief:"After 66 years and two World Wars, the Dow crossed 1,000 for the first time in January 1966. The market then struggled to stay above this level for 16 years — trading between 500–1,000 as stagflation and oil shocks plagued the economy." },
  { year:1974, label:"OPEC Oil Crisis",        type:"crash",     eventId:null, dow:578,   change:"−45% from 1972 peak",
    brief:"The Arab oil embargo quadrupled energy prices overnight. Combined with Watergate's political crisis and rampant stagflation, markets fell 45% — the worst bear market since the Depression and the first major energy-driven recession in US history." },
  { year:1982, label:"Bull Market Begins",     type:"bull",      eventId:null, dow:1047,  change:"Start of 18-year bull market",
    brief:"After 16 years of sideways action and brutal inflation, Fed Chair Paul Volcker's rate cuts ignited one of the greatest bull markets in history. From August 1982 to January 2000 the Dow rose from 777 to 11,497 — a gain of over 1,400%." },
  { year:1987, label:"Black Monday −22%",      type:"crash",     eventId:"black_monday",  dow:2722,  change:"−22.6% in one day",
    brief:"The largest single-day percentage crash in market history — the Dow fell 508 points (22.6%) in one session. Portfolio insurance and automated program trading created a cascade of selling. The market fully recovered within 15 months." },
  { year:1990, label:"Gulf War Recession",     type:"crash",     eventId:null, dow:2634,  change:"−21% from 1989 peak",
    brief:"Iraq's invasion of Kuwait triggered an oil shock and a brief US recession. Markets fell 21%. The swift US military victory in early 1991 — Operation Desert Storm — rapidly restored confidence and full recovery came within 9 months." },
  { year:1998, label:"LTCM / Russia Crisis",   type:"crash",     eventId:null, dow:9181,  change:"−20% in 2 months",
    brief:"Russia defaulted on its debt, triggering a global flight to safety. Long-Term Capital Management — a hedge fund run by Nobel laureates — collapsed with $1.25 trillion in derivatives exposure. The Fed organized a private bailout to prevent systemic collapse." },
  { year:2000, label:"Dot-Com Peak",           type:"crash",     eventId:"dotcom",        dow:10787, change:"Nasdaq would fall −78%",
    brief:"The peak of the greatest speculative tech bubble in history. Hundreds of internet companies with no revenue traded at absurd valuations. When it burst, the Nasdaq fell 78% over 30 months, wiping out $5 trillion in market value." },
  { year:2001, label:"9/11 Attack",            type:"crash",     eventId:null, dow:9900,  change:"−14% in one week",
    brief:"The terrorist attacks closed the NYSE for 4 trading days — the longest closure since 1933. When markets reopened the Dow fell 684 points in a single day. Travel, insurance, and defense sectors were permanently reshaped. Full recovery took 2 years." },
  { year:2008, label:"Financial Crisis",       type:"crash",     eventId:"crisis_2008",   dow:8776,  change:"−54% from 2007 peak",
    brief:"The collapse of the US mortgage market triggered a global financial crisis — the worst since 1929. Lehman Brothers failed, AIG required a $182B bailout, and the Treasury injected $700B through TARP. Markets fell 54% before bottoming in March 2009." },
  { year:2009, label:"Market Bottom",          type:"bull",      eventId:"crisis_2008",   dow:6547,  change:"Start of 11-year bull market",
    brief:"On March 9, 2009 the Dow hit 6,547 — the Crisis bottom. The Fed's zero interest rate policy and quantitative easing ignited one of the longest bull markets in history. From this low the Dow rose over 500% in the next 11 years." },
  { year:2011, label:"US Debt Downgrade",      type:"crash",     eventId:null, dow:12218, change:"−19% in 5 months",
    brief:"S&P downgraded US sovereign debt from AAA to AA+ for the first time in history, citing political gridlock over the debt ceiling. Combined with European debt crisis fears the S&P fell 19% — a sobering reminder that political risk is also market risk." },
  { year:2017, label:"DOW Hits 20,000",        type:"milestone", eventId:null, dow:24719, change:"+200% since 2009 bottom",
    brief:"The Dow crossed 20,000 for the first time in January 2017 — a milestone that took 8 years to reach after the Financial Crisis. Corporate tax cuts and strong earnings drove continued gains, with the Dow doubling again to 40,000 by 2024." },
  { year:2020, label:"COVID Crash −34%",       type:"crash",     eventId:"covid",         dow:18592, change:"−34% in 33 days",
    brief:"The fastest crash in market history — the Dow fell 34% in just 33 days as COVID-19 shut down the global economy. But $5+ trillion in stimulus engineered the fastest recovery ever — full rebound in just 5 months, and new all-time highs by year end." },
  { year:2021, label:"Post-COVID ATH",         type:"bull",      eventId:null, dow:36338, change:"+95% from March 2020",
    brief:"Vaccine rollouts and massive stimulus drove markets to record highs. The Dow gained 90% from its COVID bottom in just 18 months — the fastest recovery in history. Near-zero interest rates pushed enormous capital flows into equities." },
  { year:2022, label:"Fed Bear Market",        type:"crash",     eventId:"bear_2022",     dow:28726, change:"−25% S&P, −33% Nasdaq",
    brief:"The fastest Fed rate hike cycle in 40 years — from 0.25% to 5.25% in 12 months — crushed rate-sensitive growth stocks. The S&P fell 25%, Nasdaq 33%. Bonds had their worst year since 1788. A painful reset for a decade of easy-money valuations." },
  { year:2024, label:"AI Bull / DOW 40K",      type:"bull",      eventId:"ai_bull",       dow:39807, change:"+40% from 2022 low",
    brief:"The AI revolution — led by NVIDIA's extraordinary gains — sparked the most powerful tech rally since the dot-com era. The Dow crossed 40,000 for the first time in May 2024. The Magnificent 7 accounted for the majority of S&P 500 gains." },
];

/* ─── Market Event Data ──────────────────────────────────────────────────── */
const MARKET_EVENTS = [
  {
    id: "great_depression",
    name: "Great Depression",
    period: "1929 – 1939",
    type: "crash",
    color: "#ef4444",
    stats: { peak: "381 (Sep 1929)", trough: "41 (Jul 1932)", drawdown: "-89.2%", duration: "34 months", recovery: "Nov 1954", recoveryTime: "25 years" },
    tagline: "The worst financial collapse in modern history — markets fell nearly 90%",
    chartData: [
      {d:"1928-01",v:200},{d:"1928-06",v:240},{d:"1929-01",v:300},{d:"1929-06",v:350},
      {d:"1929-09",v:381},{d:"1929-10",v:272},{d:"1929-12",v:248},{d:"1930-06",v:220},
      {d:"1930-12",v:165},{d:"1931-06",v:150},{d:"1931-12",v:77},{d:"1932-03",v:73},
      {d:"1932-07",v:41},{d:"1932-12",v:60},{d:"1933-06",v:99},{d:"1933-12",v:99},
      {d:"1934-06",v:95},{d:"1935-01",v:105},{d:"1935-12",v:150},{d:"1936-12",v:184},
      {d:"1937-06",v:175},{d:"1937-12",v:120},{d:"1938-06",v:133},{d:"1939-12",v:131},
    ],
    timeline: [
      { date:"Oct 24, 1929", event:"Black Thursday", desc:"Markets open to panic selling — 12.9M shares traded (3x normal). Banks scramble to prop up prices.", type:"crash" },
      { date:"Oct 29, 1929", event:"Black Tuesday", desc:"16.4M shares traded. DJIA falls 11.7%. Ticker tape machines fall 2 hours behind.", type:"crash" },
      { date:"Nov 1929", event:"First Wave Bottom", desc:"Markets briefly stabilize. Many believe the worst is over — they are wrong.", type:"milestone" },
      { date:"1930", event:"Smoot-Hawley Tariffs", desc:"Congress passes massive tariffs. Trading partners retaliate. Global trade collapses 66%.", type:"policy" },
      { date:"1931", event:"Bank Failures Cascade", desc:"Over 2,000 US banks fail. Depositors lose savings. Credit seizes entirely.", type:"crash" },
      { date:"Jul 8, 1932", event:"Market Bottom", desc:"DJIA hits 41.22 — down 89.2% from peak. Unemployment reaches 25%.", type:"crash" },
      { date:"Mar 1933", event:"FDR's New Deal Begins", desc:"Bank Holiday declared. FDIC created. Emergency banking relief passed.", type:"policy" },
      { date:"1934-1939", event:"Slow Recovery", desc:"Economy improves gradually under New Deal programs. Markets grind higher.", type:"recovery" },
    ],
    howItHappened: [
      "Rampant stock speculation in the 1920s pushed valuations to extreme levels — stocks traded at 30x earnings",
      "Margin buying (borrowing 90% to buy stocks) created massive leverage that amplified losses",
      "The Federal Reserve raised interest rates into a weakening economy, tightening credit",
      "Smoot-Hawley Tariffs of 1930 triggered global trade wars, collapsing international commerce",
      "Bank runs caused over 9,000 banks to fail between 1930–1933, wiping out savings",
    ],
    howItGotFixed: [
      "FDR declared a Bank Holiday in March 1933 to stop the bank run panic",
      "The FDIC was created to insure deposits and restore confidence in the banking system",
      "New Deal programs (CCC, WPA, PWA) put millions back to work through government spending",
      "The Securities Act (1933) and SEC (1934) were created to regulate markets and prevent fraud",
      "WWII industrial mobilization ultimately ended unemployment and fully restored economic output",
    ],
    investmentExamples: [
      { asset:"Gold", action:"Held or bought gold", result:"+69%", detail:"Gold was the ultimate safe haven. The US was still on the gold standard — gold holdings preserved wealth." },
      { asset:"US Treasuries", action:"Bought government bonds", result:"+20%", detail:"Treasury bonds performed well as deflation made fixed payments more valuable in real terms." },
      { asset:"Consumer Staples", action:"Held P&G, Campbell Soup", result:"-10% to -15%", detail:"People still needed food and soap. Defensive staples dramatically outperformed the broader market." },
      { asset:"Cash", action:"Stayed in cash/gold", result:"Purchasing power +30%", detail:"Deflation meant cash actually gained purchasing power — prices fell ~30% during the depression." },
      { asset:"Bank Stocks", action:"Held bank stocks", result:"-90%", detail:"The worst possible hold. Thousands of banks failed entirely, wiping out shareholders completely." },
    ],
    keyLessons: [
      { title:"Diversification is survival", lesson:"Investors concentrated in stocks were wiped out. Gold and bonds preserved wealth — diversification across asset classes is essential." },
      { title:"Leverage kills", lesson:"Margin buyers who borrowed 90% to invest lost everything. Even a 10% drop triggered margin calls that spiraled into total loss." },
      { title:"Government policy matters enormously", lesson:"The wrong policies (Smoot-Hawley tariffs, tight money) turned a recession into a depression. Policy response determines the outcome." },
      { title:"Recoveries happen — but on long timelines", lesson:"Even from a -89% crash, the market eventually recovered. But it took 25 years. Planning horizon matters." },
      { title:"Cash during deflation is a position", lesson:"When prices are falling (deflation), holding cash is an investment. Your purchasing power grows every month." },
    ],
    topPerformers: [
      { name:"Gold", ticker:"Gold", return:"+69%", note:"Monetary safe haven during deflation" },
      { name:"US Treasuries", ticker:"T-Bills", return:"+20%", note:"Deflation boosted real value of fixed payments" },
      { name:"Procter & Gamble", ticker:"PG", return:"-10%", note:"Consumer staples held up vs -89% market" },
      { name:"Campbell Soup", ticker:"CPB", return:"-12%", note:"Food demand inelastic during crisis" },
      { name:"Utility Bonds", ticker:"Bonds", return:"+15%", note:"Fixed income outperformed equities" },
      { name:"Kellogg's", ticker:"K", return:"-8%", note:"Cereal demand held steady" },
      { name:"Colgate-Palmolive", ticker:"CL", return:"-11%", note:"Hygiene products defensive" },
      { name:"Philip Morris", ticker:"MO", return:"-15%", note:"Tobacco demand inelastic" },
      { name:"Coca-Cola", ticker:"KO", return:"-18%", note:"Affordable luxury held up" },
      { name:"AT&T", ticker:"T", return:"-22%", note:"Utility/phone monopoly, less volatile" },
    ],
    worstPerformers: [
      { name:"Citibank (predecessor)", ticker:"C", return:"-92%", note:"Bank run, near complete failure" },
      { name:"General Motors", ticker:"GM", return:"-96%", note:"Auto demand collapsed entirely" },
      { name:"Ford Motor", ticker:"F", return:"-95%", note:"Car sales fell 75% by 1932" },
      { name:"US Steel", ticker:"X", return:"-92%", note:"Industrial production collapsed" },
      { name:"Anaconda Copper", ticker:"Copper", return:"-94%", note:"Commodity demand destroyed" },
      { name:"Montgomery Ward", ticker:"MW", return:"-91%", note:"Retail spending evaporated" },
      { name:"Radio Corp of America", ticker:"RCA", return:"-97%", note:"Speculative tech bubble burst" },
      { name:"Goldman Sachs (trust)", ticker:"GS", return:"-99%", note:"Trading company leveraged to failure" },
      { name:"Real Estate Trusts", ticker:"REITs", return:"-80%", note:"Property values collapsed 30-50%" },
      { name:"Farm commodities", ticker:"Wheat", return:"-60%", note:"Agricultural prices collapsed" },
    ],
    sectorPerformance: [
      { sector:"Financials", return:-85, color:DOWN },
      { sector:"Auto/Consumer Disc", return:-95, color:DOWN },
      { sector:"Industrials", return:-78, color:DOWN },
      { sector:"Real Estate", return:-80, color:DOWN },
      { sector:"Energy", return:-60, color:DOWN },
      { sector:"Technology (Radio)", return:-97, color:DOWN },
      { sector:"Materials", return:-70, color:DOWN },
      { sector:"Consumer Staples", return:-15, color:"#e07b39" },
      { sector:"Healthcare", return:-20, color:"#e07b39" },
      { sector:"Utilities", return:-45, color:DOWN },
      { sector:"Gold / Precious Metals", return:+69, color:UP },
    ],
    stockLookup: {
      "GLD": { return:"+69%", note:"Gold was the ultimate safe haven during deflationary collapse." },
      "TLT": { return:"+20%", note:"Long-term treasuries gained as deflation increased real value of fixed payments." },
      "KO": { return:"-18%", note:"Coca-Cola held up relatively well — affordable luxury, inelastic demand." },
      "PG": { return:"-10%", note:"Consumer staples outperformed massively vs -89% market." },
      "JPM": { return:"-87%", note:"Banking sector was devastated. JP Morgan predecessor nearly failed." },
      "C": { return:"-92%", note:"Citibank predecessor — near total wipeout in bank failures." },
      "F": { return:"-95%", note:"Auto sales fell 75%. Ford was nearly destroyed." },
      "GM": { return:"-96%", note:"General Motors lost nearly everything. Auto demand collapsed." },
      "XOM": { return:"-65%", note:"Oil demand fell with economic activity." },
      "MO": { return:"-15%", note:"Philip Morris held up — tobacco demand inelastic during depression." },
    },
  },

  {
    id: "black_monday",
    name: "Black Monday",
    period: "Oct 19, 1987",
    type: "crash",
    color: "#c9a96e",
    stats: { peak:"2,722 (Aug 1987)", trough:"1,739 (Oct 19, 1987)", drawdown:"-22.6% in one day / -36% peak-trough", duration:"2 months", recovery:"Jul 1989", recoveryTime:"15 months" },
    tagline: "The largest single-day percentage drop in stock market history",
    chartData: [
      {d:"1987-01",v:1895},{d:"1987-02",v:2000},{d:"1987-03",v:2160},{d:"1987-04",v:2286},
      {d:"1987-05",v:2320},{d:"1987-06",v:2430},{d:"1987-07",v:2500},{d:"1987-08",v:2722},
      {d:"1987-09",v:2596},{d:"1987-10",v:1739},{d:"1987-11",v:1833},{d:"1987-12",v:1939},
      {d:"1988-01",v:2015},{d:"1988-03",v:2057},{d:"1988-06",v:2100},{d:"1988-09",v:2112},
      {d:"1988-12",v:2169},{d:"1989-03",v:2293},{d:"1989-07",v:2660},{d:"1989-12",v:2753},
    ],
    timeline: [
      { date:"Aug 25, 1987", event:"Market Peak", desc:"DJIA hits all-time high of 2,722. Euphoria is at a peak after 5-year bull run.", type:"milestone" },
      { date:"Oct 14–16", event:"Pre-Crash Decline", desc:"Markets fall 10% over 3 days. Rising interest rates and trade deficit fears spook investors.", type:"crash" },
      { date:"Oct 19, 1987", event:"Black Monday", desc:"DJIA falls 508 points (-22.6%) — the largest single-day drop in history. Program trading cascades into freefall.", type:"crash" },
      { date:"Oct 20, 1987", event:"Fed Acts Immediately", desc:"Fed Chairman Alan Greenspan issues one sentence: 'The Federal Reserve reaffirms its readiness to serve as a source of liquidity.' Markets stabilize.", type:"policy" },
      { date:"Oct–Dec 1987", event:"Slow Recovery Begins", desc:"Markets bounce but remain volatile. The crash is contained — recession does NOT follow.", type:"recovery" },
      { date:"1988", event:"Circuit Breakers Created", desc:"NYSE creates market circuit breakers to halt trading during extreme moves.", type:"policy" },
      { date:"Jul 1989", event:"Full Recovery", desc:"DJIA reclaims all-time highs 15 months after the crash.", type:"recovery" },
    ],
    howItHappened: [
      "Portfolio insurance — a computer-driven hedging strategy — created a death spiral: as prices fell, programs automatically sold futures, pushing prices lower, triggering more selling",
      "Markets had risen 250% in 5 years with no meaningful correction — valuations were stretched",
      "Rising interest rates (10-year Treasury hit 10%) made stocks less attractive vs bonds",
      "US trade deficit fears and dollar weakness created macro uncertainty",
      "Program trading linked global markets — as Tokyo and London fell, US futures fell before opening",
    ],
    howItGotFixed: [
      "The Fed immediately injected liquidity and signaled support — stopping the bank funding crisis",
      "Major investment banks agreed to continue market-making and provide liquidity",
      "Unlike 1929, the Fed CUT rates rather than raised them — the correct policy response",
      "The economy was actually healthy — no recession followed, markets recovered in 15 months",
      "Circuit breakers were implemented to halt trading during future extreme moves",
    ],
    investmentExamples: [
      { asset:"US Treasuries", action:"Fled to government bonds", result:"+8%", detail:"Classic flight to safety. Bond prices surged as the Fed signaled easy money." },
      { asset:"Gold", action:"Bought gold", result:"+5%", detail:"Gold held value as investors sought safety outside the stock market." },
      { asset:"Cash", action:"Held cash through crash", result:"Capital preserved", detail:"Those in cash on Oct 19 avoided -22.6% in one day. Bought back in Oct/Nov at 20% discount." },
      { asset:"S&P 500 (held through)", action:"Stayed invested", result:"+15% by end 1989", detail:"Those who didn't panic and held were fully recovered in 15 months." },
      { asset:"Leveraged portfolios", action:"Held with margin", result:"-50% to -80%", detail:"Margin calls forced selling at the worst time. Leverage turned bad day into financial ruin." },
    ],
    keyLessons: [
      { title:"Never panic sell", lesson:"Those who sold on Oct 19 locked in -22% losses. Those who held recovered in 15 months. Panic is the enemy of returns." },
      { title:"Leverage amplifies both ways", lesson:"Portfolio insurance and margin turned a bad day into a catastrophic one. Avoid leverage in volatile markets." },
      { title:"Fed response is everything", lesson:"One sentence from Greenspan stabilized the crash. Central bank policy response determines whether a crash becomes a depression." },
      { title:"Crashes without recessions recover fast", lesson:"When the underlying economy is healthy, market crashes recover quickly. Black Monday had no recession — 15-month recovery." },
      { title:"Program trading risk", lesson:"Automated, correlated trading strategies can amplify market moves beyond rational levels. The market structure itself can cause crashes." },
    ],
    topPerformers: [
      { name:"US Treasuries", ticker:"TLT", return:"+8%", note:"Flight to safety buying" },
      { name:"Gold", ticker:"GLD", return:"+5%", note:"Safe haven demand" },
      { name:"Cash/Money Market", ticker:"Cash", return:"0%", note:"Capital preservation" },
      { name:"Coca-Cola", ticker:"KO", return:"-12%", note:"Defensive, outperformed market" },
      { name:"Johnson & Johnson", ticker:"JNJ", return:"-14%", note:"Healthcare held up" },
      { name:"Procter & Gamble", ticker:"PG", return:"-15%", note:"Defensive staple" },
      { name:"Walmart", ticker:"WMT", return:"-16%", note:"Value retail held up" },
      { name:"Utilities (index)", ticker:"XLU", return:"-18%", note:"Rate-sensitive but defensive" },
      { name:"Exxon", ticker:"XOM", return:"-20%", note:"Energy was relatively defensive" },
      { name:"American Home Products", ticker:"AHP", return:"-13%", note:"Pharma defensive" },
    ],
    worstPerformers: [
      { name:"Portfolio Insurance Funds", ticker:"Various", return:"-40% to -60%", note:"The very strategy that caused the crash" },
      { name:"Merrill Lynch", ticker:"MER", return:"-40%", note:"Investment banks hardest hit" },
      { name:"Morgan Stanley", ticker:"MS", return:"-40%", note:"Trading revenues evaporated" },
      { name:"Technology stocks", ticker:"Tech", return:"-35%", note:"High-beta names sold first" },
      { name:"Kidder Peabody", ticker:"Various", return:"-45%", note:"Broker-dealer nearly failed" },
      { name:"Leveraged buyout funds", ticker:"LBO", return:"-50%+", note:"Leveraged deals froze entirely" },
      { name:"Small caps", ticker:"IWM", return:"-30%", note:"Less liquid, harder to exit" },
      { name:"Retail stocks", ticker:"XRT", return:"-32%", note:"Consumer spending fears" },
      { name:"Real estate stocks", ticker:"VNQ", return:"-28%", note:"Rate rise concerns hit property" },
      { name:"Airlines", ticker:"Airlines", return:"-35%", note:"Recession fears hit cyclicals" },
    ],
    sectorPerformance: [
      { sector:"Financials", return:-40, color:DOWN },
      { sector:"Technology", return:-35, color:DOWN },
      { sector:"Industrials", return:-33, color:DOWN },
      { sector:"Consumer Disc", return:-30, color:DOWN },
      { sector:"Real Estate", return:-28, color:DOWN },
      { sector:"Materials", return:-28, color:DOWN },
      { sector:"Energy", return:-22, color:DOWN },
      { sector:"Communication", return:-25, color:DOWN },
      { sector:"Consumer Staples", return:-14, color:"#e07b39" },
      { sector:"Healthcare", return:-15, color:"#e07b39" },
      { sector:"Utilities", return:-18, color:"#e07b39" },
    ],
    stockLookup: {
      "SPY": { return:"-22.6% (Oct 19)", note:"Single worst day in market history." },
      "GLD": { return:"+5%", note:"Gold safe haven demand during the crash." },
      "TLT": { return:"+8%", note:"Long bonds rallied as Fed signaled liquidity support." },
      "KO": { return:"-12%", note:"Consumer staples held up vs -22% market." },
      "JNJ": { return:"-14%", note:"Healthcare defensive relative performance." },
      "XOM": { return:"-20%", note:"Energy was relatively resilient." },
      "JPM": { return:"-35%", note:"Banks took large hits on trading losses." },
      "MS": { return:"-40%", note:"Morgan Stanley devastated by market-making losses." },
      "GS": { return:"-38%", note:"Goldman Sachs hit hard on trading desk losses." },
    },
  },

  {
    id: "dotcom",
    name: "Dot-Com Bubble",
    period: "2000 – 2002",
    type: "crash",
    color: "#8b5cf6",
    stats: { peak:"5,048 Nasdaq (Mar 2000)", trough:"1,114 Nasdaq (Oct 2002)", drawdown:"Nasdaq -78%, S&P -49%", duration:"30 months", recovery:"Apr 2015 (Nasdaq)", recoveryTime:"15 years for Nasdaq" },
    tagline: "Trillions lost as internet mania gave way to the worst tech crash in history",
    chartData: [
      {d:"1998-01",v:1570},{d:"1998-06",v:1850},{d:"1998-12",v:2193},{d:"1999-03",v:2461},
      {d:"1999-06",v:2686},{d:"1999-09",v:2746},{d:"1999-12",v:3707},{d:"2000-01",v:3966},
      {d:"2000-03",v:5048},{d:"2000-06",v:3966},{d:"2000-09",v:3672},{d:"2000-12",v:2471},
      {d:"2001-03",v:1840},{d:"2001-06",v:2160},{d:"2001-09",v:1498},{d:"2001-12",v:1950},
      {d:"2002-03",v:1845},{d:"2002-06",v:1463},{d:"2002-09",v:1172},{d:"2002-10",v:1114},
      {d:"2002-12",v:1336},{d:"2003-06",v:1622},{d:"2003-12",v:2003},
    ],
    timeline: [
      { date:"1995–1999", event:"The Bubble Builds", desc:"Internet IPOs soar. Companies with no revenue trade at 100x sales. 'Eyeballs' replace earnings.", type:"milestone" },
      { date:"Mar 10, 2000", event:"Nasdaq Peaks at 5,048", desc:"Nasdaq hits all-time high. PE ratios average 200x. Amazon, Cisco, Intel each worth hundreds of billions.", type:"crash" },
      { date:"Apr 2000", event:"First Crash Wave", desc:"Nasdaq falls 34% in 4 weeks. Microsoft antitrust ruling adds pressure.", type:"crash" },
      { date:"2000–2001", event:"IPO Market Freezes", desc:"Dot-com IPOs dry up. Pets.com, Webvan, Kozmo.com go bankrupt. $1T in market cap evaporates.", type:"crash" },
      { date:"Sep 11, 2001", event:"9/11 Attacks", desc:"Markets close for 4 days. Reopen to further selling. Tech doubly hammered.", type:"crash" },
      { date:"2002", event:"Corporate Fraud Exposed", desc:"Enron, WorldCom, Tyco accounting scandals destroy remaining confidence.", type:"crash" },
      { date:"Oct 9, 2002", event:"Nasdaq Bottom at 1,114", desc:"Nasdaq down 78% from peak. S&P down 49%. $5 trillion in US wealth destroyed.", type:"crash" },
      { date:"2003", event:"Recovery Begins", desc:"Fed cuts rates to 1%. Housing boom begins. Tech gradually rebuilds.", type:"recovery" },
    ],
    howItHappened: [
      "Internet euphoria created 'new economy' narrative — profits didn't matter, only growth and eyeballs",
      "IPO mania: companies with no revenue went public at billion-dollar valuations; shares doubled on day one",
      "Venture capital flooded into any company with a '.com' — $100B+ raised in 1999-2000 alone",
      "Day trading boomed — millions of retail investors traded momentum stocks using margin accounts",
      "When the Fed raised rates in 2000, the cost of capital rose and the speculative math fell apart instantly",
    ],
    howItGotFixed: [
      "The market simply let valuations collapse back to earth — no government bailout of tech companies",
      "The Fed cut rates from 6.5% to 1% between 2001-2003, eventually reflating the economy",
      "Sarbanes-Oxley Act (2002) imposed strict accounting rules after Enron/WorldCom scandals",
      "Surviving companies (Amazon, Google, Apple) rebuilt on real revenue and profits",
      "The housing market absorbed capital and consumer spending, enabling economic recovery",
    ],
    investmentExamples: [
      { asset:"Gold", action:"Bought gold as tech crashed", result:"+15%", detail:"Gold began a decade-long bull run as investors fled tech. $300 in 2000 → $1,900 by 2011." },
      { asset:"Energy sector", action:"Held energy stocks", result:"+20%", detail:"XOM, CVX, COP all rose as tech fell. Oil demand continued growing despite recession." },
      { asset:"Amazon (held through)", action:"Held AMZN through -93% crash", result:"Eventually +100,000%", detail:"Amazon fell from $107 to $5.51 (2001). Those who held to today turned $1K into $1M+." },
      { asset:"Healthcare", action:"Shifted to pharma/biotech", result:"+15%", detail:"Healthcare was defensive and saw genuine innovation during the tech collapse." },
      { asset:"CSCO at peak", action:"Bought Cisco at $80 (2000)", result:"-90% and never recovered", detail:"Cisco was the most valuable company in the world in 2000. It still hasn't returned to that price." },
    ],
    keyLessons: [
      { title:"Price matters even for great companies", lesson:"Amazon was a great company but fell -93%. Buying at any price ignoring valuation costs you dearly, even if you're right about the company." },
      { title:"Revenue and profits are not optional", lesson:"'Eyeball' and 'mindshare' metrics don't pay bills. Real businesses need real economics. If fundamentals don't exist, the price is fiction." },
      { title:"Sector rotation preserves wealth", lesson:"Energy, healthcare, and consumer staples all held up. Diversification across sectors isn't just theory — it saves portfolios." },
      { title:"The best companies survive crashes and dominate", lesson:"Amazon, Google, Apple survived and became the most valuable companies in history. Quality companies eventually win." },
      { title:"Some bubbles never fully recover", lesson:"The Nasdaq didn't recover its 2000 high for 15 years. If you bought at the peak, you waited 15 years to break even." },
    ],
    topPerformers: [
      { name:"Gold", ticker:"GLD", return:"+15%", note:"Began decade-long bull run as tech collapsed" },
      { name:"Exxon Mobil", ticker:"XOM", return:"+20%", note:"Energy demand continued growing" },
      { name:"Chevron", ticker:"CVX", return:"+18%", note:"Oil prices rose despite recession" },
      { name:"Johnson & Johnson", ticker:"JNJ", return:"+12%", note:"Healthcare defensive play" },
      { name:"Procter & Gamble", ticker:"PG", return:"+8%", note:"Consumer staples held firm" },
      { name:"Coca-Cola", ticker:"KO", return:"+10%", note:"Beverage demand inelastic" },
      { name:"Philip Morris", ticker:"MO", return:"+25%", note:"Tobacco was defensive and paid dividends" },
      { name:"Pfizer", ticker:"PFE", return:"+15%", note:"Pharma innovation pipeline" },
      { name:"Walmart", ticker:"WMT", return:"+12%", note:"Value retail gained share" },
      { name:"US Treasuries", ticker:"TLT", return:"+30%", note:"Fed cut rates — bonds surged" },
    ],
    worstPerformers: [
      { name:"Cisco Systems", ticker:"CSCO", return:"-86%", note:"Lost $450B in market cap" },
      { name:"Intel", ticker:"INTC", return:"-80%", note:"PC demand collapsed" },
      { name:"JDS Uniphase", ticker:"JDSU", return:"-99%", note:"Fiber optic darling, total loss" },
      { name:"WorldCom", ticker:"WCOM", return:"-100%", note:"Accounting fraud, bankruptcy" },
      { name:"Pets.com", ticker:"Pets.com", return:"-100%", note:"IPO to bankruptcy in 9 months" },
      { name:"Amazon", ticker:"AMZN", return:"-93%", note:"Real company, insane valuation — fell $107→$5.51" },
      { name:"Qualcomm", ticker:"QCOM", return:"-88%", note:"$200 to $13" },
      { name:"eToys", ticker:"ETYS", return:"-100%", note:"Bankrupt 2001" },
      { name:"Lucent Technologies", ticker:"LU", return:"-99%", note:"Telecom equipment collapsed" },
      { name:"Yahoo", ticker:"YHOO", return:"-97%", note:"$237 to $8.02" },
    ],
    sectorPerformance: [
      { sector:"Technology", return:-78, color:DOWN },
      { sector:"Telecom", return:-80, color:DOWN },
      { sector:"Consumer Disc", return:-40, color:DOWN },
      { sector:"Financials", return:-25, color:DOWN },
      { sector:"Industrials", return:-30, color:DOWN },
      { sector:"Real Estate", return:-10, color:"#e07b39" },
      { sector:"Materials", return:-20, color:DOWN },
      { sector:"Consumer Staples", return:+10, color:UP },
      { sector:"Healthcare", return:+15, color:UP },
      { sector:"Energy", return:+20, color:UP },
      { sector:"Utilities", return:-5, color:"#e07b39" },
    ],
    stockLookup: {
      "AMZN": { return:"-93%", note:"Amazon fell from $107 to $5.51. But those who held through are up 100,000%+." },
      "CSCO": { return:"-86%", note:"Cisco lost $450B in market cap. Has never returned to 2000 highs." },
      "INTC": { return:"-80%", note:"Intel was devastated as PC demand collapsed." },
      "MSFT": { return:"-65%", note:"Microsoft was the world's largest company. Fell -65% but recovered." },
      "GLD": { return:"+15%", note:"Gold began a decade-long bull run during the tech collapse." },
      "XOM": { return:"+20%", note:"Energy kept growing as tech fell — perfect sector rotation." },
      "KO": { return:"+10%", note:"Consumer staples were the place to be during dot-com crash." },
      "JNJ": { return:"+12%", note:"Healthcare outperformed dramatically during the tech bust." },
      "PG": { return:"+8%", note:"Procter & Gamble was a safe harbor during the storm." },
      "TLT": { return:"+30%", note:"Long bonds surged as Fed cut rates from 6.5% to 1%." },
    },
  },

  {
    id: "crisis_2008",
    name: "2008 Financial Crisis",
    period: "2007 – 2009",
    type: "crash",
    color: "#1a9fd8",
    stats: { peak:"1,565 S&P (Oct 2007)", trough:"683 S&P (Mar 2009)", drawdown:"-56.8%", duration:"17 months", recovery:"Mar 2013", recoveryTime:"5.5 years" },
    tagline: "The collapse of the global financial system — the worst crisis since 1929",
    chartData: [
      {d:"2007-01",v:1418},{d:"2007-06",v:1503},{d:"2007-10",v:1565},{d:"2007-12",v:1468},
      {d:"2008-01",v:1378},{d:"2008-03",v:1323},{d:"2008-06",v:1280},{d:"2008-09",v:1166},
      {d:"2008-10",v:968},{d:"2008-11",v:896},{d:"2008-12",v:903},{d:"2009-01",v:825},
      {d:"2009-02",v:735},{d:"2009-03",v:683},{d:"2009-06",v:919},{d:"2009-09",v:1057},
      {d:"2009-12",v:1115},{d:"2010-06",v:1030},{d:"2010-12",v:1258},{d:"2011-12",v:1258},
      {d:"2012-12",v:1426},{d:"2013-03",v:1569},
    ],
    timeline: [
      { date:"2006–2007", event:"Housing Bubble Peaks", desc:"Home prices plateau. Subprime mortgage defaults begin rising. CDO market shows stress.", type:"crash" },
      { date:"Mar 2008", event:"Bear Stearns Collapses", desc:"Fed brokers emergency sale of Bear Stearns to JPMorgan for $2/share (later $10). First major bank rescue.", type:"crash" },
      { date:"Sep 7, 2008", event:"Fannie & Freddie Seized", desc:"US government takes over Fannie Mae and Freddie Mac — $5 trillion in mortgage debt.", type:"policy" },
      { date:"Sep 15, 2008", event:"Lehman Brothers Fails", desc:"Lehman Brothers files largest bankruptcy in US history. Global credit markets freeze overnight.", type:"crash" },
      { date:"Sep 16, 2008", event:"AIG Bailout — $85B", desc:"Fed bails out AIG to prevent complete financial system collapse. 'Too big to fail' becomes doctrine.", type:"policy" },
      { date:"Oct 2008", event:"TARP Passes — $700B", desc:"Congress passes Troubled Asset Relief Program. Banks receive capital injections.", type:"policy" },
      { date:"Mar 9, 2009", event:"Market Bottom", desc:"S&P hits 683. Unemployment at 10%. Warren Buffett calls it once-in-a-lifetime buying opportunity.", type:"crash" },
      { date:"Mar 2009 – Mar 2013", event:"Long Recovery", desc:"Quantitative Easing (QE1, QE2, QE3) gradually reflates markets. S&P returns to peak by Mar 2013.", type:"recovery" },
    ],
    howItHappened: [
      "Banks issued trillions in subprime mortgages to unqualified borrowers, then packaged them into CDOs and sold them as 'AAA' rated securities",
      "Excessive leverage — banks operated at 30:1 leverage ratios, meaning a 3.3% drop in assets wiped out all equity",
      "Credit default swaps created hidden interconnections between institutions — AIG alone had $440B in CDS exposure",
      "Housing prices fell nationally for the first time since the 1930s — the model that 'housing always goes up' was wrong",
      "Lehman Brothers' failure froze the entire global credit market — no one would lend to anyone overnight",
    ],
    howItGotFixed: [
      "TARP injected $700B into banks to recapitalize them and restart lending",
      "The Fed cut rates to 0% and launched three rounds of Quantitative Easing (QE), buying $3.7T in assets",
      "Bank stress tests in 2009 (SCAP) restored confidence by proving which banks were solvent",
      "Dodd-Frank Act (2010) reformed bank regulation — higher capital requirements, Volcker Rule",
      "The slow housing recovery (2012+) and corporate earnings recovery gradually rebuilt the economy",
    ],
    investmentExamples: [
      { asset:"Gold", action:"Bought gold during 2008", result:"+25%", detail:"Gold rose from $800 to $1,000 during the crisis and continued to $1,900 by 2011." },
      { asset:"US Treasuries", action:"Bought long-term bonds", result:"+26%", detail:"Flight to safety drove 10-year yields from 4% to 2%. TLT gained 26% in 2008." },
      { asset:"Warren Buffett — Goldman Sachs", action:"$5B preferred stock + warrants", result:"+$3B profit", detail:"Buffett invested $5B in Goldman Sachs preferred at 10% yield plus warrants. Collected billions." },
      { asset:"S&P 500 (Mar 2009 buy)", action:"Bought S&P 500 at the bottom", result:"+400% by 2020", detail:"$10,000 at S&P 683 (Mar 2009) grew to $55,000+ by 2020. Best buying opportunity in a generation." },
      { asset:"Bank stocks held", action:"Held Citigroup, Bank of America", result:"-95%", detail:"Citi went from $55 to $1. Many financial institutions required bailouts or went bankrupt." },
    ],
    keyLessons: [
      { title:"Systemic risk is invisible until it isn't", lesson:"CDOs, CDS, and leverage created hidden connections no one fully understood. When one domino fell, the whole system shook." },
      { title:"Crises create generational buying opportunities", lesson:"The S&P at 683 in March 2009 was the buy of a generation. Maximum pessimism is maximum opportunity for patient investors." },
      { title:"Diversification into non-correlated assets works", lesson:"Gold and Treasuries both rose during 2008 while stocks fell -57%. A diversified portfolio survived." },
      { title:"Too much leverage is fatal", lesson:"Banks at 30:1 leverage needed only a 3% error to wipe out. Leverage works until it doesn't — and when it doesn't, it's catastrophic." },
      { title:"Government will backstop systemic crises", lesson:"The Fed and Treasury will not let the financial system collapse. 'Buy when there's blood in the streets' — the backstop eventually arrives." },
    ],
    topPerformers: [
      { name:"US Treasuries (TLT)", ticker:"TLT", return:"+26%", note:"Ultimate flight to safety" },
      { name:"Gold", ticker:"GLD", return:"+5% (2008), +25% (2007-09)", note:"Store of value demand" },
      { name:"Walmart", ticker:"WMT", return:"-15%", note:"Value retail gained customers" },
      { name:"McDonald's", ticker:"MCD", return:"-5%", note:"Affordable food trade-down beneficiary" },
      { name:"Dollar Tree", ticker:"DLTR", return:"+60%", note:"Dollar stores surged as consumers traded down" },
      { name:"Procter & Gamble", ticker:"PG", return:"-18%", note:"Staples outperformed vs -57% market" },
      { name:"Pfizer", ticker:"PFE", return:"-20%", note:"Healthcare held up relatively well" },
      { name:"Johnson & Johnson", ticker:"JNJ", return:"-22%", note:"Defensive healthcare leader" },
      { name:"Short S&P (SDS)", ticker:"SDS", return:"+135%", note:"2x inverse ETF in the right direction" },
      { name:"Coca-Cola", ticker:"KO", return:"-25%", note:"Staples defensive relative to market" },
    ],
    worstPerformers: [
      { name:"Lehman Brothers", ticker:"LEH", return:"-100%", note:"Filed largest bankruptcy in history" },
      { name:"Bear Stearns", ticker:"BSC", return:"-99%", note:"Sold to JPMorgan for $10/share from $172" },
      { name:"Citigroup", ticker:"C", return:"-95%", note:"$55 → $1. Required massive government bailout" },
      { name:"AIG", ticker:"AIG", return:"-97%", note:"$70 → $1.25. $182B government rescue" },
      { name:"Washington Mutual", ticker:"WM", return:"-100%", note:"Largest bank failure in US history" },
      { name:"Wachovia", ticker:"WB", return:"-97%", note:"Sold to Wells Fargo to avoid collapse" },
      { name:"IndyMac", ticker:"IMB", return:"-100%", note:"FDIC takeover, depositors wiped above $250K" },
      { name:"General Motors", ticker:"GM", return:"-94%", note:"Filed for bankruptcy June 2009" },
      { name:"Bank of America", ticker:"BAC", return:"-80%", note:"Merrill Lynch acquisition nearly sank it" },
      { name:"Fannie Mae / Freddie Mac", ticker:"FNM", return:"-99%", note:"Government conservatorship wiped shareholders" },
    ],
    sectorPerformance: [
      { sector:"Financials", return:-80, color:DOWN },
      { sector:"Real Estate", return:-72, color:DOWN },
      { sector:"Industrials", return:-60, color:DOWN },
      { sector:"Energy", return:-45, color:DOWN },
      { sector:"Technology", return:-50, color:DOWN },
      { sector:"Consumer Disc", return:-55, color:DOWN },
      { sector:"Materials", return:-58, color:DOWN },
      { sector:"Communication", return:-45, color:DOWN },
      { sector:"Consumer Staples", return:-15, color:"#e07b39" },
      { sector:"Healthcare", return:-22, color:DOWN },
      { sector:"Utilities", return:-30, color:DOWN },
    ],
    stockLookup: {
      "GLD": { return:"+25% (2007-09)", note:"Gold was the safest haven during the financial system collapse." },
      "TLT": { return:"+26%", note:"Long bonds surged as the Fed cut rates to zero." },
      "JPM": { return:"-68%", note:"Relatively better than peers — acquired Bear Stearns at a bargain." },
      "C": { return:"-95%", note:"Citigroup was one step from bankruptcy. $55 → $1." },
      "BAC": { return:"-80%", note:"Merrill Lynch acquisition almost sank Bank of America." },
      "GS": { return:"-60%", note:"Goldman Sachs survived but shares were hammered." },
      "AAPL": { return:"-57%", note:"Even Apple fell -57% — no stock escaped the crisis." },
      "XOM": { return:"-40%", note:"Energy fell with the economic collapse but less than financials." },
      "WMT": { return:"-15%", note:"Walmart was the defensive pick — people traded down to value." },
      "KO": { return:"-25%", note:"Coca-Cola held up relatively well on defensive demand." },
      "AMZN": { return:"-45%", note:"Amazon fell but recovered fastest as e-commerce accelerated." },
    },
  },

  {
    id: "covid",
    name: "COVID-19 Crash",
    period: "Feb – Aug 2020",
    type: "crash",
    color: "#00b899",
    stats: { peak:"3,386 S&P (Feb 19, 2020)", trough:"2,237 S&P (Mar 23, 2020)", drawdown:"-33.9%", duration:"33 days (fastest crash ever)", recovery:"Aug 18, 2020", recoveryTime:"5 months (fastest recovery ever)" },
    tagline: "The fastest crash and fastest recovery in stock market history",
    chartData: [
      {d:"2019-12",v:3231},{d:"2020-01",v:3226},{d:"2020-02",v:2954},{d:"2020-03-09",v:2746},
      {d:"2020-03-16",v:2386},{d:"2020-03-23",v:2237},{d:"2020-04",v:2584},{d:"2020-05",v:2945},
      {d:"2020-06",v:3100},{d:"2020-07",v:3271},{d:"2020-08-18",v:3389},{d:"2020-09",v:3363},
      {d:"2020-10",v:3270},{d:"2020-11",v:3622},{d:"2020-12",v:3756},
    ],
    timeline: [
      { date:"Jan 2020", event:"COVID Spreads in China", desc:"WHO reports pneumonia cluster in Wuhan. Markets largely ignore it. S&P near all-time highs.", type:"milestone" },
      { date:"Feb 19, 2020", event:"S&P All-Time High", desc:"S&P 500 hits 3,386. Complacency is at a peak. COVID is 'contained'.", type:"milestone" },
      { date:"Feb 20 – Mar 23", event:"33-Day Freefall", desc:"Fastest -30% decline in history. Circuit breakers triggered 4 times in 2 weeks.", type:"crash" },
      { date:"Mar 16, 2020", event:"Black Monday 2020", desc:"S&P falls 12% in a single day — third largest drop ever. 'Circuit breaker' halts trading.", type:"crash" },
      { date:"Mar 23, 2020", event:"Market Bottom", desc:"S&P hits 2,237. Unemployment would hit 15% within weeks.", type:"crash" },
      { date:"Mar 23, 2020", event:"Fed Announces Unlimited QE", desc:"'We will do whatever it takes.' Fed announces unlimited bond buying. Markets begin recovering the same day.", type:"policy" },
      { date:"Apr–May 2020", event:"CARES Act — $2.2 Trillion", desc:"Largest stimulus in US history. $1,200 checks, $600/week unemployment, PPP loans.", type:"policy" },
      { date:"Aug 18, 2020", event:"Full Recovery — 5 Months", desc:"S&P reclaims all-time high. The fastest bear-market recovery in history.", type:"recovery" },
    ],
    howItHappened: [
      "A novel coronavirus spread globally, triggering lockdowns across the world's largest economies",
      "Economic activity stopped almost overnight — airlines, hotels, restaurants, retail all went to zero",
      "The speed and uncertainty of the shutdown created maximum fear — no historical playbook existed",
      "Supply chains broke globally: factory closures in China rippled through every industry",
      "Oil prices went negative on April 20 as demand collapsed and storage ran out",
    ],
    howItGotFixed: [
      "The Fed responded within days with unlimited QE, zero rates, and emergency credit facilities",
      "Congress passed $2.2T in stimulus (CARES Act) in under 2 weeks — unprecedented speed",
      "Vaccine development at 'warp speed' — Pfizer/Moderna approved in 11 months vs typical 10+ years",
      "The digital economy (Amazon, Zoom, Netflix, Shopify) accelerated massively, offsetting physical losses",
      "Consumer savings and stimulus checks created pent-up demand that fueled the recovery",
    ],
    investmentExamples: [
      { asset:"Zoom Video", action:"Bought ZM in March 2020", result:"+400% by Oct 2020", detail:"Video conferencing became essential overnight. Zoom went from $70 to $560 in 7 months." },
      { asset:"Amazon", action:"Held or bought AMZN", result:"+76% in 2020", detail:"E-commerce and AWS accelerated as physical retail shut down." },
      { asset:"Moderna", action:"Bought MRNA in early 2020", result:"+434%", detail:"Biotech that created the mRNA COVID vaccine. From $19 to $100+ in one year." },
      { asset:"Airlines bought at bottom", action:"Bought UAL/DAL in March 2020", result:"+100%+ by 2022", detail:"Airlines fell 60-70% then recovered as travel reopened. Contrarian bet paid off." },
      { asset:"Cruise lines at peak", action:"Held CCL into the crash", result:"-75%", detail:"Cruise lines were literally unable to operate for over a year. Never a buy-and-hold during shutdown." },
    ],
    keyLessons: [
      { title:"Fed put is real — don't fight the Fed", lesson:"The Fed's unlimited QE announcement on March 23 literally ended the crash that same day. When the Fed acts at this scale, the market turns." },
      { title:"Crashes create the fastest opportunity in history", lesson:"COVID proved the fastest crash = fastest recovery. Those who bought in March 2020 had 100%+ gains within 18 months." },
      { title:"Digital transformation accelerated everything", lesson:"5 years of digital adoption happened in 5 months. Tech, e-commerce, biotech exploded. Old economy fell further behind." },
      { title:"Stimulus scale matters", lesson:"$2.2T in 2 weeks was unprecedented. The economic response was calibrated to prevent Great Depression-style demand collapse." },
      { title:"Crisis identifies the next winners", lesson:"COVID made clear who the structural winners were: cloud, e-commerce, biotech, remote work. These themes dominated the next 3 years." },
    ],
    topPerformers: [
      { name:"Zoom Video", ticker:"ZM", return:"+400%", note:"Video conferencing became essential" },
      { name:"Moderna", ticker:"MRNA", return:"+434%", note:"mRNA vaccine developer" },
      { name:"Peloton", ticker:"PTON", return:"+440%", note:"Home fitness surge" },
      { name:"Amazon", ticker:"AMZN", return:"+76%", note:"E-commerce and cloud accelerated" },
      { name:"Nvidia", ticker:"NVDA", return:"+122%", note:"Gaming and data center demand surged" },
      { name:"Apple", ticker:"AAPL", return:"+80%", note:"iPhone demand remained strong, services grew" },
      { name:"Shopify", ticker:"SHOP", return:"+186%", note:"Small business e-commerce exploded" },
      { name:"DocuSign", ticker:"DOCU", return:"+200%", note:"Digital signatures replaced in-person" },
      { name:"Gold", ticker:"GLD", return:"+25%", note:"Safe haven + inflation hedge" },
      { name:"Pfizer", ticker:"PFE", return:"+19%", note:"Vaccine developer windfall" },
    ],
    worstPerformers: [
      { name:"United Airlines", ticker:"UAL", return:"-68%", note:"Air travel fell 96% at peak" },
      { name:"Carnival Cruise", ticker:"CCL", return:"-75%", note:"Ships literally could not operate" },
      { name:"Simon Property Group", ticker:"SPG", return:"-55%", note:"Mall REIT — retail shut down" },
      { name:"Macy's", ticker:"M", return:"-65%", note:"Department store nearly bankrupt" },
      { name:"Exxon Mobil", ticker:"XOM", return:"-41%", note:"Oil demand crashed, oil went negative" },
      { name:"Delta Air Lines", ticker:"DAL", return:"-55%", note:"Air travel decimated" },
      { name:"Gap", ticker:"GPS", return:"-55%", note:"Retail stores closed for months" },
      { name:"Marriott", ticker:"MAR", return:"-45%", note:"Hotels at near-zero occupancy" },
      { name:"MGM Resorts", ticker:"MGM", return:"-52%", note:"Casinos shut completely" },
      { name:"Norwegian Cruise", ticker:"NCLH", return:"-82%", note:"Worst performing major cruise line" },
    ],
    sectorPerformance: [
      { sector:"Technology", return:+43, color:UP },
      { sector:"Consumer Disc (e-comm)", return:+33, color:UP },
      { sector:"Healthcare / Biotech", return:+13, color:UP },
      { sector:"Communication", return:+23, color:UP },
      { sector:"Gold/Materials", return:+25, color:UP },
      { sector:"Consumer Staples", return:+1, color:UP },
      { sector:"Real Estate", return:-10, color:"#e07b39" },
      { sector:"Utilities", return:-5, color:"#e07b39" },
      { sector:"Financials", return:-23, color:DOWN },
      { sector:"Industrials", return:-15, color:DOWN },
      { sector:"Energy", return:-33, color:DOWN },
    ],
    stockLookup: {
      "AAPL": { return:"+80% (full year 2020)", note:"Apple products surged as people upgraded for remote work/school." },
      "AMZN": { return:"+76%", note:"E-commerce and AWS both accelerated massively during lockdowns." },
      "MSFT": { return:"+41%", note:"Azure cloud and Teams video conferencing surged." },
      "ZM": { return:"+400%", note:"Zoom became the verb for video calls. Exploded from obscurity." },
      "MRNA": { return:"+434%", note:"Moderna created the mRNA COVID vaccine. Stock exploded." },
      "NVDA": { return:"+122%", note:"Gaming and data centers surged during lockdowns." },
      "XOM": { return:"-41%", note:"Oil demand destroyed. Oil futures briefly went NEGATIVE." },
      "UAL": { return:"-68%", note:"Air travel fell 96% at its worst point." },
      "CCL": { return:"-75%", note:"Carnival Cruise ships couldn't operate for over a year." },
      "GLD": { return:"+25%", note:"Gold safe haven + inflation hedge from massive stimulus." },
      "JPM": { return:"-30%", note:"Banks fell on recession fears and loan loss provisions." },
    },
  },

  {
    id: "bear_2022",
    name: "2022 Bear Market",
    period: "Jan – Oct 2022",
    type: "bear",
    color: "#ec4899",
    stats: { peak:"4,797 S&P (Jan 3, 2022)", trough:"3,577 S&P (Oct 12, 2022)", drawdown:"-25.4% S&P, -33% Nasdaq", duration:"9 months", recovery:"Jan 2024", recoveryTime:"~15 months" },
    tagline: "The Fed's fastest rate hike cycle in 40 years crushed growth stocks",
    chartData: [
      {d:"2022-01",v:4431},{d:"2022-02",v:4374},{d:"2022-03",v:4530},{d:"2022-04",v:4132},
      {d:"2022-05",v:4132},{d:"2022-06",v:3785},{d:"2022-07",v:4130},{d:"2022-08",v:4243},
      {d:"2022-09",v:3585},{d:"2022-10",v:3577},{d:"2022-11",v:4080},{d:"2022-12",v:3840},
      {d:"2023-01",v:4077},{d:"2023-03",v:4109},{d:"2023-06",v:4450},{d:"2023-12",v:4769},
      {d:"2024-01",v:4845},
    ],
    timeline: [
      { date:"Jan 2022", event:"S&P Peaks at 4,797", desc:"Markets at all-time highs. Inflation at 7% but Fed still calling it 'transitory'.", type:"milestone" },
      { date:"Mar 16, 2022", event:"First Rate Hike", desc:"Fed raises rates 0.25%. First hike since 2018. Markets sell off — hikes signal end of easy money era.", type:"policy" },
      { date:"May–Jun 2022", event:"Aggressive Hiking Begins", desc:"Fed raises 50bps in May, 75bps in June — largest since 1994. Tech stocks enter bear market.", type:"policy" },
      { date:"Jun 2022", event:"S&P Enters Bear Market", desc:"S&P closes down 20% — official bear market. Nasdaq already down 33%.", type:"crash" },
      { date:"Sep 2022", event:"Jackson Hole — 'Pain Ahead'", desc:"Powell's Jackson Hole speech: 'We must keep at it until the job is done.' Markets crater.", type:"policy" },
      { date:"Oct 12, 2022", event:"Market Bottom", desc:"S&P hits 3,577. CPI print lower than expected triggers massive rally.", type:"recovery" },
      { date:"Nov 2022", event:"ChatGPT Launches", desc:"OpenAI releases ChatGPT. The AI era begins. Tech stocks start to recover.", type:"milestone" },
      { date:"Jan 2024", event:"Full Recovery", desc:"S&P reclaims January 2022 highs. AI-driven bull market takes over.", type:"recovery" },
    ],
    howItHappened: [
      "Post-COVID inflation surged to 9.1% (June 2022) — the highest in 40 years — driven by supply chain disruptions, stimulus, and energy shocks",
      "The Fed raised rates from 0% to 4.5% in 12 months — the fastest tightening cycle since the 1980s",
      "Higher rates make future earnings worth less — growth stocks with distant profits were repriced most severely",
      "Russia's invasion of Ukraine (Feb 2022) sent energy and food prices surging globally",
      "The COVID bull market had created extreme valuations — many stocks traded at 50-100x revenues",
    ],
    howItGotFixed: [
      "Inflation peaked at 9.1% in June 2022 and began declining as supply chains healed",
      "The Fed's rate hikes worked — CPI fell from 9.1% to 3% over 18 months",
      "The AI revolution (ChatGPT, Nvidia) created a new growth narrative that reignited investor enthusiasm",
      "Earnings held up better than feared — most companies adjusted to the new rate environment",
      "A soft landing emerged: inflation fell without a recession, the 'Goldilocks' scenario",
    ],
    investmentExamples: [
      { asset:"Energy (XLE)", action:"Held or bought energy stocks", result:"+65%", detail:"Energy was the only S&P sector positive in 2022. XOM, CVX, COP soared as oil hit $130." },
      { asset:"I-Bonds (US Treasury)", action:"Bought I-Bonds in 2022", result:"+9.62% guaranteed", detail:"I-Bonds yielded 9.62% in 2022 — risk-free inflation protection unavailable for decades." },
      { asset:"Short duration bonds", action:"Moved to short-term treasuries", result:"+4-5%", detail:"Short-term T-bills yielded 4%+ with no rate risk. Better than holding stocks or long bonds." },
      { asset:"Meta at $90 (late 2022)", action:"Bought META during the crash", result:"+400% by 2024", detail:"Meta fell from $380 to $90 on metaverse fears. Bought at bottom = generational return." },
      { asset:"ARK Innovation (ARKK)", action:"Held ARKK through bear market", result:"-75%", detail:"Cathie Wood's fund fell from $160 to $35. High-growth tech was crushed by rising rates." },
    ],
    keyLessons: [
      { title:"Interest rates are gravity for stocks", lesson:"Warren Buffett said interest rates are 'gravity for valuations.' When rates go from 0% to 5%, high-multiple stocks must reprice — dramatically." },
      { title:"Energy is the ultimate inflation hedge", lesson:"Energy stocks rose 65% while everything else fell. Physical commodities protect against inflation better than paper assets." },
      { title:"Duration risk is real", lesson:"Long-term bonds fell 30%+ — as much as stocks. 'Safe' bonds can lose as much as equities when rates rise fast." },
      { title:"Bear markets create multi-baggers", lesson:"Meta at $90, Google at $85, Amazon at $85 — these were 10-year buying opportunities. Bear markets create the next decade's returns." },
      { title:"Valuation matters again when rates normalize", lesson:"Zero rates made any valuation 'acceptable.' Normal rates brought normal math back — profitability and cash flow matter again." },
    ],
    topPerformers: [
      { name:"Exxon Mobil", ticker:"XOM", return:"+87%", note:"Record oil prices + record profits" },
      { name:"Chevron", ticker:"CVX", return:"+53%", note:"Oil & gas surge" },
      { name:"ConocoPhillips", ticker:"COP", return:"+72%", note:"Energy sector led the entire market" },
      { name:"Energy ETF", ticker:"XLE", return:"+65%", note:"Only positive S&P sector" },
      { name:"Occidental Petroleum", ticker:"OXY", return:"+119%", note:"Buffett's favorite — up 119%" },
      { name:"Halliburton", ticker:"HAL", return:"+80%", note:"Oilfield services surged" },
      { name:"Valero Energy", ticker:"VLO", return:"+84%", note:"Refining margins at record highs" },
      { name:"Coca-Cola", ticker:"KO", return:"+7%", note:"Defensive, positive in down market" },
      { name:"Unitedhealth", ticker:"UNH", return:"+5%", note:"Healthcare defensive" },
      { name:"Eli Lilly", ticker:"LLY", return:"+34%", note:"Ozempic/weight loss drugs emerging" },
    ],
    worstPerformers: [
      { name:"Meta Platforms", ticker:"META", return:"-65%", note:"Metaverse bet + ad slowdown + rising rates" },
      { name:"Netflix", ticker:"NFLX", return:"-52%", note:"Subscriber growth reversed post-COVID" },
      { name:"ARK Innovation", ticker:"ARKK", return:"-67%", note:"Speculative growth crushed by rate hikes" },
      { name:"Amazon", ticker:"AMZN", return:"-50%", note:"AWS growth slowed, retail losses widened" },
      { name:"Shopify", ticker:"SHOP", return:"-75%", note:"E-commerce normalization post-COVID" },
      { name:"Coinbase", ticker:"COIN", return:"-87%", note:"Crypto winter hit hardest" },
      { name:"Rivian", ticker:"RIVN", return:"-83%", note:"EV bubble deflated with rates" },
      { name:"PayPal", ticker:"PYPL", return:"-62%", note:"Fintech valuations compressed" },
      { name:"Peloton", ticker:"PTON", return:"-79%", note:"Post-COVID normalization brutal" },
      { name:"Zoom Video", ticker:"ZM", return:"-64%", note:"Back-to-office killed the COVID darling" },
    ],
    sectorPerformance: [
      { sector:"Energy", return:+65, color:UP },
      { sector:"Utilities", return:+1, color:UP },
      { sector:"Consumer Staples", return:-3, color:"#e07b39" },
      { sector:"Healthcare", return:-2, color:"#e07b39" },
      { sector:"Industrials", return:-8, color:"#e07b39" },
      { sector:"Financials", return:-15, color:DOWN },
      { sector:"Real Estate", return:-27, color:DOWN },
      { sector:"Materials", return:-14, color:DOWN },
      { sector:"Technology", return:-33, color:DOWN },
      { sector:"Consumer Disc", return:-37, color:DOWN },
      { sector:"Communication", return:-40, color:DOWN },
    ],
    stockLookup: {
      "XOM": { return:"+87%", note:"Exxon Mobil — record oil prices drove record profits." },
      "OXY": { return:"+119%", note:"Occidental Petroleum — Warren Buffett's top pick." },
      "XLE": { return:"+65%", note:"Energy ETF — only positive S&P 500 sector in 2022." },
      "META": { return:"-65%", note:"Meta fell from $380 to $90. Metaverse bet + rate hike combo." },
      "AMZN": { return:"-50%", note:"Amazon halved. AWS growth slowed, retail losing money." },
      "AAPL": { return:"-27%", note:"Apple held up relatively well vs the tech sector." },
      "MSFT": { return:"-29%", note:"Microsoft fell but less than most mega-cap tech." },
      "NVDA": { return:"-52%", note:"Nvidia fell -52% in 2022 before the AI explosion." },
      "ARKK": { return:"-67%", note:"ARK Innovation devastated by rising rates on speculative stocks." },
      "KO": { return:"+7%", note:"Coca-Cola was a safe haven — positive returns in down market." },
    },
  },

  {
    id: "ai_bull",
    name: "AI Bull Market",
    period: "Oct 2022 – Present",
    type: "bull",
    color: GOLD,
    stats: { peak:"Ongoing", trough:"3,577 S&P (Oct 2022 start)", drawdown:"N/A — Bull Market", duration:"Ongoing (18+ months)", recovery:"N/A", recoveryTime:"N/A" },
    tagline: "The AI revolution sparked the most powerful tech rally since the dot-com era",
    chartData: [
      {d:"2022-10",v:3577},{d:"2022-11",v:3963},{d:"2022-12",v:3840},{d:"2023-01",v:4077},
      {d:"2023-02",v:4000},{d:"2023-03",v:4109},{d:"2023-04",v:4170},{d:"2023-05",v:4205},
      {d:"2023-06",v:4450},{d:"2023-07",v:4588},{d:"2023-08",v:4507},{d:"2023-09",v:4288},
      {d:"2023-10",v:4194},{d:"2023-11",v:4559},{d:"2023-12",v:4769},{d:"2024-01",v:4845},
      {d:"2024-03",v:5137},{d:"2024-06",v:5460},{d:"2024-09",v:5648},{d:"2024-12",v:5882},
      {d:"2025-03",v:5612},{d:"2025-06",v:5900},{d:"2025-12",v:6090},{d:"2026-01",v:6118},
    ],
    timeline: [
      { date:"Nov 30, 2022", event:"ChatGPT Launches", desc:"OpenAI releases ChatGPT. 1 million users in 5 days. The AI era officially begins.", type:"milestone" },
      { date:"Jan 2023", event:"AI Rally Begins", desc:"Tech stocks surge. Microsoft announces $10B OpenAI investment. Nasdaq up 40% in 2023.", type:"recovery" },
      { date:"May 2023", event:"Nvidia Earnings Shock", desc:"Nvidia reports 3x revenue growth from AI chips. Stock surges 25% in one day. Market cap hits $1T.", type:"milestone" },
      { date:"Jan 2024", event:"S&P Reclaims All-Time High", desc:"S&P 500 closes above Jan 2022 peak. Bear market officially over. AI bull market in full swing.", type:"recovery" },
      { date:"Jun 2024", event:"Nvidia Becomes #1 Most Valuable Company", desc:"Nvidia surpasses Microsoft and Apple — $3.3T market cap. Largest company in the world briefly.", type:"milestone" },
      { date:"Nov 2024", event:"S&P 6,000 Breached", desc:"S&P 500 crosses 6,000 for the first time. Markets up 60%+ from 2022 lows.", type:"milestone" },
      { date:"Early 2025", event:"Deepseek Shock", desc:"Chinese AI startup releases model rivaling GPT-4 at a fraction of the cost. Nvidia drops 17% in one day.", type:"crash" },
      { date:"Apr 2026", event:"Tariff Correction", desc:"Trump tariff announcements trigger 10-15% pullback from highs. AI bull market pauses but intact.", type:"crash" },
    ],
    howItHappened: [
      "ChatGPT proved AI was ready for mass consumer use — 100M users in 2 months (fastest app in history)",
      "Nvidia's H100 GPU became the essential infrastructure for AI — demand exceeded supply, prices skyrocketed",
      "Every major tech company (Microsoft, Google, Amazon, Meta) committed hundreds of billions to AI capex",
      "The Fed's rate hiking cycle ended — markets re-rated growth stocks higher as rate cuts became expected",
      "Corporate earnings proved resilient — no recession materialized, validating the 'soft landing' thesis",
    ],
    howItGotFixed: [
      "N/A — This is an ongoing bull market driven by genuine technological transformation",
      "AI productivity gains are real and measurable — not just speculation like dot-com",
      "The 'Magnificent 7' (Apple, Microsoft, Amazon, Alphabet, Meta, Tesla, Nvidia) drove outsized gains",
      "S&P 500 earnings growth accelerated — fundamentals justified much of the multiple expansion",
      "The Fed successfully engineered a soft landing — inflation fell without recession",
    ],
    investmentExamples: [
      { asset:"Nvidia", action:"Bought NVDA in early 2023", result:"+800% from 2022 bottom", detail:"Nvidia's H100 GPU was the oil of the AI era. From $108 (Oct 2022) to $950+ by mid-2024." },
      { asset:"Meta Platforms", action:"Bought META at $90 (late 2022)", result:"+400% by 2024", detail:"Meta was declared 'dead' at $90. Zuckerberg's efficiency era + AI tools = $500+ stock." },
      { asset:"S&P 500 index", action:"Bought SPY at 2022 lows", result:"+70% by 2025", detail:"Simple index investing from the Oct 2022 bottom returned 70%+ in under 3 years." },
      { asset:"Broadcom", action:"Held AVGO through AI transition", result:"+200%", detail:"AI chip demand extended beyond Nvidia to custom silicon. Broadcom's AI revenue surged 220%." },
      { asset:"Regional banks (SVB)", action:"Held SVB bank stock", result:"-100%", detail:"Silicon Valley Bank failed March 2023 on rate risk mismanagement. Not all boats rose." },
    ],
    keyLessons: [
      { title:"Transformative technology creates transformative returns", lesson:"The AI revolution created more wealth faster than almost any technology shift in history. Being present for paradigm shifts matters enormously." },
      { title:"Infrastructure before applications", lesson:"Nvidia (chips) and cloud providers (Microsoft Azure, AWS) captured value before AI apps. Infrastructure plays are often the first and best winners." },
      { title:"The best buying time is maximum fear", lesson:"October 2022 felt like everything was broken — inflation, rates, war, recession fears. It was the best buying opportunity in years." },
      { title:"Index investing captures bull markets automatically", lesson:"S&P 500 index investors captured 70%+ returns without picking a single stock. Simple broad exposure wins over time." },
      { title:"Not all sectors participate equally", lesson:"Energy and banks lagged during the AI bull. Knowing which sectors benefit from each cycle determines outperformance." },
    ],
    topPerformers: [
      { name:"Nvidia", ticker:"NVDA", return:"+800% from bottom", note:"AI chip monopoly — H100/H200 essential infrastructure" },
      { name:"Meta Platforms", ticker:"META", return:"+400%", note:"From $90 to $500+ — efficiency + AI ads" },
      { name:"Microsoft", ticker:"MSFT", return:"+120%", note:"OpenAI partnership, Azure AI, Copilot" },
      { name:"Broadcom", ticker:"AVGO", return:"+200%", note:"Custom AI silicon for hyperscalers" },
      { name:"Amazon", ticker:"AMZN", return:"+120%", note:"AWS AI services + retail recovery" },
      { name:"Alphabet", ticker:"GOOGL", return:"+100%", note:"Gemini AI + Search dominance" },
      { name:"Eli Lilly", ticker:"LLY", return:"+200%", note:"GLP-1/Ozempic weight loss drug revolution" },
      { name:"JPMorgan Chase", ticker:"JPM", return:"+80%", note:"Best-in-class bank in rising rate environment" },
      { name:"Palantir", ticker:"PLTR", return:"+300%", note:"AI data platform for enterprise/government" },
      { name:"S&P 500 (index)", ticker:"SPY", return:"+70%", note:"Broad market captured the bull run" },
    ],
    worstPerformers: [
      { name:"Silicon Valley Bank", ticker:"SIVB", return:"-100%", note:"Failed March 2023 — rate risk mismanagement" },
      { name:"First Republic Bank", ticker:"FRC", return:"-100%", note:"Bank run, acquired by JPMorgan May 2023" },
      { name:"Signature Bank", ticker:"SBNY", return:"-100%", note:"Closed by regulators March 2023" },
      { name:"Traditional Retail", ticker:"M", return:"-30%", note:"E-commerce continued taking share" },
      { name:"Chinese ADRs", ticker:"BABA", return:"-50%", note:"Regulatory and geopolitical headwinds" },
      { name:"Peloton", ticker:"PTON", return:"-80%", note:"Post-COVID hangover continued" },
      { name:"WeWork", ticker:"WE", return:"-100%", note:"Filed for bankruptcy Nov 2023" },
      { name:"Zoom Video", ticker:"ZM", return:"-40%", note:"Back-to-office killed the COVID beneficiary" },
      { name:"Office REITs", ticker:"VNO", return:"-40%", note:"Remote work permanently reduced office demand" },
      { name:"Telecom", ticker:"T", return:"-10%", note:"Debt-heavy telecoms lagged in high rate environment" },
    ],
    sectorPerformance: [
      { sector:"Technology", return:+57, color:UP },
      { sector:"Communication (Meta/Google)", return:+55, color:UP },
      { sector:"Consumer Disc (Amazon)", return:+40, color:UP },
      { sector:"Financials", return:+30, color:UP },
      { sector:"Healthcare (GLP-1)", return:+25, color:UP },
      { sector:"Industrials", return:+20, color:UP },
      { sector:"Materials", return:+15, color:UP },
      { sector:"Consumer Staples", return:+10, color:UP },
      { sector:"Real Estate", return:+5, color:UP },
      { sector:"Utilities", return:+20, color:UP },
      { sector:"Energy", return:+5, color:UP },
    ],
    stockLookup: {
      "NVDA": { return:"+800% from Oct 2022 bottom", note:"Nvidia became the most important company in the world for AI infrastructure." },
      "META": { return:"+400%", note:"From $90 to $500+. The greatest corporate turnaround in recent history." },
      "MSFT": { return:"+120%", note:"Microsoft's OpenAI partnership made it the enterprise AI leader." },
      "AAPL": { return:"+35%", note:"Apple lagged peers but benefited from AI features in iPhone." },
      "AMZN": { return:"+120%", note:"AWS AI services + retail efficiency drove the recovery." },
      "GOOGL": { return:"+100%", note:"Gemini AI + Search + YouTube recovered strongly." },
      "AVGO": { return:"+200%", note:"Broadcom's custom AI chips for hyperscalers." },
      "LLY": { return:"+200%", note:"Eli Lilly's GLP-1 drugs (Zepbound/Mounjaro) were a medical revolution." },
      "SPY": { return:"+70%", note:"S&P 500 index — captured the entire bull market simply." },
      "PLTR": { return:"+300%", note:"Palantir's AI platform for enterprise and government exploded." },
    },
  },
];

/* ─── Long-term DOW Chart ─────────────────────────────────────────────────── */
const DOT_COLOR = { crash: DOWN, milestone: GOLD, bull: UP };

function LongTermChart({ onMarketEnvClick }) {
  const [selectedDot, setSelectedDot] = useState(null);
  const data = DOW_HISTORY.map(d => ({ ...d, label: String(d.y) }));
  const eventYearSet = new Set(DOW_EVENTS.map(e => e.year));

  const handleDotClick = (ev) => {
    setSelectedDot(prev => prev?.year === ev.year ? null : ev);
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const ev = DOW_EVENTS.find(e => e.year === payload.y);
    if (!ev) return null;
    const isSelected = selectedDot?.year === ev.year;
    const color = DOT_COLOR[ev.type] || GOLD;
    return (
      <g key={`dot-${payload.y}`} style={{ cursor: "pointer" }} onClick={() => handleDotClick(ev)}>
        {isSelected && <circle cx={cx} cy={cy} r={15} fill={color} opacity={0.15} />}
        {isSelected && <circle cx={cx} cy={cy} r={12} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6} />}
        <circle cx={cx} cy={cy} r={isSelected ? 9 : 7} fill={color} opacity={0.9} />
        <circle cx={cx} cy={cy} r={isSelected ? 4 : 3} fill="#07080a" />
      </g>
    );
  };

  const selColor = selectedDot ? (DOT_COLOR[selectedDot.type] || GOLD) : GOLD;

  return (
    <div style={{ background:"var(--surface)", border:"1px solid var(--border-c)",
      borderRadius:16, padding:"1.5rem", marginBottom:"1.25rem",
      backdropFilter:"blur(12px)", boxShadow:"0 4px 24px rgba(0,0,0,0.3)" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.875rem" }}>
        <div>
          <div style={{ fontSize:"0.9375rem", fontWeight:700, color:"var(--text-1)", fontFamily:"'Inter', system-ui, sans-serif" }}>
            Dow Jones Industrial Average: 1900 – Present
          </div>
          <div style={{ fontSize:"0.6875rem", color:"var(--text-3)", marginTop:3, fontFamily:"'Inter', system-ui, sans-serif" }}>
            126 years of market history · Click any dot or chip to see a breakdown
          </div>
        </div>
        {selectedDot && (
          <button onClick={() => setSelectedDot(null)}
            style={{ background:"var(--border-c)", border:"1px solid var(--border-alt)", borderRadius:6, color:"var(--text-3)", cursor:"pointer", fontSize:"0.6875rem", padding:"3px 8px", fontFamily:"'Inter', system-ui, sans-serif", display:"flex", alignItems:"center", gap:4 }}>
            <X size={11} /> close
          </button>
        )}
      </div>

      {/* Chart + Side Panel */}
      <div style={{ display:"flex", gap:"1rem", alignItems:"flex-start" }}>
        {/* Chart */}
        <div style={{ flex:1, minWidth:0 }}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top:10, right:10, left:10, bottom:0 }}>
              <defs>
                <linearGradient id="dow-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a9fd8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1a9fd8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill:"var(--text-3)", fontSize:10 }} tickLine={false} interval={9} />
              <YAxis scale="log" domain={["auto","auto"]} tick={{ fill:"var(--text-3)", fontSize:10 }} tickLine={false} width={50}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
              <Tooltip contentStyle={TT_STYLE} formatter={(v, name, p) => {
                const ev = DOW_EVENTS.find(e => e.year === p?.payload?.y);
                return [
                  <span key="v">{v.toLocaleString()}{ev ? <span style={{ color: DOT_COLOR[ev.type]||GOLD, fontWeight:700, marginLeft:6 }}>· {ev.label}</span> : null}</span>,
                  "DJIA"
                ];
              }} />
              {selectedDot && (
                <ReferenceLine x={String(selectedDot.year)} stroke={selColor} strokeWidth={1.5}
                  strokeDasharray="4 3" opacity={0.7} />
              )}
              <Area type="monotone" dataKey="v" stroke="#1a9fd8" strokeWidth={2} fill="url(#dow-grad)"
                dot={(props) => {
                  if (!eventYearSet.has(props.payload?.y)) return null;
                  return <CustomDot key={props.payload.y} {...props} />;
                }}
                activeDot={{ r:4, fill:"#1a9fd8" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Mini breakdown panel */}
        {selectedDot && (
          <div style={{ width:268, flexShrink:0, display:"flex", flexDirection:"column", gap:"0.625rem" }}>
            {/* Header card */}
            <div style={{ background:`${selColor}0d`, border:`1px solid ${selColor}35`, borderRadius:10, padding:"0.875rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" }}>
                <span style={{ fontSize:"0.5rem", fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase",
                  color:selColor, background:`${selColor}18`, borderRadius:4, padding:"2px 7px",
                  fontFamily:"'Inter', system-ui, sans-serif" }}>
                  {selectedDot.type}
                </span>
                <span style={{ fontSize:"0.625rem", color:"var(--text-3)", fontFamily:"'JetBrains Mono', monospace" }}>{selectedDot.year}</span>
              </div>
              <div style={{ fontSize:"0.9375rem", fontWeight:800, color:"var(--text-1)", marginBottom:2,
                fontFamily:"'Inter', system-ui, sans-serif" }}>
                {selectedDot.label}
              </div>
              <div style={{ display:"flex", gap:"1.25rem", marginTop:"0.625rem" }}>
                <div>
                  <div style={{ fontSize:"0.5rem", color:"var(--text-3)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Inter', system-ui, sans-serif" }}>DOW</div>
                  <div style={{ fontSize:"0.9375rem", fontWeight:800, color:selColor, fontFamily:"'JetBrains Mono', 'Fira Code', monospace" }}>
                    {selectedDot.dow?.toLocaleString() ?? "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:"0.5rem", color:"var(--text-3)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Inter', system-ui, sans-serif" }}>MOVE</div>
                  <div style={{ fontSize:"0.75rem", fontWeight:700, color:selColor, fontFamily:"'JetBrains Mono', 'Fira Code', monospace" }}>{selectedDot.change}</div>
                </div>
              </div>
            </div>

            {/* Brief description */}
            <div style={{ background:"var(--elevated)", border:"1px solid var(--border-c)", borderRadius:10, padding:"0.875rem" }}>
              <div style={{ fontSize:"0.5rem", fontWeight:800, letterSpacing:"0.14em", color:"var(--text-3)", marginBottom:"0.5rem", textTransform:"uppercase", fontFamily:"'Inter', system-ui, sans-serif" }}>
                What Happened
              </div>
              <p style={{ fontSize:"0.75rem", color:"var(--text-2)", lineHeight:1.7, margin:0, fontFamily:"'Inter', system-ui, sans-serif" }}>
                {selectedDot.brief}
              </p>
            </div>

            {/* Full analysis button if available */}
            {selectedDot.eventId && (
              <button
                onClick={() => {
                  const match = MARKET_EVENTS.find(e => e.id === selectedDot.eventId);
                  if (match) onMarketEnvClick(match);
                }}
                style={{ background:`${selColor}15`, border:`1px solid ${selColor}45`, borderRadius:9,
                  padding:"0.625rem", color:selColor, fontWeight:700, fontSize:"0.75rem",
                  cursor:"pointer", width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  fontFamily:"'Inter', system-ui, sans-serif" }}>
                View Full Analysis
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Legend + chips */}
      <div style={{ marginTop:"0.75rem" }}>
        <div style={{ display:"flex", gap:"1rem", alignItems:"center", marginBottom:"0.5rem" }}>
          {[["crash","Crash / Bear",DOWN],["bull","Bull / Recovery",UP],["milestone","Milestone",GOLD]].map(([t,l,c]) => (
            <div key={t} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ width:9, height:9, borderRadius:"50%", background:c, display:"inline-block" }} />
              <span style={{ fontSize:"0.6rem", color:"var(--text-3)" }}>{l}</span>
            </div>
          ))}
          <span style={{ fontSize:"0.6rem", color:"var(--text-3)", marginLeft:"auto" }}>
            Click any chip or dot for details
          </span>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"0.375rem" }}>
          {DOW_EVENTS.map(ev => {
            const isSelected = selectedDot?.year === ev.year;
            const color = DOT_COLOR[ev.type] || GOLD;
            return (
              <button key={ev.year} onClick={() => handleDotClick(ev)}
                style={{ background: isSelected ? `${color}22` : "var(--elevated)",
                  border:`1px solid ${isSelected ? color : `${color}44`}`,
                  borderRadius:20, padding:"3px 10px", fontSize:"0.6rem",
                  color: isSelected ? color : `${color}bb`,
                  cursor:"pointer", fontWeight: isSelected ? 700 : 500,
                  letterSpacing:"0.02em", whiteSpace:"nowrap" }}>
                {ev.year} · {ev.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Event Card ─────────────────────────────────────────────────────────── */
function EventCard({ event, isSelected, onClick }) {
  const isBull = event.type === "bull";
  return (
    <button onClick={onClick} style={{
      background: isSelected ? `${event.color}10` : "var(--surface)",
      border: `1px solid ${isSelected ? event.color : "var(--border-c)"}`,
      borderRadius: 12, padding: "1rem 1.125rem", cursor: "pointer", textAlign: "left",
      transition: "border-color 0.18s, background 0.18s", flex: "1 1 165px", minWidth: 155,
      backdropFilter: "blur(8px)",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.625rem" }}>
        <span style={{ fontSize:"0.5375rem", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase",
          color: event.color, background:`${event.color}18`, borderRadius:5, padding:"2px 7px",
          fontFamily:"'Inter', system-ui, sans-serif" }}>
          {event.type}
        </span>
        {isBull ? <TrendingUp size={13} color={event.color} /> : <TrendingDown size={13} color={event.color} />}
      </div>
      <div style={{ fontWeight:700, fontSize:"0.8125rem", color:"var(--text-1)", marginBottom:2,
        fontFamily:"'Inter', system-ui, sans-serif" }}>{event.name}</div>
      <div style={{ fontSize:"0.6875rem", color:"var(--text-3)", marginBottom:"0.5rem",
        fontFamily:"'Inter', system-ui, sans-serif" }}>{event.period}</div>
      <div style={{ fontSize:"0.9375rem", fontWeight:800, color: isBull ? UP : DOWN,
        fontFamily:"'JetBrains Mono', 'Fira Code', monospace" }}>
        {event.stats.drawdown}
      </div>
    </button>
  );
}

/* ─── Period Chart ───────────────────────────────────────────────────────── */
function PeriodChart({ event }) {
  const color = event.type === "bull" ? UP : DOWN;
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={event.chartData} margin={{ top:5, right:10, left:0, bottom:0 }}>
        <defs>
          <linearGradient id={`pg-${event.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" vertical={false} />
        <XAxis dataKey="d" tick={{ fill:"var(--text-3)", fontSize:9 }} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fill:"var(--text-3)", fontSize:9 }} tickLine={false} width={45}
          tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}K` : v} />
        <Tooltip contentStyle={TT_STYLE} formatter={v => [v.toLocaleString(), "Index"]} />
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#pg-${event.id})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─── Timeline ───────────────────────────────────────────────────────────── */
const TL_COLORS = { crash:"var(--down)", policy:"var(--gold)", recovery:"var(--up)", milestone:"#1a9fd8" };
function Timeline({ events: tl }) {
  return (
    <div style={{ overflowX:"auto", paddingBottom:"0.75rem" }}>
      <div style={{ display:"flex", gap:"0", minWidth: tl.length * 220, position:"relative" }}>
        {/* Connecting line */}
        <div style={{ position:"absolute", top:16, left:16, right:16, height:2, background:"var(--border-c)", zIndex:0 }} />
        {tl.map((item, i) => (
          <div key={i} style={{ flex:"0 0 210px", padding:"0 0.75rem", position:"relative", zIndex:1 }}>
            <div style={{ width:12, height:12, borderRadius:"50%", background:TL_COLORS[item.type]||"var(--text-3)",
              border:"2px solid var(--surface)", marginBottom:"0.5rem", flexShrink:0 }} />
            <div style={{ fontSize:"0.625rem", color:TL_COLORS[item.type], fontWeight:700, marginBottom:2 }}>{item.date}</div>
            <div style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--text-1)", marginBottom:4, lineHeight:1.3 }}>{item.event}</div>
            <div style={{ fontSize:"0.6875rem", color:"var(--text-3)", lineHeight:1.5 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Stock Lookup ───────────────────────────────────────────────────────── */
function StockLookupTab({ event }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  function doSearch() {
    if (!query.trim()) return;
    const key = query.trim().toUpperCase();
    const found = event.stockLookup[key];
    setResult(found ? { ticker: key, ...found } : null);
    setSearched(true);
  }

  return (
    <div>
      <div style={{ fontSize:"0.8125rem", color:"var(--text-2)", marginBottom:"1rem" }}>
        Search how a specific stock performed during the <strong style={{ color:"var(--text-1)" }}>{event.name}</strong>
      </div>
      <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.25rem" }}>
        <input value={query} onChange={e => setQuery(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && doSearch()}
          placeholder="Enter ticker (e.g. AAPL, GLD, JPM...)"
          style={{ flex:1, background:"var(--elevated)", border:"1px solid var(--border-c)", borderRadius:6,
            padding:"0.5rem 0.75rem", color:"var(--text-1)", fontSize:"0.8125rem", outline:"none" }}
        />
        <button onClick={doSearch} style={{ background:GOLD, color:"#07080a", border:"none", borderRadius:6,
          padding:"0.5rem 1rem", fontWeight:700, fontSize:"0.75rem", cursor:"pointer" }}>
          Search
        </button>
      </div>

      {searched && result && (
        <div style={{ background:"var(--elevated)", border:"1px solid var(--border-c)", borderRadius:8, padding:"1.25rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
            <div>
              <div style={{ fontSize:"1.25rem", fontWeight:800, color:"var(--text-1)" }}>{result.ticker}</div>
              <div style={{ fontSize:"0.75rem", color:"var(--text-3)" }}>During {event.name} ({event.period})</div>
            </div>
            <div style={{ fontSize:"1.75rem", fontWeight:900,
              color: result.return.startsWith("+") ? UP : DOWN }}>
              {result.return}
            </div>
          </div>
          <div style={{ fontSize:"0.8125rem", color:"var(--text-2)", lineHeight:1.6 }}>{result.note}</div>
        </div>
      )}

      {searched && !result && (
        <div style={{ background:"var(--elevated)", border:"1px solid var(--border-c)", borderRadius:8,
          padding:"1.25rem", textAlign:"center" }}>
          <div style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--text-2)", marginBottom:6 }}>
            Historical data for <strong style={{ color: GOLD }}>{query}</strong> coming with live API integration
          </div>
          <div style={{ fontSize:"0.75rem", color:"var(--text-3)" }}>
            Available tickers for this period: {Object.keys(event.stockLookup).join(", ")}
          </div>
        </div>
      )}

      {!searched && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:"0.375rem" }}>
          <div style={{ fontSize:"0.6875rem", color:"var(--text-3)", width:"100%", marginBottom:4 }}>Quick search:</div>
          {Object.keys(event.stockLookup).map(tk => (
            <button key={tk} onClick={() => { setQuery(tk); const found = event.stockLookup[tk]; setResult({ ticker: tk, ...found }); setSearched(true); }}
              style={{ background:"var(--elevated)", border:"1px solid var(--border-c)", borderRadius:4,
                padding:"3px 8px", fontSize:"0.6875rem", color:"var(--text-2)", cursor:"pointer", fontWeight:600 }}>
              {tk}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Event Detail Panel ─────────────────────────────────────────────────── */
const TABS = [
  { id:"story", label:"The Story", icon:BookOpen },
  { id:"performance", label:"Performers", icon:TrendingDown },
  { id:"sectors", label:"Sectors", icon:BarChart },
  { id:"investments", label:"Investments", icon:DollarSign },
  { id:"lessons", label:"Key Lessons", icon:Lightbulb },
  { id:"lookup", label:"Stock Lookup", icon:Search },
];

function EventDetailPanel({ event, onClose }) {
  const [tab, setTab] = useState("story");

  return (
    <div style={{ background:"var(--surface)", border:"1px solid var(--border-c)",
      borderRadius:16, marginBottom:"1.25rem", overflow:"hidden",
      backdropFilter:"blur(12px)", boxShadow:"0 4px 24px rgba(0,0,0,0.3)" }}>
      {/* Header */}
      <div style={{ padding:"1.375rem 1.375rem 0", borderBottom:"1px solid var(--border-c)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"0.625rem", marginBottom:"0.5rem" }}>
              <span style={{ fontSize:"0.5375rem", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase",
                color:event.color, background:`${event.color}18`, borderRadius:5, padding:"2px 8px",
                fontFamily:"'Inter', system-ui, sans-serif" }}>
                {event.type}
              </span>
              <span style={{ fontSize:"0.625rem", color:"var(--text-3)", fontFamily:"'Inter', system-ui, sans-serif" }}>{event.period}</span>
            </div>
            <div style={{ fontSize:"1.25rem", fontWeight:800, color:"var(--text-1)", fontFamily:"'Inter', system-ui, sans-serif" }}>{event.name}</div>
            <div style={{ fontSize:"0.8125rem", color:"var(--text-3)", marginTop:3, fontFamily:"'Inter', system-ui, sans-serif" }}>{event.tagline}</div>
          </div>
          <button onClick={onClose} style={{ background:"var(--border-c)", border:"1px solid var(--border-alt)", borderRadius:7, color:"var(--text-3)", cursor:"pointer", padding:"5px 7px", display:"flex", alignItems:"center" }}>
            <X size={14} />
          </button>
        </div>

        {/* Key stats strip */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:"1rem", marginBottom:"1rem" }}>
          {Object.entries(event.stats).map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize:"0.5625rem", color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>
                {k.replace(/([A-Z])/g," $1").trim()}
              </div>
              <div style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--text-1)" }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Period chart */}
        <PeriodChart event={event} />

        {/* Tabs */}
        <div style={{ display:"flex", gap:"0.25rem", marginTop:"1rem", overflowX:"auto", paddingBottom:"0.5rem" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab===t.id ? `${GOLD}18` : "transparent",
              border: tab===t.id ? `1px solid ${GOLD}45` : "1px solid transparent",
              borderRadius:7,
              color: tab===t.id ? GOLD : "var(--text-3)", cursor:"pointer",
              padding:"0.375rem 0.75rem", fontSize:"0.6875rem", fontWeight: tab===t.id ? 700 : 500,
              whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:5,
              fontFamily:"'Inter', system-ui, sans-serif", transition:"all 0.15s",
            }}>
              <t.icon size={11} />{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding:"1.25rem" }}>

        {tab === "story" && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>
              <div>
                <div style={{ fontSize:"0.75rem", fontWeight:700, color:DOWN, marginBottom:"0.75rem",
                  textTransform:"uppercase", letterSpacing:"0.08em", display:"flex", alignItems:"center", gap:5 }}>
                  <AlertTriangle size={12} /> How It Happened
                </div>
                {event.howItHappened.map((p, i) => (
                  <div key={i} style={{ display:"flex", gap:"0.625rem", marginBottom:"0.625rem" }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:DOWN, marginTop:6, flexShrink:0 }} />
                    <div style={{ fontSize:"0.8125rem", color:"var(--text-2)", lineHeight:1.6 }}>{p}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize:"0.75rem", fontWeight:700, color:UP, marginBottom:"0.75rem",
                  textTransform:"uppercase", letterSpacing:"0.08em", display:"flex", alignItems:"center", gap:5 }}>
                  <CheckCircle size={12} /> How It Got Fixed
                </div>
                {event.howItGotFixed.map((p, i) => (
                  <div key={i} style={{ display:"flex", gap:"0.625rem", marginBottom:"0.625rem" }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:UP, marginTop:6, flexShrink:0 }} />
                    <div style={{ fontSize:"0.8125rem", color:"var(--text-2)", lineHeight:1.6 }}>{p}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--text-2)", marginBottom:"1rem",
                textTransform:"uppercase", letterSpacing:"0.08em", display:"flex", alignItems:"center", gap:5 }}>
                <Clock size={12} /> Timeline of Key Events
              </div>
              <Timeline events={event.timeline} />
            </div>
          </div>
        )}

        {tab === "performance" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>
            <div>
              <div style={{ fontSize:"0.75rem", fontWeight:700, color:UP, marginBottom:"0.75rem",
                textTransform:"uppercase", letterSpacing:"0.08em" }}>▲ Top 10 Performers</div>
              {event.topPerformers.map((p, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"0.5rem 0", borderBottom:"1px solid var(--border-c)" }}>
                  <div style={{ display:"flex", gap:"0.625rem", alignItems:"center" }}>
                    <span style={{ fontSize:"0.625rem", color:"var(--text-3)", width:16 }}>{i+1}</span>
                    <div>
                      <div style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--text-1)" }}>{p.name}</div>
                      <div style={{ fontSize:"0.625rem", color:"var(--text-3)" }}>{p.note}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:"0.875rem", fontWeight:800, color:UP, flexShrink:0 }}>{p.return}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:"0.75rem", fontWeight:700, color:DOWN, marginBottom:"0.75rem",
                textTransform:"uppercase", letterSpacing:"0.08em" }}>▼ Worst 10 Performers</div>
              {event.worstPerformers.map((p, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"0.5rem 0", borderBottom:"1px solid var(--border-c)" }}>
                  <div style={{ display:"flex", gap:"0.625rem", alignItems:"center" }}>
                    <span style={{ fontSize:"0.625rem", color:"var(--text-3)", width:16 }}>{i+1}</span>
                    <div>
                      <div style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--text-1)" }}>{p.name}</div>
                      <div style={{ fontSize:"0.625rem", color:"var(--text-3)" }}>{p.note}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:"0.875rem", fontWeight:800, color:DOWN, flexShrink:0 }}>{p.return}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "sectors" && (
          <div>
            <div style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--text-2)", marginBottom:"1rem",
              textTransform:"uppercase", letterSpacing:"0.08em" }}>
              Sector Performance During {event.name}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={event.sectorPerformance} layout="vertical" margin={{ left:10, right:60, top:5, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" horizontal={false} />
                <XAxis type="number" tick={{ fill:"var(--text-3)", fontSize:10 }} tickLine={false}
                  tickFormatter={v => `${v}%`} domain={['dataMin - 5', 'dataMax + 5']} />
                <YAxis type="category" dataKey="sector" tick={{ fill:"var(--text-2)", fontSize:11 }} tickLine={false} width={130} />
                <Tooltip contentStyle={TT_STYLE} formatter={v => [`${v}%`, "Return"]} />
                <ReferenceLine x={0} stroke="var(--text-3)" strokeWidth={1} />
                <Bar dataKey="return" radius={[0,3,3,0]}>
                  {event.sectorPerformance.map((entry, i) => (
                    <Cell key={i} fill={entry.return >= 0 ? UP : DOWN} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {tab === "investments" && (
          <div>
            <div style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--text-2)", marginBottom:"1rem",
              textTransform:"uppercase", letterSpacing:"0.08em" }}>
              Real Investment Examples During This Period
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:"0.875rem" }}>
              {event.investmentExamples.map((ex, i) => (
                <div key={i} style={{ background:"var(--elevated)", border:"1px solid var(--border-c)",
                  borderRadius:8, padding:"1rem" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.5rem" }}>
                    <div>
                      <div style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--text-1)" }}>{ex.asset}</div>
                      <div style={{ fontSize:"0.6875rem", color:"var(--text-3)", marginTop:1 }}>{ex.action}</div>
                    </div>
                    <span style={{ fontSize:"1.125rem", fontWeight:900,
                      color: ex.result.startsWith("+") ? UP : DOWN, flexShrink:0 }}>
                      {ex.result}
                    </span>
                  </div>
                  <div style={{ fontSize:"0.75rem", color:"var(--text-2)", lineHeight:1.6 }}>{ex.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "lessons" && (
          <div>
            <div style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--text-2)", marginBottom:"1rem",
              textTransform:"uppercase", letterSpacing:"0.08em" }}>
              Key Investor Lessons from {event.name}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
              {event.keyLessons.map((l, i) => (
                <div key={i} style={{ background:`${event.color}07`, border:`1px solid ${event.color}28`,
                  borderRadius:10, padding:"1rem 1.125rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.625rem", marginBottom:"0.375rem" }}>
                    <span style={{ width:20, height:20, borderRadius:5, background:`${event.color}20`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"0.5625rem", fontWeight:800, color:event.color, fontFamily:"'Inter', system-ui, sans-serif" }}>{i+1}</span>
                    <div style={{ fontSize:"0.875rem", fontWeight:700, color:"var(--text-1)", fontFamily:"'Inter', system-ui, sans-serif" }}>{l.title}</div>
                  </div>
                  <div style={{ fontSize:"0.8125rem", color:"var(--text-2)", lineHeight:1.65, paddingLeft:"1.625rem", fontFamily:"'Inter', system-ui, sans-serif" }}>{l.lesson}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "lookup" && <StockLookupTab event={event} />}

      </div>
    </div>
  );
}

/* ─── Market Wisdom ──────────────────────────────────────────────────────── */
const WISDOM = [
  "During the 2008 crash, the S&P 500 fell 57%. Those who stayed invested saw it recover and hit new highs by 2013. Patience pays.",
  "$10,000 invested in the S&P 500 in 2000 (dot-com peak) would be worth over $45,000 today, despite 2 major crashes.",
  "The S&P 500 has recovered from every single crash in history. The average bear market lasts 9 months; bull markets average 2.7 years.",
  "Missing just the 10 best days in the market over 30 years would cut your returns in half. Time IN the market beats timing the market.",
  "If you invested $1,000/month for 30 years at 10%, you'd have $2.3M. At 2% (savings account)? Only $500K.",
  "COVID proved the fastest crash = fastest recovery. Those who bought in March 2020 had 100%+ gains within 18 months.",
  "October 2022 felt like everything was broken. It was the best buying opportunity in a decade.",
];

/* ─── Historical Decades Data ──────────────────────────────────────────────── */
const DECADE_LIST = [
  "1920s","1930s","1940s","1950s","1960s","1970s","1980s","1990s","2000s","2010s","2020s",
];

const FIFTIES_ANNUAL = [
  { year:"1950", ret:18.1,  note:"Korean War begins in June. Defense spending surges. Industrial mobilization supports corporate earnings. The market advances 18.1% despite the active conflict." },
  { year:"1951", ret:14.4,  note:"War intensifies through the year. Consumer prices rise 7.9% annually at peak wartime inflation. The Federal Reserve tightens. Market delivers 14.4% through it all." },
  { year:"1952", ret:8.4,   note:"Fed raises discount rate to 3% to combat persistent inflation. Wartime economy continues. Eisenhower wins the presidency in November. Modest gains as the war winds down." },
  { year:"1953", ret:-3.8,  note:"Korean armistice signed July 1953. Abrupt post-war defense cuts spark a recession. GDP falls 5.9% in Q4. Unemployment rises. Market pulls back 3.8%.", recession:true },
  { year:"1954", ret:43.9,  note:"Recession ends. One of the greatest single-year rallies in Dow Jones history. GDP rebounds sharply. The Federal Reserve eases. Consumer confidence recovers powerfully." },
  { year:"1955", ret:20.8,  note:"The Eisenhower boom. Consumer confidence reaches decade highs. The Interstate Highway Act creates massive infrastructure investment. Baby boom drives housing and spending." },
  { year:"1956", ret:2.3,   note:"The Suez Crisis creates brief geopolitical anxiety in the autumn. Market largely absorbs the international shock. Modest gains on cautious corporate sentiment." },
  { year:"1957", ret:-12.8, note:"The Eisenhower Recession begins in August. Fed tightens to curb inflation. Asian flu pandemic reduces US exports. Sputnik shocks American confidence in October.", recession:true },
  { year:"1958", ret:34.0,  note:"Recession ends in April. Second massive recovery in five years. The Fed eases aggressively. Economy rebounds sharply. The pattern — decline then powerful recovery — repeats." },
  { year:"1959", ret:16.4,  note:"Bull market resumes. Decade closes at approximately 680 on the Dow, up from 200 at the start. A full decade of compounding through adversity at 14.1% per year." },
];

const FIFTIES_DOW = [
  { year:1950, v:236 }, { year:1951, v:270 }, { year:1952, v:293 },
  { year:1953, v:282 }, { year:1954, v:405 }, { year:1955, v:490 },
  { year:1956, v:501 }, { year:1957, v:437 }, { year:1958, v:585 },
  { year:1959, v:681 },
];

const FIFTIES_DOW_META = {
  1953: { type:"recession", label:"Recession I", ret:"−3.8%" },
  1954: { type:"recovery",  label:"Recovery",   ret:"+43.9%" },
  1957: { type:"recession", label:"Recession II", ret:"−12.8%" },
  1958: { type:"recovery",  label:"Recovery",   ret:"+34.0%" },
};

const DECADE_COMPS = [
  { dec:"1920s", ret:14.2 }, { dec:"1930s", ret:-1.9 }, { dec:"1940s", ret:3.4 },
  { dec:"1950s", ret:14.1, hi:true }, { dec:"1960s", ret:2.6 }, { dec:"1970s", ret:2.1 },
  { dec:"1980s", ret:13.3 }, { dec:"1990s", ret:15.9 }, { dec:"2000s", ret:0.6 },
  { dec:"2010s", ret:11.0 }, { dec:"2020s", ret:9.2 },
];

const FIFTIES_HEADWINDS = [
  {
    id:"korean",
    title:"The Korean War",
    dates:"June 1950 — July 1953",
    color:"#1a9fd8",
    stats:[
      { label:"Peak Inflation", value:"7.9% annualized (1951)" },
      { label:"Fed Response", value:"Rate raised 1.75% to 3%" },
      { label:"Dow in 1950", value:"+18.1%" },
      { label:"Dow in 1951", value:"+14.4%" },
    ],
    body:"Active US military engagement on the Korean peninsula drove government spending sharply higher. Consumer prices rose 7.9% annually at the 1951 peak. The Federal Reserve raised the discount rate from 1.75% to 3% to fight wartime inflation, constraining civilian investment. Yet the market delivered double-digit gains through the war years. Defense mobilization supported corporate earnings rather than suppressing them.",
  },
  {
    id:"rec1",
    title:"Recession I",
    dates:"July 1953 — May 1954 · 10 months",
    color:DOWN,
    stats:[
      { label:"GDP (Q4 1953)", value:"−5.9% contraction" },
      { label:"Unemployment Peak", value:"6.1% by late 1954" },
      { label:"Cause", value:"Post-war defense spending cuts" },
      { label:"Dow Drop / Recovery", value:"−3.8% then +43.9%" },
    ],
    body:"Abrupt cuts in defense spending after the Korean War armistice combined with Federal Reserve tightening created an economic contraction. Defense procurement fell sharply. GDP contracted 2.2% overall with a severe 5.9% drop in Q4 1953 alone. Unemployment rose from 2.5% to 6.1%. The Dow fell just 3.8% in 1953, then surged 43.9% in 1954 — one of the greatest single-year recoveries in market history.",
  },
  {
    id:"rec2",
    title:"Recession II",
    dates:"August 1957 — April 1958 · 8 months",
    color:DOWN,
    stats:[
      { label:"GDP (Q1 1958)", value:"−10.0% contraction" },
      { label:"Unemployment Peak", value:"7.5% by July 1958" },
      { label:"Additional Shocks", value:"Asian flu, Sputnik, trade deficit" },
      { label:"Dow Drop / Recovery", value:"−12.8% then +34.0%" },
    ],
    body:"Federal Reserve contractionary policy combined with a global recession and the Asian flu pandemic reduced US exports significantly. GDP fell 4.1% in Q4 1957 then contracted a severe 10.0% in Q1 1958. Sputnik's launch in October 1957 shocked American confidence. Unemployment reached 7.5%. The Dow fell 12.8% in 1957 then surged 34.0% in 1958 — the same recovery pattern repeated precisely.",
  },
];

const FIFTIES_LESSONS = [
  {
    n:"01",
    title:"Recessions are temporary. Recoveries are permanent.",
    body:"The market fell in each recession year then delivered some of its greatest single-year returns immediately after. The 1953 recession was followed by +43.9% in 1954. The 1957 recession was followed by +34.0% in 1958. Investors who sold during either recession missed the greatest recovery gains of the decade. The pattern repeated so clearly it was almost a formula.",
  },
  {
    n:"02",
    title:"War does not stop bull markets.",
    body:"The Korean War created inflation, uncertainty, and genuine geopolitical fear. The market averaged 18.1% in 1950 — the year the war began — and 14.4% in 1951 while it raged. Defense spending and industrial mobilization supported corporate earnings rather than suppressing them. The instinct to sell on war news would have cost investors dearly.",
  },
  {
    n:"03",
    title:"The cost of patience is volatility.",
    body:"Investors who held through both recessions, the Korean War, the Cold War, Sputnik, McCarthyism, and two aggressive Federal Reserve tightening cycles were rewarded with 14.1% annual returns for a full decade. The price of those returns was living through the anxiety of each event in real time — an anxiety that always feels permanent but never is.",
  },
  {
    n:"04",
    title:"Post-war economic foundations create generational wealth.",
    body:"The baby boom drove housing demand. The Interstate Highway Act of 1956 created massive infrastructure investment across the country. Consumer culture emerged as Americans had disposable income for the first time in decades. Corporate America modernized rapidly. These structural tailwinds overwhelmed every short-term headwind the decade produced.",
  },
  {
    n:"05",
    title:"The Federal Reserve is the dominant macro variable.",
    body:"The Treasury-Fed Accord of 1951 granted the Federal Reserve genuine independence from the Treasury Department. The Fed's decisions to tighten and ease monetary policy drove both recessions and both recoveries of the decade. Understanding the Fed's direction was the single most important macro judgment an investor could make — and it remains so today.",
  },
];

/* ─── Decades Panel ──────────────────────────────────────────────────────── */
function DecadesPanel() {
  const [activeDec, setActiveDec] = useState("1950s");
  const [selectedBar, setSelectedBar] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      {/* Section header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: collapsed ? 0 : "1rem" }}>
        <div>
          <div className="t-section-title">Decade in Focus</div>
          {!collapsed && (
            <div style={{ fontSize:"0.6875rem", color:"var(--text-3)", marginTop:2 }}>
              Deep analysis of the most consequential market decades in history
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? "Expand" : "Minimize"}
          style={{
            display:"flex", alignItems:"center", gap:5,
            background:"transparent", border:"1px solid var(--border-c)",
            borderRadius:7, padding:"4px 10px", cursor:"pointer",
            color:"var(--text-3)", fontSize:"0.6875rem", fontFamily:"inherit",
            transition:"all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-c)"; e.currentTarget.style.color = "var(--text-3)"; }}
        >
          {collapsed
            ? <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Show</>
            : <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Hide</>
          }
        </button>
      </div>
      {!collapsed && (
      <div>

      {/* Decade tabs */}
      <div style={{ display:"flex", gap:"0.25rem", flexWrap:"wrap", marginBottom:"1.5rem",
        background:"var(--surface)", border:"1px solid var(--border-c)", borderRadius:10, padding:"0.375rem" }}>
        {DECADE_LIST.map(dec => {
          const enabled = dec === "1950s";
          const isActive = activeDec === dec;
          return (
            <button key={dec}
              onClick={() => enabled && setActiveDec(dec)}
              style={{
                background: isActive ? GOLD : "transparent",
                color: isActive ? "#07080a" : enabled ? "var(--text-2)" : "var(--text-3)",
                border:"none", borderRadius:7, padding:"0.4rem 0.875rem",
                fontSize:"0.6875rem", fontWeight: isActive ? 800 : 500,
                cursor: enabled ? "pointer" : "default",
                opacity: enabled ? 1 : 0.35,
                letterSpacing:"0.04em", transition:"all 0.12s",
                fontFamily:"'Inter', system-ui, sans-serif",
              }}>
              {dec}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeDec !== "1950s" ? (
        <div style={{ background:"var(--surface)", border:"1px solid var(--border-c)",
          borderRadius:14, padding:"3.5rem 2rem", textAlign:"center", backdropFilter:"blur(8px)" }}>
          <div style={{ fontSize:"0.5rem", fontWeight:800, letterSpacing:"0.2em", color:"var(--text-3)",
            textTransform:"uppercase", marginBottom:"1rem", fontFamily:"'Inter', system-ui, sans-serif" }}>Analysis Coming</div>
          <div style={{ fontSize:"1.625rem", fontWeight:800, color:"var(--text-1)", marginBottom:"0.75rem",
            fontFamily:"'JetBrains Mono', 'Fira Code', monospace" }}>The {activeDec}</div>
          <div style={{ fontSize:"0.8125rem", color:"var(--text-3)", maxWidth:480, margin:"0 auto", lineHeight:1.75, fontFamily:"'Inter', system-ui, sans-serif" }}>
            A full decade analysis — year by year returns, key headwinds, recovery patterns, and investor lessons — is in development.
            The 1950s analysis is live now.
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>

          {/* SECTION 1 — Decade hero header */}
          <div style={{ background:"var(--surface)", border:"1px solid var(--border-c)",
            borderRadius:16, padding:"2rem 2.25rem", position:"relative", overflow:"hidden",
            backdropFilter:"blur(12px)", boxShadow:"0 4px 24px rgba(0,0,0,0.3)" }}>
            <div style={{ position:"absolute", top:-80, right:-60, width:360, height:360,
              background:"radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 68%)",
              pointerEvents:"none" }} />
            <div style={{ position:"relative" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.75rem" }}>
                <div style={{ width:16, height:1, background:"var(--gold)", opacity:0.5 }} />
                <div style={{ fontSize:"0.5rem", fontWeight:800, letterSpacing:"0.2em",
                  color:"var(--text-3)", textTransform:"uppercase", fontFamily:"'Inter', system-ui, sans-serif" }}>
                  Decade Analysis · Dow Jones Industrial Average
                </div>
              </div>
              <div style={{ fontSize:"clamp(2rem, 4vw, 3.25rem)", fontWeight:800, color:"var(--text-1)", lineHeight:1,
                letterSpacing:"-0.03em", marginBottom:"0.5rem", fontFamily:"'Inter', system-ui, sans-serif", display:"flex", alignItems:"baseline", gap:"0.5rem" }}>
                <span>The</span>
                <em style={{ fontStyle:"italic", color:"var(--gold)", fontFamily:"'Playfair Display', Georgia, serif" }}>1950s</em>
              </div>
              <div style={{ fontSize:"1rem", fontWeight:500, color:"var(--text-2)", marginBottom:"1.5rem", fontFamily:"'Inter', system-ui, sans-serif" }}>
                The Decade That Refused to Break
              </div>

              <div style={{ display:"flex", gap:"2.5rem", flexWrap:"wrap", marginBottom:"1.5rem" }}>
                {[
                  { label:"Avg. Annual Return", value:"14.1%", color:GOLD, mono:true },
                  { label:"Dow Jones 1950", value:"~200", color:"var(--text-1)", mono:true },
                  { label:"Dow Jones 1959", value:"~680", color:"var(--text-1)", mono:true },
                  { label:"Total Decade Gain", value:"+240%", color:UP, mono:true },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize:"0.5rem", fontWeight:700, letterSpacing:"0.12em",
                      color:"var(--text-3)", textTransform:"uppercase", marginBottom:4 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize:"2.5rem", fontWeight:900, color:s.color, lineHeight:1,
                      fontFamily: s.mono ? "var(--font-mono)" : undefined }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding:"1rem 1.25rem", background:"rgba(201,169,110,0.06)",
                border:"1px solid rgba(201,169,110,0.2)", borderRadius:8, maxWidth:680, marginBottom:"0.875rem" }}>
                <div style={{ fontSize:"0.8125rem", color:"var(--text-2)", lineHeight:1.75 }}>
                  Two recessions. An active military conflict on the Korean peninsula. Cold War nuclear anxiety.
                  McCarthyism. Sputnik. Two aggressive Federal Reserve tightening cycles. Inflation reaching
                  7.9% annually. The market compounded at 14.1% per year through all of it.
                </div>
              </div>

              <div style={{ padding:"0.75rem 1rem", background:"rgba(201,169,110,0.04)",
                border:"1px solid rgba(201,169,110,0.15)", borderRadius:6, maxWidth:680 }}>
                <div style={{ fontSize:"0.6875rem", color:"var(--text-3)", lineHeight:1.65 }}>
                  <strong style={{ color:GOLD }}>Long-term perspective:</strong>{" "}
                  $100 invested in the S&P 500 in 1950 grew to $396,719 by 2026 —
                  a compounded return that turned a modest investment into generational wealth
                  for anyone who stayed the course through every decade that followed.
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 — Year-by-year bar chart */}
          <div style={{ background:"var(--surface)", border:"1px solid var(--border-c)", borderRadius:14, padding:"1.5rem", backdropFilter:"blur(8px)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem", flexWrap:"wrap", gap:"0.5rem" }}>
              <div>
                <div style={{ fontSize:"0.875rem", fontWeight:700, color:"var(--text-1)" }}>
                  Annual Dow Jones Returns: 1950 — 1959
                </div>
                <div style={{ fontSize:"0.6875rem", color:"var(--text-3)", marginTop:2 }}>
                  Click any bar to see what drove returns that year
                </div>
              </div>
              <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
                {[
                  { label:"Positive year", type:"swatch", color:GOLD },
                  { label:"Recession year", type:"swatch", color:DOWN },
                  { label:"14.1% average", type:"dash", color:GOLD },
                ].map(l => (
                  <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    {l.type === "swatch"
                      ? <span style={{ width:10, height:10, background:l.color, borderRadius:2, display:"inline-block" }} />
                      : <span style={{ width:18, borderTop:`2px dashed ${l.color}`, display:"inline-block" }} />
                    }
                    <span style={{ fontSize:"0.6rem", color:"var(--text-3)" }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={FIFTIES_ANNUAL} margin={{ top:20, right:20, left:0, bottom:0 }}
                onClick={d => {
                  const payload = d?.activePayload?.[0]?.payload;
                  if (!payload) return;
                  setSelectedBar(prev => prev?.year === payload.year ? null : payload);
                }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" vertical={false} />
                <XAxis dataKey="year" tick={{ fill:"var(--text-3)", fontSize:10 }} tickLine={false} />
                <YAxis tickFormatter={v => `${v > 0 ? "+" : ""}${v}%`} tick={{ fill:"var(--text-3)", fontSize:10 }}
                  tickLine={false} width={46} />
                <Tooltip contentStyle={TT_STYLE}
                  labelStyle={{ color:"#f0e8d8", fontWeight:700 }}
                  itemStyle={{ color:"#f0e8d8" }}
                  formatter={v => [`${v > 0 ? "+" : ""}${v}%`, "Annual Return"]}
                  cursor={{ fill:"rgba(201,169,110,0.06)" }} />
                <ReferenceLine y={14.1} stroke={GOLD} strokeDasharray="4 3" strokeWidth={1.5}
                  label={{ value:"14.1% avg", position:"insideTopRight", fill:GOLD, fontSize:9, fontWeight:700 }} />
                <ReferenceLine y={0} stroke="var(--text-3)" strokeWidth={0.5} />
                <Bar dataKey="ret" radius={[2,2,0,0]} cursor="pointer">
                  {FIFTIES_ANNUAL.map((d, i) => (
                    <Cell key={i}
                      fill={d.ret < 0 ? DOWN : GOLD}
                      opacity={selectedBar && selectedBar.year !== d.year ? 0.35 : 0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {selectedBar && (
              <div style={{ marginTop:"1rem", padding:"1rem 1.25rem",
                background: selectedBar.ret < 0 ? `${DOWN}08` : `${GOLD}08`,
                border:`1px solid ${selectedBar.ret < 0 ? `${DOWN}30` : `${GOLD}30`}`,
                borderRadius:8, display:"flex", gap:"1.5rem", alignItems:"flex-start" }}>
                <div style={{ flexShrink:0 }}>
                  <div style={{ fontSize:"0.5rem", fontWeight:700, letterSpacing:"0.12em",
                    color:"var(--text-3)", textTransform:"uppercase", marginBottom:4 }}>
                    {selectedBar.year}
                  </div>
                  <div style={{ fontSize:"2.25rem", fontWeight:900, lineHeight:1.1,
                    color: selectedBar.ret < 0 ? DOWN : GOLD, fontFamily:"var(--font-mono)" }}>
                    {selectedBar.ret > 0 ? "+" : ""}{selectedBar.ret}%
                  </div>
                  {selectedBar.recession && (
                    <div style={{ marginTop:6, fontSize:"0.5rem", fontWeight:800, letterSpacing:"0.1em",
                      color:DOWN, textTransform:"uppercase", background:`${DOWN}15`,
                      borderRadius:4, padding:"2px 7px", display:"inline-block" }}>
                      Recession Year
                    </div>
                  )}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"0.8125rem", color:"var(--text-2)", lineHeight:1.75 }}>
                    {selectedBar.note}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3 — Three headwind panels */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:"0.875rem" }}>
            {FIFTIES_HEADWINDS.map(hw => (
              <div key={hw.id} style={{ background:"var(--surface)", border:"1px solid var(--border-c)",
                borderRadius:12, padding:"1.25rem", display:"flex", flexDirection:"column", gap:"0.875rem" }}>
                <div>
                  <div style={{ fontSize:"0.5rem", fontWeight:800, letterSpacing:"0.14em",
                    color:hw.color, textTransform:"uppercase", marginBottom:4 }}>
                    Major Headwind
                  </div>
                  <div style={{ fontSize:"0.9375rem", fontWeight:800, color:"var(--text-1)", marginBottom:2 }}>
                    {hw.title}
                  </div>
                  <div style={{ fontSize:"0.6875rem", color:"var(--text-3)" }}>{hw.dates}</div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem" }}>
                  {hw.stats.map(s => (
                    <div key={s.label} style={{ background:"var(--elevated)", border:"1px solid var(--border-c)",
                      borderRadius:6, padding:"0.5rem 0.625rem" }}>
                      <div style={{ fontSize:"0.4375rem", fontWeight:700, letterSpacing:"0.1em",
                        color:"var(--text-3)", textTransform:"uppercase", marginBottom:2 }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--text-1)" }}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:"0.75rem", color:"var(--text-2)", lineHeight:1.7,
                  borderTop:"1px solid var(--border-c)", paddingTop:"0.875rem" }}>
                  {hw.body}
                </div>
              </div>
            ))}
          </div>

          {/* SECTION 4 — Recovery pattern area chart */}
          <div style={{ background:"var(--surface)", border:"1px solid var(--border-c)", borderRadius:12, padding:"1.5rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.25rem", flexWrap:"wrap", gap:"0.5rem" }}>
              <div>
                <div style={{ fontSize:"0.875rem", fontWeight:700, color:"var(--text-1)", marginBottom:2 }}>
                  The Recovery Pattern: Dow Jones Level 1950 — 1959
                </div>
                <div style={{ fontSize:"0.6875rem", color:"var(--text-3)" }}>
                  Red bands mark recession years · Green dots mark recovery peaks · Hover for values
                </div>
              </div>
              <div style={{ display:"flex", gap:"1rem" }}>
                {[
                  { label:"Recession", color:DOWN },
                  { label:"Recovery", color:UP },
                  { label:"Trend", color:GOLD },
                ].map(l => (
                  <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:l.color, display:"inline-block" }} />
                    <span style={{ fontSize:"0.6rem", color:"var(--text-3)" }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={310}>
              <AreaChart data={FIFTIES_DOW} margin={{ top:24, right:16, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="dow50-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GOLD} stopOpacity={0.22} />
                    <stop offset="60%" stopColor={GOLD} stopOpacity={0.06} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                  <filter id="dot-glow">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {/* Recession shading bands */}
                <ReferenceArea x1={1952.55} x2={1953.45} fill="rgba(255,59,92,0.10)" stroke="rgba(255,59,92,0.25)" strokeWidth={0.5} />
                <ReferenceArea x1={1956.55} x2={1957.45} fill="rgba(255,59,92,0.10)" stroke="rgba(255,59,92,0.25)" strokeWidth={0.5} />

                <CartesianGrid strokeDasharray="2 4" stroke="var(--border-c)" vertical={false} />
                <CartesianGrid strokeDasharray="0" stroke="var(--border-c)" horizontal={false} />

                <XAxis
                  type="number" dataKey="year"
                  domain={[1949.8, 1959.2]}
                  tickCount={10}
                  tickFormatter={v => Math.round(v)}
                  tick={{ fill:"var(--text-3)", fontSize:10, fontFamily:"var(--font-mono)" }}
                  tickLine={false} axisLine={{ stroke:"var(--border-c)" }}
                />
                <YAxis
                  tick={{ fill:"var(--text-3)", fontSize:10, fontFamily:"var(--font-mono)" }}
                  tickLine={false} axisLine={false} width={38}
                  domain={[140, 760]}
                  tickFormatter={v => v}
                />
                <Tooltip
                  contentStyle={{ ...TT_STYLE, padding:"0.625rem 0.875rem" }}
                  labelStyle={{ color:"#f0e8d8", fontWeight:700, fontFamily:"var(--font-mono)", marginBottom:4 }}
                  itemStyle={{ color:GOLD, fontWeight:700, fontFamily:"var(--font-mono)" }}
                  labelFormatter={v => `Year ${v}`}
                  formatter={v => [v.toLocaleString(), "DJIA"]}
                  cursor={{ stroke:GOLD, strokeWidth:1, strokeDasharray:"4 3" }}
                />

                {/* Start / end reference lines */}
                <ReferenceLine y={236} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" strokeWidth={1} />
                <ReferenceLine y={681} stroke={`${GOLD}55`} strokeDasharray="3 3" strokeWidth={1}
                  label={{ value:"681", position:"right", fill:GOLD, fontSize:9, fontWeight:700, fontFamily:"var(--font-mono)" }} />

                {/* Recession event vertical markers */}
                <ReferenceLine x={1953} stroke={`${DOWN}60`} strokeWidth={1} strokeDasharray="3 3"
                  label={{ value:"REC I", position:"insideTopLeft", fill:DOWN, fontSize:8, fontWeight:800 }} />
                <ReferenceLine x={1957} stroke={`${DOWN}60`} strokeWidth={1} strokeDasharray="3 3"
                  label={{ value:"REC II", position:"insideTopLeft", fill:DOWN, fontSize:8, fontWeight:800 }} />

                <Area
                  type="monotone" dataKey="v"
                  stroke={GOLD} strokeWidth={3}
                  fill="url(#dow50-fill)"
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const meta = FIFTIES_DOW_META[payload.year];
                    if (!meta) {
                      return <circle key={payload.year} cx={cx} cy={cy} r={3.5}
                        fill={GOLD} stroke="#1a1410" strokeWidth={1.5} />;
                    }
                    const color = meta.type === "recession" ? DOWN : UP;
                    return (
                      <g key={payload.year} filter="url(#dot-glow)">
                        <circle cx={cx} cy={cy} r={14} fill={color} opacity={0.08} />
                        <circle cx={cx} cy={cy} r={8} fill={color} opacity={0.18} />
                        <circle cx={cx} cy={cy} r={5.5} fill={color} stroke="#1a1410" strokeWidth={1.5} />
                        <text x={cx} y={meta.type === "recession" ? cy + 18 : cy - 13}
                          textAnchor="middle" fill={color}
                          fontSize={8} fontWeight={800} fontFamily="var(--font-mono)">
                          {meta.ret}
                        </text>
                      </g>
                    );
                  }}
                  activeDot={{ r:7, fill:GOLD, stroke:"#1a1410", strokeWidth:2 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Event legend row */}
            <div style={{ display:"flex", gap:"1.5rem", marginTop:"0.875rem", flexWrap:"wrap",
              padding:"0.875rem 1rem", background:"var(--elevated)", borderRadius:8,
              border:"1px solid var(--border-c)" }}>
              {[
                { label:"1953: −3.8%", sub:"Post-war recession · 10 months", color:DOWN },
                { label:"1954: +43.9%", sub:"Greatest single-year recovery", color:UP },
                { label:"1957: −12.8%", sub:"Eisenhower recession · 8 months", color:DOWN },
                { label:"1958: +34.0%", sub:"Second extraordinary recovery", color:UP },
              ].map(a => (
                <div key={a.label} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:9, height:9, borderRadius:"50%", background:a.color,
                    display:"inline-block", flexShrink:0,
                    boxShadow:`0 0 6px ${a.color}60` }} />
                  <div>
                    <div style={{ fontSize:"0.6875rem", fontWeight:800, color:a.color,
                      fontFamily:"var(--font-mono)" }}>{a.label}</div>
                    <div style={{ fontSize:"0.5625rem", color:"var(--text-3)", marginTop:1 }}>{a.sub}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:24, height:2, background:GOLD, borderRadius:2 }} />
                <span style={{ fontSize:"0.5625rem", color:"var(--text-3)" }}>Dow Jones level</span>
              </div>
            </div>
          </div>

          {/* SECTION 5 — Decade comparison bar chart */}
          <div style={{ background:"var(--surface)", border:"1px solid var(--border-c)", borderRadius:14, padding:"1.5rem", backdropFilter:"blur(8px)" }}>
            <div style={{ marginBottom:"1rem" }}>
              <div style={{ fontSize:"0.875rem", fontWeight:700, color:"var(--text-1)", marginBottom:2 }}>
                Average Annual Dow Return by Decade: 1920s — 2020s
              </div>
              <div style={{ fontSize:"0.6875rem", color:"var(--text-3)" }}>
                1950s highlighted · The 1990s led at 15.9% — without a war, recession, or inflation
              </div>
            </div>
            <ResponsiveContainer width="100%" height={310}>
              <BarChart data={DECADE_COMPS} layout="vertical" margin={{ left:0, right:60, top:5, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" horizontal={false} />
                <XAxis type="number" tick={{ fill:"var(--text-3)", fontSize:10 }} tickLine={false}
                  tickFormatter={v => `${v > 0 ? "+" : ""}${v}%`} domain={[-5, 20]} />
                <YAxis type="category" dataKey="dec" tick={{ fill:"var(--text-2)", fontSize:10 }}
                  tickLine={false} width={48} />
                <Tooltip contentStyle={TT_STYLE}
                  labelStyle={{ color:"#f0e8d8", fontWeight:700 }}
                  itemStyle={{ color:"#f0e8d8" }}
                  formatter={v => [`${v > 0 ? "+" : ""}${v}%`, "Avg Annual Return"]} />
                <ReferenceLine x={0} stroke="var(--text-3)" strokeWidth={0.5} />
                <Bar dataKey="ret" radius={[0,3,3,0]}>
                  {DECADE_COMPS.map((d, i) => (
                    <Cell key={i}
                      fill={d.hi ? GOLD : d.ret < 0 ? DOWN : "rgba(201,169,110,0.32)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* SECTION 6 — Editorial investor lessons */}
          <div style={{ background:"var(--surface)", border:"1px solid var(--border-c)", borderRadius:14, padding:"1.5rem 2rem", backdropFilter:"blur(8px)" }}>
            <div style={{ fontSize:"0.875rem", fontWeight:700, color:"var(--text-1)", marginBottom:"1.5rem" }}>
              Five Investor Lessons from the 1950s
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
              {FIFTIES_LESSONS.map((l, i) => (
                <div key={l.n} style={{ display:"flex", gap:"1.75rem", alignItems:"flex-start",
                  paddingBottom: i < FIFTIES_LESSONS.length - 1 ? "1.5rem" : 0,
                  borderBottom: i < FIFTIES_LESSONS.length - 1 ? "1px solid var(--border-c)" : "none" }}>
                  <div style={{ fontSize:"3rem", fontWeight:900, color:`${GOLD}25`,
                    fontFamily:"var(--font-mono)", lineHeight:1, flexShrink:0, width:60, letterSpacing:"-0.02em" }}>
                    {l.n}
                  </div>
                  <div>
                    <div style={{ fontSize:"0.9375rem", fontWeight:700, color:"var(--text-1)", marginBottom:"0.5rem" }}>
                      {l.title}
                    </div>
                    <div style={{ fontSize:"0.8125rem", color:"var(--text-2)", lineHeight:1.75 }}>
                      {l.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 7 — Bottom line pullquote */}
          <div style={{ background:`rgba(201,169,110,0.04)`, border:`1px solid rgba(201,169,110,0.18)`,
            borderRadius:14, padding:"2rem 2.25rem" }}>
            <div style={{ fontSize:"0.5rem", fontWeight:800, letterSpacing:"0.18em",
              color:GOLD, textTransform:"uppercase", marginBottom:"1.25rem" }}>
              The Bottom Line
            </div>
            <div style={{ fontSize:"1.0625rem", fontWeight:500, color:"var(--text-1)", lineHeight:1.85,
              maxWidth:700, fontStyle:"italic", fontFamily:"'Playfair Display', Georgia, serif", paddingTop:"0.125rem" }}>
              The 1950s proved that the stock market is not a barometer of current events. It is a
              discounting mechanism for future earnings. Every headwind that decade was real, serious,
              and frightening in the moment. None of them stopped the compounding of American enterprise.
            </div>
            <div style={{ marginTop:"1.75rem", display:"flex", gap:"3rem", flexWrap:"wrap",
              paddingTop:"1.25rem", borderTop:"1px solid var(--border-c)" }}>
              <div>
                <div style={{ fontSize:"0.5rem", fontWeight:700, letterSpacing:"0.12em",
                  color:"var(--text-3)", textTransform:"uppercase", marginBottom:4 }}>
                  $100 in 1950 — by 2026
                </div>
                <div style={{ fontSize:"1.75rem", fontWeight:900, color:GOLD, fontFamily:"var(--font-mono)" }}>
                  $396,719
                </div>
              </div>
              <div>
                <div style={{ fontSize:"0.5rem", fontWeight:700, letterSpacing:"0.12em",
                  color:"var(--text-3)", textTransform:"uppercase", marginBottom:4 }}>
                  The principle
                </div>
                <div style={{ fontSize:"0.9375rem", fontWeight:700, color:"var(--text-1)", maxWidth:360, lineHeight:1.5 }}>
                  Time in the market, not timing the market.
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
      </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function MarketHistory() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const marketEnvRef = useRef(null);
  const wisdomIdx = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000) % WISDOM.length;

  const handleMarketEnvClick = (ev) => {
    setSelectedEvent(ev);
    setTimeout(() => {
      marketEnvRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div>
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        borderRadius: 20, padding: "2rem 2.25rem",
        marginBottom: "1.25rem", position: "relative", overflow: "hidden",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 var(--border-c)",
      }}>
        <div style={{ position: "absolute", top: -80, right: -60, width: 400, height: 400, background: "radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 68%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.875rem" }}>
            <div style={{ width: 20, height: 1, background: "var(--gold)", opacity: 0.55 }} />
            <p style={{ fontSize: "0.5625rem", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--gold)", margin: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>
              Terminal · Markets
            </p>
          </div>
          <h1 style={{ margin: "0 0 0.625rem", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--text-1)", lineHeight: 1.05, fontFamily: "'Inter', system-ui, sans-serif", display: "flex", alignItems: "baseline", gap: "0.375rem", flexWrap: "wrap" }}>
            <span>Market</span>
            <em style={{ fontStyle: "italic", color: "var(--gold)", fontFamily: "'Playfair Display', Georgia, serif" }}>History</em>
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-3)", lineHeight: 1.75, maxWidth: 560, margin: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>
            Explore decades of market history. Visualize how the Dow Jones, S&P 500, and NASDAQ have performed through recessions, bull markets, and major economic events.
          </p>
        </div>
      </div>

      {/* Long-term chart — self-contained, chips open mini panel */}
      <LongTermChart onMarketEnvClick={handleMarketEnvClick} />

      {/* Wisdom bar */}
      <div style={{ background:`rgba(201,169,110,0.04)`, border:`1px solid rgba(201,169,110,0.18)`,
        borderRadius:10, padding:"0.875rem 1.25rem",
        display:"flex", alignItems:"center", gap:"0.875rem", marginBottom:"1.25rem" }}>
        <div style={{ width:28, height:28, borderRadius:7, background:"rgba(201,169,110,0.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <TrendingUp size={14} color={GOLD} />
        </div>
        <div>
          <div style={{ fontSize:"0.5625rem", fontWeight:700, letterSpacing:"0.18em",
            textTransform:"uppercase", color:GOLD, marginBottom:3, fontFamily:"'Inter', system-ui, sans-serif" }}>
            Market Wisdom of the Day
          </div>
          <div style={{ fontSize:"0.8125rem", color:"var(--text-2)", lineHeight:1.6, fontFamily:"'Inter', system-ui, sans-serif" }}>
            {WISDOM[wisdomIdx]}
          </div>
        </div>
      </div>

      {/* Event detail panel (if open) */}
      {selectedEvent && (
        <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {/* Market Environments header */}
      <div ref={marketEnvRef} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.875rem" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.25rem" }}>
            <div style={{ width:16, height:1, background:"var(--gold)", opacity:0.5 }} />
            <span style={{ fontSize:"0.5rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--gold)", fontFamily:"'Inter', system-ui, sans-serif" }}>Explore</span>
          </div>
          <div style={{ fontSize:"1.125rem", fontWeight:800, color:"var(--text-1)", fontFamily:"'Inter', system-ui, sans-serif", letterSpacing:"-0.02em" }}>
            Market <em style={{ fontStyle:"italic", color:"var(--gold)", fontFamily:"'Playfair Display', Georgia, serif" }}>Environments</em>
          </div>
        </div>
        <div style={{ fontSize:"0.6875rem", color:"var(--text-3)", fontFamily:"'Inter', system-ui, sans-serif" }}>
          Click any event to explore the full breakdown
        </div>
      </div>

      {/* Event cards */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:"0.75rem", marginBottom:"1.25rem" }}>
        {MARKET_EVENTS.map(ev => (
          <EventCard key={ev.id} event={ev}
            isSelected={selectedEvent?.id === ev.id}
            onClick={() => setSelectedEvent(prev => prev?.id === ev.id ? null : ev)}
          />
        ))}
      </div>

      {/* ── Decade in Focus ──────────────────────────────────────── */}
      <div style={{ borderTop:"1px solid var(--border-c)", paddingTop:"1.25rem", marginTop:"0.5rem" }}>
        <DecadesPanel />
      </div>
    </div>
  );
}
