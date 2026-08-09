import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { parseCreateArguments, resolveCreateArguments } from './cli.ts';
import { GENERATOR_VERSION } from './generator.ts';

async function runCreate(arguments_: Array<string>) {
	const child = Bun.spawn(
		[process.execPath, join(import.meta.dir, 'create-product-plate.ts'), ...arguments_],
		{ stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' }
	);
	const stdout = new Response(child.stdout).text();
	const stderr = new Response(child.stderr).text();
	return { exitCode: await child.exited, stdout: await stdout, stderr: await stderr };
}

describe('create CLI', () => {
	test('parses the supported non-interactive interface', () => {
		expect(
			parseCreateArguments([
				'my-app',
				'--profile',
				'solo-saas',
				'--name',
				'My Product',
				'--description',
				'Short product description',
				'--theme',
				'neutral',
				'--template-version',
				'0.2.0',
				'--no-install',
				'--git',
				'--yes'
			])
		).toMatchObject({
			destination: 'my-app',
			profile: 'solo-saas',
			name: 'My Product',
			description: 'Short product description',
			theme: 'neutral',
			templateVersion: '0.2.0',
			install: false,
			git: true,
			yes: true
		});
	});

	test('uses documented unattended defaults', () => {
		expect(resolveCreateArguments(parseCreateArguments(['my-app', '--yes']), false)).toMatchObject({
			destination: 'my-app',
			profile: 'prelaunch',
			name: 'my-app',
			description: 'my-app application.',
			theme: 'neutral',
			install: true
		});
		expect(
			resolveCreateArguments(parseCreateArguments(['my-app', '--yes']), false, true)
		).toMatchObject({
			git: false
		});
		expect(() =>
			resolveCreateArguments(
				parseCreateArguments([
					'my-app',
					'--profile',
					'prelaunch',
					'--name',
					'Launch List',
					'--description',
					'   ',
					'--theme',
					'neutral',
					'--yes'
				]),
				false
			)
		).toThrow('--description');
	});

	test('uses Commander help and equals-style option parsing', () => {
		expect(parseCreateArguments(['-h'])).toMatchObject({ help: true });
		expect(parseCreateArguments(['--version'])).toMatchObject({
			version: true,
			output: `${GENERATOR_VERSION}\n`
		});
		expect(
			parseCreateArguments([
				'app',
				'--profile=solo-saas',
				'--theme=claude',
				'--template-version=1.0.0-beta.1'
			])
		).toMatchObject({
			destination: 'app',
			profile: 'solo-saas',
			theme: 'claude',
			templateVersion: '1.0.0-beta.1'
		});
		expect(() => parseCreateArguments(['app', '-x'])).toThrow('unknown option');
	});

	test('prints help/version and fails fast without a TTY', async () => {
		const help = await runCreate(['-h']);
		expect(help.exitCode).toBe(0);
		expect(help.stdout).toContain('Usage: create-product-plate');
		const version = await runCreate(['--version']);
		expect(version).toMatchObject({
			exitCode: 0,
			stdout: `${GENERATOR_VERSION}\n`,
			stderr: ''
		});
		const unattended = await runCreate([]);
		expect(unattended.exitCode).toBe(1);
		expect(unattended.stderr).toContain('TTY');
	});

	test('never enters prompts without a TTY', () => {
		expect(() => resolveCreateArguments(parseCreateArguments([]), false)).toThrow('TTY');
	});

	test.each([
		'Line\nBreak',
		'Carriage\rReturn',
		'Unicode\u2028Separator',
		'Paragraph\u2029Separator'
	])('rejects line terminators in product names: %s', (name) => {
		expect(() =>
			resolveCreateArguments(parseCreateArguments(['app', '--name', name, '--yes']), false)
		).toThrow('single line');
	});

	test.each(['Null\0Byte', 'Escape\u001bCode', 'C1\u0085Control'])(
		'rejects control characters in product names: %s',
		(name) => {
			expect(() =>
				resolveCreateArguments(parseCreateArguments(['app', '--name', name, '--yes']), false)
			).toThrow('control characters');
		}
	);

	test('rejects unknown profiles and conflicting booleans', () => {
		expect(() => parseCreateArguments(['app', '--profile', 'enterprise'])).toThrow('profile');
		expect(() => parseCreateArguments(['app', '--install', '--no-install'])).toThrow('install');
		expect(() => parseCreateArguments(['app', '--template-version', 'latest'])).toThrow('semantic');
	});
});
