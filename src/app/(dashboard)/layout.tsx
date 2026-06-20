import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import DashboardShell from "@/components/layout/dashboard-shell";
import { isClerkConfigured, isFounder } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Founders-only gate. Skipped in keyless local dev (isClerkConfigured=false);
  // middleware has already required a signed-in session when Clerk is active.
  if (isClerkConfigured) {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const email = user.primaryEmailAddress?.emailAddress;
    if (!isFounder(email, user.publicMetadata?.role)) {
      redirect("/not-authorized");
    }
  }

  return <DashboardShell>{children}</DashboardShell>;
}
