<!-- Mi Sidebar :D -->
<template>
  <div class="sidebar-container" :class="{ 'is-mobile': isMobile }">
    <ModalLoading :isLoading="isLoading" />
    <div
      v-if="isMobile && expanded"
      class="sidebar-overlay"
      @click="toggleSidebar"
    ></div>
    <aside
      ref="sidebar"
      v-if="!isLoginRoute"
      class="sidebar"
      :class="{ expanded, dark: isDarkMode }"
    >
      <!-- Toggle button for expanding/collapsing -->
      <ul class="nav flex-column">
        <!-- Toggle Sidebar Arrow -->
        <li class="nav-item">
          <a
            @click="toggleSidebar"
            class="nav-link"
            style="cursor: pointer"
            data-tooltip="Expandir Menú"
          >
            <i
              class="bi"
              :class="expanded ? 'bi-chevron-left' : 'bi-chevron-right'"
            ></i>
            <span v-if="expanded" class="tooltip-text">Contraer Menú</span>
          </a>
        </li>

        <!-- Home -->
        <li v-if="hasPermission('Home')" class="nav-item">
          <router-link
            @click="handleRouteChange"
            to="/home"
            class="nav-link"
            :class="{ active: isActive('/home') }"
            data-tooltip="Home"
          >
            <i class="bi bi-house-door-fill"></i>
            <span v-if="expanded" class="tooltip-text">Home</span>
          </router-link>
        </li>

        <!-- Sucursales -->
        <li v-if="hasPermission('Sucursal')" class="nav-item">
          <router-link
            @click="handleRouteChange"
            to="/sucursales"
            class="nav-link"
            :class="{ active: isActive('/sucursales') }"
            data-tooltip="Sucursales"
          >
            <i class="bi bi-shop-window"></i>
            <span v-if="expanded" class="tooltip-text">Sucursal</span>
          </router-link>
        </li>

        <!-- Usuario -->
        <li v-if="hasPermission('Usuario')" class="nav-item">
          <router-link
            @click="handleRouteChange"
            to="/empleados"
            class="nav-link"
            :class="{ active: isActive('/empleados') }"
            data-tooltip="Usuarios"
          >
            <i class="bi bi-person-fill"></i>
            <span v-if="expanded" class="tooltip-text">Usuario</span>
          </router-link>
        </li>

        <!-- Categorías -->
        <li v-if="hasPermission('Categorias')" class="nav-item">
          <router-link
            @click="handleRouteChange"
            to="/categorias"
            class="nav-link"
            :class="{ active: isActive('/categorias') }"
            data-tooltip="Categorías"
          >
            <i class="bi bi-tags-fill"></i>
            <span v-if="expanded" class="tooltip-text">Categorías</span>
          </router-link>
        </li>

        <!-- Productos -->
        <li v-if="hasPermission('Productos')" class="nav-item">
          <router-link
            @click="handleRouteChange"
            to="/productos"
            class="nav-link"
            :class="{ active: isActive('/productos') }"
            data-tooltip="Productos"
          >
            <i class="bi bi-box-seam"></i>
            <span v-if="expanded" class="tooltip-text">Productos</span>
          </router-link>
        </li>

        <!-- Clientes -->
        <li v-if="hasPermission('Clientes')" class="nav-item">
          <router-link
            @click="handleRouteChange"
            to="/clientes"
            class="nav-link"
            :class="{ active: isActive('/clientes') }"
            data-tooltip="Clientes"
          >
            <i class="bi bi-people-fill"></i>
            <span v-if="expanded" class="tooltip-text">Clientes</span>
          </router-link>
        </li>

        <!-- Proveedores -->
        <li v-if="hasPermission('Proveedores')" class="nav-item">
          <router-link
            @click="handleRouteChange"
            to="/proveedores"
            class="nav-link"
            :class="{ active: isActive('/proveedores') }"
            data-tooltip="Proveedores"
          >
            <i class="bi bi-truck"></i>
            <span v-if="expanded" class="tooltip-text">Proveedores</span>
          </router-link>
        </li>

        <!-- Ventas Dropdown -->
        <li
          v-if="hasPermission('Venta')"
          class="nav-item dropdown"
          ref="ventasDropdown"
        >
          <a
            href="#"
            class="nav-link"
            @click.prevent="toggleDropdown('ventas')"
          >
            <i class="bi bi-cash-stack"></i>
            <span v-if="expanded" class="tooltip-text">Ventas</span>
            <i
              class="bi bi-chevron-down dropdown-arrow"
              :class="{ rotated: openDropdowns.ventas }"
            ></i>
          </a>
          <ul class="dropdown-menu" :class="{ show: openDropdowns.ventas }">
            <li>
              <router-link
                @click="handleRouteChange"
                to="/administrar-ventas"
                class="dropdown-item"
                >Administrar ventas</router-link
              >
            </li>
            <li>
              <router-link
                @click="handleRouteChange"
                to="/reporte"
                class="dropdown-item"
                >Reporte de ventas</router-link
              >
            </li>
          </ul>
        </li>

        <!-- Compras Dropdown -->
        <li
          v-if="hasPermission('Compra')"
          class="nav-item dropdown"
          ref="comprasDropdown"
        >
          <a
            href="#"
            class="nav-link"
            @click.prevent="toggleDropdown('compras')"
          >
            <i class="bi bi-cart-plus-fill"></i>
            <span v-if="expanded" class="tooltip-text">Compras</span>
            <i
              class="bi bi-chevron-down dropdown-arrow"
              :class="{ rotated: openDropdowns.compras }"
            ></i>
          </a>
          <ul class="dropdown-menu" :class="{ show: openDropdowns.compras }">
            <li>
              <router-link
                @click="handleRouteChange"
                to="/administrar-compras"
                class="dropdown-item"
                >Administrar compras</router-link
              >
            </li>
            <li v-if="getCurrentRole !== '4'">
              <router-link
                @click="handleRouteChange"
                to="/compras"
                class="dropdown-item"
                >Crear compra</router-link
              >
            </li>
            <li>
              <router-link
                @click="handleRouteChange"
                to="/admin-invenario"
                class="dropdown-item"
              >
                Alertas de inventario</router-link
              >
            </li>
          </ul>
        </li>
      </ul>

      <div id="aside-line"></div>

      <ul class="nav flex-column">
        <!-- Configuración -->
        <li class="nav-item">
          <router-link
            @click="handleRouteChange"
            to="/config-page"
            class="nav-link"
            :class="{ active: isActive('/config-page') }"
            data-tooltip="Configuración"
          >
            <i class="bi bi-gear-fill"></i>
            <span v-if="expanded" class="tooltip-text">Configuración</span>
          </router-link>
        </li>

        <!-- Cerrar sesión -->
        <li class="nav-item">
          <a
            @click="salir"
            class="nav-link"
            style="cursor: pointer"
            data-tooltip="Cerrar Sesión"
          >
            <i class="bi bi-box-arrow-right"></i>
            <span v-if="expanded" class="tooltip-text">Cerrar sesión</span>
          </a>
        </li>
        <LogoutConfirmModal
          :isVisible="showConfirmModal"
          @confirm="logout"
          @cancel="cancelarSalir"
        />

        <!-- Toggle Dark Mode -->
        <li class="nav-item">
          <a
            @click="toggleDarkMode"
            class="nav-link"
            style="cursor: pointer"
            data-tooltip="Cambiar Tema"
          >
            <i
              class="bi"
              :class="isDarkMode ? 'bi-brightness-high' : 'bi-moon-stars-fill'"
            ></i>
            <span v-if="expanded" class="tooltip-text">Cambiar Tema</span>
          </a>
        </li>
      </ul>
    </aside>
    <button v-if="isMobile" class="mobile-toggle" @click="toggleSidebar">
      <i class="bi bi-list"></i>
    </button>
  </div>
