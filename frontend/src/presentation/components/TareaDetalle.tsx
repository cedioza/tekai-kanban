import React, { useState, useEffect } from 'react';
import { Tarea, CreateComentarioDto, PrioridadTarea, TipoComentario } from '../../domain/entities/Tarea';
import { ESTADOS_KANBAN, PRIORIDADES_DISPONIBLES } from '../../domain/entities/Tarea';
import { useResponsables } from '../../application/contexts/ResponsableContext';
import './TareaDetalle.css';

interface TareaDetalleProps {
  tarea: Tarea;
  onClose: () => void;
  onUpdate: (tarea: Tarea) => void;
  onAddComment: (tareaId: number, comentario: CreateComentarioDto) => void;
}

const TareaDetalle: React.FC<TareaDetalleProps> = ({ tarea, onClose, onUpdate, onAddComment }) => {
  const { actions: responsableActions } = useResponsables();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTarea, setEditedTarea] = useState<Tarea>(tarea);
  const [newComment, setNewComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);

  useEffect(() => {
    setEditedTarea(tarea);
  }, [tarea]);

  const handleSave = () => {
    onUpdate(editedTarea);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTarea(tarea);
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comentarioDto: CreateComentarioDto = {
        autor: 'Usuario Actual', // En una app real, esto vendría del contexto de usuario
        contenido: newComment,
        tipo: TipoComentario.COMENTARIO
      };
      onAddComment(tarea.id!, comentarioDto);
      setNewComment('');
      setShowCommentForm(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (prioridad: PrioridadTarea) => {
    switch (prioridad) {
      case PrioridadTarea.ALTA: return '#ff4757';
      case PrioridadTarea.MEDIA: return '#ffa502';
      case PrioridadTarea.BAJA: return '#2ed573';
      default: return '#747d8c';
    }
  };

  const getCommentTypeIcon = (tipo: TipoComentario) => {
    switch (tipo) {
      case TipoComentario.COMENTARIO: return '💬';
      case TipoComentario.CAMBIO_ESTADO: return '🔄';
      case TipoComentario.ACTUALIZACION: return '👤';
      default: return '📝';
    }
  };

  return (
    <div className="tarea-detalle-overlay">
      <div className="tarea-detalle-modal">
        <div className="tarea-detalle-header">
          <div className="tarea-detalle-title-section">
            {isEditing ? (
              <input
                type="text"
                value={editedTarea.titulo}
                onChange={(e) => setEditedTarea({ ...editedTarea, titulo: e.target.value })}
                className="tarea-detalle-title-input"
              />
            ) : (
              <h2 className="tarea-detalle-title">{tarea.titulo}</h2>
            )}
            <div className="tarea-detalle-meta">
              <span className="tarea-id">#{tarea.id}</span>
              <span 
                className="tarea-prioridad"
                style={{ backgroundColor: getPriorityColor(tarea.prioridad) }}
              >
                {tarea.prioridad}
              </span>
            </div>
          </div>
          <div className="tarea-detalle-actions">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn-save">Guardar</button>
                <button onClick={handleCancel} className="btn-cancel">Cancelar</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn-edit">Editar</button>
            )}
            <button onClick={onClose} className="btn-close">✕</button>
          </div>
        </div>

        <div className="tarea-detalle-content">
          <div className="tarea-detalle-main">
            <div className="tarea-section">
              <h3>Descripción</h3>
              {isEditing ? (
                <textarea
                  value={editedTarea.descripcion}
                  onChange={(e) => setEditedTarea({ ...editedTarea, descripcion: e.target.value })}
                  className="tarea-descripcion-input"
                  rows={4}
                />
              ) : (
                <p className="tarea-descripcion">{tarea.descripcion}</p>
              )}
            </div>

            <div className="tarea-section">
              <h3>Etiquetas</h3>
              <div className="tarea-etiquetas">
                {tarea.etiquetas?.map((etiqueta, index) => (
                  <span key={index} className="etiqueta">{etiqueta}</span>
                ))}
                {(!tarea.etiquetas || tarea.etiquetas.length === 0) && (
                  <span className="no-etiquetas">Sin etiquetas</span>
                )}
              </div>
            </div>

            <div className="tarea-section">
              <h3>Actividad y Comentarios</h3>
              <div className="comentarios-section">
                <div className="comentarios-list">
                  {tarea.comentarios?.map((comentario) => (
                    <div key={comentario.id} className="comentario">
                      <div className="comentario-header">
                        <span className="comentario-icon">{getCommentTypeIcon(comentario.tipo)}</span>
                        <span className="comentario-autor">{comentario.autor}</span>
                        <span className="comentario-fecha">{formatDate(comentario.fechaCreacion)}</span>
                      </div>
                      <div className="comentario-contenido">{comentario.contenido}</div>
                    </div>
                  ))}
                  {(!tarea.comentarios || tarea.comentarios.length === 0) && (
                    <p className="no-comentarios">No hay comentarios aún</p>
                  )}
                </div>
                
                {showCommentForm ? (
                  <div className="comment-form">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escribe un comentario..."
                      className="comment-input"
                      rows={3}
                    />
                    <div className="comment-actions">
                      <button onClick={handleAddComment} className="btn-add-comment">Agregar</button>
                      <button onClick={() => setShowCommentForm(false)} className="btn-cancel-comment">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowCommentForm(true)} className="btn-show-comment-form">
                    💬 Agregar comentario
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="tarea-detalle-sidebar">
            <div className="tarea-info-section">
              <h3>Información</h3>
              <div className="info-item">
                <label>Estado:</label>
                {isEditing ? (
                  <select
                    value={editedTarea.estado}
                    onChange={(e) => setEditedTarea({ ...editedTarea, estado: e.target.value as any })}
                  >
                    {ESTADOS_KANBAN.map(estado => (
                      <option key={estado.key} value={estado.key}>{estado.label}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`estado-badge estado-${tarea.estado}`}>{tarea.estado}</span>
                )}
              </div>
              
              <div className="info-item">
                <label>Responsable:</label>
                {isEditing ? (
                  <select
                    value={editedTarea.responsable}
                    onChange={(e) => setEditedTarea({ ...editedTarea, responsable: e.target.value })}
                  >
                    {responsableActions.getResponsableNames().map(responsable => (
                      <option key={responsable} value={responsable}>{responsable}</option>
                    ))}
                  </select>
                ) : (
                  <span>{tarea.responsable}</span>
                )}
              </div>

              <div className="info-item">
                <label>Prioridad:</label>
                {isEditing ? (
                  <select
                    value={editedTarea.prioridad}
                    onChange={(e) => setEditedTarea({ ...editedTarea, prioridad: e.target.value as PrioridadTarea })}
                  >
                    {PRIORIDADES_DISPONIBLES.map(prioridad => (
                      <option key={prioridad.key} value={prioridad.key}>{prioridad.label}</option>
                    ))}
                  </select>
                ) : (
                  <span style={{ color: getPriorityColor(tarea.prioridad) }}>{tarea.prioridad}</span>
                )}
              </div>

              <div className="info-item">
                <label>Fecha de creación:</label>
                <span>{formatDate(tarea.fechaCreacion)}</span>
              </div>

              <div className="info-item">
                <label>Última actualización:</label>
                <span>{formatDate(tarea.fechaActualizacion)}</span>
              </div>

              <div className="info-item">
                <label>Fecha de vencimiento:</label>
                {isEditing ? (
                  <input
                    type="datetime-local"
                    value={editedTarea.fechaVencimiento ? new Date(editedTarea.fechaVencimiento).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditedTarea({ ...editedTarea, fechaVencimiento: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  />
                ) : (
                  <span>{formatDate(tarea.fechaVencimiento)}</span>
                )}
              </div>

              <div className="info-item">
                <label>Tiempo estimado:</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedTarea.tiempoEstimado || ''}
                    onChange={(e) => setEditedTarea({ ...editedTarea, tiempoEstimado: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Horas"
                  />
                ) : (
                  <span>{tarea.tiempoEstimado ? `${tarea.tiempoEstimado}h` : 'No definido'}</span>
                )}
              </div>

              <div className="info-item">
                <label>Tiempo trabajado:</label>
                <span>{tarea.tiempoTrabajado ? `${tarea.tiempoTrabajado}h` : '0h'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TareaDetalle;