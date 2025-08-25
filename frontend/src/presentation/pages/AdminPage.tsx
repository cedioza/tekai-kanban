import React, { useState } from 'react';
import { useTareas } from '../../application/contexts/TareaContext';
import { useResponsables } from '../../application/contexts/ResponsableContext';
import { User, Plus, Edit2, Trash2, Save, X, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Responsable as ResponsableType } from '../../domain/entities/Responsable';

// Usar el tipo Responsable del servicio

const AdminPage: React.FC = () => {
  const { state: { tareas } } = useTareas();
  const { state: { responsables }, actions: responsableActions } = useResponsables();
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newResponsable, setNewResponsable] = useState({ nombre: '', email: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEdit = (id: number) => {
    setEditingId(id);
  };

  const handleSave = async (id: number, updatedData: Partial<ResponsableType>) => {
    const success = await responsableActions.updateResponsable(id, updatedData);
    if (success) {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    const responsable = responsables.find(r => r.id === id);
    if (responsable) {
      // Verificar si tiene tareas asignadas
      const tareasAsignadas = tareas.filter(t => t.responsable === responsable.nombre).length;
      
      if (tareasAsignadas > 0) {
        toast.error(`No se puede eliminar: ${responsable.nombre} tiene ${tareasAsignadas} tarea(s) asignada(s)`);
        return;
      }
      
      await responsableActions.deleteResponsable(id);
    }
  };

  const handleAdd = async () => {
    if (!newResponsable.nombre.trim() || !newResponsable.email.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    
    const success = await responsableActions.createResponsable({
      nombre: newResponsable.nombre.trim(),
      email: newResponsable.email.trim(),
      activo: true
    });
    
    if (success) {
      setNewResponsable({ nombre: '', email: '' });
      setShowAddForm(false);
    }
  };

  const toggleActive = async (id: number) => {
    const responsable = responsables.find(r => r.id === id);
    if (responsable) {
      await responsableActions.updateResponsable(id, { activo: !responsable.activo });
    }
  };

  const getTaskCount = (nombre: string) => {
    return tareas.filter(t => t.responsable === nombre).length;
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Administrador de Responsables</h2>
        <p>Gestiona los responsables del sistema y sus permisos</p>
      </div>

      {/* Botón para agregar nuevo responsable */}
      <div className="admin-actions">
        <button 
          className="modern-btn primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={16} />
          <span>Agregar Responsable</span>
        </button>
      </div>

      {/* Formulario para agregar responsable */}
      {showAddForm && (
        <div className="add-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Nombre completo"
              value={newResponsable.nombre}
              onChange={(e) => setNewResponsable(prev => ({ ...prev, nombre: e.target.value }))}
              className="form-input"
            />
            <input
              type="email"
              placeholder="Email"
              value={newResponsable.email}
              onChange={(e) => setNewResponsable(prev => ({ ...prev, email: e.target.value }))}
              className="form-input"
            />
          </div>
          <div className="form-actions">
            <button className="modern-btn success" onClick={handleAdd}>
              <Save size={16} />
              <span>Guardar</span>
            </button>
            <button 
              className="modern-btn secondary" 
              onClick={() => {
                setShowAddForm(false);
                setNewResponsable({ nombre: '', email: '' });
              }}
            >
              <X size={16} />
              <span>Cancelar</span>
            </button>
          </div>
        </div>
      )}

      {/* Lista de responsables */}
      <div className="responsables-list">
        {responsables.map((responsable) => (
          <ResponsableCard
            key={responsable.id}
            responsable={responsable}
            isEditing={editingId === responsable.id}
            taskCount={getTaskCount(responsable.nombre)}
            onEdit={() => handleEdit(responsable.id)}
            onSave={(data) => handleSave(responsable.id, data)}
            onDelete={() => handleDelete(responsable.id)}
            onToggleActive={() => toggleActive(responsable.id)}
            onCancelEdit={() => setEditingId(null)}
          />
        ))}
      </div>

      {responsables.length === 0 && (
        <div className="empty-state">
          <User size={48} className="empty-icon" />
          <h3>No hay responsables registrados</h3>
          <p>Agrega el primer responsable para comenzar</p>
        </div>
      )}
    </div>
  );
};

interface ResponsableCardProps {
  responsable: ResponsableType;
  isEditing: boolean;
  taskCount: number;
  onEdit: () => void;
  onSave: (data: Partial<ResponsableType>) => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onCancelEdit: () => void;
}

const ResponsableCard: React.FC<ResponsableCardProps> = ({
  responsable,
  isEditing,
  taskCount,
  onEdit,
  onSave,
  onDelete,
  onToggleActive,
  onCancelEdit
}) => {
  const [editData, setEditData] = useState({
    nombre: responsable.nombre,
    email: responsable.email
  });

  const handleSave = () => {
    if (!editData.nombre.trim() || !editData.email.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    onSave(editData);
  };

  return (
    <div className={`responsable-card ${!responsable.activo ? 'inactive' : ''}`}>
      <div className="responsable-info">
        <div className="responsable-avatar">
          <User size={24} />
        </div>
        
        <div className="responsable-details">
          {isEditing ? (
            <>
              <input
                type="text"
                value={editData.nombre}
                onChange={(e) => setEditData(prev => ({ ...prev, nombre: e.target.value }))}
                className="edit-input"
              />
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                className="edit-input"
              />
            </>
          ) : (
            <>
              <h4>{responsable.nombre}</h4>
              <p>{responsable.email}</p>
            </>
          )}
        </div>
        
        <div className="responsable-stats">
          <div className="task-count">
            <span className="count">{taskCount}</span>
            <span className="label">Tareas</span>
          </div>
          
          <div className={`status-badge ${responsable.activo ? 'active' : 'inactive'}`}>
            <UserCheck size={14} />
            <span>{responsable.activo ? 'Activo' : 'Inactivo'}</span>
          </div>
        </div>
      </div>
      
      <div className="responsable-actions">
        {isEditing ? (
          <>
            <button className="action-btn save" onClick={handleSave}>
              <Save size={16} />
            </button>
            <button className="action-btn cancel" onClick={onCancelEdit}>
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <button className="action-btn edit" onClick={onEdit}>
              <Edit2 size={16} />
            </button>
            <button 
              className={`action-btn ${responsable.activo ? 'deactivate' : 'activate'}`}
              onClick={onToggleActive}
            >
              <UserCheck size={16} />
            </button>
            <button 
              className="action-btn delete" 
              onClick={onDelete}
              disabled={taskCount > 0}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;