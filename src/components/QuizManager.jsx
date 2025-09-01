import { useState, useEffect } from 'react';
import './QuizManager.css';

/**
 * Componente completo para administrar quizzes - CRUD, control de estado, participantes
 * 
 * FUNCIONES DISPONIBLES DEL BACKEND:
 * 
 * QUIZ MANAGEMENT:
 * ✅ createQuiz() - Crear nuevo quiz
 * ✅ loadQuizzes() - Cargar todos los quizzes
 * ✅ loadQuizById() - Cargar quiz específico por ID
 * ✅ updateQuiz() - Actualizar quiz existente
 * ✅ deleteQuiz() - Eliminar quiz
 * ✅ startQuiz() - Iniciar quiz
 * ✅ endQuiz() - Finalizar quiz
 * ✅ loadQuizResults() - Cargar resultados del quiz
 * ✅ duplicateQuiz() - Duplicar quiz existente
 * ✅ exportQuizResults() - Exportar resultados
 * 
 * QUESTION MANAGEMENT:
 * ✅ createQuestion() - Crear nueva pregunta
 * ✅ loadQuestions() - Cargar preguntas de un quiz
 * ✅ loadQuestionById() - Cargar pregunta específica por ID
 * ✅ updateQuestion() - Actualizar pregunta existente
 * ✅ deleteQuestion() - Eliminar pregunta
 * ✅ startQuestion() - Iniciar pregunta específica
 * ✅ endQuestion() - Finalizar pregunta activa
 * ✅ loadQuestionAnswers() - Cargar respuestas de una pregunta
 * 
 * ANSWER MANAGEMENT:
 * ✅ submitAnswer() - Enviar respuesta (para clickers)
 * 
 * PARTICIPANT MANAGEMENT:
 * ✅ loadParticipants() - Cargar todos los participantes
 * ✅ registerParticipant() - Registrar nuevo participante
 * ✅ deleteParticipant() - Eliminar participante
 * ✅ getParticipantStats() - Obtener estadísticas de participante
 * 
 * UTILITY FUNCTIONS:
 * ✅ clearQuizData() - Limpiar datos del quiz
 * ✅ refreshAllData() - Actualizar todos los datos
 */
