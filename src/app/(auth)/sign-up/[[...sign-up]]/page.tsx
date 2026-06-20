import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { isClerkConfigured } from "@/lib/auth";

export default function SignUpPage() {
  if (!isClerkConfigured) {
    return (
      <div className="max-w-sm rounded-box border border-line bg-base-200 p-6 text-center">
        <p className="text-sm font-medium text-ink">Auth not configured</p>
        <p className="mt-2 text-xs text-ink-muted">
          Add <code className="text-brand">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{" "}
          <code className="text-brand">CLERK_SECRET_KEY</code> to enable sign-up.
        </p>
      </div>
    );
  }

  return (
    <SignUp
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: "#3b5bdb",
          colorBackground: "#17181a",
          borderRadius: "0.375rem",
        },
      }}
    />
  );
}
