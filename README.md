# 🎯 Concurso Clicker - Sistema de Concursos Interactivos

Sistema web de concursos que permite a los participantes responder preguntas usando clickers virtuales o dispositivos Arduino (teórico) conectados por puerto serie.

## 🚀 Funcionalidades Actuales

- ✅ **Frontend React**: Gestión completa de concursos y preguntas
- ✅ **Simulador Virtual**: Clicker virtual funcional para pruebas
- ✅ **Web Serial API**: Preparado para comunicación con dispositivos físicos
- ✅ **Backend NestJS**: API REST completa con base de datos
- ✅ **Tiempo Real**: Resultados instantáneos vía WebSocket
- ✅ **Responsive**: Compatible con PC y móvil
- ✅ **Base de Datos**: PostgreSQL y SQLite para desarrollo

## 🏗️ Arquitectura Implementada

```
┌─────────────────┐    Web Serial   ┌─────────────────┐    WebSocket    ┌─────────────────┐
│   Simulador     │ ──────────────> │   Frontend      │ <────────────> │   Backend       │
│   Virtual       │                 │   (React)       │                 │   (NestJS)      │
│   4 Botones     │                 │   Web Serial    │                 │   Socket.io     │
└─────────────────┘                 └─────────────────┘                 └─────────────────┘
                                                                                 │
                                                                                 ▼
                                                                         ┌─────────────────┐
                                                                         │   PostgreSQL    │
                                                                         │   + SQLite      │
                                                                         └─────────────────┘
```

## 🌐 Compatibilidad

### ✅ Probado y Funcional:
- **Chrome Desktop** (Windows/Mac/Linux)
- **Edge Desktop** (Windows/Mac)

### ⚠️ Soporte Teórico:
- **Chrome Android** (Android 12+ con flags experimentales)

### ❌ No Compatible:
- Firefox, Safari, Opera (no soportan Web Serial API)
- iOS (iPhone/iPad)

## 📁 Estructura del Proyecto

```
concurso-clicker/
├── src/                         # Frontend React - Código fuente
│   ├── components/
│   │   ├── QuizManager.jsx      # Gestión de concursos (CRUD)
│   │   ├── QuizDisplay.jsx      # Visualización de preguntas
│   │   └── ClickerResults.jsx   # Resultados en tiempo real
│   ├── App.jsx                  # Componente principal
│   └── main.jsx                 # Punto de entrada React
├── public/                      # Archivos estáticos
├── quiz-backend/                # Backend NestJS
│   ├── src/
│   │   ├── quiz/                # Controladores y servicios
│   │   └── main.ts              # Entrada del servidor
│   └── package.json
├── virtual-clicker/             # Simulador de clicker
│   ├── virtual-clicker.js       # Servidor del simulador
│   └── public/index.html        # Interfaz del clicker virtual
├── arduino/                     # Código para Arduino
│   └── clicker_system.ino       # Sistema de clickers físicos
├── package.json                 # Configuración del proyecto
├── vite.config.js               # Configuración de Vite
└── index.html                   # Punto de entrada de la aplicación
```

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React 19 + Vite
- **Comunicación**: Socket.io Client + Web Serial API
- **Estado**: React Hooks
- **Estilos**: CSS Modules

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **Base de Datos**: PostgreSQL (producción) + SQLite (desarrollo)
- **ORM**: TypeORM
- **WebSockets**: Socket.io
- **Validación**: class-validator

### Simulador
- **Runtime**: Node.js
- **Servidor Web**: Express
- **Comunicación**: WebSocket
- **Protocolo**: Emulación de puerto serie

## 🚀 Instalación y Uso

### 1. Clonar el Repositorio
```bash
git clone <repo-url>
cd concurso-clicker
```

### 2. Frontend (Aplicación Principal)
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
# Abrir http://localhost:5173
```

### 3. Backend
```bash
cd quiz-backend
npm install

# Configurar variables de entorno (opcional para SQLite)
# Ejecutar backend
npm run start:dev
# Backend disponible en http://localhost:3000
```

### 4. Simulador Virtual (Recomendado para pruebas)
```bash
cd virtual-clicker

# Instalar dependencias
npm install

