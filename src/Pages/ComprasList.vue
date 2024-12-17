<template>
  <div class="wrapper">
    <PageHeader :titulo="titulo" />
    <ModalLoading :isLoading="isLoading" />

    <div class="main-container">
      <form
        @submit.prevent="agregarProducto"
        autocomplete="off"
        class="purchase-form"
      >
        <!-- Primera fila: Código y Búsqueda -->
        <div class="form-section search-section">
          <div class="form-group">
            <label for="codigo-busqueda" class="form-label"
              >Código del producto:</label
            >
            <input
              list="codigosList"
              name="codigo-busqueda"
              ref="codigo"
              type="text"
              class="form-input"
              tabindex="1"
              required
              v-model="addQuery"
              placeholder="Ingresar código"
              :disabled="isEditing"
              @input="handleCodigoInput"
            />
            <datalist id="codigosList">
              <option
                v-for="producto in productos"
                :key="producto.id_producto"
                :value="producto.codigo_producto"
              >
                {{ producto.codigo_producto }} - {{ producto.nombre }}
              </option>
            </datalist>
          </div>

          <div class="form-group">
            <label for="referencia" class="form-label"
              >Referencia de Compra:</label
            >
            <input
              type="text"
              id="referencia"
              class="form-input"
              v-model="referenciaPago"
              placeholder="Ingrese referencia de compra"
            />
          </div>

          <div class="form-group search-name">
            <label class="form-label">Buscar por nombre:</label>
            <input
              list="productosList"
              class="form-input"
              :disabled="isEditing"
              v-model="searchQuery"
              placeholder="Ingresar nombre"
              @input="handleSearchInput"
            />
            <datalist id="productosList">
              <option
                v-for="producto in productos"
                :key="producto.id_producto"
                :value="producto.nombre"
              >
                {{ producto.codigo_producto }} - {{ producto.nombre }}
              </option>
            </datalist>
          </div>
        </div>

        <!-- Segunda fila: Cantidades y Precio -->
        <div class="form-section quantities-section">
          <div class="form-group">
            <label for="cantidad" class="form-label">Cantidad Unitaria:</label>
            <input
              name="cantidad"
              class="form-input"
              type="number"
              tabindex="3"
              placeholder="Cantidad unitaria"
              v-model="addQuantity"
              min="1"
            />
          </div>

          <div class="form-group">
            <label for="cantidad_paquetes" class="form-label"
              >Cantidad de paquetes:</label
            >
            <input
              name="cantidad_paquetes"
              class="form-input"
              type="number"
              tabindex="4"
              placeholder="Cantidad total de paquetes"
              v-model="addQuantityPackage"
              min="1"
            />
          </div>

          <div class="form-group">
            <label for="total-compra" class="form-label"
              >Precio por paquete:</label
            >
            <input
              name="total-compra"
              class="form-input"
              type="number"
              step="0.01"
              tabindex="5"
              placeholder="Total compra por paquete"
              required
              v-model="addtotalPrice"
              min="0.01"
            />
          </div>

          <div class="form-group button-group">
            <button class="btn btn-primary" type="submit">
              <i class="bi bi-plus-circle-fill"></i> Añadir
            </button>
          </div>
        </div>
      </form>

      <!-- Tabla de Productos -->
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>N.º</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Paquetes</th>
              <th>Unidad/Paquetes</th>
              <th>Proveedor</th>
              <th>Total Compra</th>
              <th>Opciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(producto, index) in productosLista"
              :key="index"
              @click="isEditingTrue(index)"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ producto.codigo }}</td>
              <td>{{ producto.nombre }}</td>
              <td>{{ producto.paquetes }}</td>
              <td>{{ producto.cantidad }}</td>
              <td>{{ producto.proveedor?.nombre || producto.proveedor }}</td>
              <td>{{ producto.total_compra }}</td>
              <td class="actions-cell">
                <button class="btn-icon" @click.stop="deleteProducto(index)">
                  <i class="bi bi-x-circle-fill text-danger"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sección de Totales y Acciones -->
      <div class="footer-section">
        <div class="footer-content">
          <!-- Lado izquierdo - Cancelar -->
          <div class="action-group">
            <div class="shortcut-badge">Esc</div>
            <button class="btn btn-cancel" @click="cancelarCompra">
              <i class="bi bi-x-circle"></i>
              Cancelar compra
            </button>
          </div>

          <!-- Lado derecho - Procesar y Total -->
          <div class="action-group">
            <div class="process-group">
              <div class="shortcut-badge">F12</div>
              <button class="btn btn-process" @click="payModalOpen">
                <i class="bi bi-check-circle"></i>
                Procesar Compra
              </button>
            </div>
            <div class="total-container">
              <span class="total-label">Total</span>
              <div class="total-amount">
                {{ calcularTotal }}<span class="currency">Lempiras</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="end-container">
      <div class="end-container-cancelar">
        <p class="texto-tecla-boton texto-esc">Esc</p>
        <button
          class="btn btn-end"
          id="cancelar-compra"
          @click="cancelarCompra"
        >
          Cancelar compra
        </button>
      </div>

      <div class="end-container-cobro">
        <p class="texto-tecla-boton texto-f12">F12</p>
        <button class="btn btn-end" id="boton-cobrar" @click="payModalOpen">
          Procesar Compra
        </button>
        <div class="end-container-cobro-p">
          <p id="total">{{ calcularTotal }}</p>
          <p id="moneda">Lempiras</p>
        </div>
      </div>
    </div>

    <!-- Modal de Pago -->
    <div class="modal-overlay" v-if="payModal">
      <div class="modal-content">
        <h2>Resumen de Compra</h2>
        <div class="div-modal-resumen">
          <label for="subtotal">Cantidad total Artículos:</label>
          <input type="text" id="subtotal" v-model="articulos_cant" disabled />
        </div>

        <div class="div-modal-resumen">
          <label for="total">Total:</label>
          <input type="text" id="totalModal" v-model="total" disabled />
        </div>

        <div class="modal-actions">
          <button class="btn confirmar-pago" @click="confirmPayment">
            Confirmar Pago
          </button>
          <button class="btn cancelar" @click="cancelPayment">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación -->
    <div class="modal" v-if="confirmModal">
      <div class="modal-overlay">
        <div class="modal-content">
          <h2>Compra Realizada</h2>
          <div class="modal-summary"></div>
          <button @click="confirmPaymentClose" class="btn close-btn">
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Cancelación -->
    <div class="modal-overlay" v-if="showConfirmModal">
      <div class="modal-content">
        <h2>Confirmación</h2>
        <p>¿Estás seguro de que quieres cancelar la compra?</p>
        <div class="modal-actions">
          <button class="btn modalShowConfirm-Si" @click="confirmCancel">
            Sí, cancelar
          </button>
          <button class="btn modalShowConfirm-no" @click="cancelCancel">
            No, volver
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Proveedores -->
    <div class="modal-overlay" v-if="showProveedores">
      <div class="modal-content">
        <h2>Proveedores</h2>
        <table class="table">
          <thead>
            <tr>
              <th>No.Pro</th>
              <th>Proveedor</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(proveedor_actual, index) in proveedores_nombre"
              :key="index"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ proveedor_actual?.nombre || proveedor_actual }}</td>
            </tr>
          </tbody>
        </table>
        <div class="modal-actions">
          <button class="btn" @click="closeShowProveedores">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from "@/components/PageHeader.vue";
