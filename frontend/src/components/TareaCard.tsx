import React, { useState } from 'react';
import { Tarea } from '../types/Tarea';
import { useTareasWithActivity } from '../hooks/useTareasWithActivity';
import { Edit, Trash2, User, Calendar, X, AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TareaCardProps {
  tarea: Tarea;
  onEdit?: (tarea: Tarea) => void;
}

const TareaCard: React.FC<TareaCardProps> = ({ tarea, onEdit }) => {
  const { actions } = useTareasWithActivity();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se abra el detalle
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await actions.deleteTarea(tarea.id!);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se abra el detalle
    if (onEdit) {
      onEdit(tarea);
    }
  };

  const handleCardClick = () => {
    // Abrir modal de edición al hacer clic en la tarjeta
    if (onEdit) {
      onEdit(tarea);
    }
  };



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (estado: string) => {
    const normalizedEstado = estado.toLowerCase().replace(' ', '_');
    return `status-${normalizedEstado}`;
  };

  const getPriorityIcon = (prioridad: string) => {
    switch (prioridad.toLowerCase()) {
      case 'alta':
      case 'crítica':
        return <ArrowUp size={12} className="priority-icon priority-high" />;
      case 'media':
        return <Minus size={12} className="priority-icon priority-medium" />;
      case 'baja':
        return <ArrowDown size={12} className="priority-icon priority-low" />;
      default:
        return <Minus size={12} className="priority-icon priority-medium" />;
    }
  };

  const getPriorityClass = (prioridad: string) => {
    switch (prioridad.toLowerCase()) {
      case 'alta':
      case 'crítica':
        return 'priority-high';
      case 'media':
        return 'priority-medium';
      case 'baja':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  return (
    <>
      <div 
        className={`task-card fade-in ${getStatusClass(tarea.estado)} ${getPriorityClass(tarea.prioridad)} clickable`}
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        {/* Status Indicator */}
        <div className="status-indicator"></div>
        
        {/* Priority Indicator */}
        <div className="priority-indicator">
          {getPriorityIcon(tarea.prioridad)}
          <span className="priority-text">{tarea.prioridad}</span>
        </div>
        
        {/* Task Title */}
        <h3 className="task-title">
          {tarea.titulo}
        </h3>

        {/* Task Description */}
        {tarea.descripcion && (
          <p className="task-description">
            {tarea.descripcion}
          </p>
        )}

        {/* Task Tags */}
        {tarea.etiquetas && tarea.etiquetas.length > 0 && (
          <div className="task-tags">
            {tarea.etiquetas.map((etiqueta, index) => (
              <span key={index} className="task-tag">
                {etiqueta}
              </span>
            ))}
          </div>
        )}

        {/* Task Meta Information */}
        <div className="task-meta">
          <div className="task-assignee">
            <User size={12} style={{ marginRight: '0.25rem' }} />
            {tarea.responsable}
          </div>
          
          <div className="task-actions">
            <button
              onClick={handleEdit}
              className="task-action-btn"
              title="Editar tarea"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="task-action-btn delete"
              title="Eliminar tarea"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Creation Date */}
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--color-text-muted)',
          marginTop: 'var(--spacing-xs)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <Calendar size={10} />
          {formatDate(tarea.fechaCreacion)}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="modern-modal-overlay" style={{ zIndex: 1001 }}>
          <div className="modern-modal-container" style={{ maxWidth: '400px' }}>
            <div className="modern-modal-header">
              <h2>Confirmar eliminación</h2>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="modal-close-btn"
                disabled={isDeleting}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modern-modal-form">
              <div className="delete-confirmation-content">
                <div className="delete-icon">
                  <AlertCircle size={48} color="#ef4444" />
                </div>
                <p>¿Estás seguro de que deseas eliminar la tarea <strong>"{tarea.titulo}"</strong>?</p>
                <p className="delete-warning">Esta acción no se puede deshacer.</p>
              </div>
              <div className="modern-modal-actions">
                <div className="modal-actions-right">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="modern-btn btn-secondary"
                    disabled={isDeleting}
                  >
                    <span>Cancelar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="modern-btn btn-danger"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="loading-spinner" />
                        <span>Eliminando...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        <span>Eliminar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TareaCard;