<template>
  <div class="wrapper">
    <div class="main-container">
      <div class="header-container">
        <div class="tipo-cliente">
          <label for="tipo-cliente">Tipo de cliente:</label>
          <div class="input-button-container">
            <!-- Input para mostrar el nombre del cliente -->
            <input type="text" :value="clienteSeleccionado?.nombre || 'Consumidor final'" readonly
              class="cliente-input">
            <!-- Nuevo input para RTN -->
            <input v-if="clienteSeleccionado" type="text" :value="clienteSeleccionado.rtn" readonly class="rtn-input">
            <button @click="openModal">Buscar</button>
            <ClienteModal :isVisible="isModalVisible" @close="closeModal" @modal-focused="handleModalFocus"
              @client-selected="handleClientSelected" />
          </div>
        </div>

        <div class="tipo-descuento">
          <label for="tipo-cliente">Descuentos:</label>
          <select name="tipo-cliente" id="tipo-cliente" v-model="tipoCliente">
            <option value="0">Ninguno</option>
            <option value="1">Tercera edad</option>
            <option value="2">Cuarta edad</option>
            <option value="3">Excepción política</option>
          </select>
        </div>
        <div class="informacion-1">
          <label for="sucursal">Sucursal: LCB</label>
          <br />
          <label for="usuario">Usuario: User</label>
        </div>

        <div class="informacion-2">
          <label for="numTicket">Ticket No: </label>
          <span>{{ numTicket }}</span>
          <br />
          <label>Fecha: </label>
          <span>{{ fecha }}</span>
        </div>
      </div>

      <div class="column-container">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th class="col-item">Item</th>
                <th class="col-codigo">Código</th>
                <th class="col-descripcion">Descripción</th>
                <th class="col-cantidad">Cantidad</th>
                <th class="col-precio">Precio</th>
                <th class="col-importe">Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(producto, index) in productosLista" :key="index">
                <td class="col-item">{{ index + 1 }}</td>
                <td class="col-codigo">{{ producto.codigo }}</td>
                <td class="col-descripcion">{{ producto.nombre }}</td>
                <td class="col-cantidad">{{ producto.cantidad }}</td>
                <td class="col-precio">{{ producto.precioUnitario }}</td>
                <td class="col-importe">{{ producto.precioUnitario * producto.cantidad }}</td>
              </tr>
            </tbody>
          </table>
          <div class="total-container">
            <div class="cantidad-input">
              <label for="cantidad">Cant:</label>
              <input id="cantidad" type="number" v-model="totalCantidad" readonly />
            </div>
            <div class="total-input">
              <label for="total">S/.:</label>
              <input id="total" type="text" :value="calcularTotal" readonly />
            </div>
          </div>
        </div>

        <!-- Teclado numérico -->
        <div class="numeric-keypad">
          <div class="scanner-input">
            <input name="codigo-producto" ref="codigoRef" type="text" class="campo" v-model="addQuery" tabindex="1"
              :disabled="isModalVisible" required />
          </div>
          <div class="keypad">
            <button @click="agregarNumero(1)">1</button>
            <button @click="agregarNumero(2)">2</button>
            <button @click="agregarNumero(3)">3</button>
            <button @click="agregarNumero(4)">4</button>
            <button @click="agregarNumero(5)">5</button>
            <button @click="agregarNumero(6)">6</button>
            <button @click="agregarNumero(7)">7</button>
            <button @click="agregarNumero(8)">8</button>
            <button @click="agregarNumero(9)">9</button>
            <button @click="agregarNumero(0)">0</button>
            <button @click="agregarNumero('.')">.</button>
            <button @click="agregarNumero('*')">*</button>
            <button class="borrar" @click="borrarUltimo">←</button>
            <button class="limpiar" @click="limpiar">Limpiar</button>
            <button class="enter" @click="procesarEnter">Enter</button>
          </div>
        </div>
      </div>

      <div class="footer-container">
        <button @click="buscarProducto">Buscar producto [F2]</button>
        <button @click="openModal">Buscar cliente [F3]</button>
        <button @click="consultarAnular">Consultar anular [F4]</button>
        <button @click="eliminarItem">Eliminar item [F5]</button>
        <button @click="limpiarPantalla">Limpiar pantalla [F6]</button>
        <button @click="guardarVenta">Guardar venta [F8]</button>
        <button @click="recVenta">Rec. Venta [F9]</button>
        <button @click="descuentoGeneral">Dscto. Gen. [F10]</button>
        <button @click="descuentoIndividual">Dscto. Ind. [F11]</button>
        <button @click="registrarPago">Registrar Pago [F12]</button>
        <button @click="nuevoCliente">Nuevo Cliente [ALT] + [C]</button>
        <button @click="salir">Salir [ALT] + [S]</button>
      </div>
      <ClienteModal :isVisible="isModalVisible" @close="closeModal" @modal-focused="handleModalFocus" />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ClienteModal from '../components/modalesCrearVenta/ClienteModal.vue';
