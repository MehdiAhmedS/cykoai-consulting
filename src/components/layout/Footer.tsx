import LogoMark from "@/components/ui/LogoMark";
import GenImage from "@/components/ui/GenImage";
import DraftMark from "@/components/ui/DraftMark";
import { site } from "@/content/site";

const { wordmark, cta, columns, bigWordmark, legal } = site.footer;
const COLUMNS = [columns.company, columns.connect];

/**
 * Footer — Windsor band, oversized wordmark, one 45° diagonal entering
 * from the corner, mono legal line; AM-5 anchors the corner at 0.94.
 */
export default function Footer() {
  return (
    <footer
      data-tone="dark"
      data-band-fade="#FFFFFF"
      className="relative overflow-hidden border-t border-white/10 bg-windsor pt-16 text-white md:pt-20"
    >
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
              <span className="type-h3">
                {wordmark.text}
              </span>
            </div>
            <div className="mt-8">
              <a
                href={cta.href}
                className="type-small inline-block rounded-xs border border-white/35 px-[18px] py-[9px] font-medium text-white transition-colors duration-250 ease-out-expo hover:bg-white hover:text-windsor"
              >
                {cta.label}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:gap-20">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className="type-label text-n300">
                  {col.heading}
                </h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="type-small text-n300 transition-colors duration-250 ease-out-expo hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
                {col.links.some((l) => l.status === "draft") && (
                  <DraftMark className="ml-0 mt-3" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* oversized wordmark — the band signs its name */}
        <div aria-hidden="true" className="mt-16 select-none md:mt-20">
          <span className="block font-display text-[clamp(3.5rem,11.5vw,10.5rem)] font-bold leading-[0.95] tracking-[-0.02em] text-white/95 [font-stretch:112%]">
            {bigWordmark}
          </span>
        </div>

        <div className="flex flex-col-reverse items-start justify-between gap-4 border-t border-white/10 py-8 type-label text-n300 sm:flex-row sm:items-center">
          <span>&copy; {new Date().getFullYear()} {legal.rights}</span>
          <span>{legal.credit}</span>
        </div>
      </div>
    </footer>
  );
}
