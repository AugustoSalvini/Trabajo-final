import React from "react";
import ClienteForm from "../components/ClienteForm.jsx";
import bgImage from "../assets/aguas1.png";

export default function ClienteNuevo() {
  return (
    <section
      className="page-hero"
      style={{ "--bg": `url(${bgImage})` }}
    >
      <div className="card">
        <h2>Registro de Cliente</h2>
        <ClienteForm />
      </div>
    </section>
  );
}
