<template>
  <div class="dashboard-container">
    <ModalLoading :isLoading="isLoading" />
    <!-- Tarjetas informativas con iconos de Bootstrap y enlaces "Ver más" -->
    <div class="cards-container">
      <div class="card" v-for="(item, index) in cardsData" :key="index">
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
      <!-- Gráfico de ventas y Productos más vendidos -->
      <div class="charts-container">
        <div class="line-chart">
          <LineChart :chart-data="lineChartData" :options="lineChartOptions" />
        </div>
        <div class="pie-chart">
          <PieChart :chart-data="pieChartData" :options="pieChartOptions" />
        </div>
      </div>

      <!-- Tabla de últimas ventas -->
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
            <td>
              <router-link to="/administrar-ventas" class="card-link">Ver más</router-link>
              <!-- <span>|</span>
              <button style="font-size: 1rem;">Descargar</button> -->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { Line, Pie } from 'vue-chartjs';
const { getTotalVentasDia } = require('../../services/dashboardSolicitudes')
const { getClientesPorEmpresa } = require('../../services/dashboardSolicitudes')
const { getAlertasPorPromocion } = require('../../services/dashboardSolicitudes')
const { getAlertasPorPromocionProducto } = require('../../services/dashboardSolicitudes')
import { notis } from '../../services/notificaciones.js';
const { getVentasUltimosTresMeses } = require('../../services/dashboardSolicitudes')
const { getCategoriasPopulares } = require('../../services/dashboardSolicitudes')
const { getUltimasVentas } = require('../../services/dashboardSolicitudes')
import solicitudes from "../../services/solicitudes.js";
import ModalLoading from '@/components/ModalLoading.vue';
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

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale
);

export default {
  name: 'DashboardList',

  components: {
    LineChart: Line,
    PieChart: Pie,
    ModalLoading
  },

  data() {
    return {
      ventas: 0,
      clientesNumero: 0,
      alertasPorPromocion: 0,
      alertasPorPromocionProducto: 0,
      id_usuario: '',
      isLoading: false,
      lineChartData: {
        labels: [],
        datasets: [
          {
            label: 'Ventas Pagadas',
            borderColor: '#36A2EB',
            data: [],
            fill: false,
          },
          {
            label: 'Ventas Canceladas',
            borderColor: '#FF6384',
            data: [],
            fill: false,
          }
        ],
      },
      lineChartOptions: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || '';
                return `${label}: ${context.raw}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: function (value) {
                return Math.floor(value);
              }
            }
          }
        }
      },
      pieChartData: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        }]
      },
      pieChartOptions: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          }
        }
      },
      sales: [],
    };
  },

  computed: {
    retornarVentas() {
      return this.ventas;
    },
    cardsData() {
      return [
        {
          title: "Ventas",
          value: `L. ${this.retornarVentas}`,
          icon: "bi bi-cash",
          link: "/administrar-ventas"
        },
        {
          title: "Clientes",
          value: this.clientesNumero,
          icon: "bi bi-people",
          link: "/clientes"
        },
        {
          title: "Alertas Promoción",
          value: this.getAlertasPromocionFormatted(),
          icon: "bi bi-tags",
          link: "/admin-invenario"
        },
        {
          title: "Promociones Productos",
          value: this.getAlertasPorPromocionProductoFormatted(),
          icon: "bi bi-megaphone",
          link: "/promociones-producto"
        },
      ];
    }
  },

  methods: {

    async devolverVenta() {
      try {
        this.ventas = await getTotalVentasDia(this.id_usuario);
      } catch (error) {
        notis("error", "Error al buscar ventas")
      }
    },

    async obtenerNumeroClientes() {
      try {
        const clientes = await getClientesPorEmpresa(this.id_usuario);
        this.clientesNumero = clientes.totalClientes;
      } catch (error) {
        notis("error", "Error al buscar el total de clientes")
      } finally {
        this.isLoading = false;
      }
    },
    async getAlertasPromocion() {
      try {
        this.alertasPorPromocion = await getAlertasPorPromocion(this.id_usuario);
      } catch (error) {
        console.error(error);
        notis("error", "Error al mostras las promociones de productos")
      }
    },

    getAlertasPromocionFormatted() {
      try {
        if (this.alertasPorPromocion) {
          const { totalAlertas } = this.alertasPorPromocion;
          return totalAlertas;
        }
      } catch (error) {
        console.error(error);
        notis("error", "Error al mostras las promociones de productos")
      }
    },

    async getAlertasPorPromocionProducto() {
      try {
        this.alertasPorPromocionProducto = await getAlertasPorPromocionProducto(this.id_usuario);
      } catch (error) {
        console.error(error);
      }
    },

    getAlertasPorPromocionProductoFormatted() {
      if (this.alertasPorPromocionProducto) {
        const { totalAlertasProducto } = this.alertasPorPromocionProducto;
        return totalAlertasProducto;
      }
    },

    async obtenerVentasUltimosTresMeses() {
      try {
        const response = await getVentasUltimosTresMeses(this.id_usuario);
        if (response && response.chartData) {
          this.lineChartData = response.chartData.lineChartData;
          this.lineChartOptions = {
            ...this.lineChartOptions,
            ...response.chartData.lineChartOptions
          };
        }
      } catch (error) {
        console.error('Error al obtener ventas de los últimos 3 meses:', error);
      }
    },

    async obtenerCategoriasPopulares() {
      try {
        const response = await getCategoriasPopulares(this.id_usuario);
        if (response && response.topCategorias) {
          // Actualizar el pieChartData con los datos de topCategorias
          this.pieChartData = {
            labels: response.topCategorias.map(categoria => categoria.nombre),
            datasets: [{
              data: response.topCategorias.map(categoria => categoria.cantidadTotal),
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
              hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            }]
          };
        }
      } catch (error) {
        console.error('Error al obtener categorías populares:', error);
        notis("error", "Error al obtener las categorías más vendidas");
      }
    },

    async obtenerUltimasVentas() {
      try {
        const response = await getUltimasVentas(this.id_usuario);
        if (response && response.sales) {
          // Formatear la fecha antes de asignarla
          this.sales = response.sales.map(venta => ({
            ...venta,
            fecha: new Date(venta.fecha).toLocaleString('es-HN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })
          }));
        }
      } catch (error) {
        console.error('Error al obtener últimas ventas:', error);
        notis("error", "Error al obtener las últimas ventas");
      } finally {
        this.isLoading = false;
      }
    },
  },

  async mounted() {
    this.isLoading = true;
    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();
      await this.devolverVenta();
      await this.obtenerNumeroClientes();
      await this.getAlertasPromocion();
      await this.getAlertasPorPromocionProducto();
      await this.obtenerVentasUltimosTresMeses();
      await this.obtenerCategoriasPopulares();
      await this.obtenerUltimasVentas();
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }
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