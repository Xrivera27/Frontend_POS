import solicitudes from './solicitudes.js';
import { getProductosEmpresa } from './productosSolicitudes.js';

const { getClientesbyEmpresa } = require('./clienteSolicitudes.js');

const { getUsuariosEmpresa } = require('./usuariosSolicitudes');

export const clientesReportes = async (id_usuario) => {
    const datos = await getClientesbyEmpresa(id_usuario);
    let clientes = [];

    datos.forEach(d => {
        clientes.push({
            id: d.id_cliente,
            nombre: d.nombre_completo

        });
    });
    
    return clientes;
    
}

export const sucursalReportes = async (id_usuario) => {
    
    const datos = await solicitudes.fetchRegistros(`/sucursales/empresa/${id_usuario}`);
    let sucursal = [];

    datos.forEach(d => {
        sucursal.push({
            id: d.id_sucursal,
            nombre: d.nombre_administrativo
        });
    });
    
    return sucursal;
    
}

export const reportesProductos = async (id_usuario, esCeo) => {
    let productos = [];
    let datos = [];
    if(esCeo){
        datos = await getProductosEmpresa(id_usuario);
    }
    else{
            datos = await solicitudes.fetchRegistros(`/reporte/productos/${id_usuario}`);
        }

        datos.forEach(d => {
            productos.push({
                id: d.id_producto,
                nombre: d.nombre
            });
        });
    
    return productos;
    
}

export const reportesEmpleados = async (id_usuario, esCeo) => {
    let empleados = [];
    let datos = [];
    if(esCeo){
        datos = await getUsuariosEmpresa(id_usuario);
    }
    else{
            datos = await solicitudes.fetchRegistros(`/reporte/empleados/${id_usuario}`);
        }

        datos.forEach(d => {
            empleados.push({
                id: d.id_usuario,
                nombre: `${d.nombre} ${d.apellido}` 
            });
        });
    
    return empleados;
    
}

export const getRegistrosEmpleados = async (id_usuario) => {
   try {
    const response = solicitudes.fetchRegistros(`/reporte/reporte-empleados/${id_usuario}`);
    return response;
   } catch (error) {
    console.error(error);
    throw 'Ocurrio un error al obtener registros de cajeros';
   }
    
}


