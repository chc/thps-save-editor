import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import VueRouter from 'vue-router';
Vue.use(Vuex)
Vue.use(VueRouter);



// 1. Define route components.
// These can be imported from other files
import ComponentEditor from "./components/ComponentEditor.vue";
// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
  {
    path: "/EditComponent/:component_name",
    name: "component_editor",
    component: ComponentEditor,
  },
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
    SaveId: "5e8a52b3b6043acc1fc5f247"
  }
});

new Vue({
  render: h => h(App),
  store,
  router
}).$mount('#app')
