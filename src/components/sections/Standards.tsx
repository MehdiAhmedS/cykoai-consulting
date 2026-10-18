import MonoLabel from "@/components/ui/MonoLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";
import DraftMark from "@/components/ui/DraftMark";
import { isShown, site } from "@/content/site";

const { label, heading, intro, framing, frameworks, team } = site.standards;

/** Unconfirmed rules, framework items and people render in dev only (with a DRAFT chip). */
const rules = site.standards.rules.filter((rule) => isShown(rule.status));
const items = frameworks.items.filter((item) => isShown(item.status));
const members = team.members.filter((member) => isShown(member.status));

/**
 * Standards (v3 step 09): what a security buyer can check. Rules Cykoai
 * keeps, as a two-column grid of name and one-line meaning; the frameworks
 * and platforms it works with, as a strip of plain text between two
 * hairlines; then who does the work, once anyone is confirmed. No numbers,
 * no icons, no logos.
 */
export default function Standards() {
  return (
    <section id="standards" data-tone="light" className="relative bg-n50 py-[clamp(88px,14vh,150px)]">
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
          <p className="type-body mt-3 max-w-[60ch] text-n500">
            {framing.text}
            <DraftMark status={framing.status} />
          </p>
        </Reveal>

        {/* Grid rows give the two entries of a row one height, so their rules and names align. */}
        <ul className="mt-[clamp(48px,8vh,88px)] grid grid-cols-1 gap-x-[clamp(40px,6vw,96px)] min-[900px]:grid-cols-2">
          {rules.map((rule, i) => (
            <li key={rule.title}>
              <Reveal delay={i * 0.06} className="h-full">
                <div className="h-full border-t border-n150 pt-6 pb-[clamp(32px,5vh,48px)]">
                  <h3 className="type-h3 text-windsor">
                    {rule.title}
                    <DraftMark status={rule.status} />
                  </h3>
                  <p className="type-body mt-2 max-w-[52ch] text-n700">{rule.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        {items.length > 0 && (
          <Reveal>
            <div className="border-y border-n150 py-6">
              <p className="type-label text-n500">
                {frameworks.label.text}
                <DraftMark status={frameworks.label.status} />
              </p>
              <ul className="mt-3 flex flex-col sm:flex-row">
                {items.map((item) => (
                  <li
                    key={item.text}
                    className="type-data border-t border-n150 py-3 text-windsor first:border-t-0 sm:border-t-0 sm:border-l sm:px-6 sm:py-0 sm:first:border-l-0 sm:first:pl-0"
                  >
                    {item.text}
                    <DraftMark status={item.status} />
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        {members.length > 0 && (
          <div className="mt-[clamp(48px,8vh,88px)]">
            <p className="type-label text-n500">
              {team.label.text}
              <DraftMark status={team.label.status} />
            </p>
            <ul className="mt-4 border-b border-n150">
              {members.map((member, i) => (
                <li key={member.name}>
                  <Reveal delay={i * 0.06}>
                    <div className="grid grid-cols-1 gap-x-10 gap-y-1 border-t border-n150 py-5 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] min-[900px]:items-baseline">
                      <h3 className="type-h3 text-windsor">
                        {member.name}
                        <DraftMark status={member.status} />
                      </h3>
                      <p className="type-small text-n700">{member.role}</p>
                      <p className="type-data text-n500">{member.credentials}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
