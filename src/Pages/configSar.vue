<template>
  <div class="configuracion-usuario">
    <div class="config-wrapper">
      <PageHeader :titulo="titulo" />
      <ModalLoading :isLoading="isLoading" />

      <div class="company-config">
        <form
          @submit.prevent="guardarConfiguracionSAR"
          autocomplete="off"
          class="formulario form-company-SAR"
        >
          <fieldset :disabled="busisnessSarEditing">
            <div class="contenedor-titulo">
              <h2 class="titulo-form">Configuración SAR</h2>
            </div>

            <div class="contenedor-principal">
              <div class="contenedor-interno contenedor-izquierdo">
                <label for="numero_CAI">Numero CAI:</label>
                <input
                  v-model="configuracionSAR.numero_CAI"
                  type="text"
                  id="numero_CAI"
                  maxlength="45"
                  required
                />

                <label for="rango_inicial">Rango Inicial:</label>
                <input
                  v-model="configuracionSAR.rango_inicial"
                  type="text"
                  id="rango_inicial"
                  required
                />

                <label for="rango_final">Rango Final:</label>
                <input
                  v-model="configuracionSAR.rango_final"
                  type="text"
                  id="rango_final"
                  required
                />
              </div>
              <div class="contenedor-interno contenedor-derecho">
                <label for="fecha_autorizacion">Fecha de autorización:</label>
                <input
                  v-model="configuracionSAR.fecha_autorizacion"
                  type="date"
                  id="fecha_autorizacion"
                  required
                  @keypress="soloNumeros($event)"
                />

                <label for="fecha_vencimiento">Fecha de vencimiento:</label>
                <input
                  v-model="configuracionSAR.fecha_vencimiento"
                  type="date"
                  id="fecha_vencimiento"
                  required
                  @keypress="soloNumeros($event)"
                />
              </div>
            </div>
          </fieldset>

          <div class="botones-container">
            <button
              class="btn editar"
              @click="isEditing(4)"
              :disabled="!busisnessSarEditing"
            >
              Editar
            </button>
            <button
              class="btn guardar"
              type="submit"
              :disabled="busisnessSarEditing"
              @click.prevent="updateSAR"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>

    <router-link to="/config-page">
      <button class="btn boton-switch inactivo">Config. Usuario</button>
    </router-link>

    <button class="btn boton-switch activo">Config SAR</button>
  </div>
</template>

<script>
import PageHeader from "@/components/PageHeader.vue";
import axios from "axios";
const { getApi } = require("../../config/getApiUrl.js");
import { setPageTitle } from "@/components/pageMetadata";
import { validacionesConfigSAR } from "../../services/validarCampos.js";
import { notis } from "../../services/notificaciones.js";
import ModalLoading from "@/components/ModalLoading.vue";

export default {
  components: {
    PageHeader,
    ModalLoading,
  },
  data() {
    return {
      titulo: "Configuración SAR",
      isLoading: false,
      busisnessSarEditing: true,
      esCeo: false,
      configuracionSAR: {
        numero_CAI: "",
        rango_inicial: "",
        rango_final: "",
        fecha_autorizacion: "",
        fecha_vencimiento: "",
      },
    };
  },

  methods: {
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

    validateSARNumber(number) {
      return /^\d{16}$/.test(number);
    },

    async getConfiguracionSAR() {
      try {
        const token = localStorage.getItem("auth");
        const response = await axios.get(`${getApi()}/sar`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const sarData = response.data.datosSAR;

        this.configuracionSAR.numero_CAI = sarData.numero_CAI || "";
        this.configuracionSAR.rango_inicial = sarData.rango_inicial || "";
        this.configuracionSAR.rango_final = sarData.rango_final || "";
        this.configuracionSAR.fecha_autorizacion =
          sarData.fecha_autorizacion || "";
        this.configuracionSAR.fecha_vencimiento =
          sarData.fecha_vencimiento || "";
      } catch (error) {
        console.error("Error al obtener la configuración SAR:", error);
        notis("error", "No se pudo obtener la configuración SAR.");
      }
    },

    async updateSAR() {
      // Usar las validaciones definidas
      if (
        !validacionesConfigSAR.validarCamposConfiguracion(this.configuracionSAR)
      ) {
        return;
      }

      this.isLoading = true;
      try {
        const token = localStorage.getItem("auth");

        // Los rangos ya deberían estar formateados por las validaciones
        const updatedData = {
          numero_CAI: this.configuracionSAR.numero_CAI,
          rango_inicial: this.configuracionSAR.rango_inicial,
          rango_final: this.configuracionSAR.rango_final,
          fecha_autorizacion: this.configuracionSAR.fecha_autorizacion,
          fecha_vencimiento: this.configuracionSAR.fecha_vencimiento,
          numero_actual_SAR: this.configuracionSAR.rango_inicial, // Se inicializa con el rango inicial
        };

        const response = await axios.post(
          `${getApi()}/sar/create`,
          updatedData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          notis("success", "Datos SAR actualizados exitosamente", {
            timeout: 5000,
          });
          window.location.reload();
        }
      } catch (error) {
        console.error("Error al actualizar los datos SAR:", error);
        if (error.response) {
          notis("error", "Hubo un problema al guardar los datos.");
        } else if (error.request) {
          notis("error", "Error de conexión con el servidor.", {});
        } else {
          notis("error", "Hubo un problema al guardar los datos.", {});
        }
      } finally {
        this.isLoading = false;
      }
    },

    pushEsc(event) {
      if (event.key === "Esc" || event.key === "Escape") {
        this.usuarioEditing = true;
        this.busisnessSarEditing = true;
        this.businessEditing = true;
        this.usuarioAvancedEditing = true;
      }
    },

    isEditing(orden) {
      switch (orden) {
        case 1:
          this.usuarioEditing = false;
          this.busisnessSarEditing = true;
          this.businessEditing = true;
          this.usuarioAvancedEditing = true;
          break;
        case 2:
          this.usuarioEditing = true;
          this.busisnessSarEditing = true;
          this.businessEditing = true;
          this.usuarioAvancedEditing = false;
          break;
        case 3:
          this.usuarioEditing = true;
          this.busisnessSarEditing = true;
          this.businessEditing = false;
          this.usuarioAvancedEditing = true;
          break;
        case 4:
          this.usuarioEditing = true;
          this.busisnessSarEditing = false;
          this.businessEditing = true;
          this.usuarioAvancedEditing = true;
          break;
        default:
          notis("error", "Ha ocurrido un error", {
            timeout: 5000,
          });
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
  },

  mounted() {
    this.getConfiguracionSAR();
    window.addEventListener("keydown", this.pushEsc);
    setPageTitle("Configuración");
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.pushEsc);
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap");

* {
  box-sizing: border-box;
  font-family: "Montserrat", sans-serif;
}

/* Configuración del usuario */
.configuracion-usuario {
  padding: 16px;
}

/* Contenedores principales */
.config-wrapper {
  padding: 16px;
  width: 100%;
  overflow-x: hidden;
}

.contenedor-principal {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.contenedor-interno {
  display: flex;
  flex-direction: column;
  width: 50%;
  padding: 0 2%;
}

.formulario {
  margin-bottom: 5%;
}

fieldset {
  margin: 0;
  padding: 0;
  border: none;
}

fieldset:disabled label,
fieldset:disabled input {
  color: #858585;
}

.contenedor-principal input {
  margin-bottom: 4%;
}

/* Botones */
.botones-container {
  display: flex;
  justify-content: end;
  margin-right: 2.5%;
  flex-wrap: wrap;
  gap: 10px;
}

.botones-container .btn {
  border-radius: 5px;
}

.botones-container .btn:disabled {
  background-color: #888787;
}

/* Estilos base para los botones de navegación */
.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  cursor: pointer;
}

.boton-switch {
  padding: 10px 18px;
  transition: all 0.3s ease;
}

/* Estilos para el botón activo */
.activo {
  background-color: #c09d62;
  color: #ffffff;
  border: 1px solid #a38655; /* Un borde más oscuro para profundidad */
  transition: all 0.3s ease;
}

.activo:hover {
  background-color: #a38655; /* Un tono más oscuro al hover */
}

.inactivo {
  background-color: #f5f5f5;
  color: #666666;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.inactivo:hover {
  background-color: #e8e8e8;
}

/* Modo oscuro */
.dark .activo {
  background-color: #c09d62;
  color: #ffffff;
  border: 1px solid #a38655;
}

.dark .activo:hover {
  background-color: #a38655;
}

.dark .inactivo {
  background-color: #2d2d2d;
  color: #909090;
  border: 1px solid #404040;
}

.dark .inactivo:hover {
  background-color: #363636;
}

/* Scroll personalizado */
.config-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.config-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.config-wrapper::-webkit-scrollbar-thumb {
  background: #c09d62;
  border-radius: 4px;
}

.config-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}

/* Media Queries */
@media screen and (max-width: 1024px) {
  .contenedor-principal {
    flex-direction: column;
    align-items: center;
  }

  .contenedor-interno {
    width: 90%;
    padding: 0;
  }

  form {
    min-width: 100%;
  }
}

@media screen and (max-width: 768px) {
  .config-wrapper {
    padding: 8px;
  }

  .botones-container {
    justify-content: center;
    margin-right: 0;
  }

  .btn {
    width: 100%;
    margin: 4px 0;
  }

  input {
    width: 100%;
  }

  .contenedor-interno {
    width: 100%;
  }

  .titulo-form {
    font-size: 14px;
    top: -10%;
  }
}

@media screen and (max-width: 480px) {
  .boton-switch {
    width: 100%;
    text-align: center;
  }

  .configuracion-usuario {
    padding: 8px;
  }

  form {
    padding: 20px 10px;
  }

  .botones-container {
    flex-direction: column;
  }

  .boton-switch {
    width: 100%;
    text-align: center;
  }

  input {
    font-size: 14px;
  }

  .titulo-form {
    font-size: 12px;
    top: -8%;
  }
}

/* Contenedor principal */
.dark .configuracion-usuario {
  background-color: #1e1e1e;
  color: #fff;
}

.dark .config-wrapper {
  background-color: #1e1e1e;
  color: #fff;
}

/* Formularios */
.dark form {
  border-color: #404040;
  background-color: #2d2d2d;
}

.dark input:focus {
  border-color: #c09d62;
}

/* Campos deshabilitados */
.dark fieldset:disabled label,
.dark fieldset:disabled input {
  color: #666;
  background-color: #2d2d2d;
}

/* Scroll personalizado en modo oscuro */
.dark .config-wrapper::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.dark .config-wrapper::-webkit-scrollbar-thumb {
  background: #c09d62;
}

.dark .config-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}

/* Otros elementos en modo oscuro */
.dark label {
  color: #fff;
}

.dark ::-webkit-input-placeholder {
  color: #666;
}

.dark :-ms-input-placeholder {
  color: #666;
}

.dark ::placeholder {
  color: #666;
}

/* Input autofill en modo oscuro */
.dark input:-webkit-autofill,
.dark input:-webkit-autofill:hover,
.dark input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff;
  -webkit-box-shadow: 0 0 0px 1000px #383838 inset;
  transition: background-color 5000s ease-in-out 0s;
}

/* Form Groups y Contenedores */
.contenedor-titulo {
  margin: 0;
  padding: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 24px;
  margin-bottom: 45px;
}

.company-config {
  max-width: 1000px;
  width: 90%;
  margin: 0 auto;
  padding: 20px;
}

form {
  border: 1px solid rgb(110, 109, 109);
  padding: 24px 0;
  border-radius: 10px;
  min-width: 300px;
  width: 100%;
  min-height: 200px;
  position: relative;
}

/* Título del form */
.titulo-form {
  position: relative;
  color: #333333;
  font-weight: 600;
  font-size: 1.5rem;
  margin: 0;
  padding: 0;
  border-bottom: 2px solid #c09d62;
}

/* Inputs y Labels */
input {
  padding: 10px 12px;
  height: 35px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 95%;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

label {
  margin-bottom: 8px;
  font-weight: 500;
}

/* Estilos para los botones */
.editar {
  background-color: #c09d62;
  font-weight: bolder;
  color: white;
}

.editar:hover {
  background-color: #a38655;
  transform: scale(1.02);
  transition: all 0.3s ease;
}

.editar:disabled {
  background-color: #c09d62 !important;
  opacity: 0.7;
  cursor: not-allowed;
}

.guardar {
  background-color: #009b15;
  font-weight: bolder;
  color: white;
  transition: all 0.3s ease;
}

.guardar:hover:not(:disabled) {
  background-color: #008512;
  transform: scale(1.02);
}

.guardar:disabled {
  background-color: #e0e0e0;
  color: #909090;
  cursor: not-allowed;
  transform: none;
}

/* Modo Oscuro */
.dark .editar {
  background-color: #c09d62;
  color: white;
}

.dark .editar:hover {
  background-color: #a38655;
}

.dark .editar:disabled {
  background-color: #c09d62 !important;
  opacity: 0.7;
}

.dark .guardar {
  background-color: #009b15;
  color: white;
}

.dark .guardar:hover:not(:disabled) {
  background-color: #008512;
}

.dark .guardar:disabled {
  background-color: #2d2d2d;
  color: #666;
  border: 1px solid #404040;
}

.dark input {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

.dark .titulo-form {
  background-color: #1e1e1e;
  color: #fff;
}

/* Focus states */
input:focus {
  outline: none;
  border-color: #c09d62;
  box-shadow: 0 0 0 3px rgba(192, 157, 98, 0.2);
  transition: all 0.3s ease;
}
</style>
