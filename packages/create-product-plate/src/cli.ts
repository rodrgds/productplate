import { existsSync } from 'node:fs';
import { basename, dirname, parse, resolve } from 'node:path';
import { stdin, stdout } from 'node:process';
import { cancel, confirm, intro, isCancel, log, outro, select, text } from '@clack/prompts';
import { Command, CommanderError, Option } from 'commander';
import { z } from 'zod';
import { generateProject, GENERATOR_VERSION, slugify } from './generator.ts';
import {
	profiles,
	productNameSchema,
	semanticVersionSchema,
	themes,
	type GenerateProjectOptions,
	type ProductProfile,
	type ProductTheme
} from './types.ts';

export interface CreateArguments {
	destination?: string;
	profile?: ProductProfile;
	name?: string;
	description?: string;
	theme?: ProductTheme;
	templateVersion?: string;
	templatePath?: string;
	install: boolean;
	git: boolean;
	installExplicit: boolean;
	gitExplicit: boolean;
	yes: boolean;
	help: boolean;
	version: boolean;
	output?: string;
}

const resolvedCreateArgumentsSchema = z.object({
	destination: z.string().trim().min(1, 'A destination directory is required.'),
	profile: z.enum(profiles),
	name: productNameSchema.refine((value) => {
		try {
			slugify(value);
			return true;
		} catch {
			return false;
		}
	}, '--name must contain at least one letter or number.'),
	description: z.string().trim().min(1, '--description cannot be empty.'),
	theme: z.enum(themes),
	templateVersion: semanticVersionSchema,
	templatePath: z.string().trim().min(1).optional(),
	install: z.boolean(),
	git: z.boolean()
});

function hasFlag(arguments_: Array<string>, flag: string) {
	return arguments_.includes(flag);
}

function assertBooleanFlags(arguments_: Array<string>, name: 'install' | 'git') {
	if (hasFlag(arguments_, `--${name}`) && hasFlag(arguments_, `--no-${name}`)) {
		throw new Error(`Conflicting --${name} and --no-${name} flags.`);
	}
}

function commanderMessage(error: CommanderError) {
	return error.message.replace(/^error:\s*/i, '');
}

export function parseCreateArguments(arguments_: Array<string>): CreateArguments {
	assertBooleanFlags(arguments_, 'install');
	assertBooleanFlags(arguments_, 'git');
	let output = '';
	const program = new Command()
		.name('create-product-plate')
		.description('Create a lean Product Plate application.')
		.version(GENERATOR_VERSION)
		.argument('[directory]', 'directory to create')
		.addOption(new Option('--profile <profile>', 'product profile').choices([...profiles]))
		.option('--name <name>', 'product name')
		.option('--description <description>', 'short product description')
		.addOption(new Option('--theme <theme>', 'visual theme').choices([...themes]))
		.option('--template-version <version>', 'released template semantic version')
		.option('--template-path <path>', 'local template path (development only)')
		.option('--install', 'install dependencies')
		.option('--no-install', 'skip dependency installation')
		.option('--git', 'initialize a Git repository')
		.option('--no-git', 'skip Git initialization')
		.option('-y, --yes', 'use documented defaults without prompting')
		.allowExcessArguments(false)
		.exitOverride()
		.configureOutput({
			writeOut: (value) => {
				output += value;
			},
			writeErr: (value) => {
				output += value;
			}
		});

	try {
		program.parse(arguments_, { from: 'user' });
	} catch (error) {
		if (error instanceof CommanderError) {
			if (error.code === 'commander.helpDisplayed') {
				return {
					install: true,
					git: true,
					installExplicit: false,
					gitExplicit: false,
					yes: false,
					help: true,
					version: false,
					output
				};
			}
			if (error.code === 'commander.version') {
				return {
					install: true,
					git: true,
					installExplicit: false,
					gitExplicit: false,
					yes: false,
					help: false,
					version: true,
					output
				};
			}
			throw new Error(commanderMessage(error));
		}
		throw error;
	}

	const options = program.opts<{
		profile?: ProductProfile;
		name?: string;
		description?: string;
		theme?: ProductTheme;
		templateVersion?: string;
		templatePath?: string;
		install?: boolean;
		git?: boolean;
		yes?: boolean;
	}>();
	if (options.templateVersion) {
		const version = semanticVersionSchema.safeParse(options.templateVersion);
		if (!version.success) throw new Error('--template-version requires a semantic version.');
	}
	const installExplicit = hasFlag(arguments_, '--install') || hasFlag(arguments_, '--no-install');
	const gitExplicit = hasFlag(arguments_, '--git') || hasFlag(arguments_, '--no-git');
	return {
		destination: program.processedArgs[0],
		profile: options.profile,
		name: options.name,
		description: options.description,
		theme: options.theme,
		templateVersion: options.templateVersion,
		templatePath: options.templatePath,
		install: installExplicit ? Boolean(options.install) : true,
		git: gitExplicit ? Boolean(options.git) : true,
		installExplicit,
		gitExplicit,
		yes: Boolean(options.yes),
		help: false,
		version: false
	};
}

