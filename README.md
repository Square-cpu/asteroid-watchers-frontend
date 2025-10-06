# Asteroid Watchers

## What it does / Overview

**Asteroid Watchers** is an educational web-based simulation platform that models near-Earth asteroid impacts and delivers comprehensive analysis of potentially hazardous objects. It integrates real NASA data, physics-based calculations, interactive 3D explorations, and an impact simulation engine for teaching and research support.

---

## How it works

### Data Collection & Processing

* Fetches real-time near-Earth object data from NASA’s `NEO Web Service API`.
* Backend processing computes additional physical properties such as:

  * Mass estimation
  * Orbital energy
  * Impact velocities
    using gravitational physics calculations and standard astronomical constants.

### Interactive 3D Visualization

* 3D preview system with rotation and zoom to inspect asteroid shapes and characteristics visually.

### Impact Simulation Engine

Users can run physics-based impact simulations by:

1. Selecting specific dates to view available near-Earth objects.
2. Choosing an asteroid from a list (with approach distances).
3. Placing impact coordinates on an interactive map.
4. Running simulations that compute:

   * Crater size
   * Casualty estimates
   * Seismic effects
   * Fireball radius
   * Shock wave impacts

### Customization Tools

* Creator module to design custom asteroids (size, speed, composition) for "what-if" experiments.

---

## Benefits and Intended Impact

### Educational Value

* Transforms complex astronomy and physics into interactive learning experiences for students and educators.

### Public Awareness

* Visualizes potentially hazardous asteroids to increase public understanding of planetary defense and monitoring programs.

### Scientific Literacy

* Bridges raw NASA data and public comprehension of orbital mechanics, impact physics, and risk assessment.

### Research Support

* Helps researchers and educators demonstrate impact scenarios and test theoretical deflection strategies via an integrated recommendation system.

---

## Tools, Technologies, and Development Stack

### Programming Languages

* Python (backend data processing & API integration)
* JavaScript (frontend interactivity)
* HTML / CSS (UI)

### APIs and Data Sources

* NASA `NEO Web Service API` for asteroid data
* Astronomical constants for gravitational/physics calculations

### Libraries and Frameworks

* Python: `requests`, `json`, `math` (and other numeric utilities as needed)
* Frontend: modern web tech for 3D rendering and mapping (WebGL / Three.js, mapping libraries, etc.)

### Deployment Platform

* Vercel for hosting and deployment
* Railway for backend deployment

### Physics Engine

Custom simulation combining:

* Gravitational constant calculations
* Orbital mechanics formulas
* Energy & momentum conservation principles
* Seismic impact modeling

---

## Creative & Innovative Aspects

* **Real-Time Data Integration:** Live NASA data rather than static examples.
* **Multi-Layered Simulation:** Unified modeling of orbital mechanics, atmospheric physics, and impact geology.
* **Deflection Strategy Integration:** Algorithmic recommendations for planetary defense actions.
* **User-Centric Design:** Guided, step-by-step interface that balances accessibility with scientific accuracy.
* **Customization Capabilities:** Creator module for hypothetical scenarios and exploratory learning.

---

## Team Considerations & Factors

* **Scientific Accuracy vs. Accessibility:** Simplified but educational physics models to balance precision and performance.
* **Data Reliability:** Estimation algorithms to handle incomplete or missing NASA data while keeping simulations functional.
* **Educational Framework:** UI includes contextual help, unit clarifications, and guided steps to support pedagogy.
* **Performance Optimization:** Caching and efficient processing to respect API rate limits and ensure responsiveness.
* **Risk Communication:** Ethical presentation of results with clear disclaimers that simulations are educational models, not predictive tools.

---

## Conclusion

Asteroid Watchers is a comprehensive educational platform that combines real astronomical data with interactive, physics-based simulation tools to improve public understanding, support research demonstrations, and provide hands-on learning about planetary defense and impact physics.