</template>

<script>
import LogoutConfirmModal from "@/components/LogoutConfirmModal.vue";
export default {
  components: {
    LogoutConfirmModal,
  },
  name: "AppSidebar",
  data() {
    return {
      showConfirmModal: false,
      isMobile: window.innerWidth <= 480,
      openDropdowns: {
        ventas: false,
        compras: false,
        isLoading: false,
      },
    };
  },

  props: {
    isDarkMode: {
      type: Boolean,
      required: true,
    },
    expanded: {
      type: Boolean,
      required: true,
    },
    dropdowns: {
      type: Object,
      required: true,
    },
    hasPermission: {
      type: Function,
      required: true,
    },
    isActive: {
      type: Function,
      required: true,
    },
    isLoginRoute: {
      type: Boolean,
      required: true,
    },
  },

  emits: [
    "toggle-sidebar",
    "openDropdown",
    "closeDropdown",
    "logout",
    "toggle-dark-mode",
    "expandSidebar",
    "collapseSidebar",
  ],

  methods: {
    toggleSidebar() {
      this.$emit("toggle-sidebar");
    },
    toggleDropdown(menu) {
      if (menu === "ventas") {
        this.openDropdowns.compras = false;
      } else if (menu === "compras") {
        this.openDropdowns.ventas = false;
      }

      this.openDropdowns[menu] = !this.openDropdowns[menu];
    },
    closeDropdowns(event) {
      const ventasDropdown = this.$refs.ventasDropdown;
      const comprasDropdown = this.$refs.comprasDropdown;

      if (
        !ventasDropdown?.contains(event.target) &&
        !comprasDropdown?.contains(event.target)
      ) {
        this.openDropdowns.ventas = false;
        this.openDropdowns.compras = false;
      }
    },
    isDropdownOpen(menu) {
      return this.openDropdowns[menu];
    },

    logout() {
      this.$emit("logout"); // Emitir el evento de logout al componente padre
    },

    salir() {
      // Si no está mostrando el modal, mostrarlo primero
      if (!this.showConfirmModal) {
        this.showConfirmModal = true;
        return;
      }

      // Si ya está mostrando el modal y confirman, entonces hacer logout
      this.showConfirmModal = false;
      this.isLoading = true;
      this.logout();
    },

    cancelarSalir() {
      this.showConfirmModal = false;
    },

    toggleDarkMode() {
      this.$emit("toggle-dark-mode");
    },
    expandSidebar() {
      this.$emit("expand-sidebar");
    },
    collapseSidebar() {
      this.$emit("collapse-sidebar");
    },
    handleRouteChange() {
      if (this.isMobile) {
        this.$emit("toggle-sidebar");
      }
      this.openDropdowns.ventas = false;
      this.openDropdowns.compras = false;
    },
  },

  computed: {
    getCurrentRole() {
      return localStorage.getItem("role") || "";
    },
  },

  mounted() {
    document.addEventListener("click", this.closeDropdowns);

    window.addEventListener("resize", () => {
      this.isMobile = window.innerWidth <= 480;
    });
  },

  beforeUnmount() {
    document.removeEventListener("click", this.closeDropdowns);
    window.removeEventListener("resize", () => {
      this.isMobile = window.innerWidth <= 480;
    });
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

/* Estilos Base */
* {
  font-family: "Montserrat", sans-serif;
  box-sizing: border-box;
}

.nav {
  list-style: none;
  padding: 0;
}

ul.nav {
  padding: 0 15px;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  width: 80px;
  height: 100%;
  background-color: #ebebeb;
  color: #c09d62;
  padding-top: 20px;
  padding-right: 0;
  margin: 0;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

/* Sidebar no expandido */
.sidebar:not(.expanded) .nav-link {
  justify-content: center;
  padding: 1vh;
}

.sidebar:not(.expanded) .nav-link i {
  margin: 0;
}

.sidebar:not(.expanded) .dropdown-menu {
  position: absolute;
  left: 100%;
  top: 0;
  min-width: 200px;
  background-color: #ebebeb;
  box-shadow: 4px 0 8px rgba(0, 0, 0, 0.1);
  border-radius: 0 8px 8px 0;
  margin: 0;
  padding: 0;
}

.sidebar:not(.expanded) .nav-item.dropdown {
  position: relative;
  width: 100%;
}

.sidebar:not(.expanded) .dropdown-arrow {
  transform: rotate(-90deg);
}

/* Sidebar expandido */
.sidebar.expanded {
  width: 200px;
}

.sidebar.expanded .nav-item.dropdown {
  width: 88%;
}

.sidebar.expanded .nav-link {
  justify-content: flex-start;
  padding: 1vh 1.5vh;
}

/* Tooltip personalizado */
.nav-item {
  position: relative;
}

/* Tooltip personalizado */
.sidebar:not(.expanded) .nav-link:not(.dropdown .nav-link):hover::after {
  content: attr(data-tooltip);
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(192, 157, 98, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
}

/* Flecha del tooltip */
.sidebar:not(.expanded) .nav-link:not(.dropdown .nav-link):hover::before {
  content: "";
  position: absolute;
  left: calc(100% + 5px);
  top: 50%;
  transform: translateY(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: transparent rgba(192, 157, 98, 0.9) transparent transparent;
  z-index: 1000;
  pointer-events: none;
}

/* Navegación */
.nav-item {
  transform: translateX(-10px);
  opacity: 0;
  animation: slideIn 0.3s ease forwards;
  padding: 4px 0;
}

.nav-item.dropdown {
  width: 88%;
  padding: 4px 0;
  font-weight: 550;
}

.nav-link {
  display: flex;
  position: relative;
  /*overflow: hidden;*/
  align-items: center;
  justify-content: flex-start;
  color: #c09d62;
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.nav-link i {
  font-size: 2.5vh;
  color: inherit;
  transition: transform 0.3s ease;
}

.nav-link:hover {
  background-color: #dadada;
}

.nav-link.active {
  background-color: #d4d4d4;
  color: #79552f;
}

/* Dropdown */
.dropdown-menu {
  position: static;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  background-color: rgba(192, 157, 98, 0.1);
  border-radius: 8px;
  margin: 0 8px;
  transform-origin: top;
  transform: scaleY(0);
}

.dropdown-menu.show {
  max-height: 1000px;
  opacity: 1;
  padding: 8px 0;
  transform: scaleY(1);
}

.dropdown-item {
  padding: 8px 16px;
  color: #c09d62;
  display: block;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.9em;
}

.dropdown-item:hover {
  background-color: rgba(192, 157, 98, 0.2);
  padding-left: 20px;
}

.dropdown-arrow {
  margin-left: auto;
  transition: transform 0.3s ease;
  font-size: 0.8em;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu a {
  font-size: 14px;
  width: auto;
  text-decoration: none;
  color: #c09d62;
}

/* Modo Oscuro */
.sidebar.dark {
  background-color: #333;
}

.sidebar.dark a.nav-link {
  color: #c09d62;
}

.sidebar.dark .nav-link.active {
  color: #79552f;
}

.sidebar.dark .dropdown-menu {
  background-color: #2d2d2d;
}

.sidebar.dark .dropdown-menu *,
.sidebar.dark .dropdown-item,
.sidebar.dark .dropdown-menu a {
  color: #c09d62 !important;
}

.sidebar.dark .dropdown-item:hover {
  background-color: rgba(192, 157, 98, 0.15);
}

.sidebar.dark:not(.expanded) .dropdown-menu {
  background-color: #2d2d2d;
  box-shadow: 4px 0 8px rgba(0, 0, 0, 0.3);
}

/* Tooltip */
.tooltip-text {
  margin-left: 10px;
  font-size: 15px;
  font-weight: 550;
}

/* Línea divisoria */
#aside-line {
  width: 60%;
  height: 1px;
  background-color: #c09d62;
  margin: 8px auto;
}

/* Mobile */
@media (max-width: 480px) {
  .sidebar {
    transform: translateX(-100%);
    width: 100%;
  }

  .sidebar.expanded {
    transform: translateX(0);
    width: 50%;
  }

  .mobile-toggle {
    position: fixed;
    top: 15px;
    left: 15px;
    width: 40px;
    height: 40px;
    background-color: transparent;
    color: #c09d62;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1001;
    border: none;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease;
  }

  .sidebar-overlay.show {
    opacity: 1;
    visibility: visible;
  }

  .nav-item {
    margin: 8px 0;
  }

  .nav-link {
    padding: 12px 20px;
  }

  .dropdown-menu {
    position: static;
    width: 100%;
    margin: 0;
    padding: 0;
  }
}

/* Animaciones */
@keyframes slideIn {
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.nav-item:nth-child(1) {
  animation-delay: 0.1s;
}

.nav-item:nth-child(2) {
  animation-delay: 0.2s;
}

.nav-item:nth-child(3) {
  animation-delay: 0.3s;
}

.nav-item:nth-child(4) {
  animation-delay: 0.4s;
}

.nav-item:nth-child(5) {
  animation-delay: 0.5s;
}

.nav-item:nth-child(6) {
  animation-delay: 0.6s;
}

.nav-item:nth-child(7) {
  animation-delay: 0.7s;
}

.nav-item:nth-child(8) {
  animation-delay: 0.8s;
}
</style>
