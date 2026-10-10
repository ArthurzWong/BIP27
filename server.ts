import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize Gemini client on server-side with user-agent header as required
  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(apiKey),
      timestamp: new Date().toISOString(),
    });
  });

  // Predict endpoint
  app.post('/api/predict', async (req, res) => {
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
      } = req.body;

      if (!ai) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please ensure the API key is set in secrets.',
        });
      }

      // Build context and user input description
      const policiesListText = Array.isArray(selectedPolicies) && selectedPolicies.length > 0
        ? `\nPOLICIES SPECIFICALLY INCLUDED/ADDED BY USER FOR THIS EVALUATION (${selectedPolicies.length} POLICIES):\n` +
          selectedPolicies.map((p: any, idx: number) => 
            `${idx + 1}. [${p.impact_type?.toUpperCase()}] ${p.policy_name}: ${p.description} (Effective: ${p.effective_date}; Target: ${p.target_sector})`
          ).join('\n')
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

Return a valid JSON object with the following fields:
- summary: A concise executive summary of the predicted impact (2-3 sentences).
- estimated_annual_cost_increase_myr: Number representing the estimated annual cost increase in RM (wages, levies, fuel above quota).
- estimated_annual_benefits_myr: Number representing the estimated annual savings & revenue in RM (tax reliefs, PWP subsidies, fuel quota savings).
- estimated_net_impact_myr: Number (benefits minus cost increase; negative means net cost, positive means net benefit).
- cost_breakdown: Array of objects with { "item": string, "amount_myr": number, "explanation": string }.
- benefits_breakdown: Array of objects with { "item": string, "amount_myr": number, "explanation": string }.
- compliance_actions: Array of objects with { "title": string, "status": "Urgent" | "Required" | "Optional", "deadline": string, "description": string }.
- strategic_recommendations: Array of strings providing concrete steps for the business in 2027 to mitigate costs and unlock government incentives.
- economic_outlook_context: Brief commentary on how macro trends (GDP 4.2-5.2%, inflation 1.8-2.8%, consumer spending) relate to this sector.
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

      res.json({
        success: true,
        prediction: parsedPrediction,
      });
    } catch (err: any) {
      console.error('Gemini prediction error:', err);
      res.status(500).json({
        error: err.message || 'An error occurred during Gemini prediction',
      });
    }
  });

  // Mount Vite or serve static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
