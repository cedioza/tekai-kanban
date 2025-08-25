import { Router } from 'express';
import { TareaController } from '../controllers/TareaController';

const router = Router();
const tareaController = new TareaController();

// Rutas principales
router.post('/', tareaController.createTarea);
router.get('/', tareaController.getAllTareas);
router.get('/:id', tareaController.getTareaById);
router.put('/:id', tareaController.updateTarea);
router.delete('/:id', tareaController.deleteTarea);

// Rutas para comentarios
router.post('/:id/comentarios', tareaController.createComentario);
router.delete('/comentarios/:id', tareaController.deleteComentario);

// Rutas adicionales para consultas específicas
router.get('/estado/:estado', tareaController.getTareasByEstado);
router.get('/responsable/:responsable', tareaController.getTareasByResponsable);
router.get('/estadisticas', tareaController.getEstadisticas);

export default router;