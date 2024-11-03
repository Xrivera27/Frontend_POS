import solicitudes from './solicitudes.js';

export const getProductosEmpresa = async (id_usuario) => {
    const parametros = `/productos/${id_usuario}`;
    try {
        const response = await solicitudes.fetchRegistros(parametros);

        if (response && Object.keys(response).length > 0) {

            return response; // Retorna el registro creado o la respuesta completa
        } else {
            throw new Error('No se hizo el get');
        }

    } catch (error) {
        console.error('Error en get registro:', error); // Registra el error para depuración
        throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}

export const getInfoExtra = async (id_producto) => {
    const parametros = `/productos/info-extra/${id_producto}`;
    try {

        const response = await solicitudes.fetchRegistros(parametros);

        if (response && Object.keys(response).length > 0) {

            return response; // Retorna el registro creado o la respuesta completa
        } else {
            throw new Error('No se hizo el get');
        }

    } catch (error) {
        console.error('Error en get registro:', error); // Registra el error para depuración
        throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}

export const getProductoSucursal = async (id_sucursal) => {
    const parametros = `/productos/producto-sucursal/${id_sucursal}`;
    try {

        const response = await solicitudes.fetchRegistros(parametros);

            return response; // Retorna el registro creado o la respuesta completa


    } catch (error) {
        console.error('Error en get registro:', error); // Registra el error para depuración
        throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}

export const getStockMinMax = async (id_producto, id_sucursal) => {
    const parametros = `/inventario/${id_producto}/${id_sucursal}`;

    try {
        const response = await solicitudes.fetchRegistros(parametros);

        return response;

    } catch (error) {
        console.error('Error al obtener stock mínimo y máximo:', error);
        
        return { error: 'No se pudo obtener el stock. Inténtalo de nuevo más tarde.' };
    }
}

export const PostStockMinMax = async (id_producto, id_sucursal, stocks) => {
    const parametros = `/inventario/actualizar/${id_producto}/${id_sucursal}`;

    try {
        const response = await solicitudes.postRegistro(parametros, stocks);
        
        if (response instanceof Error) {
            throw new Error('No se hizo el post'); // Retorna el registro creado o la respuesta completa
        } 

        return true;

    } catch (error) {
        console.error('Error al actualizar pstock:', error);
        
        return error;
    }
}



export const postProducto = async (datos) => {
    const parametros = '/productos/crear';
    try {

        const response = await solicitudes.postRegistro(parametros, datos);

        if (response && Object.keys(response).length > 0) {
            console.log(response);
            return response; // Retorna el registro creado o la respuesta completa
        } else {
            throw new Error('No se hizo el post');
        }

    } catch (error) {
        console.error('Error en postProducto:', error); // Registra el error para depuración
        throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}

export const patchProducto = async (datos, id_producto) => {
    console.log(datos);
    const parametros = `/productos/actualizar/${id_producto}`;
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
