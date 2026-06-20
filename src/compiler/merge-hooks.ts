import { relative } from "path";
import type { BundledFile } from "./bundle-handlers.js";
import { clearUndefineds } from "../utils.js";

export interface MergeOptions {
  existingSettings: Record<string, any>;
  bundledFiles: BundledFile[];
  projectRoot: string;
}

interface HookCommandEntry {
  type: "command";
  command: "node";
  args: string[];
  timeout?: number;
  if?: string;
  shell?: "bash" | "powershell";
  statusMessage?: string;
  once?: boolean;
  async?: boolean;
  asyncRewake?: boolean;
  __managed: "clauptain-hook";
}

interface MatcherEntry {
  matcher?: string;
  hooks: HookCommandEntry[];
}

function createHookCommandEntry(
  projectRoot: string,
  f: BundledFile,
): HookCommandEntry {
  const { fileName, filePath, event, name, matcher, ...hookOptions } = f;
  return clearUndefineds({
    type: "command" as const,
    command: "node" as const,
    args: [relative(projectRoot, filePath)],
    ...hookOptions,
    __managed: "clauptain-hook" as const,
  });
}

function buildHookEntries(
  bundledFiles: BundledFile[],
  projectRoot: string,
): Record<string, MatcherEntry[]> {
  const byEvent = Map.groupBy(bundledFiles, (f) => f.event);

  return Object.fromEntries(
    [...byEvent.entries()].map(([event, files]) => {
      const byMatcher = Map.groupBy(files, (f) => f.matcher);
      const matchers = [...byMatcher.entries()].map(
        ([matcher, matcherFiles]): MatcherEntry => ({
          ...(matcher !== undefined ? { matcher } : {}),
          hooks: matcherFiles.map((f) =>
            createHookCommandEntry(projectRoot, f),
          ),
        }),
      );
      return [event, matchers];
    }),
  );
}

function isManagedHook(hook: any): boolean {
  return hook.__managed === "clauptain-hook";
}

function matcherKey(entry: any): string | undefined {
  return entry.matcher;
}

function stripManagedFromExisting(
  existingHooks: Record<string, any[]>,
): Record<string, any[]> {
  return Object.fromEntries(
    Object.entries(existingHooks)
      .map(([event, matchers]) => {
        const cleaned = matchers
          .map((m: any) => ({
            ...m,
            hooks: (m.hooks ?? []).filter((h: any) => !isManagedHook(h)),
          }))
          .filter((m: any) => m.hooks.length > 0);
        return [event, cleaned] as const;
      })
      .filter(([, cleaned]) => cleaned.length > 0),
  );
}

function mergeByMatcher(existing: any[], managed: MatcherEntry[]): any[] {
  const managedByMatcher = new Map<string | undefined, MatcherEntry>();
  for (const entry of managed) {
    managedByMatcher.set(matcherKey(entry), entry);
  }

  const seen = new Set<string | undefined>();
  const result: any[] = [];

  for (const entry of existing) {
    const key = matcherKey(entry);
    const managedMatch = managedByMatcher.get(key);
    if (managedMatch) {
      result.push({
        ...entry,
        hooks: [...entry.hooks, ...managedMatch.hooks],
      });
      seen.add(key);
    } else {
      result.push(entry);
    }
  }

  for (const entry of managed) {
    if (!seen.has(matcherKey(entry))) {
      result.push(entry);
    }
  }

  return result;
}

export function mergeHooksIntoSettings(
  options: MergeOptions,
): Record<string, any> {
  const { existingSettings, bundledFiles, projectRoot } = options;
  const newHookEntries = buildHookEntries(bundledFiles, projectRoot);
  const cleaned = stripManagedFromExisting(existingSettings.hooks || {});

  const allEvents = [
    ...new Set([...Object.keys(cleaned), ...Object.keys(newHookEntries)]),
  ];

  const hooks = Object.fromEntries(
    allEvents.map((event) => [
      event,
      mergeByMatcher(cleaned[event] ?? [], newHookEntries[event] ?? []),
    ]),
  );

  return {
    ...existingSettings,
    hooks,
  };
}
