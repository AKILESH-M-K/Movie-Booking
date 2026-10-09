import axios from "axios";
import { resolveApiConfig } from "./apiConfig";

const apiConfig = resolveApiConfig({
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  configuredUrl: import.meta.env.VITE_API_URL,
  pageOrigin: globalThis.location?.origin || "https://cinebook.invalid",
});

if (apiConfig.invalid) {
  console.warn(
    "[CineBook] Production API is not using HTTPS. API access is disabled; bundled demo data will be used.",
  );
}

export const API_URL = apiConfig.url.replace(/\/$/, "");
export const API_ENABLED = apiConfig.enabled;
export const TOKEN_KEY = "cinebookAccessToken";

export const apiClient = axios.create({ baseURL: API_URL || undefined, timeout: 8000 });
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem("cinebookSession");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cinebook:unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);
export function apiError(
  error,
  fallback = "Request failed. Please try again.",
) {
  if (!error?.response)
    return "Cannot reach the CineBook API. Make sure the backend is running.";
  return error.response.data?.message || fallback;
}
