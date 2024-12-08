const { getApi } = require('../config/getApiUrl');
  const homeUrl = getApi();

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth');
    console.log('Token encontrado:', token ? 'Sí' : 'No');

    if (!token) {
        throw new Error('No hay token de autenticación');
    }
    
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export default {
    homeUrl,
    
    async obtenerVentas() {
        try {
            const headers = getAuthHeaders();
            const url = `${homeUrl}/AdminVentas/ventas`;
            console.log('Haciendo petición a:', url);
    
            const response = await fetch(url, { 
                method: 'GET',
                headers
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Datos recibidos:', data);
            return data.data;
        } catch (error) {
            console.error('Error al obtener ventas:', error);
            throw error;
        }
    },

    async obtenerVentasCeo(id_sucursal) {
        try {
            const headers = getAuthHeaders();
            const url = `${homeUrl}/AdminVentas/ventas-ceo/${id_sucursal}`;
            console.log('Haciendo petición a:', url);
    
            const response = await fetch(url, { 
                method: 'GET',
                headers
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Datos recibidos:', data);
            return data.data;
        } catch (error) {
            console.error('Error al obtener ventas:', error);
            throw error;
        }
    },

    async obtenerDetalleVenta(idVenta) {
        try {
            console.log('Solicitando detalle de venta:', idVenta);
            const url = `${homeUrl}/AdminVentas/ventas/${idVenta}`;
            console.log('URL de petición:', url);
            
            const headers = getAuthHeaders();
            const response = await fetch(url, { 
                method: 'GET',
                headers 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Detalle de venta recibido:', data);
            return data.data;
        } catch (error) {
            console.error('Error al obtener detalle de venta:', error);
            throw error;
        }
    },

    async generarFactura(idVenta, idUsuario) {
        try {
            console.log('Iniciando generarFactura:', { idVenta, idUsuario });
            const url = `${homeUrl}/AdminVentas/ventas/factura/${idVenta}/${idUsuario}`;
            
            const headers = getAuthHeaders();
            // Remove Content-Type for blob response
            delete headers['Content-Type'];
            
            const response = await fetch(url, {
                method: 'GET',
                headers,
                responseType: 'blob'  // Importante!
            });
    
            if (!response.ok) {
                const text = await response.text();
                console.error('Error response:', text);
                throw new Error(`Error al generar factura: ${response.status}`);
            }
    
            const blob = await response.blob();
            console.log('Blob recibido:', {
                size: blob.size,
                type: blob.type
            });
    
            if (blob.size === 0) {
                throw new Error('PDF recibido está vacío');
            }
    
            return blob;
        } catch (error) {
            console.error('Error en generarFactura:', error);
            throw error;
        }
    },

    async cancelarVenta(ventaId, description) {  // Mantenemos description como viene del frontend
        try {
            console.log('Iniciando cancelación de venta:', { ventaId, description });
            const url = `${homeUrl}/AdminVentas/ventas/${ventaId}/cancel`;
            
            const headers = getAuthHeaders();
            
            // Mapeamos description a descripcion para el backend
            const body = {
                descripcion: description  // Ya está haciendo la conversión correctamente
            };
    
            console.log('Enviando datos:', body);
    
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                throw new Error(errorData.message || `Error: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Respuesta de cancelación:', data);
            return data;
        } catch (error) {
            console.error('Error al cancelar venta:', error);
            throw error;
        }
    },

    // Agregar este nuevo método en el objeto exportado
async obtenerReporteCancelacion(ventaId) {
    try {
        console.log('Solicitando reporte de cancelación:', ventaId);
        const url = `${homeUrl}/AdminVentas/ventas/${ventaId}/reporte-cancelacion`;
        console.log('URL de petición:', url);
        
        const headers = getAuthHeaders();
        // Eliminar Content-Type para respuesta blob
        delete headers['Content-Type'];
        
        const response = await fetch(url, {
            method: 'GET',
            headers,
            responseType: 'blob'  // Importante para recibir el PDF
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Error response:', text);
            throw new Error(`Error al generar reporte de cancelación: ${response.status}`);
        }

        const blob = await response.blob();
        console.log('Blob recibido:', {
            size: blob.size,
            type: blob.type
        });

        if (blob.size === 0) {
            throw new Error('PDF recibido está vacío');
        }

        return blob;
    } catch (error) {
        console.error('Error al obtener reporte de cancelación:', error);
        throw error;
    }
},

    async obtenerCompras() {
        try {
            const headers = getAuthHeaders();
            const url = `${homeUrl}/AdminCompras/compras`;
            console.log('Haciendo petición a:', url);
    
            const response = await fetch(url, { 
                method: 'GET',
                headers
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Datos recibidos:', data);
            return data.data;
        } catch (error) {
            console.error('Error al obtener compras:', error);
            throw error;
        }
    },

    async obtenerComprasCeo(id_sucursal) {
        try {
            const headers = getAuthHeaders();
            const url = `${homeUrl}/AdminCompras/compras-ceo/${id_sucursal}`;
            console.log('Haciendo petición a:', url);
    
            const response = await fetch(url, { 
                method: 'GET',
                headers
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Datos recibidos:', data);
            return data.data;
        } catch (error) {
            console.error('Error al obtener compras:', error);
            throw error;
        }
    },

    async obtenerDetalleCompra(idCompra) {
        try {
            console.log('Solicitando detalle de compra:', idCompra);
            const url = `${homeUrl}/AdminCompras/compras/${idCompra}`;
            console.log('URL de petición:', url);
            
            const headers = getAuthHeaders();
            const response = await fetch(url, { 
                method: 'GET',
                headers 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Detalle de compra recibido:', data);
            return data.data;
        } catch (error) {
            console.error('Error al obtener detalle de compra:', error);
            throw error;
        }
    },

    async registrarCompra(compraData) {
        try {
            console.log('Iniciando registro de compra:', compraData);
            const url = `${homeUrl}/AdminCompras/compras`;
            
            const headers = getAuthHeaders();
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(compraData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Compra registrada:', data);
            return data;
        } catch (error) {
            console.error('Error al registrar compra:', error);
            throw error;
        }
    },

    async actualizarEstadoCompra(idCompra, estado) {
        try {
            console.log('Actualizando estado de compra:', { idCompra, estado });
            const url = `${homeUrl}/AdminCompras/compras/${idCompra}/estado`;
            
            const headers = getAuthHeaders();
            const response = await fetch(url, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ estado })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Estado de compra actualizado:', data);
            return data;
        } catch (error) {
            console.error('Error al actualizar estado de compra:', error);
            throw error;
        }
    },

    async generarReporteCompras(fechaInicio, fechaFin) {
        try {
            console.log('Generando reporte de compras:', { fechaInicio, fechaFin });
            const url = `${homeUrl}/AdminCompras/compras/reporte?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
            
            const headers = getAuthHeaders();
            // Eliminar Content-Type para respuesta blob
            delete headers['Content-Type'];
            
            const response = await fetch(url, {
                method: 'GET',
                headers,
                responseType: 'blob'
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Error response:', text);
                throw new Error(`Error al generar reporte: ${response.status}`);
            }

            const blob = await response.blob();
            console.log('Blob recibido:', {
                size: blob.size,
                type: blob.type
            });

            if (blob.size === 0) {
                throw new Error('PDF recibido está vacío');
            }

            return blob;
        } catch (error) {
            console.error('Error al generar reporte de compras:', error);
            throw error;
        }
    }
};