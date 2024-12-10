<template>
  <div class="wrapper">
    <ModalLoading :isLoading="isLoading" />
    <AperturaCajaModal
      :isVisible="isAperturaCajaModalVisible"
      @confirmar="handleAperturaCaja"
    />
    <ModalLoading :isLoading="isModalLoading" />
    <PaymentAnimationModal
      :isVisible="isPaymentAnimationVisible"
      @complete="handlePaymentComplete"
    />
    <FacturaModal
      :isVisible="isFacturaModalVisible"
      :idVenta="venta?.id_venta"
      :idUsuario="id_usuario"
      @close="closeFacturaModal"
    />

    <CerrarCajaModal
      :isVisible="isCerrarCajaModalVisible"
      :totalEfectivo="totalEfectivo"
      :totalTransferencia="totalTransferencia"
      @confirm="confirmarCierreCaja"
      @close="isCerrarCajaModalVisible = false"
      @modal-focused="handleModalFocus"
    />

    <div class="main-container">
      <div class="header-container">
        <!-- Aquí estaba el error, había un div y template anidados innecesariamente -->
        <div class="tipo-cliente">
          <label for="tipo-cliente">Cliente:</label>
          <div class="input-button-container">
            <div class="inputs-container">
              <template v-if="!clienteSeleccionado">
                <input
                  type="text"
                  value="Consumidor final"
                  readonly
                  class="cliente-input single"
                />
              </template>
              <template v-else>
                <input
                  type="text"
                  :value="clienteSeleccionado.nombre_completo"
                  readonly
                  class="cliente-input"
                />
                <input
                  type="text"
                  :value="clienteSeleccionado.rtn"
                  readonly
                  class="rtn-input"
                />
              </template>
            </div>
            <div class="buttons-header">
              <button
                :disabled="!cajaAbierta"
                class="search-button"
                @click="openModal"
              >
                Buscar
              </button>
              <ClienteModal
                ref="clienteModal"
                :isVisible="isModalVisible"
                :clientes="clientes"
                :id_usuario="id_usuario"
                @close="closeModal"
                @client-selected="handleClientSelected"
              />
              <!-- Botón para volver a "Consumidor final" -->
              <button
                v-if="clienteSeleccionado"
                class="search-button"
                @click="setConsumidorFinal"
              >
                Consumidor final
              </button>
            </div>
          </div>
        </div>

        <div class="informacion-1">
          <label for="sucursal">Sucursal: {{ info.nombreSucursal }}</label>
          <br />
          <label v-if="!isCajaAbierta" class="no-facturando"
            >Abrir caja antes de facturar!</label
          >
          <label v-else for="usuario">Usuario: {{ info.nombre_usuario }}</label>
        </div>

        <div class="informacion-2">
          <label
            for="numTicket"
            :class="sucursalActivaFactura ? 'facturando' : 'no-facturando'"
          >
            {{
              sucursalActivaFactura
                ? "Sucursal facturando"
                : "Datos SAR Sucursal desactualizados"
            }}
          </label>
          <br />
          <label
            >Fecha: <span>{{ info.fecha }}</span></label
          >
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
                  <th class="col-precio">Precio F.</th>
                  <!-- <th class="col-precio">Descuento/Unidad</th> -->
                  <th class="col-importe">Total</th>
                </tr>
              </thead>
              <tbody>
                <!-- Productos reales -->
                <tr
                  v-for="(producto, index) in productosLista"
                  :key="index"
                  @dblclick="handleRowDoubleClick(producto)"
                  :class="{ selected: selectedItem === producto }"
                >
                  <td class="col-item">{{ index + 1 }}</td>
                  <td class="col-codigo">{{ producto.codigo_producto }}</td>
                  <td class="col-descripcion">{{ producto.nombre }}</td>
                  <td class="col-cantidad">{{ producto.cantidad }}</td>
                  <td class="col-precio">{{ mostrarPrecioFinal(producto) }}</td>
                  <td class="col-precio">
                    {{ producto.precioImpuesto.toFixed(2) }}
                  </td>
                  <!-- <td class="col-descuento">{{ parseFloat(producto.precioDescuento.toFixed(2)) }}</td> -->
                  <td class="col-importe">{{ calcularImporte(producto) }}</td>
                </tr>
                <!-- Filas vacías para llenar el espacio -->
                <tr
                  v-for="n in remainingRows"
                  :key="`empty-${n}`"
                  class="empty-row"
                >
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
              <input
                id="cantidad"
                type="number"
                v-model="totalCantidad"
                min="0"
                step="1"
                @blur="handleCantidadBlur"
                @focus="handleCantidadFocus"
              />
            </div>
            <div class="total-input">
              <label for="total">Total:</label>
              <label class="subTotal" id="total">{{ calcularTotal }}</label>
            </div>
          </div>
        </div>
        <div class="right-section">
          <div class="numeric-keypad">
            <input
              name="codigo-producto"
              autocomplete="off0"
              ref="codigoRef"
              type="text"
              class="campo"
              v-model="addQuery"
              tabindex="1"
              :disabled="!cajaAbierta || isModalFocused || isModalVisible"
              required
            />

            <div class="keypad">
              <button :disabled="!cajaAbierta" @click="agregarNumero(1)">
                1
              </button>
              <button :disabled="!cajaAbierta" @click="agregarNumero(2)">
                2
              </button>
              <button :disabled="!cajaAbierta" @click="agregarNumero(3)">
                3
              </button>
              <button :disabled="!cajaAbierta" @click="agregarNumero(4)">
                4
              </button>
              <button :disabled="!cajaAbierta" @click="agregarNumero(5)">
                5
              </button>
              <button :disabled="!cajaAbierta" @click="agregarNumero(6)">
                6
              </button>
              <button :disabled="!cajaAbierta" @click="agregarNumero(7)">
                7
              </button>
              <button :disabled="!cajaAbierta" @click="agregarNumero(8)">
                8
              </button>
              <button :disabled="!cajaAbierta" @click="agregarNumero(9)">
                9
              </button>
              <button :disabled="!cajaAbierta" @click="agregarNumero(0)">
                0
              </button>
              <button :disabled="!cajaAbierta" @click="agregarNumero('.')">
                .
              </button>
              <button :disabled="!cajaAbierta" @click="agregarNumero('*')">
                *
              </button>
              <button
                :disabled="!cajaAbierta"
                class="borrar"
                @click="borrarUltimo"
              >
                ←
              </button>
              <button :disabled="!cajaAbierta" class="limpiar" @click="limpiar">
                Limpiar
              </button>
              <button
                :disabled="!cajaAbierta"
                class="enter"
                @click="procesarEnter"
              >
                Enter
              </button>
            </div>
          </div>

          <!-- <div v-if="!estadoCajaValidado"> -->
          <!-- </div> -->
          <button
            v-if="!cajaAbierta"
            class="abrir-caja-button"
            @click="abrirCaja"
          >
            Abrir caja
          </button>
          <button
            v-if="cajaAbierta"
            class="abrir-caja-button"
            @click="cerrarCaja"
            style="background-color: crimson"
          >
            Cerrar caja
          </button>
        </div>
      </div>

      <div class="footer-container">
        <button :disabled="!cajaAbierta" @click="buscarProducto">
          Buscar producto [F2]
        </button>
        <BuscarProductoModal
          :isVisible="isBuscarProductoModalVisible"
          :productos="productos"
          @close="closeBuscarProductoModal"
          @product-selected="handleProductSelected"
          @modal-focused="handleModalFocus"
        />
        <button :disabled="!cajaAbierta" @click="openModal">
          Buscar/agregar cliente <br />
          [F3]
        </button>
        <!-- <button :disabled="!cajaAbierta" @click="consultarAnular">Consultar anular [F4]</button> -->
        <button :disabled="!cajaAbierta" @click="eliminarItem">
          Eliminar item <br />
          [F4]
        </button>
        <EliminarItemsModal
          :isVisible="isEliminarModalVisible"
          :item="selectedItem"
          @close="closeEliminarModal"
          @confirm-delete="handleItemDelete"
          @modal-focused="handleModalFocus"
        />
        <button :disabled="!cajaAbierta" @click="limpiarPantalla">
          Limpiar pantalla [F5]
        </button>
        <LimpiarPantallaModal
          :isVisible="isLimpiarPantallaModalVisible"
          @close="closeLimpiarPantallaModal"
          @confirm-limpiar="handleLimpiarPantalla"
          @modal-focused="handleModalFocus"
        />
        <button :disabled="!cajaAbierta" @click="guardarVenta">
          Guardar venta <br />
          [F6]
        </button>
        <GuardarVentaModal
          :isVisible="isGuardarVentaModalVisible"
          :isConsumidorFinal="!clienteSeleccionado"
          @close="isGuardarVentaModalVisible = false"
          @cliente-temporal="handleSaveVenta"
          @modal-focused="handleModalFocus"
        />
        <button :disabled="!cajaAbierta" @click="recVenta">
          Rec. Venta [F7]
        </button>
        <RecuperarVentaModal
          :isVisible="isRecuperarVentaModalVisible"
          :ventas="ventasGuardadas"
          @close="isRecuperarVentaModalVisible = false"
          @venta-selected="handleVentaSelected"
        />
        <!-- <button :disabled="!cajaAbierta" @click="descuentoGeneral">Dscto. Gen. [F10]</button>
        <button :disabled="!cajaAbierta" @click="descuentoIndividual">Dscto. Ind. [F11]</button> -->
        <button :disabled="!cajaAbierta" @click="openPagoModal">
          Registrar Pago <br />
          [F12]
        </button>
        <RegistrarPagoModal
          :isVisible="isPagoModalVisible"
          :factura="factura"
          @close="closePagoModal"
          @confirm-payment="realizarPago"
          @modal-focused="handleModalFocus"
        />
        <button @click="salir">Salir<br />[ALT] + [S]</button>
        <LogoutConfirmModal
          :isVisible="showConfirmModal"
          @confirm="logout"
          @cancel="cancelarSalir"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ClienteModal from "../components/modalesCrearVenta/ClienteModal.vue";