import solicompras from "../../services/solicompras";
import { setPageTitle } from "@/components/pageMetadata";
import ModalLoading from "@/components/ModalLoading.vue";
import { notis } from "../../services/notificaciones.js";

export default {
  name: "ComprasView",

  components: {
    PageHeader,
    ModalLoading,
  },

  data() {
    return {
      titulo: "Registro de Compras",
      addQuery: "",
      searchQuery: "",
      addQuantity: "",
      addQuantityPackage: "",
      payModal: false,
      subtotal: "",
      total: "",
      referenciaPago: "",
      confirmModal: false,
      showConfirmModal: false,
      showProveedores: false,
      addtotalPrice: "",
      articulos_cant: "",
      isEditing: false,
      productos: [],
      productosLista: [],
      proveedores_nombre: [],
      loading: false,
      error: null,
      isLoading: false,
    };
  },

  computed: {
    calcularTotal() {
      return this.productosLista.reduce(
        (total, p) => total + p.total_compra,
        0
      );
    },
  },

  methods: {
    async handleCodigoInput() {
      if (this.addQuery) {
        const productoEncontrado = this.productos.find(
          (p) => p.codigo_producto === this.addQuery
        );
        if (productoEncontrado) {
          this.searchQuery = productoEncontrado.nombre;
        } else {
          this.searchQuery = "";
        }
      } else {
        this.searchQuery = "";
      }
    },

    async handleSearchInput() {
      if (this.searchQuery) {
        const productoEncontrado = this.productos.find(
          (p) => p.nombre === this.searchQuery
        );
        if (productoEncontrado) {
          this.addQuery = productoEncontrado.codigo_producto;
        } else {
          this.addQuery = "";
        }
      } else {
        this.addQuery = "";
      }
    },

    async cargarProductos() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("auth");
        if (!token) {
          console.log("No hay token, redirigiendo a login");
          this.$router.push("/login");
          return;
        }

        const productos = await solicompras.fetchRegistros(
          "/compras/productos"
        );
        this.productos = productos || [];
        console.log("Productos cargados:", this.productos);
      } catch (error) {
        console.error("Error completo al cargar productos:", error);

        if (error.message.includes("No hay token")) {
          console.log("Token no encontrado, redirigiendo a login");
          this.$router.push("/login");
          return;
        }

        notis("error", "Error al cargar la lista de productos");
      } finally {
        this.isLoading = false;
      }
    },

    validarDatos() {
      if (!this.addQuery || !this.addtotalPrice) {
        throw new Error("Por favor complete los campos requeridos");
      }

      if (
        this.addQuantity &&
        (isNaN(this.addQuantity) || this.addQuantity <= 0)
      ) {
        throw new Error("La cantidad debe ser un número mayor a 0");
      }

      if (
        this.addtotalPrice &&
        (isNaN(this.addtotalPrice) || this.addtotalPrice <= 0)
      ) {
        throw new Error("El precio debe ser un número mayor a 0");
      }

      if (
        this.addQuantityPackage &&
        (isNaN(this.addQuantityPackage) || this.addQuantityPackage <= 0)
      ) {
        throw new Error("La cantidad de paquetes debe ser un número mayor a 0");
      }
    },

    async agregarProducto() {
      this.isLoading = true;
      try {
        this.validarDatos();

        // Guardar la referencia actual antes de limpiar
        const referenciaActual = this.referenciaPago;

        const cantidad = this.addQuantity || "1";
        const cantidadPaquetes = this.addQuantityPackage || "1";
        const precioUnitario = this.addtotalPrice || "0";

        const productoExistente = this.productos.find(
          (p) => p.codigo_producto === this.addQuery
        );

        if (!productoExistente) {
          throw new Error("Producto no encontrado");
        }

        // Calcular el total multiplicando el precio por la cantidad de paquetes
        const totalCompra = Number(precioUnitario) * Number(cantidadPaquetes);

        const productoEnLista = this.productosLista.find(
          (p) => p.codigo === this.addQuery
        );

        if (!this.isEditing) {
          if (productoEnLista) {
            productoEnLista.cantidad = Number(cantidad);
            productoEnLista.paquetes = Number(cantidadPaquetes);
            productoEnLista.total_compra = totalCompra; // Usar el nuevo total calculado
          } else {
            this.productosLista.push({
              codigo: productoExistente.codigo_producto,
              nombre: productoExistente.nombre,
              cantidad: Number(cantidad),
              paquetes: Number(cantidadPaquetes),
              proveedor: productoExistente.proveedor,
              total_compra: totalCompra, // Usar el nuevo total calculado
            });
          }
        } else {
          productoEnLista.cantidad = Number(cantidad);
          productoEnLista.paquetes = Number(cantidadPaquetes);
          productoEnLista.total_compra = totalCompra; // Usar el nuevo total calculado
          this.isEditing = false;
        }

        this.reiniciarInputs();
        // Restaurar la referencia
        this.$nextTick(() => {
          this.referenciaPago = referenciaActual;
        });

        this.$refs.codigo.focus();
      } catch (error) {
        notis("error", error.message);
      } finally {
        this.isLoading = false;
      }
    },

    isEditingTrue(index) {
      const producto = this.productosLista[index];
      if (producto) {
        this.isEditing = true;
        this.addQuantity = producto.cantidad.toString();
        this.addQuery = producto.codigo;
        this.addtotalPrice = producto.total_compra.toString();
        this.addQuantityPackage = producto.paquetes.toString();
        this.searchQuery = producto.nombre;
      }
    },

    disminuirCantidad(index) {
      if (this.productosLista[index].paquetes > 1) {
        this.productosLista[index].paquetes -= 1;
        const precioUnitarioPorPaquete =
          this.productosLista[index].total_compra /
          (this.productosLista[index].paquetes + 1);
        this.productosLista[index].total_compra -= precioUnitarioPorPaquete;
      } else {
        this.deleteProducto(index);
      }
    },

    aumentarCantidad(index) {
      this.productosLista[index].paquetes += 1;
      const precioUnitarioPorPaquete =
        this.productosLista[index].total_compra /
        (this.productosLista[index].paquetes - 1);
      this.productosLista[index].total_compra += precioUnitarioPorPaquete;
    },

    deleteProducto(index) {
      this.productosLista.splice(index, 1);
    },

    reiniciarInputs() {
      this.addQuery = "";
      this.searchQuery = "";
      this.addQuantity = "";
      this.addtotalPrice = "";
      this.addQuantityPackage = "";
      this.isEditing = false;
    },
    limpiarTodo() {
      this.addQuery = "";
      this.searchQuery = "";
      this.addQuantity = "";
      this.addtotalPrice = "";
      this.addQuantityPackage = "";
      this.referenciaPago = "";
      this.isEditing = false;
    },

    async confirmPayment() {
      if (!this.referenciaPago) {
        notis("info", "Por favor ingrese una referencia de compra");
        return;
      }

      this.isLoading = true;
      try {
        const datosCompra = {
          productosLista: this.productosLista,
          total: this.calcularTotal,
          referenciaPago: this.referenciaPago.trim(), // Aseguramos que se envíe
        };

        this.payModal = false; 

        console.log("Enviando compra:", datosCompra);
        await solicompras.registrarCompra(datosCompra);

        this.productosLista = [];
        this.limpiarTodo();
        notis("success", "Compra realizada correctamente");
      } catch (error) {
        console.error("Error al confirmar la compra:", error);
        notis("error", error.message);
      } finally {
        this.isLoading = false;
      }
    },

    payModalOpen() {
      if (this.productosLista.length > 0) {
        this.articulos_cant = this.productosLista.length;
        this.total = this.calcularTotal;
        this.payModal = true;
      } else {
        notis("info", "No hay productos en la lista");
      }
    },

    cancelPayment() {
      this.payModal = false;
    },

    confirmPaymentClose() {
      // Cerramos el modal de confirmación
      this.confirmModal = false;

      // Nos aseguramos que también el modal de pago esté cerrado
      this.payModal = false;

      // Limpiamos y reiniciamos
      this.reiniciarInputs();
      this.limpiarTodo();

      // Enfocamos el campo de código
      this.$nextTick(() => {
        this.$refs.codigo.focus();
      });
    },

    listaProveedores() {
      this.proveedores_nombre = [
        ...new Set(this.productosLista.map((p) => p.proveedor)),
      ];
      this.showProveedores = true;
      this.payModal = false;
    },

    closeShowProveedores() {
      this.showProveedores = false;
      this.payModal = true;
    },

    cancelarCompra() {
      if (this.productosLista.length > 0) {
        this.showConfirmModal = true;
      }
    },

    confirmCancel() {
      this.productosLista = [];
      this.showConfirmModal = false;
      this.limpiarTodo(); // Usamos el nuevo método aquí también
      this.$refs.codigo.focus();
    },
    cancelCancel() {
      this.showConfirmModal = false;
    },

    pushEsc(event) {
      if (event.key === "Esc" || event.key === "Escape") {
        if (this.isEditing) {
          this.isEditing = false;
          this.reiniciarInputs();
          return;
        }
        this.cancelarCompra();
      }
    },

    pushDelete(event) {
      const target = event.target;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (
        !isInputField &&
        event.key === "Backspace" &&
        this.productosLista.length > 0
      ) {
        this.productosLista.pop();
      }
    },

    pushF12(event) {
      if (event.key === "F12") {
        event.preventDefault();
        this.payModalOpen();
      }
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

    async guardarCompraTemporal() {
      if (this.productosLista.length === 0) {
        notis("info", "No hay productos para guardar");
        return;
      }

      this.isLoading = true;
      try {
        await solicompras.guardarCompraTemp({
          productosLista: this.productosLista,
          total: this.calcularTotal,
        });
        notis("success", "Compra guardada temporalmente");
      } catch (error) {
        console.error("Error al guardar compra temporal:", error);
        notis("error", error.message);
      } finally {
        this.isLoading = false;
      }
    },

    async recuperarCompraTemporal() {
      this.isLoading = true;
      try {
        const compraTemp = await solicompras.recuperarCompraTemp();
        if (compraTemp && compraTemp.productosLista) {
          this.productosLista = compraTemp.productosLista;
          notis("success", "Compra recuperada exitosamente");
        }
      } catch (error) {
        console.error("Error al recuperar compra temporal:", error);
        notis("error", error.message);
      } finally {
        this.isLoading = false;
      }
    },
  },

  async created() {
    await this.cargarProductos();
  },

  mounted() {
    window.addEventListener("keydown", this.pushDelete);
    window.addEventListener("keydown", this.pushEsc);
    window.addEventListener("keydown", this.pushF12);
    this.$refs.codigo.focus();
    setPageTitle("Crear Compras");
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.pushDelete);
    window.removeEventListener("keydown", this.pushEsc);
    window.removeEventListener("keydown", this.pushF12);
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

