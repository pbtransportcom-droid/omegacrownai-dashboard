import { OmegaLogo } from "@/components/brand/OmegaLogo";
import RuntimeConsole from "@/components/runtime/RuntimeConsole";

export default function RuntimePage() {
  return <RuntimeConsole initialSessionId={`runtime-${Date.now()}`} />;
}
