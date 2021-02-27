<template>
  <div class="component-container">
      <b-button class="save-button" variant="primary" v-on:click="onClickDownload">Download<b-icon-arrow-down></b-icon-arrow-down></b-button>
      <UIOption :key="$route.fullPath" v-bind:component-name="root_component" v-bind:save-id="SaveId" title="Component Editor" />
    </div>
</template>

<script>
import UIOption from './UIOption'
import  axios from 'axios';
export default {
  name: "ComponentEditor",
  components: {
    UIOption
  },
  data() {
      return {root_component: this.$route.params.component_name, SaveId: this.$route.params.save_id};
  },
  beforeRouteUpdate(to, from, next) {
    this.root_component = to.params.component_name
    this.SaveId = to.params.save_id;
    next();
  },
  created() {
    this.$store.state.SaveId = this.SaveId; //set, incase its specified via route, and not currently in state.
  },
  methods: {
    onClickDownload() {
        axios({url: '/api/downloadSave/' + this.$store.state.SaveId, method: "GET", responseType: "blob"}).then(function(response) {
            let headerLine = response.headers['content-disposition']
            let startFileNameIndex = headerLine.indexOf('"') + 1
            let endFileNameIndex = headerLine.lastIndexOf('"')
            let filename = headerLine.substring(startFileNameIndex, endFileNameIndex)

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
        });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .component-container {
    height: 100%;
    margin: 5%;
    display: block;
  }
  /*.form-select {
  display: inline-block;
  float: right;
}*/
</style>
