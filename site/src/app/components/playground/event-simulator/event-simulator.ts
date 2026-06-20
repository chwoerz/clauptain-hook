import { Component, inject, input, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, JsonPipe } from '@angular/common';
import { SandboxService } from '../../../services/sandbox.service';
import {
  HOOK_EVENTS,
  TOOL_NAMES,
  TOOL_USE_EVENTS,
  buildEventInput,
  type HookEventName,
} from '../../../models/event-defaults';
import {
  type HookRunResult,
  summarizeResults,
  type ResultSummary,
} from '../../../models/hook-result';

@Component({
  selector: 'app-event-simulator',
  standalone: true,
  imports: [FormsModule, DecimalPipe, JsonPipe],
  templateUrl: './event-simulator.html',
  styleUrl: './event-simulator.scss',
})
export class EventSimulatorComponent {
  private readonly sandbox = inject(SandboxService);

  readonly code = input.required<string>();

  readonly events = HOOK_EVENTS;
  readonly tools = TOOL_NAMES;

  selectedEvent: HookEventName = 'PreToolUse';
  selectedTool = 'Bash';
  inputJson = '';

  readonly firing = signal(false);
  readonly lastResults = signal<HookRunResult[]>([]);
  readonly lastSummary = signal<ResultSummary | null>(null);
  readonly lastError = signal<string | null>(null);

  readonly showToolPicker = computed(() => TOOL_USE_EVENTS.has(this.selectedEvent));

  constructor() {
    this.rebuildInput();
  }

  onEventChange(): void {
    this.rebuildInput();
  }

  onToolChange(): void {
    this.rebuildInput();
  }

  private rebuildInput(): void {
    const input = buildEventInput(
      this.selectedEvent,
      this.showToolPicker() ? this.selectedTool : undefined,
    );
    this.inputJson = JSON.stringify(input, null, 2);
  }

  async fire(): Promise<void> {
    this.firing.set(true);
    this.lastError.set(null);
    this.lastResults.set([]);
    this.lastSummary.set(null);

    const loaded = this.sandbox.loadCode(this.code());
    if (loaded.error) {
      this.lastError.set(loaded.error);
      this.firing.set(false);
      return;
    }

    const parsedInput = this.parseInput();
    if (!parsedInput) {
      this.firing.set(false);
      return;
    }

    const results = await this.sandbox.runHandlers(loaded, this.selectedEvent, parsedInput);
    this.lastResults.set(results);
    this.lastSummary.set(summarizeResults(results));
    this.firing.set(false);
  }

  private parseInput(): Record<string, unknown> | null {
    try {
      return JSON.parse(this.inputJson);
    } catch {
      this.lastError.set('Invalid JSON in event input');
      return null;
    }
  }
}
