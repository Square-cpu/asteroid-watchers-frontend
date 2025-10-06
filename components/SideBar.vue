<template>
  
  <aside :class="['sidebar', { collapsed }]">

    <nav class="menu">
   
      <div
        v-for="(section, sectionIndex) in menuItems"
        :key="`section-${sectionIndex}`"
        class="menu-section"
      >

        <h3 v-if="section.title && !collapsed" class="section-title">
          {{ section.title }}
        </h3>


        <div
          v-for="(item, itemIndex) in section.items"
          :key="`item-${itemIndex}`"
          class="menu-item-wrapper"
        >

          <div
            v-if="item.children"
            class="item-content"
            :class="{ 'active-parent': isParentActive(item) }"
            @click="toggleSubmenu(item)"
          >
            <i v-if="item.icon" class="icon" :class="item.icon" />
            <span v-if="!collapsed" class="label">{{ item.label }}</span>
            <i
              v-if="!collapsed && item.children"
              class="submenu-arrow"
              :class="{ open: item.open }"
            />
          </div>


          <NuxtLink
            v-else
            :to="item.route || '/'"
            class="item-content"
            active-class="active"
          >
            <i v-if="item.icon" class="icon" :class="item.icon" />
            <span v-if="!collapsed" class="label">{{ item.label }}</span>
          </NuxtLink>


          <div v-if="item.children && item.open && !collapsed" class="submenu">
            <NuxtLink
              v-for="(child, childIndex) in item.children"
              :key="`child-${childIndex}`"
              :to="child.route || '/'"
              class="submenu-item"
              active-class="active"
            >
              <i v-if="child.icon" class="icon" :class="child.icon" />
              <span class="label">{{ child.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <Footer v-show="!collapsed" />
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const { data: session } = useAuth();
const user = computed(() => session.value);

interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
  open?: boolean;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

const props = defineProps<{
  menuItems: MenuSection[];
}>();

const collapsed = ref(false);

const route = useRoute();

const toggleCollapse = () => {
  collapsed.value = !collapsed.value;

  if (collapsed.value) {
    props.menuItems.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          item.open = false;
        }
      });
    });
  }
};

/**
 * Toggles a submenu's visibility (accordion style).
 * @param {MenuItem} clickedItem - The parent menu item that was clicked.
 */
const toggleSubmenu = (clickedItem: MenuItem) => {
  if (collapsed.value) return; 

  const wasOpen = clickedItem.open;

  props.menuItems.forEach((section) => {
    section.items.forEach((item) => {
      if (item.children) {
        item.open = false;
      }
    });
  });

  if (!wasOpen) {
    clickedItem.open = true;
  }
};

/**
 * Checks if any child of a parent menu item is the currently active route.
 * @param {MenuItem} parentItem - The parent menu item to check.
 * @returns {boolean} - True if a child route is active.
 */
const isParentActive = (parentItem: MenuItem): boolean => {
  if (!parentItem.children) return false;
  return parentItem.children.some(
    (child) => child.route && route.path.startsWith(child.route)
  );
};


watch(
  () => route.path,
  (newPath) => {
    props.menuItems.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {

          const isChildActive = item.children.some(
            (child) => child.route && newPath.startsWith(child.route)
          );
          item.open = isChildActive;
        }
      });
    });
  },
  { immediate: true } 
);
</script>

<style lang="scss" scoped>
.sidebar {
  width: 200px;

  background-color: azure;
  transition: width 0.2s;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  border-right: 1px solid #e6ebf1;
  z-index: 1;
}

.sidebar-header {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;

  img {
    max-height: 28px;
    max-width: 28px;
    border-radius: 100%;
    margin-right: 12px;
  }
}

.brand-logo {
  height: 24px;
  width: auto;
}

.menu {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;

  .v-list {
    background-color: transparent;
  }

  .v-list-item__icon {
    color: #ccc;
  }

  .v-list-item__content {
    color: #ccc;
    font-weight: 900;
  }
}

.menu-item-wrapper {
  a {
    text-decoration: none;
  }
}
.menu-section {
  margin-top: 16px;
}
.section-title {
  font-size: 12px;
  color: #8898aa;
  text-transform: uppercase;
  padding: 0 16px;
  margin-bottom: 4px;
}

.menu-item {
  padding: 4px 0;
}
.item-content {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}
.item-content:hover {
  background: rgba(98, 91, 255, 0.05);
}
.menu-item.active > .item-content {
  background: rgba(98, 91, 255, 0.1);
  border-left: 4px solid #635bff;
}
.icon {
  width: 20px;
  display: inline-flex;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
  color: #000000;
}
.sidebar.collapsed .icon {
  margin: 0;
}
.label {
  font-size: 14px;
  color: #000000;
}
.menu-item.active .icon {
  color: #000000;
}
.menu-item.active .label {
  color: #000000;
}

.submenu {
  padding-left: 28px;
}
.submenu-item {
  display: flex;
  align-items: center;
  padding: 6px 16px;
  cursor: pointer;
  transition: background 0.2s;
  color: #000000;
}
.submenu-item:hover {
  background: rgba(98, 91, 255, 0.05);
}
.submenu-item .icon {
  color: #000000;
}
.submenu-item .label {
  color: #000000;
}
.submenu-item.active .icon {
  color: #635bff;
}
.submenu-item.active .label {
  color: #000000;
}

@import url("https://cdn-uicons.flaticon.com/2.4.2/uicons-regular-rounded/css/uicons-regular-rounded.css");
</style>
