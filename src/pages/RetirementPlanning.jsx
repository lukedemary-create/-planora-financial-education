import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  TrendingUp, DollarSign, Target, Shield, Brain, ChevronRight, ChevronLeft,
  Check, Zap, Heart, Briefcase, Users,
  Download, RefreshCw, Star, Award, Clock, BarChart2, Sun, Plane, Home, Link2,
} from "lucide-react";
import ReactConfetti from "react-confetti";

/* ─── Design Tokens ──────────────────────────────────────────────────── */
const C = {
  bg: "#1a1410", surface: "#231c16", elevated: "#2d2419",
  border: "var(--border-c)", borderSub: "var(--elevated)",
  text: "#f0e8d8", textSec: "#a89070", textMuted: "#6b5540",
  gold: "#c9a96e", goldDim: "rgba(201,169,110,0.15)",
  teal: "#00B4C6", tealDim: "rgba(0,180,198,0.12)",
  success: "#10b981", warning: "#f59e0b", danger: "#ef4444",
  indigo: "#818cf8",
};

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const fmt = (n) => {
  const v = Math.abs(n || 0);
  if (v >= 1e6) return (n < 0 ? "-$" : "$") + (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (n < 0 ? "-$" : "$") + (v / 1e3).toFixed(1) + "K";
  return (n < 0 ? "-$" : "$") + Math.round(v).toLocaleString();
};
const fmtM = (n) => "$" + Math.round(n || 0).toLocaleString() + "/mo";
const pct = (n) => Math.round((n || 0) * 10) / 10 + "%";
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function useLS(key, def) {
  const [v, setV] = useState(() => {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : def; } catch { return def; }
  });
  const set = useCallback((val) => {
    const next = typeof val === "function" ? val(v) : val;
    setV(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  }, [v]);
  return [v, set];
}

/* ─── Import data from other sections ────────────────────────────────── */
function importExistingData() {
  const get = (k, d) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : d; } catch { return d; } };

  const bpIncome = get("bp_income", 0);
  const bpCats = get("bp_categories", []);
  const bpRetirement = get("bp_retirement", {});
  const nwtAssets = get("nwt_assets", {});
  const nwtLiab = get("nwt_liabilities", {});
  const liProfile = get("li_profile", {});
  const liPolicies = get("li_policies", []);
  const raProfile = get("ra_profile", null);
  const raPortfolio = get("ra_portfolio", []);

  const investments = nwtAssets.investments || {};
  const cashSavings = nwtAssets.cashSavings || {};
  const realEstate = nwtAssets.realEstate || {};

  const totalDebt = (nwtLiab.mortgage?.primaryMortgage || 0) +
    (nwtLiab.autoLoans || 0) + (nwtLiab.studentLoans || 0) +
    (nwtLiab.creditCards?.reduce((s, c) => s + (c.value || 0), 0) || 0);

  const monthlyExpenses = bpCats.reduce((s, c) => s + (c.budget || 0), 0);
  const totalInsurance = liPolicies.reduce((s, p) => s + (p.faceValue || p.coverage || 0), 0);
  const riskScore = raProfile?.score || raProfile?.totalScore || null;

  return {
    annualIncome: (bpIncome || liProfile.annualIncome || 0) > 0
      ? (bpIncome * 12 || liProfile.annualIncome) : 80000,
    monthlyExpenses: monthlyExpenses || 4500,
    currentAge: bpRetirement.currentAge || liProfile.age || 40,
    retireAge: bpRetirement.retireAge || 65,
    lifeExp: bpRetirement.lifeExp || 88,
    inflation: bpRetirement.inflation || 2.5,
    k401Balance: investments.k401 || 0,
    iraBalance: investments.ira || 0,
    taxableBrokerage: investments.taxableBrokerage || 0,
    cashSavings: (cashSavings.checking || 0) + (cashSavings.savings || 0) + (cashSavings.moneyMarket || 0),
    homeValue: realEstate.primaryHome || 0,
    totalDebt,
    lifeInsurance: totalInsurance,
    riskScore,
    raPortfolio,
    imported: {
      income: bpIncome > 0,
      assets: Object.keys(investments).length > 0,
      age: !!bpRetirement.currentAge,
      insurance: liPolicies.length > 0,
      risk: !!raProfile,
    },
  };
}

/* ─── Module definitions ─────────────────────────────────────────────── */
const MODULES = [
  { id: "vision",     title: "Vision",        short: "Vision"    },
  { id: "snapshot",   title: "Snapshot",      short: "Snapshot"  },
  { id: "spending",   title: "Spending",      short: "Spending"  },
  { id: "income",     title: "Income",        short: "Income"    },
  { id: "gap",        title: "Gap Analysis",  short: "Gap"       },
  { id: "allocation", title: "Allocation",    short: "Allocate"  },
  { id: "tax",        title: "Tax Strategy",  short: "Tax"       },
  { id: "ai",         title: "AI Advisor",    short: "AI"        },
  { id: "dashboard",  title: "Dashboard",     short: "Finale"    },
];

/* ─── Shared UI ───────────────────────────────────────────────────────── */
const cardStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border-c)",
  borderRadius: 20, padding: "1.5rem",
  backdropFilter: "blur(12px)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 var(--border-c)",
};

function ImportedBadge() {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: C.gold,
      background: C.goldDim, borderRadius: 4,
      padding: "2px 6px", marginLeft: 6,
    }}>Imported</span>
  );
}

function AnimatedNumber({ value, prefix = "$", suffix = "", decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    const start = display;
    const end = value || 0;
    const duration = 1000;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);
  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();
  return <span>{prefix}{formatted}{suffix}</span>;
}

