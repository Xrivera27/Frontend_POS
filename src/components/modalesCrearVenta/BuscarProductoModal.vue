<template>
    <Teleport to="body">
        <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
            <div class="modal-content">
                <div class="header-container">
                    <h2 class="modal-title">Buscar Producto</h2>
                </div>

                <div class="search-container">
                    <div class="button-group">
                        <button v-for="filter in searchFilters" :key="filter.value" @click="selectFilter(filter.value)"
                            :class="{ active: currentFilter === filter.value }" class="filter-button">
                            {{ filter.label }}
                        </button>
                    </div>
                    <input type="text" v-model="searchQuery"
                        :placeholder="`Buscar por ${getFilterLabel(currentFilter)}...`" @input="filterProducts"
                        class="search-input" />
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Categoría</th>
                                <th>Proveedor</th>
                                <th>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="product in filteredProducts" :key="product.codigo_producto"
                                @dblclick="selectProduct(product)" class="product-row">
                                <td>{{ product.codigo_producto }}</td>
                                <td>{{ product.nombre }}</td>
                                <td>{{ product.descripcion }}</td>
                                <td>{{ product.categoria }}</td>
                                <td>{{ product.proveedor }}</td>
                                <td class="text-right">{{ formatPrice(product.precio_unitario) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="button-container">
                    <button @click="closeModal">Buscar</button>
                    <button @click="closeModal">Consultar</button>
                    <button @click="limpiarBusqueda">Limpiar</button>
                    <button class="nuevo-btn">Nuevo</button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script>
export default {
    props: {
        isVisible: Boolean,
        productos: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            searchQuery: '',
            currentFilter: 'codigo_producto',
            searchFilters: [
                { value: 'codigo_producto', label: 'Código' },
                { value: 'nombre', label: 'Nombre' },
                //{ value: 'descripcion', label: 'Descripción' },
                //{ value: 'proveedor', label: 'Proveedor' }
            ],
            filteredProducts: []
        };
    },
    methods: {
        selectFilter(filter) {
            this.currentFilter = filter;
            this.filterProducts();
        },
        getFilterLabel(filter) {
            const selectedFilter = this.searchFilters.find(f => f.value === filter);
            return selectedFilter ? selectedFilter.label : '';
        },
        filterProducts() {
            if (!this.searchQuery) {
                this.filteredProducts = [...this.productos];
                return;
            }

            const query = this.searchQuery.toLowerCase();
            this.filteredProducts = this.productos.filter(product => {
                const searchValue = String(product[this.currentFilter] || '').toLowerCase();
                return searchValue.includes(query);
            });
        },
        selectProduct(product) {
            this.$emit('product-selected', {
                codigo_producto: product.codigo_producto,
                nombre: product.nombre,
                descripcion: product.descripcion,
                // categoria: product.categoria,
                // proveedor: product.proveedor,
                precio: product.precio_unitario,
                precioImpuesto: product.precioImpuesto,
                id_producto: product.id_producto,
                cantidad: 1
            });
            this.closeModal();
        },
        closeModal() {
            this.searchQuery = '';
            this.$emit('close');
        },
        limpiarBusqueda() {
            this.searchQuery = '';
            this.filterProducts();
        },
        formatPrice(price) {
            return price ? Number(price).toFixed(2) : '0.00';
        }
    },
    watch: {
        productos: {
            immediate: true,
            handler(newProducts) {
                console.log('Productos recibidos:', newProducts); // Para debugging
                this.filteredProducts = [...newProducts];
            }
        },
        isVisible(newValue) {
            if (newValue) {
                this.searchQuery = '';
                this.filterProducts();
            }
        }
    },
    mounted() {
        console.log('Productos iniciales:', this.productos); // Para debugging
        this.filteredProducts = [...this.productos];
    }
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
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.search-container {
    margin-bottom: 15px;
}

.button-group {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
}

.filter-button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #e9ecef;
    cursor: pointer;
    font-size: 13px;
}

.filter-button:hover {
    background-color: #dee2e6;
}

.filter-button.active {
    background-color: #4CAF50;
    color: white;
    border-color: #4CAF50;
}

.search-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.table-container {
    flex: 1;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 15px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th {
    position: sticky;
    top: 0;
    background-color: #f8f9fa;
    padding: 12px 8px;
    text-align: left;
    font-weight: 600;
    font-size: 13px;
    border-bottom: 2px solid #dee2e6;
}

td {
    padding: 8px;
    font-size: 13px;
    border-bottom: 1px solid #e9ecef;
}

.product-row:hover {
    background-color: #f8f9fa;
    cursor: pointer;
}

.text-right {
    text-align: right;
}

.button-container {
    display: flex;
    gap: 10px;
    justify-content: flex-start;
    padding: 10px 0;
}

.button-container button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #e9ecef;
    cursor: pointer;
    font-size: 13px;
    min-width: 100px;
}

.button-container .nuevo-btn {
    margin-left: auto;
    background-color: #4CAF50;
    color: white;
    border-color: #4CAF50;
}

/* Ajustes para el ancho de las columnas */
th:nth-child(1),
td:nth-child(1) {
    width: 12%;
}

/* Código */
th:nth-child(2),
td:nth-child(2) {
    width: 20%;
}

/* Nombre */
th:nth-child(3),
td:nth-child(3) {
    width: 28%;
}

/* Descripción */
th:nth-child(4),
td:nth-child(4) {
    width: 15%;
}

/* Categoría */
th:nth-child(5),
td:nth-child(5) {
    width: 15%;
}

/* Proveedor */
th:nth-child(6),
td:nth-child(6) {
    width: 10%;
}

/* Precio */

@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        margin: 10px;
    }

    .button-group {
        flex-wrap: wrap;
    }

    .filter-button {
        flex: 1 1 calc(50% - 4px);
    }
}
</style>