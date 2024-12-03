<template>
  <div class="configuracion-usuario">
    <div class="config-wrapper">
      <ModalLoading :isLoading="isLoading" />

      <PageHeader :titulo="titulo" />
      <div class="usuario-config" v-if="showUser">
        <!-- Formulario básico de usuario -->
        <form @submit.prevent="updateUserData" autocomplete="off" class="formulario form-basic-user">
          <fieldset :disabled="usuarioEditing">
            <div class="contenedor-titulo">
              <h2 class="titulo-form">Configuración</h2>
            </div>
            <div class="contenedor-principal">
              <div class="contenedor-interno contenedor-izquierdo">
                <label for="nombre-usuario">Nombre de usuario:</label>
                <input v-model="userForm.nombre_usuario" type="text" id="nombre_usuario" name="nombre_usuario" />

                <div class="form-group">
                  <label>Teléfono:</label>
                  <div class="phone-input-container">
                    <select v-model="selectedCountry" @change="updatePhoneValidation" class="select-phone">
                      <option value="">País</option>
                      <option v-for="(country, code) in countryData" :key="code" :value="code">
                        {{ country.emoji }} {{ country.code }}
                      </option>
                    </select>
                    <input v-model="userForm.telefono" type="text" class="input-phone"
                      :placeholder="'Número (' + phoneLength + ' dígitos)'" />
                  </div>
                </div>

                <label for="direccion">Dirección:</label>
                <input v-model="userForm.direccion" type="text" id="direccion" name="direccion" />
              </div>

              <div class="contenedor-interno contenedor-derecho">

                <button type="button" class="btn btn-password" :class="{ 'disabled': usuarioEditing }"
                  :disabled="usuarioEditing" @click="togglePasswordEdit">
                  {{ isPassEdit ? 'Cancelar cambio' : 'Cambiar contraseña' }}
                </button>

                <!-- Los inputs existentes con v-if -->
                <template v-if="isPassEdit">
                  <label for="contrasena">Contraseña actual:</label>
                  <input v-model="userForm.contraseña" type="password" id="contraseña" name="contraseña" required />

                  <label for="contrasena-nueva">Contraseña nueva:</label>
                  <input v-model="userForm.contraseña_nueva" type="password" id="contraseña_nueva"
                    name="contraseña_nueva" />

                  <label for="contrasena-confirmar">Confirmar contraseña:</label>
                  <input v-model="userForm.contraseña_confirm" type="password" id="contraseña_confirm"
                    name="contraseña_confirm" />
                </template>
              </div>

            </div>
          </fieldset>
          <div class="botones-container">
            <button class="btn editar" @click="isEditing(1)" :disabled="!usuarioEditing">Editar</button>
            <button type="submit" class="btn guardar" :disabled="usuarioEditing">Guardar</button>
          </div>
        </form>

        <!-- Formulario avanzado de usuario -->
        <form @submit.prevent="updateUserData" autocomplete="off" class="formulario form-avanced-user">
          <fieldset :disabled="usuarioAvancedEditing">
            <div class="contenedor-titulo">
              <h2 class="titulo-form">Configuración avanzada</h2>
            </div>
            <div class="contenedor-principal">
              <div class="contenedor-interno contenedor-izquierdo">
                <label for="Nombre">Nombre:</label>
                <input v-model="userFormAdvanced.nombre" type="text" id="nombre" name="nombre" />

                <label for="apellido">Apellido:</label>
                <input v-model="userFormAdvanced.apellido" type="text" id="apellido" name="apellido" />

                <label for="correo">Correo:</label>
                <input v-model="userFormAdvanced.correo" type="text" id="correo" name="correo" />
              </div>
            </div>
          </fieldset>
          <div class="botones-container">
            <button class="btn editar" @click="isEditing(2)" :disabled="!usuarioAvancedEditing">Editar</button>
            <button type="submit" class="btn guardar" :disabled="usuarioAvancedEditing">Guardar</button>
          </div>
        </form>
      </div>

      <!-- Botones de navegación -->
      <button :class="{ 'activo': userActive, 'inactivo': !userActive }" :disabled="userBoton" class="btn boton-switch"
        @click="switchBools">
        Config. Usuario
      </button>

      <router-link to="/config-company">
        <button :class="{ 'inactivo': userActive, 'activo': !userActive }" :disabled="companyBoton"
          class="btn boton-switch">
          Config. Empresa
        </button>
      </router-link>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import PageHeader from "@/components/PageHeader.vue";