import { useToast } from "vue-toastification"; // Importación para el popup

export default {
  components: {
    ClienteModal,
  },
  data() {
    return {
      numTicket: '000-001-01-00000001',
      fecha: new Date().toLocaleDateString(),
      addQuery: "",
      isEditing: false,
      isModalVisible: false,
      isModalFocused: false,
      clienteSeleccionado: null,
      productos: [
        {
          codigo: "1",
          nombre: "Leche",
          descripcion: "Leche entera de 1 litro",
          cantidad: 0, // La cantidad será introducida por el usuario
          precioUnitario: 25,
          descuento: 0,
        },
        {
          codigo: "2",
          nombre: "Pan",
          descripcion: "Pan fresco",
          cantidad: 0, // La cantidad será introducida por el usuario
          precioUnitario: 15,
          descuento: 0,
        },
        {
          codigo: "3",
          nombre: "Arroz",
          descripcion: "Arroz libra",
          cantidad: 0, // La cantidad será introducida por el usuario
          precioUnitario: 12,
          descuento: 0,
        },
        {
          codigo: "4",
          nombre: "Aceite",
          descripcion: "Bolsita de aceita",
          cantidad: 0, // La cantidad será introducida por el usuario
          precioUnitario: 30,
          descuento: 0,
        },
        {
          codigo: "5",
          nombre: "Huevos",
          descripcion: "Carton de 12",
          cantidad: 0, // La cantidad será introducida por el usuario
          precioUnitario: 18,
          descuento: 0,
        },
        {
          codigo: "6",
          nombre: "Azúcar",
          descripcion: "Bolsa de 4 lbs",
          cantidad: 0, // La cantidad será introducida por el usuario
          precioUnitario: 10,
          descuento: 0,
        },
        {
          codigo: "7",
          nombre: "Sal",
          descripcion: "Bolsa pequeña",
          cantidad: 0, // La cantidad será introducida por el usuario
          precioUnitario: 5,
          descuento: 0,
        },
        {
          codigo: "8",
          nombre: "Café",
          descripcion: "Bolsa de 1 lb",
          cantidad: 0, // La cantidad será introducida por el usuario
          precioUnitario: 50,
          descuento: 0,
        },
        {
          codigo: "9",
          nombre: "Harina",
          descripcion: "Bolsa de 5 lbs",
          cantidad: 0, // La cantidad será introducida por el usuario
          precioUnitario: 20,
          descuento: 0,
        },
        {
          codigo: "10",
          nombre: "Pasta",
          descripcion: "Bolsa de 1 lb",
          cantidad: 0, // La cantidad será introducida por el usuario
          precioUnitario: 14,
          descuento: 0,
        },
        {
          codigo: "11",
          nombre: "Mantequilla",
          descripcion: "Mantequilla leyde de 1 lb",
          cantidad: 0, // La cantidad será introducida por el usuario
          precioUnitario: 22,
          descuento: 0,
        },
      ],
      productosLista: [],
    };
  },

  computed: {
    calcularTotal() {
      return this.productosLista.reduce((total, p) => total + (p.precioUnitario * p.cantidad), 0);
    }
  },

  methods: {
    salir() {
      this.logout(); // Llama al método logout
    },

    async logout() {
      try {
        await axios.post('/api/logout', {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth')}`
          }
        });

        localStorage.clear();
        this.$router.push('/login');
      } catch (error) {
        console.error("Error al cerrar sesión", error);
        localStorage.clear();
        this.$router.push('/login');
      }
    },

    handleClientSelected(client) {
      this.clienteSeleccionado = client;
      this.closeModal();
    },

    openModal() {
      this.isModalVisible = true;
    },
    handleModalFocus() {
      this.isModalFocused = true;
    },

    handleKeyPress(event) {
      // Si el modal está enfocado o visible, no procesar eventos de teclado aquí
      if (this.isModalVisible || this.isModalFocused) {
        return;
      }

      const key = event.key;

      // Solo previene el evento si no estamos en un input
      if (!event.target.matches('input, textarea')) {
        event.preventDefault();
      }

      // Si la tecla es un número o un punto, añade al input
      if (!isNaN(key) || key === '.') {
        this.agregarNumero(key);
      } else if (key === "Backspace") {
        this.borrarUltimo();
      } else if (key === "Enter") {
        this.procesarEnter();
      }
    },

    closeModal() {
      this.isModalVisible = false;
      this.isModalFocused = false;
    },

    agregarNumero(num) {
      this.addQuery += num.toString();
    },

    borrarUltimo() {
      if (this.addQuery.length > 0) {
        this.addQuery = this.addQuery.slice(0, -1);
      }
    },

    limpiar() {
      this.addQuery = "";
    },

    procesarEnter() {
      this.agregarProducto();
    },

    agregarProducto() {
      if (!this.addQuery) {
        const toast = useToast();
        toast.warning("Ingresa un código");
        return;
      }

      const newProduct = this.productos.find((p) => p.codigo === this.addQuery);
      if (!newProduct) {
        const toast = useToast();
        toast.warning("No existe el producto");
        this.limpiar();
        return;
      }

      const existingProduct = this.productosLista.find((p) => p.codigo === this.addQuery);
      if (existingProduct) {
        existingProduct.cantidad += 1;
      } else {
        newProduct.cantidad = 1;
        this.productosLista.push({ ...newProduct });
      }

      this.limpiar()
    },

    pushEsc(event) {
      if (event.key === "Esc" || event.key === "Escape") {
        if (this.isEditing) {
          this.isEditing = false;
          this.reiniciarInputs();
          return;
        }
        this.cancelarVenta();
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

    handleInputChange(event) {
      this.addQuery = event.target.value; // Actualiza addQuery con el valor del input
    },

    changeFavicon(iconPath) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  },

  mounted() {
    window.addEventListener("keydown", this.handleKeyPress);
    document.title = "Crear Ventas";
    this.changeFavicon('/img/spiderman.ico'); // Usar la ruta correcta
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyPress);
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

* {
  font-family: "Montserrat", sans-serif;
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  z-index: 1;
}

.col-item {
  width: 10%;
}

.col-codigo {
  width: 20%;
}

.col-descripcion {
  width: 40%;
}

.col-cantidad {
  width: 10%;
}

.col-precio {
  width: 10%;
}

.col-importe {
  width: 10%;
}

.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  z-index: 1;
  margin: 0;
}

.header-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  /* Alinea todos los elementos a la izquierda */
  align-items: center;
  text-align: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  gap: 250px;
  /* Aumenta el espacio entre las columnas */
}

