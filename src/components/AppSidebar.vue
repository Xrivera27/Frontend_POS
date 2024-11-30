<!-- Mi Sidebar :D -->
<template>
    <div v-if="isMobile && expanded" class="sidebar-overlay" @click="toggleSidebar"></div>
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
                <router-link @click="handleRouteChange" to="/home" class="nav-link"
                    :class="{ active: isActive('/home') }">
                    <i class="bi bi-house-door-fill"></i>
                    <span v-if="expanded" class="tooltip-text">Home</span>
                </router-link>
            </li>

            <!-- Sucursales -->
            <li v-if="hasPermission('Sucursal')" class="nav-item">
                <router-link @click="handleRouteChange" to="/sucursales" class="nav-link"
                    :class="{ active: isActive('/sucursales') }">
                    <i class="bi bi-shop-window"></i>
                    <span v-if="expanded" class="tooltip-text">Sucursal</span>
                </router-link>
            </li>

            <!-- Usuario -->
            <li v-if="hasPermission('Usuario')" class="nav-item">
                <router-link @click="handleRouteChange" to="/empleados" class="nav-link"
                    :class="{ active: isActive('/empleados') }">
                    <i class="bi bi-person-fill"></i>
                    <span v-if="expanded" class="tooltip-text">Usuario</span>
                </router-link>
            </li>

            <!-- Categorías -->
            <li v-if="hasPermission('Categorias')" class="nav-item">
                <router-link @click="handleRouteChange" to="/categorias" class="nav-link"
                    :class="{ active: isActive('/registro') }">
                    <i class="bi bi-tags-fill"></i>
                    <span v-if="expanded" class="tooltip-text">Categorías</span>
                </router-link>
            </li>

            <!-- Productos -->
            <li v-if="hasPermission('Productos')" class="nav-item">
                <router-link @click="handleRouteChange" to="/productos" class="nav-link"
                    :class="{ active: isActive('/productos') }">
                    <i class="bi bi-box-seam"></i>
                    <span v-if="expanded" class="tooltip-text">Productos</span>
                </router-link>
            </li>

            <!-- Clientes -->
            <li v-if="hasPermission('Clientes')" class="nav-item">
                <router-link @click="handleRouteChange" to="/clientes" class="nav-link"
                    :class="{ active: isActive('/clientes') }">
                    <i class="bi bi-people-fill"></i>
                    <span v-if="expanded" class="tooltip-text">Clientes</span>
                </router-link>
            </li>

            <!-- Proveedores -->
            <li v-if="hasPermission('Proveedores')" class="nav-item">
                <router-link @click="handleRouteChange" to="/proveedores" class="nav-link"
                    :class="{ active: isActive('/proveedores') }">
                    <i class="bi bi-truck"></i>
                    <span v-if="expanded" class="tooltip-text">Proveedores</span>
                </router-link>
            </li>

            <!-- Ventas Dropdown -->
            <li v-if="hasPermission('Venta')" class="nav-item dropdown" ref="ventasDropdown">
                <a href="#" class="nav-link" @click.prevent="toggleDropdown('ventas')">
                    <i class="bi bi-cash-stack"></i>
                    <span v-if="expanded" class="tooltip-text">Ventas</span>
                    <i class="bi bi-chevron-down dropdown-arrow" :class="{ 'rotated': openDropdowns.ventas }"></i>
                </a>
                <ul class="dropdown-menu" :class="{ 'show': openDropdowns.ventas }">
                    <li><router-link @click="handleRouteChange" to="/administrar-ventas"
                            class="dropdown-item">Administrar ventas</router-link></li>
                    <li><router-link @click="handleRouteChange" to="/ventas" class="dropdown-item">Crear
                            venta</router-link></li>
                    <li><router-link @click="handleRouteChange" to="/reporte" class="dropdown-item">Reporte de
                            ventas</router-link></li>
                </ul>
            </li>

            <!-- Compras Dropdown -->
            <li v-if="hasPermission('Compra')" class="nav-item dropdown" ref="comprasDropdown">
                <a href="#" class="nav-link" @click.prevent="toggleDropdown('compras')">
                    <i class="bi bi-cart-plus-fill"></i>
                    <span v-if="expanded" class="tooltip-text">Compras</span>
                    <i class="bi bi-chevron-down dropdown-arrow" :class="{ 'rotated': openDropdowns.compras }"></i>
                </a>
                <ul class="dropdown-menu" :class="{ 'show': openDropdowns.compras }">
                    <li><router-link @click="handleRouteChange" to="/registro" class="dropdown-item">Administrar
                            compras</router-link></li>
                    <li><router-link @click="handleRouteChange" to="/compras" class="dropdown-item">Crear
                            compra</router-link></li>
                    <li><router-link @click="handleRouteChange" to="/admin-invenario" class="dropdown-item">
                            Alertas de inventario</router-link></li>
                </ul>
            </li>
        </ul>

        <div id="aside-line"></div>

        <ul class="nav flex-column">
            <!-- Configuración -->
            <li class="nav-item">
                <router-link @click="handleRouteChange" to="/config-page" class="nav-link"
                    :class="{ active: isActive('/config-page') }">
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
    <button v-if="isMobile" class="mobile-toggle" @click="toggleSidebar">
        <i class="bi bi-list"></i>
    </button>
