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
        localStorage.setItem('role', user.role);
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
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
}

#btnLogin {
  color: white;
  font-size: 2rem;
}

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
  color: #39b378;
}

.welcome-message {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.or-text {
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

input[type="text"],
input[type="password"] {
  width: 95%;
  padding: .8rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
}

.password-group {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
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
}

input[type="checkbox"] {
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
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
}

.forgot-password {
  color: #39b378;
}
</style>
