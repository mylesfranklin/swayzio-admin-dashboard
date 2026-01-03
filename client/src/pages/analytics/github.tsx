import { GitHubDashboard } from "@/components/integrations/github-dashboard";

export default function GitHubAnalytics() {
  return (
    <div className="space-y-6" data-testid="github-analytics">
      <div>
        <h1 className="text-2xl font-bold text-white">GitHub Analytics</h1>
        <p className="text-linear-text-secondary mt-1">Repository activity and code insights</p>
      </div>
      <GitHubDashboard />
    </div>
  );
}
