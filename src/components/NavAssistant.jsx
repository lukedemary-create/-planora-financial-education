import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Sparkles, ArrowUpRight } from 'lucide-react';

const C = {
  bg:      '#1a1410',
  surf:    '#231c16',
  raise:   '#2d2419',
  b1:      '#2a2018',
  b2:      '#3d3028',
  gold:    '#c9a96e',
  goldDim: 'rgba(201,169,110,0.10)',
  goldBdr: 'rgba(201,169,110,0.22)',
  t1:      '#f0e8d8',
  t2:      '#a89070',
  t3:      '#6b5540',
};

const UI      = "'Inter', system-ui, sans-serif";
const DISPLAY = "'Playfair Display', Georgia, serif";

/* ── Route knowledge base ─────────────────────────────────────────── */
const ROUTES = [
  { keywords: ['budget','budgeting','50/30/20','cash flow','expense tracking','sinking fund','savings rate'], path: '/fun/budgeting',        label: 'Budgeting & Foundations' },
  { keywords: ['debt','credit score','avalanche','snowball','credit card','pay off debt','utilization'],      path: '/fun/debt-credit',       label: 'Debt & Credit' },
  { keywords: ['invest','index fund','etf','diversif','dollar cost','dca','brokerage account','vanguard','fidelity','schwab'], path: '/fun/investing', label: 'Investing & Accounts' },
  { keywords: ['portfolio','allocation','rebalanc','asset class','bonds','equities','diversified portfolio'], path: '/fun/portfolio',         label: 'Portfolio Structure' },
  { keywords: ['insurance','life insurance','health insurance','disability','coverage','premium','term life','whole life','human life value'], path: '/fun/insurance', label: 'Insurance Planning' },
  { keywords: ['retirement','401k','401(k)','ira','roth','pension','withdraw','safe withdrawal','fire','retire'], path: '/fun/retirement',   label: 'Retirement Planning' },
  { keywords: ['tax','taxes','deduction','capital gains','roth vs traditional','tax alpha','bracket','write off','tax loss'], path: '/fun/tax-planning', label: 'Tax Planning' },
  { keywords: ['estate','will','trust','beneficiary','probate','power of attorney','inheritance','executor','living will'], path: '/fun/estate', label: 'Estate & Wills Planning' },
  { keywords: ['home buying','mortgage','house','down payment','car','major purchase','pmi','closing cost','fha','va loan'], path: '/fun/major-purchases', label: 'Major Purchases' },
  { keywords: ['rent vs buy','buy or rent','lease','renting','own vs rent','rent or buy'], path: '/fun/buy-rent-lease', label: 'Buy, Rent, or Lease' },
  { keywords: ['family','children','kids','baby','education savings','529','college','childcare','parenting'], path: '/fun/family-planning', label: 'Family Planning' },
  { keywords: ['life event','marriage','divorce','job loss','job change','windfall','inheritance event','financial trigger'], path: '/fun/life-events', label: 'Life Events' },
  { keywords: ['calculator','compound interest','tvm','time value','loan amortization','calculate','run numbers'], path: '/Calculators',        label: 'Financial Calculators' },
  { keywords: ['market','markets','stock market','s&p','sp500','nasdaq','dow','indices','index fund'], path: '/markets',              label: 'Markets Hub' },
  { keywords: ['terminal','bloomberg','live data','quotes','ticker lookup','real time data'], path: '/terminal',             label: 'Planora Terminal' },
  { keywords: ['risk','risk analysis','monte carlo','stress test','portfolio risk','drawdown','volatility','beta'], path: '/RiskAnalysis',      label: 'Risk Analysis' },
  { keywords: ['macro','macroeconomic','gdp','inflation','fed','federal reserve','interest rate','monetary policy'], path: '/macro',           label: 'Macro & Economics' },
  { keywords: ['economic calendar','fed meeting','cpi','jobs report','fomc','earnings calendar'], path: '/economic-calendar', label: 'Economic Calendar' },
  { keywords: ['labor','employment','jobs','unemployment','wages','payroll','nonfarm'], path: '/labor',               label: 'Labor Markets' },
  { keywords: ['consumer','retail','consumer confidence','consumer spending','sentiment','retail sales'], path: '/consumer',            label: 'The Consumer' },
  { keywords: ['real estate','housing market','home prices','case shiller','housing data'], path: '/real-estate',        label: 'Real Estate Data' },
  { keywords: ['political','politics','policy','geopolitical','government','congress','tariff','election'], path: '/PoliticsEconomy',    label: 'Political Intelligence' },
  { keywords: ['market breadth','advance decline','internals','breadth','mcclellan'], path: '/market-breadth',     label: 'Market Breadth' },
  { keywords: ['wealth counsel','advisor','cfp','financial advisor','find advisor','adviser','fee only'], path: '/wealth-counsel',     label: 'Wealth Counsel' },
  { keywords: ['brokerage','robinhood','etrade','ibkr','interactive brokers','merrill','jp morgan','sofi'], path: '/brokerage-guide',   label: 'Brokerage Guide' },
  { keywords: ['business owner','business planning','llc','s-corp','entity structure','buy-sell','succession','exit strategy','key person'], path: '/business-planning', label: 'Business Planning' },
  { keywords: ['education hub','learn finance','financial education','fun platform'], path: '/education-hub',      label: 'Financial Education Hub' },
  { keywords: ['resource','books','reading list','resources'], path: '/fun/resources',       label: 'Resource Directory' },
  { keywords: ["learner's library",'learners library','curriculum','study plan','library'], path: '/fun/learners-library', label: "Learner's Library" },
  { keywords: ['planning','financial plan','financial planning hub','planning tools'], path: '/planning',            label: 'Financial Planning' },
  { keywords: ['dashboard','overview','command center','hub','home'], path: '/hub',                label: 'Command Center' },
  { keywords: ['wealth','wealth hub','investing hub','wealth intelligence'], path: '/wealth',             label: 'Wealth & Investing' },
  { keywords: ['financial reports','report','ai report','personalized report'], path: '/financial-reports', label: 'Financial Reports' },
  { keywords: ['planning letter','newsletter','weekly letter'], path: '/planning-letter',  label: 'The Planning Letter' },
  { keywords: ['library','the library','articles','reading','insights'], path: '/the-feed',          label: 'The Library' },
];

