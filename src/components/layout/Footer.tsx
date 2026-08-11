import LogoMark from "@/components/ui/LogoMark";
import GenImage from "@/components/ui/GenImage";

const COLUMNS = [
  {
    heading: "Company",
    links: [
      { label: "What we do", href: "#what-we-do" },
      { label: "Services", href: "#services" },
      { label: "Philosophy", href: "#philosophy" },
      { label: "Process", href: "#process" },
    ],
  },
  {
    heading: "Connect",
    links: [{ label: "info@cykoai.com", href: "mailto:info@cykoai.com" }],
  },
];

/**
 * Footer — Windsor band, oversized wordmark, one 45° diagonal entering
 * from the corner, mono legal line; AM-5 anchors the corner at 0.94.
 */
export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-windsor pt-16 text-white md:pt-20">
      {/* the diagonal — one clean 45° line from the bottom-right corner */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[10%] bottom-[12%] h-px w-[70%] origin-bottom-right -rotate-45 bg-white/10"
      />

      {/* AM-5 — the mark made physical, anchoring the corner */}
      <div
        data-speed="0.94"
        className="pointer-events-none absolute -right-16 top-6 w-[240px] opacity-90 will-change-transform max-lg:hidden"
      >
        <GenImage
          src="/assets/gen/am5-monogram-cube.png"
          width={1024}
          height={1024}
          sizes="240px"
        />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-[clamp(20px,4vw,56px)]">
        <div className="flex flex-col justify-between gap-14 lg:flex-row">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <LogoMark className="h-8 w-8" />
              <span className="font-display text-[1.3rem] font-medium tracking-tight">
                Cykoai
              </span>
            </div>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-n300">
              Forward deployed AI and cybersecurity consulting for
              organizations shaping the future instead of reacting to it.
            </p>
            <div className="mt-8">
              <a
                href="#contact"
                className="inline-block rounded-xs border border-white/35 px-[18px] py-[9px] text-[13.5px] font-medium text-white transition-colors duration-250 ease-out-expo hover:bg-white hover:text-windsor"
              >
                Talk to us
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:gap-20">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h4 className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-n500">
                  {col.heading}
                </h4>
                <ul className="mt-5 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[0.9rem] text-n300 transition-colors duration-250 ease-out-expo hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* oversized wordmark — the band signs its name */}
        <div aria-hidden="true" className="mt-16 select-none md:mt-20">
          <span className="block font-display text-[clamp(3.5rem,11.5vw,10.5rem)] font-bold leading-[0.95] tracking-[-0.02em] text-white/95">
            CYKOAI
          </span>
        </div>

        <div className="flex flex-col-reverse items-start justify-between gap-4 border-t border-white/10 py-8 font-mono text-[10.5px] tracking-[0.14em] text-n500 sm:flex-row sm:items-center">
          <span>&copy; {new Date().getFullYear()} CYKOAI CONSULTING. ALL RIGHTS RESERVED.</span>
          <span>DESIGNED AND BUILT IN-HOUSE.</span>
        </div>
      </div>
    </footer>
  );
}
