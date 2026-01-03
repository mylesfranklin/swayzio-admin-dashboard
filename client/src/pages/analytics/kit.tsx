import { KitDashboard } from "@/components/integrations/kit-dashboard";

export default function KitAnalytics() {
  return (
    <div className="space-y-6" data-testid="kit-analytics">
      <div>
        <h1 className="text-2xl font-bold text-white">Kit Newsletter Analytics</h1>
        <p className="text-linear-text-secondary mt-1">Subscriber growth and email performance</p>
      </div>
      <KitDashboard />
    </div>
  );
}
