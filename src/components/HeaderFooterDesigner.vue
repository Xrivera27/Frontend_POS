// HeaderFooterDesigner.vue
<template>
    <div v-if="isOpen" class="modal-overlay">
        <div class="modal-content">
            <h2 class="modal-title">Configurar Encabezado y Pie de Página</h2>

            <!-- Encabezado -->
            <div class="section">
                <div class="section-header">
                    <h3>Encabezado</h3>
                    <label class="switch">
                        <input type="checkbox" v-model="localConfig.header.enabled">
                        <span class="slider"></span>
                    </label>
                </div>

                <div v-if="localConfig.header.enabled" class="form-group">
                    <div class="input-group">
                        <label>Título del Reporte</label>
                        <input type="text" v-model="localConfig.header.text" placeholder="Ej: Reporte de Ventas">
                    </div>

                    <div class="input-group">
                        <label>Nombre de la Empresa</label>
                        <input type="text" v-model="localConfig.header.companyName" placeholder="Nombre de la Empresa">
                    </div>

                    <div class="input-group">
                        <label>Dirección</label>
                        <input type="text" v-model="localConfig.header.address" placeholder="Dirección">
                    </div>

                    <div class="input-group">
                        <label>Teléfono</label>
                        <input type="text" v-model="localConfig.header.phone" placeholder="Teléfono">
                    </div>

                    <div class="input-group">
                        <label>Correo Electrónico</label>
                        <input type="text" v-model="localConfig.header.email" placeholder="Correo Electrónico">
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Pie de Página -->
            <div class="section">
                <div class="section-header">
                    <h3>Pie de Página</h3>
                    <label class="switch">
                        <input type="checkbox" v-model="localConfig.footer.enabled">
                        <span class="slider"></span>
                    </label>
                </div>

                <div v-if="localConfig.footer.enabled" class="form-group">
                    <div class="input-group">
                        <label>Tipo de Pie de Página</label>
                        <select v-model="localConfig.footer.template">
                            <option value="basic">Básico (solo fecha)</option>
                            <option value="detailed">Detallado (fecha y hora)</option>
                            <option value="custom">Personalizado</option>
                        </select>
                    </div>

                    <div v-if="localConfig.footer.template === 'custom'" class="input-group">
                        <label>Texto Personalizado</label>
                        <input type="text" v-model="localConfig.footer.customText"
                            placeholder="Usar {FECHA} para fecha actual">
                        <small class="help-text">
                            Variables disponibles: {FECHA}, {HORA}, {PAGINA}, {TOTAL_PAGINAS}
                        </small>
                    </div>

                    <div class="input-group">
                        <label>Alineación</label>
                        <select v-model="localConfig.footer.alignment">
                            <option value="left">Izquierda</option>
                            <option value="center">Centro</option>
                            <option value="right">Derecha</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Vista Previa -->
            <div class="preview-section">
                <h4>Vista Previa</h4>
                <div class="preview-content">
                    <div v-if="localConfig.header.enabled" class="preview-header">
                        <p class="preview-company">{{ localConfig.header.companyName }}</p>
                        <p>{{ localConfig.header.address }}</p>
                        <p>Tel: {{ localConfig.header.phone }}</p>
                        <p>{{ localConfig.header.email }}</p>
                        <p class="preview-title">{{ localConfig.header.text }}</p>
                    </div>

                    <div v-if="localConfig.footer.enabled" class="preview-footer" :class="localConfig.footer.alignment">
                        {{ getPreviewFooterText() }}
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
                <button class="btn btn-primary" @click="saveChanges">Guardar Cambios</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        modelValue: Boolean,
        config: {
            type: Object,
            default: () => ({
                header: {
                    enabled: true,
                    text: 'Reporte de Ventas',
                    companyName: '',
                    address: '',
                    phone: '',
                    email: ''
                },
                footer: {
                    enabled: true,
                    template: 'basic',
                    customText: 'Generado el {FECHA}',
                    alignment: 'center'
                }
            })
        },
        datosInstituto: {
        type: Object, // Especificamos que es un objeto
        default: () => ({
            nombre: '',
            direccion: '',
            correo: '',
            telefono: ''
        })
    }
    },

    emits: ['update:modelValue', 'save'],

    data() {
        // Asegurarnos de que todas las propiedades estén inicializadas
        const defaultConfig = {
            header: {
                enabled: true,
                text: 'Reporte de Ventas',
                companyName: '',
                address: '',
                phone: '',
                email: ''
            },
            footer: {
                enabled: true,
                template: 'basic',
                customText: 'Generado el {FECHA}',
                alignment: 'center'
            }
        };

        // Combinar la configuración proporcionada con los valores por defecto
        const mergedConfig = {
            header: { ...defaultConfig.header, ...this.config?.header },
            footer: { ...defaultConfig.footer, ...this.config?.footer }
        };

        return {
            localConfig: mergedConfig
        };
    },

    computed: {
        isOpen: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit('update:modelValue', value);
            }
        }
    },

    methods: {
        getPreviewFooterText() {
            if (!this.localConfig?.footer?.enabled) return '';

            const now = new Date();
            const fecha = now.toLocaleDateString();
            const hora = now.toLocaleTimeString();

            switch (this.localConfig.footer.template) {
                case 'basic':
                    return `Generado el ${fecha}`;
                case 'detailed':
                    return `Generado el ${fecha} a las ${hora}`;
                case 'custom':
                    return (this.localConfig.footer.customText || 'Generado el {FECHA}')
                        .replace('{FECHA}', fecha)
                        .replace('{HORA}', hora)
                        .replace('{PAGINA}', '1')
                        .replace('{TOTAL_PAGINAS}', '1');
                default:
                    return `Generado el ${fecha}`;
            }
        },

        closeModal() {
            this.isOpen = false;
        },

        saveChanges() {
            // Asegurarnos de que todos los campos necesarios existan
            const configToSave = {
                header: {
                    enabled: this.localConfig.header.enabled,
                    text: this.localConfig.header.text || 'Reporte de Ventas',
                    companyName: this.localConfig.header.companyName || '',
                    address: this.localConfig.header.address || '',
                    phone: this.localConfig.header.phone || '',
                    email: this.localConfig.header.email || ''
                },
                footer: {
                    enabled: this.localConfig.footer.enabled,
                    template: this.localConfig.footer.template || 'basic',
                    customText: this.localConfig.footer.customText || 'Generado el {FECHA}',
                    alignment: this.localConfig.footer.alignment || 'center'
                }
            };

            this.$emit('save', configToSave);
            this.closeModal();
        },

        // Método para manejar cambios en la configuración
        updateConfig() {
            // Asegurarnos de que las propiedades requeridas existan
            if (!this.localConfig.header) {
                this.localConfig.header = {
                    enabled: true,
                    text: 'Reporte de Ventas',
                    companyName: '',
                    address: '',
                    phone: '',
                    email: ''
                };
            }

            if (!this.localConfig.footer) {
                this.localConfig.footer = {
                    enabled: true,
                    template: 'basic',
                    customText: 'Generado el {FECHA}',
                    alignment: 'center'
                };
            }
        }
    },

    watch: {
        config: {
            handler(newConfig) {
                // Actualizar la configuración local cuando cambie la prop
                this.localConfig = {
                    header: { ...this.localConfig.header, ...newConfig?.header },
                    footer: { ...this.localConfig.footer, ...newConfig?.footer }
                };
                this.updateConfig();
            },
            deep: true
        }
    },

    created() {
        // Asegurarnos de que la configuración esté correctamente inicializada
        this.updateConfig();
    }
}
</script>

