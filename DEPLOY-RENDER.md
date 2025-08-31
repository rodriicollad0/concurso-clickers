# 🚀 Despliegue en Render

## 📋 Servicios a Desplegar

Tu aplicación se compone de 3 servicios que se desplegarán por separado:

### 1. 🎨 Frontend (React App)
- **Tipo:** Static Site
- **URL esperada:** `https://concurso-clicker-app.onrender.com`

### 2. 🔧 Backend API (NestJS)
- **Tipo:** Web Service
- **URL esperada:** `https://quiz-backend-[random].onrender.com`

### 3. 🎮 Virtual Clicker
- **Tipo:** Web Service
- **URL esperada:** `https://virtual-clicker-[random].onrender.com`

## 🔄 Orden de Despliegue

### Paso 1: Desplegar Backend API
1. En Render, crear nuevo **Web Service**
2. Conectar tu repositorio
3. Configurar:
   - **Root Directory:** `quiz-backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Environment:** Node.js

### Paso 2: Actualizar URLs
Una vez desplegado el backend, actualizar:

**En `virtual-clicker/public/index.html`:**
```javascript
// Reemplazar esta línea:
quizBackendUrl = `https://quiz-backend-YOUR_BACKEND_URL.onrender.com`;
// Con la URL real de tu backend
```

### Paso 3: Desplegar Virtual Clicker
1. Crear nuevo **Web Service**
2. Configurar:
   - **Root Directory:** `virtual-clicker`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### Paso 4: Desplegar Frontend
1. Crear nuevo **Static Site**
2. Configurar:
   - **Build Command:** `npm ci && npm run build`
   - **Publish Directory:** `dist`

## ⚙️ Variables de Entorno

### Backend API:
```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://concurso-clicker-app.onrender.com
```

### Virtual Clicker:
```
NODE_ENV=production
QUIZ_BACKEND_URL=https://quiz-backend-[TU_URL].onrender.com
```

## 🌐 URLs Finales

Después del despliegue tendrás:
- **App principal:** `https://concurso-clicker-app.onrender.com`
- **API Backend:** `https://quiz-backend-[random].onrender.com`
- **Virtual Clicker:** `https://virtual-clicker-[random].onrender.com`

## 📱 Uso desde Android

Una vez desplegado, los usuarios Android pueden acceder a:
```
https://virtual-clicker-[random].onrender.com
```

## 🔧 Verificación

Para verificar que todo funciona:
1. ✅ Backend: `https://quiz-backend-[random].onrender.com/health`
2. ✅ Virtual Clicker: `https://virtual-clicker-[random].onrender.com/api/status`
3. ✅ Frontend: `https://concurso-clicker-app.onrender.com`
