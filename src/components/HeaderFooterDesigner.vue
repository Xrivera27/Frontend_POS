<template>
    <div v-if="modelValue" class="modal-overlay">
        <div class="modal-container">
            <!-- Encabezado del modal -->
            <div class="modal-header">
                <h2>Diseñador de Encabezado y Pie</h2>
                <button @click="$emit('update:modelValue', false)" class="close-button">
                    <span class="icon">×</span>
                </button>
            </div>

            <!-- Contenido del modal -->
            <div class="modal-content">
                <!-- Selector de sección -->
                <div class="section-selector">
                    <button v-for="section in sectionButtons" :key="section.id" @click="activeSection = section.id"
                        :class="['section-button', { active: activeSection === section.id }]">
                        {{ section.label }}
                    </button>
                </div>

                <!-- Área de diseño -->
                <div class="design-area">
                    <!-- Panel de elementos disponibles -->
                    <div class="elements-panel">
                        <h3>Elementos Disponibles</h3>
                        <div class="elements-list">
                            <div v-for="type in elementTypes" :key="type.id" class="element-item" draggable="true"
                                @dragstart="handleDragStart($event, type)">
                                <span class="element-icon">{{ type.icon }}</span>
                                <span class="element-label">{{ type.label }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Área de edición -->
                    <div class="editing-area">
                        <div class="editing-header">
                            <h3>{{ getSectionTitle }}</h3>
                            <label class="enable-switch">
                                <input type="checkbox" v-model="sections[activeSection].enabled" />
                                <span class="switch-slider"></span>
                                <span class="switch-label">Habilitar</span>
                            </label>
                        </div>

                        <!-- Área donde se arrastran los elementos -->
                        <div class="drop-zone" @dragover.prevent @drop="handleDrop($event)">
                            <p v-if="!sections[activeSection].elements.length" class="drop-placeholder">
                                Arrastra elementos aquí para diseñar esta sección
                            </p>
                            <div v-else class="dropped-elements">
                                <div v-for="(element, index) in sections[activeSection].elements" :key="index"
                                    class="dropped-element" @click="handleElementClick(element)"
                                    :class="{ 'active-element': activeElement === element }">
                                    <span class="element-icon">{{ element.icon }}</span>
                                    <span class="element-label">{{ element.label }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pie del modal -->
            <div class="modal-footer">
                <div class="properties-container" v-if="activeElement">
                    <div class="properties-header">
                        <h3>Propiedades</h3>
                        <button class="close-button" @click="activeElement = null">
                            <span class="icon">×</span>
                        </button>
                    </div>
                    <div class="properties-content">
                        <template v-if="activeElement.type === 'text'">
                            <div class="property-group">
                                <label>Propiedades del Texto</label>
                                <div>
                                    <input type="text" class="property-input" :value="activeElement.text"
                                        @input="handlePropertyChange({ model: 'text', value: $event.target.value })" />
                                </div>
                            </div>
                        </template>
                        <template v-else-if="activeElement.type === 'image'">
                            <div class="property-group">
                                <label>Propiedades de la Imagen</label>
                                <div>
                                    <input type="file" class="property-input" @change="handleImageUpload($event)" />
                                    <span class="element-preview">
                                        <img :src="activeElement.imageUrl" class="element-image-preview" />
                                    </span>
                                </div>
                            </div>
                        </template>
                    </div>
                    <div class="footer-buttons">
                        <button @click="handleRemoveElement" class="cancel-button">Eliminar</button>
                        <button @click="handleSave" class="save-button">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HeaderFooterDesigner',
    props: {
        modelValue: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    emits: ['update:modelValue', 'save'],
    data() {
        return {
            activeSection: 'reportHeader',
            activeElement: null,
            elementTypes: [
                { id: 'text', type: 'text', label: 'Texto', icon: '📝' },
                { id: 'image', type: 'image', label: 'Imagen', icon: '🖼️' },
                { id: 'date', type: 'date', label: 'Fecha', icon: '📅' },
                { id: 'pageNumber', type: 'pageNumber', label: 'Número de Página', icon: '🔢' },
                { id: 'line', type: 'line', label: 'Línea', icon: '➖' },
            ],
            sectionButtons: [
                { id: 'reportHeader', label: 'Encabezado de Informe' },
                { id: 'reportFooter', label: 'Pie de Informe' },
                { id: 'pageHeader', label: 'Encabezado de Página' },
                { id: 'pageFooter', label: 'Pie de Página' }
            ],
            sections: {
                reportHeader: {
                    enabled: true,
                    elements: []
                },
                reportFooter: {
                    enabled: true,
                    elements: []
                },
                pageHeader: {
                    enabled: true,
                    elements: []
                },
                pageFooter: {
                    enabled: true,
                    elements: []
                }
            }
        }
    },
    computed: {
        getSectionTitle() {
            const sectionMap = {
                reportHeader: 'Encabezado de Informe',
                reportFooter: 'Pie de Informe',
                pageHeader: 'Encabezado de Página',
                pageFooter: 'Pie de Página'
            }
            return sectionMap[this.activeSection]
        }
    },
    methods: {
        handleDragStart(event, type) {
            event.dataTransfer.setData('text/plain', JSON.stringify(type))
        },
        handleDrop(event) {
            const type = JSON.parse(event.dataTransfer.getData('text/plain'))
            this.sections[this.activeSection].elements.push({ ...type, id: Math.random().toString(36).substr(2, 9), type: type.type })
        },
        handleElementClick(element) {
            this.activeElement = element
        },
        handlePropertyChange(property) {
            // Actualiza la propiedad del elemento activo
            this.activeElement[property.model] = property.value
        },
        handleImageUpload(event) {
            const file = event.target.files[0]
            this.activeElement.imageUrl = URL.createObjectURL(file)
        },
        handleRemoveElement() {
            // Elimina el elemento activo de la sección
            const index = this.sections[this.activeSection].elements.indexOf(this.activeElement)
            if (index !== -1) {
                this.sections[this.activeSection].elements.splice(index, 1)
            }
            this.activeElement = null
        },
        handleSave() {
            this.$emit('save', this.sections)
            this.$emit('update:modelValue', false)
        }
    }
}
</script>

<style scoped>
/* Estilos base y contenedor del modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease-out;
}

.modal-container {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    width: 90%;
    max-width: 72rem;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.3s ease-out;
}

/* Header del modal */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: linear-gradient(to right, #3b82f6, #2563eb);
}

.modal-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
}

.close-button {
    border-radius: 9999px;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: background-color 0.2s;
}

.close-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

.close-button .icon {
    font-size: 1.5rem;
    line-height: 1;
}

/* Contenido del modal */
.modal-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow-y: auto;
}

