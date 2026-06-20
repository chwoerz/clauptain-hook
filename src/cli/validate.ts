import { resolve } from "path";
import { loadConfig } from "../compiler/load-config.js";
import { extractHandlers } from "../compiler/extract-handlers.js";

export interface ValidateOptions {
  config: string;
}

export async function validate(options: ValidateOptions): Promise<void> {
  const configPath = resolve(options.config);

  console.log(`Validating ${configPath}...`);

  const loaded = await loadConfig(configPath);
  const handlers = extractHandlers(loaded);

  console.log(`Found ${handlers.length} handler(s):`);
  for (const h of handlers) {
    const matcherStr = h.matcher ? ` (matcher: ${h.matcher})` : "";
    console.log(`  ${h.event} → ${h.name}${matcherStr}`);
  }

  console.log("Config is valid.");
}
