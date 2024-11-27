<template>
  <div class="productos-wrapper">
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <div class="action-bar">
        <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">
          Agregar Producto
        </button>
      </div>

      <!-- Botón de exportación PDF -->
      <ExportButton :columns="columns" :rows="rows" fileName="Productos.pdf" class="export-button" />

      <RouterLink to="promociones-producto">
        <button class="button-promocion">Promociones</button>
      </RouterLink>

      <div class="registros">
        <span>Mostrar
          <select v-model="itemsPerPage" class="custom-select">
            <option value="">Todos</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="25">25</option>
          </select> registros
        </span>
      </div>

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar producto..." />
      </div>
      <div class="registros">
        <span>
          <select class="custom-select select-sucursal" v-model="searchSucursal" v-show="(sucursales.length > 1)"
            @change="mostrarRegistros(searchSucursal)">
            <option value="default">Todas</option>
            <option v-for="(sucursal, index) in this.sucursales" :key="index" :value="sucursal.id_sucursal">{{
              sucursal.nombre_administrativo }}</option>

          </select>
        </span>
      </div>
    </div>
    <!-- Tabla exportable -->
    <div class="table-container" v-pdf-export ref="table">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Codigo</th>
            <th>Nombre</th>
            <th>Stock</th>
            <th>Precio Unitario</th>
            <th>Promocion Activa</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(producto, index) in paginatedProductos" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ producto.codigo_producto }}</td>
            <td>{{ producto.nombre }}</td>
            <td>{{ producto.stock_actual }} <button class="edit-stock" @click="openModalStock(producto)"><i
                  class="bi bi-pencil-square"></i></button> </td>
            <td>{{ producto.precio_unitario }}</td>
            <td>Inactivo</td>
            <td>
              <button id="btnEditar" class="btn btn-warning" @click="editProducto(producto, index)">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteProducto(producto)">
                <b><i class="bi bi-x-lg"></i></b>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal" v-if="showConfirmModal">
      <div class="modal-content">
        <h2>Confirmación</h2>
        <p>¿Estás seguro de que quieres eliminar este producto?</p>
        <div class="modal-actions">
          <button class="btn modalShowConfirm-Si" @click="deleteProducto()">
            Sí, eliminar
          </button>
          <button class="btn modalShowConfirm-no" @click="cancelDelete">
            No, regresar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para agregar o editar productos -->
    <div v-if="isModalOpen" class="modal">
      <div class="modal-content modal-producto">
        <div class="modal-header">
          <h2>{{ isEditing ? "Editar Producto" : "Agregar Producto" }}</h2>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <div class="form-group full-width">
              <label>Código único del producto:</label>
              <input v-model="productoForm.codigo_producto" type="text" placeholder="Ingrese el código del producto"
                required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label>Nombre Producto:</label>
              <input v-model="productoForm.nombre" type="text" placeholder="Ingrese el nombre del producto" required />
            </div>
          </div>

          <div class="form-columns">
            <div class="form-column">
              <div class="form-group">
                <label>Descripción:</label>
                <textarea v-model="productoForm.descripcion" placeholder="Ingrese la descripción del producto"
                  required />
              </div>

              <div class="form-group">
                <label>Impuesto:</label>
                <select class="form-select" v-model="productoForm.impuesto">
                  <option value="" disabled>Seleccione un impuesto</option>
                  <option v-for="(impuesto, index) in cargarImpuestos()" :key="index" :value="impuesto.id">
                    {{ impuesto.nombre }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Proveedor:</label>
                <select class="form-select" v-model="productoForm.proveedor">
                  <option value="default" disabled>Seleccione un proveedor</option>
                  <option v-for="(proveedor, index) in proveedoresMostrar" :key="index" :value="proveedor.id">
                    {{ proveedor.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-column">
              <div class="form-group">
                <label>Precio por Unidad:</label>
                <div class="input-icon">
                  <span class="currency-symbol">L.</span>
                  <input v-model="productoForm.precio_unitario" type="number" step="0.01" min="0" placeholder="0.00"
                    required />
                </div>
              </div>

              <div class="form-group">
                <label>Precio por mayoreo:</label>
                <div class="input-icon">
                  <span class="currency-symbol">L.</span>
                  <input v-model="productoForm.precio_mayorista" type="number" step="0.01" min="0" placeholder="0.00"
                    required />
                </div>
              </div>

              <div class="form-group">
                <label>Cantidad activar mayoreo:</label>
                <input v-model="productoForm.cantidad_activar_mayorista" type="number" min="0" placeholder="0"
                  required />
              </div>

              <div class="form-group">
                <label>Unidad de medida:</label>
                <select class="form-select" v-model="productoForm.unidad_medida">
                  <option value="default" disabled>Seleccione una unidad de medida</option>
                  <option v-for="(unidad, index) in unidadesMostrar" :key="index" :value="unidad.id_medida">
                    {{ unidad.medida }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-categoria" @click="openModalCategoria">
            <i class="bi bi-tags"></i>
            Asignar categorías
          </button>
          <div class="action-buttons">
            <button class="btn btn-secondary" @click="closeModal">
              Cancelar
            </button>
            <button class="btn btn-primary" @click="guardarProducto">
              {{ isEditing ? "Guardar Cambios" : "Agregar Producto" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- modal para mostrar categorias -->

    <div v-if="isModalCategoriaOpen" class="modal">
      <div class="modal-content modal-categorias">
        <div class="categoria-header">
          <h3>Selecciona categorías del producto</h3>
          <div class="search-container">
            <input type="text" v-model="searchCategoria" placeholder="Buscar categoría..." class="search-input" />
          </div>
        </div>

        <div class="categorias-container">
          <div class="categorias-grid">
            <label v-for="(categoria, index) in filteredCategorias" :key="index" class="categoria-checkbox">
              <input type="checkbox" v-model="categoriasSeleccionadas" :value="categoria.id_categoria">
              <span class="checkbox-text">{{ categoria.nombre_categoria }}</span>
            </label>
          </div>
        </div>

        <div class="categoria-footer">
          <btnCerrarModal :texto="'Cancelar'" @click="closeModalCategoria" />
          <btnGuardarModal @click="guardarCategorias">
            Guardar
          </btnGuardarModal>
        </div>
      </div>
    </div>

    <!-- modal para editar stocks min y max por sucursal -->

    <div v-if="isModalStockOpen" class="modal">
      <div class="modal-content modal-content-stock">
        <div class="sotck-encabezado">
          <h3>Edite stock min y max por sucursal</h3>
          <div class="search-bar form-group">
          </div>
        </div>
        <form class="form-form-stock">

          <select class="custom-select select-sucursal-stock" @change="mostrarStockbySucursal(searchSucursalStock)"
            v-model="searchSucursalStock" v-show="(sucursales.length > 1)">
            <option v-for="(sucursal, index) in this.sucursales" :key="index" :value="sucursal.id_sucursal">{{
              sucursal.nombre_administrativo }}</option>
          </select>
          <div class="form-group-stock">
            <label for="stock-min">Codigo Producto:</label>
            <label class="label-stock-info">{{ codigoProductoStock }}</label>
          </div>
          <div class="form-group-stock">
            <label for="stock-min">Nombre Producto:</label>
            <label class="label-stock-info"> {{ nombreProductoStock }}</label>
          </div>
          <div class="form-group-stock">
            <label for="stock-min">Stock Min:</label>
            <input type="text" class="input" placeholder="Ingrese stock minimo del producto " v-model="inputStockMin">
          </div>

          <div class="form-group-stock">
            <label for="stock-max">Stock Max:</label>
            <input type="text" class="input" placeholder="Ingrese stock maximo del producto" v-model="inputStockMax">
          </div>

        </form>

        <div class="categoria-botones">

          <btnGuardarModal @click="guardarStock(searchSucursalStock)">Guardar</btnGuardarModal>
          <btnCerrarModal :texto="'Cerrar'" @click="closeModalStock"></btnCerrarModal>
        </div>

      </div>

    </div>

  </div>
</template>

<script>

//compontentes
import PageHeader from "@/components/PageHeader.vue";
import ExportButton from '../components/ExportButton.vue';
import btnGuardarModal from '../components/botones/modales/btnGuardar.vue';
import btnCerrarModal from '../components/botones/modales/btnCerrar.vue';

import validarCamposService from '../../services/validarCampos.js';
import { notificaciones } from '../../services/notificaciones.js';
import { useToast } from "vue-toastification";

// importando solicitudes
import solicitudes from "../../services/solicitudes.js";

//apis
import { getUnidadMedidaEmpresas } from '../../services/unidadMedidaSolicitud.js';
import { getProveedoresEmpresa } from '../../services/proveedoresSolicitud.js';

//solicitudes a api
import { getInfoExtra, getProductoSucursal, postProducto, patchProducto, desactivarProducto, getProductosEmpresa, getStockMinMax, PostStockMinMax } from '../../services/productosSolicitudes.js';
import { getSucursalesbyEmmpresaSumm } from '../../services/sucursalesSolicitudes.js';
import { getCategoriaProductosEmpresa } from '../../services/categoriaSolicitudes.js';


//recursos
const { impuestos } = require('../resources/impuestos.js');

export default {
  components: {
    PageHeader,
    ExportButton,
    btnGuardarModal,
    btnCerrarModal
  },
  data() {
    return {
      titulo: 'Productos',
      showConfirmModal: false, // Agregar esto
      productoToDelete: null,
      searchQuery: '',
      searchCategoria: '',
      searchSucursal: 'default',
      searchSucursalStock: '',
      isModalOpen: false,
      isModalCategoriaOpen: false,
      isModalStockOpen: false,
      isEditing: false,
      editIndex: null,
      inputStockMax: 0,
      inputStockMin: 0,
      idProductoStock: '',
      itemsPerPage: "",
      id_usuario: '',
      unidadesMostrar: [],
      proveedoresMostrar: [],
      productoForm: {
        codigo_producto: '',
        nombre: '',
        descripcion: '',
        unidad_medida: 'default',
        impuesto: impuestos[0]?.id || null,
        proveedor: 'default',
        precio_unitario: 0,
        precio_mayorista: 0,
        cantidad_activar_mayorista: 0,
        categorias: []

      },
      productos: [],
      sucursales: [],
      // categorias: [],
      categoriasSeleccionadas: [],
      categorias: [],
      columns: [
        { header: '#', dataKey: 'index' },
        { header: 'Código', dataKey: 'codigo_producto' },
        { header: 'Descripción', dataKey: 'descripcion' },
        { header: 'Categoría', dataKey: 'categoria' },
        { header: 'Stock', dataKey: 'stock' },
        { header: 'Precio Unitario', dataKey: 'preciounitario' },
        { header: 'Precio Mayorista', dataKey: 'preciomayorista' },
        { header: 'Precio Descuento', dataKey: 'preciodescuento' },
        { header: 'Fecha', dataKey: 'fecha' }
      ],
      rows: []
    };
  },
  computed: {
    filteredProductos() {
      return this.productos.filter(producto =>
        producto.codigo_producto.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    filteredCategorias() {
      return this.categorias.filter(categoria =>
        categoria.nombre_categoria.toLowerCase().includes(this.searchCategoria.toLowerCase())
      );
    },
    paginatedProductos() {
      if (this.itemsPerPage === "" || this.itemsPerPage === null) {
        return this.filteredProductos;
      } else {
        return this.filteredProductos.slice(0, parseInt(this.itemsPerPage));
      }
    }
  },

  codigoProductoStock: '',
  nombreProductoStock: '',

  methods: {

    async mostrarRegistros(valor) {

      if (this.sucursales.length === 1) {
        valor = this.sucursales[0].id_sucursal;
        this.searchSucursal = this.sucursales[0].id_sucursal;
      }

      if (valor === 'default') {
        this.productos = await getProductosEmpresa(this.id_usuario);
      }
      else {
        try {
          this.productos = await getProductoSucursal(valor);
        } catch (error) {
          console.log(error);
        }

      }
    },

    async openModal() {
      this.isModalOpen = true;
      await this.cargarUnidadMedidaProveedores();

    },
    closeModal() {
      this.isModalOpen = false;
      this.clearForm();
    },

    async openModalCategoria() {
      this.categorias = await getCategoriaProductosEmpresa(this.id_usuario);
      this.isModalCategoriaOpen = true;
    },

    guardarCategorias() {
      this.productoForm.categorias = this.categoriasSeleccionadas;
      this.closeModalCategoria();
    },

    closeModalCategoria() {
      this.isModalCategoriaOpen = false;
    },

    async mostrarStockbySucursal(id_sucursal) {
      try {
        const response = await getStockMinMax(this.idProductoStock, id_sucursal);
        if (response.error) {
          console.error('Error al obtener stock:', response.error);
          return;
        }
        this.inputStockMin = response.stock_min || 0;
        this.inputStockMax = response.stock_max || 0;

      } catch (error) {
        console.error('Error al abrir el modal de stock:', error);

      }
    },

    async openModalStock(producto) {
      this.codigoProductoStock = producto.codigo_producto;
      this.nombreProductoStock = producto.nombre;
      this.idProductoStock = producto.id_producto;

      if (this.searchSucursal === 'default') {
        this.searchSucursalStock = this.sucursales[0].id_sucursal;
      }

      else {
        this.searchSucursalStock = this.searchSucursal;
      }
      await this.mostrarStockbySucursal(this.searchSucursalStock);

      this.isModalStockOpen = true;
    },


    async guardarStock(sucursal) {
      if (!validarCamposService.validarSiNumero(this.inputStockMin) || !validarCamposService.validarSiNumero(this.inputStockMax)) {
        notificaciones('error', 'Datos invalidos: Un campo no es numero');
        return;
      }

      const stock_min = Number(this.inputStockMin);
      const stock_max = Number(this.inputStockMax);

      const datosStock = {
        stock_min: stock_min,
        stock_max: stock_max
      };

      if (stock_max <= stock_min) {
        notificaciones('error', 'Datos invalidos: Stock minimo no puede ser mayor o igual a stock maximo');
        return;
      }

      try {
        const response = await PostStockMinMax(this.idProductoStock, sucursal, datosStock);
        if (response instanceof Error) {
          console.log('Entro aqui');
          throw response;
        }
        notificaciones('success');
      } catch (error) {
        notificaciones('error', error);
      }

      this.closeModalStock();
    },

    closeModalStock() {
      this.isModalStockOpen = false;
    },

    clearForm() {
      this.productoForm = {
        codigo_producto: '',
        nombre: '',
        descripcion: '',
        unidad_medida: 'default',
        impuesto: impuestos[0]?.id || null,
        proveedor: 'default',
        precio_unitario: 0,
        precio_mayorista: 0,
        cantidad_activar_mayorista: 0
      };
      this.isEditing = false;
      this.editIndex = null;
    },

    cargarImpuestos() {
      return impuestos;
    },

    async cargarUnidadMedidaProveedores() {
      this.unidadesMostrar = await getUnidadMedidaEmpresas(this.id_usuario);
      this.proveedoresMostrar = await getProveedoresEmpresa(this.id_usuario);
    },

    validarCampos(productoForm) {
      const campos = {
        codigo_producto: productoForm.codigo_producto,
        nombre: productoForm.nombre,
        descripcion: productoForm.descripcion,
        impuesto: productoForm.impuesto,
        unidad_medida: productoForm.unidad_medida,
        proveedor: productoForm.proveedor,
        precio_unitario: productoForm.precio_unitario,
        precio_mayorista: productoForm.precio_mayorista,
        cantidad_activar_mayorista: productoForm.cantidad_activar_mayorista
      };

      if (!validarCamposService.validarEmpty(campos)) {
        return false;
      }

      if (!validarCamposService.validarSinLetras(campos.precio_mayorista, "precio por mayor")) {
        return false;
      }


      if (!validarCamposService.validarSinLetras(campos.precio_unitario, "precio por unidad")) {
        return false;
      }

      if (!validarCamposService.validarSinLetras(campos.cantidad_activar_mayorista, "cantidad activar mayorista")) {
        return false;
      }

      return true;
    },

    async guardarProducto() {
      if (!this.validarCampos(this.productoForm)) {
        return;
      }
      validarCamposService.formSuccess();

      this.productoForm.id_usuario = this.id_usuario;

      if (this.isEditing) {

        try {

          if (this.productoForm.codigo_producto === this.productos[this.editIndex].codigo_producto) this.productoForm.codigo_producto = '';
          const nuevoRegistro = await patchProducto(this.productoForm, this.productos[this.editIndex].id_producto);
          if (nuevoRegistro == true) {
            this.productoForm.codigo_producto = this.productos[this.editIndex].codigo_producto;
            Object.assign(this.productos[this.editIndex], this.productoForm);
          }
        } catch (error) {
          notificaciones('error', error.message);
        }

      } else {

        try {
          const nuevoRegistro = await postProducto(this.productoForm);
          this.productos.push(nuevoRegistro[0]);
        } catch (error) {
          notificaciones('error', error.message);
        }

      }
      this.closeModal();
    },
    async editProducto(producto, index) {
      this.productoForm = { ...producto };

      try {
        const infoExtra = await getInfoExtra(producto.id_producto);
        this.productoForm.impuesto = infoExtra.impuesto;
        this.productoForm.unidad_medida = infoExtra.id_unidad_medida;
        this.productoForm.precio_mayorista = infoExtra.precio_mayorista;
        this.productoForm.proveedor = infoExtra.id_proveedor;
        this.productoForm.cantidad_activar_mayorista = infoExtra.cantidad_activar_mayorista;
        this.categoriasSeleccionadas = infoExtra.categorias;

        this.isEditing = true;
        this.editIndex = index;
        this.openModal();

      } catch (error) {
        notificaciones('error', error.message);
      }

    },

    async deleteProducto(producto) {
      if (!this.showConfirmModal) {
        this.productoToDelete = producto;
        this.showConfirmModal = true;
        return;
      }

      const toast = useToast();
      try {
        const registroEliminado = await desactivarProducto(this.productoToDelete.id_producto);

        if (registroEliminado == true) {
          this.productos = this.productos.filter(item => item.id_producto !== this.productoToDelete.id_producto);
          notificaciones('success', 'Producto eliminado correctamente');
        } else {
          toast.error('Error al eliminar producto');
        }
      } catch (error) {
        console.error(error);
        notificaciones('error', 'Error al eliminar el producto');
      } finally {
        this.showConfirmModal = false;
        this.productoToDelete = null;
      }
    },

    cancelDelete() {
      this.showConfirmModal = false;
      this.categoriaToDelete = null;
    },

    generateRows() {
      // Genera las filas basadas en los productos paginados
      this.rows = this.paginatedProductos.map((producto, index) => ({
        index: index + 1,
        codigo_producto: producto.codigo_producto,
        descripcion: producto.descripcion,
        categoria: producto.categoria,
        stock: producto.stock,
        preciounitario: producto.preciounitario,
        preciomayorista: producto.preciomayorista,
        preciodescuento: producto.preciodescuento,
        fecha: producto.fecha
      }));
      console.log('Filas generadas:', this.rows);
    },
    changeFavicon(iconPath) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  },
  watch: {
    // Cuando cambie la paginación o el filtro, actualiza las filas
    paginatedProductos() {
      this.generateRows();
    }
  },
  async mounted() {
    // Genera las filas al cargar el componente
    this.generateRows();
    document.title = "Productos";
    this.changeFavicon('/img/spiderman.ico');

    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();

      this.sucursales = await getSucursalesbyEmmpresaSumm(this.id_usuario);


      this.mostrarRegistros(this.searchSucursal);

    } catch (error) {
      console.log(error); //modal error pendiente
    }// Usar la ruta correcta
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
}

.contenedor-principal {
  display: flex;
  width: 100%;
  justify-content: space-around;
}

.contenedor {
  width: 45%;
}

/* Formularios */
.form-group {
  margin-bottom: 16px;
}

.form-group-stock {
  margin: 10px 0;
  display: flex;
  align-items: center;
}

.label-stock-info {
  font-weight: bolder;
}

.form-group label {
  display: flexbox;
  margin-bottom: 8px;
}

.form-group-stock label {
  white-space: nowrap;
  margin-right: 5px;
}

.form-group-select {
  min-width: 80%;
  display: flexbox;
  flex-direction: row;
}

.form-group input {
  width: 95%;
  height: 25%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  justify-content: center;
}

.form-group-stock input {
  height: 25%;
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  justify-content: center;
}

.opciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.form-select {
  width: 100%;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  padding: 8px 16px;
}

.busqueda {
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
  width: 100%;
  max-width: 300px;
}

#btnAdd {
  background-color: #c09d62;
  font-size: 16px;
  width: auto;
  min-width: 170px;
  height: 40px;
  border-radius: 10px;
  color: black;
  font-weight: bold;
  white-space: nowrap;
}

.button-promocion {
  background-color: #4cafaf;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 10px;
}

.button-promocion:hover {
  background-color: #3d8d8d;
}

.export-button {
  margin: 0;
}

#btnAdd:hover {
  background-color: #a38655;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#btnEditar {
  font-size: 18px;
  width: 50px;
  height: 40px;
  border-radius: 10px;
}

#btnEditar:hover {
  background-color: #e8af06;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#btnEliminar {
  font-size: 18px;
  width: 50px;
  height: 40px;
  border-radius: 10px;
  color: black;
}

#btnEliminar:hover {
  background-color: #b72433;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

.productos-wrapper {
  padding: 16px;
  width: 100%;
  overflow-x: hidden;
}

.table-container {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #ddd;
  margin-top: 16px;
  height: auto;
  max-height: 480px;
  overflow-x: auto;
  overflow-y: auto;
}

.table {
  width: 100%;
  min-width: 800px;
  border-collapse: separate;
  border-spacing: 0;
}

.table thead {
  position: sticky;
  top: 0;
  z-index: 0;
  background-color: white;
}

.table th,
.table td {
  padding: 8px;
}

.table thead th {
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.table tbody td {
  text-align: center;
  border-top: 1px solid #ddd;
}

.table thead th:first-child {
  border-top-left-radius: 10px;
}

.table thead th:last-child {
  border-top-right-radius: 10px;
}

.table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 10px;
}

.table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 10px;
}

.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-warning {
  background-color: #ffc107;
  color: black;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modalShowConfirm-Si {
  background-color: #dc3545;
  color: white;
}

.modalShowConfirm-no {
  background-color: #6c757d;
  color: white;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
  margin: 20px;
}

.modal-content-categoria {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 30%;
  height: 72%;
  min-height: 500px;
  min-width: 300px;
}

.modal-content-stock {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  max-width: 400px;
}

.h2-modal-content {
  margin-top: 0px;
}

.edit-stock {
  padding: 5px;
  border: none;
  border-radius: 5px;
  background-color: #163ef3;
  color: rgb(238, 238, 238);
  font-size: 15px;
}

.custom-select {
  border: 1px solid #ccc;
  border-radius: 5px;
  height: 35px;
  font-size: 16px;
  padding: 5px;
  background-color: #fff;
  cursor: pointer;
  width: 80px;
}

.select-sucursal {
  min-width: 200px;
}

.custom-select:focus {
  outline: none;
  border-color: #a38655;
}

.custom-select option {
  font-size: 16px;
}

.select-sucursal-stock {
  width: 100%;
}

.btn-export {
  background-color: #4CAF50;
  color: white;
  font-size: 16px;
  border-radius: 5px;
  padding: 10px 20px;
  margin-right: 10px;
}

.btn-export:hover {
  background-color: #45a049;
}

/* Estilo para scroll personalizado */
.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c09d62;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}

/* Modal de Categorías */
.modal-categorias {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  min-height: 400px;
  max-height: 80vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
}

.categoria-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.categoria-header h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.search-container {
  position: relative;
  margin-bottom: 8px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background-color: white;
}

.search-input:focus {
  outline: none;
  border-color: #c09d62;
  box-shadow: 0 0 0 3px rgba(192, 157, 98, 0.2);
}

.categorias-container {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.categorias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  padding: 8px;
}

.categoria-checkbox {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
}

.categoria-checkbox:hover {
  background-color: #edf2f7;
  transform: translateY(-1px);
}

.categoria-checkbox input[type="checkbox"] {
  margin-right: 12px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #c09d62;
}

.checkbox-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.categoria-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

/* Modo Oscuro */
.dark .modal-categorias {
  background-color: #2d2d2d;
}

.dark .categoria-header,
.dark .categoria-footer {
  background-color: #1e1e1e;
  border-color: #404040;
}

.dark .categoria-header h3 {
  color: #fff;
}

.dark .search-input {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

.dark .categoria-checkbox {
  background-color: #383838;
  border-color: #404040;
}

.dark .categoria-checkbox:hover {
  background-color: #404040;
}

.dark .checkbox-text {
  color: #fff;
}

/* Modal de Producto */
.modal-producto {
  background: white;
  border-radius: 12px;
  width: 95%;
  max-width: 1000px;
  max-height: 90vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin: 20px;
  overflow: hidden;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

/* Form Layout */
.form-row {
  margin-bottom: 20px;
}

.form-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 20px;
}

.full-width {
  grid-column: 1 / -1;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background-color: white;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.input-icon {
  position: relative;
}

.currency-symbol {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.input-icon input {
  padding-left: 30px;
}

/* Select Styles */
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
  padding-right: 40px;
}

/* Footer */
.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

/* Buttons */
.btn-categoria {
  background-color: #c09d62;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
}

.btn-categoria:hover {
  background-color: #a38655;
}

.btn-categoria i {
  font-size: 1.2em;
}

/* Focus States */
.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #c09d62;
  box-shadow: 0 0 0 3px rgba(192, 157, 98, 0.2);
}

/* Dark Mode */
.dark .modal-producto {
  background-color: #2d2d2d;
}

.dark .modal-header,
.dark .modal-footer {
  background-color: #1e1e1e;
  border-color: #404040;
}

.dark .modal-header h2 {
  color: #fff;
}

.dark .form-group label {
  color: #fff;
}

.dark .form-group input,
.dark .form-group textarea,
.dark .form-group select {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

.dark .currency-symbol {
  color: #aaa;
}

/* Responsive */
@media (max-width: 768px) {
  .form-columns {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 16px;
  }

  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .btn-categoria {
    width: 100%;
    justify-content: center;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-categorias {
    width: 95%;
    margin: 20px;
    max-height: 90vh;
  }

  .categorias-grid {
    grid-template-columns: 1fr;
  }

  .categoria-header,
  .categoria-footer {
    padding: 16px;
  }

  .search-input {
    padding: 10px 12px;
  }
}

/* Media Queries */
@media screen and (max-width: 768px) {
  .contenedor-principal {
    flex-direction: column;
  }

  .contenedor {
    width: 100%;
    margin-bottom: 20px;
  }

  .opciones {
    flex-direction: column;
    align-items: stretch;
  }

  .busqueda,
  .custom-select,
  #btnAdd,
  .export-button,
  .button-promocion {
    width: 100%;
    margin: 8px 0;
  }

  .select-sucursal {
    min-width: 100%;
  }

  #btnEditar,
  #btnEliminar {
    width: 40px;
    height: 35px;
    font-size: 14px;
    padding: 8px;
  }

  .table-container {
    margin-top: 24px;
  }

  .modal-content-categoria {
    width: 90%;
  }
}

@media screen and (max-width: 480px) {

  .modal-content,
  .modal-content-stock {
    width: 95%;
    padding: 15px;
  }

  .table thead th,
  .table tbody td {
    padding: 6px;
    font-size: 14px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .form-group input,
  .form-group-stock input {
    width: 100%;
  }

  .h2-modal-content {
    font-size: 20px;
  }

  .busqueda {
    max-width: 100%;
  }

  .form-form-categoria {
    padding: 10px;
    max-height: 200px;
  }

  .label-categoria {
    margin-right: 10px;
    margin-bottom: 8px;
  }
}

/* =======================================================
   Modo Oscuro
======================================================= */
/* Contenedor principal */
.dark .categorias-wrapper {
  background-color: #1e1e1e;
  color: #fff;
}

/* Inputs y búsqueda en modo oscuro */
.dark .busqueda {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

.dark .custom-select {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

.dark .custom-select option {
  background-color: #2d2d2d;
  color: #fff;
}

/* Tabla en modo oscuro */
.dark .table-container {
  border-color: #404040;
  background-color: #2d2d2d;
}

.dark .table thead {
  background-color: #2d2d2d;
}

.dark .table th {
  background-color: #383838;
  color: #fff;
  border-color: #404040;
}

.dark .table td {
  color: #fff;
  border-color: #404040;
}

.dark .table tr:hover {
  background-color: #383838;
}

/* Modal en modo oscuro */
.dark .modal-content {
  background-color: #2d2d2d;
  color: #fff;
}

.dark .modal-content input,
.dark .modal-content textarea {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

.dark .form-group label {
  color: #fff;
}

/* Scroll personalizado en modo oscuro */
.dark .table-container::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.dark .table-container::-webkit-scrollbar-thumb {
  background: #c09d62;
}

.dark .table-container::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}

/* Botones en modo oscuro (manteniendo los colores originales) */
.dark .button-promocion {
  background-color: #4cafaf;
  color: white;
}

.dark .button-unidad-medida {
  background-color: #4caf4c;
  color: #000;
}

.dark #btnAdd {
  background-color: #c09d62;
  color: black;
}

.dark #btnAdd:hover {
  background-color: #a38655;
}

.dark #btnEditar {
  background-color: #ffc107;
  color: black;
}

.dark #btnEditar:hover {
  background-color: #e8af06;
}

.dark #btnEliminar {
  background-color: #dc3545;
  color: black;
}

.dark #btnEliminar:hover {
  background-color: #b72433;
}

.dark .modalShowConfirm-Si {
  background-color: #dc3545;
  color: white;
}

.dark .modalShowConfirm-no {
  background-color: #6c757d;
  color: white;
}
</style>