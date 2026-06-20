import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "fs";
import { resolve, dirname } from "path";
import { loadConfig } from "../compiler/load-config.js";
import { extractHandlers } from "../compiler/extract-handlers.js";
import { bundleHandlers } from "../compiler/bundle-handlers.js";
import { mergeHooksIntoSettings } from "../compiler/merge-hooks.js";

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

  if (options.clean && existsSync(hooksDir)) {
    rmSync(hooksDir, { recursive: true, force: true });
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
    hooksDir,
  });

  const existingSettings: Record<string, any> = existsSync(settingsPath)
    ? JSON.parse(readFileSync(settingsPath, "utf-8"))
    : {};

  const merged = mergeHooksIntoSettings({
    existingSettings,
    bundledFiles,
    hooksDir,
    settingsPath,
    projectRoot: process.cwd(),
  });

  if (options.dryRun) {
    console.log("Dry run — would write:");
    console.log(JSON.stringify(merged, null, 2));
    return;
  }

  mkdirSync(dirname(settingsPath), { recursive: true });
  writeFileSync(settingsPath, JSON.stringify(merged, null, 2) + "\n");

  console.log(`Built ${bundledFiles.length} hook(s) → ${hooksDir}`);
  console.log(`Settings merged → ${settingsPath}`);
}
