import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, ChevronRight, Info, CheckCircle2, XCircle,
  AlertCircle, BookOpen, Calculator, ExternalLink, ArrowRight,
  Car, DollarSign, Target, TrendingUp,
} from 'lucide-react';

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

/* ── Shared ───────────────────────────────────────────────────────── */
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

function NumInput({ label, value, onChange, prefix='$', suffix, min=0, step=1000, hint, max }) {
  return (
    <div style={{ marginBottom:'1rem' }}>
      {label && <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>{label}</label>}
      <div style={{ position:'relative' }}>
        {prefix && <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:T3, fontSize:'0.875rem', pointerEvents:'none' }}>{prefix}</span>}
        <input type="number" value={value} min={min} max={max} step={step} onChange={e => onChange(Number(e.target.value))}
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

function Pill({ text, color = '#6b7280' }) {
  return (
    <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:20, background:`${color}15`, color, fontSize:'0.7rem', fontWeight:700, fontFamily:UI, letterSpacing:'0.04em', textTransform:'uppercase' }}>{text}</span>
  );
}

function fmt(n) { return '$' + Math.round(Math.abs(n)).toLocaleString(); }

/* ══════════════════════════════════════════════════════════════════
   LEARN — HOME BUYING
══════════════════════════════════════════════════════════════════ */
function HomeBuyingLearn() {
  const mortgageTypes = [
    {
      name: '30-Year Fixed',
      color: TEAL,
      badge: 'Most common',
      summary: 'Fixed interest rate and monthly payment for 30 years. Predictable, lower monthly payments, but more interest paid over life of loan.',
      best: 'Buyers who value payment stability and plan to stay long-term. The default choice for most buyers.',
    },
    {
      name: '15-Year Fixed',
      color: '#22c55e',
      badge: 'Best rate',
      summary: 'Same predictability as 30-year but paid off in half the time. Higher monthly payment — roughly 40–50% more — but dramatically less interest paid overall.',
      best: 'Buyers with strong income who want to build equity fast and eliminate the mortgage before retirement.',
    },
    {
      name: 'Adjustable Rate Mortgage (ARM)',
      color: '#f59e0b',
      badge: 'Variable risk',
      summary: 'Lower initial rate (fixed for 3, 5, 7, or 10 years) then adjusts annually based on market index. Rate can go up significantly after the fixed period.',
      best: 'Buyers who are certain they\'ll sell or refinance before the adjustment period ends. High risk if you stay long-term.',
    },
    {
      name: 'FHA Loan',
      color: '#8b5cf6',
      badge: 'Low down payment',
      summary: 'Government-backed loan with as little as 3.5% down. More flexible credit requirements. Requires mortgage insurance premium (MIP) for the life of the loan if down payment < 10%.',
      best: 'First-time buyers with limited savings or lower credit scores (580+ for 3.5% down).',
    },
    {
      name: 'VA Loan',
      color: '#ec4899',
      badge: 'Veterans only',
      summary: 'For eligible veterans, active duty, and surviving spouses. No down payment required, no PMI, competitive rates. One of the best mortgage products available.',
      best: 'Any eligible veteran or active duty service member — use this if you qualify.',
    },
  ];

  const hiddenCosts = [
    { item:'Property taxes', range:'1–2% of home value per year', note:'Varies enormously by location. A $400K home in a high-tax area could cost $8,000+/year.' },
    { item:'Homeowners insurance', range:'$1,000–$3,000/year', note:'Required by lenders. Higher in flood/hurricane/wildfire zones.' },
    { item:'Private Mortgage Insurance (PMI)', range:'0.5–1.5% of loan/year', note:'Required if down payment < 20%. Adds $100–500/month on a typical loan. Cancels at 20% equity.' },
    { item:'HOA fees', range:'$0–$1,000+/month', note:'Condos and planned communities. Can increase over time and carry special assessments.' },
    { item:'Maintenance & repairs', range:'1–2% of home value/year', note:'Budget $3,000–8,000/year on a $400K home. Higher for older homes.' },
    { item:'Closing costs', range:'2–5% of purchase price', note:'Paid upfront. On a $400K home: $8,000–$20,000. Includes origination fees, title insurance, escrow, and more.' },
    { item:'Utilities', range:'$200–500+/month', note:'Often higher than renting. Gas, electric, water, trash. You pay it all as a homeowner.' },
  ];

  return (
    <div>
      <p style={{ margin:'0 0 1.25rem', fontSize:'0.9375rem', color:T2, lineHeight:1.75, fontFamily:UI }}>
        Buying a home is the largest purchase most people ever make. Understanding mortgage types, true costs, and how much house you can actually afford prevents the most common and costly mistakes.
      </p>

      <SectionCard title="How Much House Can You Afford?">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
          {[
            { rule:'28% Rule', color:TEAL, desc:'Your total housing payment (PITI: principal, interest, taxes, insurance) should not exceed 28% of your gross monthly income.' },
            { rule:'36% Rule', color:'#8b5cf6', desc:'Total debt payments (housing + all other debt) should not exceed 36% of gross income. This is the standard lender benchmark.' },
            { rule:'20% Down', color:'#22c55e', desc:'Putting 20% down eliminates PMI and gives you the best rate. Less than 20% means extra monthly costs.' },
            { rule:'3–5× Income', color:'#f59e0b', desc:'A conservative rule of thumb: your home price should be no more than 3–5× your annual gross household income.' },
          ].map(r => (
            <div key={r.rule} style={{ background:`${r.color}0d`, border:`1px solid ${r.color}20`, borderRadius:10, padding:'0.75rem' }}>
              <div style={{ fontFamily:UI, fontSize:'0.875rem', fontWeight:700, color:r.color, marginBottom:4 }}>{r.rule}</div>
              <div style={{ fontFamily:UI, fontSize:'0.8rem', color:T2, lineHeight:1.6 }}>{r.desc}</div>
            </div>
          ))}
        </div>
        <InfoBox color='#ef4444'>Lenders will often approve you for more than you should borrow. "Can I afford the payment" is not the same as "can I afford the house." Budget for all costs below, not just the mortgage.</InfoBox>
      </SectionCard>

      <SectionCard title="Mortgage Types">
        {mortgageTypes.map(m => (
          <div key={m.name} style={{ padding:'0.875rem 0', borderBottom:`1px solid ` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <span style={{ fontFamily:UI, fontSize:'0.875rem', fontWeight:700, color:NAVY }}>{m.name}</span>
              <Pill text={m.badge} color={m.color}/>
            </div>
            <div style={{ fontFamily:UI, fontSize:'0.8125rem', color:T2, lineHeight:1.65, marginBottom:4 }}>{m.summary}</div>
            <div style={{ fontFamily:UI, fontSize:'0.8rem', color:T3 }}><strong style={{ color:m.color }}>Best for: </strong>{m.best}</div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="The Hidden Costs of Homeownership" subtitle="The mortgage is only the beginning. Budget for all of these.">
        {hiddenCosts.map(c => (
          <div key={c.item} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'0.625rem 0', borderBottom:`1px solid ` }}>
            <div style={{ minWidth:160, fontFamily:UI, fontSize:'0.8125rem', fontWeight:700, color:NAVY, paddingTop:1 }}>{c.item}</div>
            <div>
              <div style={{ fontFamily:UI, fontSize:'0.8125rem', fontWeight:600, color:TEAL, marginBottom:2 }}>{c.range}</div>
              <div style={{ fontFamily:UI, fontSize:'0.8rem', color:T3, lineHeight:1.55 }}>{c.note}</div>
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEARN — RENT VS BUY
══════════════════════════════════════════════════════════════════ */
function RentVsBuyLearn() {
  const buyFactors = [
    { label:'You plan to stay 5+ years', note:'It takes 3–7 years to break even on buying due to closing costs and early mortgage interest.' },
    { label:'You have a stable income and emergency fund', note:'Homeownership comes with unexpected costs. You need reserves beyond the down payment.' },
    { label:'You want to build equity and net worth', note:'Mortgage payments build ownership; rent payments do not. But equity is not guaranteed.' },
    { label:'You want stability and control over your space', note:'Renovations, pets, long-term plans — ownership gives you freedom renters don\'t have.' },
    { label:'Home values in your area are reasonable vs. rents', note:'In expensive cities, renting and investing the difference can outperform buying financially.' },
  ];

  const rentFactors = [
    { label:'You may move within 3–5 years', note:'Selling quickly means losing money to closing costs, agent fees (5–6%), and limited appreciation.' },
    { label:'Your city has extremely high home prices', note:'In markets like NYC or SF, the price-to-rent ratio makes renting more financially efficient.' },
    { label:'You\'re in a transitional life phase', note:'New job, relationship changes, career uncertainty — renting preserves flexibility.' },
    { label:'You can invest the difference aggressively', note:'If you\'d put 20% down and invest that instead, market returns can match or beat home equity gains.' },
    { label:'Maintenance and ownership stress don\'t fit your lifestyle', note:'Not everyone wants to be a homeowner. Renting is a completely valid long-term choice.' },
  ];

  return (
    <div>
      <p style={{ margin:'0 0 1.25rem', fontSize:'0.9375rem', color:T2, lineHeight:1.75, fontFamily:UI }}>
        Renting vs. buying is one of the most personal financial decisions you'll make. Neither is universally better — it depends on your timeline, market, income, and lifestyle. The goal is to make the decision intentionally, not by default.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.25rem' }}>
        <div style={{ border:'1.5px solid rgba(0,180,198,0.3)', borderRadius:12, padding:'1rem' }}>
          <div style={{ fontFamily:DISP, fontWeight:700, color:TEAL, fontSize:'1rem', marginBottom:'0.875rem' }}>Consider Buying When...</div>
          {buyFactors.map(f => (
            <div key={f.label} style={{ marginBottom:'0.625rem' }}>
              <div style={{ display:'flex', gap:7, alignItems:'flex-start' }}>
                <CheckCircle2 size={13} color={TEAL} style={{ flexShrink:0, marginTop:2 }}/>
                <div>
                  <div style={{ fontFamily:UI, fontSize:'0.8125rem', fontWeight:600, color:NAVY }}>{f.label}</div>
                  <div style={{ fontFamily:UI, fontSize:'0.775rem', color:T3, lineHeight:1.55 }}>{f.note}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ border:'1.5px solid rgba(139,92,246,0.3)', borderRadius:12, padding:'1rem' }}>
          <div style={{ fontFamily:DISP, fontWeight:700, color:'#8b5cf6', fontSize:'1rem', marginBottom:'0.875rem' }}>Consider Renting When...</div>
          {rentFactors.map(f => (
            <div key={f.label} style={{ marginBottom:'0.625rem' }}>
              <div style={{ display:'flex', gap:7, alignItems:'flex-start' }}>
                <CheckCircle2 size={13} color='#8b5cf6' style={{ flexShrink:0, marginTop:2 }}/>
                <div>
                  <div style={{ fontFamily:UI, fontSize:'0.8125rem', fontWeight:600, color:NAVY }}>{f.label}</div>
                  <div style={{ fontFamily:UI, fontSize:'0.775rem', color:T3, lineHeight:1.55 }}>{f.note}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <InfoBox>The break-even point — when buying becomes cheaper than renting — is typically 4–7 years. Use the calculator in this section to estimate yours based on your specific numbers.</InfoBox>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEARN — CAR BUYING
══════════════════════════════════════════════════════════════════ */
function CarBuyingLearn() {
  const trueCosts = [
    { item:'Depreciation', impact:'Highest', color:'#ef4444', note:'New cars lose 15–25% of value in year one and 50%+ in 5 years. The #1 cost of car ownership most people ignore.' },
    { item:'Loan interest', impact:'High', color:'#f59e0b', note:'A $35,000 car at 7% for 60 months adds ~$6,600 in interest. The longer the loan, the more you pay — and the more likely you\'re underwater.' },
    { item:'Insurance', impact:'High', color:'#f59e0b', note:'Comprehensive coverage on a new car: $1,500–$3,000/year. Varies enormously by vehicle, age, and driving record.' },
    { item:'Fuel', impact:'Moderate', color:TEAL, note:'$1,500–$3,000+/year depending on MPG and miles driven. EVs reduce this but have higher upfront and insurance costs.' },
    { item:'Maintenance & repairs', impact:'Moderate', color:TEAL, note:'New cars: $500–$1,000/year. Older or high-mileage cars: $1,500–$3,000+. Luxury brands cost more to maintain.' },
    { item:'Registration & taxes', impact:'Low', color:T3, note:'$100–$1,000/year depending on state and vehicle value. Often forgotten in car buying budgets.' },
  ];

  return (
    <div>
      <p style={{ margin:'0 0 1.25rem', fontSize:'0.9375rem', color:T2, lineHeight:1.75, fontFamily:UI }}>
        The second-largest purchase most people make. Cars are depreciating assets — unlike homes, they lose value over time. The goal is to get reliable transportation at the lowest total cost.
      </p>

      <SectionCard title="New vs. Used vs. Certified Pre-Owned">
        {[
          {
            type:'New',
            color:'#ef4444',
            badge:'Highest cost',
            pros:['Full warranty', 'Latest safety features', 'No hidden history', 'Manufacturer incentives/rebates'],
            cons:['Loses 15–25% in year one', 'Higher insurance', 'Highest sticker price', 'Often bought on emotion, not math'],
          },
          {
            type:'Certified Pre-Owned (CPO)',
            color:TEAL,
            badge:'Best value',
            pros:['Manufacturer-backed warranty', 'Inspected and reconditioned', 'Low mileage (typically under 60K)', 'Lower depreciation hit than new'],
            cons:['Still more expensive than non-CPO used', 'Limited selection', 'May still have some early depreciation remaining'],
          },
          {
            type:'Used (Private Party)',
            color:'#22c55e',
            badge:'Lowest cost',
            pros:['Lowest price', 'Someone else absorbed depreciation', 'Pay cash — no interest', 'Best financial outcome if chosen well'],
            cons:['No warranty (usually)', 'Unknown history without Carfax/inspection', 'Financing harder or more expensive', 'Risk of inheriting problems'],
          },
        ].map(t => (
          <div key={t.type} style={{ padding:'0.875rem 0', borderBottom:`1px solid ` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <span style={{ fontFamily:UI, fontWeight:700, color:NAVY, fontSize:'0.9375rem' }}>{t.type}</span>
              <Pill text={t.badge} color={t.color}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', fontSize:'0.8rem', fontFamily:UI }}>
              <div>
                {t.pros.map(p => (
                  <div key={p} style={{ display:'flex', gap:6, alignItems:'flex-start', marginBottom:3, color:T2 }}>
                    <CheckCircle2 size={12} color='#22c55e' style={{ flexShrink:0, marginTop:2 }}/>{p}
                  </div>
                ))}
              </div>
              <div>
                {t.cons.map(c => (
                  <div key={c} style={{ display:'flex', gap:6, alignItems:'flex-start', marginBottom:3, color:T2 }}>
                    <XCircle size={12} color='#ef4444' style={{ flexShrink:0, marginTop:2 }}/>{c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="True Cost of Car Ownership">
        {trueCosts.map(c => (
          <div key={c.item} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'0.625rem 0', borderBottom:`1px solid ` }}>
            <div style={{ minWidth:150, fontFamily:UI, fontSize:'0.8125rem', fontWeight:700, color:NAVY, paddingTop:1 }}>{c.item}</div>
            <div>
              <Pill text={c.impact} color={c.color}/>
              <div style={{ fontFamily:UI, fontSize:'0.8rem', color:T3, lineHeight:1.55, marginTop:4 }}>{c.note}</div>
            </div>
          </div>
        ))}
        <InfoBox>A common guideline: your total car expenses (payment + insurance + gas + maintenance) should not exceed 15–20% of your take-home pay. Many financial advisors recommend keeping total car value under 50% of your annual income.</InfoBox>
      </SectionCard>

      <SectionCard title="Car Buying Rules That Save You Money">
        {[
          { rule:'Get pre-approved before the dealer', note:'Know your rate before you walk in. Dealers profit on financing — having your own offer gives you leverage and removes that tool.' },
          { rule:'Negotiate total price, not monthly payment', note:'Dealers love stretching out 72–84 month loans to make payments seem affordable. Focus on the out-the-door price.' },
          { rule:'Skip the dealer add-ons', note:'Extended warranties, paint protection, gap insurance, and tire packages are high-margin upsells. Evaluate each independently.' },
          { rule:'Check Carfax + get a pre-purchase inspection', note:'A $100–150 independent mechanic inspection on a used car can save thousands. Never skip this.' },
          { rule:'Avoid rolling negative equity', note:'Trading in a car you\'re underwater on and adding that balance to your new loan is a trap that compounds over time.' },
        ].map(r => (
          <div key={r.rule} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'0.625rem 0', borderBottom:`1px solid ` }}>
            <ArrowRight size={14} color={TEAL} style={{ flexShrink:0, marginTop:3 }}/>
            <div>
              <div style={{ fontFamily:UI, fontSize:'0.875rem', fontWeight:700, color:NAVY, marginBottom:2 }}>{r.rule}</div>
              <div style={{ fontFamily:UI, fontSize:'0.8125rem', color:T3, lineHeight:1.6 }}>{r.note}</div>
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEARN — GOAL FUNDING
══════════════════════════════════════════════════════════════════ */
function GoalFundingLearn() {
  const goals = [
    { goal:'Emergency Fund', timeline:'0–12 months', color:'#ef4444', where:'HYSA (High-Yield Savings Account)', note:'3–6 months of expenses. Not negotiable — build this before saving for anything else.' },
    { goal:'Down Payment (Home)', timeline:'2–7 years', color:'#f59e0b', where:'HYSA or short-term bond fund', note:'Keep it safe and liquid. Don\'t invest a down payment in stocks — market timing risk is too high when you need the money on a fixed date.' },
    { goal:'Car Purchase', timeline:'1–3 years', color:TEAL, where:'HYSA or money market', note:'Save the full amount or as large a down payment as possible. The less you finance, the less interest you pay.' },
    { goal:'Wedding / Major Event', timeline:'1–3 years', color:'#8b5cf6', where:'HYSA with dedicated sub-account', note:'Set a budget first, then reverse-engineer the monthly savings needed. Avoid going into debt for a single-day event.' },
    { goal:'Education / College', timeline:'5–18 years', color:'#ec4899', where:'529 Plan (tax-advantaged)', note:'529 contributions grow tax-free when used for qualified education expenses. Many states offer a deduction on contributions.' },
    { goal:'Vacation / Travel', timeline:'< 1 year', color:'#22c55e', where:'Dedicated savings account', note:'Sinking fund approach: divide total cost by months until travel. Automate the monthly transfer.' },
  ];

  return (
    <div>
      <p style={{ margin:'0 0 1.25rem', fontSize:'0.9375rem', color:T2, lineHeight:1.75, fontFamily:UI }}>
        Every major purchase should be funded intentionally — not impulsively charged to a credit card or financed at whatever rate the dealer offers. The framework is simple: set a goal, calculate the monthly savings needed, automate it, and keep it separate from daily spending.
      </p>

      <SectionCard title="The Sinking Fund Method">
        <div style={{ background:`${TEAL}0d`, border:`1px solid ${TEAL}25`, borderRadius:12, padding:'1rem 1.125rem', marginBottom:'1rem', fontFamily:UI }}>
          <div style={{ fontSize:'0.875rem', fontWeight:700, color:NAVY, marginBottom:6 }}>How it works</div>
          <div style={{ fontSize:'0.8375rem', color:T2, lineHeight:1.65 }}>
            A sinking fund is a dedicated savings account for a specific goal. You calculate the total cost, divide by the number of months until you need it, and automatically transfer that amount each month. When it's time to spend, the money is already there — no debt, no stress.
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5rem', fontFamily:UI, fontSize:'0.8125rem' }}>
          {[
            { step:'1', label:'Set the goal', detail:'Define the exact cost and target date', color:'#22c55e' },
            { step:'2', label:'Calculate monthly', detail:'Total ÷ months = monthly savings needed', color:TEAL },
            { step:'3', label:'Automate it', detail:'Set up a recurring transfer on payday', color:'#8b5cf6' },
          ].map(s => (
            <div key={s.step} style={{ background:`${s.color}0d`, border:`1px solid ${s.color}20`, borderRadius:10, padding:'0.75rem', textAlign:'center' }}>
              <div style={{ fontFamily:DISP, fontSize:'1.5rem', fontWeight:700, color:s.color, marginBottom:4 }}>{s.step}</div>
              <div style={{ fontWeight:700, color:NAVY, marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:'0.775rem', color:T3 }}>{s.detail}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Where to Keep Goal Savings">
        {goals.map(g => (
          <div key={g.goal} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'0.75rem 0', borderBottom:`1px solid ` }}>
            <div style={{ minWidth:8, height:8, borderRadius:'50%', background:g.color, marginTop:6, flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:3 }}>
                <span style={{ fontFamily:UI, fontSize:'0.875rem', fontWeight:700, color:NAVY }}>{g.goal}</span>
                <Pill text={g.timeline} color={g.color}/>
                <span style={{ fontFamily:UI, fontSize:'0.775rem', color:T3 }}>→ {g.where}</span>
              </div>
              <div style={{ fontFamily:UI, fontSize:'0.8125rem', color:T3, lineHeight:1.6 }}>{g.note}</div>
            </div>
          </div>
        ))}
        <InfoBox>Many online banks (Ally, Marcus, SoFi) allow multiple savings "buckets" within one account. Name each bucket after your goal and automate transfers — out of sight, out of mind, on track.</InfoBox>
      </SectionCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CALCULATOR — Mortgage Affordability
══════════════════════════════════════════════════════════════════ */
function MortgageCalc() {
  const [income,     setIncome]     = useState(90000);
  const [homePrice,  setHomePrice]  = useState(400000);
  const [downPct,    setDownPct]    = useState(20);
  const [rate,       setRate]       = useState(7.0);
  const [propTaxPct, setPropTaxPct] = useState(1.2);
  const [insurance,  setInsurance]  = useState(150);
  const [termYrs,    setTermYrs]    = useState(30);

  const down      = homePrice * downPct / 100;
  const loan      = homePrice - down;
  const r         = rate / 100 / 12;
  const n         = termYrs * 12;
  const pi        = r > 0 ? loan * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1) : loan/n;
  const tax       = homePrice * propTaxPct / 100 / 12;
  const pmi       = downPct < 20 ? loan * 0.008 / 12 : 0;
  const total     = pi + tax + insurance + pmi;

  const grossMonthly = income / 12;
  const housingRatio = total / grossMonthly;
  const affordable   = housingRatio <= 0.28;

  const totalInterest = pi * n - loan;
  const closingLow    = homePrice * 0.02;
  const closingHigh   = homePrice * 0.05;

  return (
    <SectionCard title="Mortgage Affordability Calculator" subtitle="See your full monthly housing cost and whether the home fits your income.">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1.25rem' }}>
        <NumInput label="Annual Gross Income" value={income} onChange={setIncome}/>
        <NumInput label="Home Price" value={homePrice} onChange={setHomePrice}/>
        <div style={{ marginBottom:'1rem' }}>
          <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>Down Payment: {downPct}%</label>
          <input type="range" min={3} max={50} step={1} value={downPct} onChange={e => setDownPct(Number(e.target.value))} style={{ width:'100%', accentColor:TEAL }}/>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:T3, fontFamily:UI, marginTop:2 }}>
            <span>3%</span><span style={{ fontWeight:700, color:TEAL }}>{fmt(down)}</span><span>50%</span>
          </div>
        </div>
        <NumInput label="Interest Rate" value={rate} onChange={setRate} prefix="" suffix="%" step={0.125} min={2} max={15} hint="Check current rates at bankrate.com"/>
        <NumInput label="Property Tax Rate" value={propTaxPct} onChange={setPropTaxPct} prefix="" suffix="%" step={0.1} min={0} max={5}/>
        <NumInput label="Homeowners Insurance ($/mo)" value={insurance} onChange={setInsurance} step={25}/>
        <div style={{ marginBottom:'1rem' }}>
          <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>Loan Term</label>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            {[15,20,30].map(y => (
              <button key={y} onClick={() => setTermYrs(y)} style={{ flex:1, padding:'9px', borderRadius:9, border:`1.5px solid ${termYrs===y?TEAL:'#e5e7eb'}`, background: termYrs===y?TEAL:'#fafafa', color: termYrs===y?'#fff':NAVY, fontFamily:UI, fontSize:'0.875rem', fontWeight:700, cursor:'pointer' }}>{y} yr</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.625rem', margin:'0.25rem 0 1.25rem' }}>
        <ResultBox label="Principal & Interest" value={fmt(pi)} color={TEAL}/>
        <ResultBox label="Taxes + Insurance" value={fmt(tax+insurance)} color='#8b5cf6'/>
        {pmi > 0 && <ResultBox label="PMI" value={fmt(pmi)} color='#f59e0b'/>}
        <ResultBox label="Total Monthly" value={fmt(total)} color={NAVY} size="lg"/>
      </div>

      <div style={{ background: affordable ? '#f0fdf4' : '#fef2f2', border:`1px solid ${affordable?'#bbf7d0':'#fecaca'}`, borderRadius:12, padding:'1rem', marginBottom:'1rem', fontFamily:UI }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <span style={{ fontSize:'0.875rem', fontWeight:700, color: affordable ? '#15803d' : '#ef4444' }}>
            {affordable ? 'Within the 28% guideline' : 'Above the 28% guideline'}
          </span>
          <span style={{ fontSize:'1.125rem', fontWeight:700, fontFamily:DISP, color: affordable ? '#15803d' : '#ef4444' }}>
            {(housingRatio*100).toFixed(1)}% of gross income
          </span>
        </div>
        <div style={{ fontSize:'0.8125rem', color:T2, lineHeight:1.6 }}>
          {affordable
            ? `Your total housing payment of ${fmt(total)}/month is ${(housingRatio*100).toFixed(1)}% of your gross income — within the recommended 28% threshold.`
            : `Your total housing payment of ${fmt(total)}/month is ${(housingRatio*100).toFixed(1)}% of gross income — above the 28% guideline. Consider a lower price, larger down payment, or waiting for a better rate.`
          }
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.625rem' }}>
        <ResultBox label="Total Interest Paid" value={fmt(totalInterest)} color='#ef4444'/>
        <ResultBox label="Est. Closing Costs" value={`${fmt(closingLow)}–${fmt(closingHigh)}`} color='#f59e0b'/>
        <ResultBox label="Cash Needed to Close" value={fmt(down + closingLow)} color='#6b7280'/>
      </div>

      <InfoBox color='#f59e0b'>This does not include HOA fees, maintenance (budget 1–2% of home value/year), or utilities. Add those to get your true monthly cost of homeownership.</InfoBox>
    </SectionCard>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CALCULATOR — Goal Savings Planner
══════════════════════════════════════════════════════════════════ */
function GoalCalc() {
  const [goalName,    setGoalName]    = useState('Down Payment');
  const [goalAmount,  setGoalAmount]  = useState(80000);
  const [saved,       setSaved]       = useState(10000);
  const [monthly,     setMonthly]     = useState(1000);
  const [apy,         setApy]         = useState(4.5);

  const remaining = Math.max(0, goalAmount - saved);
  const r = apy / 100 / 12;

  // Months to reach goal with monthly contributions + interest on saved amount
  let months = 0;
  if (remaining > 0) {
    if (r > 0) {
      // FV of current savings + FV of monthly contributions = goalAmount
      // Solve numerically
      let balance = saved;
      let m = 0;
      while (balance < goalAmount && m < 1200) {
        balance = balance * (1 + r) + monthly;
        m++;
      }
      months = m;
    } else {
      months = monthly > 0 ? Math.ceil(remaining / monthly) : 9999;
    }
  }

  const years  = Math.floor(months / 12);
  const remMos = months % 12;
  const totalContributed = saved + monthly * months;
  const interestEarned   = goalAmount - totalContributed;

  // Monthly needed to hit in specific timeframes
  const calcMonthly = (targetMonths) => {
    if (targetMonths <= 0) return 0;
    if (r > 0) {
      const fvSaved = saved * Math.pow(1+r, targetMonths);
      const needed  = goalAmount - fvSaved;
      return needed > 0 ? needed / ((Math.pow(1+r,targetMonths)-1)/r) : 0;
    }
    return Math.max(0, (goalAmount - saved) / targetMonths);
  };

  return (
    <SectionCard title="Goal Savings Planner" subtitle="Find out when you'll reach your savings goal, or how much you need to save monthly to hit it on time.">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1.25rem' }}>
        <div style={{ marginBottom:'1rem' }}>
          <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>Goal Name</label>
          <input value={goalName} onChange={e => setGoalName(e.target.value)}
            style={{ width:'100%', padding:'9px 0.75rem', border:`1.5px solid ${B2}`, borderRadius:9, fontSize:'1rem', fontFamily:UI, color:NAVY, fontWeight:600, background:RAISE, boxSizing:'border-box' }}
            onFocus={e => e.target.style.borderColor=TEAL} onBlur={e => e.target.style.borderColor=B2}/>
        </div>
        <NumInput label="Goal Amount" value={goalAmount} onChange={setGoalAmount}/>
        <NumInput label="Already Saved" value={saved} onChange={setSaved}/>
        <NumInput label="Monthly Contribution" value={monthly} onChange={setMonthly} step={50}/>
        <NumInput label="Savings APY" value={apy} onChange={setApy} prefix="" suffix="%" step={0.25} min={0} max={10} hint="Current HYSA rates: 4–5%"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.75rem', margin:'0.25rem 0 1.25rem' }}>
        <ResultBox label="Still Need" value={fmt(remaining)} color='#f59e0b'/>
        <ResultBox label="Time to Goal" value={months < 1200 ? `${years > 0 ? years+'y ' : ''}${remMos}m` : '—'} color={NAVY} size="lg"/>
        <ResultBox label="Interest Earned" value={interestEarned > 0 ? fmt(interestEarned) : '$0'} color={TEAL}/>
      </div>

      <div style={{ fontFamily:UI, fontSize:'0.8125rem', fontWeight:700, color:NAVY, marginBottom:'0.625rem' }}>Monthly savings needed to reach {goalName} in:</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.5rem', marginBottom:'1.25rem' }}>
        {[12,24,36,60].map(mo => (
          <div key={mo} style={{ background:`${TEAL}0d`, border:`1px solid ${TEAL}20`, borderRadius:10, padding:'0.625rem 0.5rem', textAlign:'center' }}>
            <div style={{ fontFamily:DISP, fontSize:'1rem', fontWeight:700, color:TEAL }}>{fmt(Math.ceil(calcMonthly(mo)))}</div>
            <div style={{ fontFamily:UI, fontSize:'0.7375rem', color:T3, marginTop:2 }}>{mo < 12 ? mo+'mo' : mo/12+'yr'}</div>
          </div>
        ))}
      </div>

      <InfoBox>Open a dedicated HYSA and name it after your goal. Automate the monthly transfer on payday. What you don't see, you won't spend.</InfoBox>
    </SectionCard>
  );
}

/* ══════════════════════════════════════════════════════════════════
   RESOURCES
══════════════════════════════════════════════════════════════════ */
function ResourcesTab() {
  const resources = [
    {
      category: 'Home Buying',
      color: TEAL,
      items: [
        { name:'Consumer Financial Protection Bureau — Buying a House', desc:'Step-by-step guide to the mortgage process, closing costs, and your rights as a buyer.', url:'https://www.consumerfinance.gov/owning-a-home/' },
        { name:'Bankrate Mortgage Calculator', desc:'Current mortgage rates and detailed payment breakdowns.', url:'https://www.bankrate.com/mortgages/mortgage-calculator/' },
        { name:'HUD Approved Housing Counselors', desc:'Free or low-cost homebuying counseling from HUD-approved agencies.', url:'https://www.hud.gov/findacounselor' },
      ],
    },
    {
      category: 'Car Buying',
      color: '#f59e0b',
      items: [
        { name:'Consumer Reports Car Buying Guide', desc:'Reliability ratings, true cost of ownership, and pricing data for new and used cars.', url:'https://www.consumerreports.org/cars/' },
        { name:'Edmunds True Market Value', desc:'See what others are actually paying for the car you want. Essential before negotiating.', url:'https://www.edmunds.com/tmv.html' },
        { name:'Carfax', desc:'Vehicle history reports — check before buying any used car.', url:'https://www.carfax.com' },
      ],
    },
    {
      category: 'Savings & Goal Funding',
      color: '#8b5cf6',
      items: [
        { name:'NerdWallet Best HYSA Rates', desc:'Current high-yield savings account rates updated regularly.', url:'https://www.nerdwallet.com/best/banking/high-yield-online-savings-accounts' },
        { name:'Savingforcollege.com — 529 Plans', desc:'Compare 529 plans by state, investment options, and tax benefits.', url:'https://www.savingforcollege.com' },
        { name:'NYT Rent vs Buy Calculator', desc:'The most comprehensive rent vs. buy calculator accounting for all real costs.', url:'https://www.nytimes.com/interactive/2014/upshot/buy-rent-calculator.html' },
      ],
    },
  ];

  return (
    <div>
      {resources.map(section => (
        <SectionCard key={section.category} title={section.category}>
          {section.items.map(item => (
            <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, padding:'0.75rem 0', borderBottom:`1px solid ${B2}`, textDecoration:'none' }}>
              <div>
                <div style={{ fontFamily:UI, fontSize:'0.875rem', fontWeight:700, color:section.color, marginBottom:2 }}>{item.name}</div>
                <div style={{ fontFamily:UI, fontSize:'0.8125rem', color:T3, lineHeight:1.55 }}>{item.desc}</div>
              </div>
              <ExternalLink size={14} color='#d1d5db' style={{ flexShrink:0, marginTop:3 }}/>
            </a>
          ))}
        </SectionCard>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TABS CONFIG
══════════════════════════════════════════════════════════════════ */
const MAIN_TABS = [
  { id:'learn',       label:'Learn',       icon:BookOpen    },
  { id:'calculators', label:'Calculators', icon:Calculator  },
  { id:'resources',   label:'Resources',   icon:ExternalLink },
];

const LEARN_TABS = [
  { id:'home',     label:'Home Buying',   icon:Home      },
  { id:'rentvbuy', label:'Rent vs. Buy',  icon:TrendingUp},
  { id:'car',      label:'Car Buying',    icon:Car       },
  { id:'goals',    label:'Goal Funding',  icon:Target    },
];

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function MajorPurchases() {
  const navigate   = useNavigate();
  const [tab,      setTab]     = useState('learn');
  const [learnTab, setLearnTab]= useState('home');
  const [calcTab,  setCalcTab] = useState('mortgage');

  const learnContent = {
    home:     <HomeBuyingLearn/>,
    rentvbuy: <RentVsBuyLearn/>,
    car:      <CarBuyingLearn/>,
    goals:    <GoalFundingLearn/>,
  };

  const learnTitles = {
    home:     { title:'Home Buying',  sub:'Mortgage types, affordability rules, and the hidden costs most buyers miss.' },
    rentvbuy: { title:'Rent vs. Buy', sub:'Neither is always better — here\'s how to make the right call for your situation.' },
    car:      { title:'Car Buying',   sub:'New vs. used, the true cost of ownership, and negotiating tactics that save money.' },
    goals:    { title:'Goal Funding', sub:'The sinking fund method — how to save intentionally for any major purchase.' },
  };

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:UI }}>

      <div style={{ background:SURF, borderBottom:`1px solid `, padding:'2rem 2.5rem 0' }}>
        <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', marginBottom:'1rem', display:'flex', alignItems:'center', gap:6 }}>
          <button onClick={() => navigate('/fun')} style={{ background:'none', border:'none', cursor:'pointer', color:TEAL, fontSize:'0.75rem', fontFamily:UI, padding:0 }}>Dashboard</button>
          <ChevronRight size={12} color="rgba(255,255,255,0.25)"/>
          <span style={{ fontFamily:UI }}>Major Purchases</span>
        </div>
        <h1 style={{ fontFamily:DISP, fontSize:'2rem', fontWeight:700, color:'#fff', margin:'0 0 0.5rem', letterSpacing:'-0.025em', lineHeight:1.2 }}>
          Major Purchases & Goal Funding
        </h1>
        <p style={{ margin:'0 0 1.75rem', fontSize:'1rem', color:'rgba(255,255,255,0.55)', lineHeight:1.65, maxWidth:580, fontFamily:UI }}>
          Homes, cars, and big goals are where financial plans succeed or fail. Learn to buy smart, avoid common traps, and save for what matters — without going into unnecessary debt.
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
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
              {LEARN_TABS.map(t => {
                const Icon = t.icon;
                const active = learnTab === t.id;
                return (
                  <button key={t.id} onClick={() => setLearnTab(t.id)} style={{
                    display:'flex', alignItems:'center', gap:6, padding:'7px 14px',
                    borderRadius:99, border:`1.5px solid ${active ? TEAL : '#e5e7eb'}`,
                    background: active ? TEAL : '#fff', cursor:'pointer',
                    fontFamily:UI, fontSize:'0.8125rem',
                    fontWeight: active ? 700 : 500, color: active ? '#fff' : '#6b7280',
                    transition:'all 0.15s', whiteSpace:'nowrap',
                  }}>
                    <Icon size={13}/>{t.label}
                  </button>
                );
              })}
            </div>
            <SectionCard title={learnTitles[learnTab].title} subtitle={learnTitles[learnTab].sub}>
              {learnContent[learnTab]}
            </SectionCard>
          </>
        )}

        {tab === 'calculators' && (
          <>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
              {[
                { id:'mortgage', label:'Mortgage Affordability', icon:Home   },
                { id:'goal',     label:'Goal Savings Planner',   icon:Target },
              ].map(t => {
                const Icon = t.icon;
                const active = calcTab === t.id;
                return (
                  <button key={t.id} onClick={() => setCalcTab(t.id)} style={{
                    display:'flex', alignItems:'center', gap:6, padding:'7px 14px',
                    borderRadius:99, border:`1.5px solid ${active ? TEAL : B2}`,
                    background: active ? TEAL : RAISE, cursor:'pointer',
                    fontFamily:UI, fontSize:'0.8125rem',
                    fontWeight: active ? 700 : 500, color: active ? '#fff' : T2,
                    transition:'all 0.15s', whiteSpace:'nowrap',
                  }}>
                    <Icon size={13}/>{t.label}
                  </button>
                );
              })}
            </div>
            {calcTab === 'mortgage' && <MortgageCalc/>}
            {calcTab === 'goal'     && <GoalCalc/>}
          </>
        )}

        {tab === 'resources' && <ResourcesTab/>}

      </div>
    </div>
  );
}
