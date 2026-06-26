export interface ScenarioStep {
  label: string;
  description: string;
  input: Record<string, unknown>;
  expectedDecision?: 'allow' | 'deny';
  expectedContext?: string;
}

export interface Scenario {
  id: string;
  title: string;
  tagline: string;
  hookCode: string;
  steps: ScenarioStep[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'block-rm',
    title: 'Block dangerous rm commands',
    tagline: 'Deny any Bash command containing rm',
    hookCode: `import { defineHandler } from "typed-claude-hooks";

export const blockRm = defineHandler("PreToolUse", { matcher: "Bash" }, async (input) => {
  if (input.tool_input.command.includes("rm ")) {
    return {
      hookSpecificOutput: {
        permissionDecision: "deny",
        permissionDecisionReason: "No rm allowed, ye scurvy dog!",
      },
    };
  }
  return {};
});

`,
    steps: [
      {
        label: 'Claude runs a safe command',
        description: 'Claude wants to list files — the hook allows it.',
        input: {
          hook_event_name: 'PreToolUse',
          tool_name: 'Bash',
          tool_input: { command: 'ls -la' },
          tool_use_id: 'toolu_safe',
          session_id: 'demo',
          transcript_path: '/tmp/demo.jsonl',
          cwd: '/home/user/project',
        },
        expectedDecision: 'allow',
      },
      {
        label: 'Claude tries rm -rf /',
        description: 'Claude attempts a dangerous rm command — the hook blocks it!',
        input: {
          hook_event_name: 'PreToolUse',
          tool_name: 'Bash',
          tool_input: { command: 'rm -rf /' },
          tool_use_id: 'toolu_danger',
          session_id: 'demo',
          transcript_path: '/tmp/demo.jsonl',
          cwd: '/home/user/project',
        },
        expectedDecision: 'deny',
      },
    ],
  },
  {
    id: 'guard-env',
    title: 'Protect .env files',
    tagline: 'Block any writes to .env files',
    hookCode: `import { defineHandler } from "typed-claude-hooks";

export const protectEnv = defineHandler("PreToolUse", { matcher: "Write" }, async (input) => {
  if (input.tool_input.file_path.endsWith(".env")) {
    return {
      hookSpecificOutput: {
        permissionDecision: "deny",
        permissionDecisionReason: "The treasure map (.env) is sacred!",
      },
    };
  }
  return {};
});

`,
    steps: [
      {
        label: 'Claude writes a normal file',
        description: 'Claude writes to index.ts — the hook allows it.',
        input: {
          hook_event_name: 'PreToolUse',
          tool_name: 'Write',
          tool_input: { file_path: '/project/src/index.ts', content: 'export {}' },
          tool_use_id: 'toolu_write_ok',
          session_id: 'demo',
          transcript_path: '/tmp/demo.jsonl',
          cwd: '/project',
        },
        expectedDecision: 'allow',
      },
      {
        label: 'Claude tries to write .env',
        description: 'Claude attempts to modify the .env file — blocked!',
        input: {
          hook_event_name: 'PreToolUse',
          tool_name: 'Write',
          tool_input: { file_path: '/project/.env', content: 'SECRET=exposed' },
          tool_use_id: 'toolu_write_env',
          session_id: 'demo',
          transcript_path: '/tmp/demo.jsonl',
          cwd: '/project',
        },
        expectedDecision: 'deny',
      },
    ],
  },
  {
    id: 'captains-log',
    title: 'Add execution context',
    tagline: 'Add context after every Bash command',
    hookCode: `import { defineHandler } from "typed-claude-hooks";

export const captainsLog = defineHandler("PostToolUse", { matcher: "Bash" }, async (input) => {
  return {
    hookSpecificOutput: {
      additionalContext: "Command executed successfully. Remember to check for side effects.",
    },
  };
});

`,
    steps: [
      {
        label: 'Claude runs a Bash command',
        description: 'Claude runs git status — the hook adds context to the model.',
        input: {
          hook_event_name: 'PostToolUse',
          tool_name: 'Bash',
          tool_input: { command: 'git status' },
          tool_response: { stdout: 'On branch main\nnothing to commit' },
          tool_use_id: 'toolu_git',
          session_id: 'demo',
          transcript_path: '/tmp/demo.jsonl',
          cwd: '/project',
          duration_ms: 85,
        },
        expectedContext:
          "Command executed successfully. Remember to check for side effects.",
      },
    ],
  },
];
