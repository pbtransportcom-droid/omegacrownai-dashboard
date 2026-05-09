export const Telemetry = {
  enabled: false,

  log(event: string, data: any = {}) {
    if (!Telemetry.enabled) return;

    console.log("[SugentTelemetry]", {
      event,
      data,
      createdAt: new Date().toISOString(),
    });
  },
};
