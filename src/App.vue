<template>
  <div class="app-wrapper" :class="{ dark: isDarkMode }">
    <aside ref="sidebar" v-if="!isLoginRoute" class="sidebar" :class="{ expanded, dark: isDarkMode }">
      <ul class="nav flex-column">
      
        <!-- Toggle Sidebar -->
        <li class="nav-item toggle-btn" @click="toggleSidebar">
          <i class="bi" :class="expanded ? 'bi-chevron-double-left' : 'bi-chevron-double-right'"></i>
        </li>

        <!-- Toggle Dark Mode -->
        <li class="nav-item toggle-btn" @click="toggleDarkMode">
          <i class="bi" :class="isDarkMode ? 'bi-brightness-high' : 'bi-moon-stars-fill'"></i>
          <span v-if="expanded" class="tooltip-text">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
        </li>

        <!-- Home -->
        <li v-if="hasPermission('Home')" class="nav-item">
          <router-link to="/home" class="nav-link" :class="{ active: isActive('/home') }">
            <i class="bi bi-house-door-fill"></i>
            <span v-if="expanded" class="tooltip-text">Home</span>
          </router-link>
        </li>

        <!-- Sucursales -->
        <li v-if="hasPermission('Sucursal')" class="nav-item">
          <router-link to="/sucursales" class="nav-link" :class="{ active: isActive('/sucursales') }">
            <i class="bi bi-shop-window"></i>
            <span v-if="expanded" class="tooltip-text">Sucursal</span>
          </router-link>
        </li>

        <!-- Usuario -->
        <li v-if="hasPermission('Usuario')" class="nav-item">
          <router-link to="/empleados" class="nav-link" :class="{ active: isActive('/empleados') }">
            <i class="bi bi-person-fill"></i>
            <span v-if="expanded" class="tooltip-text">Usuario</span>
          </router-link>
        </li>

        <!-- Categorías -->
        <li v-if="hasPermission('Categorias')" class="nav-item">
          <router-link to="/categorias" class="nav-link" :class="{ active: isActive('/categorias') }">
            <i class="bi bi-tags-fill"></i>
            <span v-if="expanded" class="tooltip-text">Categorías</span>
          </router-link>
        </li>

        <!-- Productos -->
        <li v-if="hasPermission('Productos')" class="nav-item">
          <router-link to="/productos" class="nav-link" :class="{ active: isActive('/productos') }">
            <i class="bi bi-box-seam"></i>
            <span v-if="expanded" class="tooltip-text">Productos</span>
          </router-link>
        </li>

        <!-- Clientes -->
        <li v-if="hasPermission('Clientes')" class="nav-item">
          <router-link to="/clientes" class="nav-link" :class="{ active: isActive('/clientes') }">
            <i class="bi bi-people-fill"></i>
            <span v-if="expanded" class="tooltip-text">Clientes</span>
          </router-link>
        </li>

        <!-- Proveedores -->
        <li v-if="hasPermission('Proveedores')" class="nav-item">
          <router-link to="/proveedores" class="nav-link" :class="{ active: isActive('/proveedores') }">
            <i class="bi bi-truck"></i>
            <span v-if="expanded" class="tooltip-text">Proveedores</span>
          </router-link>
        </li>

        <!-- Ventas con menú desplegable -->
        <li v-if="hasPermission('Venta')" class="nav-item dropdown" @click="toggleDropdown('ventas')">
          <a href="#" class="nav-link">
            <i class="bi bi-cash-stack"></i>
            <span v-if="expanded" class="tooltip-text">Ventas</span>
            <i class="bi bi-chevron-right"></i>
          </a>
          <ul v-show="dropdowns.ventas" class="dropdown-menu">
            <li>
              <router-link to="/administrar-ventas" class="nav-link">Administrar ventas</router-link>
            </li>
            <li>
              <router-link to="/ventas" class="nav-link">Crear venta</router-link>
            </li>
            <li>
              <router-link to="/reporte-ventas" class="nav-link">Reporte de ventas</router-link>
            </li>
          </ul>
        </li>

        <!-- Compras con menú desplegable -->
        <li v-if="hasPermission('Compra')" class="nav-item dropdown" @click="toggleDropdown('compras')">
          <a href="#" class="nav-link">
            <i class="bi bi-cart-plus-fill"></i>
            <span v-if="expanded" class="tooltip-text">Compras</span>
            <i class="bi bi-chevron-right"></i>
          </a>
          <ul v-show="dropdowns.compras" class="dropdown-menu">
            <li>
              <router-link to="/administrar-compras" class="nav-link">Administrar compras</router-link>
            </li>
            <li>
              <router-link to="/compras" class="nav-link">Crear compra</router-link>
            </li>
            <li>
              <router-link to="/reporte-compras" class="nav-link">Reporte de compras</router-link>
            </li>
          </ul>
        </li>
      </ul>

      <div id="aside-line"></div>

      <ul class="nav flex-column">
        <!-- Configuración -->
        <li class="nav-item">
          <router-link to="/config-page" class="nav-link" :class="{ active: isActive('/config-page') }">
            <i class="bi bi-gear-fill"></i>
            <span v-if="expanded" class="tooltip-text">Configuración</span>
          </router-link>
        </li>

        <!-- Cerrar sesión -->
        <li class="nav-item">
          <a @click="logout" class="nav-link" style="cursor: pointer;">
            <i class="bi bi-box-arrow-right"></i>
            <span v-if="expanded" class="tooltip-text">Cerrar sesión</span>
          </a>
        </li>
      </ul>
    </aside>

    <main class="main-content" :class="{ expanded, dark: isDarkMode }">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
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
  methods: {
    hasPermission(section) {
      const role = localStorage.getItem('role');
      const permissions = {
        Administrador: ['Home', 'Usuario', 'Categorias', 'Productos', 'Clientes', 'Proveedores', 'Compra', 'Venta', 'Registro', 'Sucursal'],
        Gerente: ['Home', 'Productos', 'Proveedores', 'Compra', 'Venta'],
        Cajero: ['Home', 'Productos', 'Venta'],
      };
      return role && permissions[role]?.includes(section);
    },
    toggleDropdown(dropdown) {
      this.dropdowns[dropdown] = !this.dropdowns[dropdown];
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
    logout() {
      localStorage.clear();
      this.$router.push('/login');
    },
  },
  computed: {
    isLoginRoute() {
      return this.$route.path.startsWith('/login');
    },
  },
  watch: {
    '$route.path'() {
      // Colapsar el sidebar cuando se cambia de ruta
      this.expanded = false;
    },
  },
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
  
  .sidebar {
    width: 80px;
    background-color: #ebebeb;
    position: fixed;
    height: 100%;
    transition: width 0.3s ease;
    padding-top: 20px;
  }

.sidebar.dark {
  background-color: #333;
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
  
  .sidebar.expanded {
    width: 240px;
  }
  
  .main-content.expanded {
    margin-left: 255px;
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

.tooltip-text {
  margin-left: 10px;
}

.nav {
    list-style: none;
    padding: 0;
  }
  
  .nav-item {
    margin-bottom: 10px;
    position: relative;
    justify-content: center;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 5px 15px;
    color: #c09d62;
    text-decoration: none;
    transition: background-color 0.3s ease;
    border-radius: 8px;
  }
  
  .nav-link i {
    font-size: 20px;
  }
  
  .nav-link:hover {
    background-color: #dadada;
  }
  
  .nav-link.active {
    background-color: #d4d4d4;
    color: #79552f;
  }
  
  .tooltip-text {
    margin-left: 10px;
    font-weight: bold;
    font-size: 15px;
  }
  
  .dropdown-menu {
    padding-left: 10px;
  }
  
  .dropdown-menu a {
    font-size: 14px;
  }
  
  .dropdown-menu a:hover {
    background-color: #f0f0f0;
  }
</style>
