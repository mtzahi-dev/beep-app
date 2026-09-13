import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// שכבת אחסון: האב-טיפוס מצפה ל-window.storage — כאן ממומש מעל localStorage
window.storage = {
  async get(key) {
    const value = localStorage.getItem(key);
    return value == null ? null : { key, value };
  },
  async set(key, value) {
    localStorage.setItem(key, value);
  },
  async delete(key) {
    localStorage.removeItem(key);
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