export function QuizManager({ onQuizStart, onQuestionStart, onQuizEnd }) {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'questions', 'results', 'participants', 'edit'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para CRUD de quiz
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: ''
  });

  const [editQuiz, setEditQuiz] = useState({
    title: '',
    description: ''
  });

  // Estados para preguntas
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    timeLimit: 30,
    orderIndex: 1
  });

  // Estados para edición de preguntas
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editQuestion, setEditQuestion] = useState({
    quizId: null,
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    timeLimit: 30,
    orderIndex: 1
  });

  // Estados para resultados y respuestas
  const [quizResults, setQuizResults] = useState(null);
  const [questionAnswers, setQuestionAnswers] = useState([]);

  // Estados para participantes
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState({
    clickerId: '',
    name: ''
  });

  // Estados para pregunta activa
  const [activeQuestion, setActiveQuestion] = useState(null);

  const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api`;

  // Cargar datos al iniciar
  useEffect(() => {
    loadQuizzes();
    loadParticipants();
  }, []);

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // =============== FUNCIONES DE CARGA ===============

  /**
   * Cargar todos los quizzes desde el backend
   */
  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz`);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      } else {
        setError('Error al cargar quizzes');
      }
    } catch (err) {
      setError('Error de conexión con el backend');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar preguntas de un quiz específico
   */
  const loadQuestions = async (quizId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz/${quizId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        setError('Error al cargar preguntas');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar resultados de un quiz
   */
  const loadQuizResults = async (quizId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz/${quizId}/results`);
      if (response.ok) {
        const data = await response.json();
        console.log('Datos de resultados recibidos:', data);
        
        // Transformar los datos del backend al formato esperado por el frontend
        const transformedResults = transformResultsData(data);
        setQuizResults(transformedResults);
      } else {
        setError('Error al cargar resultados');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Transformar datos de resultados del backend al formato del frontend
   */
  const transformResultsData = (backendData) => {
    const { quiz, results } = backendData;
    
    // Calcular estadísticas globales
    let totalAnswers = 0;
    let totalCorrectAnswers = 0;
    const participantStats = {};
    
    results.forEach(questionResult => {
      totalAnswers += questionResult.totalAnswers;
      totalCorrectAnswers += questionResult.correctCount;
      
      // Procesar respuestas por participante
      questionResult.answers.forEach(answer => {
        if (!participantStats[answer.clickerId]) {
          participantStats[answer.clickerId] = {
            id: answer.clickerId,
            name: answer.clickerId,
            correctAnswers: 0,
            totalAnswers: 0
          };
        }
        
        participantStats[answer.clickerId].totalAnswers += 1;
        if (answer.isCorrect) {
          participantStats[answer.clickerId].correctAnswers += 1;
        }
      });
    });
    
    return {
      quiz,
      results, // Mantener los resultados detallados del backend
      totalParticipants: Object.keys(participantStats).length,
      totalQuestions: results.length,
      correctAnswers: totalCorrectAnswers,
      totalAnswers,
      participants: Object.values(participantStats)
    };
  };

  /**
   * Cargar respuestas de una pregunta específica
   */
  const loadQuestionAnswers = async (questionId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz/questions/${questionId}/answers`);
      if (response.ok) {
        const data = await response.json();
        setQuestionAnswers(data);
      } else {
        setError('Error al cargar respuestas');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar todos los participantes
   */
  const loadParticipants = async () => {
    try {
      const response = await fetch(`${API_BASE}/quiz/participants/all`);
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
      }
    } catch (err) {
      console.error('Error loading participants:', err);
    }
  };

  /**
   * Cargar un quiz específico por ID
   */
  const loadQuizById = async (quizId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz/${quizId}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        setError('Error al cargar el quiz');
        return null;
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar una pregunta específica por ID
   */
  const loadQuestionById = async (questionId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz/questions/${questionId}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        setError('Error al cargar la pregunta');
        return null;
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // =============== FUNCIONES CRUD DE QUIZ ===============

  /**
   * Crear un nuevo quiz
   */
  const createQuiz = async () => {
    if (!newQuiz.title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuiz),
      });

      if (response.ok) {
        const createdQuiz = await response.json();
        setQuizzes(prev => [...prev, createdQuiz]);
        setNewQuiz({ title: '', description: '' });
        setCurrentView('list');
        setSuccess('Quiz creado exitosamente');
        setError('');
      } else {
        setError('Error al crear el quiz');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar un quiz existente
   */
  const updateQuiz = async () => {
    if (!editQuiz.title.trim() || !selectedQuiz) {
      setError('El título es obligatorio');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz/${selectedQuiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editQuiz),
      });

      if (response.ok) {
        const updatedQuiz = await response.json();
        setQuizzes(prev => prev.map(q => q.id === selectedQuiz.id ? updatedQuiz : q));
        setSelectedQuiz(updatedQuiz);
        setSuccess('Quiz actualizado exitosamente');
        setCurrentView('list');
        setError('');
      } else {
        setError('Error al actualizar el quiz');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar un quiz
   */
  const deleteQuiz = async (quizId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este quiz?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz/${quizId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQuizzes(prev => prev.filter(q => q.id !== quizId));
        setSuccess('Quiz eliminado exitosamente');
        if (selectedQuiz?.id === quizId) {
          setSelectedQuiz(null);
          setCurrentView('list');
        }
      } else {
        setError('Error al eliminar el quiz');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // =============== FUNCIONES DE CONTROL DE QUIZ ===============

  /**
   * Iniciar un quiz
   */
  const startQuiz = async (quizId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz/${quizId}/start`, {
        method: 'POST',
      });

      if (response.ok) {
        const updatedQuiz = await response.json();
        setQuizzes(prev => prev.map(q => q.id === quizId ? updatedQuiz : q));
        if (selectedQuiz?.id === quizId) {
          setSelectedQuiz(updatedQuiz);
        }
        
        // Cargar las preguntas del quiz y enviarlo al sistema de clickers
        const questionsResponse = await fetch(`${API_BASE}/quiz/${quizId}/questions`);
        if (questionsResponse.ok) {
          const quizQuestions = await questionsResponse.json();
          
          // Llamar al callback para integrar con el sistema de clickers
          if (onQuizStart) {
            onQuizStart(updatedQuiz, quizQuestions);
          }
        }
        
        setSuccess('Quiz iniciado exitosamente');
      } else {
        setError('Error al iniciar el quiz');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Finalizar un quiz
   */
  const endQuiz = async (quizId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz/${quizId}/end`, {
        method: 'POST',
      });

      if (response.ok) {
        const updatedQuiz = await response.json();
        setQuizzes(prev => prev.map(q => q.id === quizId ? updatedQuiz : q));
        if (selectedQuiz?.id === quizId) {
          setSelectedQuiz(updatedQuiz);
        }
        setSuccess('Quiz finalizado exitosamente');
      } else {
        setError('Error al finalizar el quiz');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // =============== FUNCIONES DE PREGUNTAS ===============

  /**
   * Crear una nueva pregunta para el quiz seleccionado
   */
  const createQuestion = async () => {
    if (!selectedQuiz || !newQuestion.questionText.trim()) {
      setError('Pregunta y quiz son obligatorios');
      return;
    }

    try {
      setLoading(true);
      
      // Agregar el quizId al objeto de la pregunta
      const questionData = {
        ...newQuestion,
        quizId: selectedQuiz.id
      };
      
      const response = await fetch(`${API_BASE}/quiz/${selectedQuiz.id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });

      if (response.ok) {
        const createdQuestion = await response.json();
        setQuestions(prev => [...prev, createdQuestion]);
        setNewQuestion({
          questionText: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctAnswer: 'A',
          timeLimit: 30,
          orderIndex: questions.length + 1
        });
        setSuccess('Pregunta creada exitosamente');
        setError('');
      } else {
        setError('Error al crear la pregunta');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Iniciar una pregunta específica
   */
  const startQuestion = async (questionId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz/${selectedQuiz.id}/questions/${questionId}/start`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        setActiveQuestion(result);
        
        // Llamar al callback para enviar la pregunta al sistema de clickers
        if (onQuestionStart && questions.length > 0) {
          const questionIndex = questions.findIndex(q => q.id === questionId);
          const question = questions.find(q => q.id === questionId);
          if (question) {
            onQuestionStart(question, questionIndex);
          }
        }
        
        setSuccess('Pregunta iniciada exitosamente');
      } else {
        setError('Error al iniciar la pregunta');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Finalizar la pregunta activa
   */
  const endQuestion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz/${selectedQuiz.id}/questions/end`, {
        method: 'POST',
      });

      if (response.ok) {
        setActiveQuestion(null);
        setSuccess('Pregunta finalizada exitosamente');
      } else {
        setError('Error al finalizar la pregunta');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enviar respuesta de un participante (para sistema de clickers)
   */
  const submitAnswer = async (participantId, questionId, selectedAnswer, responseTime = null) => {
    try {
      setLoading(true);
      const submitData = {
        participantId,
        questionId,
        selectedAnswer,
        responseTime
      };

      const response = await fetch(`${API_BASE}/quiz/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess('Respuesta enviada exitosamente');
        return result;
      } else {
        setError('Error al enviar la respuesta');
        return null;
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // =============== FUNCIONES DE PARTICIPANTES ===============

  /**
   * Registrar un nuevo participante
   */
  const registerParticipant = async () => {
    if (!newParticipant.clickerId.trim()) {
      setError('El ID del clicker es obligatorio');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz/participants/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParticipant),
      });

      if (response.ok) {
        const participant = await response.json();
        setParticipants(prev => [...prev, participant]);
        setNewParticipant({ clickerId: '', name: '' });
        setSuccess('Participante registrado exitosamente');
        setError('');
      } else {
        setError('Error al registrar participante');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener estadísticas de un participante
   */
  const getParticipantStats = async (clickerId) => {
    try {
      const response = await fetch(`${API_BASE}/quiz/participants/${clickerId}/stats`);
      if (response.ok) {
        const stats = await response.json();
        alert(`Estadísticas de ${clickerId}:\nRespuestas correctas: ${stats.correctAnswers || 0}\nTotal respuestas: ${stats.totalAnswers || 0}`);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  /**
   * Eliminar una pregunta específica
   */
  const deleteQuestion = async (questionId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        setSuccess('Pregunta eliminada exitosamente');
      } else {
        setError('Error al eliminar la pregunta');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar una pregunta existente
   */
  const updateQuestion = async (questionId, questionData) => {
    try {
      setLoading(true);
      console.log('Enviando actualización de pregunta:', {
        url: `${API_BASE}/quiz/questions/${questionId}`,
        method: 'PUT',
        body: questionData
      });

      const response = await fetch(`${API_BASE}/quiz/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });

      console.log('Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        const updatedQuestion = await response.json();
        console.log('Pregunta actualizada recibida del servidor:', updatedQuestion);
        setQuestions(prev => prev.map(q => q.id === questionId ? updatedQuestion : q));
        setSuccess('Pregunta actualizada exitosamente');
        return updatedQuestion;
      } else {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        setError(`Error al actualizar la pregunta: ${response.status} ${response.statusText}`);
        return null;
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de conexión');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Iniciar edición de una pregunta
   */
  const startEditingQuestion = (question) => {
    setEditingQuestion(question.id);
    setEditQuestion({
      quizId: question.quizId,
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctAnswer: question.correctAnswer,
      timeLimit: question.timeLimit,
      orderIndex: question.orderIndex
    });
  };

  /**
   * Cancelar edición de pregunta
   */
  const cancelEditingQuestion = () => {
    setEditingQuestion(null);
    setEditQuestion({
      quizId: null,
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      timeLimit: 30,
      orderIndex: 1
    });
  };

  /**
   * Guardar cambios de pregunta editada
   */
  const saveEditedQuestion = async () => {
    if (!editQuestion.questionText.trim() || !editQuestion.optionA.trim() || 
        !editQuestion.optionB.trim() || !editQuestion.optionC.trim() || 
        !editQuestion.optionD.trim()) {
      setError('Todos los campos de la pregunta son obligatorios');
      return;
    }

    console.log('Guardando pregunta editada:', {
      questionId: editingQuestion,
      questionData: editQuestion
    });

    const result = await updateQuestion(editingQuestion, editQuestion);
    if (result) {
      console.log('Pregunta actualizada exitosamente:', result);
      cancelEditingQuestion();
    } else {
      console.log('Error al actualizar la pregunta');
    }
  };

  /**
   * Eliminar un participante
   */
  const deleteParticipant = async (participantId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este participante?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/quiz/participants/${participantId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setParticipants(prev => prev.filter(p => p.id !== participantId));
        setSuccess('Participante eliminado exitosamente');
      } else {
        setError('Error al eliminar el participante');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // =============== FUNCIONES DE NAVEGACIÓN ===============

  /**
   * Seleccionar quiz y cambiar vista
   */
  const selectQuiz = (quiz, view = 'questions') => {
    setSelectedQuiz(quiz);
    setCurrentView(view);
    if (view === 'questions') {
      loadQuestions(quiz.id);
    } else if (view === 'results') {
      loadQuizResults(quiz.id);
    } else if (view === 'edit') {
      setEditQuiz({ title: quiz.title, description: quiz.description || '' });
    }
  };

  // =============== FUNCIONES DE UTILIDAD ===============

  /**
   * Limpiar todos los datos del quiz (resetear estado)
   */
  const clearQuizData = () => {
    setSelectedQuiz(null);
    setQuestions([]);
    setQuizResults(null);
    setQuestionAnswers([]);
    setActiveQuestion(null);
    setCurrentView('list');
  };

  /**
   * Refrescar datos completos del sistema
   */
  const refreshAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadQuizzes(),
        loadParticipants()
      ]);
      setSuccess('Datos actualizados exitosamente');
    } catch (err) {
      setError('Error al actualizar los datos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exportar resultados de un quiz
   */
  const exportQuizResults = async (quizId) => {
    try {
      const results = await loadQuizResults(quizId);
      if (results) {
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quiz_${quizId}_results_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        setSuccess('Resultados exportados exitosamente');
      }
    } catch (err) {
      setError('Error al exportar los resultados');
      console.error('Error:', err);
    }
  };

  /**
   * Duplicar un quiz existente
   */
  const duplicateQuiz = async (originalQuiz) => {
    try {
      setLoading(true);
      const duplicatedQuiz = {
        title: `${originalQuiz.title} (Copia)`,
        description: originalQuiz.description
      };

      const response = await fetch(`${API_BASE}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedQuiz),
      });

      if (response.ok) {
        const newQuiz = await response.json();
        setQuizzes(prev => [...prev, newQuiz]);
        setSuccess('Quiz duplicado exitosamente');
        
        // Si el quiz original tenía preguntas, duplicarlas también
        if (originalQuiz.questions && originalQuiz.questions.length > 0) {
          for (const question of originalQuiz.questions) {
            const questionData = {
              questionText: question.questionText,
              optionA: question.optionA,
              optionB: question.optionB,
              optionC: question.optionC,
              optionD: question.optionD,
              correctAnswer: question.correctAnswer,
              timeLimit: question.timeLimit,
              orderIndex: question.orderIndex
            };
            
            await fetch(`${API_BASE}/quiz/${newQuiz.id}/questions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(questionData),
            });
          }
        }
        
        return newQuiz;
      } else {
        setError('Error al duplicar el quiz');
        return null;
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // =============== COMPONENTES DE RENDERIZADO ===============

  /**
   * Renderizar mensajes de estado
   */
  const renderMessages = () => (
    <>
      {error && (
        <div className="message error">
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="message success">
          ✅ {success}
        </div>
      )}
    </>
  );

  /**
   * Renderizar la lista de quizzes
   */
  const renderQuizList = () => (
    <div className="quiz-list">
      <div className="quiz-list-header">
        <h2>📋 Mis Quizzes</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setCurrentView('create')}
          >
            ➕ Crear Quiz
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setCurrentView('participants')}
          >
            👥 Participantes
          </button>
          <button 
            className="btn btn-info"
            onClick={refreshAllData}
            disabled={loading}
          >
            🔄 Actualizar Todo
          </button>
        </div>
      </div>

      {loading && <div className="loading">Cargando...</div>}
      
      {quizzes.length === 0 ? (
        <div className="empty-state">
          <p>No hay quizzes creados. ¡Crea tu primer quiz!</p>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="quiz-card">
              <div className="quiz-header">
                <h3>{quiz.title}</h3>
                <div className="quiz-status">
                  <span className={`status ${quiz.status || 'draft'}`}>
                    {quiz.status === 'active' ? '🟢 Activo' : 
                     quiz.status === 'finished' ? '🔴 Finalizado' : '⚪ Borrador'}
                  </span>
                </div>
              </div>
              
              {quiz.description && (
                <p className="quiz-description">{quiz.description}</p>
              )}
              
              <div className="quiz-actions">
                <button 
                  className="btn btn-small btn-primary"
                  onClick={() => selectQuiz(quiz, 'questions')}
                >
                  📝 Preguntas
                </button>
                <button 
                  className="btn btn-small btn-secondary"
                  onClick={() => selectQuiz(quiz, 'edit')}
                >
                  ✏️ Editar
                </button>
                <button 
                  className="btn btn-small btn-secondary"
                  onClick={() => selectQuiz(quiz, 'results')}
                >
                  📊 Resultados
                </button>
                <button 
                  className="btn btn-small btn-info"
                  onClick={() => duplicateQuiz(quiz)}
                >
                  📋 Duplicar
                </button>
                <button 
                  className="btn btn-small btn-info"
                  onClick={() => exportQuizResults(quiz.id)}
                >
                  💾 Exportar
                </button>
                
                {quiz.status !== 'active' ? (
                  <button 
                    className="btn btn-small btn-success"
                    onClick={() => startQuiz(quiz.id)}
                  >
                    ▶️ Iniciar Quiz
                  </button>
                ) : (
                  <>
                    <button 
                      className="btn btn-small btn-info"
                      onClick={() => onQuizStart && onQuizStart(quiz, quiz.questions || [])}
                    >
                      🎮 Ir a Clickers
                    </button>
                    <button 
                      className="btn btn-small btn-warning"
                      onClick={() => endQuiz(quiz.id)}
                    >
                      ⏹️ Finalizar
                    </button>
                  </>
                )}
                
                <button 
                  className="btn btn-small btn-danger"
                  onClick={() => deleteQuiz(quiz.id)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /**
   * Renderizar formulario de crear quiz
   */
  const renderCreateQuiz = () => (
    <div className="create-quiz">
      <div className="form-header">
        <h2>➕ Crear Nuevo Quiz</h2>
        <button 
          className="btn btn-secondary"
          onClick={() => setCurrentView('list')}
        >
          ← Volver
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); createQuiz(); }} className="quiz-form">
        <div className="form-group">
          <label htmlFor="title">Título del Quiz *</label>
          <input
            id="title"
            type="text"
            value={newQuiz.title}
            onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ej: Quiz de Historia"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            value={newQuiz.description}
            onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción del quiz (opcional)"
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creando...' : '✅ Crear Quiz'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => setCurrentView('list')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );

  /**
   * Renderizar formulario de editar quiz
   */
  const renderEditQuiz = () => (
    <div className="edit-quiz">
      <div className="form-header">
        <h2>✏️ Editar Quiz</h2>
        <button 
          className="btn btn-secondary"
          onClick={() => setCurrentView('list')}
        >
          ← Volver
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); updateQuiz(); }} className="quiz-form">
        <div className="form-group">
          <label htmlFor="edit-title">Título del Quiz *</label>
          <input
            id="edit-title"
            type="text"
            value={editQuiz.title}
            onChange={(e) => setEditQuiz(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Título del quiz"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-description">Descripción</label>
          <textarea
            id="edit-description"
            value={editQuiz.description}
            onChange={(e) => setEditQuiz(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción del quiz (opcional)"
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Actualizando...' : '✅ Actualizar Quiz'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => setCurrentView('list')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );

  /**
   * Renderizar gestión de preguntas
   */
  const renderQuestions = () => (
    <div className="questions-manager">
      <div className="questions-header">
        <h2>📝 Preguntas de: {selectedQuiz?.title}</h2>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setCurrentView('list')}
          >
            ← Volver
          </button>
          {activeQuestion && (
            <button 
              className="btn btn-warning"
              onClick={endQuestion}
            >
              ⏹️ Finalizar Pregunta Activa
            </button>
          )}
        </div>
      </div>

      {activeQuestion && (
        <div className="active-question-banner">
          🔴 Pregunta activa: {activeQuestion.questionText}
        </div>
      )}

      {/* Formulario para crear nueva pregunta */}
      <div className="create-question">
        <h3>➕ Agregar Nueva Pregunta</h3>
        
        <form onSubmit={(e) => { e.preventDefault(); createQuestion(); }} className="question-form">
          <div className="form-group">
            <label htmlFor="questionText">Pregunta *</label>
            <input
              id="questionText"
              type="text"
              value={newQuestion.questionText}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))}
              placeholder="Escribe tu pregunta"
              required
            />
          </div>

          <div className="options-grid">
            <div className="form-group">
              <label htmlFor="optionA">Opción A *</label>
              <input
                id="optionA"
                type="text"
                value={newQuestion.optionA}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, optionA: e.target.value }))}
                placeholder="Opción A"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="optionB">Opción B *</label>
              <input
                id="optionB"
                type="text"
                value={newQuestion.optionB}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, optionB: e.target.value }))}
                placeholder="Opción B"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="optionC">Opción C *</label>
              <input
                id="optionC"
                type="text"
                value={newQuestion.optionC}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, optionC: e.target.value }))}
                placeholder="Opción C"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="optionD">Opción D *</label>
              <input
                id="optionD"
                type="text"
                value={newQuestion.optionD}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, optionD: e.target.value }))}
                placeholder="Opción D"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="correctAnswer">Respuesta Correcta *</label>
              <select
                id="correctAnswer"
                value={newQuestion.correctAnswer}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="timeLimit">Tiempo Límite (segundos)</label>
              <input
                id="timeLimit"
                type="number"
                value={newQuestion.timeLimit}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                min="10"
                max="300"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creando...' : '✅ Agregar Pregunta'}
          </button>
        </form>
      </div>

      {/* Lista de preguntas existentes */}
      <div className="questions-list">
        <h3>📋 Preguntas ({questions.length})</h3>
        
        {questions.length === 0 ? (
          <div className="empty-state">
            <p>No hay preguntas creadas. ¡Agrega la primera pregunta!</p>
          </div>
        ) : (
          <div className="questions-grid">
            {questions.map((question, index) => (
              <div key={question.id} className="question-card">
                {editingQuestion === question.id ? (
                  // Formulario de edición
                  <div className="edit-question-form">
                    <div className="question-header">
                      <h4>Editando Pregunta {index + 1}</h4>
                      <div className="question-actions">
                        <button 
                          className="btn btn-small btn-success"
                          onClick={saveEditedQuestion}
                          disabled={loading}
                        >
                          💾 Guardar
                        </button>
                        <button 
                          className="btn btn-small btn-secondary"
                          onClick={cancelEditingQuestion}
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Texto de la pregunta:</label>
                      <textarea
                        value={editQuestion.questionText}
                        onChange={(e) => setEditQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                        placeholder="Ingresa el texto de la pregunta"
                        rows="3"
                        disabled={loading}
                      />
                    </div>

                    <div className="options-grid">
                      {['A', 'B', 'C', 'D'].map(option => (
                        <div key={option} className="form-group">
                          <label>Opción {option}:</label>
                          <input
                            type="text"
                            value={editQuestion[`option${option}`]}
                            onChange={(e) => setEditQuestion(prev => ({ ...prev, [`option${option}`]: e.target.value }))}
                            placeholder={`Opción ${option}`}
                            disabled={loading}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Respuesta correcta:</label>
                        <select
                          value={editQuestion.correctAnswer}
                          onChange={(e) => setEditQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                          disabled={loading}
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Tiempo límite (segundos):</label>
                        <input
                          type="number"
                          min="10"
                          max="300"
                          value={editQuestion.timeLimit}
                          onChange={(e) => setEditQuestion(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Vista normal de la pregunta
                  <>
                    <div className="question-header">
                      <h4>Pregunta {index + 1}</h4>
                      <div className="question-actions">
                        <button 
                          className="btn btn-small btn-primary"
                          onClick={() => startQuestion(question.id)}
                          disabled={activeQuestion?.id === question.id}
                        >
                          {activeQuestion?.id === question.id ? '🔴 Activa' : '▶️ Iniciar'}
                        </button>
                        <button 
                          className="btn btn-small btn-warning"
                          onClick={() => startEditingQuestion(question)}
                          disabled={loading}
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          className="btn btn-small btn-danger"
                          onClick={() => deleteQuestion(question.id)}
                          disabled={loading}
                        >
                          🗑️ Eliminar
                        </button>
                        <button 
                          className="btn btn-small btn-secondary"
                          onClick={() => loadQuestionAnswers(question.id)}
                        >
                          📊 Ver Respuestas
                        </button>
                      </div>
                    </div>
                    
                    <p className="question-text">{question.questionText}</p>
                    
                    <div className="question-options">
                      {['A', 'B', 'C', 'D'].map(option => (
                        <div 
                          key={option} 
                          className={`option ${question.correctAnswer === option ? 'correct' : ''}`}
                        >
                          <strong>{option}:</strong> {question[`option${option}`]}
                          {question.correctAnswer === option && ' ✓'}
                        </div>
                      ))}
                    </div>
                    
                    <div className="question-meta">
                      <span>⏱️ {question.timeLimit}s</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mostrar respuestas de pregunta seleccionada */}
      {questionAnswers.length > 0 && (
        <div className="question-answers">
          <h3>📊 Respuestas de la Pregunta</h3>
          <div className="answers-grid">
            {questionAnswers.map(answer => (
              <div key={answer.id} className="answer-card">
                <div className="answer-participant">👤 {answer.participantId}</div>
                <div className="answer-choice">Respuesta: <strong>{answer.selectedAnswer}</strong></div>
                <div className="answer-status">
                  {answer.isCorrect ? '✅ Correcta' : '❌ Incorrecta'}
                </div>
                <div className="answer-time">{new Date(answer.submittedAt).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Renderizar resultados del quiz
   */
  const renderResults = () => (
    <div className="quiz-results">
      <div className="results-header">
        <h2>📊 Resultados de: {selectedQuiz?.title}</h2>
        <button 
          className="btn btn-secondary"
          onClick={() => setCurrentView('list')}
        >
          ← Volver
        </button>
      </div>

      {quizResults ? (
        <div className="results-content">
          {/* Resumen General */}
          <div className="results-summary">
            <div className="stat-card">
              <h3>👥 Participantes</h3>
              <div className="stat-value">{quizResults.totalParticipants || 0}</div>
            </div>
            <div className="stat-card">
              <h3>📝 Preguntas</h3>
              <div className="stat-value">{quizResults.totalQuestions || 0}</div>
            </div>
            <div className="stat-card">
              <h3>✅ Respuestas Correctas</h3>
              <div className="stat-value">{quizResults.correctAnswers || 0}</div>
            </div>
            <div className="stat-card">
              <h3>📊 Precisión Global</h3>
              <div className="stat-value">
                {quizResults.totalAnswers ? 
                  Math.round((quizResults.correctAnswers / quizResults.totalAnswers) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Resultados por Pregunta */}
          {quizResults.results && (
            <div className="questions-results">
              <h3>📝 Resultados por Pregunta</h3>
              {quizResults.results.map((questionResult, index) => (
                <div key={questionResult.questionId} className="question-result">
                  <div className="question-header">
                    <h4>Pregunta {index + 1}: {questionResult.questionText}</h4>
                    <div className="question-stats">
                      <span className="correct-answer">✅ Correcta: {questionResult.correctAnswer}</span>
                      <span className="accuracy">📊 {questionResult.totalAnswers > 0 ? 
                        Math.round((questionResult.correctCount / questionResult.totalAnswers) * 100) : 0}% acierto</span>
                    </div>
                  </div>
                  
                  <div className="answer-distribution">
                    {['A', 'B', 'C', 'D'].map(option => {
                      const count = questionResult.stats[option] || 0;
                      const percentage = questionResult.totalAnswers > 0 ? 
                        Math.round((count / questionResult.totalAnswers) * 100) : 0;
                      const isCorrect = option === questionResult.correctAnswer;
                      
                      return (
                        <div key={option} className={`answer-bar ${isCorrect ? 'correct' : ''}`}>
                          <div className="answer-label">
                            <span className="option">{option} {isCorrect && '✓'}</span>
                            <span className="count">{count} ({percentage}%)</span>
                          </div>
                          <div className="bar-container">
                            <div 
                              className="bar-fill"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resultados por Participante */}
          {quizResults.participants && (
            <div className="participants-results">
              <h3>👥 Resultados por Participante</h3>
              <div className="participants-grid">
                {quizResults.participants.map(participant => (
                  <div key={participant.id} className="participant-result">
                    <div className="participant-name">👤 {participant.name || participant.id}</div>
                    <div className="participant-score">
                      Puntuación: {participant.correctAnswers}/{participant.totalAnswers}
                    </div>
                    <div className="participant-percentage">
                      {participant.totalAnswers ? 
                        Math.round((participant.correctAnswers / participant.totalAnswers) * 100) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <p>No hay resultados disponibles para este quiz.</p>
          <button 
            className="btn btn-primary"
            onClick={() => loadQuizResults(selectedQuiz.id)}
          >
            🔄 Recargar Resultados
          </button>
        </div>
      )}
    </div>
  );

  /**
   * Renderizar gestión de participantes
   */
  const renderParticipants = () => (
    <div className="participants-manager">
      <div className="participants-header">
        <h2>👥 Participantes</h2>
        <button 
          className="btn btn-secondary"
          onClick={() => setCurrentView('list')}
        >
          ← Volver
        </button>
      </div>

      {/* Formulario para registrar participante */}
      <div className="register-participant">
        <h3>➕ Registrar Nuevo Participante</h3>
        
        <form onSubmit={(e) => { e.preventDefault(); registerParticipant(); }} className="participant-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clickerId">ID del Clicker *</label>
              <input
                id="clickerId"
                type="text"
                value={newParticipant.clickerId}
                onChange={(e) => setNewParticipant(prev => ({ ...prev, clickerId: e.target.value }))}
                placeholder="Ej: CLICKER_001"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="participantName">Nombre (opcional)</label>
              <input
                id="participantName"
                type="text"
                value={newParticipant.name}
                onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del participante"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registrando...' : '✅ Registrar Participante'}
          </button>
        </form>
      </div>

      {/* Lista de participantes */}
      <div className="participants-list">
        <h3>📋 Participantes Registrados ({participants.length})</h3>
        
        {participants.length === 0 ? (
          <div className="empty-state">
            <p>No hay participantes registrados.</p>
          </div>
        ) : (
          <div className="participants-grid">
            {participants.map(participant => (
              <div key={participant.id} className="participant-card">
                <div className="participant-info">
                  <h4>👤 {participant.name || 'Sin nombre'}</h4>
                  <p><strong>Clicker ID:</strong> {participant.clickerId}</p>
                  <p><strong>Registrado:</strong> {new Date(participant.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="participant-actions">
                  <button 
                    className="btn btn-small btn-primary"
                    onClick={() => getParticipantStats(participant.clickerId)}
                  >
                    📊 Ver Estadísticas
                  </button>
                  <button 
                    className="btn btn-small btn-danger"
                    onClick={() => deleteParticipant(participant.id)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // =============== RENDERIZADO PRINCIPAL ===============

  return (
    <div className="quiz-manager">
      {renderMessages()}
      
      {currentView === 'list' && renderQuizList()}
      {currentView === 'create' && renderCreateQuiz()}
      {currentView === 'edit' && renderEditQuiz()}
      {currentView === 'questions' && renderQuestions()}
      {currentView === 'results' && renderResults()}
      {currentView === 'participants' && renderParticipants()}
    </div>
  );
}
