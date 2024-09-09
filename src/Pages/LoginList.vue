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
import LoadingSpinner from '@/components/LoadingSpinner.vue';

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
      isRecoveringPassword: false, // Nuevo estado para controlar la vista de recuperación de contraseña
      recoveryEmail: '',
      users: [
        {
          username: 'admin',
          password: 'admin123',
          role: 'Administrador'
        },
        {
          username: 'gerente',
          password: 'gerente123',
          role: 'Gerente'
        },
        {
          username: 'cajero',
          password: 'cajero123',
          role: 'Cajero'
        }
      ]
    };
  },
  methods: {
    login() {
      const user = this.users.find(
        u => u.username === this.username && u.password === this.password
      );
      if (user) {
        this.isLoading = true;
        console.log('Loading state before timeout:', this.isLoading); // Verificar si el valor cambia
        setTimeout(() => {
          this.isLoading = false;
          console.log('Loading state after timeout:', this.isLoading); // Verificar si se desactiva
          this.$router.push('/home');
        }, 300); // Spinner aparece durante 1.5 segundos
        localStorage.setItem('auth', 'true');
        localStorage.setItem('role', user.role); // Almacena correctamente el rol
        console.log('Rol guardado:', user.role); // Verificar en la consola si se guarda correctamente
      } else {
        alert('Credenciales incorrectas');
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    togglePasswordRecovery() {
      // Verifica si el estado se cambia correctamente
      console.log('Antes de cambiar:', this.isRecoveringPassword);
      this.isRecoveringPassword = !this.isRecoveringPassword;
      console.log('Después de cambiar:', this.isRecoveringPassword);
    },
    recoverPassword() {
      // Lógica de recuperación de contraseña
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: transparent;
}

.login-card {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  color: #39b378;
  margin-bottom: 20px;
}

.welcome-message {
  font-size: 16px;
  margin-bottom: 10px;
  color: #888;
}

.or-text {
  margin-bottom: 20px;
  font-size: 16px;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

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

.password-group {
  position: relative;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
}

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
