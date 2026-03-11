export type Messages = Record<string, any>
export type FallbackMap = Record<string, string[]>
export type LoadMessages = (locale: string) => Messages | Promise<Messages>

export interface LocaleChainConfig {
  loadMessages: LoadMessages
  defaultLocale: string
  initialLocale?: string
  overrides?: FallbackMap
  fallbacks?: FallbackMap
  mergeDefaults?: boolean
}

export interface ResolveOptions {
  locale: string
  chain: string[]
  loadMessages: LoadMessages
  defaultLocale: string
}
