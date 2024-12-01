import solicitudes from './solicitudes.js';

export const esCeo = async (id_usuario) => {
    try {
        const id_rol = await solicitudes.fetchRegistros(`/usuario/get-rol/${id_usuario}`);

        if( id_rol === 4 ){
            return true;
        }
        else{
            return false;
        }
    } catch (error) {
        console.error('Error al obtener la unidad de medida:', error);

        throw new Error('No se pudo obtener la unidad de medida para el usuario especificado.');
    }

}

export const getUsuariosEmpresa = async (id_usuario) => {
    const parametros = `/usuarios/getBy-empresa/${id_usuario}`;
    try {
        const response = await solicitudes.fetchRegistros(parametros);

            return response; // Retorna el registro creado o la respuesta completa
        

    } catch (error) {
        console.error('Error en get registro:', error); // Registra el error para depuración
        throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}

export const getUsuariosSucrusal = async (id_usuario, id_sucursal) => {
    const parametros = `/usuarios/getBy-sucursal/${id_usuario}/${id_sucursal}`;
    try {
        const response = await solicitudes.fetchRegistros(parametros);

            return response; // Retorna el registro creado o la respuesta completa

    } catch (error) {
        console.error('Error en get registro:', error); // Registra el error para depuración
        throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}

export const getRolesUsuarioPage = async () => {
    const parametros = '/roles';
    try {
        const response = await solicitudes.fetchRegistros(parametros);

        const filtroRoles = response.filter(r => r.id_rol !== 4 && r.id_rol !== 2 );
        

            return filtroRoles; // Retorna el registro creado o la respuesta completa
        
    } catch (error) {
        console.error('Error en get registro:', error); // Registra el error para depuración
        throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}

// export const postProducto = async (datos) => {
//     const parametros = '/productos/crear';
//     try {

//         const response = await solicitudes.postRegistro(parametros, datos);

//         if (response && Object.keys(response).length > 0) {
//             console.log(response);
//             return response; // Retorna el registro creado o la respuesta completa
//         } else {
//             throw new Error('No se hizo el post');
//         }

//     } catch (error) {
//         console.error('Error en postProducto:', error); // Registra el error para depuración
//         throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
//     }
// }

// export const patchProducto = async (datos, id_producto) => {
//     console.log(datos);
//     const parametros = `/productos/actualizar/${id_producto}`;
//     try {

//         const response = await solicitudes.patchRegistro(parametros, datos);
//         console.log(response);
//         if (response && response == true) {

//             return response; // Retorna el registro creado o la respuesta completa
//         } else {
//             throw new Error('No se hizo el patch');
//         }

//     } catch (error) {
//         console.error('Error en patchProducto:', error); // Registra el error para depuración
//         throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
//     }
// }

// export const desactivarProducto = async (id_producto) => {
//     const datos = {
//         estado: false
//     };
//     const parametros = `/productos/desactivar/${id_producto}`;
//     try {
//         const response = await solicitudes.desactivarRegistro(parametros, datos);
//         console.log(response);
//         if (response && response == true) {

//             return response; // Retorna el registro creado o la respuesta completa
//         } else {
//             throw new Error('No se hizo el patch');
//         }

//     } catch (error) {
//         console.error('Error en Producto:', error); // Registra el error para depuración
//         throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
//     }
// }


