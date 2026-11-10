import { useState, useEffect, useMemo } from 'react';
import './TaskmasterMasterProgressLoader.css';

const TaskMasterProgressLoader = ({ 
  message = "Cargando...",
  totalSteps = 100,
  variant = 'mobile', // 'mobile', 'mobile-minimal', 'mobile-detailed'
  fullScreen = false
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Iniciando...");

  // Tareas simplificadas para móvil
  const tasks = useMemo(() => [
    "Preparando...",
    "Cargando...",
    "Sincronizando...",
    "Actualizando...",
    "Listo!"
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= totalSteps) {
          clearInterval(interval);
          return totalSteps;
        }
        return prev + 1;
      });
    }, 20); // Más rápido en móvil para mejor UX

    return () => clearInterval(interval);
  }, [totalSteps]);

  useEffect(() => {
    if (progress < 20) setStatus(tasks[0]);
    else if (progress < 40) setStatus(tasks[1]);
    else if (progress < 60) setStatus(tasks[2]);
    else if (progress < 80) setStatus(tasks[3]);
    else if (progress < 100) setStatus(tasks[3]);
    else setStatus(tasks[4]);
  }, [progress, tasks]);

  // Clases condicionales
  const containerClass = `tm-mobile-loader ${fullScreen ? 'tm-fullscreen' : ''} tm-variant-${variant}`;

  return (
    <div className={containerClass}>
      {/* Overlay para versión fullscreen */}
      {fullScreen && <div className="tm-mobile-overlay" />}
      
      <div className="tm-mobile-content">
        {/* Header simplificado */}
        <div className="tm-mobile-header">
          <div className="tm-mobile-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="tm-mobile-title-container">
            <h3 className="tm-mobile-title">TaskMaster</h3>
            {variant === 'mobile-detailed' && (
              <span className="tm-mobile-badge">v1.0.0</span>
            )}
          </div>
        </div>

        {/* Cuerpo principal */}
        <div className="tm-mobile-body">
          {/* Indicador de progreso circular para móvil */}
          <div className="tm-mobile-progress-circle">
            <svg className="tm-circular-progress" viewBox="0 0 100 100">
              {/* Círculo de fondo */}
              <circle
                className="tm-circle-bg"
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--border-light)"
                strokeWidth="6"
              />
              {/* Círculo de progreso */}
              <circle
                className="tm-circle-progress"
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--tm-primary)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="tm-circle-content">
              <span className="tm-circle-percentage">{progress}%</span>
            </div>
          </div>

          {/* Barra de progreso horizontal simplificada */}
          <div className="tm-mobile-progress-bar">
            <div 
              className="tm-mobile-progress-fill"
              style={{ width: `${progress}%` }}
            >
              <div className="tm-mobile-progress-shine"></div>
            </div>
          </div>

          {/* Información de estado */}
          <div className="tm-mobile-info">
            <span className="tm-mobile-status">{status}</span>
            {variant === 'mobile-detailed' && (
              <span className="tm-mobile-percentage">{progress}%</span>
            )}
          </div>

          {/* Steps horizontales simplificados */}
          {variant === 'mobile-detailed' && (
            <div className="tm-mobile-steps">
              {[1, 2, 3].map((step) => {
                const isActive = progress >= step * 33;
                return (
                  <div key={step} className={`tm-mobile-step ${isActive ? 'active' : ''}`}>
                    <div className="tm-mobile-step-dot"></div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mensaje personalizado */}
          <div className="tm-mobile-message">
            <span className="tm-mobile-message-text">{message}</span>
          </div>
        </div>

        {/* Footer simplificado */}
        <div className="tm-mobile-footer">
          <div className="tm-mobile-particles">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="tm-mobile-particle"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskMasterProgressLoader;