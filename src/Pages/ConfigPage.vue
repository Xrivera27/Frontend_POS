<template>
  <div class="configuracion-usuario">
    <div class="config-wrapper">
      <ModalLoading :isLoading="isLoading" />
      <PageHeader :titulo="titulo" />
      <div class="usuario-config" v-if="showUser">
        <!-- Formulario básico de usuario -->
        <form
          @submit.prevent="updateUserData"
          autocomplete="off"
          class="formulario form-basic-user"
        >
          <fieldset :disabled="usuarioEditing">
            <div class="contenedor-titulo">
              <h2 class="titulo-form">Configuración</h2>
            </div>
            <div class="contenedor-principal">
              <div class="contenedor-interno contenedor-izquierdo">
                <label for="nombre-usuario">Nombre de usuario:</label>
                <input
                  ref="nombreInput"
                  v-model="userForm.nombre_usuario"
                  type="text"
                  id="nombre_usuario"
                  name="nombre_usuario"
                />

                <div class="form-group">
                  <label>Teléfono:</label>
                  <div class="phone-input-container">
                    <select
                      v-model="selectedCountry"
                      @change="updatePhoneValidation"
                      class="select-phone"
                    >
                      <option value="">País</option>
                      <option
                        v-for="(country, code) in countryData"
                        :key="code"
                        :value="code"
                      >
                        {{ country.emoji }} {{ country.code }}
                      </option>
                    </select>
                    <input
                      v-model="userForm.telefono"
                      type="text"
                      class="input-phone"
                      :placeholder="'Número (' + phoneLength + ' dígitos)'"
                    />
                  </div>
                </div>

                <label for="direccion">Dirección:</label>
                <input
                  v-model="userForm.direccion"
                  type="text"
                  id="direccion"
                  name="direccion"
                />
              </div>

              <div class="contenedor-interno contenedor-derecho">
                <button
                  type="button"
                  class="btn btn-password"
                  :class="{ disabled: usuarioEditing }"
                  :disabled="usuarioEditing"
                  @click="togglePasswordEdit"
                >
                  {{ isPassEdit ? "Cancelar cambio" : "Cambiar contraseña" }}
                </button>

                <template v-if="isPassEdit">
                  <label for="contrasena">Contraseña actual:</label>
                  <input
                    ref="contraInput"
                    v-model="userForm.contraseña"
                    type="password"
                    id="contraseña"
                    name="contraseña"
                    required
                  />

                  <label for="contrasena-nueva">Contraseña nueva:</label>
                  <input
                    v-model="userForm.contraseña_nueva"
                    type="password"
                    id="contraseña_nueva"
                    name="contraseña_nueva"
                  />

                  <label for="contrasena-confirmar"
                    >Confirmar contraseña:</label
                  >
                  <input
                    v-model="userForm.contraseña_confirm"
                    type="password"
                    id="contraseña_confirm"
                    name="contraseña_confirm"
                  />
                </template>
              </div>
            </div>
          </fieldset>
          <div class="botones-container">
            <button
              class="btn editar"
              @click="isEditing(1)"
              :disabled="!usuarioEditing"
            >
              Editar
            </button>
            <button
              type="submit"
              class="btn guardar"
              :disabled="usuarioEditing"
            >
              Guardar
            </button>
          </div>
        </form>

        <!-- Formulario avanzado de usuario -->
        <form
          @submit.prevent="updateUserData"
          autocomplete="off"
          class="formulario form-avanced-user"
        >
          <fieldset :disabled="usuarioAvancedEditing">
            <div class="contenedor-titulo">
              <h2 class="titulo-form">Configuración avanzada</h2>
            </div>
            <div class="contenedor-principal">
              <div class="contenedor-interno contenedor-izquierdo">
                <label for="Nombre">Nombre:</label>
                <input
                  v-model="userFormAdvanced.nombre"
                  type="text"
                  id="nombre"
                  name="nombre"
                />

                <label for="apellido">Apellido:</label>
                <input
                  v-model="userFormAdvanced.apellido"
                  type="text"
                  id="apellido"
                  name="apellido"
                />

                <label for="correo">Correo:</label>
                <input
                  v-model="userFormAdvanced.correo"
                  type="text"
                  id="correo"
                  name="correo"
                />
              </div>
            </div>
          </fieldset>
          <div class="botones-container">
            <button
              class="btn editar"
              @click="isEditing(2)"
              :disabled="!usuarioAvancedEditing"
            >
              Editar
            </button>
            <button
              type="submit"
              class="btn guardar"
              :disabled="usuarioAvancedEditing"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>

      <!-- Botones de navegación -->
      <button
        :class="{ activo: userActive, inactivo: !userActive }"
        :disabled="userBoton"
        class="btn boton-switch"
        @click="switchBools"
      >
        Config. Usuario
      </button>

      <router-link to="/config-company" v-if="esCeo">
        <button
          :class="{ inactivo: userActive, activo: !userActive }"
          :disabled="companyBoton"
          class="btn boton-switch"
        >
          Config. Empresa
        </button>
      </router-link>
      <router-link to="/config-sar" v-if="!esCeo">
        <button
          :class="{ inactivo: userActive, activo: !userActive }"
          class="btn boton-switch"
        >
          Config SAR
        </button>
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import PageHeader from "@/components/PageHeader.vue";
import ModalLoading from "@/components/ModalLoading.vue";
import { notis } from "../../services/notificaciones.js";
import { COUNTRY_CODES } from "../../services/countrySelector.js";
import { validacionesConfigPage } from "../../services/validarCampos.js";
import solicitudes from "../../services/solicitudes.js";
const { esCeo } = require("../../services/usuariosSolicitudes");
const { getApi } = require("../../config/getApiUrl.js");
import { setPageTitle } from "@/components/pageMetadata";

