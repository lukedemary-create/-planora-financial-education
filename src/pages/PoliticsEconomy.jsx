import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, ReferenceLine, PieChart, Pie,
} from "recharts";
import {
  Landmark, TrendingUp, DollarSign, Users, BarChart2,
  AlertTriangle, CheckCircle, BookOpen, Scale, Activity,
  FileText, Award, ChevronDown, ChevronUp, ArrowRight,
} from "lucide-react";

const SERVER = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/* ─── Colors ──────────────────────────────────────────────────────── */
const GOLD  = "#c9a84c";
const DEM   = "#4c7fcf";
const REP   = "#cf4c4c";
const GREEN = "#4caf7d";
const TEAL  = "#4dd0c4";
const PURP  = "#9b6cdb";
const ORNG  = "#e07c3a";

const pc = (p) => (p === "D" ? DEM : REP);

/* ─── Formatters ──────────────────────────────────────────────────── */
const fcB  = (n) => n >= 1000 ? `$${(n/1000).toFixed(1)}T` : `$${n}B`;
const pct  = (n, d=1) => n == null ? "N/A" : `${n>0?"+":""}${Number(n).toFixed(d)}%`;
const fmt$ = (n) => n == null ? "N/A" : n >= 1e12 ? `$${(n/1e12).toFixed(2)}T` : n >= 1e9 ? `$${(n/1e9).toFixed(1)}B` : `$${n?.toLocaleString()}`;

/* ─── Live Debt ───────────────────────────────────────────────────── */
// Fallback constants (used if FRED is unavailable)
const DEBT_FALLBACK_TS  = new Date("2026-01-01").getTime();
const DEBT_FALLBACK_VAL = 36_200_000_000_000;
const DEBT_PER_SEC      = 1_000_000_000_000 / (100 * 24 * 3600); // ~$115,741/sec
const US_POP            = 335_000_000;
const NOMINAL_GDP       = 29_000_000_000_000;

// Will be updated by FRED fetch; starts with fallback
let _debtBase    = DEBT_FALLBACK_VAL;
let _debtBaseTS  = DEBT_FALLBACK_TS;

const getLiveDebt = () => _debtBase + ((Date.now() - _debtBaseTS) / 1000) * DEBT_PER_SEC;

// Fetch latest GFDEBTN from FRED and calibrate the ticker
// GFDEBTN is in millions of dollars, quarterly — safe fallback if anything fails
fetch(`${SERVER}/api/fred/GFDEBTN`)
  .then(r => r.json())
  .then(json => {
    const obs = (json.data || []).filter(o => o.value && o.value !== ".");
    if (obs.length === 0) return;
    const latest = obs[obs.length - 1]; // data is chronological, last = most recent
    const val = parseFloat(latest.value) * 1_000_000; // millions → dollars
    const ts  = new Date(latest.date).getTime();
    if (val > 1e12 && ts > 0) {
      _debtBase   = val;
      _debtBaseTS = ts;
    }
  })
  .catch(() => { /* silently keep fallback */ });

