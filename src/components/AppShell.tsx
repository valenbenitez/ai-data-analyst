import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="px-4 pt-4 sm:px-6">
        <nav
          aria-label="Principal"
          className="mx-auto flex max-w-page items-center justify-between gap-4 rounded-pill bg-surface px-5 py-3"
        >
          <Link
            href="/"
            className="font-display text-[26px] leading-none tracking-[0.02em] text-obsidian"
          >
            AI Data Analyst
          </Link>
          <div className="flex items-center gap-[9px]">
            <span className="rounded-pill px-3 text-base text-obsidian">
              Inicio
            </span>
          </div>
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-page flex-1 flex-col px-4 py-section sm:px-6">
        {children}
      </main>
    </div>
  );
}
