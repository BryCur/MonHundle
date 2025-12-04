<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import LocaleSelector from './components/LocaleSelector.vue';
import { onMounted } from 'vue';
import router from './router';

onMounted(async () => {
  router.push("/");
}) 
</script>

<template>
  <header>
    <div class="wrapper">
      <nav class="navigation">
        <RouterLink to="/unlimited">Unlimited</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
      <div class="lang-select">
        <LocaleSelector></LocaleSelector>
      </div>
    </div>
  </header>

  <div class="game-area">
    <RouterView />
  </div>
  <footer>
    <div class="footer-disclaimer">
      Unofficial fan project - Monster Hunter is a trademark of Capcom Co., Ltd.
    </div>

    <div class="footer-main">
      <span>Made with ❤️ by <a href="https://github.com/BryCur">Corbac</a></span>
    </div>

    <div class="game-version">
      <span>v0.1 prototype</span>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
  padding: 0 1rem;
  margin-bottom: 4rem;

  .wrapper {
    display: flex;
    place-items: flex-start;
    justify-content: space-between;
    align-items: center;
    width: 100%;

      nav {
        font-size: 12px;
        text-align: center;
    
        a {
          display: inline-block;
          padding: 0 1rem;
          border-left: 1px solid var(--color-border);
    
          &:first-of-type {
            border: 0;
          }
    
          .router-link-exact-active {
            color: var(--color-text);
      
            &:hover {
              background-color: transparent;
            }
          }
        }
    
      }

      .lang-select{
        display: none;
        align-self: flex-end;
      }
  }
}

.game-area {
  max-width: 1280px;
  margin:auto;
  flex:1;
}

footer {
  margin-top: 5rem;
  display: flex;
  justify-content: space-between;
  font-size: 9pt;
  
  .game-version, .footer-disclaimer {
    min-width: 300px;
    flex:0
  }

  .footer-main {
    flex:1;
    text-align: center;
  }
  .game-version{
    text-align: right;
  }
}


@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  nav {
    text-align: left;
    font-size: 1rem;
  }
}
</style>
