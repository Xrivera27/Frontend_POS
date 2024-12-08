// services/sucursalesService.js
const { getApi } = require('../config/getApiUrl');
  const homeUrl = getApi();

import axios from 'axios';

const API_URL = `${homeUrl}/sucursales`; // Cambia la URL según tu configuración

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
