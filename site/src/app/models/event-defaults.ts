export const HOOK_EVENTS = [
  'PreToolUse',
  'PostToolUse',
  'PostToolUseFailure',
  'PostToolBatch',
  'Notification',
  'UserPromptSubmit',
  'UserPromptExpansion',
  'SessionStart',
  'SessionEnd',
  'Stop',
  'StopFailure',
  'SubagentStart',
  'SubagentStop',
  'PreCompact',
  'PostCompact',
  'PermissionRequest',
  'PermissionDenied',
  'Setup',
  'TeammateIdle',
  'TaskCreated',
  'TaskCompleted',
  'Elicitation',
  'ElicitationResult',
  'ConfigChange',
  'InstructionsLoaded',
  'WorktreeCreate',
  'WorktreeRemove',
  'CwdChanged',
  'FileChanged',
  'MessageDisplay',
] as const;

export type HookEventName = (typeof HOOK_EVENTS)[number];

export const TOOL_NAMES = [
  'Bash',
  'Read',
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'WebFetch',
  'WebSearch',
  'Agent',
] as const;

export const TOOL_USE_EVENTS = new Set([
  'PreToolUse',
  'PostToolUse',
  'PostToolUseFailure',
  'PermissionRequest',
  'PermissionDenied',
]);

const BASE_DEFAULTS = {
  session_id: 'playground-session-001',
  transcript_path: '/tmp/playground-transcript.jsonl',
  cwd: '/home/user/my-project',
};

export function buildEventInput(event: HookEventName, toolName?: string): Record<string, unknown> {
  const base = { ...BASE_DEFAULTS, hook_event_name: event };

  switch (event) {
    case 'PreToolUse':
      return {
        ...base,
        tool_name: toolName ?? 'Bash',
        tool_input:
          toolName === 'Write'
            ? { file_path: '/home/user/my-project/src/index.ts', content: 'console.log("hello")' }
            : toolName === 'Edit'
              ? {
                  file_path: '/home/user/my-project/src/index.ts',
                  old_string: 'foo',
                  new_string: 'bar',
                }
              : { command: 'ls -la' },
        tool_use_id: 'toolu_01ABC123',
      };
    case 'PostToolUse':
      return {
        ...base,
        tool_name: toolName ?? 'Bash',
        tool_input: { command: 'ls -la' },
        tool_response: { stdout: 'total 42\ndrwxr-xr-x 5 user user 160 Jun 14 10:00 .\n' },
        tool_use_id: 'toolu_01ABC123',
        duration_ms: 150,
      };
    case 'UserPromptSubmit':
      return { ...base, prompt: 'Fix the bug in the login handler' };
    case 'SessionStart':
      return { ...base, source: 'startup', model: 'claude-opus-4-6' };
    case 'SessionEnd':
      return { ...base, reason: 'other' };
    case 'Stop':
      return {
        ...base,
        stop_hook_active: false,
        last_assistant_message: 'I have completed the task.',
        background_tasks: [],
        session_crons: [],
      };
    case 'Notification':
      return { ...base, message: 'Task completed', notification_type: 'info' };
    default:
      return base;
  }
}
