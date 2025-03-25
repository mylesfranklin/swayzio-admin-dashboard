import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ExternalLink } from "lucide-react";

interface KitNewsletterProps {
  className?: string;
}

export function KitNewsletter({ className }: KitNewsletterProps) {
  // Data from the screenshot
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

  // Calculate total percentage on the pie chart
  const totalSubscribers = newsletterData.topForms.reduce((acc, form) => acc + form.subscribers, 0);
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Kit Newsletter</CardTitle>
            <CardDescription>Subscriber growth and conversion metrics</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <span>Go to subscribers</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subscribers metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-slate-500">Today</div>
              <div className="text-2xl font-bold mt-1">{newsletterData.subscribers.today}</div>
              <div className="text-xs text-slate-500 mt-1">New subscribers</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-slate-500">Past 7 days</div>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold">{newsletterData.subscribers.past7Days}</div>
                <div className="text-xs font-medium text-green-600 mb-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 inline mr-0.5" />
                  {newsletterData.subscribers.past7DaysGrowth}%
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-1">New subscribers</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-slate-500">Past 30 days</div>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold">{newsletterData.subscribers.past30Days}</div>
                <div className="text-xs font-medium text-green-600 mb-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 inline mr-0.5" />
                  {newsletterData.subscribers.past30DaysGrowth}%
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-1">New subscribers</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-slate-500">Total</div>
              <div className="text-2xl font-bold mt-1">{newsletterData.subscribers.total.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">Subscribers</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Top forms and landing pages */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Top forms and landing pages</h3>
            <Badge variant="outline" className="text-xs">Last 7 days</Badge>
          </div>
          
          <div className="flex">
            {/* Pie chart visualization */}
            <div className="relative w-32 h-32 mr-4 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Create segments for each form */}
                {newsletterData.topForms.map((form, index, array) => {
                  // Calculate percentages and positions for pie segments
                  const percentage = (form.subscribers / totalSubscribers) * 100;
                  const previousPercentages = array
                    .slice(0, index)
                    .reduce((acc, prev) => acc + (prev.subscribers / totalSubscribers) * 100, 0);
                  
                  // Arc parameters
                  const radius = 40;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = `${(-(previousPercentages) / 100) * circumference}`;
                  
                  // Color assignment based on index
                  const colors = ['#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#f0f9ff'];
                  
                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke={colors[index % colors.length]}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                    />
                  );
                })}
                <circle cx="50" cy="50" r="30" fill="white" />
              </svg>
            </div>
            
            {/* Form list */}
            <div className="flex-grow space-y-2.5">
              {newsletterData.topForms.map((form, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${
                      index === 0 ? 'bg-blue-400' :
                      index === 1 ? 'bg-blue-300' :
                      index === 2 ? 'bg-blue-200' :
                      index === 3 ? 'bg-blue-100' : 'bg-blue-50'
                    }`}></div>
                    <span className="truncate max-w-[200px]">{form.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{form.subscribers}</span>
                    {form.growth > 0 && (
                      <span className="text-xs text-green-600">↑ {form.growth}%</span>
                    )}
                    {form.growth < 0 && (
                      <span className="text-xs text-red-600">↓ {Math.abs(form.growth)}%</span>
                    )}
                    {form.growth === 0 && (
                      <span className="text-xs text-gray-400">—</span>
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