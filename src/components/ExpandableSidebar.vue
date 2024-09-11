<template>
    <div :class="['sidebar', { expanded }]">
        <div class="toggle-btn" @click="toggleSidebar">
            <i class="fas" :class="expanded ? 'fa-chevron-left' : 'fa-chevron-right'"></i>
        </div>
        <ul class="menu">
            <li v-for="item in menuItems" :key="item.name" class="menu-item">
                <i :class="item.icon"></i>
                <span v-if="expanded">{{ item.name }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    data() {
        return {
            expanded: false,
            menuItems: [
                { name: "Categorías", icon: "fas fa-list" },
                { name: "Usuarios", icon: "fas fa-user" },
                { name: "Productos", icon: "fas fa-box" },
            ],
        };
    },
    methods: {
        toggleSidebar() {
            this.expanded = !this.expanded;
        },
    },
};
</script>

<style scoped>
.sidebar {
    width: 60px;
    height: 100vh;
    background-color: #2c3e50;
    transition: width 0.3s ease;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.sidebar.expanded {
    width: 200px;
}

.menu {
    list-style: none;
    padding: 0;
    margin-top: 20px;
}

.menu-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    color: #ecf0f1;
}

.menu-item i {
    font-size: 18px;
}

.menu-item:hover {
    background-color: #34495e;
}

.menu-item span {
    margin-left: 10px;
    font-size: 16px;
}

.toggle-btn {
    position: absolute;
    top: 10px;
    left: 100%;
    transform: translateX(-50%);
    background-color: #34495e;
    padding: 5px;
    cursor: pointer;
    border-radius: 50%;
    transition: background-color 0.3s ease;
}

.toggle-btn:hover {
    background-color: #1abc9c;
}

.fas {
    color: #ecf0f1;
    font-size: 16px;
}
</style>