// src/app/api/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
  // ✅ Disable cache
  validateStatus: (status) => status >= 200 && status < 400,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Disable browser caching for GET
  if (config.method === "get") {
    config.headers["Cache-Control"] = "no-cache";
  }

  return config;
});

export default api;
