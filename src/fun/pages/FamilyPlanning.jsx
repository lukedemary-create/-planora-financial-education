import React, { useState } from "react";
import { Baby, GraduationCap, Heart, Calculator, CheckCircle2 } from "lucide-react";

/* ─── Design Tokens (FUN / Arche warm-dark) ─────────────────────── */
const C = {
  bg:        '#1a1410',
  surface:   '#231c16',
  raised:    '#2d2419',
  b1:        '#2a2018',
  b2:        '#3d3028',
  t1:        '#f0e8d8',
  t2:        '#a89070',
  t3:        '#6b5540',
  gold:      '#c9a96e',
  goldDim:   'rgba(201,169,110,0.10)',
  goldBdr:   'rgba(201,169,110,0.22)',
  teal:      '#00B4C6',
  tealDim:   'rgba(0,180,198,0.10)',
  tealBdr:   'rgba(0,180,198,0.22)',
  indigo:    '#818cf8',
  indigoDim: 'rgba(129,140,248,0.10)',
  indigoBdr: 'rgba(129,140,248,0.22)',
  up:        '#4a7c59',
  upDim:     'rgba(74,124,89,0.12)',
  upBdr:     'rgba(74,124,89,0.22)',
  down:      '#c0392b',
  downDim:   'rgba(192,57,43,0.12)',
};

const DISPLAY = "'Playfair Display', Georgia, serif";
const UI      = "'Inter', system-ui, sans-serif";
const MONO    = "'JetBrains Mono', monospace";

/* ─── Helpers ───────────────────────────────────────────────────── */
const fmt  = n => "$" + Math.round(n || 0).toLocaleString();
const fmtM = n => "$" + Math.round(n || 0).toLocaleString() + "/mo";

