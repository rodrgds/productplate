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
						const result = Function('"use strict"; return (' + sanitized + ')')();
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
