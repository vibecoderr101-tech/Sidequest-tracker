# SideQuest Tracker

## Local setup

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The app uses Supabase for authentication and quest data. Copy `.env.example` to `.env.local`, replace both values with the URL and anon key from your Supabase project, and restart Vite:

```bash
cp .env.example .env.local
```

Without these variables, the app shows a configuration message instead of crashing on startup.

Create a `hobby_items` table with `id`, `title`, `category`, `status`, `user_id`, and `updated_at` columns. Enable Supabase email OTP authentication and configure row-level security so users can access their own rows.

## Template notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
