<template>
    <Teleport to="body">
        <div v-if="isVisible" class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-content" tabindex="-1" @focus="onFocus" @blur="onBlur">
                <div class="header-container">
                    <h2 class="modal-title">Guardar Venta</h2>
                </div>

                <div class="form-container">
                    <div v-if="isConsumidorFinal" class="form-group">
                        <label>Nombre del Cliente:</label>
                        <input type="text" v-model="formData.nombreCliente" @focus="onFocus" @blur="onBlur"
                            @keydown.stop />
                    </div>
                    <div class="form-group">
                        <label>Observaciones:</label>
                        <input type="text" v-model="formData.observaciones" @focus="onFocus" @blur="onBlur"
                            @keydown.stop />
                    </div>
                </div>

                <div class="button-container">
                    <button @click="handleSave">Guardar</button>
                    <button @click="$emit('close')">Salir</button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script>
export default {
    props: {
        isVisible: Boolean,
        isConsumidorFinal: Boolean
    },

    data() {
        return {
            formData: {
                nombreCliente: '',
                observaciones: ''
            }
        }
    },

    methods: {
        onFocus() {
            this.$emit('modal-focused', true);
        },

        onBlur() {
            this.$emit('modal-focused', false);
        },

        handleSave() {
            if (this.isConsumidorFinal && !this.formData.nombreCliente.trim()) {
                alert('Por favor ingrese el nombre del cliente');
                return;
            }

            this.$emit('save', this.formData);
            this.formData = {
                nombreCliente: '',
                observaciones: ''
            };
        }
    }
}
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
    max-width: 600px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.modal-title {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
}

.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.form-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-group {
    display: flex;
    flex-direction: column;
    flex: 1;
}

input[type="text"] {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 100%;
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
</style>