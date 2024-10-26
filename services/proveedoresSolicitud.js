import solicitudes from './solicitudes.js';

export const getProveedoresEmpresa = async (id_usuario) => {
    try {    
              const proveedores = await solicitudes.fetchRegistros(
                  `/proveedores/${id_usuario}`
                );

                return proveedores;
        
            } catch (error) {
              console.log(error); //modal error pendiente
            }
};

