export { CLAUPTAIN_HOOK_DTS } from './generated-dts';

export const STARTER_CODE = `import { defineHandler } from "clauptain-hook";

// Block dangerous rm commands
export const blockRm = defineHandler("PreToolUse",
  { matcher: "Bash" },
  async (input) => {
  if (input.tool_input.command.includes("rm ")) {
    return {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "rm commands are not allowed",
      },
    };
  }
  return {};
});
`;
