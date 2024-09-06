import { createRouter, createWebHistory } from 'vue-router';
import ClientesList from '../components/ClientesList.vue';
import ProveedoresList from '../components/ProveedoresList.vue';
import EmpleadoList from '@/components/EmpleadoList.vue';
import CategoriasList from '@/components/CategoriasList.vue';
import ProductosList from '@/components/ProductosList.vue';
import LoginList from '@/components/LoginList.vue';
import RegistroList from '@/components/RegistroList.vue';
import HomeList from '@/components/HomeList.vue';

function getRole() {
  return localStorage.getItem('role'); // Obtiene el rol del usuario desde localStorage
}

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
    meta: { requiresAuth: true, roles: ['Administrador', 'Gerente'] }
  },
  {
    path: '/proveedores',
    name: 'Proveedores',
    component: ProveedoresList,
    meta: { requiresAuth: true, roles: ['Administrador', 'Gerente'] }
  },
  {
    path: '/empleados',
    name: 'Empleados',
    component: EmpleadoList,
    meta: { requiresAuth: true, roles: ['Administrador'] }
  },
  {
    path: '/categorias',
    name: 'Categorias',
    component: CategoriasList,
    meta: { requiresAuth: true, roles: ['Administrador'] }
  },
  {
    path: '/productos',
    name: 'Productos',
    component: ProductosList,
    meta: { requiresAuth: true, roles: ['Administrador', 'Gerente', 'Cajero'] }
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

// Verificación de autenticación y control de acceso por roles
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('auth');
  const role = getRole();

  // Si la ruta requiere autenticación y el usuario no está autenticado, redirige al login
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
  } else if (to.matched.some(record => record.meta.roles) && !to.meta.roles.includes(role)) {
    // Redirige a Home si el rol no tiene acceso a la ruta
    next('/home');
  } else {
    next();
  }
});

export default router;
