<template>
  <div class="wrapper">
    <AperturaCajaModal :isVisible="isAperturaCajaModalVisible" @confirmar="handleAperturaCaja" />
    <ModalLoading :isLoading="isModalLoading" />
    <PaymentAnimationModal :isVisible="isPaymentAnimationVisible" @complete="handlePaymentComplete" />
    <div class="main-container">
      <div class="header-container">
        <!-- Aquí estaba el error, había un div y template anidados innecesariamente -->
        <div class="tipo-cliente">
          <label for="tipo-cliente">Cliente:</label>
          <div class="input-button-container">
            <div class="inputs-container">
              <template v-if="!clienteSeleccionado">
                <input type="text" value="Consumidor final" readonly class="cliente-input single">
              </template>
              <template v-else>
                <input type="text" :value="clienteSeleccionado.nombre_completo" readonly class="cliente-input">
                <input type="text" :value="clienteSeleccionado.rtn" readonly class="rtn-input">
              </template>
            </div>
            <div class="buttons-header">
              <button :disabled="!cajaAbierta" class="search-button" @click="openModal">
                Buscar
              </button>
              <ClienteModal :isVisible="isModalVisible" :clientes="clientes" :id_usuario="id_usuario"
                @close="closeModal" @client-selected="handleClientSelected" />
              <!-- Botón para volver a "Consumidor final" -->
              <button v-if="clienteSeleccionado" class="search-button" @click="setConsumidorFinal">Consumidor
                final</button>
            </div>
          </div>
        </div>

        <div class="informacion-1">
          <label for="sucursal">Sucursal: {{ info.nombreSucursal }}</label>
          <br />
          <label v-if="!isCajaAbierta" class="no-facturando">Abrir caja antes de facturar!</label>
          <label v-else for="usuario">Usuario: {{ info.nombre_usuario }}</label>
        </div>

        <div class="informacion-2">
          <label for="numTicket" :class="sucursalActivaFactura ? 'facturando' : 'no-facturando'">
            {{ sucursalActivaFactura ? 'Sucursal facturando' : 'Datos SAR Sucursal desactualizados' }}
          </label>
          <br />
          <label>Fecha: <span>{{ info.fecha }}</span></label>
        </div>
      </div>

      <div class="column-container">
        <div class="table-container">
          <div class="table-wrapper">
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
                <!-- Productos reales -->
                <tr v-for="(producto, index) in productosLista" :key="index" @dblclick="handleRowDoubleClick(producto)"
                  :class="{ 'selected': selectedItem === producto }">
                  <td class="col-item">{{ index + 1 }}</td>
                  <td class="col-codigo">{{ producto.codigo_producto }}</td>
                  <td class="col-descripcion">{{ producto.nombre }}</td>
                  <td class="col-cantidad">{{ producto.cantidad }}</td>
                  <td class="col-precio">{{ mostrarPrecioFinal(producto) }}</td>
                  <td class="col-importe">{{ calcularImporte(producto) }}</td>
                </tr>
                <!-- Filas vacías para llenar el espacio -->
                <tr v-for="n in remainingRows" :key="`empty-${n}`" class="empty-row">
                  <td class="col-item">&nbsp;</td>
                  <td class="col-codigo">&nbsp;</td>
                  <td class="col-descripcion">&nbsp;</td>
                  <td class="col-cantidad">&nbsp;</td>
                  <td class="col-precio">&nbsp;</td>
                  <td class="col-importe">&nbsp;</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total-container">
            <div class="cantidad-input">
              <label for="cantidad">Cant:</label>
              <input id="cantidad" type="number" v-model="totalCantidad" readonly />
            </div>
            <div class="total-input">
              <label for="total">S/:</label>
              <label class="subTotal" id="total">{{ calcularTotal }}</label>
            </div>
          </div>
        </div>

        <!-- Teclado numérico -->
        <div class="numeric-keypad">
          <input name="codigo-producto" autocomplete="off0" ref="codigoRef" type="text" class="campo" v-model="addQuery"
            tabindex="1" :disabled="!cajaAbierta || isModalFocused || isModalVisible" required />

          <div class="keypad">
            <button :disabled="!cajaAbierta" @click="agregarNumero(1)">1</button>
            <button :disabled="!cajaAbierta" @click="agregarNumero(2)">2</button>
            <button :disabled="!cajaAbierta" @click="agregarNumero(3)">3</button>
            <button :disabled="!cajaAbierta" @click="agregarNumero(4)">4</button>
            <button :disabled="!cajaAbierta" @click="agregarNumero(5)">5</button>
            <button :disabled="!cajaAbierta" @click="agregarNumero(6)">6</button>
            <button :disabled="!cajaAbierta" @click="agregarNumero(7)">7</button>
            <button :disabled="!cajaAbierta" @click="agregarNumero(8)">8</button>
            <button :disabled="!cajaAbierta" @click="agregarNumero(9)">9</button>
            <button :disabled="!cajaAbierta" @click="agregarNumero(0)">0</button>
            <button :disabled="!cajaAbierta" @click="agregarNumero('.')">.</button>
            <button :disabled="!cajaAbierta" @click="agregarNumero('*')">*</button>
            <button :disabled="!cajaAbierta" class="borrar" @click="borrarUltimo">←</button>
            <button :disabled="!cajaAbierta" class="limpiar" @click="limpiar">Limpiar</button>
            <button :disabled="!cajaAbierta" class="enter" @click="procesarEnter">Enter</button>
          </div>
        </div>
      </div>

      <button v-if="!cajaAbierta" class="cajaButton" @click="abrirCaja" @modal-focused="handleModalFocus">Abrir
        caja</button>

      <div class="footer-container">
        <button :disabled="!cajaAbierta" @click="buscarProducto">Buscar producto [F2]</button>
        <BuscarProductoModal :isVisible="isBuscarProductoModalVisible" :productos="productos"
          @close="closeBuscarProductoModal" @product-selected="handleProductSelected"
          @modal-focused="handleModalFocus" />
        <button :disabled="!cajaAbierta" @click="openModal">Buscar cliente [F3]</button>
        <button :disabled="!cajaAbierta" @click="consultarAnular">Consultar anular [F4]</button>
        <button :disabled="!cajaAbierta" @click="eliminarItem">Eliminar item [F5]</button>
        <EliminarItemsModal :isVisible="isEliminarModalVisible" :item="selectedItem" @close="closeEliminarModal"
          @confirm-delete="handleItemDelete" @modal-focused="handleModalFocus" />
        <button :disabled="!cajaAbierta" @click="limpiarPantalla">Limpiar pantalla [F6]</button>
        <button :disabled="!cajaAbierta" @click="guardarVenta">Guardar venta [F8]</button>
        <GuardarVentaModal :isVisible="isGuardarVentaModalVisible" :isConsumidorFinal="!clienteSeleccionado"
          @close="isGuardarVentaModalVisible = false" @cliente-temporal="handleSaveVenta"
          @modal-focused="handleModalFocus" />
        <button :disabled="!cajaAbierta" @click="recVenta">Rec. Venta [F9]</button>
        <RecuperarVentaModal :isVisible="isRecuperarVentaModalVisible" :ventas="ventasGuardadas"
          @close="isRecuperarVentaModalVisible = false" @venta-selected="handleVentaSelected" />
        <button :disabled="!cajaAbierta" @click="descuentoGeneral">Dscto. Gen. [F10]</button>
        <button :disabled="!cajaAbierta" @click="descuentoIndividual">Dscto. Ind. [F11]</button>
        <button :disabled="!cajaAbierta" @click="openPagoModal">Registrar Pago [F12]</button>
        <RegistrarPagoModal :isVisible="isPagoModalVisible" :factura="factura" @close="closePagoModal"
          @confirm-payment="realizarPago" @modal-focused="handleModalFocus" />
        <button :disabled="!cajaAbierta" @click="nuevoCliente">Nuevo Cliente [ALT] + [C]</button>
        <button :disabled="!cajaAbierta" @click="salir">Salir [ALT] + [S]</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ClienteModal from '../components/modalesCrearVenta/ClienteModal.vue';
