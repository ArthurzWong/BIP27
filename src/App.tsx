import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Building2,
  Users,
  Fuel,
  Cpu,
  DollarSign,
  Copy,
  Check,
  Download,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Loader2,
  BarChart3,
  Layers,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  FileCode,
  Zap,
  Tag,
  Calendar,
  X
} from 'lucide-react';
import { BipLogo } from './components/BipLogo';
import { SME_POLICY_RULES, PolicyRule } from './data/policyRules';

interface PredictionResult {
  summary: string;
  estimated_annual_cost_increase_myr: number;
  estimated_annual_benefits_myr: number;
  estimated_net_impact_myr: number;
  cost_breakdown: Array<{
    item: string;
    amount_myr: number;
    explanation: string;
  }>;
  benefits_breakdown: Array<{
    item: string;
    amount_myr: number;
    explanation: string;
  }>;
  compliance_actions: Array<{
    title: string;
    status: 'Urgent' | 'Required' | 'Optional';
    deadline: string;
    description: string;
  }>;
  strategic_recommendations: string[];
  economic_outlook_context?: string;
  rawText?: string;
}

const PRESET_SCENARIOS = [
  {
    name: 'Food & Beverage Bistro (20 staff)',
    icon: '🍽️',
    data: {
      businessName: 'Selera Nusantara Sdn Bhd',
      sector: 'Food & Beverage / Restaurant',
      annualRevenue: 1200000,
      chargeableIncome: 180000,
      employeeCount: 20,
      minWageWorkers: 14,
      monthlyDieselLiters: 150,
      foreignWorkerCount: 3,
      plannedAiSpend: 6000,
      enrolledPwp: true,
      customPrompt: 'Operating 2 casual dining outlets. We rely on 14 kitchen and service staff currently earning around RM1,500/month. We want to know how the RM1,700 floor, e-invoicing, and bank payroll affect us.',
    },
  },
  {
    name: 'Logistics & Haulage SME (8 Trucks)',
    icon: '🚚',
    data: {
      businessName: 'Laju Express Logistics',
      sector: 'Transportation & Logistics',
      annualRevenue: 2800000,
      chargeableIncome: 350000,
      employeeCount: 15,
      minWageWorkers: 8,
      monthlyDieselLiters: 3800,
      foreignWorkerCount: 2,
      plannedAiSpend: 15000,
      enrolledPwp: false,
      customPrompt: 'Fleet of 8 delivery trucks serving Peninsular routes. We consume nearly 3,800L of diesel monthly. How does the 300L BUDI Diesel quota and diesel rationalisation hit our bottom line?',
    },
  },
  {
    name: 'Light Precision Manufacturing (35 staff)',
    icon: '⚙️',
    data: {
      businessName: 'Pintar Metal Fabrication',
      sector: 'Manufacturing & Engineering',
      annualRevenue: 4500000,
      chargeableIncome: 520000,
      employeeCount: 35,
      minWageWorkers: 22,
      monthlyDieselLiters: 600,
      foreignWorkerCount: 8,
      plannedAiSpend: 36000,
      enrolledPwp: true,
      customPrompt: 'We produce metal components for E&E suppliers. We have 8 foreign operators (23% of workforce) and want to adopt robotics/AI to stay under the 10% foreign worker quota by 2030.',
    },
  },
  {
    name: 'Retail & E-Commerce Merchant',
    icon: '🛍️',
    data: {
      businessName: 'Moda Hijab Boutique',
      sector: 'Wholesale & Retail Trade',
      annualRevenue: 450000,
      chargeableIncome: 65000,
      employeeCount: 4,
      minWageWorkers: 3,
      monthlyDieselLiters: 80,
      foreignWorkerCount: 0,
      plannedAiSpend: 4800,
      enrolledPwp: false,
      customPrompt: 'Micro-retailer with RM450k revenue selling online and 1 boutique shop. Are we exempt from LHDN e-invoicing? What tax rates and digital subsidies apply to us in 2027?',
    },
  },
];

