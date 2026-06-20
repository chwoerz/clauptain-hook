import { defineHandler } from "clauptain-hook";

export const protectGeneratedFiles = defineHandler(
  "PreToolUse",
  { matcher: "Write" },
  async (input) => {
    if (input.tool_input.file_path.includes("/generated/")) {
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: "Cannot modify generated files",
        },
      };
    }
    return {};
  },
);
