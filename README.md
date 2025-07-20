# 🧑‍💇 Peluquería - Sistema de Reservas con Web Serial API

Sistema moderno de reservas para peluquería con comunicación serial para dispositivos IoT (Arduino, ESP32, etc.).

## 🚀 Características

- ✅ Formulario de reservas con validación avanzada
- ✅ Web Serial API para comunicación con dispositivos
- ✅ Responsive design (PC y móvil)
- ✅ Validaciones de fecha/hora realistas
- ✅ Interfaz moderna con animaciones
- ✅ Compatible con Chrome/Edge

## 🌐 Compatibilidad

### ✅ Completamente Compatible:
- **Chrome Desktop** (Windows/Mac/Linux)
- **Edge Desktop** (Windows/Mac)

### ⚠️ Parcialmente Compatible:
- **Chrome Android** (Android 12+ únicamente)
- Requiere habilitar flags experimentales

### ❌ No Compatible:
- Firefox, Safari, Opera
- iOS (iPhone/iPad)
- Android < 12

## 📱 Despliegue a Internet

### Opción 1: Render (Recomendado) 🌟
```bash
# 1. Subir código a GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/rodriicollad0/peluqueria-app.git
git push -u origin main

# 2. Conectar en Render.com
# - Crear cuenta en render.com
# - Conectar repositorio de GitHub
# - Seleccionar "Static Site"
# - Build Command: npm ci && npm run build
# - Publish Directory: dist
# - ¡Deploy automático!
```

### Opción 2: Netlify (También buena)
1. Construir: `npm run build`
2. Subir carpeta `dist` a [netlify.com](https://netlify.com)
3. ¡Listo!

### Opción 3: Vercel
1. Conectar repo de GitHub en [vercel.com](https://vercel.com)
2. Auto-deploy configurado
3. ¡Listo!

## 🔧 Configuración para Producción

### Headers requeridos para Web Serial API:
```
Permissions-Policy: serial=*
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

### Configuración Render.com:
✅ **Ya configurado automáticamente** con `render.yaml`
- Headers para Web Serial API incluidos
- Build command optimizado
- Redirects configurados

### Para Netlify, crear `public/_headers`:
```
/*
  Permissions-Policy: serial=*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
```

## 🚀 Pasos detallados para Render

### 1. Preparar el repositorio:
```bash
git init
git add .
git commit -m "🚀 Initial deployment"
git branch -M main
```

### 2. Subir a GitHub:
```bash
# Crear repositorio en GitHub primero
git remote add origin https://github.com/rodriicollad0/peluqueria-app.git
git push -u origin main
```

### 3. Desplegar en Render:
1. Ir a [render.com](https://render.com) y crear cuenta
2. Conectar con GitHub
3. Seleccionar tu repositorio
4. Elegir **"Static Site"**
5. Configuración se detecta automáticamente desde `render.yaml`
6. Click **"Create Static Site"**
7. ¡Esperar 2-3 minutos y listo!

### 4. Tu app estará en:
```
https://tu-app-nombre.onrender.com
```

## 📱 Configuración Android

Para usar en Android:

1. **Actualizar a Android 12+**
2. **Usar Chrome (no Chrome Beta)**
3. **Habilitar flag experimental:**
   - Ir a `chrome://flags`
   - Buscar "Experimental Web Platform features"
   - Habilitar
   - Reiniciar Chrome

## 🔌 Protocolo Serial

La app envía datos en formato:
```
NUEVA_RESERVA:Nombre|Servicio|Fecha|Hora
```

### Ejemplo Arduino:
```cpp
void setup() {
  Serial.begin(9600);
}

void loop() {
  if (Serial.available()) {
    String data = Serial.readString();
    if (data.startsWith("NUEVA_RESERVA:")) {
      // Procesar reserva
      Serial.println("RESERVA_RECIBIDA");
    }
  }
}
```

## 🛠️ Desarrollo Local

```bash
npm install
npm run dev
```

Abrir: `http://localhost:5173`

## 📊 Estructura del Proyecto

```
src/
├── components/
│   ├── ServiceForm.jsx     # Formulario de reservas
│   ├── ServiceForm.css
│   ├── BookingSummary.jsx  # Resumen de cita
│   └── BookingSummary.css
├── App.jsx                 # Componente principal
├── App.css
└── main.jsx               # Punto de entrada
```

## 🎯 Próximas Mejoras

- [ ] Base de datos para guardar reservas
- [ ] Calendario visual
- [ ] Notificaciones push
- [ ] Integración con WhatsApp
- [ ] Panel de administración
- [ ] PWA (Progressive Web App)

## 📄 Licencia

MIT License - Uso libre para proyectos comerciales y personales.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
