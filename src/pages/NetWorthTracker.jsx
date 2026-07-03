import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Target, Home, TrendingUp, DollarSign, Car, Briefcase, CreditCard,
  GraduationCap, ChevronDown, ChevronUp, Plus, Trash2, Camera,
  AlertTriangle, CheckCircle, BookOpen, Link2,
} from "lucide-react";

/* ─── Constants ──────────────────────────────────────────────────── */
const GOLD   = "#c9a84c";
const TEAL   = "#4dd0c4";
const GREEN  = "#4caf7d";
const RED    = "#e05c5c";
const BLUE   = "#4c9fcf";
const PURPLE = "#9b6cdb";
const ORANGE = "#e07c3a";

const PIE_COLORS = [GOLD, TEAL, GREEN, BLUE, PURPLE, ORANGE, RED, "#a3b8cc"];

/* ─── Default data ───────────────────────────────────────────────── */
const DEFAULT_ASSETS = {
  realEstate: {
    primaryHome: 420000,
    rentalProperties: 0,
    otherRealEstate: 0,
  },
  investments: {
    k401: 85000,
    ira: 32000,
    taxableBrokerage: 48000,
    otherInvestments: 5000,
  },
  cashSavings: {
    checking: 8500,
    savings: 22000,
    moneyMarket: 10000,
    cds: 0,
  },
  personalProperty: {
    vehicles: [{ id: "v1", label: "Primary Vehicle", value: 18000 }],
    jewelry: 3000,
    otherValuables: 1500,
  },
  businessOther: {
    businessEquity: 0,
    stockOptions: 0,
    otherAssets: 0,
  },
};

const DEFAULT_LIABILITIES = {
  mortgage: {
    primaryMortgage: 310000,
    heloc: 0,
    rentalMortgages: 0,
  },
  autoLoans: 11000,
  studentLoans: 0,
  creditCards: [{ id: "cc1", label: "Visa", value: 2400 }],
  medicalDebt: 0,
  personalLoans: 0,
};

/* ─── Helpers ────────────────────────────────────────────────────── */
function fmt(n) {
  const abs = Math.abs(n || 0);
  if (abs >= 1e6) return (n < 0 ? "-$" : "$") + (abs / 1e6).toFixed(2) + "M";
  if (abs >= 1e3) return (n < 0 ? "-$" : "$") + (abs / 1e3).toFixed(1) + "K";
  return (n < 0 ? "-$" : "$") + Math.round(abs).toLocaleString();
}

function fmtFull(n) {
  return (n < 0 ? "-$" : "$") + Math.abs(Math.round(n || 0)).toLocaleString();
}

function useLS(key, def) {
  const [v, setV] = useState(() => {
    try {
      const r = localStorage.getItem(key);
      return r ? JSON.parse(r) : def;
    } catch { return def; }
  });
  return [v, setV];
}

function sumObj(obj) {
  return Object.values(obj).reduce((a, b) => a + (Number(b) || 0), 0);
}

/* ─── Shared UI ──────────────────────────────────────────────────── */
const inputStyle = {
  background: "var(--bg)",
  border: "1px solid var(--border-c)",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: "0.8rem",
  color: "var(--text-1)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

function DollarInput({ value, onChange, placeholder = "0" }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
        color: "var(--text-3)", fontSize: "0.8rem", pointerEvents: "none",
      }}>$</span>
      <input
        type="number"
        min="0"
        step="1"
        value={value || ""}
        onChange={e => onChange(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingLeft: 20, textAlign: "right" }}
      />
    </div>
  );
}

function FieldRow({ label, value, onChange }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "6px 0", borderBottom: "1px solid var(--border-c)",
    }}>
      <span style={{ flex: 1, fontSize: "0.8rem", color: "var(--text-2)" }}>{label}</span>
      <div style={{ width: 130 }}>
        <DollarInput value={value} onChange={onChange} />
      </div>
    </div>
  );
}

