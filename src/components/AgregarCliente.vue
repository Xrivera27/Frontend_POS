<template>
  <button id="crear-cliente" class="btn btn-success" type="button" @click="openModal"><b><i
        class="bi bi-plus-circle-fill"></i></b>
  </button>

  <div v-if="isModalOpen" class="modal">
    <div class="modal-content">
      <h2 class="h2-modal-content">{{ isEditing ? 'Editar Cliente' : 'Agregar Cliente' }}</h2>

      <div class="form-group">
        <label>Nombre Completo:</label>
        <input v-model="clienteForm.nombre" type="text" required>
      </div>

      <div class="form-group">
        <label>RTN:</label>
        <input v-model="clienteForm.rtn" type="text" required>
      </div>

      <div id="form-tel" class="form-group">
        <label>Teléfono:</label>
        <input v-model="clienteForm.telefono" type="text">
      </div>

      <div class="form-group">
        <label>Email:</label>
        <input v-model="clienteForm.email" type="text">
      </div>

      <div class="form-group">
        <label>Dirección:</label>
        <input v-model="clienteForm.direccion" type="text">
      </div>

      <button id="AddClienteModal" class="btn btn-primary" @click="guardarCliente">
        {{ isEditing ? 'Guardar Cambios' : 'Agregar Cliente' }}
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
      clienteForm: {
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        rtn: '',
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
      this.clienteForm = {
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        rtn: '',
      };
      this.isEditing = false;
      this.editIndex = null;
    },

    guardarCliente() {
      /*
      if (this.isEditing) {
        this.clientees[this.editIndex] = { ...this.clienteForm };
      } else {
        this.clientees.push({ ...this.clienteForm });
      }
      this.closeModal();
      */
    },

  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
}

.container-top {
  width: 100%;
  text-align: right;
}

.rol {
  color: #969696;
  font-size: 14px;
}

select {
  border: 1px solid #ccc;
  margin-top: 10px;
  margin-left: 5px;
  margin-right: 5px;
  width: 60px;
  height: 35px;
  border-radius: 5px;
}

.clientees-wrapper {
  padding: 16px;
}

.btn {
  padding: 0.35rem;
  font-size: 17px;
  margin-left: 4px;
  height: 25%;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.h2-modal-content {
  margin-top: 0px;
}

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

.form-group {
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-bottom: 16px;
}

.form-group label {
  margin-bottom: 8px;
}

.form-group input {
  width: 95%;
  height: 25%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

#AddClienteModal {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  cursor: pointer;
  margin-right: 1rem;
}

#BtnCerrar {
  background-color: rgb(93, 100, 104);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  color: #fff;
  cursor: pointer;
  margin-right: 1rem;
}
</style>
