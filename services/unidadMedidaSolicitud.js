import solicitudes from './solicitudes.js';

export const getUnidadMedidaEmpresas = async (id_usuario) => {
    try {
        const unidadMedida = await solicitudes.fetchRegistros(`/unidad-medida/${id_usuario}`);
        return unidadMedida;
    } catch (error) {
        console.error('Error al obtener la unidad de medida:', error);

        throw new Error('No se pudo obtener la unidad de medida para el usuario especificado.');
    
    }
};
