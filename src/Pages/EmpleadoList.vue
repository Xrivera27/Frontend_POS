<template>
  <div class="encabezado">
    <h1>Usuarios</h1>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr>

  <div class="empleados-wrapper">
    <div class="opciones">
      <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">Agregar
        Usuario</button>

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar empleado..." />
      </div>

      <div class="registros">
        <span>
          <select class="custom-select" v-model="searchSucursal">
            <option value="default" selected>Todas</option>
            <option v-for="(sucursal, index) in this.sucursales" :key="index" :value="sucursal.id_sucursal">{{
              sucursal.nombre_administrativo }}</option>
          </select>
        </span>
      </div>

    </div>
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Nombre Usuario</th>
            <th>Telefono</th>
            <th>Email</th>
            <th>Rol</th>


            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(empleado, index) in paginatedEmpleados" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ empleado.nombre }}</td>
            <td>{{ empleado.apellido }}</td>
            <td>{{ empleado.nombre_usuario }}</td>
            <td>{{ empleado.telefono }}</td>
            <td>{{ empleado.correo }}</td>
            <td>{{ getRol(empleado.id_rol) }}</td>

            <td>
              <button id="btnEditar" class="btn btn-warning" @click="editEmpleado(index)"><i
                  class="bi bi-pencil-fill"></i></button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteUsuariol(index)"><b><i
                    class="bi bi-x-lg"></i></b></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar o editar empleados -->
    <div v-if="isModalOpen" class="modal">
      <div id="modal-usuario" class="modal-content">
        <h2 class="h2-modal-content">
          {{ isEditing ? "Editar Usuario" : "Agregar Usuario" }}
        </h2>

        <div class="contenedor-principal">
          <div class="contenedor contenedor-izquierdo">
            <div class="form-group">
              <label>Nombre:</label>
              <input v-model="usuarioForm.nombre" type="text" required />
            </div>

            <div class="form-group">
              <label>Apellido:</label>
              <input v-model="usuarioForm.apellido" type="text" required />
            </div>

            <div class="form-group">
              <label>Nombre de Usuario:</label>
              <input v-model="usuarioForm.nombre_usuario" type="text" required />
            </div>
            <div class="form-group">
              <label>Correo:</label>
              <input v-model="usuarioForm.correo" type="text" required />
            </div>


            <div class="form-group">
              <label for="rol">Selecciona rol:</label>
              <select class="form-select" id="rol" name="rol" v-model="usuarioForm.rol">
                <option value="" disabled selected>Selecciona un rol</option>
                <option v-for="(rol, index) in roles" :key="index" :value="rol.id_rol">{{ rol.cargo }}</option>
              </select>
            </div>
          </div>
          <div class="contenedor contenedor-derecho">
            <div class="form-group">
              <label>
                <span class="info-icon" @mouseover="showTooltip = true" @mouseleave="showTooltip = false">ℹ️</span>
                Contraseña:
              </label>
              <input v-model="usuarioForm.password" type="password" required />
              <div v-if="showTooltip" class="tooltip">
                La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una letra minúscula, un
                número y un símbolo.
              </div>
            </div>
            <div class="form-group">
              <label>Confirmar contraseña:</label>
              <input v-model="usuarioForm.confirmPassword" type="password" required />
            </div>
            <div class="form-group">
              <label>Telefono:</label>
              <input v-model="usuarioForm.telefono" type="text" />
            </div>
            <div class="form-group">
              <label>Direccion:</label>
              <input v-model="usuarioForm.direccion" type="text" required />
            </div>

            <div class="form-group">
              <label for="sucursal">Selecciona sucursal:</label>
              <select class="form-select" id="sucursal" name="sucursal" v-model="usuarioForm.sucursal">
                <option value="" disabled selected>Selecciona una sucursal</option>
                <option v-for="(sucursal, index) in sucursales" :key="index" :value="sucursal.id_sucursal">{{
                  sucursal.nombre_administrativo }}</option>
              </select>
            </div>

          </div>
        </div>

        <btnGuardarModal :texto="isEditing ? 'Guardar Cambios' : 'Agregar Usuario'" @click="guardarUsuario">
        </btnGuardarModal>
        <btnCerrarModal :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>
      </div>
    </div>

  </div>

</template>

