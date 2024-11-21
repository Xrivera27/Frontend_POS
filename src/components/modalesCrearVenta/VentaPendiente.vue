<template>
    <div v-if="isVisible" class="modal-overlay">
        <div class="modal-content">
            <h2>Recuperar Venta</h2>

            <h1>Venta pendiente encontrada.</h1>

            <div class="button-group">
                <button @click="$emit('close')" class="btn-cancel">Recuperar</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'VentaPendienteModal',
    props: {
        isVisible: {
            type: Boolean,
            required: true
        },
    },



    methods: {
        cerrarModal() {
            
            this.$emit('close');
        },
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