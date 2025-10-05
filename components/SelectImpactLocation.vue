<template>
  <div>
    <button @click="openModal">Select Impact Location</button>

    <div v-if="show" class="modal-overlay">
      <div class="modal">
        <header>
          <h3>Select impact location</h3>
          <button @click="closeModal">×</button>
        </header>

        <div class="map-container">
          <div id="map" ref="mapEl" style="height: 480px"></div>
        </div>

        <footer class="modal-footer">
          <div
            style="
              display: flex;
              gap: 8px;
              align-items: center;
              justify-content: flex-end;
            "
          >
            <div v-if="!selectedLatLng" style="color: #666">
              Click the map to pick a point
            </div>
            <button :disabled="!selectedLatLng" @click="confirmAndEmit">
              Confirm
            </button>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount } from "vue";

const emit = defineEmits(["selected"]);

const show = ref(false);
const map = ref(null);
const mapEl = ref(null);
const marker = ref(null);
const circleLayer = ref(null);
const selectedLatLng = ref(null);

// dynamic libs
let L = null;

function openModal() {
  show.value = true;
  initMap();
}

function closeModal() {
  show.value = false;
  teardownMap();
  // keep selectedLatLng so parent can still use it if needed
}

async function initMap() {
  if (typeof window === "undefined") return;
  if (map.value) {
    try {
      map.value.invalidateSize();
    } catch (e) {}
    return;
  }

  await nextTick();
  if (!mapEl.value) return;

  // dynamic import Leaflet (client-only)
  try {
    if (!L) {
      const leafletModule = await import("leaflet");
      L = leafletModule.default || leafletModule;

      // ensure CSS
      const cssId = "leaflet-dyn-css";
      if (!document.getElementById(cssId)) {
        const link = document.createElement("link");
        link.id = cssId;
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet/dist/leaflet.css";
        document.head.appendChild(link);
      }
    }
  } catch (err) {
    console.error("Failed to load Leaflet:", err);
    return;
  }

  map.value = L.map(mapEl.value).setView([0, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map.value);

  // force size recalculation after modal open
  setTimeout(() => {
    try {
      map.value.invalidateSize();
    } catch (e) {}
  }, 120);

  map.value.on("click", onMapClick);
}

function teardownMap() {
  if (!map.value) return;
  try {
    map.value.off("click", onMapClick);
    map.value.remove();
  } catch (e) {}
  map.value = null;
  marker.value = null;
  circleLayer.value = null;
}

function onMapClick(e) {
  const lat = e.latlng.lat;
  const lon = e.latlng.lng;
  selectedLatLng.value = { lat, lon };

  if (marker.value) map.value.removeLayer(marker.value);
  marker.value = L.marker([lat, lon], { draggable: true }).addTo(map.value);
  marker.value.on("drag", (ev) => {
    const p = ev.target.getLatLng();
    selectedLatLng.value = { lat: p.lat, lon: p.lng };
  });
}

function confirmAndEmit() {
  if (!selectedLatLng.value) return;
  // Emit coords to parent
  emit("selected", { ...selectedLatLng.value });
  // close the modal and free map resources
  closeModal();
}

onBeforeUnmount(() => teardownMap());
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: white;
  width: 90%;
  max-width: 900px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
header {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.map-container {
  padding: 12px;
}
.modal-footer {
  padding: 10px 12px;
  border-top: 1px solid #eee;
}
button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
