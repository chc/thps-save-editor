<template>
  <b-card 
    v-bind:title="name" bg-variant="light">
    <div class="component-controls">
      
      <div class="add-component">
        <label>Add/Remove key:</label>
        <b-button variant="success" v-on:click="onClickAddKey"><b-icon-plus></b-icon-plus></b-button>
        <div class="form-select">
          <b-form-select :options="inactiveKeys" value-field="value" text-field="value" v-model="selectedAddKey" size="md"></b-form-select>
        </div>
      </div>
      </div>
   <div class="picker-item" v-for="(item, index) in activeData" :key="index">
      <label>{{item[keyName].name}}:</label>
      <b-button variant="danger" v-on:click="deleteKey(item[keyName].name)"><b-icon-x></b-icon-x></b-button>
      <div class="form-select">
          <b-form-select :options="valueSource" value-field="desc_id" text-field="frontend_desc"  size="md" v-model="item[value].name"></b-form-select>
        </div>
        
    </div>
  <!-- <div v-if="fixedArraySize > 0">
    The fixed array size is {{fixedArraySize}}. Any entries above this number will be removed. This applies to the root node, which may not include all displayed items.
    </div>
    -->
  </b-card>
</template>

<script>

export default {
  name: "KeyValuePicker", 
  props: ["name", "keyName", "value", "keySource", "valueSource", "outputPath", "arrayPush","data", "keyNullValue", "valueNullValue", "fixedArraySize"],
  data() {
      return {selectedAddKey: null}
  },
  computed: {
      activeData: function() {
        var result = [];
        for(var i=0;i<this.data.length;i++) {
          var item = this.data[i];
          if(this.canEditKey(item[this.keyName].name)) {
            result.push(item);
          }
        }
        return result;
      },
      activeKeys: function() {
        var items = [];
        for(var i=0;i<this.data.length;i++) {
          var keyName = this.data[i][this.keyName].name;
          if(this.canEditKey(keyName)) {
            items.push(keyName);
          }
        }
        return items;
      },
      inactiveKeys: function() {
        var items = [];
        var activeKeys = this.activeKeys;
        

        for(var i=0;i<this.keySource.length;i++) {
          var key = this.keySource[i];
          if(this.canEditKey(key.value) && activeKeys.indexOf(key.value) == -1) {
            items.push(key);
          }
        }
        return items;
      }
  },
  methods: {
    canEditKey(keyName) {
      var keys = this.keySource;
      for(var i=0;i<keys.length;i++) {
        if(keys[i].value === keyName)
          return true;
      }
      return false;
    },
    getDefaultValueName() {
      if(this.valueSource == null || this.valueSource.length == 0) return this.valueNullValue;
      return this.valueSource[0].value;
    },
    onClickAddKey() {
      this.insertKey(this.selectedAddKey);
      this.selectedAddKey = null;
    },
    insertKey(keyName) {
      var kvObject = {};
      kvObject[this.keyName] = {name: keyName, type: "name"};
      kvObject[this.value] = {name: this.getDefaultValueName(), type: "name"};
      this.data.push(kvObject);

      this.correctArrayStructure();
    },
    deleteKey(keyName) {
      for(var i=0;i<this.data.length;i++) {
        var dataKeyName = this.data[i][this.keyName].name;
        if(keyName === dataKeyName) {
          this.data.splice(i, 1);
        }
      }

      this.correctArrayStructure();
    },
    removeNullValues() {
      for(var i=0;i<this.data.length;i++) {
        var dataKeyName = this.data[i][this.keyName].name;
        var dataValueName = this.data[i][this.value].name;
        if(dataKeyName === this.keyNullValue || dataValueName == this.valueNullValue) {
          this.data.splice(i, 1);
        }
      }
    },
    insertNullValues() {
      if(this.fixedArraySize) {
        var diff = this.fixedArraySize - this.data.length;
        var kvObject = {};
        kvObject[this.keyName] = {name: this.keyNullValue, type: "name"};
        kvObject[this.value] = {name: this.valueNullValue, type: "name"};
        for(var i=0;i<diff;i++) {
          this.data.push(kvObject);
        }
      }
    },
    /*
      force array to be confined to game requirements
    */
    correctArrayStructure() {
      this.removeNullValues();
      this.insertNullValues();
    }
  },
  created() {
    this.correctArrayStructure();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.form-select {
  float: right;
}
.component-controls {
  display: inline-block;
  width: 100%;
}
.add-component > .btn, .picker-item > .btn {
  float: right;
  margin: 0 5px;
}
.picker-item {
  width: 100%;
  display: inline-block;
  margin: 5px 0;
}
</style>
