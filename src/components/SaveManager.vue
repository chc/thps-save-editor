<template>
  <div class="container">
    <b-card title="Important Notice">
      <b-card-text>
      In order to proceed, you must either upload your save file, or enter a previously received save id.<br><br>

      Once you upload your save, or specify a save ID, various pages can be accessed via the "Skater Component" menu which will appear.<br><br>

      <b>Currently only THUG2 PC CASes are supported.</b> Other save types and games will be added at a later point. <br><br>
      
      <b>THUG Pro items are not supported</b>, however if you upload your THUG Pro skater, provided you do not modify any of the THUG Pro specific items, your skater can be downloaded without issue.<br><br>

      It is advised you back up your original save, as this tool is still in testing.<br>
      </b-card-text>
    </b-card>
      <div class="save-id-container">
          <label>Set Save ID:</label>
          <div class="save-id-input-container">
            <b-form-input type="text" v-model="saveId" />
          </div>
          <b-button variant="primary" v-on:click="onClickUpdateSaveId">Update Save ID</b-button>
      </div>
      <div>
        <label>Upload Save:</label>
        <input
          type="file"
          ref="fileInput"
          accept=".SKA"
          @change="onFilePicked"/>
          <b-button variant="success" v-on:click="onClickUpload">Upload<b-icon-arrow-up></b-icon-arrow-up></b-button>
          <b-button class="save-button" variant="outline-primary" v-on:click="onClickDownload" v-if="$store.state.SaveId">Download<b-icon-arrow-down></b-icon-arrow-down></b-button>
      </div>
      <div v-if="insertedId !== null">
        <b>The inserted ID was: <label style="color:red">{{insertedId}}</label>. Do not lose this ID, or your save file could be lost.</b>
      </div>
      <div v-if="loading">
        <b>Processing save file. Please wait.</b>
      </div>
      <div v-if="error">
        <b>Error processing request.</b>
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
        this.loading = true;
        this.error = false;
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
            this.loading = false;
        }.bind(this)).catch(function(error) {
          this.error = true;
          console.error(error);
        }.bind(this));
    },
    onClickUpdateSaveId() {
      this.$store.state.SaveId = this.saveId;
    },
    onFilePicked(event) {
      console.log(event);
    },
    onClickUpload() {
      if(this.$refs.fileInput.files == null || this.$refs.fileInput.files.length == 0 || this.loading) {
        return;
      }
      var file = this.$refs.fileInput.files[0];
      

      let formData = new FormData();
      formData.append('save', file);

      this.loading = true;
      this.error = false;
      axios({url: '/api/uploadSave', method: 'POST', data: formData}).then(function(response) {
        this.insertedId = response.data._id;
        this.$store.state.SaveId = this.insertedId;
        this.saveId = this.insertedId;
        this.loading = false;
      }.bind(this)).catch(function(error) {
        this.loading = false;
        this.error = true;
        console.error(error);
      }.bind(this));
    }
  }
}
</script>
<style scoped>
.save-id-container {
  display: block;
}
.save-id-controls {
  float: right;
}
.save-id-input-container {
  display: inline-block;
}
.btn {
  margin: 5px;
}
</style>