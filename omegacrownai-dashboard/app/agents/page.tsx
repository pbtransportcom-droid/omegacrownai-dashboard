import AgentRoom from "@/components/runtime/AgentRoom";

export default function AgentsPage() {
  return <AgentRoom initialSessionId={`agents-${Date.now()}`} />;
}
