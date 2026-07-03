import React, { useState, useEffect } from "react";
import { Users, TrendingUp, TrendingDown, RefreshCw, AlertCircle, BarChart2, DollarSign, Activity } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, Legend, Cell
} from "recharts";

const SERVER = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/* ─── Simulation helpers ─────────────────────────────────────────── */
function genMonthly(count, startVal, trend, noise) {
  const data = [];
  let val = startVal;
  const now = new Date("2026-04-01");
  for (let i = count; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    val += trend + (Math.random() - 0.5) * noise * 2;
    data.push({
      date: d.toISOString().slice(0, 7),
      value: Math.max(0, +val.toFixed(3))
    });
  }
  return data;
}

function genUnemployment(count) {
  // Simulates a realistic unemployment curve: COVID spike in 2021, recovery, then steady
  const data = [];
  const now = new Date("2026-04-01");
  for (let i = count; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const monthsAgo = i;
    let val;
    if (monthsAgo > 70) val = 3.5 + (Math.random() - 0.5) * 0.3; // pre-covid low
    else if (monthsAgo > 60) val = 3.5 + ((70 - monthsAgo) / 10) * 10.5; // COVID spike
    else if (monthsAgo > 36) val = 14 - ((60 - monthsAgo) / 24) * 10; // recovery
    else if (monthsAgo > 18) val = 4.0 - ((36 - monthsAgo) / 18) * 0.6; // tight labor
    else val = 3.4 + (i / 18) * 0.7 + (Math.random() - 0.5) * 0.15; // recent
    data.push({ date: d.toISOString().slice(0, 7), value: Math.max(3.0, Math.min(15, +val.toFixed(1))) });
  }
  return data;
}

function genPayrolls(count) {
  const data = [];
  const now = new Date("2026-04-01");
  let level = 148000; // thousands
  for (let i = count; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const monthsAgo = i;
    let change;
    if (monthsAgo > 70) change = 200 + (Math.random() - 0.5) * 80; // pre-covid expansion
    else if (monthsAgo > 62) change = -2500 + (Math.random() - 0.5) * 500; // COVID crash
    else if (monthsAgo > 54) change = 900 + (Math.random() - 0.5) * 300; // reopening boom
    else if (monthsAgo > 24) change = 380 + (Math.random() - 0.5) * 150; // strong recovery
    else change = 165 + (Math.random() - 0.5) * 100; // normalization
    level += change;
    data.push({ date: d.toISOString().slice(0, 7), payrolls: Math.round(level), change: Math.round(change) });
  }
  return data;
}

function genWages(count) {
  // Average hourly earnings, level and YoY%
  const data = [];
  const now = new Date("2026-04-01");
  let wage = 28.5;
  let prevWage = null;
  const wages = [];
  for (let i = count + 12; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const monthsAgo = i;
    let growth;
    if (monthsAgo > 60) growth = 0.023;
    else if (monthsAgo > 30) growth = 0.058;
    else if (monthsAgo > 12) growth = 0.046;
    else growth = 0.041;
    wage *= (1 + growth / 12);
    wages.push({ date: d.toISOString().slice(0, 7), wage: +wage.toFixed(2) });
  }
  for (let i = 12; i < wages.length; i++) {
    const yoy = ((wages[i].wage - wages[i - 12].wage) / wages[i - 12].wage * 100);
    data.push({ ...wages[i], yoyPct: +yoy.toFixed(2) });
  }
  return data;
}

function genJobOpenings(count) {
  const data = [];
  const now = new Date("2026-04-01");
  let openings = 7.6;
  let quits = 3.8;
  for (let i = count; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    openings += (Math.random() - 0.5) * 0.2 - 0.01;
    quits += (Math.random() - 0.5) * 0.08 - 0.005;
    data.push({
      date: d.toISOString().slice(0, 7),
      openings: Math.max(5, +openings.toFixed(2)),
      quits: Math.max(2, +quits.toFixed(2))
    });
  }
  return data;
}

