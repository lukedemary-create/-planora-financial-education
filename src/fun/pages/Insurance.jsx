import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Calculator, ExternalLink, ChevronRight, ArrowRight,
  Info, CheckCircle2, XCircle, AlertCircle, Shield, Heart,
  Car, Home, Clock, Activity, GraduationCap, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Download,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceLine, Cell,
} from 'recharts';

const TEAL  = '#00B4C6';
const NAVY  = '#f0e8d8';
const BG    = '#1a1410';
const SURF  = '#231c16';
const RAISE = '#2d2419';
const B1    = '#2a2018';
const B2    = '#3d3028';
const T2    = '#a89070';
const T3    = '#6b5540';
const UI    = "'Inter', system-ui, sans-serif";
const DISP  = "'Playfair Display', Georgia, serif";
const LIGHT = '#5BC8E2';

/* ── Policy Explorer colors ─────────────────────────────────────── */
const PBLUE   = '#4c9fcf';
const PGOLD   = '#c9a84c';
const PGREEN  = '#4caf7d';
const PPURPLE = '#9b6cdb';
const PORANGE = '#e07c3a';

function estimatePremium(coverage, age, isSmoker, healthClass, policyType = 'term', termYears = 20) {
  const base = coverage / 1000;
  const healthMult = { 'Preferred Plus':1.0, 'Preferred':1.15, 'Standard Plus':1.35, 'Standard':1.6, 'Substandard':2.2 };
  const smokerMult = isSmoker ? 2.5 : 1.0;
  const ageMult = age < 30 ? 0.5 : age < 35 ? 0.7 : age < 40 ? 1.0 : age < 45 ? 1.5 : age < 50 ? 2.2 : age < 55 ? 3.2 : age < 60 ? 4.5 : 6.5;
  const termMult = termYears <= 10 ? 0.7 : termYears <= 15 ? 0.85 : termYears <= 20 ? 1.0 : termYears <= 25 ? 1.2 : 1.4;
  const typeMult = { term:1.0, whole:8.0, universal:5.0, iul:6.0, variable:5.5 };
  const rate = 0.06 * ageMult * smokerMult * (healthMult[healthClass] || 1.0) * (typeMult[policyType] || 1.0) * (policyType === 'term' ? termMult : 1.0);
  return Math.max(10, Math.round(base * rate));
}

function FunExpandCard({ title, color, badge, summary, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:SURF, border:`1.5px solid ${color}30`, borderRadius:12, overflow:'hidden', marginBottom:'0.75rem' }}>
      <div style={{ height:2, background:`linear-gradient(90deg, ${color} 0%, transparent 80%)` }} />
      <button onClick={() => setOpen(v => !v)} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.25rem', background:'none', border:'none', cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
          <span style={{ fontSize:'0.6875rem', fontWeight:700, padding:'2px 8px', borderRadius:99, background:`${color}22`, color, border:`1px solid ${color}44`, letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:UI, flexShrink:0 }}>{badge}</span>
          <span style={{ fontSize:'0.9375rem', fontWeight:700, color:NAVY, fontFamily:DISP }}>{title}</span>
          <span style={{ fontSize:'0.8125rem', color:T3, fontFamily:UI }}>{summary}</span>
        </div>
        {open ? <ChevronUp size={14} color={T3} style={{ flexShrink:0 }}/> : <ChevronDown size={14} color={T3} style={{ flexShrink:0 }}/>}
      </button>
      {open && <div style={{ padding:'0 1.25rem 1.25rem', borderTop:`1px solid ${B1}` }}>{children}</div>}
    </div>
  );
}

const PolicyCustomTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:RAISE, border:`1px solid ${B2}`, borderRadius:6, padding:'0.6rem 0.9rem', fontSize:'0.75rem', fontFamily:UI }}>
      {label && <div style={{ color:T3, marginBottom:'0.3rem' }}>{label}</div>}
      {payload.map((p, i) => <div key={i} style={{ color:p.color||NAVY, fontWeight:700 }}>{p.name}: {typeof p.value === 'number' && p.value > 99 ? '$'+Math.round(p.value) : p.value}</div>)}
    </div>
  );
};

/* ── Shared ───────────────────────────────────────────────────────── */
function fmt(n) { return '$' + Math.round(Math.abs(n)).toLocaleString(); }

