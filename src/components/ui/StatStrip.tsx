// TODO(mehdi): real numbers — these are the mockup's placeholders.
const STATS = [
  { n: "2 – 4", label: "PEOPLE, DEPLOYED INSIDE" },
  { n: "< 90", label: "DAYS TO PRODUCTION" },
  { n: "100%", label: "OWNED BY YOUR TEAM" },
];

/** Bordered stat row (salvaged from mockup B) — numbers over adjectives. */
export default function StatStrip({ className }: { className?: string }) {
  return (
    <div className={`flex border-t border-n150 ${className ?? ""}`}>
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className={`flex-1 pt-5 ${i > 0 ? "border-l border-n150 pl-4" : "pr-4"}`}
        >
          <div className="type-h3 text-windsor">
            {stat.n}
          </div>
          <div className="type-label mt-1.5 text-n500">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
