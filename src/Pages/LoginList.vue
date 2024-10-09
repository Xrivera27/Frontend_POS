<template>
  <div class="login-container">
    <LoadingSpinner :isLoading="isLoading" />
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

      <!-- Formulario de Recuperación de Contraseña -->
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
import LoadingSpinner from '@/components/LoadingSpinnerList.vue';

export default {
  components: {
    LoadingSpinner
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
  methods: {
    async login() {
      try {
        this.isLoading = true;

        const response = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: this.username, password: this.password })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('auth', data.token);
          localStorage.setItem('role', data.role); // Guarda el rol
          this.isLoading = false;
          this.$router.push('/home'); // Redirecciona al home
        } else {
          this.isLoading = false;
          alert(data.message); // Muestra el mensaje de error
        }
      } catch (error) {
        this.isLoading = false;
        console.error('Error:', error);
      }
    },

    async recoverPassword() {
      try {
        this.isLoading = true;

        const response = await fetch('http://localhost:3000/api/recuperar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.recoveryEmail })
        });

        const data = await response.json();

        if (response.ok) {
          alert(data.message); // Muestra el mensaje de éxito
          this.isRecoveringPassword = false; // Volver a la vista de login
        } else {
          alert(data.message); // Muestra el mensaje de error
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.isLoading = false;
      }
    },

    togglePasswordRecovery() {
      this.isRecoveringPassword = !this.isRecoveringPassword;
    },

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    }
  }

};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

/* Estilos Generales */
* {
  font-family: 'Montserrat', sans-serif;
}

/* Contenedor del Login */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url('@/../public/img/fondo-login.jpg');
  /* Ruta de la imagen */
  background-size: cover;
  background-position: center;
  position: relative;
  /* Para el pseudo-elemento */
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
  /* Oscurecimiento con opacidad */
  z-index: 1;
  /* Asegúrate de que esté por debajo del contenido */
}

/* Tarjeta de Login */
.login-card {
  background-color: rgba(255, 255, 255, 0.9);
  /* Fondo blanco con un poco de transparencia */
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
  position: relative;
  /* Para que esté por encima del pseudo-elemento */
  z-index: 2;
  /* Asegúrate de que esté por encima del oscurecimiento */
}

/* Títulos */
h2 {
  font-size: 24px;
  font-weight: 600;
  color: #39b378;
  margin-bottom: 20px;
}

/* Mensajes de bienvenida */
.welcome-message {
  font-size: 16px;
  margin-bottom: 10px;
  color: #888;
}

/* Texto de separación */
.or-text {
  margin-bottom: 20px;
  font-size: 16px;
  color: #333;
}

/* Grupos de formulario */
.form-group {
  margin-bottom: 1rem;
}

/* Estilos de Inputs */
input[type="text"],
input[type="password"],
input[type="email"],
input[type="tel"] {
  width: 95%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
}

/* Grupo de contraseña */
.password-group {
  position: relative;
}

/* Icono de visibilidad de contraseña */
.toggle-password {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
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
  /* Ajusta el tamaño del ícono aquí */
}

.submit-btn i {
  font-size: 2.5rem;
  /* Asegúrate de que el tamaño sea consistente */
}

/* Opciones de formulario */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #333;
}

.forgot-password {
  font-size: 12px;
  color: #39b378;
}

/* Centrar el botón de submit */
.button-container {
  display: flex;
  justify-content: center;
}
</style>