</template>

<script>
export default {
    name: 'AppSidebar',
    data() {
        return {
            isMobile: window.innerWidth <= 480,
            openDropdowns: {
                ventas: false,
                compras: false
            }
        }
    },

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
        toggleDropdown(menu) {
            if (menu === 'ventas') {
                this.openDropdowns.compras = false;
            } else if (menu === 'compras') {
                this.openDropdowns.ventas = false;
            }

            this.openDropdowns[menu] = !this.openDropdowns[menu];
        },
        closeDropdowns(event) {
            // Verificar si el click fue fuera de los dropdowns
            const ventasDropdown = this.$refs.ventasDropdown;
            const comprasDropdown = this.$refs.comprasDropdown;

            if (!ventasDropdown?.contains(event.target) && !comprasDropdown?.contains(event.target)) {
                this.openDropdowns.ventas = false;
                this.openDropdowns.compras = false;
            }
        },
        isDropdownOpen(menu) {
            return this.openDropdowns[menu];
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
        handleRouteChange() {
            if (this.isMobile) {
                this.$emit('toggle-sidebar');
            }
            // Cerrar los dropdowns
            this.openDropdowns.ventas = false;
            this.openDropdowns.compras = false;
        }
    },
    mounted() {
        document.addEventListener('click', this.closeDropdowns);

        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 480;
        });
    },

    beforeUnmount() {
        document.removeEventListener('click', this.closeDropdowns);
        window.removeEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 480;
        });
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
    display: flex;
    flex-direction: column;
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
    z-index: 1000;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

/* Para iconos cuando el sidebar está colapsado */
.sidebar:not(.expanded) .nav-link {
    justify-content: center;
    padding: 1vh;
}

.sidebar:not(.expanded) .nav-link i {
    margin: 0;
}

.sidebar:not(.expanded) .dropdown-menu {
    position: absolute;
    left: 100%;
    top: 0;
    min-width: 200px;
    background-color: #ebebeb;
    box-shadow: 4px 0 8px rgba(0, 0, 0, 0.1);
    border-radius: 0 8px 8px 0;
    margin: 0;
    padding: 0;
}

.sidebar:not(.expanded) .nav-item.dropdown {
    position: relative;
    width: 100%;
}

/* Ajuste para el modo oscuro */
.sidebar.dark:not(.expanded) .dropdown-menu {
    background-color: #333;
    box-shadow: 4px 0 8px rgba(0, 0, 0, 0.3);
}

/* Ocultar la flecha del dropdown cuando está colapsado */
.sidebar:not(.expanded) .dropdown-arrow {
    transform: rotate(-90deg);
}

/* Ajustar el ancho del dropdown cuando está expandido */
.sidebar.expanded .nav-item.dropdown {
    width: 88%;
}

/* Para mantener el estilo cuando está expandido */
.sidebar.expanded .nav-link {
    justify-content: flex-start;
    padding: 1vh 1.5vh;
}

/* Específico para dropdowns */
.nav-item.dropdown .nav-link {
    justify-content: space-between;
}

/* Animaciones mejoradas para el sidebar */
.sidebar.expanded {
    width: 200px;
    transform: translateX(0);
}

.sidebar-content {
    height: calc(100% - 65px);
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
    overflow-y: auto;
    padding: 0 10px;
}

/* Overlay para móviles */
.sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.sidebar-overlay.show {
    opacity: 1;
    visibility: visible;
}

