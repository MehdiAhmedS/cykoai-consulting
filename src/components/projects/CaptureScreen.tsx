import Image from "next/image";

interface CaptureScreenProps {
  /** The project's name: the fallback under the image. */
  name: string;
  slug: string;
  /** Render the image. False when its file isn't in project-captures.json, or before the stage mounts it. */
  show: boolean;
  /** "stage" images mount when the stage says so; "inline" ones use native lazy loading. */
  track: "stage" | "inline";
}

/**
 * A live capture of one of Mehdi's pages (public/assets/projects/<slug>.webp,
 * 1440x2700) inside a browser frame's viewport. The track always renders, so
 * the stage's scroll tween exists before the image mounts; the fallback (the
 * name on windsor-2) stays under it, still. data-gen-asset sits on the <img>
 * itself, so verify-shots --assets-off hides it and shows the fallback. No
 * GenImage and no .img-grade veil: the veil would recolour Mehdi's pages.
 */
export default function CaptureScreen({ name, slug, show, track }: CaptureScreenProps) {
  return (
    <>
      <div className="absolute inset-0 grid place-items-center">
        <span className="type-label text-n300">{name}</span>
      </div>
      <div data-capture-track={track} className="absolute inset-x-0 top-0 aspect-[1440/2700] w-full">
        {show && (
          <Image
            src={`/assets/projects/${slug}.webp`}
            width={1440}
            height={2700}
            sizes="(min-width: 1024px) 50vw, 100vw"
            quality={70}
            alt=""
            loading={track === "stage" ? "eager" : "lazy"}
            data-gen-asset=""
            className="block"
            style={{ width: "100%", height: "auto" }}
          />
        )}
      </div>
    </>
  );
}
