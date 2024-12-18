<template>
  <div class="configuracion-usuario">
    <div class="config-wrapper">
      <PageHeader :titulo="titulo" />

      <div class="company-config">
        <form autocomplete="off" class="formulario form-company">
          <fieldset :disabled="businessEditing">
            <div class="contenedor-titulo">
              <h2 class="titulo-form">Configuración Empresa</h2>
            </div>

            <div class="contenedor-principal">
              <div class="contenedor-interno contenedor-izquierdo">
                <label for="nombre-company">Nombre de la empresa:</label>
                <input
                  ref="nombreInput"
                  v-model="companyForm.nombre"
                  type="text"
                  id="nombre-company"
                  name="nombre-company"
                />

                <label for="rtn-empresa">RTN:</label>
                <input
                  v-model="companyForm.rtn"
                  type="text"
                  id="rtn"
                  name="rtn-empresa"
                  pattern="[0-9]{14}"
                  maxlength="14"
                  placeholder="Ingrese los 14 dígitos"
                />

                <label for="direccion">Dirección:</label>
                <input
                  v-model="companyForm.direccion"
                  type="text"
                  id="direccion"
                  name="direccion"
                  placeholder="Ingrese la dirección completa"
                />

                <label for="telefono-empresa">Teléfono principal:</label>
                <input
                  v-model="companyForm.telefono_principal"
                  type="text"
                  id="telefono_principal"
                  name="telefono_empresa"
                />

                <label for="correo-principal">Correo principal:</label>
                <input
                  v-model="companyForm.correo_principal"
                  type="email"
                  id="correo_principal"
                  name="correo_principal"
                />
              </div>
            </div>
          </fieldset>
          <div class="botones-container">
            <button
              class="btn editar"
              @click.prevent="isEditing(3)"
              :disabled="!businessEditing"
            >
              Editar
            </button>
            <button
              class="btn guardar"
              @click.prevent="updateempresa"
              :disabled="businessEditing"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>

      <router-link to="/config-page">
        <button class="btn boton-switch inactivo">Config. Usuario</button>
      </router-link>

      <button class="btn boton-switch activo">Config. Empresa</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import PageHeader from "@/components/PageHeader.vue";
import { useToast } from "vue-toastification";
const { getApi } = require("../../config/getApiUrl.js");
import { setPageTitle } from "@/components/pageMetadata";