# Iniciar simulador manualmente
node virtual-clicker.js
# Simulador disponible en http://localhost:3001
```

## 🎮 Simulador Virtual

**Nota importante**: Como no se dispone de hardware Arduino físico, el sistema utiliza un simulador virtual que emula el comportamiento de un clicker real.

### Características del Simulador
- ✅ **Emulación perfecta**: Simula el protocolo de Arduino real
- ✅ **Interfaz web**: Botones A, B, C, D en navegador
- ✅ **Atajos de teclado**: Teclas A, B, C, D para respuestas rápidas
- ✅ **ID configurable**: Cambiar identificador del dispositivo
- ✅ **Tiempo real**: Respuestas instantáneas
- ✅ **Compatible con Web Serial API**: Funciona como dispositivo real

## 🎮 Simulador Virtual

Para probar la aplicación sin hardware físico:

### Instalación y Uso
1. Navegar a la carpeta: `cd virtual-clicker`
2. Instalar dependencias: `npm install`
3. Ejecutar simulador: `node virtual-clicker.js`
4. Abrir navegador en `http://localhost:3001`
5. Desde la app principal, conectar el clicker virtual
6. Usar botones A, B, C, D en la interfaz web o teclado

### Características del Simulador
- ✅ **Compatible con Web Serial API** - Funciona como Arduino real
- ✅ **Protocolo idéntico** - Formato: `DEVICE_ID:ANSWER\n`
- ✅ **Tiempo real** - Respuestas instantáneas
- ✅ **ID configurable** - Cambiar ID del dispositivo
- ✅ **Atajos de teclado** - A, B, C, D desde el teclado
- ✅ **Sin hardware** - No necesitas Arduino físico

## 🎮 Simulador Virtual - Configuración Avanzada

### Configuración del Simulador
- **Puerto**: 3001 (configurable)
- **ID del dispositivo**: 001 (modificable en tiempo real)
- **Protocolo**: Emula exactamente el formato Arduino: `DEVICE_ID:ANSWER\n`

### Uso del Simulador
1. **Navegar**: `cd virtual-clicker`
2. **Instalar**: `npm install`
3. **Ejecutar**: `node virtual-clicker.js`
4. **Verificar**: Abrir `http://localhost:3001`
5. **Conectar**: En app principal → "🎮 Conectar Clicker"
4. **Responder**: Usar botones web o teclas A, B, C, D

## 🤖 Hardware Arduino (Teórico)

**⚠️ Nota importante**: El código Arduino está incluido pero **no ha sido probado** con hardware físico. Por ello se desarrolló el simulador virtual como alternativa funcional.

### Componentes Teóricos Necesarios
- Arduino Uno/Nano/ESP32
- 4 botones momentáneos (A, B, C, D)
- Cables y resistencias
- Conexión USB para comunicación serie

### Protocolo Diseñado
```
Formato: DEVICE_ID:ANSWER\n
Ejemplo: 001:A\n
Velocidad: 9600 baudios
```

### Archivo Incluido
- `arduino/clicker_system.ino` - Código completo para Arduino
- Configuración para 4 botones en pines 2, 3, 4, 5
- ID del dispositivo configurable
- Debounce y manejo de errores incluido

**El simulador virtual implementa exactamente este protocolo**, por lo que cuando se pruebe con hardware real, debería funcionar sin modificaciones en el frontend.

## 💾 Base de Datos

### PostgreSQL (Producción)
```bash
# Instalar PostgreSQL
# Crear base de datos
createdb quiz_system

# Variables de entorno en quiz-backend/.env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=quiz_system
```

### SQLite (Desarrollo)
```bash
# Configuración automática
# Base de datos creada en: quiz-backend/quiz_system_dev.db
```

### Migración de Datos
```bash
cd quiz-backend
npm run build
npm run start:prod
```

## 📱 Configuración Android

Para usar en dispositivos Android:

1. **Actualizar a Android 12+**
2. **Usar Chrome (no Chrome Beta)**
3. **Habilitar flag experimental:**
   - Ir a `chrome://flags`
   - Buscar "Experimental Web Platform features"
   - Habilitar
   - Reiniciar Chrome

## 🎯 Uso del Sistema

### 1. Configuración Inicial
1. Abrir aplicación web en Chrome/Edge
2. Conectar clickers físicos o iniciar simulador virtual
3. Presionar "🎮 Conectar Clicker" en la web
4. Verificar estado "✅ Clicker Conectado"

### 2. Crear Concurso
1. Usar el panel "Gestión de Concursos"
2. Agregar preguntas con opciones A, B, C, D
3. Configurar tiempo límite por pregunta
4. Guardar el concurso

### 3. Ejecutar Concurso
1. Seleccionar concurso desde la lista
2. Presionar "Iniciar Pregunta"
3. Los participantes presionan botones A, B, C, D
4. Ver resultados en tiempo real
5. Presionar "Finalizar Pregunta" para cerrar
6. Continuar con siguiente pregunta

### 4. Resultados
- Ver estadísticas en tiempo real
- Gráficos de barras por opción
- Contador de participantes
- Historial de respuestas

