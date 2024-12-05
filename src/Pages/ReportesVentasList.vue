<template>
  <div class="report-wrapper">
    <ModalLoading :isLoading="isLoading" />
    <PageHeader :titulo="titulo" />

    <div class="report-body">
      <div class="main-content">
        <!-- Sección de filtros -->
        <div class="filters-section">
          <div class="filter-row">
            <div class="filter-group">
              <label>Tipo de Reporte</label>
              <select v-model="reporteSeleccionado" class="select-input">
                <option @click="mostrarReportes" value="ventas_cliente">Ventas por Cliente</option>
                <option @click="mostrarReportes" v-if="esCeo" value="ventas_sucursal">Ventas por Sucursal</option>
                <option @click="mostrarReportes" value="ventas_empleado">Ventas por Empleado</option>

              </select>
            </div>

            <div class="filter-group">
              <label>{{ labelFiltro }}</label>
              <select v-model="valorFiltro" class="select-input">
                <option value="" @click="mostrarReportes">Todos</option>
                <option v-for="opcion in opcionesFiltro" @click="mostrarReporteDesglose(opcion)" :key="opcion.id"
                  :value="opcion.id">
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
              <button @click="openModalHeaderFooter" :datosInstituto="datosBussines" class="header-footer-btn">
                Configurar Header/Footer
              </button>
              <div class="button-group">
                <button @click="generarReporte('pdf')" class="btn pdf-btn"
                  :disabled="!fechasValidas || cargando || !datosReporte.length">PDF</button>
                <button @click="generarReporte('excel')" class="btn excel-btn"
                  :disabled="!fechasValidas || cargando || !datosReporte.length">EXCEL</button>
                <button @click="generarReporte('preview')" class="btn generate-btn"
                  :disabled="!fechasValidas || cargando || !datosReporte.length">
                  {{ cargando ? 'Generando...' : 'Generar' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección de control de logo -->
        <div class="controls-section">
          <div class="image-upload-wrapper">
            <div class="image-drop-area" :class="{ 'dragging': isDragging, 'has-image': logoUrl }"
              @dragenter.prevent="isDragging = true" @dragleave.prevent="onDragLeave" @dragover.prevent
              @drop.prevent="handleDrop">
              <div v-if="isDragging" class="drag-overlay">
                <span>Suelta aquí</span>
              </div>

              <div v-else-if="!logoUrl" class="upload-content">
                <div class="upload-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <h3>Arrastra y suelta una imagen</h3>
                <p class="separator">o</p>
                <button class="upload-button" @click="triggerFileInput">Sube una foto</button>
                <p class="upload-info">El archivo debe ser un JPEG, JPG, PNG o WebP de hasta 40 MB</p>
              </div>

              <div v-else class="preview-content">
                <img v-if="logoUrl" :src="logoUrl" alt="Logo preview" class="preview-image" />
                <div class="image-actions">
                  <button class="remove-button" @click="removeImage">Eliminar imagen</button>
                  <button class="change-button" @click="triggerFileInput">Cambiar imagen</button>
                </div>
              </div>
            </div>
            <input type="file" ref="fileInput" @change="handleFileChange"
              accept="image/jpeg,image/jpg,image/png,image/webp" class="hidden-input" />
          </div>
        </div>
      </div>

      <!-- Mensaje de error si existe -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Modal de Header/Footer -->
      <HeaderFooterDesigner v-model="showHeaderFooterModal" :config="headerFooterConfig"
        @save="handleHeaderFooterSave" />

      <div class="checkbox-container">
        <label class="checkbox-label">
          <input type="checkbox" v-model="especificacion" class="checkbox-input">
          <span class="checkbox-text">Especificación</span>
        </label>
      </div>

      <!-- Tabla de resultados -->
      <div v-if="!cargando && datosReporte.length" class="report-table">
        <div class="table-header"></div>

        <table>
          <thead>
            <tr>
              <th>{{ getColumnTitle }}</th>
              <th>Valor Exento</th>
              <th>Valor Gravado 15%</th>
              <th>Valor Gravado 18%</th>
              <th>ISV</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(grupo, index) in datosAgrupados" :key="index">
              <!-- Fila del grupo/cliente -->
              <tr class="group-header">
                <td><strong>{{ grupo.nombre }}</strong></td>
                <td>{{ formatearMoneda(grupo.valor_exento) }}</td>
                <td>{{ formatearMoneda(grupo.gravado_15) }}</td>
                <td>{{ formatearMoneda(grupo.gravado_18) }}</td>
                <td>{{ formatearMoneda(grupo.total_isv) }}</td>
                <td>{{ formatearMoneda(grupo.total) }}</td>
              </tr>
              <!-- Filas de desglose con números de factura -->
              <template v-if="especificacion">
                <tr v-for="factura in grupo.desglose" :key="factura.id" class="detail-row">
                  <td>{{ factura.numero_factura_sar }}</td>
                  <td>{{ formatearMoneda(factura.valor_exento) }}</td>
                  <td>{{ formatearMoneda(factura.gravado_15) }}</td>
                  <td>{{ formatearMoneda(factura.gravado_18) }}</td>
                  <td>{{ formatearMoneda(factura.total_isv) }}</td>
                  <td>{{ formatearMoneda(factura.total) }}</td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>

        <!-- Totales -->
        <div class="totals">
          <div><strong>Total Exento:</strong> {{ formatearMoneda(totales.exento) }}</div>
          <div><strong>Total Gravado 15%:</strong> {{ formatearMoneda(totales.gravado_15) }}</div>
          <div><strong>Total Gravado 18%:</strong> {{ formatearMoneda(totales.gravado_18) }}</div>
          <div><strong>Total ISV:</strong> {{ formatearMoneda(totales.total_isv) }}</div>
          <div><strong>Total General:</strong> {{ formatearMoneda(totales.total) }}</div>
        </div>
      </div>

      <!-- Mensaje cuando no hay datos -->
      <div v-else-if="!cargando && fechasValidas" class="no-data-message">
        No se encontraron datos para el período seleccionado
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from "@/components/PageHeader.vue";
import { notis } from '../../services/notificaciones.js';
import HeaderFooterDesigner from "@/components/HeaderFooterDesigner.vue";
import ModalLoading from '@/components/ModalLoading.vue';
import solicitudes from "../../services/solicitudes.js";
const { clientesReportes, sucursalReportes, reportesProductos, reportesEmpleados, getRegistrosEmpleados, getRegistrosClientes, getRegistrosSucursales, getRegistrosEmpleadosDesglose, getRegistrosClienteDesglose, getRegistrosSucursalDesglose, getDatosInstitucion } = require('../../services/reporteSolicitudes.js');
const { esCeo } = require('../../services/usuariosSolicitudes');
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default {
  name: 'ReporteVentas',
  components: {
    PageHeader,
    HeaderFooterDesigner,
    ModalLoading
  },
  data() {
    return {
      titulo: 'Reportería',
      isLoading: false,
      id_usuario: '',
      mostrandoDesglose: false,
      cargando: false,
      esCeo: false,
      error: null,
      isDragging: false,
      especificacion: false,
      logoUrl: null,
      reporteSeleccionado: 'ventas_cliente',
      showHeaderFooterModal: false,
      datosBussines: [],
      filtros: {
        fechaInicio: '',
        fechaFin: '',
        valorFiltro: ''
      },
      headerFooterConfig: {
        header: {
          enabled: true,
          text: 'Reporte de Ventas',
          companyName: '',
          address: '',
          phone: '',
          email: '',
          showDivider: false  // añadido
        },
        footer: {
          enabled: true,
          template: 'basic',
          customText: 'Generado el {FECHA}',
          alignment: 'center',
          showDivider: false  // añadido
        }
      },
      clientes: [],
      sucursales: [],
      empleados: [],
      productos: [],
      datosReporte: [], // Base data
      datosAgrupados: [],
      desglosesCache: {}, // Cache for desglose data
      reportes: [],
      totales: {
        exento: 0,
        gravado_15: 0,
        gravado_18: 0,
        total_isv: 0,
        total: 0
      }
    }
  },

  computed: {
    getColumnTitle() {
      if (this.especificacion) return 'Código Factura';
      switch (this.reporteSeleccionado) {
        case 'ventas_cliente': return 'Clientes';
        case 'ventas_sucursal': return 'Sucursales';
        case 'ventas_empleado': return 'Empleados';
        default: return '';
      }
    },

    fechasValidas() {
      return this.filtros.fechaInicio && this.filtros.fechaFin &&
        new Date(this.filtros.fechaFin) >= new Date(this.filtros.fechaInicio);
    },

    opcionesFiltro() {
      switch (this.reporteSeleccionado) {
        case 'ventas_cliente':
          return this.clientes;
        case 'ventas_sucursal':
          return this.sucursales;
        case 'ventas_empleado':
          return this.empleados;
        case 'ventas_producto':
          return this.productos;
        default:
          return [];
      }
    },

    labelFiltro() {
      switch (this.reporteSeleccionado) {
        case 'ventas_cliente':
          return 'Cliente';
        case 'ventas_sucursal':
          return 'Sucursal';
        case 'ventas_empleado':
          return 'Empleado';
        case 'ventas_producto':
          return 'Producto';
        default:
          return '';
      }
    },

    valorFiltro: {
      get() {
        return this.filtros.valorFiltro;
      },
      set(value) {
        this.filtros.valorFiltro = value;
      }
    }
  },

  methods: {
    async cargarDatos() {
      try {
        this.cargando = true;
        const [clientes, empleados, productos] = await Promise.all([
          clientesReportes(this.id_usuario),
          reportesEmpleados(this.id_usuario, this.esCeo),
          reportesProductos(this.id_usuario, this.esCeo)
        ]);

        this.clientes = clientes;

        this.empleados = empleados;
        this.productos = productos;

        if (this.esCeo) {
          this.sucursales = await sucursalReportes(this.id_usuario);
        }

      } catch (error) {
        console.error('Error al cargar datos:', error);
        this.error = 'Error al cargar los datos de filtros';
      } finally {
        this.cargando = false;
      }
    },

    reiniciarTotales() {
      this.totales = {
        exento: 0,
        gravado_15: 0,
        gravado_18: 0,
        total_isv: 0,
        total: 0
      }
    },

    async mostrarReporteDesglose(option) {
      if (!this.fechasValidas) return;

      try {
        let response;
        this.cargando = true;

        switch (this.reporteSeleccionado) {
          case 'ventas_empleado':
            response = option.id ?
              await getRegistrosEmpleadosDesglose(option.id, this.filtros.fechaInicio, this.filtros.fechaFin) :
              await getRegistrosEmpleados(this.id_usuario, this.filtros.fechaInicio, this.filtros.fechaFin);
            break;

          case 'ventas_cliente':
            response = option.id ?
              await getRegistrosClienteDesglose(option.id, this.filtros.fechaInicio, this.filtros.fechaFin) :
              await getRegistrosClientes(this.id_usuario, this.filtros.fechaInicio, this.filtros.fechaFin);
            break;

          case 'ventas_sucursal':
            response = option.id ?
              await getRegistrosSucursalDesglose(option.id, this.filtros.fechaInicio, this.filtros.fechaFin) :
              await getRegistrosSucursales(this.id_usuario, this.filtros.fechaInicio, this.filtros.fechaFin);
            break;
        }

        this.datosReporte = response;
        this.calcularTotales(response);

      } catch (error) {
        console.error(error);
        notis('error', 'Error al cargar datos. Intente de nuevo');
      } finally {
        this.cargando = false;
      }
    },

    calcularTotales(datos) {
      this.totales = datos.reduce((acc, curr) => ({
        exento: acc.exento + (curr.valor_extento || 0),
        gravado_15: acc.gravado_15 + (curr.gravado_15 || 0),
        gravado_18: acc.gravado_18 + (curr.gravado_18 || 0),
        total_isv: acc.total_isv + (curr.total_isv || 0),
        total: acc.total + (curr.total || 0)
      }), {
        exento: 0,
        gravado_15: 0,
        gravado_18: 0,
        total_isv: 0,
        total: 0
      });
    },

    async openModalHeaderFooter() {
      this.showHeaderFooterModal = true;
    },

    async mostrarReportes() {
      if (!this.fechasValidas) return;

      try {
        this.cargando = true;
        this.error = null;
        let response;

        switch (this.reporteSeleccionado) {
          case 'ventas_empleado':
            response = await getRegistrosEmpleados(this.id_usuario, this.filtros.fechaInicio, this.filtros.fechaFin);
            break;
          case 'ventas_cliente':
            response = await getRegistrosClientes(this.id_usuario, this.filtros.fechaInicio, this.filtros.fechaFin);
            break;
          case 'ventas_sucursal':
            response = await getRegistrosSucursales(this.id_usuario, this.filtros.fechaInicio, this.filtros.fechaFin);
            break;
        }

        if (this.especificacion) {
          // Get desglose for each record
          const desglosesPromises = response.map(async (item) => {
            let desglose;
            try {
              switch (this.reporteSeleccionado) {
                case 'ventas_empleado':
                  desglose = await getRegistrosEmpleadosDesglose(item.id, this.filtros.fechaInicio, this.filtros.fechaFin);
                  break;
                case 'ventas_cliente':
                  desglose = await getRegistrosClienteDesglose(item.id, this.filtros.fechaInicio, this.filtros.fechaFin);
                  break;
                case 'ventas_sucursal':
                  desglose = await getRegistrosSucursalDesglose(item.id, this.filtros.fechaInicio, this.filtros.fechaFin);
                  break;
              }
              return {
                ...item,
                desglose: desglose || []
              };
            } catch (error) {
              console.error(`Error getting desglose for ${item.nombre}:`, error);
              return {
                ...item,
                desglose: []
              };
            }
          });

          this.datosAgrupados = await Promise.all(desglosesPromises);
        } else {
          this.datosAgrupados = response.map(item => ({
            ...item,
            desglose: []
          }));
        }

        this.datosReporte = response;
        this.calcularTotales(response);
      } catch (error) {
        console.error('Error al cargar reportes:', error);
        this.error = 'Error al cargar los datos del reporte';
        notis('error', 'Error al cargar datos');
      } finally {
        this.cargando = false;
      }
    },

    async generarReporte(formato = 'preview') {

      if (!this.fechasValidas) {
        alert('Por favor seleccione un intervalo de fechas válido');
        console.log(formato);
        return;
      }

      console.log(formato);

      this.cargando = true;
      this.error = null;

      this.isLoading = true;
      try {
        if (formato === 'preview') {
          const response = await solicitudes.obtenerReporteVentas({
            reporteSeleccionado: this.reporteSeleccionado,
            fechaInicio: this.filtros.fechaInicio,
            fechaFin: this.filtros.fechaFin,
            valorFiltro: this.valorFiltro
          });

          this.datosReporte = response.datos;
          this.totales = response.totales;
        } else if (formato === 'pdf') {
          await this.exportarPDF();
          notis('success', 'PDF generado con éxito');
        } else if (formato === 'excel') {
          await this.exportarExcel();
        }
      } catch (error) {
        // Solo mostrar error si realmente falla algo
        if (!this.datosAgrupados.length) {
          notis('error', 'Error al generar el reporte');
          this.error = 'Error al generar el reporte';
        }
      } finally {
        this.cargando = false;
        this.isLoading = false;
      }
    },

    setHoy() {
      const hoy = new Date().toISOString().split('T')[0];
      this.filtros.fechaInicio = hoy;
      this.filtros.fechaFin = hoy;
    },

    validarFechas() {
      if (this.filtros.fechaInicio && this.filtros.fechaFin) {
        if (new Date(this.filtros.fechaFin) < new Date(this.filtros.fechaInicio)) {
          this.filtros.fechaFin = this.filtros.fechaInicio;
        }
      }
    },

    formatearFecha(fecha) {
      return new Date(fecha).toLocaleDateString('es-HN');
    },

    formatearMoneda(valor) {
      return new Intl.NumberFormat('es-HN', {
        style: 'currency',
        currency: 'HNL'
      }).format(valor || 0);
    },

    // Métodos para manejo de imagen
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    handleFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.processFile(file);
      }
    },

    handleDrop(e) {
      this.isDragging = false;
      const file = e.dataTransfer.files[0];
      if (file) {
        this.processFile(file);
      }
    },

    processFile(file) {
      if (!file.type.match('image/jpeg|image/jpg|image/png|image/webp')) {
        alert('Por favor selecciona un archivo JPEG, JPG, PNG o WebP');
        return;
      }

      if (file.size > 40 * 1024 * 1024) {
        alert('El archivo debe ser menor a 40 MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoUrl = e.target.result;
        localStorage.setItem('logoEmpresa', e.target.result);
      };
      reader.readAsDataURL(file);
    },

    removeImage() {
      this.logoUrl = null;
      localStorage.removeItem('logoEmpresa');
    },

    onDragLeave(e) {
      if (!e.relatedTarget || !this.$el.contains(e.relatedTarget)) {
        this.isDragging = false;
      }
    },

    // ... continuación de los métodos

    handleHeaderFooterSave(config) {
      this.headerFooterConfig = config;
      this.showHeaderFooterModal = false;
    },

    async getImageDimensions(imageUrl) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height
          });
        };
        img.src = imageUrl;
      });
    },

    calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
      if (!originalWidth || !originalHeight) {
        return {
          width: maxWidth || 30,
          height: maxHeight || 30
        };
      }

      const ratio = originalWidth / originalHeight;
      let newWidth = originalWidth;
      let newHeight = originalHeight;

      if (ratio > 1) {
        newWidth = maxWidth;
        newHeight = maxWidth / ratio;

        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = maxHeight * ratio;
        }
      } else {
        newHeight = maxHeight;
        newWidth = maxHeight * ratio;

        if (newWidth > maxWidth) {
          newWidth = maxWidth;
          newHeight = maxWidth / ratio;
        }
      }

      return {
        width: newWidth,
        height: newHeight
      };
    },

    async exportarPDF() {
      if (!this.datosAgrupados.length) return;

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = { top: 20, right: 20, bottom: 20, left: 20 };
      let currentY = margin.top;

      // Add logo and header
      if (this.logoUrl) {
        const dimensions = await this.getImageDimensions(this.logoUrl);
        const { width: logoWidth, height: logoHeight } = this.calculateDimensions(
          dimensions.width,
          dimensions.height,
          40,
          40
        );
        doc.addImage(this.logoUrl, 'PNG', margin.left, currentY, logoWidth, logoHeight);

        if (this.headerFooterConfig.header.enabled) {
          const headerX = margin.left + logoWidth + 10;
          doc.setFontSize(16);
          doc.text(this.headerFooterConfig.header.companyName, headerX, currentY + 7);

          doc.setFontSize(11);
          doc.text("Dirección: " + this.headerFooterConfig.header.address, headerX, currentY + 14);
          doc.text("Teléfono: " + this.headerFooterConfig.header.phone, headerX, currentY + 21);
          doc.text("Correo: " + this.headerFooterConfig.header.email, headerX, currentY + 28);

          currentY += Math.max(logoHeight, 35);
        }
      }

      // Add report title and period
      doc.setFontSize(14);
      doc.text('Reporte de Ventas', margin.left, currentY + 10);
      // Añade el texto del período en cursiva
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic'); // Cambia a cursiva


      if (this.headerFooterConfig.header.showDivider) {
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(margin.left, currentY + 12, pageWidth - margin.right, currentY + 12);
        currentY + 3; // Espacio más reducido después de la línea
      }

      doc.text(
        `Período: ${this.formatearFecha(this.filtros.fechaInicio)} - ${this.formatearFecha(this.filtros.fechaFin)}`,
        margin.left,
        currentY + 20
      );
      doc.setFont('helvetica', 'normal'); // Regresa a normal para el resto del documento
      currentY += 25;

      // Prepare table data
      const tableData = [];
      this.datosAgrupados.forEach(grupo => {
        // Add group header
        tableData.push([
          grupo.nombre,
          this.formatearMoneda(grupo.valor_exento),
          this.formatearMoneda(grupo.gravado_15),
          this.formatearMoneda(grupo.gravado_18),
          this.formatearMoneda(grupo.total_isv),
          this.formatearMoneda(grupo.total)
        ]);

        // Add details if especificacion is enabled
        if (this.especificacion && grupo.desglose) {
          grupo.desglose.forEach(factura => {
            tableData.push([
              factura.numero_factura_sar,
              this.formatearMoneda(factura.valor_exento),
              this.formatearMoneda(factura.gravado_15),
              this.formatearMoneda(factura.gravado_18),
              this.formatearMoneda(factura.total_isv),
              this.formatearMoneda(factura.total)
            ]);
          });
        }
      });

      // Add table
      // En autoTable, elimina la sección didDrawPage
      doc.autoTable({
        startY: currentY,
        head: [[
          this.getColumnTitle,
          'Valor Exento',
          'Valor Gravado 15%',
          'Valor Gravado 18%',
          'ISV',
          'Total'
        ]],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto', halign: 'right' },
          2: { cellWidth: 'auto', halign: 'right' },
          3: { cellWidth: 'auto', halign: 'right' },
          4: { cellWidth: 'auto', halign: 'right' },
          5: { cellWidth: 'auto', halign: 'right' }
        },
        margin: { ...margin, bottom: 20 }
      });

      // Add totals
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');

      const totalesTexts = [
        `Total Exento: ${this.formatearMoneda(this.totales.exento)}`,
        `Total Gravado 15%: ${this.formatearMoneda(this.totales.gravado_15)}`,
        `Total Gravado 18%: ${this.formatearMoneda(this.totales.gravado_18)}`,
        `Total ISV: ${this.formatearMoneda(this.totales.total_isv)}`,
        `Total General: ${this.formatearMoneda(this.totales.total)}`
      ];

      totalesTexts.forEach((text, index) => {
        doc.text(text, pageWidth - margin.right, finalY + (index * 5), { align: 'right' });
      });

      // Add footer if enabled
      if (this.headerFooterConfig.footer.enabled) {
        const footerY = pageHeight - margin.bottom;
        if (this.headerFooterConfig.footer.showDivider) {
          doc.setDrawColor(0);
          doc.setLineWidth(0.5);
          doc.line(margin.left, footerY - 10, pageWidth - margin.right, footerY - 10);
        }

        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        const footerText = this.getFooterText(doc.internal.getNumberOfPages(), doc.internal.getNumberOfPages());

        doc.text(
          footerText,
          this.headerFooterConfig.footer.alignment === 'left' ? margin.left :
            this.headerFooterConfig.footer.alignment === 'right' ? pageWidth - margin.right :
              pageWidth / 2,
          footerY - 5,
          { align: this.headerFooterConfig.footer.alignment }
        );
      }

      doc.save(`reporte_${this.reporteSeleccionado}_${this.filtros.fechaInicio}.pdf`);
    },

    getFooterText(currentPage, totalPages) {
      const now = new Date();
      const fecha = now.toLocaleDateString();
      const hora = now.toLocaleTimeString();

      switch (this.headerFooterConfig.footer.template) {
        case 'basic':
          return `Generado el ${fecha}`;
        case 'detailed':
          return `Generado el ${fecha} a las ${hora}`;
        case 'custom':
          return this.headerFooterConfig.footer.customText
            .replace('{FECHA}', fecha)
            .replace('{HORA}', hora)
            .replace('{PAGINA}', currentPage)
            .replace('{TOTAL_PAGINAS}', totalPages);
        default:
          return `Generado el ${fecha}`;
      }
    },

    async exportarExcel() {

    }
  },

  async mounted() {
    // Cargar logo guardado si existe
    this.isLoading = true;
    try {
      const savedLogo = localStorage.getItem('logoEmpresa');
      if (savedLogo) {
        this.logoUrl = savedLogo;
      }
      this.id_usuario = await solicitudes.solicitarUsuarioToken();
      this.esCeo = await esCeo(this.id_usuario);

      // Cargar datos iniciales
      await this.cargarDatos();

      try {
        // Obtener los datos de la empresa o sucursal
        const response = await getDatosInstitucion(this.id_usuario, this.esCeo);
        this.datosBussines = response;

        // Llenar los campos del header/footer config
        this.headerFooterConfig.header.companyName = this.datosBussines.nombre;
        this.headerFooterConfig.header.address = this.datosBussines.direccion;
        this.headerFooterConfig.header.phone = this.datosBussines.telefono;
        this.headerFooterConfig.header.email = this.datosBussines.correo;
      } catch (error) {
        notis('error', 'Error al cargar datos de empresa');
      }

      // Si hay fechas por defecto, generar el reporte
      if (this.fechasValidas) {
        await this.generarReporte('preview');
      }
    } catch (error) {
      console.log(error);
      notis('error', 'Error al cargar datos. Intente de nuevo');
    } finally {
      this.isLoading = false;
    }

  },

  watch: {
    reporteSeleccionado() {
      if (this.valorFiltro !== '') {
        this.especificacion = true;
      } else {
        this.especificacion = false;
      }
      if (this.fechasValidas) {
        this.generarReporte('preview');
      }
    },

    valorFiltro: {
      handler(newValue) {
        if (newValue !== '') {
          this.mostrarReporteDesglose({ id: newValue });
        } else {
          this.mostrarReportes();
        }
      },
      immediate: true
    },

    especificacion: {
      immediate: true,
      async handler() {
        try {
          if (this.fechasValidas && this.datosReporte.length > 0) {
            this.cargando = true;
            // Si especificacion está activo, cargar los desgloses
            if (this.especificacion) {
              const desglosesPromises = this.datosReporte.map(async (item) => {
                try {
                  let desglose;
                  switch (this.reporteSeleccionado) {
                    case 'ventas_empleado':
                      desglose = await getRegistrosEmpleadosDesglose(
                        item.id,
                        this.filtros.fechaInicio,
                        this.filtros.fechaFin
                      );
                      break;
                    case 'ventas_cliente':
                      desglose = await getRegistrosClienteDesglose(
                        item.id,
                        this.filtros.fechaInicio,
                        this.filtros.fechaFin
                      );
                      break;
                    case 'ventas_sucursal':
                      desglose = await getRegistrosSucursalDesglose(
                        item.id,
                        this.filtros.fechaInicio,
                        this.filtros.fechaFin
                      );
                      break;
                    default:
                      desglose = [];
                  }
                  return {
                    ...item,
                    desglose: desglose || []
                  };
                } catch (error) {
                  console.error(`Error al obtener desglose para ${item.nombre}:`, error);
                  return {
                    ...item,
                    desglose: []
                  };
                }
              });

              this.datosAgrupados = await Promise.all(desglosesPromises);
            } else {
              // Si especificacion está inactivo, usar los datos base sin desglose
              this.datosAgrupados = this.datosReporte.map(item => ({
                ...item,
                desglose: []
              }));
            }
          }
        } catch (error) {
          console.error('Error al actualizar los datos:', error);
          notis('error', 'Error al cargar los detalles');
        } finally {
          this.cargando = false;
        }
      }
    }
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

.main-content {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  margin: 2rem 0;
  min-height: 300px;
}

.filters-section,
.controls-section {
  width: 45%;
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
  flex-direction: column;
  align-items: center;
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

.header-footer-btn {
  padding: 0.5rem 1rem;
  margin-top: 1rem;
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

.report-body {
  margin-top: 2rem;
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

.controls-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Update existing styles */
.filters-section {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.logo-container {
  margin-top: 1rem;
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ddd;
  border-radius: 4px;
}

.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-button,
.header-footer-btn {
  width: 100%;
  text-align: center;
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
  width: 45%;
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
  background-color: #4a90e2;
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
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

.image-upload-wrapper {
  height: 100%;
  margin-top: 2rem;
}

.image-drop-area {
  height: 100%;
  min-height: 200px;
  padding: 1rem;
  border: 2px dashed #ccc;
  position: relative;
  display: flex;
  align-items: top;
  justify-content: center;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.image-drop-area:hover {
  border-color: #4a90e2;
  background: #f0f4f8;
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(74, 144, 226, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 8px;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  margin-top: 2rem;
}

.upload-icon {
  color: #666;
}

.upload-button {
  background-color: #4a90e2;
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.upload-button:hover {
  background-color: #357abd;
}

.upload-info {
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.separator {
  margin: 0.25rem 0;
  color: #666;
}

.benefits {
  display: flex;
  gap: 1.5rem;
  color: #666;
  font-size: 0.875rem;
}

.benefits span {
  color: #4a90e2;
}

.preview-content {
  position: relative;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  align-items: center;
}

.image-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.remove-button,
.change-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.remove-button {
  background-color: #dc3545;
  color: white;
}

.change-button {
  background-color: #4a90e2;
  color: white;
}

.remove-button:hover {
  background-color: #c82333;
}

.change-button:hover {
  background-color: #357abd;
}

.hidden-input {
  display: none;
}

/* Dark mode */
.dark .image-drop-area {
  background: #2d2d2d;
  border-color: #404040;
}

.dark .upload-icon,
.dark .separator,
.dark .upload-info {
  color: #999;
}

.group-header {
  background-color: #f5f5f5;
  font-weight: bold;
}

.detail-row {
  background-color: #ffffff;
}

.dark .group-header {
  background-color: #2d2d2d;
}

.dark .detail-row {
  background-color: #1e1e1e;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: fit-content;
}

.checkbox-input {
  cursor: pointer;
  margin: 0;
}

.checkbox-text {
  user-select: none;
}
</style>
