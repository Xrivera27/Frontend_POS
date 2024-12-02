import solicitudes from './solicitudes.js';

const { getClientesbyEmpresa } = require('./clienteSolicitudes.js');

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
console.log(datos);
    datos.forEach(d => {
        sucursal.push({
            id: d.id_sucursal,
            nombre: d.nombre_administrativo
        });
    });
    
    return sucursal;
    
}
