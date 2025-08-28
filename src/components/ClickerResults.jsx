import { useMemo } from 'react';
import './ClickerResults.css';

/**
 * Componente para mostrar los resultados de las respuestas de los clickers
 * @param {Array} answers - Array de respuestas recibidas
 * @param {string} correctAnswer - La respuesta correcta (A, B, C, D)
 */
export function ClickerResults({ answers, correctAnswer }) {
  // Calcular estadísticas de respuestas
  const stats = useMemo(() => {
    const answerCounts = { A: 0, B: 0, C: 0, D: 0 };
    let correctCount = 0;
    
    answers.forEach(answer => {
      answerCounts[answer.answer]++;
      if (answer.isCorrect) {
        correctCount++;
      }
    });

    const total = answers.length;
    const correctPercentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return {
      answerCounts,
      correctCount,
      total,
      correctPercentage
    };
  }, [answers, correctAnswer]);

  const getBarWidth = (count) => {
    return stats.total > 0 ? (count / stats.total) * 100 : 0;
  };

  const getOptionClass = (option) => {
    let classes = 'result-bar';
    if (option === correctAnswer) {
      classes += ' correct';
    }
    return classes;
  };

  if (answers.length === 0) {
    return (
      <div className="clicker-results">
        <h3 className="results-title">📊 Resultados en Tiempo Real</h3>
        <div className="no-responses">
          <div className="waiting-icon">⏳</div>
          <p>Esperando respuestas de clickers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="clicker-results">
      <div className="results-header">
        <h3 className="results-title">📊 Resultados en Tiempo Real</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Respuestas</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.correctCount}</span>
            <span className="stat-label">Correctas</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.correctPercentage}%</span>
            <span className="stat-label">Acierto</span>
          </div>
        </div>
      </div>

      <div className="results-chart">
        {['A', 'B', 'C', 'D'].map(option => (
          <div key={option} className="result-item">
            <div className="option-header">
              <span className={`option-label ${option === correctAnswer ? 'correct' : ''}`}>
                {option}
                {option === correctAnswer && ' ✓'}
              </span>
              <span className="count">
                {stats.answerCounts[option]} 
                {stats.total > 0 && ` (${Math.round((stats.answerCounts[option] / stats.total) * 100)}%)`}
              </span>
            </div>
            <div className="bar-container">
              <div 
                className={getOptionClass(option)}
                style={{ width: `${getBarWidth(stats.answerCounts[option])}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-answers">
        <h4>🕐 Últimas Respuestas:</h4>
        <div className="answers-list">
          {answers.slice(-5).reverse().map(answer => (
            <div key={answer.id} className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
              <span className="device-id">Clicker {answer.deviceId}</span>
              <span className="answer-value">{answer.answer}</span>
              <span className="result-icon">
                {answer.isCorrect ? '✅' : '❌'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
