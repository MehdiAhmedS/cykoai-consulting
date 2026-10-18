import "server-only";
import { type Status, type Text } from "./site";

/**
 * Projects (v3 step 07): the stage, then "More work".
 *
 * Kept out of site.ts, which ships to the browser through client components:
 * import this file only from server components. The section's server component
 * filters the entries (docs/v3/prompts/07-projects.md, "What renders where") and
 * hands the client stage only what renders, so hidden names and links never
 * reach the page's JavaScript.
 *
 * Nothing here is invented: entries are transcribed from the step 07 prompt.
 * Unknown values are TBC; unconfirmed clients and links are "draft".
 * Mehdi signed off every entry, client and link on 17 Oct (the sign-off sheet).
 */

export type ProjectScreen =
  | { kind: "capture"; slug: string; label: string }
  | { kind: "mockup"; mockup: "access-review" | "launch-readiness" | "workflow"; label: string }
  | { kind: "phone-shell" }
  | { kind: "none" }; // More work only; an entry needs a screen before it can be featured

export interface Project {
  id: string; // the chapter's anchor is `project-${id}`
  name: string;
  short: string; // for the index strip, 18 characters at most
  line: string;
  practice: string; // one of the offers' practices
  type: string;
  client: string; // a name, "Withheld", "Concept", or TBC
  clientStatus?: Status; // "draft" until the client agrees to be named
  year?: string; // landing pages
  since?: string; // engagements
  state?: "In progress" | "Ongoing";
  stack?: string; // left out when unknown
  link?: string;
  linkStatus?: Status;
  screen: ProjectScreen;
  featured: boolean; // on the stage; otherwise in More work
  status: Status;
}

export const projectsCopy = {
  label: { text: "Projects", status: "confirmed" } as Text,
  heading: { text: "What we've built, and what we're building.", status: "confirmed" } as Text,
  intro: {
    text: "Sites we've designed and built, and the engagements under way now. Confidential clients aren't named, and their work is shown as illustrations.",
    status: "confirmed",
  } as Text,
  moreWork: { text: "More work", status: "confirmed" } as Text,
  labels: {
    illustration: "Illustration",
    visit: "Visit the live page",
    newTab: "(opens in a new tab)",
    status: "confirmed" as Status,
  },
  summary: { project: "project", projects: "projects", inProgress: "in progress", status: "confirmed" as Status },
  facts: { client: "Client", year: "Year", since: "Since", state: "Status", stack: "Stack", status: "confirmed" as Status },
  /** Strings inside the illustrations. They show the kind of work only: no names, counts, dates, states or results. */
  mockups: {
    accessReview: {
      rail: ["Accounts", "Groups", "Sharing", "Devices", "Controls"],
      columns: ["Account", "Type", "Access", "2-step", "Decision"],
      legend: ["Keep", "Reduce", "Remove"],
      controlsTitle: "Controls",
      controls: ["Organizational", "People", "Physical", "Technological"],
    },
    launchReadiness: {
      title: "Launch-readiness review",
      severity: ["Critical", "High", "Medium", "Low"],
      checklist: [
        "Secrets in the client bundle",
        "Row-level security",
        "Admin routes",
        "Sign-in rate limits",
        "Error pages",
        "Dependencies",
      ],
    },
    workflow: {
      steps: ["Request arrives", "AI reads and extracts", "Checked against rules", "A person approves", "Records updated"],
    },
    status: "confirmed" as Status,
  },
};

export type ProjectsCopy = typeof projectsCopy;
export type MockupCopy = ProjectsCopy["mockups"];

/** Checked on each live page on 27 September. */
const LANDING_STACK = "Next.js · Tailwind CSS · Vercel";