function Slider({ label, value, min, max, step = 1, format, onChange, note }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: UI, fontSize: 12, color: C.t2 }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.indigo }}>{format ? format(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: C.indigo, cursor: "pointer" }} />
      {note && <div style={{ fontFamily: UI, fontSize: 10.5, color: C.t3, marginTop: 4, fontStyle: "italic" }}>{note}</div>}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.b1}`, borderRadius: 14, padding: "1.5rem", ...style }}>
      {children}
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h3 style={{ fontFamily: DISPLAY, fontSize: "1.125rem", fontWeight: 700, color: C.t1, margin: "0 0 0.875rem", letterSpacing: "-0.01em" }}>
      {children}
    </h3>
  );
}

function StatBadge({ label, value, sub, color = C.indigo, dim = C.indigoDim }) {
  return (
    <div style={{ background: dim, border: `1px solid ${color}33`, borderRadius: 10, padding: "0.875rem 1rem", textAlign: "center" }}>
      <div style={{ fontFamily: MONO, fontSize: "1.25rem", fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ fontFamily: MONO, fontSize: "0.75rem", color, marginBottom: 4 }}>{sub}</div>}
      <div style={{ fontFamily: UI, fontSize: "0.6875rem", color: C.t3, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
    </div>
  );
}

/* ─── Tab 1: Cost of Raising a Child ────────────────────────────── */
function CostCalculator() {
  const [income,    setIncome]    = useState(95000);
  const [location,  setLocation]  = useState("suburban");
  const [childcare, setChildcare] = useState(18000);
  const [kids,      setKids]      = useState(1);
  const [gender,    setGender]    = useState("both");

  const locationMult = { urban: 1.18, suburban: 1.0, rural: 0.82 }[location];
  const BASE_ANNUAL  = 16005 * locationMult;

  const PHASES = [
    {
      phase: "Infancy (0–2)", annual: BASE_ANNUAL * 1.3,
      items: [
        { label: "Childcare / Daycare",       cost: childcare },
        { label: "Diapers & Formula",         cost: 3200 },
        { label: "Healthcare & Pediatrician", cost: 2100 },
        { label: "Baby Gear (one-time)",      cost: 4500 },
        { label: "Clothing",                  cost: 800  },
        { label: "Food",                      cost: 1200 },
      ],
      genderDiff: { boy: 0, girl: 150 },
    },
    {
      phase: "Toddler (3–5)", annual: BASE_ANNUAL * 1.15,
      items: [
        { label: "Preschool / Pre-K", cost: 12000 },
        { label: "Healthcare",        cost: 1600  },
        { label: "Clothing",          cost: 900   },
        { label: "Activities & Toys", cost: 2400  },
        { label: "Food",              cost: 2200  },
      ],
      genderDiff: { boy: 200, girl: 400 },
    },
    {
      phase: "Elementary (6–11)", annual: BASE_ANNUAL * 1.0,
      items: [
        { label: "After-School Care / Activities", cost: 6000 },
        { label: "Healthcare",                     cost: 1400 },
        { label: "School Supplies & Fees",         cost: 1200 },
        { label: "Clothing",                       cost: 1100 },
        { label: "Sports / Extracurriculars",      cost: 3000 },
        { label: "Food",                           cost: 3600 },
      ],
      genderDiff: { boy: 400, girl: 600 },
    },
    {
      phase: "Middle School (12–14)", annual: BASE_ANNUAL * 1.1,
      items: [
        { label: "Extracurriculars / Travel Teams",  cost: 5000 },
        { label: "Healthcare",                       cost: 1800 },
        { label: "Clothing & Appearance",            cost: 1800 },
        { label: "Technology (phone, laptop)",       cost: 1500 },
        { label: "Food (teenagers eat a lot)",       cost: 5200 },
      ],
      genderDiff: { boy: 600, girl: 1200 },
    },
    {
      phase: "High School (15–17)", annual: BASE_ANNUAL * 1.25,
      items: [
        { label: "Car Insurance (teen)",        cost: 3600 },
        { label: "Clothing & Social",           cost: 2200 },
        { label: "Activities & College Prep",   cost: 4000 },
        { label: "Healthcare",                  cost: 2000 },
        { label: "Food & Entertainment",        cost: 6000 },
        { label: "SAT / ACT Prep",             cost: 1500 },
      ],
      genderDiff: { boy: 1200, girl: 800 },
    },
  ];

  const genderMult = gender === "boy" ? 0 : gender === "girl" ? 1 : 0.5;
  const totalByPhase = PHASES.map(p => {
    const gd    = p.genderDiff.boy * (1 - genderMult) + p.genderDiff.girl * genderMult;
    const years = p.phase.includes("Elementary") ? 6 : p.phase.includes("Middle") ? 3 : 3;
    return { phase: p.phase, annual: p.annual + gd, years };
  });
  const total18  = totalByPhase.reduce((s, p) => s + p.annual * p.years, 0) * kids;
  const perMonth = total18 / 18 / 12 * kids;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>
      <Card>
        <SectionHeading>Your Situation</SectionHeading>
        <Slider label="Annual Household Income" value={income} min={30000} max={400000} step={5000}
          format={v => "$" + (v / 1000).toFixed(0) + "K"} onChange={setIncome} />
        <Slider label="Number of Children" value={kids} min={1} max={5}
          format={v => v + (v === 1 ? " child" : " children")} onChange={setKids} />
        <Slider label="Annual Childcare / Daycare Cost" value={childcare} min={0} max={40000} step={500}
          format={v => "$" + (v / 1000).toFixed(1) + "K/yr"} onChange={setChildcare}
          note="National average: $16,000–$22,000/yr (varies widely by state)" />

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: UI, fontSize: 12, color: C.t2, marginBottom: 8 }}>Location Type</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["urban", "Urban"], ["suburban", "Suburban"], ["rural", "Rural"]].map(([v, l]) => (
              <button key={v} onClick={() => setLocation(v)} style={{
                flex: 1, padding: "7px 0", borderRadius: 8,
                border: `1px solid ${location === v ? C.indigo : C.b2}`,
                background: location === v ? C.indigoDim : "transparent",
                color: location === v ? C.indigo : C.t3,
                fontFamily: UI, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: UI, fontSize: 12, color: C.t2, marginBottom: 8 }}>Child Gender (affects some cost categories)</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["boy", "Boy"], ["girl", "Girl"], ["both", "Average"]].map(([v, l]) => (
              <button key={v} onClick={() => setGender(v)} style={{
                flex: 1, padding: "7px 0", borderRadius: 8,
                border: `1px solid ${gender === v ? C.teal : C.b2}`,
                background: gender === v ? C.tealDim : "transparent",
                color: gender === v ? C.teal : C.t3,
                fontFamily: UI, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>{l}</button>
            ))}
          </div>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: C.t3, marginTop: 6, fontStyle: "italic" }}>
            Girls tend to cost more in clothing and healthcare; boys in sports and food (teens)
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <StatBadge label="Total Birth–18" value={fmt(total18)} />
          <StatBadge label="Monthly Average" value={fmtM(perMonth)} color={C.teal} dim={C.tealDim} />
          <StatBadge label="% of Income" value={Math.round(perMonth * 12 / income * 100) + "%"} color={C.t2} dim="rgba(168,144,112,0.1)" />
        </div>

        <Card>
          <SectionHeading>Cost by Life Phase</SectionHeading>
          {totalByPhase.map(p => (
            <div key={p.phase} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: C.t1 }}>{p.phase}</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.indigo }}>{fmt(p.annual * p.years * kids)}</span>
                  <span style={{ fontFamily: UI, fontSize: 11, color: C.t3, marginLeft: 6 }}>total</span>
                </div>
              </div>
              <div style={{ height: 5, background: C.raised, borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${Math.min(100, p.annual / 30000 * 100)}%`, background: C.indigo, borderRadius: 3 }} />
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: C.t3, marginTop: 3 }}>{fmtM(p.annual * kids / 12)} per month avg</div>
            </div>
          ))}
        </Card>

        <div style={{ background: C.tealDim, border: `1px solid ${C.tealBdr}`, borderRadius: 12, padding: "1rem 1.25rem" }}>
          <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>Not included above</div>
          <div style={{ fontFamily: UI, fontSize: 12.5, color: C.t2, lineHeight: 1.65 }}>
            College costs ($120K–$320K+), lost income during parental leave, home upgrade for space, inheritance planning changes, and emotional labor costs.
            Adding college savings adds $300–$600/mo to this estimate.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab 2: College Savings (529) ──────────────────────────────── */
