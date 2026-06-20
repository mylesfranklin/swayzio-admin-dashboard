"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";
import { isClerkConfigured } from "@/lib/auth";

export function SidebarUser() {
  // Branch on a build-time constant (publishable key) before any hooks, so the
  // Clerk hooks are only ever called when ClerkProvider is in the tree.
  return isClerkConfigured ? <ClerkUser /> : <StaticUser />;
}

function ClerkUser() {
  const { user, isLoaded } = useUser();
  const name = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Account";

  return (
    <div className="flex items-center gap-3 rounded-lg p-2">
      <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">
          {isLoaded ? name : "…"}
        </p>
        <p className="text-[11px] text-ink-faint">Founder</p>
      </div>
    </div>
  );
}

function StaticUser() {
  return (
    <div className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-base-300">
      <div className="relative">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-info">
          <span className="text-xs font-medium text-white">SW</span>
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar bg-success" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">Dev Mode</p>
        <p className="text-[11px] text-ink-faint">Auth disabled</p>
      </div>
      <ChevronRight className="h-4 w-4 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
