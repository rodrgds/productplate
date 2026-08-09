import { access, readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const appPagesWithLayoutMain = [
	'src/routes/(app)/admin/feedback/+page.svelte',
	'src/routes/(app)/admin/organizations/+page.svelte',
	'src/routes/(app)/developer/+page.svelte',
	'src/routes/(app)/invite/[token]/+page.svelte',
	'src/routes/(app)/map/+page.svelte',
	'src/routes/(app)/onboarding/+page.svelte',
	'src/routes/(app)/threlte/+page.svelte',
	'src/routes/(app)/workspace/+page.svelte'
] as const;

const publicPagesWithShellMain = [
	'src/routes/blog/+page.svelte',
	'src/routes/blog/[slug]/+page.svelte',
	'src/routes/changelog/+page.svelte',
	'src/routes/docs/+page.svelte',
	'src/routes/legal/privacy/+page.svelte',
	'src/routes/legal/terms/+page.svelte'
] as const;

describe('frontend surface contracts', () => {
	it('keeps the dashboard truthful and backed by live product state', async () => {
		const source = await readFile('src/routes/(app)/dashboard/+page.svelte', 'utf8');

		expect(source).toContain('api.auth.getCurrentUser');
		expect(source).toContain('api.userProfiles.getCurrent');
		expect(source).toContain('api.organizations.getCurrent');
		expect(source).toContain("resolve('/workspace')");
		expect(source).toContain("resolve('/settings')");
		expect(source).not.toMatch(/SectionCards|ChartAreaInteractive|DataTable|LazyAgentPanel/);
	});

	it('keeps the dashboard server-renderable', async () => {
		await expect(access('src/routes/(app)/dashboard/+page.ts')).rejects.toThrow();
	});

	it('gives public and authenticated layouts one main landmark each', async () => {
		const publicShell = await readFile('src/lib/components/public-page-shell.svelte', 'utf8');
		const sidebarInset = await readFile(
			'src/lib/components/ui/sidebar/sidebar-inset.svelte',
			'utf8'
		);
		const authLayout = await readFile('src/routes/auth/+layout.svelte', 'utf8');

		expect(publicShell).toContain('<main id="main-content"');
		expect(sidebarInset).toContain('<main');
		expect(authLayout).toContain('<main class="flex flex-col items-center');

		for (const path of publicPagesWithShellMain) {
			const source = await readFile(path, 'utf8');
			expect(source, `${path} should defer its main landmark to PublicPageShell`).not.toContain(
				'<main'
			);
		}

		for (const path of appPagesWithLayoutMain) {
			const source = await readFile(path, 'utf8');
			expect(source, `${path} should defer its main landmark to the app layout`).not.toContain(
				'<main'
			);
		}
	});

	it('marks active navigation and dismisses every mobile navigation group', async () => {
		const main = await readFile('src/lib/components/nav-main.svelte', 'utf8');
		const admin = await readFile('src/lib/components/nav-admin.svelte', 'utf8');
		const secondary = await readFile('src/lib/components/nav-secondary.svelte', 'utf8');

		for (const source of [main, admin, secondary]) {
			expect(source).toContain('aria-current');
			expect(source).toContain('isActive');
			expect(source).toContain('closeMobileSidebar');
		}
	});
});
