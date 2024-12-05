const homeUrl = 'http://uc0skkosgswkwkgosowwoocs.34.16.113.40.sslip.io/api';

const getAuthHeaders = () => {
    // Obtener el token del localStorage
    const token = localStorage.getItem('auth');
    console.log('Token encontrado:', token ? 'Sí' : 'No'); // Debug

    if (!token) {
        throw new Error('No hay token de autenticación');
    }
    
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export default {
    async obtenerProductos() {
        try {
            // Verificar token antes de hacer la petición
            const headers = getAuthHeaders();
            console.log('Haciendo petición a:', `${homeUrl}/compras/productos`); // Debug

            const response = await fetch(`${homeUrl}/compras/productos`, { 
                method: 'GET',
                headers 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error completo:', error); // Debug completo
            throw error;
        }
    },


    async registrarCompra(datosCompra) {
        try {
            const url = `${homeUrl}/compras/registrar`;
            const headers = getAuthHeaders();
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    productosLista: datosCompra.productosLista,
                    total: datosCompra.total,
                    referenciaPago: datosCompra.referenciaPago  // Añadimos esto
                })
            });
    
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al registrar la compra');
            }
    
            return await response.json();
        } catch (error) {
            console.error('Error al registrar compra:', error);
            throw error;
        }
    },

    async obtenerCompras() {
        try {
            const url = `${homeUrl}/compras/lista`;
            const headers = getAuthHeaders();
            const response = await fetch(url, { headers });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener compras:', error);
            throw error;
        }
    },

    async obtenerDetalleCompra(idCompra) {
        try {
            const url = `${homeUrl}/compras/detalle/${idCompra}`;
            const headers = getAuthHeaders();
            const response = await fetch(url, { headers });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener detalle de compra:', error);
            throw error;
        }
    },

    async guardarCompraTemp(datosCompra) {
        try {
            const url = `${homeUrl}/compras/guardar-temporal`;
            const headers = getAuthHeaders();
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    productosLista: datosCompra.productosLista,
                    total: datosCompra.total
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al guardar la compra temporal');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al guardar compra temporal:', error);
            throw error;
        }
    },

    async recuperarCompraTemp() {
        try {
            const url = `${homeUrl}/compras/recuperar-temporal`;
            const headers = getAuthHeaders();
            const response = await fetch(url, { headers });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al recuperar compra temporal:', error);
            throw error;
        }
    },

    async solicitarUsuario(parametros) {
        try {
            const url = `${homeUrl}${parametros}`;
            const headers = getAuthHeaders();
            const response = await fetch(url, { headers });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            return data[0].id_usuario;
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            throw error;
        }
    },

    
    async fetchRegistros(parametros) {
        try {
            const url = `${homeUrl}${parametros}`;
            console.log('URL de la petición:', url); // Debug
            const headers = getAuthHeaders();
            const response = await fetch(url, { headers });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en fetchRegistros:', error);
            throw error;
        }
    },


    async patchRegistro(parametros, datosActualizados) {
        try {
            const url = `${homeUrl}${parametros}`;
            const headers = getAuthHeaders();
            const response = await fetch(url, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(datosActualizados)
            });

            if (!response.ok) {
                throw new Error(`No se pudo actualizar: ${response.statusText}`);
            }

            return response.ok;
        } catch (error) {
            throw new Error(`Ocurrió un error: ${error}`);
        }
    },

    async deleteRegistro(parametros) {
        try {
            const url = `${homeUrl}${parametros}`;
            const headers = getAuthHeaders();
            const response = await fetch(url, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                throw new Error('No se eliminó el registro ' + response.status);
            }

            return true;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
};