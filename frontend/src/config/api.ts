// Configuración de la API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Configuración de headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Configuración de timeouts
export const API_TIMEOUT = 10000; // 10 segundos