* {
  font-family: "Montserrat", sans-serif;
  box-sizing: border-box;
}

/* Layout Principal */
.wrapper {
  padding: 1.5rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 60px);
}

.main-container {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.purchase-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1.25rem;
  border: 1px solid #e9ecef;
}

/* Nueva distribución para la sección de búsqueda */
.search-section {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 1.5rem;
  align-items: start;
}

.quantities-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #344767;
  font-size: 0.875rem;
}

.form-input {
  padding: 0.625rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.button-group {
  display: flex;
  align-items: flex-end;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  padding: 0.625rem 1.25rem;
  border-radius: 4px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.btn-primary:hover {
  background-color: #2563eb;
}

/* Responsive */
@media (max-width: 1024px) {
  .search-section {
    grid-template-columns: 1fr 1fr;
  }

  .quantities-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .search-section,
  .quantities-section {
    grid-template-columns: 1fr;
  }

  .form-section {
    padding: 1rem;
  }
}

.footer-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.shortcut-badge {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn i {
  font-size: 1.1rem;
}

.btn-cancel {
  background-color: #fff;
  color: #dc3545;
  border: 1px solid #dc3545;
}

.btn-cancel:hover {
  background-color: #dc3545;
  color: #fff;
}

.btn-process {
  background-color: #0d6efd;
  color: #fff;
  min-width: 160px;
}

.btn-process:hover {
  background-color: #0b5ed7;
}

.process-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Contenedor del total */
.total-container {
  background-color: #f8f9fa;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  min-width: 200px;
}

.total-label {
  display: block;
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.total-amount {
  color: #344767;
  font-size: 1.75rem;
  font-weight: 700;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.currency {
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 1.5rem;
  }

  .action-group {
    width: 100%;
    justify-content: center;
  }

  .total-container {
    width: 100%;
    text-align: center;
  }

  .total-amount {
    justify-content: center;
  }
}

/* Contenedores de Input */
.input-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 5px;
  /* Reducido el margen */
}

.input-container label {
  white-space: nowrap;
  margin-right: 0.5vw;
}

.input-superior {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 0.5%;
  /* Reducido el margen inferior */
}

.input-container-exterior {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#div_nombre {
  width: 80%;
  padding-left: 10px;
  /* Reducido el padding */
}

/* Campos de entrada */
.campo {
  padding: 5px 8px;
  /* Reducido el padding */
  width: 100%;
  font-size: 14px;
  min-height: 28px;
  /* Reducido ligeramente */
  border-radius: 8px;
  /* Más compacto */
  border: 1px solid #ddd;
  width: 180px;
  /* Reducido el ancho */
}

.label-input {
  font-size: 14px;
  margin-right: 2%;
  margin-bottom: 5px;
  font-weight: bold;
}

/* Tabla */
.table-container {
  width: 100%;
  border: 1px solid #1a1a1a;
  border-radius: 4px; /* Reducido de 8px a 4px */
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
  z-index: 1;
  background-color: white;
}

.table th,
.table td {
  padding: 8px;
  border: 1px solid #ddd;
  text-align: center;
}

.table thead th {
  background-color: #e7e4e4;
  text-align: center;
  border-bottom: 1px solid #ddd;
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

.btn-botones-accion {
  background: transparent;
  border: none;
  padding: 5px;
  margin: 0 2px;
  font-size: 22px;
  cursor: pointer;
}

.agregar-producto {
  background-color: #46ce10;
  width: 100px;
  border: none;
  color: white;
  cursor: pointer;
}

.agregar-producto:hover {
  background-color: #38a50d;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

/* Botones de acción */
#btnEliminar:hover {
  color: #b72433;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#btnAumentar:hover {
  color: #46ce10;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#btnDisminuir:hover {
  color: #13e4d9;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

/* Contenedor Final */
.end-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  border-top: solid rgb(75, 75, 75) 1px;
  margin-top: 20px;
  padding: 10px;
}

.end-container-cancelar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.end-container-cobro {
  display: flex;
  width: 100%;
  justify-content: end;
  align-items: center;
  height: 100px;
}

.end-container-cobro-p {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.end-container-cobro p {
  text-align: center;
  margin: 0;
  color: #094688;
}

/* Botones de Pago */
#boton-cobrar {
  height: 70px;
  margin-right: 15px;
  background-color: #094688;
  font-weight: bold;
  color: white;
}

#boton-cobrar:hover {
  background-color: #093c72;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#cancelar-compra {
  height: 60%;
  margin-right: 15px;
  background-color: rgb(185, 10, 10);
  font-weight: bold;
  font-size: 12px;
  color: white;
}

#cancelar-compra:hover {
  background-color: #ad0314;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-around;
}

/* Botones Modal */
.modalShowConfirm-Si,
.cancelar,
.close-btn {
  background-color: #dc3545;
  z-index: 1000;
}

.modalShowConfirm-no,
.confirmar-pago {
  background-color: #4caf50;
  z-index: 1000;
}

.modalShowConfirm-Si:hover,
.cancelar:hover,
.close-btn:hover {
  background-color: #bd0d1f;
}

.modalShowConfirm-no:hover,
.confirmar-pago:hover {
  background-color: #45a049;
}

/* Otros elementos */
#total {
  font-weight: bolder;
  font-size: 40px;
}

.texto-tecla-boton {
  display: inline-block;
  transform: rotate(-90deg);
}

.texto-esc {
  color: #d30015;
}

/* Scrollbar personalizado */
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

/* Media Queries */
@media screen and (max-width: 768px) {
  .input-container-exterior {
    flex-direction: column;
    align-items: stretch;
  }

  #div_nombre {
    width: 100%;
    padding-left: 0;
    margin-bottom: 10px;
  }

  .input-container {
    flex-direction: column;
    align-items: stretch;
  }

  .campo {
    width: 100%;
  }

  .end-container-cobro {
    flex-direction: column;
    height: auto;
    align-items: stretch;
  }

  .end-container {
    flex-direction: column;
    text-align: center;
  }

  #boton-cobrar,
  #cancelar-compra {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }

  .modal-content {
    width: 95%;
  }
}

