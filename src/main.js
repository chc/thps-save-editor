import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import VueRouter from 'vue-router';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

import VueLodash from 'vue-lodash'
import lodash from 'lodash'
 
// name is optional
Vue.use(VueLodash, { name: 'custom' , lodash: lodash })


Vue.use(Vuex)
Vue.use(VueRouter);

// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)



// 1. Define route components.
// These can be imported from other files
import ComponentEditor from "./components/ComponentEditor.vue";
import SaveManager from "./components/SaveManager.vue";
// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
  {
    path: "/EditComponent/:component_name/:save_id",
    name: "component_editor",
    component: ComponentEditor,
  },
  {
    path: "/manage_save",
    name: "manage_save",
    component: SaveManager,
  },
  {path: "/", redirect: "/manage_save"}
];

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
  routes // short for `routes: routes`
})

Vue.config.productionTip = false

const store = new Vuex.Store({
  state: {
    SaveId: null
  }
});

new Vue({
  render: h => h(App),
  store,
  router
}).$mount('#app')
