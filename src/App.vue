<template>
  <div class="app-wrapper" :class="{ dark: isDarkMode }">
    <AppSidebar v-if="isInitialized && shouldShowSidebar" :class="{ 'hidden-sidebar': !showSidebar }"
      :isDarkMode="isDarkMode" :expanded="expanded" :dropdowns="dropdowns" :has-permission="hasPermission"
      :is-active="isActive" @toggle-sidebar="toggleSidebar" @open-dropdown="openDropdown"
      @close-dropdown="closeDropdown" @logout="logout" @toggle-dark-mode="toggleDarkMode"
      @expand-sidebar="expandSidebar" @collapse-sidebar="collapseSidebar" />

    <main class="main-content" :class="{
      expanded,
      dark: isDarkMode,
      login: isLoginRoute,
      'no-sidebar': !showSidebar || !shouldShowSidebar
    }">
      <router-view v-if="isInitialized" />
      <div v-else class="loading-state">
        <!-- Aquí puedes agregar un spinner o mensaje de carga -->
      </div>
    </main>
  </div>
</template>

<script>
import AppSidebar from './components/AppSidebar.vue';
import axios from 'axios';

export default {
  name: 'App',
  components: {
    AppSidebar
  },
  data() {
    return {
      isInitialized: false,
      expanded: false,
      dropdowns: {
        ventas: false,
        compras: false,
      },
      isDarkMode: false,
      userRole: null,
      userPermissions: null
    };
  },

  async created() {
    // Inicializar el estado de dark mode
    this.isDarkMode = localStorage.getItem('isDarkMode') === 'true';

    // Verificar autenticación y permisos
    await this.initializeApp();
  },

  computed: {
    isLoginRoute() {
      return this.$route.path === '/login';
    },
    isAuthenticated() {
      return !!localStorage.getItem('auth');
    },
    shouldShowSidebar() {
      return this.isAuthenticated &&
        !this.isLoginRoute &&
        this.hasSidebarPermission;
    },
    showSidebar() {
      return this.userRole !== '3';
    },
    hasSidebarPermission() {
      const permissions = {
        1: true,
        2: true,
        3: false,
        4: true,
      };
      return permissions[this.userRole] || false;
    }
  },
  methods: {
    async initializeApp() {
      try {
        // Si no está autenticado, marcar como inicializado y retornar
        if (!this.isAuthenticated) {
          this.isInitialized = true;
          return;
        }

        // Obtener el rol del usuario
        this.userRole = localStorage.getItem('role');

        // Aquí podrías agregar una llamada a la API para verificar la sesión si es necesario
        // const response = await axios.get('/api/verify-session');
        // this.userRole = response.data.role;

        this.isInitialized = true;
      } catch (error) {
        console.error('Error initializing app:', error);
        // En caso de error, podríamos redirigir al login
        await this.logout();
      }
    },

    hasPermission(section) {
      const permissions = {
        1: ['Home', 'Usuario', 'Categorias', 'Productos', 'Clientes', 'Proveedores', 'Compra', 'Venta', 'Registro', 'config-avanced', 'reporte'],
        2: ['Home', 'Productos', 'Proveedores', 'Compra', 'Venta', 'reporte'],
        3: ['Home', 'Productos', 'Venta', 'reporte'],
        4: ['Home', 'Usuario', 'sucursales', 'Categorias', 'Productos', 'Clientes', 'Proveedores', 'Compra', 'Venta', 'Registro', 'Sucursal', 'config-avanced', 'reporte'],
      };
      return this.userRole && permissions[this.userRole]?.includes(section);
    },

    async logout() {
      try {
        const token = localStorage.getItem('auth');
        if (token) {
          await axios.post('/api/logout', {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        }
      } catch (error) {
        console.error("Error al cerrar sesión", error);
      } finally {
        localStorage.clear();
        this.isInitialized = false;
        this.userRole = null;
        await this.$router.push('/login');
        this.isInitialized = true;
      }
    },

    toggleSidebar() {
      this.expanded = !this.expanded;
    },
    isActive(route) {
      return this.$route.path === route;
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('isDarkMode', this.isDarkMode);
    },
    handleClickOutside(event) {
      if (
        this.$refs.ventasDropdown &&
        !this.$refs.ventasDropdown.contains(event.target) &&
        !this.$refs.ventasButton.contains(event.target)
      ) {
        this.dropdowns.ventas = false;
      }

      if (
        this.$refs.comprasDropdown &&
        !this.$refs.comprasDropdown.contains(event.target) &&
        !this.$refs.comprasButton.contains(event.target)
      ) {
        this.dropdowns.compras = false;
      }
    },
    openDropdown(dropdown) {
      this.dropdowns[dropdown] = true;
    },
    closeDropdown(dropdown) {
      this.dropdowns[dropdown] = false;
    },
    expandSidebar() {
      this.expanded = true;
    },
    collapseSidebar() {
      this.expanded = false;
    },
  },
  watch: {
    '$route': {
      immediate: true,
      handler(to) {
        // Si el usuario no está autenticado y no está en la ruta de login, redirigir
        if (!this.isAuthenticated && to.path !== '/login') {
          this.$router.push('/login');
        }
      }
    }
  },
};

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.app-wrapper {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
  overflow: auto;
  margin: 0;
  padding: 0;
  position: relative;
  background-color: #f5f5f5;
  transition: background-color 0.3s ease;
}

.app-wrapper.dark {
  background-color: #1e1e1e;
}

#aside-line {
  width: 60%;
  height: 1px;
  background-color: #c09d62;
  margin: 10px auto;
}

a.nav-link {
  display: flex;
  justify-content: center;
}

ul.nav {
  padding: 0 15px;
}

.main-content {
  margin-left: 80px;
  padding: 0;
  width: 100%;
  transition: margin-left 0.3s ease, background-color 0.3s ease;
  background-color: inherit;
  min-height: 100vh;
  position: relative;
}

.main-content.expanded {
  margin-left: 200px;
}

.main-content.dark {
  background-color: #1e1e1e;
  color: #ffffff;
}

:deep(.dark) {
  background-color: #1e1e1e;
  color: #ffffff;
}

:deep(.dark table) {
  background-color: #2d2d2d;
  color: #ffffff;
}

:deep(.dark th),
:deep(.dark td) {
  border-color: #404040;
}

:deep(.dark .btn) {
  background-color: #404040;
  color: #ffffff;
}

:deep(.dark input[type="text"]) {
  background-color: #2d2d2d;
  color: #ffffff;
  border-color: #404040;
}

.main-content.login {
  margin: 0;
  padding: 0;
}

.main-content.no-sidebar {
  margin-left: 0;
  padding: 0;
}

.toggle-btn {
  background-color: #d4d4d4;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
  text-align: center;
  margin: 10px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  transition: background-color 0.3s ease;
}

.toggle-btn:hover {
  background-color: #c0c0c0;
}

.toggle-btn i {
  font-size: 1.5rem;
  color: #c09d62;
  transition: transform 0.3s ease;
}

.toggle-btn:hover i {
  transform: scale(1.1);
}

.tooltip-text {
  margin-left: 10px;
  font-weight: bold;
  font-size: 15px;
}

.nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.10vh;
  position: relative;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.5vh 1.5vh;
  color: #c09d62;
  text-decoration: none;
  transition: background-color 0.3s ease;
  border-radius: 8px;
}

