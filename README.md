# svelte-i18n-locale-chain

[![npm version](https://img.shields.io/npm/v/svelte-i18n-locale-chain)](https://www.npmjs.com/package/svelte-i18n-locale-chain)
[![license](https://img.shields.io/npm/l/svelte-i18n-locale-chain)](LICENSE)

Smart locale fallback chains for svelte-i18n — because pt-BR users deserve pt-PT, not English.

## The Problem

svelte-i18n falls back directly to `fallbackLocale` when a translation key is missing. There is no intermediate fallback.

**Example:** Your app has `pt-PT` translations but no `pt-BR` messages file. A Brazilian Portuguese user sees English (or whatever your fallback locale is) instead of the perfectly good `pt-PT` translations.

The same thing happens with `es-MX` -> `es`, `fr-CA` -> `fr`, `de-AT` -> `de`, and every other regional variant.

Your users see English when a perfectly good translation exists in a sibling locale.

## The Solution

Two-function setup. Zero changes to your existing svelte-i18n components.

`initLocaleChain` wraps svelte-i18n's `init` and provides `setLocale()` which automatically deep-merges messages from a configurable fallback chain.

## Important

This library manages all message loading. Do **not** use svelte-i18n's `register()` function alongside this library. `initLocaleChain` handles locale registration, message loading, and deep-merging internally. Using `register()` at the same time will cause duplicate or conflicting message loading.

## Installation

```bash
npm install svelte-i18n-locale-chain svelte-i18n
```

## Quick Start

```ts
// src/lib/i18n.ts
import { initLocaleChain, setLocale } from 'svelte-i18n-locale-chain';

await initLocaleChain({
  loadMessages: (locale) =>
    import(`../locales/${locale}.json`).then(m => m.default),
  defaultLocale: 'en',
  initialLocale: 'pt-BR',
});

// Later, to change locale:
await setLocale('fr-CA');
```

All default fallback chains are active. A `pt-BR` user will now see `pt-PT` translations when `pt-BR` keys are missing.

## Custom Configuration

### Default (zero config)

```ts
await initLocaleChain({
  loadMessages: (locale) =>
    import(`../locales/${locale}.json`).then(m => m.default),
  defaultLocale: 'en',
  initialLocale: 'pt-BR',
});
```

Uses all built-in fallback chains. Covers Portuguese, Spanish, French, German, Italian, Dutch, Norwegian, and Malay regional variants.

### With overrides (merge with defaults)

```ts
// Override specific chains while keeping all defaults
await initLocaleChain({
  loadMessages: (locale) =>
    import(`../locales/${locale}.json`).then(m => m.default),
  defaultLocale: 'en',
  initialLocale: 'pt-BR',
  overrides: { 'pt-BR': ['pt'] }, // skip pt-PT, go straight to pt
});
```

Your overrides replace matching keys in the default map. All other defaults remain.

### Full custom (replace defaults)

```ts
// Full control — only use your chains
await initLocaleChain({
  loadMessages: (locale) =>
    import(`../locales/${locale}.json`).then(m => m.default),
  defaultLocale: 'en',
  initialLocale: 'pt-BR',
  fallbacks: {
    'pt-BR': ['pt-PT', 'pt'],
    'es-MX': ['es-419', 'es'],
  },
  mergeDefaults: false,
});
```

Only the chains you specify will be active. No defaults.

## Advanced: Standalone Utility

For advanced setups where you manage your own svelte-i18n initialization, use the pure merge function:

```ts
import { mergeMessagesFromChain } from 'svelte-i18n-locale-chain';
import { init, addMessages, locale as localeStore } from 'svelte-i18n';

// Resolve and merge messages yourself
const messages = await mergeMessagesFromChain({
  locale: 'pt-BR',
  defaultLocale: 'en',
  loadMessages: (locale) => fetch(`/api/messages/${locale}`).then(r => r.json()),
});

// Pass merged messages to svelte-i18n manually
addMessages('pt-BR', messages);
init({ fallbackLocale: 'en', initialLocale: 'pt-BR' });
```

## Default Fallback Map

### Portuguese

| Locale | Fallback Chain |
|--------|---------------|
| pt-BR | pt-PT -> pt -> (default locale) |
| pt-PT | pt -> (default locale) |

### Spanish

| Locale | Fallback Chain |
|--------|---------------|
| es-419 | es -> (default locale) |
| es-MX | es-419 -> es -> (default locale) |
| es-AR | es-419 -> es -> (default locale) |
| es-CO | es-419 -> es -> (default locale) |
| es-CL | es-419 -> es -> (default locale) |
| es-PE | es-419 -> es -> (default locale) |
| es-VE | es-419 -> es -> (default locale) |
| es-EC | es-419 -> es -> (default locale) |
| es-GT | es-419 -> es -> (default locale) |
| es-CU | es-419 -> es -> (default locale) |
| es-BO | es-419 -> es -> (default locale) |
| es-DO | es-419 -> es -> (default locale) |
| es-HN | es-419 -> es -> (default locale) |
| es-PY | es-419 -> es -> (default locale) |
| es-SV | es-419 -> es -> (default locale) |
| es-NI | es-419 -> es -> (default locale) |
| es-CR | es-419 -> es -> (default locale) |
| es-PA | es-419 -> es -> (default locale) |
| es-UY | es-419 -> es -> (default locale) |
| es-PR | es-419 -> es -> (default locale) |

### French

| Locale | Fallback Chain |
|--------|---------------|
| fr-CA | fr -> (default locale) |
| fr-BE | fr -> (default locale) |
| fr-CH | fr -> (default locale) |
| fr-LU | fr -> (default locale) |
| fr-MC | fr -> (default locale) |
| fr-SN | fr -> (default locale) |
| fr-CI | fr -> (default locale) |
| fr-ML | fr -> (default locale) |
| fr-CM | fr -> (default locale) |
| fr-MG | fr -> (default locale) |
| fr-CD | fr -> (default locale) |

### German

| Locale | Fallback Chain |
|--------|---------------|
| de-AT | de -> (default locale) |
| de-CH | de -> (default locale) |
| de-LU | de -> (default locale) |
| de-LI | de -> (default locale) |

### Italian

| Locale | Fallback Chain |
|--------|---------------|
| it-CH | it -> (default locale) |

### Dutch

| Locale | Fallback Chain |
|--------|---------------|
| nl-BE | nl -> (default locale) |

### Norwegian

| Locale | Fallback Chain |
|--------|---------------|
| nb | no -> (default locale) |
| nn | nb -> no -> (default locale) |

### Malay

| Locale | Fallback Chain |
|--------|---------------|
| ms-MY | ms -> (default locale) |
| ms-SG | ms -> (default locale) |
| ms-BN | ms -> (default locale) |

## How It Works

1. `initLocaleChain` wraps svelte-i18n's `init` and configures the fallback map.
2. When `setLocale()` is called, it resolves the fallback chain for the requested locale.
3. It calls your `loadMessages` function for each locale in the chain.
4. Messages are deep-merged in priority order: default locale (base) -> chain locales -> requested locale (highest priority).
5. If `loadMessages` throws for any chain locale (e.g., file doesn't exist), it silently skips that locale and continues.
6. The merged messages are injected via svelte-i18n's `addMessages`, and the active locale is set. Your components see a complete message object with no missing keys.

## FAQ

**Performance impact?**
Minimal. The fallback map is resolved once at init time. Message loading happens per locale change via `setLocale()`, but only for locales in the chain. Deep merge is fast for typical message objects.

**Does it work with nested message keys?**
Yes. Deep merge is recursive -- it walks all nesting levels. If `pt-BR` has `common.save` but not `common.cancel`, `common.cancel` will be filled from the next locale in the chain.

**What if my `loadMessages` is async?**
Fully supported. `loadMessages` can return a plain object or a `Promise`. Dynamic `import()`, `fetch()`, `fs.readFile()` -- all work.

**Can I load messages from a CMS or API?**
Yes. `loadMessages` is just a function -- it can load from anywhere:

```ts
await initLocaleChain({
  loadMessages: async (locale) => {
    const res = await fetch(`https://my-cms.com/messages/${locale}`);
    return res.json();
  },
  defaultLocale: 'en',
  initialLocale: 'pt-BR',
});
```

**What if a chain locale doesn't have a messages file?**
It's silently skipped. The chain continues to the next locale. This is by design -- you don't need message files for every locale in every chain.

**svelte-i18n version compatibility?**
Works with svelte-i18n v3+ and v4+.

**SvelteKit SSR?**
svelte-i18n stores are singletons -- in a SvelteKit SSR environment, initialize per-request in the `handle` hook to avoid locale bleed between concurrent requests. Call `initLocaleChain` (or `setLocale`) in your server `handle` function so each request gets the correct locale context.

## Contributing

- Open issues for bugs or feature requests.
- PRs welcome, especially for adding new locale fallback chains.
- Run `npm test` before submitting.

## License

MIT License - see [LICENSE](LICENSE) file.

Built by [i18nagent.ai](https://i18nagent.ai)
