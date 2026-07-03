import React, { useState } from "react";
import GlassCard from "../shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileSelect, MobileSelectItem, MobileSelectContent } from "@/components/ui/mobile-select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Target, TrendingUp, Calendar, CheckCircle2, AlertCircle, Clock, Sparkles, FileText, Wallet, X, Shield, Umbrella, Home, CreditCard, GraduationCap, Plane, Car, Heart, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

const PRIORITY_CONFIG = {
  critical: { label: "Critical", color: "#ef4444", bg: "bg-[#ef4444]/10", text: "text-[#ef4444]", border: "border-[#ef4444]/20" },
  high: { label: "High", color: "#f59e0b", bg: "bg-[#f59e0b]/10", text: "text-[#f59e0b]", border: "border-[#f59e0b]/20" },
  medium: { label: "Medium", color: "#3b82f6", bg: "bg-[#3b82f6]/10", text: "text-[#3b82f6]", border: "border-[#3b82f6]/20" },
  low: { label: "Low", color: "#64748b", bg: "bg-[#64748b]/10", text: "text-[#64748b]", border: "border-[#64748b]/20" },
};

const GOAL_PRESETS = [
  { name: "Emergency Fund", icon: Shield, reportHint: "Cash Flow Optimizer" },
  { name: "Retirement (IRA/401k)", icon: Umbrella, reportHint: "Retirement Planner" },
  { name: "Home Down Payment", icon: Home, reportHint: "Mortgage Readiness" },
  { name: "Pay Off Debt", icon: CreditCard, reportHint: "Debt Strategist" },
  { name: "College / Education", icon: GraduationCap, reportHint: "Education Funding" },
  { name: "Vacation", icon: Plane, reportHint: "Vacation Budget" },
  { name: "New Vehicle", icon: Car, reportHint: "Auto Purchase" },
  { name: "Wedding", icon: Heart, reportHint: "Event Planning" },
  { name: "Start a Business", icon: Briefcase, reportHint: "Business Launch" },
  { name: "Investment Account", icon: TrendingUp, reportHint: "Portfolio Builder" },
];

const BREAKDOWN_REPORT_LINKS = [
  { name: "Cash Flow Optimizer", keywords: ["emergency", "fund", "cash", "savings"] },
  { name: "Retirement Planner", keywords: ["retirement", "ira", "401k", "pension"] },
  { name: "Mortgage Readiness", keywords: ["home", "house", "mortgage", "down payment"] },
  { name: "Debt Strategist", keywords: ["debt", "pay off", "loan", "credit"] },
  { name: "Education Funding", keywords: ["college", "education", "tuition", "school"] },
  { name: "Portfolio Builder", keywords: ["investment", "portfolio", "stocks", "invest"] },
];

function calcMonthsToGoal(target, current, monthly) {
  const remaining = (target || 0) - (current || 0);
  if (remaining <= 0) return 0;
  if (!monthly || monthly <= 0) return null;
  return Math.ceil(remaining / monthly);
}

function formatMonths(months) {
  if (months === null) return "—";
  if (months <= 0) return "Achieved!";
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs === 0) return `${mos}mo`;
  if (mos === 0) return `${yrs}yr`;
  return `${yrs}yr ${mos}mo`;
}

