import { createRouter, createWebHistory } from "vue-router";
import ClientesList from "../Pages/ClientesList.vue";
import ProveedoresList from "../Pages/ProveedoresList.vue";
import EmpleadoList from "@/Pages/EmpleadoList.vue";
import CategoriasList from "@/Pages/CategoriasList.vue";
import unidadMedidaList from "@/Pages/unidadMedidaList.vue";
import ProductosList from "@/Pages/ProductosList.vue";
import LoginList from "@/Pages/LoginList.vue";
import RegistroList from "@/Pages/RegistroList.vue";
import VentasList from "@/Pages/VentasList.vue";
import ComprasList from "@/Pages/ComprasList.vue";
import HomeList from "@/Pages/HomeList.vue";
import ReporteVentasList from "@/Pages/ReportesVentasList.vue";
import AdministrarVentas from "@/Pages/AdministrarVentas.vue";
import AdministrarCompras from "@/Pages/AdministrarCompras.vue";
import SucursalesList from "@/Pages/SucursalesList.vue";
import PromocionesProductos from "@/Pages/PromocionesProductos.vue";
import PromocionesCategorias from "@/Pages/PromocionesCategorias.vue";
import ConfigPage from "@/Pages/ConfigPage.vue";
import ConfigCompany from "@/Pages/ConfigCompany.vue";
import ConfigSar from "@/Pages/configSar.vue";
import AdministrarInventario from "@/Pages/AlertasInventario.vue";

// Función para obtener el rol desde localStorage
function getRole() {
  return localStorage.getItem("role");
}

/*
1: Admin
2: Gerente
3: Cajero
4: CEO
*/

const routes = [
  {
    path: "/administrar-compras",
    name: "AdministrarCompras",
    component: AdministrarCompras,
    meta: { requiresAuth: true, role: [1, 2, 4] },
  },
  {
    path: "/administrar-ventas",
    name: "AdministrarVentas",
    component: AdministrarVentas,
    meta: { requiresAuth: true, role: [1, 2, 4] },
  },
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: LoginList,
  },
  {
    path: "/home",
    name: "Home",
    component: HomeList,
    meta: { requiresAuth: true },
  },
  {
    path: "/clientes",
    name: "Clientes",
    component: ClientesList,
    meta: { requiresAuth: true, role: [1, 2, 4] },
  },
  {
    path: "/reporte",
    name: "reporte",
    component: ReporteVentasList,
    meta: { requiresAuth: true, role: [1, 2, 4] },
  },
  {
    path: "/sucursales",
    name: "Sucursales",
    component: SucursalesList,
    meta: { requiresAuth: true, role: [4] },
  },
  {
    path: "/proveedores",
    name: "Proveedores",
    component: ProveedoresList,
    meta: { requiresAuth: true, role: [1, 2, 4] },
  },
  {
    path: "/empleados",
    name: "Empleados",
    component: EmpleadoList,
    meta: { requiresAuth: true, role: [1, 4] },
  },
  {
    path: "/categorias",
    name: "Categorias",
    component: CategoriasList,
    meta: { requiresAuth: true, role: [1, 4] },
  },
  {
    path: "/unidad-medida",
    name: "Unidad-Medida",
    component: unidadMedidaList,
    meta: { requiresAuth: true, role: [1, 4] },
  },
  {
    path: "/productos",
    name: "Productos",
    component: ProductosList,
    meta: { requiresAuth: true, role: [1, 2, 4] },
  },
  {
    path: "/registro",
    name: "Registro",
    component: RegistroList,
  },
  {
    path: "/compras",
    name: "Compras",
    component: ComprasList,
    meta: { requiresAuth: true, role: [1, 2] },
  },
  {
    path: "/ventas",
    name: "Ventas",
    component: VentasList,
    meta: { requiresAuth: true, role: [1, 2, 3] },
  },
  {
    path: "/promociones-producto",
    name: "Promociones-producto",
    component: PromocionesProductos,
    meta: { requiresAuth: true, role: [1, 2, 4] },
  },
  {
    path: "/promociones-categorias",
    name: "Promociones-categorias",
    component: PromocionesCategorias,
    meta: { requiresAuth: true, role: [1, 2, 4] },
  },
  {
    path: "/config-page",
    name: "Config-page",
    component: ConfigPage,
    meta: { requiresAuth: true, role: [1, 2, 4] },
  },
  {
    path: "/config-company",
    name: "Config-company",
    component: ConfigCompany,
    meta: { requiresAuth: true, role: [1, 4] },
  },
  {
    path: "/config-sar",
    name: "Config-sar",
    component: ConfigSar,
    meta: { requiresAuth: true, role: [1] },
  },
  {
    path: "/admin-invenario",
    name: "Admin-inventario",
    component: AdministrarInventario,
    meta: { requiresAuth: true, role: [1, 2, 4] },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: () => {  // Removido el parámetro 'to' ya que no se usa
      const isAuthenticated = Boolean(localStorage.getItem("auth"));
      const role = getRole();
      
      if (!isAuthenticated) return '/login';
      return role === '3' ? '/ventas' : '/home';
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = Boolean(localStorage.getItem("auth"));
  const role = getRole();

  console.log("Ruta solicitada:", to.path);
  console.log("Usuario autenticado:", isAuthenticated);
  console.log("Rol del usuario:", role);

  // Si el usuario está autenticado e intenta acceder al login
  if (to.path === '/login' && isAuthenticated) {
    if (role === '3') {
      return next('/ventas');
    }
    return next('/home');
  }

  // Si intenta acceder a la ruta raíz estando autenticado
  if (to.path === '/' && isAuthenticated) {
    if (role === '3') {
      return next('/ventas');
    }
    return next('/home');
  }

  // Permitir acceso a reset-password sin autenticación
  if (to.path === "/reset") {
    return next();
  }

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
    return next("/login");
  }

  // Si la ruta tiene roles definidos y el rol del usuario no tiene acceso
  if (
    to.matched.some((record) => record.meta.role) &&
    !to.meta.role?.includes(Number(role))
  ) {
    if (role === '3') {
      return next('/ventas');
    }
    return next("/home");
  }

  // Si el usuario está autenticado y trata de acceder a una ruta no existente
  if (to.matched.length === 0 && isAuthenticated) {
    if (role === '3') {
      return next('/ventas');
    }
    return next('/home');
  }

  next();
});

// Manejar el evento popstate (botones atrás/adelante del navegador)
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const isAuthenticated = Boolean(localStorage.getItem("auth"));
    const role = getRole();

    if (isAuthenticated) {
      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/') {
        if (role === '3') {
          router.push('/ventas');
        } else {
          router.push('/home');
        }
      }
    }
  });
}

export default router;