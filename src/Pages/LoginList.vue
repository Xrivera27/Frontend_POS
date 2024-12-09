<template>
  <div class="login-container">
    <ModalLoading :isLoading="isLoading" />
    <div class="login-card">
      <h2 v-if="!isRecoveringPassword">Login</h2>
      <h2 v-else>Recuperar Contraseña</h2>

      <!-- Formulario de Login -->
      <form v-if="!isRecoveringPassword" @submit.prevent="login">
        <div class="form-group">
          <input type="text" v-model="username" placeholder="Usuario" required />
        </div>
        <div class="form-group password-group">
          <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Contraseña" required />
          <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'" class="toggle-password"
            @click="togglePasswordVisibility"></i>
        </div>
        <div class="form-options">
          <label class="checkbox-container">
            <input type="checkbox" v-model="rememberMe" />Recordar contraseña
          </label>
          <a href="#" class="forgot-password" @click.prevent="togglePasswordRecovery">¿Olvidaste la contraseña?</a>
        </div>
        <div class="form-group button-container">
          <button type="submit" class="submit-btn">
            <i id="btnLogin" class="bi bi-arrow-right-circle-fill"></i>
          </button>
        </div>
      </form>

      <form v-else @submit.prevent="recoverPassword">
        <div class="form-group">
          <input type="email" v-model="recoveryEmail" placeholder="Ingresa tu correo electrónico" required />
        </div>
        <div class="form-group button-container">
          <button type="submit" class="submit-btn">
            <i class="bi bi-envelope-fill"></i>
          </button>
        </div>
        <p><a href="#" @click.prevent="togglePasswordRecovery">Volver al login</a></p>
      </form>


    </div>
  </div>


</template>

<script>
import ModalLoading from '@/components/ModalLoading.vue';
import { useToast } from "vue-toastification"; // Importación para el popup
const { getApi } = require('../../config/getApiUrl.js');
import { setPageTitle } from '@/components/pageMetadata';

export default {
  components: {
    ModalLoading
  },
  data() {
    return {
      isLoading: false,
      username: '',
      password: '',
      rememberMe: false,
      showPassword: false, // Controla la visibilidad de la contraseña
      isRecoveringPassword: false, // Controla la vista de recuperación de contraseña
      recoveryEmail: '',
    };
  },
  computed: {
    role() {
      return localStorage.getItem('role'); // Define role como una propiedad computada
    }
  },
  mounted() {
    setPageTitle('Inicio de Sesión');
  },
  methods: {
    async login() {
      const toast = useToast();
      try {
        this.isLoading = true;

        const response = await fetch(`${getApi()}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: this.username, password: this.password })
        });

        const data = await response.json();

        if (response.ok) {
          // El código existente para el login exitoso se mantiene igual
          localStorage.clear();
          localStorage.setItem('auth', data.token);
          localStorage.setItem('role', data.role);
          window.dispatchEvent(new Event('roleChange'));

          this.$nextTick(() => {
            this.$emit('auth-change');
          });

          this.isLoading = false;

          if (data.role === '3') {
            await this.$router.push('/ventas');
          } else {
            await this.$router.push('/home');
          }
        } else {
          this.isLoading = false;
          // Aquí manejamos específicamente el caso de usuario inhabilitado
          if (response.status === 403) {
            toast.error('Usuario inhabilitado', {
              timeout: 5000
            });
          } else {
            toast.error(data.message, {
              timeout: 5000
            });
          }
        }
      } catch (error) {
        this.isLoading = false;
        console.error('Error:', error);
        toast.error('Error de red o servidor.', {
          timeout: 5000
        });
      }
    },
    async recoverPassword() {
      const toast = useToast();
      try {
        this.isLoading = true;

        const response = await fetch(`${getApi()}/recuperar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.recoveryEmail })
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('Correo enviado con la contraseña temporal.', {
            timeout: 5000
          });
          this.isRecoveringPassword = false; // Volver a la vista de login
          this.recoveryEmail = ''; // Limpiar el campo
        } else {
          if (response.status === 404) {
            toast.error('Usuario no encontrado', {
              timeout: 5000
            });
          } else {
            toast.error(data.message, {
              timeout: 5000
            });
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error de red o servidor.', {
          timeout: 5000
        });
      } finally {
        this.isLoading = false;
      }
    },

    togglePasswordRecovery() {
      this.isRecoveringPassword = !this.isRecoveringPassword;
    },

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },

    changeFavicon(iconPath) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }

};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

