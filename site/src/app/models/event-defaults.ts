import type {BuiltinToolName, HookEvent, HookInputMap, ToolInputMap,} from 'typed-claude-hooks/types';

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
  Bash: {command: 'ls -la'},
  Read: {file_path: '/home/user/my-project/src/index.ts'},
  Write: {file_path: '/home/user/my-project/src/index.ts', content: 'console.log("hello")'},
  Edit: {file_path: '/home/user/my-project/src/index.ts', old_string: 'foo', new_string: 'bar'},
  Glob: {pattern: '**/*.ts'},
  Grep: {pattern: 'TODO', path: '/home/user/my-project/src'},
  WebFetch: {url: 'https://example.com', prompt: 'Summarize this page'},
  WebSearch: {query: 'TypeScript best practices'},
  Agent: {description: 'Research task', prompt: 'Find all TODO comments'},
};

type NoBase<E extends HookEvent> = Omit<HookInputMap[E], keyof typeof BASE | 'hook_event_name' | 'tool_name' | 'tool_input'>;
const EVENT_DEFAULT_CUSTOMS: { [E in HookEvent]: NoBase<E> } = {
  PreToolUse: {
    tool_use_id: 'toolu_01ABC123',
  },
  PostToolUse: {
    tool_response: {stdout: 'total 42\ndrwxr-xr-x 5 user user 160 Jun 14 10:00 .\n'},
    tool_use_id: 'toolu_01ABC123',
    duration_ms: 150,
  },
  PostToolUseFailure: {
    tool_use_id: 'toolu_01ABC123',
    error: 'Command exited with status 1',
    duration_ms: 200,
  },
  PostToolBatch: {
    tool_calls: [
      {
        tool_name: 'Bash',
        tool_input: {command: 'npm test'},
        tool_use_id: 'toolu_01ABC123',
        tool_response: {stdout: 'All tests passed'},
      },
    ],
  },
  PermissionRequest: {},
  PermissionDenied: {
    tool_use_id: 'toolu_01ABC123',
    reason: 'User denied the permission request',
  },
  UserPromptSubmit: {
    prompt: 'Fix the bug in the login handler',
  },
  UserPromptExpansion: {
    expansion_type: 'slash_command',
    command_name: 'review',
    command_args: '',
    prompt: 'Review the current diff for correctness',
  },
  SessionStart: {
    source: 'startup',
    model: 'claude-sonnet-4-6',
  },
  SessionEnd: {
    reason: 'other',
  },
  Stop: {
    stop_hook_active: false,
    last_assistant_message: 'I have completed the task.',
    background_tasks: [],
    session_crons: [],
  },
  StopFailure: {
    error: 'rate_limit',
    error_details: 'Rate limit exceeded, please retry after 30 seconds',
  },
  SubagentStart: {
    agent_id: 'agent_01XYZ',
    agent_type: 'general-purpose',
  },
  SubagentStop: {
    stop_hook_active: false,
    agent_id: 'agent_01XYZ',
    agent_transcript_path: '/tmp/subagent-transcript.jsonl',
    agent_type: 'general-purpose',
    last_assistant_message: 'Subagent completed its task.',
    background_tasks: [],
    session_crons: [],
  },
  PreCompact: {
    trigger: 'auto',
    custom_instructions: null,
  },
  PostCompact: {
    trigger: 'auto',
    compact_summary:
      'User asked to fix a bug in the login handler. Changes were made to auth.ts.',
  },
  Notification: {
    message: 'Task completed',
    notification_type: 'info',
  },
  Setup: {
    trigger: 'init',
  },
  TeammateIdle: {
    teammate_name: 'backend-agent',
    team_name: 'dev-team',
  },
  TaskCreated: {
    task_id: 'task_01ABC',
    task_subject: 'Fix login handler bug',
  },
  TaskCompleted: {
    task_id: 'task_01ABC',
    task_subject: 'Fix login handler bug',
  },
  Elicitation: {
    mcp_server_name: 'my-mcp-server',
    message: 'Please provide your API key',
  },
  ElicitationResult: {
    mcp_server_name: 'my-mcp-server',
    action: 'accept',
    content: {api_key: 'sk-example'},
  },
  ConfigChange: {
    source: 'project_settings',
    file_path: '/home/user/my-project/.claude/settings.json',
  },
  InstructionsLoaded: {
    file_path: '/home/user/my-project/CLAUDE.md',
    memory_type: 'Project',
    load_reason: 'session_start',
  },
  WorktreeCreate: {
    name: 'feature-branch',
  },
  WorktreeRemove: {
    worktree_path: '/home/user/my-project-worktrees/feature-branch',
  },
  CwdChanged: {
    old_cwd: '/home/user/my-project',
    new_cwd: '/home/user/my-project/src',
  },
  FileChanged: {
    file_path: '/home/user/my-project/src/index.ts',
    event: 'change',
  },
  MessageDisplay: {
    turn_id: 'turn_01ABC',
    message_id: 'msg_01XYZ',
    index: 0,
    final: true,
    delta: 'I have completed the requested changes.\n',
  },
};

export function buildEventInput<T extends HookEventName>(event: T, toolName?: string): HookInputMap[T] {
  const defaults = {
    ...EVENT_DEFAULT_CUSTOMS[event], ...BASE,
    hook_event_name: event,
  } as HookInputMap[T];

  if (TOOL_USE_EVENTS.has(event)) {
    const tool: BuiltinToolName = (toolName as BuiltinToolName) ?? 'Bash';
    const d = defaults as Record<string, unknown>;
    d['tool_name'] = tool;
    d['tool_input'] = TOOL_DEFAULTS[tool];
  }

  return defaults;
}
