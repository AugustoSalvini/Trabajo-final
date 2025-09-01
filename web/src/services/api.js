import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export const getZonas = () => api.get("/zonas").then(r => r.data);
export const crearCliente = (payload) =>
  api.post("/clientes", payload).then(r => r.data);

export default api;
