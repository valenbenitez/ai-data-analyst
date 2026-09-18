import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import { DatasetProfile } from "./profile";

const DATA_ROOT = path.join(process.cwd(), ".data", "uploads");

export type DatasetMeta = {
  id: string;
  originalName: string;
  createdAt: string;
  sizeBytes: number;
};

function csvPath(id: string) {
  return path.join(DATA_ROOT, `${id}.csv`);
}

function metaPath(id: string) {
  return path.join(DATA_ROOT, `${id}.json`);
}

async function ensureUploadDir() {
  await mkdir(DATA_ROOT, { recursive: true });
}

export async function saveDataset(input: {
  originalName: string;
  bytes: Buffer;
}): Promise<DatasetMeta> {
  await ensureUploadDir();

  const id = randomUUID();
  const meta: DatasetMeta = {
    id,
    originalName: input.originalName,
    createdAt: new Date().toISOString(),
    sizeBytes: input.bytes.byteLength,
  };

  await writeFile(csvPath(id), input.bytes);
  await writeFile(metaPath(id), JSON.stringify(meta, null, 2), "utf8");

  return meta;
}

export async function getDatasetMeta(
  id: string,
): Promise<DatasetMeta | null> {
  try {
    const raw = await readFile(metaPath(id), "utf8");
    return JSON.parse(raw) as DatasetMeta;
  } catch {
    return null;
  }
}

export async function getDatasetCsvPath(id: string): Promise<string | null> {
  const file = csvPath(id);
  try {
    await access(file);
    return file;
  } catch {
    return null;
  }
}

export function getUploadsDir() {
  return DATA_ROOT;
}

function profilePath(id: string) {
  return path.join(DATA_ROOT, `${id}.profile.json`);
}

export async function saveProfile(id: string, profile: DatasetProfile) {
  await writeFile(profilePath(id), JSON.stringify(profile, null, 2), "utf8");
}

export async function getProfile(id: string): Promise<DatasetProfile | null> {
  try {
    const raw = await readFile(profilePath(id), "utf8");
    return JSON.parse(raw) as DatasetProfile;
  } catch (error) {
    return null;
  }
}