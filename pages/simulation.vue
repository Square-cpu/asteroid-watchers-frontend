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

            <!-- date picker: user may pick a day, but max restrict to today -->
            <div
              style="
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 8px;
              "
            >
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
            Mass:
            <strong>
              {{
                asteroidPayload && asteroidPayload.mass_kg != null
                  ? Number(asteroidPayload.mass_kg).toLocaleString(undefined, {
                      maximumFractionDigits: 3,
                    }) + " kg"
                  : selectedNeo && selectedNeo._mass != null
                  ? Number(selectedNeo._mass).toLocaleString(undefined, {
                      maximumFractionDigits: 3,
                    }) + " kg"
                  : "N/A"
              }}
            </strong>
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/velocity.svg" class="icon" />
          <h1 class="topic">
            Median Velocity:
            <strong>{{ formatKmh(medianVelocity) }}</strong> km/s
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
            Magnitude:
            <strong>{{
              absoluteMagnitude != null
                ? Number(absoluteMagnitude).toLocaleString(undefined, {
                    maximumFractionDigits: 3,
                  })
                : "N/A"
            }}</strong>
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/distance.svg" class="icon" />
          <h1 class="topic">
            Closest approach:
            <strong>{{ closestApproachDate ?? "N/A" }}</strong>
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/danger.svg" class="icon" />
          <h1 class="topic">
            Danger:
            <strong>{{ dangerFlag ? "Yes" : "No" }}</strong>
          </h1>
        </div>

        <hr class="divider" />

        <h1 class="categories">Orbit information</h1>

        <div class="info-row">
          <img src="@/assets/styles/icons/angle.svg" class="icon" />
          <h1 class="topic">
            Orbit Angle:
            <strong>
              {{
                // inclination in degrees (maximum 3 decimal places)
                (selectedNeo?.orbital_data?.inclination ??
                  selectedNeo?.details?.inclination ??
                  asteroidPayload?.orbital_data?.inclination) != null
                  ? Number(
                      selectedNeo?.orbital_data?.inclination ??
                        selectedNeo?.details?.inclination ??
                        asteroidPayload?.orbital_data?.inclination
                    ).toLocaleString(undefined, { maximumFractionDigits: 3 }) +
                    "°"
                  : "N/A"
              }}
            </strong>
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/axis-major.png" class="icon" />
          <h1 class="topic">
            Major Axis:
            <strong>
              {{
                // assume value is in AU -> convert to km (1 AU = 149,597,870.7 km)
                (selectedNeo?.orbital_data?.semi_major_axis ??
                  asteroidPayload?.orbital_data?.semi_major_axis) != null
                  ? Number(
                      parseFloat(
                        selectedNeo?.orbital_data?.semi_major_axis ??
                          asteroidPayload?.orbital_data?.semi_major_axis
                      ) * 149597870.7
                    ).toLocaleString(undefined, { maximumFractionDigits: 3 }) +
                    " km"
                  : "N/A"
              }}
            </strong>
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/axis-minor.png" class="icon" />
          <h1 class="topic">
            Minor Axis:
            <strong>
              {{
                (selectedNeo?.orbital_data?.minor_axis ??
                  asteroidPayload?.orbital_data?.minor_axis) != null
                  ? Number(
                      parseFloat(
                        selectedNeo?.orbital_data?.minor_axis ??
                          asteroidPayload?.orbital_data?.minor_axis
                      ) * 149597870.7
                    ).toLocaleString(undefined, { maximumFractionDigits: 3 }) +
                    " km"
                  : "N/A"
              }}
            </strong>
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/period.png" class="icon" />
          <h1 class="topic">
            Period:
            <strong>
              {{
                (selectedNeo?.orbital_data?.orbital_period ??
                  asteroidPayload?.orbital_data?.orbital_period) != null
                  ? Number(
                      selectedNeo?.orbital_data?.orbital_period ??
                        asteroidPayload?.orbital_data?.orbital_period
                    ).toLocaleString(undefined, { maximumFractionDigits: 0 }) +
                    " days"
                  : "N/A"
              }}
            </strong>
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/circle.png" class="icon" />
          <h1 class="topic">
            Eccentricity:
            <strong>
              {{
                (selectedNeo?.orbital_data?.eccentricity ??
                  asteroidPayload?.orbital_data?.eccentricity) != null
                  ? Number(
                      selectedNeo?.orbital_data?.eccentricity ??
                        asteroidPayload?.orbital_data?.eccentricity
                    ).toLocaleString(undefined, { maximumFractionDigits: 3 })
                  : "N/A"
              }}
            </strong>
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/a-e.png" class="icon" />
          <h1 class="topic">
            Aphelion:
            <strong>
              {{
                (selectedNeo?.orbital_data?.aphelion_distance ??
                  asteroidPayload?.orbital_data?.aphelion_distance) != null
                  ? Number(
                      parseFloat(
                        selectedNeo?.orbital_data?.aphelion_distance ??
                          asteroidPayload?.orbital_data?.aphelion_distance
                      )
                    ).toLocaleString(undefined, { maximumFractionDigits: 3 }) +
                    " km"
                  : "N/A"
              }}
            </strong>
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/per.png" class="icon" />
          <h1 class="topic">
            Perihelion:
            <strong>
              {{
                (selectedNeo?.orbital_data?.perihelion_distance ??
                  asteroidPayload?.orbital_data?.perihelion_distance) != null
                  ? Number(
                      parseFloat(
                        selectedNeo?.orbital_data?.perihelion_distance ??
                          asteroidPayload?.orbital_data?.perihelion_distance
                      ) * 149597870.7
                    ).toLocaleString(undefined, { maximumFractionDigits: 3 }) +
                    " km"
                  : "N/A"
              }}
            </strong>
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/speed.png" class="icon" />
          <h1 class="topic">
            Total Orbital Energy:
            <strong>
              {{
                (selectedNeo?._total_energy ??
                  selectedNeo?.details?.total_energy ??
                  asteroidPayload?._total_energy) != null
                  ? Number(
                      (selectedNeo?._total_energy ??
                        selectedNeo?.details?.total_energy ??
                        asteroidPayload?._total_energy) / 1e12
                    ).toLocaleString(undefined, { maximumFractionDigits: 3 }) +
                    " TJ"
                  : "N/A"
              }}
            </strong>
          </h1>
        </div>
        <hr class="divider" />

        <h1 class="categories">Simulation</h1>

        <div class="info-row">
          <img src="@/assets/styles/icons/place.svg" class="icon" />
          <h1 class="topic">
            Target Place: <strong>{{ formatedLocation }}</strong>
          </h1>
          <SelectImpactLocation @selected="onPlaceSelected" />
        </div>
        <h1 class = "warning">The calculations made are quite accurate; pay attention while selecting a city so you can see the impacts based in the true location</h1>
      </div>
      

      <div
        v-else-if="!loading && !error && neos.length === 0"
        style="padding: 20px"
      >
        No near-earth objects found in the requested date range.
      </div>

      <!-- <NuxtLink to="/personalize"> -->
      <button class="start" @click="startSimulation">Start Simulation</button>
      <!-- </NuxtLink> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from "vue";
