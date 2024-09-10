<template>
  <div class="app-wrapper">
    <aside v-if="!isLoginRoute" class="sidebar">
      <ul class="nav flex-column">
        <!-- Home -->
        <li v-if="hasPermission('Home')" class="nav-item">
          <router-link
            to="/home"
            class="nav-link"
            :class="{ active: isActive('/home') }"
          >
            <i class="bi bi-house-door-fill"></i>
            <span class="tooltip-text">Home</span>
          </router-link>
        </li>

       
        <!-- Sucursales -->
        <li v-if="hasPermission('Sucursal')" class="nav-item">
          <router-link
            to="/sucursales"
            class="nav-link"
            :class="{ active: isActive('/sucursales') }"
          >
            <i class="bi bi-shop-window"></i>
            <span class="tooltip-text">Sucursal</span>
          </router-link>
        </li>

        <!-- Usuario -->
        <li v-if="hasPermission('Usuario')" class="nav-item">
          <router-link
            to="/empleados"
            class="nav-link"
            :class="{ active: isActive('/empleados') }"
          >
            <i class="bi bi-person-fill"></i>
            <span class="tooltip-text">Usuario</span>
          </router-link>
        </li>

        <!-- Categorías -->
        <li v-if="hasPermission('Categorias')" class="nav-item">
          <router-link
            to="/categorias"
            class="nav-link"
            :class="{ active: isActive('/categorias') }"
          >
            <i class="bi bi-tags-fill"></i>
            <span class="tooltip-text">Categorías</span>
          </router-link>
        </li>

        <!-- Productos -->
        <li v-if="hasPermission('Productos')" class="nav-item">
          <router-link
            to="/productos"
            class="nav-link"
            :class="{ active: isActive('/productos') }"
          >
            <i class="bi bi-box-seam"></i>
            <span class="tooltip-text">Productos</span>
          </router-link>
        </li>

        <!-- Clientes -->
        <li v-if="hasPermission('Clientes')" class="nav-item">
          <router-link
            to="/clientes"
            class="nav-link"
            :class="{ active: isActive('/clientes') }"
          >
            <i class="bi bi-people-fill"></i>
            <span class="tooltip-text">Clientes</span>
          </router-link>
        </li>

        <!-- Proveedores -->
        <li v-if="hasPermission('Proveedores')" class="nav-item">
          <router-link
            to="/proveedores"
            class="nav-link"
            :class="{ active: isActive('/proveedores') }"
          >
            <i class="bi bi-truck"></i>
            <span class="tooltip-text">Proveedores</span>
          </router-link>
        </li>

         <!-- Ventas con menú desplegable -->
         <li v-if="hasPermission('Venta')" class="nav-item dropdown" @click="toggleDropdown('ventas')">
          <a href="#" class="nav-link">
            <i class="bi bi-cash-stack"></i>
            <span class="tooltip-text">Ventas</span>
            <i class="bi bi-chevron-right"></i>
          </a>
          <ul v-show="dropdowns.ventas" class="dropdown-menu">
            <li>
              <router-link to="/administrar-ventas" class="nav-link">Administrar ventas</router-link>
            </li>
            <li>
              <router-link to="/venta" class="nav-link">Crear venta</router-link>
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
            <span class="tooltip-text">Compras</span>
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
        <!-- TEST REGISTRO | BORRAR AL FINALIZAR EL TEST -->
        <li v-if="hasPermission('Registro')" class="nav-item">
          <router-link
            to="/registro"
            class="nav-link"
            :class="{ active: isActive('/registro') }"
          >
            <i class="bi bi-pencil-square"></i>
            <span class="tooltip-text">Registro</span>
          </router-link>
        </li>

        <!-- Cerrar sesión -->
        <li class="nav-item">
          <a @click="logout" class="nav-link" style="cursor: pointer;">
            <i class="bi bi-box-arrow-right"></i>
            <span class="tooltip-text">Cerrar sesión</span>
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
  name: 'App',
  data() {
    return {
      dropdowns: {
        ventasDropdown: false,
        comprasDropdown: false
      }
    };
  },
  computed: {
    isLoginRoute() {
      return this.$route.path === '/login';
    },
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

    isActive(route) {
      return this.$route.path === route;
    },

    logout() {
      localStorage.clear();
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
/* Estilos del layout */
.app-wrapper {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 80px; /* Ancho del sidebar */
  background-color: #ebebeb;
  color: white;
  padding-top: 20px;
  position: fixed;
  height: 100%;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.sidebar .nav {
  list-style: none;
  padding-left: 0;
  margin: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.sidebar .nav-item {
  margin-bottom: 5px; 
  transform: scale(1.05);
  transition: all 0.3s ease;
}

.sidebar .nav-link {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0; /* Elimina el padding interno */
  color: rgb(255, 179, 0);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  text-align: center;
  position: relative;
  text-decoration: none;
  transition: all 0.3s ease;
  width: 50px; /* Ancho fijo del botón */
  height: 50px; /* Alto fijo del botón */
  border-radius: 12px; /* Bordes redondeados */
  margin: 5px 0; /* Espacio reducido entre los botones */
}

.sidebar .nav-link.active {
  background-color: #d4d4d4; /* Color de fondo del botón activo */
  color: #a38655; /* Color del icono en el botón activo */
}

.sidebar .nav-link:hover {
  background-color: #cecece;
  color: #a38655;
  transform: scale(1.1);
}

.sidebar .nav-link i {
  display: block;
  font-size: 24px; /* Tamaño del icono */
}

.tooltip-text {
  display: none;
  position: absolute;
  left: 60px; /* Ajusta la posición del texto emergente */
  top: 50%;
  font-size: 14px;
  transform: translateY(-50%);
  white-space: nowrap;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  pointer-events: none;
}

.nav-link:hover .tooltip-text {
  display: block;
}

.main-content {
  margin-left: 80px;
  width: calc(100% - 80px);
  background-color: #f5f5f5;
  padding: 20px;
  box-sizing: border-box;
  min-height: 100vh;
}

/* Estilos adicionales para los dropdowns */
.nav-item.dropdown {
  position: relative;
}

.dropdown-menu {
  display: block;
  background-color: #ebebeb;
  margin-top: 0; /* Ajusta para eliminar espacio superior */
  padding: 0;
  position: absolute;
  top: 0; /* Mantiene el menú alineado verticalmente con el botón */
  left: 100%; /* Desplaza el menú hacia la derecha del botón */
  min-width: 150px; /* Ancho mínimo del menú desplegable */
  z-index: 1; /* Asegura que esté sobre otros elementos */
}

.dropdown-menu li {
  list-style: none;
  padding: 5px 0;
}

.dropdown-menu .nav-link {
  color: rgb(255, 179, 0);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  padding-left: 10px; /* Ajusta para que no se solapen los textos */
}

.dropdown-menu .nav-link:hover {
  background-color: #cecece;
}
</style>