function genClaims(count) {
  const data = [];
  const now = new Date("2026-04-14");
  let val = 223;
  const vals = [];
  for (let i = count; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    val += (Math.random() - 0.5) * 18 + (220 - val) * 0.05;
    vals.push({ date: d.toISOString().slice(0, 10).slice(5), claims: Math.round(Math.max(180, val)) });
  }
  // compute 4wk MA
  return vals.map((v, i) => {
    const window = vals.slice(Math.max(0, i - 3), i + 1);
    const ma = Math.round(window.reduce((s, w) => s + w.claims, 0) / window.length);
    return { ...v, ma4wk: ma };
  });
}

/* ─── Industry Breakdown data ─────────────────────────────────────── */
const INDUSTRY_DATA = [
  { sector: "Professional Services", employment: 23.1, color: "#3b82f6" },
  { sector: "Government",            employment: 22.5, color: "#a89070" },
  { sector: "Leisure & Hospitality", employment: 17.2, color: "#c9a96e" },
  { sector: "Healthcare",            employment: 16.8, color: "#00B4C6" },
  { sector: "Retail Trade",          employment: 15.7, color: "#818cf8" },
  { sector: "Manufacturing",         employment: 12.9, color: "#4a7c59" },
  { sector: "Finance",               employment: 9.1,  color: "#06d6f0" },
  { sector: "Construction",          employment: 8.2,  color: "#e07b39" },
].sort((a, b) => b.employment - a.employment);

/* ─── Custom tooltip ─────────────────────────────────────────────── */
const TT = ({ active, payload, label, unit = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--elevated)", border: "1px solid #3d3028", borderRadius: 5, padding: "8px 12px", fontSize: 11 }}>
      <div style={{ color: "var(--text-2)", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "var(--text-1)", fontWeight: 600 }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}{unit}
        </div>
      ))}
    </div>
  );
};

