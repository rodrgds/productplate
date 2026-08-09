import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';

async function run(arguments_: Array<string>) {
	const child = Bun.spawn(
		[process.execPath, join(import.meta.dir, 'product-plate.ts'), ...arguments_],
		{
			stdout: 'pipe',
			stderr: 'pipe'
		}
	);
	const stdout = new Response(child.stdout).text();
	const stderr = new Response(child.stderr).text();
	return { exitCode: await child.exited, stdout: await stdout, stderr: await stderr };
}

describe('product maintenance CLI', () => {
	test('can be imported without executing either binary', async () => {
		const previousExitCode = process.exitCode;
		const [{ main: createMain }, { main: productMain }] = await Promise.all([
			import('./create-product-plate.ts'),
			import('./product-plate.ts')
		]);
		expect(createMain).toBeFunction();
		expect(productMain).toBeFunction();
		expect(process.exitCode).toBe(previousExitCode);
	});

	test('provides strict top-level and subcommand help', async () => {
		const topLevel = await run(['--help']);
		expect(topLevel.exitCode).toBe(0);
		expect(topLevel.stdout).toContain('doctor');
		expect(topLevel.stdout).toContain('upgrade');

		const doctor = await run(['doctor', '--help']);
		expect(doctor.exitCode).toBe(0);
		expect(doctor.stdout).toContain('--strict');
		expect(doctor.stderr).toBe('');
	});

	test('rejects unknown commands and options', async () => {
		const command = await run(['unknown']);
		expect(command.exitCode).toBe(1);
		expect(command.stderr).toContain('unknown command');

		const option = await run(['doctor', '--definitely-unknown']);
		expect(option.exitCode).toBe(1);
		expect(option.stderr).toContain('unknown option');
	});

	test('requires a manifest value before running an upgrade', async () => {
		const result = await run(['upgrade', '--check', '--manifest']);
		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain('argument missing');
	});
});
