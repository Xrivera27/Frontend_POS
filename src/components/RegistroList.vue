<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Registro de Empresa</h2>
            <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Nombre de la empresa -->
                <div>
                    <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre de la
                        empresa</label>
                    <input id="nombre" v-model="form.nombre" type="text" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <!-- Categoría -->
                <div>
                    <label for="categoria" class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select id="categoria" v-model="form.categoria" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="" disabled>Seleccione una categoría</option>
                        <option value="tecnologia">Tecnología</option>
                        <option value="servicios">Servicios</option>
                        <option value="manufactura">Manufactura</option>
                    </select>
                </div>

                <!-- Correo -->
                <div>
                    <label for="correo" class="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                    <input id="correo" v-model="form.correo" type="email" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <!-- Teléfono -->
                <div>
                    <label for="telefono" class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input id="telefono" v-model="form.telefono" type="tel" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <!-- SAR -->
                <div>
                    <div class="flex items-center mb-2">
                        <input id="sar" v-model="form.sar" type="checkbox"
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                        <label for="sar" class="ml-2 block text-sm text-gray-700">SAR</label>
                    </div>

                    <!-- Campos adicionales de SAR -->
                    <transition name="fade">
                        <div v-if="form.sar" class="space-y-4 mt-4 p-4 bg-gray-50 rounded-md">
                            <div>
                                <label for="numeroCai" class="block text-sm font-medium text-gray-700 mb-1">Número
                                    CAI</label>
                                <input id="numeroCai" v-model="form.numeroCai" type="text" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label for="rangoInicial" class="block text-sm font-medium text-gray-700 mb-1">Rango
                                    inicial</label>
                                <input id="rangoInicial" v-model="form.rangoInicial" type="number" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label for="rangoFinal" class="block text-sm font-medium text-gray-700 mb-1">Rango
                                    final</label>
                                <input id="rangoFinal" v-model="form.rangoFinal" type="number" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label for="numeroActualSar" class="block text-sm font-medium text-gray-700 mb-1">Número
                                    actual de SAR</label>
                                <input id="numeroActualSar" v-model="form.numeroActualSar" type="number" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label for="fechaAutorizacion"
                                    class="block text-sm font-medium text-gray-700 mb-1">Fecha de autorización</label>
                                <input id="fechaAutorizacion" v-model="form.fechaAutorizacion" type="date" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label for="fechaVencimiento" class="block text-sm font-medium text-gray-700 mb-1">Fecha
                                    de vencimiento</label>
                                <input id="fechaVencimiento" v-model="form.fechaVencimiento" type="date" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label for="estado" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select id="estado" v-model="form.estado" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="" disabled>Seleccione un estado</option>
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                    <option value="pendiente">Pendiente</option>
                                </select>
                            </div>
                        </div>
                    </transition>
                </div>

                <!-- Botón de envío -->
                <div>
                    <button type="submit"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Registrar Empresa
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
    nombre: '',
    categoria: '',
    correo: '',
    telefono: '',
    sar: false,
    numeroCai: '',
    rangoInicial: '',
    rangoFinal: '',
    numeroActualSar: '',
    fechaAutorizacion: '',
    fechaVencimiento: '',
    estado: ''
})

const handleSubmit = () => {
    // Aquí puedes manejar el envío del formulario
    console.log('Formulario enviado:', form)
    // Implementa la lógica de envío aquí (por ejemplo, una llamada a una API)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>