import { useRouter } from "vue-router"; // <-- added
import Asteroid from "@/components/Asteroid.vue";
import SelectImpactLocation from "@/components/SelectImpactLocation.vue";
import * as turf from "@turf/turf";

// ... rest of file unchanged above ...

const router = useRouter(); // <-- added

// --- basic config (unchanged) ---
const BACKEND_FEED = "http://localhost:5000/asteroid/feed";
const BACKEND_BASE = BACKEND_FEED.replace(/\/asteroid\/feed\/?$/, "");

// helper: return local yyyy-mm-dd
function getLocalISODate() {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60000;
  const local = new Date(now.getTime() - tzOffsetMs);
  return local.toISOString().slice(0, 10);
}
const today = getLocalISODate();

// --- reactive state ---
const params = reactive({
  start_date: today,
  end_date: today,
});

const loading = ref(true);
const error = ref(null);

// `neos` now holds lightweight entries from backend feed:
// { id, name, distance_km (Number), details: { ... } (when fetched) }
const neos = ref([]);
const selectedIndex = ref(0);

// local cache for fetched details by id (avoid refetching)
const detailsCache = reactive({}); // keys: asteroidId -> details object returned by backend

// --- format helpers (unchanged) ---
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

// --- fetch the simplified feed (id, name, distance) ---
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

    const url = new URL(BACKEND_FEED);
    url.searchParams.set("start_date", params.start_date);
    url.searchParams.set("end_date", params.end_date);

    const resp = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!resp.ok) {
      let msg = `HTTP ${resp.status} ${resp.statusText}`;
      try {
        const errJson = await resp.json();
        if (errJson && errJson.message) msg = errJson.message;
      } catch (e) {}
      throw new Error(msg);
    }

    const json = await resp.json();

    // Expecting { asteroids: [ { id, name, distance }, ... ] }
    const list = Array.isArray(json.asteroids) ? json.asteroids : [];

    // Map into minimal entries, normalize distance to Number (km)
    const mapped = list.map((a) => {
      let distance_km = null;
      try {
        // upstream may provide distance as string -> parseFloat safe
        distance_km = a.distance != null ? parseFloat(a.distance) : null;
      } catch {
        distance_km = null;
      }
      return {
        id: String(a.id ?? a.name ?? Math.random().toString(36).slice(2, 9)),
        name: a.name ?? "Unknown",
        distance_km,
        // details will be set later when we fetch /get_by_id
        details: undefined,
        // keep a small raw pointer if present (unused but helpful)
        raw: a,
      };
    });

    // sort by distance asc (nulls last)
    mapped.sort((x, y) => {
      const dx =
        x.distance_km == null ? Number.POSITIVE_INFINITY : x.distance_km;
      const dy =
        y.distance_km == null ? Number.POSITIVE_INFINITY : y.distance_km;
      return dx - dy;
    });

    neos.value = mapped;
    selectedIndex.value = mapped.length > 0 ? 0 : -1;

    // Immediately fetch details for the first asteroid so UI shows info on load
    if (selectedIndex.value >= 0) {
      try {
        loading.value = true;
        await fetchAsteroidDetails(neos.value[selectedIndex.value].id);
      } catch (err) {
        error.value = `Failed to load details for ${
          neos.value[selectedIndex.value].name
        }: ${err.message || err}`;
      } finally {
        loading.value = false;
      }
    }
  } catch (err) {
    error.value = err.message || String(err);
    neos.value = [];
    selectedIndex.value = -1;
  } finally {
    loading.value = false;
  }
}

