<template>
  <div class="app-wrapper" :class="{ dark: isDarkMode }">
    <AppSidebar v-if="!isLoginRoute" :isDarkMode="isDarkMode" :expanded="expanded" :dropdowns="dropdowns"
      :has-permission="hasPermission" :is-active="isActive" @toggle-sidebar="toggleSidebar"
      @open-dropdown="openDropdown" @close-dropdown="closeDropdown" @logout="logout" @toggle-dark-mode="toggleDarkMode"
      @expand-sidebar="expandSidebar" @collapse-sidebar="collapseSidebar" />
    <main class="main-content" :class="{ expanded, dark: isDarkMode }">
      <router-view />
    </main>
  </div>
</template>

<script>
import AppSidebar from './components/AppSidebar.vue';
import axios from 'axios';

export default {
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
    }
  },
  methods: {
    hasPermission(section) {
      const role = localStorage.getItem('role');
      const permissions = {
        1: ['Home', 'Usuario', 'Categorias', 'Productos', 'Clientes', 'Proveedores', 'Compra', 'Venta', 'Registro', 'Sucursal', 'config-avanced'],
        2: ['Home', 'Productos', 'Proveedores', 'Compra', 'Venta'],
        3: ['Home', 'Productos', 'Venta'],
      };
      return role && permissions[role]?.includes(section);
    },

    isAuthenticated() {
      const token = localStorage.getItem('token');
      return !!token; // Verifica si hay un token
    },

    async logout() {
      try {
        await axios.post('/api/logout', {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
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
      // Verificar si el clic fue fuera de los dropdowns
      if (
        this.$refs.ventasDropdown &&
        !this.$refs.ventasDropdown.contains(event.target) &&
        !this.$refs.sidebar.contains(event.target)
      ) {
        this.dropdowns.ventas = false;
      }
      if (
        this.$refs.comprasDropdown &&
        !this.$refs.comprasDropdown.contains(event.target) &&
        !this.$refs.sidebar.contains(event.target)
      ) {
        this.dropdowns.compras = false;
      }
    },

    openDropdown(menu) {
      this.dropdowns[menu] = true;
    },
    closeDropdown(menu) {
      this.dropdowns[menu] = false;
    },

    async login(nombre_usuario, contraseña) {
      try {
        const response = await axios.post('/api/login', { nombre_usuario, contraseña });

        const { token, role } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('role', role); // Guarda el rol del usuario
        this.$router.push('/home');
      } catch (error) {
        console.error('Error en el inicio de sesión', error);
      }
    },

    // Nuevos métodos para manejar el hover del sidebar
    expandSidebar() {
      this.expanded = true;
    },
    collapseSidebar() {
      this.expanded = false;
    },
  },
  mounted() {
    // Verifica si el usuario está autenticado y tiene rol
    if (!this.isAuthenticated()) {
      this.$router.push('/login');
    } else {
      const role = localStorage.getItem('role');
      if (!role) {
        this.$router.push('/login');
      }
    }

    // Listener para clics fuera del menú desplegable
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
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
  min-height: 100vh;
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
  /* Tamaño uniforme para los íconos */
  color: #c09d62;
  /* Color del ícono */
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
  /* Color del texto y de los íconos */
  text-decoration: none;
  transition: background-color 0.3s ease;
  border-radius: 8px;
}

.nav-link i {
  font-size: 4vh;
  /* Tamaño uniforme para los íconos */
  color: inherit;
  /* Hereda el color del texto */
}

.nav-link:hover {
  background-color: #dadada;
}

.nav-link.active {
  background-color: #d4d4d4;
  color: #79552f;
  /* Color del texto y los íconos en estado activo */
}
</style>
