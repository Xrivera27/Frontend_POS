<template>
  <div class="configuracion-usuario">
    <div class="encabezado">
      <h1>Configuración de Usuario</h1>
      <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
    </div>
    <hr />

    <div class="config-wrapper">
      <div class="usuario-config" v-if="showUser">
        <form autocomplete="off" class="formulario form-basic-user">
          <fieldset :disabled="usuarioEditing">
            <div class="contenedor-titulo">
              <h2 class="titulo-form">Configuración</h2>
            </div>

            <div class="contenedor-principal">
              <div class="contenedor-interno contenedor-izquierdo">
                <label for="nombre-usuario">Nombre de usuario:</label>
                <input type="text" id="nombre-usuario" name="nombre-usuario" required />


                <label for="telefono">Teléfono:</label>
                <input type="text" id="telefono" name="telefono" required />


                <label for="direccion">Dirección:</label>
                <input type="text" id="direccion" name="direccion" required />
              </div>


              <div class="contenedor-interno contenedor-derecho">
                <label for="contrasena">Contraseña actual:</label>
                <input type="password" id="input-codigo-contrasena" name="contrasena" required />


                <label for="contrasena-nueva">Contraseña nueva:</label>
                <input type="password" id="contrasena-nueva" name="contrasena-nueva" required />


                <label for="contrasena-confirmar">Confirmar contraseña:</label>
                <input type="password" id="contrasena-confirmar" name="contrasena-confirmar" required />
              </div>

            </div>
          </fieldset>


          <div class="botones-container">
            <button class="btn editar" @click="isEditing(1)" :disabled="!usuarioEditing">Editar</button>
            <button class="btn guardar" :disabled="usuarioEditing">Guardar</button>
          </div>
        </form>

        <form autocomplete="off" class="formulario form-avanced-user">
          <fieldset :disabled="usuarioAvancedEditing">
            <div class="contenedor-titulo">
              <h2 class="titulo-form">Configuración avanzada</h2>
            </div>

            <div class="contenedor-principal">
              <div class="contenedor-interno contenedor-izquierdo">
                <label for="Nombre">Nombre:</label>
                <input type="text" id="Nombre" name="Nombre" required />


                <label for="apellido">Apellido:</label>
                <input type="text" id="apellido" name="apellido" required />


                <label for="correo">Correo:</label>
                <input type="email" id="correo" name="correo" required />
              </div>
            </div>

          </fieldset>

          <div class="botones-container">
            <button class="btn editar" @click="isEditing(2)" :disabled="!usuarioAvancedEditing">Editar</button>
            <button class="btn guardar" :disabled="usuarioAvancedEditing">Guardar</button>
          </div>

          <!-- Fecha de inicio -->
        </form>
      </div>

      <div class="company-config" v-if="showCompany">
        <form autocomplete="off" class="formulario form-company">
          <fieldset :disabled="businessEditing">
            <div class="contenedor-titulo">
              <h2 class="titulo-form">Configuración Empresa</h2>
            </div>

            <div class="contenedor-principal">
              <div class="contenedor-interno contenedor-izquierdo">
                <label for="nombre-company">Nombre de la empresa:</label>
                <input type="text" id="nombre-company" name="nombre-company" required />


                <label for="telefono-empresa">Telefono principal:</label>
                <input type="text" id="telefono-empresa" name="telefono-empresa" required />


                <label for="correo-principal">Correo principal:</label>
                <input type="email" id="correo-principal" principal de la empresa name="correo" required />
              </div>
            </div>
          </fieldset>
          <div class="botones-container">
            <button class="btn editar" @click="isEditing(3)" :disabled="!businessEditing">Editar</button>
            <button class="btn guardar" :disabled="businessEditing">Guardar</button>
          </div>


          <!-- Fecha de inicio -->
        </form>

        <form autocomplete="off" class="formulario form-company-SAR">
          <fieldset :disabled="busisnessSarEditing">
            <div class="contenedor-titulo">
              <h2 class="titulo-form">Configuración SAR</h2>
            </div>

            <div class="contenedor-principal">
              <div class="contenedor-interno contenedor-izquierdo">
                <label for="categoria">Numero CAI:</label>
                <input type="text" id="numero_cai" name="numero_cai" required />

                <!-- Porcentaje de descuento -->
                <label for="rango_inical">Rango Inicial:</label>
                <input type="number" id="rango_inical" name="rango_inical" required />

                <label for="rango_inical">Rango Final:</label>
                <input type="number" id="rango_final" name="rango_final" required />
              </div>
              <!-- Categoria ID -->
              <div class="contenedor-interno contenedor-derecho">
                <label for="fecha_autorizacion">Fecha de autorización:</label>
                <input type="date" id="fecha_autorizacion" name="fecha_autorizacion" required />

                <!-- Fecha final -->
                <label for="fecha_vencimiento">Fecha de vencimiento:</label>
                <input type="date" id="fecha_vencimiento" name="fecha_vencimiento" required />

                <!-- Enviar el formulario -->
              </div>
            </div>
          </fieldset>

          <div class="botones-container">
            <button class="btn editar" @click="isEditing(4)" :disabled="!busisnessSarEditing">Editar</button>
            <button class="btn guardar" :disabled="busisnessSarEditing">Guardar</button>
          </div>


          <!-- Fecha de inicio -->
        </form>
      </div>


      <button @click="switchBools" :class="{ 'activo': userActive, 'inactivo': !userActive }" :disabled="userBoton"
        class="btn boton-switch">Config. Usuario</button>
      <button @click="switchBools" :class="{ 'inactivo': userActive, 'activo': !userActive }" :disabled="companyBoton"
        class="btn boton-switch">Config. Empresa</button>

    </div>
  </div>
</template>

<script>
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
      userForm: [
        {
          nombreUsuario: '',
          telefono: '',
          direccion: '',
          contrasena_actual: '',
          contrasena_nueva: '',
          contrasena_confirm: '',
        }
      ],
      userFormAdvanced: [
        {
          nombre: '',
          apellido: '',
          correo: '',
        }
      ],
      companyForm: [
        {
          nombre: '',
          apellido: '',
          correo: '',
        }
      ],
    };
  },
  methods: {

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
