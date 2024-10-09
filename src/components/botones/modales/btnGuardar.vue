<template>
<button id="btnGuardar" class="btn btn-primary">
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
.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}
</style>