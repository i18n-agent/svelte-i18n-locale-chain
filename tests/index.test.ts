import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock svelte-i18n — use vi.hoisted so mock fns are available when vi.mock factory is hoisted
const { mockInit, mockAddMessages, mockLocaleSet } = vi.hoisted(() => ({
  mockInit: vi.fn(),
  mockAddMessages: vi.fn(),
  mockLocaleSet: vi.fn(),
}))

vi.mock('svelte-i18n', () => ({
  init: mockInit,
  addMessages: mockAddMessages,
  locale: { set: mockLocaleSet },
}))

import {
  initLocaleChain,
  setLocale,
  resetLocaleChain,
  mergeMessagesFromChain,
  defaultFallbacks,
  mergeFallbacks,
  deepMerge,
} from '../src/index'
import type { Messages, FallbackMap, LoadMessages, LocaleChainConfig, ResolveOptions } from '../src/index'

const enMessages = { common: { save: 'Save', cancel: 'Cancel' }, profile: { title: 'Profile' } }
const ptMessages = { common: { save: 'Guardar' } }
const ptBRMessages = { common: { save: 'Salvar' } }

const loadMessages = vi.fn().mockImplementation((locale: string) => {
  if (locale === 'en') return enMessages
  if (locale === 'pt') return ptMessages
  if (locale === 'pt-BR') return ptBRMessages
  throw new Error(`No messages for ${locale}`)
})

beforeEach(() => {
  resetLocaleChain()
  mockInit.mockClear()
  mockAddMessages.mockClear()
  mockLocaleSet.mockClear()
  loadMessages.mockClear()
})

describe('initLocaleChain', () => {
  it('calls svelte-i18n init with fallbackLocale', async () => {
    await initLocaleChain({ loadMessages, defaultLocale: 'en' })
    expect(mockInit).toHaveBeenCalledWith({ fallbackLocale: 'en' })
  })

  it('sets initial locale when provided', async () => {
    await initLocaleChain({ loadMessages, defaultLocale: 'en', initialLocale: 'pt-BR' })
    expect(mockAddMessages).toHaveBeenCalled()
    expect(mockLocaleSet).toHaveBeenCalledWith('pt-BR')
  })

  it('does not set locale when initialLocale is not provided', async () => {
    await initLocaleChain({ loadMessages, defaultLocale: 'en' })
    expect(mockAddMessages).not.toHaveBeenCalled()
    expect(mockLocaleSet).not.toHaveBeenCalled()
  })
})

