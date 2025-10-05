<template>
  <div class="organizer">
    <div class="asteroid">
      <!-- pass the mapped payload to the Asteroid component -->
      <Asteroid v-if="asteroidPayload" :asteroidData="asteroidPayload" />
    </div>

    <div class="info-card">
      <div
        class="info-row"
        style="justify-content: space-between; align-items: center"
      >
        <div style="display: flex; align-items: center; gap: 8px">
          <img src="@/assets/styles/icons/calendar.png" class="icon" />
          <div>
            <div style="font-size: 12px; color: #666">Date</div>

            <!-- date picker: user may pick a day, but min/max restrict to today -->
            <div style="font-weight: 700; display:flex; align-items:center; gap:8px;">
              <input
                type="date"
                v-model="params.start_date"
                :max="today"
                @change="onDateChange"
                aria-label="Select date (only until today allowed)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="info-row">
        <div v-if="neos.length > 0">
          <label
            for="neo-select"
            style="font-size: 12px; color: #666; margin-right: 8px"
            >Pick:</label
          >
          <select id="neo-select" v-model="selectedIndex">
            <option v-for="(n, i) in neos" :key="n.id" :value="i">
              {{ n.name }} — {{ formatKm(n.distance_km) }} km
            </option>
          </select>
        </div>
      </div>
      

      <h2 class="name">
        <template v-if="loading">Loading...</template>
        <template v-else-if="error">Error: {{ error }}</template>
        <template v-else-if="selectedNeo">{{ selectedNeo.name }}</template>
        <template v-else>Nenhum asteroide encontrado</template>
      </h2>


      <hr class="divider" />


      <h1 class="categories">Physical properties</h1>
      <div class="info" v-if="!loading && !error && selectedNeo">
        <div class="info-row">
          <img src="@/assets/styles/icons/ruler.svg" class="icon" />
          <h1 class="topic">
            Diameter: <strong>{{ formatMeters(diameterAvg) }}</strong> (avg)
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/weight.png" class="icon" />
          <h1 class="topic">
            Mass: <strong>{{ formatMeters(diameterAvg) }}</strong> (avg)
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/velocity.svg" class="icon" />
          <h1 class="topic">
            Median Velocity:
            <strong>{{ formatKmh(medianVelocity) }}</strong> km/h
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/earth.svg" class="icon" />
          <h1 class="topic">
            Earth Distance: <strong>{{ formatKm(distanceKm) }}</strong> km
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/shine.svg" class="icon" />
          <h1 class="topic">
            Magnitude: <strong>{{ selectedNeo.absolute_magnitude_h }}</strong>
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/distance.svg" class="icon" />
          <h1 class="topic">
            Closest approach: <strong>{{ closestApproachDate }}</strong>
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/danger.svg" class="icon" />
          <h1 class="topic">
            Danger:
            <strong>{{
              selectedNeo.is_potentially_hazardous_asteroid ? "Yes" : "No"
            }}</strong>
          </h1>
        </div>

        <hr class="divider" />

        <h1 class="categories">Orbit information</h1>
        
        <div class="info-row">
          <img src="@/assets/styles/icons/angle.svg" class="icon" />
          <h1 class="topic">
            Orbit Angle: <strong>{{ orbitInclination }}</strong
            >
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/axis-major.png" class="icon" />
          <h1 class="topic">
            Major Axis:
            <strong>{{
              selectedNeo.is_potentially_hazardous_asteroid ? "Yes" : "No"
            }}</strong>
          </h1>
        </div>



        <div class="info-row">
          <img src="@/assets/styles/icons/axis-minor.png" class="icon" />
          <h1 class="topic">
            Minor Axis:
            <strong>{{
              selectedNeo.is_potentially_hazardous_asteroid ? "Yes" : "No"
            }}</strong>
          </h1>
        </div>




        <div class="info-row">
          <img src="@/assets/styles/icons/period.png" class="icon" />
          <h1 class="topic">
            Period:
            <strong>{{
              selectedNeo.is_potentially_hazardous_asteroid ? "Yes" : "No"
            }}</strong>
          </h1>
        </div>


                <div class="info-row">
          <img src="@/assets/styles/icons/circle.png" class="icon" />
          <h1 class="topic">
            Eccentricity:
            <strong>{{
              selectedNeo.is_potentially_hazardous_asteroid ? "Yes" : "No"
            }}</strong>
          </h1>
        </div>



        <div class="info-row">
          <img src="@/assets/styles/icons/angle.svg" class="icon" />
          <h1 class="topic">
            Inclination:
            <strong>{{
              selectedNeo.is_potentially_hazardous_asteroid ? "Yes" : "No"
            }}</strong>
          </h1>
        </div>


        <div class="info-row">
          <img src="@/assets/styles/icons/a-e.png" class="icon" />
          <h1 class="topic">
            Aphelium:
            <strong>{{
              selectedNeo.is_potentially_hazardous_asteroid ? "Yes" : "No"
            }}</strong>
          </h1>
        </div>


        <div class="info-row">
          <img src="@/assets/styles/icons/a-e.png" class="icon" />
          <h1 class="topic">
            Perihelium:
            <strong>{{
              selectedNeo.is_potentially_hazardous_asteroid ? "Yes" : "No"
            }}</strong>
          </h1>
        </div>


        <div class="info-row">
          <img src="@/assets/styles/icons/speed.png" class="icon" />
          <h1 class="topic">
          Total Energy:
            <strong>{{
              selectedNeo.is_potentially_hazardous_asteroid ? "Yes" : "No"
            }}</strong>
          </h1>
        </div>
        <hr class="divider" />