import ModalLoading from '@/components/ModalLoading.vue';
import { notis } from '../../services/notificaciones.js';
import { COUNTRY_CODES } from "../../services/countrySelector.js";
import { validacionesConfigPage } from "../../services/validarCampos.js"
import solicitudes from "../../services/solicitudes.js";

export default {
  components: {
    PageHeader,
    ModalLoading
  },
  data() {
    return {
      titulo: 'Configuración',
      selectedCountry: 'HN',
      countryData: COUNTRY_CODES,
      phoneLength: 8,
      isPassEdit: false,
      userBoton: true,
      companyBoton: false,
      showUser: true,
      userActive: true,
      usuarioEditing: true,
      usuarioAvancedEditing: true,
      isLoading: false,
      userForm: {
        nombreUsuario: '',
        telefono: '',
        direccion: '',
        contraseña: '',
        contraseña_nueva: '',
        contraseña_confirm: '',
      },
      userFormAdvanced: {
        nombre: '',
        apellido: '',
        correo: '',
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
        const token = localStorage.getItem('auth'); // Usa 'auth' para obtener el token

        const response = await axios.get('http://localhost:3000/api/usuarios', { // Cambia a '/usuarios'
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data);

        const userData = response.data;
        this.userForm.nombre_usuario = userData.nombre_usuario || '';
        this.userForm.telefono = userData.telefono || '';
        this.userForm.direccion = userData.direccion || '';
        this.userFormAdvanced.nombre = userData.nombre || '';
        this.userFormAdvanced.apellido = userData.apellido || '';
        this.userFormAdvanced.correo = userData.correo || '';
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        notis("error", 'No se pudo obtener la información del usuario.'); // Mensaje para el usuario
      } finally {
        this.isLoading = false;
      }
    },

    async updateUserData() {
      //--------------------------------------------------------------------------------------------------
      //*! Si se está cambiando la contraseña, verificar primero la contraseña actual 

      if (this.isPassEdit) {
        try {
          const token = localStorage.getItem('auth');
          // Ajustar la URL para que coincida con el endpoint correcto del backend
          const verifyResponse = await axios.post('http://localhost:3000/api/verificar-password',
            {
              contraseña: this.userForm.contraseña,
              // Posiblemente necesites enviar el ID del usuario u otros datos necesarios
              id_usuario: await solicitudes.solicitarUsuarioToken()
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!verifyResponse.data.isValid) {
            notis("error", "La contraseña actual es incorrecta");
            return;
          }
        } catch (error) {
          console.error('Error al verificar la contraseña:', error);
          notis("error", "Error al verificar la contraseña");
          return;
        }
      }

      // Continuar con las validaciones normales
      //--------------------------------------------------------------------------------------------------
      if (!this.usuarioEditing) {
        if (!validacionesConfigPage.validarCamposConfiguracion(this.userForm, this.isPassEdit, this.selectedCountry)) {
          return;
        }
      } else if (!this.usuarioAvancedEditing) {
        if (!validacionesConfigPage.validarCamposConfiguracionAvanzada(this.userFormAdvanced)) {
          return;
        }
      }

      // Si todo es válido, proceder con la actualización
      this.isLoading = true;
      try {
        const token = localStorage.getItem('auth');
        const updatedData = {
          nombre_usuario: this.userForm.nombre_usuario,
          telefono: this.userForm.telefono,
          direccion: this.userForm.direccion,
          contraseña: this.userForm.contraseña,
          contraseña_nueva: this.userForm.contraseña_nueva || undefined,
          contraseña_confirm: this.userForm.contraseña_confirm || undefined,
          nombre: this.userFormAdvanced.nombre,
          apellido: this.userFormAdvanced.apellido,
          correo: this.userFormAdvanced.correo,
        };

        const response = await axios.put('http://localhost:3000/api/configuser', updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          localStorage.setItem('showUpdateSuccess', 'true');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error al actualizar los datos del usuario:', error);
        notis("error", 'Hubo un problema al guardar los datos.');
      } finally {
        this.isLoading = false;
      }
    },

    togglePasswordEdit() {
      this.isPassEdit = !this.isPassEdit;
      // Limpiar todos los campos relacionados con contraseña
      this.userForm.contraseña = '';      // Limpiar contraseña actual
      this.userForm.contraseña_nueva = '';
      this.userForm.contraseña_confirm = '';
    },

    isEditing(orden) {
      // Maneja los estados de edición
      switch (orden) {
        case 1:
          this.usuarioEditing = false;
          this.usuarioAvancedEditing = true;
          break;
        case 2:
          this.usuarioEditing = true;
          this.usuarioAvancedEditing = false;
          break;
        default:
          notis("error", 'Ha ocurrido un error');
      }
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
    this.getUserData();
    document.title = "Configuración de Usuario";
    this.changeFavicon('/img/spiderman.ico');

    // Verificar si hay que mostrar la notificación
    if (localStorage.getItem('showUpdateSuccess')) {
      notis("success", 'Usuario actualizado exitosamente');
      localStorage.removeItem('showUpdateSuccess'); // Limpiar el flag
    }
  },
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');

* {
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
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

.contenedor-titulo {
  margin: 0;
  padding: 0;
  width: 100%;
  display: flex;
  justify-content: center;
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

/* Formularios */
form {
  border: 1px solid rgb(110, 109, 109);
  padding: 3% 0 2% 0;
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
.titulo-form {
  position: absolute;
  top: -11.5%;
  background-color: #f5f5f5;
  padding: 0 10px;
  color: #858585;
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

.botones-container .btn:disabled {
  background-color: #888787;
}

.guardar {
  background-color: #009b15;
  font-weight: bolder;
  color: rgb(255, 255, 255);
}

.editar {
  background-color: #5a5a5a;
  font-weight: bolder;
  color: rgb(255, 255, 255);
}

/* Botones de cambio */
.boton-switch {
  padding: 10px 18px;
  transition: all 0.3s ease;
}

.boton-switch.activo:hover {
  transition: all 0.3s ease;
}

.activo {
  background-color: rgb(62, 238, 62);
  color: white;
}

.inactivo {
  background-color: rgb(238, 62, 62);
  color: white;
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

.dark input:focus {
  border-color: #c09d62;
}

/* Campos deshabilitados */
.dark fieldset:disabled label,
.dark fieldset:disabled input {
  color: #666;
  background-color: #2d2d2d;
}

/* Botones */
.dark .guardar {
  background-color: #00b81a;
  color: #fff;
}

.dark .guardar:disabled {
  background-color: #666;
  color: #999;
}

.dark .editar {
  background-color: #5a5a5a;
  color: #fff;
}

.dark .editar:disabled {
  background-color: #666;
  color: #999;
}

.dark .SAR {
  background-color: #0031c7;
  color: #fff;
}

.dark .SAR:disabled {
  background-color: #666;
  color: #999;
}

/* Botones de cambio */
.dark .boton-switch.activo {
  background-color: #00b81a;
  color: #fff;
}

.dark .boton-switch.inactivo {
  background-color: #dc3545;
  color: #fff;
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

.btn-password {
  background-color: #009b15;
  color: white;
  width: 94%;
  margin-bottom: 15px;
}

.btn-password.disabled {
  background-color: #888787;
  cursor: not-allowed;
}

.dark .btn-password {
  background-color: #00b81a;
}

.dark .btn-password.disabled {
  background-color: #666;
}

/* Input autofill en modo oscuro */
.dark input:-webkit-autofill,
.dark input:-webkit-autofill:hover,
.dark input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff;
  -webkit-box-shadow: 0 0 0px 1000px #383838 inset;
  transition: background-color 5000s ease-in-out 0s;
}
</style>