import RegistrarPagoModal from '../components/modalesCrearVenta/RegistrarPagoModal.vue';
import EliminarItemsModal from '../components/modalesCrearVenta/EliminarItemsModal.vue';
import BuscarProductoModal from '../components/modalesCrearVenta/BuscarProductoModal.vue';
import { useToast } from "vue-toastification";
import { notificaciones } from '../../services/notificaciones.js';
import ModalLoading from '@/components/ModalLoading.vue';
import GuardarVentaModal from '@/components/modalesCrearVenta/GuardarVentaModal.vue';
import RecuperarVentaModal from '@/components/modalesCrearVenta/RecuperarVentaModal.vue';
import PaymentAnimationModal from '@/components/PaymentAnimationModal.vue';
//import VentaPendienteModal from '@/components/modalesCrearVenta/VentaPendiente.vue';
import AperturaCajaModal from '@/components/modalesCrearVenta/AperturaCajaModal.vue';
import solicitudes from "../../services/solicitudes.js";
import { getInfoBasic, getProductos, agregarProductoCodigo, getVentaPendiente, guardarVenta, getVentasGuardadas, getRecProductoVenta, postVenta, eliminarVenta, eliminarProductoVenta, pagar } from '../../services/ventasSolicitudes.js';
//cajaUsuario
const { getClientesbyEmpresa } = require('../../services/clienteSolicitudes.js');
const { sucursalSar } = require('../../services/sucursalesSolicitudes.js');

