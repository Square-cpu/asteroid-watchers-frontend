<script setup>
import { ref, computed } from "vue";

// Defines the props for the input component.
const props = defineProps({
  // v-model value for the input field.
  modelValue: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  // Type of the input, e.g., 'text', 'email', 'password'.
  type: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
});

// Defines the event for v-model updates.
const emit = defineEmits(["update:modelValue"]);

// Internal state to track password visibility.
const isPasswordVisible = ref(false);

// Checks if the input type is 'password'.
const isPasswordType = computed(() => props.type === "password");

// Dynamically computes the input type to toggle between 'text' and 'password'.
const inputType = computed(() => {
  if (isPasswordType.value) {
    return isPasswordVisible.value ? "text" : "password";
  }
  return props.type;
});

// Toggles the visibility state.
function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value;
}

// Emits the updated value to the parent component.
function updateValue(event) {
  emit("update:modelValue", event.target.value);
}
</script>

<template>
  <div class="form-group">
    <label :for="label" class="form-label">{{ label }}</label>
    <!-- Renders a special wrapper for password fields to include the toggle button -->
    <div v-if="isPasswordType" class="input-wrapper">
      <input
        :id="label"
        :value="modelValue"
        :type="inputType"
        class="form-input-password"
        :placeholder="placeholder"
        :required="required"
        @input="updateValue"
      />
      <button
        type="button"
        class="password-toggle-btn"
        aria-label="Toggle password visibility"
        @click="togglePasswordVisibility"
      >
        <svg
          v-if="!isPasswordVisible"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path
            d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
          />
          <path
            d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
          />
          <line x1="2" x2="22" y1="2" y2="22" />
        </svg>
      </button>
    </div>
    <!-- Renders a standard input for all other types -->
    <input
      v-else
      :id="label"
      :value="modelValue"
      :type="type"
      class="form-input"
      :placeholder="placeholder"
      :required="required"
      @input="updateValue"
    />
  </div>
</template>

<style lang="scss" scoped>
/* Scoped styles for the input component */
.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #888;
}

.input-wrapper {
  position: relative;
}

.form-input,
.form-input-password {
  box-sizing: border-box;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: #6a5acd;
    box-shadow: 0 0 0 3px rgba(106, 90, 205, 0.2);
  }
}

.form-input-password {
  padding-right: 3rem; /* Make space for the icon */
}

.password-toggle-btn {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  &:hover {
    color: #333;
  }
}
</style>
