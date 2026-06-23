export { TYPED_CLAUDE_HOOKS_DTS } from './generated-dts';

export const STARTER_CODE = `import { defineHandler } from "typed-claude-hooks";

// Block dangerous rm commands
export const blockRm = defineHandler("PreToolUse",
  { matcher: "Bash" },
  async (input) => {
  if (input.tool_input.command.includes("rm ")) {
    return {
      hookSpecificOutput: {
        permissionDecision: "deny",
        permissionDecisionReason: "rm commands are not allowed",
      },
    };
  }
  return {};
});
`;