/* ─── Presidential Data ───────────────────────────────────────────── */
const PRESIDENTS = [
  { id:"fdr",     name:"Franklin D. Roosevelt", short:"FDR",       party:"D", yearStart:1933, yearEnd:1945, years:"1933–1945",
    vp:"Garner/Wallace/Truman", era:"New Deal & WWII",
    debtStart:22,    debtEnd:258,   debtAdded:236,  debtPct:1073,
    avgGDP:8.0,  gdpHigh:18.9, gdpLow:-3.3,
    unempStart:24.9, unempEnd:1.2,  unempAvg:14.6,  unempHigh:24.9, unempLow:1.2,
    inflAvg:2.5, inflHigh:13.0,
    dowStart:60,   dowEnd:192,  dowPct:220,
    fedFunds:0.5, avgDeficit:-33,
    summary:"Led the US through the Great Depression and WWII. New Deal programs and wartime mobilization drove unemployment from 24.9% to 1.2% while national debt grew tenfold.",
    improved:["Unemployment 24.9%→1.2%","GDP avg +8%/yr","Banking system stabilized","Social Security created"],
    declined:["Debt +1,073%","Wartime inflation","Required price controls"],
    keyEvents:[
      {year:1933,text:"Emergency Banking Act — ends bank runs",type:"positive"},
      {year:1933,text:"Unemployment peaks at 24.9%",type:"negative"},
      {year:1935,text:"Social Security Act signed",type:"positive"},
      {year:1937,text:"Roosevelt Recession — premature austerity",type:"negative"},
      {year:1941,text:"WWII mobilization — unemployment collapses",type:"positive"},
      {year:1944,text:"GI Bill signed",type:"positive"},
    ],
    gdpByYear:[{yr:"1933",v:-1.3},{yr:"1934",v:10.8},{yr:"1935",v:8.9},{yr:"1936",v:12.9},{yr:"1937",v:5.1},{yr:"1938",v:-3.3},{yr:"1939",v:8.0},{yr:"1940",v:8.8},{yr:"1941",v:17.7},{yr:"1942",v:18.9},{yr:"1943",v:17.0},{yr:"1944",v:8.0}],
  },
  { id:"truman",  name:"Harry S. Truman",         short:"Truman",    party:"D", yearStart:1945, yearEnd:1953, years:"1945–1953",
    vp:"Alben Barkley", era:"Postwar Boom",
    debtStart:258, debtEnd:266, debtAdded:8, debtPct:3,
    avgGDP:3.8, gdpHigh:8.7, gdpLow:-11.6,
    unempStart:1.9, unempEnd:2.7, unempAvg:4.2, unempHigh:6.1, unempLow:1.9,
    inflAvg:5.6, inflHigh:19.7,
    dowStart:192, dowEnd:281, dowPct:46,
    fedFunds:1.0, avgDeficit:-5,
    summary:"Managed postwar transition, Korean War, and a massive inflation spike. Kept debt nearly flat despite the Marshall Plan and wartime spending.",
    improved:["Debt nearly flat","Marshall Plan built export markets","Stock +46%"],
    declined:["Inflation peaked 19.7%","Korean War cost","Labor strikes"],
    keyEvents:[
      {year:1945,text:"WWII ends — 12M veterans return to economy",type:"neutral"},
      {year:1946,text:"Inflation surges to 18% as controls removed",type:"negative"},
      {year:1948,text:"Marshall Plan — $13B to rebuild Europe",type:"positive"},
      {year:1950,text:"Korean War begins",type:"negative"},
    ],
    gdpByYear:[{yr:"1945",v:-1.0},{yr:"1946",v:-11.6},{yr:"1947",v:-1.1},{yr:"1948",v:4.1},{yr:"1949",v:-0.6},{yr:"1950",v:8.7},{yr:"1951",v:8.0},{yr:"1952",v:3.7}],
  },
  { id:"ike",     name:"Dwight D. Eisenhower",    short:"Eisenhower",party:"R", yearStart:1953, yearEnd:1961, years:"1953–1961",
    vp:"Richard Nixon", era:"Cold War Prosperity",
    debtStart:266, debtEnd:289, debtAdded:23, debtPct:9,
    avgGDP:3.0, gdpHigh:7.1, gdpLow:-0.7,
    unempStart:2.7, unempEnd:5.5, unempAvg:5.0, unempHigh:6.8, unempLow:2.7,
    inflAvg:1.5, inflHigh:3.7,
    dowStart:281, dowEnd:615, dowPct:119,
    fedFunds:2.5, avgDeficit:-2,
    summary:"Stable postwar prosperity with near-balanced budgets. Launched the Interstate Highway System, kept inflation at historic lows.",
    improved:["Inflation avg 1.5%","Budget near balance","Stock +119%","Interstate highway built"],
    declined:["Unemployment ended higher","Two recessions (1954,1957)"],
    keyEvents:[
      {year:1953,text:"Korean War ends — peace dividend",type:"positive"},
      {year:1954,text:"Recession — GDP contracts",type:"negative"},
      {year:1956,text:"Federal Highway Act — $25B interstate system",type:"positive"},
      {year:1957,text:"Second recession + Sputnik shock",type:"negative"},
    ],
    gdpByYear:[{yr:"1953",v:4.6},{yr:"1954",v:-0.6},{yr:"1955",v:7.1},{yr:"1956",v:2.1},{yr:"1957",v:2.1},{yr:"1958",v:-0.7},{yr:"1959",v:6.9},{yr:"1960",v:2.6}],
  },
  { id:"jfk",     name:"John F. Kennedy",          short:"JFK",       party:"D", yearStart:1961, yearEnd:1963, years:"1961–1963",
    vp:"Lyndon B. Johnson", era:"New Frontier",
    debtStart:289, debtEnd:306, debtAdded:17, debtPct:6,
    avgGDP:4.3, gdpHigh:6.1, gdpLow:2.6,
    unempStart:6.6, unempEnd:5.5, unempAvg:6.0, unempHigh:6.7, unempLow:5.5,
    inflAvg:1.2, inflHigh:1.7,
    dowStart:615, dowEnd:762, dowPct:24,
    fedFunds:2.9, avgDeficit:-6,
    summary:"Short presidency with strong GDP growth and proposed major tax cuts. Inherited a recession and reduced unemployment before assassination in 1963.",
    improved:["GDP avg 4.3%","Unemployment fell 1.1pts","Low inflation"],
    declined:["Modest debt increase"],
    keyEvents:[
      {year:1961,text:"Apollo program launched — $25B space investment",type:"positive"},
      {year:1962,text:"Trade Expansion Act boosts exports",type:"positive"},
      {year:1963,text:"Major tax cut legislation proposed",type:"positive"},
    ],
    gdpByYear:[{yr:"1961",v:2.6},{yr:"1962",v:6.1},{yr:"1963",v:4.4}],
  },
  { id:"lbj",     name:"Lyndon B. Johnson",        short:"LBJ",       party:"D", yearStart:1963, yearEnd:1969, years:"1963–1969",
    vp:"Hubert Humphrey", era:"Great Society",
    debtStart:306, debtEnd:353, debtAdded:47, debtPct:15,
    avgGDP:5.3, gdpHigh:6.5, gdpLow:2.5,
    unempStart:5.2, unempEnd:3.4, unempAvg:4.2, unempHigh:5.7, unempLow:3.4,
    inflAvg:3.1, inflHigh:5.7,
    dowStart:762, dowEnd:943, dowPct:24,
    fedFunds:4.9, avgDeficit:-8,
    summary:"Strongest peacetime GDP growth of any modern president. Great Society created Medicare and Medicaid. Vietnam War spending ignited inflation that persisted for a decade.",
    improved:["GDP avg 5.3%","Unemployment 5.2%→3.4%","Medicare/Medicaid created"],
    declined:["Vietnam inflation seeds","Social unrest"],
    keyEvents:[
      {year:1964,text:"Tax cut + Civil Rights Act — economic boom",type:"positive"},
      {year:1965,text:"Medicare and Medicaid signed",type:"positive"},
      {year:1965,text:"Vietnam War escalation — $30B/yr added",type:"negative"},
      {year:1968,text:"Inflation rising — guns-and-butter strain",type:"negative"},
    ],
    gdpByYear:[{yr:"1964",v:5.8},{yr:"1965",v:6.4},{yr:"1966",v:6.5},{yr:"1967",v:2.5},{yr:"1968",v:4.8},{yr:"1969",v:3.1}],
  },
  { id:"nixon",   name:"Richard Nixon",            short:"Nixon",     party:"R", yearStart:1969, yearEnd:1974, years:"1969–1974",
    vp:"Agnew/Ford", era:"Nixon Shock",
    debtStart:353, debtEnd:475, debtAdded:122, debtPct:35,
    avgGDP:2.8, gdpHigh:5.6, gdpLow:-0.5,
    unempStart:3.4, unempEnd:5.6, unempAvg:5.5, unempHigh:5.9, unempLow:3.4,
    inflAvg:5.1, inflHigh:11.0,
    dowStart:943, dowEnd:832, dowPct:-12,
    fedFunds:6.7, avgDeficit:-17,
    summary:"Ended the gold standard, imposed wage/price controls, and faced the 1973 oil embargo. Stagflation — simultaneous high inflation and unemployment — began on his watch.",
    improved:["Opened trade with China","EPA created"],
    declined:["Gold standard ended","Stagflation began","Oil embargo recession","Debt +35%"],
    keyEvents:[
      {year:1971,text:"Nixon ends gold standard",type:"negative"},
      {year:1971,text:"Wage and price controls imposed",type:"neutral"},
      {year:1973,text:"OPEC oil embargo — gas prices quadruple",type:"negative"},
    ],
    gdpByYear:[{yr:"1969",v:3.1},{yr:"1970",v:0.2},{yr:"1971",v:3.3},{yr:"1972",v:5.3},{yr:"1973",v:5.6}],
  },
  { id:"ford",    name:"Gerald Ford",              short:"Ford",      party:"R", yearStart:1974, yearEnd:1977, years:"1974–1977",
    vp:"Nelson Rockefeller", era:"Recession Recovery",
    debtStart:475, debtEnd:620, debtAdded:145, debtPct:31,
    avgGDP:2.4, gdpHigh:5.4, gdpLow:-0.5,
    unempStart:5.6, unempEnd:7.5, unempAvg:7.7, unempHigh:9.0, unempLow:5.6,
    inflAvg:7.8, inflHigh:12.3,
    dowStart:832, dowEnd:1004, dowPct:21,
    fedFunds:6.7, avgDeficit:-53,
    summary:"Inherited Nixon's stagflation and the worst recession since WWII. 'Whip Inflation Now' campaign had limited effect. Unemployment peaked at 9%.",
    improved:["Recovery began by 1975","Stock market rebounded"],
    declined:["Unemployment peaked 9%","Inflation remained high","Debt +31%"],
    keyEvents:[
      {year:1974,text:"Inherits stagflation + deep recession",type:"negative"},
      {year:1975,text:"Unemployment peaks at 9%",type:"negative"},
      {year:1976,text:"Recovery — GDP growth returns",type:"positive"},
    ],
    gdpByYear:[{yr:"1974",v:-0.5},{yr:"1975",v:-0.2},{yr:"1976",v:5.4}],
  },
  { id:"carter",  name:"Jimmy Carter",             short:"Carter",    party:"D", yearStart:1977, yearEnd:1981, years:"1977–1981",
    vp:"Walter Mondale", era:"Energy Crisis",
    debtStart:620, debtEnd:994, debtAdded:374, debtPct:60,
    avgGDP:3.3, gdpHigh:5.5, gdpLow:-0.3,
    unempStart:7.5, unempEnd:7.2, unempAvg:6.5, unempHigh:7.8, unempLow:5.6,
    inflAvg:9.7, inflHigh:13.5,
    dowStart:1004, dowEnd:972, dowPct:-3,
    fedFunds:11.2, avgDeficit:-62,
    summary:"Faced energy crisis, stagflation, and Iran hostage crisis. Inflation hit 13.5%. Appointed Volcker as Fed Chair — the decision that ultimately defeated inflation under Reagan.",
    improved:["Appointed Volcker — ended inflation","Airline deregulation"],
    declined:["Inflation 13.5%","Interest rates 20%","Energy crisis","Debt +60%"],
    keyEvents:[
      {year:1977,text:"Energy crisis — oil prices spike",type:"negative"},
      {year:1979,text:"Second oil shock — Iran revolution",type:"negative"},
      {year:1979,text:"Volcker appointed as Fed Chair",type:"positive"},
      {year:1980,text:"Inflation peaks at 13.5%",type:"negative"},
    ],
    gdpByYear:[{yr:"1977",v:4.6},{yr:"1978",v:5.5},{yr:"1979",v:3.2},{yr:"1980",v:-0.3}],
  },
  { id:"reagan",  name:"Ronald Reagan",            short:"Reagan",    party:"R", yearStart:1981, yearEnd:1989, years:"1981–1989",
    vp:"George H.W. Bush", era:"Reaganomics",
    debtStart:994, debtEnd:2900, debtAdded:1906, debtPct:192,
    avgGDP:3.5, gdpHigh:7.2, gdpLow:-1.8,
    unempStart:7.2, unempEnd:5.3, unempAvg:7.4, unempHigh:10.8, unempLow:5.3,
    inflAvg:5.4, inflHigh:10.3,
    dowStart:972, dowEnd:2235, dowPct:130,
    fedFunds:9.0, avgDeficit:-185,
    summary:"Supply-side tax cuts and deregulation drove strong growth after a severe 1982 recession. Inflation beaten from 13.5% to 4%. National debt tripled.",
    improved:["Inflation 13.5%→4%","Unemployment 10.8%→5.3%","GDP strong post-recession","Stock +130%"],
    declined:["Debt tripled +192%","Record deficits","S&L crisis seeds"],
    keyEvents:[
      {year:1981,text:"ERTA — largest tax cut in US history at time",type:"positive"},
      {year:1982,text:"Severe recession — unemployment peaks 10.8%",type:"negative"},
      {year:1983,text:"Recovery — 'Morning in America'",type:"positive"},
      {year:1986,text:"Tax Reform Act simplifies code",type:"positive"},
      {year:1987,text:"Black Monday — stock market -22% in one day",type:"negative"},
    ],
    gdpByYear:[{yr:"1981",v:2.5},{yr:"1982",v:-1.8},{yr:"1983",v:4.6},{yr:"1984",v:7.2},{yr:"1985",v:4.2},{yr:"1986",v:3.5},{yr:"1987",v:3.5},{yr:"1988",v:4.2}],
  },
  { id:"ghwb",    name:"George H.W. Bush",         short:"Bush Sr.",  party:"R", yearStart:1989, yearEnd:1993, years:"1989–1993",
    vp:"Dan Quayle", era:"Gulf War & Recession",
    debtStart:2900, debtEnd:4400, debtAdded:1500, debtPct:52,
    avgGDP:2.3, gdpHigh:3.7, gdpLow:-0.1,
    unempStart:5.3, unempEnd:7.3, unempAvg:6.3, unempHigh:7.8, unempLow:5.3,
    inflAvg:4.2, inflHigh:6.3,
    dowStart:2235, dowEnd:3242, dowPct:45,
    fedFunds:6.7, avgDeficit:-267,
    summary:"S&L bailout, Gulf War, and a 1990-91 recession undermined reelection. Broke 'no new taxes' pledge — costly politically but fiscally responsible.",
    improved:["Gulf War success","Stock +45%","Budget Enforcement Act disciplined spending"],
    declined:["Recession 1990-91","Unemployment 5.3%→7.3%","S&L bailout $125B","Debt +52%"],
    keyEvents:[
      {year:1989,text:"S&L crisis — $125B+ bailout",type:"negative"},
      {year:1990,text:"Breaks 'no new taxes' pledge",type:"neutral"},
      {year:1991,text:"Recession + Gulf War",type:"negative"},
    ],
    gdpByYear:[{yr:"1989",v:3.7},{yr:"1990",v:1.9},{yr:"1991",v:-0.1},{yr:"1992",v:3.5}],
  },
  { id:"clinton", name:"Bill Clinton",             short:"Clinton",   party:"D", yearStart:1993, yearEnd:2001, years:"1993–2001",
    vp:"Al Gore", era:"Tech Boom & Surpluses",
    debtStart:4400, debtEnd:5700, debtAdded:1300, debtPct:30,
    avgGDP:3.9, gdpHigh:4.8, gdpLow:2.7,
    unempStart:7.3, unempEnd:4.2, unempAvg:5.2, unempHigh:7.3, unempLow:3.9,
    inflAvg:2.8, inflHigh:3.3,
    dowStart:3242, dowEnd:10587, dowPct:227,
    fedFunds:5.1, avgDeficit:3,
    summary:"Tech boom, welfare reform, and fiscal discipline produced the first budget surpluses since 1969. Unemployment fell to 3.9% and the stock market tripled.",
    improved:["Budget surpluses 1998-2001","Unemployment 7.3%→3.9%","Stock +227%","Lowest debt growth in decades"],
    declined:["NAFTA displaced manufacturing","GLB repealed Glass-Steagall","Dot-com bubble formed"],
    keyEvents:[
      {year:1993,text:"Budget Act — deficit reduction plan yields surpluses",type:"positive"},
      {year:1994,text:"NAFTA takes effect",type:"neutral"},
      {year:1998,text:"First surplus since 1969 — $70B",type:"positive"},
      {year:1999,text:"Gramm-Leach-Bliley repeals Glass-Steagall",type:"negative"},
      {year:2000,text:"Dot-com bubble peaks — NASDAQ 5,048",type:"negative"},
    ],
    gdpByYear:[{yr:"1993",v:2.8},{yr:"1994",v:4.0},{yr:"1995",v:2.7},{yr:"1996",v:3.8},{yr:"1997",v:4.5},{yr:"1998",v:4.5},{yr:"1999",v:4.8},{yr:"2000",v:4.1}],
  },
  { id:"gwb",     name:"George W. Bush",           short:"Bush Jr.",  party:"R", yearStart:2001, yearEnd:2009, years:"2001–2009",
    vp:"Dick Cheney", era:"9/11, Wars & Crisis",
    debtStart:5700, debtEnd:11900, debtAdded:6200, debtPct:109,
    avgGDP:2.1, gdpHigh:3.8, gdpLow:-2.5,
    unempStart:4.2, unempEnd:7.8, unempAvg:5.3, unempHigh:7.8, unempLow:4.2,
    inflAvg:2.7, inflHigh:5.6,
    dowStart:10587, dowEnd:7949, dowPct:-25,
    fedFunds:2.4, avgDeficit:-430,
    summary:"9/11, two wars, 2001/2003 tax cuts, and the 2008 financial crisis. Term ended with worst recession since the Great Depression and debt more than doubled.",
    improved:["Strong mid-decade growth","Medicare Part D created","TARP stabilized system"],
    declined:["Debt +109%","Great Recession","Stock -25%","Unemployment 4.2%→7.8%"],
    keyEvents:[
      {year:2001,text:"9/11 — $2T+ long-term economic cost",type:"negative"},
      {year:2001,text:"EGTRRA — $1.35T tax cut",type:"positive"},
      {year:2008,text:"Financial crisis — Lehman collapses",type:"negative"},
      {year:2008,text:"TARP — $700B bank bailout",type:"neutral"},
    ],
    gdpByYear:[{yr:"2001",v:1.0},{yr:"2002",v:1.7},{yr:"2003",v:2.9},{yr:"2004",v:3.8},{yr:"2005",v:3.5},{yr:"2006",v:2.9},{yr:"2007",v:1.9},{yr:"2008",v:-0.1}],
  },
  { id:"obama",   name:"Barack Obama",             short:"Obama",     party:"D", yearStart:2009, yearEnd:2017, years:"2009–2017",
    vp:"Joe Biden", era:"Great Recession Recovery",
    debtStart:11900, debtEnd:19900, debtAdded:8000, debtPct:67,
    avgGDP:2.3, gdpHigh:3.1, gdpLow:-2.5,
    unempStart:7.8, unempEnd:4.7, unempAvg:7.4, unempHigh:10.0, unempLow:4.7,
    inflAvg:1.7, inflHigh:3.8,
    dowStart:7949, dowEnd:19827, dowPct:150,
    fedFunds:0.5, avgDeficit:-971,
    summary:"Inherited worst recession since 1930s. Recovery Act prevented depression. ACA passed. Unemployment fell from 10% to 4.7% over 8 years. Debt grew due to stimulus and reduced revenue.",
    improved:["Unemployment 10%→4.7%","Stock +150%","ACA extended coverage to 20M+","Auto industry saved"],
    declined:["Debt +67%","Slowest recovery since WWII","Record early deficits"],
    keyEvents:[
      {year:2009,text:"Recovery Act — $831B stimulus",type:"positive"},
      {year:2009,text:"Unemployment peaks at 10%",type:"negative"},
      {year:2010,text:"ACA and Dodd-Frank passed",type:"positive"},
      {year:2016,text:"Unemployment falls to 4.7%",type:"positive"},
    ],
    gdpByYear:[{yr:"2009",v:-2.5},{yr:"2010",v:2.6},{yr:"2011",v:1.6},{yr:"2012",v:2.2},{yr:"2013",v:1.8},{yr:"2014",v:2.5},{yr:"2015",v:3.1},{yr:"2016",v:1.7}],
  },
  { id:"trump1",  name:"Donald Trump (1st Term)",  short:"Trump I",   party:"R", yearStart:2017, yearEnd:2021, years:"2017–2021",
    vp:"Mike Pence", era:"Tax Cuts & COVID",
    debtStart:19900, debtEnd:27800, debtAdded:7900, debtPct:40,
    avgGDP:1.5, gdpHigh:3.0, gdpLow:-2.8,
    unempStart:4.7, unempEnd:6.7, unempAvg:5.3, unempHigh:14.7, unempLow:3.5,
    inflAvg:1.9, inflHigh:2.9,
    dowStart:19827, dowEnd:30606, dowPct:54,
    fedFunds:1.5, avgDeficit:-1383,
    summary:"Tax Cuts & Jobs Act 2017 drove strong pre-COVID growth with unemployment hitting a 50-year low of 3.5%. COVID-19 caused the sharpest GDP collapse in history, then fastest recovery.",
    improved:["Unemployment hit 3.5% (50-yr low pre-COVID)","Strong GDP 2017-19","Stock strong pre-COVID"],
    declined:["COVID: GDP -31.4% annualized Q2 2020","Unemployment spiked 14.7%","Debt +40%"],
    keyEvents:[
      {year:2017,text:"Tax Cuts & Jobs Act — $1.5T tax cut",type:"positive"},
      {year:2019,text:"Unemployment falls to 3.5% — 50-year low",type:"positive"},
      {year:2020,text:"COVID-19 — GDP contracts 31.4% annualized",type:"negative"},
      {year:2020,text:"CARES Act — $2.2T stimulus",type:"positive"},
    ],
    gdpByYear:[{yr:"2017",v:2.3},{yr:"2018",v:3.0},{yr:"2019",v:2.2},{yr:"2020",v:-2.8}],
  },
  { id:"biden",   name:"Joe Biden",                short:"Biden",     party:"D", yearStart:2021, yearEnd:2025, years:"2021–2025",
    vp:"Kamala Harris", era:"COVID Recovery & Inflation",
    debtStart:27800, debtEnd:36200, debtAdded:8400, debtPct:30,
    avgGDP:3.0, gdpHigh:5.9, gdpLow:2.1,
    unempStart:6.7, unempEnd:4.1, unempAvg:4.4, unempHigh:6.7, unempLow:3.4,
    inflAvg:5.3, inflHigh:9.1,
    dowStart:30606, dowEnd:42544, dowPct:39,
    fedFunds:2.9, avgDeficit:-1730,
    summary:"Strong COVID recovery and low unemployment, but inflation hit 9.1% — highest since 1981. Three major investment bills passed. Fed raised rates 11 times.",
    improved:["Unemployment fell to 3.4%","GDP strong","$2.4T infrastructure+chips+climate"],
    declined:["Inflation peaked 9.1%","Debt +$8.4T","Record annual deficits"],
    keyEvents:[
      {year:2021,text:"American Rescue Plan — $1.9T",type:"positive"},
      {year:2022,text:"Inflation peaks at 9.1%",type:"negative"},
      {year:2022,text:"CHIPS Act + Inflation Reduction Act",type:"positive"},
      {year:2024,text:"Unemployment falls to 3.4%",type:"positive"},
    ],
    gdpByYear:[{yr:"2021",v:5.9},{yr:"2022",v:2.1},{yr:"2023",v:2.5},{yr:"2024",v:2.8}],
  },
  { id:"trump2",  name:"Donald Trump (2nd Term)",  short:"Trump II",  party:"R", yearStart:2025, yearEnd:2029, years:"2025–present",
    vp:"JD Vance", era:"Tariffs & DOGE",
    debtStart:36200, debtEnd:null, debtAdded:null, debtPct:null,
    avgGDP:null, gdpHigh:null, gdpLow:null,
    unempStart:4.1, unempEnd:null, unempAvg:null, unempHigh:null, unempLow:null,
    inflAvg:null, inflHigh:null,
    dowStart:42544, dowEnd:null, dowPct:null,
    fedFunds:null, avgDeficit:null,
    summary:"Second term in progress. Major focus: broad tariff program (10%+ on most imports), DOGE government efficiency initiative. Economic impact still being measured.",
    improved:["DOGE cost-cutting underway"],
    declined:["Tariff uncertainty affecting markets","Trade partner retaliation"],
    keyEvents:[
      {year:2025,text:"DOGE — Department of Government Efficiency launched",type:"neutral"},
      {year:2025,text:"Broad tariff program enacted",type:"neutral"},
    ],
    gdpByYear:[],
  },
];

