<template>
  <div class="alertas-wrapper">
    <PageHeader :titulo="titulo" />

    <div class="categories-container">
      <div class="category-box" v-for="(product, index) in products" :key="index">
        <div class="product-name">{{ product.name }}</div>
        <div class="product-description">Descripción: {{ product.description }}</div>
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
        { name: 'Leche', description: 'Entera 1L' },
        { name: 'Pan', description: 'Integral 500g' },
        { name: 'Huevos', description: 'Docena' },
        { name: 'Manzanas', description: 'Rojas 1kg' },
        { name: 'Cereal', description: 'Avena 250g' },
        { name: 'Yogur', description: 'Natural 150g' },
        { name: 'Arroz', description: 'Blanco 1kg' },
        { name: 'Pasta', description: 'Spaghetti 500g' },
        { name: 'Tomate', description: 'Fresco 1kg' },
        { name: 'Aceite', description: 'Oliva 500ml' },
        { name: 'Azúcar', description: 'Blanca 1kg' },
        { name: 'Sal', description: 'Refinada 500g' },
        { name: 'Jabón', description: 'En barra' },
        { name: 'Detergente', description: 'Líquido 1L' },
        { name: 'Papel higiénico', description: 'Paquete 4 rollos' },
        { name: 'Refresco', description: 'Cola 2L' },
        { name: 'Galletas', description: 'Chocolate 200g' },
        { name: 'Café', description: 'Molido 250g' },
        { name: 'Te', description: 'Verde 100g' },
        { name: 'Queso', description: 'Gouda 200g' },
        { name: 'Pollo', description: 'Pechuga 500g' },
        { name: 'Carne', description: 'Res 1kg' },
        { name: 'Pescado', description: 'Salmón 200g' },
        { name: 'Mantequilla', description: 'Sin sal 250g' }
      ]
    };
  }
};
</script>

<style scoped>
/* Reset básico */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.alertas-wrapper {
  padding: 16px;
  width: 100%;
}

body {
  font-family: Arial, sans-serif;
  background: #f4f4f9;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  min-height: 100vh;
  color: #333;
}

/* Contenedor principal */
.categories-container {
  display: grid;
  margin-top: 1rem;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(100px, auto);
  gap: 15px;
  width: 100%;
  max-width: 1200px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Estilo de cada categoría */
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

/* Título de producto */
.product-name {
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

/* Descripción del producto */
.product-description {
  font-size: 0.9em;
  color: #555;
}

/* Efecto de hover dorado */
.category-box:hover .product-name,
.category-box:hover .product-description {
  color: #928120;
  /* Dorado */
}

/* Responsividad */
@media (max-width: 1200px) {
  .categories-container {
    grid-template-columns: repeat(4, 1fr);
    /* 4 columnas en pantallas medianas */
  }
}

@media (max-width: 992px) {
  .categories-container {
    grid-template-columns: repeat(3, 1fr);
    /* 3 columnas en pantallas medianas */
  }
}

@media (max-width: 768px) {
  .categories-container {
    grid-template-columns: repeat(2, 1fr);
    /* 2 columnas en pantallas pequeñas */
  }
}

@media (max-width: 480px) {
  .categories-container {
    grid-template-columns: 1fr;
    /* 1 columna en pantallas muy pequeñas */
  }
}
</style>