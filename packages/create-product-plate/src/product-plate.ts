#!/usr/bin/env bun
import { formatDoctorResult, runDoctor } from './doctor.ts';
import { runUpgradeCommand } from './upgrade.ts';

const [command, ...arguments_] = process.argv.slice(2);

if (command === 'doctor') {
	const json = arguments_.includes('--json');
	const result = await runDoctor({
		cwd: process.cwd(),
		strict: arguments_.includes('--strict'),
		live: arguments_.includes('--live')
	});
	console.log(json ? JSON.stringify(result, null, 2) : formatDoctorResult(result));
	if (result.summary.failure > 0) process.exitCode = 1;
} else if (command === 'upgrade') {
	const apply = arguments_.includes('--apply');
	const check = arguments_.includes('--check');
	const manifestIndex = arguments_.indexOf('--manifest');
	if ((!apply && !check) || (apply && check)) {
		console.error('Use exactly one of upgrade --check or upgrade --apply.');
		process.exitCode = 1;
	} else {
		const result = await runUpgradeCommand({
			cwd: process.cwd(),
			apply,
			manifestSource: manifestIndex >= 0 ? arguments_[manifestIndex + 1] : undefined
		});
		if (result.upToDate) {
			console.log(`Product Plate infrastructure is current (${result.release.version}).`);
		} else {
			console.log(`Upgrade available: ${result.release.version}`);
			for (const fix of result.release.securityFixes) console.log(`Security: ${fix}`);
			for (const migration of result.release.migrations) console.log(`Migration: ${migration}`);
			console.log(`Managed updates: ${result.plan?.updates.join(', ') || 'none'}`);
			if (result.plan?.conflicts.length) {
				console.error(
					`Modified managed files were not changed: ${result.plan.conflicts.join(', ')}`
				);
				console.error('Apply the migration notes above manually, then refresh managed checksums.');
				process.exitCode = 1;
			} else if (result.applied) {
				console.log(`Applied infrastructure update ${result.release.version}.`);
			}
		}
	}
} else {
	console.log('Usage: product-plate doctor [--json] [--strict] [--live] | product-plate upgrade');
	process.exitCode = 1;
}
