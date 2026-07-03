import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import {
  LayoutDashboard, Wallet, CreditCard, TrendingUp, Shield,
  ScrollText, Clock, Home, Calendar, BookOpen, GraduationCap,
  ChevronLeft, Menu, X, Scale, PieChart, Receipt, Baby,
} from 'lucide-react';

const FunDashboard   = lazy(() => import('./pages/FunDashboard'));
const Budgeting      = lazy(() => import('./pages/Budgeting'));
const DebtCredit     = lazy(() => import('./pages/DebtCredit'));
const Investing      = lazy(() => import('./pages/Investing'));
const Insurance      = lazy(() => import('./pages/Insurance'));
const Estate         = lazy(() => import('./pages/Estate'));
const Retirement     = lazy(() => import('./pages/Retirement'));
const MajorPurchases = lazy(() => import('./pages/MajorPurchases'));
const BuyRentLease   = lazy(() => import('./pages/BuyRentLease'));
const LifeEvents     = lazy(() => import('./pages/LifeEvents'));
const TaxPlanning       = lazy(() => import('./pages/TaxPlanning'));
const Resources         = lazy(() => import('./pages/Resources'));
const Portfolio         = lazy(() => import('./pages/Portfolio'));
const FamilyPlanning    = lazy(() => import('./pages/FamilyPlanning'));
const LearnersLibrary   = lazy(() => import('../pages/Education'));
const LearnersLibraryTopic = lazy(() => import('../pages/EducationTopic'));

// Arche warm dark tokens
const C = {
  bg:      '#1a1410',
  surface: '#231c16',
  b1:      '#2a2018',
  b2:      '#3d3028',
  gold:    '#c9a96e',
  goldDim: 'rgba(201,169,110,0.08)',
  goldBdr: 'rgba(201,169,110,0.20)',
  teal:    '#00B4C6',
  tealDim: 'rgba(0,180,198,0.09)',
  tealBdr: 'rgba(0,180,198,0.22)',
  t1:      '#f0e8d8',
  t2:      '#a89070',
  t3:      '#6b5540',
};

const UI      = "'Inter', system-ui, sans-serif";
const DISPLAY = "'Playfair Display', Georgia, serif";

const NAV_GROUPS = [
  {
    group: 'LEARN',
    items: [
      { path: '',                  label: 'Dashboard',              icon: LayoutDashboard },
      { path: 'budgeting',         label: 'Budgeting & Foundations',icon: Wallet          },
      { path: 'debt-credit',       label: 'Debt & Credit',          icon: CreditCard      },
      { path: 'investing',         label: 'Investing & Accounts',   icon: TrendingUp      },
      { path: 'portfolio',         label: 'Portfolio Structure',    icon: PieChart        },
      { path: 'life-events',       label: 'Life Events',            icon: Calendar        },
      { path: 'resources',         label: 'Resource Directory',     icon: BookOpen        },
      { path: 'learners-library',  label: "Learner's Library",      icon: GraduationCap   },
    ],
  },
  {
    group: 'PLAN',
    items: [
      { path: 'insurance',         label: 'Insurance Planning',     icon: Shield          },
      { path: 'retirement',        label: 'Retirement Planning',    icon: Clock           },
      { path: 'tax-planning',      label: 'Tax Planning',           icon: Receipt         },
      { path: 'estate',            label: 'Estate & Wills Planning',icon: ScrollText      },
      { path: 'major-purchases',   label: 'Major Purchases',        icon: Home            },
      { path: 'buy-rent-lease',    label: 'Buy, Rent, or Lease',    icon: Scale           },
      { path: 'family-planning',   label: 'Family Planning',         icon: Baby            },
    ],
  },
];

function FunLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="17" stroke={C.teal} strokeWidth="1.5" fill="none" opacity="0.5"/>
      <circle cx="18" cy="6"  r="4" fill={C.teal}/>
      <circle cx="6"  cy="27" r="4" fill={C.teal} opacity="0.8"/>
      <circle cx="30" cy="27" r="4" fill={C.teal} opacity="0.8"/>
      <line x1="18" y1="10" x2="6"  y2="23" stroke={C.teal} strokeWidth="1.5" opacity="0.65"/>
      <line x1="18" y1="10" x2="30" y2="23" stroke={C.teal} strokeWidth="1.5" opacity="0.65"/>
      <line x1="6"  y1="27" x2="30" y2="27" stroke={C.teal} strokeWidth="1.5" opacity="0.65"/>
    </svg>
  );
}

