import {
  readFileSync,
  readdirSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  unlinkSync,
} from "fs";
import { resolve, dirname, relative } from "path";
import { loadConfig } from "../compiler/load-config.js";
import { extractHandlers } from "../compiler/extract-handlers.js";
import {
  bundleHandlers,
  type BundledFile,
} from "../compiler/bundle-handlers.js";
import { mergeHooksIntoSettings } from "../compiler/merge-hooks.js";

const MANAGED_SUBDIR = "clauptain-hook";

function removeStaleFiles(
  managedDir: string,
  bundledFiles: { fileName: string }[],
): number {
  if (!existsSync(managedDir)) return 0;

  const generatedNames = new Set(bundledFiles.map((f) => f.fileName));
  const staleFiles = readdirSync(managedDir, { withFileTypes: true }).filter(
    (entry) =>
      entry.isFile() &&
      entry.name.endsWith(".cjs") &&
      !generatedNames.has(entry.name),
  );

  for (const entry of staleFiles) {
    unlinkSync(resolve(managedDir, entry.name));
  }

  return staleFiles.length;
}

export interface BuildOptions {
  config: string;
  output: string;
  hooksDir?: string;
  dryRun?: boolean;
  clean?: boolean;
}

export async function build(options: BuildOptions): Promise<void> {
  const configPath = resolve(options.config);
  const settingsPath = resolve(options.output);
  const hooksDir = options.hooksDir
    ? resolve(options.hooksDir)
    : resolve(dirname(settingsPath), "hooks");
  const managedDir = resolve(hooksDir, MANAGED_SUBDIR);

  if (options.clean && existsSync(managedDir)) {
    rmSync(managedDir, { recursive: true, force: true });
  }

  const loaded = await loadConfig(configPath);
  const handlers = extractHandlers(loaded);

  if (handlers.length === 0) {
    console.log("No handlers found in config.");
    return;
  }

  const bundledFiles = await bundleHandlers({
    configPath,
    handlers,
    hooksDir: managedDir,
  });

  const removedCount = removeStaleFiles(managedDir, bundledFiles);

  const existingSettings: Record<string, any> = existsSync(settingsPath)
    ? JSON.parse(readFileSync(settingsPath, "utf-8"))
    : {};

  const merged = mergeHooksIntoSettings({
    existingSettings,
    bundledFiles,
    projectRoot: process.cwd(),
  });

  if (options.dryRun) {
    console.log("Dry run — would write:");
    console.log(JSON.stringify(merged, null, 2));
    return;
  }

  mkdirSync(dirname(settingsPath), { recursive: true });
  writeFileSync(settingsPath, JSON.stringify(merged, null, 2) + "\n");

  printBuildSummary(bundledFiles, settingsPath, removedCount);
}

function printBuildSummary(
  bundledFiles: BundledFile[],
  settingsPath: string,
  removedCount: number,
): void {
  const relSettingsPath = relative(process.cwd(), settingsPath);
  const byEvent = Map.groupBy(bundledFiles, (f) => f.event);

  console.log(`✓ Found ${bundledFiles.length} handler(s)`);
  console.log(`✓ Generated ${relSettingsPath}`);
  for (const [event, files] of byEvent) {
    const names = files.map((f) => f.name).join(", ");
    console.log(`  → ${event}: ${names}`);
  }
  if (removedCount > 0) {
    console.log(`✓ Removed ${removedCount} stale hook(s)`);
  }
}
