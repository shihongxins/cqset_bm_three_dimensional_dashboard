<script setup>
  import { ref, computed } from 'vue';
  import { useFullscreenEffect } from '@/composables/useFullscreenEffect';
  import '@photo-sphere-viewer/core/index.css';
  import { Viewer } from '@photo-sphere-viewer/core';
  import '@photo-sphere-viewer/markers-plugin/index.css';
  import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
  import { request } from '@/apis/request';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    project: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  });
  const emits = defineEmits(['update:modelValue']);
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emits('update:modelValue', value),
  });

  const projectSiteList = computed(() => {
    const siteList = [];
    if (props.project?.panoramic_url) {
      try {
        const panoramaList = [].concat(JSON.parse(props.project.panoramic_url)).filter((item) => item.url);
        const measureList = [].concat(JSON.parse(props.project.measure_url)).filter((item) => item.url);
        if (panoramaList.length && panoramaList.length === measureList.length) {
          panoramaList.forEach((item, index) => {
            siteList.push({
              name: `${props.project.name} 站点 ${index + 1}`.trim(),
              panoramaUrl: item.url,
              measureUrl: measureList[index].url,
            });
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
    return siteList;
  });
  const panoramaType = ref('panoramaUrl');
  const selectedSite = ref(0);
  function handleChangeSiteOrPanoramaType(index, type = 'panoramaUrl') {
    selectedSite.value = index;
    panoramaType.value = type;
    if (refPanoramaViewerInstance.value) {
      refPanoramaViewerInstance.value.setPanorama(projectSiteList.value[index][type]);
      markerTypes.value = type === 'panoramaUrl' ? ['lines', 'areas', 'tools'] : [];
      handleChangeMarkerTypes();
    }
  }

  const refPanoramaContainer = ref(null);
  const { fullscreenAttrs, toggle: toggleFullscreen } = useFullscreenEffect(refPanoramaContainer);
  const refPanoramaViewerDOM = ref(null);
  const refPanoramaViewerInstance = ref(null);
  function initViewer() {
    destroyViewer();
    refPanoramaViewerInstance.value = new Viewer({
      container: refPanoramaViewerDOM.value,
      panorama: projectSiteList.value[selectedSite.value].panoramaUrl,
      plugins: [
        [
          MarkersPlugin,
          {
            markers: [],
          },
        ],
      ],
      lang: {
        zoom: '缩放',
        zoomOut: '缩小',
        zoomIn: '放大',
        moveUp: '上移',
        moveDown: '下移',
        moveLeft: '左移',
        moveRight: '右移',
        description: '描述',
        download: '下载',
        markers: '展示/隐藏 标记',
        markersList: '标记列表',
        fullscreen: '全屏',
        loading: '加载中...',
        menu: '菜单',
        close: '关闭',
        twoFingers: '使用两只手指滑动转向',
        ctrlZoom: '按住 ctrl 后滑动鼠标滚动进行缩放',
        loadError: '全景图像加载失败',
      },
    });
    refPanoramaViewerInstance.value.addEventListener('ready', () => {
      handleChangeMarkerTypes(markerTypes.value);
    });
  }

  function destroyViewer() {
    if (refPanoramaViewerInstance.value) {
      refPanoramaViewerInstance.value.destroy();
    }
    refPanoramaViewerInstance.value = null;
  }

  const markerTypes = ref(['lines', 'areas', 'tools']); // lines, areas, tools
  async function handleChangeMarkerTypes() {
    if (!refPanoramaViewerInstance.value) return;
    const markersPlugin = refPanoramaViewerInstance.value.getPlugin(MarkersPlugin);
    if (!markersPlugin) return;
    markersPlugin.clearMarkers();
    const originMarkersParams = {
      class_id: void 0,
      keyword: '',
      page: 1,
      size: 1000,
      sort: 'asc',
      project_id: void 0,
      sid: void 0,
    };
    const requestTasks = [];
    if (markerTypes.value.includes('lines')) {
      requestTasks.push(
        request
          .post(
            '/project_line/get',
            Object.assign({}, originMarkersParams, {
              project_id: props.project.id,
              sid: selectedSite.value,
            })
          )
          .catch((err) => err)
      );
    }
    if (markerTypes.value.includes('areas')) {
      requestTasks.push(
        request
          .post(
            '/project_area/list',
            Object.assign({}, originMarkersParams, {
              project_id: props.project.id,
              sid: selectedSite.value,
              class_id: 1,
            })
          )
          .catch((err) => err)
      );
    }
    if (markerTypes.value.includes('tools')) {
      requestTasks.push(
        request
          .post(
            '/project_area/list',
            Object.assign({}, originMarkersParams, {
              project_id: props.project.id,
              sid: selectedSite.value,
              class_id: 2,
            })
          )
          .catch((err) => err)
      );
    }
    if (!requestTasks.length) return;
    const requestTasksRes = await Promise.allSettled(requestTasks);
    requestTasksRes.forEach((task) => {
      if (task.status === 'fulfilled') {
        const res = task.value;
        if (res?.code == 200 && res?.data) {
          const data = res.data;
          try {
            if (data?.points) {
              // lines
              markersPlugin.addMarker(JSON.parse(data.points));
            } else if (Array.isArray(data) && data?.length) {
              // areas tools
              for (const item of data) {
                if (item?.area) {
                  markersPlugin.addMarker(JSON.parse(item.area));
                }
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    });
  }
</script>

<template>
  <ElDialog
    class="el-dialog-layout--noheader"
    v-model="visible"
    :show-close="false"
    destroy-on-close
    @open="initViewer"
    @close="destroyViewer"
  >
    <div class="panorama__container" un-p-2 un-h-50vh un-overflow-hidden un-flex un-flex-col ref="refPanoramaContainer">
      <div un-rounded un-px-2 un-h-8 un-overflow-hidden un-bg-stone-800 un-flex un-items-center>
        <h4 un-m-2 un-flex-1 un-text-truncate un-text-stone>现场环境 {{ projectSiteList[selectedSite].name }}</h4>
        <div un-text-lg un-text-stone un-cursor-pointer>
          <a v-bind="fullscreenAttrs" @click="toggleFullscreen"></a>
          <a class="i-local-icons:close" title="关闭" @click="visible = false"></a>
        </div>
      </div>
      <div un-flex-1 un-mt-2 un-overflow-hidden un-flex>
        <div class="panorama__viewer" un-flex-1 un-overflow-hidden ref="refPanoramaViewerDOM"></div>
        <div
          class="panorama__controls"
          un-mx-2
          un-px-2
          un-rounded
          un-w-50
          un-flex
          un-flex-col
          un-bg-stone-900
          un-color-stone-400
        >
          <ElSelect :teleported="false" v-model="selectedSite" @change="handleChangeSiteOrPanoramaType">
            <ElOption
              v-for="(site, index) in projectSiteList"
              :key="site.name"
              :label="site.name"
              :value="index"
            ></ElOption>
          </ElSelect>
          <ElRadioGroup v-model="panoramaType" @change="handleChangeSiteOrPanoramaType(selectedSite, $event)">
            <ElRadioButton label="panoramaUrl">环境</ElRadioButton>
            <ElRadioButton label="measureUrl">测温</ElRadioButton>
          </ElRadioGroup>
          <!--
          <ElCheckboxGroup v-model="markerTypes" @change="handleChangeMarkerTypes">
            <ElCheckboxButton label="lines"> 线路 </ElCheckboxButton>
            <ElCheckboxButton label="areas"> 区域 </ElCheckboxButton>
            <ElCheckboxButton label="tools"> 工器具 </ElCheckboxButton>
          </ElCheckboxGroup>
          -->
        </div>
      </div>
    </div>
  </ElDialog>
</template>

<style lang="scss" scoped>
  .panorama__controls {
    --el-fill-color-blank: #111;
    --el-color-primary: rgb(22 163 74);
    --el-border-color: #666;
    --el-border: var(--el-border-width) var(--el-border-style) var(--el-border-color);
    > * + * {
      margin-top: 10px;
    }
    .el-radio-group {
      > * {
        flex: 1;
        &:deep(.el-radio-button__inner) {
          width: 100%;
        }
      }
    }
  }
</style>
