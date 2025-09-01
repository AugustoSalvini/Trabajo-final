# 💧 Aguas Carlitos · Trabajo Final

Este proyecto corresponde al **Trabajo Final** de la materia.  
Se desarrolló un sistema sencillo para la **gestión de clientes y adhesiones** de la empresa ficticia *Aguas Carlitos*.  

La aplicación cuenta con un **backend** hecho en Node.js con Express y un **frontend** desarrollado con React utilizando Vite.  
El objetivo es mostrar un flujo básico de registro de clientes, validaciones y visualización moderna en la web.

---

## 🚀 Tecnologías utilizadas

- **Backend**: Node.js, Express, CORS, Dotenv  
- **Frontend**: React, Vite, React Hook Form, Zod, Axios, React Router  
- **Estilos**: CSS con variables, tipografías de Google Fonts (Merriweather e Inter)  
- **Control de versiones**: Git y GitHub  

---

## 📂 Estructura de carpetas

aguas_carlitos/
├─ server/ # API Node/Express
│ ├─ src/server.js
│ ├─ package.json
│ └─ .env
└─ web/ # Frontend React
├─ src/
│ ├─ App.jsx
│ ├─ index.css
│ ├─ main.jsx
│ ├─ pages/ClienteNuevo.jsx
│ ├─ components/ClienteForm.jsx
│ └─ services/api.js
├─ public/favicon.ico
├─ package.json
└─ .env

---

## ⚙️ Instalación y ejecución

### Clonar el repositorio
```bash
git clone https://github.com/AugustoSalvini/Trabajo-final.git
cd Trabajo-final

cd server
npm install
npm run dev
# Corre en http://localhost:4000

cd web
npm install
npm run dev
# Abrir la URL que indique Vite (ej: http://localhost:5173)

Funcionalidades principales

Registro de clientes con validaciones (nombre, apellido, DNI/CUIT, dirección, zona).

Listado de zonas dinámicas (Centro, Norte, Sur, Este, Oeste) desde el backend.

Formulario validado con React Hook Form y Zod.

Interfaz con diseño moderno: fondo con imagen y overlay, tarjeta translúcida, inputs con resaltado al foco y botón con degradado.

Autores
Nicolas Bastida
Mateo Borrero
Augusto Salvini
Valentin Torales

Notas

En el backend se debe crear un archivo .env con:

PORT=4000


En el frontend, un archivo .env con:

VITE_API_URL=http://localhost:4000/api


---
