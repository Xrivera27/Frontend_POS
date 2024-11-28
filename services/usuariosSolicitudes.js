import solicitudes from './solicitudes.js';

// export const getUnidadMedidaEmpresas = async (id_usuario) => {
//     try {
//         const unidadMedida = await solicitudes.fetchRegistros(`/unidad-medida/${id_usuario}`);

//         if( unidadMedida.length > 0 ){
//             for (const  unidad  of unidadMedida){
//               unidad.totalProductos = await getUnidadProducto(unidad.id_medida);

//             }
//         }

//         return unidadMedida;
//     } catch (error) {
//         console.error('Error al obtener la unidad de medida:', error);

//         throw new Error('No se pudo obtener la unidad de medida para el usuario especificado.');
    
//     }

    
// }

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

