import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight, ExternalLink, TrendingUp, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface KitDashboardData {
  growthStats: {
    cancellations: number;
    net_new_subscribers: number;
    new_subscribers: number;
    subscribers: number;
    starting: string;
    ending: string;
  };
  emailStats: {
    sent: number;
    clicked: number;
    opened: number;
  };
  totalSubscribers: number;
  forms: Array<{
    id: number;
    name: string;
    type: string;
  }>;
}

interface KitNewsletterProps {
  className?: string;
}

export function KitNewsletter({ className }: KitNewsletterProps) {
  const { data, isLoading } = useQuery<KitDashboardData>({
    queryKey: ["/api/kit/live/dashboard"],
    staleTime: 5 * 60 * 1000,
  });

  const colors = ['#5e6ad2', '#59a200', '#f2c94c', '#f2994a', '#eb5757'];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="p-4 border-b border-linear-border flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-white">Kit Newsletter</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-md bg-linear-hover border border-linear-border">
                <Skeleton className="h-3 w-16 mb-2 bg-linear-card" />
                <Skeleton className="h-6 w-20 bg-linear-card" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSubscribers = data?.totalSubscribers || 0;
  const netNew = data?.growthStats?.net_new_subscribers || 0;
  const newSubs = data?.growthStats?.new_subscribers || 0;
  const emailsSent = data?.emailStats?.sent || 0;
  const opened = data?.emailStats?.opened || 0;
  const clicked = data?.emailStats?.clicked || 0;
  
  const openRate = emailsSent > 0 ? ((opened / emailsSent) * 100).toFixed(1) : '0';
  const clickRate = emailsSent > 0 ? ((clicked / emailsSent) * 100).toFixed(1) : '0';

  const topForms = (data?.forms || []).slice(0, 5).map((form, index) => ({
    name: form.name,
    type: form.type,
    color: colors[index % colors.length]
  }));

  return (
    <Card className={className}>
      <CardHeader className="p-4 border-b border-linear-border flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-white">Kit Newsletter</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-linear-text-secondary hover:text-white" data-testid="button-kit-subscribers">
          <span>Go to subscribers</span>
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-md bg-linear-hover border border-linear-border">
            <p className="text-xs text-linear-text-secondary">Total Subscribers</p>
            <p className="text-xl font-semibold text-white mt-1">{totalSubscribers.toLocaleString()}</p>
            <p className="text-xs text-linear-text-tertiary mt-1">Active</p>
          </div>
          
          <div className="p-3 rounded-md bg-linear-hover border border-linear-border">
            <p className="text-xs text-linear-text-secondary">Net New (90d)</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-xl font-semibold text-white">{netNew.toLocaleString()}</p>
              {netNew > 0 && (
                <span className="text-xs font-medium text-linear-success flex items-center mb-0.5">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                </span>
              )}
            </div>
            <p className="text-xs text-linear-text-tertiary mt-1">Growth</p>
          </div>
          
          <div className="p-3 rounded-md bg-linear-hover border border-linear-border">
            <p className="text-xs text-linear-text-secondary">Open Rate</p>
            <p className="text-xl font-semibold text-white mt-1">{openRate}%</p>
            <p className="text-xs text-linear-text-tertiary mt-1">{opened.toLocaleString()} opens</p>
          </div>
          
          <div className="p-3 rounded-md bg-linear-hover border border-linear-border">
            <p className="text-xs text-linear-text-secondary">Click Rate</p>
            <p className="text-xl font-semibold text-white mt-1">{clickRate}%</p>
            <p className="text-xs text-linear-text-tertiary mt-1">{clicked.toLocaleString()} clicks</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-md bg-linear-hover/50 border border-linear-border">
            <div className="flex items-center justify-between">
              <p className="text-xs text-linear-text-secondary">Emails Sent (90d)</p>
              <Badge variant="secondary" className="text-[10px]">Last 90 days</Badge>
            </div>
            <p className="text-2xl font-semibold text-white mt-2">{emailsSent.toLocaleString()}</p>
          </div>
          
          <div className="p-3 rounded-md bg-linear-hover/50 border border-linear-border">
            <div className="flex items-center justify-between">
              <p className="text-xs text-linear-text-secondary">New Subscribers (90d)</p>
              <Badge variant="secondary" className="text-[10px]">Last 90 days</Badge>
            </div>
            <p className="text-2xl font-semibold text-white mt-2">{newSubs.toLocaleString()}</p>
          </div>
        </div>

        {topForms.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Active Forms</h3>
              <Badge variant="secondary">{topForms.length} forms</Badge>
            </div>
            
            <div className="space-y-2">
              {topForms.map((form, index) => (
                <div key={index} className="flex justify-between items-center text-sm py-1.5 px-2 hover:bg-linear-hover rounded transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className="h-2 w-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: form.color }}
                    />
                    <span className="truncate text-linear-text-secondary text-xs">{form.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">{form.type}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