export function resolveCreateArguments(
	parsed: CreateArguments,
	isInteractiveTerminal: boolean,
	insideGitWorkTree = false
): GenerateProjectOptions {
	if (!parsed.destination?.trim()) {
		if (parsed.yes) throw new Error('--yes requires a destination argument.');
		if (!isInteractiveTerminal) {
			throw new Error('Interactive prompts require a TTY. Pass a destination with --yes.');
		}
		throw new Error('Interactive product details are still required.');
	}
	const defaultName = basename(resolve(parsed.destination));
	if (!parsed.yes) {
		const missing = [
			!parsed.profile && '--profile',
			!parsed.name && '--name',
			!parsed.description && '--description',
			!parsed.theme && '--theme'
		].filter(Boolean);
		if (missing.length > 0) {
			if (!isInteractiveTerminal) {
				throw new Error(
					`Interactive prompts require a TTY. Pass --yes or provide ${missing.join(', ')}.`
				);
			}
			throw new Error('Interactive product details are still required.');
		}
	}
	const result = resolvedCreateArgumentsSchema.safeParse({
		destination: parsed.destination,
		profile: parsed.profile ?? 'prelaunch',
		name: parsed.name === undefined ? defaultName : parsed.name,
		description:
			parsed.description === undefined
				? `${parsed.name?.trim() || defaultName} application.`
				: parsed.description,
		theme: parsed.theme ?? 'neutral',
		templateVersion: parsed.templateVersion ?? GENERATOR_VERSION,
		templatePath: parsed.templatePath,
		install: parsed.installExplicit ? parsed.install : true,
		git: parsed.gitExplicit ? parsed.git : !insideGitWorkTree
	});
	if (!result.success)
		throw new Error(result.error.issues[0]?.message ?? 'Invalid create options.');
	return result.data;
}

export function isInsideGitRepository(destination: string) {
	let directory = resolve(dirname(destination));
	while (true) {
		if (existsSync(resolve(directory, '.git'))) return true;
		const parent = dirname(directory);
		if (parent === directory || directory === parse(directory).root) return false;
		directory = parent;
	}
}

async function promptValue<T>(promise: Promise<T | symbol>): Promise<T | null> {
	const value = await promise;
	if (isCancel(value)) {
		cancel('Creation cancelled.');
		return null;
	}
	return value;
}

async function promptForCreateArguments(parsed: CreateArguments) {
	intro('Create Product Plate');
	const destination =
		parsed.destination ??
		(await promptValue(
			text({
				message: 'Where should we create your project?',
				placeholder: './my-app',
				validate: (value) => (value?.trim() ? undefined : 'Enter a destination directory.')
			})
		));
	if (destination == null) return null;
	const profile =
		parsed.profile ??
		(await promptValue(
			select<ProductProfile>({
				message: 'Which product profile should we keep?',
				initialValue: 'prelaunch',
				options: [
					{ value: 'prelaunch', label: 'Prelaunch', hint: 'landing, waitlist, launch checks' },
					{ value: 'solo-saas', label: 'Solo SaaS', hint: 'auth, billing, personal workspace' },
					{ value: 'team-saas', label: 'Team SaaS', hint: 'organizations, roles, invites' },
					{ value: 'ai-saas', label: 'AI SaaS', hint: 'chat, usage limits, model provider' }
				]
			})
		));
	if (profile === null) return null;
	const defaultName = basename(resolve(destination));
	const name =
		parsed.name ??
		(await promptValue(
			text({
				message: 'What is the product name?',
				initialValue: defaultName,
				validate: (value) => {
					const parsedName = productNameSchema.safeParse(value ?? '');
					if (!parsedName.success) return parsedName.error.issues[0]?.message;
					try {
						slugify(parsedName.data);
						return undefined;
					} catch (error) {
						return error instanceof Error ? error.message : 'Enter a valid product name.';
					}
				}
			})
		));
	if (name == null) return null;
	const description =
		parsed.description ??
		(await promptValue(
			text({
				message: 'How would you describe it?',
				initialValue: `${name.trim()} application.`,
				validate: (value) => (value?.trim() ? undefined : 'Enter a short description.')
			})
		));
	if (description == null) return null;
	const theme =
		parsed.theme ??
		(await promptValue(
			select<ProductTheme>({
				message: 'Which theme should we use?',
				initialValue: 'neutral',
				options: themes.map((value) => ({ value, label: value }))
			})
		));
	if (theme === null) return null;
	const insideGitWorkTree = isInsideGitRepository(destination);
	const install = parsed.installExplicit
		? parsed.install
		: await promptValue(confirm({ message: 'Install dependencies?', initialValue: true }));
	if (install === null) return null;
	const git = parsed.gitExplicit
		? parsed.git
		: await promptValue(
				confirm({
					message: insideGitWorkTree
						? 'Initialize a nested Git repository?'
						: 'Initialize a Git repository?',
					initialValue: !insideGitWorkTree
				})
			);
	if (git === null) return null;
	return resolveCreateArguments(
		{
			...parsed,
			destination,
			profile,
			name,
			description,
			theme,
			install,
			git,
			installExplicit: true,
			gitExplicit: true,
			yes: true
		},
		true,
		insideGitWorkTree
	);
}

export async function runCreateCli(arguments_: Array<string>) {
	const parsed = parseCreateArguments(arguments_);
	if (parsed.help || parsed.version) {
		stdout.write(parsed.output ?? '');
		return;
	}
	let options: GenerateProjectOptions | null;
	if (parsed.yes) {
		if (!parsed.destination?.trim()) throw new Error('--yes requires a destination argument.');
		options = resolveCreateArguments(
			parsed,
			Boolean(stdin.isTTY && stdout.isTTY),
			isInsideGitRepository(parsed.destination)
		);
	} else if (!stdin.isTTY || !stdout.isTTY) {
		options = resolveCreateArguments(
			parsed,
			false,
			parsed.destination ? isInsideGitRepository(parsed.destination) : false
		);
	} else {
		options = await promptForCreateArguments(parsed);
	}
	if (!options) return;
	log.step(`Creating ${options.name} in ${resolve(options.destination)}`);
	const result = await generateProject(options);
	outro(`Created ${result.manifest.product.name}.`);
	return result;
}
