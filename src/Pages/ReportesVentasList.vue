<template>
  <div class="report-container">
    <PageHeader :titulo="titulo" />

    <!-- Formulario para filtros de reporte -->
    <div class="input-group">
      <div class="input-field">
        <label>Fecha Inicio</label>
        <input type="date" class="fechas" v-model="fechaInicio" placeholder="Click para ver el calendario" />
      </div>
      <div class="input-field">
        <label>Fecha Fin</label>
        <input type="date" class="fechas" v-model="fechaFin" placeholder="Click para ver el calendario" />
      </div>
      <div class="input-field">
        <label>Usuarios</label>
        <input list="usuarios" v-model="usuarioSeleccionado" class="fechas" placeholder="Selecciona un usuario" />
        <datalist id="usuarios">
          <option v-for="usuario in usuarios" :key="usuario.id_usuario" :value="usuario.nombre"></option>
          <!-- Asegúrate de que 'nombre' sea la propiedad correcta -->
        </datalist>
      </div>
      <div class="input-field">
        <label>Clientes</label>
        <input list="clientes" v-model="clienteSeleccionado" class="fechas" placeholder="Selecciona un cliente" />
        <datalist id="clientes">
          <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.Clientes || cliente.nombre_completo">
          </option>
        </datalist>
      </div>
      <div class="input-field">
        <label>Ordenar por:</label>
        <select v-model="ordenSeleccionado">
          <option value="correlativo">Correlativo</option>
          <!-- Agrega más opciones según sea necesario -->
        </select>
      </div>
    </div>

    <div class="button-group">
      <button @click="generarReporte('pdf')" class="btn pdf-btn">PDF</button>
      <button @click="generarReporte('excel')" class="btn excel-btn">EXCEL</button>
      <button @click="generarReporte()" class="btn generate-btn">Generar</button>
    </div>

    <!-- Tabla de reporte -->
    <div class="report-table">
      <div class="table-header"></div> <!-- Header azul -->
      <table>
        <thead>
          <tr>
            <th>Fecha Emisión</th>
            <th>RTN</th>
            <th>Cliente</th>
            <th>Factura</th>
            <th>Tipo</th>
            <th>Valor Exonerado</th>
            <th>Valor Exento</th>
            <th>Valor Gravado</th>
            <th>ISV</th>
            <th>Valor Neto</th>
            <th>Descuento</th>
            <th>Vendedor</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(dato, index) in datosReporte" :key="index">
            <td>{{ dato.fechaEmision }}</td>
            <td>{{ dato.rtn }}</td>
            <td>{{ dato.cliente }}</td>
            <td>{{ dato.factura }}</td>
            <td>{{ dato.tipo }}</td>
            <td>{{ dato.valorExonerado }}</td>
            <td>{{ dato.valorExento }}</td>
            <td>{{ dato.valorGravado }}</td>
            <td>{{ dato.isv }}</td>
            <td>{{ dato.valorNeto }}</td>
            <td>{{ dato.descuento }}</td>
            <td>{{ dato.vendedor }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Totales debajo de la tabla -->
    <div class="totals">
      <div><strong>Valor Exonerado:</strong> {{ totales.valorExonerado }}</div>
      <div><strong>Valor Exento:</strong> {{ totales.valorExento }}</div>
      <div><strong>Valor Gravado:</strong> {{ totales.valorGravado }}</div>
      <div><strong>ISV:</strong> {{ totales.isv }}</div>
      <div><strong>Total:</strong> {{ totales.total }}</div>
      <div><strong>Descuento:</strong> {{ totales.descuento }}</div>
    </div>
  </div>
</template>

<script>
import PageHeader from "@/components/PageHeader.vue";
import solicitudes from "../../services/solicitudes.js";

export default {
  components: {
    PageHeader,
  },
  data() {
    return {
      titulo: 'Reporte de Ventas',
      fechaInicio: '',
      fechaFin: '',
      clienteSeleccionado: '',
      usuarioSeleccionado: '',
      clientes: [],
      usuarios: [], // Asegúrate de que los usuarios se obtengan correctamente
      datosReporte: [],
      totales: {},
      id_usuario: null,
    };
  },
  async mounted() {
    try {
      const token = localStorage.getItem('auth');
      if (token) {
        // Decodificar el token para obtener el id_usuario
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        this.id_usuario = decodedToken.id_usuario;

        const empresaId = this.id_usuario;

        const response = await fetch(`http://localhost:3000/api/clientes/${empresaId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        this.clientes = data;
      } else {
        console.error('ID de Usuario no encontrado en localStorage');
      }
    } catch (error) {
      console.error('Error al obtener los clientes:', error);
    }

    try {
      this.usuarios = await solicitudes.fetchRegistros(`/usuarios/getBy-empresa/${this.id_usuario}`);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }

    document.title = "Reportes";
    this.changeFavicon('/img/spiderman.ico'); // Usar la ruta correcta
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

/* Fuentes */
* {
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
}

.report-container {
  background-color: #f5f5f5;
  color: #000;
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: 0;
  width: 100%;
  max-width: none;
  margin: 0;
  min-height: 100vh;
}

.input-group {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(10px, 2vw, 20px);
  margin-top: 5%;
  margin-bottom: clamp(1rem, 3vw, 2rem);
}

.input-field {
  flex: 1 1 calc(50% - 10px);
  min-width: 250px;
}

.fecha,
input[type="date"],
input[list],
select {
  width: 100%;
  padding: clamp(6px, 1.5vw, 8px);
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #f5f5f5;
  color: #000;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #000;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(5px, 1.5vw, 10px);
  margin-top: clamp(1rem, 3vw, 1.5rem);
  margin-bottom: clamp(0.5rem, 2vw, 1rem);
}

.btn {
  padding: clamp(8px, 1.5vw, 10px) clamp(15px, 2vw, 20px);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  transition: opacity 0.3s ease;
  flex: 1;
  min-width: 120px;
  max-width: 200px;
}

.btn:hover {
  opacity: 0.9;
}

.pdf-btn {
  background-color: #007bff;
  color: #000;
}

.excel-btn {
  background-color: #28a745;
  color: #000;
}

.generate-btn {
  background-color: #007bff;
  color: #000;
}

.table-header {
  height: clamp(35px, 5vw, 40px);
  background-color: #00a3ff;
  border-radius: 4px 4px 0 0;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  margin-top: clamp(0.5rem, 2vw, 1rem);
}

table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  min-width: 600px;
}

thead th {
  text-align: left;
  padding: clamp(6px, 1.5vw, 8px);
  background-color: #f5f5f5;
  color: #000;
  font-weight: bold;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  white-space: nowrap;
}

tbody td {
  padding: clamp(6px, 1.5vw, 8px);
  border-top: 1px solid #333;
  color: #000;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}

.totals {
  margin-top: clamp(1rem, 3vw, 1.5rem);
  display: flex;
  flex-wrap: wrap;
  gap: clamp(10px, 2vw, 20px);
  justify-content: space-between;
}

.totals div {
  flex: 1 1 calc(50% - 10px);
  min-width: 250px;
  color: #000;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}

/* Media Queries */
@media screen and (max-width: 768px) {

  .report-container {
    padding: 1rem;
    margin: 0;
    /* Quitado el margen */
    width: 100%;
  }

  .input-field {
    flex: 1 1 100%;
  }

  .button-group {
    justify-content: center;
  }

  .btn {
    flex: 1 1 auto;
  }
}

@media screen and (max-width: 480px) {
  .report-container {
    padding: 1rem;
    margin: 0.5rem auto;
    width: 98%;
  }

  .totals div {
    flex: 1 1 100%;
  }

  .table-container {
    margin: 0 -1rem;
    padding: 0 1rem;
    width: calc(100% + 2rem);
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    max-width: none;
  }
}

/* Scrollbar personalizado para la tabla */
.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}


/* =======================================================
   Modo Oscuro
======================================================= */
/* Contenedor principal */
.dark .report-container {
  background-color: #1e1e1e;
  color: #fff;
}

/* Inputs y campos de formulario */
.dark .fecha,
.dark input[type="date"],
.dark input[list],
.dark select {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

.dark input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

.dark input:-webkit-autofill,
.dark input:-webkit-autofill:hover,
.dark input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff;
  -webkit-box-shadow: 0 0 0px 1000px #2d2d2d inset;
  transition: background-color 5000s ease-in-out 0s;
}

/* Labels y texto */
.dark label {
  color: #fff;
}

/* Botones */
.dark .pdf-btn {
  background-color: #007bff;
  color: #fff;
}

.dark .excel-btn {
  background-color: #28a745;
  color: #fff;
}

.dark .generate-btn {
  background-color: #007bff;
  color: #fff;
}

/* Tabla y componentes relacionados */
.dark .table-header {
  background-color: #004c77;
}

.dark table {
  border-color: #404040;
}

.dark thead th {
  background-color: #383838;
  color: #fff;
  border-color: #404040;
}

.dark tbody td {
  border-color: #404040;
  color: #fff;
}

.dark tbody tr:nth-child(even) {
  background-color: #2d2d2d;
}

.dark tbody tr:hover {
  background-color: #383838;
}

/* Totales */
.dark .totals div {
  color: #fff;
}

.dark strong {
  color: #00ffcc;
}

/* Scrollbar personalizado en modo oscuro */
.dark .table-container::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.dark .table-container::-webkit-scrollbar-thumb {
  background: #c09d62;
}

.dark .table-container::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}

/* Datalist en modo oscuro */
.dark option {
  background-color: #2d2d2d;
  color: #fff;
}

/* Inputs con autocompletado en modo oscuro */
.dark input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 30px #2d2d2d inset !important;
  -webkit-text-fill-color: #fff !important;
}
</style>
