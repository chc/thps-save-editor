<template>
  <div class="editor-container">
      component editor {{ root_component }}
      <UIOption v-bind:component-name="root_component" />
      <!-- <p v-for="item in options" :key="item.UI_DisplayName">
          <UIOption v-bind:uiData="item" v-bind:uiValue="data[item.path]" />
      </p>
      -->
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
      var root_component = this.componentName || this.$route.params.component_editor;
      return {root_component, options: []};
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
