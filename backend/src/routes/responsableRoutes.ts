import { Router } from 'express';
import { ResponsableController } from '../controllers/ResponsableController';

const router = Router();
const responsableController = new ResponsableController();

// GET /api/responsables - Obtener todos los responsables
router.get('/', (req, res) => responsableController.getAllResponsables(req, res));

// GET /api/responsables/activos - Obtener solo responsables activos
router.get('/activos', (req, res) => responsableController.getResponsablesActivos(req, res));

// GET /api/responsables/:id - Obtener responsable por ID
router.get('/:id', (req, res) => responsableController.getResponsableById(req, res));

// POST /api/responsables - Crear nuevo responsable
router.post('/', (req, res) => responsableController.createResponsable(req, res));

// PUT /api/responsables/:id - Actualizar responsable
router.put('/:id', (req, res) => responsableController.updateResponsable(req, res));

// DELETE /api/responsables/:id - Eliminar responsable
router.delete('/:id', (req, res) => responsableController.deleteResponsable(req, res));

// PATCH /api/responsables/:id/toggle - Cambiar estado activo/inactivo
router.patch('/:id/toggle', (req, res) => responsableController.toggleResponsableStatus(req, res));

export default router;