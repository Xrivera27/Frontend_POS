<template>
  <div class="app-wrapper" :class="{ dark: isDarkMode }">
    <AppSidebar 
      v-if="isInitialized && shouldShowSidebar" 
      :class="{ 'hidden-sidebar': !showSidebar }"
      :isDarkMode="isDarkMode" 
      :expanded="expanded" 
      :dropdowns="dropdowns" 
      :has-permission="hasPermission"
      :is-active="isActive" 
      @toggle-sidebar="toggleSidebar" 
      @open-dropdown="openDropdown"
      @close-dropdown="closeDropdown" 
      @logout="logout" 
      @toggle-dark-mode="toggleDarkMode"
      @expand-sidebar="expandSidebar" 
      @collapse-sidebar="collapseSidebar" 
    />

    <main class="main-content" :class="{
      expanded,
      dark: isDarkMode,
      login: isLoginRoute,
      'no-sidebar': !showSidebar || !shouldShowSidebar
    }">
      <router-view v-if="isInitialized" />
      <div v-else class="loading-state">
        <div class="loader"></div>
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
    this.isDarkMode = localStorage.getItem('isDarkMode') === 'true';
    await this.initializeApp();
    window.addEventListener('storage', this.handleStorageChange);
    window.addEventListener('roleChange', this.handleRoleChange);
  },

  computed: {
    isLoginRoute() {
      return this.$route.path === '/login';
    },
    isAuthenticated() {
      return !!localStorage.getItem('auth');
    },
    shouldShowSidebar() {
      const role = this.userRole || localStorage.getItem('role');
      return this.isAuthenticated && 
             !this.isLoginRoute && 
             role && 
             role !== '3';
    },
    showSidebar() {
      const role = this.userRole || localStorage.getItem('role');
      return role && role !== '3';
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
        if (!this.isAuthenticated) {
          this.userRole = null;
          this.isInitialized = true;
          return;
        }

        const role = localStorage.getItem('role');
        this.userRole = role;
        
        this.$nextTick(() => {
          this.expanded = false;
          this.dropdowns = {
            ventas: false,
            compras: false,
          };
        });

        this.isInitialized = true;
      } catch (error) {
        console.error('Error initializing app:', error);
        await this.logout();
      }
    },

    handleRoleChange() {
      const newRole = localStorage.getItem('role');
      this.userRole = newRole;
      this.$forceUpdate();
    },

    handleAuthChange() {
      this.initializeApp();
    },

    handleStorageChange(event) {
      if (event.key === 'auth' || event.key === 'role') {
        this.initializeApp();
      }
    },

    hasPermission(section) {
      const role = this.userRole || localStorage.getItem('role');
      const permissions = {
        1: ['Home', 'Usuario', 'Categorias', 'Productos', 'Clientes', 'Proveedores', 'Compra', 'Venta', 'Registro', 'config-avanced', 'reporte'],
        2: ['Home', 'Productos', 'Proveedores', 'Compra', 'Venta', 'reporte'],
        3: ['Home', 'Productos', 'Venta', 'reporte'],
        4: ['Home', 'Usuario', 'sucursales', 'Categorias', 'Productos', 'Clientes', 'Proveedores', 'Compra', 'Venta', 'Registro', 'Sucursal', 'config-avanced', 'reporte'],
      };
      return role && permissions[role]?.includes(section);
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
        this.userRole = null;
        this.expanded = false;
        this.isInitialized = false;
        await this.$router.push('/login');
        this.$nextTick(() => {
          this.isInitialized = true;
        });
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
    }
  },

  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('roleChange', this.handleRoleChange);
  },

  watch: {
    '$route': {
      immediate: true,
      handler(to) {
        if (!this.isAuthenticated && to.path !== '/login') {
          this.$router.push('/login');
        }
      }
    },
    userRole: {
      immediate: true,
      handler(newRole) {
        if (newRole) {
          this.$forceUpdate();
        }
      }
    }
  }
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

.loader {
  border: 4px solid #f3f3f3;
  border-radius: 50%;
  border-top: 4px solid #c09d62;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

.main-content {
  margin-left: 80px;
  padding: 20px;
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

.main-content.login {
  margin-left: 0;
  padding: 0;
}

.main-content.no-sidebar {
  margin-left: 0;
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

:deep(.dark input),
:deep(.dark select),
:deep(.dark textarea) {
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

/* Media Queries */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
  }

  .main-content.expanded {
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 10px;
  }
}

/* Optimizaciones para pantallas táctiles */
@media (hover: none) {
  * {
    -webkit-tap-highlight-color: transparent;
  }
}

/* Soporte para dispositivos de alta densidad */
@media (-webkit-min-device-pixel-ratio: 2),
(min-resolution: 192dpi) {
  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Ajustes para mejor rendimiento */
.main-content {
  -webkit-overflow-scrolling: touch;
  will-change: margin-left;
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .main-content,
  .loader {
    transition: none;
  }
}
</style>