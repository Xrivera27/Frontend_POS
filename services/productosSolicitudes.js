import solicitudes from './solicitudes.js';

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
