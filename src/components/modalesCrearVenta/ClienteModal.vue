<template>
    <Teleport to="body">
        <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <div class="header-container" tabindex="-1">
                    <h2 class="modal-title">Clientes</h2>
                    <input type="text" v-model="searchQuery" placeholder="Búsqueda por nombre" class="search-input" />
                </div>
                <div class="form-container">
                    <div class="form-group">
                        <label>Nombre:</label>
                        <input type="text" v-model="newClient.nombre" />
                    </div>
                    <div class="form-group">
                        <label>Dirección:</label>
                        <input type="text" v-model="newClient.direccion" />
                    </div>
                    <div class="form-group">
                        <label>RTN:</label>
                        <input type="text" v-model="newClient.rtn" />
                    </div>
                    <div class="form-group">
                        <label>Teléfono:</label>
                        <input type="text" v-model="newClient.telefono" />
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
                    <button @click="addClient">Nuevo</button>
                    <button @click="closeModal">Salir</button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script>
// [Script section se mantiene igual]
export default {
    props: {
        isVisible: {
            type: Boolean,
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
            filteredClients: [],
            newClient: {
                nombre: '',
                direccion: '',
                rtn: '',
                telefono: '',
            },
        };
    },
    computed: {
        filterClients() {
            if (this.searchQuery === '') {
                return this.clientes;
            }
            else {
                return this.clientes.filter(client =>
                    client.nombre_completo.toLowerCase().includes(this.searchQuery.toLowerCase())
                );
            }
        },
    },
    methods: {
        onFocus() {
            this.$emit('modal-focused');
        },
        returnClientes(clientes) {
            return clientes;
        },
        closeModal() {
            console.log(this.clientes);
            this.$emit('close');
        },
        selectClient(client) {
            this.$emit('client-selected', client);
        },
        addClient() {
            const { nombre, direccion, rtn, telefono } = this.newClient;
            if (!nombre || !direccion || !rtn || !telefono) {
                alert('Por favor, completa todos los campos.');
                return;
            }
            this.clients.push({ ...this.newClient });
            this.newClient = { nombre: '', direccion: '', rtn: '', telefono: '' };
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

.form-container {
    display: flex;
    flex-wrap: wrap;
    /* Permite que los inputs se ajusten a la siguiente línea si no hay suficiente espacio */
    margin-bottom: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
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