@media screen and (max-width: 480px) {
  .wrapper {
    padding: 8px;
  }

  #total {
    font-size: 30px;
  }

  .btn-botones-accion {
    font-size: 18px;
  }

  .table th,
  .table td {
    padding: 6px;
    font-size: 14px;
  }

  .label-input {
    font-size: 12px;
  }

  .modal-content {
    padding: 15px;
  }

  .agregar-producto {
    width: 100%;
  }

  #cancelar-compra span {
    font-size: 13px;
  }
}

/* =======================================================
   Modo Oscuro
======================================================= */
.dark .wrapper {
  background-color: #1a1a1a;
  color: #e0e0e0;
}

.dark .main-container {
  background-color: #242424;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Formularios en Modo Oscuro */
.dark .form-section {
  background-color: #2a2a2a;
  border-color: #333333;
}

.dark .form-label {
  color: #e0e0e0;
}

.dark .form-input {
  background-color: #333333;
  border-color: #404040;
  color: #ffffff;
}

.dark .form-input::placeholder {
  color: #666666;
}

.dark .form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* Tabla en Modo Oscuro */
.dark .table-container {
  border-color: #333333;
}

.dark .table thead {
  background-color: #2a2a2a;
}

.dark .table th {
  background-color: #333333;
  color: #e0e0e0;
  border-bottom-color: #404040;
}

.dark .table td {
  color: #e0e0e0;
  border-bottom-color: #404040;
}

.dark .table tbody tr:hover {
  background-color: #2d2d2d;
}

/* DataList en Modo Oscuro */
.dark datalist {
  background-color: #333333;
  color: #ffffff;
}

/* Footer en Modo Oscuro */
.dark .footer-section {
  border-top-color: #333333;
}

.dark .shortcut-badge {
  background-color: #333333;
  border-color: #404040;
  color: #b0b0b0;
}

.dark .btn-cancel {
  background-color: #2a2a2a;
  color: #ff4d4d;
  border-color: #ff4d4d;
}

.dark .btn-cancel:hover {
  background-color: #ff4d4d;
  color: #ffffff;
}

.dark .btn-process {
  background-color: #1a56db;
}

.dark .btn-process:hover {
  background-color: #1e429f;
}

.dark .total-container {
  background-color: #2a2a2a;
  border-color: #333333;
}

.dark .total-label {
  color: #b0b0b0;
}

.dark .total-amount {
  color: #ffffff;
}

.dark .currency {
  color: #b0b0b0;
}

/* Modales en Modo Oscuro */
.dark .modal-content {
  background-color: #242424;
  color: #e0e0e0;
}

.dark .modal-overlay {
  background: rgba(0, 0, 0, 0.7);
}

/* Input con autocompletado en Modo Oscuro */
.dark input:-webkit-autofill,
.dark input:-webkit-autofill:hover,
.dark input:-webkit-autofill:focus {
  -webkit-text-fill-color: #ffffff;
  -webkit-box-shadow: 0 0 0px 1000px #333333 inset;
  transition: background-color 5000s ease-in-out 0s;
}

/* Scrollbar en Modo Oscuro */
.dark ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.dark ::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #4a4a4a;
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #555555;
}