<h1 class="categories">Simulation</h1>


        <div class="info-row">
          <img src="@/assets/styles/icons/place.svg" class="icon" />
          <h1 class="topic">Target Country: <strong>N/A</strong></h1>
        </div>
      </div>

      <div
        v-else-if="!loading && !error && neos.length === 0"
        style="padding: 20px"
      >
        No near-earth objects found in the requested date range.
      </div>

      <NuxtLink to="/personalize">
        <button class="start">Start Simulation</button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from "vue";
import Asteroid from "@/components/Asteroid.vue";

/**
 * Frontend call to NASA NEO Feed API and parsing logic.
 * - user may pick a date (calendar). end_date forced equal to start_date.
 */

// --- API parameters ---
// Backend endpoint (same-origin). If your backend is on a different origin,
// change this to the full URL, e.g. "https://api.example.com/asteroid/feed"
const BACKEND_FEED = "http://localhost:5000/asteroid/feed";

// helper: return local yyyy-mm-dd (user's local timezone)
function getLocalISODate() {
  // create a Date for now and shift by timezone offset so toISOString() yields local date
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60000;
  const local = new Date(now.getTime() - tzOffsetMs);
  return local.toISOString().slice(0, 10); // "YYYY-MM-DD"
}
const today = getLocalISODate();

// make params reactive so v-model binding updates it
const params = reactive({
  start_date: today, // initialize to today
  end_date: today, // will always equal start_date
});

// reactive state
const loading = ref(true);
const error = ref(null);
const neos = ref([]); // parsed list of NEOs (flattened and sorted by closest approach)
const selectedIndex = ref(0);

