#!/usr/bin/env bun
import { stderr, stdout } from 'node:process';
import { Command, CommanderError, Option } from 'commander';
import { formatDoctorResult, runDoctor } from './doctor.ts';
import { GENERATOR_VERSION } from './generator.ts';
import { runUpgradeCommand } from './upgrade.ts';

export async function runProductPlateCli(arguments_: Array<string>) {
	const program = new Command()
		.name('product-plate')
		.description('Maintain and verify a generated Product Plate application.')
		.version(GENERATOR_VERSION)
		.showHelpAfterError()
		.exitOverride()
		.configureOutput({
			writeOut: (value) => stdout.write(value),
			writeErr: (value) => stderr.write(value)
		});

	program
		.command('doctor')
		.description('Check profile, configuration, content, and optional deployed services.')
		.option('--json', 'print machine-readable JSON')
		.option('--strict', 'promote launch-readiness warnings to failures')
		.option('--live', 'check deployed URLs with bounded network requests')
		.action(async (options: { json?: boolean; strict?: boolean; live?: boolean }) => {
			const result = await runDoctor({
				cwd: process.cwd(),
				strict: Boolean(options.strict),
				live: Boolean(options.live)
			});
			stdout.write(
				`${options.json ? JSON.stringify(result, null, 2) : formatDoctorResult(result)}\n`
			);
			if (result.summary.failure > 0) process.exitCode = 1;
		});

	program
		.command('upgrade')
		.description('Check or apply checksum-protected managed infrastructure updates.')
		.addOption(new Option('--check', 'show the available managed update').conflicts('apply'))
		.addOption(
			new Option('--apply', 'apply an update when no managed files conflict').conflicts('check')
		)
		.option('--manifest <source>', 'HTTPS URL or local path to a schema-v2 upgrade manifest')
		.action(async (options: { apply?: boolean; check?: boolean; manifest?: string }) => {
			if (!options.apply && !options.check) {
				throw new Error('Use exactly one of upgrade --check or upgrade --apply.');
			}
			const result = await runUpgradeCommand({
				cwd: process.cwd(),
				apply: Boolean(options.apply),
				manifestSource: options.manifest
			});
			if (result.upToDate) {
				stdout.write(`Product Plate infrastructure is current (${result.release.version}).\n`);
				return;
			}
			stdout.write(`Upgrade available: ${result.release.version}\n`);
			for (const fix of result.release.securityFixes) stdout.write(`Security: ${fix}\n`);
			for (const migration of result.release.migrations) stdout.write(`Migration: ${migration}\n`);
			stdout.write(`Managed updates: ${result.plan?.updates.join(', ') || 'none'}\n`);
			if (result.plan?.conflicts.length) {
				stderr.write(
					`Modified managed files were not changed: ${result.plan.conflicts.join(', ')}\n`
				);
				stderr.write(
					'Apply the migration notes manually or restore those files before retrying.\n'
				);
				process.exitCode = 1;
			} else if (result.applied) {
				stdout.write(`Applied infrastructure update ${result.release.version}.\n`);
				stdout.write('A recoverable snapshot is available in .product-plate/backups/.\n');
			}
		});

	if (arguments_.length === 0) {
		program.outputHelp();
		return;
	}
	try {
		await program.parseAsync(arguments_, { from: 'user' });
	} catch (error) {
		if (
			error instanceof CommanderError &&
			['commander.helpDisplayed', 'commander.version'].includes(error.code)
		) {
			return;
		}
		throw error;
	}
}

export async function main(arguments_ = process.argv.slice(2)) {
	try {
		await runProductPlateCli(arguments_);
	} catch (error) {
		if (error instanceof CommanderError) {
			process.exitCode = error.exitCode;
		} else {
			stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
			process.exitCode = 1;
		}
	}
}

if (import.meta.main) await main();