/** Stage entries first (featured), then More work, in the prompt's order. */
export const projects: Project[] = [
  {
    id: "bukhait-sefrar",
    name: "Bukhait Sefrar",
    short: "Bukhait Sefrar",
    line: "A right-to-left Arabic site for a law firm and legal consultancy in Muscat.",
    practice: "Design",
    type: "Landing page, Arabic",
    client: "Bukhait Sefrar, Muscat",
    clientStatus: "confirmed",
    year: "2025",
    stack: LANDING_STACK,
    link: "https://v0-bukhait-sefrar-landing-page.vercel.app/",
    linkStatus: "confirmed",
    screen: { kind: "capture", slug: "bukhait-sefrar", label: "Bukhait Sefrar" },
    featured: true,
    status: "confirmed",
  },
  {
    id: "hdt-systems",
    name: "HDT Systems",
    short: "HDT Systems",
    line: "Google Workspace hardening, a review of freelancers' access, and controls working toward ISO/IEC 27001.",
    practice: "Security",
    type: "Workspace hardening",
    client: "HDT Systems, Germany",
    clientStatus: "confirmed",
    since: "May 2026",
    state: "In progress",
    stack: "Google Workspace · ISO/IEC 27001 controls",
    screen: { kind: "mockup", mockup: "access-review", label: "Access review" },
    featured: true,
    status: "confirmed",
  },
  {
    id: "rabia-al-basri",
    name: "Rabia Al Basri",
    short: "Rabia Al Basri",
    line: "An interactive autobiography of the eighth-century mystic.",
    practice: "Design",
    type: "Interactive story",
    client: "Withheld",
    clientStatus: "confirmed", // a client's page, shown and linked without naming them (Mehdi, 17 Oct)
    year: "2025",
    stack: LANDING_STACK,
    link: "https://v0-rabia-al-basri-website.vercel.app/",
    linkStatus: "confirmed",
    screen: { kind: "capture", slug: "rabia-al-basri", label: "Rabia Al Basri" },
    featured: true,
    status: "confirmed",
  },
  {
    id: "launch-audits",
    name: "Launch-readiness audits",
    short: "Launch audits",
    line: "Architecture and design reviews of AI-built apps, so they're ready to launch.",
    practice: "Security",
    type: "Security review",
    client: "Withheld",
    since: "June 2026",
    state: "Ongoing",
    stack: "Architecture and design review",
    screen: { kind: "mockup", mockup: "launch-readiness", label: "Launch readiness" },
    featured: true,
    status: "confirmed",
  },
  {
    id: "mono",
    name: "MONO",
    short: "MONO",
    line: "A landing page for sustainable modular homes.",
    practice: "Design",
    type: "Landing page",
    client: "Withheld",
    clientStatus: "confirmed", // a client's page, shown and linked without naming them (Mehdi, 17 Oct)
    year: "2026",
    stack: LANDING_STACK,
    link: "https://v0-mono-housing-landing.vercel.app/",
    linkStatus: "confirmed",
    screen: { kind: "capture", slug: "mono", label: "MONO" },
    featured: true,
    status: "confirmed",
  },
  {
    id: "device-app",
    name: "Mobile app for connected devices",
    short: "Device app",
    line: "A mobile app that works with IoT hardware through device APIs.",
    practice: "Engineering",
    type: "Mobile app, IoT",
    client: "Withheld",
    since: "July 2026",
    state: "Ongoing",
    stack: "Mobile · device APIs · IoT",
    screen: { kind: "phone-shell" },
    featured: true,
    status: "confirmed",
  },
  {
    id: "ai-workflows",
    name: "AI workflow automation",
    short: "AI automation",
    line: "AI workflows that take manual steps out of a team's daily work.",
    practice: "AI",
    type: "AI automation",
    client: "Withheld",
    since: "July 2026",
    state: "In progress",
    stack: "Python · TensorFlow · Hugging Face",
    screen: { kind: "mockup", mockup: "workflow", label: "Workflow" },
    featured: true,
    status: "confirmed",
  },
  {
    id: "asaan-nikah",
    name: "Asaan Nikah",
    short: "Asaan Nikah",
    line: "A landing page and an application system for a free matrimony service that runs on WhatsApp.",
    practice: "Engineering",
    type: "Web app and landing page",
    client: "Asaan Nikah",
    clientStatus: "confirmed",
    year: "2025",
    stack: "Laravel · MySQL · Next.js",
    link: "https://v0-asaan-nikah-landing-page.vercel.app/",
    linkStatus: "confirmed",
    screen: { kind: "capture", slug: "asaan-nikah", label: "Asaan Nikah" },
    featured: false,
    status: "confirmed",
  },
  {
    id: "private-ai",
    name: "Secure AI environment",
    short: "Secure AI environment",
    line: "A private AI setup on Google Vertex AI.",
    practice: "AI",
    type: "AI platform",
    client: "Withheld",
    since: "July 2026",
    state: "In progress",
    stack: "Google Vertex AI",
    screen: { kind: "none" },
    featured: false,
    status: "confirmed",
  },
  {
    id: "pentests",
    name: "Penetration testing",
    short: "Penetration testing",
    line: "Security analysis and penetration testing.",
    practice: "Security",
    type: "Penetration test",
    client: "Withheld",
    since: "July 2026",
    state: "Ongoing",
    screen: { kind: "none" },
    featured: false,
    status: "confirmed",
  },
  {
    id: "optimus",
    name: "Optimus",
    short: "Optimus",
    line: "A landing page for an AI platform.",
    practice: "Design",
    type: "Landing page",
    client: "Withheld",
    clientStatus: "confirmed", // a client's page, shown and linked without naming them (Mehdi, 17 Oct)
    year: "2026",
    stack: LANDING_STACK,
    link: "https://v0-optimus-the-ai-landing.vercel.app/",
    linkStatus: "confirmed",
    screen: { kind: "capture", slug: "optimus", label: "Optimus" },
    featured: false,
    status: "confirmed",
  },
  {
    id: "gigi-energy",
    name: "GiGi Energy",
    short: "GiGi Energy",
    line: "A landing page for an energy drink.",
    practice: "Design",
    type: "Landing page",
    client: "Withheld",
    clientStatus: "confirmed", // a client's page, shown and linked without naming them (Mehdi, 17 Oct)
    year: "2026",
    stack: LANDING_STACK,
    link: "https://v0-energy-drink-landing-gigi.vercel.app/",
    linkStatus: "confirmed",
    screen: { kind: "capture", slug: "gigi-energy", label: "GiGi Energy" },
    featured: false,
    status: "confirmed",
  },
  {
    id: "voss-architects",
    name: "Voss Architects",
    short: "Voss Architects",
    line: "A landing page for an architecture studio.",
    practice: "Design",
    type: "Landing page",
    client: "Withheld",
    clientStatus: "confirmed", // a client's page, shown and linked without naming them (Mehdi, 17 Oct)
    year: "2026",
    stack: LANDING_STACK,
    link: "https://v0-minimal-architecture-landing.vercel.app/",
    linkStatus: "confirmed",
    screen: { kind: "capture", slug: "voss-architects", label: "Voss Architects" },
    featured: false,
    status: "confirmed",
  },
  {
    id: "hously",
    name: "Hously",
    short: "Hously",
    line: "A landing page for an architecture and interiors studio.",
    practice: "Design",
    type: "Landing page",
    client: "Withheld",
    clientStatus: "confirmed", // a client's page, shown and linked without naming them (Mehdi, 17 Oct)
    year: "2026",
    stack: LANDING_STACK,
    link: "https://v0-hously-modern-architecture-landing.vercel.app/",
    linkStatus: "confirmed",
    screen: { kind: "capture", slug: "hously", label: "Hously" },
    featured: false,
    status: "confirmed",
  },
];
