import solicitudes from './solicitudes.js';

export const getSucursalesbyEmmpresaSumm = async (id_usuario) => {
    const parametros = `/sucursales/info-summ/${id_usuario}`;
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

export const getDatosSucursal = async (id_usuario) => {
    try {    
              const sucursalDatos = await solicitudes.fetchRegistros(
                  `/sucursales/sucursal-datos/${id_usuario}`
                );

                return sucursalDatos;
        
            } catch (error) {
              console.log(error);
              throw 'Algo salio mal';
            }
};

export const sucursalSar = async (id_usuario) => {
    const parametros = `/sucursales/sucursal-sar/${id_usuario}`;
    try {

        const response = await solicitudes.fetchEstadoRegistros(parametros);

        console.log(response.status);

        if (response.ok || response.status === 304) {

            return true; // Retorna el registro creado o la respuesta completa

        } else {
            return false;
        }

    } catch (error) {
        console.error('Error en get registro:', error); // Registra el error para depuración
        return false; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}


export const postProducto = async (datos) => {
    const parametros = '/productos/crear';
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
        console.error('Error en postProducto:', error); // Registra el error para depuración
        throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}

// const { codigo_producto, nombre, descripcion, precio_unitario, precio_mayorista, proveedor, unidad_medida, impuesto, id_usuario } = req.body;
//     const id_producto = req.params.id_producto;

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
