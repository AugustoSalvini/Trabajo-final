# 💧 Aguas Carlitos – Trabajo Final

Este proyecto corresponde al **Trabajo Final** de la materia.  
Se desarrolló un sistema sencillo para la **gestión de clientes y adhesiones** de la empresa ficticia *Aguas Carlitos*.  

La aplicación está dividida en **backend** (Node.js con Express) y **frontend** (React con Vite).  
El objetivo de la primera entrega fue configurar el entorno y dejar preparado el proyecto para continuar en los siguientes sprints.

---

## 🚀 Tecnologías utilizadas

- **Backend**: Node.js, Express, CORS, Dotenv, Morgan  
- **Frontend**: React, Vite, React Hook Form, Zod, Axios, React Router  
- **Estilos**: CSS moderno con variables y Google Fonts (Merriweather, Inter)  
- **Control de versiones**: Git y GitHub  

---

## 📂 Estructura de carpetas
```
Trabajo-final/
├───   server/ # Backend (Express)
│   ├─ src/
│   │ └─ server.js
│   ├─ package.json
│   └─ .env
└───  web/ # Frontend (React + Vite)
├───  src/
│   ├─ App.jsx
│   ├─ index.css
│   ├─ main.jsx
│   ├─ pages/ClienteNuevo.jsx
│   ├─ components/ClienteForm.jsx
│   └─ services/api.js
├───  public/
│   └─ favicon.ico
├── package.json
└─  .env
```

```


```

## ⚙️ Instalación y ejecución

### Clonar el repositorio
```bash
git clone https://github.com/AugustoSalvini/Trabajo-final.git
cd Trabajo-final

Backend
cd server
npm install
npm run dev
# Servidor corriendo en http://localhost:4000

Frontend
cd web
npm install
npm run dev
# Abrir la URL que indique Vite (ej: http://localhost:5173)

```


🧩 Funcionalidades actuales

Configuración básica del entorno de backend y frontend.

Servidor Express con endpoint de prueba /api/health.

Frontend preparado con React + Vite, formulario inicial de clientes.

Variables de entorno separadas (.env en backend y frontend).

Diseño base con fondo, tarjeta translúcida, inputs validados y botón estilizado.

```

```
👥 Autores
- **Nicolas Bastida
  
- **Mateo Borrero
  
- **Augusto Salvini

- **Valentin Torales
```

```
📌 Notas

- **En server/.env debe estar configurado:

PORT=4000
- **En web/.env debe estar configurado:
  
VITE_API_URL=http://localhost:4000/api
```
