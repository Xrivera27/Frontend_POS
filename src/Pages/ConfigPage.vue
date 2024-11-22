<template>
  <div class="configuracion-usuario">
    <div class="config-wrapper">

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
                <input v-model="userForm.nombre_usuario" type="text" id="nombre_usuario" name="nombre_usuario"
                  required />

                <label for="telefono">Teléfono:</label>
                <input v-model="userForm.telefono" type="text" id="telefono" name="telefono" required />

                <label for="direccion">Dirección:</label>
                <input v-model="userForm.direccion" type="text" id="direccion" name="direccion" required />
              </div>
              <div class="contenedor-interno contenedor-derecho">
                <label for="contrasena">Contraseña actual:</label>
                <input v-model="userForm.contraseña" type="password" id="contraseña" name="contraseña" required />
                <label for="contrasena-nueva">Contraseña nueva:</label>
                <input v-model="userForm.contraseña_nueva" type="password" id="contraseña_nueva"
                  name="contraseña_nueva" />

                <label for="contrasena-confirmar">Confirmar contraseña:</label>
                <input v-model="userForm.contraseña_confirm" type="password" id="contraseña_confirm"
                  name="contraseña_confirm" />


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
                <input v-model="userFormAdvanced.nombre" type="text" id="nombre" name="nombre" required />

                <label for="apellido">Apellido:</label>
                <input v-model="userFormAdvanced.apellido" type="text" id="apellido" name="apellido" required />

                <label for="correo">Correo:</label>
                <input v-model="userFormAdvanced.correo" type="email" id="correo" name="correo" required />
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

export default {
  components: {
    PageHeader
  },
  data() {
    return {
      titulo: 'Configuración',
      userBoton: true,
      companyBoton: false,
      showUser: true,
      userActive: true,
      usuarioEditing: true,
      usuarioAvancedEditing: true,
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
    async getUserData() {
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
        this.userForm.contraseña = userData.contraseña || '';
        this.userFormAdvanced.nombre = userData.nombre || '';
        this.userFormAdvanced.apellido = userData.apellido || '';
        this.userFormAdvanced.correo = userData.correo || '';
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        alert('No se pudo obtener la información del usuario.'); // Mensaje para el usuario
      }
    },

    async updateUserData() {
      try {
        const token = localStorage.getItem('auth');

        // Verificar si se están intentando cambiar las contraseñas
        if (this.userForm.contraseña_nueva || this.userForm.contraseña_confirm) {
          // Si una de las contraseñas nuevas está presente, ambas deben coincidir
          if (this.userForm.contraseña_nueva !== this.userForm.contraseña_confirm) {
            alert('Las contraseñas no coinciden.');
            return;
          }
        }

        const updatedData = {
          nombre_usuario: this.userForm.nombre_usuario,
          telefono: this.userForm.telefono,
          direccion: this.userForm.direccion,
          // Asegúrate de enviar la contraseña actual y las nuevas
          contraseña: this.userForm.contraseña, // Contraseña actual
          contraseña_nueva: this.userForm.contraseña_nueva || undefined,
          contraseña_confirm: this.userForm.contraseña_confirm || undefined, // Asegúrate de que este campo esté presente
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

        console.log('Respuesta del servidor:', response);

        if (response.status === 200) {
          alert('Usuario actualizado exitosamente');
          window.location.reload(); // Recargar la página después de guardar
        }
      } catch (error) {
        console.error('Error al actualizar los datos del usuario:', error);
        alert('Hubo un problema al guardar los datos.');
      }
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
          alert('Ha ocurrido un error');
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
    // Obtén los datos del usuario cuando el componente esté montado (ej. usuario con ID 1)
    this.getUserData(1);

    document.title = "Configuración de Usuario";
    this.changeFavicon('/img/spiderman.ico'); // Usar la ruta correcta
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
</style>
