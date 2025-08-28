/*
  Simulador Virtual de Arduino Clicker
  
  Este simulador crea un servidor web que emula un dispositivo Arduino clicker
  físico, permitiendo probar el sistema sin hardware real.
  
  Características:
  - Interfaz web con botones A, B, C, D
  - Simula comunicación serial compatible con Web Serial API
  - ID de dispositivo configurable
  - Log de comunicaciones en tiempo real
  - Socket.io para comunicación bidireccional en tiempo real
  - Compatible con el protocolo Arduino original
  
  @author Rodrigo Collado
  @date Agosto 2025
*/

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');

class VirtualArduinoClicker {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    this.port = 3001;
    this.clickerId = '001';
    this.isConnected = false;
    this.connectedClients = new Set();
    this.setupServer();
    this.setupWebSocket();
  }

  setupServer() {
    // Middleware
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));

    // Ruta principal - interfaz del clicker
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // API para simular respuesta del clicker
    this.app.post('/api/answer', (req, res) => {
      const { answer, deviceId } = req.body;
      
      if (!['A', 'B', 'C', 'D'].includes(answer)) {
        return res.status(400).json({ error: 'Respuesta inválida' });
      }

      const message = `${deviceId || this.clickerId}:${answer}`;
      const timestamp = new Date().toISOString();
      
      console.log(`📡 Clicker Virtual -> ${message}`);
      
      // Enviar a todos los clientes conectados via Socket.IO
      this.io.emit('arduino-data', {
        type: 'arduino-data',
        payload: {
          message,
          deviceId: deviceId || this.clickerId,
          answer,
          timestamp,
          raw: message + '\n'
        }
      });
      
      res.json({ 
        success: true, 
        message,
        timestamp
      });
    });

    // Endpoint para simular datos seriales directos
    this.app.post('/api/serial-data', (req, res) => {
      const { data } = req.body;
      
      console.log(`📡 Serial Data -> ${data}`);
      
      // Enviar datos raw a los clientes
      this.io.emit('serial-raw', {
        data,
        timestamp: new Date().toISOString()
      });
      
      res.json({ success: true, data });
    });

    // Estado del dispositivo
    this.app.get('/api/status', (req, res) => {
      res.json({
        deviceId: this.clickerId,
        connected: this.isConnected,
        connectedClients: this.connectedClients.size,
        version: '1.0.0',
        type: 'virtual-arduino-clicker',
        protocol: 'DEVICE_ID:ANSWER\\n',
        baudRate: 9600
      });
    });

    // Cambiar ID del dispositivo
    this.app.post('/api/device-id', (req, res) => {
      const { deviceId } = req.body;
      if (deviceId && deviceId.length <= 10) {
        this.clickerId = deviceId;
        console.log(`🔧 ID del dispositivo cambiado a: ${deviceId}`);
        
        // Notificar a clientes conectados
        this.io.emit('device-id-changed', { deviceId: this.clickerId });
        
        res.json({ success: true, deviceId: this.clickerId });
      } else {
        res.status(400).json({ error: 'ID inválido' });
      }
    });

    // Endpoint para obtener las instrucciones de integración
    this.app.get('/api/integration-guide', (req, res) => {
      res.json({
        title: 'Guía de Integración - Arduino Clicker Virtual',
        steps: [
          'El simulador está corriendo en http://localhost:3001',
          'En tu aplicación web, usa el botón "Conectar Clicker"',
          'El Web Serial API detectará automáticamente el simulador',
          'Usa los botones A, B, C, D en la interfaz web para simular respuestas',
          'Las respuestas aparecerán en tu aplicación en tiempo real'
        ],
        protocol: {
          format: 'DEVICE_ID:ANSWER\\n',
          example: '001:A\\n',
          baudRate: 9600,
          supported_answers: ['A', 'B', 'C', 'D']
        }
      });
    });
  }

  setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Cliente conectado: ${socket.id}`);
      this.connectedClients.add(socket.id);

      // Enviar estado inicial
      socket.emit('device-status', {
        deviceId: this.clickerId,
        connected: this.isConnected,
        message: `Clicker ${this.clickerId} listo`
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Cliente desconectado: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });

      // Manejar solicitudes de respuesta desde el cliente
      socket.on('send-answer', (data) => {
        const { answer, deviceId } = data;
        if (['A', 'B', 'C', 'D'].includes(answer)) {
          const message = `${deviceId || this.clickerId}:${answer}`;
          console.log(`📡 Socket.IO -> ${message}`);
          
          // Retransmitir a todos los clientes
          this.io.emit('arduino-data', {
            type: 'arduino-data',
            payload: {
              message,
              deviceId: deviceId || this.clickerId,
              answer,
              timestamp: new Date().toISOString(),
              raw: message + '\n'
            }
          });
        }
      });
    });
  }

  start() {
    this.server.listen(this.port, () => {
      console.log('🎮 ===============================================');
      console.log('🎮 SIMULADOR VIRTUAL ARDUINO CLICKER INICIADO');
      console.log('🎮 ===============================================');
      console.log(`🌐 Interfaz web: http://localhost:${this.port}`);
      console.log(`🔧 ID del dispositivo: ${this.clickerId}`);
      console.log(`📡 Protocolo: DEVICE_ID:ANSWER (ej: ${this.clickerId}:A)`);
      console.log(`⚡ WebSocket habilitado para tiempo real`);
      console.log('🎯 Dispositivo listo para conectar con la app web');
      console.log('');
      console.log('📝 INSTRUCCIONES:');
      console.log('1. Abre http://localhost:3001 en tu navegador');
      console.log('2. En tu app principal, usa "Conectar Clicker"');
      console.log('3. Usa los botones A, B, C, D para simular respuestas');
      console.log('4. Las respuestas aparecerán automáticamente en tu app');
      console.log('');
      console.log('💡 TRUCO: También puedes responder con las teclas A, B, C, D');
      console.log('⌨️  Presiona Ctrl+C para detener el simulador');
      console.log('===============================================');
      
      this.isConnected = true;
      
      // Simular mensaje de inicio como Arduino real
      setTimeout(() => {
        console.log(`📡 Enviando: CLICKER_READY:${this.clickerId}`);
        this.io.emit('arduino-data', {
          message: `CLICKER_READY:${this.clickerId}`,
          deviceId: this.clickerId,
          answer: 'READY',
          timestamp: new Date().toISOString(),
          raw: `CLICKER_READY:${this.clickerId}\n`
        });
      }, 1000);
    });
  }
}

// Crear e iniciar el simulador
const simulator = new VirtualArduinoClicker();
simulator.start();

// Manejo graceful del cierre
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando simulador virtual...');
  process.exit(0);
});

module.exports = VirtualArduinoClicker;
