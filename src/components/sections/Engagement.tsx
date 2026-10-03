import MonoLabel from "@/components/ui/MonoLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";
import DraftMark from "@/components/ui/DraftMark";
import ProgressRule from "@/components/ui/ProgressRule";
import { SHOW_DRAFTS, isTBC, site } from "@/content/site";

const { label, heading, intro, cover, receiveLabel, steps } = site.engagement;

/** A TBC row renders in dev only (with a DRAFT chip). */
const rows = cover.rows.filter((row) => SHOW_DRAFTS || !isTBC(row.value));

/**
 * Engagement (v3 step 08): a deliverable anatomy. A document cover states
 * the team, handover (and length and effort, once confirmed) as data and
 * stays in view (CSS sticky, no pin) beside the five stages, each ending in
 * what the client receives. A Driftwood rule down the stages' left edge
 * tracks scroll. Below 900px the cover sits on top and nothing sticks. No
 * numbers: the stage names carry the order.
 */
export default function Engagement() {
  return (
    // No overflow-hidden here: it would stop the cover sticking.
    <section id="engagement" data-tone="light" className="relative bg-white py-[clamp(88px,14vh,150px)]">
      <div className="mx-auto max-w-[1320px] px-[clamp(20px,4vw,56px)]">
        <Reveal>
          <MonoLabel tick>
            {label.text}
            <DraftMark status={label.status} />
          </MonoLabel>
        </Reveal>
        <h2 className="type-h2 mt-8 max-w-[24ch] text-windsor">
          <SplitText>{heading.text}</SplitText>
          <DraftMark status={heading.status} />
        </h2>
        <Reveal delay={0.1}>
          <p className="type-lead mt-5 max-w-[60ch] text-n700">
            {intro.text}
            <DraftMark status={intro.status} />
          </p>
        </Reveal>

        <div className="mt-[clamp(48px,8vh,88px)] grid grid-cols-1 gap-[clamp(40px,6vw,96px)] min-[900px]:grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)]">
          <aside className="min-w-0 rounded-sm border border-n150 bg-n50 p-[clamp(24px,3vw,40px)] min-[900px]:sticky min-[900px]:top-24 min-[900px]:self-start">
            <p className="type-label text-n500">
              {cover.title.text}
              <DraftMark status={cover.title.status} />
            </p>
            <dl className="mt-[clamp(28px,5vh,56px)]">
              {rows.map((row) => (
                <div key={row.label} className="border-t border-n150 py-4 last:pb-0">
                  <dt className="type-label text-n500">{row.label}</dt>
                  <dd className="type-data mt-1 text-windsor">
                    {row.value}
                    <DraftMark status={row.status} />
                  </dd>
                </div>
              ))}
            </dl>
          </aside>

          <div className="relative min-w-0 min-[900px]:pl-[clamp(28px,3vw,48px)]">
            <ProgressRule />
            <ol>
              {steps.map((step, i) => (
                <li key={step.title}>
                  <Reveal delay={i * 0.09}>
                    <div className="border-t border-n150 py-[clamp(32px,5vh,56px)]">
                      <h3 className="type-h3 text-windsor">
                        {step.title}
                        <DraftMark status={step.status} />
                      </h3>
                      <p className="type-body mt-3 max-w-[56ch] text-n500">{step.text}</p>
                      <p className="mt-5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                        <span className="type-label text-n500">{receiveLabel.text}</span>
                        <span className="type-body text-windsor">
                          {step.receive.text}
                          <DraftMark status={step.receive.status} />
                        </span>
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
