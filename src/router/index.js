import { createRouter, createWebHistory } from 'vue-router';
import ClientesList from '../components/ClientesList.vue';
import ProveedoresList from '../components/ProveedoresList.vue'; // Importa tu componente de Proveedores
import Home from '../components/HomeList.vue'; // El componente de tu dashboard principal

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: ClientesList
  },
  {
    path: '/proveedores',
    name: 'Proveedores',
    component: ProveedoresList
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
