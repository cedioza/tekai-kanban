/**
 * @fileoverview Entidades y tipos relacionados con responsables
 * Define la estructura de datos y DTOs para la gestión de responsables
 * @author TEKAI Team
 * @version 1.0.0
 */

/**
 * Interfaz que define la estructura de un responsable en el sistema
 * @interface Responsable
 */
export interface Responsable {
  /** Identificador único del responsable */
  id: number;
  /** Nombre completo del responsable */
  nombre: string;
  /** Correo electrónico del responsable */
  email: string;
  /** Indica si el responsable está activo en el sistema */
  activo: boolean;
  /** Fecha de creación del registro */
  fechaCreacion: Date;
  /** Fecha de última actualización */
  fechaActualizacion: Date;
}

/**
 * DTO para crear un nuevo responsable
 * @interface CreateResponsableDto
 */
export interface CreateResponsableDto {
  /** Nombre completo del responsable */
  nombre: string;
  /** Correo electrónico del responsable */
  email: string;
  /** Estado inicial del responsable (opcional, por defecto true) */
  activo?: boolean;
}

/**
 * DTO para actualizar un responsable existente
 * @interface UpdateResponsableDto
 */
export interface UpdateResponsableDto {
  /** Nuevo nombre del responsable (opcional) */
  nombre?: string;
  /** Nuevo correo electrónico (opcional) */
  email?: string;
  /** Nuevo estado activo/inactivo (opcional) */
  activo?: boolean;
}

/**
 * Lista de responsables disponibles en el sistema
 * Se utiliza como datos de prueba y referencia
 * @constant {string[]}
 */
export const RESPONSABLES_DISPONIBLES = [
  'Juan Pérez',
  'María García',
  'Carlos López',
  'Ana Martínez',
  'Luis Rodríguez',
  'Carmen Sánchez',
  'Miguel Torres',
  'Laura Jiménez'
] as const;

/**
 * Tipo que representa los nombres de responsables disponibles
 * @type ResponsableNombre
 */
export type ResponsableNombre = typeof RESPONSABLES_DISPONIBLES[number];