<style scoped>
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
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-title {
    margin: 0 0 1.5rem;
    font-size: 1.5rem;
    font-weight: bold;
}

.section {
    margin-bottom: 1.5rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.input-group label {
    font-weight: 500;
}

input,
select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.divider {
    height: 1px;
    background-color: #ddd;
    margin: 1.5rem 0;
}

.preview-section {
    margin-top: 1.5rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.preview-content {
    background-color: #f8f8f8;
    padding: 1rem;
    border-radius: 4px;
}

.preview-header {
    text-align: center;
    margin-bottom: 1rem;
}

.preview-company {
    font-weight: bold;
    font-size: 1.1rem;
}

.preview-title {
    font-weight: bold;
    margin-top: 0.5rem;
}

.preview-footer {
    font-size: 0.9rem;
    color: #666;
}

.preview-footer.left {
    text-align: left;
}

.preview-footer.center {
    text-align: center;
}

.preview-footer.right {
    text-align: right;
}

.modal-footer {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.help-text {
    color: #666;
    font-size: 0.8rem;
}

/* Switch styles */
.switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 24px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked+.slider {
    background-color: #007bff;
}

input:checked+.slider:before {
    transform: translateX(26px);
}

/* Dark mode styles */
:root[class~="dark"] .modal-content {
    background-color: #1a1a1a;
    color: white;
}

:root[class~="dark"] input,
:root[class~="dark"] select {
    background-color: #333;
    border-color: #444;
    color: white;
}

:root[class~="dark"] .preview-content {
    background-color: #2a2a2a;
}

:root[class~="dark"] .divider {
    background-color: #444;
}

:root[class~="dark"] .preview-footer {
    color: #999;
}

:root[class~="dark"] .help-text {
    color: #999;
}
</style>