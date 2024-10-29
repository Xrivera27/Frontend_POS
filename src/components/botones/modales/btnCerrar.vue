<template>
  <button id="btnCerrar" class="btn btn-cerrar">
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
.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  cursor: pointer;
}

.btn-cerrar{
  background-color: rgb(129, 129, 129);
  color: white;
}
</style>