function Loader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'40vh', background: C.bg }}>
      <div style={{
        width: 28, height: 28,
        border: `2px solid ${C.b2}`,
        borderTopColor: C.gold,
        borderRadius: '50%',
        animation: 'funSpin 0.7s linear infinite',
      }}/>
      <style>{`@keyframes funSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Sidebar({ collapsed, onToggle }) {
  const navigate  = useNavigate();
  const { pathname } = useLocation();
  const segment = pathname.replace(/^\/fun\/?/, '').split('/')[0];

  return (
    <div style={{
      width: collapsed ? 56 : 248,
      minHeight: '100vh',
      background: C.surface,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'width 0.22s ease',
      borderRight: `1px solid ${C.b1}`,
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Header */}
      <div style={{
        padding: collapsed ? '16px 14px' : '18px 16px',
        borderBottom: `1px solid ${C.b1}`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minHeight: 68,
      }}>
        <div style={{ flexShrink: 0 }}><FunLogo /></div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: DISPLAY,
              fontSize: '1.0625rem',
              fontWeight: 700,
              color: C.t1,
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
            }}>FUN</div>
            <div style={{
              fontFamily: UI,
              fontSize: '0.5625rem',
              color: C.teal,
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              marginTop: 3,
              lineHeight: 1.3,
            }}>Financial Understanding Network</div>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'rgba(240,232,216,0.04)',
            border: `1px solid ${C.b2}`,
            borderRadius: 7,
            padding: '5px 6px',
            cursor: 'pointer',
            color: C.t3,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.b2; e.currentTarget.style.color = C.t2; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.t3; }}
        >
          {collapsed ? <Menu size={14}/> : <X size={14}/>}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.group}>
            {!collapsed && (
              <div style={{
                padding: gi === 0 ? '10px 18px 4px' : '14px 18px 4px',
                fontFamily: UI,
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: C.t3,
              }}>
                {group.group}
              </div>
            )}
            {collapsed && gi > 0 && (
              <div style={{ margin: '8px 12px', height: 1, background: C.b1 }} />
            )}
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = segment === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(`/fun/${item.path}`)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: collapsed ? '11px 16px' : '9px 16px',
                    background: isActive ? C.tealDim : 'transparent',
                    border: 'none',
                    borderLeft: `2px solid ${isActive ? C.teal : 'transparent'}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.13s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(240,232,216,0.03)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon size={15} color={isActive ? C.teal : C.t3} style={{ flexShrink: 0 }}/>
                  {!collapsed && (
                    <span style={{
                      fontFamily: UI,
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? C.t1 : C.t2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      letterSpacing: '0.005em',
                    }}>{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Back to Planora */}
      <div style={{ borderTop: `1px solid ${C.b1}`, padding: '6px 0' }}>
        <button
          onClick={() => navigate('/')}
          title={collapsed ? 'Back to Planora' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: collapsed ? '11px 16px' : '9px 16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 0.13s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,232,216,0.03)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <ChevronLeft size={15} color={C.t3} style={{ flexShrink: 0 }}/>
          {!collapsed && (
            <span style={{
              fontFamily: UI,
              fontSize: '0.8125rem',
              color: C.t3,
              letterSpacing: '0.005em',
            }}>Back to Planora</span>
          )}
        </button>
      </div>
    </div>
  );
}

function PButton() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => navigate('/')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Back to Planora"
      style={{
        position: 'fixed',
        top: 16,
        right: 20,
        zIndex: 100,
        width: 36,
        height: 36,
        borderRadius: 9,
        background: hovered ? C.gold : C.surface,
        border: `1px solid ${hovered ? C.gold : C.b2}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: hovered ? '0 4px 16px rgba(201,169,110,0.25)' : '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'all 0.18s ease',
      }}
    >
      <span style={{
        fontFamily: DISPLAY,
        fontSize: '0.9375rem',
        fontWeight: 900,
        color: hovered ? C.bg : C.gold,
        lineHeight: 1,
        transition: 'color 0.18s ease',
      }}>P</span>
    </button>
  );
}

export default function FunApp() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const id = 'fun-google-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)}/>
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh', position: 'relative' }}>
        <PButton />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route index                  element={<FunDashboard />} />
            <Route path="budgeting"       element={<Budgeting />} />
            <Route path="debt-credit"     element={<DebtCredit />} />
            <Route path="investing"       element={<Investing />} />
            <Route path="insurance"       element={<Insurance />} />
            <Route path="estate"          element={<Estate />} />
            <Route path="retirement"      element={<Retirement />} />
            <Route path="major-purchases" element={<MajorPurchases />} />
            <Route path="buy-rent-lease"  element={<BuyRentLease />} />
            <Route path="life-events"     element={<LifeEvents />} />
            <Route path="portfolio"                      element={<Portfolio />} />
            <Route path="tax-planning"                   element={<TaxPlanning />} />
            <Route path="resources"                     element={<Resources />} />
            <Route path="family-planning"               element={<FamilyPlanning />} />
            <Route path="learners-library"              element={<LearnersLibrary />} />
            <Route path="learners-library/:topicId"     element={<LearnersLibraryTopic />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
