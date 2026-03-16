# svelte-i18n-locale-chain Example

Minimal Vite + Svelte app demonstrating locale fallback chains.

## Setup

```bash
pnpm install
```

## Run

```bash
pnpm run dev
```

## What to expect

With locale set to `pt-BR`, the fallback chain is: `pt-BR -> pt-PT -> pt -> en`

- **greeting**: "Oi" (from `pt-BR.json`)
- **farewell**: "Adeus" (falls back to `pt.json` since `pt-BR.json` has no `farewell`)
- **welcome**: "Welcome to LocaleChain" (falls back to `en.json` since neither `pt-BR.json` nor `pt.json` has `welcome`)

## Build

```bash
pnpm run build
```
