<template>
  <div class="app-wrapper">
    <aside ref="sidebar" v-if="!isLoginRoute" class="sidebar" :class="{ expanded }">
      <div class="toggle-btn" @click="toggleSidebar">
        <i class="bi" :class="expanded ? 'bi-chevron-left' : 'bi-chevron-right'"></i>
      </div>
      <ul class="nav flex-column">
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
              <router-link to="/administrar-ventas" class="nav-link">Reporte de ventas</router-link>
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
              <router-link to="/administrar-compras" class="nav-link">Reporte de compras</router-link>
            </li>
          </ul>
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

    <main class="main-content">
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
        compras: false
      }
    };
  },
  methods: {
    hasPermission(section) {
      const role = localStorage.getItem('role');
      const permissions = {
        Administrador: ['Home', 'Usuario', 'Categorias', 'Productos', 'Clientes', 'Proveedores', 'Compra', 'Venta', 'Registro', 'Sucursal'],
        Gerente: ['Home', 'Productos', 'Proveedores', 'Compra', 'Venta'],
        Cajero: ['Home', 'Productos', 'Venta']
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
    logout() {
      localStorage.clear();
      this.$router.push('/login');
    }
  },
  computed: {
    isLoginRoute() {
      return this.$route.path.startsWith('/login');
    }
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
}

.sidebar.expanded {
  width: 240px;
}

.toggle-btn {
  position: absolute;
  top: 20px;
  left: 100%;
  background-color: #d4d4d4;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
}

.nav {
  list-style: none;
  padding: 0;
}

.nav-item {
  margin-bottom: 10px;
  text-align: center;
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  color: #ffb300;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.nav-link i {
  font-size: 24px;
}

.nav-link:hover {
  background-color: #cecece;
}

.tooltip-text {
  margin-left: 10px;
}

.dropdown-menu {
  display: block;
  background-color: #ebebeb;
  padding: 0;
  position: absolute;
  left: 100%;
  top: 0;
  width: 220px;

  max-height: 0;
  /* Esconde el menú cuando no está desplegado */
  overflow: hidden;
  /* Asegura que el contenido no se desborde */
  opacity: 0;
  /* Invisibilidad inicial */
  transform: translateY(-10px);
  /* Mueve ligeramente hacia arriba al estar oculto */
  transition: max-height 0.4s ease, opacity 0.4s ease, transform 0.4s ease;
  /* Aplica la transición */
  pointer-events: none;
  /* Desactiva eventos cuando está oculto */
}

.nav-item:hover .dropdown-menu,
.dropdown-menu.open {
  max-height: 300px;
  /* Altura máxima cuando está desplegado (ajusta según el contenido) */
  opacity: 1;
  /* Totalmente visible */
  transform: translateY(0);
  /* Retorna a su posición original */
  pointer-events: auto;
  /* Reactiva eventos */
}

.main-content {
  margin-left: 80px;
  width: calc(100% - 80px);
  padding: 20px;
}
</style>
