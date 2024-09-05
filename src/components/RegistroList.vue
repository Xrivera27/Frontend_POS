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
                    <select id="categoria" v-model="form.categoria" required>
                        <option value="" disabled>Seleccione una categoría</option>
                        <option value="tecnologia">Tecnología</option>
                        <option value="servicios">Servicios</option>
                        <option value="manufactura">Manufactura</option>
                    </select>
                </div>

                <!-- Correo -->
                <div class="form-group">
                    <input id="correo" v-model="form.correo" type="email" placeholder="Correo electrónico" required />
                </div>

                <!-- Teléfono -->
                <div class="form-group">
                    <input id="telefono" v-model="form.telefono" type="tel" placeholder="Teléfono" required />
                </div>

                <!-- SAR -->
                <div class="form-options">
                    <label class="checkbox-container">
                        <input id="sar" v-model="form.sar" type="checkbox" />SAR
                    </label>
                </div>

                <!-- Campos adicionales de SAR -->
                <transition name="fade">
                    <div v-if="form.sar" class="sar-fields">
                        <div class="form-group">
                            <input id="numeroCai" v-model="form.numeroCai" type="text" placeholder="Número CAI"
                                required />
                        </div>
                        <div class="form-group">
                            <input id="rangoInicial" v-model="form.rangoInicial" type="number"
                                placeholder="Rango inicial" required />
                        </div>
                        <div class="form-group">
                            <input id="rangoFinal" v-model="form.rangoFinal" type="number" placeholder="Rango final"
                                required />
                        </div>
                        <div class="form-group">
                            <input id="numeroActualSar" v-model="form.numeroActualSar" type="number"
                                placeholder="Número actual SAR" required />
                        </div>
                        <div class="form-group">
                            <input id="fechaAutorizacion" v-model="form.fechaAutorizacion" type="date" required />
                        </div>
                        <div class="form-group">
                            <input id="fechaVencimiento" v-model="form.fechaVencimiento" type="date" required />
                        </div>
                    </div>
                </transition>

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
import { reactive } from 'vue'

const form = reactive({
    nombre: '',
    categoria: '',
    correo: '',
    telefono: '',
    sar: false,
    numeroCai: '',
    rangoInicial: '',
    rangoFinal: '',
    numeroActualSar: '',
    fechaAutorizacion: '',
    fechaVencimiento: '',
    estado: ''
})

const handleSubmit = () => {
    console.log('Formulario enviado:', form)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
    font-family: 'Montserrat', sans-serif;
}

#btnSubmit {
    color: white;
    font-size: 2rem;
}

.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: transparent;
}

.register-card {
    background-color: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 600px;
    width: 100%;
}

h2 {
    color: #39b378;
}

.form-group {
    margin-bottom: 1rem;
}

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="number"],
input[type="date"],
select {
    width: 95%;
    padding: 0.8rem;
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

.sar-fields {
    background-color: #f4f4f4;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
}

.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: transparent;
    padding-top: 4rem;
    /* Ajusta el margen superior según sea necesario */
}
</style>