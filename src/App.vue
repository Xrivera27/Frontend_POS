<template>
  <div class="app-wrapper">
    <aside class="sidebar">
      <ul class="nav flex-column">
        <!-- Home -->
        <li class="nav-item">
          <router-link to="/" class="nav-link">
            <i class="bi bi-house-door-fill"></i>
            <span class="tooltip-text">Home</span>
          </router-link>
        </li>

        <!-- Usuario -->
        <li class="nav-item">
          <router-link to="#" class="nav-link">
            <i class="bi bi-person-fill"></i>
            <span class="tooltip-text">Usuario</span>
          </router-link>
        </li>

        <!-- Categorías -->
        <li class="nav-item">
          <router-link to="#" class="nav-link">
            <i class="bi bi-tags-fill"></i>
            <span class="tooltip-text">Categorías</span>
          </router-link>
        </li>

        <!-- Productos -->
        <li class="nav-item">
          <router-link to="#" class="nav-link">
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
  name: 'App'
};
</script>

<style scoped>
/* Estilos del sidebar y el layout */
.app-wrapper {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 80px;
  background-color: rgb(172, 167, 167);
  color: white;
  padding-top: 20px;
  position: fixed;
  height: 100%;
}

.sidebar .nav {
  list-style: none;
  padding-left: 0;
}

.sidebar .nav-item {
  margin-bottom: 10px;
}

.sidebar .nav-link {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  color: rgb(245, 196, 91);
  font-size: 24px;
  text-align: center;
  position: relative;
  text-decoration: none;
}

.sidebar .nav-link:hover {
  background-color: rgb(238, 203, 157);
  color: white;
}

.sidebar .nav-link i {
  display: block;
}

.tooltip-text {
  display: none;
  position: absolute;
  left: 90px;
  white-space: nowrap;
  background-color: #333;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
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
