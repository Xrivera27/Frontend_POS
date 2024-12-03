<template>
  <button id="btnGuardar" class="btn-guardar">
    {{ texto }}
  </button>

</template>

<script>

export default {
  props: {
    texto: {
      type: String,
      default: "Agregar"
    }
  }
}
</script>

<style>
.btn-guardar {
  background-color: #9b7b44;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.btn-guardar:hover {
  background-color: #735f3c;
}

.btn-guardar i {
  font-size: 1.2em;
}
</style>