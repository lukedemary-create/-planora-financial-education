import React from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  History, Landmark, Vote, Briefcase, ShieldAlert, 
  DollarSign, Users, FileText, Calculator, Settings, Target, BarChart3 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const moreItems = [
  { label: "The Analyst", icon: BarChart3, path: "/TheAnalyst", color: "#00d4aa" },
  { label: "Budget Planner", icon: DollarSign, path: "/BudgetPlanner", color: "#06b6d4" },
  { label: "Calculators", icon: Calculator, path: "/Calculators", color: "#f59e0b" },
  { label: "Estate Planning", icon: FileText, path: "/FuturePlanning", color: "#8b5cf6" },
  { label: "Market History", icon: History, path: "/MarketHistory", color: "#f59e0b" },
  { label: "The Fed & Rates", icon: Landmark, path: "/FedRates", color: "#8b5cf6" },
  { label: "Politics & Economy", icon: Vote, path: "/PoliticsEconomy", color: "#ef4444" },
  { label: "My Portfolio", icon: Briefcase, path: "/PortfolioTracker", color: "#06b6d4" },
  { label: "Risk Analysis", icon: ShieldAlert, path: "/RiskAnalysis", color: "#ec4899" },
  { label: "Wealth Counsel", icon: Users, path: "/wealth-counsel", color: "#00d4aa" },
  { label: "Settings", icon: Settings, path: "/Settings", color: "#64748b" }
];

export default function MobileMoreMenu({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e17] rounded-t-3xl border-t border-[#1e293b] max-h-[80vh] overflow-y-auto"
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
              paddingLeft: 'env(safe-area-inset-left)',
              paddingRight: 'env(safe-area-inset-right)',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          >
            <div className="sticky top-0 bg-[#0a0e17] z-10 px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">More Features</h3>
              <button
                onClick={onClose}
                className="w-11 h-11 rounded-full bg-[#1e293b] hover:bg-[#2d3c54] flex items-center justify-center transition-colors active:scale-95 min-h-[44px] min-w-[44px] touch-manipulation"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                aria-label="Close more menu"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#111827] border border-[#1e293b] hover:border-[#00d4aa]/30 transition-all active:scale-95 min-h-[88px] touch-manipulation"
                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                    aria-label={`Go to ${item.label}`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${item.color}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    <span className="text-sm font-medium text-white text-center">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}