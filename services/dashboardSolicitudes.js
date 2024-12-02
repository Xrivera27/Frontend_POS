import solicitudes from './solicitudes.js';

export const getTotalVentasDia = async (id_usuario) => {
    try {

        const venta = await solicitudes.fetchRegistros(`/dashboard/ventas/${id_usuario}`);

        return venta;

    } catch (error) {
        console.error('Error al obtener el total ventas de hoy:', error);

        throw new Error('No se pudo obtener el total ventas para el usuario especificado.');
    
    }
}