/* Selector de sección */
.section-selector {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.section-button {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    transition: all 0.2s;
    font-size: 0.875rem;
    font-weight: 500;
    background-color: #f3f4f6;
}

.section-button:hover {
    background-color: #e5e7eb;
}

.section-button.active {
    background-color: #3b82f6;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Área de diseño */
.design-area {
    display: flex;
    gap: 1.5rem;
    min-height: 400px;
}

/* Panel de elementos */
.elements-panel {
    width: 16rem;
    background-color: #f9fafb;
    border-radius: 0.5rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
}

.elements-panel h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #1f2937;
}

.elements-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.element-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background-color: white;
    border-radius: 0.5rem;
    cursor: move;
    transition: all 0.2s;
    border: 1px solid #f3f4f6;
}

.element-item:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transform: scale(1.02);
    border-color: #bfdbfe;
}

.element-icon {
    font-size: 1.25rem;
}

.element-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
}

/* Área de edición */
.editing-area {
    flex: 1;
    border: 2px dashed #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
}

.editing-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.editing-header h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
}

/* Switch personalizado */
.enable-switch {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.switch-slider {
    position: relative;
    display: inline-block;
    width: 2.5rem;
    height: 1.25rem;
    background-color: #e5e7eb;
    border-radius: 9999px;
    transition: background-color 0.2s;
}

.enable-switch input:checked+.switch-slider {
    background-color: #3b82f6;
}

.switch-slider:before {
    content: '';
    position: absolute;
    left: 0.25rem;
    top: 0.25rem;
    width: 0.75rem;
    height: 0.75rem;
    background-color: white;
    border-radius: 9999px;
    transition: transform 0.2s;
}

.enable-switch input:checked+.switch-slider:before {
    transform: translateX(1.25rem);
}

.switch-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
}

