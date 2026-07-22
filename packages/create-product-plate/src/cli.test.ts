import { describe, expect, test } from 'bun:test';
import { parseCreateArguments } from './cli.ts';

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

	test('fails CI mode when required product values are absent', () => {
		expect(() => parseCreateArguments(['my-app', '--profile', 'prelaunch', '--yes'])).toThrow(
			'--name'
		);
		expect(() =>
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
			])
		).toThrow('--description');
	});

	test('rejects unknown profiles and conflicting booleans', () => {
		expect(() => parseCreateArguments(['app', '--profile', 'enterprise'])).toThrow('profile');
		expect(() => parseCreateArguments(['app', '--install', '--no-install'])).toThrow('install');
		expect(() => parseCreateArguments(['app', '--template-version', 'latest'])).toThrow('semantic');
	});
});
