import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KitNewsletterProps {
  className?: string;
}

export function KitNewsletter({ className }: KitNewsletterProps) {
  const newsletterData = {
    subscribers: {
      today: 97,
      past7Days: 908,
      past7DaysGrowth: 190.1,
      past30Days: 2310,
      past30DaysGrowth: 77.6,
      total: 12726
    },
    topForms: [
      { name: "Sync Money Meta (syncmoney.ai/ig)", subscribers: 33, growth: 0 },
      { name: "Insta Bio Link Subscribers", subscribers: 27, growth: 42.1 },
      { name: "Top 22 Libraries Offer", subscribers: 20, growth: 11.1 },
      { name: "Myles Cold Email Landing Page (aka syncmoney.ai)", subscribers: 17, growth: -29.2 },
      { name: "AudioMack in-app sign up flow", subscribers: 3, growth: 0 }
    ]
  };

  const totalSubscribers = newsletterData.topForms.reduce((acc, form) => acc + form.subscribers, 0);
  const colors = ['#5e6ad2', '#59a200', '#f2c94c', '#f2994a', '#eb5757'];
  
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
            <p className="text-xs text-linear-text-secondary">Today</p>
            <p className="text-xl font-semibold text-white mt-1">{newsletterData.subscribers.today}</p>
            <p className="text-xs text-linear-text-tertiary mt-1">New subscribers</p>
          </div>
          
          <div className="p-3 rounded-md bg-linear-hover border border-linear-border">
            <p className="text-xs text-linear-text-secondary">Past 7 days</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-xl font-semibold text-white">{newsletterData.subscribers.past7Days}</p>
              <span className="text-xs font-medium text-linear-success flex items-center mb-0.5">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                {newsletterData.subscribers.past7DaysGrowth}%
              </span>
            </div>
            <p className="text-xs text-linear-text-tertiary mt-1">New subscribers</p>
          </div>
          
          <div className="p-3 rounded-md bg-linear-hover border border-linear-border">
            <p className="text-xs text-linear-text-secondary">Past 30 days</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-xl font-semibold text-white">{newsletterData.subscribers.past30Days.toLocaleString()}</p>
              <span className="text-xs font-medium text-linear-success flex items-center mb-0.5">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                {newsletterData.subscribers.past30DaysGrowth}%
              </span>
            </div>
            <p className="text-xs text-linear-text-tertiary mt-1">New subscribers</p>
          </div>
          
          <div className="p-3 rounded-md bg-linear-hover border border-linear-border">
            <p className="text-xs text-linear-text-secondary">Total</p>
            <p className="text-xl font-semibold text-white mt-1">{newsletterData.subscribers.total.toLocaleString()}</p>
            <p className="text-xs text-linear-text-tertiary mt-1">Subscribers</p>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Top forms and landing pages</h3>
            <Badge variant="secondary">Last 7 days</Badge>
          </div>
          
          <div className="flex gap-6">
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {newsletterData.topForms.map((form, index, array) => {
                  const percentage = (form.subscribers / totalSubscribers) * 100;
                  const previousPercentages = array
                    .slice(0, index)
                    .reduce((acc, prev) => acc + (prev.subscribers / totalSubscribers) * 100, 0);
                  
                  const radius = 40;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = `${(-(previousPercentages) / 100) * circumference}`;
                  
                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke={colors[index % colors.length]}
                      strokeWidth="18"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                    />
                  );
                })}
                <circle cx="50" cy="50" r="30" fill="#17181a" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold text-white">{totalSubscribers}</span>
              </div>
            </div>
            
            <div className="flex-grow space-y-2">
              {newsletterData.topForms.map((form, index) => (
                <div key={index} className="flex justify-between items-center text-sm py-1 hover:bg-linear-hover rounded px-2 -mx-2 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="truncate text-linear-text-secondary">{form.name}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-white font-medium">{form.subscribers}</span>
                    {form.growth > 0 && (
                      <span className="text-xs text-linear-success flex items-center">
                        <ArrowUpRight className="h-3 w-3" />
                        {form.growth}%
                      </span>
                    )}
                    {form.growth < 0 && (
                      <span className="text-xs text-linear-error flex items-center">
                        <ArrowDownRight className="h-3 w-3" />
                        {Math.abs(form.growth)}%
                      </span>
                    )}
                    {form.growth === 0 && (
                      <span className="text-xs text-linear-text-tertiary flex items-center">
                        <Minus className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
