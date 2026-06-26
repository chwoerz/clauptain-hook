import { TestBed } from '@angular/core/testing';
import { SandboxService, SandboxResult } from './sandbox.service';

describe('SandboxService', () => {
  let service: SandboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SandboxService);
  });

  it('should collect named handler exports', () => {
    const code = `
      const { defineHandler } = require("typed-claude-hooks");
      const myHandler = defineHandler("PreToolUse", async (input) => ({}));
      module.exports.myHandler = myHandler;
    `;
    const result = service.executeJs(code);
    expect(result.error).toBeUndefined();
    expect(result.handlers['myHandler']).toBeDefined();
    expect(result.handlers['myHandler'].event).toBe('PreToolUse');
  });

  it('should return error for syntax errors', () => {
    const result = service.executeJs('export default {{{{');
    expect(result.error).toBeDefined();
  });

  it('should match handlers by tool name', async () => {
    const code = `
      const { defineHandler } = require("typed-claude-hooks");
      const bashOnly = defineHandler("PreToolUse", { matcher: "Bash" }, async () => ({
        hookSpecificOutput: { additionalContext: "bash" },
      }));
      const writeOnly = defineHandler("PreToolUse", { matcher: "Write" }, async () => ({
        hookSpecificOutput: { additionalContext: "write" },
      }));
      module.exports.bashOnly = bashOnly;
      module.exports.writeOnly = writeOnly;
    `;
    const sandbox = service.executeJs(code);
    const results = await service.runHandlers(sandbox, 'PreToolUse', {
      hook_event_name: 'PreToolUse',
      tool_name: 'Bash',
      tool_input: { command: 'ls' },
      tool_use_id: 'test',
      session_id: 'test',
      transcript_path: '/tmp/test',
      cwd: '/tmp',
    });
    expect(results).toHaveLength(1);
    expect(results[0].handlerName).toBe('bashOnly');
  });

  it('should run a handler that denies', async () => {
    const code = `
      const { defineHandler } = require("typed-claude-hooks");
      const blockRm = defineHandler("PreToolUse", { matcher: "Bash" }, async (input) => {
        if (input.tool_input.command.includes("rm ")) {
          return {
            hookSpecificOutput: {
              hookEventName: 'PreToolUse'
              permissionDecision: "deny",
              permissionDecisionReason: "blocked",
            },
          };
        }
        return {};
      });
      module.exports.blockRm = blockRm;
    `;
    const sandbox = service.executeJs(code);
    expect(sandbox.error).toBeUndefined();

    const results = await service.runHandlers(sandbox, 'PreToolUse', {
      hook_event_name: 'PreToolUse',
      tool_name: 'Bash',
      tool_input: { command: 'rm -rf /' },
      tool_use_id: 'test',
      session_id: 'test',
      transcript_path: '/tmp/test',
      cwd: '/tmp',
    });

    expect(results).toHaveLength(1);
    expect(results[0].output).toEqual(
      expect.objectContaining({
        hookSpecificOutput: expect.objectContaining({
          permissionDecision: 'deny',
        }),
      }),
    );
  });
});
