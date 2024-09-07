<template>

  <div class="app-wrapper">
    <!-- Condicional para mostrar el sidebar solo si la ruta actual no es /login -->
    <aside v-if="!isLoginRoute" class="sidebar">
      <ul class="nav flex-column">
        <!-- Home -->
        <li v-if="hasPermission('Home')" class="nav-item">
          <router-link to="/home" class="nav-link">
            <i class="bi bi-house-door-fill"></i>
            <span class="tooltip-text">Home</span>
          </router-link>
        </li>

        <!-- Usuario -->
        <li v-if="hasPermission('Usuario')" class="nav-item">
          <router-link to="/empleados" class="nav-link">
            <i class="bi bi-person-fill"></i>
            <span class="tooltip-text">Usuario</span>
          </router-link>
        </li>

        <!-- Categorías -->
        <li v-if="hasPermission('Categorias')" class="nav-item">
          <router-link to="/categorias" class="nav-link">
            <i class="bi bi-tags-fill"></i>
            <span class="tooltip-text">Categorías</span>
          </router-link>
        </li>

        <!-- Productos -->
        <li v-if="hasPermission('Productos')" class="nav-item">
          <router-link to="/productos" class="nav-link">
            <i class="bi bi-box-seam"></i>
            <span class="tooltip-text">Productos</span>
          </router-link>
        </li>

        <!-- Clientes -->
        <li v-if="hasPermission('Clientes')" class="nav-item">
          <router-link to="/clientes" class="nav-link">
            <i class="bi bi-people-fill"></i>
            <span class="tooltip-text">Clientes</span>
          </router-link>
        </li>

        <!-- Proveedores -->
        <li v-if="hasPermission('Proveedores')" class="nav-item">
          <router-link to="/proveedores" class="nav-link">
            <i class="bi bi-truck"></i>
            <span class="tooltip-text">Proveedores</span>
          </router-link>
        </li>

        <!-- Compra -->
        <li v-if="hasPermission('Compra')" class="nav-item">
          <router-link to="#" class="nav-link">
            <i class="bi bi-cart-plus-fill"></i>
            <span class="tooltip-text">Compra</span>
          </router-link>
        </li>

        <!-- Venta -->
        <li v-if="hasPermission('Venta')" class="nav-item">
          <router-link to="#" class="nav-link">
            <i class="bi bi-cash-stack"></i>
            <span class="tooltip-text">Venta</span>
          </router-link>
        </li>

        <!-- TEST REGISTRO | BORRAR AL FINALIZAR EL TEST -->
        <li v-if="hasPermission('Registro')" class="nav-item">
          <router-link to="/registro" class="nav-link">
            <i class="bi bi-pencil-square"></i>
            <span class="tooltip-text">Registro</span>
          </router-link>
        </li>
      </ul>
    </aside>

    <main class="main-content">
      <!-- Aquí se carga el contenido dinámico según la ruta -->
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    isLoginRoute() {
      return this.$route.path === '/login';
    },
    userRole() {
      return localStorage.getItem('role');
    }
  },
  methods: {
    hasPermission(section) {
      const permissions = {
        Administrador: ['Home', 'Usuario', 'Categorias', 'Productos', 'Clientes', 'Proveedores', 'Compra', 'Venta', 'Registro'],
        Gerente: ['Home', 'Productos', 'Proveedores', 'Compra', 'Venta'],
        Cajero: ['Home', 'Productos', 'Venta']
      };

      // Validar si el rol del usuario está en el objeto de permisos y si la sección es accesible para ese rol
      return this.userRole && permissions[this.userRole]?.includes(section);
    }
  }
};
</script>

<style scoped>
#home {
  margin-top: 70%;
}

/* Estilos del sidebar y el layout */
.app-wrapper {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 85px;
  background-color: #ebebeb;
  color: white;
  padding-top: 20px;
  position: fixed;
  height: 100%;
  border-radius: 15px;
}

.sidebar .nav {
  list-style: none;
  padding-left: 0;
}

.sidebar .nav-item {
  margin-bottom: 10px;
  margin-top: 20px;
}

.sidebar .nav-link {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  color: rgb(245, 196, 91);
  font-size: 24px;
  width: 25px;
  margin-left: 20px;
  text-align: center;
  position: relative;
  text-decoration: none;
  transition: all 0.3s ease;
}

.sidebar .nav-link:hover {
  background-color: #cecece;
  color: #a38655;
  transform: scale(1.2);
  width: 25px;
  margin-left: 20px;
  border-radius: 25%;
}

.sidebar .nav-link i {
  display: block;
}

.tooltip-text {
  display: none;
  position: absolute;
  left: 50px;
  top: 50%;
  font-size: 14px;
  transform: translateY(-50%);
  white-space: nowrap;
  background-color: #585757;
  font-family: 'Montserrat', sans-serif;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  z-index: 1000;
}

.sidebar .nav-link:hover .tooltip-text {
  display: block;
}

.main-content {
  margin-left: 80px;
  flex-grow: 1;
  padding: 20px;
  background-color: #f4f4f4;
}
</style>
