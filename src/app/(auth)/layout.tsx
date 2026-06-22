export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-100 p-4">
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand/70 shadow-glow-brand">
            <span className="text-base font-bold text-white">S</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Swayzio</p>
            <p className="text-[0.6875rem] text-ink-faint">Admin Dashboard</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