// --- fetch details for a single asteroid by id (GET /asteroid/get_by_id/<id>) ---
// This attaches the backend response directly into the neos entry:
// detailsCache[id] = json; entry.details = json; plus a few convenient flattened props used by template
async function fetchAsteroidDetails(asteroidId) {
  if (!asteroidId) return null;
  // return cached if available
  if (detailsCache[asteroidId]) return detailsCache[asteroidId];

  try {
    const resp = await fetch(
      `${BACKEND_BASE}/asteroid/get_by_id/${encodeURIComponent(asteroidId)}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );
    if (!resp.ok) {
      // try to parse error body
      let msg = `HTTP ${resp.status} ${resp.statusText}`;
      try {
        const j = await resp.json();
        if (j && j.message) msg = j.message;
      } catch {}
      throw new Error(msg);
    }
    const json = await resp.json();

    // Save raw details in cache
    detailsCache[asteroidId] = json;

    // Also attach user-friendly flattened fields to the lightweight entry so template works unchanged
    const entry = neos.value.find((n) => String(n.id) === String(asteroidId));
    if (entry) {
      entry.details = json;

      // Map common fields returned by your updated backend
      // Backend returns: diameter, mass, velocity (km/s), distance (km), magnitude,
      // closest_approach_date, danger (bool), inclination, major-axis, minor-axis, period, eccentricity, aphelion, perihelion, total_energy
      entry.absolute_magnitude_h =
        json.magnitude ?? entry.absolute_magnitude_h ?? null;
      entry.is_potentially_hazardous_asteroid = !!(
        json.danger ?? entry.is_potentially_hazardous_asteroid
      );
      entry.close_approach_date_full =
        json.closest_approach_date ?? json.close_approach_date ?? null;

      // Provide an `orbital_data` object similar to the NASA feed so existing computed orbitInclination can read it
      entry.orbital_data = entry.orbital_data || {};
      // semi_major_axis / major-axis may be provided with key "major-axis"
      const majorAxis =
        json["major-axis"] ??
        json["semi_major_axis"] ??
        json["semiMajorAxis"] ??
        json.major_axis ??
        null;
      entry.orbital_data.semi_major_axis =
        majorAxis ?? entry.orbital_data.semi_major_axis;
      entry.orbital_data.inclination =
        json.inclination ?? entry.orbital_data.inclination;
      entry.orbital_data.eccentricity =
        json.eccentricity ?? entry.orbital_data.eccentricity;
      entry.orbital_data.orbital_period =
        json.period ?? entry.orbital_data.orbital_period;
      entry.orbital_data.aphelion_distance =
        json.aphelion ?? entry.orbital_data.aphelion_distance;
      entry.orbital_data.perihelion_distance =
        json.perihelion ?? entry.orbital_data.perihelion_distance;
      entry.orbital_data.minor_axis =
        json["minor-axis"] ?? json.minor_axis ?? entry.orbital_data.minor_axis;

      // convenience shallow props that the UI uses
      // diameter (m) / mass (kg) / velocity (km/s) / distance (km)
      entry._diameter = json.diameter ?? null;
      entry._mass = json.mass ?? null;
      entry._velocity = json.velocity ?? null; // km/s as per backend
      entry._distance = json.distance ?? null;
      entry._total_energy = json.total_energy ?? null;
    }

    return json;
  } catch (err) {
    console.error("Failed to fetch asteroid details", err);
    throw err;
  }
}

// Keep selectedIndex valid when neos changes
watch(neos, (n) => {
  if (!n || n.length === 0) selectedIndex.value = -1;
  else if (selectedIndex.value < 0) selectedIndex.value = 0;
});

// When selection changes, fetch details (and show a loading indicator)
watch(selectedIndex, async (idx) => {
  if (idx == null || idx < 0 || idx >= neos.value.length) return;
  const id = neos.value[idx].id;
  try {
    loading.value = true;
    await fetchAsteroidDetails(id);
  } catch (err) {
    // non-fatal: keep the lightweight list but show error
    error.value = `Failed to load details for ${neos.value[idx].name}: ${
      err.message || err
    }`;
  } finally {
    loading.value = false;
  }
});

// --- derived reactive values ---
// selectedNeo returns lightweight item plus optional .details
const selectedNeo = computed(() => {
  if (!neos.value || neos.value.length === 0) return null;
  const idx = selectedIndex.value;
  if (idx == null || idx < 0 || idx >= neos.value.length) return neos.value[0];
  return neos.value[idx];
});

// diameterAvg, medianVelocity, distanceKm, closestApproachDate, orbitInclination:
// map from `selectedNeo.details` when available, otherwise fallback to lightweight fields
const diameterAvg = computed(() => {
  const s = selectedNeo.value;
  if (!s) return null;
  if (s.details && s.details.diameter != null)
    return Number(s.details.diameter);
  if (s._diameter != null) return Number(s._diameter);
  return null;
});
const medianVelocity = computed(() => {
  const s = selectedNeo.value;
  if (!s) return null;
  // backend returns km/s; UI shows km/h => convert
  const v_km_s = s.details?.velocity ?? s._velocity ?? null;
  if (v_km_s != null) return Number(v_km_s) * 3600;
  return null;
});
const distanceKm = computed(() => {
  const s = selectedNeo.value;
  if (!s) return null;
  if (s.details && s.details.distance != null)
    return Number(s.details.distance);
  if (s._distance != null) return Number(s._distance);
  return s.distance_km != null ? Number(s.distance_km) : null;
});
const closestApproachDate = computed(() => {
  const s = selectedNeo.value;
  if (!s) return "N/A";
  return (
    s.close_approach_date_full ??
    (s.details
      ? s.details.closest_approach_date ?? s.details.close_approach_date
      : "N/A")
  );
});
const orbitInclination = computed(() => {
  const s = selectedNeo.value;
  if (!s) return "N/A";
  const inc =
    s.orbital_data?.inclination ?? (s.details ? s.details.inclination : null);
  return inc != null ? Number(inc).toFixed(2) : "N/A";
});

// expose magnitude used in the template
const absoluteMagnitude = computed(() => {
  const s = selectedNeo.value;
  if (!s) return null;
  return (
    s.absolute_magnitude_h ?? (s.details ? s.details.magnitude ?? null : null)
  );
});

// expose danger flag used in the template
const dangerFlag = computed(() => {
  const s = selectedNeo.value;
  if (!s) return false;
  return (
    s.is_potentially_hazardous_asteroid ??
    (s.details ? !!s.details.danger : false)
  );
});

// --- map selectedNeo into asteroidPayload for simulation POST ---
const asteroidPayload = computed(() => {
  const neo = selectedNeo.value;
  if (!neo) return null;

  const details = neo.details || detailsCache[neo.id] || null;

  // diameter from details (meters) or null
  const diameterMeters =
    details && details.diameter != null
      ? Number(details.diameter)
      : neo._diameter != null
      ? Number(neo._diameter)
      : null;

  // mass: prefer details.mass, else try _mass
  const mass_kg =
    details && details.mass != null
      ? Number(details.mass)
      : neo._mass != null
      ? Number(neo._mass)
      : null;

  // velocity: details.velocity is km/s per backend; fallback to _velocity
  const entry_speed_km_s =
    details && details.velocity != null
      ? Number(details.velocity)
      : neo._velocity != null
      ? Number(neo._velocity)
      : null;

  const miss_distance_km =
    details && details.distance != null
      ? Number(details.distance)
      : neo._distance != null
      ? Number(neo._distance)
      : neo.distance_km != null
      ? Number(neo.distance_km)
      : null;

  const absolute_magnitude_h =
    details && details.magnitude != null
      ? Number(details.magnitude)
      : neo.absolute_magnitude_h != null
      ? Number(neo.absolute_magnitude_h)
      : null;

  const is_potentially_hazardous_asteroid = !!(
    neo.is_potentially_hazardous_asteroid ?? (details ? details.danger : false)
  );

  // mass fallback: if diameter exists but details.mass missing, estimate using density 2500 kg/m^3
  let estimated_mass = mass_kg;
  if (estimated_mass == null && diameterMeters != null) {
    const r = diameterMeters / 2.0;
    const v = (4 / 3) * Math.PI * Math.pow(r, 3);
    estimated_mass = v * 2500;
  }

  // impact energy (tons TNT) attempt if possible
  let impact_energy_tnt = null;
  if (estimated_mass != null && entry_speed_km_s != null) {
    const v_m_s = entry_speed_km_s * 1000;
    const energy_j = 0.5 * estimated_mass * v_m_s * v_m_s;
    impact_energy_tnt = energy_j / 4.184e9;
  }

  // Include orbital props if available
  const orbital_data =
    neo.orbital_data ||
    (details
      ? {
          inclination: details.inclination,
          semi_major_axis:
            details["major-axis"] ?? details["semi_major_axis"] ?? null,
          eccentricity: details.eccentricity ?? null,
          orbital_period: details.period ?? null,
          aphelion_distance: details.aphelion ?? null,
          perihelion_distance: details.perihelion ?? null,
          minor_axis: details["minor-axis"] ?? null,
        }
      : {});

  return {
    id: String(neo.id ?? neo.name ?? Math.random().toString(36).slice(2, 9)),
    name: neo.name ?? "Unknown",
    diameterMeters: diameterMeters != null ? Number(diameterMeters) : null,
    estimated_diameter_min: null,
    estimated_diameter_max: null,
    relative_velocity_km_s:
      entry_speed_km_s != null ? Number(entry_speed_km_s) : null,
    relative_velocity_km_h:
      entry_speed_km_s != null ? Number(entry_speed_km_s) * 3600 : null,
    miss_distance_km: miss_distance_km,
    absolute_magnitude_h: absolute_magnitude_h,
    is_potentially_hazardous_asteroid: is_potentially_hazardous_asteroid,
    composition: "rocky",
    albedo: 0.12,
    mass_kg: estimated_mass != null ? Number(estimated_mass) : null,
    rotation_period_hours: null,
    lightcurve_amplitude: null,
    pole_orientation: null,
    approach_vector: { x: 0, y: 0, z: 1 },
    impact_probability: 1e-7,
    impact_energy_tnt,
    predicted_impact_country: "Unknown",
    fragmentation_probability: 0.45,
    entry_speed_km_s:
      entry_speed_km_s != null ? Number(entry_speed_km_s) : null,
    entry_angle_deg: 45,
    visual_style: "realistic",
    show_orbit_line: true,
    orbit_color: "#88ccff",
    label: neo.name ?? "Asteroid",
    showHUD: true,
    // attach orbital metadata so simulate-impact has more context if you send it
    orbital_data,
  };
});

// --- action to start simulation (unchanged but uses computed asteroidPayload) ---
const impactLocation = ref(null);
function onPlaceSelected(coords) {
  impactLocation.value = {
    lat: coords.lat,
    lon: coords.lon,
    radius_km: 5,
  };
}
const formatedLocation = computed(() => {
  if (!impactLocation.value) return null;
  return `${impactLocation.value.lat}, ${impactLocation.value.lon}`;
});

async function startSimulation() {
  if (!asteroidPayload.value) {
    alert("No asteroid selected");
    return;
  }
  if (!impactLocation.value) {
    alert(
      'No impact location selected. Click "Select Impact Location" to choose one.'
    );
    return;
  }

  const payload = {
    asteroid: asteroidPayload.value,
    location: impactLocation.value,
  };

  try {
    loading.value = true;
    const resp = await fetch(`${BACKEND_BASE}/asteroid/simulate-impact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const errMsg = await resp.text().catch(() => resp.statusText);
      throw new Error(errMsg || `HTTP ${resp.status}`);
    }
    const json = await resp.json();
    console.log("simulation result", json);

    // Normalize common coordinate keys from backend into a predictable shape
    const lat =
      json.lat ??
      json.latitude ??
      json.location?.lat ??
      json.impact?.lat ??
      json.coords?.lat ??
      payload.location?.lat ??
      null;
    const lon =
      json.lon ??
      json.longitude ??
      json.location?.lon ??
      json.impact?.lon ??
      json.coords?.lon ??
      payload.location?.lon ??
      null;

    const impactRecord = {
      receivedAt: new Date().toISOString(),
      payloadSent: payload,
      result: json,
      coords: lat != null && lon != null ? { lat, lon } : null,
    };

    // Save the full result in sessionStorage (safe for navigation, not persisted forever)
    try {
      sessionStorage.setItem("lastImpact", JSON.stringify(impactRecord));
    } catch (e) {
      console.warn("Failed to store simulation result in sessionStorage", e);
    }

    // Navigate to the impacts page — it will read sessionStorage
    router.push({ path: "/impacts", query: { from: "simulation" } });
  } catch (err) {
    console.error(err);
    alert("Simulation failed: " + (err.message || err));
  } finally {
    loading.value = false;
  }
}

// --- date control handler ---
function onDateChange() {
  if (params.start_date > today) {
    params.start_date = today;
    params.end_date = today;
    error.value = `Only until today's date is allowed (${today}). Resetting.`;
    return;
  }
  params.end_date = params.start_date;
  error.value = null;
  fetchNeos();
}

// initial load
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

.categories {
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
.warning{
  text-align: star;
  font-size: 15px;
  color: rgba(0, 0, 0, 0.548);
  font-family: "Roboto", sans-serif;
  font-weight: 900;
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
