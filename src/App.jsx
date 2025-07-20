import { useState, useEffect } from 'react';
import { ServiceForm } from './components/ServiceForm';
import { BookingSummary } from './components/BookingSummary';
import './App.css';

function App() {
  const [booking, setBooking] = useState(null);
  const [serialOutput, setSerialOutput] = useState('');
  const [port, setPort] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Verificar si el navegador soporta Web Serial API
  const isSerialSupported = 'serial' in navigator;
  
  // Detectar si está en móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Detectar si es Android con Chrome
  const isAndroidChrome = /Android.*Chrome/i.test(navigator.userAgent);
  
  // Verificar versión de Android (aproximada)
  const getAndroidVersion = () => {
    const match = navigator.userAgent.match(/Android\s([0-9\.]*)/);
    return match ? parseFloat(match[1]) : 0;
  };
  
  const androidVersion = getAndroidVersion();
  const isCompatibleAndroid = isAndroidChrome && androidVersion >= 12;

  const handleBook = (bookingData) => {
    setBooking(bookingData);
    
    // Enviar datos al dispositivo serial si está conectado
    if (isConnected && port) {
      sendToSerial(`NUEVA_RESERVA:${bookingData.name}|${bookingData.service}|${bookingData.date}|${bookingData.time}\n`);
    }
  };

  const handleBack = () => {
    setBooking(null);
  };

  const sendToSerial = async (data) => {
    if (!port || !isConnected) return;
    
    try {
      const writer = port.writable.getWriter();
      await writer.write(new TextEncoder().encode(data));
      writer.releaseLock();
      setSerialOutput(prev => prev + `📤 Enviado: ${data}`);
    } catch (error) {
      console.error('Error enviando datos:', error);
      setSerialOutput(prev => prev + `❌ Error enviando datos: ${error.message}\n`);
    }
  };

  const handleConnectSerial = async () => {
    if (!isSerialSupported) {
      setSerialOutput('❌ Tu navegador no soporta Web Serial API. Usa Chrome/Edge.\n');
      return;
    }

    setIsConnecting(true);
    
    try {
      const requestedPort = await navigator.serial.requestPort();
      await requestedPort.open({ baudRate: 9600 });

      const decoder = new TextDecoderStream();
      requestedPort.readable.pipeTo(decoder.writable);
      const reader = decoder.readable.getReader();

      setPort(requestedPort);
      setIsConnected(true);
      setSerialOutput('✅ Conectado correctamente al dispositivo serial.\n');

      // Leer datos en bucle
      const readLoop = async () => {
        try {
          while (isConnected) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              setSerialOutput(prev => prev + `📥 Recibido: ${value}`);
            }
          }
        } catch (error) {
          console.error('Error leyendo datos:', error);
          setSerialOutput(prev => prev + `❌ Error leyendo datos: ${error.message}\n`);
        } finally {
          reader.releaseLock();
        }
      };

      readLoop();

    } catch (err) {
      console.error('❌ Error al conectar al puerto serie:', err);
      setSerialOutput(prev => prev + `❌ Error al conectar: ${err.message}\n`);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectSerial = async () => {
    if (port && isConnected) {
      try {
        await port.close();
        setPort(null);
        setIsConnected(false);
        setSerialOutput(prev => prev + '🔌 Dispositivo desconectado.\n');
      } catch (error) {
        console.error('Error desconectando:', error);
        setSerialOutput(prev => prev + `❌ Error desconectando: ${error.message}\n`);
      }
    }
  };

  const clearSerialOutput = () => {
    setSerialOutput('');
  };

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (port && isConnected) {
        handleDisconnectSerial();
      }
    };
  }, [port, isConnected]);

  return (
    <div className="app">
      <h1 className="app-title">Peluquería - Sistema de Reservas</h1>

      {isSerialSupported && (
        <div className="serial-controls">
          <div className="serial-buttons">
            <button
              onClick={handleConnectSerial}
              disabled={isConnected || isConnecting}
              className={`connect-serial-button ${isConnected ? 'connected' : ''}`}
            >
              {isConnecting ? '🔄 Conectando...' : isConnected ? '✅ Conectado' : '🔌 Conectar dispositivo'}
            </button>

            {isConnected && (
              <button
                onClick={handleDisconnectSerial}
                className="disconnect-serial-button"
              >
                🔌 Desconectar
              </button>
            )}

            {serialOutput && (
              <button
                onClick={clearSerialOutput}
                className="clear-output-button"
              >
                🧹 Limpiar
              </button>
            )}
          </div>

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

      {serialOutput && (
        <div className="serial-output">
          <div className="serial-output-header">
            <strong>📡 Comunicación Serial:</strong>
          </div>
          <pre className="serial-content">{serialOutput}</pre>
        </div>
      )}

      <div className="app-content">
        {booking ? (
          <BookingSummary booking={booking} onBack={handleBack} />
        ) : (
          <ServiceForm onBook={handleBook} />
        )}
      </div>
    </div>
  );
}

export default App;
