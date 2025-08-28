import { useState, useEffect } from 'react';
import './QuizDisplay.css';

/**
 * Componente para mostrar la pregunta actual del concurso
 * @param {Object} question - Objeto con la pregunta y opciones
 * @param {boolean} isActive - Si la pregunta está activa
 * @param {number} answersCount - Número de respuestas recibidas
 */
export function QuizDisplay({ question, isActive, answersCount }) {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit);

  useEffect(() => {
    if (!isActive) return;

    setTimeLeft(question.timeLimit);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, question.timeLimit]);

  const getTimeColor = () => {
    if (timeLeft > 15) return '#10B981'; // Verde
    if (timeLeft > 5) return '#F59E0B';  // Amarillo
    return '#EF4444'; // Rojo
  };

  return (
    <div className="quiz-display">
      <div className="quiz-header">
        <div className="question-info">
          <span className="question-number">Pregunta #{question.id}</span>
          <div className="participants-count">
            👥 {answersCount} respuestas
          </div>
        </div>
        
        {isActive && (
          <div className="timer" style={{ color: getTimeColor() }}>
            ⏱️ {timeLeft}s
          </div>
        )}
      </div>

      <div className="question-container">
        <h2 className="question-text">{question.question}</h2>
        
        <div className="options-grid">
          {Object.entries(question.options).map(([letter, option]) => (
            <div key={letter} className="option-card">
              <div className="option-letter">{letter}</div>
              <div className="option-text">{option}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="quiz-status">
        {isActive ? (
          <div className="status-active">
            🟢 Pregunta activa - Esperando respuestas de clickers
          </div>
        ) : (
          <div className="status-ended">
            🔴 Pregunta finalizada
          </div>
        )}
      </div>
    </div>
  );
}
