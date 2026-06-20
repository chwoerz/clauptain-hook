import type { LoadedConfig } from "./load-config.js";

export interface HandlerEntry {
  event: string;
  handlerIndex: number;
  name: string;
  matcher: string | undefined;
  timeout: number | undefined;
  if: string | undefined;
  shell: "bash" | "powershell" | undefined;
  statusMessage: string | undefined;
  once: boolean | undefined;
  async: boolean | undefined;
  asyncRewake: boolean | undefined;
}

export function extractHandlers(loaded: LoadedConfig): HandlerEntry[] {
  const byEvent = Map.groupBy(
    Object.entries(loaded.handlerExports),
    ([, handler]) => handler.event,
  );

  return [...byEvent.entries()].flatMap(([event, entries]) =>
    entries.map(([name, handler], hi) => ({
      event,
      handlerIndex: hi,
      name,
      matcher: handler.matcher,
      timeout: handler.timeout,
      if: handler.if,
      shell: handler.shell,
      statusMessage: handler.statusMessage,
      once: handler.once,
      async: handler.async,
      asyncRewake: handler.asyncRewake,
    })),
  );
}
