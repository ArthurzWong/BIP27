import { GoogleGenAI, Type } from '@google/genai';

const asNumber = (value: unknown) => Math.max(0, Number(value) || 0);

function createRulesBasedPrediction(input: Record<string, unknown>) {
  const employeeCount = asNumber(input.employeeCount);
  const minWageWorkers = asNumber(input.minWageWorkers);
  const monthlyDieselLiters = asNumber(input.monthlyDieselLiters);
  const foreignWorkerCount = asNumber(input.foreignWorkerCount);
  const plannedAiSpend = asNumber(input.plannedAiSpend);
  const chargeableIncome = asNumber(input.chargeableIncome);
  const enrolledPwp = Boolean(input.enrolledPwp);
  const businessName = String(input.businessName || 'this SME');
  const annualWageIncrease = minWageWorkers * 200 * 12;
  const annualFuelExposure = Math.max(0, monthlyDieselLiters - 300) * 0.7 * 12;
  const foreignWorkerLimit = Math.floor(employeeCount * 0.1);
  const foreignWorkerExposure = Math.max(0, foreignWorkerCount - foreignWorkerLimit) * 3000;
  const taxRate = chargeableIncome <= 150000 ? 0.15 : chargeableIncome <= 600000 ? 0.17 : 0.24;
  const aiRelief = plannedAiSpend * taxRate;
  const pwpBenefit = enrolledPwp ? minWageWorkers * 250 * 12 : 0;
  const totalCost = Math.round(annualWageIncrease + annualFuelExposure + foreignWorkerExposure);
  const totalBenefits = Math.round(aiRelief + pwpBenefit);

  return {
    summary: `${businessName} has an estimated 2027 net impact of RM ${Math.abs(totalBenefits - totalCost).toLocaleString()}. This rules-based estimate uses the selected profile inputs and published planning assumptions; confirm eligibility and final rates with the relevant agencies.`,
    estimated_annual_cost_increase_myr: totalCost,
    estimated_annual_benefits_myr: totalBenefits,
    estimated_net_impact_myr: totalBenefits - totalCost,
    cost_breakdown: [
      { item: 'Minimum-wage uplift', amount_myr: Math.round(annualWageIncrease), explanation: 'Assumes a RM200 monthly uplift for each worker currently near the statutory floor.' },
      { item: 'Fuel above BUDI quota', amount_myr: Math.round(annualFuelExposure), explanation: 'Applies a RM0.70/litre planning differential to monthly diesel use above the 300L quota.' },
      ...(foreignWorkerExposure ? [{ item: 'Foreign-worker quota exposure', amount_myr: Math.round(foreignWorkerExposure), explanation: 'Planning allowance where foreign-worker headcount exceeds 10% of the stated workforce.' }] : []),
    ],
    benefits_breakdown: [
      ...(aiRelief ? [{ item: 'AI and cloud tax relief', amount_myr: Math.round(aiRelief), explanation: `Estimated tax saving using a ${(taxRate * 100).toFixed(0)}% marginal SME tax rate on eligible digital spend.` }] : []),
      ...(pwpBenefit ? [{ item: 'Progressive Wage Policy incentive', amount_myr: Math.round(pwpBenefit), explanation: 'Uses a RM250 monthly planning assumption for eligible workers, subject to programme conditions.' }] : []),
    ],
    compliance_actions: [
      { title: 'Check e-Invoice readiness', status: 'Required', deadline: 'Before the applicable LHDN rollout date', description: 'Confirm threshold, invoicing process and MyInvois integration requirements.' },
      { title: 'Move wages through bank accounts', status: 'Required', deadline: '2027 planning cycle', description: 'Validate payroll controls and employee account records before implementation.' },
      ...(foreignWorkerExposure ? [{ title: 'Review foreign-worker quota', status: 'Urgent', deadline: 'Before 2027 workforce planning', description: 'Model recruitment, retention and automation options to reduce quota exposure.' }] : []),
    ],
    strategic_recommendations: [
      'Validate the wage baseline and phase the payroll increase into the 2027 budget.',
      'Document eligible AI and cloud subscriptions before filing any tax claim.',
      'Use the result as a planning estimate, then confirm policy eligibility with an accountant or the relevant agency.',
    ],
    economic_outlook_context: 'Rules-based planning estimate generated locally because an AI provider key is not configured. It is intended for scenario planning, not tax or legal advice.',
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      businessName,
      sector,
      annualRevenue,
      chargeableIncome,
      employeeCount,
      minWageWorkers,
      monthlyDieselLiters,
      foreignWorkerCount,
      plannedAiSpend,
      enrolledPwp,
      customPrompt,
      selectedPolicies,
    } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return res.status(200).json({
        success: true,
        engine: 'rules-based',
        prediction: createRulesBasedPrediction(req.body || {}),
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const policiesListText =
      Array.isArray(selectedPolicies) && selectedPolicies.length > 0
        ? `\nPOLICIES SPECIFICALLY INCLUDED/ADDED BY USER FOR THIS EVALUATION (${selectedPolicies.length} POLICIES):\n` +
          selectedPolicies
            .map(
              (p: any, idx: number) =>
                `${idx + 1}. [${p.impact_type?.toUpperCase()}] ${p.policy_name}: ${p.description} (Effective: ${p.effective_date}; Target: ${p.target_sector})`
            )
            .join('\n')
        : '';

    const userScenario = `
BUSINESS PROFILE FOR PREDICTION:
- Business Name / Entity: ${businessName || 'SME Enterprise'}
- Target Sector: ${sector || 'General Services / Retail'}
- Annual Gross Revenue: RM ${annualRevenue ? Number(annualRevenue).toLocaleString() : 'Not specified'}
- Estimated Annual Chargeable (Taxable) Income: RM ${chargeableIncome ? Number(chargeableIncome).toLocaleString() : 'Not specified'}
- Total Employees: ${employeeCount ?? 'Not specified'}
- Workers on or near Minimum Wage (< RM1,700/mo): ${minWageWorkers ?? 'Not specified'}
- Monthly Diesel / Fuel Usage: ${monthlyDieselLiters ? monthlyDieselLiters + ' litres' : 'Not specified'}
- Low-Skilled Foreign Workers Employed: ${foreignWorkerCount ?? 0}
- Planned Annual AI / Cloud Software Subscriptions: RM ${plannedAiSpend ? Number(plannedAiSpend).toLocaleString() : 0}
- Enrolled / Planning to enroll in Progressive Wage Policy (PWP): ${enrolledPwp ? 'Yes' : 'No'}
${customPrompt ? `\nADDITIONAL USER SCENARIO / QUESTIONS:\n"${customPrompt}"` : ''}
${policiesListText}
`;

    const systemInstruction = `
You are the Chief Policy Analyst and Econometric Predictor specializing in Malaysia's Budget 2027 and the Ministry of Finance Economic Outlook 2027 under the Ekonomi MADANI framework.

Your task is to predict the exact regulatory and financial impact on the SME described in the user's input, strictly adhering to the Budget 2027 policy rules:
1. MINIMUM WAGE & WAGE PROGRESSION:
   - Statutory floor: RM1,700/month (mandatory for all MSMEs).
   - Expected annual structured wage increment under tripartite social dialogue: 3% to 5% annually.
   - Benchmark living wage (GLIC/GLC): RM3,100/month.
2. MSME TAX RATES:
   - 15% on first RM150,000 chargeable income.
   - 17% on RM150,001 to RM600,000.
   - 24% standard rate above RM600,000.
   - e-Invoice exemption threshold raised to RM500,000 annual turnover for micro-enterprises.
3. TAX RELIEFS & DIGITAL INCENTIVES:
   - Double tax deduction for AI software subscriptions, cloud computing, and digital automation under National AI Action Plan.
   - Tax deduction for PWP incremental wage increases and 1:3 MySIP paid internship allowances.
   - NIMP CoSIF 2:1 matching grants for robotics and AI investments.
4. FUEL SUBSIDIES (BUDI MADANI & DIESEL):
   - Integrated BUDI95 (RM1.99/litre capped) and BUDI Diesel.
   - Monthly eligibility threshold of 300 litres/month at subsidized rates for eligible fleet/individuals.
   - Fuel consumed above quota is subject to unsubsidized market prices. Overall broad-based fuel subsidies reduced by 7.5%.
5. WAGE SUBSIDIES (PWP & PROSHARE):
   - Progressive Wage Policy (PWP): government cash subsidies of RM200 to RM300/month per worker for up to 12 months when tied to accredited training (Academy in Industry).
   - PROSHARE: Malaysia Productivity Corporation (MPC) productivity-linked wage system (PLWS) guidance.
6. COMPLIANCE MANDATES:
   - Section 25A Employment Act 1955: Mandatory wage disbursement via licensed bank accounts (cash prohibited).
   - LHDN MyInvois e-invoicing mandatory compliance.
   - 10% ceiling on foreign worker headcount with multi-tier punitive levies in 2027.
   - Gig Workers Act 2025 [Act 872] social security (EPF & PERKESO).
   - Government Procurement Act 2026 [Act 882] value-for-money standards.

Generate a comprehensive prediction analysis formatted in structured JSON.
`;

    const prompt = `Based on the provided SME business profile, predict the 2027 policy impact.
${userScenario}

Return a valid JSON object with: summary, estimated_annual_cost_increase_myr, estimated_annual_benefits_myr, estimated_net_impact_myr, cost_breakdown, benefits_breakdown, compliance_actions, strategic_recommendations, economic_outlook_context.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            estimated_annual_cost_increase_myr: { type: Type.NUMBER },
            estimated_annual_benefits_myr: { type: Type.NUMBER },
            estimated_net_impact_myr: { type: Type.NUMBER },
            cost_breakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  amount_myr: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                },
                required: ['item', 'amount_myr', 'explanation'],
              },
            },
            benefits_breakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  amount_myr: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                },
                required: ['item', 'amount_myr', 'explanation'],
              },
            },
            compliance_actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  status: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['title', 'status', 'deadline', 'description'],
              },
            },
            strategic_recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            economic_outlook_context: { type: Type.STRING },
          },
          required: [
            'summary',
            'estimated_annual_cost_increase_myr',
            'estimated_annual_benefits_myr',
            'estimated_net_impact_myr',
            'cost_breakdown',
            'benefits_breakdown',
            'compliance_actions',
            'strategic_recommendations',
          ],
        },
      },
    });

    const predictionText = response.text?.trim() || '{}';
    let parsedPrediction;
    try {
      parsedPrediction = JSON.parse(predictionText);
    } catch {
      parsedPrediction = { rawText: predictionText };
    }

    return res.status(200).json({
      success: true,
      engine: 'gemini',
      prediction: parsedPrediction,
    });
  } catch (err: any) {
    console.error('Vercel serverless prediction error:', err);
    return res.status(500).json({
      error: err.message || 'An error occurred during Gemini prediction',
    });
  }
}
