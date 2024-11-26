<template>
  <div class="dashboard-container">
    <!-- Tarjetas informativas con iconos de Bootstrap y enlaces "Ver más" -->
    <div class="cards-container">

      <div class="card" v-for="(item, index) in cards" :key="index">
        <div class="card-content">

          <div class="value-content">

            <h3>{{ item.title }}</h3>
            <i :class="item.icon" class="card-icon"></i>
            <p class="item-value">{{ item.value }}</p>
          </div>
        </div>
        <a :href="item.link" class="card-link">Ver más</a>
      </div>

    </div>
    <div class="graphics-container">
      <!-- Gráfico de ventas y Productos más vendidos (más pequeños) -->
      <div class="charts-container">
        <div class="line-chart">
          <LineChart :chart-data="lineChartData" :options="lineChartOptions" />
        </div>
        <div class="pie-chart">
          <PieChart :chart-data="pieChartData" :options="pieChartOptions" />
        </div>
      </div>

      <!-- Tabla de últimas ventas -->

    </div>
    <table class="sales-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Vendedor</th>
          <th>Número</th>
          <th>Fecha</th>
          <th>Total</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(sale, index) in sales" :key="index">
          <td>{{ sale.nombre }}</td>
          <td>{{ sale.vendedor }}</td>
          <td>{{ sale.numero }}</td>
          <td>{{ sale.fecha }}</td>
          <td>{{ sale.total }}</td>
          <td><a href="#">Ver más</a><span>|</span><button style="font-size: 1rem;">Descargar</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { Line, Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, ArcElement, CategoryScale, LinearScale);

export default {
  components: {
    LineChart: Line,
    PieChart: Pie,
  },
  data() {
    return {
      // Datos para las tarjetas con iconos y enlaces
      cards: [
        { title: "Ventas", value: "L. 21,324", icon: "bi bi-cash", link: "/administrar-ventas" },
        { title: "Compras Pendientes", value: "35", icon: "bi bi-wallet", link: "/administrar-compras" },
        { title: "Clientes", value: "2,703", icon: "bi bi-people", link: "/clientes" },
        { title: "Alertas", value: "3", icon: "bi bi-tags", link: "/admin-invenario" },
      ],
      // Datos para el gráfico de líneas (Ventas por mes)
      lineChartData: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
        datasets: [
          {
            label: 'Laptops',
            borderColor: '#FF6384',
            data: [65, 59, 80, 81, 56],
            fill: false,
          },
          {
            label: 'Tablets',
            borderColor: '#36A2EB',
            data: [28, 48, 40, 19, 86],
            fill: false,
          },
        ],
      },
      lineChartOptions: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
      // Datos para el gráfico de pastel (Productos más vendidos)
      pieChartData: {
        labels: ['Electrónicos', 'Hogar', 'Juguetería'],
        datasets: [
          {
            data: [300, 50, 100],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          },
        ],
      },
      pieChartOptions: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
      // Datos para la tabla de últimas ventas
      sales: [
        { nombre: 'Gerson Rivera', vendedor: 'Jenni Lemus', numero: '9299-2019', fecha: '2024-07-27 11:20:56', total: 'L. 1,230.00' },
        { nombre: 'Axel Arteaga', vendedor: 'Jenni Lemus', numero: '8888-8888', fecha: '2024-07-28 15:40:56', total: 'L. 1,231.00' },
        { nombre: 'Denzer Hernández', vendedor: 'Jenni Lemus', numero: '3333-3333', fecha: '2024-07-28 17:30:56', total: 'L. 1,232.00' },
        { nombre: 'Carlos Sosa', vendedor: 'Jenni Lemus', numero: '0202-0202', fecha: '2024-07-28 05:20:56', total: 'L. 1,242.42' },
      ],
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
}

/* =======================================================
   Estilos Base del Dashboard
======================================================= */
.dashboard-container {
  padding: 20px;
  transition: all 0.3s ease;
}

/* Contenedor de las tarjetas */
.cards-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

/* Contenedor de los gráficos */
.graphics-container {
  padding: 0 5%;
}

/* Estilo para las tarjetas */
.card {
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.card-icon {
  margin-top: 3rem;
  font-size: 1.75rem;
  color: #333;
}

.item-value {
  display: inline;
  padding: 10px;
  color: #333;
}

.card h3 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.card p {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0.5rem 0;
}

.card-link {
  display: block;
  margin-top: 1rem;
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}

/* Contenedor de los gráficos */
.charts-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 2rem;
}

.line-chart,
.pie-chart {
  width: 45%;
  background-color: #ffffff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Estilo para la tabla de ventas */
.sales-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.sales-table th,
.sales-table td {
  padding: 12px;
  border: 1px solid #ddd;
  transition: all 0.3s ease;
}

.sales-table th {
  background-color: #f4f4f4;
  font-weight: bold;
  color: #333;
}

.sales-table td {
  text-align: center;
  color: #333;
}

.sales-table a,
.sales-table button {
  margin-right: 10px;
  text-decoration: none;
  color: #007bff;
  border: none;
  background-color: transparent;
  cursor: pointer;
  transition: color 0.3s ease;
}

.sales-table span {
  color: #ddd;
  margin: 0 5px;
}

/* =======================================================
   Estilos en Modo Oscuro
======================================================= */
/* Contenedor principal en modo oscuro */
.dark .dashboard-container {
  background-color: #1e1e1e;
  color: #fff;
}

/* Tarjetas en modo oscuro */
.dark .card {
  background-color: #2d2d2d;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.dark .card h3,
.dark .card p,
.dark .item-value {
  color: #fff;
}

.dark .card-icon {
  color: #00ffcc;
}

.dark .card-link {
  color: #00ffcc;
}

.dark .card-link:hover {
  color: #00ccaa;
}

/* Gráficos en modo oscuro */
.dark .line-chart,
.dark .pie-chart {
  background-color: #2d2d2d;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

/* Tabla en modo oscuro */
.dark .sales-table {
  background-color: #2d2d2d;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.dark .sales-table th {
  background-color: #383838;
  color: #fff;
  border-color: #404040;
}

.dark .sales-table td {
  color: #fff;
  border-color: #404040;
}

.dark .sales-table tr:hover {
  background-color: #383838;
}

.dark .sales-table a,
.dark .sales-table button {
  color: #00ffcc;
}

.dark .sales-table a:hover,
.dark .sales-table button:hover {
  color: #00ccaa;
}

.dark .sales-table span {
  color: #666;
}

/* Personalización de los gráficos en modo oscuro */
.dark .charts-container canvas {
  background-color: #2d2d2d;
}

/* =======================================================
   Estilos Responsivos
======================================================= */
@media (max-width: 1200px) {
  .cards-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-container {
    flex-direction: column;
  }
  
  .line-chart,
  .pie-chart {
    width: 100%;
    margin-bottom: 1rem;
  }
}

@media (max-width: 768px) {
  .cards-container {
    grid-template-columns: 1fr;
  }
  
  .graphics-container {
    padding: 0;
  }
  
  .sales-table {
    overflow-x: auto;
    display: block;
  }
}

</style>