<template>
  <div class="configuracion-usuario">
    <div class="config-wrapper">
      <PageHeader :titulo="titulo" />
      
      <div class="company-config">
        <form @submit.prevent="guardarConfiguracionSAR" autocomplete="off" class="formulario form-company-SAR">
          <fieldset :disabled="busisnessSarEditing">
            <div class="contenedor-titulo">
              <h2 class="titulo-form">Configuración SAR</h2>
            </div>

            <div class="contenedor-principal">
              <div class="contenedor-interno contenedor-izquierdo">
                <label for="numero_CAI">Numero CAI:</label>
                <input v-model="configuracionSAR.numero_CAI" type="text" id="numero_CAI" required />

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
                <input v-model="configuracionSAR.fecha_autorizacion" type="date" id="fecha_autorizacion" required />

                <label for="fecha_vencimiento">Fecha de vencimiento:</label>
                <input v-model="configuracionSAR.fecha_vencimiento" type="date" id="fecha_vencimiento" required />
              </div>
            </div>
          </fieldset>

          <div class="botones-container">
            <button class="btn editar" @click="isEditing(4)" :disabled="!busisnessSarEditing">Editar</button>
            <button class="btn guardar" type="submit" :disabled="busisnessSarEditing"
              @click.prevent="updatesar">Guardar</button>
          </div>
        </form>
      </div>
    </div>
    <router-link to="/config-page">
      <button type="button" class="btn company">Config Usuario</button>
    </router-link>
  </div>
</template>

<script>
import PageHeader from "@/components/PageHeader.vue";
import axios from 'axios';
import { useToast } from "vue-toastification";

export default {
  components: {
    PageHeader
  },
  data() {
    return {
      titulo: 'Configuración SAR',
      busisnessSarEditing: true,
      esCeo: false,
      configuracionSAR: {
        numero_CAI: '',
        rango_inicial: '',
        rango_final: '',
        fecha_autorizacion: '',
        fecha_vencimiento: '',
      },
    };
  },

  methods: {
    validateSARNumber(number) {
      return /^\d{16}$/.test(number);
    },

    async getConfiguracionSAR() {
      const toast = useToast();
      try {
        const token = localStorage.getItem('auth');
        const response = await axios.get('http://uc0skkosgswkwkgosowwoocs.34.16.113.40.sslip.io/api/sar', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const sarData = response.data.datosSAR;
        
        this.configuracionSAR.numero_CAI = sarData.numero_CAI || '';
        this.configuracionSAR.rango_inicial = sarData.rango_inicial || '';
        this.configuracionSAR.rango_final = sarData.rango_final || '';
        this.configuracionSAR.fecha_autorizacion = sarData.fecha_autorizacion || '';
        this.configuracionSAR.fecha_vencimiento = sarData.fecha_vencimiento || '';
      } catch (error) {
        console.error('Error al obtener la configuración SAR:', error);
        toast.error('No se pudo obtener la configuración SAR.', {
          timeout: 5000
        });
      }
    },

    async updatesar() {
      const toast = useToast();
      try {
        // Validar el rango inicial
        if (!this.validateSARNumber(this.configuracionSAR.rango_inicial)) {
          toast.error('El Rango Inicial debe tener exactamente 16 dígitos numéricos', {
            timeout: 5000
          });
          return;
        }

        // Validar el rango final
        if (!this.validateSARNumber(this.configuracionSAR.rango_final)) {
          toast.error('El Rango Final debe tener exactamente 16 dígitos numéricos', {
            timeout: 5000
          });
          return;
        }

        // Validar que el rango final sea mayor que el inicial
        if (parseInt(this.configuracionSAR.rango_final) <= parseInt(this.configuracionSAR.rango_inicial)) {
          toast.error('El Rango Final debe ser mayor que el Rango Inicial', {
            timeout: 5000
          });
          return;
        }

        const token = localStorage.getItem('auth');
        const updatedData = {
          numero_CAI: this.configuracionSAR.numero_CAI,
          rango_inicial: this.configuracionSAR.rango_inicial,
          rango_final: this.configuracionSAR.rango_final,
          fecha_autorizacion: this.configuracionSAR.fecha_autorizacion,
          fecha_vencimiento: this.configuracionSAR.fecha_vencimiento,
          numero_actual_SAR: this.configuracionSAR.rango_inicial
        };

        const response = await axios.post('http://uc0skkosgswkwkgosowwoocs.34.16.113.40.sslip.io/api/sar/create', updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          toast.success('Datos SAR actualizados exitosamente', {
            timeout: 5000
          });
          window.location.reload();
        }
      } catch (error) {
        console.error('Error al actualizar los datos SAR:', error);
        if (error.response) {
          toast.error(error.response.data.message || 'Hubo un problema al guardar los datos.', {
            timeout: 5000
          });
        } else if (error.request) {
          toast.error('Error de conexión con el servidor.', {
            timeout: 5000
          });
        } else {
          toast.error('Hubo un problema al guardar los datos.', {
            timeout: 5000
          });
        }
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
      const toast = useToast();
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
          toast.error("Ha ocurrido un error", {
            timeout: 5000
          });
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
    this.getConfiguracionSAR();
    window.addEventListener("keydown", this.pushEsc);
    document.title = "Configuración";
    this.changeFavicon('/img/spiderman.ico');
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.pushEsc);
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
  height: 25%;
  justify-content: center;
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

.company {
  background-color: #00249b;
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

/* Input autofill en modo oscuro */
.dark input:-webkit-autofill,
.dark input:-webkit-autofill:hover,
.dark input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff;
  -webkit-box-shadow: 0 0 0px 1000px #383838 inset;
  transition: background-color 5000s ease-in-out 0s;
}
</style>