// helper formatters
function formatMeters(n) {
  if (n == null) return "N/A";
  return `${Number(n).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })} m`;
}
function formatKmh(n) {
  if (n == null) return "N/A";
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function formatKm(n) {
  if (n == null) return "N/A";
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// parse NASA response: flatten the near_earth_objects by date and extract useful fields
function processNeoData(json) {
  const neoByDate = json.near_earth_objects || {};
  const entries = [];

  // iterate over dates
  for (const dateKey of Object.keys(neoByDate)) {
    const list = neoByDate[dateKey] || [];
    for (const neo of list) {
      // pick first close_approach_data entry if exists (should be within range)
      const cad =
        Array.isArray(neo.close_approach_data) &&
        neo.close_approach_data.length > 0
          ? neo.close_approach_data[0]
          : null;

      const distance_km =
        cad && cad.miss_distance && cad.miss_distance.kilometers
          ? parseFloat(cad.miss_distance.kilometers)
          : null;

      const velocity_kmh =
        cad &&
        cad.relative_velocity &&
        cad.relative_velocity.kilometers_per_hour
          ? parseFloat(cad.relative_velocity.kilometers_per_hour)
          : null;

      // estimated diameter meters - take the meters min/max if available
      const ed = neo.estimated_diameter && neo.estimated_diameter.meters;
      const diameter_min =
        ed && ed.estimated_diameter_min
          ? parseFloat(ed.estimated_diameter_min)
          : null;
      const diameter_max =
        ed && ed.estimated_diameter_max
          ? parseFloat(ed.estimated_diameter_max)
          : null;
      const diameter_avg =
        diameter_min != null && diameter_max != null
          ? (diameter_min + diameter_max) / 2
          : null;

      const obj = {
        id: neo.id,
        name: neo.name,
        diameter_min,
        diameter_max,
        diameter_avg,
        distance_km,
        velocity_kmh,
        absolute_magnitude_h: neo.absolute_magnitude_h,
        close_approach_data: neo.close_approach_data || [],
        orbital_data: neo.orbital_data || {},
        is_potentially_hazardous_asteroid:
          !!neo.is_potentially_hazardous_asteroid,
        raw: neo,
      };

      entries.push(obj);
    }
  }

  // sort by closest approach distance (ascending), putting null distances at the end
  entries.sort((a, b) => {
    const da = a.distance_km == null ? Number.POSITIVE_INFINITY : a.distance_km;
    const db = b.distance_km == null ? Number.POSITIVE_INFINITY : b.distance_km;
    return da - db;
  });

  return entries;
}

async function fetchNeos() {
  if (params.start_date > today) {
    error.value = `You may only select until today's date (${today}).`;
    neos.value = [];
    selectedIndex.value = -1;
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    params.end_date = params.start_date;

    // Build backend URL (BACKEND_FEED already includes path)
    const url = new URL(BACKEND_FEED);
    url.searchParams.set("start_date", params.start_date);
    url.searchParams.set("end_date", params.end_date);

    const resp = await fetch(url.toString(), {
      method: "GET",
      // include credentials if your backend requires cookies/session auth:
      // credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!resp.ok) {
      // try to read body for a helpful error message
      let msg = `HTTP ${resp.status} ${resp.statusText}`;
      try {
        const errJson = await resp.json();
        if (errJson && errJson.message) msg = errJson.message;
      } catch (e) {}
      throw new Error(msg);
    }

    const json = await resp.json();

    // backend returns the NASA-like JSON feed, so we can reuse processNeoData
    const parsed = processNeoData(json);
    neos.value = parsed;
    selectedIndex.value = parsed.length > 0 ? 0 : -1;
  } catch (err) {
    error.value = err.message || String(err);
    neos.value = [];
    selectedIndex.value = -1;
  } finally {
    loading.value = false;
  }
}

// called when date input changes
function onDateChange() {
  if (params.start_date > today) {
    // reset to today and show error
    params.start_date = today;
    params.end_date = today;
    error.value = `Only until today's date is allowed (${today}). Resetting.`;
    return;
  }
  // enforce equality and fetch new data
  params.end_date = params.start_date;
  error.value = null;
  fetchNeos();
}

// derived reactive values for the currently selected NEO
const selectedNeo = computed(() => {
  if (!neos.value || neos.value.length === 0) return null;
  const idx = selectedIndex.value;
  if (idx == null || idx < 0 || idx >= neos.value.length) return neos.value[0];
  return neos.value[idx];
});

const diameterAvg = computed(() =>
  selectedNeo.value ? selectedNeo.value.diameter_avg : null
);
const medianVelocity = computed(() =>
  selectedNeo.value ? selectedNeo.value.velocity_kmh : null
);
const distanceKm = computed(() =>
  selectedNeo.value ? selectedNeo.value.distance_km : null
);
const closestApproachDate = computed(() => {
  if (!selectedNeo.value) return "N/A";
  const cad =
    selectedNeo.value.close_approach_data &&
    selectedNeo.value.close_approach_data[0];
  return cad ? cad.close_approach_date_full || cad.close_approach_date : "N/A";
});
const orbitInclination = computed(() => {
  if (!selectedNeo.value) return "N/A";
  const inc =
    selectedNeo.value.orbital_data &&
    selectedNeo.value.orbital_data.inclination;
  return inc ? Number(inc).toFixed(2) : "N/A";
});

// --- map selectedNeo -> asteroidPayload (unchanged mapping) ---
const asteroidPayload = computed(() => {
  const neo = selectedNeo.value;
  if (!neo) return null;

  const asNumber = (v, fallback = null) => {
    if (v == null) return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  // diameters (m)
  const diameter_min = asNumber(neo.diameter_min, null);
  const diameter_max = asNumber(neo.diameter_max, null);
  const diameter_avg = asNumber(neo.diameter_avg, null);
  const diameterMeters = diameter_avg ?? diameter_max ?? diameter_min ?? null;

  // distance and velocities
  const miss_distance_km = asNumber(neo.distance_km, null);
  const relative_velocity_km_h = asNumber(neo.velocity_kmh, null);
  const relative_velocity_km_s =
    relative_velocity_km_h != null ? relative_velocity_km_h / 3600 : null;

  // magnitude & hazard
  const absolute_magnitude_h = asNumber(neo.absolute_magnitude_h, null);
  const is_potentially_hazardous_asteroid =
    !!neo.is_potentially_hazardous_asteroid;

  // composition / albedo defaults (not in feed)
  const composition = "rocky";
  const albedo = 0.12;

  // mass estimation (sphere, density ~ 2500 kg/m^3 for rocky)
  let mass_kg = null;
  if (diameterMeters != null) {
    const r = diameterMeters / 2.0;
    const volume = (4 / 3) * Math.PI * Math.pow(r, 3);
    const density = 2500;
    mass_kg = volume * density;
  }

  // entry speed/angle heuristics
  const entry_speed_km_s = relative_velocity_km_s;
  const entry_angle_deg =
    neo.orbital_data && neo.orbital_data.inclination
      ? Number(neo.orbital_data.inclination)
      : 45;

  // impact probability heuristic
  const impact_probability = is_potentially_hazardous_asteroid ? 2e-6 : 1e-7;

  // fragmentation probability heuristic
  let fragmentation_probability = 0.45;
  if (diameterMeters == null) fragmentation_probability = 0.5;
  else if (diameterMeters < 50) fragmentation_probability = 0.8;
  else if (diameterMeters < 500) fragmentation_probability = 0.45;
  else fragmentation_probability = 0.2;

  // impact energy (tons of TNT) if possible
  let impact_energy_tnt = null;
  if (mass_kg != null && entry_speed_km_s != null) {
    const v_m_s = entry_speed_km_s * 1000;
    const energy_j = 0.5 * mass_kg * v_m_s * v_m_s;
    impact_energy_tnt = energy_j / 4.184e9; // convert J -> tons of TNT
  }

  // pole & approach vector placeholders (not in feed)
  const pole_orientation = null;
  const approach_vector = { x: 0, y: 0, z: 1 };

  return {
    id: String(neo.id ?? neo.name ?? Math.random().toString(36).slice(2, 9)),
    name: neo.name ?? "Unknown",
    diameterMeters: diameterMeters != null ? Number(diameterMeters) : null,
    estimated_diameter_min: diameter_min,
    estimated_diameter_max: diameter_max,
    relative_velocity_km_s:
      entry_speed_km_s != null ? Number(entry_speed_km_s) : null,
    relative_velocity_km_h:
      relative_velocity_km_h != null ? Number(relative_velocity_km_h) : null,
    miss_distance_km: miss_distance_km,
    absolute_magnitude_h: absolute_magnitude_h,
    is_potentially_hazardous_asteroid: is_potentially_hazardous_asteroid,
    composition,
    albedo,
    mass_kg: mass_kg,
    rotation_period_hours: null,
    lightcurve_amplitude: null,
    pole_orientation,
    approach_vector,
    impact_probability,
    impact_energy_tnt: impact_energy_tnt,
    predicted_impact_country: "Unknown",
    fragmentation_probability,
    entry_speed_km_s: entry_speed_km_s,
    entry_angle_deg: entry_angle_deg,
    visual_style: "realistic",
    show_orbit_line: true,
    orbit_color: "#88ccff",
    label: neo.name ?? "Asteroid",
    showHUD: true,
  };
});

// keep selectedIndex valid when neos list changes
watch(neos, (n) => {
  if (!n || n.length === 0) selectedIndex.value = -1;
  else if (selectedIndex.value < 0) selectedIndex.value = 0;
});

onMounted(() => {
  fetchNeos();
});
</script>

<style scoped>
/* (your original CSS unchanged — kept here to keep the file self-contained) */
@import url("https://fonts.googleapis.com/css2?family=Bitcount+Prop+Single+Ink:wght@100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap");
/* Root container fills viewport and is reference for absolutely positioned children */
.organizer {
  margin: 0;
  padding: 0;
   overflow: hidden;
}

.asteroid {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 950px;
  max-width: calc(100% - 420px);
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.info-card {
  position: absolute;
  top: 0;
  right: 0;
  width: 350px;
  max-width: 38%;
  height: 100vh; /* ocupa toda a altura da janela */
  padding: 20px;
  box-sizing: border-box;
  background-color: azure;

  /* estilos visuais */
  border-radius: 0;
  box-shadow: none;
  margin: 0;
  border-left: 2px solid #ccc;


  overflow-y: auto;
  overflow-x: hidden; /* evita barra lateral horizontal */
}

.categories{
    text-align: center;
  font-size: 25px;
  color: black;
  font-family: "Roboto", sans-serif;
  font-weight: 900;

}

.info-card .name {
  text-align: center;
  font-size: 30px;
  color: black;
  font-family: "Roboto", sans-serif;
  font-weight: 900;
  padding: 30px;
}
.info-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
  margin: 8px 0;
  line-height: 1.3;
  color: black;
}

.topic {
  font-size: 17px;
  font-weight: 300;
  line-height: 1.5;
  max-width: 700px;
}

.icon {
  height: 25px;
  width: 25px;
}

.divider {
  border: 0;
  height: 1px;
  background: #ccc;
  margin: 12px 0;
}

.start {
  text-decoration: none;
  color: inherit;
  background-color: rgb(0, 0, 0);
  color: rgb(255, 255, 255);
  padding: 20px 30px;
  height: 30px;
  width: 300px;
  border: none;
  border-radius: 30px;
  font-size: 15px;
  font-weight: bolder;
  text-transform: uppercase;
  cursor: pointer;
  margin: 10px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease-in-out;
  margin: 30px auto 10px;
}

a {
  text-decoration: none;
}

.start:hover {
  transform: scale(1.05);
}

@media (max-width: 1200px) {
  .asteroid {
    width: 650px;
    height: 480px;
  }
  .info-card {
    right: 16px;
    width: 300px;
    height: auto;
    max-height: 80vh;
  }
}

@media (max-width: 800px) {
  .info-card {
    position: static;
    transform: none;
    width: calc(100% - 40px);
    margin: 20px auto 0;
    left: 0;
    right: 0;
  }
  .organizer {
    height: auto;
    padding: 40px 0;
  }
  .asteroid {
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    top: 0;
    margin: 0 auto;
  }
}
</style>
