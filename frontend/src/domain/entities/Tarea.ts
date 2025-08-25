/**
 * @fileoverview Definiciones de tipos y interfaces para el sistema TEKAI Kanban
 * Contiene todas las estructuras de datos, enums y constantes del dominio
 * @author TEKAI Team
 * @version 1.0.0
 */

/**
 * Interfaz principal que representa una tarea en el sistema Kanban
 * 
 * @interface Tarea
 * @property {number} [id] - Identificador único de la tarea (generado por el backend)
 * @property {string} titulo - Título descriptivo de la tarea
 * @property {string} descripcion - Descripción detallada de la tarea
 * @property {EstadoTarea} estado - Estado actual de la tarea en el flujo Kanban
 * @property {string} responsable - Nombre del responsable asignado
 * @property {string} fechaCreacion - Fecha y hora de creación (ISO string)
 * @property {string} [fechaVencimiento] - Fecha límite para completar la tarea (ISO string)
 * @property {string} [fechaActualizacion] - Última fecha de modificación (ISO string)
 * @property {PrioridadTarea} prioridad - Nivel de prioridad de la tarea
 * @property {string[]} etiquetas - Lista de etiquetas para categorización
 * @property {Comentario[]} comentarios - Comentarios asociados a la tarea
 * @property {number} [tiempoEstimado] - Tiempo estimado en horas para completar
 * @property {number} [tiempoTrabajado] - Tiempo real trabajado en horas
 */
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

/**
 * Interfaz que representa un comentario en una tarea
 * 
 * @interface Comentario
 * @property {number} [id] - Identificador único del comentario
 * @property {number} tareaId - ID de la tarea a la que pertenece el comentario
 * @property {string} autor - Nombre del autor del comentario
 * @property {string} contenido - Texto del comentario
 * @property {string} fechaCreacion - Fecha y hora de creación (ISO string)
 * @property {TipoComentario} tipo - Tipo de comentario para categorización
 */
export interface Comentario {
  id?: number;
  tareaId: number;
  autor: string;
  contenido: string;
  fechaCreacion: string;
  tipo: TipoComentario;
}

/**
 * Enum que define los niveles de prioridad disponibles para las tareas
 * 
 * @enum {string}
 */
export enum PrioridadTarea {
  /** Prioridad baja - tareas no urgentes */
  BAJA = 'Baja',
  /** Prioridad media - tareas normales */
  MEDIA = 'Media',
  /** Prioridad alta - tareas importantes */
  ALTA = 'Alta',
  /** Prioridad crítica - tareas urgentes que requieren atención inmediata */
  CRITICA = 'Crítica'
}

/**
 * Enum que define los tipos de comentarios disponibles
 * 
 * @enum {string}
 */
export enum TipoComentario {
  /** Comentario general del usuario */
  COMENTARIO = 'comentario',
  /** Comentario automático por actualización de campos */
  ACTUALIZACION = 'actualizacion',
  /** Comentario automático por cambio de estado */
  CAMBIO_ESTADO = 'cambio_estado'
}

/**
 * Interfaz que representa una actividad en el historial de cambios
 * Registra todas las acciones realizadas sobre las tareas
 * 
 * @interface ActividadHistorial
 * @property {string} id - Identificador único de la actividad
 * @property {number} tareaId - ID de la tarea relacionada
 * @property {TipoActividad} tipo - Tipo de actividad realizada
 * @property {string} descripcion - Descripción legible de la actividad
 * @property {string} usuario - Usuario que realizó la actividad
 * @property {string} fecha - Fecha y hora de la actividad (ISO string)
 * @property {object} [detalles] - Información adicional sobre la actividad
 * @property {string} [detalles.campoModificado] - Campo que fue modificado
 * @property {any} [detalles.valorAnterior] - Valor anterior del campo
 * @property {any} [detalles.valorNuevo] - Nuevo valor del campo
 * @property {string} [detalles.comentario] - Comentario adicional sobre la actividad
 */
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

/**
 * Enum que define los tipos de actividades que se pueden registrar
 * 
 * @enum {string}
 */
export enum TipoActividad {
  /** Creación de una nueva tarea */
  CREACION = 'creacion',
  /** Actualización general de campos de la tarea */
  ACTUALIZACION = 'actualizacion',
  /** Cambio específico del estado de la tarea */
  CAMBIO_ESTADO = 'cambio_estado',
  /** Cambio del responsable asignado */
  CAMBIO_RESPONSABLE = 'cambio_responsable',
  /** Cambio del nivel de prioridad */
  CAMBIO_PRIORIDAD = 'cambio_prioridad',
  /** Adición de un nuevo comentario */
  AGREGADO_COMENTARIO = 'agregado_comentario',
  /** Eliminación de la tarea */
  ELIMINACION = 'eliminacion'
}

