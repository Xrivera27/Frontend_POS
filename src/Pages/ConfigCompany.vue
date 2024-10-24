<template>
  <div class="configuracion-usuario">
    <div class="encabezado">
      <h1>Configuración</h1>
      <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
    </div>
    <hr />

    <div class="config-wrapper">
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

                <label for="telefono-empresa">Teléfono principal:</label>
                <input v-model="companyForm.telefono_principal" type="text" id="telefono_principal" name="telefono_empresa" />

                <label for="correo-principal">Correo principal:</label>
                <input v-model="companyForm.correo_principal" type="email" id="correo_principal" name="correo_principal" />
              </div>
            </div>
          </fieldset>
          <div class="botones-container">
            <button class="btn editar" @click="isEditing(3)" :disabled="!businessEditing">Editar</button>
            <button class="btn guardar" :disabled="businessEditing">Guardar</button>

            <router-link to="/config-sar">
              <button type="button" class="btn SAR" :disabled="businessEditing">Config SAR</button>
            </router-link>
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
import ProfileButton from '../components/ProfileButton.vue';

export default {
  components: {
    ProfileButton,
  },
  data() {
    return {
      switchForm: 'user',
      userBoton: true,
      companyBoton: false,
      showUser: true,
      showCompany: false,
      userActive: true,
      usuarioEditing: true,
      usuarioAvancedEditing: true,
      businessEditing: true,
      busisnessSarEditing: true,
    
      companyForm: {
        nombre: '',
        telefono_principal: '',
        correo_principal: ''
      },
    };
  },
  methods: {
    async getCompanyData() {
      try {
        const token = localStorage.getItem('auth'); // Obtener el token de localStorage

        const response = await axios.get('http://localhost:3000/api/configempresa', {
          headers: {
            Authorization: `Bearer ${token}`, // Incluir el token en las cabeceras
          },
        });

        const companyData = response.data.empresa; // Acceder a 'empresa'

        // Actualiza los datos del formulario de la empresa
        this.companyForm.nombre = companyData.nombre || '';
        this.companyForm.telefono_principal = companyData.telefono_principal || '';
        this.companyForm.correo_principal = companyData.correo_principal || '';

      } catch (error) {
        console.error('Error al obtener los datos de la empresa:', error);
        alert('No se pudo obtener la información de la empresa.');
      }
    },

    changeFavicon(iconPath) {
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.href = iconPath; // Cambia el favicon a la ruta proporcionada
      }
    },

    isEditing(orden) {
      this.businessEditing = orden === 3 ? false : true;
    },
    
    pushEsc(event) {
      // Aquí va tu lógica para el evento de tecla ESC
      if (event.key === 'Escape') {
        // Lógica para manejar el ESC
      }
    }
  },

  mounted() {
    // Añade el manejador de eventos cuando el componente se monta
    this.getCompanyData(); 
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
