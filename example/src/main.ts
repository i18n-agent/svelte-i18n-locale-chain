import { mount } from 'svelte'
import { initLocaleChain } from 'svelte-i18n-locale-chain'
import App from './App.svelte'

async function start() {
  await initLocaleChain({
    loadMessages: (locale: string) =>
      import(`./locales/${locale}.json`).then((m) => m.default),
    defaultLocale: 'en',
    initialLocale: 'pt-BR',
  })

  mount(App, { target: document.getElementById('app')! })
}

start()
