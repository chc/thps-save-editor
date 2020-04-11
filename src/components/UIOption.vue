<template>
  <div class="editor-container">
    <div v-for="item in options" :key="item.UI_DisplayName">
        {{item.UI_DisplayName}}: 
        <input v-if="item.UI_Options.type == 'integer'" type="integer" v-model="data[item.path]" />
        <input v-if="item.UI_Options.type == 'string'" type="text" v-model="data[item.path]" />

        <select v-if="item.UI_Options.type == 'name'" type="text" v-model="data[item.path]">
          <option v-for="option in structureData" v-bind:value="option.desc_id" v-bind:key="option.desc_id">
            {{ option.frontend_desc || option.desc_id }}
          </option>
          </select>
        <UIOption v-if="item.UI_Options.type == 'component'" v-bind:component-name="item.UI_Options.subtype" v-bind:path="path + '.' + item.path"> </UIOption>
        </div>
    </div>
</template>

<script>
import axios from "axios";
export default {
  name: "UIOption", 
  props: ["componentName", "path"],
  data() {
      return {options: [], data: {}}
  },
  created() {
    var path = "/api/component/" + this.componentName + "/" + this.$store.state.SaveId;
    if(this.path && this.path.length > 0) {
      path += "/" + this.path;
    }
    axios.get(path).then((response) => {
        var component_data = response.data;

        this.path = component_data.path;
        this.options = component_data.options;
        this.data = component_data.data;
        this.structureData = component_data.structureData;
    });

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
