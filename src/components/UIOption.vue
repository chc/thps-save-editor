<template>
  <div class="editor-container" >
    <div class="add-component">
      <div class="form-select">
        <b-form-select :options="inactiveItems" value-field="path" text-field="UI_DisplayName" v-model="selectedAddComponent" size="md"></b-form-select>
      </div>
    <b-button variant="success" v-on:click="onClickAddComponent"><b-icon-plus></b-icon-plus></b-button>
    </div>
    <b-card 
    v-bind:title="title" bg-variant="light">
      <div v-for="item in activeItems" :key="item.UI_DisplayName">
        <span v-if="item.UI_Options.type != 'component'">{{item.UI_DisplayName}}:</span>
        <b-button variant="danger" v-on:click="setDeleted(item)"  v-if="item.UI_Options.type == 'component'"><b-icon-x></b-icon-x> Delete Component</b-button>
        <b-form-input v-if="item.UI_Options.type == 'integer'" type="number" v-model="data[item.path]" />
        <b-form-input v-if="item.UI_Options.type == 'string'" type="text" v-model="data[item.path]" />
        <b-form-select v-if="item.UI_Options.type == 'name'" v-model="data[item.path]" :options="structureData" value-field="desc_id" text-field="frontend_desc"></b-form-select>
        <UIOption v-on:delete-component="onChildComponentDeleted" v-bind:title="item.UI_DisplayName" v-if="item.UI_Options.type == 'component'" v-bind:component-name="item.UI_Options.subtype" v-bind:path="generatedPath + '.' + item.path"> </UIOption>
        <b-button variant="danger" v-on:click="setDeleted(item)"  v-if="item.UI_Options.type != 'component'"><b-icon-x></b-icon-x> Delete</b-button>
      </div>
     </b-card>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "UIOption", 
  props: ["componentName", "path", "title"],
  data() {
      return {options: [], data: {}, generatedPath:"",selectedAddComponent: null}
  },
  computed: {
    activeItems: function() {
      var items = [];
      for(var i=0;i<this.options.length;i++) {
        if(this.options[i].deleted != true) {
          items.push(this.options[i]);
        }
      }
      return items;
    },
    inactiveItems: function() {
      var items = [];
      for(var i=0;i<this.options.length;i++) {
        if(this.options[i].deleted == true) {
          items.push(this.options[i]);
        }
      }
      return items;
    }
  },
  methods: {
    onClickAddComponent() {
      for(var i=0;i<this.options.length;i++) {
        if(this.options[i].path == this.selectedAddComponent) {
          this.$set(this.options[i], 'deleted', false);
        }
      }
    },
    onChildComponentDeleted(event) {
      for(var i=0;i<this.options.length;i++) {
        if((this.generatedPath + '.' + this.options[i].path) == event.path && event.path != (this.generatedPath + '.' + this.selectedAddComponent)) {
          this.$set(this.options[i], 'deleted', true);
        }
      }
    },
    setDeleted(deletedItem) {
      for(var i=0;i<this.options.length;i++) {
        if(this.options[i].path == deletedItem.path) {
          this.$set(this.options[i], 'deleted', true);
        }
      }
    }
  },
  created() {
    var path = "/api/component/" + this.componentName + "/" + this.$store.state.SaveId;
    if(this.path && this.path.length > 0) {
      path += "/" + this.path;
    }
    axios.get(path).then((response) => {
        var component_data = response.data;

        this.generatedPath = component_data.path;
        this.options = component_data.options;

        if(component_data.data != null) {
          this.data = component_data.data;
        } else {
          this.$emit('delete-component', {path: this.path});
        }
        this.structureData = component_data.structureData;
    });
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.add-component {
  display: inline-block;
}
.add-component > .form-select {
  display: inline-block;
  width: 50%;
}
</style>
