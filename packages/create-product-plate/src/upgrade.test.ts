import { afterEach, describe, expect, test } from 'bun:test';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	applyUpgrade,
	createManagedState,
	downloadUpgradeFiles,
	isNewerVersion,
	planUpgrade
} from './upgrade.ts';

const temporaryDirectories: Array<string> = [];

afterEach(async () => {
	await Promise.all(
		temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true }))
	);
});

describe('managed upgrades', () => {
	test('compares versions and rejects tampered release assets', async () => {
		expect(isNewerVersion('0.3.9', '0.4.0')).toBe(true);
		expect(isNewerVersion('1.0.0', '0.4.0')).toBe(false);
		await expect(
			downloadUpgradeFiles({
				schemaVersion: 1,
				version: '0.3.0',
				migrations: [],
				securityFixes: [],
				files: { 'managed.txt': { content: 'tampered', sha256: '0'.repeat(64) } }
			})
		).rejects.toThrow('Checksum mismatch');
	});

	test('updates unchanged managed files but refuses modified product files', async () => {
		const cwd = await mkdtemp(join(tmpdir(), 'product-plate-upgrade-'));
		temporaryDirectories.push(cwd);
		await mkdir(join(cwd, '.product-plate'), { recursive: true });
		await writeFile(join(cwd, 'managed.txt'), 'old managed\n');
		await writeFile(join(cwd, 'product.txt'), 'old product\n');
		const state = await createManagedState(cwd, '0.2.0', ['managed.txt', 'product.txt']);
		await writeFile(join(cwd, '.product-plate/managed-files.json'), JSON.stringify(state));
		await writeFile(join(cwd, 'product.txt'), 'founder changed this\n');

		const plan = await planUpgrade({
			cwd,
			fromVersion: '0.2.0',
			toVersion: '0.3.0',
			files: {
				'managed.txt': 'new managed\n',
				'product.txt': 'new product\n'
			}
		});

		expect(plan.updates).toEqual(['managed.txt']);
		expect(plan.conflicts).toEqual(['product.txt']);
		await applyUpgrade(plan);
		expect(await readFile(join(cwd, 'managed.txt'), 'utf8')).toBe('new managed\n');
		expect(await readFile(join(cwd, 'product.txt'), 'utf8')).toBe('founder changed this\n');
	});
});
