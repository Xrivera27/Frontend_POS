<template>
  <div class="encabezado">
    <h1>Crear Compras</h1>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr />

  <div class="wrapper">
    <div class="main-container">
      <form @submit.prevent="agregarProducto" autocomplete="off">

        <div class="input-container input-superior">
          <div class="input-container" id="div_codigo">
            <label for="codigo-busqueda" class="label-input">Codigo del producto:</label>
            <input name="codigo-busqueda" ref="codigo" type="text" class="campo" id="campo_codigo" tabindex="1" required
              v-model="addQuery" placeholder="Ingresar codigo" :disabled="isEditing" />

          </div>

          <div class="input-container" id="div_nombre">
            <label class="label-input">
              Buscar por nombre: </label>
            <input list="idDataList" class="campo" id="campo_nombre" :disabled="isEditing" v-model="addName"
              placeholder="Ingresar nombre" @input="colocarCodigo">
            <datalist id="idDataList">
              <option v-for="(producto, index) in productos" :key="index" :value="producto.codigo">
                {{ producto.codigo }} : {{ producto.nombre }}

              </option>
            </datalist>
          </div>
        </div>

        <div class="input-container-exterior">

          <div class="input-container">
            <label for="cantidad" class="label-input">Cant. Unitaria:</label>
            <input name="cantidad" class="campo" type="text" tabindex="3" placeholder="Cantidad unitaria"
              v-model="addQuantity" />
          </div>

          <div class="input-container">
            <label for="cantidad" class="label-input">Cant. paquetes:</label>
            <input name="cantidad" class="campo" type="text" tabindex="3" placeholder="Cantidad total de paquetes"
              v-model="addQuantityPackage" />
          </div>

          <div class="input-container">
            <label for="total-compra" class="label-input">Prec./paquete:</label>
            <input name="total-compra" class="campo" type="text" step="0.01" tabindex="2"
              placeholder="Total compra por paquete" required v-model="addtotalPrice" />
          </div>

          <div class="boton-container">
            <button class="btn btn-success agregar-producto" type="submit">
              <i class="bi bi-plus-circle-fill"> Añadir</i>
            </button>
          </div>
        </div>



      </form>

      <div class="table-container">
        <table class="table" border="2">
          <thead>
            <th class="th_small">N.º</th>
            <th class="th_medium">Codigo</th>
            <th class="th_large">Nombre</th>
            <th class="th_small">Paquetes</th>
            <th class="th_small">Unidad/Paquetes</th>
            <th class="medium">Proveedor</th>
            <th class="th_small">Total Compra</th>

            <th style="width: 100px">Opciones</th>
          </thead>
          <tbody>
            <tr v-for="(producto, index) in productosLista" :key="index" @click="isEditingTrue(index)">
              <td>{{ index + 1 }}</td>
              <td>{{ producto.codigo }}</td>
              <td>{{ producto.nombre }}</td>
              <td>{{ producto.paquetes }}</td>
              <td>{{ producto.cantidad }}</td>
              <td>{{ producto.proveedor }}</td>
              <td>{{ producto.total_compra }}</td>
              <td class="botones-accion">
                <button id="btnDisminuir" class="btn btn-botones-accion" @click="disminuirCantidad(index)">
                  <b><i class="bi bi-dash-circle-fill"></i></b>
                </button>
                <button id="btnAumentar" class="btn btn-botones-accion" @click="aumentarCantidad(index)">
                  <b><i class="bi bi-plus-circle-fill"></i></b>
                </button>
                <button id="btnEliminar" class="btn btn-botones-accion" @click="deleteProducto(index)">
                  <b><i class="bi bi-x-circle-fill"></i></b>
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
        <button class="btn btn-end" id="cancelar-compra" @click="cancelarcompra">
          Cancelar compra
        </button>
      </div>

      <AgregarProductoModal />

      <div class="end-container-cobro">

        <p class="texto-tecla-boton texto-f12">F12</p>
        <button class="btn btn-end" id="boton-cobrar" @click="payModalOpen">
          Pagar
        </button>
        <div class="end-container-cobro-p">
          <p id="total">{{ calcularTotal }}</p>
          <p id="moneda">Lempiras</p>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="payModal">
      <div class="modal-content">
        <h2>Resumen de Compra</h2>
        <div class="div-modal-resumen">
          <label for="subtotal">Cantidad total Articulos:</label>
          <input type="text" id="subtotal" v-model="articulos_cant" disabled />
        </div>

        <div class="div-modal-resumen">
          <label for="total">Total:</label>
          <input type="text" id="totalModal" v-model="total" disabled />
        </div>

        <div class="div-modal-resumen">
          <label for="proveedores">Proveedores:</label>
          <button @click="listaProveedores" id="boton-ver-proveedor">
            Proveedores
          </button>
        </div>

        <div class="modal-actions">
          <button class="btn confirmar-pago" @click="confirmPayment">
            Confirmar Pago
          </button>
          <button class="btn cancelar" @click="cancelPayment">Cancelar</button>
        </div>
      </div>
    </div>
    <div class="modal" v-if="confirmModal">
      <div class="modal-overlay">
        <div class="modal-content">
          <h2>Compra Realizada.</h2>
          <div class="modal-summary"></div>
          <button @click="confirmPaymentClose" class="btn close-btn">
            Cerrar
          </button>
        </div>
      </div>
    </div>

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

    <div class="modal-overlay" v-if="showProveedores">
      <div class="modal-content">
        <h2>Proveedores</h2>
        <table border="1">
          <thead>
            <tr>
              <th>No.Pro</th>
              <th>Proveedor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(proveedor_actual, index) in proveedores_nombre" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ proveedor_actual }}</td>
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
import ProfileButton from "../components/ProfileButton.vue";
import AgregarProductoModal from "../components/AgregarProductoModal.vue";
export default {
  components: {
    ProfileButton,
    AgregarProductoModal,
  },
  data() {
    return {
      addQuery: "",
      addQuantity: "",
      addQuantityPackage: "",
      payModal: false,
      subtotal: "",
      total: "",
      confirmModal: "",
      showConfirmModal: false,
      showProveedores: false,
      addtotalPrice: "",
      articulos_cant: "",
      isEditing: false,
      productos: [
        {
          codigo: "1",
          nombre: "Leche",
          cantidad: 0, // La cantidad será introducida por el usuario
          total_compra: 25,
          proveedor: 0,
        },
        {
          codigo: "2",
          nombre: "Pan",
          cantidad: 0, // La cantidad será introducida por el usuario
          total_compra: 15,
          proveedor: 2,
        },
        {
          codigo: "3",
          nombre: "Arroz",
          cantidad: 0, // La cantidad será introducida por el usuario
          total_compra: 12,
          proveedor: 1,
        },
        {
          codigo: "4",
          nombre: "Aceite",
          cantidad: 0, // La cantidad será introducida por el usuario
          total_compra: 30,
          proveedor: 3,
        },
        {
          codigo: "5",
          nombre: "Huevos",
          cantidad: 0, // La cantidad será introducida por el usuario
          total_compra: 18,
          proveedor: 0,
        },
        {
          codigo: "6",
          nombre: "Azúcar",
          cantidad: 0, // La cantidad será introducida por el usuario
          total_compra: 10,
          proveedor: 0,
        },
        {
          codigo: "7",
          nombre: "Sal",
          cantidad: 0, // La cantidad será introducida por el usuario
          total_compra: 5,
          proveedor: 1,
        },
        {
          codigo: "8",
          nombre: "Café",
          cantidad: 0, // La cantidad será introducida por el usuario
          total_compra: 50,
          proveedor: 5,
        },
        {
          codigo: "9",
          nombre: "Harina",
          cantidad: 0, // La cantidad será introducida por el usuario
          total_compra: 20,
          proveedor: 2,
        },
        {
          codigo: "10",
          nombre: "Pasta",
          cantidad: 0, // La cantidad será introducida por el usuario
          total_compra: 14,
          proveedor: 0,
        },
        {
          codigo: "11",
          nombre: "Mantequilla",
          cantidad: 0, // La cantidad será introducida por el usuario
          total_compra: 22,
          proveedor: 1,
        },
        // Más clientes...
      ],
      productosLista: [],
    };
  },

  computed: {
    calcularTotal() {
      let totalActual = 0;
      this.productosLista.forEach((p) => (totalActual += p.total_compra));
      return totalActual;
    },
  },

  methods: {
    pushEsc(event) {
      if (event.key === "Esc" || event.key === "Escape") {
        if (this.isEditing) {
          this.isEditing = false;
          this.reiniciarInputs();
          return;
        }
        this.cancelarcompra();
      }
    },
    pushDelete(event) {
      const target = event.target;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (!isInputField && event.key === "Backspace") {
        this.deleteUltimo();
      }
    },

    pushF12(event) {
      if (event.key === "F12") {
        event.preventDefault();
        this.payModalOpen();
      }
    },

    pushN(event) {
      if (event.key === "n" || event.key === "N") {
        alert("Modal para añadir nuevo producto");
        this.reiniciarInputs();
      }
    },

    agregarProducto() {
      if (!this.addQuery || !this.addtotalPrice) {
        alert("Campo vacio");
        return;
      }

      if (
        (this.addQuantity && isNaN(this.addQuantity)) ||
        (this.addtotalPrice && isNaN(this.addtotalPrice)) ||
        (this.addQuantityPackage && isNaN(this.addQuantityPackage))
      ) {
        alert("Ingresa un dato valido");
        return;
      }

      if (this.addQuantity < 0 || this.addtotalPrice < 0 || this.addQuantityPackage < 0) {
        alert("Ingresa un dato mayor a 0");
        return;
      }

      if (!this.addQuantity) {
        this.addQuantity = "1";
      }


      if (!this.addQuantityPackage) {
        this.addQuantityPackage = "1";
      }



      const newProduct = this.productos.find((p) => p.codigo === this.addQuery);
      const exitProduct = this.productosLista.find(
        (p) => p.codigo === this.addQuery
      );


      if (!this.isEditing) {
        if (!newProduct) {
          alert("No existe el producto");
        } else {
          if (exitProduct) {
            exitProduct.cantidad += Number(this.addQuantity);
            exitProduct.total_compra += Number(this.addtotalPrice);
          } else {
            newProduct.cantidad = Number(this.addQuantity);
            newProduct.total_compra = Number(this.addtotalPrice);
            this.productosLista.push(newProduct);
          }
          this.reiniciarInputs();
          this.$refs.codigo.focus();
        }
      }
      else {
        exitProduct.cantidad = Number(this.addQuantity);
        exitProduct.total_compra = Number(this.addtotalPrice);
      }

    },

    colocarCodigo() {
      const productoSeleccionado = this.productos.find(producto => producto.codigo === this.addName);
      // Si existe, asignamos el código al campo correspondiente
      if (productoSeleccionado) {
        this.addQuery = productoSeleccionado.codigo;
        this.addName = productoSeleccionado.nombre;
      } else {
        this.addQuery = ''; // Si no encuentra coincidencia, vacía el código
      }
    },


    isEditingTrue(index) {

      if (this.productosLista[index]) {
        this.isEditing = true;
        this.addQuantity = this.productosLista[index].cantidad;
        this.addQuery = this.productosLista[index].codigo;
        this.addtotalPrice = this.productosLista[index].total_compra;
        this.addName = this.productosLista[index].nombre;

      }

    },

    disminuirCantidad(index) {
      if (this.productosLista[index].cantidad > 0) {
        this.productosLista[index].cantidad -= 1;
        if (this.productosLista[index].cantidad == 0) {
          this.deleteProducto(index);
        }
      }
    },
    aumentarCantidad(index) {
      this.productosLista[index].cantidad += 1;
    },
    deleteUltimo() {
      if (this.productosLista) {
        this.productosLista.pop();
      }
    },
    deleteProducto(index) {
      this.productosLista.splice(index, 1);
    },

    confirmCancel() {
      this.productosLista = [];
      this.showConfirmModal = false;
      this.cambio = 0;
    },
    cancelCancel() {
      this.showConfirmModal = false;
    },
    cancelarcompra() {
      if (this.productosLista.length != 0) {
        this.showConfirmModal = true;
      }
    },
    listaProveedores() {
      this.proveedores_nombre = this.productosLista.map((p) => p.proveedor);
      this.showProveedores = true;
      this.payModal = false;
    },

    closeShowProveedores() {
      this.showProveedores = false;
      this.payModal = true;
    },

    reiniciarInputs() {
      this.addQuery = "";
      this.addQuantity = "";
      this.addtotalPrice = "";
      this.addName = "";
      this.addQuantityPackage = "";
    },

    payModalOpen() {
      if (this.productosLista.length > 0) {
        this.articulos_cant = this.productosLista.length;
        this.total = `${this.calcularTotal}`;
        this.payModal = true;
        this.paymentMethod = "";
      }
    },
    cancelPayment() {
      this.payModal = false;
    },
    selectRadioButton(opcion) {
      if (opcion === "cash") {
        this.paymentMethod = "cash";
      } else {
        this.paymentMethod = "card";
      }
    },
    confirmPayment() {
      this.confirmModal = true;
      this.payModal = false;
      this.productosLista = [];
    },

    confirmPaymentClose() {
      this.confirmModal = false;
    },
    changeFavicon(iconPath) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
    },
  },

  mounted() {
    // Añade el manejador de eventos cuando el componente se monta
    window.addEventListener("keydown", this.pushDelete);
    window.addEventListener("keydown", this.pushEsc);
    window.addEventListener("keydown", this.pushF12);
    window.addEventListener("keydown", this.pushN);
    this.$refs.codigo.focus();
    document.title = "Crear Compras";
    this.changeFavicon('/img/spiderman.ico'); // Usar la ruta correcta
  },
  beforeUnmount() {
    // Elimina el manejador de eventos cuando el componente se destruye
    window.removeEventListener("keydown", this.pushDelete);
    window.removeEventListener("keydown", this.pushEsc);
    window.removeEventListener("keydown", this.pushF12);
    window.removeEventListener("keydown", this.pushN);
  },
};
</script>