/* ── Match query to best route ────────────────────────────────────── */
function findRoute(query) {
  const q = query.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const route of ROUTES) {
    let score = 0;
    for (const kw of route.keywords) {
      if (q.includes(kw)) score += kw.split(' ').length; // longer matches score higher
    }
    if (score > bestScore) {
      bestScore = score;
      best = route;
    }
  }

  return bestScore > 0 ? best : null;
}

/* ── Suggestion chips ─────────────────────────────────────────────── */
const SUGGESTIONS = [
  'How do I start investing?',
  'Retirement planning tools',
  'What is dollar-cost averaging?',
  'Tax planning strategies',
  'How much house can I afford?',
];

/* ── Component ────────────────────────────────────────────────────── */
export default function NavAssistant() {
  const navigate = useNavigate();
  const [open,     setOpen]    = useState(false);
  const [input,    setInput]   = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! Tell me what you\'re looking for and I\'ll take you there — try "retirement planning" or "how do I pay off debt".' },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    const q = input.trim();
    if (!q || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const match = findRoute(q);

      if (match) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: `Taking you to **${match.label}**…`,
          nav: match,
        }]);
        setTimeout(() => {
          navigate(match.path);
          setOpen(false);
        }, 800);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: `I couldn't find an exact match for that. Try something like "retirement planning", "tax strategies", or "how to invest".`,
        }]);
      }

      setLoading(false);
    }, 400);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSuggestion(s) {
    setInput(s);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'user', text: s }]);
      setInput('');
      setLoading(true);

      setTimeout(() => {
        const match = findRoute(s);
        if (match) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            text: `Taking you to **${match.label}**…`,
            nav: match,
          }]);
          setTimeout(() => { navigate(match.path); setOpen(false); }, 800);
        }
        setLoading(false);
      }, 400);
    }, 50);
  }

  return (
    <>
      {/* ── Chat panel ──────────────────────────────────────────────── */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 88,
          right: 24,
          width: 340,
          maxHeight: 520,
          background: C.surf,
          border: `1px solid ${C.goldBdr}`,
          borderRadius: 18,
          boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,169,110,0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 9999,
          fontFamily: UI,
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            borderBottom: `1px solid ${C.b1}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: C.raise,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: C.gold,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={13} color="#1a1410" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.t1, lineHeight: 1.2 }}>Planora Navigator</div>
                <div style={{ fontSize: 10, color: C.t3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Ask me anything</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.t3, padding: 4, display: 'flex', alignItems: 'center',
              borderRadius: 6,
            }}
              onMouseEnter={e => e.currentTarget.style.color = C.t1}
              onMouseLeave={e => e.currentTarget.style.color = C.t3}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 14px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            scrollbarWidth: 'none',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                {msg.role === 'assistant' ? (
                  <div style={{
                    background: C.raise,
                    border: `1px solid ${C.b1}`,
                    borderRadius: '12px 12px 12px 3px',
                    padding: '9px 13px',
                    maxWidth: '82%',
                    fontSize: 13,
                    color: C.t2,
                    lineHeight: 1.6,
                  }}>
                    {msg.nav ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <ArrowUpRight size={13} color={C.gold} />
                        <span>Taking you to <strong style={{ color: C.gold }}>{msg.nav.label}</strong>…</span>
                      </div>
                    ) : msg.text}
                  </div>
                ) : (
                  <div style={{
                    background: C.gold,
                    borderRadius: '12px 12px 3px 12px',
                    padding: '9px 13px',
                    maxWidth: '82%',
                    fontSize: 13,
                    color: '#1a1410',
                    fontWeight: 600,
                    lineHeight: 1.6,
                  }}>
                    {msg.text}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: C.raise,
                  border: `1px solid ${C.b1}`,
                  borderRadius: '12px 12px 12px 3px',
                  padding: '10px 14px',
                  display: 'flex', gap: 5, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(j => (
                    <div key={j} style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: C.t3,
                      animation: `navDot 1.2s ease-in-out ${j * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions — only show on first message */}
            {messages.length === 1 && (
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 10, color: C.t3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>Try asking</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => handleSuggestion(s)} style={{
                      background: C.goldDim,
                      border: `1px solid ${C.goldBdr}`,
                      borderRadius: 99,
                      padding: '5px 11px',
                      fontSize: 11,
                      color: C.gold,
                      cursor: 'pointer',
                      fontFamily: UI,
                      fontWeight: 500,
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,110,0.18)'}
                      onMouseLeave={e => e.currentTarget.style.background = C.goldDim}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px 14px',
            borderTop: `1px solid ${C.b1}`,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Where do you want to go?"
              style={{
                flex: 1,
                background: C.bg,
                border: `1.5px solid ${C.b2}`,
                borderRadius: 10,
                padding: '9px 12px',
                fontSize: 13,
                color: C.t1,
                fontFamily: UI,
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = C.goldBdr}
              onBlur={e => e.target.style.borderColor = C.b2}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: input.trim() && !loading ? C.gold : C.raise,
                border: `1px solid ${input.trim() && !loading ? C.gold : C.b2}`,
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              <Send size={14} color={input.trim() && !loading ? '#1a1410' : C.t3} />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating trigger button ──────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Planora Navigator"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: open ? C.raise : C.gold,
          border: open ? `1.5px solid ${C.goldBdr}` : 'none',
          boxShadow: open
            ? `0 0 0 4px rgba(201,169,110,0.12)`
            : '0 4px 20px rgba(201,169,110,0.35), 0 2px 8px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.boxShadow = '0 6px 28px rgba(201,169,110,0.5), 0 2px 8px rgba(0,0,0,0.4)' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,169,110,0.35), 0 2px 8px rgba(0,0,0,0.4)' }}
      >
        {open
          ? <X size={18} color={C.gold} />
          : <Sparkles size={19} color="#1a1410" />
        }
      </button>

      <style>{`
        @keyframes navDot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
          40%            { opacity: 1;   transform: scale(1.1);  }
        }
        .nav-assistant-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