## 🔧 Scripts de Desarrollo

### Frontend
```bash
npm run dev          # Servidor desarrollo
npm run build        # Build producción
npm run preview      # Preview build
npm run lint         # Linting
```

### Backend
```bash
npm run start        # Producción
npm run start:dev    # Desarrollo con watch
npm run start:debug  # Debug mode
npm run build        # Compilar TypeScript
npm run test         # Tests unitarios
npm run test:e2e     # Tests end-to-end
```

### Simulador Virtual
```bash
cd virtual-clicker
npm install            # Instalar dependencias
node virtual-clicker.js  # Ejecutar simulador
```

## 🐛 Solución de Problemas

### Error: "node no reconocido"
- Instalar Node.js desde: https://nodejs.org
- Reiniciar terminal después de la instalación

### Error: Web Serial API no disponible
- Usar Chrome o Edge (versión reciente)
- Verificar conexión HTTPS en producción
- Android: habilitar flags experimentales

### Error: Puerto serie no encontrado
- Verificar que Arduino esté conectado
- Comprobar drivers USB instalados
- Verificar que no esté en uso por otro programa

### Backend no conecta a base de datos
- Verificar variables de entorno
- Comprobar que PostgreSQL esté ejecutándose
- Revisar permisos de usuario

### Simulador virtual no funciona
- Verificar que puerto 3001 esté libre
- Comprobar instalación de dependencias
- Revisar logs en consola del navegador

## 🔧 Scripts de Desarrollo

### Frontend
```bash
npm run dev          # Servidor desarrollo (http://localhost:5173)
npm run build        # Build producción
npm run preview      # Preview build
```

### Backend
```bash
cd quiz-backend
npm run start:dev    # Desarrollo con auto-reload
npm run build        # Compilar TypeScript
npm run start        # Producción
```

### Simulador Virtual
```bash
cd virtual-clicker
node virtual-clicker.js  # Iniciar simulador (http://localhost:3001)
```

## 🔧 API del Backend (Implementada)

El backend proporciona una API REST completa:

### Endpoints Principales
- `GET/POST /api/quiz` - Gestión de concursos
- `GET/POST /api/quiz/:id/questions` - Gestión de preguntas  
- `POST /api/quiz/answers` - Envío de respuestas
- `GET /api/quiz/participants/all` - Gestión de participantes

### WebSocket
- Eventos en tiempo real para respuestas
- Actualización automática de resultados
- Sincronización entre múltiples clientes

## 🐛 Solución de Problemas

### Error: "Web Serial API no disponible"
- **Causa**: Navegador no compatible
- **Solución**: Usar Chrome o Edge

### Error: "Backend no responde"
- **Causa**: Backend no iniciado o puerto ocupado
- **Solución**: Verificar que `http://localhost:3000/api` responda

### Error: "Simulador no conecta"
- **Causa**: Simulador no ejecutándose
- **Solución**: 
  ```bash
  cd virtual-clicker
  npm install
  node virtual-clicker.js
  # Verificar http://localhost:3001
  ```

