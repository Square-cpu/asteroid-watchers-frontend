<template>
  <div
    class="navbar *:text-xl *:text-white *:font-bold bg-opacity-75 h-fit flex z-10 bg-darker-blue box-border md:p-10 m-auto flex-col md:flex-row md:sticky top-0 left-0 items-center justify-center w-full"
  >
    <NuxtLink to="/" class="flex md:hidden mb-4 mt-3">
      <Logo />
    </NuxtLink>
    <div
      class="flex flex-row mx-auto items-center lg:gap-8 md:gap-4 gap-3 sm:flex-nowrap flex-wrap justify-center"
    >
      <NuxtLink to="/" class="hidden md:flex">
        <Logo />
      </NuxtLink>
      <NuxtLink to="/" class="item">Início</NuxtLink>
      <!-- <NuxtLink to="/ourteam" class="item">Nossos Talentos</NuxtLink> -->
      <!-- <NuxtLink to="/projects" class="item">Cases</NuxtLink> -->

      <NuxtLink to="/contact" class="item">Fale Conosco</NuxtLink>
      <!-- <NuxtLink to="/program/apply" class="item">Faça parte</NuxtLink> -->

      <!-- <NuxtLink
        :to="destiny"
        class="bg-jtt-green text-black hover:text-white transition-all box-border px-4 uppercase cursor-pointer"
      >
        Área do aluno
      </NuxtLink> -->
      <NuxtLink
        to="/program/apply"
        class="bg-jtt-green text-black hover:bg-white transition-all box-border px-4 uppercase cursor-pointer"
      >
        Inscreva-se
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const destiny = ref<string>();
const { status } = useAuth();
// @ts-ignore
destiny.value = status != "unauthenticated" ? "/login" : "/profile";
</script>

<style scoped lang="scss">
.navbar {
  & {
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: visible;
    margin-top: 12px;
  }
  * {
    font-family: "LoRes 15 OT Narrow";
  }

  .item {
    transition: 0.1s;
    text-transform: uppercase;
    &:hover {
      color: #19b14b;
    }
  }
}
</style>
