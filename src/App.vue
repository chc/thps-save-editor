<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="/">Save Editor</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      
      <b-navbar-nav>
          <b-nav-item :to="{name: 'manage_save'}">Upload Save</b-nav-item>
          <b-nav-item-dropdown text="Skater Components" v-if="$store.state.SaveId">
          <b-dropdown-item :to="{name: 'component_editor', params: {component_name: 'globalinfo_options_taunts_structure', save_id: $store.state.SaveId }}">Taunts</b-dropdown-item>
          <b-dropdown-item :to="{name: 'component_editor', params: {component_name: 'customskater_info_structure', save_id: $store.state.SaveId }}">Info</b-dropdown-item>
          <b-dropdown-item :to="{name: 'component_editor', params: {component_name: 'customskater_stats_structure', save_id: $store.state.SaveId }}">Stats</b-dropdown-item>
          <b-dropdown-item :to="{name: 'component_editor', params: {component_name: 'customskater_appearance_structure', save_id: $store.state.SaveId }}">Appearance</b-dropdown-item>
          <b-dropdown-item :to="{name: 'component_editor', params: {component_name: 'customskater_info_trick_mapping', save_id: $store.state.SaveId }}">Trick Mapping</b-dropdown-item>
          <b-dropdown-item :to="{name: 'component_editor', params: {component_name: 'customskater_special_trick', save_id: $store.state.SaveId }}">Special Trick Mapping</b-dropdown-item>
          <b-dropdown-item :to="{name: 'manage_save'}">Upload/Download</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
    </b-navbar>
    <div id="router-container">
      <div id="router-view">
      <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

export default {
  name: "App",
};
</script>

<style>
body > div {
  overflow: hidden;
  position: fixed;
  height: 100%;
  width: 100%;
}
#router-container {
  height:95%;
  overflow-x: hidden;
  overflow-y: scroll;
  
}
#router-view {
  margin-top: 60px;
}
</style>
