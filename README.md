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

La app está disponible en: [https://peluqueria-app-0a8e.onrender.com/](https://peluqueria-app-0a8e.onrender.com/)

## 🔧 Configuración para Producción

### Headers requeridos para Web Serial API:
```
Permissions-Policy: serial=*
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
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