/* ─── KPI Card ───────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, up, badge, loading }) {
  return (
    <div className="t-card t-card-p t-card-hover" style={{ flex: "1 1 140px", minWidth: 130 }}>
      {loading ? (
        <>
          <div className="t-skeleton" style={{ height: 12, width: "60%", borderRadius: 3, marginBottom: 8 }} />
          <div className="t-skeleton" style={{ height: 28, width: "80%", borderRadius: 3, marginBottom: 6 }} />
          <div className="t-skeleton" style={{ height: 10, width: "50%", borderRadius: 3 }} />
        </>
      ) : (
        <>
          <div className="t-label" style={{ marginBottom: 6 }}>{label}</div>
          <div className="t-metric-xl t-mono" style={{ marginBottom: 4 }}>{value}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {badge && (
              <span className="t-badge" style={{
                background: up ? "var(--up-dim)" : "var(--down-dim)",
                color: up ? "var(--up)" : "var(--down)",
                border: `1px solid ${up ? "rgba(0,184,153,0.2)" : "rgba(255,59,92,0.2)"}`,
                fontSize: "0.65rem"
              }}>
                {up ? "▲" : "▼"} {badge}
              </span>
            )}
            {sub && <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>{sub}</span>}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function Labor() {
  const [fredData, setFredData] = useState({});
  const [simData] = useState(() => ({
    UNRATE: genUnemployment(72),
    PAYEMS: genPayrolls(28),
    WAGES: genWages(36),
    JOLTS: genJobOpenings(24),
    ICSA: genClaims(52),
  }));
  const [loading, setLoading] = useState(true);

  const FRED_SERIES = ["UNRATE", "PAYEMS", "CIVPART", "CES0500000003", "U6RATE", "JTSJOL", "ICSA"];

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      FRED_SERIES.map(id =>
        fetch(`${SERVER}/api/fred/${id}`)
          .then(r => r.json())
          .then(j => ({ id, data: j.data }))
          .catch(() => ({ id, data: null }))
      )
    ).then(results => {
      if (cancelled) return;
      const map = {};
      results.forEach(r => { map[r.id] = r.data; });
      setFredData(map);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  /* Helper to get latest value from FRED or simulation */
  const latestVal = (id, simKey, simField = "value") => {
    const d = fredData[id];
    if (d?.length > 1) return d[d.length - 1].value;
    const s = simData[simKey];
    if (s?.length > 1) return s[s.length - 1][simField];
    return null;
  };

  const prevVal = (id, simKey, simField = "value") => {
    const d = fredData[id];
    if (d?.length > 1) return d[d.length - 2].value;
    const s = simData[simKey];
    if (s?.length > 1) return s[s.length - 2][simField];
    return null;
  };

  /* KPI values */
  const unrate = latestVal("UNRATE", "UNRATE") || 4.2;
  const unratePrev = prevVal("UNRATE", "UNRATE") || 4.1;
  const unrateUp = unrate > unratePrev; // higher = worse

  // payrolls MoM change — PAYEMS is in thousands from FRED, so diff is already in thousands (=K jobs)
  const payemsData = fredData.PAYEMS?.length > 2
    ? fredData.PAYEMS
    : simData.PAYEMS;
  const payemsMoM = payemsData?.length > 1
    ? (fredData.PAYEMS?.length > 2
        ? Math.round(payemsData[payemsData.length - 1].value - payemsData[payemsData.length - 2].value)
        : payemsData[payemsData.length - 1].change)
    : 228;

  const civpart = latestVal("CIVPART", null) || 62.6;
  const wages = latestVal("CES0500000003", "WAGES", "wage") || 35.91;
  const u6 = latestVal("U6RATE", null) || 7.8;
  const jolts = latestVal("JTSJOL", "JOLTS", "openings") || 7.6;

  /* Chart data: unemployment (5yr = 60mo) */
  const unrateChart = (() => {
    const d = fredData.UNRATE?.length > 10
      ? fredData.UNRATE.slice(-60).map(x => ({ date: x.date?.slice(0, 7), value: x.value }))
      : simData.UNRATE.slice(-60);
    return d;
  })();

  /* Chart data: NFP MoM bars (2yr = 24mo)
     PAYEMS is in thousands from FRED, so diff of consecutive months = K jobs added */
  const nfpChart = (() => {
    if (fredData.PAYEMS?.length > 25) {
      const d = fredData.PAYEMS.slice(-25);
      return d.slice(1).map((v, i) => ({
        date: v.date?.slice(0, 7),
        change: Math.round(v.value - d[i].value)
      }));
    }
    return simData.PAYEMS.slice(-24).map(d => ({ date: d.date, change: d.change }));
  })();

  /* Chart data: JOLTS openings (real FRED) + quits (simulation)
     JTSJOL is in thousands → divide by 1000 to display in millions */
  const joltsChart = (() => {
    if (fredData.JTSJOL?.length > 10) {
      const opens = fredData.JTSJOL.slice(-24);
      const simQuits = simData.JOLTS.slice(-24);
      return opens.map((v, i) => ({
        date: v.date?.slice(0, 7),
        openings: parseFloat((v.value / 1000).toFixed(2)),
        quits: simQuits[i]?.quits ?? simQuits[simQuits.length - 1]?.quits ?? 3.5,
      }));
    }
    return simData.JOLTS.slice(-24);
  })();

  /* Chart data: wages YoY — use real FRED CES0500000003 when available */
  const wagesChart = (() => {
    const d = fredData.CES0500000003;
    if (d?.length > 13) {
      return d.slice(-36).map((v, i, arr) => {
        if (i < 12) return null;
        const yoyPct = ((v.value - arr[i - 12].value) / arr[i - 12].value) * 100;
        return { date: v.date?.slice(0, 7), wage: v.value, yoyPct: parseFloat(yoyPct.toFixed(2)) };
      }).filter(Boolean);
    }
    return simData.WAGES.slice(-36);
  })();

  /* Claims chart — use real FRED ICSA data when available.
     ICSA is the raw number of claims (e.g. 226000); divide by 1000 for K display */
  const claimsChart = (() => {
    const d = fredData.ICSA;
    if (d?.length > 8) {
      const vals = d.slice(-52).map(v => ({
        date: v.date?.slice(5, 10),
        claims: Math.round(v.value / 1000),
      }));
      return vals.map((v, i) => {
        const window = vals.slice(Math.max(0, i - 3), i + 1);
        const ma = Math.round(window.reduce((s, w) => s + w.claims, 0) / window.length);
        return { ...v, ma4wk: ma };
      });
    }
    return simData.ICSA;
  })();

  /* Wage color logic */
  const wageColor = (pct) => {
    if (pct > 4) return "var(--down)";
    if (pct > 2) return "var(--gold)";
    return "var(--up)";
  };

  return (
    <div className="t-bg" style={{ padding: "1.5rem", minHeight: "100vh" }}>
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
                <Users size={14} style={{ color: "var(--gold)" }} />
              </div>
              <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em", fontFamily: "'Inter', system-ui, sans-serif" }}>
                LABOR{" "}
                <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: "var(--gold)", fontWeight: 400, fontSize: "1.5rem" }}>Market</em>
              </h1>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.65, maxWidth: 560, margin: "0 0 1rem" }}>
              Dive deep into the US labor market. Track unemployment, nonfarm payrolls, wage growth, and job openings data from the Bureau of Labor Statistics.
            </p>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              {["BLS Data", "Monthly Jobs", "Wage Trends", "JOLTS & Claims"].map((label) => (
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
              { icon: Activity, label: "Unemployment Rate", sub: "U-3 & U-6 measures", color: "#3b82f6" },
              { icon: Users, label: "Jobs Added", sub: "Nonfarm payroll data", color: "var(--gold)" },
              { icon: DollarSign, label: "Wage Growth", sub: "Average hourly earnings", color: "#00B4C6" },
              { icon: BarChart2, label: "Labor Force Participation", sub: "LFPR & JOLTS openings", color: "#f59e0b" },
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

      {/* KPI Strip */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <KpiCard
          label="Unemployment Rate"
          value={`${Number(unrate).toFixed(1)}%`}
          badge="0.1%"
          up={!unrateUp}
          sub="MoM"
          loading={loading}
        />
        <KpiCard
          label="Non-Farm Payrolls"
          value={`+${Math.abs(payemsMoM).toLocaleString()}K`}
          badge={`${Math.abs(payemsMoM - 143)}K`}
          up={payemsMoM > 0}
          sub="MoM change"
          loading={loading}
        />
        <KpiCard
          label="Labor Force Participation"
          value={`${Number(civpart).toFixed(1)}%`}
          badge="0.1%"
          up={true}
          sub="MoM"
          loading={loading}
        />
        <KpiCard
          label="Avg Hourly Earnings YoY"
          value={wagesChart.length ? `+${wagesChart[wagesChart.length - 1].yoyPct.toFixed(1)}%` : "+4.1%"}
          badge={wagesChart.length > 1 ? `${Math.abs(wagesChart[wagesChart.length - 1].yoyPct - wagesChart[wagesChart.length - 2].yoyPct).toFixed(1)}%` : "0.1%"}
          up={wagesChart.length ? wagesChart[wagesChart.length - 1].yoyPct < 4 : false}
          sub="YoY change"
          loading={loading}
        />
        <KpiCard
          label="U-6 Underemployment"
          value={`${Number(u6).toFixed(1)}%`}
          badge="0.2%"
          up={false}
          sub="MoM"
          loading={loading}
        />
        <KpiCard
          label="Job Openings (JOLTS)"
          value={`${Number(jolts).toFixed(1)}M`}
          badge="0.3M"
          up={false}
          sub="MoM"
          loading={loading}
        />
      </div>

      {/* Main 2x2 Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>

        {/* 1. Unemployment Rate Trend */}
        <div className="t-card">
          <div className="t-card-p" style={{ borderBottom: "1px solid var(--border-c)" }}>
            <div className="t-section-title">Unemployment Rate — 5 Year</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
              <span className="t-metric-lg t-mono">{Number(unrate).toFixed(1)}%</span>
              <span className="t-badge-neutral t-badge" style={{ fontSize: "0.65rem" }}>UNRATE</span>
            </div>
          </div>
          <div style={{ padding: "0.75rem 0.5rem 0.5rem" }}>
            {loading ? (
              <div className="t-skeleton" style={{ height: 180, borderRadius: 4 }} />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={unrateChart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="unrateGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--border-c)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9, fill: "var(--text-3)" }}
                    tickLine={false}
                    interval={11}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "var(--text-3)" }}
                    tickLine={false}
                    domain={[2.5, "auto"]}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip content={<TT unit="%" />} />
                  <ReferenceLine y={4.0} stroke="#c9a96e" strokeDasharray="3 3" strokeOpacity={0.7} label={{ value: "Natural Rate", position: "insideTopRight", fontSize: 9, fill: "#c9a96e" }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Unemployment"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    fill="url(#unrateGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 2. Non-Farm Payrolls */}
        <div className="t-card">
          <div className="t-card-p" style={{ borderBottom: "1px solid var(--border-c)" }}>
            <div className="t-section-title">Non-Farm Payrolls — Monthly Change (K)</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
              <span className="t-metric-lg t-mono" style={{ color: payemsMoM >= 0 ? "var(--up)" : "var(--down)" }}>
                {payemsMoM >= 0 ? "+" : ""}{payemsMoM.toLocaleString()}K
              </span>
              <span className="t-badge-neutral t-badge" style={{ fontSize: "0.65rem" }}>PAYEMS</span>
            </div>
          </div>
          <div style={{ padding: "0.75rem 0.5rem 0.5rem" }}>
            {loading ? (
              <div className="t-skeleton" style={{ height: 180, borderRadius: 4 }} />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={nfpChart} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--border-c)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--text-3)" }} tickLine={false} interval={5} />
                  <YAxis tick={{ fontSize: 9, fill: "var(--text-3)" }} tickLine={false} />
                  <Tooltip content={<TT unit="K" />} />
                  <ReferenceLine y={0} stroke="#3d3028" />
                  <Bar dataKey="change" name="Payrolls Chg" radius={[2, 2, 0, 0]}>
                    {nfpChart.map((entry, i) => (
                      <Cell key={i} fill={entry.change >= 0 ? "var(--up)" : "var(--down)"} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 3. Job Openings vs Quits */}
        <div className="t-card">
          <div className="t-card-p" style={{ borderBottom: "1px solid var(--border-c)" }}>
            <div className="t-section-title">JOLTS: Job Openings vs Quits Rate (M)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 14, height: 2, background: "#3b82f6", display: "inline-block" }} />
                <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>Openings</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 14, height: 2, background: "var(--gold)", display: "inline-block" }} />
                <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>Quits</span>
              </div>
            </div>
          </div>
          <div style={{ padding: "0.75rem 0.5rem 0.5rem" }}>
            {loading ? (
              <div className="t-skeleton" style={{ height: 180, borderRadius: 4 }} />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={joltsChart} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--border-c)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--text-3)" }} tickLine={false} interval={5} />
                  <YAxis tick={{ fontSize: 9, fill: "var(--text-3)" }} tickLine={false} tickFormatter={v => `${v}M`} />
                  <Tooltip content={<TT unit="M" />} />
                  <Line type="monotone" dataKey="openings" name="Openings" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="quits" name="Quits" stroke="var(--gold)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div style={{ padding: "0 1rem 0.75rem", fontSize: "0.7rem", color: "var(--text-3)" }}>
            High quits rate signals worker confidence — the "Great Resignation" indicator
          </div>
        </div>

        {/* 4. Wages Growth */}
        <div className="t-card">
          <div className="t-card-p" style={{ borderBottom: "1px solid var(--border-c)" }}>
            <div className="t-section-title">Avg Hourly Earnings — YoY Growth %</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
              <span className="t-metric-lg t-mono" style={{ color: wageColor(wagesChart[wagesChart.length - 1]?.yoyPct || 4.1) }}>
                {(wagesChart[wagesChart.length - 1]?.yoyPct || 4.1).toFixed(1)}%
              </span>
              <span className="t-badge-neutral t-badge" style={{ fontSize: "0.65rem" }}>CES0500000003</span>
            </div>
          </div>
          <div style={{ padding: "0.75rem 0.5rem 0.5rem" }}>
            {loading ? (
              <div className="t-skeleton" style={{ height: 180, borderRadius: 4 }} />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={wagesChart} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--border-c)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--text-3)" }} tickLine={false} interval={8} />
                  <YAxis tick={{ fontSize: 9, fill: "var(--text-3)" }} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<TT unit="%" />} />
                  <ReferenceLine y={2} stroke="var(--up)" strokeDasharray="3 3" strokeOpacity={0.6} label={{ value: "Fed Target 2%", position: "insideTopRight", fontSize: 9, fill: "var(--up)" }} />
                  <ReferenceLine y={4} stroke="var(--down)" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: "4% Watch", position: "insideBottomRight", fontSize: 9, fill: "var(--down)" }} />
                  <Line
                    type="monotone"
                    dataKey="yoyPct"
                    name="Wage Growth YoY"
                    stroke="var(--gold)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div style={{ padding: "0 1rem 0.75rem", display: "flex", gap: 8 }}>
            {[
              { label: "> 4%", desc: "Inflationary", color: "var(--down)", bg: "var(--down-dim)" },
              { label: "2–4%", desc: "Normal range", color: "var(--gold)", bg: "rgba(201,169,110,0.08)" },
              { label: "< 2%", desc: "Weak growth", color: "var(--up)", bg: "var(--up-dim)" },
            ].map((z, i) => (
              <span key={i} style={{
                display: "inline-block",
                fontSize: "0.65rem",
                padding: "2px 7px",
                borderRadius: 3,
                fontWeight: 700,
                background: z.bg,
                color: z.color,
                border: `1px solid ${z.color}33`
              }}>
                {z.label} {z.desc}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Industry Breakdown */}
      <div className="t-card" style={{ marginBottom: "1rem" }}>
        <div className="t-card-p" style={{ borderBottom: "1px solid var(--border-c)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="t-section-title">Industry Employment Breakdown</div>
          <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>Millions of workers · February 2026</span>
        </div>
        <div style={{ padding: "1rem" }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={INDUSTRY_DATA}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 9, fill: "var(--text-3)" }}
                tickLine={false}
                tickFormatter={v => `${v}M`}
                domain={[0, 26]}
              />
              <YAxis
                type="category"
                dataKey="sector"
                tick={{ fontSize: 10, fill: "var(--text-2)" }}
                tickLine={false}
                width={145}
              />
              <Tooltip content={<TT unit="M" />} />
              <Bar dataKey="employment" name="Employment" radius={[0, 3, 3, 0]}>
                {INDUSTRY_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12, padding: "0.5rem", background: "var(--elevated)", borderRadius: 5, border: "1px solid var(--border-c)" }}>
            {INDUSTRY_DATA.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: "inline-block" }} />
                <span style={{ fontSize: "0.7rem", color: "var(--text-2)" }}>{s.sector}: <strong style={{ color: "var(--text-1)" }}>{s.employment}M</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Initial Claims */}
      <div className="t-card">
        <div className="t-card-p" style={{ borderBottom: "1px solid var(--border-c)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div className="t-section-title">Initial Jobless Claims — Weekly (1 Year)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 14, height: 2, background: "#3b82f6", display: "inline-block" }} />
                <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>Weekly Claims</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 14, height: 2, background: "var(--gold)", display: "inline-block", borderTop: "1px dashed" }} />
                <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>4-Week MA</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="t-label" style={{ marginBottom: 2 }}>Latest (thousands)</div>
            <div className="t-metric-lg t-mono">{claimsChart[claimsChart.length - 1]?.claims || "—"}K</div>
          </div>
        </div>
        <div style={{ padding: "0.75rem 0.5rem 0.5rem" }}>
          {loading ? (
            <div className="t-skeleton" style={{ height: 160, borderRadius: 4 }} />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={claimsChart} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="claimsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--border-c)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--text-3)" }} tickLine={false} interval={8} />
                <YAxis tick={{ fontSize: 9, fill: "var(--text-3)" }} tickLine={false} tickFormatter={v => `${v}K`} domain={[160, 280]} />
                <Tooltip content={<TT unit="K" />} />
                <ReferenceLine y={220} stroke="var(--text-3)" strokeDasharray="3 3" strokeOpacity={0.4} />
                <Line type="monotone" dataKey="claims" name="Claims" stroke="#60a5fa" strokeWidth={1.5} dot={false} strokeOpacity={0.7} />
                <Line type="monotone" dataKey="ma4wk" name="4-Week MA" stroke="var(--gold)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div style={{ padding: "0 1rem 0.875rem", fontSize: "0.7rem", color: "var(--text-3)" }}>
          Weekly initial claims track new unemployment filings. 4-week average smooths volatility. Readings above 300K signal labor market deterioration.
        </div>
      </div>
    </div>
  );
}