export default {
  components: {
    PageHeader,
    ModalLoading,
  },
  data() {
    return {
      titulo: "Configuración",
      selectedCountry: "HN",
      countryData: COUNTRY_CODES,
      phoneLength: 8,
      isPassEdit: false,
      userBoton: true,
      companyBoton: false,
      id_usuario: "",
      showUser: true,
      esCeo: false,
      userActive: true,
      usuarioEditing: true,
      usuarioAvancedEditing: true,
      isLoading: false,
      userForm: {
        nombreUsuario: "",
        telefono: "",
        direccion: "",
        contraseña: "",
        contraseña_nueva: "",
        contraseña_confirm: "",
      },
      userFormAdvanced: {
        nombre: "",
        apellido: "",
        correo: "",
      },
    };
  },
  methods: {
    updatePhoneValidation() {
      if (this.selectedCountry && this.countryData[this.selectedCountry]) {
        this.phoneLength = this.countryData[this.selectedCountry].length;
      }
    },

    async getUserData() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("auth");

        const response = await axios.get(`${getApi()}/usuarios`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = response.data;
        this.userForm.nombre_usuario = userData.nombre_usuario || "";
        this.userForm.telefono = userData.telefono || "";
        this.userForm.direccion = userData.direccion || "";
        this.userFormAdvanced.nombre = userData.nombre || "";
        this.userFormAdvanced.apellido = userData.apellido || "";
        this.userFormAdvanced.correo = userData.correo || "";
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        notis("error", "No se pudo obtener la información del usuario.");
      } finally {
        this.isLoading = false;
      }
    },

    async updateUserData() {
      if (!this.usuarioEditing) {
        // Validar formulario básico
        if (
          !(await validacionesConfigPage.validarCamposConfiguracion(
            this.userForm,
            this.isPassEdit,
            this.selectedCountry
          ))
        ) {
          return;
        }
      } else if (!this.usuarioAvancedEditing) {
        // Validar formulario avanzado
        if (
          !(await validacionesConfigPage.validarCamposConfiguracionAvanzada(
            this.userFormAdvanced
          ))
        ) {
          return;
        }
      }

      // Si se está cambiando la contraseña, verificar primero la contraseña actual
      if (this.isPassEdit) {
        try {
          const token = localStorage.getItem("auth");
          const id_usuario = await solicitudes.solicitarUsuarioToken();

          const verifyResponse = await axios.post(
            `${getApi()}/verificar-password`,
            {
              contraseña: this.userForm.contraseña,
              id_usuario: id_usuario,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (
            !verifyResponse.data ||
            verifyResponse.data.error ||
            !verifyResponse.data.isValid
          ) {
            notis(
              "error",
              verifyResponse.data?.message ||
                "La contraseña actual es incorrecta"
            );
            return;
          }
        } catch (error) {
          console.error("Error al verificar la contraseña:", error);
          notis(
            "error",
            error.response?.data?.message || "Error al verificar la contraseña"
          );
          return;
        }
      }

      // Proceder con la actualización
      this.isLoading = true;
      try {
        const token = localStorage.getItem("auth");

        // Preparar datos para la actualización
        const updatedData = {
          nombre_usuario: this.userForm.nombre_usuario,
          telefono: this.userForm.telefono,
          direccion: this.userForm.direccion,
          nombre: this.userFormAdvanced.nombre,
          apellido: this.userFormAdvanced.apellido,
          correo: this.userFormAdvanced.correo,
        };

        // Agregar datos de contraseña si es necesario
        if (this.isPassEdit && this.userForm.contraseña_nueva) {
          updatedData.contraseña_actual = this.userForm.contraseña;
          updatedData.contraseña_nueva = this.userForm.contraseña_nueva;
          updatedData.contraseña_confirm = this.userForm.contraseña_confirm;
        }

        const response = await axios.put(
          `${getApi()}/configuser`,
          updatedData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          localStorage.setItem("showUpdateSuccess", "true");
          window.location.reload();
        }
      } catch (error) {
        console.error("Error al actualizar los datos del usuario:", error);
        if (error.response?.data) {
          if (error.response.data.duplicados) {
            const duplicados = error.response.data.duplicados;
            if (duplicados.includes("nombre_usuario")) {
              notis("error", "El nombre de usuario ya está en uso");
            }
            if (duplicados.includes("correo")) {
              notis("error", "El correo electrónico ya está en uso");
            }
          } else {
            notis(
              "error",
              error.response.data.message || "Error al actualizar los datos"
            );
          }
        } else {
          notis("error", "Hubo un problema al guardar los datos.");
        }
      } finally {
        this.isLoading = false;
      }
    },

    togglePasswordEdit() {
      this.isPassEdit = !this.isPassEdit;
      // Limpiar campos de contraseña
      this.userForm.contraseña = "";
      this.userForm.contraseña_nueva = "";
      this.userForm.contraseña_confirm = "";

      if (this.isPassEdit) {
        this.$nextTick(() => {
          this.$refs.contraInput?.focus();
        });
      }
    },

    isEditing(orden) {
      switch (orden) {
        case 1:
          this.usuarioEditing = false;
          this.usuarioAvancedEditing = true;
          this.$nextTick(() => {
            this.$refs.nombreInput?.focus();
          });
          break;
        case 2:
          this.usuarioEditing = true;
          this.usuarioAvancedEditing = false;
          break;
        default:
          notis("error", "Ha ocurrido un error");
      }
    },

    switchBools() {
      this.showUser = !this.showUser;
      this.userActive = !this.userActive;
      this.userBoton = !this.userBoton;
      this.companyBoton = !this.companyBoton;
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
  async mounted() {
    this.getUserData();
    setPageTitle("Configuración de Usuario");

    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();
      this.esCeo = await esCeo(this.id_usuario);
    } catch (error) {
      notis("error", error.message);
    }

    if (localStorage.getItem("showUpdateSuccess")) {
      notis("success", "Usuario actualizado exitosamente");
      localStorage.removeItem("showUpdateSuccess");
    }
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

.usuario-config {
  max-width: 1000px; /* Ancho máximo */
  width: 90%; /* Ancho responsivo */
  margin: 0 auto; /* Centrar el contenedor */
  padding: 20px;
}

/* Formularios */
form {
  border: 1px solid rgb(110, 109, 109);
  padding: 24px 0; /* Ajustado el padding */
  border-radius: 10px;
  min-width: 300px;
  width: 100%;
  min-height: 200px;
  position: relative;
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

/* Estilos de entrada */
input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 95%;
  height: 35px;
  background-color: #fff;
  /* Fondo blanco por defecto */
}

.contenedor-principal input {
  margin-bottom: 4%;
}

/* Títulos */
.contenedor-titulo {
  margin: 0;
  padding: 0;
  width: 100%;
  display: flex;
  justify-content: center; /* Cambiado de center a flex-start */
  padding: 0 24px; /* Añadir padding horizontal */
  margin-bottom: 45px; /* Espacio después del título */
}

/* Estilos para el título */
.titulo-form {
  position: relative; /* Cambiado de absolute a relative */
  color: #333333;
  font-weight: 600;
  font-size: 1.5rem;
  margin: 0;
  padding: 0;
  border-bottom: 2px solid #c09d62; /* Línea decorativa debajo del título */
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

.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  cursor: pointer;
}

/* Media Queries */
@media screen and (max-width: 1024px) {
  .usuario-config {
    width: 95%;
  }

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
  .usuario-config {
    width: 100%;
    padding: 10px;
  }

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

.phone-input-container {
  display: flex;
  gap: 8px;
  width: 95%;
  /* Mismo ancho que los otros inputs */
}

.phone-input-container select {
  width: 110px;
  margin: 0;
  /* Importante: sin márgenes */
  height: 35px;
  padding: 0 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.phone-input-container input {
  flex: 1;
  height: 35px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
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

.dark .titulo-form {
  background-color: #1e1e1e;
  color: #fff;
}

/* Inputs y campos de formulario */
.dark input {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
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

.configuracion-usuario {
  padding: 16px;
}

/* Botones principales (Editar y Guardar) */
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

/* Botón Cambiar Contraseña */
.btn-password {
  background-color: #009b15;
  color: white;
  width: 94%;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.btn-password:hover:not(.disabled) {
  background-color: #008512;
  transform: scale(1.02);
}

.btn-password.disabled {
  background-color: #e0e0e0;
  color: #909090;
  cursor: not-allowed;
}

/* Botones de navegación (Config Usuario y Config Empresa) */
.boton-switch {
  padding: 10px 18px;
  transition: all 0.3s ease;
}

.activo {
  background-color: #c09d62;
  color: #ffffff;
  border: 1px solid #a38655;
}

.activo:hover {
  background-color: #a38655;
  transform: scale(1.02);
}

.inactivo {
  background-color: #f5f5f5;
  color: #666666;
  border: 1px solid #e0e0e0;
}

.inactivo:hover {
  background-color: #e8e8e8;
  transform: scale(1.02);
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

.dark .btn-password {
  background-color: #009b15;
}

.dark .btn-password:hover:not(.disabled) {
  background-color: #008512;
}

.dark .btn-password.disabled {
  background-color: #2d2d2d;
  color: #666;
  border: 1px solid #404040;
}

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

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #c09d62;
  box-shadow: 0 0 0 3px rgba(192, 157, 98, 0.2);
  transition: all 0.3s ease;
}
</style>