function GoldSlider({ value, min, max, step = 1, onChange, label, format }) {
  const pctFill = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      {label && <div style={{ fontSize: 12, color: C.textSec, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <span style={{ color: C.gold, fontFamily: "monospace", fontWeight: 700 }}>
          {format ? format(value) : value}
        </span>
      </div>}
      <div style={{ position: "relative", height: 6, background: C.border, borderRadius: 99 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pctFill}%`, background: `linear-gradient(90deg, ${C.gold}, #d4a555)`, borderRadius: 99, transition: "width 0.1s" }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(+e.target.value)}
          style={{ position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer", height: "100%", margin: 0 }}
        />
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textMuted, marginBottom: "0.75rem" }}>{children}</div>;
}

function MetricCard({ label, value, sub, color = C.gold, icon: Icon, large }) {
  return (
    <div style={{ ...cardStyle, padding: "1rem 1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMuted, marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: large ? "1.75rem" : "1.25rem", fontWeight: 900, color, fontFamily: "monospace", lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{sub}</div>}
        </div>
        {Icon && <Icon size={18} color={color} style={{ opacity: 0.6 }} />}
      </div>
    </div>
  );
}

function GaugeArc({ value, max, color = C.gold, size = 140, label, sublabel }) {
  const pctFill = clamp((value / max) * 100, 0, 100);
  const r = 50, cx = 70, cy = 70;
  const circ = Math.PI * r;
  const stroke = circ * (1 - pctFill / 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size * 0.6} viewBox="0 0 140 80">
        <path d="M 20 70 A 50 50 0 0 1 120 70" fill="none" stroke={C.border} strokeWidth="10" strokeLinecap="round" />
        <motion.path
          d="M 20 70 A 50 50 0 0 1 120 70" fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={stroke}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: stroke }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <text x={cx} y={cy - 4} textAnchor="middle" fill={color} fontSize="15" fontWeight="700" fontFamily="monospace">
          {label}
        </text>
        {sublabel && <text x={cx} y={cy + 12} textAnchor="middle" fill={C.textMuted} fontSize="8">
          {sublabel}
        </text>}
      </svg>
    </div>
  );
}

/* ─── Boot Sequence ───────────────────────────────────────────────────── */
function BootSequence({ onDone }) {
  const [phase, setPhase] = useState(0);
  const PHRASE = "YOUR RETIREMENT JOURNEY BEGINS HERE";

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2800),
      setTimeout(() => { onDone(); }, 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <motion.div
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed", inset: 0, background: C.bg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        zIndex: 999,
      }}
    >
      {/* Ambient orbs */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "30%", left: "20%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${C.goldDim} 0%, transparent 70%)`, filter: "blur(60px)", animation: "orbPulse 6s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "15%", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${C.tealDim} 0%, transparent 70%)`, filter: "blur(60px)", animation: "orbPulse 8s ease-in-out infinite 2s" }} />
      </div>

      {/* Phase 1: Gold pulse */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.4, 1], opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.7 }}
            style={{ width: 24, height: 24, borderRadius: "50%", background: C.gold, boxShadow: `0 0 40px ${C.gold}80` }} />
        )}
      </AnimatePresence>

      {/* Phase 2: Text reveal */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ textAlign: "center" }}>
            <motion.div style={{ fontSize: "clamp(18px,3vw,28px)", fontWeight: 900, letterSpacing: "0.15em", color: C.gold, fontFamily: "monospace", marginBottom: 16 }}>
              {PHRASE.split("").map((ch, i) => (
                <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03, duration: 0.1 }}>
                  {ch === " " ? "\u00A0" : ch}
                </motion.span>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              style={{ fontSize: 13, color: C.textMuted, letterSpacing: "0.08em" }}>
              Importing your Planora data. Building your personal plan.
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 3: Loading bar */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 240 }} transition={{ duration: 0.4 }}
            style={{ marginTop: 32, height: 2, background: C.border, borderRadius: 99, overflow: "hidden" }}>
            <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 0.7, ease: "easeInOut" }}
              style={{ height: "100%", background: `linear-gradient(90deg, ${C.gold}, ${C.teal})`, borderRadius: 99 }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip */}
      <button onClick={onDone} style={{ position: "absolute", bottom: 32, right: 32, background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 14px", color: C.textMuted, fontSize: 11, cursor: "pointer", letterSpacing: "0.08em" }}>
        SKIP →
      </button>

      <style>{`
        @keyframes orbPulse { 0%,100%{transform:scale(1);opacity:0.6;} 50%{transform:scale(1.15);opacity:1;} }
      `}</style>
    </motion.div>
  );
}

/* ─── Progress Timeline ───────────────────────────────────────────────── */
function ProgressTimeline({ current, completed, onJump }) {
  return (
    <div style={{ marginBottom: "2rem", overflowX: "auto", paddingBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", minWidth: MODULES.length * 90, position: "relative" }}>
        {MODULES.map((mod, i) => {
          const done = completed.includes(mod.id);
          const active = i === current;
          return (
            <React.Fragment key={mod.id}>
              {/* Connecting line */}
              {i > 0 && (
                <div style={{ flex: 1, height: 2, background: done || completed.includes(MODULES[i-1].id) ? C.gold : C.border, transition: "background 0.5s", minWidth: 20 }} />
              )}
              {/* Node */}
              <div onClick={() => done && onJump(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: done ? "pointer" : "default", flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: done ? C.gold : active ? "transparent" : C.border,
                  border: active ? `2px solid ${C.gold}` : done ? "none" : `2px solid ${C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                  boxShadow: active ? `0 0 0 4px ${C.goldDim}` : "none",
                  transition: "all 0.3s",
                }}>
                  {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.gold }} />}
                  {done && <Check size={12} color={C.bg} strokeWidth={3} />}
                  {active && <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `1px solid ${C.gold}`, opacity: 0.4, animation: "ringPulse 2s ease-in-out infinite" }} />}
                </div>
                <div style={{ fontSize: 9, fontWeight: 600, color: active ? C.gold : done ? C.textSec : C.textMuted, marginTop: 6, letterSpacing: "0.06em", textAlign: "center", whiteSpace: "nowrap" }}>
                  {mod.short}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <style>{`@keyframes ringPulse { 0%,100%{transform:scale(1);opacity:0.4;} 50%{transform:scale(1.3);opacity:0;} }`}</style>
    </div>
  );
}

/* ─── MODULE 1: Vision ────────────────────────────────────────────────── */
const LIFESTYLES = [
  { id: "simple", label: "Simple & Peaceful", icon: Home, color: C.teal, desc: "Low-key, community-focused, modest spending" },
  { id: "comfortable", label: "Comfortable", icon: Star, color: C.gold, desc: "Travel occasionally, enjoy hobbies, no stress" },
  { id: "travel", label: "Travel-Focused", icon: Plane, color: C.indigo, desc: "Extensive travel, experiences over things" },
  { id: "luxury", label: "Luxury", icon: Award, color: "#f59e0b", desc: "Premium experiences, fine dining, giving back" },
  { id: "legacy", label: "Family & Legacy", icon: Users, color: C.success, desc: "Support family, leave significant inheritance" },
  { id: "fire", label: "Early / FIRE", icon: Zap, color: "#ef4444", desc: "Financial independence, retire by 50" },
  { id: "semi", label: "Semi-Retired", icon: Briefcase, color: C.textSec, desc: "Part-time work, passion projects, gradual shift" },
];

const WORRIES = ["Running out of money","Healthcare costs","Market crash","Inflation","Cognitive decline","Burdening family","Other"];
const TRAVEL_OPTS = ["Minimal","Occasional","Frequent","Extensive"];
const WORK_OPTS = ["Fully Retired","Part-time Consulting","Passion Project","Volunteer","Undecided"];

