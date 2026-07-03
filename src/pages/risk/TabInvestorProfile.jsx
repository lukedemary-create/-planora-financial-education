import React, { useContext, useState } from "react";
import { CheckCircle, ChevronRight, ChevronLeft, RotateCcw, AlertTriangle } from "lucide-react";
import { RiskContext } from "../RiskAnalysis";
import { PORTFOLIO_MODELS, getProfileByScore, GOLD, GREEN, RED, YELLOW, riskColor, riskLabel } from "./riskData";

/* ─────────────────────────────────────────────────────────────────── */
/* QUESTIONNAIRE STRUCTURE                                             */
/* ─────────────────────────────────────────────────────────────────── */
const STEPS = [
  {
    title: "Investment Goals",
    subtitle: "What are you trying to achieve?",
    questions: [
      {
        id:"purpose",
        q:"What is the primary purpose of this portfolio?",
        type:"choice",
        options:[
          {label:"Retirement",                score:3},
          {label:"Wealth Building",           score:5},
          {label:"Income Generation",         score:2},
          {label:"Capital Preservation",      score:1},
          {label:"College Savings",           score:3},
          {label:"Emergency Reserve",         score:0},
          {label:"Business / Other Goal",     score:4},
        ],
      },
      {
        id:"horizon",
        q:"What is your investment time horizon?",
        type:"choice",
        options:[
          {label:"Less than 1 year",          score:0},
          {label:"1–3 years",                 score:1},
          {label:"3–5 years",                 score:2},
          {label:"5–10 years",                score:4},
          {label:"10–20 years",               score:6},
          {label:"20+ years",                 score:8},
        ],
      },
      {
        id:"targetReturn",
        q:"What is your target annual return?",
        type:"choice",
        options:[
          {label:"3–4% (very modest)",        score:0},
          {label:"5–6% (conservative)",       score:2},
          {label:"7–8% (moderate)",           score:4},
          {label:"9–10% (growth)",            score:6},
          {label:"10–12% (aggressive)",       score:8},
          {label:"12%+ (maximum)",            score:10},
        ],
      },
      {
        id:"role",
        q:"What is this portfolio's role in your overall financial picture?",
        type:"choice",
        options:[
          {label:"This is my only savings",   score:0},
          {label:"One of several accounts",   score:3},
          {label:"A small portion of my wealth",score:6},
        ],
      },
    ],
  },
  {
    title: "Risk Tolerance",
    subtitle: "How do you handle market volatility?",
    questions: [
      {
        id:"reaction20",
        q:"How would you react if your portfolio dropped 20% in one year?",
        type:"choice",
        options:[
          {label:"Sell everything immediately",         score:0},
          {label:"Sell some to reduce risk",            score:2},
          {label:"Hold and wait",                       score:4},
          {label:"Hold and consider buying more",       score:7},
          {label:"Definitely buy more aggressively",    score:10},
        ],
      },
      {
        id:"maxLoss",
        q:"What is the maximum single-year loss you could emotionally handle?",
        type:"choice",
        options:[
          {label:"5% — I'd be very uncomfortable",      score:0},
          {label:"10%",                                  score:2},
          {label:"15%",                                  score:4},
          {label:"20%",                                  score:6},
          {label:"30%",                                  score:8},
          {label:"Any amount for higher long-term return",score:10},
        ],
      },
      {
        id:"statement",
        q:"Which statement best describes your investment philosophy?",
        type:"choice",
        options:[
          {label:"I prioritize protecting what I have",         score:0},
          {label:"I want modest growth with minimal risk",       score:2},
          {label:"I want balanced growth and risk",             score:5},
          {label:"I prioritize growth and accept volatility",   score:7},
          {label:"I want maximum growth regardless of volatility",score:10},
        ],
      },
      {
        id:"experience",
        q:"How many years of investing experience do you have?",
        type:"choice",
        options:[
          {label:"0–2 years (beginner)",    score:1},
          {label:"3–5 years",               score:3},
          {label:"6–10 years",              score:6},
          {label:"10+ years (experienced)", score:8},
        ],
      },
    ],
  },
  {
    title: "Financial Situation",
    subtitle: "Your financial foundation matters for risk capacity.",
    questions: [
      {
        id:"income",
        q:"What is your approximate annual household income?",
        type:"choice",
        options:[
          {label:"Under $50,000",           score:1},
          {label:"$50,000 – $100,000",      score:2},
          {label:"$100,000 – $200,000",     score:4},
          {label:"$200,000 – $500,000",     score:6},
          {label:"$500,000+",               score:8},
        ],
      },
      {
        id:"expenses",
        q:"What percentage of your monthly income goes to necessary expenses?",
        type:"choice",
        options:[
          {label:"Less than 50% (great savings rate)",  score:6},
          {label:"50–65%",                               score:4},
          {label:"65–75%",                               score:2},
          {label:"75%+ (tight budget)",                  score:0},
        ],
      },
      {
        id:"emergencyFund",
        q:"Do you have an emergency fund covering 6+ months of expenses?",
        type:"choice",
        options:[
          {label:"Yes — fully funded",      score:6},
          {label:"Partially funded",        score:3},
          {label:"No",                      score:0},
        ],
      },
      {
        id:"guaranteedIncome",
        q:"Do you have any guaranteed income sources?",
        type:"choice",
        options:[
          {label:"Pension / Defined Benefit",   score:5},
          {label:"Social Security",             score:4},
          {label:"Rental Income",               score:4},
          {label:"Annuity",                     score:4},
          {label:"None",                        score:0},
        ],
      },
    ],
  },
  {
    title: "Income Needs",
    subtitle: "Does this portfolio need to generate cash flow?",
    questions: [
      {
        id:"incomeNeeded",
        q:"Do you need this portfolio to generate regular income?",
        type:"choice",
        options:[
          {label:"No — pure growth portfolio",         score:6},
          {label:"Yes — some supplemental income",     score:3},
          {label:"Yes — this is my primary income",    score:0},
        ],
      },
      {
        id:"phase",
        q:"Are you currently in the accumulation or distribution phase?",
        type:"choice",
        options:[
          {label:"Still adding money regularly",        score:6},
          {label:"Neither adding nor withdrawing",      score:3},
          {label:"Withdrawing regularly from portfolio",score:0},
        ],
      },
      {
        id:"withdrawalRate",
        q:"If withdrawing, what annual withdrawal rate?",
        type:"choice",
        options:[
          {label:"Not withdrawing",        score:6},
          {label:"Less than 3%",           score:5},
          {label:"3–4% (safe range)",      score:4},
          {label:"4–5%",                   score:2},
          {label:"5%+ (elevated risk)",    score:0},
        ],
      },
    ],
  },
  {
    title: "Constraints & Preferences",
    subtitle: "Any restrictions or values to incorporate?",
    questions: [
      {
        id:"avoid",
        q:"Are there any investments you want to avoid?",
        type:"choice",
        options:[
          {label:"Individual Stocks",        score:0},
          {label:"Bonds",                    score:2},
          {label:"International Investments",score:1},
          {label:"Crypto / Alternatives",    score:1},
          {label:"No restrictions",          score:3},
        ],
      },
      {
        id:"bigExpense",
        q:"Do you have any large known expenses in the next 5 years?",
        type:"choice",
        options:[
          {label:"Home Purchase",             score:0},
          {label:"College Tuition",           score:1},
          {label:"Business Investment",       score:1},
          {label:"Wedding / Major Event",     score:1},
          {label:"No major expenses",         score:4},
        ],
      },
      {
        id:"taxSituation",
        q:"What is your tax situation?",
        type:"choice",
        options:[
          {label:"Low bracket — maximize growth",          score:4},
          {label:"High bracket — tax efficiency matters",  score:2},
          {label:"Mostly in tax-advantaged accounts",      score:4},
        ],
      },
    ],
  },
];

