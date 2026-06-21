import type {
  BuiltinToolName,
  HookEvent,
  HookInputMap,
  ToolInputMap,
} from 'clauptain-hook/types';

export const HOOK_EVENTS: readonly HookEvent[] = [
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

export const TOOL_NAMES: readonly BuiltinToolName[] = [
  'Bash',
  'Read',
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'WebFetch',
  'WebSearch',
  'Agent',
];

export const TOOL_USE_EVENTS = new Set<HookEventName>([
  'PreToolUse',
  'PostToolUse',
  'PostToolUseFailure',
  'PermissionRequest',
  'PermissionDenied',
]);

const BASE = {
  session_id: 'playground-session-001',
  transcript_path: '/tmp/playground-transcript.jsonl',
  cwd: '/home/user/my-project',
} as const;

const TOOL_DEFAULTS: { [K in BuiltinToolName]: ToolInputMap[K] } = {
  Bash: { command: 'ls -la' },
  Read: { file_path: '/home/user/my-project/src/index.ts' },
  Write: { file_path: '/home/user/my-project/src/index.ts', content: 'console.log("hello")' },
  Edit: { file_path: '/home/user/my-project/src/index.ts', old_string: 'foo', new_string: 'bar' },
  Glob: { pattern: '**/*.ts' },
  Grep: { pattern: 'TODO', path: '/home/user/my-project/src' },
  WebFetch: { url: 'https://example.com', prompt: 'Summarize this page' },
  WebSearch: { query: 'TypeScript best practices' },
  Agent: { description: 'Research task', prompt: 'Find all TODO comments' },
};

const EVENT_DEFAULTS: { [E in HookEvent]: HookInputMap[E] } = {
  PreToolUse: {
    ...BASE,
    hook_event_name: 'PreToolUse',
    tool_name: 'Bash',
    tool_input: TOOL_DEFAULTS.Bash,
    tool_use_id: 'toolu_01ABC123',
  },
  PostToolUse: {
    ...BASE,
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: TOOL_DEFAULTS.Bash,
    tool_response: { stdout: 'total 42\ndrwxr-xr-x 5 user user 160 Jun 14 10:00 .\n' },
    tool_use_id: 'toolu_01ABC123',
    duration_ms: 150,
  },
  PostToolUseFailure: {
    ...BASE,
    hook_event_name: 'PostToolUseFailure',
    tool_name: 'Bash',
    tool_input: TOOL_DEFAULTS.Bash,
    tool_use_id: 'toolu_01ABC123',
    error: 'Command exited with status 1',
    duration_ms: 200,
  },
  PostToolBatch: {
    ...BASE,
    hook_event_name: 'PostToolBatch',
    tool_calls: [
      {
        tool_name: 'Bash',
        tool_input: { command: 'npm test' },
        tool_use_id: 'toolu_01ABC123',
        tool_response: { stdout: 'All tests passed' },
      },
    ],
  },
  PermissionRequest: {
    ...BASE,
    hook_event_name: 'PermissionRequest',
    tool_name: 'Bash',
    tool_input: TOOL_DEFAULTS.Bash,
  },
  PermissionDenied: {
    ...BASE,
    hook_event_name: 'PermissionDenied',
    tool_name: 'Bash',
    tool_input: TOOL_DEFAULTS.Bash,
    tool_use_id: 'toolu_01ABC123',
    reason: 'User denied the permission request',
  },
  UserPromptSubmit: {
    ...BASE,
    hook_event_name: 'UserPromptSubmit',
    prompt: 'Fix the bug in the login handler',
  },
  UserPromptExpansion: {
    ...BASE,
    hook_event_name: 'UserPromptExpansion',
    expansion_type: 'slash_command',
    command_name: 'review',
    command_args: '',
    prompt: 'Review the current diff for correctness',
  },
  SessionStart: {
    ...BASE,
    hook_event_name: 'SessionStart',
    source: 'startup',
    model: 'claude-sonnet-4-6',
  },
  SessionEnd: {
    ...BASE,
    hook_event_name: 'SessionEnd',
    reason: 'other',
  },
  Stop: {
    ...BASE,
    hook_event_name: 'Stop',
    stop_hook_active: false,
    last_assistant_message: 'I have completed the task.',
    background_tasks: [],
    session_crons: [],
  },
  StopFailure: {
    ...BASE,
    hook_event_name: 'StopFailure',
    error: 'rate_limit',
    error_details: 'Rate limit exceeded, please retry after 30 seconds',
  },
  SubagentStart: {
    ...BASE,
    hook_event_name: 'SubagentStart',
    agent_id: 'agent_01XYZ',
    agent_type: 'general-purpose',
  },
  SubagentStop: {
    ...BASE,
    hook_event_name: 'SubagentStop',
    stop_hook_active: false,
    agent_id: 'agent_01XYZ',
    agent_transcript_path: '/tmp/subagent-transcript.jsonl',
    agent_type: 'general-purpose',
    last_assistant_message: 'Subagent completed its task.',
    background_tasks: [],
    session_crons: [],
  },
  PreCompact: {
    ...BASE,
    hook_event_name: 'PreCompact',
    trigger: 'auto',
    custom_instructions: null,
  },
  PostCompact: {
    ...BASE,
    hook_event_name: 'PostCompact',
    trigger: 'auto',
    compact_summary:
      'User asked to fix a bug in the login handler. Changes were made to auth.ts.',
  },
  Notification: {
    ...BASE,
    hook_event_name: 'Notification',
    message: 'Task completed',
    notification_type: 'info',
  },
  Setup: {
    ...BASE,
    hook_event_name: 'Setup',
    trigger: 'init',
  },
  TeammateIdle: {
    ...BASE,
    hook_event_name: 'TeammateIdle',
    teammate_name: 'backend-agent',
    team_name: 'dev-team',
  },
  TaskCreated: {
    ...BASE,
    hook_event_name: 'TaskCreated',
    task_id: 'task_01ABC',
    task_subject: 'Fix login handler bug',
  },
  TaskCompleted: {
    ...BASE,
    hook_event_name: 'TaskCompleted',
    task_id: 'task_01ABC',
    task_subject: 'Fix login handler bug',
  },
  Elicitation: {
    ...BASE,
    hook_event_name: 'Elicitation',
    mcp_server_name: 'my-mcp-server',
    message: 'Please provide your API key',
  },
  ElicitationResult: {
    ...BASE,
    hook_event_name: 'ElicitationResult',
    mcp_server_name: 'my-mcp-server',
    action: 'accept',
    content: { api_key: 'sk-example' },
  },
  ConfigChange: {
    ...BASE,
    hook_event_name: 'ConfigChange',
    source: 'project_settings',
    file_path: '/home/user/my-project/.claude/settings.json',
  },
  InstructionsLoaded: {
    ...BASE,
    hook_event_name: 'InstructionsLoaded',
    file_path: '/home/user/my-project/CLAUDE.md',
    memory_type: 'Project',
    load_reason: 'session_start',
  },
  WorktreeCreate: {
    ...BASE,
    hook_event_name: 'WorktreeCreate',
    name: 'feature-branch',
  },
  WorktreeRemove: {
    ...BASE,
    hook_event_name: 'WorktreeRemove',
    worktree_path: '/home/user/my-project-worktrees/feature-branch',
  },
  CwdChanged: {
    ...BASE,
    hook_event_name: 'CwdChanged',
    old_cwd: '/home/user/my-project',
    new_cwd: '/home/user/my-project/src',
  },
  FileChanged: {
    ...BASE,
    hook_event_name: 'FileChanged',
    file_path: '/home/user/my-project/src/index.ts',
    event: 'change',
  },
  MessageDisplay: {
    ...BASE,
    hook_event_name: 'MessageDisplay',
    turn_id: 'turn_01ABC',
    message_id: 'msg_01XYZ',
    index: 0,
    final: true,
    delta: 'I have completed the requested changes.\n',
  },
};

export function buildEventInput(event: HookEventName, toolName?: string): Record<string, unknown> {
  const defaults = { ...EVENT_DEFAULTS[event] } as Record<string, unknown>;

  if (toolName && TOOL_USE_EVENTS.has(event) && toolName in TOOL_DEFAULTS) {
    defaults['tool_name'] = toolName;
    defaults['tool_input'] = TOOL_DEFAULTS[toolName as BuiltinToolName];
  }

  return defaults;
}