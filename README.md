# AI Career Assistant Client

The client is a standalone Next.js App Router application using TypeScript, Ant Design, Tailwind CSS, TanStack Query, Redux Toolkit, React Hook Form, and Zod.

## Prerequisites

- Node.js 20 or newer
- npm
- The AI Career Assistant API running separately (see `../server/README.md`)

## Setup

```bash
npm install
cp .env.example .env.local
```

Set `NEXT_PUBLIC_API_URL` to the API base URL. The default is `http://localhost:5000/api/v1`.

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The public landing page checks the API health endpoint and includes sign-up and sign-in calls to action. Auth pages are available at `/auth/signup`, `/auth/login`, and `/auth/forgot-password`.

Email/password registration sends a verification link through the server’s Gmail API integration. Google sign-in redirects through the backend OAuth callback. Refresh tokens are stored in `sessionStorage` for the current tab session; API access tokens stay in memory and are sent as bearer authorization headers. Configure all Google and Gmail secrets in the server `.env`, never in the client environment.

## Build and lint

```bash
npm run lint
npm run build
npm start
```

## Troubleshooting

- **API shows Disconnected:** Start the server, check `NEXT_PUBLIC_API_URL`, and make sure the API allows the client origin configured by the server’s `CLIENT_URL`.
- **Port is in use:** Start Next.js with `npm run dev -- --port 3001` and set the server `CLIENT_URL` to `http://localhost:3001`.
- **Tailwind styles are missing:** Keep the PostCSS plugin in `postcss.config.mjs` and import `globals.css` from the root layout.
- **Authentication requests fail:** Start the API, check `NEXT_PUBLIC_API_URL`, and confirm the API’s `CLIENT_URL` matches the frontend origin. Email verification requires Gmail API credentials on the server; Google sign-in requires the matching Google OAuth client and callback URL.

Only public configuration belongs in `NEXT_PUBLIC_*` variables. Google secrets, service-account paths, and other server credentials must remain in the backend environment.
