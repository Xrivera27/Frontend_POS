<template>
  <div class="alertas-wrapper">
    <PageHeader :titulo="titulo" />

    <div class="categories-container">
      <div 
        class="category-box" 
        v-for="(product, index) in products" 
        :key="index"
        :class="getEstadoClass(product.puntaje)"
      >
        <div class="product-name">{{ product.name }}</div>
        <div class="product-description">Descripción: {{ product.description }}</div>
        <div class="product-status">Estado: {{ getEstadoLabel(product.puntaje) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from "@/components/PageHeader.vue";

export default {
  components: {
    PageHeader
  },

  data() {
  return {
    titulo: 'Alertas de Inventario',
    products: [
      { name: 'Leche', description: 'Entera 1L', puntaje: 90 },
      { name: 'Pan', description: 'Integral 500g', puntaje: 60 },
      { name: 'Huevos', description: 'Docena', puntaje: 10 },
      { name: 'Manzanas', description: 'Rojas 1kg', puntaje: 60 },
      { name: 'Cereal', description: 'Avena 250g', puntaje: 10 },
      { name: 'Yogur', description: 'Natural 150g', puntaje: 90 },
      { name: 'Arroz', description: 'Blanco 1kg', puntaje: 10 },
      { name: 'Pasta', description: 'Spaghetti 500g', puntaje: 60 },
      { name: 'Tomate', description: 'Fresco 1kg', puntaje: 10 },
      { name: 'Aceite', description: 'Oliva 500ml', puntaje: 90 },
      { name: 'Queso', description: 'Cheddar 200g', puntaje: 60 },
      { name: 'Pollo', description: 'Pechuga 500g', puntaje: 90 },
      { name: 'Carne', description: 'Molida 1kg', puntaje: 10 },
      { name: 'Pescado', description: 'Salmón 300g', puntaje: 60 },
      { name: 'Jugo', description: 'Naranja 1L', puntaje: 10 },
      { name: 'Azúcar', description: 'Morena 1kg', puntaje: 90 },
      { name: 'Sal', description: 'Gruesa 500g', puntaje: 10 },
      { name: 'Café', description: 'Molido 250g', puntaje: 60 },
      { name: 'Té', description: 'Negro 100g', puntaje: 10 },
      { name: 'Galletas', description: 'Con chispas de chocolate 300g', puntaje: 90 },
      { name: 'Refresco', description: 'Cola 2L', puntaje: 60 },
      { name: 'Mantequilla', description: 'Sin sal 250g', puntaje: 10 },
      { name: 'Harina', description: 'De trigo 1kg', puntaje: 90 },
      { name: 'Lechuga', description: 'Orgánica 500g', puntaje: 60 },
      { name: 'Zanahorias', description: 'Frescas 1kg', puntaje: 10 },
      { name: 'Cebolla', description: 'Blanca 1kg', puntaje: 60 },
      { name: 'Salsa', description: 'Tomate 500ml', puntaje: 10 },
      { name: 'Helado', description: 'Vainilla 1L', puntaje: 60 }
    ]
  };
},

  methods: {
    getEstadoLabel(puntaje) {
      if (puntaje === 90) return "URGENTE";
      if (puntaje === 60) return "ATENCION";
      if (puntaje === 10) return "NORMAL";
    },
    getEstadoClass(puntaje) {
      if (puntaje === 90) return "urgente";
      if (puntaje === 60) return "atencion";
      if (puntaje === 10) return "normal";
    }
  }
};
</script>

<style scoped>
/* Reset básico */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
}

body {
  background: #f4f4f9;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  min-height: 100vh;
  color: #333;
}

.alertas-wrapper {
  padding: 16px;
  width: 100%;
}

.categories-container {
  display: grid;
  margin: 2rem auto 0;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(100px, auto);
  gap: 15px;
  width: 100%;
  max-width: 95%;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.category-box {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s, box-shadow 0.3s;
  text-align: center;
}

.category-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.product-name {
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.product-description {
  font-size: 0.9em;
  color: #555;
}

.product-status {
  font-size: 0.9em;
  font-weight: bold;
  margin-top: 8px;
}

.urgente {
  border: 2px solid #e74c3c;
  background-color: #fdecea;
}

.urgente .product-status {
  color: #e74c3c;
}

.atencion {
  border: 2px solid #f39c12;
  background-color: #fff8e6;
}

.atencion .product-status {
  color: #f39c12;
}

.normal {
  border: 2px solid #2ecc71;
  background-color: #eafaf1;
}

.normal .product-status {
  color: #2ecc71;
}

@media (max-width: 768px) {
  .categories-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .categories-container {
    grid-template-columns: 1fr;
  }
}

/* Contenedor principal */
.dark .alertas-wrapper {
  background-color: #1e1e1e;
  color: #fff;
}

.dark .categories-container {
  background-color: #2d2d2d;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

/* Cajas de categorías */
.dark .category-box {
  background-color: #383838;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark .category-box:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

/* Textos */
.dark .product-name {
  color: #fff;
}

.dark .product-description {
  color: #b0b0b0;
}

/* Estados específicos en modo oscuro */
.dark .urgente {
  background-color: rgba(231, 76, 60, 0.2);
  border-color: #e74c3c;
}

.dark .urgente .product-status {
  color: #ff6b5b;
}

.dark .atencion {
  background-color: rgba(243, 156, 18, 0.2);
  border-color: #f39c12;
}

.dark .atencion .product-status {
  color: #ffb74d;
}

.dark .normal {
  background-color: rgba(46, 204, 113, 0.2);
  border-color: #2ecc71;
}

.dark .normal .product-status {
  color: #4eed96;
}

/* Hover states */
.dark .category-box:hover.urgente {
  background-color: rgba(231, 76, 60, 0.3);
}

.dark .category-box:hover.atencion {
  background-color: rgba(243, 156, 18, 0.3);
}

.dark .category-box:hover.normal {
  background-color: rgba(46, 204, 113, 0.3);
}

</style>
