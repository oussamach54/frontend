// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "", // ex: "http://localhost:8000"
});

// Ajoute le JWT si présent
api.interceptors.request.use((config) => {
  const access = localStorage.getItem("access") || localStorage.getItem("token");
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

export default api;
