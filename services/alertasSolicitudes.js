import solicitudes from './solicitudes.js';
export const getAlerts = async (id_usuario) => {
    try {
        const alertas = await solicitudes.fetchRegistros(`/alertas/get-alertas/${id_usuario}`);

        return alertas;
    } catch (error) {
        console.error('Error al obtener la unidad de medida:', error);

        throw new Error('No se pudo obtener la informacion para el usuario especificado.');
    
    }
}