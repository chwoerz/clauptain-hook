import type {
  PreToolUseHookInput,
  PostToolUseHookInput,
  PostToolUseFailureHookInput,
  PostToolBatchHookInput,
  PermissionRequestHookInput,
  PermissionDeniedHookInput,
  UserPromptSubmitHookInput,
  UserPromptExpansionHookInput,
  SessionStartHookInput,
  SessionEndHookInput,
  StopHookInput,
  StopFailureHookInput,
  SubagentStartHookInput,
  SubagentStopHookInput,
  PreCompactHookInput,
  PostCompactHookInput,
  NotificationHookInput,
  SetupHookInput,
  TeammateIdleHookInput,
  TaskCreatedHookInput,
  TaskCompletedHookInput,
  ElicitationHookInput,
  ElicitationResultHookInput,
  ConfigChangeHookInput,
  InstructionsLoadedHookInput,
  WorktreeCreateHookInput,
  WorktreeRemoveHookInput,
  CwdChangedHookInput,
  FileChangedHookInput,
  MessageDisplayHookInput,
  HookEvent,
} from 'clauptain-hook/types';
import { buildEventInput, HOOK_EVENTS, type HookEventName } from './event-defaults';

function has(input: Record<string, unknown>, key: string): void {
  expect(input[key]).toBeDefined();
}

