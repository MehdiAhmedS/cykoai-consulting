/**
 * Every visible string on the page (v3 step 01).
 *
 * status: "confirmed" is v1 copy Mehdi has approved (or a line the step
 * prompt marks confirmed); "draft" is new wording awaiting his sign-off.
 * Mehdi signed off every draft on 17 Oct (the sign-off sheet), so every
 * entry is now confirmed. Engagement effort and the team are left off.
 * Unknown values are the string "TBC". Nothing here is invented: drafts
 * are transcribed from docs/v3/prompts/01-structure.md.
 */

export type Status = "confirmed" | "draft";

export const TBC = "TBC";
export const isTBC = (value: string) => value === TBC;

/** Drafts and TBC values are visible in dev only. */
export const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

/** For entries that production hides until Mehdi confirms them. */
export const isShown = (status: Status) => SHOW_DRAFTS || status === "confirmed";

export interface Text {
  text: string;
  status: Status;
}

export interface Link {
  label: string;
  href: string;
  status: Status;
}

export interface Offer {
  id: string;
  name: string;
  practice: string;
  for: string;
  youGet: string;
  status: Status;
}

export interface Step {
  title: string;
  text: string;
  /** What the client holds at the end of the stage. */
  receive: Text;
  status: Status;
}

/** A row on the Engagement cover. A TBC value hides the row in production. */
export interface CoverRow {
  label: string;
  value: string;
  status: Status;
}

export interface Rule {
  title: string;
  text: string;
  status: Status;
}

export interface TeamMember {
  name: string;
  role: string;
  credentials: string;
  status: Status;
}

export interface NamePart {
  syllable: string;
  text: string;
  status: Status;
}

/**
 * A place on the hero globe, at its country's capital. Clients are labelled
 * by country only; decorative places get a marker and an arc but no label.
 */
export interface GlobeLocation {
  name: string;
  lat: number;
  lng: number;
  role: "origin" | "client" | "decorative";
  status: Status;
}

const SECTION_LINKS: Link[] = [
  { label: "Our Craft", href: "#offers", status: "confirmed" },
  { label: "Projects", href: "#projects", status: "confirmed" },
  { label: "Engagement", href: "#engagement", status: "confirmed" },
  { label: "Standards", href: "#standards", status: "confirmed" },
];

const TALK_TO_US: Link = { label: "Talk to us", href: "#contact", status: "confirmed" };

const EMAIL = "info@cykoai.com";

