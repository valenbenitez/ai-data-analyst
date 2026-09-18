import { readFile } from "node:fs/promises";
import { parseCsv, rowsToObjects } from "@/lib/datasets/csv";

export type ColumnType = "number" | "date" | "category" | "text";

export type ColumnProfile = {
  name: string;
  type: ColumnType;
  nullCount: number;
  cardinality: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  topValues?: Array<{ value: string; count: number }>;
};

export type DatasetProfile = {
  rowCount: number;
  columns: ColumnProfile[];
  sample: Record<string, string>[];
};

const SAMPLE_SIZE = 5;
const TOP_N = 5;
const CATEGORY_MAX_CARDINALITY = 50;

function isNull(v: string) {
  return v.trim() === "";
}

function isNumber(v: string) {
  const t = v.trim().replace(",", ".");
  return t !== "" && !Number.isNaN(Number(t)) && /^-?\d+(\.\d+)?$/.test(t);
}

function isDate(v: string) {
  const t = v.trim();
  if (!t) return false;

  const d = Date.parse(t);
  return !Number.isNaN(d) && /\d{4}|\d{1,2}[/-]\d{1,2}/.test(t);
}

function inferType(values: string[]): ColumnType {
  const nonNull = values.filter((v) => !isNull(v));
  if (nonNull.length === 0) return "text";

  if (nonNull.every(isNumber)) return "number";
  if (nonNull.every(isDate)) return "date";

  const unique = new Set(nonNull.map((v) => v.trim()));
  if (unique.size <= CATEGORY_MAX_CARDINALITY) return "category";

  return "text";
}

function median(nums: number[]) {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

function profileColumn(name: string, values: string[]): ColumnProfile {
  const nullCount = values.filter(isNull).length;
  const nonNull = values.filter((v) => !isNull(v)).map((v) => v.trim());
  const type = inferType(values);
  const cardinality = new Set(nonNull).size;
  const base: ColumnProfile = { name, type, nullCount, cardinality };
  if (type === "number") {
    const nums = nonNull.map((v) => Number(v.replace(",", ".")));
    const sum = nums.reduce((a, b) => a + b, 0);
    return {
      ...base,
      min: Math.min(...nums),
      max: Math.max(...nums),
      mean: sum / nums.length,
      median: median(nums),
    };
  }
  if (type === "category") {
    const counts = new Map<string, number>();
    for (const v of nonNull) counts.set(v, (counts.get(v) ?? 0) + 1);
    const topValues = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N)
      .map(([value, count]) => ({ value, count }));
    return { ...base, topValues };
  }
  return base;
}

export async function buildProfile(csvPath: string): Promise<DatasetProfile> {
  const text = await readFile(csvPath, "utf8");
  const { headers, rows } = parseCsv(text);
  const columns = headers.map((name, colIdx) => {
    const values = rows.map((r) => r[colIdx] ?? "");
    return profileColumn(name, values);
  });
  const sample = rowsToObjects(headers, rows.slice(0, SAMPLE_SIZE));
  return {
    rowCount: rows.length,
    columns,
    sample,
  };
}
