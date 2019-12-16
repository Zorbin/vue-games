<template>
  <div class="overlay">
    <p><slot>Game over!</slot></p>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.overlay {
  width: 100%;
  height: 100%;
  line-height: 100%;
  position: absolute;
  z-index: 2;
  display: flex;
  justify-content: center;
  text-align: center;
  background-color: #fff;
  opacity: 0.7;
  font-size: 70px;
  font-weight: bold;
  top: 0;
  left: 0;

  animation-duration: 0.20s;
  animation-name: showdelay;
  animation-fill-mode: forwards;
  animation-delay: 0.15s;
  transform: scale(0);

  @keyframes showdelay {
    from {
      transform: scale(0.5);
    }
    to {
      transform: scale(1);
    }
  }
}

p {
  margin: auto;
}
</style>
