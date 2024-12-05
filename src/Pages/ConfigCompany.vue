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
                <input v-model="companyForm.nombre" type="text" id="nombre-company" name="nombre-company" />

                <label for="rtn-empresa">RTN:</label>
                <input v-model="companyForm.rtn" type="text" id="rtn" name="rtn-empresa" 
                       pattern="[0-9]{14}" maxlength="14" placeholder="Ingrese los 14 dígitos"/>

                <label for="direccion">Dirección:</label>
                <input v-model="companyForm.direccion" type="text" id="direccion" 
                       name="direccion" placeholder="Ingrese la dirección completa"/>

                <label for="telefono-empresa">Teléfono principal:</label>
                <input v-model="companyForm.telefono_principal" type="text" id="telefono_principal"
                  name="telefono_empresa" />

                <label for="correo-principal">Correo principal:</label>
                <input v-model="companyForm.correo_principal" type="email" id="correo_principal"
                  name="correo_principal" />
              </div>
            </div>
          </fieldset>
          <div class="botones-container">
            <button class="btn editar" @click.prevent="isEditing(3)" :disabled="!businessEditing">Editar</button>
            <button class="btn guardar" @click.prevent="updateempresa" :disabled="businessEditing">Guardar</button>
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
import axios from 'axios';
import PageHeader from "@/components/PageHeader.vue";
import { useToast } from "vue-toastification";

export default {
  components: {
    PageHeader
  },
  data() {
    return {
      titulo: 'Configuración',
      businessEditing: true,
      isLoading: false,
      errorMessage: '',

      companyForm: {
        nombre: '',
        rtn: '',
        telefono_principal: '',
        correo_principal: '',
        direccion: ''
      },
    };
  },
  methods: {
    async getCompanyData() {
      const toast = useToast();
      try {
        const token = localStorage.getItem('auth');

        const response = await axios.get('http://uc0skkosgswkwkgosowwoocs.34.16.113.40.sslip.io/api/configempresa', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const companyData = response.data.empresa;

        this.companyForm.nombre = companyData.nombre || '';
        this.companyForm.rtn = companyData.rtn || '';
        this.companyForm.telefono_principal = companyData.telefono_principal || '';
        this.companyForm.correo_principal = companyData.correo_principal || '';
        this.companyForm.direccion = companyData.direccion || '';
      } catch (error) {
        console.error('Error al obtener los datos de la empresa:', error);
        toast.error('No se pudo obtener la información de la empresa', {
          timeout: 5000
        });
      }
    },

    validateForm() {
      const toast = useToast();
      if (!this.companyForm.nombre.trim()) {
        toast.error('El nombre de la empresa es requerido', {
          timeout: 5000
        });
        return false;
      }
      if (!this.companyForm.rtn.trim()) {
        toast.error('El RTN de la empresa es requerido', {
          timeout: 5000
        });
        return false;
      }
      if (!/^\d{14}$/.test(this.companyForm.rtn)) {
        toast.error('El RTN debe contener exactamente 14 dígitos numéricos', {
          timeout: 5000
        });
        return false;
      }
      if (!this.companyForm.direccion.trim()) {
        toast.error('La dirección de la empresa es requerida', {
          timeout: 5000
        });
        return false;
      }
      if (!this.companyForm.correo_principal.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        toast.error('Por favor ingrese un correo válido', {
          timeout: 5000
        });
        return false;
      }
      return true;
    },

    isEditing(orden) {
      this.businessEditing = orden !== 3;
    },

    async updateempresa() {
      const toast = useToast();
      if (!this.validateForm()) return;
      
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const token = localStorage.getItem('auth');

        const updatedData = {
          nombre: this.companyForm.nombre,
          rtn: this.companyForm.rtn,
          telefono_principal: this.companyForm.telefono_principal,
          correo_principal: this.companyForm.correo_principal,
          direccion: this.companyForm.direccion
        };

        const response = await axios.put('http://uc0skkosgswkwkgosowwoocs.34.16.113.40.sslip.io/api/updateempresa', updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          toast.success('Empresa actualizada exitosamente', {
            timeout: 5000
          });
          window.location.reload();
        }
      } catch (error) {
        console.error('Error al actualizar los datos de la empresa:', error);
        toast.error('Hubo un problema al guardar los datos', {
          timeout: 5000
        });
      } finally {
        this.isLoading = false;
      }
    },
  },

  mounted() {
    this.getCompanyData();
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');

* {
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
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

input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 95%;
  height: 25%;
  justify-content: center;
}

.contenedor-principal input {
  margin-bottom: 4%;
}

.titulo-form {
  position: absolute;
  top: -11.5%;
  background-color: #f5f5f5;
  padding: 0 10px;
  color: #858585;
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

.SAR {
  background-color: #00249b;
  font-weight: bolder;
  color: rgb(255, 255, 255);
}

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

.dark .boton-switch.activo {
  background-color: #00b81a;
  color: #fff;
}

.dark .boton-switch.inactivo {
  background-color: #dc3545;
  color: #fff;
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