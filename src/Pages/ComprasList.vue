<template>
  <div class="encabezado">
    <h1>Registro Compra</h1>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr />

  <div class="wrapper">
    <div class="main-container">
      <form class="inputs-container" @submit.prevent="agregarProducto" autocomplete="off">
        <div class="codigo-input">
          <label for="codigo-busqueda" class="label-input">Codigo del producto:</label>
          <input name="codigo-busqueda" ref="codigo" type="text" class="campo codigo-busqueda" tabindex="1" required
            v-model="addQuery" />

          <router-link to="/productos">
            <button id="registrar-producto" class="btn btn-success" type="button">
              Producto Nuevo
            </button>
          </router-link>
        </div>

        <div class="input-total-compra">
          <label for="total-compra" class="label-input">Total Compra:</label>
          <input name="total-compra" class="campo" type="number" step="0.01" tabindex="2" required
            v-model="addtotalPrice" />
        </div>

        <!-- Barra de búsqueda -->
        <div class="input-cantidad">
          <label for="cantidad" class="label-input">Cantidad:</label>
          <input name="cantidad" class="campo" type="number" tabindex="3" v-model="addQuantity" />
        </div>
      </form>

      <div class="table-container">
        <table class="table">
          <thead>
            <th>No. Producto</th>
            <th>Codigo</th>
            <th>Nombre</th>
            <th>Cantidad</th>
            <th>Total Compra</th>
            <th>Proveedor</th>
            <th style="width: 100px">Opciones</th>
          </thead>
          <tbody>
            <tr v-for="(producto, index) in productosLista" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ producto.codigo }}</td>
              <td>{{ producto.nombre }}</td>
              <td>{{ producto.cantidad }}</td>
              <td>{{ producto.total_compra }}</td>
              <td>{{ producto.proveedor }}</td>
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
      <p class="texto-tecla-boton texto-esc">Esc</p>
      <button class="btn" id="cancelar-compra" @click="cancelarcompra">
        Cancelar compra
      </button>
      <div class="end-container-cobro">
        <p class="texto-tecla-boton texto-f12">F12</p>
        <button class="btn" id="boton-cobrar" @click="payModalOpen">
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
export default {
  components: {
    ProfileButton,
  },
  data() {
    return {
      addQuery: "",
      addQuantity: "",
      payModal: false,
      subtotal: "",
      total: "",
      confirmModal: "",
      showConfirmModal: false,
      showProveedores: false,
      addtotalPrice: "",
      articulos_cant: "",
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

      }
      this.reiniciarInputs();
    },

    agregarProducto() {
      if (!this.addQuery || !this.addtotalPrice) {
        alert("Campo vacio");
        return;
      }

      if (this.addQuantity && isNaN(this.addQuantity) || this.addtotalPrice && isNaN(this.addtotalPrice)) {
        alert("Ingresa un dato valido");
        return;
      }

      if (!this.addQuantity) {
        this.addQuantity = "1";
      }

      if (
        isNaN(Number(this.addQuantity) || isNaN(Number(this.addtotalPrice)))
      ) {
        alert("Ingresa un dato valido");
        return;
      }

      const newProduct = this.productos.find((p) => p.codigo === this.addQuery);
      const exitProduct = this.productosLista.find(
        (p) => p.codigo === this.addQuery
      );

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
  },

  mounted() {
    // Añade el manejador de eventos cuando el componente se monta
    window.addEventListener("keydown", this.pushDelete);
    window.addEventListener("keydown", this.pushEsc);
    window.addEventListener("keydown", this.pushF12);
    window.addEventListener("keydown", this.pushN);
    this.$refs.codigo.focus();
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
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

* {
  font-family: "Montserrat", sans-serif;
}

.encabezado {
  display: flex;
  justify-content: space-between;
}

.wrapper {
  padding: 16px;
  display: flex;
  height: 80%;
  flex-direction: column;
  justify-content: space-between;
}

#delete-last-producto {
  background-color: rgb(207, 57, 57);
  border-radius: 10px;
  color: white;
  font-weight: bold;
}

#registrar-producto {
  background-color: #46ce10;
  margin-left: 30px;
}

#registrar-producto:hover {
  background-color: #38a50d;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

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

.rol {
  color: #969696;
  font-size: 14px;
}

.inputs-container {
  display: flex;
  justify-content: space-between;
}

.campo {
  padding: 5px 0px;
  padding-left: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
}

.label-input {
  margin-right: 10px;
}

.agregar-producto {
  padding: 0;
  margin-left: 10px;
  background: transparent;
  border: none;
  color: rgb(1, 181, 252);
  font-size: 24px;
  cursor: pointer;
}

.agregar-producto:hover {
  color: rgb(4, 146, 202);
  transition: all 0.3s ease;
}

.codigo-input,
.boton-input,
.input-cantidad,
.input-total-compra {
  display: flex;
  align-items: center;
}

.boton-input {
  margin: 0;
}

.table-container {
  max-height: 40vh;
  overflow-y: scroll;
  width: 100%;
  border-radius: 10px;
  border: 1px solid #ddd;
  margin-top: 16px;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th,
.table td {
  padding: 8px;
}

.table thead th {
  background-color: #e7e4e4;
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
  border-radius: 10px;
}

.btn-botones-accion {
  background: transparent;
  border: none;
  padding: 0;
  font-size: 22px;
}

#cancelar-compra {
  background-color: #d30015;
  color: black;
}

#cancelar-compra:hover {
  background-color: #ad0314;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

.close-btn {
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
}

#AddClienteModal {
  background: #a38655;
  border-radius: 15px;
  font-size: 16px;
}

#BtnCerrar {
  border-radius: 15px;
  background-color: #ebebeb;
  font-size: 16px;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.end-container-cobro {
  display: flex;
  width: 100%;
  justify-content: end;
  align-items: center;
  height: 100px;
}

.end-container {
  display: flex;
  flex-direction: row;
  align-items: center;

  border-top: solid rgb(75, 75, 75) 1px;
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

#total {
  font-weight: bolder;
  font-size: 40px;
}

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

#cancelar-compra span {
  font-size: 15px;
}

.texto-esc {
  color: #d30015;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

.texto-tecla-boton {
  display: inline-block;
  transform: rotate(-90deg);
}

.product-list {
  list-style-type: none;
  padding: 0;
}

.product-list li {
  margin-bottom: 10px;
}

.payment-methods {
  display: flex;
}

.payment-methods label {
  display: block;
  margin-bottom: 10px;
}

.modal-actions {
  margin-top: 20px;
}

.modal-actions button {
  margin-right: 10px;
}

.div-modal-resumen {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  /* Espacio entre los campos */
}

.div-modal-resumen label {
  width: 120px;
  /* Ajusta el ancho del label según sea necesario */
  margin-right: 10px;
  /* Espacio entre el label y el input */
}

.div-modal-resumen input {
  flex: 1;
  /* El input ocupará el resto del espacio disponible */
}

.div-modal-resumen-rtn {
  margin-left: 30px;
}

.modalShowConfirm-Si,
.cancelar,
.close-btn {
  background-color: #dc3545;
}

.modalShowConfirm-no,
.confirmar-pago {
  background-color: #4caf50;
}

.modalShowConfirm-no:hover,
.confirmar-pago:hover {
  background-color: #45a049;
}

.modalShowConfirm-Si:hover,
.cancelar:hover,
.close-btn:hover {
  background-color: #bd0d1f;
}
</style>
