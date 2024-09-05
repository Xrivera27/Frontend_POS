<template>
    <div class="login-container">
      <form @submit.prevent="handleSubmit">
        <h2>Login</h2>
        
        <div class="form-group">
          <label for="username">Username:</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Enter your username"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password:</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button type="submit" class="btn">Login</button>
        
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        username: '',
        password: '',
        errorMessage: '',
      };
    },
    methods: {
      handleSubmit() {
        // Reset error message
        this.errorMessage = '';
  
        // Simple validation
        if (this.username.trim() === '' || this.password.trim() === '') {
          this.errorMessage = 'Both fields are required.';
          return;
        }
  
        // Simulate an API call
        setTimeout(() => {
          if (this.username === 'admin' && this.password === 'password') {
            this.$router.push('/dashboard'); // Navigate to dashboard on success
          } else {
            this.errorMessage = 'Invalid username or password.';
          }
        }, 1000);
      },
    },
  };
  </script>
  
  <style scoped>
  .login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
  }
  
  input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }
  
  button {
    width: 100%;
    padding: 10px;
    background-color: #28a745;
    border: none;
    color: #fff;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #218838;
  }
  
  .error {
    color: #dc3545;
    text-align: center;
  }
  </style>
  