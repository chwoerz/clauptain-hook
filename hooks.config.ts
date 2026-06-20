import { defineHandler } from "clauptain-hook";

export const protectEnvFiles = defineHandler(
  "PreToolUse",
  { matcher: "Read" },
  async (input) => {
    if (input.tool_input.file_path.endsWith(".env")) {
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: "Cannot modify .env files",
        },
      };
    }
    return {};
  },
);
