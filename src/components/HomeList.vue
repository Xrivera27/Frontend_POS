<template>
    <div class="content-wrapper">
  
      <!-- Content Header -->
      <section class="content-header">
        <h1>
          Tablero
          <small>Panel de Control</small>
        </h1>
  
        <ol class="breadcrumb">
          <li>
            <a href="#"><i class="fa fa-dashboard"></i> Inicio</a>
          </li>
          <li class="active">Tablero</li>
        </ol>
      </section>
  
      <!-- Main Content -->
      <section class="content">
  
        <div class="row">
          <!-- Cajas superiores (solo para Administrador) -->
          <div v-if="perfil === 'Administrador'" class="box box-primary">
            <div class="box-header">
              <h3>Cajas Superiores</h3>
            </div>
            <div class="box-body">
              <p>Simulación de cajas superiores...</p>
            </div>
          </div>
        </div>
  
        <div class="row">
          <div class="col-lg-12">
            <!-- Gráfico de ventas (solo para Administrador) -->
            <div v-if="perfil === 'Administrador'" class="box box-info">
              <div class="box-header">
                <h3>Gráfico de Ventas</h3>
              </div>
              <div class="box-body">
                <p>Simulación de gráfico de ventas...</p>
              </div>
            </div>
          </div>
  
          <div class="col-lg-6">
            <!-- Productos más vendidos (solo para Administrador) -->
            <div v-if="perfil === 'Administrador'" class="box box-warning">
              <div class="box-header">
                <h3>Productos Más Vendidos</h3>
              </div>
              <div class="box-body">
                <p>Simulación de productos más vendidos...</p>
              </div>
            </div>
          </div>
  
          <div class="col-lg-6">
            <!-- Productos recientes (solo para Administrador) -->
            <div v-if="perfil === 'Administrador'" class="box box-success">
              <div class="box-header">
                <h3>Productos Recientes</h3>
              </div>
              <div class="box-body">
                <p>Simulación de productos recientes...</p>
              </div>
            </div>
          </div>
  
          <div class="col-lg-12">
            <!-- Bienvenida personalizada (para Especial y Vendedor) -->
            <div v-if="perfil === 'Especial' || perfil === 'Vendedor'" class="box box-success">
              <div class="box-header">
                <h1>Bienvenid@ {{ nombre }}</h1>
              </div>
            </div>
          </div>
        </div>
  
      </section>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TableroList',
    data() {
      return {
        // Simulamos el perfil y nombre del usuario
        perfil: 'Administrador', // Puedes cambiar a 'Especial', 'Vendedor', etc. para probar
        nombre: 'Juan Pérez'
      };
    }
  };
  </script>
  
  <style scoped>
  .content-wrapper {
    padding: 20px;
  }
  
  /* Breadcrumb */
  .breadcrumb {
    background: none;
    margin-bottom: 20px;
  }
  
  .breadcrumb li {
    display: inline-block;
  }
  
  /* Caja */
  .box {
    background: #f5f5f5;
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .box-header h3 {
    margin: 0;
  }
  </style>
  