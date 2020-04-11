<template>
  <div id="app">
    <p><router-link :to="{name: 'component_editor', params: {component_editor: 'customskater_info_structure' }}">Go to Info Editor</router-link></p>
    <p><router-link :to="{name: 'component_editor', params: {component_editor: 'customskater_stats_structure' }}">Go to Stats Editor</router-link></p>
    <p><router-link :to="{name: 'component_editor', params: {component_editor: 'customskater_appearance_structure' }}">Go to Appearance Editor</router-link></p>
    
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: "App",
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
