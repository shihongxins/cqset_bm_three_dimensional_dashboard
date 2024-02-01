<script setup>
  import { ref } from 'vue';
  import { loadScript } from '@/utils';

  const BMap = ref(null);
  const map = ref(null);
  async function initBMap() {
    const BMapLoader = await loadScript('//api.map.baidu.com/api?v=3.0&ak=1RrG8S0GduM1gdeM7EDGHkxwmFO9iswk').then(
      () => {
        return loadScript(
          'https://api.map.baidu.com/getscript?v=3.0&ak=1RrG8S0GduM1gdeM7EDGHkxwmFO9iswk&services=&t=' +
            window.BMap_loadScriptTime
        );
      }
    );
    if (BMapLoader && window.BMap) {
      BMap.value = window.BMap;
      map.value = new BMap.value.Map('map');
      map.value.centerAndZoom(new BMap.value.Point(116.404, 39.915), 11);
      map.value.enableMapClick(true);
      map.value.enableScrollWheelZoom(true);
    }
  }
  initBMap();
</script>

<template>
  <main>
    <div id="map" class="flex justify-center duration-500 hover:(text-9xl)" un-h="100vh" un-items="center">
      <p>Hello World!</p>
      <i class="i-local-icons:account"></i>
      <i class="i-local-icons:passkey"></i>
      <i class="i-material-symbols:passkey"></i>
    </div>
  </main>
</template>
