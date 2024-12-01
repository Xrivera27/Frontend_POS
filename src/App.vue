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
      :isLoginRoute="isLoginRoute"
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
import solicitudes from '../services/solicitudes';

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
      userPermissions: null,
      authChecked: false
    };
  },

  async created() {
    try {
      console.log('Iniciando created...');
      const savedRole = localStorage.getItem('role');
      const token = localStorage.getItem('auth');
      console.log('Token encontrado:', !!token);
      console.log('Role encontrado:', savedRole);
      
      if (token && savedRole) {
        this.userRole = savedRole;
        this.isInitialized = true;
        console.log('Estado inicial establecido con rol:', savedRole);
        
        if (!this.isLoginRoute) {
          await this.checkAuthAndInitialize();
        }
      } else {
        this.isInitialized = true;
        if (!this.isLoginRoute) {
          await this.$router.push('/login');
        }
      }
      
      window.addEventListener('storage', this.handleStorageChange);
      window.addEventListener('roleChange', this.handleRoleChange);
    } catch (error) {
      console.error('Error en created:', error);
      this.isInitialized = true;
    }
  },

  computed: {
    isLoginRoute() {
      return this.$route.path === '/login';
    },
    
    isAuthenticated() {
      const token = localStorage.getItem('auth');
      const role = localStorage.getItem('role') || this.userRole;
      console.log('Verificando autenticación:', { token, role });
      return !!(token && role);
    },
    
    shouldShowSidebar() {
      const role = this.userRole || localStorage.getItem('role');
      const token = localStorage.getItem('auth');
      const isAuth = !!(token && role);
      
      console.log('Evaluando sidebar:', {
        isAuth,
        role,
        isLoginRoute: this.isLoginRoute
      });
      
      return isAuth && 
             !this.isLoginRoute && 
             role && 
             role !== '3';
    },
    
    showSidebar() {
      const role = this.userRole || localStorage.getItem('role');
      const token = localStorage.getItem('auth');
      return token && role && role !== '3';
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
    async checkAuthAndInitialize() {
  try {
    console.log('Iniciando checkAuthAndInitialize...');
    const token = localStorage.getItem('auth');
    const role = localStorage.getItem('role');
    console.log('Verificando token y rol:', { tieneToken: !!token, role });
    
    if (!token || !role) {
      console.log('No hay token o rol, redirigiendo a login...');
      this.isInitialized = true;
      if (!this.isLoginRoute) {
        await this.$router.push('/login');
      }
      return;
    }

    try {
      console.log('Intentando verificar token en:', `${solicitudes.homeUrl}/token/verify-token`);
      const response = await axios.get(`${solicitudes.homeUrl}/token/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        console.log('Token válido, inicializando app con rol:', role);
        this.userRole = role;
        this.isInitialized = true;
        await this.initializeApp();
        
        // Redirigir a ventas si es cajero (role 3)
        if (role === '3' && this.$route.path === '/home') {
          console.log('Usuario es cajero, redirigiendo a ventas...');
          await this.$router.push('/ventas');
        }
      }
    } catch (error) {
      console.error('Error en verificación:', error);
      await this.logout();
    }
  } catch (error) {
    console.error('Error en checkAuthAndInitialize:', error);
    this.isInitialized = true;
    if (!this.isLoginRoute) {
      await this.$router.push('/login');
    }
  }
},

    async initializeApp() {
      try {
        console.log('Iniciando initializeApp...');
        if (!this.isAuthenticated) {
          console.log('No autenticado, limpiando userRole');
          this.userRole = null;
          return;
        }

        const role = localStorage.getItem('role');
        console.log('Inicializando app con rol:', role);
        if (role) {
          this.userRole = role;
          
          this.$nextTick(() => {
            console.log('Reseteando estados de UI');
            this.expanded = false;
            this.dropdowns = {
              ventas: false,
              compras: false,
            };
          });
        }
      } catch (error) {
        console.error('Error en initializeApp:', error);
        await this.logout();
      }
    },

    handleRoleChange() {
      const newRole = localStorage.getItem('role');
      console.log('Cambio de rol detectado:', { rolAnterior: this.userRole, nuevoRol: newRole });
      if (newRole !== this.userRole) {
        this.userRole = newRole;
        console.log('Rol actualizado a:', newRole);
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      }
    },

    handleStorageChange(event) {
      if (event.key === 'auth' || event.key === 'role') {
        console.log('Cambio detectado en storage:', event.key);
        this.checkAuthAndInitialize();
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
        console.log('Iniciando proceso de logout...');
        const token = localStorage.getItem('auth');
        if (token) {
          console.log('Intentando logout en el servidor...');
          await axios.post(`${solicitudes.homeUrl}/token/logout`, {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log('Logout en servidor exitoso');
        }
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      } finally {
        console.log('Limpiando estado local...');
        localStorage.clear();
        this.userRole = null;
        this.expanded = false;
        this.isInitialized = false;
        await this.$router.push('/login');
        this.$nextTick(() => {
          this.isInitialized = true;
          console.log('Estado local limpio, redirección completada');
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
  async handler(to) {
    console.log('Cambio de ruta detectado:', to.path);
    if (to.path !== '/login') {
      const token = localStorage.getItem('auth');
      const role = localStorage.getItem('role');
      
      if (!token || !role) {
        console.log('No hay token o rol, redirigiendo a login');
        await this.$router.push('/login');
      } else if (!this.isInitialized) {
        console.log('App no inicializada, inicializando...');
        await this.checkAuthAndInitialize();
      } else {
        // Asegurarnos de que userRole está sincronizado
        if (role && this.userRole !== role) {
          this.userRole = role;
        }
        
        // Redirigir a ventas si es cajero y está intentando acceder a home
        if (role === '3' && to.path === '/home') {
          console.log('Usuario es cajero, redirigiendo a ventas...');
          await this.$router.push('/ventas');
        }
      }
    }
  }
},
    
    isAuthenticated: {
      immediate: true,
      handler(newValue) {
        console.log('Estado de autenticación cambiado:', newValue);
        if (!newValue && !this.isLoginRoute) {
          console.log('Usuario no autenticado, redirigiendo a login');
          this.$router.push('/login');
        }
      }
    },

    userRole: {
      immediate: true,
      handler(newRole) {
        if (newRole) {
          console.log('Rol de usuario actualizado:', newRole);
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