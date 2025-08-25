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
  tareaId: number;
  autor: string;
  contenido: string;
  tipo: TipoComentario;
}