function CollegeSavings() {
  const [childAge,   setChildAge]   = useState(0);
  const [monthly,    setMonthly]    = useState(400);
  const [type,       setType]       = useState("public");
  const [returnRate, setReturnRate] = useState(7);
  const [existing,   setExisting]   = useState(0);

  const yearsToCollege = Math.max(1, 18 - childAge);
  const months         = yearsToCollege * 12;
  const mo             = returnRate / 100 / 12;

  const fvContributions = monthly * ((Math.pow(1 + mo, months) - 1) / mo);
  const fvExisting      = existing * Math.pow(1 + mo, months);
  const projected       = fvContributions + fvExisting;

  const costs  = { public: 115000, private: 240000, community: 40000 };
  const target = costs[type] * Math.pow(1.05, yearsToCollege);
  const gap    = Math.max(0, target - projected);
  const funded = Math.min(100, (projected / target) * 100);

  const neededMo = gap > 0 && months > 0
    ? gap / ((Math.pow(1 + mo, months) - 1) / mo)
    : 0;

  const SCHOOL_TYPES = [
    { id: "public",    label: "4-Yr Public",          cost: costs.public,    note: "In-state, includes room & board" },
    { id: "private",   label: "4-Yr Private",         cost: costs.private,   note: "Full cost of attendance, avg." },
    { id: "community", label: "Community + Transfer",  cost: costs.community, note: "2-yr then transfer to 4-yr" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>
      <Card>
        <SectionHeading>529 Plan Projection</SectionHeading>
        <Slider label="Child's Current Age"    value={childAge}   min={0}  max={17}    format={v => v === 0 ? "Newborn" : v + " yrs"} onChange={setChildAge} />
        <Slider label="Monthly Contribution"   value={monthly}    min={0}  max={2000}  step={25} format={fmtM} onChange={setMonthly} />
        <Slider label="Existing 529 Balance"   value={existing}   min={0}  max={200000} step={1000} format={fmt} onChange={setExisting} />
        <Slider label="Expected Annual Return" value={returnRate} min={3}  max={12}    step={0.5} format={v => v.toFixed(1) + "%"} onChange={setReturnRate}
          note="Age-based funds average ~7% when child is young, then de-risk" />

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: UI, fontSize: 12, color: C.t2, marginBottom: 8 }}>School Type</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SCHOOL_TYPES.map(s => (
              <button key={s.id} onClick={() => setType(s.id)} style={{
                padding: "10px 14px", borderRadius: 9,
                border: `1px solid ${type === s.id ? C.indigo : C.b2}`,
                background: type === s.id ? C.indigoDim : "transparent",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer", textAlign: "left",
              }}>
                <div>
                  <div style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: type === s.id ? C.indigo : C.t1 }}>{s.label}</div>
                  <div style={{ fontFamily: UI, fontSize: 11, color: C.t3 }}>{s.note}</div>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 12, color: type === s.id ? C.indigo : C.t3, fontWeight: 700 }}>{fmt(s.cost)}/yr</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: UI, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: C.t3, marginBottom: 8 }}>Projected 529 Balance at Age 18</div>
            <div style={{ fontFamily: DISPLAY, fontSize: "2.5rem", fontWeight: 700, color: C.indigo, letterSpacing: "-0.02em" }}>{fmt(projected)}</div>
            <div style={{ fontFamily: UI, fontSize: 12.5, color: C.t2, marginTop: 6 }}>
              in {yearsToCollege} year{yearsToCollege !== 1 ? "s" : ""} · at {returnRate}% avg annual return
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: UI, fontSize: 12, color: C.t2 }}>Funding progress</span>
              <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: funded >= 80 ? C.up : funded >= 50 ? C.gold : C.down }}>{funded.toFixed(0)}%</span>
            </div>
            <div style={{ height: 8, background: C.raised, borderRadius: 4 }}>
              <div style={{ height: "100%", width: `${funded}%`, background: funded >= 80 ? C.up : funded >= 50 ? C.gold : C.down, borderRadius: 4, transition: "width 0.4s" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: C.raised, borderRadius: 10, padding: "0.875rem" }}>
              <div style={{ fontFamily: UI, fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Target Cost (inflated)</div>
              <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.t1 }}>{fmt(target)}</div>
            </div>
            <div style={{ background: gap > 0 ? C.downDim : C.upDim, borderRadius: 10, padding: "0.875rem", border: `1px solid ${gap > 0 ? C.down : C.up}33` }}>
              <div style={{ fontFamily: UI, fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{gap > 0 ? "Funding Gap" : "Surplus"}</div>
              <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: gap > 0 ? C.down : C.up }}>{fmt(Math.abs(gap))}</div>
            </div>
          </div>

          {gap > 0 && (
            <div style={{ background: C.indigoDim, border: `1px solid ${C.indigoBdr}`, borderRadius: 10, padding: "0.875rem" }}>
              <div style={{ fontFamily: UI, fontSize: 12, color: C.t2 }}>
                To fully fund: add <span style={{ color: C.indigo, fontWeight: 700 }}>{fmtM(neededMo)}</span> more per month,
                or a lump sum of <span style={{ color: C.indigo, fontWeight: 700 }}>{fmt(gap / Math.pow(1 + returnRate / 100, yearsToCollege))}</span> today.
              </div>
            </div>
          )}
        </Card>

        <Card>
          <SectionHeading>Why a 529 Beats a Regular Savings Account</SectionHeading>
          {[
            { label: "Tax-free growth",      desc: "Contributions grow tax-deferred; qualified withdrawals (tuition, fees, room & board) are 100% tax-free." },
            { label: "State tax deduction",  desc: "34 states offer deductions or credits for 529 contributions — free money on top of the growth." },
            { label: "Flexible use",         desc: "Covers K-12 tuition ($10K/yr), trade schools, community college, and student loan repayment ($10K lifetime)." },
            { label: "Transferable",         desc: "Unused funds can roll to a sibling, cousin, or yourself — or convert to a Roth IRA (up to $35K lifetime, 2024 rule)." },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
              <CheckCircle2 size={14} color={C.up} style={{ marginTop: 3, flexShrink: 0 }} />
              <div>
                <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: C.t1 }}>{r.label}: </span>
                <span style={{ fontFamily: UI, fontSize: 12.5, color: C.t2 }}>{r.desc}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ─── Tab 3: Budget Impact ──────────────────────────────────────── */
