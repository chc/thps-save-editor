<template>
  <div class="container">
      <b-button class="save-button" variant="primary" v-on:click="onClickDownload" v-if="$store.state.SaveId">Download<b-icon-arrow-down></b-icon-arrow-down></b-button>
      <div>
        <span>Save ID:</span>
        <b-form-input type="text" v-model="saveId" />
        <b-button variant="primary" v-on:click="onClickUpdateSaveId">Update Save ID</b-button>
      </div>
      <div>
        <span>Upload Save:</span>
        <input
          type="file"
          ref="fileInput"
          accept=".SKA"
          @change="onFilePicked"/>
          <b-button variant="primary" v-on:click="onClickUpload">Upload<b-icon-arrow-up></b-icon-arrow-up></b-button>
      </div>
      <div v-if="insertedId !== null">
        <b>The inserted ID was: <span style="color:red">{{insertedId}}</span>. Do not lose this ID, or your save file could be lost.</b>
      </div>
      <div v-if="loading">
        <b>Processing save file. Please wait.</b>
      </div>
      <div v-if="error">
        <b>Error processing file.</b>
      </div>
    </div>
</template>

<script>
import axios from "axios";
export default {
  name: "SaveManager", 
  data() {
    return {saveId: this.$store.state.SaveId, insertedId: null, loading: false, error: false};
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
    },
    onClickUpdateSaveId() {
      this.$store.state.SaveId = this.saveId;
    },
    onFilePicked(event) {
      console.log(event);
    },
    onClickUpload() {
      if(this.$refs.fileInput.files == null || this.$refs.fileInput.files.length == 0) {
        return; //xxx prevent this by error state
      }
      var file = this.$refs.fileInput.files[0];
      

      let formData = new FormData();
      formData.append('save', file);

      this.loading = true;
      axios({url: '/api/uploadSave', method: 'POST', data: formData}).then(function(response) {
        this.insertedId = response.data._id;
        this.$store.state.SaveId = this.insertedId;
        this.saveId = this.insertedId;
        this.loading = false;
      }.bind(this)).catch(function() {
        this.loading = false;
        this.error = true;
      }.bind(this));
    }
  }
}
</script>