import { defineHandler } from "typed-claude-hooks";

export const protectGeneratedFiles = defineHandler(
  "PreToolUse",
  { matcher: "Write" },
  async (input) => {
    if (input.tool_input.file_path.includes("/generated/")) {
      return {
        hookSpecificOutput: {
          permissionDecision: "deny",
          permissionDecisionReason: "Cannot modify generated files",
        },
      };
    }
    return {};
  },
);
