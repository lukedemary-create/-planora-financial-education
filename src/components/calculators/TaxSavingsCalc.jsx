import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GlassCard from "../shared/GlassCard";
import { Receipt, PiggyBank, Lightbulb } from "lucide-react";
import { TAX_2026 } from "../../config/taxConstants2026";

export default function TaxSavingsCalc() {
  const [income, setIncome] = useState("75000");
  const [filing, setFiling] = useState("single");
  const [contributions401k, setContributions401k] = useState("0");
  const [iraContribution, setIraContribution] = useState("0");
  const [charitableDonations, setCharitableDonations] = useState("0");
  const [mortgageInterest, setMortgageInterest] = useState("0");
  const [propertyTaxes, setPropertyTaxes] = useState("0");
  const [stateTaxes, setStateTaxes] = useState("0");
  const [medicalExpenses, setMedicalExpenses] = useState("0");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const gross = parseFloat(income) || 0;
    const k401 = parseFloat(contributions401k) || 0;
    const ira = parseFloat(iraContribution) || 0;
    const charity = parseFloat(charitableDonations) || 0;
    const mortgage = parseFloat(mortgageInterest) || 0;
    const propertyTax = parseFloat(propertyTaxes) || 0;
    const stateTax = parseFloat(stateTaxes) || 0;
    const medical = parseFloat(medicalExpenses) || 0;

    // 2026 standard deduction
    const stdMap = { single: TAX_2026.standardDeduction.single, married: TAX_2026.standardDeduction.mfj, hoh: TAX_2026.standardDeduction.hoh };
    const standardDeduction = stdMap[filing] || TAX_2026.standardDeduction.single;

    // Calculate itemized deductions
    const itemizedDeductions = charity + mortgage + Math.min(propertyTax + stateTax, 10000) + Math.max(0, medical - (gross * 0.075));

    // Use the greater of standard or itemized
    const deduction = Math.max(standardDeduction, itemizedDeductions);
    const usingItemized = itemizedDeductions > standardDeduction;

    // Adjusted gross income
    const agi = gross - k401 - ira;

    // Taxable income
    const taxableIncome = Math.max(0, agi - deduction);

    // 2026 progressive tax calculation
    const bracketKey = filing === "married" ? "mfj" : filing === "hoh" ? "hoh" : "single";
    const brackets = TAX_2026.ordinaryBrackets[bracketKey];
    let tax = 0, prev = 0;
    for (const b of brackets) {
      if (taxableIncome <= prev) break;
      tax += (Math.min(taxableIncome, b.upTo) - prev) * b.rate;
      prev = b.upTo;
    }

    const effectiveRate = (tax / gross) * 100;
    const taxSavingsFrom401k = (k401 * (effectiveRate / 100));
    const taxSavingsFromIRA = (ira * (effectiveRate / 100));
    
    setResult({
      tax: Math.round(tax),
      effectiveRate: effectiveRate.toFixed(1),
      agi: Math.round(agi),
      taxableIncome: Math.round(taxableIncome),
      taxSavings: Math.round(taxSavingsFrom401k + taxSavingsFromIRA),
      takeHome: Math.round(gross - tax),
      usingItemized,
      deduction: Math.round(deduction),
      itemizedDeductions: Math.round(itemizedDeductions)
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="w-5 h-5 text-[#f59e0b]" />
        <h3 className="text-lg font-semibold text-white">Tax Savings Calculator</h3>
      </div>

      <GlassCard className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-[#94a3b8] text-xs mb-1">Annual Income ($)</Label>
            <Input value={income} onChange={(e) => setIncome(e.target.value)} type="number" className="bg-[#0a0e17] border-[#1e293b] text-white" />
          </div>
          <div>
            <Label className="text-[#94a3b8] text-xs mb-1">Filing Status</Label>
            <Select value={filing} onValueChange={setFiling}>
              <SelectTrigger className="bg-[#0a0e17] border-[#1e293b] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married Filing Jointly</SelectItem>
                <SelectItem value="hoh">Head of Household</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[#94a3b8] text-xs mb-1">401(k) Contributions ($)</Label>
            <Input value={contributions401k} onChange={(e) => setContributions401k(e.target.value)} type="number" className="bg-[#0a0e17] border-[#1e293b] text-white" />
          </div>
          <div>
            <Label className="text-[#94a3b8] text-xs mb-1">Traditional IRA ($)</Label>
            <Input value={iraContribution} onChange={(e) => setIraContribution(e.target.value)} type="number" className="bg-[#0a0e17] border-[#1e293b] text-white" />
          </div>
          <div>
            <Label className="text-[#94a3b8] text-xs mb-1">Charitable Donations ($)</Label>
            <Input value={charitableDonations} onChange={(e) => setCharitableDonations(e.target.value)} type="number" className="bg-[#0a0e17] border-[#1e293b] text-white" />
          </div>
        </div>

        <div className="border-t border-[#1e293b] pt-4 mt-4">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-[#00d4aa]" />
            Itemized Deductions (Optional)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[#94a3b8] text-xs mb-1">Mortgage Interest ($)</Label>
              <Input value={mortgageInterest} onChange={(e) => setMortgageInterest(e.target.value)} type="number" className="bg-[#0a0e17] border-[#1e293b] text-white" />
            </div>
            <div>
              <Label className="text-[#94a3b8] text-xs mb-1">Property Taxes ($)</Label>
              <Input value={propertyTaxes} onChange={(e) => setPropertyTaxes(e.target.value)} type="number" className="bg-[#0a0e17] border-[#1e293b] text-white" />
            </div>
            <div>
              <Label className="text-[#94a3b8] text-xs mb-1">State & Local Taxes ($)</Label>
              <Input value={stateTaxes} onChange={(e) => setStateTaxes(e.target.value)} type="number" className="bg-[#0a0e17] border-[#1e293b] text-white" />
            </div>
            <div>
              <Label className="text-[#94a3b8] text-xs mb-1">Medical Expenses ($)</Label>
              <Input value={medicalExpenses} onChange={(e) => setMedicalExpenses(e.target.value)} type="number" className="bg-[#0a0e17] border-[#1e293b] text-white" />
            </div>
          </div>
          <p className="text-xs text-[#64748b] mt-2">
            Note: SALT capped at $10k. Medical expenses only deductible above 7.5% of AGI.
          </p>
        </div>

        <Button onClick={calculate} className="bg-[#f59e0b] hover:bg-[#f59e0b]/80 text-black w-full md:w-auto mt-4">
          Calculate Taxes
        </Button>
      </GlassCard>

      {result && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <GlassCard>
              <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Estimated Tax</p>
              <p className="text-2xl font-bold text-[#ef4444]">${result.tax.toLocaleString()}</p>
              <p className="text-xs text-[#94a3b8] mt-1">{result.effectiveRate}% effective rate</p>
            </GlassCard>
            <GlassCard>
              <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Tax Savings</p>
              <p className="text-2xl font-bold text-[#00d4aa]">${result.taxSavings.toLocaleString()}</p>
              <p className="text-xs text-[#94a3b8] mt-1">From pre-tax contributions</p>
            </GlassCard>
            <GlassCard>
              <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Take-Home Pay</p>
              <p className="text-2xl font-bold text-[#3b82f6]">${result.takeHome.toLocaleString()}</p>
            </GlassCard>
          </div>

          <GlassCard>
            <h4 className="text-sm font-semibold text-white mb-3">Tax Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Gross Income</span>
                <span className="text-white font-medium">${parseFloat(income).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Adjusted Gross Income (AGI)</span>
                <span className="text-white font-medium">${result.agi.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Deduction ({result.usingItemized ? "Itemized" : "Standard"})</span>
                <span className="text-white font-medium">${result.deduction.toLocaleString()}</span>
              </div>
              {result.usingItemized && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748b]">Total Itemized</span>
                  <span className="text-[#64748b]">${result.itemizedDeductions.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Taxable Income</span>
                <span className="text-white font-medium">${result.taxableIncome.toLocaleString()}</span>
              </div>
              <div className="h-px bg-[#1e293b] my-2" />
              <div className="flex justify-between">
                <span className="text-[#f59e0b] font-semibold">Federal Tax Owed</span>
                <span className="text-[#f59e0b] font-bold">${result.tax.toLocaleString()}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="mt-4 bg-[#00d4aa]/5 border-[#00d4aa]/20">
            <p className="text-xs text-[#00d4aa] font-semibold mb-2 flex items-center gap-1"><Lightbulb size={12} /> Tax Savings Tip</p>
            <p className="text-sm text-[#e2e8f0]">
              Every $1,000 you contribute to a pre-tax retirement account saves you approximately ${Math.round((parseFloat(result.effectiveRate) / 100) * 1000)} in taxes this year, 
              while also growing tax-deferred for retirement.
            </p>
          </GlassCard>
        </div>
      )}
    </div>
  );
}