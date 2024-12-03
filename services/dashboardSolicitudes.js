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

export const getClientesPorEmpresa = async (id_usuario) => {
    try {
        const clientes = await solicitudes.fetchRegistros(`/dashboard/clientes/${id_usuario}`);
        
        return clientes;
    } catch (error) {
        console.error('Error al obtener los clientes de la empresa:', error);

        throw new Error('No se pudo obtener los clientes para el usuario especificado.');
    }
};

export const getAlertasPorPromocion = async (id_usuario) => {
    try {
        const response = await solicitudes.fetchRegistros(`/dashboard/alertas-promocion/${id_usuario}`);
        return response;
    } catch (error) {
        console.error('Error al obtener las alertas de promoción:', error);
        throw new Error('No se pudo obtener las alertas de promoción para el usuario especificado.');
    }
};

export const getAlertasPorPromocionProducto = async (id_usuario) => {
    try {
        const response = await solicitudes.fetchRegistros(`/dashboard/promocion-producto/${id_usuario}`);
        return response;
    } catch (error) {
        console.error('Error al obtener las alertas de promoción de producto:', error);
        throw new Error('No se pudo obtener las alertas de promoción de producto para el usuario especificado.');
    }
};

export const getVentasUltimosTresMeses = async (id_usuario) => {
    try {
        const response = await solicitudes.fetchRegistros(`/dashboard/ventas/ultimos-tres-meses/${id_usuario}`);
        return response;
    } catch (error) {
        console.error('Error al obtener las ventas de los últimos tres meses:', error);
        throw new Error('No se pudo obtener el historial de ventas para el usuario especificado.');
    }
};

export const getCategoriasPopulares = async (id_usuario) => {
    try {
        const response = await solicitudes.fetchRegistros(`/dashboard/categorias/mas-vendidas/${id_usuario}`);
        return response;
    } catch (error) {
        console.error('Error al obtener las categorías más vendidas:', error);
        throw new Error('No se pudo obtener las categorías más vendidas para el usuario especificado.');
    }
};

export const getUltimasVentas = async (id_usuario) => {
    try {
        const response = await solicitudes.fetchRegistros(`/dashboard/ventas/ultimas/${id_usuario}`);
        return response;
    } catch (error) {
        console.error('Error al obtener las últimas ventas:', error);
        throw new Error('No se pudieron obtener las últimas ventas');
    }
};