import { API_BASE_URL } from '../config/api';

export interface Responsable {
  id: number;
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

class ResponsableService {
  private baseUrl = `${API_BASE_URL}/responsables`;

  async getAll(): Promise<Responsable[]> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener responsables:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Responsable> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error al obtener responsable ${id}:`, error);
      throw error;
    }
  }

  async create(responsable: CreateResponsableDto): Promise<Responsable> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responsable),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al crear responsable:', error);
      throw error;
    }
  }

  async update(id: number, responsable: UpdateResponsableDto): Promise<Responsable> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responsable),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error al actualizar responsable ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error al eliminar responsable ${id}:`, error);
      throw error;
    }
  }

  async getActiveResponsables(): Promise<Responsable[]> {
    try {
      const responsables = await this.getAll();
      return responsables.filter(r => r.activo);
    } catch (error) {
      console.error('Error al obtener responsables activos:', error);
      throw error;
    }
  }
}

export const responsableService = new ResponsableService();
export default responsableService;