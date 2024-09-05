import { createRouter, createWebHistory } from 'vue-router';
import ClientesList from '../components/ClientesList.vue';
import ProveedoresList from '../components/ProveedoresList.vue'; // Importa tu componente de Proveedores
import Home from '../components/HomeList.vue'; // El componente de tu dashboard principal
import EmpleadoList from '@/components/EmpleadoList.vue';
import CategoriasList from '@/components/CategoriasList.vue';
import ProductosList from '@/components/ProductosList.vue';
import LoginList from '@/components/LoginList.vue';

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
  },

  {
    path: '/empleados',
    name: 'Empleados',
    component: EmpleadoList
  },

  {
    path: '/categorias',
    name: 'Categorias',
    component: CategoriasList
  },

  {
    path: '/productos',
    name: 'Productos',
    component: ProductosList
  },

  {
    path: '/login',
    name: 'Login',
    component: LoginList
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
