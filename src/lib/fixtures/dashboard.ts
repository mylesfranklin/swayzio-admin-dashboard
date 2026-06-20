/**
 * Phase 1 fixture — mirrors the live dashboard screenshot so we can verify the
 * Next.js + daisyUI UI is a pixel-match before wiring real data.
 *
 * REPLACE in Phase 3: this is swapped for a server fetch of /api/dashboard/live
 * once the integration services are ported into Next Route Handlers.
 */
export interface DashboardData {
  totalCustomers: number;
  connectedCustomers: number;
  mrr: number;
  activeSubscriptions: number;
  totalRevenue: number;
  subscribedUsers: number;
  revenueSubscriberData: Array<{ name: string; mrr: number; subscribers: number }>;
  newsletter: {
    totalSubscribers: number;
    netNew90d: number;
    openRate: number;
    clickRate: number;
    opens: number;
    clicks: number;
  };
}

export const dashboardFixture: DashboardData = {
  totalCustomers: 13190,
  connectedCustomers: 25445,
  mrr: 34736,
  activeSubscriptions: 3225,
  totalRevenue: 134011,
  subscribedUsers: 1109,
  revenueSubscriberData: [
    { name: "Jul 25", mrr: 30100, subscribers: 2680 },
    { name: "Aug 25", mrr: 30600, subscribers: 2720 },
    { name: "Sep 25", mrr: 31200, subscribers: 2810 },
    { name: "Oct 25", mrr: 31900, subscribers: 2900 },
    { name: "Nov 25", mrr: 32400, subscribers: 2980 },
    { name: "Dec 25", mrr: 32900, subscribers: 3050 },
    { name: "Jan 26", mrr: 33300, subscribers: 3110 },
    { name: "Feb 26", mrr: 33700, subscribers: 3150 },
    { name: "Mar 26", mrr: 34200, subscribers: 3190 },
    { name: "Apr 26", mrr: 34500, subscribers: 3205 },
    { name: "May 26", mrr: 34650, subscribers: 3218 },
    { name: "Jun 26", mrr: 34736, subscribers: 3225 },
  ],
  newsletter: {
    totalSubscribers: 31066,
    netNew90d: 1506,
    openRate: 29.2,
    clickRate: 1.8,
    opens: 24230,
    clicks: 1482,
  },
};
