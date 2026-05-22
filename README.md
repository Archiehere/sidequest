# SideQuest

5 things worth doing today, supplies one tap away.

This is the working demo. Backend = NestJS + Prisma + **SQLite for demo** (Postgres in prod — schema is portable, change the `datasource` provider and `DATABASE_URL`). Mobile = Expo / React Native. Swiggy Instamart MCP is **mocked locally** (the real MCP at `mcp.swiggy.com/im` returns `401 Unauthorized` even on `initialize` — you need partner credentials to call it). The mock implements the same `InstamartClient` interface so swapping in the real client is a one-file change once prod credentials land.

## Layout

```
sidequest/
├── apps/
│   ├── api/      NestJS backend
│   └── mobile/   Expo RN app
├── docker-compose.yml   Postgres + Redis
└── package.json         npm workspaces root
```

## One-time setup

```bash
cd ~/Documents/Coding/sidequest

# 1. Install deps for both workspaces
npm install

# 2. Generate Prisma client + create SQLite DB
cd apps/api
cp .env.example .env
npx prisma migrate dev --name init
cd ../..

# 3. Seed 5 demo quests for today
npm run api:seed
```

> For prod: switch the Prisma `datasource` provider to `postgresql`, set `DATABASE_URL` to your Postgres URL, run `npm run db:up` to bring up the local docker-compose (Postgres + Redis), then `npx prisma migrate dev`.

## Run the demo

Two terminals:

```bash
# Terminal 1 — API on :4000
npm run api:dev

# Terminal 2 — Expo
npm run mobile:dev
# then press 'i' for iOS sim, 'a' for Android, or scan QR with Expo Go
```

If you run the mobile app on a physical device, change `extra.apiUrl` in `apps/mobile/app.json` from `http://localhost:4000` to your machine's LAN IP (e.g. `http://192.168.1.42:4000`).

## End-to-end flow you should see

1. Open app → splash → onboarding (phone + OTP — use `123456`, hardcoded in demo) → pick a handle.
2. Land on **Today's Drop**: 5 numbered quests, hero images, time + difficulty.
3. Tap any quest → detail with description, material list, live prices from the mock catalog, basket subtotal.
4. Tap **order supplies** → API builds a basket via `MockInstamartClient`, returns a fake Swiggy checkout URL → app opens it in a WebView. (In prod, this URL is the real Instamart checkout with affiliate attribution embedded.)
5. Tap **I'm doing this — share** → native share sheet with quest deep link. This is the v1 growth loop: distribution happens on IG/TikTok/WhatsApp, not in-app.

## API quick reference

| Method | Path                      | Notes                                |
| ------ | ------------------------- | ------------------------------------ |
| POST   | `/auth/otp/request`       | returns `{ devOtp: "123456" }`       |
| POST   | `/auth/otp/verify`        | returns `{ token, user }`            |
| GET    | `/quests/today`           | public                               |
| GET    | `/quests/:id`             | public, includes live material prices |
| POST   | `/quests/:id/like`        | auth                                 |
| POST   | `/orders/checkout`        | auth, body: `{ questId }`            |
| GET    | `/orders/mine`            | auth                                 |

Auth is `Authorization: Bearer tok_<userId>` — demo-grade, swap for real JWT before any non-test traffic.

## Swapping the mock Instamart client for the real MCP

When partner credentials arrive:

1. Implement a `RealInstamartClient` in `apps/api/src/instamart/` that calls `https://mcp.swiggy.com/im` with the JSON-RPC envelope and Bearer token.
2. Update the factory in `instamart.module.ts` to return it when `INSTAMART_MCP_TOKEN` is set.
3. Verify the four interface methods round-trip against real SKUs: `searchProducts`, `getProduct`, `createBasket`, `initiateCheckout`.
4. Everything else (quests, orders, mobile app) is unchanged.

## What's deliberately NOT here (per the approved plan)

- In-app UGC feed, S3, comments, follows — distribution is outbound to IG/TikTok in v1.
- Recommendation algorithm — everyone sees the same 5 quests (this is the movement angle).
- Real OTP provider, JWT signing, push notifications, analytics — demo skips all of these.
- Branded share-card / Reel composition — Week 7 in the plan; for now the share sheet sends a plain text + link.

See `~/.claude/plans/enumerated-soaring-aho.md` for the full plan.
