<template>
  <div class="configuracion-usuario">
    <div class="encabezado">
      <h1>Configuración</h1>
      <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
    </div>
    <hr />

    <div class="config-wrapper">
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
                <input v-model="configuracionSAR.rango_inicial" type="number" id="rango_inicial" required />

                <label for="rango_final">Rango Final:</label>
                <input v-model="configuracionSAR.rango_final" type="number" id="rango_final" required />
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

            <router-link to="/config-company">
              <button type="button" class="btn company">Config Empresa</button>
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>


<script>
import ProfileButton from '../components/ProfileButton.vue';
import axios from 'axios';


export default {
  components: {
    ProfileButton,

  },
  data() {
    return {
      busisnessSarEditing: true,
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

    async getConfiguracionSAR() {
      try {
        const token = localStorage.getItem('auth');
        const response = await axios.get('http://localhost:3000/api/sar', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const sarData = response.data.datosSAR; // Asegúrate de que este es el nombre correcto de la respuesta

        // Asigna los datos a configuracionSAR
        this.configuracionSAR.numero_CAI = sarData.numero_CAI || '';
        this.configuracionSAR.rango_inicial = sarData.rango_inicial || '';
        this.configuracionSAR.rango_final = sarData.rango_final || '';
        this.configuracionSAR.fecha_autorizacion = sarData.fecha_autorizacion || '';
        this.configuracionSAR.fecha_vencimiento = sarData.fecha_vencimiento || '';
      } catch (error) {
        console.error('Error al obtener la configuración SAR:', error);
        alert('No se pudo obtener la configuración SAR.');
      }
    },

    async updatesar() {
      try {
        const token = localStorage.getItem('auth');

        const updatedData = {
          numero_CAI: this.configuracionSAR.numero_CAI,
          rango_inicial: this.configuracionSAR.rango_inicial,
          rango_final: this.configuracionSAR.rango_final,
          fecha_autorizacion: this.configuracionSAR.fecha_autorizacion,
          fecha_vencimiento: this.configuracionSAR.fecha_vencimiento
        };

        const response = await axios.put('http://localhost:3000/api/updsar', updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          alert('Datos Sar actualizada exitosamente');
          window.location.reload(); // Recargar la página después de guardar
        }
      } catch (error) {
        console.error('Error al actualizar los datos de la empresa:', error);
        alert('Hubo un problema al guardar los datos.');
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

    switchBools() {
      this.userBoton = !this.userBoton;
      this.companyBoton = !this.companyBoton;
      this.showUser = !this.showUser;
      this.showCompany = !this.showCompany;
      this.userActive = !this.userActive;
    },

    isEditing(orden) {
      switch (orden) {
        case 1: this.usuarioEditing = false;
          this.busisnessSarEditing = true;
          this.businessEditing = true;
          this.usuarioAvancedEditing = true;
          break;

        case 2: this.usuarioEditing = true;
          this.busisnessSarEditing = true;
          this.businessEditing = true;
          this.usuarioAvancedEditing = false;
          break;

        case 3: this.usuarioEditing = true;
          this.busisnessSarEditing = true;
          this.businessEditing = false;
          this.usuarioAvancedEditing = true;
          break;

        case 4: this.usuarioEditing = true;
          this.busisnessSarEditing = false;
          this.businessEditing = true;
          this.usuarioAvancedEditing = true;
          break;

        default:
          alert("Ha ocurrido un error");
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
    // Añade el manejador de eventos cuando el componente se monta
    window.addEventListener("keydown", this.pushEsc);
    document.title = "Configuración";
    this.changeFavicon('/img/spiderman.ico'); // Usar la ruta correcta
  },
  beforeUnmount() {
    // Elimina el manejador de eventos cuando el componente se destruye
    window.removeEventListener("keydown", this.pushEsc);
  },

};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');

/* Encabezado */
.encabezado {
  display: flex;
  justify-content: space-between;
}

/* Configuración del usuario */
.configuracion-usuario {
  padding: 16px;
}

/* Contenedores principales */
.config-wrapper {
  padding: 16px;
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
  min-width: 800px;
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
</style>