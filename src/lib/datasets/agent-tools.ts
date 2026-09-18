import { readFile } from "node:fs/promises";
import { tool } from "ai";
import { z } from "zod";
import { parseCsv, rowsToObjects } from "@/lib/datasets/csv";
import { runSql } from "@/lib/datasets/sql";
import { getDatasetCsvPath, getProfile } from "@/lib/datasets/store";

const MAX_SAMPLE_ROWS = 20;

export function createDatasetTools(datasetId: string) {
  return {
    get_schema: tool({
      description:
        "Devuelve el schema del dataset activo: nombres de columnas y tipos inferidos.",
      inputSchema: z.object({}),
      execute: async () => {
        const profile = await getProfile(datasetId);
        if (!profile) return { error: "Profile no encontrado." };
        return {
          rowCount: profile.rowCount,
          columns: profile.columns.map((c) => ({
            name: c.name,
            type: c.type,
          })),
        };
      },
    }),

    describe_column: tool({
      description:
        "Stats de una columna: nulos, cardinality, min/max/mean/median o top values.",
      inputSchema: z.object({
        column: z.string().describe("Nombre exacto de la columna"),
      }),
      execute: async ({ column }) => {
        const profile = await getProfile(datasetId);
        if (!profile) return { error: "Profile no encontrado." };
        const col = profile.columns.find(
          (c) => c.name.toLowerCase() === column.toLowerCase(),
        );
        if (!col) {
          return {
            error: `Columna "${column}" no existe.`,
            available: profile.columns.map((c) => c.name),
          };
        }
        return col;
      },
    }),

    sample_rows: tool({
      description:
        "Lee filas actuales del CSV en disco (fresco, no el sample del profile). Máximo 20 filas.",
      inputSchema: z.object({
        limit: z
          .number()
          .int()
          .min(1)
          .max(MAX_SAMPLE_ROWS)
          .optional()
          .describe(`Cantidad de filas (default 5, máx ${MAX_SAMPLE_ROWS})`),
        offset: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe("Fila de inicio (0 = primera fila de datos)"),
      }),
      execute: async ({ limit = 5, offset = 0 }) => {
        const csvPath = await getDatasetCsvPath(datasetId);
        if (!csvPath) return { error: "CSV no encontrado." };

        try {
          const text = await readFile(csvPath, "utf8");
          const { headers, rows } = parseCsv(text);
          const n = Math.min(limit, MAX_SAMPLE_ROWS);
          const slice = rows.slice(offset, offset + n);

          return {
            columns: headers,
            rows: rowsToObjects(headers, slice),
            returned: slice.length,
            offset,
            totalRows: rows.length,
            source: "csv",
          };
        } catch (err) {
          return {
            error:
              err instanceof Error
                ? err.message
                : "No se pudo leer el CSV.",
          };
        }
      },
    }),

    run_sql: tool({
      description:
        "Ejecuta SQL de solo lectura (SELECT/WITH) sobre el dataset. La tabla se llama `data`. Resultado acotado a 50 filas. Usá esto para agregaciones, filtros y GROUP BY.",
      inputSchema: z.object({
        sql: z
          .string()
          .describe(
            "Query SQL. Ejemplo: SELECT col, COUNT(*) AS n FROM data GROUP BY 1 ORDER BY n DESC",
          ),
      }),
      execute: async ({ sql }) => {
        const csvPath = await getDatasetCsvPath(datasetId);
        if (!csvPath) return { error: "CSV no encontrado." };
        return runSql(csvPath, sql);
      },
    }),
  };
}
