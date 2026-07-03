// ─────────────────────────────────────────────────────────────────────
// Layout.jsx — Planora Terminal · Command Rail Navigation
// Arche warm-dark design language · Inter · #c9a96e warm gold
// ─────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, LayoutDashboard, CalendarDays, ShieldAlert, Wallet, Settings,
  MonitorDot, History, PieChart, TrendingUp,
  Newspaper, Zap, Users, ShoppingCart, Home, Star, BarChart2, Landmark,
  Eye, Sparkles, LineChart, Calculator, GraduationCap, HeartPulse,
  BookUser, BookOpen, Target, Receipt, ShieldCheck, X, ChevronRight,
  Menu, Sunrise, FileText,
} from "lucide-react";

const RAIL_W  = 56;
const PANEL_W = 256;

/* ─── FUN Bridge — route → FUN section mapping ───────────────────────────── */
const FUN_MAP = {}

function FUNBridge({ link }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(link.to)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        background: 'rgba(129,140,248,0.07)', border: '1px solid rgba(129,140,248,0.20)',
        borderRadius: 12, padding: '12px 16px', cursor: 'pointer', marginBottom: 16,
        textAlign: 'left', transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.12)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.35)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.07)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.20)' }}
    >
      {/* FUN badge */}
      <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 9, background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <GraduationCap size={16} color="#818cf8" />
      </div>
      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 9, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 800, color: '#818cf8', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Learn in FUN</span>
          <span style={{ fontSize: 9, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 700, color: '#818cf8', background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.25)', borderRadius: 4, padding: '1px 6px' }}>Financial Understanding Network</span>
        </div>
        <div style={{ fontSize: 12, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600, color: '#f0e8d8', marginBottom: 1 }}>{link.label}</div>
        <div style={{ fontSize: 11, fontFamily: "'Inter', system-ui, sans-serif", color: '#a89070', lineHeight: 1.4 }}>{link.desc}</div>
      </div>
      {/* Arrow */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 11, fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 700, color: '#818cf8' }}>Go deeper</span>
        <ChevronRight size={14} color="#818cf8" />
      </div>
    </button>
  )
}

const FONT = "'Inter', system-ui, sans-serif";
const MONO = "'JetBrains Mono', 'Courier New', monospace";
const DISPLAY = "'Playfair Display', Georgia, serif";

// Arche easing
const EASE_OUT    = [0.32, 0.72, 0, 1];
const EASE_DRAWER = [0.32, 0.72, 0, 1];

// Arche warm-dark palette
const C = {
  bg:          "#1a1410",        // warm black
  surface:     "#231c16",        // warm surface
  elevated:    "#2d2419",        // elevated card
  border:      "#2a2018",        // default border
  borderSub:   "#3d3028",        // slightly lighter
  gold:        "#c9a96e",        // warm tan/gold
  goldDim:     "rgba(201,169,110,0.10)",
  goldBorder:  "rgba(201,169,110,0.20)",
  textPrimary: "#f0e8d8",
  textSec:     "#a89070",
  textMuted:   "#6b5540",
  success:     "#4a7c59",
  rail:        "rgba(22,17,12,0.98)",
  flyout:      "rgba(24,18,13,0.98)",
};

