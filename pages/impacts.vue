<template>
  <div class="organizer">
    <div class="asteroid">
      <Collision
        v-if="coordsAvailable"
        :impactLat="impactCoords.lat"
        :impactLon="impactCoords.lon"
        :impactInfo="impactResult"
      />
      <div v-else style="padding: 24px; color: #111">
        <h2>No coordinates available</h2>
        <p>
          The impacts page did not receive coordinates for the impact. Make sure
          you started a simulation from the Simulation page, or reload if you
          recently ran one.
        </p>
      </div>
    </div>

    <div class="info-card">
      <h2 class="name">{{ impactResult?.result?.name ?? "Impact result" }}</h2>
      <hr class="divider" />
      <div class="info" v-if="impactResult">
        <div class="info-row">
          <img src="@/assets/styles/icons/death.png" class="icon" />
          <h1 class="topic">
            Estimated deaths:
            <strong>
              {{
                impactResult.result?.estimated_kills ??
                impactResult.result?.estimated_deaths ??
                impactResult.result?.estimated_kills_total ??
                "N/A"
              }}
            </strong>
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/place.svg" class="icon" />
          <h1 class="topic">
            Place:
            <strong>{{ impactResult.result?.place ?? "Unknown" }}</strong>
          </h1>
        </div>
        <hr class="divider" />
        <h1 class="categories">Crater</h1>

        <div class="info-row">
          <img src="@/assets/styles/icons/ruler.svg" class="icon" />
          <h1 class="topic">
            Crater radius:
            <strong>
              {{
                impactResult.result?.crater_radius_km ??
                impactResult.result?.crater_radius ??
                "N/A"
              }}
            </strong>
            km
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/velocity.svg" class="icon" />
          <h1 class="topic">
            Impact velocity:
            <strong>
              {{
                impactResult.result?.impact_velocity_km_s ??
                impactResult.result?.impact_velocity_km_h ??
                impactResult.result?.velocity ??
                "N/A"
              }}
            </strong>
            km/s
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/energy.png" class="icon" />
          <h1 class="topic">
            Impact energy:
            <strong>
              {{
                impactResult.result?.impact_energy_mt ??
                impactResult.result?.energy_tons_tnt ??
                impactResult.result?.energy_joules ??
                "N/A"
              }}
            </strong>
            Mt
          </h1>
        </div>

        <hr class="divider" />

        <h1 class="categories">Other impacts</h1>

        <div class="info-row">
          <img src="@/assets/styles/icons/fire.png" class="icon" />
          <h1 class="topic">
            Fireball radius:
            <strong>{{
              impactResult.result?.fireball_radius_km ?? "N/A"
            }}</strong>
            km
          </h1>
    
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/sound.png" class="icon" />
          <h1 class="topic">
            Shock wave:
            <strong>{{ impactResult.result?.shock_wave_km ?? "N/A" }}</strong> km
          </h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/wind.png" class="icon" />
          <h1 class="topic">
            Wind speed:
            <strong>{{ impactResult.result?.wind_speed_kmh ?? "N/A" }}</strong> km/s
          </h1>
        
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/rock.png" class="icon" />
          <h1 class="topic">
            Earthquake magnitude:
            <strong>{{
              impactResult.result?.sismic_magnitude ?? "N/A"
            }}</strong>
          </h1>
        </div>

        <hr class="divider" />
        <h1 class="categories">How to deflect</h1>

        <div class="deflect-text" style="padding: 12px">
          <p v-if="deflectionText">
            {{ deflectionText }}
          </p>
          <p v-else>
            No deflection advice available for this simulation result.
          </p>
        </div>
      </div>

      <div v-else style="padding: 20px">
        No impact result found. Run the simulation from the Simulation page
        first.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Collision from "@/components/Collision.vue";

const impactResult = ref(null);
const impactCoords = ref({ lat: null, lon: null });

