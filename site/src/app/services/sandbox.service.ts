import { Injectable } from '@angular/core';
import { typescript as ts } from 'monaco-editor/esm/vs/language/typescript/lib/typescriptServices.js';
import type { HookRunResult } from '../models/hook-result';

interface Handler {
  event: string;
  matcher?: string;
  handler: (input: any) => Promise<any>;
}

export interface SandboxResult {
  handlers: Record<string, Handler>;
  error?: string;
}

export interface TranspileResult {
  code?: string;
  error?: string;
}

const TYPED_CLAUDE_HOOKS_MODULE = {
  defineHandler(
    event: string,
    optionsOrHandler: Record<string, unknown> | Function,
    maybeHandler?: Function,
  ) {
    const hasOptions = typeof optionsOrHandler === 'object';
    const options = hasOptions ? optionsOrHandler : undefined;
    const handler = hasOptions ? maybeHandler : optionsOrHandler;
    return { event, matcher: (options as any)?.matcher, handler };
  },
};

@Injectable({ providedIn: 'root' })
export class SandboxService {
  transpile(tsCode: string): TranspileResult {
    try {
      const result = ts.transpileModule(tsCode, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.CommonJS,
          esModuleInterop: true,
          strict: false,
        },
      });
      return { code: result.outputText };
    } catch (e: any) {
      return { error: e.message ?? String(e) };
    }
  }

  executeJs(jsCode: string): SandboxResult {
    try {
      const moduleObj: { exports: Record<string, any> } = { exports: {} };
      const requireFn = (name: string) => {
        if (name === 'typed-claude-hooks') return TYPED_CLAUDE_HOOKS_MODULE;
        throw new Error(`Cannot require "${name}" in browser sandbox`);
      };
      const fn = new Function('module', 'exports', 'require', jsCode);
      fn(moduleObj, moduleObj.exports, requireFn);

      const handlers: SandboxResult['handlers'] = {};
      Object.entries(moduleObj.exports)
        .filter(
          ([name, value]) =>
            name !== 'default' &&
            value &&
            typeof value === 'object' &&
            'event' in (value as object),
        )
        .forEach(([name, value]) => {
          handlers[name] = value as any;
        });

      return { handlers };
    } catch (e: any) {
      return { handlers: {}, error: e.message ?? String(e) };
    }
  }

  loadCode(tsCode: string): SandboxResult {
    const transpiled = this.transpile(tsCode);
    if (transpiled.error || !transpiled.code) {
      return { handlers: {}, error: transpiled.error ?? 'Transpilation produced no output' };
    }
    return this.executeJs(transpiled.code);
  }

  async runHandlers(
    sandbox: SandboxResult,
    eventName: string,
    input: Record<string, unknown>,
  ): Promise<HookRunResult[]> {
    const toolName = input['tool_name'] as string | undefined;
    const results: HookRunResult[] = [];

    for (const [handlerName, hook] of Object.entries(sandbox.handlers)) {
      if (hook.event !== eventName) continue;

      if (hook.matcher && toolName) {
        const patterns = hook.matcher.split('|');
        if (!patterns.includes(toolName)) continue;
      }

      const start = performance.now();
      try {
        const output = await hook.handler(input as any);
        const result = output ?? {};
        results.push({
          handlerName,
          output: result,
          durationMs: performance.now() - start,
        });
      } catch (e: any) {
        results.push({
          handlerName,
          output: {},
          durationMs: performance.now() - start,
          error: e.message ?? String(e),
        });
      }
    }

    return results;
  }
}
