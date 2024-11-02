<template>
    <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">

            <div class="header-container">
                <h2 class="modal-title">Clientes</h2>
                <input type="text" v-model="searchQuery" placeholder="Búsqueda por nombre" @input="filterClients"
                    class="search-input" />
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

            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th>RTN</th>
                        <th>Teléfono</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="client in filteredClients" :key="client.rtn" @dblclick="selectClient(client)"
                        class="client-row">
                        <td>{{ client.nombre }}</td>
                        <td>{{ client.direccion }}</td>
                        <td>{{ client.rtn }}</td>
                        <td>{{ client.telefono }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="button-container">
                <button @click="addClient">Nuevo</button>
                <button @click="closeModal">Salir</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['isVisible'],
    data() {
        return {
            searchQuery: '',
            clients: [
                { nombre: 'Juan Pérez', direccion: 'Calle 123', rtn: '123456789', telefono: '555-1234' },
                { nombre: 'María López', direccion: 'Avenida 456', rtn: '987654321', telefono: '555-5678' },
                // Agrega más clientes aquí
            ],
            filteredClients: [],
            newClient: {
                nombre: '',
                direccion: '',
                rtn: '',
                telefono: '',
            },
        };
    },
    methods: {
        onFocus() {
            this.$emit('modal-focused');
        },
        closeModal() {
            this.$emit('close');
        },
        filterClients() {
            this.filteredClients = this.clients.filter(client =>
                client.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
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

            // Agrega el nuevo cliente a la lista y resetea el formulario
            this.clients.push({ ...this.newClient });
            this.newClient = { nombre: '', direccion: '', rtn: '', telefono: '' };
            this.filterClients(); // Actualiza la lista filtrada
        },
    },
    mounted() {
        this.filteredClients = this.clients; // Inicializa la lista de clientes filtrados
        document.body.appendChild(this.$el);
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
    width: 500px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1010;
}

.modal-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
}

.close-button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    position: absolute;
    top: 10px;
    right: 10px;
}

.modal-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: left;
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
    /* Alinea el label y el input verticalmente */
    margin-right: 20px;
    /* Espacio entre los grupos de formulario */
    flex: 1;
    /* Esto permite que cada grupo ocupe el mismo espacio */
}

label {
    margin-bottom: 5px;
    text-align: left;
    /* Alinea el texto del label a la izquierda */
}

input[type="text"] {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 95%;
    /* Asegúrate de que el input ocupe todo el ancho del grupo */
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
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

.header-container,
.button-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

button:hover {
    background-color: #3e8e41;
}

.search-input,
input[type="text"] {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 95%;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
}

.modal-title {
    margin: 0;
    /* Elimina el margen predeterminado del h2 */
}

.search-input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 40% !important;
    /* Ajusta el ancho según sea necesario */
}

.client-row {
    cursor: pointer;
}

.client-row:hover {
    background-color: #f5f5f5;
}
</style>