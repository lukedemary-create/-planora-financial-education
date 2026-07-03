import React, { useState, useMemo } from "react";
import { TAX_2026 } from "../config/taxConstants2026.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend,
} from "recharts";
import {
  Receipt, Calculator, TrendingDown, Shield, DollarSign,
  AlertCircle, CheckCircle, Info, ChevronDown, ChevronUp, Calendar, RefreshCw,
} from "lucide-react";

const G = "var(--gold)";
const T = "var(--teal)";
const S = "var(--surface)";
const B = "var(--border-c)";
const TX1 = "var(--text-1)";
const TX2 = "var(--text-2)";
const TX3 = "var(--text-3)";
const BG = "var(--bg)";
const UP = "var(--up)";
const DOWN = "var(--down)";

/* ── 2026 CFP Tax Brackets (sourced from taxConstants2026.js) ──── */
function _buildBrackets(slabs) {
  return slabs.map((b, i) => ({ rate: b.rate, min: i === 0 ? 0 : slabs[i-1].upTo, max: b.upTo }));
}

const BRACKETS = {
  single: _buildBrackets(TAX_2026.ordinaryBrackets.single),
  mfj:    _buildBrackets(TAX_2026.ordinaryBrackets.mfj),
  mfs:    _buildBrackets(TAX_2026.ordinaryBrackets.mfs),
  hoh:    _buildBrackets(TAX_2026.ordinaryBrackets.hoh),
};

const LTCG_BRACKETS = {
  single: TAX_2026.ltcgBreakpoints.single.map(b => ({ rate: b.rate, max: b.upTo })),
  mfj:    TAX_2026.ltcgBreakpoints.mfj.map(b => ({ rate: b.rate, max: b.upTo })),
  mfs:    TAX_2026.ltcgBreakpoints.mfs.map(b => ({ rate: b.rate, max: b.upTo })),
  hoh:    TAX_2026.ltcgBreakpoints.hoh.map(b => ({ rate: b.rate, max: b.upTo })),
};

const STD_DEDUCTIONS = TAX_2026.standardDeduction;

function calcOrdinaryTax(income, filing) {
  const brackets = BRACKETS[filing];
  let tax = 0;
  for (const b of brackets) {
    if (income <= b.min) break;
    const taxable = Math.min(income, b.max) - b.min;
    tax += taxable * b.rate;
  }
  return tax;
}

function getMarginalRate(income, filing) {
  const brackets = BRACKETS[filing];
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (income > brackets[i].min) return brackets[i].rate;
  }
  return 0.10;
}

function calcLTCGTax(ltcgAmount, totalIncome, filing) {
  const brackets = LTCG_BRACKETS[filing];
  let remaining = ltcgAmount;
  let tax = 0;
  for (const b of brackets) {
    if (totalIncome - remaining >= b.max) continue;
    const space = Math.max(0, b.max - Math.max(totalIncome - remaining, 0));
    const taxable = Math.min(remaining, space);
    tax += taxable * b.rate;
    remaining -= taxable;
    if (remaining <= 0) break;
  }
  return tax;
}

const fmt = (n) => "$" + Math.round(n).toLocaleString();
const fmtPct = (n) => (n * 100).toFixed(1) + "%";

