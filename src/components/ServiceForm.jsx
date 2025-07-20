import { useState } from "react";
import './ServiceForm.css';

export function ServiceForm({ onBook }) {
  const [name, setName] = useState("");
  const [service, setService] = useState("Corte de pelo");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState({});

  // Obtener fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Validar que la fecha sea futura
  const isValidDate = (selectedDate) => {
    const today = new Date();
    const selected = new Date(selectedDate);
    today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
    return selected >= today;
  };

  // Validar horario de trabajo (9:00 AM - 7:00 PM)
  const isValidTime = (selectedTime, selectedDate) => {
    if (!selectedTime) return false;
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    
    // Horario de trabajo: 9:00 (540 min) - 19:00 (1140 min)
    const openTime = 9 * 60; // 9:00 AM
    const closeTime = 19 * 60; // 7:00 PM
    
    if (timeInMinutes < openTime || timeInMinutes >= closeTime) {
      return false;
    }

    // Si es hoy, verificar que la hora sea futura
    const today = getCurrentDate();
    if (selectedDate === today) {
      const now = new Date();
      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
      return timeInMinutes > currentTimeInMinutes + 30; // Al menos 30 min de anticipación
    }

    return true;
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    } else if (name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name.trim())) {
      newErrors.name = "El nombre solo puede contener letras y espacios";
    }

    // Validar fecha
    if (!date) {
      newErrors.date = "La fecha es obligatoria";
    } else if (!isValidDate(date)) {
      newErrors.date = "La fecha debe ser hoy o una fecha futura";
    }

    // Validar hora
    if (!time) {
      newErrors.time = "La hora es obligatoria";
    } else if (!isValidTime(time, date)) {
      const today = getCurrentDate();
      if (date === today) {
        newErrors.time = "Para hoy, selecciona una hora futura con al menos 30 minutos de anticipación (9:00 AM - 7:00 PM)";
      } else {
        newErrors.time = "Horario de atención: 9:00 AM - 7:00 PM";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Formatear los datos antes de enviar
      const formattedData = {
        name: name.trim(),
        service,
        date: new Date(date).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      onBook(formattedData);
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    // Limpiar error de nombre si existe
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    setDate(value);
    // Limpiar errores de fecha y hora si existen
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: '', time: '' }));
    }
    // Si cambia la fecha, revalidar la hora
    if (time && errors.time) {
      setErrors(prev => ({ ...prev, time: '' }));
    }
  };

  const handleTimeChange = (e) => {
    const value = e.target.value;
    setTime(value);
    // Limpiar error de hora si existe
    if (errors.time) {
      setErrors(prev => ({ ...prev, time: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="service-form">
      <div className="form-group">
        <label className="form-label">Nombre completo</label>
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          className={`form-input ${errors.name ? 'error' : ''}`}
          placeholder="Ingresa tu nombre completo"
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Servicio</label>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="form-select"
        >
          <option value="Corte de pelo">Corte de pelo</option>
          <option value="Tinte">Tinte</option>
          <option value="Peinado">Peinado</option>
          <option value="Barba">Barba</option>
          <option value="Corte + Barba">Corte + Barba</option>
          <option value="Tratamiento capilar">Tratamiento capilar</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          min={getCurrentDate()}
          className={`form-input ${errors.date ? 'error' : ''}`}
        />
        {errors.date && <span className="error-message">{errors.date}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Hora (9:00 AM - 7:00 PM)</label>
        <input
          type="time"
          value={time}
          onChange={handleTimeChange}
          min="09:00"
          max="19:00"
          step="900" // Intervalos de 15 minutos
          className={`form-input ${errors.time ? 'error' : ''}`}
        />
        {errors.time && <span className="error-message">{errors.time}</span>}
        <small className="time-hint">Horario de atención: Lunes a Sábado 9:00 AM - 7:00 PM</small>
      </div>

      <button
        type="submit"
        className="submit-button"
      >
        Reservar cita
      </button>
    </form>
  );
}
