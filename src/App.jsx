import { useState, useEffect } from 'react';
import { ServiceForm } from './components/ServiceForm';
import { BookingSummary } from './components/BookingSummary';
import './App.css';

/**
 * Componente principal de la aplicación de reservas para peluquería
 * Implementa Web Serial API para comunicación con dispositivos externos
 * @author Rodrigo Collado
 */
function App() {
  // Estados para el sistema de reservas
  const [booking, setBooking] = useState(null);
  
  // Estados para la comunicación serial usando Web Serial API
  const [serialOutput, setSerialOutput] = useState(''); // Log de comunicación serial
  const [port, setPort] = useState(null); // Puerto serie activo
  const [reader, setReader] = useState(null); // Reader para lectura de datos
  const [isConnected, setIsConnected] = useState(false); // Estado de conexión
  const [isConnecting, setIsConnecting] = useState(false); // Estado de conexión en progreso

  // Verificar compatibilidad con Web Serial API
  // La Web Serial API solo está disponible en navegadores compatibles (Chrome, Edge)
  const isSerialSupported = 'serial' in navigator;
  
  // Detección de plataforma móvil para mostrar advertencias apropiadas
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Detección específica de Android con Chrome
  const isAndroidChrome = /Android.*Chrome/i.test(navigator.userAgent);
  
  /**
   * Extrae la versión de Android del user agent
   * @returns {number} Versión de Android o 0 si no se detecta
   */
  const getAndroidVersion = () => {
    const match = navigator.userAgent.match(/Android\s([0-9\.]*)/);
    return match ? parseFloat(match[1]) : 0;
  };
  
  const androidVersion = getAndroidVersion();
  // Web Serial API en Android requiere versión 12+ y flags experimentales habilitadas
  const isCompatibleAndroid = isAndroidChrome && androidVersion >= 12;

  /**
   * Maneja la creación de una nueva reserva
   * Si hay un dispositivo serial conectado, envía los datos automáticamente
   * @param {Object} bookingData - Datos de la reserva (nombre, servicio, fecha, hora)
   */
  const handleBook = (bookingData) => {
    setBooking(bookingData);
    
    // Enviar datos al dispositivo serial si está conectado
    // Esto permite integración con sistemas externos (displays, impresoras, etc.)
    if (isConnected && port) {
      sendToSerial(`NUEVA_RESERVA:${bookingData.name}|${bookingData.service}|${bookingData.date}|${bookingData.time}\n`);
    }
  };

  /**
   * Vuelve al formulario principal desde el resumen de reserva
   */
  const handleBack = () => {
    setBooking(null);
  };

  /**
   * Envía datos a través del puerto serie usando Web Serial API
   * @param {string} data - Datos a enviar al dispositivo
   */
  const sendToSerial = async (data) => {
    if (!port || !isConnected) return;
    
    try {
      // Obtener un writer para el puerto serie
      const writer = port.writable.getWriter();
      // Codificar string a bytes y enviar
      await writer.write(new TextEncoder().encode(data));
      // Liberar el writer para otros usos
      writer.releaseLock();
      setSerialOutput(prev => prev + `📤 Enviado: ${data}`);
    } catch (error) {
      console.error('Error enviando datos:', error);
      setSerialOutput(prev => prev + `❌ Error enviando datos: ${error.message}\n`);
    }
  };

  /**
   * Establece conexión con un dispositivo serial usando Web Serial API
   * Implementa manejo robusto de errores y reconexión automática
   */
  const handleConnectSerial = async () => {
    // Verificar compatibilidad del navegador con Web Serial API
    if (!isSerialSupported) {
      setSerialOutput('❌ Tu navegador no soporta Web Serial API. Usa Chrome/Edge.\n');
      return;
    }

    // Limpiar conexiones previas para evitar conflictos
    if (isConnected || port) {
      setSerialOutput(prev => prev + '🔄 Desconectando conexión previa...\n');
      await handleDisconnectSerial();
      // Tiempo de espera para liberación completa de recursos
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsConnecting(true);
    
    try {
      // Solicitar al usuario que seleccione un puerto serie
      // Esto abre un diálogo del navegador con puertos disponibles
      const requestedPort = await navigator.serial.requestPort();
      
      // Verificar si el puerto ya está en uso por otra aplicación
      if (requestedPort.readable) {
        setSerialOutput('⚠️ El puerto ya estaba abierto. Cerrando conexión previa...\n');
        try {
          await requestedPort.close();
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (closeError) {
          console.log('Puerto ya estaba cerrado o no se pudo cerrar:', closeError);
        }
      }

      setSerialOutput(prev => prev + '🔄 Intentando abrir puerto serie...\n');
      
      // Configurar parámetros de comunicación serial
      // baudRate: velocidad de transmisión (bits por segundo)
      // dataBits: bits de datos por frame
      // stopBits: bits de parada
      // parity: control de paridad
      // flowControl: control de flujo de datos
      await requestedPort.open({ 
        baudRate: 9600,    // Velocidad estándar para Arduino y microcontroladores
        dataBits: 8,       // 8 bits de datos (estándar)
        stopBits: 1,       // 1 bit de parada (estándar)
        parity: 'none',    // Sin paridad
        flowControl: 'none' // Sin control de flujo
      });

      // Configurar stream de decodificación para datos entrantes
      // TextDecoderStream convierte bytes a texto legible
      const decoder = new TextDecoderStream();
      requestedPort.readable.pipeTo(decoder.writable);
      const newReader = decoder.readable.getReader();

      // Actualizar estados de la aplicación
      setPort(requestedPort);
      setReader(newReader);
      setIsConnected(true);
      setSerialOutput(prev => prev + '✅ Conectado correctamente al dispositivo serial.\n');

      /**
       * Bucle infinito para leer datos del puerto serie
       * Se ejecuta en segundo plano mientras la conexión esté activa
       */
      const readLoop = async () => {
        try {
          // Leer datos mientras la conexión esté activa
          while (isConnected) {
            const { value, done } = await newReader.read();
            // Salir si la lectura está completa o la conexión se cerró
            if (done || !isConnected) {
              console.log('Lectura terminada, saliendo del bucle');
              break;
            }
            // Mostrar datos recibidos en la interfaz
            if (value) {
              setSerialOutput(prev => prev + `📥 Recibido: ${value}`);
            }
          }
        } catch (error) {
          console.error('Error leyendo datos:', error);
          // Solo mostrar errores que no sean de cancelación esperada
          if (error.name !== 'AbortError' && isConnected) {
            setSerialOutput(prev => prev + `❌ Error leyendo datos: ${error.message}\n`);
          }
        } finally {
          // Limpiar recursos cuando termine el bucle
          console.log('Liberando reader en readLoop');
          try {
            newReader.releaseLock();
          } catch (releaseError) {
            console.log('Reader ya estaba liberado:', releaseError);
          }
        }
      };

      // Iniciar el bucle de lectura en segundo plano
      readLoop();

    } catch (err) {
      console.error('❌ Error al conectar al puerto serie:', err);
      
      // Proporcionar mensajes de error específicos según el tipo de fallo
      let errorMessage = '';
      if (err.message.includes('Failed to open serial port')) {
        errorMessage = `❌ No se pudo abrir el puerto serie. Posibles causas:
📍 El puerto está siendo usado por otra aplicación
📍 El dispositivo no está conectado correctamente
📍 Permisos insuficientes
💡 Soluciones:
  • Cierra otros programas que usen el puerto (Arduino IDE, PuTTY, etc.)
  • Desconecta y reconecta el dispositivo USB
  • Reinicia el navegador
  • Verifica que el dispositivo esté en COM4
`;
      } else if (err.name === 'NotFoundError') {
        errorMessage = '❌ No se seleccionó ningún puerto serie.\n';
      } else if (err.name === 'SecurityError') {
        errorMessage = '❌ Error de seguridad. El navegador bloqueó el acceso al puerto serie.\n';
      } else {
        errorMessage = `❌ Error al conectar: ${err.message}\n`;
      }
      
      setSerialOutput(prev => prev + errorMessage);
      // Limpiar estados en caso de error
      setIsConnected(false);
      setPort(null);
      setReader(null);
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Cierra la conexión serial de forma segura
   * Implementa secuencia correcta para evitar errores de stream bloqueado
   */
  const handleDisconnectSerial = async () => {
    // Verificar si hay una conexión activa
    if (!port && !isConnected) return; // Ya está desconectado
    
    try {
      setSerialOutput(prev => prev + '🔄 Desconectando dispositivo...\n');
      
      // PASO 1: Marcar como desconectado para detener el bucle de lectura
      // Esto es crucial para evitar conflictos con el reader
      setIsConnected(false);
      
      // PASO 2: Esperar a que el bucle de lectura termine naturalmente
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // PASO 3: Cancelar el reader si existe
      if (reader) {
        try {
          await reader.cancel(); // Cancela operaciones pendientes
          setSerialOutput(prev => prev + '🔄 Reader cancelado...\n');
        } catch (cancelError) {
          console.log('Error cancelando reader:', cancelError);
          setSerialOutput(prev => prev + '⚠️ Reader ya estaba cancelado...\n');
        }
        setReader(null);
      }
      
      // PASO 4: Esperar para asegurar liberación completa del stream
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // PASO 5: Cerrar el puerto físico
      if (port && port.readable) {
        try {
          await port.close(); // Cierra la conexión física
          setSerialOutput(prev => prev + '🔄 Puerto cerrado...\n');
        } catch (closeError) {
          console.log('Error cerrando puerto:', closeError);
          setSerialOutput(prev => prev + '⚠️ Puerto ya estaba cerrado...\n');
        }
      }
      
      setPort(null);
      setSerialOutput(prev => prev + '✅ Dispositivo desconectado correctamente.\n');
      
    } catch (error) {
      console.error('Error desconectando:', error);
      setSerialOutput(prev => prev + `❌ Error desconectando: ${error.message}\n`);
    } finally {
      // PASO 6: Forzar reset del estado sin importar errores
      // Esto asegura que la UI refleje el estado real
      setPort(null);
      setReader(null);
      setIsConnected(false);
    }
  };

  /**
   * Limpia el historial de comunicación serial
   */
  const clearSerialOutput = () => {
    setSerialOutput('');
  };

  /**
   * Cleanup al desmontar el componente
   * Asegura que las conexiones se cierren correctamente al cerrar la app
   */
  useEffect(() => {
    return () => {
      if (port && isConnected) {
        handleDisconnectSerial();
      }
    };
  }, [port, isConnected, reader]);

  return (
    <div className="app">
      <h1 className="app-title">Peluquería - Sistema de Reservas</h1>

      {/* SECCIÓN: Controles Web Serial API */}
      {/* Solo se muestra si el navegador soporta Web Serial API */}
      {isSerialSupported && (
        <div className="serial-controls">
          <div className="serial-buttons">
            {/* Botón de conexión - cambia estado según conexión */}
            <button
              onClick={handleConnectSerial}
              disabled={isConnected || isConnecting}
              className={`connect-serial-button ${isConnected ? 'connected' : ''}`}
            >
              {isConnecting ? '🔄 Conectando...' : isConnected ? '✅ Conectado' : '🔌 Conectar dispositivo'}
            </button>

            {/* Botón de desconexión - solo visible cuando hay conexión */}
            {isConnected && (
              <button
                onClick={handleDisconnectSerial}
                className="disconnect-serial-button"
              >
                🔌 Desconectar
              </button>
            )}

            {/* Botón para limpiar historial - solo visible cuando hay salida */}
            {serialOutput && (
              <button
                onClick={clearSerialOutput}
                className="clear-output-button"
              >
                🧹 Limpiar
              </button>
            )}
          </div>

          {/* Indicador visual del estado de conexión */}
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              ●
            </span>
            <span className="status-text">
              {isConnected ? 'Dispositivo conectado' : 'Dispositivo desconectado'}
            </span>
          </div>
        </div>
      )}

      {/* SECCIÓN: Advertencias de compatibilidad */}
      {/* Se muestra cuando Web Serial API no está disponible */}
      {!isSerialSupported && (
        <div className="serial-warning">
          {isMobile ? (
            isAndroidChrome ? (
              androidVersion < 12 ? (
                <div>
                  📱 <strong>Android {androidVersion}</strong> detectado. 
                  <br />⚠️ Web Serial API requiere <strong>Android 12+</strong> con Chrome.
                  <br />🔄 Actualiza tu Android o usa Chrome en PC.
                </div>
              ) : (
                <div>
                  📱 <strong>Android {androidVersion}</strong> detectado con Chrome.
                  <br />🔧 Web Serial API puede no estar habilitada. 
                  <br />💡 Activa flags experimentales en <code>chrome://flags</code>
                </div>
              )
            ) : (
              <div>
                📱 <strong>Móvil detectado:</strong> Web Serial API no disponible.
                <br />✅ <strong>Solución:</strong> Usa Chrome en Android 12+ o Chrome/Edge en PC.
              </div>
            )
          ) : (
            <div>
              🖥️ <strong>PC detectado:</strong> Web Serial API no disponible.
              <br />✅ <strong>Solución:</strong> Usa Chrome o Edge para conectar dispositivos seriales.
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN: Consola de comunicación serial */}
      {/* Muestra el log de comunicación con el dispositivo */}
      {serialOutput && (
        <div className="serial-output">
          <div className="serial-output-header">
            <strong>📡 Comunicación Serial:</strong>
          </div>
          <pre className="serial-content">{serialOutput}</pre>
        </div>
      )}

      {/* SECCIÓN: Contenido principal de la aplicación */}
      <div className="app-content">
        {booking ? (
          // Vista del resumen de reserva
          <BookingSummary booking={booking} onBack={handleBack} />
        ) : (
          // Vista del formulario de reserva
          <ServiceForm onBook={handleBook} />
        )}
      </div>
    </div>
  );
}

export default App;