function ModuleVision({ plan, update, onNext, imported }) {
  const [subStep, setSubStep] = useState(0);

  const steps = [
    { q: "At what age do you want to retire?", field: "retireAge" },
    { q: "What does your ideal retirement look like?", field: "visionText" },
    { q: "Travel plans?", field: "travelPlan" },
    { q: "Work in retirement?", field: "workPlan" },
    { q: "Biggest retirement worry?", field: "biggestWorry" },
    { q: "Choose your retirement lifestyle", field: "lifestyle" },
  ];

  const yearsUntil = (plan.retireAge || 65) - (plan.currentAge || 40);

  return (
    <div>
      {/* Cinematic opening */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ fontSize: "clamp(13px,1.5vw,15px)", color: C.textMuted, fontStyle: "italic", lineHeight: 1.9, marginBottom: "1rem" }}>
          {["Before we talk numbers...", "Let's talk about what retirement", "means to you."].map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.3 }}>{line}</motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 0: Retire Age */}
        {subStep === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} style={{ ...cardStyle, maxWidth: 540, margin: "0 auto" }}>
            <SectionLabel>When do you want to retire?</SectionLabel>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "4rem", fontWeight: 900, color: C.gold, fontFamily: "monospace" }}>{plan.retireAge || 65}</span>
              <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
                {yearsUntil > 0 ? `${yearsUntil} years from now` : yearsUntil === 0 ? "This year" : "Already retired"}
                {imported.age && <ImportedBadge />}
              </div>
            </div>
            <GoldSlider value={plan.retireAge || 65} min={45} max={80} onChange={v => update({ retireAge: v })} label="Target retirement age" format={v => `Age ${v}`} />
            <GoldSlider value={plan.lifeExp || 88} min={75} max={100} onChange={v => update({ lifeExp: v })} label="Life expectancy planning" format={v => `Age ${v}`} />
            <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {[55, 60, 62, 65, 67, 70].map(a => (
                <button key={a} onClick={() => update({ retireAge: a })} style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${plan.retireAge === a ? C.gold : C.border}`, background: plan.retireAge === a ? C.goldDim : "transparent", color: plan.retireAge === a ? C.gold : C.textMuted, fontSize: 12, cursor: "pointer" }}>Age {a}</button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 1: Vision text */}
        {subStep === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} style={{ ...cardStyle, maxWidth: 540, margin: "0 auto" }}>
            <SectionLabel>Paint your picture</SectionLabel>
            <p style={{ fontSize: 13, color: C.textSec, marginBottom: "1rem", lineHeight: 1.7 }}>What does your ideal retirement look like? Where are you? What does a typical day feel like?</p>
            <textarea
              value={plan.visionText || ""}
              onChange={e => update({ visionText: e.target.value })}
              placeholder="Traveling through Europe… spending mornings with grandchildren… finally starting that business…"
              rows={5}
              style={{ width: "100%", background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.75rem 1rem", color: C.text, fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </motion.div>
        )}

        {/* Step 2: Travel */}
        {subStep === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} style={{ ...cardStyle, maxWidth: 540, margin: "0 auto" }}>
            <SectionLabel>Travel plans in retirement?</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {TRAVEL_OPTS.map(opt => (
                <button key={opt} onClick={() => update({ travelPlan: opt })} style={{ padding: "0.875rem", borderRadius: 12, border: `1px solid ${plan.travelPlan === opt ? C.gold : C.border}`, background: plan.travelPlan === opt ? C.goldDim : C.elevated, color: plan.travelPlan === opt ? C.gold : C.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Work */}
        {subStep === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} style={{ ...cardStyle, maxWidth: 540, margin: "0 auto" }}>
            <SectionLabel>Work in retirement?</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {WORK_OPTS.map(opt => (
                <button key={opt} onClick={() => update({ workPlan: opt })} style={{ padding: "0.75rem 1rem", borderRadius: 10, border: `1px solid ${plan.workPlan === opt ? C.gold : C.border}`, background: plan.workPlan === opt ? C.goldDim : C.elevated, color: plan.workPlan === opt ? C.gold : C.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                  {plan.workPlan === opt && <Check size={12} style={{ marginRight: 8 }} />}{opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 4: Worry */}
        {subStep === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} style={{ ...cardStyle, maxWidth: 540, margin: "0 auto" }}>
            <SectionLabel>What concerns you most about retirement?</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
              {WORRIES.map(w => (
                <button key={w} onClick={() => update({ biggestWorry: w })} style={{ padding: "0.5rem 1rem", borderRadius: 20, border: `1px solid ${plan.biggestWorry === w ? C.danger : C.border}`, background: plan.biggestWorry === w ? "rgba(239,68,68,0.1)" : C.elevated, color: plan.biggestWorry === w ? C.danger : C.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                  {w}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 5: Lifestyle */}
        {subStep === 5 && (
          <motion.div key="s5" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <SectionLabel>Choose your retirement lifestyle</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.875rem" }}>
              {LIFESTYLES.map(ls => {
                const Icon = ls.icon;
                const sel = plan.lifestyle === ls.id;
                return (
                  <motion.button key={ls.id} onClick={() => update({ lifestyle: ls.id })} whileHover={{ y: -2 }} style={{ padding: "1.25rem", borderRadius: 14, border: `1px solid ${sel ? ls.color : C.border}`, background: sel ? `${ls.color}15` : C.elevated, cursor: "pointer", textAlign: "left", transition: "border-color 0.2s, background 0.2s", boxShadow: sel ? `0 0 20px ${ls.color}25` : "none" }}>
                    <Icon size={20} color={ls.color} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: sel ? ls.color : C.text, marginBottom: 4 }}>{ls.label}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>{ls.desc}</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-step nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem" }}>
        <button onClick={() => subStep > 0 ? setSubStep(s => s - 1) : null} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 16px", color: C.textMuted, fontSize: 13, cursor: subStep > 0 ? "pointer" : "not-allowed", opacity: subStep > 0 ? 1 : 0.3 }}>
          ← Back
        </button>
        <div style={{ display: "flex", gap: 6 }}>
          {steps.map((_, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === subStep ? C.gold : i < subStep ? C.success : C.border }} />)}
        </div>
        {subStep < steps.length - 1
          ? <button onClick={() => setSubStep(s => s + 1)} style={{ background: C.gold, border: "none", borderRadius: 8, padding: "8px 20px", color: C.bg, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Continue →</button>
          : <button onClick={onNext} style={{ background: C.gold, border: "none", borderRadius: 8, padding: "8px 20px", color: C.bg, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Build My Plan →</button>
        }
      </div>
    </div>
  );
}

/* ─── MODULE 2: Snapshot ──────────────────────────────────────────────── */
function ModuleSnapshot({ plan, update, onNext, onPrev, imported }) {
  const totalAssets = (plan.k401Balance || 0) + (plan.iraBalance || 0) + (plan.taxableBrokerage || 0) + (plan.cashSavings || 0) + (plan.homeValue || 0) + (plan.otherAssets || 0);
  const netWorth = totalAssets - (plan.totalDebt || 0);

  const donutData = [
    { name: "401k/403b", value: plan.k401Balance || 0, color: C.gold },
    { name: "IRA/Roth", value: plan.iraBalance || 0, color: C.teal },
    { name: "Taxable", value: plan.taxableBrokerage || 0, color: C.indigo },
    { name: "Cash", value: plan.cashSavings || 0, color: C.success },
    { name: "Real Estate", value: plan.homeValue || 0, color: "#60a5fa" },
    { name: "Other", value: plan.otherAssets || 0, color: C.textMuted },
  ].filter(d => d.value > 0);

  const retirementAssets = (plan.k401Balance || 0) + (plan.iraBalance || 0) + (plan.taxableBrokerage || 0);
  const savingsRate = plan.annualIncome > 0 ? ((plan.annualSavings || 0) / plan.annualIncome) * 100 : 0;
  const readinessScore = Math.min(100, Math.round((retirementAssets / Math.max(1, (plan.annualIncome || 80000) * 10)) * 50 + savingsRate * 2));

  const inp = (label, field, prefix = "$", isImported = false) => (
    <div style={{ marginBottom: "0.875rem" }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
        {label}{isImported && imported[field] && <ImportedBadge />}
      </div>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 13 }}>{prefix}</span>}
        <input
          type="number"
          value={plan[field] || ""}
          onChange={e => update({ [field]: +e.target.value })}
          style={{ width: "100%", background: C.elevated, border: `1px solid ${plan[field] ? C.gold + "40" : C.border}`, borderRadius: 8, padding: `8px 10px 8px ${prefix ? "24px" : "10px"}`, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }}
          placeholder="0"
        />
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Left: Inputs */}
        <div>
          <SectionLabel>Income & Savings</SectionLabel>
          {inp("Annual Income", "annualIncome", "$", true)}
          {inp("Annual Savings Contribution", "annualSavings", "$")}
          {inp("Current Age", "currentAge", "", true)}
          <SectionLabel style={{ marginTop: "1rem" }}>Account Balances</SectionLabel>
          {inp("401k / 403b Balance", "k401Balance", "$", true)}
          {inp("IRA / Roth IRA Balance", "iraBalance", "$", true)}
          {inp("Taxable Brokerage", "taxableBrokerage", "$", true)}
          {inp("Cash & Savings", "cashSavings", "$", true)}
          {inp("Home / Real Estate Value", "homeValue", "$", true)}
          {inp("Other Assets", "otherAssets", "$")}
          {inp("Total Debt", "totalDebt", "$", true)}
        </div>

        {/* Right: Live dashboard */}
        <div>
          <SectionLabel>Live Net Worth Snapshot</SectionLabel>
          <div style={{ ...cardStyle, marginBottom: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>NET WORTH</div>
            <div style={{ fontSize: "2rem", fontWeight: 900, fontFamily: "monospace", color: netWorth >= 0 ? C.gold : C.danger }}>
              <AnimatedNumber value={netWorth} />
            </div>
          </div>

          {donutData.length > 0 && (
            <div style={{ ...cardStyle, marginBottom: "1rem" }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270} isAnimationActive>
                    {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", justifyContent: "center", marginTop: 8 }}>
                {donutData.map(d => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textMuted }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: d.color }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
            <MetricCard label="Retirement Assets" value={fmt(retirementAssets)} color={C.gold} icon={TrendingUp} />
            <MetricCard label="Starting Readiness" value={`${readinessScore}/100`} color={readinessScore >= 70 ? C.success : readinessScore >= 40 ? C.warning : C.danger} icon={Target} />
          </div>
        </div>
      </div>
      <ModuleNav onNext={onNext} onPrev={onPrev} />
    </div>
  );
}

/* ─── MODULE 3: Spending ──────────────────────────────────────────────── */
const SPEND_CATS = [
  { id: "housing", label: "Housing", icon: Home, default: 2000 },
  { id: "food", label: "Food & Dining", icon: Star, default: 800 },
  { id: "health", label: "Healthcare", icon: Heart, default: 600 },
  { id: "travel", label: "Travel", icon: Plane, default: 500 },
  { id: "transport", label: "Transportation", icon: TrendingUp, default: 400 },
  { id: "entertainment", label: "Entertainment", icon: Sun, default: 300 },
  { id: "utilities", label: "Utilities", icon: Zap, default: 250 },
  { id: "personal", label: "Personal & Misc", icon: Users, default: 300 },
];

function ModuleSpending({ plan, update, onNext, onPrev }) {
  const spends = plan.retireSpending || SPEND_CATS.reduce((acc, c) => ({ ...acc, [c.id]: c.default }), {});
  const setSpend = (id, v) => update({ retireSpending: { ...spends, [id]: v } });
  const totalMonthly = Object.values(spends).reduce((s, v) => s + (v || 0), 0);
  const inflationRate = plan.inflation || 2.5;
  const yearsUntil = (plan.retireAge || 65) - (plan.currentAge || 40);
  const inflatedMonthly = totalMonthly * Math.pow(1 + inflationRate / 100, Math.max(0, yearsUntil));
  const annualNeeded = inflatedMonthly * 12;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>
        <div>
          <SectionLabel>Monthly Retirement Spending Estimate</SectionLabel>
          <div style={{ ...cardStyle, marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div style={{ fontSize: 13, color: C.textSec }}>Total Monthly</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 900, color: C.gold, fontFamily: "monospace" }}>{fmtM(totalMonthly)}</div>
            </div>
            {SPEND_CATS.map(cat => {
              const Icon = cat.icon;
              return (
                <div key={cat.id} style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Icon size={13} color={C.textMuted} />
                    <GoldSlider value={spends[cat.id] || 0} min={0} max={5000} step={50} onChange={v => setSpend(cat.id, v)} label={cat.label} format={v => `$${v.toLocaleString()}`} />
                  </div>
                </div>
              );
            })}
          </div>
          <GoldSlider value={inflationRate} min={1} max={6} step={0.1} onChange={v => update({ inflation: v })} label="Expected inflation rate" format={v => `${v.toFixed(1)}%`} />
        </div>

        <div>
          <SectionLabel>Inflation Impact</SectionLabel>
          <div style={{ ...cardStyle, marginBottom: "0.875rem", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4 }}>TODAY'S DOLLARS</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, fontFamily: "monospace", color: C.teal }}>{fmtM(totalMonthly)}</div>
          </div>
          <div style={{ textAlign: "center", fontSize: 20, color: C.textMuted, margin: "0.5rem 0" }}>↓</div>
          <div style={{ ...cardStyle, marginBottom: "0.875rem", textAlign: "center", border: `1px solid ${C.gold}40` }}>
            <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4 }}>AT RETIREMENT ({yearsUntil}yr)</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, fontFamily: "monospace", color: C.gold }}>{fmtM(Math.round(inflatedMonthly))}</div>
          </div>
          <MetricCard label="Annual Need at Retirement" value={fmt(annualNeeded)} color={C.gold} icon={DollarSign} large />
          <div style={{ ...cardStyle, marginTop: "0.875rem" }}>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>4% Safe Withdrawal → Nest Egg Target</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 900, color: C.warning, fontFamily: "monospace" }}>{fmt(annualNeeded * 25)}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>Required portfolio size</div>
          </div>
        </div>
      </div>
      <ModuleNav onNext={onNext} onPrev={onPrev} />
    </div>
  );
}

/* ─── MODULE 4: Income Sources ────────────────────────────────────────── */
function ModuleIncome({ plan, update, onNext, onPrev }) {
  const addSource = () => {
    const sources = [...(plan.incomeSources || []), { id: Date.now(), name: "New Source", monthly: 1000, startAge: plan.retireAge || 65, type: "variable" }];
    update({ incomeSources: sources });
  };
  const removeSource = (id) => update({ incomeSources: (plan.incomeSources || []).filter(s => s.id !== id) });
  const updateSource = (id, field, val) => update({ incomeSources: (plan.incomeSources || []).map(s => s.id === id ? { ...s, [field]: val } : s) });

  const ssMonthly = plan.ssMonthly || 2000;
  const ssFRA = plan.ssFRA || 67;
  const ss62 = Math.round(ssMonthly * 0.70);
  const ss67 = ssMonthly;
  const ss70 = Math.round(ssMonthly * 1.24);

  const beData = [];
  for (let age = 62; age <= 95; age++) {
    beData.push({
      age,
      "Claim 62": Math.round(ss62 * Math.max(0, (age - 62) * 12)),
      "Claim 67": Math.round(ss67 * Math.max(0, (age - 67) * 12)),
      "Claim 70": Math.round(ss70 * Math.max(0, (age - 70) * 12)),
    });
  }

  const totalGuaranteed = (plan.incomeSources || []).filter(s => s.type === "guaranteed").reduce((sum, s) => sum + (s.monthly * 12 || 0), 0) + ss67 * 12;
  const totalVariable = (plan.incomeSources || []).filter(s => s.type === "variable").reduce((sum, s) => sum + (s.monthly * 12 || 0), 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Social Security */}
        <div>
          <SectionLabel>Social Security Strategy</SectionLabel>
          <div style={{ ...cardStyle, marginBottom: "1rem" }}>
            <div style={{ fontSize: 13, color: C.textSec, marginBottom: "1rem" }}>Estimated benefit at Full Retirement Age</div>
            <div style={{ marginBottom: "1rem" }}>
              <GoldSlider value={ssMonthly} min={500} max={4000} step={50} onChange={v => update({ ssMonthly: v })} label="Monthly benefit (FRA)" format={v => `$${v.toLocaleString()}/mo`} />
              <GoldSlider value={ssFRA} min={66} max={67} step={0.1} onChange={v => update({ ssFRA: v })} label="Your Full Retirement Age" format={v => `${v}`} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
              {[{ age: 62, val: ss62, label: "Claim at 62" }, { age: 67, val: ss67, label: `FRA ${ssFRA}` }, { age: 70, val: ss70, label: "Claim at 70" }].map(opt => (
                <div key={opt.age} onClick={() => update({ ssClaimAge: opt.age })} style={{ ...cardStyle, padding: "0.75rem", textAlign: "center", cursor: "pointer", border: `1px solid ${plan.ssClaimAge === opt.age ? C.gold : C.border}`, background: plan.ssClaimAge === opt.age ? C.goldDim : C.elevated }}>
                  <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 4 }}>{opt.label}</div>
                  <div style={{ fontSize: "1rem", fontWeight: 900, color: plan.ssClaimAge === opt.age ? C.gold : C.text, fontFamily: "monospace" }}>${opt.val.toLocaleString()}</div>
                  <div style={{ fontSize: 9, color: C.textMuted }}>per month</div>
                </div>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={beData.filter((_, i) => i % 3 === 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="age" stroke={C.textMuted} tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={v => fmt(v)} stroke={C.textMuted} tick={{ fontSize: 10 }} width={55} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 11 }} />
              <Line type="monotone" dataKey="Claim 62" stroke={C.danger} dot={false} strokeWidth={2} isAnimationActive />
              <Line type="monotone" dataKey="Claim 67" stroke={C.warning} dot={false} strokeWidth={2} isAnimationActive />
              <Line type="monotone" dataKey="Claim 70" stroke={C.gold} dot={false} strokeWidth={2} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 10, color: C.textMuted, textAlign: "center", marginTop: 4 }}>Cumulative lifetime SS benefits by claiming age</div>
        </div>

        {/* Other income sources */}
        <div>
          <SectionLabel>Other Income Sources</SectionLabel>
          {(plan.incomeSources || []).map(src => (
            <div key={src.id} style={{ ...cardStyle, marginBottom: "0.625rem", padding: "0.875rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <input value={src.name} onChange={e => updateSource(src.id, "name", e.target.value)} style={{ flex: 1, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 8px", color: C.text, fontSize: 12, outline: "none" }} />
                <button onClick={() => removeSource(src.id)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 8px", color: C.danger, cursor: "pointer", fontSize: 11 }}>×</button>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input type="number" value={src.monthly || ""} onChange={e => updateSource(src.id, "monthly", +e.target.value)} placeholder="Monthly $" style={{ flex: 1, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 8px", color: C.text, fontSize: 12, outline: "none" }} />
                <select value={src.type} onChange={e => updateSource(src.id, "type", e.target.value)} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 8px", color: C.text, fontSize: 12, outline: "none" }}>
                  <option value="guaranteed">Guaranteed</option>
                  <option value="variable">Variable</option>
                </select>
              </div>
            </div>
          ))}
          <button onClick={addSource} style={{ width: "100%", padding: "0.75rem", border: `1px dashed ${C.border}`, borderRadius: 10, background: "none", color: C.textMuted, fontSize: 13, cursor: "pointer" }}>
            + Add Income Source
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem", marginTop: "1rem" }}>
            <MetricCard label="Guaranteed Annual" value={fmt(totalGuaranteed)} color={C.success} icon={Shield} />
            <MetricCard label="Variable Annual" value={fmt(totalVariable)} color={C.teal} icon={TrendingUp} />
          </div>
        </div>
      </div>
      <ModuleNav onNext={onNext} onPrev={onPrev} />
    </div>
  );
}

/* ─── MODULE 5: Gap Analysis ──────────────────────────────────────────── */
function ModuleGap({ plan, update, onNext, onPrev }) {
  const [showConfetti, setShowConfetti] = useState(false);

  const retireAge = plan.retireAge || 65;
  const curAge = plan.currentAge || 40;
  const lifeExp = plan.lifeExp || 88;
  const yearsUntil = Math.max(0, retireAge - curAge);
  const yearsInRetire = Math.max(0, lifeExp - retireAge);

  const spends = plan.retireSpending || {};
  const monthlySpend = Object.values(spends).reduce((s, v) => s + (v || 0), 0) || 5000;
  const inflation = plan.inflation || 2.5;
  const inflatedMonthly = monthlySpend * Math.pow(1 + inflation / 100, yearsUntil);
  const annualNeed = inflatedMonthly * 12;

  const ssMonthly = plan.ssClaimAge === 62 ? (plan.ssMonthly || 2000) * 0.70
    : plan.ssClaimAge === 70 ? (plan.ssMonthly || 2000) * 1.24
    : (plan.ssMonthly || 2000);
  const otherIncome = (plan.incomeSources || []).reduce((s, src) => s + (src.monthly || 0), 0);
  const totalMonthlyIncome = ssMonthly + otherIncome;
  const annualGap = Math.max(0, annualNeed - totalMonthlyIncome * 12);
  const requiredNestEgg = annualGap * 25;

  const currentRetireAssets = (plan.k401Balance || 0) + (plan.iraBalance || 0) + (plan.taxableBrokerage || 0);
  const annualSavings = plan.annualSavings || 0;
  const growthRate = 0.07;
  const projectedNestEgg = currentRetireAssets * Math.pow(1 + growthRate, yearsUntil) +
    annualSavings * ((Math.pow(1 + growthRate, yearsUntil) - 1) / growthRate);

  const gap = requiredNestEgg - projectedNestEgg;
  const onTrack = gap <= 0;

  useEffect(() => {
    if (onTrack) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4000); }
  }, [onTrack]);

  const additionalMonthlySavings = gap > 0 && yearsUntil > 0
    ? gap / (((Math.pow(1 + growthRate / 12, yearsUntil * 12) - 1) / (growthRate / 12)) || 1)
    : 0;

  // Projection chart
  const projData = [];
  for (let yr = 0; yr <= yearsUntil; yr++) {
    const projected = currentRetireAssets * Math.pow(1 + growthRate, yr) +
      annualSavings * ((Math.pow(1 + growthRate, yr) - 1) / growthRate);
    projData.push({ year: curAge + yr, projected: Math.round(projected), required: Math.round(requiredNestEgg * (yr / Math.max(1, yearsUntil))) });
  }

  return (
    <div>
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={300} colors={[C.gold, C.teal, C.success, "#fff"]} />}

      {/* Hero gauges */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1rem", alignItems: "center", marginBottom: "2rem" }}>
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>Required Nest Egg</div>
          <GaugeArc value={Math.min(requiredNestEgg, 5e6)} max={5e6} color={C.warning} size={160} label={fmt(requiredNestEgg)} />
        </div>

        <div style={{ textAlign: "center", padding: "0 1rem" }}>
          {onTrack ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
              <div style={{ fontSize: 20, color: C.success, marginBottom: 8 }}>✓</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.success }}>ON TRACK</div>
            </motion.div>
          ) : (
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>GAP</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 900, fontFamily: "monospace", color: gap > 500000 ? C.danger : C.warning }}>{fmt(gap)}</div>
            </motion.div>
          )}
        </div>

        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>Projected Nest Egg</div>
          <GaugeArc value={Math.min(projectedNestEgg, 5e6)} max={5e6} color={onTrack ? C.success : C.teal} size={160} label={fmt(projectedNestEgg)} />
        </div>
      </div>

      {/* Projection chart */}
      <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
        <SectionLabel>Portfolio Projection to Retirement</SectionLabel>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={projData}>
            <defs>
              <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={onTrack ? C.success : C.teal} stopOpacity={0.3} />
                <stop offset="95%" stopColor={onTrack ? C.success : C.teal} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="year" stroke={C.textMuted} tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={v => fmt(v)} stroke={C.textMuted} tick={{ fontSize: 10 }} width={60} />
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }} />
            <Area type="monotone" dataKey="projected" stroke={onTrack ? C.success : C.teal} fill="url(#projGrad)" strokeWidth={2} name="Projected" isAnimationActive />
            <Line type="monotone" dataKey="required" stroke={C.gold} strokeWidth={2} strokeDasharray="6 3" dot={false} name="Target" isAnimationActive />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Action metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
        <MetricCard label="Annual Income Gap" value={fmt(annualGap)} color={annualGap > 0 ? C.warning : C.success} icon={DollarSign} />
        <MetricCard label="Additional Monthly Savings" value={additionalMonthlySavings > 0 ? fmtM(Math.round(additionalMonthlySavings)) : "None needed"} color={additionalMonthlySavings > 0 ? C.warning : C.success} icon={Target} />
        <MetricCard label="Years to Grow" value={`${yearsUntil} yrs`} color={C.teal} icon={Clock} />
      </div>

      {onTrack && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...cardStyle, marginTop: "1rem", border: `1px solid ${C.success}40`, background: "rgba(16,185,129,0.05)", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: C.success, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Award size={13} /> You are on track for retirement. Keep it up.</div>
        </motion.div>
      )}

      <ModuleNav onNext={onNext} onPrev={onPrev} />
    </div>
  );
}

/* ─── MODULE 6: Allocation ────────────────────────────────────────────── */
const ALLOC_MODELS = [
  { id: "conservative", label: "Conservative", stocks: 30, bonds: 50, cash: 20, color: C.teal },
  { id: "moderate", label: "Moderate", stocks: 50, bonds: 40, cash: 10, color: C.gold },
  { id: "growth", label: "Growth", stocks: 70, bonds: 25, cash: 5, color: C.indigo },
  { id: "aggressive", label: "Aggressive", stocks: 85, bonds: 12, cash: 3, color: C.danger },
  { id: "custom", label: "Custom", stocks: null, bonds: null, cash: null, color: C.textSec },
];

function ModuleAllocation({ plan, update, onNext, onPrev }) {
  const selectedModel = plan.allocModel || "moderate";
  const model = ALLOC_MODELS.find(m => m.id === selectedModel) || ALLOC_MODELS[1];
  const stocks = plan.customStocks ?? model.stocks ?? 60;
  const bonds = plan.customBonds ?? model.bonds ?? 30;
  const cashPct = Math.max(0, 100 - stocks - bonds);

  const allocData = [
    { name: "Stocks/Equity", value: stocks, color: C.gold },
    { name: "Bonds/Fixed Income", value: bonds, color: C.teal },
    { name: "Cash/Alt", value: cashPct, color: C.textMuted },
  ].filter(d => d.value > 0);

  const bucketData = [
    { name: "Bucket 1\n0–2yr Cash", value: cashPct, fill: C.teal },
    { name: "Bucket 2\n3–7yr Income", value: bonds, fill: C.gold },
    { name: "Bucket 3\n8+yr Growth", value: stocks, fill: C.success },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div>
          <SectionLabel>Allocation Model</SectionLabel>
          {ALLOC_MODELS.map(m => (
            <button key={m.id} onClick={() => { update({ allocModel: m.id, customStocks: undefined, customBonds: undefined }); }} style={{ width: "100%", padding: "0.75rem 1rem", marginBottom: "0.5rem", borderRadius: 10, border: `1px solid ${selectedModel === m.id ? m.color : C.border}`, background: selectedModel === m.id ? `${m.color}15` : C.elevated, color: selectedModel === m.id ? m.color : C.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all 0.2s", display: "flex", justifyContent: "space-between" }}>
              <span>{m.label}</span>
              {m.stocks !== null && <span style={{ fontFamily: "monospace", fontSize: 11, opacity: 0.7 }}>{m.stocks}% / {m.bonds}% / {100 - m.stocks - m.bonds}%</span>}
            </button>
          ))}

          {selectedModel === "custom" && (
            <div style={{ ...cardStyle, marginTop: "0.5rem" }}>
              <GoldSlider value={stocks} min={0} max={100} onChange={v => update({ customStocks: v })} label="Stocks %" format={v => `${v}%`} />
              <GoldSlider value={bonds} min={0} max={100 - stocks} onChange={v => update({ customBonds: v })} label="Bonds %" format={v => `${v}%`} />
              <div style={{ fontSize: 11, color: C.textMuted }}>Cash/Other: {cashPct}%</div>
            </div>
          )}
        </div>

        <div>
          <SectionLabel>Portfolio Snapshot</SectionLabel>
          <div style={{ ...cardStyle, marginBottom: "1rem" }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={allocData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" isAnimationActive>
                  {allocData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <SectionLabel>Bucket Strategy</SectionLabel>
          <div style={{ display: "flex", gap: "0.75rem", height: 140, alignItems: "flex-end" }}>
            {bucketData.map(b => (
              <div key={b.name} style={{ flex: 1, textAlign: "center" }}>
                <motion.div initial={{ height: 0 }} animate={{ height: `${(b.value / 100) * 120}px` }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ background: b.fill, borderRadius: "6px 6px 0 0", minHeight: 10, opacity: 0.85 }} />
                <div style={{ fontSize: 9, color: C.textMuted, marginTop: 4, whiteSpace: "pre-line", lineHeight: 1.3 }}>{b.name}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: b.fill, fontFamily: "monospace" }}>{b.value}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ModuleNav onNext={onNext} onPrev={onPrev} />
    </div>
  );
}

/* ─── MODULE 7: Tax Strategy ──────────────────────────────────────────── */
function ModuleTax({ plan, update, onNext, onPrev }) {
  const traditional = (plan.k401Balance || 0) + (plan.iraBalance || 0);
  const taxFree = plan.rothBalance || 0;
  const taxable = plan.taxableBrokerage || 0;
  const hsa = plan.hsaBalance || 0;
  const total = traditional + taxFree + taxable + hsa;

  const taxData = [
    { name: "Tax-Deferred", value: traditional, color: C.warning },
    { name: "Tax-Free (Roth)", value: taxFree, color: C.success },
    { name: "Taxable", value: taxable, color: C.teal },
    { name: "HSA", value: hsa, color: C.indigo },
  ].filter(d => d.value > 0);

  const rothRatio = total > 0 ? (taxFree / total) * 100 : 0;
  const showRothOpportunity = traditional > 200000 && rothRatio < 30;

  const rmdAge = 73;
  const curAge = plan.currentAge || 40;
  const rmdData = [73, 75, 78, 80, 85].map(age => ({
    age: `Age ${age}`,
    rmd: Math.round(traditional * Math.pow(1.06, age - curAge) / (90 - age)),
  }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div>
          <SectionLabel>Tax Bucket Analysis</SectionLabel>
          <div style={{ ...cardStyle, marginBottom: "1rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: C.textMuted }}>Tax-Deferred (Traditional)</span>
                <span style={{ color: C.warning, fontFamily: "monospace" }}>{fmt(traditional)}</span>
              </div>
              <div style={{ height: 8, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${total > 0 ? (traditional / total) * 100 : 0}%` }} transition={{ duration: 1 }} style={{ height: "100%", background: C.warning, borderRadius: 99 }} />
              </div>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: C.textMuted }}>Tax-Free (Roth)</span>
                <span style={{ color: C.success, fontFamily: "monospace" }}>{fmt(taxFree)}</span>
              </div>
              <div style={{ height: 8, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${total > 0 ? (taxFree / total) * 100 : 0}%` }} transition={{ duration: 1 }} style={{ height: "100%", background: C.success, borderRadius: 99 }} />
              </div>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: C.textMuted }}>Taxable Brokerage</span>
                <span style={{ color: C.teal, fontFamily: "monospace" }}>{fmt(taxable)}</span>
              </div>
              <div style={{ height: 8, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${total > 0 ? (taxable / total) * 100 : 0}%` }} transition={{ duration: 1 }} style={{ height: "100%", background: C.teal, borderRadius: 99 }} />
              </div>
            </div>
            <div style={{ fontFamily: "monospace" }}>
              <input type="number" value={plan.rothBalance || ""} onChange={e => update({ rothBalance: +e.target.value })} placeholder="Roth Balance" style={{ width: "100%", background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", color: C.text, fontSize: 12, outline: "none", marginBottom: "0.5rem", boxSizing: "border-box" }} />
              <input type="number" value={plan.hsaBalance || ""} onChange={e => update({ hsaBalance: +e.target.value })} placeholder="HSA Balance" style={{ width: "100%", background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", color: C.text, fontSize: 12, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          {showRothOpportunity && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ ...cardStyle, border: `1px solid ${C.gold}50`, background: C.goldDim, padding: "1rem" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><Zap size={12} /> Roth Conversion Opportunity</div>
              <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.6 }}>
                Your tax-deferred balance is high relative to Roth. Consider converting to Roth before RMDs begin at age {rmdAge} to reduce future tax burden.
              </div>
            </motion.div>
          )}
        </div>

        <div>
          <SectionLabel>Optimal Withdrawal Order</SectionLabel>
          <div style={{ ...cardStyle, marginBottom: "1rem" }}>
            {[{ label: "1st — Taxable Brokerage", color: C.teal, desc: "Take capital gains at lower rates" }, { label: "2nd — Traditional IRA / 401k", color: C.warning, desc: "Ordinary income, manage tax brackets" }, { label: "3rd — Roth IRA / Roth 401k", color: C.success, desc: "Last resort — let tax-free growth compound" }].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "0.875rem" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${step.color}20`, border: `1px solid ${step.color}50`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 700, color: step.color }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{step.label}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <SectionLabel>RMD Timeline (Starting Age {rmdAge})</SectionLabel>
          <div style={{ ...cardStyle }}>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={rmdData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="age" stroke={C.textMuted} tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => fmt(v)} stroke={C.textMuted} tick={{ fontSize: 10 }} width={55} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="rmd" fill={C.warning} radius={[4, 4, 0, 0]} isAnimationActive />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <ModuleNav onNext={onNext} onPrev={onPrev} />
    </div>
  );
}

/* ─── MODULE 8: AI Advisor ────────────────────────────────────────────── */
function ModuleAI({ plan, update, onNext, onPrev }) {
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState(plan.aiRecs || null);
  const [err, setErr] = useState(null);

  const generateRecs = useCallback(async () => {
    setLoading(true); setErr(null);
    const retireAge = plan.retireAge || 65;
    const curAge = plan.currentAge || 40;
    const netWorth = (plan.k401Balance || 0) + (plan.iraBalance || 0) + (plan.taxableBrokerage || 0) + (plan.cashSavings || 0) - (plan.totalDebt || 0);
    const spends = plan.retireSpending || {};
    const monthlySpend = Object.values(spends).reduce((s, v) => s + v, 0) || 5000;

    const prompt = `You are a senior CFP at JP Morgan Private Bank with 25 years experience. Based on this client's retirement data, provide specific actionable recommendations.

Client Profile:
- Current age: ${curAge}, Target retirement: ${retireAge}
- Annual income: $${(plan.annualIncome || 0).toLocaleString()}
- Annual savings: $${(plan.annualSavings || 0).toLocaleString()}
- 401k balance: $${(plan.k401Balance || 0).toLocaleString()}
- IRA balance: $${(plan.iraBalance || 0).toLocaleString()}
- Roth balance: $${(plan.rothBalance || 0).toLocaleString()}
- Taxable brokerage: $${(plan.taxableBrokerage || 0).toLocaleString()}
- Net worth: $${netWorth.toLocaleString()}
- Monthly retirement spending goal: $${Math.round(monthlySpend).toLocaleString()}
- Lifestyle goal: ${plan.lifestyle || "comfortable"}
- SS claim age: ${plan.ssClaimAge || 67}
- Biggest worry: ${plan.biggestWorry || "running out of money"}
- Allocation model: ${plan.allocModel || "moderate"}

Return ONLY valid JSON: {"immediate":["...","..."],"twelveMonth":["...","..."],"fiveYear":["...","..."],"retireYear":["...","..."]}
Maximum 4 items per category. Be specific with dollar amounts and percentages. Be warm but direct.`;

    try {
      const res = await fetch("http://localhost:3001/api/planora-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, mode: "advisor" }),
      });
      const data = await res.json();
      const text = data.reply || data.message || data.content || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setRecs(parsed);
        update({ aiRecs: parsed });
      } else {
        throw new Error("Could not parse recommendations");
      }
    } catch (e) {
      setErr("Could not connect to AI advisor. Showing default recommendations.");
      const fallback = {
        immediate: [
          `Increase your 401k contribution to at least $${Math.round((plan.annualIncome || 80000) * 0.15 / 1000)}K/year to maximize employer match`,
          `Build a 6-month emergency fund of ${fmt((plan.monthlyExpenses || 4500) * 6)} before aggressive investing`,
          "Review your beneficiary designations across all accounts — this often gets overlooked",
          `Open a Roth IRA if your income qualifies — contribution limit is $7,000/year for ${curAge < 50 ? "your age" : "those 50+"}`,
        ],
        twelveMonth: [
          `Automate $${Math.round((plan.annualSavings || 0) / 12).toLocaleString()}/month transfers to your investment accounts`,
          "Schedule a Social Security benefits review at ssa.gov to verify your earnings record",
          "Review your insurance coverage — ensure your life insurance equals 10–12x your income",
          "Consult a CPA about Roth conversion opportunities given your current tax bracket",
        ],
        fiveYear: [
          `Target retirement account balance of ${fmt((plan.annualIncome || 80000) * 3)} by age ${curAge + 5}`,
          `Pay down high-interest debt — prioritize anything above 6% interest rate`,
          "Consider maximizing HSA contributions — triple tax advantage for healthcare costs",
          "Diversify into international equity exposure — target 20–30% of stock allocation",
        ],
        retireYear: [
          `Review Social Security claiming strategy — claiming at 70 gives ${fmt((plan.ssMonthly || 2000) * 0.24 * 12)}/year more than at 62`,
          "Convert to a retirement income portfolio — reduce equity to match your allocation model",
          "Establish a healthcare bridge plan if retiring before Medicare eligibility at 65",
          "Work with an estate attorney to update your will, trusts, and power of attorney",
        ],
      };
      setRecs(fallback);
      update({ aiRecs: fallback });
    }
    setLoading(false);
  }, [plan, update]);

  const CATEGORIES = [
    { key: "immediate", label: "Immediate Actions", color: C.danger },
    { key: "twelveMonth", label: "12-Month Plan", color: C.warning },
    { key: "fiveYear", label: "5-Year Goals", color: C.teal },
    { key: "retireYear", label: "At Retirement", color: C.gold },
  ];

  return (
    <div>
      {!recs && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <Brain size={40} color={C.gold} style={{ marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: C.text, marginBottom: "0.75rem" }}>Your Personal AI Advisor</h2>
          <p style={{ fontSize: 13, color: C.textMuted, marginBottom: "2rem", lineHeight: 1.7, maxWidth: 400, margin: "0 auto 2rem" }}>
            Based on everything you've entered, your AI advisor will generate specific, numbered recommendations tailored to your retirement plan.
          </p>
          <motion.button onClick={generateRecs} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ background: C.gold, border: "none", borderRadius: 12, padding: "0.875rem 2.5rem", color: C.bg, fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: `0 0 30px ${C.gold}40` }}>
            Generate My Recommendations →
          </motion.button>
        </motion.div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.gold, margin: "0 4px", animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
          <div style={{ fontSize: 13, color: C.textMuted }}>Your advisor is reviewing your plan…</div>
          <style>{`@keyframes dotBounce { 0%,60%,100%{transform:translateY(0);opacity:0.4;} 30%{transform:translateY(-12px);opacity:1;} }`}</style>
        </div>
      )}

      {err && <div style={{ fontSize: 11, color: C.warning, textAlign: "center", marginBottom: "1rem" }}>{err}</div>}

      {recs && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            {CATEGORIES.map(cat => (
              <div key={cat.key} style={{ ...cardStyle, border: `1px solid ${cat.color}30` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: cat.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.875rem" }}>{cat.label}</div>
                {(recs[cat.key] || []).map((rec, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} style={{ display: "flex", gap: "0.625rem", marginBottom: "0.625rem", alignItems: "flex-start" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${cat.color}20`, border: `1px solid ${cat.color}50`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: cat.color, marginTop: 1 }}>{i + 1}</div>
                    <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>{rec}</div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={generateRecs} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 16px", color: C.textMuted, fontSize: 11, cursor: "pointer" }}>
              <RefreshCw size={12} style={{ marginRight: 4 }} /> Regenerate
            </button>
          </div>
        </div>
      )}

      <ModuleNav onNext={onNext} onPrev={onPrev} />
    </div>
  );
}

