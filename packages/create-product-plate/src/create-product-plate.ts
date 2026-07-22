#!/usr/bin/env bun
import { runCreateCli } from './cli.ts';

try {
	const result = await runCreateCli(process.argv.slice(2));
	if (result) console.log(`\nCreated ${result.manifest.product.name} in ${result.destination}`);
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
}
