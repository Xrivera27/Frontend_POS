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
                                <th class="col-codigo">Código</th>
                                <th class="col-nombre">Nombre</th>
                                <th class="col-descripcion">Descripción</th>
                                <th class="col-categoria">Categoría</th>
                                <th class="col-proveedor">Proveedor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="product in filteredProducts" :key="product.codigo"
                                @dblclick="selectProduct(product)" class="product-row">
                                <td>{{ product.codigo }}</td>
                                <td>{{ product.nombre }}</td>
                                <td>{{ product.descripcion }}</td>
                                <td>{{ product.categoria }}</td>
                                <td>{{ product.proveedor }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script>
export default {
    props: {
        isVisible: Boolean,
        productos: {  // Añadir esta prop
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            searchQuery: '',
            currentFilter: 'codigo',
            searchFilters: [
                { value: 'codigo', label: 'Código' },
                { value: 'nombre', label: 'Nombre' },
                { value: 'descripcion', label: 'Descripción' },
                { value: 'proveedor', label: 'Marca' }
            ],
            products: [
                { codigo: 'P001', nombre: 'Producto 1', descripcion: 'Descripción del producto 1', categoria: 'Categoría A', proveedor: 'Proveedor X' },
                { codigo: 'P002', nombre: 'Producto 2', descripcion: 'Descripción del producto 2', categoria: 'Categoría B', proveedor: 'Proveedor Y' },
                { codigo: 'P003', nombre: 'Producto 3', descripcion: 'Descripción del producto 3', categoria: 'Categoría A', proveedor: 'Proveedor Z' },
                { codigo: 'P004', nombre: 'Producto 4', descripcion: 'Descripción del producto 4', categoria: 'Categoría C', proveedor: 'Proveedor X' },
                { codigo: 'P005', nombre: 'Producto 5', descripcion: 'Descripción del producto 5', categoria: 'Categoría B', proveedor: 'Proveedor Y' },
                { codigo: 'P006', nombre: 'Producto 6', descripcion: 'Descripción del producto 6', categoria: 'Categoría C', proveedor: 'Proveedor Z' },
                { codigo: 'P007', nombre: 'Producto 7', descripcion: 'Descripción del producto 7', categoria: 'Categoría A', proveedor: 'Proveedor X' },
                { codigo: 'P008', nombre: 'Producto 8', descripcion: 'Descripción del producto 8', categoria: 'Categoría B', proveedor: 'Proveedor Y' },
                { codigo: 'P009', nombre: 'Producto 9', descripcion: 'Descripción del producto 9', categoria: 'Categoría C', proveedor: 'Proveedor Z' },
                { codigo: 'P010', nombre: 'Producto 10', descripcion: 'Descripción del producto 10', categoria: 'Categoría A', proveedor: 'Proveedor X' }
            ]
            ,
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
                this.filteredProducts = this.products;
                return;
            }

            const query = this.searchQuery.toLowerCase();
            this.filteredProducts = this.products.filter(product =>
                product[this.currentFilter].toString().toLowerCase().includes(query)
            );
        },
        selectProduct(product) {
            this.$emit('product-selected', product);
            this.closeModal();
        },
        closeModal() {
            this.$emit('close');
        }
    },
    mounted() {
        this.filteredProducts = this.products;
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
    width: 800px;
    max-width: 90%;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 1001;
}

/* Estilos específicos para los botones en un grupo */
.button-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    gap: 10px;
}

/* Ajustes específicos para la tabla de productos */
.table-container {
    max-height: 400px;
    overflow-y: auto;
    margin-top: 10px;
    border: 1px solid #ddd;
}

/* Ajustar el estilo del scrollbar para la tabla */
.table-container::-webkit-scrollbar {
    width: 6px;
}

.table-container::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
}

.table-container::-webkit-scrollbar-track {
    background: #f1f1f1;
}

/* Estilos específicos para las filas de productos */
.product-row:nth-child(even) {
    background-color: #f9f9f9;
}

.product-row:hover {
    background-color: #f0f0f0;
    cursor: pointer;
}

/* Estilo para los botones de filtro */
.filter-button {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
}

.filter-button:hover {
    background-color: #e0e0e0;
}

.filter-button.active {
    background-color: #4CAF50;
    color: white;
    border-color: #4CAF50;
}

/* Ajustes para el input de búsqueda */
.search-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    margin: 10px 0;
}

/* Ajuste de tamaños de texto para la tabla */
table th {
    font-size: 12px;
    font-weight: 600;
    padding: 8px;
    background-color: #f5f5f5;
    border-bottom: 2px solid #ddd;
}

table td {
    font-size: 11px;
    padding: 6px 8px;
    border-bottom: 1px solid #eee;
}

/* Estilo para el header del modal */
.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.modal-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

/* Contenedor de botones de filtro */
.filter-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
}

.col-codigo {
    width: 10%;
}

.col-nombre {
    width: 10%;
}

.col-descripcion {
    width: 60%;
}

.col-categoria {
    width: 10%;
}

.col-proveedor {
    width: 10%;
}

/* Ajustes de responsive */
@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        margin: 10px;
    }

    .filter-buttons {
        flex-wrap: wrap;
    }

    .filter-button {
        flex: 1 1 calc(33.333% - 8px);
    }
}
</style>