export default {
  components: {
    PageHeader,
  },
  data() {
    return {
      titulo: "Configuración de Empresa",
      businessEditing: true,
      isLoading: false,
      errorMessage: "",

      companyForm: {
        nombre: "",
        rtn: "",
        telefono_principal: "",
        correo_principal: "",
        direccion: "",
      },
    };
  },
  methods: {
    async getCompanyData() {
      const toast = useToast();
      try {
        const token = localStorage.getItem("auth");

        const response = await axios.get(`${getApi()}/configempresa`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const companyData = response.data.empresa;

        this.companyForm.nombre = companyData.nombre || "";
        this.companyForm.rtn = companyData.rtn || "";
        this.companyForm.telefono_principal =
          companyData.telefono_principal || "";
        this.companyForm.correo_principal = companyData.correo_principal || "";
        this.companyForm.direccion = companyData.direccion || "";
      } catch (error) {
        console.error("Error al obtener los datos de la empresa:", error);
        toast.error("No se pudo obtener la información de la empresa", {
          timeout: 5000,
        });
      }
    },

    validateForm() {
      const toast = useToast();
      if (!this.companyForm.nombre.trim()) {
        toast.error("El nombre de la empresa es requerido", {
          timeout: 5000,
        });
        return false;
      }
      if (!this.companyForm.rtn.trim()) {
        toast.error("El RTN de la empresa es requerido", {
          timeout: 5000,
        });
        return false;
      }
      if (!/^\d{14}$/.test(this.companyForm.rtn)) {
        toast.error("El RTN debe contener exactamente 14 dígitos numéricos", {
          timeout: 5000,
        });
        return false;
      }
      if (!this.companyForm.direccion.trim()) {
        toast.error("La dirección de la empresa es requerida", {
          timeout: 5000,
        });
        return false;
      }
      if (
        !this.companyForm.correo_principal.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      ) {
        toast.error("Por favor ingrese un correo válido", {
          timeout: 5000,
        });
        return false;
      }
      return true;
    },

    isEditing(orden) {
      this.businessEditing = orden !== 3;
      this.$nextTick(() => {
        this.$refs.nombreInput?.focus();
      });
    },

    async updateempresa() {
      const toast = useToast();
      if (!this.validateForm()) return;

      this.isLoading = true;
      this.errorMessage = "";

      try {
        const token = localStorage.getItem("auth");

        const updatedData = {
          nombre: this.companyForm.nombre,
          rtn: this.companyForm.rtn,
          telefono_principal: this.companyForm.telefono_principal,
          correo_principal: this.companyForm.correo_principal,
          direccion: this.companyForm.direccion,
        };

        const response = await axios.put(
          `${getApi()}/updateempresa`,
          updatedData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          toast.success("Empresa actualizada exitosamente", {
            timeout: 5000,
          });
          window.location.reload();
        }
      } catch (error) {
        console.error("Error al actualizar los datos de la empresa:", error);
        toast.error("Hubo un problema al guardar los datos", {
          timeout: 5000,
        });
      } finally {
        this.isLoading = false;
      }
    },
  },

  mounted() {
    setPageTitle("Configuración de Empresa");
    this.getCompanyData();
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap");

* {
  box-sizing: border-box;
  font-family: "Montserrat", sans-serif;
}

.configuracion-usuario {
  padding: 16px;
}

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
  justify-content: center; /* Cambiado de center a flex-start */
  padding: 0 24px; /* Añadir padding horizontal */
  margin-bottom: 45px; /* Espacio después del título */
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
  padding: 0 24px;
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

input {
  padding: 10px 12px;
  height: 35px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 95%;
  background-color: #f8f9fa; /* Este es el color que falta */
  transition: all 0.3s ease;
}

label {
  margin-bottom: 8px; /* Espacio entre label e input */
  font-weight: 500; /* Peso de fuente para mejor legibilidad */
}

.contenedor-principal input {
  margin-bottom: 4%;
}

.company-config {
  max-width: 1000px; /* Ancho máximo */
  width: 90%; /* Ancho responsivo */
  margin: 0 auto; /* Centrar el contenedor */
  padding: 20px;
}

.titulo-form {
  position: relative; /* Cambiado de absolute a relative */
  color: #333333;
  font-weight: 600;
  font-size: 1.5rem;
  margin: 0;
  padding: 0;
  border-bottom: 2px solid #c09d62; /* Línea decorativa debajo del título */
}

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

.boton-switch {
  padding: 10px 18px;
  transition: all 0.3s ease;
}

/* Dark mode para el botón editar */
.dark .editar {
  background-color: #c09d62;
  color: white;
}

.dark .editar:hover {
  background-color: #a38655;
}

.dark .editar:disabled {
  background-color: #c09d62;
  opacity: 0.7;
}

/* Dark mode para el botón guardar */
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
  cursor: not-allowed;
}

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

/* Para modo oscuro */
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

/* Dark Mode Styles */
.dark .configuracion-usuario {
  background-color: #1e1e1e;
  color: #fff;
}

.dark .config-wrapper {
  background-color: #1e1e1e;
  color: #fff;
}

.dark form {
  border-color: #404040;
  background-color: #2d2d2d;
}

.dark .titulo-form {
  background-color: #1e1e1e;
  color: #fff;
}

.dark input {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

.dark input:focus {
  border-color: #c09d62;
}

.dark fieldset:disabled label,
.dark fieldset:disabled input {
  color: #666;
  background-color: #2d2d2d;
}

.dark .SAR {
  background-color: #0031c7;
  color: #fff;
}

.dark .SAR:disabled {
  background-color: #666;
  color: #999;
}

.dark .config-wrapper::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.dark .config-wrapper::-webkit-scrollbar-thumb {
  background: #c09d62;
}

.dark .config-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}

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

.dark input:-webkit-autofill,
.dark input:-webkit-autofill:hover,
.dark input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff;
  -webkit-box-shadow: 0 0 0px 1000px #383838 inset;
  transition: background-color 5000s ease-in-out 0s;
}
</style>
