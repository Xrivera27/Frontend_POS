<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Registro de Empresa</h2>
      <form @submit.prevent="handleSubmit">
        <!-- Nombre de la empresa -->
        <div class="form-group">
          <input id="nombre" v-model="form.nombre" type="text" placeholder="Nombre de la empresa" required />
        </div>

        <!-- Categoría -->
        <div class="form-group">
          <select id="id_categoria" v-model="form.id_categoria" required>
            <option value="" disabled>Seleccione una categoría</option>
            <option v-for="categoria in categorias" :key="categoria.id_categoria" :value="categoria.id_categoria">
              {{ categoria.categoria }}
            </option>
          </select>
        </div>

        <!-- Correo -->
        <div class="form-group">
          <input id="correo" v-model="form.correo_principal" type="email" placeholder="Correo electrónico principal" required />
        </div>

        <!-- Teléfono -->
        <div class="form-group">
          <input id="telefono" v-model="form.telefono_principal" type="tel" placeholder="Teléfono principal" required />
        </div>

         <!-- Encargado -->
         <div class="form-group">
          <input id="encargado" v-model="form.nombre_usuario" type="text" placeholder="Nombre del CEO" required />
        </div>

          <!-- Encargado -->
          <div class="form-group">
          <input id="apellido" v-model="form.apellido_usuario" type="text" placeholder="Apellido del CEO" required />
        </div>

        <div class="form-group">
          <input id="apellido" v-model="form.rtn" type="text" placeholder="RTN Empresa" required />
        </div>

          <!-- Direccion -->
          <div class="form-group">
          <input id="direccion" v-model="form.direccion" type="text" placeholder="Direccion" required />
        </div>

        <!-- SAR -->
        <div class="form-options">
          <label class="checkbox-container">
            <input id="sar" v-model="form.usa_SAR" type="checkbox" />SAR
          </label>
        </div>

        <!-- Campos adicionales de SAR (solo se muestran si usa_SAR es true) -->
        <!-- Botón de envío -->
        <div class="form-group button-container">
          <button type="submit" class="submit-btn">
            <i id="btnSubmit" class="bi bi-arrow-right-circle-fill"></i>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';

const form = reactive({
  nombre: '',
  id_categoria: '',
  rtn: '',
  correo_principal: '',
  telefono_principal: '',
  nombre_usuario: '',
  apellido_usuario: '',
  direccion: '',
  usa_SAR: false,
});

function limpiarForm (){
  form.apellido_usuario ='';
  form.id_categoria ='';
  form.rtn = '';
  form.correo_principal ='';
  form.telefono_principal ='';
  form.nombre_usuario ='';
  form.nombre ='';
  form.direccion ='';
  form.usa_SAR = false;
}

// Estado para almacenar las categorías
const categorias = ref([]);

// Función para cargar las categorías desde el backend
const fetchCategorias = async () => {
  try {
    const response = await fetch('http://uc0skkosgswkwkgosowwoocs.34.16.113.40.sslip.io/api/categoria');
    const data = await response.json();
    categorias.value = data; // Asigna las categorías a la variable reactiva
  } catch (error) {
    console.error('Error al cargar las categorías:', error);
  }
};

// Cargar las categorías cuando el componente se monte
onMounted(() => {
  fetchCategorias();
});

// Función para manejar el envío del formulario
const handleSubmit = async () => {
  try {
    const response = await fetch('http://uc0skkosgswkwkgosowwoocs.34.16.113.40.sslip.io/api/empresa', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    });

    if (response.ok) {
      const data = await response.json();

      console.log('Formulario enviado correctamente:', data);
      alert('Registro enviado.');
      limpiarForm();

    } else {
      const errorData = await response.json();
      console.error('Error al enviar el formulario:', errorData);
      
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#categoria {
  width: 100%;
}

#btnSubmit {
  color: white;
  font-size: 2rem;
}

.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: transparent;
  padding: 1rem;
}

.register-card {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  width: 100%;
  margin: 1rem;
}

h2 {
  color: #39b378;
  margin-bottom: 1.5rem;
  font-size: clamp(1.5rem, 4vw, 2rem);
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;
}

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="number"],
input[type="date"],
select {
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
}

input:focus,
select:focus {
  border-color: #39b378;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  flex-wrap: wrap;
  gap: 0.5rem;
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
  color: white;
  font-size: 2.5rem;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.submit-btn:hover {
  transform: scale(1.05);
  background-color: #2d8f5f;
}

.submit-btn i {
  font-size: 2.5rem;
}

.sar-fields {
  background-color: #f4f4f4;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.date-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #333;
  text-align: left;
}

/* Estilos para el popup personalizado */
.custom-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.popup-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 90%;
  max-width: 400px;
}

.popup-content p {
  font-size: clamp(1rem, 3vw, 1.2rem);
  margin-bottom: 1rem;
}

.popup-content button {
  background-color: #39b378;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.popup-content button:hover {
  background-color: #2d8f5f;
}

/* Media Queries */
@media screen and (max-width: 768px) {
  .register-card {
    padding: 1.5rem;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .checkbox-container {
    width: 100%;
    justify-content: flex-start;
  }
}

@media screen and (max-width: 480px) {
  .register-card {
    padding: 1rem;
    margin: 0.5rem;
  }
  
  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="number"],
  input[type="date"],
  select {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
  
  .submit-btn,
  .submit-btn i {
    font-size: 2rem;
    width: 42px;
    height: 42px;
  }
  
  .popup-content {
    padding: 15px;
  }
}
</style>