/* ─── Historical series ───────────────────────────────────────────── */
const DEBT_HIST = [
  {year:1940,val:43},{year:1945,val:260},{year:1950,val:257},{year:1955,val:274},
  {year:1960,val:290},{year:1965,val:322},{year:1970,val:370},{year:1975,val:533},
  {year:1980,val:909},{year:1985,val:1800},{year:1990,val:3200},{year:1995,val:4900},
  {year:2000,val:5600},{year:2005,val:7900},{year:2010,val:13500},{year:2015,val:18100},
  {year:2020,val:27200},{year:2025,val:36200},
];

const DEBT_MILESTONES = [
  {label:"$1T", year:1982, president:"Reagan",   party:"R"},
  {label:"$2T", year:1986, president:"Reagan",   party:"R"},
  {label:"$4T", year:1992, president:"Bush Sr.", party:"R"},
  {label:"$5T", year:1996, president:"Clinton",  party:"D"},
  {label:"$10T",year:2008, president:"Bush Jr.", party:"R"},
  {label:"$15T",year:2011, president:"Obama",    party:"D"},
  {label:"$20T",year:2017, president:"Trump",    party:"R"},
  {label:"$25T",year:2020, president:"Trump",    party:"R"},
  {label:"$33T",year:2023, president:"Biden",    party:"D"},
  {label:"$36T",year:2025, president:"Trump II", party:"R"},
];

/* ─── Budget data ─────────────────────────────────────────────────── */
const REVENUE_DATA = [
  {name:"Individual Income Tax", value:49, color:GOLD},
  {name:"Payroll Taxes (FICA)",  value:36, color:DEM},
  {name:"Corporate Tax",         value:9,  color:GREEN},
  {name:"Excise Taxes",          value:3,  color:PURP},
  {name:"Other",                 value:3,  color:"#7a8899"},
];
const MANDATORY_DATA = [
  {name:"Social Security",     pct:35, dollars:1382, color:GOLD},
  {name:"Medicare",            pct:21, dollars:826,  color:DEM},
  {name:"Medicaid",            pct:15, dollars:592,  color:GREEN},
  {name:"Income Security",     pct:13, dollars:513,  color:PURP},
  {name:"Veterans Benefits",   pct:6,  dollars:237,  color:ORNG},
  {name:"Other Mandatory",     pct:10, dollars:394,  color:"#7a8899"},
];
const DISCRETIONARY_DATA = [
  {name:"Defense",             pct:50, dollars:886, color:REP},
  {name:"Health & Human Svcs",pct:13, dollars:230, color:DEM},
  {name:"Education",           pct:8,  dollars:142, color:GREEN},
  {name:"Transportation",      pct:6,  dollars:106, color:GOLD},
  {name:"Veterans Affairs",    pct:5,  dollars: 88, color:ORNG},
  {name:"Housing (HUD)",       pct:4,  dollars: 71, color:PURP},
  {name:"State/Foreign Aid",   pct:3,  dollars: 53, color:TEAL},
  {name:"Other Non-Defense",   pct:11, dollars:195, color:"#7a8899"},
];

