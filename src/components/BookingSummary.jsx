// components/BookingSummary.jsx
import './BookingSummary.css';

export function BookingSummary({ booking, onBack }) {
  return (
    <div className="booking-summary">
      <div className="success-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#10B981"/>
          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      <h2 className="booking-title">¡Cita Reservada Exitosamente!</h2>
      
      <div className="booking-card">
        <div className="booking-info">
          <span className="info-label">Cliente:</span>
          <span className="info-value">{booking.name}</span>
        </div>
        
        <div className="booking-info">
          <span className="info-label">Servicio:</span>
          <span className="info-value">{booking.service}</span>
        </div>
        
        <div className="booking-info">
          <span className="info-label">Fecha:</span>
          <span className="info-value">{booking.date}</span>
        </div>
        
        <div className="booking-info">
          <span className="info-label">Hora:</span>
          <span className="info-value">{booking.time}</span>
        </div>
      </div>

      <div className="booking-actions">
        <button
          onClick={onBack}
          className="back-button"
        >
          Nueva reserva
        </button>
        
        <button
          onClick={() => window.print()}
          className="print-button"
        >
          Imprimir
        </button>
      </div>

      <div className="booking-note">
        <p>📝 <strong>Importante:</strong> Llega 10 minutos antes de tu cita.</p>
        <p>📞 Para cancelar o reprogramar, llámanos al: <strong>(123) 456-7890</strong></p>
      </div>
    </div>
  );
}
