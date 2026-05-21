import { env } from '$env/dynamic/private';
import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { APP_NAME } from '$lib/constants.js';

const MODEL_NAME = env.CHAT_MODEL ?? 'openrouter/free';

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

export async function POST({ request }) {
	if (!env.OPENROUTER_API_KEY) {
		return new Response('OPENROUTER_API_KEY is not configured.', { status: 503 });
	}

	const { messages }: { messages: UIMessage[] } = await request.json();

	const result = streamText({
		model: openrouter.chat(MODEL_NAME),
		system:
			'You are a concise product-building assistant inside a hackathon boilerplate. Use the calculator tool for arithmetic and show the result clearly.',
		messages: await convertToModelMessages(messages),
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
