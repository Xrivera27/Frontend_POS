<template>
    <aside ref="sidebar" v-if="!isLoginRoute" class="sidebar" :class="{ expanded, dark: isDarkMode }">
        <!-- Toggle button for expanding/collapsing -->
        <!-- Toggle Sidebar Arrow -->
        <li class="nav-item toggle-btn" @click="toggleSidebar">
            <i class="bi" :class="expanded ? 'bi-chevron-left' : 'bi-chevron-right'"></i>
        </li>


        <!-- Toggle button for expanding/collapsing -->
        <ul class="nav flex-column">

            <!-- Home -->
            <li v-if="hasPermission('Home')" class="nav-item">
                <router-link to="/home" class="nav-link" :class="{ active: isActive('/home') }">
                    <i class="bi bi-house-door-fill"></i>
                    <span v-if="expanded" class="tooltip-text">Home</span>
                </router-link>
            </li>

            <!-- Sucursales -->
            <li v-if="hasPermission('Sucursal')" class="nav-item">
                <router-link to="/sucursales" class="nav-link" :class="{ active: isActive('/sucursales') }">
                    <i class="bi bi-shop-window"></i>
                    <span v-if="expanded" class="tooltip-text">Sucursal</span>
                </router-link>
            </li>

            <!-- Usuario -->
            <li v-if="hasPermission('Usuario')" class="nav-item">
                <router-link to="/empleados" class="nav-link" :class="{ active: isActive('/empleados') }">
                    <i class="bi bi-person-fill"></i>
                    <span v-if="expanded" class="tooltip-text">Usuario</span>
                </router-link>
            </li>

            <!-- Categorías -->
            <li v-if="hasPermission('Categorias')" class="nav-item">
                <router-link to="/categorias" class="nav-link" :class="{ active: isActive('/registro') }">
                    <i class="bi bi-tags-fill"></i>
                    <span v-if="expanded" class="tooltip-text">Categorías</span>
                </router-link>
            </li>

            <!-- Productos -->
            <li v-if="hasPermission('Productos')" class="nav-item">
                <router-link to="/productos" class="nav-link" :class="{ active: isActive('/productos') }">
                    <i class="bi bi-box-seam"></i>
                    <span v-if="expanded" class="tooltip-text">Productos</span>
                </router-link>
            </li>

            <!-- Clientes -->
            <li v-if="hasPermission('Clientes')" class="nav-item">
                <router-link to="/clientes" class="nav-link" :class="{ active: isActive('/clientes') }">
                    <i class="bi bi-people-fill"></i>
                    <span v-if="expanded" class="tooltip-text">Clientes</span>
                </router-link>
            </li>

            <!-- Proveedores -->
            <li v-if="hasPermission('Proveedores')" class="nav-item">
                <router-link to="/proveedores" class="nav-link" :class="{ active: isActive('/proveedores') }">
                    <i class="bi bi-truck"></i>
                    <span v-if="expanded" class="tooltip-text">Proveedores</span>
                </router-link>
            </li>

            <li v-if="hasPermission('Venta')" class="nav-item dropdown" ref="ventasDropdown"
                @mouseover="openDropdown('ventas')" @mouseleave="closeDropdown('ventas')">
                <a href="#" class="nav-link">
                    <i class="bi bi-cash-stack"></i>
                    <span v-if="expanded" class="tooltip-text">Ventas</span>
                    <i class="bi bi-chevron-right"></i>
                </a>
                <ul :class="{ 'dropdown-menu': true, 'open': dropdowns.ventas }">
                    <li><router-link to="/administrar-ventas" class="nav-link">Administrar ventas</router-link></li>
                    <li><router-link to="/ventas" class="nav-link">Crear venta</router-link></li>
                    <li><router-link to="/reporte" class="nav-link">Reporte de ventas</router-link></li>
                </ul>
            </li>

            <li v-if="hasPermission('Compra')" class="nav-item dropdown" ref="comprasDropdown"
                @mouseover="openDropdown('compras')" @mouseleave="closeDropdown('compras')">
                <a href="#" class="nav-link">
                    <i class="bi bi-cart-plus-fill"></i>
                    <span v-if="expanded" class="tooltip-text">Compras</span>
                    <i class="bi bi-chevron-right"></i>
                </a>
                <ul :class="{ 'dropdown-menu': true, 'open': dropdowns.compras }">
                    <li><router-link to="/administrar-compras" class="nav-link">Administrar compras</router-link></li>
                    <li><router-link to="/compras" class="nav-link">Crear compra</router-link></li>
                    <li><router-link to="/reporte-ventas" class="nav-link">Reporte de compras</router-link></li>
                </ul>
            </li>

        </ul>

        <div id="aside-line"></div>

        <ul class="nav flex-column">
            <!-- Configuración -->
            <li class="nav-item">
                <router-link to="/config-page" class="nav-link" :class="{ active: isActive('/config-page') }">
                    <i class="bi bi-gear-fill"></i>
                    <span v-if="expanded" class="tooltip-text">Configuración</span>
                </router-link>
            </li>

            <!-- Cerrar sesión -->
            <li class="nav-item">
                <a @click="logout" class="nav-link" style="cursor: pointer;">
                    <i class="bi bi-box-arrow-right"></i>
                    <span v-if="expanded" class="tooltip-text">Cerrar sesión</span>
                </a>
            </li>

            <!-- Toggle Dark Mode -->
            <li class="nav-item toggle-btn" @click="toggleDarkMode">
                <i class="bi" :class="isDarkMode ? 'bi-brightness-high' : 'bi-moon-stars-fill'"></i>
            </li>
        </ul>
    </aside>
