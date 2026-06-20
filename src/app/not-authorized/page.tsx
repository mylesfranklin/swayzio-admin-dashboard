import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { ShieldAlert } from "lucide-react";
import { isClerkConfigured } from "@/lib/auth";

export default function NotAuthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-100 p-4">
      <div className="max-w-md rounded-box border border-line bg-base-200 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
          <ShieldAlert className="h-6 w-6 text-error" />
        </div>
        <h1 className="text-lg font-semibold text-ink">Access restricted</h1>
        <p className="mt-2 text-sm text-ink-muted">
          This dashboard is limited to Swayzio founders. Your account isn&apos;t on the
          allowlist.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          {isClerkConfigured && (
            <SignOutButton>
              <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-content transition-colors hover:bg-brand-hover">
                Sign out
              </button>
            </SignOutButton>
          )}
          <Link
            href="/sign-in"
            className="h-9 rounded-md border border-line px-4 text-sm leading-9 text-ink-muted transition-colors hover:bg-base-300 hover:text-ink"
          >
            Use another account
          </Link>
        </div>
      </div>
    </div>
  );
}
