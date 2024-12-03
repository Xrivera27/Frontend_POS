<template>
    <Teleport to="body">
        <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
            <ModalLoading :isLoading="isLoading" />
            <div class="modal-content">
                <div class="header-container" tabindex="-1">
                    <h2 class="modal-title">Clientes</h2>
                    <input type="text" v-model="searchQuery" placeholder="Búsqueda por nombre" class="search-input" />
                </div>
                <div class="form-section" v-if="showForm">
                    <div class="form-container">
                        <div class="form-group">
                            <label>Nombre Completo:</label>
                            <input type="text" v-model="newClient.nombre_completo" />
                        </div>
                        <div class="form-group">
                            <label>Correo:</label>
                            <input type="text" v-model="newClient.correo" />
                        </div>
                        <div class="form-group">
                            <label>RTN:</label>
                            <input type="text" v-model="newClient.rtn" />
                        </div>

                        <div class="form-group">
                            <label>Teléfono:</label>
                            <div class="phone-input-container">
                                <select v-model="selectedCountry" @change="updatePhoneValidation" class="select-phone">
                                    <option value="">País</option>
                                    <option v-for="(country, code) in countryData" :key="code" :value="code">
                                        {{ country.emoji }} {{ country.code }}
                                    </option>
                                </select>
                                <input v-model="newClient.telefono" type="text" class="input-phone"
                                    :placeholder="'Número (' + phoneLength + ' dígitos)'" required />
                            </div>
                        </div>

                    </div>
                    <div class="form-group">
                        <label>Direccion:</label>
                        <input type="text" v-model="newClient.direccion" />
                    </div>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th class="col-nombre">Nombre</th>
                                <th class="col-direccion">Dirección</th>
                                <th class="col-rtn">RTN</th>
                                <th class="col-telefono">Teléfono</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="client in filterClients" :key="client.rtn" @dblclick="selectClient(client)"
                                class="client-row">
                                <td class="col-nombre">{{ client.nombre_completo }}</td>
                                <td class="col-direccion">{{ client.direccion }}</td>
                                <td class="col-rtn">{{ client.rtn }}</td>
                                <td class="col-telefono">{{ client.telefono }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="button-container">
                    <div>
                        <button v-if="showForm" @click="addClient" style="margin-right: 15px">Guardar</button>
                        <button @click="toggleForm">{{ showForm ? 'Cancelar' : 'Agregar nuevo cliente' }}</button>
                    </div>
                    <button @click="closeModal">Salir</button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script>
// [Script section se mantiene igual]
const { postCliente } = require('../../../services/clienteSolicitudes.js');
import { notificaciones } from '../../../services/notificaciones.js';
import { validacionesClientes } from '../../../services/validarCampos.js';
import { COUNTRY_CODES } from "../../../services/countrySelector.js";
export default {
    props: {
        isVisible: {
            type: Boolean,
            required: true
        },
        id_usuario: {
            type: Number,
            required: true
        },
        clientes: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            searchQuery: '',
            selectedCountry: 'HN',
            countryData: COUNTRY_CODES,
            phoneLength: 8,
            isLoading: false,
            showForm: false,
            filteredClients: [],
            newClient: {
                nombre_completo: '',
                correo: '',
                direccion: '',
                rtn: '',
                telefono: '',
            },
            clients: [...this.clientes],
        };
    },
    computed: {
        filterClients() {
            if (this.searchQuery === '') {
                return this.clients;
            }
            else {
                return this.clients.filter(client =>
                    client.nombre_completo.toLowerCase().includes(this.searchQuery.toLowerCase())
                );
            }
        },


    },
    watch: {
        clientes(newValue) {
            if (newValue) {
                this.clients = newValue;
            }

        }
    },
    methods: {

        updatePhoneValidation() {
            if (this.selectedCountry && this.countryData[this.selectedCountry]) {
                this.phoneLength = this.countryData[this.selectedCountry].length;
            }
        },

        toggleForm() {
            this.showForm = !this.showForm;
            if (!this.showForm) {
                this.newClient = { nombre_completo: '', direccion: '', rtn: '', telefono: '', correo: '' };
            }
        },
        onFocus() {
            this.$emit('modal-focused');
        },

        closeModal() {
            console.log(this.clientes);
            this.$emit('close');
        },
        selectClient(client) {
            this.$emit('client-selected', client);
        },

        async addClient() {
            if (!validacionesClientes.validarCampos(this.newClient, this.selectedCountry)) {
                return;
            }
            this.isLoading = true;

            try {
                await postCliente(this.newClient, this.id_usuario);
                this.clients.unshift({ ...this.newClient });
                this.newClient = { nombre_completo: '', direccion: '', rtn: '', telefono: '', correo: '' };
            } catch (error) {
                notificaciones('error', "Error al agregar el cliente");
            } finally {
                this.isLoading = false;
            }

        },
    },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

* {
    font-family: "Montserrat", sans-serif;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 5px;
    width: 90%;
    max-width: 1200px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

/* Nuevo contenedor para la tabla con scroll */
.table-container {
    flex: 1;
    overflow: auto;
    position: relative;
}

/* Estilos para la tabla con encabezado fijo */
table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

thead {
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 1;
}

thead th {
    border-top: 1px solid #ddd;
    border-bottom: 2px solid #ddd;
    /* Borde más grueso para el encabezado */
    background-color: #f8f9fa;
}

th,
td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
}

/* Asegurarse de que las columnas mantengan sus proporciones */
.col-nombre {
    width: 20%;
}

.col-direccion {
    width: 50%;
}

.col-rtn {
    width: 15%;
}

.col-telefono {
    width: 15%;
}

/* Resto de los estilos se mantienen igual */
.modal-title {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
}

.form-section {
    margin: 20px 0;
}

.form-container {
    display: flex;
    flex-wrap: wrap;
    /* Permite que los inputs se ajusten a la siguiente línea si no hay suficiente espacio */
    margin-bottom: 10px;
}

.form-group {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.phone-input-container {
    display: flex;
    gap: 8px;
}

.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;

}

.search-input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 40% !important;
}

input[type="text"] {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 80% !important;
}

.button-container {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #4CAF50;
    color: #fff;
    cursor: pointer;
}

button:hover {
    background-color: #3e8e41;
}

.client-row {
    cursor: pointer;
}

.client-row:hover {
    background-color: #f5f5f5;
}
</style>