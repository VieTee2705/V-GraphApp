import { createApp } from "vue";
import App from "./App.vue";
import vNetworkGraph from "v-network-graph";
import "v-network-graph/lib/style.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Import jQuery cho Bootstrap
import jQuery from "jquery";
window.$ = jQuery;

createApp(App).use(vNetworkGraph).mount("#app");
