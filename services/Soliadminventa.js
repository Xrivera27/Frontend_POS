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

    async obtenerDetalleVenta(idVenta) {
        try {
            console.log('Solicitando detalle de venta:', idVenta);
            // Corregida la URL para que coincida con el router
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
    }
};