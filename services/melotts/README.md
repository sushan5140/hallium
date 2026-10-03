# Hallium MeloTTS service

Separate Python inference service for Hallium's high-quality Korean speech provider.

## Why separate

MeloTTS is a Python model runtime with PyTorch/model dependencies. Hallium's main app remains a Next.js/Vercel application, so the model is intentionally not bundled into the web runtime.

Hallium calls this service only through the authenticated `/api/tts` proxy. If this service is unavailable or not configured, Hallium immediately falls back to its existing per-account browser Korean voice.

## Upstream revision

Pinned MeloTTS revision:

`209145371cff8fc3bd60d7be902ea69cbdb7965a`

## Environment

Required in production:

- `MELOTTS_SERVICE_TOKEN` — shared bearer token also configured in Hallium/Vercel.
- `MELOTTS_DEVICE` — optional; defaults to `auto`.

Local-only option:

- `MELOTTS_ALLOW_UNAUTHENTICATED=true`

Do not enable unauthenticated mode on a public deployment.

## Run with Docker

```bash
docker build -t hallium-melotts .
docker run --rm -p 8888:8888 \
  -e MELOTTS_SERVICE_TOKEN=replace-me \
  hallium-melotts
```

Health:

```bash
curl http://localhost:8888/health
```

Synthesis:

```bash
curl -X POST http://localhost:8888/synthesize \
  -H "Authorization: Bearer replace-me" \
  -H "Content-Type: application/json" \
  -d '{"text":"안녕하세요","language":"KR","speed":1.0}' \
  --output sample.wav
```

## Hallium/Vercel configuration

Set these on the Hallium project:

- `MELOTTS_SERVICE_URL=https://your-melotts-service.example`
- `MELOTTS_SERVICE_TOKEN=<same secret>`

Until `MELOTTS_SERVICE_URL` is configured, `/api/tts` returns 503 and the browser client transparently uses Web Speech instead.
