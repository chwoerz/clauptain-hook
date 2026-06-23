import { Injectable } from '@angular/core';
import type { SandboxResult } from './sandbox.service';

interface SettingsHookEntry {
  type: 'command';
  command: 'node';
  args: string[];
  __managed: 'typed-claude-hooks';
}

interface SettingsMatcherEntry {
  matcher?: string;
  hooks: SettingsHookEntry[];
}

export interface GeneratedSettings {
  hooks: Record<string, SettingsMatcherEntry[]>;
}

function kebabCase(event: string): string {
  return event.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

@Injectable({ providedIn: 'root' })
export class SettingsGeneratorService {
  generate(sandbox: SandboxResult): GeneratedSettings {
    if (Object.keys(sandbox.handlers).length === 0) return { hooks: {} };

    const hooks: Record<string, SettingsMatcherEntry[]> = {};

    for (const [name, handler] of Object.entries(sandbox.handlers)) {
      const event = (handler as any).event as string;
      if (!hooks[event]) hooks[event] = [];
      hooks[event].push({
        ...(handler.matcher != null ? { matcher: handler.matcher } : {}),
        hooks: [
          {
            type: 'command' as const,
            command: 'node' as const,
            args: [`.claude/hooks/${kebabCase(event)}-${name}.cjs`],
            __managed: 'typed-claude-hooks' as const,
          },
        ],
      });
    }

    return { hooks };
  }
}
