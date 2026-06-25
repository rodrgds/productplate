# Security Policy

Product Plate is a starter template. Security fixes are still important because many users will fork the repository into real products.

## Supported versions

Security fixes are handled on the default branch and included in the next tagged release.

| Version         | Supported   |
| --------------- | ----------- |
| `main`          | Yes         |
| `<1.0` releases | Best effort |

## Reporting a vulnerability

Do not open a public issue for vulnerabilities involving auth, secrets, billing, access control, or data exposure.

Report privately by emailing:

```txt
security@rgo.pt
```

Include:

- A clear description of the issue.
- Affected files or routes.
- Reproduction steps.
- Expected impact.
- Any suggested fix, if obvious.

## Scope

Useful reports include:

- Authentication/session issues.
- Demo-account isolation problems.
- Secret leakage through client-side code, examples, docs, or logs.
- Billing entitlement bypasses.
- Access-control bugs in protected app/admin routes.
- Unsafe default environment or deployment guidance.
- Dependency vulnerabilities with a credible exploitation path in this starter.

Out of scope:

- Generic dependency scanner output without a practical path to exploitation.
- Social engineering against maintainers.
- Attacks requiring access to private provider dashboards or secrets.
- Issues caused only after a fork intentionally changes the security model.

## Template-user note

If you fork Product Plate into a real product, review auth, billing, admin access, demo-account removal, environment variables, provider dashboard settings, and deployment secrets before production launch.
