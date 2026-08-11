import MonoLabel from "@/components/ui/MonoLabel";

/**
 * Section eyebrow — thin alias over MonoLabel so existing sections keep
 * their import while the page converges on the mono instrumentation voice.
 */
export default function SectionLabel({
  index,
  children,
  className,
  tone,
}: {
  index?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "light" | "inverse";
}) {
  return (
    <MonoLabel index={index} tick={!index} tone={tone} className={className}>
      {children}
    </MonoLabel>
  );
}
