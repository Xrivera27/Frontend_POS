import { createRouter, createWebHistory } from 'vue-router';
import ClientesList from '../Pages/ClientesList.vue';
import ProveedoresList from '../Pages/ProveedoresList.vue';
import EmpleadoList from '@/Pages/EmpleadoList.vue';
import CategoriasList from '@/Pages/CategoriasList.vue';
import ProductosList from '@/Pages/ProductosList.vue';
import LoginList from '@/Pages/LoginList.vue';
import RegistroList from '@/Pages/RegistroList.vue';
import VentasList from '@/Pages/VentasList.vue';
import ComprasList from '@/Pages/ComprasList.vue';
import HomeList from '@/Pages/HomeList.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AdministrarVentas from '@/Pages/AdministrarVentas.vue';
import AdministrarCompras from '@/Pages/AdministrarCompras.vue';
import SucursalesList from '@/Pages/SucursalesList.vue';

function getRole() {
  return localStorage.getItem('role'); // Obtiene el rol del usuario desde localStorage
}

const routes = [
  {
    path: '/administrar-compras',
    name: 'AdministrarCompras',
    component: AdministrarCompras
  },

  {
    path: '/administrar-ventas',
    name: 'AdministrarVentas',
    component: AdministrarVentas
  },

  {
    path: '/',
    redirect: '/login' // Redirige a /login cuando se accede a la ruta raíz
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginList, LoadingSpinner
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
    path: '/sucursales',
    name: 'Sucursales',
    component: SucursalesList,
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
    path: '/compras',
    name: 'Compras',
    component: ComprasList,
  },
  {
    path: '/ventas',
    name: 'Ventas',
    component: VentasList,
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
