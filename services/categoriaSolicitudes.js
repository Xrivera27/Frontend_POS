import solicitudes from './solicitudes.js';

export const getCategoriaProductosEmpresa = async (id_usuario) => {
    try {
        const categorias = await solicitudes.fetchRegistros(`/categoria-producto/${id_usuario}`);

        return categorias;
    } catch (error) {

        console.error('Error al obtener la unidad de medida:', error);

        throw new Error('No se pudo obtener la unidad de medida para el usuario especificado.');
    
    }
}

export const deleteCategoria = async (id_categoria) => {
    try {
        const registroEliminado = await solicitudes.deleteRegistro(`/categoria-producto/eliminar-categoria/${id_categoria}`);

        if (registroEliminado === true){
            return true;
        }
        throw 'Algo salio mal'
    } catch (error) {
        return error;
    }
}