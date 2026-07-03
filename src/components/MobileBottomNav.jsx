import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, TrendingUp, Sparkles, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, path: "/dashboard" },
  { label: "Learn", icon: BookOpen, path: "/education-hub" },
  { label: "Markets", icon: TrendingUp, path: "/terminal" },
  { label: "Reports", icon: Sparkles, path: "/financial-reports" },
  { label: "More", icon: Menu, path: "/more" }
];

export default function MobileBottomNav({ onMoreClick }) {
  const location = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e17]/95 backdrop-blur-xl border-t border-[#1e293b]"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = item.path === "/more" ? false : location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          const Icon = item.icon;

          if (item.path === "/more") {
            return (
              <button
                key={item.path}
                onClick={onMoreClick}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[64px] min-h-[44px]",
                  "active:scale-95 touch-manipulation"
                )}
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                aria-label="Open more menu"
              >
                <Icon className={cn("w-5 h-5", "text-[#94a3b8]")} />
                <span className={cn("text-[10px] font-medium", "text-[#94a3b8]")}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[64px] min-h-[44px]",
                isActive ? "bg-[#00d4aa]/10" : "",
                "active:scale-95 touch-manipulation"
              )}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-[#00d4aa]" : "text-[#94a3b8]")} />
              <span className={cn("text-[10px] font-medium", isActive ? "text-[#00d4aa]" : "text-[#94a3b8]")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}