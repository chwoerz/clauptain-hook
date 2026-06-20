import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolve } from "path";
import {
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
  rmSync,
} from "fs";
import { build } from "../../src/cli/build.js";

const FIXTURE_CONFIG = resolve(
  import.meta.dirname,
  "../fixtures/sample-hooks.config.ts",
);
const TMP_DIR = resolve(import.meta.dirname, "../fixtures/.tmp-integration");
const SETTINGS_PATH = resolve(TMP_DIR, "settings.json");
const HOOKS_DIR = resolve(TMP_DIR, "hooks");
const MANAGED_DIR = resolve(HOOKS_DIR, "clauptain-hook");

describe("build command", () => {
  beforeEach(() => {
    rmSync(TMP_DIR, { recursive: true, force: true });
    mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(
      SETTINGS_PATH,
      JSON.stringify({ model: "claude-sonnet-4-6" }),
    );
  });

  afterEach(() => {
    rmSync(TMP_DIR, { recursive: true, force: true });
  });

  it("compiles handlers and merges settings.json", async () => {
    await build({
      config: FIXTURE_CONFIG,
      output: SETTINGS_PATH,
      hooksDir: HOOKS_DIR,
    });

    expect(existsSync(resolve(MANAGED_DIR, "runtime.cjs"))).toBe(false);
    expect(
      existsSync(resolve(MANAGED_DIR, "preToolUse-blockDangerous.cjs")),
    ).toBe(true);
    expect(existsSync(resolve(MANAGED_DIR, "stop-onStop.cjs"))).toBe(true);

    const settings = JSON.parse(readFileSync(SETTINGS_PATH, "utf-8"));
    expect(settings.model).toBe("claude-sonnet-4-6");
    expect(settings.hooks.PreToolUse).toHaveLength(1);
    expect(settings.hooks.PreToolUse[0].matcher).toBe("Bash");
    expect(settings.hooks.PreToolUse[0].hooks[0].__managed).toBe(
      "clauptain-hook",
    );
    expect(settings.hooks.Stop).toHaveLength(1);
  });

  it("removes stale managed hook files", async () => {
    mkdirSync(MANAGED_DIR, { recursive: true });
    writeFileSync(
      resolve(MANAGED_DIR, "preToolUse-oldHandler.cjs"),
      "console.log('stale');",
    );
    writeFileSync(
      resolve(HOOKS_DIR, "preToolUse-userManual.cjs"),
      "console.log('keep me');",
    );

    await build({
      config: FIXTURE_CONFIG,
      output: SETTINGS_PATH,
      hooksDir: HOOKS_DIR,
    });

    expect(
      existsSync(resolve(MANAGED_DIR, "preToolUse-oldHandler.cjs")),
    ).toBe(false);
    expect(existsSync(resolve(HOOKS_DIR, "preToolUse-userManual.cjs"))).toBe(
      true,
    );
    expect(
      existsSync(resolve(MANAGED_DIR, "preToolUse-blockDangerous.cjs")),
    ).toBe(true);
  });

  it("compiled handler executes correctly via Node.js", async () => {
    await build({
      config: FIXTURE_CONFIG,
      output: SETTINGS_PATH,
      hooksDir: HOOKS_DIR,
    });

    const { execSync } = await import("child_process");
    const stdinPayload = JSON.stringify({
      session_id: "test",
      transcript_path: "/tmp/test.jsonl",
      cwd: "/tmp",
      hook_event_name: "PreToolUse",
      tool_name: "Bash",
      tool_input: { command: "ls" },
      tool_use_id: "tu_1",
    });

    const result = execSync(
      `echo '${stdinPayload}' | node ${resolve(MANAGED_DIR, "preToolUse-blockDangerous.cjs")}`,
      { encoding: "utf-8", cwd: MANAGED_DIR },
    );

    expect(result.trim()).toBe("");
  });
});
