<template>
  <button id="crear-proveedor" class="btn btn-success" type="button" @click="openModal"><b><i
        class="bi bi-plus-circle-fill"></i></b>
  </button>

  <div v-if="isModalOpen" class="modal">
    <div class="modal-content">
      <h2 class="h2-modal-content">{{ isEditing ? 'Editar Proveedor' : 'Agregar Proveedor' }}</h2>

      <div class="form-group">
        <label>Nombre:</label>
        <input v-model="proveedorForm.nombre" type="text" required>
      </div>

      <div id="form-tel" class="form-group">
        <label>Teléfono:</label>
        <input v-model="proveedorForm.telefono" type="text" required>
      </div>

      <div class="form-group">
        <label>Email:</label>
        <input v-model="proveedorForm.email" type="text" required>
      </div>

      <div class="form-group">
        <label>Dirección:</label>
        <input v-model="proveedorForm.direccion" type="text" required>
      </div>

      <button id="AddProveedorModal" class="btn btn-primary" @click="guardarProveedor">
        {{ isEditing ? 'Guardar Cambios' : 'Agregar Proveedor' }}
      </button>
      <button id="BtnCerrar" class="btn btn-secondary" @click="closeModal">Cerrar</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '', // Almacena el texto de búsqueda
      isModalOpen: false,
      isEditing: false,
      editIndex: null,
      itemsPerPage: "",
      proveedorForm: {
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
      },
    };
  },
  methods: {
    openModal() {
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.clearForm();
    },
    clearForm() {
      this.proveedorForm = {
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
      };
      this.isEditing = false;
      this.editIndex = null;
    },

    guardarProveedor() {
      /*
      if (this.isEditing) {
        this.proveedores[this.editIndex] = { ...this.proveedorForm };
      } else {
        this.proveedores.push({ ...this.proveedorForm });
      }
      this.closeModal();
      */
    },
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

/* General */
* {
  font-family: 'Montserrat', sans-serif;
}

/* Contenedores */
.container-top {
  width: 100%;
  text-align: right;
}

.proveedores-wrapper {
  padding: 16px;
}

/* Estilos de Rol */
.rol {
  color: #969696;
  font-size: 14px;
}

/* Estilos del Select */
select,
.custom-select {
  border: 1px solid #ccc;
  border-radius: 5px;
  height: 35px;
  font-size: 16px;
  padding: 5px;
  background-color: #fff;
  cursor: pointer;
  width: 80px;
}

select {
  margin-top: 10px;
  margin-left: 5px;
  margin-right: 5px;
  width: 60px;
}

.custom-select:focus {
  outline: none;
  border-color: #a38655;
}

.custom-select option {
  font-size: 16px;
}

/* Botones */
.btn {
  padding: 0.35rem;
  font-size: 17px;
  margin-left: 4px;
  height: 25%;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

#AddProveedorModal,
#BtnCerrar {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  color: #fff;
  cursor: pointer;
  margin-right: 1rem;
}

#AddProveedorModal {
  background-color: #007bff;
}

#AddProveedorModal:hover {
  background-color: #066bd8;
}

#BtnCerrar {
  background-color: rgb(93, 100, 104);
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  max-width: 500px;
  width: 100%;
}

.h2-modal-content {
  margin-top: 0px;
}

/* Formularios */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: flexbox;
  margin-bottom: 8px;
}

.form-group input {
  width: 95%;
  height: 25%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  justify-content: center;
}
</style>
