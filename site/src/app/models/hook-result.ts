export interface HookRunResult {
  handlerName: string;
  output: Record<string, unknown>;
  durationMs: number;
  error?: string;
}

export interface SimulationResult {
  eventName: string;
  toolName?: string;
  input: Record<string, unknown>;
  results: HookRunResult[];
  summary: ResultSummary;
}

export interface ResultSummary {
  decision?: 'allow' | 'deny' | 'ask' | 'defer';
  decisionReason?: string;
  additionalContext?: string;
  stopReason?: string;
  blocked: boolean;
}

export function summarizeResults(results: HookRunResult[]): ResultSummary {
  const outputs = results.filter((r) => !r.error).map((r) => r.output);

  const hookSpecific = outputs
    .map((o) => o['hookSpecificOutput'] as Record<string, unknown> | undefined)
    .filter((h) => h != null);

  const decision = hookSpecific
    .map((h) => h['permissionDecision'] as string | undefined)
    .find((d) => d != null) as ResultSummary['decision'];

  const decisionReason = hookSpecific
    .map((h) => h['permissionDecisionReason'] as string | undefined)
    .find((r) => r != null);

  const additionalContext = hookSpecific
    .map((h) => h['additionalContext'] as string | undefined)
    .filter((c) => c != null)
    .join('\n');

  const stopReason = outputs
    .map((o) => o['stopReason'] as string | undefined)
    .find((r) => r != null);

  const blocked = decision === 'deny' || outputs.some((o) => o['continue'] === false);

  return {
    decision,
    decisionReason,
    additionalContext: additionalContext || undefined,
    stopReason,
    blocked,
  };
}