.sidebar.expanded {
    width: 200px;
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

.sidebar.dark .dropdown-menu {
    background-color: rgba(192, 157, 98, 0.05);
}

.sidebar.dark .dropdown-item:hover {
    background-color: rgba(192, 157, 98, 0.15);
}

/* =======================================================
   Estilos de los Elementos de Navegación
======================================================= */
.nav-item {
    transform: translateX(-10px);
    opacity: 0;
    animation: slideIn 0.3s ease forwards;
    padding: 4px 0;
}

.nav-item.dropdown {
    width: 88%;
    padding: 4px 0;
    /* Mismo padding que los otros elementos */
}

.nav-item.dropdown .nav-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

@keyframes slideIn {
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.nav-item:nth-child(1) {
    animation-delay: 0.1s;
}

.nav-item:nth-child(2) {
    animation-delay: 0.2s;
}

.nav-item:nth-child(3) {
    animation-delay: 0.3s;
}

.nav-item:nth-child(4) {
    animation-delay: 0.4s;
}

.nav-item:nth-child(5) {
    animation-delay: 0.5s;
}

.nav-item:nth-child(6) {
    animation-delay: 0.6s;
}

.nav-item:nth-child(7) {
    animation-delay: 0.7s;
}

.nav-item:nth-child(8) {
    animation-delay: 0.8s;
}

.nav-link {
    display: flex;
    position: relative;
    overflow: hidden;
    align-items: center;
    justify-content: flex-start;
    /* Alinea los íconos a la izquierda */

    color: #c09d62;
    text-decoration: none;
    border-radius: 8px;
    transition: background-color 0.3s ease;
}

.nav-link i {
    font-size: 2.5vh;
    color: inherit;
    transition: transform 0.3s ease;
}

.nav-link:hover {
    background-color: #dadada;
}

.nav-link:hover::after {
    width: 100%;
}

.nav-link.active {
    background-color: #d4d4d4;
    color: #79552f;
    /* Color del texto y los íconos en estado activo */
}

.nav-link:hover i {
    transform: scale(1.1);
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: #c09d62;
    transition: width 0.3s ease;
}

/* =======================================================
   Estilos del Botón de Toggle
======================================================= */
.toggle-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 35px;
    /* Tamaño fijo */
    height: 35px;
    /* Tamaño fijo */
    min-width: 35px;
    /* Evita que se encoja */
    min-height: 35px;
    /* Evita que se encoja */
    border-radius: 50%;
    padding: 0;
    /* Elimina el padding */
    cursor: pointer;
    margin-bottom: 2px;
    margin-left: auto;
    margin-right: auto;
    position: relative;
    flex-shrink: 0;
    /* Evita que se encoja */
    background-color: transparent;
    transition: background-color 0.3s ease;
    /* Solo transición para el hover */
}

.toggle-btn i {
    font-size: 20px;
    /* Tamaño fijo del icono */
}

.toggle-btn:hover {
    background-color: rgba(192, 157, 98, 0.1);
}

/* =======================================================
   Estilos del Texto de Tooltip
======================================================= */
.tooltip-text {
    margin-left: 10px;
    font-size: 15px;
}

@media (max-width: 480px) {
    .sidebar {
        transform: translateX(-100%);
        width: 100%;
        transition: transform 0.3s ease;
    }

    .sidebar.expanded {
        transform: translateX(0);
        width: 50%;
    }

    /* Hamburger menu button */
    .mobile-toggle {
        position: fixed;
        top: 15px;
        left: 15px;
        width: 40px;
        height: 40px;
        background-color: #ebebeb;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1001;
        border: none;
    }

    .sidebar.dark .mobile-toggle {
        background-color: #333;
    }

    /* Overlay for backdrop */
    .sidebar-overlay {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease;
    }

    .sidebar-overlay.show {
        opacity: 1;
        visibility: visible;
    }

    /* Adjust nav items for better touch targets */
    .nav-item {
        margin: 8px 0;
    }

    .nav-link {
        padding: 12px 20px;
    }

    /* Hide default toggle button */
    .toggle-btn {
        display: none;
    }

    /* Adjust dropdown positioning */
    .dropdown-menu {
        position: static;
        width: 100%;
        margin: 0;
        padding: 0;
    }
}

/* Estilos responsivos */
@media (max-width: 768px) {
    .sidebar {
        transform: translateX(-100%);
        width: 250px;
    }

    .sidebar.expanded {
        transform: translateX(0);
    }

    .mobile-collapsed {
        transform: translateX(-100%);
    }

    .nav-link {
        padding: 15px 20px;
        /* Aumentar área táctil en móviles */
    }

    .tooltip-text {
        font-size: 16px;
        /* Texto más grande para móviles */
    }

    .dropdown-menu.show {
        padding: 4px 0;
    }

    .dropdown-item {
        padding: 12px 16px;
        margin: 2px 0;
    }

    .toggle-btn {
        width: 40px;
        height: 40px;
        /* Botón más grande para móviles */
    }
}

.mobile-toggle {
    background-color: transparent;
    color: #c09d62;
}

.sidebar.dark .mobile-toggle {
    color: #c09d62;
    background-color: transparent;
}

/* =======================================================
   Estilos del Menú Desplegable
======================================================= */
.dropdown-menu {
    position: static;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.3s ease;
    background-color: rgba(192, 157, 98, 0.1);
    border-radius: 8px;
    margin: 0 8px;
}

/* Animación suave para el dropdown */
.dropdown-menu {
    transform-origin: top;
    transform: scaleY(0);
    transition: all 0.3s ease;
}

.dropdown-menu.show {
    transform: scaleY(1);
}

/* Animación para el modo oscuro */
.sidebar,
.nav-link,
.dropdown-menu {
    transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
}

.dropdown-menu.show {
    max-height: 1000px;
    opacity: 1;
    padding: 8px 0;
}

.dropdown-menu.open {
    transform: scaleY(1);
    opacity: 1;
}

.dropdown-item {
    padding: 8px 16px;
    color: #c09d62;
    display: block;
    text-decoration: none;
    transition: all 0.3s ease;
    font-size: 0.9em;
}

.dropdown-item:hover {
    background-color: rgba(192, 157, 98, 0.2);
    padding-left: 20px;
}

.dropdown-arrow {
    margin-left: auto;
    transition: transform 0.3s ease;
    font-size: 0.8em;
}

.dropdown-arrow.rotated {
    transform: rotate(180deg);
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
    margin: 8px auto;
    /* Ajustar el margen de la línea divisora */
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
