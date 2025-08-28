import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { QuizDisplay } from './components/QuizDisplay';
import { ClickerResults } from './components/ClickerResults';
import { QuizManager } from './components/QuizManager';
import './App.css';

/**
 * Componente principal del sistema de concursos con clickers
 * Implementa Web Serial API para recibir respuestas de dispositivos clicker
 * Comunicación unidireccional: Clicker -> Aplicación Web
 * @author Rodrigo Collado
 */
function App() {
  // Estados para navegación por pestañas
  const [activeTab, setActiveTab] = useState('clicker'); // 'clicker', 'manager'
  
  // Estados para el sistema de concursos
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isQuizActive, setIsQuizActive] = useState(false);
  
  // Estados para integración con QuizManager
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Estados para la comunicación serial usando Web Serial API
  const [serialOutput, setSerialOutput] = useState(''); // Log de comunicación serial
  const [port, setPort] = useState(null); // Puerto serie activo
  const [reader, setReader] = useState(null); // Reader para lectura de datos
  const [isConnected, setIsConnected] = useState(false); // Estado de conexión
  const [isConnecting, setIsConnecting] = useState(false); // Estado de conexión en progreso
  const [virtualSocket, setVirtualSocket] = useState(null); // WebSocket para simulador virtual
  const [isVirtualMode, setIsVirtualMode] = useState(false); // Modo simulador virtual

  // Pregunta de ejemplo para demostración
  const sampleQuestion = {
    id: 1,
    question: "¿Cuál es la capital de España?",
    options: {
      A: "Madrid",
      B: "Barcelona", 
      C: "Sevilla",
      D: "Valencia"
    },
    correctAnswer: "A",
    timeLimit: 30
  };

  // Verificar compatibilidad con Web Serial API
  const isSerialSupported = 'serial' in navigator;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isAndroidChrome = /Android.*Chrome/i.test(navigator.userAgent);
  
  const getAndroidVersion = () => {
    const match = navigator.userAgent.match(/Android\s([0-9\.]*)/);
    return match ? parseFloat(match[1]) : 0;
  };
  
  const androidVersion = getAndroidVersion();
  const isCompatibleAndroid = isAndroidChrome && androidVersion >= 12;

  /**
   * Funciones para integración con QuizManager
   */
  const handleQuizStart = (quiz, questions) => {
    setActiveQuiz(quiz);
    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setActiveTab('clicker'); // Cambiar a la pestaña de clickers
    setSerialOutput(prev => prev + `🎯 Quiz iniciado: ${quiz.title} (${questions.length} preguntas)\n`);
  };

  const handleQuestionStart = (question, questionIndex) => {
    // Convertir formato del backend al formato esperado por el clicker
    const formattedQuestion = {
      id: question.id,
      question: question.questionText,
      options: {
        A: question.optionA,
        B: question.optionB,
        C: question.optionC,
        D: question.optionD
      },
      correctAnswer: question.correctAnswer,
      timeLimit: question.timeLimit || 30
    };
    
    setCurrentQuestion(formattedQuestion);
    setCurrentQuestionIndex(questionIndex);
    setAnswers([]);
    setIsQuizActive(true);
    setActiveTab('clicker'); // Cambiar a la pestaña de clickers
    setSerialOutput(prev => prev + `🎯 Pregunta ${questionIndex + 1} iniciada: ${question.questionText}\n`);
  };

  const handleQuizEnd = () => {
    setActiveQuiz(null);
    setQuizQuestions([]);
    setCurrentQuestion(null);
    setIsQuizActive(false);
    setCurrentQuestionIndex(0);
    setSerialOutput(prev => prev + `🏁 Quiz finalizado\n`);
  };

  /**
   * Inicia una nueva pregunta del concurso
   */
  const startQuestion = () => {
    // Si hay un quiz activo, usar sus preguntas, si no usar la pregunta de ejemplo
    if (activeQuiz && quizQuestions.length > 0 && currentQuestionIndex < quizQuestions.length) {
      const question = quizQuestions[currentQuestionIndex];
      handleQuestionStart(question, currentQuestionIndex);
    } else {
      // Usar pregunta de ejemplo
      setCurrentQuestion(sampleQuestion);
      setAnswers([]);
      setIsQuizActive(true);
      setSerialOutput(prev => prev + `🎯 Pregunta de ejemplo iniciada: ${sampleQuestion.question}\n`);
    }
  };

  /**
   * Finaliza la pregunta actual y muestra resultados
   */
  const endQuestion = () => {
    setIsQuizActive(false);
    const questionType = activeQuiz ? 'del quiz' : 'de ejemplo';
    setSerialOutput(prev => prev + `⏰ Pregunta ${questionType} finalizada. Respuestas recibidas: ${answers.length}\n`);
  };

  /**
   * Avanza a la siguiente pregunta del quiz (si existe)
   */
  const nextQuestion = () => {
    if (activeQuiz && quizQuestions.length > 0 && currentQuestionIndex < quizQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const nextQ = quizQuestions[nextIndex];
      handleQuestionStart(nextQ, nextIndex);
    } else {
      // No hay más preguntas, finalizar quiz
      handleQuizEnd();
    }
  };

  /**
   * Procesa una respuesta recibida del clicker
   */
  const handleAnswer = (answer, deviceId) => {
    console.log(`🔍 handleAnswer llamado - answer: ${answer}, deviceId: ${deviceId}, isQuizActive: ${isQuizActive}, currentQuestion:`, currentQuestion);
    
    if (!isQuizActive || !currentQuestion) {
      console.log(`❌ Respuesta rechazada - Quiz inactivo o sin pregunta actual`);
      setSerialOutput(prev => prev + `❌ Respuesta rechazada: Quiz ${isQuizActive ? 'activo' : 'inactivo'}, Pregunta ${currentQuestion ? 'presente' : 'ausente'}\n`);
      return;
    }

    const newAnswer = {
      id: Date.now(),
      deviceId,
      answer,
      timestamp: new Date().toISOString(),
      isCorrect: answer === currentQuestion.correctAnswer
    };

    // Buscar si ya existe una respuesta de este dispositivo
    setAnswers(prev => {
      const existingAnswerIndex = prev.findIndex(ans => ans.deviceId === deviceId);
      
      if (existingAnswerIndex !== -1) {
        // Si existe, sobrescribir la respuesta anterior
        const updatedAnswers = [...prev];
        updatedAnswers[existingAnswerIndex] = newAnswer;
        console.log(`🔄 Respuesta actualizada para dispositivo ${deviceId}: ${answer}`);
        setSerialOutput(prevOutput => prevOutput + `🔄 Respuesta actualizada: Dispositivo ${deviceId} → ${answer}\n`);
        return updatedAnswers;
      } else {
        // Si no existe, agregar nueva respuesta
        console.log(`✅ Nueva respuesta registrada para dispositivo ${deviceId}: ${answer}`);
        setSerialOutput(prevOutput => prevOutput + `✅ Respuesta registrada: Dispositivo ${deviceId} → ${answer}\n`);
        return [...prev, newAnswer];
      }
    });

    console.log(`✅ Respuesta procesada exitosamente:`, newAnswer);
  };

  /**
   * Conectar al puerto serie para recibir datos de clickers
   */
  const handleConnectSerial = async () => {
    if (!isSerialSupported) {
      alert('Tu navegador no soporta Web Serial API. Usa Chrome o Edge.');
      return;
    }

    try {
      setIsConnecting(true);
      setSerialOutput(prev => prev + '🔄 Intentando conectar al clicker...\n');

      // Intentar detectar simulador virtual primero
      const virtualClickerResponse = await tryConnectVirtualClicker();
      if (virtualClickerResponse) {
        setSerialOutput(prev => prev + '🎮 Simulador virtual detectado y conectado\n');
        setIsConnected(true);
        setIsConnecting(false);
        return;
      }

      // Si no hay simulador virtual, usar puerto serie físico
      const selectedPort = await navigator.serial.requestPort();
      await selectedPort.open({ baudRate: 9600 });

      setPort(selectedPort);
      setIsConnected(true);
      setSerialOutput(prev => prev + '✅ Clicker conectado exitosamente\n');

      // Configurar reader para leer datos
      const reader = selectedPort.readable.getReader();
      setReader(reader);

    } catch (error) {
      console.error('Error conectando:', error);
      setSerialOutput(prev => prev + `❌ Error de conexión: ${error.message}\n`);
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Intentar conectar al simulador virtual
   */
  const tryConnectVirtualClicker = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/status');
      if (response.ok) {
        const status = await response.json();
        setSerialOutput(prev => prev + `🎮 Simulador virtual encontrado: ${status.deviceId}\n`);
        setIsVirtualMode(true);
        
        // Configurar listener para respuestas del simulador
        setupVirtualClickerListener();
        return true;
      }
    } catch (error) {
      // Simulador no disponible, continuar con puerto serie físico
      setSerialOutput(prev => prev + '📡 Simulador virtual no encontrado, usando puerto serie físico...\n');
    }
    return false;
  };

  /**
   * Configurar listener para el simulador virtual
   */
  const setupVirtualClickerListener = () => {
    try {
      setSerialOutput(prev => prev + '🎮 Conectando via Socket.IO al simulador virtual...\n');
      
      // Conectar via Socket.IO al simulador virtual
      const socket = io('http://localhost:3001');
      
      socket.on('connect', () => {
        setVirtualSocket(socket);
        setIsVirtualMode(true);
        setSerialOutput(prev => prev + '🔌 Socket.IO conectado al simulador virtual\n');
      });

      socket.on('arduino-data', (data) => {
        try {
          console.log('🔍 Datos recibidos del simulador:', data);
          
          if (data.type === 'arduino-data' && data.payload) {
            // Procesar respuesta del simulador como si fuera del Arduino real
            const { deviceId, answer } = data.payload;
            console.log(`🔍 Datos extraídos - deviceId: ${deviceId}, answer: ${answer}`);
            setSerialOutput(prev => prev + `📡 Simulador virtual: ${deviceId}:${answer}\n`);
            handleAnswer(answer, deviceId);
          } else {
            console.log('❌ Datos del simulador en formato incorrecto:', data);
          }
        } catch (error) {
          console.error('Error procesando mensaje del simulador:', error);
        }
      });

      socket.on('disconnect', () => {
        setVirtualSocket(null);
        setIsVirtualMode(false);
        setSerialOutput(prev => prev + '🔌 Socket.IO desconectado del simulador\n');
      });

      socket.on('connect_error', (error) => {
        console.error('Error de conexión Socket.IO:', error);
        setSerialOutput(prev => prev + `❌ Error Socket.IO: ${error.message}\n`);
      });

    } catch (error) {
      console.error('Error configurando Socket.IO:', error);
      setSerialOutput(prev => prev + `❌ Error configurando Socket.IO: ${error.message}\n`);
    }
  };

  /**
   * Desconectar el puerto serie
   */
  const handleDisconnectSerial = async () => {
    if (!port && !isConnected && !isVirtualMode) return;

    try {
      // Desconectar Socket.IO si está en modo virtual
      if (virtualSocket) {
        virtualSocket.disconnect();
        setVirtualSocket(null);
        setSerialOutput(prev => prev + '🔌 Socket.IO desconectado del simulador virtual\n');
      }
      
      setIsVirtualMode(false);

      // Desconectar puerto serie físico
      if (reader) {
        await reader.cancel();
        reader.releaseLock();
        setReader(null);
      }

      if (port) {
        await port.close();
        setPort(null);
      }

      setIsConnected(false);
      setSerialOutput(prev => prev + '🔌 Dispositivo desconectado\n');
    } catch (error) {
      console.error('Error desconectando:', error);
      setSerialOutput(prev => prev + `❌ Error al desconectar: ${error.message}\n`);
    }
  };

  /**
   * Limpiar el log de comunicación serial
   */
  const clearSerialOutput = () => {
    setSerialOutput('');
  };

  // Efecto para capturar respuestas por teclado
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Solo procesar si hay una pregunta activa
      if (!isQuizActive || !currentQuestion) return;
      
      const key = event.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        event.preventDefault(); // Evitar scroll u otras acciones
        handleAnswer(key, 'KEYBOARD');
        setSerialOutput(prev => prev + `⌨️ Respuesta por teclado: ${key}\n`);
      }
    };

    // Añadir event listener para teclas
    document.addEventListener('keydown', handleKeyPress);

    // Cleanup del event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isQuizActive, currentQuestion]);

  // Efecto para leer datos del puerto serie
  useEffect(() => {
    if (!reader || !isConnected) return;

    const readData = async () => {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          // Decodificar datos recibidos
          const textDecoder = new TextDecoder();
          const receivedData = textDecoder.decode(value).trim();
          
          setSerialOutput(prev => prev + `📡 Datos recibidos: ${receivedData}\n`);

          // Parsear respuesta del clicker (formato esperado: "DEVICE_ID:ANSWER")
          const [deviceId, answer] = receivedData.split(':');
          if (deviceId && answer && ['A', 'B', 'C', 'D'].includes(answer.toUpperCase())) {
            handleAnswer(answer.toUpperCase(), deviceId);
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error leyendo datos:', error);
          setSerialOutput(prev => prev + `❌ Error leyendo datos: ${error.message}\n`);
        }
      }
    };

    readData();

    return () => {
      if (reader) {
        reader.cancel().catch(console.error);
      }
    };
  }, [reader, isConnected]);

  return (
    <div className="app">
      <h1 className="app-title">Sistema de Concursos con Clickers</h1>

      {/* NAVEGACIÓN POR PESTAÑAS */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'clicker' ? 'active' : ''}`}
          onClick={() => setActiveTab('clicker')}
        >
          🎮 Sistema Clicker
        </button>
        <button 
          className={`tab-button ${activeTab === 'manager' ? 'active' : ''}`}
          onClick={() => setActiveTab('manager')}
        >
          📋 Administrar Quizzes
        </button>
      </div>

      {/* CONTENIDO SEGÚN PESTAÑA ACTIVA */}
      {activeTab === 'manager' ? (
        <QuizManager 
          onQuizStart={handleQuizStart}
          onQuestionStart={handleQuestionStart}
          onQuizEnd={handleQuizEnd}
        />
      ) : (
        <div className="clicker-system">
          {/* SECCIÓN: Controles del Concurso */}
          <div className="quiz-controls">
            {/* Información del quiz activo */}
            {activeQuiz && (
              <div className="active-quiz-info">
                <h3>📋 Quiz Activo: {activeQuiz.title}</h3>
                <p>Pregunta {currentQuestionIndex + 1} de {quizQuestions.length}</p>
              </div>
            )}
            
            <div className="control-buttons">
              <button
                onClick={startQuestion}
                disabled={isQuizActive}
                className={`start-quiz-button ${isQuizActive ? 'active' : ''}`}
              >
                {isQuizActive ? '🎯 Pregunta Activa' : 
                 activeQuiz ? `▶️ Iniciar Pregunta ${currentQuestionIndex + 1}` : 
                 '▶️ Iniciar Pregunta de Ejemplo'}
              </button>

              {isQuizActive && (
                <button
                  onClick={endQuestion}
                  className="end-quiz-button"
                >
                  ⏹️ Finalizar Pregunta
                </button>
              )}

              {/* Botón para siguiente pregunta del quiz */}
              {activeQuiz && !isQuizActive && (currentQuestionIndex < quizQuestions.length - 1) && (
                <button
                  onClick={nextQuestion}
                  className="next-question-button"
                >
                  ➡️ Siguiente Pregunta
                </button>
              )}

              {/* Botón para finalizar quiz */}
              {activeQuiz && !isQuizActive && (
                <button
                  onClick={handleQuizEnd}
                  className="end-quiz-button"
                >
                  🏁 Finalizar Quiz
                </button>
              )}
            </div>

            <div className="quiz-status">
              <span className={`status-indicator ${isQuizActive ? 'active' : 'inactive'}`}>
                ●
              </span>
              <span className="status-text">
                {isQuizActive ? `Pregunta activa - ${answers.length} respuestas` : 
                 activeQuiz ? `Quiz: ${activeQuiz.title} - Inactivo` : 
                 'Concurso inactivo'}
              </span>
            </div>
          </div>

          {/* SECCIÓN: Controles Web Serial API */}
          {isSerialSupported && (
            <div className="serial-controls">
              <div className="serial-buttons">
                <button
                  onClick={handleConnectSerial}
                  disabled={isConnected || isConnecting}
                  className={`connect-serial-button ${isConnected ? 'connected' : ''}`}
                >
                  {isConnecting ? '🔄 Conectando...' : isConnected ? '✅ Clicker Conectado' : '🎮 Conectar Clicker'}
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
                  {isConnected ? 'Clicker conectado' : 'Clicker desconectado'}
                </span>
              </div>
            </div>
          )}

          {/* SECCIÓN: Advertencias de compatibilidad */}
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
                    <br />✅ <strong>Solución:</strong> Usa Chrome en Android 12+ o Chrome/Edge en PC para conectar clickers.
                  </div>
                )
              ) : (
                <div>
                  🖥️ <strong>PC detectado:</strong> Web Serial API no disponible.
                  <br />✅ <strong>Solución:</strong> Usa Chrome o Edge para conectar clickers seriales.
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN: Consola de comunicación serial */}
          {serialOutput && (
            <div className="serial-output">
              <div className="serial-output-header">
                <strong>🎮 Comunicación con Clickers:</strong>
              </div>
              <pre className="serial-content">{serialOutput}</pre>
            </div>
          )}

            {/* SECCIÓN: Contenido principal de la aplicación */}
          <div className="app-content">
            {currentQuestion ? (
              <div className="quiz-container">
                {/* Instrucciones de uso cuando hay pregunta activa */}
                {isQuizActive && (
                  <div className="keyboard-instructions">
                    <div className="keyboard-info">
                      ⌨️ <strong>Responder por teclado:</strong> Presiona A, B, C o D para responder
                    </div>
                  </div>
                )}
                
                <QuizDisplay 
                  question={currentQuestion} 
                  isActive={isQuizActive}
                  answersCount={answers.length}
                />
                <ClickerResults 
                  answers={answers} 
                  correctAnswer={currentQuestion.correctAnswer}
                />
              </div>
            ) : (
              <div className="welcome-screen">
                <h2>🎯 Sistema de Concursos con Clickers</h2>
                <p>Conecta tu dispositivo clicker y presiona "Iniciar Pregunta" para comenzar.</p>
                <div className="feature-list">
                  <div className="feature-item">🎮 Clickers con 4 botones (A, B, C, D)</div>
                  <div className="feature-item">⌨️ Respuestas por teclado (A, B, C, D)</div>
                  <div className="feature-item">📡 Comunicación unidireccional via puerto serie</div>
                  <div className="feature-item">⚡ Respuestas en tiempo real</div>
                  <div className="feature-item">📊 Resultados instantáneos</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
