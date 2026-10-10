export interface PolicyRule {
  policy_name: string;
  description: string;
  effective_date: string;
  impact_type: 'cost' | 'revenue' | 'compliance';
  target_sector: string;
  category?: 'minimum_wage' | 'tax_rates' | 'tax_reliefs' | 'subsidies' | 'wage_schemes' | 'compliance';
  reference_section?: string;
}

export const SME_POLICY_RULES: PolicyRule[] = [
  {
    policy_name: "National Statutory Minimum Wage Revision & Wage Ladder Review",
    description: "Statutory minimum wage floor set at RM1,700 per month (up from RM1,500), with full enforcement across all micro, small, and medium enterprises (MSMEs). For Budget 2027, the government initiates reviews toward sectoral wage floors above the statutory minimum, coupled with tripartite social dialogue deliberating on compulsory structured annual wage increments of 3% to 5% to address 'the missing middle' wage compression.",
    effective_date: "2025-02-01 (Full MSME compliance from 2025-08-01; 2027 Annual Progression Framework review effective 2027-01-01)",
    impact_type: "cost",
    target_sector: "All MSMEs (especially labour-intensive sectors: Wholesale & Retail, F&B, Agriculture, Construction, and Low-Tier Manufacturing)",
    category: "minimum_wage",
    reference_section: "Economic Outlook 2027 Chapter 1, Feature Article 1.1 'Lifting Wages from the Ground Up' (pp. 21-30, 39)"
  },
  {
    policy_name: "Preferential MSME Corporate Income Tax Rate Structure",
    description: "Maintenance of the tiered preferential corporate tax rate for qualifying MSMEs (paid-up capital ≤ RM2.5 million and annual gross turnover ≤ RM50 million): 15% on the first RM150,000 of chargeable income, 17% on the subsequent RM150,001 to RM600,000, and standard corporate tax rate of 24% on remaining chargeable income above RM600,000, preserving tax savings of up to RM30,000 annually per business.",
    effective_date: "2027-01-01 (Year of Assessment 2027)",
    impact_type: "revenue",
    target_sector: "Qualifying Micro, Small and Medium Enterprises (MSMEs) across all economic sectors",
    category: "tax_rates",
    reference_section: "Economic Outlook 2027 Public Finance & Budget 2027 Strategic Tax Measures (pp. 3, 28, 44)"
  },
  {
    policy_name: "Double Tax Deduction for AI Subscriptions and Digital Automation",
    description: "Special accelerated double tax deduction incentive under the National AI Action Plan 2026-2030 and MDEC for qualifying expenditures incurred by MSMEs on generative AI software subscriptions, cloud compute infrastructure, cybersecurity software, and automation tooling. Complemented by NIMP CoSIF Smart Manufacturing 2:1 government matching co-investment for businesses investing in robotics, AI, and digital solutions.",
    effective_date: "2027-01-01 (Year of Assessment 2027)",
    impact_type: "revenue",
    target_sector: "MSMEs adopting digital technologies, AI tools, advanced manufacturing, and tech-enabled services",
    category: "tax_reliefs",
    reference_section: "Economic Outlook 2027 Chapter 1 'Championing High-Value Economy' & Chapter 4 Box 4.1 (pp. 31-32, 155)"
  },
  {
    policy_name: "Tax Deduction for Wage Progression & 1:3 Structured Internships (MySIP)",
    description: "Tax deduction allowances granted to participating employers for incremental wage payments provided under the Progressive Wage Policy (PWP), paired with special tax deductions for training stipends paid to local tertiary student interns under the mandatory 1:3 Internship Policy (requiring employers to sponsor up to 3 paid local internships for each expatriate hire under MySIP).",
    effective_date: "2026-06-01 (Full implementation continuing in 2027)",
    impact_type: "revenue",
    target_sector: "MSMEs participating in the Progressive Wage Policy, tech firms, engineering, and firms employing expatriates",
    category: "tax_reliefs",
    reference_section: "Economic Outlook 2027 Chapter 1 'Driving Made by Malaysia Products' & References (pp. 9, 46)"
  },
  {
    policy_name: "BUDI MADANI Fuel Subsidy Mechanism & Diesel Quota Rationalisation",
    description: "Targeted fuel subsidy rationalisation combining BUDI MADANI RON95 (BUDI95) and BUDI MADANI Diesel (BUDI Diesel). Subsidised RON95 petrol price is capped at RM1.99 per litre for eligible MyKad holders. Eligible transport, logistics, and small commercial operators receive subsidized fleet cards (SKDS) and monthly cash assistance, with the monthly eligibility threshold set at 300 litres per month to insulate operational distribution costs, while broad-based fuel subsidies are reduced by 7.5% in 2027.",
    effective_date: "2026-07-01 (Nationwide integration; 300L monthly eligibility quota maintained through 2027)",
    impact_type: "cost",
    target_sector: "Transport, logistics operators, road haulage, small agri-traders, and commercial vehicle fleet operators",
    category: "subsidies",
    reference_section: "Economic Outlook 2027 Chapter 1 Feature Article 1.2 & Chapter 3 Prices (pp. 7, 36, 76, 118, 139)"
  },
  {
    policy_name: "Progressive Wage Policy (PWP) Incentive Scheme",
    description: "Voluntary productivity-linked wage subsidy programme designed to uplift worker compensation beyond the statutory minimum floor. Participating MSMEs that send eligible workers (earning below RM4,999) for accredited TVET and Academy in Industry training and implement prescribed annual wage increments receive government cash subsidy allowances (up to RM200 to RM300 per worker monthly for 12 months) to offset incremental wage overheads.",
    effective_date: "2026-10-01 (Phased rollout expanding across all MSME sectors throughout 2027)",
    impact_type: "revenue",
    target_sector: "MSMEs in Manufacturing, Construction, Wholesale & Retail, and Selected Services sectors",
    category: "wage_schemes",
    reference_section: "Economic Outlook 2027 Chapter 1 Feature Article 1.1 'Lifting Wages from the Ground Up' (pp. 5, 29, 103)"
  },
  {
    policy_name: "PROSHARE (Productivity for Shared Prosperity Initiative)",
    description: "National productivity facilitation scheme administered by Malaysia Productivity Corporation (MPC) providing technical assistance, diagnostic audits, and implementation frameworks for MSMEs to establish Productivity-Linked Wage Systems (PLWS), aligning worker wage growth and performance-based bonuses directly to business output and value added per worker.",
    effective_date: "2027-01-01",
    impact_type: "compliance",
    target_sector: "Labour-intensive MSMEs, manufacturing workshops, engineering, and service enterprises",
    category: "wage_schemes",
    reference_section: "Economic Outlook 2027 Chapter 3 'Labour Market' (pp. 135, 138)"
  },
  {
    policy_name: "Mandatory Electronic Wage Payment via Licensed Bank Accounts",
    description: "Statutory labor compliance rule under Section 25A of the Employment Act 1955 mandating that all employers, including micro and small enterprises, disburse employee wages exclusively through electronic funds transfer or direct deposit into accounts with licensed financial institutions. Cash wage disbursements are prohibited without explicit written exemption from the Director General of Labour.",
    effective_date: "2026-01-01 (Strict enforcement and audit compliance in 2027)",
    impact_type: "compliance",
    target_sector: "All employers and MSMEs across all economic sectors employing local and foreign workers",
    category: "compliance",
    reference_section: "Economic Outlook 2027 Chapter 1 'Workers' Well-being' & Governance Reforms (pp. 20, 31, 39)"
  },
  {
    policy_name: "Mandatory e-Invoicing Compliance (LHDN MyInvois) with MSME Threshold",
    description: "Mandatory requirement to issue and validate transactional electronic invoices via the Inland Revenue Board of Malaysia (LHDN) MyInvois system. Micro-enterprises and small traders with annual turnover below RM500,000 are granted exemption from mandatory individual e-invoicing, while businesses exceeding the threshold must comply with digital transaction validation or face penalties under the Income Tax Act.",
    effective_date: "2027-01-01 (Full mandatory compliance phase)",
    impact_type: "compliance",
    target_sector: "All registered business entities, retailers, suppliers, contractors, and MSMEs exceeding RM500,000 turnover",
    category: "compliance",
    reference_section: "Economic Outlook 2027 Chapter 1 'Honing Excellence in Governance' & Reference No. HASiL/2026/08/30-44 (pp. 6, 42)"
  },
  {
    policy_name: "Foreign Worker Employment Quota Cap (10% Threshold) & Multi-Tier Levy",
    description: "Policy enforcement under the Thirteenth Malaysia Plan restricting low-skilled foreign workers to not exceed 10% of total workforce by 2030. In 2027, the government tightens hiring approvals and implements elevated multi-tiered levy structures for firms exceeding threshold ratios, increasing operational hiring costs to compel MSMEs to adopt automation, mechanisation, and local talent hiring.",
    effective_date: "2027-01-01",
    impact_type: "cost",
    target_sector: "Manufacturing, Construction, Agriculture, Plantation, and Food Services MSMEs",
    category: "compliance",
    reference_section: "Economic Outlook 2027 Chapter 3 'Labour Market' & Employment Tables (pp. 122, 135)"
  },
  {
    policy_name: "Gig Workers Act 2025 [Act 872] Social Security Compliance",
    description: "Statutory obligations requiring platform operators and businesses contracting self-employed and gig personnel to provide transparent service agreements, adhere to fair compensation baselines, and contribute to mandatory social security schemes under PERKESO (SKSPS) and EPF (i-Saraan/i-Saraan Plus).",
    effective_date: "2026-07-01 (Ongoing nationwide regulatory enforcement through 2027)",
    impact_type: "compliance",
    target_sector: "Gig economy platforms, on-demand logistics, delivery fleets, e-commerce contractors, and digital freelancers",
    category: "compliance",
    reference_section: "Economic Outlook 2027 Chapter 3 'Income & Mixed-Income Reforms' (pp. 104, 133)"
  },
  {
    policy_name: "Government Procurement Act 2026 [Act 882] Vendor Compliance",
    description: "Legislative governance mandate coming into force in 2027 requiring MSME vendors and contractors bidding for government contracts (including G1-G4 Bumiputera contractors) to comply with transparent electronic procurement standards, value-for-money audits, and strict anti-corruption standards under the National Anti-Corruption Strategy (NACS).",
    effective_date: "2027-01-01",
    impact_type: "compliance",
    target_sector: "MSME government suppliers, civil engineering contractors, maintenance vendors, and public service providers",
    category: "compliance",
    reference_section: "Economic Outlook 2027 Chapter 3 'Public Consumption' & Governance (pp. 31, 126)"
  }
];

export const RAW_JSON_OUTPUT = SME_POLICY_RULES.map(({ policy_name, description, effective_date, impact_type, target_sector }) => ({
  policy_name,
  description,
  effective_date,
  impact_type,
  target_sector
}));
