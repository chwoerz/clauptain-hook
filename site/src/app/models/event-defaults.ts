import {
  BuiltinToolName,
  FileEditInput,
  FileWriteInput,
  HookEvent,
  HookInputFor,
  ToolInputMap
} from '../../../../src/types';

export const HOOK_EVENTS: HookEvent[] = [
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

export const TOOL_NAMES: (keyof ToolInputMap)[] = [
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

function toolInputForName<B extends BuiltinToolName>(toolName: B): ToolInputMap[BuiltinToolName] {
  switch (toolName) {
    case 'Write':
      return {
        file_path: '/home/user/my-project/src/index.ts',
        content: 'console.log("hello")'
      } satisfies FileWriteInput;
    case 'Edit':
      return {
        file_path: '/home/user/my-project/src/index.ts',
        old_string: 'foo',
        new_string: 'bar',
      } satisfies FileEditInput;
    case 'Read':
      return {file_path: '/home/user/my-project/src/index.ts'} satisfies ToolInputMap['Read'];
    case 'Glob':
      return {pattern: '**/*.ts'} satisfies ToolInputMap['Glob'];
    case 'Grep':
      return {pattern: 'TODO', path: '/home/user/my-project/src'} satisfies ToolInputMap['Grep'];
    case 'WebFetch':
      return {
        url: 'https://example.com',
        prompt: 'Summarize this page'
      } satisfies ToolInputMap['WebFetch'];
    case 'WebSearch':
      return {query: 'TypeScript best practices'} satisfies ToolInputMap['WebSearch'];
    case 'Agent':
      return {
        description: 'Research task',
        prompt: 'Find all TODO comments'
      } satisfies ToolInputMap['Agent'];
    default:
      return {command: 'ls -la'};
  }
}

export function buildEventInput<EN extends HookEventName>(event: EN, toolName?: BuiltinToolName): HookInputFor<any> {
  const tool: BuiltinToolName = toolName ?? 'Bash';
  const b = {...BASE_DEFAULTS, hook_event_name: event};

  switch (event) {
    case 'PreToolUse':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        tool_name: tool,
        tool_input: toolInputForName(tool),
        tool_use_id: 'toolu_01ABC123',
      } satisfies HookInputFor<'PreToolUse'>;
    case 'PostToolUse':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        tool_name: tool,
        tool_input: toolInputForName(tool),
        tool_response: {stdout: 'total 42\ndrwxr-xr-x 5 user user 160 Jun 14 10:00 .\n'},
        tool_use_id: 'toolu_01ABC123',
        duration_ms: 150,
      } satisfies HookInputFor<"PostToolUse">;
    case 'PostToolUseFailure':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        tool_name: tool,
        tool_input: toolInputForName(tool),
        tool_use_id: 'toolu_01ABC123',
        error: 'Command exited with status 1',
        duration_ms: 200,
      }satisfies HookInputFor<"PostToolUseFailure">;
    case 'PostToolBatch':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        tool_calls: [
          {
            tool_name: 'Bash',
            tool_input: {command: 'npm test'},
            tool_use_id: 'toolu_01ABC123',
            tool_response: {stdout: 'All tests passed'},
          },
        ],
      } satisfies HookInputFor<"PostToolBatch">;
    case 'PermissionRequest':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        tool_name: tool,
        tool_input: toolInputForName(tool),
      } satisfies HookInputFor<"PermissionRequest">;
    case 'PermissionDenied':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        tool_name: tool,
        tool_input: toolInputForName(tool),
        tool_use_id: 'toolu_01ABC123',
        reason: 'User denied the permission request',
      } satisfies HookInputFor<"PermissionDenied">;
    case 'UserPromptSubmit':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event, prompt: 'Fix the bug in the login handler'
      } satisfies HookInputFor<"UserPromptSubmit">;
    case 'UserPromptExpansion':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        expansion_type: 'slash_command',
        command_name: 'review',
        command_args: '',
        prompt: 'Review the current diff for correctness',
      } satisfies HookInputFor<"UserPromptExpansion">;
    case 'SessionStart':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event, source: 'startup', model: 'claude-sonnet-4-6'
      } satisfies HookInputFor<"SessionStart">;
    case 'SessionEnd':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event, reason: 'other'
      } satisfies HookInputFor<"SessionEnd">;
    case 'Stop':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        stop_hook_active: false,
        last_assistant_message: 'I have completed the task.',
        background_tasks: [],
        session_crons: [],
      } satisfies HookInputFor<"Stop">;
    case 'StopFailure':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        error: 'rate_limit',
        error_details: 'Rate limit exceeded, please retry after 30 seconds',
      } satisfies HookInputFor<"StopFailure">;
    case 'SubagentStart':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        agent_id: 'agent_01XYZ',
        agent_type: 'general-purpose',
      } satisfies HookInputFor<"SubagentStart">;
    case 'SubagentStop':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        stop_hook_active: false,
        agent_id: 'agent_01XYZ',
        agent_transcript_path: '/tmp/subagent-transcript.jsonl',
        agent_type: 'general-purpose',
        last_assistant_message: 'Subagent completed its task.',
        background_tasks: [],
        session_crons: [],
      } satisfies HookInputFor<"SubagentStop">;
    case 'PreCompact':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        trigger: 'auto',
        custom_instructions: null,
      } satisfies HookInputFor<"PreCompact">;
    case 'PostCompact':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        trigger: 'auto',
        compact_summary: 'User asked to fix a bug in the login handler. Changes were made to auth.ts.',
      } satisfies HookInputFor<"PostCompact">;
    case 'Notification':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        message: 'Task completed',
        notification_type: 'info'
      } satisfies HookInputFor<"Notification">;
    case 'Setup':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event, trigger: 'init'
      } satisfies HookInputFor<"Setup">;
    case 'TeammateIdle':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        teammate_name: 'backend-agent',
        team_name: 'dev-team',
      } satisfies HookInputFor<"TeammateIdle">;
    case 'TaskCreated':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        task_id: 'task_01ABC',
        task_subject: 'Fix login handler bug',
      } satisfies HookInputFor<"TaskCreated">;
    case 'TaskCompleted':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        task_id: 'task_01ABC',
        task_subject: 'Fix login handler bug',
      } satisfies HookInputFor<"TaskCompleted">;
    case 'Elicitation':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        mcp_server_name: 'my-mcp-server',
        message: 'Please provide your API key',
      } satisfies HookInputFor<"Elicitation">;
    case 'ElicitationResult':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        mcp_server_name: 'my-mcp-server',
        action: 'accept',
        content: {api_key: 'sk-example'},
      } satisfies HookInputFor<"ElicitationResult">;
    case 'ConfigChange':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        source: 'project_settings',
        file_path: '/home/user/my-project/.claude/settings.json',
      } satisfies HookInputFor<"ConfigChange">;
    case 'InstructionsLoaded':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        file_path: '/home/user/my-project/CLAUDE.md',
        memory_type: 'Project',
        load_reason: 'session_start',
      } satisfies HookInputFor<"InstructionsLoaded">;
    case 'WorktreeCreate':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        name: 'feature-branch',
      } satisfies HookInputFor<"WorktreeCreate">;
    case 'WorktreeRemove':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        worktree_path: '/home/user/my-project-worktrees/feature-branch',
      } satisfies HookInputFor<"WorktreeRemove">;
    case 'CwdChanged':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        old_cwd: '/home/user/my-project',
        new_cwd: '/home/user/my-project/src',
      } satisfies HookInputFor<"CwdChanged">;
    case 'FileChanged':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        file_path: '/home/user/my-project/src/index.ts',
        event: 'change',
      } satisfies HookInputFor<"FileChanged">;
    case 'MessageDisplay':
      return {
        ...BASE_DEFAULTS,
        hook_event_name: event,
        turn_id: 'turn_01ABC',
        message_id: 'msg_01XYZ',
        index: 0,
        final: true,
        delta: 'I have completed the requested changes.\n',
      } satisfies HookInputFor<"MessageDisplay">;
  }
}
