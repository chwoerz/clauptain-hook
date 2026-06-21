import { buildEventInput, HOOK_EVENTS, TOOL_USE_EVENTS } from './event-defaults';

describe('buildEventInput', () => {
  it('every event includes base fields', () => {
    for (const event of HOOK_EVENTS) {
      const input = buildEventInput(event);
      expect(input['session_id']).toBeDefined();
      expect(input['transcript_path']).toBeDefined();
      expect(input['cwd']).toBeDefined();
      expect(input['hook_event_name']).toBe(event);
    }
  });

  it('every event has at least one event-specific field beyond base', () => {
    const baseKeys = new Set(['session_id', 'transcript_path', 'cwd', 'hook_event_name']);
    for (const event of HOOK_EVENTS) {
      const input = buildEventInput(event);
      const extraKeys = Object.keys(input).filter((k) => !baseKeys.has(k));
      expect(extraKeys.length).toBeGreaterThan(0);
    }
  });

  it('tool-use events include tool_name and tool_input', () => {
    for (const event of HOOK_EVENTS) {
      if (!TOOL_USE_EVENTS.has(event)) continue;
      const input = buildEventInput(event);
      expect(input['tool_name']).toBeDefined();
      expect(input['tool_input']).toBeDefined();
    }
  });

  it('tool-use events vary tool_input by tool name', () => {
    const writeInput = buildEventInput('PreToolUse', 'Write');
    const writeTool = writeInput['tool_input'] as Record<string, unknown>;
    expect(writeTool['file_path']).toBeDefined();
    expect(writeTool['content']).toBeDefined();

    const editInput = buildEventInput('PreToolUse', 'Edit');
    const editTool = editInput['tool_input'] as Record<string, unknown>;
    expect(editTool['file_path']).toBeDefined();
    expect(editTool['old_string']).toBeDefined();
    expect(editTool['new_string']).toBeDefined();

    const bashInput = buildEventInput('PreToolUse', 'Bash');
    const bashTool = bashInput['tool_input'] as Record<string, unknown>;
    expect(bashTool['command']).toBeDefined();
  });
});