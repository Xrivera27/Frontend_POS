<template>
  <div class="report-wrapper">
    <PageHeader :titulo="titulo" />

    <div class="report-header">
      <div class="logo-and-title">
        <div class="logo-container">
          <img v-if="logoUrl" :src="logoUrl" alt="Logo empresa" class="company-logo" />
        </div>
        <div class="buttons-container">
          <label class="upload-label">
            <input type="file" @change="handleLogoUpload" accept="image/*" class="hidden-input" />
            <span class="upload-button">{{ logoUrl ? 'Cambiar Logo' : 'Subir Logo' }}</span>
          </label>
          <button @click="showHeaderFooterModal = true" class="header-footer-btn">
            Configurar Header/Footer
          </button>
        </div>
      </div>
    </div>

    <HeaderFooterDesigner v-model="showHeaderFooterModal" @save="handleHeaderFooterSave" />

    <!-- Filtros -->
    <div class="filters-section">
      <div class="filter-row">
        <div class="filter-group">
          <label>Tipo de Reporte</label>
          <select v-model="reporteSeleccionado" class="select-input">
            <option value="ventas_cliente">Ventas por Cliente</option>
            <option value="ventas_cajero">Ventas por Cajero</option>
            <option value="ventas_sucursal">Ventas por Sucursal</option>
            <option value="ventas_empleado">Ventas por Empleado</option>
          </select>
        </div>

        <div class="filter-group">
          <label>{{ labelFiltro }}</label>
          <select v-model="valorFiltro" class="select-input">
            <option value="">Todos</option>
            <option v-for="opcion in opcionesFiltro" :key="opcion.id" :value="opcion.id">
              {{ opcion.nombre }}
            </option>
          </select>
        </div>
      </div>

      <div class="filter-row dates">
        <div class="date-group">
          <button @click="setHoy" class="hoy-btn">Hoy</button>
          <div class="date-inputs">
            <div class="date-field">
              <label>Fecha Inicio</label>
              <input type="date" v-model="filtros.fechaInicio" @change="validarFechas" />
            </div>
            <div class="date-field">
              <label>Fecha Fin</label>
              <input type="date" v-model="filtros.fechaFin" @change="validarFechas" :min="filtros.fechaInicio" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botones -->
    <div class="button-group">
      <button @click="generarReporte('pdf')" class="btn pdf-btn" :disabled="!fechasValidas">PDF</button>
      <button @click="generarReporte('excel')" class="btn excel-btn" :disabled="!fechasValidas">EXCEL</button>
      <button @click="generarReporte('preview')" class="btn generate-btn" :disabled="!fechasValidas">Generar</button>
    </div>

    <!-- Tabla de resultados -->
    <div class="report-table" v-if="datosReporte.length">
      <div class="table-header"></div>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th v-if="reporteSeleccionado === 'ventas_cliente'">Cliente</th>
            <th v-if="reporteSeleccionado === 'ventas_cajero'">Cajero</th>
            <th v-if="reporteSeleccionado === 'ventas_sucursal'">Sucursal</th>
            <th v-if="reporteSeleccionado === 'ventas_empleado'">Empleado</th>
            <th>Factura</th>
            <th>Valor Exonerado</th>
            <th>Valor Exento</th>
            <th>Valor Gravado</th>
            <th>ISV</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(dato, index) in datosReporte" :key="index">
            <td>{{ formatearFecha(dato.fecha) }}</td>
            <td v-if="reporteSeleccionado === 'ventas_cliente'">{{ dato.cliente }}</td>
            <td v-if="reporteSeleccionado === 'ventas_cajero'">{{ dato.cajero }}</td>
            <td v-if="reporteSeleccionado === 'ventas_sucursal'">{{ dato.sucursal }}</td>
            <td v-if="reporteSeleccionado === 'ventas_empleado'">{{ dato.empleado }}</td>
            <td>{{ dato.factura }}</td>
            <td>{{ formatearMoneda(dato.valorExonerado) }}</td>
            <td>{{ formatearMoneda(dato.valorExento) }}</td>
            <td>{{ formatearMoneda(dato.valorGravado) }}</td>
            <td>{{ formatearMoneda(dato.isv) }}</td>
            <td>{{ formatearMoneda(dato.total) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Totales -->
      <div class="totals">
        <div><strong>Total Exonerado:</strong> {{ formatearMoneda(totales.exonerado) }}</div>
        <div><strong>Total Exento:</strong> {{ formatearMoneda(totales.exento) }}</div>
        <div><strong>Total Gravado:</strong> {{ formatearMoneda(totales.gravado) }}</div>
        <div><strong>Total ISV:</strong> {{ formatearMoneda(totales.isv) }}</div>
        <div><strong>Total General:</strong> {{ formatearMoneda(totales.total) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from "@/components/PageHeader.vue";
import solicitudes from "../../services/solicitudes.js";
import HeaderFooterDesigner from "@/components/HeaderFooterDesigner.vue";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default {
  name: 'ReporteVentas',
  components: {
    PageHeader,
    HeaderFooterDesigner
  },
  data() {
    return {
      showHeaderFooterModal: false, // Asegurarse que está definido en data
      titulo: 'Reportería',
      logoUrl: localStorage.getItem('logoEmpresa') || null,
      reporteSeleccionado: 'ventas_cliente',
      errorFecha: false,
      maxLogoSize: 40,
      filtros: {
        cliente: '',
        cajero: '',
        sucursal: '',
        empleado: '',
        fechaInicio: '',
        fechaFin: ''
      },

      headerFooterConfig: {
        header: {
          enabled: true,
          text: 'Reporte de Ventas'
        },
        footer: {
          enabled: true,
          text: 'Generado el {FECHA}'
        }
      },

      clientes: [
        { id: 1, nombre: 'Cliente A' },
        { id: 2, nombre: 'Cliente B' },
        { id: 3, nombre: 'Cliente C' }
      ],
      cajeros: [
        { id: 1, nombre: 'Cajero 1' },
        { id: 2, nombre: 'Cajero 2' },
        { id: 3, nombre: 'Cajero 3' }
      ],
      sucursales: [
        { id: 1, nombre: 'Sucursal Central' },
        { id: 2, nombre: 'Sucursal Norte' },
        { id: 3, nombre: 'Sucursal Sur' }
      ],
      empleados: [
        { id: 1, nombre: 'Juan Pérez' },
        { id: 2, nombre: 'María López' },
        { id: 3, nombre: 'Carlos Ruiz' }
      ],
      datosReporte: [
        {
          fecha: '2024-03-01',
          cliente: 'Cliente A',
          cajero: 'Cajero 1',
          sucursal: 'Sucursal Central',
          empleado: 'Juan Pérez',
          factura: 'FAC-001',
          valorExonerado: 1000,
          valorExento: 500,
          valorGravado: 2000,
          isv: 300,
          total: 3800
        },
        {
          fecha: '2024-03-01',
          cliente: 'Cliente B',
          cajero: 'Cajero 2',
          sucursal: 'Sucursal Norte',
          empleado: 'María López',
          factura: 'FAC-002',
          valorExonerado: 1500,
          valorExento: 800,
          valorGravado: 2500,
          isv: 375,
          total: 5175
        }
      ],
      totales: {
        exonerado: 2500,
        exento: 1300,
        gravado: 4500,
        isv: 675,
        total: 8975
      }
    }
  },
  computed: {
    fechasValidas() {
      return this.filtros.fechaInicio && this.filtros.fechaFin && !this.errorFecha;
    },

    opcionesFiltro() {
      switch (this.reporteSeleccionado) {
        case 'ventas_cliente':
          return this.clientes;
        case 'ventas_cajero':
          return this.cajeros;
        case 'ventas_sucursal':
          return this.sucursales;
        case 'ventas_empleado':
          return this.empleados;
        default:
          return [];
      }
    },

    labelFiltro() {
      switch (this.reporteSeleccionado) {
        case 'ventas_cliente':
          return 'Cliente';
        case 'ventas_cajero':
          return 'Cajero';
        case 'ventas_sucursal':
          return 'Sucursal';
        case 'ventas_empleado':
          return 'Empleado';
        default:
          return '';
      }
    },

    valorFiltro: {
      get() {
        return this.filtros[this.reporteSeleccionado.split('_')[1]];
      },
      set(value) {
        const tipo = this.reporteSeleccionado.split('_')[1];
        this.filtros[tipo] = value;
      }
    },

    watch: {
      reporteSeleccionado() {
        // Resetear el valor del filtro cuando cambia el tipo de reporte
        this.valorFiltro = '';
      }
    },
  },
  methods: {
    setHoy() {
      const hoy = new Date().toISOString().split('T')[0];
      this.filtros.fechaInicio = hoy;
      this.filtros.fechaFin = hoy;
      this.errorFecha = false;
    },

    handleHeaderFooterSave(config) {
      this.headerFooterConfig = config;
      console.log('Configuración guardada:', config);
      this.showHeaderFooterModal = false;
    },

    ajustarLogo() {
      const img = this.$refs.logoImg;
      if (!img) return;

      const { naturalWidth, naturalHeight } = img;
      const maxSize = 50;
      const aspectRatio = naturalWidth / naturalHeight;

      let newWidth, newHeight;

      if (aspectRatio > 1) {
        // Imagen más ancha que alta
        newWidth = Math.min(maxSize, naturalWidth);
        newHeight = newWidth / aspectRatio;
      } else {
        // Imagen más alta que ancha o cuadrada
        newHeight = Math.min(maxSize, naturalHeight);
        newWidth = newHeight * aspectRatio;
      }

      img.style.width = `${newWidth}px`;
      img.style.height = `${newHeight}px`;
    },

    async cargarDatos() {
      try {
        const [clientes, cajeros, sucursales, empleados] = await Promise.all([
          solicitudes.get('/clientes'),
          solicitudes.get('/cajeros'),
          solicitudes.get('/sucursales'),
          solicitudes.get('/empleados')
        ]);

        this.clientes = clientes.data;
        this.cajeros = cajeros.data;
        this.sucursales = sucursales.data;
        this.empleados = empleados.data;
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    },

    async generarReporte(formato = 'preview') {
      if (!this.fechasValidas) {
        alert('Por favor seleccione un intervalo de fechas válido');
        return;
      }

      try {
        if (formato === 'pdf') {
          this.exportarPDF();
          return;
        }

        const response = await solicitudes.post('/reportes/ventas', {
          ...this.filtros,
          tipo: this.reporteSeleccionado,
          formato
        });

        if (formato === 'preview') {
          this.datosReporte = response.data.datos;
          this.totales = response.data.totales;
        } else if (formato === 'excel') {
          const blob = new Blob([response.data], {
            type: 'application/vnd.ms-excel'
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `reporte_ventas_${this.reporteSeleccionado}.xlsx`;
          link.click();
        }
      } catch (error) {
        console.error('Error al generar reporte:', error);
      }
    },

    async handleLogoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Mantener dimensiones originales hasta cierto límite
          const maxDimension = 200;
          const ratio = img.width / img.height;

          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (ratio > 1) {
              width = maxDimension;
              height = width / ratio;
            } else {
              height = maxDimension;
              width = height * ratio;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Mejor calidad de renderizado
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(img, 0, 0, width, height);

          // Menor compresión = mejor calidad
          const resizedLogo = canvas.toDataURL('image/png', 1.0);

          this.logoUrl = resizedLogo;
          localStorage.setItem('logoEmpresa', resizedLogo);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    calculateLogoDimensions(originalWidth, originalHeight) {
      const targetHeight = 20;
      //const difference = Math.abs(originalWidth - originalHeight);
      const ratio = originalWidth / originalHeight;
      const newWidth = targetHeight * ratio;

      return {
        width: Math.round(newWidth),
        height: targetHeight
      };
    },

    exportarPDF() {
      if (!this.datosReporte.length) {
        console.error('No hay datos disponibles para generar el reporte PDF.');
        return;
      }

      const doc = new jsPDF();
      const margin = 10;

      // Agregar logo
      if (this.logoUrl) {
        const img = new Image();
        img.src = this.logoUrl;

        const dimensions = this.calculateLogoDimensions(img.width, img.height);
        doc.addImage(this.logoUrl, 'PNG', margin, margin, dimensions.width, dimensions.height);
      }

      // Agregar encabezado
      if (this.headerFooterConfig.header.enabled) {
        doc.setFontSize(14);
        doc.text(this.headerFooterConfig.header.text, 105, 20, { align: 'center' });
      }

      // Agregar filtros
      doc.setFontSize(10);
      let y = this.headerFooterConfig.header.enabled ? 30 : 20;
      doc.text(`Período: ${this.filtros.fechaInicio} al ${this.filtros.fechaFin}`, 15, y);
      y += 7;
      doc.text(`Tipo de Reporte: ${this.reporteSeleccionado.replace('_', ' ').toUpperCase()}`, 15, y);

      // Crear tabla
      const headers = [['Fecha', 'Factura', 'Valor Exonerado', 'Valor Exento', 'Valor Gravado', 'ISV', 'Total']];

      const data = this.datosReporte.map(item => [
        this.formatearFecha(item.fecha),
        item.factura,
        this.formatearMoneda(item.valorExonerado),
        this.formatearMoneda(item.valorExento),
        this.formatearMoneda(item.valorGravado),
        this.formatearMoneda(item.isv),
        this.formatearMoneda(item.total)
      ]);

      doc.autoTable({
        head: headers,
        body: data,
        startY: this.headerFooterConfig.header.enabled ? 50 : 40,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [0, 123, 255],
          textColor: [255, 255, 255]
        }
      });

      // Agregar pie de página
      if (this.headerFooterConfig.footer.enabled) {
        const finalY = doc.previousAutoTable.finalY + 10;
        const fecha = new Date().toLocaleDateString();
        const footerText = this.headerFooterConfig.footer.text.replace('{FECHA}', fecha);
        doc.setFontSize(10);
        doc.text(footerText, 15, finalY, { maxWidth: 180 });
      }

      // Guardar PDF
      doc.save(`reporte_ventas_${this.reporteSeleccionado}.pdf`);
    },

    formatearFecha(fecha) {
      return new Date(fecha).toLocaleDateString();
    },

    formatearMoneda(valor) {
      return new Intl.NumberFormat('es-HN', {
        style: 'currency',
        currency: 'HNL'
      }).format(valor);
    }
  },

  validarFechas() {
    if (this.filtros.fechaInicio && this.filtros.fechaFin) {
      if (new Date(this.filtros.fechaFin) < new Date(this.filtros.fechaInicio)) {
        this.errorFecha = true;
        this.filtros.fechaFin = this.filtros.fechaInicio;
      } else {
        this.errorFecha = false;
      }
    }
  },

  mounted() {
    this.cargarDatos();
  }
}
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
  padding: 2rem;
  border-radius: 0;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

.report-header {
  width: 100%;
  padding: 20px 0;
}

.report-title {
  font-size: 24px;
  margin: 0;
  margin-left: 20px;
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

.buttons-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.header-footer-btn {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.header-footer-btn:hover {
  background-color: #0056b3;
}

/* Dark mode */
.dark .header-footer-btn {
  background-color: #004c77;
}

.dark .header-footer-btn:hover {
  background-color: #003658;
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

.report-wrapper {
  padding: 16px;
  width: 100%;
  overflow-x: hidden;
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

.logo-container {
  width: 150px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  flex-shrink: 0;
}

.company-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-and-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.cambiar-logo-btn {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filters-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-row {
  display: flex;
  gap: 2rem;
}

.filter-group {
  flex: 1;
}

.date-group {
  width: 100%;
}

.date-field {
  position: relative;
}

.date-inputs {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.date-field {
  flex: 1;
}


.date-buttons {
  margin-bottom: 8px;
}

.date-btn {
  padding: 4px 12px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.date-btn:hover {
  background-color: #5a6268;
}

.dark .date-btn {
  background-color: #4a4a4a;
}

.dark .date-btn:hover {
  background-color: #363636;
}

/* Deshabilitar botones */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-section {
  margin-bottom: 2rem;
}

.hoy-btn {
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.upload-container {
  display: flex;
  align-items: center;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}


.select-input,
input[type="date"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.upload-label {
  cursor: pointer;
}

.upload-button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.hidden-input {
  display: none;
}

.select-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

/* Dark mode additions */
/* Dark mode styles */
.dark .cambiar-logo-btn {
  background-color: #004c77;
}

.dark .hoy-btn {
  background-color: #4a4a4a;
}

.dark .select-input,
.dark input[type="date"] {
  background-color: #2d2d2d;
  color: white;
  border-color: #404040;
}

.dark .upload-button {
  background-color: #004c77;
}

.dark .select-input {
  background-color: #2d2d2d;
  color: white;
  border-color: #404040;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.upload-container {
  display: flex;
  align-items: center;
}

.upload-label {
  cursor: pointer;
}

.upload-button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-button:hover {
  background-color: #0056b3;
}

.hidden-input {
  display: none;
}

.select-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

/* Dark mode styles */
.dark .upload-button {
  background-color: #004c77;
}

.dark .select-input {
  background-color: #2d2d2d;
  color: white;
  border-color: #404040;
}
</style>
