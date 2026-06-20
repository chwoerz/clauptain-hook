import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  input,
  output,
} from '@angular/core';
import { CLAUPTAIN_HOOK_DTS, STARTER_CODE } from './monaco-types';

declare const require: any;

@Component({
  selector: 'app-editor',
  standalone: true,
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
})
export class EditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) container!: ElementRef<HTMLDivElement>;

  readonly initialCode = input<string>(STARTER_CODE);
  readonly codeChange = output<string>();

  private editor: any;
  private monacoLoaded = false;

  ngAfterViewInit(): void {
    this.loadMonaco();
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

  private loadMonaco(): void {
    if (this.monacoLoaded) return;

    const onGot = () => {
      require.config({ paths: { vs: 'assets/monaco/vs' } });
      require(['vs/editor/editor.main'], () => {
        this.monacoLoaded = true;
        this.initEditor();
      });
    };

    if (typeof (window as any).require !== 'undefined') {
      onGot();
      return;
    }

    const script = document.createElement('script');
    script.src = 'assets/monaco/vs/loader.js';
    script.onload = onGot;
    document.head.appendChild(script);
  }

  private initEditor(): void {
    const monaco = (window as any).monaco;

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

    this.editor = monaco.editor.create(this.container.nativeElement, {
      value: this.initialCode(),
      language: 'typescript',
      theme: 'vs-dark',
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 12 },
      tabSize: 2,
    });

    this.editor.onDidChangeModelContent(() => {
      this.codeChange.emit(this.editor.getValue());
    });
  }
}
