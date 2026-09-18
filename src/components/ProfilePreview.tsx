import type { ColumnProfile, DatasetProfile } from "@/lib/datasets/profile";

function formatNum(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function columnSummary(col: ColumnProfile) {
  if (col.type === "number") {
    const parts = [
      col.min != null ? `min ${formatNum(col.min)}` : null,
      col.max != null ? `max ${formatNum(col.max)}` : null,
      col.mean != null ? `mean ${formatNum(col.mean)}` : null,
      col.median != null ? `median ${formatNum(col.median)}` : null,
    ].filter(Boolean);
    return parts.join(" · ");
  }
  if (col.type === "category" && col.topValues?.length) {
    return col.topValues
      .slice(0, 3)
      .map((t) => `${t.value} (${t.count})`)
      .join(", ");
  }
  return `${col.cardinality} valores únicos`;
}

type Props = {
  profile: DatasetProfile;
  originalName: string;
};

export function ProfilePreview({ profile, originalName }: Props) {
  const headers = profile.columns.map((c) => c.name);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-caption text-xs text-obsidian/60">{originalName}</p>
          <p className="mt-1 text-base text-obsidian">
            <span className="font-display text-[32px] leading-none tracking-[0.02em]">
              {profile.rowCount.toLocaleString("es-AR")}
            </span>{" "}
            filas · {profile.columns.length} columnas
          </p>
        </div>
        <span className="rounded-pill bg-sulfur px-3 py-1 font-caption text-xs text-obsidian">
          Profile listo
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-dotted border-obsidian/40">
              <th className="py-2 pr-4 font-caption text-xs text-obsidian/60">
                Columna
              </th>
              <th className="py-2 pr-4 font-caption text-xs text-obsidian/60">
                Tipo
              </th>
              <th className="py-2 pr-4 font-caption text-xs text-obsidian/60">
                Nulos
              </th>
              <th className="py-2 font-caption text-xs text-obsidian/60">
                Stats
              </th>
            </tr>
          </thead>
          <tbody>
            {profile.columns.map((col, i) => (
              <tr
                key={`${col.name}-${i}`}
                className="border-b border-dotted border-obsidian/15"
              >
                <td className="py-3 pr-4 text-obsidian">{col.name}</td>
                <td className="py-3 pr-4">
                  <span className="rounded-pill bg-pumice px-2.5 py-0.5 font-caption text-xs text-obsidian">
                    {col.type}
                  </span>
                </td>
                <td className="py-3 pr-4 text-obsidian/80">{col.nullCount}</td>
                <td className="py-3 text-obsidian/80">{columnSummary(col)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {profile.sample.length > 0 && (
        <div>
          <h3 className="mb-3 text-base text-obsidian">Sample</h3>
          <div className="overflow-x-auto rounded-md bg-pumice/50 p-4">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-dotted border-obsidian/30">
                  {headers.map((h, i) => (
                    <th
                      key={`${h}-${i}`}
                      className="whitespace-nowrap py-2 pr-4 font-caption text-xs text-obsidian/60"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profile.sample.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-dotted border-obsidian/10 last:border-0"
                  >
                    {headers.map((h, i) => (
                      <td
                        key={`${h}-${i}`}
                        className="max-w-[180px] truncate py-2 pr-4 text-obsidian"
                        title={row[h]}
                      >
                        {row[h] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