import RegistrarPagoModal from "../components/modalesCrearVenta/RegistrarPagoModal.vue";
import EliminarItemsModal from "../components/modalesCrearVenta/EliminarItemsModal.vue";
import BuscarProductoModal from "../components/modalesCrearVenta/BuscarProductoModal.vue";
import { useToast } from "vue-toastification";
import { notificaciones, notis } from "../../services/notificaciones.js";
import ModalLoading from "@/components/ModalLoading.vue";
import GuardarVentaModal from "@/components/modalesCrearVenta/GuardarVentaModal.vue";
import RecuperarVentaModal from "@/components/modalesCrearVenta/RecuperarVentaModal.vue";
import PaymentAnimationModal from "@/components/PaymentAnimationModal.vue";
//import VentaPendienteModal from '@/components/modalesCrearVenta/VentaPendiente.vue';
import AperturaCajaModal from "@/components/modalesCrearVenta/AperturaCajaModal.vue";
import solicitudes from "../../services/solicitudes.js";
import LimpiarPantallaModal from "@/components/modalesCrearVenta/LimpiarPantallaModal.vue";
import LogoutConfirmModal from "@/components/LogoutConfirmModal.vue";

import {
  getInfoBasic,
  getProductos,
  agregarProductoCodigo,
  getVentaPendiente,
  guardarVenta,
  getVentasGuardadas,
  getRecProductoVenta,
  postVenta,
  eliminarVenta,
  eliminarProductoVenta,
  cajaUsuario,
  createCaja,
  pagar,
  pagarTranferir,
} from "../../services/ventasSolicitudes.js";
//cajaUsuario
import FacturaModal from "@/components/FacturaModal.vue"; // Nuevo
import CerrarCajaModal from "@/components/CierreCajaModal.vue";
const {
  getClientesbyEmpresa,
} = require("../../services/clienteSolicitudes.js");
const { sucursalSar } = require("../../services/sucursalesSolicitudes.js");
import { setPageTitle } from "@/components/pageMetadata";

