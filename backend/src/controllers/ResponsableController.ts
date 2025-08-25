import { Request, Response } from 'express';
import { ResponsableService } from '../services/ResponsableService';
import { CreateResponsableDto, UpdateResponsableDto } from '../models/Responsable';

export class ResponsableController {
  private responsableService: ResponsableService;

  constructor() {
    this.responsableService = new ResponsableService();
  }

  async getAllResponsables(req: Request, res: Response): Promise<void> {
    try {
      const responsables = await this.responsableService.getAllResponsables();
      res.json(responsables);
    } catch (error) {
      console.error('Error in getAllResponsables:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getResponsablesActivos(req: Request, res: Response): Promise<void> {
    try {
      const responsables = await this.responsableService.getResponsablesActivos();
      res.json(responsables);
    } catch (error) {
      console.error('Error in getResponsablesActivos:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getResponsableById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de responsable inválido' });
        return;
      }

      const responsable = await this.responsableService.getResponsableById(id);
      res.json(responsable);
    } catch (error) {
      console.error('Error in getResponsableById:', error);
      
      if (error instanceof Error && error.message === 'Responsable no encontrado') {
        res.status(404).json({ error: 'Responsable no encontrado' });
      } else {
        res.status(500).json({ 
          error: 'Error interno del servidor',
          message: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
  }

  async createResponsable(req: Request, res: Response): Promise<void> {
    try {
      const responsableData: CreateResponsableDto = req.body;
      
      const newResponsable = await this.responsableService.createResponsable(responsableData);
      res.status(201).json(newResponsable);
    } catch (error) {
      console.error('Error in createResponsable:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('ya existe') || 
            error.message.includes('requerido') || 
            error.message.includes('válido')) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ 
            error: 'Error interno del servidor',
            message: error.message
          });
        }
      } else {
        res.status(500).json({ error: 'Error desconocido' });
      }
    }
  }

  async updateResponsable(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de responsable inválido' });
        return;
      }

      const updates: UpdateResponsableDto = req.body;
      
      const updatedResponsable = await this.responsableService.updateResponsable(id, updates);
      res.json(updatedResponsable);
    } catch (error) {
      console.error('Error in updateResponsable:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Responsable no encontrado') {
          res.status(404).json({ error: 'Responsable no encontrado' });
        } else if (error.message.includes('no puede estar vacío') || 
                   error.message.includes('válido')) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ 
            error: 'Error interno del servidor',
            message: error.message
          });
        }
      } else {
        res.status(500).json({ error: 'Error desconocido' });
      }
    }
  }

  async deleteResponsable(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de responsable inválido' });
        return;
      }

      await this.responsableService.deleteResponsable(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteResponsable:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Responsable no encontrado') {
          res.status(404).json({ error: 'Responsable no encontrado' });
        } else if (error.message.includes('tareas asignadas')) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ 
            error: 'Error interno del servidor',
            message: error.message
          });
        }
      } else {
        res.status(500).json({ error: 'Error desconocido' });
      }
    }
  }

  async toggleResponsableStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de responsable inválido' });
        return;
      }

      const updatedResponsable = await this.responsableService.toggleResponsableStatus(id);
      res.json(updatedResponsable);
    } catch (error) {
      console.error('Error in toggleResponsableStatus:', error);
      
      if (error instanceof Error && error.message === 'Responsable no encontrado') {
        res.status(404).json({ error: 'Responsable no encontrado' });
      } else {
        res.status(500).json({ 
          error: 'Error interno del servidor',
          message: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
  }
}