<script setup>
// This component provides a generic dialog/modal functionality.
// It is controlled via v-model.

// Defines the props accepted by the component.
const props = defineProps({
  // The 'modelValue' is part of the v-model pattern. It's a boolean to show/hide the dialog.
  modelValue: {
    type: Boolean,
    required: true,
  },
  // The title to be displayed in the dialog header.
  title: {
    type: String,
    default: "",
  },
});

// Defines the events this component can emit.
const emit = defineEmits(["update:modelValue"]);

// Emits an event to the parent to close the dialog.
// This allows the parent to update the v-model state.
function closeDialog() {
  emit("update:modelValue", false);
}
</script>

<template>
  <!-- 
    A simplified dialog implementation without Teleport or Transition.
    The component will now render directly where it is placed in the parent.
  -->
  <div v-if="modelValue" class="dialog-overlay" @click.self="closeDialog">
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ title }}</h2>
        <button class="close-button" @click="closeDialog">&times;</button>
      </div>
      <div class="dialog-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* Scoped styles for the simplified dialog component */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.dialog-container {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 400px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s ease;

  &:hover {
    color: #333;
  }
}

.dialog-body {
  padding: 1.5rem;
}
</style>
