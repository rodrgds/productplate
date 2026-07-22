# Better Auth

## Production email policy

Set `AUTH_REQUIRE_EMAIL_VERIFICATION=true` and configure `RESEND_API_KEY` plus `TRANSACTIONAL_EMAIL_FROM` for production auth profiles. Local development may leave verification off and use the email service preview result. Password reset revokes the account's other sessions, and the explicit Better Auth rate-limit block covers sign-in, sign-up, reset, verification, and email-change paths.

## Optional magic-link recipe

Magic-link support is compiled into the auth factory but disabled by default. To opt in, set `AUTH_MAGIC_LINK_ENABLED=true`, keep Resend delivery configured, and add a deliberate magic-link request control to the sign-in screen. Do not enable the environment flag without a tested email delivery path. Google OAuth and explicit account linking remain supported independently.

This project uses `better-auth` for its hybrid authentication system, providing both email/password authentication and social OAuth providers (currently Google).

Instead of duplicating extensive documentation, this guide provides links to the official resources. Please refer to them for detailed setup, configuration, and API usage.

## Key Resources

When working on authentication-related tasks, always refer to these official documents to ensure you are following the correct patterns and security best practices:

- **Convex & Svelte Adapter**: This project uses a specific adapter for integrating `better-auth` with Convex and SvelteKit. The README for this adapter is a crucial resource.
  - [Better Auth - SvelteKit Convex Integration](https://convex-better-auth.netlify.app/framework-guides/sveltekit)
  - [Convex Better Auth - Local Install (needed for admin and organization plugins)](https://convex-better-auth.netlify.app/features/local-install)

- **Official Documentation**: The primary source for all `better-auth` concepts, API, and guides.
  - [Better Auth Docs - Introduction](https://www.better-auth.com/docs/introduction)

- **Email Authentication Concepts**: How Better Auth handles email and password authentication.
  - [Better Auth - Email Concepts](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/concepts/email.mdx)

- **Admin Plugin**: Documentation for the admin plugin functionality.
  - [Better Auth - Admin Plugin](https://www.better-auth.com/docs/plugins/admin)

- **Google OAuth**: Documentation for setting up Google Sign-In.
  - [Better Auth - Google OAuth](https://www.better-auth.com/docs/authentication/google)

## Google OAuth Setup

This project has Google OAuth pre-configured. To enable it:

### 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Choose "Web application" as the application type
6. Add authorized redirect URIs:
   - For development: `http://localhost:5173/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
7. Copy the Client ID and Client Secret

### 2. Set Environment Variables

```sh
bun convex env set SITE_URL http://localhost:5173
bun convex env set GOOGLE_CLIENT_ID your_google_client_id_here
bun convex env set GOOGLE_CLIENT_SECRET your_google_client_secret_here
```

### 3. Update Authorized Redirect URIs

Make sure your redirect URI follows this pattern:

- Development: `http://localhost:5173/api/auth/callback/google`
- Production: `https://yourdomain.com/api/auth/callback/google`

The path `/api/auth/callback/google` is handled automatically by Better Auth through the SvelteKit API route.

### 4. How It Works

The Google OAuth flow is already implemented in:

- **Server**: `src/convex/auth.ts` - Contains the Google OAuth configuration in `socialProviders`
- **Client**: `src/lib/auth-client.ts` - No additional plugin needed; social auth is built-in
- **UI**: `src/lib/components/login-form.svelte` - Has the "Login with Google" button

The button in the login form calls:

```typescript
await authClient.signIn.social({
	provider: 'google',
	callbackURL: '/dashboard'
});
```

This will redirect users to Google for authentication, then back to your app.