/* ─── Scoring ─────────────────────────────────────────────────────── */
function computeScore(answers) {
  let total = 0;
  let maxPossible = 0;
  STEPS.forEach(step => {
    step.questions.forEach(q => {
      const maxOpt = Math.max(...q.options.map(o => o.score));
      maxPossible += maxOpt;
      const chosen = answers[q.id];
      if (chosen !== undefined) {
        total += q.options[chosen]?.score || 0;
      }
    });
  });
  return Math.round((total / maxPossible) * 100);
}

/* ─── Styled option button ────────────────────────────────────────── */
function OptionBtn({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign:"left",padding:"10px 14px",borderRadius:7,
        border:`1px solid ${selected ? "rgba(201,169,110,0.5)" : "var(--border-c)"}`,
        background: selected ? "rgba(201,169,110,0.10)" : "var(--elevated)",
        color: selected ? GOLD : "var(--text-2)",
        fontSize:"0.75rem",cursor:"pointer",transition:"all 0.15s",
        display:"flex",alignItems:"center",gap:8,
        boxShadow: selected ? "0 0 0 1px rgba(201,169,110,0.25)" : "none",
      }}
    >
      <div style={{
        width:14,height:14,borderRadius:"50%",flexShrink:0,
        border:`2px solid ${selected?GOLD:"rgba(255,255,255,0.2)"}`,
        background: selected ? GOLD : "transparent",
        transition:"all 0.15s",
      }}/>
      {label}
    </button>
  );
}

