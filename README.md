# Pokemon Pulse (Next.js)

A tiny Next.js app that pulls a random Pokemon from your Rails Pokemon API.

## Local Dev

1. From this folder, install dependencies if needed:

```bash
npm install
```

2. (Optional) Point to a custom API host (defaults to the production Pokemon API):

```bash
export POKEMON_API_BASE_URL="http://localhost:3001"
```

3. Run the dev server:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## API Proxy

The UI calls `GET /api/pokemon`, which proxies to:

```
${POKEMON_API_BASE_URL}/pokemon/random?persist=false

If `POKEMON_API_BASE_URL` is not set, the production Pokemon API is used by default.

## UI Features

- Original 151 toggle uses `range=original`.
- Recent pulls are kept client-side (last 3).
```

Query parameters `persist` and `range` are passed through if you add them to the UI request.

## Deploy (AWS Amplify)

- Create a new Amplify Hosting app from this repo.
- Set the app root to `aws-amplify/nextjs`.
- Amplify should auto-detect Next.js.
- Add the environment variable `POKEMON_API_BASE_URL` pointing at your production API.

If you want me to verify the latest Amplify UI steps, tell me and I will confirm against current docs.
