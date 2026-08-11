/**
 * The memo artifact (salvaged from mockup A): a redacted engagement
 * timeline — proof over pitch. Content is explicitly illustrative until
 * a real engagement can be published.
 */
const ITEMS = [
  {
    week: "W01",
    body: (
      <>
        Deployed: <em>two engineers, one strategist</em>, inside the
        client&rsquo;s risk team.
      </>
    ),
  },
  {
    week: "W06",
    body: (
      <>
        Fraud-triage agent <em>in production</em>. Review time down 63%.
      </>
    ),
  },
  {
    week: "W11",
    body: (
      <>
        Security review passed. <em>Zero critical findings.</em>
      </>
    ),
  },
  {
    week: "W14",
    body: (
      <>
        Handoff complete — <em>their team runs it now</em>.
      </>
    ),
  },
];

export default function EngagementNote({ className }: { className?: string }) {
  return (
    <aside
      aria-label="Illustrative engagement note"
      className={`rounded-sm border border-n150 bg-white p-6 pb-5 [&_em]:font-medium [&_em]:not-italic [&_em]:text-windsor ${className ?? ""}`}
    >
      <div className="flex items-center justify-between border-b border-n150 pb-3.5 font-mono text-[10px] tracking-[0.14em] text-n500">
        <b className="font-normal text-windsor">ENGAGEMENT NOTE</b>
        <span>
          <span className="text-driftwood-deep">ILLUSTRATIVE</span> · N–014
        </span>
      </div>
      <ul className="mt-2">
        {ITEMS.map((item) => (
          <li
            key={item.week}
            className="flex gap-3.5 border-b border-n100 py-3 text-[13px] leading-normal text-n700 last:border-b-0"
          >
            <span className="min-w-[38px] pt-0.5 font-mono text-[10.5px] tracking-[0.06em] text-n500">
              {item.week}
            </span>
            <span>{item.body}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 border-t border-n150 pt-3.5 font-mono text-[10px] tracking-[0.12em] text-driftwood-deep">
        OUTCOME — OWNED BY THE CLIENT
      </div>
    </aside>
  );
}
