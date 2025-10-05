<script setup>
// In layouts/default.vue <script setup>
const menuItems = [
  {
    items: [
      { label: "Home", icon: "fi fi-rr-home", route: "/" },
      { label: "Help", icon: "fi fi-rr-info", route: "/help" },
    ],
  },
  {
    items: [
      {
        label: "Simulation",
        icon: "fi fi-rr-meteor",
        route:"/simulation",
      },
      {
        label: "Creator",
        icon: "fi fi-rr-magic-wand",
        route: "/personalize",
      },
    ],
  },
];
</script>

<template>
  <div class="layout-grid">
    <aside class="sidebar">
      <SideBar :menu-items="menuItems" />
    </aside>

    <main class="page-content">
      <div class="container mx-auto">
        <slot />
      </div>
    </main>
  </div>
</template>

<style>
*::before,
*::after {
  box-sizing: border-box;
}
/* 2. Remove default margin */
* {
  margin: 0;
}
</style>

<style scoped>
/* This creates the main two-column grid for the page body */
.layout-grid {
  display: grid;
  /* Column 1: Can be 0px, but not wider than 200px.
    Column 2: Takes all the rest of the available space.
  */
  grid-template-columns: auto 1fr;

  /* This transition ensures the grid itself animates smoothly as the column
    width changes. We use the same timing as the sidebar's internal transition
    for a perfectly synchronized animation.
  */
  transition: grid-template-columns 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  /* Ensure the grid takes at least the full height of the viewport */
  min-height: calc(100vh);
}

.page-content .container {
  padding: 20px;
}
</style>