/* Estilos Generales */
* {
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

/* Contenedor del Login */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('../../src/assets/imgs/fondo-pixeles.jpg');
  background-size: cover;
  background-position: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 20px;
}

/* Capa de oscurecimiento */
.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

/* Tarjeta de Login */
.login-card {
  background-color: rgba(255, 255, 255, 0.7);
  padding: clamp(1.5rem, 4vw, 2rem);
  border-radius: 12px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.3);
  text-align: center;
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 2;
  backdrop-filter: blur(10px);
}

/* Títulos */
h2 {
  font-size: clamp(20px, 4vw, 24px);
  font-weight: 600;
  color: #39b378;
  margin-bottom: 20px;
}

/* Mensajes de bienvenida */
.welcome-message {
  font-size: clamp(14px, 3vw, 16px);
  margin-bottom: 10px;
  color: #888;
}

/* Texto de separación */
.or-text {
  margin-bottom: 20px;
  font-size: clamp(14px, 3vw, 16px);
  color: #333;
}

/* Grupos de formulario */
.form-group {
  margin-bottom: 1rem;
  width: 100%;
}

/* Estilos de Inputs */
input[type="text"],
input[type="password"],
input[type="email"],
input[type="tel"] {
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: clamp(14px, 3vw, 16px);
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #39b378;
  box-shadow: 0 0 0 2px rgba(57, 179, 120, 0.2);
}

/* Grupo de contraseña */
.password-group {
  position: relative;
  width: 100%;
}

/* Icono de visibilidad de contraseña */
.toggle-password {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
  padding: 5px;
}

/* Botón de envío */
.submit-btn {
  background-color: #39b378;
  border: none;
  border-radius: 50%;
  padding: 1rem;
  cursor: pointer;
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 2.5rem;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.submit-btn:hover {
  transform: scale(1.1);
  background-color: #2d8f5f;
}

.submit-btn i {
  font-size: 2.5rem;
}

/* Opciones de formulario */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 10px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  font-size: clamp(12px, 2.5vw, 14px);
  color: #333;
  gap: 5px;
}

.forgot-password {
  font-size: clamp(11px, 2.5vw, 12px);
  color: #39b378;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #2d8f5f;
}

/* Centrar el botón de submit */
.button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* Media Queries */
@media screen and (max-width: 768px) {
  .login-card {
    padding: 1.5rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media screen and (max-width: 480px) {
  .login-container {
    padding: 15px;
  }

  .login-card {
    padding: 1rem;
  }

  input[type="text"],
  input[type="password"],
  input[type="email"],
  input[type="tel"] {
    padding: 0.6rem;
  }

  .submit-btn {
    width: 40px;
    height: 40px;
  }

  .submit-btn i {
    font-size: 2rem;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card {
  animation: fadeIn 0.5s ease-out;
}


/* Contenedor principal */
.dark .login-container::before {
  background-color: rgba(0, 0, 0, 0.7);
}

/* Tarjeta de login */
.dark .login-card {
  background-color: rgba(19, 19, 19, 0.9);
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.5);
}

/* Títulos */
.dark h2 {
  color: #00ffcc;
}

/* Mensajes y textos */
.dark .welcome-message {
  color: #b0b0b0;
}

.dark .or-text {
  color: #fff;
}

/* Inputs */
.dark input[type="text"],
.dark input[type="password"],
.dark input[type="email"],
.dark input[type="tel"] {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

.dark input:focus {
  border-color: #00ffcc;
  box-shadow: 0 0 0 2px rgba(0, 255, 204, 0.2);
}

.dark input::placeholder {
  color: #888;
}

/* Icono de visibilidad de contraseña */
.dark .toggle-password {
  color: #b0b0b0;
}

/* Botón de envío */
.dark .submit-btn {
  background-color: #00ffcc;
  color: #1e1e1e;
}

.dark .submit-btn:hover {
  background-color: #00ccaa;
}

/* Opciones de formulario */
.dark .checkbox-container {
  color: #fff;
}

.dark .forgot-password {
  color: #00ffcc;
}

.dark .forgot-password:hover {
  color: #00ccaa;
}

/* Input autofill en modo oscuro */
.dark input:-webkit-autofill,
.dark input:-webkit-autofill:hover,
.dark input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff;
  -webkit-box-shadow: 0 0 0px 1000px #383838 inset;
  transition: background-color 5000s ease-in-out 0s;
  caret-color: #fff;
}
</style>