// Try to load saved simulation result from sessionStorage
onMounted(() => {
  try {
    const raw = sessionStorage.getItem("lastImpact");
    if (raw) {
      const parsed = JSON.parse(raw);
      impactResult.value = parsed;

      if (
        parsed.coords &&
        parsed.coords.lat != null &&
        parsed.coords.lon != null
      ) {
        impactCoords.value = {
          lat: Number(parsed.coords.lat),
          lon: Number(parsed.coords.lon),
        };
      } else {
        const r = parsed.result ?? {};
        const lat =
          r.lat ??
          r.latitude ??
          r.location?.lat ??
          r.impact?.lat ??
          r.coords?.lat ??
          parsed.payloadSent?.location?.lat ??
          null;
        const lon =
          r.lon ??
          r.longitude ??
          r.location?.lon ??
          r.impact?.lon ??
          r.coords?.lon ??
          parsed.payloadSent?.location?.lon ??
          null;
        if (lat != null && lon != null) {
          impactCoords.value = { lat: Number(lat), lon: Number(lon) };
        }
      }
    } else {
      impactResult.value = null;
    }
  } catch (e) {
    console.error("Failed to read impact from sessionStorage", e);
    impactResult.value = null;
  }
});

const coordsAvailable = computed(() => {
  return (
    impactCoords.value &&
    impactCoords.value.lat != null &&
    impactCoords.value.lon != null
  );
});

const deflectionText = computed(() => {
  if (!impactResult.value) return null;

  // If backend already provided advice, prefer it
  const backendAdvice = impactResult.value.result?.deflection_advice;
  if (backendAdvice && String(backendAdvice).trim().length > 0) {
    return String(backendAdvice);
  }

  // Gather possible distance fields (all interpreted as kilometers)
  const r = impactResult.value.result ?? {};
  const payloadAsteroid = impactResult.value.payloadSent?.asteroid ?? {};

  const candidateValues = [
    r.miss_distance_km,
    r.miss_distance,
    r.distance,
    r.distance_km,
    r._distance,
    r.close_approach_distance,
    r.closest_approach_distance,
    payloadAsteroid.miss_distance_km,
    payloadAsteroid.miss_distance,
    payloadAsteroid._distance,
    impactResult.value.payloadSent?.asteroid?.distance,
  ];

  let distanceKm = null;
  for (const v of candidateValues) {
    if (v == null) continue;
    const n = Number(v);
    if (!Number.isNaN(n)) {
      distanceKm = n;
      break;
    }
  }

  // thresholds (km)
  const tA = 0.75e6; // 750,000 km
  const tB = 7.5e6; // 7,500,000 km
  const tC = 30e6; // 30,000,000 km

  // If distance present, determine case using the same > / < logic as provided
  let caseId = null;
  if (distanceKm != null) {
    if (distanceKm > tA && distanceKm < tB) caseId = 3;
    else if (distanceKm > tB && distanceKm < tC) caseId = 2;
    else caseId = 1;
  }

  // Compose messages for each case
  const note =
    " It's worth noting that these scenarios only apply when an asteroid is on a collision course with Earth; otherwise, there are no worries :)";

  const messages = {
    3:
      "Case 3: We have to make a nuclear bomb so that the blast of its explosion launches the asteroids or at least decelerates it." +
      note,
    2:
      "Case 2: We are near the real danger, we can turn this into a mission of 'continuous propulsion', and that means taking a spaceship using ionizing fuel (so that it doesn't consume a lot of resources) and taking the asteroid to a short trip around its own orbit." +
      note,
    1:
      "Case 1: This is the case where we have the most time to react, and this is actually a problem, not as big as the other ones, but trying to sync two objects in a far vast space is not such an easy task. In this case all we have to do is launch a spaceship to collide with the asteroid. As it's quite far, from earth, a simple orbit perturbation can make it miss us by many kilometers." +
      note,
  };

  // If we identified a case, return the message
  if (caseId != null) {
    return messages[caseId];
  }

  // No distance and no backend advice — can't compute
  return null;
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Bitcount+Prop+Single+Ink:wght@100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap");

.organizer {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.info-card {
  position: absolute;
  top: 0;
  right: 0;
  width: 350px;
  max-width: 38%;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background-color: azure;

  border-radius: 0;
  box-shadow: none;
  margin: 0;
  border-left: 2px solid #ccc;

  overflow-y: auto;
  overflow-x: hidden;
}

.info-card .name {
  text-align: center;
  font-size: 30px;
  color: black;
  font-family: "Roboto", sans-serif;
  font-weight: 900;
  margin: 30px auto 10px;
}
.categories {
  text-align: center;
  font-size: 25px;
  color: black;
  font-family: "Roboto", sans-serif;
  font-weight: 900;
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

.deflect-text {
  color: rgb(0, 0, 0);
  size: 15px;
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
  margin: 60px auto 10px;
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
