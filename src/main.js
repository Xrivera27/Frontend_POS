import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css"; // Asegúrate de importar los estilos

const app = createApp(App);

// Configura el plugin de Toastification
const options = {
  position: POSITION.TOP_RIGHT, // Puedes cambiar la posición del toast
  timeout: 3000, // Duración del toast
  hideProgressBar: false, // Mostrar barra de progreso
};

app.use(router);
app.use(Toast, options);

app.mount("#app");
