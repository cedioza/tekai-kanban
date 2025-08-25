export interface Tarea {
  id?: number;
  titulo: string;
  descripcion: string;
  estado: EstadoTarea;
  responsable: string;
  fechaCreacion: string;
  fechaVencimiento?: string;
  fechaActualizacion?: string;
  prioridad: PrioridadTarea;
  etiquetas: string[];
  comentarios: Comentario[];
  tiempoEstimado?: number; // en horas
  tiempoTrabajado?: number; // en horas
}

export interface Comentario {
  id?: number;
  tareaId: number;
  autor: string;
  contenido: string;
  fechaCreacion: string;
  tipo: TipoComentario;
}

export enum PrioridadTarea {
  BAJA = 'Baja',
  MEDIA = 'Media',
  ALTA = 'Alta',
  CRITICA = 'Crítica'
}

export enum TipoComentario {
  COMENTARIO = 'comentario',
  ACTUALIZACION = 'actualizacion',
  CAMBIO_ESTADO = 'cambio_estado'
}

// Tipos para el historial de actividades
export interface ActividadHistorial {
  id: string;
  tareaId: number;
  tipo: TipoActividad;
  descripcion: string;
  usuario: string;
  fecha: string;
  detalles?: {
    campoModificado?: string;
    valorAnterior?: any;
    valorNuevo?: any;
    comentario?: string;
  };
}

export enum TipoActividad {
  CREACION = 'creacion',
  ACTUALIZACION = 'actualizacion',
  CAMBIO_ESTADO = 'cambio_estado',
  CAMBIO_RESPONSABLE = 'cambio_responsable',
  CAMBIO_PRIORIDAD = 'cambio_prioridad',
  AGREGADO_COMENTARIO = 'agregado_comentario',
  ELIMINACION = 'eliminacion'
}

export interface NotificacionActividad {
  id: string;
  actividadId: string;
  leida: boolean;
  fecha: string;
}

export enum EstadoTarea {
  CREADA = 'Creada',
  EN_PROGRESO = 'En progreso',
  BLOQUEADA = 'Bloqueada',
  FINALIZADA = 'Finalizada',
  CANCELADA = 'Cancelada'
}

export interface CreateTareaDto {
  titulo: string;
  descripcion: string;
  estado: EstadoTarea;
  responsable: string;
  fechaVencimiento?: string;
  prioridad: PrioridadTarea;
  etiquetas: string[];
  tiempoEstimado?: number;
}

export interface UpdateTareaDto {
  titulo?: string;
  descripcion?: string;
  estado?: EstadoTarea;
  responsable?: string;
  fechaVencimiento?: string;
  prioridad?: PrioridadTarea;
  etiquetas?: string[];
  tiempoEstimado?: number;
  tiempoTrabajado?: number;
}

export interface CreateComentarioDto {
  autor: string;
  contenido: string;
  tipo: TipoComentario;
}

export const RESPONSABLES_DISPONIBLES = [
  'Juan Henao',
  'María García',
  'Carlos López',
  'Ana Martínez',
  'Pedro Rodríguez',
  'Laura Sánchez'
];

export const ESTADOS_KANBAN = [
  { key: EstadoTarea.CREADA, label: 'Creada', color: '#e3f2fd' },
  { key: EstadoTarea.EN_PROGRESO, label: 'En progreso', color: '#fff3e0' },
  { key: EstadoTarea.BLOQUEADA, label: 'Bloqueada', color: '#ffebee' },
  { key: EstadoTarea.FINALIZADA, label: 'Finalizada', color: '#e8f5e8' },
  { key: EstadoTarea.CANCELADA, label: 'Cancelada', color: '#fafafa' }
];

export const PRIORIDADES_DISPONIBLES = [
  { key: PrioridadTarea.BAJA, label: 'Baja', color: '#4caf50', icon: '⬇️' },
  { key: PrioridadTarea.MEDIA, label: 'Media', color: '#ff9800', icon: '➡️' },
  { key: PrioridadTarea.ALTA, label: 'Alta', color: '#f44336', icon: '⬆️' },
  { key: PrioridadTarea.CRITICA, label: 'Crítica', color: '#9c27b0', icon: '🔥' }
];

export const ETIQUETAS_PREDEFINIDAS = [
  'Frontend',
  'Backend',
  'Bug',
  'Feature',
  'Documentación',
  'Testing',
  'UI/UX',
  'API',
  'Database',
  'Performance',
  'Security',
  'Refactoring'
];