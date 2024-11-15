import axios from 'axios';
  const homeUrl = 'http://localhost:3000/api';
 // const nextUrl = '/sesion-user';

 

  export default  {
    async solicitarUsuario (parametros)  {
        try {
            const url = `${homeUrl}${parametros}`;
            const response = await fetch(url);
    
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
    
            const data = await response.json();
    
            return data[0].id_usuario;
    
        } catch (error) {
            console.error('Error al obtener usuario:', error); // Manejo de errores
            throw error;
        }
    },

    async solicitarUsuarioToken(){
      try {
        const token = localStorage.getItem('auth'); // Usa 'auth' para obtener el token
        const url = `${homeUrl}/usuarios`;
    
        const response = await axios.get(url, { // Cambia a '/usuarios'
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
    
        const userData = response.data;
    
        const id_usuario = userData.id_usuario;

        return id_usuario;
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        alert('No se pudo obtener la información del usuario.'); // Mensaje para el usuario
      }
    },

    async fetchRegistros(parametros) {
        try {
            const url = `${homeUrl}${parametros}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
    
            const data = await response.json();
            return data;
    
        } catch (error) {
            console.error('Error al obtener registros:', error);
            throw error; // Manejo de errores
        }
    },

    async fetchEstadoRegistros(parametros) {
      try {
          const url = `${homeUrl}${parametros}`;
          const response = await fetch(url);
          
          return response;
  
      } catch (error) {
          console.error('Error al obtener registros:', error);
          throw error; // Manejo de errores
      }
  },

    async patchRegistro(parametros, datosActualizados){
        try {

            const url = `${homeUrl}${parametros}`;
          const respuesta = await fetch(`${url}`,
          {
            method: 'PATCH',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizados)
          });
      
          if (!respuesta.ok){
            throw new Error(`No se pudo actualizar: ${respuesta.statusText}`);
          }
      
          else return respuesta.ok;
        } catch (error) {
          throw new Error(`Ocurrio un error: ${error}`);
        }
      },

      async patchRegistroProducto(parametros, datosActualizados){
        try {

            const url = `${homeUrl}${parametros}`;
          const respuesta = await fetch(`${url}`,
          {
            method: 'PATCH',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizados)
          });
      
          if (!respuesta.ok){
            throw new Error(`No se pudo actualizar: ${respuesta.statusText}`);
          }
      
          else return respuesta.json();
        } catch (error) {
          throw new Error(`Ocurrio un error: ${error}`);
        }
      },

      async desactivarRegistro(parametros, datosActualizados){
        try {
            const url = `${homeUrl}${parametros}`;
          const respuesta = await fetch(`${url}`,
          {
            method: 'PATCH',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizados)
          });
      
          if (!respuesta.ok){
            throw new Error(`No se pudo actualizar: ${respuesta.statusText}`);
          }
      
          else return respuesta.ok;
        } catch (error) {
          throw new Error(`Ocurrio un error: ${error.statusText}`);
        }
      },

      async postRegistro(parametros, datosNuevos){
        const url = `${homeUrl}${parametros}`;
        try {
          const respuesta = await fetch(`${url}`,
          {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosNuevos)
          });
          
          if (!respuesta.ok){
            throw new Error(`No se pudo crear: ${respuesta.statusText}`);
          }
          
          else {
            
            const nuevoRegistro = await respuesta.json();
            // console.log(nuevoRegistro);
            return nuevoRegistro;
          }
          
        } catch (error) {
          throw new Error(`Ocurrio un error: ${error.message}`);
        }
      },
      async deleteRegistro(parametros){
        const url = `${homeUrl}${parametros}`;
        try {
          const response = await fetch(url, { method: 'DELETE'});

          if (response.ok){
            return true;
          }
          else {
            throw new Error('No se elimino el registro ' + response.status);
          }

        } catch (error) {
          console.log(error);
          return error;
        }
      }
  }
