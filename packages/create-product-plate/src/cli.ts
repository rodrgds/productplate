import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { generateProject, GENERATOR_VERSION } from './generator.ts';
import { profiles, themes, type ProductProfile, type ProductTheme } from './types.ts';

interface CreateArguments {
	destination?: string;
	profile?: ProductProfile;
	name?: string;
	description?: string;
	theme?: ProductTheme;
	templateVersion?: string;
	templatePath?: string;
	install: boolean;
	git: boolean;
	yes: boolean;
	help: boolean;
}

function readValue(arguments_: Array<string>, index: number, flag: string) {
	const value = arguments_[index + 1];
	if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value.`);
	return value;
}

function setBoolean(
	seen: Set<string>,
	name: 'install' | 'git',
	value: boolean,
	parsed: CreateArguments
) {
	if (seen.has(name)) throw new Error(`Conflicting --${name} flags.`);
	seen.add(name);
	parsed[name] = value;
}

export function parseCreateArguments(arguments_: Array<string>): CreateArguments {
	const parsed: CreateArguments = {
		install: true,
		git: true,
		yes: false,
		help: false
	};
	const seenBooleans = new Set<string>();
	for (let index = 0; index < arguments_.length; index += 1) {
		const argument = arguments_[index];
		if (!argument.startsWith('--')) {
			if (parsed.destination) throw new Error(`Unexpected argument: ${argument}`);
			parsed.destination = argument;
			continue;
		}
		switch (argument) {
			case '--profile': {
				const value = readValue(arguments_, index, argument);
				if (!profiles.includes(value as ProductProfile))
					throw new Error(`Unknown profile: ${value}`);
				parsed.profile = value as ProductProfile;
				index += 1;
				break;
			}
			case '--theme': {
				const value = readValue(arguments_, index, argument);
				if (!themes.includes(value as ProductTheme)) throw new Error(`Unknown theme: ${value}`);
				parsed.theme = value as ProductTheme;
				index += 1;
				break;
			}
			case '--name':
				parsed.name = readValue(arguments_, index, argument);
				index += 1;
				break;
			case '--description':
				parsed.description = readValue(arguments_, index, argument);
				index += 1;
				break;
			case '--template-version':
				parsed.templateVersion = readValue(arguments_, index, argument);
				if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(parsed.templateVersion)) {
					throw new Error('--template-version requires a semantic version.');
				}
				index += 1;
				break;
			case '--template-path':
				parsed.templatePath = readValue(arguments_, index, argument);
				index += 1;
				break;
			case '--install':
				setBoolean(seenBooleans, 'install', true, parsed);
				break;
			case '--no-install':
				setBoolean(seenBooleans, 'install', false, parsed);
				break;
			case '--git':
				setBoolean(seenBooleans, 'git', true, parsed);
				break;
			case '--no-git':
				setBoolean(seenBooleans, 'git', false, parsed);
				break;
			case '--yes':
				parsed.yes = true;
				break;
			case '--help':
			case '-h':
				parsed.help = true;
				break;
			default:
				throw new Error(`Unknown option: ${argument}`);
		}
	}
	if (parsed.yes) {
		for (const required of ['destination', 'profile', 'name', 'description', 'theme'] as const) {
			const value = parsed[required];
			if (!value || (typeof value === 'string' && value.trim().length === 0)) {
				throw new Error(
					required === 'destination'
						? '--yes requires a destination argument.'
						: `--yes requires --${required}.`
				);
			}
		}
	}
	return parsed;
}

const help = `Create a lean Product Plate application.\n\nUsage:\n  bun create product-plate <directory> [options]\n\nOptions:\n  --profile <prelaunch|solo-saas|team-saas|ai-saas>\n  --name <product name>\n  --description <short description>\n  --theme <product-plate|claude|zen|neutral>\n  --template-version <semver>\n  --template-path <path>\n  --install | --no-install\n  --git | --no-git\n  --yes\n`;

export async function runCreateCli(arguments_: Array<string>) {
	const parsed = parseCreateArguments(arguments_);
	if (parsed.help) {
		stdout.write(help);
		return;
	}
	if (parsed.yes) {
		return await generateProject({
			destination: parsed.destination!,
			profile: parsed.profile!,
			name: parsed.name!,
			description: parsed.description!,
			theme: parsed.theme!,
			templateVersion: parsed.templateVersion ?? GENERATOR_VERSION,
			templatePath: parsed.templatePath,
			install: parsed.install,
			git: parsed.git
		});
	}

	const prompt = createInterface({ input: stdin, output: stdout });
	try {
		const destination = parsed.destination ?? (await prompt.question('Directory: '));
		const profile =
			parsed.profile ??
			((await prompt.question(
				'Profile (prelaunch, solo-saas, team-saas, ai-saas): '
			)) as ProductProfile);
		const name = parsed.name ?? (await prompt.question('Product name: '));
		const description = parsed.description ?? (await prompt.question('Short description: '));
		const theme =
			parsed.theme ??
			((await prompt.question('Theme (product-plate, claude, zen, neutral): ')) as ProductTheme);
		if (!profiles.includes(profile)) throw new Error(`Unknown profile: ${profile}`);
		if (!themes.includes(theme)) throw new Error(`Unknown theme: ${theme}`);
		return await generateProject({
			destination,
			profile,
			name,
			description,
			theme,
			templateVersion: parsed.templateVersion ?? GENERATOR_VERSION,
			templatePath: parsed.templatePath,
			install: parsed.install,
			git: parsed.git
		});
	} finally {
		prompt.close();
	}
}
