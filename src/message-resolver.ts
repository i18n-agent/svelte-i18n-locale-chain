import type { Messages, ResolveOptions } from './types'

export function deepMerge(target: Messages, source: Messages): Messages {
  const result = { ...target }

  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] !== null &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key] as Messages, source[key] as Messages)
    } else {
      result[key] = source[key]
    }
  }

  return result
}

export async function resolveMessages({
  locale,
  chain,
  defaultLocale,
  loadMessages,
}: ResolveOptions): Promise<Messages> {
  const seen = new Set<string>()
  const loadOrder: string[] = []

  for (const l of [defaultLocale, ...chain.slice().reverse(), locale]) {
    if (!seen.has(l)) {
      seen.add(l)
      loadOrder.push(l)
    }
  }

  let result: Messages = {}

  for (const l of loadOrder) {
    try {
      const messages = await loadMessages(l)
      result = deepMerge(result, messages)
    } catch {
      // Silent skip — missing locales are expected in fallback chains
    }
  }

  return result
}