.tipo-descuento,
.tipo-cliente {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.informacion-1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 20px;
}

.informacion-2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 20px;
}

.column-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: stretch;
  padding: 10px;
  z-index: 1000;
}

.table-container {
  width: 100%;
  flex-grow: 1;
  overflow: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

td {
  padding: 10px;
  text-align: left;
}

.total-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-top: 1px solid #ccc;
}

.cantidad-input {
  margin-right: 20px;
}

.numeric-keypad {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-left: 1px solid #ccc;
}

.scanner-input {
  margin-bottom: 10px;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

button {
  width: 100%;
  height: 40px;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  background-color: #f0f0f0;
  cursor: pointer;
}

button:hover {
  background-color: #ccc;
}

.footer-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 10px;
  background-color: #f0f0f0;
  border-top: 1px solid #ccc;
  z-index: 2;
}

.footer-container button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  font-size: 12px;
  background-color: #f0f0f0;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-container button:hover {
  background-color: #ccc;
}

.input-button-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}

.cliente-input,
.rtn-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
  width: 100%;
}


.tipo-cliente input {
  flex-grow: 1;
  /* Permite que el input ocupe el espacio disponible */
}

.rtn-input {
  font-size: 0.9em;
  color: #666;
}

button {
  align-self: flex-end;
  margin-top: 5px;
}
</style>
