import type { MockupCopy, ProjectScreen } from "@/content/projects";
import LaunchReadiness from "./LaunchReadiness";
import Workflow from "./Workflow";

type MockupKind = Extract<ProjectScreen, { kind: "mockup" }>["mockup"];

/** The illustration for a mockup screen, authored at 960x600 (scaled by MockupScaler). */
export default function Mockup({ kind, copy }: { kind: MockupKind; copy: MockupCopy }) {
  if (kind === "launch-readiness") return <LaunchReadiness copy={copy.launchReadiness} />;
  return <Workflow copy={copy.workflow} />;
}
