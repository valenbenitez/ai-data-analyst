import { AppShell } from "@/components/AppShell";
import { CsvUpload } from "@/components/CsvUpload";
import { PointerGlow } from "@/components/PointerGlow";

export default function Home() {
  return (
    <>
      <PointerGlow />
      <AppShell>
        <section className="flex flex-1 flex-col gap-10">
          <header className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-end md:gap-10">
            <h1 className="font-display text-[48px] leading-none tracking-[0.02em] text-obsidian sm:text-[64px] lg:text-[80px] lg:leading-[1.05]">
              Preguntale lo que sea a tus datos
            </h1>
            <div className="flex flex-col gap-3 text-base leading-[1.55] text-obsidian md:text-right">
              <p>
                AI Data Analyst analiza CSVs con un agente: profile compacto +
                tools.
              </p>
              <p className="text-obsidian/70">
                Subí un CSV, elegí el dataset y después pedí insights en
                lenguaje natural.
              </p>
            </div>
          </header>

          <div className="rounded-card bg-surface p-card">
            <div className="mb-6 flex items-center gap-3">
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-obsidian text-sm text-chalk"
              >
                1
              </span>
              <h2 className="text-[30px] leading-[1.5] text-obsidian">
                Elegí un dataset
              </h2>
            </div>
            <CsvUpload />
          </div>
        </section>
      </AppShell>
    </>
  );
}
