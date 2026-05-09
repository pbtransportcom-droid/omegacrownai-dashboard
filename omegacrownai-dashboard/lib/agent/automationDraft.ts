export function buildAutomationFlowDraft({
  message,
}: {
  message: string;
}) {
  const lower = String(message || "").toLowerCase();

  const isEmail =
    lower.includes("email") ||
    lower.includes("follow up") ||
    lower.includes("customer") ||
    lower.includes("lead");

  const isBooking =
    lower.includes("booking") ||
    lower.includes("appointment") ||
    lower.includes("reservation") ||
    lower.includes("ride");

  const name = isBooking
    ? "Booking Follow-Up Automation"
    : isEmail
      ? "Customer Email Automation"
      : "Sugent Automation Flow";

  return {
    version: "automation_flow_v1",
    status: "draft",
    name,
    source: "omega_crown_super_agent",
    request: message,
    description: isBooking
      ? "Automatically handles a customer booking request, sends confirmation, and prepares follow-up actions."
      : "Automatically runs a simple business workflow based on the user request.",
    trigger: isBooking
      ? "new_booking_request"
      : isEmail
        ? "new_customer_lead"
        : "manual_start",
    nodes: [
      {
        id: "trigger_1",
        type: "trigger",
        title: isBooking ? "New Booking Request" : "Start Automation",
        config: {
          event: isBooking ? "booking.created" : isEmail ? "lead.created" : "manual.start",
        },
      },
      {
        id: "condition_1",
        type: "condition",
        title: "Check Required Information",
        config: {
          rule: isBooking
            ? "customer_phone exists AND pickup_time exists"
            : "customer_email exists",
        },
      },
      {
        id: "email_1",
        type: "email",
        title: isBooking ? "Send Booking Confirmation" : "Send Customer Email",
        config: {
          to: "{{customer.email}}",
          subject: isBooking
            ? "Your ride request has been received"
            : "Thank you for contacting us",
          body: isBooking
            ? "Thank you for choosing us. We received your ride request and will confirm your driver details shortly."
            : "Thank you for reaching out. We received your request and will follow up soon.",
        },
      },
      {
        id: "task_1",
        type: "custom",
        title: "Create Internal Follow-Up Task",
        config: {
          assignee: "team",
          priority: "normal",
          note: isBooking
            ? "Review booking details and confirm vehicle/driver."
            : "Review customer request and follow up.",
        },
      },
    ],
    edges: [
      { id: "edge_1", from: "trigger_1", to: "condition_1" },
      { id: "edge_2", from: "condition_1", to: "email_1" },
      { id: "edge_3", from: "email_1", to: "task_1" },
    ],
    safety: {
      requiresReviewBeforeRun: true,
      notes: "Automation is a draft. Review recipients, timing, and message content before enabling.",
    },
  };
}