function MultiFieldRow({ label, value, onChange, onRemove }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 0", borderBottom: "1px solid var(--border-c)",
    }}>
      <span style={{ flex: 1, fontSize: "0.8rem", color: "var(--text-2)" }}>{label}</span>
      <div style={{ width: 130 }}>
        <DollarInput value={value} onChange={onChange} />
      </div>
      {onRemove && (
        <button onClick={onRemove} style={{
          background: "none", border: "none", cursor: "pointer",
          color: RED, padding: 2, display: "flex", alignItems: "center",
        }}>
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

function CategorySection({ icon: Icon, title, color, children, subtotal, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      border: "1px solid var(--border-c)", borderRadius: 8, marginBottom: 10, overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "10px 12px", background: "var(--surface)", border: "none",
          cursor: "pointer", color: "var(--text-1)",
        }}
      >
        <Icon size={15} color={color} />
        <span style={{ flex: 1, fontWeight: 600, fontSize: "0.85rem", textAlign: "left" }}>{title}</span>
        <span style={{ fontSize: "0.8rem", color, fontFamily: "monospace", marginRight: 6 }}>
          {fmtFull(subtotal)}
        </span>
        {open ? <ChevronUp size={14} color="var(--text-3)" /> : <ChevronDown size={14} color="var(--text-3)" />}
      </button>
      {open && (
        <div style={{ padding: "8px 12px 10px", background: "var(--bg)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Custom Tooltip ─────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border-c)",
      borderRadius: 6, padding: "8px 12px", fontSize: "0.78rem",
    }}>
      <div style={{ color: "var(--text-3)", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || GOLD }}>
          {p.name}: {fmtFull(p.value)}
        </div>
      ))}
    </div>
  );
}

