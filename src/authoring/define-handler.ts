import type { HookEvent } from "../types/hooks.js";
import type {
  HandlerOptions,
  HookInputFor,
  HookOutputFor,
  NarrowedToolInput,
  TypedHandler,
} from "../types/mapping.js";
import { clearUndefineds } from "../utils.js";

type ToolHookEvent = "PreToolUse" | "PostToolUse";

export function defineHandler<E extends ToolHookEvent, M extends string>(
  event: E,
  options: HandlerOptions & { matcher: M },
  handler: (input: NarrowedToolInput<E, M>) => Promise<HookOutputFor<E>>,
): TypedHandler<E>;

export function defineHandler<E extends HookEvent>(
  event: E,
  options: HandlerOptions,
  handler: (input: HookInputFor<E>) => Promise<HookOutputFor<E>>,
): TypedHandler<E>;

export function defineHandler<E extends HookEvent>(
  event: E,
  handler: (input: HookInputFor<E>) => Promise<HookOutputFor<E>>,
): TypedHandler<E>;

export function defineHandler<E extends HookEvent>(
  event: E,
  ...rest: unknown[]
): TypedHandler<E> {
  const options =
    typeof rest[0] === "object" && rest[0] !== null && !Array.isArray(rest[0])
      ? (rest.shift() as HandlerOptions)
      : undefined;
  const handler = rest[0] as (input: any) => Promise<any>;

  return clearUndefineds({
    ...options,
    event,
    handler,
  });
}
