import React, { useState, useEffect } from 'react';
import { Tarea, CreateTareaDto, UpdateTareaDto, EstadoTarea, PrioridadTarea, PRIORIDADES_DISPONIBLES, ETIQUETAS_PREDEFINIDAS } from '../types/Tarea';
import { useTareasWithActivity } from '../hooks/useTareasWithActivity';
import { useResponsables } from '../context/ResponsableContext';
import { X, User, FileText, Calendar, Tag, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

interface TareaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tarea?: Tarea;
  mode: 'create' | 'edit';
}

const TareaModal: React.FC<TareaModalProps> = ({ isOpen, onClose, tarea, mode }) => {
  const { actions } = useTareasWithActivity();
  const { actions: responsableActions } = useResponsables();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    estado: EstadoTarea.CREADA,
    responsable: '',
    prioridad: PrioridadTarea.MEDIA,
    etiquetas: [] as string[],
    fechaVencimiento: '' // Agregar campo de fecha de vencimiento
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && tarea) {
      setFormData({
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        estado: tarea.estado,
        responsable: tarea.responsable,
        prioridad: tarea.prioridad,
        etiquetas: tarea.etiquetas,
        fechaVencimiento: tarea.fechaVencimiento ? new Date(tarea.fechaVencimiento).toISOString().slice(0, 16) : ''
      });
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        estado: EstadoTarea.CREADA,
        responsable: '',
        prioridad: PrioridadTarea.MEDIA,
        etiquetas: [],
        fechaVencimiento: ''
      });
    }
    setErrors({});
  }, [mode, tarea, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.responsable.trim()) {
      newErrors.responsable = 'El responsable es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (mode === 'create') {
        const createDto: CreateTareaDto = {
          titulo: formData.titulo.trim(),
          descripcion: formData.descripcion.trim(),
          estado: formData.estado,
          responsable: formData.responsable.trim(),
          prioridad: formData.prioridad,
          etiquetas: formData.etiquetas,
          fechaVencimiento: formData.fechaVencimiento ? new Date(formData.fechaVencimiento).toISOString() : undefined
        };
        await actions.createTarea(createDto);
      } else if (mode === 'edit' && tarea) {
        const updateDto: UpdateTareaDto = {
          titulo: formData.titulo.trim(),
          descripcion: formData.descripcion.trim(),
          estado: formData.estado,
          responsable: formData.responsable.trim(),
          prioridad: formData.prioridad,
          etiquetas: formData.etiquetas,
          fechaVencimiento: formData.fechaVencimiento ? new Date(formData.fechaVencimiento).toISOString() : undefined
        };
        await actions.updateTarea(tarea.id!, updateDto);
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar tarea:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!tarea?.id) return;
    
    setIsDeleting(true);
    try {
      await actions.deleteTarea(tarea.id);
      onClose();
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      setErrors({ general: 'Error al eliminar la tarea' });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };



  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
    <div className="modern-modal-overlay" onClick={handleOverlayClick}>
      <div className="modern-modal-container">
        {/* Header */}
        <div className="modern-modal-header">
          <div className="modal-header-content">
            <div className="modal-icon">
              <FileText className="w-6 h-6 icon-primary" />
            </div>
            <div>
              <h2 className="modern-modal-title">
                {mode === 'create' ? 'Crear nueva tarea' : `Editar tarea ${tarea?.id || ''}`}
              </h2>
              <p className="modern-modal-subtitle">
                {mode === 'create' ? 'Completa los detalles de la nueva tarea' : 'Modifica los detalles de la tarea'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modern-modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modern-modal-form">
            {/* Título */}
            <div className="modern-form-group">
              <label className="modern-form-label">
                <FileText size={16} className="label-icon" />
                <span>Título</span>
                <span className="required-asterisk">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className={`modern-input ${
                    errors.titulo ? 'input-error' : ''
                  }`}
                  placeholder="Ingresa el título de la tarea"
                  required
                />
              </div>
              {errors.titulo && <div className="form-error"><AlertCircle size={14} /><span>{errors.titulo}</span></div>}
            </div>

            {/* Descripción */}
            <div className="modern-form-group">
              <label className="modern-form-label">
                <FileText size={16} className="label-icon" />
                <span>Descripción</span>
                <span className="required-asterisk">*</span>
              </label>
              <div className="input-wrapper">
                <textarea
                   value={formData.descripcion}
                   onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                   rows={4}
                   className="modern-textarea"
                   placeholder="Describe los detalles de la tarea"
                 />
              </div>
              {errors.descripcion && <div className="form-error"><AlertCircle size={14} /><span>{errors.descripcion}</span></div>}
            </div>

            {/* Fecha de Vencimiento */}
            <div className="modern-form-group">
              <label className="modern-form-label">
                <Calendar size={16} className="label-icon" />
                <span>Fecha de Vencimiento</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="datetime-local"
                  value={formData.fechaVencimiento}
                  onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                  className="modern-input"
                  placeholder="Selecciona la fecha de vencimiento"
                />
              </div>
            </div>

            {/* Grid para Estado y Responsable */}
             <div className="form-grid">
               {/* Estado */}
               <div className="modern-form-group">
                 <label className="modern-form-label">
                   <Calendar size={16} className="label-icon" />
                   <span>Estado</span>
                 </label>
                 <div className="input-wrapper">
                   <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoTarea })}
                      className="modern-select"
                    >
                      <option value={EstadoTarea.CREADA}>📝 Creada</option>
                      <option value={EstadoTarea.EN_PROGRESO}>🔄 En Progreso</option>
                      <option value={EstadoTarea.FINALIZADA}>✅ Finalizada</option>
                      <option value={EstadoTarea.CANCELADA}>❌ Cancelada</option>
                    </select>
                 </div>
               </div>

               {/* Responsable */}
               <div className="modern-form-group">
                 <label className="modern-form-label">
                   <User size={16} className="label-icon" />
                   <span>Responsable</span>
                   <span className="required-asterisk">*</span>
                 </label>
                 <div className="input-wrapper">
                   <select
                      value={formData.responsable}
                      onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                      className={`modern-select ${
                        errors.responsable ? 'input-error' : ''
                      }`}
                      required
                    >
                      <option value="">Selecciona un responsable</option>
                      {responsableActions.getResponsableNames().map((responsable) => (
                        <option key={responsable} value={responsable}>
                          {responsable}
                        </option>
                      ))}
                    </select>
                 </div>
                 {errors.responsable && <div className="form-error"><AlertCircle size={14} /><span>{errors.responsable}</span></div>}
               </div>
             </div>

             {/* Grid para Prioridad y Etiquetas */}
             <div className="form-grid">
               {/* Prioridad */}
               <div className="modern-form-group">
                 <label className="modern-form-label">
                   <AlertCircle size={16} className="label-icon" />
                   <span>Prioridad</span>
                   <span className="required-asterisk">*</span>
                 </label>
                 <div className="input-wrapper">
                   <select
                      value={formData.prioridad}
                      onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as PrioridadTarea })}
                      className="modern-select"
                      required
                    >
                      {PRIORIDADES_DISPONIBLES.map((prioridad) => (
                        <option key={prioridad.key} value={prioridad.key}>
                          {prioridad.icon} {prioridad.label}
                        </option>
                      ))}
                    </select>
                 </div>
               </div>

               {/* Etiquetas */}
               <div className="modern-form-group">
                 <label className="modern-form-label">
                   <Tag size={16} className="label-icon" />
                   <span>Etiquetas</span>
                 </label>
                 <div className="input-wrapper">
                   <select
                      multiple
                      value={formData.etiquetas}
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                        setFormData(prev => ({ ...prev, etiquetas: selectedOptions }));
                      }}
                      className="modern-select multi-select"
                      size={4}
                    >
                      {ETIQUETAS_PREDEFINIDAS.map((etiqueta) => (
                        <option key={etiqueta} value={etiqueta}>
                          {etiqueta}
                        </option>
                      ))}
                    </select>
                 </div>
                 <small className="form-hint">Mantén Ctrl presionado para seleccionar múltiples etiquetas</small>
               </div>
             </div>

            {/* Actions */}
             <div className="modern-modal-actions">
               <div className="modal-actions-left">
                 {mode === 'edit' && (
                   <button
                     type="button"
                     onClick={() => setShowDeleteConfirm(true)}
                     className="modern-btn btn-danger"
                     disabled={isSubmitting || isDeleting}
                   >
                     <Trash2 size={16} />
                     <span>Eliminar</span>
                   </button>
                 )}
               </div>
               <div className="modal-actions-right">
                 <button
                   type="button"
                   onClick={onClose}
                   className="modern-btn btn-secondary"
                   disabled={isSubmitting || isDeleting}
                 >
                   <X size={16} />
                   <span>Cancelar</span>
                 </button>
                 <button
                   type="submit"
                   disabled={isSubmitting || isDeleting}
                   className="modern-btn btn-primary"
                 >
                   {isSubmitting ? (
                     <>
                       <div className="loading-spinner" />
                       <span>Guardando...</span>
                     </>
                   ) : (
                     <>
                       <CheckCircle2 size={16} />
                       <span>{mode === 'create' ? 'Crear Tarea' : 'Actualizar Tarea'}</span>
                     </>
                   )}
                 </button>
               </div>
             </div>
          </form>
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
                <p>¿Estás seguro de que deseas eliminar la tarea <strong>"{tarea?.titulo}"</strong>?</p>
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

export default TareaModal;