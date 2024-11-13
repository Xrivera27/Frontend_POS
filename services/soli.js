import axios from 'axios';
const homeUrl = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export default {
  async solicitarUsuario(parametros) {
    try {
      const url = `${homeUrl}${parametros}`;
      const headers = getAuthHeaders();
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data[0].id_usuario;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  },

  async solicitarUsuarioToken() {
    try {
      const headers = getAuthHeaders();
      const url = `${homeUrl}/usuarios`;
      const response = await axios.get(url, { headers });
      return response.data.id_usuario;
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
      throw new Error('No se pudo obtener la información del usuario.');
    }
  },

  async fetchRegistros(parametros) {
    try {
      const url = `${homeUrl}${parametros}`;
      const headers = getAuthHeaders();
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener registros:', error);
      throw error;
    }
  },

  async fetchEstadoRegistros(parametros) {
    try {
      const url = `${homeUrl}${parametros}`;
      const headers = getAuthHeaders();
      return await fetch(url, { headers });
    } catch (error) {
      console.error('Error al obtener registros:', error);
      throw error;
    }
  },

  async patchRegistro(parametros, datosActualizados) {
    try {
      const url = `${homeUrl}${parametros}`;
      const headers = getAuthHeaders();
      const respuesta = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(datosActualizados)
      });

      if (!respuesta.ok) {
        throw new Error(`No se pudo actualizar: ${respuesta.statusText}`);
      }

      return respuesta.ok;
    } catch (error) {
      throw new Error(`Ocurrió un error: ${error}`);
    }
  },

  async patchRegistroProducto(parametros, datosActualizados) {
    try {
      const url = `${homeUrl}${parametros}`;
      const headers = getAuthHeaders();
      const respuesta = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(datosActualizados)
      });

      if (!respuesta.ok) {
        throw new Error(`No se pudo actualizar: ${respuesta.statusText}`);
      }

      return await respuesta.json();
    } catch (error) {
      throw new Error(`Ocurrió un error: ${error}`);
    }
  },

  async desactivarRegistro(parametros, datosActualizados) {
    try {
      const url = `${homeUrl}${parametros}`;
      const headers = getAuthHeaders();
      const respuesta = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(datosActualizados)
      });

      if (!respuesta.ok) {
        throw new Error(`No se pudo actualizar: ${respuesta.statusText}`);
      }

      return respuesta.ok;
    } catch (error) {
      throw new Error(`Ocurrió un error: ${error.statusText}`);
    }
  },

  async postRegistro(parametros, datosNuevos) {
    try {
      const url = `${homeUrl}${parametros}`;
      const headers = getAuthHeaders();
      const respuesta = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(datosNuevos)
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        // Crear un objeto de error personalizado que incluye tanto el status como los datos
        const error = new Error(data.error || 'Error en la solicitud');
        error.response = {
          status: respuesta.status,
          data: data
        };
        throw error;
      }

      return data;
    } catch (error) {
      // Si el error ya tiene la estructura que necesitamos, lo propagamos
      if (error.response) {
        throw error;
      }
      // Si no, creamos un nuevo error con la estructura correcta
      const customError = new Error(error.message);
      customError.response = {
        status: error.status || 500,
        data: { error: error.message }
      };
      throw customError;
    }
  },

  async deleteRegistro(parametros) {
    try {
      const url = `${homeUrl}${parametros}`;
      const headers = getAuthHeaders();
      const response = await fetch(url, { 
        method: 'DELETE',
        headers 
      });

      if (!response.ok) {
        throw new Error('No se eliminó el registro ' + response.status);
      }

      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};