<template>
  <div class="wrapper">
    <PageHeader :titulo="titulo" />

    <div class="main-container">
      <form @submit.prevent="agregarProducto" autocomplete="off">
        <div class="input-container input-superior">
          <div class="input-container" id="div_codigo">
            <label for="codigo-busqueda" class="label-input">Código del producto:</label>
            <input 
              list="codigosList"
              name="codigo-busqueda" 
              ref="codigo" 
              type="text" 
              class="campo" 
              id="campo_codigo" 
              tabindex="1" 
              required
              v-model="addQuery" 
              placeholder="Ingresar código" 
              :disabled="isEditing"
              @input="handleCodigoInput"
            />
            <datalist id="codigosList">
              <option v-for="producto in productos" :key="producto.id_producto" :value="producto.codigo_producto">
                {{ producto.codigo_producto }} - {{ producto.nombre }}
              </option>
            </datalist>
          </div>

          <div class="input-container" id="div_nombre">
            <label class="label-input">Buscar por nombre:</label>
            <input 
              list="productosList" 
              class="campo" 
              id="campo_nombre" 
              :disabled="isEditing" 
              v-model="searchQuery"
              placeholder="Ingresar nombre" 
              @input="handleSearchInput"
            >
            <datalist id="productosList">
              <option v-for="producto in productos" :key="producto.id_producto" :value="producto.nombre">
                {{ producto.codigo_producto }} - {{ producto.nombre }}
              </option>
            </datalist>
          </div>
        </div>

        <div class="input-container-exterior">
          <div class="input-container">
            <label for="cantidad" class="label-input">Cant. Unitaria:</label>
            <input 
              name="cantidad" 
              class="campo" 
              type="number" 
              tabindex="3" 
              placeholder="Cantidad unitaria"
              v-model="addQuantity" 
              min="1"
            />
          </div>

          <div class="input-container">
            <label for="cantidad" class="label-input">Cant. paquetes:</label>
            <input 
              name="cantidad_paquetes" 
              class="campo" 
              type="number" 
              tabindex="4" 
              placeholder="Cantidad total de paquetes"
              v-model="addQuantityPackage" 
              min="1"
            />
          </div>

          <div class="input-container">
            <label for="total-compra" class="label-input">Prec./paquete:</label>
            <input 
              name="total-compra" 
              class="campo" 
              type="number" 
              step="0.01" 
              tabindex="5"
              placeholder="Total compra por paquete" 
              required 
              v-model="addtotalPrice" 
              min="0.01"
            />
          </div>

          <div class="boton-container">
            <button class="btn btn-success agregar-producto" type="submit">
              <i class="bi bi-plus-circle-fill"> Añadir</i>
            </button>
          </div>
        </div>
      </form>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th class="th_small">N.º</th>
              <th class="th_medium">Código</th>
              <th class="th_large">Nombre</th>
              <th class="th_small">Paquetes</th>
              <th class="th_small">Unidad/Paquetes</th>
              <th class="medium">Proveedor</th>
              <th class="th_small">Total Compra</th>
              <th style="width: 100px">Opciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(producto, index) in productosLista" :key="index" @click="isEditingTrue(index)">
              <td>{{ index + 1 }}</td>
              <td>{{ producto.codigo }}</td>
              <td>{{ producto.nombre }}</td>
              <td>{{ producto.paquetes }}</td>
              <td>{{ producto.cantidad }}</td>
              <td>{{ producto.proveedor?.nombre || producto.proveedor }}</td>
              <td>{{ producto.total_compra }}</td>
              <td class="botones-accion">
                <button class="btn btn-botones-accion" @click.stop="deleteProducto(index)">
                  <i class="bi bi-x-circle-fill"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="end-container">
      <div class="end-container-cancelar">
        <p class="texto-tecla-boton texto-esc">Esc</p>
        <button class="btn btn-end" id="cancelar-compra" @click="cancelarCompra">
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
            <tr v-for="(proveedor_actual, index) in proveedores_nombre" :key="index">
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

