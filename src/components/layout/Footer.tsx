import LogoMark from "@/components/ui/LogoMark";

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

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-windsor py-16 text-white md:py-20">
      <div className="mx-auto max-w-[1320px] px-[clamp(20px,4vw,56px)]">
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
                Start a conversation
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

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-4 border-t border-white/10 pt-8 font-mono text-[10.5px] tracking-[0.14em] text-n500 sm:flex-row sm:items-center">
          <span>&copy; {new Date().getFullYear()} CYKOAI CONSULTING. ALL RIGHTS RESERVED.</span>
          <span>DESIGNED AND BUILT IN-HOUSE.</span>
        </div>
      </div>
    </footer>
  );
}
