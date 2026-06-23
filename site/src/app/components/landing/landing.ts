import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class LandingComponent {
  readonly copied = signal(false);
  readonly activeTab = signal<Record<string, 'raw' | 'typed'>>({});

  selectTab(feature: string, tab: 'raw' | 'typed'): void {
    this.activeTab.update((tabs) => ({ ...tabs, [feature]: tab }));
  }

  getTab(feature: string): 'raw' | 'typed' {
    return this.activeTab()[feature] ?? 'typed';
  }

  readonly rawTypeSafety = [
    `<span class="cm">#!/usr/bin/env node</span>`,
    `<span class="kw">const</span> <span class="pr">data</span> = <span class="fn">require</span>(<span class="str">'fs'</span>).<span class="fn">readFileSync</span>(<span class="str">'/dev/stdin'</span>, <span class="str">'utf8'</span>);`,
    `<span class="kw">const</span> <span class="pr">input</span> = <span class="fn">JSON</span>.<span class="fn">parse</span>(<span class="pr">data</span>);`,
    ``,
    `<span class="cm">// no types — typo in field name? silent bug</span>`,
    `<span class="kw">if</span> (<span class="pr">input</span>.<span class="pr">tool_input</span>.<span class="pr raw-typo">comand</span>.<span class="fn">includes</span>(<span class="str">'rm -rf'</span>)) {`,
    `  <span class="pr">process</span>.<span class="pr">stdout</span>.<span class="fn">write</span>(`,
    `    <span class="fn">JSON</span>.<span class="fn">stringify</span>({ <span class="pr">decision</span>: <span class="str">'deny'</span> })`,
    `  );`,
    `}`,
  ].join('\n');

  readonly rawNarrowing = [
    `<span class="cm">#!/usr/bin/env node</span>`,
    `<span class="kw">const</span> <span class="pr">data</span> = <span class="fn">require</span>(<span class="str">'fs'</span>).<span class="fn">readFileSync</span>(<span class="str">'/dev/stdin'</span>, <span class="str">'utf8'</span>);`,
    `<span class="kw">const</span> <span class="pr">input</span> = <span class="fn">JSON</span>.<span class="fn">parse</span>(<span class="pr">data</span>);`,
    `<span class="kw">const</span> <span class="pr">path</span> = <span class="pr">input</span>.<span class="pr">tool_input</span>.<span class="pr">file_path</span>  <span class="cm">// hope it exists?</span>`,
    `<span class="kw">const</span> <span class="pr">content</span> = <span class="pr">input</span>.<span class="pr">tool_input</span>.<span class="pr">content</span> <span class="cm">// string? object?</span>`,
  ].join('\n');

  readonly rawTesting = [
    `<span class="kw">const</span> { <span class="pr">execSync</span> } = <span class="fn">require</span>(<span class="str">'child_process'</span>);`,
    ``,
    `<span class="fn">it</span>(<span class="str">'blocks rm -rf'</span>, () =&gt; {`,
    `  <span class="kw">const</span> <span class="pr">out</span> = <span class="fn">execSync</span>(`,
    `    <span class="str">'echo \\'{\"tool_input\":{\"command\":\"rm -rf /\"}}\\'</span>`,
    `    <span class="str">  | node ./hooks/block-rm.js'</span>`,
    `  );`,
    `  <span class="fn">expect</span>(<span class="fn">JSON</span>.<span class="fn">parse</span>(<span class="pr">out</span>)).<span class="fn">toEqual</span>(`,
    `    { <span class="pr">decision</span>: <span class="str">'deny'</span> }`,
    `  );`,
    `});`,
  ].join('\n');

  readonly rawSettingsGen = [
    `<span class="cm">// .claude/settings.json — edited by hand</span>`,
    `{`,
    `  <span class="pr">"hooks"</span>: {`,
    `    <span class="pr">"PreToolUse"</span>: [{`,
    `      <span class="pr">"matcher"</span>: <span class="str">"Bash"</span>,`,
    `      <span class="pr">"hooks"</span>: [{`,
    `        <span class="pr">"type"</span>: <span class="str">"command"</span>,`,
    `        <span class="pr">"command"</span>: <span class="str">"cat | node ./hooks/block-rm.js"</span>`,
    `      }]`,
    `    }]`,
    `  }`,
    `}`,
  ].join('\n');

  readonly featureTypeSafety = [
    `<span class="kw">export const</span> <span class="pr">guard</span> = <span class="fn">defineHandler</span>(`,
    `  <span class="str">"PreToolUse"</span>,`,
    `  { <span class="pr">matcher</span>: <span class="str">"Bash"</span> },`,
    `  (<span class="pr">input</span>) =&gt; {`,
    `    <span class="pr">input</span>.<span class="pr">tool_input</span>.<span class="ide-anchor"><span class="ide-cursor"></span><span class="ide-autocomplete"><span class="ide-ac-row selected"><span class="ide-ac-icon"></span><span class="ide-ac-label">command</span><span class="ide-ac-type">string</span></span><span class="ide-ac-row"><span class="ide-ac-icon"></span><span class="ide-ac-label">timeout</span><span class="ide-ac-type">number</span></span><span class="ide-ac-row"><span class="ide-ac-icon"></span><span class="ide-ac-label">description</span><span class="ide-ac-type">string</span></span></span></span>`,
    ``,
    `    <span class="kw">if</span> (<span class="pr">input</span>.<span class="pr">tool_input</span>.<span class="pr">command</span>.<span class="fn">includes</span>(<span class="str">'rm -rf'</span>)) {`,
    `      <span class="kw">return</span> { <span class="pr">decision</span>: <span class="str">'deny'</span> };`,
    `    }`,
    `  }`,
    `);`,
  ].join('\n');

  readonly featureNarrowing = [
    `<span class="kw">export const</span> <span class="pr">guard</span> = <span class="fn">defineHandler</span>(`,
    `  <span class="str">"PreToolUse"</span>,`,
    `  { <span class="pr">matcher</span>: <span class="str">"Write"</span> },`,
    `  (<span class="pr">input</span>) =&gt; {`,
    `    <span class="kw">const</span> <span class="pr">path</span> = <span class="pr">input</span>.<span class="pr ide-anchor">tool_input<span class="ide-tooltip"><span class="ide-tt-line"><span class="ide-tt-dim">(property)</span> <span class="pr">tool_input</span>: <span class="ty">FileWriteInput</span></span><span class="ide-tt-line"><span class="ide-tt-dim">{ file_path: string, content: string }</span></span></span></span>.<span class="pr">file_path</span>`,
    `    <span class="kw">const</span> <span class="pr">data</span> = <span class="pr">input</span>.<span class="pr">tool_input</span>.<span class="pr">content</span>`,
    ``,
    `  }`,
    `);`,
  ].join('\n');

  readonly featureTesting = [
    `<span class="kw">import</span> { <span class="fn">testHandler</span> } <span class="kw">from</span> <span class="str">'typed-claude-hooks/test'</span>;`,
    `<span class="kw">import</span> <span class="pr">handler</span> <span class="kw">from</span> <span class="str">'./block-rm'</span>;`,
    ``,
    `<span class="fn">it</span>(<span class="str">'blocks rm -rf'</span>, <span class="kw">async</span> () =&gt; {`,
    `  <span class="kw">const</span> <span class="pr">result</span><span class="ide-inlay">: PreToolUseOutput</span> = <span class="kw">await</span> <span class="fn">testHandler</span>(<span class="pr">handler</span>, {`,
    `    <span class="pr ide-anchor">command<span class="ide-tooltip"><span class="ide-tt-line"><span class="ide-tt-dim">(property)</span> <span class="pr">command</span>: <span class="ty">string</span></span></span></span>: <span class="str">'rm -rf /'</span>,`,
    `  });`,
    `  <span class="fn">expect</span>(<span class="pr">result</span>.<span class="pr">decision</span>).<span class="fn">toBe</span>(<span class="str">'deny'</span>);`,
    `});`,
  ].join('\n');

  readonly featureSettingsGen = [
    `<span class="term-prompt">$</span> npx typed-claude-hooks`,
    ``,
    `<span class="term-ok">✓</span> Found 3 handlers`,
    `<span class="term-ok">✓</span> Generated .claude/settings.json`,
    `  <span class="term-dim">→</span> PreToolUse: block-rm, audit-writes`,
    `  <span class="term-dim">→</span> PostToolUse: log-results`,
  ].join('\n');

  copyInstall(): void {
    navigator.clipboard.writeText('npm install typed-claude-hooks');
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
