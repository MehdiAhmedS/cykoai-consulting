import MagneticButton from "@/components/ui/MagneticButton";
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
    links: [
      { label: "info@cykoai.com", href: "mailto:info@cykoai.com" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border py-16 md:py-20">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-col justify-between gap-14 lg:flex-row">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <LogoMark className="h-8 w-8" />
              <span className="font-display text-[1.3rem] font-medium tracking-tight text-ink">
                Cykoai
              </span>
            </div>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-muted">
              Forward deployed AI and cybersecurity consulting for
              organizations shaping the future instead of reacting to it.
            </p>
            <div className="mt-8">
              <MagneticButton href="#contact" variant="outline" size="sm">
                Start a conversation
              </MagneticButton>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:gap-20">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h4 className="text-[0.75rem] font-medium uppercase tracking-[0.2em] text-ink-faint">
                  {col.heading}
                </h4>
                <ul className="mt-5 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        data-cursor="link"
                        className="text-[0.9rem] text-ink-muted transition-colors hover:text-ink"
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

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-4 border-t border-border pt-8 text-[0.8rem] text-ink-faint sm:flex-row sm:items-center">
          <span>&copy; {new Date().getFullYear()} Cykoai Consulting. All rights reserved.</span>
          <span>Designed and built in-house.</span>
        </div>
      </div>
    </footer>
  );
}
