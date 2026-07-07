import { AgentChat } from "@/components/agent/agent-chat";

export const dynamic = "force-dynamic";

export default function AgentPage() {
  return (
    <div className="space-y-4 px-6 py-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Ask the OS</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Your founders&apos; analytics agent — answers grounded in the live company brain (Stripe · HubSpot · product), unified by identity.
        </p>
      </div>
      <AgentChat />
    </div>
  );
}
