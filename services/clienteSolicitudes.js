import solicitudes from './solicitudes.js';


export const getClientesbyEmpresa = async (id_usuario) => {
    const parametros = `/clientes/${id_usuario}`;
    try {

        const response = await solicitudes.fetchRegistros(parametros);

            return response; // Retorna el registro creado o la respuesta completa

    } catch (error) {
        console.error('Error en get registro:', error); // Registra el error para depuración
        throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}

export const postCliente = async (datos, id_usuario) => {
try {
    const response = await solicitudes.postRegistro(`/clientes/crear-cliente/${id_usuario}`, datos);

    if (response && Object.keys(response).length > 0) {

        return response; // Retorna el registro creado o la respuesta completa
    } else {
        throw new Error('No se hizo el post');
    }

} catch (error) {
    console.error('Error en postCliente:', error); // Registra el error para depuración
    throw error; 
}
}

export const patchCliente = async (datos, id_cliente) => {
    console.log(datos);
    const parametros = `/clientes/actualizar-cliente/${id_cliente}`;
    try {

        const response = await solicitudes.patchRegistro(parametros, datos);
        console.log(response);
        if (response && response == true) {

            return response; // Retorna el registro creado o la respuesta completa
        } else {
            throw new Error('No se hizo el patch');
        }

    } catch (error) {
        console.error('Error en patchUnidad:', error); // Registra el error para depuración
        throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}

export const desactivarCliente = async (id_cliente) => {
    const datos = {
        estado: false
    };
    const parametros = `/clientes/desactivar-cliente/${id_cliente}`;
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