</template>

<script>
export default {
    name: 'AppSidebar',
    props: {
        isDarkMode: {
            type: Boolean,
            required: true
        },
        expanded: {
            type: Boolean,
            required: true
        },
        dropdowns: {
            type: Object,
            required: true
        },
        hasPermission: {
            type: Function,
            required: true
        },
        isActive: {
            type: Function,
            required: true
        }
    },
    methods: {
        toggleSidebar() {
            this.$emit('toggle-sidebar');
        },
        openDropdown(menu) {
            this.$emit('open-dropdown', menu);
        },
        closeDropdown(menu) {
            this.$emit('close-dropdown', menu);
        },
        logout() {
            this.$emit('logout');
        },
        toggleDarkMode() {
            this.$emit('toggle-dark-mode');
        },
        expandSidebar() {
            this.$emit('expand-sidebar'); // Emitir evento para expandir
        },
        collapseSidebar() {
            this.$emit('collapse-sidebar'); // Emitir evento para contraer
        },
    }
}
</script>

<style scoped>
/* =======================================================
   Importación de Fuentes
======================================================= */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

/* =======================================================
   Estilos Base
======================================================= */
* {
    font-family: 'Montserrat', sans-serif;
}

a.nav-link {
    display: flex;
    justify-content: flex-start;
    /* Alinea el contenido a la izquierda */
}

.nav {
    list-style: none;
    padding: 0;
}

ul.nav {
    padding: 0 15px;
}

/* =======================================================
   Estilos del Sidebar
======================================================= */
.sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 80px;
    height: 100%;
    background-color: #ebebeb;
    color: #c09d62;
    padding-top: 20px;
    padding-right: 0;
    margin: 0;
    z-index: 10;
    transition: width 0.3s ease;
}

.sidebar.expanded {
    width: 255px;
}

.sidebar.expanded .nav-item {
    padding-left: 40px;
}

.sidebar.expanded .toggle-btn {
    padding: 0;
}

/* =======================================================
   Estilos en Modo Oscuro para el Sidebar
======================================================= */
.sidebar.dark {
    background-color: #333;
}

.sidebar.dark a.nav-link {
    color: #c09d62;
    /* Color de los íconos y texto en modo oscuro */
}

.sidebar.dark .nav-link.active {
    color: #79552f;
    /* Color del texto y los íconos en estado activo en modo oscuro */
}

.sidebar.dark .toggle-btn,
.sidebar.dark .toggle-btn i {
    color: #c09d62;
    /* Mantiene el color del ícono en modo oscuro */
}

/* =======================================================
   Estilos de los Elementos de Navegación
======================================================= */
.nav-item {
    position: relative;
    justify-content: center;
    margin-bottom: 0.10vh;
}

.nav-link {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    /* Alinea los íconos a la izquierda */
    padding: 1vh 1.5vh;
    color: #c09d62;
    text-decoration: none;
    border-radius: 8px;
    transition: background-color 0.3s ease;
}

.nav-link i {
    font-size: 3.5vh;
    /* Tamaño uniforme para los íconos */
    color: inherit;
    /* Hereda el color del texto */
}

.nav-link:hover {
    background-color: #dadada;
}

.nav-link.active {
    background-color: #d4d4d4;
    color: #79552f;
    /* Color del texto y los íconos en estado activo */
}

/* =======================================================
   Estilos del Botón de Toggle
======================================================= */
.toggle-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 35px;
    /* Ancho fijo */
    height: 35px;
    /* Alto fijo */
    border-radius: 50%;
    /* Mantiene la forma circular */
    padding: 5px;
    cursor: pointer;
    text-align: center;
    margin: 10px auto;
    /* Centra horizontalmente */
    position: relative;
    /* Para posicionamiento interno si es necesario */
    flex-shrink: 0;
    /* Evita que se encoja con el sidebar */
}

.toggle-btn:hover {
    background-color: #d4d4d4;
}

/* =======================================================
   Estilos del Texto de Tooltip
======================================================= */
.tooltip-text {
    margin-left: 10px;
    font-weight: bold;
    font-size: 15px;
}

/* =======================================================
   Estilos del Menú Desplegable
======================================================= */
.dropdown-menu {
    position: absolute;
    top: 0;
    left: 100%;
    background-color: #ebebeb;
    padding: 0;
    width: auto;
    min-width: 24vh;
    max-width: 25vh;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transform: translateY(-10px);
    transition: max-height 0.4s ease, opacity 0.4s ease, transform 0.4s ease;
    pointer-events: none;
}

.dropdown-menu.open {
    max-height: 300px;
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

.dropdown-menu a {
    font-size: 14px;
    width: auto;
    text-decoration: none;
    color: inherit;
}

.dropdown-menu a:hover {
    background-color: #f0f0f0;
}

/* =======================================================
   Estilos de la Línea del Sidebar
======================================================= */
#aside-line {
    width: 60%;
    height: 1px;
    background-color: #c09d62;
    margin: 10px auto;
}

/* =======================================================
   Estilos del Contenedor Principal
======================================================= */
.app-wrapper {
    display: flex;
    min-height: 100vh;
}

/* =======================================================
   Estilos del Contenido Principal
======================================================= */
.main-content {
    margin-left: 80px;
    padding: 20px;
    width: 100%;
    background-color: #f5f5f5;
    transition: margin-left 0.3s ease, background-color 0.3s ease;
}

.main-content.expanded {
    padding-left: 0px;
    z-index: 1;
}

.main-content.dark {
    background-color: #1e1e1e;
    color: #ffffff;
}

/* =======================================================
   Estilos Adicionales
======================================================= */
</style>
