<script>
  export default {
    data() {
      return {
        project: null,
        videoDialogVisible: false,
        panoramaDialogVisible: false,
        modelDialogVisible: false,
      };
    },
    methods: {
      show(type, project) {
        if (project?.id) {
          this.project = project;
          this.hide();
          this[`${type}DialogVisible`] = true;
        }
      },
      hide() {
        this.videoDialogVisible = false;
        this.panoramaDialogVisible = false;
        this.modelDialogVisible = false;
      },
    },
  };
</script>

<template>
  <div class="dialog-in-map__container" style="--el-bg-color: #111">
    <VideoPlayerDialog
      v-if="project && videoDialogVisible"
      v-model="videoDialogVisible"
      :project="project"
    ></VideoPlayerDialog>
  </div>
</template>
