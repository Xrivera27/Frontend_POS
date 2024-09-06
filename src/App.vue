<template>
  <div class="app-wrapper">
    <!-- Condicional para mostrar el sidebar solo si la ruta actual no es /login -->
    <aside v-if="!isLoginRoute" class="sidebar">
      <ul class="nav flex-column">
        <!-- Home -->
        <li id="home" class="nav-item">
          <router-link to="/home" class="nav-link">
            <i class="bi bi-house-door-fill"></i>
            <span class="tooltip-text">Home</span>
          </router-link>
        </li>

        <!-- Usuario -->
        <li class="nav-item">
          <router-link to="/empleados" class="nav-link">
            <i class="bi bi-person-fill"></i>
            <span class="tooltip-text">Usuario</span>
          </router-link>
        </li>

        <!-- Categorías -->
        <li class="nav-item">
          <router-link to="/categorias" class="nav-link">
            <i class="bi bi-tags-fill"></i>
            <span class="tooltip-text">Categorías</span>
          </router-link>
        </li>

        <!-- Productos -->
        <li class="nav-item">
          <router-link to="/productos" class="nav-link">
            <i class="bi bi-box-seam"></i>
            <span class="tooltip-text">Productos</span>
          </router-link>
        </li>

        <!-- Clientes -->
        <li class="nav-item">
          <router-link to="/clientes" class="nav-link">
            <i class="bi bi-people-fill"></i>
            <span class="tooltip-text">Clientes</span>
          </router-link>
        </li>

        <!-- Proveedores -->
        <li class="nav-item">
          <router-link to="/proveedores" class="nav-link">
            <i class="bi bi-truck"></i>
            <span class="tooltip-text">Proveedores</span>
          </router-link>
        </li>

        <!-- Compra -->
        <li class="nav-item">
          <router-link to="#" class="nav-link">
            <i class="bi bi-cart-plus-fill"></i>
            <span class="tooltip-text">Compra</span>
          </router-link>
        </li>

        <!-- Venta -->
        <li class="nav-item">
          <router-link to="#" class="nav-link">
            <i class="bi bi-cash-stack"></i>
            <span class="tooltip-text">Venta</span>
          </router-link>
        </li>

        <!-- TEST REGISTRO | BORRAR AL FINALIZAR EL TEST -->
        <li class="nav-item">
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
  /* overflow: hidden; */
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
