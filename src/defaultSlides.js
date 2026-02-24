// Default slide deck template — [Customer] is replaced dynamically with the customer name
const DEFAULT_SLIDES = [
  {
    id: "title",
    type: "title",
    title: "[Customer]",
    subtitle:
      "Unlocking the Social Commerce Potential for Creator UGC in the Onsite Customer Experience",
  },
  {
    id: "problem",
    type: "content",
    title: "The Problem",
    bullets: [
      "Traditional affiliate creator UGC content is not consistently brand-aligned or optimized for onsite engagement.",
      "Manually seeding product for creator UGC is highly manual and does not scale efficiently for meaningful product catalog coverage.",
      "Paying upfront for creator UGC is a sunk cost with no predictable return on investment.",
      "Getting prioritized in the ecommerce development queue to build and launch an onsite commission program with custom attribution and creator payout settings is a years-long effort.",
    ],
  },
  {
    id: "solution",
    type: "content",
    title: "The Solution",
    bullets: [
      "Delivers [Customer] brand-aligned creator UGC at product catalog level scale.",
      "Pays [Customer] creators based entirely on the incremental sales that their UGC videos deliver at checkout.",
      "Integrates with [Customer]'s existing ecommerce and creator tech stack in weeks, not months.",
      "Leverages AI to automate the entire creator UGC lifecycle from acquisition all the way through to payout so you don't have to add budget to scale.",
    ],
  },
  {
    id: "intro",
    type: "hero",
    title: "Introducing Onsite Affiliate",
    subtitle:
      "The first AI-powered onsite creator commission engine, bridging the gap between social commerce and the checkout button.",
  },
  {
    id: "incrementality",
    type: "content",
    title: "We Guarantee Incrementality",
    intro:
      "Most platforms charge for sales that would have happened anyway. We don't. We measure and monetize the incremental sales that creators generate inside your ecommerce experience, even when cookies and devices break.",
    bullets: [
      "You onboard first into a pilot program to confirm technical feasibility and measure ROI before you ever recruit a creator through an onsite commission offer.",
      "You use sales lift data from the pilot to implement the optimal commission structure through our customizable settings for commission rates, attribution model, attribution window and SKU level margins.",
    ],
  },
  {
    id: "trust",
    type: "content",
    title: "We Ensure Trust & Safety",
    intro:
      "Our UGC engine includes built-in fraud controls and brand safety features including:",
    bullets: [
      "Bot playback suppression to prevent fraudulent views.",
      "Monitoring to ensure creators are not just buying their own products to earn commissions.",
      "Built-in AI to help prevent content duplication / stolen UGC / IP infringement.",
      "Commission validation to account for order returns, refunds and cancellations.",
    ],
  },
  {
    id: "integrate",
    type: "content",
    title: "We Are Easy to Integrate",
    intro: "Our SDK installs with just a few clicks. From there:",
    bullets: [
      "We manage UGC creator acquisition, content onboarding and usage rights.",
      "Traffic approved assets to your onsite video player.",
      "Automatically calculate commissions based on your custom attribution settings.",
      "Pay creators after validating for returns, refunds, and cancellations.",
    ],
  },
  {
    id: "phases-overview",
    type: "phases",
    title: "Our Phased Approach",
    subtitle:
      "Launch your onsite commission program through our phased approach, moving from Technical Validation to Site-Wide Optimization.",
    intro:
      'We enable you to systematically validate onsite commission tracking, UGC creator supply, and ROI through a three-phase "Crawl", "Walk", "Run" framework.',
    phases: [
      { name: "Phase 1: Technical Pilot", duration: "1-3 Months", icon: "⚙️" },
      { name: "Phase 2: Creator Validation", duration: "3-6 Months", icon: "📊" },
      { name: "Phase 3: Site-Wide Scaling", duration: "Always On", icon: "🌐" },
    ],
  },
  {
    id: "phase1",
    type: "phase-detail",
    phaseNumber: 1,
    phaseLabel: "Crawl",
    title: 'Phase 1 — "Crawl" (Technical Pilot)',
    subtitle: "Validating Technical Tracking & Sales Lift",
    goal: "Prove tracking feasibility, measure sales lift and set commission baseline.",
    strategy:
      'A curated mix of best sellers (high traffic) and mid-tier products to "pulse check" UGC video conversion lift.',
    numbers: {
      sampleSize: "33 Products",
      creatorOutput: "99 Videos Delivered & Placed",
      measurement: "Attributed Revenue for Video Exposures",
    },
    primaryMetric: "Sales lift for product video exposures",
    timeline: "1-3 Months",
  },
  {
    id: "phase2",
    type: "phase-detail",
    phaseNumber: 2,
    phaseLabel: "Walk",
    title: 'Phase 2 — "Walk" (Creator Validation)',
    subtitle: "Confirming Creator Acquisition & Commission Sustainability",
    goal: "Confirm scalability of commission offer for creator user-generated content.",
    strategy:
      "Stratified product page sampling across categories to recruit and activate creators with a commission offer.",
    numbers: {
      sampleSize: "250 Products",
      creatorOutput: "750 Videos Delivered & Placed",
      measurement: "Creator Acquisition & Incremental Sales",
    },
    primaryMetric: "Return on Commission Spend (ROCS)",
    timeline: "3-6 Months",
  },
  {
    id: "phase3",
    type: "phase-detail",
    phaseNumber: 3,
    phaseLabel: "Run",
    title: 'Phase 3 — "Run" (Site-Wide Scaling)',
    subtitle: "Creator/Product Scaling & Conversion Optimization",
    goal: "Transition to full-scale deployment & conversion optimization.",
    strategy:
      "Community management & optimization based on performance analysis and creative best practices.",
    numbers: {
      sampleSize: "Entire Catalog",
      creatorOutput: "3,000 Videos Delivered & Placed",
      measurement: "% of Product Pages with UGC Video Content",
    },
    primaryMetric: "Return on Commission Spend (ROCS)",
    timeline: "Always On Program",
  },
  {
    id: "pricing",
    type: "pricing",
    title: "How Pricing Works",
    intro:
      "We charge for the incremental sales we help create, not just for software.",
    pricingTiers: [
      {
        name: "Technical Pilot",
        desc: "A simple, one-time flat fee covering all costs.",
      },
      {
        name: "Platform Fee",
        desc: "A small monthly fee for creating and administering your onsite commission engine, ensuring 'skin in the game'.",
      },
      {
        name: "Incremental Sales",
        desc: "A commission tracking and payment fee, representing a percentage of approved onsite commissions, proportional to the actual incremental sales we help create.",
      },
    ],
    table: {
      header: "Brand with $141 AOV & 5% Commission",
      rows: [
        ["Total Unique Product SKUs:", "4,025"],
        ["Creator UGC Videos:", "9,056"],
        ["Total UGC Engagements:", "3,073,286"],
        ["", ""],
        ["UGC Attributed Sales:", "$13,961,078"],
        ["Approved Commissions:", "$698,054"],
        ["", ""],
        ["Commission Tracking Fee:", "$69,805"],
        ["Platform Fee", "$12,000"],
        ["Total Onsite Affiliate Fees:", "$81,805"],
        ["", ""],
        ["ROCS Inclusive of Fees", "6.2"],
      ],
    },
  },
  {
    id: "contracting",
    type: "content",
    title: "Contracting",
    bullets: [
      "Brand Terms: this is our master services agreement that your brand agrees to for accessing and using our platform.",
      "Data Processing Addendum (DPA): this ensures full compliance with all applicable data protection and security laws.",
      "Brand Insertion Order: this covers your brand's specific commercial terms, incorporates the Brand Terms and DPA by reference, and is the only agreement you need to sign.",
      "Creator Terms: these are the terms that creators must opt-in to when they onboard to our platform which enables content usage rights and other key terms.",
    ],
  },
  {
    id: "team",
    type: "team",
    title: "Who We Are",
    members: [
      {
        name: "Alan Edgett",
        role: "Founder",
        bio: "Alan is a seasoned operator and investor with a career defined by scaling high-growth performance marketing and AdTech ventures. As the Founder and CEO of The Gig Agency, he led an expert team managing over $300M in annual media spend across influencer, programmatic, and performance channels.",
      },
      {
        name: "Lyn DeLeon",
        role: "Head of Product",
        bio: "Lyn is the former VP of Product & Integrations at CreatorIQ, where she was an early employee instrumental in scaling the platform to serve over 1,200 of the world's leading brands and agencies. With over a decade of experience building enterprise-grade tools for global giants like Amazon, Nestlé, and IPG.",
      },
    ],
  },
];

export default DEFAULT_SLIDES;
