# Web Preview

A composable component for previewing the result of a generated UI, with support for live examples and code display.

The `WebPreview` component provides a flexible way to showcase the result of a generated UI component, along with its source code. It is designed for documentation and demo purposes, allowing users to interact with live examples and view the underlying implementation.

See `scripts/web-preview.tsx` for this example.

## Installation

```bash
npx ai-elements@latest add web-preview
```

## Usage with AI SDK

Build a simple v0 clone using the [v0 Platform API](https://v0.dev/docs/api/platform).

Install the `v0-sdk` package:

```package-install
npm i v0-sdk
```

Add the following component to your frontend:

```tsx title="app/page.tsx"
'use client';

import {
	WebPreview,
	WebPreviewBody,
	WebPreviewNavigation,
	WebPreviewUrl
} from '@/components/ai-elements/web-preview';
import { useState } from 'react';
import {
	PromptInput,
	type PromptInputMessage,
	PromptInputTextarea,
	PromptInputSubmit
} from '@/components/ai-elements/prompt-input';
import { Spinner } from '@/components/ui/spinner';

const WebPreviewDemo = () => {
	const [previewUrl, setPreviewUrl] = useState('');
	const [prompt, setPrompt] = useState('');
	const [isGenerating, setIsGenerating] = useState(false);

	const handleSubmit = async (message: PromptInputMessage) => {
		if (!message.text.trim()) return;
		setPrompt('');

		setIsGenerating(true);
		try {
			const response = await fetch('/api/v0', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt: message.text })
			});

			const data = await response.json();
			setPreviewUrl(data.demo || '/');
			console.log('Generation finished:', data);
		} catch (error) {
			console.error('Generation failed:', error);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="relative mx-auto size-full h-[600px] max-w-4xl rounded-lg border p-6">
			<div className="flex h-full flex-col">
				<div className="mb-4 flex-1">
					{isGenerating ? (
						<div className="flex h-full flex-col items-center justify-center">
							<Spinner />
							<p className="mt-4 text-muted-foreground">
								Generating app, this may take a few seconds...
							</p>
						</div>
					) : previewUrl ? (
						<WebPreview defaultUrl={previewUrl}>
							<WebPreviewNavigation>
								<WebPreviewUrl />
							</WebPreviewNavigation>
							<WebPreviewBody src={previewUrl} />
						</WebPreview>
					) : (
						<div className="flex h-full items-center justify-center text-muted-foreground">
							Your generated app will appear here
						</div>
					)}
				</div>

				<PromptInput onSubmit={handleSubmit} className="relative mx-auto w-full max-w-2xl">
					<PromptInputTextarea
						value={prompt}
						placeholder="Describe the app you want to build..."
						onChange={(e) => setPrompt(e.currentTarget.value)}
						className="min-h-[60px] pr-12"
					/>
					<PromptInputSubmit
						status={isGenerating ? 'streaming' : 'ready'}
						disabled={!prompt.trim()}
						className="absolute right-1 bottom-1"
					/>
				</PromptInput>
			</div>
		</div>
	);
};

export default WebPreviewDemo;
```

Add the following route to your backend:

```ts title="app/api/v0/route.ts"
import { v0 } from 'v0-sdk';

export async function POST(req: Request) {
	const { prompt }: { prompt: string } = await req.json();

	const result = await v0.chats.create({
		system: 'You are an expert coder',
		message: prompt,
		modelConfiguration: {
			modelId: 'v0-1.5-sm',
			imageGenerations: false,
			thinking: false
		}
	});

	return Response.json({
		demo: result.demo,
		webUrl: result.webUrl
	});
}
```

## Features

- Live preview of UI components
- Composable architecture with dedicated sub-components
- Responsive design modes (Desktop, Tablet, Mobile)
- Navigation controls with back/forward functionality
- URL input and example selector
- Full screen mode support
- Console logging with timestamps
- Context-based state management
- Consistent styling with the design system
- Easy integration into documentation pages

## Props

### `<WebPreview />`

| Prop          | Type                                   | Default | Description                                 |
| ------------- | -------------------------------------- | ------- | ------------------------------------------- |
| `defaultUrl`  | `string`                               | -       | The initial URL to load in the preview.     |
| `onUrlChange` | `(url: string) => void`                | -       | Callback fired when the URL changes.        |
| `...props`    | `React.HTMLAttributes<HTMLDivElement>` | -       | Any other props are spread to the root div. |

### `<WebPreviewNavigation />`

| Prop       | Type                                   | Default | Description                                             |
| ---------- | -------------------------------------- | ------- | ------------------------------------------------------- |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | -       | Any other props are spread to the navigation container. |

### `<WebPreviewNavigationButton />`

| Prop       | Type                                  | Default | Description                                                              |
| ---------- | ------------------------------------- | ------- | ------------------------------------------------------------------------ |
| `tooltip`  | `string`                              | -       | Tooltip text to display on hover.                                        |
| `...props` | `React.ComponentProps<typeof Button>` | -       | Any other props are spread to the underlying shadcn/ui Button component. |

### `<WebPreviewUrl />`

| Prop       | Type                                 | Default | Description                                                             |
| ---------- | ------------------------------------ | ------- | ----------------------------------------------------------------------- |
| `...props` | `React.ComponentProps<typeof Input>` | -       | Any other props are spread to the underlying shadcn/ui Input component. |

### `<WebPreviewBody />`

| Prop       | Type                                            | Default | Description                                             |
| ---------- | ----------------------------------------------- | ------- | ------------------------------------------------------- |
| `loading`  | `React.ReactNode`                               | -       | Optional loading indicator to display over the preview. |
| `...props` | `React.IframeHTMLAttributes<HTMLIFrameElement>` | -       | Any other props are spread to the underlying iframe.    |

### `<WebPreviewConsole />`

| Prop       | Type                                   | Default | Description                                          |
| ---------- | -------------------------------------- | ------- | ---------------------------------------------------- |
| `logs`     | `Array<{ level: `                      | -       | Console log entries to display in the console panel. |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | -       | Any other props are spread to the root div.          |