/* ─── Legislation ─────────────────────────────────────────────────── */
const LEGISLATION = [
  {name:"New Deal",                      year:1933, president:"Roosevelt", party:"D", cat:"Social",
   summary:"Programs providing relief, recovery and reform during the Great Depression.",
   impact:"Unemployment fell 24.9%→10% by 1936. Created FDIC, SEC, Social Security, TVA.",
   outcome:"Significant relief provided. Full recovery only came with WWII mobilization."},
  {name:"GI Bill",                       year:1944, president:"Roosevelt", party:"D", cat:"Investment",
   summary:"Provided veterans with college, home loans, and unemployment benefits.",
   impact:"8M veterans attended college. Homeownership 44%→62% by 1960.",
   outcome:"Widely credited with building the American middle class."},
  {name:"Federal Highway Act",           year:1956, president:"Eisenhower",party:"R", cat:"Infrastructure",
   summary:"$25B to build 46,000-mile Interstate Highway System.",
   impact:"Generated $6 economic return per $1 invested. Transformed US commerce.",
   outcome:"Greatest infrastructure investment until 2021. Still foundational today."},
  {name:"Medicare & Medicaid",           year:1965, president:"Johnson",   party:"D", cat:"Healthcare",
   summary:"Federal health insurance for elderly (Medicare) and low-income (Medicaid).",
   impact:"Initially covered 40M+. Now covers 140M+ Americans.",
   outcome:"Largest social program expansion since Social Security."},
  {name:"Nixon Ends Gold Standard",      year:1971, president:"Nixon",     party:"R", cat:"Monetary",
   summary:"Ended Bretton Woods — dollar no longer convertible to gold.",
   impact:"Removed inflation anchor. Enabled more flexible monetary policy.",
   outcome:"Contributed to 1970s inflation. Also gave Fed more tools to manage economy."},
  {name:"Reagan Tax Cuts (ERTA)",        year:1981, president:"Reagan",    party:"R", cat:"Tax",
   summary:"Cut top marginal rate 70%→50%. Accelerated business depreciation.",
   impact:"Severe 1982 recession, then strong recovery. Inflation fell 13.5%→3%.",
   outcome:"GDP grew strongly. National debt tripled. Causation debate continues."},
  {name:"NAFTA",                         year:1994, president:"Clinton",   party:"D", cat:"Trade",
   summary:"Eliminated tariffs between US, Canada, and Mexico.",
   impact:"Trade with neighbors tripled. ~500K manufacturing jobs displaced.",
   outcome:"Boosted overall GDP. Created significant regional manufacturing losses."},
  {name:"Gramm-Leach-Bliley Act",        year:1999, president:"Clinton",   party:"D", cat:"Regulation",
   summary:"Repealed Glass-Steagall — allowed banks to offer investment services.",
   impact:"Enabled mega-bank mergers. Increased financial sector complexity.",
   outcome:"Critics blame for enabling 2008 crisis. Defenders dispute causation."},
  {name:"Bush Tax Cuts",                 year:2001, president:"Bush Jr.",  party:"R", cat:"Tax",
   summary:"Cut income rates across all brackets; reduced dividend/capital gains taxes.",
   impact:"Turned Clinton surpluses into deficits. Added $1.7T to debt over 10 years.",
   outcome:"Moderate growth stimulus. Significant long-term revenue reduction."},
  {name:"TARP Bailout",                  year:2008, president:"Bush Jr.",  party:"R", cat:"Financial",
   summary:"$700B Troubled Asset Relief Program — purchased toxic bank assets.",
   impact:"Stabilized financial system. Most funds were eventually recovered.",
   outcome:"Controversial but credited with preventing a second Great Depression."},
  {name:"Recovery Act (ARRA)",           year:2009, president:"Obama",     party:"D", cat:"Stimulus",
   summary:"$831B stimulus — tax cuts, infrastructure, extended unemployment.",
   impact:"CBO: saved/created 1.4–3.3M jobs. Recession ended mid-2009.",
   outcome:"Recovery slower than hoped but recession shorter than feared."},
  {name:"Affordable Care Act",           year:2010, president:"Obama",     party:"D", cat:"Healthcare",
   summary:"Required insurance, created exchanges, expanded Medicaid.",
   impact:"Uninsured rate fell 16%→8.6%. Slowed healthcare cost growth.",
   outcome:"20M+ gained coverage. Politically divisive. Costs still debated."},
  {name:"Dodd-Frank Act",                year:2010, president:"Obama",     party:"D", cat:"Regulation",
   summary:"Created CFPB, stress tests for banks, new derivatives oversight.",
   impact:"Strengthened bank capital. Created consumer financial protection.",
   outcome:"Banks more stable. Critics argue it reduced credit availability."},
  {name:"Tax Cuts and Jobs Act",         year:2017, president:"Trump",     party:"R", cat:"Tax",
   summary:"Cut corporate rate 35%→21%. Individual cuts mostly expire 2025.",
   impact:"Strong pre-COVID growth. Added $1.5T+ to debt over 10 years.",
   outcome:"GDP growth strong 2018-19. Corporate investment results mixed."},
  {name:"CARES Act",                     year:2020, president:"Trump",     party:"R", cat:"Stimulus",
   summary:"$2.2T COVID relief — PPP loans, stimulus checks, boosted unemployment.",
   impact:"Prevented deeper recession. PPP saved ~1.4M businesses.",
   outcome:"Fastest major stimulus in history. Contributed to post-COVID inflation."},
  {name:"Infrastructure & Jobs Act",     year:2021, president:"Biden",     party:"D", cat:"Infrastructure",
   summary:"$1.2T for roads, bridges, broadband, rail, water, EV charging.",
   impact:"Largest infrastructure investment since 1956 Highway Act.",
   outcome:"Implementation ongoing. Long-term economic impact still developing."},
  {name:"CHIPS and Science Act",         year:2022, president:"Biden",     party:"D", cat:"Investment",
   summary:"$280B for domestic semiconductor manufacturing and R&D.",
   impact:"$500B+ in private sector chip fab investments announced.",
   outcome:"TSMC, Samsung, Intel building US factories — strategic supply chain."},
  {name:"Inflation Reduction Act",       year:2022, president:"Biden",     party:"D", cat:"Climate",
   summary:"$750B for climate, healthcare costs, IRS enforcement.",
   impact:"Largest climate investment in US history. Capped insulin at $35/mo.",
   outcome:"Clean energy surging. Deficit reduction estimates vary widely."},
];

/* ─── Shared UI ───────────────────────────────────────────────────── */
function KPI({label, value, sub, color=GOLD, icon:Icon=DollarSign}) {
  return (
    <div className="t-card" style={{padding:"1rem"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.4rem"}}>
        <span style={{fontSize:"0.6rem",color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:700}}>{label}</span>
        <Icon size={12} color={color} style={{opacity:0.7}}/>
      </div>
      <div style={{fontSize:"1.15rem",fontWeight:900,color,fontFamily:"var(--font-mono)",lineHeight:1}}>{value}</div>
      {sub && <div style={{fontSize:"0.63rem",color:"var(--text-3)",marginTop:"0.25rem"}}>{sub}</div>}
    </div>
  );
}

function PartyBadge({party}) {
  return (
    <span style={{padding:"0.15rem 0.5rem",borderRadius:4,background:pc(party)+"22",border:`1px solid ${pc(party)}44`,fontSize:"0.62rem",fontWeight:700,color:pc(party)}}>
      {party==="D"?"Democrat":"Republican"}
    </span>
  );
}

function SectionTitle({children}) {
  return <div style={{fontSize:"0.82rem",fontWeight:800,color:"var(--text-1)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.75rem"}}>{children}</div>;
}

const CustomTip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:"var(--surface)",border:"1px solid var(--border-alt)",borderRadius:6,padding:"0.5rem 0.8rem",fontSize:"0.72rem"}}>
      <div style={{color:"var(--text-3)",marginBottom:3}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color||GOLD,fontFamily:"var(--font-mono)"}}>
          {p.name}: {typeof p.value==="number"?(Math.abs(p.value)<100?p.value.toFixed(2):p.value.toLocaleString()):p.value}
        </div>
      ))}
    </div>
  );
};

