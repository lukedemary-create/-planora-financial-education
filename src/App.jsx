import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Outlet, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ErrorBoundary from '@/lib/ErrorBoundary';
import Layout from './Layout';
import NavAssistant from './components/NavAssistant';

/* ─── Scroll to top on route change ─────────────────────────────── */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/* ─── Route guards ───────────────────────────────────────────────── */
function RequireAuth({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RedirectIfAuth({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

/* ─── Existing pages ─────────────────────────────────────────────── */
const PageNotFound       = lazy(() => import('./lib/PageNotFound'));
const Dashboard          = lazy(() => import('./pages/Dashboard'));
const AIAdvisor          = lazy(() => import('./pages/AIAdvisor'));
// BudgetPlanner removed — lives in FUN platform
const Calculators        = lazy(() => import('./pages/Calculators'));
const MarketHistory      = lazy(() => import('./pages/MarketHistory'));
const PoliticsEconomy    = lazy(() => import('./pages/PoliticsEconomy'));
const RiskAnalysis       = lazy(() => import('./pages/RiskAnalysis'));
// const TickerLookup    = lazy(() => import('./pages/TickerLookup')); // paused
const Settings           = lazy(() => import('./pages/Settings'));

/* ─── New pages ──────────────────────────────────────────────────── */
const Terminal           = lazy(() => import('./pages/Terminal'));
const EconomicCalendar   = lazy(() => import('./pages/EconomicCalendar'));
// const Energy          = lazy(() => import('./pages/Energy'));          // paused
const Labor              = lazy(() => import('./pages/Labor'));
// const Watchlist       = lazy(() => import('./pages/Watchlist'));       // paused
const MarketBreadth      = lazy(() => import('./pages/MarketBreadth'));
const WealthCounsel      = lazy(() => import('./pages/WealthCounsel'));
const Landing            = lazy(() => import('./pages/Landing'));
const Consumer           = lazy(() => import('./pages/Consumer'));
const PlonoraAI          = lazy(() => import('./pages/PlonoraAI'));
const BrokerageGuide     = lazy(() => import('./pages/BrokerageGuide'));
const RealEstate         = lazy(() => import('./pages/RealEstate'));
// const InsiderTrading  = lazy(() => import('./pages/InsiderTrading'));  // paused
// NetWorthTracker removed — lives in FUN platform
// SocialSecurity removed — lives in FUN platform
const BusinessPlanning      = lazy(() => import('./pages/BusinessPlanning'));
const ElasticBand           = lazy(() => import('./pages/ElasticBand'));
const BestDays              = lazy(() => import('./pages/BestDays'));
const HorizonFlip           = lazy(() => import('./pages/HorizonFlip'));
const PerfectTime           = lazy(() => import('./pages/PerfectTime'));
const DoomLoop              = lazy(() => import('./pages/DoomLoop'));
const PlanningLetter        = lazy(() => import('./pages/PlanningLetter'));
const TheFeed               = lazy(() => import('./pages/TheFeed'));
const Hub                   = lazy(() => import('./pages/Hub'));
const TerminalHub           = lazy(() => import('./pages/TerminalHub'));
const PlanningHub           = lazy(() => import('./pages/PlanningHub'));
const MarketsHub            = lazy(() => import('./pages/MarketsHub'));
const WealthHub             = lazy(() => import('./pages/WealthHub'));
const MacroHub              = lazy(() => import('./pages/MacroHub'));
const EducationHub          = lazy(() => import('./pages/EducationHub'));
const WealthCounselHub      = lazy(() => import('./pages/WealthCounselHub'));
const FeaturedInsights      = lazy(() => import('./pages/FeaturedInsights'));
const InsightArticle        = lazy(() => import('./pages/InsightArticle'));
const Login              = lazy(() => import('./pages/Login'));
const Welcome            = lazy(() => import('./pages/Welcome'));
const Privacy            = lazy(() => import('./pages/Privacy'));
const Terms              = lazy(() => import('./pages/Terms'));

/* ─── FUN app ────────────────────────────────────────────────────── */
const FunApp             = lazy(() => import('./fun/FunApp'));


/* ─── Loading fallback ───────────────────────────────────────────── */
const Loader = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" }}>
    <div style={{ width: 32, height: 32, border: "3px solid rgba(201,169,110,0.15)", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "tSpin 0.7s linear infinite" }} />
    <style>{`@keyframes tSpin { to { transform: rotate(360deg); } }`}</style>
  </div>
);


/* ─── Routes ─────────────────────────────────────────────────────── */
function AppRoutes() {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();

  if (isLoadingAuth || isLoadingPublicSettings) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          {/* Gold P logo mark */}
          <div
            style={{
              width: 36,
              height: 36,
              background: "var(--gold, #c9a84c)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "1.125rem", fontWeight: 900, color: "#07080a", lineHeight: 1 }}>P</span>
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              border: "2px solid rgba(201,169,110,0.15)",
              borderTopColor: "#c9a84c",
              borderRadius: "50%",
              animation: "tSpin 0.7s linear infinite",
            }}
          />
          <style>{`@keyframes tSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavAssistant />
      <Suspense fallback={<Loader />}>
      <Routes>
        {/* ── Auth ── */}
        <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
        <Route path="/welcome" element={<RequireAuth><Welcome /></RequireAuth>} />

        {/* ── Landing (requires auth) ── */}
        <Route path="/" element={<RequireAuth><Landing /></RequireAuth>} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* ── FUN (own full-page layout) ── */}
        <Route path="/fun/*" element={<FunApp />} />


        {/* ── Planora AI (fullscreen — own layout) ── */}
        <Route path="/planora-ai" element={<PlonoraAI />} />

        {/* ── Hub pages (standalone, no sidebar) ── */}
        <Route path="/terminal-hub"        element={<RequireAuth><TerminalHub /></RequireAuth>} />
        <Route path="/markets"             element={<RequireAuth><MarketsHub /></RequireAuth>} />
        <Route path="/wealth"              element={<RequireAuth><WealthHub /></RequireAuth>} />
        <Route path="/macro"               element={<RequireAuth><MacroHub /></RequireAuth>} />
        <Route path="/education-hub"       element={<RequireAuth><EducationHub /></RequireAuth>} />
        <Route path="/wealth-counsel"      element={<RequireAuth><WealthCounsel /></RequireAuth>} />
        <Route path="/wealth-counsel-hub"  element={<RequireAuth><WealthCounselHub /></RequireAuth>} />
        <Route path="/insights"            element={<RequireAuth><FeaturedInsights /></RequireAuth>} />
        <Route path="/insights/:slug"      element={<RequireAuth><InsightArticle /></RequireAuth>} />
        <Route path="/WealthCounsel"       element={<Navigate to="/wealth-counsel" replace />} />
        <Route path="/business-planning"   element={<RequireAuth><BusinessPlanning /></RequireAuth>} />
        <Route path="/planning-letter"     element={<RequireAuth><PlanningLetter /></RequireAuth>} />
        <Route path="/the-feed"            element={<RequireAuth><TheFeed /></RequireAuth>} />

        {/* ── Planora Terminal (Layout sidebar) ── */}
        <Route element={<RequireAuth><Layout><Outlet /></Layout></RequireAuth>}>
          <Route path="/hub"                 element={<Hub />} />
          <Route path="/planning"            element={<PlanningHub />} />
          <Route path="/dashboard"           element={<Dashboard />} />
          <Route path="/financial-reports"   element={<AIAdvisor />} />
          <Route path="/Calculators"         element={<Calculators />} />

          <Route path="/MarketHistory"       element={<MarketHistory />} />
          <Route path="/elastic-band"        element={<ElasticBand />} />
          <Route path="/best-days"           element={<BestDays />} />
          <Route path="/horizon-flip"        element={<HorizonFlip />} />
          <Route path="/perfect-time"        element={<PerfectTime />} />
          <Route path="/doom-loop"           element={<DoomLoop />} />
          <Route path="/PoliticsEconomy"     element={<PoliticsEconomy />} />
          <Route path="/RiskAnalysis"        element={<RiskAnalysis />} />
          <Route path="/Settings"            element={<Settings />} />
          <Route path="/terminal"            element={<Terminal />} />
          <Route path="/economic-calendar"   element={<EconomicCalendar />} />
          {/* <Route path="/energy" element={<Energy />} /> */}
          <Route path="/labor"               element={<Labor />} />
          {/* <Route path="/watchlist" element={<Watchlist />} /> */}
          <Route path="/market-breadth"      element={<MarketBreadth />} />
          <Route path="/consumer"            element={<Consumer />} />
          <Route path="/brokerage-guide"     element={<BrokerageGuide />} />
          <Route path="/real-estate"        element={<RealEstate />} />
          {/* <Route path="/insider-trading" element={<InsiderTrading />} /> */}
          <Route path="*"                    element={<PageNotFound />} />
        </Route>
      </Routes>
    </Suspense>
    </>
  );
}

/* ─── App ────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AppRoutes />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
