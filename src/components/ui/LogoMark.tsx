import Image from "next/image";
import { cn } from "@/lib/utils";

/** The real Cykoai mark — the actual brand asset, not a recreation. */
export default function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/cykoai-monogram.png"
      alt="Cykoai"
      width={80}
      height={80}
      className={cn("h-8 w-8 shrink-0 rounded-md object-cover", className)}
      priority
    />
  );
}
