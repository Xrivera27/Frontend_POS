<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Login</h2>
      <p class="welcome-message">¡Bienvenido de nuevo!</p>
      <p class="or-text">Ingrese con su usuario</p>
      <form @submit.prevent="login">
        <div class="form-group">
          <input type="email" v-model="email" placeholder="Correo eléctronico" required />
        </div>
        <div class="form-group">
          <input type="password" v-model="password" placeholder="Contraseña" required />
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
      email: '',
      password: '',
      rememberMe: false,
      predefinedEmail: 'admin@ejemplo.com',  // Correo predefinido
      predefinedPassword: 'contraseña123'  // Contraseña predefinida
    };
  },
  methods: {
    login() {
      // Verifica si el correo electrónico y la contraseña coinciden con los valores predefinidos
      if (this.email === this.predefinedEmail && this.password === this.predefinedPassword) {
        localStorage.setItem('auth', 'true');
        this.$router.push('/home'); // Redirige al Home después del login
      } else {
        alert('Credenciales incorrectas'); // Muestra un mensaje de error si las credenciales son incorrectas
      }
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

input[type="email"], input[type="password"] {
  width: 95%;
  padding: .8rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
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
