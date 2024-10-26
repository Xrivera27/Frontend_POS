import solicitudes from './solicitudes.js';

export const postProducto = async (datos) => {
    const parametros = '/productos/crear';
    try {
        console.log(`datos: ${datos}`)
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
// const datosPrueba = {
//     codigo_producto: "ABCdsd1ss283",                   
//     nombre: "Nombre del Producto",           
//     descripcion: "Descripción del producto",
//     precio_unitario: 100.00,                 //
//     precio_mayorista: 80.00,                 // 
//     proveedor: 1,                  
//     unidad_medida: 1,                       
//     impuesto: "IMPUESTO_ISV_15",             
//     id_usuario: 8
// };

// productoForm: {
//     codigo_producto: '',
//     nombre: '',
//     descripcion: '',
//     unidad_medida: 'default',
//     impuesto: impuestos[0]?.id || null,
//     proveedor: 'default',
//     precio_unitario: 0,
//     precio_mayorista: 0,

//    },
