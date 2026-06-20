import { Component, signal, ViewChild } from '@angular/core';
import { EditorComponent } from './editor/editor';
import { EventSimulatorComponent } from './event-simulator/event-simulator';
import { SettingsPreviewComponent } from './settings-preview/settings-preview';
import { GettingStartedComponent } from './getting-started/getting-started';
import { STARTER_CODE } from './editor/monaco-types';

type Tab = 'simulator' | 'map' | 'sail';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [
    EditorComponent,
    EventSimulatorComponent,
    SettingsPreviewComponent,
    GettingStartedComponent,
  ],
  templateUrl: './playground.html',
  styleUrl: './playground.scss',
})
export class PlaygroundComponent {
  @ViewChild(EditorComponent) editor?: EditorComponent;

  readonly activeTab = signal<Tab>('simulator');
  readonly currentCode = signal(STARTER_CODE);

  onCodeChange(code: string): void {
    this.currentCode.set(code);
  }

  loadCode(code: string): void {
    this.currentCode.set(code);
    this.editor?.setCode(code);
  }
}
