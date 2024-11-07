<template>
  <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  <div class="report-container">
    <h1><span class="title-bold">Reporte</span> Ventas</h1>

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
          <option v-for="usuario in usuarios" :key="usuario.id_usuario" :value="usuario.nombre"></option> <!-- Asegúrate de que 'nombre' sea la propiedad correcta -->
        </datalist>
      </div>
      <div class="input-field">
        <label>Clientes</label>
        <input list="clientes" v-model="clienteSeleccionado" class="fechas" placeholder="Selecciona un cliente" />
        <datalist id="clientes">
          <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.Clientes || cliente.nombre_completo"></option>
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
import ProfileButton from "../components/ProfileButton.vue";
import solicitudes from "../../services/solicitudes.js";

export default {
  components: {
    ProfileButton,
  },
  data() {
    return {
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
.report-container {
  background-color: #f5f5f5;
  color: #000;
  padding: 20px;
  border-radius: 8px;
  max-width: 90rem;
  margin: auto;
}

.title-bold {
  font-weight: bold;
}

.input-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.input-field {
  flex: 1 1 45%;
}

.fecha, /* Renombrado para mejor claridad */
input[type="date"],
input[list], /* Asegura que el input del datalist se ajuste */
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #f5f5f5;
  color: #000;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #000;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
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
  height: 40px;
  background-color: #00a3ff;
  border-radius: 4px 4px 0 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  margin-top: 10px;
}

thead th {
  text-align: left;
  padding: 8px;
  background-color: #f5f5f5;
  color: #000;
  font-weight: bold;
}

tbody td {
  padding: 8px;
  border-top: 1px solid #333;
  color: #000;
}

.totals {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.totals div {
  margin: 5px 0;
  flex: 1 1 45%;
  color: #000;
}
</style>
