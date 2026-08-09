import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROFILE_NAMES = ['prelaunch', 'solo-saas', 'team-saas', 'ai-saas'] as const;

type ProfileName = (typeof PROFILE_NAMES)[number];

interface ProfileArguments {
	profiles: readonly ProfileName[];
	keep: boolean;
	installBrowser: boolean;
}

export interface VerificationStep {
	label: string;
	command: string;
	args: string[];
	cwd: string;
	env?: Record<string, string>;
}

const repositoryDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const bunExecutable = process.execPath;

function isProfileName(value: string): value is ProfileName {
	return PROFILE_NAMES.some((profile) => profile === value);
}

export function parseProfileArguments(arguments_: string[]): ProfileArguments {
	const profiles: ProfileName[] = [];
	let keep = false;
	let installBrowser = true;

	for (const argument of arguments_) {
		if (argument === '--keep') {
			keep = true;
			continue;
		}
		if (argument === '--skip-browser-install') {
			installBrowser = false;
			continue;
		}
		if (argument.startsWith('--')) {
			throw new Error(`Unknown option "${argument}".`);
		}
		if (!isProfileName(argument)) {
			throw new Error(
				`Unknown profile "${argument}". Expected one of: ${PROFILE_NAMES.join(', ')}.`
			);
		}
		if (!profiles.includes(argument)) profiles.push(argument);
	}

	return {
		profiles: profiles.length > 0 ? profiles : PROFILE_NAMES,
		keep,
		installBrowser
	};
}

export function createProfileVerificationSteps(
	profileDirectory: string,
	installBrowser = false
): VerificationStep[] {
	return [
		{
			label: 'Prove frozen installation',
			command: bunExecutable,
			args: ['install', '--frozen-lockfile', '--ignore-scripts'],
			cwd: profileDirectory
		},
		...(installBrowser
			? [
					{
						label: 'Install matching Playwright Chromium',
						command: bunExecutable,
						args: ['x', 'playwright', 'install', 'chromium'],
						cwd: profileDirectory
					}
				]
			: []),
		{
			label: 'Lint',
			command: bunExecutable,
			args: ['run', 'lint'],
			cwd: profileDirectory
		},
		{
			label: 'Typecheck',
			command: bunExecutable,
			args: ['run', 'check'],
			cwd: profileDirectory
		},
		{
			label: 'Unit tests',
			command: bunExecutable,
			args: ['run', 'test:unit'],
			cwd: profileDirectory
		},
		{
			label: 'Dependency audit',
			command: bunExecutable,
			args: ['run', 'audit'],
			cwd: profileDirectory
		},
		{
			label: 'Production build',
			command: bunExecutable,
			args: ['run', 'build'],
			cwd: profileDirectory
		},
		{
			label: 'Browser smoke',
			command: bunExecutable,
			args: ['run', 'test:e2e'],
			cwd: profileDirectory,
			env: { PLAYWRIGHT_PREBUILT: 'true' }
		},
		{
			label: 'Launch doctor',
			command: bunExecutable,
			args: ['run', 'doctor', '--', '--json'],
			cwd: profileDirectory
		}
	];
}

async function runStep(step: VerificationStep) {
	console.log(`\n==> ${step.label}`);
	await new Promise<void>((resolvePromise, rejectPromise) => {
		const child = spawn(step.command, step.args, {
			cwd: step.cwd,
			env: {
				...process.env,
				NODE_OPTIONS: process.env.NODE_OPTIONS ?? '--max_old_space_size=6144',
				...step.env
			},
			stdio: 'inherit'
		});

		child.once('error', rejectPromise);
		child.once('exit', (code, signal) => {
			if (code === 0) {
				resolvePromise();
				return;
			}
			rejectPromise(
				new Error(
					`${step.label} failed${signal ? ` with signal ${signal}` : ` with exit code ${code}`}.`
				)
			);
		});
	});
}

async function verifyProfile(
	profile: ProfileName,
	temporaryDirectory: string,
	installBrowser: boolean
) {
	const profileDirectory = join(temporaryDirectory, profile);

	await runStep({
		label: `Generate ${profile}`,
		command: bunExecutable,
		args: [
			'packages/create-product-plate/src/create-product-plate.ts',
			profileDirectory,
			'--profile',
			profile,
			'--name',
			`Matrix ${profile}`,
			'--description',
			'Generated release profile.',
			'--theme',
			'neutral',
			'--template-path',
			repositoryDirectory,
			'--yes',
			'--install',
			'--no-git'
		],
		cwd: repositoryDirectory
	});

	for (const step of createProfileVerificationSteps(profileDirectory, installBrowser)) {
		await runStep(step);
	}
}

function printHelp() {
	console.log(`Verify generated Product Plate profiles sequentially.

Usage:
  bun run verify:profiles
  bun run verify:profiles -- solo-saas
  bun run verify:profiles -- prelaunch ai-saas --keep

Options:
  --keep                    Keep generated apps for inspection.
  --skip-browser-install    Reuse an already installed Playwright browser.`);
}

async function main() {
	if (process.argv.includes('--help') || process.argv.includes('-h')) {
		printHelp();
		return;
	}

	const options = parseProfileArguments(process.argv.slice(2));
	const temporaryDirectory = await mkdtemp(join(tmpdir(), 'product-plate-profiles-'));

	try {
		for (const profile of options.profiles) {
			console.log(`\n### ${profile}`);
			await verifyProfile(profile, temporaryDirectory, options.installBrowser);
		}

		console.log(`\nVerified ${options.profiles.join(', ')}.`);
	} finally {
		if (options.keep) {
			console.log(`Generated apps kept at ${temporaryDirectory}`);
		} else {
			await rm(temporaryDirectory, { recursive: true, force: true });
		}
	}
}

if (import.meta.main) {
	await main();
}
