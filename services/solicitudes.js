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
            console.error('Error al obtener sucursales:', error);
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
          console.log(respuesta);

          if (!respuesta.ok){
            throw new Error(`No se pudo crear: ${respuesta.statusText}`);
          }
      
          else return respuesta.ok;
          
        } catch (error) {
          throw new Error(`Ocurrio un error: ${error.message}`);
        }
      }
  }
