import DashboardShell from "@/components/layout/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Phase 2 will wrap this group in Clerk's auth guard (founders-only).
  return <DashboardShell>{children}</DashboardShell>;
}
