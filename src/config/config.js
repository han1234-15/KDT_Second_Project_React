import axios from "axios";

export const caxios = axios.create({
  baseURL: `http://`
});

caxios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `bearer ${token}`;
  }
  return config;
});
