<script setup>
  import { ref } from 'vue';
  const selectedProject = ref({});
  const videoDialogVisible = ref(false);
  const panoramaDialogVisible = ref(false);
  const modelDialogVisible = ref(false);

  function show(type, project) {
    if (project?.id) {
      selectedProject.value = project;
      hide();
      switch (type) {
        case 'video':
          videoDialogVisible.value = true;
          break;
        case 'panorama':
          panoramaDialogVisible.value = true;
          break;
        case 'model':
          modelDialogVisible.value = true;
      }
    }
  }

  function hide() {
    videoDialogVisible.value = false;
    panoramaDialogVisible.value = false;
    modelDialogVisible.value = false;
  }
  defineExpose({ show, hide });
</script>

<template>
  <div class="dialog-in-map__container" style="--el-bg-color: #111">
    <VideoPlayerDialog v-model="videoDialogVisible" :project="selectedProject"></VideoPlayerDialog>
    <PanoramaDialog v-model="panoramaDialogVisible" :project="selectedProject"></PanoramaDialog>
  </div>
</template>
