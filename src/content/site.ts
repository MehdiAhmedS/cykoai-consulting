/**
 * Every visible string on the page (v3 step 01).
 *
 * status: "confirmed" is v1 copy Mehdi has approved (or a line the step
 * prompt marks confirmed); "draft" is new wording awaiting his sign-off.
 * Unknown values are the string "TBC". Nothing here is invented: drafts
 * are transcribed from docs/v3/prompts/01-structure.md.
 */

export type Status = "confirmed" | "draft";

export const TBC = "TBC";
export const isTBC = (value: string) => value === TBC;

/** Drafts and TBC values are visible in dev only. */
export const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

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

export interface Project {
  title: string;
  client: string;
  practice: string;
  stack: string;
  since: string;
  state: "In progress" | "Ongoing";
  /** Copy status of the row (its title and wording). */
  status: Status;
  /** Set when the client line has its own status. */
  clientStatus?: Status;
}

export interface OwnProject {
  name: string;
  line: string;
  practice: string;
  stack: string;
  year: string;
  link: string;
  status: Status;
}

export interface Step {
  title: string;
  text: string;
  status: Status;
}

export interface Rule {
  title: string;
  text: string;
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
  { label: "Offers", href: "#offers", status: "draft" },
  { label: "Projects", href: "#projects", status: "draft" },
  { label: "Engagement", href: "#engagement", status: "draft" },
  { label: "Standards", href: "#standards", status: "draft" },
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
    eyebrow: { text: "Security · AI automation · Engineering", status: "draft" } as Text,
    headline: {
      text: "The future moves faster than",
      dim: "your organization.",
      status: "confirmed" as Status,
    },
    lede: {
      text: "Cybersecurity, AI automation, mobile apps, API integrations and company websites, from one team.",
      status: "draft",
    } as Text,
    primaryCta: TALK_TO_US,
    secondaryCta: { label: "See what we do", href: "#offers", status: "draft" } as Link,
  },

  // Clients are real (Mehdi, 26 Sep). Only confirmed entries are drawn.
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
      { name: "United Kingdom", lat: 51.51, lng: -0.13, role: "decorative", status: "confirmed" }, // London
      { name: "Singapore", lat: 1.35, lng: 103.82, role: "decorative", status: "confirmed" },
    ] as GlobeLocation[],
    // Clients in Africa are confirmed, but not the country: it joins `locations` once Mehdi names it.
    pending: {
      text: "Clients in Africa: the country is TBC, so it is not on the globe yet.",
      status: "draft",
    } as Text,
  },

  offers: {
    label: { text: "Offers", status: "draft" } as Text,
    heading: { text: "What you can hire us for.", status: "draft" } as Text,
    intro: { text: "Six ways to work with us. Pick one, or combine them.", status: "draft" } as Text,
    fields: { for: "For", youGet: "You get", status: "draft" as Status },
    items: [
      {
        id: "security-reviews",
        name: "Security reviews",
        practice: "Security",
        for: "Apps about to launch, including AI-built ones",
        youGet: "Architecture and design review and penetration testing, with findings by severity and fixes",
        status: "draft",
      },
      {
        id: "workspace-hardening",
        name: "Workspace hardening",
        practice: "Security",
        for: "Organisations on Google Workspace",
        youGet: "A hardened configuration, a review of contractor and freelancer access, and controls mapped to ISO/IEC 27001",
        status: "draft",
      },
      {
        id: "ai-automation",
        name: "AI automation",
        practice: "AI",
        for: "Teams with repetitive, manual work",
        youGet: "AI workflows that remove manual steps, including private AI on Google Vertex",
        status: "draft",
      },
      {
        id: "mobile-iot",
        name: "Mobile apps and device integrations",
        practice: "Engineering",
        for: "Products that talk to hardware",
        youGet: "Mobile applications with API integrations to devices and IoT hardware",
        status: "draft",
      },
      {
        id: "apis-bots",
        name: "APIs and bot deployments",
        practice: "Engineering",
        for: "Teams connecting systems",
        youGet: "API integrations and Docker-based bot deployments",
        status: "draft",
      },
      {
        id: "company-profiles",
        name: "Company profiles",
        practice: "Design",
        for: "Companies that need a presence",
        youGet: "Landing pages and brand design, from the ground up",
        status: "draft",
      },
    ] as Offer[],
  },

  projects: {
    label: { text: "Projects", status: "draft" } as Text,
    heading: { text: "What we're working on now.", status: "draft" } as Text,
    intro: {
      text: "Current engagements. Some clients are named; confidential ones are withheld.",
      status: "draft",
    } as Text,
    columns: {
      title: "Engagement",
      client: "Client",
      practice: "Practice",
      stack: "Standard / stack",
      since: "Since",
      state: "Status",
      status: "draft" as Status,
    },
    items: [
      {
        title: "Google Workspace hardening and access review",
        client: "HDT Systems, Germany",
        practice: "Security",
        stack: "Google Workspace · ISO/IEC 27001 controls",
        since: TBC,
        state: "In progress",
        status: "draft",
        clientStatus: "confirmed",
      },
      {
        title: "Launch-readiness audits for AI-built apps",
        client: "Withheld",
        practice: "Security",
        stack: "Architecture and design review",
        since: TBC,
        state: "Ongoing",
        status: "draft",
      },
      {
        title: "Mobile app with device integrations",
        client: "Withheld",
        practice: "Engineering",
        stack: "Mobile · device APIs · IoT",
        since: TBC,
        state: "Ongoing",
        status: "draft",
      },
      {
        title: "Secure AI environment",
        client: "Withheld",
        practice: "AI",
        stack: "Google Vertex AI",
        since: TBC,
        state: "In progress",
        status: "draft",
      },
      {
        title: "AI workflow automation",
        client: "Withheld",
        practice: "AI",
        stack: TBC,
        since: TBC,
        state: "In progress",
        status: "draft",
      },
      {
        title: "Penetration testing and web builds",
        client: "Withheld",
        practice: "Security · Design",
        stack: TBC,
        since: TBC,
        state: "Ongoing",
        status: "draft",
      },
    ] as Project[],
    /** Cykoai's own projects; Mehdi supplies them. Renders nothing while empty. */
    ownProjects: [] as OwnProject[],
  },

  engagement: {
    label: { text: "Engagement", status: "draft" } as Text,
    heading: { text: "How an engagement runs.", status: "draft" } as Text,
    intro: {
      text: "What happens between your first message and the handover.",
      status: "draft",
    } as Text,
    steps: [
      {
        title: "Assess",
        text: "We map where your organization stands, technically, operationally and culturally, against where you intend to go.",
        status: "confirmed",
      },
      {
        title: "Align",
        text: "Strategy and business case, built together with the executives who'll be accountable for the outcome.",
        status: "confirmed",
      },
      {
        title: "Design",
        text: "The architecture and delivery plan, including how it will be secured and run.",
        status: "draft",
      },
      {
        title: "Deploy",
        text: "Forward-deployed engineers and strategists work inside your teams, shipping the thing rather than presenting it.",
        status: "confirmed",
      },
      {
        title: "Sustain",
        text: "We instrument, measure, and hand off a system your teams can run and evolve long after the engagement ends.",
        status: "confirmed",
      },
    ] as Step[],
  },

  standards: {
    label: { text: "Standards", status: "draft" } as Text,
    heading: { text: "The rules we work by.", status: "draft" } as Text,
    intro: {
      text: "What you can hold us to, and the frameworks we work to.",
      status: "draft",
    } as Text,
    rules: [
      {
        title: "Access ends at handover",
        text: "Least-privilege accounts for the engagement only, revoked on the last day.",
        status: "draft",
      },
      {
        title: "Every finding ships with a fix",
        text: "Each issue carries a severity and a remediation, never a bare list.",
        status: "draft",
      },
      {
        title: "Your findings stay yours",
        text: "Nothing is published without your written permission.",
        status: "draft",
      },
      {
        title: "Every deliverable ships complete",
        text: "The same structure every time, whatever the size of the engagement.",
        status: "draft",
      },
    ] as Rule[],
    frameworks: {
      items: ["ISO/IEC 27001", "Google Workspace", "Google Vertex AI", "Docker"],
      status: "draft" as Status,
    },
    /** Team credentials; none confirmed yet, so the list stays empty and hidden. */
    credentials: [] as Text[],
  },

  name: {
    label: { text: "The name", status: "draft" } as Text,
    word: { text: "cykoai", status: "confirmed" } as Text,
    pronunciation: { text: "see-ko-ya", status: "confirmed" } as Text,
    parts: [
      {
        syllable: "cy",
        text: "From cybersecurity. The part of the work that comes first.",
        status: "draft",
      },
      {
        syllable: "ko",
        text: "The koi, which moves with the current, and the sequoia, which outlasts it.",
        status: "draft",
      },
      {
        syllable: "ai",
        text: "Applied intelligence: models put to work on real operations.",
        status: "draft",
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
      credit: "DESIGNED AND BUILT IN-HOUSE.",
      status: "confirmed" as Status,
    },
  },
};