/* ── Stat Box ─────────────────────────────────────────── */
function StatBox({ label, value, sub, color }) {
  return (
    <div style={{ flex: 1, padding: "14px 16px", background: BG, border: `1px solid ${B}`, borderRadius: 10 }}>
      <div style={{ fontSize: 10, color: TX3, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: color || TX1, fontFamily: "monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: TX3, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

/* ── Capital Gains Tab ────────────────────────────────── */
function CapGainsTab() {
  const [filing, setFiling] = useState("single");
  const [income, setIncome] = useState(95000);
  const [stGains, setStGains] = useState(8000);
  const [ltGains, setLtGains] = useState(25000);

  const stdDed = STD_DEDUCTIONS[filing];
  const taxableOrdinary = Math.max(0, income + stGains - stdDed);
  const totalForLTCG = taxableOrdinary + ltGains;

  const ordinaryTax = calcOrdinaryTax(taxableOrdinary, filing);
  const ltcgTax = calcLTCGTax(ltGains, totalForLTCG, filing);
  const niit = totalForLTCG > (filing === "mfj" ? 250000 : 200000) ? ltGains * 0.038 : 0;
  const totalTax = ordinaryTax + ltcgTax + niit;
  const effectiveRate = totalForLTCG > 0 ? totalTax / (income + stGains + ltGains) : 0;
  const marginalRate = getMarginalRate(taxableOrdinary, filing);

  // What if LTCG were short-term instead
  const ltcgAsSTTax = calcOrdinaryTax(taxableOrdinary + ltGains, filing) - ordinaryTax;
  const savings = ltcgAsSTTax - (ltcgTax + niit);

  const BRACKET_COLORS = ["#60a5fa","#34d399","#fbbf24","#f97316","#ef4444","#a855f7","#ec4899"];

  const bracketData = BRACKETS[filing].map((b, i) => {
    const start = b.min;
    const end = Math.min(b.max, taxableOrdinary);
    if (end <= start) return null;
    return { bracket: `${(b.rate * 100).toFixed(0)}%`, amount: end - start, rate: b.rate, color: BRACKET_COLORS[i] };
  }).filter(Boolean);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Inputs */}
      <div className="t-card t-card-p">
        <div style={{ fontSize: 13, fontWeight: 700, color: TX1, marginBottom: 16 }}>Your Situation</div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: TX3, marginBottom: 6 }}>Filing Status</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["single","Single"],["mfj","Married Joint"],["mfs","Married Sep."],["hoh","Head of HH"]].map(([v,l]) => (
              <button key={v} onClick={() => setFiling(v)} style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${filing === v ? G : B}`,
                background: filing === v ? "rgba(201,169,110,0.1)" : "transparent",
                color: filing === v ? G : TX3,
              }}>{l}</button>
            ))}
          </div>
        </div>

        {[
          { label: "Ordinary Income (W-2, wages, etc.)", val: income, set: setIncome, max: 500000, step: 1000 },
          { label: "Short-Term Capital Gains", val: stGains, set: setStGains, max: 200000, step: 1000 },
          { label: "Long-Term Capital Gains (held 1+ year)", val: ltGains, set: setLtGains, max: 500000, step: 1000 },
        ].map(({ label, val, set, max, step }) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: TX3 }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: G, fontFamily: "monospace" }}>{fmt(val)}</span>
            </div>
            <input type="range" min={0} max={max} step={step} value={val}
              onChange={e => set(Number(e.target.value))}
              style={{ width: "100%", accentColor: G }} />
          </div>
        ))}

        {/* Summary callouts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          <div style={{ padding: "10px 12px", background: BG, border: `1px solid ${B}`, borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: G, fontFamily: "monospace" }}>{fmt(totalTax)}</div>
            <div style={{ fontSize: 10, color: TX3 }}>Total Federal Tax</div>
          </div>
          <div style={{ padding: "10px 12px", background: BG, border: `1px solid ${B}`, borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: savings > 0 ? UP : TX1, fontFamily: "monospace" }}>{fmt(savings)}</div>
            <div style={{ fontSize: 10, color: TX3 }}>Saved via LTCG rate</div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="t-card t-card-p">
          <div style={{ fontSize: 13, fontWeight: 700, color: TX1, marginBottom: 12 }}>Tax Breakdown</div>
          {[
            { label: "Standard Deduction", value: -stdDed, color: UP },
            { label: "Taxable Ordinary Income", value: taxableOrdinary },
            { label: "Ordinary Income Tax", value: ordinaryTax, color: DOWN },
            { label: "Long-Term Capital Gains Tax", value: ltcgTax, color: ltcgTax > 0 ? DOWN : TX3 },
            { label: "Net Investment Income Tax (3.8%)", value: niit, color: niit > 0 ? DOWN : TX3 },
            { label: "Total Federal Tax", value: totalTax, color: DOWN, bold: true },
            { label: "Effective Tax Rate", value: fmtPct(effectiveRate), isPct: true, color: G },
            { label: "Marginal Rate (top bracket)", value: fmtPct(marginalRate), isPct: true, color: TX2 },
          ].map(({ label, value, color, bold, isPct }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid var(--border-c)` }}>
              <span style={{ fontSize: 12, color: TX2, fontWeight: bold ? 700 : 400 }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: bold ? 800 : 600, color: color || TX1, fontFamily: "monospace" }}>
                {isPct ? value : (typeof value === "number" ? (value < 0 ? `-${fmt(-value)}` : fmt(value)) : value)}
              </span>
            </div>
          ))}
        </div>

        <div className="t-card t-card-p">
          <div style={{ fontSize: 12, fontWeight: 700, color: TX1, marginBottom: 8 }}>Income by Tax Bracket</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={bracketData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 9, fill: TX3 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="bracket" tick={{ fontSize: 10, fill: TX2 }} width={35} />
              <Tooltip contentStyle={{ background: S, border: `1px solid ${B}`, borderRadius: 6, fontSize: 11, color: "var(--text-1)" }} itemStyle={{ color: "var(--text-1)" }} formatter={v => [fmt(v), "In Bracket"]} />
              <Bar dataKey="amount" radius={[0, 3, 3, 0]}>
                {bracketData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ── Tax Brackets Tab ─────────────────────────────────── */
function BracketsTab() {
  const [filing, setFiling] = useState("single");
  const [income, setIncome] = useState(120000);

  const stdDed = STD_DEDUCTIONS[filing];
  const taxableIncome = Math.max(0, income - stdDed);
  const totalTax = calcOrdinaryTax(taxableIncome, filing);
  const effectiveRate = income > 0 ? totalTax / income : 0;
  const marginalRate = getMarginalRate(taxableIncome, filing);
  const takeHome = income - totalTax;

  // Room left in current bracket
  const brackets = BRACKETS[filing];
  let currentBracket = brackets[0];
  for (const b of brackets) {
    if (taxableIncome > b.min) currentBracket = b;
  }
  const roomLeft = currentBracket.max === Infinity ? Infinity : currentBracket.max - taxableIncome;

  const BRACKET_COLORS = ["#60a5fa","#34d399","#fbbf24","#f97316","#ef4444","#a855f7","#ec4899"];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div className="t-card t-card-p">
        <div style={{ fontSize: 13, fontWeight: 700, color: TX1, marginBottom: 16 }}>2025 Federal Income Tax Brackets</div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {[["single","Single"],["mfj","Married Joint"],["hoh","Head of HH"]].map(([v,l]) => (
              <button key={v} onClick={() => setFiling(v)} style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${filing === v ? G : B}`,
                background: filing === v ? "rgba(201,169,110,0.1)" : "transparent",
                color: filing === v ? G : TX3,
              }}>{l}</button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: TX3 }}>Gross Income</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: G, fontFamily: "monospace" }}>{fmt(income)}</span>
          </div>
          <input type="range" min={0} max={800000} step={5000} value={income}
            onChange={e => setIncome(Number(e.target.value))}
            style={{ width: "100%", accentColor: G }} />
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Rate", "Income Range", "Tax in Bracket"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "6px 8px", fontSize: 10, color: TX3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${B}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BRACKETS[filing].map((b, i) => {
              const isActive = taxableIncome > b.min && (taxableIncome <= b.max || b.max === Infinity);
              const taxInBracket = taxableIncome > b.min
                ? (Math.min(taxableIncome, b.max === Infinity ? taxableIncome : b.max) - b.min) * b.rate
                : 0;
              return (
                <tr key={i} style={{ background: isActive ? "rgba(201,169,110,0.06)" : "transparent" }}>
                  <td style={{ padding: "7px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: BRACKET_COLORS[i], flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: isActive ? 800 : 600, color: isActive ? G : TX2 }}>{(b.rate * 100).toFixed(0)}%</span>
                      {isActive && <span style={{ fontSize: 9, color: G, fontWeight: 700 }}>◀ YOU</span>}
                    </div>
                  </td>
                  <td style={{ padding: "7px 8px", fontSize: 11, color: TX2, fontFamily: "monospace" }}>
                    {fmt(b.min)} – {b.max === Infinity ? "∞" : fmt(b.max)}
                  </td>
                  <td style={{ padding: "7px 8px", fontSize: 11, fontWeight: 600, color: taxInBracket > 0 ? DOWN : TX3, fontFamily: "monospace" }}>
                    {taxInBracket > 0 ? fmt(taxInBracket) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Total Tax", value: fmt(totalTax), color: DOWN },
            { label: "Take-Home Pay", value: fmt(takeHome), color: UP },
            { label: "Effective Rate", value: fmtPct(effectiveRate), color: G },
            { label: "Marginal Rate", value: fmtPct(marginalRate), color: TX1 },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: "12px 14px", background: S, border: `1px solid ${B}`, borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "monospace" }}>{value}</div>
              <div style={{ fontSize: 10, color: TX3, marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        {roomLeft !== Infinity && (
          <div style={{ padding: "12px 16px", background: "rgba(201,169,110,0.06)", border: `1px solid rgba(201,169,110,0.2)`, borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: G, marginBottom: 4 }}>Room Left in Current Bracket</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: TX1, fontFamily: "monospace" }}>{fmt(roomLeft)}</div>
            <div style={{ fontSize: 11, color: TX2, marginTop: 4 }}>You can earn {fmt(roomLeft)} more before hitting the {fmtPct(getMarginalRate(taxableIncome + 1, filing))} bracket</div>
          </div>
        )}

        <div className="t-card t-card-p">
          <div style={{ fontSize: 12, fontWeight: 700, color: TX1, marginBottom: 4 }}>Standard Deduction (2025)</div>
          <div style={{ fontSize: 10, color: TX3, marginBottom: 12 }}>Applied before calculating taxable income</div>
          {[["single","Single / MFS","$15,000"],["mfj","Married Filing Jointly","$30,000"],["hoh","Head of Household","$22,500"]].map(([k,l,v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid var(--border-c)` }}>
              <span style={{ fontSize: 12, color: TX2 }}>{l}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: UP, fontFamily: "monospace" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Roth Conversion Tab ──────────────────────────────── */
function RothTab() {
  const [balance, setBalance] = useState(250000);
  const [currentAge, setCurrentAge] = useState(45);
  const [retireAge, setRetireAge] = useState(65);
  const [currentIncome, setCurrentIncome] = useState(95000);
  const [convertAmount, setConvertAmount] = useState(20000);
  const [retireIncome, setRetireIncome] = useState(60000);
  const [filing, setFiling] = useState("single");

  const conversionTaxCost = calcOrdinaryTax(currentIncome + convertAmount - STD_DEDUCTIONS[filing], filing)
    - calcOrdinaryTax(Math.max(0, currentIncome - STD_DEDUCTIONS[filing]), filing);
  const yearsToRetire = retireAge - currentAge;
  const growthRate = 0.07;
  const rothGrowth = convertAmount * Math.pow(1 + growthRate, yearsToRetire);
  const retireTaxOnTrad = calcOrdinaryTax(Math.max(0, retireIncome + convertAmount - STD_DEDUCTIONS[filing]), filing)
    - calcOrdinaryTax(Math.max(0, retireIncome - STD_DEDUCTIONS[filing]), filing);
  const netBenefit = retireTaxOnTrad - conversionTaxCost;
  const breakevenYears = netBenefit > 0 ? Math.round(conversionTaxCost / (retireTaxOnTrad - conversionTaxCost) * yearsToRetire) : null;

  const projData = Array.from({ length: Math.min(yearsToRetire + 1, 31) }, (_, i) => ({
    year: currentAge + i,
    trad: Math.round(convertAmount * Math.pow(1 + growthRate, i)),
    roth: Math.round(rothGrowth - conversionTaxCost),
  }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div className="t-card t-card-p">
        <div style={{ fontSize: 13, fontWeight: 700, color: TX1, marginBottom: 16 }}>Roth Conversion Analyzer</div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {[["single","Single"],["mfj","MFJ"]].map(([v,l]) => (
              <button key={v} onClick={() => setFiling(v)} style={{
                padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${filing === v ? G : B}`,
                background: filing === v ? "rgba(201,169,110,0.1)" : "transparent",
                color: filing === v ? G : TX3,
              }}>{l}</button>
            ))}
          </div>
        </div>

        {[
          { label: "Traditional IRA/401k Balance", val: balance, set: setBalance, max: 2000000, step: 5000 },
          { label: "Conversion Amount This Year", val: convertAmount, set: setConvertAmount, max: 200000, step: 1000 },
          { label: "Current Annual Income", val: currentIncome, set: setCurrentIncome, max: 400000, step: 2000 },
          { label: "Expected Retirement Income", val: retireIncome, set: setRetireIncome, max: 300000, step: 2000 },
        ].map(({ label, val, set, max, step }) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: TX3 }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: G, fontFamily: "monospace" }}>{fmt(val)}</span>
            </div>
            <input type="range" min={0} max={max} step={step} value={val}
              onChange={e => set(Number(e.target.value))}
              style={{ width: "100%", accentColor: G }} />
          </div>
        ))}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            { l: "Current Age", v: currentAge, set: setCurrentAge, min: 30, max: 72 },
            { l: "Retire Age", v: retireAge, set: setRetireAge, min: 50, max: 80 },
          ].map(({ l, v, set, min, max }) => (
            <div key={l}>
              <div style={{ fontSize: 11, color: TX3, marginBottom: 4 }}>{l}: <b style={{ color: G }}>{v}</b></div>
              <input type="range" min={min} max={max} step={1} value={v}
                onChange={e => set(Number(e.target.value))}
                style={{ width: "100%", accentColor: G }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ padding: "12px 14px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: DOWN, fontFamily: "monospace" }}>{fmt(conversionTaxCost)}</div>
            <div style={{ fontSize: 10, color: TX3, marginTop: 3 }}>Tax Cost Now</div>
          </div>
          <div style={{ padding: "12px 14px", background: "rgba(45,212,164,0.06)", border: "1px solid rgba(45,212,164,0.15)", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: UP, fontFamily: "monospace" }}>{fmt(retireTaxOnTrad)}</div>
            <div style={{ fontSize: 10, color: TX3, marginTop: 3 }}>Tax Saved in Retirement</div>
          </div>
        </div>

        <div style={{ padding: "14px 16px", background: netBenefit > 0 ? "rgba(45,212,164,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${netBenefit > 0 ? "rgba(45,212,164,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: netBenefit > 0 ? UP : DOWN, marginBottom: 4 }}>
            {netBenefit > 0 ? "✓ Conversion Recommended" : "✗ Conversion May Not Be Optimal"}
          </div>
          <div style={{ fontSize: 12, color: TX2, lineHeight: 1.6 }}>
            {netBenefit > 0
              ? `Converting saves ${fmt(netBenefit)} in lifetime taxes. Your tax rate is lower now than it will be in retirement.`
              : `You're in a higher bracket now than you will be in retirement. Consider delaying conversion.`}
          </div>
        </div>

        <div className="t-card t-card-p">
          <div style={{ fontSize: 12, fontWeight: 700, color: TX1, marginBottom: 12 }}>Converted Amount Growth Projection</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={projData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-c)" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: TX3 }} />
              <YAxis tick={{ fontSize: 10, fill: TX3 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: S, border: `1px solid ${B}`, borderRadius: 8, fontSize: 11, color: "var(--text-1)" }} itemStyle={{ color: "var(--text-1)" }} formatter={v => [fmt(v)]} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="trad" name="If Taxed Later" stroke={DOWN} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="roth" name="After-Tax Roth" stroke={UP} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ── RMD Calculator Tab ───────────────────────────────── */
const RMD_TABLE = {72:27.4,73:26.5,74:25.5,75:24.6,76:23.7,77:22.9,78:22.0,79:21.1,80:20.2,81:19.4,82:18.5,83:17.7,84:16.8,85:16.0,86:15.2,87:14.4,88:13.7,89:12.9,90:12.2,91:11.5,92:10.8,93:10.1,94:9.5,95:8.9,96:8.4,97:7.8,98:7.3,99:6.8,100:6.4};

function RMDTab() {
  const [balance, setBalance] = useState(850000);
  const [age, setAge] = useState(74);
  const [otherIncome, setOtherIncome] = useState(45000);
  const [filing, setFiling] = useState("single");

  const divisor = RMD_TABLE[Math.min(Math.max(age, 72), 100)] || 6.4;
  const rmdAmount = balance / divisor;
  const taxOnRMD = calcOrdinaryTax(
    Math.max(0, otherIncome + rmdAmount - STD_DEDUCTIONS[filing]), filing
  ) - calcOrdinaryTax(Math.max(0, otherIncome - STD_DEDUCTIONS[filing]), filing);
  const penalty = rmdAmount * 0.25;

  const futureRMDs = Array.from({ length: 10 }, (_, i) => {
    const a = age + i;
    const div = RMD_TABLE[Math.min(a, 100)] || 6.4;
    const projBal = balance * Math.pow(1.05, i) - (balance / divisor) * i;
    const rmd = Math.max(0, projBal) / div;
    return { age: a, balance: Math.round(Math.max(0, projBal)), rmd: Math.round(rmd), divisor: div };
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div className="t-card t-card-p">
        <div style={{ fontSize: 13, fontWeight: 700, color: TX1, marginBottom: 16 }}>RMD Calculator</div>
        <div style={{ padding: "10px 14px", background: "rgba(201,169,110,0.06)", border: `1px solid rgba(201,169,110,0.2)`, borderRadius: 8, marginBottom: 16, fontSize: 11, color: TX2, lineHeight: 1.6 }}>
          <Info size={11} style={{ color: G, marginRight: 4 }} />
          Required Minimum Distributions begin at age 73 (SECURE 2.0 Act). Missing your RMD triggers a 25% penalty on the amount not withdrawn.
        </div>

        {[
          { label: "IRA / 401k Balance (Dec 31 prior year)", val: balance, set: setBalance, max: 5000000, step: 10000 },
          { label: "Other Annual Income (SS, pension, etc.)", val: otherIncome, set: setOtherIncome, max: 200000, step: 1000 },
        ].map(({ label, val, set, max, step }) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: TX3 }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: G, fontFamily: "monospace" }}>{fmt(val)}</span>
            </div>
            <input type="range" min={0} max={max} step={step} value={val}
              onChange={e => set(Number(e.target.value))}
              style={{ width: "100%", accentColor: G }} />
          </div>
        ))}

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: TX3, marginBottom: 4 }}>Your Age: <b style={{ color: G }}>{age}</b></div>
          <input type="range" min={72} max={100} step={1} value={age}
            onChange={e => setAge(Number(e.target.value))}
            style={{ width: "100%", accentColor: G }} />
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[["single","Single"],["mfj","MFJ"]].map(([v,l]) => (
            <button key={v} onClick={() => setFiling(v)} style={{
              padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${filing === v ? G : B}`,
              background: filing === v ? "rgba(201,169,110,0.1)" : "transparent",
              color: filing === v ? G : TX3,
            }}>{l}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "RMD This Year", value: fmt(rmdAmount), color: G },
            { label: "Tax on RMD", value: fmt(taxOnRMD), color: DOWN },
            { label: "Miss RMD Penalty", value: fmt(penalty), color: DOWN },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: "10px 12px", background: BG, border: `1px solid ${B}`, borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color, fontFamily: "monospace" }}>{value}</div>
              <div style={{ fontSize: 9, color: TX3, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="t-card t-card-p">
        <div style={{ fontSize: 13, fontWeight: 700, color: TX1, marginBottom: 12 }}>10-Year RMD Projection</div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
          <thead>
            <tr>
              {["Age", "Account Balance", "RMD Required", "IRS Divisor"].map(h => (
                <th key={h} style={{ textAlign: h === "Age" ? "left" : "right", padding: "6px 8px", fontSize: 10, color: TX3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${B}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {futureRMDs.map((row, i) => (
              <tr key={row.age} style={{ background: i === 0 ? "rgba(201,169,110,0.04)" : "transparent" }}>
                <td style={{ padding: "7px 8px", fontSize: 12, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? G : TX2 }}>{row.age}{i === 0 ? " (now)" : ""}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontSize: 12, fontFamily: "monospace" }}>{fmt(row.balance)}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontSize: 12, fontFamily: "monospace", color: DOWN, fontWeight: 600 }}>{fmt(row.rmd)}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontSize: 11, color: TX3 }}>{row.divisor}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 12px", background: "rgba(201,169,110,0.06)", border: `1px solid rgba(201,169,110,0.15)`, borderRadius: 8, fontSize: 11, color: TX2, lineHeight: 1.6 }}>
          <b style={{ color: G }}>Strategy:</b> Converting IRA funds to Roth before age 73 reduces future RMDs and can lower your lifetime tax burden significantly.
        </div>
      </div>
    </div>
  );
}

/* ── Tax-Loss Harvesting Tab ──────────────────────────── */
const ETF_PAIRS = [
  { original: "VTI", sub: "SCHB", desc: "Total US Market" },
  { original: "SPY / VOO", sub: "IVV / SPLG", desc: "S&P 500" },
  { original: "QQQ", sub: "QQQM / ONEQ", desc: "NASDAQ / Tech" },
  { original: "VEA", sub: "SPDW / IDEV", desc: "Intl Developed" },
  { original: "VWO", sub: "IEMG / SPEM", desc: "Emerging Markets" },
  { original: "AGG", sub: "BND / SCHZ", desc: "Total Bond Market" },
  { original: "VNQ", sub: "SCHH / USRT", desc: "Real Estate (REIT)" },
  { original: "GLD", sub: "IAU / SGOL", desc: "Gold" },
];

function HarvestTab() {
  const [lossAmount, setLossAmount] = useState(15000);
  const [income, setIncome] = useState(140000);
  const [filing, setFiling] = useState("single");

  const marginal = getMarginalRate(Math.max(0, income - STD_DEDUCTIONS[filing]), filing);
  const taxSavings = lossAmount * marginal;
  const carry = Math.max(0, lossAmount - 3000) * marginal * 0.7; // rough multi-year
  const annualBenefit = taxSavings;
  const tenYearBenefit = annualBenefit * 10 * 1.3; // compounding reinvestment estimate

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="t-card t-card-p">
          <div style={{ fontSize: 13, fontWeight: 700, color: TX1, marginBottom: 16 }}>Tax-Loss Harvesting Calculator</div>
          {[
            { label: "Realized Loss Amount", val: lossAmount, set: setLossAmount, max: 100000, step: 500 },
            { label: "Annual Taxable Income", val: income, set: setIncome, max: 500000, step: 2000 },
          ].map(({ label, val, set, max, step }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: TX3 }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: G, fontFamily: "monospace" }}>{fmt(val)}</span>
              </div>
              <input type="range" min={0} max={max} step={step} value={val}
                onChange={e => set(Number(e.target.value))}
                style={{ width: "100%", accentColor: G }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[["single","Single"],["mfj","MFJ"]].map(([v,l]) => (
              <button key={v} onClick={() => setFiling(v)} style={{
                padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${filing === v ? G : B}`,
                background: filing === v ? "rgba(201,169,110,0.1)" : "transparent",
                color: filing === v ? G : TX3,
              }}>{l}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Tax Savings This Year", value: fmt(taxSavings), color: UP },
              { label: "Your Marginal Rate", value: fmtPct(marginal), color: G },
              { label: "10-Year Benefit (est.)", value: fmt(tenYearBenefit), color: UP },
              { label: "Max Loss vs Gains/Income", value: "$3,000/yr", color: TX2 },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding: "10px 12px", background: BG, border: `1px solid ${B}`, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color, fontFamily: "monospace" }}>{value}</div>
                <div style={{ fontSize: 9, color: TX3, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="t-card t-card-p">
          <div style={{ fontSize: 13, fontWeight: 700, color: TX1, marginBottom: 12 }}>Key Rules</div>
          {[
            { icon: AlertCircle, title: "Wash-Sale Rule", body: "You cannot repurchase the same or substantially identical security within 30 days before or after the sale. Violating this disallows the loss." },
            { icon: Calendar, title: "30-Day Window", body: "The wash-sale window is 61 days total: 30 days before the sale, the day of sale, and 30 days after. Plan your repurchase accordingly." },
            { icon: DollarSign, title: "$3,000 Annual Limit", body: "Losses exceeding your capital gains can offset up to $3,000 of ordinary income per year. Excess losses carry forward indefinitely." },
            { icon: RefreshCw, title: "Carry Forward", body: "Unused losses carry forward to future tax years indefinitely until fully used. Track this on Schedule D." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${B}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TX1, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><Icon size={12} color={G} /> {title}</div>
              <div style={{ fontSize: 11, color: TX2, lineHeight: 1.6 }}>{body}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="t-card t-card-p">
        <div style={{ fontSize: 13, fontWeight: 700, color: TX1, marginBottom: 4 }}>Similar-But-Not-Identical ETF Substitutes</div>
        <div style={{ fontSize: 11, color: TX3, marginBottom: 14 }}>Sell the original to realize the loss, hold the substitute for 31+ days, then switch back if desired.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {ETF_PAIRS.map(({ original, sub, desc }) => (
            <div key={original} style={{ padding: "10px 12px", background: BG, border: `1px solid ${B}`, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: TX3, marginBottom: 4 }}>{desc}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: DOWN }}>{original}</div>
              <div style={{ fontSize: 10, color: TX3, margin: "2px 0" }}>↓ substitute with</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: UP }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────── */
const TABS = [
  { id: "capgains", label: "Capital Gains" },
  { id: "brackets", label: "Tax Brackets" },
  { id: "roth", label: "Roth Conversion" },
  { id: "rmd", label: "RMD Calculator" },
  { id: "harvest", label: "Tax-Loss Harvesting" },
];

export default function TaxPlanning() {
  const [tab, setTab] = useState("capgains");

  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        borderRadius: 20, padding: "2rem 2.25rem",
        marginBottom: 24, position: "relative", overflow: "hidden", backdropFilter: "blur(12px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 var(--border-c)",
      }}>
        <div style={{ position: "absolute", top: -60, right: -40, width: 320, height: 320, background: "radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 0.625rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ display: "inline-block", width: 18, height: 1, background: "var(--gold)", opacity: 0.6 }} />
            Wealth · Planning
          </p>
          <h1 style={{ margin: "0 0 0.75rem", fontSize: "1.35rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em", fontFamily: "'Inter', system-ui, sans-serif" }}>
            Tax Planning{" "}
            <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: "var(--gold)", fontWeight: 400, fontSize: "1.5rem" }}>Center</em>
          </h1>
          <p style={{ fontSize: 13, color: TX2, lineHeight: 1.7, maxWidth: 600, margin: "0 0 1.25rem" }}>
            Optimize your tax strategy across capital gains, retirement accounts, and investment decisions. Taxes are the single largest drag on long-term wealth — mastering them is as important as picking the right investments.
          </p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Top Federal Rate", value: "37%" },
              { label: "Max LTCG Rate", value: "20%" },
              { label: "2025 Std Deduction", value: "$15K" },
              { label: "Annual Gift Exclusion", value: "$18K" },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 8, padding: "0.5rem 0.875rem" }}>
                <div className="t-mono" style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--gold)", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 10, color: TX3, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
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

      {tab === "capgains" && <CapGainsTab />}
      {tab === "brackets" && <BracketsTab />}
      {tab === "roth" && <RothTab />}
      {tab === "rmd" && <RMDTab />}
      {tab === "harvest" && <HarvestTab />}
    </div>
  );
}