function SectionCard({ title, subtitle, children }) {
  return (
    <div style={{ background:SURF, border:`1px solid ${B1}`, borderRadius:16, padding:'1.5rem', boxShadow:'0 1px 6px rgba(0,0,0,0.05)', marginBottom:'1.25rem' }}>
      {(title||subtitle) && (
        <div style={{ marginBottom:'1.25rem' }}>
          {title && <h3 style={{ fontFamily:DISP, fontSize:'1.25rem', fontWeight:700, color:NAVY, margin:'0 0 0.25rem', letterSpacing:'-0.02em' }}>{title}</h3>}
          {subtitle && <p style={{ margin:0, fontSize:'0.875rem', color:T3, lineHeight:1.65, fontFamily:UI }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function InfoBox({ children, color = TEAL }) {
  return (
    <div style={{ display:'flex', gap:10, padding:'0.75rem 0.875rem', background:`${color}0d`, border:`1px solid ${color}25`, borderRadius:10, marginTop:'0.875rem' }}>
      <Info size={14} color={color} style={{ flexShrink:0, marginTop:2 }}/>
      <p style={{ margin:0, fontSize:'0.8125rem', color:T2, lineHeight:1.7, fontFamily:UI }}>{children}</p>
    </div>
  );
}

function NumInput({ label, value, onChange, prefix='$', suffix, min=0, step=1, hint }) {
  return (
    <div style={{ marginBottom:'1rem' }}>
      {label && <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>{label}</label>}
      <div style={{ position:'relative' }}>
        {prefix && <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:T3, fontSize:'0.875rem', pointerEvents:'none' }}>{prefix}</span>}
        <input type="number" value={value} min={min} step={step} onChange={e => onChange(Number(e.target.value))}
          style={{ width:'100%', padding:`9px ${suffix?'2.25rem':'0.75rem'} 9px ${prefix?'1.5rem':'0.75rem'}`, border:`1.5px solid ${B2}`, borderRadius:9, fontSize:'1rem', fontFamily:UI, color:NAVY, fontWeight:600, background:RAISE, boxSizing:'border-box' }}
          onFocus={e => e.target.style.borderColor=TEAL} onBlur={e => e.target.style.borderColor=B2}/>
        {suffix && <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:T3, fontSize:'0.875rem', pointerEvents:'none' }}>{suffix}</span>}
      </div>
      {hint && <p style={{ margin:'0.25rem 0 0', fontSize:'0.75rem', color:T3, fontFamily:UI }}>{hint}</p>}
    </div>
  );
}

function ResultBox({ label, value, color = TEAL, size = 'md' }) {
  return (
    <div style={{ background:`${color}0d`, border:`1px solid ${color}25`, borderRadius:12, padding: size==='lg'?'1.25rem':'0.875rem 1rem', textAlign:'center' }}>
      <div style={{ fontFamily:DISP, fontSize: size==='lg'?'2rem':'1.375rem', fontWeight:700, color, letterSpacing:'-0.02em', lineHeight:1.1 }}>{value}</div>
      <div style={{ fontSize:'0.75rem', color:T3, marginTop:4, fontFamily:UI, fontWeight:500 }}>{label}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEARN — LIFE INSURANCE (Policy Explorer)
══════════════════════════════════════════════════════════════════ */
function LifeInsuranceLearn() {
  const AGE_DATA = [25, 30, 35, 40, 45, 50, 55, 60].map(age => ({
    age,
    term:  estimatePremium(500000, age, false, 'Preferred', 'term', 20),
    whole: estimatePremium(500000, age, false, 'Preferred', 'whole'),
  }));

  const IUL_HISTORY = [
    { year:'2009', sp:26.5, iul:10 }, { year:'2010', sp:15.1, iul:10 },
    { year:'2011', sp:2.1,  iul:2.1 },{ year:'2012', sp:16.0, iul:10 },
    { year:'2013', sp:32.4, iul:10 }, { year:'2014', sp:13.7, iul:10 },
    { year:'2015', sp:1.4,  iul:1.4 },{ year:'2016', sp:12.0, iul:10 },
    { year:'2017', sp:21.8, iul:10 }, { year:'2018', sp:-4.4, iul:0  },
    { year:'2019', sp:31.5, iul:10 }, { year:'2020', sp:18.4, iul:10 },
    { year:'2021', sp:28.7, iul:10 }, { year:'2022', sp:-18.1,iul:0  },
    { year:'2023', sp:26.3, iul:10 },
  ];

  const COMPARISON_TABLE = [
    { attr:'Monthly Premium ($500K)', term:'~$25',        whole:'~$400',          universal:'~$150',          iul:'~$200',         variable:'~$175'        },
    { attr:'Cash Value',              term:'None',         whole:'Guaranteed',     universal:'Interest-based', iul:'Index-linked',  variable:'Market-based' },
    { attr:'Investment Component',    term:'No',           whole:'No',             universal:'No',             iul:'Yes (index)',   variable:'Yes (subaccounts)'},
    { attr:'Flexibility',             term:'Low',          whole:'Low',            universal:'High',           iul:'Medium',        variable:'Medium'       },
    { attr:'Complexity',              term:'Low',          whole:'Low',            universal:'Medium',         iul:'High',          variable:'High'         },
    { attr:'Risk Level',              term:'None',         whole:'None',           universal:'Low-Med',        iul:'Low (floor=0%)',variable:'High'         },
    { attr:'Tax Benefits',            term:'Death benefit',whole:'DB + tax-def CV',universal:'DB + tax-def',  iul:'DB + tax-def',  variable:'DB + tax-def' },
    { attr:'Best For',                term:'Most people',  whole:'Estate planning',universal:'Flexible needs', iul:'Growth+protect',variable:'Risk-tolerant'},
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      <div style={{ fontFamily:UI, fontSize:'0.8125rem', color:T3, marginBottom:'0.25rem' }}>
        Click any policy type to expand the full explainer with charts, pros/cons, and real examples.
      </div>

      <FunExpandCard title="Term Life Insurance" color={PBLUE} badge="TERM" summary="Pure protection · Most affordable · Best for most people">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginTop:'1rem' }}>
          <div>
            <div style={{ fontSize:'0.8125rem', color:T2, lineHeight:1.6, marginBottom:'0.75rem', fontFamily:UI }}>
              <strong style={{ color:NAVY }}>What it is:</strong> Term life provides a death benefit for a fixed period — typically 10, 15, 20, or 30 years. If you die during the term, your beneficiaries receive the payout. If you outlive it, coverage ends.
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', marginBottom:'0.75rem' }}>
              {['Lowest cost for highest coverage','Simple — easy to understand','Level premiums guaranteed','Ideal for income replacement','Covers your family while dependents are young'].map((p,i) => (
                <div key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.8125rem', color:T2, fontFamily:UI, alignItems:'flex-start' }}><CheckCircle size={13} color={PGREEN} style={{ flexShrink:0, marginTop:2 }}/>{p}</div>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
              {['No cash value accumulation','Coverage ends at term expiration','Premiums increase significantly upon renewal','Cannot borrow against policy'].map((c,i) => (
                <div key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.8125rem', color:T2, fontFamily:UI, alignItems:'flex-start' }}><AlertTriangle size={13} color={PORANGE} style={{ flexShrink:0, marginTop:2 }}/>{c}</div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:'0.75rem', fontWeight:700, color:T3, marginBottom:'0.5rem', fontFamily:UI, textTransform:'uppercase', letterSpacing:'0.06em' }}>PREMIUM BY AGE — $500K 20-YEAR TERM</div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={AGE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={B2} />
                <XAxis dataKey="age" tick={{ fontSize:10, fill:T3 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:T3 }} axisLine={false} tickLine={false} tickFormatter={v => '$'+v} />
                <Tooltip content={<PolicyCustomTip />} />
                <Line type="monotone" dataKey="term" name="Term Premium" stroke={PBLUE} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ marginTop:'0.6rem', padding:'0.6rem 0.75rem', background:`${PBLUE}18`, borderRadius:6, fontFamily:UI }}>
              <div style={{ fontSize:'0.75rem', color:PBLUE, fontWeight:700 }}>Real Example</div>
              <div style={{ fontSize:'0.75rem', color:T2, marginTop:'0.2rem' }}>35-year-old non-smoker, Preferred health, $500K policy ≈ <strong style={{ color:PGREEN }}>$25–$35/month</strong></div>
            </div>
          </div>
        </div>
      </FunExpandCard>

      <FunExpandCard title="Whole Life Insurance" color={PGOLD} badge="WHOLE LIFE" summary="Permanent · Cash value · Guaranteed · Higher cost">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginTop:'1rem' }}>
          <div>
            <div style={{ fontSize:'0.8125rem', color:T2, lineHeight:1.6, marginBottom:'0.75rem', fontFamily:UI }}>
              <strong style={{ color:NAVY }}>What it is:</strong> Whole life provides permanent coverage — it never expires. Your premium is split between the insurance cost and a cash value account that grows at a guaranteed rate. Many policies pay annual dividends.
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', marginBottom:'0.75rem' }}>
              {['Permanent — never expires','Guaranteed cash value growth','Can borrow against cash value tax-free','Dividend-paying policies from top carriers','Estate planning tool for high net worth'].map((p,i) => (
                <div key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.8125rem', color:T2, fontFamily:UI, alignItems:'flex-start' }}><CheckCircle size={13} color={PGREEN} style={{ flexShrink:0, marginTop:2 }}/>{p}</div>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
              {['8–15× more expensive than term','Cash value growth is slow early on','Surrender charges if cancelled early','Complex dividend structure'].map((c,i) => (
                <div key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.8125rem', color:T2, fontFamily:UI, alignItems:'flex-start' }}><AlertTriangle size={13} color={PORANGE} style={{ flexShrink:0, marginTop:2 }}/>{c}</div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:'0.75rem', fontWeight:700, color:T3, marginBottom:'0.5rem', fontFamily:UI, textTransform:'uppercase', letterSpacing:'0.06em' }}>TERM VS WHOLE LIFE — PREMIUM COMPARISON</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={AGE_DATA.slice(1,5)} margin={{ left:-10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={B2} />
                <XAxis dataKey="age" tick={{ fontSize:10, fill:T3 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:T3 }} axisLine={false} tickLine={false} tickFormatter={v => '$'+v} />
                <Tooltip content={<PolicyCustomTip />} />
                <Legend wrapperStyle={{ fontSize:'0.7rem', color:T2 }} />
                <Bar dataKey="term" name="Term" fill={PBLUE} radius={[3,3,0,0]} />
                <Bar dataKey="whole" name="Whole Life" fill={PGOLD} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FunExpandCard>

      <FunExpandCard title="Universal Life Insurance" color={PPURPLE} badge="UNIVERSAL" summary="Permanent · Flexible premiums · Adjustable death benefit">
        <div style={{ marginTop:'1rem', fontSize:'0.8125rem', color:T2, lineHeight:1.6, marginBottom:'0.75rem', fontFamily:UI }}>
          <strong style={{ color:NAVY }}>What it is:</strong> Universal life separates the insurance cost from the savings component, giving you flexibility to adjust premiums and death benefit over time. The cash value earns interest at a credited rate.
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          <div>
            {['Flexible premium payments','Adjustable death benefit up or down','Cash value earns credited interest rate','Good for changing income situations'].map((p,i) => (
              <div key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.8125rem', color:T2, marginBottom:'0.35rem', fontFamily:UI, alignItems:'flex-start' }}><CheckCircle size={13} color={PGREEN} style={{ flexShrink:0, marginTop:2 }}/>{p}</div>
            ))}
          </div>
          <div>
            {['Policy can lapse if underfunded — major risk','Interest credited rate can decrease','More complex than term or whole life','Requires monitoring to stay in force'].map((c,i) => (
              <div key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.8125rem', color:T2, marginBottom:'0.35rem', fontFamily:UI, alignItems:'flex-start' }}><AlertTriangle size={13} color={PORANGE} style={{ flexShrink:0, marginTop:2 }}/>{c}</div>
            ))}
          </div>
        </div>
        <div style={{ marginTop:'0.75rem', padding:'0.75rem 1rem', background:`${PORANGE}18`, border:`1px solid ${PORANGE}44`, borderRadius:8, fontFamily:UI }}>
          <div style={{ fontSize:'0.75rem', color:PORANGE, fontWeight:700, display:'flex', alignItems:'center', gap:5 }}><AlertTriangle size={12}/> Important Warning</div>
          <div style={{ fontSize:'0.75rem', color:T2, marginTop:'0.2rem' }}>Universal life policies have lapsed on millions of policyholders who didn't pay enough premiums. Always run an in-force illustration before reducing payments.</div>
        </div>
      </FunExpandCard>

      <FunExpandCard title="Indexed Universal Life (IUL)" color={PGREEN} badge="IUL" summary="Permanent · S&P 500 linked · Floor 0% · Cap ~10–12%">
        <div style={{ marginTop:'1rem' }}>
          <div style={{ fontSize:'0.8125rem', color:T2, lineHeight:1.6, marginBottom:'0.75rem', fontFamily:UI }}>
            <strong style={{ color:NAVY }}>What it is:</strong> IUL links your cash value growth to a stock market index (like the S&P 500) with a floor (you can't lose money in a down market) and a cap (your gains are limited, typically 10–12% per year).
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
            <div>
              <div style={{ fontSize:'0.75rem', fontWeight:700, color:T3, marginBottom:'0.4rem', fontFamily:UI, textTransform:'uppercase', letterSpacing:'0.06em' }}>S&P 500 ACTUAL VS IUL CREDIT (FLOOR 0% / CAP 10%)</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={IUL_HISTORY} margin={{ left:-20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={B2} />
                  <XAxis dataKey="year" tick={{ fontSize:8, fill:T3 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:9, fill:T3 }} axisLine={false} tickLine={false} tickFormatter={v => v+'%'} />
                  <Tooltip content={<PolicyCustomTip />} />
                  <ReferenceLine y={0} stroke={T3} strokeDasharray="3 3" />
                  <Bar dataKey="sp"  name="S&P 500"    fill={PBLUE}  opacity={0.5} radius={[2,2,0,0]} />
                  <Bar dataKey="iul" name="IUL Credit" fill={PGREEN} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', marginBottom:'0.75rem' }}>
                {['0% floor — never lose money in down markets','Upside participation in market gains','Tax-deferred cash value growth','Tax-free loans against cash value','Death benefit included'].map((p,i) => (
                  <div key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.8125rem', color:T2, fontFamily:UI, alignItems:'flex-start' }}><CheckCircle size={13} color={PGREEN} style={{ flexShrink:0, marginTop:2 }}/>{p}</div>
                ))}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                {['Caps limit upside (typically 10–12%)','High internal fees reduce returns','Very complex product','Aggressive sales practices in industry'].map((c,i) => (
                  <div key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.8125rem', color:T2, fontFamily:UI, alignItems:'flex-start' }}><AlertTriangle size={13} color={PORANGE} style={{ flexShrink:0, marginTop:2 }}/>{c}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FunExpandCard>

      <FunExpandCard title="Variable Life Insurance" color={PORANGE} badge="VARIABLE" summary="Permanent · Investment subaccounts · Highest risk/reward">
        <div style={{ marginTop:'1rem', fontSize:'0.8125rem', color:T2, lineHeight:1.6, marginBottom:'0.75rem', fontFamily:UI }}>
          <strong style={{ color:NAVY }}>What it is:</strong> Variable life lets you invest your cash value in stock/bond subaccounts (similar to mutual funds). Your death benefit and cash value fluctuate with market performance — meaning you can lose money.
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          <div>
            {['Highest potential cash value growth','Wide investment selection','Can outperform all other types in bull market'].map((p,i) => (
              <div key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.8125rem', color:T2, marginBottom:'0.35rem', fontFamily:UI, alignItems:'flex-start' }}><CheckCircle size={13} color={PGREEN} style={{ flexShrink:0, marginTop:2 }}/>{p}</div>
            ))}
          </div>
          <div>
            {['Death benefit can decrease with poor performance','Highest fees of all policy types','Requires active investment management','Securities license required to sell'].map((c,i) => (
              <div key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.8125rem', color:T2, marginBottom:'0.35rem', fontFamily:UI, alignItems:'flex-start' }}><AlertTriangle size={13} color={PORANGE} style={{ flexShrink:0, marginTop:2 }}/>{c}</div>
            ))}
          </div>
        </div>
      </FunExpandCard>

      {/* Side-by-side comparison table */}
      <div style={{ background:SURF, border:`1px solid ${B1}`, borderRadius:16, padding:'1.25rem' }}>
        <div style={{ fontSize:'0.75rem', fontWeight:700, color:NAVY, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.75rem', fontFamily:UI }}>Side-by-Side Comparison</div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', minWidth:640, borderCollapse:'collapse', fontFamily:UI }}>
            <thead>
              <tr style={{ borderBottom:`2px solid ${B2}`, background:RAISE }}>
                {[['Feature',T3],['TERM',PBLUE],['WHOLE',PGOLD],['UNIVERSAL',PPURPLE],['IUL',PGREEN],['VARIABLE',PORANGE]].map(([h,c]) => (
                  <th key={h} style={{ padding:'0.5rem 0.75rem', textAlign:'left', fontSize:'0.75rem', fontWeight:700, color:c, textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_TABLE.map((row,i) => (
                <tr key={row.attr} style={{ borderBottom:`1px solid ${B1}`, background: i%2===0 ? RAISE : SURF }}>
                  <td style={{ padding:'0.625rem 0.75rem', fontWeight:600, color:NAVY, fontSize:'0.8125rem' }}>{row.attr}</td>
                  <td style={{ padding:'0.625rem 0.75rem', color:PBLUE,   fontSize:'0.8125rem' }}>{row.term}</td>
                  <td style={{ padding:'0.625rem 0.75rem', color:PGOLD,   fontSize:'0.8125rem' }}>{row.whole}</td>
                  <td style={{ padding:'0.625rem 0.75rem', color:PPURPLE, fontSize:'0.8125rem' }}>{row.universal}</td>
                  <td style={{ padding:'0.625rem 0.75rem', color:PGREEN,  fontSize:'0.8125rem' }}>{row.iul}</td>
                  <td style={{ padding:'0.625rem 0.75rem', color:PORANGE, fontSize:'0.8125rem' }}>{row.variable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEARN — HEALTH INSURANCE
══════════════════════════════════════════════════════════════════ */
function HealthInsuranceLearn() {
  const plans = [
    { name:'HMO', color:TEAL, best:'Lowest cost, OK with a primary care gatekeeper', pros:['Lowest premiums','Lowest out-of-pocket costs','Predictable copays'], cons:['Requires referrals to see specialists','Must stay in-network (except emergencies)','Less flexibility in choosing providers'] },
    { name:'PPO', color:'#3b82f6', best:'Flexibility to see any doctor without referrals', pros:['No referrals needed','In-network AND out-of-network coverage','Largest provider networks'], cons:['Higher premiums and deductibles','More complex billing','Out-of-network care is expensive'] },
    { name:'HDHP + HSA', color:'#8b5cf6', best:'Healthy, high earners who can invest the HSA', pros:['Lowest premiums of any plan','Unlocks HSA (triple tax advantage)','Great for healthy people with few claims'], cons:['High deductible — $1,600+ individual','You pay full cost until deductible is met','Not ideal if you use healthcare frequently'] },
  ];

  const terms = [
    { term:'Deductible', color:'#ef4444', def:'Amount you pay before insurance kicks in. Example: $1,500 deductible means you pay the first $1,500 of covered costs each year.' },
    { term:'Premium', color:'#f59e0b', def:'Monthly payment to maintain insurance coverage. Paid regardless of whether you use healthcare.' },
    { term:'Copay', color:TEAL, def:'Fixed amount you pay per visit after the deductible (or sometimes without meeting deductible). Example: $25 copay for primary care.' },
    { term:'Coinsurance', color:'#3b82f6', def:'Your percentage share of costs after meeting your deductible. Example: 20% coinsurance means you pay 20%, insurance pays 80%.' },
    { term:'Out-of-Pocket Max', color:'#22c55e', def:'The most you\'ll pay in a year. After hitting this, insurance covers 100% of covered expenses. Critical protection against catastrophic costs.' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div>
        <h4 style={{ fontFamily:DISP, fontSize:'1rem', fontWeight:700, color:NAVY, margin:'0 0 0.875rem' }}>HMO vs PPO vs HDHP</h4>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {plans.map(p => (
            <div key={p.name} style={{ border:`1.5px solid ${p.color}30`, borderRadius:12, overflow:'hidden' }}>
              <div style={{ padding:'0.75rem 1rem', background:`${p.color}08`, borderBottom:`1px solid ${p.color}15`, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontFamily:DISP, fontWeight:700, fontSize:'0.9375rem', color:NAVY }}>{p.name}</span>
                <span style={{ fontSize:'0.8125rem', color:T3, fontFamily:UI }}>— {p.best}</span>
              </div>
              <div style={{ padding:'0.875rem 1rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}>
                <div>
                  {p.pros.map((x, i) => <div key={i} style={{ display:'flex', gap:7, marginBottom:'0.3rem' }}><CheckCircle2 size={12} color='#22c55e' style={{ flexShrink:0, marginTop:2 }}/><span style={{ fontSize:'0.8125rem', color:T2, lineHeight:1.6, fontFamily:UI }}>{x}</span></div>)}
                </div>
                <div>
                  {p.cons.map((x, i) => <div key={i} style={{ display:'flex', gap:7, marginBottom:'0.3rem' }}><XCircle size={12} color='#ef4444' style={{ flexShrink:0, marginTop:2 }}/><span style={{ fontSize:'0.8125rem', color:T2, lineHeight:1.6, fontFamily:UI }}>{x}</span></div>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ fontFamily:DISP, fontSize:'1rem', fontWeight:700, color:NAVY, margin:'0 0 0.875rem' }}>Health Plan Anatomy — Key Terms</h4>
        {/* Visual flow */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1rem', padding:'1rem', background:RAISE, borderRadius:12 }}>
          <div style={{ textAlign:'center', fontSize:'0.75rem', fontWeight:700, color:T3, letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:UI, marginBottom:'0.5rem' }}>Your cost journey in a year</div>
          {[
            { label:'You pay 100% of costs', sub:'Until you meet your deductible', color:'#ef4444', pct:35 },
            { label:'You pay your coinsurance %', sub:'Insurance pays the rest (e.g. 20% you / 80% insurer)', color:'#f59e0b', pct:35 },
            { label:'Insurance pays 100%', sub:'After you hit your out-of-pocket maximum', color:'#22c55e', pct:30 },
          ].map((s, i) => (
            <div key={i} style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
              <div style={{ width:`${s.pct}%`, maxWidth:120, height:28, background:s.color, borderRadius:7, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:'0.6875rem', fontWeight:700, color:'#fff', fontFamily:UI }}>Phase {i+1}</span>
              </div>
              <div>
                <div style={{ fontSize:'0.8125rem', fontWeight:700, color:NAVY, fontFamily:UI }}>{s.label}</div>
                <div style={{ fontSize:'0.75rem', color:T3, fontFamily:UI }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
          {terms.map((t, i) => (
            <div key={i} style={{ display:'flex', gap:'0.875rem', padding:'0.625rem 0.875rem', background:SURF, border:`1px solid ${B1}`, borderRadius:10 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:t.color, flexShrink:0, marginTop:6 }}/>
              <div>
                <span style={{ fontWeight:700, color:NAVY, fontSize:'0.875rem', fontFamily:UI }}>{t.term}: </span>
                <span style={{ fontSize:'0.875rem', color:T2, lineHeight:1.65, fontFamily:UI }}>{t.def}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEARN — AUTO INSURANCE
══════════════════════════════════════════════════════════════════ */
function AutoInsuranceLearn() {
  const coverages = [
    { name:'Liability', color:TEAL, required:'Required in most states', desc:'Pays for damage you cause to others — their car, property, and medical bills. Bodily Injury + Property Damage. State minimums are often dangerously low. Carry at least $100K/$300K.', tip:'State minimums like 25/50/25 are barely enough. A single serious accident can exceed limits and put your assets at risk.' },
    { name:'Collision', color:'#3b82f6', required:'Optional', desc:'Pays to repair or replace YOUR car after a collision, regardless of fault. Subject to your deductible. Required by lenders if you have a car loan or lease.', tip:'If your car\'s value is less than 10× your annual premium, dropping collision may make financial sense.' },
    { name:'Comprehensive', color:'#8b5cf6', required:'Optional', desc:'Covers non-collision damage: theft, vandalism, weather, fire, floods, hitting an animal. Often cheaper than collision. Also required by lenders.', tip:'Comprehensive is typically inexpensive ($100–200/yr). Usually worth keeping even on older cars.' },
    { name:'Uninsured/Underinsured Motorist', color:'#f59e0b', required:'Required in ~20 states', desc:'Protects you if you\'re hit by a driver with no insurance or not enough coverage. About 13% of US drivers are uninsured. Critical protection.', tip:'Always carry UM/UIM at least equal to your liability limits. It\'s usually very cheap to add.' },
    { name:'Personal Injury Protection (PIP)', color:'#ef4444', required:'Required in no-fault states', desc:'Covers your medical expenses and lost wages after an accident, regardless of fault. Required in no-fault states (FL, NY, NJ, MI, etc.).', tip:'In no-fault states, PIP is mandatory. In other states, medical payments coverage provides similar but more limited protection.' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
      <p style={{ fontSize:'0.875rem', color:T3, margin:'0 0 0.5rem', lineHeight:1.7, fontFamily:UI }}>
        Auto insurance is bundled from several types of coverage. Understanding each helps you build the right policy — not just the cheapest.
      </p>
      {coverages.map(c => (
        <div key={c.name} style={{ border:`1.5px solid ${c.color}25`, borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'0.75rem 1rem', background:`${c.color}08`, borderBottom:`1px solid ${c.color}18`, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <span style={{ fontFamily:DISP, fontWeight:700, fontSize:'0.9375rem', color:NAVY }}>{c.name}</span>
            <span style={{ padding:'2px 10px', background:`${c.color}15`, border:`1px solid ${c.color}30`, borderRadius:100, fontSize:'0.6875rem', fontWeight:700, color:c.color, fontFamily:UI }}>{c.required}</span>
          </div>
          <div style={{ padding:'0.75rem 1rem' }}>
            <p style={{ margin:'0 0 0.5rem', fontSize:'0.875rem', color:T2, lineHeight:1.7, fontFamily:UI }}>{c.desc}</p>
            <div style={{ display:'flex', gap:7, padding:'0.5rem 0.75rem', background:`${c.color}0a`, borderRadius:8 }}>
              <Info size={12} color={c.color} style={{ flexShrink:0, marginTop:2 }}/>
              <p style={{ margin:0, fontSize:'0.8rem', color:'#4b5563', lineHeight:1.6, fontFamily:UI }}>{c.tip}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEARN — HOME / RENTERS
══════════════════════════════════════════════════════════════════ */
function HomeInsuranceLearn() {
  const covered    = ['Damage from fire and smoke','Theft and vandalism','Wind and hail damage','Water damage from burst pipes','Lightning strikes','Falling objects','Liability if someone is injured on your property','Additional living expenses if home is uninhabitable'];
  const notCovered = ['Flooding (requires separate NFIP or private flood policy)','Earthquakes (separate policy required)','Gradual wear and tear','Pest/termite damage','Sewer backup (often available as rider)','Mold (usually excluded unless caused by covered event)','High-value jewelry/art beyond standard limits','Business equipment or home business liability'];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
        <div style={{ border:'1.5px solid #22c55e30', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'0.625rem 0.875rem', background:'rgba(34,197,94,0.08)', borderBottom:'1px solid rgba(34,197,94,0.15)' }}>
            <span style={{ fontFamily:DISP, fontWeight:700, fontSize:'0.9375rem', color:NAVY }}>Typically Covered</span>
          </div>
          <div style={{ padding:'0.75rem 0.875rem' }}>
            {covered.map((x, i) => <div key={i} style={{ display:'flex', gap:7, marginBottom:'0.375rem' }}><CheckCircle2 size={12} color='#22c55e' style={{ flexShrink:0, marginTop:2 }}/><span style={{ fontSize:'0.8125rem', color:T2, lineHeight:1.6, fontFamily:UI }}>{x}</span></div>)}
          </div>
        </div>
        <div style={{ border:'1.5px solid #ef444430', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'0.625rem 0.875rem', background:'rgba(239,68,68,0.06)', borderBottom:'1px solid rgba(239,68,68,0.15)' }}>
            <span style={{ fontFamily:DISP, fontWeight:700, fontSize:'0.9375rem', color:NAVY }}>Not Covered</span>
          </div>
          <div style={{ padding:'0.75rem 0.875rem' }}>
            {notCovered.map((x, i) => <div key={i} style={{ display:'flex', gap:7, marginBottom:'0.375rem' }}><XCircle size={12} color='#ef4444' style={{ flexShrink:0, marginTop:2 }}/><span style={{ fontSize:'0.8125rem', color:T2, lineHeight:1.6, fontFamily:UI }}>{x}</span></div>)}
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ fontFamily:DISP, fontSize:'1rem', fontWeight:700, color:NAVY, margin:'0 0 0.875rem' }}>Replacement Cost vs Actual Cash Value (ACV)</h4>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
          {[
            { type:'Replacement Cost', color:'#22c55e', desc:'Pays what it costs to rebuild or replace at TODAY\'s prices. A 10-year-old roof destroyed in a storm gets a new roof. Always choose this if you can.', example:'Roof cost today: $15,000 → Insurer pays: $15,000' },
            { type:'Actual Cash Value', color:'#f59e0b', desc:'Pays replacement cost MINUS depreciation. A 10-year-old roof has depreciated significantly — you may get far less than replacement cost.', example:'Roof cost today: $15,000 − $8,000 depreciation → Insurer pays: $7,000' },
          ].map(t => (
            <div key={t.type} style={{ padding:'1rem', background:`${t.color}08`, border:`1.5px solid ${t.color}25`, borderRadius:12 }}>
              <div style={{ fontFamily:DISP, fontWeight:700, color:NAVY, marginBottom:6, fontSize:'0.9375rem' }}>{t.type}</div>
              <p style={{ margin:'0 0 0.625rem', fontSize:'0.8125rem', color:T2, lineHeight:1.65, fontFamily:UI }}>{t.desc}</p>
              <div style={{ padding:'0.5rem 0.75rem', background:RAISE, borderRadius:8, fontSize:'0.8rem', color:T2, fontFamily:UI, fontWeight:600 }}>{t.example}</div>
            </div>
          ))}
        </div>
        <InfoBox>Renters insurance is remarkably cheap ($15–30/month) and covers your personal property AND liability. If you rent and don't have it, get it today.</InfoBox>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEARN — LONG-TERM CARE
══════════════════════════════════════════════════════════════════ */
function LTCLearn() {
  const costs = [
    { type:'Adult Day Health Care',  daily:'$95',   monthly:'$2,000–$2,500',  annual:'$24,000–$30,000' },
    { type:'Home Health Aide',       daily:'$175',  monthly:'$4,500–$5,200',  annual:'$54,000–$62,400' },
    { type:'Assisted Living Facility',daily:'$165', monthly:'$4,500–$5,500',  annual:'$54,000–$66,000' },
    { type:'Nursing Home (Semi-private)',daily:'$295',monthly:'$8,000–$9,500',annual:'$96,000–$114,000' },
    { type:'Nursing Home (Private)',  daily:'$335', monthly:'$9,500–$11,000', annual:'$114,000–$132,000' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <p style={{ fontSize:'0.875rem', color:T3, margin:0, lineHeight:1.7, fontFamily:UI }}>
        About <strong style={{ color:NAVY }}>70% of people over 65</strong> will need some form of long-term care. Medicare covers very little (only short-term skilled care). Medicaid requires spending down nearly all assets first. LTC insurance bridges the gap.
      </p>

      <div>
        <h4 style={{ fontFamily:DISP, fontSize:'1rem', fontWeight:700, color:NAVY, margin:'0 0 0.875rem' }}>National Average LTC Costs (2024)</h4>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:UI, fontSize:'0.875rem' }}>
            <thead>
              <tr style={{ borderBottom:`2px solid ${B2}`, background:RAISE }}>
                {['Care Type','Daily Cost','Monthly Cost','Annual Cost'].map(h => (
                  <th key={h} style={{ padding:'0.5rem 0.75rem', textAlign:'left', fontSize:'0.75rem', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {costs.map((row, i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${B1}`, background: i%2===0?RAISE:SURF }}>
                  <td style={{ padding:'0.625rem 0.75rem', fontWeight:600, color:NAVY }}>{row.type}</td>
                  <td style={{ padding:'0.625rem 0.75rem', color:T2 }}>{row.daily}</td>
                  <td style={{ padding:'0.625rem 0.75rem', color:T2 }}>{row.monthly}</td>
                  <td style={{ padding:'0.625rem 0.75rem', fontWeight:700, color:'#ef4444' }}>{row.annual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 style={{ fontFamily:DISP, fontSize:'1rem', fontWeight:700, color:NAVY, margin:'0 0 0.875rem' }}>When to Buy LTC Insurance</h4>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
          {[
            { age:'Under 50', rec:'Too early', color:T3, note:'Premiums are low but you\'ll pay them for decades. Most advisors suggest waiting.' },
            { age:'50–55', rec:'Sweet spot', color:'#22c55e', note:'Best balance of affordable premiums and insurability. Buy here if LTC is in your plan.' },
            { age:'55–65', rec:'Optimal window', color:TEAL, note:'Still insurable for most. Premiums rising but still manageable. Act before health issues arise.' },
            { age:'65–70', rec:'Possible but expensive', color:'#f59e0b', note:'Premiums are high. Health screening may disqualify you. Hybrid life/LTC policies may be better.' },
            { age:'Over 70', rec:'Very difficult', color:'#ef4444', note:'Most traditional LTC policies unavailable or unaffordable. Self-insuring or Medicaid planning are alternatives.' },
          ].map((s, i) => (
            <div key={i} style={{ display:'flex', gap:'0.875rem', alignItems:'center', padding:'0.625rem 0.875rem', background:RAISE, borderRadius:9, border:`1px solid ${B1}` }}>
              <div style={{ width:60, textAlign:'center' }}>
                <div style={{ fontWeight:800, color:NAVY, fontSize:'0.875rem', fontFamily:UI }}>{s.age}</div>
              </div>
              <div style={{ width:2, height:32, background:'#e5e7eb' }}/>
              <div style={{ flex:1 }}>
                <span style={{ padding:'2px 9px', background:`${s.color}15`, borderRadius:100, fontSize:'0.6875rem', fontWeight:700, color:s.color, fontFamily:UI, marginBottom:4, display:'inline-block' }}>{s.rec}</span>
                <div style={{ fontSize:'0.8125rem', color:T3, lineHeight:1.6, fontFamily:UI }}>{s.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEARN — DISABILITY INSURANCE
══════════════════════════════════════════════════════════════════ */
function DisabilityLearn() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <p style={{ fontSize:'0.875rem', color:T3, margin:0, lineHeight:1.7, fontFamily:UI }}>
        A 35-year-old has a <strong style={{ color:NAVY }}>1 in 4 chance</strong> of becoming disabled before retirement. Yet most people insure their car and phone while leaving their income — their most valuable asset — completely unprotected.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
        {[
          {
            type:'Short-Term Disability (STD)',
            color:TEAL,
            duration:'3–6 months',
            wait:'0–14 days',
            covers:'60–70% of income',
            points:['Often provided by employers at low/no cost','Covers maternity leave, surgeries, temporary illness','Gap between injury and LTD benefit start','Usually Group policy — not portable if you leave'],
          },
          {
            type:'Long-Term Disability (LTD)',
            color:NAVY,
            duration:'2 years to age 65+',
            wait:'90–180 days (elimination period)',
            covers:'50–70% of income',
            points:['Most critical coverage — replaces income for years','Group LTD through employer is affordable but limited','Own-Occupation vs Any-Occupation definitions matter enormously','Individual policies are portable and offer stronger protections'],
          },
        ].map(t => (
          <div key={t.type} style={{ border:`1.5px solid ${t.color}30`, borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'0.75rem 1rem', background:`${t.color}0c`, borderBottom:`1px solid ${t.color}18` }}>
              <div style={{ fontFamily:DISP, fontWeight:700, fontSize:'0.875rem', color:NAVY, marginBottom:6 }}>{t.type}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:3, fontSize:'0.75rem', fontFamily:UI }}>
                <span style={{ color:T3 }}>Duration: <strong style={{ color:NAVY }}>{t.duration}</strong></span>
                <span style={{ color:T3 }}>Wait period: <strong style={{ color:NAVY }}>{t.wait}</strong></span>
                <span style={{ color:T3 }}>Typical coverage: <strong style={{ color:t.color }}>{t.covers}</strong></span>
              </div>
            </div>
            <div style={{ padding:'0.75rem 1rem' }}>
              {t.points.map((p, i) => <div key={i} style={{ display:'flex', gap:7, marginBottom:'0.35rem' }}><div style={{ width:5, height:5, borderRadius:'50%', background:t.color, flexShrink:0, marginTop:5 }}/><span style={{ fontSize:'0.8125rem', color:T2, lineHeight:1.6, fontFamily:UI }}>{p}</span></div>)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding:'0.875rem 1rem', background:'rgba(0,180,198,0.07)', border:'1px solid rgba(0,180,198,0.2)', borderRadius:12 }}>
        <div style={{ fontFamily:DISP, fontWeight:700, color:NAVY, marginBottom:6, fontSize:'0.9375rem' }}>Own-Occupation vs Any-Occupation — The Most Important Distinction</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', fontSize:'0.8125rem', fontFamily:UI }}>
          <div style={{ padding:'0.625rem 0.75rem', background:'rgba(34,197,94,0.08)', borderRadius:9, color:T2 }}>
            <strong style={{ color:'#22c55e' }}>Own-Occupation:</strong> Pays benefits if you can't perform <em>your specific job</em>. A surgeon who can't operate collects benefits even if they could work in another capacity. Always buy this.
          </div>
          <div style={{ padding:'0.625rem 0.75rem', background:'rgba(239,68,68,0.07)', borderRadius:9, color:T2 }}>
            <strong style={{ color:'#ef4444' }}>Any-Occupation:</strong> Only pays if you're unable to perform <em>any</em> job. Much harder to qualify. Often what group LTD policies use. Weaker protection.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CALCULATE — DIME Life Insurance Calculator
══════════════════════════════════════════════════════════════════ */
function DIMECalc() {
  const [debt,        setDebt]        = useState(15000);
  const [income,      setIncome]      = useState(75000);
  const [incomeYears, setIncomeYears] = useState(20);
  const [mortgage,    setMortgage]    = useState(250000);
  const [education,   setEducation]   = useState(120000);
  const [existing,    setExisting]    = useState(0);

  const D = debt;
  const I = income * incomeYears;
  const M = mortgage;
  const E = education;
  const total = D + I + M + E;
  const needed = Math.max(0, total - existing);

  const items = [
    { label:'D — Debt', value:D, color:'#ef4444', desc:'All debts excluding mortgage (credit cards, car, student loans)' },
    { label:'I — Income', value:I, color:'#f59e0b', desc:`${incomeYears} years × ${fmt(income)}/yr annual income to replace` },
    { label:'M — Mortgage', value:M, color:TEAL, desc:'Outstanding mortgage balance' },
    { label:'E — Education', value:E, color:'#8b5cf6', desc:'Estimated education costs for all dependents' },
  ];

  return (
    <div>
      <p style={{ fontSize:'0.875rem', color:T3, marginBottom:'1.25rem', lineHeight:1.65, fontFamily:UI }}>
        The <strong style={{ color:NAVY }}>DIME method</strong> estimates how much life insurance you need by adding four components: Debt, Income replacement, Mortgage, and Education costs.
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}>
        <NumInput label="Outstanding Debts (excl. mortgage)" value={debt} onChange={setDebt} min={0} step={1000}/>
        <NumInput label="Annual Income to Replace" value={income} onChange={setIncome} min={0} step={1000}/>
      </div>
      <div style={{ marginBottom:'1rem' }}>
        <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>Income Replacement Years — {incomeYears} years</label>
        <input type="range" min={5} max={40} step={1} value={incomeYears} onChange={e=>setIncomeYears(Number(e.target.value))} style={{ width:'100%', accentColor:TEAL, cursor:'pointer' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.6875rem', color:T3, fontFamily:UI, marginTop:2 }}>
          <span>5</span><span>10</span><span>20</span><span>30</span><span>40</span>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}>
        <NumInput label="Mortgage Balance" value={mortgage} onChange={setMortgage} min={0} step={5000}/>
        <NumInput label="Education Costs (all children)" value={education} onChange={setEducation} min={0} step={5000} hint="~$30K/yr × 4 yrs per child"/>
      </div>
      <NumInput label="Existing Life Insurance Coverage" value={existing} onChange={setExisting} min={0} step={10000} hint="From employer group policy or existing individual policy"/>

      <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1rem' }}>
        {items.map(it => (
          <div key={it.label} style={{ display:'flex', alignItems:'center', gap:'0.875rem', padding:'0.625rem 0.875rem', background:RAISE, borderRadius:9 }}>
            <div style={{ width:10, height:10, borderRadius:3, background:it.color, flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.8125rem', fontWeight:700, color:NAVY, fontFamily:UI }}>{it.label}</div>
              <div style={{ fontSize:'0.75rem', color:T3, fontFamily:UI }}>{it.desc}</div>
            </div>
            <div style={{ fontFamily:DISP, fontSize:'1rem', fontWeight:700, color:it.color }}>{fmt(it.value)}</div>
          </div>
        ))}
        {existing > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:'0.875rem', padding:'0.625rem 0.875rem', background:'#f0fdff', borderRadius:9, border:'1px solid rgba(0,180,198,0.2)' }}>
            <div style={{ width:10, height:10, borderRadius:3, background:'#22c55e', flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.8125rem', fontWeight:700, color:NAVY, fontFamily:UI }}>Minus existing coverage</div>
            </div>
            <div style={{ fontFamily:DISP, fontSize:'1rem', fontWeight:700, color:'#22c55e' }}>−{fmt(existing)}</div>
          </div>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
        <ResultBox label="Total DIME" value={fmt(total)} color="#6b7280"/>
        <ResultBox label="Additional Coverage Needed" value={fmt(needed)} color={needed > 0 ? TEAL : '#22c55e'} size="lg"/>
      </div>
      <InfoBox>This is a starting estimate. A licensed insurance professional can refine it based on your spouse's income, Social Security survivor benefits, and your specific financial situation.</InfoBox>
    </div>
  );
}

/* ── Auto Deductible Break-Even ─────────────────────────────────── */
function AutoDeductibleCalc() {
  const [currentDed, setCurrentDed] = useState(500);
  const [newDed,     setNewDed]     = useState(1000);
  const [savings,    setSavings]    = useState(150);

  const dedIncrease  = Math.max(0, newDed - currentDed);
  const breakEven    = savings > 0 ? (dedIncrease / savings).toFixed(1) : '—';
  const fiveYearSave = savings * 5 - (dedIncrease > 0 ? 0 : 0); // assuming no claims

  return (
    <div>
      <p style={{ fontSize:'0.875rem', color:T3, marginBottom:'1.25rem', lineHeight:1.65, fontFamily:UI }}>
        Raising your deductible lowers your premium but increases your out-of-pocket risk per claim. This calculator shows when the switch pays off.
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}>
        <NumInput label="Current Deductible" value={currentDed} onChange={setCurrentDed} min={0} step={100}/>
        <NumInput label="New (Higher) Deductible" value={newDed} onChange={v=>setNewDed(Math.max(currentDed, v))} min={currentDed} step={100}/>
      </div>
      <NumInput label="Estimated Annual Premium Savings" value={savings} onChange={setSavings} min={0} step={25} hint="Get a quote from your insurer or use Insurify to compare"/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.625rem' }}>
        <ResultBox label="Deductible Increase" value={fmt(dedIncrease)} color="#f59e0b"/>
        <ResultBox label="Break-Even Point" value={`${breakEven} yrs`} color={Number(breakEven) <= 3 ? '#22c55e' : '#ef4444'} size="lg"/>
        <ResultBox label="5-Year Premium Savings" value={fmt(fiveYearSave)} color={TEAL}/>
      </div>
      <InfoBox color={Number(breakEven) <= 3 ? '#22c55e' : '#f59e0b'}>
        {Number(breakEven) <= 3
          ? `A ${breakEven}-year break-even is excellent. If you go more than ${breakEven} years without a claim, the higher deductible pays off.`
          : `A ${breakEven}-year break-even is long. Only switch if you have a solid emergency fund to cover the higher deductible.`}
      </InfoBox>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   RESOURCES
══════════════════════════════════════════════════════════════════ */
const RESOURCES = [
  { category:'Life Insurance', color:'#ef4444', providers:[
    { name:'Policygenius', badge:'Best comparison tool', desc:'Compares quotes from 30+ life insurance carriers in minutes. Independent — not tied to one insurer. Excellent for term life shopping.' },
    { name:'Haven Life',   badge:'Best digital term',   desc:'100% online term life from MassMutual. Instant decision for healthy applicants under 45. No medical exam required for many policies.' },
    { name:'Northwestern Mutual', badge:'Best whole life', desc:'Top-rated whole life and permanent insurance. Works through advisors. Best for complex planning needs, not simple term coverage.' },
  ]},
  { category:'Auto Insurance', color:'#3b82f6', providers:[
    { name:'Insurify', badge:'Best comparison tool', desc:'AI-powered comparison engine for auto insurance. Shows real quotes from 40+ carriers instantly without sharing your info with everyone.' },
    { name:'Progressive', badge:'Best for high-risk drivers', desc:'Name Your Price tool. Snapshot telematics program can significantly reduce premiums for safe drivers.' },
    { name:'State Farm', badge:'Best for bundling', desc:'Largest US auto insurer. Excellent bundling discounts with homeowners. Strong agent network for in-person service.' },
  ]},
  { category:'Home & Renters Insurance', color:'#22c55e', providers:[
    { name:'Lemonade', badge:'Best for renters', desc:'AI-powered, instant renters and homeowners coverage. Renters policies from $5/mo. Digital-first experience. B Corp certified.' },
    { name:'Policygenius', badge:'Best for homeowners comparison', desc:'Compares homeowners rates from top carriers. Especially strong if you want to bundle home + auto quotes.' },
  ]},
  { category:'Long-Term Care', color:'#8b5cf6', providers:[
    { name:'AALTCI (American Association for LTC Insurance)', badge:'Best educational resource', desc:'Independent trade association providing LTC insurance education, comparison resources, and cost data by state.' },
    { name:'Mutual of Omaha', badge:'Best LTC provider', desc:'One of the largest LTC insurance providers with strong financial stability ratings. Offers traditional and hybrid policies.' },
  ]},
];

function ResourcesTab() {
  return (
    <div>
      <div style={{ padding:'0.875rem 1rem', background:'rgba(0,180,198,0.06)', border:'1px solid rgba(0,180,198,0.2)', borderRadius:12, marginBottom:'1.25rem', display:'flex', gap:10 }}>
        <Info size={15} color={TEAL} style={{ flexShrink:0, marginTop:1 }}/>
        <p style={{ margin:0, fontSize:'0.875rem', color:T2, lineHeight:1.7, fontFamily:UI }}>
          <strong>Always compare quotes</strong> from multiple providers before buying. Premiums for the same coverage can vary 30–50% between insurers. Use independent comparison tools rather than going directly to one carrier.
        </p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
        {RESOURCES.map(cat => (
          <div key={cat.category}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'0.75rem' }}>
              <div style={{ width:10, height:10, borderRadius:3, background:cat.color }}/>
              <span style={{ fontFamily:DISP, fontWeight:700, color:NAVY, fontSize:'1rem' }}>{cat.category}</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
              {cat.providers.map(p => (
                <div key={p.name} style={{ background:SURF, border:`1px solid ${B1}`, borderRadius:12, padding:'0.875rem 1.125rem', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <span style={{ fontFamily:DISP, fontWeight:700, color:NAVY, fontSize:'0.9375rem' }}>{p.name}</span>
                    <span style={{ padding:'2px 9px', background:`${cat.color}15`, border:`1px solid ${cat.color}30`, borderRadius:100, fontSize:'0.6875rem', fontWeight:700, color:cat.color, fontFamily:UI }}>{p.badge}</span>
                  </div>
                  <p style={{ margin:0, fontSize:'0.875rem', color:T2, lineHeight:1.65, fontFamily:UI }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   RIDERS GUIDE
══════════════════════════════════════════════════════════════════ */
const RIDERS = [
  {
    name: 'Waiver of Premium', cost: '+5–15%', color: '#3b82f6',
    who: 'Anyone with a physically demanding job or disability risk',
    desc: 'If you become totally disabled and unable to work, the insurance company waives your premiums — keeping your policy in force at no cost to you.',
    good: ['Keeps coverage active during disability', 'Premiums waived — significant savings', 'No impact to death benefit'],
    bad: ['Added cost', 'Strict disability definition required', 'Limited to under certain ages'],
  },
  {
    name: 'Accelerated Death Benefit', cost: 'Usually free', color: '#22c55e',
    who: 'Everyone — this should always be included',
    desc: 'If diagnosed with a terminal illness (typically 12–24 month life expectancy), you can access a portion of your death benefit while still alive to cover medical expenses and end-of-life costs.',
    good: ['Usually included at no charge', 'Access benefits when you need them most', 'Can cover home care, hospice, or treatment'],
    bad: ['Reduces death benefit paid to family', 'Taxable in some situations', 'Definition of terminal illness varies by carrier'],
  },
  {
    name: 'Child Term Rider', cost: '+$5–25/mo', color: TEAL,
    who: 'Parents with young children',
    desc: 'Provides a small death benefit for all children under one affordable rider on the parent\'s policy. Typically convertible to a permanent policy when the child reaches adulthood with no medical exam.',
    good: ['Covers all current and future children', 'Affordable — one rider covers all kids', 'Convertible to permanent at adulthood'],
    bad: ['Low coverage amount (typically $10K–$25K)', 'Terminates when children reach adulthood'],
  },
  {
    name: 'Accidental Death Benefit', cost: '+$5–30/mo', color: '#f59e0b',
    who: 'Active individuals, frequent travelers, high-risk occupations',
    desc: 'Doubles (or sometimes triples) the death benefit if death occurs due to a covered accident. Also called a \'double indemnity\' rider.',
    good: ['Doubles payout for accidental death', 'Very affordable addition', 'Provides extra protection for young families'],
    bad: ['Only covers accidents — not illness', 'Many exclusions (war, aviation, extreme sports)', 'Most deaths are from illness, not accidents'],
  },
  {
    name: 'Return of Premium', cost: '+50–100% more', color: '#8b5cf6',
    who: "People who want coverage with a 'safety net'",
    desc: 'If you outlive your term policy, all premiums paid are returned to you. Turns life insurance into a forced savings vehicle — you either get a death benefit or your money back.',
    good: ['Premiums returned if you outlive term', "'Win either way' value proposition", 'Forces savings discipline'],
    bad: ['Significantly higher premiums', 'Better returns available by investing the difference', 'Money returned with no interest'],
  },
  {
    name: 'Long Term Care Rider', cost: '+$50–200/mo', color: '#c9a96e',
    who: 'Ages 45+ planning for retirement',
    desc: 'Allows you to accelerate your death benefit to pay for long-term care costs if you cannot perform two of six Activities of Daily Living (ADLs). Combines life insurance and LTC coverage in one policy.',
    good: ['Covers nursing home and home care costs', 'Premiums may be tax-deductible', 'Avoids a separate expensive LTC policy'],
    bad: ['Complex and expensive', 'Reduces death benefit when used', 'Underwriting requirements'],
  },
  {
    name: 'Guaranteed Insurability', cost: '+$20–60/mo', color: '#ef4444',
    who: 'Young people who may need more coverage later',
    desc: 'Allows you to purchase additional coverage at specified future dates (marriage, childbirth, age milestones) without a new medical exam — regardless of health changes.',
    good: ['Buy more coverage without a medical exam', 'Critical if your health may deteriorate', 'Locks in your insurability'],
    bad: ['Limited to specific option dates', 'Coverage amounts per option are limited', 'Added cost even if never used'],
  },
  {
    name: 'Term Conversion', cost: 'Usually free', color: TEAL,
    who: 'Anyone with a term policy under age 60',
    desc: 'Allows you to convert part or all of your term policy to a permanent policy before the conversion deadline — without a new medical exam. Extremely valuable if your health changes.',
    good: ['Locked in regardless of health changes', 'Usually included at no extra cost', 'Maintains insurability for life'],
    bad: ['Must convert before deadline (varies by carrier)', 'Permanent policy will cost significantly more', 'Available policies at conversion may be limited'],
  },
];

function RiderCard({ rider }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border:`1.5px solid ${rider.color}30`, borderRadius:12, overflow:'hidden', marginBottom:'0.75rem' }}>
      <div style={{ height:2, background:`linear-gradient(90deg, ${rider.color} 0%, transparent 80%)` }} />
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', background:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
          <span style={{ fontSize:'0.6875rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:rider.color, background:`${rider.color}18`, border:`1px solid ${rider.color}35`, borderRadius:5, padding:'2px 8px', flexShrink:0 }}>
            {rider.cost}
          </span>
          <div style={{ minWidth:0 }}>
            <span style={{ fontFamily:DISP, fontSize:'1rem', fontWeight:700, color:NAVY, letterSpacing:'-0.01em', display:'block' }}>{rider.name}</span>
            <span style={{ fontSize:'0.8125rem', color:T3, fontFamily:UI }}>{rider.who}</span>
          </div>
        </div>
        <ChevronDown size={16} color={T3} style={{ flexShrink:0, transform:open?'rotate(180deg)':'rotate(0deg)', transition:'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{ padding:'0 1.25rem 1.25rem' }}>
          <p style={{ margin:'0 0 1rem', fontSize:'0.875rem', color:T2, lineHeight:1.65, fontFamily:UI }}>{rider.desc}</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div>
              <div style={{ fontSize:'0.6875rem', fontWeight:700, color:'#22c55e', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>Benefits</div>
              {rider.good.map((g, i) => (
                <div key={i} style={{ display:'flex', gap:7, marginBottom:'0.375rem' }}>
                  <CheckCircle2 size={12} color='#22c55e' style={{ flexShrink:0, marginTop:2 }}/>
                  <span style={{ fontSize:'0.8125rem', color:T2, lineHeight:1.6, fontFamily:UI }}>{g}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:'0.6875rem', fontWeight:700, color:'#f59e0b', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>Considerations</div>
              {rider.bad.map((b, i) => (
                <div key={i} style={{ display:'flex', gap:7, marginBottom:'0.375rem' }}>
                  <AlertCircle size={12} color='#f59e0b' style={{ flexShrink:0, marginTop:2 }}/>
                  <span style={{ fontSize:'0.8125rem', color:T2, lineHeight:1.6, fontFamily:UI }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RidersTab() {
  return (
    <div>
      <SectionCard
        title="Policy Riders Guide"
        subtitle="Riders are optional add-ons that customize your life insurance policy. Click any rider to see full details, costs, and who it's best for."
      >
        {RIDERS.map(r => <RiderCard key={r.name} rider={r} />)}
      </SectionCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
const INSURANCE_TYPES = [
  { id:'life',       label:'Life',        icon: Heart         },
  { id:'health',     label:'Health',      icon: Activity      },
  { id:'auto',       label:'Auto',        icon: Car           },
  { id:'home',       label:'Home',        icon: Home          },
  { id:'ltc',        label:'LTC',         icon: Clock         },
  { id:'disability', label:'Disability',  icon: Shield        },
  { id:'education',  label:'Education',   icon: GraduationCap },
  { id:'riders',     label:'Riders Guide',icon: BookOpen      },
];

/* ══════════════════════════════════════════════════════════════════
   PREMIUM CALCULATOR
══════════════════════════════════════════════════════════════════ */
const MONO = "'JetBrains Mono', 'Courier New', monospace";
const fc = n => { const a = Math.abs(n||0); if (a>=1e6) return '$'+(n/1e6).toFixed(2)+'M'; if (a>=1e3) return '$'+(n/1e3).toFixed(1)+'K'; return '$'+Math.round(n||0).toLocaleString(); };
const fm = n => '$'+(n||0).toFixed(2)+'/mo';

const POLICY_COLORS = { term:PBLUE, whole:PGOLD, universal:PPURPLE, iul:PGREEN };

function PremiumStatCard({ label, value, color }) {
  return (
    <div style={{ background:SURF, border:`1px solid ${B2}`, borderRadius:12, padding:'1rem 1.25rem' }}>
      <div style={{ fontFamily:UI, fontSize:'0.6875rem', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:MONO, fontSize:'1.375rem', fontWeight:900, color, lineHeight:1 }}>{value}</div>
    </div>
  );
}

function PremiumCalculatorTab() {
  const [coverage,    setCoverage]    = useState(500000);
  const [age,         setAge]         = useState(35);
  const [termYears,   setTermYears]   = useState(20);
  const [healthClass, setHealthClass] = useState('Preferred');
  const [isSmoker,    setIsSmoker]    = useState(false);
  const [pType,       setPType]       = useState('term');

  const monthly    = estimatePremium(coverage, age, isSmoker, healthClass, pType, termYears);
  const annual     = monthly * 12;
  const totalPaid  = pType === 'term' ? monthly * termYears * 12 : monthly * 12 * 20;
  const costPer1k  = ((monthly * 12) / (coverage / 1000)).toFixed(2);

  const CARRIERS = [
    { name:'Banner Life',        mult:1.00 },
    { name:'Protective Life',    mult:1.02 },
    { name:'Pacific Life',       mult:1.05 },
    { name:'Prudential',         mult:1.08 },
    { name:'Lincoln Financial',  mult:1.10 },
    { name:'Northwestern Mutual',mult:1.15 },
    { name:'New York Life',      mult:1.18 },
    { name:'MassMutual',         mult:1.20 },
  ];
  const carrierData = CARRIERS.map(c => ({ name:c.name.split(' ')[0], est:Math.round(monthly * c.mult) }));

  const ageData  = [25,30,35,40,45,50,55,60].map(a => ({ age:a, premium:estimatePremium(coverage, a, isSmoker, healthClass, pType, termYears) }));
  const waitData = [0,1,2,3,5].map(w => ({ wait:`+${w}yr`, monthly:estimatePremium(coverage, age+w, isSmoker, healthClass, pType, termYears) }));
  const waitColors = ['#4caf7d','#c9a84c','#c9a84c','#e07c3a','#c0392b'];

  const Slider = ({ label, value, onChange, min, max, step=1, fmt=v=>v }) => (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontFamily:UI, fontSize:'0.6875rem', color:T3, marginBottom:4 }}>
        <span>{label}</span>
        <span style={{ color:TEAL, fontWeight:700, fontFamily:MONO }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width:'100%', accentColor:TEAL, cursor:'pointer' }}
      />
      <div style={{ display:'flex', justifyContent:'space-between', fontFamily:MONO, fontSize:'0.625rem', color:T3, marginTop:2 }}>
        <span>{fmt(min)}</span><span>{fmt(max)}</span>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'1.25rem', alignItems:'start' }}>

        {/* Controls */}
        <div style={{ background:SURF, border:`1px solid ${B2}`, borderRadius:16, padding:'1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ fontFamily:UI, fontSize:'0.75rem', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em' }}>Calculator Inputs</div>

          {/* Policy type */}
          <div>
            <div style={{ fontFamily:UI, fontSize:'0.6875rem', color:T3, marginBottom:6 }}>Policy Type</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem' }}>
              {Object.entries({ term:'Term', whole:'Whole', universal:'Universal', iul:'IUL' }).map(([k,v]) => (
                <button key={k} onClick={() => setPType(k)} style={{
                  padding:'4px 12px', borderRadius:99, cursor:'pointer', fontFamily:UI, fontSize:'0.75rem',
                  border:`1px solid ${pType===k ? POLICY_COLORS[k] : B2}`,
                  background: pType===k ? POLICY_COLORS[k]+'22' : 'transparent',
                  color: pType===k ? POLICY_COLORS[k] : T3,
                  fontWeight: pType===k ? 700 : 400,
                }}>{v}</button>
              ))}
            </div>
          </div>

          <Slider label="Coverage Amount" value={coverage} onChange={setCoverage} min={100000} max={5000000} step={50000} fmt={fc} />
          <Slider label="Your Age" value={age} onChange={setAge} min={18} max={75} fmt={v => v+' yrs'} />
          {pType === 'term' && <Slider label="Term Length" value={termYears} onChange={setTermYears} min={10} max={30} step={5} fmt={v => v+' yrs'} />}

          {/* Health class */}
          <div>
            <div style={{ fontFamily:UI, fontSize:'0.6875rem', color:T3, marginBottom:6 }}>Health Class</div>
            <select value={healthClass} onChange={e => setHealthClass(e.target.value)} style={{ width:'100%', background:RAISE, border:`1.5px solid ${B2}`, borderRadius:8, padding:'8px 10px', fontFamily:UI, fontSize:'0.8125rem', color:NAVY, outline:'none' }}>
              {['Preferred Plus','Preferred','Standard Plus','Standard','Substandard'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Smoker toggle */}
          <div style={{ display:'flex', gap:'0.5rem' }}>
            {['Non-Smoker','Smoker'].map(s => {
              const sel = (s==='Smoker')===isSmoker;
              return (
                <button key={s} onClick={() => setIsSmoker(s==='Smoker')} style={{
                  flex:1, padding:'6px', borderRadius:8, cursor:'pointer', fontFamily:UI, fontSize:'0.75rem',
                  border:`1px solid ${sel ? '#c0392b' : B2}`,
                  background: sel ? 'rgba(192,57,43,0.15)' : 'transparent',
                  color: sel ? '#c0392b' : T3, fontWeight: sel ? 700 : 400,
                }}>{s}</button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'0.625rem' }}>
            <PremiumStatCard label="Monthly Premium"   value={fm(monthly)}    color={PGREEN}  />
            <PremiumStatCard label="Annual Premium"    value={fc(annual)}     color={PGOLD}   />
            <PremiumStatCard label={`Total Paid (${pType==='term' ? termYears+'yr' : '20yr est.'})`} value={fc(totalPaid)} color={PBLUE} />
            <PremiumStatCard label="Cost per $1K Coverage" value={'$'+costPer1k} color={TEAL} />
          </div>

          {/* Carrier comparison */}
          <div style={{ background:SURF, border:`1px solid ${B2}`, borderRadius:16, padding:'1.25rem' }}>
            <div style={{ fontFamily:UI, fontSize:'0.75rem', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.75rem' }}>Estimated Carrier Comparison</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={carrierData} margin={{ left:-10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={B2} />
                <XAxis dataKey="name" tick={{ fontSize:9, fill:T3 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:T3 }} axisLine={false} tickLine={false} tickFormatter={v => '$'+v} />
                <Tooltip content={<PolicyCustomTip />} />
                <Bar dataKey="est" name="Est. Monthly" radius={[3,3,0,0]}>
                  {carrierData.map((_,i) => <Cell key={i} fill={i===0 ? PGREEN : PBLUE} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ fontFamily:UI, fontSize:'0.6875rem', color:T3, marginTop:'0.4rem' }}>* Estimated rates only. Actual quotes require underwriting. Get multiple quotes before buying.</div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
            {/* Cost of waiting */}
            <div style={{ background:SURF, border:`1px solid ${B2}`, borderRadius:16, padding:'1.25rem' }}>
              <div style={{ fontFamily:UI, fontSize:'0.75rem', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.75rem' }}>Cost of Waiting</div>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={waitData} margin={{ left:-10 }}>
                  <XAxis dataKey="wait" tick={{ fontSize:9, fill:T3 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<PolicyCustomTip />} />
                  <Bar dataKey="monthly" name="Monthly Premium" radius={[3,3,0,0]}>
                    {waitData.map((_,i) => <Cell key={i} fill={waitColors[i] || PORANGE} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Premium by age */}
            <div style={{ background:SURF, border:`1px solid ${B2}`, borderRadius:16, padding:'1.25rem' }}>
              <div style={{ fontFamily:UI, fontSize:'0.75rem', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.75rem' }}>Premium by Age</div>
              <ResponsiveContainer width="100%" height={130}>
                <LineChart data={ageData} margin={{ left:-10 }}>
                  <XAxis dataKey="age" tick={{ fontSize:9, fill:T3 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<PolicyCustomTip />} />
                  <ReferenceLine x={age} stroke={PGOLD} strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="premium" name="Monthly" stroke={PBLUE} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   GROWTH PROJECTOR
══════════════════════════════════════════════════════════════════ */
function GrowthProjectorTab() {
  const [age,        setAge]        = useState(35);
  const [coverage,   setCoverage]   = useState(500000);
  const [projYears,  setProjYears]  = useState(30);
  const [returnRate, setReturnRate] = useState(8);

  const termMonthly  = estimatePremium(coverage, age, false, 'Preferred', 'term',      20);
  const wholeMonthly = estimatePremium(coverage, age, false, 'Preferred', 'whole');
  const iulMonthly   = estimatePremium(coverage, age, false, 'Preferred', 'iul');
  const univMonthly  = estimatePremium(coverage, age, false, 'Preferred', 'universal');
  const wholeAnnual  = wholeMonthly * 12;
  const iulAnnual    = iulMonthly   * 12;
  const termAnnual   = termMonthly  * 12;
  const diffAnnual   = wholeAnnual  - termAnnual;

  const projectionData = useMemo(() => Array.from({ length: projYears + 1 }, (_, yr) => {
    const wholeCV = yr < 2
      ? wholeAnnual * yr * 0.08
      : wholeAnnual * 0.35 * ((Math.pow(1.045, yr - 1) - 1) / 0.045) + wholeAnnual * yr * 0.12;
    const iulCV = yr < 2
      ? iulAnnual * yr * 0.05
      : iulAnnual * 0.45 * ((Math.pow(1.07, yr - 1) - 1) / 0.07);
    const btid = diffAnnual > 0
      ? diffAnnual * ((Math.pow(1 + returnRate / 100, yr) - 1) / (returnRate / 100))
      : 0;
    return { year:yr, age:age+yr, whole:Math.round(Math.max(0,wholeCV)), iul:Math.round(Math.max(0,iulCV)), btid:Math.round(Math.max(0,btid)) };
  }), [age, coverage, projYears, returnRate, wholeAnnual, iulAnnual, diffAnnual]);

  const breakEvenWhole = projectionData.find(d => d.year > 0 && d.btid > d.whole);
  const breakEvenIUL   = projectionData.find(d => d.year > 0 && d.btid > d.iul);
  const finalYear      = projectionData[projectionData.length - 1];

  const GSlider = ({ label, value, onChange, min, max, step=1, fmt=v=>v }) => (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontFamily:UI, fontSize:'0.6875rem', color:T3, marginBottom:4 }}>
        <span>{label}</span><span style={{ color:TEAL, fontWeight:700, fontFamily:MONO }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width:'100%', accentColor:TEAL, cursor:'pointer' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', fontFamily:MONO, fontSize:'0.625rem', color:T3, marginTop:2 }}>
        <span>{fmt(min)}</span><span>{fmt(max)}</span>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <p style={{ fontFamily:UI, fontSize:'0.875rem', color:T3, margin:0, lineHeight:1.65 }}>
        Compare how cash value builds in permanent policies vs investing the premium difference in the market. Values are educational estimates — not guaranteed illustrations.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'1.25rem', alignItems:'start' }}>
        {/* Controls */}
        <div style={{ background:SURF, border:`1px solid ${B2}`, borderRadius:16, padding:'1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ fontFamily:UI, fontSize:'0.75rem', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em' }}>Inputs</div>
          <GSlider label="Current Age"                  value={age}        onChange={setAge}        min={25} max={60}      fmt={v => v+' yrs'} />
          <GSlider label="Coverage Amount"              value={coverage}   onChange={setCoverage}   min={100000} max={2000000} step={50000} fmt={fc} />
          <GSlider label="Projection Period"            value={projYears}  onChange={setProjYears}  min={10} max={40}      fmt={v => v+' yrs'} />
          <GSlider label="Market Return (invest scenario)" value={returnRate} onChange={setReturnRate} min={4} max={12}   fmt={v => v+'%'} />

          <div style={{ borderTop:`1px solid ${B1}`, paddingTop:'0.75rem', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
            <div style={{ fontFamily:UI, fontSize:'0.6875rem', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Est. Monthly Premiums</div>
            {[
              { label:'Term (20-yr)',    monthly:termMonthly,  color:PBLUE   },
              { label:'Universal Life', monthly:univMonthly,  color:PPURPLE },
              { label:'IUL',            monthly:iulMonthly,   color:PGREEN  },
              { label:'Whole Life',     monthly:wholeMonthly, color:PGOLD   },
            ].map(p => (
              <div key={p.label} style={{ display:'flex', justifyContent:'space-between', fontFamily:UI, fontSize:'0.75rem' }}>
                <span style={{ color:p.color }}>{p.label}</span>
                <span style={{ color:T2, fontFamily:MONO }}>{fm(p.monthly)}</span>
              </div>
            ))}
            {diffAnnual > 0 && (
              <div style={{ marginTop:'0.25rem', padding:'0.5rem 0.6rem', background:`${PBLUE}18`, borderRadius:6, fontFamily:UI, fontSize:'0.75rem', color:PBLUE }}>
                Term vs Whole savings: <strong>{fm(wholeMonthly - termMonthly)}/mo</strong> to invest
              </div>
            )}
          </div>
        </div>

        {/* Charts + KPIs */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          <div style={{ background:SURF, border:`1px solid ${B2}`, borderRadius:16, padding:'1.25rem' }}>
            <div style={{ fontFamily:UI, fontSize:'0.75rem', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.75rem' }}>
              PROJECTED VALUE OVER {projYears} YEARS
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={projectionData} margin={{ left:-10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={B2} />
                <XAxis dataKey="age" tick={{ fontSize:10, fill:T3 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:T3 }} axisLine={false} tickLine={false} tickFormatter={v => fc(v)} />
                <Tooltip content={<PolicyCustomTip />} />
                <Legend wrapperStyle={{ fontSize:'0.7rem', color:T2 }} />
                <Line type="monotone" dataKey="whole" name="Whole Life CV"             stroke={PGOLD}  strokeWidth={2}   dot={false} />
                <Line type="monotone" dataKey="iul"   name="IUL Cash Value"            stroke={PGREEN} strokeWidth={2}   dot={false} />
                <Line type="monotone" dataKey="btid"  name={`Term + Invest (${returnRate}%)`} stroke={PBLUE} strokeWidth={2.5} dot={false} strokeDasharray="6 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.625rem' }}>
            <PremiumStatCard label={`Whole Life (yr ${projYears})`}     value={fc(finalYear.whole)} color={PGOLD}  />
            <PremiumStatCard label={`IUL (yr ${projYears})`}            value={fc(finalYear.iul)}   color={PGREEN} />
            <PremiumStatCard label={`Term+Invest (yr ${projYears})`}    value={fc(finalYear.btid)}  color={PBLUE}  />
          </div>

          {/* Break-even */}
          <div style={{ background:SURF, border:`1px solid ${B2}`, borderRadius:16, padding:'1.25rem' }}>
            <div style={{ fontFamily:UI, fontSize:'0.75rem', fontWeight:700, color:NAVY, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.75rem' }}>Break-Even Analysis</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'0.75rem' }}>
              {[
                { label:'Term + Invest overtakes Whole Life', data:breakEvenWhole, refColor:PGOLD  },
                { label:'Term + Invest overtakes IUL',        data:breakEvenIUL,   refColor:PGREEN },
              ].map(({ label, data, refColor }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.6rem 0.75rem', background:RAISE, borderRadius:8, border:`1px solid ${data ? PBLUE : refColor}30` }}>
                  <span style={{ fontFamily:UI, fontSize:'0.8125rem', color:T2 }}>{label}</span>
                  <span style={{ fontFamily:MONO, fontWeight:900, color:data ? PBLUE : refColor, fontSize:'0.875rem' }}>
                    {data ? `Year ${data.year} (age ${data.age})` : `Not within ${projYears} yrs`}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              <div style={{ padding:'0.75rem 1rem', background:`${PBLUE}18`, borderRadius:8, border:`1px solid ${PBLUE}38`, fontFamily:UI, fontSize:'0.8125rem', color:T2, lineHeight:1.5 }}>
                <strong style={{ color:PBLUE }}>If you invest the difference:</strong> Term + investing typically wins long-term at market returns. Works best for disciplined investors who will actually invest every month.
              </div>
              <div style={{ padding:'0.75rem 1rem', background:`${PGOLD}18`, borderRadius:8, border:`1px solid ${PGOLD}38`, fontFamily:UI, fontSize:'0.8125rem', color:T2, lineHeight:1.5 }}>
                <strong style={{ color:PGOLD }}>If you won't invest the difference:</strong> Whole life acts as forced savings. The guaranteed cash value is better than nothing invested — which is what most people actually do.
              </div>
            </div>
          </div>

          {/* Year-by-year snapshot table */}
          <div style={{ background:SURF, border:`1px solid ${B2}`, borderRadius:16, padding:'1.25rem' }}>
            <div style={{ fontFamily:UI, fontSize:'0.75rem', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.75rem' }}>Year-by-Year Snapshot</div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', minWidth:420, borderCollapse:'collapse', fontFamily:UI }}>
                <thead>
                  <tr style={{ borderBottom:`2px solid ${B2}`, background:RAISE }}>
                    {[['Year',T3],['Age',T3],['Whole Life CV',PGOLD],['IUL CV',PGREEN],['Term + Invest',PBLUE]].map(([h,c]) => (
                      <th key={h} style={{ padding:'0.5rem 0.75rem', textAlign:'left', fontSize:'0.75rem', fontWeight:700, color:c, textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projectionData.filter(d => d.year > 0 && d.year % 5 === 0).map((d,i) => (
                    <tr key={d.year} style={{ borderBottom:`1px solid ${B1}`, background:i%2===0?RAISE:SURF }}>
                      <td style={{ padding:'0.625rem 0.75rem', color:T3,   fontSize:'0.8125rem' }}>{d.year}</td>
                      <td style={{ padding:'0.625rem 0.75rem', color:T2,   fontSize:'0.8125rem' }}>{d.age}</td>
                      <td style={{ padding:'0.625rem 0.75rem', color:PGOLD,  fontFamily:MONO, fontWeight:700, fontSize:'0.8125rem' }}>{fc(d.whole)}</td>
                      <td style={{ padding:'0.625rem 0.75rem', color:PGREEN, fontFamily:MONO, fontWeight:700, fontSize:'0.8125rem' }}>{fc(d.iul)}</td>
                      <td style={{ padding:'0.625rem 0.75rem', color:PBLUE,  fontFamily:MONO, fontWeight:700, fontSize:'0.8125rem' }}>{fc(d.btid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ACTION PLAN
══════════════════════════════════════════════════════════════════ */
const PRED = '#c0392b';

function ActionPlanTab() {
  const [age,    setAge]    = useState(35);
  const [income, setIncome] = useState(75000);
  const hasCoverage = false;
  const gap = income * 10;

  const LIFE_STAGES = [
    { age:'25–34', abbr:'EC', label:'Early Career',       coverage:'5–7× income',         why:'Starting out, may have student debt and first dependents. Cheapest time to buy.' },
    { age:'35–44', abbr:'FB', label:'Family Building',    coverage:'10–12× income',        why:'Peak dependency years. Mortgage, children\'s education, spouse income replacement at maximum need.' },
    { age:'45–54', abbr:'WA', label:'Wealth Accumulation',coverage:'8–10× income',         why:'Debts declining, wealth building. Consider permanent coverage for estate planning.' },
    { age:'55–64', abbr:'PR', label:'Pre-Retirement',     coverage:'5–8× income',          why:'Final working years. Ensure retirement isn\'t derailed if you die prematurely.' },
    { age:'65+',   abbr:'RE', label:'Retirement',         coverage:'Final expense + estate',why:'If self-insured, small final expense or permanent policy for estate transfer may be all that\'s needed.' },
  ];

  const steps = [
    { p:'CRITICAL', text:`Close your ${fc(gap)} estimated coverage gap`, detail:'Based on 10× income rule. Get quotes from multiple carriers today.', color:PRED },
    ...(!hasCoverage ? [{ p:'CRITICAL', text:'Get life insurance coverage as soon as possible', detail:'Every day without coverage is a risk to your family\'s financial security.', color:PRED }] : []),
    { p:'HIGH',     text:'Get quotes from at least 3 different carriers',            detail:'Premiums vary 30–50% between carriers for the same coverage. Always compare.',                           color:PORANGE },
    { p:'HIGH',     text:'Have a licensed independent broker shop your case',        detail:'Independent brokers represent multiple companies and can find you the best rate for your health profile.', color:PORANGE },
    { p:'MEDIUM',   text:'Gather these documents before applying',                   detail:'Driver\'s license, SSN, beneficiary information, existing policy details, physician contact info, list of medications.', color:PGOLD },
    { p:'MEDIUM',   text:'Review and update beneficiary designations annually',      detail:'After marriage, divorce, or birth of a child — your beneficiary designations must be updated.',          color:PGOLD },
    { p:'STANDARD', text:'Ask these questions before buying',                        detail:'Is the carrier AM Best rated A or better? What\'s the conversion privilege on term? What riders are included? What\'s the free-look period?', color:PBLUE },
    { p:'STANDARD', text:'Schedule an annual policy review',                         detail:'Life changes. Review your coverage every year or after any major life event.',                             color:PBLUE },
  ];

  const exportPlan = () => {
    const html = `<!DOCTYPE html><html><head><title>Life Insurance Action Plan</title><style>body{font-family:Arial,sans-serif;background:#1a1410;color:#f0e8d8;max-width:900px;margin:40px auto;padding:20px}h1{color:#c9a96e}h2{color:#4c9fcf;border-bottom:1px solid #3d3028;padding-bottom:8px}table{width:100%;border-collapse:collapse}td,th{padding:8px 12px;border:1px solid #3d3028;font-size:13px}th{background:#2d2419;color:#c9a96e}</style></head><body>
    <h1>Life Insurance Action Plan</h1><p>Generated: ${new Date().toLocaleDateString()} · Age: ${age} · Annual Income: ${fc(income)}</p>
    <h2>Action Steps</h2>${steps.map(s => `<p><strong>[${s.p}]</strong> ${s.text}<br><small style="color:#a89070">${s.detail}</small></p>`).join('')}
    <h2>Coverage by Life Stage</h2><table><tr><th>Age Range</th><th>Stage</th><th>Recommended Coverage</th><th>Why</th></tr>
    ${LIFE_STAGES.map(s => `<tr><td>${s.age}</td><td>${s.label}</td><td>${s.coverage}</td><td>${s.why}</td></tr>`).join('')}</table>
    <p style="margin-top:40px;font-size:11px;color:#6b5540">For educational purposes only. Not insurance advice. Work with a licensed insurance professional.</p></body></html>`;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([html], { type:'text/html' })); a.download = 'life-insurance-action-plan.html'; a.click();
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      {/* Inputs */}
      <div style={{ background:SURF, border:`1px solid ${B2}`, borderRadius:16, padding:'1.25rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:UI, fontSize:'0.6875rem', color:T3, marginBottom:4 }}>
            <span>Your Age</span><span style={{ color:TEAL, fontFamily:MONO, fontWeight:700 }}>{age} yrs</span>
          </div>
          <input type="range" min={22} max={75} value={age} onChange={e => setAge(Number(e.target.value))} style={{ width:'100%', accentColor:TEAL, cursor:'pointer' }}/>
        </div>
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:UI, fontSize:'0.6875rem', color:T3, marginBottom:4 }}>
            <span>Annual Income</span><span style={{ color:TEAL, fontFamily:MONO, fontWeight:700 }}>{fc(income)}</span>
          </div>
          <input type="range" min={25000} max={500000} step={5000} value={income} onChange={e => setIncome(Number(e.target.value))} style={{ width:'100%', accentColor:TEAL, cursor:'pointer' }}/>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily:UI, fontSize:'0.75rem', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em' }}>Your Action Steps</div>
        <button onClick={exportPlan} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'transparent', border:`1px solid ${B2}`, borderRadius:8, fontFamily:UI, fontSize:'0.8125rem', color:T2, cursor:'pointer' }}>
          <Download size={13}/> Export Plan
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
        {steps.map((s,i) => (
          <div key={i} style={{ display:'flex', gap:'1rem', padding:'0.875rem 1.125rem', background:`${s.color}0c`, borderRadius:10, border:`1px solid ${s.color}28`, alignItems:'flex-start' }}>
            <span style={{ flexShrink:0, padding:'2px 8px', borderRadius:99, background:`${s.color}22`, border:`1px solid ${s.color}44`, fontFamily:UI, fontSize:'0.625rem', fontWeight:700, color:s.color, letterSpacing:'0.06em', textTransform:'uppercase', marginTop:2 }}>{s.p}</span>
            <div>
              <div style={{ fontFamily:UI, fontSize:'0.875rem', fontWeight:700, color:NAVY, marginBottom:3 }}>{s.text}</div>
              <div style={{ fontFamily:UI, fontSize:'0.8125rem', color:T3, lineHeight:1.55 }}>{s.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Life stage timeline */}
      <div style={{ background:SURF, border:`1px solid ${B2}`, borderRadius:16, padding:'1.25rem' }}>
        <div style={{ fontFamily:UI, fontSize:'0.75rem', fontWeight:700, color:NAVY, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'1rem' }}>Coverage by Life Stage</div>
        <div style={{ display:'flex', gap:0, position:'relative' }}>
          <div style={{ position:'absolute', top:20, left:'10%', right:'10%', height:2, background:B2 }} />
          {LIFE_STAGES.map(s => {
            const startAge = parseInt(s.age);
            const endAge   = parseInt(s.age.split('–')[1] || '99');
            const inStage  = age >= startAge && age <= endAge;
            return (
              <div key={s.age} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem', position:'relative', zIndex:1 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:inStage ? `${TEAL}22` : RAISE, border:`2px solid ${inStage ? TEAL : B2}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:UI, fontSize:'0.625rem', fontWeight:800, color:inStage ? TEAL : T3, letterSpacing:'0.04em' }}>{s.abbr}</div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:UI, fontSize:'0.6875rem', fontWeight:700, color:inStage ? TEAL : T3 }}>{s.age}</div>
                  <div style={{ fontFamily:UI, fontSize:'0.6875rem', color:inStage ? NAVY : T3, fontWeight:inStage?700:400 }}>{s.label}</div>
                  <div style={{ fontFamily:UI, fontSize:'0.625rem', color:PGREEN }}>{s.coverage}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ fontFamily:UI, fontSize:'0.6875rem', color:T3, textAlign:'center', lineHeight:1.6, margin:0 }}>
        For educational purposes only. Not insurance advice. Work with a licensed insurance professional.
      </p>
    </div>
  );
}

const CALC_TABS = [
  { id:'dime',      label:'DIME Method'        },
  { id:'auto',      label:'Auto Deductible'    },
  { id:'premium',   label:'Premium Calculator' },
  { id:'growth',    label:'Growth Projector'   },
];

const MAIN_TABS = [
  { id:'learn',     label:'Learn',       icon: BookOpen    },
  { id:'calc',      label:'Calculate',   icon: Calculator  },
  { id:'action',    label:'Action Plan', icon: CheckCircle },
  { id:'resources', label:'Resources',   icon: ExternalLink},
];

/* ── Education Tab ─────────────────────────────────────────────── */
const EDU_TOPICS = [
  {
    title: 'How Underwriting Works', badge: 'PROCESS', color: '#3b82f6',
    steps: [
      'Submit application with health and lifestyle info',
      'Insurance company orders medical records',
      'Possible medical exam (blood draw, height/weight, blood pressure)',
      'Underwriter reviews all information',
      'Health classification assigned (Preferred Plus → Substandard)',
      'Policy issued with your rate',
      '30-day free-look period to review and cancel',
    ],
    insight: 'Being honest on your application is critical — misrepresentation can void your policy. Contestability periods typically last 2 years.',
  },
  {
    title: 'Tax Benefits of Life Insurance', badge: 'TAXES', color: '#10b981',
    steps: [
      'Death benefit paid income-tax-free to beneficiaries (IRC §101)',
      'Cash value grows on a tax-deferred basis',
      'Policy loans are income-tax-free (not a withdrawal)',
      'LIRP strategy: fund policy to MEC limits for retirement income',
      'No RMDs required unlike IRA/401(k)',
      'Used in estate planning to pay estate taxes tax-efficiently',
    ],
    insight: 'Life insurance is one of the last remaining tax-advantaged vehicles. The death benefit bypass of income tax is one of the most powerful wealth transfer tools available.',
  },
  {
    title: 'Buy Term and Invest the Difference', badge: 'BTID', color: '#c9a96e',
    steps: [
      'Buy the largest term policy you can afford',
      'Calculate savings vs whole life premium',
      'Invest the difference in index funds (e.g., S&P 500)',
      'Over 20–30 years, investment account may dwarf whole life cash value',
      'At end of term, may be self-insured from accumulated wealth',
      'This strategy works best for disciplined investors',
    ],
    insight: "Dave Ramsey famously advocates this approach. The math often favors 'BTID' for those who will actually invest the difference. Those who won't need to consider whole life as forced savings.",
  },
  {
    title: 'Life Insurance as Retirement Income (LIRP)', badge: 'LIRP', color: '#8b5cf6',
    steps: [
      'Overfund a permanent policy (IUL or whole life) without making it a MEC',
      'Cash value accumulates tax-deferred',
      'In retirement, take tax-free loans against cash value',
      'Loans don\'t count as income — no effect on Social Security taxation',
      'No contribution limits unlike IRA or 401(k)',
      'Death benefit repays loans at death',
    ],
    insight: 'LIRPs are powerful for high earners who have maxed tax-advantaged accounts. Complexity and fees make them unsuitable for most people — consult a fee-only financial advisor.',
  },
  {
    title: 'Business Life Insurance Uses', badge: 'BUSINESS', color: '#f59e0b',
    steps: [
      'Key Man Insurance: protects business if a critical employee dies',
      'Buy-Sell Agreement Funding: funds buyout of deceased partner\'s share',
      'Executive Bonus Plan: business pays premium as deductible compensation',
      'Group Term Life: employee benefit, up to $50K tax-free',
      'COLI: company-owned life insurance for deferred compensation funding',
    ],
    insight: 'Business uses of life insurance can be highly tax-efficient. Key man and buy-sell policies protect business continuity and are essential for any business with partners or key employees.',
  },
  {
    title: 'Life Insurance Mistakes to Avoid', badge: 'CAUTION', color: '#ef4444',
    steps: [
      'Buying too little coverage (underinsuring to save on premiums)',
      'Not buying early enough (premiums double every 10 years)',
      'Naming a minor as direct beneficiary (court-appointed guardian controls)',
      'Forgetting to update beneficiaries after major life events',
      'Letting a policy lapse before replacement is in force',
      'Purchasing a policy with high surrender charges without reading terms',
      'Buying only employer-provided group term (non-portable, inadequate)',
    ],
    insight: 'The biggest mistake is having no coverage at all. Even a small policy is better than nothing. Review your coverage every 3–5 years or after any major life event.',
  },
];

function EduAccordion({ topic }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border:`1.5px solid ${topic.color}30`, borderRadius:12, overflow:'hidden', marginBottom:'0.75rem' }}>
      {/* Top accent line */}
      <div style={{ height:2, background:`linear-gradient(90deg, ${topic.color} 0%, transparent 80%)` }} />
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', background:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:'0.6875rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:topic.color, background:`${topic.color}18`, border:`1px solid ${topic.color}35`, borderRadius:5, padding:'2px 8px', flexShrink:0 }}>
            {topic.badge}
          </span>
          <span style={{ fontFamily:DISP, fontSize:'1rem', fontWeight:700, color:NAVY, letterSpacing:'-0.01em' }}>
            {topic.title}
          </span>
        </div>
        <ChevronDown size={16} color={T3} style={{ flexShrink:0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{ padding:'0 1.25rem 1.25rem' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'0.875rem' }}>
            {topic.steps.map((s, i) => (
              <div key={i} style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background:`${topic.color}18`, border:`1px solid ${topic.color}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.625rem', fontWeight:900, color:topic.color, flexShrink:0, marginTop:1 }}>
                  {i + 1}
                </div>
                <span style={{ fontSize:'0.875rem', color:T2, lineHeight:1.65, fontFamily:UI }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ padding:'0.875rem 1rem', background:`${topic.color}10`, borderRadius:10, border:`1px solid ${topic.color}28` }}>
            <div style={{ fontSize:'0.6875rem', fontWeight:700, color:topic.color, marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>Key Insight</div>
            <p style={{ margin:0, fontSize:'0.875rem', color:T2, lineHeight:1.65, fontFamily:UI }}>{topic.insight}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function EducationTab() {
  return (
    <div>
      <SectionCard
        title="Life Insurance Education Center"
        subtitle="Deep-dive topics covering how life insurance works, the tax advantages, strategies, and common pitfalls — written for CFP-level understanding."
      >
        {EDU_TOPICS.map(t => <EduAccordion key={t.title} topic={t} />)}
      </SectionCard>
    </div>
  );
}

function CalcSection() {
  const [calcTab, setCalcTab] = useState('dime');
  return (
    <div>
      {/* Sub-tab nav */}
      <div style={{ display:'flex', gap:'0.375rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {CALC_TABS.map(t => {
          const active = calcTab === t.id;
          return (
            <button key={t.id} onClick={() => setCalcTab(t.id)} style={{
              padding:'7px 16px', borderRadius:99, cursor:'pointer', fontFamily:UI, fontSize:'0.8125rem',
              border:`1.5px solid ${active ? TEAL : B2}`,
              background: active ? `${TEAL}18` : RAISE,
              color: active ? TEAL : T2,
              fontWeight: active ? 700 : 400,
              transition:'all 0.13s',
            }}>{t.label}</button>
          );
        })}
      </div>

      {calcTab === 'dime' && (
        <SectionCard title="Life Insurance Needs — DIME Method" subtitle="Calculate how much life insurance coverage your family needs using the four key components.">
          <DIMECalc/>
        </SectionCard>
      )}
      {calcTab === 'auto' && (
        <SectionCard title="Auto Insurance Deductible Break-Even" subtitle="Should you raise your deductible to lower your premium? See how long it takes to break even.">
          <AutoDeductibleCalc/>
        </SectionCard>
      )}
      {calcTab === 'premium' && (
        <SectionCard title="Life Insurance Premium Calculator" subtitle="Estimate your premium across policy types and carriers — adjust coverage, age, health class, and term length.">
          <PremiumCalculatorTab/>
        </SectionCard>
      )}
      {calcTab === 'growth' && (
        <SectionCard title="Cash Value Growth Projector" subtitle="Compare how cash value builds in permanent policies vs investing the premium difference in the market.">
          <GrowthProjectorTab/>
        </SectionCard>
      )}
    </div>
  );
}

export default function Insurance() {
  const navigate = useNavigate();
  const [tab,     setTab]     = useState('learn');
  const [insType, setInsType] = useState('life');

  const learnContent = {
    life:       <LifeInsuranceLearn/>,
    health:     <HealthInsuranceLearn/>,
    auto:       <AutoInsuranceLearn/>,
    home:       <HomeInsuranceLearn/>,
    ltc:        <LTCLearn/>,
    disability: <DisabilityLearn/>,
    education:  <EducationTab/>,
    riders:     <RidersTab/>,
  };

  const learnTitles = {
    life:       { title:'Life Insurance', sub:'Term vs whole vs universal — most people only need term life.' },
    health:     { title:'Health Insurance', sub:'HMO, PPO, HDHP — choosing the right plan for your situation.' },
    auto:       { title:'Auto Insurance', sub:'Coverage types, what\'s required, and what\'s worth carrying.' },
    home:       { title:'Homeowners & Renters Insurance', sub:'What\'s covered, what\'s not, and how coverage amounts are calculated.' },
    ltc:        { title:'Long-Term Care Insurance', sub:'What it covers, what care costs, and the ideal window to buy.' },
    disability: { title:'Disability Insurance', sub:'The most overlooked coverage — protecting your income, your most valuable asset.' },
    education:  { title:'Life Insurance Education Center', sub:'Deep-dive topics covering how life insurance works, the tax advantages, strategies, and common pitfalls.' },
    riders:     { title:'Policy Riders Guide', sub:'Riders are optional add-ons that customize your life insurance policy. Click any rider to see full details.' },
  };

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:UI }}>

      <div style={{ background:SURF, borderBottom:`1px solid `, padding:'2rem 2.5rem 0' }}>
        <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', marginBottom:'1rem', display:'flex', alignItems:'center', gap:6 }}>
          <button onClick={() => navigate('/fun')} style={{ background:'none', border:'none', cursor:'pointer', color:TEAL, fontSize:'0.75rem', fontFamily:UI, padding:0 }}>Dashboard</button>
          <ChevronRight size={12} color="rgba(255,255,255,0.25)"/>
          <span style={{ fontFamily:UI }}>Insurance Planning</span>
        </div>
        <h1 style={{ fontFamily:DISP, fontSize:'2rem', fontWeight:700, color:'#fff', margin:'0 0 0.5rem', letterSpacing:'-0.025em', lineHeight:1.2 }}>
          Insurance Planning
        </h1>
        <p style={{ margin:'0 0 1.75rem', fontSize:'1rem', color:'rgba(255,255,255,0.55)', lineHeight:1.65, maxWidth:580, fontFamily:UI }}>
          Insurance is the foundation of any financial plan. The right coverage protects everything you've built — from your income to your home to your family's future.
        </p>
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          {MAIN_TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display:'flex', alignItems:'center', gap:7, padding:'0.75rem 1.25rem',
                background:'none', border:'none', borderBottom:`2px solid ${active?TEAL:'transparent'}`,
                cursor:'pointer', fontFamily:UI, fontSize:'0.875rem',
                fontWeight:active?700:500, color:active?TEAL:'rgba(255,255,255,0.45)',
                marginBottom:-1, transition:'color 0.15s', whiteSpace:'nowrap',
              }}><Icon size={14}/>{t.label}</button>
            );
          })}
        </div>
      </div>

      <div style={{ padding:'2rem 2.5rem', maxWidth:860, margin:'0 auto' }}>

        {tab === 'learn' && (
          <>
            {/* Insurance type sub-tabs */}
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
              {INSURANCE_TYPES.map(t => {
                const Icon = t.icon;
                const active = insType === t.id;
                return (
                  <button key={t.id} onClick={() => setInsType(t.id)} style={{
                    display:'flex', alignItems:'center', gap:6,
                    padding:'6px 14px', borderRadius:100,
                    border:`1.5px solid ${active?TEAL:B2}`,
                    background: active?`${TEAL}18`:RAISE,
                    color: active?TEAL:T2,
                    fontSize:'0.8125rem', fontWeight:active?700:500,
                    cursor:'pointer', fontFamily:UI,
                    transition:'all 0.13s',
                  }}>
                    <Icon size={13}/>{t.label}
                  </button>
                );
              })}
            </div>

            {(insType === 'education' || insType === 'riders')
              ? learnContent[insType]
              : (
                <SectionCard
                  title={learnTitles[insType].title}
                  subtitle={learnTitles[insType].sub}
                >
                  {learnContent[insType]}
                </SectionCard>
              )
            }
          </>
        )}

        {tab === 'calc' && (
          <CalcSection />
        )}

        {tab === 'action' && <ActionPlanTab/>}

        {tab === 'resources' && <ResourcesTab/>}

        <div onClick={() => navigate('/fun/estate')} style={{ marginTop:'2rem', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', background:RAISE, borderRadius:12, cursor:'pointer', transition:'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity='0.88'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
          <div>
            <div style={{ fontSize:'0.6875rem', color:'rgba(255,255,255,0.4)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:3, fontFamily:UI }}>Next section</div>
            <div style={{ fontFamily:DISP, fontSize:'1rem', fontWeight:600, color:'#fff' }}>Estate Planning & Wills</div>
          </div>
          <ArrowRight size={18} color={TEAL}/>
        </div>

        <p style={{ marginTop:'2rem', fontSize:'0.6875rem', color:T3, textAlign:'center', lineHeight:1.6, fontFamily:UI }}>
          For educational purposes only — not insurance, financial, or legal advice. Consult a licensed professional.
        </p>
      </div>
    </div>
  );
}
