import { env } from '$env/dynamic/private';
import { api } from '$convex/_generated/api.js';
import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit';
import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, safeValidateUIMessages, stepCountIs, streamText, tool } from 'ai';
import { z } from 'zod';
import { APP_NAME } from '$lib/constants.js';

const MODEL_NAME = env.CHAT_MODEL ?? 'openrouter/free';
const MAX_CHAT_BODY_BYTES = 100_000;
const MAX_CHAT_MESSAGES = 50;

const openrouter = createOpenAI({
	name: 'openrouter',
	baseURL: 'https://openrouter.ai/api/v1',
	apiKey: env.OPENROUTER_API_KEY,
	headers: {
		'HTTP-Referer': env.SITE_URL ?? 'http://localhost:5173',
		'X-Title': APP_NAME
	}
});

function evaluateExpression(expr: string): number {
	const pos = { i: 0 };

	function skipWhitespace() {
		while (pos.i < expr.length && expr[pos.i] === ' ') pos.i++;
	}

	function parseNumber(): number {
		const start = pos.i;
		if (pos.i < expr.length && expr[pos.i] === '-') pos.i++;
		while (pos.i < expr.length && /\d/.test(expr[pos.i])) pos.i++;
		if (pos.i < expr.length && expr[pos.i] === '.') {
			pos.i++;
			while (pos.i < expr.length && /\d/.test(expr[pos.i])) pos.i++;
		}
		return Number(expr.slice(start, pos.i));
	}

	function parseFactor(): number {
		skipWhitespace();
		let sign = 1;
		while (pos.i < expr.length && (expr[pos.i] === '+' || expr[pos.i] === '-')) {
			if (expr[pos.i] === '-') sign = -sign;
			pos.i++;
			skipWhitespace();
		}
		if (pos.i < expr.length && expr[pos.i] === '(') {
			pos.i++;
			const result = parseExpression();
			skipWhitespace();
			if (pos.i < expr.length && expr[pos.i] === ')') pos.i++;
			return sign * result;
		}
		return sign * parseNumber();
	}

	function parseTerm(): number {
		let result = parseFactor();
		skipWhitespace();
		while (pos.i < expr.length && /[*/%]/.test(expr[pos.i])) {
			const op = expr[pos.i++];
			const rhs = parseFactor();
			if (op === '*') result *= rhs;
			else if (op === '/') result /= rhs;
			else if (op === '%') result %= rhs;
			skipWhitespace();
		}
		return result;
	}

	function parseExpression(): number {
		let result = parseTerm();
		skipWhitespace();
		while (pos.i < expr.length && /[+-]/.test(expr[pos.i])) {
			const op = expr[pos.i++];
			const rhs = parseTerm();
			if (op === '+') result += rhs;
			else if (op === '-') result -= rhs;
			skipWhitespace();
		}
		return result;
	}

	return parseExpression();
}

export async function POST({ request, locals }) {
	if (!env.OPENROUTER_API_KEY) {
		return new Response('OPENROUTER_API_KEY is not configured.', { status: 503 });
	}
	if (!locals.token) return new Response('Unauthorized.', { status: 401 });
	const declaredLength = Number(request.headers.get('content-length') ?? 0);
	if (declaredLength > MAX_CHAT_BODY_BYTES) {
		return new Response('Request body is too large.', { status: 413 });
	}

	const bodyText = await request.text();
	if (new TextEncoder().encode(bodyText).byteLength > MAX_CHAT_BODY_BYTES) {
		return new Response('Request body is too large.', { status: 413 });
	}
	let body: unknown;
	try {
		body = JSON.parse(bodyText);
	} catch {
		return new Response('Invalid JSON body.', { status: 400 });
	}
	if (
		!body ||
		typeof body !== 'object' ||
		!('messages' in body) ||
		!Array.isArray(body.messages) ||
		body.messages.length === 0 ||
		body.messages.length > MAX_CHAT_MESSAGES
	) {
		return new Response('Invalid message list.', { status: 400 });
	}
	const validation = await safeValidateUIMessages({ messages: body.messages });
	if (!validation.success) return new Response('Invalid chat messages.', { status: 400 });
	const messages = validation.data;

	try {
		const client = createConvexHttpClient({ token: locals.token });
		await client.mutation(api.chat.consumeRequest, {});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'AI request limit reached.';
		return new Response(message, { status: message.includes('limit') ? 429 : 401 });
	}

	const result = streamText({
		model: openrouter.chat(MODEL_NAME),
		system:
			'You are a concise product-building assistant inside Product Plate, a SvelteKit SaaS starter. ' +
			'Answer in Markdown. Use fenced code blocks with language hints for code. ' +
			'Write math and equations in LaTeX: wrap inline math in single dollar signs ($\\dfrac{a}{b}$) and ' +
			'display/block math in double dollar signs ($$\\dfrac{128 \\times 7}{3} = 298.67$$). ' +
			'Use the calculator tool for arithmetic and show the result clearly, including the LaTeX form when useful.',
		messages: await convertToModelMessages(messages),
		maxOutputTokens: 800,
		stopWhen: stepCountIs(4),
		tools: {
			calculator: tool({
				description: 'Evaluate a simple arithmetic expression.',
				inputSchema: z.object({
					expression: z
						.string()
						.describe(
							'A simple arithmetic expression using numbers, parentheses, +, -, *, /, %, and decimals.'
						)
				}),
				execute: async ({ expression }) => {
					const sanitized = expression.replace(/\s/g, '');
					if (!/^[\d+\-*/%.()]+$/.test(sanitized) || sanitized.length > 200) {
						return { expression, error: 'Only simple arithmetic expressions are allowed.' };
					}

					try {
						const result = evaluateExpression(expression);
						if (typeof result !== 'number' || !Number.isFinite(result)) {
							return { expression, error: 'The expression did not produce a finite number.' };
						}
						return { expression, result };
					} catch {
						return { expression, error: 'Failed to evaluate the expression.' };
					}
				}
			})
		}
	});

	return result.toUIMessageStreamResponse({
		originalMessages: messages
	});
}