// ── Nav data ───────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "ai", label: "Planora AI", icon: Brain,
    desc: "AI-powered financial analysis and research",
    items: [{ label: "Planora AI", icon: Brain, path: "/planora-ai", desc: "Intelligent research assistant" }],
  },
  {
    id: "markets", label: "Markets", icon: LayoutDashboard,
    desc: "Live market data, charts, and intelligence",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", desc: "Portfolio and market overview" },
      { label: "Terminal",  icon: MonitorDot,      path: "/terminal",  desc: "Bloomberg-style data terminal" },
    ],
  },
  {
    id: "history", label: "History & Psychology", icon: History,
    desc: "Market history, cycles, and behavioral finance",
    items: [
      { label: "Market History",          icon: History,   path: "/MarketHistory",  desc: "Long-term price history and market cycles" },
      { label: "The Elastic Band Effect", icon: Zap,       path: "/elastic-band",   desc: "Why markets recover faster than they fall" },
      { label: "The Best Days",           icon: Star,      path: "/best-days",      desc: "The cost of missing the market's best days" },
      { label: "The Horizon Flip",        icon: Sunrise,   path: "/horizon-flip",   desc: "How time eliminates market risk" },
      { label: "Perfect Time Illusion",   icon: Target,    path: "/perfect-time",   desc: "Why timing the market fails every investor" },
      { label: "The Doom-Loop",           icon: Newspaper, path: "/doom-loop",      desc: "Hindsight bias and media-driven panic" },
    ],
  },
  {
    id: "macro", label: "Macro", icon: CalendarDays,
    desc: "Economic indicators and macro intelligence",
    items: [
      { label: "Economic Calendar", icon: CalendarDays, path: "/economic-calendar", desc: "Fed meetings, CPI, jobs reports" },
      { label: "Labor Markets",     icon: Users,        path: "/labor",             desc: "Employment and wage data" },
      { label: "The Consumer",      icon: ShoppingCart, path: "/consumer",          desc: "Spending, sentiment, retail" },
      { label: "Real Estate",       icon: Home,         path: "/real-estate",       desc: "Housing market and mortgage data" },
    ],
  },
  {
    id: "analysis", label: "Analysis", icon: ShieldAlert,
    desc: "Deep research, risk, and intelligence tools",
    items: [
      { label: "Risk Analysis",          icon: ShieldAlert, path: "/RiskAnalysis",    desc: "Portfolio risk and stress testing" },
      { label: "Market Breadth",         icon: BarChart2,   path: "/market-breadth",  desc: "Advance/decline and internals" },
      { label: "Political Intelligence", icon: Landmark,    path: "/PoliticsEconomy", desc: "Policy and geopolitical impact" },
    ],
  },
  {
    id: "wealth", label: "Wealth", icon: Wallet,
    desc: "Wealth management education and guidance",
    items: [
      { label: "Wealth Counsel",    icon: BookUser,      path: "/wealth-counsel",    desc: "Private wealth strategies" },
      { label: "Financial Reports", icon: Sparkles,      path: "/financial-reports", desc: "Personalized financial planning reports" },
      { label: "Brokerage Guide",   icon: BookOpen,      path: "/brokerage-guide",   desc: "Platform comparison and selection" },
      { label: "Calculators",       icon: Calculator,    path: "/Calculators",       desc: "TVM, compound growth, and more" },
    ],
  },
  {
    id: "settings", label: "Settings", icon: Settings,
    desc: "Preferences and platform configuration",
    items: [{ label: "Settings", icon: Settings, path: "/Settings", desc: "Account and display settings" }],
  },
];

const ALL_ITEMS = SECTIONS.flatMap(s => s.items);

function useActiveSection() {
  const { pathname } = useLocation();
  return SECTIONS.find(s =>
    s.items.some(i => pathname === i.path || pathname.startsWith(i.path + "/"))
  ) ?? null;
}

function usePageTitle() {
  const { pathname } = useLocation();
  return ALL_ITEMS.find(i => pathname === i.path || pathname.startsWith(i.path + "/"))?.label ?? "Planora";
}

