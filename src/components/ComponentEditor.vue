<template>
  <div class="component-container">
      <UIOption v-bind:component-name="root_component" title="Component Editor" v-on:component-deleted="toggleDeleted" />
    </div>
</template>

<script>
import UIOption from './UIOption'
export default {
  name: "ComponentEditor",
  props: ["componentName"],
  components: {
    UIOption
  },
  data() {
      return {options: []};
  },
  methods: {
    toggleDeleted(event) {
      console.log(event);
    }
  },
  computed: {
    root_component: function() {
      return this.componentName || this.$route.params.component_editor;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .component-container {
    height: 100%;
  }
</style>
