<template>
  <div class="app-wrapper" :class="{ dark: isDarkMode }">
    <AppSidebar v-if="!isLoginRoute && isAuthenticated && hasSidebarPermission"
      :class="{ 'hidden-sidebar': !showSidebar }" :isDarkMode="isDarkMode" :expanded="expanded" :dropdowns="dropdowns"
      :has-permission="hasPermission" :is-active="isActive" @toggle-sidebar="toggleSidebar"
      @open-dropdown="openDropdown" @close-dropdown="closeDropdown" @logout="logout" @toggle-dark-mode="toggleDarkMode"
      @expand-sidebar="expandSidebar" @collapse-sidebar="collapseSidebar" />

    <main class="main-content" :class="{ expanded, dark: isDarkMode, login: isLoginRoute, 'no-sidebar': !showSidebar }">
      <router-view />
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
      expanded: false,
      dropdowns: {
        ventas: false,
        compras: false,
      },
      isDarkMode: localStorage.getItem('isDarkMode') === 'true',
    };
  },
  computed: {
    isLoginRoute() {
      return this.$route.path === '/login';
    },
    isAuthenticated() {
      return !!localStorage.getItem('auth');
    },
    showSidebar() {
      const role = localStorage.getItem('role');
      return role !== '3';
    },
    hasSidebarPermission() {
      // Aquí puedes definir la lógica para verificar si el usuario tiene permiso para ver el sidebar
      const role = localStorage.getItem('role');
      const permissions = {
        1: true, // Ejemplo: rol 1 tiene permiso
        2: true, // Ejemplo: rol 2 tiene permiso
        3: false, // Ejemplo: rol 3 no tiene permiso
        4: true, // Ejemplo: rol 4 tiene permiso
      };
      return permissions[role] || false; // Devuelve true si tiene permiso, de lo contrario false
    }
  },
  methods: {
    hasPermission(section) {
      const role = localStorage.getItem('role');
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
        await axios.post('/api/logout', {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth')}`
          }
        });

        localStorage.clear();
        this.$router.push('/login');
      } catch (error) {
        console.error("Error al cerrar sesión", error);
        localStorage.clear();
        this.$router.push('/login');
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
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
}

.app-wrapper {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
  overflow: hidden;

  &.dark {
    background-color: #333;
  }
}

.app-wrapper {
  padding-right: 0;
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

.main-content.expanded {
  margin-left: 255px;
  z-index: 1;
}

.main-content {
  margin-left: 80px;
  padding: 20px;
  width: 100%;
  transition: margin-left 0.3s ease, background-color 0.3s ease;
  background-color: #f5f5f5;
}

.main-content.dark {
  background-color: #1e1e1e;
  color: #ffffff;
}

/* Elimina la sombra en la ruta de login */
.main-content.login {
  margin: 0;
  /* Establece el margen en 0 */
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
}

.toggle-btn i {
  font-size: 1.5rem;
  color: #c09d62;
}

.tooltip-text {
  margin-left: 10px;
  font-weight: bold;
  font-size: 15px;
}

.nav {
  list-style: none;
  padding: 0;
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

.main-content.no-sidebar {
  margin-left: 0;
}
</style>
