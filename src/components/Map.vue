<script setup>
  import { ref } from 'vue';
  import { loadScript } from '@/utils';
  import MapStyle from '@/assets/MapStyle.json';

  const BMap = ref(null);
  const map = ref(null);

  async function loadBMap() {
    let BMap, map;
    const BMapLoader = await loadScript('//api.map.baidu.com/api?v=3.0&ak=1RrG8S0GduM1gdeM7EDGHkxwmFO9iswk').then(
      () => {
        return loadScript(
          'https://api.map.baidu.com/getscript?v=3.0&ak=1RrG8S0GduM1gdeM7EDGHkxwmFO9iswk&services=&t=' +
            window.BMap_loadScriptTime
        );
      }
    );
    if (BMapLoader && window.BMap) {
      BMap = window.BMap;
      map = new BMap.Map('map');
    }
    return {
      BMap,
      map,
    };
  }

  async function initMap() {
    const resData = await loadBMap();
    if (resData.BMap && resData.map) {
      BMap.value = resData.BMap;
      map.value = resData.map;
      map.value.centerAndZoom(new BMap.value.Point(116.404, 39.915), 11);
      map.value.enableMapClick(true);
      map.value.enableScrollWheelZoom(true);
      map.value.setMapStyle({ styleJson: MapStyle });
    }
  }
  initMap();
</script>

<template>
  <div id="map" un-h-full un-overflow-hidden un-pos-relative></div>
</template>
