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

export const getVentasGuardadas = async (id_usuario) => {
    try {
        const ventas = await solicitudes.fetchRegistros(`/ventas/mostrar-ventas/${id_usuario}`);

        return ventas;
    } catch (error) {
        console.error('Error al obtener los productos:', error);

        throw new Error('No se pudo obtener los productos el usuario especificado.');
    
    }
}

export const agregarProductoCodigo = async (cantidad, codigo, id_usuario) => {

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

export const eliminarProductoVenta = async (id_producto, id_usuario) => {

    const datos = {
        id_producto:id_producto
    }

    const parametros = `/ventas/eliminar-producto/${id_usuario}`;
    try {

        const response = await solicitudes.patchRegistroProducto(parametros, datos);
        console.log(response);

            return response; 

    } catch (error) {
        console.error('Error en patchProducto:', error); 
        throw error;
    }
}

export const borrarProductoVenta = async (id_usuario, id_producto) => {

    const datos = {
        id_producto: id_producto
    }

    const parametros = `/ventas/eliminar-producto/${id_usuario}`;
    try {

        const response = await solicitudes.patchRegistroProducto(parametros, datos);

            return response; 

    } catch (error) {
        console.error('Error en patchProducto:', error); 
        throw error;
    }
}

export const guardarVenta = async (nombre_completo, id_usuario) => {
    const parametros = `/ventas/guardar-venta/${id_usuario}`;

    const datos = {
        nombre_completo: nombre_completo
    }

    try {
        const response = await solicitudes.postRegistro(parametros, datos);

        return response;

    } catch (error) {
        console.error('Error en guardar Venta:', error);
        throw error;
    }
}

export const postVenta = async (productos, id_cliente, id_usuario) => {
    const parametros = `/ventas/confirmar/${id_usuario}`;

    const datos = {
        productos: productos
    }

    if(id_cliente !== 0 && id_cliente !== null){
        datos.id_cliente = id_cliente;
    }
    try {

        const response = await solicitudes.postRegistro(parametros, datos);


        return response;

    } catch (error) {
        console.error('Error en postUnidad:', error); // Registra el error para depuración
        throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}

export const pagar = async (pago, id_venta, id_usuario) => {

    const datos = {
        id_venta: id_venta,
        pago: pago,
        id_usuario: id_usuario
    }

    const parametros = `/ventas/pagar-efectivo`;
    try {

        const response = await solicitudes.patchRegistro(parametros, datos);

        if (response && response == true) {

            return response; // Retorna el registro creado o la respuesta completa
        } else {
            throw new Error('No se hizo el patch');
        }

    } catch (error) {
        console.error('Error al registrar pago de venta:', error); // Registra el error para depuración
        throw error; // Opcional: vuelve a lanzar el error para manejarlo en otro lugar
    }
}




