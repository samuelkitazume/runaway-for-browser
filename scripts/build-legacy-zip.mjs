// scripts/build-legacy-zip.mjs
//
// Bundles /legacy/ into /public/downloads/runaway-2011-original.zip so the
// homepage can offer the 2011 original as a download.
//
// Runs as a Vite `prebuild` hook (wired up in Phase 2 once package.json exists).
// Until then, this script is dormant — running it requires `npm install archiver`.
//
// Determinism: file timestamps inside the zip are pinned to the Unix epoch so
// the produced zip is byte-identical across machines and rebuilds. This keeps
// the download stable for users and avoids spurious git churn if the artifact
// is ever committed.

import { createWriteStream } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import archiver from "archiver";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");
const SRC = resolve(REPO, "legacy");
const OUT_DIR = resolve(REPO, "public", "downloads");
const OUT_FILE = resolve(OUT_DIR, "runaway-2011-original.zip");

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(SRC))) {
    console.error(`[build-legacy-zip] source not found: ${SRC}`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  if (await exists(OUT_FILE)) {
    await rm(OUT_FILE);
  }

  const output = createWriteStream(OUT_FILE);
  const archive = archiver("zip", {
    zlib: { level: 9 },
    // Pin entry timestamps for reproducible output.
    statConcurrency: 1,
  });

  const done = new Promise((resolvePromise, rejectPromise) => {
    output.on("close", resolvePromise);
    archive.on("warning", (err) => {
      if (err.code === "ENOENT") console.warn(`[build-legacy-zip] ${err}`);
      else rejectPromise(err);
    });
    archive.on("error", rejectPromise);
  });

  archive.pipe(output);

  // Walk legacy/ and add each entry with a fixed Unix-epoch date so the zip
  // bytes don't depend on filesystem mtimes.
  archive.directory(SRC, "runaway-2011-original", (entry) => {
    entry.date = new Date(0);
    return entry;
  });

  await archive.finalize();
  await done;

  const bytes = (await stat(OUT_FILE)).size;
  console.log(
    `[build-legacy-zip] wrote ${OUT_FILE} (${bytes.toLocaleString()} bytes)`
  );
}

main().catch((err) => {
  console.error("[build-legacy-zip] failed:", err);
  process.exit(1);
});
