import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

// Debug: Verificar variables de entorno
console.log('🔍 Variables de entorno cargadas:');
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
console.log('POSTGRES_DB:', process.env.POSTGRES_DB);
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD ? '***' : 'undefined');

import express from 'express';
import cors from 'cors';
import tareaRoutes from './routes/tareaRoutes';
import responsableRoutes from './routes/responsableRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  // Log detallado para requests PUT
  if (req.method === 'PUT') {
    console.log('🔍 PUT Request Details:');
    console.log('  - URL:', req.url);
    console.log('  - Headers:', JSON.stringify(req.headers, null, 2));
    console.log('  - Body:', JSON.stringify(req.body, null, 2));
  }
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Kanban API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/tareas', tareaRoutes);
app.use('/api/responsables', responsableRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check disponible en http://localhost:${PORT}/health`);
  console.log(`📋 API endpoints disponibles en http://localhost:${PORT}/api`);
});

export default app;