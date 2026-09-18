import { DuckDBInstance } from "@duckdb/node-api";

const MAX_ROWS = 50;

export type SqlSuccess = {
  columns: string[];
  rows: Record<string, unknown>[];
  returned: number;
  cappedAt: number;
};

export type SqlFailure = {
  error: string;
};

export type SqlResult = SqlSuccess | SqlFailure;

function sqlStringLiteral(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

function isSelectOnly(sql: string) {
  const trimmed = sql.trim().replace(/;+$/, "");
  if (!/^(with|select)\b/i.test(trimmed)) return false;
  // Reject stacked statements: "SELECT 1; DROP ..."
  if (/;\s*\S/.test(trimmed)) return false;
  return true;
}

export async function runSql(
  csvPath: string,
  sql: string,
): Promise<SqlResult> {
  const trimmed = sql.trim().replace(/;+$/, "");

  if (!trimmed) {
    return { error: "SQL vacío." };
  }
  if (!isSelectOnly(trimmed)) {
    return {
      error:
        "Solo se permiten queries SELECT/WITH de una sola statement (sin ; extra).",
    };
  }

  const instance = await DuckDBInstance.create(":memory:");
  const conn = await instance.connect();

  try {
    await conn.run(
      `CREATE OR REPLACE VIEW data AS SELECT * FROM read_csv_auto(${sqlStringLiteral(csvPath)}, header=true);`,
    );

    const limited = `SELECT * FROM (${trimmed}) AS _q LIMIT ${MAX_ROWS}`;
    const reader = await conn.runAndReadAll(limited);
    const rows = reader.getRowObjectsJson() as Record<string, unknown>[];
    const columns = reader.columnNames();

    return {
      columns,
      rows,
      returned: rows.length,
      cappedAt: MAX_ROWS,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error ejecutando SQL.";
    return { error: message };
  } finally {
    try {
      conn.closeSync();
    } catch {
      // ignore
    }
    try {
      instance.closeSync();
    } catch {
      // ignore
    }
  }
}
