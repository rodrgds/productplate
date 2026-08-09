#!/usr/bin/env bun
import { stderr } from 'node:process';
import { runCreateCli } from './cli.ts';

export async function main(arguments_ = process.argv.slice(2)) {
	try {
		await runCreateCli(arguments_);
	} catch (error) {
		stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
		process.exitCode = 1;
	}
}

if (import.meta.main) await main();
