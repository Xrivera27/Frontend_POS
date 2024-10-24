<template>
    <div>
        <div class="btn-config-container">
            <button class="btn-config" @click="openModal">
    <i id="campana" class="bi bi-bell-fill"></i>{{ username }} {{ apellido }}
    <br>
    <span class="id_usuario">{{ id_usuario }}</span> <!-- Muestra el nombre del usuario aquí -->
    <br>
    {{ rol }}

</button>

        </div>

        <!-- Modal -->
        <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <h2>Configuración del Perfil</h2>
                <form @submit.prevent="saveSettings">
                    <div>
                        <label for="email">Email:</label>
                        <input type="email" id="email" v-model="settings.email">
                    </div>
                    <div>
                        <label for="phone">Teléfono:</label>
                        <input type="tel" id="phone" v-model="settings.phone">
                    </div>
                    <div>
                        <label for="address">Dirección:</label>
                        <input type="text" id="address" v-model="settings.address">
                    </div>
                    <div>
                        <label for="password">Contraseña:</label>
                        <input type="password" id="password" v-model="settings.password">
                    </div>
                    <div>
                        <button type="submit">Guardar</button>
                        <button type="button" @click="closeModal">Cancelar</button>
                    </div>
                </form>
            </div>
            <!-- Usa router-link sin la función isActive -->
            <router-link to="/config-page" class="btn-config nav-link">
                <div class="icon-container">
                    <i id="campana" class="bi bi-bell-fill"></i>
                </div>
                <div class="text-container">
                    <span class="id_usuario">{{ username }} {{ usernamen }}</span>
                    <br>
                    <span class="rol">{{ rol }}</span>
                </div>
            </router-link>
        </div>
    </div>
</template>
<script>
import axios from 'axios';

export default {
    data() {
        return {
            username: '',  // Estado para el nombre de usuario
            role: '',  // Estado para el rol
            id_usuario: '',  // Estado para el id del usuario
        };
    },
    methods: {
        fetchUserProfile() {
            const token = localStorage.getItem('auth');
            axios.get('http://localhost:3000/api/perfil', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    this.id_usuario = response.data.id_usuario;
                    this.username = response.data.nombre;
                    this.usernamen = response.data.apellido;
                    this.rol = response.data.cargo;
                })
                .catch(error => {
                    console.error('Error al obtener el perfil del usuario:', error);
                });
        }
    },
    mounted() {
        this.fetchUserProfile();
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
    font-family: 'Montserrat', sans-serif;
}

#campana {
    margin-right: 10px;
    font-size: 18px;
    color: #a38655;
}

/* Estilos para el contenedor del botón de configuración */
.btn-config-container {
    display: flex;
    justify-content: flex-end;
}

/* Estilos para el botón de configuración */
.btn-config {
    background-color: #f8f8f8;
    text-decoration: none;
    margin-bottom: 0;
    border: none;
    padding: 10px 20px;
    text-align: left;
    width: auto;
    max-width: 300px;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    /* Alinea verticalmente los elementos */
}

.text-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

/* Estilo para el rol */
.rol {
    color: #b0b0b0;
    font-size: 14px;
    margin-top: 0;
}

/* Estilo para el id_usuario */
.id_usuario {
    color: #a38655;
    font-size: 18px;
    margin-top: 0;
}

/* Efecto al pasar el mouse por encima */
.btn-config:hover {
    background-color: #e0e0e0;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

/* Estilo para resaltar el enlace activo */
.router-link-active {
    font-weight: bold;
    color: #a38655;
}
</style>
