import { Component, computed, inject, input, output, signal } from '@angular/core';
import type { Scenario, ScenarioStep } from '../../../models/scenarios';
import type { HookRunResult } from '../../../models/hook-result';
import { summarizeResults } from '../../../models/hook-result';
import { SandboxService } from '../../../services/sandbox.service';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('typescript', typescript);

interface StepResult {
  step: ScenarioStep;
  results: HookRunResult[];
  decision?: string;
  context?: string;
  ran: boolean;
}

@Component({
  selector: 'app-scenario-card',
  standalone: true,
  templateUrl: './scenario-card.html',
  styleUrl: './scenario-card.scss',
})
export class ScenarioCardComponent {
  private readonly sandbox = inject(SandboxService);

  readonly scenario = input.required<Scenario>();
  readonly loadInPlayground = output<string>();

  readonly expanded = signal(false);
  readonly running = signal(false);
  readonly stepResults = signal<StepResult[]>([]);

  readonly highlightedHookCode = computed(
    () => hljs.highlight(this.scenario().hookCode, { language: 'typescript' }).value,
  );

  toggle(): void {
    this.expanded.update((v) => !v);
    if (this.expanded() && this.stepResults().length === 0) {
      this.stepResults.set(
        this.scenario().steps.map((step) => ({
          step,
          results: [],
          ran: false,
        })),
      );
    }
  }

  async runScenario(): Promise<void> {
    this.running.set(true);
    const loaded = this.sandbox.loadCode(this.scenario().hookCode);
    if (loaded.error) {
      this.running.set(false);
      return;
    }

    const newResults: StepResult[] = [];
    for (const step of this.scenario().steps) {
      const eventName = step.input['hook_event_name'] as string;
      const results = await this.sandbox.runHandlers(loaded, eventName, step.input);
      const summary = summarizeResults(results);
      newResults.push({
        step,
        results,
        decision: summary.decision,
        context: summary.additionalContext,
        ran: true,
      });
    }
    this.stepResults.set(newResults);
    this.running.set(false);
  }
}
