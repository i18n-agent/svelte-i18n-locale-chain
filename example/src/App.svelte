<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { setLocale } from 'svelte-i18n-locale-chain'

  let currentLocale = $state('pt-BR')

  async function switchLocale(loc: string) {
    await setLocale(loc)
    currentLocale = loc
  }
</script>

<main>
  <h1>svelte-i18n-locale-chain demo</h1>

  <p>Current locale: <strong>{currentLocale}</strong></p>

  <div>
    <p>greeting: <strong>{$_('greeting')}</strong></p>
    <p>farewell: <strong>{$_('farewell')}</strong></p>
    <p>welcome: <strong>{$_('welcome')}</strong></p>
  </div>

  <div style="margin-top: 1rem;">
    <button onclick={() => switchLocale('en')}>English</button>
    <button onclick={() => switchLocale('pt-BR')}>Português (BR)</button>
  </div>

  <div style="margin-top: 1rem; padding: 1rem; background: #f0f0f0; border-radius: 4px;">
    <h3>Expected for pt-BR:</h3>
    <ul>
      <li>greeting: "Oi" (from pt-BR.json)</li>
      <li>farewell: "Adeus" (falls back to pt.json)</li>
      <li>welcome: "Welcome to LocaleChain" (falls back to en.json)</li>
    </ul>
  </div>
</main>
