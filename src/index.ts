import { init, addMessages, locale } from 'svelte-i18n'
import { defaultFallbacks, mergeFallbacks } from './fallback-map'
import { resolveMessages, deepMerge } from './message-resolver'
import type { LocaleChainConfig, FallbackMap, Messages, LoadMessages, ResolveOptions } from './types'

export { defaultFallbacks, mergeFallbacks } from './fallback-map'
export { deepMerge } from './message-resolver'
export type { Messages, FallbackMap, LoadMessages, LocaleChainConfig, ResolveOptions } from './types'

let config: LocaleChainConfig | null = null
let resolvedMap: FallbackMap = {}

export async function initLocaleChain(cfg: LocaleChainConfig): Promise<void> {
  config = cfg

  if (cfg.fallbacks) {
    resolvedMap =
      cfg.mergeDefaults === false
        ? cfg.fallbacks
        : mergeFallbacks(defaultFallbacks, cfg.fallbacks)
  } else if (cfg.overrides) {
    resolvedMap = mergeFallbacks(defaultFallbacks, cfg.overrides)
  } else {
    resolvedMap = defaultFallbacks
  }

  init({ fallbackLocale: cfg.defaultLocale })

  if (cfg.initialLocale) {
    await setLocale(cfg.initialLocale)
  }
}

export async function setLocale(loc: string): Promise<void> {
  if (!config) {
    throw new Error('initLocaleChain() must be called before setLocale()')
  }

  const chain = resolvedMap[loc] || []

  const messages = await resolveMessages({
    locale: loc,
    chain,
    defaultLocale: config.defaultLocale,
    loadMessages: config.loadMessages,
  })

  addMessages(loc, messages)
  locale.set(loc)
}

export async function mergeMessagesFromChain(options: {
  locale: string
  loadMessages: LoadMessages
  defaultLocale: string
  fallbackMap?: FallbackMap
}): Promise<Messages> {
  const map = options.fallbackMap || defaultFallbacks
  const chain = map[options.locale] || []

  return resolveMessages({
    locale: options.locale,
    chain,
    defaultLocale: options.defaultLocale,
    loadMessages: options.loadMessages,
  })
}

export function resetLocaleChain(): void {
  config = null
  resolvedMap = {}
}
