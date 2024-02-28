<script setup>
  import { useFullscreenEffect } from '@/composables/useFullscreenEffect';

  const { fullscreenAttrs, toggle } = useFullscreenEffect();
</script>

<template>
  <header class="header">
    <h1>基于配电带电作业全程智能化辅助软件</h1>
    <nav class="nav">
      <a v-bind="fullscreenAttrs" @click="toggle"></a>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
  .header {
    position: fixed;
    top: 0;
    right: 0;
    width: 100vw;
    height: 60px;
    overflow: hidden;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    background-image: linear-gradient(
      45deg,
      rgba(59, 225, 53, 0.2),
      rgba(68, 215, 182, 0.2),
      rgba(94, 196, 254, 0.2),
      rgba(127, 188, 67, 0.2),
      rgba(161, 210, 117, 0.2)
    );
    &::before,
    &::after {
      content: '';
      position: absolute;
      z-index: -1;
      bottom: 5%;
      border-radius: 45%;
      padding: 100%;
      background-image: linear-gradient(45deg, #3be135, #44d7b6, #5ec4fe, #7fbc43, #a1d275);
      opacity: 0.4;
      animation: rotate 30s linear 0s infinite;
    }
    &::after {
      bottom: 10%;
      border-radius: 40%;
      animation-duration: 15s;
    }
    h1 {
      margin: 0;
      font-weight: normal;
      letter-spacing: 2px;
    }
  }
  @keyframes rotate {
    0% {
      transform: translate(0, 0) rotate(0deg);
    }
    50% {
      transform: translate(0, 2%) rotate(180deg);
    }
    100% {
      transform: translate(0, 0) rotate(360deg);
    }
  }
  .nav {
    position: absolute;
    right: 2rem;
    a {
      margin-left: 0.5rem;
      font-size: 1.25rem;
      cursor: pointer;
      color: white;
      &:hover {
        color: #3be135;
        transform: scale(1.25);
      }
    }
  }
</style>