### Error: "Node.js no encontrado"
- **Causa**: Node.js no instalado
- **Solución**: Instalar desde [nodejs.org](https://nodejs.org)

## ⚠️ Limitaciones Conocidas

- **Hardware Arduino**: No probado con dispositivos físicos (solo simulador)
- **Navegadores**: Limitado a Chrome/Edge para Web Serial API
- **Android**: Soporte experimental (requiere configuración especial)
- **Concurrencia**: Optimizado para uso de desarrollo/demo

## 📄 Licencia

MIT License - Uso libre para proyectos comerciales y personales.

## 👨‍💻 Autor

Desarrollado por **Rodrigo Collado**

---

**Sistema funcional** para concursos interactivos con clickers virtuales.

## 📚 Plan de Desarrollo

### ✅ Completado (Frontend + Hardware)
- [x] Sistema completo de concursos interactivos
- [x] Componente `QuizDisplay` para mostrar preguntas
- [x] Componente `ClickerResults` para resultados en tiempo real
- [x] Web Serial API para recibir respuestas de clickers
- [x] Socket.io client integrado
- [x] UI responsive y moderna
- [x] Código completo del clicker Arduino
- [x] Comunicación serie a 9600 baudios
- [x] Protocolo: "CLICKER_ID:RESPUESTA\n"
- [x] Simulador virtual completo

### 🚧 Backend (En Desarrollo)
- [x] Proyecto NestJS configurado
- [x] Entidades: Quiz, Question, Participant, Answer
- [x] Controladores REST para CRUD
- [x] Gateway Socket.io para tiempo real
- [x] Base de datos PostgreSQL + SQLite
- [ ] Autenticación JWT para administradores
- [ ] Tests unitarios y de integración
- [ ] Optimización de performance
- [ ] Dockerización completa

## 🔧 API del Backend

### Endpoints Principales

#### Gestión de Quizzes
```
POST   /api/quiz              # Crear quiz
GET    /api/quiz              # Listar quizzes
GET    /api/quiz/:id          # Obtener quiz específico
PUT    /api/quiz/:id          # Actualizar quiz
DELETE /api/quiz/:id          # Eliminar quiz
POST   /api/quiz/:id/start    # Iniciar quiz
POST   /api/quiz/:id/end      # Finalizar quiz
GET    /api/quiz/:id/results  # Obtener resultados
```

#### Gestión de Preguntas
```
POST   /api/quiz/:id/questions           # Crear pregunta
GET    /api/quiz/:id/questions           # Listar preguntas
GET    /api/quiz/questions/:id           # Obtener pregunta específica
PUT    /api/quiz/questions/:id           # Actualizar pregunta
DELETE /api/quiz/questions/:id           # Eliminar pregunta
POST   /api/quiz/:id/questions/:id/start # Iniciar pregunta
POST   /api/quiz/:id/questions/end       # Finalizar pregunta
GET    /api/quiz/questions/:id/answers   # Obtener respuestas
```

#### Gestión de Participantes
```
GET    /api/quiz/participants/all         # Listar participantes
POST   /api/quiz/participants/register    # Registrar participante
DELETE /api/quiz/participants/:id         # Eliminar participante
GET    /api/quiz/participants/:id/stats   # Estadísticas de participante
```

#### Envío de Respuestas (Clickers)
```
POST   /api/quiz/answers                  # Enviar respuesta
```

**Formato de respuesta:**
```json
{
  "participantId": "CLICKER_001",
  "questionId": 1,
  "selectedAnswer": "A",
  "responseTime": 5000
}
```

### Funciones Implementadas en Frontend

| Categoría | Funciones | Estado |
|-----------|-----------|--------|
| **Quiz Management** | 8 funciones | ✅ Completado |
| **Question Management** | 8 funciones | ✅ Completado |
| **Answer Management** | 1 función | ✅ Completado |
| **Participant Management** | 4 funciones | ✅ Completado |
| **Utilidades** | 8 funciones adicionales | ✅ Completado |

**Total: 29 funciones integradas** entre frontend y backend.

## 🧪 Testing del Backend

### Health Check
```bash
GET http://localhost:3000/api
```

### Ejemplo: Crear Quiz Completo
```bash
# 1. Crear quiz
POST http://localhost:3000/api/quiz
{
  "title": "Quiz de Geografía",
  "description": "Preguntas sobre capitales del mundo"
}

# 2. Agregar pregunta
POST http://localhost:3000/api/quiz/1/questions
{
  "questionText": "¿Cuál es la capital de España?",
  "optionA": "Barcelona",
  "optionB": "Madrid", 
  "optionC": "Valencia",
  "optionD": "Sevilla",
  "correctAnswer": "B"
}

# 3. Iniciar quiz
POST http://localhost:3000/api/quiz/1/start

# 4. Iniciar pregunta
POST http://localhost:3000/api/quiz/1/questions/1/start

# 5. Simular respuesta de clicker
POST http://localhost:3000/api/quiz/answers
{
  "participantId": "CLICKER_001",
  "questionId": 1,
  "selectedAnswer": "B"
}
```

### Scripts de Ejecución del Backend

#### Método Manual (Recomendado)
```bash
cd quiz-backend
npm install
npm run build
npm run start:dev
```

#### Opción 2: Comando Manual
```bash
$env:DB_HOST="localhost"; $env:DB_PORT="5433"; $env:DB_USERNAME="postgres"; $env:DB_PASSWORD="password"; $env:DB_DATABASE="quiz_system"; node "C:\Users\rodri\OneDrive - Universidad de Castilla-La Mancha\Escritorio\Concurso-Clicker\quiz-backend\dist\src\main.js"
```

### URLs del Sistema
- **Backend API**: http://localhost:3000/api
- **Frontend**: http://localhost:5173  
- **Simulador Virtual**: http://localhost:3001

## 📄 Licencia

MIT License - Uso libre para proyectos comerciales y personales.

## 👨‍💻 Autor

Desarrollado por **Rodrigo Collado**

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o contacta al desarrollador.
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuizDisplay.jsx      # Mostrar pregunta actual
│   │   │   └── ClickerResults.jsx   # Resultados en tiempo real
│   │   ├── App.jsx                  # Componente principal
│   │   └── main.jsx
│   └── package.json
├── backend/                     # API NestJS (ver backend/README.md)
│   ├── src/
│   │   ├── quiz/               # Gestión de concursos
│   │   ├── websocket/          # Socket.io gateway
│   │   ├── participants/       # Gestión de participantes
│   │   └── database/           # PostgreSQL + TypeORM
│   └── package.json
├── arduino/                     # Código del clicker
│   ├── clicker_system.ino      # Sketch principal
│   └── README.md               # Documentación hardware
└── README.md                   # Este archivo
```

## �️ Stack Tecnológico

### Frontend
- **Framework**: React 19 + Vite
- **Comunicación**: Socket.io Client + Web Serial API
- **Estilos**: CSS Modules
- **Build**: Vite

### Backend (Próximamente)
- **Framework**: NestJS (Node.js)
- **Base de Datos**: PostgreSQL + TypeORM
- **Cache/Pub-Sub**: Redis
- **WebSockets**: Socket.io con adaptador Redis
- **Autenticación**: JWT

### Hardware
- **Microcontrolador**: Arduino Uno/Nano/ESP32
- **Comunicación**: USB Serial (9600 baudios)
- **Protocolo**: "CLICKER_ID:RESPUESTA\n"

## 🚀 Inicio Rápido

### 1. Frontend (Desarrollo)
```bash
# Clonar repositorio
git clone <repo-url>
cd quiz-clicker-system

# Instalar dependencias
npm install

# Desarrollo
npm run dev
# Abrir http://localhost:5173
```

### 2. Hardware Arduino
```bash
# 1. Conectar Arduino según esquema en arduino/README.md
# 2. Abrir Arduino IDE
# 3. Cargar archivo arduino/clicker_system.ino
# 4. Subir al Arduino
# 5. Verificar Monitor Serie (9600 baudios)
```

### 3. Uso del Sistema
```bash
# 1. Abrir aplicación web en Chrome/Edge
# 2. Conectar clicker via "Conectar Clicker"
# 3. Presionar "Iniciar Pregunta"
# 4. Los participantes presionan botones A, B, C, D
# 5. Ver resultados en tiempo real
# 6. Presionar "Finalizar Pregunta" para cerrar
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

## 🔌 Protocolo de Comunicación

El sistema de clickers utiliza el siguiente protocolo de comunicación:

### Formato de Respuesta (Arduino → Frontend)
```
DEVICE_ID:ANSWER\n
```

**Ejemplos:**
- `001:A\n` - Clicker 001 selecciona opción A
- `002:B\n` - Clicker 002 selecciona opción B
- `001:C\n` - Clicker 001 selecciona opción C

### Configuración Serial
- **Velocidad**: 9600 baudios
- **Terminador**: Salto de línea (`\n`)
- **Formato**: ASCII plano

### Ejemplo de Código Arduino
```cpp
const int DEVICE_ID = 1;  // ID único del clicker

void setup() {
  Serial.begin(9600);
  // Configurar botones...
}

void loop() {
  char selectedAnswer = getButtonPress(); // A, B, C, D
  if (selectedAnswer != 0) {
    String response = String(DEVICE_ID, DEC) + ":" + String(selectedAnswer) + "\n";
    Serial.print(response);
    delay(100); // Debounce
  }
}
```

## 🛠️ Desarrollo Local

### Desarrollo Completo
```bash
# Terminal 1 - Frontend (Aplicación Principal)
npm install
npm run dev          # http://localhost:5173

# Terminal 2 - Backend  
cd quiz-backend
npm install
npm run start:dev    # http://localhost:3000

# Terminal 3 - Simulador (opcional)
cd virtual-clicker
npm install
node virtual-clicker.js   # http://localhost:3001
```

## 🎯 Próximas Mejoras

- [ ] Base de datos remota para quizzes
- [ ] Múltiples salas de quiz simultáneas
- [ ] Autenticación de participantes
- [ ] Estadísticas avanzadas
- [ ] Exportación de resultados
│   ├── ClickerResults.jsx  # Resultados en tiempo real
│   └── ClickerResults.css
├── App.jsx                 # Componente principal con Web Serial API
├── App.css
└── main.jsx               # Punto de entrada
```

## 🎯 Próximas Mejoras

- [ ] Base de datos remota para quizzes
- [ ] Múltiples salas de quiz simultáneas
- [ ] Autenticación de participantes
- [ ] Estadísticas avanzadas
- [ ] Exportación de resultados
- [ ] PWA (Progressive Web App)

## 📄 Licencia

MIT License - Uso libre para proyectos comerciales y personales.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
