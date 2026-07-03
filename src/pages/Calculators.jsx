import React, { useState, useMemo } from "react";
import {
  TrendingUp, Home, Clock, Receipt, DollarSign, CreditCard,
  ChevronDown, ChevronRight, PiggyBank, Car, Building2,
  GraduationCap, Briefcase, BarChart2, Percent, Calculator,
  Wallet, Coins,
} from "lucide-react";
import CompoundInterestCalc from "../components/calculators/CompoundInterestCalc";
import RetirementCalc from "../components/calculators/RetirementCalc";
import MortgageCalc from "../components/calculators/MortgageCalc";
import TaxSavingsCalc from "../components/calculators/TaxSavingsCalc";
import { TAX_2026 } from "../config/taxConstants2026";

/* ── Format helpers ─────────────────────────────────────────────────────── */
const fC = (n, dec = 2) => n == null || isNaN(n) ? "—" :
  "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fP = (n, dec = 2) => n == null || isNaN(n) ? "—" : `${Number(n).toFixed(dec)}%`;
const fN = (n, dec = 2) => n == null || isNaN(n) ? "—" : Number(n).toFixed(dec);
const fI = (n) => n == null || isNaN(n) ? "—" : Math.round(Number(n)).toLocaleString("en-US");
const fYM = (months) => {
  if (!months || isNaN(months) || months <= 0) return "—";
  const y = Math.floor(months / 12), m = Math.round(months % 12);
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr${y !== 1 ? "s" : ""}`;
  return `${y} yr${y !== 1 ? "s" : ""} ${m} mo`;
};

/* ── Shared input style ──────────────────────────────────────────────────── */
const INP = {
  width: "100%", background: "var(--bg)", border: "1px solid var(--border-c)",
  borderRadius: 8, padding: "9px 12px", color: "var(--text-1)",
  fontSize: "0.875rem", outline: "none", boxSizing: "border-box",
};
const SEL = { ...INP, cursor: "pointer" };
const LBL = {
  fontSize: "0.6875rem", color: "var(--text-3)", marginBottom: 5,
  fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "block",
};
const RES_WRAP = (cols) => ({
  display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10, marginTop: 4,
});
const RES_CARD = (hi, color = "var(--gold)") => ({
  background: hi ? `color-mix(in srgb, ${color} 12%, transparent)` : "var(--bg)",
  border: `1px solid ${hi ? color : "var(--border-c)"}`,
  borderRadius: 10, padding: "14px 16px", textAlign: "center",
});

/* ── Inline Featured: Loan Payment ──────────────────────────────────────── */
function LoanPaymentCalc() {
  const [v, sv] = useState({ amount: 25000, rate: 7.5, term: 5 });
  const set = (k) => (e) => sv((s) => ({ ...s, [k]: parseFloat(e.target.value) || 0 }));
  const r = v.rate / 100 / 12, n = v.term * 12;
  const M = r > 0 ? v.amount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : v.amount / n;
  const total = M * n, interest = total - v.amount;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <DollarSign size={18} style={{ color: "#06b6d4" }} />
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-1)" }}>Loan Payment Calculator</h3>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Loan Amount ($)", k: "amount", step: 1000 },
          { label: "Annual Rate (%)", k: "rate", step: 0.1 },
          { label: "Term (years)", k: "term", step: 1 },
        ].map(({ label, k, step }) => (
          <div key={k}><label style={LBL}>{label}</label>
            <input type="number" value={v[k]} step={step} onChange={set(k)} style={INP} /></div>
        ))}
      </div>
      <div style={RES_WRAP(3)}>
        {[
          { label: "Monthly Payment", val: fC(M), hi: true },
          { label: "Total Interest", val: fC(interest) },
          { label: "Total Paid", val: fC(total) },
        ].map(({ label, val, hi }) => (
          <div key={label} style={RES_CARD(hi, "#06b6d4")}>
            <div style={{ ...LBL, marginBottom: 4, letterSpacing: "0.08em" }}>{label}</div>
            <div style={{ fontSize: hi ? "1.375rem" : "1.1rem", fontWeight: 800, color: hi ? "#06b6d4" : "var(--text-1)", fontFamily: "monospace" }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Inline Featured: Debt Payoff ───────────────────────────────────────── */
function DebtPayoffCalc() {
  const [v, sv] = useState({ balance: 8500, apr: 22.99, payment: 300 });
  const set = (k) => (e) => sv((s) => ({ ...s, [k]: parseFloat(e.target.value) || 0 }));
  const r = v.apr / 100 / 12;
  const minPmt = v.balance * r;
  let months = null, totalInterest = 0;
  if (v.payment > minPmt && r > 0) {
    months = Math.log(v.payment / (v.payment - v.balance * r)) / Math.log(1 + r);
    totalInterest = v.payment * months - v.balance;
  }
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <CreditCard size={18} style={{ color: "#f59e0b" }} />
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-1)" }}>Debt Payoff Calculator</h3>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Balance ($)", k: "balance", step: 100 },
          { label: "APR (%)", k: "apr", step: 0.01 },
          { label: "Monthly Payment ($)", k: "payment", step: 10 },
        ].map(({ label, k, step }) => (
          <div key={k}><label style={LBL}>{label}</label>
            <input type="number" value={v[k]} step={step} onChange={set(k)} style={INP} /></div>
        ))}
      </div>
      {months === null ? (
        <div style={{ background: "rgba(255,59,92,0.08)", border: "1px solid rgba(255,59,92,0.25)", borderRadius: 10, padding: 16, color: "#ff3b5c", fontSize: "0.8125rem", textAlign: "center" }}>
          Payment must exceed minimum interest ({fC(minPmt)}/mo) to pay off this debt.
        </div>
      ) : (
        <div style={RES_WRAP(3)}>
          {[
            { label: "Payoff Time", val: fYM(months), hi: true, color: "#f59e0b" },
            { label: "Total Interest", val: fC(totalInterest) },
            { label: "Total Paid", val: fC(totalInterest + v.balance) },
          ].map(({ label, val, hi, color }) => (
            <div key={label} style={RES_CARD(hi, color || "var(--gold)")}>
              <div style={{ ...LBL, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: hi ? "1.375rem" : "1.1rem", fontWeight: 800, color: hi ? (color || "var(--gold)") : "var(--text-1)", fontFamily: "monospace" }}>{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Featured 6 ──────────────────────────────────────────────────────────── */
const FEATURED = [
  { id: "compound",   label: "Compound Interest", icon: TrendingUp,  color: "var(--teal)",  desc: "Wealth growth over time",         component: CompoundInterestCalc },
  { id: "mortgage",   label: "Mortgage",           icon: Home,        color: "#3b82f6",      desc: "Payments & amortization",         component: MortgageCalc },
  { id: "retirement", label: "Retirement",          icon: Clock,       color: "var(--gold)",  desc: "Path to financial independence",  component: RetirementCalc },
  { id: "tax",        label: "Tax Savings",         icon: Receipt,     color: "#a855f7",      desc: "Tax-advantaged account benefits", component: TaxSavingsCalc },
  { id: "loan",       label: "Loan Payment",        icon: DollarSign,  color: "#06b6d4",      desc: "Monthly cost of any loan",        component: LoanPaymentCalc },
  { id: "debt",       label: "Debt Payoff",         icon: CreditCard,  color: "#f59e0b",      desc: "Time & cost to eliminate debt",   component: DebtPayoffCalc },
];

/* ── Sidebar calculator configs ──────────────────────────────────────────── */
const CALC_REGISTRY = [
  /* ═══ MORTGAGE & REAL ESTATE ══════════════════════════════════════════════ */
  {
    id: "amortization", label: "Amortization Calculator", category: "Mortgage & Real Estate",
    inputs: [
      { id: "principal", label: "Loan Amount ($)", defaultVal: 300000, step: 5000 },
      { id: "rate",      label: "Annual Rate (%)", defaultVal: 6.5,    step: 0.1  },
      { id: "term",      label: "Term (years)",    defaultVal: 30,      step: 1    },
    ],
    calculate: (v) => {
      const r = v.rate / 100 / 12, n = v.term * 12;
      const M = v.principal * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1);
      const total = M * n, interest = total - v.principal;
      return [
        { label: "Monthly Payment", value: fC(M), highlight: true },
        { label: "Total Interest",  value: fC(interest) },
        { label: "Total Cost",      value: fC(total) },
        { label: "Interest Share",  value: fP(interest / total * 100) },
      ];
    },
  },
  {
    id: "mortgage-payoff", label: "Mortgage Payoff Calculator", category: "Mortgage & Real Estate",
    inputs: [
      { id: "balance",  label: "Current Balance ($)",    defaultVal: 250000, step: 5000 },
      { id: "rate",     label: "Interest Rate (%)",      defaultVal: 6.5,    step: 0.1  },
      { id: "payment",  label: "Current Payment ($/mo)", defaultVal: 1700,   step: 50   },
      { id: "extra",    label: "Extra Payment ($/mo)",   defaultVal: 200,    step: 50   },
    ],
    calculate: (v) => {
      const r = v.rate / 100 / 12;
      const calcMonths = (pmt) => {
        if (pmt <= v.balance * r) return null;
        return Math.log(pmt / (pmt - v.balance * r)) / Math.log(1 + r);
      };
      const moOrig = calcMonths(v.payment);
      const moNew  = calcMonths(v.payment + v.extra);
      if (!moOrig || !moNew) return [{ label: "Error", value: "Payment too low" }];
      const intOrig = v.payment * moOrig - v.balance;
      const intNew  = (v.payment + v.extra) * moNew - v.balance;
      return [
        { label: "Original Payoff",  value: fYM(moOrig) },
        { label: "New Payoff",       value: fYM(moNew), highlight: true },
        { label: "Time Saved",       value: fYM(moOrig - moNew) },
        { label: "Interest Saved",   value: fC(intOrig - intNew) },
      ];
    },
  },
  {
    id: "house-afford", label: "House Affordability", category: "Mortgage & Real Estate",
    inputs: [
      { id: "income",  label: "Annual Income ($)",      defaultVal: 90000, step: 5000 },
      { id: "debts",   label: "Monthly Debts ($)",      defaultVal: 400,   step: 50   },
      { id: "rate",    label: "Mortgage Rate (%)",      defaultVal: 6.5,   step: 0.1  },
      { id: "down",    label: "Down Payment (%)",       defaultVal: 20,    step: 1    },
      { id: "dtiLimit",label: "Max DTI (%)",            defaultVal: 43,    step: 1    },
    ],
    calculate: (v) => {
      const grossMo = v.income / 12;
      const maxTotalDebt = grossMo * (v.dtiLimit / 100);
      const maxMortgagePmt = maxTotalDebt - v.debts;
      const r = v.rate / 100 / 12, n = 360;
      const maxLoan = maxMortgagePmt * (Math.pow(1+r,n) - 1) / (r * Math.pow(1+r,n));
      const maxHome = maxLoan / (1 - v.down / 100);
      return [
        { label: "Max Home Price",    value: fC(maxHome, 0), highlight: true },
        { label: "Max Loan",          value: fC(maxLoan, 0) },
        { label: "Max Mortgage Pmt",  value: fC(maxMortgagePmt) + "/mo" },
        { label: "Down Payment",      value: fC(maxHome * v.down / 100, 0) },
      ];
    },
  },
  {
    id: "rent-vs-buy", label: "Rent vs. Buy", category: "Mortgage & Real Estate",
    inputs: [
      { id: "homePrice",    label: "Home Price ($)",         defaultVal: 400000, step: 10000 },
      { id: "downPct",      label: "Down Payment (%)",       defaultVal: 20,     step: 1     },
      { id: "mortgageRate", label: "Mortgage Rate (%)",      defaultVal: 6.5,    step: 0.1   },
      { id: "rent",         label: "Monthly Rent ($)",       defaultVal: 2200,   step: 50    },
      { id: "years",        label: "Comparison Period (yr)", defaultVal: 7,      step: 1     },
      { id: "appreciation", label: "Home Appreciation (%/yr)", defaultVal: 3.5,  step: 0.5   },
    ],
    calculate: (v) => {
      const down = v.homePrice * v.downPct / 100;
      const loan = v.homePrice - down;
      const r = v.mortgageRate / 100 / 12, n = 360;
      const M = loan * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1);
      const months = v.years * 12;
      const totalMortgage = M * months;
      // remaining balance after v.years
      const remBal = loan * (Math.pow(1+r,n) - Math.pow(1+r,months)) / (Math.pow(1+r,n) - 1);
      const futureHome = v.homePrice * Math.pow(1 + v.appreciation/100, v.years);
      const equity = futureHome - remBal;
      const buyCost = totalMortgage + down - equity;
      const rentCost = v.rent * months * 1.03; // assume 3% rent inflation
      return [
        { label: "Total Buy Cost",   value: fC(buyCost, 0) },
        { label: "Total Rent Cost",  value: fC(rentCost, 0) },
        { label: "Buy Equity Built", value: fC(equity, 0), highlight: true },
        { label: "Better Option",    value: buyCost < rentCost ? "Buying" : "Renting" },
      ];
    },
  },
  {
    id: "refinance", label: "Refinance Calculator", category: "Mortgage & Real Estate",
    inputs: [
      { id: "balance",     label: "Current Balance ($)",      defaultVal: 280000, step: 5000 },
      { id: "currentRate", label: "Current Rate (%)",         defaultVal: 7.2,    step: 0.1  },
      { id: "currentMos",  label: "Remaining Months",         defaultVal: 300,    step: 12   },
      { id: "newRate",     label: "New Rate (%)",             defaultVal: 6.0,    step: 0.1  },
      { id: "newYears",    label: "New Term (years)",         defaultVal: 30,     step: 1    },
      { id: "closingCost", label: "Closing Costs ($)",        defaultVal: 4000,   step: 500  },
    ],
    calculate: (v) => {
      const rOld = v.currentRate / 100 / 12, nOld = v.currentMos;
      const oldPmt = v.balance * rOld * Math.pow(1+rOld,nOld) / (Math.pow(1+rOld,nOld) - 1);
      const rNew = v.newRate / 100 / 12, nNew = v.newYears * 12;
      const newPmt = v.balance * rNew * Math.pow(1+rNew,nNew) / (Math.pow(1+rNew,nNew) - 1);
      const mSavings = oldPmt - newPmt;
      const breakEven = mSavings > 0 ? v.closingCost / mSavings : null;
      const totalSavings = mSavings * nOld - v.closingCost;
      return [
        { label: "Monthly Savings",   value: fC(mSavings), highlight: true },
        { label: "Break-Even",        value: breakEven ? fYM(breakEven) : "N/A" },
        { label: "Net Savings",       value: fC(totalSavings) },
        { label: "New Payment",       value: fC(newPmt) + "/mo" },
      ];
    },
  },
  {
    id: "apr-calc", label: "APR Calculator", category: "Mortgage & Real Estate",
    inputs: [
      { id: "loanAmount", label: "Loan Amount ($)",    defaultVal: 300000, step: 5000 },
      { id: "rate",       label: "Interest Rate (%)",  defaultVal: 6.5,    step: 0.1  },
      { id: "fees",       label: "Total Fees ($)",     defaultVal: 6000,   step: 500  },
      { id: "term",       label: "Term (years)",       defaultVal: 30,     step: 1    },
    ],
    calculate: (v) => {
      const n = v.term * 12, r = v.rate / 100 / 12;
      const M = v.loanAmount * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1);
      const netProceeds = v.loanAmount - v.fees;
      // APR: find rate such that PV of M payments = netProceeds (Newton-Raphson)
      let aprR = r;
      for (let i = 0; i < 50; i++) {
        const fv = Math.pow(1+aprR,n);
        const f  = M * (fv - 1) / (aprR * fv) - netProceeds;
        const fp = M * (fv * (n * aprR - n - 1) + 1) / (aprR * aprR * fv);
        const delta = f / fp;
        aprR -= delta;
        if (Math.abs(delta) < 1e-10) break;
      }
      const apr = aprR * 12 * 100;
      return [
        { label: "APR",              value: fP(apr), highlight: true },
        { label: "Nominal Rate",     value: fP(v.rate) },
        { label: "Monthly Payment",  value: fC(M) },
        { label: "Total Fees",       value: fC(v.fees) },
      ];
    },
  },
  {
    id: "fha-loan", label: "FHA Loan Calculator", category: "Mortgage & Real Estate",
    inputs: [
      { id: "homePrice", label: "Home Price ($)",       defaultVal: 350000, step: 5000 },
      { id: "downPct",   label: "Down Payment (%)",     defaultVal: 3.5,    step: 0.5  },
      { id: "rate",      label: "Interest Rate (%)",    defaultVal: 6.8,    step: 0.1  },
      { id: "term",      label: "Loan Term (years)",    defaultVal: 30,     step: 1    },
    ],
    calculate: (v) => {
      const down = v.homePrice * v.downPct / 100;
      const baseLoan = v.homePrice - down;
      const mipUpfront = baseLoan * 0.0175; // 1.75% upfront MIP
      const totalLoan = baseLoan + mipUpfront;
      const r = v.rate / 100 / 12, n = v.term * 12;
      const M = totalLoan * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1);
      const annualMIP = baseLoan * 0.0055 / 12; // ~0.55% annual MIP
      return [
        { label: "Monthly Payment",  value: fC(M + annualMIP), highlight: true },
        { label: "Principal & Int",  value: fC(M) },
        { label: "Monthly MIP",      value: fC(annualMIP) },
        { label: "Upfront MIP",      value: fC(mipUpfront) },
      ];
    },
  },
  {
    id: "down-payment", label: "Down Payment Calculator", category: "Mortgage & Real Estate",
    inputs: [
      { id: "homePrice",    label: "Home Price ($)",         defaultVal: 400000, step: 10000 },
      { id: "currentSaved", label: "Current Savings ($)",    defaultVal: 20000,  step: 1000  },
      { id: "monthSavings", label: "Monthly Savings ($)",    defaultVal: 1500,   step: 100   },
    ],
    calculate: (v) => {
      const targets = [0.03, 0.05, 0.10, 0.20].map(pct => {
        const needed = v.homePrice * pct;
        const more = Math.max(0, needed - v.currentSaved);
        const months = v.monthSavings > 0 ? more / v.monthSavings : null;
        return { pct, needed, more, months };
      });
      const t20 = targets[3];
      return [
        { label: "20% Down Needed",   value: fC(t20.needed, 0), highlight: true },
        { label: "Still Need",        value: fC(t20.more, 0) },
        { label: "Months to 20%",     value: fYM(t20.months) },
        { label: "Months to 3.5%",    value: fYM(targets[0].months) },
      ];
    },
  },
  {
    id: "heloc", label: "HELOC Calculator", category: "Mortgage & Real Estate",
    inputs: [
      { id: "homeValue",    label: "Home Value ($)",         defaultVal: 500000, step: 10000 },
      { id: "mortgageBal",  label: "Mortgage Balance ($)",   defaultVal: 300000, step: 5000  },
      { id: "ltvLimit",     label: "LTV Limit (%)",         defaultVal: 85,     step: 1     },
      { id: "helRate",      label: "HELOC Rate (%)",         defaultVal: 8.5,    step: 0.1   },
    ],
    calculate: (v) => {
      const maxLTV = v.homeValue * v.ltvLimit / 100;
      const creditLine = Math.max(0, maxLTV - v.mortgageBal);
      const equity = v.homeValue - v.mortgageBal;
      const monthlyInterest = creditLine * v.helRate / 100 / 12;
      return [
        { label: "Max Credit Line",    value: fC(creditLine, 0), highlight: true },
        { label: "Current Equity",     value: fC(equity, 0) },
        { label: "Interest-Only Pmt",  value: fC(monthlyInterest) + "/mo" },
        { label: "LTV Used",           value: fP(v.mortgageBal / v.homeValue * 100) },
      ];
    },
  },
  {
    id: "rental-property", label: "Rental Property", category: "Mortgage & Real Estate",
    inputs: [
      { id: "price",      label: "Purchase Price ($)",    defaultVal: 350000, step: 5000 },
      { id: "downPct",    label: "Down Payment (%)",      defaultVal: 25,     step: 1    },
      { id: "rate",       label: "Mortgage Rate (%)",     defaultVal: 7.0,    step: 0.1  },
      { id: "rent",       label: "Monthly Rent ($)",      defaultVal: 2400,   step: 50   },
      { id: "expPct",     label: "Expense Ratio (%)",     defaultVal: 40,     step: 1    },
      { id: "vacancy",    label: "Vacancy Rate (%)",      defaultVal: 5,      step: 1    },
    ],
    calculate: (v) => {
      const down = v.price * v.downPct / 100;
      const loan = v.price - down;
      const r = v.rate / 100 / 12, n = 360;
      const mortgage = loan * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1);
      const grossRent = v.rent * 12 * (1 - v.vacancy / 100);
      const expenses = grossRent * v.expPct / 100;
      const noi = grossRent - expenses;
      const annualCashFlow = noi - mortgage * 12;
      const capRate = noi / v.price * 100;
      const cocReturn = annualCashFlow / down * 100;
      return [
        { label: "Annual Cash Flow",  value: fC(annualCashFlow, 0), highlight: true },
        { label: "Cap Rate",          value: fP(capRate) },
        { label: "Cash-on-Cash",      value: fP(cocReturn) },
        { label: "Monthly Mortgage",  value: fC(mortgage) },
      ];
    },
  },
  {
    id: "dti", label: "Debt-to-Income Ratio", category: "Mortgage & Real Estate",
    inputs: [
      { id: "income",    label: "Gross Monthly Income ($)",   defaultVal: 8000, step: 100 },
      { id: "housing",   label: "Monthly Housing Cost ($)",   defaultVal: 2000, step: 50  },
      { id: "otherDebt", label: "Other Monthly Debts ($)",    defaultVal: 600,  step: 50  },
    ],
    calculate: (v) => {
      const frontEnd = v.housing / v.income * 100;
      const backEnd  = (v.housing + v.otherDebt) / v.income * 100;
      const status   = backEnd <= 36 ? "Excellent" : backEnd <= 43 ? "Good" : backEnd <= 50 ? "Fair" : "High";
      return [
        { label: "Front-End DTI",  value: fP(frontEnd), highlight: true },
        { label: "Back-End DTI",   value: fP(backEnd) },
        { label: "Status",         value: status },
        { label: "Max Qualifying", value: fP(43) },
      ];
    },
  },
  {
    id: "home-equity-loan", label: "Home Equity Loan", category: "Mortgage & Real Estate",
    inputs: [
      { id: "homeValue",  label: "Home Value ($)",         defaultVal: 500000, step: 10000 },
      { id: "mortgageBal",label: "Mortgage Balance ($)",   defaultVal: 280000, step: 5000  },
      { id: "loanAmt",    label: "Equity Loan Amount ($)", defaultVal: 50000,  step: 5000  },
      { id: "rate",       label: "Loan Rate (%)",          defaultVal: 8.0,    step: 0.1   },
      { id: "term",       label: "Term (years)",           defaultVal: 10,     step: 1     },
    ],
    calculate: (v) => {
      const equity = v.homeValue - v.mortgageBal;
      const cltv = (v.mortgageBal + v.loanAmt) / v.homeValue * 100;
      const r = v.rate / 100 / 12, n = v.term * 12;
      const M = v.loanAmt * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1);
      const total = M * n;
      return [
        { label: "Monthly Payment",  value: fC(M), highlight: true },
        { label: "Total Interest",   value: fC(total - v.loanAmt) },
        { label: "Available Equity", value: fC(equity, 0) },
        { label: "Combined LTV",     value: fP(cltv) },
      ];
    },
  },
  {
    id: "rent-calc", label: "Rent Calculator", category: "Mortgage & Real Estate",
    inputs: [
      { id: "income",    label: "Annual Income ($)",     defaultVal: 75000, step: 5000 },
      { id: "rulePct",   label: "Rent Rule (%)",         defaultVal: 30,    step: 1    },
      { id: "utilities", label: "Utilities ($/mo)",      defaultVal: 150,   step: 25   },
      { id: "otherDebt", label: "Monthly Debts ($)",     defaultVal: 400,   step: 50   },
    ],
    calculate: (v) => {
      const maxRent = (v.income / 12) * (v.rulePct / 100);
      const totalHousing = maxRent + v.utilities;
      const disposable = v.income / 12 - totalHousing - v.otherDebt;
      return [
        { label: "Max Rent",        value: fC(maxRent), highlight: true },
        { label: "With Utilities",  value: fC(totalHousing) },
        { label: "Left for Savings",value: fC(disposable) },
        { label: "Rule Applied",    value: fP(v.rulePct) + " of income" },
      ];
    },
  },

  /* ═══ AUTO ═════════════════════════════════════════════════════════════════ */
  {
    id: "auto-loan", label: "Auto Loan Calculator", category: "Auto",
    inputs: [
      { id: "price",    label: "Vehicle Price ($)",    defaultVal: 35000, step: 500  },
      { id: "down",     label: "Down Payment ($)",     defaultVal: 5000,  step: 500  },
      { id: "tradeIn",  label: "Trade-In Value ($)",   defaultVal: 3000,  step: 500  },
      { id: "rate",     label: "Interest Rate (%)",    defaultVal: 6.9,   step: 0.1  },
      { id: "term",     label: "Loan Term (months)",   defaultVal: 60,    step: 12   },
    ],
    calculate: (v) => {
      const loan = v.price - v.down - v.tradeIn;
      const r = v.rate / 100 / 12, n = v.term;
      const M = r > 0 ? loan * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1) : loan / n;
      const total = M * n;
      return [
        { label: "Monthly Payment",  value: fC(M),             highlight: true },
        { label: "Loan Amount",      value: fC(loan, 0) },
        { label: "Total Interest",   value: fC(total - loan) },
        { label: "Total Cost",       value: fC(total) },
      ];
    },
  },
  {
    id: "auto-lease", label: "Auto Lease Calculator", category: "Auto",
    inputs: [
      { id: "msrp",        label: "MSRP ($)",              defaultVal: 45000, step: 1000 },
      { id: "negotiated",  label: "Negotiated Price ($)",   defaultVal: 43000, step: 500  },
      { id: "residualPct", label: "Residual Value (%)",     defaultVal: 55,    step: 1    },
      { id: "moneyFactor", label: "Money Factor (× 2400 = APR)", defaultVal: 0.00125, step: 0.00025 },
      { id: "term",        label: "Lease Term (months)",    defaultVal: 36,    step: 12   },
      { id: "down",        label: "Down Payment ($)",       defaultVal: 3000,  step: 500  },
    ],
    calculate: (v) => {
      const residual = v.msrp * v.residualPct / 100;
      const capCost = v.negotiated - v.down;
      const depreciation = (capCost - residual) / v.term;
      const finance = (capCost + residual) * v.moneyFactor;
      const monthly = depreciation + finance;
      const totalCost = monthly * v.term + v.down;
      const apr = v.moneyFactor * 2400;
      return [
        { label: "Monthly Payment", value: fC(monthly), highlight: true },
        { label: "Total Cost",      value: fC(totalCost) },
        { label: "Residual Value",  value: fC(residual, 0) },
        { label: "Effective APR",   value: fP(apr) },
      ];
    },
  },
  {
    id: "cashback-vs-interest", label: "Cash Back vs Low Interest", category: "Auto",
    inputs: [
      { id: "price",      label: "Vehicle Price ($)",     defaultVal: 35000, step: 500 },
      { id: "down",       label: "Down Payment ($)",      defaultVal: 5000,  step: 500 },
      { id: "cashBack",   label: "Cash Back Offer ($)",   defaultVal: 3000,  step: 250 },
      { id: "stdRate",    label: "Standard Rate (%)",     defaultVal: 7.5,   step: 0.1 },
      { id: "lowRate",    label: "Low Interest Rate (%)", defaultVal: 2.9,   step: 0.1 },
      { id: "term",       label: "Loan Term (months)",    defaultVal: 60,    step: 12  },
    ],
    calculate: (v) => {
      const loanBase = v.price - v.down;
      const loanCB = loanBase - v.cashBack; // take cash back, use standard rate
      const calc = (p, rate) => {
        const r = rate / 100 / 12, n = v.term;
        const M = r > 0 ? p * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1) : p / n;
        return M;
      };
      const pmtCashBack = calc(loanCB, v.stdRate);
      const pmtLowInt   = calc(loanBase, v.lowRate);
      const better = pmtCashBack < pmtLowInt ? "Cash Back" : "Low Interest";
      return [
        { label: "Cash Back Payment",  value: fC(pmtCashBack) + "/mo" },
        { label: "Low Rate Payment",   value: fC(pmtLowInt) + "/mo" },
        { label: "Monthly Savings",    value: fC(Math.abs(pmtCashBack - pmtLowInt)), highlight: true },
        { label: "Better Deal",        value: better },
      ];
    },
  },

  /* ═══ INVESTMENT ══════════════════════════════════════════════════════════ */
  {
    id: "simple-interest", label: "Simple Interest Calculator", category: "Investment",
    inputs: [
      { id: "principal", label: "Principal ($)",      defaultVal: 10000, step: 500 },
      { id: "rate",      label: "Annual Rate (%)",    defaultVal: 5,     step: 0.1 },
      { id: "years",     label: "Time (years)",       defaultVal: 5,     step: 1   },
    ],
    calculate: (v) => {
      const interest = v.principal * (v.rate / 100) * v.years;
      const total = v.principal + interest;
      return [
        { label: "Total Amount",    value: fC(total), highlight: true },
        { label: "Interest Earned", value: fC(interest) },
        { label: "Return",          value: fP(interest / v.principal * 100) },
      ];
    },
  },
  {
    id: "savings-calc", label: "Savings Calculator", category: "Investment",
    inputs: [
      { id: "initial",      label: "Initial Balance ($)",    defaultVal: 5000,  step: 500  },
      { id: "monthly",      label: "Monthly Deposit ($)",    defaultVal: 500,   step: 50   },
      { id: "rate",         label: "Annual Rate (%)",        defaultVal: 4.5,   step: 0.1  },
      { id: "years",        label: "Years",                  defaultVal: 10,    step: 1    },
    ],
    calculate: (v) => {
      const r = v.rate / 100 / 12, n = v.years * 12;
      const fvInitial = v.initial * Math.pow(1+r, n);
      const fvContribs = v.monthly * (Math.pow(1+r,n) - 1) / r;
      const total = fvInitial + fvContribs;
      const contributed = v.initial + v.monthly * n;
      return [
        { label: "Future Balance",    value: fC(total, 0),       highlight: true },
        { label: "Total Deposited",   value: fC(contributed, 0) },
        { label: "Interest Earned",   value: fC(total - contributed, 0) },
        { label: "Total Return",      value: fP((total - contributed) / contributed * 100) },
      ];
    },
  },
  {
    id: "cd-calc", label: "CD Calculator", category: "Investment",
    inputs: [
      { id: "principal", label: "Deposit Amount ($)",       defaultVal: 25000, step: 1000 },
      { id: "rate",      label: "Annual Rate (%)",          defaultVal: 5.0,   step: 0.05 },
      { id: "term",      label: "Term (months)",            defaultVal: 12,    step: 6    },
      { id: "compound",  label: "Compound Freq (per yr)",   defaultVal: 12,    step: 1    },
    ],
    calculate: (v) => {
      const r = v.rate / 100 / v.compound;
      const periods = v.compound * (v.term / 12);
      const total = v.principal * Math.pow(1 + r, periods);
      const interest = total - v.principal;
      const apy = (Math.pow(1 + v.rate / 100 / v.compound, v.compound) - 1) * 100;
      return [
        { label: "Ending Balance",  value: fC(total), highlight: true },
        { label: "Interest Earned", value: fC(interest) },
        { label: "APY",             value: fP(apy) },
        { label: "Effective Gain",  value: fP(interest / v.principal * 100) },
      ];
    },
  },
  {
    id: "roi-calc", label: "ROI Calculator", category: "Investment",
    inputs: [
      { id: "initial",  label: "Initial Investment ($)", defaultVal: 10000, step: 500  },
      { id: "final",    label: "Final Value ($)",        defaultVal: 14500, step: 500  },
      { id: "years",    label: "Holding Period (years)", defaultVal: 3,     step: 0.5  },
    ],
    calculate: (v) => {
      const gain = v.final - v.initial;
      const roi = gain / v.initial * 100;
      const cagr = (Math.pow(v.final / v.initial, 1 / v.years) - 1) * 100;
      return [
        { label: "ROI",            value: fP(roi), highlight: true },
        { label: "Net Gain/Loss",  value: fC(gain) },
        { label: "CAGR",          value: fP(cagr) },
        { label: "Total Return",   value: `${gain >= 0 ? "+" : ""}${fI(gain)}` },
      ];
    },
  },
  {
    id: "present-value", label: "Present Value Calculator", category: "Investment",
    inputs: [
      { id: "futureVal", label: "Future Value ($)",       defaultVal: 50000, step: 1000 },
      { id: "rate",      label: "Discount Rate (%/yr)",   defaultVal: 7,     step: 0.1  },
      { id: "years",     label: "Years",                  defaultVal: 10,    step: 1    },
    ],
    calculate: (v) => {
      const pv = v.futureVal / Math.pow(1 + v.rate / 100, v.years);
      const discount = v.futureVal - pv;
      return [
        { label: "Present Value",    value: fC(pv), highlight: true },
        { label: "Discount Amount",  value: fC(discount) },
        { label: "Discount Factor",  value: fN(pv / v.futureVal, 4) },
        { label: "Future Value",     value: fC(v.futureVal) },
      ];
    },
  },
  {
    id: "future-value", label: "Future Value Calculator", category: "Investment",
    inputs: [
      { id: "presentVal", label: "Present Value ($)",      defaultVal: 20000, step: 1000 },
      { id: "payment",    label: "Annual Payment ($)",     defaultVal: 0,     step: 500  },
      { id: "rate",       label: "Annual Rate (%)",        defaultVal: 7,     step: 0.1  },
      { id: "years",      label: "Years",                  defaultVal: 20,    step: 1    },
    ],
    calculate: (v) => {
      const r = v.rate / 100;
      const fvPV = v.presentVal * Math.pow(1 + r, v.years);
      const fvPMT = v.payment > 0 ? v.payment * (Math.pow(1+r, v.years) - 1) / r : 0;
      const total = fvPV + fvPMT;
      return [
        { label: "Future Value",     value: fC(total, 0), highlight: true },
        { label: "From Principal",   value: fC(fvPV, 0) },
        { label: "From Payments",    value: fC(fvPMT, 0) },
        { label: "Total Growth",     value: fP((total - v.presentVal) / v.presentVal * 100) },
      ];
    },
  },
  {
    id: "cagr-calc", label: "Average Return (CAGR)", category: "Investment",
    inputs: [
      { id: "beginVal", label: "Beginning Value ($)", defaultVal: 10000, step: 500  },
      { id: "endVal",   label: "Ending Value ($)",    defaultVal: 28000, step: 500  },
      { id: "years",    label: "Number of Years",     defaultVal: 10,    step: 1    },
    ],
    calculate: (v) => {
      const cagr = (Math.pow(v.endVal / v.beginVal, 1 / v.years) - 1) * 100;
      const totalReturn = (v.endVal - v.beginVal) / v.beginVal * 100;
      return [
        { label: "CAGR",            value: fP(cagr), highlight: true },
        { label: "Total Return",    value: fP(totalReturn) },
        { label: "Total Gain",      value: fC(v.endVal - v.beginVal, 0) },
        { label: "Avg Ann. Return", value: fP(totalReturn / v.years) },
      ];
    },
  },
  {
    id: "payback-period", label: "Payback Period Calculator", category: "Investment",
    inputs: [
      { id: "investment",    label: "Initial Investment ($)",      defaultVal: 50000, step: 5000 },
      { id: "annualCashFlow",label: "Annual Cash Flow ($)",        defaultVal: 12000, step: 1000 },
      { id: "discountRate",  label: "Discount Rate (%)",           defaultVal: 8,     step: 0.5  },
    ],
    calculate: (v) => {
      const payback = v.investment / v.annualCashFlow;
      // Discounted payback
      let cumDiscounted = 0, discPayback = null;
      for (let y = 1; y <= 30; y++) {
        cumDiscounted += v.annualCashFlow / Math.pow(1 + v.discountRate / 100, y);
        if (cumDiscounted >= v.investment && !discPayback) discPayback = y;
      }
      const roi = (v.annualCashFlow * 10 - v.investment) / v.investment * 100;
      return [
        { label: "Payback Period",    value: fYM(payback * 12), highlight: true },
        { label: "Discounted Payback",value: discPayback ? `${discPayback} yrs` : ">30 yrs" },
        { label: "10-Year ROI",       value: fP(roi) },
        { label: "Annual Cash Flow",  value: fC(v.annualCashFlow) },
      ];
    },
  },
  {
    id: "interest-rate", label: "Interest Rate Calculator", category: "Investment",
    inputs: [
      { id: "pv",     label: "Present Value ($)",  defaultVal: 10000, step: 500 },
      { id: "fv",     label: "Future Value ($)",   defaultVal: 18000, step: 500 },
      { id: "years",  label: "Years",              defaultVal: 7,     step: 1   },
      { id: "pmt",    label: "Annual Payment ($)", defaultVal: 0,     step: 100 },
    ],
    calculate: (v) => {
      // Solve for rate using simple case (no payments)
      const rate = (Math.pow(v.fv / v.pv, 1 / v.years) - 1) * 100;
      const monthly = (Math.pow(1 + rate / 100, 1/12) - 1) * 100;
      return [
        { label: "Annual Rate",     value: fP(rate), highlight: true },
        { label: "Monthly Rate",    value: fP(monthly, 4) },
        { label: "Total Growth",    value: fP((v.fv - v.pv) / v.pv * 100) },
        { label: "EAR",             value: fP((Math.pow(1 + rate/100/12, 12) - 1) * 100) },
      ];
    },
  },
  {
    id: "mutual-fund", label: "Mutual Fund Calculator", category: "Investment",
    inputs: [
      { id: "initial",  label: "Initial Investment ($)", defaultVal: 10000, step: 1000 },
      { id: "monthly",  label: "Monthly Contribution ($)",defaultVal: 300,  step: 50   },
      { id: "gross",    label: "Expected Return (%/yr)", defaultVal: 9,     step: 0.5  },
      { id: "expense",  label: "Expense Ratio (%)",      defaultVal: 0.75,  step: 0.05 },
      { id: "years",    label: "Years",                  defaultVal: 20,    step: 1    },
    ],
    calculate: (v) => {
      const calcFV = (rate) => {
        const r = rate / 100 / 12, n = v.years * 12;
        return v.initial * Math.pow(1+r,n) + v.monthly * (Math.pow(1+r,n) - 1) / r;
      };
      const grossFV = calcFV(v.gross);
      const netFV   = calcFV(v.gross - v.expense);
      const feesDrag = grossFV - netFV;
      return [
        { label: "Net Value",       value: fC(netFV, 0), highlight: true },
        { label: "Gross Value",     value: fC(grossFV, 0) },
        { label: "Fees Paid",       value: fC(feesDrag, 0) },
        { label: "Total Deposited", value: fC(v.initial + v.monthly * v.years * 12, 0) },
      ];
    },
  },
  {
    id: "bond-calc", label: "Bond Calculator", category: "Investment",
    inputs: [
      { id: "face",    label: "Face Value ($)",       defaultVal: 1000,  step: 100  },
      { id: "coupon",  label: "Coupon Rate (%)",      defaultVal: 5,     step: 0.25 },
      { id: "ytm",     label: "Yield to Maturity (%)",defaultVal: 6,     step: 0.25 },
      { id: "years",   label: "Years to Maturity",    defaultVal: 10,    step: 1    },
      { id: "freq",    label: "Payments per Year",    defaultVal: 2,     step: 1    },
    ],
    calculate: (v) => {
      const c = (v.coupon / 100 * v.face) / v.freq;
      const r = v.ytm / 100 / v.freq;
      const n = v.years * v.freq;
      const price = c * (1 - Math.pow(1+r,-n)) / r + v.face * Math.pow(1+r,-n);
      const currentYield = (v.coupon / 100 * v.face) / price * 100;
      const premium = price - v.face;
      return [
        { label: "Bond Price",      value: fC(price), highlight: true },
        { label: "Current Yield",   value: fP(currentYield) },
        { label: "Premium/Discount",value: fC(premium) },
        { label: "Annual Income",   value: fC(v.coupon / 100 * v.face) },
      ];
    },
  },

  /* ═══ RETIREMENT ═══════════════════════════════════════════════════════════ */
  {
    id: "401k-calc", label: "401K Calculator", category: "Retirement",
    inputs: [
      { id: "salary",     label: "Annual Salary ($)",          defaultVal: 85000, step: 5000 },
      { id: "contribPct", label: "Your Contribution (%)",      defaultVal: 10,    step: 1    },
      { id: "matchPct",   label: "Employer Match (%)",         defaultVal: 4,     step: 1    },
      { id: "curBal",     label: "Current Balance ($)",        defaultVal: 25000, step: 1000 },
      { id: "curAge",     label: "Current Age",                defaultVal: 35,    step: 1    },
      { id: "retAge",     label: "Retirement Age",             defaultVal: 65,    step: 1    },
      { id: "growth",     label: "Expected Return (%/yr)",     defaultVal: 7,     step: 0.5  },
    ],
    calculate: (v) => {
      const years = v.retAge - v.curAge;
      const yourAnnual  = v.salary * v.contribPct / 100;
      const matchAnnual = v.salary * Math.min(v.matchPct, v.contribPct) / 100;
      const totalAnnual = yourAnnual + matchAnnual;
      const r = v.growth / 100;
      const fvBal  = v.curBal * Math.pow(1+r, years);
      const fvContribs = totalAnnual * (Math.pow(1+r, years) - 1) / r;
      const total = fvBal + fvContribs;
      return [
        { label: "Balance at Retirement", value: fC(total, 0), highlight: true },
        { label: "Your Contributions",    value: fC(yourAnnual * years, 0) },
        { label: "Employer Match Total",  value: fC(matchAnnual * years, 0) },
        { label: "Investment Growth",     value: fC(total - v.curBal - totalAnnual * years, 0) },
      ];
    },
  },
  {
    id: "roth-ira", label: "Roth IRA Calculator", category: "Retirement",
    inputs: [
      { id: "annual",   label: "Annual Contribution ($)", defaultVal: 7000,  step: 500  },
      { id: "curBal",   label: "Current Balance ($)",     defaultVal: 10000, step: 1000 },
      { id: "curAge",   label: "Current Age",             defaultVal: 30,    step: 1    },
      { id: "retAge",   label: "Retirement Age",          defaultVal: 65,    step: 1    },
      { id: "growth",   label: "Annual Growth Rate (%)",  defaultVal: 7,     step: 0.5  },
    ],
    calculate: (v) => {
      const years = v.retAge - v.curAge;
      const r = v.growth / 100;
      const fvBal    = v.curBal * Math.pow(1+r, years);
      const fvContr  = v.annual * (Math.pow(1+r, years) - 1) / r;
      const total    = fvBal + fvContr;
      const contributed = v.curBal + v.annual * years;
      const growth   = total - contributed;
      return [
        { label: "Tax-Free Balance",    value: fC(total, 0), highlight: true },
        { label: "Total Contributed",   value: fC(contributed, 0) },
        { label: "Tax-Free Growth",     value: fC(growth, 0) },
        { label: "Effective Rate",      value: fP(growth / contributed * 100) },
      ];
    },
  },
  {
    id: "ira-calc", label: "IRA Calculator", category: "Retirement",
    inputs: [
      { id: "annual",    label: "Annual Contribution ($)",  defaultVal: 7000,  step: 500  },
      { id: "curBal",    label: "Current Balance ($)",      defaultVal: 15000, step: 1000 },
      { id: "curAge",    label: "Current Age",              defaultVal: 40,    step: 1    },
      { id: "retAge",    label: "Retirement Age",           defaultVal: 65,    step: 1    },
      { id: "growth",    label: "Annual Return (%)",        defaultVal: 7,     step: 0.5  },
      { id: "taxRate",   label: "Tax Rate (%)",             defaultVal: 24,    step: 1    },
    ],
    calculate: (v) => {
      const years = v.retAge - v.curAge;
      const r = v.growth / 100;
      const fvBal   = v.curBal * Math.pow(1+r, years);
      const fvContr = v.annual * (Math.pow(1+r, years) - 1) / r;
      const tradIRA = fvBal + fvContr;
      const rothIRA = tradIRA * (1 - v.taxRate / 100);
      const taxDeferralNow = v.annual * (v.taxRate / 100);
      return [
        { label: "Traditional IRA",    value: fC(tradIRA, 0), highlight: true },
        { label: "After-Tax Equiv.",   value: fC(rothIRA, 0) },
        { label: "Annual Tax Savings", value: fC(taxDeferralNow) },
        { label: "Years to Grow",      value: `${years} yrs` },
      ];
    },
  },
  {
    id: "pension-calc", label: "Pension Calculator", category: "Retirement",
    inputs: [
      { id: "salary",      label: "Final Salary ($)",       defaultVal: 80000, step: 5000 },
      { id: "years",       label: "Years of Service",       defaultVal: 25,    step: 1    },
      { id: "multiplier",  label: "Benefit Multiplier (%)", defaultVal: 2,     step: 0.25 },
      { id: "cola",        label: "COLA Adjustment (%/yr)", defaultVal: 2,     step: 0.25 },
      { id: "lifeExp",     label: "Life Expectancy (age)",  defaultVal: 85,    step: 1    },
      { id: "retAge",      label: "Retirement Age",         defaultVal: 62,    step: 1    },
    ],
    calculate: (v) => {
      const annual = v.salary * (v.multiplier / 100) * v.years;
      const monthly = annual / 12;
      const paidYears = v.lifeExp - v.retAge;
      // Total with COLA
      let totalPaid = 0, ann = annual;
      for (let i = 0; i < paidYears; i++) { totalPaid += ann; ann *= (1 + v.cola/100); }
      return [
        { label: "Annual Pension",     value: fC(annual, 0), highlight: true },
        { label: "Monthly Pension",    value: fC(monthly) },
        { label: "Lifetime Payout",    value: fC(totalPaid, 0) },
        { label: "Replacement Rate",   value: fP(annual / v.salary * 100) },
      ];
    },
  },
  {
    id: "annuity-calc", label: "Annuity Calculator", category: "Retirement",
    inputs: [
      { id: "pv",      label: "Lump Sum / PV ($)",      defaultVal: 250000, step: 10000 },
      { id: "rate",    label: "Annual Rate (%)",         defaultVal: 5,      step: 0.25  },
      { id: "years",   label: "Payout Period (years)",  defaultVal: 20,     step: 1     },
    ],
    calculate: (v) => {
      const r = v.rate / 100 / 12, n = v.years * 12;
      const monthly = v.pv * r / (1 - Math.pow(1+r,-n));
      const total = monthly * n;
      const interest = total - v.pv;
      return [
        { label: "Monthly Payout",   value: fC(monthly), highlight: true },
        { label: "Total Received",   value: fC(total, 0) },
        { label: "Interest Earned",  value: fC(interest, 0) },
        { label: "Annual Payout",    value: fC(monthly * 12) },
      ];
    },
  },
  {
    id: "social-security", label: "Social Security Estimator", category: "Retirement",
    inputs: [
      { id: "avgEarnings",label: "Avg Annual Earnings ($)", defaultVal: 70000, step: 5000 },
      { id: "claimAge",   label: "Claim Age",               defaultVal: 67,    step: 1    },
    ],
    calculate: (v) => {
      // Simplified SSA formula based on AIME
      const aime = v.avgEarnings / 12;
      // 2024 bend points: $1174 and $7078
      const pia = aime <= 1174 ? aime * 0.90
        : aime <= 7078 ? 1174 * 0.90 + (aime - 1174) * 0.32
        : 1174 * 0.90 + (7078 - 1174) * 0.32 + (aime - 7078) * 0.15;
      // Adjustment for age
      const adj = v.claimAge < 67 ? 1 - (67 - v.claimAge) * 0.0667
        : 1 + (v.claimAge - 67) * 0.08;
      const monthly = Math.round(pia * adj);
      return [
        { label: "Est. Monthly Benefit", value: fC(monthly), highlight: true },
        { label: "Annual Benefit",       value: fC(monthly * 12, 0) },
        { label: "Claim Age",            value: String(v.claimAge) },
        { label: "PIA (full benefit)",   value: fC(pia) },
      ];
    },
  },
  {
    id: "rmd-calc", label: "RMD Calculator", category: "Retirement",
    inputs: [
      { id: "balance",   label: "Account Balance ($)", defaultVal: 500000, step: 10000 },
      { id: "age",       label: "Your Age",            defaultVal: 73,     step: 1     },
    ],
    calculate: (v) => {
      // IRS Uniform Lifetime Table (simplified)
      const irtTable = {70:27.4,71:26.5,72:25.6,73:24.7,74:23.8,75:22.9,76:22.0,77:21.2,78:20.3,79:19.5,80:18.7,81:17.9,82:17.1,83:16.3,84:15.5,85:14.8,86:14.1,87:13.4,88:12.7,89:12.0,90:11.4};
      const factor = irtTable[Math.min(Math.max(v.age, 70), 90)] || 10;
      const rmd = v.balance / factor;
      return [
        { label: "Required Distribution", value: fC(rmd, 0), highlight: true },
        { label: "Life Expectancy Factor",value: fN(factor, 1) },
        { label: "As % of Account",       value: fP(rmd / v.balance * 100) },
        { label: "Monthly Equivalent",    value: fC(rmd / 12) },
      ];
    },
  },
  {
    id: "annuity-payout", label: "Annuity Payout Calculator", category: "Retirement",
    inputs: [
      { id: "pmt",    label: "Desired Monthly Payout ($)", defaultVal: 3000, step: 100  },
      { id: "rate",   label: "Annual Rate (%)",             defaultVal: 5,    step: 0.25 },
      { id: "years",  label: "Payout Period (years)",       defaultVal: 20,   step: 1    },
    ],
    calculate: (v) => {
      const r = v.rate / 100 / 12, n = v.years * 12;
      const pv = v.pmt * (1 - Math.pow(1+r,-n)) / r;
      const total = v.pmt * n;
      return [
        { label: "Lump Sum Needed",   value: fC(pv, 0), highlight: true },
        { label: "Total Received",    value: fC(total, 0) },
        { label: "Interest Earned",   value: fC(total - pv, 0) },
        { label: "Annual Payout",     value: fC(v.pmt * 12) },
      ];
    },
  },

  /* ═══ TAX & SALARY ════════════════════════════════════════════════════════ */
  {
    id: "income-tax", label: "Income Tax Calculator", category: "Tax & Salary",
    inputs: [
      { id: "income",  label: "Gross Income ($)",      defaultVal: 95000, step: 5000 },
      { id: "filing",  label: "Standard Deduction ($)",defaultVal: TAX_2026.standardDeduction.single, step: 100  },
      { id: "other",   label: "Other Deductions ($)",  defaultVal: 0,     step: 500  },
    ],
    calculate: (v) => {
      const taxable = Math.max(0, v.income - v.filing - v.other);
      // 2026 single brackets
      const brackets = TAX_2026.ordinaryBrackets.single.map(b => [b.upTo, b.rate]);
      let tax = 0, prev = 0;
      for (const [limit, rate] of brackets) {
        if (taxable <= prev) break;
        tax += (Math.min(taxable, limit) - prev) * rate;
        prev = limit;
      }
      const effective = tax / v.income * 100;
      const marginal = brackets.find(([l]) => taxable <= l)?.[1] * 100 || 37;
      return [
        { label: "Federal Tax",      value: fC(tax, 0), highlight: true },
        { label: "Effective Rate",   value: fP(effective) },
        { label: "Marginal Rate",    value: fP(marginal) },
        { label: "After-Tax Income", value: fC(v.income - tax, 0) },
      ];
    },
  },
  {
    id: "salary-conv", label: "Salary Converter", category: "Tax & Salary",
    inputs: [
      { id: "amount",    label: "Amount ($)",          defaultVal: 30,   step: 0.5  },
      { id: "hoursWeek", label: "Hours per Week",      defaultVal: 40,   step: 1    },
      { id: "weeksYear", label: "Weeks per Year",      defaultVal: 52,   step: 1    },
    ],
    calculate: (v) => {
      const hourly  = v.amount;
      const daily   = hourly * (v.hoursWeek / 5);
      const weekly  = hourly * v.hoursWeek;
      const monthly = weekly * v.weeksYear / 12;
      const annual  = weekly * v.weeksYear;
      return [
        { label: "Annual Salary",   value: fC(annual, 0), highlight: true },
        { label: "Monthly",         value: fC(monthly) },
        { label: "Weekly",          value: fC(weekly) },
        { label: "Daily",           value: fC(daily) },
      ];
    },
  },
  {
    id: "take-home", label: "Take-Home Pay Calculator", category: "Tax & Salary",
    inputs: [
      { id: "gross",      label: "Annual Gross Salary ($)", defaultVal: 90000, step: 5000 },
      { id: "fedRate",    label: "Federal Tax Rate (%)",    defaultVal: 22,    step: 1    },
      { id: "stateRate",  label: "State Tax Rate (%)",      defaultVal: 5,     step: 0.5  },
      { id: "retirement", label: "401K Contribution (%)",   defaultVal: 6,     step: 1    },
    ],
    calculate: (v) => {
      const fedTax   = v.gross * v.fedRate / 100;
      const stateTax = v.gross * v.stateRate / 100;
      const fica     = v.gross * 0.0765; // SS + Medicare
      const ret      = v.gross * v.retirement / 100;
      const takeHome = v.gross - fedTax - stateTax - fica - ret;
      return [
        { label: "Annual Take-Home",  value: fC(takeHome, 0), highlight: true },
        { label: "Monthly Take-Home", value: fC(takeHome / 12) },
        { label: "Total Taxes",       value: fC(fedTax + stateTax + fica, 0) },
        { label: "Effective Tax Rate",value: fP((fedTax + stateTax + fica) / v.gross * 100) },
      ];
    },
  },
  {
    id: "estate-tax", label: "Estate Tax Calculator", category: "Tax & Salary",
    inputs: [
      { id: "estate",    label: "Gross Estate Value ($)",  defaultVal: 15000000, step: 500000 },
      { id: "debts",     label: "Debts & Expenses ($)",    defaultVal: 500000,   step: 100000 },
      { id: "exemption", label: "Federal Exemption ($)",   defaultVal: TAX_2026.estate.lifetimeExemption, step: 100000 },
    ],
    calculate: (v) => {
      const netEstate = v.estate - v.debts;
      const taxable   = Math.max(0, netEstate - v.exemption);
      const tax       = taxable * 0.40;
      const effective = v.estate > 0 ? tax / v.estate * 100 : 0;
      return [
        { label: "Estate Tax",       value: fC(tax, 0), highlight: true },
        { label: "Taxable Estate",   value: fC(taxable, 0) },
        { label: "Effective Rate",   value: fP(effective) },
        { label: "After-Tax Estate", value: fC(netEstate - tax, 0) },
      ];
    },
  },
  {
    id: "marriage-tax", label: "Marriage Tax Calculator", category: "Tax & Salary",
    inputs: [
      { id: "income1", label: "Spouse 1 Income ($)", defaultVal: 85000, step: 5000 },
      { id: "income2", label: "Spouse 2 Income ($)", defaultVal: 65000, step: 5000 },
    ],
    calculate: (v) => {
      const calcTax = (income, deduction) => {
        const taxable = Math.max(0, income - deduction);
        const brackets = TAX_2026.ordinaryBrackets.single.map(b => [b.upTo, b.rate]);
        let tax = 0, prev = 0;
        for (const [limit, rate] of brackets) {
          if (taxable <= prev) break;
          tax += (Math.min(taxable, limit) - prev) * rate;
          prev = limit;
        }
        return tax;
      };
      const mfjBrackets = TAX_2026.ordinaryBrackets.mfj.map(b => [b.upTo, b.rate]);
      const combined = v.income1 + v.income2;
      const taxable  = Math.max(0, combined - TAX_2026.standardDeduction.mfj);
      let mfjTax = 0, prev = 0;
      for (const [limit, rate] of mfjBrackets) {
        if (taxable <= prev) break;
        mfjTax += (Math.min(taxable, limit) - prev) * rate;
        prev = limit;
      }
      const singleTax = calcTax(v.income1, TAX_2026.standardDeduction.single) + calcTax(v.income2, TAX_2026.standardDeduction.single);
      const diff = mfjTax - singleTax;
      return [
        { label: "MFJ Tax",         value: fC(mfjTax, 0), highlight: true },
        { label: "Single Total Tax", value: fC(singleTax, 0) },
        { label: diff >= 0 ? "Marriage Penalty" : "Marriage Bonus", value: fC(Math.abs(diff), 0) },
        { label: "Combined Income",  value: fC(combined, 0) },
      ];
    },
  },

  /* ═══ DEBT & CREDIT ═══════════════════════════════════════════════════════ */
  {
    id: "credit-card", label: "Credit Card Calculator", category: "Debt & Credit",
    inputs: [
      { id: "balance",  label: "Balance ($)",          defaultVal: 5000,  step: 100  },
      { id: "apr",      label: "APR (%)",               defaultVal: 24.99, step: 0.1  },
      { id: "payment",  label: "Monthly Payment ($)",   defaultVal: 150,   step: 25   },
    ],
    calculate: (v) => {
      const r = v.apr / 100 / 12;
      const minPmt = v.balance * r;
      if (v.payment <= minPmt) return [{ label: "Error", value: "Payment too low to pay off debt" }];
      const months = Math.log(v.payment / (v.payment - v.balance * r)) / Math.log(1 + r);
      const totalPaid = v.payment * months;
      const interest = totalPaid - v.balance;
      return [
        { label: "Payoff Time",     value: fYM(months), highlight: true },
        { label: "Total Interest",  value: fC(interest) },
        { label: "Total Paid",      value: fC(totalPaid) },
        { label: "Interest %",      value: fP(interest / totalPaid * 100) },
      ];
    },
  },
  {
    id: "cc-payoff", label: "Credit Card Payoff", category: "Debt & Credit",
    inputs: [
      { id: "balance",   label: "Balance ($)",           defaultVal: 8000,  step: 100 },
      { id: "apr",       label: "APR (%)",                defaultVal: 22.99, step: 0.1 },
      { id: "targetMos", label: "Pay Off in (months)",    defaultVal: 24,    step: 1   },
    ],
    calculate: (v) => {
      const r = v.apr / 100 / 12, n = v.targetMos;
      const pmt = v.balance * r / (1 - Math.pow(1+r,-n));
      const total = pmt * n;
      const interest = total - v.balance;
      // Min payment scenario (1% of balance + interest, min $25)
      const minPmt = Math.max(25, v.balance * 0.01 + v.balance * r);
      const moMin = minPmt > v.balance * r ? Math.log(minPmt / (minPmt - v.balance * r)) / Math.log(1 + r) : null;
      return [
        { label: "Required Payment",  value: fC(pmt), highlight: true },
        { label: "Total Interest",    value: fC(interest) },
        { label: "Min Pay Time",      value: moMin ? fYM(moMin) : "Forever" },
        { label: "Interest Saved",    value: fC(moMin ? (minPmt * moMin - v.balance) - interest : 0) },
      ];
    },
  },
  {
    id: "debt-consolidation", label: "Debt Consolidation", category: "Debt & Credit",
    inputs: [
      { id: "debt1Bal",  label: "Debt 1 Balance ($)",    defaultVal: 8000, step: 500  },
      { id: "debt1Rate", label: "Debt 1 Rate (%)",       defaultVal: 24.99,step: 0.5  },
      { id: "debt2Bal",  label: "Debt 2 Balance ($)",    defaultVal: 5000, step: 500  },
      { id: "debt2Rate", label: "Debt 2 Rate (%)",       defaultVal: 19.99,step: 0.5  },
      { id: "consolRate",label: "Consolidation Rate (%)",defaultVal: 10.5, step: 0.25 },
      { id: "consolTerm",label: "Consolidation Term (yr)",defaultVal: 5,   step: 1    },
    ],
    calculate: (v) => {
      const totalBal = v.debt1Bal + v.debt2Bal;
      const r = v.consolRate / 100 / 12, n = v.consolTerm * 12;
      const consolPmt = totalBal * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1);
      const totalConsolPaid = consolPmt * n;
      const interestConsolSaved = totalConsolPaid - totalBal;
      // Current min payments (estimated)
      const currPmt1 = v.debt1Bal * (v.debt1Rate / 100 / 12) * 1.01;
      const currPmt2 = v.debt2Bal * (v.debt2Rate / 100 / 12) * 1.01;
      const currTotal = currPmt1 + currPmt2;
      return [
        { label: "New Monthly Payment", value: fC(consolPmt), highlight: true },
        { label: "Current Payments",    value: fC(currTotal) },
        { label: "Monthly Savings",     value: fC(currTotal - consolPmt) },
        { label: "Total Interest",      value: fC(interestConsolSaved) },
      ];
    },
  },
  {
    id: "student-loan", label: "Student Loan Calculator", category: "Debt & Credit",
    inputs: [
      { id: "balance",  label: "Loan Balance ($)",    defaultVal: 35000, step: 1000 },
      { id: "rate",     label: "Interest Rate (%)",   defaultVal: 6.5,   step: 0.1  },
      { id: "term",     label: "Repayment Term (yr)", defaultVal: 10,    step: 1    },
    ],
    calculate: (v) => {
      const r = v.rate / 100 / 12, n = v.term * 12;
      const M = v.balance * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1);
      const total = M * n, interest = total - v.balance;
      const extendedPmt = v.balance * r * Math.pow(1+r,300) / (Math.pow(1+r,300) - 1);
      return [
        { label: "Monthly Payment",   value: fC(M), highlight: true },
        { label: "Total Interest",    value: fC(interest) },
        { label: "Total Paid",        value: fC(total) },
        { label: "25-Yr Payment",     value: fC(extendedPmt) },
      ];
    },
  },
  {
    id: "personal-loan", label: "Personal Loan Calculator", category: "Debt & Credit",
    inputs: [
      { id: "amount",   label: "Loan Amount ($)",    defaultVal: 15000, step: 500  },
      { id: "rate",     label: "Interest Rate (%)",  defaultVal: 11.5,  step: 0.25 },
      { id: "term",     label: "Term (years)",       defaultVal: 3,     step: 1    },
      { id: "origFee",  label: "Origination Fee (%):",defaultVal: 2,   step: 0.25 },
    ],
    calculate: (v) => {
      const fee = v.amount * v.origFee / 100;
      const netProceeds = v.amount - fee;
      const r = v.rate / 100 / 12, n = v.term * 12;
      const M = v.amount * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1);
      const total = M * n, interest = total - v.amount;
      return [
        { label: "Monthly Payment",  value: fC(M), highlight: true },
        { label: "Total Interest",   value: fC(interest) },
        { label: "Origination Fee",  value: fC(fee) },
        { label: "Net Proceeds",     value: fC(netProceeds) },
      ];
    },
  },

  /* ═══ BUSINESS ════════════════════════════════════════════════════════════ */
  {
    id: "business-loan", label: "Business Loan Calculator", category: "Business",
    inputs: [
      { id: "amount",  label: "Loan Amount ($)",    defaultVal: 100000, step: 5000 },
      { id: "rate",    label: "Annual Rate (%)",    defaultVal: 8.5,    step: 0.25 },
      { id: "term",    label: "Term (years)",       defaultVal: 5,      step: 1    },
    ],
    calculate: (v) => {
      const r = v.rate / 100 / 12, n = v.term * 12;
      const M = v.amount * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1);
      const total = M * n;
      return [
        { label: "Monthly Payment", value: fC(M), highlight: true },
        { label: "Total Interest",  value: fC(total - v.amount) },
        { label: "Total Cost",      value: fC(total) },
        { label: "Annual Cost",     value: fC(M * 12) },
      ];
    },
  },
  {
    id: "margin-calc", label: "Margin Calculator", category: "Business",
    inputs: [
      { id: "cost",    label: "Cost ($)",          defaultVal: 50, step: 1 },
      { id: "price",   label: "Selling Price ($)", defaultVal: 80, step: 1 },
    ],
    calculate: (v) => {
      const profit = v.price - v.cost;
      const margin  = profit / v.price * 100;
      const markup  = profit / v.cost * 100;
      return [
        { label: "Gross Margin",  value: fP(margin), highlight: true },
        { label: "Markup",        value: fP(markup) },
        { label: "Profit",        value: fC(profit) },
        { label: "Profit Ratio",  value: fN(v.price / v.cost, 2) + "x" },
      ];
    },
  },
  {
    id: "depreciation", label: "Depreciation Calculator", category: "Business",
    inputs: [
      { id: "cost",      label: "Asset Cost ($)",       defaultVal: 50000, step: 1000 },
      { id: "salvage",   label: "Salvage Value ($)",    defaultVal: 5000,  step: 500  },
      { id: "life",      label: "Useful Life (years)",  defaultVal: 5,     step: 1    },
    ],
    calculate: (v) => {
      const depreciable = v.cost - v.salvage;
      const straightLine = depreciable / v.life;
      const ddb = (2 / v.life) * v.cost;
      const sumDigits = v.life * (v.life + 1) / 2;
      const sum1 = (depreciable * v.life) / sumDigits;
      return [
        { label: "Straight-Line/yr",  value: fC(straightLine), highlight: true },
        { label: "Double Declining",  value: fC(ddb) + " (Yr 1)" },
        { label: "Sum-of-Digits",     value: fC(sum1) + " (Yr 1)" },
        { label: "Total Depreciation",value: fC(depreciable) },
      ];
    },
  },
  {
    id: "commission-calc", label: "Commission Calculator", category: "Business",
    inputs: [
      { id: "sales",      label: "Sales Amount ($)",       defaultVal: 50000, step: 1000 },
      { id: "rate",       label: "Commission Rate (%)",    defaultVal: 5,     step: 0.25 },
      { id: "base",       label: "Base Salary ($)",        defaultVal: 3000,  step: 100  },
    ],
    calculate: (v) => {
      const commission = v.sales * v.rate / 100;
      const total = v.base + commission;
      const effectiveRate = commission / v.sales * 100;
      return [
        { label: "Commission",       value: fC(commission), highlight: true },
        { label: "Total Earnings",   value: fC(total) },
        { label: "Effective Rate",   value: fP(effectiveRate) },
        { label: "Base + Commission",value: `${fC(v.base)} + ${fC(commission)}` },
      ];
    },
  },

  /* ═══ OTHER ═══════════════════════════════════════════════════════════════ */
  {
    id: "inflation-calc", label: "Inflation Calculator", category: "Other",
    inputs: [
      { id: "amount",    label: "Current Amount ($)",    defaultVal: 100000, step: 5000 },
      { id: "years",     label: "Years in the Future",   defaultVal: 20,     step: 1    },
      { id: "inflation", label: "Inflation Rate (%/yr)", defaultVal: 3.0,    step: 0.25 },
    ],
    calculate: (v) => {
      const future = v.amount * Math.pow(1 + v.inflation / 100, v.years);
      const loss   = future - v.amount;
      const power  = v.amount / future * 100;
      return [
        { label: "Future Equivalent",  value: fC(future, 0), highlight: true },
        { label: "Purchasing Power",   value: fP(power) + " of today" },
        { label: "Real Value Loss",    value: fC(loss, 0) },
        { label: "Needed in Future",   value: fC(future, 0) + " for same goods" },
      ];
    },
  },
  {
    id: "college-cost", label: "College Cost Calculator", category: "Other",
    inputs: [
      { id: "annualCost", label: "Current Annual Cost ($)",  defaultVal: 35000, step: 1000 },
      { id: "years",      label: "Years Until Enrollment",   defaultVal: 10,    step: 1    },
      { id: "duration",   label: "Years in College",         defaultVal: 4,     step: 1    },
      { id: "inflation",  label: "College Inflation (%/yr)", defaultVal: 5,     step: 0.25 },
      { id: "savings",    label: "Current Savings ($)",      defaultVal: 15000, step: 1000 },
      { id: "monthly",    label: "Monthly Savings ($)",      defaultVal: 500,   step: 50   },
    ],
    calculate: (v) => {
      let totalCost = 0;
      for (let y = 0; y < v.duration; y++) {
        totalCost += v.annualCost * Math.pow(1 + v.inflation / 100, v.years + y);
      }
      const r = 0.06 / 12, n = v.years * 12;
      const projectedSavings = v.savings * Math.pow(1 + 0.06, v.years)
        + v.monthly * (Math.pow(1 + r, n) - 1) / r;
      const shortfall = Math.max(0, totalCost - projectedSavings);
      return [
        { label: "Projected Total Cost",value: fC(totalCost, 0), highlight: true },
        { label: "Projected Savings",   value: fC(projectedSavings, 0) },
        { label: "Funding Gap",         value: fC(shortfall, 0) },
        { label: "Yr 1 Projected Cost", value: fC(v.annualCost * Math.pow(1 + v.inflation/100, v.years), 0) },
      ];
    },
  },
  {
    id: "payment-calc", label: "Payment Calculator", category: "Other",
    inputs: [
      { id: "amount",  label: "Loan / Purchase ($)", defaultVal: 20000, step: 500  },
      { id: "rate",    label: "Interest Rate (%)",   defaultVal: 7.0,   step: 0.1  },
      { id: "term",    label: "Term (months)",       defaultVal: 48,    step: 6    },
    ],
    calculate: (v) => {
      const r = v.rate / 100 / 12, n = v.term;
      const M = r > 0 ? v.amount * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1) : v.amount / n;
      const total = M * n;
      return [
        { label: "Monthly Payment",  value: fC(M), highlight: true },
        { label: "Total Interest",   value: fC(total - v.amount) },
        { label: "Total Cost",       value: fC(total) },
        { label: "Term",             value: fYM(n) },
      ];
    },
  },
  {
    id: "discount-calc", label: "Discount Calculator", category: "Other",
    inputs: [
      { id: "original",  label: "Original Price ($)",  defaultVal: 299,  step: 1   },
      { id: "discount",  label: "Discount (%)",        defaultVal: 25,   step: 1   },
      { id: "tax",       label: "Sales Tax (%)",       defaultVal: 8.5,  step: 0.1 },
    ],
    calculate: (v) => {
      const savings    = v.original * v.discount / 100;
      const discounted = v.original - savings;
      const taxAmt     = discounted * v.tax / 100;
      const finalPrice = discounted + taxAmt;
      return [
        { label: "Final Price",    value: fC(finalPrice), highlight: true },
        { label: "Savings",        value: fC(savings) },
        { label: "Price After Disc",value: fC(discounted) },
        { label: "Tax Amount",     value: fC(taxAmt) },
      ];
    },
  },
  {
    id: "budget-calc", label: "Budget Calculator", category: "Other",
    inputs: [
      { id: "income",    label: "Monthly Income ($)",    defaultVal: 6000, step: 250 },
      { id: "housing",   label: "Housing (%)",           defaultVal: 30,   step: 1   },
      { id: "transport", label: "Transportation (%)",    defaultVal: 15,   step: 1   },
      { id: "food",      label: "Food (%)",              defaultVal: 12,   step: 1   },
      { id: "savings",   label: "Savings Target (%)",    defaultVal: 20,   step: 1   },
    ],
    calculate: (v) => {
      const totalPct    = v.housing + v.transport + v.food + v.savings;
      const housingAmt  = v.income * v.housing   / 100;
      const transpAmt   = v.income * v.transport / 100;
      const foodAmt     = v.income * v.food      / 100;
      const savingsAmt  = v.income * v.savings   / 100;
      const discretionary = v.income * (100 - totalPct) / 100;
      return [
        { label: "Savings/Month",    value: fC(savingsAmt), highlight: true },
        { label: "Housing",          value: fC(housingAmt) },
        { label: "Food",             value: fC(foodAmt) },
        { label: "Discretionary",    value: fC(discretionary) },
      ];
    },
  },
  {
    id: "lease-calc", label: "Lease Calculator", category: "Other",
    inputs: [
      { id: "assetVal",   label: "Asset Value ($)",        defaultVal: 50000, step: 1000 },
      { id: "residual",   label: "Residual Value ($)",     defaultVal: 20000, step: 1000 },
      { id: "rate",       label: "Lease Rate (%/yr)",      defaultVal: 6.0,   step: 0.25 },
      { id: "term",       label: "Lease Term (months)",    defaultVal: 36,    step: 12   },
    ],
    calculate: (v) => {
      const r = v.rate / 100 / 12, n = v.term;
      const pv = v.assetVal - v.residual / Math.pow(1+r, n);
      const M  = pv * r / (1 - Math.pow(1+r,-n));
      const total = M * n;
      return [
        { label: "Monthly Lease",    value: fC(M), highlight: true },
        { label: "Total Paid",       value: fC(total) },
        { label: "Cost vs. Buy",     value: fC(v.assetVal - total) + " remaining" },
        { label: "Effective Rate",   value: fP(v.rate) },
      ];
    },
  },
];

/* ── Sidebar category metadata ───────────────────────────────────────────── */
const CATEGORIES = [
  { id: "Mortgage & Real Estate", label: "Mortgage & Real Estate", icon: Home,        color: "#3b82f6" },
  { id: "Auto",                   label: "Auto",                   icon: Car,         color: "#10b981" },
  { id: "Investment",             label: "Investment",             icon: TrendingUp,  color: "var(--teal)" },
  { id: "Retirement",             label: "Retirement",             icon: PiggyBank,   color: "var(--gold)" },
  { id: "Tax & Salary",           label: "Tax & Salary",           icon: Receipt,     color: "#a855f7" },
  { id: "Debt & Credit",          label: "Debt & Credit",          icon: CreditCard,  color: "#f59e0b" },
  { id: "Business",               label: "Business",               icon: Briefcase,   color: "#06b6d4" },
  { id: "Other",                  label: "Other",                  icon: Calculator,  color: "#94a3b8" },
];

/* ── SimpleCalcView ──────────────────────────────────────────────────────── */
function SimpleCalcView({ config }) {
  const init = useMemo(() => Object.fromEntries(config.inputs.map((i) => [i.id, i.defaultVal])), [config.id]);
  const [vals, setVals] = useState(init);
  const setVal = (id) => (e) => setVals((s) => ({ ...s, [id]: parseFloat(e.target.value) ?? 0 }));

  // Reset when config changes
  React.useEffect(() => { setVals(init); }, [config.id]);

  const results = useMemo(() => {
    try { return config.calculate(vals); } catch { return [{ label: "Error", value: "Check inputs" }]; }
  }, [vals, config]);

  const cols = Math.min(results.length, results.length <= 2 ? 2 : 4);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: `color-mix(in srgb, ${config.color || "var(--gold)"} 15%, transparent)`,
          border: `1px solid color-mix(in srgb, ${config.color || "var(--gold)"} 30%, transparent)`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Calculator size={16} style={{ color: config.color || "var(--gold)" }} />
        </div>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.2 }}>{config.label}</h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 22 }}>
        {config.inputs.map((inp) => (
          <div key={inp.id}>
            <label style={LBL}>{inp.label}</label>
            <input
              type="number"
              value={vals[inp.id]}
              step={inp.step || 1}
              min={inp.min ?? 0}
              max={inp.max}
              onChange={setVal(inp.id)}
              style={INP}
            />
          </div>
        ))}
      </div>

      <div style={{ ...RES_WRAP(cols), gridTemplateColumns: `repeat(${Math.min(results.length, 2)}, 1fr)` }}>
        {results.map(({ label, value, highlight }) => (
          <div key={label} style={RES_CARD(highlight, config.color || "var(--gold)")}>
            <div style={{ ...LBL, marginBottom: 5 }}>{label}</div>
            <div style={{
              fontSize: highlight ? "1.25rem" : "1rem", fontWeight: 800,
              color: highlight ? (config.color || "var(--gold)") : "var(--text-1)",
              fontFamily: "monospace", lineHeight: 1,
            }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
function CalcSidebar({ selected, onSelect }) {
  const [open, setOpen] = useState({ "Mortgage & Real Estate": true });
  const toggle = (id) => setOpen((s) => ({ ...s, [id]: !s[id] }));
  const byCategory = useMemo(() => {
    const map = {};
    for (const c of CALC_REGISTRY) {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    }
    return map;
  }, []);

  return (
    <aside style={{
      width: 240, flexShrink: 0, background: "var(--surface)", borderRadius: 12,
      border: "1px solid var(--border-c)", overflowY: "auto", maxHeight: "calc(100vh - 260px)",
    }}>
      <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid var(--border-c)" }}>
        <div style={{ fontSize: "0.625rem", fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          All Calculators
        </div>
      </div>
      {CATEGORIES.map(({ id: catId, label, icon: Icon, color }) => {
        const items = byCategory[catId] || [];
        const isOpen = !!open[catId];
        return (
          <div key={catId} style={{ borderBottom: "1px solid var(--border-c)" }}>
            <button
              onClick={() => toggle(catId)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", background: "none", border: "none",
                cursor: "pointer", textAlign: "left",
              }}
            >
              <Icon size={13} style={{ color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: "0.75rem", fontWeight: 600, color: "var(--text-2)" }}>{label}</span>
              <span style={{ fontSize: "0.625rem", color: "var(--text-3)", marginRight: 4 }}>{items.length}</span>
              {isOpen ? <ChevronDown size={12} style={{ color: "var(--text-3)", flexShrink: 0 }} /> : <ChevronRight size={12} style={{ color: "var(--text-3)", flexShrink: 0 }} />}
            </button>
            {isOpen && (
              <div style={{ paddingBottom: 4 }}>
                {items.map((calc) => {
                  const active = selected === calc.id;
                  return (
                    <button
                      key={calc.id}
                      onClick={() => onSelect(calc.id)}
                      style={{
                        width: "100%", textAlign: "left", padding: "7px 14px 7px 34px",
                        background: active ? `color-mix(in srgb, ${color} 12%, transparent)` : "none",
                        border: "none",
                        cursor: "pointer", fontSize: "0.75rem",
                        color: active ? "var(--text-1)" : "var(--text-3)",
                        fontWeight: active ? 600 : 400,
                        transition: "all 0.12s",
                      }}
                    >
                      {calc.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function Calculators() {
  const [selected, setSelected] = useState("compound");

  const featured = FEATURED.find((f) => f.id === selected);
  const sidebar  = CALC_REGISTRY.find((c) => c.id === selected);
  const catColor = sidebar
    ? CATEGORIES.find((c) => c.id === sidebar.category)?.color || "var(--gold)"
    : null;

  return (
    <div style={{ maxWidth: 1300 }}>
      {/* ── Hero Banner ─────────────────────────────────────────────── */}
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
        {/* Glow accent */}
        <div style={{
          position: "absolute", top: -60, right: -40,
          width: 320, height: 320,
          background: "radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem", position: "relative" }}>
          {/* Left: title + description */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.625rem" }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Calculator size={14} style={{ color: "var(--gold)" }} />
              </div>
              <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em", fontFamily: "'Inter', system-ui, sans-serif" }}>
                FINANCIAL{" "}
                <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: "var(--gold)", fontWeight: 400, fontSize: "1.5rem" }}>Calculators</em>
              </h1>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.65, maxWidth: 560, margin: "0 0 1rem" }}>
              Professional-grade financial tools used by advisors and investors — all in one place.
              Model any scenario instantly: mortgage payments, retirement projections, debt payoff timelines,
              tax savings, investment returns, and more.
            </p>
            {/* Stat pills */}
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              {[
                { label: `${FEATURED.length + CALC_REGISTRY.length} Calculators`, color: "var(--gold)" },
                { label: "8 Categories",        color: "#3b82f6" },
                { label: "Live Results",         color: "var(--teal)" },
                { label: "No Sign-Up Required", color: "#a855f7" },
              ].map(({ label, color }) => (
                <span key={label} style={{
                  fontSize: "0.6875rem", fontWeight: 700, padding: "3px 10px",
                  borderRadius: 99, letterSpacing: "0.04em",
                  background: `color-mix(in srgb, ${color} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
                  color,
                }}>{label}</span>
              ))}
            </div>
          </div>

          {/* Right: 4 category callouts */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem",
            flexShrink: 0,
          }}>
            {[
              { icon: Home,       label: "Mortgage",   sub: "Payments, refi, affordability", color: "#3b82f6" },
              { icon: PiggyBank,  label: "Retirement", sub: "401K, IRA, Roth, pensions",     color: "var(--gold)" },
              { icon: TrendingUp, label: "Investment",  sub: "ROI, compound, bonds, CD",      color: "var(--teal)" },
              { icon: CreditCard, label: "Debt",        sub: "Payoff, consolidation, cards",  color: "#f59e0b" },
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

      {/* Featured 6 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.625rem", marginBottom: "1.25rem" }}>
        {FEATURED.map((calc) => {
          const active = selected === calc.id;
          return (
            <button
              key={calc.id}
              onClick={() => setSelected(calc.id)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                padding: "1rem 0.75rem", cursor: "pointer", textAlign: "center",
                background: active ? `color-mix(in srgb, ${calc.color} 12%, var(--surface))` : "var(--surface)",
                border: `1px solid ${active ? calc.color : "var(--border-c)"}`,
                borderRadius: 12, transition: "all 0.15s",
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `color-mix(in srgb, ${calc.color} 15%, transparent)`,
                border: `1px solid color-mix(in srgb, ${calc.color} 30%, transparent)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <calc.icon size={18} style={{ color: calc.color }} />
              </div>
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: active ? "var(--text-1)" : "var(--text-2)", lineHeight: 1.2 }}>
                {calc.label}
              </div>
              <div style={{ fontSize: "0.5625rem", color: "var(--text-3)", lineHeight: 1.3 }}>
                {calc.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Body: sidebar + active calc */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        <CalcSidebar selected={selected} onSelect={setSelected} />

        <div className="t-card" style={{ flex: 1, padding: "1.5rem", minHeight: 380 }}>
          {featured ? (
            <featured.component />
          ) : sidebar ? (
            <SimpleCalcView config={{ ...sidebar, color: catColor }} key={sidebar.id} />
          ) : null}
        </div>
      </div>

      {/* Disclaimer */}
      <p style={{ fontSize: "0.75rem", color: "var(--text-3)", textAlign: "center", lineHeight: 1.65, maxWidth: 560, margin: "1.25rem auto 0" }}>
        For educational purposes only. Results are estimates based on assumptions and may not reflect actual outcomes.
        Consult a certified financial professional (CFP®, CPA) for personalized advice.
      </p>
    </div>
  );
}
