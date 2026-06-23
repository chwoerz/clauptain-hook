import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { resolve } from "path";
import { readFileSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { build } from "../../src/cli/build.js";

const FIXTURE_CONFIG = resolve(
  import.meta.dirname,
  "../fixtures/sample-hooks.config.ts",
);
const TMP_DIR = resolve(
  import.meta.dirname,
  "../fixtures/.tmp-generated-files",
);
const SNAPSHOT_DIR = resolve(import.meta.dirname, "__snapshots__/generated");
const SETTINGS_PATH = resolve(TMP_DIR, "settings.json");
const HOOKS_DIR = resolve(TMP_DIR, "hooks");
const MANAGED_DIR = resolve(HOOKS_DIR, "typed-claude-hooks");

function stabilize(content: string): string {
  return content
    .replace(/\/\/ .*\.tmp-[a-f0-9]+\/.+/g, "// <entry>")
    .replace(/\/\/ tests\/fixtures\/.+/g, "// <fixture>");
}

describe("generated files", () => {
  beforeAll(async () => {
    rmSync(TMP_DIR, { recursive: true, force: true });
    mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(
      SETTINGS_PATH,
      JSON.stringify({ model: "claude-sonnet-4-6" }),
    );

    await build({
      config: FIXTURE_CONFIG,
      output: SETTINGS_PATH,
      hooksDir: HOOKS_DIR,
    });
  });

  afterAll(() => {
    rmSync(TMP_DIR, { recursive: true, force: true });
  });

  describe("file snapshots", () => {
    it("preToolUse-blockDangerous.cjs", async () => {
      const content = readFileSync(
        resolve(MANAGED_DIR, "preToolUse-blockDangerous.cjs"),
        "utf-8",
      );
      await expect(stabilize(content)).toMatchFileSnapshot(
        resolve(SNAPSHOT_DIR, "preToolUse-blockDangerous.cjs"),
      );
    });

    it("stop-onStop.cjs", async () => {
      const content = readFileSync(
        resolve(MANAGED_DIR, "stop-onStop.cjs"),
        "utf-8",
      );
      await expect(stabilize(content)).toMatchFileSnapshot(
        resolve(SNAPSHOT_DIR, "stop-onStop.cjs"),
      );
    });

    it("settings.json", async () => {
      const content = readFileSync(SETTINGS_PATH, "utf-8");
      const settings = JSON.parse(content);
      const normalized = JSON.parse(
        JSON.stringify(settings, (_key, value) => {
          if (typeof value === "string" && value.includes("hooks/")) {
            return value.slice(value.indexOf("hooks/"));
          }
          return value;
        }),
      );
      await expect(
        JSON.stringify(normalized, null, 2) + "\n",
      ).toMatchFileSnapshot(resolve(SNAPSHOT_DIR, "settings.json"));
    });
  });

  describe("structural checks", () => {
    it("handler bundles are syntactically valid Node.js", () => {
      execSync(`node --check preToolUse-blockDangerous.cjs`, {
        cwd: MANAGED_DIR,
        timeout: 5000,
      });
      execSync(`node --check stop-onStop.cjs`, {
        cwd: MANAGED_DIR,
        timeout: 5000,
      });
    });

    it("handler bundles are self-contained (no runtime.cjs)", () => {
      const content = readFileSync(
        resolve(MANAGED_DIR, "preToolUse-blockDangerous.cjs"),
        "utf-8",
      );
      expect(content).toContain("process.stdin");
      expect(content).not.toContain('require("./runtime.cjs")');
    });
  });

  describe("handler execution", () => {
    it("PreToolUse handler passes through safe commands", () => {
      const payload = JSON.stringify({
        session_id: "test",
        transcript_path: "/tmp/test.jsonl",
        cwd: "/tmp",
        hook_event_name: "PreToolUse",
        tool_name: "Bash",
        tool_input: { command: "ls" },
        tool_use_id: "tu_1",
      });

      const result = execSync(
        `echo '${payload}' | node preToolUse-blockDangerous.cjs`,
        { encoding: "utf-8", cwd: MANAGED_DIR },
      );
      expect(result.trim()).toBe("");
    });

    it("Stop handler produces empty output", () => {
      const payload = JSON.stringify({
        session_id: "test",
        transcript_path: "/tmp/test.jsonl",
        cwd: "/tmp",
        hook_event_name: "Stop",
        stop_hook_active: false,
      });

      const result = execSync(`echo '${payload}' | node stop-onStop.cjs`, {
        encoding: "utf-8",
        cwd: MANAGED_DIR,
      });
      expect(result.trim()).toBe("");
    });
  });
});