function projectedDate(months) {
  if (!months || months <= 0) return null;
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function isOnTrack(goal) {
  if (!goal.target_date || !goal.monthly_contribution) return null;
  const remaining = (goal.target_amount || 0) - (goal.current_amount || 0);
  if (remaining <= 0) return true;
  const target = new Date(goal.target_date);
  const now = new Date();
  const monthsLeft = Math.max(1, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
  const needed = remaining / monthsLeft;
  return (goal.monthly_contribution || 0) >= needed;
}

function suggestReport(goalName) {
  const lowerName = (goalName || "").toLowerCase();
  for (const report of BREAKDOWN_REPORT_LINKS) {
    if (report.keywords.some(kw => lowerName.includes(kw))) {
      return report.name;
    }
  }
  return null;
}

export default function GoalsTab({ plan, onChange }) {
  const [showPresets, setShowPresets] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState(null);
  const goals = plan.goals || [];
  const accounts = plan.accounts || [];

  const addGoal = (preset = null) => {
    const newGoal = {
      id: Date.now().toString(),
      name: preset?.name || "",
      target_amount: 0,
      current_amount: 0,
      target_date: "",
      priority: "medium",
      monthly_contribution: 0,
      category: "general"
    };
    onChange({ ...plan, goals: [...goals, newGoal] });
    setShowPresets(false);
  };

  const removeGoal = (id) => onChange({ ...plan, goals: goals.filter(g => g.id !== id) });
  const updateGoal = (id, field, value) => onChange({
    ...plan, goals: goals.map(g => g.id === id ? { ...g, [field]: value } : g)
  });

  const updateGoalFunding = (goalId, fundingAccounts) => {
    updateGoal(goalId, "funding_accounts", fundingAccounts);
  };

  const totalTarget = goals.reduce((s, g) => s + (g.target_amount || 0), 0);
  const totalCurrent = goals.reduce((s, g) => s + (g.current_amount || 0), 0);
  const totalMonthly = goals.reduce((s, g) => s + (parseFloat(g.monthly_contribution) || 0), 0);
  const onTrackCount = goals.filter(g => isOnTrack(g) === true).length;
  const behindCount = goals.filter(g => isOnTrack(g) === false).length;
  const achievedCount = goals.filter(g => {
    const progress = g.target_amount > 0 ? ((g.current_amount || 0) / g.target_amount) * 100 : 0;
    return progress >= 100;
  }).length;

  const sortedGoals = [...goals].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.priority] || 2) - (order[b.priority] || 2);
  });

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Goals", value: goals.length, display: goals.length.toString(), color: "#06b6d4", icon: Target },
          { label: "Achieved", value: achievedCount, display: achievedCount.toString(), color: "#00d4aa", icon: CheckCircle2 },
          { label: "Total Saved", value: totalCurrent, display: `$${totalCurrent.toLocaleString()}`, color: "#3b82f6", icon: TrendingUp },
          { label: "Monthly Funding", value: totalMonthly, display: `$${totalMonthly.toLocaleString()}`, color: "#f59e0b", icon: Calendar },
        ].map(s => {
          const Icon = s.icon;
          return (
            <GlassCard key={s.label} className="p-4 relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-xl transition-all" style={{ background: `${s.color}15` }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                </div>
                <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.display}</p>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* On-track status */}
      {goals.length > 0 && (onTrackCount > 0 || behindCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {onTrackCount > 0 && (
            <div className="flex items-center gap-2 bg-[#00d4aa]/10 border border-[#00d4aa]/20 rounded-xl px-4 py-2">
              <CheckCircle2 className="w-4 h-4 text-[#00d4aa]" />
              <span className="text-sm text-[#00d4aa]">{onTrackCount} goal{onTrackCount > 1 ? "s" : ""} on track</span>
            </div>
          )}
          {behindCount > 0 && (
            <div className="flex items-center gap-2 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-xl px-4 py-2">
              <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-sm text-[#f59e0b]">{behindCount} goal{behindCount > 1 ? "s" : ""} need{behindCount === 1 ? "s" : ""} attention</span>
            </div>
          )}
        </div>
      )}

      {/* Goal List */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-[#06b6d4]" /> Financial Milestones
          </h3>
          <div className="flex gap-2">
            <Button onClick={() => setShowPresets(!showPresets)} size="sm" variant="outline" className="border-[#1e293b] text-[#94a3b8] text-xs touch-manipulation active:scale-95" aria-label="Show preset goals">
              Quick Add
            </Button>
            <Button onClick={() => addGoal()} size="sm" className="bg-[#1e293b] hover:bg-[#334155] text-white text-xs border border-[#334155] touch-manipulation active:scale-95" aria-label="Add custom goal">
              <Plus className="w-3 h-3 mr-1" /> Custom Goal
            </Button>
          </div>
        </div>

        {showPresets && (
          <div className="mb-4 p-3 bg-[#0a0e17] rounded-xl border border-[#1e293b]">
            <p className="text-xs text-[#64748b] mb-2">Select a preset:</p>
            <div className="flex flex-wrap gap-2">
              {GOAL_PRESETS.map(p => (
                <button
                  key={p.name}
                  onClick={() => addGoal(p)}
                  className="px-3 py-1.5 rounded-lg text-xs border border-[#1e293b] text-[#94a3b8] hover:text-white hover:border-[#06b6d4]/40 transition-all flex items-center gap-1 touch-manipulation active:scale-95 min-h-[44px]"
                  aria-label={`Add ${p.name} goal`}
                >
                  {(() => { const PI = p.icon; return <PI size={12} />; })()} {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {goals.length === 0 ? (
          <div className="text-center py-12 text-[#64748b]">
            <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No financial goals yet. Add your first goal above.</p>
            <p className="text-xs mt-1 text-[#475569]">Examples: emergency fund, retirement, home down payment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedGoals.map(goal => {
              const progress = goal.target_amount > 0 ? Math.min(100, ((goal.current_amount || 0) / goal.target_amount) * 100) : 0;
              const remaining = (goal.target_amount || 0) - (goal.current_amount || 0);
              const months = calcMonthsToGoal(goal.target_amount, goal.current_amount, goal.monthly_contribution);
              const onTrack = isOnTrack(goal);
              const pc = PRIORITY_CONFIG[goal.priority] || PRIORITY_CONFIG.medium;
              const suggestedReport = suggestReport(goal.name);

              let neededMonthly = null;
              if (goal.target_date && remaining > 0) {
                const targetD = new Date(goal.target_date);
                const now = new Date();
                const mo = Math.max(1, (targetD.getFullYear() - now.getFullYear()) * 12 + (targetD.getMonth() - now.getMonth()));
                neededMonthly = Math.ceil(remaining / mo);
              }

              return (
                <div key={goal.id} className="bg-[#0a0e17] rounded-xl p-4 border border-[#1e293b] group">
                  {/* Name + Priority + Delete */}
                  <div className="flex items-center gap-2 mb-3">
                    <Input
                      value={goal.name}
                      onChange={e => updateGoal(goal.id, "name", e.target.value)}
                      placeholder="Goal name (e.g. Emergency Fund)"
                      className="bg-[#111827] border-[#1e293b] text-white h-8 text-sm flex-1"
                      aria-label="Goal name"
                    />
                    <MobileSelect value={goal.priority} onValueChange={v => updateGoal(goal.id, "priority", v)} placeholder="Priority" className={`w-28 h-8 ${pc.bg} ${pc.text} border ${pc.border}`}>
                      <MobileSelectContent>
                        <MobileSelectItem value="critical">Critical</MobileSelectItem>
                        <MobileSelectItem value="high">High</MobileSelectItem>
                        <MobileSelectItem value="medium">Medium</MobileSelectItem>
                        <MobileSelectItem value="low">Low</MobileSelectItem>
                      </MobileSelectContent>
                    </MobileSelect>
                    <button 
                      onClick={() => removeGoal(goal.id)} 
                      className="text-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation active:scale-95"
                      aria-label={`Remove ${goal.name} goal`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: "Target Amount", field: "target_amount", value: goal.target_amount },
                      { label: "Saved So Far", field: "current_amount", value: goal.current_amount },
                      { label: "Monthly Contribution", field: "monthly_contribution", value: goal.monthly_contribution },
                    ].map(f => (
                      <div key={f.field}>
                        <p className="text-xs text-[#64748b] mb-1">{f.label}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-[#64748b]">$</span>
                          <Input
                            type="number"
                            value={f.value || ""}
                            onChange={e => updateGoal(goal.id, f.field, parseFloat(e.target.value) || 0)}
                            className="bg-[#111827] border-[#1e293b] text-white h-8 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Target date + on-track badge */}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#64748b]" />
                      <p className="text-xs text-[#64748b]">Target Date:</p>
                      <Input
                        type="date"
                        value={goal.target_date || ""}
                        onChange={e => updateGoal(goal.id, "target_date", e.target.value)}
                        className="bg-[#111827] border-[#1e293b] text-white h-8 text-xs w-36"
                      />
                    </div>
                    {onTrack === true && <Badge className="bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20 text-xs">✓ On Track</Badge>}
                    {onTrack === false && <Badge className="bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 text-xs">⚠ Behind</Badge>}
                  </div>

                  {/* Progress bar */}
                  {goal.target_amount > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-[#64748b] mb-1">
                        <span>${(goal.current_amount || 0).toLocaleString()} of ${(goal.target_amount || 0).toLocaleString()}</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-[#1e293b] rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2" 
                          style={{ 
                            width: `${progress}%`, 
                            backgroundColor: pc.color,
                            minWidth: progress > 0 ? '3%' : '0'
                          }}
                        >
                          {progress >= 10 && (
                            <span className="text-[10px] font-bold text-white">{progress.toFixed(0)}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Projections */}
                  <div className="flex flex-wrap gap-3 mb-3">
                    {months !== null && months > 0 && (
                      <div className="flex items-center gap-1 text-xs text-[#94a3b8]">
                        <Clock className="w-3 h-3 text-[#06b6d4]" />
                        <span>At current rate: <span className="text-white font-medium">{formatMonths(months)}</span> ({projectedDate(months)})</span>
                      </div>
                    )}
                    {neededMonthly !== null && neededMonthly > (goal.monthly_contribution || 0) && (
                      <div className="flex items-center gap-1 text-xs text-[#f59e0b]">
                        <TrendingUp className="w-3 h-3" />
                        <span>Need <span className="font-medium">${neededMonthly.toLocaleString()}/mo</span> to hit target date</span>
                      </div>
                    )}
                    {progress >= 100 && (
                      <div className="flex items-center gap-1 text-xs text-[#00d4aa]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="font-medium">Goal Achieved!</span>
                      </div>
                    )}
                  </div>

                  {/* Funding Accounts */}
                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                      className="flex items-center gap-2 text-xs text-[#06b6d4] hover:text-[#06b6d4]/80 transition-colors touch-manipulation active:scale-95"
                    >
                      <Wallet className="w-3 h-3" />
                      <span>Link Funding Accounts ({(goal.funding_accounts || []).length})</span>
                    </button>

                    {expandedGoal === goal.id && (
                      <div className="mt-3 p-3 bg-[#111827] rounded-lg border border-[#1e293b]">
                        <p className="text-xs text-[#64748b] mb-3">Select accounts to fund this goal and set allocation %:</p>
                        
                        {accounts.length === 0 ? (
                          <p className="text-xs text-[#475569] text-center py-4">No accounts available. Add accounts in the "Accounts & Net Worth" tab first.</p>
                        ) : (
                          <div className="space-y-2">
                            {accounts.map(acc => {
                              const funding = (goal.funding_accounts || []).find(f => f.account_id === acc.id);
                              const isLinked = !!funding;
                              
                              return (
                                <div key={acc.id} className="flex items-center gap-2 bg-[#0a0e17] rounded-lg p-2 border border-[#1e293b]">
                                  <input
                                    type="checkbox"
                                    checked={isLinked}
                                    onChange={(e) => {
                                      const current = goal.funding_accounts || [];
                                      if (e.target.checked) {
                                        updateGoalFunding(goal.id, [...current, { account_id: acc.id, percentage: 0 }]);
                                      } else {
                                        updateGoalFunding(goal.id, current.filter(f => f.account_id !== acc.id));
                                      }
                                    }}
                                    className="w-4 h-4 accent-[#06b6d4]"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-white truncate">{acc.name}</p>
                                    <p className="text-[10px] text-[#64748b]">${(acc.balance || 0).toLocaleString()}</p>
                                  </div>
                                  {isLinked && (
                                    <div className="flex items-center gap-1">
                                      <Input
                                        type="number"
                                        value={funding.percentage || ""}
                                        onChange={(e) => {
                                          const current = goal.funding_accounts || [];
                                          updateGoalFunding(
                                            goal.id,
                                            current.map(f => f.account_id === acc.id ? { ...f, percentage: parseFloat(e.target.value) || 0 } : f)
                                          );
                                        }}
                                        placeholder="0"
                                        className="w-16 h-7 bg-[#111827] border-[#1e293b] text-white text-xs text-center"
                                        min="0"
                                        max="100"
                                      />
                                      <span className="text-xs text-[#64748b]">%</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            
                            {(goal.funding_accounts || []).length > 0 && (
                              <div className="mt-3 pt-3 border-t border-[#1e293b]">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-[#64748b]">Total Allocation:</span>
                                  <span className={`font-medium ${
                                    (goal.funding_accounts || []).reduce((s, f) => s + (f.percentage || 0), 0) === 100 
                                      ? "text-[#00d4aa]" 
                                      : "text-[#f59e0b]"
                                  }`}>
                                    {(goal.funding_accounts || []).reduce((s, f) => s + (f.percentage || 0), 0).toFixed(0)}%
                                  </span>
                                </div>
                                {(goal.funding_accounts || []).reduce((s, f) => s + (f.percentage || 0), 0) !== 100 && (
                                  <p className="text-[10px] text-[#f59e0b] mt-1">⚠ Total should equal 100%</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Breakdown Report Link */}
                  {suggestedReport && (
                    <Link 
                      to="/financial-reports"
                      className="flex items-center gap-2 px-3 py-2 bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-lg hover:bg-[#a855f7]/15 transition-all mt-3 touch-manipulation active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-[#a855f7]" />
                      <div className="flex-1">
                        <p className="text-xs text-[#a855f7] font-medium">Get AI Guidance</p>
                        <p className="text-[10px] text-[#94a3b8]">Try the {suggestedReport} report for this goal</p>
                      </div>
                      <FileText className="w-4 h-4 text-[#a855f7]" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}