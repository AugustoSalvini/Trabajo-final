import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import ClienteNuevo from "./pages/ClienteNuevo.jsx";

export default function App() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <header className="app-header">
        <img src="/favicon.png" alt="Aguas Carlitos" />
        <h1 className="app-title">Aguas Carlitos · Clientes</h1>
      </header>

      {/* Si querés dejar el link a "Nuevo cliente", lo centramos */}
      <nav style={{ textAlign: "center", margin: "6px 0 10px" }}>
        <Link to="/" style={{ color: "#4f5d75", textDecoration: "none", fontWeight: 600 }}>
          Nuevo cliente
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<ClienteNuevo />} />
      </Routes>
    </div>
  );
}
