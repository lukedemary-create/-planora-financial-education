import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, Legend, XAxis, YAxis } from 'recharts';
import {
  Clock, ChevronRight, Info, CheckCircle2, XCircle,
  AlertCircle, BookOpen, Calculator, ExternalLink, ArrowRight,
  TrendingUp, DollarSign, Calendar, Shield, Users,
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
    <div style={{ background:SURF, border:`1px solid ${B1}`, borderRadius:16, padding:'1.5rem', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.03)', marginBottom:'1.25rem' }}>
      {(title||subtitle) && (
        <div style={{ marginBottom:'1.25rem' }}>
          {title && <h3 style={{ fontFamily:DISP, fontSize:'1.25rem', fontWeight:700, color:NAVY, margin:'0 0 0.25rem', letterSpacing:'-0.02em' }}>{title}</h3>}
          {subtitle && <p style={{ margin:0, fontSize:'0.875rem', color:T2, lineHeight:1.65, fontFamily:UI }}>{subtitle}</p>}
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

function Pill({ text, color = '#6b5540' }) {
  return (
    <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:20, background:`${color}18`, border:`1px solid ${color}30`, color, fontSize:'0.7rem', fontWeight:700, fontFamily:UI, letterSpacing:'0.04em', textTransform:'uppercase' }}>{text}</span>
  );
}

function fmt(n) { return '$' + Math.round(Math.abs(n)).toLocaleString(); }
function fmtK(n) {
  const abs = Math.abs(n || 0);
  if (abs >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (abs >= 1_000)     return '$' + (n / 1_000).toFixed(1) + 'K';
  return '$' + Math.round(n || 0).toLocaleString();
}
const MONO = "'JetBrains Mono', 'Courier New', monospace";

/* ══════════════════════════════════════════════════════════════════
   LEARN — ACCOUNT TYPES
══════════════════════════════════════════════════════════════════ */
function AccountTypesLearn() {
  const accounts = [
    {
      name: '401(k) / 403(b) / 457',
      color: TEAL,
      badge: 'Employer plan',
      limit2026: '$24,500 ($32,500 if 50+; ages 60–63: $35,750)',
      taxType: 'Pre-tax (Traditional) or After-tax (Roth)',
      match: true,
      pros: ['Highest contribution limits of any retirement account', 'Employer match is free money — always contribute enough to get the full match first', 'Automatic payroll deduction makes it effortless', '403(b) for nonprofits/schools, 457 for government workers'],
      cons: ['Investment options limited to what plan offers', 'Required Minimum Distributions (RMDs) at age 73', 'Early withdrawal penalty of 10% before age 59½'],
      best: 'Your first stop for retirement savings. Max the match before anything else.',
    },
    {
      name: 'Traditional IRA',
      color: '#8b5cf6',
      badge: 'Individual account',
      limit2026: '$7,500 ($8,600 if 50+)',
      taxType: 'Pre-tax (may be deductible)',
      match: false,
      pros: ['Open at any brokerage — full control over investments', 'Tax-deductible contributions (if income limits met)', 'Wider investment selection than most 401(k)s', 'Rollover destination for old 401(k)s'],
      cons: ['Lower contribution limit than 401(k)', 'Deductibility phases out at higher incomes if covered by workplace plan', 'RMDs required at age 73', '10% early withdrawal penalty before 59½'],
      best: 'Good secondary account after maxing employer match. Especially useful for rollovers.',
    },
    {
      name: 'Roth IRA',
      color: '#22c55e',
      badge: 'Best for most',
      limit2026: '$7,500 ($8,600 if 50+)',
      taxType: 'After-tax — tax-free growth & withdrawals',
      match: false,
      pros: ['Tax-free growth and tax-free withdrawals in retirement', 'No RMDs — money can grow indefinitely', 'Contributions (not earnings) can be withdrawn anytime penalty-free', 'More flexible than any other retirement account'],
      cons: ['Income limits: phases out at $153K–$168K (single) / $242K–$252K (married) in 2026', 'No upfront tax deduction', 'Lower contribution limit than 401(k)', 'Earnings subject to penalty if withdrawn before 59½ and 5-year rule'],
      best: 'The most powerful retirement account for most people. Prioritize after getting the employer match.',
    },
    {
      name: 'SEP IRA',
      color: '#f59e0b',
      badge: 'Self-employed',
      limit2026: 'Up to $72,000 (25% of net self-employment income)',
      taxType: 'Pre-tax',
      match: false,
      pros: ['Massive contribution limits for high-earning self-employed individuals', 'Simple to open and administer', 'Contributions are tax-deductible', 'No annual filing requirements'],
      cons: ['Must contribute same percentage for all eligible employees', 'No Roth option', 'RMDs required at 73', 'Contribution based on net self-employment income'],
      best: 'Freelancers, consultants, and sole proprietors with high income and no employees.',
    },
    {
      name: 'Solo 401(k)',
      color: '#ec4899',
      badge: 'Self-employed',
      limit2026: 'Up to $72,000 ($80,000 if 50+)',
      taxType: 'Pre-tax or Roth',
      match: false,
      pros: ['Highest limits of any self-employed option', 'Both employee and employer contributions', 'Roth option available', 'Loan provisions available'],
      cons: ['Must have no full-time employees (except spouse)', 'More administrative complexity than SEP IRA', 'Annual Form 5500 filing required when assets exceed $250K'],
      best: 'Self-employed with no employees who want to maximize contributions, especially at lower income levels where SEP IRA falls short.',
    },
  ];

  const [active, setActive] = useState('401k');
  const map = { '401k': accounts[0], 'tira': accounts[1], 'rira': accounts[2], 'sep': accounts[3], 'solo': accounts[4] };
  const keys = ['401k','tira','rira','sep','solo'];
  const labels = { '401k':'401(k)/403(b)', tira:'Traditional IRA', rira:'Roth IRA', sep:'SEP IRA', solo:'Solo 401(k)' };
  const acct = map[active];

  return (
    <div>
      <p style={{ margin:'0 0 1.25rem', fontSize:'0.9375rem', color:T2, lineHeight:1.75, fontFamily:UI }}>
        Retirement accounts are the most powerful wealth-building tools available. They offer tax advantages — either on contributions now (Traditional) or withdrawals later (Roth) — that dramatically accelerate compounding.
      </p>

      {/* Account selector */}
      <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
        {keys.map(k => (
          <button key={k} onClick={() => setActive(k)} style={{
            padding:'7px 14px', borderRadius:99, border:`1.5px solid ${active===k ? map[k].color : '#e5e7eb'}`,
            background: active===k ? map[k].color : '#fff', cursor:'pointer',
            fontFamily:UI, fontSize:'0.8125rem',
            fontWeight: active===k ? 700 : 500, color: active===k ? '#fff' : '#6b7280',
            transition:'all 0.15s', whiteSpace:'nowrap',
          }}>{labels[k]}</button>
        ))}
      </div>

      {/* Account detail */}
      <div style={{ border:`1.5px solid ${acct.color}30`, borderRadius:14, padding:'1.25rem', marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <span style={{ fontFamily:DISP, fontWeight:700, color:NAVY, fontSize:'1.125rem' }}>{acct.name}</span>
          <Pill text={acct.badge} color={acct.color}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'1rem', fontFamily:UI, fontSize:'0.8125rem' }}>
          <div style={{ background:RAISE, borderRadius:9, padding:'0.625rem 0.75rem' }}>
            <div style={{ color:T3, fontWeight:600, marginBottom:2 }}>2026 Limit</div>
            <div style={{ color:NAVY, fontWeight:700, fontFamily:UI }}>{acct.limit2026}</div>
          </div>
          <div style={{ background:RAISE, borderRadius:9, padding:'0.625rem 0.75rem' }}>
            <div style={{ color:T3, fontWeight:600, marginBottom:2 }}>Tax Treatment</div>
            <div style={{ color:NAVY, fontWeight:700, fontFamily:UI }}>{acct.taxType}</div>
          </div>
        </div>
        {acct.match && (
          <div style={{ display:'flex', gap:8, padding:'0.5rem 0.75rem', background:'rgba(74,124,89,0.09)', border:'1px solid rgba(74,124,89,0.25)', borderRadius:8, fontFamily:UI, fontSize:'0.8125rem', color:T2, marginBottom:'0.875rem' }}>
            <CheckCircle2 size={14} color='#22c55e' style={{ flexShrink:0, marginTop:1 }}/>
            <strong style={{ color:'#4a7c59' }}>Employer match available — always contribute enough to get 100% of the match. It's an instant 50–100% return.</strong>
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', fontSize:'0.8rem', fontFamily:UI }}>
          <div>
            <div style={{ fontWeight:700, color:'#22c55e', marginBottom:4 }}>Pros</div>
            {acct.pros.map(p => (
              <div key={p} style={{ display:'flex', gap:6, alignItems:'flex-start', marginBottom:4, color:T2 }}>
                <CheckCircle2 size={12} color='#22c55e' style={{ flexShrink:0, marginTop:2 }}/>{p}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight:700, color:'#ef4444', marginBottom:4 }}>Cons</div>
            {acct.cons.map(c => (
              <div key={c} style={{ display:'flex', gap:6, alignItems:'flex-start', marginBottom:4, color:T2 }}>
                <XCircle size={12} color='#ef4444' style={{ flexShrink:0, marginTop:2 }}/>{c}
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:`${acct.color}0d`, border:`1px solid ${acct.color}20`, borderRadius:8, padding:'0.5rem 0.75rem', fontSize:'0.8rem', color:T2, fontFamily:UI, marginTop:'0.875rem' }}>
          <strong style={{ color:acct.color }}>Best for: </strong>{acct.best}
        </div>
      </div>

      <SectionCard title="Priority Order: Where to Put Money First">
        {[
          { step:'1', label:'401(k) up to employer match', color:'#22c55e', note:'Free money. Always capture 100% of any employer match before doing anything else.' },
          { step:'2', label:'Max your Roth IRA ($7,500)', color:TEAL, note:'Tax-free growth for life. Most flexible and powerful long-term account for most people.' },
          { step:'3', label:'Max your 401(k) ($24,500)', color:'#8b5cf6', note:'After the Roth, go back and fill up your 401(k) to the annual limit.' },
          { step:'4', label:'Taxable brokerage account', color:'#f59e0b', note:'Once tax-advantaged accounts are maxed, invest in a regular brokerage. Still powerful with index funds.' },
        ].map(row => (
          <div key={row.step} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'0.625rem 0', borderBottom:`1px solid ${B2}` }}>
            <div style={{ width:26, height:26, borderRadius:'50%', background:row.color, color:'#fff', fontWeight:700, fontSize:'0.8125rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:UI }}>{row.step}</div>
            <div>
              <div style={{ fontFamily:UI, fontSize:'0.875rem', fontWeight:700, color:NAVY }}>{row.label}</div>
              <div style={{ fontFamily:UI, fontSize:'0.8125rem', color:T3, lineHeight:1.6 }}>{row.note}</div>
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEARN — SOCIAL SECURITY
══════════════════════════════════════════════════════════════════ */
function SocialSecurityLearn() {
  const ages = [
    { age:'62', label:'Early (reduced)', color:'#ef4444', benefit:'Up to 30% permanent reduction from your full benefit. No earnings limit concerns after FRA.', when:'Only if you have health concerns, no other income, or need the money. The reduction is permanent.' },
    { age:'67', label:'Full Retirement Age (FRA)', color:TEAL, benefit:'100% of your earned benefit. The standard baseline for planning.', when:'The default benchmark. If you\'re in average health and have other income to bridge the gap, waiting longer still pays off.' },
    { age:'70', label:'Maximum benefit', color:'#22c55e', benefit:'8% per year delayed credit from FRA — up to 24–32% more than your FRA benefit.', when:'If you\'re in good health, have assets to live on, and expect an average or longer lifespan. The break-even is typically age 80–82.' },
  ];

  return (
    <div>
      <p style={{ margin:'0 0 1.25rem', fontSize:'0.9375rem', color:T2, lineHeight:1.75, fontFamily:UI }}>
        Social Security is a guaranteed, inflation-adjusted income stream you'll receive for life. When you claim matters enormously — the difference between claiming at 62 vs 70 can exceed <strong>$200,000 in lifetime benefits</strong>.
      </p>

      <SectionCard title="When to Claim: The Age Decision">
        {ages.map(a => (
          <div key={a.age} style={{ padding:'0.875rem 0', borderBottom:`1px solid ${B2}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5 }}>
              <div style={{ fontFamily:DISP, fontSize:'1.5rem', fontWeight:700, color:a.color }}>{a.age}</div>
              <Pill text={a.label} color={a.color}/>
            </div>
            <div style={{ fontFamily:UI, fontSize:'0.8375rem', color:T2, lineHeight:1.65, marginBottom:4 }}>{a.benefit}</div>
            <div style={{ fontFamily:UI, fontSize:'0.8rem', color:T3, lineHeight:1.6 }}><strong style={{ color:NAVY }}>Choose this if:</strong> {a.when}</div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Key Social Security Facts">
        {[
          { label:'Benefit calculation', detail:'Based on your highest 35 years of earnings. Years with no income count as $0 — work at least 35 years to avoid zeros dragging down your average.' },
          { label:'Cost-of-living adjustments (COLA)', detail:'SS benefits increase annually with inflation (COLA). In 2024, the COLA was 3.2%. This is why SS is valuable — it\'s inflation-protected income for life.' },
          { label:'Spousal benefit', detail:'A non-working or lower-earning spouse can claim up to 50% of the higher earner\'s FRA benefit, even without their own work record.' },
          { label:'Survivor benefit', detail:'If your spouse dies, the survivor receives the higher of the two benefit amounts. This makes delaying the higher earner\'s benefit especially valuable.' },
          { label:'Earnings test (before FRA)', detail:'If you claim before FRA and continue working, benefits are temporarily reduced if earnings exceed $24,480 (2026). This goes away at FRA.' },
          { label:'Taxation of benefits', detail:'Up to 85% of SS benefits may be taxable if your combined income exceeds $34K (single) or $44K (married). Plan withdrawals from taxable accounts accordingly.' },
        ].map(f => (
          <div key={f.label} style={{ padding:'0.625rem 0', borderBottom:`1px solid ${B2}` }}>
            <div style={{ fontFamily:UI, fontSize:'0.875rem', fontWeight:700, color:NAVY, marginBottom:2 }}>{f.label}</div>
            <div style={{ fontFamily:UI, fontSize:'0.8125rem', color:T3, lineHeight:1.65 }}>{f.detail}</div>
          </div>
        ))}
        <InfoBox>Create a free account at ssa.gov/myaccount to see your actual earnings history and projected benefit estimates at ages 62, 67, and 70.</InfoBox>
      </SectionCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEARN — WITHDRAWAL RULES
══════════════════════════════════════════════════════════════════ */
function WithdrawalLearn() {
  return (
    <div>
      <p style={{ margin:'0 0 1.25rem', fontSize:'0.9375rem', color:T2, lineHeight:1.75, fontFamily:UI }}>
        Knowing when and how to withdraw from retirement accounts — and in what order — is just as important as saving. Poor withdrawal sequencing can cost tens of thousands in unnecessary taxes.
      </p>

      <SectionCard title="Early Withdrawal (Before Age 59½)">
        <div style={{ background:'rgba(192,57,43,0.09)', border:'1px solid rgba(192,57,43,0.25)', borderRadius:10, padding:'0.875rem 1rem', marginBottom:'1rem', fontFamily:UI, fontSize:'0.875rem', color:T2, display:'flex', gap:10 }}>
          <AlertCircle size={16} color='#ef4444' style={{ flexShrink:0, marginTop:1 }}/>
          <div>Withdrawing from a Traditional 401(k) or IRA before 59½ triggers a <strong style={{ color:'#ef4444' }}>10% penalty plus ordinary income tax</strong>. On a $50,000 withdrawal, you could lose $20,000+.</div>
        </div>
        <div style={{ fontFamily:UI, fontSize:'0.8125rem', fontWeight:700, color:NAVY, marginBottom:8 }}>Exceptions to the 10% penalty:</div>
        {[
          'Death or permanent disability',
          'Substantially Equal Periodic Payments (SEPP / Rule 72(t))',
          'First-time home purchase (IRA only, up to $10,000 lifetime)',
          'Higher education expenses (IRA only)',
          'Medical expenses exceeding 7.5% of AGI',
          'Health insurance premiums while unemployed (IRA only)',
          'Age 55 separation from service (401(k) only)',
          'Qualified domestic relations order (divorce)',
        ].map(e => (
          <div key={e} style={{ display:'flex', gap:7, alignItems:'flex-start', marginBottom:5, fontFamily:UI, fontSize:'0.8125rem', color:T2 }}>
            <CheckCircle2 size={13} color={TEAL} style={{ flexShrink:0, marginTop:2 }}/>{e}
          </div>
        ))}
        <InfoBox color='#8b5cf6'>Roth IRA contributions (not earnings) can always be withdrawn penalty-free at any age — this is one of the Roth's great advantages as an emergency backstop.</InfoBox>
      </SectionCard>

      <SectionCard title="Required Minimum Distributions (RMDs)">
        <p style={{ margin:'0 0 0.875rem', fontSize:'0.8375rem', color:T2, lineHeight:1.65, fontFamily:UI }}>
          The IRS requires you to start withdrawing from Traditional IRAs and 401(k)s at age 73 (SECURE 2.0 Act). RMDs are calculated based on your account balance and IRS life expectancy tables.
        </p>
        {[
          { label:'Applies to', detail:'Traditional IRA, 401(k), 403(b), 457, SEP IRA, SIMPLE IRA. NOT Roth IRAs (but Roth 401(k)s had RMDs until 2024).' },
          { label:'Starting age', detail:'Age 73 if born 1951–1959. Age 75 if born 1960 or later (under SECURE 2.0).' },
          { label:'Penalty for missing', detail:'25% excise tax on the amount you should have withdrawn (reduced to 10% if corrected timely).' },
          { label:'Strategy', detail:'Consider Roth conversions in your 60s to reduce Traditional IRA balances and future RMD amounts before they start.' },
        ].map(r => (
          <div key={r.label} style={{ padding:'0.625rem 0', borderBottom:`1px solid ${B2}` }}>
            <div style={{ fontFamily:UI, fontSize:'0.875rem', fontWeight:700, color:NAVY, marginBottom:2 }}>{r.label}</div>
            <div style={{ fontFamily:UI, fontSize:'0.8125rem', color:T3, lineHeight:1.65 }}>{r.detail}</div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Withdrawal Order Strategy (Tax Efficiency)">
        <p style={{ margin:'0 0 0.875rem', fontSize:'0.8375rem', color:T2, lineHeight:1.65, fontFamily:UI }}>
          The sequence you withdraw from accounts matters for taxes. A common approach:
        </p>
        {[
          { step:'1', label:'RMDs first', note:'If age 73+, take required minimums from Traditional accounts to avoid the penalty.', color:'#ef4444' },
          { step:'2', label:'Taxable brokerage accounts', note:'Withdraw from taxable accounts next. Favorable long-term capital gains rates if held 1+ year.', color:'#f59e0b' },
          { step:'3', label:'Traditional IRA / 401(k)', note:'Taxed as ordinary income. Withdraw enough to fill lower tax brackets efficiently.', color:TEAL },
          { step:'4', label:'Roth IRA last', note:'Let tax-free money grow as long as possible. No RMDs. Ideal for legacy or late-retirement withdrawals.', color:'#22c55e' },
        ].map(row => (
          <div key={row.step} style={{ display:'flex', gap:12, padding:'0.625rem 0', borderBottom:`1px solid ${B2}`, alignItems:'flex-start' }}>
            <div style={{ width:26, height:26, borderRadius:'50%', background:row.color, color:'#fff', fontWeight:700, fontSize:'0.8125rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:UI }}>{row.step}</div>
            <div>
              <div style={{ fontFamily:UI, fontSize:'0.875rem', fontWeight:700, color:NAVY }}>{row.label}</div>
              <div style={{ fontFamily:UI, fontSize:'0.8125rem', color:T3, lineHeight:1.6 }}>{row.note}</div>
            </div>
          </div>
        ))}
        <InfoBox>Roth conversions in your 60s — before RMDs and Social Security begin — can dramatically reduce lifetime taxes. This is a high-value strategy worth discussing with a tax advisor.</InfoBox>
      </SectionCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEARN — THE 4% RULE & INCOME PLANNING
══════════════════════════════════════════════════════════════════ */
function IncomeLearn() {
  return (
    <div>
      <p style={{ margin:'0 0 1.25rem', fontSize:'0.9375rem', color:T2, lineHeight:1.75, fontFamily:UI }}>
        Accumulating a retirement nest egg is only half the challenge. The other half is making it last 20–30+ years. That requires understanding safe withdrawal rates and how to structure retirement income.
      </p>

      <SectionCard title="The 4% Rule">
        <div style={{ background:`${TEAL}0d`, border:`1px solid ${TEAL}25`, borderRadius:12, padding:'1rem 1.125rem', marginBottom:'1rem', fontFamily:UI }}>
          <div style={{ fontSize:'0.875rem', fontWeight:700, color:NAVY, marginBottom:6 }}>What it says</div>
          <div style={{ fontSize:'0.8375rem', color:T2, lineHeight:1.65 }}>
            If you withdraw 4% of your portfolio in year one, then adjust for inflation each year after, your portfolio has historically lasted 30 years with a high probability of success — even through major market downturns.
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.625rem', marginBottom:'1rem' }}>
          {[
            { spend:'$40,000/yr', need:'$1,000,000', color:'#22c55e' },
            { spend:'$60,000/yr', need:'$1,500,000', color:TEAL },
            { spend:'$80,000/yr', need:'$2,000,000', color:'#8b5cf6' },
            { spend:'$100,000/yr', need:'$2,500,000', color:'#f59e0b' },
            { spend:'$120,000/yr', need:'$3,000,000', color:'#ec4899' },
            { spend:'$150,000/yr', need:'$3,750,000', color:'#ef4444' },
          ].map(r => (
            <div key={r.spend} style={{ background:`${r.color}0d`, border:`1px solid ${r.color}20`, borderRadius:10, padding:'0.625rem 0.75rem', textAlign:'center' }}>
              <div style={{ fontFamily:UI, fontSize:'0.75rem', color:T3, marginBottom:2 }}>Spend {r.spend}</div>
              <div style={{ fontFamily:DISP, fontSize:'1rem', fontWeight:700, color:r.color }}>{r.need}</div>
              <div style={{ fontFamily:UI, fontSize:'0.7rem', color:T3 }}>needed</div>
            </div>
          ))}
        </div>
        <InfoBox color='#f59e0b'>The 4% rule assumes a 30-year retirement with a balanced portfolio. If you retire early (40s–50s) or want more safety, consider 3–3.5%. If retiring at 65+ with other income streams, 4–5% may be appropriate.</InfoBox>
      </SectionCard>

      <SectionCard title="Retirement Income Sources — Building the Stack">
        {[
          { source:'Social Security', type:'Guaranteed', color:'#22c55e', note:'Inflation-adjusted for life. Delay to 70 for maximum benefit. Forms the base of most retirement income plans.' },
          { source:'Pension (if applicable)', type:'Guaranteed', color:'#22c55e', note:'Defined benefit plan from an employer. Increasingly rare. Consider survivor benefit options carefully.' },
          { source:'Traditional IRA / 401(k)', type:'Taxable', color:TEAL, note:'Taxed as ordinary income when withdrawn. RMDs start at 73. The most common retirement savings vehicle.' },
          { source:'Roth IRA', type:'Tax-free', color:'#8b5cf6', note:'Tax-free withdrawals. No RMDs. Best used last to maximize tax-free compounding or as legacy assets.' },
          { source:'Taxable Brokerage', type:'Capital gains', color:'#f59e0b', note:'Favorable long-term capital gains rates. Flexible — no restrictions on withdrawals. Good bridge account.' },
          { source:'Rental Income', type:'Semi-passive', color:'#ec4899', note:'Inflation-hedged income if managed well. Requires active management or property manager costs.' },
          { source:'Part-time work', type:'Earned', color:T3, note:'Even $10–20K/year from part-time work dramatically reduces portfolio withdrawal needs in early retirement.' },
        ].map(r => (
          <div key={r.source} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'0.625rem 0', borderBottom:`1px solid ${B2}` }}>
            <Pill text={r.type} color={r.color}/>
            <div>
              <div style={{ fontFamily:UI, fontSize:'0.875rem', fontWeight:700, color:NAVY, marginBottom:2 }}>{r.source}</div>
              <div style={{ fontFamily:UI, fontSize:'0.8125rem', color:T3, lineHeight:1.6 }}>{r.note}</div>
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CALCULATOR — Retirement Savings Goal
══════════════════════════════════════════════════════════════════ */
function RetirementCalc() {
  const [currentAge,    setCurrentAge]    = useState(35);
  const [retireAge,     setRetireAge]     = useState(65);
  const [currentSaved,  setCurrentSaved]  = useState(50000);
  const [monthlyContrib,setMonthlyContrib]= useState(1000);
  const [annualReturn,  setAnnualReturn]  = useState(7);
  const [desiredIncome, setDesiredIncome] = useState(70000);
  const [ssEstimate,    setSsEstimate]    = useState(20000);

  const years = Math.max(0, retireAge - currentAge);
  const r = annualReturn / 100 / 12;
  const n = years * 12;

  // Future value of current savings
  const fvCurrent = currentSaved * Math.pow(1 + annualReturn/100, years);
  // Future value of monthly contributions
  const fvContribs = r > 0 ? monthlyContrib * ((Math.pow(1+r,n)-1)/r) : monthlyContrib*n;
  const total = fvCurrent + fvContribs;

  const neededIncome = Math.max(0, desiredIncome - ssEstimate);
  const needed = neededIncome / 0.04; // 4% rule
  const gap = needed - total;
  const onTrack = gap <= 0;

  // Monthly needed to close gap
  const monthlyNeeded = gap > 0 && r > 0 && n > 0
    ? gap / ((Math.pow(1+r,n)-1)/r)
    : 0;

  return (
    <SectionCard title="Retirement Savings Goal Calculator" subtitle="Estimate how much you'll have at retirement and whether you're on track.">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1.25rem' }}>
        <NumInput label="Current Age" value={currentAge} onChange={setCurrentAge} prefix="" step={1} min={18} max={80}/>
        <NumInput label="Target Retirement Age" value={retireAge} onChange={setRetireAge} prefix="" step={1} min={50} max={80}/>
        <NumInput label="Current Retirement Savings" value={currentSaved} onChange={setCurrentSaved}/>
        <NumInput label="Monthly Contribution" value={monthlyContrib} onChange={setMonthlyContrib} step={100}/>
        <NumInput label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} prefix="" suffix="%" step={0.5} min={1} max={15} hint="Historical stock market average: ~7% after inflation"/>
        <NumInput label="Desired Annual Income in Retirement" value={desiredIncome} onChange={setDesiredIncome} hint="In today's dollars"/>
        <NumInput label="Expected Annual Social Security" value={ssEstimate} onChange={setSsEstimate} hint="Check ssa.gov/myaccount for your estimate"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.75rem', margin:'0.5rem 0 1.25rem' }}>
        <ResultBox label="Projected Portfolio" value={`$${(total/1e6).toFixed(2)}M`} color={TEAL}/>
        <ResultBox label="Portfolio Needed (4% rule)" value={`$${(needed/1e6).toFixed(2)}M`} color={NAVY} size="lg"/>
        <ResultBox label={onTrack ? 'Surplus' : 'Gap'} value={`$${(Math.abs(gap)/1e6).toFixed(2)}M`} color={onTrack ? '#22c55e' : '#ef4444'}/>
      </div>

      {onTrack ? (
        <div style={{ background:'rgba(74,124,89,0.09)', border:'1px solid rgba(74,124,89,0.25)', borderRadius:12, padding:'1rem', fontFamily:UI }}>
          <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
            <CheckCircle2 size={16} color='#22c55e' style={{ flexShrink:0, marginTop:2 }}/>
            <div>
              <div style={{ fontSize:'0.875rem', fontWeight:700, color:'#4a7c59', marginBottom:3 }}>You're on track!</div>
              <div style={{ fontSize:'0.8125rem', color:T2, lineHeight:1.65 }}>
                Your projected portfolio of <strong>{fmt(total)}</strong> exceeds the <strong>{fmt(needed)}</strong> needed to support {fmt(neededIncome)}/year in retirement income (after Social Security). Keep it up.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background:'rgba(192,57,43,0.09)', border:'1px solid rgba(192,57,43,0.25)', borderRadius:12, padding:'1rem', fontFamily:UI }}>
          <div style={{ fontSize:'0.875rem', fontWeight:700, color:'#ef4444', marginBottom:4 }}>Savings Gap: {fmt(gap)}</div>
          <div style={{ fontSize:'0.8125rem', color:T2, lineHeight:1.65, marginBottom:8 }}>
            To close this gap, you'd need to increase monthly contributions by approximately <strong style={{ color:'#ef4444' }}>{fmt(monthlyNeeded)}/month</strong> — or adjust your retirement age, income goal, or return assumption.
          </div>
          <div style={{ fontSize:'0.8rem', color:T3 }}>Other options: delay retirement by a few years, reduce desired income, work part-time in early retirement, or maximize tax-advantaged accounts.</div>
        </div>
      )}

      <InfoBox color='#f59e0b'>This calculator uses the 4% rule and assumes constant returns. Real markets fluctuate. Run this alongside a detailed plan with a financial planner for accuracy.</InfoBox>
    </SectionCard>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CHART TOOLTIP — Social Security
══════════════════════════════════════════════════════════════════ */
function SSTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: SURF, border: `1px solid ${B2}`, borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.78rem' }}>
      <div style={{ fontWeight: 700, color: NAVY, marginBottom: '0.4rem', fontFamily: UI }}>Age {label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, marginBottom: '0.2rem', fontFamily: MONO }}>{p.name}: {fmtK(p.value)}</div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CALCULATOR — Social Security Optimizer (Full)
══════════════════════════════════════════════════════════════════ */
function SSOptimizer() {
  const RED    = '#ef4444';
  const GREEN  = '#22c55e';
  const PURPLE = '#818cf8';

  const HEALTH_MAP = {
    excellent:     { label: 'Excellent (90+)',          age: 92 },
    good:          { label: 'Good (82–90)',              age: 86 },
    average:       { label: 'Average (78–82)',           age: 80 },
    below_average: { label: 'Below Average (under 78)', age: 76 },
  };

  const [fraMonthly,    setFraMonthly]    = useState(2400);
  const [health,        setHealth]        = useState('good');
  const [maritalStatus, setMaritalStatus] = useState('single');
  const [spouseFra,     setSpouseFra]     = useState(1800);
  const [otherIncome,   setOtherIncome]   = useState(20000);

  const calc = useMemo(() => {
    const fra     = Math.max(0, fraMonthly);
    const m62     = fra * 0.70;
    const m67     = fra;
    const m70     = fra * 1.24;
    const lifeAge = HEALTH_MAP[health].age;

    const lt = (monthly, claimAge) => monthly * Math.max(0, (lifeAge - claimAge) * 12);
    const lt62 = lt(m62, 62);
    const lt67 = lt(m67, 67);
    const lt70 = lt(m70, 70);

    const maxLT = Math.max(lt62, lt67, lt70);
    let winner = '67';
    if (lt62 === maxLT) winner = '62';
    else if (lt70 === maxLT) winner = '70';

    let be6267 = null, be6770 = null, be6270 = null;
    for (let age = 62; age <= 100; age += 0.01) {
      const t62 = m62 * Math.max(0, (age - 62) * 12);
      const t67 = m67 * Math.max(0, (age - 67) * 12);
      const t70 = m70 * Math.max(0, (age - 70) * 12);
      if (!be6267 && t67 >= t62) be6267 = +age.toFixed(1);
      if (!be6770 && t70 >= t67) be6770 = +age.toFixed(1);
      if (!be6270 && t70 >= t62) be6270 = +age.toFixed(1);
      if (be6267 && be6770 && be6270) break;
    }

    const chartData = [];
    for (let age = 62; age <= 95; age++) {
      chartData.push({
        age,
        'Claim at 62': Math.round(m62 * Math.max(0, (age - 62) * 12)),
        'Claim at 67': Math.round(m67 * Math.max(0, (age - 67) * 12)),
        'Claim at 70': Math.round(m70 * Math.max(0, (age - 70) * 12)),
      });
    }

    const selfFra        = fra;
    const spFra          = Math.max(0, spouseFra);
    const higherFra      = Math.max(selfFra, spFra);
    const lowerFra       = Math.min(selfFra, spFra);
    const spousalBenefit  = Math.max(lowerFra, higherFra * 0.5);
    const spousalExtra    = Math.max(0, spousalBenefit - lowerFra);
    const survivorBenefit = higherFra * 1.24;

    const annualSS       = m67 * 12;
    const combinedIncome = otherIncome + annualSS * 0.5;
    let taxablePct = 0;
    if (combinedIncome > 34000) taxablePct = 0.85;
    else if (combinedIncome > 25000) taxablePct = 0.50;
    const taxableAmount = annualSS * taxablePct;

    return {
      m62, m67, m70, lt62, lt67, lt70, winner, lifeAge,
      be6267, be6770, be6270, chartData,
      spousalBenefit, spousalExtra, survivorBenefit,
      annualSS, taxablePct, taxableAmount, combinedIncome,
    };
  }, [fraMonthly, health, spouseFra, otherIncome]);

  return (
    <SectionCard title="Social Security Optimizer" subtitle="Find the optimal claiming age to maximize your lifetime Social Security benefits.">

      {/* Key Stats */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:'1.5rem' }}>
        {[
          { label:'Full Retirement Age',    value:'Age 67', color:TEAL       },
          { label:'Early Claiming Penalty', value:'−30%',   color:RED        },
          { label:'Delayed Bonus / Year',   value:'+8%',    color:GREEN      },
          { label:'Max Monthly 2026',       value:'$4,873', color:'#f59e0b'  },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background:`${color}10`, border:`1px solid ${color}30`, borderRadius:8, padding:'0.5rem 0.875rem', flex:'1 1 120px' }}>
            <div style={{ fontSize:'1.2rem', fontWeight:800, color, lineHeight:1, fontFamily:MONO }}>{value}</div>
            <div style={{ fontSize:'0.7rem', color:T3, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginTop:4, fontFamily:UI }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Inputs */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1.25rem', marginBottom:'1.25rem' }}>
        <NumInput label="Monthly Benefit at FRA (Age 67)" value={fraMonthly} onChange={setFraMonthly} step={100} hint="Find your estimate at ssa.gov/myaccount"/>
        <div style={{ marginBottom:'1rem' }}>
          <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>Health / Life Expectancy</label>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {Object.entries(HEALTH_MAP).map(([key, { label }]) => (
              <button key={key} onClick={() => setHealth(key)} style={{
                background: health===key ? `${TEAL}18` : RAISE, border:`1.5px solid ${health===key ? TEAL : B2}`,
                borderRadius:7, padding:'0.4rem 0.75rem', color:health===key ? TEAL : T3,
                fontSize:'0.8rem', fontWeight:health===key ? 700 : 400, cursor:'pointer', textAlign:'left', fontFamily:UI,
              }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:'1rem' }}>
          <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:NAVY, marginBottom:'0.375rem', fontFamily:UI }}>Marital Status</label>
          <div style={{ display:'flex', gap:8 }}>
            {['single','married'].map(s => (
              <button key={s} onClick={() => setMaritalStatus(s)} style={{
                flex:1, background:maritalStatus===s ? `${TEAL}18` : RAISE,
                border:`1.5px solid ${maritalStatus===s ? TEAL : B2}`, borderRadius:7, padding:'0.45rem',
                color:maritalStatus===s ? TEAL : T3, fontSize:'0.8rem', fontWeight:maritalStatus===s ? 700 : 400,
                cursor:'pointer', textTransform:'capitalize', fontFamily:UI,
              }}>{s}</button>
            ))}
          </div>
        </div>
        {maritalStatus === 'married' && (
          <NumInput label="Spouse's Monthly Benefit at FRA" value={spouseFra} onChange={setSpouseFra} step={100}/>
        )}
      </div>

      {/* Scenario Cards */}
      <div style={{ fontSize:'0.75rem', fontFamily:UI, fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.5rem' }}>
        Claiming Age Comparison · Life expectancy: Age {calc.lifeAge} ({HEALTH_MAP[health].label})
      </div>
      <div style={{ display:'flex', gap:12, marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {[
          { age:'62', sub:'30% permanent reduction', color:RED,   monthly:calc.m62, lt:calc.lt62, w:calc.winner==='62' },
          { age:'67', sub:'Full Retirement Age',     color:TEAL,  monthly:calc.m67, lt:calc.lt67, w:calc.winner==='67' },
          { age:'70', sub:'+24% permanent increase', color:GREEN, monthly:calc.m70, lt:calc.lt70, w:calc.winner==='70' },
        ].map(sc => (
          <div key={sc.age} style={{
            flex:'1 1 160px', background:RAISE,
            border:`${sc.w ? 2 : 1}px solid ${sc.w ? sc.color : B2}`,
            borderRadius:14, padding:'1rem 1.125rem', position:'relative',
          }}>
            {sc.w && (
              <div style={{
                position:'absolute', top:-11, left:'50%', transform:'translateX(-50%)',
                background:sc.color, color:'#000', fontSize:'0.6rem', fontWeight:800,
                padding:'0.2rem 0.75rem', borderRadius:99, letterSpacing:'0.08em',
                textTransform:'uppercase', whiteSpace:'nowrap', fontFamily:UI,
              }}>Best for You</div>
            )}
            <div style={{ textAlign:'center', marginBottom:'0.75rem' }}>
              <div style={{ fontSize:'1rem', fontWeight:800, color:sc.color, fontFamily:DISP }}>Claim at {sc.age}</div>
              <div style={{ fontSize:'0.72rem', color:T3, fontFamily:UI }}>{sc.sub}</div>
            </div>
            {[
              { label:'Monthly',       value:fmt(sc.monthly)       },
              { label:'Annual',        value:fmt(sc.monthly * 12)  },
              { label:'Lifetime Total',value:fmtK(sc.lt), large:true },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.3rem 0', borderBottom:`1px solid ${B1}` }}>
                <span style={{ fontSize:'0.73rem', color:T3, fontFamily:UI }}>{r.label}</span>
                <span style={{ fontSize:r.large ? '1rem' : '0.85rem', fontWeight:r.large ? 800 : 600, color:sc.color, fontFamily:MONO }}>{r.value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Breakeven Analysis */}
      <div style={{ fontSize:'0.75rem', fontFamily:UI, fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.5rem' }}>Breakeven Analysis</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginBottom:'1.5rem' }}>
        {[
          { label:'62 vs 67', age:calc.be6267, color:TEAL,      desc:`Live past age ${calc.be6267 ?? '—'} → claiming at 67 pays more total than at 62.` },
          { label:'67 vs 70', age:calc.be6770, color:GREEN,     desc:`Live past age ${calc.be6770 ?? '—'} → claiming at 70 pays more total than at 67.` },
          { label:'62 vs 70', age:calc.be6270, color:'#f59e0b', desc:`Live past age ${calc.be6270 ?? '—'} → claiming at 70 beats claiming at 62.` },
        ].map(({ label, age, color, desc }) => (
          <div key={label} style={{ background:RAISE, borderRadius:10, border:`1px solid ${B2}`, padding:'0.875rem' }}>
            <div style={{ fontSize:'0.7rem', fontFamily:UI, fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{label} Breakeven</div>
            <div style={{ fontSize:'1.5rem', fontWeight:900, color, lineHeight:1, marginBottom:6, fontFamily:MONO }}>Age {age ?? '—'}</div>
            <div style={{ fontSize:'0.72rem', color:T3, lineHeight:1.5, fontFamily:UI }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Cumulative Chart */}
      <div style={{ fontSize:'0.75rem', fontFamily:UI, fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.25rem' }}>Cumulative Lifetime Benefits</div>
      <div style={{ fontSize:'0.75rem', color:T3, marginBottom:'0.75rem', fontFamily:UI }}>Lines cross at breakeven ages — where a later strategy overtakes an earlier one</div>
      <div style={{ marginBottom:'1.5rem' }}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={calc.chartData} margin={{ top:10, right:10, left:10, bottom:0 }}>
            <defs>
              <linearGradient id="ssG62" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={RED}   stopOpacity={0.25}/>
                <stop offset="95%" stopColor={RED}   stopOpacity={0.03}/>
              </linearGradient>
              <linearGradient id="ssG67" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={TEAL}  stopOpacity={0.25}/>
                <stop offset="95%" stopColor={TEAL}  stopOpacity={0.03}/>
              </linearGradient>
              <linearGradient id="ssG70" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={GREEN} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={GREEN} stopOpacity={0.03}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke={B1} strokeOpacity={0.4}/>
            <XAxis dataKey="age" tick={{ fontSize:11, fill:T3, fontFamily:MONO }} label={{ value:'Age', position:'insideBottom', offset:-2, fill:T3, fontSize:11 }}/>
            <YAxis tickFormatter={v => fmtK(v)} tick={{ fontSize:11, fill:T3, fontFamily:MONO }} width={65}/>
            <Tooltip content={<SSTooltip/>}/>
            <Legend wrapperStyle={{ fontSize:'0.75rem', paddingTop:'0.5rem', fontFamily:UI }}/>
            <Area type="monotone" dataKey="Claim at 62" stroke={RED}   fill="url(#ssG62)" strokeWidth={2} dot={false}/>
            <Area type="monotone" dataKey="Claim at 67" stroke={TEAL}  fill="url(#ssG67)" strokeWidth={2} dot={false}/>
            <Area type="monotone" dataKey="Claim at 70" stroke={GREEN} fill="url(#ssG70)" strokeWidth={2} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Spousal & Survivor */}
      {maritalStatus === 'married' && (
        <div style={{ marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:'0.75rem' }}>
            <Users size={15} color={PURPLE}/>
            <span style={{ fontFamily:UI, fontSize:'0.8125rem', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em' }}>Spousal & Survivor Benefits</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:'0.75rem' }}>
            <div style={{ background:RAISE, borderRadius:10, border:`1px solid ${B2}`, padding:'0.875rem' }}>
              <div style={{ fontSize:'0.7rem', fontFamily:UI, fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Spousal Benefit</div>
              <div style={{ fontSize:'1.3rem', fontWeight:900, color:PURPLE, fontFamily:MONO, marginBottom:4 }}>{fmt(calc.spousalBenefit)}/mo</div>
              <div style={{ fontSize:'0.72rem', color:T3, lineHeight:1.5, fontFamily:UI }}>
                Lower-earning spouse can claim up to 50% of the higher earner's FRA benefit.
                {calc.spousalExtra > 0 && ` That's ${fmt(calc.spousalExtra)}/mo more than their own.`}
              </div>
            </div>
            <div style={{ background:RAISE, borderRadius:10, border:`1px solid ${B2}`, padding:'0.875rem' }}>
              <div style={{ fontSize:'0.7rem', fontFamily:UI, fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Survivor Benefit (if higher earner claims at 70)</div>
              <div style={{ fontSize:'1.3rem', fontWeight:900, color:TEAL, fontFamily:MONO, marginBottom:4 }}>{fmt(calc.survivorBenefit)}/mo</div>
              <div style={{ fontSize:'0.72rem', color:T3, lineHeight:1.5, fontFamily:UI }}>Surviving spouse receives the deceased's benefit. Delaying to 70 maximizes this permanently.</div>
            </div>
          </div>
          <InfoBox color={PURPLE}>Recommended married strategy: Have the lower-earning spouse claim early (62–65) to bring income in while the higher-earning spouse delays to 70. This maximizes the survivor benefit the remaining spouse receives for life.</InfoBox>
        </div>
      )}

      {/* Tax on SS */}
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:'0.75rem' }}>
          <DollarSign size={15} color={TEAL}/>
          <span style={{ fontFamily:UI, fontSize:'0.8125rem', fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.08em' }}>Tax on Social Security Benefits</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div style={{ background:RAISE, borderRadius:10, border:`1px solid ${B2}`, padding:'0.875rem' }}>
            <div style={{ fontSize:'0.75rem', fontFamily:UI, fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.625rem' }}>Income Thresholds (Single Filers)</div>
            {[
              { range:'Under $25,000',   pct:'0% taxable',        color:GREEN      },
              { range:'$25,000–$34,000', pct:'Up to 50% taxable', color:'#f59e0b'  },
              { range:'Over $34,000',    pct:'Up to 85% taxable', color:RED        },
            ].map(({ range, pct, color }) => (
              <div key={range} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.45rem 0', borderBottom:`1px solid ${B1}`, fontFamily:UI }}>
                <span style={{ fontSize:'0.75rem', color:T2 }}>{range}</span>
                <span style={{ fontSize:'0.7rem', fontWeight:700, color, background:`${color}15`, border:`1px solid ${color}30`, borderRadius:99, padding:'2px 8px' }}>{pct}</span>
              </div>
            ))}
            <div style={{ fontSize:'0.68rem', color:T3, marginTop:'0.5rem', fontFamily:UI }}>Combined income = other income + 50% of SS benefits</div>
          </div>
          <div>
            <NumInput label="Other Annual Income (wages, pension, etc.)" value={otherIncome} onChange={setOtherIncome} step={1000}/>
            <div style={{ background:RAISE, borderRadius:8, border:`1px solid ${B2}`, padding:'0.75rem', fontFamily:UI }}>
              {[
                { label:'Annual SS at FRA',  value:fmt(calc.annualSS),       color:NAVY,  bold:false },
                { label:'Combined Income',   value:fmt(calc.combinedIncome), color:NAVY,  bold:false },
                { label:'Taxable Portion',   value:`${Math.round(calc.taxablePct * 100)}%`,   color:calc.taxablePct > 0 ? RED : GREEN, bold:true },
                { label:'Taxable SS Amount', value:`${fmt(calc.taxableAmount)}/yr`,            color:calc.taxablePct > 0 ? RED : GREEN, bold:true },
              ].map(r => (
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.35rem 0', borderBottom:`1px solid ${B1}` }}>
                  <span style={{ fontSize:'0.73rem', color:T3 }}>{r.label}</span>
                  <span style={{ fontSize:r.bold ? '0.88rem' : '0.82rem', fontWeight:r.bold ? 700 : 600, color:r.color, fontFamily:MONO }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <InfoBox>For accurate benefit estimates, create a free account at ssa.gov/myaccount. Consider a fee-only CFP for a personalized claiming strategy — especially for married couples.</InfoBox>
    </SectionCard>
  );
}

/* ══════════════════════════════════════════════════════════════════
   RESOURCES
══════════════════════════════════════════════════════════════════ */
function ResourcesTab() {
  const resources = [
    {
      category: 'Government & Official Tools',
      color: TEAL,
      items: [
        { name:'SSA My Account', desc:'See your full earnings history and projected SS benefits at 62, 67, and 70.', url:'https://www.ssa.gov/myaccount/' },
        { name:'IRS Retirement Plans', desc:'Official IRS guidance on contribution limits, rules, and plan types.', url:'https://www.irs.gov/retirement-plans' },
        { name:'Department of Labor — Retirement', desc:'Resources on 401(k) rules, ERISA protections, and fee disclosures.', url:'https://www.dol.gov/general/topic/retirement' },
      ],
    },
    {
      category: 'Planning & Calculators',
      color: '#8b5cf6',
      items: [
        { name:'FIRECalc', desc:'Historical retirement success calculator. Tests your plan against every 30-year period in market history.', url:'https://firecalc.com' },
        { name:'cFIREsim', desc:'Monte Carlo and historical simulation for retirement portfolios. Free and powerful.', url:'https://cfiresim.com' },
        { name:'NewRetirement', desc:'Comprehensive retirement planning tool. Free tier available.', url:'https://www.newretirement.com' },
      ],
    },
    {
      category: 'Education',
      color: '#f59e0b',
      items: [
        { name:'Bogleheads Wiki — Retirement', desc:'Community-driven guide to index fund investing and retirement planning.', url:'https://www.bogleheads.org/wiki/Retirement' },
        { name:'Nolo Retirement Guide', desc:'Plain-language articles on IRAs, 401(k)s, RMDs, and Social Security.', url:'https://www.nolo.com/legal-encyclopedia/retirement-plans-pensions' },
        { name:'Social Security Administration Publications', desc:'Free official guides to Social Security benefits, spousal benefits, and survivor benefits.', url:'https://www.ssa.gov/pubs/' },
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
      <SectionCard title="When to Hire a Financial Planner">
        {[
          'You\'re within 5 years of retirement and haven\'t stress-tested your income plan',
          'You have a pension with complex survivor benefit decisions',
          'Your combined retirement assets exceed $500K',
          'You want a Social Security claiming strategy for you and a spouse',
          'You need Roth conversion planning to reduce future RMDs and taxes',
          'You\'re self-employed and want to maximize retirement account options',
        ].map(r => (
          <div key={r} style={{ display:'flex', gap:8, alignItems:'flex-start', padding:'0.375rem 0', fontFamily:UI, fontSize:'0.8375rem', color:T2 }}>
            <ArrowRight size={13} color={TEAL} style={{ flexShrink:0, marginTop:3 }}/>{r}
          </div>
        ))}
        <InfoBox>Look for a fee-only, fiduciary CFP (Certified Financial Planner). They charge for advice only — no commissions — so their recommendations aren't influenced by products they sell.</InfoBox>
      </SectionCard>
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
  { id:'accounts',   label:'Account Types',      icon:DollarSign  },
  { id:'ss',         label:'Social Security',     icon:Shield      },
  { id:'withdrawal', label:'Withdrawal Rules',    icon:Calendar    },
  { id:'income',     label:'Retirement Income',   icon:TrendingUp  },
];

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function Retirement() {
  const navigate  = useNavigate();
  const [tab,      setTab]     = useState('learn');
  const [learnTab, setLearnTab]= useState('accounts');
  const [calcTab,  setCalcTab] = useState('retirement');

  const learnContent = {
    accounts:   <AccountTypesLearn/>,
    ss:         <SocialSecurityLearn/>,
    withdrawal: <WithdrawalLearn/>,
    income:     <IncomeLearn/>,
  };

  const learnTitles = {
    accounts:   { title:'Retirement Account Types', sub:'401(k), IRA, Roth IRA, SEP IRA — what each is, how they\'re taxed, and which to prioritize.' },
    ss:         { title:'Social Security', sub:'When to claim, how benefits are calculated, and strategies to maximize lifetime income.' },
    withdrawal: { title:'Withdrawal Rules', sub:'Early withdrawal penalties, RMDs, and the tax-efficient order to draw down your accounts.' },
    income:     { title:'Retirement Income Planning', sub:'The 4% rule, building an income stack, and making your money last 30+ years.' },
  };

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:UI }}>

      {/* Header */}
      <div style={{ background:SURF, borderBottom:`1px solid ${B1}`, padding:'2rem 2.5rem 0' }}>
        <div style={{ fontSize:'0.75rem', color:T3, marginBottom:'1rem', display:'flex', alignItems:'center', gap:6 }}>
          <button onClick={() => navigate('/fun')} style={{ background:'none', border:'none', cursor:'pointer', color:TEAL, fontSize:'0.75rem', fontFamily:UI, padding:0 }}>Dashboard</button>
          <ChevronRight size={12} color={B2}/>
          <span style={{ fontFamily:UI, color:T3 }}>Retirement Planning</span>
        </div>
        <h1 style={{ fontFamily:DISP, fontSize:'2rem', fontWeight:700, color:NAVY, margin:'0 0 0.5rem', letterSpacing:'-0.025em', lineHeight:1.2 }}>
          Retirement Planning
        </h1>
        <p style={{ margin:'0 0 1.75rem', fontSize:'1rem', color:T2, lineHeight:1.65, maxWidth:580, fontFamily:UI }}>
          Retirement isn't an age — it's a number. Learn which accounts to use, when to claim Social Security, how to withdraw efficiently, and how to make your money last.
        </p>
        <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${B1}` }}>
          {MAIN_TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display:'flex', alignItems:'center', gap:7, padding:'0.75rem 1.25rem',
                background:'none', border:'none', borderBottom:`2px solid ${active?TEAL:'transparent'}`,
                cursor:'pointer', fontFamily:UI, fontSize:'0.875rem',
                fontWeight:active?700:500, color:active?TEAL:T3,
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
                    borderRadius:99, border:`1px solid ${active ? TEAL : B2}`,
                    background: active ? TEAL : RAISE, cursor:'pointer',
                    fontFamily:UI, fontSize:'0.8125rem',
                    fontWeight: active ? 700 : 500, color: active ? '#1a1410' : T3,
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
            <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem' }}>
              {[
                { id:'retirement', label:'Retirement Goal',      icon:TrendingUp },
                { id:'ss',         label:'SS Optimizer',         icon:Shield     },
              ].map(t => {
                const Icon = t.icon;
                const active = calcTab === t.id;
                return (
                  <button key={t.id} onClick={() => setCalcTab(t.id)} style={{
                    display:'flex', alignItems:'center', gap:6, padding:'7px 16px',
                    borderRadius:99, border:`1px solid ${active ? TEAL : B2}`,
                    background: active ? TEAL : RAISE, cursor:'pointer',
                    fontFamily:UI, fontSize:'0.8125rem',
                    fontWeight: active ? 700 : 500, color: active ? '#1a1410' : T3,
                    whiteSpace:'nowrap',
                  }}>
                    <Icon size={13}/>{t.label}
                  </button>
                );
              })}
            </div>
            {calcTab === 'retirement' && <RetirementCalc/>}
            {calcTab === 'ss'         && <SSOptimizer/>}
          </>
        )}

        {tab === 'resources' && <ResourcesTab/>}

      </div>
    </div>
  );
}
