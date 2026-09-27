import MonoLabel from "@/components/ui/MonoLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";
import DraftMark from "@/components/ui/DraftMark";
import BrowserFrame from "@/components/projects/BrowserFrame";
import CaptureScreen from "@/components/projects/CaptureScreen";
import MockupScaler from "@/components/projects/MockupScaler";
import Mockup from "@/components/projects/mockups/Mockup";
import PhoneShell from "@/components/projects/PhoneShell";
import ProjectsStage, { type StageItem } from "@/components/projects/ProjectsStage";
import { SHOW_DRAFTS, isTBC, type Status } from "@/content/site";
import { projects, projectsCopy as copy, type Project } from "@/content/projects";
import captureFiles from "@/content/project-captures.json";

/** Captures that exist on disk (scripts/capture-projects.mjs); only these render an image. */
const captured = new Set(captureFiles.map((c) => c.slug));

/**
 * Part 3's "What renders where", production side: an entry whose client
 * hasn't agreed to be named is left out, and so is a capture (it shows the
 * page's brand) unless its client is "Concept" or confirmed. Dev renders all.
 */
const renders = (p: Project) =>
  SHOW_DRAFTS ||
  (p.clientStatus !== "draft" &&
    (p.screen.kind !== "capture" || p.client === "Concept" || p.clientStatus === "confirmed"));

const visible = projects.filter(renders);

// The stage needs a screen and at least two featured entries; otherwise they're More work rows, first.
let staged = visible.filter((p) => p.featured && p.screen.kind !== "none");
let more = visible.filter((p) => !staged.includes(p));
if (staged.length < 2) {
  more = [...staged, ...more];
  staged = [];
}

const inProgress = visible.filter((p) => p.state === "In progress" || p.state === "Ongoing").length;

const hasCapture = (p: Project) => p.screen.kind === "capture" && captured.has(p.screen.slug);
/** A draft link renders in dev only. */
const linkOf = (p: Project) => (p.link && (SHOW_DRAFTS || p.linkStatus !== "draft") ? p.link : undefined);
/** A TBC value renders in dev only (with a DRAFT chip). */
const known = (value: string | undefined): value is string => value !== undefined && (SHOW_DRAFTS || !isTBC(value));

interface Fact {
  term: string;
  value: string;
  /** DRAFT chip: a TBC value or an unconfirmed client. */
  status: Status;
  state?: boolean;
}

/** Landing pages: Client, Year, Stack. Engagements: Client, Since, Status, Stack. TBC facts are left out in production. */
function factsOf(p: Project): Fact[] {
  const facts: Fact[] = [];
  const add = (term: string, value: string | undefined, draft = false) => {
    if (known(value)) facts.push({ term, value, status: draft || isTBC(value) ? "draft" : "confirmed" });
  };
  add(copy.facts.client, p.client, p.clientStatus === "draft");
  if (p.year !== undefined) add(copy.facts.year, p.year);
  if (p.since !== undefined) {
    add(copy.facts.since, p.since);
    if (p.state) facts.push({ term: copy.facts.state, value: p.state, status: "confirmed", state: true });
  }
  add(copy.facts.stack, p.stack);
  return facts;
}

function State({ state }: { state: string }) {
  return (
    <span className="type-data inline-flex items-center gap-2.5 whitespace-nowrap">
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-driftwood" />
      {state}
    </span>
  );
}

/** The screen at the top of a chapter below 1024px (the stage shows it from 1024px). */
function InlineScreen({ p }: { p: Project }) {
  const { screen } = p;
  return (
    <div aria-hidden className="mb-4 lg:hidden">
      {screen.kind === "capture" && (
        <BrowserFrame label={screen.label} viewport="16/11">
          <CaptureScreen name={p.name} slug={screen.slug} show={hasCapture(p)} track="inline" />
        </BrowserFrame>
      )}
      {screen.kind === "mockup" && (
        <BrowserFrame label={screen.label} tag={copy.labels.illustration}>
          <MockupScaler>
            <Mockup kind={screen.mockup} copy={copy.mockups} />
          </MockupScaler>
        </BrowserFrame>
      )}
      {screen.kind === "phone-shell" && <PhoneShell tag={copy.labels.illustration} variant="inline" />}
    </div>
  );
}

