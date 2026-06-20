import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  effect,
  input,
  output,
} from '@angular/core';
import { CLAUPTAIN_HOOK_DTS, STARTER_CODE } from './monaco-types';

declare const require: any;

let tsDefaultsConfigured = false;
let monacoReady: Promise<void> | null = null;

function ensureMonaco(): Promise<void> {
  if (monacoReady) return monacoReady;
  monacoReady = new Promise<void>((resolve) => {
    const boot = () => {
      require.config({ paths: { vs: 'assets/monaco/vs' } });
      require(['vs/editor/editor.main'], () => resolve());
    };

    if (typeof (window as any).require !== 'undefined') {
      boot();
      return;
    }

    const script = document.createElement('script');
    script.src = 'assets/monaco/vs/loader.js';
    script.onload = boot;
    document.head.appendChild(script);
  });
  return monacoReady;
}

@Component({
  selector: 'app-editor',
  standalone: true,
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
})
export class EditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) container!: ElementRef<HTMLDivElement>;

  readonly initialCode = input<string>(STARTER_CODE);
  readonly language = input<string>('typescript');
  readonly readOnly = input<boolean>(false);
  readonly codeChange = output<string>();

  private editor: any;
  private suppressChangeEvent = false;

  constructor() {
    effect(() => {
      const code = this.initialCode();
      if (!this.editor) return;
      if (this.editor.getValue() === code) return;
      this.suppressChangeEvent = true;
      this.editor.setValue(code);
      this.suppressChangeEvent = false;
    });
  }

  ngAfterViewInit(): void {
    ensureMonaco().then(() => this.initEditor());
  }

  ngOnDestroy(): void {
    this.editor?.dispose();
  }

  setCode(code: string): void {
    this.editor?.setValue(code);
  }

  getCode(): string {
    return this.editor?.getValue() ?? '';
  }

  private initEditor(): void {
    const monaco = (window as any).monaco;
    const lang = this.language();

    if (lang === 'typescript' && !tsDefaultsConfigured) {
      tsDefaultsConfigured = true;
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        esModuleInterop: true,
        strict: true,
        allowNonTsExtensions: true,
      });

      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        CLAUPTAIN_HOOK_DTS,
        'file:///node_modules/clauptain-hook/index.d.ts',
      );
    }

    this.editor = monaco.editor.create(this.container.nativeElement, {
      value: this.initialCode(),
      language: lang,
      theme: 'vs-dark',
      minimap: { enabled: false },
      quickSuggestions: { other: true, strings: true, comments: false },
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 12 },
      tabSize: 2,
      readOnly: this.readOnly(),
    });

    this.editor.onDidChangeModelContent(() => {
      if (!this.suppressChangeEvent) {
        this.codeChange.emit(this.editor.getValue());
      }
    });
  }
}