.nav-link i {
  font-size: 4vh;
  color: inherit;
}

.nav-link:hover {
  background-color: #dadada;
}

.nav-link.active {
  background-color: #d4d4d4;
  color: #79552f;
}

.hidden-sidebar {
  display: none;
}

/* Estilos de tabla para modo claro por defecto */
:deep(table) {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  color: #000000;
  transition: background-color 0.3s ease, color 0.3s ease;
}

:deep(th),
:deep(td) {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

:deep(tr:hover) {
  background-color: rgba(0, 0, 0, 0.05);
}

:deep(.dark tr:hover) {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Media Queries */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 0;
  }

  .main-content.expanded {
    margin-left: 0;
  }

  .app-wrapper {
    flex-direction: column;
  }

  .toggle-btn {
    width: 35px;
    height: 35px;
  }

  .toggle-btn i {
    font-size: 1.2rem;
  }

  .nav-link i {
    font-size: 3vh;
  }

  .tooltip-text {
    font-size: 14px;
  }
}

@media (max-width: 576px) {
  .main-content {
    padding: 0;
  }

  .toggle-btn {
    width: 32px;
    height: 32px;
  }

  .toggle-btn i {
    font-size: 1rem;
  }

  .nav-link {
    padding: 0.4vh 1vh;
  }

  .nav-link i {
    font-size: 2.5vh;
  }

  .tooltip-text {
    font-size: 13px;
  }
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Ajustes para mejor rendimiento */
.main-content {
  -webkit-overflow-scrolling: touch;
  will-change: margin-left;
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .main-content,
  .toggle-btn,
  .nav-link,
  .toggle-btn i {
    transition: none;
  }
}

/* Soporte para dispositivos de alta densidad */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .nav-link i,
  .toggle-btn i {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Optimizaciones para pantallas táctiles */
@media (hover: none) {
  .nav-link,
  .toggle-btn {
    -webkit-tap-highlight-color: transparent;
  }

  .nav-link:active,
  .toggle-btn:active {
    background-color: rgba(192, 157, 98, 0.2);
  }
}

/* Ajustes adicionales para modo oscuro en componentes específicos */
:deep(.dark .btn-primary) {
  background-color: #c09d62;
  border-color: #c09d62;
  color: white;
}

:deep(.dark .btn-secondary) {
  background-color: #404040;
  border-color: #404040;
  color: white;
}

:deep(.dark select) {
  background-color: #2d2d2d;
  color: #ffffff;
  border-color: #404040;
}

:deep(.dark .form-control) {
  background-color: #2d2d2d;
  color: #ffffff;
  border-color: #404040;
}

:deep(.dark .card) {
  background-color: #2d2d2d;
  border-color: #404040;
}

:deep(.dark .modal-content) {
  background-color: #2d2d2d;
  border-color: #404040;
}
</style>