/* ─── MODULE 9: Final Dashboard ───────────────────────────────────────── */
function ModuleDashboard({ plan, onRestart }) {
  const retireAge = plan.retireAge || 65;
  const curAge = plan.currentAge || 40;
  const lifeExp = plan.lifeExp || 88;
  const yearsUntil = Math.max(0, retireAge - curAge);

  const retireAssets = (plan.k401Balance || 0) + (plan.iraBalance || 0) + (plan.taxableBrokerage || 0);
  const spends = plan.retireSpending || {};
  const monthlySpend = Object.values(spends).reduce((s, v) => s + v, 0) || 5000;
  const inflatedMonthly = monthlySpend * Math.pow(1 + (plan.inflation || 2.5) / 100, yearsUntil);
  const annualNeed = inflatedMonthly * 12;
  const requiredNestEgg = annualNeed * 25;

  const projectedNestEgg = retireAssets * Math.pow(1.07, yearsUntil) +
    (plan.annualSavings || 0) * ((Math.pow(1.07, yearsUntil) - 1) / 0.07);

  const onTrack = projectedNestEgg >= requiredNestEgg;
  const coveragePct = requiredNestEgg > 0 ? Math.min(100, Math.round((projectedNestEgg / requiredNestEgg) * 100)) : 0;
  const readiness = Math.min(100, Math.round(coveragePct * 0.7 + ((plan.annualSavings || 0) / (plan.annualIncome || 1) * 100) * 1.5));

  const scoreLabel = readiness >= 80 ? "Strong" : readiness >= 60 ? "On Track" : readiness >= 40 ? "Needs Attention" : "Action Required";
  const scoreColor = readiness >= 80 ? C.success : readiness >= 60 ? C.gold : readiness >= 40 ? C.warning : C.danger;

  const lifestyle = LIFESTYLES.find(l => l.id === plan.lifestyle);

  // Longevity chart
  const longevityData = [];
  let bal = projectedNestEgg;
  const annualWithdraw = annualNeed;
  const annualReturn = 0.06;
  for (let age = retireAge; age <= 100; age++) {
    bal = bal * (1 + annualReturn) - annualWithdraw;
    longevityData.push({ age, balance: Math.max(0, Math.round(bal)) });
    if (bal <= 0 && longevityData.length > 1) break;
  }
  const depletionAge = longevityData.find(d => d.balance === 0)?.age;

  return (
    <div>
      {/* Hero readiness score */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ ...cardStyle, textAlign: "center", marginBottom: "1.5rem", border: `1px solid ${scoreColor}30`, background: `${scoreColor}06` }}>
        <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1rem" }}>Retirement Readiness Score</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
          <GaugeArc value={readiness} max={100} color={scoreColor} size={180} label={`${readiness}`} sublabel="/ 100" />
        </div>
        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: scoreColor }}>{scoreLabel}</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
          {lifestyle ? `${lifestyle.label} retirement · Age ${retireAge}` : `Target retirement age ${retireAge}`}
        </div>
      </motion.div>

      {/* Key metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <MetricCard label="Required Nest Egg" value={fmt(requiredNestEgg)} color={C.warning} icon={Target} />
        <MetricCard label="Projected Nest Egg" value={fmt(projectedNestEgg)} color={onTrack ? C.success : C.teal} icon={TrendingUp} />
        <MetricCard label="Coverage Ratio" value={`${coveragePct}%`} color={coveragePct >= 100 ? C.success : C.warning} icon={Shield} />
        <MetricCard label="Years to Retirement" value={`${yearsUntil} yrs`} color={C.teal} icon={Clock} />
        <MetricCard label="Annual Income Goal" value={fmt(annualNeed)} color={C.gold} icon={DollarSign} />
        <MetricCard label={depletionAge ? "Portfolio Lasts To" : "Portfolio Lasts"} value={depletionAge ? `Age ${depletionAge}` : `100+`} color={depletionAge && depletionAge < lifeExp ? C.danger : C.success} icon={BarChart2} />
      </div>

      {/* Portfolio longevity chart */}
      <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
        <SectionLabel>Portfolio Longevity Through Retirement</SectionLabel>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={longevityData}>
            <defs>
              <linearGradient id="longevityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={onTrack ? C.success : C.teal} stopOpacity={0.3} />
                <stop offset="95%" stopColor={onTrack ? C.success : C.teal} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="age" stroke={C.textMuted} tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={v => fmt(v)} stroke={C.textMuted} tick={{ fontSize: 10 }} width={60} />
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }} />
            <ReferenceLine x={lifeExp} stroke={C.gold} strokeDasharray="4 4" label={{ value: `Life exp ${lifeExp}`, fill: C.gold, fontSize: 10 }} />
            <Area type="monotone" dataKey="balance" stroke={onTrack ? C.success : C.teal} fill="url(#longevityGrad)" strokeWidth={2} name="Portfolio Balance" isAnimationActive />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Action plan */}
      {plan.aiRecs && (
        <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
          <SectionLabel>Your Action Plan</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
            {[{ key: "immediate", label: "Do Now", color: C.danger }, { key: "twelveMonth", label: "Next 12 Months", color: C.warning }].map(cat => (
              <div key={cat.key}>
                <div style={{ fontSize: 10, color: cat.color, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>{cat.label}</div>
                {(plan.aiRecs[cat.key] || []).slice(0, 3).map((rec, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: "0.5rem", alignItems: "flex-start" }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, border: `1px solid ${cat.color}50`, flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.5 }}>{rec}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download + restart */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
        <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, background: C.gold, border: "none", borderRadius: 10, padding: "0.75rem 1.5rem", color: C.bg, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Download size={14} /> Download Report
        </button>
        <button onClick={onRestart} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.75rem 1.5rem", color: C.textMuted, fontSize: 13, cursor: "pointer" }}>
          Restart Plan
        </button>
      </div>
    </div>
  );
}

/* ─── Module Nav buttons ──────────────────────────────────────────────── */
function ModuleNav({ onNext, onPrev }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", paddingTop: "1.25rem", borderTop: `1px solid ${C.border}` }}>
      <button onClick={onPrev} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 18px", color: C.textMuted, fontSize: 13, cursor: "pointer" }}>
        <ChevronLeft size={14} /> Back
      </button>
      <button onClick={onNext} style={{ display: "flex", alignItems: "center", gap: 6, background: C.gold, border: "none", borderRadius: 8, padding: "8px 20px", color: C.bg, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
        Continue <ChevronRight size={14} />
      </button>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────── */
export default function RetirementPlanning() {
  const [bootDone, setBootDone] = useState(() => !!sessionStorage.getItem("rp_boot_done"));
  const [plan, setPlan] = useLS("rp_plan", {});
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("rp_completed") || "[]"); } catch { return []; }
  });

  // Import on first load
  useEffect(() => {
    if (!plan.imported_at) {
      const imported = importExistingData();
      setPlan(prev => ({ ...prev, ...imported, imported_at: Date.now() }));
    }
  }, []);

  const importedFlags = useMemo(() => {
    try { const r = localStorage.getItem("rp_plan"); return r ? JSON.parse(r).imported || {} : {}; } catch { return {}; }
  }, []);

  const update = useCallback((patch) => {
    setPlan(prev => ({ ...prev, ...patch }));
  }, [setPlan]);

  const handleNext = useCallback(() => {
    const modId = MODULES[step]?.id;
    if (modId && !completed.includes(modId)) {
      const next = [...completed, modId];
      setCompleted(next);
      sessionStorage.setItem("rp_completed", JSON.stringify(next));
    }
    setStep(s => Math.min(s + 1, MODULES.length - 1));
  }, [step, completed]);

  const handlePrev = useCallback(() => setStep(s => Math.max(s - 1, 0)), []);
  const handleJump = useCallback((i) => setStep(i), []);

  const handleBootDone = useCallback(() => {
    sessionStorage.setItem("rp_boot_done", "1");
    setBootDone(true);
  }, []);

  const handleRestart = useCallback(() => {
    setStep(0);
    setCompleted([]);
    sessionStorage.removeItem("rp_completed");
  }, []);

  const currentMod = MODULES[step];

  const PANELS = {
    vision:     <ModuleVision     plan={plan} update={update} onNext={handleNext} imported={importedFlags} />,
    snapshot:   <ModuleSnapshot   plan={plan} update={update} onNext={handleNext} onPrev={handlePrev} imported={importedFlags} />,
    spending:   <ModuleSpending   plan={plan} update={update} onNext={handleNext} onPrev={handlePrev} />,
    income:     <ModuleIncome     plan={plan} update={update} onNext={handleNext} onPrev={handlePrev} />,
    gap:        <ModuleGap        plan={plan} update={update} onNext={handleNext} onPrev={handlePrev} />,
    allocation: <ModuleAllocation plan={plan} update={update} onNext={handleNext} onPrev={handlePrev} />,
    tax:        <ModuleTax        plan={plan} update={update} onNext={handleNext} onPrev={handlePrev} />,
    ai:         <ModuleAI         plan={plan} update={update} onNext={handleNext} onPrev={handlePrev} />,
    dashboard:  <ModuleDashboard  plan={plan} onRestart={handleRestart} />,
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif", color: C.text }}>
      <AnimatePresence>
        {!bootDone && <BootSequence onDone={handleBootDone} />}
      </AnimatePresence>

      {bootDone && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.25rem 3rem" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", paddingTop: "0.5rem" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text-1)", fontFamily: "'Inter', system-ui, sans-serif" }}>
                RETIREMENT{" "}
                <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: C.gold, fontWeight: 400, fontSize: "1.5rem" }}>Planning</em>
              </h1>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Institutional-grade retirement intelligence · Personal impact</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", background: C.goldDim, border: `1px solid ${C.gold}40`, borderRadius: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.1em" }}>AUTO-SAVED</span>
            </div>
          </div>

          {/* Data Connection Banner */}
          {(importedFlags.income || importedFlags.assets) && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              background: `${C.goldDim}`,
              border: `1px solid ${C.gold}28`,
              borderRadius: 12, padding: "11px 15px", marginBottom: 18,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${C.gold}18`, border: `1px solid ${C.gold}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <Link2 size={12} color={C.gold} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: "'Inter', system-ui, sans-serif", marginBottom: 5 }}>
                  Data auto-imported from connected sections
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {importedFlags.income  && <span style={{ padding: "2px 8px", background: `${C.gold}12`, border: `1px solid ${C.gold}28`, borderRadius: 5, fontSize: 10, color: C.gold, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600 }}>Budget Planner · Income</span>}
                  {importedFlags.assets  && <span style={{ padding: "2px 8px", background: `${C.gold}12`, border: `1px solid ${C.gold}28`, borderRadius: 5, fontSize: 10, color: C.gold, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600 }}>Net Worth Tracker · Assets</span>}
                  {importedFlags.age     && <span style={{ padding: "2px 8px", background: `${C.gold}12`, border: `1px solid ${C.gold}28`, borderRadius: 5, fontSize: 10, color: C.gold, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600 }}>Budget Planner · Age</span>}
                  {importedFlags.insurance && <span style={{ padding: "2px 8px", background: `${C.gold}12`, border: `1px solid ${C.gold}28`, borderRadius: 5, fontSize: 10, color: C.gold, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600 }}>Life Insurance · Coverage</span>}
                  {importedFlags.risk    && <span style={{ padding: "2px 8px", background: `${C.gold}12`, border: `1px solid ${C.gold}28`, borderRadius: 5, fontSize: 10, color: C.gold, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600 }}>Risk Analysis · Profile</span>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4a7c59" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#4a7c59", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Inter', system-ui, sans-serif" }}>Synced</span>
              </div>
            </div>
          )}

          {/* Progress timeline */}
          <ProgressTimeline current={step} completed={completed} onJump={handleJump} />

          {/* Module header */}
          <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
              Step {step + 1} of {MODULES.length}
            </div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: C.text, letterSpacing: "-0.01em" }}>
              {currentMod?.title}
            </h2>
          </motion.div>

          {/* Module content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {PANELS[currentMod?.id]}
            </motion.div>
          </AnimatePresence>

          {/* Disclaimer */}
          <div style={{ marginTop: "2.5rem", fontSize: 10, color: C.textMuted, textAlign: "center", lineHeight: 1.7, borderTop: `1px solid ${C.border}`, paddingTop: "1.25rem" }}>
            Projections are estimates for planning purposes only. Review with a licensed CFP, CPA, and estate attorney before making decisions.<br />
            Not financial, investment, tax, or legal advice. All figures subject to change with market conditions.
          </div>
        </div>
      )}
    </div>
  );
}