/* ─── Gauge ──────────────────────────────────────────────────────── */
function DebtGauge({ ratio }) {
  const pct = Math.min(ratio * 100, 100);
  const color = pct < 20 ? GREEN : pct < 40 ? GOLD : RED;
  const label = pct < 20 ? "Healthy" : pct < 40 ? "Moderate" : "High";
  const angle = (pct / 100) * 180 - 90;

  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 200 110" style={{ width: "100%", maxWidth: 220 }}>
        {/* Track */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--border-c)" strokeWidth="16" strokeLinecap="round" />
        {/* Green zone */}
        <path d="M 20 100 A 80 80 0 0 1 84 27" fill="none" stroke={GREEN} strokeWidth="16" strokeLinecap="round" opacity={0.3} />
        {/* Yellow zone */}
        <path d="M 84 27 A 80 80 0 0 1 132 27" fill="none" stroke={GOLD} strokeWidth="16" strokeLinecap="round" opacity={0.3} />
        {/* Red zone */}
        <path d="M 132 27 A 80 80 0 0 1 180 100" fill="none" stroke={RED} strokeWidth="16" strokeLinecap="round" opacity={0.3} />
        {/* Needle */}
        <line
          x1="100" y1="100"
          x2={100 + 65 * Math.cos(((angle - 90) * Math.PI) / 180)}
          y2={100 + 65 * Math.sin(((angle - 90) * Math.PI) / 180)}
          stroke={color} strokeWidth="3" strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="5" fill={color} />
        <text x="100" y="80" textAnchor="middle" fontSize="18" fontWeight="bold" fill={color}>{pct.toFixed(1)}%</text>
        <text x="100" y="95" textAnchor="middle" fontSize="10" fill="var(--text-3)">{label}</text>
        <text x="22" y="115" fontSize="9" fill="var(--text-3)">0%</text>
        <text x="100" y="18" textAnchor="middle" fontSize="9" fill="var(--text-3)">20%</text>
        <text x="170" y="115" textAnchor="end" fontSize="9" fill="var(--text-3)">40%+</text>
      </svg>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function NetWorthTracker() {
  const [assets, setAssets] = useLS("nwt_assets", DEFAULT_ASSETS);
  const [liabilities, setLiabilities] = useLS("nwt_liabilities", DEFAULT_LIABILITIES);
  const [history, setHistory] = useLS("nwt_history", []);

  /* Debounced localStorage save */
  const saveTimer = useRef(null);
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem("nwt_assets", JSON.stringify(assets));
        localStorage.setItem("nwt_liabilities", JSON.stringify(liabilities));
      } catch {}
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [assets, liabilities]);

  /* ─── Asset totals ─── */
  const totalRealEstate = sumObj(assets.realEstate);
  const totalInvestments = sumObj(assets.investments);
  const totalCash = sumObj(assets.cashSavings);
  const totalPersonalProperty =
    assets.personalProperty.vehicles.reduce((a, v) => a + (Number(v.value) || 0), 0) +
    (Number(assets.personalProperty.jewelry) || 0) +
    (Number(assets.personalProperty.otherValuables) || 0);
  const totalBusinessOther = sumObj(assets.businessOther);
  const totalAssets = totalRealEstate + totalInvestments + totalCash + totalPersonalProperty + totalBusinessOther;

  /* ─── Liability totals ─── */
  const totalMortgage = sumObj(liabilities.mortgage);
  const totalCreditCards = liabilities.creditCards.reduce((a, c) => a + (Number(c.value) || 0), 0);
  const totalLiabilities =
    totalMortgage +
    (Number(liabilities.autoLoans) || 0) +
    (Number(liabilities.studentLoans) || 0) +
    totalCreditCards +
    (Number(liabilities.medicalDebt) || 0) +
    (Number(liabilities.personalLoans) || 0);

  const netWorth = totalAssets - totalLiabilities;
  const debtToAssetRatio = totalAssets > 0 ? totalLiabilities / totalAssets : 0;

  /* ─── YTD change ─── */
  const ytdChange = (() => {
    if (history.length === 0) return 0;
    const currentYear = new Date().getFullYear();
    const yearStart = history.filter(h => new Date(h.date).getFullYear() === currentYear)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    if (!yearStart) return 0;
    return netWorth - yearStart.netWorth;
  })();

  /* ─── Add snapshot ─── */
  const addSnapshot = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const existing = history.filter(h => h.date !== today);
    const next = [...existing, { date: today, netWorth, totalAssets, totalLiabilities }]
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    setHistory(next);
    try { localStorage.setItem("nwt_history", JSON.stringify(next)); } catch {}
  }, [history, netWorth, totalAssets, totalLiabilities, setHistory]);

  /* ─── Chart data ─── */
  const historyChartData = (() => {
    if (history.length >= 2) {
      return history.map(h => ({
        date: h.date,
        "Net Worth": h.netWorth,
        Assets: h.totalAssets,
        Liabilities: h.totalLiabilities,
      }));
    }
    /* Sample trajectory */
    const base = netWorth;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months.slice(0, 7).map((m, i) => ({
      date: m,
      "Net Worth": Math.round(base * (0.82 + i * 0.03)),
      Assets: Math.round(totalAssets * (0.88 + i * 0.02)),
      Liabilities: Math.round(totalLiabilities * (1.05 - i * 0.01)),
    }));
  })();

  const pieData = [
    { name: "Real Estate", value: totalRealEstate },
    { name: "Investments", value: totalInvestments },
    { name: "Cash & Savings", value: totalCash },
    { name: "Personal Property", value: totalPersonalProperty },
    { name: "Business & Other", value: totalBusinessOther },
  ].filter(d => d.value > 0);

  const milestones = [100000, 250000, 500000, 1000000];

  /* ─── Asset updater helpers ─── */
  const setA = (section, field) => val =>
    setAssets(prev => ({ ...prev, [section]: { ...prev[section], [field]: val } }));

  const setL = field => val =>
    setLiabilities(prev => ({ ...prev, [field]: val }));

  const setLSub = (section, field) => val =>
    setLiabilities(prev => ({ ...prev, [section]: { ...prev[section], [field]: val } }));

  const addVehicle = () =>
    setAssets(prev => ({
      ...prev,
      personalProperty: {
        ...prev.personalProperty,
        vehicles: [...prev.personalProperty.vehicles, { id: Date.now().toString(), label: "Vehicle", value: 0 }],
      },
    }));

  const removeVehicle = id =>
    setAssets(prev => ({
      ...prev,
      personalProperty: {
        ...prev.personalProperty,
        vehicles: prev.personalProperty.vehicles.filter(v => v.id !== id),
      },
    }));

  const setVehicle = (id, val) =>
    setAssets(prev => ({
      ...prev,
      personalProperty: {
        ...prev.personalProperty,
        vehicles: prev.personalProperty.vehicles.map(v => v.id === id ? { ...v, value: val } : v),
      },
    }));

  const addCreditCard = () =>
    setLiabilities(prev => ({
      ...prev,
      creditCards: [...prev.creditCards, { id: Date.now().toString(), label: "Card", value: 0 }],
    }));

  const removeCreditCard = id =>
    setLiabilities(prev => ({
      ...prev,
      creditCards: prev.creditCards.filter(c => c.id !== id),
    }));

  const setCreditCard = (id, val) =>
    setLiabilities(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => c.id === id ? { ...c, value: val } : c),
    }));

  /* ─── Stat box ─── */
  function StatBox({ label, value, color, sub }) {
    return (
      <div className="t-card-p" style={{ flex: 1, minWidth: 130 }}>
        <div className="t-label" style={{ marginBottom: 4 }}>{label}</div>
        <div className="t-mono" style={{
          fontSize: "1.4rem", fontWeight: 700, color,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {fmtFull(value)}
        </div>
        {sub !== undefined && (
          <div style={{ fontSize: "0.72rem", color: sub >= 0 ? "var(--up)" : "var(--down)", marginTop: 2 }}>
            {sub >= 0 ? "+" : ""}{fmtFull(sub)} YTD
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400 }}>

      {/* ─── Hero Banner ─── */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border-c)",
        borderRadius: 20, padding: "2rem 2.25rem",
        marginBottom: 24, position: "relative", overflow: "hidden",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 var(--border-c)",
      }}>
        <div style={{ position: "absolute", top: -60, right: -40, width: 320, height: 320, background: "radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap", position: "relative" }}>
          <div style={{ flex: 1 }}>
            <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0 0 0.75rem", fontFamily: "'Inter', system-ui, sans-serif", fontSize: "0.5625rem", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--gold)" }}>
              <span style={{ display: "inline-block", width: 20, height: 1, background: "var(--gold)", opacity: 0.7 }} />
              Wealth · Planning
            </p>
            <div style={{ marginBottom: 8, fontSize: "1.35rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.01em", fontFamily: "'Inter', system-ui, sans-serif" }}>
              Net Worth{" "}
              <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: "var(--gold)", fontWeight: 400, fontSize: "1.5rem" }}>Tracker</em>
            </div>
            <div style={{ color: "var(--text-2)", fontSize: "0.875rem", lineHeight: 1.65 }}>
              Track your complete financial picture — assets, liabilities, and net worth over time
            </div>
          </div>
          <button
            onClick={addSnapshot}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: GOLD, color: "#000", border: "none", borderRadius: 8,
              padding: "9px 16px", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
            }}
          >
            <Camera size={15} /> Add Snapshot
          </button>
        </div>

        {/* Stat boxes */}
        <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          <StatBox label="Total Assets" value={totalAssets} color={GREEN} />
          <StatBox label="Total Liabilities" value={totalLiabilities} color={RED} />
          <StatBox label="Net Worth" value={netWorth} color={netWorth >= 0 ? GOLD : RED} sub={ytdChange} />
          <StatBox label="YTD Change" value={ytdChange} color={ytdChange >= 0 ? "var(--up)" : "var(--down)"} />
        </div>
      </div>

      {/* ─── Data Connection Banner ─── */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        background: "rgba(201,169,110,0.06)",
        border: "1px solid rgba(201,169,110,0.18)",
        borderRadius: 12, padding: "12px 16px", marginBottom: 20,
      }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(201,169,110,0.12)", border: "1px solid rgba(201,169,110,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
          <Link2 size={13} color={GOLD} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-1)", fontFamily: "'Inter', system-ui, sans-serif", marginBottom: 3 }}>
            This data is used in two downstream sections
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {[
              { label: "Budget Planner → Financial Health Ratios", detail: "Net Worth Ratio, Debt-to-Asset" },
              { label: "Retirement Planning → Snapshot",          detail: "401(k), IRA, home value, total debt" },
            ].map(link => (
              <div key={link.label} style={{ padding: "3px 9px", background: "rgba(201,169,110,0.07)", border: "1px solid rgba(201,169,110,0.18)", borderRadius: 6, fontSize: 10, color: GOLD, fontFamily: "'Inter', system-ui, sans-serif" }}>
                <span style={{ fontWeight: 700 }}>{link.label}</span>
                <span style={{ color: "var(--text-3)", marginLeft: 5 }}>({link.detail})</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: (totalAssets > 0 || totalLiabilities > 0) ? "#4a7c59" : "#6b5540" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: (totalAssets > 0 || totalLiabilities > 0) ? "#4a7c59" : "#6b5540", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Inter', system-ui, sans-serif" }}>
            {(totalAssets > 0 || totalLiabilities > 0) ? "Synced" : "Awaiting data"}
          </span>
        </div>
      </div>

      {/* ─── 2-column layout ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

        {/* ══════════════════ LEFT COLUMN ══════════════════ */}
        <div>
          {/* ASSETS header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 12,
          }}>
            <TrendingUp size={16} color={GREEN} />
            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: GREEN }}>ASSETS</span>
            <span className="t-mono" style={{ marginLeft: "auto", color: GREEN, fontSize: "0.85rem" }}>
              {fmtFull(totalAssets)}
            </span>
          </div>

          {/* Real Estate */}
          <CategorySection icon={Home} title="Real Estate" color={GOLD} subtotal={totalRealEstate}>
            <FieldRow label="Primary Home" value={assets.realEstate.primaryHome} onChange={setA("realEstate","primaryHome")} />
            <FieldRow label="Rental Properties" value={assets.realEstate.rentalProperties} onChange={setA("realEstate","rentalProperties")} />
            <FieldRow label="Other Real Estate" value={assets.realEstate.otherRealEstate} onChange={setA("realEstate","otherRealEstate")} />
          </CategorySection>

          {/* Investments */}
          <CategorySection icon={TrendingUp} title="Investments" color={TEAL} subtotal={totalInvestments}>
            <FieldRow label="401(k)" value={assets.investments.k401} onChange={setA("investments","k401")} />
            <FieldRow label="IRA / Roth IRA" value={assets.investments.ira} onChange={setA("investments","ira")} />
            <FieldRow label="Taxable Brokerage" value={assets.investments.taxableBrokerage} onChange={setA("investments","taxableBrokerage")} />
            <FieldRow label="Other Investments" value={assets.investments.otherInvestments} onChange={setA("investments","otherInvestments")} />
          </CategorySection>

          {/* Cash & Savings */}
          <CategorySection icon={DollarSign} title="Cash & Savings" color={GREEN} subtotal={totalCash}>
            <FieldRow label="Checking Account" value={assets.cashSavings.checking} onChange={setA("cashSavings","checking")} />
            <FieldRow label="Savings Account" value={assets.cashSavings.savings} onChange={setA("cashSavings","savings")} />
            <FieldRow label="Money Market" value={assets.cashSavings.moneyMarket} onChange={setA("cashSavings","moneyMarket")} />
            <FieldRow label="CDs" value={assets.cashSavings.cds} onChange={setA("cashSavings","cds")} />
          </CategorySection>

          {/* Personal Property */}
          <CategorySection icon={Car} title="Personal Property" color={ORANGE} subtotal={totalPersonalProperty} defaultOpen={false}>
            {assets.personalProperty.vehicles.map(v => (
              <MultiFieldRow
                key={v.id}
                label={v.label}
                value={v.value}
                onChange={val => setVehicle(v.id, val)}
                onRemove={assets.personalProperty.vehicles.length > 1 ? () => removeVehicle(v.id) : undefined}
              />
            ))}
            <button
              onClick={addVehicle}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "none", border: "none", cursor: "pointer",
                color: ORANGE, fontSize: "0.78rem", padding: "5px 0", marginTop: 2,
              }}
            >
              <Plus size={13} /> Add Vehicle
            </button>
            <FieldRow label="Jewelry" value={assets.personalProperty.jewelry} onChange={val => setAssets(prev => ({ ...prev, personalProperty: { ...prev.personalProperty, jewelry: val } }))} />
            <FieldRow label="Other Valuables" value={assets.personalProperty.otherValuables} onChange={val => setAssets(prev => ({ ...prev, personalProperty: { ...prev.personalProperty, otherValuables: val } }))} />
          </CategorySection>

          {/* Business & Other */}
          <CategorySection icon={Briefcase} title="Business & Other" color={PURPLE} subtotal={totalBusinessOther} defaultOpen={false}>
            <FieldRow label="Business Equity" value={assets.businessOther.businessEquity} onChange={setA("businessOther","businessEquity")} />
            <FieldRow label="Stock Options / RSUs" value={assets.businessOther.stockOptions} onChange={setA("businessOther","stockOptions")} />
            <FieldRow label="Other Assets" value={assets.businessOther.otherAssets} onChange={setA("businessOther","otherAssets")} />
          </CategorySection>

          {/* Running total */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(76,175,125,0.1)", border: "1px solid rgba(76,175,125,0.3)",
            marginBottom: 24,
          }}>
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: GREEN }}>Total Assets</span>
            <span className="t-mono" style={{ color: GREEN, fontWeight: 700, fontSize: "1rem" }}>{fmtFull(totalAssets)}</span>
          </div>

          {/* LIABILITIES header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <CreditCard size={16} color={RED} />
            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: RED }}>LIABILITIES</span>
            <span className="t-mono" style={{ marginLeft: "auto", color: RED, fontSize: "0.85rem" }}>
              {fmtFull(totalLiabilities)}
            </span>
          </div>

          {/* Mortgage */}
          <CategorySection icon={Home} title="Mortgage" color={RED} subtotal={totalMortgage}>
            <FieldRow label="Primary Mortgage" value={liabilities.mortgage.primaryMortgage} onChange={setLSub("mortgage","primaryMortgage")} />
            <FieldRow label="HELOC" value={liabilities.mortgage.heloc} onChange={setLSub("mortgage","heloc")} />
            <FieldRow label="Rental Mortgages" value={liabilities.mortgage.rentalMortgages} onChange={setLSub("mortgage","rentalMortgages")} />
          </CategorySection>

          {/* Auto Loans */}
          <CategorySection icon={Car} title="Auto Loans" color={ORANGE} subtotal={Number(liabilities.autoLoans) || 0} defaultOpen={false}>
            <FieldRow label="Auto Loans" value={liabilities.autoLoans} onChange={setL("autoLoans")} />
          </CategorySection>

          {/* Student Loans */}
          <CategorySection icon={GraduationCap} title="Student Loans" color={BLUE} subtotal={Number(liabilities.studentLoans) || 0} defaultOpen={false}>
            <FieldRow label="Student Loans" value={liabilities.studentLoans} onChange={setL("studentLoans")} />
          </CategorySection>

          {/* Credit Cards */}
          <CategorySection icon={CreditCard} title="Credit Cards" color={PURPLE} subtotal={totalCreditCards} defaultOpen={false}>
            {liabilities.creditCards.map(c => (
              <MultiFieldRow
                key={c.id}
                label={c.label}
                value={c.value}
                onChange={val => setCreditCard(c.id, val)}
                onRemove={liabilities.creditCards.length > 1 ? () => removeCreditCard(c.id) : undefined}
              />
            ))}
            <button
              onClick={addCreditCard}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "none", border: "none", cursor: "pointer",
                color: PURPLE, fontSize: "0.78rem", padding: "5px 0", marginTop: 2,
              }}
            >
              <Plus size={13} /> Add Card
            </button>
          </CategorySection>

          {/* Medical Debt */}
          <CategorySection icon={AlertTriangle} title="Medical Debt" color={RED} subtotal={Number(liabilities.medicalDebt) || 0} defaultOpen={false}>
            <FieldRow label="Medical Debt" value={liabilities.medicalDebt} onChange={setL("medicalDebt")} />
          </CategorySection>

          {/* Personal Loans */}
          <CategorySection icon={BookOpen} title="Personal Loans / Other" color={GOLD} subtotal={Number(liabilities.personalLoans) || 0} defaultOpen={false}>
            <FieldRow label="Personal Loans / Other" value={liabilities.personalLoans} onChange={setL("personalLoans")} />
          </CategorySection>

          {/* Liabilities running total */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(224,92,92,0.1)", border: "1px solid rgba(224,92,92,0.3)",
          }}>
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: RED }}>Total Liabilities</span>
            <span className="t-mono" style={{ color: RED, fontWeight: 700, fontSize: "1rem" }}>{fmtFull(totalLiabilities)}</span>
          </div>
        </div>

        {/* ══════════════════ RIGHT COLUMN ══════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Net Worth Display */}
          <div className="t-card-p" style={{
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(201,169,110,0.08) 0%, rgba(77,208,196,0.06) 100%)",
          }}>
            <div className="t-label" style={{ marginBottom: 8 }}>YOUR NET WORTH</div>
            <div style={{
              fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-1px",
              color: netWorth >= 0 ? GOLD : RED, fontFamily: "monospace",
              lineHeight: 1.1, marginBottom: 8,
            }}>
              {fmtFull(netWorth)}
            </div>
            <div style={{ color: "var(--text-3)", fontSize: "0.8rem", marginBottom: 16 }}>
              {fmtFull(totalAssets)} assets − {fmtFull(totalLiabilities)} liabilities
            </div>

            {/* Assets vs Liabilities bar */}
            <div style={{ marginTop: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: "0.75rem", color: "var(--text-3)" }}>
                <span>Assets {totalAssets > 0 ? Math.round((totalAssets / (totalAssets + totalLiabilities)) * 100) : 0}%</span>
                <span>Liabilities {totalAssets + totalLiabilities > 0 ? Math.round((totalLiabilities / (totalAssets + totalLiabilities)) * 100) : 0}%</span>
              </div>
              <div style={{ height: 14, borderRadius: 7, background: "var(--border-c)", overflow: "hidden", display: "flex" }}>
                {totalAssets + totalLiabilities > 0 && (
                  <>
                    <div style={{
                      width: `${(totalAssets / (totalAssets + totalLiabilities)) * 100}%`,
                      background: `linear-gradient(90deg, ${GREEN}, ${TEAL})`,
                      transition: "width 0.4s ease",
                    }} />
                    <div style={{
                      flex: 1,
                      background: `linear-gradient(90deg, ${RED}, #c0392b)`,
                    }} />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Asset Allocation Pie */}
          {pieData.length > 0 && (
            <div className="t-card-p">
              <div className="t-label" style={{ marginBottom: 12 }}>Asset Allocation</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={42} outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => fmtFull(v)} contentStyle={{ background: "var(--surface)", border: "1px solid var(--border-c)", borderRadius: 6, fontSize: "0.78rem", color: "var(--text-1)" }} itemStyle={{ color: "var(--text-1)" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                  {pieData.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.76rem" }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ flex: 1, color: "var(--text-2)" }}>{d.name}</span>
                      <span className="t-mono" style={{ color: "var(--text-1)", fontSize: "0.74rem" }}>
                        {totalAssets > 0 ? Math.round((d.value / totalAssets) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Net Worth History */}
          <div className="t-card-p">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div className="t-label">Net Worth History</div>
              {history.length < 2 && (
                <span className="t-badge" style={{ background: "rgba(201,169,110,0.15)", color: GOLD, fontSize: "0.68rem" }}>
                  Sample data — click Add Snapshot to record real data
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={historyChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GOLD} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={GOLD} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="assetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GREEN} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={GREEN} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border-c)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "var(--text-3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} width={52} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Assets" stroke={GREEN} strokeWidth={1.5} fill="url(#assetGrad)" dot={false} />
                <Area type="monotone" dataKey="Net Worth" stroke={GOLD} strokeWidth={2} fill="url(#nwGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Financial Independence Milestones */}
          <div className="t-card-p">
            <div className="t-label" style={{ marginBottom: 12 }}>Financial Independence Milestones</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {milestones.map(m => {
                const pct = Math.min((netWorth / m) * 100, 100);
                const reached = netWorth >= m;
                const label = m >= 1e6 ? `$${m / 1e6}M` : `$${(m / 1000).toFixed(0)}K`;
                return (
                  <div key={m}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.78rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {reached
                          ? <CheckCircle size={13} color={GREEN} />
                          : <div style={{ width: 13, height: 13, borderRadius: "50%", border: `1.5px solid var(--border-c)` }} />
                        }
                        <span style={{ color: reached ? GREEN : "var(--text-2)" }}>{label} Net Worth</span>
                      </div>
                      <span className="t-mono" style={{ color: reached ? GREEN : "var(--text-3)", fontSize: "0.76rem" }}>
                        {pct >= 100 ? "Achieved!" : `${pct.toFixed(0)}%`}
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "var(--border-c)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.max(pct, 0)}%`,
                        background: reached
                          ? `linear-gradient(90deg, ${GREEN}, ${TEAL})`
                          : `linear-gradient(90deg, ${GOLD}, ${TEAL})`,
                        borderRadius: 3,
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Debt-to-Asset Ratio */}
          <div className="t-card-p">
            <div className="t-label" style={{ marginBottom: 4 }}>Debt-to-Asset Ratio</div>
            <div style={{ color: "var(--text-3)", fontSize: "0.75rem", marginBottom: 8 }}>
              Total liabilities as a percentage of total assets
            </div>
            <DebtGauge ratio={debtToAssetRatio} />
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 8, fontSize: "0.72rem", color: "var(--text-3)" }}>
              <span style={{ color: GREEN }}>Below 20% — Healthy</span>
              <span style={{ color: GOLD }}>20–40% — Moderate</span>
              <span style={{ color: RED }}>Above 40% — High</span>
            </div>
          </div>

        </div>
        {/* ══════════════════ END RIGHT COLUMN ══════════════════ */}

      </div>
    </div>
  );
}
