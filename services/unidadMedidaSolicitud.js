import solicitudes from './solicitudes.js';

export const getUnidadMedidaEmpresas = async (id_usuario) => {
    try {
        const unidadMedida = await solicitudes.fetchRegistros(`/unidad-medida/${id_usuario}`);

        if( unidadMedida.length > 0 ){
            for (const  unidad  of unidadMedida){
              unidad.totalProductos = await getUnidadProducto(unidad.id_medida);
              console.log(unidad);
            }
        }

        return unidadMedida;
    } catch (error) {
        console.error('Error al obtener la unidad de medida:', error);

        throw new Error('No se pudo obtener la unidad de medida para el usuario especificado.');
    
    }
}

export const getUnidadProducto = async (id_unidad) => {
    try {
        const totalUnidad = await solicitudes.fetchRegistros(`/unidad-medida/totalp-unidad/${id_unidad}`);
        console.log(`total de unidad ${totalUnidad.total}`);
        return totalUnidad.total;
    } catch (error) {
        console.error('Error al obtener la unidad de medida:', error);

        throw new Error('No se pudo obtener la unidad de medida para el usuario especificado.');
    
    }
}

export const postUnidad = async (datos) => {
    const parametros = '/unidad-medida/crearunidad';
    try {

        const response = await solicitudes.postRegistro(parametros, datos);

    console.log(`Response: ${response}`);
        if (response && Object.keys(response).length > 0) {
            console.log(response);
            return response; // Retorna el registro creado o la respuesta completa
        } else {
            throw new Error('No se hizo el post');
        }

    } catch (error) {
        console.error('Error en postUnidad:', error); // Registra el error para depuración
        throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}

export const patchUnidad = async (datos, id_unidad_medida) => {
    console.log(datos);
    const parametros = `/unidad-medida/actualizarunidad/${id_unidad_medida}`;
    try {

        const response = await solicitudes.patchRegistro(parametros, datos);
        console.log(response);
        if (response && response == true) {

            return response; // Retorna el registro creado o la respuesta completa
        } else {
            throw new Error('No se hizo el patch');
        }

    } catch (error) {
        console.error('Error en patchProducto:', error); // Registra el error para depuración
        throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}

export const desactivarProducto = async (id_producto) => {
    const datos = {
        estado: false
    };
    const parametros = `/productos/desactivar/${id_producto}`;
    try {
        const response = await solicitudes.desactivarRegistro(parametros, datos);
        console.log(response);
        if (response && response == true) {

            return response; // Retorna el registro creado o la respuesta completa
        } else {
            throw new Error('No se hizo el patch');
        }

    } catch (error) {
        console.error('Error en Producto:', error); // Registra el error para depuración
        throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}
