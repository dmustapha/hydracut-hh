# Zero-Cost Deployment Preflight

Observed: 2026-08-20

## User constraint

The project must incur no infrastructure charge. Paid VM creation, paid domain registration, and paid tunnel plans are prohibited.

## Host compatibility

| Check | Observed | Result |
|---|---|---|
| Host OS and architecture | Darwin arm64 | PASS |
| Host memory | 8 GiB | PASS with constrained runway |
| Docker engine | Docker Desktop, aarch64 | PASS |
| Docker allocation | 8 CPUs, approximately 4 GiB RAM | PASS at minimum allocation |
| Pinned HydraDB index | `sha256:db78309a233be54662db29744047e985a39b51c45a270d1a1f47c31a62cdb709` | PASS |
| Pinned HydraDB native platform | `linux/arm64` manifest `sha256:ca7fefc34d87b36b57af8c647185e655f0d34cded64b72d11ddc6e876258f7aa` | PASS |
| Pinned HydraDB amd64 platform | `linux/amd64` manifest `sha256:df8a22d8f03fe64541802a7791fa7b355f64f33b43b44a1aa9d3a60c2c3d4b60` | PASS, not selected locally |

## Public entry point

Cloudflare Tunnel `2026.8.2` is installed at `/opt/homebrew/bin/cloudflared`.

The deployment will expose only the local web entry point through a free Quick Tunnel:

```bash
cloudflared tunnel --url http://127.0.0.1:3000
```

Cloudflare assigns a random HTTPS `*.trycloudflare.com` hostname. The hostname is generated only after the complete local stack is running. No Cloudflare account, payment method, domain, inbound port, or ACME email is required.

## Explicit deployment deviation

The approved primary deployment target is a public Linux x86_64 VM. The user explicitly rejected all paid infrastructure, so the deadline deployment target is the local Docker Desktop Linux VM on arm64 with the pinned native HydraDB image and an outbound HTTPS tunnel.

This changes only host placement and public ingress. It does not change the application topology or proof contract:

- Self-hosted HydraDB OSS remains a private Compose service.
- PostgreSQL, worker, and internal application ports remain private.
- Explicit OpenCypher and native `algo.MSpaths` remain mandatory for baseline and final combined verification.
- Independent traversal, removal, restart, fail-closed, secret-scan, external reachability, and live proof gates remain mandatory.
- The Quick Tunnel has no uptime SLA. The deployment machine and tunnel process must remain awake and running through judging.

## Decision

`PASS_WITH_DISCLOSED_HOST_DEVIATION`: zero-cost execution is technically compatible with the pinned HydraDB runtime. Final deployment acceptance still depends on the full Build, Wire, Deploy, and Livetest gates.