export const site = {
  nav: {
    wordmark: { text: "CYKOAI", status: "confirmed" } as Text,
    tag: { text: "CONSULTING", status: "confirmed" } as Text,
    links: SECTION_LINKS,
    cta: TALK_TO_US,
  },

  hero: {
    eyebrow: { text: "Security · AI automation · Software Engineering", status: "confirmed" } as Text,
    headline: {
      text: "The future moves faster than",
      dim: "your organization.",
      status: "confirmed" as Status,
    },
    lede: {
      text: "Cybersecurity, AI automation, mobile apps, API integrations and Company Branding, from one team.",
      status: "confirmed",
    } as Text,
    primaryCta: TALK_TO_US,
    secondaryCta: { label: "See what we do", href: "#offers", status: "confirmed" } as Link,
  },

  // Clients are real (Mehdi, 26 Sep; Kenya and Tanzania, 17 Oct). Only confirmed entries are drawn.
  globe: {
    locations: [
      // Arcs visit these in order (skipping any not in view). Decorative places are
      // not clients (Mehdi, 27 Sep): they get an arc but are never labelled.
      { name: "Muscat", lat: 23.59, lng: 58.38, role: "origin", status: "confirmed" },
      { name: "Pakistan", lat: 33.68, lng: 73.05, role: "client", status: "confirmed" }, // Islamabad
      { name: "Saudi Arabia", lat: 24.71, lng: 46.68, role: "decorative", status: "confirmed" }, // Riyadh
      { name: "UAE", lat: 24.45, lng: 54.38, role: "client", status: "confirmed" }, // Abu Dhabi
      { name: "India", lat: 28.61, lng: 77.21, role: "decorative", status: "confirmed" }, // New Delhi
      { name: "Germany", lat: 52.52, lng: 13.4, role: "client", status: "confirmed" }, // Berlin
      { name: "Egypt", lat: 30.04, lng: 31.24, role: "decorative", status: "confirmed" }, // Cairo
      { name: "Kenya", lat: -1.29, lng: 36.82, role: "client", status: "confirmed" }, // Nairobi
      { name: "Tanzania", lat: -6.16, lng: 35.75, role: "client", status: "confirmed" }, // Dodoma
      { name: "United Kingdom", lat: 51.51, lng: -0.13, role: "decorative", status: "confirmed" }, // London
      { name: "Singapore", lat: 1.35, lng: 103.82, role: "decorative", status: "confirmed" },
    ] as GlobeLocation[],
  },

  offers: {
    // Matches the menu link (Mehdi, 17 Oct).
    label: { text: "Our Craft", status: "confirmed" } as Text,
    heading: { text: "What you can hire us for.", status: "confirmed" } as Text,
    intro: { text: "Six ways to work with us. Pick one, or combine them.", status: "confirmed" } as Text,
    fields: { for: "For", youGet: "You get", status: "confirmed" as Status },
    items: [
      {
        id: "security-reviews",
        name: "Security reviews",
        practice: "Security",
        for: "Apps about to launch, including AI-built ones",
        youGet: "Architecture and design review and penetration testing, with findings by severity and fixes",
        status: "confirmed",
      },
      {
        id: "workspace-hardening",
        name: "Workspace hardening",
        practice: "Security",
        for: "Organisations on Google Workspace",
        youGet: "A hardened configuration, a review of contractor and freelancer access, and controls mapped to ISO/IEC 27001",
        status: "confirmed",
      },
      {
        id: "ai-automation",
        name: "AI automation",
        practice: "AI",
        for: "Teams with repetitive, manual work",
        youGet: "AI workflows that remove manual steps, including private AI on Google Vertex",
        status: "confirmed",
      },
      {
        id: "mobile-iot",
        name: "Mobile apps and device integrations",
        practice: "Engineering",
        for: "Products that talk to hardware",
        youGet: "Mobile applications with API integrations to devices and IoT hardware",
        status: "confirmed",
      },
      {
        id: "apis-bots",
        name: "APIs and bot deployments",
        practice: "Engineering",
        for: "Teams connecting systems",
        youGet: "API integrations and Docker-based bot deployments",
        status: "confirmed",
      },
      {
        // Renamed from "Company profiles" (Mehdi, 27 Sep): almost any kind of landing page.
        id: "landing-pages",
        name: "Landing pages",
        practice: "Design",
        for: "Companies that need a presence",
        youGet: "Landing pages of almost any kind, with the brand design to match, built from the ground up",
        status: "confirmed",
      },
    ] as Offer[],
  },

  engagement: {
    label: { text: "Engagement", status: "confirmed" } as Text,
    heading: { text: "How an engagement runs.", status: "confirmed" } as Text,
    intro: {
      text: "What happens between your first message and the handover.",
      status: "confirmed",
    } as Text,
    /** The cover (step 08). Team and Handover are derived from the Deploy and Sustain lines. */
    cover: {
      title: { text: "A typical engagement", status: "confirmed" } as Text,
      rows: [
        { label: "Length", value: "6 weeks", status: "confirmed" },
        { label: "Team", value: "Engineers and a strategist, inside your team", status: "confirmed" },
        // Effort is left off (Mehdi, 17 Oct). Add a row here to show it.
        { label: "Handover", value: "Your team runs it", status: "confirmed" },
      ] as CoverRow[],
    },
    receiveLabel: { text: "You receive", status: "confirmed" } as Text,
    steps: [
      {
        title: "Assess",
        text: "We map where your organization stands, technically, operationally and culturally, against where you intend to go.",
        receive: { text: "A current-state map", status: "confirmed" },
        status: "confirmed",
      },
      {
        title: "Align",
        text: "Strategy and business case, built together with the executives who'll be accountable for the outcome.",
        receive: { text: "Scope and business case", status: "confirmed" },
        status: "confirmed",
      },
      {
        title: "Design",
        text: "The architecture and delivery plan, including how it will be secured and run.",
        receive: { text: "Architecture and security plan", status: "confirmed" },
        status: "confirmed",
      },
      {
        title: "Deploy",
        text: "Forward-deployed engineers and strategists work inside your teams, shipping the thing rather than presenting it.",
        receive: { text: "A working system, built with your team", status: "confirmed" },
        status: "confirmed",
      },
      {
        title: "Sustain",
        text: "We instrument, measure, and hand off a system your teams can run and evolve long after the engagement ends.",
        receive: { text: "Runbook, measures and handover", status: "confirmed" },
        status: "confirmed",
      },
    ] as Step[],
  },

  standards: {
    label: { text: "Standards", status: "confirmed" } as Text,
    heading: { text: "The rules we work by.", status: "confirmed" } as Text,
    intro: {
      text: "What you can hold us to, and the frameworks we work to.",
      status: "confirmed",
    } as Text,
    framing: { text: "Each one is something you can check.", status: "confirmed" } as Text,
    // Production renders confirmed rules only. The first three: Mehdi, 3 Oct; the fourth, 17 Oct.
    rules: [
      {
        title: "Access ends at handover",
        text: "Least-privilege accounts for the engagement only, revoked on the last day.",
        status: "confirmed",
      },
      {
        title: "Every finding ships with a fix",
        text: "Each issue carries a severity and a remediation, never a bare list.",
        status: "confirmed",
      },
      {
        title: "Your findings stay yours",
        text: "Nothing is published without your written permission.",
        status: "confirmed",
      },
      {
        title: "Security is part of the design",
        text: "The security plan is written with the architecture, before anything is built.",
        status: "confirmed",
      },
    ] as Rule[],
    // What Cykoai works with and implements controls for; not certificates it
    // holds. Production renders confirmed items only (these four: Mehdi, 3 Oct).
    frameworks: {
      label: { text: "Frameworks and platforms", status: "confirmed" } as Text,
      items: [
        { text: "ISO/IEC 27001", status: "confirmed" },
        { text: "Google Workspace", status: "confirmed" },
        { text: "Google Vertex AI", status: "confirmed" },
        { text: "Docker", status: "confirmed" },
      ] as Text[],
    },
    /** Who does the work. Left off for now (Mehdi, 17 Oct): the block renders only once members are listed. */
    team: {
      label: { text: "Who does the work", status: "confirmed" } as Text,
      members: [] as TeamMember[],
    },
  },

  name: {
    label: { text: "The name", status: "confirmed" } as Text,
    word: { text: "cykoai", status: "confirmed" } as Text,
    pronunciation: { text: "see-ko-ya", status: "confirmed" } as Text,
    parts: [
      {
        syllable: "cy",
        text: "From cybersecurity. The part of the work that comes first.",
        status: "confirmed",
      },
      {
        syllable: "ko",
        text: "The koi, which moves with the current, and the sequoia, which outlasts it.",
        status: "confirmed",
      },
      {
        syllable: "ai",
        text: "Applied intelligence: models put to work on real operations.",
        status: "confirmed",
      },
    ] as NamePart[],
    closing: { text: "Cykoai creates clarity.", status: "confirmed" } as Text,
  },

  contact: {
    label: { text: "Get in touch", status: "confirmed" } as Text,
    heading: { text: "Let’s shape what’s next.", status: "confirmed" } as Text,
    body: {
      text: "Tell us where your organization is headed, and where it feels stuck. We typically respond within one business day.",
      status: "confirmed",
    } as Text,
    email: EMAIL,
    note: { text: "For press and partnerships, same address.", status: "confirmed" } as Text,
    form: {
      name: "Full name",
      company: "Company",
      email: "Work email",
      message: "What are you trying to solve?",
      submit: "Send message",
      sending: "Sending…",
      success: "Thanks — we'll be in touch shortly.",
      error: "Something went wrong.",
      status: "confirmed" as Status,
    },
  },

  footer: {
    wordmark: { text: "Cykoai", status: "confirmed" } as Text,
    cta: TALK_TO_US,
    columns: {
      company: { heading: "Company", links: SECTION_LINKS },
      connect: {
        heading: "Connect",
        links: [{ label: EMAIL, href: `mailto:${EMAIL}`, status: "confirmed" }] as Link[],
      },
    },
    bigWordmark: "CYKOAI",
    legal: {
      rights: "CYKOAI CONSULTING. ALL RIGHTS RESERVED.",
      status: "confirmed" as Status,
    },
  },
};