<script>
import ProfileButton from '../components/ProfileButton.vue';
import btnGuardarModal from '../components/botones/modales/btnGuardar.vue';
import btnCerrarModal from '../components/botones/modales/btnCerrar.vue';
import { useToast } from "vue-toastification"; // Importación para el popup

// importando solicitudes
import solicitudes from "../../services/solicitudes.js";
import validarCamposService from '../../services/validarCampos.js';

export default {
  components: {
    ProfileButton,
    btnGuardarModal,
    btnCerrarModal,

  },
  data() {
    return {
      showTooltip: false,
      searchQuery: '',
      searchSucursal: 'default',
      id_usuario: 0, // Almacena el texto de búsqueda
      isModalOpen: false,
      isEditing: false,
      showPassword: false,
      editIndex: null,
      itemsPerPage: "",
      sucursales: [],
      roles: [],

      usuarioForm: {
        id_usuario: 0,
        nombre: '',
        apellido: '',
        nombre_usuario: '',
        correo: '',
        telefono: '',
        direccion: '',
        sucursal: '',
        password: '',
        confirmPassword: '',
        rol: ''
      },
      empleados: [
      ]
    };
  },
  async mounted() {
    document.title = "Usuarios";
    this.changeFavicon('/img/spiderman.ico');
    // Usar la ruta correcta

    try {
      this.id_usuario = await solicitudes.solicitarUsuario("/sesion-user");

      this.sucursales = await solicitudes.fetchRegistros(
        `/sucursales/empresa/${this.id_usuario}`
      );

      this.empleados = await solicitudes.fetchRegistros(`/usuarios/getBy-empresa/${this.id_usuario}`);

      this.roles = await solicitudes.fetchRegistros('/roles');


    } catch (error) {
      console.log(error); //modal error pendiente
    }
  },
  computed: {
    filteredEmpleados() {
      // Filtra los empleados basados en el texto de búsqueda
      return this.empleados
      .filter(empleado => empleado.sucursales.some( 
        sucursalUser => sucursalUser.id_sucursal == this.searchSucursal || this.searchSucursal === 'default' ))
        .filter(empleado =>
          empleado.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          empleado.apellido.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          empleado.nombre_usuario.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
        
    },

    filterbySucursal(){
      return this.empleados.filter(empleado => empleado.sucursales.some( 
        sucursalUser => sucursalUser.id_sucursal == this.searchSucursal ));
    },

    paginatedEmpleados() {
      // Si itemsPerPage es vacío, mostramos todos los registros, de lo contrario aplicamos la paginación

      if (this.itemsPerPage === "" || this.itemsPerPage === null ) {
        return this.filteredEmpleados;
      } else {
        return this.filteredEmpleados.slice(0, parseInt(this.itemsPerPage));
      }

    },
  },
  methods: {
    /* validarEmpty(formulario) {
       const campos = Object.values(formulario);
       return campos.every(campo => {
         // Verifica si el campo es un string y no está vacío
         if (typeof campo === 'string') {
           return campo.trim() !== '';
         }
         // Verifica si el campo es un valor de selección (select)
         if (typeof campo === 'number' || typeof campo === 'string') {
           return campo !== '' && campo !== null; // Cambia '' por el valor que consideres como "no seleccionado"
         }
         return campo !== null && campo !== undefined; // Asegúrate de que no sea null o undefined
       });
     }, */

    openModal() {
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.clearForm();
    },
    clearForm() {
      this.usuarioForm = {
        id_usuario: '',
        nombre: '',
        apellido: '',
        nombre_usuario: '',
        correo: '',
        telefono: '',
        direccion: '',
        sucursal: '',
        password: '',
        confirmPassword: '',
        rol: ''
      };

      this.isEditing = false;
      this.editIndex = null;
    },

    getRol(id_rol) {
      const rol = this.roles.find(rol => rol.id_rol === id_rol);
      return rol ? rol.cargo : 'Desconocido';
    },

    async guardarUsuario() {
      const toast = useToast();
      let response;
      let parametros;

      const email = this.usuarioForm.correo;
      const password1 = this.usuarioForm.password;
      const password2 = this.usuarioForm.confirmPassword;
      const telefono = this.usuarioForm.telefono;

      // Validaciones
      if (!validarCamposService.validarEmpty(this.usuarioForm)) {
        console.log('Rellene todos los campos');
        toast.warning('Rellene todos los campos');
        return;
      }

      if (!validarCamposService.validarEmail(email)) {
        console.log('El correo no es válido o no pertenece a un dominio aceptado');
        toast.warning('El correo no es válido o no pertenece a un dominio aceptado');
        return;
      }

      if (!validarCamposService.validarPasswordSegura(password1)) {
        console.log('La contraseña no cumple con los requisitos de seguridad');
        toast.error('La contraseña no cumple con los requisitos de seguridad');
        return;
      }

      if (!validarCamposService.validarPass(password1, password2)) {
        console.log('Las contraseñas no coinciden');
        toast.error('Las contraseñas no coinciden');
        return;
      }

      if (!validarCamposService.validarTelefono(telefono)) {
        console.log('El teléfono no es válido');
        toast.error('El teléfono no es válido');
        return;
      }

      // Si todas las validaciones pasan, procede a guardar el usuario
      console.log('Usuario válido, procesando guardado...');
      toast.success('Usuario válido, procesando guardado...');

      if (this.isEditing) {
        try {

          parametros = `/usuario/actualizar/${this.empleados[this.editIndex].id_usuario
            }`;
          response = await solicitudes.patchRegistro(
            parametros,
            this.limpiarForm(this.usuarioForm)
          );

          if (response == true) {

            Object.assign(this.empleados[this.editIndex], this.usuarioForm);
          } else alert(response);
        } catch (error) {
          alert(error);
        }

      } else {

        // const respuesta = await fetch(`http://localhost:3000/api/sucursales/crear-sucursal/${this.id_usuario}/${this.id_empresa}`,
        parametros = `/usuario/crear`;
        try {
          response = await solicitudes.postRegistro(
            parametros,
            this.limpiarForm(this.usuarioForm)
          );

          if (response.length > 0) {

            this.empleados.push(response[0]);

          } else {
            throw response;
          }
        } catch (error) {
          alert(error);
        }

      }
      this.closeModal();
    },

    async deleteUsuariol(index) {
      let response;

      const datosActualizados = {
        estado: false,
      };

      const parametros = `/usuario/desactivar/${this.empleados[index].id_usuario}`;

      try {
        response = await solicitudes.desactivarRegistro(
          parametros,
          datosActualizados
        );

        if (response == true) {
          this.empleados.splice(index, 1);
        }
      } catch (error) {
        alert(new Error(response));
      }
    },

    editEmpleado(index) {
      this.usuarioForm = { ...this.empleados[index] };
      this.isEditing = true;
      this.editIndex = index;
      this.openModal();
    },
    deleteEmpleado(index) {
      this.empleados.splice(index, 1);
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },

    validarCampos(formulario) {
      const toast = useToast();

      if (!validarCamposService.validarPass(this.usuarioForm.password, this.usuarioForm.confirmPassword)) {
        toast.error('Las contraseñas no coinciden');
        return false;
      }

      for (const atributo in formulario) {
        if (!validarCamposService.validarEmpty(formulario[atributo]) && atributo != 'id_usuario') {
          alert(atributo);
          return false;
        }
      }

      return true;

    },

    limpiarForm(formulario) {
      const formLimpio = {
        nombre: formulario.nombre,
        apellido: formulario.apellido,
        nombre_usuario: formulario.nombre_usuario,
        correo: formulario.correo,
        telefono: formulario.telefono,
        direccion: formulario.direccion,
        id_sucursal: formulario.sucursal,
        contraseña: formulario.password,
        id_rol: formulario.rol,
      }
      return formLimpio;
    },
    changeFavicon(iconPath) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
    },
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
}

.info-icon {
  cursor: pointer;
  margin-right: 5px;
  /* Espacio entre el ícono y el texto */
  vertical-align: middle;
  /* Alinea el ícono verticalmente con el texto */
  position: relative;
  /* Para que el tooltip se posicione en relación a este ícono */
}

.tooltip {
  display: inline-block;
  position: absolute;
  /* Cambiar a absolute para posicionarlo relativo al ícono */
  left: 20px;
  /* Ajusta este valor para que el tooltip esté justo al lado del ícono */
  top: 0;
  /* Alinea el tooltip verticalmente con el ícono */
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px;
  z-index: 1000;
  /* Asegúrate de que el tooltip esté por encima de otros elementos */
  width: 250px;
  /* Ajusta el ancho según sea necesario */
  margin-top: 5px;
  /* Espacio entre el ícono y el tooltip */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* aqui empieza */
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
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 20px;
  border-radius: 4px;
}

#modal-usuario {
  max-width: 60%;
  min-width: 500px;
  justify-content: center;
  align-items: center;
}