/* Zona de drop */
.drop-zone {
    background-color: #f9fafb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    min-height: 300px;
    border: 2px dashed #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.drop-zone:hover {
    border-color: #3b82f6;
    background-color: #eff6ff;
}

.drop-placeholder {
    color: #6b7280;
    text-align: center;
    font-weight: 500;
}

.dropped-elements {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.dropped-element {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.2s;
}

.dropped-element:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transform: scale(1.01);
}

/* Panel de propiedades */
.properties-panel {
    background-color: #f9fafb;
    border-radius: 0.5rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
}

.properties-panel h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1f2937;
}

.properties-placeholder {
    font-size: 0.875rem;
    color: #6b7280;
}

/* Footer del modal */
.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
    background-color: #f9fafb;
}

.cancel-button {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    color: #374151;
    font-weight: 500;
    background-color: #f3f4f6;
    transition: background-color 0.2s;
}

.cancel-button:hover {
    background-color: #e5e7eb;
}

.save-button {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    color: white;
    font-weight: 500;
    background-color: #3b82f6;
    transition: background-color 0.2s;
}

.save-button:hover {
    background-color: #2563eb;
}

/* Animaciones */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
    .modal-container {
        background-color: #1f2937;
    }

    .modal-header {
        border-bottom-color: #374151;
    }

    .elements-panel {
        background-color: #111827;
        border-color: #374151;
    }

    .elements-panel h3,
    .editing-header h3,
    .properties-panel h3 {
        color: #e5e7eb;
    }

    .element-item {
        background-color: #1f2937;
        border-color: #374151;
    }

    .element-item:hover {
        border-color: #1e40af;
    }

    .element-label {
        color: #d1d5db;
    }

    .editing-area {
        border-color: #374151;
    }

    .drop-zone {
        background-color: #111827;
        border-color: #374151;
    }

    .drop-zone:hover {
        background-color: rgba(59, 130, 246, 0.1);
    }

    .dropped-element {
        background-color: #1f2937;
    }

    .switch-slider {
        background-color: #4b5563;
    }

    .switch-label {
        color: #9ca3af;
    }

    .properties-panel {
        background-color: #111827;
        border-color: #374151;
    }

    .properties-placeholder {
        color: #9ca3af;
    }

    .modal-footer {
        background-color: #111827;
        border-top-color: #374151;
    }

    .cancel-button {
        background-color: #374151;
        color: #e5e7eb;
    }

    .cancel-button:hover {
        background-color: #4b5563;
    }
}

/* Responsive */
@media (max-width: 768px) {
    .design-area {
        flex-direction: column;
    }

    .elements-panel {
        width: 100%;
    }

    .section-selector {
        overflow-x: auto;
        padding: 0.5rem 0;
    }

    .section-button {
        white-space: nowrap;
    }
}

/* Ocultar input del switch */
.enable-switch input {
    display: none;
}

.active-element {
    background-color: #e5e7eb;
}

.properties-panel {
    background-color: #f9fafb;
    border-radius: 0.5rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    margin-top: 1rem;
}

.properties-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.property-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.property-item label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #1f2937;
}

.property-item input {
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    color: #1f2937;
}


.modal-footer.with-properties {
    flex-direction: column;
    gap: 1rem;
}

.properties-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background-color: #f3f4f6;
    border-radius: 0.5rem;
    width: 100%;
}

.properties-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.properties-header h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
}

.properties-content {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.property-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 200px;
}

.property-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
}

.property-input {
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    width: 100%;
    background-color: white;
}

.property-input:focus {
    outline: none;
    border-color: #3b82f6;
    ring: 2px;
    ring-color: #93c5fd;
}

.footer-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    width: 100%;
}

.element-preview {
    margin-left: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
}

.element-image-preview {
    max-height: 2rem;
    max-width: 4rem;
    object-fit: contain;
    margin-left: 0.5rem;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
    .properties-container {
        background-color: #1f2937;
    }

    .properties-header h3 {
        color: #e5e7eb;
    }

    .property-group label {
        color: #9ca3af;
    }

    .property-input {
        background-color: #111827;
        border-color: #374151;
        color: #e5e7eb;
    }

    .property-input:focus {
        border-color: #60a5fa;
    }

    .element-preview {
        color: #9ca3af;
    }
}
</style>