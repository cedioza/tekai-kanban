import { ResponsableRepository } from '../repositories/ResponsableRepository';
import { Responsable, CreateResponsableDto, UpdateResponsableDto } from '../models/Responsable';

export class ResponsableService {
  private responsableRepository: ResponsableRepository;

  constructor() {
    this.responsableRepository = new ResponsableRepository();
  }

  async getAllResponsables(): Promise<Responsable[]> {
    try {
      return await this.responsableRepository.getAllResponsables();
    } catch (error) {
      console.error('Error in ResponsableService.getAllResponsables:', error);
      throw new Error('Error al obtener responsables');
    }
  }

  async getResponsablesActivos(): Promise<Responsable[]> {
    try {
      return await this.responsableRepository.getResponsablesActivos();
    } catch (error) {
      console.error('Error in ResponsableService.getResponsablesActivos:', error);
      throw new Error('Error al obtener responsables activos');
    }
  }

  async getResponsableById(id: number): Promise<Responsable> {
    try {
      const responsable = await this.responsableRepository.getResponsableById(id);
      if (!responsable) {
        throw new Error('Responsable no encontrado');
      }
      return responsable;
    } catch (error) {
      console.error('Error in ResponsableService.getResponsableById:', error);
      throw error;
    }
  }

  async getResponsableByNombre(nombre: string): Promise<Responsable> {
    try {
      const responsable = await this.responsableRepository.getResponsableByNombre(nombre);
      if (!responsable) {
        throw new Error('Responsable no encontrado');
      }
      return responsable;
    } catch (error) {
      console.error('Error in ResponsableService.getResponsableByNombre:', error);
      throw error;
    }
  }

  async createResponsable(responsableData: CreateResponsableDto): Promise<Responsable> {
    try {
      // Validaciones
      if (!responsableData.nombre || responsableData.nombre.trim().length === 0) {
        throw new Error('El nombre del responsable es requerido');
      }

      if (!responsableData.email || responsableData.email.trim().length === 0) {
        throw new Error('El email del responsable es requerido');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(responsableData.email)) {
        throw new Error('El formato del email no es válido');
      }

      // Verificar si ya existe un responsable con el mismo nombre o email
      try {
        await this.getResponsableByNombre(responsableData.nombre);
        throw new Error('Ya existe un responsable con ese nombre');
      } catch (error) {
        if (error instanceof Error && error.message !== 'Responsable no encontrado') {
          throw error;
        }
      }

      return await this.responsableRepository.createResponsable(responsableData);
    } catch (error) {
      console.error('Error in ResponsableService.createResponsable:', error);
      throw error;
    }
  }

  async updateResponsable(id: number, updates: UpdateResponsableDto): Promise<Responsable> {
    try {
      // Validar que el responsable existe
      await this.getResponsableById(id);

      // Validaciones de los campos a actualizar
      if (updates.nombre !== undefined && updates.nombre.trim().length === 0) {
        throw new Error('El nombre del responsable no puede estar vacío');
      }

      if (updates.email !== undefined) {
        if (updates.email.trim().length === 0) {
          throw new Error('El email del responsable no puede estar vacío');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.email)) {
          throw new Error('El formato del email no es válido');
        }
      }

      const updatedResponsable = await this.responsableRepository.updateResponsable(id, updates);
      if (!updatedResponsable) {
        throw new Error('Error al actualizar el responsable');
      }

      return updatedResponsable;
    } catch (error) {
      console.error('Error in ResponsableService.updateResponsable:', error);
      throw error;
    }
  }

  async deleteResponsable(id: number): Promise<void> {
    try {
      // Validar que el responsable existe
      await this.getResponsableById(id);

      const deleted = await this.responsableRepository.deleteResponsable(id);
      if (!deleted) {
        throw new Error('Error al eliminar el responsable');
      }
    } catch (error) {
      console.error('Error in ResponsableService.deleteResponsable:', error);
      throw error;
    }
  }

  async toggleResponsableStatus(id: number): Promise<Responsable> {
    try {
      const responsable = await this.getResponsableById(id);
      return await this.updateResponsable(id, { activo: !responsable.activo });
    } catch (error) {
      console.error('Error in ResponsableService.toggleResponsableStatus:', error);
      throw error;
    }
  }
}