describe('setLocale', () => {
  it('throws if initLocaleChain was not called', async () => {
    await expect(setLocale('pt-BR')).rejects.toThrow('initLocaleChain() must be called before setLocale()')
  })

  it('loads chain messages and calls addMessages + locale.set', async () => {
    await initLocaleChain({ loadMessages, defaultLocale: 'en' })
    loadMessages.mockClear()
    mockAddMessages.mockClear()
    mockLocaleSet.mockClear()

    await setLocale('pt-BR')

    expect(mockAddMessages).toHaveBeenCalledWith('pt-BR', expect.objectContaining({
      common: expect.objectContaining({ save: 'Salvar' }),
    }))
    expect(mockLocaleSet).toHaveBeenCalledWith('pt-BR')
  })

  it('Mode 1: zero-config uses default fallbacks', async () => {
    await initLocaleChain({ loadMessages, defaultLocale: 'en' })
    loadMessages.mockClear()

    await setLocale('pt-BR')

    // Default chain for pt-BR is ['pt-PT', 'pt']
    // Load order: en, pt, pt-PT (throws), pt-BR
    const calledLocales = loadMessages.mock.calls.map((c: any[]) => c[0])
    expect(calledLocales).toContain('en')
    expect(calledLocales).toContain('pt')
    expect(calledLocales).toContain('pt-BR')
  })

  it('Mode 2: overrides merge with defaults', async () => {
    await initLocaleChain({
      loadMessages,
      defaultLocale: 'en',
      overrides: { 'pt-BR': ['pt'] },
    })
    loadMessages.mockClear()

    await setLocale('pt-BR')

    const calledLocales = loadMessages.mock.calls.map((c: any[]) => c[0])
    expect(calledLocales).toEqual(['en', 'pt', 'pt-BR'])
  })

  it('Mode 3: full custom fallbacks with mergeDefaults false', async () => {
    await initLocaleChain({
      loadMessages,
      defaultLocale: 'en',
      fallbacks: { 'pt-BR': ['pt'] },
      mergeDefaults: false,
    })
    loadMessages.mockClear()

    await setLocale('fr-CA')

    // fr-CA not in custom fallbacks, chain is empty
    const calledLocales = loadMessages.mock.calls.map((c: any[]) => c[0])
    expect(calledLocales).toEqual(['en', 'fr-CA'])
  })

  it('fallbacks with mergeDefaults unset merges with defaults', async () => {
    await initLocaleChain({
      loadMessages,
      defaultLocale: 'en',
      fallbacks: { 'zh-Hant': ['zh-Hans'] },
      // mergeDefaults not set — should merge with defaults
    })
    loadMessages.mockClear()

    await setLocale('pt-BR')

    // Default chain for pt-BR should still exist since defaults merged in
    const calledLocales = loadMessages.mock.calls.map((c: any[]) => c[0])
    expect(calledLocales).toContain('pt')
    expect(calledLocales).toContain('pt-BR')
  })

  it('fallbacks takes precedence over overrides when both provided', async () => {
    await initLocaleChain({
      loadMessages,
      defaultLocale: 'en',
      fallbacks: { 'pt-BR': ['pt'] },
      overrides: { 'pt-BR': ['pt-PT', 'pt'] },
      mergeDefaults: false,
    })
    loadMessages.mockClear()

    await setLocale('pt-BR')

    // fallbacks wins — chain is ['pt'], not ['pt-PT', 'pt']
    const calledLocales = loadMessages.mock.calls.map((c: any[]) => c[0])
    expect(calledLocales).toEqual(['en', 'pt', 'pt-BR'])
  })

  it('works when locale equals defaultLocale', async () => {
    await initLocaleChain({ loadMessages, defaultLocale: 'en' })
    loadMessages.mockClear()

    await setLocale('en')

    expect(loadMessages).toHaveBeenCalledTimes(1)
    expect(mockLocaleSet).toHaveBeenCalledWith('en')
  })
})

describe('mergeMessagesFromChain', () => {
  it('works as standalone utility without initLocaleChain', async () => {
    const result = await mergeMessagesFromChain({
      locale: 'pt-BR',
      loadMessages,
      defaultLocale: 'en',
      fallbackMap: { 'pt-BR': ['pt'] },
    })

    expect(result).toEqual({
      common: { save: 'Salvar', cancel: 'Cancel' },
      profile: { title: 'Profile' },
    })
  })

  it('uses defaultFallbacks when no fallbackMap provided', async () => {
    const result = await mergeMessagesFromChain({
      locale: 'pt-BR',
      loadMessages,
      defaultLocale: 'en',
    })

    // Default chain: pt-BR -> [pt-PT, pt]
    expect(result.common.save).toBe('Salvar')
  })
})

describe('resetLocaleChain', () => {
  it('clears state so setLocale throws again', async () => {
    await initLocaleChain({ loadMessages, defaultLocale: 'en' })
    resetLocaleChain()
    await expect(setLocale('en')).rejects.toThrow()
  })
})

describe('re-exports', () => {
  it('exports defaultFallbacks', () => {
    expect(defaultFallbacks).toBeDefined()
    expect(defaultFallbacks['pt-BR']).toEqual(['pt-PT', 'pt'])
  })

  it('exports mergeFallbacks', () => {
    expect(typeof mergeFallbacks).toBe('function')
  })

  it('exports deepMerge', () => {
    expect(typeof deepMerge).toBe('function')
  })
})