.h2-modal-content {
  margin-top: 0;
}

#AddUsuarioModal,
#BtnCerrar {
  width: 80%;
}

/* Contenedores */
.contenedor-principal {
  display: flex;
  width: 100%;
  justify-content: space-around;
}

.contenedor {
  width: 45%;
}

/* Formularios */
.form-group {
  margin-bottom: 16px;
  position: relative;
}

.form-group label {
  display: flexbox;
  margin-bottom: 8px;
}

.form-group-select {
  min-width: 80%;
  display: flexbox;
  flex-direction: row;

}

.form-group input {
  width: 95%;
  height: 25%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  justify-content: center;
}

.stock-group {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.stock-group label {
  margin: 5px;
}

/* Selectores */
.form-select {
  width: 100%;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  padding: 8px 16px;
}

/* Botones */
.btn {
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.btn-success {
  min-height: 80px;
  max-width: 90px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #066bd8;
  color: white;
}

.btn-warning {
  background-color: #ffc107;
  color: black;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

/* Botón registrar usuario */
#registrar-usuario {
  background-color: rgb(253, 253, 56);
  margin-left: 30px;
  height: 50px;
}

#registrar-usuario:hover {
  background-color: rgb(228, 228, 48);
  transform: scale(1.05);
  transition: all 0.3s ease;
}

/* Categorías */
.form-categoria {
  display: flex;
  flex-direction: column;
}

#proveedor-contenedor {
  display: flex;
  align-items: center;
}

