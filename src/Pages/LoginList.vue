<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Login</h2>
      <p class="welcome-message">¡Bienvenido de nuevo!</p>
      <p class="or-text">Ingrese con su usuario</p>
      <form @submit.prevent="login">
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
          <a href="#" class="forgot-password">¿Olvidaste la contraseña?</a>
        </div>
        <div class="form-group button-container">
          <button type="submit" class="submit-btn">
            <i id="btnLogin" class="bi bi-arrow-right-circle-fill"></i>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      rememberMe: false,
      showPassword: false, // Controla la visibilidad de la contraseña
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
    localStorage.setItem('auth', 'true');
    localStorage.setItem('role', user.role); // Almacena correctamente el rol
    console.log('Rol guardado:', user.role); // Verificar en la consola si se guarda correctamente
    this.$router.push('/home');
  } else {
    alert('Credenciales incorrectas');
  }

},
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    }
  }
};
</script>

<style scoped>
/* Estilos del Login */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
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
}

.form-group {
  margin-bottom: 1rem;
  text-align: center;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
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
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 2rem;
  color: rgb(245, 196, 91);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.checkbox-container {
  font-size: 12px;
  color: #888;
}

.forgot-password {
  font-size: 12px;
  color: rgb(245, 196, 91);
}
</style>
