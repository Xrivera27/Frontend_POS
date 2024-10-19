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
    }


  }

// async fetchSucursal() {
//     try {
//       console.log(this.id_usuario);
//         const response = await fetch(`http://localhost:3000/api/sucursales/usuario/${this.id_usuario}`);
        
//         if (!response.ok) {
//             throw new Error(`Error: ${response.status}`);
//         }

//         const data = await response.json();
//         this.sucursales = data;
//        console.log(response);
        

//     } catch (error) {
//         console.error('Error al obtener Sucursal:', error); // Manejo de errores
//     }
// },
// async patchSucursal(index, datosActualizados){
//   try {
//     const respuesta = await fetch(`http://localhost:3000/api/sucursales/actualizar-sucursal/${this.sucursales[index].id_sucursal}`,
//     {
//       method: 'PATCH',
//       headers: {
//       'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(datosActualizados)
//     });

//     if (!respuesta.ok){
//       throw new Error(`No se pudo actualizar: ${respuesta.statusText}`);
//     }

//     else return respuesta.ok;
//   } catch (error) {
//     throw new Error(`Ocurrio un error: ${error}`);
//   }
// },

// async desactivarSucursal(index){
//   const datosActualizados = {
//     estado: false
//   };
//   try {
//     const respuesta = await fetch(`http://localhost:3000/api/sucursales/desactivar-sucursal/${this.sucursales[index].id_sucursal}`,
//     {
//       method: 'PATCH',
//       headers: {
//       'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(datosActualizados)
//     });

//     if (!respuesta.ok){
//       throw new Error(`No se pudo actualizar: ${respuesta.statusText}`);
//     }

//     else return respuesta.ok;
//   } catch (error) {
//     throw new Error(`Ocurrio un error: ${error.statusText}`);
//   }
// },

// async postSucursal(datosNuevos){
//   try {
//     const respuesta = await fetch(`http://localhost:3000/api/sucursales/crear-sucursal/${this.id_usuario}/${this.id_empresa}`,
//     {
//       method: 'POST',
//       headers: {
//       'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(datosNuevos)
//     });

//     if (!respuesta.ok){
//       throw new Error(`No se pudo actualizar: ${respuesta.statusText}`);
//     }

//     else return respuesta.ok;
//   } catch (error) {
//     throw new Error(`Ocurrio un error: ${error.message}`);
//   }
// }