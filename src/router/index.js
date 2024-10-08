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

import AdministrarVentas from '@/Pages/AdministrarVentas.vue';
import AdministrarCompras from '@/Pages/AdministrarCompras.vue';
import SucursalesList from '@/Pages/SucursalesList.vue';
import PromocionesProductos from '@/Pages/PromocionesProductos.vue';
import PromocionesCategorias from '@/Pages/PromocionesCategorias.vue';
import ConfigPage from '@/Pages/ConfigPage.vue';

// Función para obtener el rol desde localStorage
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
    component: LoginList // Solo el componente de login
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeList,
    meta: { requiresAuth: true, } // Añadido para rutas protegidas
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: ClientesList,
    meta: { requiresAuth: true, role: [1, 2] }
  },
  {
    path: '/sucursales',
    name: 'Sucursales',
    component: SucursalesList,
    meta: { requiresAuth: true, role: [1, 2] }
  },
  {
    path: '/proveedores',
    name: 'Proveedores',
    component: ProveedoresList,
    meta: { requiresAuth: true, role: [1, 2] }
  },
  {
    path: '/empleados',
    name: 'Empleados',
    component: EmpleadoList,
    meta: { requiresAuth: true, role: [1] }
  },
  {
    path: '/categorias',
    name: 'Categorias',
    component: CategoriasList,
    meta: { requiresAuth: true, role: [1] }
  },
  {
    path: '/productos',
    name: 'Productos',
    component: ProductosList,
    meta: { requiresAuth: true, role: [1, 2, 3] }
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
    path: '/promociones-producto',
    name: 'Promociones-producto',
    component: PromocionesProductos,
  },
  {
    path: '/promociones-categorias',
    name: 'Promociones-categorias',
    component: PromocionesCategorias,
  },
  {
    path: '/config-page',
    name: 'Config-page',
    component: ConfigPage,
  },
  {
    path: '/:pathMatch(.*)*', // Ruta para manejar rutas no encontradas
    redirect: '/'
  }
];

// Crear el router
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Verificación de autenticación y control de acceso por roles
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('auth');
  const role = getRole();

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
  } else if (to.matched.some(record => record.meta.roles) && !to.meta.roles.includes(role)) {
    next('/home'); // Si el rol no tiene acceso, lo redirige a Home
  } else {
    next();
  }
});

export default router;
