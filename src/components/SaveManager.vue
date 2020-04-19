<template>
  <div class="container">
      <b-button class="save-button" variant="primary" v-on:click="onClickDownload">Download<b-icon-arrow-down></b-icon-arrow-down></b-button>
    </div>
</template>

<script>
import axios from "axios";
export default {
  name: "SaveManager", 
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
}
</script>