import { createRouter, createWebHistory } from 'vue-router';
import ClientesList from '../components/ClientesList.vue';
import ProveedoresList from '../components/ProveedoresList.vue';
import EmpleadoList from '@/components/EmpleadoList.vue';
import CategoriasList from '@/components/CategoriasList.vue';
import ProductosList from '@/components/ProductosList.vue';
import LoginList from '@/components/LoginList.vue';
import RegistroList from '@/components/RegistroList.vue';
import HomeList from '@/components/HomeList.vue'; // Importa tu componente de Home

const routes = [
  {
    path: '/',
    redirect: '/login' // Redirige a /login cuando se accede a la ruta raíz
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginList
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeList,
    meta: { requiresAuth: true } // Añadido para rutas protegidas
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: ClientesList,
    meta: { requiresAuth: true }
  },
  {
    path: '/proveedores',
    name: 'Proveedores',
    component: ProveedoresList,
    meta: { requiresAuth: true }
  },
  {
    path: '/empleados',
    name: 'Empleados',
    component: EmpleadoList,
    meta: { requiresAuth: true }
  },
  {
    path: '/categorias',
    name: 'Categorias',
    component: CategoriasList,
    meta: { requiresAuth: true }
  },
  {
    path: '/productos',
    name: 'Productos',
    component: ProductosList,
    meta: { requiresAuth: true }
  },
  {
    path: '/registro',
    name: 'Registro',
    component: RegistroList
  },
  {
    path: '/:pathMatch(.*)*', // Ruta para manejar rutas no encontradas
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Verificación de autenticación global
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('auth');

  // Si la ruta requiere autenticación y el usuario no está autenticado, redirige al login
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
