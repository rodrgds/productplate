# Product Plate v0.1 Demo Script

This is a loose script for recording the Product Plate launch/demo video.

Goal: show that Product Plate is not just a static starter. It is a starter plus a kickstart prompt that turns the repo into a smaller, product-specific app.

Target length: 6-9 minutes.

## Demo product

Use this example product:

**FeedbackDock** — a tiny feedback inbox for indie SaaS teams.

One-liner:

> FeedbackDock collects customer feedback, lets teams triage it, and uses AI to summarize what users keep asking for.

Why this works well for the demo:

- It naturally uses auth.
- It naturally uses Convex realtime data.
- It can keep billing.
- It can keep the dashboard/settings shell.
- It gives the AI assistant a believable purpose: summarize feedback.
- It clearly does not need the editor, 3D demo, graph/flow demo, or generic component showcase.

## Recording setup

Have these ready before recording:

- Product Plate GitHub repo open.
- Live demo open at `https://productplate.pages.dev/auth/demo`.
- Local terminal ready.
- AI coding agent ready in the cloned repo.
- `START_HERE.md` open.
- Optional: split-screen terminal + browser.

Do not start by explaining every dependency. Start with the pain.

## Video structure

### 1. Hook: what Product Plate is

Approx. 30-45 seconds.

Say:

> Product Plate is an open-source SvelteKit SaaS starter. It gives you the usual product base: auth, billing, Convex, AI patterns, tests, deployment, and app UI. But the main idea is not just the template. The main idea is the kickstart prompt: after cloning, you give the repo to your coding agent and it turns the starter into your actual product.

Show:

- Landing page hero.
- GitHub repo.
- Short scroll over README.

Do not list every tech yet.

### 2. Show the live demo before customization

Approx. 60-90 seconds.

Open:

```txt
https://productplate.pages.dev/auth/demo
```

Show quickly:

- Dashboard.
- Settings/profile.
- Billing.
- AI assistant.
- Admin/users if useful.
- Component gallery only very briefly.

Say:

> This is intentionally a little broad. It is not supposed to be your final product. It is a starting surface. The point is that the kickstart step decides what survives.

Avoid spending too long here. The demo is not a product tour; it is setup proof.

### 3. Clone the repo

Approx. 30 seconds.

```sh
git clone https://github.com/rodrgds/productplate.git feedbackdock
cd feedbackdock
```

Show:

```sh
ls
```

Then open:

```sh
cat START_HERE.md
```

Say:

> This file is the handoff. Instead of telling users to manually hunt through the repo, Product Plate gives the agent an operating manual for turning this into a real app.

### 4. Give the kickstart prompt to the agent

Approx. 2-3 minutes.

Paste `START_HERE.md` into the coding agent.

When it asks the three product questions, answer:

```txt
1. FeedbackDock
2. A small feedback inbox for indie SaaS teams. Users collect customer feedback, triage it, and use AI to summarize repeated requests.
3. First launch: landing page, auth, dashboard, feedback list, basic settings, AI summary route, and billing page. Remove unrelated demos.
```

When it recommends what to keep/remove, guide it like this:

```txt
Keep Convex, Better Auth, Autumn, dashboard, settings, billing, and AI assistant.
Remove editor, graph/flow, 3D demo, generic landing component showcase, Product Plate demo account, and Product Plate-specific copy.
Rename the app to FeedbackDock and update docs/constants/metadata.
```

Important: the agent should pause before editing. Let it show the keep/remove plan on screen.

Say:

> This is the part I want people to understand. The template is not pretending every route belongs in every product. The prompt makes the agent choose.

### 5. Show the expected changed result

Approx. 90 seconds.

After the agent edits, show:

```sh
git diff --stat
```

Then show key changed files:

```sh
rg "Product Plate|productplate|auth/demo|Editor|3D|Flow" .
```

Useful things to show:

- `src/lib/constants.ts` renamed to FeedbackDock values.
- Landing copy changed.
- Product-specific README.
- Removed/changed routes.
- `AGENTS.md` updated for the chosen stack.
- `PRODUCT.md` updated with FeedbackDock details.

Say:

> The result should not be a perfect finished SaaS. The result should be a repo that now points in one direction.

### 6. Run the checks

Approx. 45-60 seconds.

Run:

```sh
bun install
bun run check
bun run test:unit
bun run build
```

If the agent changed routes, also run:

```sh
bun run test:e2e
```

If external keys are missing, say so clearly instead of hiding it.

Say:

> Product Plate is still a real codebase. The kickstart is useful only if the result builds and the handoff is clear.

### 7. Close with the actual positioning

Approx. 30 seconds.

Say:

> If you want a SvelteKit starter that gives you auth, billing, realtime data, AI patterns, tests, and deployment without locking you into a framework, Product Plate is open source. Clone it, run the kickstart, and delete whatever your product does not need.

Show:

- GitHub repo.
- README quickstart.
- Live demo link.

## What not to do

- Do not spend five minutes explaining every library version.
- Do not make it sound like a finished no-code generator.
- Do not promise the kickstart creates a full product automatically.
- Do not show every component gallery page.
- Do not hide removed routes; deletion is part of the point.
- Do not oversell AI. The agent accelerates setup, but the developer still reviews the result.

## Thumbnail/title ideas

Title options:

- `I built an open-source SvelteKit SaaS starter that cleans itself up with AI`
- `Product Plate: SvelteKit SaaS starter + AI kickstart prompt`
- `From boilerplate to product repo in one AI kickstart`

Thumbnail text:

```txt
SvelteKit SaaS Starter
+
AI Kickstart
```

## Short version for README/video description

Product Plate is an open-source SvelteKit SaaS starter with auth, billing, Convex, AI patterns, tests, deployment, and app UI. The differentiator is `START_HERE.md`: a kickstart prompt that helps an AI coding agent turn the generic starter into a product-specific repo by keeping what fits and removing what does not.
