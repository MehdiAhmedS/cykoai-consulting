import MonoLabel from "@/components/ui/MonoLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";
import DraftMark from "@/components/ui/DraftMark";
import { site, isTBC, SHOW_DRAFTS, TBC, type Project } from "@/content/site";

const { label, heading, intro, columns, items } = site.projects;

/** TBC reads as "TBC" in dev and as a dash in production. */
const shown = (value: string) => (isTBC(value) ? (SHOW_DRAFTS ? TBC : "—") : value);

/** A column whose every value is TBC is dropped in production. */
const showSince = SHOW_DRAFTS || items.some((p) => !isTBC(p.since));

function State({ project }: { project: Project }) {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-driftwood" />
      {project.state}
    </span>
  );
}

const HEAD = "pb-4 pr-6 text-left align-bottom font-mono text-[11px] font-normal uppercase tracking-[0.1em] text-n300 last:pr-0";
const CELL = "py-5 pr-6 align-top text-[0.92rem] leading-[1.55] text-n300 last:pr-0";
const TERM = "font-mono text-[11px] uppercase tracking-[0.1em] text-n300";

/**
 * Projects (v3 step 01): a plain register of current engagements on the
 * Windsor band. A semantic table from 768px; stacked label/value blocks
 * below. Confidential clients read "Withheld". No images, no numbering.
 */
export default function Projects() {
  return (
    <section
      id="projects"
      data-tone="dark"
      className="relative bg-windsor py-[clamp(88px,14vh,150px)] text-white"
    >
      <div className="mx-auto max-w-[1320px] px-[clamp(20px,4vw,56px)]">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Reveal>
              <MonoLabel tick tone="inverse">
                {label.text}
                <DraftMark status={label.status} />
              </MonoLabel>
            </Reveal>
            <h2
              id="projects-heading"
              className="mt-8 max-w-2xl font-display text-[clamp(1.9rem,3.8vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-white"
            >
              <SplitText>{heading.text}</SplitText>
              <DraftMark status={heading.status} />
            </h2>
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-sm text-[0.95rem] leading-[1.65] text-n300">
              {intro.text}
              <DraftMark status={intro.status} />
            </p>
          </Reveal>
        </div>

        {/* ≥768px: the register as a table */}
        <Reveal delay={0.1}>
          <table aria-labelledby="projects-heading" className="mt-16 hidden w-full border-collapse md:table">
            <thead>
              <tr className="border-b border-white/14">
                <th scope="col" className={HEAD}>
                  {columns.title}
                  <DraftMark status={columns.status} />
                </th>
                <th scope="col" className={HEAD}>{columns.client}</th>
                <th scope="col" className={HEAD}>{columns.practice}</th>
                <th scope="col" className={HEAD}>{columns.stack}</th>
                {showSince && <th scope="col" className={HEAD}>{columns.since}</th>}
                <th scope="col" className={HEAD}>{columns.state}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((project) => (
                <tr key={project.title} className="border-b border-white/14">
                  <th scope="row" className={`${CELL} w-[30%] text-left font-normal text-white`}>
                    {project.title}
                    <DraftMark status={project.status} />
                  </th>
                  <td className={CELL}>{project.client}</td>
                  <td className={CELL}>{project.practice}</td>
                  <td className={CELL}>{shown(project.stack)}</td>
                  {showSince && <td className={`${CELL} whitespace-nowrap`}>{shown(project.since)}</td>}
                  <td className={CELL}>
                    <State project={project} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        {/* <768px: one label/value block per engagement */}
        <ul className="mt-12 border-b border-white/14 md:hidden">
          {items.map((project, i) => (
            <li key={project.title} className="border-t border-white/14 py-6">
              <h3 className="text-[1.05rem] font-medium leading-[1.4] text-white">
                {project.title}
                <DraftMark status={project.status} />
              </h3>
              <dl className="mt-4 grid grid-cols-[112px_1fr] gap-x-4 gap-y-2.5 text-[0.92rem] leading-[1.5] text-n300">
                <dt className={`${TERM} pt-[3px]`}>
                  {columns.client}
                  {i === 0 && <DraftMark status={columns.status} className="ml-1" />}
                </dt>
                <dd>{project.client}</dd>
                <dt className={`${TERM} pt-[3px]`}>{columns.practice}</dt>
                <dd>{project.practice}</dd>
                <dt className={`${TERM} pt-[3px]`}>{columns.stack}</dt>
                <dd>{shown(project.stack)}</dd>
                {showSince && (
                  <>
                    <dt className={`${TERM} pt-[3px]`}>{columns.since}</dt>
                    <dd>{shown(project.since)}</dd>
                  </>
                )}
                <dt className={`${TERM} pt-[3px]`}>{columns.state}</dt>
                <dd>
                  <State project={project} />
                </dd>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
