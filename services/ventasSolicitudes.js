import solicitudes from './solicitudes.js';

export const getInfoBasic = async (id_usuario) => {
    try {
        const infoBasic = await solicitudes.fetchRegistros(`/ventas/${id_usuario}`);

        return infoBasic;
    } catch (error) {
        console.error('Error al obtener la unidad de medida:', error);

        throw new Error('No se pudo obtener la informacion para el usuario especificado.');
    
    }
}

export const getProductos = async (id_usuario) => {
    try {
        const productos = await solicitudes.fetchRegistros(`/ventas/detalles/${id_usuario}`);

        return productos;
    } catch (error) {
        console.error('Error al obtener los productos:', error);

        throw new Error('No se pudo obtener los productos el usuario especificado.');
    
    }
}

export const agregarProducto = async (cantidad, codigo, id_usuario) => {

    const datos = {
        codigo: codigo,
        cantidad: cantidad
    }

    const parametros = `/ventas/buscar-producto/${id_usuario}`;
    try {

        const response = await solicitudes.patchRegistroProducto(parametros, datos);
        console.log(response);

            return response; 

    } catch (error) {
        console.error('Error en patchProducto:', error); 
        throw error;
    }
}




