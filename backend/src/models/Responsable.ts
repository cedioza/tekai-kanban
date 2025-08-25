export interface Responsable {
  id?: number;
  nombre: string;
  email: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion?: string;
}

export interface CreateResponsableDto {
  nombre: string;
  email: string;
  activo?: boolean;
}

export interface UpdateResponsableDto {
  nombre?: string;
  email?: string;
  activo?: boolean;
}

// Responsables por defecto del sistema
export const RESPONSABLES_DEFAULT = [
  { nombre: 'Juan Henao', email: 'juan.henao@empresa.com' },
  { nombre: 'María García', email: 'maria.garcia@empresa.com' },
  { nombre: 'Carlos López', email: 'carlos.lopez@empresa.com' },
  { nombre: 'Ana Martínez', email: 'ana.martinez@empresa.com' },
  { nombre: 'Pedro Rodríguez', email: 'pedro.rodriguez@empresa.com' },
  { nombre: 'Laura Sánchez', email: 'laura.sanchez@empresa.com' },
  { nombre: 'Administrador', email: 'admin@empresa.com' }
];