import { describe, it, expectTypeOf } from "vitest";
import type {
  ParseMatcher,
  NarrowedToolInput,
} from "../../src/types/mapping.js";
import type {
  BashInput,
  FileWriteInput,
  FileEditInput,
} from "../../src/types/tool-inputs.js";
import type { PreToolUseHookInput } from "../../src/types/hooks.js";

describe("ParseMatcher", () => {
  it("parses a single tool name", () => {
    expectTypeOf<ParseMatcher<"Bash">>().toEqualTypeOf<"Bash">();
  });

  it("parses a union matcher", () => {
    expectTypeOf<ParseMatcher<"Write|Edit">>().toEqualTypeOf<
      "Write" | "Edit"
    >();
  });

  it("parses triple union", () => {
    expectTypeOf<ParseMatcher<"Bash|Write|Edit">>().toEqualTypeOf<
      "Bash" | "Write" | "Edit"
    >();
  });
});

describe("NarrowedToolInput", () => {
  it("narrows PreToolUse with Bash matcher", () => {
    type Result = NarrowedToolInput<"PreToolUse", "Bash">;
    expectTypeOf<Result["tool_input"]>().toEqualTypeOf<BashInput>();
    expectTypeOf<Result["tool_name"]>().toEqualTypeOf<"Bash">();
  });

  it("narrows PreToolUse with Write|Edit matcher", () => {
    type Result = NarrowedToolInput<"PreToolUse", "Write|Edit">;
    expectTypeOf<Result["tool_input"]>().toEqualTypeOf<
      FileWriteInput | FileEditInput
    >();
    expectTypeOf<Result["tool_name"]>().toEqualTypeOf<"Write" | "Edit">();
  });

  it("keeps unknown for non-builtin tool name", () => {
    type Result = NarrowedToolInput<"PreToolUse", "mcp__server__tool">;
    expectTypeOf<Result["tool_input"]>().toEqualTypeOf<unknown>();
  });
});