export default function App() {
  // All policy rules list (initialized with the 12 base rules, with support for user adding new custom rules)
  const [allPolicyRules, setAllPolicyRules] = useState<PolicyRule[]>(SME_POLICY_RULES);

  // Set of selected policy rule names (default: ALL 12 ADDED)
  const [selectedRuleNames, setSelectedRuleNames] = useState<string[]>(
    SME_POLICY_RULES.map((r) => r.policy_name)
  );

  // Form input states
  const [businessName, setBusinessName] = useState('Warisan Katering & Logistics');
  const [sector, setSector] = useState('Food & Beverage / Restaurant');
  const [annualRevenue, setAnnualRevenue] = useState<number | string>(1500000);
  const [chargeableIncome, setChargeableIncome] = useState<number | string>(220000);
  const [employeeCount, setEmployeeCount] = useState<number | string>(18);
  const [minWageWorkers, setMinWageWorkers] = useState<number | string>(12);
  const [monthlyDieselLiters, setMonthlyDieselLiters] = useState<number | string>(1200);
  const [foreignWorkerCount, setForeignWorkerCount] = useState<number | string>(3);
  const [plannedAiSpend, setPlannedAiSpend] = useState<number | string>(18000);
  const [enrolledPwp, setEnrolledPwp] = useState<boolean>(true);
  const [customPrompt, setCustomPrompt] = useState<string>(
    'We run a central kitchen with 4 delivery vans. We want to know our 2027 payroll cost increase with the RM1,700 minimum wage, BUDI Diesel quotas, and AI tax reliefs.'
  );

  // Status and result states
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);

  // New custom rule creation form state
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDescription, setNewRuleDescription] = useState('');
  const [newRuleEffectiveDate, setNewRuleEffectiveDate] = useState('2027-01-01');
  const [newRuleImpactType, setNewRuleImpactType] = useState<'cost' | 'revenue' | 'compliance'>('compliance');
  const [newRuleTargetSector, setNewRuleTargetSector] = useState('All MSMEs');

  // Multi-scenario batch state
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchResults, setBatchResults] = useState<Array<{ name: string; icon: string; prediction: PredictionResult }>>([]);
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'json'>('single');

  // Policy selection handlers
  const handleAddAllRules = () => {
    setSelectedRuleNames(allPolicyRules.map((r) => r.policy_name));
  };

  const handleClearAllRules = () => {
    setSelectedRuleNames([]);
  };

  const toggleRule = (ruleName: string) => {
    setSelectedRuleNames((prev) =>
      prev.includes(ruleName) ? prev.filter((n) => n !== ruleName) : [...prev, ruleName]
    );
  };

  // Add custom rule
  const handleAddNewRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRuleDescription.trim()) return;

    const newRule: PolicyRule = {
      policy_name: newRuleName.trim(),
      description: newRuleDescription.trim(),
      effective_date: newRuleEffectiveDate.trim(),
      impact_type: newRuleImpactType,
      target_sector: newRuleTargetSector.trim(),
      category: 'compliance',
    };

    setAllPolicyRules((prev) => [...prev, newRule]);
    setSelectedRuleNames((prev) => [...prev, newRule.policy_name]);

    // Reset modal form
    setNewRuleName('');
    setNewRuleDescription('');
    setNewRuleEffectiveDate('2027-01-01');
    setNewRuleImpactType('compliance');
    setNewRuleTargetSector('All MSMEs');
    setShowAddRuleModal(false);
  };

  // Apply preset scenario
  const handleApplyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setBusinessName(preset.data.businessName);
    setSector(preset.data.sector);
    setAnnualRevenue(preset.data.annualRevenue);
    setChargeableIncome(preset.data.chargeableIncome);
    setEmployeeCount(preset.data.employeeCount);
    setMinWageWorkers(preset.data.minWageWorkers);
    setMonthlyDieselLiters(preset.data.monthlyDieselLiters);
    setForeignWorkerCount(preset.data.foreignWorkerCount);
    setPlannedAiSpend(preset.data.plannedAiSpend);
    setEnrolledPwp(preset.data.enrolledPwp);
    setCustomPrompt(preset.data.customPrompt);
    setError(null);
  };

  // Reset form
  const handleReset = () => {
    setBusinessName('');
    setSector('Wholesale & Retail Trade');
    setAnnualRevenue('');
    setChargeableIncome('');
    setEmployeeCount('');
    setMinWageWorkers('');
    setMonthlyDieselLiters('');
    setForeignWorkerCount('');
    setPlannedAiSpend('');
    setEnrolledPwp(false);
    setCustomPrompt('');
    setPrediction(null);
    setError(null);
  };

  // Selected policies object array
  const activeSelectedPolicies = useMemo(() => {
    return allPolicyRules.filter((r) => selectedRuleNames.includes(r.policy_name));
  }, [allPolicyRules, selectedRuleNames]);

  // Submit to Gemini API via server endpoint
  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          sector,
          annualRevenue: Number(annualRevenue) || 0,
          chargeableIncome: Number(chargeableIncome) || 0,
          employeeCount: Number(employeeCount) || 0,
          minWageWorkers: Number(minWageWorkers) || 0,
          monthlyDieselLiters: Number(monthlyDieselLiters) || 0,
          foreignWorkerCount: Number(foreignWorkerCount) || 0,
          plannedAiSpend: Number(plannedAiSpend) || 0,
          enrolledPwp,
          customPrompt,
          selectedPolicies: activeSelectedPolicies,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prediction from Gemini API');
      }

      if (data.prediction) {
        setPrediction(data.prediction);
        setActiveTab('single');
      } else {
        throw new Error('No prediction payload received');
      }
    } catch (err: any) {
      console.error('Prediction call failed:', err);
      setError(err.message || 'An unexpected error occurred while calling the Gemini API');
    } finally {
      setIsLoading(false);
    }
  };

  // Batch Predict All 4 Presets at once
  const handleBatchPredictAll = async () => {
    setIsBatchRunning(true);
    setError(null);
    const results: Array<{ name: string; icon: string; prediction: PredictionResult }> = [];

    try {
      for (const preset of PRESET_SCENARIOS) {
        const response = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: preset.data.businessName,
            sector: preset.data.sector,
            annualRevenue: preset.data.annualRevenue,
            chargeableIncome: preset.data.chargeableIncome,
            employeeCount: preset.data.employeeCount,
            minWageWorkers: preset.data.minWageWorkers,
            monthlyDieselLiters: preset.data.monthlyDieselLiters,
            foreignWorkerCount: preset.data.foreignWorkerCount,
            plannedAiSpend: preset.data.plannedAiSpend,
            enrolledPwp: preset.data.enrolledPwp,
            customPrompt: preset.data.customPrompt,
            selectedPolicies: activeSelectedPolicies,
          }),
        });

        const data = await response.json();
        if (response.ok && data.prediction) {
          results.push({
            name: preset.name,
            icon: preset.icon,
            prediction: data.prediction,
          });
        }
      }

      setBatchResults(results);
      setActiveTab('batch');
    } catch (err: any) {
      console.error('Batch predict error:', err);
      setError('Encountered an issue running batch simulation: ' + err.message);
    } finally {
      setIsBatchRunning(false);
    }
  };

  // Copy prediction JSON
  const handleCopyPrediction = () => {
    if (!prediction) return;
    navigator.clipboard.writeText(JSON.stringify(prediction, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Download prediction JSON
  const handleDownloadPrediction = () => {
    if (!prediction) return;
    const blob = new Blob([JSON.stringify(prediction, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget_impact_predictor_2027_${businessName.replace(/\s+/g, '_').toLowerCase() || 'sme'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white antialiased">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BipLogo size="md" showText={true} />
            <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-slate-800">
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Gemini 3.8 Flash
              </span>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Ekonomi MADANI
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View All Policies */}
            <button
              onClick={() => setShowPoliciesModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-all flex items-center space-x-1.5 border border-slate-700"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">12 Baseline Policy Rules</span>
              <span className="sm:hidden">Rules</span>
            </button>

            {/* Add Custom Policy Button */}
            <button
              onClick={() => setShowAddRuleModal(true)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-600 text-xs font-medium text-white transition-all flex items-center space-x-1.5 shadow-sm shadow-cyan-600/20 border border-cyan-500/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Rule</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Preset Selector Banner */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                1-Click Quick Scenarios:
              </span>
              <span className="text-xs text-slate-500">Auto-populate with tested SME profiles</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBatchPredictAll}
                disabled={isBatchRunning}
                className="text-xs font-medium px-2.5 py-1 rounded-md bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 flex items-center space-x-1"
              >
                {isBatchRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Zap className="w-3 h-3 text-purple-400" />
                )}
                <span>Run All 4 Scenarios</span>
              </button>
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {PRESET_SCENARIOS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 text-left transition-all group"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-base">{preset.icon}</span>
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                    {preset.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Grid: Left is Form with 'Predict' Button, Right is Output */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Business Input Form */}
          <div className="lg:col-span-5 bg-slate-900/80 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>SME Business Profile Form</span>
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">Step 1 of 2</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Configure your SME operational parameters to predict 2027 regulatory and financial outcomes.
              </p>
            </div>

            <form onSubmit={handlePredict} className="space-y-4">
              {/* Business Name & Sector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Business / Enterprise Name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., Jaya Food Trading"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Industry Sector
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Food & Beverage / Restaurant">Food & Beverage / Restaurant</option>
                    <option value="Transportation & Logistics">Transportation & Logistics</option>
                    <option value="Manufacturing & Engineering">Manufacturing & Engineering</option>
                    <option value="Wholesale & Retail Trade">Wholesale & Retail Trade</option>
                    <option value="Construction & Contractors">Construction & Contractors (G1-G4)</option>
                    <option value="Agriculture & Plantation">Agriculture & Plantation</option>
                    <option value="ICT & Digital Services">ICT & Digital Services</option>
                    <option value="Professional & Business Services">Professional & Business Services</option>
                  </select>
                </div>
              </div>

              {/* Financials: Revenue & Chargeable Income */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Annual Gross Revenue (RM)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(e.target.value)}
                    placeholder="e.g. 1500000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">e-Invoicing threshold: RM500k</span>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Annual Chargeable Profit (RM)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={chargeableIncome}
                    onChange={(e) => setChargeableIncome(e.target.value)}
                    placeholder="e.g. 250000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">15% on 1st RM150k, 17% up to RM600k</span>
                </div>
              </div>

              {/* Workforce: Total Staff & Min Wage Workers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Total Employees</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1 flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-rose-400" />
                    <span>Minimum Wage Workers</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minWageWorkers}
                    onChange={(e) => setMinWageWorkers(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Statutory floor: RM1,700/month</span>
                </div>
              </div>

              {/* Operations: Monthly Diesel & Foreign Workers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1 flex items-center space-x-1">
                    <Fuel className="w-3.5 h-3.5 text-amber-400" />
                    <span>Monthly Diesel/Fuel (Litres)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={monthlyDieselLiters}
                    onChange={(e) => setMonthlyDieselLiters(e.target.value)}
                    placeholder="e.g. 1200"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">BUDI quota: 300L/mo subsidized</span>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1 flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                    <span>Foreign Workers Employed</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={foreignWorkerCount}
                    onChange={(e) => setForeignWorkerCount(e.target.value)}
                    placeholder="e.g. 3"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">10% threshold quota ceiling</span>
                </div>
              </div>

              {/* Tech Spend & PWP Scheme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1 flex items-center space-x-1">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Annual AI / Cloud Subscriptions (RM)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={plannedAiSpend}
                    onChange={(e) => setPlannedAiSpend(e.target.value)}
                    placeholder="e.g. 12000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Eligible for Double Tax Deduction</span>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={enrolledPwp}
                      onChange={(e) => setEnrolledPwp(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-slate-300">
                      Participating in PWP (Progressive Wage Policy)
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Provides RM200-RM300/mo cash subsidy per worker
                  </span>
                </div>
              </div>

              {/* APPLICABLE POLICY RULES (WITH "ADD ALL" BUTTON) */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-white">Policy Rules in Evaluation</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                      {selectedRuleNames.length}/{allPolicyRules.length} Added
                    </span>
                  </div>

                  {/* "ADD ALL" CONTROLS */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={handleAddAllRules}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-all border border-indigo-500/30"
                    >
                      Add All ({allPolicyRules.length})
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllRules}
                      className="text-[11px] font-medium px-1.5 py-0.5 rounded text-slate-400 hover:text-slate-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Compact rule toggle list */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {allPolicyRules.map((r, i) => {
                    const isChecked = selectedRuleNames.includes(r.policy_name);
                    return (
                      <div
                        key={i}
                        onClick={() => toggleRule(r.policy_name)}
                        className={`p-2 rounded-lg text-[11px] cursor-pointer flex items-start justify-between gap-2 border transition-all ${
                          isChecked
                            ? 'bg-slate-900 border-indigo-500/40 text-slate-200'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start space-x-2 flex-1">
                          {isChecked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                          )}
                          <span className="font-medium line-clamp-1">{r.policy_name}</span>
                        </div>
                        <span
                          className={`text-[9px] px-1 py-0.2 uppercase font-semibold rounded shrink-0 ${
                            r.impact_type === 'cost'
                              ? 'text-rose-400 bg-rose-500/10'
                              : r.impact_type === 'revenue'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-cyan-400 bg-cyan-500/10'
                          }`}
                        >
                          {r.impact_type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Specific Scenario Questions */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Custom Inquiries & Operational Context
                </label>
                <textarea
                  rows={2}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ask specific questions or describe unique business circumstances..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* PREDICT BUTTON (PROMINENT) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Predicting Policy Impact with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="tracking-wide">
                      Predict 2027 Policy Impact ({selectedRuleNames.length} Rules Added)
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Gemini API Prediction Output & Batch Scenarios */}
          <div className="lg:col-span-7 space-y-5">
            {/* Nav Tabs for Results */}
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('single')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'single'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Single Prediction
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  activeTab === 'batch'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>4-Scenario Comparison</span>
                {batchResults.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-purple-500/30 text-purple-200 text-[10px] rounded-full">
                    {batchResults.length}
                  </span>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-200">Prediction Error</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* TAB: BATCH COMPARISON VIEW */}
            {activeTab === 'batch' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span>Comparative 4-Sector SME Impact Matrix</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Batch simulation across F&B, Logistics, Precision Manufacturing, and Retail
                    </p>
                  </div>
                  {batchResults.length === 0 && !isBatchRunning && (
                    <button
                      onClick={handleBatchPredictAll}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-500 shadow-md"
                    >
                      Run Simulation Now
                    </button>
                  )}
                </div>

                {isBatchRunning && (
                  <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-8 text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                    <p className="text-sm font-medium text-white">
                      Evaluating all 4 sector scenarios with Gemini 3.8 Flash...
                    </p>
                    <p className="text-xs text-slate-400">
                      Generating comparative cost hikes, PWP benefits, and compliance obligations.
                    </p>
                  </div>
                )}

                {batchResults.length > 0 && !isBatchRunning && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {batchResults.map((b, i) => {
                      const net = b.prediction.estimated_net_impact_myr;
                      return (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{b.icon}</span>
                              <span className="text-xs font-bold text-white">{b.name}</span>
                            </div>
                            <span
                              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                                net >= 0
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {net >= 0 ? '+' : ''}RM {Number(net).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                            {b.prediction.summary}
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-slate-800">
                            <div>
                              <span className="text-slate-400 block">Cost Increase:</span>
                              <span className="font-mono font-bold text-rose-400">
                                -RM {Number(b.prediction.estimated_annual_cost_increase_myr).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Benefits & Reliefs:</span>
                              <span className="font-mono font-bold text-emerald-400">
                                +RM {Number(b.prediction.estimated_annual_benefits_myr).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SINGLE PREDICTION VIEW */}
            {activeTab === 'single' && (
              <>
                {/* Empty State before first prediction */}
                {!prediction && !isLoading && !error && (
                  <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-8 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                      <BarChart3 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Ready for Econometric Prediction</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                        Fill in your business details or select a preset scenario on the left, then click{' '}
                        <strong className="text-indigo-300">'Predict 2027 Policy Impact'</strong> to run direct Gemini AI econometric inference.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-4 max-w-lg mx-auto">
                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                        <span className="font-semibold text-white block mb-1">1. Minimum Wage</span>
                        Assesses RM1,700/mo impact and 3-5% structured increment.
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                        <span className="font-semibold text-white block mb-1">2. Fuel & Diesel</span>
                        Models 300L BUDI MADANI quota vs unsubsidized diesel costs.
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                        <span className="font-semibold text-white block mb-1">3. Tax & PWP</span>
                        Calculates AI double tax deduction and PWP wage subsidies.
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading Skeleton */}
                {isLoading && (
                  <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-8 text-center space-y-4">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                    <h3 className="text-sm font-semibold text-white">
                      Consulting Malaysia Economic Outlook 2027 & Budget Rules...
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Gemini is evaluating your sector's wage elasticity, fuel exposure, tax shields, and statutory compliance timelines across all {selectedRuleNames.length} added policy rules.
                    </p>
                  </div>
                )}

                {/* Results Display */}
                {prediction && !isLoading && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    {/* Result Top Action Bar */}
                    <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-xs font-semibold text-white">Prediction Complete</span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          | {selectedRuleNames.length} Rules Grounded
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={handleCopyPrediction}
                          className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1"
                        >
                          {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedJson ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={handleDownloadPrediction}
                          className="px-2.5 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export JSON</span>
                        </button>
                      </div>
                    </div>

                    {/* Executive Summary Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-900/30 space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Executive Prediction Summary</span>
                      </h3>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {prediction.summary}
                      </p>
                    </div>

                    {/* 3 Metric Summary Boxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-rose-300">Est. Cost Increase</span>
                          <TrendingDown className="w-4 h-4 text-rose-400" />
                        </div>
                        <p className="text-lg font-bold font-mono text-white mt-1.5">
                          RM {Number(prediction.estimated_annual_cost_increase_myr || 0).toLocaleString()}
                        </p>
                        <span className="text-[10px] text-rose-300/80 block mt-0.5">Wages, fuel delta, levies</span>
                      </div>

                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-emerald-300">Est. Annual Benefits</span>
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-lg font-bold font-mono text-white mt-1.5">
                          RM {Number(prediction.estimated_annual_benefits_myr || 0).toLocaleString()}
                        </p>
                        <span className="text-[10px] text-emerald-300/80 block mt-0.5">Reliefs, PWP subsidies, quotas</span>
                      </div>

                      <div
                        className={`p-4 rounded-xl border ${
                          prediction.estimated_net_impact_myr >= 0
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-amber-500/10 border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-200">Net Annual Impact</span>
                          <DollarSign className="w-4 h-4 text-indigo-400" />
                        </div>
                        <p
                          className={`text-lg font-bold font-mono mt-1.5 ${
                            prediction.estimated_net_impact_myr >= 0 ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {prediction.estimated_net_impact_myr >= 0 ? '+' : ''}RM{' '}
                          {Number(prediction.estimated_net_impact_myr || 0).toLocaleString()}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {prediction.estimated_net_impact_myr >= 0 ? 'Net positive cash buffer' : 'Direct net cash burden'}
                        </span>
                      </div>
                    </div>

                    {/* Cost & Benefits Breakdown Side-by-Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cost Drivers */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>Cost Drivers (2027)</span>
                        </h4>
                        <div className="space-y-2">
                          {prediction.cost_breakdown?.map((c, i) => (
                            <div key={i} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-850 space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-200">{c.item}</span>
                                <span className="font-mono font-bold text-rose-400">
                                  RM {Number(c.amount_myr || 0).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-snug">{c.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Benefits & Reliefs */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Reliefs & Subsidies (2027)</span>
                        </h4>
                        <div className="space-y-2">
                          {prediction.benefits_breakdown?.map((b, i) => (
                            <div key={i} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-850 space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-200">{b.item}</span>
                                <span className="font-mono font-bold text-emerald-400">
                                  RM {Number(b.amount_myr || 0).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-snug">{b.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mandatory Compliance Action Plan */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Mandatory Compliance Checklist (2027 Deadlines)</span>
                      </h4>
                      <div className="space-y-2">
                        {prediction.compliance_actions?.map((action, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg bg-slate-950/60 border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold text-white">{action.title}</span>
                                <span
                                  className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                                    action.status === 'Urgent'
                                      ? 'bg-rose-500/20 text-rose-400'
                                      : action.status === 'Required'
                                      ? 'bg-amber-500/20 text-amber-400'
                                      : 'bg-cyan-500/20 text-cyan-400'
                                  }`}
                                >
                                  {action.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed">{action.description}</p>
                            </div>
                            <span className="text-xs text-indigo-300 font-mono shrink-0 font-medium">
                              {action.deadline}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Strategic Recommendations */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Actionable Strategic Recommendations</span>
                      </h4>
                      <ul className="space-y-2">
                        {prediction.strategic_recommendations?.map((rec, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Macro Economic Context */}
                    {prediction.economic_outlook_context && (
                      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-400 leading-relaxed italic">
                        <span className="font-semibold text-slate-300 not-italic block mb-0.5">
                          Macroeconomic Context (MOF Economic Outlook 2027):
                        </span>
                        {prediction.economic_outlook_context}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* MODAL 1: Full Policy Rules Matrix (from PDF analysis) */}
      {showPoliciesModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Budget Impact Predictor 2027: All Policy Rules ({allPolicyRules.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Grounding references from MOF Budget 2027 and Economic Outlook
                </p>
              </div>
              <button
                onClick={() => setShowPoliciesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {allPolicyRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white text-sm">{rule.policy_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        rule.impact_type === 'cost'
                          ? 'bg-rose-500/20 text-rose-400'
                          : rule.impact_type === 'revenue'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}
                    >
                      {rule.impact_type}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{rule.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-400 border-t border-slate-850">
                    <span>
                      <strong className="text-slate-300">Effective:</strong> {rule.effective_date}
                    </span>
                    <span>
                      <strong className="text-slate-300">Sector:</strong> {rule.target_sector}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Custom Policy Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Add Custom Policy Rule to Evaluation</span>
              </h3>
              <button
                onClick={() => setShowAddRuleModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewRule} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Policy Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State ESG Carbon Neutrality Incentive"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Description & Requirements
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the operational or financial rule..."
                  value={newRuleDescription}
                  onChange={(e) => setNewRuleDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Impact Type
                  </label>
                  <select
                    value={newRuleImpactType}
                    onChange={(e) => setNewRuleImpactType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="cost">Cost (Expense / Levy)</option>
                    <option value="revenue">Revenue (Relief / Subsidy)</option>
                    <option value="compliance">Compliance (Mandate / Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Effective Date
                  </label>
                  <input
                    type="text"
                    required
                    value={newRuleEffectiveDate}
                    onChange={(e) => setNewRuleEffectiveDate(e.target.value)}
                    placeholder="e.g. 2027-01-01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Target Sector
                </label>
                <input
                  type="text"
                  required
                  value={newRuleTargetSector}
                  onChange={(e) => setNewRuleTargetSector(e.target.value)}
                  placeholder="e.g. All MSMEs / Green Tech / Transport"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md"
                >
                  Add Rule to Predictor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
