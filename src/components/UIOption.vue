<template>
  <div class="editor-container" >
    <!-- header stuff-->
    <b-card 
    v-bind:title="title" bg-variant="light">
    <b-button class="save-button" variant="primary" v-if="title == 'Component Editor'" v-on:click="onClickSave">Save<b-icon-check></b-icon-check></b-button>
    <div class="component-controls" v-if="inactiveItems.length > 0 || title != 'Component Editor'">
      <span>Add/Remove component:</span>
      <b-button variant="danger" v-on:click="emitDeleted" v-if="title != 'Component Editor'"><b-icon-x></b-icon-x></b-button>
      <div class="add-component" v-if="inactiveItems.length > 0">
        <b-button variant="success" v-on:click="onClickAddComponent"><b-icon-plus></b-icon-plus></b-button>
        <div class="form-select">
          <b-form-select :options="inactiveItems" value-field="UI_DisplayName" text-field="UI_DisplayName" v-model="selectedAddComponent" size="md"></b-form-select>
        </div>
      </div>
    </div>
    <!-- input stuff -->
      <div v-for="item in activeItems" :key="item.UI_DisplayName" class="component-item">
        <span v-if="item.UI_Options.type != 'component'">{{item.UI_DisplayName}}:</span>
        <b-button variant="danger" v-on:click="setDeleted(item)"  v-if="item.UI_Options.type != 'component'"><b-icon-x></b-icon-x></b-button>
        <div class="input-container">          
          <b-form-input v-if="item.UI_Options.type == 'integer'" type="number" v-model="data[item.path]" number/>
          <b-form-input v-if="item.UI_Options.type == 'string'" type="text" v-model="data[item.path]" />
          <b-form-checkbox v-if="item.UI_Options.type == 'checkbox'"
            v-model="data[item.path]"
            value=true
            unchecked-value=false
          >
          </b-form-checkbox>

          <b-form-select v-if="item.UI_Options.type == 'name'" v-model="data[item.path].name" :options="structureData[item.dataPath]"></b-form-select>
          <b v-if="item.UI_Options.type == 'key_value_picker'">
            
            <p>
              <KeyValuePicker :name="item.UI_DisplayName" :keyName="item.UI_Options.key" :value="item.UI_Options.value" 
                              :keySource="structureData[item.UI_Options.key_source]" :valueSource="structureData[item.UI_Options.value_source]"
                              :keyNullValue="item.UI_Options.key_null_value" :valueNullValue="item.UI_Options.value_null_value"
                              :arrayPush="item.UI_Options.arrayPush"
                              :fixedArraySize="item.UI_Options.fixedArraySize"
                              :outputPath="generatedPath"
                              v-bind:data="data" >
                              
              </KeyValuePicker>
            </p>
            </b>
          <UIOption v-on:deleteComponent="onChildComponentDeleted" v-bind:title="item.UI_DisplayName" v-if="item.UI_Options.type == 'component'" v-bind:component-name="item.UI_Options.subtype" v-bind:save-id="saveId" v-bind:path="generatedPath + '.' + item.path"> </UIOption>
        </div>
        
      </div>
     </b-card>
  </div>
</template>

<script>
import axios from "axios";
import KeyValuePicker from './KeyValuePicker.vue';

export default {
  components: { KeyValuePicker },
  name: "UIOption", 
  props: ["componentName", "path", "title", "saveId"],
  data() {
      return {options: [], data: {}, generatedPath:"",selectedAddComponent: null, structureData: {}}
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
        if(this.options[i].UI_DisplayName === this.selectedAddComponent) {
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
    emitDeleted() {
      this.$emit('deleteComponent', {path: this.path});
    },
    setDeleted(deletedItem) {
      for(var i=0;i<this.options.length;i++) {
        if(this.options[i].path == deletedItem.path) {
          this.data[this.options[i].path] = null;
          this.$set(this.options[i], 'deleted', true);
          
        }
      }
    },
    onClickSave() {
      var fetchDataFromChildren = function(initial) {
        var full_data = initial || {};
        for(var i=0;i<this.$children.length;i++) {
          var data = this.$children[i]._data.data;
          if(this.$children[i]._props.path && this.$children[i]._data.data) {
            full_data[this.$children[i]._props.path] = data;

            full_data = fetchDataFromChildren.bind(this.$children[i], full_data)();
          }        
        }
        return full_data;
      }

      var uiData = {};
      var dataKeys = Object.keys(this.data);
      for(var i=0;i<dataKeys.length;i++) {
        var path = this.generatedPath + "." + dataKeys[i];
        uiData[path] = this.data[dataKeys[i]];
      }

      var update_data =  fetchDataFromChildren.bind(this)(uiData);
      
      axios.post('/api/component/' + this.componentName + "/" + this.saveId, update_data).then(function(response) {
        console.log("saved", response);
      }).catch(function(error) {
        console.log("failed to save", error);
      });
    },
    lookupData() {
      var path = "/api/component/" + this.componentName + "/" + this.saveId;
      if(this.path && this.path.length > 0) {
        path += "/" + this.path;
      }
      axios.get(path).then((response) => {
          var component_data = response.data;

          this.generatedPath = component_data.path;
          this.options = component_data.options;
          for(var c=0;c<this.options.length;c++) {
            var option = this.options[c];
            option.dataPath = option["data_source"] || option["path"];
          }

          this.data = component_data.data || {};
          for(var i=0;i<this.options.length;i++) {
            if(this.data[this.options[i].path] === undefined) {
              this.setDeleted(this.options[i]);
            }
            if(this.options[i].UI_Options && this.options[i].UI_Options.type == 'name') {
              if(this.data[this.options[i].path] === undefined) {
                this.data[this.options[i].path] = {type: "name"}; //object doesn't exist, set initial name
              }
            }
          }
          
          if(component_data && component_data.structureData) {
            this.structureData = component_data.structureData;
            var structureItems = Object.keys(this.structureData);
            for(var x=0;x<structureItems.length;x++) {
              var key = structureItems[x];
              for(var j=0;j<this.structureData[key].length;j++) {
                var item = this.structureData[key][j];
                var name = "frontend_desc";
                var value = "desc_id";

                if(item.UI_Options && item.UI_Options.name) {
                  name = item.UI_Options.name;
                }

                if(item.UI_Options && item.UI_Options.value) {
                  value = item.UI_Options.value;
                }
                
                item.text = item[name] || item[value];
                item.value = item[value];
                
              }
            }
          }

      });
    }
  },
  created() {
    this.lookupData();
 }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.add-component {
  display: inline-block;
  position: relative;
  float: right;
}
.add-component > .form-select {
  display: inline-block;
  float: right;
}
.add-component > .btn, .input-container > .btn {
  display: inline-block;
  float: right;
}
.component-item {
  display: inline-block;
  width: 100%;
}
.component-item > .btn {
  display: inline-block;
  float: right;
  margin: 5px 25px;
}
.input-container {
  float: right;
  display: inline-block;
}
.card-title {
  display: inline-block;
}
.component-controls > .btn {
  float: right;
}
.save-button {
  float: right;
}
</style>
