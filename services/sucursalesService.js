// services/sucursalesService.js

import axios from 'axios';

const API_URL = 'http://localhost:3000/api/sucursales'; // Cambia la URL según tu configuración

export const getSucursales = () => {
  return axios.get(API_URL);
};

export const createSucursal = (sucursal) => {
  return axios.post(API_URL, sucursal);
};

export const updateSucursal = (id, sucursal) => {
  return axios.put(`${API_URL}/${id}`, sucursal);
};

export const deleteSucursal = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};
