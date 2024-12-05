import solicitudes from './solicitudes.js';
import { getProductosEmpresa } from './productosSolicitudes.js';

const { getClientesbyEmpresa } = require('./clienteSolicitudes.js');

const { getUsuariosEmpresa } = require('./usuariosSolicitudes');

const { getDatosEmpresas } = require('./empresaSolicitudes.js');

const { getDatosSucursal } = require('./sucursalesSolicitudes.js');

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

export const getRegistrosEmpleados = async (id_usuario, fechaInicio, fechaFin) => {
   try {
    const response = solicitudes.fetchRegistros(`/reporte/reporte-empleados/${id_usuario}/${fechaInicio}/${fechaFin}`);
    return response;
   } catch (error) {
    console.error(error);
    throw 'Ocurrio un error al obtener registros de cajeros';
   }
    
}

export const getRegistrosClientes = async (id_usuario, fechaInicio, fechaFin) => {
    try {
     const response = solicitudes.fetchRegistros(`/reporte/reporte-clientes/${id_usuario}/${fechaInicio}/${fechaFin}`);
     return response;
    } catch (error) {
     console.error(error);
     throw 'Ocurrio un error al obtener registros de cajeros';
    }
     
 }

 export const getRegistrosSucursales = async (id_usuario, fechaInicio, fechaFin) => {
    try {
     const response = solicitudes.fetchRegistros(`/reporte/reporte-sucursales/${id_usuario}/${fechaInicio}/${fechaFin}`);
     return response;
    } catch (error) {
     console.error(error);
     throw 'Ocurrio un error al obtener registros de cajeros';
    }
     
 }

 export const getRegistrosEmpleadosDesglose = async (id_usuario, fechaInicio, fechaFin) => {
    try {
     const response = solicitudes.fetchRegistros(`/reporte/reporte-empleado-desglose/${id_usuario}/${fechaInicio}/${fechaFin}`);
     return response;
    } catch (error) {
     console.error(error);
     throw 'Ocurrio un error al obtener registros de cajeros';
    }
     
 }

 export const getRegistrosClienteDesglose = async (id_cliente, fechaInicio, fechaFin) => {
    try {
     const response = solicitudes.fetchRegistros(`/reporte/reporte-cliente-desglose/${id_cliente}/${fechaInicio}/${fechaFin}`);
     return response;
    } catch (error) {
     console.error(error);
     throw 'Ocurrio un error al obtener registros de cajeros';
    }
     
 }

 export const getRegistrosSucursalDesglose = async (id_sucursal, fechaInicio, fechaFin) => {
    try {
     const response = solicitudes.fetchRegistros(`/reporte/reporte-sucursal-desglose/${id_sucursal}/${fechaInicio}/${fechaFin}`);
     return response;
    } catch (error) {
     console.error(error);
     throw 'Ocurrio un error al obtener registros de cajeros';
    }
     
 }

 export const getDatosInstitucion = async (id_usuario, esCeo) => {
    let datosInstitucion;
    try {
       if(esCeo){
       const response = await getDatosEmpresas(id_usuario);
       datosInstitucion = {
        nombre: response.nombre,
        correo: response.correo_principal,
        telefono: response.telefono_principal,
        direccion: response.direccion
       }
       }
       else{
        const response = await getDatosSucursal(id_usuario);
        datosInstitucion = {
         nombre: response.nombre_administrativo,
         correo: response.correo,
         telefono: response.telefono,
         direccion: response.direccion
        }
       }

       return datosInstitucion;

       } catch (error) {
        console.error(error);
        throw 'Ocurrio un error al obtener registros de cajeros';
       }
 }


