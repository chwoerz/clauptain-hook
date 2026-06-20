import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-getting-started',
  standalone: true,
  templateUrl: './getting-started.html',
  styleUrl: './getting-started.scss',
})
export class GettingStartedComponent {
  readonly code = input.required<string>();
  readonly copiedField = signal<string | null>(null);

  copy(text: string, field: string): void {
    navigator.clipboard.writeText(text);
    this.copiedField.set(field);
    setTimeout(() => this.copiedField.set(null), 2000);
  }

  copyCode(): void {
    navigator.clipboard.writeText(this.code());
    this.copiedField.set('code');
    setTimeout(() => this.copiedField.set(null), 2000);
  }

  downloadCode(): void {
    const blob = new Blob([this.code()], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hooks.config.ts';
    a.click();
    URL.revokeObjectURL(url);
  }
}