const DISCLAIMER = () => (
  <div style={{marginTop:"1.5rem",padding:"0.65rem 0.9rem",background:"rgba(201,169,110,0.05)",borderRadius:6,border:"1px solid rgba(201,169,110,0.12)",fontSize:"0.63rem",color:"var(--text-3)",lineHeight:1.6}}>
    <strong style={{color:"var(--gold)"}}>Data Sources: </strong>
    Federal Reserve (FRED), Congressional Budget Office, Bureau of Labor Statistics, Bureau of Economic Analysis, US Treasury.
    Economic outcomes reflect complex interactions between policy, global events, Federal Reserve decisions, and economic cycles across administrations.
    Planora does not endorse any political party or candidate.
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   TAB 1 — COMMAND CENTER
══════════════════════════════════════════════════════════════════ */
function TabCommand() {
  const [debt, setDebt] = useState(getLiveDebt);
  useEffect(() => {
    const t = setInterval(() => setDebt(getLiveDebt()), 1000);
    return () => clearInterval(t);
  }, []);

  const debtPerCitizen = debt / US_POP;
  const debtPctGDP = (debt / NOMINAL_GDP * 100);

  const debtStr = debt.toLocaleString("en-US", {maximumFractionDigits:0});

  // GDP growth by president (for chart)
  const gdpChart = PRESIDENTS.filter(p=>p.avgGDP!=null).map(p=>({
    name:p.short, value:p.avgGDP, party:p.party,
  }));

  // Debt added by president
  const debtChart = PRESIDENTS.filter(p=>p.debtAdded!=null).map(p=>({
    name:p.short, value:p.debtAdded, party:p.party,
  }));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>

      {/* Live Debt Counter */}
      <div className="t-card" style={{padding:"1.5rem",background:"linear-gradient(135deg,rgba(201,169,110,0.06) 0%,var(--surface) 60%)",border:"1px solid rgba(201,169,110,0.2)"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"0.65rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:"0.5rem"}}>
            🇺🇸 U.S. NATIONAL DEBT — LIVE COUNTER
          </div>
          <div style={{fontSize:"clamp(1.4rem,4vw,2.4rem)",fontWeight:900,color:GOLD,fontFamily:"var(--font-mono)",letterSpacing:"0.02em",lineHeight:1}}>
            ${debtStr}
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:"2rem",marginTop:"0.75rem",flexWrap:"wrap"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"0.6rem",color:"var(--text-3)"}}>Per Citizen</div>
              <div style={{fontSize:"0.95rem",fontWeight:900,color:REP,fontFamily:"var(--font-mono)"}}>
                ${Math.round(debtPerCitizen).toLocaleString()}
              </div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"0.6rem",color:"var(--text-3)"}}>% of GDP</div>
              <div style={{fontSize:"0.95rem",fontWeight:900,color:ORNG,fontFamily:"var(--font-mono)"}}>
                {debtPctGDP.toFixed(1)}%
              </div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"0.6rem",color:"var(--text-3)"}}>Growth Rate</div>
              <div style={{fontSize:"0.95rem",fontWeight:900,color:"var(--text-2)",fontFamily:"var(--font-mono)"}}>
                ~$115K/sec
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"0.65rem"}}>
        <KPI label="Current Debt" value={fmt$(debt)} sub="growing ~$1T per 100 days" color={GOLD} icon={TrendingUp}/>
        <KPI label="Debt / Citizen" value={`$${Math.round(debtPerCitizen).toLocaleString()}`} sub="based on 335M population" color={REP} icon={Users}/>
        <KPI label="Debt % of GDP" value={`${debtPctGDP.toFixed(1)}%`} sub="GDP ~$29T" color={ORNG} icon={BarChart2}/>
        <KPI label="Annual Deficit" value="~$1.8T" sub="FY2025 estimate" color={REP} icon={AlertTriangle}/>
        <KPI label="GDP (Nominal)" value="~$29T" sub="2024 estimate" color={GREEN} icon={TrendingUp}/>
        <KPI label="Unemployment" value="~4.1%" sub="early 2025" color={TEAL} icon={Users}/>
        <KPI label="White House" value="Republican" sub="Donald Trump (2025–)" color={REP} icon={Landmark}/>
        <KPI label="Senate" value="Republican" sub="53-47 majority" color={REP} icon={Landmark}/>
        <KPI label="House" value="Republican" sub="Narrow majority" color={REP} icon={Landmark}/>
      </div>

      {/* Charts row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
        {/* Debt history */}
        <div className="t-card" style={{padding:"1.25rem"}}>
          <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.75rem"}}>NATIONAL DEBT — 1940 TO PRESENT ($B)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={DEBT_HIST} margin={{left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)"/>
              <XAxis dataKey="year" tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`$${v/1000}T`:`$${v}B`}/>
              <Tooltip content={<CustomTip/>}/>
              <Area type="monotone" dataKey="val" name="Debt ($B)" stroke={GOLD} fill={GOLD} fillOpacity={0.15} strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* GDP by president */}
        <div className="t-card" style={{padding:"1.25rem"}}>
          <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.75rem"}}>AVG GDP GROWTH BY PRESIDENT</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gdpChart} margin={{left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)"/>
              <XAxis dataKey="name" tick={{fontSize:7.5,fill:"var(--text-3)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
              <Tooltip content={<CustomTip/>}/>
              <ReferenceLine y={0} stroke="var(--border-alt)"/>
              <Bar dataKey="value" name="Avg GDP %" radius={[3,3,0,0]}>
                {gdpChart.map((d,i)=><Cell key={i} fill={pc(d.party)} opacity={0.85}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Unemployment history */}
        <div className="t-card" style={{padding:"1.25rem"}}>
          <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.75rem"}}>UNEMPLOYMENT START VS END BY PRESIDENT</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PRESIDENTS.map(p=>({name:p.short,start:p.unempStart,end:p.unempEnd??p.unempStart,party:p.party}))} margin={{left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)"/>
              <XAxis dataKey="name" tick={{fontSize:7.5,fill:"var(--text-3)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
              <Tooltip content={<CustomTip/>}/>
              <Legend wrapperStyle={{fontSize:"0.65rem"}}/>
              <Bar dataKey="start" name="Start %" fill={TEAL} opacity={0.7} radius={[2,2,0,0]}/>
              <Bar dataKey="end"   name="End %"   fill={DEM}  opacity={0.85} radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Debt added by president */}
        <div className="t-card" style={{padding:"1.25rem"}}>
          <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.75rem"}}>DEBT ADDED BY PRESIDENT ($B)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={debtChart} margin={{left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)"/>
              <XAxis dataKey="name" tick={{fontSize:7.5,fill:"var(--text-3)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`$${v/1000}T`:`$${v}B`}/>
              <Tooltip content={<CustomTip/>}/>
              <Bar dataKey="value" name="Debt Added ($B)" radius={[3,3,0,0]}>
                {debtChart.map((d,i)=><Cell key={i} fill={pc(d.party)} opacity={0.85}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Debt milestone timeline */}
      <div className="t-card" style={{padding:"1.25rem"}}>
        <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.85rem"}}>DEBT MILESTONES — WHO WAS IN OFFICE</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem"}}>
          {DEBT_MILESTONES.map((m,i)=>(
            <div key={i} style={{flex:"0 0 auto",padding:"0.5rem 0.75rem",borderRadius:6,background:pc(m.party)+"18",border:`1px solid ${pc(m.party)}33`,minWidth:120}}>
              <div style={{fontSize:"1rem",fontWeight:900,color:pc(m.party),fontFamily:"var(--font-mono)"}}>{m.label}</div>
              <div style={{fontSize:"0.63rem",color:"var(--text-2)",marginTop:2}}>{m.year} · {m.president}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{display:"flex",gap:"1rem",alignItems:"center",padding:"0.6rem 0.85rem",background:"var(--elevated)",borderRadius:6,fontSize:"0.65rem",color:"var(--text-3)"}}>
        <span style={{color:DEM,fontWeight:700}}>■ Democrat</span>
        <span style={{color:REP,fontWeight:700}}>■ Republican</span>
        <span>Color identifies party — not a value judgment. Economic outcomes are influenced by many factors beyond presidential policy.</span>
      </div>
      <DISCLAIMER/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 2 — PRESIDENTIAL REPORT CARDS
══════════════════════════════════════════════════════════════════ */
function TabPresidents() {
  const [selected, setSelected] = useState(null);
  const p = selected ? PRESIDENTS.find(x=>x.id===selected) : null;

  if (p) {
    const eventColor = {positive:GREEN, negative:REP, neutral:GOLD};
    return (
      <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
          <button onClick={()=>setSelected(null)} className="t-btn" style={{fontSize:"0.72rem"}}>← All Presidents</button>
          <PartyBadge party={p.party}/>
          <span style={{fontSize:"0.65rem",color:"var(--text-3)"}}>{p.years} · VP: {p.vp}</span>
        </div>

        {/* Header */}
        <div className="t-card" style={{padding:"1.25rem",border:`1px solid ${pc(p.party)}40`,borderTop:`2px solid ${pc(p.party)}`}}>
          <div style={{fontSize:"1.25rem",fontWeight:900,color:"var(--text-1)"}}>{p.name}</div>
          <div style={{fontSize:"0.75rem",color:"var(--text-3)",marginTop:4}}>{p.era}</div>
          <div style={{fontSize:"0.78rem",color:"var(--text-2)",marginTop:"0.6rem",lineHeight:1.6}}>{p.summary}</div>
        </div>

        {/* KPI grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:"0.65rem"}}>
          <KPI label="Debt Start"     value={fcB(p.debtStart)}          color={GOLD}  icon={DollarSign}/>
          <KPI label="Debt End"       value={p.debtEnd?fcB(p.debtEnd):"In progress"} color={GOLD} icon={DollarSign}/>
          <KPI label="Debt Added"     value={p.debtAdded?fcB(p.debtAdded):"TBD"}     color={p.debtAdded>500?REP:ORNG} icon={TrendingUp}/>
          <KPI label="Debt % Change"  value={p.debtPct!=null?`+${p.debtPct}%`:"TBD"} color={ORNG} icon={BarChart2}/>
          <KPI label="Avg GDP Growth" value={p.avgGDP!=null?`${p.avgGDP}%`:"TBD"}   color={p.avgGDP>3?GREEN:ORNG} icon={TrendingUp}/>
          <KPI label="Avg Unemploy."  value={p.unempAvg!=null?`${p.unempAvg}%`:"TBD"} color={TEAL} icon={Users}/>
          <KPI label="Unemp. Start"   value={`${p.unempStart}%`}        color={TEAL}  icon={Users}/>
          <KPI label="Unemp. End"     value={p.unempEnd!=null?`${p.unempEnd}%`:"TBD"} color={p.unempEnd<p.unempStart?GREEN:REP} icon={Users}/>
          <KPI label="Avg Inflation"  value={p.inflAvg!=null?`${p.inflAvg}%`:"TBD"} color={PURP} icon={BarChart2}/>
          <KPI label="Inflation High" value={p.inflHigh!=null?`${p.inflHigh}%`:"TBD"} color={REP} icon={AlertTriangle}/>
          <KPI label="Dow Start"      value={p.dowStart?`${p.dowStart.toLocaleString()}`:"—"} color={GOLD} icon={TrendingUp}/>
          <KPI label="Dow % Change"   value={p.dowPct!=null?pct(p.dowPct):"TBD"} color={p.dowPct>=0?GREEN:REP} icon={TrendingUp}/>
        </div>

        {/* Charts */}
        {p.gdpByYear.length > 0 && (
          <div className="t-card" style={{padding:"1.25rem"}}>
            <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.75rem"}}>GDP GROWTH DURING TERM (%)</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={p.gdpByYear} margin={{left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)"/>
                <XAxis dataKey="yr" tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
                <Tooltip content={<CustomTip/>}/>
                <ReferenceLine y={0} stroke="var(--border-alt)"/>
                <Bar dataKey="v" name="GDP Growth %" radius={[3,3,0,0]}>
                  {p.gdpByYear.map((d,i)=><Cell key={i} fill={d.v>=0?GREEN:REP} opacity={0.85}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Events + improved/declined */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
          <div className="t-card" style={{padding:"1.25rem"}}>
            <div style={{fontSize:"0.72rem",fontWeight:700,color:GREEN,marginBottom:"0.6rem"}}>IMPROVED</div>
            {p.improved.map((x,i)=>(
              <div key={i} style={{display:"flex",gap:"0.4rem",fontSize:"0.75rem",color:"var(--text-2)",marginBottom:"0.3rem"}}>
                <CheckCircle size={12} color={GREEN} style={{flexShrink:0,marginTop:2}}/>{x}
              </div>
            ))}
          </div>
          <div className="t-card" style={{padding:"1.25rem"}}>
            <div style={{fontSize:"0.72rem",fontWeight:700,color:REP,marginBottom:"0.6rem"}}>DECLINED / CHALLENGES</div>
            {p.declined.map((x,i)=>(
              <div key={i} style={{display:"flex",gap:"0.4rem",fontSize:"0.75rem",color:"var(--text-2)",marginBottom:"0.3rem"}}>
                <AlertTriangle size={12} color={ORNG} style={{flexShrink:0,marginTop:2}}/>{x}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="t-card" style={{padding:"1.25rem"}}>
          <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.75rem"}}>KEY ECONOMIC EVENTS</div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {p.keyEvents.map((e,i)=>(
              <div key={i} style={{display:"flex",gap:"0.75rem",alignItems:"flex-start"}}>
                <div style={{minWidth:38,fontSize:"0.65rem",fontWeight:700,color:pc(p.party),fontFamily:"var(--font-mono)",paddingTop:2}}>{e.year}</div>
                <div style={{width:3,minHeight:20,borderRadius:2,background:eventColor[e.type],flexShrink:0,marginTop:3}}/>
                <div style={{fontSize:"0.75rem",color:"var(--text-2)",lineHeight:1.5}}>{e.text}</div>
              </div>
            ))}
          </div>
        </div>
        <DISCLAIMER/>
      </div>
    );
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
      <SectionTitle>Presidential Economic Report Cards</SectionTitle>
      <div style={{fontSize:"0.75rem",color:"var(--text-3)"}}>Click any president to view their complete economic report card. Red = Republican, Blue = Democrat — used as party identifiers only.</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"0.65rem"}}>
        {PRESIDENTS.map(p=>(
          <button key={p.id} onClick={()=>setSelected(p.id)} style={{textAlign:"left",background:"var(--surface)",border:`1px solid ${pc(p.party)}33`,borderTop:`3px solid ${pc(p.party)}`,borderRadius:6,padding:"0.85rem",cursor:"pointer",transition:"border-color 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=pc(p.party)}
            onMouseLeave={e=>e.currentTarget.style.borderColor=`${pc(p.party)}33`}>
            <div style={{fontSize:"0.8rem",fontWeight:800,color:"var(--text-1)",marginBottom:2}}>{p.short}</div>
            <div style={{fontSize:"0.65rem",color:pc(p.party),fontWeight:700,marginBottom:4}}>{p.years}</div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.65rem",color:"var(--text-3)"}}>
              <span>GDP: <strong style={{color:p.avgGDP!=null?(p.avgGDP>3?GREEN:ORNG):"var(--text-3)"}}>{p.avgGDP!=null?`${p.avgGDP}%`:"TBD"}</strong></span>
              <span>Debt: <strong style={{color:GOLD}}>{p.debtAdded!=null?fcB(p.debtAdded):"TBD"}</strong></span>
            </div>
          </button>
        ))}
      </div>
      <DISCLAIMER/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 3 — PARTY COMPARISON
══════════════════════════════════════════════════════════════════ */
function TabComparison() {
  const dems = PRESIDENTS.filter(p=>p.party==="D"&&p.avgGDP!=null);
  const reps = PRESIDENTS.filter(p=>p.party==="R"&&p.avgGDP!=null);

  const avg = (arr,key) => arr.length ? (arr.reduce((s,p)=>s+(p[key]??0),0)/arr.length) : 0;

  const partyAvg = [
    {name:"Democrat", gdp:avg(dems,"avgGDP"), unemp:avg(dems,"unempAvg"), infl:avg(dems,"inflAvg"), dow:avg(dems,"dowPct")},
    {name:"Republican",gdp:avg(reps,"avgGDP"),unemp:avg(reps,"unempAvg"),infl:avg(reps,"inflAvg"),dow:avg(reps,"dowPct")},
  ];

  const debtByPres = PRESIDENTS.filter(p=>p.debtAdded!=null).map(p=>({
    name:p.short, value:p.debtAdded, pct:p.debtPct, party:p.party,
  })).sort((a,b)=>b.value-a.value);

  const fullTable = PRESIDENTS.filter(p=>p.avgGDP!=null);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
      {/* Disclaimer banner */}
      <div style={{padding:"0.75rem 1rem",background:"rgba(201,169,110,0.08)",borderRadius:6,border:"1px solid rgba(201,169,110,0.2)",fontSize:"0.72rem",color:"var(--text-2)",lineHeight:1.6}}>
        <strong style={{color:GOLD}}>Important Note: </strong>
        Economic outcomes are influenced by many factors beyond presidential party — global events, Congressional composition, Federal Reserve decisions, and economic cycles inherited from prior administrations. This data is presented for educational comparison only.
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
        {/* GDP comparison */}
        <div className="t-card" style={{padding:"1.25rem"}}>
          <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.75rem"}}>AVG GDP GROWTH BY PARTY (PRESIDENTIAL TERMS)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={partyAvg} margin={{left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)"/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:"var(--text-3)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v.toFixed(1)}%`}/>
              <Tooltip content={<CustomTip/>}/>
              <Bar dataKey="gdp" name="Avg GDP %" radius={[4,4,0,0]}>
                <Cell fill={DEM}/><Cell fill={REP}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inflation comparison */}
        <div className="t-card" style={{padding:"1.25rem"}}>
          <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.75rem"}}>AVG INFLATION BY PARTY</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={partyAvg} margin={{left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)"/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:"var(--text-3)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v.toFixed(1)}%`}/>
              <Tooltip content={<CustomTip/>}/>
              <Bar dataKey="infl" name="Avg Inflation %" radius={[4,4,0,0]}>
                <Cell fill={DEM}/><Cell fill={REP}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Debt added - horizontal bar ranked */}
      <div className="t-card" style={{padding:"1.25rem"}}>
        <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.75rem"}}>NATIONAL DEBT ADDED BY PRESIDENT (RANKED)</div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={debtByPres} layout="vertical" margin={{left:55,right:40}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)"/>
            <XAxis type="number" tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`$${v/1000}T`:`$${v}B`}/>
            <YAxis type="category" dataKey="name" tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={false} tickLine={false} width={55}/>
            <Tooltip content={<CustomTip/>}/>
            <Bar dataKey="value" name="Debt Added ($B)" radius={[0,4,4,0]}>
              {debtByPres.map((d,i)=><Cell key={i} fill={pc(d.party)} opacity={0.85}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{display:"flex",gap:"1rem",marginTop:"0.5rem",fontSize:"0.63rem"}}>
          <span style={{color:DEM}}>■ Democrat</span>
          <span style={{color:REP}}>■ Republican</span>
        </div>
      </div>

      {/* Full scorecard table */}
      <div className="t-card" style={{padding:"1.25rem"}}>
        <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.75rem"}}>FULL ECONOMIC SCORECARD — ALL PRESIDENTS</div>
        <div style={{overflowX:"auto"}}>
          <table className="t-table" style={{width:"100%",minWidth:720}}>
            <thead>
              <tr>
                <th style={{textAlign:"left",fontSize:"0.65rem"}}>President</th>
                <th style={{fontSize:"0.65rem"}}>Party</th>
                <th style={{fontSize:"0.65rem"}}>Years</th>
                <th style={{fontSize:"0.65rem",color:GREEN}}>GDP Avg</th>
                <th style={{fontSize:"0.65rem",color:TEAL}}>Unemp Δ</th>
                <th style={{fontSize:"0.65rem",color:GOLD}}>Debt Added</th>
                <th style={{fontSize:"0.65rem",color:PURP}}>Inflation</th>
                <th style={{fontSize:"0.65rem",color:ORNG}}>Dow Δ</th>
              </tr>
            </thead>
            <tbody>
              {fullTable.map(p=>(
                <tr key={p.id}>
                  <td style={{fontSize:"0.73rem",fontWeight:700,color:"var(--text-1)"}}>{p.short}</td>
                  <td><PartyBadge party={p.party}/></td>
                  <td style={{fontSize:"0.68rem",color:"var(--text-3)"}}>{p.years}</td>
                  <td style={{fontSize:"0.73rem",fontWeight:700,color:p.avgGDP>3?GREEN:ORNG,fontFamily:"var(--font-mono)"}}>{p.avgGDP}%</td>
                  <td style={{fontSize:"0.73rem",fontFamily:"var(--font-mono)",color:p.unempEnd<p.unempStart?GREEN:REP}}>
                    {p.unempEnd!=null?`${p.unempStart}→${p.unempEnd}%`:`${p.unempStart}%→`}
                  </td>
                  <td style={{fontSize:"0.73rem",fontFamily:"var(--font-mono)",color:GOLD}}>{p.debtAdded?fcB(p.debtAdded):"TBD"}</td>
                  <td style={{fontSize:"0.73rem",fontFamily:"var(--font-mono)",color:p.inflAvg>5?REP:PURP}}>{p.inflAvg??"-"}%</td>
                  <td style={{fontSize:"0.73rem",fontFamily:"var(--font-mono)",color:p.dowPct>=0?GREEN:REP}}>{p.dowPct!=null?pct(p.dowPct):"TBD"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <DISCLAIMER/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 4 — ECONOMIC PHILOSOPHY
══════════════════════════════════════════════════════════════════ */
function TabPhilosophy() {
  const debates = [
    {
      topic:"Tax Policy",
      dem:"Progressive rates — higher earners pay higher %, funds public services",
      rep:"Lower rates on investment — stimulates growth that benefits all levels",
      data:[
        {name:"1950s",top:91},{name:"1960s",top:77},{name:"1970s",top:70},
        {name:"1980s",top:50},{name:"1990s",top:39},{name:"2000s",top:35},
        {name:"2010s",top:39},{name:"2020s",top:37},
      ],
      dataLabel:"Top Marginal Income Tax Rate (%)",
    },
    {
      topic:"Government Spending",
      dem:"Keynesian: govt spending stimulates demand → growth → more revenue",
      rep:"Crowding out: govt spending competes with private investment, raises rates",
      data:[
        {name:"FDR",val:47},{name:"Ike",val:17},{name:"LBJ",val:31},{name:"Reagan",val:53},
        {name:"Clinton",val:14},{name:"Bush Jr",val:33},{name:"Obama",val:38},{name:"Biden",val:39},
      ],
      dataLabel:"Fed Spending Growth During Term (%)",
    },
    {
      topic:"Trade Policy",
      dem:"Mixed — free trade (Clinton/NAFTA) or protectionist (labor-focused)",
      rep:"Mixed — free trade (Reagan/Bush) or protectionist (Trump tariffs)",
      data:[
        {name:"1960",val:4},{name:"1975",val:4},{name:"1985",val:5},{name:"1995",val:5},
        {name:"2000",val:4},{name:"2010",val:3},{name:"2018",val:4},{name:"2025",val:13},
      ],
      dataLabel:"Effective US Tariff Rate (%) — approximate",
    },
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
      <SectionTitle>Economic Philosophy — How Each Party Approaches the Economy</SectionTitle>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
        {/* Democrat */}
        <div className="t-card" style={{padding:"1.25rem",borderTop:`3px solid ${DEM}`}}>
          <div style={{fontSize:"0.75rem",fontWeight:800,color:DEM,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.75rem"}}>Democratic Economic Philosophy</div>
          <div style={{fontSize:"0.72rem",color:"var(--text-2)",lineHeight:1.6,marginBottom:"0.75rem"}}>
            Generally rooted in <strong style={{color:DEM}}>Keynesian economics</strong> — government spending stimulates aggregate demand during downturns, investment in public goods creates long-run growth, and markets require guardrails to function fairly.
          </div>
          {[
            {label:"Progressive Taxation",desc:"Higher rates on top incomes fund public services and reduce inequality"},
            {label:"Public Investment",   desc:"Government spending on infrastructure, education, R&D creates growth"},
            {label:"Labor Protections",   desc:"Minimum wage, unions, worker safety — strengthen consumer spending"},
            {label:"Social Safety Net",   desc:"Unemployment, healthcare, food assistance as economic stabilizers"},
            {label:"Market Regulation",   desc:"Rules prevent monopoly, pollution, financial risk spillovers"},
          ].map((x,i)=>(
            <div key={i} style={{display:"flex",gap:"0.5rem",marginBottom:"0.4rem"}}>
              <div style={{width:3,borderRadius:2,background:DEM,flexShrink:0}}/>
              <div>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-1)"}}>{x.label}</div>
                <div style={{fontSize:"0.68rem",color:"var(--text-3)",lineHeight:1.4}}>{x.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Republican */}
        <div className="t-card" style={{padding:"1.25rem",borderTop:`3px solid ${REP}`}}>
          <div style={{fontSize:"0.75rem",fontWeight:800,color:REP,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.75rem"}}>Republican Economic Philosophy</div>
          <div style={{fontSize:"0.72rem",color:"var(--text-2)",lineHeight:1.6,marginBottom:"0.75rem"}}>
            Generally rooted in <strong style={{color:REP}}>supply-side economics</strong> — reducing taxes and regulations allows the private sector to invest, innovate, and grow, and that growth benefits all income levels through job creation and higher wages.
          </div>
          {[
            {label:"Tax Cuts",         desc:"Lower rates increase incentive to invest, work, and take risk"},
            {label:"Deregulation",     desc:"Fewer rules reduce compliance costs and unleash private innovation"},
            {label:"Spending Discipline",desc:"Smaller government reduces deficits, avoids crowding out private capital"},
            {label:"Free Markets",     desc:"Price signals allocate resources more efficiently than government"},
            {label:"Strong Defense",   desc:"Military investment supports security, technology, and jobs"},
          ].map((x,i)=>(
            <div key={i} style={{display:"flex",gap:"0.5rem",marginBottom:"0.4rem"}}>
              <div style={{width:3,borderRadius:2,background:REP,flexShrink:0}}/>
              <div>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-1)"}}>{x.label}</div>
                <div style={{fontSize:"0.68rem",color:"var(--text-3)",lineHeight:1.4}}>{x.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Policy debates */}
      {debates.map((d,i)=>(
        <div key={i} className="t-card" style={{padding:"1.25rem"}}>
          <div style={{fontSize:"0.78rem",fontWeight:800,color:"var(--text-1)",marginBottom:"0.75rem"}}>{d.topic}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"0.75rem"}}>
            <div style={{padding:"0.65rem 0.85rem",background:DEM+"18",borderRadius:6,border:`1px solid ${DEM}38`}}>
              <div style={{fontSize:"0.63rem",color:DEM,fontWeight:700,marginBottom:3}}>DEMOCRATIC VIEW</div>
              <div style={{fontSize:"0.72rem",color:"var(--text-2)",lineHeight:1.5}}>{d.dem}</div>
            </div>
            <div style={{padding:"0.65rem 0.85rem",background:REP+"18",borderRadius:6,border:`1px solid ${REP}38`}}>
              <div style={{fontSize:"0.63rem",color:REP,fontWeight:700,marginBottom:3}}>REPUBLICAN VIEW</div>
              <div style={{fontSize:"0.72rem",color:"var(--text-2)",lineHeight:1.5}}>{d.rep}</div>
            </div>
          </div>
          <div style={{fontSize:"0.65rem",color:"var(--text-3)",marginBottom:"0.4rem"}}>{d.dataLabel}</div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={d.data} margin={{left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)"/>
              <XAxis dataKey="name" tick={{fontSize:8,fill:"var(--text-3)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:8,fill:"var(--text-3)"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTip/>}/>
              <Bar dataKey={d.data[0].top!=null?"top":"val"} name={d.dataLabel} fill={GOLD} radius={[3,3,0,0]} opacity={0.8}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
      <DISCLAIMER/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 5 — NATIONAL DEBT
══════════════════════════════════════════════════════════════════ */
function TabDebt() {
  const [debt, setDebt] = useState(getLiveDebt);
  useEffect(()=>{const t=setInterval(()=>setDebt(getLiveDebt()),1000);return()=>clearInterval(t);},[]);

  const interestPayments = 1_100_000_000_000; // ~$1.1T annually
  const interestPctBudget = 16; // approx %

  const intlComparison = [
    {country:"Japan",    pct:263},{country:"Greece",  pct:168},{country:"Italy",   pct:142},
    {country:"USA",      pct:125},{country:"France",  pct:111},{country:"UK",      pct:101},
    {country:"Canada",   pct:107},{country:"Germany", pct:66}, {country:"Australia",pct:53},
  ];

  const causes = [
    {name:"Military & Wars",    value:25, color:REP},
    {name:"Tax Cuts",           value:22, color:ORNG},
    {name:"Social Programs",    value:20, color:DEM},
    {name:"Interest on Debt",   value:15, color:GOLD},
    {name:"Recessions/Stimulus",value:13, color:PURP},
    {name:"Other",              value:5,  color:"#7a8899"},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"0.65rem"}}>
        <KPI label="Current Total Debt"    value={fmt$(debt)} color={GOLD} icon={DollarSign}/>
        <KPI label="Debt % of GDP"         value={`${(debt/NOMINAL_GDP*100).toFixed(1)}%`} color={ORNG} icon={BarChart2}/>
        <KPI label="Annual Interest Cost"  value="~$1.1T" sub="now exceeds defense budget" color={REP} icon={AlertTriangle}/>
        <KPI label="Interest % of Budget"  value={`~${interestPctBudget}%`} sub="rising rapidly" color={REP} icon={TrendingUp}/>
        <KPI label="Debt Per Citizen"      value={`$${Math.round(debt/US_POP).toLocaleString()}`} color={GOLD} icon={Users}/>
        <KPI label="CBO 10-yr Projection"  value="~$48T" sub="by 2034 under current policy" color={REP} icon={TrendingUp}/>
      </div>

      {/* Debt history */}
      <div className="t-card" style={{padding:"1.25rem"}}>
        <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.75rem"}}>U.S. NATIONAL DEBT HISTORY — $BILLIONS (1940–2025)</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={DEBT_HIST} margin={{left:-10}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)"/>
            <XAxis dataKey="year" tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`$${v/1000}T`:`$${v}B`}/>
            <Tooltip content={<CustomTip/>}/>
            {DEBT_MILESTONES.map((m,i)=>(
              <ReferenceLine key={i} x={m.year} stroke={pc(m.party)} strokeDasharray="3 3" strokeOpacity={0.5}
                label={{value:m.label,position:"top",fontSize:7,fill:pc(m.party)}}/>
            ))}
            <Area type="monotone" dataKey="val" name="Debt ($B)" stroke={GOLD} fill={GOLD} fillOpacity={0.12} strokeWidth={2} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
        {/* Causes */}
        <div className="t-card" style={{padding:"1.25rem"}}>
          <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.75rem"}}>ESTIMATED CAUSES OF DEBT GROWTH (%)</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={causes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name,value})=>`${value}%`} labelLine={false}>
                {causes.map((c,i)=><Cell key={i} fill={c.color}/>)}
              </Pie>
              <Tooltip content={<CustomTip/>}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* International comparison */}
        <div className="t-card" style={{padding:"1.25rem"}}>
          <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.75rem"}}>DEBT-TO-GDP RATIO — INTERNATIONAL COMPARISON</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={intlComparison} layout="vertical" margin={{left:55}}>
              <XAxis type="number" tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
              <YAxis type="category" dataKey="country" tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={false} tickLine={false} width={60}/>
              <Tooltip content={<CustomTip/>}/>
              <Bar dataKey="pct" name="Debt/GDP %" radius={[0,4,4,0]}>
                {intlComparison.map((d,i)=><Cell key={i} fill={d.country==="USA"?GOLD:TEAL} opacity={d.country==="USA"?1:0.6}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestones */}
      <div className="t-card" style={{padding:"1.25rem"}}>
        <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.85rem"}}>DEBT MILESTONE TIMELINE</div>
        <div style={{position:"relative",paddingLeft:"2rem"}}>
          <div style={{position:"absolute",left:"0.85rem",top:0,bottom:0,width:2,background:"var(--border-c)"}}/>
          {DEBT_MILESTONES.map((m,i)=>(
            <div key={i} style={{position:"relative",marginBottom:"0.75rem"}}>
              <div style={{position:"absolute",left:"-1.6rem",top:4,width:12,height:12,borderRadius:"50%",background:pc(m.party),border:`2px solid var(--surface)`}}/>
              <div style={{display:"flex",alignItems:"baseline",gap:"0.6rem"}}>
                <span style={{fontSize:"1rem",fontWeight:900,color:pc(m.party),fontFamily:"var(--font-mono)"}}>{m.label}</span>
                <span style={{fontSize:"0.68rem",color:"var(--text-3)"}}>{m.year}</span>
                <span style={{fontSize:"0.68rem",color:"var(--text-2)"}}>· {m.president}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <DISCLAIMER/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 6 — WHERE MONEY GOES
══════════════════════════════════════════════════════════════════ */
function TabBudget() {
  const totalRevenue  = 4_900_000_000_000;
  const totalSpending = 6_750_000_000_000;
  const deficit       = totalSpending - totalRevenue;

  const dollarBreakdown = [
    {name:"Social Security",  cents:34, color:GOLD},
    {name:"Medicare/Medicaid",cents:22, color:DEM},
    {name:"Defense",          cents:14, color:REP},
    {name:"Interest on Debt", cents:16, color:ORNG},
    {name:"Other Mandatory",  cents:7,  color:PURP},
    {name:"Non-Defense Discr",cents:7,  color:TEAL},
  ];

  const foreignAidPerception = [
    {label:"What Americans think",value:25},
    {label:"Actual foreign aid %",value:1},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.65rem"}}>
        <KPI label="Total Revenue (FY2024)" value={fmt$(totalRevenue)} color={GREEN} icon={DollarSign}/>
        <KPI label="Total Spending"         value={fmt$(totalSpending)} color={REP} icon={TrendingUp}/>
        <KPI label="Annual Deficit"         value={fmt$(deficit)} sub="difference" color={REP} icon={AlertTriangle}/>
      </div>

      {/* Where money comes from */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
        <div className="t-card" style={{padding:"1.25rem"}}>
          <div style={{fontSize:"0.72rem",fontWeight:700,color:GREEN,marginBottom:"0.75rem"}}>WHERE MONEY COMES FROM (REVENUE)</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart margin={{top:16,right:16,bottom:16,left:16}}>
              <Pie data={REVENUE_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={80} innerRadius={32}
                labelLine={false}
                label={({cx,cy,midAngle,outerRadius,value})=>{
                  if(value<5) return null;
                  const R=Math.PI/180, r=outerRadius+22;
                  const x=cx+r*Math.cos(-midAngle*R), y=cy+r*Math.sin(-midAngle*R);
                  return <text x={x} y={y} fill="var(--text-2)" textAnchor={x>cx?'start':'end'} dominantBaseline="central" fontSize={10} fontWeight={700}>{value}%</text>;
                }}>
                {REVENUE_DATA.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip content={<CustomTip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem",marginTop:"0.5rem"}}>
            {REVENUE_DATA.map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"0.3rem",fontSize:"0.63rem",color:"var(--text-2)"}}>
                <div style={{width:8,height:8,borderRadius:2,background:d.color,flexShrink:0}}/>
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory vs discretionary */}
        <div className="t-card" style={{padding:"1.25rem"}}>
          <div style={{fontSize:"0.72rem",fontWeight:700,color:GOLD,marginBottom:"0.75rem"}}>SPENDING SPLIT</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart margin={{top:16,right:16,bottom:16,left:16}}>
              <Pie data={[{name:"Mandatory (~65%)",value:65,color:GOLD},{name:"Discretionary (~27%)",value:27,color:DEM},{name:"Interest (~8%)",value:8,color:REP}]}
                dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={80} innerRadius={32}
                labelLine={false}
                label={({cx,cy,midAngle,outerRadius,value})=>{
                  if(value<5) return null;
                  const R=Math.PI/180, r=outerRadius+22;
                  const x=cx+r*Math.cos(-midAngle*R), y=cy+r*Math.sin(-midAngle*R);
                  return <text x={x} y={y} fill="var(--text-2)" textAnchor={x>cx?'start':'end'} dominantBaseline="central" fontSize={10} fontWeight={700}>{value}%</text>;
                }}>
                {[GOLD,DEM,REP].map((c,i)=><Cell key={i} fill={c}/>)}
              </Pie>
              <Tooltip content={<CustomTip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{marginTop:"0.5rem",fontSize:"0.65rem",color:"var(--text-3)",lineHeight:1.5}}>
            <strong style={{color:GOLD}}>Mandatory</strong>: set by law, auto-funded (Social Security, Medicare, Medicaid)<br/>
            <strong style={{color:DEM}}>Discretionary</strong>: Congress votes on each year (defense, education, etc.)<br/>
            <strong style={{color:REP}}>Interest</strong>: non-negotiable — must pay to maintain credit
          </div>
        </div>
      </div>

      {/* Mandatory breakdown */}
      <div className="t-card" style={{padding:"1.25rem"}}>
        <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.75rem"}}>MANDATORY SPENDING BREAKDOWN (~$4.4T total)</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={MANDATORY_DATA} layout="vertical" margin={{left:100}}>
            <XAxis type="number" tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
            <YAxis type="category" dataKey="name" tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={false} tickLine={false} width={100}/>
            <Tooltip content={<CustomTip/>}/>
            <Bar dataKey="pct" name="% of Mandatory" radius={[0,4,4,0]}>
              {MANDATORY_DATA.map((d,i)=><Cell key={i} fill={d.color}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Discretionary breakdown */}
      <div className="t-card" style={{padding:"1.25rem"}}>
        <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",marginBottom:"0.75rem"}}>DISCRETIONARY SPENDING BREAKDOWN (~$1.8T total)</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={DISCRETIONARY_DATA} layout="vertical" margin={{left:110}}>
            <XAxis type="number" tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
            <YAxis type="category" dataKey="name" tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={false} tickLine={false} width={110}/>
            <Tooltip content={<CustomTip/>}/>
            <Bar dataKey="pct" name="% of Discretionary" radius={[0,4,4,0]}>
              {DISCRETIONARY_DATA.map((d,i)=><Cell key={i} fill={d.color}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Your tax dollar */}
      <div className="t-card" style={{padding:"1.25rem",border:`1px solid ${GOLD}30`}}>
        <div style={{fontSize:"0.75rem",fontWeight:800,color:"var(--text-1)",marginBottom:"0.75rem"}}>WHERE YOUR TAX DOLLAR GOES</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem"}}>
          {dollarBreakdown.map((d,i)=>(
            <div key={i} style={{padding:"0.5rem 0.75rem",borderRadius:6,background:d.color+"18",border:`1px solid ${d.color}33`,minWidth:120}}>
              <div style={{fontSize:"1.2rem",fontWeight:900,color:d.color,fontFamily:"var(--font-mono)"}}>${(d.cents/100).toFixed(2)}</div>
              <div style={{fontSize:"0.63rem",color:"var(--text-3)",marginTop:2}}>{d.name}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:"0.75rem",fontSize:"0.65rem",color:"var(--text-3)"}}>Per $1.00 of federal tax revenue (approximate). Does not include deficit spending.</div>
      </div>

      {/* Foreign aid reality check */}
      <div className="t-card" style={{padding:"1.25rem",border:`1px solid ${TEAL}30`}}>
        <div style={{fontSize:"0.75rem",fontWeight:800,color:"var(--text-1)",marginBottom:"0.5rem"}}>FOREIGN AID REALITY CHECK</div>
        <div style={{fontSize:"0.72rem",color:"var(--text-2)",lineHeight:1.6,marginBottom:"0.75rem"}}>
          Surveys consistently show Americans believe foreign aid is 20–25% of the federal budget. The actual figure is approximately <strong style={{color:TEAL}}>1% of the federal budget</strong> (~$60B/yr). Most foreign aid funds security assistance, disaster relief, and development programs that serve US strategic interests.
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={foreignAidPerception} margin={{left:-10}}>
            <XAxis dataKey="label" tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:9,fill:"var(--text-3)"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
            <Tooltip content={<CustomTip/>}/>
            <Bar dataKey="value" name="% of Budget" radius={[4,4,0,0]}>
              <Cell fill={REP}/><Cell fill={TEAL}/>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DISCLAIMER/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 7 — LIVE INDICATORS
══════════════════════════════════════════════════════════════════ */
function TabIndicators() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const SERIES = [
    {id:"UNRATE",   label:"Unemployment Rate",       unit:"%",  color:TEAL},
    {id:"CPIAUCSL", label:"CPI (Inflation proxy)",   unit:"idx",color:ORNG},
    {id:"FEDFUNDS", label:"Federal Funds Rate",      unit:"%",  color:PURP},
    {id:"GFDEBTN",  label:"Federal Debt ($B)",       unit:"$B", color:GOLD},
    {id:"PSAVERT",  label:"Personal Savings Rate",   unit:"%",  color:GREEN},
    {id:"HOUST",    label:"Housing Starts (000s)",   unit:"K",  color:DEM},
  ];

  useEffect(()=>{
    const ids = SERIES.map(s=>s.id).join(",");
    fetch(`${SERVER}/api/fred-multiple?series=${ids}&limit=60`)
      .then(r=>r.json())
      .then(json=>{ setData(json); setLoading(false); })
      .catch(()=>{
        setError("Server not running — showing recent data unavailable. Start the server with 'npm run server'.");
        setLoading(false);
      });
  },[]);

  if (loading) return (
    <div style={{textAlign:"center",padding:"3rem",color:"var(--text-3)"}}>
      <div style={{width:28,height:28,border:`2px solid ${GOLD}33`,borderTopColor:GOLD,borderRadius:"50%",animation:"tSpin 0.7s linear infinite",margin:"0 auto 0.75rem"}}/>
      <style>{`@keyframes tSpin{to{transform:rotate(360deg)}}`}</style>
      Fetching live FRED data…
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
      <SectionTitle>Live Economic Indicators — FRED Data</SectionTitle>
      {error && (
        <div style={{padding:"0.75rem 1rem",background:ORNG+"18",border:`1px solid ${ORNG}44`,borderRadius:6,fontSize:"0.72rem",color:ORNG}}>{error}</div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"1rem"}}>
        {SERIES.map(s=>{
          const obs = data[s.id];
          const vals = Array.isArray(obs) ? obs.filter(o=>o.value!==".") : [];
          const latest = vals.length ? parseFloat(vals[vals.length-1].value) : null;
          const chartData = vals.slice(-36).map(o=>({date:o.date?.slice(0,7),val:parseFloat(o.value)})).filter(o=>!isNaN(o.val));

          return (
            <div key={s.id} className="t-card" style={{padding:"1.25rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.5rem"}}>
                <div>
                  <div style={{fontSize:"0.62rem",color:"var(--text-3)",textTransform:"uppercase",fontWeight:700}}>{s.label}</div>
                  <div style={{fontSize:"1.3rem",fontWeight:900,color:s.color,fontFamily:"var(--font-mono)"}}>
                    {latest!=null?`${s.unit==="$B"?`$${(latest/1000).toFixed(1)}T`:latest.toFixed(s.unit==="%"?1:0)}${s.unit==="%"?"%":""}`:"-"}
                  </div>
                </div>
                <span style={{fontSize:"0.6rem",color:"var(--text-3)"}}>{vals[vals.length-1]?.date?.slice(0,7)||""}</span>
              </div>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" hide/>
                    <YAxis hide domain={["auto","auto"]}/>
                    <Tooltip content={<CustomTip/>}/>
                    <Line type="monotone" dataKey="val" name={s.label} stroke={s.color} strokeWidth={1.5} dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{height:100,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-3)",fontSize:"0.7rem"}}>
                  {error?"Data unavailable":"No chart data"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{padding:"0.6rem 0.85rem",background:"var(--elevated)",borderRadius:6,fontSize:"0.65rem",color:"var(--text-3)"}}>
        Data sourced from the Federal Reserve Economic Data (FRED) API — St. Louis Fed. Updated monthly. Requires local server running on port 3001.
      </div>
      <DISCLAIMER/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TAB 8 — LEGISLATION IMPACT
══════════════════════════════════════════════════════════════════ */
function ExpandLeg({law}) {
  const [open, setOpen] = useState(false);
  const catColor = {Tax:GOLD,Social:DEM,Infrastructure:GREEN,Healthcare:TEAL,Trade:PURP,Regulation:ORNG,Financial:REP,Stimulus:GREEN,Investment:TEAL,Monetary:GOLD,Climate:GREEN}[law.cat]||GOLD;
  return (
    <div className="t-card" style={{overflow:"hidden",borderTop:`2px solid ${pc(law.party)}`}}>
      <button onClick={()=>setOpen(v=>!v)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.85rem 1.1rem",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.6rem",flexWrap:"wrap"}}>
          <span style={{fontSize:"0.62rem",fontWeight:700,padding:"1px 7px",borderRadius:99,background:catColor+"22",color:catColor,border:`1px solid ${catColor}44`}}>{law.cat}</span>
          <span style={{fontSize:"0.82rem",fontWeight:800,color:"var(--text-1)"}}>{law.name}</span>
          <span style={{fontSize:"0.65rem",color:"var(--text-3)"}}>{law.year} · {law.president}</span>
          <PartyBadge party={law.party}/>
        </div>
        {open?<ChevronUp size={13} color="var(--text-3)"/>:<ChevronDown size={13} color="var(--text-3)"/>}
      </button>
      {open && (
        <div style={{padding:"0 1.1rem 1.1rem",borderTop:"1px solid var(--border-c)"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.6rem",marginTop:"0.75rem"}}>
            {[
              {label:"What It Did", text:law.summary, color:GOLD},
              {label:"Immediate Impact", text:law.impact, color:GREEN},
              {label:"Actual Outcome", text:law.outcome, color:TEAL},
            ].map((x,i)=>(
              <div key={i} style={{padding:"0.6rem 0.75rem",background:x.color+"12",borderRadius:6,border:`1px solid ${x.color}40`}}>
                <div style={{fontSize:"0.6rem",fontWeight:700,color:x.color,marginBottom:3}}>{x.label}</div>
                <div style={{fontSize:"0.72rem",color:"var(--text-2)",lineHeight:1.5}}>{x.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TabLegislation() {
  const [filter, setFilter] = useState("All");
  const cats = ["All","Tax","Healthcare","Infrastructure","Stimulus","Regulation","Trade","Financial","Investment","Climate","Monetary","Social"];
  const filtered = filter==="All" ? LEGISLATION : LEGISLATION.filter(l=>l.cat===filter);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
      <SectionTitle>Major Economic Legislation Impact Analyzer</SectionTitle>
      <div style={{fontSize:"0.72rem",color:"var(--text-3)"}}>
        Every major law that significantly impacted the US economy — what it did, what it was supposed to do, and what actually happened. Click any law to expand.
      </div>

      {/* Filter bar */}
      <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap"}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setFilter(c)} style={{padding:"0.25rem 0.7rem",borderRadius:99,border:`1px solid ${filter===c?GOLD:"var(--border-c)"}`,background:filter===c?GOLD+"22":"none",color:filter===c?GOLD:"var(--text-3)",fontSize:"0.68rem",cursor:"pointer"}}>
            {c}
          </button>
        ))}
      </div>

      {filtered.map((l,i)=><ExpandLeg key={i} law={l}/>)}
      <DISCLAIMER/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
const TABS = [
  {key:"command",    label:"Command Center",       icon:Landmark},
  {key:"presidents", label:"Presidential Reports", icon:Award},
  {key:"comparison", label:"Party Comparison",     icon:Scale},
  {key:"philosophy", label:"Economic Philosophy",  icon:BookOpen},
  {key:"debt",       label:"National Debt",        icon:TrendingUp},
  {key:"budget",     label:"Where Money Goes",     icon:DollarSign},
  {key:"legislation",label:"Legislation Impact",   icon:FileText},
];

export default function PoliticsEconomy() {
  const [tab, setTab] = useState("command");

  const render = () => {
    switch(tab) {
      case "command":    return <TabCommand/>;
      case "presidents": return <TabPresidents/>;
      case "comparison": return <TabComparison/>;
      case "philosophy": return <TabPhilosophy/>;
      case "debt":       return <TabDebt/>;
      case "budget":     return <TabBudget/>;
      case "legislation":return <TabLegislation/>;
      default:           return <TabCommand/>;
    }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        borderRadius: 20,
        padding: "2rem 2.25rem",
        marginBottom: "1.25rem",
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
                <Landmark size={14} style={{ color: "var(--gold)" }} />
              </div>
              <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em", fontFamily: "'Inter', system-ui, sans-serif" }}>
                POLITICS &amp;{" "}
                <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: "var(--gold)", fontWeight: 400, fontSize: "1.5rem" }}>Economy</em>
              </h1>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.65, maxWidth: 560, margin: "0 0 1rem" }}>
              Understand how Washington and world events move markets. Track fiscal policy, Federal Reserve decisions, trade agreements, and geopolitical risks with their direct market implications.
            </p>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              {["Policy Analysis", "Fed Decisions", "Trade & Tariffs", "Geopolitical Risk"].map((label) => (
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
              { icon: BookOpen, label: "Policy Tracker", sub: "Legislation & fiscal policy", color: "#3b82f6" },
              { icon: DollarSign, label: "Fed Watch", sub: "Rate decisions & outlook", color: "var(--gold)" },
              { icon: ArrowRight, label: "Trade Policy", sub: "Tariffs & trade agreements", color: "var(--teal)" },
              { icon: AlertTriangle, label: "Geopolitical Risk", sub: "Global market risks", color: "#f59e0b" },
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
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.45rem 0.85rem", borderRadius: 7, border: active ? "1px solid rgba(201,169,110,0.3)" : "1px solid transparent", cursor: "pointer", background: active ? "rgba(201,169,110,0.18)" : "transparent", color: active ? "var(--gold)" : "var(--text-3)", fontWeight: active ? 700 : 500, fontSize: "0.75rem", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s" }}>
              <t.icon size={12} />{t.label}
            </button>
          );
        })}
      </div>

      {render()}
    </div>
  );
}
