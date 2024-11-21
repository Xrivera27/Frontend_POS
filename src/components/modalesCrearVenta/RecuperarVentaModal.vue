<template>
    <div v-if="isVisible" class="modal-overlay">
        <div class="modal-content">
            <h2>Recuperar Venta</h2>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>No. Venta</th>
                            <th>Cliente</th>
                            <!-- <th>Observaciones</th> -->
                            <th>Fecha y Hora</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(venta, index) in returnVentas" :key="index" @dblclick="handleVentaSelect(venta)"
                            class="venta-row">
                            <td>{{ index+1 }}</td>
                            <td>{{ venta.nombre_cliente }}</td>
                            <td>{{ formatearFecha(venta.created_at) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="button-group">
                <button @click="$emit('close')" class="btn-cancel">Cerrar</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'RecuperarVentaModal',
    props: {
        isVisible: {
            type: Boolean,
            required: true
        },
        ventas: {
            type: Array,
            required: true
        }
    },

    computed: {
        returnVentas(){
            return this.ventas;
        }
    },

    methods: {
        handleVentaSelect(venta) {
            this.$emit('venta-selected', venta);
            this.$emit('close');
        },
        formatearFecha(fecha) {
            return new Date(fecha).toLocaleString();
        }
    }
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 800px;
    max-width: 90%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
}

.table-container {
    overflow-y: auto;
    margin: 15px 0;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

th {
    background-color: #f5f5f5;
    font-weight: 600;
}

.venta-row {
    cursor: pointer;
}

.venta-row:hover {
    background-color: #f5f5f5;
}

.button-group {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.btn-cancel {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #f0f0f0;
    cursor: pointer;
}

.btn-cancel:hover {
    background: #e0e0e0;
}
</style>