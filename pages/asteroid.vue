<script setup>
import Asteroid from "@/components/Asteroid.vue";

const asteroidPayload = {
  id: "2465633",
  name: "465633 (2009 JR5)",
  diameterMeters: 350,
  estimated_diameter_min: 217.04,
  estimated_diameter_max: 485.33,
  relative_velocity_km_s: 18.1279,
  relative_velocity_km_h: 65260.5699,
  miss_distance_km: 45290298.2257,
  absolute_magnitude_h: 20.44,
  is_potentially_hazardous_asteroid: true,
  composition: "rocky",
  albedo: 0.12,
  mass_kg: 3.5e9,
  rotation_period_hours: 4.5,
  lightcurve_amplitude: 0.6,
  pole_orientation: { ra: 120.5, dec: -23.1 },
  approach_vector: { x: -0.3, y: 0.1, z: 0.95 },
  impact_probability: 0.000002,
  impact_energy_tnt: 1500000,
  predicted_impact_country: "Unknown",
  fragmentation_probability: 0.45,
  entry_speed_km_s: 18.1279,
  entry_angle_deg: 45,
  visual_style: "realistic",
  show_orbit_line: true,
  orbit_color: "#88ccff",
  label: "2009 JR5",
  showHUD: true,
};
</script>

<template>
  <Asteroid :asteroidData="asteroidPayload" />
</template>