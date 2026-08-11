import Image from "next/image";
import { cn } from "@/lib/utils";

interface GenImageProps {
  /** Path under public/, e.g. "/assets/gen/am6-topo-diagonal.png". */
  src: string;
  width?: number;
  height?: number;
  /** Fill the parent container instead of intrinsic sizing. */
  fill?: boolean;
  /**
   * Decorative by default (§AM.3): empty alt + aria-hidden. Pass a real
   * alt only if the image ever carries meaning.
   */
  alt?: string;
  /** Apply the .img-grade Windsor multiply + desaturation (§AI). */
  grade?: boolean;
  sizes?: string;
  className?: string;
  imgClassName?: string;
}

/**
 * §AM imagery wrapper: always a sized container (CLS 0), decorative
 * semantics by default, `data-gen-asset` hook so the fallback law
 * ("site must read complete with every asset removed") is testable by
 * toggling one attribute selector.
 */
export default function GenImage({
  src,
  width,
  height,
  fill = false,
  alt = "",
  grade = false,
  sizes,
  className,
  imgClassName,
}: GenImageProps) {
  const decorative = alt === "";
  return (
    <div
      data-gen-asset
      aria-hidden={decorative || undefined}
      className={cn(
        "relative overflow-hidden",
        grade && "img-grade",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        quality={70}
        sizes={sizes}
        className={cn(fill && "object-cover", imgClassName)}
        {...(fill ? { fill: true } : { width, height })}
      />
    </div>
  );
}
