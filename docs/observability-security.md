# Observability and security defaults

- `src/hooks.server.ts` attaches an `x-request-id` to every response.
- Set `OBSERVABILITY_LOG_REQUESTS=true` to emit structured request completion logs with method, path, status, duration, and request id.
- Default response headers include `x-content-type-options`, `x-frame-options`, `referrer-policy`, `permissions-policy`, and HTTPS-only HSTS.
- Keep secrets in encrypted host settings. Do not expose Better Auth, Autumn, Resend, OpenRouter, Stripe, Polar, Creem, or database secrets through `PUBLIC_` variables.
- API keys created in `/developer` are stored as SHA-256 hashes and only revealed once.
- Webhook signing secrets are also hashed and only revealed on creation.
- Organization mutations require active membership and role checks; super-admin screens additionally require the Better Auth admin role.
