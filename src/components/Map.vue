<script setup>
  import { ref, watch } from 'vue';
  import { loadScript } from '@/utils';
  // import MapStyle from '@/assets/MapStyle.json';
  import { request } from '@/apis/request';
  import IconImgElectricTower from '@/assets/icons/imgs/electric tower.png';
  import { useUserStore } from '@/stores/user';

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
      map.value.setMapType(window.BMAP_HYBRID_MAP);
      map.value.addControl(new BMap.value.ScaleControl());
      const GeolocationControl = new BMap.value.GeolocationControl();
      GeolocationControl.setAnchor(window.BMAP_ANCHOR_BOTTOM_RIGHT);
      map.value.addControl(GeolocationControl);
      /*
      const MapTypeControl = new BMap.value.MapTypeControl();
      MapTypeControl.setAnchor(window.BMAP_ANCHOR_BOTTOM_RIGHT);
      map.value.addControl(MapTypeControl);
      */
      ['moving', 'zoomend'].forEach((item) => {
        map.value.addEventListener(item, updatePopoverPosition);
      });
      map.value.addEventListener('click', hidePopover);
      loadTowerList();
    }
  }

  const towerList = ref([]);
  async function loadTowerList() {
    towerList.value = [];
    map.value.clearOverlays();
    hidePopover();
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
        marker.addEventListener('click', () => {
          loadProjectList(tower);
        });
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

  const projectList = ref([]);
  const refTowerProjectListPopover = ref(null);
  async function loadProjectList(tower) {
    if (!(tower && tower?.id && tower.marker)) return;
    projectList.value = [];
    const resData = await request
      .post('/project/list', {
        tower_id: tower.id,
        keyword: '',
        page: 1,
        size: 100,
        sort: 'asc',
      })
      .catch((reason) => reason);
    if (resData?.code === 200) {
      projectList.value = resData.data;
      refTowerProjectListPopover.value.show();
      refTowerProjectListPopover.value.setPosition(tower.marker.kd);
    }
  }
  const refProjectMenuPopover = ref(null);
  function projectMenuToggle(event) {
    if (event?.target?.classList?.contains('menu__item') && !event?.target?.classList?.contains('disabled')) {
      refProjectMenuPopover.value.show(event);
    }
  }

  function hidePopover(event) {
    refProjectMenuPopover.value?.state === 'open' && refProjectMenuPopover.value.hide();
    if (!event?.overlay && refTowerProjectListPopover.value?.state === 'open') {
      refTowerProjectListPopover.value.hide();
    }
  }

  function updatePopoverPosition() {
    if (refProjectMenuPopover.value?.state === 'open') {
      refProjectMenuPopover.value.hide();
    }
    if (refTowerProjectListPopover.value?.state === 'open') {
      refTowerProjectListPopover.value.setPosition();
    }
  }

  initMap();

  const userStore = useUserStore();
  watch(
    () => userStore?.token,
    (newVal, oldVal) => {
      if (newVal !== oldVal) loadTowerList();
    }
  );
</script>

<template>
  <div class="map__container" un-h-full un-overflow-hidden un-pos-relative>
    <div id="map" un-h-full></div>
    <Popover placement="left" offset="15">
      <template #reference="slotProps">
        <div
          class="map__toolbar"
          un-rounded
          un-w-8
          un-h-8
          un-flex
          un-justify-center
          un-items-center
          un-bg-white
          v-bind="slotProps"
        >
          <i class="i-local-icons:settings"></i>
        </div>
      </template>
      <ul class="menu__list">
        <li class="menu__item" @click="loadTowerList">
          <i class="i-local-icons:refresh"></i>
          刷新杆塔
        </li>
      </ul>
    </Popover>
    <Popover ref="refTowerProjectListPopover" placement="right" offset="15" interactive-method="manual">
      <ul class="menu__list" @click="projectMenuToggle">
        <template v-if="projectList.length">
          <li class="menu__item" v-for="project in projectList" :key="project.id">
            {{ project.name }}
          </li>
        </template>
        <li class="menu__item disabled" disabled v-else>此杆塔未绑定项目</li>
      </ul>
    </Popover>
    <Popover
      ref="refProjectMenuPopover"
      placement="right-start"
      :offset="[10, 0]"
      interactive-method="manual"
      :arrow="false"
    >
      <ul class="menu__list">
        <li class="menu__item">局放视频</li>
        <li class="menu__item">现场环境</li>
        <li class="menu__item">三维模型</li>
      </ul>
    </Popover>
  </div>
</template>

<style lang="scss" scoped>
  .map__toolbar {
    position: absolute;
    right: 10px;
    bottom: 70px;
    padding: 1px;
    cursor: pointer;
    i {
      top: 0;
      font-size: 20px;
      color: #777;
    }
  }
</style>