export default {
  name: 'ComprasView',
  
  components: {
    PageHeader,
  },

  data() {
    return {
      titulo: 'Registro de Compras',
      addQuery: "",
      searchQuery: "",
      addQuantity: "",
      addQuantityPackage: "",
      payModal: false,
      subtotal: "",
      total: "",
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
      error: null
    };
  },

  computed: {
    calcularTotal() {
      return this.productosLista.reduce((total, p) => total + p.total_compra, 0);
    },
  },

  methods: {
    async handleCodigoInput() {
      if (this.addQuery) {
        const productoEncontrado = this.productos.find(p => p.codigo_producto === this.addQuery);
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
        const productoEncontrado = this.productos.find(p => p.nombre === this.searchQuery);
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
      try {
        const token = localStorage.getItem('auth');
        if (!token) {
          console.log('No hay token, redirigiendo a login');
          this.$router.push('/login');
          return;
        }

        const productos = await solicompras.fetchRegistros('/compras/productos');
        this.productos = productos || [];
        console.log('Productos cargados:', this.productos);
      } catch (error) {
        console.error('Error completo al cargar productos:', error);
        
        if (error.message.includes('No hay token')) {
          console.log('Token no encontrado, redirigiendo a login');
          this.$router.push('/login');
          return;
        }
        
        alert('Error al cargar la lista de productos');
      }
    },

    validarDatos() {
      if (!this.addQuery || !this.addtotalPrice) {
        throw new Error('Por favor complete los campos requeridos');
      }

      if (this.addQuantity && (isNaN(this.addQuantity) || this.addQuantity <= 0)) {
        throw new Error('La cantidad debe ser un número mayor a 0');
      }

      if (this.addtotalPrice && (isNaN(this.addtotalPrice) || this.addtotalPrice <= 0)) {
        throw new Error('El precio debe ser un número mayor a 0');
      }

      if (this.addQuantityPackage && (isNaN(this.addQuantityPackage) || this.addQuantityPackage <= 0)) {
        throw new Error('La cantidad de paquetes debe ser un número mayor a 0');
      }
    },

    async agregarProducto() {
      try {
        this.validarDatos();

        const cantidad = this.addQuantity || "1";
        const cantidadPaquetes = this.addQuantityPackage || "1";

        const productoExistente = this.productos.find(p => p.codigo_producto === this.addQuery);
        
        if (!productoExistente) {
          throw new Error('Producto no encontrado');
        }

        const productoEnLista = this.productosLista.find(p => p.codigo === this.addQuery);

        if (!this.isEditing) {
          if (productoEnLista) {
            productoEnLista.cantidad = Number(cantidad);
            productoEnLista.paquetes = Number(cantidadPaquetes);
            productoEnLista.total_compra = Number(this.addtotalPrice);
          } else {
            this.productosLista.push({
              codigo: productoExistente.codigo_producto,
              nombre: productoExistente.nombre,
              cantidad: Number(cantidad),
              paquetes: Number(cantidadPaquetes),
              proveedor: productoExistente.proveedor,
              total_compra: Number(this.addtotalPrice)
            });
          }
        } else {
          productoEnLista.cantidad = Number(cantidad);
          productoEnLista.paquetes = Number(cantidadPaquetes);
          productoEnLista.total_compra = Number(this.addtotalPrice);
          this.isEditing = false;
        }

        this.reiniciarInputs();
        this.$refs.codigo.focus();
      } catch (error) {
        alert(error.message);
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
        const precioUnitarioPorPaquete = this.productosLista[index].total_compra / (this.productosLista[index].paquetes + 1);
        this.productosLista[index].total_compra -= precioUnitarioPorPaquete;
      } else {
        this.deleteProducto(index);
      }
    },

    aumentarCantidad(index) {
      this.productosLista[index].paquetes += 1;
      const precioUnitarioPorPaquete = this.productosLista[index].total_compra / (this.productosLista[index].paquetes - 1);
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

    async confirmPayment() {
      try {
        this.loading = true;
        await solicompras.registrarCompra({
          productosLista: this.productosLista,
          total: this.calcularTotal
        });
        
        this.confirmModal = true;
        this.payModal = false;
        this.productosLista = [];
        this.reiniciarInputs();
      } catch (error) {
        console.error('Error al confirmar la compra:', error);
        alert(error.message);
      } finally {
        this.loading = false;
      }
    },

    payModalOpen() {
      if (this.productosLista.length > 0) {
        this.articulos_cant = this.productosLista.length;
        this.total = this.calcularTotal;
        this.payModal = true;
      } else {
        alert('No hay productos en la lista');
      }
    },

    cancelPayment() {
      this.payModal = false;
    },

    confirmPaymentClose() {
      this.confirmModal = false;
      this.reiniciarInputs();
      this.$refs.codigo.focus();
    },

    listaProveedores() {
      this.proveedores_nombre = [...new Set(this.productosLista.map(p => p.proveedor))];
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
      this.reiniciarInputs();
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

      if (!isInputField && event.key === "Backspace" && this.productosLista.length > 0) {
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
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
    },

    async guardarCompraTemporal() {
      if (this.productosLista.length === 0) {
        alert('No hay productos para guardar');
        return;
      }

      try {
        await solicompras.guardarCompraTemp({
          productosLista: this.productosLista,
          total: this.calcularTotal
        });
        alert('Compra guardada temporalmente');
      } catch (error) {
        console.error('Error al guardar compra temporal:', error);
        alert(error.message);
      }
    },

    async recuperarCompraTemporal() {
      try {
        const compraTemp = await solicompras.recuperarCompraTemp();
        if (compraTemp && compraTemp.productosLista) {
          this.productosLista = compraTemp.productosLista;
          alert('Compra recuperada exitosamente');
        }
      } catch (error) {
        console.error('Error al recuperar compra temporal:', error);
        alert(error.message);
      }
    }
  },

  async created() {
    await this.cargarProductos();
  },

  mounted() {
    window.addEventListener("keydown", this.pushDelete);
    window.addEventListener("keydown", this.pushEsc);
    window.addEventListener("keydown", this.pushF12);
    this.$refs.codigo.focus();
    document.title = "Crear Compras";
    this.changeFavicon('/img/spiderman.ico');
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.pushDelete);
    window.removeEventListener("keydown", this.pushEsc);
    window.removeEventListener("keydown", this.pushF12);
  }
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
  padding: 16px;
  display: flex;
  height: 80%;
  flex-direction: column;
  justify-content: space-between;
}

/* Contenedores de Input */
.input-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 10px;
}

.input-container label {
  white-space: nowrap;
  margin-right: 0.5vw;
}

.input-superior {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1%;
}

.input-container-exterior {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#div_nombre {
  width: 80%;
  padding-left: 20px;
}

/* Campos de entrada */
.campo {
  padding: 0px 10px;
  width: 100%;
  font-size: 14px;
  min-height: 30px;
  border-radius: 10px;
  border: 1px solid #ddd;
  width: 200px;
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

/* Botones */
.btn {
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  border-radius: 10px;
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
</style>
