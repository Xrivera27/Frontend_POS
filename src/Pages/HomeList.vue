<template>
  <div class="dashboard">
    <ModalLoading :isLoading="isLoading" />
    <PageHeader :titulo="titulo" titleColor="lightseagreen" />

    <div v-if="role === 1">
      <!-- Secciones visibles solo para Administrador -->
      <BarChart />

    </div>

    <div v-if="role === 2">
      <!-- Secciones visibles solo para Gerente -->
      <h3>Panel de Gerente</h3>
      <BarChart />

    </div>

    <div v-if="role === 4">
      <!-- Secciones visibles solo para Gerente -->
      <h3>Panel de Ceo</h3>
      <BarChart />


    </div>

    <div v-if="role === 3">
      <!-- Secciones visibles solo para Cajero -->
      <h3>Panel de Cajero</h3>
      <BarChart />
      <div class="box">
        <div class="box-header">
          <h3>Registro de Ventas</h3>
        </div>
        <p>Aquí puedes registrar las ventas y emitir facturas.</p>
      </div>
    </div>
  </div>
</template>

<script>
import BarChart from '../components/DashboardList.vue';
import PageHeader from "@/components/PageHeader.vue";
import ModalLoading from '@/components/ModalLoading.vue';
import { setPageTitle } from '@/components/pageMetadata';

export default {
  components: {
    PageHeader,
    BarChart,
    ModalLoading,
  },
  data() {
    return {
      titulo: 'Bienvenido al Panel',
      role: Number(localStorage.getItem('role')) || 0,
    };
  },
  mounted() {
    setPageTitle('Inicio');
  },
  methods: {
    changeFavicon(iconPath) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

/* Estilos Generales */
* {
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Dashboard */
.dashboard {
  padding: 20px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

/* Caja */
.box {
  background: #f5f5f5;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.box-header {
  margin-bottom: 15px;
}

.box-header h3 {
  margin: 0;
  color: #333;
  transition: color 0.3s ease;
}

/* Encabezados */
h3 {
  color: #333;
  font-size: clamp(18px, 3vw, 24px);
  transition: color 0.3s ease;
}

/* Contenido adicional */
.container-top {
  width: 100%;
  text-align: right;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

#campana {
  margin-right: 10px;
  font-size: 18px;
  color: #a38655;
  transition: color 0.3s ease;
}

.rol {
  color: #969696;
  font-size: 14px;
  transition: color 0.3s ease;
}

/* Botones de Navegación */
.navigate-button {
  margin-left: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.navigate-button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

/* =======================================================
   Modo Oscuro
======================================================= */
/* Dashboard en modo oscuro */
.dark .dashboard {
  background-color: #1e1e1e;
  color: #fff;
}

/* Cajas en modo oscuro */
.dark .box {
  background: #2d2d2d;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Encabezados en modo oscuro */
.dark h3,
.dark .box-header h3 {
  color: #00ffcc;
}

/* Textos en modo oscuro */
.dark p {
  color: #fff;
}

/* Contenido adicional en modo oscuro */
.dark #campana {
  color: #00ffcc;
}

.dark .rol {
  color: #b0b0b0;
}

/* Botones en modo oscuro */
.dark .navigate-button {
  background-color: #00ffcc;
  color: #1e1e1e;
}

.dark .navigate-button:hover {
  background-color: #00ccaa;
}

/* Gráficos en modo oscuro */
.dark .chart-container {
  background-color: #2d2d2d;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Media Queries */
@media screen and (max-width: 768px) {
  .dashboard {
    padding: 15px;
  }

  .box {
    padding: 15px;
  }

  .container-top {
    justify-content: center;
    margin-top: 10px;
  }

  .navigate-button {
    margin: 5px;
    width: 100%;
    max-width: 300px;
  }
}

@media screen and (max-width: 480px) {
  .dashboard {
    padding: 10px;
  }

  .box {
    padding: 12px;
    margin-bottom: 15px;
  }

  .rol {
    font-size: 12px;
  }

  #campana {
    font-size: 16px;
  }

  .container-top {
    flex-direction: column;
    gap: 8px;
  }

  .navigate-button {
    font-size: 14px;
    padding: 8px 16px;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.box {
  animation: fadeIn 0.3s ease-out;
}
</style>
