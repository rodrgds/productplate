import { defineApp } from 'convex/server';
// import betterAuth from '@convex-dev/better-auth/convex.config';
import betterAuth from './betterAuth/convex.config';
import autumn from '@useautumn/convex/convex.config';

const app = defineApp();
// Bun can install the component packages with distinct Convex package identities.
// The runtime contract is the same; narrow both definitions to this app's input type.
type AppComponent = Parameters<typeof app.use>[0];
app.use(betterAuth as unknown as AppComponent);
app.use(autumn as unknown as AppComponent);

export default app;