/* Modal de categorías */
.modal-content-categoria {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 30%;
  height: 72%;
  min-height: 500px;
  min-width: 300px;
}

.form-form-categoria {
  padding: 20px;
  padding-top: 0;
  height: 240px;
  overflow-y: scroll;
}

.categoria-botones {
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: space-evenly;
}

.categoria-encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}


/* aqui termina el modal */

.encabezado {
  display: flex;
  justify-content: space-between;
}

.opciones {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.busqueda {
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
  min-width: 350px;
}

.registros {
  display: flexbox;
  height: 100%;
  align-items: end;
}

#btnAdd {
  background-color: #c09d62;
  font-size: 16px;
  width: 170px;
  height: 40px;
  border-radius: 10px;
  color: black;
  font-weight: bold;
}

.export-button {
  margin: 0;
}


.opciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.h2-modal-content {
  margin-top: 0px
}

#btnAdd:hover {
  background-color: #a38655;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#btnEditar {
  font-size: 18px;
  width: 50px;
  height: 40px;
  border-radius: 10px;
}

#btnEditar:hover {
  background-color: #e8af06;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#btnEliminar {
  font-size: 18px;
  width: 50px;
  height: 40px;
  border-radius: 10px;
  color: black;
}

#btnEliminar:hover {
  background-color: #b72433;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#campana {
  margin-right: 10px;
  font-size: 18px;
  color: #a38655;
}

.container-top {
  width: 100%;
  text-align: right;
}

.rol {
  color: #969696;
  font-size: 14px;
}

.empleados-wrapper {
  padding: 16px;
}


.table-container {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #ddd;
  margin-top: 16px;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th,
.table td {
  padding: 8px;
}

.table thead th {
  background-color: none;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.table tbody td {
  text-align: center;
  border-top: 1px solid #ddd;
}

.table thead th:first-child {
  border-top-left-radius: 10px;
}

.table thead th:last-child {
  border-top-right-radius: 10px;
}

.table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 10px;
}

.table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 10px;
}

#AddEmpleadoModal {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  cursor: pointer;
  margin-right: 1rem;
}

button {
  cursor: pointer;
}

.custom-select {
  border: 1px solid #ccc;
  border-radius: 5px;

  font-size: 16px;
  padding: 10px;
  background-color: #fff;
  cursor: pointer;
  width: 60%;
  min-width: 400px;
  /* Ajusta el ancho a 120px o el valor que prefieras */
}

.custom-select:focus {
  outline: none;
  border-color: #a38655;
  /* Ajusta el color del borde al de tu diseño */
}

.custom-select option {
  font-size: 16px;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  width: 95%;
  height: 25%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  justify-content: center;
}

.password-wrapper .toggle-password {
  position: absolute;
  right: 1.3rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #aaa;
}

.password-wrapper .toggle-password:hover {
  color: #000;
}
</style>