describe('buildEventInput', () => {
  it('HOOK_EVENTS matches SDK HookEvent union', () => {
    const _sdkCheck: readonly HookEvent[] = HOOK_EVENTS;
    const _localCheck: readonly HookEventName[] = HOOK_EVENTS;
    expect(_sdkCheck).toBe(HOOK_EVENTS);
    expect(_localCheck).toBe(HOOK_EVENTS);
  });

  it('PreToolUse satisfies SDK type', () => {
    const input = buildEventInput('PreToolUse');
    const _check: PreToolUseHookInput = input as PreToolUseHookInput;
    has(input, 'tool_name');
    has(input, 'tool_input');
    has(input, 'tool_use_id');
  });

  it('PostToolUse satisfies SDK type', () => {
    const input = buildEventInput('PostToolUse');
    const _check: PostToolUseHookInput = input as PostToolUseHookInput;
    has(input, 'tool_name');
    has(input, 'tool_input');
    has(input, 'tool_response');
    has(input, 'tool_use_id');
  });

  it('PostToolUseFailure satisfies SDK type', () => {
    const input = buildEventInput('PostToolUseFailure');
    const _check: PostToolUseFailureHookInput = input as PostToolUseFailureHookInput;
    has(input, 'tool_name');
    has(input, 'error');
    has(input, 'tool_use_id');
  });

  it('PostToolBatch satisfies SDK type', () => {
    const input = buildEventInput('PostToolBatch');
    const _check: PostToolBatchHookInput = input as PostToolBatchHookInput;
    has(input, 'tool_calls');
    expect(Array.isArray(input['tool_calls'])).toBe(true);
  });

  it('PermissionRequest satisfies SDK type', () => {
    const input = buildEventInput('PermissionRequest');
    const _check: PermissionRequestHookInput = input as PermissionRequestHookInput;
    has(input, 'tool_name');
    has(input, 'tool_input');
  });

  it('PermissionDenied satisfies SDK type', () => {
    const input = buildEventInput('PermissionDenied');
    const _check: PermissionDeniedHookInput = input as PermissionDeniedHookInput;
    has(input, 'tool_name');
    has(input, 'tool_use_id');
    has(input, 'reason');
  });

  it('UserPromptSubmit satisfies SDK type', () => {
    const input = buildEventInput('UserPromptSubmit');
    const _check: UserPromptSubmitHookInput = input as UserPromptSubmitHookInput;
    has(input, 'prompt');
  });

  it('UserPromptExpansion satisfies SDK type', () => {
    const input = buildEventInput('UserPromptExpansion');
    const _check: UserPromptExpansionHookInput = input as UserPromptExpansionHookInput;
    has(input, 'expansion_type');
    has(input, 'command_name');
    has(input, 'command_args');
    has(input, 'prompt');
  });

  it('SessionStart satisfies SDK type', () => {
    const input = buildEventInput('SessionStart');
    const _check: SessionStartHookInput = input as SessionStartHookInput;
    expect(input['source']).toBe('startup');
  });

  it('SessionEnd satisfies SDK type', () => {
    const input = buildEventInput('SessionEnd');
    const _check: SessionEndHookInput = input as SessionEndHookInput;
    has(input, 'reason');
  });

  it('Stop satisfies SDK type', () => {
    const input = buildEventInput('Stop');
    const _check: StopHookInput = input as StopHookInput;
    expect(input['stop_hook_active']).toBe(false);
  });

  it('StopFailure satisfies SDK type', () => {
    const input = buildEventInput('StopFailure');
    const _check: StopFailureHookInput = input as StopFailureHookInput;
    has(input, 'error');
  });

  it('SubagentStart satisfies SDK type', () => {
    const input = buildEventInput('SubagentStart');
    const _check: SubagentStartHookInput = input as SubagentStartHookInput;
    has(input, 'agent_id');
    has(input, 'agent_type');
  });

  it('SubagentStop satisfies SDK type', () => {
    const input = buildEventInput('SubagentStop');
    const _check: SubagentStopHookInput = input as SubagentStopHookInput;
    has(input, 'agent_id');
    has(input, 'agent_type');
    has(input, 'agent_transcript_path');
    expect(input['stop_hook_active']).toBe(false);
  });

  it('PreCompact satisfies SDK type', () => {
    const input = buildEventInput('PreCompact');
    const _check: PreCompactHookInput = input as PreCompactHookInput;
    has(input, 'trigger');
    expect(input['custom_instructions']).toBeNull();
  });

  it('PostCompact satisfies SDK type', () => {
    const input = buildEventInput('PostCompact');
    const _check: PostCompactHookInput = input as PostCompactHookInput;
    has(input, 'trigger');
    has(input, 'compact_summary');
  });

  it('Notification satisfies SDK type', () => {
    const input = buildEventInput('Notification');
    const _check: NotificationHookInput = input as NotificationHookInput;
    has(input, 'message');
    has(input, 'notification_type');
  });

  it('Setup satisfies SDK type', () => {
    const input = buildEventInput('Setup');
    const _check: SetupHookInput = input as SetupHookInput;
    has(input, 'trigger');
  });

  it('TeammateIdle satisfies SDK type', () => {
    const input = buildEventInput('TeammateIdle');
    const _check: TeammateIdleHookInput = input as TeammateIdleHookInput;
    has(input, 'teammate_name');
    has(input, 'team_name');
  });

  it('TaskCreated satisfies SDK type', () => {
    const input = buildEventInput('TaskCreated');
    const _check: TaskCreatedHookInput = input as TaskCreatedHookInput;
    has(input, 'task_id');
    has(input, 'task_subject');
  });

  it('TaskCompleted satisfies SDK type', () => {
    const input = buildEventInput('TaskCompleted');
    const _check: TaskCompletedHookInput = input as TaskCompletedHookInput;
    has(input, 'task_id');
    has(input, 'task_subject');
  });

  it('Elicitation satisfies SDK type', () => {
    const input = buildEventInput('Elicitation');
    const _check: ElicitationHookInput = input as ElicitationHookInput;
    has(input, 'mcp_server_name');
    has(input, 'message');
  });

  it('ElicitationResult satisfies SDK type', () => {
    const input = buildEventInput('ElicitationResult');
    const _check: ElicitationResultHookInput = input as ElicitationResultHookInput;
    has(input, 'mcp_server_name');
    has(input, 'action');
  });

  it('ConfigChange satisfies SDK type', () => {
    const input = buildEventInput('ConfigChange');
    const _check: ConfigChangeHookInput = input as ConfigChangeHookInput;
    has(input, 'source');
  });

  it('InstructionsLoaded satisfies SDK type', () => {
    const input = buildEventInput('InstructionsLoaded');
    const _check: InstructionsLoadedHookInput = input as InstructionsLoadedHookInput;
    has(input, 'file_path');
    has(input, 'memory_type');
    has(input, 'load_reason');
  });

  it('WorktreeCreate satisfies SDK type', () => {
    const input = buildEventInput('WorktreeCreate');
    const _check: WorktreeCreateHookInput = input as WorktreeCreateHookInput;
    has(input, 'name');
  });

  it('WorktreeRemove satisfies SDK type', () => {
    const input = buildEventInput('WorktreeRemove');
    const _check: WorktreeRemoveHookInput = input as WorktreeRemoveHookInput;
    has(input, 'worktree_path');
  });

  it('CwdChanged satisfies SDK type', () => {
    const input = buildEventInput('CwdChanged');
    const _check: CwdChangedHookInput = input as CwdChangedHookInput;
    has(input, 'old_cwd');
    has(input, 'new_cwd');
  });

  it('FileChanged satisfies SDK type', () => {
    const input = buildEventInput('FileChanged');
    const _check: FileChangedHookInput = input as FileChangedHookInput;
    has(input, 'file_path');
    has(input, 'event');
  });

  it('MessageDisplay satisfies SDK type', () => {
    const input = buildEventInput('MessageDisplay');
    const _check: MessageDisplayHookInput = input as MessageDisplayHookInput;
    has(input, 'turn_id');
    has(input, 'message_id');
    has(input, 'index');
    has(input, 'final');
    has(input, 'delta');
  });

  it('every event includes base fields', () => {
    for (const event of HOOK_EVENTS) {
      const input = buildEventInput(event);
      has(input, 'session_id');
      has(input, 'transcript_path');
      has(input, 'cwd');
      expect(input['hook_event_name']).toBe(event);
    }
  });

  it('tool-use events vary tool_input by tool name', () => {
    const writeInput = buildEventInput('PreToolUse', 'Write');
    const writeTool = writeInput['tool_input'] as Record<string, unknown>;
    has(writeTool, 'file_path');
    has(writeTool, 'content');

    const editInput = buildEventInput('PreToolUse', 'Edit');
    const editTool = editInput['tool_input'] as Record<string, unknown>;
    has(editTool, 'file_path');
    has(editTool, 'old_string');
    has(editTool, 'new_string');

    const bashInput = buildEventInput('PreToolUse', 'Bash');
    const bashTool = bashInput['tool_input'] as Record<string, unknown>;
    has(bashTool, 'command');
  });
});