# URL Preverification

Checked: 2026-08-20

No project, repository, or deployment was created during this phase.

## Frontend naming fallback

| Candidate | HTTP result | Interpretation |
|---|---:|---|
| `https://hydracut.vercel.app` | 200 | Occupied |
| `https://hydracut-hh.vercel.app` | 404 | First available fallback |
| `https://hydracut-track02a.vercel.app` | 404 | Second available fallback, not selected |

Canonical frontend name: `hydracut-hh`.

`https://hydracut-hh.vercel.app` is a verified available naming surface, not a reservation and not the selected computation host. HydraCut will not use a Vercel-only runtime. The zero-cost live application URL will be a Cloudflare Quick Tunnel HTTPS hostname assigned during Deploy after the private local Docker stack passes all gates.

## Public repository naming fallback

All three GitHub API lookups returned 404 under the authenticated `dmustapha` account:

| Candidate | Result | Decision |
|---|---:|---|
| `https://github.com/dmustapha/hydracut` | 404 | Available but rejected to preserve cross-surface fallback consistency |
| `https://github.com/dmustapha/hydracut-hh` | 404 | Selected canonical public repository URL |
| `https://github.com/dmustapha/hydracut-track02a` | 404 | Available, not selected |

Canonical repository name: `hydracut-hh`.

Canonical repository URL: `https://github.com/dmustapha/hydracut-hh`.

## Deployment binding

- Public product label: HydraCut
- Canonical technical slug: `hydracut-hh`
- Public repository target: `https://github.com/dmustapha/hydracut-hh`
- Live frontend URL: deferred until the free tunnel is created during Deploy
- Runtime: complete local Docker Compose stack with private self-hosted HydraDB OSS
- Public ingress: Cloudflare Quick Tunnel `*.trycloudflare.com`, HTTPS terminated by Cloudflare

## Result

`PASS_WITH_DEPLOY_URL_DEFERRED`: the canonical name and repository URL are confirmed before Build. The live frontend URL cannot truthfully be recorded before the zero-cost tunnel process exists, so it is a required Deploy output rather than a fabricated preverification value.
