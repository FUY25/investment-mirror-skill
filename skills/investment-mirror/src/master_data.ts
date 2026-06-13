export type SourceQuality =
  | "official"
  | "primary"
  | "book"
  | "memo"
  | "research"
  | "interview"
  | "public_record"
  | "portfolio_tracker"
  | "reliable_secondary"
  | "biography";

export type MasterSource = {
  title: string;
  url: string;
  quality: SourceQuality;
  notes: string;
};

export type MasterVector = {
  narrative_sensitivity: number;
  valuation_discipline: number;
  evidence_threshold: number;
  falsifiability_discipline: number;
  time_horizon_clarity: number;
  research_loop_tendency: number;
  contrarian_impulse: number;
  product_founder_bias: number;
  downside_first_thinking: number;
  catalyst_dependence: number;
  cycle_regime_sensitivity: number;
  systematic_vs_discretionary: number;
  concentration_comfort: number;
  authority_reliance: number;
  value_capture_clarity: number;
};

export type MasterRecord = {
  id: string;
  displayName: string;
  region: string;
  tier: "canonical" | "extended" | "modern_case" | "controversial_case";
  category: string;
  styleTags: string[];
  wikipediaUrl: string;
  readMoreUrl: string;
  sources: MasterSource[];
  teaches: string[];
  commonMisreadings: string[];
  bioSummary: string;
  investmentStyle: string;
  notableResultsSummary: string;
  whatToLearn: string[];
  whatNotToCopy: string[];
  guardrailRelevance: string[];
  vector: MasterVector;
};

export const STYLE_DIMENSIONS: Array<{ id: keyof MasterVector; label: string; low: string; high: string }> = [
  { id: "narrative_sensitivity", label: "Narrative sensitivity", low: "Data-first", high: "Story-first" },
  { id: "valuation_discipline", label: "Valuation discipline", low: "Price-light", high: "Price-first" },
  { id: "evidence_threshold", label: "Evidence threshold", low: "Loose evidence", high: "Strict evidence" },
  { id: "falsifiability_discipline", label: "Falsifiability discipline", low: "Belief-like", high: "Testable" },
  { id: "time_horizon_clarity", label: "Time horizon clarity", low: "Vague", high: "Explicit" },
  { id: "research_loop_tendency", label: "Research-loop tendency", low: "Action-biased", high: "Research-looped" },
  { id: "contrarian_impulse", label: "Contrarian impulse", low: "Consensus-aligned", high: "Contrarian" },
  { id: "product_founder_bias", label: "Product/founder bias", low: "Financial-first", high: "Product/founder-first" },
  { id: "downside_first_thinking", label: "Downside-first thinking", low: "Upside-first", high: "Downside-first" },
  { id: "catalyst_dependence", label: "Catalyst dependence", low: "Compounder", high: "Catalyst-driven" },
  { id: "cycle_regime_sensitivity", label: "Cycle/regime sensitivity", low: "Micro-only", high: "Macro/regime-aware" },
  { id: "systematic_vs_discretionary", label: "Systematic vs discretionary", low: "Discretionary", high: "Rule/system-based" },
  { id: "concentration_comfort", label: "Concentration comfort", low: "Diversified", high: "Concentrated" },
  { id: "authority_reliance", label: "Authority reliance", low: "Independent", high: "Authority-anchored" },
  { id: "value_capture_clarity", label: "Value capture clarity", low: "TAM-focused", high: "Capture-focused" }
];

const shared = {
  dataroma: {
    title: "Dataroma superinvestor manager index",
    url: "https://www.dataroma.com/m/managers.php",
    quality: "portfolio_tracker" as SourceQuality,
    notes: "Useful as public 13F context where applicable; not a complete record of private holdings or short books."
  },
  grahamDoddsville: {
    title: "Columbia Heilbrunn Center Graham & Doddsville",
    url: "https://business.columbia.edu/heilbrunn/resources/graham-and-doddsville-newsletter",
    quality: "research" as SourceQuality,
    notes: "Practitioner interviews and value-investing education source; useful for style and process context."
  },
  berkshireLetters: {
    title: "Berkshire Hathaway shareholder letters",
    url: "https://www.berkshirehathaway.com/letters/letters.html",
    quality: "primary" as SourceQuality,
    notes: "Primary record for Buffett and Munger owner-oriented language, capital allocation, and business-quality framing."
  },
  oaktreeMemos: {
    title: "Oaktree memos",
    url: "https://www.oaktreecapital.com/insights/memo",
    quality: "memo" as SourceQuality,
    notes: "Primary practitioner source for risk, cycles, and second-level thinking."
  },
  aqrResearch: {
    title: "AQR research library",
    url: "https://www.aqr.com/Insights/Research",
    quality: "research" as SourceQuality,
    notes: "Research source for factor investing, value, momentum, and systematic process."
  }
};

