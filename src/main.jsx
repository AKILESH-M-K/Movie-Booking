import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./App.css";
import App from "./App.jsx";
import { store } from "./store/store";
import { AuthProvider } from "./auth/AuthContext";

const BASE_PATH = "/Movie-Booking/";

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${BASE_PATH}sw.js`, { scope: BASE_PATH })
      .catch((err) => console.error("Service worker registration failed:", err));
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </StrictMode>,
);
