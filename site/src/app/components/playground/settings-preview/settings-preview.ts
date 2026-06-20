import { Component, inject, input, computed } from '@angular/core';
import { SandboxService } from '../../../services/sandbox.service';
import { SettingsGeneratorService } from '../../../services/settings-generator.service';
import { EditorComponent } from '../editor/editor';

@Component({
  selector: 'app-settings-preview',
  standalone: true,
  imports: [EditorComponent],
  templateUrl: './settings-preview.html',
  styleUrl: './settings-preview.scss',
})
export class SettingsPreviewComponent {
  private readonly sandbox = inject(SandboxService);
  private readonly generator = inject(SettingsGeneratorService);

  readonly code = input.required<string>();

  readonly sandboxResult = computed(() => this.sandbox.loadCode(this.code()));

  readonly error = computed(() => this.sandboxResult().error);

  readonly settingsJson = computed(() => {
    const result = this.sandboxResult();
    if (result.error) return '';
    const settings = this.generator.generate(result);
    return JSON.stringify(settings, null, 2);
  });
}
