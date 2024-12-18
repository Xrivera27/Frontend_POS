<template>
  <div class="productos-wrapper">
    <ModalLoading :isLoading="isLoading" />
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <div class="action-bar">
        <button
          v-if="esCeo"
          id="btnAdd"
          class="btn btn-primary"
          @click="openModal"
          style="width: 200px; white-space: nowrap"
        >
          Agregar Producto
        </button>
      </div>

      <!-- Botón de exportación PDF -->
      <ExportButton
        :columns="columns"
        :rows="rows"
        fileName="Productos.pdf"
        class="export-button"
      />

      <RouterLink to="promociones-producto">
        <button class="button-promocion">Promociones</button>
      </RouterLink>

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input
          class="busqueda"
          type="text"
          v-model="searchQuery"
          placeholder="Buscar producto..."
        />
      </div>

      <div class="registros">
        <span>
          <select
            class="custom-select select-sucursal"
            v-model="searchSucursal"
            v-show="sucursales.length > 1"
            @change="mostrarRegistros(searchSucursal)"
          >
            <option value="default">Todas</option>
            <option
              v-for="(sucursal, index) in this.sucursales"
              :key="index"
              :value="sucursal.id_sucursal"
            >
              {{ sucursal.nombre_administrativo }}
            </option>
          </select>
        </span>
      </div>
    </div>

    <!-- Tabla exportable -->
    <div class="table-container" v-pdf-export ref="table">
      <!-- Indicador de carga -->
      <div v-if="isLoading" class="loading-indicator">
        Cargando productos...
      </div>

      <!-- Mensaje si no hay datos -->
      <div v-else-if="paginatedProductos.length === 0" class="no-data">
        No se encontraron productos para mostrar.
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Stock</th>
            <th>Precio Unitario</th>
            <th>Promoción Activa</th>
            <th v-if="esCeo">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(producto, index) in paginatedProductos" :key="index">
            <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
            <td>{{ producto.codigo_producto }}</td>
            <td>{{ producto.nombre }}</td>
            <td>
              {{ producto.stock_actual }}
              <button class="edit-stock" @click="openModalStock(producto)">
                <i class="bi bi-pencil-square"></i>
              </button>
            </td>
            <td>{{ producto.precio_unitario }}</td>
            <td>{{ producto.promocion }}</td>
            <td v-if="esCeo">
              <button
                id="btnEditar"
                class="btn btn-warning"
                @click="editProducto(producto, index)"
              >
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button
                id="btnEliminar"
                class="btn btn-danger"
                @click="deleteProducto(producto)"
              >
                <b><i class="bi bi-x-lg"></i></b>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div class="pagination-wrapper">
        <div class="pagination-info">
          Mostrando
          {{
            paginatedProductos.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1
          }}
          a {{ Math.min(currentPage * pageSize, filteredProductos.length) }} de
          {{ filteredProductos.length }} registros
        </div>
        <div class="pagination-container">
          <button
            class="pagination-button"
            :disabled="currentPage === 1"
            @click="previousPage"
          >
            Anterior
          </button>
          <button
            class="pagination-button"
            :disabled="currentPage === totalPages || totalPages === 0"
            @click="nextPage"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <div class="modal" v-if="showConfirmModal">
      <div class="modal-confirm">
        <div class="modal-header">
          <h2>Confirmación</h2>
        </div>

        <div class="modal-body-confirm">
          <p v-if="productoToDelete.stock_actual > 0">
            Este producto actualmente tiene
            {{ productoToDelete.stock_actual }} unidades en stock. ¿Estás seguro
            de que quieres eliminarlo?
          </p>
          <p v-else>¿Estás seguro de que quieres eliminar este producto?</p>
        </div>

        <div class="modal-footer">
          <div class="action-buttons">
            <btnGuardarModal
              texto="Sí, eliminar"
              style="background-color: red"
              @click="deleteProducto()"
            />
            <btnCerrarModal texto="No, regresar" @click="cancelDelete" />
          </div>
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
              <input
                ref="codigoInput"
                v-model="productoForm.codigo_producto"
                type="text"
                placeholder="Ingrese el código del producto"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label>Nombre Producto:</label>
              <input
                v-model="productoForm.nombre"
                type="text"
                placeholder="Ingrese el nombre del producto"
                required
              />
            </div>
          </div>

          <div class="form-columns">
            <div class="form-column">
              <div class="form-group">
                <label>Descripción:</label>
                <textarea
                  v-model="productoForm.descripcion"
                  placeholder="Ingrese la descripción del producto"
                  required
                />
              </div>

              <div class="form-group">
                <label>Impuesto:</label>
                <select class="form-select" v-model="productoForm.impuesto">
                  <option value="" disabled>Seleccione un impuesto</option>
                  <option
                    v-for="(impuesto, index) in cargarImpuestos()"
                    :key="index"
                    :value="impuesto.id"
                  >
                    {{ impuesto.nombre }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Proveedor:</label>
                <select class="form-select" v-model="productoForm.proveedor">
                  <option value="default" disabled>
                    Seleccione un proveedor
                  </option>
                  <option
                    v-for="(proveedor, index) in proveedoresMostrar"
                    :key="index"
                    :value="proveedor.id"
                  >
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
                  <input
                    v-model="productoForm.precio_unitario"
                    type="text"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    @blur="formatearPrecio($event, 'precio_unitario')"
                    @keypress="soloNumeros($event)"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Precio por mayoreo:</label>
                <div class="input-icon">
                  <span class="currency-symbol">L.</span>
                  <input
                    v-model="productoForm.precio_mayorista"
                    type="text"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    @blur="formatearPrecio($event, 'precio_mayorista')"
                    @keypress="soloNumeros($event)"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Cantidad activar mayoreo:</label>
                <input
                  @keypress="soloNumeros($event)"
                  v-model="productoForm.cantidad_activar_mayorista"
                  type="text"
                  min="0"
                  placeholder="0"
                  required
                />
              </div>

              <div class="form-group">
                <label>Unidad de medida:</label>
                <select
                  class="form-select"
                  v-model="productoForm.unidad_medida"
                >
                  <option value="default" disabled>
                    Seleccione una unidad de medida
                  </option>
                  <option
                    v-for="(unidad, index) in unidadesMostrar"
                    :key="index"
                    :value="unidad.id_medida"
                  >
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
          <div id="btnCanc" class="action-buttons">
            <btnGuardarModal
              :texto="isEditing ? 'Guardar Cambios' : 'Agregar Producto'"
              @click="guardarProducto"
            />
            <btnCerrarModal texto="Cerrar" @click="closeModal" />
          </div>
        </div>
      </div>
    </div>

    <!-- modal para mostrar categorias -->
    <div v-if="isModalCategoriaOpen" class="modal">
      <div class="modal dark">
        <div class="modal-content modal-categorias">
          <div class="categoria-header">
            <h3>Selecciona categorías del producto</h3>
            <div class="search-container">
              <input
                type="text"
                v-model="searchCategoria"
                placeholder="Buscar categoría..."
                class="search-input"
              />
            </div>
          </div>

          <div class="categorias-container">
            <div class="categorias-grid">
              <label
                v-for="(categoria, index) in filteredCategorias"
                :key="index"
                class="categoria-checkbox"
              >
                <input
                  type="checkbox"
                  v-model="categoriasSeleccionadas"
                  :value="categoria.id_categoria"
                />
                <span class="checkbox-text">{{
                  categoria.nombre_categoria
                }}</span>
              </label>
            </div>
          </div>

          <div class="categoria-footer">
            <btnGuardarModal
              :texto="'Agregar Categoría'"
              @click="guardarCategorias"
            >
            </btnGuardarModal>
            <btnCerrarModal
              :texto="'Cerrar'"
              @click="closeModalCategoria"
            ></btnCerrarModal>
          </div>
        </div>
      </div>
    </div>

    <!-- modal para editar stocks min y max por sucursal -->
    <div v-if="isModalStockOpen" class="modal">
      <div class="modal-stock">
        <div class="modal-header">
          <h3>Edite stock min y max por sucursal</h3>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <select
              class="custom-select select-sucursal-stock"
              @change="mostrarStockbySucursal(searchSucursalStock)"
              v-model="searchSucursalStock"
              v-show="sucursales.length > 1"
            >
              <option
                v-for="(sucursal, index) in this.sucursales"
                :key="index"
                :value="sucursal.id_sucursal"
              >
                {{ sucursal.nombre_administrativo }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="stock-min">Codigo Producto:</label>
            <label class="label-stock-info">{{ codigoProductoStock }}</label>
          </div>
          <div class="form-group">
            <label for="stock-min">Nombre Producto:</label>
            <label class="label-stock-info"> {{ nombreProductoStock }}</label>
          </div>
          <div class="form-group">
            <label for="stock-min">Stock Min:</label>
            <input
              type="text"
              class="input"
              @keypress="soloNumeros($event)"
              placeholder="Ingrese stock minimo del producto "
              v-model="inputStockMin"
            />
          </div>

          <div class="form-group">
            <label for="stock-max">Stock Max:</label>
            <input
              type="text"
              class="input"
              @keypress="soloNumeros($event)"
              placeholder="Ingrese stock maximo del producto"
              v-model="inputStockMax"
            />
          </div>
        </div>

        <div class="modal-footer">
          <btnGuardarModal
            :texto="'Guardar cambios'"
            @click="guardarStock(searchSucursalStock)"
          >
          </btnGuardarModal>
          <btnCerrarModal
            :texto="'Cerrar'"
            @click="closeModalStock"
          ></btnCerrarModal>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//compontentes
import PageHeader from "@/components/PageHeader.vue";
import ExportButton from "../components/ExportButton.vue";
import btnGuardarModal from "../components/botones/modales/btnGuardar.vue";
import btnCerrarModal from "../components/botones/modales/btnCerrar.vue";
import { validacionesProductos } from "../../services/validarCampos.js";
import { notis } from "../../services/notificaciones.js";
import ModalLoading from "@/components/ModalLoading.vue";

// importando solicitudes
import solicitudes from "../../services/solicitudes.js";

//apis
import { getUnidadMedidaEmpresas } from "../../services/unidadMedidaSolicitud.js";
import { getProveedoresEmpresa } from "../../services/proveedoresSolicitud.js";

//solicitudes a api
import {
  getInfoExtra,
  getProductoSucursal,
  postProducto,
  patchProducto,
  desactivarProducto,
  getProductosEmpresa,
  getStockMinMax,
  PostStockMinMax,
} from "../../services/productosSolicitudes.js";
import { getSucursalesbyEmmpresaSumm } from "../../services/sucursalesSolicitudes.js";
import { getCategoriaProductosEmpresa } from "../../services/categoriaSolicitudes.js";
const { esCeo } = require("../../services/usuariosSolicitudes");
const { impuestos } = require("../resources/impuestos.js");
import { setPageTitle } from "@/components/pageMetadata";

export default {
  components: {
    PageHeader,
    ExportButton,
    btnGuardarModal,
    btnCerrarModal,
    ModalLoading,
  },
  data() {
    return {
      titulo: "Productos",
      showConfirmModal: false,
      isLoading: false,
      productoToDelete: null,
      searchQuery: "",
      searchCategoria: "",
      searchSucursal: "default",
      searchSucursalStock: "",
      isModalOpen: false,
      isModalCategoriaOpen: false,
      isModalStockOpen: false,
      isEditing: false,
      editIndex: null,
      inputStockMax: 0,
      inputStockMin: 0,
      idProductoStock: "",
      currentPage: 1,
      pageSize: 10,
      id_usuario: "",
      productoOriginal: null,
      unidadesMostrar: [],
      proveedoresMostrar: [],
      esCeo: false,
      productoForm: {
        codigo_producto: "",
        nombre: "",
        descripcion: "",
        unidad_medida: "default",
        impuesto: impuestos[0]?.id || null,
        proveedor: "default",
        precio_unitario: "",
        precio_mayorista: "",
        cantidad_activar_mayorista: "",
        categorias: [],
      },
      productos: [],
      sucursales: [],
      categoriasSeleccionadas: [],
      categorias: [],
      columns: [
        { header: "#", dataKey: "index" },
        { header: "Código", dataKey: "codigo_producto" },
        { header: "Descripción", dataKey: "descripcion" },
        { header: "Categoría", dataKey: "categoria" },
        { header: "Stock", dataKey: "stock" },
        { header: "Precio Unitario", dataKey: "preciounitario" },
        { header: "Precio Mayorista", dataKey: "preciomayorista" },
        { header: "Precio Descuento", dataKey: "preciodescuento" },
        { header: "Fecha", dataKey: "fecha" },
      ],
      rows: [],
    };
  },

  computed: {
    hasChanges() {
      if (!this.productoOriginal) return false;
      const changedFields = this.getChangedFields();
      return Object.keys(changedFields).length > 0;
    },

    filteredProductos() {
      return this.productos.filter(
        (producto) =>
          producto.codigo_producto
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          producto.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },

    paginatedProductos() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredProductos.slice(startIndex, endIndex);
    },

    totalPages() {
      return Math.ceil(this.filteredProductos.length / this.pageSize);
    },

    filteredCategorias() {
      return this.categorias.filter((categoria) =>
        categoria.nombre_categoria
          .toLowerCase()
          .includes(this.searchCategoria.toLowerCase())
      );
    },
  },

  codigoProductoStock: "",
  nombreProductoStock: "",

  methods: {
    async mostrarRegistros(valor) {
      if (this.sucursales.length === 1) {
        valor = this.sucursales[0].id_sucursal;
        this.searchSucursal = this.sucursales[0].id_sucursal;
      }

      if (valor === "default") {
        this.productos = await getProductosEmpresa(this.id_usuario);
      } else {
        try {
          this.productos = await getProductoSucursal(valor);
        } catch (error) {
          console.log(error);
        }
      }
    },

    soloNumeros(event) {
      const codigoTecla = event.keyCode || event.which;
      const tecla = String.fromCharCode(codigoTecla);
      const regex = /^[0-9.]$/;
      if (
        !regex.test(tecla) ||
        (tecla === "." && event.target.value.includes("."))
      ) {
        event.preventDefault();
        return false;
      }
    },

    formatearPrecio(event, campo) {
      let valor = event.target.value;
      if (valor === "") return;
      const numeroFormateado = parseFloat(valor).toFixed(2);
      this.productoForm[campo] = numeroFormateado;
    },

    async openModal() {
      this.isLoading = true;
      await this.cargarUnidadMedidaProveedores();
      this.isModalOpen = true;
      this.isLoading = false;
      this.$nextTick(() => {
        this.$refs.codigoInput?.focus();
      });
    },

    closeModal() {
      this.isModalOpen = false;
      this.clearForm();
    },

    async openModalCategoria() {
      this.isLoading = true;
      this.categorias = await getCategoriaProductosEmpresa(this.id_usuario);
      this.isModalCategoriaOpen = true;
      this.isLoading = false;
    },

    guardarCategorias() {
      this.isLoading = true;
      this.productoForm.categorias = this.categoriasSeleccionadas;
      this.closeModalCategoria();
      this.isLoading = false;
    },

    closeModalCategoria() {
      this.isModalCategoriaOpen = false;
    },

    async mostrarStockbySucursal(id_sucursal) {
      this.isLoading = true;
      try {
        const response = await getStockMinMax(
          this.idProductoStock,
          id_sucursal
        );
        if (response.error) {
          console.error("Error al obtener stock:", response.error);
          return;
        }
        this.inputStockMin = response.stock_min || 0;
        this.inputStockMax = response.stock_max || 0;
      } catch (error) {
        console.error("Error al abrir el modal de stock:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async openModalStock(producto) {
      this.codigoProductoStock = producto.codigo_producto;
      this.nombreProductoStock = producto.nombre;
      this.idProductoStock = producto.id_producto;

      if (this.searchSucursal === "default") {
        this.searchSucursalStock = this.sucursales[0].id_sucursal;
      } else {
        this.searchSucursalStock = this.searchSucursal;
      }
      await this.mostrarStockbySucursal(this.searchSucursalStock);
      this.isModalStockOpen = true;
    },

    async guardarStock(sucursal) {
      const stock_min = Number(this.inputStockMin);
      const stock_max = Number(this.inputStockMax);

      const datosStock = {
        stock_min: stock_min,
        stock_max: stock_max,
      };

      if (stock_max <= stock_min) {
        notis(
          "error",
          "Datos invalidos: Stock minimo no puede ser mayor o igual a stock maximo"
        );
        return;
      }

      try {
        const response = await PostStockMinMax(
          this.idProductoStock,
          sucursal,
          datosStock
        );
        if (response instanceof Error) {
          throw response;
        }
        notis("success", "Datos de stock guardados correctamente");
      } catch (error) {
        notis("error", error);
      }

      this.closeModalStock();
    },

    closeModalStock() {
      this.isModalStockOpen = false;
    },

    clearForm() {
      this.productoForm = {
        codigo_producto: "",
        nombre: "",
        descripcion: "",
        unidad_medida: "default",
        impuesto: impuestos[0]?.id || null,
        proveedor: "default",
        precio_unitario: "",
        precio_mayorista: "",
        cantidad_activar_mayorista: "",
        categorias: [],
      };
      this.productoOriginal = null;
      this.isEditing = false;
      this.editIndex = null;
      this.categoriasSeleccionadas = [];
    },
    cargarImpuestos() {
      return impuestos;
    },

    async cargarUnidadMedidaProveedores() {
      this.unidadesMostrar = await getUnidadMedidaEmpresas(this.id_usuario);
      this.proveedoresMostrar = await getProveedoresEmpresa(this.id_usuario);
    },

    async guardarProducto() {
      if (!validacionesProductos.validarCampos(this.productoForm)) {
        return;
      }

      this.isLoading = true;

      try {
        if (this.isEditing) {
          const changedFields = this.getChangedFields();

          // Si no hay cambios, cerrar modal
          if (Object.keys(changedFields).length === 0) {
            this.closeModal();
            return;
          }

          // Agregar id_usuario si es necesario
          changedFields.id_usuario = this.id_usuario;

          // Si el código no cambió, no lo enviamos
          if (
            changedFields.codigo_producto ===
            this.productos[this.editIndex].codigo_producto
          ) {
            delete changedFields.codigo_producto;
          }

          const nuevoRegistro = await patchProducto(
            changedFields,
            this.productos[this.editIndex].id_producto
          );

          if (nuevoRegistro === true) {
            notis("success", "Actualizando datos del producto...");
            // Actualizar solo los campos modificados en el array de productos
            Object.assign(this.productos[this.editIndex], changedFields);
          }
        } else {
          // Lógica para nuevo producto
          this.productoForm.id_usuario = this.id_usuario;
          const nuevoRegistro = await postProducto(this.productoForm);
          this.productos.push(nuevoRegistro[0]);
          notis("success", "Producto agregado correctamente");
        }
      } catch (error) {
        notis("error", error.message);
      } finally {
        this.isLoading = false;
        this.closeModal();
      }
    },

    async editProducto(producto, index) {
      // Inicializar el form solo con datos básicos
      this.productoForm = {
        codigo_producto: producto.codigo_producto || "",
        nombre: producto.nombre || "",
        descripcion: producto.descripcion || "",
        precio_unitario: producto.precio_unitario || "",
        precio_mayorista: "",
        proveedor: "default",
        unidad_medida: "default",
        impuesto: impuestos[0]?.id || null,
        cantidad_activar_mayorista: "",
        categorias: [],
      };

      try {
        // Obtener info extra y solo actualizar los campos necesarios
        const infoExtra = await getInfoExtra(producto.id_producto);

        // Solo actualizar campos si son diferentes
        if (infoExtra.impuesto !== undefined) {
          this.productoForm.impuesto = infoExtra.impuesto;
        }
        if (infoExtra.id_unidad_medida) {
          this.productoForm.unidad_medida = infoExtra.id_unidad_medida;
        }
        if (infoExtra.id_proveedor) {
          this.productoForm.proveedor = infoExtra.id_proveedor;
        }
        if (infoExtra.precio_mayorista !== undefined) {
          this.productoForm.precio_mayorista = infoExtra.precio_mayorista;
        }
        if (infoExtra.cantidad_activar_mayorista !== undefined) {
          this.productoForm.cantidad_activar_mayorista =
            infoExtra.cantidad_activar_mayorista;
        }
        if (infoExtra.categorias) {
          this.categoriasSeleccionadas = infoExtra.categorias;
        }

        this.isEditing = true;
        this.editIndex = index;
        this.productoOriginal = { ...this.productoForm }; // Guardar estado original
        this.openModal();
      } catch (error) {
        notis("error", "Error al editar el producto");
        console.error(error);
      }
    },

    getChangedFields() {
      const changedFields = {};
      Object.keys(this.productoForm).forEach((key) => {
        // Comparar con los valores originales
        if (this.productoForm[key] !== this.productoOriginal[key]) {
          changedFields[key] = this.productoForm[key];
        }
      });
      return changedFields;
    },

    async deleteProducto(producto) {
      if (!this.showConfirmModal) {
        this.productoToDelete = producto;
        this.showConfirmModal = true;
        return;
      }
      this.isLoading = true;
      try {
        const registroEliminado = await desactivarProducto(
          this.productoToDelete.id_producto
        );

        if (registroEliminado == true) {
          this.productos = this.productos.filter(
            (item) => item.id_producto !== this.productoToDelete.id_producto
          );
          this.isLoading = false;
          notis("success", "Producto eliminado correctamente");
        } else {
          this.isLoading = false;
          notis("error", "Error al eliminar producto");
        }
      } catch (error) {
        console.error(error);
        notis("error", "Error al eliminar el producto");
      } finally {
        this.showConfirmModal = false;
        this.productoToDelete = null;
        this.isLoading = false;
      }
    },

    cancelDelete() {
      this.showConfirmModal = false;
      this.productoToDelete = null;
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    generateRows() {
      this.rows = this.paginatedProductos.map((producto, index) => ({
        index: index + 1,
        codigo_producto: producto.codigo_producto,
        descripcion: producto.descripcion,
        categoria: producto.categoria,
        stock: producto.stock,
        preciounitario: producto.preciounitario,
        preciomayorista: producto.preciomayorista,
        preciodescuento: producto.preciodescuento,
        fecha: producto.fecha,
      }));
    },

    changeFavicon(iconPath) {
      const link =
        document.querySelector("link[rel*='icon']") ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.rel = "icon";
      link.href = iconPath;
      document.getElementsByTagName("head")[0].appendChild(link);
    },
  },

  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    searchSucursal() {
      this.currentPage = 1;
    },
    paginatedProductos() {
      this.generateRows();
    },
  },

  async mounted() {
    this.isLoading = true;
    this.generateRows();
    setPageTitle("Productos");

    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();
      this.sucursales = await getSucursalesbyEmmpresaSumm(this.id_usuario);
      this.esCeo = await esCeo(this.id_usuario);
      this.mostrarRegistros(this.searchSucursal);
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

* {
  font-family: "Montserrat", sans-serif;
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

.opciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.busqueda {
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
  width: 100%;
  max-width: 300px;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #c09d62;
  box-shadow: 0 0 0 3px rgba(192, 157, 98, 0.2);
  transition: all 0.3s ease;
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
  background-color: #3d8d8d;
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
  border-radius: 0;
  border: 1px solid #e2e8f0;
  margin-top: 16px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

.modal-confirm {
  background: white;
  border-radius: 12px;
  width: 25%;
  max-width: 1000px;
  max-height: 90vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin: 20px;
  overflow: hidden;
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
  cursor: pointer;
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
  background-color: #4caf50;
  color: white;
  font-size: 16px;
  border-radius: 5px;
  padding: 10px 20px;
  margin-right: 10px;
}

.btn-export:hover {
  background-color: #45a049;
}

/* Pagination styles */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  margin-top: auto;
  background-color: #fff;
}

.pagination-info {
  color: #6c757d;
}

.pagination-container {
  display: flex;
  gap: 5px;
}

.pagination-button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
  min-width: 40px;
  transition: all 0.3s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: #e9ecef;
}

.pagination-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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

.dark .categoria-header,
.dark .categoria-footer {
  background-color: #1e1e1e;
  border-color: #404040;
}

.dark .categoria-header h3 {
  color: white;
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

.dark .categoria-checkbox {
  background-color: #343a40;
  /* Fondo oscuro */
  border: 1px solid #495057;
  /* Borde oscuro */
}

.dark .categoria-checkbox:hover {
  background-color: #495057;
}

.dark .categoria-checkbox input[type="checkbox"] {
  accent-color: #f8c927;
  /* Color del checkbox en modo oscuro */
}

.dark .checkbox-text {
  color: #e1e1e1;
  /* Texto claro en modo oscuro */
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

/* Modal de Producto */
.modal-producto {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  /* Reducido de 1000px */
  max-height: 85vh;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  /* Cambiado de auto a hidden */
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-stock {
  background: white;
  border-radius: 12px;
  width: 35%;
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

.modal-body-confirm {
  padding: 24px;
  overflow-y: auto;
  background-color: white;
}

.dark .modal-body-confirm {
  background-color: #333;
}

.dark .modal-body {
  background-color: #2d2d2d;
}

/* Form Layout */
.form-row {
  margin-bottom: 20px;
}

.form-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  padding: 0;
  margin-bottom: 20px;
}

.full-width {
  grid-column: 1 / -1;
}

/* Form Groups */

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  width: 100%;
}

.form-group label {
  margin: 0;
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

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #c09d62;
  box-shadow: 0 0 0 3px rgba(192, 157, 98, 0.2);
  transition: all 0.3s ease;
}

.btn-categoria {
  background-color: #c09d62;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.dark .btn-categoria {
  background-color: #977c4f;
}

.dark .btn-categoria:hover {
  background-color: #6b5939;
}

.btn-categoria:hover {
  background-color: #696969;
}

.btn-categoria i {
  font-size: 1.2em;
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

@media screen and (max-width: 768px) {
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

  .pagination-wrapper {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .pagination-container {
    justify-content: center;
  }

  .pagination-info {
    margin-bottom: 1rem;
  }
}

@media screen and (max-width: 480px) {
  .modal-stock {
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
  .form-group input {
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
.dark .productos-wrapper {
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
  background-color: #1e1e1e;
  border-color: #374151;
}

.dark .table {
  background-color: #1e1e1e;
}

.dark .table thead {
  background-color: #111827;
}

.dark .table th {
  background-color: #111827;
  color: #e5e7eb;
  border-bottom-color: #374151;
}

.dark .table td {
  color: #e5e7eb;
  border-bottom-color: #374151;
}

.dark .table tbody tr:hover {
  background-color: #1f2937;
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

/* Paginación en modo oscuro */
.dark .pagination-wrapper {
  background-color: #2d2d2d;
  border-color: #404040;
}

.dark .pagination-info {
  color: #aaa;
}

.dark .pagination-button {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

.dark .pagination-button:hover:not(:disabled) {
  background-color: #444;
}

.dark .pagination-button:disabled {
  background-color: #2d2d2d;
  color: #666;
}

/* Botones en modo oscuro (manteniendo los colores originales) */
.dark .button-promocion {
  background-color: #4cafaf;
  color: black;
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

/* Estilos para la paginación */
.loading-indicator,
.no-data {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
}
</style>
