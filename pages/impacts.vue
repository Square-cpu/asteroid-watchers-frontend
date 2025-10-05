<template>
  <div class="organizer">
    <div class="asteroid">
      <!-- colocar aqui o asteroide -->
      <h1>
        Asteroide
        <!-- dados API -->
      </h1>
    </div>

    <div class="info-card">
      <h2 class="name">
        Name
        <!-- dados API -->
      </h2>

      <div class="info">
        <div class="info-row">
          <img src="@/assets/styles/icons/death.png" class="icon" />
          <h1 class="topic">Estimated deaths:</h1>
        </div>
        <hr class="divider" />

        <h1 class="categories">Crater</h1>
        <div class="info-row">
          <img src="@/assets/styles/icons/ruler.svg" class="icon" />
          <h1 class="topic">Radius:</h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/velocity.svg" class="icon" />
          <h1 class="topic">Impact velocity:</h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/energy.png" class="icon" />
          <h1 class="topic">Impact energy:</h1>
        </div>

        <hr class="divider" />

        <h1 class="categories">Other impacts</h1>
        <div class="info-row">
          <img src="@/assets/styles/icons/fire.png" class="icon" />
          <h1 class="topic">Fireball Wide:</h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/sound.png" class="icon" />
          <h1 class="topic">Shock wave:</h1>
        </div>

        <div class="info-row">
          <img src="@/assets/styles/icons/wind.png" class="icon" />
          <h1 class="topic">Wind Speed:</h1>
        </div>
        
        <div class="info-row">
          <img src="@/assets/styles/icons/rock.png" class="icon" />
          <h1 class="topic">Earthquake magnitude:</h1>
        </div>
        

        <hr class="divider" />
        <h1 class="categories">How to deflect</h1>
      </div>
        
      
    </div>
  </div>
</template>

<script setup>
// your script here
</script>

<style scoped>
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
  height: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(4, 239, 239);
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

.info-card .name {
  text-align: center;
  font-size: 30px;
  color: black;
  font-family: "Roboto", sans-serif;
  font-weight: 900;
  margin: 30px auto 10px;
}
.categories{
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
