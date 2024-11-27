<template>
  <div class="report-wrapper">
    <PageHeader :titulo="titulo" />

    <div class="report-body">
      <!-- Create a flex container for the main content -->
      <div class="main-content">
        <!-- Left side - Filters -->
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
              <button @click="showHeaderFooterModal = true" class="header-footer-btn">
                Configurar Header/Footer
              </button>
              <!-- Botones -->
              <div class="button-group">
                <button @click="generarReporte('pdf')" class="btn pdf-btn" :disabled="!fechasValidas">PDF</button>
                <button @click="generarReporte('excel')" class="btn excel-btn" :disabled="!fechasValidas">EXCEL</button>
                <button @click="generarReporte('preview')" class="btn generate-btn"
                  :disabled="!fechasValidas">Generar</button>
              </div>
            </div>
          </div>
        </div>


        <div class="controls-section">
          <div class="buttons-container">
          </div>
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
            <input type="file" ref="fileInput" @change="handleFileChange" accept="image/jpeg,image/jpg,image/webp"
              class="hidden-input" />
          </div>
        </div>
      </div>
      <HeaderFooterDesigner v-model="showHeaderFooterModal" :config="headerFooterConfig"
        @save="handleHeaderFooterSave" />
      <!-- Rest of the content remains the same -->
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
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  components: {
    PageHeader,
    HeaderFooterDesigner
  },
  data() {
    return {
      showHeaderFooterModal: false, // Asegurarse que está definido en data
      titulo: 'Reportería',
      isDragging: false,
      logoUrl: null,
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
          text: 'Reporte de Ventas',
          companyName: '',
          address: '',
          phone: '',
          email: ''
        },
        footer: {
          enabled: true,
          template: 'basic',
          customText: 'Generado el {FECHA}',
          alignment: 'center'
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
      const maxSize = 30;
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

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    handleDrop(e) {
      this.isDragging = false;
      const file = e.dataTransfer.files[0];
      if (file) {
        this.processFile(file);
      }
    },

    handleFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.processFile(file);
      }
    },

    processFile(file) {
      if (!file.type.match('image/jpeg|image/jpg|image/webp|image/png')) {
        alert('Por favor selecciona un archivo JPEG, JPG o WebP');
        return;
      }

      if (file.size > 40 * 1024 * 1024) {
        alert('El archivo debe ser menor a 40 MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoUrl = e.target.result; // Asignar directamente a logoUrl
        localStorage.setItem('logoEmpresa', e.target.result);
      };
      reader.readAsDataURL(file);
    },

    removeImage() {
      this.logoUrl = null;
      localStorage.removeItem('logoEmpresa');
    },

    onDragLeave(e) {
      // Verifica si el cursor salió realmente del contenedor
      if (!e.relatedTarget || !this.$el.contains(e.relatedTarget)) {
        this.isDragging = false;
      }
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

    // Función para obtener las dimensiones reales de la imagen
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

    // Función modificada para exportar PDF
    async exportarPDF() {
      if (!this.datosReporte.length) {
        console.error('No hay datos disponibles para generar el reporte PDF.');
        return;
      }

      // Configuración inicial del documento
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Definir márgenes y dimensiones
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      };

      let currentY = margin.top;

      // Agregar logo con dimensiones calculadas
      if (this.logoUrl) {
        try {
          const maxLogoWidth = 30;
          const maxLogoHeight = 30;

          const originalDimensions = await this.getImageDimensions(this.logoUrl);
          const dimensions = this.calculateDimensions(
            originalDimensions.width,
            originalDimensions.height,
            maxLogoWidth,
            maxLogoHeight
          );

          // Logo a la izquierda
          doc.addImage(
            this.logoUrl,
            'PNG',
            margin.left,
            currentY,
            dimensions.width,
            dimensions.height
          );

          // Ajustar el espacio para el texto del encabezado
          const logoOffset = dimensions.width + 10;

          // Nombre de la empresa y datos centrados a la derecha del logo
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          const companyName = this.headerFooterConfig.header.companyName || 'Nombre de la Empresa';
          doc.text(companyName, (pageWidth + logoOffset) / 2, currentY + 8, { align: 'center' });

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const address = this.headerFooterConfig.header.address || 'Dirección de la empresa';
          doc.text(address, (pageWidth + logoOffset) / 2, currentY + 14, { align: 'center' });

          const phone = this.headerFooterConfig.header.phone || 'Teléfono: (XXX)XXX-XXXX';
          doc.text(phone, (pageWidth + logoOffset) / 2, currentY + 20, { align: 'center' });

          currentY += dimensions.height + 15;
        } catch (error) {
          console.error('Error al procesar el logo:', error);
          currentY += 30; // Espacio por si falla el logo
        }
      }

      // Dibujar marco para el título
      const titleText = this.headerFooterConfig.header.text || 'Reporte de Ventas';
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);

      // Calcular dimensiones del marco
      doc.setFontSize(14);
      const titleWidth = doc.getTextWidth(titleText);
      const frameWidth = titleWidth + 20;
      const frameHeight = 10;
      const frameX = (pageWidth - frameWidth) / 2;

      // Dibujar el marco
      doc.rect(frameX, currentY, frameWidth, frameHeight);

      // Agregar el título centrado dentro del marco
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(titleText, pageWidth / 2, currentY + 7, { align: 'center' });

      currentY += frameHeight + 10;

      // Metadata del reporte
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      // Información del filtro (similar al "Empleado:" en tu ejemplo)
      const filterLabel = this.getFilterLabel();
      const filterValue = this.getFilterValue();
      if (filterLabel && filterValue) {
        doc.text(`${filterLabel}: ${filterValue}`, margin.left, currentY);
        currentY += 7;
      }

      // Agregar línea separadora
      doc.setDrawColor(0);
      doc.setLineWidth(0.1);
      doc.line(margin.left, currentY, pageWidth - margin.right, currentY);
      currentY += 5;

      // Configurar tabla con estilo más simple
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
        startY: currentY,
        margin: { left: margin.left, right: margin.right },
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 28, halign: 'right' },
          3: { cellWidth: 28, halign: 'right' },
          4: { cellWidth: 28, halign: 'right' },
          5: { cellWidth: 25, halign: 'right' },
          6: { cellWidth: 25, halign: 'right' }
        },

        didDrawPage: (data) => {
          if (this.headerFooterConfig?.footer?.enabled) {
            const footerY = pageHeight - 15;
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');

            let footerText = '';
            const now = new Date();
            const fecha = now.toLocaleDateString();
            const totalPages = doc.internal.getNumberOfPages();

            // Usar el texto personalizado si está en modo personalizado
            if (this.headerFooterConfig.footer.template === 'custom') {
              footerText = this.headerFooterConfig.footer.customText
                .replace('{FECHA}', fecha)
                .replace('{TOTAL_PAGINAS}', totalPages)
                .replace('{PAGINA}', data.pageNumber);
            } else if (this.headerFooterConfig.footer.template === 'basic') {
              footerText = `Generado el ${fecha}`;
            } else if (this.headerFooterConfig.footer.template === 'detailed') {
              const hora = now.toLocaleTimeString();
              footerText = `Generado el ${fecha} a las ${hora}`;
            }

            // Determinar la posición X según la alineación
            let x;
            const alignment = this.headerFooterConfig.footer.alignment;

            switch (alignment) {
              case 'left':
                x = margin.left;
                break;
              case 'right':
                x = pageWidth - margin.right;
                break;
              case 'center':
              default:
                x = pageWidth / 2;
                break;
            }

            // Añadir el texto del pie de página con la alineación correspondiente
            doc.text(footerText, x, footerY, { align: alignment });
          }
        }

      });

      // Guardar PDF
      const fileName = `reporte_${this.reporteSeleccionado}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    },

    // Métodos auxiliares
    getFilterLabel() {
      switch (this.reporteSeleccionado) {
        case 'ventas_cliente': return 'Cliente';
        case 'ventas_cajero': return 'Cajero';
        case 'ventas_sucursal': return 'Sucursal';
        case 'ventas_empleado': return 'Empleado';
        default: return '';
      }
    },

    getFilterValue() {
      const tipo = this.reporteSeleccionado.split('_')[1];
      return this.filtros[tipo] || 'Todos';
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
</style>
