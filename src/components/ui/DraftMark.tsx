import { cn } from "@/lib/utils";
import { SHOW_DRAFTS, type Status } from "@/content/site";

/**
 * Dev-only "DRAFT" chip beside copy that still needs Mehdi's sign-off.
 * Renders nothing in production or when the entry is confirmed.
 */
export default function DraftMark({
  status = "draft",
  className,
}: {
  status?: Status;
  className?: string;
}) {
  if (!SHOW_DRAFTS || status !== "draft") return null;

  return (
    <span
      className={cn(
        "type-label ml-2 inline-block rounded-xs border border-driftwood px-1 align-middle not-italic leading-none text-driftwood",
        className
      )}
    >
      DRAFT
    </span>
  );
}
