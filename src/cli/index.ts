#!/usr/bin/env node
import { Command } from "commander";
import { build } from "./build.js";
import { validate } from "./validate.js";
import { init } from "./init.js";

function run(fn: (...args: any[]) => Promise<void>): (...args: any[]) => void {
  return (...args) => {
    fn(...args).catch((err: any) => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
  };
}

const program = new Command();

program
  .name("clauptain-hook")
  .description("Type-safe Claude Code hooks in TypeScript")
  .version("0.1.0");

program
  .command("build")
  .description("Compile hooks and merge into settings.json")
  .argument("[config]", "Path to config file", "hooks.config.ts")
  .requiredOption("-o, --output <path>", "Path to output settings.json")
  .option("--hooks-dir <dir>", "Where to write compiled JS files")
  .option("--dry-run", "Print output without writing", false)
  .option("--clean", "Remove generated files before building", false)
  .action(
    run((config: string, opts: any) =>
      build({
        config,
        output: opts.output,
        hooksDir: opts.hooksDir,
        dryRun: opts.dryRun,
        clean: opts.clean,
      }),
    ),
  );

program
  .command("validate")
  .description("Validate a hooks config without building")
  .argument("[config]", "Path to config file", "hooks.config.ts")
  .action(run((config: string) => validate({ config })));

program
  .command("init")
  .description("Create a starter hooks config")
  .option("-o, --output <path>", "Target settings.json path")
  .action(run((opts: any) => init({ output: opts.output })));

program.parse();