/* ─── Results view ────────────────────────────────────────────────── */
function ProfileResults({ score, answers, onRetake, portfolio }) {
  const prof = getProfileByScore(score);
  const topModels = PORTFOLIO_MODELS.filter(m => prof.recommendedModels.includes(m.id));

  /* Gap analysis */
  let gapMsg = null;
  if (portfolio?.length) {
    const equityWt = portfolio.reduce((s,h) => {
      if ((h.assetClass||"").includes("Stock")||(h.assetClass||"").includes("Cap")) return s+(parseFloat(h.value)||0);
      return s;
    },0) / Math.max(portfolio.reduce((s,h)=>s+(parseFloat(h.value)||0),0),1) * 100;
    const expectedEquity = (prof.riskLevel / 10) * 90;
    const diff = equityWt - expectedEquity;
    if (Math.abs(diff) < 8) gapMsg = { type:"aligned", msg:"Your current portfolio equity allocation closely matches your risk profile." };
    else if (diff > 0) gapMsg = { type:"high", msg:`Your portfolio (${equityWt.toFixed(0)}% equity) is more aggressive than your profile suggests (${expectedEquity.toFixed(0)}% equity target). Consider adding bonds or reducing equity exposure.` };
    else gapMsg = { type:"low", msg:`Your portfolio (${equityWt.toFixed(0)}% equity) is more conservative than your profile suggests (${expectedEquity.toFixed(0)}% equity target). You may be leaving returns on the table.` };
  }

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"1rem" }}>
      {/* Header card */}
      <div style={{
        border:`2px solid ${prof.color}30`,
        borderRadius:10,padding:"1.5rem",
        background:`linear-gradient(135deg, var(--surface) 0%, ${prof.color}06 100%)`,
      }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:"0.5625rem",color:"var(--text-3)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4 }}>
              Your Investor Profile
            </div>
            <div style={{ fontSize:"1.75rem",fontWeight:900,color:prof.color,lineHeight:1,letterSpacing:"-0.02em" }}>
              {prof.label}
            </div>
            <div style={{ fontSize:"0.75rem",color:"var(--text-2)",marginTop:6,maxWidth:480,lineHeight:1.6 }}>
              {profileExplainer(prof.label)}
            </div>
          </div>
          <div style={{ textAlign:"center",flexShrink:0 }}>
            <div style={{ fontSize:"0.5rem",color:"var(--text-3)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4 }}>Risk Score</div>
            <div style={{ fontSize:"3rem",fontWeight:900,color:prof.color,lineHeight:1 }}>{score}</div>
            <div style={{ fontSize:"0.5625rem",color:"var(--text-3)" }}>out of 100</div>
          </div>
        </div>

        {/* Risk spectrum bar */}
        <div style={{ marginTop:"1rem" }}>
          <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.5rem",
            color:"var(--text-3)",marginBottom:4,letterSpacing:"0.06em" }}>
            <span>CONSERVATIVE</span><span>MODERATE</span><span>AGGRESSIVE</span>
          </div>
          <div style={{ height:6,borderRadius:3,background:"var(--border-c)",position:"relative" }}>
            <div style={{ height:"100%",borderRadius:3,
              background:"linear-gradient(90deg,#22c55e,#eab308,#ef4444)",
              width:"100%" }}/>
            <div style={{
              position:"absolute",top:"50%",transform:"translate(-50%,-50%)",
              left:`${score}%`,width:14,height:14,borderRadius:"50%",
              background:prof.color,border:"2px solid var(--bg)",boxShadow:"0 0 0 2px "+prof.color,
            }}/>
          </div>
        </div>
      </div>

      {/* Gap analysis */}
      {gapMsg && (
        <div style={{
          background: gapMsg.type==="aligned"?"rgba(34,197,94,0.06)":gapMsg.type==="high"?"rgba(239,68,68,0.06)":"rgba(234,179,8,0.06)",
          border:`1px solid ${gapMsg.type==="aligned"?"rgba(34,197,94,0.2)":gapMsg.type==="high"?"rgba(239,68,68,0.2)":"rgba(234,179,8,0.2)"}`,
          borderRadius:8,padding:"0.75rem 1rem",fontSize:"0.75rem",
          color:gapMsg.type==="aligned"?GREEN:gapMsg.type==="high"?RED:YELLOW,
          lineHeight:1.6,
        }}>
          <strong style={{ display:"inline-flex",alignItems:"center",gap:"0.25rem" }}>
            {gapMsg.type==="aligned"
              ? <><CheckCircle size={12} /> Portfolio Aligned</>
              : <><AlertTriangle size={12} /> {gapMsg.type==="high"?"Portfolio Too Aggressive":"Portfolio Too Conservative"}</>
            }
          </strong>
          {"  "}{gapMsg.msg}
        </div>
      )}

      {/* Recommended models */}
      <div style={{ background:"var(--surface)",border:"1px solid var(--border-c)",borderRadius:8,padding:"1rem" }}>
        <div style={{ fontSize:"0.6875rem",fontWeight:700,color:"var(--text-1)",marginBottom:"0.75rem",
          letterSpacing:"0.06em",textTransform:"uppercase" }}>Recommended Portfolio Models</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"0.75rem" }}>
          {topModels.map((m,i) => (
            <div key={m.id} style={{
              border:`1px solid ${i===0?"rgba(201,169,110,0.3)":"var(--border-c)"}`,
              borderRadius:8,padding:"0.875rem",
              background: i===0?"rgba(201,169,110,0.04)":"var(--elevated)",
            }}>
              {i===0&&<div style={{ fontSize:"0.5rem",color:GOLD,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4 }}>
                ⭐ Top Recommendation
              </div>}
              <div style={{ fontWeight:800,color:"var(--text-1)",fontSize:"0.875rem" }}>{m.name}</div>
              <div style={{ fontSize:"0.5625rem",color:"var(--text-3)",marginTop:2,marginBottom:8 }}>{m.category}</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:4 }}>
                {[
                  ["Target Return",`${m.targetReturnMin}–${m.targetReturnMax}%`],
                  ["Risk Level",`${m.riskLevel}/10`],
                  ["Volatility",`${m.volatility}%`],
                  ["Sharpe",`${m.sharpe}`],
                ].map(([l,v])=>(
                  <div key={l}>
                    <div style={{ fontSize:"0.4375rem",color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.08em" }}>{l}</div>
                    <div style={{ fontSize:"0.75rem",fontWeight:700,color:GOLD }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All models match scores */}
      <div style={{ background:"var(--surface)",border:"1px solid var(--border-c)",borderRadius:8,padding:"1rem" }}>
        <div style={{ fontSize:"0.6875rem",fontWeight:700,color:"var(--text-1)",marginBottom:"0.75rem",
          letterSpacing:"0.06em",textTransform:"uppercase" }}>All Model Match Scores</div>
        <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
          {PORTFOLIO_MODELS.map(m => {
            const diff = Math.abs(m.riskLevel - prof.riskLevel);
            const match = Math.max(0, Math.round(100 - diff * 14));
            const c = match >= 80 ? GREEN : match >= 50 ? YELLOW : RED;
            return (
              <div key={m.id} style={{ display:"flex",alignItems:"center",gap:8 }}>
                <div style={{ width:130,fontSize:"0.625rem",color:"var(--text-2)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                  {m.id}. {m.name}
                </div>
                <div style={{ flex:1,height:6,background:"var(--border-c)",borderRadius:3,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${match}%`,background:c,borderRadius:3,transition:"width 0.5s" }}/>
                </div>
                <div style={{ width:32,textAlign:"right",fontSize:"0.625rem",fontWeight:700,color:c }}>{match}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={onRetake} style={{
        display:"flex",alignItems:"center",gap:6,justifyContent:"center",
        padding:"8px 20px",border:"1px solid var(--border-c)",borderRadius:7,
        background:"none",color:"var(--text-3)",fontSize:"0.75rem",cursor:"pointer",
      }}>
        <RotateCcw size={13}/> Retake Assessment
      </button>
    </div>
  );
}

function profileExplainer(label) {
  const map = {
    "Ultra Conservative": "You prioritize protecting capital above all else. You accept very low returns in exchange for maximum stability. Suitable for emergency funds, near-term spending needs, or retirees with no tolerance for loss.",
    "Conservative": "You prefer stability with modest growth. You can handle small fluctuations but prioritize safety. A heavy bond allocation with dividend stocks suits you well.",
    "Moderately Conservative": "You want reasonable stability with some growth. You can absorb moderate short-term losses but would be uncomfortable with large drawdowns. A 40-50% equity allocation fits your profile.",
    "Moderate": "The classic investor. You seek balanced growth and stability. You understand that markets fluctuate and can hold through corrections. The 60/40 portfolio was built for you.",
    "Moderately Aggressive": "You lean toward growth and can tolerate meaningful volatility. You have a long enough horizon to recover from significant drawdowns. 70-80% equity allocation is appropriate.",
    "Aggressive": "You prioritize growth and accept significant volatility. You will not panic-sell in a bear market and have 10+ years before needing the money.",
    "Very Aggressive": "Maximum growth is your objective. You can stomach 40%+ drawdowns without losing sleep because you have a 20+ year horizon and strong financial cushion.",
    "Ultra Aggressive": "You are a sophisticated investor seeking maximum long-run compounding. You treat every bear market as a buying opportunity. Only appropriate for a small, discretionary portion of total wealth.",
  };
  return map[label] || "Your profile balances growth and protection based on your unique financial situation.";
}

/* ─── Progress bar ────────────────────────────────────────────────── */
function ProgressBar({ step, total }) {
  return (
    <div style={{ marginBottom:"1.5rem" }}>
      <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.5625rem",
        color:"var(--text-3)",marginBottom:6 }}>
        <span>Step {step+1} of {total}</span>
        <span>{Math.round((step/total)*100)}% complete</span>
      </div>
      <div style={{ height:3,background:"var(--border-c)",borderRadius:2 }}>
        <div style={{ height:"100%",width:`${((step+1)/total)*100}%`,
          background:GOLD,borderRadius:2,transition:"width 0.3s" }}/>
      </div>
      <div style={{ display:"flex",gap:2,marginTop:6 }}>
        {STEPS.map((s,i)=>(
          <div key={i} style={{
            flex:1,height:3,borderRadius:2,transition:"background 0.3s",
            background: i<step?"rgba(201,169,110,0.5)":i===step?GOLD:"var(--border-c)",
          }}/>
        ))}
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────── */
export default function TabInvestorProfile() {
  const { profile, saveProfile, portfolio } = useContext(RiskContext);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(!!profile);
  const [results, setResults] = useState(profile);

  const currentStep = STEPS[step];
  const answered = currentStep?.questions.every(q => answers[q.id] !== undefined);

  const choose = (qId, optIdx) => setAnswers(a => ({...a,[qId]:optIdx}));

  const next = () => {
    if (step < STEPS.length - 1) { setStep(s => s+1); }
    else {
      const score = computeScore(answers);
      const prof  = getProfileByScore(score);
      const result = { ...prof, score, answers };
      saveProfile(result);
      setResults(result);
      setDone(true);
    }
  };

  const retake = () => { setStep(0); setAnswers({}); setDone(false); setResults(null); saveProfile(null); };

  if (done && results) {
    return <ProfileResults score={results.score} answers={results.answers} onRetake={retake} portfolio={portfolio}/>;
  }

  return (
    <div style={{ maxWidth:680,margin:"0 auto" }}>
      <div style={{ background:"var(--surface)",border:"1px solid var(--border-c)",borderRadius:10,padding:"1.5rem" }}>
        <ProgressBar step={step} total={STEPS.length} />

        <div style={{ marginBottom:"0.25rem",fontSize:"0.5625rem",color:"var(--text-3)",
          letterSpacing:"0.1em",textTransform:"uppercase" }}>
          Step {step+1} — {currentStep.title}
        </div>
        <div style={{ fontSize:"1.0625rem",fontWeight:800,color:"var(--text-1)",marginBottom:4,letterSpacing:"-0.01em" }}>
          {currentStep.title}
        </div>
        <div style={{ fontSize:"0.75rem",color:"var(--text-3)",marginBottom:"1.5rem" }}>
          {currentStep.subtitle}
        </div>

        {currentStep.questions.map(q => (
          <div key={q.id} style={{ marginBottom:"1.5rem" }}>
            <div style={{ fontSize:"0.8125rem",fontWeight:600,color:"var(--text-1)",marginBottom:"0.625rem",lineHeight:1.5 }}>
              {q.q}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
              {q.options.map((opt, idx) => (
                <OptionBtn
                  key={idx}
                  label={opt.label}
                  selected={answers[q.id] === idx}
                  onClick={() => choose(q.id, idx)}
                />
              ))}
            </div>
          </div>
        ))}

        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"0.5rem" }}>
          <button
            onClick={() => setStep(s => s-1)}
            disabled={step===0}
            style={{
              display:"flex",alignItems:"center",gap:4,padding:"8px 16px",
              border:"1px solid var(--border-c)",borderRadius:7,
              background:"none",color: step===0?"var(--text-3)":"var(--text-2)",
              fontSize:"0.75rem",cursor:step===0?"not-allowed":"pointer",opacity:step===0?0.4:1,
            }}
          >
            <ChevronLeft size={14}/> Back
          </button>

          <button
            onClick={next}
            disabled={!answered}
            style={{
              display:"flex",alignItems:"center",gap:4,padding:"8px 20px",
              border:"1px solid rgba(201,169,110,0.4)",borderRadius:7,
              background: answered?"rgba(201,169,110,0.12)":"var(--border-c)",
              color: answered?GOLD:"var(--text-3)",
              fontSize:"0.75rem",fontWeight:700,cursor:answered?"pointer":"not-allowed",
            }}
          >
            {step === STEPS.length-1 ? (
              <><CheckCircle size={14}/> See My Profile</>
            ) : (
              <>Next <ChevronRight size={14}/></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
