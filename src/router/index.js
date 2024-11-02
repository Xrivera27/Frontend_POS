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

// Función para obtener el rol desde localStorage
function getRole() {
  return localStorage.getItem("role"); // Obtiene el rol del usuario desde localStorage
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
  },
  {
    path: "/administrar-ventas",
    name: "AdministrarVentas",
    component: AdministrarVentas,
  },
  {
    path: "/",
    redirect: "/login", // Redirige a /login cuando se accede a la ruta raíz
  },
  {
    path: "/login",
    name: "Login",
    component: LoginList, // Solo el componente de login
  },
  {
    path: "/home",
    name: "Home",
    component: HomeList,
    meta: { requiresAuth: true }, // Añadido para rutas protegidas
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
    meta: { requiresAuth: true, role: [1, 2, 3, 4] },
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
    meta: { requiresAuth: true, role: [1, 2, 3] },
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
  },
  {
    path: "/promociones-categorias",
    name: "Promociones-categorias",
    component: PromocionesCategorias,
  },
  {
    path: "/config-page",
    name: "Config-page",
    component: ConfigPage,
    meta: { requiresAuth: true, role: [1, 2, 3, 4] },
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
    path: "/:pathMatch(.*)*", // Ruta para manejar rutas no encontradas
    redirect: "/",
  },
];

// Crear el router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Verificación de autenticación y control de acceso por roles
router.beforeEach((to, from, next) => {
  const isAuthenticated = Boolean(localStorage.getItem("auth")); // Verifica si el usuario está autenticado
  const role = getRole();

  console.log("Ruta solicitada:", to.path);
  console.log("Usuario autenticado:", isAuthenticated);
  console.log("Rol del usuario:", role);

  // Permitir siempre el acceso a la ruta /reset sin autenticación
  if (to.path === "/reset") {
    return next(); // Permite el acceso a la ruta de restablecimiento de contraseña
  }

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !isAuthenticated
  ) {
    return next("/login"); // Redirige al login
  }

  // Si la ruta tiene roles definidos y el rol del usuario no tiene acceso
  if (
    to.matched.some((record) => record.meta.role) &&
    !to.meta.role.includes(Number(role))
  ) {
    return next("/home"); // Redirige a Home si el rol no tiene acceso
  }

  next(); // Permite la navegación
});
export default router;
