<template>
<section class="organizer" aria-labelledby="help-title">
  <div class="card" role="region" aria-label="Help card">
    <header class="hero">
      <h1 id="help-title">Welcome to Asteroid Watchers — Help</h1>
      <p class="subtitle">Explore near-Earth asteroids, inspect their data, and run impact simulations — all for learning and fun.</p>
    </header>

    <main class="content">
      <p class="intro">This short guide will walk you through the simulator step-by-step. Don’t worry — everything here is simplified and educational.</p>

      <ol class="steps">
        <li class="step">
          <div class="step-index">1</div>
          <div class="step-body">
            <h3>Pick a date</h3>
            <p>Choose the day you want to inspect (today or any past date). The simulator loads all near-Earth objects recorded for that day.</p>
          </div>
        </li>

        <li class="step">
          <div class="step-index">2</div>
          <div class="step-body">
            <h3>Choose an asteroid</h3>
            <p>Select one object from the list. Each entry shows the name and its closest approach distance so you can choose quickly.</p>
          </div>
        </li>

        <li class="step">
          <div class="step-index">3</div>
          <div class="step-body">
            <h3>Inspect data & 3D preview</h3>
            <p>View physical properties (diameter, mass, velocity, magnitude) and orbital info (aphelion, perihelion, inclination). A 3D preview appears in the center — rotate and zoom to inspect.</p>
          </div>
        </li>

        <li class="step">
          <div class="step-index">4</div>
          <div class="step-body">
            <h3>Select an impact location</h3>
            <p>Open the map, drop a pin where you want the impact to occur, and set an impact radius if needed.</p>
          </div>
        </li>

        <li class="step">
          <div class="step-index">5</div>
          <div class="step-body">
            <h3>Run the simulation</h3>
            <p>Click <strong>Start Simulation</strong>. The app will animate the impact and return results: estimated casualties, crater size, impact energy, fireball and shock effects, seismic magnitude, and a map of the affected area.</p>
          </div>
        </li>
      </ol>

      <section class="notes">
        <h4>Notes & tips</h4>
        <ul>
          <li>The simulator uses simplified physics and population estimates — results are <em>educational</em>, not predictions.</li>
          <li>Common units: <strong>meters</strong> for diameter, <strong>km/s</strong> for velocity, <strong>km</strong> for distance, <strong>Mt</strong> (megatons) for energy.</li>
          <li>If any data is missing, the app will estimate values where reasonable so the simulation can still run.</li>
        </ul>
      </section>

      <section class="bonus">
        <h4>Bonus — Create your own asteroid</h4>
        <p class="creator-label">Want to experiment? Visit the <strong>Creator</strong> page to build custom asteroids (size, speed, composition) and test “what-if” scenarios.</p>
      </section>
    </main>
  </div>
</section>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
onMounted(() => document.documentElement.classList.add('help-open'))
onBeforeUnmount(() => document.documentElement.classList.remove('help-open'))
</script>

<style scoped>
.organizer {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #000000;
  overflow: hidden;
}

.card {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 92%;
  max-width: 920px;

  
  height: 100%;
  max-height: calc(100vh - 48px); 

  background: rgb(255, 255, 255);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(32, 41, 61, 0.08);
  padding: 24px;
  border: 1px solid rgba(200,210,230,0.6);
  overflow-y: auto;  
  overflow-x: hidden;
  scroll-behavior: smooth;
  scrollbar-gutter: stable; 
}



.hero { text-align: center; margin-bottom: 14px; }
.hero h1 { margin: 0 0 6px 0; font-size: 1.6rem; color: #0b2545; }
.subtitle { margin: 0; color: #3b536f; font-weight: 400; }
.content { padding-top: 8px; }
.intro { margin: 12px 0 16px 0; color: #233d4a; }
.steps { list-style: none; padding: 0; margin: 0 0 16px 0; display: grid; gap: 12px; }
.step { display: flex; gap: 14px; background: #fbfeff; border-radius: 12px; padding: 12px 14px; align-items: flex-start; border: 1px solid rgba(200,210,230,0.6); }
.step-index { min-width: 44px; height: 44px; border-radius: 8px; background: #000000; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #ffffff; box-shadow: 0 6px 14px rgba(0,0,0,0.06); }
.step-body h3 { margin: 0 0 6px 0; font-size: 1rem; color: #0b2545; }
.step-body p { margin: 0; color: #3b536f; font-size: 0.95rem; }
.notes, .bonus { margin-top: 16px; background: #fbfeff; padding: 12px 14px; border-radius: 10px; border: 1px dashed rgba(160,170,190,0.25); }
.notes h4, .bonus h4 { margin: 0 0 8px 0; }
.notes ul { margin: 0; padding-left: 18px; color: #3b536f; }
.creator-label { margin-top: 8px; padding: 10px 12px; background: #ffffff; border-radius: 8px; border: 1px solid rgba(200,210,230,0.6); color: #233d4a; line-height: 1.4; }
.footer { margin-top: 18px; text-align: center; color: #6b7b8f; font-size: 0.92rem; }

@media (max-width: 720px) {
  .card { padding: 16px; }
  .step { flex-direction: row; gap: 10px; }
  .hero h1 { font-size: 1.25rem; }
}
</style>

<style>
html.help-open,
html.help-open body,
html.help-open #__nuxt,
html.help-open #nuxt,
html.help-open #app {
  height: 100%;
  overflow: hidden !important;
}
</style>