export default {
  components: {
    ClienteModal,
    AperturaCajaModal,
    PaymentAnimationModal,
    RegistrarPagoModal,
    EliminarItemsModal,
    BuscarProductoModal,
    ModalLoading,
    GuardarVentaModal,
    RecuperarVentaModal,
    // VentaPendienteModal
  },
  data() {
    return {
      isAperturaCajaModalVisible: false,
      cajaAbierta: false,
      minRows: 15,
      numTicket: '000-001-01-00000001',
      fecha: new Date().toLocaleDateString(),
      addQuery: "",
      totalCantidad: '',
      id_usuario: 0,
      prueba: 'prueba',
      info: '',
      isBuscarProductoModalVisible: false,
      isEditing: false,
      isModalVisible: false,
      isPagoModalVisible: false,
      isAnyModalOpen: false,
      clienteSeleccionado: null,
      selectedItem: null,
      isEliminarModalVisible: false,
      isModalFocused: false,
      productos: [],
      productosLista: [],
      clientes: [],
      venta: [],
      factura: [],
      usaSAR: false,
      isModalLoading: false,
      loadingMessage: '',
      recuperandoVenta: false,
      isGuardarVentaModalVisible: false,
      isRecuperarVentaModalVisible: false,
      ventaPendiente: false,
      isPaymentAnimationVisible: false,
    };
  },

  watch: {
    // Observadores para mantener sincronizado el estado de los modales
    isModalVisible(newVal) {
      this.isAnyModalOpen = newVal;
      if (newVal) {
        this.isPagoModalVisible = false;
        this.pauseMainKeyboardEvents();
      } else {
        this.resumeMainKeyboardEvents();
      }
    },
    isPagoModalVisible(newVal) {
      this.isAnyModalOpen = newVal;
      if (newVal) {
        this.isModalVisible = false;
        this.pauseMainKeyboardEvents();
      } else {
        this.resumeMainKeyboardEvents();
      }
    },
    isBuscarProductoModalVisible(newVal) {
      this.isAnyModalOpen = newVal;
      if (newVal) {
        this.pauseMainKeyboardEvents();
      } else {
        this.resumeMainKeyboardEvents();
      }
    },
  },

  computed: {
    calcularTotal() {
      const total = this.productosLista.reduce((total, p) => total + (p.precio_final), 0);
      return total.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    // Actualizamos esta propiedad para que dependa de cajaAbierta
    sucursalActivaFactura() {
      return this.usaSAR && this.cajaAbierta;
    },

    // Movemos isCajaAbierta a computed properties
    isCajaAbierta() {
      return this.cajaAbierta;
    }

  },

  remainingRows() {
    return Math.max(0, this.minRows - this.productosLista.length);
  },

  methods: {
    async salir() {
      this.logout();
    },

    abrirCaja() {
      this.isAperturaCajaModalVisible = true;
      this.pauseMainKeyboardEvents();
    },

    async handleAperturaCaja(monto) {
      try {
        this.isModalLoading = true;
        this.loadingMessage = 'Abriendo caja...';

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Actualizamos el estado de la caja
        this.cajaAbierta = true;

        this.isAperturaCajaModalVisible = false;
        this.resumeMainKeyboardEvents();

        const toast = useToast();
        toast.success(`Caja abierta con monto inicial de L. ${monto}`);
      } catch (error) {
        const toast = useToast();
        toast.error("Error al abrir la caja");
      } finally {
        this.isModalLoading = false;
      }
    },

    async buscarProducto() {
      this.isModalLoading = true;
      this.loadingMessage = 'Cargando productos...';
      try {
        this.productos = await getProductos(this.id_usuario);
        this.isBuscarProductoModalVisible = true;
      } finally {
        this.isModalLoading = false;
      }
    },

    closeBuscarProductoModal() {
      this.isBuscarProductoModalVisible = false;
      this.$nextTick(() => {
        this.$refs.codigoRef?.focus();
      });
    },

    async handleProductSelected(product) {
      this.addQuery = product.codigo_producto;
      this.totalCantidad = product.cantidad;
      await this.agregarProducto();

      this.closeBuscarProductoModal();
    },

    setConsumidorFinal() {
      this.clienteSeleccionado = null; // Restablece la selección del cliente
    },

    calcularImporte(producto) {
      if ((producto.precio_mayorista > 0 && producto.cantidad_activar_mayorista > 0) &&
        (producto.cantidad >= producto.cantidad_activar_mayorista)) {
        producto.precio_final = producto.cantidad * producto.precioImpuestoMayorista;

      }
      else {
        producto.precio_final = producto.cantidad * producto.precioImpuesto;
      }
      return producto.precio_final;
    },

    mostrarPrecioFinal(producto) {
      if ((producto.precio_mayorista > 0 && producto.cantidad_activar_mayorista > 0) &&
        (producto.cantidad >= producto.cantidad_activar_mayorista)) {
        return producto.precio_mayorista;

      }
      else {
        return producto.precio_unitario;
      }

    },

    handleModalFocus(isFocused) {
      this.isModalFocused = isFocused;
    },

    handleRowDoubleClick(item) {
      this.selectedItem = item;
    },

    eliminarItem() {
      if (this.productos.length === 0) {
        const toast = useToast();
        toast.warning("No hay datos en la tabla.");
        return;
      } else if (!this.selectedItem) {
        const toast = useToast();
        toast.warning("Seleccione un item para eliminar");
        return;
      }
      this.isEliminarModalVisible = true;
    },

    async handleItemDelete(item) {
      this.isModalLoading = true;
      this.loadingMessage = 'Eliminando item...';
      try {
        const index = this.productosLista.findIndex(p => p === item);
        if (index !== -1) {
          const eliminando = await eliminarProductoVenta(this.productosLista[index].id_producto, this.id_usuario);
          if (!eliminando) {
            throw 'Ocurrio un error al eliminar Item';
          }
          this.productosLista.splice(index, 1);
          this.selectedItem = null;
          const toast = useToast();
          toast.success("Item eliminado correctamente");
        }
      } catch (error) {
        notificaciones('error', error.message);
      } finally {
        this.isModalLoading = false;
      }
    },

    closeEliminarModal() {
      this.isEliminarModalVisible = false;
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

    async openModal() {
      this.isModalLoading = true;
      this.loadingMessage = 'Cargando clientes...';
      try {
        this.clientes = await getClientesbyEmpresa(this.id_usuario);
        this.isModalVisible = true;
      } finally {
        this.isModalLoading = false;
      }
    },

    closeModal() {
      this.isModalVisible = false;
      this.$nextTick(() => {
        this.$refs.codigoRef?.focus();
      });
    },

    async realizarPago(datosPago) {
      if (this.productosLista.length === 0) {
        const toast = useToast();
        toast.warning("No hay productos en la tabla de ventas.");
        return;
      }

      try {
        const pagando = await pagar(datosPago.monto, this.venta.id_venta, this.id_usuario);
        if (!pagando) {
          throw 'No se realizo el pago';
        }
        this.isPagoModalVisible = false;
        this.isPaymentAnimationVisible = true;
      } catch (error) {
        notificaciones('error', error.message);
      }
    },

    handlePaymentComplete() {
      this.isPaymentAnimationVisible = false;
      this.limpiarPagado();
    },

    async openPagoModal() {

      const toast = useToast();
      if (this.productosLista.length === 0) {
        toast.warning("No hay productos en la tabla de ventas.");
        return;
      }
      this.isModalLoading = true;
      this.loadingMessage = 'Procesando venta...';

      try {
        if (this.venta.length === 0) {
          this.venta = await postVenta(
            this.productosLista,
            this.clienteSeleccionado ? this.clienteSeleccionado.id_cliente : 0,
            this.id_usuario);
        }
        else if (this.venta.factura.total !== this.calcularTotal) {
          const id_venta = this.venta.id_venta;
          const id_factura = this.venta.factura.id_factura;

          const promesas = [
            eliminarVenta(id_venta, id_factura),
            postVenta(
              this.productosLista,
              this.clienteSeleccionado ? this.clienteSeleccionado.id_cliente : 0,
              this.id_usuario)
          ];

          const resultados = await Promise.all(promesas);
          const { resultado: resultadoEliVenta, message: messageElimVenta } = resultados[0];

          if (!resultadoEliVenta) {
            console.error('Ocurrio un error de servidor', messageElimVenta);
          }

          this.venta = resultados[1];
        }

        this.factura = this.venta.factura;
        this.isPagoModalVisible = true;

        this.$nextTick(() => {
          const pagoModalElement = document.querySelector('.modal-content');
          if (pagoModalElement) {
            pagoModalElement.focus();
          }
        });
      } catch (error) {
        console.log(error);
        toast.error('Ocurrio un error al registrar venta.');
      } finally {
        this.isModalLoading = false;
      }
    },

    closePagoModal() {
      this.isPagoModalVisible = false;
      this.$nextTick(() => {
        this.$refs.codigoRef?.focus();
      });
    },

    pauseMainKeyboardEvents() {
      window.removeEventListener("keydown", this.handleKeyPress);
    },

    resumeMainKeyboardEvents() {
      if (!this.isAnyModalOpen) {
        window.addEventListener("keydown", this.handleKeyPress);
      }
    },

    handleKeyPress(event) {
      if (this.isAnyModalOpen || this.isModalFocused) {
        return;
      }

      const key = event.key;

      // Cancela la acción predeterminada si se presiona una tecla específica
      if (key === "F3" || key === "F12" || key === "F4" || key === "F5" || key === "F6" || key === "F8" || key === "F9" || key === "F10" || key === "F11") {
        event.preventDefault();
      }

      // const toast = useToast();

      if (!isNaN(key) || key === '.') {
        event.preventDefault();
        this.agregarNumero(key);
      } else if (key === "Backspace") {
        event.preventDefault();
        this.borrarUltimo();
      } else if (key === "Enter") {
        event.preventDefault();
        this.procesarEnter();
      } else if (event.altKey && key === "s") {
        event.preventDefault();
        this.logout();
      } else if (event.altKey && key === "c") {
        event.preventDefault();
        this.openModal();
      } else if (key === "F2") {
        event.preventDefault();
        this.buscarProducto();
      } else if (key === "F3") {
        event.preventDefault();
        this.openModal();
      } else if (key === "F12") {
        event.preventDefault();
        this.openPagoModal();
      } else if (key === "F5") {
        event.preventDefault();
        this.eliminarItem();
      } else if (key === "F9") {
        event.preventDefault();
        this.recVenta();
      } else if (key === "F8") {
        event.preventDefault();
        this.guardarVenta();
      }
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
      this.totalCantidad = '';
    },

    limpiarPagado() {
      this.addQuery = "";
      this.totalCantidad = '';
      this.productosLista = [];
      this.venta = [];
      this.factura = [];
      this.clienteSeleccionado = null;
    },

    procesarEnter() {
      this.agregarProducto();
    },

    async agregarProducto() {
      let nuevaCantidad = this.totalCantidad;
      let productoReducir;
      const codigoValidar = this.addQuery;
      if (!codigoValidar) {
        const toast = useToast();
        toast.warning("Ingresa un código");
        return;
      }

      if (!nuevaCantidad || nuevaCantidad === 0 || nuevaCantidad === "") {
        nuevaCantidad = 1;
      }

      try {
        this.limpiar();
        const newProduct = this.productos.find((p) => p.codigo_producto === codigoValidar);
        if (!newProduct) {
          const toast = useToast();
          toast.warning("No existe el producto");

          return;
        }

        const existingProduct = this.productosLista.find((p) => p.codigo_producto === codigoValidar);
        if (existingProduct) {
          existingProduct.cantidad += nuevaCantidad;
          productoReducir = existingProduct.codigo_producto;

        } else {
          newProduct.cantidad = nuevaCantidad;
          this.productosLista.push({ ...newProduct });
          productoReducir = newProduct.codigo_producto;

        }
        if (!this.recuperandoVenta) {
          //  alert(nuevaCantidad);
          await agregarProductoCodigo(nuevaCantidad, productoReducir, this.id_usuario);

        }

      } catch (error) {
        console.log(error);
        notificaciones('error', error.message);
      }
    },

    async guardarVenta() {
      if (this.productosLista.length === 0) {
        const toast = useToast();
        toast.warning("No hay productos para guardar");
        return;
      }

      if (!this.clienteSeleccionado) {
        this.isGuardarVentaModalVisible = true;
      }
      else {
        this.guardarVentainBD(this.clienteSeleccionado.nombre_completo);
      }

    },
    async guardarVentainBD(nombre_completo) {
      try {
        const response = await guardarVenta(nombre_completo, this.id_usuario);
        if (response) {
          this.limpiarPagado();
          notificaciones('venta-guardada');
        }
        else {
          throw 'Ocurrio un error al guardar venta. Intente mas tarde';
        }
      } catch (error) {
        console.log(error);
        notificaciones('error', error.message);
      }

    },

    async handleVentaSelected(data) {
      try {
        //  console.log(`id de compra guardada: ${data.id_compra_guardada}`);
        const productosRec = await getRecProductoVenta(data.id_compra_guardada);
        // console.log(productosRec);
        //  console.log(productosRec.length);
        this.recuperandoVenta = true;
        //   console.log(`Productos de la compra: ${productosRec}`);

        for (const producto of productosRec) {
          // console.log(`Cantidad del producto: ${producto.cantidad}`);
          this.addQuery = producto.codigo_producto;
          this.totalCantidad = producto.cantidad;
          await this.agregarProducto();
        }

        this.recuperandoVenta = false;

      } catch (error) {
        notificaciones('error', "Error al recuperar venta. Intente de nuevo mas tarde.");
      }

    },

    async RecventaPendiente(productosRec) {
      try {

        this.recuperandoVenta = true;

        for (const producto of productosRec) {
          console.log(`Cantidad del producto: ${producto.cantidad}`);
          this.addQuery = producto.codigo_producto;
          this.totalCantidad = producto.cantidad;
          await this.agregarProducto();
        }

        this.recuperandoVenta = false;


      } catch (error) {
        notificaciones('error', "Error al recuperar venta. Intente de nuevo mas tarde.");
      }

    },

    async handleSaveVenta(data) {
      try {
        this.isModalLoading = true;
        this.loadingMessage = 'Guardando venta...';

        this.guardarVentainBD(data);

      } catch (error) {
        notificaciones('error', error.message);
      } finally {
        this.isModalLoading = false;
        this.isGuardarVentaModalVisible = false;
      }
    },

    async recVenta() {
      try {
        const ventasGuardadas = await getVentasGuardadas(this.id_usuario);
        this.ventasGuardadas = ventasGuardadas;
        console.log(ventasGuardadas);
        this.isRecuperarVentaModalVisible = true;
      } catch (error) {
        notificaciones('error', error);
      }
    },



    async recVenta2() {
      try {
        const ventasGuardadas = await getVentasGuardadas(this.id_usuario);
        console.log(ventasGuardadas);

      } catch (error) {
        notificaciones('error', error);
      }
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

    handleInputChange(event) {
      this.addQuery = event.target.value;
    },

    changeFavicon(iconPath) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
    },

    toggleEditingMode() {
      this.isEditing = !this.isEditing;
    },

    showInfo() {
      console.log("Información o estadísticas mostradas.");
    }
  },

  async mounted() {
    let ventaRecuperada;
    window.addEventListener("keydown", this.handleKeyPress);
    document.title = "Crear Ventas";
    this.changeFavicon('/img/spiderman.ico');

    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();
      this.usaSAR = await sucursalSar(this.id_usuario);
      this.info = await getInfoBasic(this.id_usuario);
      this.productos = await getProductos(this.id_usuario);
      // Removemos esta línea que estaba causando el problema
      // this.cajaAbierta = await cajaUsuario(this.id_usuario);

      ventaRecuperada = await getVentaPendiente(this.id_usuario);
      if (ventaRecuperada.resultado) {
        await this.RecventaPendiente(ventaRecuperada.productos);
      }
    } catch (error) {
      notificaciones('error', error.message);
    }
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
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Layout Principal */
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(10px, 2vw, 20px);
  z-index: 1;
  min-height: 100vh;
}

/* Estados de Facturación */
.facturando {
  color: #0c9200;
  font-weight: bold;
}

.no-facturando {
  color: #c90101;
  font-weight: bold;
}

.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  z-index: 1;
  margin: 0;
  padding: 0 clamp(10px, 2vw, 20px);
}

/* Header */
.header-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  /* Cambiado a space-between para distribuir uniformemente */
  align-items: flex-start;
  /* Alinear al inicio para mantener la altura consistente */
  padding: clamp(5px, 1.5vw, 10px);
  border-bottom: 1px solid #ccc;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.input-button-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.inputs-container,
.buttons-header {
  justify-content: center;
  display: flex;
  gap: 5px;
  width: 100%;
}

.cliente-input,
.rtn-input {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
  height: 30px;
  font-size: clamp(12px, 1.5vw, 14px);
  width: 50%;
}

.rtn-input {
  color: #666;
}

.search-button {
  height: 30px;
  padding: 0 8px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: clamp(12px, 1.5vw, 14px);
  width: 50%;
}

.campo {
  height: 40px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(16px, 2vw, 20px);
  margin-bottom: 15px;
  text-align: center;
  width: 100%;
}

.search-button:hover {
  background-color: #e0e0e0;
}

/* Información Section */

.tipo-cliente,
.informacion-1,
.informacion-2 {
  flex: 1;
  /* Cada columna toma el mismo espacio */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 15px;
  /* Padding horizontal uniforme */
  max-width: 400px;
  /* Ancho máximo para cada columna */
}

/* Column Container y Tabla */
.column-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100vh - 250px);
  margin-bottom: 10px;
  z-index: 1;
  flex-wrap: wrap;
  gap: 10px;
}