/**
 * Interfaz que representa una notificación de actividad
 * 
 * @interface NotificacionActividad
 * @property {string} id - Identificador único de la notificación
 * @property {string} actividadId - ID de la actividad relacionada
 * @property {boolean} leida - Indica si la notificación ha sido leída
 * @property {string} fecha - Fecha y hora de la notificación (ISO string)
 */
export interface NotificacionActividad {
  id: string;
  actividadId: string;
  leida: boolean;
  fecha: string;
}

/**
 * Enum que define los estados posibles de una tarea en el flujo Kanban
 * 
 * @enum {string}
 */
export enum EstadoTarea {
  /** Tarea recién creada, pendiente de iniciar */
  CREADA = 'Creada',
  /** Tarea en desarrollo activo */
  EN_PROGRESO = 'En progreso',
  /** Tarea bloqueada por dependencias o impedimentos */
  BLOQUEADA = 'Bloqueada',
  /** Tarea completada exitosamente */
  FINALIZADA = 'Finalizada',
  /** Tarea cancelada sin completar */
  CANCELADA = 'Cancelada'
}

/**
 * DTO (Data Transfer Object) para crear una nueva tarea
 * Contiene solo los campos necesarios para la creación
 * 
 * @interface CreateTareaDto
 * @property {string} titulo - Título de la nueva tarea
 * @property {string} descripcion - Descripción detallada
 * @property {EstadoTarea} estado - Estado inicial de la tarea
 * @property {string} responsable - Responsable asignado
 * @property {string} [fechaVencimiento] - Fecha límite opcional (ISO string)
 * @property {PrioridadTarea} prioridad - Nivel de prioridad
 * @property {string[]} etiquetas - Lista de etiquetas
 * @property {number} [tiempoEstimado] - Tiempo estimado en horas
 */
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

/**
 * DTO (Data Transfer Object) para actualizar una tarea existente
 * Todos los campos son opcionales para permitir actualizaciones parciales
 * 
 * @interface UpdateTareaDto
 * @property {string} [titulo] - Nuevo título
 * @property {string} [descripcion] - Nueva descripción
 * @property {EstadoTarea} [estado] - Nuevo estado
 * @property {string} [responsable] - Nuevo responsable
 * @property {string} [fechaVencimiento] - Nueva fecha límite (ISO string)
 * @property {PrioridadTarea} [prioridad] - Nueva prioridad
 * @property {string[]} [etiquetas] - Nuevas etiquetas
 * @property {number} [tiempoEstimado] - Nuevo tiempo estimado en horas
 * @property {number} [tiempoTrabajado] - Tiempo trabajado actualizado en horas
 */
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

/**
 * DTO (Data Transfer Object) para crear un nuevo comentario
 * 
 * @interface CreateComentarioDto
 * @property {string} autor - Nombre del autor del comentario
 * @property {string} contenido - Texto del comentario
 * @property {TipoComentario} tipo - Tipo de comentario
 */
export interface CreateComentarioDto {
  autor: string;
  contenido: string;
  tipo: TipoComentario;
}

// RESPONSABLES_DISPONIBLES moved to Responsable.ts to avoid duplicate exports

/**
 * Configuración visual de los estados del tablero Kanban
 * Define colores y etiquetas para cada estado
 * 
 * @constant {Array<{key: EstadoTarea, label: string, color: string}>}
 */
export const ESTADOS_KANBAN = [
  { key: EstadoTarea.CREADA, label: 'Creada', color: '#e3f2fd' },
  { key: EstadoTarea.EN_PROGRESO, label: 'En progreso', color: '#fff3e0' },
  { key: EstadoTarea.BLOQUEADA, label: 'Bloqueada', color: '#ffebee' },
  { key: EstadoTarea.FINALIZADA, label: 'Finalizada', color: '#e8f5e8' },
  { key: EstadoTarea.CANCELADA, label: 'Cancelada', color: '#fafafa' }
];

/**
 * Configuración visual de las prioridades de tareas
 * Define colores, etiquetas e iconos para cada nivel de prioridad
 * 
 * @constant {Array<{key: PrioridadTarea, label: string, color: string, icon: string}>}
 */
export const PRIORIDADES_DISPONIBLES = [
  { key: PrioridadTarea.BAJA, label: 'Baja', color: '#4caf50', icon: '⬇️' },
  { key: PrioridadTarea.MEDIA, label: 'Media', color: '#ff9800', icon: '➡️' },
  { key: PrioridadTarea.ALTA, label: 'Alta', color: '#f44336', icon: '⬆️' },
  { key: PrioridadTarea.CRITICA, label: 'Crítica', color: '#9c27b0', icon: '🔥' }
];

/**
 * Lista de etiquetas predefinidas para categorización de tareas
 * Facilita la organización y filtrado de tareas por tipo de trabajo
 * 
 * @constant {string[]}
 */
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