export default {
  components: {
    ClienteModal,
    LogoutConfirmModal,
    AperturaCajaModal,
    PaymentAnimationModal,
    RegistrarPagoModal,
    EliminarItemsModal,
    LimpiarPantallaModal,
    BuscarProductoModal,
    ModalLoading,
    GuardarVentaModal,
    RecuperarVentaModal,
    FacturaModal,
    CerrarCajaModal,
  },
  data() {
    return {
      isAperturaCajaModalVisible: false,
      showConfirmModal: false,
      isLimpiarPantallaModalVisible: false,
      itemTemp: null,
      isLoading: false,
      estadoCajaValidado: false,
      isCerrarCajaModalVisible: false,
      isFacturaModalVisible: false, // Agregado para el modal de factura
      facturaActual: "",
      cajaAbierta: false,
      minRows: 15,
      numTicket: "000-001-01-00000001",
      fecha: new Date().toLocaleDateString(),
      addQuery: "",
      totalCantidad: "",
      id_usuario: 0,
      totalEfectivo: 0,
      totalTransferencia: 0,
      prueba: "prueba",
      info: "",
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
      loadingMessage: "",
      recuperandoVenta: false,
      isGuardarVentaModalVisible: false,
      isRecuperarVentaModalVisible: false,
      ventaPendiente: false,
      isPaymentAnimationVisible: false,
    };
  },

  watch: {
    // Observador para el modal de factura
    isFacturaModalVisible(newVal) {
      this.isAnyModalOpen = newVal;
      if (newVal) {
        this.pauseMainKeyboardEvents();
      } else {
        this.resumeMainKeyboardEvents();
      }
    },

    showConfirmModal(newVal) {
      this.isAnyModalOpen = newVal;
      if (newVal) {
        this.pauseMainKeyboardEvents();
      } else {
        this.resumeMainKeyboardEvents();
      }
    },

    // Observador para el modal principal
    isModalVisible(newVal) {
      this.isAnyModalOpen = newVal;
      if (newVal) {
        this.isPagoModalVisible = false;
        this.pauseMainKeyboardEvents();
      } else {
        this.resumeMainKeyboardEvents();
      }
    },

    // Observador para el modal de pago
    isPagoModalVisible(newVal) {
      this.isAnyModalOpen = newVal;
      if (newVal) {
        this.isModalVisible = false;
        this.pauseMainKeyboardEvents();
      } else {
        this.resumeMainKeyboardEvents();
      }
    },

    // Observador para el modal de búsqueda de producto
    isBuscarProductoModalVisible(newVal) {
      this.isAnyModalOpen = newVal;
      if (newVal) {
        this.pauseMainKeyboardEvents();
      } else {
        this.resumeMainKeyboardEvents();
      }
    },

    // Observador para el modal de cierre de caja
    isCerrarCajaModalVisible(newVal) {
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
      const total = this.productosLista.reduce(
        (total, p) => total + p.precio_final,
        0
      );
      return total.toLocaleString("es-HN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    // Actualizamos esta propiedad para que dependa de cajaAbierta
    sucursalActivaFactura() {
      return this.usaSAR && this.cajaAbierta;
    },

    // Movemos isCajaAbierta a computed properties
    isCajaAbierta() {
      return this.cajaAbierta;
    },
  },

  remainingRows() {
    return Math.max(0, this.minRows - this.productosLista.length);
  },

  methods: {
    abrirModalCerrarCaja() {
      this.isCerrarCajaModalVisible = true;
    },

    closeFacturaModal() {
      this.isFacturaModalVisible = false;
      this.$nextTick(() => {
        this.$refs.codigoRef?.focus();
      });
    },

    salir() {
      this.showConfirmModal = true;
    },

    // Agregar método para cancelar
    cancelarSalir() {
      this.showConfirmModal = false;
    },

    abrirCaja() {
      this.isAperturaCajaModalVisible = true;
      this.pauseMainKeyboardEvents();
    },
    async confirmarCierreCaja(datosCierre) {
      this.isModalLoading = true;
      try {
        this.isModalLoading = true;
        this.loadingMessage = "Cerrando caja...";

        const url = `${solicitudes.homeUrl}/ventas/cerrar-caja/${this.id_usuario}`;
        console.log("URL de la petición:", url);

        const token = localStorage.getItem("auth");
        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_usuario: this.id_usuario,
            dineroCaja: datosCierre.dineroEnCaja,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Error del servidor: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        if (data) {
          try {
            this.isModalLoading = true;
            await this.generarPDFCierreCaja(data);
            notis("success", "Caja cerrada y reporte generado exitosamente");
          } catch (pdfError) {
            console.error("Error al generar PDF:", pdfError);
            notis(
              "warning",
              "Caja cerrada pero hubo un error al generar el PDF"
            );
          } finally {
            this.isModalLoading = false;
          }
        }

        this.cajaAbierta = false;
        this.isCerrarCajaModalVisible = false;
      } catch (error) {
        console.error("Error al cerrar caja:", error);
        notis("error", "Error al cerrar caja");
      } finally {
        this.isModalLoading = false;
      }
    },

    async generarPDFCierreCaja(reporte) {
      console.log("Iniciando generación de PDF...");
      this.isModalLoading = true;
      try {
        console.log("Datos del reporte a enviar:", reporte);

        // Usar la URL base del proyecto
        const url = `${solicitudes.homeUrl}/ventas/generar-pdf-cierre/${this.id_usuario}`;
        console.log("URL de la petición:", url);

        const token = localStorage.getItem("auth");
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Agregar el token de autorización
          },
          body: JSON.stringify(reporte),
        });

        console.log("Respuesta del servidor:", response);
        console.log("Status:", response.status);

        if (!response.ok) {
          console.error(
            "Respuesta no exitosa:",
            response.status,
            response.statusText
          );
          const errorText = await response.text();
          console.error("Detalle del error:", errorText);
          throw new Error(
            `Error del servidor: ${response.status} ${response.statusText}`
          );
        }

        console.log("Obteniendo blob de la respuesta...");
        const blob = await response.blob();
        console.log("Blob recibido:", blob);

        console.log("Creando URL del blob...");
        const url_blob = window.URL.createObjectURL(blob);
        console.log("URL creada:", url_blob);

        console.log("Configurando descarga...");
        const a = document.createElement("a");
        a.href = url_blob;
        a.download = `cierre_caja_${
          new Date().toISOString().split("T")[0]
        }.pdf`;

        console.log("Iniciando descarga...");
        document.body.appendChild(a);
        a.click();

        console.log("Limpiando recursos...");
        window.URL.revokeObjectURL(url_blob);
        document.body.removeChild(a);

        console.log("PDF generado y descargado exitosamente");
      } catch (error) {
        console.error("Error detallado en generarPDFCierreCaja:", {
          mensaje: error.message,
          error: error,
          stack: error.stack,
        });
        throw error;
      } finally {
        this.isModalLoading = false;
      }
    },

    async cerrarCaja() {
      this.isModalLoading = true;
      try {
        const { data: ventas } = await axios.get(
          `${solicitudes.homeUrl}/ventas/totales-caja/${this.id_usuario}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth")}`,
            },
          }
        );

        this.totalEfectivo = ventas.totalEfectivo;
        this.totalTransferencia = ventas.totalTransferencia;
        this.abrirModalCerrarCaja();
      } catch (error) {
        console.error("Error al obtener totales:", error);
        notis("error", "Error al obtener totales de caja");
      } finally {
        this.isModalLoading = false;
      }
    },

    async handleAperturaCaja(monto) {
      this.isModalLoading = true;
      try {
        this.loadingMessage = "Abriendo caja...";

        await new Promise((resolve) => setTimeout(resolve, 1000));
        await createCaja(this.id_usuario, monto);

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
      this.loadingMessage = "Cargando productos...";
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

    handleCantidadFocus() {
      // Pausar temporalmente los eventos del teclado mientras el input de cantidad tiene el focus
      this.pauseMainKeyboardEvents();
    },

    handleCantidadBlur() {
      // Al perder el focus del input de cantidad
      this.$nextTick(() => {
        // Asegurarnos que el valor es un número válido
        if (this.totalCantidad === "" || isNaN(this.totalCantidad)) {
          this.totalCantidad = "";
        }
        // Devolver el focus al input principal
        this.$refs.codigoRef?.focus();
        // Reanudar los eventos del teclado
        this.resumeMainKeyboardEvents();
      });
    },

    setConsumidorFinal() {
      this.clienteSeleccionado = null; // Restablece la selección del cliente
    },

    calcularImporte(producto) {
      if (
        producto.precio_mayorista > 0 &&
        producto.cantidad_activar_mayorista > 0 &&
        producto.cantidad >= producto.cantidad_activar_mayorista
      ) {
        producto.precio_final = +(
          producto.cantidad * producto.precioImpuestoMayorista
        ).toFixed(2);
      } else {
        producto.precio_final = +(
          producto.cantidad * producto.precioImpuesto
        ).toFixed(2);
      }
      return producto.precio_final.toFixed(2);
    },

    mostrarPrecioFinal(producto) {
      if (
        producto.precio_mayorista > 0 &&
        producto.cantidad_activar_mayorista > 0 &&
        producto.cantidad >= producto.cantidad_activar_mayorista
      ) {
        return producto.precio_mayorista;
      } else {
        return producto.precio_unitario;
      }
    },

    handleModalFocus(isFocused) {
      this.isModalFocused = isFocused;
    },

    handleRowDoubleClick(item) {
      // Si el item clickeado es el mismo que ya está seleccionado, lo deseleccionamos
      if (this.selectedItem === item) {
        this.selectedItem = null;
      } else {
        // Si es un item diferente o no hay ninguno seleccionado, lo seleccionamos
        this.selectedItem = item;
      }
    },

    eliminarItem() {
      if (this.productosLista.length === 0) {
        notis("info", "No hay datos en la tabla.");
        return;
      } else if (!this.selectedItem) {
        notis("info", "Seleccione un item para eliminar");
        return;
      }
      this.isEliminarModalVisible = true;
    },

    async limpiarPantalla() {
      if (this.productosLista.length === 0) {
        notis("info", "No hay datos en la tabla.");
        return;
      }
      this.isLimpiarPantallaModalVisible = true;
    },

    // Añade el método para manejar la confirmación:
    async handleLimpiarPantalla(data) {
      this.isModalLoading = true;
      try {
        for (const producto of this.productosLista) {
          const eliminando = await eliminarProductoVenta(
            producto.id_producto,
            data.clave,
            this.id_usuario
          );

          if (!eliminando) {
            throw "Ocurrió un error al limpiar la pantalla";
          }
        }

        this.productosLista = [];
        this.selectedItem = null;
        this.venta = [];
        this.factura = [];
        this.clienteSeleccionado = null;
        this.addQuery = "";
        this.totalCantidad = "";

        notis("success", "Pantalla limpiada correctamente");
      } catch (error) {
        console.error(error);
        notificaciones("error", "Contraseña no reconocida.");
      } finally {
        this.isModalLoading = false;
      }
    },

    // Añade método para cerrar el modal:
    closeLimpiarPantallaModal() {
      this.isLimpiarPantallaModalVisible = false;
    },

    async handleItemDelete(data) {
      this.isModalLoading = true;
      this.loadingMessage = "Eliminando item...";
      try {
        const index = this.productosLista.findIndex((p) => p === data.item);
        if (index !== -1) {
          const eliminando = await eliminarProductoVenta(
            this.productosLista[index].id_producto,
            data.clave, // Usamos la clave ingresada en el modal
            this.id_usuario
          );
          if (!eliminando) {
            throw "Ocurrió un error al eliminar Item";
          }
          this.productosLista.splice(index, 1);
          this.selectedItem = null;
          const toast = useToast();
          toast.success("Item eliminado correctamente");
        }
      } catch (error) {
        notificaciones("error", "Contraseña no reconocida.");
      } finally {
        this.isModalLoading = false;
      }
    },

    closeEliminarModal() {
      this.isEliminarModalVisible = false;
    },

    async logout() {
      this.isModalLoading = true;
      try {
        await axios.post(
          "/api/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth")}`,
            },
          }
        );

        localStorage.clear();
        this.$router.push("/login");
      } catch (error) {
        console.error("Error al cerrar sesión", error);
        localStorage.clear();
        this.$router.push("/login");
      } finally {
        this.isModalLoading = true;
      }
    },

    handleClientSelected(client) {
      this.clienteSeleccionado = client;
      this.closeModal();
    },

    async openModal() {
      this.isModalLoading = true;
      this.loadingMessage = "Cargando clientes...";
      try {
        this.clientes = await getClientesbyEmpresa(this.id_usuario);
        this.isModalVisible = true;
      } catch (error) {
        notificaciones("error", error.message);
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

    async nuevoCliente() {
      this.isModalLoading = true;
      this.loadingMessage = "Cargando clientes...";
      try {
        this.clientes = await getClientesbyEmpresa(this.id_usuario);
        this.isModalVisible = true;
        // Emitir un evento para que el modal sepa que debe mostrar el formulario
        this.$nextTick(() => {
          this.$refs.clienteModal.abrirFormularioDirectamente();
        });
      } catch (error) {
        notificaciones("error", error.message);
      } finally {
        this.isModalLoading = false;
      }
    },

    async realizarPago(datosPago) {
      console.log(datosPago);
      let pagando = false;
      if (this.productosLista.length === 0) {
        const toast = useToast();
        toast.warning("No hay productos en la tabla de ventas.");
        return;
      }

      this.isModalLoading = true;
      try {
        if (datosPago.metodoPago === "Efectivo") {
          pagando = await pagar(
            datosPago.montoEfectivo,
            this.venta.id_venta,
            datosPago.notas,
            this.id_usuario
          );
        } else if (datosPago.metodoPago === "Transferencia") {
          pagando = await pagarTranferir(
            datosPago.montoTransferencia,
            this.venta.id_venta,
            datosPago.numeroTransferencia,
            datosPago.notas,
            this.id_usuario
          );
        }

        if (!pagando) {
          throw "No se realizo el pago";
        }

        // Guardar el número de factura
        this.facturaActual =
          this.venta?.facturas?.[0]?.factura_SAR?.[0]?.numero_factura_SAR ||
          pagando.numero_factura ||
          "";

        // Cerrar el modal de pago y mostrar factura
        this.isPagoModalVisible = false;
        this.isFacturaModalVisible = true;

        // La animación de pago se mostrará después de cerrar la factura
        this.isPaymentAnimationVisible = true;
      } catch (error) {
        notificaciones("error", error.message);
      } finally {
        this.isModalLoading = false;
      }
    },

    handlePaymentComplete() {
      this.isPaymentAnimationVisible = false;
      this.limpiarPagado();
      this.facturaActual = "";
    },

    async openPagoModal() {
      const toast = useToast();
      if (this.productosLista.length === 0) {
        toast.warning("No hay productos en la tabla de ventas.");
        return;
      }

      const totalNumero = this.productosLista.reduce(
        (total, p) => total + p.precio_final,
        0
      );

      if (!this.clienteSeleccionado && totalNumero > 10000) {
        toast.warning("Agregue un cliente para compras mayores a L. 10,0000");
        return;
      }
      this.isModalLoading = true;
      this.loadingMessage = "Procesando venta...";

      try {
        console.log(this.clienteSeleccionado);
        if (this.venta.length === 0) {
          this.venta = await postVenta(
            this.productosLista,
            this.clienteSeleccionado ? this.clienteSeleccionado.id_cliente : 0,
            this.id_usuario
          );
        } else if (this.venta.factura.total !== this.calcularTotal) {
          const id_venta = this.venta.id_venta;
          const id_factura = this.venta.factura.id_factura;

          const promesas = [
            eliminarVenta(id_venta, id_factura),
            postVenta(
              this.productosLista,
              this.clienteSeleccionado
                ? this.clienteSeleccionado.id_cliente
                : 0,
              this.id_usuario
            ),
          ];

          const resultados = await Promise.all(promesas);
          const { resultado: resultadoEliVenta, message: messageElimVenta } =
            resultados[0];

          if (!resultadoEliVenta) {
            console.error("Ocurrio un error de servidor", messageElimVenta);
          }

          this.venta = resultados[1];
        }

        this.factura = this.venta.factura;
        this.isPagoModalVisible = true;

        this.$nextTick(() => {
          const pagoModalElement = document.querySelector(".modal-content");
          if (pagoModalElement) {
            pagoModalElement.focus();
          }
        });
      } catch (error) {
        console.log(error);
        toast.error("Ocurrio un error al registrar venta.");
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
      // Si la caja no está abierta, solo permite la tecla para abrir caja
      if (!this.cajaAbierta && event.altKey && event.key === "s") {
        event.preventDefault();
        this.salir();
        return;
      }

      if (!this.cajaAbierta) {
        return; // No procesar ninguna otra tecla si la caja está cerrada
      }

      if (this.isAnyModalOpen || this.isModalFocused) {
        return;
      }

      const key = event.key;

      // Cancela la acción predeterminada si se presiona una tecla específica
      if (
        key === "F3" ||
        key === "F12" ||
        key === "F4" ||
        key === "F5" ||
        key === "F6" ||
        key === "F8" ||
        key === "F9" ||
        key === "F10" ||
        key === "F11"
      ) {
        event.preventDefault();
      }

      // const toast = useToast();

      if (!isNaN(key) || key === ".") {
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
        this.salir();
      } else if (key === "F2") {
        event.preventDefault();
        this.buscarProducto();
      } else if (key === "F3") {
        event.preventDefault();
        this.openModal();
      } else if (key === "F4") {
        event.preventDefault();
        this.eliminarItem();
      } else if (key === "F5") {
        event.preventDefault();
        this.limpiarPantalla();
      } else if (key === "F6") {
        event.preventDefault();
        this.guardarVenta();
      } else if (key === "F7") {
        event.preventDefault();
        this.recVenta();
      } else if (key === "F12") {
        event.preventDefault();
        this.openPagoModal();
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
      this.totalCantidad = "";
      this.$refs.codigoRef?.focus();
    },

    limpiarPagado() {
      this.addQuery = "";
      this.totalCantidad = "";
      this.productosLista = [];
      this.venta = [];
      this.factura = [];
      this.clienteSeleccionado = null;
      this.facturaActual = "";
    },

    procesarEnter() {
      this.agregarProducto();
    },

    async agregarProducto() {
      let nuevaCantidad = this.totalCantidad;

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
        const newProduct = this.productos.find(
          (p) => p.codigo_producto === codigoValidar
        );
        if (!newProduct) {
          const toast = useToast();
          toast.warning("No existe el producto");

          return;
        }

        const existingProduct = this.productosLista.find(
          (p) => p.codigo_producto === codigoValidar
        );
        if (existingProduct) {
          existingProduct.cantidad += nuevaCantidad;
        } else {
          newProduct.cantidad = nuevaCantidad;
          this.productosLista.push({ ...newProduct });
        }

        if (!this.recuperandoVenta) {
          const result = await agregarProductoCodigo(
            nuevaCantidad,
            codigoValidar,
            this.id_usuario
          );
          console.log(result);
          if (result.error) {
            const index = this.productosLista.findIndex(
              (i) => i.codigo_producto === codigoValidar
            );
            this.productosLista[index].cantidad =
              this.productosLista[index].cantidad - nuevaCantidad;
            if (this.productosLista[index].cantidad < 1) {
              this.productosLista.splice(index, 1);
            }
            result.message = "No hay stock disponible en el inventario.";
            throw result;
          }
        }
      } catch (error) {
        console.log(error);
        notificaciones("error", error.message);
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
      } else {
        this.guardarVentainBD(this.clienteSeleccionado.nombre_completo);
      }
    },

    async guardarVentainBD(nombre_completo) {
      this.isModalLoading = true;
      try {
        const response = await guardarVenta(nombre_completo, this.id_usuario);
        if (response) {
          this.limpiarPagado();
          notificaciones("venta-guardada");
        } else {
          throw "Ocurrio un error al guardar venta. Intente mas tarde";
        }
      } catch (error) {
        console.log(error);
        notificaciones("error", error.message);
      } finally {
        this.isModalLoading = false;
      }
    },

    async handleVentaSelected(data) {
      this.isModalLoading = true;
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
        notificaciones(
          "error",
          "Error al recuperar venta. Intente de nuevo mas tarde."
        );
      } finally {
        this.isModalLoading = false;
      }
    },

    async RecventaPendiente(productosRec) {
      this.isModalLoading = true;
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
        notificaciones(
          "error",
          "Error al recuperar venta. Intente de nuevo mas tarde."
        );
      } finally {
        this.isModalLoading = false;
      }
    },

    async handleSaveVenta(data) {
      this.isModalLoading = true;
      this.loadingMessage = "Guardando venta...";

      try {
        this.guardarVentainBD(data);
      } catch (error) {
        notificaciones("error", error.message);
      } finally {
        this.isModalLoading = false;
        this.isGuardarVentaModalVisible = false;
      }
    },

    async recVenta() {
      this.isModalLoading = true;
      try {
        const ventasGuardadas = await getVentasGuardadas(this.id_usuario);
        this.ventasGuardadas = ventasGuardadas;
        console.log(ventasGuardadas);
        this.isRecuperarVentaModalVisible = true;
      } catch (error) {
        notificaciones("error", error);
      } finally {
        this.isModalLoading = false;
      }
    },

    async recVenta2() {
      this.isModalLoading = true;
      try {
        const ventasGuardadas = await getVentasGuardadas(this.id_usuario);
        console.log(ventasGuardadas);
      } catch (error) {
        notificaciones("error", error);
      } finally {
        this.isModalLoading = false;
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
      const link =
        document.querySelector("link[rel*='icon']") ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.rel = "icon";
      link.href = iconPath;
      document.getElementsByTagName("head")[0].appendChild(link);
    },

    toggleEditingMode() {
      this.isEditing = !this.isEditing;
    },

    showInfo() {
      console.log("Información o estadísticas mostradas.");
    },
  },

  async mounted() {
    this.isModalLoading = true;
    let ventaRecuperada;
    window.addEventListener("keydown", this.handleKeyPress);
    setPageTitle("Crear Ventas");

    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();
      this.usaSAR = await sucursalSar(this.id_usuario);
      this.info = await getInfoBasic(this.id_usuario);
      this.productos = await getProductos(this.id_usuario);
      this.cajaAbierta = await cajaUsuario(this.id_usuario);

      this.estadoCajaValidado = true; // Marcar como validado

      ventaRecuperada = await getVentaPendiente(this.id_usuario);
      if (ventaRecuperada.resultado) {
        await this.RecventaPendiente(ventaRecuperada.productos);
      }
    } catch (error) {
      notificaciones("error", error.message);
      this.estadoCajaValidado = true;
    } finally {
      this.isModalLoading = false;
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

  .col-descuento {
    width: 10%;
    color: rgba(255, 0, 0, 0.747);
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

.right-section {
  width: clamp(250px, 20%, 300px);
  display: flex;
  flex-direction: column;
  gap: 15px;
  border-left: 1px solid #ccc;
  padding: 10px;
}

.abrir-caja-button {
  width: 100%;
  padding: 12px;
  background-color: #7bff00;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 35%;
}

.abrir-caja-button:hover {
  background-color: #6ce600;
}

.dark .abrir-caja-button {
  background-color: #5cb300;
  color: #fff;
}

.dark .abrir-caja-button:hover {
  background-color: #4c9900;
}

@media screen and (max-width: 768px) {
  .right-section {
    width: 100%;
    border-left: none;
    border-top: 1px solid #ccc;
  }
}

/* Teclado Numérico */
.numeric-keypad {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  width: 100px;
  height: 30px;
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
  border-radius: 0%;
  font-size: clamp(10px, 1.5vw, 12px);
  display: flex;
  flex-direction: column; /* Añadido para apilar el contenido verticalmente */
  align-items: center;
  justify-content: center;
  background-color: #d1d1d1;
  transition: background-color 0.2s ease;
  white-space: pre-line; /* Añadido para respetar los saltos de línea */
  line-height: 1.2; /* Añadido para mejorar el espaciado entre líneas */
  text-align: center; /* Añadido para centrar el texto */
}

.footer-container button:hover {
  background-color: #b4b4b4;
}

.dark .footer-container button:hover {
  background-color: #3b3b3b;
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
/* Dark mode styles */
.dark {
  background-color: #141414;
  color: #e5e5e5;
}

.dark .wrapper,
.dark .main-container {
  background-color: #141414;
}

.dark .header-container {
  border-color: #2b2b2b;
}

.dark .cliente-input,
.dark .rtn-input,
.dark .campo {
  background-color: #141414;
  border-color: #2b2b2b;
  color: #e5e5e5;
}

.dark .search-button {
  background-color: #1a1a1a;
  border-color: #2b2b2b;
  color: #00ff95;
}

.dark .search-button:hover {
  background-color: #202020;
  color: #00ffaa;
}

.dark .table-wrapper {
  border-color: #2b2b2b;
  background-color: #141414;
}

.dark .table,
.dark .table thead {
  background-color: #141414;
}

.dark th {
  background-color: #1a1a1a;
  border-color: #2b2b2b;
  color: #00ff95;
}

.dark td {
  border-color: #2b2b2b;
  color: #e5e5e5;
}

.dark .table tbody tr:hover {
  background-color: #202020;
}

.dark .selected {
  background-color: #1d909b !important;
}

.dark .table tbody tr.selected:hover {
  background-color: #204060 !important;
}

.dark .numeric-keypad {
  border-color: #2b2b2b;
}

.dark button {
  background-color: #1a1a1a;
  border: 1px solid #2b2b2b;
  color: #00ff95;
}

.dark button:hover:not(:disabled) {
  background-color: #202020;
  color: #00ffaa;
}

.dark button:disabled {
  background-color: #0f0f0f;
  border-color: #1f1f1f;
  color: #404040;
}

.dark .total-container {
  background-color: #141414;
  border-color: #2b2b2b;
}

.dark .cantidad-input input {
  background-color: #141414;
  border-color: #2b2b2b;
  color: #e5e5e5;
}

input:focus {
  outline: none;
  border-color: #c09d62;
  box-shadow: 0 0 0 3px rgba(192, 157, 98, 0.2);
  transition: all 0.3s ease;
}

.dark .footer-container {
  background-color: #141414;
  border-color: #2b2b2b;
}

.dark .facturando {
  color: #00ff95;
}

.dark .no-facturando {
  color: #ff4444;
}

.dark .table-container::-webkit-scrollbar-track {
  background: #141414;
}

.dark .table-container::-webkit-scrollbar-thumb {
  background: #2b2b2b;
}

.dark .table-container::-webkit-scrollbar-thumb:hover {
  background: #363636;
}

.dark input:-webkit-autofill,
.dark input:-webkit-autofill:hover,
.dark input:-webkit-autofill:focus {
  -webkit-text-fill-color: #e5e5e5;
  -webkit-box-shadow: 0 0 0px 1000px #141414 inset;
}

.dark .abrir-caja-button {
  background-color: #00ff95;
  color: #141414;
}

.dark .abrir-caja-button:hover {
  background-color: #00ffaa;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
