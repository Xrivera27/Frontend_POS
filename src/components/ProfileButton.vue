<template>
    <div>
        <div class="btn-config-container">
            <router-link to="/config-page" class="btn-config nav-link">
                <div class="icon-container">
                    <i id="campana" class="bi bi-bell-fill"></i>
                </div>
                <div class="text-container" v-if="!loading">
                    <span class="id_usuario">{{ username }} {{ apellido }}</span>
                    <br>
                    <span class="rol">{{ rol }}</span>
                </div>
                <div v-else class="text-container">
                    <span class="id_usuario">Cargando...</span>
                </div>
            </router-link>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
const { getApi } = require('../../config/getApiUrl.js');

export default {
    data() {
        return {
            username: '',
            apellido: '',
            rol: '',
            id_usuario: '',
            loading: true
        };
    },
    methods: {
        async fetchUserProfile() {
            try {
                this.loading = true;
                const token = localStorage.getItem('auth');
                const response = await axios.get(`${getApi()}/perfil`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                this.id_usuario = response.data.id_usuario;
                this.username = response.data.nombre;
                this.apellido = response.data.apellido;
                this.rol = response.data.cargo;
            } catch (error) {
                console.error('Error al obtener el perfil del usuario:', error);
            } finally {
                this.loading = false;
            }
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

/* Contenedor y botón */
.dark .btn-config {
    background-color: #2d2d2d;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.dark .btn-config:hover {
    background-color: #383838;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

/* Textos */
.dark .id_usuario {
    color: #c09d62;
}

.dark .rol {
    color: #808080;
}

/* Icono */
.dark #campana {
    color: #c09d62;
}

/* Estado activo */
.dark .router-link-active {
    color: #c09d62;
}
</style>