.table-container {
  width: 100%;
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: auto;
}

.table-wrapper {
  flex-grow: 1;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.table thead {
  position: sticky;
  top: 0;
  z-index: 2;
  background: white;
  display: table;
  width: 100%;
  table-layout: fixed;
}

.table tbody {
  display: block;
  overflow-y: auto;
  width: 100%;
  height: clamp(200px, 50vh, 340px);
}

.table tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

/* Columnas responsivas */
@media screen and (min-width: 768px) {
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
}

@media screen and (max-width: 767px) {
  .col-item {
    width: 15%;
  }

  .col-codigo {
    width: 25%;
  }

  .col-descripcion {
    width: 30%;
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
}

/* Estilos de la tabla */
th {
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
  padding: clamp(5px, 1.5vw, 10px);
  text-align: left;
  font-weight: 600;
  font-size: clamp(12px, 1.5vw, 14px);
}

td {
  padding: clamp(5px, 1.5vw, 10px);
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: clamp(12px, 1.5vw, 14px);
}

/* Teclado Numérico */
.numeric-keypad {
  width: clamp(250px, 20%, 300px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-left: 1px solid #ccc;
  z-index: 1;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(5px, 1vw, 10px);
  width: 100%;
}

/* Botones */
button {
  width: 100%;
  height: clamp(35px, 5vw, 40px);
  font-size: clamp(14px, 2vw, 18px);
  border: none;
  border-radius: 5px;
  background-color: #f0f0f0;
  cursor: pointer;
}

/* Total Container */
.total-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: clamp(10px, 2vw, 20px);
  padding: clamp(5px, 1.5vw, 10px);
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-top: none;
  flex-wrap: wrap;
}

.cantidad-input,
.total-input {
  display: flex;
  align-items: center;
  gap: clamp(5px, 1vw, 10px);
}

.cantidad-input input {
  width: clamp(80px, 15vw, 120px);
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Footer */
.footer-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: clamp(3px, 1vw, 5px);
  background-color: #f0f0f0;
  border-top: 1px solid #ccc;
  z-index: 2;
  gap: 5px;
}

.footer-container button {
  width: clamp(50px, 10vw, 70px);
  height: clamp(50px, 10vw, 70px);
  border-radius: 50%;
  font-size: clamp(10px, 1.5vw, 12px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.subTotal {
  font-size: clamp(24px, 5vw, 36px);
  font-weight: bold;
  margin: 0;
}

.selected {
  background-color: #63b4ff !important;
}

.table tbody tr.selected:hover {
  background-color: #d1e8ff !important;
}

/* Media Queries */
@media screen and (max-width: 768px) {
  .header-container {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .tipo-cliente,
  .informacion-1,
  .informacion-2 {
    width: 100%;
    padding: 0;
    margin-bottom: 10px;
  }

  .numeric-keypad {
    width: 100%;
    border-left: none;
    border-top: 1px solid #ccc;
  }

  .column-container {
    flex-direction: column;
  }

  .total-container {
    justify-content: center;
  }
}

@media screen and (max-width: 480px) {
  .inputs-container {
    flex-direction: column;
  }

  .cliente-input,
  .rtn-input {
    width: 100%;
  }

  .footer-container button {
    font-size: 10px;
  }

  .buttons-header {
    width: 100%;
  }
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
  background: #888;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Agregar después de todos tus estilos actuales */

/* =======================================================
   Modo Oscuro
======================================================= */
/* Contenedor principal */
.dark .wrapper {
  background-color: #1e1e1e;
  color: #fff;
}

.dark .main-container {
  background-color: #1e1e1e;
}

/* Header y elementos de input */
.dark .header-container {
  border-color: #404040;
}

.dark .cliente-input,
.dark .rtn-input {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

.dark .search-button {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

.dark .search-button:hover {
  background-color: #383838;
}

.dark .campo {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

/* Tabla */
.dark .table-wrapper {
  border-color: #404040;
  background-color: #2d2d2d;
}

.dark .table {
  background-color: #2d2d2d;
}

.dark .table thead {
  background-color: #2d2d2d;
}

.dark th {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

.dark td {
  border-color: #404040;
  color: #fff;
}

.dark .table tbody tr:hover {
  background-color: #383838;
}

.dark .selected {
  background-color: #004c77 !important;
}

.dark .table tbody tr.selected:hover {
  background-color: #005a8e !important;
}

/* Teclado numérico */
.dark .numeric-keypad {
  border-color: #404040;
}

.dark button {
  background-color: #2d2d2d;
  color: #fff;
}

.dark button:hover {
  background-color: #383838;
}

/* Total container */
.dark .total-container {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

.dark .cantidad-input input {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

/* Footer */
.dark .footer-container {
  background-color: #2d2d2d;
  border-color: #404040;
}

/* Estados de facturación */
.dark .facturando {
  color: #00ff9d;
}

.dark .no-facturando {
  color: #ff4444;
}

/* Scrollbar en modo oscuro */
.dark .table-container::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.dark .table-container::-webkit-scrollbar-thumb {
  background: #c09d62;
}

.dark .table-container::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}

/* Input autofill en modo oscuro */
.dark input:-webkit-autofill,
.dark input:-webkit-autofill:hover,
.dark input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff;
  -webkit-box-shadow: 0 0 0px 1000px #383838 inset;
  transition: background-color 5000s ease-in-out 0s;
}

.cajaButton {
  background-color: #2d2d2d;
  width: 25%;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>