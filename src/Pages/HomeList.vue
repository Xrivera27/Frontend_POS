<template>
  <div class="encabezado">
    <h1>Bienvenido al Panel</h1>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr>

  <!-- Resto del contenido -->
  <div class="button-grid">
    <!-- Texto o contenido adicional debajo de la barra superior -->

    <!-- Botón para administrar ventas -->
    <router-link to="/administrar-ventas">
      <button class="navigate-button">Administrar Ventas</button>
    </router-link>

    <router-link to="/administrar-compras">
      <button class="navigate-button">Administrar Compras</button>
    </router-link>
  </div>

  <div class="dashboard">
    <div v-if="role === 'Administrador'">
      <!-- Secciones visibles solo para Administrador -->
      <BarChart />
      <div class="box">
        <div class="box-header"></div>
        <!-- Contenido de gestión de usuarios -->
      </div>
    </div>

    <div v-if="role === 'Gerente'">
      <!-- Secciones visibles solo para Gerente -->
      <h3>Panel de Gerente</h3>
      <BarChart />
      <div class="box">
        <div class="box-header">
          <h3>Gestión de Inventario</h3>
        </div>
        <!-- Contenido de gestión de inventario -->
        <p>Aquí puedes gestionar el inventario y visualizar reportes.</p>
      </div>
      <div class="box">
        <div class="box-header">
          <h3>Reportes de Ventas</h3>
        </div>
        <!-- Contenido de reportes de ventas -->
        <p>Aquí puedes ver los reportes de ventas.</p>
      </div>
    </div>

    <div v-if="role === 'Cajero'">
      <!-- Secciones visibles solo para Cajero -->
      <h3>Panel de Cajero</h3>
      <BarChart />
      <div class="box">
        <div class="box-header">
          <h3>Registro de Ventas</h3>
        </div>
        <!-- Contenido de ventas -->
        <p>Aquí puedes registrar las ventas y emitir facturas.</p>
      </div>
    </div>
  </div>
</template>

<script>
import BarChart from '../components/BarChartList.vue';
import ProfileButton from '../components/ProfileButton.vue';

export default {
  components: {
    ProfileButton,
    BarChart,
  },
  data() {
    return {
      role: localStorage.getItem('role') || '', // Recupera el rol del localStorage
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard {
  padding: 20px;
}

.box {
  background: #f5f5f5;
  padding: 20px;
  margin-bottom: 20px;
}

.box-header h3 {
  margin: 0;
}

h1 {
  color: #39b378;
}

h3 {
  color: #333;
}

.container-top {
  width: 100%;
  text-align: right;
}

#campana {
  margin-right: 10px;
  font-size: 18px;
  color: #a38655;
}

.rol {
  color: #969696;
  font-size: 14px;
}

.navigate-button {
  margin-left: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.navigate-button:hover {
  background-color: #0056b3;
}
</style>
