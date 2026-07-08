import { AgentChat } from "@/components/agent/agent-chat";

export const dynamic = "force-dynamic";

export default function AgentPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <AgentChat />
    </div>
  );
}
