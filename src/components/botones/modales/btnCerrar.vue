<template>
  <button id="btnCerrar" class="btn-cerrar">
    {{ texto }}
  </button>

</template>

<script>

export default {
  props: {
    texto: {
      type: String,
      default: "Cerrar"
    }
  }
}
</script>

<style>

.btn-cerrar {
  background-color: #848484;
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

.btn-cerrar:hover {
  background-color: #696969;
}

.btn-cerrar i {
  font-size: 1.2em;
}
</style>