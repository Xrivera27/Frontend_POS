import solicitudes from './solicitudes.js';

export const getDatosEmpresas = async (id_usuario) => {
    try {    
              const empresasDatos = await solicitudes.fetchRegistros(
                  `/empresa/obtener-datos/${id_usuario}`
                );

                return empresasDatos;
        
            } catch (error) {
              console.log(error);
              throw 'Algo salio mal';
            }
};