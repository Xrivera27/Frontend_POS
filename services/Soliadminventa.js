const homeUrl = 'http://localhost:3000/api';

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
            // Asegurarnos de que el id_usuario esté en los datos
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
    }
};