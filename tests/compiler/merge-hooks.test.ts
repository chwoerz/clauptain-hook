import { describe, it, expect } from "vitest";
import { mergeHooksIntoSettings } from "../../src/compiler/merge-hooks.js";
import type { BundledFile } from "../../src/compiler/bundle-handlers.js";

describe("mergeHooksIntoSettings", () => {
  const bundledFiles: BundledFile[] = [
    {
      fileName: "preToolUse-blockDangerous.cjs",
      filePath: "/project/.claude/hooks/preToolUse-blockDangerous.cjs",
      event: "PreToolUse",
      name: "blockDangerous",
      matcher: "Bash",
      timeout: undefined,
      if: undefined,
      statusMessage: undefined,
      async: undefined,
      asyncRewake: undefined,
    },
    {
      fileName: "stop-onStop.cjs",
      filePath: "/project/.claude/hooks/stop-onStop.cjs",
      event: "Stop",
      name: "onStop",
      matcher: undefined,
      timeout: undefined,
      if: undefined,
      statusMessage: undefined,
      async: undefined,
      asyncRewake: undefined,
    },
  ];

  it("generates hook entries for bundled files", () => {
    const result = mergeHooksIntoSettings({
      existingSettings: {},
      bundledFiles,
      hooksDir: "/project/.claude/hooks",
      settingsPath: "/project/.claude/settings.json",
      projectRoot: "/project",
    });

    expect(result.hooks.PreToolUse).toHaveLength(1);
    expect(result.hooks.PreToolUse[0].matcher).toBe("Bash");
    expect(result.hooks.PreToolUse[0].hooks[0].command).toBe("node");
    expect(result.hooks.PreToolUse[0].hooks[0].__managed).toBe(
      "clauptain-hook",
    );
    expect(result.hooks.Stop).toHaveLength(1);
  });

  it("preserves non-hook settings", () => {
    const result = mergeHooksIntoSettings({
      existingSettings: {
        model: "claude-sonnet-4-6",
        statusLine: { type: "command" },
      },
      bundledFiles,
      hooksDir: "/project/.claude/hooks",
      settingsPath: "/project/.claude/settings.json",
      projectRoot: "/project",
    });

    expect(result.model).toBe("claude-sonnet-4-6");
    expect(result.statusLine).toEqual({ type: "command" });
  });

  it("preserves unmanaged hooks and replaces managed ones", () => {
    const existing = {
      hooks: {
        PreToolUse: [
          {
            matcher: "Bash",
            hooks: [{ type: "command", command: "echo manual" }],
          },
          {
            matcher: "Write",
            hooks: [
              {
                type: "command",
                command: "node old.js",
                __managed: "clauptain-hook",
              },
            ],
          },
        ],
      },
    };

    const result = mergeHooksIntoSettings({
      existingSettings: existing,
      bundledFiles,
      hooksDir: "/project/.claude/hooks",
      settingsPath: "/project/.claude/settings.json",
      projectRoot: "/project",
    });

    const preToolUse = result.hooks.PreToolUse;
    const manualHook = preToolUse.find((m: any) =>
      m.hooks.some((h: any) => h.command === "echo manual"),
    );
    expect(manualHook).toBeTruthy();

    const oldManaged = preToolUse.find((m: any) =>
      m.hooks.some((h: any) => h.command === "node old.js"),
    );
    expect(oldManaged).toBeUndefined();

    const newManaged = preToolUse.find((m: any) =>
      m.hooks.some((h: any) => h.__managed === "clauptain-hook"),
    );
    expect(newManaged).toBeTruthy();
  });

  it("merges managed hooks into existing entry with same matcher", () => {
    const existing = {
      hooks: {
        PreToolUse: [
          {
            matcher: "Bash",
            hooks: [{ type: "command", command: "echo manual" }],
          },
        ],
      },
    };

    const result = mergeHooksIntoSettings({
      existingSettings: existing,
      bundledFiles,
      hooksDir: "/project/.claude/hooks",
      settingsPath: "/project/.claude/settings.json",
      projectRoot: "/project",
    });

    const preToolUse = result.hooks.PreToolUse;
    expect(preToolUse).toHaveLength(1);

    const bashEntry = preToolUse[0];
    expect(bashEntry.matcher).toBe("Bash");
    expect(bashEntry.hooks).toHaveLength(2);
    expect(bashEntry.hooks[0].command).toBe("echo manual");
    expect(bashEntry.hooks[1].__managed).toBe("clauptain-hook");
  });

  it("cleans up stale managed hooks from merged entries on rebuild", () => {
    const existing = {
      hooks: {
        PreToolUse: [
          {
            matcher: "Bash",
            hooks: [
              { type: "command", command: "echo manual" },
              {
                type: "command",
                command: "node",
                args: [".claude/hooks/preToolUse-oldHandler.cjs"],
                __managed: "clauptain-hook",
              },
            ],
          },
        ],
      },
    };

    const result = mergeHooksIntoSettings({
      existingSettings: existing,
      bundledFiles,
      hooksDir: "/project/.claude/hooks",
      settingsPath: "/project/.claude/settings.json",
      projectRoot: "/project",
    });

    const bashEntry = result.hooks.PreToolUse[0];
    expect(bashEntry.matcher).toBe("Bash");

    const managedHooks = bashEntry.hooks.filter(
      (h: any) => h.__managed === "clauptain-hook",
    );
    expect(managedHooks).toHaveLength(1);
    expect(managedHooks[0].args).toEqual([
      ".claude/hooks/preToolUse-blockDangerous.cjs",
    ]);

    const manualHooks = bashEntry.hooks.filter((h: any) => !h.__managed);
    expect(manualHooks).toHaveLength(1);
    expect(manualHooks[0].command).toBe("echo manual");
  });

  it("removes matcher entry when all hooks were managed and handler is removed", () => {
    const existing = {
      hooks: {
        PreToolUse: [
          {
            matcher: "Write",
            hooks: [
              {
                type: "command",
                command: "node",
                args: [".claude/hooks/preToolUse-oldHandler.cjs"],
                __managed: "clauptain-hook",
              },
            ],
          },
        ],
      },
    };

    const noWriteHandlers: BundledFile[] = [
      {
        fileName: "preToolUse-blockDangerous.cjs",
        filePath: "/project/.claude/hooks/preToolUse-blockDangerous.cjs",
        event: "PreToolUse",
        name: "blockDangerous",
        matcher: "Bash",
        timeout: undefined,
        if: undefined,
        statusMessage: undefined,
        async: undefined,
        asyncRewake: undefined,
      },
    ];

    const result = mergeHooksIntoSettings({
      existingSettings: existing,
      bundledFiles: noWriteHandlers,
      hooksDir: "/project/.claude/hooks",
      settingsPath: "/project/.claude/settings.json",
      projectRoot: "/project",
    });

    const writeEntry = result.hooks.PreToolUse.find(
      (m: any) => m.matcher === "Write",
    );
    expect(writeEntry).toBeUndefined();
  });

  it("includes timeout in hook entry when set", () => {
    const filesWithTimeout: BundledFile[] = [
      {
        fileName: "stop-onStop.cjs",
        filePath: "/project/.claude/hooks/stop-onStop.cjs",
        event: "Stop",
        name: "onStop",
        matcher: undefined,
        timeout: 5000,
        if: undefined,
        statusMessage: undefined,
        async: undefined,
        asyncRewake: undefined,
      },
    ];

    const result = mergeHooksIntoSettings({
      existingSettings: {},
      bundledFiles: filesWithTimeout,
      hooksDir: "/project/.claude/hooks",
      settingsPath: "/project/.claude/settings.json",
      projectRoot: "/project",
    });

    expect(result.hooks.Stop[0].hooks[0].timeout).toBe(5000);
  });

  it("omits timeout from hook entry when not set", () => {
    const result = mergeHooksIntoSettings({
      existingSettings: {},
      bundledFiles,
      hooksDir: "/project/.claude/hooks",
      settingsPath: "/project/.claude/settings.json",
      projectRoot: "/project",
    });

    expect(result.hooks.Stop[0].hooks[0]).not.toHaveProperty("timeout");
  });

  it("uses relative paths from settings.json to hooks dir", () => {
    const result = mergeHooksIntoSettings({
      existingSettings: {},
      bundledFiles,
      hooksDir: "/project/.claude/hooks",
      settingsPath: "/project/.claude/settings.json",
      projectRoot: "/project",
    });

    const hookEntry = result.hooks.PreToolUse[0].hooks[0];
    expect(hookEntry.args).toEqual([
      ".claude/hooks/preToolUse-blockDangerous.cjs",
    ]);
  });
});
