<template>
  <footer class="minimal-footer">
    <div class="footer-content">
      <p>&copy; {{ currentYear }} Asteroid Watchers&trade;. All Rights Reserved.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Dynamically gets the current year so it's always up to date.
const currentYear = ref(new Date().getFullYear());
</script>

<style scoped>
.minimal-footer {
  padding: 1.5rem 1rem; /* 24px top/bottom, 16px left/right */
}

.footer-content {
  /* Center the content horizontally */
  max-width: 1200px; /* Optional: Constrain width on very large screens */
  margin: 0 auto;
  text-align: center;
}

.footer-content p {
  margin: 0; /* Remove default paragraph margin */
  font-size: 0.875rem; /* 14px */
  color: #666666; /* A soft, dark gray for the text */
}
</style>
