<script setup>
  import { ref } from 'vue';
  import { loadScript } from '@/utils';
  // import MapStyle from '@/assets/MapStyle.json';
  import { request } from '@/apis/request';
  import IconImgElectricTower from '@/assets/icons/imgs/electric tower.png';

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
      // map.value.setMapStyle({ styleJson: MapStyle });
      console.log('地图加载完成');
      map.value.addControl(new BMap.value.ScaleControl());
      const GeolocationControl = new BMap.value.GeolocationControl();
      GeolocationControl.setAnchor(window.BMAP_ANCHOR_BOTTOM_RIGHT);
      map.value.addControl(GeolocationControl);
      /*
      const MapTypeControl = new BMap.value.MapTypeControl();
      MapTypeControl.setAnchor(window.BMAP_ANCHOR_BOTTOM_RIGHT);
      map.value.addControl(MapTypeControl);
      */
      loadTowerList();
    }
  }

  const towerList = ref([]);
  async function loadTowerList() {
    towerList.value = [];
    map.value.clearOverlays();
    const resData = await request
      .post('/pc/tower/list', {
        keyword: '',
        page: 1,
        size: 100,
        sort: 'asc',
      })
      .catch((reason) => reason);
    if (resData?.code === 200) {
      towerList.value = resData.data;
      for (const tower of towerList.value) {
        const point = new BMap.value.Point(tower.lon, tower.lat);
        const icon = new BMap.value.Icon(IconImgElectricTower, new BMap.value.Size(48, 48), {
          anchor: new BMap.value.Size(24, 48),
        });
        icon.setImageSize(new BMap.value.Size(48, 48));
        const label = new BMap.value.Label(tower.name, {
          position: point,
        });
        label.setStyle({
          display: 'inline-block',
          border: 'none',
          borderRadius: '.25rem',
          padding: '0.125rem',
          maxWidth: '6rem',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          background: '#fff',
          color: '#333',
          fontSize: '12px',
          fontFamily: '微软雅黑',
          letterSpacing: '2px',
        });
        label.setOffset(new BMap.value.Size(-10, 50));
        label.setTitle(tower.name);
        const marker = new BMap.value.Marker(point, {
          icon,
          title: tower.name,
        });
        marker.setLabel(label);
        map.value.addOverlay(marker);
        tower.marker = marker;
      }
      map.value.setViewport(
        towerList.value.map((tower) => new BMap.value.Point(tower.lon, tower.lat)),
        {
          margins: [60, 60, 60, 60],
        }
      );
    }
  }

  initMap();
</script>

<template>
  <div id="map" un-h-full un-overflow-hidden un-pos-relative></div>
</template>