export const MASTER_RECORDS: MasterRecord[] = [
  {
    id: "benjamin_graham",
    displayName: "Benjamin Graham",
    region: "United States",
    tier: "canonical",
    category: "Value / margin of safety",
    styleTags: ["value", "margin_of_safety", "mr_market", "security_analysis"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Benjamin_Graham",
    readMoreUrl: "https://business.columbia.edu/heilbrunn/resources/graham-and-doddsville-newsletter",
    sources: [
      { title: "Benjamin Graham biography", url: "https://en.wikipedia.org/wiki/Benjamin_Graham", quality: "biography", notes: "Baseline biography and publication context." },
      { title: "The Intelligent Investor", url: "https://en.wikipedia.org/wiki/The_Intelligent_Investor", quality: "book", notes: "Book context for margin of safety and investor temperament." },
      { title: "Security Analysis", url: "https://en.wikipedia.org/wiki/Security_Analysis_(book)", quality: "book", notes: "Book context for fundamental security analysis." },
      shared.grahamDoddsville
    ],
    teaches: ["margin of safety", "Mr. Market discipline", "separate price from value", "process before excitement"],
    commonMisreadings: ["deep value is not automatic cheapness", "margin of safety is not a slogan", "net-net discipline does not remove business risk"],
    bioSummary: "Benjamin Graham was a Columbia professor, author, and investor associated with security analysis, value investing, and the margin-of-safety concept.",
    investmentStyle: "Fundamental value investing that starts with business value, balance-sheet evidence, and a gap between price and conservative appraisal.",
    notableResultsSummary: "His notable contribution is the intellectual foundation of value investing through Security Analysis and The Intelligent Investor, plus his influence on later investors.",
    whatToLearn: ["define value before action", "demand a margin of safety", "treat market price as an offer, not instruction"],
    whatNotToCopy: ["do not treat statistical cheapness as sufficient evidence when business quality is deteriorating"],
    guardrailRelevance: ["valuation_expectation_missing", "evidence_basis_missing", "authority_anchor", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 22, valuation_discipline: 96, evidence_threshold: 88, falsifiability_discipline: 84, time_horizon_clarity: 78, research_loop_tendency: 58, contrarian_impulse: 70, product_founder_bias: 18, downside_first_thinking: 94, catalyst_dependence: 42, cycle_regime_sensitivity: 44, systematic_vs_discretionary: 70, concentration_comfort: 30, authority_reliance: 18, value_capture_clarity: 76 }
  },
  {
    id: "warren_buffett",
    displayName: "Warren Buffett",
    region: "United States",
    tier: "canonical",
    category: "Value / margin of safety",
    styleTags: ["quality_value", "capital_allocation", "long_term_ownership", "business_quality"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Warren_Buffett",
    readMoreUrl: "https://www.berkshirehathaway.com/letters/letters.html",
    sources: [
      shared.berkshireLetters,
      { title: "Warren Buffett biography", url: "https://en.wikipedia.org/wiki/Warren_Buffett", quality: "biography", notes: "Biography and Berkshire context." },
      { title: "Berkshire Hathaway annual reports", url: "https://www.berkshirehathaway.com/reports.html", quality: "primary", notes: "Primary company record for Berkshire results and holdings context." },
      shared.dataroma
    ],
    teaches: ["owner mindset", "business quality", "capital allocation", "circle of competence", "patience"],
    commonMisreadings: ["quality does not mean any price", "long term does not mean never revisiting thesis", "copying holdings is not copying process"],
    bioSummary: "Warren Buffett is the chair and CEO of Berkshire Hathaway and is known for owner-oriented investing, business-quality analysis, and plain-language shareholder letters.",
    investmentStyle: "Quality-aware value investing focused on durable economics, capable management, capital allocation, and long holding periods.",
    notableResultsSummary: "Berkshire Hathaway's long public record and shareholder letters provide source-backed context for Buffett's investment approach without needing unsupported rankings.",
    whatToLearn: ["write the owner thesis", "stay inside circle of competence", "connect business quality to price"],
    whatNotToCopy: ["do not copy Berkshire holdings without the capital structure, information, tax, and time-horizon context"],
    guardrailRelevance: ["valuation_expectation_missing", "quality_without_price", "authority_anchor", "time_horizon_missing"],
    vector: { narrative_sensitivity: 54, valuation_discipline: 88, evidence_threshold: 82, falsifiability_discipline: 76, time_horizon_clarity: 92, research_loop_tendency: 54, contrarian_impulse: 62, product_founder_bias: 48, downside_first_thinking: 82, catalyst_dependence: 24, cycle_regime_sensitivity: 50, systematic_vs_discretionary: 45, concentration_comfort: 72, authority_reliance: 20, value_capture_clarity: 86 }
  },
  {
    id: "charlie_munger",
    displayName: "Charlie Munger",
    region: "United States",
    tier: "canonical",
    category: "Value / margin of safety",
    styleTags: ["mental_models", "quality", "incentives", "inversion"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Charlie_Munger",
    readMoreUrl: "https://www.berkshirehathaway.com/letters/letters.html",
    sources: [
      shared.berkshireLetters,
      { title: "Charlie Munger biography", url: "https://en.wikipedia.org/wiki/Charlie_Munger", quality: "biography", notes: "Biography, Berkshire role, and publication context." },
      { title: "Poor Charlie's Almanack", url: "https://en.wikipedia.org/wiki/Poor_Charlie%27s_Almanack", quality: "book", notes: "Book context for mental models and inversion." },
      shared.grahamDoddsville
    ],
    teaches: ["inversion", "incentives", "avoid stupidity", "multidisciplinary mental models", "quality threshold"],
    commonMisreadings: ["mental models are not decorative quotes", "concentration requires exceptional standards", "inversion is a test, not a vibe"],
    bioSummary: "Charlie Munger was Berkshire Hathaway's vice chairman and a long-time advocate of multidisciplinary thinking, incentives analysis, and inversion.",
    investmentStyle: "Quality-oriented value investing with a high bar for business quality, incentives, management behavior, and avoidable error.",
    notableResultsSummary: "His public record is most useful as process evidence: Berkshire letters, speeches, and Poor Charlie's Almanack document his mental-model approach.",
    whatToLearn: ["invert the thesis", "inspect incentives", "use simple mental models to avoid avoidable loss"],
    whatNotToCopy: ["do not use aphorisms as substitutes for security-specific evidence"],
    guardrailRelevance: ["falsification_missing", "management_shortcut", "authority_anchor", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 50, valuation_discipline: 80, evidence_threshold: 84, falsifiability_discipline: 90, time_horizon_clarity: 88, research_loop_tendency: 46, contrarian_impulse: 58, product_founder_bias: 42, downside_first_thinking: 88, catalyst_dependence: 20, cycle_regime_sensitivity: 48, systematic_vs_discretionary: 42, concentration_comfort: 80, authority_reliance: 16, value_capture_clarity: 84 }
  },
  {
    id: "walter_schloss",
    displayName: "Walter Schloss",
    region: "United States",
    tier: "extended",
    category: "Value / margin of safety",
    styleTags: ["deep_value", "diversification", "balance_sheet", "simple_process"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Walter_Schloss",
    readMoreUrl: "https://www8.gsb.columbia.edu/sites/valueinvesting/files/files/Buffett1984.pdf",
    sources: [
      { title: "Walter Schloss biography", url: "https://en.wikipedia.org/wiki/Walter_Schloss", quality: "biography", notes: "Biography and style overview." },
      shared.grahamDoddsville,
      shared.dataroma,
      { title: "The Superinvestors of Graham-and-Doddsville", url: "https://www8.gsb.columbia.edu/sites/valueinvesting/files/files/Buffett1984.pdf", quality: "primary", notes: "Buffett essay naming Schloss as a Graham-and-Doddsville example; use as style context, not standalone performance ranking." }
    ],
    teaches: ["simple valuation discipline", "diversified cheapness", "balance-sheet checks", "avoid complexity"],
    commonMisreadings: ["simple is not shallow", "diversification is not lack of conviction", "cheapness still needs solvency checks"],
    bioSummary: "Walter Schloss was a Graham-influenced value investor known for a simple, price-focused, diversified approach to undervalued securities.",
    investmentStyle: "Deep value investing with emphasis on price, asset value, balance-sheet evidence, and diversification rather than elaborate forecasts.",
    notableResultsSummary: "Public discussions emphasize his long practice of Graham-style value investing and his reputation for simple discipline.",
    whatToLearn: ["keep the checklist simple", "check balance-sheet support", "avoid narrative over-elaboration"],
    whatNotToCopy: ["do not buy weak businesses solely because they screen cheap"],
    guardrailRelevance: ["valuation_expectation_missing", "single_metric_overweight", "evidence_basis_missing"],
    vector: { narrative_sensitivity: 18, valuation_discipline: 94, evidence_threshold: 76, falsifiability_discipline: 78, time_horizon_clarity: 72, research_loop_tendency: 42, contrarian_impulse: 74, product_founder_bias: 12, downside_first_thinking: 88, catalyst_dependence: 34, cycle_regime_sensitivity: 36, systematic_vs_discretionary: 66, concentration_comfort: 22, authority_reliance: 16, value_capture_clarity: 68 }
  },
  {
    id: "seth_klarman",
    displayName: "Seth Klarman",
    region: "United States",
    tier: "canonical",
    category: "Value / margin of safety",
    styleTags: ["value", "risk", "margin_of_safety", "downside_first"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Seth_Klarman",
    readMoreUrl: "https://business.columbia.edu/heilbrunn/resources/graham-and-doddsville-newsletter",
    sources: [
      { title: "Seth Klarman biography", url: "https://en.wikipedia.org/wiki/Seth_Klarman", quality: "biography", notes: "Biography and Baupost context." },
      { title: "Margin of Safety", url: "https://en.wikipedia.org/wiki/Margin_of_Safety_(book)", quality: "book", notes: "Book context for risk and value discipline." },
      shared.grahamDoddsville,
      shared.dataroma
    ],
    teaches: ["risk before return", "margin of safety", "liquidity awareness", "patience under uncertainty"],
    commonMisreadings: ["cash and caution are process choices, not fear", "margin of safety is not only low multiples", "distressed value requires legal and capital-structure work"],
    bioSummary: "Seth Klarman is the CEO of Baupost Group and author of Margin of Safety, publicly associated with risk-aware value investing.",
    investmentStyle: "Downside-first value investing that emphasizes margin of safety, patience, liquidity, and skepticism toward crowd behavior.",
    notableResultsSummary: "Public source value is strongest for his risk framing and margin-of-safety philosophy rather than for precise performance claims.",
    whatToLearn: ["define downside first", "separate permanent loss from volatility", "wait when evidence is incomplete"],
    whatNotToCopy: ["do not use caution as an excuse to avoid stating decision criteria"],
    guardrailRelevance: ["downside_protocol_missing", "valuation_expectation_missing", "source_quality_weak", "scenario_absent"],
    vector: { narrative_sensitivity: 26, valuation_discipline: 94, evidence_threshold: 88, falsifiability_discipline: 84, time_horizon_clarity: 80, research_loop_tendency: 62, contrarian_impulse: 76, product_founder_bias: 18, downside_first_thinking: 96, catalyst_dependence: 46, cycle_regime_sensitivity: 54, systematic_vs_discretionary: 54, concentration_comfort: 58, authority_reliance: 14, value_capture_clarity: 78 }
  },
  {
    id: "li_lu",
    displayName: "Li Lu / 李录",
    region: "United States / China",
    tier: "canonical",
    category: "Value / margin of safety",
    styleTags: ["value_investing", "long_term_compounders", "accurate_information", "owner_mindset"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Li_Lu",
    readMoreUrl: "https://www.himcap.com/",
    sources: [
      { title: "Li Lu biography", url: "https://en.wikipedia.org/wiki/Li_Lu", quality: "biography", notes: "Biography and Himalaya Capital context." },
      { title: "Himalaya Capital", url: "https://www.himcap.com/", quality: "official", notes: "Official firm source; use for principles and firm positioning." },
      shared.grahamDoddsville,
      shared.dataroma
    ],
    teaches: ["accurate and complete information", "owner mindset", "long-term compounding", "intellectual honesty"],
    commonMisreadings: ["China focus is not a shortcut to edge", "long-term holding requires high information quality", "borrowed conviction is not owner mindset"],
    bioSummary: "Li Lu is the founder and chairman of Himalaya Capital and is associated publicly with long-term value investing and owner-oriented research.",
    investmentStyle: "Long-term value investing that combines business quality, accurate information, patience, and an owner mindset.",
    notableResultsSummary: "Publicly available sources are most useful for his stated principles, Himalaya context, and reputation in value-investing circles.",
    whatToLearn: ["raise information quality", "own the thesis independently", "treat understanding as a discipline"],
    whatNotToCopy: ["do not convert admiration for a company or investor into borrowed conviction"],
    guardrailRelevance: ["source_quality_weak", "authority_anchor", "valuation_expectation_missing", "evidence_basis_missing"],
    vector: { narrative_sensitivity: 48, valuation_discipline: 84, evidence_threshold: 94, falsifiability_discipline: 82, time_horizon_clarity: 90, research_loop_tendency: 68, contrarian_impulse: 60, product_founder_bias: 44, downside_first_thinking: 82, catalyst_dependence: 24, cycle_regime_sensitivity: 56, systematic_vs_discretionary: 40, concentration_comfort: 76, authority_reliance: 12, value_capture_clarity: 88 }
  },
  {
    id: "duan_yongping",
    displayName: "Duan Yongping / 段永平",
    region: "China / United States",
    tier: "modern_case",
    category: "Quality growth / compounders",
    styleTags: ["entrepreneur_investor", "business_quality", "common_sense", "long_term_ownership"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Duan_Yongping",
    readMoreUrl: "https://en.wikipedia.org/wiki/Duan_Yongping",
    sources: [
      { title: "Duan Yongping biography", url: "https://en.wikipedia.org/wiki/Duan_Yongping", quality: "biography", notes: "Baseline biography and entrepreneur-investor context." },
      { title: "BBK Electronics", url: "https://en.wikipedia.org/wiki/BBK_Electronics", quality: "reliable_secondary", notes: "Business context for Duan's operating background." },
      { title: "NetEase", url: "https://en.wikipedia.org/wiki/NetEase", quality: "reliable_secondary", notes: "Relevant public company context often associated with Duan's public investing history." },
      shared.dataroma
    ],
    teaches: ["business common sense", "owner/operator lens", "good business vs good product", "patience"],
    commonMisreadings: ["a good product is not automatically a good stock", "operator intuition still needs price and governance checks", "public forum summaries need source caution"],
    bioSummary: "Duan Yongping is an entrepreneur and investor associated with BBK-related businesses and a public reputation for common-sense business-quality investing.",
    investmentStyle: "Owner-oriented quality investing informed by operating experience, business durability, and common-sense economics.",
    notableResultsSummary: "Use his public biography and operating history as style context; avoid unsupported claims from reposted forum material.",
    whatToLearn: ["test business common sense", "separate product love from economics", "think like an owner"],
    whatNotToCopy: ["do not use operating admiration to skip valuation, competition, and governance analysis"],
    guardrailRelevance: ["product_quality_overweight", "value_capture_missing", "valuation_expectation_missing", "source_quality_weak"],
    vector: { narrative_sensitivity: 62, valuation_discipline: 72, evidence_threshold: 78, falsifiability_discipline: 74, time_horizon_clarity: 86, research_loop_tendency: 54, contrarian_impulse: 54, product_founder_bias: 82, downside_first_thinking: 72, catalyst_dependence: 18, cycle_regime_sensitivity: 42, systematic_vs_discretionary: 34, concentration_comfort: 76, authority_reliance: 18, value_capture_clarity: 86 }
  },
  {
    id: "philip_fisher",
    displayName: "Philip Fisher",
    region: "United States",
    tier: "canonical",
    category: "Quality growth / compounders",
    styleTags: ["scuttlebutt", "growth", "quality", "management_quality"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Philip_Arthur_Fisher",
    readMoreUrl: "https://en.wikipedia.org/wiki/Common_Stocks_and_Uncommon_Profits",
    sources: [
      { title: "Philip Fisher biography", url: "https://en.wikipedia.org/wiki/Philip_Arthur_Fisher", quality: "biography", notes: "Biography and book context." },
      { title: "Common Stocks and Uncommon Profits", url: "https://en.wikipedia.org/wiki/Common_Stocks_and_Uncommon_Profits", quality: "book", notes: "Book context for scuttlebutt and growth-company analysis." },
      shared.grahamDoddsville
    ],
    teaches: ["scuttlebutt", "qualitative business research", "management quality", "long-term growth durability"],
    commonMisreadings: ["qualitative conviction is not evidence-free conviction", "growth quality still needs expectations discipline", "talking to sources is not the same as verification"],
    bioSummary: "Philip Fisher was a growth investor and author known for qualitative business research and the scuttlebutt method.",
    investmentStyle: "Long-horizon quality-growth investing focused on management, innovation, sales potential, and qualitative evidence gathered from business networks.",
    notableResultsSummary: "His book Common Stocks and Uncommon Profits is a durable source for the qualitative growth-investing process associated with his name.",
    whatToLearn: ["interview the ecosystem", "study business quality before quarterly noise", "make qualitative evidence explicit"],
    whatNotToCopy: ["do not let a compelling business story replace valuation and falsification discipline"],
    guardrailRelevance: ["valuation_expectation_missing", "falsification_missing", "value_capture_missing", "management_shortcut"],
    vector: { narrative_sensitivity: 78, valuation_discipline: 58, evidence_threshold: 80, falsifiability_discipline: 66, time_horizon_clarity: 90, research_loop_tendency: 70, contrarian_impulse: 46, product_founder_bias: 72, downside_first_thinking: 54, catalyst_dependence: 18, cycle_regime_sensitivity: 36, systematic_vs_discretionary: 30, concentration_comfort: 72, authority_reliance: 22, value_capture_clarity: 78 }
  },
  {
    id: "t_rowe_price_jr",
    displayName: "T. Rowe Price Jr.",
    region: "United States",
    tier: "extended",
    category: "Quality growth / compounders",
    styleTags: ["growth_investing", "long_term_growth", "business_lifecycle"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Thomas_Rowe_Price_Jr.",
    readMoreUrl: "https://www.troweprice.com/corporate/us/en/what-we-do/history.html",
    sources: [
      { title: "T. Rowe Price Jr. biography", url: "https://en.wikipedia.org/wiki/Thomas_Rowe_Price_Jr.", quality: "biography", notes: "Biography and growth-stock context." },
      { title: "T. Rowe Price company history", url: "https://www.troweprice.com/corporate/us/en/what-we-do/history.html", quality: "official", notes: "Official firm history for founder context." },
      { title: "T. Rowe Price mutual fund history", url: "https://en.wikipedia.org/wiki/T._Rowe_Price", quality: "reliable_secondary", notes: "Firm context and growth-investing heritage." }
    ],
    teaches: ["growth durability", "business lifecycle", "compounder patience", "earnings power over time"],
    commonMisreadings: ["growth is not momentum by another name", "long-run durability still needs price expectations", "institutional history is not a stock thesis"],
    bioSummary: "T. Rowe Price Jr. founded the investment firm bearing his name and is associated with growth-stock investing and long-term business lifecycle analysis.",
    investmentStyle: "Long-term growth investing focused on companies with durable expansion potential and compounding earnings power.",
    notableResultsSummary: "His significance is primarily as an early architect of growth-investing practice and the founder of T. Rowe Price.",
    whatToLearn: ["map business lifecycle", "ask whether growth can endure", "connect growth to expectations"],
    whatNotToCopy: ["do not assume a growing company is attractive without asking what growth is already priced in"],
    guardrailRelevance: ["valuation_expectation_missing", "time_horizon_missing", "scenario_absent"],
    vector: { narrative_sensitivity: 68, valuation_discipline: 60, evidence_threshold: 72, falsifiability_discipline: 66, time_horizon_clarity: 88, research_loop_tendency: 56, contrarian_impulse: 34, product_founder_bias: 58, downside_first_thinking: 48, catalyst_dependence: 16, cycle_regime_sensitivity: 40, systematic_vs_discretionary: 42, concentration_comfort: 48, authority_reliance: 18, value_capture_clarity: 74 }
  },
  {
    id: "peter_lynch",
    displayName: "Peter Lynch",
    region: "United States",
    tier: "canonical",
    category: "Quality growth / compounders",
    styleTags: ["garp", "know_what_you_own", "consumer_insight", "simple_thesis"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Peter_Lynch",
    readMoreUrl: "https://en.wikipedia.org/wiki/Peter_Lynch",
    sources: [
      { title: "Peter Lynch biography", url: "https://en.wikipedia.org/wiki/Peter_Lynch", quality: "biography", notes: "Biography and Magellan Fund context." },
      { title: "One Up on Wall Street", url: "https://en.wikipedia.org/wiki/One_Up_on_Wall_Street", quality: "book", notes: "Book context for knowing what you own and consumer observations." },
      { title: "Beating the Street", url: "https://en.wikipedia.org/wiki/Beating_the_Street", quality: "book", notes: "Book context for thesis articulation and company categories." }
    ],
    teaches: ["know what you own", "simple thesis language", "consumer observation", "growth at a reasonable price"],
    commonMisreadings: ["liking a product is not enough", "simple thesis is not shallow thesis", "consumer familiarity still needs financial evidence"],
    bioSummary: "Peter Lynch is a former Fidelity Magellan Fund manager and author known for GARP, consumer observation, and clear thesis language.",
    investmentStyle: "Growth at a reasonable price with emphasis on understandable businesses, company categories, simple thesis articulation, and fundamental follow-through.",
    notableResultsSummary: "His public profile is tied to the Magellan Fund era and widely read books about individual-investor research process.",
    whatToLearn: ["state the thesis simply", "know what would make the story wrong", "tie consumer observations to fundamentals"],
    whatNotToCopy: ["do not buy because a product is familiar before checking economics and valuation"],
    guardrailRelevance: ["product_quality_overweight", "valuation_expectation_missing", "single_metric_overweight", "wording_vague"],
    vector: { narrative_sensitivity: 70, valuation_discipline: 66, evidence_threshold: 70, falsifiability_discipline: 68, time_horizon_clarity: 76, research_loop_tendency: 42, contrarian_impulse: 46, product_founder_bias: 76, downside_first_thinking: 48, catalyst_dependence: 24, cycle_regime_sensitivity: 38, systematic_vs_discretionary: 38, concentration_comfort: 36, authority_reliance: 18, value_capture_clarity: 76 }
  },
  {
    id: "terry_smith",
    displayName: "Terry Smith",
    region: "United Kingdom",
    tier: "modern_case",
    category: "Quality growth / compounders",
    styleTags: ["quality_compounders", "buy_good_companies", "long_term_ownership"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Terry_Smith_(fund_manager)",
    readMoreUrl: "https://www.fundsmith.co.uk/",
    sources: [
      { title: "Terry Smith biography", url: "https://en.wikipedia.org/wiki/Terry_Smith_(fund_manager)", quality: "biography", notes: "Biography and Fundsmith context." },
      { title: "Fundsmith owner manuals and letters", url: "https://www.fundsmith.co.uk/fundsmith-equity-fund/fundsmith-equity-fund-owner-s-manual/", quality: "primary", notes: "Primary firm material for quality-compounder philosophy." },
      { title: "Fundsmith annual letters", url: "https://www.fundsmith.co.uk/fundsmith-equity-fund/documents/", quality: "primary", notes: "Primary fund documents and commentary." }
    ],
    teaches: ["quality filters", "do not overtrade", "free cash flow focus", "quality versus valuation tension"],
    commonMisreadings: ["quality company is not any-price security", "low turnover is not refusal to revisit", "brand quality still needs return math"],
    bioSummary: "Terry Smith is a UK fund manager associated with Fundsmith and a quality-compounder philosophy summarized as buying good companies and holding them.",
    investmentStyle: "Quality-compounder investing emphasizing resilient businesses, high returns on capital, cash generation, and low turnover.",
    notableResultsSummary: "Fundsmith documents and owner manuals provide source-backed material for the stated process and quality criteria.",
    whatToLearn: ["define quality explicitly", "watch free cash flow", "avoid unnecessary trading"],
    whatNotToCopy: ["do not make quality a reason to ignore valuation compression risk"],
    guardrailRelevance: ["quality_without_price", "valuation_expectation_missing", "scenario_absent"],
    vector: { narrative_sensitivity: 58, valuation_discipline: 66, evidence_threshold: 78, falsifiability_discipline: 72, time_horizon_clarity: 90, research_loop_tendency: 48, contrarian_impulse: 34, product_founder_bias: 58, downside_first_thinking: 62, catalyst_dependence: 12, cycle_regime_sensitivity: 34, systematic_vs_discretionary: 52, concentration_comfort: 68, authority_reliance: 14, value_capture_clarity: 82 }
  },
  {
    id: "howard_marks",
    displayName: "Howard Marks",
    region: "United States",
    tier: "canonical",
    category: "Contrarian / risk / cycles",
    styleTags: ["second_level_thinking", "risk_cycles", "credit", "contrarian_risk_awareness"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Howard_Marks_(investor)",
    readMoreUrl: "https://www.oaktreecapital.com/insights/memo",
    sources: [
      shared.oaktreeMemos,
      { title: "Howard Marks biography", url: "https://en.wikipedia.org/wiki/Howard_Marks_(investor)", quality: "biography", notes: "Biography and Oaktree context." },
      { title: "The Most Important Thing", url: "https://en.wikipedia.org/wiki/The_Most_Important_Thing_(book)", quality: "book", notes: "Book context for risk and second-level thinking." }
    ],
    teaches: ["second-level thinking", "risk is not volatility alone", "cycle awareness", "prepare rather than predict"],
    commonMisreadings: ["being contrarian is not enough", "risk language is not bearishness", "cycle awareness is not macro certainty"],
    bioSummary: "Howard Marks is co-founder of Oaktree Capital Management and is known for memos about risk, cycles, and second-level thinking.",
    investmentStyle: "Risk-aware credit and value investing focused on cycles, price, consensus expectations, and asymmetric risk/reward.",
    notableResultsSummary: "Oaktree memos are a durable primary source for Marks's process language around risk, cycles, and market psychology.",
    whatToLearn: ["ask what consensus already believes", "separate risk from volatility", "prepare for multiple states"],
    whatNotToCopy: ["do not turn cycle caution into unsupported macro prediction"],
    guardrailRelevance: ["consensus_gap_missing", "cyclicality_ignored", "macro_certainty", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 44, valuation_discipline: 86, evidence_threshold: 84, falsifiability_discipline: 86, time_horizon_clarity: 78, research_loop_tendency: 58, contrarian_impulse: 82, product_founder_bias: 18, downside_first_thinking: 94, catalyst_dependence: 48, cycle_regime_sensitivity: 88, systematic_vs_discretionary: 52, concentration_comfort: 46, authority_reliance: 12, value_capture_clarity: 78 }
  },
  {
    id: "john_templeton",
    displayName: "John Templeton",
    region: "United States / United Kingdom",
    tier: "canonical",
    category: "Contrarian / risk / cycles",
    styleTags: ["global_contrarian", "peak_pessimism", "value", "international"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/John_Templeton",
    readMoreUrl: "https://www.templeton.org/about/sir-john",
    sources: [
      { title: "John Templeton biography", url: "https://en.wikipedia.org/wiki/John_Templeton", quality: "biography", notes: "Biography and Templeton fund context." },
      { title: "Templeton Foundation biography", url: "https://www.templeton.org/about/sir-john", quality: "official", notes: "Official biographical source." },
      { title: "Franklin Templeton history", url: "https://www.franklintempleton.com/about-us/company-profile", quality: "official", notes: "Firm context for Templeton legacy." }
    ],
    teaches: ["global opportunity set", "peak pessimism", "contrarian discipline", "valuation across borders"],
    commonMisreadings: ["pessimism alone is not margin of safety", "foreign market cheapness needs governance and currency checks", "contrarian does not mean reflexively opposite"],
    bioSummary: "John Templeton was a global investor and philanthropist associated with contrarian investing and looking for value in neglected markets.",
    investmentStyle: "Global contrarian value investing that seeks pessimism-driven mispricing while maintaining valuation and diversification discipline.",
    notableResultsSummary: "Public sources emphasize Templeton's role in globalizing value investing and his peak-pessimism framing.",
    whatToLearn: ["define consensus pessimism", "compare globally", "demand valuation support"],
    whatNotToCopy: ["do not buy merely because a country, sector, or stock is disliked"],
    guardrailRelevance: ["consensus_gap_missing", "cyclicality_ignored", "source_quality_weak"],
    vector: { narrative_sensitivity: 42, valuation_discipline: 86, evidence_threshold: 76, falsifiability_discipline: 72, time_horizon_clarity: 82, research_loop_tendency: 44, contrarian_impulse: 92, product_founder_bias: 18, downside_first_thinking: 72, catalyst_dependence: 34, cycle_regime_sensitivity: 70, systematic_vs_discretionary: 48, concentration_comfort: 34, authority_reliance: 16, value_capture_clarity: 68 }
  },
  {
    id: "jeremy_grantham",
    displayName: "Jeremy Grantham",
    region: "United Kingdom / United States",
    tier: "modern_case",
    category: "Contrarian / risk / cycles",
    styleTags: ["bubbles", "long_term_valuation", "mean_reversion", "regime_caution"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Jeremy_Grantham",
    readMoreUrl: "https://www.gmo.com/americas/research-library/",
    sources: [
      { title: "Jeremy Grantham biography", url: "https://en.wikipedia.org/wiki/Jeremy_Grantham", quality: "biography", notes: "Biography and GMO context." },
      { title: "GMO research library", url: "https://www.gmo.com/americas/research-library/", quality: "primary", notes: "Primary firm research and letters." },
      { title: "GMO asset class forecasts", url: "https://www.gmo.com/americas/research-library/gmo-7-year-asset-class-forecast/", quality: "research", notes: "Useful for valuation and mean-reversion process context; forecasts are not advice for this skill." }
    ],
    teaches: ["bubble detection", "mean reversion", "long-term valuation", "regime caution"],
    commonMisreadings: ["bubble risk does not specify timing", "valuation forecasts are not trade signals", "being early can be a process problem"],
    bioSummary: "Jeremy Grantham is co-founder of GMO and is publicly associated with long-term valuation, bubbles, and mean-reversion warnings.",
    investmentStyle: "Valuation-driven, contrarian, long-horizon asset-class and market-cycle thinking with emphasis on bubbles and mean reversion.",
    notableResultsSummary: "GMO letters and research provide source-backed process context for valuation discipline and bubble-risk framing.",
    whatToLearn: ["ask what valuation implies", "separate long-term expected return from timing", "name bubble risk carefully"],
    whatNotToCopy: ["do not turn long-term valuation concern into a precise timing claim"],
    guardrailRelevance: ["macro_story_overreach", "cyclicality_ignored", "valuation_expectation_missing", "time_horizon_missing"],
    vector: { narrative_sensitivity: 48, valuation_discipline: 92, evidence_threshold: 86, falsifiability_discipline: 80, time_horizon_clarity: 86, research_loop_tendency: 58, contrarian_impulse: 86, product_founder_bias: 14, downside_first_thinking: 86, catalyst_dependence: 28, cycle_regime_sensitivity: 94, systematic_vs_discretionary: 62, concentration_comfort: 36, authority_reliance: 14, value_capture_clarity: 70 }
  },
  {
    id: "michael_burry",
    displayName: "Michael Burry",
    region: "United States",
    tier: "controversial_case",
    category: "Contrarian / risk / cycles",
    styleTags: ["contrarian", "deep_research", "asymmetric_bets", "short_selling"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Michael_Burry",
    readMoreUrl: "https://en.wikipedia.org/wiki/Michael_Burry",
    sources: [
      { title: "Michael Burry biography", url: "https://en.wikipedia.org/wiki/Michael_Burry", quality: "biography", notes: "Biography and public context around Scion and subprime thesis." },
      { title: "Scion Asset Management SEC filings", url: "https://www.sec.gov/edgar/browse/?CIK=1649339", quality: "public_record", notes: "Public filings context; incomplete for full strategy." },
      { title: "The Big Short", url: "https://en.wikipedia.org/wiki/The_Big_Short", quality: "book", notes: "Secondary narrative around subprime thesis; use cautiously for process context." }
    ],
    teaches: ["variant perception", "asymmetric payoff", "deep document research", "evidence against consensus"],
    commonMisreadings: ["dramatic short calls are not a reusable process", "being early can be costly", "public tweets are not research"],
    bioSummary: "Michael Burry is a physician-turned-investor known publicly for contrarian research and his role in the subprime mortgage short thesis.",
    investmentStyle: "Contrarian, evidence-heavy, sometimes concentrated investing that seeks asymmetric setups where consensus appears materially wrong.",
    notableResultsSummary: "His best-known public case is the subprime mortgage thesis; use it as a process case, not a template for current decisions.",
    whatToLearn: ["build evidence against consensus", "define payoff asymmetry", "read primary documents"],
    whatNotToCopy: ["do not copy the drama of a contrarian call without the evidence and risk protocol"],
    guardrailRelevance: ["consensus_gap_missing", "downside_protocol_missing", "authority_anchor", "source_quality_weak"],
    vector: { narrative_sensitivity: 46, valuation_discipline: 82, evidence_threshold: 94, falsifiability_discipline: 86, time_horizon_clarity: 70, research_loop_tendency: 76, contrarian_impulse: 96, product_founder_bias: 12, downside_first_thinking: 86, catalyst_dependence: 72, cycle_regime_sensitivity: 82, systematic_vs_discretionary: 32, concentration_comfort: 88, authority_reliance: 8, value_capture_clarity: 74 }
  },
  {
    id: "george_soros",
    displayName: "George Soros",
    region: "United States / Hungary",
    tier: "canonical",
    category: "Macro / trading / reflexivity",
    styleTags: ["reflexivity", "macro", "asymmetric_bets", "fallibility"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/George_Soros",
    readMoreUrl: "https://www.opensocietyfoundations.org/george-soros",
    sources: [
      { title: "George Soros biography", url: "https://en.wikipedia.org/wiki/George_Soros", quality: "biography", notes: "Biography and Quantum Fund context." },
      { title: "The Alchemy of Finance", url: "https://en.wikipedia.org/wiki/The_Alchemy_of_Finance", quality: "book", notes: "Book context for reflexivity and fallibility." },
      { title: "Open Society Foundations biography", url: "https://www.opensocietyfoundations.org/george-soros", quality: "official", notes: "Official biographical source." }
    ],
    teaches: ["reflexivity", "fallibility", "macro feedback loops", "asymmetric positioning"],
    commonMisreadings: ["reflexivity is not license for vague macro stories", "large macro bets require risk controls", "fallibility means revising, not just predicting"],
    bioSummary: "George Soros is an investor and philanthropist associated with macro investing, reflexivity theory, and the Quantum Fund era.",
    investmentStyle: "Discretionary global macro investing focused on reflexive feedback loops, changing expectations, and asymmetric opportunities.",
    notableResultsSummary: "Public sources are most useful for reflexivity and macro process context rather than for copying specific trades.",
    whatToLearn: ["ask how beliefs change reality", "watch feedback loops", "stay open to being wrong"],
    whatNotToCopy: ["do not convert macro narrative into action without falsification and risk boundaries"],
    guardrailRelevance: ["macro_story_overreach", "falsification_missing", "downside_protocol_missing", "scenario_absent"],
    vector: { narrative_sensitivity: 78, valuation_discipline: 48, evidence_threshold: 76, falsifiability_discipline: 88, time_horizon_clarity: 66, research_loop_tendency: 56, contrarian_impulse: 84, product_founder_bias: 10, downside_first_thinking: 76, catalyst_dependence: 72, cycle_regime_sensitivity: 96, systematic_vs_discretionary: 18, concentration_comfort: 90, authority_reliance: 10, value_capture_clarity: 62 }
  },
  {
    id: "stanley_druckenmiller",
    displayName: "Stanley Druckenmiller",
    region: "United States",
    tier: "canonical",
    category: "Macro / trading / reflexivity",
    styleTags: ["macro", "concentrated_bets", "risk_management", "liquidity"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Stanley_Druckenmiller",
    readMoreUrl: "https://en.wikipedia.org/wiki/Stanley_Druckenmiller",
    sources: [
      { title: "Stanley Druckenmiller biography", url: "https://en.wikipedia.org/wiki/Stanley_Druckenmiller", quality: "biography", notes: "Biography and Duquesne context." },
      { title: "Duquesne Family Office SEC filings", url: "https://www.sec.gov/edgar/browse/?CIK=1536411", quality: "public_record", notes: "Public filings context; incomplete for macro exposures." },
      { title: "The New Market Wizards", url: "https://en.wikipedia.org/wiki/Market_Wizards", quality: "book", notes: "Interview source family for trading and risk process context." }
    ],
    teaches: ["risk management", "concentrate when evidence is strong", "liquidity awareness", "change mind quickly"],
    commonMisreadings: ["concentration is not bravado", "macro conviction still needs invalidation", "public 13F data is incomplete for macro process"],
    bioSummary: "Stanley Druckenmiller is a macro investor known for Duquesne Capital and for public discussions of concentrated, risk-managed investing.",
    investmentStyle: "Discretionary macro investing that combines concentrated conviction with strict attention to liquidity, risk, and changing evidence.",
    notableResultsSummary: "Public biography, interviews, and filings provide process context; the skill avoids precise performance claims.",
    whatToLearn: ["size conviction through process, not excitement", "change mind when facts change", "make risk explicit"],
    whatNotToCopy: ["do not imitate concentration without a risk protocol"],
    guardrailRelevance: ["downside_protocol_missing", "macro_story_overreach", "falsification_missing", "position_protocol_missing"],
    vector: { narrative_sensitivity: 64, valuation_discipline: 54, evidence_threshold: 82, falsifiability_discipline: 88, time_horizon_clarity: 72, research_loop_tendency: 44, contrarian_impulse: 68, product_founder_bias: 10, downside_first_thinking: 82, catalyst_dependence: 76, cycle_regime_sensitivity: 96, systematic_vs_discretionary: 24, concentration_comfort: 96, authority_reliance: 8, value_capture_clarity: 62 }
  },
  {
    id: "paul_tudor_jones",
    displayName: "Paul Tudor Jones",
    region: "United States",
    tier: "canonical",
    category: "Macro / trading / reflexivity",
    styleTags: ["trading", "macro", "risk_control", "loss_control"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Paul_Tudor_Jones",
    readMoreUrl: "https://www.tudor.com/",
    sources: [
      { title: "Paul Tudor Jones biography", url: "https://en.wikipedia.org/wiki/Paul_Tudor_Jones", quality: "biography", notes: "Biography and Tudor Investment context." },
      { title: "Tudor Investment Corporation", url: "https://www.tudor.com/", quality: "official", notes: "Official firm context." },
      { title: "Market Wizards", url: "https://en.wikipedia.org/wiki/Market_Wizards", quality: "book", notes: "Interview source family for trading process and loss control." }
    ],
    teaches: ["loss control", "timing discipline", "trading risk boundaries", "humility under uncertainty"],
    commonMisreadings: ["trading skill does not translate to casual timing", "stop-loss language is not a substitute for thesis", "macro view needs execution discipline"],
    bioSummary: "Paul Tudor Jones is a trader and macro investor associated with Tudor Investment Corporation and public emphasis on risk control.",
    investmentStyle: "Macro and trading-oriented investing with strong emphasis on loss control, timing, and disciplined risk management.",
    notableResultsSummary: "Public sources are most useful for process ideas around risk, trading discipline, and drawdown control.",
    whatToLearn: ["predefine loss control", "separate thesis from trade timing", "respect uncertainty"],
    whatNotToCopy: ["do not apply trading instincts to long-term investing without a clear process"],
    guardrailRelevance: ["downside_protocol_missing", "time_horizon_missing", "macro_story_overreach"],
    vector: { narrative_sensitivity: 56, valuation_discipline: 42, evidence_threshold: 78, falsifiability_discipline: 86, time_horizon_clarity: 72, research_loop_tendency: 34, contrarian_impulse: 58, product_founder_bias: 8, downside_first_thinking: 92, catalyst_dependence: 84, cycle_regime_sensitivity: 92, systematic_vs_discretionary: 38, concentration_comfort: 76, authority_reliance: 8, value_capture_clarity: 54 }
  },
  {
    id: "jesse_livermore",
    displayName: "Jesse Livermore",
    region: "United States",
    tier: "controversial_case",
    category: "Macro / trading / reflexivity",
    styleTags: ["speculation", "tape_reading", "risk", "cautionary_archetype"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Jesse_Livermore",
    readMoreUrl: "https://en.wikipedia.org/wiki/Jesse_Livermore",
    sources: [
      { title: "Jesse Livermore biography", url: "https://en.wikipedia.org/wiki/Jesse_Livermore", quality: "biography", notes: "Biography and cautionary context." },
      { title: "Reminiscences of a Stock Operator", url: "https://en.wikipedia.org/wiki/Reminiscences_of_a_Stock_Operator", quality: "book", notes: "Fictionalized account often associated with trading psychology; use cautiously." },
      { title: "How to Trade in Stocks", url: "https://en.wikipedia.org/wiki/Jesse_Livermore#Books", quality: "book", notes: "Book context, not a modern recommendation source." }
    ],
    teaches: ["speculation caution", "risk of leverage", "price action discipline", "psychological fragility"],
    commonMisreadings: ["legendary trades do not make a risk process", "tape reading is not investment research", "cautionary cases are not avatars to emulate"],
    bioSummary: "Jesse Livermore was a famous speculator whose life is often used as both a trading psychology case and a cautionary risk story.",
    investmentStyle: "Speculative trading archetype centered on price action, timing, and crowd behavior, best used in this product as a warning lens.",
    notableResultsSummary: "His public significance is as a historical trading figure and cautionary case about speculation, leverage, and psychology.",
    whatToLearn: ["respect leverage and ruin risk", "do not confuse price action with business analysis", "define loss boundaries"],
    whatNotToCopy: ["do not romanticize speculation or ignore life-cycle and leverage risk"],
    guardrailRelevance: ["downside_protocol_missing", "narrative_to_action_jump", "time_horizon_missing"],
    vector: { narrative_sensitivity: 48, valuation_discipline: 18, evidence_threshold: 58, falsifiability_discipline: 70, time_horizon_clarity: 54, research_loop_tendency: 18, contrarian_impulse: 60, product_founder_bias: 4, downside_first_thinking: 76, catalyst_dependence: 90, cycle_regime_sensitivity: 72, systematic_vs_discretionary: 28, concentration_comfort: 86, authority_reliance: 8, value_capture_clarity: 28 }
  },
  {
    id: "ray_dalio",
    displayName: "Ray Dalio",
    region: "United States",
    tier: "canonical",
    category: "Macro / trading / reflexivity",
    styleTags: ["macro", "risk_parity", "principles", "regime_map"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Ray_Dalio",
    readMoreUrl: "https://www.bridgewater.com/research-and-insights",
    sources: [
      { title: "Ray Dalio biography", url: "https://en.wikipedia.org/wiki/Ray_Dalio", quality: "biography", notes: "Biography and Bridgewater context." },
      { title: "Bridgewater research and insights", url: "https://www.bridgewater.com/research-and-insights", quality: "primary", notes: "Primary firm source for macro and portfolio principles." },
      { title: "Principles", url: "https://en.wikipedia.org/wiki/Principles_(book)", quality: "book", notes: "Book context for decision principles and process culture." }
    ],
    teaches: ["regime mapping", "diversification", "principles", "economic machine framing"],
    commonMisreadings: ["principles are not automatic truth", "macro frameworks can over-explain", "diversification is not a personal allocation recommendation"],
    bioSummary: "Ray Dalio founded Bridgewater Associates and is associated with macro frameworks, risk parity, and principles-based process.",
    investmentStyle: "Macro and portfolio-process investing that emphasizes economic regimes, diversification, systematic principles, and scenario thinking.",
    notableResultsSummary: "Bridgewater research and Dalio's public writing are useful for macro-regime and process language, not for personalized allocation advice.",
    whatToLearn: ["map regimes", "write explicit principles", "think in scenarios"],
    whatNotToCopy: ["do not let a macro framework replace asset-specific evidence"],
    guardrailRelevance: ["macro_story_overreach", "scenario_absent", "cycle_regime_guardrail"],
    vector: { narrative_sensitivity: 70, valuation_discipline: 48, evidence_threshold: 82, falsifiability_discipline: 78, time_horizon_clarity: 82, research_loop_tendency: 66, contrarian_impulse: 52, product_founder_bias: 8, downside_first_thinking: 78, catalyst_dependence: 40, cycle_regime_sensitivity: 98, systematic_vs_discretionary: 82, concentration_comfort: 28, authority_reliance: 20, value_capture_clarity: 54 }
  },
  {
    id: "john_bogle",
    displayName: "John C. Bogle",
    region: "United States",
    tier: "canonical",
    category: "Systematic / quant / passive",
    styleTags: ["indexing", "low_cost", "passive_investing", "humility"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/John_C._Bogle",
    readMoreUrl: "https://corporate.vanguard.com/content/corporatesite/us/en/corp/who-we-are/sets-us-apart/indexing-history.html",
    sources: [
      { title: "John C. Bogle biography", url: "https://en.wikipedia.org/wiki/John_C._Bogle", quality: "biography", notes: "Biography and Vanguard context." },
      { title: "Vanguard Bogle history", url: "https://corporate.vanguard.com/content/corporatesite/us/en/corp/who-we-are/sets-us-apart/indexing-history.html", quality: "official", notes: "Official Vanguard source for index-fund history." },
      { title: "Bogleheads investment philosophy", url: "https://www.bogleheads.org/wiki/Bogleheads%C2%AE_investment_philosophy", quality: "reliable_secondary", notes: "Community educational summary; not primary but useful for philosophy framing." }
    ],
    teaches: ["cost discipline", "market humility", "indexing", "avoid unnecessary complexity"],
    commonMisreadings: ["humility is not apathy", "passive principles are not a stock-picking thesis", "low cost does not eliminate risk"],
    bioSummary: "John C. Bogle founded Vanguard and is associated with low-cost index investing and investor-cost discipline.",
    investmentStyle: "Passive, low-cost, broad-market investing philosophy centered on humility, costs, diversification, and long-term compounding.",
    notableResultsSummary: "His historical importance is the popularization of low-cost indexing and the investor-first mutual fund structure at Vanguard.",
    whatToLearn: ["ask whether active edge is real", "control costs", "prefer simple processes when evidence is weak"],
    whatNotToCopy: ["do not use passive humility to avoid clarifying an active thesis when you are making one"],
    guardrailRelevance: ["authority_anchor", "source_quality_weak", "evidence_basis_missing"],
    vector: { narrative_sensitivity: 16, valuation_discipline: 60, evidence_threshold: 82, falsifiability_discipline: 82, time_horizon_clarity: 88, research_loop_tendency: 22, contrarian_impulse: 24, product_founder_bias: 4, downside_first_thinking: 70, catalyst_dependence: 4, cycle_regime_sensitivity: 30, systematic_vs_discretionary: 96, concentration_comfort: 8, authority_reliance: 10, value_capture_clarity: 48 }
  },
  {
    id: "jim_simons",
    displayName: "Jim Simons",
    region: "United States",
    tier: "canonical",
    category: "Systematic / quant / passive",
    styleTags: ["quant", "systematic", "data", "statistical_edge"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Jim_Simons_(mathematician)",
    readMoreUrl: "https://www.simonsfoundation.org/people/james-h-simons/",
    sources: [
      { title: "Jim Simons biography", url: "https://en.wikipedia.org/wiki/Jim_Simons_(mathematician)", quality: "biography", notes: "Biography and Renaissance Technologies context." },
      { title: "Renaissance Technologies", url: "https://en.wikipedia.org/wiki/Renaissance_Technologies", quality: "reliable_secondary", notes: "Firm context and public history." },
      { title: "Simons Foundation biography", url: "https://www.simonsfoundation.org/people/james-h-simons/", quality: "official", notes: "Official biography from Simons Foundation." }
    ],
    teaches: ["statistical edge", "systems over stories", "data quality", "team science"],
    commonMisreadings: ["quant success is not spreadsheet curve-fitting", "public data is not necessarily edge", "black-box mystique is not a process"],
    bioSummary: "Jim Simons was a mathematician, founder of Renaissance Technologies, and philanthropist associated with systematic quantitative investing.",
    investmentStyle: "Systematic quantitative investing based on statistical signals, data infrastructure, modeling, and rigorous research culture.",
    notableResultsSummary: "Public sources support his role as a leading quant pioneer; precise fund records should be handled cautiously and not used as ranking claims.",
    whatToLearn: ["prefer tested signals over stories", "respect data quality", "separate intuition from measurable edge"],
    whatNotToCopy: ["do not call a simple backtest a Renaissance-style process"],
    guardrailRelevance: ["single_metric_overweight", "source_quality_weak", "evidence_basis_missing"],
    vector: { narrative_sensitivity: 8, valuation_discipline: 44, evidence_threshold: 98, falsifiability_discipline: 94, time_horizon_clarity: 68, research_loop_tendency: 82, contrarian_impulse: 34, product_founder_bias: 2, downside_first_thinking: 70, catalyst_dependence: 22, cycle_regime_sensitivity: 50, systematic_vs_discretionary: 100, concentration_comfort: 42, authority_reliance: 6, value_capture_clarity: 42 }
  },
  {
    id: "edward_thorp",
    displayName: "Edward O. Thorp",
    region: "United States",
    tier: "canonical",
    category: "Systematic / quant / passive",
    styleTags: ["probability", "arbitrage", "quant", "risk_control"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Edward_O._Thorp",
    readMoreUrl: "https://en.wikipedia.org/wiki/Edward_O._Thorp",
    sources: [
      { title: "Edward O. Thorp biography", url: "https://en.wikipedia.org/wiki/Edward_O._Thorp", quality: "biography", notes: "Biography and blackjack/quant finance context." },
      { title: "A Man for All Markets", url: "https://en.wikipedia.org/wiki/A_Man_for_All_Markets", quality: "book", notes: "Autobiographical source for probability, arbitrage, and risk thinking." },
      { title: "Beat the Dealer", url: "https://en.wikipedia.org/wiki/Beat_the_Dealer", quality: "book", notes: "Book context for probabilistic edge." }
    ],
    teaches: ["probabilistic thinking", "edge measurement", "risk of ruin", "arbitrage logic"],
    commonMisreadings: ["probability language is not certainty", "edge disappears when crowded", "small samples do not prove a system"],
    bioSummary: "Edward O. Thorp is a mathematician, author, and investor associated with card counting, probability, arbitrage, and quantitative finance.",
    investmentStyle: "Quantitative and probabilistic investing focused on measurable edge, arbitrage logic, and risk-of-ruin discipline.",
    notableResultsSummary: "His books and public biography provide source-backed context for applying probability and edge measurement to markets.",
    whatToLearn: ["quantify edge", "consider risk of ruin", "test whether the game is favorable"],
    whatNotToCopy: ["do not overstate precision from thin evidence"],
    guardrailRelevance: ["evidence_basis_missing", "single_metric_overweight", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 12, valuation_discipline: 58, evidence_threshold: 96, falsifiability_discipline: 96, time_horizon_clarity: 72, research_loop_tendency: 72, contrarian_impulse: 44, product_founder_bias: 2, downside_first_thinking: 86, catalyst_dependence: 46, cycle_regime_sensitivity: 42, systematic_vs_discretionary: 96, concentration_comfort: 42, authority_reliance: 4, value_capture_clarity: 54 }
  },
  {
    id: "cliff_asness",
    displayName: "Cliff Asness",
    region: "United States",
    tier: "modern_case",
    category: "Systematic / quant / passive",
    styleTags: ["factor_investing", "value_momentum", "quant", "anti_story"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Cliff_Asness",
    readMoreUrl: "https://www.aqr.com/Insights/Research",
    sources: [
      { title: "Cliff Asness biography", url: "https://en.wikipedia.org/wiki/Cliff_Asness", quality: "biography", notes: "Biography and AQR context." },
      shared.aqrResearch,
      { title: "AQR Alternative Thinking", url: "https://www.aqr.com/Insights/Perspectives", quality: "research", notes: "Practitioner perspectives for factor discipline and market commentary." }
    ],
    teaches: ["factor discipline", "anti-story evidence", "value and momentum", "long-horizon process pain"],
    commonMisreadings: ["factor labels are not magic words", "underperformance does not instantly falsify a long-horizon factor", "statistics still need implementation discipline"],
    bioSummary: "Cliff Asness is co-founder of AQR Capital Management and is associated with systematic factor investing and quantitative research.",
    investmentStyle: "Systematic factor investing that emphasizes evidence, diversification across signals, value, momentum, and disciplined implementation.",
    notableResultsSummary: "AQR research is a primary source for his public process language around factors and systematic investing.",
    whatToLearn: ["ask for base-rate evidence", "separate story from factor exposure", "prepare for painful tracking error"],
    whatNotToCopy: ["do not slap factor terms onto discretionary narratives without evidence"],
    guardrailRelevance: ["source_quality_weak", "single_metric_overweight", "scenario_absent"],
    vector: { narrative_sensitivity: 16, valuation_discipline: 78, evidence_threshold: 94, falsifiability_discipline: 90, time_horizon_clarity: 80, research_loop_tendency: 68, contrarian_impulse: 58, product_founder_bias: 4, downside_first_thinking: 72, catalyst_dependence: 18, cycle_regime_sensitivity: 58, systematic_vs_discretionary: 98, concentration_comfort: 24, authority_reliance: 8, value_capture_clarity: 58 }
  },
  {
    id: "eugene_fama",
    displayName: "Eugene Fama",
    region: "United States",
    tier: "canonical",
    category: "Systematic / quant / passive",
    styleTags: ["efficient_markets", "factor_research", "academic_finance", "market_humility"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Eugene_Fama",
    readMoreUrl: "https://www.nobelprize.org/prizes/economic-sciences/2013/fama/facts/",
    sources: [
      { title: "Eugene Fama biography", url: "https://en.wikipedia.org/wiki/Eugene_Fama", quality: "biography", notes: "Biography and Nobel Prize context." },
      { title: "Fama-French research library", url: "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html", quality: "research", notes: "Research data library associated with factor research." },
      { title: "Nobel Prize biography", url: "https://www.nobelprize.org/prizes/economic-sciences/2013/fama/facts/", quality: "official", notes: "Official Nobel source for research contribution context." }
    ],
    teaches: ["market efficiency discipline", "base rates", "factor evidence", "humility about edge"],
    commonMisreadings: ["efficient markets are not perfectly priced markets", "factor evidence is not security-specific advice", "academic evidence needs implementation context"],
    bioSummary: "Eugene Fama is an economist associated with efficient market research and factor models in empirical asset pricing.",
    investmentStyle: "Academic, evidence-first market-efficiency lens that pushes investors to justify active edge and separate risk factors from stories.",
    notableResultsSummary: "His Nobel-recognized research and factor work provide source-backed context for market-efficiency guardrails.",
    whatToLearn: ["ask why you have edge", "use base rates", "separate systematic exposure from skill"],
    whatNotToCopy: ["do not use market efficiency as a reason to stop thinking about process"],
    guardrailRelevance: ["evidence_basis_missing", "authority_anchor", "source_quality_weak"],
    vector: { narrative_sensitivity: 8, valuation_discipline: 62, evidence_threshold: 98, falsifiability_discipline: 94, time_horizon_clarity: 78, research_loop_tendency: 64, contrarian_impulse: 22, product_founder_bias: 2, downside_first_thinking: 68, catalyst_dependence: 6, cycle_regime_sensitivity: 44, systematic_vs_discretionary: 100, concentration_comfort: 10, authority_reliance: 8, value_capture_clarity: 46 }
  },
  {
    id: "carl_icahn",
    displayName: "Carl Icahn",
    region: "United States",
    tier: "canonical",
    category: "Activist / special situations",
    styleTags: ["activist", "corporate_control", "governance", "catalyst"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Carl_Icahn",
    readMoreUrl: "https://www.ielp.com/",
    sources: [
      { title: "Carl Icahn biography", url: "https://en.wikipedia.org/wiki/Carl_Icahn", quality: "biography", notes: "Biography and activism context." },
      { title: "Icahn Enterprises", url: "https://www.ielp.com/", quality: "official", notes: "Official company context." },
      { title: "Icahn SEC filings", url: "https://www.sec.gov/edgar/browse/?CIK=921669", quality: "public_record", notes: "Public filings context." }
    ],
    teaches: ["catalyst definition", "governance pressure", "corporate control", "shareholder rights"],
    commonMisreadings: ["activism is not just complaining", "catalyst requires power and process", "public campaigns carry reputational and execution risk"],
    bioSummary: "Carl Icahn is an activist investor associated with corporate control, governance campaigns, and public shareholder activism.",
    investmentStyle: "Activist and special-situation investing that seeks value realization through governance pressure, capital allocation changes, or corporate actions.",
    notableResultsSummary: "His public significance is the development of high-profile activist campaigns and corporate-control investing.",
    whatToLearn: ["define the catalyst", "map governance power", "ask who can force change"],
    whatNotToCopy: ["do not assume a catalyst exists merely because change would be desirable"],
    guardrailRelevance: ["catalyst_missing", "consensus_gap_missing", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 42, valuation_discipline: 76, evidence_threshold: 78, falsifiability_discipline: 76, time_horizon_clarity: 76, research_loop_tendency: 40, contrarian_impulse: 78, product_founder_bias: 8, downside_first_thinking: 70, catalyst_dependence: 96, cycle_regime_sensitivity: 42, systematic_vs_discretionary: 18, concentration_comfort: 88, authority_reliance: 8, value_capture_clarity: 82 }
  },
  {
    id: "bill_ackman",
    displayName: "Bill Ackman",
    region: "United States",
    tier: "modern_case",
    category: "Activist / special situations",
    styleTags: ["activist", "concentrated", "public_campaigns", "thesis_clarity"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Bill_Ackman",
    readMoreUrl: "https://pershingsquareholdings.com/company-reports/letters-to-shareholders/",
    sources: [
      { title: "Bill Ackman biography", url: "https://en.wikipedia.org/wiki/Bill_Ackman", quality: "biography", notes: "Biography and Pershing Square context." },
      { title: "Pershing Square shareholder letters", url: "https://pershingsquareholdings.com/company-reports/letters-to-shareholders/", quality: "primary", notes: "Primary source for public thesis articulation and portfolio commentary." },
      { title: "Pershing Square Holdings reports", url: "https://pershingsquareholdings.com/company-reports/financial-statements/", quality: "primary", notes: "Public company reports for fund context." }
    ],
    teaches: ["public thesis clarity", "activist catalysts", "concentration", "reputational risk"],
    commonMisreadings: ["confidence and presentation do not equal truth", "public thesis can become identity risk", "activism requires specific levers"],
    bioSummary: "Bill Ackman is founder and CEO of Pershing Square Capital Management and is associated with concentrated activist and public-campaign investing.",
    investmentStyle: "Concentrated activist and public-equity investing with strong emphasis on thesis articulation, catalysts, governance, and portfolio-level conviction.",
    notableResultsSummary: "Pershing Square reports and letters offer source-backed examples of public thesis framing and activist-style communication.",
    whatToLearn: ["write the thesis clearly", "state the catalyst", "track reputational and identity risk"],
    whatNotToCopy: ["do not let a public narrative make thesis revision harder"],
    guardrailRelevance: ["catalyst_missing", "falsification_missing", "authority_anchor", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 72, valuation_discipline: 74, evidence_threshold: 82, falsifiability_discipline: 72, time_horizon_clarity: 80, research_loop_tendency: 58, contrarian_impulse: 76, product_founder_bias: 34, downside_first_thinking: 70, catalyst_dependence: 94, cycle_regime_sensitivity: 46, systematic_vs_discretionary: 20, concentration_comfort: 96, authority_reliance: 12, value_capture_clarity: 84 }
  },
  {
    id: "joel_greenblatt",
    displayName: "Joel Greenblatt",
    region: "United States",
    tier: "canonical",
    category: "Activist / special situations",
    styleTags: ["special_situations", "magic_formula", "value", "simple_rules"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Joel_Greenblatt",
    readMoreUrl: "https://en.wikipedia.org/wiki/Joel_Greenblatt",
    sources: [
      { title: "Joel Greenblatt biography", url: "https://en.wikipedia.org/wiki/Joel_Greenblatt", quality: "biography", notes: "Biography and Gotham context." },
      { title: "You Can Be a Stock Market Genius", url: "https://en.wikipedia.org/wiki/Joel_Greenblatt#Bibliography", quality: "book", notes: "Book context for special situations." },
      { title: "The Little Book That Beats the Market", url: "https://en.wikipedia.org/wiki/The_Little_Book_That_Beats_the_Market", quality: "book", notes: "Book context for simple quality/value rules." }
    ],
    teaches: ["special situations", "simple rules", "return on capital and earnings yield", "spin-offs and catalysts"],
    commonMisreadings: ["magic formula is not magic", "special situations need event mechanics", "simple rules still need implementation discipline"],
    bioSummary: "Joel Greenblatt is an investor, professor, and author associated with special situations and simple quality-value frameworks.",
    investmentStyle: "Value and special-situation investing that combines simple quantitative rules with event-driven opportunity analysis.",
    notableResultsSummary: "His books are useful source material for special-situation thinking and simple-rule value frameworks.",
    whatToLearn: ["look for event mechanics", "use simple ranking rules carefully", "connect quality and price"],
    whatNotToCopy: ["do not treat a formula as a substitute for understanding why the opportunity exists"],
    guardrailRelevance: ["catalyst_missing", "single_metric_overweight", "valuation_expectation_missing"],
    vector: { narrative_sensitivity: 34, valuation_discipline: 86, evidence_threshold: 78, falsifiability_discipline: 80, time_horizon_clarity: 76, research_loop_tendency: 44, contrarian_impulse: 66, product_founder_bias: 10, downside_first_thinking: 78, catalyst_dependence: 84, cycle_regime_sensitivity: 34, systematic_vs_discretionary: 74, concentration_comfort: 54, authority_reliance: 10, value_capture_clarity: 78 }
  },
  {
    id: "bill_gross",
    displayName: "Bill Gross",
    region: "United States",
    tier: "canonical",
    category: "Credit / bonds / endowment",
    styleTags: ["bonds", "duration", "fixed_income", "rates"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/Bill_Gross",
    readMoreUrl: "https://www.pimco.com/us/en/insights",
    sources: [
      { title: "Bill Gross biography", url: "https://en.wikipedia.org/wiki/Bill_Gross", quality: "biography", notes: "Biography and PIMCO context." },
      { title: "PIMCO insights", url: "https://www.pimco.com/us/en/insights", quality: "primary", notes: "Firm research context for fixed income and macro." },
      { title: "PIMCO history", url: "https://www.pimco.com/us/en/about-us", quality: "official", notes: "Official firm context." }
    ],
    teaches: ["duration awareness", "fixed-income risk", "rate sensitivity", "income versus capital risk"],
    commonMisreadings: ["bonds are not risk-free", "yield is not total return", "duration can dominate narrative"],
    bioSummary: "Bill Gross co-founded PIMCO and is publicly associated with fixed-income investing and bond-market commentary.",
    investmentStyle: "Fixed-income and macro investing focused on rates, duration, credit quality, yield, and bond-market structure.",
    notableResultsSummary: "His public role is most useful for teaching rate and duration awareness rather than for equity-style thesis matching.",
    whatToLearn: ["measure duration", "separate yield from risk", "map rate sensitivity"],
    whatNotToCopy: ["do not import bond-market confidence into equity theses without asset-sensitivity work"],
    guardrailRelevance: ["cycle_regime_guardrail", "macro_story_overreach", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 38, valuation_discipline: 72, evidence_threshold: 78, falsifiability_discipline: 76, time_horizon_clarity: 80, research_loop_tendency: 46, contrarian_impulse: 52, product_founder_bias: 4, downside_first_thinking: 84, catalyst_dependence: 46, cycle_regime_sensitivity: 94, systematic_vs_discretionary: 54, concentration_comfort: 40, authority_reliance: 12, value_capture_clarity: 46 }
  },
  {
    id: "david_swensen",
    displayName: "David Swensen",
    region: "United States",
    tier: "canonical",
    category: "Credit / bonds / endowment",
    styleTags: ["endowment_model", "asset_allocation", "manager_selection", "illiquidity"],
    wikipediaUrl: "https://en.wikipedia.org/wiki/David_F._Swensen",
    readMoreUrl: "https://investments.yale.edu/",
    sources: [
      { title: "David Swensen biography", url: "https://en.wikipedia.org/wiki/David_F._Swensen", quality: "biography", notes: "Biography and Yale endowment context." },
      { title: "Yale Investments Office", url: "https://investments.yale.edu/", quality: "official", notes: "Official endowment source." },
      { title: "Pioneering Portfolio Management", url: "https://en.wikipedia.org/wiki/David_F._Swensen#Works", quality: "book", notes: "Book context for endowment model and portfolio process." }
    ],
    teaches: ["portfolio construction", "manager selection", "illiquidity tradeoffs", "long horizon governance"],
    commonMisreadings: ["endowment model is not simple retail asset allocation", "illiquidity requires governance and time horizon", "manager access is part of the model"],
    bioSummary: "David Swensen was Yale's chief investment officer and is associated with the endowment model, portfolio construction, and alternative assets.",
    investmentStyle: "Institutional portfolio construction emphasizing asset allocation, manager selection, illiquidity premiums, and long-horizon governance.",
    notableResultsSummary: "Public material is strongest for endowment-model principles and institutional process, not for personal allocation recommendations.",
    whatToLearn: ["state portfolio role", "respect liquidity constraints", "separate manager skill from asset exposure"],
    whatNotToCopy: ["do not copy an endowment model without institutional access, governance, and liquidity context"],
    guardrailRelevance: ["portfolio_context_missing", "time_horizon_missing", "downside_protocol_missing"],
    vector: { narrative_sensitivity: 34, valuation_discipline: 68, evidence_threshold: 86, falsifiability_discipline: 78, time_horizon_clarity: 92, research_loop_tendency: 62, contrarian_impulse: 46, product_founder_bias: 6, downside_first_thinking: 82, catalyst_dependence: 20, cycle_regime_sensitivity: 72, systematic_vs_discretionary: 70, concentration_comfort: 22, authority_reliance: 14, value_capture_clarity: 52 }
  }
];

export const ACTIVE_MASTER_IDS = MASTER_RECORDS.map((master) => master.id);

export const FUTURE_MASTER_IDS = [
  "david_dodd",
  "mohnish_pabrai",
  "guy_spier",
  "nick_sleep",
  "chuck_akre",
  "bruce_kovner",
  "ed_seykota",
  "richard_dennis",
  "kenneth_french",
  "mario_gabelli",
  "jeffrey_gundlach",
  "david_tepper",
  "cathie_wood",
  "ken_griffin",
  "julian_robertson"
];
