'use client'

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-svh w-full bg-background text-foreground">
      {/* Desktop sidebar skeleton */}
      <aside className="sticky top-0 hidden h-svh shrink-0 flex-col self-start border-r border-dark-border bg-sidebar md:flex md:w-16 lg:w-64">
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-dark-border px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold animate-pulse" />
            <div className="hidden lg:flex lg:flex-col">
              <div className="h-5 w-24 bg-dark-border/30 animate-pulse rounded" />
              <div className="mt-1.5 h-3 w-16 bg-dark-border/30 animate-pulse rounded" />
            </div>
          </div>
        </div>
        <nav className="sb-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
          <div className="px-3 pt-2 pb-1.5 h-5 bg-dark-border/30 animate-pulse rounded" />
          <div className="space-y-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="relative flex h-11 shrink-0 items-center gap-3 rounded-lg px-3 animate-pulse"
              >
                <div className="size-5 bg-dark-border/30 rounded" />
                <div className="h-4 w-20 bg-dark-border/30 rounded flex-1" />
              </div>
            ))}
          </div>
        </nav>
        <div className="flex shrink-0 flex-col gap-1 border-t border-dark-border p-3 space-y-1">
          <div className="flex h-11 items-center gap-3 rounded-lg px-3 animate-pulse">
            <div className="size-5 bg-dark-border/30 rounded" />
            <div className="h-4 w-20 bg-dark-border/30 rounded" />
          </div>
          <div className="flex h-11 items-center gap-3 rounded-lg px-3 animate-pulse">
            <div className="size-5 bg-dark-border/30 rounded" />
            <div className="h-4 w-20 bg-dark-border/30 rounded" />
          </div>
        </div>
      </aside>

      {/* Main column skeleton */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card animate-pulse" />
              <div className="flex items-center gap-2.5 md:hidden">
                <div className="flex size-9 items-center justify-center rounded-lg bg-gold animate-pulse" />
                <div className="h-6 w-24 bg-dark-border/30 animate-pulse rounded" />
              </div>
              <div className="hidden h-5 w-32 bg-dark-border/30 animate-pulse rounded md:flex" />
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <div className="hidden h-5 w-20 bg-dark-border/30 animate-pulse rounded sm:inline-flex" />
              <div className="flex items-center gap-2.5 rounded-full border border-border bg-card py-1 pr-3 pl-1 animate-pulse">
                <div className="size-8 bg-dark-border/30 rounded-full" />
                <div className="hidden max-w-[9rem] h-4 w-24 bg-dark-border/30 rounded sm:block" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
          {/* Page header skeleton */}
          <div className="mb-6 animate-pulse">
            <div className="h-8 w-48 bg-dark-border/30 rounded mb-2" />
            <div className="h-4 w-64 bg-dark-border/30 rounded" />
          </div>

          {/* Stats cards skeleton */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-dark-border bg-card rounded-xl p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-dark-border/30 rounded" />
                  <div className="size-5 bg-dark-border/30 rounded" />
                </div>
                <div className="mt-4 h-8 w-16 bg-dark-border/30 rounded" />
                <div className="mt-1 h-3 w-24 bg-dark-border/30 rounded" />
              </div>
            ))}
          </div>

          {/* Filter bar skeleton */}
          <div className="flex flex-wrap items-center gap-3 mb-6 animate-pulse">
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute left-3 top-1/2 size-4 -translate-y-1/2 bg-dark-border/30 rounded" />
              <div className="pl-9 h-9 w-full bg-dark-border/30 rounded" />
            </div>
            <div className="h-9 w-36 bg-dark-border/30 rounded" />
            <div className="h-9 w-36 bg-dark-border/30 rounded" />
            <div className="h-9 w-36 bg-dark-border/30 rounded" />
            <div className="h-9 w-24 bg-dark-border/30 rounded" />
          </div>

          {/* Table skeleton */}
          <div className="overflow-x-auto rounded-xl border border-dark-border bg-card animate-pulse">
            <table className="w-full text-sm">
              <thead className="bg-[#F1EDE5]">
                <tr>
                  <th className="p-3 text-left"><div className="h-4 w-24 bg-dark-border/30 rounded" /></th>
                  <th className="p-3 text-left"><div className="h-4 w-20 bg-dark-border/30 rounded" /></th>
                  <th className="p-3 text-left"><div className="h-4 w-16 bg-dark-border/30 rounded" /></th>
                  <th className="p-3 text-left"><div className="h-4 w-16 bg-dark-border/30 rounded" /></th>
                  <th className="p-3 text-left"><div className="h-4 w-24 bg-dark-border/30 rounded" /></th>
                  <th className="p-3 text-left"><div className="h-4 w-20 bg-dark-border/30 rounded" /></th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-t border-dark-border">
                    <td className="p-3"><div className="h-4 w-24 bg-dark-border/30 rounded" /></td>
                    <td className="p-3"><div className="h-4 w-20 bg-dark-border/30 rounded" /></td>
                    <td className="p-3"><div className="h-4 w-16 bg-dark-border/30 rounded" /></td>
                    <td className="p-3"><div className="h-4 w-16 bg-dark-border/30 rounded" /></td>
                    <td className="p-3"><div className="h-4 w-24 bg-dark-border/30 rounded" /></td>
                    <td className="p-3"><div className="h-4 w-20 bg-dark-border/30 rounded" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}

export function ProtectedPageLoading({ children }: { children?: React.ReactNode }) {
  return children ?? <DashboardSkeleton />
}