import Link from "next/link";

export default function DashboardLayout({
  children
}: Readonly<{ children: React.ReactNode }>): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
            Team Flow
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/dashboard" className="hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/teams" className="hover:text-slate-900">
              Teams
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
    </div>
  );
}
