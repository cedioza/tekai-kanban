import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTareasWithActivity } from '../hooks/useTareasWithActivity';
import { Tarea, EstadoTarea, PrioridadTarea, CreateComentarioDto, TipoComentario } from '../types/Tarea';
import { ESTADOS_KANBAN, PRIORIDADES_DISPONIBLES } from '../types/Tarea';
import { useResponsables } from '../context/ResponsableContext';
import { Calendar, ArrowLeft, Save, X } from 'lucide-react';
import '../App.css';

const TareaEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: { tareas }, actions } = useTareasWithActivity();
  const { actions: responsableActions } = useResponsables();
  const [tarea, setTarea] = useState<Tarea | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTarea, setEditedTarea] = useState<Tarea | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id && tareas.length > 0) {
      const foundTarea = tareas.find(t => t.id === parseInt(id));
      if (foundTarea) {
        setTarea(foundTarea);
        setEditedTarea({ ...foundTarea });
      }
      setIsLoading(false);
    }
  }, [id, tareas]);

  const handleSave = async () => {
    if (!editedTarea) return;
    
    setIsSaving(true);
    try {
      await actions.updateTarea(editedTarea.id!, editedTarea);
      setTarea(editedTarea);
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (tarea) {
      setEditedTarea({ ...tarea });
    }
    setIsEditing(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !tarea) return;
    
    const comentarioDto: CreateComentarioDto = {
      autor: 'Usuario Actual',
      contenido: newComment,
      tipo: TipoComentario.COMENTARIO
    };
    
    try {
      await actions.addComment(tarea.id!, comentarioDto);
      setNewComment('');
      setShowCommentForm(false);
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No definida';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getPriorityColor = (prioridad: PrioridadTarea) => {
    switch (prioridad) {
      case PrioridadTarea.ALTA: return '#ef4444';
      case PrioridadTarea.MEDIA: return '#f59e0b';
      case PrioridadTarea.BAJA: return '#10b981';
      default: return '#6b7280';
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

  if (isLoading) {
    return (
      <div className="app">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div>Cargando tarea...</div>
        </div>
      </div>
    );
  }

  if (!tarea) {
    return (
      <div className="app">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Tarea no encontrada</h2>
          <button onClick={() => navigate('/')} className="modern-btn modern-btn-primary">
            <ArrowLeft size={16} />
            Volver al tablero
          </button>
        </div>
      </div>
    );
  }

  const currentTarea = isEditing ? editedTarea! : tarea;

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <button 
                onClick={() => navigate('/')} 
                className="modern-btn modern-btn-secondary"
                style={{ padding: '0.5rem' }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="app-title">Editar Tarea</h1>
                <p className="app-subtitle">#{tarea.id} - {tarea.titulo}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSave} 
                    className="modern-btn modern-btn-primary"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="spinner" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Guardar
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleCancel} 
                    className="modern-btn modern-btn-secondary"
                    disabled={isSaving}
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="modern-btn modern-btn-primary"
                >
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--spacing-lg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-xl)' }}>
          {/* Left Column - Main Content */}
          <div>
            {/* Title Section */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTarea?.titulo || ''}
                  onChange={(e) => setEditedTarea(prev => prev ? { ...prev, titulo: e.target.value } : null)}
                  className="modern-form-input"
                  style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 'var(--spacing-md)' }}
                />
              ) : (
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 'var(--spacing-md)' }}>
                  {currentTarea.titulo}
                </h2>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>#{tarea.id}</span>
                <span 
                  style={{ 
                    backgroundColor: getPriorityColor(currentTarea.prioridad),
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  {currentTarea.prioridad}
                </span>
              </div>
            </div>

            {/* Description Section */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Descripción</h3>
              {isEditing ? (
                <textarea
                  value={editedTarea?.descripcion || ''}
                  onChange={(e) => setEditedTarea(prev => prev ? { ...prev, descripcion: e.target.value } : null)}
                  className="modern-form-textarea"
                  rows={4}
                  style={{ width: '100%' }}
                />
              ) : (
                <p style={{ lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                  {currentTarea.descripcion}
                </p>
              )}
            </div>

            {/* Tags Section */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Etiquetas</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                {currentTarea.etiquetas?.map((etiqueta, index) => (
                  <span 
                    key={index} 
                    style={{
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}
                  >
                    {etiqueta}
                  </span>
                ))}
                {(!currentTarea.etiquetas || currentTarea.etiquetas.length === 0) && (
                  <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin etiquetas</span>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Actividad y Comentarios</h3>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '0.5rem', padding: 'var(--spacing-lg)' }}>
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  {currentTarea.comentarios?.map((comentario) => (
                    <div key={comentario.id} style={{ marginBottom: 'var(--spacing-md)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                        <span>{getCommentTypeIcon(comentario.tipo)}</span>
                        <span style={{ fontWeight: 'bold' }}>{comentario.autor}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                          {formatDate(comentario.fechaCreacion)}
                        </span>
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)' }}>{comentario.contenido}</div>
                    </div>
                  ))}
                  {(!currentTarea.comentarios || currentTarea.comentarios.length === 0) && (
                    <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No hay comentarios aún</p>
                  )}
                </div>
                
                {showCommentForm ? (
                  <div>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escribe un comentario..."
                      className="modern-form-textarea"
                      rows={3}
                      style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}
                    />
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                      <button onClick={handleAddComment} className="modern-btn modern-btn-primary">
                        Agregar
                      </button>
                      <button onClick={() => setShowCommentForm(false)} className="modern-btn modern-btn-secondary">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowCommentForm(true)} className="modern-btn modern-btn-secondary">
                    💬 Agregar comentario
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '0.5rem', padding: 'var(--spacing-lg)' }}>
              <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Información</h3>
              
              {/* Estado */}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 'bold' }}>Estado:</label>
                {isEditing ? (
                  <select
                    value={editedTarea?.estado || ''}
                    onChange={(e) => setEditedTarea(prev => prev ? { ...prev, estado: e.target.value as EstadoTarea } : null)}
                    className="modern-form-input"
                  >
                    {ESTADOS_KANBAN.map(estado => (
                      <option key={estado.key} value={estado.key}>{estado.label}</option>
                    ))}
                  </select>
                ) : (
                  <span style={{ 
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem'
                  }}>
                    {currentTarea.estado}
                  </span>
                )}
              </div>
              
              {/* Responsable */}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 'bold' }}>Responsable:</label>
                {isEditing ? (
                  <select
                    value={editedTarea?.responsable || ''}
                    onChange={(e) => setEditedTarea(prev => prev ? { ...prev, responsable: e.target.value } : null)}
                    className="modern-form-input"
                  >
                    {responsableActions.getResponsableNames().map(responsable => (
                      <option key={responsable} value={responsable}>{responsable}</option>
                    ))}
                  </select>
                ) : (
                  <span>{currentTarea.responsable}</span>
                )}
              </div>

              {/* Prioridad */}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 'bold' }}>Prioridad:</label>
                {isEditing ? (
                  <select
                    value={editedTarea?.prioridad || ''}
                    onChange={(e) => setEditedTarea(prev => prev ? { ...prev, prioridad: e.target.value as PrioridadTarea } : null)}
                    className="modern-form-input"
                  >
                    {PRIORIDADES_DISPONIBLES.map(prioridad => (
                      <option key={prioridad.key} value={prioridad.key}>{prioridad.label}</option>
                    ))}
                  </select>
                ) : (
                  <span style={{ color: getPriorityColor(currentTarea.prioridad) }}>{currentTarea.prioridad}</span>
                )}
              </div>

              {/* Fecha de creación */}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 'bold' }}>Fecha de creación:</label>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  {formatDate(currentTarea.fechaCreacion)}
                </span>
              </div>

              {/* Última actualización */}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 'bold' }}>Última actualización:</label>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  {formatDate(currentTarea.fechaActualizacion)}
                </span>
              </div>

              {/* Fecha de vencimiento */}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 'bold' }}>Fecha de vencimiento:</label>
                {isEditing ? (
                  <input
                    type="datetime-local"
                    value={editedTarea?.fechaVencimiento ? (() => {
                      try {
                        return new Date(editedTarea.fechaVencimiento).toISOString().slice(0, 16);
                      } catch {
                        return '';
                      }
                    })() : ''}
                    onChange={(e) => setEditedTarea(prev => prev ? { ...prev, fechaVencimiento: e.target.value ? new Date(e.target.value).toISOString() : undefined } : null)}
                    className="modern-form-input"
                  />
                ) : (
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    {formatDate(currentTarea.fechaVencimiento)}
                  </span>
                )}
              </div>

              {/* Tiempo estimado */}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 'bold' }}>Tiempo estimado:</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedTarea?.tiempoEstimado || ''}
                    onChange={(e) => setEditedTarea(prev => prev ? { ...prev, tiempoEstimado: e.target.value ? parseInt(e.target.value) : undefined } : null)}
                    placeholder="Horas"
                    className="modern-form-input"
                  />
                ) : (
                  <span>{currentTarea.tiempoEstimado ? `${currentTarea.tiempoEstimado}h` : 'No definido'}</span>
                )}
              </div>

              {/* Tiempo trabajado */}
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: 'bold' }}>Tiempo trabajado:</label>
                <span>{currentTarea.tiempoTrabajado ? `${currentTarea.tiempoTrabajado}h` : '0h'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TareaEditPage;