function BudgetImpact() {
  const [income,  setIncome]  = useState(95000);
  const [savings, setSavings] = useState(15);
  const [kids,    setKids]    = useState(1);
  const [ages,    setAges]    = useState("infant");

  const childcareMap  = { infant: 1600, toddler: 1200, school: 600,  teen: 200  };
  const foodMap       = { infant: 250,  toddler: 300,  school: 400,  teen: 600  };
  const clothingMap   = { infant: 80,   toddler: 90,   school: 110,  teen: 160  };
  const healthMap     = { infant: 180,  toddler: 130,  school: 110,  teen: 150  };
  const activitiesMap = { infant: 0,    toddler: 100,  school: 350,  teen: 500  };

  const perKid       = childcareMap[ages] + foodMap[ages] + clothingMap[ages] + healthMap[ages] + activitiesMap[ages];
  const totalKidCost = perKid * kids;
  const moIncome     = income / 12;
  const currentSavings  = moIncome * (savings / 100);
  const newSavings      = Math.max(0, currentSavings - totalKidCost);
  const newSavingsRate  = (newSavings / moIncome) * 100;

  const PHASES_INFO = [
    { id: "infant",  label: "Infant (0–2)",       note: "Childcare is the dominant cost"       },
    { id: "toddler", label: "Toddler / Preschool", note: "Preschool + growing activity costs"  },
    { id: "school",  label: "School Age (6–12)",   note: "After-school care + sports"           },
    { id: "teen",    label: "Teenager (13–18)",     note: "Car, food, and social costs spike"   },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>
      <Card>
        <SectionHeading>Your Financial Situation</SectionHeading>
        <Slider label="Annual Household Income"        value={income}  min={30000} max={400000} step={5000} format={v => "$" + (v / 1000).toFixed(0) + "K"} onChange={setIncome} />
        <Slider label="Current Monthly Savings Rate"  value={savings} min={0}     max={50}               format={v => v + "%"} onChange={setSavings} />
        <Slider label="Number of Children"            value={kids}    min={1}     max={5}                format={v => v + (v === 1 ? " child" : " children")} onChange={setKids} />

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: UI, fontSize: 12, color: C.t2, marginBottom: 8 }}>Child's Age Stage</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PHASES_INFO.map(p => (
              <button key={p.id} onClick={() => setAges(p.id)} style={{
                padding: "9px 14px", borderRadius: 8,
                border: `1px solid ${ages === p.id ? C.indigo : C.b2}`,
                background: ages === p.id ? C.indigoDim : "transparent",
                display: "flex", justifyContent: "space-between",
                cursor: "pointer", textAlign: "left",
              }}>
                <div>
                  <div style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: ages === p.id ? C.indigo : C.t1 }}>{p.label}</div>
                  <div style={{ fontFamily: UI, fontSize: 11, color: C.t3 }}>{p.note}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatBadge label="Monthly Kid Cost"  value={fmtM(totalKidCost)} />
          <StatBadge label="New Savings Rate"  value={newSavingsRate.toFixed(1) + "%"}
            color={newSavingsRate >= 10 ? C.up : newSavingsRate >= 5 ? C.gold : C.down}
            dim={newSavingsRate >= 10 ? C.upDim : C.indigoDim} />
        </div>

        <Card>
          <SectionHeading>Monthly Budget Before vs. After</SectionHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Monthly Take-Home (est.)", before: moIncome * 0.78, after: moIncome * 0.78 },
              { label: `Child Expenses (${kids} child${kids > 1 ? "ren" : ""})`, before: 0, after: -totalKidCost },
              { label: "Savings / Investing", before: currentSavings, after: newSavings },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.b1}`, gap: 8 }}>
                <span style={{ fontFamily: UI, fontSize: 12.5, color: C.t2 }}>{r.label}</span>
                <div style={{ display: "flex", gap: 20 }}>
                  <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.t3, textAlign: "right", minWidth: 80 }}>{r.before < 0 ? "-" : ""}{fmt(Math.abs(r.before))}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12.5, color: r.after < 0 ? C.down : C.indigo, fontWeight: 700, textAlign: "right", minWidth: 80 }}>{r.after < 0 ? "-" : ""}{fmt(Math.abs(r.after))}</span>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 6 }}>
              <span style={{ fontFamily: UI, fontSize: 11, color: C.t3 }}>Before → After children</span>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeading>Monthly Kid Cost Breakdown</SectionHeading>
          {[
            { label: "Childcare / After-School",       value: childcareMap[ages]  * kids },
            { label: "Food & Groceries",               value: foodMap[ages]       * kids },
            { label: "Clothing",                       value: clothingMap[ages]   * kids },
            { label: "Healthcare & Copays",            value: healthMap[ages]     * kids },
            { label: "Activities & Extracurriculars",  value: activitiesMap[ages] * kids },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.b1}` }}>
              <span style={{ fontFamily: UI, fontSize: 12.5, color: C.t2 }}>{r.label}</span>
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: C.t1 }}>{fmtM(r.value)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10 }}>
            <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: C.t1 }}>Monthly Total</span>
            <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.indigo }}>{fmtM(totalKidCost)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── Tab 4: Planning by Stage ──────────────────────────────────── */
function PlanningGuide() {
  const stages = [
    {
      phase: "Before You're Pregnant",
      color: C.teal, dim: C.tealDim, bdr: C.tealBdr,
      steps: [
        { label: "Build a 6-month emergency fund",    desc: "Before adding a child to the picture, you need financial stability. Parental leave, unexpected medical costs, and new one-time expenses demand a buffer." },
        { label: "Review your health insurance",      desc: "Understand your maternity/delivery deductible (average out-of-pocket: $4,000–$8,000). NICU costs can exceed $10,000/day without good coverage." },
        { label: "Max out tax-advantaged accounts",   desc: "Front-load retirement savings now. A child will likely reduce your savings rate for years. The earlier you compound, the less catching up you'll need." },
        { label: "Open a 529 before baby arrives",    desc: "Every year of compounding matters. A 529 opened at birth with $200/mo grows to ~$90K by college at 7%. Started at age 5, it grows to ~$55K." },
        { label: "Create or update your will",        desc: "Once you have a child, a will is not optional. Name a guardian explicitly — without one, the state decides." },
      ],
    },
    {
      phase: "0–3 Years (Infant & Toddler)",
      color: C.indigo, dim: C.indigoDim, bdr: C.indigoBdr,
      steps: [
        { label: "Childcare is your largest new expense",      desc: "Average infant daycare: $1,300–$2,200/mo. In high-cost cities (NYC, SF, Boston) expect $2,500–$4,000. Budget this before anything else." },
        { label: "Take full parental leave if available",      desc: "Many parents leave money on the table by returning early. Paid leave is deferred compensation — use it." },
        { label: "Add child to health insurance within 30 days", desc: "Missing the 30-day window after birth means waiting until open enrollment. Do this the week you come home from the hospital." },
        { label: "Increase life insurance now",                desc: "A term policy for both parents should cover 10–12× income. If you haven't calculated this, now is the time. Rates are cheapest before age 40." },
        { label: "Update beneficiary designations",            desc: "Your 401(k), IRA, and life insurance beneficiaries supersede your will. Update them to include a trust if your child is a minor." },
      ],
    },
    {
      phase: "4–12 Years (School Age)",
      color: C.gold, dim: C.goldDim, bdr: C.goldBdr,
      steps: [
        { label: "Establish a family budget with the new baseline", desc: "Activities, school supplies, and sports compound quickly. Budget annually for irregular expenses like gear, camps, and class trips." },
        { label: "Talk to your kids about money early",             desc: "Financial literacy correlates with better adult outcomes. A weekly allowance with a simple 3-jar system (spend, save, give) builds habits that last a lifetime." },
        { label: "Review 529 performance and contributions",        desc: "As college gets closer, gradually shift 529 allocations from growth to conservative. Most plans offer age-based funds that do this automatically." },
        { label: "UTMA/UGMA accounts for taxable investing",        desc: "Teach kids to invest with a custodial brokerage account. The first $1,300 in gains is tax-free; the next $1,300 taxed at the child's rate (often 0%)." },
        { label: "Begin estate plan updates as assets grow",        desc: "If your net worth has grown significantly, revisit your will, trusts, and guardian designations. Life changes fast between 30 and 45." },
      ],
    },
    {
      phase: "13–18 Years (Teen & College Prep)",
      color: C.up, dim: C.upDim, bdr: C.upBdr,
      steps: [
        { label: "College planning starts at 9th grade",    desc: "FAFSA financial aid calculations look at the prior-prior year tax return. Your income at 16 affects aid eligibility at 18. Plan accordingly." },
        { label: "Roth IRA for working teens",              desc: "If your teenager earns income (babysitting, part-time jobs), they can contribute to a Roth IRA — up to earned income or $7,000 (whichever is less). 50 years of compounding starts now." },
        { label: "Car costs are a significant budget item", desc: "Teen driver insurance adds $1,500–$4,000/yr to premiums. Include vehicle depreciation, gas, and maintenance. Total: $400–$700/mo per teen driver." },
        { label: "FAFSA strategy — reduce countable assets", desc: "529 plans owned by parents count at 5.64% against aid. Cash in savings counts at 20%. Roth IRA assets are not counted at all on the FAFSA." },
        { label: "Have the 'money conversation' before college", desc: "Spell out exactly what you will and won't pay for. Students with financial skin in the game graduate on time at higher rates." },
      ],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {stages.map(s => (
        <Card key={s.phase}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: s.dim, border: `1px solid ${s.bdr}`, borderRadius: 8, padding: "4px 12px", marginBottom: 14 }}>
            <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.phase}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {s.steps.map(step => (
              <div key={step.label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <CheckCircle2 size={14} color={s.color} style={{ marginTop: 3, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: C.t1, marginBottom: 3 }}>{step.label}</div>
                  <div style={{ fontFamily: UI, fontSize: 12, color: C.t2, lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ─── Main Export ────────────────────────────────────────────────── */
const TABS = [
  { id: "cost",    label: "Cost of Raising a Child", icon: Baby          },
  { id: "college", label: "College Savings (529)",   icon: GraduationCap },
  { id: "budget",  label: "Budget Impact",           icon: Calculator    },
  { id: "guide",   label: "Planning by Stage",       icon: Heart         },
];

export default function FamilyPlanning() {
  const [tab, setTab] = useState("cost");

  return (
    <div style={{ padding: "2rem 2rem 4rem", maxWidth: 1100 }}>
      {/* Hero */}
      <div style={{
        background: C.surface,
        border: `1px solid ${C.b1}`,
        borderRadius: 20,
        padding: "2rem 2.25rem",
        marginBottom: "1.25rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -40, width: 300, height: 300, background: "radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.625rem" }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: C.indigoDim, border: `1px solid ${C.indigoBdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Baby size={14} color={C.indigo} />
          </div>
          <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: C.t1, fontFamily: UI }}>
            CHILDREN &amp; FAMILY{" "}
            <em style={{ fontFamily: DISPLAY, fontStyle: "italic", color: C.indigo, fontWeight: 400, fontSize: "1.5rem" }}>Planning</em>
          </h1>
        </div>
        <p style={{ fontSize: "0.875rem", color: C.t2, lineHeight: 1.65, maxWidth: 620, margin: "0 0 1rem", fontFamily: UI }}>
          The USDA estimates the average cost of raising a child to age 18 at{" "}
          <strong style={{ color: C.indigo }}>$310,605</strong> — not including college. Plan every phase:
          pregnancy costs, childcare, 529 savings, teen expenses, and how a child reshapes your entire financial picture.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["Cost of a Child", "529 College Savings", "Budget Impact", "By-Stage Planning", "FAFSA Strategy"].map(t => (
            <span key={t} style={{
              fontSize: "0.6875rem", fontWeight: 700, padding: "3px 10px", borderRadius: 99,
              background: C.indigoDim, border: `1px solid ${C.indigoBdr}`, color: C.indigo, fontFamily: UI,
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: "1.25rem", background: C.surface, border: `1px solid ${C.b1}`, borderRadius: 12, padding: 4 }}>
        {TABS.map(t => {
          const Icon   = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "0.5rem 0.75rem", borderRadius: 8, border: "none", cursor: "pointer",
              background: active ? C.raised : "transparent",
              color: active ? C.indigo : C.t3,
              fontFamily: UI, fontSize: 13, fontWeight: active ? 700 : 500,
            }}>
              <Icon size={14} />{t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === "cost"    && <CostCalculator />}
      {tab === "college" && <CollegeSavings />}
      {tab === "budget"  && <BudgetImpact />}
      {tab === "guide"   && <PlanningGuide />}
    </div>
  );
}