<style scoped>
/* Estilos generales */
body {
  font-family: Arial, sans-serif;
}

/* Encabezado */
.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: 2em;
}

/* Línea horizontal */
hr {
  margin: 20px 0;
}

/* Contenedor principal */
.wrapper {
  display: flex;
  flex-direction: column;
  margin: 20px;
}

/* Formulario */
.main-container {
  display: flex;
  flex-direction: column;
}

/* Contenedores de entrada */
.input-container,
.input-container-exterior {
  margin-bottom: 15px;
}

.label-input {
  display: block;
  margin-bottom: 5px;
}

/* Campos de entrada */
.campo {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Botones */
.boton-container {
  margin-top: 20px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.botones-accion {
  display: flex;
  /* Usar flexbox */
  justify-content: space-around;
  /* Espaciado igual entre botones */
}

.btn-botones-accion {
  background-color: transparent;
  /* Fondo transparente */
  border: none;
  /* Sin borde */
  cursor: pointer;
  /* Mano al pasar el mouse */
  transition: color 0.2s;
  /* Transición suave para el color */
}

.btn-botones-accion:hover {
  color: #007bff;
  /* Color azul al pasar el mouse */
}

.btn-end {
  background-color: #dc3545;
  /* Rojo para cancelar */
  color: white;
  /* Texto blanco */
  border: none;
  /* Sin borde */
  padding: 10px 20px;
  /* Relleno interno */
  border-radius: 4px;
  /* Bordes redondeados */
  cursor: pointer;
  /* Mano al pasar el mouse */
}

.btn-end:hover {
  background-color: #c82333;
  /* Rojo oscuro al pasar el mouse */
}

/* Contenedor de tabla */
.table-container {
  margin-top: 20px;
  overflow-x: auto;
  /* Permite desplazamiento horizontal si es necesario */
}

/* Tabla */
.table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  text-align: left;
  border: 1px solid #ddd;
}

.th_small {
  width: 50px;
}

.th_medium {
  width: 100px;
}

.th_large {
  width: 200px;
}

.medium {
  width: 150px;
}

/* Contenedor de acciones al final */
.end-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 4px;
  width: 300px;
  /* Ancho del modal */
}

/* Estilos de botones dentro del modal */
.confirmar-pago,
.cancelar {
  margin-top: 10px;
}

.texto-tecla-boton {
  margin: 0;
  font-size: 12px;
}

.texto-f12 {
  font-size: 14px;
}
</style>
