import { SugentSDK } from "./sdk";
import { OSManifest } from "./osManifest";
import { Telemetry } from "./telemetry";

let booted = false;

export function bootstrapSugentOS() {
  if (booted) {
    return {
      ok: true,
      booted,
      message: "Sugent OS already booted.",
      manifest: OSManifest,
      registry: SugentSDK.list(),
    };
  }

  SugentSDK.registerBuilder({
    id: "website",
    name: "Website Builder",
    version: "1.0.0",
  });

  SugentSDK.registerBuilder({
    id: "trading",
    name: "Trading Builder",
    version: "1.0.0",
  });

  SugentSDK.registerBuilder({
    id: "automation",
    name: "Automation Builder",
    version: "1.0.0",
  });

  booted = true;

  Telemetry.log("sugent_os_bootstrap", {
    version: OSManifest.version,
  });

  return {
    ok: true,
    booted,
    message: "Sugent OS bootstrapped.",
    manifest: OSManifest,
    registry: SugentSDK.list(),
  };
}