// ── Rail icon button ───────────────────────────────────────────────────
function RailButton({ section, isActive, isOpen, onClick }) {
  const [hovered, setHovered] = useState(false);
  const Icon = section.icon;
  const showTooltip = hovered && !isOpen;

  return (
    <div
      style={{ position: "relative", width: "100%" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Active pip */}
      {isActive && (
        <motion.div
          layoutId="rail-active-pip"
          style={{
            position: "absolute", left: 0, top: 10, bottom: 10,
            width: 2,
            background: C.gold,
            borderRadius: "0 2px 2px 0",
            boxShadow: `2px 0 8px rgba(201,169,110,0.45)`,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}

      <motion.button
        onClick={() => onClick(section.id)}
        whileTap={{ scale: 0.92 }}
        title={section.label}
        style={{
          width: "100%", height: 44,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "none", cursor: "pointer",
          background: isOpen
            ? "rgba(201,169,110,0.12)"
            : isActive
            ? "rgba(201,169,110,0.06)"
            : hovered
            ? "rgba(240,232,216,0.03)"
            : "transparent",
          transition: "background 0.18s ease",
          position: "relative",
        }}
      >
        <motion.div
          animate={{
            color: isActive || isOpen ? C.gold : hovered ? C.textSec : C.textMuted,
          }}
          transition={{ duration: 0.18 }}
        >
          <Icon size={16} />
        </motion.div>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -6, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -4, scale: 0.97 }}
            transition={{ duration: 0.14, ease: EASE_OUT }}
            style={{
              position: "absolute", left: RAIL_W + 8, top: "50%", transform: "translateY(-50%)",
              zIndex: 11000,
              background: C.elevated,
              border: `1px solid ${C.borderSub}`,
              borderRadius: 8,
              padding: "6px 10px",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}
          >
            <span style={{
              fontSize: 11.5, fontWeight: 600, color: C.textPrimary,
              fontFamily: FONT, letterSpacing: "0.01em",
            }}>
              {section.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Icon Rail ──────────────────────────────────────────────────────────
function Rail({ activeSection, openSectionId, onSectionClick }) {
  const navigate = useNavigate();
  const mainSections = SECTIONS.filter(s => s.id !== "settings");
  const settingsSection = SECTIONS.find(s => s.id === "settings");

  return (
    <div
      id="planora-rail"
      style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: RAIL_W,
        background: C.rail,
        borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", alignItems: "center",
        zIndex: 10000,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* Logo mark */}
      <motion.button
        onClick={() => navigate("/hub")}
        title="Planora Hub"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        style={{
          width: RAIL_W, height: 52, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "none", border: "none", cursor: "pointer",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            width: 28, height: 28,
            background: C.gold,
            borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 12px rgba(201,169,110,0.25)",
          }}
        >
          <span style={{
            fontSize: 13, fontWeight: 800, color: "#1a1410", lineHeight: 1,
            fontFamily: DISPLAY,
          }}>
            P
          </span>
        </div>
      </motion.button>

      {/* Section icons */}
      <nav style={{
        flex: 1, width: "100%",
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "8px 0", gap: 1,
      }}>
        {mainSections.map(section => (
          <RailButton
            key={section.id}
            section={section}
            isActive={activeSection?.id === section.id}
            isOpen={openSectionId === section.id}
            onClick={onSectionClick}
          />
        ))}
      </nav>

      {/* Bottom controls */}
      <div style={{
        width: "100%",
        borderTop: `1px solid ${C.border}`,
        padding: "6px 0",
      }}>
        <RailButton
          section={settingsSection}
          isActive={activeSection?.id === "settings"}
          isOpen={openSectionId === "settings"}
          onClick={onSectionClick}
        />

        <div style={{ position: "relative" }}>
          <HomeButton navigate={navigate} />
        </div>
      </div>
    </div>
  );
}

function HomeButton({ navigate }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      onClick={() => navigate("/")}
      title="Back to Home"
      whileTap={{ scale: 0.93 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", height: 38,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: hovered ? "rgba(240,232,216,0.03)" : "transparent",
        border: "none", cursor: "pointer",
        transition: "background 0.18s ease",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 52 52" fill="none">
        <polygon
          points="26,3 49,14 49,38 26,49 3,38 3,14"
          fill="none"
          stroke={hovered ? C.textSec : C.textMuted}
          strokeWidth="4"
          style={{ transition: "stroke 0.18s" }}
        />
        <circle cx="26" cy="26" r="6" fill={hovered ? C.textSec : C.textMuted} style={{ transition: "fill 0.18s" }} />
      </svg>
    </motion.button>
  );
}

// ── Nav Item in flyout ─────────────────────────────────────────────────
function NavItem({ item, onClose }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const Icon = item.icon;
  const isActive = pathname === item.path || pathname.startsWith(item.path + "/");

  function handleClick() {
    onClose();
    navigate(item.path);
  }

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "7px 12px",
        margin: "1px 8px",
        cursor: "pointer",
        background: isActive ? "rgba(201,169,110,0.07)" : "transparent",
        border: `1px solid ${isActive ? "rgba(201,169,110,0.18)" : "transparent"}`,
        borderRadius: 9,
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isActive ? "rgba(201,169,110,0.10)" : "rgba(240,232,216,0.03)",
        border: `1px solid ${isActive ? "rgba(201,169,110,0.20)" : C.border}`,
        transition: "all 0.18s ease",
      }}>
        <Icon size={13} color={isActive ? C.gold : C.textMuted} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: isActive ? 600 : 500,
          color: isActive ? C.gold : C.textSec,
          fontFamily: FONT,
          letterSpacing: "0.01em",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          transition: "color 0.15s",
        }}>
          {item.label}
        </div>
        {item.desc && (
          <div style={{
            fontSize: 10.5, color: C.textMuted,
            fontFamily: FONT,
            letterSpacing: "0.01em",
            marginTop: 1,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {item.desc}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Flyout Panel ───────────────────────────────────────────────────────
function FlyoutPanel({ section, onClose }) {
  return (
    <AnimatePresence>
      {section && (
        <motion.div
          key="panel"
          id="planora-flyout"
          initial={{ x: -(PANEL_W + 16), opacity: 0 }}
          animate={{
            x: 0, opacity: 1,
            transition: { type: "spring", stiffness: 380, damping: 32, mass: 0.7 },
          }}
          exit={{
            x: -(PANEL_W + 16), opacity: 0,
            transition: { duration: 0.14, ease: EASE_DRAWER },
          }}
          style={{
            position: "fixed", top: 0, left: RAIL_W, bottom: 0,
            width: PANEL_W,
            background: C.flyout,
            borderRight: `1px solid ${C.border}`,
            zIndex: 9999,
            display: "flex", flexDirection: "column",
            overflow: "hidden",
            boxShadow: "16px 0 48px rgba(0,0,0,0.6), 1px 0 0 rgba(240,232,216,0.02)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* Warm gold accent stripe at top */}
          <div style={{
            height: 1,
            background: `linear-gradient(90deg, ${C.gold} 0%, rgba(201,169,110,0.15) 60%, transparent 100%)`,
          }} />

          {/* Panel header */}
          <div style={{
            height: 52, flexShrink: 0,
            display: "flex", alignItems: "center",
            padding: "0 12px 0 14px",
            borderBottom: `1px solid ${C.border}`,
            gap: 10,
          }}>
            <div style={{
              width: 3, height: 16,
              background: C.gold,
              borderRadius: 2, flexShrink: 0,
              boxShadow: `0 0 6px rgba(201,169,110,0.4)`,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: C.textPrimary,
                fontFamily: FONT,
              }}>
                {section.label}
              </div>
              {section.desc && (
                <div style={{
                  fontSize: 9.5, color: C.textMuted,
                  fontFamily: FONT, marginTop: 1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {section.desc}
                </div>
              )}
            </div>
            <motion.button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: "rgba(240,232,216,0.04)",
                border: `1px solid ${C.border}`,
                borderRadius: 6, cursor: "pointer",
                width: 22, height: 22,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: C.textMuted,
                flexShrink: 0,
              }}
            >
              <X size={10} />
            </motion.button>
          </div>

          {/* Items with stagger reveal */}
          <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.04 } },
              }}
            >
              {section.items.map((item) => (
                <motion.div
                  key={item.path}
                  variants={{
                    hidden: { opacity: 0, x: -8 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: EASE_OUT } },
                  }}
                >
                  <NavItem item={item} onClose={onClose} />
                </motion.div>
              ))}
            </motion.div>
          </nav>

          {/* Footer */}
          <div style={{
            padding: "10px 14px",
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
          }}>
            <p style={{
              fontSize: 9.5, color: C.textMuted,
              lineHeight: 1.6, margin: 0,
              letterSpacing: "0.02em",
              fontFamily: FONT,
            }}>
              Educational purposes only · Not financial advice
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Top Bar ────────────────────────────────────────────────────────────
function TopBar({ onMobileMenu }) {
  const [clock, setClock] = useState("");
  const activeSection = useActiveSection();
  const pageTitle     = usePageTitle();

  useEffect(() => {
    const tick = () => {
      setClock(new Date().toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      id="planora-topbar"
      style={{
        position: "fixed", top: 0, left: RAIL_W, right: 0,
        height: 48,
        background: "rgba(22,17,12,0.96)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center",
        padding: "0 20px 0 16px",
        gap: 12,
        zIndex: 40,
        fontFamily: FONT,
      }}
    >
      {/* Mobile hamburger */}
      <button
        id="mobile-menu-btn"
        onClick={onMobileMenu}
        style={{
          display: "none", background: "none", border: "none",
          cursor: "pointer", color: C.textSec, padding: 4,
          alignItems: "center", justifyContent: "center",
        }}
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
        {activeSection && (
          <>
            <span style={{
              fontSize: 11, color: C.textMuted, fontWeight: 500,
              letterSpacing: "0.02em",
            }}>
              {activeSection.label}
            </span>
            <ChevronRight size={10} color={C.border} />
          </>
        )}
        <span style={{
          fontSize: 13, fontWeight: 700, color: C.textPrimary,
          letterSpacing: "-0.01em",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {pageTitle}
        </span>
      </div>

      {/* Right cluster */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {/* Clock */}
        <span style={{
          fontSize: 11.5, color: C.textMuted,
          fontFamily: MONO,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.06em",
        }}>
          {clock}
        </span>

        {/* LIVE pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "3px 9px",
          background: "rgba(74,124,89,0.10)",
          border: "1px solid rgba(74,124,89,0.22)",
          borderRadius: 99,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: "50%", background: "#4a7c59",
            animation: "liveGlow 2.4s ease infinite",
          }} />
          <span style={{
            fontSize: 9, fontWeight: 700,
            letterSpacing: "0.14em", color: "#4a7c59",
            textTransform: "uppercase",
            fontFamily: FONT,
          }}>
            LIVE
          </span>
        </div>
      </div>

      <style>{`
        @keyframes liveGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,124,89,0.5); }
          50%       { box-shadow: 0 0 0 4px rgba(74,124,89,0); }
        }
        @media (max-width: 768px) {
          #planora-rail    { display: none !important; }
          #planora-topbar  { left: 0 !important; }
          #planora-main    { margin-left: 0 !important; padding-bottom: 64px !important; }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

// ── Mobile full menu overlay ───────────────────────────────────────────
function MobileMenuOverlay({ open, onClose }) {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(22,17,12,0.99)",
            overflowY: "auto",
            paddingBottom: 80,
            fontFamily: FONT,
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "16px 20px",
            borderBottom: `1px solid ${C.border}`,
          }}>
            <div style={{
              width: 28, height: 28,
              background: C.gold,
              borderRadius: 7,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#1a1410", fontFamily: DISPLAY }}>P</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textPrimary, fontFamily: DISPLAY }}>PLANORA</div>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginTop: 1 }}>TERMINAL</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 4 }}>
              <X size={18} />
            </button>
          </div>

          {/* All sections */}
          {SECTIONS.map(section => (
            <div key={section.id}>
              <div style={{
                padding: "14px 20px 6px",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: C.textMuted,
              }}>
                {section.label}
              </div>
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.path}
                    onClick={() => { navigate(item.path); onClose(); }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "10px 20px",
                      background: "none", border: "none", cursor: "pointer",
                      color: C.textSec, fontSize: 13.5,
                      fontFamily: FONT, textAlign: "left",
                    }}
                  >
                    <Icon size={15} color={C.textMuted} />
                    {item.label}
                  </motion.button>
                );
              })}
            </div>
          ))}

          <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}`, marginTop: 8 }}>
            <motion.button
              onClick={() => { navigate("/"); onClose(); }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "none",
                border: `1px solid ${C.borderSub}`,
                borderRadius: 8, padding: "10px 14px",
                cursor: "pointer", color: C.textMuted, fontSize: 13,
                fontFamily: FONT,
              }}
            >
              Back to Home
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Mobile Bottom Nav ──────────────────────────────────────────────────
const MOBILE_QUICK = [
  { label: "Markets",  icon: LayoutDashboard, path: "/dashboard"         },
  { label: "Macro",    icon: CalendarDays,    path: "/economic-calendar" },
  { label: "Analysis", icon: ShieldAlert,     path: "/RiskAnalysis"      },
  { label: "Calculators", icon: Calculator,   path: "/Calculators"       },
  { label: "AI",       icon: Brain,           path: "/planora-ai"        },
];

function MobileNav() {
  const { pathname } = useLocation();
  return (
    <nav
      id="t-mobile-bottom-nav"
      style={{
        display: "none",
        position: "fixed", bottom: 0, left: 0, right: 0, height: 58,
        background: "rgba(22,17,12,0.99)",
        borderTop: `1px solid ${C.border}`,
        zIndex: 50, flexDirection: "row",
        fontFamily: FONT,
      }}
    >
      {MOBILE_QUICK.map(item => {
        const Icon = item.icon;
        const active = pathname === item.path || pathname.startsWith(item.path + "/");
        return (
          <NavLink
            key={item.path}
            to={item.path}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 3,
              textDecoration: "none",
              color: active ? C.gold : C.textMuted,
              borderTop: `2px solid ${active ? C.gold : "transparent"}`,
              paddingTop: 2,
            }}
          >
            <Icon size={17} />
            <span style={{
              fontSize: 9, fontWeight: 600,
              letterSpacing: "0.07em", textTransform: "uppercase",
            }}>
              {item.label}
            </span>
          </NavLink>
        );
      })}
      <style>{`@media (max-width: 768px) { #t-mobile-bottom-nav { display: flex !important; } }`}</style>
    </nav>
  );
}

// ── Welcome Modal ──────────────────────────────────────────────────────
const WELCOME_KEY = "planora_welcome_seen";

const FEATURE_CARDS = [
  {
    icon: TrendingUp, color: "#4a7c59",
    bg: "rgba(74,124,89,0.07)", border: "rgba(74,124,89,0.18)",
    title: "Markets",
    desc: "Live dashboards, sector heatmaps, stock screener, crypto, top performers, and real-time news.",
  },
  {
    icon: CalendarDays, color: C.gold,
    bg: C.goldDim, border: C.goldBorder,
    title: "Macro",
    desc: "Economic calendar, Fed watch, labor markets, energy prices, and real estate trends.",
  },
  {
    icon: BarChart2, color: "#818cf8",
    bg: "rgba(129,140,248,0.06)", border: "rgba(129,140,248,0.16)",
    title: "Analysis",
    desc: "Risk analysis, watchlist, market breadth, political intelligence, and insider filings.",
  },
  {
    icon: Sparkles, color: "#00B4C6",
    bg: "rgba(0,180,198,0.06)", border: "rgba(0,180,198,0.16)",
    title: "Wealth",
    desc: "Budget planner, calculators, future planning, tax strategy, net worth, and brokerage guides.",
  },
];

function WelcomeModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(16,12,9,0.92)",
        backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem",
        fontFamily: FONT,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 30, delay: 0.06 }}
        style={{
          background: C.surface,
          border: `1px solid ${C.borderSub}`,
          borderRadius: 20, width: "100%", maxWidth: 640,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 48px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,169,110,0.08)",
        }}
      >
        {/* Warm gold stripe */}
        <div style={{
          height: 1.5,
          background: `linear-gradient(90deg, ${C.gold} 0%, rgba(201,169,110,0.2) 55%, transparent 100%)`,
          borderRadius: "20px 20px 0 0",
        }} />

        <div style={{ padding: "2rem" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.5rem" }}>
            <div style={{
              width: 44, height: 44,
              background: C.gold,
              borderRadius: 11,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 0 28px rgba(201,169,110,0.2)",
            }}>
              <span style={{ fontSize: "1.375rem", fontWeight: 800, color: "#1a1410", lineHeight: 1, fontFamily: DISPLAY }}>P</span>
            </div>
            <div>
              <div style={{
                fontWeight: 700, fontSize: "1rem",
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: C.textPrimary, lineHeight: 1.1,
                fontFamily: DISPLAY,
              }}>
                PLANORA
              </div>
              <div style={{
                fontSize: "0.5625rem", fontWeight: 700,
                letterSpacing: "0.22em", textTransform: "uppercase",
                color: C.gold, marginTop: 2,
              }}>
                FINANCIAL TERMINAL
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "rgba(74,124,89,0.09)", border: "1px solid rgba(74,124,89,0.22)", borderRadius: 99 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4a7c59", animation: "liveGlow 2.4s ease infinite" }} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#4a7c59", textTransform: "uppercase" }}>LIVE</span>
            </div>
          </div>

          <h2 style={{
            fontSize: "1.375rem", fontWeight: 700, color: C.textPrimary,
            letterSpacing: "-0.02em", margin: "0 0 0.5rem 0", lineHeight: 1.25,
            fontFamily: DISPLAY,
          }}>
            Welcome to your personal financial intelligence hub.
          </h2>
          <p style={{
            fontSize: 13, color: C.gold, fontWeight: 600,
            letterSpacing: "0.01em", margin: "0 0 1.25rem 0",
          }}>
            Institutional-grade tools. Built for everyone.
          </p>

          <p style={{
            fontSize: "0.9375rem", color: C.textSec,
            lineHeight: 1.8, margin: "0 0 1.5rem 0",
          }}>
            Planora Terminal brings together tools, data, and education once reserved for Wall Street professionals — putting them directly in your hands. Track markets, plan for retirement, understand tax strategy, or start learning how money works.
          </p>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "0.625rem", marginBottom: "1.25rem",
          }}>
            {FEATURE_CARDS.map(card => {
              const Icon = card.icon;
              return (
                <div key={card.title} style={{
                  background: card.bg,
                  border: `1px solid ${card.border}`,
                  borderRadius: 12, padding: "0.875rem 1rem",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Icon size={13} color={card.color} />
                    <span style={{
                      fontSize: "0.8125rem", fontWeight: 700,
                      color: card.color, letterSpacing: "0.02em",
                    }}>
                      {card.title}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: C.textMuted, lineHeight: 1.6, margin: 0 }}>
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div style={{
            background: C.goldDim,
            border: `1px solid ${C.goldBorder}`,
            borderRadius: 10, padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
          }}>
            <p style={{ fontSize: "0.8125rem", color: C.textMuted, lineHeight: 1.6, margin: 0 }}>
              <span style={{ color: C.gold, fontWeight: 700 }}>For educational purposes only.</span>{" "}
              Planora Terminal is designed to help you understand financial concepts, explore market data, and plan your personal finances. It is not a licensed financial advisor and nothing here constitutes investment, tax, or legal advice.
            </p>
          </div>

          <motion.button
            whileHover={{ filter: "brightness(1.08)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            style={{
              width: "100%", padding: "0.9375rem",
              background: C.gold,
              border: "none", borderRadius: 10, cursor: "pointer",
              fontSize: "0.9375rem", fontWeight: 700,
              color: "#1a1410", letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: DISPLAY,
              boxShadow: "0 4px 24px rgba(201,169,110,0.22)",
            }}
          >
            Enter Terminal
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────
export default function Layout({ children }) {
  const [openSectionId,  setOpenSectionId]  = useState(null);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [showWelcome,    setShowWelcome]    = useState(false);
  const activeSection = useActiveSection();
  const { pathname }  = useLocation();

  // Close flyout on navigation
  useEffect(() => { setOpenSectionId(null); }, [pathname]);

  // Close flyout on outside click or Escape
  useEffect(() => {
    if (!openSectionId) return;

    const onPointer = (e) => {
      const rail   = document.getElementById("planora-rail");
      const flyout = document.getElementById("planora-flyout");
      if (rail   && rail.contains(e.target))   return;
      if (flyout && flyout.contains(e.target)) return;
      setOpenSectionId(null);
    };

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpenSectionId(null);
      }
    };

    window.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("keydown",     onKey,     true);
    return () => {
      window.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("keydown",     onKey,     true);
    };
  }, [openSectionId]);

  const handleSectionClick = useCallback((id) => {
    setOpenSectionId(prev => (prev === id ? null : id));
  }, []);

  const closeFlyout  = useCallback(() => setOpenSectionId(null), []);
  const closeWelcome = useCallback(() => {
    sessionStorage.setItem(WELCOME_KEY, "1");
    setShowWelcome(false);
  }, []);

  const openSection = SECTIONS.find(s => s.id === openSectionId) ?? null;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: FONT }}>
      {/* Welcome modal */}
      <AnimatePresence>
        {showWelcome && <WelcomeModal onClose={closeWelcome} />}
      </AnimatePresence>

      {/* Icon Rail */}
      <Rail
        activeSection={activeSection}
        openSectionId={openSectionId}
        onSectionClick={handleSectionClick}
      />

      {/* Flyout panel */}
      <FlyoutPanel section={openSection} onClose={closeFlyout} />

      {/* Top bar */}
      <TopBar onMobileMenu={() => setMobileOpen(true)} />

      {/* Mobile overlay menu */}
      <MobileMenuOverlay open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <main
        id="planora-main"
        style={{
          marginLeft: RAIL_W,
          paddingTop: 48,
          minHeight: "100vh",
          background: C.bg,
        }}
      >
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          style={{ padding: "1.25rem 1.25rem 2rem", maxWidth: 1400, margin: "0 auto" }}
        >
          {FUN_MAP[pathname] && <FUNBridge link={FUN_MAP[pathname]} />}
          {children}
        </motion.div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
