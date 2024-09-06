<template>
  <div class="dashboard">
    <h2>Dashboard</h2>
    <div v-if="role === 'Administrador'">
      <!-- Secciones visibles solo para Administrador -->
      <h3>Panel de Administrador</h3>
      <BarChart />
      <div class="box">
        <div class="box-header">
          <h3>Gestión de Usuarios</h3>
        </div>
        <!-- Contenido de gestión de usuarios -->
        <p>Aquí puedes gestionar usuarios, asignar roles y configurar el sistema.</p>
      </div>
      <div class="box">
        <div class="box-header">
          <h3>Gestión de Proveedores</h3>
        </div>
        <!-- Contenido de gestión de proveedores -->
        <p>Aquí puedes registrar y gestionar proveedores.</p>
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
import BarChart from './BarChartList.vue';

export default {
  components: {
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

h2 {
  color: #39b378;
}

h3 {
  color: #333;
}
</style>
