import { TestBed } from '@angular/core/testing';
import { SettingsGeneratorService } from './settings-generator.service';
import type { SandboxResult } from './sandbox.service';

describe('SettingsGeneratorService', () => {
  let service: SettingsGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsGeneratorService);
  });

  it('should generate settings from a simple config', () => {
    const handler = { event: 'PreToolUse', matcher: 'Bash', handler: async () => ({}) };
    const sandbox: SandboxResult = {
      handlers: { myHandler: handler },
    };

    const settings = service.generate(sandbox);
    expect(settings).toEqual({
      hooks: {
        PreToolUse: [
          {
            matcher: 'Bash',
            hooks: [
              {
                type: 'command',
                command: 'node',
                args: ['.claude/hooks/pre-tool-use-myHandler.cjs'],
              },
            ],
          },
        ],
      },
    });
  });

  it('should handle multiple events and matchers', () => {
    const handler1 = { event: 'PreToolUse', matcher: 'Bash', handler: async () => ({}) };
    const handler2 = { event: 'PostToolUse', matcher: 'Write|Edit', handler: async () => ({}) };
    const sandbox: SandboxResult = {
      handlers: { guard: handler1, logger: handler2 },
    };

    const settings = service.generate(sandbox);
    expect(Object.keys(settings.hooks)).toEqual(['PreToolUse', 'PostToolUse']);
    expect(settings.hooks['PostToolUse'][0].matcher).toBe('Write|Edit');
  });

  it('should return empty hooks for empty handlers', () => {
    const sandbox: SandboxResult = { handlers: {}, error: 'bad code' };
    const settings = service.generate(sandbox);
    expect(settings).toEqual({ hooks: {} });
  });

  it('should handle handlers without a matcher string', () => {
    const handler = { event: 'Stop', handler: async () => ({}) };
    const sandbox: SandboxResult = {
      handlers: { onStop: handler },
    };
    const settings = service.generate(sandbox);
    expect(settings.hooks['Stop'][0].matcher).toBeUndefined();
  });
});
