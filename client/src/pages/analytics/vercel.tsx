import { VercelDashboard } from "@/components/integrations/vercel-dashboard";

export default function VercelAnalytics() {
  return (
    <div className="space-y-6" data-testid="vercel-analytics">
      <div>
        <h1 className="text-2xl font-bold text-white">Vercel Analytics</h1>
        <p className="text-linear-text-secondary mt-1">Deployments, traffic, and performance</p>
      </div>
      <VercelDashboard />
    </div>
  );
}