function Chapter({ p, index }: { p: Project; index: number }) {
  const link = linkOf(p);
  return (
    <article
      id={`project-${p.id}`}
      className={
        "flex flex-col gap-4 max-lg:not-first:mt-[clamp(40px,8vw,64px)] max-lg:not-first:border-t max-lg:not-first:border-white/12 max-lg:not-first:pt-[clamp(40px,8vw,64px)] lg:justify-center " +
        (p.screen.kind === "capture" ? "lg:min-h-[120vh]" : "lg:min-h-[75vh]")
      }
    >
      <InlineScreen p={p} />
      <Reveal delay={0.06}>
        <p className="type-label text-n300">
          {p.practice} · {p.type}
        </p>
      </Reveal>
      <h3 data-chapter-index={index} className="type-h3-lg text-white">
        <SplitText>{p.name}</SplitText>
        <DraftMark status={p.status} />
      </h3>
      <Reveal delay={0.12}>
        <p className="type-body max-w-[44ch] text-n300">{p.line}</p>
      </Reveal>
      <Reveal delay={0.18}>
        <dl className="grid grid-cols-2 gap-x-6">
          {factsOf(p).map((fact, i) => (
            <div key={fact.term} className="border-t border-white/12 py-3">
              <dt className="type-label text-n300">
                {fact.term}
                {index === 0 && i === 0 && <DraftMark status={copy.facts.status} />}
              </dt>
              <dd className="type-data mt-1 text-white">
                {fact.state ? <State state={fact.value} /> : fact.value}
                <DraftMark status={fact.status} />
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
      {link && (
        <p className="type-small">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline decoration-driftwood underline-offset-4 transition-colors duration-200 hover:text-n300"
          >
            {copy.labels.visit}
            <span className="sr-only">
              : {p.name} {copy.labels.newTab}
            </span>
            <span aria-hidden> ↗</span>
          </a>
          <DraftMark status={p.linkStatus} />
        </p>
      )}
    </article>
  );
}

function MoreRow({ p }: { p: Project }) {
  const link = linkOf(p);
  const when = p.year !== undefined ? { term: copy.facts.year, value: p.year } : p.since !== undefined ? { term: copy.facts.since, value: p.since } : null;
  const shownWhen = when && known(when.value) ? when : null;
  const client = known(p.client) ? p.client : null;
  return (
    <article className="border-t border-white/12 py-6 transition-colors duration-200 has-[a:hover]:border-driftwood has-[a:focus-visible]:border-driftwood md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] md:gap-x-8">
      <div>
        <h4 className="type-h3 text-white">
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer">
              {p.name}
              <span className="sr-only"> {copy.labels.newTab}</span>
              <span aria-hidden> ↗</span>
            </a>
          ) : (
            p.name
          )}
          <DraftMark status={p.status} />
          {link && <DraftMark status={p.linkStatus} />}
        </h4>
        <p className="type-small mt-1.5 text-n300">{p.line}</p>
        <p className="type-label mt-3 text-n300 md:hidden">
          {p.practice} · {p.type}
          {shownWhen && ` · ${shownWhen.value}`}
          {shownWhen && isTBC(shownWhen.value) && <DraftMark />}
        </p>
      </div>
      <div className="hidden md:block">
        <p className="type-label text-n300">
          {p.practice} · {p.type}
        </p>
        {client && (
          <dl className="mt-1.5">
            <dt className="sr-only">{copy.facts.client}</dt>
            <dd className="type-small text-n300">
              {client}
              <DraftMark status={p.clientStatus === "draft" || isTBC(client) ? "draft" : "confirmed"} />
            </dd>
          </dl>
        )}
      </div>
      {/* A shared minimum width keeps the auto column, and so the middle one, aligned from row to row. */}
      <dl className="hidden text-right md:block md:min-w-[9.5rem]">
        {shownWhen && (
          <>
            <dt className="sr-only">{shownWhen.term}</dt>
            <dd className="type-data text-n300">
              {shownWhen.value}
              {isTBC(shownWhen.value) && <DraftMark />}
            </dd>
          </>
        )}
        {p.state && (
          <>
            <dt className="sr-only">{copy.facts.state}</dt>
            <dd className="mt-1.5 text-n300">
              <State state={p.state} />
            </dd>
          </>
        )}
      </dl>
    </article>
  );
}

/**
 * Projects (v3 step 07): the stage, then "More work". Content comes from
 * src/content/projects.ts, which only server components import; this
 * component filters it (part 3's table) and hands the client stage only
 * what renders.
 */
export default function Projects() {
  const stageItems: StageItem[] = staged.map((p) => ({
    id: p.id,
    name: p.name,
    short: p.short,
    screen: p.screen as StageItem["screen"],
    hasCapture: hasCapture(p),
  }));

  return (
    <section id="projects" data-tone="dark" className="relative bg-windsor py-[clamp(88px,14vh,150px)] text-white">
      <div className="mx-auto max-w-[1320px] px-[clamp(20px,4vw,56px)]">
        <Reveal>
          <MonoLabel tick tone="inverse">
            {copy.label.text}
            <DraftMark status={copy.label.status} />
          </MonoLabel>
        </Reveal>
        <h2 id="projects-heading" className="type-h2 mt-8 max-w-[22ch] text-white">
          <SplitText>{copy.heading.text}</SplitText>
          <DraftMark status={copy.heading.status} />
        </h2>
        <Reveal delay={0.1}>
          <p className="type-lead mt-6 max-w-[60ch] text-n300">
            {copy.intro.text}
            <DraftMark status={copy.intro.status} />
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="type-data mt-5 text-n300">
            <span className="text-white">{visible.length}</span>{" "}
            {visible.length === 1 ? copy.summary.project : copy.summary.projects}
            {inProgress > 0 && (
              <>
                {" · "}
                <span className="text-white">{inProgress}</span> {copy.summary.inProgress}
              </>
            )}
            <DraftMark status={copy.summary.status} />
          </p>
        </Reveal>

        {staged.length > 0 && (
          <div className="mt-[clamp(48px,8vw,96px)]">
            <ProjectsStage items={stageItems} illustration={copy.labels.illustration} mockups={copy.mockups}>
              {staged.map((p, i) => (
                <Chapter key={p.id} p={p} index={i} />
              ))}
            </ProjectsStage>
          </div>
        )}

        {more.length > 0 && (
          <div className="mt-[clamp(72px,12vw,128px)]">
            <h3 id="projects-more" className="type-label text-n300">
              {copy.moreWork.text}
              <DraftMark status={copy.moreWork.status} />
            </h3>
            <div className="mt-6 border-b border-white/12">
              {more.map((p, i) => (
                <Reveal key={p.id} focusable delay={i * 0.06}>
                  <MoreRow p={p} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
