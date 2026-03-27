
import { TradeTopic, Course } from './types';

export const OFFICIAL_CONTACT = {
  phone: "+2348029875622",
  whatsapp: "+2348029875622",
  email: "donlemson@gmail.com",
};

export const COURSE_FEE = "₦10,000";

export const ABOUT_US_SUMMARY = `
DONLEMSONTRADE is Nigeria's leading digital gateway for International Trade Intelligence and Regulatory Compliance. 

Our platform was founded on the mission to bridge the gap between Nigerian businesses and the global market by simplifying the Nigerian Trade Corridor. We provide end-to-end support for:

1. Regulatory Compliance: Expert navigation of the BODOGWU portal, Central Bank of Nigeria (CBN) trade manuals, Form M applications, and PAAR (Pre-Arrival Assessment Report) issuance.
2. Global Trade College: A world-class E-learning environment where professionals master Incoterms 2020, HS Code classification, and Trade Finance through professional audio-guided lessons.
3. Trade-as-a-Service (TaaS): We act as your outsourced export/import department, managing global shipping logistics from order to final port delivery.
4. Real-time Intelligence: Providing live vessel tracking and manifest verification to ensure transparency in every shipment.

At DONLEMSONTRADE, we don't just move cargo; we move information, ensuring that your international trade operations are seamless, compliant, and profitable.
`;

export const TRADE_TOPICS: TradeTopic[] = [
  {
    title: "Global Import/Export",
    description: "Incoterms 2020, Bill of Lading, and global shipping standards.",
    icon: "fa-globe"
  },
  {
    title: "Nigerian Corridor",
    description: "BODOGWU portal, Form M, and NRS tax compliance.",
    icon: "fa-anchor"
  },
  {
    title: "Tariffs & HS Codes",
    description: "Universal Harmonized System codes and duty calculation strategies.",
    icon: "fa-calculator"
  },
  {
    title: "Trade Agreements",
    description: "AfCFTA, AGOA, and EU-UK trade protocols.",
    icon: "fa-file-signature"
  }
];

export const TRADE_COURSES: Course[] = [
  {
    id: 'f1',
    title: 'Trade Basics 101: The Global Engine',
    category: 'Foundational',
    instructor: 'Leo Donlems',
    duration: '2 Hours',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800',
    modules: [
      'The Evolution of International Trade',
      'Key Players: Consignors, Consignees, and Carriers',
      'Understanding the Trade Cycle: From Order to Delivery',
      'The Essential Paperwork: Commercial Invoice & Packing List',
      'Trade Finance Basics: How Money Moves Across Borders'
    ],
    isFree: true
  },
  {
    id: 'f2',
    title: 'HS Code Discovery: Mastery of Classification',
    category: 'Regulatory',
    instructor: 'Trade Intelligence Team',
    duration: '1.5 Hours',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&q=80&w=800',
    modules: [
      'Structure of the Harmonized System',
      'General Rules of Interpretation (GRI)',
      'Navigating the Common External Tariff (CET)',
      'Classification Challenges: Mixed Goods & Kits',
      'Avoiding Fines: The Cost of Misclassification'
    ],
    isFree: true
  },
  {
    id: 'f3',
    title: 'Form M & PAAR Deep Dive',
    category: 'Compliance',
    instructor: 'Customs Liaison',
    duration: '3 Hours',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800',
    modules: [
      'The Single Window Portal Registration',
      'Applying for Form M: Step-by-Step Guide',
      'Documentary Requirements for PAAR Issuance',
      'Interpreting PAAR Reports and Valuation',
      'Handling Form M Extensions and Amendments'
    ],
    isFree: true
  },
  {
    id: 'f4',
    title: 'The Bill of Lading: Legal & Operational Guide',
    category: 'Logistics',
    instructor: 'Shipping Line Rep',
    duration: '1 Hour',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
    modules: [
      'Types of B/L: Straight, To Order, and Negotiable',
      'The Role of the Carrier and Agent',
      'Endorsements and Transfer of Title',
      'Clause and Clean Bills of Lading',
      'Digital B/L: The Future of Shipping Documentation'
    ],
    isFree: true
  },
  {
    id: 'c1',
    title: 'Incoterms 2020 Masterclass: Global Risk Management',
    category: 'Logistics',
    instructor: 'Dr. Leo Donlems',
    duration: '12 Hours',
    level: 'Professional',
    thumbnail: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800',
    modules: [
      'Incoterms History and 2020 Pivot Points',
      'Detailed Study: EXW, FCA, CPT, CIP',
      'Maritime Exclusive Rules: FAS, FOB, CFR, CIF',
      'Delivered Rules: DAP, DPU, DDP Explained',
      'Insurance Obligations and Claims Management',
      'Choosing the Right Term for Nigerian Imports'
    ]
  },
  {
    id: 'c2',
    title: 'Advanced Customs Compliance & NRS Audit',
    category: 'Regulatory',
    instructor: 'Chief Trade Officer',
    duration: '8 Hours',
    level: 'Executive',
    thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2923216?auto=format&fit=crop&q=80&w=800',
    modules: [
      'The New Nigeria Revenue Service (NRS) Framework',
      'Post Clearance Audit (PCA) Survival Strategies',
      'Duty Calculation: FOB vs C&F vs CIF',
      'Exemptions, Concessions, and Waivers',
      'Digital Manifest Filing and Scrutiny',
      'Ethical Trade: Anti-Smuggling and Integrity'
    ]
  },
  {
    id: 'c3',
    title: 'Trade Finance: L/Cs and Structured Deals',
    category: 'Finance',
    instructor: 'Global Banking Group',
    duration: '15 Hours',
    level: 'Professional',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800',
    modules: [
      'Letters of Credit: UCP 600 Compliance',
      'Documentary Collections vs Open Account',
      'Export Credit Guarantees',
      'Factoring and Forfaiting in Emerging Markets',
      'Managing Forex Risks in Nigerian Trade',
      'Electronic Trade Finance Systems'
    ]
  }
];

export const SYSTEM_PROMPT = `You are DONLEMSONTRADE, the world-class International Trade Consultant. 

FORMATTING RULES:
- DO NOT use markdown bolding (like **text**) in your responses. 
- Use clear, professional, and well-structured text.
- Use bullet points or numbered lists for readability when listing items.
- Maintain an authoritative, professional, yet helpful tone.

SITE CAPABILITIES:
1. SHIPMENT TRACKER: Live Document Tracking for Bills of Lading or Container Numbers.
2. GLOBAL TRADE COLLEGE: Detailed E-learning portal with professional audio narration.
3. TRADE SERVICES: Shipping intelligence, compliance desk, and Trade-as-a-Service.
4. REGULATORY EXPERTISE: Expert in BODOGWU, NRS, Single Window, NXP, Form M, and PAAR.

If the user asks about something outside of Trade and Logistics, politely explain that you specialize exclusively in Trade and Regulatory compliance.`;