/* Botones de Acción en Modo Oscuro */
.dark .btn-icon {
  color: #ff4d4d;
}

.dark .btn-icon:hover {
  color: #ff6666;
}

/* Estados de Input Deshabilitados en Modo Oscuro */
.dark .form-input:disabled {
  background-color: #2a2a2a;
  color: #666666;
  border-color: #333333;
}

/* notisas y Mensajes en Modo Oscuro */
.dark .notis {
  background-color: #2a2a2a;
  border-color: #333333;
}

.dark .notis-danger {
  color: #ff4d4d;
  background-color: rgba(255, 77, 77, 0.1);
  border-color: rgba(255, 77, 77, 0.2);
}

.dark .notis-success {
  color: #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.2);
}

/* Estilo para los div-modal-resumen */
.div-modal-resumen {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.div-modal-resumen label {
  font-size: 14px;
  margin-bottom: 5px;
  font-weight: bold;
  color: #000;
}

.div-modal-resumen input {
  padding: 5px 8px;
  width: 100%;
  font-size: 14px;
  min-height: 28px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

/* Para el modo oscuro */
.dark .div-modal-resumen label {
  color: #fff;
}

.dark .div-modal-resumen input {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

.dark .table-container {
  border-color: #1a1a1a;
  background-color: #242424;
}

.dark .table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.dark .table thead {
  background-color: #1a1a1a;
}

.dark .table th {
  background-color: #1a1a1a;
  color: #e0e0e0;
  border-bottom: 1px solid #151515;
  padding: 12px 16px;
  font-weight: 600;
}

.dark .table td {
  background-color: #242424;
  color: #e0e0e0;
  border-bottom: 1px solid #151515;
  padding: 12px 16px;
}

.dark .table tr:hover td {
  background-color: #2a2a2a;
}

/* Ajuste de bordes redondeados */
.dark .table thead th:first-child {
  border-top-left-radius: 4px;
}

.dark .table thead th:last-child {
  border-top-right-radius: 4px;
}

.dark .table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 4px;
}

.dark .table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 4px;
}

/* Estilos para las celdas de opciones */
.dark .table td.actions-cell {
  background-color: #242424;
}

.dark .table tr:hover td.actions-cell {
  background-color: #2a2a2a;
}

/* Scrollbar personalizada para modo oscuro */
.dark .table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.dark .table-container::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.dark .table-container::-webkit-scrollbar-thumb {
  background: #333333;
  border-radius: 4px;
}

.dark .table-container::-webkit-scrollbar-thumb:hover {
  background: #404040;
}
</style>
