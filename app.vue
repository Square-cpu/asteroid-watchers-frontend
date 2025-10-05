<script setup>
  const title = 'Asteroid Watchers'
  const description =
    'An interactive platform about asteroid collisions, featuring 3D presentations, real-time orbital simulations, and impact scenarios. Learn about asteroid threats, deflection methods, and explore what would happen if one hit Earth.'

  useSeoMeta({
    title: title,
    description: description,
  })
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="css"></style>
